export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000'  // Dev local (ou ton IP Mac)
    : 'https://api.bakabi.fr',  // Production Railway
  ENDPOINTS: {
    REGISTER_TOKEN: '/register-token',
    UNREGISTER_TOKEN: '/unregister-token',
    SHIPS: '/ships',
    HEALTH: '/health'
  }
};
