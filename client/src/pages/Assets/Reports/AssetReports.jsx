import React from "react";
import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../components/AgTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAuth from "../../../hooks/useAuth";
import humanDate from "../../../utils/humanDateForamt";
import { inrFormat } from "../../../utils/currencyFormat";

const AssetReports = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const userDepartmentIds = (auth?.user?.departments || []).map((department) =>
    department?._id?.toString(),
  );

  const { data: groupedAssets = [], isLoading } = useQuery({
    queryKey: ["asset-reports", userDepartmentIds],
    queryFn: async () => {
      const response = await axios.get("/api/assets/get-assets");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

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

  const rows = (Array.isArray(groupedAssets) ? groupedAssets : [])
    .filter((departmentGroup) =>
      userDepartmentIds.includes(departmentGroup?.departmentId?.toString()),
    )
    .flatMap((departmentGroup) =>
      (departmentGroup?.assets || []).map((asset) => ({
        id: asset?._id,
        department: departmentGroup?.departmentName || "N/A",
        assetNumber: asset?.assetId || "N/A",
        category: asset?.subCategory?.category?.categoryName || "N/A",
        brand: asset?.brand || "N/A",
        price: inrFormat(asset?.price || 0),
        quantity: asset?.quantity || 0,
        purchaseDate: asset?.purchaseDate ? humanDate(asset.purchaseDate) : "N/A",
        warranty: asset?.warranty ?? "N/A",
        location: asset?.location?.unitNo || asset?.location?.unitName || "N/A",
      })),
    );

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <AgTable
          search={true}
          tableTitle={"Reports"}
          data={isLoading ? [] : rows}
          columns={assetsColumns}
          dropdownColumns={["department", "category", "brand"]}
          buttonTitle={"Export"}
        />
      </div>
    </div>
  );
};

export default AssetReports;