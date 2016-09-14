import Ember from 'ember';

export function promiseToRunLater(callback, timeout) {
  return new Ember.RSVP.Promise((resolve) => {
    Ember.run.later(() => {
      callback();
      resolve();
    }, timeout);
  });
}

