import Project from '../../models/project.js';
import User from '../../models/user.js';
import { findCommonAvailability } from '../../utils/availability.js';
import { convertQueryAttributesToMongoString } from '../../utils/helperFunctions.js';
import { generateProjectKickoffMeeting, generateProjectOrientation } from '../../utils/projectEvents.js';


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
        { path: 'projectTracker.toDo', select: '-projectTracker' },
        { path: 'projectTracker.inProgress', select: '-projectTracker' },
        { path: 'projectTracker.underReview', select: '-projectTracker' },
        { path: 'projectTracker.completed', select: '-projectTracker' },
      ])
      .exec();

      //generateProjectKickoffMeeting(id)
      //generateProjectOrientation(id)
    
    if (project) {
      return res.json(project);
    }
  
    res.status(404).json({ message: 'Project not found.' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

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
};

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
};

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
};

export const updateUserAndProject = async (req, res) => {
  try {
    const { projectID, projectUpdate } = req.body.project;
    const { userUpdate, userID } = req.body.user;
    const project = await Project.findByIdAndUpdate(projectID, projectUpdate, {
      new: true,
    });
    const user = await User.findByIdAndUpdate(userID, userUpdate, {
      new: true,
    });
    res.status(200).json({ message: 'Success!', user, project });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getTeamCommonAvailability = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate([{ path: 'members.engineers' }, { path: 'members.designers' }])
      .exec();

    if (project) {
      const members = [...project.members.engineers, ...project.members.designers];
      const commonAvailability = findCommonAvailability(members);
      return res.json(commonAvailability);
    }
    res.status(404).json({ message: 'Project not found.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
