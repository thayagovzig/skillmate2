const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/user");
const router = express.Router();

// Generate a secret and QR code
router.get('/setup', async (req, res) => {
  try {
    // Generate a secret
    
    var secret = speakeasy.generateSecret({ name: "SkilMate" });
   
    // Generate a QR code from the otpauth_url
    qrcode.toDataURL(secret.otpauth_url, async (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Error generating QR code' });
      }
      console.log(data);
    
      // Assuming req.user contains the authenticated user
      // Update the user with the generated secret
       await User.findByIdAndUpdate(req.user.id, { otpSecret: secret.ascii });

      // Render an HTML page with the QR code
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MFA QR Code</title>
        </head>
        <body>
            <h1>Scan the QR Code</h1>
            <img src="${data}" alt="QR Code">
        </body>
        </html>
      `);
    });
  } catch (err) {
    res.status(500).json({ error: 'Error generating QR code or saving secret' });

  }
});

//Verify the token
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).send("User not found");
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'ascii',
      token: otp,
      window: 1 // Allow 1 minute window for time drift
    });
    
    console.log(verified);

    if (!verified ) {
      return res.status(400).send("Invalid or expired OTP");
    }

    // Clear OTP fields after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.send("OTP verified successfully");
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;