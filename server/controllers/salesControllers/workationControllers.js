const WorkationClient = require("../../models/sales/WorkationClients");
const csvParser = require("csv-parser");
const { Readable } = require("stream");

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

module.exports = { bulkInsertWorkationClients };
