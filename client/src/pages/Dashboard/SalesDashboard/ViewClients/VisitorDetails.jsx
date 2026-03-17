import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { CircularProgress } from "@mui/material";

const VisitorDetails = () => {
    const axios = useAxiosPrivate();
    const { clientName } = useParams();

    const decodedClientName = useMemo(
        () => decodeURIComponent(clientName || ""),
        [clientName]
    );

    const { data: externalCompanies = [], isLoading: isLoadingCompany } = useQuery({
        queryKey: ["all-external-companies"],
        queryFn: async () => {
            const res = await axios.get("/api/visitors/fetch-external-companies");
            return res.data;
        },
    });

    const { data: visitors = [], isLoading: isLoadingVisitors } = useQuery({
        queryKey: ["all-visitors", "today"],
        queryFn: async () => {
            const res = await axios.get("/api/visitors/fetch-visitors?query=all");
            return res.data;
        },
    });

    const currentVisitor = useMemo(() => {
        const normalizedName = decodedClientName.toLowerCase();
        return visitors.find((v) => {
            const possibleNames = [
                v.visitorCompany,
                v.brandName,
                v.registeredClientCompany,
                v.email,
            ].map((n) => (n || "").toLowerCase());
            return possibleNames.includes(normalizedName);
        });
    }, [visitors, decodedClientName]);

    const companyDetails = useMemo(() => {
        const normalizedName = decodedClientName.toLowerCase();
        return externalCompanies.find((c) => {
            const possibleNames = [
                c.companyName,
                c.registeredCompanyName,
                c.email,
            ].map((n) => (n || "").toLowerCase());
            return possibleNames.includes(normalizedName);
        });
    }, [externalCompanies, decodedClientName]);

    if (isLoadingCompany || isLoadingVisitors) {
        return (
            <div className="flex justify-center items-center p-8">
                <CircularProgress />
            </div>
        );
    }

    const renderDetailRow = (label, value) => (
        <div className="py-2 flex justify-between items-start gap-2">
            <div className="w-[100%] justify-start flex">
                <span className="font-pmedium text-gray-600 text-content">
                    {label}
                </span>
            </div>
            <div className="">
                <span>:</span>
            </div>
            <div className="w-full">
                <span className="text-gray-500">{value || "N/A"}</span>
            </div>
        </div>
    );

    return (
        <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <span className="text-subtitle font-pmedium text-primary">
                    {currentVisitor?.purposeOfVisit === "Meeting Room Booking" ? `External Client Detail` : `Open Desk Client Detail`}
                </span>
            </div>

            <div className="h-[51vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Section: Client Detail */}
                    <div>
                        <div className="py-4 border-b-default border-borderGray">
                            <span className="text-subtitle font-pmedium">
                                Client Detail
                            </span>
                        </div>
                        <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                            {renderDetailRow("First Name", currentVisitor?.firstName)}
                            {renderDetailRow("Last Name", currentVisitor?.lastName)}
                            {renderDetailRow("Email", currentVisitor?.email)}
                            {renderDetailRow("Phone Number", currentVisitor?.phoneNumber)}
                            {renderDetailRow("Purpose of Visit", currentVisitor?.purposeOfVisit)}
                            {renderDetailRow("Gender", currentVisitor?.gender)}
                            {renderDetailRow("Visitor Type", currentVisitor?.visitorType)}
                            {renderDetailRow("Email", currentVisitor?.email)}

                            {renderDetailRow("GST Number", currentVisitor?.gstNumber)}
                            {renderDetailRow("PAN Number", currentVisitor?.panNumber)}



                        </div>
                    </div>

                    {/* Section: Client Company Detail */}
                    <div>
                        <div className="py-4 border-b-default border-borderGray">
                            <span className="text-subtitle font-pmedium">
                                Client Company Detail
                            </span>
                        </div>
                        <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                            {renderDetailRow("Company Name", companyDetails?.companyName)}
                            {renderDetailRow("Registered Company Name", companyDetails?.registeredCompanyName)}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitorDetails;
