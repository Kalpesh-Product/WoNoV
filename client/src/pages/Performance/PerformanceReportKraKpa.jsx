import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Chip, Tab, Tabs } from "@mui/material";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import PageFrame from "../../components/Pages/PageFrame";
import MuiModal from "../../components/MuiModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import dayjs from "dayjs";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../constants/pagination";

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

const tabSx = {
    backgroundColor: "white",
    borderRadius: 2,
    border: "1px solid #d1d5db",
    "& .MuiTab-root": {
        textTransform: "none",
        fontWeight: "medium",
        color: "#1E3D73",
        padding: "12px 16px",
        borderRight: "0.1px solid #d1d5db",
    },
    "& .MuiTab-root:last-of-type": {
        borderRight: "0",
    },
    "& .Mui-selected": {
        backgroundColor: "#1E3D73",
        color: "white !important",
    },
};

const PerformanceReportKraKpa = () => {
    const axios = useAxiosPrivate();
    const navigate = useNavigate();
    const [completedTaskView, setCompletedTaskView] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_PAGE_SIZE, total: 0 });
    const initialDateRange = useMemo(
        () => ({
            startDate: dayjs().startOf("month").toDate(),
            endDate: dayjs().endOf("month").toDate(),
            key: "selection",
        }),
        [],
    );
    const [dateRange, setDateRange] = useState(initialDateRange);
    const { departmentName: routeDepartmentName, reportType: routeReportType, reportStatus: routeReportStatus } = useParams();
    const handleDateFilterChange = useCallback(({ selectedRange }) => {
        if (!selectedRange?.startDate || !selectedRange?.endDate) return;

        const isSameRange =
            dayjs(dateRange.startDate).isSame(selectedRange.startDate, "day") &&
            dayjs(dateRange.endDate).isSame(selectedRange.endDate, "day");

        if (isSameRange) return;

        setDateRange(selectedRange);
        setPagination((current) =>
            current.page === 1 ? current : { ...current, page: 1 },
        );
    }, [dateRange]);

    const { data: departmentMembers = [] } = useQuery({
        queryKey: ["performanceAccessibleDepartments"],
        queryFn: async () => {
            const response = await axios.get("/api/access/department-wise-employees");
            return response.data?.data.filter((item) => item.isActive) || [];
        },
    });

    const departments = useMemo(
        () =>
            departmentMembers
                .map((department) => ({
                    id: department?._id?.toString(),
                    name: department?.name || "Unknown Department",
                }))
                .filter((department) => department.id),
        [departmentMembers]
    );

const getDepartmentPathSegment = (departmentName) => encodeURIComponent(departmentName || "");
    const decodedRouteDepartmentName = decodeURIComponent(routeDepartmentName || "");

    const activeTypeTab = routeReportType === "KPA" ? "KPA" : "KRA";
    const activeStatusTab = routeReportStatus === "Pending" ? "Pending" : "Completed";
    const selectedDepartmentByRoute = departments.find(
        (department) => department.name === decodedRouteDepartmentName
    );
    const activeDepartmentId = selectedDepartmentByRoute?.id || departments[0]?.id || "";

    useEffect(() => {
        if (!departments.length) return;

        const nextDepartment = departments.find(
            (department) => department.name === decodedRouteDepartmentName
        ) || departments[0];
        const nextType = routeReportType === "KPA" ? "KPA" : "KRA";
        const nextStatus = routeReportStatus === "Pending" ? "Pending" : "Completed";

        if (
            nextDepartment.name !== decodedRouteDepartmentName ||
            nextType !== routeReportType ||
            nextStatus !== routeReportStatus
        ) {
            navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(nextDepartment.name)}/${nextType}/${nextStatus}`, { replace: true });
        }
    }, [
        departments,
        navigate,
        decodedRouteDepartmentName,
        routeReportStatus,
        routeReportType,
    ]);

    const selectedDepartment = useMemo(
        () => departments.find((department) => department.id === activeDepartmentId),
        [departments, activeDepartmentId]
    );
const navigateToReport = (departmentName, type, status) => {
        setPagination((current) =>
            current.page === 1 ? current : { ...current, page: 1 },
        );
        navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(departmentName)}/${type}/${status}`);
    };

    const endpoint =
        activeStatusTab === "Completed"
            ? "/api/performance/get-completed-tasks"
            : "/api/performance/get-tasks";

    const { data: reportData = [], isPending } = useQuery({
        queryKey: [
            "performanceReport",
            activeTypeTab,
            activeStatusTab,
            activeDepartmentId,
             dateRange.startDate,
            dateRange.endDate,
            pagination.page,
            pagination.limit,
        ],
        enabled: Boolean(activeDepartmentId),
          placeholderData: keepPreviousData,
        queryFn: async () => {
            const response = await axios.get(endpoint, {
                params: {
                    dept: activeDepartmentId,
                    type: activeTypeTab,
                    status: activeStatusTab,
                     startDate: toUtcDayBoundary(dateRange.startDate),
                    endDate: toUtcDayBoundary(dateRange.endDate, true),
                    page: pagination.page,
                    limit: pagination.limit,
                },
            });

            const responsePagination = response.data?.pagination;

            setPagination((current) => ({
                page: Number(responsePagination?.page) || current.page,
                limit: Number(responsePagination?.limit) || current.limit,
                total: Number(responsePagination?.total) || 0,
            }));

            return (response.data?.data || []).sort(
                (a, b) => new Date(b.completionDate || b.assignedDate) - new Date(a.completionDate || a.assignedDate)
            );
        },
    });

    const reportColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        { headerName: `${activeTypeTab} Name`, field: "taskName", flex: 1 },
        ...(activeStatusTab === "Completed"
            ? [
                {
                    headerName: "Action",
                    field: "action",
                    pinned: "right",
                    width: 110,
                    cellRenderer: (params) => (
                        <button
                            type="button"
                            title={`View Completed ${activeTypeTab}`}
                            onClick={() => setCompletedTaskView(params.data)}
                            className="h-8 w-8 flex items-center justify-center"
                        >
                            <MdOutlineRemoveRedEye size={22} color="#111827" />
                        </button>
                    ),
                },
            ]
            : []),
        { headerName: "Department", field: "department", flex: 1 },
        {
            headerName: activeStatusTab === "Completed" ? "Completed By" : "Assigned To",
            field: activeStatusTab === "Completed" ? "completedBy" : "assignedTo",
            flex: 1,
        },
        {
            headerName: "Assigned Date",
            field: "assignedDate",
            includeTime: true,
            exportFormat: "date",
        },
        {
            headerName: "Due Date",
            field: "dueDate",
            includeTime: true,
            exportFormat: "date",
        },
        ...(activeStatusTab === "Completed"
            ? [
                {
                    headerName: "Completed On",
                    field: "completionDate",
                    includeTime: true,
                    exportFormat: "datetime-comma",
                },
                {
                    headerName: "Comment",
                    field: "comment",
                    hide: true,
                    flex: 1,
                },
            ]
            : []),
        {
            headerName: "Status",
            field: "status",
            cellRenderer: (params) => {
                const isCompleted = params.value === "Completed";
                return (
                    <Chip
                        label={params.value || "Pending"}
                        style={{
                            backgroundColor: isCompleted ? "#16f8062c" : "#fff3cd",
                            color: isCompleted ? "#00731b" : "#8a6d3b",
                        }}
                    />
                );
            },
        },
    ];

    const tableData = reportData.map((item, index) => ({
        ...item,
        srNo: (pagination.page - 1) * pagination.limit + index + 1,
        department: item?.department || selectedDepartment?.name || "N/A",
        status: item?.status || activeStatusTab,
    }));

    return (
        <div className="flex flex-col gap-4">
            <Tabs
                value={activeDepartmentId}
                 onChange={(_, newValue) => navigateToReport(departments.find((department) => department.id === newValue)?.name, activeTypeTab, activeStatusTab)}
                //onChange={(_, newValue) => navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(departments.find((department) => department.id === newValue)?.name)}/${activeTypeTab}/${activeStatusTab}`) }
                variant="fullWidth"
                TabIndicatorProps={{ style: { display: "none" } }}
                sx={tabSx}
            >
                {departments.map((department) => (
                    <Tab key={department.id} label={department.name} value={department.id} />
                ))}
            </Tabs>



            <Tabs
                value={activeTypeTab}
                  onChange={(_, newValue) => navigateToReport(selectedDepartment?.name, newValue, activeStatusTab)}
               // onChange={(_, newValue) => navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(selectedDepartment?.name)}/${newValue}/${activeStatusTab}`) }
                variant="fullWidth"
                TabIndicatorProps={{ style: { display: "none" } }}
                sx={tabSx}
            >
                <Tab label="KRA" value="KRA" />
                <Tab label="KPA" value="KPA" />
            </Tabs>

            <PageFrame>
                <div className="pt-2">
                    <Tabs
                        value={activeStatusTab}
                         onChange={(_, newValue) => navigateToReport(selectedDepartment?.name, activeTypeTab, newValue)}
                        //onChange={(_, newValue) => setActiveStatusTab(newValue)}
                       //onChange={(_, newValue) => navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(selectedDepartment?.name)}/${activeTypeTab}/${newValue}`) }
                        variant="fullWidth"
                        TabIndicatorProps={{ style: { display: "none" } }}
                        sx={tabSx}
                        className="mb-4"
                    >
                        <Tab label="Completed" value="Completed" />
                        <Tab label="Pending" value="Pending" />
                    </Tabs>
                    <YearWiseTable
                        data={tableData}
                        columns={reportColumns}
                        dateColumn="assignedDate"
                         initialDateRange={initialDateRange}
                        onDateFilterChange={handleDateFilterChange}
                        search
                        tableTitle={`${activeStatusTab} ${selectedDepartment?.name} ${activeTypeTab} REPORT`}
                        exportData
                        taskExportDateTimeFormatting
                        loading={isPending}
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
                    />
                </div>
            </PageFrame>
            <MuiModal
                open={!!completedTaskView}
                onClose={() => setCompletedTaskView(null)}
                title={`Completed ${activeTypeTab}`}
            >
                {completedTaskView && (
                    <div className="grid grid-cols-1 gap-4">
                        <DetalisFormatted title={activeTypeTab} detail={completedTaskView?.taskName} />
                        <DetalisFormatted title={"Department"} detail={completedTaskView?.department} />
                        <DetalisFormatted title={"Completed By"} detail={completedTaskView?.completedBy || "-"} />
                        <DetalisFormatted
                            title={"Assigned Date"}
                            detail={completedTaskView?.assignedDate ? humanDate(completedTaskView.assignedDate) : "-"}
                        />
                        <DetalisFormatted
                            title={"Due Date"}
                            detail={completedTaskView?.dueDate ? humanDate(completedTaskView.dueDate) : "-"}
                        />
                        <DetalisFormatted
                            title={"Completed On"}
                            detail={
                                completedTaskView?.completionDate
                                    ? `${humanDate(completedTaskView.completionDate)}, ${humanTime(completedTaskView.completionDate)}`
                                    : "-"
                            }
                        />
                         <DetalisFormatted title={"Status"} detail={completedTaskView?.status || "-"} />
                        <DetalisFormatted title={"Comment"} detail={completedTaskView?.comment || "-"} />
                    </div>
                )}
            </MuiModal>
        </div>
    );
};

export default PerformanceReportKraKpa;
