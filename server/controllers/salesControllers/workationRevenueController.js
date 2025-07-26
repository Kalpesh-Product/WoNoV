const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const WorkationClients = require("../../models/sales/WorkationClients");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const createWorkationRevenue = async (req, res, next) => {
  try {
    const { nameOfClient, particulars, taxableAmount, gst, totalAmount } =
      req.body;

    const company = req.company;

    const newRevenue = new WorkationRevenue({
      company,
      nameOfClient,
      particulars,
      taxableAmount,
      gst,
      totalAmount,
    });

    await newRevenue.save();
    res
      .status(201)
      .json({ message: "Workation revenue created", data: newRevenue });
  } catch (error) {
    next(error);
  }
};

// Read all Workation Revenue entries (optionally filtered by company)
const getWorkationRevenues = async (req, res, next) => {
  try {
    const company = req.company;

    const revenues = await WorkationRevenue.find({ company }).lean().exec();

    res.status(200).json(revenues);
  } catch (error) {
    next(error);
  }
};

const bulkInsertWorkationRevenue = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const workationClients = await WorkationClients.find().lean().exec();
    const workationClientsMap = new Map(
      workationClients.map((client) => [
        client.clientName.trim().toLowerCase(),
        client._id,
      ])
    );

    const results = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const nameOfClient = row["Name Of Client"]?.trim();
        const workationClientId = workationClientsMap.get(
          nameOfClient?.toLowerCase()
        );

        if (!workationClientId) return;

        const revenueEntry = {
          company: req.company,
          workationClient: workationClientId,
          nameOfClient: nameOfClient,
          status: row["Status"]?.trim() || "",
          particulars: row["Particulars"]?.trim(),
          taxableAmount: parseFloat(row["Taxable Amount"]) || 0,
          gst: parseFloat(row["GST"]) || 0,
          totalAmount: parseFloat(row["Total Amount"]) || 0,
          date: new Date(row["Paid Date"]),
        };

        results.push(revenueEntry);
      })
      .on("end", async () => {
        if (!results.length) {
          return res.status(400).json({ message: "No valid rows to insert" });
        }

        await WorkationRevenue.insertMany(results);
        res
          .status(200)
          .json({ message: `${results.length} records inserted successfully` });
      })
      .on("error", (err) => {
        console.error("CSV parsing error:", err);
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkationRevenues,
  createWorkationRevenue,
  bulkInsertWorkationRevenue,
};
