import React, { useMemo } from "react";
import WidgetSection from "../../../components/WidgetSection";
import DataCard from "../../../components/DataCard";
import useAuth from "../../../hooks/useAuth";
import { PERMISSIONS } from "../../../constants/permissions";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import UniqueClients from "./ViewClients/LeadsLayout";
import { CircularProgress } from "@mui/material";

const ExternalClient = () => {
    const { auth } = useAuth();
    const userPermissions = auth?.user?.permissions?.permissions || [];
    const axios = useAxiosPrivate();

    const { data = [], isLoading } = useQuery({
        queryKey: ["clientDetails"],
        queryFn: async () => {
            try {
                const response = await axios.get("/api/sales/consolidated-clients");
                return response.data;
            } catch (error) {
                console.error(error.response?.data?.message || "Failed to fetch consolidated clients");
            }
        },
    });

    const unifiedClients = useMemo(() => {
        if (!data || typeof data !== "object") return [];

        return Object.entries(data).flatMap(([key, clients]) => {
            const clientType = key.replace(/Clients$/, ""); // e.g., "coworkingClients" → "coworking"
            return clients.map((client) => ({
                ...client,
                clientType, // dynamically tagged
            }));
        });
    }, [data]);

    const transformClientsGroupedByMonth = (clientsArray) => {
        const grouped = {};

        // helper to title-case each word
        const toTitleCase = (str) =>
            str
                .toLowerCase()
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join("-");

        const serviceMapping = {
            coworking: "Coworking",
            virtualOffice: "Virtualoffice",
            meeting: "Meeting",
            workation: "Workations",
            coliving: "Co-Living",
        };

        clientsArray.forEach((client) => {
            let rawServiceName = client.clientType || "Unknown";

            // Dynamically detect type from serviceName if it's under coworkingClients
            if (rawServiceName === "coworking" && client.service?.serviceName) {
                const sName = client.service.serviceName.toLowerCase();
                if (sName.includes("workation")) {
                    rawServiceName = "workation";
                } else if (sName.includes("living") || sName.includes("coliving")) {
                    rawServiceName = "coliving";
                }
            }

            const formattedServiceName =
                serviceMapping[rawServiceName] || toTitleCase(rawServiceName);

            let date = null;
            if (rawServiceName === "coworking") {
                date = client.startDate ? new Date(client.startDate) : null;
            } else if (rawServiceName === "virtualOffice") {
                date = client.termStartDate
                    ? new Date(client.termStartDate)
                    : client.rentDate
                        ? new Date(client.rentDate)
                        : null;
            } else if (rawServiceName === "meeting") {
                date = client.dateOfVisit
                    ? new Date(client.dateOfVisit)
                    : client.scheduledDate
                        ? new Date(client.scheduledDate)
                        : null;
            } else {
                date = client.startDate || client.dateOfVisit || client.termStartDate
                    ? new Date(client.startDate || client.dateOfVisit || client.termStartDate)
                    : null;
            }

            const formattedDate = date && !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "N/A";
            const month = date && !isNaN(date.getTime())
                ? date.toLocaleString("default", { month: "long" })
                : "Unknown";

            const clientName =
                client.clientName ||
                (client.firstName
                    ? `${client.firstName} ${client.lastName || ""}`
                    : "Unknown");

            const transformedClient = {
                client: clientName,
                typeOfClient: formattedServiceName,
                date: formattedDate,
            };

            if (!grouped[month]) {
                grouped[month] = [];
            }

            grouped[month].push(transformedClient);
        });

        return Object.entries(grouped).map(([month, clients]) => ({
            month,
            clients,
        }));
    };

    const transformedData = transformClientsGroupedByMonth(unifiedClients);

    const externalVisitors = useMemo(
        () => unifiedClients.filter((client) => client.visitorFlag === "Client"),
        [unifiedClients],
    );

    const meetingVisitorsCount = useMemo(
        () =>
            externalVisitors.filter(
                (visitor) =>
                    (visitor.purposeOfVisit || "").trim().toLowerCase() ===
                    "meeting room booking",
            ).length,
        [externalVisitors],
    );

    const openDeskVisitorsCount = useMemo(
        () =>
            externalVisitors.filter((visitor) => {
                const purpose = (visitor.purposeOfVisit || "").trim().toLowerCase();
                return purpose === "half-day pass" || purpose === "full-day pass";
            }).length,
        [externalVisitors],
    );

    const cards = [
        {
            id: 1,
            name: "External Meetings",
            data: meetingVisitorsCount,
            route: "/app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies",
            permission: PERMISSIONS.SALES_EXTERNAL_CLIENT_MEETINGS_COMPANIES.value,
        },
        {
            id: 2,
            name: "Open Desk",
            data: openDeskVisitorsCount,
            route: "/app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies",
            permission: PERMISSIONS.SALES_EXTERNAL_CLIENT_OPEN_DESK_COMPANIES.value,
        },
    ];

    const allowedCards = cards.filter(
        (card) => !card.permission || userPermissions.includes(card.permission)
    );

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* <div>
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <CircularProgress />
                    </div>
                ) : (
                    <UniqueClients
                        data={transformedData}
                        hideAccordion
                        additionalData={`CLIENTS : ${unifiedClients.length}`}
                    />
                )}
            </div> */}
            <WidgetSection layout={allowedCards.length <= 3 ? allowedCards.length : 3}>
                {allowedCards.map((item) => (
                    <DataCard key={item.id} title={item.name} data={item.data || 0} route={item.route} />
                ))}
            </WidgetSection>
        </div>
    );
};

export default ExternalClient;