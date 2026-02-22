import { z } from 'zod';

export const Vector3Schema = z.tuple([z.number(), z.number(), z.number()]);

export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color");

export const UUIDSchema = z.string().uuid();

export const TransformSchema = z.object({
  position: Vector3Schema,
  rotation: Vector3Schema,
  scale: Vector3Schema,
});
