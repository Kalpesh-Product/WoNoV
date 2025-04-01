const ClientService = require("../../models/sales/ClientService");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const createClientService = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Add service";
  const logSourceKey = "service";
  try {
    const { user, ip, company } = req;
    const { serviceName, description } = req.body;

    if (!serviceName) {
      throw new CustomError(
        "Missing required field",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      typeof description !== "string" ||
      !description.length ||
      description.replace(/\s/g, "").length > 100
    ) {
      throw new CustomError(
        "Description should be less than 100 characters",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const service = await ClientService({
      serviceName,
      description,
      company,
    });

    const savedClientService = await service.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "ClientService added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedClientService._id,
      changes: {
        serviceName,
        description,
      },
    });

    res.status(201).json({ message: "Client Service added successfully" });
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

const getClientServices = async (req, res, next) => {
  try {
    const { company } = req;
    const services = await ClientService.find({ company });
    if (!services.length) {
      return res.status(404).json({ message: "No Services found" });
    }
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

module.exports = { createClientService, getClientServices };
