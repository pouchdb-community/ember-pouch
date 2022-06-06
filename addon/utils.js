import { getOwner } from '@ember/application';

// ember-data doesn't like getting a json response of {deleted: true}
export function extractDeleteRecord() {
  return null;
}

//should this take a config?
export function shouldSaveRelationship(container, relationship) {
  if (typeof relationship.options.save !== 'undefined')
    return relationship.options.save;

  if (relationship.kind === 'belongsTo') return true;

  //TODO: save default locally? probably on container?
  let saveDefault = configFlagEnabled(container, 'saveHasMany'); //default is false if not specified

  return saveDefault;
}

export function configFlagDisabled(container, key) {
  //default is on
  let config = getOwner(container).resolveRegistration('config:environment');
  let result =
    config['emberPouch'] &&
    typeof config['emberPouch'][key] !== 'undefined' &&
    !config['emberPouch'][key];

  return result;
}

export function configFlagEnabled(container, key) {
  //default is off
  let config = getOwner(container).resolveRegistration('config:environment');
  let result = config['emberPouch'] && config['emberPouch'][key];

  return result;
}
