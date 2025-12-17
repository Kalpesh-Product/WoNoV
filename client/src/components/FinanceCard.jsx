import { useNavigate } from "react-router-dom";

const FinanceCard = ({
  cardTitle,
  timePeriod,
  descriptionData,
  highlightNegativePositive,
  disableColorChange,
  titleCenter,
  stateData,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 h-full p-4 shadow-md rounded-xl">
      {titleCenter ? (
        <div className="flex justify-between items-center">
          <span className="text-title font-pmedium text-center w-full uppercase">
            {cardTitle}
          </span>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span className="text-title font-pmedium text-center">
            {cardTitle}
          </span>
          <span className="text-content">{timePeriod}</span>
        </div>
      )}
      <hr className="h-[1px] w-full" />

      <div className="flex flex-col gap-2">
        {descriptionData.map((item, index) => {
          const numericValue =
            typeof item.value === "number"
              ? item.value
              : parseInt(item?.value.replace(/[^0-9-]/g, ""));

          const dynamicColor =
            highlightNegativePositive && !isNaN(numericValue)
              ? numericValue < 0
                ? "text-red-500"
                : "text-green-500"
              : "";

          return (
            <>
              <div key={index} className="flex justify-between items-center ">
                <span
                  onClick={() =>
                    navigate(item.route || "", { state: item.stateData || {} })
                  }
                  className={`text-content   ${
                    item.route !== "#"
                      ? "hover:underline cursor-pointer text-primary"
                      : "text-black"
                  } `}>
                  {item.title}
                </span>
                <span
                  className={`text-content p-2 rounded-md   ${
                    disableColorChange ? null : dynamicColor
                  }`}>
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
