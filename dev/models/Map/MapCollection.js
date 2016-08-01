'use strict'
const Map_ = require('./Map')
const Waypoint = require('../Waypoint/Waypoint')
  /** Class representing an collection of Maps. */
class MapCollection {

  /**
   * Create a collection of Maps.
   * @param {DOMParser} xmlParser - XML DOM parser window.DOMParser for browser or https://www.npmjs.com/package/xmldom
   * @throws {TypeError} - No XML parser provided. Map.svgTree & Text Directions will not be available.
   */
  constructor(xmlParser) {
    this._items = []

    //Set SVG XML parser
    if(xmlParser) {
      this.DOMParser = xmlParser
    } else {
      throw new TypeError('MapCollection :: No XML parser provided. Map.svgTree & Text Directions will not be available')
    }
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Map object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isMap(item) {
    return item && item.constructor === Map_
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
   * @param {Array/Map} model - The model object passed back from the /full payload
   * @return {Array/Map} A created Map instance or an array of Map instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Map_(m, this.DOMParser))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Map_(model, this.DOMParser)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Map objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get Map object associated with floorSequence
   * @param {Number} floorSequence - Number representing each Maps floorSequence
   * @return {Map}
   */
  getByFloorSequence(floorSequence) {
    return this._items.find(m => m.floorSequence === floorSequence) || null
  }

  /**
   * Get Map object associated with locationId
   * @param {Number} locationId - Number representing each Maps locationId
   * @return {Map}
   */
  getByLocationId(locationId) {
    return this._items.find(m => m.locationId === locationId) || null
  }

  /**
   * Get Map object associated with mapId
   * @param {Number} mapId - Number representing each Maps mapId
   * @return {Map}
   */
  getByMapId(mapId) {
    return this._items.find(m => m.mapId === mapId) || null
  }

  /**
   * Get a set of Map objects associated with Destination
   * @param {Number} destinationId - Number representing a #Destination id
   * @return {Array/Map}
   */
  getByDestinationId(destinationId) {
    let waypoints = this.getWaypointsByDestinationId(destinationId)
    return waypoints.map(wp => this.getByMapId(wp.mapId))
  }

  /**
   * Get all Waypoint associated with mapId
   * @param {Number} mapId - Number representing each Maps mapId
   * @return {Array/Waypoint}
   */
  getWaypointsByMapId(mapId) {
    let map = this.getByMapId(mapId)
    return map && map.WaypointCollection ? map.WaypointCollection.getAll() : []
  }

  /**
   * Get all Waypoint associated with MapCollection
   * @return {Array/Waypoint}
   */
  getAllWaypoints() {
    return this._items.reduce((wps, map) => {
      return map && map.WaypointCollection ? wps.concat(map.WaypointCollection.getAll()) : wps
    }, [])
  }

  /**
   * Get all Waypoint associated with a Destination
   * @return {Array/Waypoint}
   */
  getWaypointsWithDestination() {
    return this.getAllWaypoints().filter((wp) => {
      return wp.AssociationCollection.getByEntityTypeId(1).length
    })
  }

  /**
   * Get all Waypoint associated with a Amenity
   * @return {Array/Waypoint}
   */
  getWaypointsWithAmenity() {
    return this.getAllWaypoints().filter((wp) => {
      return wp.AssociationCollection.getByEntityTypeId(26).length
    })
  }

  /**
   * Get a single Waypoint associated a waypoint id
   * @param {Number} waypointId - Number representing each Waypoint id
   * @return {Waypoint}
   */
  getWaypointByWaypointId(waypointId) {
    return this.getAllWaypoints().find(wp => wp.id === waypointId) || null
  }

  /**
   * Get a set of Waypoints associated a destination id
   * @param {Number} destinationId - Number representing each Destination id
   * @return {Array/Waypoint}
   */
  getWaypointsByDestinationId(destinationId) {
    return this.getAllWaypoints().filter((wp) => {
      return wp.AssociationCollection.getAll().find(a => a.entityId === destinationId)
    })
  }

  /**
   * Get all MapLabel associated with mapId
   * @param {Number} mapId - Number representing each Maps mapId
   * @return {Map}
   */
  getMapLabelsByMapId(mapId) {
    let map = this.getByMapId(mapId)
    return map && map.MapLabelCollection ? map.MapLabelCollection.getAll() : []
  }

  /**
   * Get all MapLabel associated with MapCollection
   * @return {Array/MapLabel}
   */
  getAllMapLabels() {
    return this._items.reduce((label, map) => {
      return map && map.MapLabelCollection ? label.concat(map.MapLabelCollection.getAll()) : label
    }, [])
  }

  /**
   * Get all DestinationLabel associated with mapId
   * @param {Number} mapId - Number representing each Maps mapId
   * @return {Map}
   */
  getDestinationLabelsByMapId(mapId) {
    let map = this.getByMapId(mapId)
    return map && map.DestinationLabelCollection ? map.DestinationLabelCollection.getAll() : []
  }

  /**
   * Get all DestinationLabel associated with MapCollection
   * @return {Array/DestinationLabel}
   */
  getAllDestinationLabels() {
    return this._items.reduce((label, map) => {
      return map && map.DestinationLabelCollection ? label.concat(map.DestinationLabelCollection.getAll()) : label
    }, [])
  }

}

module.exports = MapCollection
