import React, { useEffect, useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable"; // Adjust the import path as needed
import WidgetSection from "../../../../components/WidgetSection";
import DataCard from "../../../../components/DataCard";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import MuiModal from "../../../../components/MuiModal";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";

// JSON data structure for coworking seats and client details
const jsonData = {
  financialYear: "2024-2025",
  totalSeats: 1000,
  months: [
    {
      month: "Apr-24",
      booked: 300,
      remaining: 700,
      clients: [
        {
          location: "DTC",
          floor: 1,
          totalSeats: 80,
          booked: 75,
          available: 5,
          action: "view",
        },
        {
          location: "DTC",
          floor: 2,
          totalSeats: 55,
          booked: 50,
          available: 5,
          action: "view",
        },
        {
          location: "ST",
          floor: 1,
          totalSeats: 110,
          booked: 100,
          available: 10,
          action: "view",
        },
        {
          location: "ST",
          floor: 3,
          totalSeats: 80,
          booked: 75,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "May-24",
      booked: 300,
      remaining: 700,
      clients: [
        {
          location: "DTC",
          floor: 1,
          totalSeats: 80,
          booked: 75,
          available: 5,
          action: "view",
        },
        {
          location: "DTC",
          floor: 2,
          totalSeats: 55,
          booked: 50,
          available: 5,
          action: "view",
        },
        {
          location: "ST",
          floor: 1,
          totalSeats: 110,
          booked: 100,
          available: 10,
          action: "view",
        },
        {
          location: "ST",
          floor: 3,
          totalSeats: 80,
          booked: 75,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Jun-24",
      booked: 300,
      remaining: 700,
      clients: [
        {
          location: "DTC",
          floor: 1,
          totalSeats: 80,
          booked: 75,
          available: 5,
          action: "view",
        },
        {
          location: "DTC",
          floor: 2,
          totalSeats: 55,
          booked: 50,
          available: 5,
          action: "view",
        },
        {
          location: "ST",
          floor: 1,
          totalSeats: 110,
          booked: 100,
          available: 10,
          action: "view",
        },
        {
          location: "ST",
          floor: 3,
          totalSeats: 80,
          booked: 75,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Jul-24",
      booked: 400,
      remaining: 800,
      clients: [
        {
          location: "Office D",
          floor: 1,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Aug-24",
      booked: 450,
      remaining: 550,
      clients: [
        {
          location: "Office E",
          floor: 2,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Sep-24",
      booked: 600,
      remaining: 400,
      clients: [
        {
          location: "Office F",
          floor: 3,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Oct-24",
      booked: 800,
      remaining: 200,
      clients: [
        {
          location: "Office G",
          floor: 1,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Nov-24",
      booked: 900,
      remaining: 100,
      clients: [
        {
          location: "Office H",
          floor: 2,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Dec-24",
      booked: 650,
      remaining: 350,
      clients: [
        {
          location: "Office I",
          floor: 3,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Jan-25",
      booked: 500,
      remaining: 500,
      clients: [
        {
          location: "Office J",
          floor: 1,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Feb-25",
      booked: 300,
      remaining: 700,
      clients: [
        {
          location: "Office K",
          floor: 2,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
    {
      month: "Mar-25",
      booked: 400,
      remaining: 600,
      clients: [
        {
          location: "Office L",
          floor: 3,
          totalSeats: 20,
          booked: 15,
          available: 5,
          action: "view",
        },
      ],
    },
  ],
};

const CoWorkingSeats = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [location, setLocation] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const handleViewModal = (data) => {
    setViewDetails(data);
    setViewModalOpen(true);
    setLocation(data);
  };

  //---------------------------------------------------------API---------------------------------------------------------//

  const { data: units, isPending: isUnitsPending } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        return response.data;
      } catch (error) {
        toast.error(error.message);
      }
    },
  });
  //---------------------------------------------------------API---------------------------------------------------------//
  // Prepare data for the BarGraph from jsonData
  const totalSeats = jsonData.totalSeats;
  const categories = jsonData.months.map((m) => m.month);
  const bookedRawCounts = jsonData.months.map((m) => m.booked);
  const remainingRawCounts = jsonData.months.map((m) => m.remaining);
  const bookedPercentages = jsonData.months.map(
    (m) => (m.booked / totalSeats) * 100
  );
  const remainingPercentages = jsonData.months.map(
    (m) => (m.remaining / totalSeats) * 100
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
      title: { text: "" },
    },
    yaxis: {
      min: 0,
      max: 100,
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
        borderRadius: 3,
        columnWidth: "40%",
      },
    },
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <WidgetSection
          layout={1}
          border
          padding
          title={"Co-Working Seats"}
          titleLabel={"FY 24-25"}
        >
          <BarGraph
            data={series}
            options={options}
            firstParam={{
              title: "Total Booked",
              data: jsonData.months.reduce((acc, m) => acc + m.booked, 0),
            }}
            secondParam={{
              title: "Total Remaining",
              data:
                totalSeats -
                jsonData.months.reduce((acc, m) => acc + m.booked, 0),
            }}
          />
        </WidgetSection>
      </div>

      <div>
        <WidgetSection layout={3} padding>
          <DataCard
            title={"Total Seats"}
            route={"check-availability"}
            data={"1000"}
            description={`Current Month : ${new Date().toLocaleString(
              "default",
              { month: "short" }
            )}-24`}
          />
          <DataCard
            title={"Booked Seats"}
            route={"check-availability"}
            data={"800"}
            description={`Current Month : ${new Date().toLocaleString(
              "default",
              { month: "short" }
            )}-24`}
          />
          <DataCard
            title={"Available Seats"}
            route={"check-availability"}
            data={"200"}
            description={`Current Month : ${new Date().toLocaleString(
              "default",
              { month: "short" }
            )}-24`}
          />
        </WidgetSection>
      </div>
      <div className="flex items-end justify-end">
        <div className="flex w-1/4">
          {/* <PrimaryButton
            handleSubmit={() => {
              navigate("check-availability");
            }}
            title={"Check Availability"}
            externalStyles={"h-full w-full"}
          /> */}
        </div>
      </div>
      {/* Accordion Section */}
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
        <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="w-full text-sm text-muted font-pmedium text-title">
              MONTH
            </span>
            <span className="w-full text-sm text-muted font-pmedium text-title text-right flex items-center justify-end gap-1">
              BOOKED
            </span>
          </div>
        </div>
        {jsonData.months.map((domain, index) => (
          <Accordion key={index} className="py-4">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls={`panel-${index}-content`}
              id={`panel-${index}-header`}
              className="border-b-[1px] border-borderGray"
            >
              <div className="flex justify-between items-center w-full px-4">
                <span className="text-subtitle font-pmedium">
                  {domain.month}
                </span>
                <span className="text-subtitle font-pmedium">
                  {domain.booked} seats
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: "1px solid #d1d5db" }}>
              <AgTable
                data={domain.clients.map((client, index) => ({
                  ...client,
                  id: index + 1,
                }))}
                hideFilter
                columns={[
                  { headerName: "Sr No", field: "id", width: 100 },
                  { headerName: "Location", field: "location" },
                  { headerName: "Floor", field: "floor" },
                  { headerName: "Total Seats", field: "totalSeats" },
                  { headerName: "Booked", field: "booked" },
                  { headerName: "Available", field: "available" },
                  {
                    headerName: "Action",
                    field: "action",
                    cellRenderer: (params) => (
                      <div className="p-2 mb-2  flex gap-2">
                        <span
                          className="text-subtitle cursor-pointer"
                          onClick={() => handleViewModal(params.data)}
                        >
                          <MdOutlineRemoveRedEye />
                        </span>
                      </div>
                    ),
                  },
                ]}
                tableHeight={300}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </div>

        <MuiModal open={viewModalOpen} onClose={()=>setViewModalOpen(false)} title={"view details"}>
          <div className="grid grid-cols-2 gap-4">
            <DetalisFormatted title={"Floor"} detail={viewDetails?.floor} />
            <DetalisFormatted title={"Total Seats"} detail={viewDetails?.totalSeats} />
            <DetalisFormatted title={"Booked"} detail={viewDetails?.booked} />
            <DetalisFormatted title={"Available"} detail={viewDetails?.available} />
          </div>
        </MuiModal>
    </div>
  );
};

export default CoWorkingSeats;
