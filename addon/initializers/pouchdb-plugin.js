import PouchDB from 'pouchdb';
import RelationalPouch from 'relational-pouch';
import Find from 'pouchdb-find';

export function initialize() {
  PouchDB
    .plugin(RelationalPouch)
    .plugin(Find);
}

export default {
  name: 'pouchdb-plugin',
  initialize
};
