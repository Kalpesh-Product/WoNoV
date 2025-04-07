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
} from "@mui/material";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { queryClient } from "../../main";
import MuiModal from "../../components/MuiModal";
import PrimaryButton from "../../components/PrimaryButton";
import { useSelector } from "react-redux";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import { Controller, useForm } from "react-hook-form";

const ManageMeetings = () => {
  const axios = useAxiosPrivate();
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [checklists, setChecklists] = useState({});
  const [newItem, setNewItem] = useState("");
  const [modalMode, setModalMode] = useState("update"); // 'update', or 'view'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);

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
    { name: "Clean and arrange chairs and tables", checked: false },
    { name: "Check projector functionality", checked: false },
    { name: "Ensure AC is working", checked: false },
    { name: "Clean whiteboard and provide markers", checked: false },
    { name: "Vacuum and clean the floor", checked: false },
    { name: "Check lighting and replace bulbs if necessary", checked: false },
    { name: "Ensure Wi-Fi connectivity", checked: false },
    { name: "Stock water bottles and glasses", checked: false },
    { name: "Inspect electrical sockets and outlets", checked: false },
    { name: "Remove any trash or debris", checked: false },
  ];
  // const meetings = useSelector((state) => state.meetings?.data);

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
    (item) => item.meetingStatus === "Upcoming"
  );
  // API mutation for submitting housekeeping tasks
  const housekeepingMutation = useMutation({
    mutationFn: async (data) => {
      await axios.patch("/api/meetings/create-housekeeping-tasks", data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] }); // ✅ Refetch meetings after update
      toast.success("Checklist completed");
      handleCloseChecklistModal();
    },
    onError: () => {
      toast.error("Failed to submit checklist");
    },
  });

  const { mutate: cancelMeeting, isPending: isCancelPending } = useMutation({
    mutationFn: async (data) => {
      console.log(data);
      const respone = await axios.patch(
        `/api/meetings/cancel-meeting/${selectedMeetingId}`,data
      );
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      return respone.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {},
  });
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
    setDetailsModal(true);
  };

  useEffect(
    () => console.log("Selected meeting : ", selectedMeetingId),
    [selectedMeetingId]
  );

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

    const { customItems } = checklists[selectedMeetingId];

    const housekeepingTasks = customItems.map((item) => ({
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
  //---------------------------------Event handlers----------------------------------------//

  const columns = [
    { field: "roomName", headerName: "Room Name" },
    { field: "startTime", headerName: "Start Time" },
    { field: "endTime", headerName: "End Time" },
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
      cellRenderer: (params) => (
        <div className="flex gap-2 items-center">
          <div
            onClick={() => {
              handleSelectedMeeting("viewDetails", params.data);
            }}
            className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
          >
            <span className="text-subtitle">
              <MdOutlineRemoveRedEye />
            </span>
          </div>
          <ThreeDotMenu
            menuItems={[
              {
                label: "Update",
                onClick: () =>
                  handleOpenChecklistModal("update", params.data._id),
                disabled: params.data.housekeepingStatus === "Completed",
              },
              {
                label: "View",
                onClick: () =>
                  handleOpenChecklistModal("view", params.data._id),
              },
              {
                label: "Cancel",
                onClick: () =>
                  handleSelectedMeeting("cancel", params.data),
              },
            ]}
          />
        </div>
      ),
    },
  ];
  // ✅ Columns update whenever `meetings` changes

  return (
    <div className="p-4 flex flex-col gap-4">
      {!isMeetingsLoading ? (
        <AgTable
          key={filteredMeetings.length}
          search
          tableTitle={"Manage Meetings"}
          data={filteredMeetings || []}
          columns={columns}
        />
      ) : (
        <CircularProgress />
      )}

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
        title={"Meeting Details"}
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
      >
        {modalMode === "viewDetails" && (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <DetalisFormatted
              title={"Room Name"}
              detail={selectedMeeting?.roomName}
            />
            <DetalisFormatted title={"Date"} detail={selectedMeeting?.date} />
            <DetalisFormatted
              title={"Start Time"}
              detail={selectedMeeting?.startTime}
            />
            <DetalisFormatted
              title={"End Time"}
              detail={selectedMeeting?.endTime}
            />
            <div className="col-span-1 ">
              <DetalisFormatted
                title={"Participants"}
                detail={selectedMeeting?.participants.map((item) => (
                  <span>{`${item.firstName || "Unknown"} ${
                    item.lastName || "Unknown"
                  }`}</span>
                ))}
              />
            </div>
            <div></div>
            <DetalisFormatted
              title={"House Keeping Status"}
              detail={selectedMeeting?.housekeepingStatus}
            />
            <DetalisFormatted
              title={"Department"}
              detail={selectedMeeting?.department}
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
                  reason : data.reason
                });
                resetCancelMeeting();
                setDetailsModal(false)
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
      </MuiModal>
    </div>
  );
};

export default ManageMeetings;
