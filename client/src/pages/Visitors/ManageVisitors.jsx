import { useState } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanTime from "../../utils/humanTime";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import {
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const ManageVisitors = () => {
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/visitors/fetch-visitors");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      purposeOfVisit: "",
      toMeet: "",
      checkIn: "",
    },
  });
  const handleEditToggle = () => {
    if (!isEditing && selectedVisitor) {
      reset({
        firstName: selectedVisitor.firstName || "",
        lastName: selectedVisitor.lastName || "",
        address: selectedVisitor.address || "",
        email: selectedVisitor.email || "",
        phoneNumber: selectedVisitor.phoneNumber || "",
        purposeOfVisit: selectedVisitor.purposeOfVisit || "",
        toMeet: selectedVisitor.toMeet || "",
        checkIn: selectedVisitor.checkIn ? selectedVisitor.checkIn : "",
      });
    }
    setIsEditing(!isEditing);
  };

  const visitorsColumns = [
    { field: "id", headerName: "ID" },
    { field: "firstName", headerName: "First Name" },
    { field: "lastName", headerName: "Last Name" },
    { field: "email", headerName: "Email" },
    { field: "phoneNumber", headerName: "Phone No" },
    { field: "purposeOfVisit", headerName: "Purpose", align: "right" },
    { field: "toMeet", headerName: "To Meet", align: "right" },
    { field: "checkIn", headerName: "Check In" },
    { field: "checkOut", headerName: "Checkout" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2">
          <PrimaryButton
            title={"View"}
            handleSubmit={() => handleDetailsClick(params.data)}
          />
        </div>
      ),
    },
  ];

  const handleDetailsClick = (asset) => {
    setSelectedVisitor(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setModalMode("add");
    setSelectedVisitor(null);
    setIsModalOpen(true);
  };

  const handleSumit = async (assetData) => {
    if (modalMode === "add") {
      try {
      } catch (error) {
        console.error("Error adding asset:", error);
      }
    } else if (modalMode === "edit") {
      try {
      } catch (error) {
        console.error("Error updating asset:", error);
      }
    }
  };

  return (
    <div className="p-4">
      <AgTable
        key={visitorsData.length}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"Visitors Today"}
        // buttonTitle={"Add Asset"}
        data={[
          ...visitorsData.map((item, index) => ({
            id: index + 1,
            firstName: item.firstName,
            lastName: item.lastName,
            address: item.address,
            phoneNumber: item.phoneNumber,
            email: item.email,
            purposeOfVisit: item.purposeOfVisit,
            toMeet: item.toMeet,
            checkIn: humanTime(item.checkIn),
            checkOut: humanTime(item.checkOut),
          })),
        ]}
        columns={visitorsColumns}
        handleClick={handleAddAsset}
      />
      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Visitor Detail"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <PrimaryButton handleSubmit={handleEditToggle} title={"Edit"} />
          </div>
          <form>
            {!isVisitorsData ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                {/* First Name */}
                {isEditing ? (
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="First Name"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="First Name"
                    detail={selectedVisitor.firstName}
                  />
                )}

                {/* Last Name */}
                {isEditing ? (
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Last Name"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Last Name"
                    detail={selectedVisitor.lastName}
                  />
                )}

                {/* Address */}
                {isEditing ? (
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Address"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Address"
                    detail={selectedVisitor.address}
                  />
                )}

                {/* Phone Number */}
                {isEditing ? (
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Phone Number"
                        type="tel"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Phone Number"
                    detail={selectedVisitor.phoneNumber}
                  />
                )}

                {/* Email */}
                {isEditing ? (
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Email"
                        type="email"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Email"
                    detail={selectedVisitor.email}
                  />
                )}

                {/* Purpose of Visit */}
                {isEditing ? (
                  <Controller
                    name="purposeOfVisit"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Purpose of Visit"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Purpose of Visit"
                    detail={selectedVisitor.purposeOfVisit}
                  />
                )}

                {/* To Meet */}
                {isEditing ? (
                  <Controller
                    name="toMeet"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="To Meet"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="To Meet"
                    detail={selectedVisitor.toMeet}
                  />
                )}

                {/* Check In */}
                {/* {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="checkIn"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          {...field}
                          size="small"
                          label="Check In"
                          slotProps={{
                            textField: { fullWidth: true, size: "small" },
                          }}
                          render={(params) => <TextField {...params} />}
                        />
                      )}
                    />
                  </LocalizationProvider>
                ) : (
                  <DetalisFormatted
                    title="Check In"
                    detail={selectedVisitor.checkIn}
                  />
                )} */}
              </div>
            ) : (
              []
            )}
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default ManageVisitors;
