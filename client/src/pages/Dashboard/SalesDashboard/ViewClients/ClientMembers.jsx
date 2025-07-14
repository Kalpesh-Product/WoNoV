import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import { useSelector } from "react-redux";
import humanDate from "../../../../utils/humanDateForamt";
import PageFrame from "../../../../components/Pages/PageFrame";

const ClientMembers = () => {
  const navigate = useNavigate();
  const selectedClient = useSelector((state) => state.client.selectedClient);

  const viewEmployeeColumns = [
    { field: "srno", headerName: "SR No" },
    {
      field: "employeeName",
      headerName: "Member Name",
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(`view-member/${params.data.employeeName}`, {
              state: { memberDetails: params.data },
            })
          }
        >
          {params.value}
        </span>
      ),
    },
    { field: "dob", headerName: "DOB" },
    { field: "mobileNo", headerName: "Mobile No." },
    { field: "email", headerName: "Email", flex: 1 },
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
  return (
    <div>
      <div className="w-full">
        <PageFrame>
          <AgTable
            key={selectedClient?._id}
            search={true}
            searchColumn="Email"
            tableTitle={`${selectedClient?.clientName} Members`}
            data={selectedClient?.members.map((item, index) => ({
              ...item,
              srno: index + 1,
              employeeName: item.employeeName,
              dob: humanDate(item.dob),
              mobileNo: item.mobileNo || 0,
              email: item.email || "N/A",
            }))}
            columns={viewEmployeeColumns}
          />
        </PageFrame>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ClientMembers;
