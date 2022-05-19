import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBRelational from 'relational-pouch';

PouchDB.plugin(PouchDBFind).plugin(PouchDBRelational);

export default PouchDB;
