/**
 * User Profile Entity
 * Rappresenta il profilo utente dell'app
 */
export interface UserProfile {
  id: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Factory per creare un UserProfile da dati raw
 */
export function createUserProfile(data: {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}): UserProfile {
  return {
    id: data.id,
    username: data.username ?? undefined,
    fullName: data.full_name ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    bio: data.bio ?? undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
