'use strict'
const Path = require('./Path')
  /** Class representing a collection of Paths. */
class PathCollection {
  /**
   * Create a collection of Paths.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Path object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isPath(item) {
    return item && item.constructor === Path
  }

  /**
   * Generate a single or an array of paths based on the input model data
   * @param {Array/Path} model - The model object passed back from the /full payload
   * @return {Array/Path} A created Path instance or an array of Path instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Path(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Path(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Path objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get all Path objects associated with specifed direction
   * @param {Number} direction - The Number used to define a path direction
   * @return {Array/Path}
   */
  getByDirection(direction) {
    return this._items.filter(p => p.direction === direction)
  }

  /**
   * Get Path associated with specifed id
   * @param {Number} id - The Number used to define a path id
   * @return {Path}
   */
  getById(id) {
    return this._items.find(p => p.id === id) || null
  }

  /**
   * Get Path associated with specifed name
   * @param {String} name - The String used to define a path name
   * @return {Path}
   */
  getByName(name) {
    if(name && name.constructor === String) {
      return this._items.find(p => p.name.toLowerCase() == name.toLowerCase()) || null
    } else {
      return null
    }
  }

  /**
   * Get Paths associated with specifed status
   * @param {String} status - The String used to define a path status
   * @return {Array/Path}
   */
  getByStatus(status) {
    return this._items.filter(p => p.status === status)
  }

  /**
   * Get Paths associated with specifed type
   * @param {Number} type - The Number used to define a path type
   * @return {Array/Path}
   */
  getByType(type) {
    return this._items.filter(p => p.type === type)
  }

  /**
   * Get Paths associated with specifed waypointId
   * @param {Number} waypointId - The Number used to define a path waypointId
   * @return {Array/Path}
   */
  getByWaypointId(waypointId) {
    return this._items.filter((p) => {
      return p.waypoints.find(wp => wp === waypointId)
    })
  }

  /**
   * Get Paths associated with specifed weight
   * @param {Number} weight - The Number used to define a path weight
   * @return {Array/Path}
   */
  getByWeight(weight) {
    return this._items.filter(p => p.weight === weight)
  }

}

module.exports = PathCollection
