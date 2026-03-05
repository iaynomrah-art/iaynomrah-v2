export * from './bot';
export * from './credential';
export * from './franchise';
export * from './platform_website';
export * from './play_history';
export * from './unit';
export * from './user_account';

export interface Database {
  public: {
    Tables: {
      bot: import('./bot').Bot;
      credential: import('./credential').Credential;
      franchise: import('./franchise').Franchise;
      platform_website: import('./platform_website').PlatformWebsite;
      play_history: import('./play_history').PlayHistory;
      units: import('./unit').Unit;
      user_account: import('./user_account').UserAccount;
    };
  };
}
