import { useMemo } from "react";
import { Chip } from "@mui/material";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";

const ExternalClientRevenue = () => {
    const selectedClient = useSelector((state) => state?.client?.selectedClient);
    const axios = useAxiosPrivate();

    const selectedCompanyName = useMemo(
        () => (selectedClient?.clientName || "").trim().toLowerCase(),
        [selectedClient?.clientName],
    );

    const { data: revenueDetails = [], isPending: isRevenuePending } = useQuery({
        queryKey: ["externalClientRevenue", selectedClient?._id],
        enabled: !!selectedClient?._id,
        queryFn: async () => {
            try {
                const response = await axios.get("/api/meetings/get-meetings");
                const meetings = Array.isArray(response?.data) ? response.data : [];

                return meetings.filter((meeting) => {
                    if (meeting?.meetingType !== "External") return false;

                    const extClient = meeting?.externalClient;
                    const possibleNames = [
                        extClient?.visitorCompany,
                        extClient?.brandName,
                        extClient?.registeredClientCompany,
                        extClient?.email,
                        typeof extClient === "string" ? extClient : "",
                    ].map((name) => (name || "").trim().toLowerCase());

                    return possibleNames.includes(selectedCompanyName);
                });
            } catch (error) {
                console.error("Error fetching external client revenue data:", error.message);
                return [];
            }
        },
    });

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

    const tableData = isRevenuePending
        ? []
        : revenueDetails.map((item, index) => ({
            ...item,
            srNo: index + 1,
            date: item?.date,
            amount: item?.paymentAmount ?? 0,
            desk: 1,
            paymentStatus:
                typeof item?.paymentStatus === "string"
                    ? item.paymentStatus
                    : item?.paymentStatus === true
                        ? "Paid"
                        : "Unpaid",
        }));

    return (
        <div className="w-full">
            <PageFrame>
                <YearWiseTable
                    dateColumn="date"
                    tableTitle={`${selectedClient?.clientName || "Unknown"} Revenue Details`}
                    search={true}
                    searchColumn="paymentStatus"
                    data={tableData}
                    columns={columns}
                />
            </PageFrame>
        </div>
    );
};

export default ExternalClientRevenue;