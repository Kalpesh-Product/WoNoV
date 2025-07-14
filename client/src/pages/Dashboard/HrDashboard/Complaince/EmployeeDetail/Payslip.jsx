import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import useAuth from "../../../../../hooks/useAuth";
import YearWiseTable from "../../../../../components/Tables/YearWiseTable";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import PageFrame from "../../../../../components/Pages/PageFrame";

const HrCommonPayslips = () => {
  const employmentID = useSelector((state) => state.hr.selectedEmployeeMongoId);
  console.log(employmentID);
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const { data = [], isLoading } = useQuery({
    queryKey: ["payslips"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/payslip/get-payslips/${employmentID}`
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
      flex: 1,
      cellRenderer: (params) =>
        params.value
          ? new Date(params.value).toLocaleDateString("default", {
              month: "long",
              year: "numeric",
            })
          : "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
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
            className="text-primary hover:underline text-content cursor-pointer"
          >
            View Payslip
          </span>
        </div>
      ),
    },
  ];

  const tableData = Array.isArray(data)
    ? data.map((item, index) => ({
        id: item._id || index,
        month: item.month,
        payslipLink: item.payslipLink,
        srNo: index + 1,
      }))
    : [];

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
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
      </PageFrame>
    </div>
  );
};

export default HrCommonPayslips;
