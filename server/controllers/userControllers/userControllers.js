const Company = require("../../models/hr/Company");
const UserData = require("../../models/hr/UserData");
const bcrypt = require("bcryptjs");
const User = require("../../models/hr/UserData");
const Role = require("../../models/roles/Roles");
const { mongoose } = require("mongoose");
const Department = require("../../models/Departments");
const { createLog } = require("../../utils/moduleLogs");
const csvParser = require("csv-parser");
const yup = require("yup");
const { Readable } = require("stream");
const { formatDate } = require("../../utils/formatDateTime");
const CustomError = require("../../utils/customErrorlogs");
const { handleFileUpload, handleFileDelete } = require("../../config/s3Config");
const sharp = require("sharp");
const Agreements = require("../../models/hr/Agreements");
const TestUserData = require("../../models/hr/TestUserData");
const TestAgreements = require("../../models/hr/TestAgreements");

// const createUser = async (req, res, next) => {
//   const logPath = "hr/HrLog";
//   const logAction = "Create User";
//   const logSourceKey = "user";
//   const { user } = req;
//   const company = req.company;
//   const ip = req.ip;

//   try {
//     const {
//       empId,
//       firstName,
//       middleName,
//       lastName,
//       gender,
//       dateOfBirth,
//       phone,
//       email,
//       role,
//       departments,
//       employeeType,
//       designation,
//       jobTitle,
//       jobDescription,
//       startDate,
//       workLocation,
//       reportsTo,
//       shift,
//       policies,
//       attendanceSource,
//       homeAddress,
//       bankInformation,
//       panAadhaarDetails,
//       payrollInformation,
//       familyInformation,
//     } = req.body;

//     const companyId = req.company;

//     // Validate required fields
//     const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
//     const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
//     const aadhaarRegex = /^[0-9]{12}$/;
//     const accountNumberRegex = /^[0-9]{9,18}$/;
//     const pfUANRegex = /^[0-9]{12}$/;
//     const pfAccountNumberRegex = /^[A-Z0-9\/-]{10,25}$/i;
//     const esiAccountNumberRegex = /^[0-9]{10,17}$/;

//     const validationSchema = yup.object({
//       empId: yup.string().trim().required("empId is required"),
//       firstName: yup.string().trim().required("firstName is required"),

//       lastName: yup.string().trim().required("lastName is required"),
//       gender: yup.string().trim().required("gender is required"),
//       dateOfBirth: yup.mixed().required("dateOfBirth is required"),
//       phone: yup.string().trim().required("phone is required"),
//       email: yup.string().trim().email().required("email is required"),
//       role: yup
//         .mixed()
//         .test("role-required", "role is required", (value) =>
//           Array.isArray(value) ? value.length > 0 : Boolean(value),
//         ),
//       departments: yup
//         .array()
//         .of(yup.string().required())
//         .min(1, "departments is required")
//         .required("departments is required"),
//       employeeType: yup
//         .mixed()
//         .test("employeeType-required", "employeeType is required", (value) => {
//           if (!value) return false;
//           if (typeof value === "string") return value.trim() !== "";
//           if (typeof value === "object") {
//             return typeof value.name === "string" && value.name.trim() !== "";
//           }
//           return false;
//         }),
//       jobTitle: yup.string().trim().required("jobTitle is required"),
//       jobDescription: yup
//         .string()
//         .trim()
//         .required("jobDescription is required"),
//       startDate: yup.mixed().required("startDate is required"),
//       workLocation: yup.string().trim().required("workLocation is required"),
//       reportsTo: yup.string().trim().required("reportsTo is required"),
//       attendanceSource: yup
//         .string()
//         .trim()
//         .required("attendanceSource is required"),
//       policies: yup.object({
//         workSchedulePolicy: yup
//           .string()
//           .trim()
//           .required("workSchedulePolicy is required"),
//         leavePolicy: yup.string().trim().required("leavePolicy is required"),
//         holidayPolicy: yup
//           .string()
//           .trim()
//           .required("holidayPolicy is required"),
//       }),
//       homeAddress: yup.object({
//         addressLine1: yup.string().trim().required("addressLine1 is required"),
//         addressLine2: yup.string().trim().required("addressLine2 is required"),
//         country: yup.string().trim().required("country is required"),
//         state: yup.string().trim().required("state is required"),
//         city: yup.string().trim().required("city is required"),
//         pinCode: yup.string().trim().required("pinCode is required"),
//       }),
//       bankInformation: yup.object({
//         bankIFSC: yup
//           .string()
//           .trim()
//           .matches(ifscRegex, "bankIFSC is invalid")
//           .required("bankIFSC is required"),
//         bankName: yup.string().trim().required("bankName is required"),
//         branchName: yup.string().trim().required("branchName is required"),
//         nameOnAccount: yup
//           .string()
//           .trim()
//           .required("nameOnAccount is required"),
//         accountNumber: yup
//           .string()
//           .trim()
//           .matches(accountNumberRegex, "accountNumber is invalid")
//           .required("accountNumber is required"),
//       }),
//       panAadhaarDetails: yup.object({
//         aadhaarId: yup
//           .string()
//           .trim()
//           .matches(aadhaarRegex, "aadhaarId is invalid")
//           .required("aadhaarId is required"),
//         pan: yup
//           .string()
//           .trim()
//           .matches(panRegex, "pan is invalid")
//           .required("pan is required"),
//         pfAccountNumber: yup
//           .string()
//           .trim()
//           .required("pfAccountNumber is required")
//           .matches(pfAccountNumberRegex, "pfAccountNumber is invalid"),
//         pfUAN: yup
//           .string()
//           .trim()
//           .required("pfUAN is required")
//           .matches(pfUANRegex, "pfUAN is invalid"),
//         esiAccountNumber: yup
//           .string()
//           .trim()
//           .required("esiAccountNumber is required")
//           .matches(esiAccountNumberRegex, "esiAccountNumber is invalid"),
//       }),
//       payrollInformation: yup.object({
//         includeInPayroll: yup.mixed().required("includeInPayroll is required"),
//         payrollBatch: yup.string().trim().required("payrollBatch is required"),
//         professionTaxExemption: yup
//           .mixed()
//           .required("professionTaxExemption is required"),
//         includePF: yup.mixed().required("includePF is required"),
//         pfContributionRate: yup
//           .string()
//           .trim()
//           .required("pfContributionRate is required"),
//         employeePF: yup.string().trim().required("employeePF is required"),
//         employerPf: yup.string().trim().required("employerPf is required"),
//         includeEsi: yup.mixed().required("includeEsi is required"),
//         esiContribution: yup
//           .string()
//           .trim()
//           .required("esiContribution is required"),
//         hraType: yup.string().trim().required("hraType is required"),
//         tdsCalculationBasedOn: yup
//           .string()
//           .trim()
//           .required("tdsCalculationBasedOn is required"),
//         incomeTaxRegime: yup
//           .string()
//           .trim()
//           .required("incomeTaxRegime is required"),
//       }),
//       familyInformation: yup.object({
//         fatherName: yup.string().trim().required("fatherName is required"),
//         motherName: yup.string().trim().required("motherName is required"),
//         maritalStatus: yup
//           .string()
//           .trim()
//           .required("maritalStatus is required"),
//         emergencyPhone: yup
//           .string()
//           .trim()
//           .required("emergencyPhone is required"),
//       }),
//     });

//     try {
//       await validationSchema.validate(req.body, {
//         abortEarly: false,
//         stripUnknown: true,
//       });
//     } catch (error) {
//       if (error instanceof yup.ValidationError) {
//         throw new CustomError(
//           `Missing or invalid fields: ${error.errors.join(", ")}`,
//           logPath,
//           logAction,
//           logSourceKey,
//         );
//       }
//       throw error;
//     }

//     // Validate departments: check for any invalid department IDs
//     const invalidDepartmentIds = departments.filter(
//       (id) => !mongoose.Types.ObjectId.isValid(id),
//     );
//     if (invalidDepartmentIds.length > 0) {
//       throw new CustomError(
//         "Invalid department ID provided",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     const departmentExists = await Department.find({
//       _id: { $in: departments },
//     })
//       .lean()
//       .exec();
//     if (!departmentExists || departmentExists.length === 0) {
//       throw new CustomError(
//         "Department not found",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     // Check if company exists
//     const companyExists = await Company.findOne({ _id: companyId })
//       .lean()
//       .exec();
//     if (!companyExists) {
//       throw new CustomError(
//         "Company not found",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     // Check if the employee ID or email is already registered
//     const existingUser = await User.findOne({
//       $or: [{ company: company, empId }, { email }],
//     }).exec();
//     if (existingUser) {
//       throw new CustomError(
//         "Employee ID or email already exists",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     // Check role validity
//     const roleValue = await Role.findOne({ _id: role }).lean().exec();
//     if (!roleValue) {
//       throw new CustomError(
//         "Invalid role provided",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     // Master Admin check: only one Master Admin allowed per company
//     if (roleValue.roleID === "ROLE_MASTER_ADMIN") {
//       const doesMasterAdminExist = await User.findOne({
//         role: { $in: [roleValue._id] },
//         company: companyId,
//       })
//         .lean()
//         .exec();
//       if (doesMasterAdminExist) {
//         throw new CustomError(
//           "A master admin already exists",
//           logPath,
//           logAction,
//           logSourceKey,
//         );
//       }
//     }

//     // Hash the default password
//     const defaultPassword = `${firstName.trim()}@0625`;
//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//     const newUser = new User({
//       empId,
//       firstName,
//       middleName,
//       lastName,
//       gender,
//       dateOfBirth,
//       phone,
//       email,
//       role,
//       company,
//       password: hashedPassword,
//       attendanceSource,
//       departments,
//       employeeType,
//       jobTitle,
//       jobDescription,
//       designation,
//       startDate,
//       workLocation,
//       reportsTo,
//       policies,
//       homeAddress,
//       bankInformation,
//       panAadhaarDetails,
//       payrollInformation,
//       familyInformation,
//       isActive: true,
//     });

//     const savedUser = await newUser.save();

//     const policyAgreements = [
//       {
//         name: "Work Schedule Policy",
//         value: policies.workSchedulePolicy,
//       },
//       { name: "Leave Policy", value: policies.leavePolicy },
//       { name: "Holiday Policy", value: policies.holidayPolicy },
//     ];

//     const agreementsToCreate = policyAgreements
//       .filter((policy) => policy.value)
//       .map((policy) => {
//         const value = String(policy.value);
//         const isUrl = value.startsWith("https");

//         return {
//           name: policy.name,
//           user: savedUser._id,
//           url: isUrl ? value : undefined,
//           type:
//             policy.name === "Work Schedule Policy" && !isUrl
//               ? value
//               : undefined,
//           isActive: true,
//         };
//       });

//     if (agreementsToCreate.length) {
//       await Agreements.insertMany(agreementsToCreate);
//     }

//     return res.status(201).json({ message: "Employee onboarded successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

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
      jobTitle,
      jobDescription,
      startDate,
      workLocation,
      reportsTo,
      shift,
      policies,
      attendanceSource,
      homeAddress,
      bankInformation,
      panAadhaarDetails,
      payrollInformation,
      familyInformation,
    } = req.body;

    const companyId = req.company;

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const aadhaarRegex = /^[0-9]{12}$/;
    const accountNumberRegex = /^[0-9]{9,18}$/;
    const pfUANRegex = /^[0-9]{12}$/;
    const pfAccountNumberRegex = /^[A-Z0-9\/-]{10,25}$/i;
    const esiAccountNumberRegex = /^[0-9]{10,17}$/;

    const validationSchema = yup.object({
      // ── Core required fields (still required in schema) ──────────────────
      empId: yup.string().trim().required("empId is required"),
      firstName: yup.string().trim().required("firstName is required"),
      lastName: yup.string().trim().required("lastName is required"),
      gender: yup
        .string()
        .trim()
        .oneOf(
          ["Male", "Female", "Other"],
          "gender must be Male, Female, or Other",
        )
        .required("gender is required"),
      dateOfBirth: yup.mixed().required("dateOfBirth is required"),
      phone: yup.string().trim().required("phone is required"),
      email: yup.string().trim().email().required("email is required"),
      role: yup
        .mixed()
        .optional()
        .test((value) => {
          if (!value) return true; // allow undefined/missing
          if (Array.isArray(value)) return value.length > 0;
          return Boolean(value);
        }),
      departments: yup.array().of(yup.string().required()),
      employeeType: yup.mixed().test((value) => {
        if (!value) return true;
        if (typeof value === "string") return value.trim() !== "";
        if (typeof value === "object") {
          return typeof value.name === "string" && value.name.trim() !== "";
        }
        return false;
      }),
      // reportsTo: yup.string().trim().required("reportsTo is required"),
      // attendanceSource: yup
      //   .string()
      //   .trim()
      //   .required("attendanceSource is required"),

      // ── Optional in updated schema ────────────────────────────────────────
      middleName: yup.string().trim().optional(),
      designation: yup.string().trim().optional(),
      jobTitle: yup.string().trim().optional(),
      jobDescription: yup.string().trim().optional(),
      startDate: yup.mixed().optional(),
      workLocation: yup.string().trim().optional(),
      shift: yup.string().trim().optional(),

      // ── Policies (optional object) ────────────────────────────────────────
      policies: yup
        .object({
          workSchedulePolicy: yup.string().trim().optional(),
          leavePolicy: yup.string().trim().optional(),
          holidayPolicy: yup.string().trim().optional(),
        })
        .optional(),

      // ── homeAddress (all fields optional) ────────────────────────────────
      homeAddress: yup
        .object({
          addressLine1: yup.string().trim().optional(),
          addressLine2: yup.string().trim().optional(),
          country: yup.string().trim().optional(),
          state: yup.string().trim().optional(),
          city: yup.string().trim().optional(),
          pinCode: yup.string().trim().optional(),
          notes: yup.string().trim().optional(),
        })
        .optional(),

      // ── bankInformation (all fields optional, validate format if present) ─
      bankInformation: yup
        .object({
          bankIFSC: yup
            .string()
            .trim()
            .matches(ifscRegex, "bankIFSC is invalid")
            .optional(),
          bankName: yup.string().trim().optional(),
          branchName: yup.string().trim().optional(),
          nameOnAccount: yup.string().trim().optional(),
          accountNumber: yup
            .string()
            .trim()
            .matches(accountNumberRegex, "accountNumber is invalid")
            .optional(),
        })
        .optional(),

      // ── panAadhaarDetails (all fields optional, validate format if present)
      panAadhaarDetails: yup
        .object({
          aadhaarId: yup
            .string()
            .trim()
            .matches(aadhaarRegex, "aadhaarId is invalid")
            .optional(),
          pan: yup
            .string()
            .trim()
            .matches(panRegex, "pan is invalid")
            .optional(),
          pfAccountNumber: yup
            .string()
            .trim()
            .matches(pfAccountNumberRegex, "pfAccountNumber is invalid")
            .optional(),
          pfUAN: yup
            .string()
            .trim()
            .matches(pfUANRegex, "pfUAN is invalid")
            .optional(),
          esiAccountNumber: yup
            .string()
            .trim()
            .matches(esiAccountNumberRegex, "esiAccountNumber is invalid")
            .optional(),
        })
        .optional(),

      // ── payrollInformation (all fields optional) ──────────────────────────
      payrollInformation: yup
        .object({
          includeInPayroll: yup.mixed().optional(),
          payrollBatch: yup.string().trim().optional(),
          professionTaxExemption: yup.mixed().optional(),
          includePF: yup.mixed().optional(),
          pfContributionRate: yup.string().trim().optional(),
          employeePF: yup.string().trim().optional(),
          employerPf: yup.string().trim().optional(),
          includeEsi: yup.mixed().optional(),
          esiContribution: yup.string().trim().optional(),
          hraType: yup.string().trim().optional(),
          tdsCalculationBasedOn: yup.string().trim().optional(),
          incomeTaxRegime: yup.string().trim().optional(),
        })
        .optional(),

      // ── familyInformation (all fields optional) ───────────────────────────
      familyInformation: yup
        .object({
          fatherName: yup.string().trim().optional(),
          motherName: yup.string().trim().optional(),
          maritalStatus: yup.string().trim().optional(),
          emergencyPhone: yup.string().trim().optional(),
        })
        .optional(),
    });

    try {
      await validationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new CustomError(
          `Missing or invalid fields: ${error.errors.join(", ")}`,
          logPath,
          logAction,
          logSourceKey,
        );
      }
      throw error;
    }

    // Validate departments
    if (departments && departments.length > 0) {
      const invalidDepartmentIds = departments.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidDepartmentIds.length > 0) {
        throw new CustomError(
          "Invalid department ID provided",
          logPath,
          logAction,
          logSourceKey,
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
          logSourceKey,
        );
      }
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
        logSourceKey,
      );
    }

    // Check if employee ID or email already exists
    const existingUser = await User.findOne({
      $or: [{ company: company, empId }, { email }],
    }).exec();
    if (existingUser) {
      throw new CustomError(
        "Employee ID or email already exists",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Check role validity
    if (role && role.length > 0) {
      const roleValue = await Role.findOne({ _id: role }).lean().exec();
      if (!roleValue) {
        throw new CustomError(
          "Invalid role provided",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      // Master Admin check
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
            logSourceKey,
          );
        }
      }
    }

    // Hash the default password
    const defaultPassword = `${firstName.trim()}@0625`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const resolvedAttendanceSource =
      attendanceSource || policies?.attendanceSource;
    const resolvedShift = shift || policies?.workSchedulePolicy;

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
      company,
      password: hashedPassword,
      attendanceSource: resolvedAttendanceSource,
      departments,
      employeeType,
      jobTitle,
      jobDescription,
      designation,
      startDate,
      workLocation,
      reportsTo,
      shift: resolvedShift,
      homeAddress,
      bankInformation,
      panAadhaarDetails,
      payrollInformation,
      familyInformation,
      isActive: true,
    });

    const savedUser = await newUser.save();

    // Only create agreements if policies exist
    if (policies) {
      const policyAgreements = [
        { name: "Work Schedule Policy", value: policies.workSchedulePolicy },
        { name: "Leave Policy", value: policies.leavePolicy },
        { name: "Holiday Policy", value: policies.holidayPolicy },
      ];

      const agreementsToCreate = policyAgreements
        .filter((policy) => policy.value)
        .map((policy) => {
          const value = String(policy.value);
          const isUrl = value.startsWith("https");
          return {
            name: policy.name,
            user: savedUser._id,
            url: isUrl ? value : undefined,
            type:
              policy.name === "Work Schedule Policy" && !isUrl
                ? value
                : undefined,
            isActive: true,
          };
        });

      console.log("Agreements to create:", agreementsToCreate);
      if (agreementsToCreate.length) {
        await Agreements.insertMany(agreementsToCreate);
      }
    }

    return res.status(201).json({ message: "Employee onboarded successfully" });
  } catch (error) {
    next(error);
  }
};

const fetchUser = async (req, res, next) => {
  const { deptId, status = "true" } = req.query;
  const company = req.company;

  try {
    if (status && !["true", "false"].includes(status)) {
      return res.status(400).json({ message: "Status must be true/false" });
    }

    if (deptId) {
      const users = await User.find({
        departments: deptId,
        company,
        isActive: true,
      })
        .select("-password")
        .populate([
          { path: "reportsTo", select: "name email" },
          { path: "departments", select: "name" },
          { path: "company", select: "name" },
          { path: "role", select: "roleTitle" },
        ]);

      return res.status(200).json(users);
    }

    const users = await User.find({
      company: company,
      isActive: status === "true",
    })
      .select("-password")
      .populate([
        { path: "reportsTo", select: "_id roleTitle" },
        { path: "departments", select: "name" },
        { path: "company", select: "name" },
        { path: "role", select: "roleTitle" },
      ])
      .sort({ startDate: 1 })
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
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // const [reportsTo, policies] = await Promise.all([
    //   User.findOne({ role: { $in: [user.reportsTo] } })
    //     .select("firstName lastName")
    //     .lean(),

    //   Agreements.find({ user: user._id }).lean(),
    // ]);

    // const policyMap = policies.reduce((acc, policy) => {
    //   acc[policy.name] = policy;
    //   return acc;
    // }, {});

    let reportsTo = null;

    if (user.reportsTo) {
      reportsTo = await User.findOne({
        role: { $in: [user.reportsTo] },
        isActive: true,
      })
        .select("firstName lastName")
        .lean();
    }

    const policies = await Agreements.find({ user: user._id }).lean();
    const policyMap = policies.reduce((acc, policy) => {
      if (policy?.name) acc[policy.name] = policy;
      return acc;
    }, {});

    const formattedUser = {
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      gender: user.gender || "",
      dob: user.dateOfBirth ? user.dateOfBirth : "",
      employeeID: user.empId || "",
      mobilePhone: user.phone || "",
      startDate: user.startDate ? user.startDate : "",
      // workLocation: user.workLocation || "",
      workLocation:
        user.workLocation?.unitName ||
        user.workLocation?.unitNo ||
        user.workLocation?.building?.buildingName ||
        user.workLocation ||
        "",
      employeeType: user.employeeType?.name || "",
      departments:
        user.departments?.map((department) => department?.name).join(", ") ||
        "",
      role: user.role?.map((role) => role?.roleTitle).join(", ") || "",
      reportsTo: reportsTo
        ? `${reportsTo.firstName} ${reportsTo.lastName} (${user.reportsTo?.roleTitle || ""})`
        : "",
      jobTitle: user.designation || "",
      jobDescription: user.jobDescription || "",
      shift: user.shift || "",
      workSchedulePolicy:
        policyMap?.["Work Schedule Policy"]?.type ||
        policyMap?.["Work Schedule Policy"]?.url ||
        "",
      attendanceSource: user?.attendanceSource || "",
      leavePolicy: policyMap?.["Leave Policy"]?.url || "",
      holidayPolicy: policyMap?.["Holiday Policy"]?.url || "",
      status: user.isActive ? "Active" : "Inactive",
      isActive: Boolean(user.isActive),
      aadhaarID: user.panAadhaarDetails?.aadhaarId || "",
      pan: user.panAadhaarDetails?.pan || "",
      pfAccountNumber: user.panAadhaarDetails?.pfAccountNumber || "",
      pfUan: user.panAadhaarDetails?.pfUAN || "",
      esiAccountNumber: user.panAadhaarDetails?.esiAccountNumber || "",
      bankName: user.bankInformation?.bankName || "",
      bankIfsc: user.bankInformation?.bankIFSC || "",
      branchName: user.bankInformation?.branchName || "",
      nameOnAccount: user.bankInformation?.nameOnAccount || "",
      accountNumber: user.bankInformation?.accountNumber || "",
      addressLine1: user.homeAddress?.addressLine1 || "",
      addressLine2: user.homeAddress?.addressLine2 || "",
      state: user.homeAddress?.state || "",
      city: user.homeAddress?.city || "",
      country: user.homeAddress?.country || "",
      pinCode: user.homeAddress?.pinCode || "",
      fatherName: user.familyInformation?.fatherName || "",
      motherName: user.familyInformation?.motherName || "",
      maritalStatus: user.familyInformation?.maritalStatus || "",
      emergencyPhone: user.familyInformation?.emergencyPhone || "",
      email: user.email || "",
      includeInPayroll: user.payrollInformation?.includeInPayroll
        ? "Yes"
        : "No",
      payrollBatch: user.payrollInformation?.payrollBatch || "",
      professionalTaxExemption: user.payrollInformation?.professionTaxExemption
        ? "Yes"
        : "No",
      includePF: user.payrollInformation?.includePF ? "Yes" : "No",
      pFContributionRate: user.payrollInformation?.pfContributionRate || "",
      employeePF: user.payrollInformation?.employeePF || "",
      employerPf: user.payrollInformation?.employerPf || "",
      includeEsi: user.payrollInformation?.includeEsi ? "Yes" : "No",
      esiContribution: user.payrollInformation?.esiContribution || "",
      hraType: user.payrollInformation?.hraType || "",
      tdsCalculationBasedOn:
        user.payrollInformation?.tdsCalculationBasedOn || "",
      incomeTaxRegime: user.payrollInformation?.incomeTaxRegime || "",
    };
    console.log("Formatted user data: ", policyMap);

    res.status(200).json(formattedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkPassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { currentPassword } = req.body;
    const userExists = await User.findById({ _id: user });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userExists.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Passowrd verified" });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { newPassword, confirmPassword } = req.body;

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Passoword should be atleast 8 characters long" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find the user by ID and update the password
    const updatedUser = await User.findByIdAndUpdate(
      { _id: user },
      { $set: { password: hashedPassword } }, // Update the password field
      { new: true, runValidators: true }, // Return the updated document and enforce validation
    )
      .lean()
      .exec();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password: ", error);
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Update User";
  const logSourceKey = "user";
  try {
    const { user, ip, company } = req;
    const loggedInUserId = req.user;
    //const userId = req.user;
    const updateData = req.body.data ? JSON.parse(req.body.data) : null;
    const newProfilePicture = req.file;

    const targetEmpId = updateData?.empId;
    const targetUser = targetEmpId
      ? await User.findOne({ empId: targetEmpId, company }).lean().exec()
      : await User.findOne({ _id: loggedInUserId, company }).lean().exec();

    if (!targetUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const trimIfString = (value) =>
      typeof value === "string" ? value.trim() : value;
    const updatePayload = {};

    // KYC fields are intentionally blocked from profile updates
    const blockedSections = new Set(["bankInformation"]);
    const blockedTopLevelFields = new Set([
      "_id",
      "company",
      "createdAt",
      "updatedAt",
      "password",
      "refreshToken",
      "empId",
    ]);

    const addFlattenedFields = (value, path = [], rootKey = null) => {
      if (value === undefined) return;

      const currentRootKey = rootKey ?? path[0];
      if (currentRootKey && blockedSections.has(currentRootKey)) {
        return;
      }

      if (Array.isArray(value)) {
        updatePayload[path.join(".")] = value;
        return;
      }

      if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, childValue]) => {
          addFlattenedFields(childValue, [...path, key], currentRootKey || key);
        });
        return;
      }

      if (!path.length) return;
      updatePayload[path.join(".")] = trimIfString(value);
    };

    Object.entries(updateData || {}).forEach(([key, value]) => {
      if (blockedTopLevelFields.has(key)) return;
      addFlattenedFields(value, [key], key);
    });

    const incomingPolicies = updateData?.policies;
    if (incomingPolicies && typeof incomingPolicies === "object") {
      if (incomingPolicies.attendanceSource) {
        updatePayload.attendanceSource = trimIfString(
          incomingPolicies.attendanceSource,
        );
      }
      if (incomingPolicies.workSchedulePolicy) {
        updatePayload.shift = trimIfString(incomingPolicies.workSchedulePolicy);
      }
      delete updatePayload["policies.attendanceSource"];
      delete updatePayload["policies.workSchedulePolicy"];
      delete updatePayload["policies.leavePolicy"];
      delete updatePayload["policies.holidayPolicy"];
    }

    let profilePictureUpdate = null;

    if (newProfilePicture) {
      // const foundUser = await User.findOne({ _id: userId }).lean().exec();
      const foundUser = await User.findOne({ _id: targetUser._id })
        .lean()
        .exec();
      if (foundUser?.profilePicture?.id) {
        try {
          const response = await handleFileDelete(foundUser.profilePicture.id);
          if (response.result !== "ok") {
            throw new CustomError(
              "Failed to delete old profile picture",
              logPath,
              logAction,
              logSourceKey,
            );
          }
        } catch (error) {
          throw new CustomError(
            "Error deleting old profile picture: " + error.message,
            logPath,
            logAction,
            logSourceKey,
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
        `${foundCompany.companyName}/users/${foundUser.empId}-${foundUser.firstName}_${foundUser.lastName}/profile-picture`,
      );

      if (!uploadResult.public_id) {
        throw new CustomError(
          "Unable to upload profile picture",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      profilePictureUpdate = {
        id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };

      // Add to update payload
      updatePayload.profilePicture = profilePictureUpdate;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new CustomError(
        "No valid fields to update",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUser._id,
      { $set: updatePayload },
      { new: true, runValidators: true },
    ).select("-password");

    if (incomingPolicies && typeof incomingPolicies === "object") {
      const policyAgreements = [
        {
          name: "Work Schedule Policy",
          value: incomingPolicies.workSchedulePolicy,
        },
        { name: "Leave Policy", value: incomingPolicies.leavePolicy },
        { name: "Holiday Policy", value: incomingPolicies.holidayPolicy },
      ];

      await Promise.all(
        policyAgreements.map(async ({ name, value }) => {
          if (value === undefined || value === null || value === "") return;
          const stringValue = String(value);
          const isUrl = stringValue.startsWith("https");
          await Agreements.findOneAndUpdate(
            { user: targetUser._id, name },
            {
              $set: {
                name,
                user: targetUser._id,
                url: isUrl ? stringValue : undefined,
                type:
                  name === "Work Schedule Policy" && !isUrl
                    ? stringValue
                    : undefined,
                isActive: true,
                isDeleted: false,
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );
        }),
      );
    }

    if (!updatedUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    return res.status(200).json({
      message: "User data updated successfully",
      profilePicture: profilePictureUpdate || updatedUser.profilePicture,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error); // ← already has correct log values inside
      return; // optional: prevents falling through
    }

    // Generic error → wrap it with our logging context
    next(
      new CustomError(
        error.message || "Failed to update user profile",
        logPath,
        logAction,
        logSourceKey,
        500,
      ),
    );
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
        logSourceKey,
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
        logSourceKey,
      );
    }
    const departments = await Department.find().lean().exec();

    // Build a map of department departmentId to its ObjectId
    // const departmentMap = new Map(
    //   foundCompany.selectedDepartments.map((dep) => [
    //     dep.department.departmentId,
    //     dep.department._id,
    //   ])
    // );

    const departmentMap = new Map(
      departments.map((dept) => [dept.departmentId, dept._id]),
    );

    // Fetch roles and build a role map (assuming each role document has roleID)
    const roles = await Role.find().lean().exec();
    const roleMap = new Map(roles.map((role) => [role.roleID, role._id]));

    const newUsers = [];
    const newAgreements = [];

    const rowPromises = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString("utf-8").trim());
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          // Push a promise for each row's async processing
          rowPromises.push(
            (async () => {
              try {
                // console.log("Row keys:", Object.keys(row));
                const departmentIds = row["Department (ID)"]
                  ? row["Department (ID)"].split("/").map((d) => d.trim())
                  : [];

                // // console.log("map:", departmentMap);
                // console.log("deptIdsss", departmentIds);
                const departmentObjectIds = departmentIds.map((id) => {
                  if (!departmentMap.has(id)) {
                    throw new Error(`Invalid department: ${id}`);
                  }
                  return departmentMap.get(id);
                });

                const roleIds = row["Role ID"]
                  ? row["Role ID"].split("/").map((r) => r.trim())
                  : [];
                const roleObjectIds = roleIds
                  .map((id) => roleMap.get(id))
                  .filter(Boolean);

                // console.log("role map", roleMap);
                // console.log("roleObjectIds", roleObjectIds);
                let reportsToId = row["Reports To (Role ID)"]
                  ? roleMap.get(row["Reports To (Role ID)"].trim())
                  : null;

                // console.log("reportsToId", reportsToId);
                const hashedPassword = await bcrypt.hash(
                  `${row["First Name"].trim()}@0625`,
                  10,
                );

                const userObj = {
                  empId: row["Emp ID"],
                  firstName: row["First Name"].trim(),
                  middleName: row["Middle Name (optional)"].trim() || "",
                  lastName: row["Last Name"].trim(),
                  gender: row["Gender"].trim(),
                  dateOfBirth: new Date(row["Date Of Birth"]),
                  phone: row["Phone Number"],
                  email: row["Company Email"].trim().toLowerCase(),
                  company: new mongoose.Types.ObjectId(companyId),
                  password: hashedPassword,

                  departments: departmentObjectIds,
                  role: roleObjectIds,
                  reportsTo: reportsToId,
                  employeeType: {
                    name: row["Employement Type"] || "Full-Time",
                    leavesCount: [
                      {
                        leaveType: "Privileged",
                        count: row["Privileged Leave"] || "0",
                      },
                      { leaveType: "Sick", count: row["Sick Leave"] || "0" },
                    ],
                  },
                  designation: row["Designation"],
                  startDate: new Date(row["Date Of Joining"]),
                  // dateOfExit: new Date(row["Date of Exit"]) || null,
                  dateOfExit:
                    row["Date of Exit"] &&
                    !isNaN(Date.parse(row["Date of Exit"]))
                      ? new Date(row["Date of Exit"])
                      : null,

                  isActive: row["Date of Exit"] ? false : true,
                  workLocation: row["Work Building"],
                  shift: row["Shift Policy"] || "General",
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
                    includeInPayroll:
                      row["Include In Payroll (Yes/No)"] === "Yes",
                    professionTaxExemption:
                      row["Profession Tax Exemption"] === "Yes",
                    includePF: row["Include PF"] === "Yes",
                    pfContributionRate: parseFloat(
                      row["Employer PF Contri"] || "0",
                    ),
                    employeePF: parseFloat(row["Employee PF"] || "0"),
                  },
                  familyInformation: {
                    fatherName: row["Father's Name"] || "",
                    motherName: row["Mother's Name"] || "",
                    maritalStatus: row["Martial Status"] || "Single",
                  },
                };

                if (isNaN(userObj.dateOfBirth?.getTime())) {
                  console.log("Invalid DOB Row:", row);
                }

                if (isNaN(userObj.startDate?.getTime())) {
                  console.log("Invalid DOJ Row:", row);
                }

                newUsers.push(userObj);

                //Agreements Bulk Insertion

                const policies = [
                  "Shift Policy",
                  "Work Schedule Policy",
                  "Leave Policy",
                  "Holiday Policy",
                ];

                policies.forEach((p) => {
                  if (row[p]) {
                    newAgreements.push({
                      empId: row["Emp ID"],
                      name: p,
                      url: row[p].startsWith("https") ? row[p] : undefined,
                      type:
                        p === "Work Schedule Policy" &&
                        !row[p].startsWith("https")
                          ? row[p]
                          : undefined,
                      isActive: row["Date of Exit"] ? false : true,
                    });
                  }
                });
              } catch (error) {
                reject(
                  new CustomError(
                    error.message,
                    "hr/HrLog",
                    "Bulk Insert Users",
                    "user",
                  ),
                );
              }
            })(),
          );
        })
        .on("end", () => resolve())
        .on("error", (err) =>
          reject(
            new CustomError(
              err.message,
              "hr/HrLog",
              "Bulk Insert Users",
              "user",
            ),
          ),
        );
    });

    // Wait for all row processing to complete
    await Promise.all(rowPromises);

    if (newUsers.length === 0) {
      throw new CustomError(
        "No valid data found in CSV",
        "hr/HrLog",
        "Bulk Insert Users",
        "user",
      );
    }

    if (newAgreements.length === 0) {
      return res.status(400).json({
        message: "No valid data found in CSV while bulk inserting agreements",
      });
    }

    const uploadedUserData = await UserData.insertMany(newUsers);

    // const transformedAgreements = uploadedUserData.filter((user) => {
    //   const foundUsers = newAgreements.map((agreement) =>
    //     agreement.empId === user.empId
    //       ? { ...agreement, user: user._id }
    //       : agreement
    //   );

    //   console.log("foundUsers", foundUsers);
    //   return foundUsers;
    // });

    const transformedAgreements = newAgreements.map((agreement) => {
      const matchedUser = uploadedUserData.find(
        (user) => user.empId === agreement.empId,
      );

      return matchedUser ? { ...agreement, user: matchedUser._id } : agreement;
    });

    const uploadedAgreements = await Agreements.insertMany(
      transformedAgreements,
    );

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
        "user",
      ),
    );
  }
};

const getAssignees = async (req, res, next) => {
  try {
    const { company, departments, user } = req;
    const { deptId } = req.query;

    let departmentIds = [];

    if (deptId && !mongoose.Types.ObjectId.isValid(deptId)) {
      return res
        .status(400)
        .json({ message: "Invalid Department ID provided" });
    }
    if (!deptId) {
      departmentIds = departments.map((dept) => dept._id);
    } else {
      departmentIds = [...departmentIds, deptId];
    }

    const team = await User.find({
      _id: { $ne: user },
      company,
      departments: { $in: departmentIds },
      isActive: true,
    })
      .select("_id firstName lastName")
      .populate({
        path: "role",
        select: "roleTitle",
      });

    if (!team?.length) {
      return res.status(200).json([]);
    }

    const transformAssignees = team.map((assignee) => {
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

const getEmployeePoliciesByEmpId = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await UserData.findOne(
      { empId: employeeId },
      { policies: 1, firstName: 1, lastName: 1, empId: 1 },
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      empId: employee.empId,
      name: `${employee.firstName} ${employee.lastName}`,
      policies: employee.policies,
    });
  } catch (error) {
    console.error("Error fetching employee policies:", error);
    res.status(500).json({ message: "Failed to fetch employee policies" });
  }
};

module.exports = {
  createUser,
  fetchUser,
  fetchSingleUser,
  updateProfile,
  bulkInsertUsers,
  getAssignees,
  checkPassword,
  updatePassword,
  getEmployeePoliciesByEmpId,
};
