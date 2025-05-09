import AgTable from "../../components/AgTable";
import { Chip } from "@mui/material";
import PrimaryButton from "../../components/PrimaryButton";
import { useState } from "react";

const VisitorReports = () => {
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState([]);

  const meetingReportsColumn = [
    { field: "srNo", headerName: "Sr No" },
    { field: "name", headerName: "Name" },
    { field: "department", headerName: "Address" },
    { field: "date", headerName: "Email" },
    { field: "startTime", headerName: "Phone No" },
    { field: "endTime", headerName: "Purpose" },
    { field: "duration", headerName: "To Meet" },
    { field: "creditsUsed", headerName: "Check In" },
    { field: "checkOut", headerName: "Check Out" },
    // {
    //   field: "status",
    //   headerName: "Actions",
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       "View Details": { backgroundColor: "#1e3d73", color: "#ffffff" }, // Light blue bg, dark blue font
    //       Cancelled: { backgroundColor: "#f7e1e1", color: "#a5333e" }, // Light red bg, dark red font
    //       Upcoming: { backgroundColor: "#fcf7be", color: "#b87e33" },
    //     };

    //     const { backgroundColor, color } = statusColorMap[params.value] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };
    //     return (
    //       <>
    //         <Chip
    //           label={params.value}
    //           style={{
    //             backgroundColor,
    //             color,
    //           }}
    //         />
    //       </>
    //     );
    //   },
    // },

    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2">
          <PrimaryButton
            title={"View Details"}
            handleSubmit={() => {
              handleDetailsClick({ ...params.data });
            }}
          />
        </div>
      ),
    },
  ];

  const handleDetailsClick = (asset) => {
    setSelectedVisitor(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const rows = [
    {
      srNo: 1,
      name: "Sam",
      department: "Mapusa",
      date: "test.email@gmail.com",
      startTime: "9876543201",
      endTime: "Client Demo",
      duration: "Abrar Shaikh",
      creditsUsed: "09:00 AM",
      status: "View Details",
    },
    {
      srNo: 2,
      name: "Alice",
      department: "Mapusa",
      date: "test.email@gmail.com",
      startTime: "9876543201",
      endTime: "Client Demo",
      duration: "Abrar Shaikh",
      creditsUsed: "09:00 AM",
      status: "View Details",
    },
    {
      srNo: 3,
      name: "Bob",
      department: "Mapusa",
      date: "test.email@gmail.com",
      startTime: "9876543201",
      endTime: "Client Demo",
      duration: "Abrar Shaikh",
      creditsUsed: "09:00 AM",
      status: "View Details",
    },
    {
      srNo: 4,
      name: "Emma",
      department: "Mapusa",
      date: "test.email@gmail.com",
      startTime: "9876543201",
      endTime: "Client Demo",
      duration: "Abrar Shaikh",
      creditsUsed: "09:00 AM",
      status: "View Details",
    },
    {
      srNo: 5,
      name: "John",
      department: "Mapusa",
      date: "test.email@gmail.com",
      startTime: "9876543201",
      endTime: "Client Demo",
      duration: "Abrar Shaikh",
      creditsUsed: "09:00 AM",
      status: "View Details",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <AgTable
          search={true}
          searchColumn={"Name"}
          buttonTitle={"Export"}
          tableTitle={"Visitor Reports"}
          data={rows}
          columns={meetingReportsColumn}
        />
      </div>
    </div>
  );
};

export default VisitorReports;
