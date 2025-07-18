import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import humanDate from "../../../utils/humanDateForamt";

const AdminClientDetails = () => {
  const selectedClient = useSelector((state) => state.client.selectedClient);

  const { control, reset } = useForm({
    defaultValues: {
      clientName: "",
      serviceName: "",
      serviceDescription: "",
      sector: "",
      hoCity: "",
      hoState: "",
      unitName: "",
      unitNo: "",
      buildingName: "",
      buildingAddress: "",
      cabinDesks: 0,
      openDesks: 0,
      totalDesks: 0,
      bookingType: "",
      ratePerOpenDesk: 0,
      ratePerCabinDesk: 0,
      annualIncrement: 0,
      perDeskMeetingCredits: 0,
      totalMeetingCredits: 0,
      startDate: "",
      endDate: "",
      lockinPeriod: 0,
      rentDate: "",
      nextIncrement: "",
      localPocName: "",
      localPocEmail: "",
      localPocPhone: "",
      hoPocName: "",
      hoPocEmail: "",
      hoPocPhone: "",
      isActive: false,
      createdAt: "",
      updatedAt: "",
    },
  });

  useEffect(() => {
    if (selectedClient) {
      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        hoCity: selectedClient.hoCity,
        hoState: selectedClient.hoState,
        unitName: selectedClient.unit?.unitName || "",
        unitNo: selectedClient.unitNo || "",
        buildingName: selectedClient.unit?.building?.buildingName || "",
        buildingAddress: selectedClient.unit?.building?.fullAddress || "",
        cabinDesks: selectedClient.cabinDesks,
        openDesks: selectedClient.openDesks,
        totalDesks: selectedClient.totalDesks,
        ratePerOpenDesk: selectedClient.ratePerOpenDesk,
        ratePerCabinDesk: selectedClient.ratePerCabinDesk,
        annualIncrement: selectedClient.annualIncrement,
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits,
        totalMeetingCredits: selectedClient.totalMeetingCredits,
        bookingType: selectedClient.bookingType,
        startDate: selectedClient.startDate,
        endDate: selectedClient.endDate,
        lockinPeriod: selectedClient.lockinPeriod,
        rentDate: selectedClient.rentDate,
        nextIncrement: selectedClient.nextIncrement,
        localPocName: selectedClient.localPocName || "",
        localPocEmail: selectedClient.localPocEmail || "",
        localPocPhone: selectedClient.localPocPhone || "",
        hoPocName: selectedClient.hoPocName || "",
        hoPocEmail: selectedClient.hoPocEmail || "",
        hoPocPhone: selectedClient.hoPocPhone || "",
        isActive: selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
    }
  }, [selectedClient, reset]);

  const displayField = (label, value, isDate = false) => (
    <div className="py-2 flex justify-between items-start gap-2">
      <div className="w-[100%] justify-start flex">
        <span className="font-pmedium text-gray-600 text-content">{label}</span>
      </div>
      <div className="">
        <span>:</span>
      </div>
      <div className="w-full">
        <span className="text-gray-500">
          {isDate ? humanDate(value) : value || "N/A"}
        </span>
      </div>
    </div>
  );

  const { _defaultValues } = control;

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-subtitle font-pmedium text-primary">
          Client Details
        </span>
      </div>

      <div className="h-[51vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">
                Customer Details
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Client Name", _defaultValues.clientName)}
              {displayField("Sector", _defaultValues.sector)}
              {displayField("HO City", _defaultValues.hoCity)}
              {displayField("HO State", _defaultValues.hoState)}
              {displayField("Booking Type", _defaultValues.bookingType)}
            </div>
          </div>

          {/* Company Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">
                Company Details
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Unit No", _defaultValues.unitNo)}
              {displayField("Cabin Desks", _defaultValues.cabinDesks)}
              {displayField(
                "Rate Per Cabin Desk",
                _defaultValues.ratePerCabinDesk
              )}
              {displayField("Open Desks", _defaultValues.openDesks)}
              {displayField(
                "Rate Per Open Desk",
                _defaultValues.ratePerOpenDesk
              )}
            </div>
          </div>

          {/* Agreement Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">
                Agreement Details
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Annual Increment", _defaultValues.annualIncrement)}
              {displayField(
                "Per Desk Meeting Credits",
                _defaultValues.perDeskMeetingCredits
              )}
              {displayField(
                "Total Meeting Credits",
                _defaultValues.totalMeetingCredits
              )}
              {displayField("Start Date", _defaultValues.startDate, true)}
              {displayField("End Date", _defaultValues.endDate, true)}
              {displayField("Lock-in Period", _defaultValues.lockinPeriod)}
              {displayField("Rent Date", _defaultValues.rentDate, true)}
              {displayField(
                "Next Increment",
                _defaultValues.nextIncrement,
                true
              )}
            </div>
          </div>

          {/* POC Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">POC Details</span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Local POC Name", _defaultValues.localPocName)}
              {displayField("Local POC Email", _defaultValues.localPocEmail)}
              {displayField("Local POC Phone", _defaultValues.localPocPhone)}
              {displayField("HO POC Name", _defaultValues.hoPocName)}
              {displayField("HO POC Email", _defaultValues.hoPocEmail)}
              {displayField("HO POC Phone", _defaultValues.hoPocPhone)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClientDetails;
