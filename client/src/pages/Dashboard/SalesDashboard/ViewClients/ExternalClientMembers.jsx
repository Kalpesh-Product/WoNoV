import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const getVisitorCompanyName = (visitor = {}) =>
    visitor.visitorCompany || visitor.brandName || visitor.registeredClientCompany || "";

const getVisitorFullName = (visitor = {}) =>
    `${visitor.firstName || ""} ${visitor.lastName || ""}`.trim() || "N/A";

const ExternalClientMembers = () => {
    const axios = useAxiosPrivate();
    const { clientName } = useParams();

    const decodedClientName = useMemo(
        () => decodeURIComponent(clientName || ""),
        [clientName]
    );

    const normalizedCurrentCompany = useMemo(
        () => decodedClientName.trim().toLowerCase(),
        [decodedClientName]
    );

    const { data: coWorkingClients = [], isLoading: isCoWorkingClientsLoading } = useQuery({
        queryKey: ["co-working-clients"],
        queryFn: async () => {
            const response = await axios.get("/api/sales/co-working-clients");
            return response.data || [];
        },
    });

    const { data: visitors = [], isLoading: isVisitorsLoading } = useQuery({
        queryKey: ["external-company-members", normalizedCurrentCompany],
        enabled: !!normalizedCurrentCompany,
        queryFn: async () => {
            const response = await axios.get("/api/visitors/fetch-visitors?query=all");
            return response.data || [];
        },
    });

    const matchedCoWorkingClient = useMemo(
        () =>
            coWorkingClients.find(
                (company) =>
                    (company?.clientName || "").trim().toLowerCase() === normalizedCurrentCompany
            ),
        [coWorkingClients, normalizedCurrentCompany]
    );

    const externalMembers = useMemo(() => {
        const rows = [];

        // 1. Add official co-working members (if any)
        if (matchedCoWorkingClient?.members?.length > 0) {
            matchedCoWorkingClient.members.forEach((member, index) => {
                rows.push({
                    id: `cowork-${index + 1}`,
                    memberName: member.employeeName || member.name || "N/A",
                    companyName: matchedCoWorkingClient.clientName || decodedClientName || "N/A",
                    email: member.email || "N/A",
                    mobileNo: member.mobileNo || member.phone || "N/A",
                    purposeOfVisit: "Co-working Member",
                    type: "member", // helps for styling / filtering later
                });
            });
        }

        // 2. Add visitors from the same company
        const relatedVisitors = visitors.filter((visitor) => {
            const possibleCompanyNames = [
                visitor.visitorCompany,
                visitor.brandName,
                visitor.registeredClientCompany,
            ]
                .map((name) => (name || "").trim().toLowerCase())
                .filter(Boolean);

            return possibleCompanyNames.includes(normalizedCurrentCompany);
        });

        relatedVisitors.forEach((visitor, index) => {
            rows.push({
                id: `visitor-${index + 1}`,
                memberName: getVisitorFullName(visitor),
                companyName: getVisitorCompanyName(visitor) || decodedClientName || "N/A",
                email: visitor.email || "N/A",
                mobileNo: visitor.phoneNumber || visitor.mobile || "N/A",
                purposeOfVisit: visitor.purposeOfVisit || "Visitor",
                type: "visitor",
            });
        });

        // Assign final stable numeric IDs for AgGrid
        return rows.map((row, finalIndex) => ({
            ...row,
            id: finalIndex + 1,
        }));
    }, [
        matchedCoWorkingClient,
        visitors,
        normalizedCurrentCompany,
        decodedClientName,
    ]);

    const columns = [
        { field: "id", headerName: "SR No", width: 90 },
        {
            field: "memberName",
            headerName: "Member / Visitor Name",
            flex: 1.4,
        },
        { field: "companyName", headerName: "Company Name", flex: 1.2 },
        { field: "email", headerName: "Email", flex: 1.3 },
        { field: "mobileNo", headerName: "Mobile No.", width: 140 },
        {
            field: "purposeOfVisit",
            headerName: "Purpose / Type",
            flex: 1,
            cellRenderer: (params) => {
                if (params.data?.type === "member") {
                    return <span style={{ color: "#2e7d32", fontWeight: 500 }}>Co-working Member</span>;
                }
                if (params.data?.type === "visitor") {
                    return <span style={{ color: "#1976d2" }}>{params.value || "Visitor"}</span>;
                }
                return params.value || "—";
            },
        },
    ];

    return (
        <div className="w-full">
            <PageFrame>
                <AgTable
                    key={decodedClientName}
                    loading={isVisitorsLoading || isCoWorkingClientsLoading}
                    search={true}
                    searchColumn="memberName"
                    tableTitle={`${decodedClientName || "External Company"} Members & Visitors`}
                    data={externalMembers}
                    columns={columns}
                />
            </PageFrame>
        </div>
    );
};

export default ExternalClientMembers;