import { CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";

const DirectorData = () => {
  const location = useLocation();
  const title = location.state.title;
  const files = location.state.files;
  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="text-title font-pmedium text-primary uppercase">{title}</span>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files ? (
          files.map((item) => (
            <div key={item.id}>
              <div className="h-80 flex flex-col rounded-xl border-default border-borderGray">
                <div className="h-[80%] flex items-center justify-center border-b-default border-black">
                  Preview here
                </div>
                <div className="h-[20%] flex items-center justify-start p-4">
                  <span>{item.label}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <CircularProgress />
        )}
      </div>
    </div>
  );
};

export default DirectorData;
