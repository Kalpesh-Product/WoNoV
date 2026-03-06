import { useEffect } from "react";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { setClientData } from "../../../redux/slices/salesSlice";
import { setSelectedClient } from "../../../redux/slices/clientSlice";
import { Chip } from "@mui/material";

const ExternalClientCompanies = () => {
    const navigate = useNavigate();
    const clientsData = useSelector((state) => state.sales.clientsData);
    const dispatch = useDispatch();
    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get("/api/sales/co-working-clients");
                dispatch(setClientData(response.data));
            } catch (error) {
                console.error("Failed to fetch external companies", error);
            }
        };

        fetchClients();
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

    const tableData = clientsData.map((item, index) => ({
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
                    <AgTable
                        search={true}
                        tableTitle={"EXTERNAL COMPANIES"}
                        data={tableData}
                        columns={columns}
                    />
                </PageFrame>
            </div>
        </div>
    );
};

export default ExternalClientCompanies;