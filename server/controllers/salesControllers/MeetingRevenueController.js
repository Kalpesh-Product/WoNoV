const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const { parseAmount } = require("../../utils/parseAmount");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const {
  fetchMeetingRevenueReportService,
} = require("../../services/reports/revenue");

const createMeetingRevenue = async (req, res, next) => {
  try {
    const {
      date,
      client,
      particulars,
      unitsOrHours,
      costPerPass,
      taxable,
      gst,
      totalAmount,
      paymentDate,
      remarks,
    } = req.body;
    const company = req.company;
    const newRevenue = new MeetingRevenue({
      date,
      company,
      client,
      particulars,
      unitsOrHours,
      costPerPass,
      taxable,
      gst,
      totalAmount,
      paymentDate,
      remarks,
    });

    const savedRevenue = await newRevenue.save();
    res.status(201).json(savedRevenue);
  } catch (error) {
    next(error);
  }
};

const updateMeetingRevenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = req.company;

    const updatedRevenue = await MeetingRevenue.findOneAndUpdate(
      { _id: id, company },
      { ...req.body },
      { new: true, runValidators: true },
    );

    if (!updatedRevenue) {
      return res.status(404).json({ message: "Meeting revenue not found" });
    }

    res.status(200).json(updatedRevenue);
  } catch (error) {
    next(error);
  }
};

const getMeetingRevenue = async (req, res, next) => {
  try {
    const { id } = req.query || {};

    if (id) {
      const revenue = await MeetingRevenue.findOne({ _id: id, company });
      if (!revenue) {
        return res
          .status(404)
          .json({ message: "Meeting revenue with the provided ID not found" });
      }

      return res.status(200).json(revenue);
    }

    const payload = await fetchMeetingRevenueReportService({});
    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const bulkInsertMeetingRevenue = async (req, res) => {
  const { company: companyId } = req;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file found" });
    }

    const revenues = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

      stream
        .pipe(csvParser())
        .on("data", (row) => {
          try {
            const revenueObj = {
              company: companyId,
              date: row["DATE"] ? new Date(row["DATE"]) : null,
              client: row["NAME OF CLIENT"]?.trim(),
              particulars: row["PARTCULARS"]?.trim(),
              hoursBooked: row["HOURS BOOKED"]?.trim() || "",
              meetingRoomName: row["MEETING ROOM NAME"]?.trim() || "",
              costPerHour: parseAmount(row["COST PER HOUR"]),
              taxable: parseAmount(row["TAXABLE"]),
              gst: parseAmount(row["GST"]),
              totalAmount: parseAmount(row["TOTAL AMOUNT"]),
              paymentDate: row["PAYMENT DATE"]
                ? new Date(row["PAYMENT DATE"])
                : null,
              status: row["STATUS"]?.trim() || "",
              remarks: row["REMARKS"]?.trim() || "",
            };

            if (!revenueObj.client || !revenueObj.particulars) return;

            revenues.push(revenueObj);
          } catch (error) {
            reject(error);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (!revenues.length) {
      return res.status(400).json({
        message: "No valid data found in CSV",
      });
    }

    await MeetingRevenue.insertMany(revenues);

    return res.status(201).json({
      message: "Bulk meeting revenue inserted successfully",
      insertedCount: revenues.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to insert meeting revenue",
    });
  }
};

module.exports = {
  createMeetingRevenue,
  updateMeetingRevenue,
  getMeetingRevenue,
  bulkInsertMeetingRevenue,
};
