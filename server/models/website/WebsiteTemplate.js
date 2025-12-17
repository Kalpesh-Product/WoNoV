const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    searchKey: { type: String, required: true, index: true },
    isActive: {
      type: Boolean,
      default: false,
    },
    //hero
    companyLogo: {
      id: { type: String },
      url: { type: String },
    },

    companyName: { type: String, required: true },
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
    CTAButtonText: { type: String },
    heroImages: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    //about
    about: [{ type: String, required: true }],
    //products
    productTitle: { type: String },
    products: [
      {
        type: { type: String, required: true },
        name: { type: String, required: true },
        cost: { type: String },
        description: { type: String, required: true },
        images: [
          {
            id: { type: String },
            url: { type: String },
          },
        ],
      },
    ],
    galleryTitle: { type: String },
    gallery: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    //   //testimonials
    testimonialTitle: { type: String },
    testimonials: [
      {
        image: {
          id: { type: String },
          url: { type: String },
        },
        name: { type: String },
        jobPosition: { type: String },
        testimony: { type: String },
        rating: { type: Number },
      },
    ],
    //contact
    contactTitle: { type: String },
    mapUrl: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    //footer
    registeredCompanyName: { type: String },
    copyrightText: { type: String, required: true },
  },
  { timestamps: true }
);

const WebsiteTemplate = mongoose.model("WebsiteTemplate", templateSchema);
module.exports = WebsiteTemplate;
