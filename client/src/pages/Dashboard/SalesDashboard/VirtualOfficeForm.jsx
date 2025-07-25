import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { TextField, Select, MenuItem, CircularProgress } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import { State, City } from "country-state-city";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import PageFrame from "../../../components/Pages/PageFrame";

const VirtualOfficeForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      clientName: "",
      email: "",
      phone: "",
      service: "",
      sector: "",
      hoCity: "",
      hoState: "",
      unit: "",
      cabinDesks: "",
      ratePerCabinDesk: "10000",
      openDesks: "",
      ratePerOpenDesk: "8000",
      annualIncrement: "",
      perDeskMeetingCredits: "",
      totalMeetingCredits: "",
      startDate: null,
      endDate: null,
      lockinPeriod: "",
      rentDate: null,
      nextIncrement: null,
      localPocName: "",
      localPocEmail: "",
      localPocPhone: "",
      hOPocName: "",
      hOPocEmail: "",
      hOPocPhone: "",
    },
  });
  const clientsData = useSelector((state) => state.sales.clientsData);
  const [selectedUnit, setSelectedUnit] = useState("");

  //-----------------------------------------------------Calculation------------------------------------------------//
  const cabinDesks = useWatch({ control, name: "cabinDesks" });
  const cabinDeskRate = useWatch({ control, name: "ratePerCabinDesk" });
  const totalCabinCost =
    (parseFloat(cabinDesks) || 0) * (parseFloat(cabinDeskRate) || 0);

  const openDesks = useWatch({ control, name: "openDesks" });
  const openDesksRate = useWatch({ control, name: "ratePerOpenDesk" });
  const totalOpenDeskCost =
    (parseFloat(openDesks) || 0) * (parseFloat(openDesksRate) || 0);

  const perDeskCredit = useWatch({ control, name: "perDeskMeetingCredits" });
  const totalMeetingCredits =
    (parseFloat(openDesks || 0) + parseFloat(cabinDesks || 0)) *
    (perDeskCredit || 0);

  useEffect(() => {
    const computed = (
      (parseFloat(openDesks || 0) + parseFloat(cabinDesks || 0)) *
      (parseFloat(perDeskCredit) || 0)
    ).toFixed(2);

    setValue("totalMeetingCredits", computed);
  }, [openDesks, cabinDesks, perDeskCredit, setValue]);

  //-----------------------------------------------------Calculation------------------------------------------------------------//
  const axios = useAxiosPrivate();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);
  const handleStateSelect = (stateCode) => {
    const city = City.getCitiesOfState("IN", stateCode);
    setCities(city);
  };
  const {
    data: units = [],
    isLoading: isUnitsPending,
    error: isUnitsError,
    refetch: fetchUnits,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/fetch-units?deskCalculated=true`
      );
      return response.data;
    },
  });

  const availableCabinDesks = units.filter(
    (item) => item._id?.trim() === selectedUnit.trim()
  );
  const {
    data: services = [],
    isLoading: isServicesPending,
    error: isServicesError,
    refetch: fetchServices,
  } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/services");
      return response.data;
    },
    // enabled: false,
  });

  const { mutate: mutateClientData, isPending: isMutateClientPending } =
    useMutation({
      mutationKey: "clientData",
      mutationFn: async (data) => {
        const response = await axios.post(
          `/api/sales/onboard-co-working-client`,
          data
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message);
        reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onSubmit = (data) => {
    mutateClientData(data);
  };

  const handleReset = () => {
    reset();
  };

  const [selectedValue, setSelectedValue] = useState("Coworking");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div>
            <span className="text-title uppercase text-primary font-pmedium">
              virtual-office client onboarding
            </span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="flex gap-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                {/* Section: Basic Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Client Information
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                  <Controller
                    name="clientName"
                    control={control}
                    rules={{ required: "Client Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Client Name"
                        error={!!errors.clientName}
                        helperText={errors.clientName?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: "Email is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Phone is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Phone"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="service"
                    control={control}
                    rules={{ required: "Service is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        select
                        label="Service"
                        error={!!errors.service}
                        helperText={errors.service?.message}
                        fullWidth
                      >
                        <MenuItem value="" disabled>
                          Select a Service
                        </MenuItem>
                        {!isServicesPending ? (
                          services.map((item) => (
                            <MenuItem key={item._id} value={item._id}>
                              {item.serviceName}
                            </MenuItem>
                          ))
                        ) : (
                          <CircularProgress color="#1E3D73" />
                        )}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="sector"
                    control={control}
                    rules={{ required: "Sector is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Sector"
                        fullWidth
                        error={!!errors.sector}
                        helperText={errors.sector?.message}
                      >
                        <MenuItem value="" disabled>
                          Select a Sector
                        </MenuItem>
                        <MenuItem value="IT & Consulting">
                          IT & Consulting
                        </MenuItem>
                      </TextField>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                    <Controller
                      name="hoState"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          select
                          label="State"
                          onChange={(e) => {
                            field.onChange(e);
                            handleStateSelect(e.target.value);
                          }}
                          fullWidth
                        >
                          <MenuItem value="">Select a State</MenuItem>
                          {states.map((item) => (
                            <MenuItem value={item.isoCode} key={item.isoCode}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                    <Controller
                      name="hoCity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          select
                          label="City"
                          fullWidth
                        >
                          <MenuItem value="">Select a State</MenuItem>
                          {cities.map((item) => (
                            <MenuItem
                              value={item.name}
                              key={`${item.name}-${item.stateCode}-${item.latitude}`}
                            >
                              {item.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div>
                {/* Section: Job Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Space & Desks
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  <Controller
                    name="unit"
                    control={control}
                    rules={{ required: "Unit is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onClick={fetchUnits}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedUnit(e.target.value);
                          fetchUnits();
                        }}
                        size="small"
                        select
                        label="Unit"
                        fullWidth
                      >
                        <MenuItem value="">Select a Unit</MenuItem>
                        {!isUnitsPending ? (
                          units.map((item) => (
                            <MenuItem key={item._id} value={item._id}>
                              {item.unitNo}
                            </MenuItem>
                          ))
                        ) : (
                          <>
                            <CircularProgress color="#1E3D73" />
                          </>
                        )}
                      </TextField>
                    )}
                  />

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <Controller
                        name="cabinDesks"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            type="number"
                            label="Cabin Desks"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                    <div className="w-1/2">
                      <Controller
                        name="ratePerCabinDesk"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            type="number"
                            label="Cabin Desk Rate"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                    <div className="w-1/2">
                      <TextField
                        value={totalCabinCost}
                        size="small"
                        disabled
                        type="number"
                        label={"Total"}
                        fullWidth
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <Controller
                        name="openDesks"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            type="number"
                            label="Open Desks"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                    <div className="w-1/2">
                      <Controller
                        name="ratePerOpenDesk"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            type="number"
                            label="Open Desk Rate"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                    <div className="w-1/2">
                      <TextField
                        value={totalOpenDeskCost}
                        size="small"
                        disabled
                        type="number"
                        label={"Total"}
                        fullWidth
                      />
                    </div>
                  </div>
                  <Controller
                    name="annualIncrement"
                    control={control}
                    rules={{ required: "Annual Increment is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Annual Increment"
                        type="number"
                        error={!!errors.annualIncrement}
                        helperText={errors.annualIncrement?.message}
                        fullWidth
                      />
                    )}
                  />
                  <div className="flex gap-2">
                    <Controller
                      name="perDeskMeetingCredits"
                      control={control}
                      rules={{
                        required: "Per Desk Meeting Credits is required",
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          type="number"
                          error={!!errors.perDeskMeetingCredits}
                          helperText={errors.perDeskMeetingCredits?.message}
                          label="Per Desk Meeting Credits"
                          fullWidth
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="totalMeetingCredits"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        disabled
                        label="Total Meeting Credits"
                        fullWidth
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">KYC</span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="startDate"
                      control={control}
                      rules={{ required: "Start Date is required" }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label={"Start Date"}
                          format="DD-MM-YYYY"
                          value={field.value || null}
                          onChange={(e) => field.onChange(e)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.startDate,
                              helperText: errors.startDate?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="endDate"
                      control={control}
                      rules={{ required: "End Date is Required" }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          format="DD-MM-YYYY"
                          label="Select End Date"
                          value={field.value || null}
                          onChange={(e) => field.onChange(e)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.endDate,
                              helperText: errors.endDate?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>

                  <Controller
                    name="lockinPeriod"
                    control={control}
                    rules={{ required: "Lock-in period is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Lock-in Period (Months)"
                        type="number"
                        error={!!errors.lockinPeriod}
                        helperText={errors.lockinPeriod?.message}
                        fullWidth
                      />
                    )}
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="rentDate"
                      control={control}
                      rules={{ required: "Rent Date is required" }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label={"Rent Date"}
                          format="DD-MM-YYYY"
                          value={field.value || null}
                          onChange={(e) => field.onChange(e)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.rentDate,
                              helperText: errors.rentDate?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="nextIncrement"
                      control={control}
                      rules={{ required: "Next Increment is required" }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label={"Next Increment"}
                          format="DD-MM-YYYY"
                          value={field.value || null}
                          onChange={(e) => field.onChange(e)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.nextIncrement,
                              helperText: errors.nextIncrement?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Points Of Contact
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  <Controller
                    name="localPocName"
                    control={control}
                    rules={{ required: "Local POC Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Local POC Name"
                        error={!!errors.localPocName}
                        helperText={errors.localPocName?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="localPocEmail"
                    control={control}
                    rules={{ required: "Local POC Email is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Local POC Email"
                        error={!!errors.localPocEmail}
                        helperText={errors.localPocEmail?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="localPocPhone"
                    control={control}
                    rules={{ required: "Local POC Phone is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        label="Local POC Phone"
                        error={!!errors.localPocPhone}
                        helperText={errors.localPocPhone?.message}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="hOPocName"
                    control={control}
                    rules={{ required: "HO POC Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="HO POC Name"
                        error={!!errors.hOPocName}
                        helperText={errors.hOPocName?.message}
                        fullWidth
                      />
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                    <Controller
                      name="hOPocEmail"
                      control={control}
                      rules={{ required: "HO POC Email is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="HO POC Email"
                          error={!!errors.hOPocEmail}
                          helperText={errors.hOPocEmail?.message}
                          fullWidth
                        />
                      )}
                    />
                    <Controller
                      name="hOPocPhone"
                      control={control}
                      rules={{ required: "HO POC Phone is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="HO POC Phone"
                          type="number"
                          error={!!errors.hOPocPhone}
                          helperText={errors.hOPocPhone?.message}
                          fullWidth
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {/* <div className="flex items-center justify-center gap-4 mt-4">
              <PrimaryButton
                type="submit"
                title={"Submit"}
                isLoading={isMutateClientPending}
                disabled={isMutateClientPending}
              />
              <SecondaryButton handleSubmit={handleReset} title={"Reset"} />
            </div> */}
          </form>
        </div>
      </PageFrame>
    </div>
  );
};

export default VirtualOfficeForm;
