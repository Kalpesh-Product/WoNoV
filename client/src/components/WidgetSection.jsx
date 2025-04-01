import React from "react";
import PrimaryButton from "./PrimaryButton";

const WidgetSection = ({
  layout = 1,
  children,
  title,
  titleData,
  titleDataColor,
  padding,
  border,
  button,
  buttonTitle,
  handleClick,
  titleFont,
  fun,
}) => {
  // Tailwind grid classes for different layouts
  const gridClasses = {
    1: "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6",
  };

  return (
    <div className="py-0 motion-preset-slide-up-sm">
      {title && (
        <div className=" border-default  border-[#7D7D7E] p-4 flex justify-between items-center rounded-t-md">
          <span
            className={`${
              titleFont
                ? "text-subtitle text-primary"
                : "text-title text-primary font-pmedium"
            }`}>
            {title}{" "}
            <span>
              {titleData && (
                <span>
                  {" "}
                  :{" "}
                  <span
                    style={{ color: titleDataColor }}
                    className="font-pbold text-title">
                    {titleData}
                  </span>
                </span>
              )}
            </span>
          </span>
          {button && (
            <PrimaryButton title={buttonTitle} handleSubmit={handleClick} />
          )}
        </div>
      )}
      <div
        style={border ? { border: "2px solid #d1d5db", borderTop: "0" } : {}}
        className="h-full rounded-b-md">
        <div
          style={{ padding: padding ? "0" : "1rem" }}
          className={`w-full grid gap-4 ${gridClasses[layout]} h-full py-4`}>
          {React.Children.map(children, (child) => (
            <div>{child}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WidgetSection;
