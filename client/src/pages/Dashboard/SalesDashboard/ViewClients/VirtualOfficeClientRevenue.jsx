import { Chip } from "@mui/material";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import { inrFormat } from "../../../../utils/currencyFormat";

const VirtualOfficeClientRevenue = () => {
    const axios = useAxiosPrivate();
    const selectedClient = useSelector((state) => state?.client?.selectedClient);

    const { data: revenueRows = [], isLoading } = useQuery({
        queryKey: ["virtualOfficeClientRevenue", selectedClient?._id, selectedClient?.clientName],
        enabled: Boolean(selectedClient?._id || selectedClient?.clientName),
        queryFn: async () => {
            const response = await axios.get("/api/sales/get-virtual-office-revenue");
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
                        { field: "clientName", headerName: "Client Name", flex: 1 },
                        {
                            field: "revenue",
                            headerName: "Revenue (INR)",
                            flex: 1,
                            cellRenderer: (params) => inrFormat(params?.value || 0),
                        },
                        { field: "totalTerm", headerName: "Total Term", flex: 1 },
                        { field: "dueTerm", headerName: "Due Term", flex: 1 },
                        {
                            field: "rentStatus",
                            headerName: "Status",
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
        </div>
    );
};

export default VirtualOfficeClientRevenue;