import React from "react";
import LayerBarGraph from "../../../../components/graphs/LayerBarGraph";
import dayjs from "dayjs";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import DataCard from "../../../../components/DataCard";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MuiModal from "../../../../components/MuiModal";
import {
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";


const SalesBudget = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      amount: "",
      dueDate: null,
    },
  });

  const onSubmit = (data) => {
    setOpenModal(false);
    toast.success("Budget requested successfully");
    reset();
  };


  const { data: hrFinance = [] } = useQuery({
    queryKey: ["hrFinance"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bab9e469e809084e249e
            `
        );
        return response.data.allBudgets;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

  // Data for the chart
  const utilisedData = [
    7500000, 8200000, 6900000, 8800000, 9200000, 6100000,
    7300000, 8100000, 7700000, 9400000, 6600000, 8500000,
  ];

  const maxBudget = [
    8000000, 9000000, 7000000, 9500000, 8800000, 6300000,
    7900000, 8700000, 7600000, 9900000, 7100000, 8900000,
  ];

  // Data array for rendering the Accordion
  //   const financialData = [
  //     {
  //       month: "April 2024",
  //       projectedAmount: 18000,
  //       amount: "15000",
  //       tableData: {
  //         columns: [
  //           { field: "srNo", headerName: "SR NO", flex: 1 },
  //           { field: "category", headerName: "Category", flex: 1 },
  //           { field: "expenseName", headerName: "Expense", flex: 1 },
  //           { field: "dueDate", headerName: "Due Date", flex: 1 },
  //           { field: "amount", headerName: "Amount", flex: 1 },
  //           { field: "status", headerName: "Status", flex: 1 },
  //         ],
  //         rows: [
  //           {
  //             srNo: 1,
  //             category: "Hosting",
  //             expenseName: "Hosting Fee",
  //             amount: "2500",
  //             dueDate: "2024-04-10",
  //             status: "Paid",
  //           },
  //           {
  //             srNo: 2,
  //             category: "Domain",
  //             expenseName: "Domain Renewal",
  //             amount: "1500",
  //             dueDate: "2024-04-12",
  //             status: "Pending",
  //           },
  //           {
  //             srNo: 3,
  //             category: "Software",
  //             expenseName: "SaaS Subscription",
  //             amount: "4500",
  //             dueDate: "2024-04-15",
  //             status: "Paid",
  //           },
  //           {
  //             srNo: 4,
  //             category: "Marketing",
  //             expenseName: "Ad Campaign",
  //             amount: "3500",
  //             dueDate: "2024-04-20",
  //             status: "Paid",
  //           },
  //           {
  //             srNo: 5,
  //             category: "Office",
  //             expenseName: "Printer Paper",
  //             amount: "300",
  //             dueDate: "2024-04-22",
  //             status: "Paid",
  //           },
  //           {
  //             srNo: 6,
  //             category: "Utilities",
  //             expenseName: "Water Supply",
  //             amount: "200",
  //             dueDate: "2024-04-24",
  //             status: "Paid",
  //           },
  //           {
  //             srNo: 7,
  //             category: "Software",
  //             expenseName: "Bug Tracking Tool",
  //             amount: "1000",
  //             dueDate: "2024-04-25",
  //             status: "Pending",
  //           },
  //           {
  //             srNo: 8,
  //             category: "Salaries",
  //             expenseName: "Part-time Developer",
  //             amount: "3000",
  //             dueDate: "2024-04-26",
  //             status: "Paid",
  //           },
  //           {
  //             srNo: 9,
  //             category: "Marketing",
  //             expenseName: "Design Templates",
  //             amount: "500",
  //             dueDate: "2024-04-28",
  //             status: "Paid",
  //           },
  //           {
  //             srNo: 10,
  //             category: "Office",
  //             expenseName: "Cleaning Supplies",
  //             amount: "400",
  //             dueDate: "2024-04-30",
  //             status: "Pending",
  //           },
  //         ],
  //       },
  //     },
  //     // Same structure to be repeated for May–August with unique data.
  //   ];


  // const transformedFinancialData = financialData.map((data) => {
  //   const transformedRows = data.tableData.rows.map((row, index) => ({
  //     srNo: index + 1,
  //     category: row.category,
  //     expenseName: row.expenseName,
  //     amount: Number(row.amount).toLocaleString("en-IN", {
  //       minimumFractionDigits: 0
  //     }),
  //     dueDate: dayjs(row.dueDate).format("DD-MM-YYYY"),
  //     status: row.status,
  //   }));

  //   return {
  //     ...data,
  //     projectedAmount: Number(data.projectedAmount).toLocaleString("en-IN", {
  //       minimumFractionDigits: 0,
  //       maximumFractionDigits: 2,
  //     }),
  //     amount: Number(data.amount).toLocaleString("en-IN", {
  //       minimumFractionDigits: 0,
  //       maximumFractionDigits: 2,
  //     }),
  //     tableData: {
  //       columns: data.tableData.columns,
  //       rows: transformedRows,
  //     },
  //   };
  // });

  const groupedData = hrFinance.reduce((acc, item) => {
    const month = dayjs(item.dueDate).format("MMM-YYYY"); // Extracting month and year

    if (!acc[month]) {
      acc[month] = {
        month,
        latestDueDate: item.dueDate, // Store latest due date for sorting
        projectedAmount: 0,
        amount: 0,
        tableData: {
          rows: [],
          columns: [
            { field: "expanseName", headerName: "Expense Name", flex: 1 },
            // { field: "department", headerName: "Department", flex: 200 },
            { field: "expanseType", headerName: "Expense Type", flex: 1 },
            { field: "projectedAmount", headerName: "Amount", flex: 1 },
            { field: "dueDate", headerName: "Due Date", flex: 1 },
            { field: "status", headerName: "Status", flex: 1 },
          ],
        },
      };
    }

    acc[month].projectedAmount += item.projectedAmount; // Summing the total projected amount per month
    acc[month].amount += item.projectedAmount; // Summing the total amount per month
    acc[month].tableData.rows.push({
      id: item._id,
      expanseName: item.expanseName,
      department: item.department,
      expanseType: item.expanseType,
      projectedAmount: item.projectedAmount.toFixed(2), // Ensuring two decimal places
      dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
      status: item.status,
    });

    return acc;
  }, {});

  // Convert grouped data to array and sort by latest month (descending order)
  const financialData = Object.values(groupedData)
    .map((data, index) => {

      const transoformedRows = data.tableData.rows.map((row, index) => ({ ...row, srNo: index + 1, projectedAmount: Number(row.projectedAmount.toLocaleString("en-IN").replace(/,/g, "")).toLocaleString("en-IN", { maximumFractionDigits: 0 }) }))
      const transformedCols = [
        { field: 'srNo', headerName: 'SR NO', flex: 1 },
        ...data.tableData.columns
      ];

      return ({
        ...data,
        projectedAmount: data.projectedAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        amount: data.amount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        tableData: { ...data.tableData, rows: transoformedRows, columns: transformedCols }
      })
    })
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate))); // Sort descending

  return (
    <div className="flex flex-col gap-8">
      <div className="border-default border-borderGray rounded-md">
        <WidgetSection layout={1} title={"Budget v/s Achievements"} titleLabel={"FY 2024-25"}>
          <BudgetGraph maxBudget={maxBudget} utilisedData={utilisedData} />
        </WidgetSection>
      </div>
      <WidgetSection layout={3} padding>
        <DataCard
          data={"INR " + inrFormat("7500000")}
          title={"Projected"}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "long",
          })}`}
        />
        <DataCard
          data={"INR " + inrFormat("6200000")}
          title={"Actual"}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "long",
          })}`}
        />
        <DataCard
          data={"INR " + inrFormat("89000")}
          title={"Requested"}
          description={`Current Month : ${new Date().toLocaleString("default", {
            month: "long",
          })}`}
        />
      </WidgetSection>


      <div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
          handleSubmit={() => setOpenModal(true)} // ✅ triggers modal
        />

      </div>

      <AllocatedBudget financialData={financialData} />
      <MuiModal
        title="Request Budget"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Expense Name */}
          <Controller
            name="expanseName"
            control={control}
            rules={{ required: "Expense name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Expense Name"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Expense Type */}
          <Controller
            name="expanseType"
            control={control}
            rules={{ required: "Expense type is required" }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} size="small" displayEmpty>
                  <MenuItem value="" disabled>
                    Select Expense Type
                  </MenuItem>
                  <MenuItem value="Internal">Internal</MenuItem>
                  <MenuItem value="External">External</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Amount */}
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Amount is required",
              pattern: {
                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Enter a valid amount",
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Amount"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Due Date */}
          <Controller
            name="dueDate"
            control={control}
            rules={{ required: "Due date is required" }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="Due Date"
                  format="DD-MM-YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
          <div className="flex justify-center items-center">
            {/* Submit Button */}
            <PrimaryButton type={"submit"} title={"Submit"} />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default SalesBudget;
