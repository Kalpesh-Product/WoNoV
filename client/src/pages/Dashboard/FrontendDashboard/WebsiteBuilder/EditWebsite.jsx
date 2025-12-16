import React, { useState, useEffect, useRef } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { TextField, CircularProgress } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UploadMultipleFilesInput from "../../../../components/UploadMultipleFilesInput";
import UploadFileInput from "../../../../components/UploadFileInput";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FiTrash2 } from "react-icons/fi";

dayjs.extend(customParseFormat);

const defaultProduct = {
  _id: null,
  type: "",
  name: "",
  cost: "",
  description: "",
  images: [],
  files: [], // File[] to append
};

const defaultTestimonial = {
  _id: null,
  name: "",
  jobPosition: "",
  testimony: "",
  rating: 5,
  image: null,
  file: null, // File to add/replace
};

const fileUrl = (file) => (file ? URL.createObjectURL(file) : "");

const EditWebsite = () => {
  const axios = useAxiosPrivate();
  const { state } = useLocation();
  const formRef = useRef(null);
  const tenant = "spring";
  const tpl = state.website;

  const isLoading = state.isLoading;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: "",
      title: "",
      subTitle: "",
      CTAButtonText: "",
      about: [],
      productTitle: "",
      galleryTitle: "",
      testimonialTitle: "",
      contactTitle: "",
      mapUrl: "",
      email: "",
      phone: "",
      address: "",
      registeredCompanyName: "",
      copyrightText: "",

      companyLogoExisting: null,
      heroImagesExisting: [],
      galleryExisting: [],
      products: [defaultProduct],
      testimonials: [defaultTestimonial],

      // NEW: deletion queues
      deletedHeroImageIds: [],
      deletedGalleryImageIds: [],
      deletedProductImages: [], // [{ productId, imageId }]
      deletedTestimonialImageIds: [], // [imageId]
    },
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({ control, name: "products" });

  const {
    fields: testimonialFields,
    append: appendTestimonial,
    remove: removeTestimonial,
  } = useFieldArray({ control, name: "testimonials" });

  const {
    fields: aboutFields,
    append: appendAbout,
    remove: removeAbout,
  } = useFieldArray({ control, name: "about" });

  // queue delete of an existing image (works for arrays or single-object fields)
  const queueDelete = (pathExisting, pathDeletedIds, img) => {
    const current = watch(pathExisting);
    const deleted = new Set([...(watch(pathDeletedIds) || [])]);

    if (Array.isArray(current)) {
      // array field (heroImagesExisting, galleryExisting, products[i].images)
      const nextExisting = current.filter((x) => x?.id !== img?.id);
      setValue(pathExisting, nextExisting, { shouldDirty: true });
    } else if (current && typeof current === "object") {
      // single object field (testimonials[i].image)
      setValue(pathExisting, null, { shouldDirty: true });
    }

    if (img?.id) {
      deleted.add(img.id);
      setValue(pathDeletedIds, Array.from(deleted), { shouldDirty: true });
    }
  };

  // remove one newly selected file from a multi-file field (hero, gallery, product.files)
  const removeNewFileAt = (pathFiles, idx) => {
    const next = [...(watch(pathFiles) || [])];
    next.splice(idx, 1);
    setValue(pathFiles, next, { shouldDirty: true });
  };

  // 3) Load template -> form
  useEffect(() => {
    if (isLoading || !tpl) return;

    reset({
      companyName: tpl?.companyName ?? "",
      title: tpl?.title ?? "",
      subTitle: tpl?.subTitle ?? "",
      CTAButtonText: tpl?.CTAButtonText ?? "",
      // about: tpl?.about ?? "",
      about:
        Array.isArray(tpl?.about) && tpl.about.length
          ? tpl.about.map((para) => ({ text: para }))
          : [{ text: "" }],
      productTitle: tpl?.productTitle ?? "",
      galleryTitle: tpl?.galleryTitle ?? "",
      testimonialTitle: tpl?.testimonialTitle ?? "",
      contactTitle: tpl?.contactTitle ?? "",
      mapUrl: tpl?.mapUrl ?? "",
      email: tpl?.email ?? "",
      phone: tpl?.phone ?? "",
      address: tpl?.address ?? "",
      registeredCompanyName: tpl?.registeredCompanyName ?? "",
      copyrightText: tpl?.copyrightText ?? "",

      companyLogoExisting: tpl?.companyLogo ?? null,
      heroImagesExisting: Array.isArray(tpl?.heroImages) ? tpl.heroImages : [],
      galleryExisting: Array.isArray(tpl?.gallery) ? tpl.gallery : [],

      companyLogo: null,
      heroImages: [],
      gallery: [],

      products:
        Array.isArray(tpl?.products) && tpl.products.length
          ? tpl.products.map((p) => ({
              _id: p?._id ?? null,
              type: p?.type ?? "",
              name: p?.name ?? "",
              cost: p?.cost ?? "",
              description: p?.description ?? "",
              images: Array.isArray(p?.images) ? p.images : [],
              files: [],
            }))
          : [defaultProduct],

      testimonials:
        Array.isArray(tpl?.testimonials) && tpl.testimonials.length
          ? tpl.testimonials.map((t) => ({
              _id: t?._id ?? null,
              name: t?.name ?? "",
              jobPosition: t?.jobPosition ?? "",
              testimony: t?.testimony ?? "",
              rating: t?.rating ?? 5,
              image: t?.image ?? null,
              file: null,
            }))
          : [defaultTestimonial],
    });
  }, [isLoading, tpl, reset]);

  const values = watch();

  // 4) Submit -> FormData for /api/editor/edit-template
  const { mutate: updateTemplate, isPending: isUpdating } = useMutation({
    mutationKey: ["website-update", tenant],
    mutationFn: async (fd) => {
      const res = await axios.patch(`/api/editor/edit-website`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Website updated successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Update failed");
    },
  });

  const onSubmit = (vals, e) => {
    const fd = new FormData();

    // text fields used by server (companyName builds searchKey)
    fd.append("companyName", vals.companyName || "");
    fd.append("title", vals.title || "");
    fd.append("subTitle", vals.subTitle || "");
    fd.append("CTAButtonText", vals.CTAButtonText || "");
  
    fd.append("productTitle", vals.productTitle || "");
    fd.append("galleryTitle", vals.galleryTitle || "");
    fd.append("testimonialTitle", vals.testimonialTitle || "");
    fd.append("contactTitle", vals.contactTitle || "");
    fd.append("mapUrl", vals.mapUrl || "");
    fd.append("email", vals.email || "");
    fd.append("phone", vals.phone || "");
    fd.append("address", vals.address || "");
    fd.append("registeredCompanyName", vals.registeredCompanyName || "");
    fd.append("copyrightText", vals.copyrightText || "");

    // NEW: keep-lists for hero & gallery (computed from remaining existing arrays)
      fd.append("about", JSON.stringify(vals.about.map((a) => a.text)));
    const heroKeepIds = (vals.heroImagesExisting || []).map((x) => x.id);
    const galleryKeepIds = (vals.galleryExisting || []).map((x) => x.id);
    fd.append("heroImageIds", JSON.stringify(heroKeepIds));
    fd.append("galleryImageIds", JSON.stringify(galleryKeepIds));

    // JSON payloads (keep _id for merge-by-id)
    // NEW: include imageIds for each product from its remaining existing images
    const productsMeta = (vals.products || []).map((p) => ({
      _id: p._id || undefined,
      type: p.type,
      name: p.name,
      cost: p.cost,
      description: p.description,
      imageIds: (p.images || []).map((img) => img.id), // NEW
    }));

    // NEW: include imageId for each testimonial (null if no image should be kept)
    const testimonialsMeta = (vals.testimonials || []).map((t) => ({
      _id: t._id || undefined,
      name: t.name,
      jobPosition: t.jobPosition,
      testimony: t.testimony,
      rating: Number(t.rating) || 0,
      imageId: t.image?.id ?? null, // NEW
    }));

    fd.append(
      "companyLogoId",
      JSON.stringify(vals.companyLogoExisting?.id ?? null)
    );
    fd.append("products", JSON.stringify(productsMeta));
    fd.append("testimonials", JSON.stringify(testimonialsMeta));

    // files: logo (replace), hero/gallery (append)
    if (vals.companyLogo) fd.append("companyLogo", vals.companyLogo);
    (vals.heroImages || []).forEach((f) => fd.append("heroImages", f));
    (vals.gallery || []).forEach((f) => fd.append("gallery", f));

    // --- Map product images by FINAL index ---
    const existingProducts = tpl?.products || [];
    const idxById = new Map(existingProducts.map((p, i) => [String(p._id), i]));
    const baseLen = existingProducts.length;
    let newCounter = 0;

    (vals.products || []).forEach((p) => {
      const files = p.files || [];
      if (!files.length) return;

      let targetIndex;
      if (p._id && idxById.has(String(p._id))) {
        targetIndex = idxById.get(String(p._id));
      } else {
        targetIndex = baseLen + newCounter;
        newCounter++;
      }

      files.forEach((file) => {
        fd.append(`productImages_${targetIndex}`, file);
      });
    });

    // --- Map testimonial image by FINAL index ---
    const existingTestimonials = tpl?.testimonials || [];
    const tIdxById = new Map(
      existingTestimonials.map((t, i) => [String(t._id), i])
    );
    const tBaseLen = existingTestimonials.length;
    let tNewCounter = 0;

    (vals.testimonials || []).forEach((t) => {
      const file = t.file;
      if (!file) return;

      let targetIndex;
      if (t._id && tIdxById.has(String(t._id))) {
        targetIndex = tIdxById.get(String(t._id));
      } else {
        targetIndex = tBaseLen + tNewCounter;
        tNewCounter++;
      }

      fd.append(`testimonialImages_${targetIndex}`, file);
    });

    updateTemplate(fd);
  };

  const handleReset = () => {
    // const node = formRef.current;
    // node && node.reset();
    // if (tpl) {
    //   // re-run the reset with tpl to restore server state
    //   const evt = new Event("reset", { bubbles: true });
    //   node.dispatchEvent(evt);
    // }
    reset();
  };

  // 5) Render
  return (
    <div className="pb-2">
      <div className="p-4 flex flex-col gap-4">
        <div className="themePage-content-header bg-white flex flex-col gap-4">
          <h4 className="text-4xl text-left">Edit Website</h4>
          <hr />
        </div>

        <form
          ref={formRef}
          encType="multipart/form-data"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
            {/* HERO / COMPANY */}
            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Hero Section</span>
              </div>

              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <Controller
                  name="companyName"
                  control={control}
                  rules={{ required: "Company name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Company Name"
                      fullWidth
                      helperText={errors?.companyName?.message}
                      error={!!errors.companyName}
                    />
                  )}
                />
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Hero Title"
                      fullWidth
                      helperText={errors?.title?.message}
                      error={!!errors.title}
                    />
                  )}
                />
                <Controller
                  name="subTitle"
                  control={control}
                  rules={{ required: "Sub Title is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Hero Sub Title"
                      fullWidth
                      helperText={errors?.subTitle?.message}
                      error={!!errors.subTitle}
                    />
                  )}
                />
                <Controller
                  name="CTAButtonText"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="CTA Button Text"
                      fullWidth
                    />
                  )}
                />

                <div className="text-xs text-gray-500">
                  Current logo: {values?.companyLogoExisting ? "Yes" : "No"}
                </div>
                {values.companyLogoExisting && (
                  <ExistingImagesGrid
                    items={values.companyLogoExisting} // single object works now
                    onDelete={() =>
                      setValue("companyLogoExisting", null, {
                        shouldDirty: true,
                      })
                    }
                  />
                )}

                {/* companyLogo (single) */}
                <Controller
                  name="companyLogo"
                  control={control}
                  render={({ field }) => (
                    <UploadFileInput
                      id="companyLogo"
                      value={field.value}
                      label="Replace Company Logo"
                      onChange={field.onChange}
                    />
                  )}
                />

                <div className="text-xs text-gray-500 mt-2">
                  Existing hero images: {values.heroImagesExisting?.length || 0}
                </div>
                <ExistingImagesGrid
                  items={values.heroImagesExisting}
                  onDelete={(img) =>
                    queueDelete(
                      "heroImagesExisting",
                      "deletedHeroImageIds",
                      img
                    )
                  }
                />

                <Controller
                  name="heroImages"
                  control={control}
                  render={({ field }) => (
                    <UploadMultipleFilesInput
                      {...field}
                      name="heroImages"
                      label="Add Hero Images (max 10)"
                      maxFiles={10}
                      allowedExtensions={["jpg", "jpeg", "png", "webp", "pdf"]}
                      id="heroImages"
                    />
                  )}
                />
              
              </div>
            </div>

            {/* ABOUT */}
            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">About</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">

                {aboutFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-borderGray p-4 mb-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pmedium">Para #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeAbout(index)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <Controller
                      name={`about.${index}.text`}
                      control={control}
                      rules={{ required: "About paragraph is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="About Paragraph"
                          fullWidth
                          multiline
                          minRows={3}
                          helperText={errors?.about?.[index]?.text?.message}
                          error={!!errors?.about?.[index]?.text}
                        />
                      )}
                    />
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    onClick={() => appendAbout({ text: "" })}
                    className="text-sm text-primary"
                  >
                    + Add Para
                  </button>
                </div>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="col-span-2">
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Products</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <Controller
                  name="productTitle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Products Section Title"
                      fullWidth
                    />
                  )}
                />

                {productFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-borderGray p-4 mb-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pmedium">Product #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name={`products.${index}.type`}
                        control={control}
                        rules={{ required: "Type is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Type"
                            fullWidth
                            helperText={
                              errors?.products?.[index]?.type?.message
                            }
                            error={!!errors?.products?.[index]?.type}
                          />
                        )}
                      />
                      <Controller
                        name={`products.${index}.name`}
                        control={control}
                        rules={{ required: "Name is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Name"
                            fullWidth
                            helperText={
                              errors?.products?.[index]?.name?.message
                            }
                            error={!!errors?.products?.[index]?.name}
                          />
                        )}
                      />
                      <Controller
                        name={`products.${index}.cost`}
                        control={control}
                        rules={{ required: "Cost is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Cost"
                            fullWidth
                            helperText={
                              errors?.products?.[index]?.cost?.message
                            }
                            error={!!errors?.products?.[index]?.cost}
                          />
                        )}
                      />
                      <Controller
                        name={`products.${index}.description`}
                        control={control}
                        rules={{ required: "Description is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Description"
                            fullWidth
                            multiline
                            minRows={3}
                            helperText={
                              errors?.products?.[index]?.description?.message
                            }
                            error={!!errors?.products?.[index]?.description}
                          />
                        )}
                      />

                      {/* Existing images count */}
                      <div className="text-xs text-gray-500 md:col-span-2">
                        Existing images:{" "}
                        {values?.products?.[index]?.images?.length || 0}
                      </div>
                      <ExistingImagesGrid
                        items={values.products[index].images}
                        onDelete={(img) =>
                          queueDelete(
                            `products.${index}.images`,
                            "deletedProductImages",
                            img
                          )
                        }
                      />
                      {/* productImages_${finalIndex} */}
                      <Controller
                        name={`products.${index}.files`}
                        control={control}
                        render={({ field }) => (
                          <UploadMultipleFilesInput
                            {...field}
                            label="Add Product Images"
                            maxFiles={15}
                            allowedExtensions={[
                              "jpg",
                              "jpeg",
                              "png",
                              "webp",
                              "pdf",
                            ]}
                            id={`products.${index}.files`}
                          />
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={() => appendProduct({ ...defaultProduct })}
                    className="text-sm text-primary"
                  >
                    + Add Product
                  </button>
                </div>
              </div>
            </div>

            {/* GALLERY */}
            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Gallery</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <div className="text-xs text-gray-500">
                  Existing gallery images: {values.galleryExisting?.length || 0}
                </div>
                <ExistingImagesGrid
                  items={values.galleryExisting}
                  onDelete={(img) =>
                    queueDelete(
                      "galleryExisting",
                      "deletedGalleryImageIds",
                      img
                    )
                  }
                />
                <Controller
                  name="galleryTitle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Gallery Section Title"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="gallery"
                  control={control}
                  render={({ field }) => (
                    <UploadMultipleFilesInput
                      {...field}
                      name="gallery"
                      label="Add Gallery Images"
                      maxFiles={10}
                      allowedExtensions={["jpg", "jpeg", "png", "pdf", "webp"]}
                      id="gallery"
                    />
                  )}
                />
              </div>
            </div>

            {/* TESTIMONIALS */}
            <div className="col-span-2">
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Testimonials</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <Controller
                  name="testimonialTitle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Testimonials Section Title"
                      fullWidth
                    />
                  )}
                />

                {testimonialFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-borderGray p-4 mb-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pmedium">
                        Testimonial #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTestimonial(index)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name={`testimonials.${index}.name`}
                        control={control}
                        rules={{ required: "Name is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Name"
                            fullWidth
                            helperText={
                              errors?.testimonials?.[index]?.name?.message
                            }
                            error={!!errors?.testimonials?.[index]?.name}
                          />
                        )}
                      />
                      <Controller
                        name={`testimonials.${index}.jobPosition`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Job Position"
                            fullWidth
                            helperText={
                              errors?.testimonials?.[index]?.jobPosition
                                ?.message
                            }
                            error={!!errors?.testimonials?.[index]?.jobPosition}
                          />
                        )}
                      />
                      <Controller
                        name={`testimonials.${index}.rating`}
                        control={control}
                        rules={{ required: "Rating is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            size="small"
                            label="Rating (1-5)"
                            fullWidth
                            inputProps={{ min: 1, max: 5 }}
                            helperText={
                              errors?.testimonials?.[index]?.rating?.message
                            }
                            error={!!errors?.testimonials?.[index]?.rating}
                          />
                        )}
                      />
                      <Controller
                        name={`testimonials.${index}.testimony`}
                        control={control}
                        rules={{ required: "Testimony is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Testimony"
                            fullWidth
                            multiline
                            minRows={3}
                            helperText={
                              errors?.testimonials?.[index]?.testimony?.message
                            }
                            error={!!errors?.testimonials?.[index]?.testimony}
                          />
                        )}
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      Current image:{" "}
                      {values?.testimonials?.[index]?.image ? "Yes" : "No"}
                    </div>
                    {values.testimonials[index].image && (
                      <ExistingImagesGrid
                        items={[values.testimonials[index].image]}
                        onDelete={(img) =>
                          queueDelete(
                            `testimonials.${index}.image`,
                            "deletedTestimonialImageIds",
                            img
                          )
                        }
                      />
                    )}

                    <Controller
                      name={`testimonials.${index}.file`}
                      control={control}
                      render={({ field }) => (
                        <UploadFileInput
                          value={field.value}
                          label="Add/Replace Testimonial Image"
                          onChange={field.onChange}
                          id={`testimonial-file-${index}`}
                        />
                      )}
                    />
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={() => appendTestimonial({ ...defaultTestimonial })}
                    className="text-sm text-primary"
                  >
                    + Add Testimonial
                  </button>
                </div>
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Contact</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <Controller
                  name="contactTitle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Contact Section Title"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="mapUrl"
                  control={control}
                  rules={{
                    required: "Map URL is required",
                    validate: (val) => {
                      const rgx =
                        /^https?:\/\/(www\.)?(google\.com|maps\.google\.com)\/maps\/embed/i;
                      const v = (val || "").trim();
                      return (
                        rgx.test(v) || "Enter a valid Google Maps embed URL"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => {
                        const extract = (s = "") =>
                          s.match(/src=["']([^"']+)["']/i)?.[1] || s;
                        field.onChange(extract(e.target.value).trim());
                      }}
                      size="small"
                      label="Embed Map URL"
                      fullWidth
                      helperText={errors?.mapUrl?.message}
                      error={!!errors.mapUrl}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Email is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Email"
                      fullWidth
                      helperText={errors?.email?.message}
                      error={!!errors.email}
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Phone"
                      fullWidth
                      helperText={errors?.phone?.message}
                      error={!!errors.phone}
                    />
                  )}
                />
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: "Address is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Address"
                      fullWidth
                      multiline
                      minRows={2}
                      helperText={errors?.address?.message}
                      error={!!errors.address}
                    />
                  )}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Footer</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <Controller
                  name="registeredCompanyName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Registered Company Name"
                      fullWidth
                      helperText={errors?.registeredCompanyName?.message}
                      error={!!errors.registeredCompanyName}
                    />
                  )}
                />
                <Controller
                  name="copyrightText"
                  control={control}
                  rules={{ required: "Copyright text is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Copyright Text"
                      fullWidth
                      helperText={errors?.copyrightText?.message}
                      error={!!errors.copyrightText}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Submit / Reset */}
          <div className="flex items-center justify-center gap-4">
            <PrimaryButton
              type="submit"
              title={isUpdating ? "Updating..." : "Submit"}
              isLoading={isUpdating}
            />
            <SecondaryButton
              type="button"
              handleSubmit={handleReset}
              title="Reset"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

const ExistingImagesGrid = ({ items = [], onDelete }) => {
  const list = Array.isArray(items) ? items : items ? [items] : [];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
      {list.map((img) => (
        <div
          key={img.id}
          className="relative rounded-lg overflow-hidden border"
        >
          <img src={img.url} alt="" className="w-full h-36 object-cover" />
          <div className="px-2 py-1 text-xs truncate">
            {img.id?.split("/").pop()}
          </div>
          <button
            type="button"
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
            onClick={() => onDelete(img)}
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditWebsite;
