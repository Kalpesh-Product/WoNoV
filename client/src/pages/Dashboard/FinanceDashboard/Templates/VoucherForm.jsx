import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { TextField, MenuItem, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrimaryButton from "../../../../components/PrimaryButton";
import MuiModal from "../../../../components/MuiModal";

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

const VoucherForm = () => {
  const formRef = useRef(null);
  const [openPreview, setOpenPreview] = useState(false);

  const { control, watch, setValue } = useForm({
    defaultValues: {
      department: "Tech",
      sNo: "001",
      date: "10/04/2025",
      invoiceAttached: "No",
      preApproved: "No",
      emergencyApproval: "No",
      budgetApproval: "No",
      l1Approval: "No",
      invoiceDate: "",
      invoiceNo: "",
      deliveryDate: "",
      financeSNo: "",
      financeDate: "",
      modeOfPayment: "Cash",
      chequeNo: "",
      chequeDate: "",
      amount: "",
      expectedDate: "",
      expenses: [],
    },
  });

  const { fields, append } = useFieldArray({ control, name: "expenses" });
  const values = watch();

  const exportToPDF = async () => {
    const canvas = await html2canvas(formRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("Voucher_Form.pdf");
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-title text-primary font-pbold mb-4 uppercase">
            Voucher Form
          </span>
          <PrimaryButton
            title="Preview Voucher"
            externalStyles={"w-1/4"}
            handleSubmit={() => setOpenPreview(true)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {["department", "sNo", "date"].map((fieldName) => (
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
          </div>

          <span className="text-subtitle font-pmedium">Add Particulars</span>
          <div className="flex gap-2">
            <Controller
              name="newParticular"
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
              name="newAmount"
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
          </div>
          {fields.length > 0 && (
            <div className="mt-4 border border-gray-300 rounded p-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Added Particulars (UI Preview Only):
              </p>
              <ul className="text-xs space-y-1 list-disc pl-4">
                {fields.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.particular}</span>
                    <span className="font-medium">
                      INR {item.amount?.toFixed(2)}
                    </span>
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
                      (acc, item) => acc + (parseFloat(item.amount) || 0),
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>

              <p className="text-[10px] text-gray-500 mt-2 italic">
                * This list is for UI purposes only. The actual voucher remains
                unchanged.
              </p>
            </div>
          )}

          <div className="flex flex-col justify-center items-center">
            {/* UI-only List of Added Particulars */}

            <PrimaryButton
              title="Add"
              externalStyles={"w-1/4"}
              handleSubmit={() => {
                const { newParticular, newAmount } = watch();
                if (newParticular && newAmount) {
                  append({
                    particular: newParticular,
                    amount: parseFloat(newAmount),
                  });
                  setValue("newParticular", "");
                  setValue("newAmount", "");
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            {
              name: "invoiceAttached",
              label: "Invoice Attached (Tick)",
              values: options,
            },
            {
              name: "preApproved",
              label: "Pre Approved in Budget (Tick)",
              values: options,
            },
            {
              name: "emergencyApproval",
              label: "Emergency Approval (Tick)",
              values: options,
            },
            {
              name: "budgetApproval",
              label: "Budget Approval (Finance)",
              values: options,
            },
            {
              name: "l1Approval",
              label: "L1 Authority Approval",
              values: options,
            },
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            "invoiceDate",
            "invoiceNo",
            "deliveryDate",
            "chequeNo",
            "chequeDate",
            "amount",
            "expectedDate",
          ].map((fieldName) => (
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
        </div>
      </div>

      <MuiModal open={openPreview} onClose={() => setOpenPreview(false)}>
        <Box className="absolute top-1/2 left-1/2 bg-white p-4 rounded shadow max-h-screen overflow-y-auto w-[80%] -translate-x-1/2 -translate-y-1/2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-title text-primary font-pbold">
              Voucher Preview
            </span>
            <IconButton onClick={() => setOpenPreview(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div className="flex-1 p-4 border" ref={formRef}>
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
              DEPARTMENT - {values.department}
            </div>
            <div className="flex w-full justify-end items-end flex-col gap-2 text-sm my-2">
              <div className="flex gap-2 items-end">
                <p>S.No.</p>
                <span className="w-28 border-b-default border-black py-1">
                  {values.sNo}
                </span>
              </div>
              <div className="flex gap-2 items-end">
                <p>Date</p>
                <span className="w-28 border-b-default border-black py-1">
                  {values.date}
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
                {values.expenses?.map((item, idx) => (
                  <tr key={idx}>
                    <td className={cellClasses} colSpan={6}>
                      {item.particular}
                    </td>
                    <td className={cellClasses} colSpan={2}>
                      {item.amount}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className={cellClasses + " font-bold"} colSpan={6}>
                    Total
                  </td>
                  <td className={cellClasses + " font-bold"} colSpan={2}>
                    ₹
                    {values.expenses
                      ?.reduce((sum, item) => sum + Number(item.amount || 0), 0)
                      .toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <table className={tableClasses}>
              <tbody>
                <tr>
                  <td className={cellClasses}>
                    Original Invoice is Attached with Voucher (Tick)
                  </td>
                  <td className={cellClasses}>{values.invoiceAttached}</td>
                </tr>
                <tr>
                  <td className={cellClasses}>
                    Expenses is Pre Approved in Budget (Tick)
                  </td>
                  <td className={cellClasses}>{values.preApproved}</td>
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
                    Expenses is Approved in Budget or other Approval (Tick)
                  </td>
                  <td className={cellClasses}>{values.emergencyApproval}</td>
                </tr>
                <tr>
                  <td className={cellClasses + " font-semibold"}>
                    If expenses is not Approved/Emergency Expenses (NEED
                    APPROVAL OF L1 Authority) (Tick)
                  </td>
                  <td className={cellClasses}>{values.budgetApproval}</td>
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

            {/* Finance Area */}
            <hr className="border border-black mb-1" />
            <div className="text-center font-bold text-sm mb-1">
              Finance Area
            </div>
            <div className="flex w-full justify-end items-end flex-col gap-2 text-sm my-2">
              <div className="flex gap-2 items-end">
                <p>S.No.</p>
                <span className="w-28 border-b-default border-black py-1">
                  {values.sNo}
                </span>
              </div>
              <div className="flex gap-2 items-end">
                <p>Date</p>
                <span className="w-28 border-b-default border-black py-1">
                  {values.date}
                </span>
              </div>
            </div>

            <div className="text-center font-bold text-base mb-2">VOUCHER</div>
            <table className={tableClasses}>
              <thead>
                <tr>
                  <td className={cellClasses}>PARTICULARS</td>
                  <td className={cellClasses}>Rs.</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={cellClasses}>DEBIT</td>
                  <td className={cellClasses}></td>
                </tr>
                <tr>
                  <td className={cellClasses}>CREDIT</td>
                  <td className={cellClasses}></td>
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
                  <td className={cellClasses}>{values.chequeDate}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-center font-medium text-sm mb-4">
              Payment Term (IF PAYMENT MADE IN ADVANCE)
            </div>
            <table className={tableClasses}>
              <tbody>
                <tr>
                  <td className={cellClasses}>Amount (Rs)</td>
                  <td className={cellClasses}>{values.amount}</td>
                </tr>
                <tr>
                  <td className={cellClasses}>
                    Expected Date of receipt of Invoice
                  </td>
                  <td className={cellClasses}>{values.expectedDate}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between text-xs mt-6">
              <div className="text-center my-4 mt-10">
                (Accounts executive)
                <br />
                (Signature)
              </div>
              <div className="text-center my-4 mt-10">
                (Finance Manager)
                <br />
                (Signature) & Stamp
              </div>
            </div>
          </div>
          <div className="mt-4 text-right">
            <PrimaryButton title="Export to PDF" handleSubmit={exportToPDF} />
          </div>
        </Box>
      </MuiModal>
    </div>
  );
};

export default VoucherForm;
