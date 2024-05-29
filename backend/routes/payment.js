const express = require("express");
const User = require("../models/user");
const authRouter = express.Router();
require("dotenv").config();
const Razorpay = require('razorpay');  
  

const razorpayInstance = new Razorpay({ 
  
    key_id: process.env.KEY, 
    key_secret: process.env.KEY_SECRET 
});  
authRouter.post('/createOrder', (req, res)=>{ 
	const {amount,currency,receipt, notes} = req.body;	 	 
	razorpayInstance.orders.create({amount, currency, receipt, notes}, 
		(err, order)=>{ 
		if(!err) 
			res.json(order) 
		else
			res.send(err); 
		} 
	) 
}); 

authRouter.post('/verifyOrder', (req, res)=>{ 
	
	
	const {order_id, payment_id} = req.body;	 
	const razorpay_signature = req.headers['x-razorpay-signature']; 

	const key_secret = process.env.KEY_SECRET 
    ;	 
	let hmac = crypto.createHmac('sha256', key_secret); 

	hmac.update(order_id + "|" + payment_id); 
	
	const generated_signature = hmac.digest('hex'); 
	
	
	if(razorpay_signature===generated_signature){ 
		res.json({success:true, message:"Payment has been verified"}) 
	} 
	else
	res.json({success:false, message:"Payment verification failed"}) 
});

