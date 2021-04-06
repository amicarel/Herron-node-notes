import util from 'util';
import express from 'express';
import passport from 'passport';
import passportLocal from 'passport-local';
//import path from 'path';
import * as usersModel from '../models/users-superagent.mjs';
import { sessionCookieName } from '../app.mjs';

const LocalStrategy = passportLocal.Strategy;

export const router = express.Router();

import DBG from 'debug';
const debug = DBG( 'notes:router-users' );
const error = DBG( 'notes:error-users' );

export function initPassport( app ) {
  app.use( passport.initialize() );
  app.use( passport.session() );
}

export default function ensureAuthenticated( req, res, next ) {
  try {
    // req.user is set by Passport in the deserialize function 
    if ( req.user ) next();
    else res.redirect( '/users/login' );
  } catch ( e ) {
    next( e );
  }
}

router.get( '/login', function ( req, res, next ) {
  try {
    res.render( 'login', {
      title: "Login to Notes",
      user: req.user,
    } );
  } catch ( e ) {
    error( `/login ERROR ${ e.stack }` );
    next( e );
  }
} );

router.post( '/login',
  passport.authenticate( 'local', {
    successRedirect: '/', // SUCCESS: Go to home page 
    failureRedirect: 'login' // FAIL: Go to /user/login 
  }
  ) );
/* , function ( err, req, res, next ) {
  if ( err ) next( err );
  debug( `route post /login (${ req }, ${ res })` );
  next();
} */
router.get( '/logout', function ( req, res, next ) {
  try {
    req.session.destroy();
    req.logout();
    res.clearCookie( sessionCookieName );
    res.redirect( '/' );
  } catch ( e ) {
    next( e );
  }
} );

passport.use( new LocalStrategy(
  async ( username, password, done ) => {
    try {
      debug( `LocalStrategy: uso l'agente userPasswordCheck per chiamare il server user (${ username }, ${ password })` );
      var check = await usersModel.userPasswordCheck( username, password );
      if ( check.check ) {
        // verrà chiamato serializeUser per registrare username nella sessione e settare il cookie
        done( null, {
          id: check.username,
          username: check.username,
          prova: 'prova'
        } );
        debug( `LocalStrategy: l'agente userPasswordCheck shows good user ${ util.inspect( check ) }` );
      } else {
        debug( `LocalStrategy userPasswordCheck shows BAD user ${ util.inspect( check ) }` );
        done( null, false, check.message );
      }
    } catch ( e ) {
      error( `LocalStrategy userPasswordCheck shows ERROR ${ e.stack }` );
      done( e );
    }
  }
) );

passport.serializeUser( function ( user, done ) {
  try {
    done( null, user.username );
    debug( `serializeUser ${ util.inspect( user ) }` );
  } catch ( e ) {
    error( `serializeUser ERROR ${ e.stack }` );
    done( e );
  }
} );

passport.deserializeUser( async ( username, done ) => {
  try {
    var user = await usersModel.find( username );
    done( null, user );
    debug( `deserializeUser ${ util.inspect( username ) }` );
  } catch ( e ) {
    error( `deserializeUser ERROR ${ e.stack }` );
    done( e );
  }
} );