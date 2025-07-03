import { useState } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { TextField, IconButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { LuImageUp } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import humanDate from "../../../../utils/humanDateForamt";

const VoucherCreation = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [viewModal, setViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [viewAddVoucherModal, setViewVoucherModal] = useState(false);

  const { data: voucherData = [], isPending: isVoucherPending } = useQuery({
    queryKey: ["voucherData"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/approved-budgets");
      return response.data.allBudgets;
    },
  });


  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      type: "",
      date: dayjs(),
    },
  });

  const onSubmitTemplate = (data) => {
    toast.success("Template Added!");
    setViewVoucherModal(false);
    reset();
  };

  const invoiceCreationColumns = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "voucherName", headerName: "Voucher Name", flex: 1 },
    { field: "modeOfPayment", headerName: "Mode of Payment", flex: 1 },
    { field: "advanceAmount", headerName: "Advance Amount", flex: 1 },
    { field: "chequeNo", headerName: "Cheque No", flex: 1 },
    { field: "chequeDate", headerName: "Cheque Date", flex: 1 },
    { field: "approvedAt", headerName: "Approved Date", flex: 1, cellRenderer : (params)=>(humanDate(params.value)) },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 flex gap-2 hover:bg-gray-300 rounded-full w-fit">
          <span
            role="button"
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

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <YearWiseTable
          data={(voucherData || []).map((item, index) => ({
            ...item,
          
            voucherName: item.finance?.voucher?.name || "-",
            voucherLink: item.finance?.voucher?.link || "-",
            modeOfPayment: item.finance?.modeOfPayment || "-",
            advanceAmount: item.finance?.advanceAmount ?? "-",
            chequeNo: item.finance?.chequeNo || "-",
            chequeDate: item.finance?.chequeDate
              ? dayjs(item.finance.chequeDate).format("DD MMM YYYY")
              : "-",
            approvedAt: item.finance?.approvedAt || "-",
            expectedDateInvoice: humanDate(item.finance?.expectedDateInvoice) || "-",
            financeParticulars: Array.isArray(item.finance?.particulars)
              ? item.finance.particulars
              : [],
          }))}
          dateColumn={"approvedAt"}
          columns={invoiceCreationColumns}
          search
          tableTitle={"Voucher History"}
          tableHeight={450}
          handleClick={() => {
            setViewVoucherModal(true);
          }}
          isLoading={isVoucherPending}
        />
      </PageFrame>

      {viewModal && viewDetails && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setViewDetails(null);
          }}
          title="Voucher Finance Details"
        >
          <div className="space-y-3">
            <DetalisFormatted title="Sr No" detail={viewDetails.srNo || "-"} />
            <DetalisFormatted
              title="Mode of Payment"
              detail={viewDetails.modeOfPayment}
            />
            <DetalisFormatted title="Amount" detail={viewDetails.amount} />
            <DetalisFormatted title="Cheque No" detail={viewDetails.chequeNo} />
            <DetalisFormatted
              title="Cheque Date"
              detail={viewDetails.chequeDate}
            />
            <DetalisFormatted
              title="Expected Invoice Date"
              detail={viewDetails.expectedDateInvoice}
            />
            <DetalisFormatted
              title="Voucher File"
              detail={
                viewDetails.voucherLink !== "-" ? (
                  <a
                    href={viewDetails.voucherLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {viewDetails.voucherName}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            {(viewDetails.financeParticulars || []).map((p, idx) => (
              <div key={idx} className="border-t pt-2">
                <DetalisFormatted
                  title={`Particular ${idx + 1}`}
                  detail={`${p.particularName || "-"} — ₹${
                    p.particularAmount || 0
                  }`}
                />
              </div>
            ))}
          </div>
        </MuiModal>
      )}

      {viewAddVoucherModal && (
        <MuiModal
          open={viewAddVoucherModal}
          onClose={() => setViewVoucherModal(false)}
          title="Add New Voucher"
          primaryAction={{
            label: "Submit",
            onClick: handleSubmit(onSubmitTemplate),
          }}
        >
          <form className="flex flex-col gap-4 mt-2">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField label="Template Title" fullWidth {...field} />
              )}
            />

            <Controller
              name="file"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  <input
                    id="image-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    hidden
                    onChange={(e) => onChange(e.target.files[0])}
                  />
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    label="Upload Image"
                    value={value ? value.name : ""}
                    placeholder="Choose a file..."
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton
                          color="primary"
                          component="label"
                          htmlFor="image-upload"
                        >
                          <LuImageUp />
                        </IconButton>
                      ),
                    }}
                  />
                </>
              )}
            />

            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Template Date"
                  {...field}
                  value={field.value || dayjs()}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            />
            <PrimaryButton
              title="Add Voucher"
              handleSubmit={() => {
                toast.success("Added Voucher successfully");
                setViewVoucherModal(false);
              }}
            />
          </form>
        </MuiModal>
      )}
    </div>
  );
};

export default VoucherCreation;
