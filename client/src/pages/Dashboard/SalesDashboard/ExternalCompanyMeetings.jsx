import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import PageFrame from "../../../components/Pages/PageFrame";
import AgTable from "../../../components/AgTable";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
import { useSelector } from "react-redux";

const ExternalCompanyMeetings = () => {
  const axios = useAxiosPrivate();
  const { clientName } = useParams();
  const location = useLocation();
  const selectedClient = useSelector((state) => state.client.selectedClient);

  const isOpenDeskView = location.pathname.includes("/open-desk/");

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

  const { data: visitors = [], isLoading: isVisitorsLoading } = useQuery({
    queryKey: [
      "external-open-desk-visitor",
      selectedClient?._id,
      decodedClientName,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return response.data;
    },
    enabled: isOpenDeskView,
  });

  const columns = isOpenDeskView
    ? [
        { field: "srNo", headerName: "Sr No", sort: "desc", width: 90 },
        // { field: "name", headerName: "Name", flex: 1.2 },
        { field: "purposeOfVisit", headerName: "Purpose", flex: 1.2 },
        { field: "dateOfVisit", headerName: "Date of Visit", flex: 1 },
        { field: "checkIn", headerName: "Check In", flex: 1 },
        { field: "checkOut", headerName: "Checkout", flex: 1 },
      ]
    : [
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
    if (isOpenDeskView) {
      const normalizedClientName = decodedClientName.trim().toLowerCase();

      const selectedVisitor = visitors.find((visitor) => {
        if (selectedClient?._id && visitor?._id === selectedClient._id)
          return true;

        const visitorName =
          `${visitor?.firstName || ""} ${visitor?.lastName || ""}`
            .trim()
            .toLowerCase();
        const companyName = (
          visitor?.visitorCompany ||
          visitor?.brandName ||
          visitor?.registeredClientCompany ||
          visitor?.email ||
          ""
        )
          .trim()
          .toLowerCase();

        return (
          visitorName === normalizedClientName ||
          companyName === normalizedClientName
        );
      });

      if (!selectedVisitor) return [];

      const openDeskVisits = (selectedVisitor.externalVisits || []).filter(
        (visit) => {
          const visitorType = (visit?.visitorType || "").trim().toLowerCase();
          return (
            visitorType === "half-day pass" || visitorType === "full-day pass"
          );
        },
      );

      return openDeskVisits.map((visit, index) => ({
        srNo: index + 1,
        name:
          `${selectedVisitor?.firstName || ""} ${selectedVisitor?.lastName || ""}`.trim() ||
          "N/A",
        purposeOfVisit:
          visit?.visitorType || selectedVisitor?.purposeOfVisit || "N/A",
        dateOfVisit:
          visit?.dateOfVisit || selectedVisitor?.dateOfVisit
            ? humanDate(
                new Date(visit?.dateOfVisit || selectedVisitor?.dateOfVisit),
              )
            : "-",
        checkIn: visit?.checkIn ? humanTime(visit.checkIn) : "-",
        checkOut: visit?.checkOut ? humanTime(visit.checkOut) : "-",
      }));
    }

    const normalizedClientName = decodedClientName.trim().toLowerCase();

    const filteredMeetings = meetings.filter((meeting) => {
      const extClient = meeting?.externalClient;
      if (!extClient) return false;

      // Check possible company name fields on the Visitor object
      const possibleNames = [
        extClient.visitorCompany,
        extClient.brandName,
        extClient.registeredClientCompany,
        extClient.email,
        typeof extClient === "string" ? extClient : "",
      ].map((name) => (name || "").trim().toLowerCase());

      return possibleNames.includes(normalizedClientName);
    });

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
  }, [
    decodedClientName,
    isOpenDeskView,
    meetings,
    selectedClient?._id,
    visitors,
  ]);

  return (
    <PageFrame>
      <AgTable
        tableTitle={
          isOpenDeskView
            ? `${selectedClient?.firstName || ""} ${selectedClient?.lastName || ""}`.trim() ||
              decodedClientName
            : `${decodedClientName} - Meeting Details`
        }
        data={tableData}
        columns={columns}
        loading={isOpenDeskView ? isVisitorsLoading : isLoading}
        search={true}
      />
    </PageFrame>
  );
};

export default ExternalCompanyMeetings;
