const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const Service = require("../../models/sales/ClientService");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

const addRevenue = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Add CoworkingRevenue";
  const logSourceKey = "revenue";
  const { company, user, ip } = req;

  try {
    const {
      serviceId,
      clientId,
      projectedRevenue,
      month,

      // New fields
      clientName,
      channel,
      noOfDesks,
      deskRate,
      occupation,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
    } = req.body;

    if (!serviceId || !clientId || !projectedRevenue || !month) {
      throw new CustomError(
        "All fields are required.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate client and service existence
    const clientExists = await CoworkingClient.findById(clientId);
    const serviceExists = await Service.findById(serviceId);

    if (!clientExists) {
      throw new CustomError(
        "CoworkingClient not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!serviceExists) {
      throw new CustomError(
        "Service not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create new revenue entry
    const revenueDoc = new CoworkingRevenue({
      projectedRevenue,
      month: new Date(month),
      client: clientId,
      service: serviceId,
      company: company._id,

      // Save new fields
      clientName,
      channel,
      noOfDesks,
      deskRate,
      occupation,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
    });

    const savedRevenue = await revenueDoc.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "CoworkingRevenue added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedRevenue._id,
      changes: {
        revenue: savedRevenue,
      },
    });

    res.status(201).json({
      message: "CoworkingRevenue added successfully",
      revenue: savedRevenue,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const getRevenues = async (req, res, next) => {
  try {
    const company = req.company;
    const { serviceId } = req.query;

    const filter = { company };
    if (serviceId) {
      filter.service = serviceId;
    }

    const revenues = await CoworkingRevenue.find(filter).lean().exec();

    const MONTHS_SHORT = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyMap = new Map();

    revenues.forEach((item) => {
      const referenceDate = item.rentDate || item.createdAt;
      const dateObj = new Date(referenceDate);
      const month = MONTHS_SHORT[dateObj.getMonth()];
      const year = dateObj.getFullYear().toString().slice(-2);
      const monthKey = `${month}-${year}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          totalRevenue: 0,
          clients: [],
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.totalRevenue += item.revenue || 0;

      monthData.clients.push({
        clientName: item.clientName || item.client?.clientName,
        channel: item.channel,
        noOfDesks: item.noOfDesks,
        deskRate: item.deskRate,
        occupation: item.occupation,
        revenue: item.revenue,
        totalTerm: item.totalTerm,
        dueTerm: item.dueTerm,
        rentDate: item.rentDate,
        rentStatus: item.rentStatus,
        pastDueDate: item.pastDueDate,
        annualIncrement: item.annualIncrement,
        nextIncrementDate: item.nextIncrementDate,
        serviceName: item.service?.serviceName,
      });
    });

    const transformedData = Array.from(monthlyMap.values());

    res.status(200).json(transformedData);
  } catch (error) {
    next(error);
  }
};

const bulkInsertCoworkingClientRevenues = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const revenues = [];

    const coworkingClients = await CoworkingClient.find({ company }).lean();
    const clientMap = new Map(
      coworkingClients.map((client) => [client.clientName.trim(), client._id])
    );

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          "Client Name": clientName,
          "Invoice Name": clientInvoiceName,
          Channel: channel,
          Revenue: revenue,
          "Rent Date": rentDate,
          "Rent Status": rentStatus,
          "No. Of Desks": noOfDesks,
          "Desk Rate": deskRate,
          "Total Term": totalTerm,
          "Past Due Date": pastDueDate,
          "Annual Increment Date": annualIncrement,
          "Next Increment Date": nextIncrementDate,
        } = row;

        const clientId = clientMap.get(clientName?.trim());

        if (!clientId) {
          console.warn(`Skipping row: Client "${clientName}" not found`);
          return;
        }

        const parsedRevenue = parseFloat(revenue) || 0;
        const parsedDesks = parseInt(noOfDesks) || 0;
        const parsedRate = parseFloat(deskRate) || 0;
        const parsedTotalTerm = parseInt(totalTerm) || 0;

        const revenueEntry = {
          clients: clientId,
          clientName: clientInvoiceName,
          channel: channel?.trim(),
          noOfDesks: parsedDesks,
          deskRate: parsedRate,
          revenue: parsedRevenue,
          totalTerm: parsedTotalTerm,
          dueTerm: 0, // Optional: You can derive logic here if needed
          rentDate: rentDate ? new Date(rentDate) : null,
          rentStatus: rentStatus?.trim(),
          pastDueDate: pastDueDate ? new Date(pastDueDate) : null,
          annualIncrement: isNaN(parseFloat(annualIncrement))
            ? null
            : parseFloat(annualIncrement),
          nextIncrementDate: nextIncrementDate
            ? new Date(nextIncrementDate)
            : null,
          company,
        };

        revenues.push(revenueEntry);
      })
      .on("end", async () => {
        try {
          if (revenues.length === 0) {
            return res
              .status(400)
              .json({ message: "No valid revenue records found" });
          }

          await CoworkingRevenue.insertMany(revenues);

          res.status(201).json({
            message: `${revenues.length} revenue records inserted successfully`,
          });
        } catch (err) {
          next(err);
        }
      })
      .on("error", (error) => {
        console.error("CSV parse error:", error);
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = { addRevenue, getRevenues, bulkInsertCoworkingClientRevenues };
