import React, { useCallback, useEffect, useMemo, useState } from "react";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
import PageFrame from "../../../components/Pages/PageFrame";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import StatusChip from "../../../components/StatusChip";
import formatDateTime, {
  formatDateTimeFields,
} from "../../../utils/formatDateTime";
import dayjs from "dayjs";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../constants/pagination";

const toUtcDayBoundary = (value, endOfDay = false) => {
  const date = dayjs(value);

  return new Date(
    Date.UTC(
      date.year(),
      date.month(),
      date.date(),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    ),
  ).toISOString();
};


const MyTaskReports = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [taskSearch, setTaskSearch] = useState("");
  const [debouncedTaskSearch, setDebouncedTaskSearch] = useState("");
  const initialDateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    }),
    [],
  );
  const [selectedTaskRange, setSelectedTaskRange] = useState(initialDateRange);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedTaskSearch(taskSearch.trim()),
      400,
    );

    return () => clearTimeout(timeoutId);
  }, [taskSearch]);

  const handleTaskSearchChange = useCallback((value) => {
    setTaskSearch(value);
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const { data: taskList = [], isLoading } = useQuery({
    queryKey: [
      "my-tasks",
      "report",
      selectedTaskRange.startDate,
      selectedTaskRange.endDate,
      pagination.page,
      pagination.limit,
      debouncedTaskSearch,
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await axios.get("/api/tasks/my-tasks", {
        params: {
          startDate: toUtcDayBoundary(selectedTaskRange.startDate),
          endDate: toUtcDayBoundary(selectedTaskRange.endDate, true),
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedTaskSearch || undefined,
        },
      });
      const responsePagination = response.data.pagination;

      setPagination((current) => ({
        page: Number(responsePagination?.page) || current.page,
        limit: Number(responsePagination?.limit) || current.limit,
        total: Number(responsePagination?.total) || 0,
      }));

      return response.data.data || [];
    },
  });

  const handleViewDetails = (params) => {
    // setSelectedTask(params.data);
    setSelectedTask(
      formatDateTimeFields({
        ...params.data,
        startTime: params.data?.assignedDate,
      }),
    );
    setOpenModal(true);
  };
  const myTaskReportsColumns = [
    { field: "srNo", headerName: "Sr No", width: 50 },
    {
      field: "taskName",
      headerName: "Task",
      width: 250,
    },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      width: 130,
      minWidth: 130,
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "action",
      headerName: "Action",
      pinned: "right",
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      lockPinned: true,
      suppressMovable: true,
      cellRenderer: (params) => (
        <button
          type="button"
          title="View Task Details"
          onClick={() => handleViewDetails(params)}
          className="h-8 w-8 flex items-center justify-center"
        >
          <MdOutlineRemoveRedEye size={22} color="#111827" />
        </button>
      ),
    },
    { field: "assignedBy", headerName: "Assigned By", width: 300 },
    {
      field: "startDate",
      headerName: "Start Date",
    },
    // {
    //   field: "startTime",
    //   headerName: "Start Time",
    // },
    {
      field: "assignedDate",
      headerName: "Assigned Date",
    },

    {
      field: "dueDate",
      headerName: "Due Date",
    },
    {
      field: "dueTime",
      headerName: "Due Time",
    },
    { field: "completedDate", headerName: "Completed Date" },
    {
      field: "completedTime",
      headerName: "Completed Time",
    },
    { field: "department", headerName: "Department" },
    { field: "comment", headerName: "Comment", hide: true },
  ];

  const currentMonthLabel = (
    selectedTaskRange?.startDate ? dayjs(selectedTaskRange.startDate) : dayjs()
  ).format("MMMM");

  const handleTaskRangeChange = useCallback(({ selectedRange }) => {
    if (!selectedRange?.startDate || !selectedRange?.endDate) return;
    setSelectedTaskRange((prev) => {
      const prevStart = prev?.startDate ? dayjs(prev.startDate).valueOf() : null;
      const prevEnd = prev?.endDate ? dayjs(prev.endDate).valueOf() : null;
      const nextStart = selectedRange?.startDate
        ? dayjs(selectedRange.startDate).valueOf()
        : null;
      const nextEnd = selectedRange?.endDate
        ? dayjs(selectedRange.endDate).valueOf()
        : null;

      if (prevStart === nextStart && prevEnd === nextEnd) {
        return prev;
      }

      return selectedRange;
    });
   setPagination((current) =>
      current.page === 1 ? current : { ...current, page: 1 },
    );
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          exportData
          taskExportDateTimeFormatting
          search={true}
          dateColumn={"assignedDate"}
          initialDateRange={initialDateRange}
          tableTitle={`My Task Reports - ${currentMonthLabel}`}
          data={
            isLoading
              ? []
              : taskList.map((task, index) => ({
                  srNo: (pagination.page - 1) * pagination.limit + index + 1,
                  ...task,
                  taskName: task.taskName,
                  description: task.description,
                  startDate: task.assignedDate,
                  startTime: task.assignedDate,
                  assignedDate: task.assignedDate,
                  dueDate: task.dueDate,
                  dueTime: task.dueTime,
                  completedDate: task.completedDate,
                  completedTime: task.completedDate,
                  assignedBy: `${task.assignedBy.firstName} ${task.assignedBy.lastName}`,
                  department: task.department?.name,
                  status: task.status,
                  comment: task.comment,
                }))
          }
          columns={myTaskReportsColumns}
          onDateFilterChange={handleTaskRangeChange}
          serverPagination
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          paginationPageSize={pagination.limit}
          paginationPage={pagination.page}
          paginationTotal={pagination.total}
          onPaginationPageChange={(page) =>
            setPagination((current) => ({ ...current, page }))
          }
          onPaginationPageSizeChange={(limit) =>
            setPagination((current) =>
              current.limit === limit
                ? current
                : { ...current, page: 1, limit },
            )
          }
          serverSearch
          searchValue={taskSearch}
          onSearchChange={handleTaskSearchChange}
        />
      </PageFrame>

      {/* Modal for Task Details */}
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Task Details"}
      >
        {selectedTask ? (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title="Sr No"
              detail={selectedTask.srNo}
            />
            <DetalisFormatted
              title="Task Name"
              detail={selectedTask.taskName}
            />
            <DetalisFormatted
              title="Description"
              detail={selectedTask.description}
            />
            <DetalisFormatted
              title="Assigned By"
              detail={selectedTask.assignedBy}
            />
            <DetalisFormatted
              title="Start Date"
              detail={selectedTask.startDate}
            />
            {/* <DetalisFormatted
              title="Start Time"
              detail={selectedTask.startTime}
            /> */}
            <DetalisFormatted
              title="Assigned Date"
              detail={selectedTask.assignedDate}
            />
            <DetalisFormatted
              title="Due Date"
              detail={selectedTask.dueDate}
            />
            <DetalisFormatted
              title="Due Time"
              detail={selectedTask.dueTime}
            />

            <DetalisFormatted
              title="Completed Date"
              detail={selectedTask.completedDate}
            />
            <DetalisFormatted
              title="Completed Time"
              detail={selectedTask.completedTime}
            />

            <DetalisFormatted
              title="Department"
              detail={selectedTask.department}
            />
            {/* <DetalisFormatted title="Priority" detail={selectedTask.priority} /> */}
            <DetalisFormatted title="Status" detail={selectedTask.status} />
            <DetalisFormatted title="Comment" detail={selectedTask.comment || "-"} />
            {/* <DetalisFormatted title="Remarks" detail={selectedTask.remarks} /> */}
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default MyTaskReports;
