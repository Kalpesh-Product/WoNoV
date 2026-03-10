import React, { useMemo } from "react";
import PageFrame from "../../../components/Pages/PageFrame";
import AgTable from "../../../components/AgTable";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const InternalMeetingsDashboard = () => {
    const axios = useAxiosPrivate();

    const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
        queryKey: ["all-meetings"],
        queryFn: async () => {
            const response = await axios.get("/api/meetings/get-meetings");
            return response.data;
        },
    });

    const { data: coWorkingClients = [], isLoading: clientsLoading } = useQuery({
        queryKey: ["co-working-clients"],
        queryFn: async () => {
            const response = await axios.get("/api/sales/co-working-clients");
            return response.data;
        },
    });

    const columns = [
        { field: "srNo", headerName: "Sr No", width: 90 },
        { field: "date", headerName: "Date", flex: 1 },
        { field: "roomName", headerName: "Meeting Room", flex: 1 },
        { field: "subject", headerName: "Subject", flex: 1.2 },
        { field: "bookedByName", headerName: "Booked By", flex: 1 },
        { field: "creditBalance", headerName: "Credit Balance", flex: 1 },
        { field: "startTime", headerName: "Start Time", flex: 1 },
        { field: "endTime", headerName: "End Time", flex: 1 },
        { field: "meetingStatus", headerName: "Status", flex: 1 },
    ];

    const tableData = useMemo(() => {
        const clientCreditMap = new Map(
            coWorkingClients.map((client) => [
                (client?.clientName || "").trim().toLowerCase(),
                client?.meetingCreditBalance,
            ]),
        );

        const internalMeetings = meetings.filter(
            (meeting) => meeting.meetingType === "Internal"
        );

        return internalMeetings.map((meeting, index) => ({
            ...meeting,
            srNo: index + 1,
            date: meeting?.date ? humanDate(new Date(meeting.date)) : "-",
            bookedByName: meeting?.bookedBy ? `${meeting.bookedBy.firstName || ""} ${meeting.bookedBy.lastName || ""}`.trim() : (meeting.clientBookedBy?.employeeName || "-"),
            creditBalance: (() => {
                const clientName = meeting?.client?.clientName?.trim().toLowerCase();
                if (!clientName) return "-";

                const balance = clientCreditMap.get(clientName);
                return balance ?? "-";
            })(),
            startTime: meeting?.startTime ? humanTime(meeting.startTime) : "-",
            endTime: meeting?.endTime ? humanTime(meeting.endTime) : "-",
            subject: meeting?.subject || "-",
            meetingStatus: meeting?.meetingStatus || "-",
        }));
    }, [coWorkingClients, meetings]);

    const isLoading = meetingsLoading || clientsLoading;

    return (
        <PageFrame>
            <AgTable
                tableTitle="Internal Meetings"
                data={tableData}
                columns={columns}
                loading={isLoading}
                search={true}
            />
        </PageFrame>
    );
};

export default InternalMeetingsDashboard;