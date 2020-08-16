const Photo = require('../models/photo.model');
const Voter = require('../models/voters.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0]; // get extension
      

      if ((fileExt == 'jpg' || fileExt == 'tif' || fileExt == 'png') && (title.length <= 25 && author.length <= 50)) {

        const tagChecker = RegExp.prototype.test.bind(/<|>/); //checks for tag bracket
        const atChecker = RegExp.prototype.test.bind(/@/); //checks for monkey
        const spaceChecker = RegExp.prototype.test.bind(/\s/); //checks for blank spaces
        const dotChecker = RegExp.prototype.test.bind(/\./); //checks for dot

        if(tagChecker(title) === false && atChecker(email) === true && spaceChecker(email) === false && dotChecker(email) === true){
          const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
          await newPhoto.save();
          res.json(newPhoto);
          
        } else {
          throw new Error('Tags or no valid email!');
        }
      
      } else {
        throw new Error('Wrong filetype!');
      }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    const voter = await Voter.findOne({ user: req.clientIp });
    //console.log('voter: ', voter)
    console.log('photo: ', photoToUpdate)

    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      if (voter) {
        if (voter.votes.includes(photoToUpdate._id)) {
          console.log('no double-voting please...')
          res.status(500).json(err);
        } else {
          //const array = voter.votes
          //const newelement = photoToUpdate._id
          //console.log('arr:',array)
          //console.log('elem:',newelement)
          //array.push(newelement);
          //console.log('arr2:',array)
          voter.votes.push(photoToUpdate._id)
          await voter.save();
          photoToUpdate.votes++;
          photoToUpdate.save();
          res.send({ message: 'OK, returning user voted' });
          console.log('OK, returning user voted')
        }
      } else {
        const newVoter = new Voter({ user: req.clientIp, votes: [photoToUpdate._id]});
        await newVoter.save();
        photoToUpdate.votes++;
        photoToUpdate.save();
        res.send({ message: 'OK, new user voted' });
        console.log('OK, new user voted')
      }
    }
  } catch(err) {
    res.status(500).json(err);
    console.log('error')
  }

};
