const AmcReports = require("../../models/Amc");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

const bulkInsertAmcReports = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const results = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // Basic cleaning and mapping
        const amcEntry = {
          contactPersonName: row["Contact Person Name"]?.trim(),
          companyName: row["Company Name"]?.trim(),
          contactNumber: row["Contact Number"]?.trim(),
          email: row["Email"]?.trim(),
          amcStartDate: new Date(row["AMC Start Date"]),
          amcEndDate: new Date(row["AMC End Date"]),
          productOrServiceName: row["Product / Service Name"]?.trim(),
          productSerialNumberOrId: row["Product Serial Number/ID"]?.trim(),
          amcCost: parseFloat(row["AMC Cost"]),
          paymentStatus: row["Payment Status (Paid/Unpaid)"]?.trim(),
          lastServiceDate: row["Last Service Date"]
            ? new Date(row["Last Service Date"])
            : null,
          nextServiceDueDate: row["Next Service Due Date"]
            ? new Date(row["Next Service Due Date"])
            : null,
          amcStatus: row["AMC Status"]?.trim(),
          remarks: row["Remarks"]?.trim(),
          department: departmentId,
        };

        if (!amcEntry.contactPersonName) {
          return;
        } else {
          results.push(amcEntry);
        }
      })
      .on("end", async () => {
        try {
          await AmcReports.insertMany(results);
          res.status(201).json({
            message: "AMC reports uploaded successfully",
            count: results.length,
          });
        } catch (insertErr) {
          next(insertErr);
        }
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = { bulkInsertAmcReports };
