import React from "react";
import { useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const ExternalClientLayout = () => {
    const { clientName } = useParams();

    const tabs = [
        { label: "Client Details", path: "client-details", permission: PERMISSIONS.SALES_EXTERNAL_COMPANY_CLIENT_DETAILS.value },
        { label: "Meetings", path: "meetings", permission: PERMISSIONS.SALES_EXTERNAL_COMPANY_MEETINGS.value },
        { label: "Revenue", path: "revenue", permission: PERMISSIONS.SALES_EXTERNAL_COMPANY_REVENUE.value },
        { label: "Members", path: "members", permission: PERMISSIONS.SALES_EXTERNAL_COMPANY_MEMBERS.value },
    ];

    const fullBasePath = `/app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies/${encodeURIComponent(clientName)}`;

    return <TabLayout basePath={fullBasePath} defaultTabPath="client-details" tabs={tabs} />;
};

export default ExternalClientLayout;