import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Delete } from "@mui/icons-material";
import {
  Button,
  Chip,
  Box,
  TextField,
  Checkbox,
  List,
  ListItem,
  IconButton,
  AvatarGroup,
  Avatar,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { queryClient } from "../../main";
import MuiModal from "../../components/MuiModal";
import PrimaryButton from "../../components/PrimaryButton";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import { Controller, useForm } from "react-hook-form";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import usePageDepartment from "../../hooks/usePageDepartment";
import useAuth from "../../hooks/useAuth";

const ManageMeetings = () => {
  const axios = useAxiosPrivate();
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [checklists, setChecklists] = useState({});
  const department = usePageDepartment();
  const [newItem, setNewItem] = useState("");
  const [modalMode, setModalMode] = useState("update"); // 'update', or 'view'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [submittedChecklists, setSubmittedChecklists] = useState({});
  const { auth } = useAuth();

  const statusColors = {
    Upcoming: { bg: "#E3F2FD", text: "#1565C0" }, // Light Blue
    Ongoing: { bg: "#FFF3E0", text: "#E65100" }, // Light Orange
    Completed: { bg: "#E8F5E9", text: "#1B5E20" }, // Light Green
    Cancelled: { bg: "#FFEBEE", text: "#B71C1C" }, // Light Red
    Available: { bg: "#E3F2FD", text: "#0D47A1" },
    Occupied: { bg: "#ECEFF1", text: "#37474F" },
    Cleaning: { bg: "#E0F2F1", text: "#00796B" },
    Pending: { bg: "#FFFDE7", text: "#F57F17" },
    "In Progress": { bg: "#FBE9E7", text: "#BF360C" },
  };

  const defaultChecklist = [
    { name: "Desk is cleaned", checked: false },
    { name: "Chairs are clean and neatly arranged", checked: false },
    { name: "AC is cooling", checked: false },
    {
      name: "TV, HDMI cable, LAN cable are available and active",
      checked: false,
    },
    { name: "TV & AC remotes in place", checked: false },
    { name: "Air freshener sprayed", checked: false },
    { name: "Water bottle & glass placed", checked: false },
    { name: "Tissue placed on the table", checked: false },
  ];
  // const meetings = useSelector((state) => state.meetings?.data);

  //-----------------------API-----------------------------//
  //-------------------------------API-------------------------------//
  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["biznest-participants"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return response.data
        .filter((user) => user._id !== auth.user?._id)
        .filter((u) => u.isActive === true);
    },
  });
  const { data: clientEmployees = [], isLoading: isClientEmployeesLoading } =
    useQuery({
      queryKey: ["client-participants"],
      queryFn: async () => {
        const response = await axios.get("/api/sales/co-working-clients");
        return response.data.flatMap((item) => item.members);
      },
    });
  //-------------------------------API-------------------------------//
  //-----------------------API-----------------------------//

  //-----------------------------Form--------------------------------//
  const {
    handleSubmit: cancelMeetingSubmit,
    control: cancelMeetingControl,
    reset: resetCancelMeeting,
    formState: { errors: cancelMeetingErrors },
  } = useForm({
    defaultValues: {
      reason: "",
    },
  });
  const {
    handleSubmit: extendMeetingSubmit,
    control: extendMeetingControl,
    reset: resetExtendMeeting,
    formState: { errors: extendMeetingErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      newEndTime: null,
    },
  });

  const {
    handleSubmit: handleEditMeetingSubmit,
    control: editControl,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: {
      startTime: null,
      endTime: null,
      internalParticipants: [],
      clientParticipants: [],
    },
  });

  const { mutate: updateMeeting, isPending: isUpdatePending } = useMutation({
    mutationKey: ["update-meeting"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        "/api/meetings/update-meeting-details",
        { ...data, meetingId: selectedMeetingId, internalParticipants: [] }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "UPDATED");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setDetailsModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update meeting");
    },
  });

  const onEditSubmit = (data) => {
    const payload = {
      ...data,
      internalParticipants: data.internalParticipants?.map((p) => p._id),
      clientParticipants: data.clientParticipants?.map((p) => p._id),
    };
    updateMeeting(payload);
    console.log("Final payload:", payload);
    // Send `payload` in your mutation or API call
  };

  useEffect(() => {
    if (selectedMeeting) {
      setEditValue("startTime", dayjs(new Date(selectedMeeting.startTime)));
      setEditValue("endTime", dayjs(new Date(selectedMeeting.endTime)));

      const formattedInternal =
        selectedMeeting.participants?.map((p) => ({
          _id: p._id,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
        })) || [];

      const formattedExternal =
        selectedMeeting.participants?.map((p) => ({
          _id: p._id,
          employeeName: p.employeeName,
          email: p.email,
        })) || [];

      setEditValue("internalParticipants", formattedInternal);
      setEditValue("clientParticipants", formattedExternal);
    }
  }, [selectedMeeting]);

  //-----------------------------Form--------------------------------//

  //------------------------------API--------------------------------//
  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return response.data;
    },
  });
  const filteredMeetings = meetings.filter(
    (item) =>
      item.meetingStatus !== "Completed" && item.meetingType === "Internal"
  );

  const transformedMeetings = filteredMeetings.map((meeting, index) => ({
    ...meeting,
    date: meeting.date,
    bookedBy: meeting.bookedBy
      ? `${meeting.bookedBy.firstName} ${meeting.bookedBy.lastName}`
      : meeting.clientBookedBy?.employeeName || "Unknown",
    bookedById: meeting.bookedBy ? meeting.bookedBy._id : "",
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    extendTime: meeting.extendTime,
    srNo: index + 1,
    company: meeting.client || "",
    clientBookedBy: meeting.clientBookedBy || "",
    department:
      meeting.bookedBy &&
      [...meeting.bookedBy.departments.map((dept) => dept.name)].join(","),
  }));

  // API mutation for submitting housekeeping tasks
  const housekeepingMutation = useMutation({
    mutationFn: async (data) => {
      await axios.patch("/api/meetings/create-housekeeping-tasks", data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setSubmittedChecklists((prev) => ({
        ...prev,
        [selectedMeetingId]: true,
      }));
      toast.success("Checklist completed");
      handleCloseChecklistModal();
    },

    onError: () => {
      toast.error("Failed to submit checklist");
    },
  });

  const { mutate: cancelMeeting, isPending: isCancelPending } = useMutation({
    mutationFn: async (data) => {
      const respone = await axios.patch(
        `/api/meetings/cancel-meeting/${selectedMeetingId}`,
        data
      );
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      return respone.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: extendMeeting, isPending: isExtendPending } = useMutation({
    mutationFn: async (data) => {
      const respone = await axios.patch(`/api/meetings/extend-meeting`, data);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      return respone.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setDetailsModal(false);
      resetExtendMeeting();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { mutate: completeMeeting, isPending: isCompletePending } = useMutation(
    {
      mutationFn: async (data) => {
        const respone = await axios.patch(
          `/api/meetings/update-meeting-status`,
          data
        );
        queryClient.invalidateQueries({ queryKey: ["meetings"] });
        return respone.data;
      },
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );
  //------------------------------API--------------------------------//

  // Initialize checklists when meetings are loaded
  useEffect(() => {
    if (meetings.length > 0) {
      const initialChecklists = {};
      meetings.forEach((meeting) => {
        initialChecklists[meeting._id] = {
          defaultItems: [...defaultChecklist],
          customItems: [],
        };
      });
      setChecklists(initialChecklists);
    }
  }, [meetings]);

  //---------------------------------Event handlers----------------------------------------//

  const handleOpenChecklistModal = (mode, meetingId) => {
    setModalMode(mode);
    setSelectedMeetingId(meetingId);
    setChecklistModalOpen(true); // ✅ Open checklist modal
  };

  const handleExtendMeetingModal = (mode, meetingId) => {
    setModalMode(mode);
    setSelectedMeeting(meetingId);
    setDetailsModal(true);
  };

  const handleOngoing = (mode, meetingId) => {
    setSelectedMeetingId(meetingId);
    completeMeeting({
      meetingId: meetingId,
      status: "Ongoing",
    });
  };
  const handleCompleted = (mode, meetingId) => {
    setSelectedMeetingId(meetingId);
    completeMeeting({
      meetingId: meetingId,
      status: "Completed",
    });
  };

  const handleCloseChecklistModal = () => {
    setChecklistModalOpen(false);
    setSelectedMeetingId(null);
  };
  const handleSelectedMeeting = (mode, data) => {
    setModalMode(mode);
    setSelectedMeeting(data);
    setSelectedMeetingId(data._id);
    setDetailsModal(true);
  };
  const handleEditMeeting = (mode, data) => {
    setModalMode(mode);
    setSelectedMeeting(data);
    setSelectedMeetingId(data._id);
    setDetailsModal(true);
  };

  const handleAddChecklistItem = () => {
    if (!newItem.trim() || !selectedMeetingId) return;
    setChecklists((prev) => {
      const updatedCustomItems = [
        ...prev[selectedMeetingId].customItems,
        { name: newItem.trim(), checked: false },
      ];
      return {
        ...prev,
        [selectedMeetingId]: {
          ...prev[selectedMeetingId],
          customItems: updatedCustomItems,
        },
      };
    });
    setNewItem("");
  };

  const handleToggleChecklistItem = (index, type) => {
    if (!selectedMeetingId) return;
    setChecklists((prev) => {
      const updatedItems = prev[selectedMeetingId][type].map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      );
      return {
        ...prev,
        [selectedMeetingId]: {
          ...prev[selectedMeetingId],
          [type]: updatedItems,
        },
      };
    });
  };

  const handleRemoveChecklistItem = (index) => {
    if (!selectedMeetingId) return;
    setChecklists((prev) => {
      const updatedCustomItems = prev[selectedMeetingId].customItems.filter(
        (_, i) => i !== index
      );
      return {
        ...prev,
        [selectedMeetingId]: {
          ...prev[selectedMeetingId],
          customItems: updatedCustomItems,
        },
      };
    });
  };

  const isSubmitDisabled = () => {
    if (!selectedMeetingId) return true;
    const { defaultItems, customItems } = checklists[selectedMeetingId] || {
      defaultItems: [],
      customItems: [],
    };
    return [...defaultItems, ...customItems].some((item) => !item.checked);
  };

  const handleSubmitChecklist = async () => {
    if (!selectedMeetingId) return;

    const selectedMeeting = meetings.find(
      (meeting) => meeting._id === selectedMeetingId
    );
    if (!selectedMeeting) return;

    const { defaultItems = [], customItems = [] } =
      checklists[selectedMeetingId] || {};

    const allCheckedItems = [...defaultItems, ...customItems].filter(
      (item) => item.checked
    );

    const housekeepingTasks = allCheckedItems.map((item) => ({
      name: item.name,
      status: "Completed",
    }));

    const payload = {
      meetingId: selectedMeetingId,
      roomName: selectedMeeting.roomName,
      housekeepingTasks,
    };

    housekeepingMutation.mutate(payload);
  };

  console.log("selected : ", selectedMeeting, selectedMeetingId);

  //---------------------------------Event handlers----------------------------------------//

  const columns = [
    { field: "srNo", headerName: "Sr No", sort: "desc" },
    { field: "client", headerName: "Company" },
    { field: "bookedBy", headerName: "Booked By" },
    { field: "roomName", headerName: "Room Name" },
    {
      field: "date",
      headerName: "Date",
      cellRenderer: (params) => params.value,
    },
    {
      field: "startTime",
      headerName: "Start Time",
      cellRenderer: (params) => humanTime(params.value),
    },
    {
      field: "endTime",
      headerName: "End Time",
      cellRenderer: (params) => humanTime(params.value),
    },
    {
      field: "extendTime",
      headerName: "Extended Time",
      cellRenderer: (params) => humanTime(params.value) || "-",
    },
    {
      field: "meetingStatus",
      headerName: "Meeting Status",
      cellRenderer: (params) => (
        <Chip
          label={params.value || ""}
          sx={{
            backgroundColor: statusColors[params.value]?.bg || "#F5F5F5",
            color: statusColors[params.value]?.text || "#000",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "housekeepingStatus",
      headerName: "Housekeeping Status",
      cellRenderer: (params) => {
        return (
          <Chip
            label={params.value || ""}
            sx={{
              backgroundColor: statusColors[params.value]?.bg || "#F5F5F5",
              color: statusColors[params.value]?.text || "#000",
              fontWeight: "bold",
            }}
          />
        );
      },
    },
    {
      field: "participants",
      headerName: "Participants",
      cellRenderer: (params) => {
        const participants = Array.isArray(params.data?.participants)
          ? params.data?.participants
          : [];
        return (
          <div className="flex justify-start items-center">
            <AvatarGroup max={4}>
              {participants?.map((participant, index) => {
                return (
                  <Avatar
                    key={index}
                    alt={participant.firstName}
                    // src={participant.avatar}
                    src="https://ui-avatars.com/api/?name=Alice+Johnson&background=random"
                    sx={{ width: 23, height: 23 }}
                  />
                );
              })}
            </AvatarGroup>
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      pinned: "right",
      cellRenderer: (params) => {
        const status = params.data.meetingStatus;
        const housekeepingStatus = params.data.housekeepingStatus;

        const isUpcoming = status === "Upcoming";
        const isCancelled = status === "Cancelled";
        const isOngoing = status === "Ongoing";
        const isCompleted = status === "Completed";
        const isHousekeepingPending = housekeepingStatus === "Pending";
        const isHousekeepingCompleted = housekeepingStatus === "Completed";

        const menuItems = [
          !isOngoing &&
            !isHousekeepingCompleted && {
              label: "Update Checklist",
              onClick: () =>
                handleOpenChecklistModal("update", params.data._id),
            },
          isUpcoming && {
            label: "Edit",
            onClick: () => handleEditMeeting("edit", params.data),
          },
          !isOngoing &&
            !isHousekeepingPending && {
              label: "Mark As Ongoing",
              onClick: () => handleOngoing("ongoing", params.data._id),
            },
          !isUpcoming && {
            label: "Mark As Completed",
            onClick: () => handleCompleted("complete", params.data._id),
          },
          !isUpcoming && {
            label: "Extend Meeting",
            onClick: () => handleExtendMeetingModal("extend", params.data),
          },
          !isCancelled && {
            label: "Cancel",
            onClick: () => handleSelectedMeeting("cancel", params.data),
          },
        ].filter(Boolean);

        return (
          <div className="flex gap-2 items-center">
            <div
              onClick={() => handleSelectedMeeting("viewDetails", params.data)}
              className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
            >
              <span className="text-subtitle">
                <MdOutlineRemoveRedEye />
              </span>
            </div>

            {!isCancelled && <ThreeDotMenu menuItems={menuItems} />}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        {!isMeetingsLoading ? (
          <YearWiseTable
            search
            dateColumn={"date"}
            tableTitle={"Manage Meetings"}
            data={transformedMeetings || []}
            columns={columns}
          />
        ) : (
          <CircularProgress />
        )}
      </PageFrame>

      {/* Checklist Modal */}
      <MuiModal
        open={checklistModalOpen}
        onClose={handleCloseChecklistModal}
        title={"Checklist"}
      >
        <Box
          sx={{
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            justifyContent: "start",
            alignItems: "start",
          }}
        >
          {/* Scrollable Checklist Section */}
          <div className="h-[60vh] overflow-y-auto w-full">
            <span className="text-subtitle text-primary font-pmedium">
              Default Tasks
            </span>
            <List>
              {checklists[selectedMeetingId]?.defaultItems.map(
                (item, index) => (
                  <ListItem key={index}>
                    <Checkbox
                      disabled={modalMode === "view"}
                      checked={item.checked}
                      onChange={() =>
                        handleToggleChecklistItem(index, "defaultItems")
                      }
                    />
                    {item.name}
                  </ListItem>
                )
              )}
            </List>

            {checklists[selectedMeetingId]?.customItems?.length > 0 && (
              <>
                <span className="text-subtitle text-primary font-pmedium">
                  Custom Tasks
                </span>
                <List sx={{ width: "100%" }}>
                  {checklists[selectedMeetingId]?.customItems.map(
                    (item, index) => (
                      <ListItem key={index} sx={{ width: "100%" }}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <Checkbox
                              disabled={modalMode === "view"}
                              checked={item.checked}
                              onChange={() =>
                                handleToggleChecklistItem(index, "customItems")
                              }
                            />
                            {item.name}
                          </div>
                          <div>
                            {modalMode === "update" && (
                              <IconButton
                                onClick={() => handleRemoveChecklistItem(index)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </div>
                        </div>
                      </ListItem>
                    )
                  )}
                </List>
              </>
            )}

            {/* Add New Checklist Item Section */}
            {modalMode === "update" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Add Checklist Task"
                  value={newItem}
                  size="small"
                  onChange={(e) => setNewItem(e.target.value)}
                />
                <PrimaryButton
                  title={"Add"}
                  handleSubmit={handleAddChecklistItem}
                  externalStyles={{ whiteSpace: "nowrap" }} // Prevents text from wrapping
                />
              </Box>
            )}
          </div>

          {/* Sticky Footer Section */}
          {modalMode === "update" && (
            <div className="p-4 bg-white flex justify-center items-center w-full">
              {/* todo - PrimaryButton needs a disabled look */}
              <Button
                variant="contained"
                disabled={isSubmitDisabled()}
                onClick={handleSubmitChecklist}
              >
                Submit
              </Button>
            </div>
          )}
        </Box>
      </MuiModal>
      <MuiModal
        // title={"Meeting Details"}
        title={
          modalMode === "viewDetails"
            ? "Meeting Details"
            : modalMode === "cancel"
            ? "Cancel Meeting"
            : modalMode === "extend"
            ? "Extend Meeting"
            : modalMode === "edit"
            ? "Edit Meeting"
            : ""
        }
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
      >
        {modalMode === "viewDetails" && (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 w-full">
            <div className="font-bold">Basic Info</div>
            <DetalisFormatted
              title="Title"
              detail={selectedMeeting?.subject || "Title"}
            />
            <DetalisFormatted
              title="Agenda"
              detail={selectedMeeting.agenda || "N/A"}
            />
            <DetalisFormatted title="Date" detail={selectedMeeting?.date} />
            <DetalisFormatted
              title="Time"
              detail={`${humanTime(selectedMeeting.startTime)} - ${humanTime(
                selectedMeeting.endTime
              )}`}
            />
            <DetalisFormatted
              title="Duration"
              detail={selectedMeeting.duration || "N/A"}
            />
            <DetalisFormatted
              title="Status"
              detail={selectedMeeting.meetingStatus || "N/A"}
            />
            <DetalisFormatted
              title="Type"
              detail={selectedMeeting.meetingType || "N/A"}
            />
            <DetalisFormatted
              title="Company"
              detail={selectedMeeting.client || "N/A"}
            />
            <br />
            <div className="font-bold">People Involved</div>
            {selectedMeeting.participants?.length > 0 && (
              <DetalisFormatted
                title="Participants"
                detail={
                  selectedMeeting.participants
                    .map((p) => {
                      return p.firstName
                        ? `${p.firstName} ${p.lastName}`
                        : p.employeeName
                        ? p.employeeName
                        : "N/A";
                    })
                    .join(", ") || "N/A"
                }
              />
            )}

            <DetalisFormatted
              title="Booked By"
              detail={selectedMeeting.bookedBy}
            />
            <DetalisFormatted
              title="Receptionist"
              detail={selectedMeeting.receptionist}
              // detail={`N/A`}
            />
            <DetalisFormatted
              title="Department"
              detail={selectedMeeting.department || "Unknown"}
            />
            <DetalisFormatted
              title="Company"
              detail={selectedMeeting.client || "Unknown"}
            />
            <br />
            <div className="font-bold">Venue Details</div>
            <DetalisFormatted title="Room" detail={selectedMeeting.roomName} />
            <DetalisFormatted
              title="Location"
              detail={`${selectedMeeting.location?.unitNo} (${selectedMeeting.location?.unitName})`}
            />
            <DetalisFormatted
              title="Building"
              detail={selectedMeeting.location?.building?.buildingName}
            />
            <DetalisFormatted
              title="Housekeeping Status"
              detail={selectedMeeting.housekeepingStatus}
            />
          </div>
        )}
        {modalMode === "cancel" && (
          <div>
            <form
              className="flex flex-col gap-4"
              onSubmit={cancelMeetingSubmit((data) => {
                cancelMeeting({
                  meetingId: selectedMeeting?.meetingId,
                  reason: data.reason,
                });
                resetCancelMeeting();
                setDetailsModal(false);
              })}
            >
              <Controller
                name="reason"
                control={cancelMeetingControl}
                rules={{ required: "Reason for cancellation is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={"Reason"}
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    error={!!cancelMeetingErrors.reason}
                    helperText={cancelMeetingErrors.reason?.message}
                  />
                )}
              />
              <div className="flex w-full">
                <PrimaryButton
                  title={"Cancel Meeting"}
                  type={"submit"}
                  disabled={isCancelPending}
                  isLoading={isCancelPending}
                  externalStyles={"w-full"}
                />
              </div>
            </form>
          </div>
        )}
        {modalMode === "extend" && (
          <div>
            <form
              className="flex flex-col gap-4"
              onSubmit={extendMeetingSubmit((data) => {
                extendMeeting({
                  meetingId: selectedMeeting?._id,
                  newEndTime: data.newEndTime,
                });
              })}
            >
              <div className="flex flex-col gap-4">
                <span className="text-content">Meeting Details</span>
                <hr />
              </div>
              <div className="flex justify-between w-full items-center">
                <div>
                  <span>
                    Start Time :{" "}
                    <span>{humanTime(selectedMeeting?.startTime)}</span>
                  </span>
                </div>
                <div>
                  <span>
                    End Time :{" "}
                    <span>{humanTime(selectedMeeting?.endTime)}</span>
                  </span>
                </div>
              </div>
              <Controller
                name="newEndTime"
                control={extendMeetingControl}
                rules={{
                  required: "New end time is required",
                  validate: (value) => {
                    if (!value || !selectedMeeting?.endTime) return true;
                    const originalEnd = dayjs(selectedMeeting.endTime);
                    const newEnd = dayjs(value);

                    if (newEnd.diff(originalEnd, "minute") < 30) {
                      return "New end time must be at least 30 minutes after current end time.";
                    }

                    return true;
                  },
                }}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!extendMeetingErrors.newEndTime,
                        helperText: extendMeetingErrors.newEndTime?.message,
                      },
                    }}
                    label={"Select an End Time"}
                  />
                )}
              />

              <PrimaryButton
                title={"Extend Meeting"}
                type={"submit"}
                disabled={isExtendPending}
                isLoading={isExtendPending}
              />
            </form>
          </div>
        )}
        {modalMode === "edit" && (
          <div>
            <form
              onSubmit={handleEditMeetingSubmit(onEditSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <Controller
                name="startTime"
                control={editControl}
                rules={{
                  required: "Start time is required",
                }}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!editErrors.startTime,
                        helperText: editErrors.startTime?.message,
                      },
                    }}
                    label={"Start Time"}
                  />
                )}
              />
              <Controller
                name="endTime"
                control={editControl}
                rules={{
                  required: "End time is required",
                }}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!editErrors.endTime,
                        helperText: editErrors.endTime?.message,
                      },
                    }}
                    label={"End Time"}
                  />
                )}
              />
              {!selectedMeeting?.clientBookedBy ? (
                <div className="col-span-2">
                  <Controller
                    name="internalParticipants"
                    control={editControl}
                    render={({ field }) => {
                      const selectedParticipantIds =
                        field.value?.map((p) => p._id) || [];
                      const bookedById = selectedMeeting?.bookedById;

                      const availableOptions = employees.filter(
                        (emp) =>
                          !selectedParticipantIds.includes(emp._id) &&
                          emp._id !== bookedById
                      );

                      const mergedOptions = [
                        ...field.value,
                        ...availableOptions,
                      ];

                      return (
                        <Autocomplete
                          {...field}
                          multiple
                          options={mergedOptions}
                          getOptionLabel={(option) =>
                            `${option.firstName} ${option.lastName}`
                          }
                          value={field.value || []}
                          onChange={(_, newValue) => field.onChange(newValue)}
                          isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                          }
                          renderInput={(params) =>
                            !isEmployeesLoading ? (
                              <TextField
                                {...params}
                                label="Participants"
                                size="small"
                                error={!!editErrors.internalParticipants}
                                helperText={
                                  editErrors.internalParticipants?.message
                                }
                              />
                            ) : (
                              <CircularProgress size={10} />
                            )
                          }
                        />
                      );
                    }}
                  />
                </div>
              ) : (
                <div className="col-span-2">
                  <Controller
                    name="clientParticipants"
                    control={editControl}
                    render={({ field }) => {
                      const selectedExternalIds =
                        field.value?.map((p) => p._id) || [];

                      const bookedByEmployeeName =
                        selectedMeeting?.clientBookedBy?.employeeName;

                      // Find the booking employee from clientEmployees
                      const bookedByEmployee = clientEmployees.find(
                        (emp) => emp.employeeName === bookedByEmployeeName
                      );
                      const bookedByCompanyId = bookedByEmployee?.client?._id;

                      // Filter members of the same company, excluding the person who booked
                      const companyMembers = clientEmployees.filter(
                        (emp) =>
                          emp.client?._id === bookedByCompanyId &&
                          emp.employeeName !== bookedByEmployeeName &&
                          !selectedExternalIds.includes(emp._id)
                      );
                      const mergedExternalOptions = [
                        ...field.value,
                        ...companyMembers,
                      ];

                      return (
                        <Autocomplete
                          {...field}
                          multiple
                          options={mergedExternalOptions}
                          getOptionLabel={(option) => `${option.employeeName}`}
                          value={field.value || []}
                          onChange={(_, newValue) => field.onChange(newValue)}
                          isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                          }
                          renderInput={(params) =>
                            !isClientEmployeesLoading ? (
                              <TextField
                                {...params}
                                label="External Participants"
                                size="small"
                                error={!!editErrors.clientParticipants}
                                helperText={
                                  editErrors.clientParticipants?.message
                                }
                              />
                            ) : (
                              <CircularProgress size={10} />
                            )
                          }
                        />
                      );
                    }}
                  />
                </div>
              )}

              <PrimaryButton
                title={"Update Meeting"}
                type={"submit"}
                externalStyles={"col-span-2"}
                disabled={isUpdatePending}
                isLoading={isUpdatePending}
              />
            </form>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default ManageMeetings;
