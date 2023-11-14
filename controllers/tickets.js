import Ticket from '../models/tickets.js';
import Project from '../models/project.js';

export const createTicket = async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    const project = await Project.findById(req.body.projectId);
    const statusString = req.body.status;
    const concatenatedString = statusString.replace(/\s+/g, '');
    project.projectTracker[concatenatedString].push(newTicket);
    await project.save({ validateBeforeSave: false });
    res.status(200).send(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateTicket = async (req, res) => {
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
    // hould not be used
    // if (newStatus && oldStatus) {
    //   await updateTicketStatus({ oldStatus, newStatus, ticketId, projectId });
    // }
    res.status(200).send(ticket);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Error updating ticket.', error: err.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  const { initialStatus, projectId, targetStatus, targetTicketId } = req.body;

  try {
    await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: { [`projectTracker.${initialStatus}`]: targetTicketId },
        $push: { [`projectTracker.${targetStatus}`]: targetTicketId },
      },
      { new: true },
    );
    const updatedTicket = await Ticket.findByIdAndUpdate(targetTicketId, { status: initialStatus });
    res.status(200).json(updatedTicket);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Error updating ticket status.', error: err.message });
  }
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
