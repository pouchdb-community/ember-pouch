import {Model} from 'ember-pouch';
import config from 'dummy/config/environment';

export default Model.extend({
	init() {
		this._super(...arguments);
		this.eachRelationship((name, rel) => {
			rel.options.async = config.emberpouch.async;
			rel.options.dontsave = config.emberpouch.dontsave;
		});
	},
});
