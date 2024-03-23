import Comment from '../../models/comment.js';
import Ticket from '../../models/tickets.js';

export const createComment = async (req, res) => {
  try {
    const { authorId, content, parentComment, ticketId, isReply } = req.body;
    const comment = await new Comment({ authorId, content, isReply });
    await comment.save();

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
    }
    await Ticket.findByIdAndUpdate(ticketId, { $push: { comments: comment._id } });
    res.status(200).json(comment);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getTicketComments = async (req, res) => {
  try {
    let commentsWithData;
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);

    if (ticket) {
      commentsWithData = await Comment.find({ _id: { $in: ticket.comments } });
    } else {
      throw Error('ticket not found');
    }
    res.status(200).json({ comments: commentsWithData });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);

    if (deletedComment) {
      return res.status(200).send('Comment deleted.');
    }
    throw new Error('Comment not found.');
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndUpdate(commentId, req.body, { new: true });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    res.status(200).send(comment);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ error: error.message });
  }
};

export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    const { replies } = comment;
    const replyComments = await Comment.find({
      _id: { $in: replies },
    });
    res.status(200).json(replyComments);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
