const MeetingRevenue = require("../../models/sales/MeetingRevenue");

const createMeetingRevenue = async (req, res, next) => {
  try {
    const {
      date,
      clientName,
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
      clientName,
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
      { new: true, runValidators: true }
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
        const referenceDate =  item.date;
        const month = MONTHS_SHORT[new Date(referenceDate).getMonth()];
        const year = new Date(referenceDate).getFullYear().toString().slice(-2);
        const monthKey = `${month}-${year}`;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            actual: 0,
            revenue: [],
          });
        }

        const monthData = monthlyMap.get(monthKey);
        monthData.actual += item.taxable;

        monthData.revenue.push({
          clientName: item.clientName,
          particulars: item.particulars,
          unitsOrHours: item.unitsOrHours,
          costPerPass: item.costPerPass,
          taxable: item.taxable,
          gst: item.gst,
          totalAmount: item.totalAmount,
          date: item.date,
          paymentDate: item.paymentDate,
          remarks: item.remarks || "",
        });
      });

      return Array.from(monthlyMap.values());
    };

    const transformed = transformRevenues(revenues);
    res.status(200).json(transformed);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeetingRevenue,
  updateMeetingRevenue,
  getMeetingRevenue,
};
