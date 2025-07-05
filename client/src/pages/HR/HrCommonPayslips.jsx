import React from "react";
import AgTable from "../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import { toast } from "sonner";
import humanDate from "../../utils/humanDateForamt";

const HrCommonPayslips = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const { data = [], isLoading } = useQuery({
    queryKey: ["payslips"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/payslip/get-payslips/${auth?.user?._id}`
        );
        return response.data || [];
      } catch (error) {
        console.warn("Failed to fetch payslips:", error.message);
        return []; // fallback return to avoid crashes
      }
    },
  });

  const payslipColumns = [
    { field: "srNo", headerName: "SrNo", width: 100 },
    {
      field: "month",
      headerName: "Month",

      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            const link = params.data?.payslipLink;
            if (link) {
              window.open(link, "_blank");
            } else {
              toast.error("No payslip link available.");
            }
          }}
          className="text-primary underline text-content cursor-pointer"
        >
          {new Date(params.value).toLocaleDateString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
      ),
    },
    { field: "basicPay", headerName: "Basic Pay", flex: 1 },
    { field: "hra", headerName: "HRA", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
  ];

  const tableData = Array.isArray(data)
    ? data.map((item, index) => ({
        ...item,
        id: item._id || index,
        month: item.month,
        payslipLink: item.payslipLink,
        srNo: index + 1,
        basicPay: item.earnings?.basicPay,
        hra: item.earnings?.hra,
      }))
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <YearWiseTable
          key={tableData.length}
          search={true}
          tableHeight={300}
          searchColumn={"month"}
          tableTitle={"Payslips"}
          data={tableData}
          columns={payslipColumns}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default HrCommonPayslips;
