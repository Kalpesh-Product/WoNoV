import React from "react";
import AgTable from "../../components/AgTable";

const TeamMembers = () => {
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
          }}>
          {initials}
        </div>
        <span>{name}</span>
      </div>
    );
  };
  const laptopColumns = [
    { field: "srNo", headerName: "Sr No", flex: 0.5 },
    { field: "name", headerName: "Name", cellRenderer: AvatarCellRenderer, flex: 1.5 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "assignedToday", headerName: "Assigned Today", flex: 1 },
    { field: "totalassigned", headerName: "Total Assigned", flex: 1 },
    { field: "totalresolved", headerName: "Total Resolved", flex: 1 },
    { field: "resolutiontime", headerName: "Resolution Time", flex: 1 },
  ];

  const rows = [
    {
      srNo: 1,
      name: "Kalpesh Naik",
      department: "Tech",
      role: "Manager",
      assignedToday: "3",
      totalassigned: "23",
      totalresolved: "18",
      resolutiontime: "20 mins",
    },
    {
      srNo: 2,
      name: "Machindranath Parkar",
      department: "IT",
      role: "Manager",
      assignedToday: "5",
      totalassigned: "27",
      totalresolved: "22",
      resolutiontime: "15 mins",
    },
    {
      srNo: 3,
      name: "Narshiva Naik",
      department: "Finance",
      role: "Manager",
      assignedToday: "4",
      totalassigned: "34",
      totalresolved: "30",
      resolutiontime: "18 mins",
    },
    {
      srNo: 4,
      name: "Samiksha Shrikant",
      department: "Administration",
      role: "Desk Receptionist",
      assignedToday: "6",
      totalassigned: "35",
      totalresolved: "28",
      resolutiontime: "25 mins",
    },
    {
      srNo: 5,
      name: "Rajesh Babani",
      department: "Maintenance",
      role: "Manager",
      assignedToday: "2",
      totalassigned: "19",
      totalresolved: "17",
      resolutiontime: "22 mins",
    },
  ];

  return (
    <div className="w-full rounded-md bg-white p-4 ">
      <div className="flex flex-row justify-between mb-4 items-center">
        <div>
          Total Team Members: <b>{rows.length}</b>
        </div>
        {/* <PrimaryButton title="Add New Member"></PrimaryButton> */}
      </div>
      <div className=" w-full">
        <AgTable data={rows} columns={laptopColumns} paginationPageSize={10} />
      </div>
    </div>
  );
};

export default TeamMembers;
