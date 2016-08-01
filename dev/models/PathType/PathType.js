'use strict'
/** Class representing a PathType. */
class PathType {
  /**
   * Create an PathType.
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
   * @member {Number}   PathType#accessibility
   */
  get accessibility() {
    return this.get('accessibility', null)
  }

  set accessibility(accessibility) {
    this.set('accessibility', accessibility, Number, null)
  }

  /**
   * @member {String}   PathType#description
   */
  get description() {
    return this.get('description', '')
  }

  set description(description) {
    this.set('description', description, String, '')
  }

  /**
   * @member {Number}   PathType#direction
   */
  get direction() {
    return this.get('direction', null)
  }

  set direction(direction) {
    this.set('direction', direction, Number, null)
  }

  /**
   * @member {Number}   PathType#maxfloors
   */
  get maxfloors() {
    return this.get('maxfloors', null)
  }

  set maxfloors(maxfloors) {
    this.set('maxfloors', maxfloors, Number, null)
  }

  /**
   * @member {String}   PathType#metaData
   */
  get metaData() {
    return this.get('metaData', '')
  }

  set metaData(metaData) {
    this.set('metaData', metaData, String, '')
  }

  /**
   * @member {Number}   PathType#pathTypeId
   */
  get pathTypeId() {
    return this.get('pathTypeId', null)
  }

  set pathTypeId(pathTypeId) {
    this.set('pathTypeId', pathTypeId, Number, null)
  }

  /**
   * @member {Number}   PathType#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }

  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {Number}   PathType#speed
   */
  get speed() {
    return this.get('speed', null)
  }

  set speed(speed) {
    this.set('speed', speed, Number, null)
  }

  /**
   * @member {String}   PathType#typeName
   */
  get typeName() {
    return this.get('typeName', '')
  }

  set typeName(typeName) {
    this.set('typeName', typeName, String, '')
  }

  /**
   * @member {Number}   PathType#typeidPK
   */
  get typeidPK() {
    return this.get('typeidPK', null)
  }

  set typeidPK(typeidPK) {
    this.set('typeidPK', typeidPK, Number, null)
  }

  /**
   * @member {Number}   PathType#weight
   */
  get weight() {
    return this.get('weight', null)
  }

  set weight(weight) {
    this.set('weight', weight, Number, null)
  }

}

module.exports = PathType
