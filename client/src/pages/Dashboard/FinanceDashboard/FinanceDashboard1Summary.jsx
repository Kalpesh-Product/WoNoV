import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MdReceiptLong, MdGroups, MdMapsHomeWork, MdCalculate, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { BsFillDatabaseFill } from "react-icons/bs";
import { PiDesktopTowerFill } from "react-icons/pi";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { PERMISSIONS } from "../../../constants/permissions";
import { useCurrency } from "../../../context/CurrencyContext";

const FinanceBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1" aria-hidden="true">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const numeric = (value) => Number(value) || 0;

const FinanceDashboard1Summary = ({ income, expense, profitLoss, incomeGrowth = 0, fiscalYear, assetValueOwned, userPermissions, uniqueClientsSummary, inventorySummary, totalSqft = 0 }) => {
  const axios = useAxiosPrivate();
  const { currency, convert } = useCurrency();
  const canView = (key) => userPermissions.includes(PERMISSIONS[key].value);
  const { data: assets = [] } = useQuery({
    queryKey: ["finance1-summary-owned-assets"],
    queryFn: async () => {
      const response = await axios.get("/api/assets/get-assets");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: canView("FINANCE1_ASSET_VALUE_OWNED_SUMMARY_CARD"),
  });
  const totalInventory = inventorySummary.total;
  const occupiedInventory = inventorySummary.occupied;
  const assetValue = assetValueOwned ?? assets.filter((asset) => asset.ownershipType === "Owned").reduce((sum, asset) => sum + numeric(asset.price), 0);
  const formatCurrency = (value) => {
    const formattedValue = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.trunc(convert(numeric(value))));
    const symbol = currency === "INR" ? "\u20B9" : currency === "USD" ? "$" : currency;
    return `${symbol} ${formattedValue}`;
  };
  const cards = [
    { key: "FINANCE1_INCOME_SUMMARY_CARD", title: "Projected Revenue", percentage: incomeGrowth, value: formatCurrency(income), period: fiscalYear, icon: FinanceBarsIcon, tone: "bg-[#eaf4ff] text-[#1d7ed0]" },
    { key: "FINANCE1_EXPENSE_SUMMARY_CARD", title: "Projected Expense", value: formatCurrency(expense), period: fiscalYear, icon: MdReceiptLong, tone: "bg-red-50 text-[#f04a4a]", valueTone: "text-[#f04a4a]" },
    { key: "FINANCE1_PROFIT_LOSS_SUMMARY_CARD", title: "Projected Profit/Loss", value: formatCurrency(profitLoss ?? income - expense), period: fiscalYear, icon: FinanceBarsIcon, tone: "bg-[#eafbf3] text-[#12a573]", valueTone: (profitLoss ?? income - expense) >= 0 ? "text-[#12a573]" : "text-[#f04a4a]" },
    { key: "FINANCE1_AVERAGE_UNIQUE_CLIENTS_SUMMARY_CARD", title: "Average Unique Clients", value: uniqueClientsSummary.value, period: uniqueClientsSummary.period, icon: MdGroups, tone: "bg-sky-50 text-[#13a9e8]" },
    { key: "FINANCE1_TOTAL_INVENTORY_SUMMARY_CARD", title: "Total Inventory", value: totalInventory, icon: BsFillDatabaseFill, tone: "bg-blue-50 text-[#1E3D73]" },
    { key: "FINANCE1_OCCUPIED_INVENTORY_SUMMARY_CARD", title: "Occupied Inventory", percentage: inventorySummary.percentage, value: occupiedInventory, icon: PiDesktopTowerFill, tone: "bg-sky-50 text-[#13a9e8]" },
    { key: "FINANCE1_PER_SQ_FT_SUMMARY_CARD", title: "Per Sq. Ft.", icon: MdCalculate, tone: "bg-blue-50 text-[#1d7ed0]", perSqft: true },
    { key: "FINANCE1_ASSET_VALUE_OWNED_SUMMARY_CARD", title: "Asset Value Owned", value: formatCurrency(assetValue), icon: MdMapsHomeWork, tone: "bg-sky-50 text-[#13a9e8]" },
  ].filter((card) => canView(card.key));
  if (!cards.length) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, title, value, period, icon: Icon, tone, valueTone = "text-[#1E3D73]", perSqft, percentage }) => (
        <div key={key} className={`relative flex min-h-[92px] items-center rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 text-left shadow-sm ${percentage !== undefined ? "gap-2" : "gap-4"}`}>
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone}`}>
            <Icon size={34} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex w-full items-center gap-2">
              <span className={`block leading-tight text-[#1E3D73] ${title === "Projected Revenue" || title === "Occupied Inventory" ? "mb-1 whitespace-nowrap text-[15px] font-pregular" : "mb-1 text-base font-pregular"}`}>
                {title}
              </span>
              {percentage !== undefined && (
                <span title={title === "Projected Revenue" ? "Projected revenue change compared with previous fiscal year" : "Occupied inventory / total inventory"} className={`ml-auto flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${percentage >= 0 ? "bg-[#e8f8ed] text-[#169b4d]" : "bg-[#fdeaea] text-[#d64545]"}`}>
                  {percentage >= 0 ? <MdTrendingUp size={12} aria-hidden="true" /> : <MdTrendingDown size={12} aria-hidden="true" />}
                  {title === "Projected Revenue" ? percentage.toFixed(1) : percentage}%
                </span>
              )}
            </span>
            {period && <span className="mb-2 block text-xs font-semibold text-[#58709A]">{period}</span>}
            {perSqft ? (
              <span className="mt-1 flex items-center gap-2 text-sm font-pmedium">
                <span className="text-[#12a573]">Revenue - {formatCurrency(Math.round(totalSqft ? income / totalSqft : 0))}</span>
                <span className="flex items-center gap-2">
                  <span className="h-4 w-px bg-[#d7dce8]" aria-hidden="true" />
                  <span className="text-[#f04a4a]">Expense - {formatCurrency(Math.round(totalSqft ? expense / totalSqft : 0))}</span>
                </span>
              </span>
            ) : (
              <span className={`mt-1 block text-lg font-pmedium ${valueTone}`}>{value}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};
export default FinanceDashboard1Summary;
