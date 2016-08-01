'use strict'
/** Class representing an Association. */
class Association {
  /**
   * Create an Association.
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
   * @member {Number}   Association#entityId
   */
  get entityId() {
    return this.get('entityId', null)
  }

  set entityId(entityId) {
    this.set('entityId', entityId, Number, null)
  }

  /**
   * @member {Number}   Association#entityTypeId
   */
  get entityTypeId() {
    return this.get('entityTypeId', null)
  }

  set entityTypeId(entityTypeId) {
    this.set('entityTypeId', entityTypeId, Number, null)
  }

  /**
   * @member {Number}   Association#landmarkRating
   */
  get landmarkRating() {
    return this.get('landmarkRating', null)
  }

  set landmarkRating(landmarkRating) {
    this.set('landmarkRating', landmarkRating, Number, null)
  }

  /**
   * @member {Number}   Association#waypointId
   */
  get waypointId() {
    return this.get('waypointId', null)
  }

  set waypointId(waypointId) {
    this.set('waypointId', waypointId, Number, null)
  }
}

module.exports = Association
