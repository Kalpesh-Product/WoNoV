import React, { useEffect, useState } from "react";
import LayerBarGraph from "../../../../components/graphs/LayerBarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import DataCard from "../../../../components/DataCard";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import { toast } from "sonner";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../../utils/currencyFormat";

const HrBudget = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
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
    toast.success("Budget Requested succesfully");
    reset();
  };

  // Transform data into the required format
  const groupedData = isHrLoading
    ? []
    : hrFinance?.reduce((acc, item) => {
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

        acc[month].projectedAmount += item?.projectedAmount; // Summing the total projected amount per month
        acc[month].amount += item?.actualAmount; // Summing the total amount per month
        acc[month].tableData.rows.push({
          id: item._id,
          expanseName: item?.expanseName,
          department: item?.department,
          expanseType: item?.expanseType,
          projectedAmount: Number(item?.projectedAmount).toFixed(2), // Ensuring two decimal places
          dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
          status: item.status,
        });

        return acc;
      }, {});

  // Convert grouped data to array and sort by latest month (descending order)
  const financialData = Object.values(groupedData)
    .map((data, index) => {
      const transoformedRows = data.tableData.rows.map((row, index) => ({
        ...row,
        srNo: index + 1,
        projectedAmount: Number(
          row.projectedAmount.toLocaleString("en-IN").replace(/,/g, "")
        ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      }));
      const transformedCols = [
        { field: "srNo", headerName: "SR NO", flex: 1 },
        ...data.tableData.columns,
      ];

      return {
        ...data,
        projectedAmount: data.projectedAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        amount: data.actualAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        tableData: {
          ...data.tableData,
          rows: transoformedRows,
          columns: transformedCols,
        },
      };
    })
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate))); // Sort descending

  // ---------------------------------------------------------------------//
  // Data for the chart
  const utilisedData = [
    125000, 150000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 65000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <WidgetSection
          layout={1}
          title={"Budget v/s Achievements"}
          titleLabel={"FY 2024-25"}
          border
        >
          <BudgetGraph utilisedData={utilisedData} maxBudget={maxBudget} />
        </WidgetSection>
      </div>
      <div>
        <WidgetSection layout={3} padding>
          <DataCard
            data={"INR " + inrFormat("2000000")}
            title={"Projected"}
            route={"/app/dashboard/hr-dashboard/finance/budget"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
          <DataCard
            data={"INR " + inrFormat("150000")}
            title={"Actual"}
            route={"/app/dashboard/hr-dashboard/finance/budget"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
          <DataCard
            data={"INR " + inrFormat(12000)}
            title={"Requested"}
            route={"/app/dashboard/hr-dashboard/finance/budget"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
        </WidgetSection>
      </div>

      <div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
          handleSubmit={() => setOpenModal(true)}
        />
      </div>

      {!isHrLoading ? (
        <AllocatedBudget
          financialData={financialData}
          isLoading={isHrLoading}
        />
      ) : (
        <Skeleton height={600} width={"100%"} />
      )}

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

export default HrBudget;
