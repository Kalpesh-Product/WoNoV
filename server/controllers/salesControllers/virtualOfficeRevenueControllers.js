const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const { parseAmount } = require("../../utils/parseAmount");
const {
  fetchVirtualOfficeRevenueReportService,
} = require("../../services/reports/revenue");

const normalizeHeader = (value = "") =>
  String(value)
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const normalizeClientName = (value = "") =>
  String(value).trim().replace(/\s+/g, " ").toLowerCase();

const isBlankRow = (row = {}) =>
  Object.values(row).every((value) => String(value || "").trim() === "");

const getRowValue = (row, aliases = []) => {
  const normalizedAliases = new Set(aliases.map(normalizeHeader));

  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.has(normalizeHeader(key))) {
      return typeof value === "string" ? value.trim() : value;
    }
  }

  return undefined;
};
const parseValidDate = (value) => {
  if (!value || String(value).trim() === "") return null;

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const createVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const {
      client,
      location,
      channel,
      taxableAmount,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
      service,
    } = req.body;

    const company = req.company;

    const newRevenue = new VirtualOfficeRevenue({
      client,
      location,
      channel,
      taxableAmount,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
      company,
      service,
    });

    await newRevenue.save();

    res.status(201).json({
      message: "Virtual office revenue created",
      data: newRevenue,
    });
  } catch (error) {
    next(error);
  }
};

const getVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const { company } = req;
    const payload = await fetchVirtualOfficeRevenueReportService({ company });

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const bulkInsertVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const revenues = [];
    const missingClients = [];

    const virtualOfficeClients = await VirtualOfficeClient.find({
      company,
    }).lean();

    // const clientMap = new Map(
    //   virtualOfficeClients.map((client) => [
    //     client.clientName.trim().toLowerCase(),
    //     client._id,
    //   ]),
    // );
    const clientMap = new Map();

    virtualOfficeClients.forEach((client) => {
      const clientId = client._id?.toString();

      if (client.clientName) {
        clientMap.set(normalizeClientName(client.clientName), client._id);
      }

      if (clientId) {
        clientMap.set(clientId, client._id);
      }
    });

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // const {
        //   "Client Name": clientName,
        //   Location: location,
        //   Channel: channel,
        //   "Taxable Amount": taxableAmount,
        //   Revenue: revenue,
        //   "Total Term": totalTerm,
        //   "Due Term": dueTerm,
        //   "Rent Date": rentDate,
        //   "Rent Status": rentStatus,
        //   "Past Due Date": pastDueDate,
        //   "Annual Increment": annualIncrement,
        //   "Next Increment Date": nextIncrementDate,
        // } = row;

        // const normalizedName = clientName?.trim().toLowerCase();
        // const clientId = clientMap.get(normalizedName);
        if (isBlankRow(row)) {
          return;
        }

        const clientName = getRowValue(row, [
          "Client Name",
          "Client",
          "Client ID",
          "clientName",
          "client.clientName",
          "client._id",
          "clientId",
        ]);
        const location = getRowValue(row, ["Location"]);
        const channel = getRowValue(row, ["Channel"]);
        const taxableAmount = getRowValue(row, [
          "Taxable Amount",
          "Taxable",
          "Taxable Amount (INR)",
        ]);
        const revenue = getRowValue(row, ["Revenue", "Revenue (INR)"]);
        const totalTerm = getRowValue(row, ["Total Term"]);
        const dueTerm = getRowValue(row, ["Due Term"]);
        const rentDate = getRowValue(row, ["Rent Date"]);
        const rentStatus = getRowValue(row, ["Rent Status", "Status"]);
        const pastDueDate = getRowValue(row, ["Past Due Date"]);
        const annualIncrement = getRowValue(row, ["Annual Increment"]);
        const nextIncrementDate = getRowValue(row, ["Next Increment Date"]);

        const normalizedName = normalizeClientName(clientName);
        const clientId = normalizedName
          ? clientMap.get(clientName) || clientMap.get(normalizedName)
          : null;

        if (!clientId) {
          // missingClients.push(clientName);
          // return; // skip row, don’t break stream
          if (clientName) {
            missingClients.push(clientName);
          }
          return;
        }

        revenues.push({
          client: clientId,
          company,
          location: location?.trim(),
          channel: channel?.trim(),
          taxableAmount: parseAmount(taxableAmount) || 0,
          revenue: parseAmount(revenue) || 0,
          totalTerm: parseInt(totalTerm) || 0,
          dueTerm: parseValidDate(dueTerm),
          rentDate: parseValidDate(rentDate),
          // rentStatus: rentStatus?.trim(),
          rentStatus: "Paid",
          pastDueDate: parseValidDate(pastDueDate),
          annualIncrement: isNaN(parseFloat(annualIncrement))
            ? null
            : parseFloat(annualIncrement),
          nextIncrementDate: parseValidDate(nextIncrementDate),
        });
      })
      .on("end", async () => {
        try {
          if (missingClients.length > 0) {
            return res.status(400).json({
              message: "Some clients not found",
              missingClients,
            });
          }

          if (revenues.length === 0) {
            return res
              .status(400)
              .json({ message: "No valid revenue records found" });
          }

          await VirtualOfficeRevenue.insertMany(revenues);

          return res.status(201).json({
            message: `${revenues.length} revenue records inserted successfully`,
          });
        } catch (err) {
          next(err);
        }
      })
      .on("error", (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVirtualOfficeRevenue,
  createVirtualOfficeRevenue,
  bulkInsertVirtualOfficeRevenue,
};
