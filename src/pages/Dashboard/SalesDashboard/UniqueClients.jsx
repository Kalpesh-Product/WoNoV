import React from "react";
import LeadsLayout from "./ViewClients/LeadsLayout";

const UniqueClients = () => {
  const domainData = [
    {
      month: "April",
      clients: [
        {
          client: "IBDO",
          typeOfClient: "Co-Working",
          date: "2024-04-05",
          paymentStatus: "Paid",
        },
        {
          client: "Microsoft",
          typeOfClient: "Co-Working",
          date: "2024-04-08",
          paymentStatus: "Pending",
        },
        {
          client: "Apple",
          typeOfClient: "Workations",
          date: "2024-04-12",
          paymentStatus: "Paid",
        },
        {
          client: "One Shield",
          typeOfClient: "Virtual Office",
          date: "2024-04-15",
          paymentStatus: "Unpaid",
        },
      ],
    },
    {
      month: "May",
      clients: [
        {
          client: "Swiggy",
          typeOfClient: "Co-Working",
          date: "2024-05-10",
          paymentStatus: "Paid",
        },
        {
          client: "Spotify",
          typeOfClient: "Co-Living",
          date: "2024-05-14",
          paymentStatus: "Pending",
        },
        {
          client: "Walmart",
          typeOfClient: "Workations",
          date: "2024-05-18",
          paymentStatus: "Paid",
        },
      ],
    },
    {
      month: "June",
      clients: [
        {
          client: "Visa",
          typeOfClient: "Co-Working",
          date: "2024-06-05",
          paymentStatus: "Unpaid",
        },
        {
          client: "Intel",
          typeOfClient: "Co-Living",
          date: "2024-06-09",
          paymentStatus: "Paid",
        },
        {
          client: "IBM",
          typeOfClient: "Virtual Office",
          date: "2024-06-15",
          paymentStatus: "Pending",
        },
      ],
    },
    {
      month: "July",
      clients: [
        {
          client: "Charlotte White",
          typeOfClient: "Co-Working",
          date: "2024-07-02",
          paymentStatus: "Paid",
        },
        {
          client: "Henry Scott",
          typeOfClient: "Workations",
          date: "2024-07-14",
          paymentStatus: "Pending",
        },
      ],
    },
    {
      month: "August",
      clients: [
        {
          client: "William Carter",
          typeOfClient: "Co-Working",
          date: "2024-08-07",
          paymentStatus: "Paid",
        },
        {
          client: "Emily Adams",
          typeOfClient: "Co-Living",
          date: "2024-08-10",
          paymentStatus: "Paid",
        },
        {
          client: "Benjamin Hall",
          typeOfClient: "Virtual Office",
          date: "2024-08-20",
          paymentStatus: "Unpaid",
        },
      ],
    },
    {
      month: "September",
      clients: [
        {
          client: "Amelia Green",
          typeOfClient: "Co-Working",
          date: "2024-09-03",
          paymentStatus: "Pending",
        },
        {
          client: "Lucas Young",
          typeOfClient: "Workations",
          date: "2024-09-12",
          paymentStatus: "Paid",
        },
        {
          client: "Mason Baker",
          typeOfClient: "Virtual Office",
          date: "2024-09-21",
          paymentStatus: "Paid",
        },
      ],
    },
    {
      month: "October",
      clients: [
        {
          client: "Evelyn Nelson",
          typeOfClient: "Co-Working",
          date: "2024-10-05",
          paymentStatus: "Paid",
        },
        {
          client: "Jack Roberts",
          typeOfClient: "Co-Living",
          date: "2024-10-11",
          paymentStatus: "Unpaid",
        },
      ],
    },
    {
      month: "November",
      clients: [
        {
          client: "Lucas Harris",
          typeOfClient: "Co-Working",
          date: "2024-11-08",
          paymentStatus: "Paid",
        },
        {
          client: "Sophia Turner",
          typeOfClient: "Workations",
          date: "2024-11-14",
          paymentStatus: "Pending",
        },
        {
          client: "Daniel Collins",
          typeOfClient: "Virtual Office",
          date: "2024-11-18",
          paymentStatus: "Paid",
        },
      ],
    },
    {
      month: "December",
      clients: [
        {
          client: "Harper Walker",
          typeOfClient: "Co-Working",
          date: "2024-12-02",
          paymentStatus: "Paid",
        },
        {
          client: "Liam Wright",
          typeOfClient: "Co-Living",
          date: "2024-12-09",
          paymentStatus: "Paid",
        },
        {
          client: "Emma Lewis",
          typeOfClient: "Virtual Office",
          date: "2024-12-15",
          paymentStatus: "Pending",
        },
      ],
    },
    {
      month: "January",
      clients: [
        {
          client: "Elijah Hall",
          typeOfClient: "Co-Working",
          date: "2025-01-05",
          paymentStatus: "Paid",
        },
        {
          client: "Sophia King",
          typeOfClient: "Workations",
          date: "2025-01-11",
          paymentStatus: "Unpaid",
        },
      ],
    },
    {
      month: "February",
      clients: [
        {
          client: "James Hill",
          typeOfClient: "Co-Working",
          date: "2025-02-07",
          paymentStatus: "Paid",
        },
        {
          client: "Charlotte Allen",
          typeOfClient: "Co-Living",
          date: "2025-02-12",
          paymentStatus: "Pending",
        },
        {
          client: "Benjamin Phillips",
          typeOfClient: "Virtual Office",
          date: "2025-02-18",
          paymentStatus: "Paid",
        },
      ],
    },
    {
      month: "March",
      clients: [
        {
          client: "Oliver Parker",
          typeOfClient: "Co-Working",
          date: "2025-03-03",
          paymentStatus: "Unpaid",
        },
        {
          client: "Emily Anderson",
          typeOfClient: "Co-Living",
          date: "2025-03-10",
          paymentStatus: "Paid",
        },
        {
          client: "Noah Thomas",
          typeOfClient: "Workations",
          date: "2025-03-15",
          paymentStatus: "Paid",
        },
        {
          client: "Lucas White",
          typeOfClient: "Virtual Office",
          date: "2025-03-22",
          paymentStatus: "Pending",
        },
      ],
    },
  ];

  return (
    <div>
      <LeadsLayout data={domainData} />
    </div>
  );
};

export default UniqueClients;
