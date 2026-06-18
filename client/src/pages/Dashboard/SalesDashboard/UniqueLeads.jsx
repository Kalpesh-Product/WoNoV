import { useEffect, useMemo, useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
   IconButton,
  Menu,
} from "@mui/material";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { setLeadsData } from "../../../redux/slices/salesSlice";
import humanDate from "../../../utils/humanDateForamt";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
// import CollapsibleTable from "../../../components/Tables/MuiCollapsibleTable";
// import { MdOutlineRemove, MdOutlineRemoveRedEye } from "react-icons/md";
// import YearWiseTable from "../../../components/Tables/YearWiseTable";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdMoreVert, MdOutlineRemoveRedEye } from "react-icons/md";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const UniqueLeads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const leadsData = useSelector((state) => state?.sales?.leadsData);
  const [searchParams] = useSearchParams();
  const queryMonth = searchParams.get("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
   const [selectedLead, setSelectedLead] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionLead, setActionLead] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dateOfContact: "",
      companyName: "",
      serviceCategory: "",
      leadStatus: "",
      proposedLocations: "",
      sector: "",
      headOfficeLocation: "",
      officeInGoa: "",
      pocName: "",
      designation: "",
      contactNumber: "",
      emailAddress: "",
      leadSource: "",
      period: "",
      openDesks: 0,
      cabinDesks: 0,
      totalDesks: 0,
      clientBudget: "",
      startDate: "",
      remarksComments: "",
    },
  });

  const openDesksValue = useWatch({ control, name: "openDesks" });
  const cabinDesksValue = useWatch({ control, name: "cabinDesks" });

  useEffect(() => {
    const openDesks = Number(openDesksValue || 0);
    const cabinDesks = Number(cabinDesksValue || 0);
    setValue("totalDesks", openDesks + cabinDesks, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [openDesksValue, cabinDesksValue, setValue]);

  const [selectedFY, setSelectedFY] = useState("FY 2025-26");
  const [selectedMonth, setSelectedMonth] = useState(queryMonth || "Apr-24");

  const [viewType, setViewType] = useState("month"); // 'month' or 'year'

  useEffect(() => {
    const fetchLeadsIfEmpty = async () => {
      if (leadsData.length === 0) {
        try {
          const response = await axios.get("/api/sales/leads");
          dispatch(setLeadsData(response.data));
        } catch (error) {
          console.error("Failed to fetch leads", error);
        }
      }
    };

    fetchLeadsIfEmpty();
  }, [leadsData, dispatch]);

   const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ["sales-services"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/services");
      const filteredData = response?.data?.filter((service)=> service.isActive)
      return filteredData;
    },
  });

  const { data: units = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["lead-units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return response.data;
    },
  });

  const fetchLeads = async () => {
    const response = await axios.get("/api/sales/leads");
    dispatch(setLeadsData(response.data));
    return response.data;
  };

  const { mutate: createLead, isPending: isCreatingLead } = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        ...formData,
         dateOfContact: formData.dateOfContact
          ? dayjs(formData.dateOfContact).format("YYYY-MM-DD")
          : "",
        startDate: formData.startDate
          ? dayjs(formData.startDate).format("YYYY-MM-DD")
          : "",
        proposedLocations: formData.proposedLocations,
        officeInGoa: formData.officeInGoa === "true",
        openDesks: Number(formData.openDesks || 0),
        cabinDesks: Number(formData.cabinDesks || 0),
        totalDesks: Number(formData.totalDesks || 0),
        clientBudget: Number(formData.clientBudget || 0),
      };
      const response = await axios.post("/api/sales/create-lead", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      toast.success(data?.message || "Lead created successfully");
      reset();
      setAddLeadOpen(false);
      await fetchLeads();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to create lead");
    },
  });

  const addLeadFields = [
    { name: "dateOfContact", label: "Date Of Contact", type: "datePicker" },
    { name: "companyName", label: "Company Name" },
    { name: "serviceCategory", label: "Service Category", type: "select mul", options: services.map((service) => ({ value: service._id, label: service.serviceName })) },
    { name: "leadStatus", label: "Lead Status", type: "select", options: ["Cold", "Mild", "Hot", "Closed"].map((value) => ({ value, label: value })) },
    { name: "proposedLocations", label: "Proposed Locations", type: "select", options: units.map((unit) => ({ value: unit._id, label: unit.unitNo || unit.unitName || "Unit" })) },
    { name: "sector", label: "Sector" },
    { name: "headOfficeLocation", label: "Head Office Location" },
    { name: "officeInGoa", label: "Office In Goa", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
    { name: "pocName", label: "POC Name" },
    { name: "designation", label: "Designation" },
    { name: "contactNumber", label: "Contact Number" },
    { name: "emailAddress", label: "Email Address", type: "email" },
    { name: "leadSource", label: "Lead Source" },
    { name: "period", label: "Period" },
    { name: "openDesks", label: "Open Desks", type: "number" },
    { name: "cabinDesks", label: "Cabin Desks", type: "number" },
    { name: "totalDesks", label: "Total Desks", type: "number", readOnly: true },
    { name: "clientBudget", label: "Client Budget", type: "number" },
    { name: "startDate", label: "Start Date", type: "datePicker" },
    { name: "remarksComments", label: "Remarks Comments", required: false },
  ];

  const renderAddLeadField = ({
    name,
    label,
    type = "text",
    options,
    required = true,
    readOnly = false,
  }) => (
    <Controller
      key={name}
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field }) => {
        if (type === "datePicker") {
          return (
            <DatePicker
              label={label}
              value={field.value ? dayjs(field.value) : null}
              onChange={(value) => field.onChange(value)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!errors[name],
                  helperText: errors[name]?.message,
                },
              }}
            />
          );
        }

        return (
          <TextField
            {...field}
            select={type === "select"}
            type={type === "select" ? undefined : type}
            label={label}
            size="small"
            fullWidth
            InputProps={readOnly ? { readOnly: true } : undefined}
            error={!!errors[name]}
            helperText={errors[name]?.message}
          >
            {type === "select" && [
              <MenuItem value="" disabled key={`${name}-placeholder`}>
                {isServicesLoading || isUnitsLoading
                  ? "Loading..."
                  : `Select ${label}`}
              </MenuItem>,
              ...(options || []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )),
            ]}
          </TextField>
        );
      }}
    />
  );

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
    navigate(
      `/app/dashboard/sales-dashboard/unique-leads?month=${encodeURIComponent(
        newMonth
      )}`
    );
  };
  // const handleViewTypeChange = (event) => {
  //   setViewType(event.target.value);
  // };

  const availableFinancialYears = useMemo(() => {
    const yearsSet = new Set();

    leadsData.forEach((lead) => {
      const date = dayjs(lead.startDate);
      const year = date.month() >= 3 ? date.year() : date.year() - 1; // FY starts in April
      const fyLabel = `FY ${year}-${(year + 1).toString().slice(-2)}`;
      yearsSet.add(fyLabel);
    });

    return Array.from(yearsSet).sort(); // optional: sort FYs ascending
  }, [leadsData]);

  const selectedMonthData = useMemo(() => {
    if (!selectedMonth || !selectedFY || leadsData.length === 0) return null;

    const [fyStart] = selectedFY.match(/\d{4}/); // e.g. "2024"
    const fyStartYear = parseInt(fyStart);
    const fyEndYear = fyStartYear + 1;

    const domainsMap = {};

    leadsData.forEach((lead) => {
      const leadDate = dayjs(lead?.dateOfContact);
      const leadMonthIndex = leadDate.month();
      const leadYear = leadDate.year();

      const isInFY =
        leadMonthIndex >= 3 ? leadYear === fyStartYear : leadYear === fyEndYear;

      const formattedLeadMonth = leadDate.format("MMM-YY");

      if (
        !isInFY ||
        (selectedMonth !== "All" && formattedLeadMonth !== selectedMonth)
      )
        return;

      const domainName = lead?.serviceCategory?.serviceName || "Unknown";

      if (!domainsMap[domainName]) {
        domainsMap[domainName] = {
          revenue: 0,
          clients: [],
        };
      }

      domainsMap[domainName].revenue += lead?.estimatedRevenue || 0;
      domainsMap[domainName].clients.push({
        client: lead?.companyName,
        representative: lead?.pocName,
        callDate: humanDate(lead?.startDate),
        status: lead?.remarksComments,
      });
    });

    return {
      month: selectedMonth,
      domains: Object.entries(domainsMap).map(([name, data]) => ({
        name,
        ...data,
      })),
    };
  }, [selectedMonth, selectedFY, leadsData]);

  const totalLeads = selectedMonthData?.domains?.reduce((sum, item) => {
    return (item.clients?.length || 0) + sum;
  }, 0);

  // 🧠 Yearly Revenue Data
  const yearlyRevenueData = useMemo(() => {
    const revenueMap = {};

    leadsData?.forEach((lead) => {
      const domainName = lead.serviceCategory?.serviceName || "Unknown";

      if (!revenueMap[domainName]) {
        revenueMap[domainName] = {
          revenue: 0,
          clients: [],
        };
      }

      revenueMap[domainName].revenue += lead.estimatedRevenue || 0;
      revenueMap[domainName].clients.push({
        client: lead.companyName,
        representative: lead.pocName,
        callDate: humanDate(lead.startDate),
        status: lead.remarksComments,
      });
    });

    return revenueMap;
  }, [leadsData]);

  // const handleViewClient = (lead) => {
  //   const selectedLeadData = leadsData.find(
  //     (item) => item.client === lead.companyname
  //   );
   const getOptionLabel = (value, fallback = "N/A") => {
    if (!value) return fallback;
    if (typeof value === "string" || typeof value === "number") return value;
    return (
      value.serviceName ||
      value.unitNo ||
      value.unitName ||
      value.name ||
      value.label ||
      fallback
    );

    };

  const formatBoolean = (value) => {
    if (value === true || value === "true") return "Yes";
    if (value === false || value === "false") return "No";
    return value || "N/A";
  };

  const formatViewDetail = (lead, field, type) => {
    const value = lead?.[field];
    if (type === "date") return value ? humanDate(value) : "N/A";
    if (type === "currency") return value || value === 0 ? `INR ${value}` : "N/A";
    if (type === "boolean") return formatBoolean(value);
    if (field === "serviceCategory") return getOptionLabel(value);
    if (field === "proposedLocations") return getOptionLabel(value);
    return value || "N/A";
  };

   const handleViewClient = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

   const handleActionMenuOpen = (event, lead) => {
    setActionAnchorEl(event.currentTarget);
    setActionLead(lead);
  };

  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
    setActionLead(null);
  };

  const handleEditLead = () => {
    if (!actionLead) return;
    navigate(encodeURIComponent(actionLead.companyName || actionLead._id), {
      state: {
        selectedLead: actionLead,
        editMode: true,
      },
    });
    handleActionMenuClose();
  };

  const viewDetailFields = [
    { label: "Date Of Contact", field: "dateOfContact", type: "date" },
    { label: "Company Name", field: "companyName" },
    { label: "Service Category", field: "serviceCategory" },
    { label: "Lead Status", field: "leadStatus" },
    { label: "Proposed Locations", field: "proposedLocations" },
    { label: "Sector", field: "sector" },
    { label: "Head Office Location", field: "headOfficeLocation" },
    { label: "Office In Goa", field: "officeInGoa", type: "boolean" },
    { label: "POC Name", field: "pocName" },
    { label: "Designation", field: "designation" },
    { label: "Contact Number", field: "contactNumber" },
    { label: "Email Address", field: "emailAddress" },
    { label: "Lead Source", field: "leadSource" },
    { label: "Period", field: "period" },
    { label: "Open Desks", field: "openDesks" },
    { label: "Cabin Desks", field: "cabinDesks" },
    { label: "Total Desks", field: "totalDesks" },
    { label: "Client Budget", field: "clientBudget", type: "currency" },
    { label: "Start Date", field: "startDate", type: "date" },
    { label: "Remarks Comments", field: "remarksComments" },
    { label: "Last Follow-up Date", field: "lastFollowUpDate", type: "date" },
  ];
  // const graphData = [
  //   {
  //     name: "Leads",
  //     data:
  //       viewType === "month"
  //         ? selectedMonthData?.domains.map((domain) => domain.clients.length) ||
  //           []
  //         : Object.values(yearlyRevenueData).map(
  //             (domain) => domain.clients.length
  //           ),
  //   },
  // ];

  const graphData = [
    {
      name: "Leads",
      data:
        viewType === "month"
          ? (selectedMonthData?.domains || []).map(
              (domain) => domain.clients.length
            )
          : Object.values(yearlyRevenueData).map(
              (domain) => domain.clients.length
            ),
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: false,
      fontFamily: "Poppins-Regular",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories:
        viewType === "month"
          ? selectedMonthData?.domains.map((domain) => domain.name) || []
          : Object.keys(yearlyRevenueData),
    },
    yaxis: { title: { text: "Leads" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "20%", borderRadius: 3 },
    },
    legend: { position: "top" },
    dataLabels: { enabled: true, positiom: "top" },
    colors: ["#00cdd1"],
  };

  const monthOrder = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];
  // const availableMonths = useMemo(() => {
  //   const uniqueMonths = new Set(
  //     leadsData
  //       .map((lead) => dayjs(lead.dateOfContact).format("MMMM"))
  //       .filter((m) => m !== "Invalid Date")
  //   );

  //   return Array.from(uniqueMonths).sort(
  //     (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
  //   );
  // }, [leadsData]);


  const formatMonths = useMemo(() => {
    const fyMatch = selectedFY.match(/\d{4}/);
    if (!fyMatch) return null;

    const fyStartYear = parseInt(fyMatch[0]);

    return monthOrder.map((month, index) => {
      const actualMonthIndex = (index + 3) % 12;
      const actualYear = actualMonthIndex <= 2 ? fyStartYear + 1 : fyStartYear;

      return dayjs(new Date(actualYear, actualMonthIndex)).format("MMM-YY");
    });
  }, [selectedFY]);

  const filteredLeads = useMemo(() => {
    if (!selectedMonth || !selectedFY || leadsData.length === 0) return [];

    const [fyStart] = selectedFY.match(/\d{4}/) || [];
    const fyStartYear = parseInt(fyStart);
    const fyEndYear = fyStartYear + 1;

    return leadsData.filter((lead) => {
      const leadDate = dayjs(lead?.dateOfContact);
      const leadMonthIndex = leadDate.month();
      const leadYear = leadDate.year();

      const isInFY =
        leadMonthIndex >= 3 ? leadYear === fyStartYear : leadYear === fyEndYear;

      const formattedLeadMonth = leadDate.format("MMM-YY");

      if (!isInFY) return false;
      if (selectedMonth !== "All" && formattedLeadMonth !== selectedMonth)
        return false;

      return true;
    });
  }, [selectedMonth, selectedFY, leadsData]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* View Type Selection */}

      <WidgetSection
        layout={1}
        border
        padding
        title={"Unique Leads"}
        TitleAmount={`Total Leads : ${totalLeads}`}
      >
        <NormalBarGraph data={graphData} options={graphOptions} height={400} />
      </WidgetSection>

      <div className="flex gap-4 w-full justify-center">
        <FormControl size="small">
          <InputLabel>Select Financial Year</InputLabel>
          <Select
            value={selectedFY}
            onChange={(e) => {
              const newFY = e.target.value;
              setSelectedFY(newFY);

              const [startYear] = newFY.match(/\d{4}/) || [];
              if (!startYear) {
                setSelectedMonth("All");
                return;
              }

              const defaultMonth = dayjs(
                new Date(parseInt(startYear), 3)
              ).format("MMM-YY");
              setSelectedMonth(defaultMonth);
              navigate(
                `/app/dashboard/sales-dashboard/unique-leads?month=${encodeURIComponent(
                  defaultMonth
                )}`
              );
            }}
            label="Select Financial Year"
            sx={{ width: 200 }}
          >
            {availableFinancialYears
              .filter((year) => year !== "FY NaN-aN")
              .map((fy) => (
                <MenuItem key={fy} value={fy}>
                  {fy}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            label="Select Month"
            sx={{ width: 200 }}
          >
            <MenuItem value="All">All</MenuItem>
            {formatMonths.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <WidgetSection
        border
        title={"Unique Leads details"}
        TitleAmount={`Total Leads : ${totalLeads}`}
      >
        <div>
          <AgTable
          buttonTitle="Add Leads"
            handleClick={() => setAddLeadOpen(true)}
            data={filteredLeads.map((item, index) => ({
              ...item,
              _id: item._id,
              srNo: index + 1,
              dateOfContact: item.dateOfContact,
              companyName: item.companyName,
              pocName: item.pocName,
              designation: item.designation,
              contactNumber: item.contactNumber,
              emailAddress: item.emailAddress,
              leadStatus: item.leadStatus,
              sector: item.sector,
              serviceName: item.serviceCategory?.serviceName || "—",
              proposedLocationsLabel: getOptionLabel(item.proposedLocations),
              clientBudget: item.clientBudget,
              startDate: item.startDate,
              lastFollowUpDate: item.lastFollowUpDate,
              remarksComments: item.remarksComments,
            }))}
            columns={[
              { headerName: "Sr. No", field: "srNo", width: 100 },
              {
                headerName: "Date of Contact",
                field: "dateOfContact",
                flex: 1,
                valueFormatter: (params) =>
                  params.value ? humanDate(params.value) : "—",
              },
              {
                headerName: "Company Name",
                field: "companyName",
                flex: 1,
                cellRenderer: (params) => <span>{params.value || "—"}</span>,
                // cellRenderer: (params) => {
                //   const clientData = params.data;
                //   return (
                //     <span
                //       className="text-primary cursor-pointer underline"
                //       role="button"
                //       onClick={() => {
                //         navigate(params.value, {
                //           state: {
                //             selectedLead: params.data,
                //           },
                //         });
                //       }}
                //     >
                //       {params.value}
                //     </span>
                //   );
                // },
              },
              { headerName: "POC Name", field: "pocName",flex: 1 },
              { headerName: "Designation", field: "designation",flex: 1,hide: true },
              { headerName: "Contact Number", field: "contactNumber",flex: 1},
              { headerName: "Email", field: "emailAddress", flex: 1 ,hide: true},
              { headerName: "Lead Status", field: "leadStatus" ,flex: 1},
              { headerName: "Sector", field: "sector",flex: 1,hide: true },
              { headerName: "Service", field: "serviceName",flex: 1,hide: true },
              {
                headerName: "Client Budget",
                field: "clientBudget",
                hide: true,
                flex: 1,
                valueFormatter: (params) =>
                  params.value ? `INR ${params.value}` : "—",
              },
              {
                headerName: "Last Follow-up Date",
                field: "lastFollowUpDate",
                hide: true,
                flex: 1,
                valueFormatter: (params) =>
                  params.value ? humanDate(params.value) : "—",
              },
              { headerName: "Remarks", field: "remarksComments", flex: 1,hide: true },
                {
                headerName: "Action",
                field: "action",
                flex:1,
                pinned: "right",
                suppressCsvExport: true,
                suppressExcelExport: true,
                cellRenderer: (params) => (
                  <div className="flex items-center gap-2 h-full">
                    <IconButton
                      size="small"
                      aria-label="View lead details"
                      onClick={() => handleViewClient(params.data)}
                    >
                      <MdOutlineRemoveRedEye className="text-primary" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="More lead options"
                      onClick={(event) => handleActionMenuOpen(event, params.data)}
                    >
                      <MdMoreVert />
                    </IconButton>
                  </div>
                ),
              },
            ]}
            search={true}
            dateColumn="dateOfContact"
            initialMonth={selectedMonth}
            key="leads-table"
            exportData
          />
        </div>
      </WidgetSection>
       <MuiModal
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        title={"Add Leads"}
        widthClass="w-4/5 max-w-5xl"
      >
        <form onSubmit={handleSubmit((data) => createLead(data))} className="flex flex-col gap-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addLeadFields.map(renderAddLeadField)}
            </div>
          </LocalizationProvider>
          <PrimaryButton
            title="Add Leads"
            type="submit"
            isLoading={isCreatingLead}
            disabled={isCreatingLead}
            className="w-full"
          />
        </form>
      </MuiModal>
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        // title={"Lead details"}
        title={"View Leads Details"}
      >
        {/* <div className="flex flex-col gap-2">
          {selectedLead ? (
            <>
              <DetalisFormatted
                title="Company Name"
                detail={selectedLead.companyName}
                upperCase
              />
              <DetalisFormatted
                title="POC Name"
                detail={selectedLead.pocName}
              />
              <DetalisFormatted
                title="Designation"
                detail={selectedLead.designation || "—"}
              />
              <DetalisFormatted
                title="Contact Number"
                detail={selectedLead.contactNumber}
              />
              <DetalisFormatted
                title="Email"
                detail={selectedLead.emailAddress}
              />
              <DetalisFormatted
                title="Lead Status"
                detail={selectedLead.leadStatus}
              />
              <DetalisFormatted title="Sector" detail={selectedLead.sector} />
              <DetalisFormatted
                title="Service"
                detail={selectedLead.serviceName}
              />
              <DetalisFormatted
                title="Client Budget"
                detail={`INR ${selectedLead.clientBudget}`}
              />
              <DetalisFormatted
                title="Date of Contact"
                detail={humanDate(selectedLead.dateOfContact)}
              />
              <DetalisFormatted
                title="Last Follow-up Date"
                detail={humanDate(selectedLead.lastFollowUpDate)}
              />
              <DetalisFormatted
                title="Remarks"
                detail={selectedLead.remarksComments || "—"}
              />
            </>
          ) : (
            <div>No lead selected.</div>
          )}
        </div> */}
           {selectedLead ? (
          <div className="grid grid-cols-1 gap-4">
            {viewDetailFields.map(({ label, field, type }) => (
               <DetalisFormatted
                               key={field}
                title={label}
                detail={formatViewDetail(selectedLead, field, type)}
                  />
            ))}
          </div>
        ) : (
          <div>No lead selected.</div>
        )}
      </MuiModal>
       <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleEditLead}>Edit</MenuItem>
      </Menu>
    </div>
  );
};

export default UniqueLeads;
