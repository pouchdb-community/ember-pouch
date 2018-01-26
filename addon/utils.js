import Ember from 'ember';

// ember-data doesn't like getting a json response of {deleted: true}
export function extractDeleteRecord() {
  return null;
}

//should this take a config?
export function shouldSaveRelationship(container, relationship) {
  if (typeof relationship.options.save !== "undefined")
    return relationship.options.save;
  
  if (relationship.kind === 'belongsTo') return true;
  
  //TODO: save default locally? probably on container?
  let config = Ember.getOwner(container).resolveRegistration('config:environment');
  let saveDefault = config['emberPouch'] && config['emberPouch']['saveHasMany'];
  //default is false if not specified
  
  return saveDefault;
}
