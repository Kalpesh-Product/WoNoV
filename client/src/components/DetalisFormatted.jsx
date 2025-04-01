const DetalisFormatted = ({ title, detail }) => {
  return (
    <div>
      <span className="text-content flex items-start">
        <span className="w-[20%]">{title}</span>
        <span>:</span>
        <span className="text-content items-start font-pmedium w-full justify-start pl-4">
          {detail}
        </span>
      </span>
    </div>
  );
};

export default DetalisFormatted;
