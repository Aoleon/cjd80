import { z } from 'zod';
import {
  updateIdeaStatusSchema,
  insertEventSchema,
  updateEventStatusSchema,
  insertAdminSchema,
  updateAdminSchema,
  updateAdminInfoSchema,
  insertInscriptionSchema,
  insertDevelopmentRequestSchema,
  updateDevelopmentRequestSchema,
  updateDevelopmentRequestStatusSchema,
  ADMIN_ROLES,
} from '../../../shared/schema';

// ===== Pagination DTOs =====

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;

// ===== Idea DTOs =====

export const updateIdeaStatusDto = updateIdeaStatusSchema;
export type UpdateIdeaStatusDto = z.infer<typeof updateIdeaStatusDto>;

// ===== Event DTOs =====

export const updateEventDto = insertEventSchema.partial();
export type UpdateEventDto = z.infer<typeof updateEventDto>;

export const updateEventStatusDto = updateEventStatusSchema;
export type UpdateEventStatusDto = z.infer<typeof updateEventStatusDto>;

// ===== Inscription DTOs =====

export const createInscriptionDto = insertInscriptionSchema;
export type CreateInscriptionDto = z.infer<typeof createInscriptionDto>;

export const bulkCreateInscriptionsDto = z.object({
  eventId: z.string().uuid(),
  inscriptions: z.array(z.object({
    name: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    comments: z.string().optional(),
  })).min(1, 'Au moins une inscription est requise'),
});
export type BulkCreateInscriptionsDto = z.infer<typeof bulkCreateInscriptionsDto>;

// ===== Administrator DTOs =====

export const createAdministratorDto = insertAdminSchema;
export type CreateAdministratorDto = z.infer<typeof createAdministratorDto>;

export const updateAdministratorRoleDto = z.object({
  role: z.enum(Object.values(ADMIN_ROLES) as [string, ...string[]]),
});
export type UpdateAdministratorRoleDto = z.infer<typeof updateAdministratorRoleDto>;

export const updateAdministratorStatusDto = z.object({
  isActive: z.boolean(),
});
export type UpdateAdministratorStatusDto = z.infer<typeof updateAdministratorStatusDto>;

export const updateAdministratorInfoDto = updateAdminInfoSchema;
export type UpdateAdministratorInfoDto = z.infer<typeof updateAdministratorInfoDto>;

export const approveAdministratorDto = z.object({
  role: z.enum(Object.values(ADMIN_ROLES) as [string, ...string[]]),
});
export type ApproveAdministratorDto = z.infer<typeof approveAdministratorDto>;

// ===== Development Request DTOs =====

export const createDevelopmentRequestDto = insertDevelopmentRequestSchema.omit({
  requestedBy: true,
  requestedByName: true
});
export type CreateDevelopmentRequestDto = z.infer<typeof createDevelopmentRequestDto>;

export const updateDevelopmentRequestDto = updateDevelopmentRequestSchema;
export type UpdateDevelopmentRequestDto = z.infer<typeof updateDevelopmentRequestDto>;

export const updateDevelopmentRequestStatusDto = updateDevelopmentRequestStatusSchema.omit({
  lastStatusChangeBy: true,
});
export type UpdateDevelopmentRequestStatusDto = z.infer<typeof updateDevelopmentRequestStatusDto>;

// ===== Feature Configuration DTOs =====

export const updateFeatureConfigDto = z.object({
  enabled: z.boolean(),
});
export type UpdateFeatureConfigDto = z.infer<typeof updateFeatureConfigDto>;

// ===== Email Configuration DTOs =====

export const updateEmailConfigDto = z.object({
  host: z.string().min(1, 'Le serveur SMTP est requis'),
  port: z.number().int().positive().default(465),
  secure: z.boolean().default(true),
  username: z.string().optional().default(''),
  password: z.string().optional(),
  fromEmail: z.string().email('Email expéditeur invalide'),
  fromName: z.string().optional().default('CJD'),
});
export type UpdateEmailConfigDto = z.infer<typeof updateEmailConfigDto>;

// ===== Vote DTOs =====

export const createVoteDto = z.object({
  ideaId: z.string().uuid(),
  voterName: z.string().min(1, 'Le nom est requis'),
  voterEmail: z.string().email('Email invalide'),
});
export type CreateVoteDto = z.infer<typeof createVoteDto>;

// ===== Unsubscription DTOs =====

export const updateUnsubscriptionDto = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  reason: z.string().optional(),
});
export type UpdateUnsubscriptionDto = z.infer<typeof updateUnsubscriptionDto>;
