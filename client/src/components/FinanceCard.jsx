import { useNavigate } from "react-router-dom";

const FinanceCard = ({
  cardTitle,
  timePeriod,
  descriptionData,
  highlightNegativePositive,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4 h-full p-4 shadow-md rounded-xl">
      <div className="flex justify-between items-center">
        <span className="text-title font-pmedium">{cardTitle}</span>
        <span className="text-content">{timePeriod}</span>
      </div>
      <hr className="h-[1px] w-full" />

      <div className="flex flex-col gap-4">
        {descriptionData.map((item, index) => {
          const numericValue = parseInt(item.value.replace(/[^0-9-]/g, ""));
          const dynamicColor =
            highlightNegativePositive && !isNaN(numericValue)
              ? numericValue < 0
                ? "text-red-500"
                : "text-green-500"
              : "";
          return (
            <>
              <div key={index} className="flex justify-between items-center ">
                <span onClick={()=>navigate(item.route ? item.route : "")} className="text-content text-primary cursor-pointer hover:underline">
                  {item.title}
                </span>
                <span
                  className={`text-content p-2 rounded-md cursor-pointer hover:underline ${dynamicColor}`}
                >
                  {item.value}
                </span>
              </div>
              <hr className="border-dotted border-b-default" />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default FinanceCard;
