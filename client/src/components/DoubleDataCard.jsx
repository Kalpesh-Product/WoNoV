import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "motion/react";

const DoubleDataCard = ({ title,secondTitle="",secondData, description, data, route, onClick }) => {
  const navigate = useNavigate();

  // const handleClick = () => {
  //   if (onClick) {
  //     onClick();
  //   }
  // };

  return (
    <div className="transition-colors duration-200 p-6 rounded-xl text-left w-full  shadow-md">
      <div className="flex flex-col gap-0">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
          <div className="text-subtitle font-semibold text-black ">{title}</div>
          <div>
            <div className="text-xl font-bold text-black">{data}</div>
          </div>
        </div>
        <div className="text-sm text-gray-800 capitalize">{description}</div>
      </div>
      <hr className="border-gray-300 my-2" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="text-subtitle font-semibold text-black ">{secondTitle}</div>
          <div>
            <div className="text-xl font-bold text-black">{secondData}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        {typeof route === "string" && route.trim() !== "" && route !== "#" && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            className="cursor-pointer p-2 rounded-full hover:bg-primary transition-colors duration-200 group"
            onClick={() => navigate(route)}
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

export default DoubleDataCard;
