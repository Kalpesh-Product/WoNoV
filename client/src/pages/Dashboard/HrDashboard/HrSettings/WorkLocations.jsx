import { useEffect, useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Country, State, City } from "country-state-city";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { queryClient } from "../../../../main";
import Loader from "../../../Loading";
import PageFrame from "../../../../components/Pages/PageFrame";
import { noOnlyWhitespace, isAlphanumeric } from "../../../../utils/validators";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { HiPencilSquare } from "react-icons/hi2";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const WorkLocations = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalType, setModalType] = useState("add");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const isTechDepartment = auth?.user?.departments?.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );
  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);
  const handleCountrySelect = (countryCode) => {
    const foundStates = State.getStatesOfCountry(countryCode);
    setStates(foundStates);
    setCities([]); // Reset cities when country changes
  };

  const handleStateSelect = (countryCode, stateCode) => {
    const foundCities = City.getCitiesOfState(countryCode, stateCode);
    setCities(foundCities);
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      building: "",
      workLocation: "",
      country: "",
      city: "",
      state: "",
      address: "",
      pincode: "",
    },
  });

  const { mutate: mutateWorkLocation, isPending: isAddWorkLocation } =
    useMutation({
      mutationKey: ["mutateWorkLocation"],
      mutationFn: async (data) => {
        const response = await axios.post("/api/company/add-building", {
          buildingName: data.workLocation,
          address: data.address,
          city: data.city,
          // state: data.state,
          state: states?.find((c) => c.isoCode === data.state).name,
          country: countries.find((c) => c.isoCode === data.country).name,
          pincode: data.pincode,
        });
        return response.data;
      },
      onSuccess: (data) => {
        reset();
        toast.success(data.message || "Work Location Added");
        queryClient.invalidateQueries({ queryKey: ["workLocation"] });
        reset();
        setOpenModal(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to Add Work Location");
      },
    });

  const onSubmit = (data) => {
    mutateWorkLocation(data);
  };

  const { mutate: editWorkLocation, isPending: isEditWorkLocation } =
    useMutation({
      mutationFn: async ({ buildingId, payload }) => {
        const response = await axios.patch(
          `/api/company/edit-building/${buildingId}`,
          payload,
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message || "Work Location updated");
        queryClient.invalidateQueries({ queryKey: ["workLocation"] });
        setOpenModal(false);
        setConfirmationAction(null);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to update Work Location",
        );
      },
    });

  const handleEdit = (row) => {
    setSelectedLocation(row);
    setModalType("edit");
    reset({
      workLocation: row.name || "",
      country: "",
      city: "",
      state: "",
      address: "",
      pincode: "",
    });
    setOpenModal(true);
  };

  const handleMarkStatus = (row) => {
    setConfirmationAction({ type: "status", location: row });
  };

  const { data: workLocations = [], isLoading } = useQuery({
    queryKey: ["workLocation", Boolean(isTechDepartment)],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/company/buildings${
            isTechDepartment ? "?includeDeleted=true" : ""
          }`,
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (location) => {
      const response = await axios.delete(
        `/api/company/delete-building/${location.mongoId}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Work location deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["workLocation"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete work location",
      );
    },
  });

  const restoreLocationMutation = useMutation({
    mutationFn: async (location) => {
      const response = await axios.patch(
        `/api/company/restore-building/${location.mongoId}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Work location restored successfully");
      queryClient.invalidateQueries({ queryKey: ["workLocation"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to restore work location",
      );
    },
  });

  const handleDelete = (location) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      location,
    });
  };

  const handleRestore = (location) => {
    setConfirmationAction({ type: "restore", location });
  };

  const confirmLocationAction = () => {
    const location = confirmationAction?.location;
    if (!location) return;

    if (confirmationAction.type === "status") {
      editWorkLocation({
        buildingId: location.mongoId,
        payload: { isActive: !location.status },
      });
      return;
    }

    if (confirmationAction.type === "restore") {
      restoreLocationMutation.mutate(location);
      return;
    }

    deleteLocationMutation.mutate(location);
  };

  const confirmationContent = {
    status: {
      title: `Mark Work Location As ${
        confirmationAction?.location?.status ? "Inactive" : "Active"
      }`,
      message: `Are you sure you want to mark this work location as ${
        confirmationAction?.location?.status ? "inactive" : "active"
      }?`,
    },
    delete: {
      title: "Delete Work Location",
      message: "Are you sure you want to delete this work location?",
    },
    "permanent-delete": {
      title: "Permanently Delete Work Location",
      message:
        "Are you sure you want to permanently delete this work location?",
    },
    restore: {
      title: "Restore Work Location",
      message: "Are you sure you want to restore this work location?",
    },
  }[confirmationAction?.type];

  const departmentsColumn = [
    { field: "id", headerName: "Sr No",flex: 1, },
    {
      field: "name",
      headerName: "Work Location Name",
      cellRenderer: (params) => {
        return (
          <div>
            <span className="">{params.value}</span>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      sort: "desc",
      flex: 1,
      pinned: "right",
      cellRenderer: (params) => {
        const status = params.data.isDeleted
          ? "Disabled"
          : params.value
            ? "Active"
            : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Disabled: { backgroundColor: "#D3D3D3", color: "#666666" },
        };

        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    ...(isTechDepartment &&
    workLocations.some((location) => Boolean(location.isDeleted))
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
      pinned: "right",
      width: 180,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const isActive = params.data.status;
        const isDeleted = params.data.isDeleted;

        if (isDeleted) {
          return (
            <div className="flex h-full items-center gap-2">
              <button
                type="button"
                title="Restore work location"
                aria-label="Restore work location"
                className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={
                  restoreLocationMutation.isPending ||
                  deleteLocationMutation.isPending
                }
                onClick={() => handleRestore(params.data)}
              >
                <MdOutlineRestore size={24} />
              </button>
              <button
                type="button"
                title="Permanently delete work location"
                aria-label="Permanently delete work location"
                className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={
                  deleteLocationMutation.isPending ||
                  restoreLocationMutation.isPending
                }
                onClick={() => handleDelete(params.data)}
              >
                <MdDeleteForever size={24} />
              </button>
            </div>
          );
        }

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title={`Mark work location as ${isActive ? "inactive" : "active"}`}
              aria-label={`Mark work location as ${isActive ? "inactive" : "active"}`}
              className={`flex h-8 w-8 items-center justify-center ${
                isActive
                  ? "text-green-600 hover:text-green-700"
                  : "text-red-600 hover:text-red-700"
              }`}
              onClick={() => handleMarkStatus(params.data)}
            >
              {isActive ? (
                <FaRegCheckCircle size={24} />
              ) : (
                <FaRegTimesCircle size={24} />
              )}
            </button>
            <button
              type="button"
              title="Edit work location"
              aria-label="Edit work location"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleEdit(params.data)}
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={
                isTechDepartment
                  ? "Permanently delete work location"
                  : "Delete work location"
              }
              aria-label={
                isTechDepartment
                  ? "Permanently delete work location"
                  : "Delete work location"
              }
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
              onClick={() => handleDelete(params.data)}
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        );
      },
    },
  ];

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddLocation = () => {
    setModalType("add");
    setSelectedLocation(null);
    reset();
    setOpenModal(true);
  };

  const onEditSubmit = (data) => {
    if (!selectedLocation?.mongoId) return;
    editWorkLocation({
      buildingId: selectedLocation.mongoId,
      payload: { buildingName: data.workLocation },
    });
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <PageFrame>
            <AgTable
              key={workLocations.length}
              search={true}
              searchColumn={"Work Location"}
              tableTitle={"Work Location List"}
              buttonTitle={"Add Work Location"}
              handleClick={handleAddLocation}
              columns={departmentsColumn}
              data={[
                ...workLocations.map((location, index) => ({
                  id: index + 1, // Auto-increment Sr No
                  name: location.buildingName,
                  mongoId: location._id,
                  status: location.isActive,
                  isDeleted: Boolean(location.isDeleted),
                  deletedByName: location.deletedBy
                    ? [
                        location.deletedBy.firstName,
                        location.deletedBy.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      location.deletedBy.employeeName ||
                      location.deletedBy.name ||
                      location.deletedBy.email ||
                      "—"
                    : "—",
                })),
              ]}
              getRowStyle={(params) =>
                params.data?.isDeleted
                  ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
                  : undefined
              }
              exportData
            />
          </PageFrame>
        </div>
      )}

      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={
          modalType === "edit" ? "Edit Work Location" : "Add Work Location"
        }
      >
        <div>
          <form
            onSubmit={handleSubmit(
              modalType === "edit" ? onEditSubmit : onSubmit,
            )}
            className="flex flex-col gap-4"
          >
            <Controller
              name="workLocation"
              // rules={{
              //   required: "Work location is required",
              //   validate: {
              //     noOnlyWhitespace,
              //     isAlphanumeric,
              //   },
              // }}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Work Location"
                  fullWidth
                  error={!!errors.workLocation}
                  helperText={errors.workLocation?.message}
                />
              )}
            />
            {modalType === "add" && (
              <>
                <Controller
                  name="address"
                  rules={{
                    required: "Address is required",
                    validate: {
                      noOnlyWhitespace,
                      isAlphanumeric,
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Address"
                      multiline
                      rows={2}
                      fullWidth
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />

                {/* Country Dropdown */}
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label="Country"
                      fullWidth
                      onChange={(e) => {
                        const selectedCode = e.target.value;
                        field.onChange(e); // Let MUI handle its state first
                        setTimeout(() => {
                          handleCountrySelect(selectedCode);
                          control.setValue("state", "");
                          control.setValue("city", "");
                        }, 0);
                      }}
                    >
                      <MenuItem value="">Select a Country</MenuItem>
                      {countries.map((item) => (
                        <MenuItem key={item.isoCode} value={item.isoCode}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* State Dropdown */}
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      select
                      label="State"
                      fullWidth
                      disabled={!control._formValues.country}
                      onChange={(e) => {
                        const selectedStateCode = e.target.value;
                        field.onChange(e);
                        setTimeout(() => {
                          handleStateSelect(
                            control._formValues.country,
                            selectedStateCode,
                          );
                          control.setValue("city", "");
                        }, 0);
                      }}
                    >
                      <MenuItem value="">Select a State</MenuItem>
                      {states.map((item) => (
                        <MenuItem value={item.isoCode} key={item.isoCode}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* City Dropdown */}
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      select
                      label="City"
                      fullWidth
                      disabled={!control._formValues.state}
                    >
                      <MenuItem value="">Select a City</MenuItem>
                      {cities.map((item) => (
                        <MenuItem
                          value={item.name}
                          key={`${item.name}-${item.stateCode}-${item.latitude}`}
                        >
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="pincode"
                  rules={{
                    required: "Pincode is required",
                    validate: {
                      noOnlyWhitespace,
                    },
                    pattern: {
                      value: /^[1-9][0-9]{5}$/, // Indian 6-digit pincode starting with non-zero
                      message: "Enter a valid 6-digit pincode",
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Pincode"
                      fullWidth
                      error={!!errors.pincode}
                      helperText={errors.pincode?.message}
                    />
                  )}
                />
              </>
            )}
            <PrimaryButton
              type={"submit"}
              title={modalType === "edit" ? "Update" : "Submit"}
              disabled={isAddWorkLocation || isEditWorkLocation}
              isLoading={isAddWorkLocation || isEditWorkLocation}
            />
          </form>
        </div>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={
          isEditWorkLocation ||
          deleteLocationMutation.isPending ||
          restoreLocationMutation.isPending
        }
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmLocationAction}
      />
    </>
  );
};

export default WorkLocations;
