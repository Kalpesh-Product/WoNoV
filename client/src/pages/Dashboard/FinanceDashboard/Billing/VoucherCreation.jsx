import { useState } from "react";
import Template from "../../../../utils/Template.png";
import Template2 from "../../../../utils/Template1.png";
import Template1 from "../../../../utils/Template2.png";
import Template3 from "../../../../utils/Template3.png";
import Template4 from "../../../../utils/Template4.png";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { TextField, MenuItem, IconButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form";
import { LuImageUp } from "react-icons/lu";

const VoucherCreation = () => {
  const navigate = useNavigate();
  const [viewModal, setViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [viewAddVoucherModal, setViewVoucherModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      type: "",
      date: dayjs(),
    },
  });

  const onSubmitTemplate = (data) => {
    console.log("Template Submitted:", {
      ...data,
      file: data.file?.name, // just logging file name for now
    });

    toast.success("Template Added!");
    setViewVoucherModal(false);
    reset();
  };


  const templateData = [
    {
      id: 1,
      imgSrc: Template,
      title: "Experience Letter",
      date: "Jan 10, 2025",
    },
    {
      id: 2,
      imgSrc: Template2,
      title: "Handover & No-Dues Form",
      date: "Opened Jan 7, 2025",
    },
    {
      id: 3,
      imgSrc: Template1,
      title: "Timings Agreement",
      date: "Opened Jan 7, 2025",
    },
    {
      id: 4,
      imgSrc: Template3,
      title: "SOP Agreement",
      date: "Opened Jan 6, 2025",
    },
    {
      id: 5,
      imgSrc: Template4,
      title: "Internship Report",
      date: "Dec 24, 2024",
    },
  ];

  const invoiceCreationColumns = [
    { field: "invoiceName", headerName: "Invoice Name", flex: 1 },
    {
      field: "emailInvoice",
      headerName: "Email Invoice",
      cellRenderer: (params) => (
        <>
          <div className="flex gap-2">
            <span onClick={() => toast.success("email sent successfully")} className="text-primary hover:underline text-content cursor-pointer">
              Send Email
            </span>
          </div>
        </>
      ),
    },
    { field: "date", headerName: "KRAs", flex: 1 },
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
      <div className="flex justify-between items-center mb-6">
        <span className=" text-primary text-title font-pmedium">Templates</span>
        <PrimaryButton title={"Add Voucher"} handleSubmit={() => { setViewVoucherModal(true) }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateData.map((template, index) => (
          <div
            key={index}
            onClick={() => navigate(`${template.id}`)}
            className="bg-white shadow-md rounded-lg overflow-hidden border">
            <div className="h-48">
              <img
                src={template.imgSrc}
                alt="Template Image"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4">
              <h2 className="widgetTitle font-semibold font-pregular">
                {template.title}
              </h2>
              <p className="text-content text-gray-500 font-pregular">
                {template.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <AgTable data={rows} columns={invoiceCreationColumns} search tableTitle={"Invoice Creation"} />
      </div>

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
            <DetalisFormatted title="Invoice Name" detail={viewDetails.invoiceName} />
            <DetalisFormatted title="KRAs" detail={viewDetails.date} />
          </div>
        </MuiModal>
      )}

      {viewAddVoucherModal && <MuiModal
        open={viewAddVoucherModal}
        onClose={() => setViewVoucherModal(false)}
        title="Add New Voucher"
        primaryAction={{
          label: "Submit",
          onClick: handleSubmit(onSubmitTemplate),
        }}
      >
        <form className="flex flex-col gap-4 mt-2">
          {/* Title Field */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                label="Template Title"
                fullWidth
                {...field}
              />
            )}
          />

          {/* File Upload */}
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
                      <IconButton color="primary" component="label" htmlFor="image-upload">
                        <LuImageUp />
                      </IconButton>
                    ),
                  }}
                />
              </>
            )}
          />



          {/* Date Picker */}
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
          <PrimaryButton title="Add Voucher" handleSubmit={() => {
            toast.success("Added Voucher successfully")
            setViewVoucherModal(false)
          }} />
        </form>
      </MuiModal>
      }
    </div>
  );
};

export default VoucherCreation;
