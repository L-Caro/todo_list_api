import dotenv from 'dotenv';

import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import * as process from 'process';

import app from './app';


dotenv.config();

// Redirection http vers https
http.createServer( ( req, res ) => {
  res.writeHead( 301, { Location: `https://${ req.headers.host }${ req.url }` } );
  res.end();
} ).listen( 80 );

let server;
if ( process.env.NODE_ENV?.trim() === 'production' ) {
  server = https.createServer( {
    // key: fs.readFileSync('/etc/letsencrypt/live/www.lionelcaro.fr/privkey.pem'), // En production sur le VPS
    // cert: fs.readFileSync('/etc/letsencrypt/live/www.lionelcaro.fr/fullchain.pem'), // En production sur le VPS
    key: fs.readFileSync( path.join( __dirname, '../ssl/local.key' ) ), // En production locale
    cert: fs.readFileSync( path.join( __dirname, '../ssl/local.crt' ) ) // En production locale
  }, app );
} else {
  server = https.createServer( {
    key: fs.readFileSync( path.join( __dirname, '../ssl/local.key' ) ),
    cert: fs.readFileSync( path.join( __dirname, '../ssl/local.crt' ) )
  }, app );
}

// === Lancement de l'app ===
const port = process.env.NODE_ENV?.trim() === 'production' ? 443 : 3000;

server.listen( port || 3000 );
console.log( '🟢 en écoute sur le port ' + port );
