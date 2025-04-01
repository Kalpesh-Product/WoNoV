import AgTable from "../../../../../components/AgTable";
import CustomYAxis from "../../../../../components/graphs/CustomYAxis";
import WidgetSection from '../../../../../components/WidgetSection'
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const Leaves = () => {
  const axios = useAxiosPrivate()
  const { data: leaves = [] } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/leaves/view-all-leaves-before-today");
        return response.data
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const leavesColumn = [
    { field: "fromDate", headerName: "From Date" },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "hours", headerName: "Hours" },
    { field: "description", headerName: "Description" },
    { field: "status", headerName: "Status" },
  ];
  return (
    <div className="flex flex-col gap-8">
      {/* <div>
        <BarGraph
          options={options}
          data={series}
        />
      </div> */}
      <div>
        <WidgetSection layout={1} title={"Leaves Data"} border>
          <CustomYAxis />
        </WidgetSection>
      </div>
      <div>
        <AgTable
        key={leaves.length}
          search={true}
          searchColumn={"Leave Type"}
          tableTitle={"Aiwin's Leave List"}
          buttonTitle={"Add Requested Leave"}
          data={[...leaves.map((leave,index)=>({
            id : index+1,
            fromDate : new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(new Date(leave.fromDate)),
            toDate : new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(new Date(leave.toDate)),
            leaveType : leave.leaveType,
            leavePeriod : leave.leavePeriod,
            hours : leave.hours,
            description:leave.description,
            status:leave.status
          }))]}
          columns={leavesColumn}
        />
      </div>
    </div>
  );
};

export default Leaves;
