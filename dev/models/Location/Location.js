'use strict'
/** Class representing an Location. */
class Location {
  /**
   * Create an Location.
   * @param {object} model - The model object passed back from the /full payload
   *
   */
  constructor(model) {
    this._ = {};
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
   * @member {Array}   Location#addresses
   */
  get addresses() {
    return this.get('addresses', [])
  }

  set addresses(addresses) {
    this.set('addresses', addresses, Array, [])
  }

  /**
   * @member {Number}  Location#clientProjectId
   */
  get clientProjectId() {
    return this.get('clientProjectId', '')
  }

  set clientProjectId(clientProjectId) {
    this.set('clientProjectId', clientProjectId, String, [])
  }

  /**
   * @member {Array}   Location#languages
   */
  get languages() {
    return this.get('languages', [])
  }

  set languages(languages) {
    this.set('languages', languages, Array, [])
  }

  /**
   * @member {Number}  Location#locationId
   */
  get locationId() {
    return this.get('locationId', null)
  }

  set locationId(locationId) {
    this.set('locationId', locationId, Number, null)
  }

  /**
   * @member {String}  Location#locationName
   */
  get locationName() {
    return this.get('locationName', '')
  }

  set locationName(locationName) {
    this.set('locationName', locationName, String, '')
  }

  /**
   * @member {String}  Location#name
   */
  get name() {
    return this.get('name', '')
  }

  set name(name) {
    this.set('name', name, String, '')
  }

  /**
   * @member {Number}  Location#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }

  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {String}  Location#status
   */
  get status() {
    return this.get('status', '')
  }

  set status(status) {
    this.set('status', status, String, '')
  }

}

// Location._items = []
module.exports = Location
