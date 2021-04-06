/* eslint-disable no-undef */

// import * as sqlite from "./notes-sqlite3.mjs";
import DBG from 'debug';
const debug = DBG( 'notes:model-notes' );

var NotesModule;

async function model() {
  //debug( 'modello ' + process.env.NOTES_MODEL + ' cart' + `../models/notes-${ process.env.NOTES_MODEL }` );
  //debug( 'modello2' + process.env.NOTES_MODEL + ' restituisco il modello ' );

  if ( NotesModule ) return NotesModule;
  // NotesModule = await import(`./notes-${process.env.NOTES_MODEL}`);
  NotesModule = await import( `../models/notes-${ process.env.NOTES_MODEL }.mjs` );
  //NotesModule = sqlite;
  return NotesModule;
}

export async function create( key, title, body ) {
  return ( await model() ).create( key, title, body );
}
export async function update( key, title, body ) {
  return ( await model() ).update( key, title, body );
}
export async function read( key ) {
  debug( 'leggo la nota' );
  return ( await model() ).read( key );
}
export async function destroy( key ) {
  return ( await model() ).destroy( key );
}
export async function keylist() {
  debug( 'estraggo la lista' );
  return ( await model() ).keylist();
}
export async function count() {
  return ( await model() ).count();
}
export async function close() {
  return ( await model() ).close();
}