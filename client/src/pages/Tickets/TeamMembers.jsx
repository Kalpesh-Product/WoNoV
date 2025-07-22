import React from "react";
import AgTable from "../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { CircularProgress } from "@mui/material";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";

const TeamMembers = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { data: teamMembersData = [], isLoading: isTeamMembers } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/get-team-members/${
            auth.user.departments.map((item) => item._id)[0]
          }`
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const AvatarCellRenderer = (props) => {
    const name = props.value;
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    const bgColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Random hex color

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            backgroundColor: bgColor,
            color: "#fff",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          {initials}
        </div>
        <span>{name}</span>
      </div>
    );
  };
  const laptopColumns = [
    { field: "srNo", headerName: "Sr No", flex: 0.5 },
    {
      field: "name",
      headerName: "Name",
      // cellRenderer: AvatarCellRenderer,
      flex: 1.5,
    },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    // { field: "assignedToday", headerName: "Assigned Today", flex: 1 },
    { field: "totalassigned", headerName: "Total Assigned", flex: 1 },
    { field: "totalresolved", headerName: "Total Resolved", flex: 1 },
    // { field: "resolutiontime", headerName: "Resolution Time", flex: 1 },
  ];

  return (
    <div className="w-full rounded-md bg-white p-4 ">
      <WidgetSection
        title={"Team Members"}
        TitleAmount={`Total Members :  ${teamMembersData.length || 0}`}
        border
      >
        <div>
          {!isTeamMembers ? (
            <div className=" w-full">
              <AgTable
                data={teamMembersData.map((item, index) => ({
                  srNo: index + 1,
                  ...item,
                }))}
                columns={laptopColumns}
                paginationPageSize={10}
                hideFilter
              />
            </div>
          ) : (
            <div className="h-72 flex justify-center items-center">
              <CircularProgress />
            </div>
          )}
        </div>
      </WidgetSection>
    </div>
  );
};

export default TeamMembers;
