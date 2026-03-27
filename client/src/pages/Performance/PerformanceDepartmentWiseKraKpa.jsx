import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import {
    setSelectedDepartment,
    setSelectedDepartmentName,
} from "../../redux/slices/performanceSlice";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";
import SecondaryButton from "../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useState } from "react";

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

const PerformanceDepartmentWiseKraKpa = () => {
    const axios = useAxiosPrivate();
    const { auth } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const clickedMonth = location.state?.month;
    const [selectedMonth, setSelectedMonth] = useState(clickedMonth || fiscalMonths[0]);
    const userDepartmentIds =
        auth?.user?.departments?.map((dept) => dept?._id?.toString()).filter(Boolean) || [];

    const { isTop } = useTopDepartment({
        additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
    });

    const { data: fetchedDepartments = [] } = useQuery({
        queryKey: ["fetchedDepartments", selectedMonth],
        queryFn: async () => {
            const response = await axios.get("/api/performance/get-depts-tasks", {
                params: { month: selectedMonth },
            });
            return response.data || [];
        },
    });

    const currentMonthIndex = fiscalMonths.findIndex(
        (month) => month.toLowerCase() === selectedMonth.toLowerCase()
    );

    const getDepartmentKraTotal = (departmentData) =>
        (departmentData?.dailyKRA || 0) +
        (departmentData?.individualDailyKRA || 0) +
        (departmentData?.teamDailyKRA || 0);

    const getDepartmentKpaTotal = (departmentData) =>
        (departmentData?.monthlyKPA || 0) +
        (departmentData?.individualMonthlyKPA || 0) +
        (departmentData?.teamMonthlyKPA || 0);

    const visibleDepartments = fetchedDepartments.filter((item) => {
        if (isTop) return true;
        return userDepartmentIds.includes(item?.department?._id?.toString());
    });

    const totalKra = visibleDepartments.reduce(
        (sum, item) => sum + getDepartmentKraTotal(item),
        0
    );
    const totalKpa = visibleDepartments.reduce(
        (sum, item) => sum + getDepartmentKpaTotal(item),
        0
    );

    const graphData = [
        {
            name: "KRA",
            group: `KRA/KPA - ${selectedMonth}`,
            data: visibleDepartments.map((item) => ({
                x: item.department?.name,
                y: getDepartmentKraTotal(item),
            })),
        },
        {
            name: "KPA",
            group: `KRA/KPA - ${selectedMonth}`,
            data: visibleDepartments.map((item) => ({
                x: item.department?.name,
                y: getDepartmentKpaTotal(item),
            })),
        },
    ];

    const graphOptions = {
        chart: {
            type: "bar",
            stacked: false,
            animations: { enabled: false },
            toolbar: { show: false },
            fontFamily: "Poppins-Regular",
            events: {
                dataPointSelection: (event, chartContext, config) => {
                    const clickedDepartment = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
                    const departmentData = visibleDepartments.find(
                        (item) => item.department?.name === clickedDepartment
                    );
                    if (departmentData) {
                        dispatch(setSelectedDepartment(departmentData.department?._id));
                        dispatch(setSelectedDepartmentName(departmentData.department?.name));
                        navigate(
                            `/app/performance/overall-KPA/department-wise-KPA/member-wise-kra-kpa/${departmentData.department?.name}`,
                            { state: { month: selectedMonth } }
                        );
                    }
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
            categories: visibleDepartments.map((item) => item.department?.name),
        },
        yaxis: {
            title: { text: "Count" },
        },
        colors: ["#5A9BD5", "#54C4A7"],
        fill: { opacity: 1 },
        legend: { position: "top" },
    };

    const departmentColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        {
            headerName: "Department",
            field: "department",
            flex: 1,
            cellRenderer: (params) => (
                <span
                    role="button"
                    onClick={() => {
                        dispatch(setSelectedDepartment(params.data.mongoId));
                        dispatch(setSelectedDepartmentName(params.data.department));
                        navigate(
                            `/app/performance/overall-KPA/department-wise-KPA/member-wise-kra-kpa/${params.value}`,
                            { state: { month: selectedMonth } }
                        );
                    }}
                    className="text-primary font-pregular hover:underline cursor-pointer"
                >
                    {params.value}
                </span>
            ),
        },
        { headerName: "Daily KRA", field: "dailyKra" },
        { headerName: "Monthly KPA", field: "monthlyKpa" },
        { headerName: "Individual Daily KRA", field: "individualDailyKra" },
        { headerName: "Individual Monthly KPA", field: "individualMonthlyKpa" },
        { headerName: "Team Daily KRA", field: "teamDailyKra" },
        { headerName: "Team Monthly KPA", field: "teamMonthlyKpa" },
    ];

    return (
        <div className="flex flex-col gap-4">
            <PageFrame>
                <WidgetSection
                    title={`KRA/KPA overview - ${selectedMonth}`}
                    border
                    padding
                    greenTitle="kpa"
                    TitleAmountGreen={totalKpa}
                    redTitle="kra"
                    TitleAmountRed={totalKra}
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
                <WidgetSection layout={1} padding>
                    <AgTable
                        data={visibleDepartments.map((item, index) => ({
                            srNo: index + 1,
                            mongoId: item.department?._id,
                            department: item.department?.name,
                            dailyKra: item.dailyKRA,
                            monthlyKpa: item.monthlyKPA,
                            individualDailyKra: item.individualDailyKRA,
                            individualMonthlyKpa: item.individualMonthlyKPA,
                            teamDailyKra: item.teamDailyKRA,
                            teamMonthlyKpa: item.teamMonthlyKPA,
                            annualKpa: item.annualKPA,
                        }))}
                        columns={departmentColumns}
                        tableTitle="DEPARTMENT WISE KRA/KPA"
                        hideFilter
                    />
                </WidgetSection>
            </PageFrame>
        </div>
    );
};

export default PerformanceDepartmentWiseKraKpa;