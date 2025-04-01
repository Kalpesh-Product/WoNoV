const jwt = require("jsonwebtoken");
const User = require("../../models/hr/UserData");

const handleRefreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.clientCookie) {
      return res.sendStatus(401);
    }

    const refreshToken = cookies.clientCookie;

    const userExists = await User.findOne({ refreshToken })
      .select(
        "firstName lastName role email empId password designation company departments permissions"
      )
      .populate([
        {
          path: "company",
          select:
            "companyName workLocations employeeTypes shifts policies agreements sops",
          populate: {
            path: "workLocations",
            select: "buildingName",
            model: "Building",
          },
        },
        { path: "role", select: "roleTitle" },
        { path: "departments", select: "name" },
        { path: "permissions" },
      ])
      .lean()
      .exec();

    if (!userExists) {
      return res.sendStatus(403);
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err || userExists.email !== decoded.email) {
          return res.sendStatus(403);
        }

        const accessToken = jwt.sign(
          {
            userInfo: {
              email: decoded.email,
              roles: userExists.role.map((r) => r.roleTitle),
              userId: userExists._id,
              company: userExists.company._id,
              departments: userExists.departments,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30m" }
        );

        delete userExists.refreshToken;
        delete userExists.password;
        delete userExists.updatedAt;

        res.json({
          accessToken,
          user: userExists,
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = handleRefreshToken;
