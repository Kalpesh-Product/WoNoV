import React from "react";
import WidgetSection from "../../../components/WidgetSection";
import DataCard from "../../../components/DataCard";
import useAuth from "../../../hooks/useAuth";
import { PERMISSIONS } from "../../../constants/permissions";

const ExternalClient = () => {
    const { auth } = useAuth();
    const userPermissions = auth?.user?.permissions?.permissions || [];

    const cards = [
        {
            id: 1,
            name: "Meetings",
            route: "/app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies",
            permission: PERMISSIONS.SALES_EXTERNAL_CLIENT_MEETINGS_COMPANIES.value,
        },
    ];

    const allowedCards = cards.filter(
        (card) => !card.permission || userPermissions.includes(card.permission)
    );

    return (
        <div className="p-4">
            <WidgetSection layout={1}>
                {allowedCards.map((item) => (
                    <DataCard key={item.id} title={item.name} route={item.route} />
                ))}
            </WidgetSection>
        </div>
    );
};

export default ExternalClient;