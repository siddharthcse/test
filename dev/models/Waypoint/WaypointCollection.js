'use strict'
const Waypoint = require('./Waypoint')

/** Class representing an collection of Waypoints. */
class WaypointCollection {

  /**
   * Create a collection of Waypoints.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Waypoint object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isWaypoint(item) {
    return item && item.constructor === Waypoint
  }

  /**
   * Generate a single or an array of devices based on the input model data
   * @param {Array/Waypoint} model - The model object passed back from the /full payload
   * @return {Array/Waypoint} A created Waypoint instance or an array of Waypoint instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Waypoint(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Waypoint(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Waypoint objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get Waypoint object associated with id
   * @param {Number} id - Number representing each Waypoints id
   * @return {Waypoint}
   */
  getById(id) {
    return this._items.find(wp => wp.id === id) || null
  }

  /**
   * Get Waypoint objects associated with mapId
   * @param {Number} mapId - Number representing each Waypoints mapId
   * @return {Array/Waypoint}
   */
  getByMapId(mapId) {
    return this._items.filter(wp => wp.mapId === mapId)
  }

  /**
   * Get Waypoint objects associated with status
   * @param {Number} status - Number representing each Waypoints status
   * @return {Array/Waypoint}
   */
  getByStatus(status) {
    return this._items.filter(wp => wp.status === status)
  }

  /**
   * Get Waypoint objects associated with zoneId
   * @param {Number} zoneId - Number representing each Waypoints zoneId
   * @return {Array/Waypoint}
   */
  getByZoneId(zoneId) {
    return this._items.filter(wp => wp.zoneId === zoneId)
  }

}

module.exports = WaypointCollection
