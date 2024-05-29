const express = require("express");
const Client = require("../models/client.js");
const clientengagementSchema = require("../models/projectengagement.js");
 
const authRouter = express.Router();
//post- your-requirement
authRouter.post('/engagement', async (req, res) => {
    try {
      const { clientId, engagement, budgettype, estimatedbudget, profilelevel, deadline, language, location, submitrequirements, similarproject , postRequirement } = req.body;
  
     
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
  
      
      const newEngagement = new clientengagementSchema({
        engagement,
        budgettype,
        estimatedbudget,
        profilelevel,
        deadline,
        language,
        location,
        submitrequirements,
        similarproject,
        postRequirement
      });
  

      client.projectengagement.push(newEngagement);

      await client.save();
  
      res.status(201).json(client);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });


  
  module.exports=authRouter;