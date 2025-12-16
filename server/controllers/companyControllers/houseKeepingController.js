const HouseKeepingStaff = require("../../models/hr/HouseKeepingStaff");
const Users = require("../../models/hr/UserData");
const HouseKeepingSchedule = require("../../models/HousekeepingSchedule");
const Unit = require("../../models/locations/Unit");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const Department = require("../../models/Departments");
const Role = require("../../models/roles/Roles");
const { default: mongoose } = require("mongoose");

const addNewHouseKeepingMember = async (req, res, next) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      role,
      companyEmail,
      password,
      phoneNumber,
      dateOfBirth,
      dateOfJoining,
      workBuilding,
      designation,
      qualification,
      shiftPolicy,
      workSchdulePolicy,
      leavePolicy,
      holidayPolicy,
      address,
      presentAddress,
      city,
      state,
      pinCode,
      bankISFC,
      bankName,
      branchName,
      accountName,
      accountNumber,
      aadharNumber,
      PANCardNumber,
      pfAccountNumber,
      pfUAN,
      ESIAccountNumber,
      includeInPayroll,
      employeeGrid,
      professionalTaxExemption,
      includePf,
      employeePfContribution,
      employeePf,
      fatherName,
      employementType,
      employeeLeaveAndCount,
      motherName,
      martialStatus,
      houseKeepingType,
      primaryEmergencyContactName,
      primaryEmergencyContactNumber,
      secondayEmergencyContactName,
      secondaryEmergencyContactNumber,
    } = req.body;

    // Required field validation
    if (!firstName || !gender) {
      return res.status(400).json({ message: "Please provide valid details" });
    }

    const newEmployee = new HouseKeepingStaff({
      firstName,
      middleName,
      lastName,
      gender,
      role,
      companyEmail,
      password,
      phoneNumber,
      dateOfBirth,
      employementType,
      houseKeepingType,
      employeeLeaveAndCount,
      department: "6798bae6e469e809084e24a4",
      dateOfJoining,
      workBuilding,
      manager: "6798bf34e469e809084e24c6",
      designation,
      qualification,
      shiftPolicy,
      workSchdulePolicy,
      leavePolicy,
      holidayPolicy,
      address,
      presentAddress,
      city,
      state,
      pinCode,
      bankISFC,
      bankName,
      branchName,
      accountName,
      accountNumber,
      aadharNumber,
      PANCardNumber,
      pfAccountNumber,
      pfUAN,
      ESIAccountNumber,
      includeInPayroll,
      employeeGrid,
      professionalTaxExemption,
      includePf,
      employeePfContribution,
      employeePf,
      fatherName,
      motherName,
      martialStatus,
      primaryEmergencyContactName,
      primaryEmergencyContactNumber,
      secondayEmergencyContactName,
      secondaryEmergencyContactNumber,
    });

    const savedEmployee = await newEmployee.save();

    res.status(201).json({
      message: "Employee added successfully",
      employee: savedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

const getHouseKeepingStaff = async (req, res, next) => {
  try {
    const houseKeepingStaff = await HouseKeepingStaff.find()
      .populate([
        { path: "manager", select: "roleTitle" },
        { path: "department", select: "name" },
      ])
      .lean()
      .exec();

    const staff = await Promise.all(
      houseKeepingStaff.map(async (staffMember) => {
        const managerRoleId = staffMember.manager?._id?.toString();

        const managerUser = await Users.findOne({
          role: managerRoleId,
          isActive: true,
        })
          .select("firstName lastName email mobileNumber")
          .lean()
          .exec();

        return {
          ...staffMember,
          managerUser,
        };
      })
    );

    return res.status(200).json(staff);
  } catch (error) {
    next(error);
  }
};

const updateHouseKeepingMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedStaff = await HouseKeepingStaff.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: updates },
      { new: true }
    );

    if (!updatedStaff) {
      return res
        .status(404)
        .json({ message: "Staff not found or already deleted." });
    }

    res.status(200).json({
      message: "House Keeping Staff Updated Successfully",
      updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

const softDeleteHouseKeepingMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await HouseKeepingStaff.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Staff not found or already deleted." });
    }

    res.status(200).json({ message: "Staff marked as inactive successfully." });
  } catch (error) {
    next(error);
  }
};

const assignHouseKeepingMember = async (req, res, next) => {
  try {
    const { memberId, unitId, startDate, endDate } = req.body;

    if (!memberId || !unitId || !startDate || !endDate) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingMember = await HouseKeepingStaff.findOne({
      _id: memberId,
    })
      .lean()
      .exec();

    if (!existingMember) {
      return res.status(404).json({ message: "No such member exists" });
    }

    const validStartDate = new Date(startDate);
    const validEndDate = new Date(endDate);

    if (isNaN(validStartDate) || isNaN(validEndDate)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (validStartDate > validEndDate) {
      return res
        .status(400)
        .json({ message: "Start date cannot be after end date" });
    }

    // Check for overlapping assignments for the same member
    const overlap = await HouseKeepingSchedule.findOne({
      housekeepingMember: memberId,
      unit: unitId,
      $or: [
        {
          startDate: { $lte: validEndDate },
          endDate: { $gte: validStartDate },
        },
      ],
    });

    if (overlap) {
      return res.status(409).json({
        message: "Member already assigned in this period for the unit",
      });
    }

    const newAssignment = await HouseKeepingSchedule.create({
      housekeepingMember: memberId,
      unit: unitId,
      startDate: validStartDate,
      endDate: validEndDate,
    });

    return res.status(201).json({
      message: "Housekeeping member assigned successfully",
      data: newAssignment,
    });
  } catch (error) {
    next(error);
  }
};

const getHouseKeepingAssignments = async (req, res, next) => {
  try {
    const { unitId } = req.query;

    const query = {};

    const schedules = await HouseKeepingSchedule.find({ unit: unitId })
      .populate("housekeepingMember", "firstName lastName gender") // customize fields
      .populate("unit", "unitName floorNumber")
      .populate({
        path: "substitutions.substitute",
        select: "firstName lastName",
      }); // customize fields

    return res.status(200).json({
      message: "Housekeeping assignments fetched successfully",
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

const bulkInsertHousekeepingMembers = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file." });
    }

    const departments = await Department.find({ isActive: true }).lean().exec();

    const departmentMap = new Map(
      departments.map((d) => [d.name?.trim(), d._id])
    );

    const existingStaff = await HouseKeepingStaff.find().lean().exec();
    const manager = await Role.findOne({
      roleID: "ROLE_ADMINISTRATION_ADMIN",
    })
      .lean()
      .exec();

    let selfCount = existingStaff.filter(
      (m) => m.houseKeepingType === "Self"
    ).length;
    let thirdPartyCount = existingStaff.filter(
      (m) => m.houseKeepingType === "Third Party"
    ).length;

    const padNumber = (num) => String(num).padStart(3, "0");

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const members = [];
    const errors = [];
    let rowNumber = 1;

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        rowNumber++;

        try {
          const departmentId = departmentMap.get(
            row["Departments"]?.trim().toLowerCase()
          );

          const parseBool = (val) =>
            ["yes", "true", "1"].includes(val?.trim().toLowerCase());
          const parseDate = (val) => (val ? new Date(val) : null);

          const hkType = row["Housekeeping Type"]?.trim();

          let hkPrefix = "";
          let hkNumber = "";

          if (hkType === "Self") {
            selfCount++;
            hkPrefix = "SF";
            hkNumber = padNumber(selfCount);
          } else if (hkType === "Third Party") {
            thirdPartyCount++;
            hkPrefix = "TP";
            hkNumber = padNumber(thirdPartyCount);
          } else {
            errors.push(
              `Row ${rowNumber}: Invalid housekeeping type "${hkType}"`
            );
            return;
          }

          const hkId = `HK-${hkPrefix}-${hkNumber}`;

          const member = {
            firstName: row["First Name"]?.trim(),
            middleName: row["Middle Name"]?.trim(),
            lastName: row["Last Name"]?.trim(),
            gender: row["Gender"]?.trim(),
            role: row["role"]?.trim(),
            houseKeepingType: row["Housekeeping Type"]?.trim(),
            companyEmail: row["Company Email"]?.trim(),
            password: row["password"]?.trim(),
            phoneNumber: row["Phone Number"]?.trim(),
            dateOfBirth: parseDate(row["Date Of Birth"]),
            employementType: row["Employement Type"]?.trim(),
            employeeLeaveAndCount: row["Employee Leave Type And Count"]?.trim(),
            department: departmentId || undefined,
            dateOfJoining: parseDate(row["Date Of Joining"]),
            workBuilding: row["Work Building"]?.trim(),
            manager: manager._id || undefined,
            designation: row["Designation"]?.trim(),
            qualification: row["Qualification"]?.trim(),
            shiftPolicy: row["Shift Policy"]?.trim(),
            workSchdulePolicy: row["Work Schedule Policy"]?.trim(),
            leavePolicy: row["Leave Policy"]?.trim(),
            holidayPolicy: row["Holiday Policy"]?.trim(),

            address: row["Address"]?.trim(),
            presentAddress: row["Present Address"]?.trim(),
            city: row["City"]?.trim(),
            state: row["State"]?.trim(),
            pinCode: row["PIN Code"]?.trim(),

            bankISFC: row["Bank IFSC"]?.trim(),
            bankName: row["Bank Name"]?.trim(),
            branchName: row["Branch Name"]?.trim(),
            accountName: row["Account Name"]?.trim(),
            accountNumber: row["Account Number"]?.trim(),

            aadharNumber: row["Aadhaar Number"]?.trim(),
            PANCardNumber: row["PAN Card Number"]?.trim(),
            pfAccountNumber: row["PF Account Number"]?.trim(),
            pfUAN: row["PF UAN"]?.trim(),
            ESIAccountNumber: row["ESI Account Number"]?.trim(),

            includeInPayroll: parseBool(row["Include In Payroll (Yes/No)"]),
            employeeGrid: row["Employee Grid"]?.trim(),
            professionalTaxExemption: parseBool(
              row["Profession Tax Exemption"]
            ),
            includePf: parseBool(row["Include PF"]),
            employeePfContribution:
              Number(row["Employer PF Contribution"]) || 0,
            employeePf: Number(row["Employee PF"]) || 0,

            fatherName: row["Father's Name"]?.trim(),
            motherName: row["Mother's Name"]?.trim(),
            martialStatus: row["Martial Status"]?.trim(),
            primaryEmergencyContactName:
              row["Primary Emergency Contact Name"]?.trim(),
            primaryEmergencyContactNumber:
              row["Primary Emergency Contact Number"]?.trim(),
            secondayEmergencyContactName:
              row["Secondary Emergency Contact Name"]?.trim(),
            secondaryEmergencyContactNumber:
              row["Secondary Emergency Conatact Number"]?.trim(),

            isActive: true,
          };

          if (!member.firstName || !member.phoneNumber || !member.gender) {
            errors.push(
              `Row ${rowNumber}: Missing required fields (First Name, Phone, Gender)`
            );
            return;
          }

          members.push(member);
        } catch (err) {
          errors.push(`Row ${rowNumber}: ${err.message}`);
        }
      })
      .on("end", async () => {
        if (!members.length) {
          return res.status(400).json({
            message: "No valid housekeeping member records found.",
            errors,
          });
        }

        try {
          await HouseKeepingStaff.insertMany(members);
          res.status(200).json({
            message: "Housekeeping members inserted successfully.",
            insertedCount: members.length,
            errors: errors.length ? errors : undefined,
          });
        } catch (insertErr) {
          res.status(500).json({
            message: "Failed to insert housekeeping members.",
            error: insertErr.message,
          });
        }
      })
      .on("error", (parseErr) => {
        res.status(500).json({
          message: "CSV parsing error.",
          error: parseErr.message,
        });
      });
  } catch (error) {
    next(error);
  }
};

const bulkInsertHouseKeepingSchedule = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Please provide a csv file" });
    }

    const units = await Unit.find().lean().exec();
    const unitsMap = new Map(units.map((unit) => [unit.unitNo, unit._id]));

    const houseKeepingMembers = await HouseKeepingStaff.find().lean().exec();
    const houseKeepingMembersMap = new Map(
      houseKeepingMembers.map((h) => [h.houseKeepingId, h._id])
    );

    const results = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const location = row["Location"];
        const hkMemberId = row["HK Member ID"];
        const isActive = row["Employee Is Active"]?.toLowerCase() === "yes";

        if (!isActive) return;

        const unitId = unitsMap.get(location);
        const houseKeepingMember = houseKeepingMembersMap.get(hkMemberId);

        if (unitId && houseKeepingMember) {
          results.push({
            unit: unitId,
            housekeepingMember: new mongoose.Types.ObjectId(houseKeepingMember),
            startDate: new Date(row["Start Date"]),
            endDate: new Date(row["End Date"]),
          });
        }
      })
      .on("end", async () => {
        if (results.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid data found in CSV" });
        }
        await HouseKeepingSchedule.insertMany(results);
        res.status(200).json({
          message: "Housekeeping schedules inserted successfully",
          count: results.length,
        });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getHouseKeepingStaff,
  addNewHouseKeepingMember,
  updateHouseKeepingMember,
  softDeleteHouseKeepingMember,
  assignHouseKeepingMember,
  getHouseKeepingAssignments,
  bulkInsertHousekeepingMembers,
  bulkInsertHouseKeepingSchedule,
};
