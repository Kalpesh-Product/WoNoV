import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import StatusChip from "../../../components/StatusChip";
import TicketAttachments from "../../../components/TicketAttachments";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import formatDateTime from "../../../utils/formatDateTime";

const getFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "N/A";

const RejectedTickets = ({ title, departmentId }) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [viewTicketDetails, setViewTicketDetails] = useState(null);
  const initialDateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    }),
    [],
  );

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["rejected-tickets", departmentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tickets/ticket-filter/reject/${departmentId}`,
      );
      return response.data || [];
    },
    enabled: Boolean(departmentId),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const rows = isLoading
    ? []
    : tickets.map((ticket, index) => ({
        ...ticket,
        sourceTicket: ticket,
        srNo: index + 1,
        id: ticket._id,
        ticketTitle: ticket.ticket || "No Title",
        description: ticket.description || "-",
        fromDepartment:
          ticket.raisedBy?.departments?.map((department) => department.name) ||
          "N/A",
        raisedBy: getFullName(ticket.raisedBy),
        raisedToDepartment: ticket.raisedToDepartment?.name || "N/A",
        rejectedBy: getFullName(ticket.reject?.rejectedBy),
        rejectedAt: ticket.reject?.rejectedAt
          ? formatDateTime(ticket.reject.rejectedAt)
          : "-",
        rejectedAtRaw: ticket.reject?.rejectedAt || null,
        rejectionReason: ticket.reject?.reason || "-",
        status: ticket.status || "Rejected",
        priority: ticket.priority || "Low",
        image: ticket.image?.url || null,
        attachments: ticket.attachments || [],
      }));

  const columns = [
    { field: "srNo", headerName: "Sr No", sort: "asc" },
    { field: "ticketTitle", headerName: "Ticket Title", minWidth: 220 },
    { field: "fromDepartment", headerName: "From Department", minWidth: 200 },
    { field: "raisedBy", headerName: "Raised By", minWidth: 170 },
    {
      field: "raisedToDepartment",
      headerName: "Raised To Department",
      minWidth: 210,
    },
    { field: "rejectedBy", headerName: "Rejected By", minWidth: 180 },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "rejectedAt",
      headerName: "Rejected At",
      pinned: "right",
      minWidth: 190,
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <button
          type="button"
          aria-label="View rejected ticket"
          className="p-2 text-subtitle cursor-pointer"
          onClick={() => {
            setViewTicketDetails(params.data);
            setOpenModal(true);
          }}
        >
          <MdOutlineRemoveRedEye />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 border-default border-borderGray rounded-md">
      <YearWiseTable
        loading={isLoading}
        tableTitle={title}
        data={rows}
        columns={columns}
        dateColumn="rejectedAtRaw"
        initialDateRange={initialDateRange}
        tableHeight={400}
        showEmptyTable
        search
      />

      <MuiModal
        open={openModal && Boolean(viewTicketDetails)}
        onClose={() => setOpenModal(false)}
        title="View Rejected Ticket"
      >
        {viewTicketDetails && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title="Ticket Title"
              detail={viewTicketDetails.ticketTitle}
            />
            <DetalisFormatted
              title="Description"
              detail={viewTicketDetails.description}
            />
            <DetalisFormatted
              title="From Department"
              detail={viewTicketDetails.fromDepartment}
            />
            <DetalisFormatted
              title="Raised By"
              detail={viewTicketDetails.raisedBy}
            />
            <DetalisFormatted
              title="Raised At"
              detail={formatDateTime(viewTicketDetails.createdAt)}
            />
            <DetalisFormatted
              title="Raised To Department"
              detail={viewTicketDetails.raisedToDepartment}
            />
            <DetalisFormatted
              title="Priority"
              detail={viewTicketDetails.priority}
            />
            <DetalisFormatted
              title="Status"
              detail={viewTicketDetails.status}
            />
            <DetalisFormatted
              title="Rejected By"
              detail={viewTicketDetails.rejectedBy}
            />
            <DetalisFormatted
              title="Rejected At"
              detail={viewTicketDetails.rejectedAt}
            />
            <DetalisFormatted
              title="Rejection Reason"
              detail={viewTicketDetails.rejectionReason}
            />
            <TicketAttachments
              attachments={viewTicketDetails.attachments}
              legacyImage={viewTicketDetails.image}
            />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default RejectedTickets;
