import React from "react";
import PrimaryButton from "./PrimaryButton";
import { Chip } from "@mui/material";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaArrowTrendDown } from "react-icons/fa6";

const WidgetSection = ({
  layout = 1,
  children,
  title,
  titleData,
  height,
  titleDataColor,
  padding,
  border,
  button,
  buttonTitle,
  handleClick,
  titleFont,
  TitleAmount,
  TitleAmountGreen,
  TitleAmountRed,
  greenTitle,
  redTitle,
  titleLabel,
  fun,
  normalCase,
}) => {
  // Tailwind grid classes for different layouts
  const gridClasses = {
    1: "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 ",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6",
  };

  return (
    <div className={`py-0 motion-preset-slide-up-sm ${height ? height : ""}`}>
      {title && (
        <div
          className={`border-default border-[#7D7D7E] p-4 flex w-full justify-between items-center rounded-t-xl ${
            normalCase ? "" : "uppercase"
          }`}>
          <div className="flex flex-col md:flex-col lg:flex-row w-full gap-4 items-center justify-between">
            <div className="flex flex-col lg:flex-row justify-start lg:justify-start items-center gap-2">
              <span
                className={`${
                  titleFont
                    ? "text-mobileTitle lg:text-subtitle text-primary text-center w-full"
                    : "text-mobileTitle lg:text-widgetTitle text-primary font-pmedium text-center"
                }`}>
                {title}
              </span>

              {titleLabel ? (
                <span className="text-mobileTitle lg:text-widgetTitle text-primary font-pmedium">
                  {titleLabel}
                </span>
              ) : (
                ""
              )}
            </div>

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
            <div>
              <span
                className={`${
                  titleFont
                    ? "text-subtitle text-primary "
                    : "text-widgetTitle text-primary font-pmedium"
                }`}>
                {TitleAmount}{" "}
              </span>
              <div className="flex gap-2">
                {TitleAmountGreen !== undefined &&
                  TitleAmountGreen !== null && (
                    <span
                      className={`${
                        titleFont
                          ? "text-subtitle text-green-800"
                          : "text-body text-green-800 font-pmedium"
                      }`}>
                      <div className="flex gap-2 justify-center items-center uppercase bg-[#54c4a657] p-2 rounded-lg">
                        {/* <FaArrowTrendUp /> */}
                        {greenTitle && <div>{greenTitle} : </div>}
                        <div>{TitleAmountGreen}</div>
                      </div>
                    </span>
                  )}
                {TitleAmountRed !== undefined && TitleAmountGreen !== null && (
                  <span
                    className={`${
                      titleFont
                        ? "text-subtitle text-red-800"
                        : "text-body text-red-800 font-pmedium"
                    }`}>
                    <div className="flex gap-2 justify-center items-center uppercase bg-[#fc5e4640] p-2 rounded-lg">
                      {/* <FaArrowTrendDown /> */}
                      {redTitle && <div>{redTitle} : </div>}

                      <div>{TitleAmountRed}</div>
                    </div>
                  </span>
                )}
              </div>
            </div>
          </div>
          {button && (
            <PrimaryButton title={buttonTitle} handleSubmit={handleClick} />
          )}
        </div>
      )}
      <div
        style={border ? { border: "2px solid #d1d5db", borderTop: "0" } : {}}
        className="h-full rounded-b-xl">
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
