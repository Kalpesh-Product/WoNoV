import React from "react";
import { useForm, Controller } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import PageFrame from "../../../components/Pages/PageFrame";
import CountryStateCitySelector from "../../../components/CountryStateCitySelector";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import {
  isAlphanumeric,
  noOnlyWhitespace,
  isValidPhoneNumber,
  isValidPinCode,
} from "../../../utils/validators";

const HouseKeepingOnboard = () => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dateOfBirth: null,
      mobilePhone: "",
      houseKeepingType: "",
      email: "",
      address: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
    },
    mode: "onChange",
  });

  const axios = useAxiosPrivate();

  const { mutate: submitEmployee, isPending } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        "/api/company/add-housekeeping-member",
        formData
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Employee onboarded successfully!");
      reset(),
        queryClient.invalidateQueries({ queryKey: ["housekeeping-staff"] });
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      toast.error("Something went wrong.");
    },
  });

  const onSubmit = (data) => {
    submitEmployee(data);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <PageFrame>
      <div className="h-[65vh] overflow-y-auto">
        <div>
          <span className="text-primary font-pmedium text-title uppercase">
            housekeeping member onboarding
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
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4  ">
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{
                      required: "First Name is Required",
                      validate: {
                        isAlphanumeric,
                        noOnlyWhitespace,
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="First Name"
                        fullWidth
                        helperText={errors?.firstName?.message}
                        error={!!errors.firstName}
                      />
                    )}
                  />

                  <Controller
                    name="middleName"
                    control={control}
                    rules={{
                      required: "Middle Name is Required",
                      validate: {
                        isAlphanumeric,
                        noOnlyWhitespace,
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Middle Name"
                        fullWidth
                        helperText={errors?.middleName?.message}
                        error={!!errors.middleName}
                      />
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={control}
                    rules={{
                      required: "Last Name is required",
                      validate: {
                        isAlphanumeric,
                        noOnlyWhitespace,
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Last Name"
                        fullWidth
                        helperText={errors?.lastName?.message}
                        error={!!errors.lastName}
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4  ">
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: "Gender is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Gender"
                        select
                        fullWidth
                        helperText={errors?.gender?.message}
                        error={!!errors.gender}
                      >
                        <MenuItem value="" disabled>
                          Select a Gender
                        </MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    name="dateOfBirth"
                    control={control}
                    rules={{ required: "Date of Birth is required" }}
                    render={({ field }) => (
                      <DesktopDatePicker
                        format="DD-MM-YYYY"
                        disableFuture
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!errors.dateOfBirth,
                            helperText: errors?.dateOfBirth?.message,
                          },
                        }}
                        label="Date of Birth"
                        {...field}
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
                      />
                    )}
                  />
                </div>
                <Controller
                  name="mobilePhone"
                  control={control}
                  rules={{
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter a valid 10-digit number",
                    },
                    validate: {
                      isValidPhoneNumber,
                      noOnlyWhitespace,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Mobile Phone"
                      fullWidth
                      helperText={errors?.mobilePhone?.message}
                      error={!!errors.mobilePhone}
                    />
                  )}
                />
                <Controller
                  name="houseKeepingType"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Member Type"
                      size="small"
                      error={!!errors.houseKeepingType}
                      helperText={errors?.houseKeepingType?.message}
                    >
                      <MenuItem value="" disabled>
                        Select a Member Type
                      </MenuItem>
                      <MenuItem value="Self">Self</MenuItem>
                      <MenuItem value="Third Party">Third Party</MenuItem>
                    </TextField>
                  )}
                />
              </div>
            </div>
            <div>
              {/* Section: Home Address Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Home Address Information
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="address"
                  control={control}
                  rules={{
                    required: "Address is Required",
                    validate: {
                      noOnlyWhitespace,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Address"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors?.address?.message}
                    />
                  )}
                />
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4 ">
                  <CountryStateCitySelector
                    control={control}
                    getValues={getValues}
                    setValue={setValue}
                    errors={errors}
                  />

                  <Controller
                    name="pinCode"
                    control={control}
                    rules={{
                      required: "Pin Code is Required",
                      validate: {
                        isAlphanumeric,
                        isValidPinCode,
                      },
                    }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Pin Code"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center gap-4">
            <PrimaryButton
              type="submit"
              title={"Submit"}
              disabled={isPending}
            />

            <SecondaryButton handleSubmit={handleReset} title={"Reset"} />
          </div>
        </form>
      </div>
    </PageFrame>
  );
};

export default HouseKeepingOnboard;
