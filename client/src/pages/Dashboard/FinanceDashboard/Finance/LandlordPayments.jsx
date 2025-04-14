import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";

const LandlordPayments = () => {
  const collectionData = [
    { month: "Apr-24", paid: 80, unpaid: 20 },
    { month: "May-24", paid: 90, unpaid: 10 },
    { month: "Jun-24", paid: 75, unpaid: 25 },
    { month: "Jul-24", paid: 95, unpaid: 5 },
    { month: "Aug-24", paid: 85, unpaid: 15 },
    { month: "Sep-24", paid: 70, unpaid: 30 },
    { month: "Oct-24", paid: 60, unpaid: 40 },
    { month: "Nov-24", paid: 88, unpaid: 12 },
    { month: "Dec-24", paid: 92, unpaid: 8 },
    { month: "Jan-25", paid: 76, unpaid: 24 },
    { month: "Feb-25", paid: 89, unpaid: 11 },
    { month: "Mar-25", paid: 100, unpaid: 0 },
  ];

  const barGraphData = [
    {
      name: "Paid",
      data: collectionData.map((item) => item.paid),
    },
    {
      name: "Unpaid",
      data: collectionData.map((item) => item.unpaid),
    },
  ];

  const barGraphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
    },
    xaxis: {
      categories: collectionData.map((item) => item.month),
      title: { text: "2024-2025" },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
      },
      title: {
        text: "Client Collection %",
      },
    },
    legend: {
      position: "top",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    colors: ["#4CAF50", "#F44336"], // Green for paid, red for unpaid
  };

  const unitData = [
    {
      unitNo: "501(A)",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Ravi Kumar",
            total: "₹25,000",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Ravi Kumar",
            total: "₹26,000",
          },
        ],
      },
    },
    {
      unitNo: "501(B)",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Sneha Mehta",
            total: "₹24,500",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Sneha Mehta",
            total: "₹25,100",
          },
        ],
      },
    },
    {
      unitNo: "601(A)",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Amit Shah",
            total: "₹28,000",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Amit Shah",
            total: "₹27,800",
          },
        ],
      },
    },
    {
      unitNo: "601(B)",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Priya Das",
            total: "₹27,000",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Priya Das",
            total: "₹27,500",
          },
        ],
      },
    },
    {
      unitNo: "701(A)",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Vikram Singh",
            total: "₹29,500",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Vikram Singh",
            total: "₹30,000",
          },
        ],
      },
    },
    {
      unitNo: "701(B)",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Neha Rathi",
            total: "₹29,000",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Neha Rathi",
            total: "₹29,200",
          },
        ],
      },
    },
    {
      unitNo: "002",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Manish Verma",
            total: "₹23,000",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Manish Verma",
            total: "₹23,400",
          },
        ],
      },
    },
    {
      unitNo: "004",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Ritika Sinha",
            total: "₹22,500",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Ritika Sinha",
            total: "₹23,000",
          },
        ],
      },
    },
    {
      unitNo: "503",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Rohan Desai",
            total: "₹26,300",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Rohan Desai",
            total: "₹26,800",
          },
        ],
      },
    },
    {
      unitNo: "706",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Tina Malhotra",
            total: "₹31,000",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Tina Malhotra",
            total: "₹31,500",
          },
        ],
      },
    },
    {
      unitNo: "703",
      tableData: {
        columns: [
          { field: "srNo", headerName: "Sr No", width: 100 },
          { field: "month", headerName: "Month", width: 120 },
          { field: "landlordName", headerName: "Landlord Name", flex: 1 },
          { field: "total", headerName: "Total", width: 150 },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Kunal Joshi",
            total: "₹30,200",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Kunal Joshi",
            total: "₹30,700",
          },
        ],
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <WidgetSection title={"Landlord Payments 24-25".toUpperCase()} border>
        <BarGraph data={barGraphData} options={barGraphOptions} />
      </WidgetSection>

      <WidgetSection title="Unit Wise Landlord Payments">
        {unitData.map((unit, index) => (
          <Accordion key={index} className="py-4">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls={`panel-${index}-content`}
              id={`panel-${index}-header`}
              className="border-b-[1px] border-borderGray"
            >
              <div className="flex justify-between items-center w-full px-4">
                <span className="text-subtitle font-pmedium">
                  {unit.unitNo}
                </span>
                <span className="text-subtitle font-pmedium">
                  {(() => {
                    const total = unit.tableData.rows.reduce((acc, row) => {
                      const amount = parseInt(
                        row.total.replace(/[₹,]/g, ""),
                        10
                      );
                      return acc + (isNaN(amount) ? 0 : amount);
                    }, 0);

                    return total
                      .toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      })
                      .replace("₹", "INR ");
                  })()}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
              <AgTable
                search
                data={unit.tableData.rows}
                columns={unit.tableData.columns}
                tableHeight={250}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </WidgetSection>
    </div>
  );
};

export default LandlordPayments;
