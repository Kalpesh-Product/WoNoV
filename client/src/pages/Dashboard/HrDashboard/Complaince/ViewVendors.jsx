import { Avatar, Button, Chip, TextField } from "@mui/material";
import React, { useState } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";

const ViewVendors = () => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "Sumo Payroll",
      address: "Panaji",
      state: "Goa",
      country: "India",
      pinCode: "403001",
      gst: "BMW00044556677",
      email: "sumo@email.com",
      registrationType: "regular",
      assesseeOT: "No",
      eCommerceOperator: "Yes",
      deemedExporter: "Yes",
      partyName: "Sumo",
      gstIn: "HJM8899007766",
      isTransporter: "Yes",
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const onSubmit = (data) => {
    setIsEditing(!isEditing);
    toast.success("Vendor details updated successfully");
  };

  const handleReset = () => {
    reset();
  };


  const kraColumn = [
    { field: "purchaseName", headerName: "KRAs" ,flex:1},
    { field: "vendorId", headerName: "KRAs" ,flex:1},
    {
        field: "paymentStatus",
        headerName: "Payment Status",
        cellRenderer: (params) => {
          const statusColorMap = {
            Paid: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
            "Pending": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
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
        purchaseName: 'Purchase 1',
        vendorId : "V001",
        paymentStatus : "Paid"
    },
    {
        id: 2,
        purchaseName: 'Purchase 2',
        vendorId : "V001",
        paymentStatus : "Pending"
    },
    
];

  return (
    <div className="flex flex-col gap-8">
      <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4 ">
        <div>
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
        </div>

        <div className="h-[51vh] overflow-y-auto">
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {/* Section: Basic Information */}
                  <div className="pb-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      Mailing Details
                    </span>
                  </div>

                  <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                    {[
                      "name",
                      "address",
                      "state",
                      "country",
                      "pinCode",
                      "gst",
                      "email",
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
                                {control._defaultValues[fieldKey]}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Section: Job Information */}
                  <div className="pb-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      GST Details
                    </span>
                  </div>

                  <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                    {[
                      "registrationType",
                      "assesseeOT",
                      "eCommerceOperator",
                      "deemedExporter",
                      "partyName",
                      "gstIn",
                      "isTransporter",
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
                            <div className="w-[35%] justify-start flex">
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
                <PrimaryButton
                  title={isEditing ? "Submit" : "Edit"}
                  handleSubmit={
                    isEditing ? handleSubmit(onSubmit) : handleEditToggle
                  }
                />
                {isEditing && (
                  <SecondaryButton title={"Reset"} handleSubmit={handleReset} />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div>
        <AgTable
          search={true}
          searchColumn={"Purchase Name"}
          tableTitle={"Purchases"}
          data={rows}
          columns={kraColumn}
        />
      </div>
    </div>
  );
};

export default ViewVendors;
