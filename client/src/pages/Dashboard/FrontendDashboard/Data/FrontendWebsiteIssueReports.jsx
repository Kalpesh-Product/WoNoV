import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";

const FrontendWebsiteIssueReports = () => {
  const websiteIssueReportsColumn = [
    { field: "id", headerName: "Sr No", width: 100 },
    { field: "dueBy", headerName: "Due By" },
    { field: "clientName", headerName: "Client Name" },
    { field: "issue", headerName: "Issue" },
    { field: "department", headerName: "Department" },
    { field: "status", headerName: "Status" },
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
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <div className="p-2">
          <PrimaryButton
            title="View Details"
            handleSubmit={() => ("View Details clicked for id", params.data.id)}
          />
        </div>
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      dueBy: "07-02-2025",
      clientName: "Dane John",
      issue: "Website is down",
      department: "IT",
      status: "Open",
      priority: "Low",
    },
    {
      id: 2,
      dueBy: "08-02-2025",
      clientName: "Alice Smith",
      issue: "Links are not working",
      department: "HR",
      status: "Open",
      priority: "Medium",
    },
    {
      id: 3,
      dueBy: "09-02-2025",
      clientName: "Bob Brown",
      issue: "Domain is expired",
      department: "Administration",
      status: "Assigned",
      priority: "High",
    },
    {
      id: 4,
      dueBy: "10-02-2025",
      clientName: "Charlie Davis",
      issue: "Website is down",
      department: "Sales",
      status: "Closed",
      priority: "Low",
    },
    {
      id: 5,
      dueBy: "11-02-2025",
      clientName: "Eve Foster",
      issue: "Domain is expired",
      department: "Finance",
      status: "Open",
      priority: "High",
    },
    {
      id: 6,
      dueBy: "12-02-2025",
      clientName: "Frank Green",
      issue: "Website is down",
      department: "IT",
      status: "Paused",
      priority: "Medium",
    },
    {
      id: 7,
      dueBy: "13-02-2025",
      clientName: "Grace Hill",
      issue: "Links are not working",
      department: "Sales",
      status: "Open",
      priority: "Low",
    },
    {
      id: 8,
      dueBy: "14-02-2025",
      clientName: "Henry Ivy",
      issue: "Domain is expired",
      department: "IT",
      status: "Open",
      priority: "High",
    },
    {
      id: 9,
      dueBy: "15-02-2025",
      clientName: "Irene Jacobs",
      issue: "Website is down",
      department: "Administration",
      status: "Closed",
      priority: "Medium",
    },
    {
      id: 10,
      dueBy: "16-02-2025",
      clientName: "Jack King",
      issue: "Website is down",
      department: "HR",
      status: "Assigned",
      priority: "Low",
    },
    {
      id: 11,
      dueBy: "17-02-2025",
      clientName: "Karen Lewis",
      issue: "Links are not working",
      department: "Finance",
      status: "Open",
      priority: "High",
    },
    {
      id: 12,
      dueBy: "18-02-2025",
      clientName: "Leo Martin",
      issue: "Domain is expired",
      department: "Administration",
      status: "Closed",
      priority: "Medium",
    },
    {
      id: 13,
      dueBy: "19-02-2025",
      clientName: "Mona Nash",
      issue: "Domain is expired",
      department: "Sales",
      status: "Unassigned",
      priority: "Low",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div>
          <AgTable
            search={true}
            searchColumn={"clientName"}
            tableTitle={"Website Issue Reports"}
            data={[]}
            columns={websiteIssueReportsColumn}
          />
        </div>
      </PageFrame>
    </div>
  );
};

export default FrontendWebsiteIssueReports;
