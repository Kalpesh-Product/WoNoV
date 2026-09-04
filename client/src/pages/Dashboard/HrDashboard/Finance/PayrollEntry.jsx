import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";

const SummarySection = ({ title, rows }) => (
  <section>
    <h2 className="border-b pb-3 text-subtitle font-semibold text-primary">
      {title}
    </h2>
    <div className="mx-auto mt-4 grid max-w-sm grid-cols-[1fr_auto] gap-x-5 gap-y-3 text-content">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <span className="text-right text-gray-500">{label}</span>
          <span className="font-medium">{value}</span>
        </div>
      ))}
    </div>
  </section>
);

const numberValue = (value) => Number(value) || 0;
const dummyEmployees = [
  {
    id: "dummy-payroll-employee-1",
    employee: "dummy-payroll-employee-1",
    employeeName: "Muskan Dodmani",
    employeeId: "B00081",
    gross: 21825,
    actualGross: 22598,
    basic: 15886,
    allowances: 6482,
    deductions: 1800,
    lossOfPayDays: 1.06,
    lossOfPay: 773,
    incomeTax: 0,
    surcharge: 0,
    cess: 0,
    netAmount: 20025,
    payrollNotes: "",
    allowanceItems: [
      { label: "Conveyance Allowance", amount: 1545 },
      { label: "Medical Allowance", amount: 1207 },
      { label: "Special Allowance", amount: 3730 },
    ],
    deductionItems: [
      { label: "Provident Fund", amount: 1800 },
      { label: "Profession Tax (Goa)", amount: 0 },
    ],
  },
  {
    id: "dummy-payroll-employee-2",
    employee: "dummy-payroll-employee-2",
    employeeName: "Mikasa Ackerman",
    employeeId: "B000193",
    gross: 22500,
    actualGross: 22500,
    basic: 13500,
    allowances: 9000,
    deductions: 1800,
    lossOfPayDays: 0,
    lossOfPay: 0,
    incomeTax: 0,
    surcharge: 0,
    cess: 0,
    netAmount: 20700,
    payrollNotes: "",
    allowanceItems: [{ label: "Special Allowance", amount: 9000 }],
    deductionItems: [{ label: "Provident Fund", amount: 1800 }],
  },
  {
    id: "dummy-payroll-employee-3",
    employee: "dummy-payroll-employee-3",
    employeeName: "Sheryl Vales",
    employeeId: "B000194",
    gross: 14166.67,
    actualGross: 14166.67,
    basic: 8500,
    allowances: 5666.67,
    deductions: 1020,
    lossOfPayDays: 0.5,
    lossOfPay: 272.44,
    incomeTax: 0,
    surcharge: 0,
    cess: 0,
    netAmount: 12874.23,
    payrollNotes: "",
    allowanceItems: [{ label: "Special Allowance", amount: 5666.67 }],
    deductionItems: [{ label: "Provident Fund", amount: 1020 }],
  },
];

const PayrollEntry = () => {
  const axios = useAxiosPrivate();
  const { draftId } = useParams();
  const [employeeRows, setEmployeeRows] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deletedCount, setDeletedCount] = useState(0);
  const { data: draft, isLoading } = useQuery({
    queryKey: ["payrollDraft", draftId],
    queryFn: async () => {
      const response = await axios.get(`/api/payroll/drafts/${draftId}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (!draft) return;
    const savedRows = Array.isArray(draft.employeeSummaries)
      ? draft.employeeSummaries
      : [];
    const initialRows = savedRows.length ? savedRows : dummyEmployees;
    setEmployeeRows(
      initialRows.map((employee, index) => ({
        ...employee,
        id: employee.employee || employee.id || `${employee.employeeId}-${index}`,
        srNo: index + 1,
      }))
    );
    setDeletedCount(0);
  }, [draft]);

  if (isLoading) {
    return <PageFrame>Loading payroll entry...</PageFrame>;
  }

  if (!draft) {
    return <PageFrame>Payroll entry not found.</PageFrame>;
  }

  const workflowSteps = [
    "Compensation",
    "Time & Attendance",
    "IT Declarations",
    "Leave Encashment",
    "Review",
  ];
  const createdBy = [draft.createdBy?.firstName, draft.createdBy?.lastName]
    .filter(Boolean)
    .join(" ") || "N/A";
  const saveEmployeeEdit = () => {
    setEmployeeRows((currentRows) =>
      currentRows.map((row) =>
        row.id === editingEmployee.id ? { ...editingEmployee } : row
      )
    );
    setEditingEmployee(null);
  };
  const confirmEmployeeDelete = () => {
    setEmployeeRows((currentRows) =>
      currentRows
        .filter((row) => row.id !== employeeToDelete.id)
        .map((row, index) => ({ ...row, srNo: index + 1 }))
    );
    setDeletedCount((count) => count + 1);
    setEmployeeToDelete(null);
  };
  const employeeColumns = [
    { field: "srNo", headerName: "Sr No", width: 80 },
    { field: "employeeName", headerName: "Employee Name", minWidth: 180, flex: 1 },
    { field: "employeeId", headerName: "Employee ID", minWidth: 130 },
    { field: "gross", headerName: "Gross (INR)", minWidth: 130, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "actualGross", headerName: "Actual Gross (INR)", minWidth: 165, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "basic", headerName: "Basic (INR)", minWidth: 125, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "allowances", headerName: "Allowances (INR)", minWidth: 155, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "deductions", headerName: "Deductions (INR)", minWidth: 155, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "lossOfPay", headerName: "Loss of Pay (INR)", minWidth: 160, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "incomeTax", headerName: "Income Tax (INR)", minWidth: 150, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "surcharge", headerName: "Surcharge (INR)", minWidth: 145, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "cess", headerName: "Cess (INR)", minWidth: 120, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "netAmount", headerName: "Net Amount (INR)", minWidth: 155, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      pinned: "right",
      lockPinned: true,
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: ({ data: employee }) => (
        <ThreeDotMenu
          rowId={employee.id}
          menuItems={[
            { label: "Edit", onClick: () => setEditingEmployee({ ...employee }) },
            { label: "Delete", onClick: () => setEmployeeToDelete(employee) },
          ]}
        />
      ),
    },
  ];

  return (
    <PageFrame>
      <div className="flex flex-col gap-8 p-2">
        <h1 className="text-title font-semibold text-primary">Payroll Entry</h1>

        <div className="grid overflow-hidden rounded-md border md:grid-cols-6">
          {workflowSteps.map((step) => (
            <div
              key={step}
              className="flex min-h-20 items-center gap-3 border-b-2 border-b-green-500 bg-green-50 p-3 md:border-r"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-semibold text-white">
                ✓
              </span>
              <span className="font-semibold text-green-700">{step}</span>
            </div>
          ))}
          <div className="flex min-h-20 items-center gap-3 border-b-2 border-b-primary bg-blue-50 p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white">
              6
            </span>
            <span>
              <span className="block font-semibold text-primary">Submit</span>
              <span className="block text-xs text-gray-500">Process payroll</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b pb-4 text-content">
          <span>Settled On: {dayjs(draft.createdAt).format("DD MMM, YYYY")}</span>
          <span className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
            {draft.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
          <SummarySection
            title="Payroll Summary"
            rows={[
              ["Payroll Type", draft.payrollType],
              ["Employee Count", draft.employeeCount],
              ["Gross", inrFormat(numberValue(draft.grossAmount))],
              ["Net Amount", inrFormat(numberValue(draft.netAmount))],
              ["Loss Of Pay", inrFormat(numberValue(draft.lossOfPay))],
            ]}
          />
          <SummarySection
            title="TDS Summary"
            rows={[
              ["Income Tax", inrFormat(numberValue(draft.incomeTax))],
              ["Surcharge", inrFormat(numberValue(draft.surcharge))],
              ["CESS", inrFormat(numberValue(draft.cess))],
              ["Total TDS", inrFormat(numberValue(draft.incomeTax) + numberValue(draft.surcharge) + numberValue(draft.cess))],
              ["Total TDS Rounded", inrFormat(Math.round(numberValue(draft.incomeTax) + numberValue(draft.surcharge) + numberValue(draft.cess)))],
            ]}
          />
          <SummarySection
            title="PF Summary"
            rows={[
              ["Employee Contribution (EE)", inrFormat(numberValue(draft.employeePf))],
              ["Employer Contribution (ER)", inrFormat(numberValue(draft.employerPf))],
              ["Voluntary Provident Fund", inrFormat(numberValue(draft.voluntaryProvidentFund))],
              ["Total PF", inrFormat(numberValue(draft.employeePf) + numberValue(draft.employerPf) + numberValue(draft.voluntaryProvidentFund))],
              ["Employees (count)", numberValue(draft.pfEmployeeCount)],
            ]}
          />
          <SummarySection
            title="ESI/Prof. Tax Summary"
            rows={[
              ["ESI Employee Contribution", inrFormat(numberValue(draft.employeeEsi))],
              ["ESI Employer Contribution", inrFormat(numberValue(draft.employerEsi))],
              ["Total ESI", inrFormat(numberValue(draft.employeeEsi) + numberValue(draft.employerEsi))],
              ["ESI Employees (count)", numberValue(draft.esiEmployeeCount)],
            ]}
          />
          <SummarySection
            title="Activity"
            rows={[
              ["Started On", dayjs(draft.createdAt).format("DD MMM, YYYY [at] hh:mm A")],
              ["Started By", createdBy],
            ]}
          />
        </div>

        <div className="border-t pt-6">
          {deletedCount > 0 && (
            <p className="mb-3 text-content font-medium text-gray-600">
              Deleted employees: {deletedCount}
            </p>
          )}
          <AgTable
            data={employeeRows}
            columns={employeeColumns}
            search
            exportData
            tableTitle="Employee Summary"
            tableHeight={420}
          />
        </div>
      </div>

      <MuiModal
        open={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee Payroll"
        widthClass="w-[95%] max-w-7xl"
      >
        {editingEmployee && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-3 border-b pb-6 sm:grid-cols-3 lg:grid-cols-5">
              {[
                ["Basic", editingEmployee.basic],
                ["Gross", editingEmployee.gross],
                ["Net Amount", editingEmployee.netAmount],
                ["Income Tax", editingEmployee.incomeTax],
                [
                  "TDS (Income Tax + Cess + Surcharge)",
                  numberValue(editingEmployee.incomeTax) +
                    numberValue(editingEmployee.cess) +
                    numberValue(editingEmployee.surcharge),
                ],
              ].map(([label, value]) => (
                <div key={label} className="border-l-2 border-green-500 px-4 py-2">
                  <p className="text-subtitle font-semibold text-green-600">
                    {inrFormat(numberValue(value))}
                  </p>
                  <p className="mt-1 text-xs text-green-700">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2">
              <section>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-primary">Allowances</h3>
                  <span className="font-semibold">
                    {inrFormat(numberValue(editingEmployee.allowances))}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 text-content">
                  {(editingEmployee.allowanceItems?.length
                    ? editingEmployee.allowanceItems
                    : [
                        {
                          label: "Special Allowance",
                          amount: editingEmployee.allowances,
                        },
                      ]
                  ).map((item) => (
                    <div key={item.label} className="flex justify-between gap-4">
                      <span className="text-gray-600">{item.label}</span>
                      <span>{inrFormat(numberValue(item.amount))}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-primary">Deductions</h3>
                  <span className="font-semibold">
                    {inrFormat(numberValue(editingEmployee.deductions))}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 text-content">
                  {(editingEmployee.deductionItems?.length
                    ? editingEmployee.deductionItems
                    : [
                        {
                          label: "Provident Fund",
                          amount: editingEmployee.deductions,
                        },
                      ]
                  ).map((item) => (
                    <div key={item.label} className="flex justify-between gap-4">
                      <span className="text-gray-600">{item.label}</span>
                      <span>{inrFormat(numberValue(item.amount))}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-primary">IT Declarations</h3>
                  <span className="font-semibold">{inrFormat(0)}</span>
                </div>
                <p className="mt-4 text-content text-gray-500">
                  No IT declarations available for this employee.
                </p>
              </section>

              <section>
                <h3 className="mb-4 border-b pb-2 font-semibold text-primary">
                  <span className="flex items-center justify-between">
                    <span>Loss of Pay</span>
                    <span>{inrFormat(numberValue(editingEmployee.lossOfPay))}</span>
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ["lossOfPayDays", "Loss of Pay Days"],
                    ["lossOfPay", "Loss of Pay Amount (INR)"],
                  ].map(([field, label]) => (
                    <label key={field} className="flex flex-col gap-1 text-content">
                      <span className="text-gray-600">{label}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingEmployee[field] ?? 0}
                        onChange={(event) =>
                          setEditingEmployee((employee) => ({
                            ...employee,
                            [field]: Number(event.target.value),
                          }))
                        }
                        className="rounded border border-gray-300 px-3 py-2 outline-none focus:border-primary"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-4 border-b pb-2 font-semibold text-primary">
                  Payroll Notes
                </h3>
                <textarea
                  rows={4}
                  value={editingEmployee.payrollNotes || ""}
                  onChange={(event) =>
                    setEditingEmployee((employee) => ({
                      ...employee,
                      payrollNotes: event.target.value,
                    }))
                  }
                  placeholder="Add payroll notes"
                  className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-primary"
                />
              </section>

              <aside className="text-sm text-gray-600">
                <p className="mb-4 border-b pb-2 font-semibold text-primary">
                  Note
                </p>
                <p className="text-red-600">
                  * Allowances will vary if there is loss of pay for the employee.
                </p>
                <p>
                  * IT declarations and PF/PT amounts will not be considered for
                  income-tax calculations if the employee opted for the new tax
                  regime.
                </p>
              </aside>
            </div>

            <div className="flex justify-end gap-3">
              <PrimaryButton
                title="Cancel"
                handleSubmit={() => setEditingEmployee(null)}
                externalStyles="!bg-gray-500"
              />
              <PrimaryButton title="Save" handleSubmit={saveEmployeeEdit} />
            </div>
          </div>
        )}
      </MuiModal>

      <ConfirmationModal
        open={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={confirmEmployeeDelete}
        title="Delete Employee Payroll Entry"
        message={`Are you sure you want to delete ${employeeToDelete?.employeeName || "this employee"} from this payroll draft?`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </PageFrame>
  );
};

export default PayrollEntry;
