import React from "react";
import AgTable from "../../components/AgTable";

const DepartmentReportCommon = () => {
  const DepartmentReportCommons = [
    { field: "srNo", headerName: "S.No.", flex:0.5},
    { field: "reportName", headerName: "Report Name", flex: 1 },
    { field: "status", headerName: "Status", flex:1 },
    { field: "date", headerName: "Date", flex:1 },
    { field: "lastModified", headerName: "Last Modified", flex:1 },
    { field: "download", headerName: "Download", flex:1 },
  ];

  return (
    <div className="bg-white min-h-full p-4">
      <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm">
        <AgTable
          title="Finance Department Report"
          data={[]}
          columns={DepartmentReportCommons}
          search={true}
        />
      </div>
    </div>
  );
};

export default DepartmentReportCommon;


// import React from "react";
// import AgTable from "../../components/AgTable";

// const DepartmentReportCommon = () => {
//   const financeDepartmentColumns = [
//     { field: "srNo", headerName: "S.No.", maxWidth: 90 },
//     { field: "reportName", headerName: "Report Name", flex: 1 },
//     { field: "status", headerName: "Status", maxWidth: 180 },
//     { field: "date", headerName: "Date", maxWidth: 180 },
//     { field: "lastModified", headerName: "Last Modified", flex: 1 },
//     { field: "download", headerName: "Download", maxWidth: 140 },
//   ];

//   return (
//     <div className="bg-white min-h-full p-4">
//       <div className="py-4 border-b-default border-borderGray mb-6">
//         <h1 className="text-title text-primary font-pmedium">
//           Finance Department Report
//         </h1>
//       </div>
//       <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm">
//         <AgTable
//           title="Finance Department Report"
//           data={[]}
//           columns={financeDepartmentColumns}
//         //  hideTitle
//           search={false}
//         />
//       </div>
//     </div>
//   );
// };

// export default DepartmentReportCommon;


// import React from "react";
// import AgTable from "../../../components/AgTable";

// const FinanceReports = () => {
//   const financeDepartmentColumns = [
//     { field: "srNo", headerName: "S.No.", maxWidth: 90 },
//     { field: "reportName", headerName: "Report Name", flex: 1 },
//     { field: "status", headerName: "Status", maxWidth: 180 },
//     { field: "date", headerName: "Date", maxWidth: 180 },
//     { field: "lastModified", headerName: "Last Modified", flex: 1 },
//     { field: "download", headerName: "Download", maxWidth: 140 },
//   ];

//   return (
//     <div className="bg-white min-h-full p-4">
//       <div className="py-4 border-b-default border-borderGray mb-6">
//         <h1 className="text-title text-primary font-pmedium">
//           Finance Department Report
//         </h1>
//       </div>

//       <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm">
//         <AgTable data={[]} columns={financeDepartmentColumns} hideTitle search={false} />
//       </div>
//     </div>
//   );
// };

// export default FinanceReports;
