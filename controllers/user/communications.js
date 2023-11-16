import User from '../../models/user.js'

export const getEmailPreferences = async (req, res) => {
    try {
      const { userId } = req.params;
      const foundUserPreferences = await User.findById(userId).select('emailPreferences');

      if (!foundUserPreferences) {
        return res.status(204).json({ message: 'User not found' });
      }
      res.json(foundUserPreferences);
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
        return res.status(400).send({ msg: 'Error updating user email preferences' })
      }
      res.status(201).json(updatedUser.emailPreferences);
    } catch (error) {
      console.error(error);
      res.status(400).json({ status: false, message: error.message });
    }
  };