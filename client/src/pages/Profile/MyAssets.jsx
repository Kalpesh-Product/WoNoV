import React from "react";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import StatusChip from "../../components/StatusChip";

const MyAssets = ({ pageTitle }) => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();

  const { data: assetsList = [], isPending: isAssetsListPending } = useQuery({
    queryKey: ["assetsList"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/assets/get-asset-requests?assignee=${auth.user._id}`
        );

        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const assetsColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    // { field: "assignee", headerName: "Assignee Name" },
    { field: "assetNumber", headerName: "Asset Id" },
    { field: "department", headerName: "Department" },
    { field: "category", headerName: "Category" },
    { field: "subCategory", headerName: "Sub Category" },
    { field: "brand", headerName: "Brand" },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
  ];

  const tableData = isAssetsListPending
    ? []
    : assetsList.map((item, index) => {
        const assets = item.asset;
        const subCategory = assets?.subCategory?.subCategoryName;
        const category = assets?.subCategory?.category?.categoryName;
        return {
          ...assets,
          ...item,
          srNo: index + 1,
          assignee: `${item.assignee?.firstName} ${item.assignee?.lastName}`,
          assetId: item._id,
          assetNumber: item?.asset?.assetId,
          department: item?.toDepartment?.name,
          category: category,
          subCategory,
          brand: assets?.brand,
        };
      });

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
            data={tableData}
            columns={assetsColumns}
            paginationPageSize={10}
            search
          />
        </div>
      </PageFrame>
    </>
  );
};

export default MyAssets;
