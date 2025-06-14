import AccessTree from "../../components/AccessTree";
import hierarchy from "../../assets/hierarchy-new.png"; // Import your image file
import PageFrame from "../../components/Pages/PageFrame";

const Access = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* <div>
          <AccessTree clickState={true} autoExpandFirst />
        </div> */}
      <PageFrame>
        <div className="h-[35rem]  overflow-hidden">
          <img src={hierarchy} alt="hierarchy" className="h-full w-full object-contain" />
        </div>
      </PageFrame>
    </div>
  );
};

export default Access;
