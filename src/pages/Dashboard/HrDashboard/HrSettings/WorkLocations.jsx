import {useState} from "react";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { useQuery } from '@tanstack/react-query';

const WorkLocations = () => {
   const axios = useAxiosPrivate()


  const { data: workLocations = [] } = useQuery({
    queryKey: ["workLocations"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-data?field=workLocations");
        return response.data.workLocations
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
    { field:"id" , headerName:"SR NO"},
    { field: "name", headerName: "Work Location Name",
      cellRenderer:(params)=>{
        return(
          <div>
            <span className="text-primary cursor-pointer hover:underline">
              {params.value}
            </span>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive"; // Map boolean to string status
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };
      
        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };
      
        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },  
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: () => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span className="text-content text-primary hover:underline cursor-pointer">
              Make Inactive
            </span>
          </div>
        </>
      ),
    },
  ];

  const [openModal, setOpenModal] = useState(false);
  
    const handleCloseModal = () => {
      setOpenModal(false);
    };

  return (
    <>
      <div>
        <AgTable
        key={workLocations.length}
          search={true}
          searchColumn={"Work Location"}
          tableTitle={"Work Location List"}
          buttonTitle={"Add Work Location"}
          columns={departmentsColumn}
          data={[
            ...workLocations.map((location, index) => ({
              id: index + 1, // Auto-increment Sr No
              name: location.name, // Birthday Name
              status: location.isActive 
            })),
          ]}
        />
      </div>

    <MuiModal open={openModal} onClose={handleCloseModal} title={"Add Work Location"}>
      <span>hello</span>
    </MuiModal>
      
    </>
  );
};

export default WorkLocations;
