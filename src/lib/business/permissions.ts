export const ROLE_PERMISSIONS = {
  owner: {
    canViewReports: true,
    canEditTransactions: true,
    canManageAccounts: true,
    canManageSettings: true,
    canInviteMembers: true,
    canManageJournalEntries: true,
  },
  accountant: {
    canViewReports: true,
    canEditTransactions: true,
    canManageAccounts: true,
    canManageSettings: false,
    canInviteMembers: false,
    canManageJournalEntries: true,
  },
  bookkeeper: {
    canViewReports: false,
    canEditTransactions: true,
    canManageAccounts: false,
    canManageSettings: false,
    canInviteMembers: false,
    canManageJournalEntries: false,
  },
  readonly: {
    canViewReports: true,
    canEditTransactions: false,
    canManageAccounts: false,
    canManageSettings: false,
    canInviteMembers: false,
    canManageJournalEntries: false,
  },
} as const;

export function hasPermission(
  role: string,
  permission: keyof typeof ROLE_PERMISSIONS.owner
): boolean {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
    ?.[permission] ?? false;
}
