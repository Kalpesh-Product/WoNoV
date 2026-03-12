import { useMemo } from "react";
import { Chip } from "@mui/material";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";

const OpenDeskRevenue = () => {
    const selectedClient = useSelector((state) => state?.client?.selectedClient);

    const normalizedPaymentStatus =
        typeof selectedClient?.paymentStatus === "string"
            ? selectedClient?.paymentStatus
            : selectedClient?.paymentStatus
                ? "Paid"
                : "Unpaid";

    const displayClientName =
        selectedClient?.clientName ||
        selectedClient?.visitorCompany ||
        selectedClient?.brandName ||
        selectedClient?.registeredClientCompany ||
        "Unknown";

    const columns = [
        { field: "srNo", headerName: "SR No", width: 100 },
        {
            field: "amount",
            headerName: "Amount",
            flex: 1,
            cellRenderer: (params) => inrFormat(params?.value || 0) || "₹0",
        },
        {
            field: "desk",
            headerName: "Desk",
            flex: 1,
            valueGetter: (params) => params?.data?.desk ?? 1,
        },
        {
            field: "paymentStatus",
            headerName: "Payment Status",
            flex: 1,
            cellRenderer: (params) => {
                const statusColorMap = {
                    Paid: { backgroundColor: "#90EE90", color: "#006400" },
                    Unpaid: { backgroundColor: "#D3D3D3", color: "#696969" },
                };

                const { backgroundColor, color } = statusColorMap[params?.value] || {
                    backgroundColor: "gray",
                    color: "white",
                };

                return (
                    <Chip
                        label={params?.value || "N/A"}
                        style={{ backgroundColor, color }}
                    />
                );
            },
        },
    ];

    const tableData = useMemo(() => {
        if (!selectedClient) return [];

        return [
            {
                ...selectedClient,
                srNo: 1,
                date: selectedClient?.updatedAt || selectedClient?.createdAt || null,
                amount:
                    Number(selectedClient?.totalAmount) ||
                    Number(selectedClient?.amount) ||
                    0,
                desk: 1,
                paymentStatus: normalizedPaymentStatus,
            },
        ];
    }, [selectedClient, normalizedPaymentStatus]);

    return (
        <div className="w-full">
            <PageFrame>
                <YearWiseTable
                    dateColumn="date"
                    tableTitle={`${displayClientName} Revenue Details`}
                    search={true}
                    searchColumn="paymentStatus"
                    data={tableData}
                    columns={columns}
                />
            </PageFrame>
        </div>
    );
};

export default OpenDeskRevenue;