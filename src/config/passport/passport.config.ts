import passport from 'passport';

import googleStrategy from 'src/config/passport/strategy/googleStrategy';
import jwtStrategy from 'src/config/passport/strategy/jwtStrategy';

// Configuration des stratégies d'authentification
passport.use( 'jwt', jwtStrategy ); // Utilisation de la stratégie locale d'authentification
passport.use( 'google', googleStrategy ); // Utilisation de la stratégie Google OAuth2

export default passport; // Export de la configuration Passport.js
