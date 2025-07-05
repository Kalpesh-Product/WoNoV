import { useState } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { TextField, MenuItem, Chip } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import UploadFileInput from "../../../../components/UploadFileInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { queryClient } from "../../../../main";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";

const InvoiceCreation = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const [viewModal, setViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [viewAddTemplateModal, setViewAddTemplateModal] = useState(false);

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return response.data.filter((item) => item.isActive);
    },
  });

  const { data: invoiceData = [], isPending: isInvoicePending } = useQuery({
    queryKey: ["invoiceData"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/client-invoices");
      return response.data;
    },
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      invoiceFile: null,
      client: "",
      date: null,
      status: false,
    },
  });

  const onSubmitTemplate = (data) => {
    const file = data.invoiceFile;
    if (!file) return toast.error("Missing file");

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("client-invoice", file);
    formData.append("client", data.client);
    formData.append(
      "invoiceUploadedAt",
      data.date?.toISOString() || new Date().toISOString()
    );

    submitInvoice(formData);
  };

  const { mutate: submitInvoice, isPending: isSubmitPending } = useMutation({
    mutationKey: ["submitInvoice"],
    mutationFn: async (data) => {
      const response = await axios.post(
        "/api/finance/upload-client-invoice",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Invoice uploaded");
      queryClient.invalidateQueries({ queryKey: ["invoiceData"] });
      reset();
      setViewAddTemplateModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error uploading invoice");
    },
  });

  const { mutate: updateInvoice, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateInvoice"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/finance/update-payment-status/${data}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "PAYMENT STATUS UPDATED");
      queryClient.invalidateQueries({ queryKey: ["invoiceData"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error updating payment status");
    },
  });

  const invoiceCreationColumns = [
    {
      headerName: "Sr. No",
      field: "srNo",
      width: 100,
    },
    {
      headerName: "Client",
      field: "clientName",
      flex: 1,
      cellRenderer: (params) => (
        <span
          onClick={() => {
            setViewDetails(params.data);
            setViewModal(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "Invoice Name",
      field: "invoiceName",
      flex: 1,
    },
    {
      headerName: "Uploaded On",
      field: "uploadDate",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Paid: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Unpaid: { backgroundColor: "#FFEBEE", color: "#B71C1C" }, // Light purple bg, dark purple font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data.id}
          disabled={params.data.status === "Paid"} // ✅ Disable menu if Paid
          menuItems={[
            {
              label: "Mark As Paid",
              onClick: () => {
                updateInvoice(params.data.id);
              },
              disabled: params.data.status === "Paid", // optional: extra safety
            },
          ]}
        />
      ),
    },
  ];

  const rows = invoiceData.map((item) => ({
    id: item._id,
    clientName: item?.client?.clientName || "N/A",
    invoiceName: item?.invoice?.name || "N/A",
    uploadDate: item?.invoiceUploadedAt,
    status: item?.paidStatus || item?.paymentStatus ? "Paid" : "Unpaid",
    ...item,
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <YearWiseTable
          data={rows}
          columns={invoiceCreationColumns}
          search
          dateColumn={"uploadDate"}
          tableTitle="Client-Invoice"
          buttonTitle="Add Invoice"
          handleSubmit={() => setViewAddTemplateModal(true)}
        />
      </PageFrame>

      {/* View Details Modal */}
      {viewModal && viewDetails && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setViewDetails(null);
          }}
          title="Invoice Details"
        >
          <div className="space-y-3">
            <div className="font-bold">Invoice Information</div>
            <DetalisFormatted
              title="Client Name"
              detail={viewDetails?.client?.clientName || "N/A"}
            />
            <DetalisFormatted
              title="Invoice Name"
              detail={viewDetails?.invoice?.name || "N/A"}
            />
            <DetalisFormatted
              title="Invoice Link"
              detail={
                viewDetails?.invoice?.link ? (
                  <a
                    href={viewDetails.invoice.link}
                    className="text-primary underline cursor-pointer"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View PDF
                  </a>
                ) : (
                  "N/A"
                )
              }
            />
            <DetalisFormatted
              title="Uploaded At"
              detail={dayjs(viewDetails?.invoiceUploadedAt).format(
                "DD-MM-YYYY"
              )}
            />
            <DetalisFormatted
              title="Status"
              detail={
                viewDetails?.paidStatus || viewDetails?.paymentStatus
                  ? "Paid"
                  : "Unpaid"
              }
            />
          </div>
        </MuiModal>
      )}

      {/* Add Invoice Modal */}
      {viewAddTemplateModal && (
        <MuiModal
          open={viewAddTemplateModal}
          onClose={() => setViewAddTemplateModal(false)}
          title="Add New Invoice"
        >
          <form
            onSubmit={handleSubmit(onSubmitTemplate)}
            className="flex flex-col gap-4 mt-2"
          >
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
              name="client"
              control={control}
              rules={{ required: "Client is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  fullWidth
                  label="Select Client"
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
                  value={field.value ? "Paid" : "Unpaid"}
                />
              )}
            />

            <PrimaryButton
              disabled={isSubmitPending}
              isLoading={isSubmitPending}
              title="Add Invoice"
              type="submit"
            />
          </form>
        </MuiModal>
      )}
    </div>
  );
};

export default InvoiceCreation;
