import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import User from '../models/user.js';

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
    const addingImageToAws = new PutObjectCommand(params);
    await s3.send(addingImageToAws);

    gettingImageFromS3Bucket(req.body.userId);
    res.sendStatus(200);
  } catch (error) {
    if (error) res.send(error);
  }
};

// Getting the Image from the S3 Bucket
export const gettingImageFromS3Bucket = async (userId) => {
  try {
    const getImageParams = {
      Bucket: bucketName,
      Key: userId,
    };
    const command = new GetObjectCommand(getImageParams);
    const imageUrl = await getSignedUrl(s3, command, { expiresIn: 571000 });
  } catch (error) {
    if (error) console.log(error);
  }
};

//Setting the Image URL to the user profilePicture image
export const addImageToUserSchema = async (updateUser) => {
  try {
    const getImageParams = {
      Bucket: bucketName,
      Key: updateUser._id,
    };
    const command = new GetObjectCommand(getImageParams);
    const imageUrl = await getSignedUrl(s3, command, { expiresIn: 571000 });
    const user = await User.findById(updateUser._id);
    user.profilePicture = imageUrl;
    user.save();
    return user;
  } catch (error) {
    if (error) console.log(error);
  }
};

//getting all the image to all the user with images
export const getAllUSerImage = async (allUser) => {
  try {
    for (const user of allUser) {
      const getAllImage = {
        Bucket: bucketName,
        Key: user._id,
      };
      const command = new GetObjectCommand(getAllImage);
      const imageUrl = await getSignedUrl(s3, command, { expiresIn: 571000 });
      console.log(user);
      user.profilePicture = imageUrl;
      return [...user];
    }
  } catch (error) {
    if (error) console.log(error);
  }
};

//Delete The image from the s3Bucket and updating it
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
    if (error) console.log(error);
  }
};
