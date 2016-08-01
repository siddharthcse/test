'use strict'
const AS_Search = require('./AS_Search')
const Waypoint = require('../models/Waypoint/Waypoint')

/** Class representing a Wayfinder object used to generate a path between two points*/
class Wayfinder {

  /**
   * Create a new Wayfinder object
   * @param {object} data - AStar search data
   */
  constructor(jmap) {
    let waypoints = jmap.MapCollection.getAllWaypoints()
    let paths = jmap.PathCollection.getAll()
    let pathTypes = jmap.PathTypeCollection.getAll()
    let maps = jmap.MapCollection.getAll()
    this._ = {
      astar: new AS_Search(waypoints, paths, pathTypes, maps)
    }
  }

  /**
   * Generate SVG path data from an array of waypoints
   * @param {Array/Waypoint} points - Array of waypoints
   * @return {String} svg Path elemnt d="" attribute
   */
  convertPointsToSVGPathData(points) {
    var str = '';
    var n = points.length;

    if(n < 2) {
      return null;
    }
    str += 'M ' + (points[0].x) + ' ' + (points[0].y);
    for(var i = 1; i < n; i++) {
      str += ' L ' + (points[i].x) + ' ' + (points[i].y);
    }
    return str;
  }

  /**
   * Generate WayfinderData between two points
   * @param {Waypoint} _from - Starting waypoint
   * @param {Waypoint} _to - Ending waypoint
   * @param {Boolean} access - Force use of only movers with access level < 51 (typically, elevators)
   * @return {Array/WayfinderData} - Return data
   * @throws {TypeError} message - Wayfinder :: First two arguments must be Waypoints
   */
  search(_from, _to, access) {
    let accessLevel = 100
    if(access) accessLevel = 50
    if(_from && _to && _from.constructor === Waypoint && _to.constructor === Waypoint) {
      return this._.astar.search(_from.id, _to.id, accessLevel)
    } else {
      throw new TypeError('Wayfinder :: First two arguments must be Waypoints')
    }

  }

}

module.exports = Wayfinder
