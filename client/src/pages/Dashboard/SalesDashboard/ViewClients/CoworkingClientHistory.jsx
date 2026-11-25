import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Chip } from "@mui/material";
import dayjs from "dayjs";
import AgTable from "../../../../components/AgTable";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import MuiModal from "../../../../components/MuiModal";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";

const displayValue = (value) =>
  value === undefined || value === null || value === "" ? "N/A" : value;

const displayDate = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "N/A";

const exportOnlyColumns = [
  ["sector", "Sector"],
  ["hoCity", "Ho City"],
  ["hoState", "Ho State"],
  ["bookingType", "Booking Type"],
  ["revenue", "Revenue"],
  ["sourcing", "Sourcing"],
  ["currentStatus", "Current Status"],
  ["buildingName", "Building Name"],
  ["unitNo", "Unit No"],
  ["billingFrequency", "Billing Frequency"],
  ["cabinDesks", "Cabin Desks"],
  ["ratePerCabinDesk", "Rate Per Cabin Desk"],
  ["openDesks", "Open Desks"],
  ["ratePerOpenDesk", "Rate Per Open Desk"],
  ["noOfDesk", "No of Desk"],
  ["invoiceRate", "Invoice Rate"],
  ["companyStatus", "Company Status"],
  ["annualIncrement", "Annual Increment"],
  ["perDeskMeetingCredits", "Per Desk Meeting Credits"],
  ["totalMeetingCredits", "Total Meeting Credits"],
  ["startDate", "Start Date"],
  ["endDate", "End Date"],
  ["lockinPeriod", "Lock-in Period"],
  ["rentDate", "Rent Date"],
  ["nextIncrement", "Next Increment"],
  ["totalTerm", "Total Term"],
  ["agreementExpiry", "Agreement Expiry"],
  ["localPocName", "Local POC Name"],
  ["localPocEmail", "Local POC Email"],
  ["localPocPhone", "Local POC Phone"],
  ["hoPocName", "HO POC Name"],
  ["hoPocEmail", "HO POC Email"],
  ["hoPocPhone", "HO POC Phone"],
].map(([field, headerName]) => ({ field, headerName, hide: true }));

const getCoworkingExportFields = (snapshot) => {
  const cabinRate = Number(snapshot.ratePerCabinDesk || 0);
  const openRate = Number(snapshot.ratePerOpenDesk || 0);
  const startDate = dayjs(snapshot.startDate);
  const endDate = dayjs(snapshot.endDate);
  const totalDays =
    startDate.isValid() && endDate.isValid()
      ? Math.max(endDate.startOf("day").diff(startDate.startOf("day"), "day"), 0)
      : 0;
  const remainingDays = endDate.isValid()
    ? Math.min(
        totalDays,
        Math.max(endDate.startOf("day").diff(dayjs().startOf("day"), "day"), 0),
      )
    : 0;
  const money = (value) =>
    value === undefined || value === null || value === ""
      ? "N/A"
      : inrFormat(value);

  return {
    sector: displayValue(snapshot.sector || snapshot.service?.serviceName),
    hoCity: displayValue(snapshot.hoCity),
    hoState: displayValue(snapshot.hoState),
    bookingType: displayValue(snapshot.bookingType),
    revenue: money(
      Number(snapshot.cabinDesks || 0) * cabinRate +
        Number(snapshot.openDesks || 0) * openRate,
    ),
    sourcing: displayValue(snapshot.channel || snapshot.sourcing),
    currentStatus: displayValue(snapshot.currentStatus || "In Progress"),
    buildingName: displayValue(
      snapshot.unit?.building?.buildingName ||
        snapshot.building?.buildingName ||
        snapshot.buildingName,
    ),
    unitNo: displayValue(
      snapshot.unit?.unitNo || snapshot.unitNo || snapshot.unit?.unitName,
    ),
    billingFrequency: displayValue(snapshot.billingFrequency),
    cabinDesks: displayValue(snapshot.cabinDesks),
    ratePerCabinDesk: money(snapshot.ratePerCabinDesk),
    openDesks: displayValue(snapshot.openDesks),
    ratePerOpenDesk: money(snapshot.ratePerOpenDesk),
    noOfDesk: displayValue(
      Number(snapshot.totalDesks) ||
        Number(snapshot.cabinDesks || 0) + Number(snapshot.openDesks || 0),
    ),
    invoiceRate: money(cabinRate || openRate),
    companyStatus: snapshot.isActive ? "Active" : "Inactive",
    annualIncrement: `${Number(snapshot.annualIncrement) || 0}%`,
    perDeskMeetingCredits: displayValue(snapshot.perDeskMeetingCredits ?? 0),
    totalMeetingCredits: displayValue(snapshot.totalMeetingCredits ?? 0),
    startDate: displayDate(snapshot.startDate),
    endDate: displayDate(snapshot.endDate),
    lockinPeriod: `${Number(snapshot.lockinPeriod || snapshot.lockInPeriodMonths) || 0} months`,
    rentDate: displayDate(snapshot.rentDate),
    nextIncrement: displayDate(snapshot.nextIncrement),
    totalTerm: `${startDate.isValid() && endDate.isValid() ? Math.max(endDate.diff(startDate, "month"), 0) : 0} months`,
    agreementExpiry: totalDays ? `${remainingDays}/${totalDays} days` : "N/A",
    localPocName: displayValue(snapshot.localPoc?.name),
    localPocEmail: displayValue(snapshot.localPoc?.email),
    localPocPhone: displayValue(snapshot.localPoc?.phone),
    hoPocName: displayValue(snapshot.hOPoc?.name),
    hoPocEmail: displayValue(snapshot.hOPoc?.email),
    hoPocPhone: displayValue(snapshot.hOPoc?.phone),
  };
};

const CoworkingClientHistory = () => {
  const { clientId } = useParams();
  const isValidClientId = /^[a-f\d]{24}$/i.test(clientId || "");
  const navigate = useNavigate();
  const location = useLocation();
  const axios = useAxiosPrivate();
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["coworking-client-history", clientId],
    enabled: isValidClientId,
    queryFn: async () => {
      const response = await axios.get(
        `/api/sales/co-working-clients/${clientId}/history`,
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (isValidClientId) return;

    navigate(
      "/app/dashboard/sales-dashboard/mix-bag/clients/co-working",
      { replace: true },
    );
  }, [isValidClientId, navigate]);

  useEffect(() => {
    if (!data?.clientName || location.state?.breadcrumbLabel === data.clientName) {
      return;
    }

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: { ...location.state, breadcrumbLabel: data.clientName },
    });
  }, [data?.clientName, location.pathname, location.search, location.state, navigate]);

  const rows = useMemo(
    () =>
      (data?.history || []).map((entry, index) => {
        const snapshot = entry.snapshot || {};
        const updatedBy = entry.updatedBy || {};

        return {
          ...entry,
          ...getCoworkingExportFields(snapshot),
          id: entry._id,
          srNo: index + 1,
          clientName: snapshot.clientName || data?.clientName || "N/A",
          clientType:
            String(snapshot.clientType || "").trim() ||
            (snapshot.billingFrequency === "Monthly"
              ? "Flexy Desk Client"
              : snapshot.billingFrequency
                ? "Annual Client"
                : "N/A"),
          desks:
            Number(snapshot.totalDesks) ||
            Number(snapshot.cabinDesks || 0) + Number(snapshot.openDesks || 0),
          status: snapshot.isActive ? "Active" : "Inactive",
          updatedOn: entry.updatedAt
            ? dayjs(entry.updatedAt).format("DD MMM YYYY, hh:mm A")
            : "N/A",
          updatedBy:
            [updatedBy.firstName, updatedBy.lastName].filter(Boolean).join(" ") ||
            updatedBy.email ||
            "N/A",
        };
      }),
    [data],
  );

  const columns = useMemo(
    () => [
      { field: "srNo", headerName: "Sr No", width: 80 },
      {
        field: "clientName",
        headerName: "Client Name",
        flex: 1.4,
        minWidth: 200,
      },
      {
        field: "clientType",
        headerName: "Client Type",
        flex: 1,
        minWidth: 160,
      },
      { field: "desks", headerName: "Desks", flex: 0.55, minWidth: 90 },
      {
        field: "updatedBy",
        headerName: "Updated By",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "updatedOn",
        headerName: "Updated On",
        flex: 1.1,
        minWidth: 190,
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        pinned: "right",
        cellRenderer: ({ value }) => {
          const isActive = value === "Active";

          return (
            <Chip
              label={value}
              style={{
                backgroundColor: isActive ? "#90EE90" : "#FFECC5",
                color: isActive ? "#006400" : "#CC8400",
              }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Action",
        width: 90,
        pinned: "right",
        sortable: false,
        filter: false,
        suppressCsvExport: true,
        cellRenderer: ({ data: entry }) => (
          <button
            type="button"
            title="View client details"
            aria-label={`View ${entry.clientName} history details`}
            className="inline-flex h-full items-center text-primary"
            onClick={() => setSelectedEntry(entry)}
          >
            <MdOutlineRemoveRedEye size={20} />
          </button>
        ),
      },
      ...exportOnlyColumns,
    ],
    [],
  );

  const snapshot = selectedEntry?.snapshot || {};
  const totalDesks =
    Number(snapshot.totalDesks) ||
    Number(snapshot.cabinDesks || 0) + Number(snapshot.openDesks || 0);
  const cabinRate = Number(snapshot.ratePerCabinDesk || 0);
  const openRate = Number(snapshot.ratePerOpenDesk || 0);
  const invoiceRate = cabinRate || openRate;
  const revenue =
    Number(snapshot.cabinDesks || 0) * cabinRate +
    Number(snapshot.openDesks || 0) * openRate;
  const startDate = dayjs(snapshot.startDate);
  const endDate = dayjs(snapshot.endDate);
  const totalTerm =
    startDate.isValid() && endDate.isValid()
      ? Math.max(endDate.diff(startDate, "month"), 0)
      : 0;
  const totalDays =
    startDate.isValid() && endDate.isValid()
      ? Math.max(endDate.startOf("day").diff(startDate.startOf("day"), "day"), 0)
      : 0;
  const remainingDays = endDate.isValid()
    ? Math.min(
        totalDays,
        Math.max(endDate.startOf("day").diff(dayjs().startOf("day"), "day"), 0),
      )
    : 0;
  const buildingName =
    snapshot.unit?.building?.buildingName ||
    snapshot.building?.buildingName ||
    snapshot.buildingName;
  const unitNo =
    snapshot.unit?.unitNo || snapshot.unitNo || snapshot.unit?.unitName;
  const formatMoney = (value) =>
    value === undefined || value === null || value === ""
      ? "N/A"
      : inrFormat(value);

  if (!isValidClientId) return null;

  return (
    <PageFrame>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-primary">
          COWORKING CLIENT HISTORY
        </h1>
      </div>

      {isError ? (
        <p className="p-4 text-red-600">Unable to fetch client history.</p>
      ) : (
        <AgTable
          data={rows}
          columns={columns}
          loading={isPending}
          search
          exportData
          tableHeight={480}
        />
      )}

      <MuiModal
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        title={<span className="text-gray-900">VIEW CLIENT DETAILS</span>}
        widthClass="w-[calc(100vw-2rem)] max-w-[820px]"
      >
        <div className="flex flex-col gap-7 text-gray-700">
          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">Customer Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Client Name" detail={displayValue(snapshot.clientName)} />
              <DetalisFormatted title="Sector" detail={displayValue(snapshot.sector || snapshot.service?.serviceName)} />
              <DetalisFormatted title="Ho City" detail={displayValue(snapshot.hoCity)} />
              <DetalisFormatted title="Ho State" detail={displayValue(snapshot.hoState)} />
              <DetalisFormatted title="Booking Type" detail={displayValue(snapshot.bookingType)} />
              <DetalisFormatted title="Revenue" detail={formatMoney(revenue)} />
              <DetalisFormatted title="Sourcing" detail={displayValue(snapshot.channel || snapshot.sourcing)} />
              <DetalisFormatted title="Current Status" detail={displayValue(snapshot.currentStatus || "In Progress")} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">Company Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Building Name" detail={displayValue(buildingName)} />
              <DetalisFormatted title="Unit No" detail={displayValue(unitNo)} />
              <DetalisFormatted title="Billing Frequency" detail={displayValue(snapshot.billingFrequency)} />
              <DetalisFormatted title="Client Type" detail={displayValue(snapshot.clientType)} />
              <DetalisFormatted title="Cabin Desks" detail={displayValue(snapshot.cabinDesks)} />
              <DetalisFormatted title="Rate Per Cabin Desk" detail={formatMoney(snapshot.ratePerCabinDesk)} />
              <DetalisFormatted title="Open Desks" detail={displayValue(snapshot.openDesks)} />
              <DetalisFormatted title="Rate Per Open Desk" detail={formatMoney(snapshot.ratePerOpenDesk)} />
              <DetalisFormatted title="No of Desk" detail={displayValue(totalDesks)} />
              <DetalisFormatted title="Invoice Rate" detail={formatMoney(invoiceRate)} />
              <DetalisFormatted title="Company Status" detail={snapshot.isActive ? "Active" : "Inactive"} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">Agreement Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Annual Increment" detail={`${Number(snapshot.annualIncrement) || 0}%`} />
              <DetalisFormatted title="Per Desk Meeting Credits" detail={displayValue(snapshot.perDeskMeetingCredits ?? 0)} />
              <DetalisFormatted title="Total Meeting Credits" detail={displayValue(snapshot.totalMeetingCredits ?? 0)} />
              <DetalisFormatted title="Start Date" detail={displayDate(snapshot.startDate)} />
              <DetalisFormatted title="End Date" detail={displayDate(snapshot.endDate)} />
              <DetalisFormatted title="Lock-in Period" detail={`${Number(snapshot.lockinPeriod || snapshot.lockInPeriodMonths) || 0} months`} />
              <DetalisFormatted title="Rent Date" detail={displayDate(snapshot.rentDate)} />
              <DetalisFormatted title="Next Increment" detail={displayDate(snapshot.nextIncrement)} />
              <DetalisFormatted title="Total Term" detail={`${totalTerm} months`} />
              <DetalisFormatted title="Agreement Expiry" detail={totalDays ? `${remainingDays}/${totalDays} days` : "N/A"} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">POC Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Local POC Name" detail={displayValue(snapshot.localPoc?.name)} />
              <DetalisFormatted title="Local POC Email" detail={displayValue(snapshot.localPoc?.email)} />
              <DetalisFormatted title="Local POC Phone" detail={displayValue(snapshot.localPoc?.phone)} />
              <DetalisFormatted title="HO POC Name" detail={displayValue(snapshot.hOPoc?.name)} />
              <DetalisFormatted title="HO POC Email" detail={displayValue(snapshot.hOPoc?.email)} />
              <DetalisFormatted title="HO POC Phone" detail={displayValue(snapshot.hOPoc?.phone)} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">Update Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Updated By" detail={displayValue(selectedEntry?.updatedBy)} />
              <DetalisFormatted title="Updated On" detail={displayValue(selectedEntry?.updatedOn)} />
            </div>
          </section>
        </div>
      </MuiModal>
    </PageFrame>
  );
};

export default CoworkingClientHistory;
