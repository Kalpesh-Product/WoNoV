import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
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
  ["brandName", "Brand Name"],
  ["sector", "Sector"],
  ["city", "City"],
  ["state", "State"],
  ["bookingType", "Booking Type"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["revenue", "Revenue"],
  ["sourcing", "Sourcing"],
  ["currentStatus", "Current Status"],
  ["buildingName", "Building Name"],
  ["unitNo", "Unit No"],
  ["billingFrequency", "Billing Frequency"],
  ["cabinDesks", "Cabin Desks"],
  ["cabinDeskRate", "Rate Per Cabin Desk"],
  ["openDesks", "Open Desks"],
  ["openDeskRate", "Rate Per Open Desk"],
  ["totalDesks", "No of Desk"],
  ["invoiceRate", "Invoice Rate"],
  ["monthlyFee", "Monthly Fee"],
  ["securityDeposit", "Security Deposit"],
  ["brokerage", "Brokerage"],
  ["internalLead", "Internal Lead"],
  ["receivedAmount", "Received Amount"],
  ["totalReceivedAmount", "Total Received Amount"],
  ["companyStatus", "Company Status"],
  ["annualIncrement", "Annual Increment"],
  ["perDeskMeetingCredits", "Per Desk Meeting Credits"],
  ["totalMeetingCredits", "Total Meeting Credits"],
  ["startDate", "Start Date"],
  ["endDate", "End Date"],
  ["lockInPeriod", "Lock-in Period"],
  ["rentDate", "Rent Date"],
  ["nextIncrement", "Next Increment"],
  ["agreementExpiry", "Agreement Expiry"],
  ["localPocName", "Local POC Name"],
  ["localPocEmail", "Local POC Email"],
  ["localPocPhone", "Local POC Phone"],
  ["hoPocName", "HO POC Name"],
  ["hoPocEmail", "HO POC Email"],
  ["hoPocPhone", "HO POC Phone"],
  ["hoPocAddress", "HO POC Address"],
  ["alternateAdminName", "Alternate Admin Name"],
  ["alternateAdminPhone", "Alternate Admin Phone"],
].map(([field, headerName]) => ({ field, headerName, hide: true }));

const getVirtualOfficeExportFields = (snapshot) => {
  const totalDesks =
    Number(snapshot.totalDesks) ||
    Number(snapshot.cabinDesks || 0) + Number(snapshot.openDesks || 0);
  const revenue =
    Number(snapshot.monthlyFee) ||
    Number(snapshot.cabinTotal || 0) + Number(snapshot.openTotal || 0);
  const invoiceRate =
    Number(snapshot.deskRate) ||
    Number(snapshot.cabinDeskRate) ||
    Number(snapshot.openDeskRate) ||
    0;
  const startDate = dayjs(snapshot.termStartDate);
  const endDate = dayjs(snapshot.termEnd);
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
    brandName: displayValue(snapshot.brandName),
    sector: displayValue(snapshot.sector || snapshot.service?.serviceName),
    city: displayValue(snapshot.city),
    state: displayValue(snapshot.state),
    bookingType: displayValue(snapshot.bookingType),
    email: displayValue(snapshot.email),
    phone: displayValue(snapshot.phone),
    revenue: money(revenue),
    sourcing: displayValue(snapshot.channel || snapshot.source),
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
    cabinDeskRate: money(snapshot.cabinDeskRate),
    openDesks: displayValue(snapshot.openDesks),
    openDeskRate: money(snapshot.openDeskRate),
    totalDesks: displayValue(totalDesks),
    invoiceRate: money(invoiceRate),
    monthlyFee: money(snapshot.monthlyFee),
    securityDeposit: money(snapshot.securityDeposit),
    brokerage: money(snapshot.brokerage),
    internalLead: displayValue(snapshot.internalLead),
    receivedAmount: money(snapshot.receivedAmount),
    totalReceivedAmount: money(snapshot.totalReceivedAmount),
    companyStatus: snapshot.clientStatus ? "Active" : "Inactive",
    annualIncrement: `${Number(snapshot.annualIncrement) || 0}%`,
    perDeskMeetingCredits: displayValue(snapshot.perDeskMeetingCredits ?? 0),
    totalMeetingCredits: displayValue(snapshot.totalMeetingCredits ?? 0),
    startDate: displayDate(snapshot.termStartDate),
    endDate: displayDate(snapshot.termEnd),
    lockInPeriod: `${Number(snapshot.lockInPeriodMonths) || 0} months`,
    rentDate: displayDate(snapshot.rentDate),
    nextIncrement: displayDate(snapshot.nextIncrementDate),
    agreementExpiry: totalDays ? `${remainingDays}/${totalDays} days` : "N/A",
    localPocName: displayValue(snapshot.localPoc?.name),
    localPocEmail: displayValue(snapshot.localPoc?.email),
    localPocPhone: displayValue(snapshot.localPoc?.phone),
    hoPocName: displayValue(snapshot.hoPoc?.name),
    hoPocEmail: displayValue(snapshot.hoPoc?.email),
    hoPocPhone: displayValue(snapshot.hoPoc?.phone),
    hoPocAddress: displayValue(snapshot.hoPoc?.address),
    alternateAdminName: displayValue(snapshot.alternateAdmin?.name),
    alternateAdminPhone: displayValue(snapshot.alternateAdmin?.phone),
  };
};

const VirtualOfficeClientHistory = () => {
  const { clientId } = useParams();
  const isValidClientId = /^[a-f\d]{24}$/i.test(clientId || "");
  const navigate = useNavigate();
  const location = useLocation();
  const axios = useAxiosPrivate();
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["virtual-office-client-history", clientId],
    enabled: isValidClientId,
    queryFn: async () => {
      const response = await axios.get(
        `/api/sales/virtual-office/${clientId}/history`,
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (isValidClientId) return;

    navigate(
      "/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office",
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
          ...getVirtualOfficeExportFields(snapshot),
          id: entry._id,
          srNo: index + 1,
          clientName: snapshot.clientName || data?.clientName || "N/A",
          clientType: snapshot.billingFrequency || "N/A",
          totalTerm: snapshot.totalTerm || 0,
          status: snapshot.clientStatus ? "Active" : "Inactive",
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
      {
        field: "totalTerm",
        headerName: "Total Term",
        flex: 0.65,
        minWidth: 110,
      },
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
  const revenue =
    Number(snapshot.monthlyFee) ||
    Number(snapshot.cabinTotal || 0) + Number(snapshot.openTotal || 0);
  const invoiceRate =
    Number(snapshot.deskRate) ||
    Number(snapshot.cabinDeskRate) ||
    Number(snapshot.openDeskRate) ||
    0;
  const startDate = dayjs(snapshot.termStartDate);
  const endDate = dayjs(snapshot.termEnd);
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
          VIRTUAL OFFICE CLIENT HISTORY
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
              <DetalisFormatted title="Brand Name" detail={displayValue(snapshot.brandName)} />
              <DetalisFormatted title="Sector" detail={displayValue(snapshot.sector || snapshot.service?.serviceName)} />
              <DetalisFormatted title="City" detail={displayValue(snapshot.city)} />
              <DetalisFormatted title="State" detail={displayValue(snapshot.state)} />
              <DetalisFormatted title="Booking Type" detail={displayValue(snapshot.bookingType)} />
              <DetalisFormatted title="Email" detail={displayValue(snapshot.email)} />
              <DetalisFormatted title="Phone" detail={displayValue(snapshot.phone)} />
              <DetalisFormatted title="Revenue" detail={formatMoney(revenue)} />
              <DetalisFormatted title="Sourcing" detail={displayValue(snapshot.channel || snapshot.source)} />
              <DetalisFormatted title="Current Status" detail={displayValue(snapshot.currentStatus || "In Progress")} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">Company Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Building Name" detail={displayValue(buildingName)} />
              <DetalisFormatted title="Unit No" detail={displayValue(unitNo)} />
              <DetalisFormatted title="Billing Frequency" detail={displayValue(snapshot.billingFrequency)} />
              <DetalisFormatted title="Cabin Desks" detail={displayValue(snapshot.cabinDesks)} />
              <DetalisFormatted title="Rate Per Cabin Desk" detail={formatMoney(snapshot.cabinDeskRate)} />
              <DetalisFormatted title="Open Desks" detail={displayValue(snapshot.openDesks)} />
              <DetalisFormatted title="Rate Per Open Desk" detail={formatMoney(snapshot.openDeskRate)} />
              <DetalisFormatted title="No of Desk" detail={displayValue(totalDesks)} />
              <DetalisFormatted title="Invoice Rate" detail={formatMoney(invoiceRate)} />
              <DetalisFormatted title="Monthly Fee" detail={formatMoney(snapshot.monthlyFee)} />
              <DetalisFormatted title="Security Deposit" detail={formatMoney(snapshot.securityDeposit)} />
              <DetalisFormatted title="Brokerage" detail={formatMoney(snapshot.brokerage)} />
              <DetalisFormatted title="Internal Lead" detail={displayValue(snapshot.internalLead)} />
              <DetalisFormatted title="Received Amount" detail={formatMoney(snapshot.receivedAmount)} />
              <DetalisFormatted title="Total Received Amount" detail={formatMoney(snapshot.totalReceivedAmount)} />
              <DetalisFormatted title="Company Status" detail={snapshot.clientStatus ? "Active" : "Inactive"} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">Agreement Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Annual Increment" detail={`${Number(snapshot.annualIncrement) || 0}%`} />
              <DetalisFormatted title="Per Desk Meeting Credits" detail={displayValue(snapshot.perDeskMeetingCredits ?? 0)} />
              <DetalisFormatted title="Total Meeting Credits" detail={displayValue(snapshot.totalMeetingCredits ?? 0)} />
              <DetalisFormatted title="Start Date" detail={displayDate(snapshot.termStartDate)} />
              <DetalisFormatted title="End Date" detail={displayDate(snapshot.termEnd)} />
              <DetalisFormatted title="Lock-in Period" detail={`${Number(snapshot.lockInPeriodMonths) || 0} months`} />
              <DetalisFormatted title="Rent Date" detail={displayDate(snapshot.rentDate)} />
              <DetalisFormatted title="Next Increment" detail={displayDate(snapshot.nextIncrementDate)} />
              <DetalisFormatted title="Total Term" detail={`${Number(snapshot.totalTerm) || 0} months`} />
              <DetalisFormatted title="Agreement Expiry" detail={totalDays ? `${remainingDays}/${totalDays} days` : "N/A"} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-pmedium text-gray-900">POC Details</h3>
            <div className="space-y-1">
              <DetalisFormatted title="Local POC Name" detail={displayValue(snapshot.localPoc?.name)} />
              <DetalisFormatted title="Local POC Email" detail={displayValue(snapshot.localPoc?.email)} />
              <DetalisFormatted title="Local POC Phone" detail={displayValue(snapshot.localPoc?.phone)} />
              <DetalisFormatted title="HO POC Name" detail={displayValue(snapshot.hoPoc?.name)} />
              <DetalisFormatted title="HO POC Email" detail={displayValue(snapshot.hoPoc?.email)} />
              <DetalisFormatted title="HO POC Phone" detail={displayValue(snapshot.hoPoc?.phone)} />
              <DetalisFormatted title="HO POC Address" detail={displayValue(snapshot.hoPoc?.address)} />
              <DetalisFormatted title="Alternate Admin Name" detail={displayValue(snapshot.alternateAdmin?.name)} />
              <DetalisFormatted title="Alternate Admin Phone" detail={displayValue(snapshot.alternateAdmin?.phone)} />
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

export default VirtualOfficeClientHistory;
