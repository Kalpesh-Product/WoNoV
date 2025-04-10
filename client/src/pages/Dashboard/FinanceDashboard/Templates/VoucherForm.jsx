import React, { useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import PrimaryButton from "../../../../components/PrimaryButton";

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expenses",
  });

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
    <div className="flex gap-4">
      {/* Voucher Layout */}
      <div className="flex-1 p-4 border" ref={formRef}>
        <div className="text-center font-bold text-lg">
          MUSTARO TECHNOSERVE PRIVATE LIMITED
        </div>
        <div className="text-center text-sm font-semibold">FY 23-24</div>
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
            <span className="w-28 border-b-default border-black">
              {values.sNo}
            </span>
          </div>
          <div className="flex gap-2 items-end">
            <p>Date</p>
            <span className="w-28 border-b-default border-black">
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
                Rs.
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
                If expenses is not Approved/Emergency Expenses (NEED APPROVAL OF
                L1 Authority) (Tick)
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
        <div className="text-center font-bold text-sm mb-1">Finance Area</div>
        <div className="flex w-full justify-end items-end flex-col gap-2 text-sm my-2">
          <div className="flex gap-2 items-end">
            <p>S.No.</p>
            <span className="w-28 border-b-default border-black">
              {values.sNo}
            </span>
          </div>
          <div className="flex gap-2 items-end">
            <p>Date</p>
            <span className="w-28 border-b-default border-black">
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

        <div className="text-center font-medium text-sm">
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

      {/* Editor Panel */}
      <div className="w-[30%] p-4 border h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-subtitle font-semibold mb-4">Edit Fields</h2>

        <div className="space-y-2">
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
          <h3 className="text-sm font-semibold">Add Particulars</h3>

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
          <PrimaryButton
            title="Add"
            externalStyles={"w-full"}
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
        ].map(({ name, label, values }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <TextField select fullWidth size="small" label={label} {...field}>
                {values.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ))}

        {["invoiceDate", "invoiceNo", "deliveryDate"].map((fieldName) => (
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

        {[
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
              <TextField select fullWidth size="small" label={label} {...field}>
                {values.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ))}

        {["chequeNo", "chequeDate", "amount", "expectedDate"].map(
          (fieldName) => (
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
          )
        )}

        {[
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
              <TextField select fullWidth size="small" label={label} {...field}>
                {values.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ))}

        <PrimaryButton title="Export to PDF" handleSubmit={exportToPDF} />
      </div>
    </div>
  );
};

export default VoucherForm;
