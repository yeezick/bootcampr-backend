import mongoose from 'mongoose';
import Media from '../../models/chat/media.js';
import PrivateChat from '../../models/chat/privateChat.js';
import GroupChat from '../../models/chat/groupChat.js';

export const createMediaMessage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    const { privateChatId, groupChatId } = req.params;
    const { fileName, fileType, fileSize, fileUrl } = req.body;
    let existingThread;

    if (privateChatId) {
      existingThread = await PrivateChat.findOne({ _id: privateChatId });
    } else {
      existingThread = await GroupChat.findOne({ _id: groupChatId });
    }

    const mediaMessage = new Media({
      sender: userId,
      privateChatId,
      groupChatId,
      fileName,
      fileType,
      fileSize,
      fileUrl,
    });
    await mediaMessage.save();
    existingThread['media'].push(mongoose.Types.ObjectId(mediaMessage._id));
    await existingThread.save();
    res.status(200).json({
      mediaMessage,
      message: `Successfully created ${fileType} media message by user ${userId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllMedia = async (req, res) => {
  try {
    const allMedia = await Media.find({});
    allMedia.length === 0
      ? res.status(404).json({ message: 'No media found in the database.' })
      : res.status(200).json({
          allMedia,
          message: 'Successfully retrieved all media from database.',
        });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getMediaMessage = async (req, res) => {
  try {
    const { privateChatId, groupChatId } = req.params;
    if (privateChatId) {
      const mediaMessages = await Media.find({ privateChatId }).populate({
        path: 'sender',
        select: 'email',
      });
      mediaMessages.length === 0
        ? res.status(404).json({
            message: `No media messages found for private chat with ID ${privateChatId}.`,
          })
        : res.status(200).json({
            mediaMessages,
            message: `Successfully retrieved media messages for private chat with ID ${privateChatId}.`,
          });
    }

    if (groupChatId) {
      const mediaMessages = await Media.find({ groupChatId });
      mediaMessages.length === 0
        ? res.status(404).json({
            message: `No media messages found for group chat with ID ${groupChatId}.`,
          })
        : res.status(200).json({
            mediaMessages,
            message: `Successfully retrieved media messages for group chat with ID ${groupChatId}.`,
          });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getMediaByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const mediaMessages = await Media.find({ sender: userId }).populate({
      path: 'sender',
      select: 'email',
    });
    mediaMessages.length === 0
      ? res.status(404).json({
          message: `No media messages found for user with ID ${userId}.`,
        })
      : res.status(200).json({
          mediaMessages,
          message: `Successfully found media messages for user with ID ${userId}.`,
        });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getChatMediaByFileType = async (req, res) => {
  try {
    const { privateChatId, groupChatId } = req.params;
    const fileType = req.query.type;

    if (privateChatId) {
      const mediaMessages = await Media.find({ privateChatId });
      const filteredMedia = mediaMessages.filter((message) => message.fileType === fileType);

      if (!filteredMedia || filteredMedia.length === 0) {
        return res.status(404).json({
          message: `No ${fileType} media found for private chat with ID ${privateChatId}.`,
        });
      }
      return res.status(200).json({
        filteredMedia,
        message: `Successfully retrieved ${fileType} media messages for private chat with ID ${privateChatId}.`,
      });
    }

    if (groupChatId) {
      const mediaMessages = await Media.find({ groupChatId, fileType });
      const filteredMedia = mediaMessages.filter((message) => message.fileType === fileType);

      if (!filteredMedia || filteredMedia.length === 0) {
        return res.status(404).json({
          message: `No ${fileType} media found for group chat with ID ${groupChatId}.`,
        });
      }
      return res.status(200).json({
        filteredMedia,
        message: `Successfully retrieved ${fileType} media messages for group chat with ID ${groupChatId}.`,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMediaById = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const deletedMedia = await Media.findByIdAndDelete(mediaId);
    res.status(200).json({
      message: `Successfully deleted media with ID ${mediaId}`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
