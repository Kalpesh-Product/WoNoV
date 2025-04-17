import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import { inrFormat } from "../../../utils/currencyFormat";

const ItAnnualExpenses = () => {
  const expenseColumns = [
    { field: "id", headerName: "Sr No" }, // Updated here
    { field: "category", headerName: "Category" },
    { field: "expenseName", headerName: "Expense Name" },
    { field: "date", headerName: "Date" },
    { field: "amount", headerName: "Amount (INR)" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => <PrimaryButton title="Details" />,
    },
  ];

  const expenseData = [
    {
      category: "Bills",
      expenseName: "Electricity Bill",
      date: "18-10-2024",
      amount: "8500",
    },
    {
      category: "Software Licenses",
      expenseName: "Antivirus Subscription",
      date: "05-01-2024",
      amount: "12000",
    },
    {
      category: "Hardware",
      expenseName: "New Routers",
      date: "20-02-2024",
      amount: "35000",
    },
    {
      category: "Maintenance",
      expenseName: "Server Maintenance",
      date: "12-03-2024",
      amount: "18000",
    },
    {
      category: "Cloud Services",
      expenseName: "AWS Monthly Bill",
      date: "28-04-2024",
      amount: "22000",
    },
    {
      category: "Bills",
      expenseName: "Internet Bill",
      date: "15-05-2024",
      amount: "6000",
    },
    {
      category: "Software Licenses",
      expenseName: "MS Office Annual License",
      date: "01-06-2024",
      amount: "25000",
    },
    {
      category: "Hardware",
      expenseName: "Laptop Purchases",
      date: "18-07-2024",
      amount: "150000",
    },
    {
      category: "Maintenance",
      expenseName: "Air Conditioning Repair",
      date: "10-08-2024",
      amount: "7500",
    },
    {
      category: "Cloud Services",
      expenseName: "Google Workspace",
      date: "01-09-2024",
      amount: "10500",
    },
    {
      category: "Security",
      expenseName: "Firewall Upgrade",
      date: "22-10-2024",
      amount: "30000",
    },
    {
      category: "Consulting",
      expenseName: "Tech Consultant Fee",
      date: "11-11-2024",
      amount: "45000",
    },
  ];

  return (
    <div className="p-4">
      <AgTable
        key={expenseData.length}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"Annual Expenses"}
        data={[
          ...expenseData.map((expense, index) => ({
            id: index + 1,
            category: expense.category,
            expenseName: expense.expenseName,
            date: expense.date,
            amount: inrFormat(expense.amount),
          })),
        ]}
        columns={expenseColumns}
      />
    </div>
  );
};

export default ItAnnualExpenses;
