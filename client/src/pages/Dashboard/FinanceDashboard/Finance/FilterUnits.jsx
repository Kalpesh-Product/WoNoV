import React, { useEffect, useMemo, useRef } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";

const CheckAvailability = ({ landlord }) => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      location: "",
      floor: "",
    },
  });

  const selectedLocation = watch("location");
  const selectedUnit = watch("floor");

  // Fetch Work Locations

  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");

      return response.data;
    },
  });

  const selectedUnitId = useMemo(() => {
    if (!selectedUnit || !selectedLocation) return null;
    const unit = units.find(
      (unit) =>
        unit.unitNo === selectedUnit &&
        unit.building?.buildingName === selectedLocation // use ?. here too
    );
    return unit ? unit._id : null;
  }, [selectedUnit, selectedLocation, units]);

  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units.map((loc) => [
            loc.building?._id ?? `unknown-${loc.unitNo}`,
            loc.building?.buildingName ?? "Unknown Building",
          ])
        : []
    ).entries()
  );

  const onSubmit = (data) => {
    const { location, floor } = data;
    navigate(
      `/app/dashboard/finance-dashboard/finance/landlord-payments-unit?location=${location}&floor=${floor}`,
      {
        state: {
          unitId: selectedUnitId,
        },
      }
    );
  };

  return (
    <div className="border-default border-borderGray p-4 rounded-md text-center">
      <h2 className="font-pregular text-title text-primary mt-20 mb-10">
        Select Location
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center"
      >
        <div className="flex justify-center gap-4 mb-10 px-20 w-full">
          {/* Location Dropdown */}
          <FormControl className="w-1/2">
            <InputLabel>Select Building</InputLabel>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Select Location">
                  <MenuItem value="" disabled>
                    Select Building
                  </MenuItem>
                  {locationsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : locationsError ? (
                    <MenuItem disabled>Error fetching units</MenuItem>
                  ) : (
                    uniqueBuildings.map(([id, name]) => (
                      <MenuItem key={id} value={name}>
                        {name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
          </FormControl>

          {/* Meeting Room Dropdown */}
          <FormControl className="w-1/2">
            <InputLabel>Select Unit</InputLabel>
            <Controller
              name="floor"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Select Unit"
                  disabled={!selectedLocation}
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                >
                  <MenuItem value="">Select Unit</MenuItem>

                  {/* {units.map((unit) =>
                    unit.building.buildingName === selectedLocation ? (
                      <MenuItem key={unit._id} value={unit.unitNo}>
                        {unit.unitNo}
                      </MenuItem>
                    ) : (
                      <></>
                    )
                  )} */}

                  {units
                    .filter(
                      (unit) =>
                        unit.building &&
                        unit.building.buildingName === selectedLocation
                    )
                    .map((unit) => (
                      <MenuItem key={unit._id} value={unit.unitNo}>
                        {unit.unitNo}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
          </FormControl>
        </div>

        <PrimaryButton
          title="Next"
          type="submit"
          fontSize="text-content"
          externalStyles="w-48 mb-20"
        />
      </form>
    </div>
  );
};

export default CheckAvailability;
