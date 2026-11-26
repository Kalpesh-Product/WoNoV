const WorkationClient = require("../../models/sales/WorkationClients");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const csvParser = require("csv-parser");
const { Readable } = require("stream");

const escapeRegExp = (value = "") =>
  value.toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getWorkationClients = async (req, res, next) => {
  try {
    const [clients, revenueRows] = await Promise.all([
      WorkationClient.find().sort({ clientName: 1 }).lean().exec(),
      WorkationRevenue.find(
        req.company ? { company: req.company } : {},
        { nameOfClient: 1 },
      )
        .lean()
        .exec(),
    ]);

    const mergedClients = [];
    const seenNames = new Set();

    clients.forEach((client) => {
      const normalizedName = client.clientName?.toString().trim().toLowerCase();
      if (!normalizedName || seenNames.has(normalizedName)) return;

      seenNames.add(normalizedName);
      mergedClients.push({
        ...client,
        isActive: client.isActive !== false,
      });
    });

    revenueRows.forEach((row) => {
      const clientName = row.nameOfClient?.toString().trim();
      const normalizedName = clientName?.toLowerCase();
      if (!normalizedName || seenNames.has(normalizedName)) return;

      seenNames.add(normalizedName);
      mergedClients.push({
        _id: null,
        clientName,
        particulars: "",
        startDate: null,
        isActive: true,
      });
    });

    return res.status(200).json(mergedClients);
  } catch (error) {
    next(error);
  }
};

const createWorkationClient = async (req, res, next) => {
  try {
    const clientName = req.body?.clientName?.toString().trim();
    if (!clientName) {
      return res.status(400).json({ message: "Client name is required" });
    }

    const existingClient = await WorkationClient.findOne({
      clientName: { $regex: new RegExp(`^${escapeRegExp(clientName)}$`, "i") },
    }).lean();

    if (existingClient) {
      return res.status(409).json({ message: "Workation client already exists" });
    }

    const client = await WorkationClient.create({
      clientName,
      particulars: req.body?.particulars?.toString().trim() || "",
      startDate: req.body?.startDate || null,
      isActive: req.body?.isActive !== false,
    });

    return res.status(201).json({
      message: "Workation client added successfully",
      data: client,
    });
  } catch (error) {
    return next(error);
  }
};

const updateWorkationClient = async (req, res, next) => {
  try {
    const clientName = req.body?.clientName?.toString().trim();
    if (!clientName) {
      return res.status(400).json({ message: "Client name is required" });
    }

    const duplicateClient = await WorkationClient.findOne({
      _id: { $ne: req.params.id },
      clientName: { $regex: new RegExp(`^${escapeRegExp(clientName)}$`, "i") },
    }).lean();

    if (duplicateClient) {
      return res.status(409).json({ message: "Workation client already exists" });
    }

    const client = await WorkationClient.findByIdAndUpdate(
      req.params.id,
      {
        clientName,
        particulars: req.body?.particulars?.toString().trim() || "",
        startDate: req.body?.startDate || null,
        isActive: req.body?.isActive !== false,
      },
      { new: true, runValidators: true },
    );

    if (!client) {
      return res.status(404).json({ message: "Workation client not found" });
    }

    return res.status(200).json({
      message: "Workation client updated successfully",
      data: client,
    });
  } catch (error) {
    return next(error);
  }
};

const updateWorkationClientStatus = async (req, res, next) => {
  try {
    const client = await WorkationClient.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(req.body?.isActive) },
      { new: true, runValidators: true },
    );

    if (!client) {
      return res.status(404).json({ message: "Workation client not found" });
    }

    return res.status(200).json({
      message: `Workation client marked as ${client.isActive ? "active" : "inactive"}`,
      data: client,
    });
  } catch (error) {
    return next(error);
  }
};

const bulkInsertWorkationClients = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid csv file" });
    }

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    stream.pipe(csvParser()).on("data", (row) => {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bulkInsertWorkationClients,
  getWorkationClients,
  createWorkationClient,
  updateWorkationClient,
  updateWorkationClientStatus,
};
