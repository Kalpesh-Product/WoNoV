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

// Shared single-line (nowrap) legend used by the donut/pie dashboard charts so
// every chart's legend text, dots and spacing look exactly the same.
export const SingleLineLegend = ({
  labels = [],
  colors = [],
  suffix = "",
  maxLabelWidth,
}) => (
  <div className="flex h-[22px] w-full flex-nowrap items-center justify-center gap-x-2.5 overflow-hidden px-2 text-xs text-[#373d3f]">
    {labels.map((label, index) => (
      <span
        key={`${label}-${index}`}
        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap"
        title={suffix ? `${label} ${suffix}` : label}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: colors?.[index] || "#1E3D73" }}
        />
        {/* Long names stay on one line and end with "..." (full name in tooltip/title) */}
        <span
          className={maxLabelWidth ? "inline-block overflow-hidden text-ellipsis" : undefined}
          style={maxLabelWidth ? { maxWidth: maxLabelWidth } : undefined}
        >
          {label}
        </span>
      </span>
    ))}
  </div>
);
