const SeperatorUnderline = ({title}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-[0.05rem] bg-borderGray w-full"></div>
      <div className="text-content text-borderGray">{title}</div>
      <div className="h-[0.05rem] bg-borderGray w-full"></div>
    </div>
  );
};

export default SeperatorUnderline;
