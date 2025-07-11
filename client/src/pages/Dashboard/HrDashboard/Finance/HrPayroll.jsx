import React from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, CircularProgress, selectClasses } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import AgTable from "../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useMutation, useQuery } from "@tanstack/react-query";
// import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
// import humanTime from "../../utils/humanTime";
// import DetalisFormatted from "../../../../components/DetalisFormatted";
// import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import MuiModal from "../../../../components/MuiModal";
import PageFrame from "../../../../components/Pages/PageFrame";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetSection from "../../../../components/WidgetSection";
import { toast } from "sonner";
import PayslipTemplate from "../../../../components/HrTemplate/PayslipTemplate";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import { queryClient } from "../../../../main";

const HrPayroll = () => {
  const navigate = useNavigate();

  const axios = useAxiosPrivate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payrollData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/payroll/get-payrolls");

        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      }
    },
  });

  const payrollColumn = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "empId", headerName: "Employee ID" },
    {
      field: "employeeName",
      headerName: "Employee Name",
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(
              `/app/dashboard/HR-dashboard/finance/payroll/${params.value}`,
              {
                state: {
                  empId: params.data.id,
                  month: params.data.month,
                  status: params.data.status,
                  employeeName: params.data.employeeName,
                  departmentName: params.data.departmentName,
                  employeeId: params.data.empId,
                  designation: params.data.designation,
                },
              }
            )
          }
        >
          {params.value}
        </span>
      ),
    },
    { field: "email", headerName: "Employee Email" },
    { field: "departmentName", headerName: "Department" },
    // { field: "designation", headerName: "Desig" },
    // { field: "month", headerName: "Date" },
    // { field: "role", headerName: "Role" },
    // { field: "time", headerName: "Time" },
    {
      field: "totalSalary",
      headerName: "Total Salary (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    // { field: "reimbursment", headerName: "Total Salary" },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => {
        const statusColorMap = {
          Completed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   cellRenderer: (params) => (
    //     <>
    //       <div className="p-2 mb-2 flex gap-2">
    //         <span className="text-primary hover:underline text-content cursor-pointer">
    //           View Details
    //         </span>
    //       </div>
    //     </>
    //   ),
    // },
    // {
    //   field: "actions",
    //   headerName: "Actions",

    //   cellRenderer: (params) => (
    //     <div className="p-2">
    //       <PrimaryButton
    //         title={"View"}
    //         handleSubmit={() => handleDetailsClick(params.data)}
    //       />
    //     </div>
    //   ),
    // },
  ];

const tableData = isLoading
  ? []
  : payrollData
      .map((item) => ({
        ...item,
        id: item.employeeId,
        employeeName: item.name,
        status: item.status,
        totalSalary: item.totalSalary,
        departmentName: item.departments?.map((item) => item.name).join(", ") || "N/A",
        monthDate: item.month,
        designation: item.role?.map((item) => item.roleTitle).join(", ") || "N/A",
      }))
      .sort((a, b) =>
        a.employeeName?.localeCompare(b.employeeName, undefined, {
          sensitivity: "base",
        })
      );


  console.log("des : ", tableData)

  const { mutate: payrollMutate, isPending: isPayrollPending } = useMutation({
    mutationKey: ["batchPayrollMutate"],
    mutationFn: async (data) => {
      setIsModalOpen(true);
      const response = await axios.post("/api/payroll/generate-payroll", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payrollData"] });
      toast.success(data.message || "BATCH SENT");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "BATCH FAILED");
      setIsModalOpen(false);
    },
  });
  const handleBatchAction = async (selectedRows) => {
    const preparedData = await Promise.all(
      selectedRows.map(async (item) => {
        const payload = {
          name: item.employeeName,
          userId: item.employeeId,
          email: item.email,
          month: item.month,
          totalSalary: item.totalSalary,
          deductions: item.deductions,
          departmentName: item.departmentName?.[0],
          empId: item.empId,
        };

        const html = ReactDOMServer.renderToStaticMarkup(
          <PayslipTemplate data={payload} />
        );

        const pdfBlob = await html2pdf()
          .set({
            margin: 10, // small margin is enough
            filename: `Payslip_${payload.userId}_${payload.month}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 }, // higher quality
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(html)
          .output("blob");

        return {
          ...payload,
          payslipPdf: new File(
            [pdfBlob],
            `Payslip_${payload.userId}_${payload.month}.pdf`,
            { type: "application/pdf" }
          ),
        };
      })
    );

    // ✅ Prepare FormData
    const formData = new FormData();

    const metadataArray = preparedData.map((entry) => {
      return {
        name: entry.name,
        userId: entry.userId,
        email: entry.email,
        month: entry.month,
        totalSalary: entry.totalSalary,
        deductions: entry.deductions || 0,
        departmentName: entry.departmentName,
        empId: entry.empId,
      };
    });

    // ✅ Append metadata as JSON stringified array
    formData.append("payrolls", JSON.stringify(metadataArray));

    // ✅ Append files in the same order
    preparedData.forEach((entry) => {
      formData.append("payslips", entry.payslipPdf);
    });

    // ✅ (Optional) Log to confirm
    for (let [key, value] of formData.entries()) {
      if (key === "metadata") {
      } else {
      }
    }

    // ✅ Trigger mutation
    payrollMutate(formData);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          search={true}
          dateColumn={"monthDate"}
          checkAll={true}
          checkbox
          isRowSelectable={(rowNode) => {
            const status = Array.isArray(rowNode.data.status)
              ? rowNode.data.status[0]
              : rowNode.data.status;
            return status !== "Completed";
          }}
          searchColumn={"Employee Name"}
          tableTitle={"Employee payroll"}
          handleBatchAction={handleBatchAction}
          batchButton={"Generate"}
          data={tableData}
          columns={payrollColumn}
          exportData={true}
        />
      </PageFrame>
      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Payslip Generation"}
      >
        <div className="h-36 flex justify-center items-center">
          <div className="flex flex-col gap-2 justify-center items-center">
            <CircularProgress />
            <span className="text-content">Generating Payslips....</span>
          </div>
        </div>
      </MuiModal>
    </div>
  );
};

export default HrPayroll;
