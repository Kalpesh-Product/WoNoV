import React from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const HoildaysEvents = ({ title }) => {
  const axios = useAxiosPrivate();
  const holdiayEvents = [
    { field: "id", headerName: "SR No",width:100  },
    { field: "title", headerName: "Holiday / Event Name",flex : 1 },
    { field: "start", headerName: "Date"  },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/all-events");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  return (
    <div>
      {/* <div className="flex justify-between items-center pb-4">
        <span className="text-title font-pmedium text-primary">{title}</span>
        <PrimaryButton title={"Add Holiday / Event"} />
      </div> */}

      <div>
        <AgTable
          key={holdiayEvents.length}
          search={true}
          tableTitle={"Holidays / Events"}
          columns={holdiayEvents}
          data={[
            ...holidayEvents.map((holidays, index) => ({
              id: index + 1, // Auto-increment Sr No
              title: holidays.title, // Birthday Name
              start: new Date(holidays.start).toLocaleDateString(), // Format as readable date
            })),
          ]}
        />
      </div>
    </div>
  );
};

export default HoildaysEvents;
