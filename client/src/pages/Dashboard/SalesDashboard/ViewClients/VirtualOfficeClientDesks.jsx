import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const VirtualOfficeClientDesks = () => {
    const axios = useAxiosPrivate();
    const selectedClient = useSelector((state) => state?.client?.selectedClient);

    const { data: consolidatedClients, isLoading } = useQuery({
        queryKey: ["virtualOfficeClientDesks", selectedClient?._id],
        enabled: Boolean(selectedClient?._id || selectedClient?.clientName),
        queryFn: async () => {
            const response = await axios.get("/api/sales/consolidated-clients");
            return response?.data || {};
        },
    });

    const matchedClient = useMemo(() => {
        const clients = consolidatedClients?.virtualOfficeClients || [];
        return clients.find((client) => {
            if (selectedClient?._id && client?._id === selectedClient._id) return true;
            return (
                (client?.clientName || "").trim().toLowerCase() ===
                (selectedClient?.clientName || "").trim().toLowerCase()
            );
        });
    }, [consolidatedClients?.virtualOfficeClients, selectedClient?._id, selectedClient?.clientName]);

    const tableData = [
        {
            srNo: 1,
            openDesks: Number(matchedClient?.openDesks || selectedClient?.openDesks || 0),
            cabinDesks: Number(matchedClient?.cabinDesks || selectedClient?.cabinDesks || 0),
            totalDesks: Number(
                matchedClient?.totalDesks ||
                selectedClient?.totalDesks ||
                Number(matchedClient?.openDesks || 0) + Number(matchedClient?.cabinDesks || 0),
            ),
            location: matchedClient?.location || "N/A",
            channel: matchedClient?.channel || "N/A",
        },
    ];

    return (
        <div className="w-full">
            <PageFrame>
                <AgTable
                    loading={isLoading}
                    search={false}
                    tableTitle={`${selectedClient?.clientName || "Client"} Desk Details`}
                    data={tableData}
                    columns={[
                        { field: "srNo", headerName: "SR No", width: 90 },
                        { field: "openDesks", headerName: "Open Desks", flex: 1 },
                        { field: "cabinDesks", headerName: "Cabin Desks", flex: 1 },
                        { field: "totalDesks", headerName: "Total Desks", flex: 1 },
                        // { field: "location", headerName: "Location", flex: 1 },
                        // { field: "channel", headerName: "Channel", flex: 1 },
                    ]}
                />
            </PageFrame>
        </div>
    );
};

export default VirtualOfficeClientDesks;