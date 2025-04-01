import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const ThemePreview = ({ themes }) => {
  const { id } = useParams(); // Get theme ID from URL
  const navigate = useNavigate();

  // Find the theme by ID
  const theme = themes.find((t) => t.id === parseInt(id, 10));

  if (!theme) {
    return <div>Theme not found!</div>;
  }

  return (
    <div className="py-4 w-full">
      <h2 className="text-2xl font-bold mb-6">{theme.name}</h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <img
          src={theme.image}
          alt={theme.name}
          className="w-full lg:w-1/2 rounded-lg shadow-md"
        />
        <div className="flex-1">
          <p className="text-gray-700 mb-6">{theme.description}</p>
          <ul className="list-disc pl-5 mb-6">
            {theme.features.map((feature, index) => (
              <li key={index} className="text-gray-600">
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => window.open(theme.demoLink, "_blank")}
            className="wono-blue-dark text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            View Demo
          </button>
        </div>
      </div>
      <button
        onClick={() => navigate(-1)} // Navigate back to the theme list
        className="mt-8 text-blue-500 underline"
      >
        Go Back
      </button>
    </div>
  );
};

export default ThemePreview;
