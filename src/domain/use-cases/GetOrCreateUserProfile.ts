import { UserProfile } from '../entities/UserProfile';
import { IUserProfileRepository } from '../repositories/IUserProfileRepository';

export class GetOrCreateUserProfile {
  constructor(private userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    // Ottiene il profilo utente, o lo crea se non esiste
    let profile = await this.userProfileRepository.getById(userId);

    if (!profile) {
      profile = await this.userProfileRepository.create({
        id: userId,
        role: 'user', // Default role for new users
        createdAt: new Date(),
        // updatedAt viene gestito dal repository/database
      });
    }

    return profile;
  }
}
