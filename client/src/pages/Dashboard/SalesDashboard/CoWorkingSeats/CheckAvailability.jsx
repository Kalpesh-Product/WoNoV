import React, { useEffect, useRef } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const CheckAvailability = () => {
  const navigate = useNavigate();
  const address = useLocation();
  const axios = useAxiosPrivate();

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      location: "",
      floor: "",
    },
  });

  const selectedLocation = watch("location");

  const {
    data: workLocations = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["workLocations"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");

      return response.data;
    },
  });

  const uniqueBuildings = Array.from(
    new Map(
      workLocations.length > 0
        ? workLocations.map((loc) => [
            loc.building._id, // use building._id as unique key
            loc.building.buildingName,
          ])
        : []
    ).entries()
  );

  const onSubmit = (data) => {
    const { location, floor } = data;
    address.pathname?.includes("mix-bag")
      ? navigate(
          `/app/dashboard/sales-dashboard/mix-bag/co-working-seats/view-availability?location=${location}&floor=${floor}`
        )
      : navigate(
          `/app/dashboard/sales-dashboard/co-working-seats/view-availability?location=${location}&floor=${floor}`
        );
  };

  return (
    <div className="border-default border-borderGray m-4 p-4 rounded-md text-center">
      <h2 className="font-pregular text-title text-primary mt-20 mb-10 uppercase">
        Check Occupancy
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center"
      >
        <div className="flex justify-center gap-4 mb-10 px-20 w-full">
          {/* Location Dropdown */}
          <FormControl className="w-1/2">
            <InputLabel>Select Location</InputLabel>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Select Location">
                  <MenuItem value="" disabled>
                    Select Location
                  </MenuItem>
                  {locationsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : locationsError ? (
                    <MenuItem disabled>Error fetching floors</MenuItem>
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
            <InputLabel>Select Floor</InputLabel>
            <Controller
              name="floor"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Select Floor"
                  disabled={!selectedLocation}
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                >
                  <MenuItem value="">Select Floor</MenuItem>

                  {workLocations.map((unit) =>
                    unit.building.buildingName === selectedLocation ? (
                      <MenuItem key={unit._id} value={unit.unitNo}>
                        {unit.unitNo}
                      </MenuItem>
                    ) : (
                      <></>
                    )
                  )}
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
