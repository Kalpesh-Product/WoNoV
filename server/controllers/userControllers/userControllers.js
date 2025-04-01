const Company = require("../../models/hr/Company");
const bcrypt = require("bcryptjs");
const User = require("../../models/hr/UserData");
const Role = require("../../models/roles/Roles");
const { default: mongoose } = require("mongoose");
const Department = require("../../models/Departments");
const { createLog } = require("../../utils/moduleLogs");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const { formatDate } = require("../../utils/formatDateTime");
const CustomError = require("../../utils/customErrorlogs");
const {
  handleFileUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");
const sharp = require("sharp");

const createUser = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Create User";
  const logSourceKey = "user";
  const { user } = req;
  const company = req.company;
  const ip = req.ip;

  try {
    const {
      empId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      phone,
      email,
      role,
      departments,
      employeeType,
      designation,
      startDate,
      workLocation,
      reportsTo,
      policies,
      homeAddress,
      bankInformation,
      panAadhaarDetails,
      payrollInformation,
      familyInformation,
    } = req.body;

    const companyId = req.company;

    // Validate required fields
    if (
      !empId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !companyId ||
      !employeeType ||
      !departments ||
      !designation ||
      !startDate ||
      !workLocation
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate departments: check for any invalid department IDs
    const invalidDepartmentIds = departments.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidDepartmentIds.length > 0) {
      throw new CustomError(
        "Invalid department ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const departmentExists = await Department.find({
      _id: { $in: departments },
    })
      .lean()
      .exec();
    if (!departmentExists || departmentExists.length === 0) {
      throw new CustomError(
        "Department not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if company exists
    const companyExists = await Company.findOne({ _id: companyId })
      .lean()
      .exec();
    if (!companyExists) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the employee ID or email is already registered
    const existingUser = await User.findOne({
      $or: [{ company: company, empId }, { email }],
    }).exec();
    if (existingUser) {
      throw new CustomError(
        "Employee ID or email already exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check role validity
    const roleValue = await Role.findOne({ _id: role }).lean().exec();
    if (!roleValue) {
      throw new CustomError(
        "Invalid role provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Master Admin check: only one Master Admin allowed per company
    if (roleValue.roleID === "ROLE_MASTER_ADMIN") {
      const doesMasterAdminExist = await User.findOne({
        role: { $in: [roleValue._id] },
        company: companyId,
      })
        .lean()
        .exec();
      if (doesMasterAdminExist) {
        throw new CustomError(
          "A master admin already exists",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    // Hash the default password
    const defaultPassword = "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = new User({
      empId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      phone,
      email,
      role,
      company: companyId,
      password: hashedPassword,
      departments,
      employeeType,
      designation,
      startDate,
      workLocation,
      reportsTo,
      policies,
      homeAddress,
      bankInformation,
      panAadhaarDetails,
      payrollInformation,
      familyInformation,
      isActive: true,
    });

    const savedUser = await newUser.save();

    // Log the successful creation of the user
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "User created successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedUser._id,
      changes: {
        empId: savedUser.empId,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        companyId: savedUser.company,
        designation: savedUser.designation,
        startDate: savedUser.startDate,
        workLocation: savedUser.workLocation,
      },
    });

    return res.status(201).json({ message: "User created successfully" });
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

const fetchUser = async (req, res, next) => {
  const { deptId } = req.params;
  const company = req.company;

  try {
    if (deptId) {
      const users = await User.find({
        department: { $elemMatch: { $eq: deptId } },
        company,
      })
        .select("-password")
        .populate([
          { path: "reportsTo", select: "name email" },
          { path: "departments", select: "name" },
          { path: "company", select: "name" },
          { path: "role", select: "roleTitle modulePermissions" },
        ]);

      return res.status(200).json(users);
    }

    const users = await User.find({ company: company })
      .select("-password")
      .populate([
        { path: "reportsTo", select: "_id roleTitle" },
        { path: "departments", select: "name" },
        { path: "company", select: "name" },
        { path: "role", select: "roleTitle modulePermissions" },
        // {
        //   path: "workLocation",
        //   select: "_id unitName unitNo",
        //   populate: {
        //     path: "building",
        //     select: "_id buildingName fullAddress",
        //   },
        // },
      ])
      .lean()
      .exec();
    if (!users) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const fetchSingleUser = async (req, res) => {
  try {
    const { empid } = req.params;
    const user = await User.findOne({ empId: empid })
      .select("-password")
      .populate([
        { path: "reportsTo" },
        { path: "departments", select: "name" },
        { path: "company", select: "name" },
        { path: "role", select: "roleTitle modulePermissions" },
        {
          path: "workLocation",
          select: "_id unitName unitNo",
          populate: {
            path: "building",
            select: "_id buildingName fullAddress",
          },
        },
      ])
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reportsTo = await User.find({
      role: { $in: [user.reportsTo] },
    }).select("firstName lastName");

    const formattedUser = {
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      gender: user.gender || "",
      dob: user.dateOfBirth ? formatDate(user.dateOfBirth) : "",
      employeeID: user.empId || "",
      mobilePhone: user.phone || "",
      startDate: user.startDate ? formatDate(user.startDate) : "",
      workLocation: user.workLocation || "",
      employeeType: user.employeeType?.name || "",
      department: user.departments?.[0]?.name || "",
      reportsTo:
        reportsTo.length > 0
          ? reportsTo.map((user) =>
              `${user.firstName || ""} ${user.lastName || ""}`.trim()
            )
          : "",
      jobTitle: user.designation || "",
      jobDescription: "",
      shift: user.policies?.shift || "",
      workSchedulePolicy: user.policies?.workSchedulePolicy || "",
      attendanceSource: user.policies?.attendanceSource || "",
      leavePolicy: user.policies?.leavePolicy || "",
      holidayPolicy: user.policies?.holidayPolicy || "",
      aadharID: user.panAadhaarDetails?.aadhaarId || "",
      pan: user.panAadhaarDetails?.pan || "",
      pFAcNo: user.panAadhaarDetails?.pfAccountNumber || "",
      addressLine1: user.homeAddress?.addressLine1 || "",
      addressLine2: user.homeAddress?.addressLine2 || "",
      state: user.homeAddress?.state || "",
      city: user.homeAddress?.city || "",
      pinCode: user.homeAddress?.pinCode || "",
      includeInPayroll: user.payrollInformation?.includeInPayroll
        ? "Yes"
        : "No",
      payrollBatch: "",
      professionalTaxExemption: user.payrollInformation?.professionTaxExemption
        ? "Yes"
        : "No",
      includePF: user.payrollInformation?.includePF ? "Yes" : "No",
      pFContributionRate: user.payrollInformation?.pfContributionRate || "",
      employeePF: user.payrollInformation?.employeePF || "",
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { user, ip, company } = req;
    const logPath = "hr/HrLog";
    const logAction = "Update User";
    const logSourceKey = "user";

    const userId = req.user;
    const updateData = req.body;
    const newProfilePicture = req.file;

    // Allowed top-level fields
    const allowedFields = ["firstName", "middleName", "lastName", "phone"];
    const filteredUpdateData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field].trim();
      }
    });

    let profilePictureUpdate = null;

    if (newProfilePicture) {
      const foundUser = await User.findOne({ _id: userId }).lean().exec();

      if (foundUser?.profilePicture?.id) {
        try {
          const response = await handleFileDelete(foundUser.profilePicture.id);
          if (response.result !== "ok") {
            throw new CustomError(
              "Failed to delete old profile picture",
              logPath,
              logAction,
              logSourceKey
            );
          }
        } catch (error) {
          throw new CustomError(
            "Error deleting old profile picture: " + error.message,
            logPath,
            logAction,
            logSourceKey
          );
        }
      }

      const buffer = await sharp(newProfilePicture.buffer)
        .resize(400, 400, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const foundCompany = await Company.findOne({ _id: company })
        .lean()
        .exec();

      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;
      const uploadResult = await handleFileUpload(
        base64Image,
        `${foundCompany.companyName}/users/${foundUser.empId}-${foundUser.firstName}_${foundUser.lastName}/profile-picture`
      );

      if (!uploadResult.public_id) {
        throw new CustomError(
          "Unable to upload profile picture",
          logPath,
          logAction,
          logSourceKey
        );
      }

      profilePictureUpdate = {
        id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };

      // Add to update payload
      filteredUpdateData.profilePicture = profilePictureUpdate;
    }

    if (Object.keys(filteredUpdateData).length === 0) {
      throw new CustomError(
        "No valid fields to update",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "User data updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedUser._id,
      changes: filteredUpdateData,
    });

    return res.status(200).json({
      message: "User data updated successfully",
      profilePicture: profilePictureUpdate || updatedUser.profilePicture,
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

const bulkInsertUsers = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Bulk Insert Users";
  const logSourceKey = "user";
  const { company: companyId, user, ip } = req;

  try {
    if (!req.file) {
      throw new CustomError(
        "No file uploaded",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Fetch the company details with selectedDepartments and department mapping
    const foundCompany = await Company.findById(companyId)
      .select("selectedDepartments")
      .populate({
        path: "selectedDepartments.department",
        select: "_id departmentId",
      })
      .lean()
      .exec();

    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Build a map of department departmentId to its ObjectId
    const departmentMap = new Map(
      foundCompany.selectedDepartments.map((dep) => [
        dep.department.departmentId,
        dep.department._id,
      ])
    );

    // Fetch roles and build a role map (assuming each role document has roleID)
    const roles = await Role.find().lean().exec();
    const roleMap = new Map(roles.map((role) => [role.roleID, role._id]));

    const newUsers = [];
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Wrap CSV stream processing in a promise so we can await its completion.
    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString("utf-8").trim());
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          try {
            // Process department field from CSV (departments separated by "/")
            const departmentIds = row["Departments"]
              ? row["Departments"].split("/").map((d) => d.trim())
              : [];
            const departmentObjectIds = departmentIds.map((id) => {
              if (!departmentMap.has(id)) {
                throw new Error(`Invalid department: ${id}`);
              }
              return departmentMap.get(id);
            });

            // Process roles similarly (roles separated by "/")
            const roleIds = row["Roles"]
              ? row["Roles"].split("/").map((r) => r.trim())
              : [];
            const roleObjectIds = roleIds
              .map((id) => roleMap.get(id))
              .filter(Boolean);

            // Process "Reports To" field (if available)
            let reportsToId = row["Reports To"]
              ? roleMap.get(row["Reports To"].trim())
              : null;

            const userObj = {
              empId: row["Emp ID"],
              firstName: row["First Name"],
              middleName: row["Middle Name (optional)"] || "",
              lastName: row["Last Name"],
              gender: row["Gender"],
              dateOfBirth: new Date(row["Date Of Birth"]),
              phone: row["Phone Number"],
              email: row["Company Email"],
              company: new mongoose.Types.ObjectId(companyId),
              password: hashedPassword,
              isActive: Boolean(row["isActive"]) || false,
              departments: departmentObjectIds,
              role: roleObjectIds,
              reportsTo: reportsToId,
              employeeType: {
                name: row["Employement Type"] || "Full-Time",
                leavesCount: [
                  { leaveType: "Privileged", count: row["Privileged"] || "0" },
                  { leaveType: "Sick", count: row["Sick"] || "0" },
                ],
              },
              designation: row["Designation"],
              startDate: new Date(row["Date Of Joining"]),
              workLocation: row["Work Building"],
              policies: {
                shift: row["Shift Policy"] || "General",
                workSchedulePolicy: row["Work Schedule Policy"] || "",
                leavePolicy: row["Leave Policy"] || "",
                holidayPolicy: row["Holiday Policy"] || "",
              },
              homeAddress: {
                addressLine1: row["Address"] || "",
                addressLine2: row["Present Address"] || "",
                city: row["City"] || "",
                state: row["State"] || "",
                pinCode: row["PIN Code"] || "",
              },
              bankInformation: {
                bankIFSC: row["Bank IFSC"] || "",
                bankName: row["Bank Name"] || "",
                branchName: row["Branch Name"] || "",
                nameOnAccount: row["Account Name"] || "",
                accountNumber: row["Account Number"] || "",
              },
              panAadhaarDetails: {
                aadhaarId: row["Aadhaar Number"] || "",
                pan: row["PAN Card Number"] || "",
                pfAccountNumber: row["PF Account Number"] || "",
                pfUAN: row["PF UAN"] || "",
                esiAccountNumber: row["ESI Account Number"] || "",
              },
              payrollInformation: {
                includeInPayroll: row["Include In Payroll (Yes/No)"] === "Yes",
                professionTaxExemption:
                  row["Profession Tax Exemption"] === "Yes",
                includePF: row["Include PF"] === "Yes",
                pfContributionRate: parseFloat(
                  row["Employer PF Contri"] || "0"
                ),
                employeePF: parseFloat(row["Employee PF"] || "0"),
              },
              familyInformation: {
                fatherName: row["Father's Name"] || "",
                motherName: row["Mother's Name"] || "",
                maritalStatus: row["Martial Status"] || "Single",
              },
            };

            newUsers.push(userObj);
          } catch (error) {
            // Reject the promise if any row processing fails
            reject(
              new CustomError(
                error.message,
                "hr/HrLog",
                "Bulk Insert Users",
                "user"
              )
            );
          }
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(
            new CustomError(
              error.message,
              "hr/HrLog",
              "Bulk Insert Users",
              "user"
            )
          );
        });
    });

    if (newUsers.length === 0) {
      throw new CustomError(
        "No valid data found in CSV",
        "hr/HrLog",
        "Bulk Insert Users",
        "user"
      );
    }

    await User.insertMany(newUsers);

    // Log the successful bulk insertion
    await createLog({
      path: "hr/HrLog",
      action: "Bulk Insert Users",
      remarks: "Bulk data inserted successfully",
      status: "Success",
      user: req.user,
      ip: req.ip,
      company: req.company,
      sourceKey: "user",
      sourceId: null, // No single sourceId for bulk operations
      changes: { insertedCount: newUsers.length },
    });

    return res.status(201).json({
      message: "Bulk data inserted successfully",
      insertedCount: newUsers.length,
    });
  } catch (error) {
    next(
      new CustomError(
        error.message,
        500,
        "hr/HrLog",
        "Bulk Insert Users",
        "user"
      )
    );
  }
};

const getAssignees = async (req, res, next) => {
  try {
    const { company, departments } = req;

    const departmentIds = departments.map((dept) => dept._id);

    const team = await User.find({
      company,
      departments: { $in: departmentIds },
    })
      .select("_id firstName lastName")
      .populate({
        path: "role",
        select: "roleTitle",
      });

    if (!team?.length) {
      return res.status(400).json({ message: "No assigness found" });
    }

    const assignees = team.filter((member) =>
      member.role.some((role) => !role.roleTitle.endsWith("Admin"))
    );

    const transformAssignees = assignees.map((assignee) => {
      return {
        id: assignee._id,
        name: `${assignee.firstName} ${assignee.lastName}`,
      };
    });
    return res.status(200).json(transformAssignees);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  fetchUser,
  fetchSingleUser,
  updateProfile,
  bulkInsertUsers,
  getAssignees,
};
