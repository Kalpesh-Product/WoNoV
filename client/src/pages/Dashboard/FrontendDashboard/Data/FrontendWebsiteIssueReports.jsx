import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";

const FrontendWebsiteIssueReports = () => {
  const websiteIssueReportsColumn = [
    { field: "id", headerName: "Serial No." },
    { field: "dueBy", headerName: "Due By" },
    { field: "clientName", headerName: "Client Name" },
    { field: "issue", headerName: "Issue" },
    { field: "department", headerName: "Department" },
    { field: "status", headerName: "Status" },
    {
      field: "priority",
      headerName: "Remarks",
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
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <PrimaryButton
          title="View Details"
          handleSubmit={() => ("View Details clicked for id", params.data.id)}
        />
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      dueBy: "2025-02-07",
      clientName: "Dane John",
      issue: "Website is down",
      department: "IT",
      status: "Open",
      priority: "Low",
    },
    {
      id: 2,
      dueBy: "2025-02-08",
      clientName: "Alice Smith",
      issue: "Links are not working",
      department: "HR",
      status: "Open",
      priority: "Medium",
    },
    {
      id: 3,
      dueBy: "2025-02-09",
      clientName: "Bob Brown",
      issue: "Domain is expired",
      department: "Administration",
      status: "Assigned",
      priority: "High",
    },
    {
      id: 4,
      dueBy: "2025-02-10",
      clientName: "Charlie Davis",
      issue: "Website is down",
      department: "Sales",
      status: "Closed",
      priority: "Low",
    },
    {
      id: 5,
      dueBy: "2025-02-11",
      clientName: "Eve Foster",
      issue: "Domain is expired",
      department: "Finance",
      status: "Open",
      priority: "High",
    },
    {
      id: 6,
      dueBy: "2025-02-12",
      clientName: "Frank Green",
      issue: "Website is down",
      department: "IT",
      status: "Paused",
      priority: "Medium",
    },
    {
      id: 7,
      dueBy: "2025-02-13",
      clientName: "Grace Hill",
      issue: "Links are not working",
      department: "Sales",
      status: "Open",
      priority: "Low",
    },
    {
      id: 8,
      dueBy: "2025-02-14",
      clientName: "Henry Ivy",
      issue: "Domain is expired",
      department: "IT",
      status: "Open",
      priority: "High",
    },
    {
      id: 9,
      dueBy: "2025-02-15",
      clientName: "Irene Jacobs",
      issue: "Website is down",
      department: "Administration",
      status: "Closed",
      priority: "Medium",
    },
    {
      id: 10,
      dueBy: "2025-02-16",
      clientName: "Jack King",
      issue: "Website is down",
      department: "HR",
      status: "Assigned",
      priority: "Low",
    },
    {
      id: 11,
      dueBy: "2025-02-17",
      clientName: "Karen Lewis",
      issue: "Links are not working",
      department: "Finance",
      status: "Open",
      priority: "High",
    },
    {
      id: 12,
      dueBy: "2025-02-18",
      clientName: "Leo Martin",
      issue: "Domain is expired",
      department: "Administration",
      status: "Closed",
      priority: "Medium",
    },
    {
      id: 13,
      dueBy: "2025-02-19",
      clientName: "Mona Nash",
      issue: "Domain is expired",
      department: "Sales",
      status: "Unassigned",
      priority: "Low",
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
