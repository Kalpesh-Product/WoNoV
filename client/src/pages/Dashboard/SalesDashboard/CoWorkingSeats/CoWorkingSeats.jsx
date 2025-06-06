import React, { useMemo, useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import DataCard from "../../../../components/DataCard";
import MuiModal from "../../../../components/MuiModal";
import CollapsibleTable from "../../../../components/Tables/MuiCollapsibleTable";
import { useSelector } from "react-redux";
import DetalisFormatted from "../../../../components/DetalisFormatted";

const CoWorkingSeats = () => {
  const clientsData = useSelector((state) => state.sales.clientsData);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const handleViewModal = (data) => {
    setViewDetails(data);
    setViewModalOpen(true);
  };

  const FY_START = new Date("2024-04-01");
  const FY_END = new Date("2025-03-31");

  const { totalSeats, occupiedSeats, monthlySeatData } = useMemo(() => {
    const unitMap = new Map();
    const monthMap = {};

    // Prepare months
    const monthsInFY = [];
    let temp = new Date(FY_START);
    while (temp <= FY_END) {
      const key = temp.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      monthsInFY.push({ date: new Date(temp), key });
      temp.setMonth(temp.getMonth() + 1);
    }

    // 🔹 This will be used ONLY for occupancy
    const filteredClients = clientsData.filter((client) => {
      const start = new Date(client.startDate);
      const end = new Date(client.endDate);
      return end >= FY_START && start <= FY_END;
    });

    // 🔸 This one counts ALL unique units across all years
    const allUnitMap = new Map();
    clientsData.forEach((client) => {
      const unitId = client.unit?._id;
      const openDesks = client.unit?.openDesks || 0;
      const cabinDesks = client.unit?.cabinDesks || 0;
      if (unitId && !allUnitMap.has(unitId)) {
        allUnitMap.set(unitId, openDesks + cabinDesks);
      }
    });
    const totalSeats = Array.from(allUnitMap.values()).reduce(
      (a, b) => a + b,
      0
    );

    // Populate month map using only filteredClients
    filteredClients.forEach((client) => {
      const unitId = client.unit?._id;
      const unitOpen = client.unit?.openDesks || 0;
      const unitCabin = client.unit?.cabinDesks || 0;
      const unitSeats = unitOpen + unitCabin;

      const totalDesks = client.totalDesks || 0;
      const clientStart = new Date(client.startDate);
      const clientEnd = new Date(client.endDate);

      monthsInFY.forEach(({ date, key }) => {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Check if client is active in this month (even if started in a previous year)
        if (clientStart <= monthEnd && clientEnd >= monthStart) {
          if (!monthMap[key]) {
            monthMap[key] = {
              month: key,
              booked: 0,
              clientsMap: new Map(),
            };
          }

          const monthData = monthMap[key];

          const unitKey = client.unit?.unitNo; // ✅ use unitNo as key
          if (!unitKey) return;

          if (!monthData.clientsMap.has(unitKey + client._id)) {
            monthData.clientsMap.set(unitKey + client._id, {
              location: client.unit?.building?.buildingName,
              floor: unitKey, // 👈 Display correct unitNo
              totalSeats: unitSeats,
              booked: totalDesks,
            });
          }

          const unitEntry = monthData.clientsMap.get(unitId);
          // unitEntry.booked += totalDesks;
        }
      });
    });

    const occupiedSeats = filteredClients.reduce(
      (sum, client) => sum + (client.totalDesks || 0),
      0
    );

    const monthlySeatData = monthsInFY.map(({ key }) => {
      const month = monthMap[key];
      if (!month) {
        return {
          month: key,
          booked: 0,
          total: totalSeats,
          clients: [],
        };
      }

      const clients = Array.from(month.clientsMap.values()).map((client) => ({
        ...client,
        available: Math.max(client.totalSeats - client.booked, 0),
      }));

      const totalBooked = clients.reduce((sum, c) => sum + c.booked, 0);

      return {
        month: key,
        booked: totalBooked,
        total: totalSeats,
        clients,
      };
    });

    return { totalSeats, occupiedSeats, monthlySeatData };
  }, [clientsData]);

  const remainingSeats = totalSeats - occupiedSeats;

  const categories = monthlySeatData.map((m) => m.month);
  const bookedRawCounts = monthlySeatData.map((m) => m.booked);
  const remainingRawCounts = monthlySeatData.map((m) => m.total - m.booked);
  const bookedPercentages = monthlySeatData.map(
    (m) => (m.booked / (m.total || 1)) * 100
  );
  const remainingPercentages = monthlySeatData.map(
    (m) => ((m.total - m.booked) / (m.total || 1)) * 100
  );

  const series = [
    { name: "Booked", data: bookedPercentages },
    { name: "Remaining", data: remainingPercentages },
  ];

  const options = {
    chart: {
      stacked: true,
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
    colors: ["#36BA98", "#E83F25"],
    legend: { position: "top" },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      min: 0,
      max: 150,
      tickAmount: 5,
      labels: {
        formatter: (val) => `${val}%`,
      },
      title: { text: "Booked / Remaining Seats %" },
    },
    tooltip: {
      y: {
        formatter: (value, { seriesIndex, dataPointIndex }) => {
          if (seriesIndex === 0)
            return `${bookedRawCounts[dataPointIndex]} seats booked`;
          if (seriesIndex === 1)
            return `${remainingRawCounts[dataPointIndex]} seats remaining`;
          return `${Math.round(value)}%`;
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `${Math.round(value)}%`,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection
        layout={1}
        border
        padding
        title={"Co-Working Seats"}
        titleLabel={"FY 2024-2025"}
      >
        <BarGraph
          data={series}
          options={options}
          firstParam={{
            title: "Total Booked",
            data: occupiedSeats,
          }}
          secondParam={{
            title: "Total Remaining",
            data: remainingSeats,
          }}
        />
      </WidgetSection>

      <WidgetSection layout={3} padding>
        <DataCard
          title={"Total Seats"}
          data={totalSeats}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
        <DataCard
          title={"Booked Seats"}
          data={occupiedSeats}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
        <DataCard
          title={"Available Seats"}
          data={remainingSeats}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
      </WidgetSection>

      <WidgetSection
        title={`Co-Working Occupancy Details`}
        border
        TitleAmount={`TOTAL ACTIVE SEATS : ${occupiedSeats}`}
      >
        <CollapsibleTable
          columns={[
            { field: "month", headerName: "Month" },
            { field: "booked", headerName: "Booked Seats" },
          ]}
          data={monthlySeatData.map((m, index) => ({
            id: index,
            ...m,
          }))}
          renderExpandedRow={(row) => (
            <AgTable
              data={row.clients.map((c, idx) => ({ ...c, id: idx + 1 }))}
              hideFilter
              columns={[
                { headerName: "Sr No", field: "id", width: 100 },
                { headerName: "Location", field: "location" },
                { headerName: "Unit No", field: "floor" }, // ✅ Correct label

                { headerName: "Total Seats", field: "totalSeats" },
                { headerName: "Booked Seats", field: "booked" },
                { headerName: "Available Seats", field: "available" },
              ]}
              tableHeight={300}
            />
          )}
        />
      </WidgetSection>

      <MuiModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={"View Details"}
      >
        <div className="grid grid-cols-2 gap-4">
          <DetalisFormatted title="Floor" detail={viewDetails?.floor} />
          <DetalisFormatted
            title="Total Seats"
            detail={viewDetails?.totalSeats}
          />
          <DetalisFormatted title="Booked" detail={viewDetails?.booked} />
          <DetalisFormatted title="Available" detail={viewDetails?.available} />
        </div>
      </MuiModal>
    </div>
  );
};

export default CoWorkingSeats;
