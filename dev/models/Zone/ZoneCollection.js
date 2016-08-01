'use strict'
const Zone = require('./Zone')
  /** Class representing a collection of Zones. */
class ZoneCollection {

  /**
   * Create a collection of Zones.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Zone object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isZone(item) {
    return item && item.constructor === Zone
  }

  /**
   * Generate a single or an array of devices based on the input model data
   * @param {Array/Zone} model - The model object passed back from the /full payload
   * @return {Array/Zone} A created Zone instance or an array of Zone instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Zone(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Zone(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Zone objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * return array of associations associated with a clientId
   * @param {Number} clientId - Number representing each Zones clientId
   * @return {Zone} Zone Object
   */
  getByClientId(clientId) {
    return this._items.filter(z => z.clientId === clientId)
  }

  /**
   * return array of associations associated with a zoneId
   * @param {Number} zoneId - Number representing each Zones zoneId
   * @return {Zone} Zone Object
   */
  getByZoneId(zoneId) {
    return this._items.filter(z => z.zoneId === zoneId)
  }

  /**
   * return array of associations associated with a statusCode
   * @param {Number} statusCode - Number representing each Zones statusCode
   * @return {Array/Zone} Array of Zones
   */
  getByStatusCode(statusCode) {
    return this._items.filter(z => z.statusCode === statusCode)
  }

}

module.exports = ZoneCollection
