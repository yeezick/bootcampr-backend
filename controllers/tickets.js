import Ticket from '../models/tickets.js';
import Project from '../models/project.js';

export const createTicket = async (req, res) => {
  try {
    // TODO: could this be replaced with .create?
    const { projectId, status } = req.body;
    const newTicket = await new Ticket(req.body).save();
    await Project.findByIdAndUpdate(
      projectId,
      {
        $push: { [`projectTracker.${status}`]: newTicket._id },
      },
      { new: true },
    );
    // TODO: why do we need this?
    // await project.save({ validateBeforeSave: false });
    res.status(200).send(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { link, status, oldStatus, _id: ticketId, projectId, description, dueDate, assignee, title } = req.body;

    let ticketMdbPayload = {
      description,
      link,
      dueDate,
      title,
      status,
    };

    if (assignee) {
      ticketMdbPayload.assignee = assignee;
    } else {
      ticketMdbPayload = { ...ticketMdbPayload, $unset: { assignee: '' } };
    }

    const ticket = await Ticket.findByIdAndUpdate(ticketId, ticketMdbPayload, { new: true });
    if (oldStatus !== status) {
      await Project.findByIdAndUpdate(
        projectId,
        {
          $pull: { [`projectTracker.${oldStatus}`]: ticketId },
          $push: { [`projectTracker.${status}`]: ticketId },
        },
        { new: true },
      );
    }

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
