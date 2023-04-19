import Ticket from '../models/tickets.js';
import Project from '../models/project.js';
const createTicket = async (req, res) => {
  try {
    const newTicket = await new Ticket(req.body);
    const saveTicketToProject = await Project.findById({ id: req.body.ProjectId });
    saveTicketToProject.projectTracker[req.body.status].push(newTicket);
    saveTicketToProject.save();
    res.status(200);
  } catch (err) {
    console.log(err);
  }
};

const deleteTicket = async (req, res) => {
  res.status(200);
};
