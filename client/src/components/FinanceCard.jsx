import { useNavigate } from "react-router-dom";

const FinanceCard = ({
  cardTitle,
  timePeriod,
  descriptionData,
  highlightNegativePositive,
  disableColorChange,
  disableLinks = false,
  titleCenter,
  stateData,
  sectionColors,
  minHeight = "",
  hideHeader = false,
  hideHeaderDivider = false,
  hideDividerAfter = [],
  hideLastDivider = false,
  centerContent = false,
  loading = false,
}) => {
  const navigate = useNavigate();
  const hasSectionColors = Boolean(sectionColors);

  return (
    // <div className="flex flex-col gap-4 h-full p-4 shadow-md rounded-xl">
    //   {titleCenter ? (
    //     <div className="flex justify-between items-center">
    //       <span className="text-title font-pmedium text-center w-full uppercase">
    //         {cardTitle}
    //       </span>
    //     </div>
    //   ) : (
    //     <div className="flex justify-between items-center">
    //       <span className="text-title font-pmedium text-center">
    //         {cardTitle}
    //       </span>
    //       <span className="text-content">{timePeriod}</span>
    //     </div>
    //   )}
    //   <hr className="h-[1px] w-full" />

    //   <div className="flex flex-col gap-2">
     <div
      className={`flex flex-col h-full shadow-md rounded-xl ${minHeight} ${
        centerContent ? "justify-center" : ""
      } ${
        hasSectionColors ? "overflow-hidden" : "gap-4 p-4"
      }`}
    >
      {!hideHeader && (
        <>
          <div
            className={hasSectionColors ? "p-4" : ""}
            style={
              hasSectionColors
                ? {
                    backgroundColor: sectionColors.header,
                    color: sectionColors.headerText || "inherit",
                  }
                : undefined
            }
          >
            {titleCenter ? (
              <div className="flex justify-between items-center">
                <span className="text-title font-pmedium text-center w-full uppercase">
                  {cardTitle}
                </span>
              </div>
            ) : (
              <div
                className={`flex justify-between items-center ${
                  centerContent ? "translate-y-1" : ""
                }`}
              >
                <span className="text-title font-pmedium text-center">
                  {cardTitle}
                </span>
                <span className="text-content">{timePeriod}</span>
              </div>
            )}
          </div>
          {!hasSectionColors && !hideHeaderDivider && <hr className="h-[1px] w-full" />}
        </>
      )}

      <div
        className={
          hasSectionColors ? "flex flex-col grow" : "flex flex-col gap-2"
        }
      >
        {loading ? (
          <div className="flex flex-col gap-3 px-1 py-2" aria-label="Loading card data">
            {descriptionData.map((item, index) => (
              <div key={item.title || index}>
                <div className="flex items-center justify-between gap-4 py-1">
                  <span className="h-4 w-2/5 animate-pulse rounded bg-gray-200" />
                  <span className="h-6 w-12 animate-pulse rounded bg-gray-200" />
                </div>
                {index < descriptionData.length - 1 && <hr className="border-dotted border-b-default" />}
              </div>
            ))}
          </div>
        ) : descriptionData.map((item, index) => {
          const isLink = !disableLinks && item.route && item.route !== "#";
          const numericValue =
            typeof item.value === "number"
              ? item.value
              : parseInt(item?.value.replace(/[^0-9-]/g, ""));
          const isLastItem = index === descriptionData.length - 1;

          const dynamicColor =
            highlightNegativePositive && !isNaN(numericValue)
              ? numericValue < 0
                ? "text-red-500"
                : "text-green-500"
              : "";

          return (
            // <>
            //   <div key={index} className="flex justify-between items-center ">

             <div
              key={index}
              className={
                hasSectionColors
                  ? `${hideHeader ? "" : "grow"} flex flex-col px-4`
                  : ""
              }
              style={
                hasSectionColors
                  ? { backgroundColor: sectionColors.rows?.[index] }
                  : undefined
              }
            >
              <div
                className={`flex justify-between items-center ${
                  hasSectionColors && !hideHeader ? "grow" : ""
                }`}
              >
                <span
                  onClick={
                    isLink
                      ? () =>
                          navigate(item.route, { state: item.stateData || {} })
                      : undefined
                  }
                  className={`text-content   ${
                    isLink
                      ? "hover:underline cursor-pointer text-primary"
                      : "text-black"
                  } `}>
                  {item.title}
                </span>
                <span
                  className={`text-content p-2 rounded-md   ${
                    disableColorChange ? "" : dynamicColor
                    //disableColorChange ? null : dynamicColor
                  }`}>
                  {item.value}
                </span>
              </div>
                {!hasSectionColors &&
                  !hideDividerAfter.includes(item.title) &&
                  !(hideLastDivider && isLastItem) && (
                  <hr className="border-dotted border-b-default" />
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinanceCard;
