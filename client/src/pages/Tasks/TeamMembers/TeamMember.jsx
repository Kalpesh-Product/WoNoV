import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useState } from "react";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { CircularProgress } from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import PageFrame from "../../../components/Pages/PageFrame";
import dayjs from "dayjs";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../../../hooks/useAuth";
import { setSelectedDepartment } from "../../../redux/slices/performanceSlice";

const TeamMember = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const { auth } = useAuth();
  const deptId = useSelector((state) => state.performance.selectedDepartment);
  const currentDepartmentId = auth?.user?.departments?.[0]?._id;
  const effectiveDeptId = deptId || currentDepartmentId;
  const [openModal, setOpenModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  React.useEffect(() => {
    if (!deptId && currentDepartmentId) {
      dispatch(setSelectedDepartment(currentDepartmentId));
    }
  }, [currentDepartmentId, deptId, dispatch]);
  const { data: taskList, isLoading } = useQuery({
    queryKey: ["taskList", selectedMonth.format("YYYY-MM")],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tasks/get-team-tasks?month=${selectedMonth.format("YYYY-MM")}`,
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const { data: departmentWideTasks = [] } = useQuery({
    queryKey: ["team-member-department-wide-tasks"],
    queryFn: async () => {
      const response = await axios.get("/api/tasks/get-all-tasks");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const handleSelectedMember = (meeting) => {
    setSelectedMember(meeting);
    setOpenModal(true);
  };

  const teamMembersColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "tasks", headerName: "Department Completed Task", flex: 1 },
    // { field: "status", headerName: "Status", flex: 1 },
    // {
    //   field: "action",
    //   headerName: "Actions",
    //   cellRenderer: (params) => {
    //     return (
    //       <>
    //         <div className="flex gap-2 items-center">
    //           <div
    //             onClick={() => {
    //               handleSelectedMember(params.data);
    //             }}
    //             className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all">
    //             <span className="text-subtitle">
    //               <MdOutlineRemoveRedEye />
    //             </span>
    //           </div>
    //         </div>
    //       </>
    //     );
    //   },
    // },
  ];

  const teamMembersData = [
    {
      srNo: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Frontend Dev",
      projects: 3,
      task: 12,
      status: "Active",
    },
    {
      srNo: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Backend Dev",
      projects: 5,
      task: 18,
      status: "Away",
    },
    {
      srNo: 3,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "Tester",
      projects: 2,
      task: 9,
      status: "Offline",
    },
    {
      srNo: 4,
      name: "Robert Brown",
      email: "robert.brown@example.com",
      role: "Frontend Dev",
      projects: 4,
      task: 15,
      status: "Active",
    },
    {
      srNo: 5,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Backend Dev",
      projects: 6,
      task: 20,
      status: "Active",
    },
    {
      srNo: 6,
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      role: "Tester",
      projects: 3,
      task: 10,
      status: "Away",
    },
    {
      srNo: 7,
      name: "Sophia Martinez",
      email: "sophia.martinez@example.com",
      role: "Frontend Dev",
      projects: 2,
      task: 7,
      status: "Offline",
    },
    {
      srNo: 8,
      name: "Daniel Thomas",
      email: "daniel.thomas@example.com",
      role: "Backend Dev",
      projects: 5,
      task: 14,
      status: "Active",
    },
    {
      srNo: 9,
      name: "Olivia Harris",
      email: "olivia.harris@example.com",
      role: "Tester",
      projects: 1,
      task: 5,
      status: "Away",
    },
    {
      srNo: 10,
      name: "William Clark",
      email: "william.clark@example.com",
      role: "Frontend Dev",
      projects: 3,
      task: 11,
      status: "Active",
    },
  ];

  const handleMonthRangeChange = ({ selectedRange }) => {
    setSelectedMonth((prev) => {
      const prevStart = prev ? dayjs(prev).startOf("month").valueOf() : null;
      const nextStart = selectedRange?.startDate
        ? dayjs(selectedRange.startDate).startOf("month").valueOf()
        : null;

      if (prevStart === nextStart || nextStart === null) {
        return prev;
      }

      return dayjs(selectedRange.startDate);
    });
  };

  const taskSummary = React.useMemo(() => {
    const selectedDepartmentName =
      auth?.user?.departments?.find((dept) => dept?._id === effectiveDeptId)
        ?.name ||
      (Array.isArray(taskList) && taskList.length > 0
        ? Array.isArray(taskList[0]?.department)
          ? taskList[0].department[0] || ""
          : taskList[0]?.department || ""
        : "");

    const isSelectedMonthTask = (value) => {
      if (!value) return false;
      const date = dayjs(value);
      return date.isValid() && date.isSame(selectedMonth, "month");
    };

    const departmentTasks = (departmentWideTasks || []).filter(
      (task) =>
        task?.taskType === "Department" &&
        task?.isDeleted !== true &&
        isSelectedMonthTask(task?.assignedDate) &&
        String(task?.department || "").toLowerCase() ===
          String(selectedDepartmentName || "").toLowerCase(),
    );

    const pendingTasks = departmentTasks.filter(
      (task) => String(task?.status || "").toLowerCase() !== "completed",
    );
    const completedTasks = departmentTasks.filter(
      (task) => String(task?.status || "").toLowerCase() === "completed",
    );

    return {
      total: pendingTasks.length + completedTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
    };
  }, [
    auth?.user?.departments,
    departmentWideTasks,
    effectiveDeptId,
    selectedMonth,
    taskList,
  ]);

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <div>
          <div className="flex justify-end items-center gap-1.5 flex-wrap pb-4">
            <div className="flex gap-1 justify-center items-center uppercase bg-[#dbe4ff] text-sm text-[#274784] font-pmedium px-3 py-1.5 rounded-lg border border-[#aec6fb]">
              <div>Total :</div>
              <div>{taskSummary.total}</div>
            </div>
            <div className="flex gap-1 justify-center items-center uppercase bg-[#d8f0df] text-sm text-[#16784d] font-pmedium px-3 py-1.5 rounded-lg border border-[#a9ddba]">
              <div>Completed :</div>
              <div>{taskSummary.completed}</div>
            </div>
            <div className="flex gap-1 justify-center items-center uppercase bg-[#fce8e3] text-sm text-[#d96b4f] font-pmedium px-3 py-1.5 rounded-lg border border-[#f3b7a8]">
              <div>Pending :</div>
              <div>{taskSummary.pending}</div>
            </div>
          </div>
          <YearWiseTable
            search={true}
            tableTitle={`Team Members - ${selectedMonth.format("MMMM")}`}
            dateColumn={"reportMonthDate"}
            data={
              isLoading || !Array.isArray(taskList)
                ? []
                : taskList.map((task, index) => ({
                    srNo: index + 1,
                    name: task.name,
                    email: task.email,
                    role: task.role,
                    tasks: task.tasks,
                    status: task.status,
                    reportMonthDate: selectedMonth.startOf("month").toISOString(),
                  }))
            }
            columns={teamMembersColumn}
            onDateFilterChange={handleMonthRangeChange}
          />
        </div>
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Team Member Details"}
      >
        {!isLoading && selectedMember ? (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title="Name" detail={selectedMember?.name} />
            <DetalisFormatted title="Email" detail={selectedMember?.email} />
            <DetalisFormatted title="Role" detail={selectedMember?.role} />
            <DetalisFormatted title="Tasks" detail={selectedMember?.tasks} />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default TeamMember;
