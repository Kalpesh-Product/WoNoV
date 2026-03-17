import { Avatar, Button, Chip, MenuItem, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import humanDate from "../../../../utils/humanDateForamt";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { setClientData } from "../../../../redux/slices/salesSlice";
import { useParams } from "react-router-dom";

const VirtualOfficeClientDetails = () => {
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const { clientId } = useParams();
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const clientsData = useSelector((state) => state.sales.clientsData);
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
      cabinDesks: 0,
      openDesks: 0,
      totalDesks: 0,
      bookingType: "",
      openDeskRate: 0,
      cabinDeskRate: 0,
      annualIncrement: 0,
      perDeskMeetingCredits: 0,
      totalMeetingCredits: 0,
      termStartDate: "",
      termEnd: "",
      lockInPeriodMonths: 0,
      rentDate: "",
      nextIncrementDate: "",
      localPocName: "",
      localPocEmail: "",
      localPocPhone: "",
      hoPocName: "",
      hoPocEmail: "",
      hoPocPhone: "",
      clientStatus: true,
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
        hoCity: selectedClient.city || selectedClient.hoCity,
        hoState: selectedClient.state || selectedClient.hoState,
        unitName: selectedClient.unit?.unitName || "",
        unitNo: selectedClient.unitNo || "",
        buildingName: selectedClient.unit?.building?.buildingName || "",
        buildingAddress: selectedClient.unit?.building?.fullAddress || "",
        cabinDesks: selectedClient.cabinDesks || 0,
        openDesks: selectedClient.openDesks || 0,
        totalDesks: selectedClient.totalDesks || 0,
        openDeskRate: selectedClient.openDeskRate || 0,
        cabinDeskRate: selectedClient.cabinDeskRate || 0,
        annualIncrement: selectedClient.annualIncrement || 0,
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits || 0,
        totalMeetingCredits: selectedClient.totalMeetingCredits || 0,
        termStartDate: selectedClient.termStartDate || selectedClient.startDate,
        bookingType: selectedClient.bookingType,
        termEnd: selectedClient.termEnd || selectedClient.endDate,
        lockInPeriodMonths:
          selectedClient.lockInPeriodMonths || selectedClient.lockinPeriod,
        rentDate: selectedClient.rentDate,
        nextIncrementDate:
          selectedClient.nextIncrementDate || selectedClient.nextIncrement,
        localPocName: selectedClient.localPoc?.name || "",
        localPocEmail: selectedClient.localPoc?.email || "",
        localPocPhone: selectedClient.localPoc?.phone || "",
        hoPocName: selectedClient.hoPoc?.name || "",
        hoPocEmail: selectedClient.hoPoc?.email || "",
        hoPocPhone: selectedClient.hoPoc?.phone || "",
        clientStatus: selectedClient.clientStatus ?? selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
    }
  }, [selectedClient, reset]);

  const virtualOfficeClientId = /^[a-fA-F0-9]{24}$/.test(clientId)
    ? clientId
    : selectedClient?._id;

  const { isLoading: isClientLoading } = useQuery({
    queryKey: ["virtualOfficeClient", virtualOfficeClientId],
    enabled: Boolean(virtualOfficeClientId),
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/sales/virtual-office/clients?virtualofficeclientid=${virtualOfficeClientId}`,
        );
        const clientData =
          response?.data?.client || response?.data?.data || response?.data;

        if (clientData?._id) {
          dispatch(setSelectedClient(clientData));
        }

        return clientData;
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to fetch client details",
        );
        throw error;
      }
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const bookingTypeOptions = React.useMemo(() => {
    const options = new Set();

    clientsData?.forEach((client) => {
      if (client?.bookingType) {
        options.add(client.bookingType);
      }
    });

    if (selectedClient?.bookingType) {
      options.add(selectedClient.bookingType);
    }

    return [...options];
  }, [clientsData, selectedClient?.bookingType]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data) => {
    if (!selectedClient?._id) {
      toast.error("Client details not found");
      return;
    }

    const payload = {
      clientName: data.clientName,
      sector: data.sector,
      city: data.hoCity,
      state: data.hoState,
      clientStatus: data.clientStatus === true || data.clientStatus === "true",
      bookingType: data.bookingType,
      unitNo: data.unitNo,
      cabinDesks: Number(data.cabinDesks) || 0,
      openDesks: Number(data.openDesks) || 0,
      cabinDeskRate: Number(data.cabinDeskRate) || 0,
      openDeskRate: Number(data.openDeskRate) || 0,
      annualIncrement: Number(data.annualIncrement) || 0,
      perDeskMeetingCredits: Number(data.perDeskMeetingCredits) || 0,
      termStartDate: data.termStartDate,
      termEnd: data.termEnd,
      lockInPeriodMonths: Number(data.lockInPeriodMonths) || 0,
      rentDate: data.rentDate,
      nextIncrementDate: data.nextIncrementDate,
      localPoc: {
        name: data.localPocName,
        email: data.localPocEmail,
        phone: data.localPocPhone,
      },
      hoPoc: {
        name: data.hoPocName,
        email: data.hoPocEmail,
        phone: data.hoPocPhone,
      },
    };

    try {
      console.log("Submitting payload:", payload);
      const response = await axios.patch(
        `/api/sales/virtual-office/${selectedClient._id}`,
        payload,
      );

      console.log("Server response:", response.data);
      const serverData = response?.data?.data || response?.data?.client || {};

      const updatedClient = {
        ...selectedClient,
        ...serverData,
        // Map POC data back to flattened fields for UI consistency
        unitNo: serverData.unitNo ?? serverData.unitNumber ?? data.unitNo,
        localPocName: payload.localPoc.name,
        localPocEmail: payload.localPoc.email,
        localPocPhone: payload.localPoc.phone,
        hoPocName: payload.hoPoc.name,
        hoPocEmail: payload.hoPoc.email,
        hoPocPhone: payload.hoPoc.phone,
        // Map other potentially renamed fields back for UI compatibility
        hoCity: serverData.city || serverData.hoCity || data.hoCity,
        hoState: serverData.state || serverData.hoState || data.hoState,
        clientStatus: serverData.clientStatus ?? serverData.isActive ?? data.clientStatus,
        lockInPeriodMonths: serverData.lockInPeriodMonths ?? serverData.lockinPeriod ?? data.lockInPeriodMonths,
        termStartDate: serverData.termStartDate ?? serverData.startDate ?? data.termStartDate,
        termEnd: serverData.termEnd ?? serverData.endDate ?? data.termEnd,
        nextIncrementDate: serverData.nextIncrementDate ?? serverData.nextIncrement ?? data.nextIncrementDate,
      };

      dispatch(setSelectedClient(updatedClient));

      if (Array.isArray(clientsData)) {
        dispatch(
          setClientData(
            clientsData.map((item) =>
              item._id === selectedClient._id
                ? { ...item, ...updatedClient }
                : item,
            ),
          ),
        );
      }

      // Sync form with updated data
      reset({
        ...data,
        ...updatedClient,
        totalDesks: serverData.totalDesks || payload.cabinDesks + payload.openDesks,
        totalMeetingCredits: serverData.totalMeetingCredits,
      });

      setIsEditing(false);
      toast.success(
        response?.data?.message || "Client details updated successfully",
      );
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(
        error?.response?.data?.message || "Unable to update client details",
      );
    }
  };

  const handleReset = () => {
    if (selectedClient) {
      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        hoCity: selectedClient.city || selectedClient.hoCity,
        hoState: selectedClient.state || selectedClient.hoState,
        unitName: selectedClient.unit?.unitName || "",
        unitNo: selectedClient.unitNo || "",
        buildingName: selectedClient.unit?.building?.buildingName || "",
        buildingAddress: selectedClient.unit?.building?.fullAddress || "",
        cabinDesks: selectedClient.cabinDesks || 0,
        openDesks: selectedClient.openDesks || 0,
        totalDesks: selectedClient.totalDesks || 0,
        openDeskRate: selectedClient.openDeskRate || 0,
        cabinDeskRate: selectedClient.cabinDeskRate || 0,
        annualIncrement: selectedClient.annualIncrement || 0,
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits || 0,
        totalMeetingCredits: selectedClient.totalMeetingCredits || 0,
        termStartDate: selectedClient.termStartDate || selectedClient.startDate,
        bookingType: selectedClient.bookingType,
        termEnd: selectedClient.termEnd || selectedClient.endDate,
        lockInPeriodMonths:
          selectedClient.lockInPeriodMonths || selectedClient.lockinPeriod,
        rentDate: selectedClient.rentDate,
        nextIncrementDate:
          selectedClient.nextIncrementDate || selectedClient.nextIncrement,
        localPocName: selectedClient.localPoc?.name || "",
        localPocEmail: selectedClient.localPoc?.email || "",
        localPocPhone: selectedClient.localPoc?.phone || "",
        hoPocName: selectedClient.hoPoc?.name || "",
        hoPocEmail: selectedClient.hoPoc?.email || "",
        hoPocPhone: selectedClient.hoPoc?.phone || "",
        clientStatus: selectedClient.clientStatus ?? selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
    }
  };

  const renderDatePickerField = (field, label) => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        format="DD-MM-YYYY"
        value={field.value ? dayjs(field.value) : null}
        onChange={(dateValue) =>
          field.onChange(dateValue ? dayjs(dateValue).toISOString() : "")
        }
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4 ">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-subtitle font-pmedium text-primary">
            Client Details
          </span>
        </div>
        <div>
          <PrimaryButton
            handleSubmit={handleEditToggle}
            title={isEditing ? "Cancel" : "Edit"}
            disabled={isClientLoading}
          />
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
                  {[
                    "clientName",
                    "sector",
                    "hoCity",
                    "hoState",
                    "bookingType",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) =>
                            fieldKey === "bookingType" ? (
                              <TextField
                                {...field}
                                select
                                size="small"
                                label="Booking Type"
                                fullWidth
                              >
                                {bookingTypeOptions.map((bookingType) => (
                                  <MenuItem
                                    key={bookingType}
                                    value={bookingType}
                                  >
                                    {bookingType}
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : (
                              <TextField
                                {...field}
                                size="small"
                                label={fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                                fullWidth
                              />
                            )
                          }
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
                              {(fieldKey === "hoCity"
                                ? selectedClient?.city || selectedClient?.hoCity
                                : fieldKey === "hoState"
                                  ? selectedClient?.state ||
                                  selectedClient?.hoState
                                  : selectedClient?.[fieldKey]) || "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
                    "cabinDeskRate",
                    "openDesks",
                    "openDeskRate",
                    "totalDesks",
                    "clientStatus",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) =>
                            fieldKey === "clientStatus" ? (
                              <TextField
                                {...field}
                                select
                                size="small"
                                label="Status"
                                fullWidth
                              >
                                <MenuItem value={true}>Active</MenuItem>
                                <MenuItem value={false}>Inactive</MenuItem>
                              </TextField>
                            ) : fieldKey === "totalDesks" ? (
                              <TextField
                                {...field}
                                disabled
                                size="small"
                                label="Total Desks"
                                fullWidth
                              />
                            ) : (
                              <TextField
                                {...field}
                                size="small"
                                label={fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                                fullWidth
                              />
                            )
                          }
                        />
                      ) : (
                        <div className="py-2 flex justify-between items-start gap-2">
                          <div className="w-[100%] justify-start flex">
                            <span className="font-pmedium text-gray-600 text-content">
                              {fieldKey === "clientStatus"
                                ? "Status"
                                : fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                            </span>{" "}
                          </div>
                          <div className="">
                            <span>:</span>
                          </div>
                          <div className="w-full">
                            <span className="text-gray-500">
                              {fieldKey === "clientStatus"
                                ? (selectedClient?.clientStatus ??
                                  selectedClient?.isActive)
                                  ? "Active"
                                  : "Inactive"
                                : selectedClient?.[fieldKey] || "N/A"}
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
                    Agreement Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {/* Annual Increment */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="annualIncrement"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Annual Increment"
                            fullWidth
                          />
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Annual Increment
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {selectedClient?.annualIncrement}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Per Desk Meeting Credits */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="perDeskMeetingCredits"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Per Desk Meeting Credits"
                            fullWidth
                          />
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Per Desk Meeting Credits
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {selectedClient?.perDeskMeetingCredits}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Meeting Credits */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="totalMeetingCredits"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Total Meeting Credits"
                            fullWidth
                          />
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Total Meeting Credits
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {selectedClient?.totalMeetingCredits}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="termStartDate"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "Start Date")
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Start Date
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(selectedClient?.termStartDate || selectedClient?.startDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="termEnd"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "End Date")
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            End Date
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(selectedClient?.termEnd || selectedClient?.endDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lock-in Period */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="lockInPeriodMonths"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Lock-in Period"
                            fullWidth
                          />
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Lock-in Period
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {selectedClient?.lockInPeriodMonths || selectedClient?.lockinPeriod}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rent Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="rentDate"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "Rent Date")
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Rent Date
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(selectedClient?.rentDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Increment */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="nextIncrementDate"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "Next Increment")
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Next Increment
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(selectedClient?.nextIncrementDate || selectedClient?.nextIncrement)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    POC Details
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
                              {fieldKey === "localPocName"
                                ? selectedClient?.localPoc?.name
                                : fieldKey === "localPocEmail"
                                  ? selectedClient?.localPoc?.email
                                  : fieldKey === "localPocPhone"
                                    ? selectedClient?.localPoc?.phone
                                    : fieldKey === "hoPocName"
                                      ? selectedClient?.hoPoc?.name
                                      : fieldKey === "hoPocEmail"
                                        ? selectedClient?.hoPoc?.email
                                        : fieldKey === "hoPocPhone"
                                          ? selectedClient?.hoPoc?.phone
                                          : ""}
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
              {isEditing ? (
                <PrimaryButton
                  title={"Submit"}
                  handleSubmit={
                    isEditing ? handleSubmit(onSubmit) : handleEditToggle
                  }
                />
              ) : (
                ""
              )}
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

export default VirtualOfficeClientDetails;
