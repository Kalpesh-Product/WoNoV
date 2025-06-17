import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Chip, MenuItem, Select, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import AgTable from "../../../../components/AgTable";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import usePageDepartment from "../../../../hooks/usePageDepartment";
import useAuth from "../../../../hooks/useAuth";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PageFrame from "../../../../components/Pages/PageFrame";

const VendorOnboard = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { control, handleSubmit, reset } = useForm();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  const department = usePageDepartment();

  // Fetch states when a country is selected
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setStates(State.getStatesOfCountry(countryCode));
  };
  const handleStateChange = (state) => {
    setSelectedState(state);
    setCities(City.getCitiesOfState(selectedCountry, state));
  };
  const handleCityChange = (city) => {
    setSelectedCity(city);
    // setCities(City.getCitiesOfState(city));
  };

  const { mutate: vendorDetails, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/api/vendors/onboard-vendor`, {
        ...data,
        departmentId: department._id,
      });

      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
    },
    onError: function (data) {
      if (!department) {
        toast.error("Unauthorized, department doesn't match");
      }
      toast.error(data.response.data.message);
    },
  });

  const {
    data,
    isPending: isVendorFetchingPending,
    error,
  } = useQuery({
    queryKey: ["vendors", "6798bab9e469e809084e249e"],
    queryFn: async function () {
      const response = await axios.get(
        "/api/vendors/get-vendors/6798bab9e469e809084e249e"
      );
      return response.data;
    },
  });

  const vendorColumns = [
    {
      headerName: "S.No",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 80,
    },
    { field: "vendorID", headerName: "Vendor ID", width: 120 },
    {
      field: "vendorName",
      headerName: "Vendor Name",
      flex: 2,
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(
              `/app/dashboard/HR-dashboard/data/vendor/${params.data.vendorName}`,
              { state: params.data }
            )
          }>
          {params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      cellRenderer: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      headerName: "Action",
      field: "action",
      width: 150,
      cellRenderer: (params) => (
        <>
          <div className="flex gap-2 items-center">
            <div
              onClick={() => {
                setOpenModal(true);
                setSelectedVendor(params.data);
              }}
              className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all">
              <span className="text-subtitle">
                <MdOutlineRemoveRedEye />
              </span>
            </div>
          </div>
        </>
      ),
    },
  ];

  const rows =
    data
      ?.filter(
        (vendor) =>
          vendor.departmentId === "6798bab9e469e809084e249e" &&
          vendor.company === "6799f0cd6a01edbe1bc3fcea"
      )
      .map((vendor, index) => ({
        id: index + 1,
        vendorID: vendor._id.slice(-4).toUpperCase(),
        vendorName: vendor.name,
        address: vendor.address,
        state: vendor.state,
        country: vendor.country,
        partyType: vendor.partyType,
        assesseeOfOtherTerritory: vendor.assesseeOfOtherTerritory,
        isEcommerceOperator: vendor.isEcommerceOperator,
        isDeemedExporter: vendor.isDeemedExporter,
        isTransporter: vendor.isTransporter,
        status: vendor.status,
      })) || [];

  const onSubmit = (data) => {
    vendorDetails(data);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div className="h-[65vh] overflow-y-auto">
          <div className="py-4">
            <span className="text-title text-primary font-pmedium">
              VENDOR ONBOARDING FORM
            </span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* Section: Basic Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Basic Information
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  <Controller
                    name="name"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Vendor Name is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Vendor Name"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Email is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Email"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="mobileNo"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Mobile No is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Mobile No"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="address"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Address is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Address"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="country"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Country is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <Select
                        {...field}
                        fullWidth
                        displayEmpty
                        onChange={(e) => {
                          field.onChange(e);
                          handleCountryChange(e.target.value);
                        }}
                        size="small"
                        error={!!error}>
                        <MenuItem value="">Select Country</MenuItem>
                        {countries.map((country) => (
                          <MenuItem
                            key={country.isoCode}
                            value={country.isoCode}>
                            {country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="state"
                    control={control}
                    defaultValue=""
                    rules={{ required: "State is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <Select
                        {...field}
                        fullWidth
                        displayEmpty
                        onChange={(e) => {
                          field.onChange(e);
                          handleStateChange(e.target.value);
                        }}
                        size="small"
                        disabled={!selectedCountry}
                        error={!!error}>
                        <MenuItem value="">Select State</MenuItem>
                        {states.map((state) => (
                          <MenuItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="city"
                    control={control}
                    defaultValue=""
                    rules={{ required: "City is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <Select
                        {...field}
                        fullWidth
                        displayEmpty
                        onChange={(e) => {
                          field.onChange(e);

                          handleCityChange(e.target.value);
                        }}
                        size="small"
                        disabled={!selectedState}
                        error={!!error}>
                        <MenuItem value="">Select City</MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city.isoCode} value={city.name}>
                            {city.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="pinCode"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Pin Code is required",
                      pattern: {
                        value: /^[1-9][0-9]{5}$/,
                        message: "Invalid Pin Code (e.g., 560001)",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Pin Code"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="panIdNo"
                    control={control}
                    defaultValue=""
                    rules={{
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: "Invalid PAN (e.g., ABCDE1234F)",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="PAN IT No"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="companyName"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Company Name is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Company Name"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="panIdNo"
                    control={control}
                    defaultValue=""
                    rules={{
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: "Invalid PAN (e.g., ABCDE1234F)",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="PAN IT No"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                {/* Section: Other Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Other Information
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {/* <Controller
                  name="assesseeOfOtherTerritory"
                  control={control}
                  defaultValue=""
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      fullWidth
                      size="small"
                      {...field}
                      displayEmpty
                      error={!!error}
                    >
                      <MenuItem disabled value="">
                        Assessee Of Other Territory
                      </MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  )}
                /> */}
                  {/* 
                <Controller
                  name="isEcommerceOperator"
                  control={control}
                  defaultValue=""
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      fullWidth
                      size="small"
                      {...field}
                      displayEmpty
                      error={!!error}
                    >
                      <MenuItem disabled value="">
                        Is Ecommerce Operator
                      </MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  )}
                /> */}

                  {/* <Controller
                  name="isDeemedExporter"
                  control={control}
                  defaultValue=""
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      fullWidth
                      size="small"
                      {...field}
                      displayEmpty
                      error={!!error}
                    >
                      <MenuItem disabled value="">
                        Is Deemed Exporter
                      </MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  )}
                /> */}

                  <Controller
                    name="partyType"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Party Type is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <Select
                        {...field}
                        size="small"
                        displayEmpty
                        error={!!error}>
                        <MenuItem value="">Party Type</MenuItem>
                        <MenuItem value="Domestic">Domestic</MenuItem>
                        <MenuItem value="International">International</MenuItem>
                      </Select>
                    )}
                  />

                  <Controller
                    name="gstIn"
                    control={control}
                    defaultValue=""
                    rules={{
                      pattern: {
                        value:
                          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
                        message: "Invalid GST IN",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="GST IN"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </div>
                {/* Section: Bank Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Bank Information
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  <Controller
                    name="ifscCode"
                    control={control}
                    defaultValue=""
                    rules={{ required: "IFSC Code is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="IFSC Code"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="bankName"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Bank Name is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Bank Name"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="branchName"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Branch Name is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Branch Name"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="nameOnAccount"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Name On Account is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Name On Account"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="accountNumber"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Account Number is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Account Number"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex items-center justify-center gap-4">
              <PrimaryButton type="submit" title={"Submit"} />
              <SecondaryButton
                handleSubmit={handleReset}
                title={"Reset"}
                type="button"
              />
            </div>
          </form>
        </div>
      </PageFrame>
      <PageFrame>
        <div>
          <div>
            <AgTable
              search={true}
              searchColumn={"Vendor"}
              tableTitle={"List of Vendors"}
              data={rows}
              columns={vendorColumns}
            />
          </div>
        </div>
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedVendor(null);
        }}
        title="Vendor Details">
        <div className="flex flex-col gap-3">
          <>
            <DetalisFormatted
              title="Vendor Name"
              detail={selectedVendor?.vendorName}
            />
            <DetalisFormatted
              title="Vendor ID"
              detail={selectedVendor?.vendorID}
            />
            <DetalisFormatted
              title="Address"
              detail={selectedVendor?.address}
            />
            <DetalisFormatted
              title="Country"
              detail={selectedVendor?.country}
            />
            <DetalisFormatted title="State" detail={selectedVendor?.state} />
            <DetalisFormatted
              title="Party Type"
              detail={selectedVendor?.partyType}
            />
            <DetalisFormatted title="Status" detail={selectedVendor?.status} />
          </>
        </div>
      </MuiModal>
    </div>
  );
};

export default VendorOnboard;
