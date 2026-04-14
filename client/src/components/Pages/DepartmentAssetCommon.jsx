import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import humanDate from "../../utils/humanDateForamt";

const DepartmentAssetCommon = (disabled) => {
  const axios = useAxiosPrivate();
  const department = usePageDepartment();

  const { data: assignedAssets = [], isLoading } = useQuery({
    queryKey: ["departmentAssignedAssets", department?._id],
    enabled: Boolean(department?._id),
    queryFn: async () => {
      const response = await axios.get(
        `/api/assets/get-asset-requests?toDepartment=${department._id}&status=Approved`
      );
      return response.data;
    },
  });

  const assetColumns = [
    { field: "id", headerName: "Sr No", width: 90 },
    { field: "assetNumber", headerName: "Asset Id", width: 130 },
    { field: "assetName", headerName: "Asset Name", minWidth: 160, flex: 1 },
    { field: "category", headerName: "Category", minWidth: 140, flex: 1 },
    { field: "brand", headerName: "Brand", minWidth: 120, flex: 1 },
    { field: "assignedBy", headerName: "Assigned By", minWidth: 170, flex: 1 },
    { field: "assignedTo", headerName: "Assigned To", minWidth: 170, flex: 1 },
    { field: "fromDepartment", headerName: "Assigned From", minWidth: 150, flex: 1 },
    { field: "toDepartment", headerName: "Assigned Department", minWidth: 170, flex: 1 },
    { field: "assignedDate", headerName: "Assigned Date", minWidth: 130, flex: 1 },
  ];

  const tableData = isLoading
    ? []
     : assignedAssets
      .filter(
        (item) => item?.toDepartment?._id?.toString() === department?._id?.toString()
      )
      .map((item, index) => {
        const assignedToName = [item?.assignee?.firstName, item?.assignee?.lastName]
          .filter(Boolean)
          .join(" ");
        const assignedByName = [
          item?.approvedBy?.firstName,
          item?.approvedBy?.lastName,
        ]
          .filter(Boolean)
          .join(" ");

        return {
          id: index + 1,
          assetNumber: item?.asset?.assetId || "--",
          assetName: item?.asset?.name || "--",
          category:
            item?.asset?.subCategory?.category?.categoryName ||
            item?.asset?.subCategory?.subCategoryName ||
            "--",
          brand: item?.asset?.brand || "--",
          assignedBy: assignedByName || "--",
          assignedTo: assignedToName || "--",
          fromDepartment: item?.fromDepartment?.name || "--",
          toDepartment: item?.toDepartment?.name || department?.name || "--",
          assignedDate: item?.updatedAt ? humanDate(item.updatedAt) : "--",
        };
      });


  return (
    <PageFrame>
      <AgTable
        key={tableData.length}
        search
        searchColumn={"assetNumber"}
        tableTitle={`${department?.name || "Department"} Assigned Asset List`}
        disabled={disabled}
        data={tableData}
        columns={assetColumns}
      />
    </PageFrame>
  );
};

export default DepartmentAssetCommon;