// ember-data doesn't like getting a json response of {deleted: true}
function extractDeleteRecord() {
  return null;
}

export { extractDeleteRecord };