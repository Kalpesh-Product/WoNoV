import React, { useEffect, useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Country, State, City } from "country-state-city";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { queryClient } from "../../../../main";
import Loader from "../../../Loading";
import PageFrame from "../../../../components/Pages/PageFrame";
import { noOnlyWhitespace, isAlphanumeric } from "../../../../utils/validators";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

const WorkLocations = () => {
  const axios = useAxiosPrivate();
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
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
        queryClient.invalidateQueries(["workLocation"]);
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

  const { data: workLocations = [], isLoading } = useQuery({
    queryKey: ["workLocation"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/buildings");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
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
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive"; // Map boolean to string status
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
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
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data.id}
          menuItems={[
            {
              label: "Edit",
              // onClick: () => {
              //   handleEdit(params.data);
              // },
            },
            {
              label: "Mark As Inactive",
              onClick: () => {
                console.log("Clicked");
              },
              disabled: true,
            },
          ]}
        />
      ),
    },
  ];

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddLocation = () => {
    setOpenModal(true);
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
                  status: location.isActive,
                })),
              ]}
            />
          </PageFrame>
        </div>
      )}

      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={"Add Work Location"}
      >
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="workLocation"
              rules={{
                required: "Work location is required",
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
                  label="Work Location"
                  fullWidth
                  error={!!errors.workLocation}
                  helperText={errors.workLocation?.message}
                />
              )}
            />
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
                        selectedStateCode
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

            <PrimaryButton
              type={"submit"}
              title={"Submit"}
              disabled={isAddWorkLocation}
              isLoading={isAddWorkLocation}
            />
          </form>
        </div>
      </MuiModal>
    </>
  );
};

export default WorkLocations;
