import React, { useState } from 'react';

const TreeNode = ({ node }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-4">
      {/* Node Header */}
      <div
        className="flex items-center cursor-pointer text-lg font-semibold hover:text-blue-500"
        onClick={() => setExpanded(!expanded)}
      >
        {node.children && node.children.length > 0 && (
          <span className="mr-2">{expanded ? '-' : '+'}</span>
        )}
        {node.name}
      </div>

      {/* Children */}
      {expanded && node.children && (
        <div className="mt-2">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const Tree = ({ data }) => {
  return (
    <div className="tree">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
};

export default Tree;
