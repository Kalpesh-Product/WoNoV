import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  TextField,
  MenuItem,
  Box,
  IconButton,
  FormControl,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrimaryButton from "../../../../components/PrimaryButton";
import MuiModal from "../../../../components/MuiModal";
import usePageDepartment from "../../../../hooks/usePageDepartment";
import { MdDelete } from "react-icons/md";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import humanDate from "../../../../utils/humanDateForamt";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

// Tailwind classes
const cellClasses = "border border-black p-2 text-xs align-top";
const tableClasses = "w-full border border-black border-collapse mb-5";

const options = ["Yes", "No"];
const paymentModes = [
  "Cash",
  "Cheque",
  "NEFT",
  "RTGS",
  "IMPS",
  "Credit Card",
  "ETC",
];

const ReviewRequest = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const voucherDetails = useSelector((state) => state.finance.voucherDetails);
  const [openPreview, setOpenPreview] = useState(false);
  const department = usePageDepartment();
  const axios = useAxiosPrivate();
  const { control, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      fSrNo: "",
      budgetId: "",
      modeOfPayment: "",
      chequeNo: "",
      chequeDate: null,
      advanceAmount: 0,
      expectedDateInvoice: null,
      particulars: [],
    },
  });

  const { data: departmentBudget = [], isPending: isDepartmentLoading } =
    useQuery({
      queryKey: ["departmentBudget"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/budget/company-budget?departmentId=${department?._id}`
          );
          const budgets = response.data.allBudgets;
          return Array.isArray(budgets) ? budgets : [];
        } catch (error) {
          console.error("Error fetching budget:", error);
          return [];
        }
      },
    });
  const reimbursedBudget = isDepartmentLoading
    ? []
    : departmentBudget.filter((item) => item.expanseType === "Reimbursement")
        .length;

  useEffect(() => {
    if (department?.name && reimbursedBudget >= 0) {
      const prefix = department.name.slice(0, 3).toUpperCase();
      const number = String(reimbursedBudget + 1).padStart(3, "0");
      const generatedSNo = `${prefix}-${number}`;
      setValue("srNo", generatedSNo);
      setValue("budgetId", voucherDetails._id);
    }
  }, [department?.name, reimbursedBudget, setValue, voucherDetails]);

  const selectedLocation = watch("location");
  const selectedUnit = watch("unitId");

  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");

      return response.data;
    },
  });

  const selectedUnitId = useMemo(() => {
    if (!selectedUnit || !selectedLocation) return null;

    const unit = units.find(
      (unit) =>
        unit._id === selectedUnit &&
        unit.building.buildingName === selectedLocation
    );
    return unit._id;
  }, [selectedUnit, selectedLocation, units]);

  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units.map((loc) => [
            loc.building._id, // use building._id as unique key
            loc.building.buildingName,
          ])
        : []
    ).entries()
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "particulars",
  });
  const values = watch();

  const onUpload = async () => {
    const values = getValues();
    values.particulars = fields;

    try {
      // Step 1: Generate the PDF Blob directly using html2pdf
      const element = formRef.current;

      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2], // top, left, bottom, right (in inches)
        filename: "Voucher_Form.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 1, // lower scale for smaller size
          useCORS: true,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      const worker = html2pdf().set(opt).from(element).toPdf();

      const pdfBlob = await new Promise((resolve) =>
        worker.outputPdf("blob").then(resolve)
      );

      // Step 2: Prepare FormData
      const formData = new FormData();
      formData.append("voucher", pdfBlob, "Voucher_Form.pdf");
      formData.append("budgetId", voucherDetails._id);
      formData.append("fSrNo", values.fSrNo || "");
      formData.append("modeOfPayment", values.modeOfPayment || "");
      formData.append("chequeNo", values.chequeNo || "");
      formData.append("chequeDate", values.chequeDate || "");
      formData.append("advanceAmount", values.advanceAmount?.toString() || "0");
      formData.append("expectedDateInvoice", values.expectedDateInvoice || "");
      formData.append("particulars", JSON.stringify(values.particulars || []));

      // Step 3: Upload
      submitRequest(formData);
    } catch (error) {
      toast.error("Failed to generate PDF.");
      console.error("html2pdf error", error);
    }
  };

  const { mutate: submitRequest, isPending: isSubmitRequest } = useMutation({
    mutationKey: ["approve"],
    mutationFn: async (formData) => {
      const response = await axios.patch(
        `/api/budget/approve-budget`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setOpenPreview(false);
      reset();
      navigate("/app/dashboard/finance-dashboard/billing/pending-approvals");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const exportToPDF = () => {
    const opt = {
      margin: 0.2,
      filename: "Voucher_Form.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(formRef.current).save();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-title text-primary font-pbold mb-4 uppercase">
            FINANCE AREA
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Controller
              name="fSrNo"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Finance Sno"
                  size="small"
                  type="number"
                  fullWidth
                  {...field}
                />
              )}
            />
            <Controller
              name="fDate"
              control={control}
              rules={{
                required: "Date is required",
                validate: (value) => {
                  if (!value) return true; // already handled by required
                  const today = dayjs().startOf("day");
                  const selected = dayjs(value);
                  if (selected.isBefore(today)) {
                    return "Date cannot be in the past.";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label="Finance Date"
                    format="DD-MM-YYYY"
                    disablePast
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date ? date.toISOString() : null)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          </div>
          <span className="text-subtitle font-pmedium">Add Particulars</span>
          <div className="flex gap-2">
            <Controller
              name="particularName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Particulars"
                  size="small"
                  fullWidth
                  {...field}
                />
              )}
            />
            <Controller
              name="particularAmount"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Amount"
                  size="small"
                  type="number"
                  fullWidth
                  {...field}
                />
              )}
            />
            <div className="flex flex-col justify-center items-center">
              <PrimaryButton
                title="Add"
                externalStyles={"w-1/4"}
                handleSubmit={() => {
                  const { particularName, particularAmount } = watch();
                  if (particularName && particularAmount) {
                    append({
                      particularName: particularName,
                      particularAmount: parseFloat(particularAmount),
                    });
                    setValue("particularName", "");
                    setValue("particularAmount", "");
                  }
                }}
              />
            </div>
          </div>
          {fields.length > 0 && (
            <div className="mt-4 border border-gray-300 rounded p-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Added Particulars (UI Preview Only):
              </p>
              <ul className="text-xs space-y-1">
                {fields.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center border-b py-1"
                  >
                    <div className="flex flex-col">
                      <span>{item.particularName}</span>
                      <span className="font-medium text-gray-600">
                        INR {item.particularAmount?.toFixed(2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <MdDelete size={20} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between border-t border-gray-300 pt-2 mt-2 text-xs font-semibold text-gray-700">
                <span>Total</span>
                <span>
                  INR{" "}
                  {fields
                    .reduce(
                      (acc, item) =>
                        acc + (parseFloat(item.particularAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </span>
              </div>

              <p className="text-[10px] text-gray-500 mt-2 italic">
                * This list is for UI purposes only. The actual voucher remains
                unchanged.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            {
              name: "modeOfPayment",
              label: "Mode of Payment",
              values: paymentModes,
            },
          ].map(({ name, label, values }) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={label}
                  {...field}
                >
                  {values.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          ))}

          {["chequeNo", "advanceAmount"].map((fieldName) => (
            <Controller
              key={fieldName}
              name={fieldName}
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  size="small"
                  label={fieldName
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  {...field}
                />
              )}
            />
          ))}

          <Controller
            name="chequeDate"
            control={control}
            rules={{
              required: "Date is required",
              validate: (value) => {
                if (!value) return true; // already handled by required
                const today = dayjs().startOf("day");
                const selected = dayjs(value);
                if (selected.isBefore(today)) {
                  return "Date cannot be in the past.";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="Cheque Date"
                  format="DD-MM-YYYY"
                  disablePast
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
          <Controller
            name="expectedDateInvoice"
            control={control}
            rules={{
              required: "Date is required",
              validate: (value) => {
                if (!value) return true; // already handled by required
                const today = dayjs().startOf("day");
                const selected = dayjs(value);
                if (selected.isBefore(today)) {
                  return "Date cannot be in the past.";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="Expected Inovice Date"
                  format="DD-MM-YYYY"
                  disablePast
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </div>

        <div className="place-items-center">
          <PrimaryButton
            title="Preview"
            externalStyles={"w-1/4"}
            handleSubmit={() => setOpenPreview(true)}
          />
        </div>
      </div>

      <MuiModal open={openPreview} onClose={() => setOpenPreview(false)}>
        <Box className="absolute top-1/2 left-1/2 bg-white p-4 rounded shadow max-h-screen overflow-y-auto w-[77%] -translate-x-1/2 -translate-y-1/2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-title text-primary font-pbold uppercase">
              Preview
            </span>
            <IconButton onClick={() => setOpenPreview(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div
            className="flex-1 p-4 border"
            ref={formRef}
            style={{ width: "100%" }} // A4 width in pixels
          >
            <div className="text-center font-bold text-lg">
              MUSTARO TECHNOSERVE PRIVATE LIMITED
            </div>
            <div className="text-center text-sm font-semibold">
              FY{" "}
              {new Date().getMonth() + 1 >= 4
                ? `${String(new Date().getFullYear()).slice(2)}-${String(
                    new Date().getFullYear() + 1
                  ).slice(2)}`
                : `${String(new Date().getFullYear() - 1).slice(2)}-${String(
                    new Date().getFullYear()
                  ).slice(2)}`}
            </div>

            <div className="text-right text-xs text-gray-500">
              Original for finance
            </div>

            {/* Department Info */}
            <div className="text-center text-sm mt-2">
              DEPARTMENT - {voucherDetails?.department}
            </div>
            <div className="flex w-full justify-end items-end flex-col gap-2 text-sm my-2">
              <div className="flex gap-2 items-end">
                <p>S.No.</p>
                <span className="w-28 border-b-default border-black py-1">
                  {voucherDetails?.srNo}
                </span>
              </div>
              <div className="flex gap-2 items-end">
                <p>Date</p>
                <span className="w-28 border-b-default border-black py-1">
                  {voucherDetails?.reimbursementDate}
                </span>
              </div>
            </div>

            {/* First Voucher Table */}
            <div className="text-center font-bold text-base mb-4">VOUCHER</div>
            <table className={tableClasses}>
              <thead>
                <tr>
                  <td className={cellClasses} colSpan={6}>
                    PARTICULARS (Details of Expenses)
                  </td>
                  <td className={cellClasses} colSpan={2}>
                    INR.
                  </td>
                </tr>
              </thead>
              <tbody>
                {voucherDetails?.particulars?.map((item, idx) => (
                  <tr key={idx}>
                    <td className={cellClasses} colSpan={6}>
                      {item.particularName}
                    </td>
                    <td className={cellClasses} colSpan={2}>
                      {item.particularAmount}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className={cellClasses + " font-bold"} colSpan={6}>
                    Total
                  </td>
                  <td className={cellClasses + " font-bold"} colSpan={2}>
                    {voucherDetails?.particulars
                      ?.reduce(
                        (sum, item) => sum + Number(item.particularAmount || 0),
                        0
                      )
                      .toFixed(0)}
                  </td>
                </tr>
              </tbody>
            </table>

            <table className={tableClasses}>
              <tbody>
                <tr>
                  <td className={cellClasses}>
                    Original Invoice is Attached with Voucher
                  </td>
                  <td className={cellClasses}>
                    {voucherDetails?.invoiceAttached ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td className={cellClasses}>
                    Expenses is Pre Approved in Budget
                  </td>
                  <td className={cellClasses}>
                    {voucherDetails?.preApproved ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td className={cellClasses}>Date of Invoice Received</td>
                  <td className={cellClasses}>{voucherDetails?.invoiceDate}</td>
                </tr>
                <tr>
                  <td className={cellClasses}>Invoice No</td>
                  <td className={cellClasses}>{voucherDetails?.invoiceNo}</td>
                </tr>
                <tr>
                  <td className={cellClasses + " font-semibold"}>
                    (IF INVOICE IS NOT ATTACHED WITH VOUCHER) Date on which the
                    Invoice to be delivered to Finance Department.
                  </td>
                  <td className={cellClasses}>{values.deliveryDate}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between text-xs mt-20 mb-4">
              <div className="flex flex-col gap-20">
                <span>(Signature)</span>
                <span>(Department Manager)</span>
              </div>
              <div>(Signature) & Dept. Stamp</div>
            </div>

            <table className={tableClasses}>
              <tbody>
                <tr>
                  <td className={cellClasses}>
                    Expenses is Approved in Budget or other Approval
                  </td>
                  <td className={cellClasses}>
                    {voucherDetails?.emergencyApproval ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td className={cellClasses + " font-semibold"}>
                    If expenses is not Approved/Emergency Expenses (NEED
                    APPROVAL OF L1 Authority)
                  </td>
                  <td className={cellClasses}>
                    {voucherDetails?.budgetApproval ? "Yes" : "No"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between text-xs mt-20 mb-4">
              <div className="flex flex-col gap-20">
                <span>(L1 Authority)</span>
                <span>(Signature) & L1 Stamp</span>
              </div>
              <div>(Signature) & Dept. Stamp</div>
            </div>

            {/* FINANCE AREA */}

            {/* Finance Area */}
            <hr className="border border-black mb-1" />
            <div className="text-center font-bold text-sm mb-1">
              Finance Area
            </div>
            <div className="flex w-full justify-end items-end flex-col gap-2 text-sm my-2">
              <div className="flex gap-2 items-end">
                <p>S.No.</p>
                <span className="w-28 border-b-default border-black pb-2">
                  {values.fSrNo}
                </span>
              </div>
              <div className="flex gap-2 items-end">
                <p>Date</p>
                <span className="w-28 border-b-default border-black pb-2">
                  {humanDate(values.fDate)}
                </span>
              </div>
            </div>

            <div className="text-center font-bold text-base mb-2">VOUCHER</div>
            <table className={tableClasses}>
              <thead>
                <tr>
                  <td className={cellClasses} colSpan={2}>
                    PARTICULARS
                  </td>
                  <td className={cellClasses}>INR</td>
                  {/* <td className={cellClasses}>INR</td> */}
                </tr>
              </thead>
              <tbody>
                {values?.particulars?.map((item, idx) => (
                  <tr key={idx}>
                    <td className={cellClasses} colSpan={2}>
                      {item.particularName}
                    </td>
                    <td className={cellClasses} colSpan={1}>
                      {item.particularAmount}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className={cellClasses + " font-bold"} colSpan={2}>
                    Total
                  </td>
                  <td className={cellClasses + " font-bold"} colSpan={1}>
                    {values?.particulars
                      ?.reduce(
                        (sum, item) => sum + Number(item.particularAmount || 0),
                        0
                      )
                      .toFixed(0)}
                  </td>
                </tr>
              </tbody>
            </table>

            <table className={tableClasses}>
              <tbody>
                <tr>
                  <td className={cellClasses}>Mode of Payment (Tick)</td>
                  <td className={cellClasses}>{values.modeOfPayment}</td>
                </tr>
                <tr>
                  <td className={cellClasses}>Cheque No / UTR No</td>
                  <td className={cellClasses}>{values.chequeNo}</td>
                </tr>
                <tr>
                  <td className={cellClasses}>Cheque / UTR Date</td>
                  <td className={cellClasses}>
                    {humanDate(values.chequeDate)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-center font-medium text-sm mb-6">
              Payment Term (IF PAYMENT MADE IN ADVANCE)
            </div>
            <table className={tableClasses}>
              <tbody>
                <tr>
                  <td className={cellClasses}>Amount (Rs)</td>
                  <td className={cellClasses}>{values.advanceAmount}</td>
                </tr>
                <tr>
                  <td className={cellClasses}>
                    Expected Date of receipt of Invoice
                  </td>
                  <td className={cellClasses}>
                    {humanDate(values.expectedDateInvoice)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between text-xs mt-20">
              <div className="text-center">
                (Accounts executive)
                <br />
                (Signature)
              </div>
              <div className="text-center">
                (Finance Manager)
                <br />
                (Signature) & Stamp
              </div>
            </div>
          </div>

          <div className="mt-4 text-right flex gap-4 items-center justify-center">
            <PrimaryButton
              title="Submit"
              handleSubmit={onUpload}
              disabled={isSubmitRequest}
              isLoading={isSubmitRequest}
            />

            <PrimaryButton title="Export to PDF" handleSubmit={exportToPDF} />
          </div>
        </Box>
      </MuiModal>
    </div>
  );
};

export default ReviewRequest;
