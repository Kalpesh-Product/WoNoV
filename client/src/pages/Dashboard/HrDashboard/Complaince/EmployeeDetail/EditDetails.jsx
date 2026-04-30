import { MenuItem, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import SecondaryButton from "../../../../../components/SecondaryButton";
import { toast } from "sonner";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useLocation, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useSelector } from "react-redux";
import useAuth from "../../../../../hooks/useAuth";
import { PERMISSIONS } from "../../../../../constants/permissions";
import { Checkbox, ListItemText } from "@mui/material";
import { City, State } from "country-state-city";
dayjs.extend(customParseFormat);

const EditDetails = () => {
  const location = useLocation();
  // const { employmentID } = location.state;
  const employmentID = useSelector((state) => state.hr.selectedEmployee);
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ["employeeData"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/users/fetch-single-user/${employmentID}`,
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  // const { control, handleSubmit, reset } = useForm({
  //   defaultValues: {
  //     firstName: "Aiwin",
  //     middleName: "Raj",
  //     lastName: "K.S",
  //     gender: "Male",
  //     dob: "1990-01-01",
  //     employeeID: "WO01",
  //     mobilePhone: "7904895106",
  //     startDate: "1990-01-01",
  //     workLocation: "Bangalore",
  //     employeeType: "Full-Time",
  //     department: "Engineering",
  //     reportsTo: "Kalpesh Naik",
  //     jobTitle: "Software Engineer",
  //     jobDescription:
  //       "Responsible for developing and maintaining web applications.",
  //     shift: "Day Shift",
  //     workSchedulePolicy: "Standard 9-5",
  //     attendanceSource: "Biometric",
  //     leavePolicy: "Standard",
  //     holidayPolicy: "Company Approved",
  //     status: "Active",
  //     aadharID: "1234-5678-9123",
  //     pan: "ABCDE1234F",
  //     pfAcNo: "PF123456789",
  //     addressLine1: "123, Tech Park",
  //     addressLine2: "Near City Center",
  //     state: "Karnataka",
  //     city: "Bangalore",
  //     pinCode: "560001",
  //     includeInPayroll: "Yes",
  //     payrollBatch: "Batch A",
  //     professionTaxExemption: "No",
  //     includePF: "Yes",
  //     pfContributionRate: "12%",
  //     employeePF: "1500",
   const { control, handleSubmit, reset, watch } = useForm({ defaultValues: {} });
  const selectedStateCode = watch("state");
  const cityOptions = useMemo(
    () =>
      selectedStateCode ? City.getCitiesOfState("IN", selectedStateCode) : [],
    [selectedStateCode],
  );

  const { data: departmentsData = [] } = useQuery({
    queryKey: ["departmentsData"],
    queryFn: async () => {
      const response = await axios.get("/api/departments/get-departments");
      return response.data || [];
    },
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ["usersData"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return Array.isArray(response.data) ? response.data : [];
    },
  });
  const { data: rolesData = [] } = useQuery({
    queryKey: ["rolesData"],
    queryFn: async () => {
      const response = await axios.get("/api/roles/get-roles");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const normalizedDepartments = useMemo(
    () =>
      Array.isArray(employeeData?.departments)
        ? employeeData.departments
        : employeeData?.departments
          ? [employeeData.departments]
          : [],
    [employeeData?.departments],
  );

  const departmentIds = useMemo(
    () =>
      normalizedDepartments
        .map((item) => (typeof item === "object" ? item?._id || item?.name : item))
        .filter(Boolean),
    [normalizedDepartments],
  );

  const departmentNames = useMemo(
    () =>
      normalizedDepartments
        .map((item) => (typeof item === "object" ? item?.name : item))
        .filter(Boolean),
    [normalizedDepartments],
  );

  const normalizedRoles = useMemo(() => {
    if (Array.isArray(employeeData?.role)) return employeeData.role;
    if (employeeData?.role) return [employeeData.role];
    return [];
  }, [employeeData?.role]);

  const normalizedReportsTo = useMemo(() => {
    const value = employeeData?.reportsTo;
    if (!value) return "";
    if (typeof value === "object") return value?._id || "";

    const matchedUser = usersData.find((user) => {
      const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
      return (
        user?._id === value ||
        fullName.toLowerCase() === String(value).toLowerCase() ||
        `${fullName} (${user?.role?.[0]?.roleTitle || ""})`
          .trim()
          .toLowerCase() === String(value).toLowerCase()
      );
    });

    return matchedUser?._id || value;
  }, [employeeData?.reportsTo, usersData]);

  const adminRoles = useMemo(
    () =>
      rolesData.filter((role) =>
        role?.roleTitle?.toLowerCase().endsWith("admin"),
      ),
    [rolesData],
  );

  const stateOptions = useMemo(() => State.getStatesOfCountry("IN"), []);
 const stateNameByCode = useMemo(
    () =>
      stateOptions.reduce((acc, stateItem) => {
        acc[stateItem.isoCode] = stateItem.name;
        return acc;
      }, {}),
    [stateOptions],
  );

  const normalizedStateCode = useMemo(() => {
    const stateValue = employeeData?.state;
    if (!stateValue) return "";
    if (stateOptions.some((stateItem) => stateItem.isoCode === stateValue)) {
      return stateValue;
    }
    const matchedState = stateOptions.find(
      (stateItem) =>
        stateItem.name.toLowerCase() === String(stateValue).toLowerCase(),
    );
    return matchedState?.isoCode || "";
  }, [employeeData?.state, stateOptions]);
  useEffect(() => {
    if (!employeeData) return;

    reset({
      ...employeeData,
      // status:
      //   employeeData.status || (employeeData.isActive ? "Active" : "Inactive"),
      dob: employeeData?.dob,
      mobilePhone: employeeData?.mobilePhone || "",
      //mobilePhone: employeeData?.phone,
      //employeeType: employeeData?.employeeType?.name || employeeData?.employeeType,
      employeeType:
       typeof employeeData?.employeeType === "object"
      ? employeeData?.employeeType?.name
      : employeeData?.employeeType || "",
      department: normalizeDepartmentIds(departmentIds),
      role: normalizedRoles
        .map((item) => (typeof item === "object" ? item?._id : item))
        .filter(Boolean),
      reportsTo: normalizedReportsTo,
      shift: employeeData?.shift || "",
      workSchedulePolicy: employeeData?.workSchedulePolicy || "",
      attendanceSource: employeeData?.attendanceSource || "",
      leavePolicy: employeeData?.leavePolicy || "",
      holidayPolicy: employeeData?.holidayPolicy || "",
            state: normalizedStateCode,
      city: employeeData?.city || employeeData?.address?.city || "",
      aadharID:
        employeeData?.panAadhaarDetails?.aadhaarId ||
        employeeData?.aadhaarID ||
        "",
      pan: employeeData?.panAadhaarDetails?.pan || employeeData?.pan || "",
       pfAcNo:
        employeeData?.panAadhaarDetails?.pfAccountNumber ||
        employeeData?.pfAccountNumber ||
        "",
      pfContributionRate: employeeData?.payrollInformation?.pfContributionRate || "",
     // pFContributionRate: employeeData?.payrollInformation?.pfContributionRate || "",
       payrollBatch:
        employeeData?.payrollInformation?.payrollBatch ||
        employeeData?.payrollBatch ||
        "",
      //employeePF: employeeData?.payrollInformation?.employeePF || "",
      status: employeeData?.status || (employeeData?.isActive ? "Active" : "Inactive"),
    });
  }, [employeeData, departmentIds, normalizedReportsTo, normalizedRoles, normalizedStateCode, reset]);  
  // }, [employeeData, reset]);

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const hasEmployeeEditAccess = userPermissions.includes(
    PERMISSIONS.HR_EMPLOYEE_EDIT.value,
  );

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

const normalizeDepartmentIds = (departmentsValue) => {
    const values = Array.isArray(departmentsValue)
      ? departmentsValue
      : departmentsValue
        ? [departmentsValue]
        : [];

    return values
      .map((value) => {
        if (!value) return null;
        if (typeof value === "object") return value?._id || null;
        if (/^[a-f\d]{24}$/i.test(value)) return value;

        const matchedDepartment = departmentsData.find(
          (department) =>
            department?.name?.trim().toLowerCase() ===
            String(value).trim().toLowerCase(),
        );

        return matchedDepartment?._id || null;
      })
      .filter(Boolean);
  };

  const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["yes", "true", "1"].includes(normalized)) return true;
      if (["no", "false", "0"].includes(normalized)) return false;
    }
    return undefined;
  };

  const updateEmployeeStatus = useMutation({
    // mutationFn: async (statusValue) => {
    //   return axios.patch("/api/users/update-single-user", {
     mutationFn: async (formData) => {
      const payload = {
        empId: employmentID,
        //isActive: statusValue === "Active",
        firstName: formData?.firstName || "",
        middleName: formData?.middleName || "",
        lastName: formData?.lastName || "",
        gender: formData?.gender || "",
        dob: formData?.dob || "",
        employeeID: formData?.employeeID || "",
        phone: formData?.mobilePhone || "",
        startDate: formData?.startDate || "",
        workLocation: formData?.workLocation || "",
        // employeeType: formData?.employeeType
        //   ? typeof formData.employeeType === "object"
        //     ? formData.employeeType
        //     : { name: formData.employeeType }
        //   : undefined,
        departments: normalizeDepartmentIds(formData?.department),
        department: normalizeDepartmentIds(formData?.department),
        reportsTo:
          usersData.find((user) => user?._id === formData?.reportsTo)?._id ||
          usersData.find((user) =>
            user?.role?.some((assignedRole) => assignedRole?._id === formData?.reportsTo),
          )?._id ||
          (/^[a-f\d]{24}$/i.test(formData?.reportsTo || "")
            ? formData?.reportsTo
            : undefined),
        // role: Array.isArray(formData?.role)
        //   ? formData.role
        //   : formData?.role
        //     ? [formData.role]
        //     : [],
        role: Array.isArray(formData?.role)
        ? formData.role.filter((id) => /^[a-f\d]{24}$/i.test(id))
        : [],
        jobTitle: formData?.jobTitle || "",
        jobDescription: formData?.jobDescription || "",
        shift: formData?.shift || "",
        attendanceSource: formData?.attendanceSource || "",
        leavePolicy: formData?.leavePolicy || "",
        holidayPolicy: formData?.holidayPolicy || "",
        addressLine1: formData?.addressLine1 || "",
        addressLine2: formData?.addressLine2 || "",
        state: formData?.state || "",
        city: formData?.city || "",
        pinCode: formData?.pinCode || "",
        includeInPayroll: normalizeBoolean(formData?.includeInPayroll),
        payrollBatch: formData?.payrollBatch || "",
        professionalTaxExemption: normalizeBoolean(
          formData?.professionalTaxExemption,
        ),
        includePF: normalizeBoolean(formData?.includePF),
        pfContributionRate:
          formData?.pfContributionRate || formData?.pFContributionRate || "",
        employeePF: formData?.employeePF || "",
        policies: {
          workSchedulePolicy: formData?.workSchedulePolicy || "",
          attendanceSource: formData?.attendanceSource || "",
          leavePolicy: formData?.leavePolicy || "",
          holidayPolicy: formData?.holidayPolicy || "",
        },
        panAadhaarDetails: {
          aadhaarId: formData?.aadharID || "",
          pan: formData?.pan || "",
          pfAccountNumber: formData?.pfAcNo || "",
        },
        payrollInformation: {
          payrollBatch: formData?.payrollBatch || "",
          pfContributionRate:
            formData?.pfContributionRate || formData?.pFContributionRate || "",
          employeePF: formData?.employeePF || "",
          includeInPayroll: normalizeBoolean(formData?.includeInPayroll),
          professionTaxExemption: normalizeBoolean(
            formData?.professionalTaxExemption,
          ),
          includePF: normalizeBoolean(formData?.includePF),
        },
        status: formData?.status,
        isActive: formData?.status === "Active",
      };

      return axios.patch("/api/users/update-single-user", payload);
    },
    onSuccess: () => {
      toast.success("User details updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["employeeData"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["past-employees"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update employee details",
      );
    },
  });

  const onSubmit = (data) => {
    // setIsEditing(!isEditing);
    // toast.success("User details updated successfully");
    //updateEmployeeStatus.mutate(data.status);
    updateEmployeeStatus.mutate(data);
  };

  const handleReset = () => {
    reset();
  };

  const transformEmployeeData = isLoading
    ? []
    : {
        ...employeeData,
        dob:
          employeeData.dob && dayjs(employeeData.dob).isValid()
            ? dayjs(employeeData.dob).format("DD-MM-YYYY")
            : "",
        startDate:
          employeeData.startDate && dayjs(employeeData.startDate).isValid()
            ? dayjs(employeeData.startDate).format("DD-MM-YYYY")
            : "",
        status:
          employeeData?.status ||
          (employeeData?.isActive ? "Active" : "Inactive"),
        department: departmentNames.join(", "),
        reportsTo:
        usersData.find((user) => user?._id === normalizedReportsTo)
            ? `${usersData.find((user) => user?._id === normalizedReportsTo)?.firstName || ""} ${usersData.find((user) => user?._id === normalizedReportsTo)?.lastName || ""}`.trim()
            : employeeData?.reportsTo || "",
        role: normalizedRoles
          .map((item) =>
            typeof item === "object" ? item?.roleTitle || item?.name : item,
          )
          .filter(Boolean).join(", "),
        workSchedulePolicy: employeeData?.workSchedulePolicy || "",
        attendanceSource: employeeData?.attendanceSource || "",
        leavePolicy: employeeData?.leavePolicy || "",
        holidayPolicy: employeeData?.holidayPolicy || "",
        aadharID:
          employeeData?.panAadhaarDetails?.aadhaarId ||
          employeeData?.aadhaarID ||
          "",
        pan: employeeData?.panAadhaarDetails?.pan || employeeData?.pan || "",
        pfAcNo:
          employeeData?.panAadhaarDetails?.pfAccountNumber ||
          employeeData?.pfAccountNumber ||
          "",
        state:
          stateNameByCode[normalizedStateCode] || employeeData?.state || "",
        city: employeeData?.city || employeeData?.address?.city || "",
        pFContributionRate:
          employeeData?.payrollInformation?.pfContributionRate || "",
        payrollBatch:
          employeeData?.payrollInformation?.payrollBatch ||
          employeeData?.payrollBatch ||
          "",
        employeePF: employeeData?.payrollInformation?.employeePF || "",
        includeInPayroll:
          employeeData?.payrollInformation?.includeInPayroll ?? "",
        professionalTaxExemption:
          employeeData?.payrollInformation?.professionTaxExemption ?? "",
        includePF: employeeData?.payrollInformation?.includePF ?? "",
      };

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4 ">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-subtitle font-pmedium text-primary">
            Edit Employee
          </span>
        </div>
        {!isEditing ? (
          <div>
            <PrimaryButton
              disabled={!hasEmployeeEditAccess}
              handleSubmit={handleEditToggle}
              title={"Edit"}
            />
          </div>
        ) : (
          <div>
            <PrimaryButton
              handleSubmit={() => setIsEditing(false)}
              title={"Cancel"}
            />
          </div>
        )}
      </div>

      <div className="h-[51vh] overflow-y-auto">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {/* Section: Basic Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Basic Information
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {isLoading
                    ? []
                    : [
                        "firstName",
                        "middleName",
                        "lastName",
                        "gender",
                        "dob",
                        "employeeID",
                        "mobilePhone",
                      ].map((fieldKey) => (
                        <div key={fieldKey}>
                          {isEditing ? (
                            <Controller
                              name={fieldKey}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  size="small"
                                  label={fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace(/\bI\sD\b/gi, "ID")}
                                  fullWidth
                                />
                              )}
                            />
                          ) : (
                            <div className="py-2 flex justify-between items-center gap-2">
                              <div className="w-[100%] justify-start flex">
                                <span className="font-pmedium text-gray-600 text-content">
                                  {fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace(/\bI\sD\b/gi, "ID")}
                                </span>{" "}
                              </div>
                              <div className="">
                                <span>:</span>
                              </div>
                              <div className="w-full">
                                <span className="text-gray-500">
                                  {transformEmployeeData[fieldKey]}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>

              <div>
                {/* Section: Job Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Job Information
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {isLoading
                    ? []
                    : [
                        "startDate",
                        "workLocation",
                        "employeeType",
                        "department",
                        "role",
                        "reportsTo",
                        "jobTitle",
                      ].map((fieldKey) => (
                        <div key={fieldKey}>
                          {isEditing ? (
                            <Controller
                              name={fieldKey}
                              control={control}
                              render={({ field }) => (
                                // <TextField
                                //   {...field}
                                //   size="small"
                                //   label={fieldKey
                                //     .replace(/([A-Z])/g, " $1")
                                //     .replace(/^./, (str) => str.toUpperCase())}
                                //   fullWidth
                                // />
                                 fieldKey === "department" ? (
                                  <TextField
                                    {...field}
                                    value={field.value || []}
                                    size="small"
                                    label="Department"
                                    fullWidth
                                    select
                                    SelectProps={{
                                      multiple: true,
                                      renderValue: (selected) =>
                                        selected
                                          .map(
                                            (deptId) =>
                                              departmentsData.find((item) => item._id === deptId)
                                                ?.name || deptId,
                                          )
                                          .join(", "),
                                    }}
                                  >
                                    {departmentsData.map((department) => (
                                      <MenuItem key={department._id} value={department._id}>
                                        <Checkbox checked={field.value?.includes(department._id)} />
                                        <ListItemText primary={department.name} />
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : fieldKey === "role" ? (
                                  <TextField
                                    {...field}
                                    value={field.value || []}
                                    size="small"
                                    label="Role"
                                    fullWidth
                                    select
                                    SelectProps={{
                                      multiple: true,
                                      renderValue: (selected) =>
                                        selected
                                          .map(
                                            (roleId) =>
                                              rolesData.find((item) => item._id === roleId)
                                                ?.roleTitle || roleId,
                                          )
                                          .join(", "),
                                    }}
                                  >
                                    <MenuItem value="" disabled>Select Role</MenuItem>
                                    {rolesData.map((role) => (
                                      <MenuItem key={role._id} value={role._id}>
                                        <Checkbox checked={field.value?.includes(role._id)} />
                                        <ListItemText primary={role.roleTitle} />
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : fieldKey === "reportsTo" ? (
                                  <TextField {...field} size="small" label="Reports To" fullWidth select>
                                    <MenuItem value="">Select Reporting Manager</MenuItem>
                                     {usersData
                                      .filter((user) =>
                                        user?.role?.some((assignedRole) =>
                                          adminRoles.some(
                                            (adminRole) => adminRole?._id === assignedRole?._id,
                                          ),
                                        ),
                                      )
                                      .map((user) => {
                                        const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
                                        const firstRole = user?.role?.[0]?.roleTitle || "";
                                        return (
                                          <MenuItem key={user._id} value={user._id}>
                                            {`${fullName}${firstRole ? ` (${firstRole})` : ""}`}
                                          </MenuItem>
                                        );
                                      })}
                                  </TextField>
                                ) : (
                                  <TextField
                                    {...field}
                                    size="small"
                                    label={fieldKey
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) => str.toUpperCase())}
                                    fullWidth
                                  />
                                )
                              )}
                            />
                          ) : (
                            <div className="py-2 flex justify-between items-start gap-2">
                              <div className="w-[35%] justify-start flex">
                                <span className="font-pmedium text-gray-600 text-content">
                                  {fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </span>{" "}
                              </div>
                              <div className="">
                                <span>:</span>
                              </div>
                              <div className="w-full">
                                <span className="text-gray-500">
                                  {transformEmployeeData[fieldKey]}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
              <div>
                {/* Section: Job Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">Policies</span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {isLoading
                    ? []
                    : [
                        "shift",
                        "workSchedulePolicy",
                        "attendanceSource",
                        "leavePolicy",
                        "holidayPolicy",
                        "status",
                      ].map((fieldKey) => (
                        <div key={fieldKey}>
                          {isEditing ? (
                            <Controller
                              name={fieldKey}
                              control={control}
                              render={({ field }) =>
                                fieldKey === "status" ? (
                                  <TextField
                                    {...field}
                                    select
                                    size="small"
                                    label="Status"
                                    fullWidth
                                  >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">
                                      Inactive
                                    </MenuItem>
                                  </TextField>
                                    ) : fieldKey === "workSchedulePolicy" ? (
                                  <TextField
                                    {...field}
                                    select
                                    size="small"
                                    label="Work Schedule Policy"
                                    fullWidth
                                  >
                                    <MenuItem value="General Shift">General Shift</MenuItem>
                                    <MenuItem value="Night Shift">Night Shift</MenuItem>
                                  </TextField>
                                ) : fieldKey === "attendanceSource" ? (
                                  <TextField
                                    {...field}
                                    select
                                    size="small"
                                    label="Attendance Source"
                                    fullWidth
                                  >
                                    <MenuItem value="web">Web</MenuItem>
                                    <MenuItem value="mobile">Mobile</MenuItem>
                                  </TextField>
                                ) : (
                                  <TextField
                                    {...field}
                                    size="small"
                                    label={fieldKey
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase(),
                                      )}
                                    fullWidth
                                  />
                                )
                              }
                            />
                          ) : (
                            <div className="py-2 flex justify-between items-center gap-2">
                              <div className="w-[100%] justify-start flex">
                                <span className="font-pmedium text-gray-600 text-content">
                                  {fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </span>{" "}
                              </div>
                              <div className="">
                                <span>:</span>
                              </div>
                              <div className="w-full">
                                {["leavePolicy", "holidayPolicy"].includes(
                                  fieldKey,
                                ) && transformEmployeeData[fieldKey] ? (
                                  <a
                                    href={transformEmployeeData[fieldKey]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    {fieldKey
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase(),
                                      )}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">
                                    {transformEmployeeData[fieldKey]}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
              <div>
                {/* Section: Job Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">KYC</span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {isLoading
                    ? []
                    //: ["aadharID", "pan", "pFAcNo"].map((fieldKey) => (
                      : ["aadharID", "pan", "pfAcNo"].map((fieldKey) => (
                        <div key={fieldKey}>
                          {isEditing ? (
                            <Controller
                              name={fieldKey}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  size="small"
                                  label={fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace(/\bI\sD\b/gi, "ID")
                                    .replace(/\bP\sF\b/gi, "PF")}
                                  fullWidth
                                />
                              )}
                            />
                          ) : (
                            <div className="py-2 flex justify-between items-center gap-2">
                              <div className="w-[35%] justify-start flex">
                                <span className="font-pmedium text-gray-600 text-content">
                                  {fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace(/\bI\sD\b/gi, "ID")
                                    .replace(/\bP\sF\b/gi, "PF")}
                                </span>{" "}
                              </div>
                              <div className="">
                                <span>:</span>
                              </div>
                              <div className="w-full">
                                <span className="text-gray-500">
                                  {transformEmployeeData[fieldKey]}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
              <div>
                {/* Section: Job Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Home Address Information
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {isLoading
                    ? []
                    : [
                        "addressLine1",
                        "addressLine2",
                        "state",
                        "city",
                        "pinCode",
                      ].map((fieldKey) => (
                        <div key={fieldKey}>
                          {isEditing ? (
                            <Controller
                              name={fieldKey}
                              control={control}
                              render={({ field }) => (
                                // <TextField
                                //   {...field}
                                //   size="small"
                                //   label={fieldKey
                                //     .replace(/([A-Z])/g, " $1")
                                //     .replace(/^./, (str) => str.toUpperCase())}
                                //   fullWidth
                                // />
                                fieldKey === "state" ? (
                                  <TextField {...field} size="small" label="State" fullWidth select>
                                    <MenuItem value="">Select State</MenuItem>
                                    {stateOptions.map((state) => (
                                      <MenuItem key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : fieldKey === "city" ? (
                                  <TextField {...field} size="small" label="City" fullWidth select>
                                    <MenuItem value="">Select City</MenuItem>
                                    {cityOptions.map((city) => (
                                      <MenuItem key={city.name} value={city.name}>
                                        {city.name}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : (
                                  <TextField
                                    {...field}
                                    size="small"
                                    label={fieldKey
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) => str.toUpperCase())}
                                    fullWidth
                                  />
                                )
                              )}
                            />
                          ) : (
                            <div className="py-2 flex justify-between items-center gap-2">
                              <div className="w-[35%] justify-start flex">
                                <span className="font-pmedium text-gray-600 text-content">
                                  {fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </span>{" "}
                              </div>
                              <div className="">
                                <span>:</span>
                              </div>
                              <div className="w-full">
                                <span className="text-gray-500">
                                  {transformEmployeeData[fieldKey]}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
              <div>
                {/* Section: Job Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Payroll Information
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {isLoading
                    ? []
                    : [
                        "includeInPayroll",
                        "payrollBatch",
                        "professionalTaxExemption",
                        "includePF",
                        "pFContributionRate",
                        "employeePF",
                      ].map((fieldKey) => (
                        <div key={fieldKey}>
                          {isEditing ? (
                            <Controller
                              name={fieldKey}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  size="small"
                                  label={fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace(/\bP\sF\b/gi, "PF")}
                                  fullWidth
                                />
                              )}
                            />
                          ) : (
                            <div className="py-2 flex justify-between items-center gap-2">
                              <div className="w-[100%] justify-start flex">
                                <span className="font-pmedium text-gray-600 text-content">
                                  {fieldKey
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace(/\bP\sF\b/gi, "PF")}
                                </span>{" "}
                              </div>
                              <div className="">
                                <span>:</span>
                              </div>
                              <div className="w-full">
                                <span className="text-gray-500">
                                  {transformEmployeeData[fieldKey]}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="flex items-center justify-center gap-2 py-4">
                <PrimaryButton
                  title={"Submit"}
                  handleSubmit={
                    isEditing ? handleSubmit(onSubmit) : handleEditToggle
                  }
                  disabled={updateEmployeeStatus.isPending}
                />
                {isEditing && (
                  <SecondaryButton title={"Reset"} handleSubmit={handleReset} />
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDetails;
