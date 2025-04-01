import React from "react";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";

const MeetingRoomCredits = ({ pageTitle }) => {
  const navigationCards = [
    { cardTitle: "Total Credits", quantity: "1000", bgcolor:"#0099FF",quantityColor:"#000033" },
    { cardTitle: "Remaining Credits", quantity: "450", bgcolor:"#66FFCC",quantityColor:"#006600" },
    { cardTitle: "Rooms Booked", quantity: "15 Bookings", bgcolor:"#FFFFCC",quantityColor:"#FF9900" },
  ];

  const laptopColumns = [
    { field: "Room", headerName: "Rooms" ,flex:1 },
    { field: "CreditsUsed", headerName: "Credits Used",flex:1 },
    { field: "Duration", headerName: "Duration",flex:1  },
    { field: "Date", headerName: "Date",flex:1 },

    
  ];

  const rows = [
    {
     Room:"Baga",
     CreditsUsed:"40",
     Duration:"4 hours",
     Date:"2025-01-05"
    },
    {
      Room:"Arambol",
     CreditsUsed:"80",
     Duration:"8 hours",
     Date:"2025-01-05"
    },
    {
      Room:"San Fransisco",
      CreditsUsed:"80",
      Duration:"8 hours",
      Date:"2025-01-05"
    },
    {
      Room:"Zurich",
      CreditsUsed:"80",
      Duration:"8 hours",
      Date:"2025-01-05"

    },
    {
      Room:"Madrid",
      CreditsUsed:"80",
      Duration:"8 hours",
      Date:"2025-01-05"

    },
    {
      Room:"Vatican",
      CreditsUsed:"80",
      Duration:"8 hours",
      Date:"2025-01-05"
    },
    {
      Room:"Collosium",
      CreditsUsed:"80",
      Duration:"8 hours",
      Date:"2025-01-05"
    }
  ];
  return (
    <div>
      <div className="flex items-center justify-between ">
        <span className="text-title font-pmedium text-primary">Meetings</span>
      </div>
      <div>
        <WidgetSection layout={navigationCards.length}>
          {navigationCards.map((card, index) => (
            <div
              key={index}
              className="border  rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200 cursor-pointer "
              style={{ backgroundColor: card.bgcolor, color:card.quantityColor }}
            >
              <div className="text-md" >{card.cardTitle}</div>
              <div className="text-lg font-bold">{card.quantity}</div>
            </div>
          ))}
        </WidgetSection>
      </div>
      <div>
      <div className="">
        <AgTable data={rows} columns={laptopColumns} paginationPageSize={10} />
      </div>

      </div>

    </div>
  );
};

export default MeetingRoomCredits;
