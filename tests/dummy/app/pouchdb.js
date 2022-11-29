import PouchDB from 'pouchdb-core';
import PouchDBFind from 'pouchdb-find';
import PouchDBRelational from 'relational-pouch';
import indexeddb from 'pouchdb-adapter-indexeddb';
import HttpPouch from 'pouchdb-adapter-http';
import mapreduce from 'pouchdb-mapreduce';
import replication from 'pouchdb-replication';

PouchDB.plugin(PouchDBFind)
  .plugin(PouchDBRelational)
  .plugin(indexeddb)
  .plugin(HttpPouch)
  .plugin(mapreduce)
  .plugin(replication);

export default PouchDB;
