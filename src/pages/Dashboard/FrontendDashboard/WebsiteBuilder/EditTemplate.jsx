import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

function EditTemplate({template}) {
  const location = useLocation();
  const { stateTemplate } = location.state || {};

  const [templateData, setTemplateData] = useState(template || stateTemplate || null);
  const [htmlContent, setHtmlContent] = useState("");
  const [editableElements, setEditableElements] = useState([]);
  const iframeRef = useRef(null); // Reference to the iframe

  ("Passed template is : ",template)

  useEffect(() => {
    if (templateData?.demoLink) {
      fetch(templateData.demoLink)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load template HTML");
          }
          return response.text();
        })
        .then((data) => setHtmlContent(data))
        .catch((error) => console.error("Error loading template:", error));
    }
  }, [template?.demoLink]);

  useEffect(() => {
    if (htmlContent) {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow.document;

        // Write the content directly to the iframe
        iframeDocument.open();
        iframeDocument.write(htmlContent);
        iframeDocument.close();

        // Dynamically append internal CSS from the template's folder
        if (templateData?.folder) {
          const internalStylesheets = [
            `${templateData.folder}/css/tailwind.css`,
            `${templateData.folder}/css/tooplate-antique-cafe.css`,
          ];
          internalStylesheets.forEach((href) => {
            const link = iframeDocument.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            iframeDocument.head.appendChild(link);
          });
        }

        // Append external CSS dynamically
        const externalStylesheets = [
          "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600&family=Oswald:wght@600&display=swap",
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
        ];
        externalStylesheets.forEach((href) => {
          const link = iframeDocument.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          iframeDocument.head.appendChild(link);
        });

        // Ensure editable elements are extracted after the content is loaded
        const elements = iframeDocument.querySelectorAll("[data-id]");
        const editableData = Array.from(elements).map((element) => ({
          id: element.getAttribute("data-id"),
          content: element.innerHTML,
        }));
        ("Extracted Editable Elements:", editableData);
        setEditableElements(editableData);
      }
    }
  }, [htmlContent, templateData?.folder]); // Re-run if folder or content changes

  (editableElements);

  // Handle input change for an editable element
  const handleElementUpdate = (id, newContent) => {
    setEditableElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content: newContent } : el))
    );

    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const targetElement = iframeDocument.querySelector(`[data-id="${id}"]`);
      if (targetElement) {
        targetElement.innerHTML = newContent;
      }
    }
  };

  // Export updated HTML
  const handleExport = () => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateData.name || "template"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen">
      {/* Main Template Area */}
      <main className="flex-1 bg-white p-4">
        {htmlContent ? (
          <iframe
            ref={iframeRef}
            title="Template Preview"
            className="w-full h-full border rounded-lg shadow-md"
          ></iframe>
        ) : (
          <p>Loading template...</p>
        )}
      </main>
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Template</h2>

        {editableElements.map((element) => (
          <div key={element.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {element.id}
            </label>
            <textarea
              value={element.content}
              onChange={(e) => handleElementUpdate(element.id, e.target.value)}
              className="w-full border rounded-lg p-2"
              rows="3"
            ></textarea>
          </div>
        ))}

        <button
          onClick={handleExport}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Export Template
        </button>
      </aside>
    </div>
  );
}

export default EditTemplate;
