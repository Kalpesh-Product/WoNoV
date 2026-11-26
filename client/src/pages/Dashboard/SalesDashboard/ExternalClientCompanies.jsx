import { useEffect, useState } from "react";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { setClientData } from "../../../redux/slices/salesSlice";
import { setSelectedClient } from "../../../redux/slices/clientSlice";
import { Chip } from "@mui/material";
import SalesDashboardPageSkeleton from "./SalesDashboardPageSkeleton";
import { fetchExternalMeetingClients } from "../../../utils/isMeetingVisit";

const ExternalClientCompanies = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const clientsData = useSelector((state) => state.sales.clientsData);
    const dispatch = useDispatch();
    const axios = useAxiosPrivate();
    const [loading, setLoading] = useState(true);
    const [filteredCompanies, setFilteredCompanies] = useState([]);

    const isDayPassView = location.pathname.includes("/clients/day-pass");
    const isOpenDeskView =
        location.pathname.includes("/open-desk/") || isDayPassView;
    const pageTitle = isDayPassView
        ? "Day Pass Client"
        : isOpenDeskView
            ? "EXTERNAL COMPANIES (OPEN DESK)"
            : "External Meeting";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Reuse external clients visitor source and filter by selected external-client tab.
                if (!isOpenDeskView) {
                    const combinedClients = await fetchExternalMeetingClients(axios);
                    dispatch(setClientData(combinedClients));
                    setFilteredCompanies(combinedClients);
                    return;
                }

                const visitorsResponse = await axios.get(
                    "/api/visitors/fetch-visitors",
                    { params: { searchContext: "external-open-desk-clients" } },
                );
                const visitors = Array.isArray(visitorsResponse.data)
                    ? visitorsResponse.data
                    : visitorsResponse.data?.data || [];

                const externalVisitorsForPurpose = visitors.filter((visitor) => {
                    const isExternalVisitor = visitor.visitorFlag === "Client";
                //     const purpose = (visitor.purposeOfVisit || "").trim().toLowerCase();

                //     if (isOpenDeskView) {
                //         return (
                //             isExternalVisitor &&
                //             (purpose === "half-day pass" || purpose === "full-day pass")
                //         );
                //     }

                //     return isExternalVisitor && purpose === "meeting room booking";
                // });
                    const purpose = (visitor?.purposeOfVisit || "").trim().toLowerCase();
                    const isDayPass =
                        purpose.includes("day pass") ||
                        purpose.includes("day-pass");
                    const isConvertedClient = Boolean(visitor?.convertedFromInternal);

                    if (isOpenDeskView) {
                        return isExternalVisitor && (isDayPass || isConvertedClient);
                    }

                    return (
                        isExternalVisitor &&
                        (visitor?.purposeOfVisit || "").trim().toLowerCase() === "meeting room booking"
                    );
                });
                const combinedClients = [
                    ...externalVisitorsForPurpose.map((visitor) => ({
                        ...visitor,
                        source: "Visitors",
                    })),
                ];

                dispatch(setClientData(combinedClients));
                setFilteredCompanies(combinedClients);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [axios, dispatch, isOpenDeskView]);

    const handleClickRow = (clientData) => {
        dispatch(setSelectedClient(clientData));
        if (isDayPassView) {
            navigate(
                `/app/dashboard/sales-dashboard/mix-bag/clients/day-pass/${encodeURIComponent(clientData.clientName)}/client-details`,
                { replace: true },
            );
            return;
        }

        if (isOpenDeskView) {
            navigate(
                `/app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies/${encodeURIComponent(clientData.clientName)}`,
                { replace: true },
            );
            return;
        }

        navigate(
            `/app/dashboard/sales-dashboard/mix-bag/clients/external-meeting/${encodeURIComponent(clientData.clientName)}/client-details`,
            { replace: true },
        );
    };

    const statusColorMap = {
        Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
        Active: { backgroundColor: "#90EE90", color: "#006400" },
        Unpaid: { backgroundColor: "#FECACA", color: "#B91C1C" },
        Paid: { backgroundColor: "#90EE90", color: "#006400" },
        Upcoming: { backgroundColor: "#E3F2FD", color: "#1565C0" },
        Completed: { backgroundColor: "#E8F5E9", color: "#1B5E20" },
    };

    const renderStatusChip = (label) => {
        const { backgroundColor, color } = statusColorMap[label] || {
            backgroundColor: "#F1F5F9",
            color: "#475569",
        };
        return <Chip label={label} style={{ backgroundColor, color }} />;
    };

    const columns = [
        { field: "id", headerName: "Sr No" },
        { field: "sourceModule", headerName: "Source", flex: 1 },
        {
            field: "name",
            headerName: "Visitor Name",
            flex: 1,
            cellRenderer: (params) => (
                <span
                    style={
                        {
                            color: "#1E3D73",
                            textDecoration: "underline",
                            cursor: "pointer",
                        }
                    }
                    onClick={() => handleClickRow(params.data)}
                >
                    {params.value}
                </span>
            ),
        },
        { field: "visitorCompany", headerName: "Company", flex: 1 },
        { field: "purposeOfVisit", headerName: "Purpose", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            pinned: "right",
            width: 130,
            cellRenderer: (params) => renderStatusChip(params.value),
        },
        {
            field: "paidStatus",
            headerName: "Paid Status",
            pinned: "right",
            width: 150,
            cellRenderer: (params) => renderStatusChip(params.value),
        },
    ];

    const tableData = filteredCompanies.map((item, index) => ({
        ...item,
        id: index + 1,
        sourceModule: item.source === "Meetings"
            ? "Meeting Module"
            : "Visitor Module",
        clientName: item.visitorCompany || item.brandName || item.registeredClientCompany || item.email,
        name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "N/A",
        visitorCompany: item.visitorCompany || item.brandName || item.registeredClientCompany || "N/A",
        status: item.source === "Meetings"
            ? item.meetingStatus
            : item.isActive ? "Active" : "Inactive",
        paidStatus:
            item.paymentStatus === true ||
            String(item.paymentStatus || "").toLowerCase() === "paid"
                ? "Paid"
                : "Unpaid",
        purposeOfVisit: item.purposeOfVisit || "N/A",
    }));

    const paidClientCount = tableData.filter(
        (client) => client.paidStatus === "Paid",
    ).length;
    const unpaidClientCount = Math.max(0, tableData.length - paidClientCount);

    return (
        <div className="p-4">
            <div className="w-full">
                <PageFrame>
                    {loading ? (
                        <SalesDashboardPageSkeleton tableTitle={pageTitle} columns={columns} />
                    ) : (
                        <AgTable
                            search={true}
                            tableTitle={pageTitle}
                            titleRightContent={!isOpenDeskView ? (
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <span className="inline-flex h-9 items-center rounded-lg border border-[#AFC5FF] bg-[#DBE4FF] px-3 text-sm font-semibold uppercase text-[#1E3D73]">
                                        Total: {tableData.length}
                                    </span>
                                    <span className="inline-flex h-9 items-center rounded-lg border border-[#A9DDBA] bg-[#D8F0DF] px-3 text-sm font-semibold uppercase text-[#16784D]">
                                        Paid: {paidClientCount}
                                    </span>
                                    <span className="inline-flex h-9 items-center rounded-lg border border-[#F3B7A8] bg-[#FCE8E3] px-3 text-sm font-semibold uppercase text-[#D96B4F]">
                                        Unpaid: {unpaidClientCount}
                                    </span>
                                </div>
                            ) : undefined}
                            data={tableData}
                            columns={columns}
                            exportData
                        />
                    )}
                </PageFrame>
            </div>
        </div>
    );
};

export default ExternalClientCompanies;
