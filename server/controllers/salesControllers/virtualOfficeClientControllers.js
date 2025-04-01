const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const bulkInsertVirtualOfficeClients = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Bulk Insert Virtual Office Clients";
  const logSourceKey = "virtualOfficeClient";
  const { company: companyId, user, ip } = req;

  try {
    if (!req.file) {
      throw new Error("No file found");
    }

    const newClients = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString("utf-8").trim());
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          try {
            const clientObj = {
              clientName: row["Client Name"],
              unit: row["Unit"] || null,
              totalTerm: row["Total Term"],
              termEnd: row["Term End"],
              rentDate: new Date(row["Rent Date"]),
              rentStatus: row["Rent Status"],
              pastDueDate: row["Past Due Date"]
                ? new Date(row["Past Due Date"])
                : null,
              nextIncrementDate: row["Next Increment Date"]
                ? new Date(row["Next Increment Date"])
                : null,
              company: companyId,
            };

            newClients.push(clientObj);
          } catch (error) {
            reject(
              new CustomError(error.message, logPath, logAction, logSourceKey)
            );
          }
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(
            new CustomError(error.message, logPath, logAction, logSourceKey)
          );
        });
    });

    if (newClients.length === 0) {
      throw new Error("No valid data found in CSV");
    }

    await VirtualOfficeClient.insertMany(newClients);

    return res.status(201).json({
      message: "Bulk data inserted successfully",
      insertedCount: newClients.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { bulkInsertVirtualOfficeClients };
