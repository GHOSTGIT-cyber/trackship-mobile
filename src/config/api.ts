export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000'  // Dev local (ou ton IP Mac)
    : 'https://trackship-backend-production.up.railway.app',  // Production Railway
  // TODO : Changer pour https://api.bakabi.fr quand DNS propagé

  ENDPOINTS: {
    REGISTER_TOKEN: '/register-token',
    UNREGISTER_TOKEN: '/unregister-token',
    SHIPS: '/ships',
    HEALTH: '/health'
  }
};
