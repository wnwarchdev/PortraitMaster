const Voter = require('../models/Voters.model');


exports.loadAll = async (req, res) => {

    try {
      res.json(await Voter.find());
    } catch(err) {
      res.status(500).json(err);
    }
  
  };