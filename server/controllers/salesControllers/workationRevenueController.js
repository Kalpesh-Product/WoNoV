//const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const WorkationClients = require("../../models/sales/WorkationClients");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const {
  fetchWorkationRevenueReportService,
} = require("../../services/reports/revenue");
const createWorkationRevenue = async (req, res, next) => {
  try {
    const {
      nameOfClient,
      particulars,
      taxableAmount,
      gst,
      totalAmount,
      clientId,
    } = req.body;

    const company = req.company;

    const newRevenue = new WorkationRevenue({
      company,
      nameOfClient,
      particulars,
      taxableAmount,
      gst,
      totalAmount,
      client: clientId,
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
    const payload = await fetchWorkationRevenueReportService({ company });

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const normalizeCsvHeader = (header = "") =>
  header
    .replace(/^\uFEFF/, "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const normalizeClientName = (name = "") =>
  name.toString().trim().replace(/\s+/g, " ").toLowerCase();

const getCsvValue = (row, aliases) => {
  const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeCsvHeader(key)] = value;
    return acc;
  }, {});

  for (const alias of aliases) {
    const value = normalizedRow[normalizeCsvHeader(alias)];
    if (
      value !== undefined &&
      value !== null &&
      value.toString().trim() !== ""
    ) {
      return value.toString().trim();
    }
  }

  return "";
};

const parseAmount = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const sanitizedValue = value.toString().replace(/,/g, "").trim();
  const parsedValue = parseFloat(sanitizedValue);
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

const parseCsvDate = (value) => {
  if (!value) return null;

  const trimmedValue = value.toString().trim();
  const parsedDate = new Date(trimmedValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
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
        normalizeClientName(client.clientName),
        client._id,
      ]),
    );

    const rows = [];
    const skippedRows = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // const nameOfClient = row["Name Of Client"]?.trim();
        // const workationClientId = workationClientsMap.get(
        //   nameOfClient?.toLowerCase(),
        const nameOfClient = getCsvValue(row, [
          "Name Of Client",
          "NAME OF CLIENT",
          "Client Name",
          "Client",
        ]);
        const particulars = getCsvValue(row, ["Particulars", "PARTCULARS"]);
        const paidDate = parseCsvDate(
          getCsvValue(row, ["Paid Date", "PAYMENT DATE", "Date"]),
        );

        // if (!workationClientId) return;

        // const parseAmount = (value) =>
        //   parseFloat(value?.replace(/,/g, "")) || 0;
        // const revenueEntry = {
        //   company: req.company,
        //   client: workationClientId,
        //   nameOfClient: nameOfClient,
        //   status: row["Status"]?.trim() || "",
        //   particulars: row["Particulars"]?.trim(),
        //   taxableAmount: parseAmount(row["Taxable Amount"]),
        //   gst: parseAmount(row["GST"]),
        //   totalAmount: parseAmount(row["Total Amount"]),
        //   date: new Date(row["Paid Date"]),
        // };

        // results.push(revenueEntry);
         if (!nameOfClient || !particulars || !paidDate) {
          skippedRows.push({ nameOfClient, reason: "Missing required fields" });
          return;
        }

        rows.push({
          nameOfClient,
          normalizedName: normalizeClientName(nameOfClient),
          status: getCsvValue(row, ["Status"]),
          particulars,
          taxableAmount: parseAmount(
            getCsvValue(row, ["Taxable Amount", "Taxable"]),
          ),
          gst: parseAmount(getCsvValue(row, ["GST"])),
          totalAmount: parseAmount(
            getCsvValue(row, ["Total Amount", "Revenue", "Amount"]),
          ),
          date: paidDate,
        });
      })
      .on("end", async () => {
        try {
          if (!rows.length) {
            return res.status(400).json({
              message:
                "No valid rows to insert. Please check client name, particulars, and paid date columns.",
              skippedRows,
            });
          }

     const newClients = [];
          const seenNewClients = new Set();

          rows.forEach((row) => {
            if (
              !workationClientsMap.has(row.normalizedName) &&
              !seenNewClients.has(row.normalizedName)
            ) {
              seenNewClients.add(row.normalizedName);
              newClients.push({
                clientName: row.nameOfClient,
                startDate: row.date,
              });
            }
          });

          if (newClients.length) {
            const createdClients = await WorkationClients.insertMany(newClients);
            createdClients.forEach((client) => {
              workationClientsMap.set(
                normalizeClientName(client.clientName),
                client._id,
              );
            });
          }

          const results = rows.map(({ normalizedName, ...row }) => ({
            company: req.company,
            client: workationClientsMap.get(normalizedName),
            ...row,
          }));

          await WorkationRevenue.insertMany(results);
          res.status(200).json({
            message: `${results.length} records inserted successfully`,
            insertedCount: results.length,
            createdClients: newClients.length,
            skippedRows: skippedRows.length,
          });
        } catch (error) {
          next(error);
        }
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
