const CoworkingClient = require("../../models/sales/CoworkingClient");
const Company = require("../../models/hr/Company");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");

const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const getClientAgreements = async (req, res, next) => {
    try {
        const clients = await CoworkingClient.find({ isActive: true })
            .select("clientName documents isActive")
            .sort({ clientName: 1 })
            .lean()
            .exec();

        return res.status(200).json(clients);
    } catch (error) {
        next(error);
    }
};

const createClientAgreementClient = async (req, res, next) => {
    try {
        const companyId = req.company;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Client name is required" });
        }

        const trimmedName = name.trim();

        const existingClient = await CoworkingClient.findOne({
            clientName: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        })
            .lean()
            .exec();

        if (existingClient) {
            return res.status(409).json({ message: "Client already exists" });
        }

        const client = await CoworkingClient.create({
            company: companyId,
            clientName: trimmedName,
            documents: [],
            isActive: true,
        });

        return res.status(201).json({
            message: "Client created successfully",
            client,
        });
    } catch (error) {
        next(error);
    }
};

const addClientAgreement = async (req, res, next) => {
    try {
        const companyId = req.company;
        const { clientId, documentName } = req.body;
        const file = req.file;

        if (!clientId || !documentName?.trim() || !file) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
                message: "Only PDF, DOC, DOCX, JPG, JPEG, PNG and WEBP files are allowed",
            });
        }

        const [company, client] = await Promise.all([
            Company.findById(companyId).lean().exec(),
            CoworkingClient.findById(clientId).lean().exec(),
        ]);

        if (!company || !client) {
            return res.status(404).json({ message: "Client not found" });
        }

        const uploadPath = `${company.companyName}/clients/agreements/${client.clientName}`;
        const uploadResult = await handleDocumentUpload(
            file.buffer,
            uploadPath,
            file.originalname,
        );

        const nextDocument = {
            name: documentName.trim(),
            url: uploadResult.secure_url,
            documentId: uploadResult.public_id,
            fileType: file.mimetype,
        };

        await CoworkingClient.findByIdAndUpdate(
            clientId,
            {
                $push: {
                    documents: nextDocument,
                },
            },
            {
                new: true,
                runValidators: false,
            },
        ).exec();

        return res.status(200).json({
            message: "Agreement uploaded successfully",
            document: nextDocument,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClientAgreements,
    createClientAgreementClient,
    addClientAgreement,
};