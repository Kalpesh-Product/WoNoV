const SeperatorUnderline = ({title, smallText=false}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-[0.05rem] bg-borderGray w-full"></div>
      <div className={`${smallText ? "text-content whitespace-nowrap" : "text-content" }  text-borderGray`}>{title}</div>
      <div className="h-[0.05rem] bg-borderGray w-full"></div>
    </div>
  );
};

export default SeperatorUnderline;
