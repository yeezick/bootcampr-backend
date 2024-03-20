import Project from '../../models/project.js';
import User from '../../models/user.js';
import { findCommonAvailability } from '../../utils/availability.js';
import { convertQueryAttributesToMongoString } from '../../utils/helperFunctions.js';
import { addProjectEventsToCalendar, moveTicketBetweenColumns, reorderColumn } from '../../utils/helpers/projects.js';

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
        { path: 'members.productManagers' },
        { path: 'projectTracker.toDo', select: '-projectTracker' },
        { path: 'projectTracker.inProgress', select: '-projectTracker' },
        { path: 'projectTracker.underReview', select: '-projectTracker' },
        { path: 'projectTracker.completed', select: '-projectTracker' },
      ])
      .exec();
    
   //await addProjectEventsToCalendar(id)


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
    const memberIds = [...project.members.engineers, ...project.members.designers, ...project.members.productManagers];
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
      .populate([{ path: 'members.engineers' }, { path: 'members.designers' }, { path: 'members.productManagers' }])
      .exec();

    if (project) {
      const members = [...project.members.engineers, ...project.members.designers, ...project.members.productManagers];
      const commonAvailability = findCommonAvailability(members);
      return res.json(commonAvailability);
    }
    res.status(404).json({ message: 'Project not found.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const reorderProjectColumn = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { columnId, oldIdx, newIdx } = req.body;
    const project = await Project.findById(projectId).populate([
      { path: `projectTracker.${columnId}`, select: '-projectTracker' },
    ]);
    const reorderedColumn = reorderColumn(project.projectTracker[columnId], oldIdx, newIdx);
    project.projectTracker[columnId] = reorderedColumn;
    await project.save();
    res.status(200).json({ reorderedColumn });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Error reordering ticket within column.' });
  }
};

export const moveTicketColumn = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newColumnId, newColumnIdx, oldColumnId, oldColumnIdx } = req.body;
    const project = await Project.findById(projectId).populate([
      { path: `projectTracker.${oldColumnId}`, select: '-projectTracker' },
      { path: `projectTracker.${newColumnId}`, select: '-projectTracker' },
    ]);
    const [oldColumn, newColumn] = moveTicketBetweenColumns(
      project.projectTracker[newColumnId],
      newColumnIdx,
      project.projectTracker[oldColumnId],
      oldColumnIdx,
    );
    project.projectTracker[newColumnId] = newColumn;
    project.projectTracker[oldColumnId] = oldColumn;
    await project.save();
    res.status(200).json({ oldColumn, newColumn });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Error moving tickets between columns.' });
  }
};

