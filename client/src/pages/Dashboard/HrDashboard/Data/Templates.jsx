import  { useState, useRef } from "react";
import Template from "../../../../utils/Template.png";
import Template2 from "../../../../utils/Template1.png";
import Template1 from "../../../../utils/Template2.png";
import Template3 from "../../../../utils/Template3.png";
import Template4 from "../../../../utils/Template4.png";
import PrimaryButton from "../../../../components/PrimaryButton";
import MuiModal from "../../../../components/MuiModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, TextField } from "@mui/material";
import { LuImageUp } from "react-icons/lu";

const Templates = () => {
  const navigate = useNavigate();
  const [templateData, setTemplateData] = useState([
    { id: 1, imgSrc: Template, title: "Experience Letter", date: "Jan 10, 2025" },
    { id: 2, imgSrc: Template2, title: "Handover & No-Dues Form", date: "Opened Jan 7, 2025" },
    { id: 3, imgSrc: Template1, title: "Timings Agreement", date: "Opened Jan 7, 2025" },
    { id: 4, imgSrc: Template3, title: "SOP Agreement", date: "Opened Jan 6, 2025" },
    { id: 5, imgSrc: Template4, title: "Internship Report", date: "Dec 24, 2024" },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: "", file: null });
  const imageInputRef = useRef();

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newEntry = {
        id: templateData.length + 1,
        imgSrc: reader.result,
        title: newTemplate.title,
        date: new Date().toDateString(),
      };
      setTemplateData((prev) => [newEntry, ...prev]);
      toast.success("Template added successfully!");
      setOpenModal(false);
      setNewTemplate({ title: "", file: null });
    };
    reader.readAsDataURL(newTemplate.file);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <span className="text-primary text-title font-pmedium">Templates</span>
        <PrimaryButton title="Add Template" handleSubmit={() => setOpenModal(true)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateData.map((template) => (
          <div
            key={template.id}
            onClick={() => navigate(`${template.id}`)}
            className="bg-white shadow-md rounded-lg overflow-hidden border cursor-pointer"
          >
            <div className="h-48">
              <img
                src={template.imgSrc}
                alt="Template"
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

      <MuiModal open={openModal} onClose={() => setOpenModal(false)} title="Add New Template">
        <form onSubmit={handleAddTemplate}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Title Input */}
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              required
              value={newTemplate.title}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, title: e.target.value })
              }
            />

            {/* Hidden File Input */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              id="template-upload"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setNewTemplate({ ...newTemplate, file });
                }
              }}
            />

            {/* File Picker with Icon */}
            <TextField
              label="Upload Image"
              placeholder="Choose a file..."
              fullWidth
              value={newTemplate.file ? newTemplate.file.name : ""}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton
                    color="primary"
                    component="label"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <LuImageUp />
                  </IconButton>
                ),
              }}
            />

            {/* Submit Button */}
            <Box textAlign="right">
              <PrimaryButton type="submit" title="Add Template" className="w-full"/>
            </Box>
          </Box>
        </form>
      </MuiModal>


    </div>
  );
};

export default Templates;
