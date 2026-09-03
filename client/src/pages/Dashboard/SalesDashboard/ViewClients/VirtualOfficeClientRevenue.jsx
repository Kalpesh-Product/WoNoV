import { Chip } from "@mui/material";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { inrFormat } from "../../../../utils/currencyFormat";

const getUserDisplayName = (user) => {
    if (!user) return "";
    if (typeof user === "string") return user;
    return (
        user.employeeName ||
        [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") ||
        user.name ||
        ""
    ).trim();
};

const VirtualOfficeClientRevenue = () => {
    const axios = useAxiosPrivate();
    const selectedClient = useSelector((state) => state?.client?.selectedClient);
    const [viewRow, setViewRow] = useState(null);

    const { data: revenueRows = [], isLoading } = useQuery({
        queryKey: ["virtualOfficeClientRevenue", selectedClient?._id, selectedClient?.clientName],
        enabled: Boolean(selectedClient?._id || selectedClient?.clientName),
        queryFn: async () => {
            const response = await axios.get("/api/sales/get-virtual-office-revenue", {
                params: { useClientDetails: true },
            });
            const allRevenues = Array.isArray(response?.data) ? response.data : [];
            const selectedName = (selectedClient?.clientName || "").trim().toLowerCase();

            return allRevenues.filter((item) => {
                const revenueClientName = (item?.client?.clientName || "").trim().toLowerCase();
                if (selectedClient?._id && item?.client?._id === selectedClient._id) {
                    return true;
                }
                return revenueClientName === selectedName;
            });
        },
    });

    const tableData = useMemo(
        () =>
            revenueRows.map((item, index) => ({
                ...item,
                srNo: index + 1,
                clientName: item?.client?.clientName || selectedClient?.clientName || "N/A",
                invoiceLink: item?.invoice?.link || item?.invoiceLink || "",
                invoiceUploadedAt: item?.invoice?.date || item?.invoiceUploadedAt || null,
                invoiceUploadedByName:
                    item?.invoiceUploadedByName ||
                    getUserDisplayName(item?.invoiceUploadedBy) ||
                    "",
                noOfDesks:
                    Number(item?.noOfDesks) ||
                    Number(item?.client?.totalDesks) ||
                    Number(item?.client?.cabinDesks || 0) +
                        Number(item?.client?.openDesks || 0) ||
                    0,
                deskRate:
                    Number(item?.deskRate) ||
                    Number(item?.client?.openDeskRate) ||
                    Number(item?.client?.cabinDeskRate) ||
                    0,
                revenue:
                    Number(item?.revenue) ||
                    (Number(item?.noOfDesks) ||
                        Number(item?.client?.totalDesks) ||
                        Number(item?.client?.cabinDesks || 0) +
                            Number(item?.client?.openDesks || 0) ||
                        0) *
                        (Number(item?.deskRate) ||
                            Number(item?.client?.openDeskRate) ||
                            Number(item?.client?.cabinDeskRate) ||
                            0),
            })),
        [revenueRows, selectedClient?.clientName],
    );

    return (
        <div className="w-full">
            <PageFrame>
                <YearWiseTable
                    loading={isLoading}
                    search
                    searchColumn="clientName"
                    dateColumn="rentDate"
                    tableTitle={`${selectedClient?.clientName || "Client"} Revenue Details`}
                    data={tableData}
                    columns={[
                        { field: "srNo", headerName: "SR No", width: 90 },
                        {
                            field: "clientName",
                            headerName: "Client Name",
                            flex: 1,
                            cellRenderer: (params) => (
                                <button
                                    type="button"
                                    onClick={() => setViewRow(params.data)}
                                    className="text-primary underline text-left"
                                >
                                    {params?.value || "N/A"}
                                </button>
                            ),
                        },
                        {
                            field: "revenue",
                            headerName: "Revenue (INR)",
                            flex: 1,
                            cellRenderer: (params) => inrFormat(params?.value || 0),
                        },
                        {
                            field: "noOfDesks",
                            headerName: "No. of Desks",
                            flex: 1,
                        },
                        {
                            field: "deskRate",
                            headerName: "Open Desk Rate",
                            flex: 1,
                            cellRenderer: (params) => inrFormat(params?.value || 0),
                        },
                        {
                            field: "receivedAmount",
                            headerName: "Received Amount",
                            flex: 1,
                            cellRenderer: (params) => inrFormat(params?.value || 0),
                        },
                        {
                            field: "remainingAmount",
                            headerName: "Remaining Amount",
                            flex: 1,
                            valueGetter: ({ data }) =>
                                Number(data?.revenue || 0) - Number(data?.receivedAmount || 0),
                            cellRenderer: (params) => inrFormat(params?.value || 0),
                        },
                        { field: "totalTerm", headerName: "Total Term", flex: 1 },
                        {
                            field: "rentStatus",
                            headerName: "Rent Status",
                            flex: 1,
                            cellRenderer: (params) => {
                                const isPaid = String(params?.value || "").toLowerCase() === "paid";
                                return (
                                    <Chip
                                        label={params?.value || "N/A"}
                                        sx={{
                                            backgroundColor: isPaid ? "#90EE90" : "#FFECC5",
                                            color: isPaid ? "#006400" : "#CC8400",
                                        }}
                                    />
                                );
                            },
                        },
                    ]}
                />
            </PageFrame>

            {viewRow && (
                <MuiModal
                    open
                    title="View Invoice Details"
                    onClose={() => setViewRow(null)}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <div className="text-subtitle font-pmedium mb-4">Client Info</div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <DetalisFormatted
                                    title="Client Name"
                                    detail={viewRow.clientName || "-"}
                                />
                                <DetalisFormatted
                                    title="Client Invoice Name"
                                    detail={viewRow.clientInvoiceName || viewRow.clientName || "-"}
                                />
                                <DetalisFormatted
                                    title="Channel"
                                    detail={viewRow.channel || viewRow.client?.bookingType || "-"}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="text-subtitle font-pmedium mb-4">Financials</div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <DetalisFormatted
                                    title="No. of Desks"
                                    detail={viewRow.noOfDesks ?? viewRow.client?.totalDesks ?? "-"}
                                />
                                <DetalisFormatted
                                    title="Open Desk Rate(Current)"
                                    detail={`INR ${inrFormat(Number(viewRow.deskRate || 0))}`}
                                />
                                <DetalisFormatted
                                    title="Revenue"
                                    detail={`INR ${inrFormat(Number(viewRow.revenue || 0))}`}
                                />
                                <DetalisFormatted
                                    title="Received Amount"
                                    detail={`INR ${inrFormat(Number(viewRow.receivedAmount || 0))}`}
                                />
                                <DetalisFormatted
                                    title="Remaining Amount"
                                    detail={`INR ${inrFormat(
                                        Number(viewRow.revenue || 0) -
                                            Number(viewRow.receivedAmount || 0),
                                    )}`}
                                />
                                <DetalisFormatted
                                    title="Annual Increment (%)"
                                    detail={
                                        viewRow.annualIncrement !== undefined &&
                                        viewRow.annualIncrement !== null &&
                                        viewRow.annualIncrement !== ""
                                            ? `${viewRow.annualIncrement}%`
                                            : "-"
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <div className="text-subtitle font-pmedium mb-4">Rental Terms</div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <DetalisFormatted
                                    title="Rent Date"
                                    detail={
                                        viewRow.rentDate
                                            ? dayjs(viewRow.rentDate).format("DD-MM-YYYY")
                                            : "-"
                                    }
                                />
                                <DetalisFormatted
                                    title="Paid/Rent Status"
                                    detail={viewRow.rentStatus || "-"}
                                />
                                <DetalisFormatted
                                    title="Total Term"
                                    detail={viewRow.totalTerm ?? "-"}
                                />
                                <DetalisFormatted
                                    title="Next Increment Date"
                                    detail={
                                        viewRow.nextIncrementDate
                                            ? dayjs(viewRow.nextIncrementDate).format("DD-MM-YYYY")
                                            : "-"
                                    }
                                />
                                <DetalisFormatted
                                    title="Past Due Date"
                                    detail={
                                        viewRow.pastDueDate
                                            ? dayjs(viewRow.pastDueDate).format("DD-MM-YYYY")
                                            : "-"
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <div className="text-subtitle font-pmedium mb-4">
                                Finance Invoice Details
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <DetalisFormatted
                                    title="Invoice Link"
                                    detail={
                                        viewRow.invoice?.link ? (
                                            <a
                                                href={viewRow.invoice.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary underline"
                                            >
                                                View PDF
                                            </a>
                                        ) : (
                                            "-"
                                        )
                                    }
                                />
                                <DetalisFormatted
                                    title="Invoice Uploaded Date"
                                    detail={
                                        viewRow.invoiceUploadedAt
                                            ? dayjs(viewRow.invoiceUploadedAt).format("DD-MM-YYYY")
                                            : "-"
                                    }
                                />
                                <DetalisFormatted
                                    title="Invoice Uploaded by"
                                    detail={
                                        viewRow.invoiceUploadedByName ||
                                        getUserDisplayName(viewRow.invoiceUploadedBy) ||
                                        "-"
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </MuiModal>
            )}
        </div>
    );
};

export default VirtualOfficeClientRevenue;
