import { z } from 'zod';

export const createPersonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim()
});

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name too long').trim(),
  icon: z.string().max(10, 'Icon too long').default('👥'),
  memberIds: z.array(z.string().uuid('Invalid person ID')).min(1, 'At least one member required')
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name too long').trim().optional(),
  icon: z.string().max(10, 'Icon too long').optional(),
  memberIds: z.array(z.string().uuid('Invalid person ID')).optional()
});

export const createExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long').trim(),
  amount: z.number().positive('Amount must be positive').finite('Amount must be finite'),
  payerId: z.string().uuid('Invalid payer ID'),
  groupId: z.string().uuid('Invalid group ID').nullable().optional(),
  participantIds: z.array(z.string().uuid('Invalid participant ID')).min(1, 'At least one participant required'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional()
});

export const createSettlementSchema = z.object({
  fromPersonId: z.string().uuid('Invalid from person ID'),
  toPersonId: z.string().uuid('Invalid to person ID'),
  amount: z.number().positive('Amount must be positive').finite('Amount must be finite'),
  settlementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional()
}).refine(data => data.fromPersonId !== data.toPersonId, {
  message: 'From and to person must be different',
  path: ['toPersonId']
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long').trim()
});

export const importSchema = z.object({
  people: z.array(z.object({
    name: z.string().min(1).max(100)
  })),
  groups: z.array(z.object({
    name: z.string().min(1).max(100),
    icon: z.string().max(10).default('👥'),
    memberNames: z.array(z.string().min(1).max(100))
  })),
  expenses: z.array(z.object({
    description: z.string().min(1).max(200),
    amount: z.number().positive().finite(),
    payerName: z.string().min(1).max(100),
    groupName: z.string().max(100).nullable().optional(),
    participantNames: z.array(z.string().min(1).max(100)).min(1),
    expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })),
  settlements: z.array(z.object({
    fromPersonName: z.string().min(1).max(100),
    toPersonName: z.string().min(1).max(100),
    amount: z.number().positive().finite(),
    settlementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }))
});

export function validateAmountPaise(amount) {
  const paise = Math.round(amount * 100);
  if (!Number.isFinite(paise) || paise <= 0) {
    throw new Error('Invalid amount');
  }
  return paise;
}

export function formatPaiseToINR(paise) {
  return (paise / 100).toFixed(2);
}

export function parseINRToPaise(inr) {
  const num = Number(inr);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error('Invalid amount');
  }
  return Math.round(num * 100);
}