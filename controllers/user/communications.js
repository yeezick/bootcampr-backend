import User from '../../models/user.js'
import { emailPreferenceOptions } from '../../utils/data/emailPreferenceOptions.js';

export const getEmailPreferences = async (req, res) => {
    try {
      const { userId } = req.params;
      // how do I get just user emailPreferences info from this find? (keep lightweight)
      const foundUser = await User.findById(userId);
      if (!foundUser) {
        return res.status(204).json({ message: 'User not found' });
      }
      console.log(foundUser)
      const preferences = foundUser.emailPreferences
      res.json(preferences);
    } catch (error) {
      console.error(error.message);
      res.status(400).json({ message: error.message });
    }
};

  export const updateEmailPreferences = async (req, res) => {
    try {
      const newPreferences = req.body;
      const updatedUser = await User.findByIdAndUpdate(
            {_id: req.params.userId}, 
            {emailPreferences: newPreferences }
        )
      if (!updatedUser) {
        return res.status(400).send({ msg: 'Error updated user email preferences' })
      }
      res.status(201).json(updatedUser.emailPreferences);
    } catch (error) {
      console.error(error);
      res.status(400).json({ status: false, message: error.message });
    }
  };


  export const getEmailPreferenceOptions = (req,res) => {
    return res.status(201).json(emailPreferenceOptions)
  }