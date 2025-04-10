import React from "react";
import AgTable from "../../../../../components/AgTable";
import BarGraph from "../../../../../components/graphs/BarGraph";
import CustomYAxis from "../../../../../components/graphs/CustomYAxis";
import WidgetSection from '../../../../../components/WidgetSection'
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const Leaves = () => {
  const axios = useAxiosPrivate()
  const {id} = useParams()
  const name = localStorage.getItem('employeeName') || 'Employee'
  const { data: leaves = [] } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/leaves/view-leaves/${id}`);
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

  const leavesData = {
    user: "Aiwin",
    allocated: 12,
    taken: 2,
    remaining: 10,
    monthlyData: [
      {
        month: "January",
        monthIndex: 1,
        year: 2025,
        privilegedLeaves: 1,
        sickLeaves: 1,
        casualLeaves: 0,
      },
    ],
  };

  

  // Prepare data for ApexCharts
  const months = leavesData.monthlyData.map((entry) => entry.month);

  // const options = {
  //   chart: {
  //     type: 'bar',
  //   },
  //   xaxis: {
  //     categories: ['Privileged Leaves', 'Sick Leaves', 'Abrupt Leaves']
  //   }
  // };

  
  // Series data (stacked bar with allocated vs taken)
  // const series = [
  //   {
  //     name: "Privileged Leaves (Taken)",
  //     data: leavesData.monthlyData.map((entry) => entry.privilegedLeaves),
  //     color: "#FF4560", // Red for taken leaves
  //   },
  //   {
  //     name: "Privileged Leaves (Remaining)",
  //     data: leavesData.monthlyData.map((entry) =>
  //       Math.max(leavesData.allocated / 3 - entry.privilegedLeaves, 0)
  //     ),
  //     color: "#00E396", // Green for remaining allocation
  //   },
  //   {
  //     name: "Sick Leaves (Taken)",
  //     data: leavesData.monthlyData.map((entry) => entry.sickLeaves),
  //     color: "#775DD0", // Purple for taken leaves
  //   },
  //   {
  //     name: "Sick Leaves (Remaining)",
  //     data: leavesData.monthlyData.map((entry) =>
  //       Math.max(leavesData.allocated / 3 - entry.sickLeaves, 0)
  //     ),
  //     color: "#4CAF50", // Green for remaining allocation
  //   },
  //   {
  //     name: "Casual Leaves (Taken)",
  //     data: leavesData.monthlyData.map((entry) => entry.casualLeaves),
  //     color: "#FBC02D", // Yellow for taken leaves
  //   },
  //   {
  //     name: "Casual Leaves (Remaining)",
  //     data: leavesData.monthlyData.map((entry) =>
  //       Math.max(leavesData.allocated / 3 - entry.casualLeaves, 0)
  //     ),
  //     color: "#29B6F6", // Blue for remaining allocation
  //   },
  // ];
  
  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
      }
    },
    xaxis: {
      title: {
        text: "Number of Leaves",
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '14px'
        }
      }
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        const month = data.month || "-";
        const taken = data.taken || data.y;
        const allocated = data.allocated || data.y;
        const leaveType = data.x;
  
        return `
          <div style="padding: 8px;">
            <strong>Month:</strong> ${month}<br/>
            <strong>${leaveType} (Allocated):</strong> ${allocated}<br/>
            <strong>${leaveType} (Taken):</strong> ${taken}
          </div>
        `;
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right"
    }
  };

  const series = [
    {
      name: "Allocated",
      data: [
        { x: "Privileged Leave", y: 12, taken: 2, month: "Jan" },
        { x: "Sick Leave", y: 10, taken: 0, month: "Jan" },
        { x: "Abrupt Leave", y: 1, taken: 1, month: "Jan" }
      ],
      color: "#90ee90", // light green
    },
    {
      name: "Taken",
      data: [
        { x: "Privileged Leave", y: 2, allocated: 12, month: "Jan" },
        { x: "Sick Leave", y: 0, allocated: 10, month: "Jan" },
        { x: "Abrupt Leave", y: 1, allocated: 1, month: "Jan" }
      ],
      color: "red",
    }
  ];
  
  return (
    <div className="flex flex-col gap-8">
      <div>
      <WidgetSection layout={1} title={"Leaves Data"} border>
      <Chart options={options} series={series} type="bar" height={300} />

        </WidgetSection>
      </div>
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
          tableTitle={`${name}'s Leaves`}
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
