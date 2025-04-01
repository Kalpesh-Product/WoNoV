const Room = require("../../models/meetings/Rooms");
const idGenerator = require("../../utils/idGenerator");
const User = require("../../models/hr/UserData");
const sharp = require("sharp");
const mongoose = require("mongoose");
const { handleFileUpload } = require("../../config/cloudinaryConfig");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const Unit = require("../../models/locations/Unit");

const addRoom = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "meetings/MeetingLog";
  const logAction = "Add Room";
  const logSourceKey = "room";

  try {
    const { name, seats, description, location } = req.body;

    if (!name || !seats || !description || !location) {
      throw new CustomError(
        "All required fields must be provided",
        logPath,
        logAction,
        logSourceKey
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
        logSourceKey
      );
    }

    const isValidLocation = await Unit.findOne({ _id: location }).lean().exec();

    if (!isValidLocation) {
      throw new CustomError(
        "Invalid location. Must be a valid company work location.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const roomId = idGenerator("R");

    let imageId;
    let imageUrl;

    if (req.file) {
      const file = req.file;
      const buffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const base64Image = `data:irmage/webp;base64,${buffer.toString(
        "base64"
      )}`;
      const uploadResult = await handleFileUpload(
        base64Image,
        `${foundUser.company.companyName}/rooms`
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
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

const updateRoom = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "meetings/MeetingLog";
  const logAction = "Update Room";
  const logSourceKey = "room";

  try {
    const { id: roomId } = req.params;
    const { name, description, seats } = req.body;

    if (!roomId) {
      throw new CustomError(
        "Room ID must be provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new CustomError(
        "Invalid Room ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Find the room to update
    const room = await Room.findOne({ _id: roomId });
    if (!room) {
      throw new CustomError("Room not found", logPath, logAction, logSourceKey);
    }

    // Keep track of the existing image
    let imageId = room.image?.id;
    let imageUrl = room.image?.url;

    // Check if a new file is provided
    if (req.file) {
      const file = req.file;

      // Process the image using Sharp
      const buffer = await sharp(file.buffer)
        .resize(800, 800, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;

      // Delete the current image in Cloudinary if it exists
      if (imageId) {
        await handleFileDelete(imageId);
      }

      // Upload the new image to Cloudinary
      const uploadResult = await handleFileUpload(base64Image, "rooms");
      imageId = uploadResult.public_id;
      imageUrl = uploadResult.secure_url;
    }

    // Only update fields if they were provided and changed
    const updatedFields = {};
    if (name && name !== room.name) updatedFields.name = name;
    if (description && description !== room.description) {
      updatedFields.description = description;
    }
    if (seats && seats !== room.seats) updatedFields.seats = seats;
    if (req.file) updatedFields.image = { id: imageId, url: imageUrl };

    Object.assign(room, updatedFields);

    const updatedRoom = await room.save();

    // Log the successful update
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Room updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedRoom._id,
      changes: updatedFields,
    });

    return res.status(200).json({
      message: "Room updated successfully.",
      room: updatedRoom,
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

module.exports = { addRoom, getRooms, updateRoom };
