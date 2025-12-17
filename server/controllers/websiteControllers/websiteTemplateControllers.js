const sharp = require("sharp");
const WebsiteTemplate = require("../../models/website/WebsiteTemplate");
const {
  handleFileUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");
const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const axios = require("axios");

const createTemplate = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const company = "BizNest";
    // `products` might arrive as a JSON string in multipart. Normalize it.

    let { products, testimonials, about } = req.body;
    about = JSON.parse(about || "[]");
    products = JSON.parse(products || "[]");
    testimonials = JSON.parse(testimonials || "[]");

    for (const k of Object.keys(req.body)) {
      if (/^(products|testimonials)\.\d+\./.test(k)) delete req.body[k];
    }

    const formatCompanyName = (name) => {
      if (!name) return "";
      return name.toLowerCase().split("-")[0].replace(/\s+/g, "");
    };

    const searchKey = formatCompanyName(req.body.companyName);
    const baseFolder = `${company}/template/${searchKey}`;

    let template = await WebsiteTemplate.findOne({ searchKey }).session(
      session
    );
    if (template) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Template for this company already exists" });
    }

    template = new WebsiteTemplate({
      searchKey,
      companyName: req.body.companyName,
      title: req.body.title,
      subTitle: req.body.subTitle,
      CTAButtonText: req.body.CTAButtonText,
      about: about,
      productTitle: req.body?.productTitle,
      galleryTitle: req.body?.galleryTitle,
      testimonialTitle: req.body.testimonialTitle,
      contactTitle: req.body.contactTitle,
      mapUrl: req.body.mapUrl,
      email: req.body.websiteEmail,
      phone: req.body.phone,
      address: req.body.address,
      registeredCompanyName: req.body.registeredCompanyName,
      copyrightText: req.body.copyrightText,
      products: [],
      testimonials: [],
    });

    // Helper: upload an array of multer files to a folder
    const uploadImages = async (files = [], folder) => {
      const arr = [];
      for (const file of files) {
        const buffer = await sharp(file.buffer)
          .webp({ quality: 80 })
          .toBuffer();
        const base64Image = `data:image/webp;base64,${buffer.toString(
          "base64"
        )}`;
        const uploadResult = await handleFileUpload(base64Image, folder);
        arr.push({ id: uploadResult.public_id, url: uploadResult.secure_url });
      }
      return arr;
    };

    // Multer.any puts files in req.files (array). Build a quick index by fieldname.
    const filesByField = {};
    for (const f of req.files || []) {
      if (!filesByField[f.fieldname]) filesByField[f.fieldname] = [];
      filesByField[f.fieldname].push(f);
    }

    // companyLogo
    // companyLogo (ensure it's a single file)
    if (filesByField.companyLogo && filesByField.companyLogo[0]) {
      const logoFile = filesByField.companyLogo[0];
      const buffer = await sharp(logoFile.buffer)
        .webp({ quality: 80 })
        .toBuffer();
      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;
      const uploadResult = await handleFileUpload(
        base64Image,
        `${baseFolder}/companyLogo`
      );
      template.companyLogo = {
        id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    // heroImages
    if (filesByField.heroImages?.length) {
      template.heroImages = await uploadImages(
        filesByField.heroImages,
        `${baseFolder}/heroImages`
      );
    }

    // gallery
    if (filesByField.gallery?.length) {
      template.gallery = await uploadImages(
        filesByField.gallery,
        `${baseFolder}/gallery`
      );
    }

    if (Array.isArray(products) && products.length) {
      for (let i = 0; i < products.length; i++) {
        const p = products[i] || {};
        const pFiles = filesByField[`productImages_${i}`] || [];
        const uploaded = await uploadImages(
          pFiles,
          `${baseFolder}/productImages/${i}`
        );

        template.products.push({
          type: p.type,
          name: p.name,
          cost: p.cost,
          description: p.description,
          images: uploaded,
        });
      }
    }

    // TESTIMONIALS: objects + flat testimonialImages array (zip by index)
    let tUploads = [];
    if (filesByField.testimonialImages?.length) {
      // Preferred new path: single field 'testimonialImages' with N files in order
      tUploads = await uploadImages(
        filesByField.testimonialImages,
        `${baseFolder}/testimonialImages`
      );
    } else {
      // Back-compat: testimonialImages_${i}
      for (let i = 0; i < testimonials.length; i++) {
        const tFiles = filesByField[`testimonialImages_${i}`] || [];
        const uploaded = await uploadImages(
          tFiles,
          `${baseFolder}/testimonialImages/${i}`
        );
        tUploads[i] = uploaded[0]; // one file per testimonial
      }
    }

    template.testimonials = (testimonials || []).map((t, i) => ({
      image: tUploads[i], // may be undefined if fewer images provided
      name: t.name,
      jobPosition: t.jobPosition,
      testimony: t.testimony,
      rating: t.rating,
    }));

    const savedTemplate = await template.save({ session });

    await session.commitTransaction();
    session.endSession();

    try {
      const updatedCompany = await axios.patch(
        "https://wononomadsbe.vercel.app/api/company/update-company",
        {
          companyName: req.body.companyName,
          link: `https://${savedTemplate.searchKey}.wono.co/`,
        }
      );

      if (!updatedCompany) {
        return res
          .status(400)
          .json({ message: "Failed to add website template link" });
      }
      // }
    } catch (error) {
      if (error.response?.status !== 200) {
        return res.status(201).json({
          message:
            "Website created but failed to add link.Check if the company is listed in Nomads.",
          template,
        });
      }
    }

    return res.status(201).json({ message: "Template created", template });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

//temporary controller
const createWebsiteTemplate = async (req, res) => {
  try {
    const { companyName } = req.body;

    const foundTemplate = await WebsiteTemplate.findOne({ companyName });

    if (foundTemplate) {
      res.status(400).json({ message: "Company already exists" });
    }

    const template = new WebsiteTemplate(req.body);

    const savedTemplate = template.save();

    if (!savedTemplate) {
      return res.status(400).json();
    }
    return res
      .status(201)
      .json({ message: "Website template created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTemplate = async (req, res) => {
  try {
    const { company } = req.params;

    const template = await WebsiteTemplate.findOne({
      searchKey: company,
      isActive: true,
    });

    if (!template) {
      return res.status(200).json([]);
    } else {
      if (template.searchKey === company && template.isActive) {
        return res.json(template);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInActiveTemplate = async (req, res) => {
  try {
    const { company } = req.params;

    const template = await WebsiteTemplate.findOne({
      searchKey: company,
      isActive: false,
    });

    if (!template) {
      return res.status(200).json([]);
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await WebsiteTemplate.find({ isActive: true });

    if (!templates.length) {
      return res.status(200).json([]);
    }

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInActiveTemplates = async (req, res) => {
  try {
    const templates = await WebsiteTemplate.find({ isActive: false });

    if (!templates.length) {
      return res.status(200).json([]);
    }

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const activateTemplate = async (req, res) => {
  try {
    const { searchKey } = req.query;
    const template = await WebsiteTemplate.findOneAndUpdate(
      {
        searchKey,
      },
      {
        isActive: true,
      }
    );

    if (!template) {
      return res.status(400).json({ message: "Failed to activate website" });
    }

    return res.status(400).json({ message: "Website activated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editTemplate = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // --- parse body meta (JSON strings in multipart) ---
    let {
      products,
      testimonials,
      heroImageIds,
      galleryImageIds,
      companyLogoId,
      about,
    } = req.body;
    const company = "BizNest";

    // --- helpers ---
    const parseJson = (raw, fallback) => {
      try {
        if (raw === undefined) return fallback;
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    };

    const deleteCloudinaryBatch = async (ids = []) => {
      await Promise.all(
        (ids || [])
          .filter(Boolean)
          .map((id) => handleFileDelete(id).catch(() => null))
      );
    };

    const uploadImages = async (files = [], folder) => {
      const out = [];
      for (const file of files) {
        const buffer = await sharp(file.buffer)
          .webp({ quality: 80 })
          .toBuffer();
        const base64 = `data:image/webp;base64,${buffer.toString("base64")}`;
        const up = await handleFileUpload(base64, folder);
        out.push({ id: up.public_id, url: up.secure_url });
      }
      return out;
    };

    about = parseJson(about, []);
    companyLogoId = parseJson(companyLogoId, undefined);
    products = parseJson(products, []); // [{ _id?, type, name, cost, description, imageIds? }]
    testimonials = parseJson(testimonials, []); // [{ _id?, name, jobPosition, testimony, rating, imageId? }]
    const heroKeepIds = new Set(parseJson(heroImageIds, undefined)); // undefined => don't perform delete
    const galleryKeepIds = new Set(parseJson(galleryImageIds, undefined));

    // --- search key / template ---
    const formatCompanyName = (name) =>
      (name || "").toLowerCase().split("-")[0].replace(/\s+/g, "");

    const searchKey = formatCompanyName(req.body.companyName);
    const baseFolder = `${company}/template/${searchKey}`;

    const template = await WebsiteTemplate.findOne({ searchKey }).session(
      session
    );
    if (!template) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Template not found" });
    }

    // --- map files by fieldname for convenience ---
    const filesByField = {};
    for (const f of req.files || []) {
      (filesByField[f.fieldname] ||= []).push(f);
    }

    // --- text fields merge ---
    Object.assign(template, {
      companyName: req.body.companyName ?? template.companyName,
      title: req.body.title ?? template.title,
      subTitle: req.body.subTitle ?? template.subTitle,
      CTAButtonText: req.body.CTAButtonText ?? template.CTAButtonText,
      about: Array.isArray(about) ? about : template.about,
      productTitle: req.body.productTitle ?? template.productTitle,
      galleryTitle: req.body.galleryTitle ?? template.galleryTitle,
      testimonialTitle: req.body.testimonialTitle ?? template.testimonialTitle,
      contactTitle: req.body.contactTitle ?? template.contactTitle,
      mapUrl: req.body.mapUrl ?? template.mapUrl,
      email: req.body.websiteEmail ?? template.websiteEmail,
      phone: req.body.phone ?? template.phone,
      address: req.body.address ?? template.address,
      registeredCompanyName:
        req.body.registeredCompanyName ?? template.registeredCompanyName,
      copyrightText: req.body.copyrightText ?? template.copyrightText,
    });

    if (companyLogoId !== undefined) {
      const currentId = template.companyLogo?.id || null;
      // If client wants it gone (null) or changed (id mismatch), remove the old one
      if (currentId && currentId !== companyLogoId) {
        await handleFileDelete(currentId).catch(() => null);
        template.companyLogo = null;
      }
    }

    // --- companyLogo (replace) ---
    if (filesByField.companyLogo?.[0]) {
      // delete old logo if any
      if (template.companyLogo?.id) {
        await handleFileDelete(template.companyLogo.id).catch(() => null);
      }
      const uploaded = await uploadImages(
        [filesByField.companyLogo[0]],
        `${baseFolder}/companyLogo`
      );
      template.companyLogo = uploaded[0];
    }

    // === HERO IMAGES ===
    // If client provided heroImageIds (the "keep list"), we will delete anything not in that list.
    if (heroKeepIds !== undefined) {
      const current = template.heroImages || [];
      const toDelete = current
        .filter((img) => !heroKeepIds.has(img.id))
        .map((img) => img.id);
      if (toDelete.length) {
        await deleteCloudinaryBatch(toDelete);
        template.heroImages = current.filter((img) => heroKeepIds.has(img.id));
      }
    }
    // Append any new hero files
    if (filesByField.heroImages?.length) {
      const uploaded = await uploadImages(
        filesByField.heroImages,
        `${baseFolder}/heroImages`
      );
      template.heroImages = [...(template.heroImages || []), ...uploaded];
    }

    // === GALLERY ===
    if (galleryKeepIds !== undefined) {
      const current = template.gallery || [];
      const toDelete = current
        .filter((img) => !galleryKeepIds.has(img.id))
        .map((img) => img.id);
      if (toDelete.length) {
        await deleteCloudinaryBatch(toDelete);
        template.gallery = current.filter((img) => galleryKeepIds.has(img.id));
      }
    }
    if (filesByField.gallery?.length) {
      const uploaded = await uploadImages(
        filesByField.gallery,
        `${baseFolder}/gallery`
      );
      template.gallery = [...(template.gallery || []), ...uploaded];
    }

    // === PRODUCTS ===
    // Build index of existing products by _id for O(1) merge
    const existingProductIdx = new Map(
      (template.products || []).map((p, i) => [String(p._id), i])
    );

    for (let i = 0; i < (products || []).length; i++) {
      const p = products[i];

      // files for this payload index
      const pFiles = filesByField[`productImages_${i}`] || [];
      const uploaded = pFiles.length
        ? await uploadImages(
            pFiles,
            `${baseFolder}/productImages/${p?._id || "new"}`
          )
        : [];

      if (p?._id && existingProductIdx.has(String(p._id))) {
        // merge existing
        const idx = existingProductIdx.get(String(p._id));
        const target = template.products[idx];

        // delete phase if imageIds keep-list provided
        if (Array.isArray(p.imageIds)) {
          const keepSet = new Set(p.imageIds);
          const toDelete = (target.images || [])
            .filter((img) => !keepSet.has(img.id))
            .map((img) => img.id);
          if (toDelete.length) {
            await deleteCloudinaryBatch(toDelete);
            target.images = (target.images || []).filter((img) =>
              keepSet.has(img.id)
            );
          }
        }

        // merge fields
        target.type = p.type ?? target.type;
        target.name = p.name ?? target.name;
        target.cost = p.cost ?? target.cost;
        target.description = p.description ?? target.description;
        // append uploads
        target.images = [...(target.images || []), ...uploaded];
      } else {
        // new product
        template.products.push({
          type: p.type,
          name: p.name,
          cost: p.cost,
          description: p.description,
          images: uploaded,
        });
      }
    }

    // === TESTIMONIALS ===
    const existingTestimonialIdx = new Map(
      (template.testimonials || []).map((t, i) => [String(t._id), i])
    );

    for (let i = 0; i < (testimonials || []).length; i++) {
      const t = testimonials[i];

      // per-index file
      const tFiles = filesByField[`testimonialImages_${i}`] || [];
      const uploaded = tFiles.length
        ? await uploadImages(
            tFiles,
            `${baseFolder}/testimonialImages/${t?._id || "new"}`
          )
        : [];

      if (t?._id && existingTestimonialIdx.has(String(t._id))) {
        const idx = existingTestimonialIdx.get(String(t._id));
        const target = template.testimonials[idx];

        // delete/keep single image by imageId presence
        if ("imageId" in t) {
          const keepId = t.imageId || null; // could be null to remove
          const currentId = target?.image?.id || null;
          if (currentId && currentId !== keepId) {
            await handleFileDelete(currentId).catch(() => null);
            target.image = null;
          }
        }

        // merge fields
        target.name = t.name ?? target.name;
        target.jobPosition = t.jobPosition ?? target.jobPosition;
        target.testimony = t.testimony ?? target.testimony;
        target.rating = t.rating ?? target.rating;

        // prefer newly uploaded file if provided
        if (uploaded[0]) {
          target.image = uploaded[0];
        }
      } else {
        // new testimonial
        template.testimonials.push({
          name: t.name,
          jobPosition: t.jobPosition,
          testimony: t.testimony,
          rating: t.rating,
          image:
            uploaded[0] ||
            (t.imageId
              ? { id: t.imageId, url: t.imageUrl || undefined }
              : undefined),
        });
      }
    }

    await template.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Template updated", template });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

module.exports = {
  createTemplate,
  createWebsiteTemplate,
  editTemplate,
  getTemplate,
  getTemplates,
  getInActiveTemplates,
  getInActiveTemplate,
  activateTemplate,
};
