import React from "react";
import AgTable from "../../components/AgTable";


const MyAssets = ({ pageTitle }) => {
  const laptopColumns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "assetNumber", headerName: "Asset Number", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },

    { field: "brandName", headerName: "Brand", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },

    { field: "purchaseDate", headerName: "Purchase Date", flex: 1 },
    { field: "warranty", headerName: "Warranty (Months)", flex: 1 },
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
    },
    {
      id: "1",
      department: "IT",
      assetNumber: "1203",
      category: "XYZ",
      brandName: "ababab",
      price: "1000",
      quantity: "12",
      purchaseDate: "24/03/200",
      warranty: "2",
    },
    {
      id: "1",
      department: "IT",
      assetNumber: "1203",
      category: "XYZ",
      brandName: "ababab",
      price: "1000",
      quantity: "12",
      purchaseDate: "24/03/200",
      warranty: "2",
    },
  ];

  
  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <span className="text-title font-pmedium text-primary">My Assets</span>
      </div>

      <div className=" w-full">
        <AgTable data={rows} columns={laptopColumns} paginationPageSize={10} />
      </div>
    </>
  );
};

export default MyAssets;
