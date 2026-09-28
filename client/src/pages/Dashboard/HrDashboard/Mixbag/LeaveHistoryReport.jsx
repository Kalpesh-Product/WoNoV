import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import dayjs from "dayjs";
import { IoFilter } from "react-icons/io5";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../../../constants/pagination";
import LeaveHistoryReportFilter from "./LeaveHistoryReportFilter";

const getDefaultFilters = () => {
  const today = dayjs();
  const daysSinceMonday = (today.day() + 6) % 7;
  return {
    employee: "",
    fromDate: today.subtract(daysSinceMonday, "day").format("YYYY-MM-DD"),
    toDate: today.format("YYYY-MM-DD"),
  };
};

const LeaveHistoryReport = () => {
  const axios = useAxiosPrivate();
  const defaults = useMemo(getDefaultFilters, []);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(defaults);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const tableRef = useRef(null);

  const { data = {}, isLoading } = useQuery({
    queryKey: ["leave-history-report", filters, search, pagination.page, pagination.limit],
    queryFn: async () => {
      const response = await axios.get("/api/leaves/leave-history-report", {
        params: {
          ...filters,
          search,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["leave-history-report-employees"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  useEffect(() => {
    if (!data.pagination) return;
    setPagination((current) => ({
      ...current,
      total: Number(data.pagination.total) || 0,
    }));
  }, [data.pagination]);

  const employees = useMemo(
    () => [
      { value: "", label: "All" },
      ...users.map((user) => ({
        value: user._id,
        label: `${user.firstName || ""} ${user.lastName || ""}${
          user.empId ? ` (${user.empId})` : ""
        }`.trim(),
      })),
    ],
    [users],
  );
  const rows = useMemo(
    () =>
      (data.data || []).map((row, index) => ({
        ...row,
        srNo: (pagination.page - 1) * pagination.limit + index + 1,
      })),
    [data.data, pagination.limit, pagination.page],
  );
  const columns = [
    { field: "srNo", headerName: "Sr No", width: 80 },
    { field: "takenBy", headerName: "Taken By", width: 180 },
    { field: "takenByEmpId", headerName: "Taken By Emp ID", width: 165 },
    { field: "fromDate", headerName: "From Date", width: 135 },
    { field: "toDate", headerName: "To Date", width: 135 },
    { field: "leaveType", headerName: "Leave Type", width: 150 },
    { field: "leavePeriod", headerName: "Leave Period", width: 145 },
    { field: "hours", headerName: "Hours", width: 100 },
    { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
    { field: "status", headerName: "Status", width: 130 },
    { field: "addedBy", headerName: "Added By", width: 180 },
    { field: "approvedBy", headerName: "Approved By", width: 180 },
    { field: "rejectedBy", headerName: "Rejected By", width: 180 },
  ];

  return (
    <PageFrame>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-title font-pmedium uppercase text-primary">
            Leaves History Report
          </h1>
          <div className="flex items-center gap-3">
            <PrimaryButton
              title="Export"
              handleSubmit={() =>
                tableRef.current?.api?.exportDataAsCsv({
                  fileName: "Leaves History Report.csv",
                })
              }
            />
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="rounded-full border border-borderGray p-2.5 text-primary hover:bg-gray-100"
              aria-label="Open advanced report filters"
            >
              <IoFilter size={19} />
            </button>
          </div>
        </div>
        {isLoading && !rows.length ? (
          <Skeleton width="100%" height={420} />
        ) : (
          <AgTable
            data={rows}
            columns={columns}
            tableRef={tableRef}
            search
            hideFilter
            hideTitle
            serverSearch
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPagination((current) => ({ ...current, page: 1 }));
            }}
            isPagination
            serverPagination
            paginationPage={pagination.page}
            paginationTotal={pagination.total}
            paginationPageSize={pagination.limit}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPaginationPageChange={(page) =>
              setPagination((current) => ({ ...current, page }))
            }
            onPaginationPageSizeChange={(limit) =>
              setPagination({ page: 1, limit, total: pagination.total })
            }
          />
        )}
      </div>
      <LeaveHistoryReportFilter
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        defaults={defaults}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setPagination((current) => ({ ...current, page: 1 }));
          setFilterOpen(false);
        }}
        employees={employees}
      />
    </PageFrame>
  );
};

export default LeaveHistoryReport;
