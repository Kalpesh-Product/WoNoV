import React, { useCallback, useEffect, useMemo, useState } from "react";
import AgTable from "../../components/AgTable";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import { Chip, CircularProgress } from "@mui/material";
import MuiModal from "../../components/MuiModal";
import TicketDetails from "../../components/TicketDetails";
import { getTicketDetailFields } from "../../utils/ticketDetailFields";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import TicketAttachments from "../../components/TicketAttachments";
import dayjs from "dayjs";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import humanTime from "../../utils/humanTime";
import StatusChip from "../../components/StatusChip";
import formatDateTime from "../../utils/formatDateTime";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../constants/pagination";

const toUtcDayBoundary = (value, endOfDay = false) => {
  const date = dayjs(value);

  return new Date(
    Date.UTC(
      date.year(),
      date.month(),
      date.date(),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    ),
  ).toISOString();
};

const TicketReports = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  //const departmentId = auth.user?.departments?.[0]?._id;
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [ticketSearch, setTicketSearch] = useState("");
  const [debouncedTicketSearch, setDebouncedTicketSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedTicketSearch(ticketSearch.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [ticketSearch]);

  const handleTicketSearchChange = (value) => {
    setTicketSearch(value);

    setPagination((current) =>
      current.page === 1
        ? current
        : {
            ...current,
            page: 1,
          },
    );
  };

  const initialDateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    }),
    [],
  );
  const [dateRange, setDateRange] = useState(initialDateRange);

  const handleDateFilterChange = useCallback(({ selectedRange }) => {
    if (!selectedRange?.startDate || !selectedRange?.endDate) return;

    setDateRange((current) => {
      const isSameRange =
        dayjs(current.startDate).isSame(selectedRange.startDate, "day") &&
        dayjs(current.endDate).isSame(selectedRange.endDate, "day");

      if (isSameRange) return current;

      setPagination((currentPage) =>
        currentPage.page === 1 ? currentPage : { ...currentPage, page: 1 },
      );

      return selectedRange;
    });
  }, []);
  const handleSelectedMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setDetailsModal(true);
  };
  const { data: ticketsData = [], isLoading } = useQuery({
    queryKey: [
      "tickets-data",
      "report",
      dateRange.startDate,
      dateRange.endDate,
      pagination.page,
      pagination.limit,
      debouncedTicketSearch,
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/tickets/get-all-tickets`, {
          params: {
            startDate: toUtcDayBoundary(dateRange.startDate),
            endDate: toUtcDayBoundary(dateRange.endDate, true),
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedTicketSearch || undefined,
          },
        });
        const responsePagination = response.data.pagination;

        setPagination((current) => ({
          page: Number(responsePagination?.page) || current.page,
          limit: Number(responsePagination?.limit) || current.limit,
          total: Number(responsePagination?.total) || 0,
        }));

        // queryKey: ["tickets-data", departmentId],
        // enabled: Boolean(departmentId),
        // queryFn: async () => {
        //   try {
        //     const response = await axios.get(
        //       `/api/tickets/department-tickets/${departmentId}`,
        //     );
        // const response = await axios.get(
        //   `/api/tickets/get-all-tickets`
        // );

        return response.data.data || [];
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });

  const splitDateAndTime = (value) => ({
    date: value ? humanDate(value) : "",
    time: value ? humanTime(value) : "",
  });

  const formatDateTimeOrEmpty = (value) => {
    if (!value) return "";
    const formatted = formatDateTime(value);
    return formatted === "N/A" ? "" : formatted;
  };

  const getFromDepartment = (ticket) => {
    const departments = [
      ...(Array.isArray(ticket?.raisedBy?.departments)
        ? ticket.raisedBy.departments
        : []),
      ...(Array.isArray(ticket?.ticket?.raisedBy?.departments)
        ? ticket.ticket.raisedBy.departments
        : []),
    ];

    const departmentNames = departments
      .map((department) => department?.name)
      .filter(Boolean);

    return departmentNames.length ? departmentNames.join(", ") : "";
  };

  const kraColumn = [
    { field: "srNo", headerName: "Sr No", sort: "desc" },
    { field: "ticket", headerName: "Ticket Title" },
    { field: "fromDepartment", headerName: "From Department" },
    { field: "raisedBy", headerName: "Raised By" },
    {
      field: "raisedAt",
      headerName: "Raised At",
    },
    { field: "raisedToDepartment", headerName: "Raised To Department" },
    { field: "acceptedBy", headerName: "Accepted By" },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      pinned: "right",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="flex gap-2 items-center">
            <div
              onClick={() => {
                handleSelectedMeeting(params.data);
              }}
              className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
            >
              <span className="text-subtitle">
                <MdOutlineRemoveRedEye />
              </span>
            </div>
          </div>
        </>
      ),
    },
    { field: "priority", headerName: "Priority", hide: true },
    { field: "description", headerName: "Description", hide: true },
    //{ field: "company", headerName: "Company", hide: true },
    { field: "assignedTo", headerName: "Assigned To", hide: true },
    { field: "assignedAtDate", headerName: "Assign At", hide: true },
    // { field: "acceptedBy", headerName: "Accepted By", hide: true },
    {
      // field: "acceptedAtDate",
      field: "acceptedAt",
      headerName: "Accepted At",
      hide: true,
      // cellRenderer: (params) => params.value,
    },

    // {
    //   field: "assignedAtTime",
    //   headerName: "Assigned Time",
    //   hide: true,
    //   cellRenderer: (params) => humanTime(params.value),
    // },
    { field: "escalatedTo", headerName: "Escalated To", hide: true },
    { field: "escalatedStatus", headerName: "Escalated Status", hide: true },
    {
      // field: "escalatedAtDate",
      field: "escalatedAt",
      headerName: "Escalated At",
      hide: true,
    },
    // {
    //   field: "escalatedAtTime",
    //   headerName: "Escalated Time",
    //   hide: true,
    //   cellRenderer: (params) => params.value,
    // },
    { field: "closedBy", headerName: "Closed By", hide: true },
    {
      // field: "closedAtDate",
      field: "closedAt",
      headerName: "Closed At",
      hide: true,
      // cellRenderer: (params) => params.value,
    },
    {
      field: "closingRemark",
      headerName: "Closing Remark",
      hide: true,
    },
    // {
    //   field: "closedAtTime",
    //   headerName: "Closed Time",
    //   hide: true,
    //   cellRenderer: (params) => params.value,
    // },
    { field: "rejectedBy", headerName: "Rejected By", hide: true },
    { field: "rejectedAt", headerName: "Rejected At", hide: true },
    { field: "reason", headerName: "Rejection Reason", hide: true },
  ];

  const formatAssignments = (assignments = []) => {
    const assignmentDetails = Array.isArray(assignments)
      ? assignments.map((assignment) => {
          const assignee = assignment?.assignee;
          const assigneeName =
            assignee?.firstName && assignee?.lastName
              ? `${assignee.firstName} ${assignee.lastName}`
              : "Unknown";
          const assignedAtFormatted = assignment?.assignedAt
            ? formatDateTime(assignment.assignedAt)
            : "";

          // `${humanDate(assignment.assignedAt)}, ${humanTime(
          //     assignment.assignedAt
          //   )}`
          return { assigneeName, assignedAtFormatted };
        })
      : [];

    // const assignedToDisplay = assignmentDetails
    //   .map(({ assigneeName, assignedAtFormatted }) =>
    //     assignedAtFormatted
    //       ? `${assigneeName} (${assignedAtFormatted})`
    //       : assigneeName,
    //   )
    //   .join(", ");
    const assignedToDisplay = assignmentDetails
      .map(({ assigneeName }) => assigneeName)
      .join(", ");

    return { assignedToDisplay, assignmentDetails };
  };

  // const formatEscalation = (escalations = []) => {
  //   if (!Array.isArray(escalations) || !escalations.length) {
  //     return {
  //       escalatedTo: "",
  //       escalatedStatus: "",
  //       escalatedAt: "",
  //       escalatedAtDate: "",
  //       escalatedAtTime: "",
  //     };
  //   }

  //   const latest = escalations[escalations.length - 1];

  //   return {
  //     escalatedTo: latest?.raisedToDepartment?.name || "",
  //     escalatedStatus: latest?.status || "",
  //     escalatedAt: latest?.createdAt
  // ? formatDateTime(latest.createdAt)
  // : "",
  //     // escalatedAt: latest?.createdAt
  //     //   ? `${humanDate(latest.createdAt)}, ${humanTime(latest.createdAt)}`
  //     //   : "",
  //     escalatedAtDate: latest?.createdAt,
  //     escalatedAtTime: latest?.createdAt,
  //   };
  // };
  const getFullName = (user) => {
    if (!user) return "";
    if (typeof user === "string") return user;

    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  };

  const getDepartmentName = (department) => {
    if (!department) return "";
    if (typeof department === "string") return department;

    return department?.name || department?.departmentName || "";
  };

  const getRejectedByUser = (ticket) =>
    ticket?.reject?.rejectedBy ||
    ticket?.rejectedBy ||
    ticket?.rejectBy ||
    null;

  const formatEscalation = (ticket) => {
    const escalationList = Array.isArray(ticket?.escalatedTo)
      ? ticket.escalatedTo
      : ticket?.escalatedTo
        ? [ticket.escalatedTo]
        : [];

    const isEscalatedTicket =
      ticket?.status === "Escalated" || escalationList.length > 0;

    if (!isEscalatedTicket) {
      return {
        escalatedTo: "",
        escalatedStatus: "",
        escalatedAt: "",
        escalatedAtDate: "",
        escalatedAtTime: "",
        reasonForEscalated: "",
      };
    }

    const latest = escalationList[escalationList.length - 1];

    const escalatedTo =
      getDepartmentName(latest?.raisedToDepartment) ||
      getDepartmentName(ticket?.raisedToDepartment) ||
      "";

    const escalatedStatus = ticket?.status || latest?.status || "";

    const escalatedAtRaw =
      ticket?.escalatededAt || latest?.createdAt || ticket?.updatedAt || "";

    return {
      escalatedTo,
      escalatedStatus,
      escalatedAt: escalatedAtRaw ? formatDateTime(escalatedAtRaw) : "",
      escalatedAtDate: escalatedAtRaw || "",
      escalatedAtTime: escalatedAtRaw || "",
      reasonForEscalated: latest?.description || "",
    };
  };

  const handleExportTickets = () => {
    const fieldRows = ticketsData.map((ticket) => getTicketDetailFields(ticket));
    const headers = getTicketDetailFields({}).map(({ label }) => label);
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escapeCsv).join(","),
      ...fieldRows.map((fields) => fields.map(({ value }) => escapeCsv(value)).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Ticket Reports.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <div>
          <YearWiseTable
              loading={isLoading}
              search={true}
              customExportTitle="Export"
              handleCustomExport={handleExportTickets}
              customExportDisabled={isLoading || ticketsData.length === 0}
              tableTitle={"Ticket Reports"}
              hideFilter={false}
              data={[
                ...ticketsData.map((item, index) => ({
                  ...item,
                  sourceTicket: item,
                  srNo: (pagination.page - 1) * pagination.limit + index + 1,
                  ticket: item.ticket || "",
                  fromDepartment: getFromDepartment(item),
                  raisedToDepartment: getDepartmentName(
                    item.raisedToDepartment,
                  ),
                  raisedBy: getFullName(item.raisedBy),
                  description: item.description || "",
                  status: item.status || "",
                  image: item?.image?.url || "",
                  attachments: item?.attachments || [],
                  assignees:
                    item.assignees?.map(
                      (assignee) =>
                        `${assignee.firstName} ${assignee.lastName}`,
                    ) || "",
                  company: item.company?.companyName,
                  priority: item.priority || "",
                  raisedAt: formatDateTime(item.createdAt) || "",
                  updatedAt: item.updatedAt || "",
                  acceptedBy: getFullName(item.acceptedBy),
                  closedBy: getFullName(item.closedBy),
                  closedAt: item.closedAt ? formatDateTime(item.closedAt) : "",
                  closedAtRaw: item.closedAt || "",
                  closingRemark: item.closingRemark || "",
                  closingCategories: Array.isArray(item.closingCategories)
                    ? item.closingCategories
                    : [],
                  closedAtDate: item.closedAt || "",
                  closedAtTime: item.closedAt || "",
                  rejectedBy: getFullName(getRejectedByUser(item)),
                  rejectedAt:
                    formatDateTimeOrEmpty(
                      item.reject?.rejectedAt ||
                        (item.status === "Rejected" ? item.updatedAt : ""),
                    ) || "",
                  acceptedAtDate: item.acceptedAt || "",
                  acceptedAtTime: item.acceptedAt || "",
                  acceptedAt: item.acceptedAt
                    ? formatDateTime(item.acceptedAt)
                    : "",
                  assignedAt:
                    item.assignedAt ||
                    (Array.isArray(item.assignedTo) &&
                      item.assignedTo[item.assignedTo.length - 1]
                        ?.assignedAt) ||
                    "",
                  reason: item.reject?.reason || "",
                  ...(() => {
                    const { assignedToDisplay, assignmentDetails } =
                      formatAssignments(item.assignedTo);
                    return {
                      assignedTo: assignedToDisplay,
                      assignedToDetails: assignmentDetails,
                    };
                  })(),
                  ...formatEscalation(item),
                  ...(() => {
                    // const { assignedToDisplay, assignmentDetails } =
                    //   formatAssignments(item.assignedTo);

                    const latestAssignment =
                      Array.isArray(item.assignedTo) && item.assignedTo.length
                        ? item.assignedTo[item.assignedTo.length - 1]
                        : null;

                    const assignedAtRaw =
                      item.assignedAt || latestAssignment?.assignedAt;

                    const { time: assignedAtTime } =
                      splitDateAndTime(assignedAtRaw);

                    return {
                      // assignedTo: assignedToDisplay,
                      // assignedToDetails: assignmentDetails,

                      assignedAtDate:
                        formatDateTimeOrEmpty(assignedAtRaw) || "",
                      assignedAtTime,
                    };
                  })(),
                })),
              ]}
              dateColumn={"createdAt"}
              initialDateRange={initialDateRange}
              onDateFilterChange={handleDateFilterChange}
              columns={kraColumn}
              serverPagination
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              paginationPageSize={pagination.limit}
              paginationPage={pagination.page}
              paginationTotal={pagination.total}
              onPaginationPageChange={(page) =>
                setPagination((current) => ({ ...current, page }))
              }
              onPaginationPageSizeChange={(limit) =>
                setPagination((current) =>
                  current.limit === limit
                    ? current
                    : { ...current, page: 1, limit },
                )
              }
              serverSearch
              searchValue={ticketSearch}
              onSearchChange={handleTicketSearchChange}
            />
        </div>
      </PageFrame>
      <MuiModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        title={"Ticket Details"}
      >
        <TicketDetails ticket={selectedMeeting} />
      </MuiModal>
    </div>
  );
};

export default TicketReports;
