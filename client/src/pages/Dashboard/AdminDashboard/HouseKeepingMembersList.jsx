import { useEffect, useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
// import AssetModal from "./AssetModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  CircularProgress,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import { toast } from "sonner";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { DateRange } from "@mui/icons-material";
import humanDate from "../../../utils/humanDateForamt";
import { queryClient } from "../../../main";
import PageFrame from "../../../components/Pages/PageFrame";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import {
  isAlphanumeric,
  isValidPhoneNumber,
  isValidPinCode,
  noOnlyWhitespace,
} from "../../../utils/validators";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import CountryStateCitySelector from "../../../components/CountryStateCitySelector";
import dayjs from "dayjs";
import DangerButton from "../../../components/DangerButton";

const HouseKeepingMembersList = () => {
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: editReset,
    setValue: setEditValue,
    getValues,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      houseKeepingType: "",
      dateOfBirth: null,
      mobilePhone: "",
      email: "",
      address: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("user : ", selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      setEditValue("firstName", selectedUser?.firstName);
      setEditValue("middleName", selectedUser?.middleName);
      setEditValue("lastName", selectedUser?.lastName);
      setEditValue("gender", selectedUser?.gender);
      setEditValue("mobilePhone", selectedUser?.phoneNumber);
      setEditValue("address", selectedUser?.address);
      setEditValue("firstName", selectedUser?.firstName);
      setEditValue("houseKeepingType", selectedUser?.houseKeepingType);
      setEditValue("dateOfBirth", dayjs(selectedUser?.dateOfBirth));
    }
  }, [selectedUser]);

  const { data: houseKeepingData, isPending: isHouseKeepingPending } = useQuery(
    {
      queryKey: ["housekeeping-staff"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/company/housekeeping-members");
          return response.data.filter((m) => m.isActive);
        } catch (error) {
          toast.error(error.message);
        }
      },
    }
  );

  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setModalMode("delete");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const { mutate: editEmployee, isPending } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.patch(
        `/api/company/update-housekeeping-member/${selectedUser?._id}`,
        formData
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Employee onboarded successfully!");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["housekeeping-staff"] });
      editReset();
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      toast.error("Something went wrong.");
    },
  });

  const { mutate: deleteHousekeepingMember, isPending: isDeletePending } =
    useMutation({
      mutationFn: async () => {
        const response = await axios.delete(
          `/api/company/soft-delete-housekeeping-member/${selectedUser?._id}`
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message || "Member deleted successfully!");
        setIsModalOpen(false);
        setSelectedUser(null);
        queryClient.invalidateQueries({ queryKey: ["housekeeping-staff"] });
      },
      onError: (error) => {
        console.error("Delete failed:", error);
        toast.error("Failed to delete member.");
      },
    });

  const memberColumns = [
    { field: "id", headerName: "Sr No", width: 100 },
    { field: "houseKeepingType", headerName: "Type" },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "middleName", headerName: "Middle Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "manager", headerName: "Manager Name", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <div>
          <ThreeDotMenu
            rowId={params.data._id}
            menuItems={[
              {
                label: "Edit",
                onClick: () => handleEditUser(params.data),
              },
              { label: "Delete", onClick: () => handleDeleteUser(params.data) },
            ]}
          />
        </div>
      ),
    },
  ];

  const transformedData = houseKeepingData?.map((member, index) => ({
    ...member,
    id: index + 1,
    _id: member._id,
    firstName: member.name || member.firstName || "N/A",
    middleName: member.middleName || "N/A",
    lastName: member.lastName || "N/A",
    gender: member.gender || "N/A",
    type: member.type || "Third Party",
    manager:
      member.managerUser?.firstName && member.managerUser?.lastName
        ? `${member.managerUser.firstName} ${member.managerUser.lastName}`
        : "N/A",
  }));

  const handleAddUser = () => {
    setModalMode("add");
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageFrame>
        {houseKeepingData?.length > 0 ? (
          <AgTable
            key={houseKeepingData.length}
            search={true}
            tableTitle={"Housekeeping Members List"}
            // buttonTitle={"Assign Member"}
            data={transformedData}
            columns={memberColumns}
            handleClick={handleAddUser}
          />
        ) : (
          <div className="flex justify-center items-center h-[60vh]">
            <CircularProgress />
          </div>
        )}
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalMode === "edit" ? "Edit Member" : "Member Details"}`}
      >
        {modalMode === "view" && selectedUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetalisFormatted title="Name" detail={selectedUser.name} />
            <DetalisFormatted
              title="Member Status"
              gap={"w-full"}
              detail={selectedUser.isEmployeeActive ? "Active" : "InActive"}
            />
            <DetalisFormatted
              title="Unit Name"
              detail={selectedUser.unitName}
            />
            <DetalisFormatted
              title="Building Name"
              gap={"w-full"}
              detail={selectedUser.buildingName}
            />

            {/* DateRange picker view-only*/}
            <div className="md:col-span-2">
              <h3 className="text-subtitle font-pmedium text-gray-700 mb-1">
                Date Range
              </h3>
              <div className="border border-borderGray rounded-2xl overflow-hidden shadow-sm">
                <DateRange
                  ranges={[
                    {
                      startDate: new Date(selectedUser.startDate),
                      endDate: new Date(selectedUser.endDate),
                      key: "selection",
                    },
                  ]}
                  onChange={() => {
                    "";
                  }}
                  editableDateInputs={false}
                  showDateDisplay={false}
                  moveRangeOnFirstSelection={false}
                  disabledDay={() => true}
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <h3 className="text-subtitle font-pmedium text-gray-700 mb-3">
                Substitutes
              </h3>
              {selectedUser.substitutions?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
                  {selectedUser.substitutions.map((sub, index) => (
                    <div
                      key={sub.substitutionId}
                      className="flex flex-col gap-2 border border-borderGray rounded-2xl p-4"
                    >
                      <h4 className="text-subtitle font-pmedium text-primary mb-2">
                        Substitute {index + 1}
                      </h4>
                      <DetalisFormatted
                        title="First Name"
                        detail={sub.substituteFirstName}
                      />
                      <DetalisFormatted
                        title="Last Name"
                        detail={sub.substituteLastName}
                      />
                      <DetalisFormatted
                        title="From"
                        detail={humanDate(sub.fromDate)}
                      />
                      <DetalisFormatted
                        title="To"
                        detail={humanDate(sub.toDate)}
                      />
                      <DetalisFormatted
                        title="Is Active"
                        detail={sub.isActive ? "Yes" : "No"}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No substitute assigned
                </div>
              )}
            </div>
          </div>
        )}
        {modalMode === "edit" && selectedUser && (
          <>
            <form
              onSubmit={handleEditSubmit((data) => editEmployee(data))}
              className=""
            >
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  {/* Section: Basic Information */}
                  <div className="py-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      Basic Information
                    </span>
                  </div>
                  <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                    <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4  ">
                      <Controller
                        name="firstName"
                        control={editControl}
                        rules={{
                          required: "First Name is Required",
                          validate: {
                            noOnlyWhitespace,
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="First Name"
                            fullWidth
                            helperText={editErrors?.firstName?.message}
                            error={!!editErrors.firstName}
                          />
                        )}
                      />

                      <Controller
                        name="middleName"
                        control={editControl}
                        rules={{
                          validate: {
                            noOnlyWhitespace,
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Middle Name"
                            fullWidth
                            helperText={editErrors?.middleName?.message}
                            error={!!editErrors.middleName}
                          />
                        )}
                      />
                      <Controller
                        name="lastName"
                        control={editControl}
                        rules={{
                          validate: {
                            noOnlyWhitespace,
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Last Name"
                            fullWidth
                            helperText={editErrors?.lastName?.message}
                            error={!!editErrors.lastName}
                          />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4  ">
                      <Controller
                        name="gender"
                        control={editControl}
                        rules={{ required: "Gender is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Gender"
                            select
                            fullWidth
                            helperText={editErrors?.gender?.message}
                            error={!!editErrors.gender}
                          >
                            <MenuItem value="" disabled>
                              Select a Gender
                            </MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                          </TextField>
                        )}
                      />

                      <Controller
                        name="dateOfBirth"
                        control={editControl}
                        rules={{ required: "Date of Birth is required" }}
                        render={({ field }) => (
                          <DesktopDatePicker
                            format="DD-MM-YYYY"
                            slotProps={{ textField: { size: "small" } }}
                            label="Date of Birth"
                            {...field}
                            renderInput={(params) => (
                              <TextField fullWidth {...params} />
                            )}
                          />
                        )}
                      />
                    </div>
                    <Controller
                      name="mobilePhone"
                      control={editControl}
                      rules={{
                        validate: {
                          isValid: (value) =>
                            value === "" ||
                            isValidPhoneNumber(value) ||
                            "Enter a valid phone number",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="Mobile Phone"
                          fullWidth
                          helperText={editErrors?.mobilePhone?.message}
                          error={!!editErrors.mobilePhone}
                        />
                      )}
                    />
                    <Controller
                      name="houseKeepingType"
                      control={editControl}
                      rules={{ required: "Type is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Member Type"
                          size="small"
                          error={!!editErrors.houseKeepingType}
                          helperText={editErrors?.houseKeepingType?.message}
                        >
                          <MenuItem value="" disabled>
                            Select a Member Type
                          </MenuItem>
                          <MenuItem value="Self">Self</MenuItem>
                          <MenuItem value="Third Party">Third Party</MenuItem>
                        </TextField>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-center gap-4">
                <PrimaryButton
                  type="submit"
                  title={"Submit"}
                  disabled={isPending}
                />

                <SecondaryButton
                  handleSubmit={() => editReset()}
                  title={"Reset"}
                />
              </div>
            </form>
          </>
        )}
        {/* Delete comes here */}

        {modalMode === "delete" && selectedUser && (
          <div className="flex flex-col justify-center items-center gap-4 w-full">
            <p className="text-content text-center">
              Are you sure you want to{" "}
              <strong className="text-red-600">DELETE</strong> this housekeeping
              member?
            </p>
            <div className="flex gap-4">
              <SecondaryButton
                title="Cancel"
                handleSubmit={() => setIsModalOpen(false)}
              />
              <DangerButton
                title="Yes, Delete"
                handleSubmit={() => deleteHousekeepingMember()}
                disabled={isDeletePending}
              />
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default HouseKeepingMembersList;
