;

const DataCard = ({data, title, description}) => {
  return (
    <div>
      <div className="bg-white shadow-md p-4 rounded-md text-center">
        <div className="flex w-full justify-between items-center">
            <div className={`text-5xl font-pmedium text-black border-gray-300 border-r-default w-1/2 bg-white py-2`}>{data}</div>
            <hr/>
            <div className="text-end flex flex-col gap-2">
                <div className="font-pmedium text-xl">{title}</div>
                <hr/>
                <div className="w-full"><span className="text-content text-gray-400 w-full ">{description}</span></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataCard;