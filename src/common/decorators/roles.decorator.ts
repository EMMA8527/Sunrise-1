/* eslint-disable prettier/prettier */
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/**
 * Use @Roles('admin', 'superadmin') to mark controller methods or classes
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
