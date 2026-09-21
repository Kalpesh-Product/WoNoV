const WorkationClient = require("../../models/sales/WorkationClients");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const csvParser = require("csv-parser");
const { Readable } = require("stream");

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
        _id: client._id,
        clientName: client.clientName,
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
      });
    });

    return res.status(200).json(mergedClients);
  } catch (error) {
    next(error);
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

module.exports = { bulkInsertWorkationClients, getWorkationClients };
