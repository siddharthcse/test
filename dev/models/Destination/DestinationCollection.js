'use strict'
const Destination = require('./Destination')
const Waypoint = require('../Waypoint/Waypoint')

/** Class representing a collection of destination. */
class DestinationCollection {
  /**
   * Create a collection of destinations.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Destination object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isDestination(item) {
    return item && item.constructor === Destination
  }

  /**
   * Generate a single or an array of destinations based on the input model data
   * @param {Array/Destination} model - The model object passed back from the /full payload
   * @return {Array/Destination} A created destination instance or an array of destination instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Destination(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Destination(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Destination objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get a specific destination by its id
   * @param {Number} id - The id used to define a destination
   * @return {Destination}
   */
  getById(id) {
    return this._items.find((destination) => {
      return destination.id === id
    }) || null
  }

  /**
   * Get a specific destination by its clientId
   * @param {Number} clientId - The clientId used to define a destination
   * @return {Destination}
   */
  getByClientId(clientId) {
    return this._items.find((destination) => {
      return destination.clientId === clientId
    }) || null
  }

  /**
   * Get a specific set of destinations by its mapId
   * @param {Number} mapId - The id used to define a map
   * @return {Array/Destination} an array of destinations
   */
  getByMapId(mapId) {
    return this._items.filter((destination) => {
      return destination.waypoints.find(w => w.mapId === mapId)
    })
  }

  /**
   * Get a specific set of destinations belonging to a waypoint
   * @param {Number} waypointId - The id used to define a waypoint
   * @return {Array/Destination} an array of destinations
   */
  getByWaypointId(waypointId) {
    return this._items.filter((destination) => {
      return destination.waypoints.find(w => w.id === waypointId)
    })
  }

  /**
   * Get a specific set of destinations belonging to a zone
   * @param {Number} zoneId - The id used to define a zone
   * @return {Array/Destination} an array of destinations
   */
  getByZoneId(zoneId) {
    return this._items.filter((destination) => {
      return destination.waypoints.find(w => w.zoneId === zoneId)
    })
  }

  /**
   * Get a specific set of destinations by its categoryId
   * @param {Number} mapId - The id used to define a map
   * @return {Array/Destination} an array of destinations
   */
  getByCategoryId(categoryId) {
    return this._items.filter((destination) => {
      return destination.categoryId.find(c => c === categoryId)
    })
  }

  /**
   * Get an array of destinations by its keyword
   * @param {String} keyword - The keyword used to define a destination
   * @return {Array/Destination}
   */
  getByKeyword(keyword) {
    if(keyword && keyword.constructor === String) {
      return this._items.filter(d => d.keywords.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
    } else {
      return []
    }
  }

  /**
   * Get an array of destinations by its keyword
   * @param {Number} operatingStatus - The operatingStatus of a destination
   * @return {Array}
   */
  getByOperatingStatus(operatingStatus) {
    return this._items.filter(d => d.operatingStatus === operatingStatus)
  }

  /**
   * Get an array of destinations by its keyword
   * @param {Number} operatingStatus - The operatingStatus of a destination
   * @return {Array/Destination}
   */
  getBySponsoredRating(sponsoredRating) {
    return this._items.filter(d => d.sponsoredRating === sponsoredRating)
  }

  /**
   * Get a sorted array of destinations by sponspored rating, highest to lowest
   * @param {Array} - Optional: Array of Destination objects, if none are passed method will return a sorted list of all destinations
   * @return {Array/Destination}
   */
  sortBySponsoredRating(destinations) {
    if(destinations && destinations.constructor === Array) {
      destinations.forEach((d) => {
        if(d.constructor !== Destination) {
          throw new TypeError('JMap : All items must be type Destination')
        }
      })
    } else {
      destinations = this._items
    }

    return destinations.sort((a, b) => {
      return(a.sponsoredRating < b.sponsoredRating) ? 1 : ((b.sponsoredRating < a.sponsoredRating) ? -1 : 0);
    });
  }

  /**
   * Get a Destination that has the highest sponsoredRating belonging to specified waypoint
   * @param {Waypoint} - Waypoint object
   * @return {Destination}
   */
  getHighestSponsoredDestinationByWaypoint(waypoint) {
    //Entity type id is 1
    if(waypoint && waypoint.constructor === Waypoint) {
      let associations = waypoint.AssociationCollection.getByEntityTypeId(1)
      let destinations = associations.map(a => this.getById(a.entityId))
      return this.sortBySponsoredRating(destinations)[0] || null
    } else {
      return null
    }
  }
}

module.exports = DestinationCollection
