const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const { parseAmount } = require("../../utils/parseAmount");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

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
    const company = req.company;
    const { id } = req.query;

    if (id) {
      const revenue = await MeetingRevenue.findOne({ _id: id, company });
      if (!revenue) {
        return res.status(404).json({ message: "Meeting revenue not found" });
      }
      return res.status(200).json(revenue);
    }

    const revenues = await MeetingRevenue.find({ company })
      .sort({ date: -1 })
      .lean()
      .exec();

    const MONTHS_SHORT = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const transformRevenues = (revenues) => {
      const monthlyMap = new Map();

      revenues.forEach((item) => {
        const referenceDate = new Date(item.date);
        const month = MONTHS_SHORT[referenceDate.getMonth()];
        const year = referenceDate.getFullYear().toString().slice(-2);
        const monthKey = `${month}-${year}`;
        const monthDateKey = new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth(),
          1,
        ); // First day of the month

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            actual: 0,
            revenue: [],
            date: monthDateKey, // used for sorting
          });
        }

        const monthData = monthlyMap.get(monthKey);
        monthData.actual += item.taxable;

        monthData.revenue.push({
          clientName: item?.client,
          particulars: item?.particulars,
          unitsOrHours: item?.unitsOrHours,
          hoursBooked: item?.hoursBooked,
          costPerPass: item?.costPerPass,
          taxable: item?.taxable,
          gst: item?.gst,
          status: item?.status,
          totalAmount: item?.totalAmount,
          date: item?.date,
          paymentDate: item?.paymentDate,
          meetingRoomName: item?.meetingRoomName,
          remarks: item.remarks || "",
        });
      });

      // Convert map to array and sort by actual month date
      return Array.from(monthlyMap.values())
        .sort((a, b) => a.date - b.date)
        .map(({ date, ...rest }) => rest); // remove the temp 'date' field from final output
    };

    const transformed = transformRevenues(revenues);
    res.status(200).json(transformed);
  } catch (error) {
    next(error);
  }
};

// const bulkInsertMeetingRevenue = async (req, res, next) => {
//   const logPath = "sales/SalesLog";
//   const logAction = "Bulk Insert Meeting Revenue";
//   const logSourceKey = "meetingRevenue";
//   const { company: companyId } = req;

//   try {
//     if (!req.file) {
//       throw new Error("No file found");
//     }

//     const revenues = [];

//     await new Promise((resolve, reject) => {
//       const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

//       stream
//         .pipe(csvParser())
//         .on("data", (row) => {
//           try {
//             const revenueObj = {
//               company: companyId,
//               date: row["Date"] ? new Date(row["Date"]) : null,
//               client: row["Client"]?.trim(),
//               particulars: row["Particulars"]?.trim(),
//               unitsOrHours: row["Units/Hours"]?.trim() || "",
//               hoursBooked: row["Hours Booked"]?.trim() || "",
//               meetingRoomName: row["Meeting Room Name"]?.trim() || "",
//               costPerHour: parseAmount(row["Cost Per Hour"]),
//               taxable: parseAmount(row["Taxable"]),
//               gst: parseAmount(row["GST"]),
//               totalAmount: parseAmount(row["Total Amount"]),
//               paymentDate: row["Payment Date"]
//                 ? new Date(row["Payment Date"])
//                 : null,
//               status: row["Status"]?.trim() || "",
//               remarks: row["Remarks"]?.trim() || "",
//             };

//             if (!revenueObj.client || !revenueObj.particulars) return;

//             revenues.push(revenueObj);
//           } catch (error) {
//             reject(
//               new CustomError(error.message, logPath, logAction, logSourceKey),
//             );
//           }
//         })
//         .on("end", () => resolve())
//         .on("error", (error) => {
//           reject(
//             new CustomError(error.message, logPath, logAction, logSourceKey),
//           );
//         });
//     });

//     if (!revenues.length) {
//       throw new Error("No valid data found in CSV");
//     }

//     await MeetingRevenue.insertMany(revenues);

//     return res.status(201).json({
//       message: "Bulk meeting revenue inserted successfully",
//       insertedCount: revenues.length,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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
