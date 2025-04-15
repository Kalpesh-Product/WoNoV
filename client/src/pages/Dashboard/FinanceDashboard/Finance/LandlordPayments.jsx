import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import DataCard from "../../../../components/DataCard";
import { useState } from "react";

const LandlordPayments = () => {

  const [units,setUnits] = useState([])

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
    colors: ["#54C4A7", "#EB5C45"], // Green for paid, red for unpaid
  };

 const unitData = [
    {
      "unitNo": "501(A)",
      "buildingName": "Sunteck Kanaka",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 25,000",
            "status": "Paid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 25,200",
            "status": "Paid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 25,400",
            "status": "Paid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 25,600",
            "status": "Unpaid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 25,800",
            "status": "Paid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 26,000",
            "status": "Unpaid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 26,200",
            "status": "Paid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 26,400",
            "status": "Paid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Ravi Kumar",
            "total": "INR 26,600",
            "status": "Paid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Ravi Kumar",
            "total": "INR 26,800",
            "status": "Paid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Ravi Kumar",
            "total": "INR 27,000",
            "status": "Unpaid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Ravi Kumar",
            "total": "INR 27,200",
            "status": "Unpaid"
          }
        ]
      }
    },
    {
      "unitNo": "501(B)",
      "buildingName": "Sunteck Kanaka",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 24,500",
            "status": "Paid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 24,700",
            "status": "Unpaid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 24,900",
            "status": "Unpaid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 25,100",
            "status": "Paid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 25,300",
            "status": "Unpaid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 25,500",
            "status": "Unpaid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 25,700",
            "status": "Unpaid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 25,900",
            "status": "Unpaid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Sneha Mehta",
            "total": "INR 26,100",
            "status": "Unpaid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Sneha Mehta",
            "total": "INR 26,300",
            "status": "Paid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Sneha Mehta",
            "total": "INR 26,500",
            "status": "Unpaid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Sneha Mehta",
            "total": "INR 26,700",
            "status": "Paid"
          }
        ]
      }
    },
    {
      "unitNo": "601(A)",
      "buildingName": "Sunteck Kanaka",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Amit Shah",
            "total": "INR 28,000",
            "status": "Unpaid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Amit Shah",
            "total": "INR 28,200",
            "status": "Paid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Amit Shah",
            "total": "INR 28,400",
            "status": "Unpaid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Amit Shah",
            "total": "INR 28,600",
            "status": "Paid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Amit Shah",
            "total": "INR 28,800",
            "status": "Unpaid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Amit Shah",
            "total": "INR 29,000",
            "status": "Unpaid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Amit Shah",
            "total": "INR 29,200",
            "status": "Unpaid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Amit Shah",
            "total": "INR 29,400",
            "status": "Unpaid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Amit Shah",
            "total": "INR 29,600",
            "status": "Unpaid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Amit Shah",
            "total": "INR 29,800",
            "status": "Unpaid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Amit Shah",
            "total": "INR 30,000",
            "status": "Unpaid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Amit Shah",
            "total": "INR 30,200",
            "status": "Paid"
          }
        ]
      }
    },
    {
      "unitNo": "601(B)",
      "buildingName": "Sunteck Kanaka",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Priya Das",
            "total": "INR 27,000",
            "status": "Paid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Priya Das",
            "total": "INR 27,200",
            "status": "Paid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Priya Das",
            "total": "INR 27,400",
            "status": "Paid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Priya Das",
            "total": "INR 27,600",
            "status": "Unpaid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Priya Das",
            "total": "INR 27,800",
            "status": "Unpaid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Priya Das",
            "total": "INR 28,000",
            "status": "Unpaid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Priya Das",
            "total": "INR 28,200",
            "status": "Paid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Priya Das",
            "total": "INR 28,400",
            "status": "Paid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Priya Das",
            "total": "INR 28,600",
            "status": "Paid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Priya Das",
            "total": "INR 28,800",
            "status": "Unpaid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Priya Das",
            "total": "INR 29,000",
            "status": "Paid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Priya Das",
            "total": "INR 29,200",
            "status": "Paid"
          }
        ]
      }
    },
    {
      "unitNo": "701(A)",
      "buildingName": "Sunteck Kanaka",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Vikram Singh",
            "total": "INR 29,500",
            "status": "Unpaid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Vikram Singh",
            "total": "INR 29,700",
            "status": "Paid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Vikram Singh",
            "total": "INR 29,900",
            "status": "Paid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Vikram Singh",
            "total": "INR 30,100",
            "status": "Paid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Vikram Singh",
            "total": "INR 30,300",
            "status": "Unpaid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Vikram Singh",
            "total": "INR 30,500",
            "status": "Paid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Vikram Singh",
            "total": "INR 30,700",
            "status": "Paid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Vikram Singh",
            "total": "INR 30,900",
            "status": "Unpaid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Vikram Singh",
            "total": "INR 31,100",
            "status": "Unpaid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Vikram Singh",
            "total": "INR 31,300",
            "status": "Unpaid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Vikram Singh",
            "total": "INR 31,500",
            "status": "Paid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Vikram Singh",
            "total": "INR 31,700",
            "status": "Unpaid"
          }
        ]
      }
    },
    {
      "unitNo": "701(B)",
      "buildingName": "Sunteck Kanaka",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Neha Rathi",
            "total": "INR 29,000",
            "status": "Unpaid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Neha Rathi",
            "total": "INR 29,200",
            "status": "Unpaid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Neha Rathi",
            "total": "INR 29,400",
            "status": "Unpaid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Neha Rathi",
            "total": "INR 29,600",
            "status": "Paid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Neha Rathi",
            "total": "INR 29,800",
            "status": "Unpaid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Neha Rathi",
            "total": "INR 30,000",
            "status": "Paid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Neha Rathi",
            "total": "INR 30,200",
            "status": "Paid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Neha Rathi",
            "total": "INR 30,400",
            "status": "Unpaid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Neha Rathi",
            "total": "INR 30,600",
            "status": "Unpaid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Neha Rathi",
            "total": "INR 30,800",
            "status": "Unpaid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Neha Rathi",
            "total": "INR 31,000",
            "status": "Paid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Neha Rathi",
            "total": "INR 31,200",
            "status": "Unpaid"
          }
        ]
      }
    },
    {
      "unitNo": "002",
      "buildingName": "Dempo Trade Centre",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Manish Verma",
            "total": "INR 23,000",
            "status": "Unpaid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Manish Verma",
            "total": "INR 23,200",
            "status": "Unpaid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Manish Verma",
            "total": "INR 23,400",
            "status": "Unpaid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Manish Verma",
            "total": "INR 23,600",
            "status": "Paid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Manish Verma",
            "total": "INR 23,800",
            "status": "Unpaid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Manish Verma",
            "total": "INR 24,000",
            "status": "Paid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Manish Verma",
            "total": "INR 24,200",
            "status": "Unpaid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Manish Verma",
            "total": "INR 24,400",
            "status": "Unpaid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Manish Verma",
            "total": "INR 24,600",
            "status": "Paid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Manish Verma",
            "total": "INR 24,800",
            "status": "Unpaid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Manish Verma",
            "total": "INR 25,000",
            "status": "Paid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Manish Verma",
            "total": "INR 25,200",
            "status": "Paid"
          }
        ]
      }
    },
    {
      "unitNo": "004",
      "buildingName": "Dempo Trade Centre",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 22,500",
            "status": "Paid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 22,700",
            "status": "Unpaid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 22,900",
            "status": "Paid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 23,100",
            "status": "Unpaid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 23,300",
            "status": "Paid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 23,500",
            "status": "Paid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 23,700",
            "status": "Paid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 23,900",
            "status": "Paid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Ritika Sinha",
            "total": "INR 24,100",
            "status": "Unpaid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Ritika Sinha",
            "total": "INR 24,300",
            "status": "Unpaid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Ritika Sinha",
            "total": "INR 24,500",
            "status": "Paid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Ritika Sinha",
            "total": "INR 24,700",
            "status": "Unpaid"
          }
        ]
      }
    },
    {
      "unitNo": "503",
      "buildingName": "Dempo Trade Centre",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Rohan Desai",
            "total": "INR 26,300",
            "status": "Unpaid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Rohan Desai",
            "total": "INR 26,500",
            "status": "Unpaid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Rohan Desai",
            "total": "INR 26,700",
            "status": "Unpaid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Rohan Desai",
            "total": "INR 26,900",
            "status": "Unpaid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Rohan Desai",
            "total": "INR 27,100",
            "status": "Paid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Rohan Desai",
            "total": "INR 27,300",
            "status": "Paid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Rohan Desai",
            "total": "INR 27,500",
            "status": "Unpaid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Rohan Desai",
            "total": "INR 27,700",
            "status": "Paid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Rohan Desai",
            "total": "INR 27,900",
            "status": "Paid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Rohan Desai",
            "total": "INR 28,100",
            "status": "Unpaid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Rohan Desai",
            "total": "INR 28,300",
            "status": "Paid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Rohan Desai",
            "total": "INR 28,500",
            "status": "Paid"
          }
        ]
      }
    },
    {
      "unitNo": "706",
      "buildingName": "Dempo Trade Centre",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 31,000",
            "status": "Paid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 31,200",
            "status": "Paid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 31,400",
            "status": "Unpaid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 31,600",
            "status": "Unpaid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 31,800",
            "status": "Paid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 32,000",
            "status": "Paid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 32,200",
            "status": "Unpaid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 32,400",
            "status": "Paid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Tina Malhotra",
            "total": "INR 32,600",
            "status": "Unpaid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Tina Malhotra",
            "total": "INR 32,800",
            "status": "Paid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Tina Malhotra",
            "total": "INR 33,000",
            "status": "Unpaid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Tina Malhotra",
            "total": "INR 33,200",
            "status": "Paid"
          }
        ]
      }
    },
    {
      "unitNo": "703",
      "buildingName": "Dempo Trade Centre",
      "tableData": {
        "columns": [
          {
            "field": "srNo",
            "headerName": "Sr No",
            "width": 100
          },
          {
            "field": "month",
            "headerName": "Month",
            "width": 120
          },
          {
            "field": "landlordName",
            "headerName": "Landlord Name",
            "flex": 1
          },
          {
            "field": "total",
            "headerName": "Total",
            "width": 150
          },
          {
            "field": "status",
            "headerName": "Status",
            "width": 120
          }
        ],
        "rows": [
          {
            "srNo": 1,
            "month": "Apr-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 30,200",
            "status": "Unpaid"
          },
          {
            "srNo": 2,
            "month": "May-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 30,400",
            "status": "Unpaid"
          },
          {
            "srNo": 3,
            "month": "Jun-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 30,600",
            "status": "Paid"
          },
          {
            "srNo": 4,
            "month": "Jul-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 30,800",
            "status": "Paid"
          },
          {
            "srNo": 5,
            "month": "Aug-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 31,000",
            "status": "Unpaid"
          },
          {
            "srNo": 6,
            "month": "Sep-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 31,200",
            "status": "Paid"
          },
          {
            "srNo": 7,
            "month": "Oct-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 31,400",
            "status": "Paid"
          },
          {
            "srNo": 8,
            "month": "Nov-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 31,600",
            "status": "Paid"
          },
          {
            "srNo": 9,
            "month": "Dec-24",
            "landlordName": "Kunal Joshi",
            "total": "INR 31,800",
            "status": "Paid"
          },
          {
            "srNo": 10,
            "month": "Jan-25",
            "landlordName": "Kunal Joshi",
            "total": "INR 32,000",
            "status": "Paid"
          },
          {
            "srNo": 11,
            "month": "Feb-25",
            "landlordName": "Kunal Joshi",
            "total": "INR 32,200",
            "status": "Paid"
          },
          {
            "srNo": 12,
            "month": "Mar-25",
            "landlordName": "Kunal Joshi",
            "total": "INR 32,400",
            "status": "Unpaid"
          }
        ]
      }
    }
  ]

  const handleFilterUnits = (buildingName) => {
    
    const filteredUnits = unitData.filter((unit)=> unit.buildingName === buildingName)

    setUnits(filteredUnits)
  }

  return (
    <div className="flex flex-col gap-8">
      <WidgetSection titleLabel={"FY 2024-25"} title={"Landlord Payments".toUpperCase()} border>
        <BarGraph data={barGraphData} options={barGraphOptions} />
      </WidgetSection>

       <div className="flex gap-4">
       <DataCard
                    
                    title={"Sunteck Kanaka"}
                    description={"Total Units: 06"}
                    onClick = {()=> handleFilterUnits("Sunteck Kanaka")}
                  />
                    <DataCard
                            
                                title={"Dempo Trade Centre"}
                                description={"Total Units: 05"}
                                onClick = {()=> handleFilterUnits("Dempo Trade Centre")}
                              />
       </div>

      <WidgetSection title="Unit Wise Landlord Payments" border>
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
                        row.total.replace(/[INR ,]/g, ""),
                        10
                      );
                      return acc + (isNaN(amount) ? 0 : amount);
                    }, 0);

                    return "INR " + total.toLocaleString("en-IN")
                       
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
