const express = require("express");
const path = require("path");
const User = require("../model/user");
const router = express.Router();
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");

// Create a User
router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            message: "Error deleting file",
          });
        }
      });
      return next(new ErrorHandler("User already exists", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl,
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "🚀 Activate your account!",
        message: `
        <div style="width:100%;background:#0d253f;text-align:left; border-radius:10px">
          <div style="padding:10px">
            <h2 style="font-size:20px;font-weight:700;letter-spacing:0.08em;margin:0 0 8px 0;color:#fff">
              Hi ${user.name}!
            </h2>
            <div>
            <hr style="text-align:left;margin:0px;width:40px;height:3px;color:#01b4e4;background-color:#01b4e4;border-radius:4px;border:none">
            <p style="font-size:15px;font-weight:300;color:#fff">
              Thanks for signing up to The PTech EShop. Before we can continue, we need to validate your email address.
            </p>
            <a style="color:#fff;border-radius:20px;border:10px solid #01b4e4;background-color:#01b4e4;padding:0 10px;text-transform:uppercase;text-decoration:none;font-weight:700" 
              href=${activationUrl} target="_blank">Activate My Account</a>
            </div>
            <hr style="margin:20px 0;color:#fff;height:1px;border:0;background-color:#fff;">
            <p style="margin:0;padding:0;font-size:13px;color:#fff">
              You are receiving this email because you are a registered user on 
              <a style="font-size:13px;color:#fff" href="https://www.phatpham.tech" target="_blank">www.phatpham.tech</a>.
            </p>
          </div>
        </div>
          `,
      });
      res.status(201).json({
        success: true,
        html: `Hi, ${user.name} to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler("User already exists", 400));
  }
});

// Create activetion Token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// Activate User
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET,
      );

      if (!newUser) {
        return next(new ErrorHandler("Invalid token", 400));
      }

      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });

      if (user) {
        return next(new ErrorHandler("User already exists"), 400);
      }

      user = await User.create({
        name,
        email,
        avatar,
        password,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// Login User
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400),
        );
      }

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// Load User
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// LogOut User
router.get(
  "/logout",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });

      res.status(201).json({
        success: true,
        message: "Log Out Successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

module.exports = router;
