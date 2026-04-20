
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { LuImageUp } from "react-icons/lu";
import dayjs from "dayjs";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import AgTable from "../../components/AgTable";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { queryClient } from "../../main";
import humanTime from "../../utils/humanTime";

const PURPOSE_OPTIONS = ["Meeting", "Full Day Pass", "Half Day Pass"];

const resolveCompany = (visitor = {}) =>
  visitor?.visitorCompany
  || visitor?.brandName
  || visitor?.registeredClientCompany
  || "N/A";

const resolveToMeet = (visitor = {}) => {
  if (visitor?.toMeet?.firstName || visitor?.toMeet?.lastName) {
    return `${visitor?.toMeet?.firstName || ""} ${visitor?.toMeet?.lastName || ""}`.trim();
  }

  if (visitor?.clientToMeet?.employeeName) {
    return visitor.clientToMeet.employeeName;
  }

  if (typeof visitor?.toMeet === "string" && visitor.toMeet.trim()) {
    return visitor.toMeet;
  }

  return "N/A";
};

const resolveUserName = (user = {}) => {
  if (user?.firstName || user?.lastName) {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  }

  if (typeof user === "string" && user.trim()) {
    return user;
  }

  return "N/A";
};

const resolvePurposeType = (purpose = "") => {
  const normalized = purpose.trim().toLowerCase();

  if (normalized === "full day pass") return "Full-Day Pass";
  if (normalized === "half day pass") return "Half-Day Pass";
  return "Meeting";
};

const UploadFileField = ({
  value,
  onChange,
  label = "Upload File",
  inputId,
}) => (
  <>
    <input
      id={inputId}
      type="file"
      accept=".pdf,.doc,.docx"
      className="hidden"
      onChange={(event) => onChange(event.target.files?.[0] || null)}
    />
    <TextField
      value={value?.name || ""}
      placeholder={label}
      size="small"
      fullWidth
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            <label htmlFor={inputId}>
              <LuImageUp className="text-[#1976d2] text-[24px] cursor-pointer" />
            </label>
          </InputAdornment>
        ),
      }}
    />
  </>
);

const resolveBuildingName = (visitor = {}, locations = []) => {
  if (visitor?.building?.buildingName) return visitor.building.buildingName;
  if (visitor?.building?._id) {
    return locations.find((loc) => String(loc._id) === String(visitor.building._id))
      ?.buildingName || "N/A";
  }
  if (typeof visitor?.building === "string") {
    return locations.find((loc) => String(loc._id) === String(visitor.building))
      ?.buildingName || "N/A";
  }
  return "N/A";
};

const resolveUnitName = (visitor = {}, units = []) => {
  if (visitor?.unit?.unitNo || visitor?.unit?.name) {
    return visitor.unit.unitNo || visitor.unit.name;
  }
  if (visitor?.unit?._id) {
    const unit = units.find((item) => String(item._id) === String(visitor.unit._id));
    return unit?.unitNo || unit?.name || "N/A";
  }
  if (typeof visitor?.unit === "string") {
    const unit = units.find((item) => String(item._id) === String(visitor.unit));
    return unit?.unitNo || unit?.name || "N/A";
  }
  return "N/A";
};

const ConvertInternalVisitors = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const locationOptions = auth?.user?.company?.workLocations || [];

  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      visitorName: "",
      visitorCompany: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      sector: "",
      country: "IN",
      state: "",
      city: "",
      location: "",
      unit: "",
      registeredClientCompany: "",
      brandName: "",
      gstNumber: "",
      panNumber: "",
      idType: "",
      idNumber: "",
      purposeOfVisit: "",
      checkIn: null,
      checkOut: null,
      gstFile: null,
      panFile: null,
      idProofFile: null,
    },
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const selectedLocation = watch("location");
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const { data: unitsData = [] } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return response.data || [];
    },
  });

  const filteredUnits = useMemo(() => {
    if (!selectedLocation) return unitsData;

    return unitsData.filter((unit) => {
      const unitBuildingId = unit?.building?._id
        || unit?.building
        || unit?.location?._id
        || unit?.location
        || unit?.workLocation
        || unit?.workLocationId;

      return String(unitBuildingId || "") === String(selectedLocation);
    });
  }, [selectedLocation, unitsData]);

  useEffect(() => {
    const countries = Country.getAllCountries();
    setCountryOptions(countries);
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setStateOptions([]);
      setCityOptions([]);
      return;
    }

    const states = State.getStatesOfCountry(selectedCountry);
    setStateOptions(states);
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedCountry || !selectedState) {
      setCityOptions([]);
      return;
    }

    const selectedStateCode = stateOptions.find(
      (state) => state.name === selectedState,
    )?.isoCode;

    if (!selectedStateCode) {
      setCityOptions([]);
      return;
    }

    const cities = City.getCitiesOfState(selectedCountry, selectedStateCode);
    setCityOptions(cities);
  }, [selectedCountry, selectedState, stateOptions]);

  const { data: visitorsData = [], isPending } = useQuery({
    queryKey: ["mix-bag-convert-internal-visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return response.data;
    },
  });

  const rows = useMemo(
    () =>
      visitorsData
        .filter((visitor) => {
          if (visitor?.visitorFlag === "Client") return false;

          const sourceDate =
            visitor?.dateOfVisit || visitor?.checkIn || visitor?.createdAt;
          const parsedDate = dayjs(sourceDate);
          if (!parsedDate.isValid()) return true;

          return parsedDate.startOf("day").isBefore(dayjs().startOf("day"));
        })
        .map((visitor, index) => ({
          srNo: index + 1,
          id: visitor._id,
          visitorName:
            `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim() || "N/A",
          company: resolveCompany(visitor),
          raw: visitor,
        })),
    [visitorsData],
  );

  const { mutate: convertVisitor, isPending: isConverting } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        `/api/visitors/convettoclient/${selectedVisitor?.id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Visitor converted to client successfully.");
      setIsConvertModalOpen(false);
      setSelectedVisitor(null);
      queryClient.invalidateQueries({ queryKey: ["mix-bag-convert-internal-visitors"] });
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to convert visitor.");
    },
  });

  const openViewModal = (row) => {
    setSelectedVisitor(row);
    setIsViewModalOpen(true);
  };

  const openConvertModal = (row) => {
    const visitor = row?.raw || {};

    setSelectedVisitor(row);
    reset({
      visitorName: `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim(),
      visitorCompany: resolveCompany(visitor),
      email: visitor?.email || "",
      phoneNumber: visitor?.phoneNumber || "",
      gender: visitor?.gender || "",
      sector: visitor?.sector || "",
      country: "IN",
      state: visitor?.state || "",
      city: visitor?.city || "",
      location:
        visitor?.building?._id
        || (typeof visitor?.building === "string" ? visitor.building : ""),
      unit: visitor?.unit?._id || (typeof visitor?.unit === "string" ? visitor.unit : ""),
      registeredClientCompany: visitor?.registeredClientCompany || "",
      brandName: visitor?.brandName || "",
      gstNumber: visitor?.gstNumber || "",
      panNumber: visitor?.panNumber || "",
      idType: "",
      idNumber: "",
      purposeOfVisit: visitor?.purposeOfVisit || "",
      checkIn: dayjs(),
      checkOut: null,
      gstFile: null,
      panFile: null,
      idProofFile: null,
    });
    setIsConvertModalOpen(true);
  };

  const onSubmitConvert = (formData) => {
    const sourceVisitor = selectedVisitor?.raw || {};
    const payload = new FormData();

    payload.append("visitorFlag", "Client");
    payload.append("firstName", sourceVisitor?.firstName || "");
    payload.append("lastName", sourceVisitor?.lastName || "");
    payload.append("email", formData.email || "");
    payload.append("phoneNumber", formData.phoneNumber || "");
    payload.append("gender", formData.gender || "");
    payload.append("sector", formData.sector || "");
    payload.append("country", formData.country || "IN");
    payload.append("state", formData.state || "");
    payload.append("city", formData.city || "");
    payload.append("building", formData.location || "");
    payload.append("unit", formData.unit || "");
    payload.append("registeredClientCompany", formData.registeredClientCompany || "");
    payload.append("brandName", formData.brandName || "");
    payload.append("visitorCompany", formData.visitorCompany || "");
    payload.append("gstNumber", formData.gstNumber || "");
    payload.append("panNumber", formData.panNumber || "");
    payload.append("purposeOfVisit", formData.purposeOfVisit || "");
    payload.append("visitorType", resolvePurposeType(formData.purposeOfVisit));
    const now = dayjs();
    const checkInIso = formData.checkIn
      ? now
        .hour(formData.checkIn.hour())
        .minute(formData.checkIn.minute())
        .second(0)
        .millisecond(0)
        .toISOString()
      : "";
    const checkOutIso = formData.checkOut
      ? now
        .hour(formData.checkOut.hour())
        .minute(formData.checkOut.minute())
        .second(0)
        .millisecond(0)
        .toISOString()
      : "";

    payload.append("checkIn", checkInIso);
    payload.append("checkOut", checkOutIso);
    payload.append(
      "idProof",
      JSON.stringify({
        idType: formData.idType || "",
        idNumber: formData.idNumber || "",
      }),
    );

    if (formData.gstFile) payload.append("gstFile", formData.gstFile);
    if (formData.panFile) payload.append("panFile", formData.panFile);
    if (formData.idProofFile) payload.append("otherFile", formData.idProofFile);

    convertVisitor(payload);
  };

  const columns = [
    { field: "srNo", headerName: "Sr. No." },
    { field: "visitorName", headerName: "Visitor Name", flex: 1 },
    { field: "company", headerName: "Company", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      pinned: "right",
      cellRenderer: ({ data }) => (
        <div className="flex items-center gap-2">
          <div
            role="button"
            className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
            onClick={() => openViewModal(data)}
          >
            <MdOutlineRemoveRedEye />
          </div>

          <ThreeDotMenu
            menuItems={[
              {
                label: "Convert to Client",
                onClick: () => openConvertModal(data),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const visitorDetails = selectedVisitor?.raw || {};

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          search
          loading={isPending}
          tableTitle="Convert Internal Visitors"
          data={rows}
          columns={columns}
        />
      </PageFrame>

      <MuiModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedVisitor(null);
        }}
        title="VISITOR DETAILS"
      >
        <div className="grid grid-cols-1 gap-4">
          <DetalisFormatted title="First Name" detail={visitorDetails?.firstName || "-"} />
          <DetalisFormatted title="Last Name" detail={visitorDetails?.lastName || "-"} />
          <DetalisFormatted title="Email" detail={visitorDetails?.email || "-"} />
          <DetalisFormatted title="Phone Number" detail={visitorDetails?.phoneNumber || "-"} />
          <DetalisFormatted title="Purpose" detail={visitorDetails?.purposeOfVisit || "-"} />
          <DetalisFormatted title="Visitor Type" detail={visitorDetails?.visitorType} />
          <DetalisFormatted title="Visitor Company" detail={resolveCompany(visitorDetails)} />
          <DetalisFormatted title="To Meet" detail={resolveToMeet(visitorDetails)} />
          <DetalisFormatted
            title="Building"
            detail={resolveBuildingName(visitorDetails, locationOptions)}
          />
          <DetalisFormatted
            title="Unit"
            detail={resolveUnitName(visitorDetails, unitsData)}
          />
          <DetalisFormatted
            title="Date of Visit"
            detail={
              visitorDetails?.dateOfVisit
                ? dayjs(visitorDetails.dateOfVisit).format("DD-MM-YYYY")
                : "N/A"
            }
          />
          <DetalisFormatted title="Check In" detail={humanTime(visitorDetails?.checkIn)} />
          <DetalisFormatted title="Check In By" detail={resolveUserName(visitorDetails?.checkedInBy)} />
          <DetalisFormatted
            title="Check Out"
            detail={visitorDetails?.checkOut ? humanTime(visitorDetails?.checkOut) : "-"}
          />
          <DetalisFormatted title="Check Out By" detail={resolveUserName(visitorDetails?.checkedOutBy)} />
        </div>
      </MuiModal>

      <MuiModal
        open={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setSelectedVisitor(null);
        }}
        title="Convert to Client"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={handleSubmit(onSubmitConvert)} className="grid grid-cols-1 gap-4">
          <Controller
            name="visitorName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Visitor Name" size="small" disabled fullWidth />
            )}
          />

          <Controller
            name="visitorCompany"
            control={control}
            rules={{ required: "Company is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Company"
                size="small"
                disabled
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  size="small"
                  fullWidth
                  disabled={Boolean(selectedVisitor?.raw?.email)}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  size="small"
                  fullWidth
                  disabled={Boolean(selectedVisitor?.raw?.phoneNumber)}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              )}
            />
          </div>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Gender"
                size="small"
                fullWidth
                disabled={Boolean(selectedVisitor?.raw?.gender)}
              />
            )}
          />

          <Controller
            name="purposeOfVisit"
            control={control}
            rules={{ required: "Purpose of Visit is required" }}
            render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Purpose of Visit"
                size="small"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {PURPOSE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="location"
              control={control}
              rules={{ required: "Location is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Location"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(event) => {
                    field.onChange(event);
                    setValue("unit", "");
                  }}
                >
                  <MenuItem value="">Select Location</MenuItem>
                  {locationOptions.map((location) => (
                    <MenuItem key={location._id} value={location._id}>
                      {location.buildingName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="unit"
              control={control}
              rules={{ required: "Unit is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Unit"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="">Select Unit</MenuItem>
                  {filteredUnits.map((unit) => (
                    <MenuItem key={unit._id} value={unit._id}>
                      {unit.unitNo || unit.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Country"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {countryOptions.map((country) => (
                    <MenuItem key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="state"
              control={control}
              rules={{ required: "State is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="State"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(event) => {
                    field.onChange(event);
                    setValue("city", "");
                  }}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {stateOptions.map((state) => (
                    <MenuItem key={state.isoCode} value={state.name}>
                      {state.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="city"
              control={control}
              rules={{ required: "City is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="City"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="">Select City</MenuItem>
                  {cityOptions.map((city) => (
                    <MenuItem key={city.name} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="sector"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sector"
                  size="small"
                  fullWidth
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="registeredClientCompany"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Registered Company" size="small" fullWidth />
              )}
            />
            <Controller
              name="brandName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Brand Name" size="small" fullWidth />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="gstNumber"
              control={control}
              rules={{ required: "GST number is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="GST Number"
                  size="small"
                  fullWidth
                  disabled={Boolean(selectedVisitor?.raw?.gstNumber)}
                  error={!!errors.gstNumber}
                  helperText={errors.gstNumber?.message}
                />
              )}
            />
            <Controller
              name="gstFile"
              control={control}
              render={({ field }) => (
                <UploadFileField
                  value={field.value}
                  onChange={field.onChange}
                  inputId="gst-file-upload"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="panNumber"
              control={control}
              rules={{ required: "PAN number is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="PAN Number"
                  size="small"
                  fullWidth
                  disabled={Boolean(selectedVisitor?.raw?.panNumber)}
                  error={!!errors.panNumber}
                  helperText={errors.panNumber?.message}
                />
              )}
            />
            <Controller
              name="panFile"
              control={control}
              render={({ field }) => (
                <UploadFileField
                  value={field.value}
                  onChange={field.onChange}
                  inputId="pan-file-upload"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="idType"
              control={control}
              rules={{ required: "ID type is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="ID Type"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="">Select ID Type</MenuItem>
                  <MenuItem value="Aadhar">Aadhar</MenuItem>
                  <MenuItem value="Driving License">Driving License</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="idNumber"
              control={control}
              rules={{ required: "ID number is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ID Number"
                  size="small"
                  fullWidth
                  error={!!errors.idNumber}
                  helperText={errors.idNumber?.message}
                />
              )}
            />
          </div>

          <Controller
            name="idProofFile"
            control={control}
            render={({ field }) => (
              <UploadFileField
                value={field.value}
                onChange={field.onChange}
                inputId="id-proof-file-upload"
              />
            )}
          />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="checkIn"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Check-In Time"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="checkOut"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Check-Out Time"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
            </div>

            <PrimaryButton
              title={isConverting ? "Converting..." : "Convert to Client"}
              type="submit"
              disabled={isConverting}
            />
          </form>
        </LocalizationProvider>
      </MuiModal>
    </div>
  );
};

export default ConvertInternalVisitors;

// import { useEffect, useMemo, useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { Controller, useForm } from "react-hook-form";
// import { MenuItem, TextField } from "@mui/material";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import dayjs from "dayjs";
// import { Country, State, City } from "country-state-city";
// import { toast } from "sonner";
// import AgTable from "../../components/AgTable";
// import DetalisFormatted from "../../components/DetalisFormatted";
// import MuiModal from "../../components/MuiModal";
// import PageFrame from "../../components/Pages/PageFrame";
// import PrimaryButton from "../../components/PrimaryButton";
// import ThreeDotMenu from "../../components/ThreeDotMenu";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import { queryClient } from "../../main";
// import humanTime from "../../utils/humanTime";

// const PURPOSE_OPTIONS = ["Meeting", "Full Day Pass", "Half Day Pass"];

// const resolveCompany = (visitor = {}) =>
//   visitor?.visitorCompany
//   || visitor?.brandName
//   || visitor?.registeredClientCompany
//   || "N/A";

// const resolveToMeet = (visitor = {}) => {
//   if (visitor?.toMeet?.firstName || visitor?.toMeet?.lastName) {
//     return `${visitor?.toMeet?.firstName || ""} ${visitor?.toMeet?.lastName || ""}`.trim();
//   }

//   if (visitor?.clientToMeet?.employeeName) {
//     return visitor.clientToMeet.employeeName;
//   }

//   if (typeof visitor?.toMeet === "string" && visitor.toMeet.trim()) {
//     return visitor.toMeet;
//   }

//   return "N/A";
// };

// const resolveUserName = (user = {}) => {
//   if (user?.firstName || user?.lastName) {
//     return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
//   }

//   if (typeof user === "string" && user.trim()) {
//     return user;
//   }

//   return "N/A";
// };

// const resolvePurposeType = (purpose = "") => {
//   const normalized = purpose.trim().toLowerCase();

//   if (normalized === "full day pass") return "Full-Day Pass";
//   if (normalized === "half day pass") return "Half-Day Pass";
//   return "Meeting";
// };

// const ConvertInternalVisitors = () => {
//   const axios = useAxiosPrivate();

//   const [selectedVisitor, setSelectedVisitor] = useState(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     mode: "onChange",
//     defaultValues: {
//       visitorName: "",
//       visitorCompany: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       phoneNumber: "",
//       gender: "",
//       sector: "",
//       country: "IN",
//       state: "",
//       city: "",
//       address: "",
//       registeredClientCompany: "",
//       brandName: "",
//       gstNumber: "",
//       panNumber: "",
//       idType: "",
//       idNumber: "",
//       purposeOfVisit: "",
//       checkIn: "",
//       checkOut: "",
//       gstFile: null,
//       panFile: null,
//       idProofFile: null,
//     },
//   });

//   const selectedCountry = watch("country");
//   const selectedState = watch("state");
//   const [countryOptions, setCountryOptions] = useState([]);
//   const [stateOptions, setStateOptions] = useState([]);
//   const [cityOptions, setCityOptions] = useState([]);

//   useEffect(() => {
//     const countries = Country.getAllCountries();
//     setCountryOptions(countries);
//   }, []);

//   useEffect(() => {
//     if (!selectedCountry) {
//       setStateOptions([]);
//       setCityOptions([]);
//       return;
//     }

//     const states = State.getStatesOfCountry(selectedCountry);
//     setStateOptions(states);
//   }, [selectedCountry]);

//   useEffect(() => {
//     if (!selectedCountry || !selectedState) {
//       setCityOptions([]);
//       return;
//     }

//     const selectedStateCode = stateOptions.find(
//       (state) => state.name === selectedState,
//     )?.isoCode;

//     if (!selectedStateCode) {
//       setCityOptions([]);
//       return;
//     }

//     const cities = City.getCitiesOfState(selectedCountry, selectedStateCode);
//     setCityOptions(cities);
//   }, [selectedCountry, selectedState, stateOptions]);

//   const { data: visitorsData = [], isPending } = useQuery({
//     queryKey: ["mix-bag-convert-internal-visitors"],
//     queryFn: async () => {
//       const response = await axios.get("/api/visitors/fetch-visitors");
//       return response.data;
//     },
//   });

//   const rows = useMemo(
//     () =>
//       visitorsData
//         .filter((visitor) => visitor?.visitorFlag !== "Client")
//         .map((visitor, index) => ({
//           srNo: index + 1,
//           id: visitor._id,
//           visitorName:
//             `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim() || "N/A",
//           company: resolveCompany(visitor),
//           raw: visitor,
//         })),
//     [visitorsData],
//   );

//   const { mutate: convertVisitor, isPending: isConverting } = useMutation({
//     mutationFn: async (payload) => {
//       const response = await axios.patch(
//         `/api/visitors/update-visitor/${selectedVisitor?.id}`,
//         payload,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         },
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Visitor converted to client successfully.");
//       setIsConvertModalOpen(false);
//       setSelectedVisitor(null);
//       queryClient.invalidateQueries({ queryKey: ["mix-bag-convert-internal-visitors"] });
//       queryClient.invalidateQueries({ queryKey: ["visitors"] });
//       queryClient.invalidateQueries({ queryKey: ["clients"] });
//       reset();
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "Failed to convert visitor.");
//     },
//   });

//   const openViewModal = (row) => {
//     setSelectedVisitor(row);
//     setIsViewModalOpen(true);
//   };

//   const openConvertModal = (row) => {
//     const visitor = row?.raw || {};

//     setSelectedVisitor(row);
//     reset({
//       visitorName: `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim(),
//       visitorCompany: resolveCompany(visitor),
//       email: visitor?.email || "",
//       phoneNumber: visitor?.phoneNumber || "",
//       gender: visitor?.gender || "",
//       sector: visitor?.sector || "",
//       country: "IN",
//       state: visitor?.state || "",
//       city: visitor?.city || "",
//       address: visitor?.address || "",
//       registeredClientCompany: visitor?.registeredClientCompany || "",
//       brandName: visitor?.brandName || "",
//       gstNumber: visitor?.gstNumber || "",
//       panNumber: visitor?.panNumber || "",
//       idType: visitor?.idProof?.idType || "",
//       idNumber: visitor?.idProof?.idNumber || "",
//       purposeOfVisit: visitor?.purposeOfVisit || "",
//       checkIn: visitor?.checkIn ? dayjs(visitor.checkIn).format("YYYY-MM-DDTHH:mm") : "",
//       checkOut: visitor?.checkOut ? dayjs(visitor.checkOut).format("YYYY-MM-DDTHH:mm") : "",
//       gstFile: null,
//       panFile: null,
//       idProofFile: null,
//     });
//     setIsConvertModalOpen(true);
//   };

//   const onSubmitConvert = (formData) => {
//     const sourceVisitor = selectedVisitor?.raw || {};
//     const payload = new FormData();

//     payload.append("visitorFlag", "Client");
//     payload.append("firstName", sourceVisitor?.firstName || "");
//     payload.append("lastName", sourceVisitor?.lastName || "");
//     payload.append("email", formData.email || "");
//     payload.append("phoneNumber", formData.phoneNumber || "");
//     payload.append("gender", formData.gender || "");
//     payload.append("sector", formData.sector || "");
//     payload.append("country", formData.country || "IN");
//     payload.append("state", formData.state || "");
//     payload.append("city", formData.city || "");
//     payload.append("address", formData.address || "");
//     payload.append("registeredClientCompany", formData.registeredClientCompany || "");
//     payload.append("brandName", formData.brandName || "");
//     payload.append("visitorCompany", formData.visitorCompany || "");
//     payload.append("gstNumber", formData.gstNumber || "");
//     payload.append("panNumber", formData.panNumber || "");
//     payload.append("purposeOfVisit", formData.purposeOfVisit || "");
//     payload.append("visitorType", resolvePurposeType(formData.purposeOfVisit));
//     payload.append("checkIn", formData.checkIn ? dayjs(formData.checkIn).toISOString() : "");
//     payload.append("checkOut", formData.checkOut ? dayjs(formData.checkOut).toISOString() : "");
//     payload.append(
//       "idProof",
//       JSON.stringify({
//         idType: formData.idType || "",
//         idNumber: formData.idNumber || "",
//       }),
//     );

//     if (formData.gstFile) payload.append("gstFile", formData.gstFile);
//     if (formData.panFile) payload.append("panFile", formData.panFile);
//     if (formData.idProofFile) payload.append("otherFile", formData.idProofFile);

//     convertVisitor(payload);
//   };

//   const columns = [
//     { field: "srNo", headerName: "Sr. No." },
//     { field: "visitorName", headerName: "Visitor Name", flex: 1 },
//     { field: "company", headerName: "Company", flex: 1 },
//     {
//       field: "action",
//       headerName: "Action",
//       pinned: "right",
//       cellRenderer: ({ data }) => (
//         <div className="flex items-center gap-2">
//           <div
//             role="button"
//             className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
//             onClick={() => openViewModal(data)}
//           >
//             <MdOutlineRemoveRedEye />
//           </div>

//           <ThreeDotMenu
//             menuItems={[
//               {
//                 label: "Convert to Client",
//                 onClick: () => openConvertModal(data),
//               },
//             ]}
//           />
//         </div>
//       ),
//     },
//   ];

//   const visitorDetails = selectedVisitor?.raw || {};

//   return (
//     <div className="p-4">
//       <PageFrame>
//         <AgTable
//           search
//           loading={isPending}
//           tableTitle="Convert Internal Visitors"
//           data={rows}
//           columns={columns}
//         />
//       </PageFrame>

//       <MuiModal
//         open={isViewModalOpen}
//         onClose={() => {
//           setIsViewModalOpen(false);
//           setSelectedVisitor(null);
//         }}
//         title="VISITOR DETAILS"
//       >
//         <div className="grid grid-cols-1 gap-4">
//           <DetalisFormatted title="First Name" detail={visitorDetails?.firstName || "-"} />
//           <DetalisFormatted title="Last Name" detail={visitorDetails?.lastName || "-"} />
//           <DetalisFormatted title="Email" detail={visitorDetails?.email || "-"} />
//           <DetalisFormatted title="Phone Number" detail={visitorDetails?.phoneNumber || "-"} />
//           <DetalisFormatted title="Purpose" detail={visitorDetails?.purposeOfVisit || "-"} />
//           <DetalisFormatted title="Visitor Type" detail={visitorDetails?.visitorType} />
//           <DetalisFormatted title="Visitor Company" detail={resolveCompany(visitorDetails)} />
//           <DetalisFormatted title="To Meet" detail={resolveToMeet(visitorDetails)} />
//           <DetalisFormatted
//             title="Building"
//             detail={visitorDetails?.building?.buildingName || "N/A"}
//           />
//           <DetalisFormatted
//             title="Unit"
//             detail={visitorDetails?.unit?.unitNo || visitorDetails?.unit?.name || "N/A"}
//           />
//           <DetalisFormatted
//             title="Date of Visit"
//             detail={
//               visitorDetails?.dateOfVisit
//                 ? dayjs(visitorDetails.dateOfVisit).format("DD-MM-YYYY")
//                 : "N/A"
//             }
//           />
//           <DetalisFormatted title="Check In" detail={humanTime(visitorDetails?.checkIn)} />
//           <DetalisFormatted title="Check In By" detail={resolveUserName(visitorDetails?.checkedInBy)} />
//           <DetalisFormatted
//             title="Check Out"
//             detail={visitorDetails?.checkOut ? humanTime(visitorDetails?.checkOut) : "-"}
//           />
//           <DetalisFormatted title="Check Out By" detail={resolveUserName(visitorDetails?.checkedOutBy)} />
//         </div>
//       </MuiModal>

//       <MuiModal
//         open={isConvertModalOpen}
//         onClose={() => {
//           setIsConvertModalOpen(false);
//           setSelectedVisitor(null);
//         }}
//         title="Convert to Client"
//       >
//         <form onSubmit={handleSubmit(onSubmitConvert)} className="grid grid-cols-1 gap-4">
//           <Controller
//             name="visitorName"
//             control={control}
//             render={({ field }) => (
//               <TextField {...field} label="Visitor Name" size="small" disabled fullWidth />
//             )}
//           />

//           <Controller
//             name="visitorCompany"
//             control={control}
//             rules={{ required: "Company is required" }}
//             render={({ field, fieldState }) => (
//               <TextField
//                 {...field}
//                 label="Company"
//                 size="small"
//                 disabled
//                 fullWidth
//                 error={!!fieldState.error}
//                 helperText={fieldState.error?.message}
//               />
//             )}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="email"
//               control={control}
//               rules={{ required: "Email is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Email"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.email)}
//                   error={!!errors.email}
//                   helperText={errors.email?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="phoneNumber"
//               control={control}
//               rules={{ required: "Phone number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Phone Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.phoneNumber)}
//                   error={!!errors.phoneNumber}
//                   helperText={errors.phoneNumber?.message}
//                 />
//               )}
//             />
//           </div>

//           <Controller
//             name="gender"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 label="Gender"
//                 size="small"
//                 fullWidth
//                 disabled={Boolean(selectedVisitor?.raw?.gender)}
//               />
//             )}
//           />

//           <Controller
//             name="purposeOfVisit"
//             control={control}
//             rules={{ required: "Purpose of Visit is required" }}
//             render={({ field, fieldState }) => (
//               <TextField
//                 {...field}
//                 select
//                 label="Purpose of Visit"
//                 size="small"
//                 fullWidth
//                 error={!!fieldState.error}
//                 helperText={fieldState.error?.message}
//               >
//                 {PURPOSE_OPTIONS.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             )}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="registeredClientCompany"
//               control={control}
//               render={({ field }) => (
//                 <TextField {...field} label="Registered Company" size="small" fullWidth />
//               )}
//             />
//             <Controller
//               name="brandName"
//               control={control}
//               render={({ field }) => (
//                 <TextField {...field} label="Brand Name" size="small" fullWidth />
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="gstNumber"
//               control={control}
//               rules={{ required: "GST number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="GST Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.gstNumber)}
//                   error={!!errors.gstNumber}
//                   helperText={errors.gstNumber?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="panNumber"
//               control={control}
//               rules={{ required: "PAN number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="PAN Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.panNumber)}
//                   error={!!errors.panNumber}
//                   helperText={errors.panNumber?.message}
//                 />
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="idType"
//               control={control}
//               rules={{ required: "ID type is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="ID Type"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.idProof?.idType)}
//                   error={!!errors.idType}
//                   helperText={errors.idType?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="idNumber"
//               control={control}
//               rules={{ required: "ID number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="ID Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.idProof?.idNumber)}
//                   error={!!errors.idNumber}
//                   helperText={errors.idNumber?.message}
//                 />
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="sector"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Sector"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.sector)}
//                 />
//               )}
//             />
//             <Controller
//               name="country"
//               control={control}
//               rules={{ required: "Country is required" }}
//               render={({ field, fieldState }) => (
//                 <TextField
//                   {...field}
//                   select
//                   label="Country"
//                   size="small"
//                   fullWidth
//                   error={!!fieldState.error}
//                   helperText={fieldState.error?.message}
//                 >
//                   {countryOptions.map((country) => (
//                     <MenuItem key={country.isoCode} value={country.isoCode}>
//                       {country.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="state"
//               control={control}
//               rules={{ required: "State is required" }}
//               render={({ field, fieldState }) => (
//                 <TextField
//                   {...field}
//                   select
//                   label="State"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.state)}
//                   error={!!fieldState.error}
//                   helperText={fieldState.error?.message}
//                   onChange={(event) => {
//                     field.onChange(event);
//                     setValue("city", "");
//                   }}
//                 >
//                   <MenuItem value="">Select State</MenuItem>
//                   {stateOptions.map((state) => (
//                     <MenuItem key={state.isoCode} value={state.name}>
//                       {state.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               )}
//             />
//             <Controller
//               name="city"
//               control={control}
//               rules={{ required: "City is required" }}
//               render={({ field, fieldState }) => (
//                 <TextField
//                   {...field}
//                   select
//                   label="City"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.city)}
//                   error={!!fieldState.error}
//                   helperText={fieldState.error?.message}
//                 >
//                   <MenuItem value="">Select City</MenuItem>
//                   {cityOptions.map((city) => (
//                     <MenuItem key={city.name} value={city.name}>
//                       {city.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="checkIn"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Check In"
//                   type="datetime-local"
//                   size="small"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                 />
//               )}
//             />
//             <Controller
//               name="checkOut"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Check Out"
//                   type="datetime-local"
//                   size="small"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                 />
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Controller
//               name="gstFile"
//               control={control}
//               render={({ field: { onChange, ...field } }) => (
//                 <TextField
//                   {...field}
//                   type="file"
//                   size="small"
//                   label="GST File Upload"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                   inputProps={{ accept: ".pdf,.doc,.docx" }}
//                   onChange={(event) => onChange(event.target.files?.[0] || null)}
//                 />
//               )}
//             />
//             <Controller
//               name="panFile"
//               control={control}
//               render={({ field: { onChange, ...field } }) => (
//                 <TextField
//                   {...field}
//                   type="file"
//                   size="small"
//                   label="PAN File Upload"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                   inputProps={{ accept: ".pdf,.doc,.docx" }}
//                   onChange={(event) => onChange(event.target.files?.[0] || null)}
//                 />
//               )}
//             />
//             <Controller
//               name="idProofFile"
//               control={control}
//               render={({ field: { onChange, ...field } }) => (
//                 <TextField
//                   {...field}
//                   type="file"
//                   size="small"
//                   label="ID Proof Upload"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                   inputProps={{ accept: ".pdf,.doc,.docx" }}
//                   onChange={(event) => onChange(event.target.files?.[0] || null)}
//                 />
//               )}
//             />
//           </div>

//           <Controller
//             name="address"
//             control={control}
//             render={({ field }) => (
//               <TextField {...field} label="Address" size="small" fullWidth multiline minRows={2} />
//             )}
//           />

//           <PrimaryButton
//             title={isConverting ? "Converting..." : "Convert to Client"}
//             type="submit"
//             disabled={isConverting}
//           />
//         </form>
//       </MuiModal>
//     </div>
//   );
// };

// export default ConvertInternalVisitors;

// import { useMemo, useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { Controller, useForm } from "react-hook-form";
// import { MenuItem, TextField } from "@mui/material";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import dayjs from "dayjs";
// import { toast } from "sonner";
// import AgTable from "../../components/AgTable";
// import DetalisFormatted from "../../components/DetalisFormatted";
// import MuiModal from "../../components/MuiModal";
// import PageFrame from "../../components/Pages/PageFrame";
// import PrimaryButton from "../../components/PrimaryButton";
// import ThreeDotMenu from "../../components/ThreeDotMenu";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import { queryClient } from "../../main";
// import humanTime from "../../utils/humanTime";

// const PURPOSE_OPTIONS = ["Meeting", "Full Day Pass", "Half Day Pass", "Client Conversion"];

// const resolveCompany = (visitor = {}) =>
//   visitor?.visitorCompany
//   || visitor?.brandName
//   || visitor?.registeredClientCompany
//   || "N/A";

// const resolveToMeet = (visitor = {}) => {
//   if (visitor?.toMeet?.firstName || visitor?.toMeet?.lastName) {
//     return `${visitor?.toMeet?.firstName || ""} ${visitor?.toMeet?.lastName || ""}`.trim();
//   }

//   if (visitor?.clientToMeet?.employeeName) {
//     return visitor.clientToMeet.employeeName;
//   }

//   if (typeof visitor?.toMeet === "string" && visitor.toMeet.trim()) {
//     return visitor.toMeet;
//   }

//   return "N/A";
// };

// const resolveUserName = (user = {}) => {
//   if (user?.firstName || user?.lastName) {
//     return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
//   }

//   if (typeof user === "string" && user.trim()) {
//     return user;
//   }

//   return "N/A";
// };

// const resolvePurposeType = (purpose = "") => {
//   const normalized = purpose.trim().toLowerCase();

//   if (normalized === "full day pass") return "Full-Day Pass";
//   if (normalized === "half day pass") return "Half-Day Pass";
//   return "Meeting";
// };

// const ConvertInternalVisitors = () => {
//   const axios = useAxiosPrivate();

//   const [selectedVisitor, setSelectedVisitor] = useState(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     mode: "onChange",
//     defaultValues: {
//       visitorName: "",
//       visitorCompany: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       phoneNumber: "",
//       gender: "",
//       sector: "",
//       state: "",
//       city: "",
//       address: "",
//       registeredClientCompany: "",
//       brandName: "",
//       gstNumber: "",
//       panNumber: "",
//       idType: "",
//       idNumber: "",
//       purposeOfVisit: "",
//     },
//   });

//   const { data: visitorsData = [], isPending } = useQuery({
//     queryKey: ["mix-bag-convert-internal-visitors"],
//     queryFn: async () => {
//       const response = await axios.get("/api/visitors/fetch-visitors");
//       return response.data;
//     },
//   });

//   const rows = useMemo(
//     () =>
//       visitorsData
//         .filter((visitor) => visitor?.visitorFlag !== "Client")
//         .map((visitor, index) => ({
//           srNo: index + 1,
//           id: visitor._id,
//           visitorName:
//             `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim() || "N/A",
//           company: resolveCompany(visitor),
//           raw: visitor,
//         })),
//     [visitorsData],
//   );

//   const { mutate: convertVisitor, isPending: isConverting } = useMutation({
//     mutationFn: async (payload) => {
//       const response = await axios.patch(
//         `/api/visitors/update-visitor/${selectedVisitor?.id}`,
//         payload,
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Visitor converted to client successfully.");
//       setIsConvertModalOpen(false);
//       setSelectedVisitor(null);
//       queryClient.invalidateQueries({ queryKey: ["mix-bag-convert-internal-visitors"] });
//       queryClient.invalidateQueries({ queryKey: ["visitors"] });
//       queryClient.invalidateQueries({ queryKey: ["clients"] });
//       reset();
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "Failed to convert visitor.");
//     },
//   });

//   const openViewModal = (row) => {
//     setSelectedVisitor(row);
//     setIsViewModalOpen(true);
//   };

//   const openConvertModal = (row) => {
//     const visitor = row?.raw || {};

//     setSelectedVisitor(row);
//     reset({
//       visitorName: `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim(),
//       visitorCompany: resolveCompany(visitor),
//       email: visitor?.email || "",
//       phoneNumber: visitor?.phoneNumber || "",
//       gender: visitor?.gender || "",
//       sector: visitor?.sector || "",
//       state: visitor?.state || "",
//       city: visitor?.city || "",
//       address: visitor?.address || "",
//       registeredClientCompany: visitor?.registeredClientCompany || "",
//       brandName: visitor?.brandName || "",
//       gstNumber: visitor?.gstNumber || "",
//       panNumber: visitor?.panNumber || "",
//       idType: visitor?.idProof?.idType || "",
//       idNumber: visitor?.idProof?.idNumber || "",
//       purposeOfVisit: visitor?.purposeOfVisit || "",
//     });
//     setIsConvertModalOpen(true);
//   };

//   const onSubmitConvert = (formData) => {
//     const sourceVisitor = selectedVisitor?.raw || {};

//     convertVisitor({
//       visitorFlag: "Client",
//       firstName: sourceVisitor?.firstName || "",
//       lastName: sourceVisitor?.lastName || "",
//       email: formData.email,
//       phoneNumber: formData.phoneNumber,
//       gender: formData.gender,
//       sector: formData.sector,
//       state: formData.state,
//       city: formData.city,
//       address: formData.address,
//       registeredClientCompany: formData.registeredClientCompany,
//       brandName: formData.brandName,
//       visitorCompany: formData.visitorCompany,
//       gstNumber: formData.gstNumber,
//       panNumber: formData.panNumber,
//       idProof: {
//         idType: formData.idType,
//         idNumber: formData.idNumber,
//       },
//       purposeOfVisit: formData.purposeOfVisit,
//       visitorType: resolvePurposeType(formData.purposeOfVisit),
//     });
//   };

//   const columns = [
//     { field: "srNo", headerName: "Sr. No." },
//     { field: "visitorName", headerName: "Visitor Name", flex: 1 },
//     { field: "company", headerName: "Company", flex: 1 },
//     {
//       field: "action",
//       headerName: "Action",
//       pinned: "right",
//       cellRenderer: ({ data }) => (
//         <div className="flex items-center gap-2">
//           <div
//             role="button"
//             className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
//             onClick={() => openViewModal(data)}
//           >
//             <MdOutlineRemoveRedEye />
//           </div>

//           <ThreeDotMenu
//             menuItems={[
//               {
//                 label: "Convert to Client",
//                 onClick: () => openConvertModal(data),
//               },
//             ]}
//           />
//         </div>
//       ),
//     },
//   ];

//   const visitorDetails = selectedVisitor?.raw || {};

//   return (
//     <div className="p-4">
//       <PageFrame>
//         <AgTable
//           search
//           loading={isPending}
//           tableTitle="Convert Internal Visitors"
//           data={rows}
//           columns={columns}
//         />
//       </PageFrame>

//       <MuiModal
//         open={isViewModalOpen}
//         onClose={() => {
//           setIsViewModalOpen(false);
//           setSelectedVisitor(null);
//         }}
//         title="VISITOR DETAILS"
//       >
//         <div className="grid grid-cols-1 gap-4">
//           <DetalisFormatted title="First Name" detail={visitorDetails?.firstName || "-"} />
//           <DetalisFormatted title="Last Name" detail={visitorDetails?.lastName || "-"} />
//           <DetalisFormatted title="Email" detail={visitorDetails?.email || "-"} />
//           <DetalisFormatted title="Phone Number" detail={visitorDetails?.phoneNumber || "-"} />
//           <DetalisFormatted title="Purpose" detail={visitorDetails?.purposeOfVisit || "-"} />
//           <DetalisFormatted title="Visitor Type" detail={visitorDetails?.visitorType} />
//           <DetalisFormatted title="Visitor Company" detail={resolveCompany(visitorDetails)} />
//           <DetalisFormatted title="To Meet" detail={resolveToMeet(visitorDetails)} />
//           <DetalisFormatted
//             title="Building"
//             detail={visitorDetails?.building?.buildingName || "N/A"}
//           />
//           <DetalisFormatted
//             title="Unit"
//             detail={visitorDetails?.unit?.unitNo || visitorDetails?.unit?.name || "N/A"}
//           />
//           <DetalisFormatted
//             title="Date of Visit"
//             detail={
//               visitorDetails?.dateOfVisit
//                 ? dayjs(visitorDetails.dateOfVisit).format("DD-MM-YYYY")
//                 : "N/A"
//             }
//           />
//           <DetalisFormatted title="Check In" detail={humanTime(visitorDetails?.checkIn)} />
//           <DetalisFormatted title="Check In By" detail={resolveUserName(visitorDetails?.checkedInBy)} />
//           <DetalisFormatted
//             title="Check Out"
//             detail={visitorDetails?.checkOut ? humanTime(visitorDetails?.checkOut) : "-"}
//           />
//           <DetalisFormatted title="Check Out By" detail={resolveUserName(visitorDetails?.checkedOutBy)} />
//         </div>
//       </MuiModal>

//       <MuiModal
//         open={isConvertModalOpen}
//         onClose={() => {
//           setIsConvertModalOpen(false);
//           setSelectedVisitor(null);
//         }}
//         title="Convert to Client"
//       >
//         <form onSubmit={handleSubmit(onSubmitConvert)} className="grid grid-cols-1 gap-4">
//           <Controller
//             name="visitorName"
//             control={control}
//             render={({ field }) => (
//               <TextField {...field} label="Visitor Name" size="small" disabled fullWidth />
//             )}
//           />

//           <Controller
//             name="visitorCompany"
//             control={control}
//             rules={{ required: "Company is required" }}
//             render={({ field, fieldState }) => (
//               <TextField
//                 {...field}
//                 label="Company"
//                 size="small"
//                 disabled
//                 fullWidth
//                 error={!!fieldState.error}
//                 helperText={fieldState.error?.message}
//               />
//             )}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="email"
//               control={control}
//               rules={{ required: "Email is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Email"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.email)}
//                   error={!!errors.email}
//                   helperText={errors.email?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="phoneNumber"
//               control={control}
//               rules={{ required: "Phone number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Phone Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.phoneNumber)}
//                   error={!!errors.phoneNumber}
//                   helperText={errors.phoneNumber?.message}
//                 />
//               )}
//             />
//           </div>

//           <Controller
//             name="gender"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 label="Gender"
//                 size="small"
//                 fullWidth
//                 disabled={Boolean(selectedVisitor?.raw?.gender)}
//               />
//             )}
//           />

//           <Controller
//             name="purposeOfVisit"
//             control={control}
//             rules={{ required: "Purpose of Visit is required" }}
//             render={({ field, fieldState }) => (
//               <TextField
//                 {...field}
//                 select
//                 label="Purpose of Visit"
//                 size="small"
//                 fullWidth
//                 error={!!fieldState.error}
//                 helperText={fieldState.error?.message}
//               >
//                 {PURPOSE_OPTIONS.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             )}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="registeredClientCompany"
//               control={control}
//               render={({ field }) => (
//                 <TextField {...field} label="Registered Company" size="small" fullWidth />
//               )}
//             />
//             <Controller
//               name="brandName"
//               control={control}
//               render={({ field }) => (
//                 <TextField {...field} label="Brand Name" size="small" fullWidth />
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="gstNumber"
//               control={control}
//               rules={{ required: "GST number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="GST Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.gstNumber)}
//                   error={!!errors.gstNumber}
//                   helperText={errors.gstNumber?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="panNumber"
//               control={control}
//               rules={{ required: "PAN number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="PAN Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.panNumber)}
//                   error={!!errors.panNumber}
//                   helperText={errors.panNumber?.message}
//                 />
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="idType"
//               control={control}
//               rules={{ required: "ID type is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="ID Type"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.idProof?.idType)}
//                   error={!!errors.idType}
//                   helperText={errors.idType?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="idNumber"
//               control={control}
//               rules={{ required: "ID number is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="ID Number"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.idProof?.idNumber)}
//                   error={!!errors.idNumber}
//                   helperText={errors.idNumber?.message}
//                 />
//               )}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Controller
//               name="sector"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Sector"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.sector)}
//                 />
//               )}
//             />
//             <Controller
//               name="state"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="State"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.state)}
//                 />
//               )}
//             />
//             <Controller
//               name="city"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="City"
//                   size="small"
//                   fullWidth
//                   disabled={Boolean(selectedVisitor?.raw?.city)}
//                 />
//               )}
//             />
//           </div>

//           <Controller
//             name="address"
//             control={control}
//             render={({ field }) => (
//               <TextField {...field} label="Address" size="small" fullWidth multiline minRows={2} />
//             )}
//           />

//           <PrimaryButton
//             title={isConverting ? "Converting..." : "Convert to Client"}
//             type="submit"
//             disabled={isConverting}
//           />
//         </form>
//       </MuiModal>
//     </div>
//   );
// };

// export default ConvertInternalVisitors;