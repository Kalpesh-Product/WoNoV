import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import PageFrame from "../../../components/Pages/PageFrame";
import AgTable from "../../../components/AgTable";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";

const ExternalCompanyMeetings = () => {
    const axios = useAxiosPrivate();
    const { clientName } = useParams();

    const decodedClientName = useMemo(
        () => decodeURIComponent(clientName || ""),
        [clientName],
    );

    const { data: meetings = [], isLoading } = useQuery({
        queryKey: ["external-company-meetings", decodedClientName],
        queryFn: async () => {
            const response = await axios.get("/api/meetings/get-meetings");
            return response.data;
        },
        enabled: Boolean(decodedClientName),
    });

    const columns = [
        { field: "srNo", headerName: "Sr No", width: 90 },
        { field: "date", headerName: "Date", flex: 1 },
        { field: "roomName", headerName: "Meeting Room", flex: 1 },
        { field: "subject", headerName: "Subject", flex: 1.2 },
        { field: "bookedBy", headerName: "Booked By", flex: 1 },
        { field: "startTime", headerName: "Start Time", flex: 1 },
        { field: "endTime", headerName: "End Time", flex: 1 },
        { field: "meetingStatus", headerName: "Status", flex: 1 },
    ];

    const tableData = useMemo(() => {
        const filteredMeetings = meetings.filter(
            (meeting) =>
                meeting?.meetingType === "External" &&
                meeting?.externalClient === decodedClientName,
        );

        return filteredMeetings.map((meeting, index) => ({
            ...meeting,
            srNo: index + 1,
            date: meeting?.date ? humanDate(new Date(meeting.date)) : "-",
            bookedBy: meeting?.clientBookedBy?.employeeName || "-",
            startTime: meeting?.startTime ? humanTime(meeting.startTime) : "-",
            endTime: meeting?.endTime ? humanTime(meeting.endTime) : "-",
            subject: meeting?.subject || "-",
            meetingStatus: meeting?.meetingStatus || "-",
        }));
    }, [decodedClientName, meetings]);

    return (
        <PageFrame>
            <AgTable
                tableTitle={`${decodedClientName} - Meeting Details`}
                data={tableData}
                columns={columns}
                loading={isLoading}
                search={true}
            />
        </PageFrame>
    );
};

export default ExternalCompanyMeetings;