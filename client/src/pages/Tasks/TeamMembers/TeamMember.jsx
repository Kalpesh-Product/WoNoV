import React from "react";
import AgTable from "../../../components/AgTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const TeamMember = () => {
  const axios = useAxiosPrivate();
  const { data: taskList, isLoading } = useQuery({
    queryKey: ["taskList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-team-tasks");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const teamMembersColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "task", headerName: "Task", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <BsThreeDotsVertical />
          </div>
        </>
      ),
    },
  ];

  const teamMembersData = [
    {
      srNo: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Frontend Dev",
      projects: 3,
      task: 12,
      status: "Active",
    },
    {
      srNo: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Backend Dev",
      projects: 5,
      task: 18,
      status: "Away",
    },
    {
      srNo: 3,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "Tester",
      projects: 2,
      task: 9,
      status: "Offline",
    },
    {
      srNo: 4,
      name: "Robert Brown",
      email: "robert.brown@example.com",
      role: "Frontend Dev",
      projects: 4,
      task: 15,
      status: "Active",
    },
    {
      srNo: 5,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Backend Dev",
      projects: 6,
      task: 20,
      status: "Active",
    },
    {
      srNo: 6,
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      role: "Tester",
      projects: 3,
      task: 10,
      status: "Away",
    },
    {
      srNo: 7,
      name: "Sophia Martinez",
      email: "sophia.martinez@example.com",
      role: "Frontend Dev",
      projects: 2,
      task: 7,
      status: "Offline",
    },
    {
      srNo: 8,
      name: "Daniel Thomas",
      email: "daniel.thomas@example.com",
      role: "Backend Dev",
      projects: 5,
      task: 14,
      status: "Active",
    },
    {
      srNo: 9,
      name: "Olivia Harris",
      email: "olivia.harris@example.com",
      role: "Tester",
      projects: 1,
      task: 5,
      status: "Away",
    },
    {
      srNo: 10,
      name: "William Clark",
      email: "william.clark@example.com",
      role: "Frontend Dev",
      projects: 3,
      task: 11,
      status: "Active",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <AgTable
          search={true}
          searchColumn={"kra"}
          tableTitle={"Team Members"}
          data={
            isLoading
              ? []
              : [
                  ...taskList.map((task, index) => ({
                    srNo: index + 1,
                    name: task.name,
                    email: task.email,
                    role: task.role,
                    task: task.tasksCount,
                    status: task.status,
                  })),
                ]
          }
          columns={teamMembersColumn}
        />
      </div>
    </div>
  );
};

export default TeamMember;
