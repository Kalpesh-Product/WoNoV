import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Autocomplete, Chip, MenuItem, Select, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import humanDate from "../utils/humanDateForamt";
import {
  isAlphanumeric,
  isValidBankAccount,
  isValidEmail,
  isValidGSTIN,
  isValidIFSC,
  noOnlyWhitespace,
} from "../utils/validators";

const optionalValidation = (validator) => (value) => !value || validator(value);

const VENDOR_TYPE_MANAGER_DEPARTMENT_IDS = new Set([
  "67b2cf85b9b6ed5cedeb9a2e",
  "6798ba9de469e809084e2494",
]);
const canCreateVendorTypeOption = (user) => {
  const departments = Array.isArray(user?.departments) ? user.departments : [];
  const roles = [
    ...(Array.isArray(user?.role) ? user.role : []),
    ...(Array.isArray(user?.roles) ? user.roles : []),
  ];
  const normalize = (value) => String(value || "").trim().toLowerCase();

  return (
    departments.some((department) => {
      const departmentId = String(department?._id || department || "");
      const departmentName = normalize(
        department?.name || department?.departmentName,
      );
      return (
        VENDOR_TYPE_MANAGER_DEPARTMENT_IDS.has(departmentId) ||
        ["top management", "tech", "tech department"].includes(
          departmentName,
        )
      );
    }) ||
    roles.some((role) => {
      const roleTitle = normalize(role?.roleTitle || role?.name || role);
      return (
        roleTitle.includes("top management") ||
        roleTitle.includes("tech department")
      );
    })
  );
};

const Vendor = () => {
  const { auth } = useAuth();
  const canCreateVendorType = canCreateVendorTypeOption(auth?.user);
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, setValue } = useForm({
    mode: "onChange",
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [vendorTypeOptions, setVendorTypeOptions] = useState([]);
  const [vendorTypeInput, setVendorTypeInput] = useState("");

  const { data: savedVendorTypeOptions = [] } = useQuery({
    queryKey: ["vendorTypeOptions"],
    queryFn: async () => {
      const response = await axios.get("/api/vendors/vendor-type-options");
      return response.data;
    },
  });

  useEffect(() => {
    setVendorTypeOptions(savedVendorTypeOptions);
  }, [savedVendorTypeOptions]);

  const { mutate: saveVendorTypeOption, isPending: isSavingVendorTypeOption } =
    useMutation({
      mutationFn: async (option) => {
        const response = await axios.post("/api/vendors/vendor-type-options", {
          option,
        });
        return response.data;
      },
      onSuccess: (data) => {
        setVendorTypeOptions(data.options);
        queryClient.setQueryData(["vendorTypeOptions"], data.options);
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to add vendor type",
        );
      },
    });

  const handleAddVendorType = (option = vendorTypeInput) => {
    if (!canCreateVendorType) return;

    const nextOption = String(option || "").trim();
    if (!nextOption) return;

    const existingOption = vendorTypeOptions.find(
      (item) => item.toLowerCase() === nextOption.toLowerCase(),
    );
    const selectedOption = existingOption || nextOption;

    if (!existingOption) {
      setVendorTypeOptions((options) =>
        [...options, nextOption].sort((first, second) =>
          first.localeCompare(second, undefined, { sensitivity: "base" }),
        ),
      );
      saveVendorTypeOption(nextOption);
    }

    setValue("vendorType", selectedOption, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setVendorTypeInput(selectedOption);
  };


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
      setVendorTypeInput("");
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["vendors", department._id],
      });
      navigate("..", { relative: "path" });
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
    setVendorTypeInput("");
  };
   const validateOptional = (validator) => (value) =>
    !value || validator(value);

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div className="h-[65vh] overflow-y-auto pr-2 sm:pr-4">
          <div className="flex justify-between items-center">
            <span className="text-title text-primary font-pmedium">
              VENDOR ONBOARDING FORM
            </span>
          </div>
         <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-6">  
              <div>
                {/* Section: Basic Information */}
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Basic Information
                  </span>
                </div>
                 <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-4 gap-4 py-4">
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
                  {/* <Controller
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
                  /> */}
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
                        const selectedCountryName = e.target.value;
                        const matchedCountry = countries.find(
                          (country) => country.name === selectedCountryName
                        );
                        field.onChange(selectedCountryName);
                        handleCountryChange(matchedCountry?.isoCode || "");
                      }}
                      size="small"
                      error={!!error}>
                      <MenuItem value="">Select Country</MenuItem>
                      {countries.map((country) => (
                        <MenuItem
                          key={country.isoCode}
                          value={country.name}>
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
                        const selectedStateName = e.target.value;
                        const matchedState = states.find(
                          (state) => state.name === selectedStateName
                        );
                        field.onChange(selectedStateName);
                        handleStateChange(matchedState?.isoCode || "");
                      }}
                      size="small"
                      disabled={!selectedCountry}
                      error={!!error}>
                      <MenuItem value="">Select State</MenuItem>
                      {states.map((state) => (
                        <MenuItem key={state.isoCode} value={state.name}>
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
                    // rules={{
                    //   required: "Pin Code is required",
                    //   validate: {
                    //     noOnlyWhitespace,
                    //   },
                   rules={{ 
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
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
               <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4 py-4">
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
                    name="vendorType"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Type Of Vendor is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <Autocomplete
                        freeSolo={canCreateVendorType}
                        selectOnFocus
                        clearOnBlur={false}
                        handleHomeEndKeys
                        options={vendorTypeOptions}
                        value={field.value || null}
                        inputValue={vendorTypeInput}
                        loading={isSavingVendorTypeOption}
                        onInputChange={(_event, value, reason) => {
                          if (reason !== "reset") {
                            setVendorTypeInput(value);
                          }
                        }}
                        onChange={(_event, value) => {
                          if (value && typeof value === "object") {
                            handleAddVendorType(value.inputValue);
                            return;
                          }

                          if (
                            value &&
                            !vendorTypeOptions.some(
                              (option) =>
                                option.toLowerCase() === value.toLowerCase(),
                            )
                          ) {
                            handleAddVendorType(value);
                            return;
                          }

                          field.onChange(value || "");
                          setVendorTypeInput(value || "");
                        }}
                        filterOptions={(options, params) => {
                          const typedValue = params.inputValue.trim();
                          const filteredOptions = options.filter((option) =>
                            option
                              .toLowerCase()
                              .includes(typedValue.toLowerCase()),
                          );
                          const alreadyExists = options.some(
                            (option) =>
                              option.toLowerCase() === typedValue.toLowerCase(),
                          );

                          if (
                            canCreateVendorType &&
                            typedValue &&
                            !alreadyExists
                          ) {
                            filteredOptions.push({
                              inputValue: typedValue,
                              label: `+ Add "${typedValue}"`,
                            });
                          }

                          return filteredOptions;
                        }}
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : option.label || ""
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option.inputValue || option}>
                            {typeof option === "string" ? (
                              option
                            ) : (
                              <span className="w-full px-1 py-1 text-sm font-pmedium text-[#1E3D73]">
                                {option.label}
                              </span>
                            )}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Type Of Vendor"
                            placeholder={
                              canCreateVendorType
                                ? "Select or Add Vendor Type"
                                : "Select Vendor Type"
                            }
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
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
                    // rules={{
                    //   validate: {
                    //     noOnlyWhitespace,
                    //     isValidGSTIN,
                    //   },
                    // }}
                     rules={{
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
                        isValidGSTIN: validateOptional(isValidGSTIN),
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
                    // rules={{
                    //   validate: {
                    //     noOnlyWhitespace,
                    //   },
                     rules={{
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
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
                 <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  <Controller
                    name="ifscCode"
                    control={control}
                    defaultValue=""
                    // rules={{
                    //   required: "IFSC Code is required",
                    //   validate: {
                    //     noOnlyWhitespace,
                    //     isValidIFSC,
                    //   },
                    // }}
                     rules={{
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
                        isValidIFSC: validateOptional(isValidIFSC),
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
                    // rules={{
                    //   required: "Bank Name is required",
                    //   validate: {
                    //     noOnlyWhitespace,
                    //     isAlphanumeric,
                    //   },
                    // }}
                    rules={{
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
                        isAlphanumeric: validateOptional(isAlphanumeric),
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
                    // rules={{
                    //   required: "Branch Name is required",
                    //   validate: {
                    //     noOnlyWhitespace,
                    //     isAlphanumeric,
                    //   },
                    // }}
                    rules={{
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
                        isAlphanumeric: validateOptional(isAlphanumeric),
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
                    // rules={{
                    //   required: "Name On Account is required",
                    //   validate: {
                    //     noOnlyWhitespace,
                    //     isAlphanumeric,
                    //   },
                    // }}
                     rules={{
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
                        isAlphanumeric: validateOptional(isAlphanumeric),
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
                    // rules={{
                    //   required: "Account Number is required",
                    //   validate: {
                    //     noOnlyWhitespace,
                    //     isValidBankAccount,
                    //   },
                    // }}
                     rules={{
                      validate: {
                        noOnlyWhitespace: validateOptional(noOnlyWhitespace),
                        isValidBankAccount:
                          validateOptional(isValidBankAccount),
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
