import { UserInteraction, InteractionType } from '../entities/UserInteraction';
import { IUserInteractionRepository } from '../repositories/IUserInteractionRepository';

export class SaveUserInteraction {
  constructor(private interactionRepository: IUserInteractionRepository) {}

  async execute(
    userId: string,
    bookLineId: string,
    interactionType: InteractionType
  ): Promise<UserInteraction> {
    // Salva l'interazione dell'utente (like/dislike/skip)
    const interaction = await this.interactionRepository.saveInteraction(
      userId,
      bookLineId,
      interactionType
    );
    return interaction;
  }
}
