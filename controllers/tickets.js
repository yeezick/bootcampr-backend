import Ticket from '../models/tickets.js';
import Project from '../models/project.js';

export const createTicket = async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    const saveTicketToProject = await Project.findById(req.body.projectId);
    const statusString = req.body.status;
    const concatenatedString = statusString.replace(/\s+/g, '');
    saveTicketToProject.projectTracker[concatenatedString].push(newTicket);
    await saveTicketToProject.save({ validateBeforeSave: false });
    res.status(200).send(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating ticket.');
  }
};
export const ticketStatusHasNotChanged = async (req, res) => {
  const project = Project.findById(req.body.ProjectId);
};

export const ticketStatusChanged = async (req, res) => {
  try {
    const { newStatus, oldStatus, ticketID, projectId } = req.body;
    await Ticket.findByIdAndUpdate(ticketID, { status: newStatus });
    await Project.findByIdAndUpdate(projectId, {
      $pull: { [`projectTracker.${oldStatus}`]: ticketID },
      $push: { [`projectTracker.${newStatus}`]: ticketID },
    });

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Error updating ticket status.', error: err.message });
  }
};

const updateProject = async (req, res) => {
  const project = Project.findById(req.body.ProjectId);
};

export const deleteTicket = async (req, res) => {
  try {
    // deleteTicket.save();
    await Project.findById(req.body.ProjectId);
    res.status(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Error deleting ticket.', error: error.message });
  }
};
