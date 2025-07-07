import { useLocation } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import humanDate from "../../../../utils/humanDateForamt";
import PageFrame from "../../../../components/Pages/PageFrame";

const ClientAgreementData = () => {
  const location = useLocation();

  // Fallbacks if state is missing or malformed
  const files = Array.isArray(location.state?.files)
    ? location.state.files
    : [];
  const name = location.state?.name || "Unknown";

  const columns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "document", headerName: "Document" },
    { field: "createdAt", headerName: "Created At" },
    { field: "updatedAt", headerName: "Updated At" },
    { field: "actions", headerName: "Actions" }, // Placeholder, if needed
  ];

  const tableData = files.map((item, index) => ({
    srNo: index + 1,
    document: item?.name || "Untitled Document",
    createdAt: item?.createdAt ? humanDate(item.createdAt) : "N/A",
    updatedAt: item?.updatedAt ? humanDate(item.updatedAt) : "N/A",
    actions: "-", // Add actual actions like view/download buttons here if needed
  }));

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          columns={columns}
          data={tableData}
          tableTitle={`AGREEMENTS -  ${name.toUpperCase()}`}
          hideFilter
        />
      </PageFrame>
    </div>
  );
};

export default ClientAgreementData;
