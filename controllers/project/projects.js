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
import { convertQueryAttributesToMongoString } from '../../utils/helperFunctions.js';

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
    const project = await Project.findOne({ _id: id })
      .populate([
        { path: 'members.engineers' },
        { path: 'members.designers' },
        { path: 'projectTracker.toDo', select: '-projectTracker', populate: { path: 'createdBy assignee' } },
        { path: 'projectTracker.inProgress', select: '-projectTracker', populate: { path: 'createdBy assignee' } },
        { path: 'projectTracker.underReview', select: '-projectTracker', populate: { path: 'createdBy assignee' } },
        { path: 'projectTracker.completed', select: '-projectTracker', populate: { path: 'createdBy assignee' } },
        { path: 'completedInfo.participatingMembers.user', select: 'firstName lastName role' },
      ])
      .exec();

    if (project) {
      return res.json(project);
    }
    res.status(404).json({ message: 'Project not found.' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
}; // tested and is good

export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { attributes } = req.query;
    const attributesToFetch = convertQueryAttributesToMongoString(attributes);
    const project = await Project.findOne({ _id: projectId });
    const memberIds = [...project.members.engineers, ...project.members.designers];
    const members = await User.find({ _id: { $in: memberIds } }).select(attributesToFetch);
    res.status(200).json(members);
  } catch (err) {
    console.error(err);
  }
};

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
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,
      },
    );

    if (updatedProject) {
      return res.status(200).json(updatedProject);
    }
    throw new Error('Project not found.');
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
    // NOTE: Keep this logic for now, might be useful later
    // const existingProject = await Project.find({
    //   $or: [{ 'members.engineers': userId }, { 'members.designers': userId }],
    // })
    //   .populate({ path: 'members.engineers', select: 'firstName lastName email role profilePicture' })
    //   .populate({ path: 'members.designers', select: 'firstName lastName email role profilePicture' });

    const existingProject = await Project.find({
      'members.engineers': { $ne: userId },
      'members.designers': { $ne: userId },
    });

    if (existingProject.length === 0) {
      const message = `Bootcampr is now working to match you to a team. After your team of 3 SWEs and 2 UXDs is complete,\n we'll send an email with the date and time of your project kickoff meeting. (Approximately 1 - 2 weeks from today)\n\nIn the meantime, explore the project details page. Other pages in Project Portal will be available once you are matched to a team.\n\nWe love feedback. Please`;
      return res.status(299).json({
        existingProject,
        status: true,
        message: message,
      });
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
