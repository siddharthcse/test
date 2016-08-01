'use strict'
/** Class representing an amenity. */
class Amenity {
  /**
   * Create an amenity.
   * @param {object} model - The model object passed back from the /full payload
   */
  constructor(model, DOMParser) {
    this._ = {
      waypoints: []
    }

    for(var property in model.bean) {
      if(model.bean.hasOwnProperty(property)) {
        this._[property] = model.bean[property]

        //TODO: check for svg file.
        if(property === 'filePath' && property.indexOf('.svg')) {
          try {
            if(this._.svg) {

              //Clean svg
              this._.svg = this._.svg.replace(/\r\n|\r|\n|\t/g, '')
              this._.svg = this._.svg.replace(/\s+/g, ' ')

              //Parse
              this._.svgTree = (new DOMParser()).parseFromString(this._.svg, 'text/xml');

              //Check for errors
              if(!this._.svgTree || !this._.svgTree.documentElement || this._.svgTree.documentElement.nodeName == 'parsererror') {
                throw new TypeError('Amenity :: input contains invalid XML data')
              }
            }

          } catch(error) {
            throw error
          }
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
   * @member {Number}   Amenity#componentId
   */
  get componentId() {
    return this.get('componentId', null)
  }
  set componentId(componentId) {
    this.set('componentId', componentId, Number, null)
  }

  /**
   * @member {Number}   Amenity#componentTypeId
   */
  get componentTypeId() {
    return this.get('componentTypeId', null)
  }
  set componentTypeId(componentTypeId) {
    this.set('componentTypeId', componentTypeId, Number, null)
  }

  /**
   * @member {String}   Amenity#componentTypeName
   */
  get componentTypeName() {
    return this.get('componentTypeName', '')
  }
  set componentTypeName(componentTypeName) {
    this.set('componentTypeName', componentTypeName, String, '')
  }

  /**
   * @member {String}   Amenity#description
   */
  get description() {
    return this.get('description', '')
  }
  set description(description) {
    this.set('description', description, String, '')
  }

  /**
   * @member {Array}   Amenity#destinations
   */
  get destinations() {
    return this.get('destinations', [])
  }
  set destinations(destinations) {
    this.set('destinations', destinations, Array, [])
  }

  /**
   * @member {Number}   Amenity#endDate
   */
  get endDate() {
    return this.get('endDate', null)
  }
  set endDate(endDate) {
    this.set('endDate', endDate, Number, null)
  }

  /**
   * @member {String}   Amenity#filePath
   */
  get filePath() {
    return this.get('filePath', '')
  }
  set filePath(filePath) {
    this.set('filePath', filePath, String, '')
  }

  /**
   * @member {String}   Amenity#iconImagePath
   */
  get iconImagePath() {
    return this.get('iconImagePath', '')
  }
  set iconImagePath(iconImagePath) {
    this.set('iconImagePath', iconImagePath, String, '')
  }

  /**
   * @member {String}   Amenity#localizedText
   */
  get localizedText() {
    return this.get('localizedText', '')
  }
  set localizedText(localizedText) {
    this.set('localizedText', localizedText, String, '')
  }

  /**
   * @member {String}   Amenity#position
   */
  get position() {
    return this.get('position', '')
  }
  set position(position) {
    this.set('position', position, String, '')
  }

  /**
   * @member {Number}   Amenity#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }
  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {Number}   Amenity#startDate
   */
  get startDate() {
    return this.get('startDate', null)
  }
  set startDate(startDate) {
    this.set('startDate', startDate, Number, null)
  }

  /**
   * @member {Array}   Amenity#waypoints
   */
  get waypoints() {
    return this.get('waypoints', [])
  }
  set waypoints(waypoints) {
    this.set('waypoints', waypoints, Array, [])
  }

}

module.exports = Amenity
