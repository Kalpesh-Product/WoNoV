const PerformanceChartSkeleton = ({ variant = "bar", height = "h-72" }) => (
  <div
    className={`${height} animate-pulse rounded-lg bg-gray-50 p-5`}
    aria-label="Loading performance chart"
  >
    {variant === "donut" ? (
      <div className="flex h-full items-center justify-center">
        <div className="h-48 w-48 rounded-full border-[28px] border-gray-200 bg-white shadow-[inset_0_0_0_1px_#e5e7eb]" />
      </div>
    ) : (
      <>
        <div className="mb-4 flex justify-end gap-2">
          <div className="h-7 w-20 rounded bg-gray-200" />
          <div className="h-7 w-28 rounded bg-gray-200" />
        </div>
        <div className="flex h-[calc(100%-2.75rem)] items-end gap-3 border-b border-l border-gray-300 px-4">
          {[38, 62, 47, 78, 56, 88, 68, 94, 58, 73, 44, 82].map((bar, index) => (
            <div key={index} className="flex-1 rounded-t bg-gray-200" style={{ height: `${bar}%` }} />
          ))}
        </div>
      </>
    )}
  </div>
);

export default PerformanceChartSkeleton;
