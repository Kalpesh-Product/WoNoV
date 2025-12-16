const jwt = require("jsonwebtoken");
const User = require("../../models/hr/UserData");
const bcrypt = require("bcryptjs");
const generatePassword = require("../../utils/passwordGenerator");
const mailer = require("../../config/nodemailerConfig");
const emailTemplates = require("../../utils/emailTemplates");

const login = async (req, res, next) => {
  try {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { email, password } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!password)
      return res.status(400).json({ message: "Invalid credentials" });

    const userExists = await User.findOne({ email })
      .select(
        "firstName lastName clockInDetails role email empId password designation company departments permissions profilePicture phone"
      )
      .populate([
        {
          path: "company",
          select:
            "companyName workLocations employeeTypes shifts policies agreements sops totalMeetingCredits meetingCreditBalance",
          populate: {
            path: "workLocations",
            select: "buildingName",
          },
        },

        { path: "role", select: "roleTitle" },
        { path: "departments", select: "name" },
        { path: "permissions" },
      ])
      .lean()
      .exec();

    if (!userExists) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    let currentTime = new Date();

    let currentOffset = currentTime.getTimezoneOffset();

    let ISTOffset = 330; // IST offset UTC +5:30

    let ISTTime = new Date(
      currentTime.getTime() + (ISTOffset + currentOffset) * 60000
    );

    const accessToken = jwt.sign(
      {
        userInfo: {
          userId: userExists._id,
          name: userExists.name,
          roles: userExists.role.map((role) => role.roleTitle),
          email: userExists.email,
          company: userExists.company._id,
          totalMeetingCredits: userExists.company.totalMeetingCredits,
          meetingCreditBalance: userExists.company.meetingCreditBalance,
          departments: userExists.departments,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      {
        email: userExists.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    await User.findOneAndUpdate({ _id: userExists._id }, { refreshToken });

    res.cookie("clientCookie", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    delete userExists.password;
    const updatedUser = {
      ...userExists,
      time: ISTTime,
    };

    // data needed to add for storing logs as verifyJWT isn't used to set thet user detials in req.
    req.logContext = {
      performedBy: userExists._id,
      company: userExists.company._id,
    };

    res.status(200).json({ user: updatedUser, accessToken });
  } catch (error) {
    next(error);
  }
};

const logOut = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    if (!cookie?.clientCookie) return res.sendStatus(204);

    const refreshToken = cookie.clientCookie;
    const foundUser = await User.findOne({ refreshToken }).lean().exec();

    if (!foundUser) {
      res.clearCookie("clientCookie", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }

    const userExists = await User.findOneAndUpdate(
      { _id: foundUser._id },
      { refreshToken: null }
    )
      .lean()
      .exec();

    res.clearCookie("clientCookie", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    // data needed to add for storing logs as verifyJWT isn't used to set the user detials in req.
    req.logContext = {
      performedBy: userExists._id,
      company: userExists.company._id,
    };

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logOut };
