import React from "react";
import AgTable from "../../../components/AgTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useState } from "react";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { CircularProgress } from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import PageFrame from "../../../components/Pages/PageFrame";

const TeamMember = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
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

  const handleSelectedMember = (meeting) => {
    setSelectedMember(meeting);
    setOpenModal(true);
  };

  const teamMembersColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "tasks", headerName: "Task", flex: 1 },
    // { field: "status", headerName: "Status", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      cellRenderer: (params) => {
        return (
          <>
            <div className="flex gap-2 items-center">
              <div
                onClick={() => {
                  handleSelectedMember(params.data);
                }}
                className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all">
                <span className="text-subtitle">
                  <MdOutlineRemoveRedEye />
                </span>
              </div>
            </div>
          </>
        );
      },
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
      <PageFrame>
        <div>
          <AgTable
            search={true}
            searchColumn={"kra"}
            tableTitle={"Team Members"}
            data={
              isLoading || !Array.isArray(taskList)
                ? []
                : taskList.map((task, index) => ({
                    srNo: index + 1,
                    name: task.name,
                    email: task.email,
                    role: task.role,
                    tasks: task.tasks,
                    status: task.status,
                  }))
            }
            columns={teamMembersColumn}
          />
        </div>
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Team Member Details"}>
        {!isLoading && selectedMember ? (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title="Name" detail={selectedMember?.name} />
            <DetalisFormatted title="Email" detail={selectedMember?.email} />
            <DetalisFormatted title="Role" detail={selectedMember?.role} />
            <DetalisFormatted title="Tasks" detail={selectedMember?.tasks} />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default TeamMember;
