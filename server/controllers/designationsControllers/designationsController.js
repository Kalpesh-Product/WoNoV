const Designation = require("../../models/Designations")
const Department = require("../../models/Departments")


const addDesignation = async (req, res, next) => {
    try {
        const { title, department, responsibilities } = req.body;

        // Validate the department exists
        const departmentDoc = await Department.findById(department);
        if (!departmentDoc) {
            return res.status(404).json({ message: "Department not found" });
        }

        // Create the designation
        const designation = new Designation({
            title,
            department: departmentDoc._id,
            responsibilities,
        });

        const savedDesignation = await designation.save();

        // Add the designation to the department's designations array
        departmentDoc.designations.push(savedDesignation._id);
        await departmentDoc.save();

        res.status(201).json({
            message: "Designation added successfully",
            designation: savedDesignation,
        });
    } catch (error) {
        console.error("Error adding designation:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = { addDesignation };