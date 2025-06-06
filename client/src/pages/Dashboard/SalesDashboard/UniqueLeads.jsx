import React, { useEffect, useMemo, useState } from "react";
import BarGraph from "../../../components/graphs/BarGraph";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setLeadsData } from "../../../redux/slices/salesSlice";
import humanDate from "../../../utils/humanDateForamt";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import CollapsibleTable from "../../../components/Tables/MuiCollapsibleTable";
import { MdOutlineRemove, MdOutlineRemoveRedEye } from "react-icons/md";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import DetalisFormatted from "../../../components/DetalisFormatted";

const UniqueLeads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const leadsData = useSelector((state) => state?.sales?.leadsData);
  console.log(leadsData);

  const [searchParams] = useSearchParams();
  const queryMonth = searchParams.get("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(queryMonth || "April");
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

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
    navigate(
      `/app/dashboard/sales-dashboard/unique-leads?month=${encodeURIComponent(
        newMonth
      )}`
    );
  };
  const handleViewTypeChange = (event) => {
    setViewType(event.target.value);
  };
  const selectedMonthData = useMemo(() => {
    if (!selectedMonth || leadsData.length === 0) return null;

    const domainsMap = {};

    leadsData.forEach((lead) => {
      const leadMonth = dayjs(lead?.startDate).format("MMMM");
      if (leadMonth !== selectedMonth) return;

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
  }, [selectedMonth, leadsData]);
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

  const handleViewClient = (lead) => {
    const selectedLeadData = leadsData.find(
      (item) => item.client === lead.companyname
    );

    setSelectedLead(selectedLeadData);
    setModalOpen(true);
  };
  const graphData = [
    {
      name: "Leads",
      data:
        viewType === "month"
          ? selectedMonthData?.domains.map((domain) => domain.clients.length) ||
            []
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

  const availableMonths = useMemo(() => {
    const uniqueMonths = new Set(
      leadsData.map((lead) => dayjs(lead.startDate).format("MMMM"))
    );
    return Array.from(uniqueMonths);
  }, [leadsData]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* View Type Selection */}
      <div className="flex gap-4">
        <FormControl size="small">
          <InputLabel>Select Year</InputLabel>
          <Select
            value={viewType}
            onChange={handleViewTypeChange}
            label={"Select Year"}
            sx={{ width: 200 }}
          >
            <MenuItem value="month">Monthly</MenuItem>
            <MenuItem value="year">Yearly</MenuItem>
          </Select>
        </FormControl>

        {viewType === "month" && (
          <FormControl size="small">
            <InputLabel>Select Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Select Month"
              sx={{ width: 200 }}
            >
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      <WidgetSection
        layout={1}
        border
        padding
        title={"Unique Leads"}
        TitleAmount={`Total Leads : ${totalLeads}`}
      >
        <NormalBarGraph data={graphData} options={graphOptions} height={400} />
      </WidgetSection>

      <WidgetSection
        border
        title={"Unique Leads details"}
        TitleAmount={`Total Leads : ${totalLeads}`}
      >
        <div>
          <YearWiseTable
            data={leadsData.map((item) => ({
              _id: item._id,
              dateOfContact: item.dateOfContact,
              companyName: item.companyName,
              pocName: item.pocName,
              contactNumber: item.contactNumber,
              emailAddress: item.emailAddress,
              leadStatus: item.leadStatus,
              sector: item.sector,
              serviceName: item.serviceCategory?.serviceName || "—",
              clientBudget: item.clientBudget,
              startDate: item.startDate,
              remarksComments: item.remarksComments,
            }))}
            columns={[
              { headerName: "Sr. No", field: "srno", width: 100 },
              { headerName: "Date of Contact", field: "dateOfContact" },
              {
                headerName: "Company Name",
                field: "companyName",
                flex: 1,
                cellRenderer: (params) => {
                  return (
                    <span
                      className="text-primary cursor-pointer underline"
                      role="button"
                      onClick={() => {
                        setSelectedLead(params.data);
                        setModalOpen(true);
                      }}
                    >
                      {params.value}
                    </span>
                  );
                },
              },
              { headerName: "POC Name", field: "pocName" },
              { headerName: "Contact Number", field: "contactNumber" },
              // { headerName: "Email", field: "emailAddress" },
              { headerName: "Lead Status", field: "leadStatus" },
              // { headerName: "Sector", field: "sector" },
              // { headerName: "Service", field: "serviceName" },
              // { headerName: "Client Budget", field: "clientBudget" },
              // { headerName: "Start Date", field: "startDate" },
              // { headerName: "Remarks", field: "remarksComments" },
            ]}
            dateColumn="dateOfContact"
            initialMonth={selectedMonth} 
            key="leads-table"
          />
        </div>
      </WidgetSection>
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={"Lead details"}
      >
        <div className="flex flex-col gap-2">
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
        </div>
      </MuiModal>
    </div>
  );
};

export default UniqueLeads;
