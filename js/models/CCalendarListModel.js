'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	Storage = require('%PathToCoreWebclientModule%/js/Storage.js'),
	
	CCalendarModel = require('modules/%ModuleName%/js/models/CCalendarModel.js')
;

/**
 * @param {Object} oParameters
 * @constructor
 */
function CCalendarListModel(oParameters)
{
	this.parentOnCalendarActiveChange = oParameters.onCalendarActiveChange;
	this.parentOnCalendarCollectionChange = oParameters.onCalendarCollectionChange;
	
	this.defaultCal = ko.observable(null);
	this.currentCal = ko.observable(null);
	
	this.collection = ko.observableArray([]);
	this.collection.subscribe(function () {
		this.pickCurrentCalendar(this.defaultCal());
		
		if (this.parentOnCalendarCollectionChange)
		{
			this.parentOnCalendarCollectionChange();
		}
	}, this);
	this.count = ko.computed(function () {
		return this.collection().length;
	}, this);
	
	this.own = ko.computed(function () {
		var 
			calendars = _.filter(this.collection(), 
				function(oItem){ return (!oItem.isShared()); 
			})
		;
		return calendars;
	}, this);
	this.ownCount = ko.computed(function () {
		return this.own().length;
	}, this);
	this.shared = ko.computed(function () {
		var 
			calendars = _.filter(this.collection(), 
				function(oItem){ return (oItem.isShared() && !oItem.isSharedToAll()); 
			})
		;
		return calendars;
	}, this);
	this.sharedToAll = ko.computed(function () {
		var 
			calendars = _.filter(this.collection(), 
				function(oItem){ return (oItem.isShared() && oItem.isSharedToAll()); 
			})
		;
		return calendars;
	}, this);
	this.ids = ko.computed(function () {
		return _.map(this.collection(), function (oCalendar){
			return oCalendar.id;
		}, this);
	}, this);

	this.hasSharedCalendars = ko.computed(function () {
		return this.shared().length > 0 || this.sharedToAll().length > 0;
	}, this);
	this.showSharedCalendars = ko.observable(Storage.getData('showSharedCalendars') === '1');
	this.showSharedCalendars.subscribe(function () {
		Storage.setData('showSharedCalendars', this.showSharedCalendars() === true ? '1' : '0');
	}, this);
	this.hasSharedCalendars.subscribe(function () {
		if (!this.hasSharedCalendars()) {
			this.showSharedCalendars(false);
		}
	}, this);
	this.search = ko.observable('');
	this.filteredShared = ko.computed(function () {
		return this.getFilteredCalendars(this.shared());
	}, this);
	this.filteredSharedToAll = ko.computed(function () {
		return this.getFilteredCalendars(this.sharedToAll());
	}, this);
}

CCalendarListModel.prototype.getFilteredCalendars = function (calendars) {
	if (this.search() === '') {
		return calendars;
	}
	return calendars.filter(calendar => {
		const
			name = calendar.name().toLowerCase(),
			owner = calendar.owner().toLowerCase(),
			search = this.search().toLowerCase()
		;
		return name.indexOf(search) !== -1 || owner.indexOf(search) !== -1;
	});
};

/**
 * @param {Object=} pickedCalendar
 */
CCalendarListModel.prototype.pickCurrentCalendar = function (pickedCalendar)
{
	const isCalendarEditableAndActive = cal => cal.active() && cal.isEditable() && !cal.subscribed();
	if (!this.currentCal() || !isCalendarEditableAndActive(this.currentCal())) {
		if (pickedCalendar && isCalendarEditableAndActive(pickedCalendar)) {
			this.currentCal(pickedCalendar);
		} else if (this.defaultCal() && isCalendarEditableAndActive(this.defaultCal())) {
			this.currentCal(this.defaultCal());
		} else {
			let firstEditableCalendar = this.collection().find(isCalendarEditableAndActive);
			if (!firstEditableCalendar) {
				firstEditableCalendar = this.collection().find(cal => cal.isEditable() && !cal.subscribed());
			}
			if (firstEditableCalendar) {
				this.currentCal(firstEditableCalendar);
			}
		}
	}
};

/**
 * @param {string} sCalendarId
 */
CCalendarListModel.prototype.getCalendarById = function (sCalendarId)
{
	return _.find(this.collection(), function(oCalendar) {
		return oCalendar.id === sCalendarId;
	}, this);
};

/**
 * @param {Object=} oStart
 * @param {Object=} oEnd
 * @return {Array}
 */
CCalendarListModel.prototype.getEvents = function (oStart, oEnd)
{
	var
		aCalendarsEvents = [],
		aCalendarEvents = []
	;
	
	_.each(this.collection(), function (oCalendar) {
		if (oCalendar && oCalendar.active())
		{
			if (oStart && oEnd)
			{
				aCalendarEvents = oCalendar.getEvents(oStart, oEnd);
			}
			else
			{
				aCalendarEvents = oCalendar.events();
			}
			aCalendarsEvents = _.union(aCalendarsEvents, aCalendarEvents);
		}
	}, this);

	return aCalendarsEvents;
};

/**
 * @param {Object} oCalendarData
 * 
 * @return {Object}
 */
CCalendarListModel.prototype.parseCalendar = function (oCalendarData)
{
	var	oCalendar = new CCalendarModel();
	oCalendar.parse(oCalendarData);
	
	return oCalendar;
};
	
/**
 * @param {Object} oCalendarData
 * 
 * @return {Object}
 */
CCalendarListModel.prototype.parseAndAddCalendar = function (oCalendarData)
{
	var
		mIndex = 0,
		oClientCalendar = null,
		oCalendar = this.parseCalendar(oCalendarData)
	;
	
	oCalendar.active.subscribe(function (value) {
		this.parentOnCalendarActiveChange(oCalendar);
		var oPickCalendar = oCalendar.active() ? oCalendar : this.defaultCal();
		this.pickCurrentCalendar(oPickCalendar);
		Storage.setData(oCalendar.id, value);
	}, this);
	
	if (oCalendar.isDefault)
	{
		this.defaultCal(oCalendar);
	}
	
	mIndex = this.calendarExists(oCalendar.id);
	if (mIndex || mIndex === 0)
	{
		oClientCalendar = this.getCalendarById(oCalendar.id);
		oCalendar.events(oClientCalendar.events());
		this.collection.splice(mIndex, 1, oCalendar);
		
	}
	else
	{
		this.collection.push(oCalendar);
	}
	
	//this.sort();
	
	return oCalendar;
};

/**
 * @param {string|number} sId
 * 
 * @return {?}
 */
CCalendarListModel.prototype.calendarExists = function (sId)
{
	var iIndex = _.indexOf(_.map(this.collection(), function(oItem){return oItem.id;}), sId);
	
	return (iIndex < 0) ? false : iIndex;
};

/**
 * @param {string} sId
 */
CCalendarListModel.prototype.removeCalendar = function (sId)
{
	this.collection(_.filter(this.collection(), function(oCalendar) {
		return oCalendar.id !== sId;
	}, this));
};


CCalendarListModel.prototype.clearCollection = function ()
{
	this.collection.removeAll();
};

CCalendarListModel.prototype.getColors = function ()
{
	return _.map(this.collection(), function (oCalendar) {
		return oCalendar.color().toLowerCase();
	}, this);
};

/**
 * @param {string} sId
 */
CCalendarListModel.prototype.setDefault = function (sId)
{
	_.each(this.collection(), function(oCalendar) {
		if (oCalendar.id !== sId)
		{
			oCalendar.isDefault = true;
			this.defaultCal(oCalendar);
		}
		else
		{
			oCalendar.isDefault = false;
		}
	}, this);
};

CCalendarListModel.prototype.sort = function ()
{
	var collection = _.sortBy(this.collection(), function(oCalendar){return oCalendar.name();});
	this.collection(_.sortBy(collection, function(oCalendar){return oCalendar.isShared();}));
};

/**
 * @param {Array} aIds
 */
CCalendarListModel.prototype.expunge = function (aIds)
{
	this.collection(_.filter(this.collection(), function(oCalendar) {
		return _.include(aIds, oCalendar.id);
	}, this));
};

module.exports = CCalendarListModel;
