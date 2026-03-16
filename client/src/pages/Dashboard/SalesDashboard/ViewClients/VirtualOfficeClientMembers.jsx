import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const VirtualOfficeClientMembers = () => {
    const axios = useAxiosPrivate();
    const selectedClient = useSelector((state) => state?.client?.selectedClient);

    const { data: consolidatedClients, isLoading } = useQuery({
        queryKey: ["virtualOfficeClientMembers", selectedClient?._id, selectedClient?.clientName],
        enabled: Boolean(selectedClient?._id || selectedClient?.clientName),
        queryFn: async () => {
            const response = await axios.get("/api/sales/consolidated-clients");
            return response?.data || {};
        },
    });

    const normalizedClientName = (selectedClient?.clientName || "").trim().toLowerCase();

    const memberData = useMemo(() => {
        const meetingClients = consolidatedClients?.meetingClients || [];

        return meetingClients
            .filter((visitor) => {
                const possibleClientNames = [
                    visitor?.visitorCompany,
                    visitor?.brandName,
                    visitor?.registeredClientCompany,
                    visitor?.clientName,
                ]
                    .map((value) => (value || "").trim().toLowerCase())
                    .filter(Boolean);

                return possibleClientNames.includes(normalizedClientName);
            })
            .map((item, index) => ({
                srNo: index + 1,
                memberName: `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "N/A",
                email: item?.email || "N/A",
                phone: item?.phoneNumber || item?.mobile || "N/A",
                purpose: item?.purposeOfVisit || "N/A",
                company:
                    item?.visitorCompany ||
                    item?.brandName ||
                    item?.registeredClientCompany ||
                    selectedClient?.clientName ||
                    "N/A",
            }));
    }, [consolidatedClients?.meetingClients, normalizedClientName, selectedClient?.clientName]);

    return (
        <div className="w-full">
            <PageFrame>
                <AgTable
                    loading={isLoading}
                    search
                    searchColumn="memberName"
                    tableTitle={`${selectedClient?.clientName || "Client"} Members`}
                    data={memberData}
                    columns={[
                        { field: "srNo", headerName: "SR No", width: 90 },
                        { field: "memberName", headerName: "Member Name", flex: 1 },
                        { field: "company", headerName: "Company", flex: 1 },
                        { field: "email", headerName: "Email", flex: 1 },
                        { field: "phone", headerName: "Phone", flex: 1 },
                        { field: "purpose", headerName: "Purpose", flex: 1 },
                    ]}
                />
            </PageFrame>
        </div>
    );
};

export default VirtualOfficeClientMembers;