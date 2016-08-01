'use strict'
/** Class representing a Path. */
class Path {
  /**
   * Create an Path.
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
   * @member {Boolean}   Path#defaultWeight
   */
  get defaultWeight() {
    return this.get('defaultWeight', false)
  }
  set defaultWeight(defaultWeight) {
    this.set('defaultWeight', defaultWeight, Boolean, false)
  }

  /**
   * @member {Number}   Path#direction
   */
  get direction() {
    return this.get('direction', null)
  }
  set direction(direction) {
    this.set('direction', direction, Number, null)
  }

  /**
   * @member {Number}   Path#id
   */
  get id() {
    return this.get('id', null)
  }
  set id(id) {
    this.set('id', id, Number, null)
  }

  /**
   * @member {Number}   Path#localId
   */
  get localId() {
    return this.get('localId', null)
  }
  set localId(localId) {
    this.set('localId', localId, Number, null)
  }

  /**
   * @member {String}   Path#name
   */
  get name() {
    return this.get('name', '')
  }
  set name(name) {
    this.set('name', name, String, '')
  }

  /**
   * @member {Number}   Path#status
   */
  get status() {
    return this.get('status', null)
  }
  set status(status) {
    this.set('status', status, Number, null)
  }

  /**
   * @member {Number}   Path#type
   */
  get type() {
    return this.get('type', null)
  }
  set type(type) {
    this.set('type', type, Number, null)
  }

  /**
   * @member {Array}   Path#waypoints
   */
  get waypoints() {
    return this.get('waypoints', [])
  }
  set waypoints(waypoints) {
    this.set('waypoints', waypoints, Array, [])
  }

  /**
   * @member {Number}   Path#weight
   */
  get weight() {
    return this.get('weight', null)
  }
  set weight(weight) {
    this.set('weight', weight, Number, null)
  }
}

module.exports = Path
