'use strict'
/** Class representing an Device. */
class Device {
  /**
   * Create an Device.
   * @param {object} model - The model object passed back from the /full payload
   */
  constructor(model) {
    this._ = {
      waypoints: []
    }
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
   * @member {String}   Device#description
   */
  get description() {
    return this.get('description', '')
  }

  set description(description) {
    this.set('description', description, String, '')
  }

  /**
   * @member {String}   Device#deviceTypeDescription
   */
  get deviceTypeDescription() {
    return this.get('deviceTypeDescription', '')
  }

  set deviceTypeDescription(deviceTypeDescription) {
    this.set('deviceTypeDescription', deviceTypeDescription, String, '')
  }

  /**
   * @member {Number}   Device#deviceTypeId
   */
  get deviceTypeId() {
    return this.get('deviceTypeId', null)
  }

  set deviceTypeId(deviceTypeId) {
    this.set('deviceTypeId', deviceTypeId, Number, null)
  }

  /**
   * @member {String}   Device#heading
   */
  get heading() {
    return this.get('heading', '')
  }

  set heading(heading) {
    this.set('heading', heading, String, '')
  }

  /**
   * @member {Number}   Device#id
   */
  get id() {
    return this.get('id', null)
  }

  set id(id) {
    this.set('id', id, Number, null)
  }

  /**
   * @member {Number}   Device#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }

  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {String}   Device#status
   */
  get status() {
    return this.get('status', '')
  }

  set status(status) {
    this.set('status', status, String, '')
  }

  /**
   * @member {Array}   Destination#waypoints
   */
  get waypoints() {
    return this.get('waypoints', [])
  }

  set waypoints(waypoints) {
    this.set('waypoints', waypoints, Array, [])
  }

}

module.exports = Device
