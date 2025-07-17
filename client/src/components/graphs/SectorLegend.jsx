import React from "react";

const SectorLegend = ({ data }) => {
  return (
    <ul className="space-y-2 text-sm">
      {data.map((item, index) => (
        <li key={index} className="flex items-center gap-2">
          {/* Colored dot */}
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {/* Truncate if too long */}
          <span className="truncate max-w-[150px]">{item.label}</span>
        </li>
      ))}
    </ul>
  );
};

export default SectorLegend;
