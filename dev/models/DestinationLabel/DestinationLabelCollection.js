'use strict'
const DestinationLabel = require('./DestinationLabel')
  /** Class representing an collection of DestinationLabels. */
class DestinationLabelCollection {

  /**
   * Create a collection of DestinationLabels.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an DestinationLabel object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isDestinationLabel(item) {
    return item && item.constructor === DestinationLabel
  }

  /**
   * Generate a single or an array of devices based on the input model data
   * @param {Array/DestinationLabel} model - The model object passed back from the /full payload
   * @return {Array/DestinationLabel} A created DestinationLabel instance or an array of DestinationLabel instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new DestinationLabel(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new DestinationLabel(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all DestinationLabel objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

}

module.exports = DestinationLabelCollection
