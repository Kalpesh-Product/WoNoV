const EmploymentAgreement = require("../../models/EmploymentAgreements");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const { PDFDocument } = require("pdf-lib");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

// require("./pdfDetails");
// const PdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });

// const createEmploymentAgreement = async (req, res) => {
//   (req.file);
//   try {
//     // Get the sent in data off request body
//     // const leaveIdFromRequestBody = req.body.leaveId;
//     const employeeFromRequestBody = req.body.employee;
//     // const fileUrlFromRequestBody = req.file.originalname;
//     // const noOfDaysFromRequestBody = req.body.noOfDays;

//     const buffer = req.file.buffer;

//     // Create a leave with it (take the values from the request body / frontend and insert in the database)
//     const ourCreatedEmploymentAgreement = await EmploymentAgreement.create({
//       //   leaveId: leaveIdFromRequestBody,
//       employee: employeeFromRequestBody,
//       // fileUrlFromRequestBody: fileUrlFromRequestBody,
//       //   noOfDays: noOfDaysFromRequestBody,

//       // resolvedStatus: req.body.resolvedStatus ?? false,
//     });

//     // respond with the new leave (this will be our response in postman / developer tools)
//     res.json({ employmentAgreement: ourCreatedEmploymentAgreement });
//   } catch (error) {
//     (error);
//   }
// };

// const createEmploymentAgreement = async (req, res) => {
//   (req.file);
//   try {
//     // Get the sent-in data from the request body
//     const employeeFromRequestBody = req.body.employee;

//     // Extract the buffer from the uploaded file
//     const buffer = req.file.buffer;

//     // Convert the buffer to a base64 string for Cloudinary upload
//     const base64Pdf = `data:application/pdf;base64,${buffer.toString(
//       "base64"
//     )}`;

//     // Upload the PDF to Cloudinary
//     const uploadResult = await handleDocumentUpload(
//       base64Pdf,
//       "employment-agreements"
//     );

//     // Extract the public_id and secure_url from the upload result
//     const pdfId = uploadResult.public_id;
//     const pdfUrl = uploadResult.secure_url;

//     // Save the employment agreement details in the database
//     const ourCreatedEmploymentAgreement = await EmploymentAgreement.create({
//       employee: employeeFromRequestBody,
//       pdfId: pdfId, // Save the Cloudinary public_id
//       pdfUrl: pdfUrl, // Save the Cloudinary secure_url
//     });

//     // Respond with the created employment agreement
//     res.json({ employmentAgreement: ourCreatedEmploymentAgreement });

//     (pdfId);
//     (pdfUrl);
//     (ourCreatedEmploymentAgreement);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to create employment agreement." });
//   }
// };

const createEmploymentAgreement = async (req, res) => {
  (req.file);
  try {
    // Get the sent-in data from the request body
    const employeeFromRequestBody = req.body.employee;

    // Extract the buffer from the uploaded file
    const buffer = req.file.buffer;

    // Process the PDF buffer (e.g., compress or manipulate using pdf-lib)
    const pdfDoc = await PDFDocument.load(buffer);

    // Example: Remove unused data or add metadata to compress
    pdfDoc.setTitle("Employment Agreement");
    pdfDoc.setAuthor(employeeFromRequestBody);
    const processedPdfBuffer = await pdfDoc.save();

    // Upload the processed PDF buffer to Cloudinary
    const uploadResult = await handleDocumentUpload(
      processedPdfBuffer,
      "employment-agreements"
    );

    // Ensure the upload result has the expected properties
    if (!uploadResult || !uploadResult.public_id || !uploadResult.secure_url) {
      throw new Error("Failed to upload the PDF to Cloudinary");
    }

    // Extract the public_id and secure_url from the upload result
    const pdfId = uploadResult.public_id;
    const pdfUrl = uploadResult.secure_url;

    // Save the employment agreement details in the database
    const ourCreatedEmploymentAgreement = await EmploymentAgreement.create({
      employee: employeeFromRequestBody,
      pdfId: pdfId, // Save the Cloudinary public_id
      pdfUrl: pdfUrl, // Save the Cloudinary secure_url
      fileUrl: pdfUrl, // Save the Cloudinary secure_url
    });

    // Respond with the created employment agreement
    res.json({ employmentAgreement: ourCreatedEmploymentAgreement });

    (pdfId);
    (pdfUrl);
    (ourCreatedEmploymentAgreement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create employment agreement." });
  }
};

// GET - Fetch all leave types
const fetchAllEmploymentAgreements = async (req, res) => {
  try {
    // Find the leaves
    const listOfAllEmploymentAgreements = await EmploymentAgreement.find();
    // Respond with them
    res.json({ employmentAgreements: listOfAllEmploymentAgreements });
  } catch (error) {
    (error);
    res.sendStatus(400);
  }
};

// DELETE - delete leave type

// const deleteEmploymentAgreement = async (req, res) => {
//   try {
//     // get id off the url
//     const employmentAgreementIdFromTheUrl = req.params.id;

//     // Delete the record
//     await EmploymentAgreement.deleteOne({
//       _id: employmentAgreementIdFromTheUrl,
//     });

//     // Respond with a message (eg: leave deleted)
//     res.json({ success: "Leave Deleted" });
//   } catch (error) {
//     (error);
//     res.sendStatus(400);
//   }
// };

// PUT - soft delete leave type

const softDeleteEmploymentAgreement = async (req, res) => {
  try {
    // Get the id off the url
    const employmentAgreementIdFromTheUrl = req.params.id;

    // Get the data off the req body
    // const assignedMemberFromRequestBody = req.body.assignedMember;
    // const descriptionFromRequestBody = req.body.description;

    // Find and update the record
    await EmploymentAgreement.findOneAndUpdate(
      { _id: employmentAgreementIdFromTheUrl },
      {
        // assignedMember: assignedMemberFromRequestBody,
        // description: descriptionFromRequestBody,
        // "accepted.acceptedStatus": true,
        deletedStatus: true,
      },
      { new: true } // Returns the updated document
    );

    //   Find updated leave (using it's id)
    const updatedEmploymentAgreement = await EmploymentAgreement.findById(
      employmentAgreementIdFromTheUrl
    );

    // Respond with the updated leave (after finding it)
    res.json({ employmentAgreement: updatedEmploymentAgreement });
  } catch (error) {
    (error);
    res.sendStatus(400);
  }
};
module.exports = {
  createEmploymentAgreement,
  fetchAllEmploymentAgreements,
  // deleteEmploymentAgreement,
  softDeleteEmploymentAgreement,
};
