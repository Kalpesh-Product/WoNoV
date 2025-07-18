import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Chip, MenuItem, Select, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import AgTable from "./AgTable";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import usePageDepartment from "../hooks/usePageDepartment";
import useAuth from "../hooks/useAuth";
import MuiModal from "./MuiModal";
import DetalisFormatted from "./DetalisFormatted";
import PageFrame from "./Pages/PageFrame";
import { useQueryClient } from "@tanstack/react-query";
import humanDate from "../utils/humanDateForamt";
import {
  isAlphanumeric,
  isValidBankAccount,
  isValidEmail,
  isValidGSTIN,
  isValidIFSC,
  noOnlyWhitespace,
} from "../utils/validators";

const Vendor = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm({
    mode: "onChange",
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");


  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  const department = usePageDepartment();
  let departmentName = department?.name || "";

  if (department?.name === "Administration") {
    departmentName = "Admin";
  }
  if (department?.name === "Tech") {
    departmentName = "Frontend";
  }

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
      reset();
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["vendors", department._id],
      });
    },
    onError: function (data) {
      if (!department) {
        toast.error("Unauthorized, department doesn't match");
      }
      toast.error(data.response.data.message);
    },
  });



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
          <div className="flex justify-between items-center">
            <span className="text-title text-primary font-pmedium">
              VENDOR ONBOARDING FORM
            </span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                {/* Section: Basic Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Basic Information
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-4 gap-4 p-4">
                  <Controller
                    name="name"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Vendor Name is required",
                      validate: {
                        noOnlyWhitespace,
                        isAlphanumeric,
                      },
                    }}
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
                    rules={{
                      required: "Email is required",
                      validate: {
                        noOnlyWhitespace,
                        isValidEmail,
                      },
                    }}
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
                    name="mobile"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Mobile No is required",
                      validate: {
                        noOnlyWhitespace,
                      },
                    }}
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
                    rules={{
                      required: "Address is required",
                      validate: {
                        noOnlyWhitespace,
                      },
                    }}
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
                        error={!!error}
                      >
                        <MenuItem value="">Select Country</MenuItem>
                        {countries.map((country) => (
                          <MenuItem
                            key={country.isoCode}
                            value={country.isoCode}
                          >
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
                        error={!!error}
                      >
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
                        error={!!error}
                      >
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
                      validate: {
                        noOnlyWhitespace,
                      },
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
                </div>
              </div>
              <div>
                {/* Section: Other Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Other Information
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4 p-4">
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
                        error={!!error}
                      >
                        <MenuItem value="" disabled>
                          Party Type
                        </MenuItem>
                        <MenuItem value="Domestic">Domestic</MenuItem>
                        <MenuItem value="International">International</MenuItem>
                      </Select>
                    )}
                  />
                  <Controller
                    name="companyName"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Company Name is required",
                      validate: {
                        noOnlyWhitespace,
                        isAlphanumeric,
                      },
                    }}
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
                    name="gstIn"
                    control={control}
                    defaultValue=""
                    rules={{
                      validate: {
                        noOnlyWhitespace,
                        isValidGSTIN,
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
                  <Controller
                    name="panIdNo"
                    control={control}
                    defaultValue=""
                    rules={{
                      validate: {
                        noOnlyWhitespace,
                      },
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: "Invalid PAN (e.g., ABCDE1234F)",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="PAN ID No"
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
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  <Controller
                    name="ifscCode"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "IFSC Code is required",
                      validate: {
                        noOnlyWhitespace,
                        isValidIFSC,
                      },
                    }}
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
                    rules={{
                      required: "Bank Name is required",
                      validate: {
                        noOnlyWhitespace,
                        isAlphanumeric,
                      },
                    }}
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
                    rules={{
                      required: "Branch Name is required",
                      validate: {
                        noOnlyWhitespace,
                        isAlphanumeric,
                      },
                    }}
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
                    rules={{
                      required: "Name On Account is required",
                      validate: {
                        noOnlyWhitespace,
                        isAlphanumeric,
                      },
                    }}
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
                    rules={{
                      required: "Account Number is required",
                      validate: {
                        noOnlyWhitespace,
                        isValidBankAccount,
                      },
                    }}
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

    </div>
  );
};

export default Vendor;
