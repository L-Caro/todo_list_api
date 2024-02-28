import morgan from 'morgan';
import 'colors';

// Config Morgan pour le formatage des messages dans la console.
export const morganConfig = morgan( ( tokens, req, res ) => {

  if (
    (res.statusCode === (304 || 200) && !req.url?.match( /\.(css|scss|png|jpg|jpeg|gif|webp|svg|ico)$/ )) ||
    res.statusCode !== 304
  ) {

    const method = tokens.method( req, res );
    const status = tokens.status( req, res );
    const url = tokens.url( req, res );
    const responseTime = tokens[ 'response-time' ]( req, res ) + ' ms';

    // Choix des couleurs en fonction du code de statut
    let statusColor;

    if ( res.statusCode >= 500 ) {
      statusColor = status?.red.bold;
    } else if ( res.statusCode >= 400 ) {
      statusColor = status?.yellow.bold;
    } else if ( res.statusCode >= 300 ) {
      statusColor = status?.blue.bold;
    } else {
      statusColor = status?.green.bold;
    }
    // Formatage de la date
    const date = new Date().toLocaleString();

    // Construction de la chaîne de log
    return [
      date.grey, // La date en gris
      method?.green.bold,
      statusColor,
      url,
      responseTime.magenta
    ].join( ' ' );
  }
  return null;
} );
