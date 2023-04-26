import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import User from '../../models/user.js';

// AWS S3 REQUIRED ENV VARIABLES
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

// adding the image to the S3 bucket from AWS
export const addImagesToS3Bucket = async (req, res) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: req.body.userId,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const addingImageToAWSBucket = new PutObjectCommand(params);
    await s3.send(addingImageToAWSBucket);
    await addImageToUserSchema(req.body.userId);
    res.status(200).json({ success: 'image sent successfully' });
  } catch (error) {
    console.error(error);
  }
};

// Setting the Image URL to the user profilePicture image
export const addImageToUserSchema = async (userId) => {
  try {
    const user = await User.findById(userId);
    user.profilePicture = `https://bootcampruserimage.s3.amazonaws.com/${userId}`;
    user.save();
  } catch (error) {
    console.error(error);
  }
};

export const updatingImage = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { profilePicture: `https://bootcampruserimage.s3.amazonaws.com/${userId}` },
    );
    user.save();
    return user;
  } catch (error) {
    console.error(error);
  }
};

// if user decides to Delete there account The image from the s3Bucket and will also delete it
export const deleteImageFromS3Bucket = async (id) => {
  try {
    const user = await User.findById(id);
    const params = {
      Bucket: bucketName,
      Key: user._id,
    };
    const deleteImage = new DeleteObjectCommand(params);
    await s3.send(deleteImage);
  } catch (error) {
    console.error(error);
  }
};
