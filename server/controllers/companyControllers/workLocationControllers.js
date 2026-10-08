const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const { createLog } = require("../../utils/moduleLogs");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const CustomError = require("../../utils/customErrorlogs");
const { handleFileUpload, handleFileDelete } = require("../../config/s3Config");
const sharp = require("sharp");
const Unit = require("../../models/locations/Unit");
const Building = require("../../models/locations/Building");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const Visitor = require("../../models/visitor/Visitor");
const Printout = require("../../models/Printout");
const User = require("../../models/hr/UserData");

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const isTechDepartmentUser = async (userId) => {
  const user = await User.findById(userId)
    .populate("departments", "name")
    .select("departments")
    .lean();

  return (user?.departments || []).some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );
};

const addBuilding = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Building";
  const logSourceKey = "building";
  const { user, ip, company } = req;
  const { buildingName, address, city, state, country, pincode } = req.body;

  try {
    if (
      !company ||
      !buildingName ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      throw new CustomError(
        "Company and Building Name are required",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      throw new CustomError(
        "Invalid company ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Check if the company exists
    const existingCompany = await Company.findById(company);
    if (!existingCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Create new WorkLocation
    const newBuilding = new Building({
      company,
      buildingName,
      address,
      country,
      state,
      city,
      pincode,
    });

    const savedBuilding = await newBuilding.save();

    // Update the company document by adding the work location reference
    await Company.findOneAndUpdate(
      { _id: company },
      {
        $push: { workLocations: savedBuilding._id },
      },
      { new: true, useFindAndModify: false },
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const editBuilding = async (req, res, next) => {
  const { company } = req;
  const { buildingId } = req.params;
  const { buildingName, address, city, state, country, pincode, isActive } =
    req.body;

  try {
    const hasEditableField =
      buildingName !== undefined ||
      address !== undefined ||
      city !== undefined ||
      state !== undefined ||
      country !== undefined ||
      pincode !== undefined ||
      isActive !== undefined;

    if (!buildingId || !hasEditableField) {
      return res.status(400).json({
        message: "building ID, and at least one editable field are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(company) ||
      !mongoose.Types.ObjectId.isValid(buildingId)
    ) {
      return res.status(400).json({
        message: "Invalid company or building ID",
      });
    }

    const existingBuilding = await Building.findOne({
      _id: buildingId,
      company,
    });

    if (!existingBuilding) {
      return res.status(404).json({
        message: "Building not found for the specified company",
      });
    }

    if (existingBuilding.isDeleted) {
      return res.status(400).json({
        message: "Deleted work location cannot be edited",
      });
    }

    if (buildingName !== undefined) {
      existingBuilding.buildingName = String(buildingName).trim();
    }
    if (address !== undefined) {
      existingBuilding.address = String(address).trim();
    }
    if (city !== undefined) {
      existingBuilding.city = String(city).trim();
    }
    if (state !== undefined) {
      existingBuilding.state = String(state).trim();
    }
    if (country !== undefined) {
      existingBuilding.country = String(country).trim();
    }
    if (pincode !== undefined) {
      existingBuilding.pincode = Number(pincode);
    }
    if (isActive !== undefined) existingBuilding.isActive = isActive;

    const updatedBuilding = await existingBuilding.save();

    return res.status(200).json({
      message: "Building updated successfully",
      workLocation: updatedBuilding,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the building",
      error: error.message,
    });
  }
};

const addUnit = async (req, res, next) => {
  const { company, user, ip } = req;
  const {
    buildingId,
    unitName,
    unitNo,
    sqft,
    cabinDesks,
    openDesks,
    clearImage,
    occupiedImage,
  } = req.body;

  try {
    if (
      !unitName ||
      !unitNo ||
      !buildingId ||
      !cabinDesks ||
      !sqft ||
      !openDesks
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return res.status(400).json({ message: "Invalid building ID provided" });
    }

    const existingCompany = await Company.findById(company);
    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const existingBuilding = await Building.findById(buildingId);
    if (!existingBuilding) {
      return res.status(404).json({ message: "Building not found" });
    }

    const newUnit = new Unit({
      company,
      unitName,
      unitNo,
      cabinDesks,
      openDesks,
      sqft,
      building: buildingId,
      clearImage: clearImage || "",
      occupiedImage: occupiedImage || "",
    });

    const savedUnit = await newUnit.save();

    return res.status(200).json({
      message: "Unit added successfully",
      workLocation: savedUnit,
    });
  } catch (error) {
    console.error("Error adding unit:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUnit = async (req, res, next) => {
  try {
    const { unitId } = req.body;
    const updateFields = { ...req.body };
    const files = req.files || {};

    if (!unitId || !mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid or missing Unit ID" });
    }

    const existingUnit = await Unit.findOne({
      _id: unitId,
      company: req.company,
    }).populate([
      { path: "building", select: "buildingName" },
      { path: "company", select: "companyName" },
    ]);

    if (!existingUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    if (existingUnit.isDeleted) {
      return res.status(400).json({ message: "Deleted unit cannot be edited" });
    }

    const forbiddenFields = ["company", "building", "unitId"];
    forbiddenFields.forEach((field) => delete updateFields[field]);

    for (const imageType of ["clearImage", "occupiedImage"]) {
      const file = files[imageType]?.[0];
      if (file) {
        if (existingUnit[imageType]?.imageId) {
          await handleFileDelete(existingUnit[imageType].imageId);
        }

        const buffer = await sharp(file.buffer)
          .webp({ quality: 80 })
          .toBuffer();
        const base64Image = `data:image/webp;base64,${buffer.toString(
          "base64",
        )}`;

        const folderPath = `${existingUnit.company.companyName}/work-locations/${existingUnit.building.buildingName}/${existingUnit.unitName}`;
        const uploadResult = await handleFileUpload(base64Image, folderPath);

        existingUnit[imageType] = {
          imageId: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    }

    Object.entries(updateFields).forEach(([key, value]) => {
      if (value !== undefined && key in existingUnit) {
        existingUnit[key] = value;
      }
    });

    const updatedUnit = await existingUnit.save();

    return res.status(200).json({
      message: "Unit updated successfully",
      workLocation: updatedUnit,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

const assignPrimaryUnit = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Unit";
  const logSourceKey = "unit";
  const { user, ip, company } = req;
  const { unitId, employeeId, departmentName } = req.body;

  try {
    if (!unitId || !employeeId || !departmentName) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      throw new CustomError(
        "Invalid unit ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new CustomError(
        "Invalid employee ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const existingUnit = await Unit.findById(unitId);
    if (!existingUnit) {
      throw new CustomError("Unit not found", logPath, logAction, logSourceKey);
    }

    const dept =
      departmentName === "Administration"
        ? "adminLead"
        : departmentName === "Maintenance"
          ? "maintenanceLead"
          : departmentName === "IT"
            ? "itLead"
            : "";

    const updatedUnit = await Unit.findByIdAndUpdate(
      { _id: unitId },
      { [dept]: employeeId },
      { new: true },
    );

    if (!updatedUnit) {
      throw new CustomError(
        "Failed to assign primary unit",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Primary unit assigned successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedUnit._id,
      changes: {
        [dept]: employeeId,
      },
    });

    return res.status(200).json({
      message: "Primary unit assigned successfully",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
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

    const includeDeleted =
      req.query.includeDeleted === "true" &&
      (await isTechDepartmentUser(req.user));
    let locations;

    if (unitId) {
      locations = await Unit.findOne({
        _id: unitId,
        company,
        ...(!includeDeleted && { isDeleted: { $ne: true } }),
      })
        .populate("building", "_id buildingName fullAddress")
        .lean()
        .exec();

      if (!locations) {
        return res.status(400).json([]);
      }

      if (!deskCalculated || deskCalculated !== "true") {
        return res.status(200).json(locations);
      }

      const coworkingClients = await CoworkingClient.find({
        company,
        unit: unitId,
      })
        .select("cabinDesks openDesks")
        .lean()
        .exec();

      const occupiedCabinDesks = coworkingClients.reduce(
        (sum, client) => sum + (client.cabinDesks || 0),
        0,
      );
      const occupiedOpenDesks = coworkingClients.reduce(
        (sum, client) => sum + (client.openDesks || 0),
        0,
      );

      locations.remainingCabinDesks = Math.max(
        0,
        locations.cabinDesks - occupiedCabinDesks,
      );
      locations.remainingOpenDesks = Math.max(
        0,
        locations.openDesks - occupiedOpenDesks,
      );

      return res.status(200).json(locations);
    }

    locations = await Unit.find({
      company,
      isOnlyBudget: false,
      ...(includeDeleted
        ? {
            $or: [
              { isActive: true, isDeleted: { $ne: true } },
              { isDeleted: true },
            ],
          }
        : { isActive: true, isDeleted: { $ne: true } }),
    })
      .populate([
        {
          path: "building",
          select: "_id buildingName fullAddress",
        },
        {
          path: "adminLead",
          select: "firstName middleName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        {
          path: "maintenanceLead",
          select: "firstName middleName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        {
          path: "itLead",
          select: "firstName middleName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        {
          path: "deletedBy",
          select: "firstName lastName employeeName name email",
        },
      ])
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

const deleteUnit = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid unit ID" });
    }

    const unit = await Unit.findOne({ _id: unitId, company: req.company });
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    if (await isTechDepartmentUser(req.user)) {
      await unit.deleteOne();
      return res.status(200).json({
        message: "Unit permanently deleted successfully",
        deletionType: "permanent",
      });
    }

    if (unit.isDeleted) {
      return res.status(400).json({ message: "Unit is already deleted" });
    }

    unit.isDeleted = true;
    unit.isActive = false;
    unit.deletedAt = new Date();
    unit.deletedBy = req.user;
    await unit.save();

    return res.status(200).json({
      message: "Unit deleted successfully",
      deletionType: "soft",
    });
  } catch (error) {
    next(error);
  }
};

const restoreUnit = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid unit ID" });
    }

    if (!(await isTechDepartmentUser(req.user))) {
      return res.status(403).json({
        message: "Only Tech Department users can restore units",
      });
    }

    const unit = await Unit.findOneAndUpdate(
      { _id: unitId, company: req.company, isDeleted: true },
      {
        $set: { isDeleted: false, isActive: true },
        $unset: { deletedAt: 1, deletedBy: 1 },
      },
      { new: true },
    );

    if (!unit) {
      return res.status(404).json({ message: "Deleted unit not found" });
    }

    return res.status(200).json({
      message: "Unit restored successfully",
    });
  } catch (error) {
    next(error);
  }
};

const fetchSimpleUnits = async (req, res, next) => {
  try {
    const companyId = req.company;
    const units = await Unit.find({
      company: companyId,
      isActive: true,
      isDeleted: { $ne: true },
    })
      //const units = await Unit.find({ company: companyId })
      .populate([{ path: "building", select: "buildingName" }])
      .lean()
      .exec();

    const coworkingClients = await CoworkingClient.find({
      company: companyId,
      unit: { $exists: true, $ne: null },
    })
      .select("unit")
      .lean()
      .exec();

    const unitClientCountMap = coworkingClients.reduce((acc, client) => {
      const unitId = client?.unit?.toString?.();
      if (!unitId) return acc;
      acc[unitId] = (acc[unitId] || 0) + 1;
      return acc;
    }, {});
    const newResponse = units.map((unit) => ({
      ...unit,
      coworkingClientsCount: unitClientCountMap[unit?._id?.toString?.()] || 0,
    }));

    // const newResponse = units.map((unit) => {
    //   return {
    //     ...unit,
    //     coworkingClientsCount:
    //       coworkingClients.filter(
    //         (client) => client.unit?._id.toString() === unit?._id.toString(),
    //       ).length || 0,
    //   };
    // });

    return res.status(200).json(newResponse);
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
          { new: true },
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

const deleteBuilding = async (req, res, next) => {
  try {
    const { buildingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return res.status(400).json({ message: "Invalid work location ID" });
    }

    const building = await Building.findOne({
      _id: buildingId,
      company: req.company,
    });
    if (!building) {
      return res.status(404).json({ message: "Work location not found" });
    }

    if (!(await isTechDepartmentUser(req.user))) {
      if (building.isDeleted) {
        return res.status(400).json({
          message: "Work location is already deleted",
        });
      }

      building.isDeleted = true;
      building.isActive = false;
      building.deletedAt = new Date();
      building.deletedBy = req.user;
      await building.save();

      return res.status(200).json({
        message: "Work location deleted successfully",
        deletionType: "soft",
      });
    }

    const dependencies = await Promise.all([
      Unit.exists({ building: building._id }),
      CoworkingClient.exists({ building: building._id }),
      VirtualOfficeClient.exists({ building: building._id }),
      Visitor.exists({ building: building._id }),
      Printout.exists({ location: building._id }),
    ]);
    if (dependencies.some(Boolean)) {
      return res.status(409).json({
        message:
          "This work location has linked units or records and cannot be permanently deleted",
      });
    }

    await Company.updateOne(
      { _id: req.company },
      { $pull: { workLocations: building._id } },
    );
    await building.deleteOne();

    return res.status(200).json({
      message: "Work location permanently deleted successfully",
      deletionType: "permanent",
    });
  } catch (error) {
    next(error);
  }
};

const restoreBuilding = async (req, res, next) => {
  try {
    const { buildingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return res.status(400).json({ message: "Invalid work location ID" });
    }

    if (!(await isTechDepartmentUser(req.user))) {
      return res.status(403).json({
        message: "Only Tech Department users can restore work locations",
      });
    }

    const building = await Building.findOneAndUpdate(
      { _id: buildingId, company: req.company, isDeleted: true },
      {
        $set: { isDeleted: false, isActive: true },
        $unset: { deletedAt: 1, deletedBy: 1 },
      },
      { new: true },
    );
    if (!building) {
      return res.status(404).json({
        message: "Deleted work location not found",
      });
    }

    return res.status(200).json({
      message: "Work location restored successfully",
    });
  } catch (error) {
    next(error);
  }
};

const fetchBuildings = async (req, res, next) => {
  try {
    const company = req.company;
    const includeDeleted =
      req.query.includeDeleted === "true" &&
      (await isTechDepartmentUser(req.user));
    const buildings = await Building.find({
      company,
      ...(!includeDeleted && { isDeleted: { $ne: true } }),
    })
      .populate(
        "deletedBy",
        "firstName lastName employeeName name email",
      )
      .lean()
      .exec();
    return res.status(200).json(buildings);
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
  fetchBuildings,
  assignPrimaryUnit,
  updateUnit,
  deleteUnit,
  restoreUnit,
  fetchSimpleUnits,
  editBuilding,
  deleteBuilding,
  restoreBuilding,
};
