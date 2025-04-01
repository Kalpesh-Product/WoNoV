import React, { useState } from 'react'
import AgTable from "../../../../components/AgTable";
import { Chip, TextField } from "@mui/material";
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import MuiModal from '../../../../components/MuiModal';
import PrimaryButton from '../../../../components/PrimaryButton';
import SecondaryButton from '../../../../components/SecondaryButton';
import { toast } from 'sonner';


const EmployeeType = () => {
  const [openModal, setOpenModal] = useState()
  const axios = useAxiosPrivate()

  const { handleSubmit, control } = useForm({
    defaultValues:{
      employeeType : ''
    }
  })

  const handleAddType = () =>{
   setOpenModal(true)
  } 

  const onSubmit = (data) =>{
    console.log(data)
    setOpenModal(false)
  }

  const { data: employeeTypes = [] } = useQuery({
    queryKey: ["employeeTypes"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-data/?field=employeeTypes");
        return response.data.employeeTypes
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
    { field:"id",headerName:"SR NO"},
    { field: "name", headerName: "Employee Type",
      cellRenderer:(params)=>{
        return(
          <div>
            <span className="text-primary cursor-pointer hover:underline">
              {params.value}
            </span>
          </div>
        )
      },flex:1},
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
           <span className="text-content text-primary hover:underline cursor-pointer">
            Make Inactive
           </span>
          </div>
        </>
      ),
    },
  ];

  return (
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
              status: type.isActive 
            })),
          ]}
          columns={departmentsColumn}
        />

        <div>
          <MuiModal open={openModal} title={"Add Employee Type"}>
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <Controller
                name='employeeType'
                control={control}
                render={({field})=>
                  (<TextField
                  {...field}
                  size='small'
                  label="Enter Employee Type"
                  fullWidth
                  />)
                }
                />

                <div className='flex items-center justify-center gap-4'>
                  <SecondaryButton title={"Cancel"} handleSubmit={()=>{setOpenModal(false)}} />
                  <PrimaryButton title={"Add"} handleSubmit={()=>{
                    toast.success("Employee Type added")
                  }} />
                </div>
              </form>
            </div>
          </MuiModal>
        </div>
      </div>
  )
}

export default EmployeeType
