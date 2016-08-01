'use strict'
/** Class representing an MapLabel. */
class MapLabel {
  /**
   * Create a MapLabel.
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
   * @member {String}   Device#ck
   */
  get ck() {
    return this.get('ck', '')
  }
  set ck(ck) {
    this.set('ck', ck, String, '')
  }

  /**
   * @member {Number}   MapLabel#componentId
   */
  get componentId() {
    return this.get('componentId', null)
  }
  set componentId(componentId) {
    this.set('componentId', componentId, Number, null)
  }

  /**
   * @member {String}   MapLabel#componentTypeName
   */
  get componentTypeName() {
    return this.get('componentTypeName', '')
  }
  set componentTypeName(componentTypeName) {
    this.set('componentTypeName', componentTypeName, String, '')
  }

  /**
   * @member {String}   MapLabel#description
   */
  get description() {
    return this.get('description', '')
  }
  set description(description) {
    this.set('description', description, String, '')
  }

  /**
   * @member {String}   MapLabel#label
   */
  get label() {
    return this.get('label', '')
  }
  set label(label) {
    this.set('label', label, String, '')
  }

  /**
   * @member {String}   MapLabel#localizedText
   */
  get localizedText() {
    return this.get('localizedText', '')
  }
  set localizedText(localizedText) {
    this.set('localizedText', localizedText, String, '')
  }

  /**
   * @member {Number}   MapLabel#locationId
   */
  get locationId() {
    return this.get('locationId', null)
  }
  set locationId(locationId) {
    this.set('locationId', locationId, Number, null)
  }

  /**
   * @member {String}   MapLabel#locationX
   */
  get locationX() {
    return this.get('locationX', '')
  }
  set locationX(locationX) {
    this.set('locationX', locationX, String, '')
  }

  /**
   * @member {String}   MapLabel#locationY
   */
  get locationY() {
    return this.get('locationY', '')
  }
  set locationY(locationY) {
    this.set('locationY', locationY, String, '')
  }

  /**
   * @member {Number}   MapLabel#mapId
   */
  get mapId() {
    return this.get('mapId', null)
  }
  set mapId(mapId) {
    this.set('mapId', mapId, Number, null)
  }

  /**
   * @member {Number}   MapLabel#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }
  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {String}   MapLabel#rotation
   */
  get rotation() {
    return this.get('rotation', '')
  }
  set rotation(rotation) {
    this.set('rotation', rotation, String, '')
  }

  /**
   * @member {Number}   MapLabel#typeId
   */
  get typeId() {
    return this.get('typeId', null)
  }
  set typeId(typeId) {
    this.set('typeId', typeId, Number, null)
  }

  /**
   * @member {Number}   MapLabel#zoomlevel
   */
  get zoomlevel() {
    return this.get('zoomlevel', null)
  }
  set zoomlevel(zoomlevel) {
    this.set('zoomlevel', zoomlevel, Number, null)
  }

}

module.exports = MapLabel
