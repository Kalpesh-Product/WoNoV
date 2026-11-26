export const isMeetingVisit = (visit = {}) => {
  const type = String(visit.visitorType || "").trim().toLowerCase();
  const purpose = String(visit.purposeOfVisit || "").trim().toLowerCase();
  return Boolean(visit.meeting) || type === "meeting" || purpose === "meeting room booking";
};

const getResponseRows = (response) =>
  Array.isArray(response?.data) ? response.data : response?.data?.data || [];

const isPaid = (value) =>
  value === true || String(value || "").trim().toLowerCase() === "paid";

export const fetchExternalMeetingClients = async (axiosClient) => {
  const [visitorsResponse, meetingsResponse] = await Promise.all([
    axiosClient.get("/api/visitors/fetch-visitors", {
      params: {
        visitorFlag: "Client",
        searchContext: "external-meeting-booking",
      },
    }),
    axiosClient.get("/api/meetings/get-meetings", {
      params: {
        type: "External",
        completed: "true",
        searchContext: "sales-external-meeting-clients",
      },
    }),
  ]);

  const visitorClients = getResponseRows(visitorsResponse)
    .filter((visitor) => {
      const visitorFlag = String(visitor?.visitorFlag || "")
        .trim()
        .toLowerCase();
      const purpose = String(visitor?.purposeOfVisit || "")
        .trim()
        .toLowerCase();
      return visitorFlag === "client" && purpose === "meeting room booking";
    })
    .map((visitor) => ({
      ...visitor,
      source: "Visitors",
      paymentStatus: isPaid(visitor?.paymentStatus),
    }));

  const meetingClients = getResponseRows(meetingsResponse)
    .filter((meeting) =>
      ["Upcoming", "Completed"].includes(
        meeting?.meetingStatus || meeting?.status,
      ),
    )
    .map((meeting) => {
      const primaryParticipant = meeting?.participants?.[0];
      const participantName =
        primaryParticipant?.name ||
        [
          primaryParticipant?.firstName,
          primaryParticipant?.middleName,
          primaryParticipant?.lastName,
        ]
          .filter(Boolean)
          .join(" ");
      const bookedByName =
        meeting?.bookedBy && typeof meeting.bookedBy === "object"
          ? [
              meeting.bookedBy.firstName,
              meeting.bookedBy.middleName,
              meeting.bookedBy.lastName,
            ]
              .filter(Boolean)
              .join(" ")
          : "";
      const externalClientName =
        typeof meeting?.externalClient === "string"
          ? meeting.externalClient
          : meeting?.externalClient?.registeredClientCompany ||
            meeting?.externalClient?.visitorCompany ||
            meeting?.externalClient?.brandName;
      const companyName =
        externalClientName || meeting?.client || "External Client";
      const meetingStatus = meeting?.meetingStatus || meeting?.status;

      return {
        ...meeting,
        source: "Meetings",
        meetingStatus,
        clientName: companyName,
        firstName: participantName || bookedByName || companyName,
        lastName: "",
        visitorCompany: companyName,
        purposeOfVisit: "Meeting Room Booking",
        isActive: meetingStatus === "Upcoming",
        paymentStatus: isPaid(meeting?.paymentStatus),
      };
    });

  return [...visitorClients, ...meetingClients];
};
