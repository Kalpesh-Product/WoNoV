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
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const CheckAvailability = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      location: "",
      floor: "",
    },
  });

  const selectedLocation = watch("location");

  // Fetch Work Locations

  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/company/fetch-units"
      );
      
      return response.data;
    },
  });

  const uniqueBuildings = Array.from(
    new Map(
        units.length > 0 ? units.map((loc) => [
        loc.building._id, // use building._id as unique key
        loc.building.buildingName,
      ]) : []
    ).entries() 
  );

   

  const floors = ["501(A)", "501(B)", "601(A)", "601(B)", "701(A)", "701(B)"];

  const onSubmit = (data) => {
    const { location, floor } = data;
    navigate(
      `/app/dashboard/finance-dashboard/finance/landlord-payments-unit?location=${location}&floor=${floor}`
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

                  {units.map((unit) => (
                   unit.building.buildingName === selectedLocation ? <MenuItem key={unit._id} value={unit.unitNo}>
                      {unit.unitNo}
                    </MenuItem> : <></>
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
