import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import AgTable from "../../components/AgTable";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import humanDate from "../../utils/humanDateForamt";

const DepartmentAssetCommon = ({ disabled }) => {
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

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
    //{ field: "assetNumber", headerName: "Asset Id", width: 130 },
    { field: "assetName", headerName: "Asset Name", minWidth: 160, flex: 1 },
    //{ field: "category", headerName: "Category", minWidth: 140, flex: 1 },
    //{ field: "brand", headerName: "Brand", minWidth: 120, flex: 1 },
    { field: "assignedBy", headerName: "Assigned By", minWidth: 170, flex: 1 },
    { field: "assignedTo", headerName: "Assigned To", minWidth: 170, flex: 1 },
    //{ field: "fromDepartment", headerName: "Assigned From", minWidth: 150, flex: 1 },
    //{ field: "toDepartment", headerName: "Assigned Department", minWidth: 170, flex: 1 },
    { field: "assignedDate", headerName: "Assigned Date", minWidth: 130, flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      cellRenderer: (params) => (
        <button
          type="button"
          className="text-subtitle cursor-pointer text-lg"
          title="View asset details"
          onClick={() => {
            setSelectedAsset(params.data);
            setViewModalOpen(true);
          }}
        >
          <MdOutlineRemoveRedEye />
        </button>
      ),
    },
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
          //requestId: item?._id || "-",
          //assetMongoId: item?.asset?._id || "-",
          assetNumber: item?.asset?.assetId || "-",
          assetName: item?.asset?.name || "-",
          serialNo: item?.asset?.serialNo || "-",
          model: item?.asset?.model || "-",
          category:
            item?.asset?.subCategory?.category?.categoryName ||
            item?.asset?.subCategory?.subCategoryName ||
            "-",
          subCategory: item?.asset?.subCategory?.subCategoryName || "-",
          brand: item?.asset?.brand || "-",
          status: item?.asset?.status || item?.status || "-",
          assignedBy: assignedByName || "-",
         // assignedByEmail: item?.approvedBy?.email || "-",
          assignedTo: assignedToName || "-",
         // assignedToEmail: item?.assignee?.email || "-",
          fromDepartment: item?.fromDepartment?.name || "-",
          toDepartment: item?.toDepartment?.name || department?.name || "-",
          assignedDate: item?.updatedAt ? humanDate(item.updatedAt) : "-",
          createdDate: item?.createdAt ? humanDate(item.createdAt) : "-",
          remarks: item?.remarks || "-",
        };
      });

  return (
    <PageFrame>
      <AgTable
        key={tableData.length}
        search
        searchColumn={"assetNumber"}
        tableTitle={`${department?.name || "Department"} Assigned Active Asset List`}
        disabled={disabled}
        data={tableData}
        columns={assetColumns}
      />
      <MuiModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedAsset(null);
        }}
        title="Asset Details"
      >
        <div className="space-y-3">
          <DetalisFormatted title="Sr No" detail={selectedAsset?.id || "--"} />
          {/* <DetalisFormatted
            title="Request Id"
            detail={selectedAsset?.requestId || "-"}
          />
          <DetalisFormatted
            title="Asset Mongo Id"
            detail={selectedAsset?.assetMongoId || "-"}
          /> */}
          <DetalisFormatted
            title="Asset Id"
            detail={selectedAsset?.assetNumber || "-"}
          />
          <DetalisFormatted
            title="Asset Name"
            detail={selectedAsset?.assetName || "-"}
          />
          <DetalisFormatted
            title="Category"
            detail={selectedAsset?.category || "-"}
          />
          <DetalisFormatted
            title="Sub Category"
            detail={selectedAsset?.subCategory || "-"}
          />
          <DetalisFormatted title="Brand" detail={selectedAsset?.brand || "-"} />
          <DetalisFormatted title="Model" detail={selectedAsset?.model || "-"} />
          <DetalisFormatted
            title="Serial No"
            detail={selectedAsset?.serialNo || "-"}
          />
          <DetalisFormatted
            title="Status"
            detail={selectedAsset?.status || "-"}
          />
          <DetalisFormatted
            title="Assigned By"
            detail={selectedAsset?.assignedBy || "-"}
          />
          {/* <DetalisFormatted
            title="Assigned By Email"
            detail={selectedAsset?.assignedByEmail || "-"}
          /> */}
          <DetalisFormatted
            title="Assigned To"
            detail={selectedAsset?.assignedTo || "-"}
          />
          {/* <DetalisFormatted
            title="Assigned To Email"
            detail={selectedAsset?.assignedToEmail || "-"}
          /> */}
          <DetalisFormatted
            title="Assigned From Department"
            detail={selectedAsset?.fromDepartment || "-"}
          />
          <DetalisFormatted
            title="Assigned Department"
            detail={selectedAsset?.toDepartment || "-"}
          />
          <DetalisFormatted
            title="Assigned Date"
            detail={selectedAsset?.assignedDate || "-"}
          />
          <DetalisFormatted
            title="Created Date"
            detail={selectedAsset?.createdDate || "-"}
          />
          <DetalisFormatted
            title="Remarks"
            detail={selectedAsset?.remarks || "-"}
          />
        </div>
      </MuiModal>
    </PageFrame>
  );
};

export default DepartmentAssetCommon;
// import { useQuery } from "@tanstack/react-query";
// import AgTable from "../../components/AgTable";
// import PageFrame from "../../components/Pages/PageFrame";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import usePageDepartment from "../../hooks/usePageDepartment";
// import humanDate from "../../utils/humanDateForamt";

// const DepartmentAssetCommon = (disabled) => {
//   const axios = useAxiosPrivate();
//   const department = usePageDepartment();

//   const { data: assignedAssets = [], isLoading } = useQuery({
//     queryKey: ["departmentAssignedAssets", department?._id],
//     enabled: Boolean(department?._id),
//     queryFn: async () => {
//       const response = await axios.get(
//         `/api/assets/get-asset-requests?toDepartment=${department._id}&status=Approved`
//       );
//       return response.data;
//     },
//   });

//   const assetColumns = [
//     { field: "id", headerName: "Sr No", width: 90 },
//     { field: "assetNumber", headerName: "Asset Id", width: 130 },
//     { field: "assetName", headerName: "Asset Name", minWidth: 160, flex: 1 },
//     //{ field: "category", headerName: "Category", minWidth: 140, flex: 1 },
//     //{ field: "brand", headerName: "Brand", minWidth: 120, flex: 1 },
//     { field: "assignedBy", headerName: "Assigned By", minWidth: 170, flex: 1 },
//     { field: "assignedTo", headerName: "Assigned To", minWidth: 170, flex: 1 },
//     //{ field: "fromDepartment", headerName: "Assigned From", minWidth: 150, flex: 1 },
//     //{ field: "toDepartment", headerName: "Assigned Department", minWidth: 170, flex: 1 },
//     { field: "assignedDate", headerName: "Assigned Date", minWidth: 130, flex: 1 },
//   ];

//   const tableData = isLoading
//     ? []
//      : assignedAssets
//       .filter(
//         (item) => item?.toDepartment?._id?.toString() === department?._id?.toString()
//       )
//       .map((item, index) => {
//         const assignedToName = [item?.assignee?.firstName, item?.assignee?.lastName]
//           .filter(Boolean)
//           .join(" ");
//         const assignedByName = [
//           item?.approvedBy?.firstName,
//           item?.approvedBy?.lastName,
//         ]
//           .filter(Boolean)
//           .join(" ");

//         return {
//           id: index + 1,
//           assetNumber: item?.asset?.assetId || "--",
//           assetName: item?.asset?.name || "--",
//           // category:
//           //   item?.asset?.subCategory?.category?.categoryName ||
//           //   item?.asset?.subCategory?.subCategoryName ||
//           //   "--",
//           // brand: item?.asset?.brand || "--",
//           assignedBy: assignedByName || "--",
//           assignedTo: assignedToName || "--", 
//           // fromDepartment: item?.fromDepartment?.name || "--",
//           // toDepartment: item?.toDepartment?.name || department?.name || "--",
//           assignedDate: item?.updatedAt ? humanDate(item.updatedAt) : "--",
//         };
//       });


//   return (
//     <PageFrame>
//       <AgTable
//         key={tableData.length}
//         search
//         searchColumn={"assetNumber"}
//         tableTitle={`${department?.name || "Department"} Assigned Asset List`}
//         disabled={disabled}
//         data={tableData}
//         columns={assetColumns}
//       />
//     </PageFrame>
//   );
// };

// export default DepartmentAssetCommon;