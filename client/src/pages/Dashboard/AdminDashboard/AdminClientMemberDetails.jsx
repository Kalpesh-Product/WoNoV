import { Avatar, Button, Chip, TextField } from "@mui/material";
import React, { useState } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";

const AdminClientMemberDetails = () => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      memberName: "Aiwinraj KS",
      memberDOB: "20/10/2000",
      memberAddress: "Mapusa",
      memberDesignation: "Web Developer",
      memberAADHAR: "0832 1983 6483",
      employeeID: "CO01",
      mobilePhone: "7904895106",
      memberPAN: "Link",
      memberGender: "Male",
      memberPhoneNo: "9876543201",
      memberEmailID: "aiwin@email.com",
      memberMaritalStatus: "Single",
      jobTitle: "Software Engineer",
      jobDescription:
        "Responsible for developing and maintaining web applications.",
      shift: "Day Shift",
      workSchedulePolicy: "Standard 9-5",
      attendanceSource: "Biometric",
      leavePolicy: "Standard",
      holidayPolicy: "Company Approved",
      aadharID: "1234-5678-9123",
      pan: "ABCDE1234F",
      pfAcNo: "PF123456789",
      addressLine1: "123, Tech Park",
      addressLine2: "Near City Center",
      state: "Karnataka",
      city: "Bangalore",
      pinCode: "560001",
      includeInPayroll: "Yes",
      payrollBatch: "Batch A",
      professionTaxExemption: "No",
      includePF: "Yes",
      pfContributionRate: "12%",
      employeePF: "1500",
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const onSubmit = (data) => {
    setIsEditing(!isEditing);
    toast.success("User details updated successfully");
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4 ">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-subtitle font-pmedium text-primary">
            Member Details
          </span>
        </div>
        <div>
          <PrimaryButton handleSubmit={handleEditToggle} title={"Edit"} />
        </div>
      </div>

      <div className="h-[51vh] overflow-y-auto">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section:  Customer Details */}
              <div>
                {/* <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Customer Details
                  </span>
                </div> */}

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "memberName",
                    "memberDOB",
                    "memberAddress",
                    "memberDesignation",
                    "memberAADHAR",
                    // "employeeID",
                    // "mobilePhone",
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

              {/* Section: Company Details */}
              <div>
                {/* <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Company Details
                  </span>
                </div> */}

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "memberPAN",
                    "memberGender",
                    "memberPhoneNo",
                    "memberEmailID",
                    "memberMaritalStatus",
                    // "jobTitle",
                    // "jobDescription",
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

              {/* Section: Policies*/}
              {/* <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">Policies</span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "shift",
                    "workSchedulePolicy",
                    "attendanceSource",
                    "leavePolicy",
                    "holidayPolicy",
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
              </div> */}

              {/* Section: KYC */}
              {/* <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">KYC</span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {["aadharID", "pan", "pfAcNo"].map((fieldKey) => (
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
              </div> */}

              {/* Section: Home Address Information*/}
              {/* <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Home Address Information
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "addressLine1",
                    "addressLine2",
                    "state",
                    "city",
                    "pinCode",
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
              </div> */}

              {/* Section: Payroll Information */}
              {/* <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Payroll Information
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "includeInPayroll",
                    "payrollBatch",
                    "professionTaxExemption",
                    "includePF",
                    "pfContributionRate",
                    "employeePF",
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
              </div> */}
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
  );
};

export default AdminClientMemberDetails;
