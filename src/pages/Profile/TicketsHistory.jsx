import React from "react";
import AgTable from "../../components/AgTable";

const TicketsHistory = ({ pageTitle }) => {
  const laptopColumns = [
    { field: "id", headerName: "ID"},
    { field: "department", headerName: "Department" },
    { field: "assetNumber", headerName: "Asset Number" },
    { field: "category", headerName: "Category"},

    { field: "brandName", headerName: "Brand" },
    { field: "price", headerName: "Price" },
    { field: "quantity", headerName: "Quantity"},

    { field: "purchaseDate", headerName: "Purchase Date" },
    { field: "warranty", headerName: "Warranty (Months)" },
    {
        field: "priority",
        headerName: "Priority",
        width: 190,
        type: "singleSelect",
        valueOptions: ["High", "Medium", "Low"],
        cellRenderer: (params) => {
          const statusColors = {
            Medium: "text-blue-600 bg-blue-100",
            High: "text-red-600 bg-red-100",
            Low: "text-yellow-600 bg-yellow-100",
          };
          const statusClass = statusColors[params.value] || "";
          return (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
              {params.value}
            </span>
          );
        },
      },
  ];
  const rows = [
    {
      id: "1",
      department: "IT",
      assetNumber: "1203",
      category: "XYZ",
      brandName: "ababa",
      price: "1000",
      quantity: "12",
      purchaseDate: "24/03/200",
      warranty: "2",
      priority:"High"
    },
    {
      id: "2",
      department: "IT",
      assetNumber: "1203",
      category: "XYZ",
      brandName: "ababab",
      price: "1000",
      quantity: "12",
      purchaseDate: "24/03/200",
      warranty: "2",
       priority:"Medium"
    },
    {
      id: "3",
      department: "IT",
      assetNumber: "1203",
      category: "XYZ",
      brandName: "ababab",
      price: "1000",
      quantity: "12",
      purchaseDate: "24/03/200",
      warranty: "2",
      priority:"Low"
    },
  ];
  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <span className="text-title font-pmedium text-primary">Ticket History</span>
      </div>
      <div className=" w-full">
        <AgTable data={rows} columns={laptopColumns} paginationPageSize={10} />
      </div>
    </>
  );
};

export default TicketsHistory;
