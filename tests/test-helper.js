import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';

import QUnit from 'qunit';

setResolver(resolver);
QUnit.config.testTimeout = 10000;
