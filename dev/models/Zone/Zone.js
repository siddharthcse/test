'use strict'
/** Class representing an Zone. */
class Zone {
  /**
   * Create an Zone.
   * @param {object} model - The model object passed back from the /full payload
   */
  constructor(model) {
    this._ = {}
    for(var property in model) {
      if(model.hasOwnProperty(property)) {
        this._[property] = model[property]
      }
    }
  }

  get(prop, _default) {
    return this._[prop] !== undefined ? this._[prop] : _default
  }

  set(prop, value, constructor, _default) {
    if(value.constructor === constructor) {
      this._[prop] = value
    } else {
      this._[prop] = _default
    }
  }

  /**
   * @member {String}   Zone#entityId
   */
  get clientId() {
    return this.get('clientId', null)
  }

  set clientId(clientId) {
    this.set('clientId', clientId, String, null)
  }

  /**
   * @member {Number}   Zone#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }

  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {Number}   Zone#statusCode
   */
  get statusCode() {
    return this.get('statusCode', null)
  }

  set statusCode(statusCode) {
    this.set('statusCode', statusCode, Number, null)
  }

  /**
   * @member {Number}   Zone#zoneId
   */
  get zoneId() {
    return this.get('zoneId', null)
  }

  set zoneId(zoneId) {
    this.set('zoneId', zoneId, Number, null)
  }

  /**
   * @member {Array}   Zone#zoneDetails
   */
  get zoneDetails() {
    return this.get('zoneDetails', null)
  }

  set zoneDetails(zoneDetails) {
    this.set('zoneDetails', zoneDetails, Array, null)
  }
}

module.exports = Zone
