const Unit = require("../../models/locations/Unit");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const mongoose = require("mongoose");
const Desk = require("../../models/sales/Desk");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const {
  handleFileDelete,
  handleFileUpload,
} = require("../../config/cloudinaryConfig");
const sharp = require("sharp");
const ClientService = require("../../models/sales/ClientService");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const TestCoworkingClient = require("../../models/sales/TestCoworkingClient");

const createCoworkingClient = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Onboard CoworkingClient";
  const logSourceKey = "client";
  const { user, ip, company } = req;

  try {
    const {
      clientName,
      email,
      phone,
      sector,
      hoCity,
      hoState,
      unit,
      cabinDesks,
      openDesks,
      ratePerOpenDesk,
      ratePerCabinDesk,
      annualIncrement,
      perDeskMeetingCredits,
      totalMeetingCredits,
      startDate,
      endDate,
      lockinPeriod,
      rentDate,
      nextIncrement,
      localPocName,
      localPocEmail,
      localPocPhone,
      hOPocName,
      hOPocEmail,
      hOPocPhone,
      bookingType,
      clientInvoiceName,
    } = req.body;

    const clientExists = await CoworkingClient.findOne({ clientName });
    if (clientExists) {
      throw new CustomError(
        "CoworkingClient already exists",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(unit)) {
      throw new CustomError(
        "Invalid unit ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    const unitExists = await Unit.findOne({ _id: unit });
    if (!unitExists) {
      throw new CustomError(
        "Unit doesn't exist",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const coworkingService = await ClientService.findOne({
      serviceName: "Co-working",
    });

    if (!coworkingService) {
      throw new CustomError(
        "Coworking service doesn't exists",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (
      !clientName ||
      !sector ||
      !hoCity ||
      !hoState ||
      !ratePerOpenDesk ||
      !ratePerCabinDesk ||
      !annualIncrement ||
      !startDate ||
      !endDate ||
      !lockinPeriod ||
      !rentDate ||
      !nextIncrement ||
      !localPocName ||
      !localPocEmail ||
      !localPocPhone ||
      !hOPocName ||
      !hOPocEmail ||
      !hOPocPhone
    ) {
      throw new CustomError(
        "All required fields must be provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const parsedRentDate = new Date(rentDate);

    if (isNaN(parsedRentDate.getTime())) {
      return res.status(400).json({ message: "Invalid rent date" });
    }

    const bookedDesks = cabinDesks + openDesks;
    if (
      bookedDesks < 1 ||
      ratePerOpenDesk <= 0 ||
      ratePerCabinDesk <= 0 ||
      annualIncrement < 0
    ) {
      throw new CustomError(
        "Invalid numerical values",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new CustomError(
        "Start date must be before end date",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const client = new CoworkingClient({
      company,
      clientName,
      email,
      phone,
      service: coworkingService._id,
      sector,
      hoCity,
      hoState,
      unit,
      cabinDesks,
      openDesks,
      totalDesks: bookedDesks,
      ratePerOpenDesk,
      ratePerCabinDesk,
      annualIncrement,
      perDeskMeetingCredits,
      totalMeetingCredits,
      startDate,
      endDate,
      lockinPeriod,
      rentDate: parsedRentDate,
      nextIncrement,
      hOPoc: {
        name: hOPocName,
        email: hOPocEmail,
        phone: hOPocPhone,
      },
      localPoc: {
        name: localPocName,
        email: localPocEmail,
        phone: localPocPhone,
      },
      bookingType,
      clientInvoiceName,
    });

    const totalDesks = unitExists.cabinDesks + unitExists.openDesks;
    const availableDesks = totalDesks - bookedDesks;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    const bookingExists = await Desk.findOne({
      unit,
      month: { $gte: startOfMonth, $lt: endOfMonth },
    });

    let newbooking = null;

    if (bookingExists) {
      const totalBookedDesks = bookedDesks + bookingExists.bookedDesks;
      await Desk.findOneAndUpdate(
        { _id: bookingExists._id },
        {
          bookedDesks: totalBookedDesks,
          availableDesks: totalDesks - totalBookedDesks,
        },
      );
    } else {
      const booking = new Desk({
        unit,
        bookedDesks,
        availableDesks,
        month: startDate,
        company,
      });

      newbooking = await booking.save();
    }

    await client.save();

    return res
      .status(201)
      .json({ message: "CoworkingClient onboarded successfully" });
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

const getCoworkingClients = async (req, res, next) => {
  try {
    const { company } = req;
    const { coworkingclientid, unitId, active } = req.query;

    if (
      coworkingclientid &&
      !mongoose.Types.ObjectId.isValid(coworkingclientid)
    ) {
      return res.status(400).json({ message: "Invalid client ID format" });
    }

    if (unitId && !mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid unit ID format" });
    }

    const units = await Unit.find({ company }).populate({
      path: "building",
      select: "buildingName",
    });

    if (!units) {
      return res.status(400).json({ message: "No unit found" });
    }

    let query = { company };

    if (coworkingclientid) {
      query = { _id: coworkingclientid };
    } else if (unitId) {
      query.unit = unitId;
    } else if (active) {
      query.isActive = active === "true" ? true : false;
    }

    const populateOptions = [
      {
        path: "unit",
        select: "_id unitName unitNo cabinDesks openDesks",
        populate: {
          path: "building",
          select: "_id buildingName fullAddress",
        },
      },
      { path: "service", select: "_id serviceName description" },
    ];

    const clients = await CoworkingClient.find(query)
      .populate(populateOptions)
      .lean()
      .exec();

    if (!clients?.length) {
      return res.status(404).json({ message: "No clients found" });
    }
    const members = await CoworkingMembers.find({
      company,
      client: { $ne: null },
    })
      .populate([
        { path: "client", select: "clientName email" },
        { path: "unit", select: "unitName unitNo" },
      ])
      .lean()
      .exec();

    const clientsWithMembers = clients.map((client) => {
      return {
        ...client,
        members: members.filter(
          (member) =>
            member?.client?._id?.toString() === client?._id?.toString(),
        ),
      };
    });

    res.status(200).json(clientsWithMembers);
  } catch (error) {
    next(error);
  }
};

const getCoworkingClientRevenues = async (req, res, next) => {
  try {
    const { coworkingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(coworkingId)) {
      return res.status(400).json({ message: "The coworking id is invalid" });
    }
    const coworkingRevenue = await CoworkingRevenue.find({
      clients: coworkingId,
    })
      .lean()
      .exec();

    if (!coworkingRevenue?.length) {
      return res.status(200).json([]);
    }
    return res.status(200).json(coworkingRevenue);
  } catch (error) {
    next(error);
  }
};

const updateCoworkingClient = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Edit CoworkingClient";
  const logSourceKey = "client";

  const { user, ip, company } = req;

  try {
    const { clientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      throw new CustomError(
        "Invalid client ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const existingClient = await CoworkingClient.findOne({
      _id: clientId,
      company,
    });

    if (!existingClient) {
      throw new CustomError(
        "Client not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (typeof req.body.isActive === "boolean" && req.body.isActive === false) {
      const updateClientMembers = await CoworkingMembers.updateMany(
        {
          client: clientId,
        },
        {
          isActive: req.body.isActive,
        },
      );

      if (!updateClientMembers) {
        return res.status(400).json({ messages: "Client members not found" });
      }
    }

    const {
      clientName,
      service,
      unit,
      cabinDesks = 0,
      openDesks = 0,
      ratePerOpenDesk,
      ratePerCabinDesk,
      annualIncrement,
      startDate,
      endDate,
      hOPocName,
      hOPocEmail,
      hOPocPhone,
      localPocName,
      localPocEmail,
      localPocPhone,
      clientInvoiceName,
      bookingType,
      isActive,
    } = req.body;

    // ✅ Duplicate name check (excluding self)
    if (clientName) {
      const nameExists = await CoworkingClient.findOne({
        clientName,
        _id: { $ne: clientId },
      });

      if (nameExists) {
        throw new CustomError(
          "Client with this name already exists",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // ✅ Validate unit if changed
    if (unit) {
      if (!mongoose.Types.ObjectId.isValid(unit)) {
        throw new CustomError(
          "Invalid unit ID",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      const unitExists = await Unit.findById(unit);
      if (!unitExists) {
        throw new CustomError(
          "Unit doesn't exist",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // ✅ Validate service if changed
    if (service) {
      if (!mongoose.Types.ObjectId.isValid(service)) {
        throw new CustomError(
          "Invalid service ID",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      const serviceExists = await ClientService.findById(service);
      if (!serviceExists) {
        throw new CustomError(
          "Service doesn't exist",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // ✅ Numeric validations
    const newBookedDesks = Number(cabinDesks) + Number(openDesks);

    if (
      req.body.ratePerOpenDesk !== undefined &&
      req.body.ratePerOpenDesk <= 0
    ) {
      return res.status(400).json({ message: "Invalid ratePerOpenDesk" });
    }

    if (
      req.body.ratePerCabinDesk !== undefined &&
      req.body.ratePerCabinDesk <= 0
    ) {
      return res.status(400).json({ message: "Invalid ratePerCabinDesk" });
    }

    if (
      req.body.annualIncrement !== undefined &&
      req.body.annualIncrement < 0
    ) {
      return res.status(400).json({ message: "Invalid annualIncrement" });
    }

    if (req.body.rentDate) {
      const parsedRentDate = new Date(req.body.rentDate);
      req.body.rentDate = parsedRentDate;

      if (isNaN(parsedRentDate.getTime())) {
        console.log("error on rent date");
        return res.status(400).json({ message: "Invalid rent date" });
      }
    }

    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
        return res.status(400).json({
          message: "Start date must be before end date",
        });
      }
    }

    // 🔥 DESK ADJUSTMENT LOGIC
    const oldBookedDesks = existingClient.totalDesks;
    const deskDifference = newBookedDesks - oldBookedDesks;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    const deskRecord = await Desk.findOne({
      unit: unit || existingClient.unit,
      month: { $gte: startOfMonth, $lt: endOfMonth },
    });

    if (deskRecord) {
      const updatedBooked = deskRecord.bookedDesks + deskDifference;

      if (updatedBooked < 0) {
        throw new CustomError(
          "Desk calculation error",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      deskRecord.bookedDesks = updatedBooked;
      deskRecord.availableDesks = deskRecord.availableDesks - deskDifference;

      await deskRecord.save();
    }

    // ✅ Whitelist update
    const allowedFields = [
      "clientName",
      "email",
      "phone",
      "service",
      "sector",
      "hoCity",
      "hoState",
      "unit",
      "cabinDesks",
      "openDesks",
      "ratePerOpenDesk",
      "ratePerCabinDesk",
      "annualIncrement",
      "perDeskMeetingCredits",
      "totalMeetingCredits",
      "startDate",
      "endDate",
      "lockinPeriod",
      "rentDate",
      "nextIncrement",
      "clientInvoiceName",
      "bookingType",
      "isActive",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    updateData.totalDesks = newBookedDesks;

    // nested POCs
    updateData.hOPoc = {
      name: hOPocName,
      email: hOPocEmail,
      phone: hOPocPhone,
    };

    updateData.localPoc = {
      name: localPocName,
      email: localPocEmail,
      phone: localPocPhone,
    };

    const oldState = existingClient.toObject();

    existingClient.set(updateData);

    await existingClient.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "CoworkingClient updated successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: existingClient._id,
      changes: {
        before: oldState,
        after: existingClient,
        deskAdjustment: deskDifference,
      },
    });

    return res.status(200).json({
      message: "CoworkingClient updated successfully",
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

const updateClientStatus = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const client = await CoworkingClient.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.isActive = isActive;
    await client.save();

    return res.status(200).json({
      message: `Client marked as ${isActive ? "Active" : "Inactive"}`,
      data: client,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const deleteCoworkingClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID provided" });
    }
    const client = await CoworkingClient.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!client) {
      return res.status(404).json({ message: "CoworkingClient not found" });
    }
    res
      .status(200)
      .json({ message: "CoworkingClient deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

const bulkInsertCoworkingClients = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    // Fetch units
    const units = await Unit.find({ company }).lean().exec();
    const unitMap = new Map(units.map((unit) => [unit.unitNo, unit._id]));

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    const getClientService = await ClientService.findOne({
      serviceName: "Co-working",
      company,
    }).lean();

    let coWorkingClients = [];
    let unitNotFound = [];

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const { "Client Name": clientName, Unit: unitNo } = row;

        if (!clientName) return; // skip empty rows

        let unitId = null;

        // Unit is OPTIONAL
        if (unitNo) {
          unitId = unitMap.get(unitNo);

          if (!unitId) {
            unitNotFound.push({
              clientName,
              unitNo,
              reason: "Unit not found",
            });
            return;
          }
        }

        const newClientObj = {
          company,
          clientName: clientName.trim(),
          service: getClientService?._id,
          isActive: true,
        };

        if (unitId) {
          newClientObj.unit = unitId;
        }

        coWorkingClients.push(newClientObj);
      })

      .on("end", async () => {
        try {
          if (coWorkingClients.length === 0) {
            return res.status(400).json({
              message: "No valid clients found in the file",
              unitNotFound,
            });
          }

          // ----------------------------
          // 1️⃣ Remove CSV duplicates
          // ----------------------------
          const uniqueMap = new Map();
          const csvDuplicates = [];

          coWorkingClients.forEach((client) => {
            const key = `${client.clientName}_${client.unit?.toString() || "NO_UNIT"}`;

            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, client);
            } else {
              csvDuplicates.push({
                clientName: client.clientName,
                unit: client.unit || null,
                reason: "Duplicate in CSV",
              });
            }
          });

          const uniqueClients = Array.from(uniqueMap.values());

          // ----------------------------
          // 2️⃣ Fetch ALL possible matches from DB
          // ----------------------------
          const existingClients = await CoworkingClient.find({
            company,
            clientName: { $in: uniqueClients.map((c) => c.clientName) },
          })
            .select("clientName unit")
            .lean();

          const existingSet = new Set(
            existingClients.map(
              (c) => `${c.clientName}_${c.unit?.toString() || "NO_UNIT"}`,
            ),
          );

          // ----------------------------
          // 3️⃣ Filter DB duplicates
          // ----------------------------
          const dbDuplicates = [];

          const finalClients = uniqueClients.filter((client) => {
            const key = `${client.clientName}_${client.unit?.toString() || "NO_UNIT"}`;

            if (existingSet.has(key)) {
              dbDuplicates.push({
                clientName: client.clientName,
                unit: client.unit || null,
                reason: "Already exists in database",
              });
              return false;
            }

            return true;
          });

          // ----------------------------
          // 4️⃣ Insert Remaining
          // ----------------------------
          if (finalClients.length > 0) {
            await CoworkingClient.insertMany(finalClients);
          }

          return res.status(201).json({
            message: `${finalClients.length} clients inserted successfully`,
            insertedCount: finalClients.length,
            skippedCount:
              unitNotFound.length + csvDuplicates.length + dbDuplicates.length,
            unitNotFound,
            csvDuplicates,
            dbDuplicates,
          });
        } catch (err) {
          next(err);
        }
      })

      .on("error", (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

const uploadClientOccupancyImage = async (req, res, next) => {
  const logPath = "sales/salesLog";
  const logAction = "Upload Unit Image";
  const logSourceKey = "client";
  const { clientId, imageType } = req.body;
  const file = req.file;
  const companyId = req.company;
  const user = req.user;
  const ip = req.ip;

  try {
    // Validate that a file was uploaded
    if (!file) {
      throw new CustomError(
        "No image provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Validate required fields
    if (!clientId || !companyId || !imageType) {
      throw new CustomError(
        "Company ID, Location ID, Client ID, and Image Type are required",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Validate image type
    if (!["occupiedImage"].includes(imageType)) {
      throw new CustomError(
        "Invalid image type",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Find the client document
    const client = await CoworkingClient.findById({ _id: clientId });
    if (!client) {
      throw new CustomError(
        "Client doesn't exist",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Find the unit with building and company details
    const unit = await Unit.findById({ _id: client.unit }).populate([
      { path: "building", select: "buildingName" },
      { path: "company", select: "companyName" },
    ]);
    if (!unit) {
      throw new CustomError("Unit not found", logPath, logAction, logSourceKey);
    }

    // Delete the existing image if it exists
    if (client[imageType] && client[imageType].imageId) {
      await handleFileDelete(client[imageType].imageId);
    }

    let imageDetails = null;
    try {
      const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;
      const folderPath = `${unit.company.companyName}/clients/co-working/${unit.building.buildingName}/${unit.unitName}/${client.clientName}`;
      const uploadResult = await handleFileUpload(base64Image, folderPath);
      if (!uploadResult.public_id) {
        throw new Error("Failed to upload image");
      }
      imageDetails = {
        imageId: uploadResult.public_id,
        imageUrl: uploadResult.secure_url,
      };
    } catch (uploadError) {
      throw new CustomError(
        "Error processing image before upload",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Update the client document with the new image details
    client[imageType] = imageDetails;

    const updatedClient = await CoworkingClient.findByIdAndUpdate(
      { _id: clientId },
      { $set: { [imageType]: imageDetails } },
      { new: true },
    );

    if (!updatedClient || !updatedClient[imageType]) {
      throw new CustomError(
        "Failed to upload the image",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Log the successful update
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Image uploaded successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: companyId,
      sourceKey: logSourceKey,
      sourceId: client._id,
      changes: { [imageType]: imageDetails },
    });

    return res.status(200).json({
      message: "Image uploaded and work location updated successfully",
      unitImage: { [imageType]: imageDetails },
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

const onboardedNames = [
  "WONO",
  "WONOCO PRIVATE LIMITED",
  "SQUADSTACK",
  "SQUADRUN SOLUTIONS PVT LTD",
  "BDO",
  "BDO INDIA LIMITED LIABILITY PARTNERSHIP",
  "MSKA & ASSOCIATES",
  "MSKA & ASSOCIATES",
  "AXIS FINANCE",
  "AXIS FINANCE LIMITED",
  "LGT",
  "LGT WEALTH INDIA PVT.LTD.",
  "RAKHEE VERMA",
  "RAKHEE VERMA",
  "BENCHMARK HOLIDAYS",
  "BENCHMARK HOLIDAYS",
  "TEDX",
  "TEDX",
  "CMR SURGICAL",
  "CMR SURGICAL",
  "AVIDANT",
  "AVIDANT PROPERTIES LLP",
  "BUILD HIGH INFRA",
  "BUILD HIGH INFRA",
  "APICES",
  "APICES",
  "INFUSE",
  "INFUSE NUTRIENTE PRIVATE LIMITED",
  "AFOUR",
  "AFOUR TECHNOLOGIES PRIVATE LIMITED",
  "WATERFIELD ADVISORS",
  "WATERFIELD ADVISORS PRIVATE LIMITED",
  "ZIMETRICS",
  "ZIMETRICS TECHNOLOGIES PRIVATE LIMITED",
  "IC PARTNERS",
  "IC PARTNERS MANAGEMENT CONSULTANTS PRIVATE LIMITED",
  "LANCESOFT",
  "LANCESOFT INDIA PRIVATE LIMITED",
  "TURTLEMINT",
  "FINTECH BLUE SOLUTION PRIVATE LIMITED",
  "COLLISON",
  "COLLISON SERVICES INDIA LLP",
  "NUVAMA",
  "NUVAMA WEALTH & INVESTMENT LTD",
  "HOUSING. COM",
  "LOCON SOLUTIONS PRIVATE LIMITED",
  "CRAYON",
  "CRAYON SOFTWARE EXPERTS INDIA PRIVATE LIMITED",
  "TECH GIG EXPORT",
  "TECH GIG EXPORT",
  "BRIJESH MORAJKAR",
  "BRIJESH MORAJKAR",
  "RAKESH BUSINESS SOLUTION",
  "RAKESH BUSINESS SOLUTION",
  "MIHIR",
  "MIHIR....",
  "ZOMATO",
  "ZOMATO INDIA LIMITED",
  "TIMES PRO",
  "BENNETT & COLEMAN LIMITED",
  "NAUKRI/99 ACRES",
  "INFOEDGE",
  "TVS CREDIT",
  "TVS CREDIT",
  "AMOL ARONDEKAR",
  "AMOL ARONDEKAR",
  "YUKSEL",
  "YUKSEL PROJECT INDIA LIMITED",
  "EVOLUTION INSIGHT",
  "EVOLUTION INSIGHT",
  "ALD AUTOMOTIVE",
  "ALD AUTOMOTIVE",
].map((name) => name.trim().toLowerCase()); // Normalize

module.exports = {
  createCoworkingClient,
  updateCoworkingClient,
  updateClientStatus,
  deleteCoworkingClient,
  getCoworkingClients,
  bulkInsertCoworkingClients,
  uploadClientOccupancyImage,
  getCoworkingClientRevenues,
};
