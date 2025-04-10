import React from "react";
import ParentRevenue from "./ParentRevenue";

const mockSalesData = [
  {
    month: "Apr-24",
    actual: 10000,
    projected: 10000,
    adjustedProjected: 0,
    revenueBreakup: [
      { client: "Client A", revenue: 4500, region: "North", industry: "Retail" },
      { client: "Client B", revenue: 3500, region: "South", industry: "Finance" },
      { client: "Client C", revenue: 2000, region: "West", industry: "Technology" },
    ],
  },
  {
    month: "May-24",
    actual: 11000,
    projected: 11000,
    adjustedProjected: 0,
    revenueBreakup: [
      { client: "Client D", revenue: 5000, region: "East", industry: "Healthcare" },
      { client: "Client E", revenue: 4000, region: "North", industry: "Retail" },
      { client: "Client F", revenue: 2100, region: "West", industry: "Technology" },
    ],
  },
  {
    month: "Jun-24",
    actual: 8000,
    projected: 12000,
    adjustedProjected: 4000,
    revenueBreakup: [
      { client: "Client G", revenue: 3000, region: "South", industry: "E-commerce" },
      { client: "Client H", revenue: 2500, region: "West", industry: "Logistics" },
      { client: "Client I", revenue: 2500, region: "East", industry: "Finance" },
    ],
  },
  {
    month: "Jul-24",
    actual: 7000,
    projected: 10500,
    adjustedProjected: 3500,
    revenueBreakup: [
      { client: "Client J", revenue: 4000, region: "North", industry: "Retail" },
      { client: "Client K", revenue: 3000, region: "South", industry: "Technology" },
    ],
  },
  {
    month: "Aug-24",
    actual: 9500,
    projected: 11500,
    adjustedProjected: 2000,
    revenueBreakup: [
      { client: "Client L", revenue: 4500, region: "East", industry: "Healthcare" },
      { client: "Client M", revenue: 3500, region: "West", industry: "Real Estate" },
      { client: "Client N", revenue: 1500, region: "North", industry: "Manufacturing" },
    ],
  },
  {
    month: "Sep-24",
    actual: 10200,
    projected: 12500,
    adjustedProjected: 2300,
    revenueBreakup: [
      { client: "Client O", revenue: 5200, region: "South", industry: "Automobile" },
      { client: "Client P", revenue: 3000, region: "North", industry: "Retail" },
      { client: "Client Q", revenue: 2000, region: "West", industry: "Banking" },
    ],
  },
  {
    month: "Oct-24",
    actual: 11500,
    projected: 13500,
    adjustedProjected: 2000,
    revenueBreakup: [
      { client: "Client R", revenue: 6000, region: "East", industry: "Technology" },
      { client: "Client S", revenue: 4000, region: "North", industry: "Logistics" },
      { client: "Client T", revenue: 1500, region: "South", industry: "Retail" },
    ],
  },
  {
    month: "Nov-24",
    actual: 12500,
    projected: 14500,
    adjustedProjected: 2000,
    revenueBreakup: [
      { client: "Client U", revenue: 5000, region: "West", industry: "E-commerce" },
      { client: "Client V", revenue: 3500, region: "South", industry: "Banking" },
      { client: "Client W", revenue: 4000, region: "North", industry: "Healthcare" },
    ],
  },
  {
    month: "Dec-24",
    actual: 14000,
    projected: 15500,
    adjustedProjected: 1500,
    revenueBreakup: [
      { client: "Client X", revenue: 7000, region: "East", industry: "Technology" },
      { client: "Client Y", revenue: 4000, region: "North", industry: "Retail" },
      { client: "Client Z", revenue: 3000, region: "West", industry: "Logistics" },
    ],
  },
  {
    month: "Jan-25",
    actual: 13000,
    projected: 16500,
    adjustedProjected: 3500,
    revenueBreakup: [
      { client: "Client AA", revenue: 6000, region: "South", industry: "Manufacturing" },
      { client: "Client AB", revenue: 5000, region: "North", industry: "Banking" },
      { client: "Client AC", revenue: 2000, region: "West", industry: "E-commerce" },
    ],
  },
  {
    month: "Feb-25",
    actual: 15000,
    projected: 17500,
    adjustedProjected: 2500,
    revenueBreakup: [
      { client: "Client AD", revenue: 8000, region: "East", industry: "Technology" },
      { client: "Client AE", revenue: 4000, region: "South", industry: "Finance" },
      { client: "Client AF", revenue: 3000, region: "North", industry: "Retail" },
    ],
  },
  {
    month: "Mar-25",
    actual: 16000,
    projected: 18500,
    adjustedProjected: 2500,
    revenueBreakup: [
      { client: "Client AG", revenue: 7000, region: "West", industry: "Logistics" },
      { client: "Client AH", revenue: 6000, region: "North", industry: "Healthcare" },
      { client: "Client AI", revenue: 3000, region: "South", industry: "Automobile" },
    ],
  },
];


const MeetingRevenue = () => {
  return (
    <div>
      <ParentRevenue salesData={mockSalesData} financialYear="2024-2025" />
    </div>
  );
};

export default MeetingRevenue;
