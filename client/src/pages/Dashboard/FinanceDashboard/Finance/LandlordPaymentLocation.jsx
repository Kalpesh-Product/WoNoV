import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { useLocation, useSearchParams } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import WidgetSection from "../../../../components/WidgetSection";
import MonthWiseTable from "../../../../components/Tables/MonthWiseTable";
import humanDate from "../../../../utils/humanDateForamt";
import { inrFormat } from "../../../../utils/currencyFormat";

const LandlordPaymentLocation = () => {
  const axios = useAxiosPrivate();
  const [searchParams] = useSearchParams();
    const location = useLocation();
    const { unitId} = location.state || {};
   const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const building = searchParams.get("location");
  const rawUnit = searchParams.get("floor");
  const unit = rawUnit?.replace(/[()]/g, "");
  const buildingInitials = building
    ? (() => {
      const words = building.split(" ");
      if (words[0] === "Sunteck") {
        return "ST";
      }
      return `${words[0][0]}${words[words.length - 1][0]}`;
    })()
    : "";

   const {
    data: landlordPayments = [],
    isLoading: landlordPaymentsLoading,
    error: landlordPaymentsError,
  } = useQuery({
    queryKey: ["landlordPayments"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/landlord-payments?unit=${unit}`
      );
      
      return response.data;
    },
  });

  const unitData = [
    {
      unitNo: "501(A)",
      buildingName: "Sunteck Kanaka",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Ravi Kumar",
            total: "25,000",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Kunal Joshi",
            total: "25,200",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Sara Fernandes",
            total: "25,400",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Zina Malik",
            total: "25,600",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Arun Kashyap",
            total: "25,800",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Sara Fernandes",
            total: "26,000",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Anne Dsouza",
            total: "26,200",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Naaz Bwannavar",
            total: "26,400",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Allan Mark",
            total: "26,600",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Jhon Robert",
            total: "26,800",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Sankalp Kalangutkar",
            total: "27,000",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Aiwinraj KS",
            total: "27,200",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "501(B)",
      buildingName: "Sunteck Kanaka",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Sneha Mehta",
            total: "24,500",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Sneha Mehta",
            total: "24,700",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Sneha Mehta",
            total: "24,900",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Sneha Mehta",
            total: "25,100",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Sneha Mehta",
            total: "25,300",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Sneha Mehta",
            total: "25,500",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Sneha Mehta",
            total: "25,700",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Sneha Mehta",
            total: "25,900",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Sneha Mehta",
            total: "26,100",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Sneha Mehta",
            total: "26,300",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Sneha Mehta",
            total: "26,500",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Sneha Mehta",
            total: "26,700",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "601(A)",
      buildingName: "Sunteck Kanaka",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Amit Shah",
            total: "28,000",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Amit Shah",
            total: "28,200",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Amit Shah",
            total: "28,400",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Amit Shah",
            total: "28,600",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Amit Shah",
            total: "28,800",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Amit Shah",
            total: "29,000",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Amit Shah",
            total: "29,200",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Amit Shah",
            total: "29,400",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Amit Shah",
            total: "29,600",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Amit Shah",
            total: "29,800",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Amit Shah",
            total: "30,000",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Amit Shah",
            total: "30,200",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "601(B)",
      buildingName: "Sunteck Kanaka",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Ravi Kumar",
            total: "27,000",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Kunal Joshi",
            total: "27,200",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Sara Fernandes",
            total: "27,400",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Zina Malik",
            total: "27,600",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Arun Kashyap",
            total: "27,800",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Sara Fernandes",
            total: "28,000",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Anne Dsouza",
            total: "28,200",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Naaz Bwannavar",
            total: "28,400",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Allan Mark",
            total: "28,600",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Jhon Robert",
            total: "28,800",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Sankalp Kalangutkar",
            total: "29,000",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Aiwinraj KS",
            total: "29,200",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "701(A)",
      buildingName: "Sunteck Kanaka",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Vikram Singh",
            total: "29,500",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Vikram Singh",
            total: "29,700",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Vikram Singh",
            total: "29,900",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Vikram Singh",
            total: "30,100",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Vikram Singh",
            total: "30,300",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Vikram Singh",
            total: "30,500",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Vikram Singh",
            total: "30,700",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Vikram Singh",
            total: "30,900",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Vikram Singh",
            total: "31,100",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Vikram Singh",
            total: "31,300",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Vikram Singh",
            total: "31,500",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Vikram Singh",
            total: "31,700",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "701(B)",
      buildingName: "Sunteck Kanaka",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Ravi Kumar",
            total: "29,000",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Kunal Joshi",
            total: "29,200",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Sara Fernandes",
            total: "29,400",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Zina Malik",
            total: "29,600",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Arun Kashyap",
            total: "29,800",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Sara Fernandes",
            total: "30,000",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Anne Dsouza",
            total: "30,200",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Naaz Bwannavar",
            total: "30,400",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Allan Mark",
            total: "30,600",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Jhon Robert",
            total: "30,800",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Sankalp Kalangutkar",
            total: "31,000",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Aiwinraj KS",
            total: "31,200",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "002",
      buildingName: "Dempo Trade Centre",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Manish Verma",
            total: "23,000",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Manish Verma",
            total: "23,200",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Manish Verma",
            total: "23,400",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Manish Verma",
            total: "23,600",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Manish Verma",
            total: "23,800",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Manish Verma",
            total: "24,000",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Manish Verma",
            total: "24,200",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Manish Verma",
            total: "24,400",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Manish Verma",
            total: "24,600",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Manish Verma",
            total: "24,800",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Manish Verma",
            total: "25,000",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Manish Verma",
            total: "25,200",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "004",
      buildingName: "Dempo Trade Centre",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Ritika Sinha",
            total: "22,500",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Ritika Sinha",
            total: "22,700",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Ritika Sinha",
            total: "22,900",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Ritika Sinha",
            total: "23,100",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Ritika Sinha",
            total: "23,300",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Ritika Sinha",
            total: "23,500",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Ritika Sinha",
            total: "23,700",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Ritika Sinha",
            total: "23,900",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Ritika Sinha",
            total: "24,100",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Ritika Sinha",
            total: "24,300",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Ritika Sinha",
            total: "24,500",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Ritika Sinha",
            total: "24,700",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "503",
      buildingName: "Dempo Trade Centre",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Rohan Desai",
            total: "26,300",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Rohan Desai",
            total: "26,500",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Rohan Desai",
            total: "26,700",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Rohan Desai",
            total: "26,900",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Rohan Desai",
            total: "27,100",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Rohan Desai",
            total: "27,300",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Rohan Desai",
            total: "27,500",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Rohan Desai",
            total: "27,700",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Rohan Desai",
            total: "27,900",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Rohan Desai",
            total: "28,100",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Rohan Desai",
            total: "28,300",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Rohan Desai",
            total: "28,500",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "706",
      buildingName: "Dempo Trade Centre",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
            flex: 1,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Tina Malhotra",
            total: "31,000",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Tina Malhotra",
            total: "31,200",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Tina Malhotra",
            total: "31,400",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Tina Malhotra",
            total: "31,600",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Tina Malhotra",
            total: "31,800",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Tina Malhotra",
            total: "32,000",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Tina Malhotra",
            total: "32,200",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Tina Malhotra",
            total: "32,400",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Tina Malhotra",
            total: "32,600",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Tina Malhotra",
            total: "32,800",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Tina Malhotra",
            total: "33,000",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Tina Malhotra",
            total: "33,200",
            status: "Unpaid",
          },
        ],
      },
    },
    {
      unitNo: "703",
      buildingName: "Dempo Trade Centre",
      tableData: {
        columns: [
          {
            field: "srNo",
            headerName: "Sr No",
            width: 100,
          },
          {
            field: "month",
            headerName: "Month",
            width: 120,
          },
          {
            field: "landlordName",
            headerName: "Landlord Name",
            flex: 1,
          },
          {
            field: "total",
            headerName: "Total",
            width: 150,
          },
          {
            field: "status",
            headerName: "Status",
            width: 120,
          },
        ],
        rows: [
          {
            srNo: 1,
            month: "Apr-24",
            landlordName: "Kunal Joshi",
            total: "30,200",
            status: "Paid",
          },
          {
            srNo: 2,
            month: "May-24",
            landlordName: "Kunal Joshi",
            total: "30,400",
            status: "Paid",
          },
          {
            srNo: 3,
            month: "Jun-24",
            landlordName: "Kunal Joshi",
            total: "30,600",
            status: "Paid",
          },
          {
            srNo: 4,
            month: "Jul-24",
            landlordName: "Kunal Joshi",
            total: "30,800",
            status: "Paid",
          },
          {
            srNo: 5,
            month: "Aug-24",
            landlordName: "Kunal Joshi",
            total: "31,000",
            status: "Paid",
          },
          {
            srNo: 6,
            month: "Sep-24",
            landlordName: "Kunal Joshi",
            total: "31,200",
            status: "Paid",
          },
          {
            srNo: 7,
            month: "Oct-24",
            landlordName: "Kunal Joshi",
            total: "31,400",
            status: "Paid",
          },
          {
            srNo: 8,
            month: "Nov-24",
            landlordName: "Kunal Joshi",
            total: "31,600",
            status: "Paid",
          },
          {
            srNo: 9,
            month: "Dec-24",
            landlordName: "Kunal Joshi",
            total: "31,800",
            status: "Paid",
          },
          {
            srNo: 10,
            month: "Jan-25",
            landlordName: "Kunal Joshi",
            total: "32,000",
            status: "Paid",
          },
          {
            srNo: 11,
            month: "Feb-25",
            landlordName: "Kunal Joshi",
            total: "32,200",
            status: "Paid",
          },
          {
            srNo: 12,
            month: "Mar-25",
            landlordName: "Kunal Joshi",
            total: "32,400",
            status: "Unpaid",
          },
        ],
      },
    },
  ];

   const paymentColumns = [
          {
            field: "srno",
            headerName: "Sr No",
            width: 100,
            flex: 1,
          },
          // {
          //   field: "month",
          //   headerName: "Month",
          //   width: 120,
          //   flex: 1,
          // },
          {
            field: "expanseName",
            headerName: "Expanse Name",
            width: 120,
            flex: 1,
          },
          {
            field: "projectedAmount",
            headerName: "Projected Amount (INR)",
            width: 120,
            flex: 1,
          },
          {
            field: "actualAmount",
            headerName: "Actual Amount (INR)",
            width: 120,
            flex: 1,
          },
          {
            field: "dueDate",
            headerName: "Due Date",
            width: 120,
            flex: 1,
          },
            {
            field: "status",
            headerName: "Status",
            width: 120,
            flex: 1,
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                  <span
                    className="text-subtitle cursor-pointer"
                    onClick={() => handleViewModal(params.data)}>
                    <MdOutlineRemoveRedEye />
                  </span>
                </div>
              </>
            ),
          },
        ]

  const removeParanthesis = (unit) => {
    const newunit = unit?.replace(/[()]/g, "");
    return newunit;
  };

  const unitEntry = unitData.find((u) => removeParanthesis(u.unitNo) === unit);
  const columns = unitEntry?.tableData?.columns || [];
  const rows = unitEntry?.tableData?.rows || [];

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  return (
    <div className="p-4">

      <WidgetSection layout={1} title={`Landlord Payments (${buildingInitials}- ${unit})`} border>
            <MonthWiseTable
            dateColumn={"dueDate"}
              data={
                !landlordPaymentsLoading
                  ? landlordPayments.allBudgets?.map((payment, index) => (
                    {...payment,
                      projectedAmount: inrFormat(payment.projectedAmount),
                      actualAmount: inrFormat(payment.actualAmount),
                    }
                  ))
                  : []
              }
              columns={paymentColumns}
              
            />
          </WidgetSection>

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Landlord Payment Details"
        >
          <div className="space-y-3">
            <DetalisFormatted title="Month" detail={viewDetails.month} />
            <DetalisFormatted title="Expanse Name" detail={viewDetails.expanseName} />
            <DetalisFormatted title="Department" detail={viewDetails.department.name} />
            <DetalisFormatted
              title="Projected Amount"
              detail={`INR ${ viewDetails.projectedAmount }`}
            />
            <DetalisFormatted
              title="Actual Amount"
              detail={`INR ${viewDetails.actualAmount}`}
            />
             <DetalisFormatted title="Due Date" detail={humanDate(viewDetails.dueDate)} />
             <DetalisFormatted title="Status" detail={viewDetails.status} />
             <DetalisFormatted title="Extra Budget" detail={viewDetails.isExtraBudget ? "Yes" : "No"} />
          </div>
        </MuiModal>
      )}

    </div>
  );
};

export default LandlordPaymentLocation;
