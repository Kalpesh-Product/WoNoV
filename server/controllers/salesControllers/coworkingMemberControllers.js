const CoworkingClient = require("../../models/sales/CoworkingClient");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const CustomError = require("../../utils/customErrorlogs");
const { formatDate } = require("../../utils/formatDateTime");
const { createLog } = require("../../utils/moduleLogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const mongoose = require("mongoose");
const Unit = require("../../models/locations/Unit");
const TestCoworkingMember = require("../../models/sales/CoworkingMembers");

const createMember = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Onboard Coworking Client Member";
  const logSourceKey = "clientMember";
  const { user, ip, company } = req;

  try {
    const {
      name,
      designation,
      email,
      phone,
      bloodGroup,
      dob,
      emergencyName,
      emergencyNo,
      biometricStatus,
      client,
      dateOfJoining,
    } = req.body;

    if (!name || !client) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (client && !mongoose.Types.ObjectId.isValid(client)) {
      throw new CustomError(
        "Invalid client ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const clientExists = await CoworkingClient.findById(client);
    if (!clientExists) {
      return res.status(404).json({ message: "Client not found" });
    }

    const existing = await CoworkingMembers.findOne({ employeeName: name });
    if (existing) {
      throw new CustomError(
        "Client member already exists",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const newMember = new CoworkingMembers({
      employeeName: name,
      designation,
      email,
      mobileNo: phone,
      bloodGroup,
      dob,
      emergencyName,
      emergencyNo,
      dateOfJoining: dateOfJoining || new Date(),
      biometricStatus,
      client,
      company,
    });

    const savedMember = await newMember.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Coworking Client Member onboarded successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedMember._id,
      changes: {
        member: savedMember,
      },
    });

    return res
      .status(201)
      .json({ message: "Coworking client member onboarded successfully" });
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

const updateCoworkingMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    const existingMember = await CoworkingMembers.findById(memberId);

    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    const {
      name,
      designation,
      email,
      phone,
      bloodGroup,
      dob,
      emergencyName,
      emergencyNo,
      biometricStatus,
      client,
      dateOfJoining,
    } = req.body;

    // Validate client if provided
    if (client) {
      if (!mongoose.Types.ObjectId.isValid(client)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const clientExists = await CoworkingClient.findById(client);
      if (!clientExists) {
        return res.status(404).json({ message: "Client not found" });
      }
    }

    // Prevent duplicate name (excluding current member)
    if (name) {
      const duplicate = await CoworkingMembers.findOne({
        employeeName: name,
        _id: { $ne: memberId },
      });

      if (duplicate) {
        return res
          .status(400)
          .json({ message: "Client member with this name already exists" });
      }
    }

    // Update only provided fields
    existingMember.employeeName = name ?? existingMember.employeeName;
    existingMember.designation = designation ?? existingMember.designation;
    existingMember.email = email ?? existingMember.email;
    existingMember.mobileNo = phone ?? existingMember.mobileNo;
    existingMember.bloodGroup = bloodGroup ?? existingMember.bloodGroup;
    existingMember.dob = dob ?? existingMember.dob;
    existingMember.emergencyName =
      emergencyName ?? existingMember.emergencyName;
    existingMember.emergencyNo = emergencyNo ?? existingMember.emergencyNo;
    existingMember.biometricStatus =
      biometricStatus ?? existingMember.biometricStatus;
    existingMember.client = client ?? existingMember.client;
    existingMember.dateOfJoining =
      dateOfJoining ?? existingMember.dateOfJoining;

    await existingMember.save();

    return res.status(200).json({
      message: "Coworking client member updated successfully",
      data: existingMember,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const getAllMembers = async (req, res, next) => {
  try {
    const { client } = req.query;

    if (!client) {
      return res.status(400).json({ message: "Client ID is missing" });
    }

    // if (!service) {
    //   //service is a string
    //   return res.status(400).json({ message: "Service is missing" });
    // }

    if (!mongoose.Types.ObjectId.isValid(client)) {
      return res.status(400).json({ message: "Invalid client ID provided" });
    }
    s;

    const members = await CoworkingMembers.find({
      company,
      client,
    }).populate("client", "clientName service");

    if (!members) {
      return res.status(400).json({ message: "No Member found" });
    }

    return res.status(200).json(members);
  } catch (error) {
    next(error);
  }
};

const getMembersByUnit = async (req, res, next) => {
  try {
    const { company } = req;
    const { unitId, active } = req.query;

    if (!unitId) {
      return res.status(400).json({ message: "Unit is missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid unit ID provided" });
    }

    let query = { unit: unitId, company };

    if (active) {
      query.isActive = active === "true" ? true : false;
    }
    console.log("query client member unint (client)", query);
    const clients = await CoworkingClient.find(query).populate({
      path: "unit",
      select: "unitName unitNo openDesks cabinDesks clearImage occupiedImage",
    });

    const totalOccupiedDesks = clients.reduce(
      (acc, client) => acc + (client.openDesks + client.cabinDesks),
      0,
    );
    console.log("query client member unint (member)", query);

    const members = await CoworkingMembers.find(query)
      .populate([
        {
          path: "client",
          select: "clientName cabinDesks openDesks isActive",
        },
        {
          path: "unit",
          select:
            "unitName unitNo openDesks cabinDesks clearImage occupiedImage",
        },
      ])
      .lean()
      .exec();

    const clearImage = clients[0].unit.clearImage;
    const occupiedImage = clients[0].unit.occupiedImage;
    const totalDesks = clients[0].unit?.openDesks + clients[0].unit?.cabinDesks;

    const clientDetails = clients.map((client) => {
      let transformedMembers = [];
      if (members || members.length > 0) {
        const memberDetails = members.find((member) => {
          return member.client._id.toString() === client._id.toString();
        });
        if (memberDetails) {
          transformedMembers = {
            member: memberDetails.employeeName || "Unknown",
            date: formatDate(memberDetails.dob),
            email: memberDetails.email,
            mobileNo: memberDetails.mobileNo,
          };
        }
      }

      return {
        client: client.clientName,
        occupiedDesks: client.openDesks + client.cabinDesks,
        memberDetails: transformedMembers,
      };
    });

    const transformedClients = {
      clearImage,
      occupiedImage,
      totalDesks,
      totalOccupiedDesks,
      clientDetails,
    };
    return res.status(200).json(transformedClients);

    // const clientMap = new Map();

    // members.forEach((member) => {
    //   if (!member.client.isActive) return;

    //   const clientName = member.client?.clientName || "Unknown";
    //   const memberName = member.employeeName || "Unnamed";
    //   const formattedDate = formatDate(member.dob);

    //   if (!clientMap.has(clientName)) {
    //     clientMap.set(clientName, {
    //       client: clientName,
    //       occupiedDesks: 0,
    //       memberDetails: [],
    //     });
    //   }

    //   const clientEntry = clientMap.get(clientName);
    //   clientEntry.occupiedDesks =
    //     member.client.openDesks + member.client.cabinDesks;
    //   clientEntry.memberDetails.push({
    //     member: memberName,
    //     date: formattedDate,
    //     email: member.email,
    //     mobileNo: member.mobileNo,
    //   });
    // });

    // const clientDetails = Array.from(clientMap.values());

    // const totalDesks = members[0].unit?.openDesks + members[0].unit?.cabinDesks;
    // const clearImage = members[0].unit.clearImage;
    // const occupiedImage = members[0].unit.occupiedImage;

    // const transformMembersData = {
    //   clearImage,
    //   occupiedImage,
    //   totalDesks,
    //   totalOccupiedDesks,
    //   clientDetails,
    // };

    // return res.status(200).json(transformMembersData);
  } catch (error) {
    next(error);
  }
};

const getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params.id;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid memeber ID provided" });
    }

    const member = await CoworkingMembers.findById(memberId).populate(
      "client",
      "clientName service",
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

const getMemberByClient = async (req, res) => {
  try {
    const { clientId, active } = req.query;

    if (!clientId) {
      return res.status(400).json({ message: "clientId ID is missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "Invalid client ID provided" });
    }

    let query = { client: clientId };
    if (active) {
      query.isActive = active === "true" ? true : false;
    }
    console.log("query client member", query);
    const member = await CoworkingMembers.find(query)
      .populate("client", "clientName service")
      .select("employeeName email");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

const updateMemberStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const member = await CoworkingMembers.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.isActive = isActive;
    await member.save();

    return res.status(200).json({
      message: `Member marked as ${isActive ? "Active" : "Inactive"}`,
      data: member,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// const bulkInsertCoworkingMembers = async (req, res, next) => {
//   try {
//     const file = req.file;
//     const company = req.company;

//     const coworkingClients = await CoworkingClient.find().lean().exec();
//     const coworkingClientsMap = new Map(
//       coworkingClients.map((client) => [client.clientName.trim(), client._id]),
//     );

//     const units = await Unit.find().lean().exec();
//     const unitMap = new Map(
//       units.map((unit) => [`${unit.unitNo}`.trim(), unit._id]),
//     );

//     const stream = Readable.from(file.buffer.toString("utf-8").trim());
//     const members = [];

//     let hasError = false;
//     let errorMessage = "";

//     stream
//       .pipe(csvParser())
//       .on("data", (row) => {
//         if (hasError) return;

//         try {
//           const {
//             "Company Name": companyName,
//             "Employee Name": employeeName,
//             Designation: designation,
//             "Mobile No": mobileNo,
//             Email: email,
//             "Blood Group": bloodGroup,
//             DOB: dob,
//             "Emergency Name": emergencyName,
//             "Emergency No.": emergencyNo,
//             "BIZ Nest DOJ": dateOfJoining,
//             // Building: building,
//             "Unit No": unitNumber,
//             "Biometric Status (Yes/No)": biometricStatus,
//           } = row;

//           const clientId = coworkingClientsMap.get(companyName?.trim());
//           const unitId = unitMap.get(`${unitNumber?.trim()}`);

//           if (!clientId) {
//             hasError = true;
//             errorMessage = `Unknown client: ${companyName}`;
//             return;
//           }

//           const status =
//             biometricStatus?.toLowerCase() === "yes"
//               ? "Active"
//               : biometricStatus?.toLowerCase() === "no"
//                 ? "Inactive"
//                 : "Pending";

//           members.push({
//             company: company._id,
//             client: clientId,
//             employeeName: employeeName?.trim(),
//             designation: designation?.trim() || undefined,
//             mobileNo: mobileNo?.trim(),
//             email: email?.trim() || undefined,
//             bloodGroup: bloodGroup?.trim() || undefined,
//             dob: dob ? new Date(dob) : undefined,
//             emergencyName: emergencyName?.trim() || undefined,
//             emergencyNo: emergencyNo?.trim() || undefined,
//             dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
//             unit: unitId,
//             biometricStatus: status,
//           });
//         } catch (innerErr) {
//           hasError = true;
//           errorMessage = `Error parsing row: ${innerErr.message}`;
//         }
//       })
//       .on("end", async () => {
//         if (hasError) {
//           return res.status(400).json({ message: errorMessage });
//         }

//         if (!members.length) {
//           return res
//             .status(400)
//             .json({ message: "No valid member records found." });
//         }

//         await CoworkingMembers.insertMany(members);
//         res
//           .status(200)
//           .json({ message: "Coworking members uploaded successfully." });
//       })
//       .on("error", (err) => {
//         res
//           .status(400)
//           .json({ message: `CSV processing error: ${err.message}` });
//       });
//   } catch (error) {
//     next(error);
//   }
// };

const bulkInsertCoworkingMembers = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    const coworkingClients = await CoworkingClient.find({ company })
      .lean()
      .exec();

    const coworkingClientsMap = new Map(
      coworkingClients.map((client) => [client.clientName.trim(), client._id]),
    );

    const units = await Unit.find({ company }).lean().exec();
    const unitMap = new Map(
      units.map((unit) => [`${unit.unitNo}`.trim(), unit._id]),
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    let members = [];
    let unknownClients = [];
    let unknownUnits = [];

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          "Company Name": companyName,
          "Employee Name": employeeName,
          Designation: designation,
          "Mobile No": mobileNo,
          Email: email,
          "Blood Group": bloodGroup,
          DOB: dob,
          "Emergency Name": emergencyName,
          "Emergency No.": emergencyNo,
          "BIZ Nest DOJ": dateOfJoining,
          "Unit No": unitNumber,
          "Biometric Status (Yes/No)": biometricStatus,
        } = row;

        if (!employeeName || !companyName) return;

        const clientId = coworkingClientsMap.get(companyName?.trim());

        if (!clientId) {
          unknownClients.push({
            employeeName,
            companyName,
            reason: "Client not found",
          });
          return;
        }

        let unitId = null;

        if (unitNumber) {
          unitId = unitMap.get(`${unitNumber?.trim()}`);
          if (!unitId) {
            unknownUnits.push({
              employeeName,
              unitNumber,
              reason: "Unit not found",
            });
            return;
          }
        }

        const status =
          biometricStatus?.toLowerCase() === "yes"
            ? "Active"
            : biometricStatus?.toLowerCase() === "no"
              ? "Inactive"
              : "Pending";

        members.push({
          company: company,
          client: clientId,
          employeeName: employeeName?.trim(),
          designation: designation?.trim() || undefined,
          mobileNo: mobileNo?.trim(),
          email: email?.trim() || undefined,
          bloodGroup: bloodGroup?.trim() || undefined,
          dob: dob ? new Date(dob) : undefined,
          emergencyName: emergencyName?.trim() || undefined,
          emergencyNo: emergencyNo?.trim() || undefined,
          dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
          unit: unitId,
          biometricStatus: status,
        });
      })

      .on("end", async () => {
        try {
          if (!members.length) {
            return res.status(400).json({
              message: "No valid member records found.",
              unknownClients,
              unknownUnits,
            });
          }

          // ----------------------------
          // 1️⃣ Remove CSV duplicates
          // ----------------------------
          const uniqueMap = new Map();
          const csvDuplicates = [];

          members.forEach((member) => {
            const key = `${member.client}_${member.email || member.mobileNo}`;

            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, member);
            } else {
              csvDuplicates.push({
                employeeName: member.employeeName,
                email: member.email,
                mobileNo: member.mobileNo,
                reason: "Duplicate in CSV",
              });
            }
          });

          const uniqueMembers = Array.from(uniqueMap.values());

          // ----------------------------
          // 2️⃣ Fetch DB duplicates
          // ----------------------------
          const existingMembers = await CoworkingMembers.find({
            company: company._id,
            $or: uniqueMembers.map((m) => ({
              client: m.client,
              email: m.email,
            })),
          })
            .select("client email")
            .lean();

          const existingSet = new Set(
            existingMembers.map((m) => `${m.client}_${m.email}`),
          );

          const dbDuplicates = [];

          const finalMembers = uniqueMembers.filter((member) => {
            const key = `${member.client}_${member.email}`;

            if (existingSet.has(key)) {
              dbDuplicates.push({
                employeeName: member.employeeName,
                email: member.email,
                reason: "Already exists in database",
              });
              return false;
            }

            return true;
          });

          // ----------------------------
          // 3️⃣ Insert remaining
          // ----------------------------
          if (finalMembers.length > 0) {
            await TestCoworkingMember.insertMany(finalMembers);
          }

          return res.status(201).json({
            message: `${finalMembers.length} members inserted successfully`,
            insertedCount: finalMembers.length,
            skippedCount:
              unknownClients.length +
              unknownUnits.length +
              csvDuplicates.length +
              dbDuplicates.length,
            unknownClients,
            unknownUnits,
            csvDuplicates,
            dbDuplicates,
          });
        } catch (err) {
          next(err);
        }
      })

      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  getMemberByClient,
  updateCoworkingMember,
  getMembersByUnit,
  bulkInsertCoworkingMembers,
  updateMemberStatus,
};
