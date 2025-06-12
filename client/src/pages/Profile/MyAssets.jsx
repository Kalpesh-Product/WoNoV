import React from "react";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";

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

  return (
    <>
      <PageFrame>
        <div className="flex items-center justify-between pb-4">
          <span className="text-title font-pmedium text-primary uppercase">
            My Assets
          </span>
        </div>
        <div className=" w-full">
          <AgTable
            data={[]}
            columns={laptopColumns}
            paginationPageSize={10}
            search
          />
        </div>
      </PageFrame>
    </>
  );
};

export default MyAssets;
