const DetalisFormatted = ({ title, detail,gap }) => {
  return (
    <div>
      <span className="text-content flex items-start">
        <span className={`${gap ? gap : "w-[50%]"}`}>{title}</span>
        <span>:</span>
        <span className="text-content flex flex-col gap-2 items-start font-pmedium w-full justify-start pl-4">
          {detail}
        </span>
      </span>
    </div>
  );
};

export default DetalisFormatted;
