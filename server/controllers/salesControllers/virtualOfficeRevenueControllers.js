const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const csvParser = require("csv-parser");
const { Readable } = require("stream");

const createVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const {
      client,
      location,
      channel,
      taxableAmount,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
      service,
    } = req.body;

    const company = req.company;

    const newRevenue = new VirtualOfficeRevenue({
      client,
      location,
      channel,
      taxableAmount,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
      company,
      service,
    });

    await newRevenue.save();

    res.status(201).json({
      message: "Virtual office revenue created",
      data: newRevenue,
    });
  } catch (error) {
    next(error);
  }
};

const getVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const { company } = req;

    const revenues = await VirtualOfficeRevenue.find({ company })
      .populate([{ path: "client", select: "clientName" }])
      .lean()
      .exec();

    res.status(200).json(revenues);
  } catch (error) {
    next(error);
  }
};

const bulkInsertVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const revenues = [];

    const virtualOfficeClients = await VirtualOfficeClient.find({
      company,
    }).lean();
    const clientMap = new Map(
      virtualOfficeClients.map((client) => [
        client.clientName.trim(),
        client._id,
      ])
    );

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          "Client Name": clientName,
          Location: location,
          Channel: channel,
          "Taxable Amount": taxableAmount,
          Revenue: revenue,
          "Total Term": totalTerm,
          "Due Term": dueTerm,
          "Rent Date": rentDate,
          "Rent Status": rentStatus,
          "Past Due Date": pastDueDate,
          "Annual Increment": annualIncrement,
          "Next Increment Date": nextIncrementDate,
        } = row;

        const clientId = clientMap.get(clientName?.trim());
        if (!clientId) {
          stream.destroy();
          return res.status(400).json({ message: `${clientName} not found` });
        }

        const revenueEntry = {
          client: clientId,
          location: location?.trim(),
          channel: channel?.trim(),
          taxableAmount: parseFloat(taxableAmount) || 0,
          revenue: parseFloat(revenue) || 0,
          totalTerm: parseInt(totalTerm) || 0,
          dueTerm: parseInt(dueTerm) || 0,
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

          await VirtualOfficeRevenue.insertMany(revenues);

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

module.exports = {
  getVirtualOfficeRevenue,
  createVirtualOfficeRevenue,
  bulkInsertVirtualOfficeRevenue,
};
