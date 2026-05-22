import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PageFrame from "./PageFrame";
import YearWiseTable from "../Tables/YearWiseTable";
import MuiModal from "../MuiModal";
import DetalisFormatted from "../DetalisFormatted";
import { inrFormat } from "../../utils/currencyFormat";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";

const MonthlyBudgetCommon = () => {
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const departmentId = department?._id;
  const [viewModal, setViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { data: allBudgets = [] } = useQuery({
    queryKey: ["monthlyBudgetReportByDepartment", departmentId],
    enabled: Boolean(departmentId),
    queryFn: async () => {
      const res = await axios.get(`/api/budget/company-budget?departmentId=${departmentId}`);
      return Array.isArray(res?.data?.allBudgets) ? res.data.allBudgets : [];
    },
  });


  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  const budgetOnlyData = useMemo(() => {
    if (!Array.isArray(allBudgets)) return [];

    return allBudgets.filter((item) => {
      const expenseType = String(item?.expanseType || "").trim().toLowerCase();
      return !(
        expenseType.includes("reimbursement") ||
        expenseType.includes("voucher")
      );
    });
  }, [allBudgets]);

  const rows = useMemo(
    () =>
      budgetOnlyData.map((item, index) => ({
        id: item?._id,
        srNo: index + 1,
       // section: "Billing / Budget Request / Department Invoice Budget",
        department: item?.department?.name || "-",
        expanseName: item?.expanseName || "-",
        expanseType: item?.expanseType || "-",
        paymentType: item?.paymentType || "-",
        projectedAmount: item?.projectedAmount || 0,
        actualAmount: item?.actualAmount || 0,
        unitName: item?.unit?.unitName || "-",
        unitNo: item?.unit?.unitNo || "-",
        buildingName: item?.unit?.building?.buildingName || "-",
        dueDate: item?.dueDate || null,
        invoiceName: item?.invoice?.name || "-",
        invoiceDate: item?.invoice?.date || null,
        invoiceLink: item?.invoice?.link || "-",
        status: item?.status || "-",
        isPaid: item?.status === "Approved" ? "Paid" : "Unpaid",
      })),
    [budgetOnlyData],
  );

  const columns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
   // { headerName: "Section", field: "section", flex: 1.6 },
    { headerName: "Department", field: "department", flex: 1,hide:true },
    { headerName: "Expense Name", field: "expanseName", flex: 1 },
    { headerName: "Expense Type", field: "expanseType", flex: 1 },
    { headerName: "Payment Type", field: "paymentType", flex: 1 ,hide:true},
    {
      headerName: "Projected Amount (INR)",
      field: "projectedAmount",
      flex: 1,
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      headerName: "Actual Amount (INR)",
      field: "actualAmount",
      flex: 1,
      valueFormatter: (params) => inrFormat(params.value),
    },
    { headerName: "Unit", field: "unitName", hide: true },
    { headerName: "Unit No", field: "unitNo", hide: true },
    { headerName: "Building", field: "buildingName", hide: true },
    { headerName: "Due Date", field: "dueDate", flex: 1 },
    { headerName: "Invoice Name", field: "invoiceName", flex: 1 ,hide:true},
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1,hide:true },
    {
      headerName: "Approval Status",
      field: "status",
      flex: 1,
      cellRenderer: (params) => {
        const status = String(params?.value || "-");
        const normalizedStatus = status.toLowerCase();
        const styleMap = {
          approved: { backgroundColor: "#DCFCE7", color: "#166534" },
          pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
          rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        };

        const chipStyle = styleMap[normalizedStatus] || {
          backgroundColor: "#F5F5F5",
          color: "#616161",
        };

        return <Chip label={status} size="small" sx={{ ...chipStyle }} />;
      },
    },
    // { headerName: "Paid Status", field: "isPaid", flex: 1 },
     {
      headerName: "Paid Status",
      field: "isPaid",
      flex:1,
      cellRenderer: (params) => {
        const statusColorMap = {
          Paid: { backgroundColor: "#28a745", color: "#fff" },
          Unpaid: { backgroundColor: "#dc3545", color: "#fff" },
        };

        const label = params.data?.isPaid === "Paid" ? "Paid" : "Unpaid";
        const { backgroundColor, color } =
          statusColorMap[label] || statusColorMap.Unpaid;

        return (
          <Chip
            label={label}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    { headerName: "Invoice Link", field: "invoiceLink", hide: true },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div className="p-2 flex gap-2 items-center">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => {
              setSelectedRow(params.data);
              setViewModal(true);
            }}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        {departmentId ? (
        <YearWiseTable
          data={rows}
          columns={columns}
          dropdownColumns={["department", "section"]}
         // tableTitle="Monthly Budget Report (Department-wise)"
          tableTitle={`${department?.name || "" } Department - Budget Reports`}
          search
          dateColumn="dueDate"
          formatDate
          tableHeight={480}
          exportData
        />
        ) : (
          <div className="text-red-500 text-sm font-medium">
            Department not found for logged-in user.
          </div>
        )}
      </PageFrame>

      {viewModal && selectedRow && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setSelectedRow(null);
          }}
           title={
            <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
              Department-Invoice Budget Summary
            </span>
          }
          //title="DEPARTMENT-INVOICE BUDGET SUMMARY"
        >
          <div className="space-y-3">
            <DetalisFormatted title="Department" detail={selectedRow.department} />
            <DetalisFormatted title="Expense Name" detail={selectedRow.expanseName} />
            <DetalisFormatted title="Expense Type" detail={selectedRow.expanseType} />
            <DetalisFormatted title="Payment Type" detail={selectedRow.paymentType} />
            <DetalisFormatted
              title="Projected Amount"
              detail={`INR ${Number(selectedRow.projectedAmount || 0).toLocaleString()}`}
            />
            <DetalisFormatted
              title="Actual Amount"
              detail={`INR ${Number(selectedRow.actualAmount || 0).toLocaleString()}`}
            />
            <DetalisFormatted title="Unit" detail={selectedRow.unitName} />
            <DetalisFormatted title="Unit No" detail={selectedRow.unitNo} />
            <DetalisFormatted title="Building" detail={selectedRow.buildingName} />
            <DetalisFormatted title="Due Date" detail={formatDate(selectedRow.dueDate)} />
            <DetalisFormatted title="Invoice Name" detail={selectedRow.invoiceName} />
            <DetalisFormatted title="Invoice Date" detail={formatDate(selectedRow.invoiceDate)} />
            <DetalisFormatted title="Approval Status" detail={selectedRow.status} />
            <DetalisFormatted title="Paid Status" detail={selectedRow.isPaid} />
            <DetalisFormatted
              title="Invoice File"
              detail={
                selectedRow.invoiceLink && selectedRow.invoiceLink !== "-" ? (
                  <a
                    href={selectedRow.invoiceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline"
                  >
                    {selectedRow.invoiceName || "View Invoice"}
                  </a>
                ) : (
                  "-"
                )
              }
            />
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default MonthlyBudgetCommon;


// import { useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Chip } from "@mui/material";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import PageFrame from "./PageFrame";
// import YearWiseTable from "../Tables/YearWiseTable";
// import MuiModal from "../MuiModal";
// import DetalisFormatted from "../DetalisFormatted";
// import { inrFormat } from "../../utils/currencyFormat";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import usePageDepartment from "../../hooks/usePageDepartment";

// const MonthlyBudgetCommon = () => {
//   const axios = useAxiosPrivate();
//   const department = usePageDepartment();
//   const departmentId = department?._id;
//   const [viewModal, setViewModal] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);

//   const { data: allBudgets = [] } = useQuery({
//     queryKey: ["monthlyBudgetReportByDepartment", departmentId],
//     enabled: Boolean(departmentId),
//     queryFn: async () => {
//       const res = await axios.get(`/api/budget/company-budget?departmentId=${departmentId}`);
//       return Array.isArray(res?.data?.allBudgets) ? res.data.allBudgets : [];
//     },
//   });


//   const formatDate = (value) => {
//     if (!value) return "-";
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return "-";
//     return date.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const rows = useMemo(
//     () =>
//       allBudgets.map((item, index) => ({
//         id: item?._id,
//         srNo: index + 1,
//       //  section: "Billing / Budget Request / Department Invoice Budget",
//         department: item?.department?.name || "-",
//         expanseName: item?.expanseName || "-",
//         expanseType: item?.expanseType || "-",
//         paymentType: item?.paymentType || "-",
//         projectedAmount: item?.projectedAmount || 0,
//         actualAmount: item?.actualAmount || 0,
//         unitName: item?.unit?.unitName || "-",
//         unitNo: item?.unit?.unitNo || "-",
//         buildingName: item?.unit?.building?.buildingName || "-",
//         dueDate: item?.dueDate || null,
//         invoiceName: item?.invoice?.name || "-",
//         invoiceDate: item?.invoice?.date || null,
//         invoiceLink: item?.invoice?.link || "-",
//         status: item?.status || "-",
//         isPaid: item?.isPaid || "Unpaid",
//       })),
//     [allBudgets],
//   );

//   const columns = [
//     { headerName: "Sr No", field: "srNo", width: 100 },
//     //{ headerName: "Section", field: "section", flex: 1.6 },
//     { headerName: "Department", field: "department", flex: 1 },
//     { headerName: "Expense Name", field: "expanseName", flex: 1 },
//     { headerName: "Expense Type", field: "expanseType", flex: 1 },
//     {
//       headerName: "Projected Amount (INR)",
//       field: "projectedAmount",
//       flex: 1,
//       valueFormatter: (params) => inrFormat(params.value),
//     },
//     {
//       headerName: "Actual Amount (INR)",
//       field: "actualAmount",
//       flex: 1,
//       valueFormatter: (params) => inrFormat(params.value),
//     },
//     { headerName: "Due Date", field: "dueDate", flex: 1 },
//     {
//       headerName: "Approval Status",
//       field: "status",
//       flex: 1,
//       cellRenderer: (params) => {
//         const status = String(params?.value || "-");
//         const normalizedStatus = status.toLowerCase();
//         const styleMap = {
//           approved: { backgroundColor: "#DCFCE7", color: "#166534" },
//           pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
//           rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
//         };

//         const chipStyle = styleMap[normalizedStatus] || {
//           backgroundColor: "#F5F5F5",
//           color: "#616161",
//         };

//         return <Chip label={status} size="small" sx={{ ...chipStyle }} />;
//       },
//     },
//        {
//       headerName: "Paid Status",
//       field: "isPaid",
//       flex:1,
//       cellRenderer: (params) => {
//         const statusColorMap = {
//           Paid: { backgroundColor: "#28a745", color: "#fff" },
//           Unpaid: { backgroundColor: "#dc3545", color: "#fff" },
//         };

//         const label = params.data?.isPaid === "Paid" ? "Paid" : "Unpaid";
//         const { backgroundColor, color } =
//           statusColorMap[label] || statusColorMap.Unpaid;

//         return (
//           <Chip
//             label={label}
//             style={{
//               backgroundColor,
//               color,
//             }}
//           />
//         );
//       },
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       pinned: "right",
//       cellRenderer: (params) => (
//         <div className="p-2 flex gap-2 items-center">
//           <span
//             className="text-subtitle cursor-pointer"
//             onClick={() => {
//               setSelectedRow(params.data);
//               setViewModal(true);
//             }}
//           >
//             <MdOutlineRemoveRedEye />
//           </span>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-4">
//       <PageFrame>
//         {departmentId ? (
//         <YearWiseTable
//           data={rows}
//           columns={columns}
//           dropdownColumns={["department", "section"]}
//           // tableTitle="Monthly Budget Report (Department-wise)"
//           tableTitle={`${department?.name || ""
//               } Department - Budget Reports`}
//           search
//           dateColumn="dueDate"
//           formatDate
//           tableHeight={480}
//         />
//         ) : (
//           <div className="text-red-500 text-sm font-medium">
//             Department not found for logged-in user.
//           </div>
//         )}
//       </PageFrame>

//       {viewModal && selectedRow && (
//         <MuiModal
//           open={viewModal}
//           onClose={() => {
//             setViewModal(false);
//             setSelectedRow(null);
//           }}
//           //title="DEPARTMENT-INVOICE BUDGET SUMMARY"
//            title={
//             <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
//               Department-Invoice Budget Summary
//             </span>
//           }
//         >
//           <div className="space-y-3">
//             <DetalisFormatted title="Department" detail={selectedRow.department} />
//             <DetalisFormatted title="Expense Name" detail={selectedRow.expanseName} />
//             <DetalisFormatted title="Expense Type" detail={selectedRow.expanseType} />
//             <DetalisFormatted title="Payment Type" detail={selectedRow.paymentType} />
//             <DetalisFormatted
//               title="Projected Amount"
//               detail={`INR ${Number(selectedRow.projectedAmount || 0).toLocaleString()}`}
//             />
//             <DetalisFormatted
//               title="Actual Amount"
//               detail={`INR ${Number(selectedRow.actualAmount || 0).toLocaleString()}`}
//             />
//             <DetalisFormatted title="Unit" detail={selectedRow.unitName} />
//             <DetalisFormatted title="Unit No" detail={selectedRow.unitNo} />
//             <DetalisFormatted title="Building" detail={selectedRow.buildingName} />
//             <DetalisFormatted title="Due Date" detail={formatDate(selectedRow.dueDate)} />
//             <DetalisFormatted title="Invoice Name" detail={selectedRow.invoiceName} />
//             <DetalisFormatted title="Invoice Date" detail={formatDate(selectedRow.invoiceDate)} />
//             <DetalisFormatted title="Approval Status" detail={selectedRow.status} />
//             <DetalisFormatted title="Paid Status" detail={selectedRow.isPaid} />
//             <DetalisFormatted
//               title="Invoice File"
//               detail={
//                 selectedRow.invoiceLink && selectedRow.invoiceLink !== "-" ? (
//                   <a
//                     href={selectedRow.invoiceLink}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-blue-700 underline"
//                   >
//                     {selectedRow.invoiceName || "View Invoice"}
//                   </a>
//                 ) : (
//                   "-"
//                 )
//               }
//             />
//           </div>
//         </MuiModal>
//       )}
//     </div>
//   );
// };

// export default MonthlyBudgetCommon;

// import { useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Chip } from "@mui/material";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import PageFrame from "./PageFrame";
// import YearWiseTable from "../Tables/YearWiseTable";
// import MuiModal from "../MuiModal";
// import DetalisFormatted from "../DetalisFormatted";
// import { inrFormat } from "../../utils/currencyFormat";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import usePageDepartment from "../../hooks/usePageDepartment";

// const MonthlyBudgetCommon = () => {
//   const axios = useAxiosPrivate();
//   const department = usePageDepartment();
//   const departmentId = department?._id;
//   const [viewModal, setViewModal] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);

//   const { data: allBudgets = [] } = useQuery({
//     queryKey: ["monthlyBudgetReportByDepartment", departmentId],
//     enabled: Boolean(departmentId),
//     queryFn: async () => {
//       const res = await axios.get(`/api/budget/company-budget?departmentId=${departmentId}`);
//       return Array.isArray(res?.data?.allBudgets) ? res.data.allBudgets : [];
//     },
//   });


//   const formatDate = (value) => {
//     if (!value) return "-";
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return "-";
//     return date.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const rows = useMemo(
//     () =>
//       allBudgets.map((item, index) => ({
//         id: item?._id,
//         srNo: index + 1,
//         section: "Billing / Budget Request / Department Invoice Budget",
//         department: item?.department?.name || "-",
//         expanseName: item?.expanseName || "-",
//         expanseType: item?.expanseType || "-",
//         paymentType: item?.paymentType || "-",
//         projectedAmount: item?.projectedAmount || 0,
//         actualAmount: item?.actualAmount || 0,
//         unitName: item?.unit?.unitName || "-",
//         unitNo: item?.unit?.unitNo || "-",
//         buildingName: item?.unit?.building?.buildingName || "-",
//         dueDate: item?.dueDate || null,
//         invoiceName: item?.invoice?.name || "-",
//         invoiceDate: item?.invoice?.date || null,
//         invoiceLink: item?.invoice?.link || "-",
//         status: item?.status || "-",
//         isPaid: item?.isPaid || "Unpaid",
//       })),
//     [allBudgets],
//   );

//   const columns = [
//     { headerName: "Sr No", field: "srNo", width: 100 },
//     { headerName: "Section", field: "section", flex: 1.6 },
//     { headerName: "Department", field: "department", flex: 1 },
//     { headerName: "Expense Name", field: "expanseName", flex: 1 },
//     { headerName: "Expense Type", field: "expanseType", flex: 1 },
//     {
//       headerName: "Projected Amount (INR)",
//       field: "projectedAmount",
//       flex: 1,
//       valueFormatter: (params) => inrFormat(params.value),
//     },
//     {
//       headerName: "Actual Amount (INR)",
//       field: "actualAmount",
//       flex: 1,
//       valueFormatter: (params) => inrFormat(params.value),
//     },
//     { headerName: "Due Date", field: "dueDate", flex: 1 },
//     {
//       headerName: "Approval Status",
//       field: "status",
//       flex: 1,
//       cellRenderer: (params) => {
//         const status = String(params?.value || "-");
//         const normalizedStatus = status.toLowerCase();
//         const styleMap = {
//           approved: { backgroundColor: "#DCFCE7", color: "#166534" },
//           pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
//           rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
//         };

//         const chipStyle = styleMap[normalizedStatus] || {
//           backgroundColor: "#F5F5F5",
//           color: "#616161",
//         };

//         return <Chip label={status} size="small" sx={{ ...chipStyle }} />;
//       },
//     },
//     { headerName: "Paid Status", field: "isPaid", flex: 1 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       pinned: "right",
//       cellRenderer: (params) => (
//         <div className="p-2 flex gap-2 items-center">
//           <span
//             className="text-subtitle cursor-pointer"
//             onClick={() => {
//               setSelectedRow(params.data);
//               setViewModal(true);
//             }}
//           >
//             <MdOutlineRemoveRedEye />
//           </span>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-4">
//       <PageFrame>
//         {departmentId ? (
//         <YearWiseTable
//           data={rows}
//           columns={columns}
//           dropdownColumns={["department", "section"]}
//           tableTitle="Monthly Budget Report (Department-wise)"
//           search
//           dateColumn="dueDate"
//           formatDate
//           exportData
//           tableHeight={480}
//         />
//         ) : (
//           <div className="text-red-500 text-sm font-medium">
//             Department not found for logged-in user.
//           </div>
//         )}
//       </PageFrame>

//       {viewModal && selectedRow && (
//         <MuiModal
//           open={viewModal}
//           onClose={() => {
//             setViewModal(false);
//             setSelectedRow(null);
//           }}
//           title="DEPARTMENT-INVOICE BUDGET SUMMARY"
//         >
//           <div className="space-y-3">
//             <DetalisFormatted title="Department" detail={selectedRow.department} />
//             <DetalisFormatted title="Expense Name" detail={selectedRow.expanseName} />
//             <DetalisFormatted title="Expense Type" detail={selectedRow.expanseType} />
//             <DetalisFormatted title="Payment Type" detail={selectedRow.paymentType} />
//             <DetalisFormatted
//               title="Projected Amount"
//               detail={`INR ${Number(selectedRow.projectedAmount || 0).toLocaleString()}`}
//             />
//             <DetalisFormatted
//               title="Actual Amount"
//               detail={`INR ${Number(selectedRow.actualAmount || 0).toLocaleString()}`}
//             />
//             <DetalisFormatted title="Unit" detail={selectedRow.unitName} />
//             <DetalisFormatted title="Unit No" detail={selectedRow.unitNo} />
//             <DetalisFormatted title="Building" detail={selectedRow.buildingName} />
//             <DetalisFormatted title="Due Date" detail={formatDate(selectedRow.dueDate)} />
//             <DetalisFormatted title="Invoice Name" detail={selectedRow.invoiceName} />
//             <DetalisFormatted title="Invoice Date" detail={formatDate(selectedRow.invoiceDate)} />
//             <DetalisFormatted title="Approval Status" detail={selectedRow.status} />
//             <DetalisFormatted title="Paid Status" detail={selectedRow.isPaid} />
//             <DetalisFormatted
//               title="Invoice File"
//               detail={
//                 selectedRow.invoiceLink && selectedRow.invoiceLink !== "-" ? (
//                   <a
//                     href={selectedRow.invoiceLink}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-blue-700 underline"
//                   >
//                     {selectedRow.invoiceName || "View Invoice"}
//                   </a>
//                 ) : (
//                   "-"
//                 )
//               }
//             />
//           </div>
//         </MuiModal>
//       )}
//     </div>
//   );
// };

// export default MonthlyBudgetCommon;