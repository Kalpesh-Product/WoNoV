import React from "react";
import TabLayout from "../../../../../components/Tabs/TabLayout";

const CompanyTabs = ({ basePath, defaultTabPath, tabs }) => {
  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath={defaultTabPath}
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("company-handbook/")}
    />
  );
};

export default CompanyTabs;