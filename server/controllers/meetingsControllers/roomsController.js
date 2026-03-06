const Room = require("../../models/meetings/Rooms");
const idGenerator = require("../../utils/idGenerator");
const User = require("../../models/hr/UserData");
const sharp = require("sharp");
const mongoose = require("mongoose");
const {
  handleFileUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const Unit = require("../../models/locations/Unit");

const addRoom = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "meetings/MeetingLog";
  const logAction = "Add Room";
  const logSourceKey = "room";

  try {
    const {
      name,
      seats,
      description,
      location,
      perHourCredit,
      perHourPrice,
      dailyHours,
      monthlyHours,
      perSeatPrice,
      perHourGstPrice,
    } = req.body;

    if (!name || !seats || !description || !location) {
      throw new CustomError(
        "All required fields must be provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const foundUser = await User.findById(user)
      .select("company")
      .populate({
        path: "company",
        select: "companyName workLocations",
      })
      .lean()
      .exec();

    if (!foundUser || !foundUser.company) {
      throw new CustomError(
        "Unauthorized or company not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const isValidLocation = await Unit.findById({ _id: location })
      .lean()
      .exec();

    if (!isValidLocation) {
      throw new CustomError(
        "Invalid location. Must be a valid company work location.",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const roomId = idGenerator("R");

    let imageId;
    let imageUrl;

    if (req.file) {
      const file = req.file;
      const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();

      const base64Image = `data:irmage/webp;base64,${buffer.toString(
        "base64",
      )}`;
      const uploadResult = await handleFileUpload(
        base64Image,
        `${foundUser.company.companyName}/rooms`,
      );

      imageId = uploadResult.public_id;
      imageUrl = uploadResult.secure_url;
    }

    const room = new Room({
      roomId,
      name,
      seats,
      description,
      location,
      perHourCredit: Number(perHourCredit),
      perHourPrice: Number(perHourPrice),
      dailyHours: Number(dailyHours),
      monthlyHours: Number(monthlyHours),
      perSeatPrice: Number(perSeatPrice),
      perHourGstPrice: Number(perHourGstPrice),
      assignedAssets: [],
      company: company._id,
      image: {
        id: imageId,
        url: imageUrl,
      },
    });

    const savedRoom = await room.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Room added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedRoom._id,
      changes: { roomId, name, seats, description, location },
    });

    res.status(201).json({
      message: "Room added successfully",
      room: savedRoom,
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

const getRooms = async (req, res, next) => {
  try {
    // Fetch all rooms, including the assigned assets data
    const rooms = await Room.find()
      .populate("assignedAssets")
      .populate({
        path: "location",
        select: "_id unitName unitNo",
        populate: { path: "building", select: "_id buildingName fullAddress" },
      });

    // Send the response with the fetched rooms
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

const getSingleRoom = async (req, res, next) => {
  const { roomName } = req.params;

  try {
    const room = await Room.findOne({ name: roomName }).populate({
      path: "location",
      select: "_id unitName unitNo",
      populate: { path: "building", select: "_id buildingName fullAddress" },
    });

    // Send the response with the fetched room
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "meetings/MeetingLog";
  const logAction = "Update Room";
  const logSourceKey = "room";

  try {
    const { id: roomId } = req.params;
    const {
      name,
      description,
      seats,
      location,
      isActive,
      perHourCredit,
      perHourPrice,
      dailyHours,
      monthlyHours,
      perSeatPrice,
      perHourGstPrice,
    } = req.body;

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      throw new CustomError(
        "Invalid Room ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const room = await Room.findById(roomId);
    if (!room) {
      throw new CustomError("Room not found", logPath, logAction, logSourceKey);
    }

    if (location) {
      const isValidLocation = await Unit.findById(location).lean().exec();
      if (!isValidLocation) {
        throw new CustomError(
          "Invalid location. Must be a valid company work location.",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    const updatedFields = {};

    // Handle individual field updates
    if (Object.hasOwn(req.body, "name") && req.body.name !== room.name) {
      const nameExists = await Room.findOne({
        name: req.body.name,
        _id: { $ne: roomId },
      });

      if (nameExists) {
        return res
          .status(400)
          .json({ message: "The name is already owned by a different room" });
      }
      updatedFields.name = req.body.name;
    }

    if (
      Object.hasOwn(req.body, "description") &&
      req.body.description !== room.description
    ) {
      updatedFields.description = req.body.description;
    }

    if (Object.hasOwn(req.body, "seats") && req.body.seats !== room.seats) {
      updatedFields.seats = req.body.seats;
    }

    if (
      Object.hasOwn(req.body, "location") &&
      req.body.location !== String(room.location)
    ) {
      updatedFields.location = req.body.location;
    }

    if (Object.hasOwn(req.body, "isActive")) {
      updatedFields.isActive =
        req.body.isActive === true || req.body.isActive === "true";
    }

    if (
      Object.hasOwn(req.body, "perHourCredit") &&
      Number(req.body.perHourCredit) !== room.perHourCredit
    ) {
      updatedFields.perHourCredit = Number(req.body.perHourCredit);
    }

    if (
      Object.hasOwn(req.body, "perHourPrice") &&
      Number(req.body.perHourPrice) !== room.perHourPrice
    ) {
      updatedFields.perHourPrice = Number(req.body.perHourPrice);
    }

    if (
      Object.hasOwn(req.body, "dailyHours") &&
      Number(req.body.dailyHours) !== room.dailyHours
    ) {
      updatedFields.dailyHours = Number(req.body.dailyHours);
    }

    if (
      Object.hasOwn(req.body, "monthlyHours") &&
      Number(req.body.monthlyHours) !== room.monthlyHours
    ) {
      updatedFields.monthlyHours = Number(req.body.monthlyHours);
    }

    if (
      Object.hasOwn(req.body, "perSeatPrice") &&
      Number(req.body.perSeatPrice) !== room.perSeatPrice
    ) {
      updatedFields.perSeatPrice = Number(req.body.perSeatPrice);
    }

    if (
      Object.hasOwn(req.body, "perHourGstPrice") &&
      Number(req.body.perHourGstPrice) !== room.perHourGstPrice
    ) {
      updatedFields.perHourGstPrice = Number(req.body.perHourGstPrice);
    }

    // Handle image update
    if (req.file) {
      const file = req.file;
      const buffer = await sharp(file.buffer)
        .resize(800, 800, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;

      if (room.image?.id) {
        await handleFileDelete(room.image.id);
      }

      const uploadResult = await handleFileUpload(base64Image, "rooms");
      updatedFields.image = {
        id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    // Update only if there are changes
    if (Object.keys(updatedFields).length === 0) {
      return res.status(200).json({ message: "No changes to update.", room });
    }

    Object.assign(room, updatedFields);
    const updatedRoom = await room.save({ validateBeforeSave: false });

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Room updated successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedRoom._id,
      changes: updatedFields,
    });

    return res.status(200).json({
      message: "Room updated successfully.",
      room: updatedRoom,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

module.exports = { addRoom, getRooms, getSingleRoom, updateRoom };
