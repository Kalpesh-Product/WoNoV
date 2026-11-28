import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import DetalisFormatted from "../../../components/DetalisFormatted";
import MuiModal from "../../../components/MuiModal";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { inrFormatExact } from "../../../utils/currencyFormat";
import { formatMeetingDateRange } from "../../../utils/formatMeetingDateRange";
import { getMeetingDepartmentLabel } from "../../../utils/meetingDepartment";
import { getMeetingDisplayStatus } from "../../../utils/meetingStatus";
import InternalMeetingDetails from "../../Meetings/InternalMeetingDetails";
import ViewMeetingButton from "../../Meetings/ViewMeetingButton";

const money = (amount) => amount == null ? "Unavailable" : `INR ${inrFormatExact(amount)}`;
const dateLabel = (date) => date ? dayjs(date).format("DD MMM YYYY") : "Unavailable";
const personName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ") || person?.employeeName;

function FileLink({ href, children }) {
  return href ? (
    <a className="text-primary underline" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : "Unavailable";
}

function toMeetingDetails(meeting) {
  return {
    ...meeting,
    bookedBy: personName(meeting.bookedBy) || personName(meeting.clientBookedBy) || "Unknown",
    receptionist: personName(meeting.receptionist) || "Unavailable",
    department: getMeetingDepartmentLabel({ ...meeting, department: meeting.bookedBy?.departments }),
    participants: [...(meeting.internalParticipants ?? []), ...(meeting.clientParticipants ?? [])],
    client: meeting.client?.clientName,
    roomName: meeting.bookedRoom?.name,
    location: meeting.bookedRoom?.location,
    housekeepingStatus: meeting.houeskeepingStatus,
    displayMeetingStatus: getMeetingDisplayStatus({ ...meeting, meetingStatus: meeting.status }),
  };
}

export default function MeetingCreditPaymentDetails({ revenue }) {
  const axios = useAxiosPrivate();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const { data, isPending, isError } = useQuery({
    queryKey: ["meetings-revenue", "covered-meetings", revenue.id],
    queryFn: async () => {
      const { data } = await axios.get("/api/sales/get-meeting-revenue", {
        params: { id: revenue.id, includeCoveredMeetings: true },
      });
      return data;
    },
  });
  const meetings = data?.coveredMeetings ?? [];
  const meetingCount = revenue.meetingIds.length;
  const hasAllMeetings = data && meetings.length === meetingCount;
  const creditsPaid = hasAllMeetings
    ? Number(meetings.reduce((total, meeting) => total + (meeting.overageCredits ?? 0), 0).toFixed(2))
    : isPending ? "Loading" : "Unavailable";
  const hasSelectedRange = data?.meetingRangeStart && data?.meetingRangeEndExclusive;
  const coveredStart = meetings[0]?.startTime;
  const coveredEnd = meetings.reduce((latest, meeting) => {
    const end = meeting.extendTime && dayjs(meeting.extendTime).isAfter(meeting.endTime)
      ? meeting.extendTime : meeting.endTime;
    return end && (!latest || dayjs(end).isAfter(latest)) ? end : latest;
  }, null);

  return (
    <div className="grid gap-5">
      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Payment Summary</h3>
        <DetalisFormatted title="Client" detail={revenue.clientName} />
        {hasSelectedRange ? (
          <DetalisFormatted
            title="Selected Meeting Dates"
            detail={`${dateLabel(data.meetingRangeStart)} to ${dateLabel(dayjs(data.meetingRangeEndExclusive).subtract(1, "millisecond"))}`}
          />
        ) : hasAllMeetings && coveredStart && coveredEnd ? (
          <DetalisFormatted
            title="Covered Meeting Dates"
            detail={`${dateLabel(coveredStart)} to ${dateLabel(coveredEnd)}`}
          />
        ) : null}
        <DetalisFormatted title="Payment Date" detail={dateLabel(revenue.paymentDate)} />
        <DetalisFormatted title="Meetings in This Payment" detail={meetingCount} />
        <DetalisFormatted title="Credits Paid" detail={String(creditsPaid)} />
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Amount Breakdown</h3>
        <DetalisFormatted
          title="Base Amount"
          detail={revenue.taxable == null ? "Unavailable" : money(Number(revenue.taxable) + Number(revenue.discount ?? 0))}
        />
        {Number(revenue.discount) > 0 && <DetalisFormatted title="Discount" detail={money(revenue.discount)} />}
        <DetalisFormatted title="GST" detail={money(revenue.gst)} />
        <DetalisFormatted title="Total Paid" detail={money(revenue.totalAmount)} />
        <DetalisFormatted title="Payment Mode" detail={revenue.paymentMode} />
        <DetalisFormatted title="Payment Proof" detail={(
          <FileLink href={revenue.paymentProofLink}>{revenue.paymentProofName || "View File"}</FileLink>
        )} />
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Meetings Covered</h3>
        {isPending && <p>Loading meetings...</p>}
        {!isPending && !hasAllMeetings && (
          <p className="text-sm text-red-700">
            {isError || meetings.length === 0
              ? "Unable to load the covered meetings."
              : `Showing ${meetings.length} of ${meetingCount} linked meetings.`}
          </p>
        )}
        {meetings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {["Date", "Meeting", "Room", "Booked By", "Credits Used", "Credits Paid", "Amount Paid", "Action"].map((label) => (
                    <th className="whitespace-nowrap p-2" scope="col" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr className="border-b" key={meeting._id}>
                    <td className="p-2">{formatMeetingDateRange(meeting)}</td>
                    <td className="p-2">{meeting.subject || "Untitled meeting"}</td>
                    <td className="p-2">{meeting.bookedRoom?.name || "Unavailable"}</td>
                    <td className="p-2">{personName(meeting.bookedBy) || personName(meeting.clientBookedBy) || "Unknown"}</td>
                    <td className="p-2">{meeting.creditsUsed ?? 0}</td>
                    <td className="p-2">{meeting.overageCredits ?? 0}</td>
                    <td className="whitespace-nowrap p-2">{money(meeting.paymentAmount)}</td>
                    <td className="p-2"><ViewMeetingButton onClick={() => setSelectedMeeting(meeting)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Verification &amp; Invoice</h3>
        <DetalisFormatted title="Payment Verification" detail={revenue.paymentVerification || "Pending"} />
        <DetalisFormatted title="Invoice Status" detail={revenue.financeStatus || "Pending"} />
        <DetalisFormatted title="Invoice Link" detail={(
          <FileLink href={revenue.invoiceLink}>{revenue.invoiceName || "View Invoice"}</FileLink>
        )} />
        {revenue.invoiceUploadedAt && (
          <DetalisFormatted title="Invoice Uploaded On" detail={dateLabel(revenue.invoiceUploadedAt)} />
        )}
        {revenue.invoiceUploadedByName && (
          <DetalisFormatted title="Invoice Uploaded By" detail={revenue.invoiceUploadedByName} />
        )}
      </section>

      {selectedMeeting && (
        <MuiModal
          title="Meeting Details"
          open
          widthClass="w-[90vw] max-w-[660px]"
          onClose={() => setSelectedMeeting(null)}
        >
          <InternalMeetingDetails meeting={toMeetingDetails(selectedMeeting)} />
        </MuiModal>
      )}
    </div>
  );
}
