import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import MuiModal from "../../../components/MuiModal";
import { PERMISSIONS } from "../../../constants/permissions";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import useAuth from "../../../hooks/useAuth";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import { FaCheck } from "react-icons/fa6";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PageFrame from "../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";

const PerformanceTeamKra = () => {
    const axios = useAxiosPrivate();
    const { auth } = useAuth();
    const { department } = useParams();
    const [openModal, setOpenModal] = useState(false);
    const deptId = useSelector((state) => state.performance.selectedDepartment);
    const userId = auth.user._id;

    const userPermissions = auth?.user?.permissions?.permissions || [];
    const isManager = userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value);

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["fetchedTeamKRA"] });
    }, [department]);

    const {
        handleSubmit: submitDailyKra,
        control,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            teamDailyKra: "",
            assignTo: [], // Multi-select
            assignedDate: dayjs().toISOString(),
        },
    });

    const { mutate: addDailyKra, isPending: isAddKraPending } = useMutation({
        mutationKey: ["addTeamDailyKra"],
        mutationFn: async (data) => {
            const response = await axios.post("/api/performance/create-task", {
                task: data.teamDailyKra,
                taskType: "TEAMKRA",
                department: deptId,
                assignedDate: data.assignedDate,
                assignTo: data.assignTo,
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["fetchedTeamKRA"] });
            toast.success(data.message || "Team KRA Added");
            reset();
            setOpenModal(false);
        },
        onError: (error) => {
            toast.error("Adding failed");
        },
    });

    const handleFormSubmit = (data) => {
        const normalizedAssignees = Array.isArray(data.assignTo)
            ? data.assignTo
            : typeof data.assignTo === "string"
                ? data.assignTo
                    .split(",")
                    .map((id) => id.trim())
                    .filter(Boolean)
                : [];

        addDailyKra({
            ...data,
            assignTo: normalizedAssignees,
        });
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                `/api/performance/get-tasks?dept=${deptId}&type=TEAMKRA`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const { data: teamKra = [], isPending: teamLoading } = useQuery({
        queryKey: ["fetchedTeamKRA"],
        queryFn: fetchTasks,
    });

    const { data: assignees = [] } = useQuery({
        queryKey: ["fetchAssignees", deptId],
        queryFn: async () => {
            const response = await axios.get(`/api/users/assignees?deptId=${deptId}`);
            return response.data;
        },
        enabled: !!deptId,
    });

    const teamColumns = [
        { headerName: "Sr no", field: "srno", width: 100 },
        { headerName: "KRA List", field: "taskName", flex: 1 },
        { headerName: "Assigned To", field: "assignedTo", flex: 1 },
        { headerName: "DueTime", field: "dueTime" },
        {
            field: "status",
            headerName: "Status",
            cellRenderer: (params) => {
                const statusColorMap = {
                    Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
                    Completed: { backgroundColor: "#16f8062c", color: "#00731b" },
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
        <>
            <div className="flex flex-col gap-4">
                <PageFrame>
                    {!teamLoading ? (
                        <WidgetSection padding layout={1}>
                            <YearWiseTable
                                formatTime
                                buttonTitle={"Add Team KRA"}
                                handleSubmit={() => setOpenModal(true)}
                                tableTitle={`${department} TEAM - DAILY KRA`}
                                data={(teamKra || [])
                                    .filter((item) => item.status !== "Completed")
                                    .map((item, index) => ({
                                        srno: index + 1,
                                        id: item.id,
                                        taskName: item.taskName,
                                        assignedDate: item.assignedDate,
                                        dueTime: item.dueTime,
                                        status: item.status,
                                        assignedTo: item.assignedTo,
                                    }))}
                                dateColumn={"dueDate"}
                                columns={teamColumns}
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
                title={"Add Team Daily KRA"}
            >
                <form
                    onSubmit={submitDailyKra(handleFormSubmit)}
                    className="grid grid-cols-1 gap-4"
                >
                    <Controller
                        name="teamDailyKra"
                        control={control}
                        rules={{
                            required: "Team Daily KRA is required",
                            validate: { noOnlyWhitespace, isAlphanumeric },
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                size="small"
                                label={"Team Daily KRA"}
                                fullWidth
                                error={!!errors?.teamDailyKra?.message}
                                helperText={errors?.teamDailyKra?.message}
                            />
                        )}
                    />

                    <Controller
                        name="assignedDate"
                        control={control}
                        rules={{ required: "Assigned Date Is Required" }}
                        render={({ field, fieldState: { error } }) => (
                            <DatePicker
                                label="Assigned Date"
                                disablePast
                                format="DD-MM-YYYY"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(date) => field.onChange(date ? date.toISOString() : null)}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        error: !!error,
                                        helperText: error?.message,
                                    },
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="assignTo"
                        control={control}
                        rules={{ required: "Select at least one team member" }}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                select
                                size="small"
                                label="Assign To"
                                fullWidth
                                value={field.value || []}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    field.onChange(
                                        Array.isArray(value)
                                            ? value
                                            : typeof value === "string"
                                                ? value
                                                    .split(",")
                                                    .map((id) => id.trim())
                                                    .filter(Boolean)
                                                : []
                                    );
                                }}
                                error={!!error}
                                helperText={error?.message}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={assignees.find(a => a.id === value)?.name || value}
                                                    size="small"
                                                />
                                            ))}
                                        </div>
                                    ),
                                }}
                            >
                                {assignees.map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    <PrimaryButton
                        type="submit"
                        title={"Submit"}
                        isLoading={isAddKraPending}
                        disabled={isAddKraPending}
                    />
                </form>
            </MuiModal>
        </>
    );
};

export default PerformanceTeamKra;
