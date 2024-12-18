import { BadRequestException } from '@nestjs/common';
import { CloudinaryUploadResponse } from './cloudinary-response';
import { config } from 'dotenv';
config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary Config:', cloudinary.config());

export const cloudinarySignedUrl = async (
  public_id: string,
  resource_type: string,
): Promise<any> => {
  try {
    return await cloudinary.url(public_id, {
      sign_url: true,
      secure: true,
      resource_type: resource_type,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

export const cloudinaryUpload = async (
  file: string,
  folder: string,
  resource_type: string,
): Promise<CloudinaryUploadResponse> => {
  try {
    return await cloudinary.uploader.upload(file, {
      folder: folder,
      secure: true,
      resource_type: resource_type,
    });
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

export const cloudinaryDeleteFile = async (
  public_id: string,
): Promise<{ result: string }> => {
  try {
    return await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};
