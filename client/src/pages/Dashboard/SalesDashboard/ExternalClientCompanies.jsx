import { useEffect, useState } from "react";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { setClientData } from "../../../redux/slices/salesSlice";
import { setSelectedClient } from "../../../redux/slices/clientSlice";
import { Chip, CircularProgress } from "@mui/material";

const ExternalClientCompanies = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const clientsData = useSelector((state) => state.sales.clientsData);
    const dispatch = useDispatch();
    const axios = useAxiosPrivate();
    const [loading, setLoading] = useState(true);
    const [filteredCompanies, setFilteredCompanies] = useState([]);

    const isOpenDeskView = location.pathname.includes("/open-desk/");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Reuse external clients visitor source and filter by selected external-client tab.
                const visitorsResponse = await axios.get("/api/visitors/fetch-visitors");
                const visitors = visitorsResponse.data;

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
                        purpose === "half-day pass" ||
                        purpose === "full-day pass" ||
                        purpose === "half day pass" ||
                        purpose === "full day pass";
                    const isConvertedClient = Boolean(visitor?.convertedFromInternal);

                    if (isOpenDeskView) {
                        return isExternalVisitor && (isDayPass || isConvertedClient);
                    }

                    return (
                        isExternalVisitor &&
                        (visitor?.purposeOfVisit || "").trim().toLowerCase() === "meeting room booking"
                    );
                });
                dispatch(setClientData(externalVisitorsForPurpose));
                setFilteredCompanies(externalVisitorsForPurpose);
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
        if (isOpenDeskView) {
            navigate(
                `/app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies/${encodeURIComponent(clientData.clientName)}`,
                { replace: true },
            );
            return;
        }

        navigate(
            `/app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies/${encodeURIComponent(clientData.clientName)}`,
            { replace: true },
        );
    };

    const columns = [
        { field: "id", headerName: "Sr No" },
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
        {
            field: "status",
            headerName: "Status",
            sort: "desc",
            cellRenderer: (params) => {
                const status = params.value ? "Active" : "Inactive";
                const statusColorMap = {
                    Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
                    Active: { backgroundColor: "#90EE90", color: "#006400" },
                };

                const { backgroundColor, color } = statusColorMap[status];

                return <Chip label={status} style={{ backgroundColor, color }} />;
            },
        },
        { field: "purposeOfVisit", headerName: "Purpose", flex: 1 },
    ];

    const tableData = filteredCompanies.map((item, index) => ({
        ...item,
        id: index + 1,
        clientName: item.visitorCompany || item.brandName || item.registeredClientCompany || item.email,
        name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "N/A",
        visitorCompany: item.visitorCompany || item.brandName || item.registeredClientCompany || "N/A",
        status: item.isActive,
        purposeOfVisit: item.purposeOfVisit || "N/A",
    }));

    return (
        <div className="p-4">
            <div className="w-full">
                <PageFrame>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <CircularProgress />
                        </div>
                    ) : (
                        <AgTable
                            search={true}
                            tableTitle={
                                isOpenDeskView
                                    ? "EXTERNAL COMPANIES (OPEN DESK)"
                                    : "EXTERNAL COMPANIES"
                            }
                            data={tableData}
                            columns={columns}
                        />
                    )}
                </PageFrame>
            </div>
        </div>
    );
};

export default ExternalClientCompanies;