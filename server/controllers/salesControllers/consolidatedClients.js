const CoworkingClient = require("../../models/sales/CoworkingClient");
const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const Visitor = require("../../models/visitor/Visitor");

const getConsolidatedClients = async (req, res, next) => {
  try {
    const coworkingClients = await CoworkingClient.find()
      .populate([
        {
          path: "unit",
          select: "_id unitName unitNo cabinDesks openDesks",
          populate: {
            path: "building",
            select: "_id buildingName fullAddress",
          },
        },
        { path: "service", select: "_id serviceName description" },
      ])
      .lean()
      .exec();

    const virtualOfficeClients = await VirtualOfficeClient.find().lean().exec();
    const meetingClients = await Visitor.find({ visitorFlag: "Client" })
      .lean()
      .exec();

    const responseObject = {
      coworkingClients,
      virtualOfficeClients,
      meetingClients,
    };
    return res.status(200).json(responseObject);
  } catch (error) {
    next(error);
  }
};

module.exports = { getConsolidatedClients };
