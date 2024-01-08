import { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from './config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(cloudinaryConfig.KEY)
    private readonly cloudinaryConfiguration: ConfigType<
      typeof cloudinaryConfig
    >,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: this.cloudinaryConfiguration.folder,
        use_filename: this.cloudinaryConfiguration.use_filename,
      });

      return result.secure_url;
    } catch (error) {
      console.log(error);
    }
  }
}
