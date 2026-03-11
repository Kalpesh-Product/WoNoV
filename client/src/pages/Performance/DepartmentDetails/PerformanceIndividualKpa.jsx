import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../components/MuiModal";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { PERMISSIONS } from "../../../constants/permissions";
import { queryClient } from "../../../main";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import {
    setSelectedDepartment,
    setSelectedDepartmentName,
} from "../../../redux/slices/performanceSlice";
import { FaCheckSquare } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const PerformanceIndividualKpa = () => {
    const axios = useAxiosPrivate();
    const dispatch = useDispatch();
    const { auth } = useAuth();
    const { department } = useParams();
    const [openModal, setOpenModal] = useState(false);
    const deptId = useSelector((state) => state.performance.selectedDepartment);

    const restrictedRoles = [
        "IT Employee",
        "Admin Employee",
        "Tech Employee",
        "Administration Employee",
        "HR Employee",
        "Maintenance Employee",
        "Cafe Employee",
        "Finance Employee",
        "Marketing Employee",
    ];

    const isAddKpaDisabled = auth?.user?.role?.some((role) =>
        restrictedRoles.includes(role.roleTitle)
    );
    const canDeleteRecurrence = !isAddKpaDisabled;

    const departmentAccess = [
        "67b2cf85b9b6ed5cedeb9a2e",
        "6798bab9e469e809084e249e",
    ];

    const isTop = auth.user.departments.some((item) => {
        return departmentAccess.includes(item._id.toString());
    });

    const allowedDept = auth.user.departments.some((item) => {
        return item._id.toString() === deptId.toString();
    });

    const userId = auth.user._id;
    const userPermissions = auth?.user?.permissions?.permissions || [];
    const isManager = userPermissions.includes(PERMISSIONS.PERFORMANCE_DAILY_KRA.value);
    const isHr = department === "HR";
    // const showCheckBox = !isTop || isHr
    const showCheckBox = allowedDept;

    const matchingDepartment = auth.user?.departments?.some(
        (dept) => dept._id === deptId
    );

    const {
        handleSubmit: submitDailyKra,
        control,
        formState: { errors },
        watch,
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            kpaName: "",
            startDate: null,
            endDate: null,
            description: "",
            assignTo: "",
        },
    });
    const startDate = watch("startDate");

    const { mutate: deleteMonthlyKpaRecurrence, isPending: isDeletePending } = useMutation({
        mutationKey: ["deleteMonthlyKpaRecurrence"],
        mutationFn: async (taskId) => {
            const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
            queryClient.refetchQueries({ queryKey: ["completedEntriesKPA"] });
            toast.success(data.message || "KPA recurrence removed");
        },
        onError: () => {
            toast.error("Failed to remove recurrence");
        },
    });

    //--------------POST REQUEST FOR MONTHLY KPA-----------------//
    const { mutate: addMonthlyKpa, isPending: isAddKpaPending } = useMutation({
        mutationKey: ["addMonthlyKpa"],
        mutationFn: async (data) => {
            const response = await axios.post("/api/performance/create-task", {
                task: data.kpaName,
                taskType: "INDIVIDUALKPA",
                // description: data.description,
                department: deptId,
                assignedDate: data.startDate,
                dueDate: data.endDate,
                kpaDuration: "Monthly",
                assignTo: data.assignTo,
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
            queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] });
            toast.success(data.message || "KPA Added");
            reset();
            reset();
            setOpenModal(false);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Error Adding KPA");
        },
    });

    const handleFormSubmit = (data) => {
        const payload = {
            ...data,
            assignTo: userId,
        };
        addMonthlyKpa(payload);
    };
    //--------------POST REQUEST FOR MONTHLY KPA-----------------//
    //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//
    const { mutate: updateMonthlyKpa, isPending: isUpdatePending } = useMutation({
        mutationKey: ["updateMonthlyKpa"],
        mutationFn: async (data) => {
            const response = await axios.patch(
                `/api/performance/update-status/${data}/KPA`
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
            queryClient.refetchQueries({ queryKey: ["completedEntriesKPA"] });
            queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] });
            queryClient.invalidateQueries({ queryKey: ["completedEntriesKPA"] });
            toast.success(data.message || "KPA updated");
        },
        onError: (error) => {
            // toast.success("KPA updated");
            toast.error(error.message || "Error Updating");
        },
    });
    //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                `/api/performance/get-tasks?dept=${deptId}&type=INDIVIDUALKPA`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
        queryKey: ["fetchedMonthlyKPA"],
        queryFn: fetchTasks,
    });

    // const { data: assignees = [] } = useQuery({
    //     queryKey: ["fetchAssignees", deptId],
    //     queryFn: async () => {
    //         const response = await axios.get(`/api/user/assignees?deptId=${deptId}`);
    //         return response.data;
    //     },
    //     enabled: !!deptId,
    // });
    const { data: completedEntries, isLoading: isCompletedLoading } = useQuery({
        queryKey: ["completedEntriesKPA"],
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `/api/performance/get-completed-tasks?dept=${deptId}&type=INDIVIDUALKPA`
                );
                return response.data;
            } catch (error) {
                console.error(error);
            }
        },
    });

    const formatDateTime = (value) =>
        value ? `${humanDate(value)}, ${humanTime(value)}` : "N/A";

    const departmentColumns = [
        { headerName: "Sr no", field: "srNo", width: 100 },
        { headerName: "KPA List", field: "taskName", flex: 1 },
        {
            headerName: "Start Date",
            field: "assignedDate",
            cellRenderer: (params) => formatDateTime(params.value),
        },
        {
            headerName: "End Date",
            field: "dueDate",
            cellRenderer: (params) => formatDateTime(params.value),
        },
        {
            field: "status",
            headerName: "Status",
            cellRenderer: (params) => {
                const statusColorMap = {
                    Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
                    InProgress: { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
                    resolved: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
                    open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
                    Completed: { backgroundColor: "#16f8062c", color: "#00731b" }, // Light gray bg, dark gray font
                };

                const { backgroundColor, color } = statusColorMap[params.value] || {
                    backgroundColor: "gray",
                    color: "white",
                };
                return (
                    <>
                        <Chip
                            label={params.value}
                            style={{
                                backgroundColor,
                                color,
                            }}
                        />
                    </>
                );
            },
        },
        ...(matchingDepartment
            ? [
                {
                    headerName: "Actions",
                    field: "actions",
                    cellRenderer: (params) => (
                        <div className="p-2 flex gap-2 items-center">
                            <button
                                type="button"
                                title="Mark As Done"
                                disabled={!params.node.selected || isUpdatePending || isDeletePending}
                                onClick={() => updateMonthlyKpa(params.data.mongoId)}
                                className="ml-2 disabled:cursor-not-allowed"
                            >
                                {isUpdatePending ? "⏳" : <FaCheckSquare size={24} color={!params.node.selected ? "gray" : "green"} />}
                            </button>
                            {canDeleteRecurrence && (
                                <button
                                    type="button"
                                    title="Delete Recurrence"
                                    disabled={!params.node.selected || isDeletePending || isUpdatePending}
                                    onClick={() => deleteMonthlyKpaRecurrence(params.data.mongoId)}
                                    className="ml-2 disabled:cursor-not-allowed"
                                >
                                    {isDeletePending ? "⏳" : <MdDeleteForever size={26} color={!params.node.selected ? "gray" : "red"} />}
                                </button>
                            )}
                        </div>
                    ),
                },
            ]
            : []),
    ];

    const completedColumns = [
        { headerName: "Sr no", field: "srNo", width: 100, sort: "desc" },
        { headerName: "KPA List", field: "taskName", width: 300 },

        { headerName: "Completed By", field: "completedBy" },
        {
            headerName: "Completed Date",
            field: "completionDate",
        },
        {
            headerName: "Completed Time",
            field: "completionTime",
        },
        {
            field: "status",
            headerName: "Status",
            cellRenderer: (params) => {
                const statusColorMap = {
                    Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
                    InProgress: { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
                    resolved: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
                    open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
                    Completed: { backgroundColor: "#16f8062c", color: "#00731b" }, // Light gray bg, dark gray font
                };

                const { backgroundColor, color } = statusColorMap[params.value] || {
                    backgroundColor: "gray",
                    color: "white",
                };
                return (
                    <>
                        <Chip
                            label={params.value}
                            style={{
                                backgroundColor,
                                color,
                            }}
                        />
                    </>
                );
            },
        },
    ];
    return (
        <>
            <div className="flex flex-col gap-4">
                <PageFrame>
                    {!isCompletedLoading && !isUpdatePending ? (
                        <WidgetSection padding layout={1}>
                            <YearWiseTable
                                checkbox={showCheckBox}
                                tableTitle={`${department} INDIVIDUAL - MONTHLY KPA`}
                                buttonTitle={"Add Monthly KPA"}
                                buttonDisabled={isAddKpaDisabled}
                                handleSubmit={() => setOpenModal(true)}
                                key={departmentKra.length}
                                data={[
                                    ...departmentKra
                                        .filter((item) => item.status !== "Completed")
                                        .map((item, index) => ({
                                            mongoId: item.id,
                                            taskName: item.taskName,
                                            assignedDate: item.assignedDate,
                                            dueDate: item.dueDate,
                                            status: item.status,
                                            assignedTo: item.assignedTo,
                                        })),
                                ]}
                                dateColumn={"dueDate"}
                                columns={departmentColumns}
                            />
                        </WidgetSection>
                    ) : (
                        <div className="h-72 flex items-center justify-center">
                            <CircularProgress />
                        </div>
                    )}
                </PageFrame>
                <PageFrame>
                    {!isCompletedLoading ? (
                        <WidgetSection padding layout={1}>
                            <YearWiseTable
                                exportData={true}
                                tableTitle={`COMPLETED INDIVIDUAL - MONTHLY KPA`}
                                key={completedEntries.length}
                                data={[
                                    ...completedEntries.map((item, index) => ({
                                        taskName: item.taskName,
                                        assignedDate: item.assignedDate,
                                        completionDate: humanDate(item.completionDate),
                                        completionTime: humanTime(item.completionDate),
                                        completedBy: item.completedBy,
                                        status: item.status,
                                    })),
                                ]}
                                dateColumn={"dueDate"}
                                columns={completedColumns}
                            />
                        </WidgetSection>
                    ) : (
                        <div className="h-72 flex items-center justify-center">
                            <CircularProgress />
                        </div>
                    )}
                </PageFrame>
            </div>

            <MuiModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                title={"Add Monthly KPA"}
            >
                <form
                    onSubmit={submitDailyKra(handleFormSubmit)}
                    className="grid grid-cols-1 lg:grid-cols-1 gap-4"
                >
                    <Controller
                        name="kpaName"
                        control={control}
                        rules={{
                            required: "KPA Name is required",
                            validate: {
                                noOnlyWhitespace,
                                isAlphanumeric,
                            },
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                size="small"
                                label={"KPA Name"}
                                fullWidth
                                error={!!errors?.kpaName?.message}
                                helperText={errors?.kpaName?.message}
                            />
                        )}
                    />
                    {/* <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label={"Description"}
                multiline
                rows={4}
                fullWidth
                error={!!errors?.description?.message}
                helperText={errors?.description?.message}
              />
            )}
          /> */}
                    <Controller
                        name="startDate"
                        control={control}
                        rules={{
                            required: "Start date is required",
                            validate: (value) => {
                                if (!value) return true; // already handled by required
                                const today = dayjs().startOf("day");
                                const selected = dayjs(value);
                                if (selected.isBefore(today)) {
                                    return "Start date cannot be in the past.";
                                }
                                return true;
                            },
                        }}
                        render={({ field, fieldState }) => (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    {...field}
                                    label="Start Date"
                                    format="DD-MM-YYYY"
                                    disablePast
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) =>
                                        field.onChange(date ? date.toISOString() : null)
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: "small",
                                            error: !!fieldState.error,
                                            helperText: fieldState.error?.message,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        )}
                    />

                    <Controller
                        name="endDate"
                        control={control}
                        rules={{
                            validate: (value) => {
                                if (!value) return "End date is required";
                                const today = dayjs().startOf("day");
                                const selected = dayjs(value);
                                if (!selected.isValid()) return "Invalid date selected";
                                if (selected.isBefore(today)) {
                                    return "End date cannot be in the past.";
                                }
                                return true;
                            },
                        }}
                        render={({ field, fieldState }) => (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    {...field}
                                    label="End Date"
                                    disablePast
                                    format="DD-MM-YYYY"
                                    disabled={!startDate}
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) =>
                                        field.onChange(date ? date.toISOString() : null)
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: "small",
                                            error: !!fieldState.error,
                                            helperText: fieldState.error?.message,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        )}
                    />

                    {/* removed assignTo dropdown */}

                    <PrimaryButton
                        type="submit"
                        title={"Submit"}
                        disabled={isAddKpaPending}
                        isLoading={isAddKpaPending}
                    />
                </form>
            </MuiModal>
        </>
    );
};

export default PerformanceIndividualKpa;
