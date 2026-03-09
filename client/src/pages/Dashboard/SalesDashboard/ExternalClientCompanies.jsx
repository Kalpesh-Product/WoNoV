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
                // Fetch clients
                const clientsResponse = await axios.get("/api/sales/co-working-clients");
                const clients = clientsResponse.data;
                dispatch(setClientData(clients));

                // Fetch meetings to filter clients
                const meetingsResponse = await axios.get("/api/meetings/get-meetings");
                const allMeetings = meetingsResponse.data;

                // Identify clients with at least one external meeting
                const clientsWithExternalMeetings = clients.filter(client => {
                    const normalizedName = client.clientName?.trim().toLowerCase();
                    return allMeetings.some(meeting => {
                        if (meeting.meetingType !== "External") return false;

                        const extName = (meeting.externalClient || "").trim().toLowerCase();
                        const intName = (meeting.client || "").trim().toLowerCase();

                        return extName === normalizedName || intName === normalizedName;
                    });
                });

                setFilteredCompanies(clientsWithExternalMeetings);
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
            field: "clientName",
            headerName: "Company Name",
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
        { field: "desks", headerName: "Desks" },
    ];

    const tableData = filteredCompanies.map((item, index) => ({
        ...item,
        id: index + 1,
        clientName: item.clientName,
        status: item.isActive,
        desks: Number(item.openDesks || 0) + Number(item.cabinDesks || 0),
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
