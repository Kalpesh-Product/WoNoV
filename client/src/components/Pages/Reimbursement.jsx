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
import PrimaryButton from "../PrimaryButton";
import MuiModal from "../MuiModal";
import usePageDepartment from "../../hooks/usePageDepartment";
import { MdDelete } from "react-icons/md";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import humanDate from "../../utils/humanDateForamt";
import { toast } from "sonner";
import PageFrame from "./PageFrame";
import UploadFileInput from "../UploadFileInput";
import html2pdf from "html2pdf.js";
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";

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

const Reimbursement = () => {
  const formRef = useRef(null);
  const [openPreview, setOpenPreview] = useState(false);
  const department = usePageDepartment();
  const axios = useAxiosPrivate();
  const { control, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      department: "",
      srNo: "001",
      expanseName: "",
      expanseType: "Reimbursement",
      unitId: "",
      location: "",
      invoiceAttached: false,
      preApproved: false,
      emergencyApproval: false,
      budgetApproval: false,
      l1Approval: false,
      reimbursementDate: null,
      particulars: [],
      invoiceNo: "",
      gstIn: "",
    },
    mode: "onChange",
  });
  const { data: departmentBudget = [], isPending: isDepartmentLoading } =
    useQuery({
      queryKey: ["departmentBudget"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/budget/company-budget?departmentId=${department._id}`
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
    }
  }, [department?.name, reimbursedBudget, setValue]);

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

  // const uniqueBuildings = Array.from(
  //   new Map(
  //     units.length > 0
  //       ? units.map((loc) => [
  //           loc.building._id, // use building._id as unique key
  //           loc.building.buildingName,
  //         ])
  //       : []
  //   ).entries()
  // );

  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units
            .filter((loc) => loc.building && loc.building._id)
            .map((loc) => [loc.building._id, loc.building.buildingName])
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

    const formData = new FormData();

    // Always required fields
    formData.append("department", values.department || "");
    formData.append("srNo", values.srNo || "");
    formData.append("expanseName", values.expanseName || "");
    formData.append("expanseType", values.expanseType || "");
    formData.append("unitId", values.unitId || "");
    formData.append("location", values.location || "");
    formData.append("reimbursementDate", values.reimbursementDate || "");
    formData.append("particulars", JSON.stringify(values.particulars || []));
    formData.append("invoiceAttached", values.invoiceAttached);
    formData.append("preApproved", values.preApproved);
    formData.append("emergencyApproval", values.emergencyApproval);
    formData.append("budgetApproval", values.budgetApproval);
    formData.append("l1Approval", values.l1Approval);
    formData.append("gstIn", values.gstIn || "");
    formData.append("invoiceNo", values.invoiceNo || "");

    // Only append file if invoice is attached
    if (values.invoiceAttached && values.invoiceFile instanceof File) {
      formData.append("invoice", values.invoiceFile);
    }

    const onUpload = async () => {
      const values = getValues();
      values.particulars = fields;

      const formData = new FormData();
      // Append all fields...
      formData.append("gstIn", values.gstIn || "");
      formData.append("invoiceNo", values.invoiceNo || "");
      if (values.invoiceAttached && values.invoiceFile instanceof File) {
        formData.append("invoice", values.invoiceFile);
      }
    };

    if (values.voucherFile instanceof File) {
      formData.append("voucher", values.voucherFile);
      submitRequest(formData);
      return;
    } else {
      try {
        const pdfBlob = await html2pdf()
          .set({
            margin: 0.2,
            filename: "Voucher_Form.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 1, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(formRef.current)
          .outputPdf("blob");

        const file = new File([pdfBlob], "Voucher_Form.pdf", {
          type: "application/pdf",
        });

        formData.append("voucher", file);
        submitRequest(formData);
        return;
      } catch (err) {
        toast.error("Failed to generate voucher PDF.");
        console.error(err);
      }
    }

    submitRequest(formData);
  };

  const { mutate: submitRequest, isPending: isSubmitRequest } = useMutation({
    mutationKey: ["reimbursement"],
    mutationFn: async (data) => {
      const response = await axios.post(
        `/api/budget/request-budget/${department?._id}`,
        data,
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
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const exportToPDF = () => {
    if (!formRef.current) return;

    const options = {
      margin: 0.2,
      filename: "Voucher_Form.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // html2pdf().set(options).from(formRef.current).save();

    html2pdf()
      .set(options)
      .from(formRef.current)
      .outputPdf("blob")
      .then((pdfBlob) => {
        const file = new File([pdfBlob], "Voucher_Form.pdf", {
          type: "application/pdf",
        });

        setValue("voucherFile", file);
      });
  };

  return (
    <div className="flex flex-col gap-4 ">
      <PageFrame>
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-title text-primary font-pbold mb-4 uppercase">
              {department?.name} Department - Voucher Form
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Controller
                name="location"
                control={control}
                rules={{
                  required: "Location is required",
                  validate: { noOnlyWhitespace },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    size="small"
                    select
                    {...field}
                    label="Select Location"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="" disabled>
                      Select Building
                    </MenuItem>
                    {locationsLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : locationsError ? (
                      <MenuItem disabled>Error fetching units</MenuItem>
                    ) : (
                      uniqueBuildings.map(([id, name]) => (
                        <MenuItem key={id} value={name}>
                          {name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                )}
              />
              <Controller
                name="unitId"
                control={control}
                rules={{ required: "Unit is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    size="small"
                    label="Select Unit"
                    disabled={!selectedLocation}
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="">Select Unit</MenuItem>
                    {locationsLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      units
                        .filter(
                          (unit) =>
                            unit.building?.buildingName === selectedLocation
                        )
                        .map((unit) => (
                          <MenuItem key={unit._id} value={unit._id}>
                            {unit.unitNo}
                          </MenuItem>
                        ))
                    )}
                  </TextField>
                )}
              />

              {/* Hidden field to store department ID */}
              <Controller
                name="department"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />

              {/* Display department name separately */}
              <TextField
                fullWidth
                size="small"
                disabled
                label="Department"
                value={department?.name || ""}
              />
              <Controller
                name="srNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    label="Sr No"
                    {...field}
                  />
                )}
              />

              {/* Reimbursement Date */}
              <Controller
                name="reimbursementDate"
                control={control}
                rules={{
                  required: "Reimbursement Date is required",
                  validate: (value) => {
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
                      label="Reimbursement Date"
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
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message,
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              />

              {/* Expense Name */}
              <Controller
                name="expanseName"
                control={control}
                rules={{
                  required: "Expense Name is required",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Expense Name"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <span className="text-subtitle font-pmedium text-primary">
              Add Expenses
            </span>
            <div className="flex gap-2">
              <Controller
                name="particularName"
                control={control}
                rules={{
                  required: "Particular name is required",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Particulars"
                    size="small"
                    fullWidth
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="particularAmount"
                control={control}
                rules={{
                  required: "Amount is required",
                  validate: (value) =>
                    parseFloat(value) > 0 || "Amount must be greater than 0",
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Amount"
                    size="small"
                    type="number"
                    fullWidth
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <div className="flex flex-col justify-center items-center">
                <PrimaryButton
                  title="Add"
                  externalStyles="w-1/4"
                  handleSubmit={() => {
                    const { particularName, particularAmount } = watch();
                    const amountValid = parseFloat(particularAmount) > 0;

                    if (!particularName || !particularAmount || !amountValid) {
                      // trigger validation manually
                      return;
                    }

                    append({
                      particularName,
                      particularAmount: parseFloat(particularAmount),
                    });
                    setValue("particularName", "");
                    setValue("particularAmount", "");
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

                {/* Total Section */}
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
                  * This list is for UI purposes only. The actual voucher
                  remains unchanged.
                </p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Controller
              name="gstIn"
              control={control}
              rules={{
                pattern: {
                  value:
                    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                  message: "Invalid GSTIN format",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  label="GSTIN"
                  size="small"
                  fullWidth
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="invoiceAttached"
              control={control}
              rules={{ required: "Please select if invoice is attached" }}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Invoice Attached"
                  value={field.value ? "Yes" : "No"}
                  onChange={(e) => field.onChange(e.target.value === "Yes")}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {["Yes", "No"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="invoiceFile"
              control={control}
              rules={{
                validate: (value) =>
                  watch("invoiceAttached") && !value
                    ? "Please upload invoice file"
                    : true,
              }}
              render={({ field, fieldState }) => (
                <UploadFileInput
                  allowedExtensions={["pdf"]}
                  value={field.value}
                  onChange={field.onChange}
                  previewType="pdf"
                  disabled={!watch("invoiceAttached")}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            {[
              {
                name: "emergencyApproval",
                label: "Emergency Approval",
              },
              {
                name: "budgetApproval",
                label: "Budget Approval (Finance)",
              },
              {
                name: "l1Approval",
                label: "L1 Authority Approval",
              },
            ].map(({ name, label }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                rules={{ required: `Please select ${label.toLowerCase()}` }}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={label}
                    value={field.value ? "Yes" : "No"}
                    onChange={(e) => field.onChange(e.target.value === "Yes")}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {["Yes", "No"].map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            ))}
          </div>

          <div className="place-items-center">
            <PrimaryButton
              title="Preview"
              externalStyles="w-1/4"
              handleSubmit={() => setOpenPreview(true)}
            />
          </div>
        </div>
      </PageFrame>

      <MuiModal open={openPreview} onClose={() => setOpenPreview(false)}>
        <Box className="absolute top-1/2 left-1/2 bg-white p-4 rounded shadow max-h-screen overflow-y-auto w-[53%] -translate-x-1/2 -translate-y-1/2">
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
            style={{ width: "794px" }} // A4 width in pixels
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
              DEPARTMENT - {department?.name}
            </div>
            <div className="flex w-full justify-end items-end flex-col gap-2 text-sm my-2">
              <div className="flex gap-2 items-end">
                <p>S.No.</p>
                <span className="w-28 border-b-default border-black py-1">
                  {values.srNo}
                </span>
              </div>
              <div className="flex gap-2 items-end">
                <p>Date</p>
                <span className="w-28 border-b-default border-black py-1">
                  {humanDate(values.reimbursementDate)}
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
                {values.particulars?.map((item, idx) => (
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
                    {values.particulars
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
                    {values.invoiceAttached ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td className={cellClasses}>
                    Expenses is Pre Approved in Budget
                  </td>
                  <td className={cellClasses}>
                    {values.preApproved ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td className={cellClasses}>Date of Invoice Received</td>
                  <td className={cellClasses}>{values.invoiceDate}</td>
                </tr>
                <tr>
                  <td className={cellClasses}>Invoice No</td>
                  <td className={cellClasses}>{values.invoiceNo}</td>
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
                    {values.emergencyApproval ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td className={cellClasses + " font-semibold"}>
                    If expenses is not Approved/Emergency Expenses (NEED
                    APPROVAL OF L1 Authority)
                  </td>
                  <td className={cellClasses}>
                    {values.budgetApproval ? "Yes" : "No"}
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

export default Reimbursement;
