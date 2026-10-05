const CoworkingClient = require("../../models/sales/CoworkingClient");
const Company = require("../../models/hr/Company");
const User = require("../../models/hr/UserData");
const {
    handleDocumentUpload,
    handleDocumentDelete,
} = require("../../config/s3Config");

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const isTechDepartmentUser = async (userId) => {
    const user = await User.findById(userId)
        .populate("departments", "name")
        .select("departments")
        .lean();

    return (user?.departments || []).some(
        (department) =>
            String(department?._id || department) === TECH_DEPARTMENT_ID ||
            ["tech", "tech department"].includes(
                department?.name?.trim().toLowerCase(),
            ),
    );
};

const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getClientAgreements = async (req, res, next) => {
    try {
        const includeDeleted =
            req.query.includeDeleted === "true" &&
            (await isTechDepartmentUser(req.user));
        const query = {
            isActive: true,
            "clientAgreementStatus.permanentlyDeleted": { $ne: true },
            ...(includeDeleted
                ? {}
                : { "clientAgreementStatus.isDeleted": { $ne: true } }),
        };
        const clients = await CoworkingClient.find(query)
            .select("clientName documents isActive clientAgreementStatus")
            .populate(
                "clientAgreementStatus.deletedBy",
                "firstName lastName employeeName name email",
            )
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
            clientName: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" },
        }).exec();

        if (existingClient) {
            if (existingClient.clientAgreementStatus?.permanentlyDeleted) {
                existingClient.clientAgreementStatus.permanentlyDeleted = false;
                existingClient.clientAgreementStatus.isDeleted = false;
                existingClient.clientAgreementStatus.deletedAt = undefined;
                existingClient.clientAgreementStatus.deletedBy = undefined;
                await existingClient.save({ validateBeforeSave: false });

                return res.status(201).json({
                    message: "Client agreement entry created successfully",
                    client: existingClient,
                });
            }
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

        if (
            !company ||
            !client ||
            client.clientAgreementStatus?.isDeleted ||
            client.clientAgreementStatus?.permanentlyDeleted
        ) {
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

const updateClientAgreement = async (req, res, next) => {
    try {
        const companyId = req.company;
        const { clientId, currentDocumentName, documentName } = req.body;
        const file = req.file;

        if (!clientId || !currentDocumentName?.trim() || !documentName?.trim()) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (file && !allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
                message: "Only PDF, DOC, DOCX, JPG, JPEG, PNG and WEBP files are allowed",
            });
        }

        const [company, client] = await Promise.all([
            Company.findById(companyId).lean().exec(),
            CoworkingClient.findById(clientId).exec(),
        ]);

        if (
            !company ||
            !client ||
            client.clientAgreementStatus?.isDeleted ||
            client.clientAgreementStatus?.permanentlyDeleted
        ) {
            return res.status(404).json({ message: "Client not found" });
        }

        const existingDocument = client.documents.find(
            (doc) => doc.name?.trim() === currentDocumentName.trim()
        );

        if (!existingDocument) {
            return res.status(404).json({ message: "Document not found" });
        }

        let nextUrl = existingDocument.url;
        let nextDocumentId = existingDocument.documentId;
        let nextFileType = existingDocument.fileType;

        if (file) {
            if (existingDocument.documentId) {
                await handleDocumentDelete(existingDocument.documentId);
            }

            const uploadPath = `${company.companyName}/clients/agreements/${client.clientName}`;
            const uploadResult = await handleDocumentUpload(
                file.buffer,
                uploadPath,
                file.originalname,
            );

            nextUrl = uploadResult.secure_url;
            nextDocumentId = uploadResult.public_id;
            nextFileType = file.mimetype;
        }

        existingDocument.name = documentName.trim();
        existingDocument.url = nextUrl;
        existingDocument.documentId = nextDocumentId;
        existingDocument.fileType = nextFileType;
        existingDocument.updatedAt = new Date();

        await client.save();

        return res.status(200).json({
            message: "Agreement updated successfully",
            document: existingDocument,
        });
    } catch (error) {
        next(error);
    }
};

const updateClientAgreementClientName = async (req, res, next) => {
    try {
        const { clientId, name } = req.body;

        if (!clientId || !name?.trim()) {
            return res.status(400).json({ message: "Client id and name are required" });
        }

        const trimmedName = name.trim();
        const client = await CoworkingClient.findById(clientId).exec();

        if (
            !client ||
            !client.isActive ||
            client.clientAgreementStatus?.isDeleted ||
            client.clientAgreementStatus?.permanentlyDeleted
        ) {
            return res.status(404).json({ message: "Client not found" });
        }

        const existingClient = await CoworkingClient.findOne({
            _id: { $ne: clientId },
            isActive: true,
            clientName: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" },
        }).lean().exec();

        if (existingClient) {
            return res.status(409).json({ message: "Client already exists" });
        }

        client.clientName = trimmedName;
        await client.save();

        return res.status(200).json({
            message: "Client updated successfully",
            client,
        });
    } catch (error) {
        next(error);
    }
};

const manageClientAgreementEntry = async (req, res, next) => {
    try {
        const { clientId, action = "delete" } = req.body;

        if (!clientId) {
            return res.status(400).json({ message: "Client id is required" });
        }
        if (!["delete", "restore", "permanent-delete"].includes(action)) {
            return res.status(400).json({ message: "Invalid client action" });
        }

        const isTechUser = await isTechDepartmentUser(req.user);
        const clientAction =
            action === "delete" && isTechUser ? "permanent-delete" : action;

        if (
            ["restore", "permanent-delete"].includes(clientAction) &&
            !isTechUser
        ) {
            return res.status(403).json({
                message:
                    "Only Tech Department users can restore or permanently delete client agreement entries",
            });
        }

        const client = await CoworkingClient.findById(clientId);
        if (!client || client.clientAgreementStatus?.permanentlyDeleted) {
            return res.status(404).json({ message: "Client agreement entry not found" });
        }

        const status = client.clientAgreementStatus;

        if (clientAction === "delete") {
            if (status.isDeleted) {
                return res.status(400).json({ message: "Client is already deleted" });
            }
            status.isDeleted = true;
            status.deletedAt = new Date();
            status.deletedBy = req.user;
            await client.save({ validateBeforeSave: false });

            return res.status(200).json({
                message: "Client agreement entry deleted successfully",
                deletionType: "soft",
            });
        }

        if (clientAction === "restore") {
            if (!status.isDeleted) {
                return res.status(400).json({ message: "Client is not deleted" });
            }
            status.isDeleted = false;
            status.deletedAt = undefined;
            status.deletedBy = undefined;
            await client.save({ validateBeforeSave: false });

            return res.status(200).json({
                message: "Client agreement entry restored successfully",
            });
        }

        await Promise.all(
            (client.documents || [])
                .filter((document) => document.documentId)
                .map((document) => handleDocumentDelete(document.documentId)),
        );
        client.documents = [];
        status.isDeleted = false;
        status.permanentlyDeleted = true;
        status.deletedAt = undefined;
        status.deletedBy = undefined;
        await client.save({ validateBeforeSave: false });

        return res.status(200).json({
            message: "Client agreement entry permanently deleted successfully",
            deletionType: "permanent",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClientAgreements,
    createClientAgreementClient,
    addClientAgreement,
    updateClientAgreement,
    updateClientAgreementClientName,
    manageClientAgreementEntry,
};
