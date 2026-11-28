import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import ViewMeetingButton from "./ViewMeetingButton";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import { inrFormat } from "../../utils/currencyFormat";
import { getMeetingDepartmentLabel } from "../../utils/meetingDepartment";
import InternalMeetingDetails from "./InternalMeetingDetails";
import AgTable from "../../components/AgTable";
import TableDateFilter from "../../components/TableDateFilter";
import { toUtcDayBoundary } from "../../utils/dateRange";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getMeetingDisplayStatus } from "../../utils/meetingStatus";
import MeetingStatusChip from "./MeetingStatusChip";
import MeetingPaymentModal from "./MeetingPaymentModal";

const formatDate = (date) => dayjs(date).format("DD MMM YYYY");

export default function ClientMeetingHistory({
  clientId,
  startDate: initialStartDate,
  endDate: initialEndDate,
  onBack,
}) {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [paymentBatch, setPaymentBatch] = useState(null);
  const [viewMeeting, setViewMeeting] = useState(null);
  const [selection, setSelection] = useState(null);
  const startDate = selection
    ? toUtcDayBoundary(selection.startDate)
    : initialStartDate;
  const endDate = selection
    ? toUtcDayBoundary(selection.endDate, true)
    : initialEndDate;
  const hasDateRange = Boolean(
    startDate &&
    endDate &&
    dayjs(startDate).isValid() &&
    dayjs(endDate).isAfter(startDate),
  );
  const { data, isPending, isError } = useQuery({
    queryKey: [
      "meetings",
      "client-credit-history",
      clientId,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings", {
        params: { type: "internal", clientId, startDate, endDate },
      });
      return response.data;
    },
    enabled: hasDateRange,
  });

  const rows = useMemo(
    () =>
      (data ?? []).map((meeting, index) => {
        const dates = meeting.bookingSlots?.length
          ? meeting.bookingSlots.map((slot) => slot.startTime)
          : [meeting.date];
        const datesInRange = dates.filter(
          (date) =>
            date &&
            dayjs(date).isValid() &&
            !dayjs(date).isBefore(startDate) &&
            dayjs(date).isBefore(endDate),
        );
        const canPay =
          meeting.meetingType === "Internal" &&
          meeting.creditsExceeded &&
          meeting.paymentOutstanding &&
          meeting.meetingStatus !== "Cancelled";

        return {
          ...meeting,
          srNo: index + 1,
          creditsPaid:
            meeting.paymentStatus === "Paid"
              ? (meeting.overageCredits ?? 0)
              : 0,
          department: getMeetingDepartmentLabel(meeting),
          bookedBy:
            [meeting.bookedBy?.firstName, meeting.bookedBy?.lastName]
              .filter(Boolean)
              .join(" ") ||
            meeting.clientBookedBy?.employeeName ||
            "Unknown",
          displayMeetingStatus: getMeetingDisplayStatus(meeting),
          meetingDates: datesInRange.map(formatDate).join(", "),
          canPay,
          creditUsage: `${meeting.creditsUsed ?? 0} used, ${meeting.overageCredits ?? 0} exceeded`,
        };
      }),
    [data, startDate, endDate],
  );

  const columns = useMemo(
    () => [
      { field: "srNo", headerName: "Sr No", width: 90 },
      { field: "meetingDates", headerName: "Date", minWidth: 150 },
      { field: "bookedBy", headerName: "Booked By", minWidth: 190 },
      { field: "roomName", headerName: "Room", minWidth: 150 },
      { field: "creditUsage", headerName: "Credit Usage", minWidth: 195 },
      { field: "creditsPaid", headerName: "Credits Paid", minWidth: 140 },
      {
        field: "displayMeetingStatus",
        headerName: "Status",
        minWidth: 130,
        cellRenderer: MeetingStatusChip,
      },
      {
        field: "action",
        headerName: "Action",
        pinned: "right",
        minWidth: 140,
        cellStyle: { display: "flex", alignItems: "center" },
        cellRenderer: ({ data: meeting }) => (
          <ViewMeetingButton onClick={() => setViewMeeting(meeting)} />
        ),
      },
    ],
    [],
  );

  const outstanding = rows.filter((meeting) => meeting.canPay);
  const openPayment = () => {
    const sumCurrency = (field) =>
      outstanding.reduce(
        (sum, meeting) => sum + Math.round(Number(meeting[field] ?? 0) * 100),
        0,
      ) / 100;
    setPaymentBatch({
      clientId,
      startDate,
      endDate,
      meetingIds: outstanding.map((meeting) => meeting._id),
      dateLabel: `${formatDate(startDate)} to ${formatDate(dayjs(endDate).subtract(1, "millisecond"))}`,
      meeting: {
        meetingType: "Internal",
        paymentBaseAmount: sumCurrency("paymentBaseAmount"),
        paymentGstAmount: sumCurrency("paymentGstAmount"),
        overageCredits: outstanding
          .reduce((sum, meeting) => sum + meeting.overageCredits, 0)
          .toFixed(2),
      },
    });
  };

  const refreshCreditHistory = () => {
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
    queryClient.invalidateQueries({
      queryKey: ["co-working-clients", "client-credit"],
    });
  };

  return (
    <PageFrame>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-primary">Meeting History</h1>
        <PrimaryButton title="Back" type="button" handleSubmit={onBack} />
      </div>

      {isError || !hasDateRange ? (
        <p className="p-4 text-red-600">Unable to fetch meeting history.</p>
      ) : (
        <AgTable
          data={rows}
          columns={columns}
          loading={isPending}
          search
          toolbarDateControls={
            <TableDateFilter
              fields={[{ field: "meetingDates", label: "Meeting Date" }]}
              field="meetingDates"
              range={{
                startDate: dayjs(startDate).toDate(),
                endDate: dayjs(endDate).subtract(1, "millisecond").toDate(),
              }}
              onChange={setSelection}
              showClearButton={false}
            />
          }
          toolbarActions={
            <PrimaryButton
              title="Pay"
              type="button"
              disabled={!outstanding.length}
              handleSubmit={openPayment}
            />
          }
          exportData
          tableHeight={480}
        />
      )}

      <MuiModal
        open={Boolean(viewMeeting)}
        title="Meeting Details"
        onClose={() => setViewMeeting(null)}
      >
        {viewMeeting && (
          <InternalMeetingDetails meeting={viewMeeting}>
            {viewMeeting.creditsExceeded && viewMeeting.overageCredits > 0 && (
              <>
                <div className="pt-4 font-bold">Payment Details</div>
                <DetalisFormatted
                  title="Uncovered Credits"
                  detail={viewMeeting.overageCredits}
                />
                <DetalisFormatted
                  title="Payment Status"
                  detail={viewMeeting.paymentStatus}
                />
                <DetalisFormatted
                  title="Payment Mode"
                  detail={viewMeeting.paymentMode || "N/A"}
                />
                <DetalisFormatted
                  title="Total Amount"
                  detail={`INR ${inrFormat(viewMeeting.paymentAmount)}`}
                />
                {viewMeeting.paymentProof && (
                  <DetalisFormatted
                    title="Payment Proof"
                    detail={
                      <a
                        href={viewMeeting.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        View File
                      </a>
                    }
                  />
                )}
              </>
            )}
          </InternalMeetingDetails>
        )}
      </MuiModal>

      {paymentBatch && (
        <MeetingPaymentModal
          meeting={paymentBatch.meeting}
          batch={paymentBatch}
          onClose={() => setPaymentBatch(null)}
          onSaved={refreshCreditHistory}
        />
      )}
    </PageFrame>
  );
}
