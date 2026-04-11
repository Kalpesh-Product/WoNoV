import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedDepartment } from "../../../redux/slices/performanceSlice";
import { useTopDepartment } from "../../../hooks/useTopDepartment";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import { CircularProgress, Popover } from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday } from "react-icons/md";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DepartmentTasks = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [dateRange, setDateRange] = useState([
    {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    },
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openCalendar = Boolean(anchorEl);

  const handleOpenCalendar = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCalendar = () => {
    setAnchorEl(null);
  };

  const handleDateRangeChange = (item) => {
    const selectedDate = dayjs(item.selection.startDate || new Date());
    const startDate = selectedDate.startOf("month").toDate();
    const endDate = selectedDate.endOf("month").toDate();

    setDateRange([
      {
        startDate,
        endDate,
        key: "selection",
      },
    ]);
    setSelectedMonth(dayjs(startDate).format("YYYY-MM"));
  };

  useTopDepartment({
    additionalTopUserIds: ["6961fcd737afa664ab215d10"], // Kiran 
    onNotTop: () => {
      dispatch(setSelectedDepartment(currentDepartmentId));
      navigate(`/app/tasks/department-tasks/${currentDepartment}`);
    },
  });

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("api/tasks/get-depts-tasks", {
        params: { month: selectedMonth },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: fetchedDepartments = [], isPending: departmentLoading } =
    useQuery({
      queryKey: ["fetchedDepartmentsTasks", selectedMonth],
      queryFn: fetchDepartments,
    });

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    {
      headerName: "Department",
      field: "department",
      cellRenderer: (params) => {
        return (
          <span
            role="button"
            onClick={() => {
              dispatch(setSelectedDepartment(params.data.mongoId));
              navigate(`${params.value}`);
            }}
            className="text-primary font-pregular hover:underline cursor-pointer"
          >
            {params.value}
          </span>
        );
      },
    },
    { headerName: "Total Current Month's Tasks", field: "totalTasks", flex: 1 },
    { headerName: "Pending Tasks", field: "pendingTasks" },
    { headerName: "Completed Tasks", field: "completedTasks" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <WidgetSection layout={1} padding>
          {departmentLoading ? (
            <div className="flex justify-center items-center py-20">
              <CircularProgress />
            </div>
          ) : (
            <>
              {/* ✅ Header */}
              <div className="w-full pb-3">
                
                {/* Heading */}
                <div className="flex justify-start">
                  <span className="text-title text-primary font-pmedium uppercase">
                    ACTIVE DEPARTMENT WISE TASKS
                  </span>
                </div>

                {/* Calendar (Below Heading) */}
                <div className="flex justify-center mt-5">
                  <div className="flex items-center gap-2">
                    <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                      <span className="text-gray-600 text-content font-pregular">
                        {dayjs(dateRange[0]?.startDate).format("DD MMM YYYY")}
                      </span>
                    </div>
                    <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                      <span className="text-gray-600 text-content font-pregular">
                        {dayjs(dateRange[0]?.endDate).format("DD MMM YYYY")}
                      </span>
                    </div>
                    <div
                      className="p-2 rounded-md bg-primary text-white cursor-pointer hover:bg-[#1E3D55]"
                      onClick={handleOpenCalendar}
                    >
                      <MdCalendarToday size={19} />
                    </div>
                  </div>
                </div>

              </div>

              <AgTable
                data={fetchedDepartments.map((item, index) => ({
                  srNo: index + 1,
                  mongoId: item.department?._id,
                  department: item.department?.name,
                  totalTasks: item.totalTasks,
                  pendingTasks: item.pendingTasks,
                  completedTasks: item.completedTasks,
                }))}
                columns={departmentColumns}
                tableTitle="ACTIVE DEPARTMENT WISE TASKS"
                hideTitle
                hideFilter
              />
            </>
          )}
        </WidgetSection>
        <Popover
          open={openCalendar}
          anchorEl={anchorEl}
          onClose={handleCloseCalendar}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <DateRangePicker
            ranges={dateRange}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
          />
        </Popover>
      </PageFrame>
    </div>
  );
};

export default DepartmentTasks;