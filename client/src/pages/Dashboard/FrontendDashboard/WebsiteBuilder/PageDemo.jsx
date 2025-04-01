import React from "react";
import BiznestHome from "../../../../assets/builder-preview/live-theme/biznest-home.jpeg";

const PageDemo = () => {
  return (
    <div>
      <div className="h-[90vh] overflow-y-auto">
        <img className="w-full" src={BiznestHome} alt="BiznestHome" />
      </div>
    </div>
  );
};

export default PageDemo;
