import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import WidgetSection from "../../components/WidgetSection";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";
import AgTable from "../../components/AgTable";
import SecondaryButton from "../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const fiscalMonths = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
];

const PerformanceOverallKPA = () => {
    const axios = useAxiosPrivate();
    const location = useLocation();
    const navigate = useNavigate();

    const clickedMonth = location.state?.month;
    const [selectedMonth, setSelectedMonth] = useState(clickedMonth || fiscalMonths[0]);

    const { data: kpaTasksRaw = [] } = useQuery({
        queryKey: ["performanceKpaTasks"],
        queryFn: async () => {
            const response = await axios.get("/api/performance/get-kpa-tasks");
            return response.data || [];
        },
    });

    const currentMonthIndex = fiscalMonths.findIndex(
        (month) => month.toLowerCase() === selectedMonth.toLowerCase()
    );

    const allDepartments = useMemo(
        () => kpaTasksRaw.map((departmentTasks) => departmentTasks.department),
        [kpaTasksRaw]
    );

    const filteredTasks = useMemo(() => {
        if (!selectedMonth) return [];

        return kpaTasksRaw.flatMap((departmentTasks) =>
            (departmentTasks.tasks || [])
                .filter((task) => {
                    const taskDate = new Date(task.assignedDate);
                    if (Number.isNaN(taskDate.getTime())) return false;

                    const taskFiscalMonth = fiscalMonths[(taskDate.getMonth() + 9) % 12];
                    return taskFiscalMonth.toLowerCase() === selectedMonth.toLowerCase();
                })
                .map((task) => ({
                    ...task,
                    department: departmentTasks.department,
                }))
        );
    }, [kpaTasksRaw, selectedMonth]);

    const groupedTasks = useMemo(
        () =>
            filteredTasks.reduce((acc, task) => {
                if (!acc[task.department]) {
                    acc[task.department] = [];
                }
                acc[task.department].push(task);
                return acc;
            }, {}),
        [filteredTasks]
    );

    const departmentMap = useMemo(() => {
        const map = {};

        allDepartments.forEach((department) => {
            map[department] = { total: 0, achieved: 0 };
        });

        filteredTasks.forEach((task) => {
            map[task.department].total += 1;
            if (task.status === "Completed") {
                map[task.department].achieved += 1;
            }
        });

        return map;
    }, [allDepartments, filteredTasks]);

    const graphData = [
        {
            name: "Completed KPA",
            group: `KPA - ${selectedMonth}`,
            data: allDepartments.map((department) => {
                const { total, achieved } = departmentMap[department] || {
                    total: 0,
                    achieved: 0,
                };
                const percent = total ? +((achieved / total) * 100).toFixed(1) : 0;
                return { x: department, y: percent, raw: achieved };
            }),
        },
        {
            name: "Remaining KPA",
            group: `KPA - ${selectedMonth}`,
            data: allDepartments.map((department) => {
                const { total, achieved } = departmentMap[department] || {
                    total: 0,
                    achieved: 0,
                };
                const remaining = total - achieved;
                const percent = total ? +((remaining / total) * 100).toFixed(1) : 0;
                return { x: department, y: percent, raw: remaining };
            }),
        },
    ];

    const openDepartment = (department) => {
        // navigate(`/app/performance/overall-KPA/department-KPA/${department}`, {
         navigate(`/app/performance/overall-department-kpa/department-KPA/${department}`, {
            state: {
                month: selectedMonth,
                department,
                tasks: groupedTasks[department] || [],
            },
        });
    };

    const graphOptions = {
        chart: {
            type: "bar",
            stacked: true,
            animations: { enabled: false },
            toolbar: { show: false },
            fontFamily: "Poppins-Regular",
            events: {
                dataPointSelection: (event, chartContext, config) => {
                    const clickedDepartment =
                        config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
                    openDepartment(clickedDepartment);
                },
            },
        },
        plotOptions: {
            bar: { horizontal: false, columnWidth: "20%", borderRadius: 3 },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 1, colors: ["#fff"] },
        xaxis: {
            title: { text: "Departments" },
            categories: allDepartments,
        },
        yaxis: {
            title: { text: "Completion (%)" },
            max: 100,
            labels: { formatter: (value) => `${value.toFixed(0)}%` },
        },
        colors: ["#54C4A7", "#EB5C45"],
        fill: { opacity: 1 },
        legend: { position: "top" },
         tooltip: {
            custom: ({ series, dataPointIndex, w }) => {
                const label =
                    w?.config?.series?.[0]?.data?.[dataPointIndex]?.x || "Department";
                const completed =
                    w?.config?.series?.[0]?.data?.[dataPointIndex]?.raw ??
                    series?.[0]?.[dataPointIndex] ??
                    0;
                const pending =
                    w?.config?.series?.[1]?.data?.[dataPointIndex]?.raw ??
                    series?.[1]?.[dataPointIndex] ??
                    0;
                const total = completed + pending;

                return `
                    <div style="padding:8px; font-family:Poppins, sans-serif; font-size:13px; width:220px;">
                        <strong>${label}</strong><br/>
                        <hr style="margin:6px 0; border-top:1px solid #ddd;" />
                        <div style="display:flex; justify-content:space-between;"><span>Total KPA :</span><span>${total}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Completed KPA :</span><span>${completed}</span></div>
                        <hr style="margin:6px 0; border-top:1px solid #ddd;" />
                        <div style="display:flex; justify-content:space-between;"><span>Pending KPA :</span><span>${pending}</span></div>
                    </div>
                `;
            },
        },
    };

    const tableData = allDepartments.map((department) => {
        const tasks = groupedTasks[department] || [];
        const total = tasks.length;
        const achieved = tasks.filter((task) => task.status === "Completed").length;

        return {
            department,
            totalTasks: total,
            achievedTasks: achieved,
            achievedPercent: `${total > 0 ? ((achieved / total) * 100).toFixed(0) : "0"}%`,
            shortFall: `${total > 0 ? (((total - achieved) / total) * 100).toFixed(0) : "0"}%`,
        };
    });

    const totalCompleted = filteredTasks.filter((task) => task.status === "Completed").length;
    const totalRemaining = filteredTasks.filter((task) => task.status !== "Completed").length;

    return (
        <div className="flex flex-col gap-4">
            <WidgetSection
                title={`KPA overview - ${selectedMonth}`}
                border
                padding
                greenTitle="completed"
                TitleAmountGreen={totalCompleted}
                redTitle="remaining"
                TitleAmountRed={totalRemaining}
            >
                <NormalBarGraph data={graphData} options={graphOptions} year={false} height={400} />

                <div className="flex justify-center items-center pb-4">
                    <div className="flex items-center">
                        <SecondaryButton
                            title={<MdNavigateBefore />}
                            handleSubmit={() => {
                                if (currentMonthIndex > 0) {
                                    setSelectedMonth(fiscalMonths[currentMonthIndex - 1]);
                                }
                            }}
                        />
                        <div className="text-sm min-w-[120px] text-center">{selectedMonth}</div>
                        <SecondaryButton
                            title={<MdNavigateNext />}
                            handleSubmit={() => {
                                if (currentMonthIndex < fiscalMonths.length - 1) {
                                    setSelectedMonth(fiscalMonths[currentMonthIndex + 1]);
                                }
                            }}
                        />
                    </div>
                </div>
            </WidgetSection>

            <WidgetSection
                title="Department-wise KPA overview"
                border
                TitleAmount={`TOTAL Tasks : ${tableData.reduce((sum, item) => sum + item.totalTasks, 0)}`}
            >
                <AgTable
                    columns={[
                        {
                            headerName: "Sr No",
                            field: "id",
                            valueGetter: (params) => params.node.rowIndex + 1,
                            width: 100,
                        },
                        {
                            field: "department",
                            headerName: "Department",
                            flex: 1,
                            cellRenderer: (params) => (
                                <span
                                    role="button"
                                    onClick={() => openDepartment(params.value)}
                                    className="text-primary underline cursor-pointer"
                                >
                                    {params.value}
                                </span>
                            ),
                        },
                        { field: "totalTasks", headerName: "Total", flex: 1 },
                        { field: "achievedTasks", headerName: "Achieved", flex: 1 },
                        { field: "achievedPercent", headerName: "Achieved (%)", flex: 1 },
                        { field: "shortFall", headerName: "Shortfall (%)", flex: 1 },
                    ]}
                    data={tableData}
                    tableHeight={300}
                    hideFilter
                />
            </WidgetSection>
        </div>
    );
};

export default PerformanceOverallKPA;