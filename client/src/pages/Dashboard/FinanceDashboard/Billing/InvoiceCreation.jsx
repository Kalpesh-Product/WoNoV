import { useState } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { TextField, IconButton, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import UploadFileInput from "../../../../components/UploadFileInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const InvoiceCreation = () => {
  const navigate = useNavigate();

  const [viewModal, setViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [viewAddTemplateModal, setViewAddTemplateModal] = useState(false);
  const axios = useAxiosPrivate();

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      invoiceFile: null,
      clientId: "",
      date: null,
      status: false,
    },
  });

  const onSubmitTemplate = (data) => {
    console.log("Template Submitted:", {
      ...data,
      file: data.file?.name,
    });

    toast.success("Template Added!");
    setViewAddTemplateModal(false);
    reset();
  };

  const { mutate: submitInvoice, isPending: isSubmitPending } = useMutation({
    mutationKey: ["submitInvoice"],
    mutation: async (data) => {},
    onSuccess: () => {},
    onError: (error) => {},
  });

  const invoiceCreationColumns = [
    { field: "invoiceName", headerName: "Invoice Name", flex: 1 },
    {
      field: "emailInvoice",
      headerName: "Email Invoice",
      cellRenderer: () => (
        <div className="flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
            Send Email
          </span>
        </div>
      ),
    },
    { field: "date", headerName: "Uplaod Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => {
              setViewDetails(params.data);
              setViewModal(true);
            }}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      invoiceName: "Chair Invoice",
      date: "Jan 6, 2025",
    },
    {
      id: 2,
      invoiceName: "Table Invoice",
      date: "Jan 6, 2025",
    },
    {
      id: 3,
      invoiceName: "AC Invoice",
      date: "Jan 6, 2025",
    },
    {
      id: 4,
      invoiceName: "Laptop Invoice",
      date: "Jan 6, 2025",
    },
    {
      id: 5,
      invoiceName: "John Doe Invoice",
      date: "Jan 6, 2025",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <AgTable
          data={rows}
          columns={invoiceCreationColumns}
          search
          tableTitle={"Invoice"}
          buttonTitle={"Add Invoice"}
          handleClick={() => {
            setViewAddTemplateModal(true);
          }}
        />
      </div>

      {/* View Details Modal */}
      {viewModal && viewDetails && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setViewDetails(null);
          }}
          title="Invoice Detail"
        >
          <div className="space-y-3">
            <DetalisFormatted
              title="Invoice Name"
              detail={viewDetails.invoiceName}
            />
            <DetalisFormatted title="KRAs" detail={viewDetails.date} />
          </div>
        </MuiModal>
      )}

      {/* Add Template Modal */}
      {viewAddTemplateModal && (
        <MuiModal
          open={viewAddTemplateModal}
          onClose={() => setViewAddTemplateModal(false)}
          title="Add New Invoice"
          primaryAction={{
            label: "Submit",
            onClick: handleSubmit(onSubmitTemplate),
          }}
        >
          <form className="flex flex-col gap-4 mt-2">
            {/* Title */}
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  label="Invoice Title"
                  fullWidth
                  {...field}
                />
              )}
            />

            {/* File Upload */}
            <Controller
              name="invoiceFile"
              control={control}
              render={({ field }) => (
                <UploadFileInput
                  value={field.value}
                  onChange={field.onChange}
                  allowedExtensions={["pdf"]}
                  previewType="pdf"
                />
              )}
            />
            <Controller
              name="clientId"
              control={control}
              rules={{ required: "Client is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  fullWidth
                  label={"Select Client"}
                  placeholder="Zomato"
                >
                  <MenuItem value="" disabled>
                    Select Client
                  </MenuItem>
                  {isClientsDataPending
                    ? []
                    : clientsData.map((item) => (
                        <MenuItem key={item._id} value={item._id}>
                          {item.clientName}
                        </MenuItem>
                      ))}
                </TextField>
              )}
            />

            {/* Date */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Invoice Upload Date"
                  format="DD-MM-YYYY"
                  {...field}
                  value={field.value || dayjs()}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Status"
                  fullWidth
                  size="small"
                  disabled
                  value={field.value ? "Paid" : "Unpaid"} // ✅ convert boolean to label
                />
              )}
            />

            <PrimaryButton
              title="Add Invoice"
              handleSubmit={() => {
                toast.success("Added invoice successfully");
                setViewAddTemplateModal(false);
              }}
            />
          </form>
        </MuiModal>
      )}
    </div>
  );
};

export default InvoiceCreation;
