import { auth } from '@/../auth';
import { isAdmin, isStaff } from '@/lib/permissions';

export class ApiAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireStaffSession() {
  const session = await auth();

  if (!session?.user) {
    throw new ApiAuthError('Unauthorized.', 401);
  }

  if (!isStaff(session.user.role)) {
    throw new ApiAuthError('Forbidden.', 403);
  }

  return session;
}

export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user) {
    throw new ApiAuthError('Unauthorized.', 401);
  }

  if (!isAdmin(session.user.role)) {
    throw new ApiAuthError('Forbidden.', 403);
  }

  return session;
}
