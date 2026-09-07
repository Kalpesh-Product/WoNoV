import React, { useEffect, useRef, useState } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import {
  Box,
  Chip,
  CircularProgress,
  FormHelperText,
  IconButton,
} from "@mui/material";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

import { TextField, MenuItem } from "@mui/material";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Controller, useForm } from "react-hook-form";
import { LuImageUp } from "react-icons/lu";
import { MdDelete, MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../components/MuiModal";
import { queryClient } from "../../main";
import DetalisFormatted from "../../components/DetalisFormatted";
import humanTime from "../../utils/humanTime";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import humanDate from "../../utils/humanDateForamt";
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";
import formatDateTime from "../../utils/formatDateTime";
import TicketAttachments from "../../components/TicketAttachments";

const RaiseTicket = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ticketIssues, setTicketIssues] = useState([]); // State for ticket issues
  const [openModal, setOpenModal] = useState(false);
  const [viewTicketDetails, setViewTicketDetails] = useState({});
  const [viewDetails, setViewDetails] = useState();
  const axios = useAxiosPrivate();
  const imageRef = useRef();

  // Fetch departments and ticket issues in the same useEffect

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments",
      );
      return response.data?.selectedDepartments;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const { data: fetchedDepartments = [], isPending: departmentLoading } =
    useQuery({
      queryKey: ["fetchedDepartments"],
      queryFn: fetchDepartments,
    });

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      department: "",
      ticketTitle: "",
      newIssue: "",
      message: "",
      attachments: [],
    },
    mode: "onSubmit",
  });

  const watchFields = watch();

  const { mutate: raiseTicket, isPending: pendingRaise } = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();

      formData.append("departmentId", data.department);
      formData.append("title", data.ticketTitle);
      formData.append("description", data.message);
      if (data.newIssue) {
        formData.append("newIssue", data.newIssue);
      }

      data.attachments?.forEach((file) => formData.append("issues", file));

      const response = await axios.post("/api/tickets/raise-ticket", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      if (imageRef.current) imageRef.current.value = "";
      if (preview?.url) URL.revokeObjectURL(preview.url);
      setPreview(null);
      reset();
    },
    onError: function (data) {
      toast.error(data.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    raiseTicket(data);
  };

  const { data: tickets, isPending: ticketsLoading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async function () {
      const response = await axios.get("/api/tickets/my-tickets");
      return response.data;
    },
  });

  const formatAssignments = (assignments = []) => {
    const assignmentDetails = Array.isArray(assignments)
      ? assignments.map((assignment) => {
        const assignee = assignment?.assignee;
        const assigneeName =
          assignee?.firstName && assignee?.lastName
            ? `${assignee.firstName} ${assignee.lastName}`
            : "Unknown";
        const assignedAtFormatted = formatDateTime(assignment?.assignedAt);

        return { assigneeName, assignedAtFormatted };
      })
      : [];

    const assignedToDisplay = assignmentDetails
      .map(({ assigneeName, assignedAtFormatted }) =>
        assignedAtFormatted && assignedAtFormatted !== "N/A"
          ? `${assigneeName} (${assignedAtFormatted})`
          : assigneeName,
      )
      .join(", ");

    return { assignedToDisplay, assignmentDetails };
  };

  const formatEscalation = (escalations = []) => {
    if (!Array.isArray(escalations) || !escalations.length) {
      return { escalatedTo: "", escalatedStatus: "", escalatedAt: "" };
    }

    const latest = escalations[escalations.length - 1];
    return {
      escalatedTo: latest?.raisedToDepartment?.name || "",
      escalatedStatus: latest?.status || "",
      escalatedAt: latest?.createdAt ? formatDateTime(latest.createdAt) : "",
    };
  };

  const handleDepartmentSelect = (deptId) => {
    setSelectedDepartment(deptId);

    // Find the selected department and get its ticketIssues
    const selectedDept = fetchedDepartments.find(
      (dept) => dept?.department?._id === deptId,
    );

    setTicketIssues(selectedDept?.ticketIssues || []);
  };

  const getOtherTicketId = () => {
    // Find the "Other" issue from the selected department
    const otherTicket = ticketIssues.find((issue) => issue.title === "Other");
    return otherTicket ? otherTicket._id : null;
  };

  const handleViewTicketDetails = (ticket) => {
    setViewTicketDetails(ticket);
    setViewDetails(true);
  };

  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No", width: 80 },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    { field: "raisedTo", headerName: "To Department", width: 150 },
    // { field: "raisedBy", headerName: "Raised By", width: 150 },
    // {
    //   field: "raisedAt",
    //   headerName: "Raised At",
    //   width: 200,
    //   cellRenderer: (params) => formatDateTime(params.value),
    // },

    // { field: "description", headerName: "Description", width: 300 },
    { field: "acceptedBy", headerName: "Accepted By", width: 300 },
    // {
    //   field: "acceptedAt",
    //   headerName: "Accepted At",
    //   width: 300,
    //   cellRenderer: (params) => formatDateTime(params.value),
    // },

    // {
    //   field: "priority",
    //   headerName: "Priority",
    //   width: 130,
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       High: { backgroundColor: "#FFC5C5", color: "#8B0000" },
    //       Medium: { backgroundColor: "#FFECC5", color: "#CC8400" },
    //       Low: { backgroundColor: "#ADD8E6", color: "#00008B" },
    //     };

    //     const { backgroundColor, color } = statusColorMap[
    //       params.value === "high" ? "High" : params.value
    //     ] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };

    //     return (
    //       <Chip
    //         label={params.value === "high" ? "High" : params.value}
    //         style={{
    //           backgroundColor,
    //           color,
    //         }}
    //       />
    //     );
    //   },
    // },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" },
          Closed: { backgroundColor: "#cce7fc", color: "#259bf5" },
          Open: { backgroundColor: "#E6E6FA", color: "#4B0082" },
          completed: { backgroundColor: "#D3D3D3", color: "#696969" },
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={params.value}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: 100,
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewTicketDetails(params.data)}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="p-4 bg-white border-2 rounded-md">
        <h3 className="my-5 text-center text-3xl text-primary uppercase">
          Raise A Ticket
        </h3>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
              {/* First div */}
              <div className="flex flex-col gap-4">
                <div className="">
                  <Controller
                    name="department"
                    control={control}
                    rules={{ required: "Department is required" }}
                    render={({ field }) => (
                      <>
                        <TextField
                          fullWidth
                          {...field}
                          select
                          label={"Department"}
                          error={!!errors.department}
                          helperText={errors.department?.message}
                          size="small"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleDepartmentSelect(e.target.value);
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select Department
                          </MenuItem>
                          {departmentLoading ? (
                            <CircularProgress color="black" />
                          ) : (
                            // fetchedDepartments?.map((dept) => (
                            //   <MenuItem value={dept.department._id}>
                            //     {dept.department.name}
                            //   </MenuItem>
                            // ))
                            fetchedDepartments
                              ?.filter(
                                (dept) =>
                                  //dept?.department?.name !== "Sales" &&
                                  // dept?.department?.name !== "HR" &&
                                  dept?.department?.name !== "Tik Department" &&
                                  //dept?.department?.name !== "Finance" &&
                                  // dept.department.name !== "IT" &&
                                  //dept?.department?.name !== "Maintenance" &&
                                  dept?.department?.name !== "Top Management" &&
                                  dept?.department?.name !== "Test Dept 1" &&
                                  dept?.department?.name !== "Cafe" &&
                                  dept?.department?.name !== "Marketing" &&
                                  dept?.department?.name !== "Expansion" &&
                                  dept?.department?.name !== "Compliance" &&
                                  dept?.department?.name !== "Legal",
                              )
                              .map((dept) => (
                                <MenuItem
                                  key={dept?.department?._id}
                                  value={dept?.department?._id}
                                >
                                  {dept?.department?.name}
                                </MenuItem>
                              ))
                          )}
                          {/* <MenuItem value="Sales">
                            Sales
                          </MenuItem> */}
                          {/* <MenuItem value="HR" disabled>
                            HR
                          </MenuItem> */}
                          {/* <MenuItem value="Finance" disabled>
                            Finance
                          </MenuItem> */}
                          {/* <MenuItem value="IT" disabled>
                            IT
                          </MenuItem> */}
                          {/* <MenuItem value="Maintainance" disabled>
                            Maintainance
                          </MenuItem> */}
                          <MenuItem value="Top Management" disabled>
                            Top Management
                          </MenuItem>
                          <MenuItem value="Cafe" disabled>
                            Cafe
                          </MenuItem>
                          <MenuItem value="Marketing" disabled>
                            Marketing
                          </MenuItem>
                          <MenuItem value="Expansion" disabled>
                            Expansion
                          </MenuItem>
                          <MenuItem value="Compliance" disabled>
                            Compliance
                          </MenuItem>
                          <MenuItem value="Legal" disabled>
                            Legal
                          </MenuItem>
                        </TextField>
                      </>
                    )}
                  />
                </div>
                {/* div  */}
                <div>
                  <Controller
                    name="ticketTitle"
                    control={control}
                    rules={{ required: "Please select an Issue" }}
                    render={({ field }) => (
                      <>
                        <TextField
                          fullWidth
                          {...field}
                          size="small"
                          select
                          label="Issue"
                          helperText={errors.ticketTitle?.message}
                          error={!!errors.ticketTitle}
                          disabled={!watchFields.department}
                        >
                          <MenuItem value="">Select Ticket Title</MenuItem>
                          {ticketIssues.length > 0 ? (
                            ticketIssues
                              .filter((issue) => issue.title !== "Other")
                              .map((issue) => (
                                <MenuItem key={issue._id} value={issue.title}>
                                  {issue.title}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No Issues Available</MenuItem>
                          )}
                        </TextField>
                      </>
                    )}
                  />
                </div>
                {/* {watchFields.ticketTitle === getOtherTicketId() && (
                <Controller
                  name="newIssue"
                  control={control}
                  rules={{
                    validate: (value) =>
                      watchFields.ticketTitle === getOtherTicketId()
                        ? value.trim().length > 0 || "Please specify the reason"
                        : true,
                  }}
                  render={({ field }) => (
                    <>
                      <TextField
                        {...field}
                        label="Please specify the reason"
                        className="col-span-2"
                        multiline
                        rows={3}
                        error={!!errors.newIssue}
                        helperText={errors.newIssue?.message}
                        fullWidth
                      />
                    </>
                  )}
                />
              )} */}
                <div>
                  <Controller
                    name="attachments"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Box className="flex flex-col gap-2">
                        <input
                          ref={imageRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                          multiple
                          hidden
                          id="ticket-attachment-upload"
                          onChange={(e) => {
                            const selectedFiles = Array.from(e.target.files || []);
                            const existingFiles = Array.isArray(value) ? value : [];
                            const availableSlots = 5 - existingFiles.length;
                            const validFiles = selectedFiles
                              .slice(0, Math.max(availableSlots, 0))
                              .filter((file) => {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error(`${file.name} exceeds the 5 MB limit`);
                                  return false;
                                }
                                return true;
                              });

                            if (selectedFiles.length > availableSlots) {
                              toast.error("You can attach a maximum of 5 files");
                            }

                            onChange([...existingFiles, ...validFiles]);
                            e.target.value = "";
                          }}
                        />

                        <TextField
                          size="small"
                          variant="outlined"
                          fullWidth
                          label="Upload Files"
                          value={value?.length ? `${value.length} file(s) selected` : ""}
                          placeholder="Choose up to 5 files"
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <IconButton
                                color="primary"
                                component="label"
                                htmlFor="ticket-attachment-upload"
                                disabled={value?.length >= 5}
                              >
                                <LuImageUp />
                              </IconButton>
                            ),
                          }}
                        />

                        <FormHelperText>
                          Maximum 5 files, 5 MB each. Images, PDF, Word, Excel, and CSV.
                        </FormHelperText>
                        {value?.map((file, index) => (
                          <div
                            key={`${file.name}-${file.lastModified}`}
                            className="flex items-center justify-between rounded border border-borderGray px-3 py-2"
                          >
                            <button
                              type="button"
                              className="truncate text-left text-primary underline"
                              onClick={() => {
                                if (!file.type.startsWith("image/")) return;
                                if (preview?.url) URL.revokeObjectURL(preview.url);
                                setPreview({ name: file.name, url: URL.createObjectURL(file) });
                                setOpenModal(true);
                              }}
                              title={file.type.startsWith("image/") ? "Preview image" : file.name}
                            >
                              {file.name}
                            </button>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => onChange(value.filter((_, fileIndex) => fileIndex !== index))}
                              aria-label={`Remove ${file.name}`}
                            >
                              <MdDelete />
                            </IconButton>
                          </div>
                        ))}
                        <MuiModal
                          open={openModal && !!preview}
                          onClose={() => setOpenModal(false)}
                          title={preview?.name || "Preview File"}
                        >
                          <img
                            src={preview?.url}
                            alt={preview?.name || "Attachment preview"}
                            className="max-h-[70vh] max-w-full rounded"
                          />
                        </MuiModal>
                      </Box>
                    )}
                  />
                </div>
              </div>
              {/* Second Div */}
              <div>
                <Controller
                  name="message"
                  control={control}
                  rules={{
                    required: "Please specify your message",
                    validate: { noOnlyWhitespace },
                  }}
                  render={({ field }) => (
                    <>
                      <TextField
                        {...field}
                        size="small"
                        label="Message"
                        error={!!errors.message}
                        helperText={errors.message?.message}
                        fullWidth
                        multiline
                        rows={6} // ← Change this number to increase/decrease height
                      />
                    </>
                  )}
                />
              </div>
            </div>

            <div className="flex align-middle mt-5 mb-5 items-center justify-center">
              <PrimaryButton
                disabled={pendingRaise}
                isLoading={pendingRaise}
                title="Submit"
                type={"submit"}
              />
            </div>
          </form>
        </div>
      </div>
      <div className="rounded-md bg-white p-4 border-2 ">
        <div className="flex flex-row justify-between mb-4">
          <div className="text-[20px]">My Tickets</div>
        </div>
        <div className=" w-full">
          {ticketsLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <CircularProgress color="black" />
            </div>
          ) : (
            <YearWiseTable
              key={tickets?.length}
              search
              dropdownColumns={["status", "priority"]}
              data={tickets?.map((ticket, index) => {
                return {
                  raisedBy: ticket?.raisedBy?.firstName || "Unknown",
                  raisedTo: ticket?.raisedToDepartment?.name || "Unknown",
                  description: ticket?.description,
                  ticketTitle: ticket?.ticket,
                  status: ticket?.status,
                  closingRemark: ticket?.closingRemark,
                  closingCategories: ticket?.closingCategories,
                  isItDepartment: ["it", "tech"].includes(
                    ticket?.raisedToDepartment?.name?.trim().toLowerCase(),
                  ),
                  acceptedBy: ticket?.acceptedBy
                    ? `${ticket.acceptedBy.firstName} ${ticket.acceptedBy.lastName}`
                    : "None",
                  closedBy: ticket?.closedBy
                    ? `${ticket.closedBy.firstName} ${ticket.closedBy.lastName}`
                    : "None",
                  acceptedAt: ticket?.acceptedAt ? ticket.acceptedAt : "N/A",
                  closedAt: ticket?.closedAt ? ticket.closedAt : "N/A",
                  priority: ticket?.priority,
                  ...(() => {
                    const { assignedToDisplay, assignmentDetails } =
                      formatAssignments(ticket.assignedTo);
                    return {
                      assignedTo: assignedToDisplay,
                      assignedToDetails: assignmentDetails,
                    };
                  })(),
                  image: ticket.image ? ticket.image.url : null,
                  attachments: ticket.attachments || [],
                  raisedAt: ticket.createdAt,
                  ...formatEscalation(ticket.escalatedTo),
                };
              })}
              columns={recievedTicketsColumns}
              paginationPageSize={10}
            />
          )}
        </div>
      </div>
      <MuiModal
        open={viewDetails && viewTicketDetails}
        onClose={() => setViewDetails(false)}
        title={"Ticket Details"}
      >
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 overflow-y-auto max-h-[70vh]">
          <DetalisFormatted
            title="Ticket Title"
            detail={viewTicketDetails?.ticketTitle}
          />
          <DetalisFormatted
            title="Description"
            detail={viewTicketDetails?.description}
          />
          {/* <DetalisFormatted
            title="Raised By"
            detail={viewTicketDetails?.raisedBy}
          /> */}
          <DetalisFormatted
            title="Raised To Department"
            detail={viewTicketDetails?.raisedTo}
          />
          <DetalisFormatted
            title="Raised At"
            detail={formatDateTime(viewTicketDetails?.raisedAt)}
          />

          {/* <DetalisFormatted
            title="Priority"
            detail={viewTicketDetails?.priority}
          /> */}
          <DetalisFormatted
            title="Accepted By"
            detail={viewTicketDetails?.acceptedBy}
          />

          <DetalisFormatted
            title="Accepted At"
            detail={formatDateTime(viewTicketDetails?.acceptedAt)}
          />
          {/* <DetalisFormatted
            title="Assigned To"
            detail={viewTicketDetails?.assignedTo || ""}
          /> */}

          {/* <DetalisFormatted
            title="Escalated To"
            detail={viewTicketDetails?.escalatedTo || ""}
          />
          <DetalisFormatted
            title="Escalated Status"
            detail={viewTicketDetails?.escalatedStatus || ""}
          />
          <DetalisFormatted
            title="Escalated At"
            detail={viewTicketDetails?.escalatedAt || ""}
          /> */}
          <DetalisFormatted
            title="Closed By"
            detail={viewTicketDetails?.closedBy}
          />
          <DetalisFormatted
            title="Closed At"
            detail={formatDateTime(viewTicketDetails?.closedAt)}
          />
          <DetalisFormatted title="Status" detail={viewTicketDetails?.status} />
          <DetalisFormatted
            title="Closing Remark"
            detail={viewTicketDetails?.closingRemark}
          />
           {viewTicketDetails?.isItDepartment &&
            Array.isArray(viewTicketDetails?.closingCategories) &&
            viewTicketDetails.closingCategories.length > 0 && (
            <DetalisFormatted
              title="Categories"
              detail={Array.isArray(viewTicketDetails?.closingCategories)
                ? viewTicketDetails.closingCategories.join(", ")
                : ""}
            />
          )}
          <TicketAttachments
            attachments={viewTicketDetails.attachments}
            legacyImage={viewTicketDetails.image}
          />
        </div>
      </MuiModal>
    </div>
  );
};

export default RaiseTicket;
