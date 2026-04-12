// frontend/features/admin/admin.types.ts

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}