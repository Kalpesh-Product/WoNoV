import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Tab, Tabs } from "@mui/material";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import PageFrame from "../../components/Pages/PageFrame";

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
    const { departmentName: routeDepartmentName, reportType: routeReportType, reportStatus: routeReportStatus } = useParams();

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
        ],
        enabled: Boolean(activeDepartmentId),
        queryFn: async () => {
            const response = await axios.get(endpoint, {
                params: {
                    dept: activeDepartmentId,
                    type: activeTypeTab,
                },
            });

            return (response.data || []).sort(
                (a, b) => new Date(b.completionDate || b.assignedDate) - new Date(a.completionDate || a.assignedDate)
            );
        },
    });

    const reportColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        { headerName: `${activeTypeTab} Name`, field: "taskName", flex: 1 },
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
        srNo: index + 1,
        department: item?.department || selectedDepartment?.name || "N/A",
        status: item?.status || activeStatusTab,
    }));

    return (
        <div className="flex flex-col gap-4">
            <Tabs
                value={activeDepartmentId}
                onChange={(_, newValue) => navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(departments.find((department) => department.id === newValue)?.name)}/${activeTypeTab}/${activeStatusTab}`) }
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
                onChange={(_, newValue) => navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(selectedDepartment?.name)}/${newValue}/${activeStatusTab}`) }
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
                        //onChange={(_, newValue) => setActiveStatusTab(newValue)}
                       onChange={(_, newValue) => navigate(`/app/performance/report-KRA-KPA/${getDepartmentPathSegment(selectedDepartment?.name)}/${activeTypeTab}/${newValue}`) }
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
                        search
                        tableTitle={`${activeStatusTab} ${selectedDepartment?.name} ${activeTypeTab} REPORT`}
                        exportData
                        taskExportDateTimeFormatting
                        loading={isPending}
                    />
                </div>
            </PageFrame>
        </div>
    );
};

export default PerformanceReportKraKpa;
