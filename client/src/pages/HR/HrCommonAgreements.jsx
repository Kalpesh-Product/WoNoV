import { useEffect, useState } from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chip, TextField, MenuItem } from "@mui/material";
import MuiModal from "../../components/MuiModal";
import PrimaryButton from "../../components/PrimaryButton";
import { toast } from "sonner";
import PageFrame from "../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import UploadFileInput from "../../components/UploadFileInput";
import { Controller, useForm } from "react-hook-form";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import {
  isAlphanumeric,
  noOnlyWhitespace,
} from "../../utils/validators";
import StatusChip from "../../components/StatusChip";
import useAuth from "../../hooks/useAuth";

const HrCommonAgreements = () => {
  const axios = useAxiosPrivate();
  const {auth} = useAuth();
 
  const name =  `${auth.user?.firstName} ${auth.user?.lastName}`
  const [selectedAgreement, setSelectedAgreement] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agreementName: "",
      agreement: null,
    },
  });
  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    setValue: setEditValue,
    reset: editReset,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: {
      status: "",
    },
  });

  console.log("selected agreement : ", selectedAgreement);

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/agreement/all-agreements/${auth.user?._id}`
      );
      return response.data;
    },
  });


  const agreementColumn = [
    {
      headerName: "Sr No",
      field: "srNo",
      maxWidth: 100,
    },
    {
      field: "name",
      headerName: "Agreement Type",
      flex: 1,
      cellRenderer: (params) => (
        <span
          onClick={() => window.open(params.data.url, "_blank")}
          className="text-primary underline hover:underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },

    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        return <StatusChip status={status} />;
      },
    },
    
  ];

  const tableData = isLoading
    ? []
    : agreements.map((item) => ({
        ...item,
      }));

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          key={tableData.length}
          search={true}
          tableTitle={`${name}'s Agreement List`}
          data={tableData}
          dateColumn={"createdAt"}
          columns={agreementColumn}
        />
      </PageFrame>
    </div>
  );
};

export default HrCommonAgreements;
