;
import AgTable from "../../../components/AgTable";
import { BsThreeDotsVertical } from "react-icons/bs";

const TeamMember = () => {
  const teamMembersColumn = [
    { field: "name", headerName: "Name" ,flex:1},
    { field: "email", headerName: "Email" ,flex:1},
    { field: "role", headerName: "Role" ,flex:1},
    { field: "projects", headerName: "Projects" ,flex:1},
    { field: "task", headerName: "Task" ,flex:1},
    { field: "status", headerName: "Status" ,flex:1},
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: () => (
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
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Frontend Dev",
      projects: 3,
      task: 12,
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Backend Dev",
      projects: 5,
      task: 18,
      status: "Away",
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "Tester",
      projects: 2,
      task: 9,
      status: "Offline",
    },
    {
      id: 4,
      name: "Robert Brown",
      email: "robert.brown@example.com",
      role: "Frontend Dev",
      projects: 4,
      task: 15,
      status: "Active",
    },
    {
      id: 5,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Backend Dev",
      projects: 6,
      task: 20,
      status: "Active",
    },
    {
      id: 6,
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      role: "Tester",
      projects: 3,
      task: 10,
      status: "Away",
    },
    {
      id: 7,
      name: "Sophia Martinez",
      email: "sophia.martinez@example.com",
      role: "Frontend Dev",
      projects: 2,
      task: 7,
      status: "Offline",
    },
    {
      id: 8,
      name: "Daniel Thomas",
      email: "daniel.thomas@example.com",
      role: "Backend Dev",
      projects: 5,
      task: 14,
      status: "Active",
    },
    {
      id: 9,
      name: "Olivia Harris",
      email: "olivia.harris@example.com",
      role: "Tester",
      projects: 1,
      task: 5,
      status: "Away",
    },
    {
      id: 10,
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
          data={teamMembersData}
          columns={teamMembersColumn}
        />
      </div>
    </div>
  );
};

export default TeamMember;
