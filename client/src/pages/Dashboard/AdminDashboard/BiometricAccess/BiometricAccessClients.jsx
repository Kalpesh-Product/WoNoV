import { Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { setClientData } from "../../../../redux/slices/salesSlice";

const BiometricAccessClients = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const axios = useAxiosPrivate();
    const dispatch = useDispatch();

    const dashboardSegment = location.pathname.includes("/IT-dashboard/")
        ? "IT-dashboard"
        : "admin-dashboard";

    const { data: clientsData = [] } = useQuery({
        queryKey: ["biometricAccessClientsData"],
        queryFn: async () => {
            const response = await axios.get("/api/sales/co-working-clients");
            const data = response.data || [];
            dispatch(setClientData(data));
            return data;
        },
    });

    const handleClickRow = (clientData) => {
        dispatch(setSelectedClient(clientData));
        navigate(
            `/app/dashboard/${dashboardSegment}/mix-bag/biometric-access/${encodeURIComponent(
                clientData.clientName,
            )}`,
        );
    };

    const columns = [
        { field: "id", headerName: "ID" },
        {
            field: "clientName",
            headerName: "Client Name",
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
        { field: "localPocEmail", headerName: "Email", flex: 1 },
        { field: "memberCount", headerName: "Member Count" },
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
    ];

    const data = clientsData.map((item, index) => ({
        id: index + 1,
        _id: item._id,
        clientName: item.clientName,
        localPocEmail: item.localPoc?.email || item.localPocEmail || "-",
        members: item.members || [],
        memberCount: item.members?.length || 0,
        status: item.isActive,
        isActive: item.isActive,
        ...item,
    }));

    return (
        <div className="p-4">
            
                <div className="w-full ">
                    <PageFrame>
                    <AgTable
                        search
                        tableTitle="Biometric Access"
                        key={data.length}
                        data={data}
                        columns={columns}
                    />
                    </PageFrame>
                </div>
            
        </div>
    );
};

export default BiometricAccessClients;

{/* <div className="p-4">
      <div className="w-full">
        <PageFrame>
          <AgTable
            search={true}
            tableTitle={"CO-WORKING CLIENT DETAILS"}
            buttonTitle={"Add Client"}
            handleClick={() =>
              navigate(
                "/app/dashboard/sales-dashboard/mix-bag/clients/co-working/client-onboarding",
              )
            }
            data={tableData}
            columns={viewEmployeeColumns}
          />
        </PageFrame>
      </div>{" "}
</div> */}