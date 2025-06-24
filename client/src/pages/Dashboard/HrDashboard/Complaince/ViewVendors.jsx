import { Avatar, Button, Chip, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";
import { useLocation } from "react-router-dom";

const ViewVendors = () => {
  const { control, handleSubmit, reset, setValue, getValues } = useForm();

  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const { state } = location;

  useEffect(() => {
    if (state) {
      const mapping = {
        vendorName: state.vendorName,
        address: state.address,
        state: state.state,
        country: state.country,
        pinCode: state.address?.match(/\b\d{6}\b/)?.[0] || "",
        gst: "N/A", // assuming GST is not provided
        email: "N/A", // assuming Email is not provided
        registrationType: "regular", // default/fallback
        assesseeOT: state.assesseeOfOtherTerritory ? "Yes" : "No",
        eCommerceOperator: state.isEcommerceOperator ? "Yes" : "No",
        deemedExporter: state.isDeemedExporter ? "Yes" : "No",
        partyName: state.vendorName,
        gstIn: "N/A", // assuming GSTIN is not provided
        isTransporter: state.isTransporter ? "Yes" : "No",
      };
      reset(mapping);

    }
  }, [state, setValue]);
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

  const mailingFields = [
    "vendorName",
    "address",
    "state",
    "country",
    // "gst",
    // "email",
  ];

  const gstFields = [
    "registrationType",
    "assesseeOT",
    "eCommerceOperator",
    "deemedExporter",
    "partyName",
    "gstIn",
    "isTransporter",
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
                  <div className="pb-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      Mailing Details
                    </span>
                  </div>

                  <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
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

                <div>
                  <div className="pb-4 border-b-default border-borderGray">
                    <span className="text-subtitle font-pmedium">
                      GST Details
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
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVendors;
