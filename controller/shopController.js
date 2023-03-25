const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");
const Shop = require("../model/shop");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// Create Shop
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
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
      return next(new ErrorHandler("Error Deleting File", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: fileUrl,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
    };

    const activationToken = createActivationToken(seller);
    const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;
    try {
      await sendMail({
        email: seller.email,
        subject: "🚀 Activate your Shop!",
        message: `
          <div style="width:100%;background:#0d253f;text-align:left; border-radius:10px">
            <div style="padding:10px">
              <h2 style="font-size:20px;font-weight:700;letter-spacing:0.08em;margin:0 0 8px 0;color:#fff">
                Hi ${seller.name}!
              </h2>
              <div>
              <hr style="text-align:left;margin:0px;width:40px;height:3px;color:#01b4e4;background-color:#01b4e4;border-radius:4px;border:none">
              <p style="font-size:15px;font-weight:300;color:#fff">
                Thanks for signing up to The PTech EShop. Before we can continue, we need to validate Shop email address.
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
        html: `Hi, ${seller.name} to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Create activetion Token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// Activate User
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET,
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }

      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists"), 400);
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      sendToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// Login Shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await Shop.comparePassword(password);

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

module.exports = router;
