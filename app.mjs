import fs from 'fs-extra';
//import url from 'url';
import express from 'express';
import hbs from 'hbs';
import path from 'path';
import util from 'util';
// import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import DBG from 'debug';
// const debug = DBG( 'notes:debug-app' );
const error = DBG( 'notes:error-app' );

import { router as index } from './routes/index.mjs';
import { router as notes } from './routes/notes.mjs';
import { initPassport, router as users } from './routes/users.mjs';

import session from 'express-session';
import sessionFileStore from 'session-file-store';
const FileStore = sessionFileStore( session );


import { fileURLToPath } from 'url';

import createError from 'http-errors';
export const sessionCookieName = 'notescookie.sid';

const sessionSecret = 'keyboard mouse';
const sessionStore = new FileStore( {
  // eslint-disable-next-line no-undef
  path: process.env.NOTES_SESSIONS_DIR ?
    // eslint-disable-next-line no-undef
    process.env.NOTES_SESSIONS_DIR : "/tmp/sessions"
} );
// Workaround for lack of __dirname in ES6 modules
// const __dirname = path.dirname(new URL(import.meta.url).pathname);
// const __dirname = {__dirname};
const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

var app = express();
import rfs from 'rotating-file-stream';
var logStream;
// Log to a file if requested 
//cap07-loggin-Richiedi la registrazione con Morgan
// eslint-disable-next-line no-undef
if ( process.env.REQUEST_LOG_FILE ) {
  ( async () => {
    // eslint-disable-next-line no-undef
    let logDirectory = path.dirname( process.env.REQUEST_LOG_FILE );
    await fs.ensureDir( logDirectory );
    // eslint-disable-next-line no-undef
    logStream = rfs.createStream( process.env.REQUEST_LOG_FILE, {
      size: '10M', // rotate every 10 MegaBytes written
      interval: '5m', // rotate daily
      compress: 'gzip' // compress rotated files
    } );
  } )().catch( err => {
    error( 'app.js' + err );
    console.error( err );
  } );
}

/*app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );*/
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) ); /**/

app.use( session( {
  store: sessionStore,
  secret: sessionSecret,
  resave: true,
  saveUninitialized: false,
  name: sessionCookieName
} ) );
initPassport( app );

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'hbs' );
hbs.registerPartials( path.join( __dirname, 'partials' ) );

// app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));
// create a write stream
// eslint-disable-next-line no-undef
app.use( logger( process.env.REQUEST_LOG_FORMAT || 'dev', {
  // eslint-disable-next-line no-undef
  stream: logStream ? logStream : process.stdout
} ) );


// per bootstrap
// app.use('/assets/vendor/bootstrap', express.static(
//  path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use( '/assets/vendor/bootstrap/js', express.static(
  path.join( __dirname, 'node_modules', 'bootstrap', 'dist', 'js' ) ) );
app.use( '/assets/vendor/bootstrap/css', express.static(
  path.join( __dirname, 'node_modules', 'bootstrap', 'dist', 'css' ) ) );

app.use( '/assets/vendor/jquery', express.static(
  path.join( __dirname, 'node_modules', 'jquery', 'dist' ) ) );
app.use( '/assets/vendor/popper.js', express.static(
  path.join( __dirname, 'node_modules', 'popper.js', 'dist' ) ) );
//
app.use( '/assets/vendor/feather-icons', express.static(
  path.join( __dirname, 'node_modules', 'feather-icons', 'dist' ) ) );

app.use( '/', index );
app.use( '/users', users );
app.use( '/notes', notes );

// catch 404 and forward to error handler
app.use( function ( req, res, next ) {
  next( createError( 404 ) );
} );
//cap07-loggin-Uncaught exceptions (Eccezioni non rilevate)
// eslint-disable-next-line no-undef
process.on( 'uncaughtException 1', function ( err ) {
  error( "I've crashed!!! - " + ( err.stack || err ) );
} );
//cap07-loggin-Unhandled Promise rejections (Promise rifiutata)
// eslint-disable-next-line no-undef
process.on( 'unhandledRejection 1', ( reason, p ) => {
  error( `Unhandled Rejection at: ${ util.inspect( p ) } reason: ${ reason }` );
} );

//cap07-loggin-Uncaught exceptions (Eccezioni non rilevate)
if ( app.get( 'env' ) === 'development' ) {
  // eslint-disable-next-line no-unused-vars
  app.use( function ( err, req, res, next ) {
    // util.log(err.message); 
    res.status( err.status || 500 );
    error( ( err.status || 500 ) + ' ' + error.message );
    res.render( 'error', {
      message: err.message,
      error: err
    } );
  } );
}

// error handler
// eslint-disable-next-line no-unused-vars
app.use( function ( err, req, res, next ) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};

  // render the error page
  res.status( err.status || 500 );
  res.render( 'error', {
    message: err.message,
    error: err
  } );
} );
console.log( 'FINE APP.js ' );

//module.exports = app;
export default app;