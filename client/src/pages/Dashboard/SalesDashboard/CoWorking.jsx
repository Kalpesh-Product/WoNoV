import ParentRevenue from "./ParentRevenue";
import { inrFormat } from "../../../utils/currencyFormat";

const mockSalesData = [
  {
    month: "Apr-24",
    actual: 10000,
    projected: 10000,
    adjustedProjected: 0,
    revenueBreakup: [
      { client: "Client A", revenue: inrFormat(450000), region: "North", industry: "Retail" },
      { client: "Client B", revenue: inrFormat(350000), region: "South", industry: "Finance" },
      { client: "Client C", revenue: inrFormat(200000), region: "West", industry: "Technology" }
    ]
  },
  {
    month: "May-24",
    actual: 10000,
    projected: 11000,
    adjustedProjected: 0,
    revenueBreakup: [
      { client: "Client D", revenue: inrFormat(500000), region: "East", industry: "Healthcare" },
      { client: "Client E", revenue: inrFormat(400000), region: "North", industry: "Retail" },
      { client: "Client F", revenue: inrFormat(210000), region: "West", industry: "Technology" }
    ]
  },
  {
    month: "Jun-24",
    actual: 8000,
    projected: 12000,
    adjustedProjected: 4000,
    revenueBreakup: [
      { client: "Client G", revenue: inrFormat(300000), region: "South", industry: "E-commerce" },
      { client: "Client H", revenue: inrFormat(250000), region: "West", industry: "Logistics" },
      { client: "Client I", revenue: inrFormat(250000), region: "East", industry: "Finance" }
    ]
  },
  {
    month: "Jul-24",
    actual: 7000,
    projected: 10500,
    adjustedProjected: 3500,
    revenueBreakup: [
      { client: "Client J", revenue: inrFormat(400000), region: "North", industry: "Retail" },
      { client: "Client K", revenue: inrFormat(300000), region: "South", industry: "Technology" }
    ]
  },
  {
    month: "Aug-24",
    actual: 9500,
    projected: 11500,
    adjustedProjected: 2000,
    revenueBreakup: [
      { client: "Client L", revenue: inrFormat(450000), region: "East", industry: "Healthcare" },
      { client: "Client M", revenue: inrFormat(350000), region: "West", industry: "Real Estate" },
      { client: "Client N", revenue: inrFormat(150000), region: "North", industry: "Manufacturing" }
    ]
  },
  {
    month: "Sep-24",
    actual: 10200,
    projected: 12500,
    adjustedProjected: 2300,
    revenueBreakup: [
      { client: "Client O", revenue: inrFormat(520000), region: "South", industry: "Automobile" },
      { client: "Client P", revenue: inrFormat(300000), region: "North", industry: "Retail" },
      { client: "Client Q", revenue: inrFormat(200000), region: "West", industry: "Banking" }
    ]
  },
  {
    month: "Oct-24",
    actual: 11500,
    projected: 13500,
    adjustedProjected: 2000,
    revenueBreakup: [
      { client: "Client R", revenue: inrFormat(600000), region: "East", industry: "Technology" },
      { client: "Client S", revenue: inrFormat(400000), region: "North", industry: "Logistics" },
      { client: "Client T", revenue: inrFormat(150000), region: "South", industry: "Retail" }
    ]
  },
  {
    month: "Nov-24",
    actual: 12500,
    projected: 14500,
    adjustedProjected: 2000,
    revenueBreakup: [
      { client: "Client U", revenue: inrFormat(500000), region: "West", industry: "E-commerce" },
      { client: "Client V", revenue: inrFormat(350000), region: "South", industry: "Banking" },
      { client: "Client W", revenue: inrFormat(400000), region: "North", industry: "Healthcare" }
    ]
  },
  {
    month: "Dec-24",
    actual: 14000,
    projected: 15500,
    adjustedProjected: 1500,
    revenueBreakup: [
      { client: "Client X", revenue: inrFormat(700000), region: "East", industry: "Technology" },
      { client: "Client Y", revenue: inrFormat(400000), region: "North", industry: "Retail" },
      { client: "Client Z", revenue: inrFormat(300000), region: "West", industry: "Logistics" }
    ]
  },
  {
    month: "Jan-25",
    actual: 13000,
    projected: 16500,
    adjustedProjected: 3500,
    revenueBreakup: [
      { client: "Client AA", revenue: inrFormat(600000), region: "South", industry: "Manufacturing" },
      { client: "Client AB", revenue: inrFormat(500000), region: "North", industry: "Banking" },
      { client: "Client AC", revenue: inrFormat(200000), region: "West", industry: "E-commerce" }
    ]
  },
  {
    month: "Feb-25",
    actual: 15000,
    projected: 17500,
    adjustedProjected: 2500,
    revenueBreakup: [
      { client: "Client AD", revenue: inrFormat(800000), region: "East", industry: "Technology" },
      { client: "Client AE", revenue: inrFormat(400000), region: "South", industry: "Finance" },
      { client: "Client AF", revenue: inrFormat(300000), region: "North", industry: "Retail" }
    ]
  },
  {
    month: "Mar-25",
    actual: 16000,
    projected: 18500,
    adjustedProjected: 2500,
    revenueBreakup: [
      { client: "Client AG", revenue: inrFormat(700000), region: "West", industry: "Logistics" },
      { client: "Client AH", revenue: inrFormat(600000), region: "North", industry: "Healthcare" },
      { client: "Client AI", revenue: inrFormat(300000), region: "South", industry: "Automobile" }
    ]
  }
];


const CoWorking = () => {
  return (
    <div>
      <ParentRevenue salesData={mockSalesData} financialYear="2024-2025" />
    </div>
  );
};

export default CoWorking;
