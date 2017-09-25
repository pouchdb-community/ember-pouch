import Ember from "ember";

class OperationsWaiter {
  constructor() {
    this._pendingOperations = 0;

    if (Ember.testing) {
      this._registerWaiter();
    }
  }

  incrementPendingOps() {
    this._pendingOperations++;
  }

  decrementPendingOps() {
    this._pendingOperations--;
  }

  _shouldContinue() {
    return this._pendingOperations === 0;
  }

  _registerWaiter() {
    Ember.Test.registerWaiter(() => this._shouldContinue());
  }
}

export { OperationsWaiter as default };
