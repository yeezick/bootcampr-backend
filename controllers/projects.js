/**
 * todo:
 * - need to add edge cases
 * - need to add edge cases
 * - refactor this code because there is a for sure cleaner way to do all of this
 *  - might even be able to make a helper function since a lot of the special endpoints share the same functionality
 * - consider what properties containing objectId's should be populated in the response
 */
import Project from '../models/project.js';
import User from '../models/user.js';
import pushNotifications from '../models/notifications.js';

//basic CRUD functions:
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getOneProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (project) {
      return res.json(project);
    }
    res.status(404).json({ message: 'Project not found.' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
}; // tested and is good

export const createProject = async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
}; // works, requires userID

export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const userProjects = await Project.find({
      where: {
        projectOwner: userId,
      },
    });
    if (userProjects) {
      await pushNotifications.create({
        user: userId,
        title: 'Projects',
        type: 1,
        message: `This is a test notification that was sent to at ${new Date()}`,
        read: false,
      });
      return res.json(userProjects);
    }
    res.status(404).json({ message: 'Project not found.' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(project);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
}; // works

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);
    if (deletedProject) {
      return res.status(200).send('Project deleted.');
    }
    throw new Error('Project not found.');
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
}; // works

//custom functions:

export const updateUserAndProject = async (req, res) => {
  try {
    const { projectID, projectUpdate } = req.body.project;
    const { userUpdate, userID } = req.body.user;
    const project = await Project.findByIdAndUpdate(projectID, projectUpdate, {
      new: true,
    }); // .populate({ path: "team_members", model: User }); //review
    const user = await User.findByIdAndUpdate(userID, userUpdate, {
      new: true,
    });
    res.status(200).json({ message: 'Success!', user, project });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

/* 
const body = {
  project: {
    projectId: "61e090dc02b0f84cd989cd1b"
    projectUpdate: {
      team_members: [
        "61e090dc02b0f84cd989cd13",
        "61e090dc02b0f84cd989cd15",
        "61e090dc02b0f84cd989cd17",
        "61e096f7dcab51d3edee52e6", // new member
      ],
    },
  },
  user: {
    userId: "61e096f7dcab51d3edee52e6",
    userUpdate: {
      memberOfProjects: ["61e090dc02b0f84cd989cd1b"], //must have old project id's too
    },
  },
};
*/

/*
export const removeMemberFromProject = async (req, res) => {
  try {
    const { projectUpdate, userId, userUpdate } = req.body;
    const { projectId } = req.params;
    const project = await Project.findByIdAndUpdate(projectId, projectUpdate, {
      new: true,
    });
    const user = await User.findByIdAndUpdate(userId, userUpdate, {
      new: true,
    });
    res.status(200).json({ message: "Success!", user, project });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

/* in this instance I removed the member i had originally added with `addMemberToProject`
{
  projectUpdate: {
    team_members: ["61e1dd56f0433b2d40e12cd7", "61e1dd56f0433b2d40e12cd9"],
  },
  userId: "61e1dd56f0433b2d40e12cdb",
  userUpdate: {
    memberOfProjects: [],
    declinedProjects: ["61e1dd57f0433b2d40e12cdf"], // dont forget to add project here
  },
};
 */
/*
export const addInterestedUser = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, userUpdate, projectUpdate } = req.body;
    const project = await Project.findByIdAndUpdate(projectId, projectUpdate, {
      new: true,
    });
    const user = await User.findByIdAndUpdate(userId, userUpdate, {
      new: true,
    });
    res.status(200).json({ message: "Success!", user, project });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
/*
{
  "projectUpdate": {
    "interestedApplicants": ["61e1dd56f0433b2d40e12cd9"]
  },
  "userId": "61e1dd56f0433b2d40e12cdb",
  "userUpdate": {
    "interestedProjects": ["61e1dd57f0433b2d40e12cdf"],
  }
}
*/
/*
export const removeInterestedUser = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, userUpdate, projectUpdate } = req.body;
    const project = await Project.findByIdAndUpdate(projectId, projectUpdate, {
      new: true,
    });
    const user = await User.findByIdAndUpdate(userId, userUpdate, {
      new: true,
    });
    res.status(200).json({ message: "Success!", user, project });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

/*
{
  "projectUpdate": {
    "interestedApplicants": []
  },
  "userId": "61e1dd56f0433b2d40e12cdb",
  "userUpdate": {
    "interestedProjects": [],
    "declinedProjects": ["61e1dd57f0433b2d40e12cdf"]
  }
}
*/
