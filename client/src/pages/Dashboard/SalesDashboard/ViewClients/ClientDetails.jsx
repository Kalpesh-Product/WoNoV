import { Avatar, Button, Chip, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const ClientDetails = () => {
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      clientName: "",
      serviceName: "",
      serviceDescription: "",
      sector: "",
      hoCity: "",
      hoState: "",
      unitName: "",
      unitNo: "",
      buildingName: "",
      buildingAddress: "",
      cabinDesks: 0,
      openDesks: 0,
      totalDesks: 0,
      ratePerOpenDesk: 0,
      ratePerCabinDesk: 0,
      annualIncrement: 0,
      perDeskMeetingCredits: 0,
      totalMeetingCredits: 0,
      startDate: "",
      endDate: "",
      lockinPeriod: 0,
      rentDate: "",
      nextIncrement: "",
      localPocName: "",
      localPocEmail: "",
      localPocPhone: "",
      hoPocName: "",
      hoPocEmail: "",
      hoPocPhone: "",
      isActive: false,
      createdAt: "",
      updatedAt: "",
    },
  });

  useEffect(() => {
    if (selectedClient) {
      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        hoCity: selectedClient.hoCity,
        hoState: selectedClient.hoState,
        unitName: selectedClient.unit?.unitName || "",
        unitNo: selectedClient.unitNo || "",
        buildingName: selectedClient.unit?.building?.buildingName || "",
        buildingAddress: selectedClient.unit?.building?.fullAddress || "",
        cabinDesks: selectedClient.cabinDesks,
        openDesks: selectedClient.openDesks,
        totalDesks: selectedClient.totalDesks,
        ratePerOpenDesk: selectedClient.ratePerOpenDesk,
        ratePerCabinDesk: selectedClient.ratePerCabinDesk,
        annualIncrement: selectedClient.annualIncrement,
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits,
        totalMeetingCredits: selectedClient.totalMeetingCredits,
        startDate: selectedClient.startDate,
        endDate: selectedClient.endDate,
        lockinPeriod: selectedClient.lockinPeriod,
        rentDate: selectedClient.rentDate,
        nextIncrement: selectedClient.nextIncrement,
        localPocName: selectedClient.localPocName || "",
        localPocEmail: selectedClient.localPocEmail || "",
        localPocPhone: selectedClient.localPocPhone || "",
        hoPocName: selectedClient.hoPocName || "",
        hoPocEmail: selectedClient.hoPocEmail || "",
        hoPocPhone: selectedClient.hoPocPhone || "",
        isActive: selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
    }
  }, [selectedClient, reset]);

  console.log(selectedClient);

  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const onSubmit = (data) => {
    setIsEditing(!isEditing);
    toast.success("User details updated successfully");
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4 ">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-subtitle font-pmedium text-primary">
            Client Details
          </span>
        </div>
        <div>
          <PrimaryButton handleSubmit={handleEditToggle} title={"Edit"} />
        </div>
      </div>

      <div className="h-[51vh] overflow-y-auto">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section:  Customer Details */}
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Customer Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {["clientName", "service", "sector", "hoCity", "hoState"].map(
                    (fieldKey) => (
                      <div key={fieldKey}>
                        {isEditing ? (
                          <Controller
                            name={fieldKey}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                size="small"
                                label={fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                                fullWidth
                              />
                            )}
                          />
                        ) : (
                          <div className="py-2 flex justify-between items-center gap-2">
                            <div className="w-[100%] justify-start flex">
                              <span className="font-pmedium text-gray-600 text-content">
                                {fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </span>{" "}
                            </div>
                            <div className="">
                              <span>:</span>
                            </div>
                            <div className="w-full">
                              <span className="text-gray-500">
                                {control._defaultValues[fieldKey]}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Section: Company Details */}
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Company Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "unitNo",
                    "cabinDesks",
                    "ratePerCabinDesk",
                    "openDesks",
                    "ratePerOpenDesk",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label={fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              fullWidth
                            />
                          )}
                        />
                      ) : (
                        <div className="py-2 flex justify-between items-start gap-2">
                          <div className="w-[100%] justify-start flex">
                            <span className="font-pmedium text-gray-600 text-content">
                              {fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>{" "}
                          </div>
                          <div className="">
                            <span>:</span>
                          </div>
                          <div className="w-full">
                            <span className="text-gray-500">
                              {control._defaultValues[fieldKey]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Company Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "annualIncrement",
                    "perDeskMeetingCredits",
                    "totalMeetingCredits",
                    "startDate",
                    "endDate",
                    "lockinPeriod",
                    "rentDate",
                    "nextIncrement",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label={fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              fullWidth
                            />
                          )}
                        />
                      ) : (
                        <div className="py-2 flex justify-between items-start gap-2">
                          <div className="w-[100%] justify-start flex">
                            <span className="font-pmedium text-gray-600 text-content">
                              {fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>{" "}
                          </div>
                          <div className="">
                            <span>:</span>
                          </div>
                          <div className="w-full">
                            <span className="text-gray-500">
                              {control._defaultValues[fieldKey]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Company Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "localPocName",
                    "localPocEmail",
                    "localPocPhone",
                    "hoPocName",
                    "hoPocEmail",
                    "hoPocPhone",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label={fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              fullWidth
                            />
                          )}
                        />
                      ) : (
                        <div className="py-2 flex justify-between items-start gap-2">
                          <div className="w-[100%] justify-start flex">
                            <span className="font-pmedium text-gray-600 text-content">
                              {fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>{" "}
                          </div>
                          <div className="">
                            <span>:</span>
                          </div>
                          <div className="w-full">
                            <span className="text-gray-500">
                              {control._defaultValues[fieldKey]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 py-4">
              <PrimaryButton
                title={isEditing ? "Submit" : "Edit"}
                handleSubmit={
                  isEditing ? handleSubmit(onSubmit) : handleEditToggle
                }
              />
              {isEditing && (
                <SecondaryButton title={"Reset"} handleSubmit={handleReset} />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
