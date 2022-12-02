'use strict';

const
	CalendarCache = require('modules/%ModuleName%/js/Cache.js')
;

module.exports = {
	getIntDecision(sDecision) {
		switch (sDecision) {
			case Enums.IcalConfig.Accepted: return Enums.IcalConfigInt.Accepted;
			case Enums.IcalConfig.Tentative: return Enums.IcalConfigInt.Tentative;
			case Enums.IcalConfig.Declined: return Enums.IcalConfigInt.Declined;
			default: return Enums.IcalConfigInt.NeedsAction;
		}
	},

	markIcalInCache(sDecision, uid) {
		switch (sDecision) {
			case Enums.IcalConfig.Accepted:
				CalendarCache.markIcalAccepted(uid);
				break;
			case Enums.IcalConfig.Tentative:
				CalendarCache.markIcalTentative(uid);
				break;
			case Enums.IcalConfig.Declined:
				CalendarCache.markIcalNonexistent(uid);
				break;
		}
	}
};
