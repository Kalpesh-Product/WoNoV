import PageFrame from "../../../../components/Pages/PageFrame";

const MaintainanceDtcEnergyReadingMonthly = () => {
  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Maintenance Mix Bag
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            DTC Energy – Monthly Reading
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Track monthly DTC energy readings for the maintenance dashboard.
          </p>
        </div>
      </PageFrame>
    </div>
  );
};

export default MaintainanceDtcEnergyReadingMonthly;
