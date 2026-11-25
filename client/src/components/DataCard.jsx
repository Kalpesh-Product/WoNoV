import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "motion/react";

const DataCard = ({
  title,
  description,
  data,
  route,
  onClick,
  statusSummary,
  loading = false,
  variant = "default",
  accentColor = "#1E3D73",
  icon,
}) => {
  const navigate = useNavigate();

  const handleCardAction = () => {
    if (typeof onClick === "function") {
      onClick();
      return;
    }

    navigate(route);
  };

  if (variant === "client-summary") {
    const hasRoute =
      typeof route === "string" && route.trim() !== "" && route !== "#";

    return (
      <motion.button
        type="button"
        onClick={hasRoute ? handleCardAction : undefined}
        whileTap={hasRoute ? { scale: 0.99 } : undefined}
        className={`min-h-[132px] w-full rounded-[34px] border border-l-[5px] border-slate-100 bg-white px-6 py-5 text-left shadow-[0_3px_12px_rgba(15,23,42,0.08)] ${
          hasRoute ? "cursor-pointer" : "cursor-default"
        }`}
        style={{ borderLeftColor: accentColor }}
        aria-label={hasRoute ? `View ${title}` : undefined}
      >
        <div className="flex min-w-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex shrink-0 items-center justify-center text-primary"
              aria-hidden="true"
            >
              {icon}
            </span>
            <div className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-900">
              {title}
            </div>
          </div>
          <div className="shrink-0 text-xl font-bold leading-none text-slate-900">
            {loading ? (
              <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
            ) : (
              data
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {loading ? (
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          ) : statusSummary ? (
            <>
              <span className="inline-flex h-[24px] items-center justify-center rounded-[5px] border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-semibold uppercase leading-none text-emerald-700">
                Active: {statusSummary.active ?? 0}
              </span>
              <span className="inline-flex h-[24px] items-center justify-center rounded-[5px] border border-orange-200 bg-orange-50 px-2.5 text-[10px] font-semibold uppercase leading-none text-orange-700">
                Inactive: {statusSummary.inactive ?? 0}
              </span>
            </>
          ) : null}
        </div>
      </motion.button>
    );
  }


  // const handleClick = () => {
  //   if (onClick) {
  //     onClick();
  //   }
  // };

  return (
    <div className="transition-colors duration-200 p-6 rounded-xl text-left w-full  shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="text-title font-semibold text-black ">{title}</div>
        <div>
        <div className="text-2xl font-bold text-black">
          {loading ? <div className="h-7 w-14 animate-pulse rounded bg-gray-200" /> : data}
        </div>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {loading ? (
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          ) : statusSummary ? (
            <>
              <div className="rounded-lg border border-[#B7E4C7] bg-[#E8F7EA] px-3 py-1 text-[11px] font-semibold text-[#17803D]">
                ACTIVE : {statusSummary.active ?? 0}
              </div>
              <div className="rounded-lg border border-[#F5B7A7] bg-[#FDEBE6] px-3 py-1 text-[11px] font-semibold text-[#E05A33]">
                INACTIVE : {statusSummary.inactive ?? 0}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-800 capitalize">{description}</div>
          )}
        </div>

        {typeof route === "string" &&
          route.trim() !== "" &&
          route !== "#" && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
              className="cursor-pointer p-2 rounded-full hover:bg-primary transition-colors duration-200 group"
              onClick={handleCardAction}
            >
              <FaArrowRight
                size={12}
                className="text-black group-hover:text-white transition-colors"
              />
            </motion.div>
          )}
      </div>

    </div>
  );
};

export default DataCard;
