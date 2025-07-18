import {
  Avatar,
  Button,
  Chip,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";
import { useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "../PrimaryButton";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const ViewVendor = () => {
  const axios = useAxiosPrivate();
  const initialValuesRef = React.useRef({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const { control, handleSubmit, reset, setValue, getValues } = useForm();

  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate()

  const { mutate: updateVendor, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/vendors/update-vendor/${data.vendorMongoId}`,
        {
          ...data,
        }
      );

      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      navigate(-1)
    },
    onError: function (data) {
      toast.error(data.response.data.message);
    },
  });

  useEffect(() => {
    if (state) {
      const mapping = {
        vendorMongoId: state.vendorMongoId,
        vendorID: state.vendorID,
        vendorName: state.vendorName,
        address: state.address,
        state: state.state,
        city: state.city,
        country: state.country,
        pinCode: state.pinCode || state.address?.match(/\b\d{6}\b/)?.[0] || "",
        email: state.email,
        mobile: state.mobile,
        gstIn: state.gstIn || "N/A",
        gst: state.gstIn || "N/A",
        partyType: state.partyType,
        registrationType: "regular", // default/fallback
        company: state.company,
        companyName: state.companyName,
        departmentId: state.departmentId,
        panIdNo: state.panIdNo,
        onboardingDate: state.onboardingDate,
        status: state.status,
        bankName: state.bankName,
        branchName: state.branchName,
        ifscCode: state.ifscCode,
        nameOnAccount: state.nameOnAccount,
        accountNumber: state.accountNumber,
        id: state.id,
      };

      const statesList = State.getStatesOfCountry(state.country);
      const citiesList = City.getCitiesOfState(state.country, state.state);
      setStates(statesList);
      setCities(citiesList);
      setSelectedCountry(state.country);
      setSelectedState(state.state);
      setSelectedCity(state.city);
      reset(mapping);
      initialValuesRef.current = mapping;
    }
  }, [state, setValue]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const getUpdatedFields = (newData, originalData) => {
    const updated = {};
    const keyMap = {
      vendorName: "name",
    };
    for (const key in newData) {
      if (newData[key] !== originalData[key]) {
        const mappedKey = keyMap[key] || key;
        updated[mappedKey] = newData[key];
      }
    }
    return updated;
  };

  const onSubmit = (data) => {
    setIsEditing(false);
    const updatedFields = getUpdatedFields(data, initialValuesRef.current);

    updateVendor({ vendorMongoId: data.vendorMongoId, ...updatedFields });
  };

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

  const handleReset = () => {
    reset();
  };

  const mailingFields = [
    "vendorName",
    "email",
    "mobile",
    "address",
    "pinCode",
    "panIdNo",
    "companyName",
    "status",
  ];

  const gstFields = ["gstIn"];

  const bankFields = [
    "ifscCode",
    "bankName",
    "branchName",
    "nameOnAccount",
    "accountNumber",
  ];

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-8 ">
        {/* <div>
          <span className="text-title text-primary font-pmedium">
            Vendor Details
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-subtitle font-pmedium text-primary"></span>
          </div>
          <div>
            <PrimaryButton handleSubmit={handleEditToggle} title={"Edit"} />
          </div>
        </div> */}

        {/* Header Row: Title & Button */}
        <div className="flex justify-between items-center">
          <span className="text-title text-primary font-pmedium">
            Vendor Details
          </span>
          <PrimaryButton handleSubmit={handleEditToggle} title="Edit" />
        </div>

        <div className="h-[51vh] overflow-y-auto">
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="pb-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      Basic Information
                    </span>
                  </div>

                  <div className="grid grid-cols sm:grid-cols-1 lg:grid-cols-1 gap-4 p-4">
                    {mailingFields.map((fieldKey) => (
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
                              </span>
                            </div>
                            <div>
                              <span>:</span>
                            </div>
                            <div className="w-full">
                              <span className="text-gray-500">
                                {getValues(fieldKey)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                    {isEditing ? (
                      <>
                        <Controller
                          name="country"
                          control={control}
                          defaultValue=""
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
                                <MenuItem
                                  key={state.isoCode}
                                  value={state.isoCode}
                                >
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
                      </>
                    ) : (
                      ["country", "state", "city"].map((fieldKey) => (
                        <div className="py-2 flex justify-between items-start gap-2">
                          <div className="w-[100%] justify-start flex">
                            <span className="font-pmedium text-gray-600 text-content">
                              {fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                          </div>
                          <div>
                            <span>:</span>
                          </div>
                          <div className="w-full">
                            <span className="text-gray-500">
                              {getValues(fieldKey)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="pb-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      Other Information
                    </span>
                  </div>

                  <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                    {gstFields.map((fieldKey) => (
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
                            <div className="w-[35%] justify-start flex">
                              <span className="font-pmedium text-gray-600 text-content">
                                {fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </span>
                            </div>
                            <div>
                              <span>:</span>
                            </div>
                            <div className="w-full">
                              <span className="text-gray-500">
                                {getValues(fieldKey)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isEditing ? (
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
                            <MenuItem value="International">
                              International
                            </MenuItem>
                          </Select>
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[35%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Party Type
                          </span>
                        </div>
                        <div>
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {state.partyType}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="pb-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      Bank Information
                    </span>
                  </div>
                  <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                    {bankFields.map((fieldKey) => (
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
                            <div className="w-[35%] justify-start flex">
                              <span className="font-pmedium text-gray-600 text-content">
                                {fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </span>
                            </div>
                            <div>
                              <span>:</span>
                            </div>
                            <div className="w-full">
                              <span className="text-gray-500">
                                {getValues(fieldKey)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-center items-center">
                  <PrimaryButton type={"submit"} title={"Submit"} />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVendor;
