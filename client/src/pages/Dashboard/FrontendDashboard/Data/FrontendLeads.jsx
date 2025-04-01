import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";

const FrontendLeads = () => {
  const leadsColumn = [
    { field: "enquiryFor", headerName: "Enquiry For" },
    {
      field: "date",
      headerName: "Date",
    },
    { field: "time", headerName: "Time" },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Called: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
        };
        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    { field: "name", headerName: "Name" },
    { field: "phoneNo", headerName: "Phone No" },
    { field: "email", headerName: "Email" },
  ];

  const rows = [
    {
      id: 1,
      enquiryFor: "Co-working",
      date: "2025-01-01",
      time: "10:00 AM",
      status: "Called",
      name: "Aiwinraj",
      phoneNo: "12345",
      email: "aiwin@email.com",
    },
    {
      id: 1,
      enquiryFor: "Workations",
      date: "2025-02-01",
      time: "09:15 AM",
      status: "Pending",
      name: "Alice Johnson",
      phoneNo: "555-123-4567",
      email: "alice.johnson@example.com",
    },
    {
      id: 2,
      enquiryFor: "Meeting Room",
      date: "2025-02-02",
      time: "11:30 AM",
      status: "Called",
      name: "Bob Smith",
      phoneNo: "555-234-5678",
      email: "bob.smith@example.com",
    },
    {
      id: 3,
      enquiryFor: "Virtual Office",
      date: "2025-02-03",
      time: "02:45 PM",
      status: "Called",
      name: "Carol Lee",
      phoneNo: "555-345-6789",
      email: "carol.lee@example.com",
    },
    {
      id: 4,
      enquiryFor: "Co-Living",
      date: "2025-02-04",
      time: "10:00 AM",
      status: "Pending",
      name: "David Brown",
      phoneNo: "555-456-7890",
      email: "david.brown@example.com",
    },
    {
      id: 5,
      enquiryFor: "Warranty Inquiry",
      date: "2025-02-05",
      time: "03:30 PM",
      status: "Called",
      name: "Eva Green",
      phoneNo: "555-567-8901",
      email: "eva.green@example.com",
    },
    {
      id: 6,
      enquiryFor: "Feedback Submission",
      date: "2025-02-06",
      time: "01:20 PM",
      status: "Called",
      name: "Frank White",
      phoneNo: "555-678-9012",
      email: "frank.white@example.com",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"Name"}
          tableTitle={""}
          data={rows}
          columns={leadsColumn}
        />
      </div>
    </div>
  );
};

export default FrontendLeads;
