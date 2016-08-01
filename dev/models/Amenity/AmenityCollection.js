'use strict'
const Amenity = require('./Amenity')

/** Class representing a collection of amenities. */
class AmenityCollection {

  /**
   * Create an amenity collection.
   */
  constructor(xmlParser) {
    this._items = []
      //Set SVG XML parser
    if(xmlParser) {
      this.DOMParser = xmlParser
    } else {
      throw new TypeError('AmenityCollection :: No XML parser provided. Amenity.svgTree will not be available')
    }
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Amenity object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isAmenity(item) {
    return item && item.constructor === Amenity
  }

  /**
   * Generate a single or an array of amenities based on the input model data
   * @param {Array/Amenity} model - The model object passed back from the /full payload
   * @return {Array/Amenity} A created amenity instance or an array of amenity instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Amenity(m, this.DOMParser))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Amenity(model, this.DOMParser)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Amenity objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get a specific amenity by its componentId
   * @param {Number} componentId - The component id used to define an amenity
   * @return {Amenity}
   */
  getByComponentId(componentId) {
    return this._items.find(amenity => amenity.componentId === componentId) || null
  }

  /**
   * Get a specific set of amenities by its mapId
   * @param {Number} mapId - The id used to define a map
   * @return {Array} an array of amenities
   */
  getByMapId(mapId) {
    return this._items.filter((amenity) => {
      return amenity.waypoints.find(w => w.mapId === mapId)
    })
  }

  /**
   * Get a specific set of amenities belonging to a waypoint
   * @param {Number} waypointId - The id used to define a waypoint
   * @return {Array} an array of amenities
   */
  getByWaypointId(waypointId) {
    return this._items.filter((amenity) => {
      return amenity.waypoints.find(w => w.id === waypointId)
    })
  }
}

module.exports = AmenityCollection
