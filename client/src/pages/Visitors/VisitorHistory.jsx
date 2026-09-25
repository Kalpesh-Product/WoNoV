import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import AgTable from "../../components/AgTable";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import { inrFormat } from "../../utils/currencyFormat";

const getPersonName = (person) => {
  if (!person || typeof person !== "object") return "-";
  return [person.firstName, person.lastName].filter(Boolean).join(" ") || "-";
};

const getCompanyName = (company) => {
  if (!company || typeof company !== "object") return "N/A";
  return company.clientName || company.companyName || company.name || "N/A";
};

const VisitorHistory = () => {
  const { visitorId } = useParams();
  const [searchParams] = useSearchParams();
  const historyType = searchParams.get("type") || "client";
  const isInternalHistory = historyType === "internal";
  const navigate = useNavigate();
  const location = useLocation();
  const axios = useAxiosPrivate();
  const [selectedVisit, setSelectedVisit] = useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["visitor-history", visitorId, historyType],
    enabled: Boolean(visitorId),
    queryFn: async () => {
      const response = await axios.get(
        `/api/visitors/visitor-history/${visitorId}`,
      );
      return response.data;
    },
  });

  const columns = useMemo(
    () => [
      { field: "srNo", headerName: "Sr No", width: 90 },
      { field: "visitorType", headerName: "Visit Type", minWidth: 150 },
      { field: "purposeOfVisit", headerName: "Purpose", minWidth: 190 },
      { field: "dateOfVisit", headerName: "Date of Visit", minWidth: 150 },
      { field: "checkIn", headerName: "Check In", minWidth: 130 },
      { field: "checkOut", headerName: "Check Out", minWidth: 130 },
      {
        field: "visitorName",
        headerName: "Visitor Name",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "email",
        headerName: "Email",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "phoneNumber",
        headerName: "Phone Number",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "checkedInBy",
        headerName: "Checked In By",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "checkedOutBy",
        headerName: "Checked Out By",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "visitorCompany",
        headerName: "Visitor Company",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      ...(isInternalHistory
        ? [
            {
              field: "departmentName",
              headerName: "Department",
              hide: true,
              suppressColumnsToolPanel: true,
            },
            {
              field: "toMeetName",
              headerName: "To Meet",
              hide: true,
              suppressColumnsToolPanel: true,
            },
            {
              field: "clientToMeetName",
              headerName: "Client To Meet",
              hide: true,
              suppressColumnsToolPanel: true,
            },
            {
              field: "toMeetCompanyName",
              headerName: "Company To Meet",
              hide: true,
              suppressColumnsToolPanel: true,
            },
          ]
        : []),
      {
        field: "buildingName",
        headerName: "Building",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "unitName",
        headerName: "Unit",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "taxableAmount",
        headerName: "Taxable Amount (INR)",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "discountAmount",
        headerName: "Discount (INR)",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "gstAmountExport",
        headerName: "GST Amount (INR)",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "totalAmountExport",
        headerName: "Total Amount (INR)",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "paymentStatus",
        headerName: "Payment Status",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "paymentVerificationExport",
        headerName: "Payment Verification",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "paymentModeExport",
        headerName: "Payment Mode",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "paymentProofLink",
        headerName: "Uploaded File",
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        field: "action",
        headerName: "Action",
        width: 110,
        pinned: "right",
        suppressCsvExport: true,
        cellRenderer: ({ data: visit }) => (
          <button
            type="button"
            title="View visit details"
            className="inline-flex h-full items-center text-primary"
            onClick={() => setSelectedVisit(visit)}
          >
            <MdOutlineRemoveRedEye size={20} />
          </button>
        ),
      },
    ],
    [isInternalHistory],
  );

  const historyVisits = useMemo(() => {
    const normalizeType = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");

    return (data?.visits || []).filter((visit) => {
      const roles = Array.isArray(visit?.visitorRoles)
        ? visit.visitorRoles
        : [];
      const type = normalizeType(visit?.visitorType);
      const isInternal =
        visit?.visitorFlag === "Visitor" ||
        roles.includes("Visitor") ||
        ["walkin", "scheduled"].includes(type);
      const isClient =
        visit?.visitorFlag === "Client" ||
        roles.includes("Client") ||
        ["meeting", "fulldaypass", "halfdaypass"].includes(type);

      return isInternalHistory ? isInternal : isClient;
    });
  }, [data?.visits, isInternalHistory]);

  const rows = useMemo(
    () =>
      historyVisits.map((visit, index) => ({
        ...visit,
        id: visit._id,
        srNo: index + 1,
        visitorType: visit.visitorType || "-",
        purposeOfVisit: visit.purposeOfVisit || "-",
        dateOfVisit: visit.dateOfVisit ? humanDate(visit.dateOfVisit) : "-",
        checkIn: visit.checkIn ? humanTime(visit.checkIn) : "-",
        checkOut: visit.checkOut ? humanTime(visit.checkOut) : "-",
        checkedInBy: getPersonName(visit.checkedInBy),
        checkedOutBy: getPersonName(visit.checkedOutBy),
        paymentStatus:
          visit.paymentStatus === true
            ? "Paid"
            : visit.paymentStatus === false
              ? "Unpaid"
              : "-",
        visitorName:
          [data?.visitor?.firstName, data?.visitor?.lastName]
            .filter(Boolean)
            .join(" ") || "N/A",
        email: data?.visitor?.email || "N/A",
        phoneNumber: data?.visitor?.phoneNumber || "N/A",
        visitorCompany: visit.visitorCompany || "N/A",
        departmentName: visit.department?.name || "N/A",
        toMeetName: getPersonName(visit.toMeet),
        clientToMeetName: visit.clientToMeet?.employeeName || "N/A",
        toMeetCompanyName: getCompanyName(visit.toMeetCompany),
        buildingName: visit.unit?.building?.buildingName || "N/A",
        unitName: visit.unit?.unitNo || visit.unit?.unitName || "N/A",
        taxableAmount: visit.amount || 0,
        discountAmount: visit.discount || 0,
        gstAmountExport: visit.gstAmount || 0,
        totalAmountExport: visit.totalAmount || 0,
        paymentVerificationExport: visit.paymentVerification || "N/A",
        paymentModeExport: visit.paymentMode || "N/A",
        paymentProofLink: visit.paymentProof?.url || "N/A",
        rawTotalAmount: visit.totalAmount || 0,
      })),
    [data?.visitor, historyVisits],
  );

  const visitorName = [data?.visitor?.firstName, data?.visitor?.lastName]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!visitorName || location.state?.breadcrumbLabel === visitorName) return;

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: { ...location.state, breadcrumbLabel: visitorName },
    });
  }, [
    location.pathname,
    location.search,
    location.state,
    navigate,
    visitorName,
  ]);

  const renderPaymentProof = (visit) => {
    const link = visit?.paymentProof?.url;
    if (!link) return "N/A";

    return (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="text-primary underline"
      >
        View File
      </a>
    );
  };

  return (
    <PageFrame>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-primary">Visitor History</h1>
        <PrimaryButton title="Back" handleSubmit={() => navigate(-1)} />
      </div>

      {isError ? (
        <p className="p-4 text-red-600">Unable to fetch visitor history.</p>
      ) : (
        <AgTable
          data={rows}
          columns={columns}
          search
          exportData
          processExportCell={(params) =>
            params.column?.getColDef?.().field === "dateOfVisit"
              ? params.value || ""
              : undefined
          }
          tableHeight={480}
        />
      )}
      {isPending && <p className="p-4 text-content">Loading history...</p>}

      <MuiModal
        open={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        title="Visit Details"
        widthClass="w-2/5"
      >
        <div className="grid grid-cols-1 gap-4">
          <DetalisFormatted title="Name" detail={visitorName || "N/A"} />
          <DetalisFormatted
            title="Email"
            detail={data?.visitor?.email || "N/A"}
          />
          <DetalisFormatted
            title="Phone Number"
            detail={data?.visitor?.phoneNumber || "N/A"}
          />
          <DetalisFormatted
            title="Visit Type"
            detail={selectedVisit?.visitorType}
          />
          <DetalisFormatted
            title="Purpose"
            detail={selectedVisit?.purposeOfVisit}
          />
          <DetalisFormatted
            title="Date of Visit"
            detail={selectedVisit?.dateOfVisit}
          />
          <DetalisFormatted title="Check In" detail={selectedVisit?.checkIn} />
          <DetalisFormatted
            title="Check Out"
            detail={selectedVisit?.checkOut}
          />
          <DetalisFormatted
            title="Checked In By"
            detail={selectedVisit?.checkedInBy}
          />
          <DetalisFormatted
            title="Checked Out By"
            detail={selectedVisit?.checkedOutBy}
          />
          <DetalisFormatted
            title="Visitor Company"
            detail={selectedVisit?.visitorCompany || "N/A"}
          />
          {isInternalHistory && (
            <>
              <DetalisFormatted
                title="Department"
                detail={selectedVisit?.department?.name || "N/A"}
              />
              <DetalisFormatted
                title="To Meet"
                detail={getPersonName(selectedVisit?.toMeet)}
              />
              <DetalisFormatted
                title="Client To Meet"
                detail={selectedVisit?.clientToMeet?.employeeName || "N/A"}
              />
              <DetalisFormatted
                title="Company To Meet"
                detail={getCompanyName(selectedVisit?.toMeetCompany)}
              />
            </>
          )}
          <DetalisFormatted
            title="Building"
            detail={selectedVisit?.unit?.building?.buildingName || "N/A"}
          />
          <DetalisFormatted
            title="Unit"
            detail={
              selectedVisit?.unit?.unitNo ||
              selectedVisit?.unit?.unitName ||
              "N/A"
            }
          />
          {!isInternalHistory && (
            <>
              <DetalisFormatted
                title="Taxable Amount"
                detail={`INR ${inrFormat(selectedVisit?.amount || 0)}`}
              />
          <DetalisFormatted
            title="Discount"
            detail={`INR ${inrFormat(selectedVisit?.discount || 0)}`}
          />
          <DetalisFormatted
            title="GST Amount"
            detail={`INR ${inrFormat(selectedVisit?.gstAmount || 0)}`}
          />
          <DetalisFormatted
            title="Total Amount"
            detail={`INR ${inrFormat(selectedVisit?.rawTotalAmount || 0)}`}
          />
          <DetalisFormatted
            title="Payment Status"
            detail={selectedVisit?.paymentStatus}
          />
          <DetalisFormatted
            title="Payment Verification"
            detail={selectedVisit?.paymentVerification || "N/A"}
          />
          <DetalisFormatted
            title="Payment Mode"
            detail={selectedVisit?.paymentMode || "N/A"}
          />
          <DetalisFormatted
            title="Uploaded File"
            detail={renderPaymentProof(selectedVisit)}
          />
            </>
          )}
        </div>
      </MuiModal>
    </PageFrame>
  );
};

export default VisitorHistory;
