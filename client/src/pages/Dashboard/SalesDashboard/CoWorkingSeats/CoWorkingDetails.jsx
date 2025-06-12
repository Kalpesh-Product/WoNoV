import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";

const CoWorkingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookings, unitNo, selectedMonth } = location.state || {};

  if (!bookings) {
    return (
      <div className="p-4">
        <h2>No booking data found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const columns = [
    {
      headerName: "Sr No",
      field: "srno",
      maxWidth: 80,
      valueGetter: (params) => params.node?.rowIndex + 1,
    },
    {
      headerName: "Client Name",
      field: "clientName",
      flex : 1,
      valueGetter: (params) =>
        params.data.name || params.data.clientName || "Unnamed",
    },
    {
      headerName: "Start Date",
      field: "startDate",
      valueFormatter: (params) => dayjs(params.value).format("DD-MM-YYYY"),
    },
    {
      headerName: "End Date",
      field: "endDate",
      valueFormatter: (params) => dayjs(params.value).format("DD-MM-YYYY"),
    },
    {
      headerName: "Booked Desks",
      field: "totalDesks",
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection border title={`BOOKINGS IN ${unitNo} - ${selectedMonth} `}>
        <AgTable search key={bookings.length} data={bookings} columns={columns} />
      </WidgetSection>
    </div>
  );
};

export default CoWorkingDetails;
