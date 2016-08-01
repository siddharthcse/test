'use strict'

/** Class representing WayfinderData parsed from Wayfinder*/
class WayfinderData {

  /**
   * Create a WayfinderData object
   * @param {object} data - AStar search data
   */
  constructor(data) {
    this._ = {}
    this._.seq = data.seq
    this._.mapId = data.mapId
    this._.mover = data.mover
    this._.points = data.points
    this._.cost = data.cost
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
   * @member {Number}   WayfinderData#seq
   */
  get seq() {
    return this.get('seq', null)
  }
  set seq(seq) {
    this.set('seq', seq, Number, null)
  }

  /**
   * @member {Number}   WayfinderData#mapId
   */
  get mapId() {
    return this.get('mapId', null)
  }
  set mapId(mapId) {
    this.set('mapId', mapId, Number, null)
  }

  /**
   * @member {Object}   WayfinderData#mover
   */
  get mover() {
    return this.get('mover', null)
  }
  set mover(mover) {
    this.set('mover', mover, Object, null)
  }

  /**
   * @member {Array}   WayfinderData#points
   */
  get points() {
    return this.get('points', [])
  }
  set points(points) {
    this.set('points', points, Array, [])
  }

  /**
   * @member {Number}   WayfinderData#cost
   */
  get cost() {
    return this.get('cost', null)
  }

  /**
   * @member {Number}   WayfinderData#entityId
   */
  set cost(cost) {
    this.set('cost', cost, Number, null)
  }
}

module.exports = WayfinderData
