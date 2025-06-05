import React from "react";
import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";

const DirectorData = () => {
  const location = useLocation();
  const { id } = useParams();
  const files = location.state?.files || [];
  const name = location.state?.name || "N/A";

  

const fileRows = files.map((file, index) => ({
  srno: index + 1,
  label: file.label,
  link: file.link,
  uploadedDate: file.uploadedDate,
  lastModified: file.lastModified,
}));


const columns = [
  { field: "srno", headerName: "Sr No", width: 100 },
  { field: "label", headerName: "Document", flex: 1 },
  {
    field: "uploadedDate",
    headerName: "Uploaded Date",
    flex: 1,
    cellRenderer: (params) => new Date(params.value).toLocaleDateString("en-GB"),
  },
  {
    field: "lastModified",
    headerName: "Last Modified",
    flex: 1,
    cellRenderer: (params) => new Date(params.value).toLocaleDateString("en-GB"),
  },
  {
    field: "link",
    headerName: "View Link",
    flex: 1,
    cellRenderer: (params) => (
   <span className="text-primary underline cursor-pointer">View</span>
    ),
  },
];


  return (
    <div className="p-4 space-y-4">
      <AgTable
        columns={columns}
        data={fileRows}
        tableTitle={`KYC Documents of ${name}`}
        tableHeight={300}
        hideFilter
        search={files.length >= 10}
      />
    </div>
  );
};

export default DirectorData;
