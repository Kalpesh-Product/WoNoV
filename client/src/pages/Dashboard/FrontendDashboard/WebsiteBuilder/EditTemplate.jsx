import { useEffect, useState } from "react";
import grapesjs from "grapesjs";
import gjsPresetWebpage from "grapesjs-preset-webpage";
import gjsBasicBlocks from "grapesjs-blocks-basic";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useSidebar } from "../../../../context/SideBarContext";
import { toast } from "sonner";

const EditTemplate = () => {
  const { templateName, pageName } = useParams();
  const [editor, setEditor] = useState(null);
  const [selectedPage, setSelectedPage] = useState(pageName); // ✅ Track selected page
  const [input, setInput] = useState(false);
  const navigate = useNavigate();
  const { handleSubmit, control, reset } = useForm({
    pageName: "",
  });
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const axios = useAxiosPrivate();

  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, []);

  const fetchPages = async ({ queryKey }) => {
    const [, templateName] = queryKey; // Extract template name
    const response = await axios.get(`/api/editor/templates/${templateName}`);
    return response.data?.pages.map((page) => page.pageName) || [];
  };

  const {
    data: pages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pages", templateName],
    queryFn: fetchPages,
    enabled: !!templateName, // ✅ Fetch only when templateName is available
  });

  const { mutate: addPage } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `/api/editor/templates/${encodeURIComponent(templateName)}/addPage`,
        {
          pageName: data.pageName,
        }
      );
      return response.data;
    },
    onSuccess: function (data) {
      console.log(data);
    },
    onError: function (error) {
      console.log(error.message);
    },
  });

  useEffect(() => {
    if (!templateName || !pageName) return; // Ensure they are not null

    if (editor) {
      editor.destroy();
      setEditor(null);
    }

    // Initialize GrapesJS editor
    const editorInstance = grapesjs.init({
      container: "#editor-canvas",
      storageManager: false,
      blockManager: { appendTo: "#blocks" },
      deviceManager: {},
      plugins: [gjsPresetWebpage, gjsBasicBlocks],
      pluginsOpts: {
        gjsPresetWebpage: {},
        gjsBasicBlocks: {},
      },
    });

    setEditor(editorInstance);
    editorInstance.on("load", () => {
      console.log("Editor fully loaded!");

      // ✅ Fix: Use addComponents instead of setComponents
      loadEditorData(editorInstance);
    });
    addBlocks(editorInstance);
  }, [templateName, pageName]);

  // 🔹 Function to Load Editor Data from MongoDB
  const loadEditorData = async (editorInstance) => {
    try {
      const response = await axios.get(
        `/api/editor/load/${encodeURIComponent(
          templateName
        )}/${encodeURIComponent(pageName)}`
      );
      const { components, style, assets } = response.data;

      if (components && components.length > 0) {
        editorInstance.addComponents(components);
      }
      if (style) editorInstance.setStyle(style);
      if (assets) editorInstance.AssetManager.add(assets);

      console.log("Editor state loaded from MongoDB.");
    } catch (error) {
      console.error("Error loading editor data:", error);
    }
  };

  // 🔹 Function to Save Editor Data to MongoDB
  const saveEditorData = async () => {
    if (!editor) return;

    const data = {
      templateName: templateName, // Hardcoded for now, make this dynamic
      pageName: pageName, // Hardcoded for now, make this dynamic
      components: editor.getComponents(),
      style: editor.getStyle(),
      assets: editor.AssetManager.getAll().toArray(),
    };

    try {
      await axios.post("/api/editor/save", data);
      toast.success("Changes saved to cloud")
    } catch (error) {
      toast.error("Error saving editor data")
      console.error("Error saving editor data:", error);
    }
  };

  // 🔹 Function to Add Blocks
  const addBlocks = (editorInstance) => {
    editorInstance.BlockManager.add("button", {
      label: "Button",
      category: "Buttons",
      content: `<button style="background: #ff6600; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Click Me</button>`,
      draggable: true, // ✅ Ensures it can be dragged
    });

    editorInstance.BlockManager.add("div", {
      label: "Div",
      category: "Basic",
      content: `<div style="padding:10px; min-height:50px; border:1px dashed #ccc;">Drag elements here</div>`,
      draggable: true, // ✅ Ensures it can be dragged
    });
  };

  const handlePageChange = (e) => {
    const newPage = e.target.value;
    setSelectedPage(newPage);
    saveEditorData();
    navigate(`/templates/view-template/editor/${templateName}/${newPage}`); // ✅ Navigate to new page
  };

  return (
    <div
      style={{
        display: "flex",
        height: "97vh",
        background: "#ffff",
        overflowY: "auto",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#ffff",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            padding: "10px 0",
            background: "#ffff",
            margin: 0,
            color: "black",
            border: "1px solid black",
          }}
        >
          Blocks
        </h3>
        <div
          id="blocks"
          style={{ flex: 1, overflowY: "auto", padding: "10px" }}
        >
          
        </div>
      </div>

      {/* Main Editor Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            background: "#212529",
            padding: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ color: "#fff", margin: 0 }}>Editor</h3>
          {/* 🔹 Page Selection Dropdown */}
          {isLoading ? (
            <span style={{ color: "white" }}>Loading pages...</span>
          ) : error ? (
            <span style={{ color: "red" }}>Error loading pages</span>
          ) : (
            <select
              value={selectedPage}
              onChange={handlePageChange}
              style={{ padding: "5px", borderRadius: "5px", fontSize: "14px" }}
            >
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
          )}

          {isLoading ? (
            <span>Loading</span>
          ) : error ? (
            <span>Error loading pages</span>
          ) : (
            <button onClick={() => setInput(true)}> Add Page </button>
          )}
          {input ? (
            <div>
              <form onSubmit={handleSubmit(addPage)}>
                <Controller
                  name="pageName"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label style={{ color: "white" }} htmlFor="addPage">
                        Page Name:
                      </label>
                      <input {...field} id="addPage" type="text" />
                    </>
                  )}
                />

                <button type="submit">Add</button>
              </form>
            </div>
          ) : (
            ""
          )}
          <button
            onClick={saveEditorData}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Save
          </button>
        </div>
        <div id="editor-canvas" style={{ flex: 1, background: "#fff", height:'70vh' }}></div>
      </div>
    </div>
  );
};

export default EditTemplate;
