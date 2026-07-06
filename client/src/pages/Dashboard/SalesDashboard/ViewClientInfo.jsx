import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageFrame from "../../../components/Pages/PageFrame";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import humanDate from "../../../utils/humanDateForamt";
import { inrFormat } from "../../../utils/currencyFormat";
import { toast } from "sonner";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { setLeadsData } from "../../../redux/slices/salesSlice";
import {
  isAlphanumeric,
  isValidEmail,
  isValidPhoneNumber,
  noOnlyWhitespace,
} from "../../../utils/validators";

const getLeadProposedLocation = (value) => {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
};

const mapLeadToFormValues = (lead) => {
  const proposedLocation = getLeadProposedLocation(lead?.proposedLocations);

  return {
    dateOfContact: lead?.dateOfContact || "",
    companyName: lead?.companyName || "",
    serviceCategory: lead?.serviceCategory?._id || lead?.serviceCategory || "",
    leadStatus: lead?.leadStatus || "",
    proposedLocations: proposedLocation?._id || proposedLocation || "",
    sector: lead?.sector || "",
    headOfficeLocation: lead?.headOfficeLocation || "",
    officeInGoa:
      lead?.officeInGoa === true
        ? "Yes"
        : lead?.officeInGoa === false
          ? "No"
          : lead?.officeInGoa || "",
    pocName: lead?.pocName || "",
    designation: lead?.designation || "",
    contactNumber: lead?.contactNumber || "",
    emailAddress: lead?.emailAddress || "",
    leadSource: lead?.leadSource || "",
    period: lead?.period || "",
    openDesks: lead?.openDesks || 0,
    cabinDesks: lead?.cabinDesks || 0,
    totalDesks: lead?.totalDesks || 0,
    serviceName: lead?.serviceName || "",
    clientBudget: lead?.clientBudget || "",
    startDate: lead?.startDate || "",
    lastFollowUpDate: lead?.lastFollowUpDate || "",
    remarksComments: lead?.remarksComments || "",
  };
};

const formatLeadDateValue = (value) => {
  if (!value) return "";
  const selectedDate = dayjs(value);
  return selectedDate.isValid() ? selectedDate.format("YYYY-MM-DD") : "";
};

const ViewClientInfo = () => {
  const location = useLocation();
  const { client } = useParams();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const selectedLead = location?.state?.selectedLead || null;
  const decodedClientParam = client ? decodeURIComponent(client) : "";
  const [isEditing, setIsEditing] = useState(Boolean(location?.state?.editMode));

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
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

  const openDesksValue = useWatch({ control, name: "openDesks" });
  const cabinDesksValue = useWatch({ control, name: "cabinDesks" });

  useEffect(() => {
    const openDesks = Number(openDesksValue || 0);
    const cabinDesks = Number(cabinDesksValue || 0);
    setValue("totalDesks", openDesks + cabinDesks, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [cabinDesksValue, openDesksValue, setValue]);

  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ["sales-services", "view-client-info"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/services");
      return response?.data?.filter((service) => service.isActive);
    },
  });

  const { data: units = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["lead-units", "view-client-info"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return response.data;
    },
  });

  const { data: leads = [], isLoading: isLeadLoading } = useQuery({
    queryKey: ["sales-leads", "view-client-info"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/leads");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const activeLead = useMemo(() => {
    if (!leads.length) {
      return selectedLead;
    }

    if (selectedLead?._id) {
      const matchedById = leads.find((lead) => lead?._id === selectedLead._id);
      if (matchedById) return matchedById;
    }

    if (decodedClientParam) {
      const matchedByRoute = leads.find((lead) => {
        const routeKey = lead?.companyName || lead?._id;
        return routeKey === decodedClientParam;
      });
      if (matchedByRoute) return matchedByRoute;
    }

    return selectedLead;
  }, [decodedClientParam, leads, selectedLead]);

  useEffect(() => {
    if (activeLead) {
      reset(mapLeadToFormValues(activeLead));
    }
  }, [activeLead, reset]);

  const getServiceLabel = (value) => {
    if (!value) return "-";
    if (typeof value === "object") {
      return value?.serviceName || value?.label || "-";
    }

    return (
      services.find((service) => service._id === value)?.serviceName ||
      activeLead?.serviceCategory?.serviceName ||
      value
    );
  };

  const getProposedLocationLabel = (value) => {
    const normalizedValue = getLeadProposedLocation(value);
    if (!normalizedValue) return "-";

    if (typeof normalizedValue === "object") {
      return (
        normalizedValue?.unitNo ||
        normalizedValue?.unitName ||
        normalizedValue?.label ||
        "-"
      );
    }

    const matchedUnit = units.find((unit) => unit._id === normalizedValue);
    return matchedUnit?.unitNo || matchedUnit?.unitName || normalizedValue;
  };

  const getNormalizedUpdatedLead = (lead, payload) => {
    const matchedService = services.find(
      (service) => service._id === payload.serviceCategory,
    );
    const matchedUnit = units.find((unit) => unit._id === payload.proposedLocations);

    return {
      ...lead,
      ...payload,
      serviceCategory: matchedService || lead?.serviceCategory || payload.serviceCategory,
      proposedLocations: matchedUnit
        ? [matchedUnit]
        : lead?.proposedLocations || payload.proposedLocations,
    };
  };

  const { mutate: updateLead, isPending: isUpdatingLead } = useMutation({
    mutationFn: async (formData) => {
      if (!activeLead?._id) {
        throw new Error("Lead details not found");
      }

      const payload = {
        leadId: activeLead._id,
        ...formData,
        dateOfContact: formatLeadDateValue(formData.dateOfContact),
        startDate: formatLeadDateValue(formData.startDate),
        lastFollowUpDate: formatLeadDateValue(formData.lastFollowUpDate),
        serviceCategory: formData.serviceCategory || "",
        proposedLocations: formData.proposedLocations || "",
        officeInGoa: formData.officeInGoa === "Yes",
        openDesks: Number(formData.openDesks || 0),
        cabinDesks: Number(formData.cabinDesks || 0),
        totalDesks: Number(formData.totalDesks || 0),
        clientBudget: Number(formData.clientBudget || 0),
      };

      const response = await axios.patch("/api/sales/edit-lead", payload);
      return { response: response.data, payload };
    },
    onSuccess: ({ response, payload }) => {
      const normalizedUpdatedLead = getNormalizedUpdatedLead(activeLead, payload);
      const nextLeads = queryClient.setQueryData(
        ["sales-leads", "view-client-info"],
        (old = []) =>
          Array.isArray(old)
            ? old.map((lead) =>
                lead?._id === activeLead?._id
                  ? getNormalizedUpdatedLead(lead, payload)
                  : lead,
              )
            : old,
      );
      if (Array.isArray(nextLeads)) {
        dispatch(setLeadsData(nextLeads));
      }
      reset(mapLeadToFormValues(normalizedUpdatedLead));
      toast.success(response?.message || "Client details updated");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update client details",
      );
    },
  });

  const onSubmit = (data) => {
    updateLead(data);
  };

  const handleReset = () => {
    if (!activeLead) return;
    reset(mapLeadToFormValues(activeLead));
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const leadStatusOptions = useMemo(
    () => ["Cold", "Mild", "Hot", "Closed"],
    [],
  );

  const serviceCategoryOptions = useMemo(
    () =>
      services.map((service) => ({
        value: service._id,
        label: service.serviceName,
      })),
    [services],
  );

  const proposedLocationOptions = useMemo(
    () =>
      units.map((unit) => ({
        value: unit._id,
        label: unit.unitNo || unit.unitName || "Unit",
      })),
    [units],
  );

  const getDisplayValue = (name, type) => {
    const value = getValues(name);

    if (name === "clientBudget") return `INR ${inrFormat(value || 0)}`;
    if (type === "date") return value ? humanDate(value) : "-";
    if (name === "serviceCategory") return getServiceLabel(value);
    if (name === "proposedLocations") return getProposedLocationLabel(value);
    return value || "-";
  };

  const fields = [
    { name: "dateOfContact", label: "Date of Contact", type: "date" },
    {
      name: "companyName",
      label: "Company Name",
      rules: {
        required: "Company Name is required",
        validate: noOnlyWhitespace,
      },
    },
    {
      name: "serviceCategory",
      label: "Service Category",
      type: "select",
      options: serviceCategoryOptions,
    },
    {
      name: "leadStatus",
      label: "Lead Status",
      type: "select",
      options: leadStatusOptions,
      rules: { required: "Lead Status is required" },
    },
    {
      name: "proposedLocations",
      label: "Proposed Locations",
      type: "select",
      options: proposedLocationOptions,
    },
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
    {
      name: "totalDesks",
      label: "Total Desks",
      inputType: "number",
      readOnly: true,
    },
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
    },
  ];

  if (isLeadLoading && !activeLead) {
    return (
      <div className="mx-4 mt-3">
        <PageFrame>
          <div className="p-4 font-semibold">Loading client details...</div>
        </PageFrame>
      </div>
    );
  }

  if (!activeLead) {
    return (
      <div className="mx-4 mt-3">
        <PageFrame>
          <div className="p-4 text-red-500 font-semibold">
            No client selected. Please go back and select a client.
          </div>
        </PageFrame>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3">
      <PageFrame>
        <div className="flex flex-col gap-5 px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="text-subtitle font-pmedium text-primary">
              Client Details
            </span>
            <PrimaryButton
              handleSubmit={handleEditToggle}
              title={isEditing ? "Cancel" : "Edit"}
            />
          </div>
          <div className="border-b-2 border-borderGray" />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="h-[60vh] overflow-y-auto"
          >
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-5 px-4 py-2">
              {fields
                .filter(({ editOnly }) => isEditing || !editOnly)
                .map(({ name, label, type, rules, options = [], inputType, readOnly }) => (
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
                                <MenuItem
                                  key={typeof option === "object" ? option.value : option}
                                  value={typeof option === "object" ? option.value : option}
                                >
                                  {typeof option === "object" ? option.label : option}
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
                              InputProps={readOnly ? { readOnly: true } : undefined}
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
                  isLoading={isUpdatingLead}
                  disabled={isUpdatingLead}
                />
                <SecondaryButton
                  title="Reset"
                  handleSubmit={handleReset}
                  disabled={isUpdatingLead}
                />
              </div>
            )}
          </form>
        </div>
      </PageFrame>
    </div>
  );
};

export default ViewClientInfo;
