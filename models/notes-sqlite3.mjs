import DBG from 'debug';
import Note from './note.mjs';
import sqlite3 from 'sqlite3';

const debug = DBG( 'notes:notes-sqlite3' );
const error = DBG( 'notes:error-sqlite3' );

var db; // store the database connection here 

async function connectDB() {

    if ( db ) return db;
    var dbfile = process.env.SQLITE_FILE || "notes.sqlite3";
    debug( 'richiesta sqlite db ' + dbfile );
    await new Promise( ( resolve, reject ) => {
        db = new sqlite3.Database( dbfile,
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            err => {
                if ( err ) return reject( err );
                resolve( db );
            } );
    } );
    return db;
}

export async function create( key, title, body ) {
    var db = await connectDB();
    var note = new Note( key, title, body );
    await new Promise( ( resolve, reject ) => {
        db.run( "INSERT INTO notes ( notekey, title, body) " +
            "VALUES ( ?, ? , ? );", [ key, title, body ], err => {
                if ( err ) return reject( err );
                resolve( note );
            } );
    } );
    return note;
}

export async function update( key, title, body ) {
    var db = await connectDB();
    debug( 'update key:' + key );
    var note = new Note( key, title, body );
    await new Promise( ( resolve, reject ) => {
        db.run( "UPDATE notes " +
            "SET title = ?, body = ? WHERE notekey = ?",
            [ title, body, key ], err => {
                if ( err ) return reject( err );
                resolve( note );
            } );
    } );
    return note;
}

export async function read( key ) {
    var db = await connectDB();
    var note = await new Promise( ( resolve, reject ) => {
        db.get( "SELECT * FROM notes WHERE notekey = ?", [ key ], ( err, row ) => {
            if ( err ) return reject( err );
            const note = new Note( row.notekey, row.title, row.body );
            resolve( note );
        } );
    } );
    return note;
}

export async function destroy( key ) {
    var db = await connectDB();
    return await new Promise( ( resolve, reject ) => {
        db.run( "DELETE FROM notes WHERE notekey = ?;", [ key ], err => {
            if ( err ) return reject( err );
            resolve();
        } );
    } );
}

export async function keylist() {
    debug( 'lista key' );
    var db = await connectDB();
    var keyz = await new Promise( ( resolve, reject ) => {
        // var keyz = [];
        db.all( "SELECT notekey FROM notes", ( err, rows ) => {
            if ( err ) return reject( err );
            resolve( rows.map( row => row.notekey ) );
        } );
    } );
    return keyz;
}

export async function count() {
    var db = await connectDB();
    var count = await new Promise( ( resolve, reject ) => {
        db.get( "select count(notekey) as count from notes", ( err, row ) => {
            if ( err ) return reject( err );
            resolve( row.count );
        } );
    } );
    return count;
}

export async function close() {
    var _db = db;
    db = undefined;
    return _db ? new Promise( ( resolve, reject ) => {
        _db.close( err => {
            if ( err ) reject( err );
            else resolve();
        } );
    } ) : undefined;
}