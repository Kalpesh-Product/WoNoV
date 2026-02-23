import { Avatar, Button, Chip, MenuItem, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
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

const ClientDetails = () => {
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
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
      buildingName: "",
      buildingAddress: "",
      cabinDesks: 0,
      openDesks: 0,
      totalDesks: 0,
      bookingType: "",
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
        bookingType: selectedClient.bookingType,
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
      hoCity: data.hoCity,
      hoState: data.hoState,
      isActive: data.isActive === true || data.isActive === "true",
      bookingType: data.bookingType,
      unitNo: data.unitNo,
      cabinDesks: Number(data.cabinDesks) || 0,
      openDesks: Number(data.openDesks) || 0,
      totalDesks:
        (Number(data.cabinDesks) || 0) + (Number(data.openDesks) || 0),
      ratePerCabinDesk: Number(data.ratePerCabinDesk) || 0,
      ratePerOpenDesk: Number(data.ratePerOpenDesk) || 0,
      annualIncrement: Number(data.annualIncrement) || 0,
      perDeskMeetingCredits: Number(data.perDeskMeetingCredits) || 0,
      totalMeetingCredits: Number(data.totalMeetingCredits) || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      lockinPeriod: Number(data.lockinPeriod) || 0,
      rentDate: data.rentDate,
      nextIncrement: data.nextIncrement,
      localPoc: {
        name: data.localPocName,
        email: data.localPocEmail,
        phone: data.localPocPhone,
      },
      hOPoc: {
        name: data.hoPocName,
        email: data.hoPocEmail,
        phone: data.hoPocPhone,
      },
    };

    try {
      const response = await axios.patch(
        `/api/sales/update-co-working-clients/${selectedClient._id}`,
        payload,
      );

      const updatedClient = {
        ...selectedClient,
        ...response?.data?.client,
        ...payload,
        localPocName: payload.localPoc.name,
        localPocEmail: payload.localPoc.email,
        localPocPhone: payload.localPoc.phone,
        hoPocName: payload.hOPoc.name,
        hoPocEmail: payload.hOPoc.email,
        hoPocPhone: payload.hOPoc.phone,
      };

      dispatch(setSelectedClient(updatedClient));
      dispatch(
        setClientData(
          clientsData.map((item) =>
            item._id === selectedClient._id
              ? { ...item, ...updatedClient }
              : item,
          ),
        ),
      );

      reset({
        ...data,
        totalDesks: payload.totalDesks,
      });
      setIsEditing(false);
      toast.success(
        response?.data?.message || "Client details updated successfully",
      );
    } catch (error) {
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
        bookingType: selectedClient.bookingType,
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
                              {control._defaultValues[fieldKey] || "N/A"}
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
                    "ratePerCabinDesk",
                    "openDesks",
                    "ratePerOpenDesk",
                    "isActive",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) =>
                            fieldKey === "isActive" ? (
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
                              {fieldKey === "isActive"
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
                              {fieldKey === "isActive"
                                ? control._defaultValues.isActive
                                  ? "Active"
                                  : "Inactive"
                                : control._defaultValues[fieldKey] || "N/A"}
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
                            {control._defaultValues.annualIncrement}%
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
                            {control._defaultValues.perDeskMeetingCredits}
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
                            {control._defaultValues.totalMeetingCredits}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="startDate"
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
                            {humanDate(control._defaultValues.startDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="endDate"
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
                            {humanDate(control._defaultValues.endDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lock-in Period */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="lockinPeriod"
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
                            {control._defaultValues.lockinPeriod}
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
                            {humanDate(control._defaultValues.rentDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Increment */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="nextIncrement"
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
                            {humanDate(control._defaultValues.nextIncrement)}
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

export default ClientDetails;
