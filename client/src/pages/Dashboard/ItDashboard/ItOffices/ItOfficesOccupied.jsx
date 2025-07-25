import React from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import occupiedImage from "../../../../assets/biznest/occupancy/occupied-701.jpeg";
import { Chip } from "@mui/material";

const ItOfficesOccupied = () => {
  const navigate = useNavigate();

  const viewEmployeeColumns = [
    { field: "srno", headerName: "Total Seats" },
    { field: "employmentID", headerName: "Booked Seats" },
    { field: "email", headerName: "Occupancy %", flex: 1 },
    { field: "role", headerName: "Available Seats", flex: 1 },
  ];


  return (
    <div>
      <div className="w-full py-10 flex justify-around items-center">
        <div className="">
          {/* <div className="py-2 text-center">
            <p className="text-primary text-lg font-bold">Occupied</p>
          </div> */}
          <div className="flex justify-center items-center">
            <img
              // className="w-[90%] h-[80%] object-contain cursor-pointer"
              className="w-[50%] h-[80%] object-contain cursor-pointer"
              src={occupiedImage}
              alt="Image"
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <AgTable
          search={true}
          searchColumn="Email"
          data={[]}
          columns={viewEmployeeColumns}
        />
      </div>
    </div>
  );
};

export default ItOfficesOccupied;
