'use strict'
const Association = require('./Association')
  /** Class representing an collection of Associations. */
class AssociationCollection {

  /**
   * Create a collection of Associations.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Association object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isAssociation(item) {
    return item && item.constructor === Association
  }

  /**
   * Generate a single or an array of devices based on the input model data
   * @param {Array/Association} model - The model object passed back from the /full payload
   * @return {Array/Association} A created Association instance or an array of Association instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Association(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Association(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Association objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * return array of associations associated with an entityId
   * @param {Number} entityId - Number representing each Associations entityId
   * @return {Array/Association} Array of Associations
   */
  getByEntityId(entityId) {
    return this._items.filter(a => a.entityId === entityId)
  }

  /**
   * return array of associations associated with an entityTypeId
   * @param {Number} entityTypeId - Number representing each Associations entityTypeId
   * @return {Array/Association} Array of Associations
   */
  getByEntityTypeId(entityTypeId) {
    return this._items.filter(a => a.entityTypeId === entityTypeId)
  }

}

module.exports = AssociationCollection
