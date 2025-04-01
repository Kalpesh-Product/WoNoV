;
import Template from "../../../../utils/Template.png";
import Template2 from "../../../../utils/Template1.png";
import Template1 from "../../../../utils/Template2.png";
import Template3 from "../../../../utils/Template3.png";
import Template4 from "../../../../utils/Template4.png";
import PrimaryButton from "../../../../components/PrimaryButton";

const Templates = () => {
  const templateData = [
    {
      imgSrc: Template,
      title: "Leave Agreement",
      date: "Jan 10, 2025",
    },
    {
      imgSrc: Template2,
      title: "Allowance Agreement",
      date: "Opened Jan 7, 2025",
    },
    {
      imgSrc: Template1,
      title: "Timings Agreement",
      date: "Opened Jan 7, 2025",
    },
    {
      imgSrc: Template3,
      title: "SOP Agreement",
      date: "Opened Jan 6, 2025",
    },
    {
      imgSrc: Template4,
      title: "Internship Report",
      date: "Dec 24, 2024",
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <span className=" text-primary text-title font-pmedium">Templates</span>
        <PrimaryButton title={"Add Template"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateData.map((template, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg overflow-hidden border"
          >
            <div className="h-48">
              <img
                src={template.imgSrc}
                alt="Template Image"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4">
              <h2 className="widgetTitle font-semibold font-pregular">
                {template.title}
              </h2>
              <p className="text-content text-gray-500 font-pregular">
                {template.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
