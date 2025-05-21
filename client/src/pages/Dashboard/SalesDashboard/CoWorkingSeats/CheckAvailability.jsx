import React, { useEffect, useRef, useState } from "react";
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
import WidgetSection from "../../../../components/WidgetSection";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph"
import { useSelector } from "react-redux";

const CheckAvailability = () => {
  const navigate = useNavigate();
  const address = useLocation();
  const axios = useAxiosPrivate();
  const unitsData = useSelector((state)=>state.sales.unitsData)
   const clientsData = useSelector((state) => state.sales.clientsData);
   const unitMap = new Map();

   clientsData.forEach((item) => {
     const unit = item.unit;
     if (unit && unit.unitNo && !unitMap.has(unit.unitNo)) {
       unitMap.set(unit.unitNo, unit);
     }
   });
   
   const uniqueUnits = Array.from(unitMap.values());
   console.log("Unique Units:", uniqueUnits);
   

//  const combinedData =   [...unitsData , ...clientsData]
//  console.log("COMBINED : ",combinedData)
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      location: "",
      floor: "",
    },
  });

  const selectedLocation = watch("location");
  const selectedUnit = watch("floor");

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

  const selectedUnitId = locationsLoading
    ? []
    : workLocations
        .filter((item) => item.unitNo === selectedUnit)
        .map((item) => item._id);

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
  const formatUnitDisplay = (unitNo, buildingName) => {
    const match = unitNo.match(/^(\d+)\(?([A-Za-z]*)\)?$/);
    if (!match) return `${unitNo} ${buildingName}`;
    const [_, number, letter] = match;
    return `${number}${letter ? ` - ${letter}` : ""} ${buildingName}`;
  };

  // Sorting function
  const sortByUnitNo = (a, b) => {
    const matchA = a.unitNo.match(/^(\d+)\(?([A-Za-z]*)\)?$/);
    const matchB = b.unitNo.match(/^(\d+)\(?([A-Za-z]*)\)?$/);

    const numberA = parseInt(matchA[1], 10);
    const numberB = parseInt(matchB[1], 10);
    const letterA = matchA[2] || "";
    const letterB = matchB[2] || "";

    if (numberA !== numberB) {
      return numberA - numberB; // Compare numbers first
    }
    return letterA.localeCompare(letterB); // Compare letters if numbers are equal
  };

  const onSubmit = (data) => {
    const { location, floor } = data;
    address.pathname?.includes("mix-bag")
      ? navigate(
          `/app/dashboard/sales-dashboard/mix-bag/co-working-seats/check-availability/view-availability?location=${location}&floor=${floor}`,
          { state: { unitId: selectedUnitId[0] } }
        )
      : navigate(
          `/app/dashboard/sales-dashboard/co-working-seats/check-availability/view-availability?location=${location}&floor=${floor}`,
          { state: { unitId: selectedUnitId[0] } }
        );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
    <WidgetSection layout={1}>
      {/* <NormalBarGraph /> */}
    </WidgetSection>
    <div className="border-default border-borderGray p-4 rounded-md text-center">
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

                  {workLocations
                    .filter(
                      (unit) => unit.building.buildingName === selectedLocation
                    )
                    .sort(sortByUnitNo) // Sort using the custom sort function
                    .map((unit) => (
                      <MenuItem key={unit._id} value={unit.unitNo}>
                        {formatUnitDisplay(
                          unit.unitNo,
                          unit.building.buildingName
                        )}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
          </FormControl>
        </div>

        <PrimaryButton
          title="Check Availability"
          type="submit"
          fontSize="text-content"
          externalStyles="w-48 mb-20"
        />
      </form>
    </div>
    </div>
  );
};

export default CheckAvailability;
