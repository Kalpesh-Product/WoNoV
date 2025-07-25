import { useEffect, useMemo, useState } from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
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
  const [searchParams] = useSearchParams();
  const queryMonth = searchParams.get("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState([]);

  const [selectedFY, setSelectedFY] = useState("FY 2024-25");
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

  const handleViewClient = (lead) => {
    const selectedLeadData = leadsData.find(
      (item) => item.client === lead.companyname
    );

    setSelectedLead(selectedLeadData);
    setModalOpen(true);
  };
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
  const availableMonths = useMemo(() => {
    const uniqueMonths = new Set(
      leadsData
        .map((lead) => dayjs(lead.dateOfContact).format("MMMM"))
        .filter((m) => m !== "Invalid Date")
    );

    return Array.from(uniqueMonths).sort(
      (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );
  }, [leadsData]);

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
      <div className="flex gap-4 w-full justify-end">
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
          <AgTable
            data={filteredLeads.map((item, index) => ({
              _id: item._id,
              srNo: index + 1,
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
              { headerName: "Sr. No", field: "srNo", width: 100 },
              {
                headerName: "Date of Contact",
                field: "dateOfContact",
                cellRenderer: (params) => humanDate(params.value),
              },
              {
                headerName: "Company Name",
                field: "companyName",
                flex: 1,
                cellRenderer: (params) => {
                  const clientData = params.data
                  return (
                    <span
                      className="text-primary cursor-pointer underline"
                      role="button"
                      onClick={() => {
                        navigate(params.value, { state: {
                          selectedLead: params.data,
                        } });
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
