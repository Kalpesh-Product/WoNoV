import React from 'react'
import Chart from "react-apexcharts";

const LineGraph = ({options, data}) => {
  return (
    <div>
    <Chart options={options} series={data} type="line" height={350} />
    </div>
  )
}

export default LineGraph
