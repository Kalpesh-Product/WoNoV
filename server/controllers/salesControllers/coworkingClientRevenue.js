const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const Service = require("../../models/sales/ClientService");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

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

    const revenues = await CoworkingRevenue.find(filter)
      .lean()
      .exec();

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

module.exports = { addRevenue, getRevenues };
