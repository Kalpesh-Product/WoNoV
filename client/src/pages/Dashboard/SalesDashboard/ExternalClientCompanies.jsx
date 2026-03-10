import { useEffect, useState } from "react";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { setClientData } from "../../../redux/slices/salesSlice";
import { setSelectedClient } from "../../../redux/slices/clientSlice";
import { Chip, CircularProgress } from "@mui/material";

const ExternalClientCompanies = () => {
    const navigate = useNavigate();
    const clientsData = useSelector((state) => state.sales.clientsData);
    const dispatch = useDispatch();
    const axios = useAxiosPrivate();
    const [loading, setLoading] = useState(true);
    const [filteredCompanies, setFilteredCompanies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Reuse external clients visitor source and show only meeting-room visitors.
                const visitorsResponse = await axios.get("/api/visitors/fetch-visitors");
                const visitors = visitorsResponse.data;

                const externalVisitorsForMeetingBooking = visitors.filter((visitor) => {
                    const isExternalVisitor = visitor.visitorFlag === "Client";
                    const isMeetingRoomBooking =
                        (visitor.purposeOfVisit || "").trim().toLowerCase() ===
                        "meeting room booking";
                    return isExternalVisitor && isMeetingRoomBooking;
                });

                dispatch(setClientData(externalVisitorsForMeetingBooking));
                setFilteredCompanies(externalVisitorsForMeetingBooking);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [axios, dispatch]);

    const handleClickRow = (clientData) => {
        dispatch(setSelectedClient(clientData));
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
                    style={{
                        color: "#1E3D73",
                        textDecoration: "underline",
                        cursor: "pointer",
                    }}
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
                            tableTitle={"EXTERNAL COMPANIES"}
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
