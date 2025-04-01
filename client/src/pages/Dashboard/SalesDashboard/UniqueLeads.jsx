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

const UniqueLeads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const leadsData = useSelector((state) => state.sales.leadsData);


  const [searchParams] = useSearchParams();
  const queryMonth = searchParams.get("month");
  const [modalOpen,setModalOpen]= useState(false);
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
      const leadMonth = dayjs(lead.startDate).format("MMMM");
      if (leadMonth !== selectedMonth) return;

      const domainName = lead.serviceCategory?.serviceName || "Unknown";

      if (!domainsMap[domainName]) {
        domainsMap[domainName] = {
          revenue: 0,
          clients: [],
        };
      }

      domainsMap[domainName].revenue += lead.estimatedRevenue || 0;
      domainsMap[domainName].clients.push({
        client: lead.companyName,
        representative: lead.pocName,
        callDate: humanDate(lead.startDate),
        status: lead.remarksComments,
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


  // 🧠 Yearly Revenue Data
  const yearlyRevenueData = useMemo(() => {
    const revenueMap = {};

    leadsData.forEach((lead) => {
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

  const handleViewClient = (lead)=>{
    const selectedLeadData = leadsData.find((item) => item.client === lead.companyname);
    console.log("Selected lead Data : ",selectedLeadData)
    setSelectedLead(selectedLeadData);
    setModalOpen(true)
  }
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
    chart: { type: "bar", stacked: false, fontFamily: "Poppins-Regular" },
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
    dataLabels: { enabled: false },
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

      <WidgetSection layout={1} border padding title={"Unique Leads"}>
        <BarGraph data={graphData} options={graphOptions} height={400} />
      </WidgetSection>

      <div>
        {viewType === "month"
          ? selectedMonthData?.domains.map((domain, index) => (
              <Accordion key={index} className="py-4">
                <AccordionSummary
                  expandIcon={<IoIosArrowDown />}
                >
                  <div className="flex justify-between items-center w-full px-4">
                    <span className="text-subtitle font-medium">
                      {domain.name}
                    </span>
                  </div>
                </AccordionSummary>
                <AccordionDetails sx={{borderTop:'0.5px solid gray'}}>
                  <AgTable
                    data={domain.clients}

                    columns={[
                      { field: "client", headerName: "Client Name", flex: 1 },
                      {
                        field: "representative",
                        headerName: "Representative",
                        flex: 1,
                      },
                      { field: "callDate", headerName: "Call Date", flex: 1 },
                      {
                        field: "status",
                        headerName: "Status",
                        flex: 1,
                        tooltipField: "status",
                      },
                      {
                        field: "actions",
                        headerName: "Actions",
                        cellRenderer: (params) => {
                          return (
                          <div className="p-2">
                            <PrimaryButton title={"View More"}  />
                          </div>
                        )},
                      },
                    ]}
                    tableHeight={500}
                  />
                </AccordionDetails>
              </Accordion>
            ))
          : Object.entries(yearlyRevenueData).map(
              ([domainName, data], index) => (
                <Accordion key={index} className="py-4">
                  <AccordionSummary
                    expandIcon={<IoIosArrowDown />}
                   
                  >
                    <div className="flex justify-between items-center w-full px-4">
                      <span className="text-subtitle font-medium">
                        {domainName}
                      </span>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails  sx={{borderTop:'0.5px solid gray'}}>
                    <AgTable
                      data={data.clients}
                      columns={[
                        { field: "client", headerName: "Client Name", flex: 1 },
                        {
                          field: "representative",
                          headerName: "Representative",
                          flex: 1,
                        },
                        { field: "callDate", headerName: "Call Date", flex: 1 },
                        { field: "status", headerName: "Status", flex: 1 },
                      ]}
                      tableHeight={300}
                    />
                  </AccordionDetails>
                </Accordion>
              )
            )}
      </div>
      <MuiModal open={modalOpen} onClose={()=>setModalOpen(false)}>
            <span>{selectedLead}</span>
      </MuiModal>
    </div>
  );
};

export default UniqueLeads;
