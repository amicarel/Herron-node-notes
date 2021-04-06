import DBG from 'debug';
import request from 'superagent';
import url from 'url';
import util from 'util';

const URL = url.URL;
const debug = DBG( 'notes:users-superagent' );
const error = DBG( 'notes:error-superagent' );

function reqURL( path ) {
    // eslint-disable-next-line no-undef
    const requrl = new URL( process.env.USER_SERVICE_URL );
    requrl.pathname = path;
    return requrl.toString();
}

export async function create( username, password,
    provider, familyName, givenName, middleName,
    emails, photos ) {
    var res = await request
        .post( reqURL( '/create-user' ) )
        .send( {
            username,
            password,
            provider,
            familyName,
            givenName,
            middleName,
            emails,
            photos
        } )
        .set( 'Content-Type', 'application/json' )
        .set( 'Acccept', 'application/json' )
        .auth( 'them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' );
    return res.body;
}

export async function update( username, password,
    provider, familyName, givenName, middleName,
    emails, photos ) {
    var res = await request
        .post( reqURL( `/update-user/${ username }` ) )
        .send( {
            username,
            password,
            provider,
            familyName,
            givenName,
            middleName,
            emails,
            photos
        } )
        .set( 'Content-Type', 'application/json' )
        .set( 'Acccept', 'application/json' )
        .auth( 'them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' );
    return res.body;
}

export async function find( username ) {
    var res = await request
        .get( reqURL( `/find/${ username }` ) )
        .set( 'Content-Type', 'application/json' )
        .set( 'Acccept', 'application/json' )
        .auth( 'them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' );
    return res.body;
}

export async function userPasswordCheck( username, password ) {
    debug( `Invio i dati al server user /userPasswordCheck1(${ username }, ${ password })` );
    debug( `userPasswordCheck2(${ reqURL( '/passwordCheck' ) })` );
    try {
        var res = await request
            .post( reqURL( `/passwordCheck` ) )
            .send( {
                username,
                password
            } )
            .set( 'Content-Type', 'application/json' )
            .set( 'Acccept', 'application/json' )
            .auth( 'them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' );
        debug( `risposta del server user userPasswordCheck3(${ util.inspect( res.body ) })` );
        return res.body;
    } catch ( e ) {
        error( `users userPasswordCheck ERROR ${ e.stack }` );
        throw e;
    }
}

export async function findOrCreate( profile ) {
    var res = await request
        .post( reqURL( '/find-or-create' ) )
        .send( {
            username: profile.id,
            password: profile.password,
            provider: profile.provider,
            familyName: profile.familyName,
            givenName: profile.givenName,
            middleName: profile.middleName,
            emails: profile.emails,
            photos: profile.photos
        } )
        .set( 'Content-Type', 'application/json' )
        .set( 'Acccept', 'application/json' )
        .auth( 'them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' );
    return res.body;
}

export async function listUsers() {
    var res = await request
        .get( reqURL( '/list' ) )
        .set( 'Content-Type', 'application/json' )
        .set( 'Acccept', 'application/json' )
        .auth( 'them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' );
    return res.body;
}