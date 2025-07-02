import { useMemo, useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import DataCard from "../../../../components/DataCard";
import MuiModal from "../../../../components/MuiModal";
import { useSelector } from "react-redux";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const CoWorkingSeats = () => {
  const clientsData = useSelector((state) => state.sales.clientsData);
  const navigate = useNavigate();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [selectedTableMonth, setSelectedTableMonth] = useState(null);

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
   const totalOccupiedSeats = clientsData.filter((item)=>item.isActive === true).reduce(
    (sum, item) => (item.totalDesks || 0) + sum,
    0
  );


  const remainingSeats = totalSeats - totalOccupiedSeats;

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

  const generateUnitMonthData = (clientsData) => {
    const monthData = [];

    // 1. Get global date range
    const earliestStartDate = clientsData.reduce((earliest, client) => {
      const clientStart = dayjs(client.startDate);
      return clientStart.isBefore(earliest) ? clientStart : earliest;
    }, dayjs(clientsData[0]?.startDate || new Date()));

    const latestEndDate = clientsData.reduce((latest, client) => {
      const clientEnd = dayjs(client.endDate);
      return clientEnd.isAfter(latest) ? clientEnd : latest;
    }, dayjs(clientsData[0]?.endDate || new Date()));

    const globalStart = earliestStartDate.startOf("month");
    const globalEnd = latestEndDate.endOf("month");

    // 2. Build unit map & track first booking per unit
    const unitsMap = new Map();
    const firstBookingMonthPerUnit = new Map();

    clientsData.forEach((client) => {
      const unit = client.unit;
      const unitKey = unit.unitNo;
      const clientStart = dayjs(client.startDate).startOf("month");

      if (!unitsMap.has(unitKey)) {
        unitsMap.set(unitKey, {
          unitNo: unit.unitNo,
          unitName: unit.unitName,
          buildingName: unit.building?.buildingName || "",
          totalSeats: unit.openDesks + unit.cabinDesks,
        });
      }

      // Track first booking month
      if (
        !firstBookingMonthPerUnit.has(unitKey) ||
        clientStart.isBefore(firstBookingMonthPerUnit.get(unitKey))
      ) {
        firstBookingMonthPerUnit.set(unitKey, clientStart);
      }
    });

    // 3. Track availability per unit across months
    const availabilityState = new Map();

    for (
      let m = globalStart.clone();
      m.isBefore(globalEnd);
      m = m.add(1, "month")
    ) {
      unitsMap.forEach((unitInfo, unitNo) => {
        const totalSeats = unitInfo.totalSeats;
        const unitStartMonth = firstBookingMonthPerUnit.get(unitNo);

        // Skip months before this unit's first booking
        if (m.isBefore(unitStartMonth)) return;

        // New bookings that start in this month
        const bookedThisMonth = clientsData
          .filter((client) => client.unit.unitNo === unitNo)
          .filter((client) => {
            const clientStart = dayjs(client.startDate);
            return (
              clientStart.isBefore(m.endOf("month")) &&
              clientStart.isSameOrAfter(m.startOf("month"))
            );
          })
          .reduce((sum, client) => sum + client.totalDesks, 0);

        const prevAvailable =
          availabilityState.has(unitNo) &&
          availabilityState.get(unitNo) !== undefined
            ? availabilityState.get(unitNo)
            : totalSeats;

        const available = Math.max(prevAvailable - bookedThisMonth, 0);

        monthData.push({
          unitNo,
          unitName: unitInfo.unitName,
          buildingName: unitInfo.buildingName,
          totalSeats,
          booked: bookedThisMonth,
          available,
          date: m.startOf("month").toISOString(),
        });

        // Update availability for next month
        availabilityState.set(unitNo, available);
      });
    }


    return monthData;
  };

  const tableData = useMemo(
    () => generateUnitMonthData(clientsData),
    [clientsData]
  );

  const totalBookedForMonth = useMemo(() => {
    if (!selectedTableMonth) return 0;
    return tableData
      .filter(
        (row) => dayjs(row.date).format("MMM-YYYY") === selectedTableMonth
      )
      .reduce((sum, row) => sum + (row.booked || 0), 0);
  }, [tableData, selectedTableMonth]);


  const columns = [
    { headerName: "Sr No", field: "srNo", maxWidth: 80 },
    {
      headerName: "Unit No",
      field: "unitNo",
      cellRenderer: (params) => {
        const rowData = params.data;
        const unitNo = rowData.unitNo;

        return (
          <span
            className="text-primary underline cursor-pointer"
            onClick={() => {
              const parsedDate = dayjs(rowData.date, "DD-MM-YYYY");
              const selectedMonth = parsedDate.format("MMM-YYYY");

              const monthStart = parsedDate.startOf("month");
              const monthEnd = parsedDate.endOf("month");

              const bookedClients = clientsData.filter((client) => {
                const clientUnit = client.unit?.unitNo;
                const clientStart = dayjs(client.startDate);
                const clientEnd = dayjs(client.endDate);

                return (
                  clientUnit === unitNo &&
                  clientStart.isBefore(monthEnd) &&
                  clientEnd.isAfter(monthStart)
                );
              });

              navigate(`/app/dashboard/sales-dashboard/mix-bag/co-working-seats/${params.value}`, {
                state: {
                  bookings: bookedClients,
                  unitNo: unitNo,
                  selectedMonth: selectedMonth,
                },
              });
            }}
          >
            {params.value}
          </span>
        );
      },
    },

    { headerName: "Unit Name", field: "unitName" },
    { headerName: "Building", field: "buildingName" },
    { headerName: "Total Seats", field: "totalSeats" },
    { headerName: "Booked", field: "booked" },
    { headerName: "Available", field: "available" },
    { headerName: "Month", field: "date" },
  ];


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
          data={totalOccupiedSeats}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
        <DataCard
          title={"Available Seats"}
          route={"check-availability"}
          data={remainingSeats}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
      </WidgetSection>

      <WidgetSection
        border
        title={"Unit-wise Co-Working Bookings"}
        TitleAmount={`Total Booked : ${totalBookedForMonth}`}
      >
        <YearWiseTable
          data={tableData}
          columns={columns}
          formatDate={false}
          formatTime={false}
          dateColumn="date"
          initialMonth="April"
          onMonthChange={setSelectedTableMonth}
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
