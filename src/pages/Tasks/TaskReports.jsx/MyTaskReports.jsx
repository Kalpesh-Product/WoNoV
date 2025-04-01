import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";

const MyTaskReports = () => {
  const myTaskReportsColumns = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "task", headerName: "Task", width: 250 },
    { field: "project", headerName: "Project", width: 200 },
    { field: "assignedBy", headerName: "Assigned By", flex: 1 },
    {
      field: "priority",
      headerName: "Priority",
      width:120,
      cellRenderer: (params) => {
        const priority = params.value
        const statusColorMap = {
            "High" : {backgroundColor : "red", color : '#ffff'},
            "Medium": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
            "Low": { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        }

        const {backgroundColor, color} = statusColorMap[priority] || {
            backgroundColor: "gray",
            color: "white",
          };
        return <Chip label={params.value} style={{backgroundColor, color}} />;
      },
    },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: () => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span className="text-primary hover:underline text-content cursor-pointer">
              View Details
            </span>
          </div>
        </>
      ),
    },
  ];

  const myTaskReportsData = [
    {
      id: 1,
      task: "Develop Authentication Module",
      project: "HR Management System",
      assignedBy: "Aiwinraj",
      priority: "High",
      startDate: "2024-02-10",
      endDate: "2024-02-20",
    },
    {
      id: 2,
      task: "Fix Payment Gateway Issue",
      project: "E-commerce Platform",
      assignedBy: "Kalpesh Naik",
      priority: "Medium",
      startDate: "2024-02-12",
      endDate: "2024-02-18",
    },
    {
      id: 3,
      task: "Optimize Database Queries",
      project: "Inventory Management",
      assignedBy: "Sankalp",
      priority: "High",
      startDate: "2024-02-05",
      endDate: "2024-02-15",
    },
    {
      id: 4,
      task: "Implement Notification System",
      project: "Social Media App",
      assignedBy: "Allan",
      priority: "Low",
      startDate: "2024-02-08",
      endDate: "2024-02-22",
    },
    {
      id: 5,
      task: "UI/UX Design for Dashboard",
      project: "Admin Panel",
      assignedBy: "Muskan",
      priority: "Medium",
      startDate: "2024-02-14",
      endDate: "2024-02-25",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          tableTitle={"My Task Reports"}
          data={myTaskReportsData}
          columns={myTaskReportsColumns}
        />
      </div>
    </div>
  );
};

export default MyTaskReports;
