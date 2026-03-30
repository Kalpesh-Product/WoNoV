import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Tab, Tabs } from "@mui/material";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
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
    const [activeTypeTab, setActiveTypeTab] = useState("KRA");
    const [activeStatusTab, setActiveStatusTab] = useState("Completed");
    const [activeDepartmentId, setActiveDepartmentId] = useState("");

    const { data: departmentMembers = [] } = useQuery({
        queryKey: ["performanceAccessibleDepartments"],
        queryFn: async () => {
            const response = await axios.get("/api/access/department-wise-employees");
            return response.data?.data || [];
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

    useEffect(() => {
        if (!departments.length) {
            setActiveDepartmentId("");
            return;
        }

        if (!activeDepartmentId || !departments.some((dept) => dept.id === activeDepartmentId)) {
            setActiveDepartmentId(departments[0].id);
        }
    }, [departments, activeDepartmentId]);

    const selectedDepartment = useMemo(
        () => departments.find((department) => department.id === activeDepartmentId),
        [departments, activeDepartmentId]
    );

    const departmentTabsVariant =
        departments.length > 0 && departments.length <= 3 ? "fullWidth" : "scrollable";

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
        },
        {
            headerName: "Due Date",
            field: "dueDate",
            includeTime: true,
        },
        ...(activeStatusTab === "Completed"
            ? [
                {
                    headerName: "Completed On",
                    field: "completionDate",
                    includeTime: true,
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
                onChange={(_, newValue) => setActiveDepartmentId(newValue)}
                variant={departmentTabsVariant}
                scrollButtons={departmentTabsVariant === "scrollable" ? "auto" : false}
                TabIndicatorProps={{ style: { display: "none" } }}
                sx={tabSx}
            >
                {departments.map((department) => (
                    <Tab key={department.id} label={department.name} value={department.id} />
                ))}
            </Tabs>



            <Tabs
                value={activeTypeTab}
                onChange={(_, newValue) => setActiveTypeTab(newValue)}
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
                        onChange={(_, newValue) => setActiveStatusTab(newValue)}
                        variant="fullWidth"
                        TabIndicatorProps={{ style: { display: "none" } }}
                        sx={tabSx}
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
                        loading={isPending}
                    />
                </div>
            </PageFrame>
        </div>
    );
};

export default PerformanceReportKraKpa;