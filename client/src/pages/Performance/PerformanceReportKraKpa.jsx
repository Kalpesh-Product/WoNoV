import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Tab, Tabs } from "@mui/material";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";

const PerformanceReportKraKpa = () => {
    const axios = useAxiosPrivate();
    const [activeTab, setActiveTab] = useState("KRA");

    const { data: departmentMembers = [] } = useQuery({
        queryKey: ["performanceAccessibleDepartments"],
        queryFn: async () => {
            const response = await axios.get("/api/access/department-wise-employees");
            return response.data?.data || [];
        },
    });

    const departmentIds = useMemo(
        () =>
            departmentMembers
                .map((department) => department?._id?.toString())
                .filter(Boolean),
        [departmentMembers]
    );

    const { data: completedReport = [], isPending } = useQuery({
        queryKey: ["performanceCompletedReport", activeTab, departmentIds],
        enabled: departmentIds.length > 0,
        queryFn: async () => {
            const allResponses = await Promise.all(
                departmentIds.map((departmentId) =>
                    axios.get("/api/performance/get-completed-tasks", {
                        params: {
                            dept: departmentId,
                            type: activeTab,
                        },
                    })
                )
            );

            return allResponses
                .flatMap((response) => response.data || [])
                .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
        },
    });

    const formatDateTime = (value) =>
        value ? `${humanDate(value)}, ${humanTime(value)}` : "N/A";

    const reportColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        { headerName: `${activeTab} Name`, field: "taskName", flex: 1 },
        { headerName: "Department", field: "department", flex: 1 },
        { headerName: "Completed By", field: "completedBy", flex: 1 },
        {
            headerName: "Assigned Date",
            field: "assignedDate",
            cellRenderer: (params) => formatDateTime(params.value),
        },
        {
            headerName: "Due Date",
            field: "dueDate",
            cellRenderer: (params) => formatDateTime(params.value),
        },
        {
            headerName: "Completed On",
            field: "completionDate",
            cellRenderer: (params) => formatDateTime(params.value),
        },
        {
            headerName: "Status",
            field: "status",
            cellRenderer: (params) => (
                <Chip
                    label={params.value}
                    style={{
                        backgroundColor: "#16f8062c",
                        color: "#00731b",
                    }}
                />
            ),
        },
    ];

    return (
        <WidgetSection border title="REPORT KRA/KPA" normalCase>
            <div>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    TabIndicatorProps={{ style: { display: "none" } }}
                    sx={{
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
                    }}
                >
                    <Tab label="Completed KRA" value="KRA" />
                    <Tab label="Completed KPA" value="KPA" />
                </Tabs>

                <div className="pt-4">
                    <AgTable
                        data={completedReport.map((item, index) => ({
                            ...item,
                            srNo: index + 1,
                        }))}
                        columns={reportColumns}
                        loading={isPending}
                        hideFilter
                        exportData
                    />
                </div>
            </div>
        </WidgetSection>
    );
};

export default PerformanceReportKraKpa;