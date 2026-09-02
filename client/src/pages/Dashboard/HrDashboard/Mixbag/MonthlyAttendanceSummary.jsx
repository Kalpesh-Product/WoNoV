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

const MonthlyAttendanceSummary = () => {
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

  const { data = {}, isLoading } = useQuery({
    queryKey: [
      "monthly-attendance-summaries",
      month,
      search,
      pagination.page,
      pagination.limit,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/attendance/monthly-summaries", {
        params: {
          month,
          search,
          page: pagination.page,
          limit: pagination.limit,
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
  };

  const rows = useMemo(
    () =>
      (data?.data || []).map((summary, index) => ({
        ...summary,
        srNo: (pagination.page - 1) * pagination.limit + index + 1,
        empId: summary.employee?.empId || "N/A",
        employeeName:
          `${summary.employee?.firstName || ""} ${summary.employee?.lastName || ""}`.trim() ||
          "N/A",
      })),
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

  const summaryFields = selectedSummary
    ? [
        ["Time Off", selectedSummary.timeOff],
        ["Weekly Offs", selectedSummary.weeklyOffs],
        ["Holidays", selectedSummary.holidays],
        ["Over Time", selectedSummary.overtime],
        ["LOP", selectedSummary.lop],
      ]
    : [];

  return (
    <PageFrame>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-title font-pmedium uppercase text-primary">
            Monthly Attendance Summary
          </h1>
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
        </div>

        {isLoading && !rows.length ? (
          <Skeleton width="100%" height={420} />
        ) : (
          <AgTable
            data={rows}
            columns={columns}
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
        onClose={() => setSelectedSummary(null)}
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
              onChange={(event) => setWorkingDays(event.target.value)}
              fullWidth
            />
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
              handleSubmit={() => updateSummary.mutate()}
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
    </PageFrame>
  );
};

export default MonthlyAttendanceSummary;
