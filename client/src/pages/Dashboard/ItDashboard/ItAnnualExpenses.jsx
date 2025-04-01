import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";

const ItAnnualExpenses = () => {
 
  const expenseColumns = [
    { field: "id", headerName: "ID" },
    { field: "category", headerName: "Category" },
    { field: "expenseName", headerName: "Expense Name" },
    { field: "date", headerName: "Date" },
    { field: "amount", headerName: "Amount" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <PrimaryButton
          title="Details"

        />
      ),
    },
  ];
  const  expenseData = [
    {category: "Bills", expenseName : "Electricity Bill", date : "18-10-2024", amount : "8500"}
  ]


  return (
    <div className="p-4">
      <AgTable
        key={expenseData.length}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"Annual Expenses"}
        buttonTitle={"Add Expense"}
        data={[
          ...expenseData.map((expense, index) => ({
            id: index + 1,
            category: expense.category,
            expenseName: expense.expenseName,
            date: expense.date,
            amount: expense.amount
          })),
        ]}
        columns={expenseColumns}
      />
    </div>
  );
};

export default ItAnnualExpenses;
