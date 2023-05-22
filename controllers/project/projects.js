/**
 * todo:
 * - need to add edge cases
 * - need to add edge cases
 * - refactor this code because there is a for sure cleaner way to do all of this
 *  - might even be able to make a helper function since a lot of the special endpoints share the same functionality
 * - consider what properties containing objectId's should be populated in the response
 */
import Project from '../../models/project.js';
import User from '../../models/user.js';
import PushNotifications from '../../models/notifications.js';

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

export const getProjectByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const existingProject = await Project.find({
      $or: [{ 'members.engineers': userId }, { 'members.designers': userId }],
    });

    if (existingProject.length === 0) {
      return res
        .status(404)
        .json({ existingProject, message: `User with ID ${userId} is currently not assigned to any project.` });
    }
    res.status(200).json({ existingProject, message: `Successfully retrieved project for user with ID ${userId}.` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

// Potential Project new controllers
// Add members to project (similar to updateUserAndProject?)
// Add Task to Project
// Delete Task from Project (or better to 'archive' and just update the task status?)
// Add Meeting Id to Project
// Delete Meeting from Project (better to delete or archive?)
// Add Chat Id to Project
