import BarGraph from "./BarGraph"; // Import the BarGraph component

const RevenueGraph = ({ annualMonthlyRawData }) => {
  // ✅ Define financial year months
  const financialYearMonths = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  // ✅ Get the current month index relative to the financial year (April = 0, March = 11)
  const currentMonthIndex = new Date().getMonth() - 3;
  const normalizedCurrentMonth =
    currentMonthIndex < 0 ? currentMonthIndex + 12 : currentMonthIndex;

  // ✅ Function to adjust projected data for future months
  const adjustProjectedData = (actualData, projectedData) => {
    let adjustedProjectedData = [...projectedData];
    let carryForward = 0;

    for (let i = 0; i < projectedData.length; i++) {
      if (i <= normalizedCurrentMonth && actualData[i] !== null) {
        adjustedProjectedData[i] = actualData[i];
      } else {
        adjustedProjectedData[i] += carryForward;
        carryForward = adjustedProjectedData[i];
      }
    }
    return adjustedProjectedData;
  };

  // ✅ Initialize revenue arrays
  const actualRevenue = new Array(financialYearMonths.length).fill(0);
  const projectedRevenue = new Array(financialYearMonths.length).fill(0);

  // ✅ Process each domain's revenue
  annualMonthlyRawData.forEach((domain) => {
    const adjustedProjectedData = adjustProjectedData(
      domain.actualData,
      domain.projectedData
    );

    for (let i = 0; i < financialYearMonths.length; i++) {
      if (i <= normalizedCurrentMonth && domain.actualData[i] !== null) {
        actualRevenue[i] += domain.actualData[i];
      } else {
        projectedRevenue[i] += adjustedProjectedData[i];
      }
    }
  });

  // ✅ Calculate total revenues
  const totalActualRevenue = actualRevenue.reduce(
    (sum, value) => sum + value,
    0
  );
  const totalProjectedRevenue = projectedRevenue.reduce(
    (sum, value) => sum + value,
    0
  );

  // ✅ Prepare data for the graph
  const annualMonthlyData = [
    { name: "Actual Revenue", data: actualRevenue, color: "#80bf01" },
    { name: "Projected Revenue", data: projectedRevenue, color: "#1E3D73" },
  ];

  // ✅ Chart options
  const annualMonthlyOptions = {
    chart: { type: "bar", stacked: false, fontFamily:'Poppins-Regular' },
    plotOptions: { bar: { dataLabels: { position: "top" } , columnWidth: "75%",} },
    xaxis: { categories: financialYearMonths, title: { text: "Months" } },
    yaxis: {
      labels: {
        formatter: (val) =>
          val >= 10000000
            ? (val / 10000000).toFixed(1) + "Cr"
            : val >= 100000
            ? (val / 100000).toFixed(1) + "L"
            : val,
      },
      title: { text: "Revenue" },
    },
    legend: { position: "top" },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (val) => new Intl.NumberFormat("en-IN").format(val) },
    },
  };

  return (
    <BarGraph
      customLegend={true}
      firstParam={{ title: "Actual Revenue", data: totalActualRevenue }}
      secondParam={{ title: "Projected Revenue", data: totalProjectedRevenue }}
      height={400}
      data={annualMonthlyData}
      options={annualMonthlyOptions}
    />
  );
};

export default RevenueGraph;
