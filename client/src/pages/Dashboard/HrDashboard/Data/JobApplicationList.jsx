import React, { useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import humanDate from "../../../../utils/humanDateForamt";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { inrFormat } from "../../../../utils/currencyFormat";
import WidgetTable from "../../../../components/Tables/WidgetTable";
import StatusChip from "../../../../components/StatusChip";
import PrimaryButton from "../../../../components/PrimaryButton";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { toast } from "sonner";

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
  resume: null,
};

const JobApplicationList = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [applicationToArchive, setApplicationToArchive] = useState(null);
  const [viewApplicationDetails, setViewApplicationDetails] = useState({});
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultApplicationValues });
  const {
    data: jobApplications,
    isPending: isJobApplicationPending,
  } = useQuery({
    queryKey: ["jobApplications"],
    queryFn: async function () {
      const response = await axios.get("/api/company/get-job-applications");
      return response.data;
    },
  });

  const saveApplicationMutation = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "resume") {
          if (value) formData.append("resume", value);
          return;
        }
        formData.append(key, value ?? "");
      });

      const response = editingApplication
        ? await axios.patch(
            `/api/company/update-job-application/${editingApplication._id}`,
            formData,
          )
        : await axios.post("/api/company/add-job-application", formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast.success(
        `Job application ${editingApplication ? "updated" : "added"} successfully`,
      );
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

  const archiveApplicationMutation = useMutation({
    mutationFn: async (applicationId) => {
      const response = await axios.patch(
        `/api/company/archive-job-application/${applicationId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast.success("Job application deleted successfully");
      setApplicationToArchive(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete job application",
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
      ...application,
      dateOfBirth: application.dateOfBirth
        ? new Date(application.dateOfBirth).toISOString().slice(0, 10)
        : "",
      finalSubmissionDate: application.finalSubmissionDate
        ? new Date(application.finalSubmissionDate).toISOString().slice(0, 10)
        : "",
      resume: null,
    });
    setOpenAddModal(true);
  };

  const archiveApplication = (application) => {
    setApplicationToArchive(application);
  };

  const leavesColumn = [
    { field: "srNo", headerName: "SR No", width: 100 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => handleViewApplicationDetails(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "email", headerName: "Email", flex: 1 ,hide:true},
    { field: "dateOfBirth", headerName: "Date of Birth", flex:1,hide:true },
    { field: "mobileNumber", headerName: "Mobile Number", flex: 1,hide:true },
    { field: "location", headerName: "Location", flex: 1,hide:true },
    { field: "experienceInYears", headerName: "Experience (Years)", flex: 1 ,hide:true},
    {
      field: "currentMonthlySalary",
      headerName: "Current Monthly Salary",
      flex: 1,
      hide:true,
      valueFormatter: (params) => inrFormat(params.value),
    },
    { field: "expectedMonthlySalary",
      headerName: "Expected Monthly Salary",
      flex: 1,
      hide:true,
      valueFormatter: (params) => inrFormat(params.value),
    },
    { field: "howSoonYouCanJoinInDays", headerName: "Joining Time (Days)", flex: 1 ,hide:true},
    { field: "willRelocateToGoa", headerName: "Willing to Relocate to Goa", flex: 1 ,hide:true},
    { field: "willingToBootstrap", headerName: "Willing to Bootstrap", flex: 1 ,hide:true},   
    {field: "linkedInProfileUrl", headerName: "LinkedIn Profile", flex: 1, hide:true},
    { field: "skillSetsForJob", headerName: "Skill Sets for Job", flex: 1, hide:true },
    { field: "whyShouldWeConsiderYou", headerName: "Why Should We Consider You?", flex: 1, hide:true },
    { field: "whoAreYouAsPerson", headerName: "Who Are You As a Person?", flex: 1, hide:true },
    { field: "message", headerName: "Message", flex: 1, hide:true },
    { field: "resumeLink", headerName: "Resume Link", flex: 1, hide:true },
    { field: "remarks", headerName: "Remarks", flex: 1, hide:true },
    { field: "finalSubmissionDate", headerName: "Submission Date" ,flex:1},
    { field: "jobPosition", headerName: "Job Position", flex: 1 },
    { field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => <StatusChip status={params.value} />
    },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      pinned: "right",
      lockPinned: true,
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data._id}
          menuItems={[
            {
              label: "Edit",
              onClick: () => openEditApplication(params.data),
            },
            {
              label: "Delete",
              onClick: () => archiveApplication(params.data),
            },
          ]}
        />
      ),
    },
  ];

  const handleViewApplicationDetails = (job) => {
    setViewApplicationDetails(job);
    setOpenModal(true);
  };

  function isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  const formatURL = (url) => {
    if (!url) return "";

    let formattedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    // Ensure LinkedIn profile URLs have a trailing slash
    if (
      formattedUrl.includes("linkedin.com/in") &&
      !formattedUrl.endsWith("/")
    ) {
      formattedUrl += "/";
    }

    return formattedUrl;
  };

  return (
    <div>
      <WidgetTable
        dateColumn={"finalSubmissionDate"}
        search
        totalKey="count"
        totalText="TOTAL : "
        titleAmountOverride={`TOTAL : ${jobApplications?.length ?? 0}`}
        searchColumn={"Job Position"}
        tableTitle={"Job Applications"}
        data={
          isJobApplicationPending
            ? []
            : jobApplications
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.finalSubmissionDate) -
                    new Date(b.finalSubmissionDate)
                )
                .map((job) => ({
                  ...job,
                  count: 1,
                  finalSubmissionDate: job.finalSubmissionDate,
                  jobPosition: job.jobPosition == "" ? "-" : job.jobPosition,
                }))
        }
        columns={leavesColumn}
        buttonTitle="Add Job Application"
        handleSubmit={openCreateApplication}
        exportData
      />
      <MuiModal
        open={openAddModal}
        onClose={closeAddModal}
        title={editingApplication ? "Edit Job Application" : "Add Job Application"}
        widthClass="w-4/5 lg:w-3/5"
      >
        <form
          onSubmit={handleSubmit((values) =>
            saveApplicationMutation.mutate(values),
          )}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="jobPosition"
              control={control}
              rules={{ required: "Job position is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
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
              rules={{
                required: "Name is required",
                validate: (value) =>
                  value.trim().length > 1 || "Enter a valid name",
              }}
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
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              }}
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
              rules={{
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              }}
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
            <Controller
              name="dateOfBirth"
              control={control}
              rules={{ required: "Date of birth is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Date of Birth"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().slice(0, 10) }}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                />
              )}
            />
            <Controller
              name="location"
              control={control}
              rules={{ required: "Location is required" }}
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
              rules={{ required: "Experience is required", min: 0 }}
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
              render={({ field }) => (
                <TextField
                  {...field}
                  label="LinkedIn Profile URL"
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
                <TextField
                  {...field}
                  label="Joining Time (Days)"
                  type="number"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              )}
            />
            <Controller
              name="finalSubmissionDate"
              control={control}
              rules={{ required: "Submission date is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Submission Date"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.finalSubmissionDate}
                  helperText={errors.finalSubmissionDate?.message}
                />
              )}
            />
            <Controller
              name="willRelocateToGoa"
              control={control}
              rules={{ required: "Select an option" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Willing to Relocate to Goa"
                  size="small"
                  error={!!errors.willRelocateToGoa}
                  helperText={errors.willRelocateToGoa?.message}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="willingToBootstrap"
              control={control}
              rules={{ required: "Select an option" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Willing to Bootstrap"
                  size="small"
                  error={!!errors.willingToBootstrap}
                  helperText={errors.willingToBootstrap?.message}
                >
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
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                  <MenuItem value="Selected">Selected</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Remarks" size="small" />
              )}
            />
          </div>

          {[
            ["skillSetsForJob", "Skill Sets for Job"],
            ["whyShouldWeConsiderYou", "Why Should We Consider You?"],
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

          <Controller
            name="resume"
            control={control}
            rules={{
              validate: (value) =>
                Boolean(value || editingApplication?.resumeLink) ||
                "Resume is required",
            }}
            render={({ field: { onChange, value: _value, ...field } }) => (
              <TextField
                {...field}
                label={
                  editingApplication?.resumeLink
                    ? "Replace Resume (Optional)"
                    : "Resume *"
                }
                type="file"
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept: ".pdf,.doc,.docx" }}
                onChange={(event) => onChange(event.target.files?.[0] || null)}
                error={!!errors.resume}
                helperText={errors.resume?.message}
              />
            )}
          />

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
        open={Boolean(applicationToArchive)}
        onClose={() => setApplicationToArchive(null)}
        onConfirm={() =>
          archiveApplicationMutation.mutate(applicationToArchive?._id)
        }
        title="Confirm Delete"
        message={`Are you sure you want to delete the job application from ${applicationToArchive?.name || "this applicant"}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={archiveApplicationMutation.isPending}
      />
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Job Application Details"}
      >
        {!isJobApplicationPending && jobApplications ? (
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
              detail={humanDate(viewApplicationDetails?.dateOfBirth)}
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
              title="Joining Time (Days)"
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
                !isValidURL(viewApplicationDetails.linkedInProfileUrl) ? (
                  "Not Provided"
                ) : (
                  <div>
                    <a
                      className="text-primary underline cursor-pointer"
                      href={formatURL(
                        viewApplicationDetails.linkedInProfileUrl
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )
              }
            />
            <DetalisFormatted
              title="Skill Sets for Job"
              detail={viewApplicationDetails?.skillSetsForJob}
            />
            <DetalisFormatted
              title="Why Should We Consider You?"
              detail={viewApplicationDetails?.whyShouldWeConsiderYou}
            />
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
              title="Resume Link"
              detail={
                !isValidURL(viewApplicationDetails.resumeLink) ? (
                  "Not Provided"
                ) : (
                  <div>
                    <a
                      className="text-primary underline cursor-pointer"
                      href={formatURL(viewApplicationDetails.resumeLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      Resume
                    </a>
                  </div>
                )
              }
            />
            <DetalisFormatted
              title="Status"
              detail={viewApplicationDetails?.status}
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
              detail={humanDate(viewApplicationDetails?.finalSubmissionDate)}
            />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default JobApplicationList;
