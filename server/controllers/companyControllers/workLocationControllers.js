const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const { createLog } = require("../../utils/moduleLogs");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const CustomError = require("../../utils/customErrorlogs");
const {
  handleFileUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");
const sharp = require("sharp");
const Unit = require("../../models/locations/Unit");
const Building = require("../../models/locations/Building");
const CoworkingClient = require("../../models/sales/CoworkingClient")

const addBuilding = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Building";
  const logSourceKey = "building";
  const { user, ip, company } = req;
  const { buildingName, fullAddress } = req.body;

  try {
    if (!company || !buildingName) {
      throw new CustomError(
        "Company and Building Name are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      throw new CustomError(
        "Invalid company ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the company exists
    const existingCompany = await Company.findById(company);
    if (!existingCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create new WorkLocation
    const newBuilding = new Building({
      company,
      buildingName,
      fullAddress: fullAddress || "",
    });

    const savedBuilding = await newBuilding.save();

    // Update the company document by adding the work location reference
    await Company.findOneAndUpdate(
      { _id: company },
      {
        $push: { workLocations: savedBuilding._id },
      },
      { new: true, useFindAndModify: false }
    );

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Work location added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedBuilding._id,
      changes: newBuilding,
    });

    return res.status(200).json({
      message: "Building added successfully",
      workLocation: newBuilding,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const addUnit = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Unit";
  const logSourceKey = "unit";
  const { user, ip, company } = req;
  const {
    buildingId,
    unitName,
    unitNo,
    cabinDesks,
    openDesks,
    clearImage,
    occupiedImage,
  } = req.body;

  try {
    if (
      !company ||
      !unitName ||
      !unitNo ||
      !buildingId ||
      !cabinDesks ||
      !openDesks
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      throw new CustomError(
        "Invalid company ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      throw new CustomError(
        "Invalid building ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the company exists
    const existingCompany = await Company.findById(company);
    if (!existingCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const existingBuilding = await Building.findById(buildingId);
    if (!existingBuilding) {
      throw new CustomError(
        "Building not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create new WorkLocation
    const newUnit = new Unit({
      company,
      unitName,
      unitNo,
      cabinDesks,
      openDesks,
      building: buildingId,
      clearImage: clearImage ? clearImage : "",
      occupiedImage: occupiedImage ? occupiedImage : "",
    });

    const savedUnit = await newUnit.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Work location added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedUnit._id,
      changes: newUnit,
    });

    return res.status(200).json({
      message: "Unit added successfully",
      workLocation: newUnit,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const fetchUnits = async (req, res, next) => {
  const { company } = req;
  const { unitId, deskCalculated } = req.query;

  try {
    const companyExists = await Company.findById(company).lean().exec();
    if (!companyExists) {
      return res.status(400).json({ message: "Company not found" });
    }

    let locations;

    if (unitId) {
      locations = await Unit.findOne({ _id: unitId, company })
        .populate("building", "_id buildingName fullAddress")
        .lean()
        .exec();

      if (!locations) {
        return res.status(400).json([]);
      }

      if (!deskCalculated || deskCalculated !== "true") {
        return res.status(200).json(locations);
      }

      const coworkingClients = await CoworkingClient.find({ company, unit: unitId })
        .select("cabinDesks openDesks")
        .lean()
        .exec();

      const occupiedCabinDesks = coworkingClients.reduce((sum, client) => sum + (client.cabinDesks || 0), 0);
      const occupiedOpenDesks = coworkingClients.reduce((sum, client) => sum + (client.openDesks || 0), 0);

      locations.remainingCabinDesks = Math.max(0, locations.cabinDesks - occupiedCabinDesks);
      locations.remainingOpenDesks = Math.max(0, locations.openDesks - occupiedOpenDesks);

      return res.status(200).json(locations);
    }

    locations = await Unit.find({ company })
      .populate("building", "_id buildingName fullAddress")
      .lean()
      .exec();

    if (!locations.length) {
      return res.status(200).json([]);
    }

    if (!deskCalculated || deskCalculated !== "true") {
      return res.status(200).json(locations);
    }

    const clientData = await CoworkingClient.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(company) } },
      {
        $group: {
          _id: "$unit",
          totalCabinDesks: { $sum: "$cabinDesks" },
          totalOpenDesks: { $sum: "$openDesks" },
        },
      },
    ]);

    // Convert aggregation result into a map for easy lookup
    const clientMap = {};
    clientData.forEach((data) => {
      clientMap[data._id] = {
        totalCabinDesks: data.totalCabinDesks || 0,
        totalOpenDesks: data.totalOpenDesks || 0,
      };
    });

    // Attach remaining desks to each unit
    locations = locations.map((unit) => {
      const occupiedCabinDesks = clientMap[unit._id]?.totalCabinDesks || 0;
      const occupiedOpenDesks = clientMap[unit._id]?.totalOpenDesks || 0;

      return {
        ...unit,
        remainingCabinDesks: Math.max(0, unit.cabinDesks - occupiedCabinDesks),
        remainingOpenDesks: Math.max(0, unit.openDesks - occupiedOpenDesks),
      };
    });

    return res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
};



const uploadUnitImage = async (req, res, next) => {
  try {
    const { unitId, imageType } = req.body;
    const file = req.file; // Multer stores the file in req.file
    const companyId = req.company;

    if (!file) {
      return res.status(400).json({ message: "No image provided" });
    }

    if (!unitId || !companyId || !imageType) {
      return res.status(400).json({
        message: "Company ID, Location ID, and Image Type are required",
      });
    }

    if (!["occupiedImage", "clearImage"].includes(imageType)) {
      return res.status(400).json({ message: "Invalid image type" });
    }

    // Find the work location
    const unit = await Unit.findById(unitId).populate([
      { path: "building", select: "buildingName" },
      { path: "company", select: "companyName" },
    ]);

    if (!unit || unit.company._id.toString() !== companyId) {
      return res.status(404).json({ message: "Work location not found" });
    }

    // Delete the existing image if it exists
    if (unit[imageType] && unit[imageType].imageId) {
      await handleFileDelete(unit[imageType].imageId);
    }

    // Resize and convert the image before uploading
    let imageDetails = null;
    try {
      const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;

      const folderPath = `${unit.company.companyName}/work-locations/${unit.building.buildingName}/${unit.unitName}`;
      const uploadResult = await handleFileUpload(base64Image, folderPath);

      imageDetails = {
        imageId: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    } catch (uploadError) {
      return next(new Error("Error processing image before upload"));
    }

    // Update the unit with the new image
    unit[imageType] = imageDetails;
    await unit.save();

    res.json({
      message: "Image uploaded and work location updated successfully",
      workLocation: { [imageType]: imageDetails },
    });
  } catch (error) {
    next(error);
  }
};

const bulkInsertUnits = async (req, res, next) => {
  try {
    const companyId = req.company;
    const { buildingId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    if (!companyId || !buildingId) {
      return res
        .status(400)
        .json({ message: "Company ID and CSV data are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid companyId provided" });
    }

    const units = [];
    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        units.push({
          company: companyId,
          building: buildingId,
          unitName: row["Floor"],
          unitNo: row["Unit Number"],
          isActive: true,
          occupiedImage: { imageId: "", url: "" },
          clearImage: { imageId: "", url: "" },
        });
      })
      .on("end", async () => {
        if (!units.length) {
          return res
            .status(400)
            .json({ message: "No valid work locations found in the CSV" });
        }

        const insertedUnits = await Unit.insertMany(units);
        const workLocationIds = insertedUnits.map((loc) => loc._id);

        const updatedCompany = await Company.findByIdAndUpdate(
          companyId,
          { $push: { workLocations: { $each: workLocationIds } } },
          { new: true }
        );

        if (!updatedCompany) {
          return res
            .status(400)
            .json({ message: "Couldn't update company with work locations" });
        }

        return res.status(200).json({
          message: "Work locations added successfully",
          workLocations: insertedUnits,
        });
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBuilding,
  addUnit,
  fetchUnits,
  bulkInsertUnits,
  uploadUnitImage,
};
