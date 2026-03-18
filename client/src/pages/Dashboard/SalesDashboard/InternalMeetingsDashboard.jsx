import React, { useMemo } from "react";
import PageFrame from "../../../components/Pages/PageFrame";
import AgTable from "../../../components/AgTable";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Avatar, AvatarGroup, Chip } from "@mui/material";
import YearWiseTable from "../../../components/Tables/YearWiseTable";

const statusColors = {
    Upcoming: { bg: "#E3F2FD", text: "#1565C0" },
    Ongoing: { bg: "#FFF3E0", text: "#E65100" },
    Completed: { bg: "#E8F5E9", text: "#1B5E20" },
    Cancelled: { bg: "#FFEBEE", text: "#B71C1C" },
    Available: { bg: "#E3F2FD", text: "#0D47A1" },
    Occupied: { bg: "#ECEFF1", text: "#37474F" },
    Cleaning: { bg: "#E0F2F1", text: "#00796B" },
    Pending: { bg: "#FFFDE7", text: "#F57F17" },
    "In Progress": { bg: "#FBE9E7", text: "#BF360C" },
};

const getAvatarName = (participant) => {
    if (participant.firstName && participant.lastName) {
        return `${participant.firstName}+${participant.lastName}`;
    }

    if (participant.employeeName) {
        return participant.employeeName.replace(/\s+/g, "+");
    }

    return "User";
};

const InternalMeetingsDashboard = () => {
    const axios = useAxiosPrivate();

    const { data: meetings = [] } = useQuery({
        queryKey: ["all-meetings"],
        queryFn: async () => {
            const response = await axios.get("/api/meetings/get-meetings");
            return response.data;
        },
    });

    const { data: coWorkingClients = [] } = useQuery({
        queryKey: ["co-working-clients"],
        queryFn: async () => {
            const response = await axios.get("/api/sales/co-working-clients");
            return response.data;
        },
    });

    const columns = [
        { field: "srNo", headerName: "Sr No", width: 90, sort: "desc" },
        { field: "client", headerName: "Company", flex: 1 },
        { field: "bookedBy", headerName: "Booked By", flex: 1 },
        { field: "building", headerName: "Building", flex: 1 },
        { field: "roomName", headerName: "Room Name", flex: 1 },
        { field: "date", headerName: "Date", flex: 1 },
        {
            field: "startTime",
            headerName: "Start Time",
            flex: 1,
            cellRenderer: (params) => humanTime(params.value),
        },
        {
            field: "endTime",
            headerName: "End Time",
            flex: 1,
            cellRenderer: (params) => humanTime(params.value),
        },
        {
            field: "meetingCreditBalance",
            headerName: "Credit Balance",
            flex: 1,
        },
        {
            field: "meetingStatus",
            headerName: "Meeting Status",
            flex: 1,
            cellRenderer: (params) => (
                <Chip
                    label={params.value || ""}
                    sx={{
                        backgroundColor: statusColors[params.value]?.bg || "#F5F5F5",
                        color: statusColors[params.value]?.text || "#000",
                        fontWeight: "bold",
                    }}
                />
            ),
        },
        {
            field: "participants",
            headerName: "Participants",
            flex: 1,
            cellRenderer: (params) => {
                const participants = Array.isArray(params.data?.participants)
                    ? params.data.participants
                    : [];

                return (
                    <div className="flex justify-start items-center">
                        <AvatarGroup max={4}>
                            {participants.map((participant, index) => (
                                <Avatar
                                    key={index}
                                    alt={participant.firstName || participant.employeeName}
                                    src={`https://ui-avatars.com/api/?name=${getAvatarName(participant)}&background=random`}
                                    sx={{ width: 23, height: 23 }}
                                />
                            ))}
                        </AvatarGroup>
                    </div>
                );
            },
        },
    ];

    const tableData = useMemo(() => {
        const clientCreditMap = new Map(
            coWorkingClients.map((client) => [
                (client?.clientName || "").trim().toLowerCase(),
                client?.meetingCreditBalance,
            ])
        );

        const internalMeetings = meetings.filter(
            (meeting) =>
                meeting.meetingType === "Internal" &&
                meeting.meetingStatus !== "Completed"
        );

        return internalMeetings.map((meeting, index) => {
            const rawClientName =
                typeof meeting?.client === "string"
                    ? meeting.client
                    : meeting?.client?.clientName || "";
            const clientName = rawClientName.trim().toLowerCase();
            const balance = clientCreditMap.get(clientName);

            return {
                ...meeting,
                srNo: index + 1,
                client: meeting?.client || "",
                date: meeting?.date || null,
                bookedBy: meeting?.bookedBy
                    ? `${meeting.bookedBy.firstName || ""} ${meeting.bookedBy.lastName || ""}`.trim()
                    : meeting.clientBookedBy?.employeeName || "Unknown",
                building: meeting?.location?.building?.buildingName || "",
                endTime:
                    meeting?.extendTime && meeting.extendTime > meeting.endTime
                        ? meeting.extendTime
                        : meeting.endTime,
                meetingCreditBalance:
                    typeof balance === "number" ? balance.toFixed(2) : "0.00",
                meetingStatus: meeting?.meetingStatus || "-",
            };
        });
    }, [coWorkingClients, meetings]);

    return (
        <PageFrame>
            <YearWiseTable
                tableTitle="Internal Meetings"
                data={tableData}
                columns={columns}
                search={true}
                exportData
                dateColumn="date"
            />
        </PageFrame>
    );
};

export default InternalMeetingsDashboard;