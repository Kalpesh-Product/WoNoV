const PerformanceTableSkeleton = () => (
  <div className="w-full animate-pulse space-y-3 rounded-lg border border-gray-200 bg-white p-4">
    <div className="h-9 rounded bg-gray-100" />
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="grid grid-cols-4 gap-3">
        <div className="h-8 rounded bg-gray-100" />
        <div className="col-span-2 h-8 rounded bg-gray-100" />
        <div className="h-8 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

export default PerformanceTableSkeleton;
