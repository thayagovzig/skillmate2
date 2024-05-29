const express = require("express");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer'); 
const authRouter = express.Router();
const twilio = require("twilio");
require("dotenv").config();



let otpMap= new Map();

//signup
authRouter.post("/api/signup", async (req, res) => {
    try {
      const { name, email, password ,phone} = req.body;
  
      // Password validation
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ msg: "Password is weak" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "User with same email already exists!" });
      }
  
      const hashedPassword = await bcryptjs.hash(password, 8);
  
      let user = new User({
        email,
        password: hashedPassword,
        name,
        phone,
      });
      user = await user.save();
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //signin

  authRouter.post("/api/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ msg: "User with this email does not exist!" });
      }
  
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect password." });
      }
  
      const token = jwt.sign({ id: user._id }, "passwordKey");
      res.json({ token, ...user._doc });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  authRouter.post("/tokenIsValid", async (req, res) => {
    try {
      const token = req.header("x-auth-token");
      if (!token) return res.json(false);
      const verified = jwt.verify(token, "passwordKey");
      if (!verified) return res.json(false);
  
      const user = await User.findById(verified.id);
      if (!user) return res.json(false);
      res.json(true);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  
 

   //Email Verification 
  transporter = nodemailer.createTransport({
    service: "gmail",
    host: 'process.env.SMTP_HOST',
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
     }
   });

 
  authRouter.post("/emailVerify",async(req,res)=>{
  
    
    try {

      
      const { username, email } = req.body;
  
      // Check if the user exists in your database
       const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
 

const token = jwt.sign({ 
  data: 'Token Data'   
}, 'ourSecretKey', { expiresIn: '10m' }   
);     

      const mailConfigurations = { 

        // It should be a string of sender/server email 
        from: 'YOUR_EMAIL', 
      
        to: email, 
      
        // Subject of Email 
        subject: 'Email Verification', 
        
        // This would be the text of email body 
        text: `Hi! There, You have recently visited 
          our website and entered your email. 
          Please follow the given link to verify your email 
          http://localhost:3000/verify/${token} 
          Thanks` 
        
      }; 
  
      await transporter.sendMail(mailConfigurations, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response );
        }
      });
      console.log(token);
  
      res.status(200).json({ msg: "Email sent successfully" });
   
  
    } catch (e) {
      res.status(500).json({error:e.message});
    }
  });
  
  authRouter.get('/verify/:token', (req, res)=>{ 
    const {token} = req.params; 
  
    // Verifying the JWT token  
    jwt.verify(token, 'ourSecretKey', function(err, decoded) { 
        if (err) { 
            console.log(err); 
            res.send("Email verification failed,  possibly the link is invalid or expired"); 
        } 
        else { 
            res.send("Email verifified successfully"); 
        } 
    }); 
});
  

//Mobile number verifiacation via otp

// Function to generate OTP (You can implement your logic here)
function generateOTP() {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000);
}

const accountSid = 'YOUR_ACCOUNT_SID';//TWILIO
const authToken = 'YOUR_AUTH_TOKEN';

const client = new twilio(accountSid, authToken);


// Endpoint to send OTP
authRouter.post('/sendOTP', async (req, res) => {
  const phone = req.body.phone;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const otp = generateOTP(); // Generate OTP

  try {
    // Find the user by phone number
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save OTP to user model
    user.otpreceived = otp;
    await user.save();

    // Send OTP via SMS
    client.messages
      .create({
        body: `Your OTP is: ${otp}`,
        from: 'YOUR_TWILO_NUMBER',
        to: phone
      })
      .then(() => {
        res.status(200).json({ message: 'OTP sent successfully' });
      })
      .catch((err) => {
        console.error('Error sending OTP:', err);
        res.status(500).json({ error: 'Failed to send OTP' });
      });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
authRouter.post('/verifyOTP', async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: 'OTP number is required' });
  }

  try {
    // Find the user by their stored OTP
    const user = await User.findOne({ otpreceived: otp });

    if (!user) {
      return res.status(400).json({ error: 'OTP NOT VALID' });
    }

    // Clear the OTP from the user record
    user.otpreceived = undefined;
    await user.save();

    res.status(200).json({ message: 'OTP VERIFIED SUCCESSFULLY' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

//ForgetPassword
authRouter.post('/forgetPassword', async (req, res) => {
  const { phone,newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: 'Password  is required' });
  }
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ msg: "Password is weak" });
      }
  const user= await User.findOne({phone});
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const hashedPassword = await bcryptjs.hash(newPassword, 8);
  user.password=hashedPassword;
  await user.save();
  res.status(200).json({message:"Password updated successfully"});

  
});

authRouter.get('/googlelogin/success', (req, res) => {
  res.send('SUCCESS');
});
authRouter.get('/googlelogin/error', (req, res) => {
  res.send('FAILURE');
});

//user-review 
authRouter.post('/review',async (req,res) =>{
  const { email,review,timeRate,SkillExperienceRate,CommunicationRate,ProfessionalismRate,qualityRate } = req.body;
  const user = await User.findOne({ email });
  if(!user)
    {
      return res.status(500).json({error:'user not found'});
    }
   user.review=review;
   user.timeRate=timeRate;
   user.CommunicationRate=CommunicationRate;
   user.SkillExperienceRate=SkillExperienceRate;
   user.ProfessionalismRate=ProfessionalismRate;
   user.qualityRate=qualityRate;
   await user.save();
  res.status(200).json({message:"review added successfully"});
  });

  //review-algorithm
  authRouter.get('/reviewAlgorithm', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
     console.log(user.timeRate);
      const average = (user.CommunicationRate + user.ProfessionalismRate + user.timeRate + user.qualityRate + user.SkillExperienceRate) / 5;
      res.status(200).json({ message: "The average Rating is:", average });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  //coin API

  

 // Client- Talk
 authRouter.post('/talk-to-client', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }

  user.coin = user.coin - 25;
  await user.save();
  res.status(200).json({ message: "25 coins deducted from your wallet successfully" });
});

//Referal-Record
authRouter.post("/referal-record", async (req,res) =>{
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }

  user.coin = user.coin + 50;
  await user.save();
  res.status(200).json({ message: "50 coins added to your wallet successfully" });

});

//coin-detail-popup
authRouter.get('/coin-detail', async (req,res)=>{ 
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({message: `You have ${user.coin} in your wallet `});

});

//purchase-acknowledgement mail , purchase record and My-Coins
authRouter.post('/purchase-acknowledgement', async (req, res) => {
  try {
    const { email, coinsPurchased } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.coin = user.coin + coinsPurchased;
    user.purchasedCoin = user.purchasedCoin + coinsPurchased;
    await user.save();

    res.status(200).json({ message: `${coinsPurchased} coins added to your wallet successfully` });

    const mailConfigurations = { 
      from: process.env.EMAIL_ID, 
      to: email, 
      subject: 'Purchase - acknowledgment', 
      text: `Thank you for the purchase. ${coinsPurchased} coins have been added to your wallet successfully.`,
    }; 

    await transporter.sendMail(mailConfigurations, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//display- the- freelacner
authRouter.get('/display-the-freelancer', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users); 
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
});



module.exports=authRouter;
