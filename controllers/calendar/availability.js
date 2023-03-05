import User from '../../models/user.js'
// import methods from availability util as needed
// Potential Availability Controllers
  // Get Single User single day availability
  // Get Single User full week availability
  // Get Full Team availability for single day
  // Get Full Team Availability for a full week
  // Get Common Availability for a team

export const getUserDayAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (user) {
            const { weekday } = req.params
            // do i need to convert user to json first to access availability prop?
            const userDayAvailability = user.availability[weekday]
            return res.status(200).json(userDayAvailability)
        }
    } catch (error) {
        console.error(error.message);
        return res.status(404).json({ message: 'User not found', error: error.message });
    }
};

export const getUserFullAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (user) {
            const userFullAvailability = user.availability
            return res.status(200).json(userFullAvailability)
        }
    } catch (error) {
        console.error(error.message);
        return res.status(404).json({ message: 'User not found', error: error.message });
    }
};

export const getTeamDayAvailability = async (req, res) => {
    try {
        // find users for a project
        // get each availability for certain weekday (param)
        // format
        // return response
    } catch (error) {
        // handle error
    }
};

export const getTeamFullAvailability = async (req, res) => {

};

export const getCommonAvailability = async (req, res) => {

};