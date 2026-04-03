import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import WidgetSection from "../../components/WidgetSection";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";
import AgTable from "../../components/AgTable";
import SecondaryButton from "../../components/SecondaryButton";
import PrimaryButton from "../../components/PrimaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const fullMonthNames = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
};

const fyMonths = [
    "Apr-25",
    "May-25",
    "Jun-25",
    "Jul-25",
    "Aug-25",
    "Sep-25",
    "Oct-25",
    "Nov-25",
    "Dec-25",
    "Jan-26",
    "Feb-26",
    "Mar-26",
];

const PerformanceDepartmentKPA = () => {
    const axios = useAxiosPrivate();
    const location = useLocation();
    const { department } = useParams();

    const initialShortMonth = Object.keys(fullMonthNames).find(
        (key) => fullMonthNames[key] === location.state?.month
    );
    const initialMonthIndex = fyMonths.findIndex((month) =>
        month.startsWith(initialShortMonth)
    );

    const [selectedMonthIndex, setSelectedMonthIndex] = useState(
        initialMonthIndex !== -1 ? initialMonthIndex : 0
    );

    const { data: kpaTasksRaw = [] } = useQuery({
        queryKey: ["performanceKpaTasks"],
        queryFn: async () => {
            const response = await axios.get("/api/performance/get-kpa-tasks");
            return response.data || [];
        },
    });

    const tasksData = useMemo(() => {
        const foundDepartment = kpaTasksRaw.find((item) => item.department === department);
        return foundDepartment?.tasks || [];
    }, [department, kpaTasksRaw]);

    const monthlyMap = {};
    fyMonths.forEach((month) => {
        monthlyMap[month] = { total: 0, achieved: 0 };
    });

    tasksData.forEach((task) => {
        const taskDate = new Date(task.assignedDate);
        if (Number.isNaN(taskDate.getTime())) return;

        const label = `${taskDate.toLocaleString("default", { month: "short" })}-${String(
            taskDate.getFullYear()
        ).slice(2)}`;

        if (!monthlyMap[label]) return;

        monthlyMap[label].total += 1;
        if (task.status === "Completed") {
            monthlyMap[label].achieved += 1;
        }
    });

    const graphData = [
        {
            name: "Completed Tasks",
            group: `${department}`,
            data: fyMonths.map((label) => {
                const { total, achieved } = monthlyMap[label] || { total: 0, achieved: 0 };
                const percent = total > 0 ? (achieved / total) * 100 : 0;
                return { x: label, y: +percent.toFixed(1), raw: achieved };
            }),
        },
        {
            name: "Remaining Tasks",
            group: `${department}`,
            data: fyMonths.map((label) => {
                const { total, achieved } = monthlyMap[label] || { total: 0, achieved: 0 };
                const remaining = total - achieved;
                const percent = total > 0 ? (remaining / total) * 100 : 0;
                return { x: label, y: +percent.toFixed(1), raw: remaining };
            }),
        },
    ];

    const graphOptions = {
        chart: {
            type: "bar",
            stacked: true,
            animations: { enabled: false },
            toolbar: { show: false },
            fontFamily: "Poppins-Regular",
        },
        plotOptions: {
            bar: { horizontal: false, columnWidth: "40%", borderRadius: 5 },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 1, colors: ["#fff"] },
        xaxis: { title: { text: "Months" }, categories: fyMonths },
        yaxis: {
            title: { text: "Completion (%)" },
            labels: { formatter: (value) => `${value.toFixed(0)}%` },
            max: 100,
        },
        colors: ["#54C4A7", "#EB5C45"],
        fill: { opacity: 1 },
        legend: { position: "top" },
    };

    const selectedMonth = fyMonths[selectedMonthIndex];
    const shortMonth = selectedMonth.split("-")[0];

    const filteredTasks = tasksData.filter((task) => {
        const taskDate = new Date(task.assignedDate);
        if (Number.isNaN(taskDate.getTime())) return false;

        const label = `${taskDate.toLocaleString("default", { month: "short" })}-${String(
            taskDate.getFullYear()
        ).slice(2)}`;

        return label === selectedMonth;
    });

    const tasksColumns = [
        {
            headerName: "Sr No",
            field: "id",
            valueGetter: (params) => params.node.rowIndex + 1,
            width: 100,
        },
        { field: "taskName", headerName: "KPA Name", flex: 1 },
        { field: "assignedTo", headerName: "Assigned To", flex: 1 },
        { field: "assignedBy", headerName: "Assigned By", flex: 1 },
        { field: "assignedDate", headerName: "Assigned Date", flex: 1 },
        { field: "dueDate", headerName: "Due Date", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            cellRenderer: (params) => {
                const statusColorMap = {
                    Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
                    "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" },
                    Completed: { backgroundColor: "#90EE90", color: "#006400" },
                };

                const { backgroundColor, color } = statusColorMap[params.value] || {
                    backgroundColor: "gray",
                    color: "white",
                };

                return <Chip label={params.value} style={{ backgroundColor, color }} />;
            },
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <WidgetSection
                title={`${department} department KPA overview`}
                border
                TitleAmount={`TOTAL KPA : ${tasksData.length || 0}`}
            >
                <NormalBarGraph data={graphData} options={graphOptions} year={false} height={350} />
            </WidgetSection>

            <WidgetSection
                title="KPA details"
                border
                TitleAmount={`${fullMonthNames[shortMonth]} : ${filteredTasks.length} KPA`}
            >
                <div className="flex justify-center items-center gap-4">
                    <SecondaryButton
                        title={<MdNavigateBefore />}
                        handleSubmit={() => {
                            if (selectedMonthIndex > 0) {
                                setSelectedMonthIndex((prev) => prev - 1);
                            }
                        }}
                        disabled={selectedMonthIndex === 0}
                    />

                    <div className="text-subtitle text-center font-pmedium">{selectedMonth}</div>

                    <PrimaryButton
                        title={<MdNavigateNext />}
                        handleSubmit={() => {
                            if (selectedMonthIndex < fyMonths.length - 1) {
                                setSelectedMonthIndex((prev) => prev + 1);
                            }
                        }}
                        disabled={selectedMonthIndex === fyMonths.length - 1}
                    />
                </div>

                {filteredTasks.length === 0 ? (
                    <div className="text-center flex justify-center items-center py-8 text-gray-500 h-80">
                        No data available
                    </div>
                ) : (
                    <AgTable
                        tableHeight={300}
                        hideFilter
                        columns={tasksColumns}
                        data={filteredTasks.map((item, index) => ({
                            id: index + 1,
                            taskName: item.taskName,
                            assignedTo: item.assignedTo,
                            assignedBy: item.assignedBy,
                            assignedDate: item.assignedDate,
                            dueDate: item.dueDate,
                            status: item.status,
                        }))}
                    />
                )}
            </WidgetSection>
        </div>
    );
};

export default PerformanceDepartmentKPA;