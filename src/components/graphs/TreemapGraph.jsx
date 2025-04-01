import React from "react";
import Chart from "react-apexcharts";
import { useMediaQuery } from "@mui/material";

const TreemapGraph = ({ data, width, height, options, colors }) => {
    // Ensure data values are numbers
    const formattedData = data.map((item) => ({ x: item.label, y: parseFloat(item.value) }));

    // Detect mobile view
    const isMobile = useMediaQuery("(max-width: 768px)");

    const series = [{ data: formattedData }];

    return (
        <div>
            <Chart
                options={{ ...options, colors: colors || ["#1B5299", "#694D75", "#9FC2CC", "#F1ECCE", "#331832"] }}
                series={series}
                type="treemap"
                width={isMobile ? "100%" : width || 550}
                height={height || 350}
            />

        </div>
    );
};

export default TreemapGraph;
