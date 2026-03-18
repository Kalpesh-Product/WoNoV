import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircularProgress, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";

const VisitorDetails = () => {
    const axios = useAxiosPrivate();
    const queryClient = useQueryClient();
    const { clientName } = useParams();
    const location = useLocation();
    const isOpenDeskView = location.pathname.includes("/open-desk/");
    const [isEditing, setIsEditing] = useState(false);

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            purposeOfVisit: "",
            gender: "",
            gstNumber: "",
            panNumber: "",
            registeredClientCompany: "",
            brandName: "",
        },
    });

    const decodedClientName = useMemo(
        () => decodeURIComponent(clientName || ""),
        [clientName],
    );

    const { data: visitors = [], isLoading: isLoadingVisitors } = useQuery({
        queryKey: ["all-visitors", "all"],
        queryFn: async () => {
            const res = await axios.get("/api/visitors/fetch-visitors?query=all");
            return res.data;
        },
    });

    const currentVisitor = useMemo(() => {
        const normalizedName = decodedClientName.toLowerCase();
        const companyMatches = (v) => {
            const possibleNames = [
                v.visitorCompany,
                v.brandName,
                v.registeredClientCompany,
                v.email,
            ].map((n) => (n || "").toLowerCase());
            return possibleNames.includes(normalizedName);
        };

        const purposeMatchesView = (v) => {
            const purpose = (v.purposeOfVisit || "").trim().toLowerCase();
            if (isOpenDeskView) {
                return purpose === "half-day pass" || purpose === "full-day pass";
            }

            return purpose === "meeting room booking";
        };

        const matchingVisitors = visitors.filter(
            (v) => companyMatches(v) && purposeMatchesView(v),
        );

        if (matchingVisitors.length > 0) {
            return [...matchingVisitors].sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
            )[0];
        }

        return visitors.find(companyMatches);
    }, [visitors, decodedClientName, isOpenDeskView]);

    useEffect(() => {
        reset({
            firstName: currentVisitor?.firstName || "",
            lastName: currentVisitor?.lastName || "",
            email: currentVisitor?.email || "",
            phoneNumber: currentVisitor?.phoneNumber || "",
            purposeOfVisit: currentVisitor?.purposeOfVisit || "",
            gender: currentVisitor?.gender || "",
            gstNumber: currentVisitor?.gstNumber || "",
            panNumber: currentVisitor?.panNumber || "",
            registeredClientCompany: currentVisitor?.registeredClientCompany || "",
            brandName: currentVisitor?.brandName || "",
        });
    }, [currentVisitor, reset]);

    const onSubmit = async (data) => {
        try {
            const updates = [];

            if (currentVisitor?._id) {
                updates.push(
                    axios.patch(`/api/visitors/update-visitor/${currentVisitor._id}`, {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phoneNumber: data.phoneNumber,
                        purposeOfVisit: data.purposeOfVisit,
                        gender: data.gender,
                        gstNumber: data.gstNumber,
                        panNumber: data.panNumber,
                        registeredClientCompany: data.registeredClientCompany,
                        brandName: data.brandName,
                    }),
                );
            }

            await Promise.all(updates);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["all-visitors"] }),
            ]);

            setIsEditing(false);
            toast.success("Client details updated successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update details");
        }
    };

    const renderDetailRow = (label, value) => (
        <div className="py-2 flex justify-between items-start gap-2">
            <div className="w-[100%] justify-start flex">
                <span className="font-pmedium text-gray-600 text-content">{label}</span>
            </div>
            <div>
                <span>:</span>
            </div>
            <div className="w-full">
                <span className="text-gray-500">{value || "N/A"}</span>
            </div>
        </div>
    );

    const renderEditableRow = (name, label) => (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField {...field} label={label} size="small" fullWidth />
            )}
        />
    );

    const handleReset = () => {
        reset({
            firstName: currentVisitor?.firstName || "",
            lastName: currentVisitor?.lastName || "",
            email: currentVisitor?.email || "",
            phoneNumber: currentVisitor?.phoneNumber || "",
            purposeOfVisit: currentVisitor?.purposeOfVisit || "",
            gender: currentVisitor?.gender || "",
            gstNumber: currentVisitor?.gstNumber || "",
            panNumber: currentVisitor?.panNumber || "",
            registeredClientCompany: currentVisitor?.registeredClientCompany || "",
            brandName: currentVisitor?.brandName || "",
        });
    };

    const renderFileLink = (value) => {
        const fileUrl = value?.link || value?.url || value;
        if (!fileUrl) return "N/A";

        return (
            <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline break-all"
            >
                View File
            </a>
        );
    };

    if (isLoadingVisitors) {
        return (
            <div className="flex justify-center items-center p-8">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <span className="text-subtitle font-pmedium text-primary">
                    {currentVisitor?.purposeOfVisit === "Meeting Room Booking"
                        ? "External Client Detail"
                        : "Open Desk Client Detail"}
                </span>
                <PrimaryButton
                    handleSubmit={() => setIsEditing((prev) => !prev)}
                    title={isEditing ? "Cancel" : "Edit"}
                />
            </div>

            <div className="h-[51vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="py-4 border-b-default border-borderGray">
                                <span className="text-subtitle font-pmedium">Client Detail</span>
                            </div>
                            <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                                {isEditing
                                    ? renderEditableRow("firstName", "First Name")
                                    : renderDetailRow("First Name", currentVisitor?.firstName)}
                                {isEditing
                                    ? renderEditableRow("lastName", "Last Name")
                                    : renderDetailRow("Last Name", currentVisitor?.lastName)}
                                {isEditing
                                    ? renderEditableRow("email", "Email")
                                    : renderDetailRow("Email", currentVisitor?.email)}
                                {isEditing
                                    ? renderEditableRow("phoneNumber", "Phone Number")
                                    : renderDetailRow("Phone Number", currentVisitor?.phoneNumber)}
                                {isEditing
                                    ? renderEditableRow("purposeOfVisit", "Purpose of Visit")
                                    : renderDetailRow("Purpose of Visit", currentVisitor?.purposeOfVisit)}
                                {isEditing
                                    ? renderEditableRow("gender", "Gender")
                                    : renderDetailRow("Gender", currentVisitor?.gender)}
                                {isEditing
                                    ? renderEditableRow("gstNumber", "GST Number")
                                    : renderDetailRow("GST Number", currentVisitor?.gstNumber)}
                                {isEditing
                                    ? renderEditableRow("panNumber", "PAN Number")
                                    : renderDetailRow("PAN Number", currentVisitor?.panNumber)}
                            </div>
                        </div>

                        <div>
                            <div className="py-4 border-b-default border-borderGray">
                                <span className="text-subtitle font-pmedium">
                                    Client Company Detail
                                </span>
                            </div>
                            <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                                {isEditing
                                    ? renderEditableRow("registeredClientCompany", "Registered Client Company")
                                    : renderDetailRow(
                                        "Registered Client Company",
                                        currentVisitor?.registeredClientCompany,
                                    )}
                                {isEditing
                                    ? renderEditableRow("brandName", "Brand Name")
                                    : renderDetailRow("Brand Name", currentVisitor?.brandName)}
                            </div>
                        </div>

                        {!isEditing && (
                            <>
                                <div>
                                    <div className="py-4 border-b-default border-borderGray">
                                        <span className="text-subtitle font-pmedium">GST</span>
                                    </div>
                                    <div className="p-4">
                                        {renderDetailRow("GST File", renderFileLink(currentVisitor?.gstFile))}
                                    </div>
                                </div>

                                <div>
                                    <div className="py-4 border-b-default border-borderGray">
                                        <span className="text-subtitle font-pmedium">Verification</span>
                                    </div>
                                    <div className="p-4">
                                        {renderDetailRow("Verification File", renderFileLink(currentVisitor?.panFile))}
                                    </div>
                                </div>

                                <div>
                                    <div className="py-4 border-b-default border-borderGray">
                                        <span className="text-subtitle font-pmedium">Others</span>
                                    </div>
                                    <div className="p-4">
                                        {renderDetailRow("Other File", renderFileLink(currentVisitor?.otherFile))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex items-center justify-center gap-2 py-4">
                            <PrimaryButton title="Submit" handleSubmit={handleSubmit(onSubmit)} />
                            <SecondaryButton title="Reset" handleSubmit={handleReset} />
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default VisitorDetails;