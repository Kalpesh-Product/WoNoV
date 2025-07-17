import React, { useEffect, useRef, useState } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import WidgetSection from "../../../../components/WidgetSection";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import { useSelector } from "react-redux";
import FinanceCard from "../../../../components/FinanceCard";

const CheckAvailability = () => {
  const navigate = useNavigate();
  const address = useLocation();
  const axios = useAxiosPrivate();
  const clientsData = useSelector((state) => state.sales.clientsData);

  //-------------  Remove Duplicates----------------------//
  // STEP 2: Build unique units map by unitNo (to ensure uniqueness)
  const unitMap = new Map();

  clientsData.forEach((item) => {
    const unit = item.unit;
    if (unit && unit.unitNo && !unitMap.has(unit.unitNo)) {
      unitMap.set(unit.unitNo, unit);
    }
  });

  const uniqueUnits = Array.from(unitMap.values());

  // STEP 3: Group units by building name
  const groupedByBuilding = new Map();

  uniqueUnits.forEach((unit) => {
    const buildingName = unit.building?.buildingName || "Unknown";
    if (!groupedByBuilding.has(buildingName)) {
      groupedByBuilding.set(buildingName, []);
    }
    groupedByBuilding.get(buildingName).push(unit);
  });

  const chartData = Array.from(groupedByBuilding.entries()).map(
    ([buildingName, units]) => {
      const totalSeats = units.reduce(
        (sum, unit) => sum + (unit.openDesks || 0) + (unit.cabinDesks || 0),
        0
      );

      const occupiedSeats = clientsData
        .filter(
          (client) => client.unit?.building?.buildingName === buildingName
        )
        .reduce(
          (sum, client) =>
            sum + (client.openDesks || 0) + (client.cabinDesks || 0),
          0
        );

      const remainingSeats = Math.max(totalSeats - occupiedSeats, 0);

      return {
        name: buildingName,
        occupied: occupiedSeats,
        remaining: remainingSeats,
      };
    }
  );

  const barGraphSeries = [
    {
      name: "Occupied",
      data: chartData.map((item) => item.occupied),
    },
    {
      name: "Remaining",
      data: chartData.map((item) => item.remaining),
    },
  ];

  const barGraphOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      stacked: true, // ✅ Stack bars
      stackType: "100%", // ✅ Normalize to 100%
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const buildingName = chartData[config.dataPointIndex]?.name;
          const encodedName = encodeURIComponent(buildingName);
          navigate(
            `/app/dashboard/sales-dashboard/mix-bag/inventory/${encodedName}`,
            { state: buildingName }
          );
        },
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: chartData.map((item) => item.name),
      title: {
        text: "Building Name",
      },
    },
    yaxis: {
      title: {
        text: "Percentage",
      },
      labels: {
        formatter: (val) => `${val}%`,
      },
      max: 100,
    },
    legend: {
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "10%",
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    colors: ["#36BA98", "#E83F25"],
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const buildingName = w.globals.labels[dataPointIndex];
        const occupied = w.globals.initialSeries[0].data[dataPointIndex];
        const remaining = w.globals.initialSeries[1].data[dataPointIndex];
        const total = occupied + remaining;

        return `
          <div style="padding:8px; width : 200px">
            <strong>${buildingName}</strong><br/>
            <hr />
            <div style="display:flex; justify-content:space-between; margin-top : 5px; font-size : 12px">
              <div style="width : 100%">
                Total
              </div>
              <div style="width : 100%">
              ${total} desks
              </div>
            </div>

            <div style="display:flex; justify-content:space-between;font-size : 12px">
              <div style="width : 100%">
                Occupied
              </div>
              <div style="width : 100%">
              ${occupied} desks
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size : 12px">
              <div style="width : 100%">
                Remaining
              </div>
              <div style="width : 100%">
              ${remaining} desks
              </div>
            </div>
          </div>
        `;
      },
    },
  };

  //-------------  Remove Duplicates----------------------//

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

  // const uniqueBuildings = Array.from(
  //   new Map(
  //     workLocations.length > 0
  //       ? workLocations.map((loc) => [
  //           loc.building._id, // use building._id as unique key
  //           loc.building.buildingName,
  //         ])
  //       : []
  //   ).entries()
  // );

  const uniqueBuildings = Array.from(
    new Map(
      workLocations.length > 0
        ? workLocations
            .filter(
              (loc) =>
                loc.building && loc.building._id && loc.building.buildingName
            ) // ✅ safeguard
            .map((loc) => [loc.building._id, loc.building.buildingName])
        : []
    ).entries()
  );

  const formatUnitDisplay = (buildingName, unitNo) => {
    if (typeof unitNo !== "string")
      return `${unitNo || "Unknown"} ${buildingName}`;

    // Match format like "501A", "302", "302(A)", or "ST 501 A"
    const match = unitNo.match(/(\d+)[\s-]?([A-Za-z]*)$/); // extract trailing number + optional letter

    if (!match) return `${unitNo} ${buildingName}`;
    const [_, number, letter] = match;
    return ` ${buildingName} - ${number}${letter ? ` - ${letter}` : ""}`;
  };

  // Sorting function
  const sortByUnitNo = (a, b) => {
    const matchA =
      typeof a.unitNo === "string"
        ? a.unitNo.match(/(\d+)[\s-]?([A-Za-z]*)$/)
        : null;
    const matchB =
      typeof b.unitNo === "string"
        ? b.unitNo.match(/(\d+)[\s-]?([A-Za-z]*)$/)
        : null;

    if (!matchA || !matchB) return 0;

    const numberA = parseInt(matchA[1], 10);
    const numberB = parseInt(matchB[1], 10);
    const letterA = matchA[2] || "";
    const letterB = matchB[2] || "";

    if (numberA !== numberB) return numberA - numberB;
    return letterA.localeCompare(letterB);
  };

  const onSubmit = (data) => {
    const { location, floor } = data;
    address.pathname?.includes("mix-bag")
      ? navigate(
          `/app/dashboard/sales-dashboard/mix-bag/inventory/${location}/${floor}`,
          { state: { unitId: selectedUnitId[0] } }
        )
      : navigate(
          `/app/dashboard/sales-dashboard/inventory/${location}/${floor}`,
          { state: { unitId: selectedUnitId[0] } }
        );
  };

  const inventoryStats = {
    ST: { total: 0, occupied: 0 },
    DTC: { total: 0, occupied: 0 },
  };

  const seenUnits = new Set();

  clientsData.forEach((client, index) => {
    if (!client.unit || !client.unit.building) return;

    const unit = client.unit;
    const unitNo = unit.unitNo || "N/A";
    const buildingName = unit.building.buildingName || "Unknown";

    const isNewUnit = !seenUnits.has(unitNo);
    if (isNewUnit) seenUnits.add(unitNo);

    const unitOpenDesks = Number(unit.openDesks) || 0;
    const unitCabinDesks = Number(unit.cabinDesks) || 0;
    const totalSeats = unitOpenDesks + unitCabinDesks;
    const bookedSeats = Number(client.totalDesks) || 0;

    if (buildingName.includes("Sunteck Kanaka")) {
      if (isNewUnit) {
        inventoryStats.ST.total += totalSeats;
      }
      inventoryStats.ST.occupied += bookedSeats;
    } else if (buildingName.includes("Dempo Trade Centre")) {
      if (isNewUnit) {
        inventoryStats.DTC.total += totalSeats;
      }
      inventoryStats.DTC.occupied += bookedSeats;
    }
  });

  const allBuildings = new Set();

  clientsData.forEach((client) => {
    const buildingName = client.unit?.building?.buildingName;
    if (buildingName) allBuildings.add(buildingName);
  });

  const inventoryCards = {
    inventory: [
      {
        title: "ST Inventory",
        value: String(Number(inventoryStats.ST?.total) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Sunteck%20Kanaka",
        stateData: "Sunteck Kanaka",
      },
      {
        title: "DTC Inventory",
        value: String(Number(inventoryStats.DTC?.total) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Dempo%20Trade%20Centre",
        stateData: "Dempo Trade Centre",
      },
      {
        title: "Total Inventory",
        value: String(
          (Number(inventoryStats.ST?.total) || 0) +
            (Number(inventoryStats.DTC?.total) || 0)
        ),
        route: "#",
      },
    ],
    occupancy: [
      {
        title: "ST Occupancy",
        value: String(Number(inventoryStats.ST?.occupied) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Sunteck%20Kanaka",
        stateData: "Sunteck Kanaka",
      },
      {
        title: "DTC Occupancy",
        value: String(Number(inventoryStats.DTC?.occupied) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Dempo%20Trade%20Centre",
        stateData: "Dempo Trade Centre",
      },
      {
        title: "Total Occupancy",
        value: String(
          (Number(inventoryStats.ST?.occupied) || 0) +
            (Number(inventoryStats.DTC?.occupied) || 0)
        ),
        route: "#",
      },
    ],
    freeInventory: [
      {
        title: "ST Free Inventory",
        value: String(
          (Number(inventoryStats.ST?.total) || 0) -
            (Number(inventoryStats.ST?.occupied) || 0)
        ),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Sunteck%20Kanaka",
        stateData: "Sunteck Kanaka",
      },
      {
        title: "DTC Free Inventory",
        value: String(
          (Number(inventoryStats.DTC?.total) || 0) -
            (Number(inventoryStats.DTC?.occupied) || 0)
        ),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Dempo%20Trade%20Centre",
        stateData: "Dempo Trade Centre",
      },
      {
        title: "Total Free Inventory",
        value: String(
          (Number(inventoryStats.ST?.total) || 0) -
            (Number(inventoryStats.ST?.occupied) || 0) +
            (Number(inventoryStats.DTC?.total) || 0) -
            (Number(inventoryStats.DTC?.occupied) || 0)
        ),
        route: "#",
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <WidgetSection
        layout={1}
        border
        normalCase={true}
        title={"TOTAL v/s OCCUPIED FY 2024-25"}
      >
        {chartData.length > 0 ? (
          <NormalBarGraph
            data={barGraphSeries}
            options={barGraphOptions}
            height={400}
          />
        ) : (
          <div className="text-center text-gray-500 text-sm py-10">
            No data available to display chart.
          </div>
        )}
      </WidgetSection>
      <WidgetSection layout={3} padding>
        <FinanceCard
          cardTitle="Inventory"
          titleCenter
          highlightNegativePositive
          disableColorChange
          descriptionData={inventoryCards.inventory}
        />

        <FinanceCard
          cardTitle="Occupancy"
          titleCenter
          highlightNegativePositive
          disableColorChange
          descriptionData={inventoryCards.occupancy}
        />

        <FinanceCard
          cardTitle="Free Inventory"
          titleCenter
          highlightNegativePositive
          disableColorChange
          descriptionData={inventoryCards.freeInventory}
        />
      </WidgetSection>

      <div className="border-default border-borderGray p-4 rounded-md text-center">
        <h2 className="font-pregular text-title text-primary mt-20 mb-10 uppercase">
          Check Inventory
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
                    {uniqueBuildings.length > 0 ? (
                      uniqueBuildings.map(([id, name]) => (
                        <MenuItem key={id} value={name}>
                          {name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No locations available</MenuItem>
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
                    {workLocations.length > 0 ? (
                      workLocations
                        .filter(
                          (unit) =>
                            unit.building &&
                            unit.building.buildingName === selectedLocation
                        )
                        .sort(sortByUnitNo)
                        .map((unit) => (
                          <MenuItem key={unit._id} value={unit.unitNo}>
                            {formatUnitDisplay(
                              unit.building.buildingName,
                              unit.unitNo
                            )}
                          </MenuItem>
                        ))
                    ) : (
                      <MenuItem disabled>No floors found</MenuItem>
                    )}
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
