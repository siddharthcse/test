'use strict'
const PathType = require('./PathType')
  /** Class representing a collection of PathTypes. */
class PathTypeCollection {
  /**
   * Create a collection of PathTypes.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an PathType object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isPathType(item) {
    return item && item.constructor === PathType
  }

  /**
   * Generate a single or an array of pathTypes based on the input model data
   * @param {Array/PathType} model - The model object passed back from the /full payload
   * @return {Array/PathType} A created PathType instance or an array of PathType instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new PathType(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new PathType(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all PathType objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get a specific set of pathTypes by its pathTypeId
   * @param {Number} pathTypeId - The pathTypeId used to define a pathType
   * @return {Array} an array of PathTypes
   */
  getByPathTypeId(pathTypeId) {
    return this._items.find(pathType => pathType.pathTypeId === pathTypeId) || null
  }

  /**
   * Get a specific set of pathTypes by its deviceTypeId
   * @param {String} typeName - The typeName used to define a PathType
   * @return {Array} an array of PathTypes
   */
  getByTypeName(typeName) {
    if(typeName && typeName.constructor === String) {
      return this._items.find(pathType => pathType.typeName.toLowerCase() === typeName.toLowerCase()) || null
    } else {
      return null
    }
  }

  /**
   * Get a specific set of PathType by its direction
   * @param {Number} direction - The direction used to define a device type
   * @return {Array} an array of PathType
   */
  getByDirection(direction) {
    return this._items.filter(device => device.direction === direction)
  }

  /**
   * Get a sorted array of PathType by accessibility, highest to lowest
   * @return {Array/Destination}
   */
  sortByAccessibility() {
    return this._items.sort((a, b) => {
      return(a.accessibility < b.accessibility) ? 1 : ((b.accessibility < a.accessibility) ? -1 : 0);
    });
  }

  /**
   * Get a sorted array of PathType by weight, highest to lowest
   * @return {Array/Destination}
   */
  sortByWeight() {
    return this._items.sort((a, b) => {
      return(a.weight < b.weight) ? 1 : ((b.weight < a.weight) ? -1 : 0);
    });
  }
}

module.exports = PathTypeCollection
