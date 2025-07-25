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

  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      companyName: "",
      pocName: "",
      designation: "",
      contactNumber: "",
      emailAddress: "",
      leadStatus: "",
      sector: "",
      serviceName: "",
      clientBudget: "",
      dateOfContact: "",
      lastFollowUpDate: "",
      remarksComments: "",
    },
  });

  useEffect(() => {
    if (selectedLead) {
      reset({
        companyName: selectedLead?.companyName || "",
        pocName: selectedLead?.pocName || "",
        designation: selectedLead?.designation || "",
        contactNumber: selectedLead?.contactNumber || "",
        emailAddress: selectedLead?.emailAddress || "",
        leadStatus: selectedLead?.leadStatus || "",
        sector: selectedLead?.sector || "",
        serviceName: selectedLead?.serviceName || "",
        clientBudget: selectedLead?.clientBudget || "",
        dateOfContact: selectedLead?.dateOfContact || "",
        lastFollowUpDate: selectedLead?.lastFollowUpDate || "",
        remarksComments: selectedLead?.remarksComments || "",
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

  const fields = [
    {
      name: "companyName",
      label: "Company Name",
      rules: { validate: noOnlyWhitespace },
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
    {
      name: "leadStatus",
      label: "Lead Status",
      type: "select",
      options: ["HOT", "MILD", "COLD"],
      rules: { required: "Lead Status is required" },
    },
    { name: "sector", label: "Sector" },
    { name: "serviceName", label: "Service" },
    {
      name: "clientBudget",
      label: "Client Budget",
      inputType: "number",
    },
    { name: "dateOfContact", label: "Date of Contact", type: "date" },
    { name: "lastFollowUpDate", label: "Last Follow-up Date", type: "date" },
    {
      name: "remarksComments",
      label: "Remarks",
      rules: { validate: noOnlyWhitespace },
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
          {fields.map(({ name, label, type, rules, options, inputType }) => (
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
                      {name === "clientBudget"
                        ? `INR ${inrFormat(selectedLead?.[name] || 0)}`
                        : type === "date"
                        ? humanDate(selectedLead?.[name])
                        : selectedLead?.[name] || "—"}
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
