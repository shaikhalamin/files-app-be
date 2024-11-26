import { BadRequestException } from '@nestjs/common';
import { CloudinaryUploadResponse } from './cloudinary-response';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinarySignedUrl = async (public_id: string): Promise<any> => {
  try {
    return await cloudinary.url(public_id, {
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 2,
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
      resource_type: resource_type,
      access_mode: 'authenticated',
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
