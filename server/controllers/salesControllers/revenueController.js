const Revenue = require("../../models/sales/CoworkingRevenue");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const Service = require("../../models/sales/ClientService");
const addRevenue = async (req, res, next) => {
  try {
    const { serviceId, clientId, projectedRevenue, month } = req.body;
    const { company } = req;

    if (!serviceId || !clientId || !projectedRevenue || !month) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate client and service existence
    const clientExists = await CoworkingClient.findById(clientId);
    const serviceExists = await Service.findById(serviceId);

    if (!clientExists) {
      return res.status(404).json({ message: "CoworkingClient not found." });
    }
    if (!serviceExists) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Create new revenue entry
    const revenue = new Revenue({
      projectedRevenue,
      month: new Date(month),
      client: clientId,
      service: serviceId,
      company: company._id,
    });

    await revenue.save();

    res.status(201).json({ message: "Revenue added successfully", revenue });
  } catch (error) {
    next(error);
  }
};

const getRevenues = async (req, res, next) => {
  try {
    const company = req.company;
    const { serviceId } = req.query;

    let revenues;
    if (serviceId) {
      revenues = await Revenue.find({ company, service: serviceId })
        .select([
          { path: "client", select: "clientName" },
          { path: "service", select: "serviceName" },
        ])
        .lean()
        .exec();

      return res.status(200).json(revenues);
    }

    revenues = await Revenue.find({ company })
      .select([
        { path: "client", select: "clientName" },
        { path: "service", select: "serviceName" },
      ])
      .lean()
      .exec();

    res.status(200).json(revenues);
  } catch (error) {
    next(error);
  }
};

module.exports = { addRevenue, getRevenues };
