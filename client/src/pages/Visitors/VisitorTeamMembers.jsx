import React from "react";
import AgTable from "../../components/AgTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import PageFrame from "../../components/Pages/PageFrame";

const VisitorTeamMembers = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { data: teamMembersData = [], isLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/visitors/fetch-team-members?dept=6798bae6e469e809084e24a4"
        );
        return response.data
          .filter((m) => m._id !== auth.user._id)
          .filter(
            (m) =>
              m.department.includes("Administration") ||
              m.department.includes("Top Management")
          );
      } catch (error) {
        console.error(error);
      }
    },
  });

  const teamMembersColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
  ];

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <div>
          <AgTable
            search={true}
            searchColumn={"kra"}
            tableTitle={"Team Members"}
            data={
              isLoading
                ? []
                : [
                    //   ...taskList.map((task, index) => ({
                    ...teamMembersData.map((task, index) => ({
                      srNo: index + 1,
                      name: task.name,
                      email: task.email,
                      role: task.role,
                      currentDesk: task.currentDesk,
                      location: task.location,
                      status: task.status,
                    })),
                  ]
            }
            columns={teamMembersColumn}
          />
        </div>
      </PageFrame>
    </div>
  );
};

export default VisitorTeamMembers;
