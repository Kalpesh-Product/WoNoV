const mongoose = require("mongoose");
const pageSchema = new mongoose.Schema({
    pageName: { type: String, required: true },
    components: Object,
    style: Object,
    assets: Array,
  });
  
  // 🔹 Define Template Schema (Template has multiple pages)
  const templateSchema = new mongoose.Schema({
    templateName: { type: String, required: true },
    templateTag: { type: String, required: true },
    pages: [pageSchema], // Array of pages inside each template
  });

  const TemplateModel = mongoose.model("Template", templateSchema);
  module.exports = TemplateModel