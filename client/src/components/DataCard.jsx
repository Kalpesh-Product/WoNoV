import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "motion/react";

const DataCard = ({ title, description, data, route, onClick, statusSummary }) => {
  const navigate = useNavigate();

  const handleCardAction = () => {
    if (typeof onClick === "function") {
      onClick();
      return;
    }

    navigate(route);
  };


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
          <div className="text-2xl font-bold text-black">{data}</div>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {statusSummary ? (
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
