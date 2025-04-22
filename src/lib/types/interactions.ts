export enum ContentType {
  PROJECT = 'project',
}

export interface InteractionState {
  likes: Record<string, boolean>;
  follows: Record<string, boolean>;
  userEmail?: string;
  initialized: boolean;
}

export interface FollowResult {
  success: boolean;
  needsEmail: boolean;
  newState: boolean;
}
