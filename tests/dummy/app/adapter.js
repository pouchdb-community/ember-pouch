import {Adapter} from 'ember-pouch';
import config from 'dummy/config/environment';

export default Adapter.extend({
	_init(store, type) {
		type.eachRelationship((name, rel) => {
			rel.options.async = config.emberpouch.async;
			if (rel.kind === 'hasMany') {
				rel.options.dontsave = config.emberpouch.dontsavehasmany;
			}
		});
		this._super(...arguments);
	},
});
