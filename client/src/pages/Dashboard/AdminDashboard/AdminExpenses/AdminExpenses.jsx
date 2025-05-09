import React, { useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
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
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { inrFormat } from "../../../../utils/currencyFormat";

const AdminExpenses = () => {
  const navigate = useNavigate();
  //Proper columns only in April
  let mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "ST-701A",
          revenue: 15000,
          clients: [
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-20",
              actualRevenue: 6725,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-20",
              actualRevenue: 6450,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-11",
              actualRevenue: 7103,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 26000,
          clients: [
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-02-12",
              actualRevenue: 4548,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-28",
              actualRevenue: 5122,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-09",
              actualRevenue: 6928,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 15000,
          clients: [
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-07",
              actualRevenue: 6144,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-02-09",
              actualRevenue: 5285,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-10",
              actualRevenue: 6766,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 15000,
          clients: [
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-20",
              actualRevenue: 6102,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-01-10",
              actualRevenue: 5696,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-02-14",
              actualRevenue: 6519,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 15000,
          clients: [
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-01-19",
              actualRevenue: 5626,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-02-14",
              actualRevenue: 6571,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-24",
              actualRevenue: 6875,
            },
          ],
        },
      ],
    },
    {
      month: "May",
      domains: [
        {
          name: "ST-701A",
          revenue: 15929,
          clients: [
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-25",
              actualRevenue: 6714,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-18",
              actualRevenue: 5434,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-28",
              actualRevenue: 4620,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 15732,
          clients: [
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-14",
              actualRevenue: 6113,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-02-07",
              actualRevenue: 5967,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-01",
              actualRevenue: 6366,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 15638,
          clients: [
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-24",
              actualRevenue: 4807,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-03",
              actualRevenue: 6205,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-31",
              actualRevenue: 5992,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 15574,
          clients: [
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-02-20",
              actualRevenue: 5929,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-01-07",
              actualRevenue: 6422,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-03-01",
              actualRevenue: 4608,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 15712,
          clients: [
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-02-14",
              actualRevenue: 4674,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-17",
              actualRevenue: 5005,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-28",
              actualRevenue: 6340,
            },
          ],
        },
      ],
    },
    {
      month: "May",
      domains: [
        {
          name: "ST-701A",
          revenue: 16832,
          clients: [
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-02-28",
              actualRevenue: 4626,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-18",
              actualRevenue: 5513,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-30",
              actualRevenue: 4768,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 16404,
          clients: [
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-01-02",
              actualRevenue: 4668,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-04",
              actualRevenue: 6381,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-04",
              actualRevenue: 5389,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 16773,
          clients: [
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-16",
              actualRevenue: 4671,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-04",
              actualRevenue: 6968,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-01-30",
              actualRevenue: 6067,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 16776,
          clients: [
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-14",
              actualRevenue: 5094,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-02-18",
              actualRevenue: 5267,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-02-09",
              actualRevenue: 6008,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 16983,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-18",
              actualRevenue: 6231,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-29",
              actualRevenue: 5345,
            },
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-01-23",
              actualRevenue: 6727,
            },
          ],
        },
      ],
    },
    {
      month: "June",
      domains: [
        {
          name: "ST-701A",
          revenue: 17565,
          clients: [
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-06",
              actualRevenue: 5822,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-27",
              actualRevenue: 5864,
            },
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-01-13",
              actualRevenue: 5821,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 16887,
          clients: [
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-01-10",
              actualRevenue: 5264,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-01-02",
              actualRevenue: 4715,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-01-02",
              actualRevenue: 5297,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 17890,
          clients: [
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-12",
              actualRevenue: 6948,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-01-02",
              actualRevenue: 6734,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-02-25",
              actualRevenue: 6650,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 16732,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-13",
              actualRevenue: 6092,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-22",
              actualRevenue: 6998,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-01-07",
              actualRevenue: 4910,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 17227,
          clients: [
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-02-29",
              actualRevenue: 6547,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-25",
              actualRevenue: 6950,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-02-25",
              actualRevenue: 5359,
            },
          ],
        },
      ],
    },
    {
      month: "July",
      domains: [
        {
          name: "ST-701A",
          revenue: 17719,
          clients: [
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-02-16",
              actualRevenue: 5017,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-29",
              actualRevenue: 4908,
            },
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-01-24",
              actualRevenue: 5831,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 17755,
          clients: [
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-11",
              actualRevenue: 5446,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-02",
              actualRevenue: 6899,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-06",
              actualRevenue: 6272,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 17892,
          clients: [
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-22",
              actualRevenue: 5271,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-19",
              actualRevenue: 6487,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-09",
              actualRevenue: 6141,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 17106,
          clients: [
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-02-14",
              actualRevenue: 4981,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-27",
              actualRevenue: 5813,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-01",
              actualRevenue: 4821,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 18265,
          clients: [
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-01-27",
              actualRevenue: 5497,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-01-11",
              actualRevenue: 6996,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-06",
              actualRevenue: 6052,
            },
          ],
        },
      ],
    },
    {
      month: "August",
      domains: [
        {
          name: "ST-701A",
          revenue: 19994,
          clients: [
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-21",
              actualRevenue: 6390,
            },
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-01-15",
              actualRevenue: 4736,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-02-02",
              actualRevenue: 5707,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 18660,
          clients: [
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-02-20",
              actualRevenue: 5494,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-14",
              actualRevenue: 6508,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-17",
              actualRevenue: 4913,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 18532,
          clients: [
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-02-24",
              actualRevenue: 6923,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-02-12",
              actualRevenue: 6990,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-02-02",
              actualRevenue: 5383,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 17721,
          clients: [
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-01-26",
              actualRevenue: 6288,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-02-08",
              actualRevenue: 5951,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-15",
              actualRevenue: 5078,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 19286,
          clients: [
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-01-27",
              actualRevenue: 6503,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-04",
              actualRevenue: 6186,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-16",
              actualRevenue: 6844,
            },
          ],
        },
      ],
    },
    {
      month: "September",
      domains: [
        {
          name: "ST-701A",
          revenue: 18633,
          clients: [
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-01-22",
              actualRevenue: 4614,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-13",
              actualRevenue: 5893,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-11",
              actualRevenue: 6200,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 18808,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-10",
              actualRevenue: 6143,
            },
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-02-20",
              actualRevenue: 6141,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-03-01",
              actualRevenue: 6319,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 20217,
          clients: [
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-08",
              actualRevenue: 5835,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-22",
              actualRevenue: 5086,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-08",
              actualRevenue: 6591,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 19415,
          clients: [
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-01-17",
              actualRevenue: 4552,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-26",
              actualRevenue: 4784,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-03",
              actualRevenue: 4825,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 18295,
          clients: [
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-17",
              actualRevenue: 4544,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-02-28",
              actualRevenue: 5161,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-27",
              actualRevenue: 6227,
            },
          ],
        },
      ],
    },
    {
      month: "October",
      domains: [
        {
          name: "ST-701A",
          revenue: 21624,
          clients: [
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-29",
              actualRevenue: 6217,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-01-04",
              actualRevenue: 6586,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-11",
              actualRevenue: 5205,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 20968,
          clients: [
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-15",
              actualRevenue: 5864,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-11",
              actualRevenue: 6484,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-17",
              actualRevenue: 4920,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 21398,
          clients: [
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-05",
              actualRevenue: 6868,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-02-08",
              actualRevenue: 5565,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-23",
              actualRevenue: 5820,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 21183,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-20",
              actualRevenue: 5251,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-23",
              actualRevenue: 4570,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-01-19",
              actualRevenue: 6644,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 21286,
          clients: [
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-02-24",
              actualRevenue: 5618,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-02-07",
              actualRevenue: 5254,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-01-16",
              actualRevenue: 6898,
            },
          ],
        },
      ],
    },
    {
      month: "November",
      domains: [
        {
          name: "ST-701A",
          revenue: 19819,
          clients: [
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-02-06",
              actualRevenue: 5112,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-01-03",
              actualRevenue: 4573,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-23",
              actualRevenue: 6989,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 22369,
          clients: [
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-02-22",
              actualRevenue: 5389,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-25",
              actualRevenue: 6385,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-16",
              actualRevenue: 5379,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 21444,
          clients: [
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-01-14",
              actualRevenue: 5785,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-03-01",
              actualRevenue: 5200,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-01-19",
              actualRevenue: 5375,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 20143,
          clients: [
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-02",
              actualRevenue: 6215,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              registerDate: "2024-02-08",
              actualRevenue: 6973,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-02-07",
              actualRevenue: 5731,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 21776,
          clients: [
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-02-28",
              actualRevenue: 5501,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-18",
              actualRevenue: 6307,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-23",
              actualRevenue: 6823,
            },
          ],
        },
      ],
    },
    {
      month: "December",
      domains: [
        {
          name: "ST-701A",
          revenue: 20049,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-03",
              actualRevenue: 5186,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-02",
              actualRevenue: 6031,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-08",
              actualRevenue: 6045,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 21227,
          clients: [
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-01-15",
              actualRevenue: 6364,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-08",
              actualRevenue: 6491,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-02-18",
              actualRevenue: 5092,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 21556,
          clients: [
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-27",
              actualRevenue: 5490,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-01-03",
              actualRevenue: 5439,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-02",
              actualRevenue: 5622,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 19801,
          clients: [
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-09",
              actualRevenue: 6813,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-23",
              actualRevenue: 5607,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-23",
              actualRevenue: 5375,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 23621,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-10",
              actualRevenue: 4848,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-02-06",
              actualRevenue: 6688,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-03",
              actualRevenue: 6401,
            },
          ],
        },
      ],
    },
    {
      month: "January",
      domains: [
        {
          name: "ST-701A",
          revenue: 21079,
          clients: [
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-01",
              actualRevenue: 6936,
            },
            {
              client: "Swiggy",
              representative: "Sophie Turner",
              registerDate: "2024-01-30",
              actualRevenue: 6088,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-03",
              actualRevenue: 5807,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 24041,
          clients: [
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-20",
              actualRevenue: 6772,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-23",
              actualRevenue: 6560,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-02-01",
              actualRevenue: 4701,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 24004,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-14",
              actualRevenue: 5154,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-01-07",
              actualRevenue: 5502,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-03",
              actualRevenue: 6606,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 21270,
          clients: [
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-23",
              actualRevenue: 5294,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-02-11",
              actualRevenue: 6160,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-28",
              actualRevenue: 6707,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 22989,
          clients: [
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-02-20",
              actualRevenue: 6532,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-01-18",
              actualRevenue: 5676,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-15",
              actualRevenue: 4599,
            },
          ],
        },
      ],
    },
    {
      month: "February",
      domains: [
        {
          name: "ST-701A",
          revenue: 21237,
          clients: [
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-01-28",
              actualRevenue: 5189,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              registerDate: "2024-01-17",
              actualRevenue: 5742,
            },
            {
              client: "Amazon",
              representative: "Michael Brown",
              registerDate: "2024-01-04",
              actualRevenue: 4853,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 21126,
          clients: [
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-23",
              actualRevenue: 4879,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-14",
              actualRevenue: 4811,
            },
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-02-25",
              actualRevenue: 6591,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 22706,
          clients: [
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-01-23",
              actualRevenue: 6950,
            },
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-01-25",
              actualRevenue: 6154,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-04",
              actualRevenue: 4935,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 21234,
          clients: [
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              registerDate: "2024-01-16",
              actualRevenue: 5863,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-01-18",
              actualRevenue: 6864,
            },
            {
              client: "Flipkart",
              representative: "Emily White",
              registerDate: "2024-02-07",
              actualRevenue: 4567,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 22978,
          clients: [
            {
              client: "PhonePe",
              representative: "Henry Ford",
              registerDate: "2024-02-23",
              actualRevenue: 6042,
            },
            {
              client: "BigBasket",
              representative: "Oliver Grey",
              registerDate: "2024-02-20",
              actualRevenue: 6629,
            },
            {
              client: "Nykaa",
              representative: "Liam Green",
              registerDate: "2024-02-13",
              actualRevenue: 5177,
            },
          ],
        },
      ],
    },
  ];

  //Calulation of total revenue of each unit
  mockBusinessRevenueData = mockBusinessRevenueData.map((data) => ({
    ...data,
    domains: data.domains.map((domain) => ({
      ...domain,
      revenue: domain.clients.reduce(
        (acc, curr) => acc + curr.actualRevenue,
        0
      ),
    })),
  }));

  const [selectedMonth, setSelectedMonth] = useState(
    mockBusinessRevenueData[0].month
  ); // Default to first month

  // Function to update selected month
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Filter data based on selected month
  const selectedMonthData = mockBusinessRevenueData.find(
    (data) => data.month === selectedMonth
  );

  if (selectedMonthData) {
    selectedMonthData.domains = selectedMonthData.domains.map((domain) => {
      const updatedClients = domain.clients.map((client, index) => ({
        ...client,
        srNo: index + 1,
        registerDate: dayjs(client.registerDate).format("DD-MM-YYYY"),
        actualRevenue: Number(client.actualRevenue).toLocaleString("en-IN"),
      }));
      return { ...domain, clients: updatedClients };
    });
  }

  // Prepare Bar Graph Data
  const graphData = [
    {
      name: "Expense",
      data: selectedMonthData.domains.map((domain) => domain.revenue),
    },
  ];

  // Graph Options
  const options = {
    chart: {
      type: "bar",
      stacked: false,
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: { title: { text: "Number Of Offices" } },
    tooltip: {
      y: {
        formatter: (val) => `INR ${inrFormat(val)}`,
      },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    dataLabels: {
      formatter: (val) => `${inrFormat(val)}`,
    },
    legend: { position: "top" },
     colors: ["#54C4A7", "#EB5C45"],
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Month Selection Dropdown */}
      <div className="mb-4 flex">
        <FormControl size="small">
          <InputLabel>Select Month</InputLabel>
          <Select
            label="Select Month"
            value={selectedMonth}
            onChange={handleMonthChange}
            sx={{ width: "200px" }}>
            {mockBusinessRevenueData.map((data) => (
              <MenuItem key={data.month} value={data.month}>
                {data.month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Bar Graph Component */}
      <WidgetSection layout={1} title={"Admin Expenses"} border>
        <BarGraph data={graphData} options={options} height={400} />
      </WidgetSection>

      {/* Accordion Section for Domain-wise Revenue Breakdown */}
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
        <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="text-sm text-muted font-pmedium text-title">
              LOCATION
            </span>
            <span className="text-sm text-muted font-pmedium text-title flex items-center gap-1">
              EXPENSE
            </span>
          </div>
        </div>
        {selectedMonthData.domains.map((domain, index) => {
          return (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel-${index}-content`}
                id={`panel-${index}-header`}>
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium  ">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    INR {domain.revenue.toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                {/* Details Start */}
                <div className="flex justify-between">
                  <div className="flex justify-between items-center w-80 px-4">
                    <span
                      className="text-subtitle font-pmedium underline text-primary
                      cursor-pointer"
                      onClick={() => {
                        localStorage.setItem("client", domain.name);
                        navigate(
                          `/app/dashboard/admin-dashboard/admin-expenses/admin-expenses-layout/${domain.name}`
                        );
                      }}>
                      View Layout {domain.name}
                    </span>
                    {/* <span className="text-subtitle font-pmedium">
                      {domain.revenue.toLocaleString()}
                    </span> */}
                  </div>
                  <div className="w-4/12 ">
                    <p className="text-subtitle text-primary p-6 w-fit">
                      <span className="font-bold">Admin Lead: </span>
                      Machindranath Parkar
                    </p>
                  </div>
                </div>
                {/* Details End */}
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={[
                    {
                      header: "Sr No",
                      field: "srNo",
                      flex: 1,
                      // cellRenderer: (params) => (
                      //   <span
                      //     style={{
                      //       color: "#1E3D73",
                      //       textDecoration: "underline",
                      //       cursor: "pointer",
                      //     }}
                      //     onClick={() => {
                      //       localStorage.setItem("client", params.data.client);
                      //       navigate(
                      //         `/app/dashboard/admin-dashboard/admin-offices/admin-offices-layout/${params.data.client}`
                      //       );
                      //     }}>
                      //     {params.value}
                      //   </span>
                      // ),
                    },
                    {
                      headerName: "Client",
                      field: "client",
                      flex: 1,
                    },
                    {
                      headerName: "Representative",
                      field: "representative",
                      flex: 1,
                    },
                    {
                      headerName: "Register Date",
                      field: "registerDate",
                      flex: 1,
                    },
                    {
                      headerName: "Expense (INR)",
                      field: "actualRevenue",
                      flex: 1,
                    },
                  ]}
                  tableHeight={300}
                />
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-pregular">
                      Total Expense for {domain.name}:{" "}
                    </span>
                    <span className="text-black font-pmedium">
                      INR {domain.revenue.toLocaleString()}
                    </span>{" "}
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default AdminExpenses;
