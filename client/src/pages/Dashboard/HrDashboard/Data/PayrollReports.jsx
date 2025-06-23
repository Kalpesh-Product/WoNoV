import React from "react";
import MonthWiseTable from "../../../../components/Tables/MonthWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";

const PayrollReports = () => {
  const axios = useAxiosPrivate();
  return (
    <div>
      <PageFrame>
        <MonthWiseTable data={[]} columns={[]} tableTitle={"Payroll Reports"} />
      </PageFrame>
    </div>
  );
};

export default PayrollReports;
