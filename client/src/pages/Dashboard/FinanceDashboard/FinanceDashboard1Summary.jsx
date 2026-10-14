import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MdReceiptLong, MdGroups, MdMapsHomeWork, MdCalculate, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { BsFillDatabaseFill } from "react-icons/bs";
import { PiDesktopTowerFill } from "react-icons/pi";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { PERMISSIONS } from "../../../constants/permissions";
import { inrFormat } from "../../../utils/currencyFormat";

const FinanceBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1" aria-hidden="true">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const numeric = (value) => Number(value) || 0;

const FinanceDashboard1Summary = ({ income, expense, incomeGrowth = 0, fiscalYear, assetValueOwned, userPermissions, uniqueClientsSummary, inventorySummary }) => {
  const axios = useAxiosPrivate();
  const canView = (key) => userPermissions.includes(PERMISSIONS[key].value);
  const needsInventory = canView("FINANCE1_TOTAL_INVENTORY_SUMMARY_CARD") || canView("FINANCE1_OCCUPIED_INVENTORY_SUMMARY_CARD") || canView("FINANCE1_PER_SQ_FT_SUMMARY_CARD");
  const { data: units = [] } = useQuery({
    queryKey: ["finance1-summary-units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: needsInventory,
  });
  const { data: assets = [] } = useQuery({
    queryKey: ["finance1-summary-owned-assets"],
    queryFn: async () => {
      const response = await axios.get("/api/assets/get-assets");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: canView("FINANCE1_ASSET_VALUE_OWNED_SUMMARY_CARD"),
  });
  const activeUnits = units.filter((unit) => unit.isActive && !unit.isOnlyBudget && !unit.isDeleted);
  const totalInventory = inventorySummary.total;
  const totalSqft = activeUnits.reduce((sum, unit) => sum + numeric(unit.sqft), 0);
  const occupiedInventory = inventorySummary.occupied;
  const assetValue = assetValueOwned ?? assets.filter((asset) => asset.ownershipType === "Owned").reduce((sum, asset) => sum + numeric(asset.price), 0);
  const cards = [
    { key: "FINANCE1_INCOME_SUMMARY_CARD", title: "Income", percentage: incomeGrowth, value: inrFormat(income), period: fiscalYear, icon: FinanceBarsIcon, tone: "bg-[#eaf4ff] text-[#1d7ed0]" },
    { key: "FINANCE1_EXPENSE_SUMMARY_CARD", title: "Expense", value: inrFormat(expense), period: fiscalYear, icon: MdReceiptLong, tone: "bg-red-50 text-[#f04a4a]" },
    { key: "FINANCE1_PROFIT_LOSS_SUMMARY_CARD", title: "Profit-Loss", value: inrFormat(income - expense), period: fiscalYear, icon: FinanceBarsIcon, tone: "bg-[#eafbf3] text-[#12a573]" },
    { key: "FINANCE1_AVERAGE_UNIQUE_CLIENTS_SUMMARY_CARD", title: "Average Unique Clients", value: uniqueClientsSummary.value, period: uniqueClientsSummary.period, icon: MdGroups, tone: "bg-sky-50 text-[#13a9e8]" },
    { key: "FINANCE1_TOTAL_INVENTORY_SUMMARY_CARD", title: "Total Inventory", value: totalInventory, icon: BsFillDatabaseFill, tone: "bg-blue-50 text-[#1E3D73]" },
    { key: "FINANCE1_OCCUPIED_INVENTORY_SUMMARY_CARD", title: "Occupied Inventory", percentage: inventorySummary.percentage, value: occupiedInventory, icon: PiDesktopTowerFill, tone: "bg-sky-50 text-[#13a9e8]" },
    { key: "FINANCE1_PER_SQ_FT_SUMMARY_CARD", title: "Per Sq. Ft.", icon: MdCalculate, tone: "bg-blue-50 text-[#1d7ed0]", perSqft: true },
    { key: "FINANCE1_ASSET_VALUE_OWNED_SUMMARY_CARD", title: "Asset Value Owned", value: inrFormat(assetValue), icon: MdMapsHomeWork, tone: "bg-sky-50 text-[#13a9e8]" },
  ].filter((card) => canView(card.key));
  if (!cards.length) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, title, value, period, icon: Icon, tone, perSqft, percentage }) => (
        <div key={key} className="flex min-h-[92px] items-center gap-4 rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 shadow-sm">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone}`}><Icon size={34} /></span>
          <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="font-pregular text-base text-[#1E3D73]">{title}</p>
              {percentage !== undefined && (
                <span title={title === "Income" ? "Income change compared with previous fiscal year" : "Occupied inventory / total inventory"} className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${percentage >= 0 ? "bg-[#e8f8ed] text-[#169b4d]" : "bg-[#fdeaea] text-[#d64545]"}`}>
                  {percentage >= 0 ? <MdTrendingUp size={18} /> : <MdTrendingDown size={18} />}
                  {title === "Income" ? percentage.toFixed(1) : percentage}%
                </span>
              )}
            </div>
            {period && <p className="mb-2 text-xs font-semibold text-[#58709A]">{period}</p>}
            {perSqft ? <p className="mt-2 flex flex-wrap gap-x-3 text-sm font-semibold"><span className="text-[#12a573]">Revenue - {inrFormat(totalSqft ? income / totalSqft : 0)}</span><span className="text-[#f04a4a]">Expense - {inrFormat(totalSqft ? expense / totalSqft : 0)}</span></p> : <p className="mt-1 font-pmedium text-lg text-[#1E3D73]">{value}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
export default FinanceDashboard1Summary;