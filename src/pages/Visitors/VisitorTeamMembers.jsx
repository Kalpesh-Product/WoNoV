import React from "react";
import AgTable from "../../components/AgTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const VisitorTeamMembers = () => {
  const axios = useAxiosPrivate();
  const { data: taskList, isLoading } = useQuery({
    queryKey: ["taskList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-team-tasks-projects");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const teamMembersColumn = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "currentDesk", headerName: "Current Desk", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
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
      id: 1,
      name: "Pranali Kandolkar",
      email: "test.email@gmail.com",
      role: "Sr. Associate - Community & Admin",
      currentDesk: "ST 701A",
      location: "ST",
      status: "Active",
    },
    {
      id: 2,
      name: "Anne Fernandes",
      email: "test.email@gmail.com",
      role: "Associate - Community & Admin",
      currentDesk: "ST 701B",
      location: "ST",
      status: "Away",
    },
    {
      id: 3,
      name: "Melisa Fernandes",
      email: "test.email@gmail.com",
      role: "Associate- Front Office & Admin",
      currentDesk: "ST 601A",
      location: "ST",
      status: "Offline",
    },
    {
      id: 4,
      name: "Naaz Parveen Bavannawar",
      email: "test.email@gmail.com",
      role: "Jr. Executive - Receptionist",
      currentDesk: "ST 501A",
      location: "ST",
      status: "Active",
    },
    {
      id: 5,
      name: "Urjita Sangodkar",
      email: "test.email@gmail.com",
      role: "Associate - Community & Admin",
      currentDesk: "G1",
      location: "DTC",
      status: "Active",
    },
    // {
    //   id: 6,
    //   name: "Michael Wilson",
    //   email: "michael.wilson@example.com",
    //   role: "Tester",
    //   currentDesk: 3,
    //   location: 10,
    //   status: "Away",
    // },
    // {
    //   id: 7,
    //   name: "Sophia Martinez",
    //   email: "sophia.martinez@example.com",
    //   role: "Frontend Dev",
    //   currentDesk: 2,
    //   location: 7,
    //   status: "Offline",
    // },
    // {
    //   id: 8,
    //   name: "Daniel Thomas",
    //   email: "daniel.thomas@example.com",
    //   role: "Backend Dev",
    //   currentDesk: 5,
    //   location: 14,
    //   status: "Active",
    // },
    // {
    //   id: 9,
    //   name: "Olivia Harris",
    //   email: "olivia.harris@example.com",
    //   role: "Tester",
    //   currentDesk: 1,
    //   location: 5,
    //   status: "Away",
    // },
    // {
    //   id: 10,
    //   name: "William Clark",
    //   email: "william.clark@example.com",
    //   role: "Frontend Dev",
    //   currentDesk: 3,
    //   location: 11,
    //   status: "Active",
    // },
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
                  //   ...taskList.map((task, index) => ({
                  ...teamMembersData.map((task, index) => ({
                    id: index + 1,
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
    </div>
  );
};

export default VisitorTeamMembers;
