;
import { useForm, Controller } from "react-hook-form";
import { Chip, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import AgTable from "../../../../components/AgTable";
import { useNavigate } from "react-router-dom";

const VendorOnboard = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, reset } = useForm();

  const vendorColumns = [
    { field: "vendorID", headerName: "Vendor ID", width:100 },
    {
      field: "vendorName",
      headerName: "Vendor Name",
      flex:2,
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/app/dashboard/HR-dashboard/company/vendor-onboarding/vendor-details/${params.data.vendorID}`)}

        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      cellRenderer: () => (
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

  const onSubmit = () => {
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
                name="firstName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="First Name"
                    fullWidth
                  />
                )}
              />

              <Controller
                name="middleName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Middle Name"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Last Name"
                    fullWidth
                  />
                )}
              />

              <Controller
                name="gender"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} size="small" label="gender" fullWidth />
                )}
              />

              <Controller
                name="dob"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} size="small" label="DOB" fullWidth />
                )}
              />
              <Controller
                name="employeeID"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Employee ID"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="mobilePhone"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Mobile Phone"
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
                Job Information
              </span>
            </div>
            <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
              <Controller
                name="startDate"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Start Date"
                    fullWidth
                  />
                )}
              />

              <Controller
                name="workLocation"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Work Location"
                    fullWidth
                  />
                )}
              />

              <Controller
                name="employeeType"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Employee Type"
                    fullWidth
                  />
                )}
              />

              <Controller
                name="department"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Department"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="reportsTo"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Reports To"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="jobTitle"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Job Title"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="jobDescription"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Job Description"
                    fullWidth
                  />
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
