import React from "react";
import WidgetSection from "../../../components/WidgetSection";
import DataCard from "../../../components/DataCard";

const ExternalClient = () => {
    const cards = [
        {
            id: 1,
            name: "Meetings",
            route: "/app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies",
        },
    ];

    return (
        <div className="p-4">
            <WidgetSection layout={1}>
                {cards.map((item) => (
                    <DataCard key={item.id} title={item.name} route={item.route} />
                ))}
            </WidgetSection>
        </div>
    );
};

export default ExternalClient;