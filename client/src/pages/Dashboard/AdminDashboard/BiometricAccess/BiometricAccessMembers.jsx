import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Chip, MenuItem, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";
import MuiModal from "../../../../components/MuiModal";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";

const BIOMETRIC_OPTIONS = ["Pending", "Approved"];

const getMemberId = (member) => member?._id || member?.id || member?.employeeName;

const BiometricAccessMembers = () => {
    const axios = useAxiosPrivate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { clientName } = useParams();
    const selectedClient = useSelector((state) => state.client.selectedClient);
    const [members, setMembers] = useState([]);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    const isItDashboard = location.pathname.includes("/IT-dashboard/");
    const canEditAllFields = !isItDashboard;
    const decodedClientName = decodeURIComponent(clientName || "");

    const { reset, control, handleSubmit, formState: { errors } } = useForm({
        mode: "onChange",
        defaultValues: {
            employeeName: "",
            gender: "",
            email: "",
            phone: "",
            dob: null,
            biometricStatus: "Pending",
        },
    });

    const { data: clientData } = useQuery({
        queryKey: ["biometricAccessClient", decodedClientName],
        enabled: Boolean(decodedClientName),
        queryFn: async () => {
            const response = await axios.get("/api/sales/co-working-clients");
            const clients = response.data || [];
            return clients.find(
                (item) =>
                    (item.clientName || "").trim().toLowerCase() ===
                    decodedClientName.trim().toLowerCase(),
            );
        },
    });

    useEffect(() => {
        const normalizedRouteName = decodedClientName.trim().toLowerCase();
        const normalizedSelectedName = (selectedClient?.clientName || "")
            .trim()
            .toLowerCase();

        const client =
            normalizedSelectedName === normalizedRouteName ? selectedClient : clientData;

        if (client) {
            dispatch(setSelectedClient(client));
            setMembers(client.members || []);
        }
    }, [clientData, decodedClientName, dispatch, selectedClient]);

    const handleEditMember = (member) => {
        setSelectedMemberId(getMemberId(member));
        reset({
            employeeName: member.employeeName || "",
            gender: member.gender || "",
            email: member.email || "",
            phone: member.mobileNo || member.phone || "",
            dob: member.dob && dayjs(member.dob).isValid() ? dayjs(member.dob) : null,
            biometricStatus:
                member.biometricStatus === "approved" || member.biometricStatus === "Approved"
                    ? "Approved"
                    : "Pending",
        });
        setOpenEditModal(true);
    };

    const { mutate: updateMember, isPending: isSubmitting } = useMutation({
        mutationFn: async ({ memberId, payload }) => {
            const response = await axios.patch(`/api/sales/co-working-member/${memberId}`, payload);
            return response.data;
        },
        onSuccess: (response, variables) => {
            const updatedMember = response?.data;
            setMembers((prev) =>
                prev.map((member) =>
                    getMemberId(member) === variables.memberId
                        ? { ...member, ...(updatedMember || {}), biometricStatus: variables.payload.biometricStatus }
                        : member,
                ),
            );
            toast.success(response?.message || "Member details updated successfully");
            setOpenEditModal(false);
            setSelectedMemberId(null);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update member");
        },
    });

    const { mutate: updateMemberStatus } = useMutation({
        mutationFn: async ({ memberId, isActive }) => {
            const response = await axios.patch(`/api/sales/co-working-member/${memberId}/status`, { isActive });
            return response.data;
        },
        onSuccess: (response, variables) => {
            setMembers((prev) =>
                prev.map((member) =>
                    getMemberId(member) === variables.memberId
                        ? { ...member, isActive: variables.isActive, status: variables.isActive ? "Active" : "Inactive" }
                        : member,
                ),
            );
            toast.success(response?.message || "Member status updated successfully");
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message || error?.message || "Failed to update member status",
            );
        },
    });

    const handleUpdateMember = (data) => {
        const selectedMember = members.find((member) => getMemberId(member) === selectedMemberId);

        if (!selectedMember || !selectedMemberId) {
            toast.error("Unable to find selected member");
            return;
        }

        const payload = {
            name: canEditAllFields ? data.employeeName?.trim() : selectedMember.employeeName,
            gender: canEditAllFields ? data.gender : selectedMember.gender,
            designation: selectedMember.designation,
            email: canEditAllFields ? data.email?.trim() || selectedMember.email : selectedMember.email,
            phone: canEditAllFields
                ? data.phone?.trim() || selectedMember.mobileNo || selectedMember.phone
                : selectedMember.mobileNo || selectedMember.phone,
            bloodGroup: selectedMember.bloodGroup,
            dob: canEditAllFields
                ? data.dob
                    ? dayjs(data.dob).format("YYYY-MM-DD")
                    : selectedMember.dob
                        ? dayjs(selectedMember.dob).format("YYYY-MM-DD")
                        : undefined
                : selectedMember.dob
                    ? dayjs(selectedMember.dob).format("YYYY-MM-DD")
                    : undefined,
            emergencyName: selectedMember.emergencyName,
            emergencyNo: selectedMember.emergencyNo,
            biometricStatus: data.biometricStatus.toLowerCase(),
            dateOfJoining: selectedMember.dateOfJoining
                ? dayjs(selectedMember.dateOfJoining).format("YYYY-MM-DD")
                : undefined,
        };

        updateMember({ memberId: selectedMemberId, payload });
    };

    const handleToggleMemberStatus = (member) => {
        const memberId = getMemberId(member);

        if (!memberId) {
            toast.error("Unable to find selected member");
            return;
        }

        const currentStatus =
            typeof member?.isActive === "boolean" ? member.isActive : member?.status === "Active";

        updateMemberStatus({ memberId, isActive: !currentStatus });
    };

    const memberData = useMemo(
        () =>
            members.map((item, index) => ({
                ...item,
                srNo: index + 1,
                email: item.email || "-",
                phone: item.mobileNo || item.phone || "-",
                status:
                    typeof item?.isActive === "boolean" ? item.isActive : item?.status === "Active",
                biometricStatus:
                    item.biometricStatus === "approved" || item.biometricStatus === "Approved"
                        ? "Approved"
                        : "Pending",
            })),
        [members],
    );

    const columns = [
        { field: "srNo", headerName: "SR No" },
        { field: "employeeName", headerName: "Member Name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "phone", headerName: "Phone No", flex: 1 },
        {
            field: "biometricStatus",
            headerName: "Biometric Status",
            flex: 1,
            cellRenderer: (params) => {
                const status = params.value || "Pending";
                const palette = {
                    Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
                    Approved: { backgroundColor: "#D4F8D4", color: "#0A7A0A" },
                };
                const { backgroundColor, color } = palette[status] || palette.Pending;
                return <Chip label={status} style={{ backgroundColor, color }} />;
            },
        },
        {
            field: "status",
            headerName: "Status",
            cellRenderer: (params) => {
                const status = params.value ? "Active" : "Inactive";
                const palette = {
                    Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
                    Active: { backgroundColor: "#90EE90", color: "#006400" },
                };
                const { backgroundColor, color } = palette[status];
                return <Chip label={status} style={{ backgroundColor, color }} />;
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => {
                const menuItems = [{ label: "Edit", onClick: () => handleEditMember(params.data) }];

                if (canEditAllFields) {
                    menuItems.push({
                        label: params.data.status ? "Mark As Inactive" : "Mark As Active",
                        onClick: () => handleToggleMemberStatus(params.data),
                    });
                }

                return <ThreeDotMenu rowId={params.data.srNo} menuItems={menuItems} />;
            },
        },
    ];

    return (
        <div>
            <div className="w-full">
                <PageFrame>
                    <AgTable
                        search
                        searchColumn="Email"
                        tableTitle={`${decodedClientName || selectedClient?.clientName || "Client"} - Biometric Access Members`}
                        data={memberData}
                        columns={columns}
                    />
                </PageFrame>
            </div>

            <MuiModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedMemberId(null);
                }}
                title="Edit Member"
            >
                <form onSubmit={handleSubmit(handleUpdateMember)} className="flex flex-col gap-4">
                    <TextField label="Company Name" value={decodedClientName || ""} size="small" fullWidth disabled />
                    <Controller
                        name="employeeName"
                        control={control}
                        rules={{ required: "Member Name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Member Name"
                                size="small"
                                fullWidth
                                disabled={!canEditAllFields}
                                error={!!errors?.employeeName}
                                helperText={errors?.employeeName?.message}
                            />
                        )}
                    />
                    <Controller
                        name="gender"
                        control={control}
                        rules={{ required: "Gender is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                label="Gender"
                                size="small"
                                fullWidth
                                disabled={!canEditAllFields}
                                error={!!errors?.gender}
                                helperText={errors?.gender?.message}
                            >
                                <MenuItem value="" disabled>Select Gender</MenuItem>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </TextField>
                        )}
                    />
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => <TextField {...field} label="Email" size="small" fullWidth disabled={!canEditAllFields} />}
                    />
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => <TextField {...field} label="Phone" size="small" fullWidth disabled={!canEditAllFields} />}
                    />
                    <Controller
                        name="dob"
                        control={control}
                        render={({ field: { value, onChange, ...restField } }) => (
                            <DatePicker
                                {...restField}
                                value={value && dayjs(value).isValid() ? dayjs(value) : null}
                                onChange={(newValue) => onChange(newValue || null)}
                                label="Date of Birth"
                                format="DD-MM-YYYY"
                                disabled={!canEditAllFields}
                                slotProps={{ textField: { size: "small" } }}
                            />
                        )}
                    />
                    <Controller
                        name="biometricStatus"
                        control={control}
                        rules={{ required: "Biometric status is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                label="Biometric Status"
                                size="small"
                                fullWidth
                                error={!!errors?.biometricStatus}
                                helperText={errors?.biometricStatus?.message}
                            >
                                {BIOMETRIC_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    <PrimaryButton
                        title="Submit"
                        type="submit"
                        isLoading={isSubmitting}
                    />
                </form>
            </MuiModal>
        </div>
    );
};

export default BiometricAccessMembers;