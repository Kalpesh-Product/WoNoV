import React from 'react'
import { Outlet } from 'react-router-dom'
import AgTable from '../../../../components/AgTable'

const CollectionsLayout = () => {
  const collectionsColumns = [{
    headerName: "S. No",
    field: "serialNumber",
    valueGetter: (params) => params.node.rowIndex + 1,
    width: 100,
  },
  { field: "client", headerName: "Client", flex : 1},
  { field: "month", headerName: "Month"},
  { field: "amount", headerName: "Amount (INR)"},
  { field: "status", headerName: "Status"},
]

const collectionsRows = [
  { client: "Reliance", month: "Apr-25", amount: "1,20,000", status: "Paid" },
  { client: "TCS", month: "Aar-25", amount: "95,000", status: "Paid" },
  { client: "Infosys", month: "Feb-25", amount: "1,05,000", status: "Paid" },
  { client: "Wipro", month: "Jan-25", amount: "98,000", status: "Paid" },
  { client: "L&T", month: "Dec-24", amount: "1,10,000", status: "Paid" },
  { client: "Adani", month: "Nov-24", amount: "1,25,000", status: "Paid" },
  { client: "Zomato", month: "Oct-24", amount: "88,000", status: "Paid" },
  { client: "Swiggy", month: "Sep-24", amount: "91,000", status: "Paid" },
  { client: "CRED", month: "Aug-24", amount: "85,000", status: "Paid" },
  { client: "Meesho", month: "Jul-24", amount: "77,000", status: "Paid" },
];
  return (
    <div className='flex flex-col gap-4'>
      <AgTable search data={collectionsRows} columns={collectionsColumns} tableTitle={"Collections Paid"} />
    </div>
  )
}

export default CollectionsLayout
