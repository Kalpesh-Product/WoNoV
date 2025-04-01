import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Chip, MenuItem, Select, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import AgTable from "../../../../components/AgTable";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Country, State } from "country-state-city";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import  useAuth  from "../../../../hooks/useAuth";

const VendorOnboard = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { control, handleSubmit, reset } = useForm();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Fetch states when a country is selected
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setStates(State.getStatesOfCountry(countryCode));
  };

  const { mutate: vendorDetails, isPending: isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/api/vendors/onboard-vendor`, {
        ...data,
        departmentId: auth.user.departments[0]._id || 'id',
      });

      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
    },
    onError: function (data) {
      toast.error(data.message);
    },
  });

  const vendorColumns = [
    { field: "vendorID", headerName: "Vendor ID", width: 100 },
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
              `/app/dashboard/HR-dashboard/company/vendor-onboarding/vendor-details/${params.data.vendorID}`
            )
          }
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span className="text-primary hover:underline text-content cursor-pointer">
              View Details
            </span>
          </div>
        </>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          "In Active": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
  ];

  const rows = [
    {
      id: 1,
      vendorName: "Sumo Payroll",
      vendorID: "V001",
      status: "Active",
    },
    {
      id: 2,
      vendorName: "Payroll Y",
      vendorID: "V002",
      status: "In Active",
    },
    {
      id: 3,
      vendorName: "John Doe",
      vendorID: "V003",
      status: "Active",
    },
  ];

  const onSubmit = (data) => {
    vendorDetails(data);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="h-[65vh] overflow-y-auto">
        <div className="py-4">
          <span className="text-title text-primary font-pmedium">
            Vendor Onboarding Form
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
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Vendor Name"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="address"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Address"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="country"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      displayEmpty
                      onChange={(e) => {
                        field.onChange(e);
                        handleCountryChange(e.target.value);
                      }}
                      size="small"
                    >
                      <MenuItem value="">Select Country</MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.isoCode} value={country.isoCode}>
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
                  render={({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      displayEmpty
                      size="small"
                      disabled={!selectedCountry}
                    >
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
                  name="pinCode"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Pin Code"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="panItNo"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="PAN IT No"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="gstUin"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="GST UIN"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="registrationType"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Registration Type"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
            <div>
              {/* Section: Job Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Other Information
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="assesseeOfOtherTerritory"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select fullWidth size="small" {...field} displayEmpty>
                      <MenuItem disabled value="">
                        Assessee Of Other Territory
                      </MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  )}
                />
                <Controller
                  name="isEcommerceOperator"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select fullWidth size="small" {...field} displayEmpty>
                      <MenuItem disabled value="">
                        Is Ecommerce Operator
                      </MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  )}
                />
                <Controller
                  name="isDeemedExporter"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select fullWidth size="small" {...field} displayEmpty>
                      <MenuItem disabled value="">
                        Is Deemed Exporter
                      </MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  )}
                />

                <Controller
                  name="partyType"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select {...field} size="small" displayEmpty>
                      <MenuItem value="">Party Type</MenuItem>
                      <MenuItem value="Domestic">Domestic</MenuItem>
                      <MenuItem value="INternational">International</MenuItem>
                    </Select>
                  )}
                />

                <Controller
                  name="gstinUin"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="GST IN UIN"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="isTransporter"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select fullWidth size="small" {...field} displayEmpty>
                      <MenuItem disabled value="">
                        Is Transporter
                      </MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center gap-4">
            <PrimaryButton type="submit" title={"Submit"} />
            <SecondaryButton handleSubmit={handleReset} title={"Reset"} />
          </div>
        </form>
      </div>
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
    </div>
  );
};

export default VendorOnboard;
