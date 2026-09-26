import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import { IoFilter } from "react-icons/io5";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../../../constants/pagination";
import CurrentLeaveBalanceReportFilter from "./CurrentLeaveBalanceReportFilter";

const CurrentLeaveBalanceReport = () => {
  const axios = useAxiosPrivate();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ leaveType: "All", employee: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const tableRef = useRef(null);

  const { data = {}, isLoading } = useQuery({
    queryKey: [
      "current-leave-balance-report",
      filters,
      search,
      pagination.page,
      pagination.limit,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/leaves/current-leave-balance-report", {
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
    queryKey: ["current-leave-balance-report-employees"],
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
    () =>
      users.map((user) => ({
        value: user._id,
        label: `${user.firstName || ""} ${user.lastName || ""}${
          user.empId ? ` (${user.empId})` : ""
        }`.trim(),
      })),
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
    { field: "employee", headerName: "Employee", flex: 1, minWidth: 190 },
    { field: "employeeId", headerName: "Employee ID", width: 140 },
    { field: "leaveType", headerName: "Leave Type", width: 155 },
    { field: "allottedLeaves", headerName: "Leaves Allotted Till Date", width: 210 },
    { field: "usedLeaves", headerName: "Leaves Used Till Date", width: 190 },
    { field: "encashedLeaves", headerName: "Leaves Encashed Till Date", width: 215 },
    { field: "balanceLeaves", headerName: "Leave Balance Till Date", width: 200 },
    { field: "overflowLeaves", headerName: "Overflow Leaves", width: 160 },
  ];

  return (
    <PageFrame>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-title font-pmedium uppercase text-primary">
            Current Leave Balance Report
          </h1>
          <div className="flex items-center gap-3">
            <PrimaryButton
              title="Export"
              handleSubmit={() =>
                tableRef.current?.api?.exportDataAsCsv({
                  fileName: "Current Leave Balance Report.csv",
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
      <CurrentLeaveBalanceReportFilter
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setPagination((current) => ({ ...current, page: 1 }));
          setFilterOpen(false);
        }}
        leaveTypes={["Compoff", "Other", "Privileged", "Sick", "Weeklyoffs"]}
        employees={employees}
      />
    </PageFrame>
  );
};

export default CurrentLeaveBalanceReport;
