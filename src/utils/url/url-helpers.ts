import { ClassTransformOptions, plainToInstance } from 'class-transformer';

export function dtoToQueryString<T>(
  dto: T,
  options?: ClassTransformOptions,
): string {
  const plainObject = plainToInstance(
    dto.constructor as any,
    dto,
    options,
  ) as any;

  const filteredObject = Object.entries(plainObject).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  return new URLSearchParams(filteredObject).toString();
}

export type KeyValueObject = Record<
  string,
  string | number | boolean | null | undefined
>;

export const objectToUrl = (object: KeyValueObject): string => {
  const filteredObject = Object.entries(object).reduce(
    (acc: Record<string, string>, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  return new URLSearchParams(filteredObject).toString();
};
