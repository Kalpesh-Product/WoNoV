const Room = require("../../models/meetings/Rooms");
const idGenerator = require("../../utils/idGenerator");
const User = require("../../models/hr/UserData");
const sharp = require("sharp");
const mongoose = require("mongoose");
const { handleFileUpload, handleFileDelete } = require("../../config/s3Config");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const Unit = require("../../models/locations/Unit");

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const MAX_ROOM_IMAGES = 5;
const MAX_ROOM_IMAGE_SIZE = 5 * 1024 * 1024;
const ROOM_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const getRoomUploadFiles = (req) => [
  ...(req.files?.room || []),
  ...(req.files?.rooms || []),
];

const validateRoomImages = (files) => {
  if (files.length > MAX_ROOM_IMAGES) {
    throw new Error(`A maximum of ${MAX_ROOM_IMAGES} room images is allowed`);
  }

  files.forEach((file) => {
    if (!ROOM_IMAGE_TYPES.has(file.mimetype)) {
      throw new Error("Only JPG, PNG, and WEBP room images are allowed");
    }
    if (file.size > MAX_ROOM_IMAGE_SIZE) {
      throw new Error("Each room image must be 5 MB or smaller");
    }
  });
};

const uploadRoomImages = async (files, companyName) =>
  Promise.all(
    files.map(async (file) => {
      const buffer = await sharp(file.buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;
      const uploadResult = await handleFileUpload(
        base64Image,
        `${companyName}/rooms`,
      );

      return {
        id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }),
  );

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
      isActive,
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
    console.log("Found user with company:", foundUser.company);

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

    const roomImageFiles = getRoomUploadFiles(req);
    validateRoomImages(roomImageFiles);
    const uploadedImages = await uploadRoomImages(
      roomImageFiles,
      foundUser.company.companyName,
    );

    const parsedPerHourCredit = parseOptionalNumber(perHourCredit);
    const parsedPerHourPrice = parseOptionalNumber(perHourPrice);
    const parsedDailyHours = parseOptionalNumber(dailyHours);
    const parsedMonthlyHours = parseOptionalNumber(monthlyHours);
    const parsedPerSeatPrice = parseOptionalNumber(perSeatPrice);
    const parsedPerHourGstPrice = parseOptionalNumber(perHourGstPrice);

    const room = new Room({
      roomId,
      name,
      seats,
      description,
      location,
      perHourCredit: parsedPerHourCredit,
      perHourPrice: parsedPerHourPrice,
      dailyHours: parsedDailyHours,
      monthlyHours: parsedMonthlyHours,
      perSeatPrice: parsedPerSeatPrice,
      perHourGstPrice: parsedPerHourGstPrice,
      isActive:
        isActive === undefined
          ? true
          : isActive === true || isActive === "true",
      assignedAssets: [],
      company: company._id,
      ...(uploadedImages.length > 0
        ? { image: uploadedImages[0], images: uploadedImages }
        : {}),
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

    const parsedPerHourCredit = parseOptionalNumber(req.body.perHourCredit);

    if (
      Object.hasOwn(req.body, "perHourCredit") &&
      parsedPerHourCredit !== undefined &&
      parsedPerHourCredit !== room.perHourCredit
    ) {
      updatedFields.perHourCredit = parsedPerHourCredit;
    }
    const parsedPerHourPrice = parseOptionalNumber(req.body.perHourPrice);
    if (
      Object.hasOwn(req.body, "perHourPrice") &&
      parsedPerHourPrice !== undefined &&
      parsedPerHourPrice !== room.perHourPrice
    ) {
      updatedFields.perHourPrice = parsedPerHourPrice;
    }

    const parsedDailyHours = parseOptionalNumber(req.body.dailyHours);
    if (
      Object.hasOwn(req.body, "dailyHours") &&
      parsedDailyHours !== undefined &&
      parsedDailyHours !== room.dailyHours
    ) {
      updatedFields.dailyHours = parsedDailyHours;
    }

    const parsedMonthlyHours = parseOptionalNumber(req.body.monthlyHours);
    if (
      Object.hasOwn(req.body, "monthlyHours") &&
      parsedMonthlyHours !== undefined &&
      parsedMonthlyHours !== room.monthlyHours
    ) {
      updatedFields.monthlyHours = parsedMonthlyHours;
    }
    const parsedPerSeatPrice = parseOptionalNumber(req.body.perSeatPrice);
    if (
      Object.hasOwn(req.body, "perSeatPrice") &&
      parsedPerSeatPrice !== undefined &&
      parsedPerSeatPrice !== room.perSeatPrice
    ) {
      updatedFields.perSeatPrice = parsedPerSeatPrice;
    }

    const parsedPerHourGstPrice = parseOptionalNumber(req.body.perHourGstPrice);

    if (
      Object.hasOwn(req.body, "perHourGstPrice") &&
      parsedPerHourGstPrice !== undefined &&
      parsedPerHourGstPrice !== room.perHourGstPrice
    ) {
      updatedFields.perHourGstPrice = parsedPerHourGstPrice;
    }

    const foundUser = await User.findById(user)
      .select("company")
      .populate({ path: "company", select: "companyName workLocations" })
      .lean()
      .exec();

    // Keep selected saved images, remove deselected ones, and append new uploads.
    const roomImageFiles = getRoomUploadFiles(req);
    validateRoomImages(roomImageFiles);
    const hasRetainedImages = Object.hasOwn(req.body, "retainedRoomImages");

    if (hasRetainedImages || roomImageFiles.length > 0) {
      const currentImages =
        Array.isArray(room.images) && room.images.length > 0
          ? room.images.map((image) => ({ id: image.id, url: image.url }))
          : room.image?.url
            ? [{ id: room.image.id, url: room.image.url }]
            : [];
      let requestedImages = currentImages;

      if (hasRetainedImages) {
        try {
          const parsedImages = JSON.parse(req.body.retainedRoomImages || "[]");
          requestedImages = Array.isArray(parsedImages) ? parsedImages : [];
        } catch {
          throw new Error("Invalid retained room images payload");
        }
      }

      const retainedImages = currentImages.filter((currentImage) =>
        requestedImages.some(
          (requestedImage) =>
            (currentImage.id && requestedImage.id === currentImage.id) ||
            requestedImage.url === currentImage.url,
        ),
      );
      const retainedKeys = new Set(
        retainedImages.map((image) => image.id || image.url),
      );
      const removedImages = currentImages.filter(
        (image) => !retainedKeys.has(image.id || image.url),
      );
      if (retainedImages.length + roomImageFiles.length > MAX_ROOM_IMAGES) {
        throw new Error(`A maximum of ${MAX_ROOM_IMAGES} room images is allowed`);
      }

      const uploadedImages = await uploadRoomImages(
        roomImageFiles,
        foundUser.company.companyName,
      );
      const nextImages = [...retainedImages, ...uploadedImages];

      await Promise.all(
        removedImages
          .filter((image) => image.id)
          .map((image) => handleFileDelete(image.id)),
      );

      updatedFields.images = nextImages;
      updatedFields.image = nextImages[0] || { id: null, url: null };
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
