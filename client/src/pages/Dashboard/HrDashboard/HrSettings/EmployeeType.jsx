import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, FormControl, MenuItem, Select, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../components/Pages/PageFrame";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { useEffect } from "react";

const EmployeeType = () => {
  const [openModal, setOpenModal] = useState(false);
   const [modalMode, setModalMode] = useState("add");
   const [selectedItem, setSelectedItem] = useState(null);
   const queryClient = useQueryClient();
  const axios = useAxiosPrivate();

  const { handleSubmit,reset,control,setValue } = useForm({
    defaultValues: {
      employeeType: "",
      isActive:true
    },
  });

 const handleAddType = () => {
  setModalMode("add");
  reset({
    employeeType: "",
    isActive: "true",
  });
  setOpenModal(true);
};

  const handleEdit = (item) => {
  setModalMode("edit");
  setSelectedItem(item);
  setOpenModal(true);
 
};

 

  const { data: employeeTypes = [] } = useQuery({
    queryKey: ["employeeTypes"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-data/?field=employeeTypes"
        );
        return response.data.employeeTypes;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  
  const addEmployeeTypeMutation = useMutation({
  mutationFn: async (payload) => {
    const response = await axios.post(`/api/company/add-employee-type`, payload);
    return response.data;
  },
  onSuccess: () => {
    toast.success("Employee Type added");
    queryClient.invalidateQueries(["employeeTypes"]);
    setOpenModal(false);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || "Addition failed");
  },
});


const updateEmployeeTypeMutation = useMutation({
  mutationFn: async (payload) => {
  
    const response = await axios.patch(
      `/api/company/update-company-data`,
      payload
    );
    return response.data;
  },
  onSuccess: () => {
    toast.success("Employee Type updated");
    queryClient.invalidateQueries(["employeeTypes"]);
    setOpenModal(false);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || "Update failed");
  },
});




  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
    {
      field: "name",
      headerName: "Employee Type",
      cellRenderer: (params) => {
        return (
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
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            {/* <span className="text-content text-primary hover:underline cursor-pointer">
              Make Inactive
            </span> */}
            <span
                        onClick={() => handleEdit(params.data)}
                        className="text-subtitle hover:bg-gray-300 rounded-full cursor-pointer p-1">
                        <HiOutlinePencilSquare />
                      </span>
          </div>
        </>
      ),
    },
  ];

  const onSubmit = (data) => {
 
 
  if (modalMode === "edit") {
     const payload = {
    name: data.employeeType,
    isActive: data.isActive === "true",
    type:"employeeTypes",
    itemId: selectedItem._id
  };
    updateEmployeeTypeMutation.mutate(payload);
  } else {
 const payload = {
  employeeType: data.employeeType
 }
   addEmployeeTypeMutation.mutate(payload);
  }
};

useEffect(()=>{
  setValue("employeeType",selectedItem?.name)
  setValue("isActive",selectedItem?.status)
},[selectedItem])
  
  return (
    <PageFrame>
      <div>
        <AgTable
          search={true}
          searchColumn={"Employee Type"}
          tableTitle={"Employee Type List"}
          buttonTitle={"Add Employee Type"}
          handleClick={handleAddType}
          data={[
            ...employeeTypes.map((type, index) => ({
              id: index + 1,
              name: type.name,
              status: type.isActive,
              _id:type._id
            })),
          ]}
          columns={departmentsColumn}
        />

        <div>
         {
          modalMode === "add" && (
             <MuiModal
            open={openModal}
           title={modalMode === "add" ? "Add Employee Type" : "Edit Employee Type"}
            onClose={() => setOpenModal(false)}>
           
               <div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4">
                <Controller
                  name="employeeType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Enter Employee Type"
                      fullWidth
                    />
                  )}
                />

                <PrimaryButton
                  title={"Add"}
                  type="submit"
                />
              </form>
            </div>
             
           
          </MuiModal>
          )
         }

          {
            modalMode === "edit" && (
                <MuiModal
            open={openModal}
           title={modalMode === "add" ? "Add Employee Type" : "Edit Employee Type"}
            onClose={() => setOpenModal(false)}>
           
            <div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4">
                <Controller
                  name="employeeType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Enter Employee Type"
                      fullWidth
                    />
                  )}
                />

                 <Controller
            name="isActive"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} size="small" displayEmpty>
                  <MenuItem value="" disabled>
                   Select Active Status
                  </MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            )}
          />
                <PrimaryButton
                  title={"Update"}
                   type="submit"
                />
              </form>
            </div>
           
          </MuiModal>
            )
          }
        </div>
      </div>
    </PageFrame>
  );
};

export default EmployeeType;
