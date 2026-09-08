import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton, TextField } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";
import MuiModal from "../../../../components/MuiModal";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../../constants/pagination";

const MonthlyAttendanceSummary = ({
  embedded = false,
  fixedMonth = "",
  payrollBatch = "",
  payrollView = false,
}) => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => dayjs().format("YYYY-MM"));
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [workingDays, setWorkingDays] = useState(0);
  const [saveAttempted, setSaveAttempted] = useState(false);

  useEffect(() => {
    if (!fixedMonth) return;
    setMonth(fixedMonth);
    setPagination((current) => ({ ...current, page: 1 }));
  }, [fixedMonth]);

  const { data = {}, isLoading } = useQuery({
    queryKey: [
      "monthly-attendance-summaries",
      month,
      search,
      pagination.page,
      pagination.limit,
      payrollBatch,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/attendance/monthly-summaries", {
        params: {
          month,
          search,
          page: pagination.page,
          limit: pagination.limit,
          ...(payrollBatch && { batch: payrollBatch }),
        },
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const responsePagination = data?.pagination;
    if (!responsePagination) return;
    setPagination((current) => ({
      ...current,
      total: Number(responsePagination.total) || 0,
    }));
  }, [data?.pagination]);

  const updateSummary = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(
        `/api/attendance/monthly-summaries/${selectedSummary._id}`,
        { workingDays: Number(workingDays) },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Attendance summary updated successfully");
      setSelectedSummary(null);
      setSaveAttempted(false);
      queryClient.invalidateQueries({
        queryKey: ["monthly-attendance-summaries"],
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Unable to update attendance summary",
      );
    },
  });

  const openManageAttendance = (summary) => {
    setSelectedSummary(summary);
    setWorkingDays(summary.workingDays ?? 0);
    setSaveAttempted(false);
  };

  const selectedDaysInMonth = selectedSummary
    ? dayjs(`${selectedSummary.month}-01`).daysInMonth()
    : 0;
  const selectedScheduledWorkingDays = selectedSummary
    ? Number(selectedSummary.scheduledWorkingDays) ||
      Math.max(
        selectedDaysInMonth -
          (Number(selectedSummary.weeklyOffs) || 0) -
          (Number(selectedSummary.holidays) || 0),
        0,
      )
    : 0;
  const expectedWorkingDays = Number(
    Math.max(
      selectedScheduledWorkingDays - (Number(selectedSummary?.timeOff) || 0),
      0,
    ).toFixed(2),
  );
  const workingDaysAreValid =
    Number.isFinite(Number(workingDays)) &&
    Number(workingDays) >= 0 &&
    Math.abs(Number(workingDays) - expectedWorkingDays) <= 0.001;
  const unaccountedWorkingDays = Number(
    (expectedWorkingDays - Number(workingDays || 0)).toFixed(2),
  );

  const rows = useMemo(
    () =>
      (data?.data || []).map((summary, index) => {
        const daysInMonth = dayjs(`${summary.month}-01`).daysInMonth();
        const actualWorkingDays =
          Number(summary.scheduledWorkingDays) ||
          Math.max(
            daysInMonth -
              (Number(summary.weeklyOffs) || 0) -
              (Number(summary.holidays) || 0),
            1,
          );
        const annualCtc =
          Number(summary.employee?.salaryPackage?.grossAnnual) ||
          Number(summary.employee?.salaryPackage?.amount) ||
          0;
        const dailyRate = annualCtc / 12 / actualWorkingDays;

        return {
          ...summary,
          srNo: (pagination.page - 1) * pagination.limit + index + 1,
          empId: summary.employee?.empId || "N/A",
          employeeName:
            `${summary.employee?.firstName || ""} ${summary.employee?.lastName || ""}`.trim() ||
            "N/A",
          lopAmount: dailyRate * (Number(summary.lop) || 0),
        };
      }),
    [data?.data, pagination.limit, pagination.page],
  );

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 90 },
    { field: "empId", headerName: "Employee ID", width: 140 },
    { field: "employeeName", headerName: "Employee Name", flex: 1 },
    { field: "workingDays", headerName: "Working Days", width: 140 },
    { field: "weeklyOffs", headerName: "Weekly Offs", width: 130 },
    { field: "holidays", headerName: "Holidays", width: 110 },
    { field: "timeOff", headerName: "Time Off", width: 110 },
    { field: "overtime", headerName: "Over Time", width: 120 },
    { field: "lop", headerName: "LOP", width: 100 },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      pinned: "right",
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data._id}
          menuItems={[
            {
              label: "Manage Attendance",
              onClick: () => openManageAttendance(params.data),
            },
          ]}
        />
      ),
    },
  ];

  const payrollColumns = [
    { field: "srNo", headerName: "Sr No", width: 90 },
    {
      field: "empId",
      headerName: "Employee ID",
      flex: 0.75,
      minWidth: 140,
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      flex: 1,
      minWidth: 220,
      maxWidth: 350,
    },
    {
      field: "lop",
      headerName: "LOP Days",
      flex: 0.55,
      minWidth: 120,
    },
    {
      field: "lopAmount",
      headerName: "LOP Amount (INR)",
      flex: 0.75,
      minWidth: 180,
      valueFormatter: (params) =>
        Number(params.value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      pinned: "right",
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data._id}
          menuItems={[
            {
              label: "Manage Attendance",
              onClick: () => openManageAttendance(params.data),
            },
          ]}
        />
      ),
    },
  ];

  const summaryFields = selectedSummary
    ? [
        ["Time Off", selectedSummary.timeOff],
        ["Weekly Offs", selectedSummary.weeklyOffs],
        ["Holidays", selectedSummary.holidays],
        ["Over Time", selectedSummary.overtime],
        ["LOP", selectedSummary.lop],
      ]
    : [];

  const Wrapper = embedded ? "div" : PageFrame;

  return (
    <Wrapper>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-title font-pmedium uppercase text-primary">
            Monthly Attendance Summary
          </h1>
          {!fixedMonth && (
            <TextField
              type="month"
              size="small"
              label="Month"
              value={month}
              inputProps={{ max: dayjs().format("YYYY-MM") }}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => {
                setMonth(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            />
          )}
        </div>

        {isLoading && !rows.length ? (
          <Skeleton width="100%" height={420} />
        ) : (
          <AgTable
            data={rows}
            columns={payrollView ? payrollColumns : columns}
            search
            serverSearch
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPagination((current) => ({ ...current, page: 1 }));
            }}
            exportData
            isPagination
            serverPagination
            paginationPage={pagination.page}
            paginationPageSize={pagination.limit}
            paginationTotal={pagination.total}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPaginationPageChange={(page) =>
              setPagination((current) => ({ ...current, page }))
            }
            onPaginationPageSizeChange={(limit) =>
              setPagination({ page: 1, limit, total: pagination.total })
            }
            tableHeight={500}
          />
        )}
      </div>

      <MuiModal
        open={Boolean(selectedSummary)}
        onClose={() => {
          setSelectedSummary(null);
          setSaveAttempted(false);
        }}
        title={`Attendance Details: ${selectedSummary?.employeeName || "Employee"}`}
      >
        <div className="flex flex-col gap-5">
          <TextField
            size="small"
            label="Month"
            value={dayjs(`${month}-01`).format("MMMM, YYYY")}
            disabled
            fullWidth
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              type="number"
              size="small"
              label="Working Days"
              value={workingDays}
              inputProps={{ min: 0, step: 0.01 }}
              onChange={(event) => {
                setWorkingDays(event.target.value);
                setSaveAttempted(false);
              }}
              error={saveAttempted && !workingDaysAreValid}
              fullWidth
            />
            {saveAttempted && !workingDaysAreValid && (
              <div className="text-sm md:col-span-2">
                <p className="text-gray-500">
                  Expected {expectedWorkingDays} day(s): {selectedScheduledWorkingDays}{" "}
                  scheduled working day(s) - {selectedSummary?.timeOff || 0} leave day(s).
                </p>
                <p className="mt-1 text-red-600">
                  {Math.abs(unaccountedWorkingDays)} day(s){" "}
                  {unaccountedWorkingDays >= 0
                    ? "are not accounted for by attendance."
                    : "exceed the expected attendance."}
                </p>
              </div>
            )}
            {summaryFields.map(([label, value]) => (
              <TextField
                key={label}
                size="small"
                label={label}
                value={`${value ?? 0} Day(s)`}
                disabled
                fullWidth
              />
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <PrimaryButton
              title="Save"
              handleSubmit={() => {
                setSaveAttempted(true);
                if (workingDaysAreValid) updateSummary.mutate();
              }}
              disabled={
                updateSummary.isPending ||
                !Number.isFinite(Number(workingDays)) ||
                Number(workingDays) < 0
              }
              isLoading={updateSummary.isPending}
            />
          </div>
        </div>
      </MuiModal>
    </Wrapper>
  );
};

export default MonthlyAttendanceSummary;
