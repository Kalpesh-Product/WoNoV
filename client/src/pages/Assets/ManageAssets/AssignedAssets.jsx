import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import AgTable from "../../../components/AgTable";
import MuiModal from "../../../components/MuiModal";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import PageFrame from "../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const AssignedAssets = () => {
  const axios = useAxiosPrivate()
  const [selectedAsset, setSelectedAsset] = useState([]);
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
  // const {data : assignedAssets = [], isLoading : isAssignedPending} = useQuery({
  //   queryKey: ["assignedAssets"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get(`/api/assets/`)
  //     } catch (error) {
  //       console.error(error.response.data.message)
  //     }
  //   }
  // })


  const assetsColumns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "assigneeName", headerName: "Assignee Name", width: 150 },
    { field: "assetNumber", headerName: "Asset Number", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "brand", headerName: "Brand", width: 150 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "assignmentDate", headerName: "Assignment Date", flex: 1 },

  ];

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <AgTable
          search={true}
          searchColumn={"assetNumber"}
          tableTitle={"Assigned Assets"}
          data={[]}
          columns={assetsColumns}
        />
      </PageFrame>

    </div>
  );
};

export default AssignedAssets;
