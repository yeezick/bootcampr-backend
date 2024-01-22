import Ticket from '../models/tickets.js';
import Project from '../models/project.js';

export const createTicket = async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    const project = await Project.findById(req.body.projectId);
    const concatenatedStatus = req.body.status.replace(/\s+/g, '');
    project.projectTracker[concatenatedStatus].push(newTicket);
    await project.save();
    res.status(200).send(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateTicketInformationAndStatus = async (req, res) => {
  try {
    const { link, newStatus, oldStatus, ticketId, projectId, description, date, assignee, title } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        description: description,
        link: link,
        date: date,
        title: title,
        assignee: assignee,
        status: newStatus,
      },
      { new: true },
    );
    if (newStatus && oldStatus) {
      await updateTicketStatus({ oldStatus, newStatus, ticketId, projectId });
    }
    res.status(200).send(ticket);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Error updating ticket status.', error: err.message });
  }
};

const updateTicketStatus = async ({ oldStatus, newStatus, ticketId, projectId }) => {
  await Project.findByIdAndUpdate(
    projectId,
    {
      $pull: { [`projectTracker.${oldStatus}`]: ticketId },
      $push: { [`projectTracker.${newStatus}`]: ticketId },
    },
    { new: true },
  );
};

export const deleteTicket = async (req, res) => {
  try {
    const { ticketsStatus, ticketId, projectId } = req.body;

    await Ticket.findOneAndRemove({ _id: ticketId });
    await Project.findByIdAndUpdate(projectId, {
      $pull: { [`projectTracker.${ticketsStatus}`]: ticketId },
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Error deleting ticket.', error: error.message });
  }
};
