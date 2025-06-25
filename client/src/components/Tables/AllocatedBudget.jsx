import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import {
  Tabs,
  Tab,
  CircularProgress,
  TextField,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { inrFormat } from "../../utils/currencyFormat";
import PrimaryButton from "../PrimaryButton";
import AgTable from "../AgTable";
import { parseAmount } from "../../utils/parseAmount";
import {
  MdNavigateBefore,
  MdNavigateNext,
  MdOutlineSkipNext,
} from "react-icons/md";
import WidgetSection from "../WidgetSection";
import MuiModal from "../MuiModal"; // if not already
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import UploadImageInput from "../UploadFileInput";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../main";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import UploadFileInput from "../UploadFileInput";
import usePageDepartment from "../../hooks/usePageDepartment";

const AllocatedBudget = ({
  financialData,
  isLoading,
  variant,
  hideTitle,
  noInvoice = false,
  noFilter = false,
  annaualExpense = false,
  newTitle
}) => {
  const axios = useAxiosPrivate();
  const [selectedTab, setSelectedTab] = useState(0);
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];
  const [selectedFYIndex, setSelectedFYIndex] = useState(0);
  const selectedFY = fiscalYears[selectedFYIndex];
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      invoiceImage: null,
    },
  });

  const department = usePageDepartment();
  const onUpload = (data, row) => {
    const file = data.invoiceImage;

    if (!file || !row?.id) {
      toast.error("Missing file or selected row.");
      return;
    }

    const formData = new FormData();
    formData.append("invoice", file);
    formData.append("rowId", row.id);
    formData.append("departmentName", department?.name || ""); // ✅ append it here

    uploadInvoiceMutation(formData); // ✅ pass just FormData
  };

  const { mutate: uploadInvoiceMutation, isPending: isUploadPending } =
    useMutation({
      mutationFn: async (formData) => {
        const rowId = formData.get("rowId");
        formData.delete("rowId"); // optional
        const response = await axios.patch(
          `/api/budget/upload-budget-invoice/${rowId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      },

      onSuccess: (data) => {
        toast.success(data.message || "BUDGET UPDATED");
        reset();
        setUploadModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["financeBudget"] });
      },
      onError: (error) => {
        toast.error("Failed to upload invoice.");
        console.error(error);
      },
    });

  const allTypes = useMemo(() => {
    const types = new Set();
    financialData?.forEach((item) => {
      item.tableData?.rows?.forEach((row) => {
        types.add(row.expanseType || "Unknown");
      });
    });
    return ["All", ...Array.from(types)];
  }, [financialData]);

  const allMonths = useMemo(() => {
    const set = new Set(financialData?.map((item) => item.month));
    return Array.from(set).sort((a, b) => new Date(a) - new Date(b));
  }, [financialData]);

  const filteredMonths = useMemo(() => {
    const yearRanges = {
      "FY 2024-25": [new Date("2024-03-01"), new Date("2025-03-31")],
      "FY 2025-26": [new Date("2025-03-01"), new Date("2026-03-31")],
    };
    const [start, end] = yearRanges[selectedFY];
    return allMonths.filter((month) => {
      const date = new Date(month);
      return date >= start && date <= end;
    });
  }, [allMonths, selectedFY]);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const groupedData = useMemo(() => {
    const result = {};
    (noFilter ? ["All"] : allTypes).forEach((type) => {
      result[type] = {};
      allMonths.forEach((month) => {
        const monthData = financialData.find((fd) => fd.month === month);
        const rows =
          noFilter || type === "All"
            ? monthData?.tableData?.rows || []
            : monthData?.tableData?.rows?.filter(
                (r) => (r.expanseType || "Unknown") === type
              ) || [];

        const projectedAmount = rows.reduce(
          (sum, r) =>
            sum + Number((r.projectedAmount || "0").replace(/,/g, "")),
          0
        );
        const actualAmount = rows.reduce(
          (sum, r) => sum + (parseAmount(r.actualAmount) || 0),
          0
        );

        result[type][month] = {
          month,
          projectedAmount,
          amount: inrFormat(actualAmount),
          tableData: {
            columns: monthData?.tableData?.columns || [],
            rows,
          },
        };
      });
    });
    return result;
  }, [financialData, allTypes, allMonths, noFilter]);

  const monthDataForSelectedType = useMemo(() => {
    const currentType = noFilter ? "All" : allTypes[selectedTab];
    const currentMonth = filteredMonths[selectedMonthIndex];
    const data = groupedData[currentType]?.[currentMonth];

    return {
      month: currentMonth,
      monthFormatted: dayjs(currentMonth).format("MMMM YYYY"),
      rows: data?.tableData?.rows || [],
      columns: data?.tableData?.columns || [],
    };
  }, [
    filteredMonths,
    selectedMonthIndex,
    groupedData,
    allTypes,
    selectedTab,
    noFilter,
  ]);

  // const totalProjectedAmountForFY = useMemo(() => {
  //   return filteredMonths.reduce((sum, month) => {
  //     const data = groupedData["All"]?.[month];
  //     return sum + (data?.projectedAmount || 0);
  //   }, 0);
  // }, [filteredMonths, groupedData]);

  const totalProjectedAmountForFY = useMemo(() => {
    const data = groupedData["All"]?.[filteredMonths[selectedMonthIndex]];
    return data?.projectedAmount || 0;
  }, [filteredMonths, selectedMonthIndex, groupedData]);

  const enhancedColumns = useMemo(() => {
    const baseColumns = [...monthDataForSelectedType.columns];

    // if (!noInvoice) {
    //   baseColumns.push({
    //     field: "actions",
    //     headerName: "Actions",
    //     pinned: "right",
    //     cellRenderer: (params) => {
    //       const invoiceAttached =
    //         params.data.invoiceAttached === true ||
    //         params.data.invoiceAttached === "true";
    //       const status = params.data.status;

    //       const isApproved = status === "Approved";
    //       const isRejected = status === "Rejected";

    //       return (
    //         <div className="p-2">
    //           {isApproved && !invoiceAttached ? (
    //             <PrimaryButton
    //               title="Upload Invoice"
    //               externalStyles="p-2"
    //               handleSubmit={() => {
    //                 setSelectedRow(params.data);
    //                 setUploadModalOpen(true);
    //               }}
    //             />
    //           ) : (
    //             <span className="text-content">
    //               {invoiceAttached
    //                 ? "Invoice Uploaded"
    //                 : isRejected
    //                 ? "Rejected"
    //                 : ""}
    //             </span>
    //           )}
    //         </div>
    //       );
    //     },
    //   });
    // }

    return baseColumns;
  }, [monthDataForSelectedType.columns, noInvoice]);


  if (isLoading) return <CircularProgress />;

  return (
    <>
      <WidgetSection
        title={annaualExpense ? "Annual Expenses" : newTitle ? newTitle :"BIZ Nest DEPARTMENT WISE EXPENSE DETAILS" }
        TitleAmount={`INR ${inrFormat(totalProjectedAmountForFY)}`}
        border>
        <div className="flex flex-col gap-4 rounded-md ">
          {!hideTitle ? (
            <div className="flex justify-between items-center">
            </div>
          ) : (
            ""
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="w-1/3">
            </div>
            <div className="flex gap-4 justify-start items-center w-full ">
              <div className="">
                {/* Month Switcher */}
                {filteredMonths.length > 0 && (
                  <div className="flex gap-4 items-center">
                    <PrimaryButton
                      title={<MdNavigateBefore />}
                      handleSubmit={() =>
                        setSelectedMonthIndex((prev) => Math.max(prev - 1, 0))
                      }
                      disabled={selectedMonthIndex === 0}
                    />
                    <span className="text-body font-pmedium uppercase">
                      {monthDataForSelectedType.monthFormatted}
                    </span>
                    <PrimaryButton
                      title={<MdNavigateNext />}
                      handleSubmit={() =>
                        setSelectedMonthIndex((prev) =>
                          Math.min(prev + 1, filteredMonths.length - 1)
                        )
                      }
                      disabled={
                        selectedMonthIndex === filteredMonths.length - 1
                      }
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-4 items-center">
                <PrimaryButton
                  title={<MdNavigateBefore />}
                  handleSubmit={() =>
                    setSelectedFYIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={selectedFYIndex === 0}
                />
                <span className="text-body font-pmedium">{selectedFY}</span>
                <PrimaryButton
                  title={<MdNavigateNext />}
                  handleSubmit={() =>
                    setSelectedFYIndex((prev) =>
                      Math.min(prev + 1, fiscalYears.length - 1)
                    )
                  }
                  disabled={selectedFYIndex === fiscalYears.length - 1}
                />
              </div>
            </div>
          </div>
          <hr className="mt-4" />

          {/* AgTable */}
          {monthDataForSelectedType.rows.length > 0 ? (
            <div className="h-full">
              <AgTable
                search
                data={monthDataForSelectedType.rows}
                columns={enhancedColumns}
                tableHeight={350}
              />
            </div>
          ) : (
            <div className="h-96 flex justify-center items-center text-muted">
              {/* No data available for this category in{" "}
              {monthDataForSelectedType.monthFormatted} */}
              No data available
            </div>
          )}
        </div>
      </WidgetSection>

      <MuiModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Invoice">
        <form
          onSubmit={handleSubmit((data) => onUpload(data, selectedRow))}
          className="space-y-4">
          <Controller
            name="invoiceImage"
            control={control}
            render={({ field }) => (
              <UploadFileInput
                value={field.value}
                onChange={field.onChange}
                allowedExtensions={["pdf"]}
                previewType="pdf"
              />
            )}
          />
          <div className="text-right">
            <PrimaryButton
              title="Submit"
              type="submit"
              isLoading={isUploadPending}
              disabled={isUploadPending}
            />
          </div>
        </form>
      </MuiModal>
    </>
  );
};

export default AllocatedBudget;
