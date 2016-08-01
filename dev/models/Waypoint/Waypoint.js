'use strict'
const AssociationCollection = require('../Association/AssociationCollection')

/** Class representing a Waypoint. */
class Waypoint {
  /**
   * Create a Waypoint.
   * @param {object} model - The model object passed back from the /full payload
   */
  constructor(model) {
    this._ = {}

    this.AssociationCollection = new AssociationCollection()

    for(var property in model) {
      if(model.hasOwnProperty(property)) {
        if(property == 'associations') {
          this.AssociationCollection.create(model[property])
        } else {
          this._[property] = model[property]
        }
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
   * @member {AssociationCollection}   Waypoint#AssociationCollection
   */
  get AssociationCollection() {
    return this.get('AssociationCollection', null)
  }

  set AssociationCollection(collection) {
    this.set('AssociationCollection', collection, AssociationCollection, null)
  }

  /**
   * @member {Number}   Waypoint#decisionPoint
   */
  get decisionPoint() {
    return this.get('decisionPoint', null)
  }
  set decisionPoint(decisionPoint) {
    this.set('decisionPoint', decisionPoint, Number, null)
  }

  /**
   * @member {Number}   Waypoint#id
   */
  get id() {
    return this.get('id', null)
  }
  set id(id) {
    this.set('id', id, Number, null)
  }

  /**
   * @member {Number}   Waypoint#localId
   */
  get localId() {
    return this.get('localId', null)
  }
  set localId(localId) {
    this.set('localId', localId, Number, null)
  }

  /**
   * @member {Number}   Waypoint#mapId
   */
  get mapId() {
    return this.get('mapId', null)
  }
  set mapId(mapId) {
    this.set('mapId', mapId, Number, null)
  }

  /**
   * @member {Number}   Waypoint#status
   */
  get status() {
    return this.get('status', null)
  }
  set status(status) {
    this.set('status', status, Number, null)
  }

  /**
   * @member {Number}   Waypoint#x
   */
  get x() {
    return this.get('x', 0)
  }
  set x(x) {
    this.set('x', x, Number, 0)
  }

  /**
   * @member {Number}   Waypoint#y
   */
  get y() {
    return this.get('y', 0)
  }
  set y(y) {
    this.set('y', y, Number, 0)
  }

  /**
   * @member {Array}   Waypoint#point - x/y coordinates inside array [x, y]
   */
  get point() {
    return [this.x, this.y]
  }

  /**
   * @member {Number}   Waypoint#zoneId
   */
  get zoneId() {
    return this.get('zoneId', null)
  }
  set zoneId(zoneId) {
    this.set('zoneId', zoneId, Number, null)
  }
}

module.exports = Waypoint
