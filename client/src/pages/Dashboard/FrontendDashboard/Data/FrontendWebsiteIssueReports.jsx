import AgTable from "../../../../components/AgTable";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../../../components/PrimaryButton";

const FrontendWebsiteIssueReports = () => {
  const navigate = useNavigate();

  const websiteIssueReportsColumn = [
    { field: "issue", headerName: "Issue" },
    {
      field: "priority",
      headerName: "Priority",
      cellRenderer: (params) => {
        const priority = params.value.toLowerCase();
        let colorClass = "";
        if (priority === "low") {
          colorClass = "bg-green-500";
        } else if (priority === "medium") {
          colorClass = "bg-yellow-500";
        } else if (priority === "high") {
          colorClass = "bg-red-500";
        }
        return (
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full ${colorClass} mr-2`}></span>
            <span>{params.value}</span>
          </div>
        );
      },
    },
    { field: "clientName", headerName: "Client Name" },
    { field: "status", headerName: "Status" },
    { field: "dueBy", headerName: "Due By" },
    { field: "department", headerName: "Department" },
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <PrimaryButton
          title="View Details"
          handleSubmit={() =>
            ("View Details clicked for id", params.data.id)
          }
        />
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      issue: "Website is down",
      priority: "Low",
      clientName: "Dane John",
      status: "Open",
      dueBy: "2025-02-07",
      department: "IT",
    },
    {
      id: 2,
      issue: "Links are not working",
      priority: "Medium",
      clientName: "Alice Smith",
      status: "Open",
      dueBy: "2025-02-08",
      department: "HR",
    },
    {
      id: 3,
      issue: "Domain is expired",
      priority: "High",
      clientName: "Bob Brown",
      status: "Assigned",
      dueBy: "2025-02-09",
      department: "Administration",
    },
    {
      id: 4,
      issue: "Website is down",
      priority: "Low",
      clientName: "Charlie Davis",
      status: "Closed",
      dueBy: "2025-02-10",
      department: "Sales",
    },
    {
      id: 5,
      issue: "Domain is expired",
      priority: "High",
      clientName: "Eve Foster",
      status: "Open",
      dueBy: "2025-02-11",
      department: "Finance",
    },
    {
      id: 6,
      issue: "Website is down",
      priority: "Medium",
      clientName: "Frank Green",
      status: "Paused",
      dueBy: "2025-02-12",
      department: "IT",
    },
    {
      id: 7,
      issue: "Links are not working",
      priority: "Low",
      clientName: "Grace Hill",
      status: "Open",
      dueBy: "2025-02-13",
      department: "Sales",
    },
    {
      id: 8,
      issue: "Domain is expired",
      priority: "High",
      clientName: "Henry Ivy",
      status: "Open",
      dueBy: "2025-02-14",
      department: "IT",
    },
    {
      id: 9,
      issue: "Website is down",
      priority: "Medium",
      clientName: "Irene Jacobs",
      status: "Closed",
      dueBy: "2025-02-15",
      department: "Administration",
    },
    {
      id: 10,
      issue: "Website is down",
      priority: "Low",
      clientName: "Jack King",
      status: "Assigned",
      dueBy: "2025-02-16",
      department: "HR",
    },
    {
      id: 11,
      issue: "Links are not working",
      priority: "High",
      clientName: "Karen Lewis",
      status: "Open",
      dueBy: "2025-02-17",
      department: "Finance",
    },
    {
      id: 12,
      issue: "Domain is expired",
      priority: "Medium",
      clientName: "Leo Martin",
      status: "Closed",
      dueBy: "2025-02-18",
      department: "Administration",
    },
    {
      id: 13,
      issue: "Domain is expired",
      priority: "Low",
      clientName: "Mona Nash",
      status: "Unassigned",
      dueBy: "2025-02-19",
      department: "Sales",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"clientName"}
          tableTitle={"Website Issue Reports"}
          data={rows}
          columns={websiteIssueReportsColumn}
        />
      </div>
    </div>
  );
};

export default FrontendWebsiteIssueReports;
