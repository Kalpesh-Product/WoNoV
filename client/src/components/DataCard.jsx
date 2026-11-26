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
  statusLabels,
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
        initial="rest"
        whileHover={hasRoute ? "hover" : undefined}
        whileTap={hasRoute ? { scale: 0.99 } : undefined}
        variants={{
          rest: { scale: 1 },
          hover: {
            scale: 1.03,
            transition: { duration: 0.2, ease: "easeOut" },
          },
        }}
        className={`group relative min-h-[132px] w-full rounded-[34px] border border-l-[5px] border-slate-100 bg-white px-6 py-5 text-left shadow-[0_3px_12px_rgba(15,23,42,0.08)] transition-shadow duration-200 hover:border-primary hover:shadow-xl ${
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
            <div className="truncate text-[15px] font-pmedium uppercase text-slate-900">
              {title}
            </div>
          </div>
          <div className="shrink-0 text-2xl font-bold leading-none text-slate-900">
            {loading ? (
              <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
            ) : (
              data
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {loading ? (
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            ) : statusSummary ? (
              <>
                <span
                  className="inline-flex h-[26px] items-center justify-center rounded-[5px] border border-transparent px-2.5 text-[11px] font-semibold uppercase leading-none text-[#176B3A]"
                  style={{
                    background:
                      "linear-gradient(to right, #3CB37180 0%, #3CB37145 100%)",
                  }}
                >
                  {statusLabels?.active ?? "Active"}: {statusSummary.active ?? 0}
                </span>
                <span
                  className="inline-flex h-[26px] items-center justify-center rounded-[5px] border border-transparent px-2.5 text-[11px] font-semibold uppercase leading-none text-[#8B0000]"
                  style={{
                    background:
                      "linear-gradient(to right, #FF000080 0%, #FF000045 100%)",
                  }}
                >
                  {statusLabels?.inactive ?? "Inactive"}: {statusSummary.inactive ?? 0}
                </span>
              </>
            ) : null}
          </div>

        </div>

        {hasRoute && (
          <motion.span
            variants={{
              rest: { x: 0 },
              hover: { x: 4 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute bottom-3 right-7 flex items-center justify-center"
          >
            <FaArrowRight
              size={12}
              className="text-slate-900"
              aria-hidden="true"
            />
          </motion.span>
        )}
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
                {(statusLabels?.active ?? "Active").toUpperCase()} : {statusSummary.active ?? 0}
              </div>
              <div className="rounded-lg border border-[#F5B7A7] bg-[#FDEBE6] px-3 py-1 text-[11px] font-semibold text-[#E05A33]">
                {(statusLabels?.inactive ?? "Inactive").toUpperCase()} : {statusSummary.inactive ?? 0}
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
