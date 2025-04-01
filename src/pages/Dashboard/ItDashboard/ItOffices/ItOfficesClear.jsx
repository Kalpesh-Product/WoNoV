import React from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import clearImage from "../../../../assets/biznest/clear-seats.png";
import occupiedImage from "../../../../assets/biznest/occupied-seats.png";
import { Chip } from "@mui/material";

const ItOfficesClear = () => {
  const navigate = useNavigate();

  const viewEmployeeColumns = [
    { field: "srno", headerName: "Total Seats" },
    // {
    //   field: "employeeName",
    //   headerName: "Employee Name",
    //   cellRenderer: (params) => (
    //     <span
    //       style={{
    //         color: "#1E3D73",
    //         textDecoration: "underline",
    //         cursor: "pointer",
    //       }}
    //       onClick={() =>
    //         navigate(
    //           `/app/dashboard/HR-dashboard/employee/view-employees/${params.data.employmentID}`
    //         )
    //       }>
    //       {params.value}
    //     </span>
    //   ),
    // },
    { field: "employmentID", headerName: "Booked Seats" },
    { field: "email", headerName: "Occupied Seats", flex: 1 },
    { field: "role", headerName: "Available Seats", flex: 1 },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       Active: { backgroundColor: "#90EE90", color: "#006400" },
    //       Inactive: { backgroundColor: "#D3D3D3", color: "#696969" },
    //     };

    //     const { backgroundColor, color } = statusColorMap[params.value] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };
    //     return (
    //       <Chip
    //         label={params.value}
    //         style={{
    //           backgroundColor,
    //           color,
    //         }}
    //       />
    //     );
    //   },
    // },
  ];

  const rows = [
    {
      srno: "8",
      // employeeName: "Aiwinraj",
      employmentID: "4",
      email: "3",
      role: "4",
    },
    // {
    //   srno: "2",
    //   employeeName: "Allan",
    //   employmentID: "WO002",
    //   email: "allan.wono@gmail.com",
    //   role: "Employee",
    //   status: "Active",
    // },
    // {
    //   srno: "3",
    //   employeeName: "Sankalp",
    //   employmentID: "WO003",
    //   email: "sankalp.wono@gmail.com",
    //   role: "Employee",
    //   status: "Active",
    // },
    // {
    //   srno: "4",
    //   employeeName: "Anushri",
    //   employmentID: "WO004",
    //   email: "anushri.wono@gmail.com",
    //   role: "Employee",
    //   status: "Active",
    // },
    // {
    //   srno: "5",
    //   employeeName: "Muskan",
    //   employmentID: "WO005",
    //   email: "muskan.wono@gmail.com",
    //   role: "Employee",
    //   status: "Active",
    // },
    // {
    //   srno: "6",
    //   employeeName: "Kalpesh",
    //   employmentID: "WO006",
    //   email: "kalpesh.wono@gmail.com",
    //   role: "Employee",
    //   status: "Active",
    // },
    // {
    //   srno: "7",
    //   employeeName: "Allan2",
    //   employmentID: "WO007",
    //   email: "allan2.wono@gmail.com",
    //   role: "Employee",
    //   status: "InActive",
    // },
  ];

  return (
    <div>
      <div className="w-full py-10 flex justify-around items-center">
        {/* <div className="">
          <div className="py-2 text-center">
            <p className="text-primary text-lg font-bold">Occupied</p>
          </div>
          <div>
            <img
              // className="w-[90%] h-[80%] object-contain cursor-pointer"
              className="w-full h-[80%] object-contain cursor-pointer"
              src={occupiedImage}
              alt="Image"
            />
          </div>
        </div> */}
        <div className="">
          {/* <div className="py-2 text-center">
            {" "}
            <p className="text-primary text-lg font-bold">Clear</p>
          </div> */}
          <div>
            <img
              // className="w-[90%] h-[80%] object-contain cursor-pointer"
              className="w-full h-[80%] object-contain cursor-pointer"
              src={clearImage}
              alt="Image"
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <AgTable
          search={true}
          searchColumn="Email"
          data={rows}
          columns={viewEmployeeColumns}
        />
      </div>
    </div>
  );
};

export default ItOfficesClear;
