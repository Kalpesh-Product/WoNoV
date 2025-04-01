import React from "react";
import AgTable from "../../../components/AgTable";

const AssetReports = () => {
  const assetsColumns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "assetNumber", headerName: "Asset Number", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "brand", headerName: "Brand", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "purchaseDate", headerName: "Purchase Date", flex: 1 },
    { field: "warranty", headerName: "Warranty", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
  ];

  const rows = [
    {
      id: 1,
      department: "HR",
      assetNumber: "0001",
      category: "Laptop",
      brand: "Dell",
      price: "₹55,000",
      quantity: 2,
      purchaseDate: "02/01/2025",
      warranty: 12,
      location: "ST-701B",
      modelName: "Dell",
      status: "Active",
      assignmentDate: "02/03/2025",
      assignmentTime: "11:36 AM",
    },
    {
      id: 2,
      department: "IT",
      assetNumber: "0002",
      category: "Printer",
      brand: "HP",
      price: "₹15,000",
      quantity: 1,
      purchaseDate: "15/02/2025",
      warranty: 24,
      location: "ST-601",
      modelName: "HP",
      status: "Active",
      assignmentDate: "02/03/2025",
      assignmentTime: "12:00 PM",
    },
    {
      id: 3,
      department: "Finance",
      assetNumber: "0003",
      category: "Chair",
      brand: "Godrej",
      price: "₹5,000",
      quantity: 4,
      purchaseDate: "10/03/2025",
      warranty: 36,
      location: "ST-701",
      modelName: "Godrej",
      status: "Active",
      assignmentDate: "02/03/2025",
      assignmentTime: "10:30 AM",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <AgTable
          search={true}
          tableTitle={"Reports"}
          data={rows}
          columns={assetsColumns}
          dropdownColumns={["department", "category", "brand"]} // Specify which columns should be dropdowns
          buttonTitle={"Export"}
        />
      </div>
    </div>
  );
};

export default AssetReports;
