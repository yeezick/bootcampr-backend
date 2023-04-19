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
    res.status(200).send('Ticket created successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating ticket.');
  }
};

export const deleteTicket = async (req, res) => {
  const deleteTicket = await Ticket.findByIdAndDelete(req.body.id);
  deleteTicket.save();
  const deleteTicketFromProject = Project.findById(req.body.ProjectId);
  res.status(200);
};
