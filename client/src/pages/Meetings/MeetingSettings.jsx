import React, { useState, useEffect } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import {
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
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";
import UploadMultipleFilesInput from "../../components/UploadMultipleFilesInput";
import WidgetSection from "../../components/WidgetSection";

const calculateGstBreakdown = (price) => {
  if (price === "" || price === null || price === undefined) {
    return { gstAmount: "", totalWithGst: "" };
  }

  const basePrice = Number(price);
  if (!Number.isFinite(basePrice)) {
    return { gstAmount: "", totalWithGst: "" };
  }

  const gstAmount = Number((basePrice * 0.18).toFixed(2));
  const totalWithGst = Number((basePrice + gstAmount).toFixed(2));

  return { gstAmount, totalWithGst };
};

const getExistingRoomImages = (room) => {
  if (Array.isArray(room?.images) && room.images.length > 0) {
    return room.images;
  }
  return room?.image?.url ? [room.image] : [];
};

const ROOM_IMAGE_PLACEHOLDER = "https://via.placeholder.com/350";

const RoomImageCarousel = ({ room }) => {
  const images = getExistingRoomImages(room).filter((image) => image?.url);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (activeImage >= images.length) setActiveImage(0);
  }, [activeImage, images.length]);

  const showPreviousImage = () => {
    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const showNextImage = () => {
    setActiveImage((current) => (current + 1) % images.length);
  };

  return (
    <div className="group relative">
      <CardMedia
        component="img"
        sx={{ height: "270px" }}
        image={images[activeImage]?.url || ROOM_IMAGE_PLACEHOLDER}
        alt={`${room.name} - image ${activeImage + 1}`}
        className="object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPreviousImage}
            aria-label={`Show previous image for ${room.name}`}
            className="absolute left-0 top-1/2 flex h-10 w-8 -translate-y-1/2 items-center justify-center text-3xl text-black transition hover:scale-110"
          >
            <MdChevronLeft />
          </button>
          <button
            type="button"
            onClick={showNextImage}
            aria-label={`Show next image for ${room.name}`}
            className="absolute right-0 top-1/2 flex h-10 w-8 -translate-y-1/2 items-center justify-center text-3xl text-black transition hover:scale-110"
          >
            <MdChevronRight />
          </button>
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white">
            {activeImage + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
};

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
      perHourCredit: "",
      description: "",
      location: "",
      unit: "",
      isActive: "true",
      roomImages: [],
      perHourPrice: "",
      perHourGstPrice: "",
    },
  });
  const watchLocation = watch("location"); // 👈 Add this
  const perHourPrice = watch("perHourPrice");
  const gstBreakdown = calculateGstBreakdown(perHourPrice);
  const { auth } = useAuth();
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
      perHourCredit: "",
      description: "",
      location: selectedRoom?.location?.building?._id,
      unit: "",
      isActive: "true",
      roomImages: [],
      perHourPrice: "",
      perHourGstPrice: "",
    },
  });
  const editLocation = editWatch("location");
  const editPerHourPrice = editWatch("perHourPrice");
  const editGstBreakdown = calculateGstBreakdown(editPerHourPrice);

  useEffect(() => {
    if (selectedRoom) {
      resetEditForm({
        roomName: selectedRoom.name ?? "",
        seats: selectedRoom.seats ?? "",
        perHourCredit: selectedRoom.perHourCredit ?? "",
        description: selectedRoom.description ?? "",
        location: selectedRoom.location?.building?._id ?? "",
        unit: selectedRoom.location?._id ?? "",
        isActive: String(selectedRoom.isActive ?? true),
        roomImages: getExistingRoomImages(selectedRoom),
        perHourPrice: selectedRoom.perHourPrice ?? "",
        perHourGstPrice: selectedRoom.perHourGstPrice ?? "",
      });
    }
  }, [selectedRoom, resetEditForm]);

  const handleOpenEditModal = (room) => {
    setSelectedRoom(room);
    resetEditForm({
      roomName: room.name,
      seats: room.seats,
      perHourCredit: room.perHourCredit ?? "",
      description: room.description,
      location: room.location,
      unit: room.location?._id ?? "",
      roomImages: getExistingRoomImages(room),
      isActive: String(room.isActive ?? true),
      perHourPrice: room.perHourPrice ?? "",
      perHourGstPrice: room.perHourGstPrice ?? "",
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRoom(null);
    resetEditForm();
  };

  const editRoomMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await axios.patch(
        `/api/meetings/update-room/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Room updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetingRooms"] });
      handleCloseEditModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update room.");
    },
  });

  const onEditSubmit = async (data) => {
    const { totalWithGst } = calculateGstBreakdown(data.perHourPrice);
    const formData = new FormData();
    formData.append("name", data.roomName);
    formData.append("seats", data.seats);
    formData.append("perHourCredit", data.perHourCredit);
    formData.append("description", data.description);
    formData.append("location", data.unit);
    formData.append("perHourPrice", data.perHourPrice);
    formData.append("perHourGstPrice", totalWithGst);
    formData.append("isActive", data.isActive === "true");
    const roomImages = Array.isArray(data.roomImages) ? data.roomImages : [];
    const retainedRoomImages = roomImages.filter(
      (image) => !(image instanceof File),
    );
    formData.append("retainedRoomImages", JSON.stringify(retainedRoomImages));
    roomImages
      .filter((image) => image instanceof File)
      .forEach((image) => formData.append("rooms", image));

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
    },
  });

  // Handle form submission
  // Handle form submission
  const onSubmit = async (data) => {
    const { totalWithGst } = calculateGstBreakdown(data.perHourPrice);
    const formData = new FormData();
    formData.append("name", data.roomName);
    formData.append("seats", data.seats);
    formData.append("perHourCredit", data.perHourCredit);
    formData.append("description", data.description);
    formData.append("location", data.unit); // ✅ Use unit as location like Edit form
    formData.append("perHourPrice", data.perHourPrice);
    formData.append("perHourGstPrice", totalWithGst);
    formData.append("isActive", data.isActive === "true");
    (data.roomImages || []).forEach((image) =>
      formData.append("rooms", image),
    );

    createRoomMutation.mutate(formData);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    reset();
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection
        border
        title={"Meeting Rooms"}
        button
        buttonTitle={"Add New Room"}
        handleClick={handleOpenModal}
      >
        <div className="grid grid-cols-4 gap-4">
          {!isMeetingRoomsLoading ? (
            meetingRooms.map((room) => (
              <Card
                key={room._id}
                className="shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <RoomImageCarousel room={room} />
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-content">{room.name}</span>
                    <span
                      className={`px-4 py-1 text-small font-pregular rounded-full ${
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
      </WidgetSection>

      {/* Modal for Adding New Room */}
      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={"Add a Meeting Room"}
      >
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  name="roomName"
                  control={control}
                  rules={{
                    required: "Room Name is required",
                    validate: { noOnlyWhitespace, isAlphanumeric },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Room Name"
                      variant="outlined"
                      size="small"
                      fullWidth
                      error={!!errors.roomName}
                      helperText={errors.roomName?.message}
                    />
                  )}
                />
                <Controller
                  name="location"
                  control={control}
                  rules={{ required: "Location is required" }}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth error={!!errors.location}>
                      <InputLabel>Location</InputLabel>
                      <Select {...field} label="Location">
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
                      fullWidth
                      error={!!errors.unit}
                      helperText={errors.unit?.message}
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      helperText={errors.seats?.message}
                    />
                  )}
                />
                <Controller
                  name="perHourCredit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Credit"
                      variant="outlined"
                      type="number"
                      size="small"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth size="small" label="Status">
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </TextField>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  name="perHourPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price"
                      variant="outlined"
                      type="number"
                      size="small"
                      fullWidth
                    />
                  )}
                />
                <TextField
                  select
                  label="GST (%)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  value={18}
                  helperText={`GST: INR ${gstBreakdown.gstAmount === "" ? 0 : gstBreakdown.gstAmount}`}
                  FormHelperTextProps={{
                    sx: {
                      color: "#16a34a",
                      fontWeight: 500,
                      marginLeft: 0,
                      "&.Mui-disabled": { color: "#16a34a" },
                    },
                  }}
                >
                  <MenuItem value={18}>18%</MenuItem>
                </TextField>
                <TextField
                  label="Total Amount"
                  variant="outlined"
                  type="number"
                  size="small"
                  fullWidth
                  disabled
                  value={gstBreakdown.totalWithGst}
                />
              </div>

              <Controller
                name="description"
                control={control}
                rules={{
                  required: "Description is required",
                  validate: { noOnlyWhitespace, isAlphanumeric },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={5}
                    variant="outlined"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="roomImages"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <UploadMultipleFilesInput
                    value={field.value || []}
                    onChange={field.onChange}
                    label="Upload Images"
                    allowedExtensions={["jpg", "jpeg", "png", "webp"]}
                    previewType="image"
                    maxFiles={5}
                    maxSizeMb={5}
                    helperText="Maximum 5 files, 5 MB each. JPG, JPEG, PNG, and WEBP images."
                    showPreviews={false}
                    showClearAll={false}
                    showMaxInLabel={false}
                    id="new-meeting-room-images"
                  />
                )}
              />
              <div className="flex justify-center">
                <PrimaryButton
                  title={"Submit"}
                  type={"submit"}
                  disabled={createRoomMutation.isPending}
                  isLoading={createRoomMutation.isPending}
                />
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  name="location"
                  control={editControl}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel>Location</InputLabel>
                      <Select {...field} label="Location">
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
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                        </MenuItem>
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  name="perHourCredit"
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Credit"
                      variant="outlined"
                      size="small"
                      type="number"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="isActive"
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  name="perHourPrice"
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price"
                      variant="outlined"
                      size="small"
                      type="number"
                      fullWidth
                    />
                  )}
                />
                <TextField
                  select
                  label="GST (%)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  value={18}
                  helperText={`GST: INR ${
                    editGstBreakdown.gstAmount === ""
                      ? 0
                      : editGstBreakdown.gstAmount
                  }`}
                  FormHelperTextProps={{
                    sx: {
                      color: "#16a34a",
                      fontWeight: 500,
                      marginLeft: 0,
                      "&.Mui-disabled": { color: "#16a34a" },
                    },
                  }}
                >
                  <MenuItem value={18}>18%</MenuItem>
                </TextField>
                <TextField
                  label="Total Amount"
                  variant="outlined"
                  size="small"
                  type="number"
                  fullWidth
                  disabled
                  value={editGstBreakdown.totalWithGst}
                />
              </div>

              <Controller
                name="description"
                control={editControl}
                rules={{
                  validate: {
                    noOnlyWhitespace,
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
                    helperText={editErrors?.description?.message}
                  />
                )}
              />

              <Controller
                name="roomImages"
                control={editControl}
                defaultValue={[]}
                render={({ field }) => (
                  <UploadMultipleFilesInput
                    value={field.value || []}
                    onChange={field.onChange}
                    label="Upload Images"
                    allowedExtensions={["jpg", "jpeg", "png", "webp"]}
                    previewType="image"
                    maxFiles={5}
                    maxSizeMb={5}
                    helperText="Maximum 5 files, 5 MB each. JPG, JPEG, PNG, and WEBP images."
                    showPreviews={false}
                    showClearAll={false}
                    showMaxInLabel={false}
                    id="meeting-room-images"
                  />
                )}
              />
              <div className="flex justify-center">
                <PrimaryButton
                  title={"Save Changes"}
                  type={"submit"}
                  disabled={editRoomMutation.isPending}
                  isLoading={editRoomMutation.isPending}
                />
              </div>
            </div>
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default MeetingSettings;
