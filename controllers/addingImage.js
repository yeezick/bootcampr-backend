import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

export const addImagesToUser = async (req, res) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: req.body.tempNanoidId,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const addingImageToAws = new PutObjectCommand(params);
    await s3.send(addingImageToAws);
    // get(req.body.tempNanoidId);
    res.sendStatus(200);
  } catch (error) {
    if (error) res.send(error);
  }
};
export const gettingImageFromS3 = async (tempNanoidId) => {
  try {
    const GetImageParams = {
      Bucket: bucketName,
      Key: tempNanoidId,
    };
    const command = new GetObjectCommand(GetImageParams);
    const imageUrl = await getSignedUrl(s3, command, { expiresIn: 571000 });
    settingImageToSingleUser(tempNanoidId, imageUrl);
  } catch (error) {
    if (error) console.log(error);
  }
};
export const settingImageToSingleUser = async (tempNanoidId, imageUrl) => {
  try {
    const ticket = await Ticket.findOne({ tempUUID: tempUUID });
    // ticket.imageUrl = url;
    console.log(ticket);
    ticket.save();
  } catch (error) {}
};
