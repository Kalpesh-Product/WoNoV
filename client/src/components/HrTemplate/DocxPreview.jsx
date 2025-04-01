import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import JSZip from "jszip";

const DocxPreview = ({ fileUrl }) => {
  const previewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileUrl) return;

    async function fetchAndRenderDocx() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch DOCX file");

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) throw new Error("Empty DOCX file");

        // Load `.docx` using JSZip (as per documentation)
        const zip = await JSZip.loadAsync(arrayBuffer);
        if (!zip) throw new Error("Invalid ZIP structure in DOCX file");

        // Render DOCX with full options
        await renderAsync(arrayBuffer, previewRef.current, null, {
          className: "docx", // Class name for document styling
          inWrapper: true, // Ensures proper document layout
          hideWrapperOnPrint: false, // Keeps document wrapper during print
          ignoreWidth: false, // Ensures correct page width
          ignoreHeight: false, // Ensures correct page height
          ignoreFonts: false, // Keeps fonts from DOCX
          breakPages: true, // Enables proper page breaks
          ignoreLastRenderedPageBreak: false, // Ensures all page breaks are respected
          experimental: true, // Enables additional features
          trimXmlDeclaration: true, // Removes XML declarations
          useBase64URL: true, // Ensures images load properly
          renderHeaders: true, // Renders document headers
          renderFooters: true, // Renders document footers
          renderFootnotes: true, // Renders footnotes
          renderEndnotes: true, // Renders endnotes
          renderComments: false, // Skips comment rendering
          renderAltChunks: true, // Supports HTML parts inside the document
          debug: false, // Disable debug logs
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading DOCX:", error);
        setError(true);
        setLoading(false);
      }
    }

    fetchAndRenderDocx();
  }, [fileUrl]);

  if (loading) return <div className="text-gray-500 p-2">Loading document...</div>;
  if (error) return <div className="text-red-500 p-2">Error loading document</div>;

  return (
    <div
      ref={previewRef}
      className="w-full h-full overflow-auto bg-white text-gray-800 border p-4"
    ></div>
  );
};

export default DocxPreview;
