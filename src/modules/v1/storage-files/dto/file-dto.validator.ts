import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsImageOrVideo(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isImageOrVideo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          if (value && value.mimetype) {
            const allowedTypes = [
              'image/jpeg',
              'image/png',
              'image/gif',
              'video/mp4',
              'video/webm',
              'video/avi',
            ];
            return allowedTypes.includes(value.mimetype);
          }
          return false;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(_args: ValidationArguments) {
          return 'File must be an image or video';
        },
      },
    });
  };
}
