import React, { useState, useRef, useEffect } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FiMonitor, FiSun, FiWifi } from "react-icons/fi";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";

const MeetingSettings = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient(); // React Query client to refetch rooms
  const [openModal, setOpenModal] = useState(false);
  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      roomName: "",
      seats: 0,
      description: "",
    },
  });
  const watchLocation = watch("location"); // 👈 Add this

  const [selectedFile, setSelectedFile] = useState(null);
  const { auth } = useAuth();
  const inputRef = useRef();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    watch: editWatch,
    formState: { errors: editErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      roomName: "",
      seats: 0,
      description: "",
      location: selectedRoom?.location?.building?._id,
      isActive: true,
    },
  });
  const [editFile, setEditFile] = useState(null);
  const editLocation = editWatch("location");

  useEffect(() => {
    if (selectedRoom) {
      resetEditForm({
        roomName: selectedRoom.name ?? "",
        seats: selectedRoom.seats ?? "",
        description: selectedRoom.description ?? "",
        location: selectedRoom.location?.building?._id ?? "",
        unit: selectedRoom.location?._id ?? "",
        isActive: selectedRoom.isActive ?? "",
      });
    }
  }, [selectedRoom, resetEditForm]);

  const handleOpenEditModal = (room) => {
    setSelectedRoom(room);
    resetEditForm({
      roomName: room.name,
      seats: room.seats,
      description: room.description,
      location: room.location,
      roomImage: null,
    });
    setEditFile(null);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRoom(null);
    resetEditForm();
    setEditFile(null);
  };

  const editRoomMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return axios.patch(`/api/meetings/update-room/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Room updated successfully!");
      queryClient.invalidateQueries(["meetingRooms"]);
      handleCloseEditModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update room.");
    },
  });

  const onEditSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.roomName);
    formData.append("seats", data.seats);
    formData.append("description", data.description);
    formData.append("location", data.unit);
    formData.append("isActive", data.isActive === "false" ? false : true);

    if (editFile) {
      formData.append("room", editFile);
    }

    editRoomMutation.mutate({ id: selectedRoom._id, formData });
  };

  // Fetch Meeting Rooms from API
  const { data: meetingRooms = [], isPending: isMeetingRoomsLoading } =
    useQuery({
      queryKey: ["meetingRooms"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/meetings/get-rooms");
          return response.data;
        } catch (error) {
          throw new Error(error.response.data.message);
        }
      },
    });

  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const handleFileChange = (event, field) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    field.onChange(file); // Update React Hook Form state
  };

  // Mutation for creating a room
  const createRoomMutation = useMutation({
    mutationFn: async (formData) => {
      return axios.post("/api/meetings/create-room", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Room added successfully!");
      queryClient.invalidateQueries(["meetingRooms"]); // Refresh the room list
      handleCloseModal();
      reset(); // Reset form fields
      inputRef.current.value = null;
    },
  });

  // Handle form submission
  // Handle form submission
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.roomName);
    formData.append("seats", data.seats);
    formData.append("description", data.description);
    formData.append("location", data.unit); // ✅ Use unit as location like Edit form

    if (selectedFile) {
      formData.append("room", selectedFile);
    }

    createRoomMutation.mutate(formData);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // inputRef.current.value = "";
    setSelectedFile("");
    reset();
  };

  return (
    <div className="m-4 rounded-md border-default border-borderGray">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-title text-primary">Meeting Rooms</span>
          </div>
          <div>
            <PrimaryButton
              handleSubmit={handleOpenModal}
              title={"Add New Room"}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {!isMeetingRoomsLoading ? (
            meetingRooms.map((room) => (
              <Card
                key={room._id}
                className="shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <CardMedia
                  component="img"
                  sx={{ height: "350px" }}
                  image={room.image?.url || "https://via.placeholder.com/350"} // Fallback Image
                  alt={room.name}
                  className="object-cover"
                />
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-subtitle">{room.name}</span>
                    <span
                      className={`px-4 py-1 text-content font-pregular rounded-full ${
                        room.isActive 
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {room.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-4 text-gray-500">
                    <FiWifi />
                    <FiSun />
                    <FiMonitor />
                  </div>
                  <p className="mb-2 text-sm font-medium text-gray-800">
                    <span role="img" aria-label="person">
                      👥
                    </span>{" "}
                    Fits {room.seats} people
                  </p>
                  <div className="mt-4">
                    <PrimaryButton
                      title={"Edit Room"}
                      handleSubmit={() => handleOpenEditModal(room)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <CircularProgress color="#1E3D73" />
          )}
        </div>
      </div>

      {/* Modal for Adding New Room */}
      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={"Add a Meeting Room"}
      >
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <Controller
                name="roomName"
                control={control}
                rules={{
                  required: "Room Name is Required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Room Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={!!errors.roomName}
                    helperText={errors?.roomName?.message}
                  />
                )}
              />
              <Controller
                name="seats"
                control={control}
                rules={{ required: "Seats are required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Seats"
                    variant="outlined"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.seats}
                    helperText={errors?.seats?.message}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                rules={{
                  required: "Description is Required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={5}
                    variant="outlined"
                    error={!!errors.description}
                    helperText={errors?.description?.message}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="location"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Location</InputLabel>
                    <Select {...field} label="Work Location">
                      <MenuItem value="">Select Location</MenuItem>
                      {auth.user.company.workLocations.length > 0 ? (
                        auth.user.company.workLocations.map((loc) => (
                          <MenuItem key={loc._id} value={loc._id}>
                            {loc.buildingName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No Locations Available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="unit"
                control={control}
                rules={{ required: "Unit is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    label="Select Unit"
                    placeholder="ST 701 A"
                  >
                    <MenuItem value="" disabled>
                      Select Unit
                    </MenuItem>
                    {isUnitsPending ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      unitsData
                        .filter((item) => item.building?._id === watchLocation)
                        .map((item) => (
                          <MenuItem key={item._id} value={item._id}>
                            {item.unitNo}
                          </MenuItem>
                        ))
                    )}
                  </TextField>
                )}
              />

              <Controller
                name="roomImage"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <span className="text-content">Upload Room Image</span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-file"
                        onChange={(event) => handleFileChange(event, field)}
                      />
                      <label htmlFor="upload-file">
                        <Button
                          sx={{
                            backgroundColor: "#ebf5ff",
                            color: "#4b5d87",
                            fontFamily: "Poppins-Bold",
                          }}
                          variant="contained"
                          component="span"
                        >
                          Choose File
                        </Button>
                      </label>
                      <span className="text-content">
                        {selectedFile ? selectedFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                )}
              />
              <div className="flex justify-center">
                <PrimaryButton title={"Submit"} type={"submit"} />
              </div>
            </div>
          </form>
        </div>
      </MuiModal>

      <MuiModal
        open={openEditModal}
        onClose={handleCloseEditModal}
        title={"Edit Meeting Room"}
      >
        <div className="flex flex-col gap-4">
          <form onSubmit={handleEditSubmit(onEditSubmit)}>
            <div className="flex flex-col gap-4">
              <Controller
                name="roomName"
                control={editControl}
                rules={{
                  required: "Room Name is required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Room Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={!!editErrors?.roomName}
                    helperText={editErrors?.roomName?.message}
                  />
                )}
              />
              <Controller
                name="seats"
                control={editControl}
                rules={{ required: "Seats are required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Seats"
                    variant="outlined"
                    size="small"
                    type="number"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="description"
                control={editControl}
                rules={{
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={5}
                    variant="outlined"
                    fullWidth
                    error={!!editErrors?.description}
                    helperText={errors?.description?.message}
                  />
                )}
              />
              <Controller
                name="location"
                control={editControl}
                render={({ field }) => (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Location</InputLabel>
                    <Select {...field} label="Work Location">
                      <MenuItem value="">Select Location</MenuItem>
                      {auth.user.company.workLocations.length > 0 ? (
                        auth.user.company.workLocations.map((loc) => (
                          <MenuItem key={loc._id} value={loc._id}>
                            {loc.buildingName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No Locations Available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="unit"
                control={editControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    label="Select Unit"
                    placeholder="ST 701 A"
                  >
                    <MenuItem value="" disabled>
                      Select Unit
                    </MenuItem>
                    {isUnitsPending ? (
                      <>
                        <CircularProgress />
                      </>
                    ) : (
                      unitsData
                        .filter((item) => item.building?._id === editLocation)
                        .map((item) => (
                          <MenuItem key={item._id} value={item._id}>
                            {item.unitNo}
                          </MenuItem>
                        ))
                    )}
                  </TextField>
                )}
              />
              <Controller
                name="roomImage"
                control={editControl}
                defaultValue={null}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <span className="text-content">Update Room Image</span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="edit-upload-file"
                        onChange={(event) => {
                          const file = event.target.files[0];
                          setEditFile(file);
                          field.onChange(file);
                        }}
                      />
                      <label htmlFor="edit-upload-file">
                        <Button
                          sx={{
                            backgroundColor: "#ebf5ff",
                            color: "#4b5d87",
                            fontFamily: "Poppins-Bold",
                          }}
                          variant="contained"
                          component="span"
                        >
                          Choose File
                        </Button>
                      </label>
                      <span className="text-content">
                        {editFile ? editFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                )}
              />
              <Controller
                name="isActive"
                control={editControl}
                render={({ field }) => (
                  <TextField
                    select
                    {...field}
                    fullWidth
                    size="small"
                    label="Status"
                    error={!!editErrors?.isActive}
                    helperText={editErrors?.isActive?.message}
                  >
                    <MenuItem value="" disabled>
                      Select a status
                    </MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </TextField>
                )}
              />

              <div className="flex justify-center">
                <PrimaryButton title={"Save Changes"} type={"submit"} />
              </div>
            </div>
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default MeetingSettings;
