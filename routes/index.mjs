import * as notes from '../models/notes.mjs';

import DBG from 'debug';
import express from 'express';
import util from 'util';

const debug = DBG( 'notes:debug-index' );
const error = DBG( 'notes:error-index' );
export const router = express.Router();

/* GET home page. */

router.get( '/', async ( req, res, next ) => {
  try {
    let keylist = await notes.keylist();
    debug( `route get / keylist ${ util.inspect( keylist ) }` );
    let keyPromises = await keylist.map( key => {
      debug( `key ${ key }- ${ notes.read( key ) }` );
      return notes.read( key )
    } );
    debug( `keyPromises ${ keyPromises }` );
    let notelist = await Promise.all( keyPromises );
    debug( `notelist ${ util.inspect( notelist ) }` );
    // debug( `route get / req ${ util.inspect( req ) }` );
    debug( `route get / req.user = ${ util.inspect( req.user ) }` );
    res.render( 'index', {
      title: 'Notes',
      notelist: notelist,
      user: req.user ? req.user : undefined
    } );
  } catch ( e ) {
    error( `INDEX FAIL ${ e }` );
    next( e )
  }

} );

// module.exports = router;