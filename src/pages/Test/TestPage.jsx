import React from "react";
import Tree from "./TreeNode";

const TestPage = () => {
  const mockData = [
    {
      id: 1,
      name: "Company",
      children: [
        { id: 2, name: "About", children: [] },
        {
          id: 3,
          name: "Department",
          children: [
            {
              id: 4,
              name: "HR",
              children: [{ id: 5, name: "SOPs", children: [] }],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="app p-4">
      <h1 className="text-2xl font-bold mb-4">Company Handbook</h1>
      <Tree data={mockData} />

      <div className="mt-20">
        <div className="grid grid-cols-2 w-[100%]">
          <div className="flex flex-col gap-16 border-default border-borderGray p-4">
              <div className="h-32 border-default border-borderGray">

              </div>
              <div className="h-64 border-default border-borderGray">

              </div>
              <div className="h-64 border-default border-borderGray">

              </div>
          </div>
          <div className="flex flex-col gap-16 border-default border-borderGray p-4">
              <div className="h-64 border-default border-borderGray">

              </div>
              <div className="h-64 border-default border-borderGray">

              </div>
              <div className="h-64 border-default border-borderGray">

              </div>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
