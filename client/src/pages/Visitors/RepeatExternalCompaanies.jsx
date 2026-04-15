import { useCallback, useEffect, useMemo, useState } from "react";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const RepeatExternalCompaanies = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [repeatExternalCompanies, setRepeatExternalCompanies] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSubmittingRepeatClient, setIsSubmittingRepeatClient] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      visitorName: "",
      company: "",
      purposeOfVisit: "Full Day Pass",
      checkInTime: null,
      checkOutTime: null,
    },
  });

  const fetchRepeatExternalCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const visitorsResponse = await axios.get("/api/visitors/fetch-visitors");
      const visitors = visitorsResponse.data;

      const dayPassVisitors = visitors.filter((visitor) => {
        const isExternalVisitor = visitor.visitorFlag === "Client";
        const purpose = (visitor.purposeOfVisit || "").trim().toLowerCase();

        return (
          isExternalVisitor
          && (purpose === "half-day pass" || purpose === "full-day pass")
        );
      });

      setRepeatExternalCompanies(dayPassVisitors);
    } catch (error) {
      console.error("Failed to fetch repeat external companies", error);
      toast.error("Failed to load repeat external companies.");
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    fetchRepeatExternalCompanies();
  }, [fetchRepeatExternalCompanies]);

  const tableData = useMemo(
    () =>
      repeatExternalCompanies.map((item, index) => ({
        ...item,
        srNo: index + 1,
        mongoId: item._id,
        visitorName: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "N/A",
        company:
          item.visitorCompany
          || item.brandName
          || item.registeredClientCompany
          || "N/A",
      })),
    [repeatExternalCompanies],
  );

  const openRepeatClientModal = useCallback((row) => {
    setSelectedRow(row);
    const sourceCheckIn = row?.checkIn ? dayjs(row.checkIn) : dayjs();
    const sourceCheckOut = row?.checkOut
      ? dayjs(row.checkOut)
      : sourceCheckIn.add(4, "hour");

    reset({
      visitorName: row?.visitorName || "N/A",
      company: row?.company || "N/A",
      purposeOfVisit: "Full Day Pass",
      checkInTime: sourceCheckIn,
      checkOutTime: sourceCheckOut,
    });

    setOpenModal(true);
  }, [reset]);

  const handleRepeatClientSubmit = async (formData) => {
    if (!selectedRow?.mongoId) return;

    const checkIn = dayjs(formData.checkInTime);
    const checkOut = dayjs(formData.checkOutTime);

    if (!checkIn.isValid() || !checkOut.isValid()) {
      toast.error("Please select valid check-in and check-out time.");
      return;
    }

    if (checkOut.isBefore(checkIn)) {
      toast.error("Check-out time cannot be before check-in time.");
      return;
    }

    setIsSubmittingRepeatClient(true);
    try {
      await axios.post(`/api/visitors/repeat-client/${selectedRow.mongoId}`, {//This is need to be chage for repeat client Api after creation Backend
        purposeOfVisit: formData.purposeOfVisit,
        checkInTime: checkIn.toISOString(),
        checkOutTime: checkOut.toISOString(),
      });

      toast.success("Repeat client added successfully.");
      setOpenModal(false);
      setSelectedRow(null);
      reset();
      navigate("/app/visitors/manage-visitors/external-clients");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to repeat client.");
    } finally {
      setIsSubmittingRepeatClient(false);
    }
  };

  const columns = useMemo(
    () => [
      { field: "srNo", headerName: "Sr No" },
      { field: "visitorName", headerName: "Visitor Name", flex: 1 },
      { field: "company", headerName: "Company", flex: 1 },
      {
        field: "action",
        headerName: "Action",
        cellRenderer: (params) => (
          <ThreeDotMenu
            menuItems={[
              {
                label: "Repeat Client",
                onClick: () => openRepeatClientModal(params.data),
              },
            ]}
          />
        ),
      },
    ],
    [openRepeatClientModal],
  );

  return (
    <div className="p-4">
      <PageFrame>
        {loading ? (
          <div className="flex justify-center p-8">
            <CircularProgress />
          </div>
        ) : (
          <AgTable
            search
            tableTitle="REPEAT EXTERNAL COMPANIES"
            data={tableData}
            columns={columns}
          />
        )}
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedRow(null);
        }}
        title="Repeat Client"
      >
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={handleSubmit(handleRepeatClientSubmit)}
        >
          <Controller
            name="visitorName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Visitor Name" size="small" disabled />
            )}
          />

          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Company" size="small" disabled />
            )}
          />

          <Controller
            name="purposeOfVisit"
            control={control}
            rules={{ required: "Purpose of Visit is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Purpose of Visit"
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="Full Day Pass">Full Day Pass</MenuItem>
                <MenuItem value="Half Day Pass">Half Day Pass</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="checkInTime"
            control={control}
            rules={{ required: "Check-In Time is required" }}
            render={({ field, fieldState }) => (
              <TimePicker
                label="Check-In Time"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />

          <Controller
            name="checkOutTime"
            control={control}
            rules={{ required: "Check-Out Time is required" }}
            render={({ field, fieldState }) => (
              <TimePicker
                label="Check-Out Time"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />

        <div className="flex justify-center mt-1">
            <PrimaryButton
                title={isSubmittingRepeatClient ? "Submitting..." : "Submit"}
                type="submit"
                disabled={isSubmittingRepeatClient}
                className="px-8 py-2"
            />
        </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default RepeatExternalCompaanies;



// import { useCallback, useEffect, useMemo, useState } from "react";
// import { CircularProgress, MenuItem, TextField } from "@mui/material";
// import { Controller, useForm } from "react-hook-form";
// import { TimePicker } from "@mui/x-date-pickers";
// import dayjs from "dayjs";
// import { toast } from "sonner";
// import AgTable from "../../components/AgTable";
// import MuiModal from "../../components/MuiModal";
// import PageFrame from "../../components/Pages/PageFrame";
// import PrimaryButton from "../../components/PrimaryButton";
// import ThreeDotMenu from "../../components/ThreeDotMenu";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";

// const RepeatExternalCompaanies = () => {
//   const axios = useAxiosPrivate();
//   const [loading, setLoading] = useState(true);
//   const [repeatExternalCompanies, setRepeatExternalCompanies] = useState([]);
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [isSubmittingRepeatClient, setIsSubmittingRepeatClient] = useState(false);

//   const { control, handleSubmit, reset } = useForm({
//     defaultValues: {
//       visitorName: "",
//       company: "",
//       purposeOfVisit: "Full Day Pass",
//       checkInTime: null,
//       checkOutTime: null,
//     },
//   });

//   const fetchRepeatExternalCompanies = useCallback(async () => {
//     setLoading(true);
//     try {
//       const visitorsResponse = await axios.get("/api/visitors/fetch-visitors");
//       const visitors = visitorsResponse.data;

//       const dayPassVisitors = visitors.filter((visitor) => {
//         const isExternalVisitor = visitor.visitorFlag === "Client";
//         const purpose = (visitor.purposeOfVisit || "").trim().toLowerCase();

//         return (
//           isExternalVisitor
//           && (purpose === "half-day pass" || purpose === "full-day pass")
//         );
//       });

//       setRepeatExternalCompanies(dayPassVisitors);
//     } catch (error) {
//       console.error("Failed to fetch repeat external companies", error);
//       toast.error("Failed to load repeat external companies.");
      
//     } finally {
//       setLoading(false);
//     }
//   }, [axios]);

//   useEffect(() => {
//     fetchRepeatExternalCompanies();
//   }, [fetchRepeatExternalCompanies]);

//   const tableData = useMemo(
//     () =>
//       repeatExternalCompanies.map((item, index) => ({
//         ...item,
//         srNo: index + 1,
//         mongoId: item._id,
//         visitorName: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "N/A",
//         company:
//           item.visitorCompany
//           || item.brandName
//           || item.registeredClientCompany
//           || "N/A",
//       })),
//     [repeatExternalCompanies],
//   );

//   const openRepeatClientModal = useCallback((row) => {
//     setSelectedRow(row);
//     const sourceCheckIn = row?.checkIn ? dayjs(row.checkIn) : dayjs();
//     const sourceCheckOut = row?.checkOut
//       ? dayjs(row.checkOut)
//       : sourceCheckIn.add(4, "hour");

//     reset({
//       visitorName: row?.visitorName || "N/A",
//       company: row?.company || "N/A",
//       purposeOfVisit: "Full Day Pass",
//       checkInTime: sourceCheckIn,
//       checkOutTime: sourceCheckOut,
//     });

//     setOpenModal(true);
//   }, [reset]);

//   const handleRepeatClientSubmit = async (formData) => {
//     if (!selectedRow?.mongoId) return;

//     const checkIn = dayjs(formData.checkInTime);
//     const checkOut = dayjs(formData.checkOutTime);

//     if (!checkIn.isValid() || !checkOut.isValid()) {
//       toast.error("Please select valid check-in and check-out time.");
//       return;
//     }

//     if (checkOut.isBefore(checkIn)) {
//       toast.error("Check-out time cannot be before check-in time.");
//       return;
//     }

//     setIsSubmittingRepeatClient(true);
//     try {
//       await axios.post(`/api/visitors/repeat-client/${selectedRow.mongoId}`, {
//         purposeOfVisit: formData.purposeOfVisit,
//         checkInTime: checkIn.toISOString(),
//         checkOutTime: checkOut.toISOString(),
//       });

//       toast.success("Repeat client added successfully.");
//       setOpenModal(false);
//       setSelectedRow(null);
//       reset();
//       fetchRepeatExternalCompanies();
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to repeat client.");
//     } finally {
//       setIsSubmittingRepeatClient(false);
//     }
//   };

//   const columns = useMemo(
//     () => [
//       { field: "srNo", headerName: "Sr No" },
//       { field: "visitorName", headerName: "Visitor Name", flex: 1 },
//       { field: "company", headerName: "Company", flex: 1 },
//       {
//         field: "action",
//         headerName: "Action",
//         cellRenderer: (params) => (
//           <ThreeDotMenu
//             menuItems={[
//               {
//                 label: "Repeat Client",
//                 onClick: () => openRepeatClientModal(params.data),
//               },
//             ]}
//           />
//         ),
//       },
//     ],
//     [openRepeatClientModal],
//   );

//   return (
//     <div className="p-4">
//       <PageFrame>
//         {loading ? (
//           <div className="flex justify-center p-8">
//             <CircularProgress />
//           </div>
//         ) : (
//           <AgTable
//             search
//             tableTitle="REPEAT EXTERNAL COMPANIES"
//             data={tableData}
//             columns={columns}
//           />
//         )}
//       </PageFrame>

//       <MuiModal
//         open={openModal}
//         onClose={() => {
//           setOpenModal(false);
//           setSelectedRow(null);
//         }}
//         title="Repeat Client"
//       >
//         <form
//           className="grid grid-cols-1 gap-4"
//           onSubmit={handleSubmit(handleRepeatClientSubmit)}
//         >
//           <Controller
//             name="visitorName"
//             control={control}
//             render={({ field }) => (
//               <TextField {...field} label="Visitor Name" size="small" disabled />
//             )}
//           />

//           <Controller
//             name="company"
//             control={control}
//             render={({ field }) => (
//               <TextField {...field} label="Company" size="small" disabled />
//             )}
//           />

//           <Controller
//             name="purposeOfVisit"
//             control={control}
//             rules={{ required: "Purpose of Visit is required" }}
//             render={({ field, fieldState }) => (
//               <TextField
//                 {...field}
//                 select
//                 label="Purpose of Visit"
//                 size="small"
//                 error={!!fieldState.error}
//                 helperText={fieldState.error?.message}
//               >
//                 <MenuItem value="Full Day Pass">Full Day Pass</MenuItem>
//                 <MenuItem value="Half Day Pass">Half Day Pass</MenuItem>
//               </TextField>
//             )}
//           />

//           <Controller
//             name="checkInTime"
//             control={control}
//             rules={{ required: "Check-In Time is required" }}
//             render={({ field, fieldState }) => (
//               <TimePicker
//                 label="Check-In Time"
//                 value={field.value}
//                 onChange={field.onChange}
//                 slotProps={{
//                   textField: {
//                     size: "small",
//                     fullWidth: true,
//                     error: !!fieldState.error,
//                     helperText: fieldState.error?.message,
//                   },
//                 }}
//               />
//             )}
//           />

//           <Controller
//             name="checkOutTime"
//             control={control}
//             rules={{ required: "Check-Out Time is required" }}
//             render={({ field, fieldState }) => (
//               <TimePicker
//                 label="Check-Out Time"
//                 value={field.value}
//                 onChange={field.onChange}
//                 slotProps={{
//                   textField: {
//                     size: "small",
//                     fullWidth: true,
//                     error: !!fieldState.error,
//                     helperText: fieldState.error?.message,
//                   },
//                 }}
//               />
//             )}
//           />

//           <PrimaryButton
//             title={isSubmittingRepeatClient ? "Submitting..." : "Submit"}
//             type="submit"
//             disabled={isSubmittingRepeatClient}
//           />
//         </form>
//       </MuiModal>
//     </div>
//   );
// };

// export default RepeatExternalCompaanies;