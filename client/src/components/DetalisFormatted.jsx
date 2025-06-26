const DetalisFormatted = ({ title, detail, gap, upperCase = false }) => {
  return (
    <div>
      <span className={`text-content flex items-start w-full`}>
        <span className={`${gap ? gap : "w-[50%]"}`}>{title}</span>
        <span>:</span>
        
        <span
          className={`${
            upperCase ? "uppercase" : ""
          } text-content flex flex-col gap-2 items-start w-full justify-start pl-4`}>
          {detail || "—"}
        </span>
      </span>
    </div>
  );
};

export default DetalisFormatted;
