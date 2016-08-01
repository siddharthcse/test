'use strict'
const MapLabel = require('./MapLabel')
  /** Class representing an collection of MapLabels. */
class MapLabelCollection {

  /**
   * Create a collection of MapLabels.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an MapLabel object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isMapLabel(item) {
    return item && item.constructor === MapLabel
  }

  /**
   * Generate a single or an array of devices based on the input model data
   * @param {Array/MapLabel} model - The model object passed back from the /full payload
   * @return {Array/MapLabel} A created MapLabel instance or an array of MapLabel instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new MapLabel(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new MapLabel(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all MapLabel objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

}

module.exports = MapLabelCollection
