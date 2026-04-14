export type UserDto = { id: string; email: string; name: string; status: string; createdAt: Date };
export type CreateUserInput = { email: string; name: string; passwordHash: string };
export type UpdateUserInput = { name?: string; status?: string };
export type ActionUserInput = Record<string, never>;
