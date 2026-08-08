const mongoose = require("mongoose");
const ElectricityConsumption = require("../../models/ElectricityConsumption");
const Unit = require("../../models/locations/Unit");

const dayBounds = (value) => {
  const dateValue = value || new Date().toISOString().slice(0, 10);
  const start = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;
  return { start, end: new Date(start.getTime() + 86400000) };
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
  const previousReading = index > 0 ? Number(readings[index - 1].value) : 0;
  return {
    reading,
    previousReading,
    consumption: Number(reading.value) - previousReading,
  };
};

const previousReadingBefore = (meter, date) => {
  const previous = sortedReadings(meter)
    .filter((reading) => new Date(reading.readingAt) < date)
    .at(-1);
  return Number(previous?.value || 0);
};

const serialize = (unit, meter, context) => ({
  id: context.reading._id,
  meterNo: meter.meterNo,
  unitNo: unit.unitNo,
  unitId: unit._id,
  previousReading: context.previousReading,
  currentReading: Number(context.reading.value),
  consumption: context.consumption,
  date: context.reading.readingAt,
  addedBy: context.reading.addedBy
    ? `${context.reading.addedBy.firstName || ""} ${context.reading.addedBy.lastName || ""}`.trim()
    : "",
});

const getCompanyUnits = (company) =>
  Unit.find({ company, isActive: true })
    .select("unitNo unitName ElectricityConsumption")
    .populate({
      path: "ElectricityConsumption",
      populate: { path: "readings.addedBy", select: "firstName lastName" },
    })
    .sort({ unitNo: 1 });

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
        previousReading: previousReadingBefore(
          unit.ElectricityConsumption,
          bounds.start,
        ),
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
    const data = units.flatMap((unit) => {
      const meter = unit.ElectricityConsumption;
      if (!meter) return [];
      const reading = meter.readings.find((item) => {
        const readingAt = new Date(item.readingAt);
        return readingAt >= bounds.start && readingAt < bounds.end;
      });
      const context = reading && readingContext(meter, reading._id);
      return context ? [serialize(unit, meter, context)] : [];
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
    }).populate("ElectricityConsumption");
    if (units.length !== unitIds.length) {
      return res.status(400).json({ message: "One or more units are invalid" });
    }

    const meterNumbers = readings.map((row) => Number(row.meterNo));
    if (
      meterNumbers.some((meterNo) => !Number.isFinite(meterNo)) ||
      new Set(meterNumbers).size !== meterNumbers.length
    ) {
      return res.status(400).json({ message: "Each unit requires a unique numeric Meter No." });
    }

    const unitMap = new Map(units.map((unit) => [String(unit._id), unit]));
    for (const row of readings) {
      const unit = unitMap.get(String(row.unitId));
      const meterNo = Number(row.meterNo);
      const currentReading = Number(row.currentReading);
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
      } else if (Number(meter.meterNo) !== meterNo) {
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
      if (currentReading < previousReading) {
        return res.status(400).json({
          message: `Current reading for meter ${meterNo} cannot be less than ${previousReading}`,
        });
      }
      meter.readings.push({
        value: currentReading,
        readingAt: bounds.start,
        addedBy: req.user,
      });
      meter.consumption = currentReading - previousReading;
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
    const meterNo = Number(req.body.meterNo);
    const currentReading = Number(req.body.currentReading);
    if (!Number.isFinite(meterNo) || !Number.isFinite(currentReading) || currentReading < 0) {
      return res.status(400).json({
        message: "A numeric Meter No. and valid Current Reading are required",
      });
    }
    const context = readingContext(meter, req.params.id);
    if (currentReading < context.previousReading) {
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

    meter.meterNo = meterNo;
    context.reading.value = currentReading;
    const latest = sortedReadings(meter).at(-1);
    const latestContext = readingContext(meter, latest._id);
    meter.consumption = latestContext.consumption;
    await meter.save();
    await meter.populate("readings.addedBy", "firstName lastName");

    res.json({
      message: "ST energy reading updated",
      data: serialize(unit, meter, readingContext(meter, req.params.id)),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStEnergyFormData,
  getStEnergyReadings,
  addStEnergyReadings,
  editStEnergyReading,
};