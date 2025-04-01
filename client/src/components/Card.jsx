import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const Card = ({
  title,
  icon,
  bgcolor,
  fontColor,
  fontFamily,
  titleColor,
  route,
}) => {
  const navigate = useNavigate();

  const cardVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.03,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onClick={() => navigate(route)}
      className="group relative w-full p-6 bg-white rounded-2xl shadow-md hover:border-[0.2px] hover:border-primary hover:shadow-xl cursor-pointer flex flex-col items-center text-center transition-all"
      style={{
        backgroundColor: bgcolor || "#ffffff",
        color: fontColor || "#111111",
        fontFamily: fontFamily || "'Poppins', sans-serif",
      }}
    >
      <motion.span
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaArrowRight size={14} />
      </motion.span>

   
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>


      <h3
        className="text-base font-bold whitespace-nowrap"
        style={{ color: titleColor || "inherit" }}
      >
        {title}
      </h3>
    </motion.div>
  );
};

export default Card;
