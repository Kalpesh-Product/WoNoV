import React, { useMemo, useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import humanDate from "../../../../utils/humanDateForamt";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { MenuItem, TextField } from "@mui/material";
import AttachmentFilesInput from "../../../../components/AttachmentFilesInput";
import { inrFormat } from "../../../../utils/currencyFormat";
import WidgetTable from "../../../../components/Tables/WidgetTable";
import StatusChip from "../../../../components/StatusChip";
import PrimaryButton from "../../../../components/PrimaryButton";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { toast } from "sonner";
import {
  MdDeleteForever,
  MdOutlineRemoveRedEye,
  MdOutlineRestore,
} from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import useAuth from "../../../../hooks/useAuth";

import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { isLinkedInProfileUrl } from "../../../../utils/validators";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";
const APPLICATION_STATUSES = [
  "Pending",
  "Under Review",
  "Shortlisted",
  "Interviewing",
  "Offered",
  "Selected",
  "Hired",
  "Rejected",
];

const defaultApplicationValues = {
  jobPosition: "",
  name: "",
  email: "",
  dateOfBirth: "",
  mobileNumber: "",
  location: "",
  experienceInYears: "",
  linkedInProfileUrl: "",
  currentMonthlySalary: "",
  expectedMonthlySalary: "",
  howSoonYouCanJoinInDays: "",
  willRelocateToGoa: "",
  willingToBootstrap: "",
  skillSetsForJob: "",
  whyShouldWeConsiderYou: "",
  whoAreYouAsPerson: "",
  message: "",
  finalSubmissionDate: new Date().toISOString().slice(0, 10),
  status: "Pending",
  remarks: "",
  relevantExperience: "",
  resume: null,
};

const dateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const ApplicationDateField = ({
  name,
  label,
  control,
  unchanged,
  disabled,
  maxDate,
}) => (
  <Controller
    name={name}
    control={control}
    rules={{
      validate: (value) => {
        if (unchanged || disabled) return true;
        if (!value) return `${label} is required`;
        const date = dayjs(value);
        if (!date.isValid()) return "Enter a valid date";
        return (
          !maxDate ||
          !date.isAfter(maxDate, "day") ||
          "Date of birth cannot be in the future"
        );
      },
    }}
    render={({ field, fieldState }) => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={label}
          value={field.value ? dayjs(field.value) : null}
          onChange={(value) =>
            field.onChange(value ? value.format("YYYY-MM-DD") : "")
          }
          maxDate={maxDate}
          disabled={disabled}
          slotProps={{
            textField: {
              name: field.name,
              inputRef: field.ref,
              onBlur: field.onBlur,
              size: "small",
              fullWidth: true,
              error: Boolean(fieldState.error),
              helperText: fieldState.error?.message,
            },
          }}
        />
      </LocalizationProvider>
    )}
  />
);

const applicationSourceLabel = (application) =>
  application.isWebsiteApplication ? "BIZ Nest" : "Local";

const JobApplicationList = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const isTechDepartment = auth?.user?.departments?.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [viewApplicationDetails, setViewApplicationDetails] = useState(null);
  const isWebsiteEdit = Boolean(editingApplication?.isWebsiteApplication);
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({ defaultValues: defaultApplicationValues });
  const localStatusOnly = Boolean(
    editingApplication &&
    !isWebsiteEdit &&
    dirtyFields.status &&
    Object.keys(dirtyFields).length === 1,
  );
  const { data: jobApplications, isPending: isJobApplicationPending } =
    useQuery({
      queryKey: ["jobApplications", Boolean(isTechDepartment)],
      queryFn: async function () {
        const response = await axios.get(
          `/api/company/get-job-applications${
            isTechDepartment ? "?includeDeleted=true" : ""
          }`,
        );
        return response.data;
      },
    });
  const {
    data: websiteApplications,
    isPending: isWebsiteApplicationPending,
    isError: isWebsiteApplicationError,
    error: websiteApplicationError,
  } = useQuery({
    queryKey: ["websiteJobApplications"],
    queryFn: async () => {
      const response = await axios.get("/api/company/website-job-applications");
      return response.data;
    },
    retry: false,
  });

  const combinedApplications = useMemo(() => {
    const localRows = (jobApplications || []).map((job) => ({
      ...job,
      source: job.source || "local",
      count: 1,
      jobPosition: job.jobPosition || "-",
      deletedByName: job.deletedBy
        ? [job.deletedBy.firstName, job.deletedBy.lastName]
            .filter(Boolean)
            .join(" ") ||
          job.deletedBy.employeeName ||
          job.deletedBy.name ||
          job.deletedBy.email ||
          "—"
        : "—",
    }));
    const websiteRows = (websiteApplications?.data || []).map((job) => ({
      ...job,
      isWebsiteApplication: true,
      count: 1,
      jobPosition: job.jobPosition || "-",
    }));
    return [...localRows, ...websiteRows].sort(
      (a, b) =>
        new Date(a.finalSubmissionDate || 0) -
        new Date(b.finalSubmissionDate || 0),
    );
  }, [jobApplications, websiteApplications?.data]);

  const saveApplicationMutation = useMutation({
    mutationFn: async (values) => {
      if (isWebsiteEdit) {
        const changes = Object.fromEntries(
          Object.keys(dirtyFields).map((field) => [
            field,
            String(values[field] ?? "").trim(),
          ]),
        );
        if (!Object.keys(changes).length) return { unchanged: true };
        return (
          await axios.patch(
            `/api/company/website-job-applications/${editingApplication.externalSubmissionId}`,
            changes,
          )
        ).data;
      }
      if (localStatusOnly) {
        return (
          await axios.patch(
            `/api/company/job-application/${editingApplication._id}/status`,
            { status: values.status },
          )
        ).data;
      }
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "relevantExperience") return;
        if (key === "resume") {
          if (value) formData.append("resume", value);
          return;
        }
        formData.append(key, value ?? "");
      });
      if (!editingApplication) formData.set("source", "local");

      const response = editingApplication
        ? await axios.patch(
            `/api/company/update-job-application/${editingApplication._id}`,
            formData,
          )
        : await axios.post("/api/company/add-job-application", formData);
      return response.data;
    },
    onSuccess: (result) => {
      if (!result.unchanged) {
        queryClient.invalidateQueries({
          queryKey: [
            isWebsiteEdit ? "websiteJobApplications" : "jobApplications",
          ],
        });
        toast.success(
          `Job application ${editingApplication ? "updated" : "added"} successfully`,
        );
      }
      reset(defaultApplicationValues);
      setEditingApplication(null);
      setOpenAddModal(false);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to save job application",
      );
    },
  });

  const applicationActionMutation = useMutation({
    mutationFn: async ({ type, application }) => {
      let response;
      if (type === "restore") {
        response = await axios.patch(
          `/api/company/restore-job-application/${application._id}`,
        );
      } else if (type === "permanent-delete") {
        response = await axios.delete(
          `/api/company/delete-job-application/${application._id}`,
        );
      } else {
        response = await axios.patch(
          `/api/company/archive-job-application/${application._id}`,
        );
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast.success(data.message || "Job application updated successfully");
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update job application",
      );
    },
  });

  const closeAddModal = () => {
    reset(defaultApplicationValues);
    setEditingApplication(null);
    setOpenAddModal(false);
  };

  const openCreateApplication = () => {
    setEditingApplication(null);
    reset(defaultApplicationValues);
    setOpenAddModal(true);
  };

  const openEditApplication = (application) => {
    setEditingApplication(application);
    reset({
      ...defaultApplicationValues,
      ...Object.fromEntries(
        Object.keys(defaultApplicationValues).map((field) => [
          field,
          application[field] ?? defaultApplicationValues[field],
        ]),
      ),
      dateOfBirth: dateInputValue(application.dateOfBirth),
      finalSubmissionDate: dateInputValue(application.finalSubmissionDate),
      resume: null,
    });
    setOpenAddModal(true);
  };

  const archiveApplication = (application) => {
    setConfirmationAction({ type: "delete", application });
  };

  const restoreApplication = (application) => {
    setConfirmationAction({ type: "restore", application });
  };

  const permanentlyDeleteApplication = (application) => {
    setConfirmationAction({ type: "permanent-delete", application });
  };

  const confirmationContent = {
    delete: {
      title: "Confirm Delete",
      message: `Are you sure you want to delete the job application from ${confirmationAction?.application?.name || "this applicant"}?`,
      confirmText: "Delete",
    },
    restore: {
      title: "Restore Job Application",
      message: `Are you sure you want to restore the job application from ${confirmationAction?.application?.name || "this applicant"}?`,
      confirmText: "Restore",
    },
    "permanent-delete": {
      title: "Permanently Delete Job Application",
      message: `Are you sure you want to permanently delete the job application from ${confirmationAction?.application?.name || "this applicant"}?`,
      confirmText: "Delete Permanently",
    },
  }[confirmationAction?.type];

  const leavesColumn = [
    { field: "srNo", headerName: "SR No", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1, hide: true },
    { field: "dateOfBirth", headerName: "Date of Birth", flex: 1, hide: true },
    { field: "mobileNumber", headerName: "Mobile Number", flex: 1, hide: true },
    { field: "location", headerName: "Location", flex: 1, hide: true },
    {
      field: "experienceInYears",
      headerName: "Experience (Years)",
      flex: 1,
      hide: true,
    },
    {
      field: "currentMonthlySalary",
      headerName: "Current Monthly Salary",
      flex: 1,
      hide: true,
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      field: "expectedMonthlySalary",
      headerName: "Expected Monthly Salary",
      flex: 1,
      hide: true,
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      field: "howSoonYouCanJoinInDays",
      headerName: "Joining Time",
      flex: 1,
      hide: true,
    },
    {
      field: "willRelocateToGoa",
      headerName: "Willing to Relocate to Goa",
      flex: 1,
      hide: true,
    },
    {
      field: "willingToBootstrap",
      headerName: "Willing to Bootstrap",
      flex: 1,
      hide: true,
    },
    {
      field: "linkedInProfileUrl",
      headerName: "LinkedIn Profile",
      flex: 1,
      hide: true,
    },
    {
      field: "skillSetsForJob",
      headerName: "Skill Sets for Job",
      flex: 1,
      hide: true,
    },
    {
      field: "whyShouldWeConsiderYou",
      headerName: "Why Should We Consider You?",
      flex: 1,
      hide: true,
    },
    {
      field: "relevantExperience",
      headerName: "Relevant Experience",
      flex: 1,
      hide: true,
    },
    {
      field: "resumeFilename",
      headerName: "Resume Filename",
      flex: 1,
      hide: true,
    },
    {
      field: "whoAreYouAsPerson",
      headerName: "Who Are You As a Person?",
      flex: 1,
      hide: true,
    },
    { field: "message", headerName: "Message", flex: 1, hide: true },
    { field: "resumeLink", headerName: "Resume Link", flex: 1, hide: true },
    { field: "remarks", headerName: "Remarks", flex: 1, hide: true },
    { field: "finalSubmissionDate", headerName: "Submission Date", flex: 1 },
    {
      field: "source",
      headerName: "Source Company",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) =>
        params.data ? applicationSourceLabel(params.data) : "",
    },
    { field: "jobPosition", headerName: "Job Position", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => (
        <StatusChip
          status={params.data?.isDeleted ? "Disabled" : params.value}
        />
      ),
    },
    ...(jobApplications?.some((application) => Boolean(application.isDeleted))
      ? [
          {
            field: "deletedByName",
            headerName: "Deleted By",
            flex: 1,
            valueGetter: (params) =>
              params.data?.isDeleted ? params.data.deletedByName : "",
          },
        ]
      : []),
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      pinned: "right",
      lockPinned: true,
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: ({ data: application }) => {
        if (!application) return null;
        const canEdit = application.isWebsiteApplication
          ? /^[a-f\d]{24}$/i.test(application.externalSubmissionId)
          : Boolean(application._id);
        return (
          <div className="flex h-full items-center gap-1">
            <button
              type="button"
              aria-label="View job application"
              title="View Job Application"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => setViewApplicationDetails(application)}
            >
              <MdOutlineRemoveRedEye size={20} />
            </button>
            {application.isDeleted ? (
              <>
                <button
                  type="button"
                  aria-label="Restore application"
                  title="Restore"
                  className="p-1 text-primary"
                  onClick={() => restoreApplication(application)}
                >
                  <MdOutlineRestore size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Permanently delete application"
                  title="Delete permanently"
                  className="p-1 text-primary"
                  onClick={() => permanentlyDeleteApplication(application)}
                >
                  <MdDeleteForever size={20} />
                </button>
              </>
            ) : (
              <>
                {canEdit && (
                  <button
                    type="button"
                    aria-label="Edit job application"
                    title="Edit Job Application"
                    className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
                    onClick={() => openEditApplication(application)}
                  >
                    <HiPencilSquare size={24} />
                  </button>
                )}
                {!application.isWebsiteApplication && canEdit && (
                  <button
                    type="button"
                    aria-label="Archive application"
                    title="Archive"
                    className="p-1 text-primary"
                    onClick={() => archiveApplication(application)}
                  >
                    <MdDeleteForever size={20} />
                  </button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  const safeDetailUrl = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };
  const linkedInUrl = safeDetailUrl(viewApplicationDetails?.linkedInProfileUrl);
  const resumeUrl = safeDetailUrl(viewApplicationDetails?.resumeLink);

  return (
    <div>
      {isWebsiteApplicationError && (
        <p role="alert" className="mb-3 text-red-600">
          {websiteApplicationError?.response?.data?.message ||
            "Unable to load website applications."}{" "}
          Local applications are still available.
        </p>
      )}
      {(websiteApplications?.pagination?.filteredTotal ?? 0) >
        (websiteApplications?.data?.length ?? 0) && (
        <p className="mb-3 text-sm text-gray-600">
          Showing the first {websiteApplications.data.length} website
          applications. More pages require additional API query parameters.
        </p>
      )}
      <WidgetTable
        dateColumn={"finalSubmissionDate"}
        search
        totalKey="count"
        totalText="TOTAL : "
        titleAmountOverride={`TOTAL : ${combinedApplications.length}`}
        searchColumn={"Job Position"}
        tableTitle={"Job Applications"}
        data={combinedApplications}
        columns={leavesColumn}
        buttonTitle="Add Job Application"
        handleSubmit={openCreateApplication}
        exportData
        loading={isJobApplicationPending || isWebsiteApplicationPending}
      />
      <MuiModal
        open={openAddModal}
        onClose={closeAddModal}
        title={
          editingApplication ? "Edit Job Application" : "Add Job Application"
        }
        widthClass="w-4/5 lg:w-3/5"
      >
        <form
          onSubmit={(event) => {
            if (localStatusOnly) {
              event.preventDefault();
              saveApplicationMutation.mutate({ status: getValues("status") });
              return;
            }
            return handleSubmit((values) =>
              saveApplicationMutation.mutate(values),
            )(event);
          }}
          noValidate={isWebsiteEdit || localStatusOnly}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="jobPosition"
              control={control}
              rules={
                isWebsiteEdit
                  ? undefined
                  : { required: "Job position is required" }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  disabled={isWebsiteEdit}
                  label="Job Position"
                  size="small"
                  error={!!errors.jobPosition}
                  helperText={errors.jobPosition?.message}
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              rules={
                isWebsiteEdit
                  ? undefined
                  : {
                      required: "Name is required",
                      validate: (value) =>
                        value.trim().length > 1 || "Enter a valid name",
                    }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={
                isWebsiteEdit
                  ? undefined
                  : {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Controller
              name="mobileNumber"
              control={control}
              rules={
                isWebsiteEdit
                  ? undefined
                  : {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit mobile number",
                      },
                    }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mobile Number"
                  size="small"
                  inputProps={{ maxLength: 10 }}
                  error={!!errors.mobileNumber}
                  helperText={errors.mobileNumber?.message}
                />
              )}
            />
            <ApplicationDateField
              name="dateOfBirth"
              label="Date of Birth"
              control={control}
              unchanged={isWebsiteEdit && !dirtyFields.dateOfBirth}
              maxDate={dayjs()}
            />
            <Controller
              name="location"
              control={control}
              rules={
                isWebsiteEdit ? undefined : { required: "Location is required" }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Location"
                  size="small"
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              )}
            />
            <Controller
              name="experienceInYears"
              control={control}
              rules={
                isWebsiteEdit
                  ? undefined
                  : { required: "Experience is required", min: 0 }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Experience (Years)"
                  type="number"
                  size="small"
                  inputProps={{ min: 0, step: 0.5 }}
                  error={!!errors.experienceInYears}
                  helperText={errors.experienceInYears?.message}
                />
              )}
            />
            <Controller
              name="linkedInProfileUrl"
              control={control}
              rules={{
                validate: (value) =>
                  (isWebsiteEdit && !dirtyFields.linkedInProfileUrl) ||
                  !value.trim() ||
                  isLinkedInProfileUrl(value.trim()) ||
                  "Enter a valid LinkedIn profile or company URL.",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="LinkedIn Profile URL"
                  error={Boolean(errors.linkedInProfileUrl)}
                  helperText={errors.linkedInProfileUrl?.message}
                  size="small"
                />
              )}
            />
            <Controller
              name="currentMonthlySalary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Current Monthly Salary"
                  type="number"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              )}
            />
            <Controller
              name="expectedMonthlySalary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Expected Monthly Salary"
                  type="number"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              )}
            />
            <Controller
              name="howSoonYouCanJoinInDays"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Joining Time" size="small" />
              )}
            />
            <ApplicationDateField
              name="finalSubmissionDate"
              label="Submission Date"
              control={control}
              disabled={isWebsiteEdit}
            />
            <Controller
              name="willRelocateToGoa"
              control={control}
              rules={
                isWebsiteEdit ? undefined : { required: "Select an option" }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Willing to Relocate to Goa"
                  size="small"
                  error={!!errors.willRelocateToGoa}
                  helperText={errors.willRelocateToGoa?.message}
                >
                  {field.value && !["Yes", "No"].includes(field.value) && (
                    <MenuItem value={field.value} disabled>
                      {field.value}
                    </MenuItem>
                  )}
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="willingToBootstrap"
              control={control}
              rules={
                isWebsiteEdit ? undefined : { required: "Select an option" }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Willing to Bootstrap"
                  size="small"
                  error={!!errors.willingToBootstrap}
                  helperText={errors.willingToBootstrap?.message}
                >
                  {field.value && !["Yes", "No"].includes(field.value) && (
                    <MenuItem value={field.value} disabled>
                      {field.value}
                    </MenuItem>
                  )}
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Status" size="small">
                  {field.value &&
                    !APPLICATION_STATUSES.includes(field.value) && (
                      <MenuItem value={field.value} disabled>
                        {field.value}
                      </MenuItem>
                    )}
                  {APPLICATION_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {!isWebsiteEdit && (
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Remarks" size="small" />
                )}
              />
            )}
          </div>

          {[
            ["skillSetsForJob", "Skill Sets for Job"],
            ...(isWebsiteEdit
              ? [["relevantExperience", "Relevant Experience"]]
              : [["whyShouldWeConsiderYou", "Why Should We Consider You?"]]),
            ["whoAreYouAsPerson", "Who Are You As a Person?"],
            ["message", "Message"],
          ].map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={label}
                  multiline
                  minRows={2}
                  size="small"
                />
              )}
            />
          ))}

          {!isWebsiteEdit && (
            <Controller
              name="resume"
              control={control}
              rules={
                isWebsiteEdit
                  ? undefined
                  : {
                      validate: (value) =>
                        Boolean(value || editingApplication?.resumeLink) ||
                        "Resume is required",
                    }
              }
              render={({ field, fieldState }) => (
                <AttachmentFilesInput
                  id="job-application-resume"
                  value={field.value ? [field.value] : []}
                  onChange={([file]) => field.onChange(file ?? null)}
                  label={
                    editingApplication?.resumeLink
                      ? "Replace Resume (Optional)"
                      : "Upload Resume *"
                  }
                  placeholder="Choose a resume file"
                  fallbackName="Resume"
                  extensions={["pdf", "doc", "docx"]}
                  maxFiles={1}
                  maxSizeMb={null}
                  error={Boolean(fieldState.error)}
                  helperText={
                    fieldState.error?.message || "One PDF or Word document."
                  }
                />
              )}
            />
          )}

          <div className="flex justify-end gap-3">
            <PrimaryButton
              title="Cancel"
              type="button"
              handleSubmit={closeAddModal}
              className="bg-gray-500"
            />
            <PrimaryButton
              title={editingApplication ? "Save Changes" : "Add Application"}
              type="submit"
              isLoading={saveApplicationMutation.isPending}
            />
          </div>
        </form>
      </MuiModal>
      <ConfirmationModal
        open={Boolean(confirmationAction)}
        onClose={() => setConfirmationAction(null)}
        onConfirm={() => applicationActionMutation.mutate(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText={confirmationContent?.confirmText}
        cancelText="Cancel"
        isLoading={applicationActionMutation.isPending}
      />
      <MuiModal
        open={Boolean(viewApplicationDetails)}
        onClose={() => setViewApplicationDetails(null)}
        title={"Job Application Details"}
      >
        {viewApplicationDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="font-bold">Personal Details</div>
            <DetalisFormatted
              title="Name"
              detail={viewApplicationDetails?.name}
            />
            <DetalisFormatted
              title="Email"
              detail={viewApplicationDetails?.email}
            />
            <DetalisFormatted
              title="Date of Birth"
              detail={
                viewApplicationDetails.dateOfBirth
                  ? humanDate(viewApplicationDetails.dateOfBirth)
                  : ""
              }
            />
            <DetalisFormatted
              title="Mobile Number"
              detail={viewApplicationDetails?.mobileNumber}
            />
            <DetalisFormatted
              title="Location"
              detail={viewApplicationDetails?.location}
            />
            <br />
            <div className="font-bold">Experience & Availability</div>
            <DetalisFormatted
              title="Experience (Years)"
              detail={viewApplicationDetails?.experienceInYears}
            />

            <DetalisFormatted
              title="Current Monthly Salary"
              detail={inrFormat(viewApplicationDetails?.currentMonthlySalary)}
            />
            <DetalisFormatted
              title="Expected Monthly Salary"
              detail={inrFormat(viewApplicationDetails?.expectedMonthlySalary)}
            />
            <DetalisFormatted
              title="Joining Time"
              detail={viewApplicationDetails?.howSoonYouCanJoinInDays}
            />
            <DetalisFormatted
              title="Willing to Relocate to Goa"
              detail={viewApplicationDetails?.willRelocateToGoa}
            />
            <DetalisFormatted
              title="Willing to Bootstrap"
              detail={viewApplicationDetails?.willingToBootstrap}
            />
            <br />
            <div className="font-bold">Professional Details</div>
            <DetalisFormatted
              title="LinkedIn Profile"
              detail={
                linkedInUrl ? (
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline break-all"
                  >
                    {linkedInUrl}
                  </a>
                ) : (
                  viewApplicationDetails.linkedInProfileUrl
                )
              }
            />
            <DetalisFormatted
              title="Skill Sets for Job"
              detail={viewApplicationDetails?.skillSetsForJob}
            />
            {!viewApplicationDetails?.isWebsiteApplication && (
              <DetalisFormatted
                title="Why Should We Consider You?"
                detail={viewApplicationDetails?.whyShouldWeConsiderYou}
              />
            )}
            {viewApplicationDetails.isWebsiteApplication && (
              <DetalisFormatted
                title="Relevant Experience"
                detail={viewApplicationDetails.relevantExperience}
              />
            )}
            <DetalisFormatted
              title="Who Are You As a Person?"
              detail={viewApplicationDetails?.whoAreYouAsPerson}
            />

            <DetalisFormatted
              title="Message"
              detail={viewApplicationDetails?.message}
            />
            <br />
            <div className="font-bold">Application Info</div>
            <DetalisFormatted
              title="Resume"
              detail={
                resumeUrl ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {viewApplicationDetails.resumeFilename || "View resume"}
                  </a>
                ) : (
                  viewApplicationDetails.resumeFilename ||
                  (viewApplicationDetails.hasResume
                    ? "Resume available on website"
                    : "Not provided")
                )
              }
            />
            {viewApplicationDetails.isWebsiteApplication && (
              <DetalisFormatted
                title="Notification Status"
                detail={viewApplicationDetails.notificationStatus}
              />
            )}
            {viewApplicationDetails.isDeleted && (
              <>
                <DetalisFormatted
                  title="Archived By"
                  detail={viewApplicationDetails.deletedByName}
                />
                <DetalisFormatted
                  title="Archived On"
                  detail={
                    viewApplicationDetails.deletedAt
                      ? humanDate(viewApplicationDetails.deletedAt)
                      : ""
                  }
                />
              </>
            )}
            <DetalisFormatted
              title="Status"
              detail={viewApplicationDetails?.status}
            />
            <DetalisFormatted
              title="Source Company"
              detail={applicationSourceLabel(viewApplicationDetails)}
            />
            <DetalisFormatted
              title="Remarks"
              detail={viewApplicationDetails?.remarks || "Not specified"}
            />
            <DetalisFormatted
              title="Job Position"
              detail={viewApplicationDetails?.jobPosition || "Not specified"}
            />
            <DetalisFormatted
              title="Final Submission Date"
              detail={
                viewApplicationDetails.finalSubmissionDate
                  ? humanDate(viewApplicationDetails.finalSubmissionDate)
                  : ""
              }
            />
          </div>
        ) : null}
      </MuiModal>
    </div>
  );
};

export default JobApplicationList;
