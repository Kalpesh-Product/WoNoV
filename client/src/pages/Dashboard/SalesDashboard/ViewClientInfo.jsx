import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { useLocation } from "react-router-dom";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import humanDate from "../../../utils/humanDateForamt";
import { inrFormat } from "../../../utils/currencyFormat";
import { toast } from "sonner";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  isAlphanumeric,
  isValidEmail,
  isValidPhoneNumber,
  noOnlyWhitespace,
} from "../../../utils/validators";

const ViewClientInfo = () => {
  const location = useLocation();
  const selectedLead = location?.state?.selectedLead || null;

   const [isEditing, setIsEditing] = useState(Boolean(location?.state?.editMode));

 const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      dateOfContact: "",
      companyName: "",
      serviceCategory: "",
      leadStatus: "",
      proposedLocations: "",
      sector: "",
      headOfficeLocation: "",
      officeInGoa: "",
      pocName: "",
      designation: "",
      contactNumber: "",
      emailAddress: "",
      leadSource: "",
      period: "",
      openDesks: "",
      cabinDesks: "",
      totalDesks: "",
      serviceName: "",
      clientBudget: "",
      startDate: "",
      lastFollowUpDate: "",
      remarksComments: "",
    },
  });

  useEffect(() => {
    if (selectedLead) {
      reset({
        dateOfContact: selectedLead?.dateOfContact || "",
        companyName: selectedLead?.companyName || "",
        serviceCategory:
          selectedLead?.serviceCategory?.serviceName || selectedLead?.serviceName || "",
        leadStatus: selectedLead?.leadStatus || "",
        proposedLocations:
          selectedLead?.proposedLocations?.unitNo ||
          selectedLead?.proposedLocations?.unitName ||
          selectedLead?.proposedLocationsLabel ||
          "",
        sector: selectedLead?.sector || "",
        headOfficeLocation: selectedLead?.headOfficeLocation || "",
        officeInGoa:
          selectedLead?.officeInGoa === true
            ? "Yes"
            : selectedLead?.officeInGoa === false
            ? "No"
            : selectedLead?.officeInGoa || "",
        pocName: selectedLead?.pocName || "",
        designation: selectedLead?.designation || "",
        contactNumber: selectedLead?.contactNumber || "",
        emailAddress: selectedLead?.emailAddress || "",
        leadSource: selectedLead?.leadSource || "",
        period: selectedLead?.period || "",
        openDesks: selectedLead?.openDesks || 0,
        cabinDesks: selectedLead?.cabinDesks || 0,
        totalDesks: selectedLead?.totalDesks || 0,
        clientBudget: selectedLead?.clientBudget || "",
        startDate: selectedLead?.startDate || "",
        remarksComments: selectedLead?.remarksComments || "",
        lastFollowUpDate: selectedLead?.lastFollowUpDate || "",
        // leadStatus: selectedLead?.leadStatus || "",
        // sector: selectedLead?.sector || "",
        // serviceName: selectedLead?.serviceName || "",
        // clientBudget: selectedLead?.clientBudget || "",
        // dateOfContact: selectedLead?.dateOfContact || "",
        // lastFollowUpDate: selectedLead?.lastFollowUpDate || "",
        // remarksComments: selectedLead?.remarksComments || "",
      });
    }
  }, [selectedLead, reset]);

  const onSubmit = (data) => {
    console.log("Updated client info:", data);
    toast.success("Client details updated");
    setIsEditing(false);
  };

  const handleReset = () => reset();

  const handleEditToggle = () => setIsEditing(!isEditing);
  
const getDisplayValue = (name, type) => {
    const value = getValues(name);

    if (name === "clientBudget") return `INR ${inrFormat(value || 0)}`;
    if (type === "date") return value ? humanDate(value) : "—";
    return value || "—";
  };

  const fields = [
    { name: "dateOfContact", label: "Date of Contact", type: "date" },
    {
      name: "companyName",
      label: "Company Name",
      rules: { validate: noOnlyWhitespace },
    },
     { name: "serviceCategory", label: "Service Category" },
    {
      name: "leadStatus",
      label: "Lead Status",
      type: "select",
      options: ["Cold", "Mild", "Hot", "Closed", "HOT", "MILD", "COLD"],
      rules: { required: "Lead Status is required" },
    },
    { name: "proposedLocations", label: "Proposed Locations" },
    { name: "sector", label: "Sector" },
    { name: "headOfficeLocation", label: "Head Office Location" },
    {
      name: "officeInGoa",
      label: "Office In Goa",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "pocName",
      label: "POC Name",
      rules: { validate: noOnlyWhitespace },
    },
    {
      name: "designation",
      label: "Designation",
      rules: { validate: isAlphanumeric },
    },
    {
      name: "contactNumber",
      label: "Contact Number",
      rules: { validate: isValidPhoneNumber },
    },
    { name: "emailAddress", label: "Email", rules: { validate: isValidEmail } },
     { name: "leadSource", label: "Lead Source" },
    { name: "period", label: "Period" },
    { name: "openDesks", label: "Open Desks", inputType: "number" },
    { name: "cabinDesks", label: "Cabin Desks", inputType: "number" },
    { name: "totalDesks", label: "Total Desks", inputType: "number" },
    {
      name: "clientBudget",
      label: "Client Budget",
      inputType: "number",
    },
   { name: "startDate", label: "Start Date", type: "date" },
    {
      name: "remarksComments",
      label: "Remarks",
      rules: { validate: noOnlyWhitespace },
    },
     {
      name: "lastFollowUpDate",
      label: "Last Follow-up Date",
      type: "date",
      // editOnly: true,
    },
  ];

  if (!selectedLead) {
    return (
      <div className="p-4 text-red-500 font-semibold">
        No client selected. Please go back and select a client.
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-subtitle font-pmedium text-primary">
          Client Details
        </span>
        <PrimaryButton
          handleSubmit={handleEditToggle}
          title={isEditing ? "Cancel" : "Edit"}
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="h-[60vh] overflow-y-auto"
      >
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* {fields.map(({ name, label, type, rules, options, inputType }) => ( */}
            {fields
            .filter(({ editOnly }) => isEditing || !editOnly)
            .map(({ name, label, type, rules, options, inputType }) => (
            <div key={name}>
              {isEditing ? (
                <Controller
                  name={name}
                  control={control}
                  rules={rules}
                  render={({ field }) =>
                    type === "date" ? (
                      <DatePicker
                        {...field}
                        format="DD-MM-YYYY"
                        value={
                          field.value && dayjs(field.value).isValid()
                            ? dayjs(field.value)
                            : null
                        }
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : "")
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            label,
                            error: !!errors[name],
                            helperText: errors[name]?.message,
                          },
                        }}
                      />
                    ) : type === "select" ? (
                      <TextField
                        {...field}
                        select
                        size="small"
                        label={label}
                        fullWidth
                        error={!!errors[name]}
                        helperText={errors[name]?.message}
                      >
                        {options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        {...field}
                        size="small"
                        label={label}
                        fullWidth
                        type={inputType || "text"}
                        error={!!errors[name]}
                        helperText={errors[name]?.message}
                      />
                    )
                  }
                />
              ) : (
                <div className="py-2 flex justify-between items-start gap-2">
                  <div className="w-[70%] justify-start flex">
                    <span className="font-pmedium text-gray-600 text-content">
                      {label}
                    </span>
                  </div>
                  <div>:</div>
                  <div className="w-full">
                    <span className="text-gray-500">
                       {getDisplayValue(name, type)}
                      {/* {name === "clientBudget"
                        ? `INR ${inrFormat(selectedLead?.[name] || 0)}`
                        : type === "date"
                        ? humanDate(selectedLead?.[name])
                        : selectedLead?.[name] || "—"} */}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <PrimaryButton
              title="Submit"
              handleSubmit={handleSubmit(onSubmit)}
            />
            <SecondaryButton title="Reset" handleSubmit={handleReset} />
          </div>
        )}
      </form>
    </div>
  );
};

export default ViewClientInfo;
