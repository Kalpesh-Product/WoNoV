const mongoose = require("mongoose");
const ElectricityConsumption = require("../../models/ElectricityConsumption");
const Unit = require("../../models/locations/Unit");

const dayBounds = (value) => {
  const dateValue = value || new Date().toISOString().slice(0, 10);
  const start = new Date(`${dateValue}T00:00:00+05:30`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getTodayDateString = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );

const isFutureDate = (value) => String(value || "").slice(0, 10) > getTodayDateString();

const ST_UNIT_PREFIX = /^ST/i;
const DTC_UNIT_PREFIX = /^DTC/i;
const DTC_BUILDING_NAME = /Dempo Trade Cent(?:re|er)/i;
const HIDDEN_DTC_UNIT_NOS = new Set(["603 A", "605 A"]);

const normalizeUnitNo = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const isVisibleDtcUnit = (unit) =>
  !HIDDEN_DTC_UNIT_NOS.has(normalizeUnitNo(unit?.unitNo)) &&
  (DTC_UNIT_PREFIX.test(String(unit?.unitNo || "")) ||
    DTC_BUILDING_NAME.test(String(unit?.building?.buildingName || "")));

const buildReadingTimestamp = (dateValue) => {
  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  const readingAt = new Date(`${dateValue}T${currentTime}+05:30`);
  return readingAt;
};

const sortedReadings = (meter) =>
  [...(meter?.readings || [])].sort(
    (a, b) => new Date(a.readingAt) - new Date(b.readingAt),
  );

const readingContext = (meter, readingId) => {
  const readings = sortedReadings(meter);
  const index = readings.findIndex(
    (reading) => String(reading._id) === String(readingId),
  );
  if (index < 0) return null;
  const reading = readings[index];
  const hasPreviousReading = index > 0;
  const previousReading = hasPreviousReading ? Number(readings[index - 1].value) : 0;
  return {
    reading,
    previousReading,
    hasPreviousReading,
    consumption: hasPreviousReading ? Number(reading.value) - previousReading : 0,
  };
};

const previousReadingBefore = (meter, date) => {
  const previous = sortedReadings(meter)
    .filter((reading) => new Date(reading.readingAt) < date)
    .at(-1);
  return previous ? Number(previous.value) : null;
};

const serialize = (unit, meter, context) => ({
  id: context.reading._id,
  meterNo: meter.meterNo,
  unitNo: unit.unitNo,
  unitId: unit._id,
  previousReading: context.previousReading,
  hasPreviousReading: context.hasPreviousReading,
  currentReading: Number(context.reading.value),
  consumption: context.consumption,
  date: context.reading.readingAt,
  addedBy: context.reading.addedBy
    ? `${context.reading.addedBy.firstName || ""} ${context.reading.addedBy.lastName || ""}`.trim()
    : "",
  editedBy: Array.isArray(context.reading.editHistory) &&
    context.reading.editHistory.length > 0 &&
    context.reading.editHistory.at(-1)?.editedBy
    ? `${context.reading.editHistory.at(-1).editedBy.firstName || ""} ${context.reading.editHistory.at(-1).editedBy.lastName || ""}`.trim()
    : "",
  editedAt:
    Array.isArray(context.reading.editHistory) && context.reading.editHistory.length > 0
      ? context.reading.editHistory.at(-1)?.editedAt || null
      : null,
});

const userName = (user) =>
  user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";

const getLastMonthlyEdit = (bill) =>
  Array.isArray(bill?.editHistory) && bill.editHistory.length > 0
    ? bill.editHistory.at(-1)
    : null;

const getDailyReadingHistory = async (req, res, next) => {
  try {
    const { module } = req.params;
    const { readingId } = req.query;
    const moduleKey = String(module || "").toLowerCase();
    if (
      !["st", "dtc"].some((prefix) => moduleKey.startsWith(prefix)) ||
      !mongoose.isValidObjectId(readingId)
    ) {
      return res.status(400).json({ message: "Invalid daily reading" });
    }

    const meterIds = await ElectricityConsumption.find({
      "readings._id": readingId,
    }).distinct("_id");
    let query = Unit.findOne({
      company: req.company,
      isActive: true,
      ElectricityConsumption: { $in: meterIds },
      ...(moduleKey.startsWith("st") ? { unitNo: ST_UNIT_PREFIX } : {}),
    }).select("unitNo ElectricityConsumption building");
    if (moduleKey.startsWith("dtc")) {
      query = query.populate({ path: "building", select: "buildingName" });
    }
    const unit = await query.populate({
      path: "ElectricityConsumption",
      populate: [
        { path: "readings.addedBy", select: "firstName lastName" },
        { path: "readings.editHistory.editedBy", select: "firstName lastName" },
      ],
    });
    if (
      !unit?.ElectricityConsumption ||
      (moduleKey.startsWith("dtc") && !isVisibleDtcUnit(unit))
    ) {
      return res.status(404).json({ message: "Reading not found" });
    }

    const meter = unit.ElectricityConsumption;
    const context = readingContext(meter, readingId);
    if (!context) return res.status(404).json({ message: "Reading not found" });
    const reading = context.reading;
    const base = {
      unitNo: unit.unitNo,
      addedBy: userName(reading.addedBy),
      addedAt: reading.readingAt,
    };
    const edits = reading.editHistory || [];
    const firstEdit = edits[0];
    const data = [
      {
        ...base,
        meterNo: reading.originalMeterNo || firstEdit?.meterNo || meter.meterNo,
        previousReading: reading.originalPreviousReading ?? context.previousReading,
        currentReading: reading.originalValue ?? firstEdit?.value ?? Number(reading.value),
        editedBy: "",
        editedAt: null,
      },
      ...edits.map((edit) => ({
        ...base,
        meterNo: edit.meterNo,
        previousReading: edit.previousReading,
        currentReading: Number(edit.value),
        editedBy: userName(edit.editedBy),
        editedAt: edit.editedAt,
      })),
    ];
    res.json({ data });
  } catch (error) {
    next(error);
  }
};


const getCompanyUnits = (company) =>
  Unit.find({ company, isActive: true, unitNo: ST_UNIT_PREFIX })
    .select("unitNo unitName ElectricityConsumption")
    .populate({
      path: "ElectricityConsumption",
       populate: [
        { path: "readings.addedBy", select: "firstName lastName" },
        { path: "readings.editHistory.editedBy", select: "firstName lastName" },
        { path: "monthlyBills.addedBy", select: "firstName lastName" },
        { path: "monthlyBills.editHistory.editedBy", select: "firstName lastName" },
      ],
    })
    .sort({ unitNo: 1 });

const monthBounds = (value) => {
  const dateValue =
    value instanceof Date
      ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(value)
      : String(value || getTodayDateString()).slice(0, 10);
  const start = new Date(`${dateValue.slice(0, 7)}-01T00:00:00+05:30`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return {
    start,
    end,
    billDate: new Date(`${dateValue}T00:00:00+05:30`),
    monthKey: dateValue.slice(0, 7),
  };
};

const monthlyConsumptionThrough = (meter, bounds) => {
  if (!meter) return 0;
  const monthReadings = sortedReadings(meter).filter((reading) => {
    const readingAt = new Date(reading.readingAt);
    return readingAt >= bounds.start && readingAt < bounds.end;
  });

  let previousReading = previousReadingBefore(meter, bounds.start);

  return monthReadings.reduce((total, reading) => {
    const currentReading = Number(reading.value);
    const consumption =
      previousReading === null ? 0 : currentReading - Number(previousReading);
    previousReading = currentReading;
    return total + Math.max(consumption, 0);
  }, 0);
};

const syncMonthlyBillTotal = (meter, readingDate, addedBy) => {
  const bounds = monthBounds(readingDate);
  if (!meter || !bounds) return;

  const monthlyConsumption = monthlyConsumptionThrough(meter, bounds);
  const monthlyBill = meter.monthlyBills.find(
    (item) => item.monthKey === bounds.monthKey,
  );
  if (monthlyBill) {
    monthlyBill.totalConsumption = monthlyConsumption;
    return monthlyBill;
  }

  if (addedBy) {
    const draftMonthlyBill = {
      totalConsumption: monthlyConsumption,
      totalBillAmount: 0,
      billDate: bounds.billDate,
      billTimestamp: new Date(),
      monthKey: bounds.monthKey,
      addedBy,
    };
    meter.monthlyBills.push(draftMonthlyBill);
    return draftMonthlyBill;
  }

  return null;
};

const serializeMonthly = (unit, meter, bill, bounds) => {
  const resolvedBounds = bounds || monthBounds(bill?.billDate);
  const lastMonthlyEdit = getLastMonthlyEdit(bill);
  if (!resolvedBounds) {
    return {
      id: bill?._id ?? null,
      unitId: unit._id,
      unitNo: unit.unitNo,
      meterNo: meter.meterNo,
      totalConsumption: 0,
      totalBillAmount: bill?.totalBillAmount ?? "",
      date: bill?.billDate ?? null,
      billTimestamp: bill?.billTimestamp || bill?.createdAt || bill?.billDate,
      monthKey: bill?.monthKey ?? "",
      addedBy: bill?.addedBy
        ? `${bill.addedBy.firstName || ""} ${bill.addedBy.lastName || ""}`.trim()
        : "",
      editedBy: lastMonthlyEdit?.editedBy
        ? `${lastMonthlyEdit.editedBy.firstName || ""} ${lastMonthlyEdit.editedBy.lastName || ""}`.trim()
        : "",
      editedAt: lastMonthlyEdit?.editedAt || null,
    };
  }

  return {
    id: bill?._id ?? null,
    unitId: unit._id,
    unitNo: unit.unitNo,
    meterNo: meter.meterNo,
    totalConsumption: monthlyConsumptionThrough(meter, resolvedBounds),
    totalBillAmount: bill?.totalBillAmount ?? "",
    date: bill?.billDate ?? resolvedBounds.billDate,
    billTimestamp: bill?.billTimestamp || bill?.createdAt || bill?.billDate,
    monthKey: bill?.monthKey ?? resolvedBounds.monthKey,
    addedBy: bill?.addedBy
      ? `${bill.addedBy.firstName || ""} ${bill.addedBy.lastName || ""}`.trim()
      : "",
    editedBy: lastMonthlyEdit?.editedBy
      ? `${lastMonthlyEdit.editedBy.firstName || ""} ${lastMonthlyEdit.editedBy.lastName || ""}`.trim()
      : "",
    editedAt: lastMonthlyEdit?.editedAt || null,
  };
};

const getMonthlyReadingHistory = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    if (!["st", "dtc"].includes(module) || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid monthly reading" });
    }
    const meterIds = await ElectricityConsumption.find({
      "monthlyBills._id": id,
    }).distinct("_id");
    let query = Unit.findOne({
      company: req.company,
      isActive: true,
      ElectricityConsumption: { $in: meterIds },
      ...(module === "st" ? { unitNo: ST_UNIT_PREFIX } : {}),
    }).select("unitNo ElectricityConsumption building");
    if (module === "dtc") query = query.populate("building", "buildingName");
    const unit = await query.populate({
      path: "ElectricityConsumption",
      populate: [
        { path: "monthlyBills.addedBy", select: "firstName lastName" },
        { path: "monthlyBills.editHistory.editedBy", select: "firstName lastName" },
      ],
    });
    if (!unit?.ElectricityConsumption || (module === "dtc" && !isVisibleDtcUnit(unit))) {
      return res.status(404).json({ message: "Monthly reading not found" });
    }
    const meter = unit.ElectricityConsumption;
    const bill = meter.monthlyBills.id(id);
    if (!bill) return res.status(404).json({ message: "Monthly reading not found" });
    const edits = bill.editHistory || [];
    const firstEdit = edits[0];
    const base = {
      unitNo: unit.unitNo,
      addedBy: userName(bill.addedBy),
      addedAt: bill.billTimestamp || bill.billDate,
    };
    res.json({
      data: [
        {
          ...base,
          meterNo: bill.originalMeterNo || meter.meterNo,
          totalConsumption:
            bill.originalTotalConsumption ?? firstEdit?.totalConsumption ?? bill.totalConsumption,
          totalBillAmount:
            bill.originalTotalBillAmount ?? firstEdit?.totalBillAmount ?? bill.totalBillAmount,
          editedBy: "",
          editedAt: null,
        },
        ...edits.map((edit) => ({
          ...base,
          meterNo: edit.meterNo,
          totalConsumption: edit.totalConsumption,
          totalBillAmount: edit.totalBillAmount,
          editedBy: userName(edit.editedBy),
          editedAt: edit.editedAt,
        })),
      ],
    });
  } catch (error) {
    next(error);
  }
};


const getStEnergyMonthlyFormData = async (req, res, next) => {
  try {
    const bounds = monthBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });

    const units = await getCompanyUnits(req.company);
    res.json({
      data: units.map((unit) => ({
        unitId: unit._id,
        unitNo: unit.unitNo,
        meterNo: unit.ElectricityConsumption?.meterNo ?? "",
        totalConsumption: monthlyConsumptionThrough(
          unit.ElectricityConsumption,
          bounds,
        ),
      })),
      date: bounds.billDate,
      monthKey: bounds.monthKey,
    });
  } catch (error) {
    next(error);
  }
};

const getStEnergyMonthlyReadings = async (req, res, next) => {
  try {
    const bounds = monthBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });
    const units = await getCompanyUnits(req.company);
    const data = units
      .map((unit) => {
        const meter = unit.ElectricityConsumption;
        const bill = meter?.monthlyBills?.find(
          (item) => item.monthKey === bounds.monthKey,
        );
        const hasMonthlyReading = sortedReadings(meter).some((reading) => {
          const readingAt = new Date(reading.readingAt);
          return readingAt >= bounds.start && readingAt < bounds.end;
        });

        if (!bill && !hasMonthlyReading) {
          return null;
        }

        return serializeMonthly(unit, meter, bill || {}, bounds);
      })
      .filter(Boolean);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const addStEnergyMonthlyReadings = async (req, res, next) => {
  try {
    const bounds = monthBounds(req.body.date);
    const bills = req.body.bills || req.body.readings;
    if (!bounds || !Array.isArray(bills)) {
      return res.status(400).json({ message: "Date and bills are required" });
    }
    if (isFutureDate(req.body.date)) {
      return res.status(400).json({ message: "Bill cannot be added for a future date" });
    }

    const units = await getCompanyUnits(req.company);
    const billMap = new Map(bills.map((bill) => [String(bill.unitId), bill]));
    if (bills.length !== units.length || billMap.size !== units.length) {
      return res.status(400).json({
        message: "A bill amount is required once for every active ST unit",
      });
    }

    const metersToSave = [];
    for (const unit of units) {
      const bill = billMap.get(String(unit._id));
      const totalBillAmount = Number(bill?.totalBillAmount);
      if (!bill || !Number.isFinite(totalBillAmount) || totalBillAmount <= 0) {
        return res.status(400).json({
          message: `A valid Total Bill Amount is required for unit ${unit.unitNo}`,
        });
      }
      const meterNo = String(unit.ElectricityConsumption?.meterNo || "").trim();
      if (!meterNo) {
        return res.status(400).json({
          message: `Meter No. is not configured for unit ${unit.unitNo}`,
        });
      }
      const meter = unit.ElectricityConsumption;
      const monthlyBill = meter.monthlyBills.find(
        (item) => item.monthKey === bounds.monthKey,
      );
      const billValues = {
        totalConsumption: monthlyConsumptionThrough(meter, bounds),
        totalBillAmount,
        billDate: bounds.billDate,
        billTimestamp: new Date(),
        monthKey: bounds.monthKey,
        addedBy: req.user,
        originalMeterNo: meterNo,
        originalTotalConsumption: monthlyConsumptionThrough(meter, bounds),
        originalTotalBillAmount: totalBillAmount,
      };
      if (monthlyBill) {
        Object.assign(monthlyBill, billValues);
      } else {
        meter.monthlyBills.push(billValues);
      }
      metersToSave.push(meter);
    }
    await Promise.all(metersToSave.map((meter) => meter.save()));
    res.status(201).json({ message: "ST monthly energy bills saved" });
  } catch (error) {
    next(error);
  }
};

const editStEnergyMonthlyReading = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid monthly bill id" });
    }
    const totalBillAmount = Number(req.body.totalBillAmount);
    if (!Number.isFinite(totalBillAmount) || totalBillAmount <= 0) {
      return res.status(400).json({ message: "A valid Total Bill Amount is required" });
    }

    const meterIds = await ElectricityConsumption.find({
      "monthlyBills._id": req.params.id,
    }).distinct("_id");
    const unit = await Unit.findOne({
      company: req.company,
      isActive: true,
      unitNo: ST_UNIT_PREFIX,
      ElectricityConsumption: { $in: meterIds },
    }).populate({
      path: "ElectricityConsumption",
      populate: [
        { path: "monthlyBills.addedBy", select: "firstName lastName" },
        { path: "monthlyBills.editHistory.editedBy", select: "firstName lastName" },
      ],
    });
    if (!unit?.ElectricityConsumption) {
      return res.status(404).json({ message: "Monthly bill not found" });
    }

    const meter = unit.ElectricityConsumption;
    const monthlyBill = meter.monthlyBills.id(req.params.id);
    const bounds = monthBounds(monthlyBill.billDate);
    monthlyBill.originalMeterNo ||= meter.meterNo;
    monthlyBill.originalTotalConsumption ??= monthlyBill.totalConsumption;
    monthlyBill.originalTotalBillAmount ??= monthlyBill.totalBillAmount;
    monthlyBill.editHistory.push({
      meterNo: meter.meterNo,
      totalConsumption: monthlyConsumptionThrough(meter, bounds),
      totalBillAmount,
      editedBy: req.user,
      editedAt: new Date(),
    });
    monthlyBill.totalBillAmount = totalBillAmount;
    monthlyBill.billTimestamp = monthlyBill.billTimestamp || new Date();
    await meter.save();
    await meter.populate([
      { path: "monthlyBills.addedBy", select: "firstName lastName" },
      { path: "monthlyBills.editHistory.editedBy", select: "firstName lastName" },
    ]);
    res.json({
      message: "ST monthly energy bill updated",
      data: serializeMonthly(unit, meter, meter.monthlyBills.id(req.params.id), bounds),
    });
  } catch (error) {
    next(error);
  }
};    

const getStEnergyFormData = async (req, res, next) => {
  try {
    const bounds = dayBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });

    const units = await getCompanyUnits(req.company);
    res.json({
      data: units.map((unit) => ({
        unitId: unit._id,
        unitNo: unit.unitNo,
        unitName: unit.unitName,
        meterNo: unit.ElectricityConsumption?.meterNo ?? "",
        previousReading:
          previousReadingBefore(unit.ElectricityConsumption, bounds.start) ?? 0,
        hasPreviousReading:
          previousReadingBefore(unit.ElectricityConsumption, bounds.start) !==
          null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getStEnergyReadings = async (req, res, next) => {
  try {
    const bounds = dayBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });

    const units = await getCompanyUnits(req.company);
    const data = units.map((unit) => {
      const meter = unit.ElectricityConsumption;
      const currentReading = meter?.readings.find((item) => {
        const readingAt = new Date(item.readingAt);
        return readingAt >= bounds.start && readingAt < bounds.end;
      });

      if (currentReading) {
        const context = readingContext(meter, currentReading._id);
        return serialize(unit, meter, context);
      }

      const previousReading = previousReadingBefore(meter, bounds.start);
      return {
        id: null,
        meterNo: meter?.meterNo ?? "",
        unitNo: unit.unitNo,
        unitId: unit._id,
        previousReading: previousReading ?? 0,
        hasPreviousReading: previousReading !== null,
        currentReading: "",
        consumption: "",
        date: null,
        addedBy: "",
      };
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const addStEnergyReadings = async (req, res, next) => {
  try {
    const bounds = dayBounds(req.body.date);
    const readings = req.body.readings;
    if (!bounds || !Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ message: "Date and readings are required" });
    }
    if (isFutureDate(req.body.date)) {
      return res
        .status(400)
        .json({ message: "Reading cannot be added for a future date" });
    }

    const unitIds = readings.map((row) => row.unitId);
    if (
      unitIds.some((id) => !mongoose.isValidObjectId(id)) ||
      new Set(unitIds).size !== unitIds.length
    ) {
      return res.status(400).json({ message: "Each valid unit can occur only once" });
    }
    const units = await Unit.find({
      _id: { $in: unitIds },
      company: req.company,
      isActive: true,
      unitNo: ST_UNIT_PREFIX,
    }).populate("ElectricityConsumption");
    if (units.length !== unitIds.length) {
      return res.status(400).json({ message: "One or more units are invalid" });
    }

    const meterNumbers = readings.map((row) => String(row.meterNo || "").trim());
    if (
      meterNumbers.some((meterNo) => !meterNo) ||
      new Set(meterNumbers).size !== meterNumbers.length
    ) {
      return res.status(400).json({ message: "Each unit requires a unique Meter No." });
    }

    const unitMap = new Map(units.map((unit) => [String(unit._id), unit]));
    for (const row of readings) {
      const unit = unitMap.get(String(row.unitId));
      const meterNo = String(row.meterNo || "").trim();
      const currentReading = Number(row.currentReading);
      const readingAt = buildReadingTimestamp(req.body.date);

      if (!readingAt) {
        return res.status(400).json({ message: "Invalid date" });
      }

      if (!Number.isFinite(currentReading) || currentReading < 0) {
        return res.status(400).json({ message: "A valid current reading is required" });
      }

      let meter = unit.ElectricityConsumption;
      if (!meter) {
        meter = await ElectricityConsumption.create({
          meterNo,
          readings: [],
          consumption: 0,
        });
        unit.ElectricityConsumption = meter._id;
        await unit.save();
      } else if (String(meter.meterNo || "").trim() !== meterNo) {
        meter.meterNo = meterNo;
      }

      const duplicate = meter.readings.some((reading) => {
        const readingAt = new Date(reading.readingAt);
        return readingAt >= bounds.start && readingAt < bounds.end;
      });
      if (duplicate) {
        return res.status(409).json({
          message: `A reading already exists for unit ${unit.unitNo} on this date`,
        });
      }
      const previousReading = previousReadingBefore(meter, bounds.start);
      if (previousReading !== null && currentReading < previousReading) {
        return res.status(400).json({
          message: `Current reading for meter ${meterNo} cannot be less than ${previousReading}`,
        });
      }
      meter.readings.push({
        value: currentReading,
        readingAt,
        addedBy: req.user,
        originalMeterNo: meterNo,
        originalValue: currentReading,
        originalPreviousReading: previousReading ?? 0,
      });
      meter.consumption =
        previousReading === null ? 0 : currentReading - previousReading;
      syncMonthlyBillTotal(meter, readingAt, req.user);
      await meter.save();
    }

    res.status(201).json({ message: "ST energy readings added" });
  } catch (error) {
    next(error);
  }
};

const editStEnergyReading = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid reading id" });
    }
    const unit = await Unit.findOne({
      company: req.company,
      isActive: true,
      unitNo: ST_UNIT_PREFIX,
      ElectricityConsumption: {
        $in: await ElectricityConsumption.find({
          "readings._id": req.params.id,
        }).distinct("_id"),
      },
    }).populate({
      path: "ElectricityConsumption",
      populate: { path: "readings.addedBy", select: "firstName lastName" },
    });
    if (!unit?.ElectricityConsumption) {
      return res.status(404).json({ message: "Reading not found" });
    }

    const meter = unit.ElectricityConsumption;
    const meterNo = String(req.body.meterNo || "").trim();
    const currentReading = Number(req.body.currentReading);
    if (!meterNo || !Number.isFinite(currentReading) || currentReading < 0) {
      return res.status(400).json({
        message: "A Meter No. and valid Current Reading are required",
      });
    }
    const context = readingContext(meter, req.params.id);
    if (context.hasPreviousReading && currentReading < context.previousReading) {
      return res.status(400).json({
        message: `Current reading cannot be less than ${context.previousReading}`,
      });
    }
    const nextReading = sortedReadings(meter).find(
      (reading) => new Date(reading.readingAt) > new Date(context.reading.readingAt),
    );
    if (nextReading && currentReading > Number(nextReading.value)) {
      return res.status(400).json({
        message: `Current reading cannot exceed the next reading (${nextReading.value})`,
      });
    }

     context.reading.originalMeterNo ||= meter.meterNo;
    context.reading.originalValue ??= Number(context.reading.value);
    context.reading.originalPreviousReading ??= context.previousReading;
    context.reading.editHistory.push({
      meterNo,
      previousReading: context.previousReading,
      value: currentReading,
      editedBy: req.user,
      editedAt: new Date(),
    });

    meter.meterNo = meterNo;
    context.reading.value = currentReading;
    const latest = sortedReadings(meter).at(-1);
    const latestContext = latest ? readingContext(meter, latest._id) : null;
    meter.consumption = latestContext?.consumption ?? 0;
    syncMonthlyBillTotal(meter, context.reading.readingAt, req.user);
    await meter.save();
    await meter.populate([
      { path: "readings.addedBy", select: "firstName lastName" },
      { path: "readings.editHistory.editedBy", select: "firstName lastName" },
    ]);

    res.json({
      message: "ST energy reading updated",
      data: serialize(unit, meter, readingContext(meter, req.params.id)),
    });
  } catch (error) {
    next(error);
  }
};

const getDtcCompanyUnits = (company) =>
  Unit.find({ company, isActive: true })
    .select("unitNo unitName ElectricityConsumption building")
    .populate({
      path: "building",
      select: "buildingName",
    })
    .populate({
      path: "ElectricityConsumption",
      // populate: { path: "readings.addedBy", select: "firstName lastName" },
       populate: [
        { path: "readings.addedBy", select: "firstName lastName" },
        { path: "readings.editHistory.editedBy", select: "firstName lastName" },
        { path: "monthlyBills.addedBy", select: "firstName lastName" },
        { path: "monthlyBills.editHistory.editedBy", select: "firstName lastName" },
      ],
    })
    .then((units) => units.filter(isVisibleDtcUnit).sort((a, b) =>
      String(a.unitNo || "").localeCompare(String(b.unitNo || ""), undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    ));
  const getDtcEnergyMonthlyFormData = async (req, res, next) => {
  try {
    const bounds = monthBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });

    const units = await getDtcCompanyUnits(req.company);
    res.json({
      data: units.map((unit) => ({
        unitId: unit._id,
        unitNo: unit.unitNo,
        meterNo: unit.ElectricityConsumption?.meterNo ?? "",
        totalConsumption: monthlyConsumptionThrough(
          unit.ElectricityConsumption,
          bounds,
        ),
      })),
      date: bounds.billDate,
      monthKey: bounds.monthKey,
    });
  } catch (error) {
    next(error);
  }
};

const getDtcEnergyMonthlyReadings = async (req, res, next) => {
  try {
    const bounds = monthBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });

    const units = await getDtcCompanyUnits(req.company);
    const data = units
      .map((unit) => {
        const meter = unit.ElectricityConsumption;
        const bill = meter?.monthlyBills?.find(
          (item) => item.monthKey === bounds.monthKey,
        );
        const hasMonthlyReading = sortedReadings(meter).some((reading) => {
          const readingAt = new Date(reading.readingAt);
          return readingAt >= bounds.start && readingAt < bounds.end;
        });

        if (!bill && !hasMonthlyReading) {
          return null;
        }

        return serializeMonthly(unit, meter, bill || {}, bounds);
      })
      .filter(Boolean);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const addDtcEnergyMonthlyReadings = async (req, res, next) => {
  try {
    const bounds = monthBounds(req.body.date);
    const bills = req.body.bills || req.body.readings;
    if (!bounds || !Array.isArray(bills)) {
      return res.status(400).json({ message: "Date and bills are required" });
    }
    if (isFutureDate(req.body.date)) {
      return res.status(400).json({ message: "Bill cannot be added for a future date" });
    }

    const units = await getDtcCompanyUnits(req.company);
    const billMap = new Map(bills.map((bill) => [String(bill.unitId), bill]));
    if (bills.length !== units.length || billMap.size !== units.length) {
      return res.status(400).json({
        message: "A bill amount is required once for every active DTC unit",
      });
    }

    const metersToSave = [];
    for (const unit of units) {
      const bill = billMap.get(String(unit._id));
      const totalBillAmount = Number(bill?.totalBillAmount);
      if (!bill || !Number.isFinite(totalBillAmount) || totalBillAmount <= 0) {
        return res.status(400).json({
          message: `A valid Total Bill Amount is required for unit ${unit.unitNo}`,
        });
      }
      const meter = unit.ElectricityConsumption;
      const meterNo = String(meter?.meterNo || "").trim();
      if (!meterNo) {
        return res.status(400).json({
          message: `Meter No. is not configured for unit ${unit.unitNo}`,
        });
      }
      const totalConsumption = monthlyConsumptionThrough(meter, bounds);
      const monthlyBill = meter.monthlyBills.find(
        (item) => item.monthKey === bounds.monthKey,
      );
      const billValues = {
        totalConsumption,
        totalBillAmount,
        billDate: bounds.billDate,
        billTimestamp: new Date(),
        monthKey: bounds.monthKey,
        addedBy: req.user,
        originalMeterNo: meterNo,
        originalTotalConsumption: totalConsumption,
        originalTotalBillAmount: totalBillAmount,
      };
      if (monthlyBill) Object.assign(monthlyBill, billValues);
      else meter.monthlyBills.push(billValues);
      metersToSave.push(meter);
    }
    await Promise.all(metersToSave.map((meter) => meter.save()));
    res.status(201).json({ message: "DTC monthly energy bills saved" });
  } catch (error) {
    next(error);
  }
};

const editDtcEnergyMonthlyReading = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid monthly bill id" });
    }
    const totalBillAmount = Number(req.body.totalBillAmount);
    if (!Number.isFinite(totalBillAmount) || totalBillAmount <= 0) {
      return res.status(400).json({ message: "A valid Total Bill Amount is required" });
    }

    const meterIds = await ElectricityConsumption.find({
      "monthlyBills._id": req.params.id,
    }).distinct("_id");
    const unit = await Unit.findOne({
      company: req.company,
      isActive: true,
      ElectricityConsumption: { $in: meterIds },
    })
      .select("unitNo unitName ElectricityConsumption building")
      .populate({ path: "building", select: "buildingName" })
      .populate({
        path: "ElectricityConsumption",
        populate: [
          { path: "monthlyBills.addedBy", select: "firstName lastName" },
          { path: "monthlyBills.editHistory.editedBy", select: "firstName lastName" },
        ],
      });
    if (!unit?.ElectricityConsumption || !isVisibleDtcUnit(unit)) {
      return res.status(404).json({ message: "Monthly bill not found" });
    }

    const meter = unit.ElectricityConsumption;
    const monthlyBill = meter.monthlyBills.id(req.params.id);
    const bounds = monthBounds(monthlyBill.billDate);
    monthlyBill.originalMeterNo ||= meter.meterNo;
    monthlyBill.originalTotalConsumption ??= monthlyBill.totalConsumption;
    monthlyBill.originalTotalBillAmount ??= monthlyBill.totalBillAmount;
    monthlyBill.editHistory.push({
      meterNo: meter.meterNo,
      totalConsumption: monthlyConsumptionThrough(meter, bounds),
      totalBillAmount,
      editedBy: req.user,
      editedAt: new Date(),
    });
    monthlyBill.totalBillAmount = totalBillAmount;
    monthlyBill.billTimestamp = monthlyBill.billTimestamp || new Date();
    await meter.save();
    await meter.populate([
      { path: "monthlyBills.addedBy", select: "firstName lastName" },
      { path: "monthlyBills.editHistory.editedBy", select: "firstName lastName" },
    ]);
    res.json({
      message: "DTC monthly energy bill updated",
      data: serializeMonthly(unit, meter, meter.monthlyBills.id(req.params.id), bounds),
    });
  } catch (error) {
    next(error);
  }
};
  

const getDtcEnergyFormData = async (req, res, next) => {
  try {
    const bounds = dayBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });

    const units = await getDtcCompanyUnits(req.company);
    res.json({
      data: units.map((unit) => ({
        unitId: unit._id,
        unitNo: unit.unitNo,
        unitName: unit.unitName,
        meterNo: unit.ElectricityConsumption?.meterNo ?? "",
        previousReading:
          previousReadingBefore(unit.ElectricityConsumption, bounds.start) ?? 0,
        hasPreviousReading:
          previousReadingBefore(unit.ElectricityConsumption, bounds.start) !==
          null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getDtcEnergyReadings = async (req, res, next) => {
  try {
    const bounds = dayBounds(req.query.date);
    if (!bounds) return res.status(400).json({ message: "Invalid date" });

    const units = await getDtcCompanyUnits(req.company);
    const data = units.map((unit) => {
      const meter = unit.ElectricityConsumption;
      const currentReading = meter?.readings.find((item) => {
        const readingAt = new Date(item.readingAt);
        return readingAt >= bounds.start && readingAt < bounds.end;
      });

      if (currentReading) {
        const context = readingContext(meter, currentReading._id);
        return serialize(unit, meter, context);
      }

      const previousReading = previousReadingBefore(meter, bounds.start);
      return {
        id: null,
        meterNo: meter?.meterNo ?? "",
        unitNo: unit.unitNo,
        unitId: unit._id,
        previousReading: previousReading ?? 0,
        hasPreviousReading: previousReading !== null,
        currentReading: "",
        consumption: "",
        date: null,
        addedBy: "",
      };
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const addDtcEnergyReadings = async (req, res, next) => {
  try {
    const bounds = dayBounds(req.body.date);
    const readings = req.body.readings;
    if (!bounds || !Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ message: "Date and readings are required" });
    }
    if (isFutureDate(req.body.date)) {
      return res
        .status(400)
        .json({ message: "Reading cannot be added for a future date" });
    }

    const unitIds = readings.map((row) => row.unitId);
    if (
      unitIds.some((id) => !mongoose.isValidObjectId(id)) ||
      new Set(unitIds).size !== unitIds.length
    ) {
      return res.status(400).json({ message: "Each valid unit can occur only once" });
    }
    const units = (await Unit.find({
      _id: { $in: unitIds },
      company: req.company,
      isActive: true,
    })
      .select("unitNo unitName ElectricityConsumption building")
      .populate({ path: "building", select: "buildingName" })
      .populate("ElectricityConsumption")).filter(isVisibleDtcUnit);
    if (units.length !== unitIds.length) {
      return res.status(400).json({ message: "One or more units are invalid" });
    }

    const meterNumbers = readings.map((row) => String(row.meterNo || "").trim());
    if (
      meterNumbers.some((meterNo) => !meterNo) ||
      new Set(meterNumbers).size !== meterNumbers.length
    ) {
      return res.status(400).json({ message: "Each unit requires a unique Meter No." });
    }

    const unitMap = new Map(units.map((unit) => [String(unit._id), unit]));
    for (const row of readings) {
      const unit = unitMap.get(String(row.unitId));
      const meterNo = String(row.meterNo || "").trim();
      const currentReading = Number(row.currentReading);
      const readingAt = buildReadingTimestamp(req.body.date);

      if (!readingAt) {
        return res.status(400).json({ message: "Invalid date" });
      }

      if (!Number.isFinite(currentReading) || currentReading < 0) {
        return res.status(400).json({ message: "A valid current reading is required" });
      }

      let meter = unit.ElectricityConsumption;
      if (!meter) {
        meter = await ElectricityConsumption.create({
          meterNo,
          readings: [],
          consumption: 0,
        });
        unit.ElectricityConsumption = meter._id;
        await unit.save();
      } else if (String(meter.meterNo || "").trim() !== meterNo) {
        meter.meterNo = meterNo;
      }

      const duplicate = meter.readings.some((reading) => {
        const readingAt = new Date(reading.readingAt);
        return readingAt >= bounds.start && readingAt < bounds.end;
      });
      if (duplicate) {
        return res.status(409).json({
          message: `A reading already exists for unit ${unit.unitNo} on this date`,
        });
      }
      const previousReading = previousReadingBefore(meter, bounds.start);
      if (previousReading !== null && currentReading < previousReading) {
        return res.status(400).json({
          message: `Current reading for meter ${meterNo} cannot be less than ${previousReading}`,
        });
      }
      meter.readings.push({
        value: currentReading,
        readingAt,
        addedBy: req.user,
        originalMeterNo: meterNo,
        originalValue: currentReading,
        originalPreviousReading: previousReading ?? 0,
      });
      meter.consumption =
        previousReading === null ? 0 : currentReading - previousReading;
      syncMonthlyBillTotal(meter, readingAt, req.user);
      await meter.save();
    }

    res.status(201).json({ message: "DTC energy readings added" });
  } catch (error) {
    next(error);
  }
};

const editDtcEnergyReading = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid reading id" });
    }
    const unit = await Unit.findOne({
      company: req.company,
      isActive: true,
      ElectricityConsumption: {
        $in: await ElectricityConsumption.find({
          "readings._id": req.params.id,
        }).distinct("_id"),
      },
    })
      .select("unitNo unitName ElectricityConsumption building")
      .populate({ path: "building", select: "buildingName" })
      .populate({
        path: "ElectricityConsumption",
        populate: { path: "readings.addedBy", select: "firstName lastName" },
      });
    if (!unit?.ElectricityConsumption) {
      return res.status(404).json({ message: "Reading not found" });
    }
    if (
      !isVisibleDtcUnit(unit)
    ) {
      return res.status(404).json({ message: "Reading not found" });
    }

    const meter = unit.ElectricityConsumption;
    const meterNo = String(req.body.meterNo || "").trim();
    const currentReading = Number(req.body.currentReading);
    if (!meterNo || !Number.isFinite(currentReading) || currentReading < 0) {
      return res.status(400).json({
        message: "A Meter No. and valid Current Reading are required",
      });
    }
    const context = readingContext(meter, req.params.id);
    if (context.hasPreviousReading && currentReading < context.previousReading) {
      return res.status(400).json({
        message: `Current reading cannot be less than ${context.previousReading}`,
      });
    }
    const nextReading = sortedReadings(meter).find(
      (reading) => new Date(reading.readingAt) > new Date(context.reading.readingAt),
    );
    if (nextReading && currentReading > Number(nextReading.value)) {
      return res.status(400).json({
        message: `Current reading cannot exceed the next reading (${nextReading.value})`,
      });
    }

      context.reading.originalMeterNo ||= meter.meterNo;
    context.reading.originalValue ??= Number(context.reading.value);
    context.reading.originalPreviousReading ??= context.previousReading;
    context.reading.editHistory.push({
      meterNo,
      previousReading: context.previousReading,
      value: currentReading,
      editedBy: req.user,
      editedAt: new Date(),
    });

    meter.meterNo = meterNo;
    context.reading.value = currentReading;
    const latest = sortedReadings(meter).at(-1);
    const latestContext = latest ? readingContext(meter, latest._id) : null;
    meter.consumption = latestContext?.consumption ?? 0;
    syncMonthlyBillTotal(meter, context.reading.readingAt, req.user);
    await meter.save();
    await meter.populate([
      { path: "readings.addedBy", select: "firstName lastName" },
      { path: "readings.editHistory.editedBy", select: "firstName lastName" },
    ]);

    res.json({
      message: "DTC energy reading updated",
      data: serialize(unit, meter, readingContext(meter, req.params.id)),
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getStEnergyMonthlyFormData,
  getStEnergyMonthlyReadings,
  addStEnergyMonthlyReadings,
  editStEnergyMonthlyReading,
  getStEnergyFormData,
  getStEnergyReadings,
  addStEnergyReadings,
  editStEnergyReading,
  getDtcEnergyMonthlyFormData,
  getDtcEnergyMonthlyReadings,
  addDtcEnergyMonthlyReadings,
  editDtcEnergyMonthlyReading,
  getDtcEnergyFormData,
  getDtcEnergyReadings,
  addDtcEnergyReadings,
  editDtcEnergyReading,
  getDailyReadingHistory,
  getMonthlyReadingHistory,
};
