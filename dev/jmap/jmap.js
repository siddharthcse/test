'use strict'

//Boot methods
const Boot = require('./boot')

//models
const Waypoint = require('../models/Waypoint/Waypoint')

//Collections
const AmenityCollection = require('../models/Amenity/AmenityCollection')
const CategoryCollection = require('../models/Category/CategoryCollection')
const DestinationCollection = require('../models/Destination/DestinationCollection')
const DeviceCollection = require('../models/Device/DeviceCollection')
const EventCollection = require('../models/Event/EventCollection')
const MapCollection = require('../models/Map/MapCollection')
const PathCollection = require('../models/Path/PathCollection')
const PathTypeCollection = require('../models/PathType/PathTypeCollection')
const ZoneCollection = require('../models/Zone/ZoneCollection')

//Wayfinding
const Wayfinder = require('../wayfinding/Wayfinder')
const TextDirections = require('../text-directions/TextDirections')
const Utility = require('../utility/Utility')

/** Class representing an instance JMap. This is the main classes where all your collections will be held.*/
class JMap {

  /**
   * Options object, holding all the data needed to construct JMap
   * @typedef {Object} JMapOptions
   * @example
   *{
   *  server: 'https://maps.westfield.io',
   *  headers: {
   *    'x-lcode': 'en',
   *    'x-jsapi_user': 'user',
   *    'x-jsapi_passcode': 'pass',
   *    'x-jsapi_key': 'key',
   *  }
   *  locationId: 263,
   *  onReady: function(err){
   *    if(err) throw err
   *  }
   *}
   *
   * @property {String} server - Url of Jibestream UXM (ex. "http://developer.js-network.co")
   * @property {Object} headers - {"name":"value"} set for each Header, used for API authentication
   * @property {Number} locationId - Location Id referencing a location.
   * @property {Module} request - Node.js only: NPM module for making http requests (https://www.npmjs.com/package/request)
   * @property {Module} DOMParser - Node.js only: NPM module for parsing SVG XML to use LBoxes in TextDirections (https://www.npmjs.com/package/xmldom)
   * @property {Function} onReady(error) - Callback function executed once all data is pulled & parsed and the created instance of JMap is ready to use
   */

  /**
   * Create a new JMap object
   * @param {JMapOptions} opts - Options object, holding all the data needed to construct JMap
   */
  constructor(opts) {
    this.boot = new Boot(this, opts)

    //Parse options and check for returned error
    this.options = this.boot.validateOptions(opts)
    if(this.options.constructor === TypeError) {
      opts.onReady(this.options)
      return false
    }

    this.response = {
      url: this.boot.generateApi(this.options),
      headers: this.options.headers
    }

    let request = this.boot.request
    let xmlParser = this.boot.xmlParser

    this.AmenityCollection = new AmenityCollection(xmlParser)
    this.CategoryCollection = new CategoryCollection()
    this.DestinationCollection = new DestinationCollection()
    this.DeviceCollection = new DeviceCollection()
    this.EventCollection = EventCollection
    this.MapCollection = new MapCollection(xmlParser)
    this.PathCollection = new PathCollection()
    this.PathTypeCollection = new PathTypeCollection()
    this.ZoneCollection = new ZoneCollection()

    //Generate model

    request(this.response, (er, response, body) => {
      if(!er) {
        this.response.response = response
        this.response.body = JSON.parse(body)

        //Build out model this is where all collection classes are used to create items
        this.boot.parseResponse(this.response.body)

        //Create wayfinding classes
        this.Wayfinder = new Wayfinder(this)
        this.TextDirections = new TextDirections(this)

      } else {
        console.error(er)
      }

      if(opts.onReady && opts.onReady.constructor === Function) {
        opts.onReady(er)
      }

    })

    //Add to items array
    JMap._items.push(this)
  }

  /**
   * Returns the closest waypoint inside of specified array to the waypoint in the second argument
   * @param {Array/Waypoint} array - Array of waypoints to search through
   * @param {Waypoint} waypoint - Waypoint to compar paths against
   * @param {Boolean} elevator - Force elevator path
   * @return {Waypoint} - Closest waypoint insode array
   */
  getClosestWaypointInArrayToWaypoint(array, waypoint, elevator) {
    let closest = {};
    if(!array || !array.length || !waypoint || waypoint.constructor !== Waypoint) return null;
    for(let j = 0; j < array.length; j++) {
      let wp = array[j];
      if(wp.constructor !== Waypoint) continue;
      if(waypoint.id === wp.id) continue;
      let path = this.Wayfinder.search(waypoint, wp, elevator);
      let currentCost;
      if(path[path.length - 1]) currentCost = path[path.length - 1].cost;
      if(!closest.cost || closest.cost > currentCost) {
        closest.cost = currentCost;
        closest.wp = wp;
      }
    }
    return closest.wp || null;
  }

  /**
   * Returns the closest destination to the specified waypoint
   * @param {Waypoint} waypoint - Waypoint to compare paths against
   * @param {Function} filter - function that returns a condition
   * @param {Boolean} elevator - Force elevator path
   * @example
   * // Get closest destination with sponsorShip above or equal to 50
   * let waypoint = jmap.MapCollection.getAllWaypoints()[0]
   * let filter1 = destination => destination.sponsoredRating >= 50
   * let closest = jmap.getClosestDestinationToWaypoint(waypoint, filter1, elevator)
   *
   *
   * // Get closest destination with name containing 'hello'
   * let waypoint = jmap.MapCollection.getAllWaypoints()[0]
   * let filter2 = destination => destination.name.indexOf('hello') > -1
   * let closest = jmap.getClosestDestinationToWaypoint(waypoint, filter2, elevator)
   *
   *
   * // Get closest destination with category 'Fashion'
   * let waypoint = jmap.MapCollection.getAllWaypoints()[0]
   * let filter2 = destination => destination.category.indexOf('Fashion') > -1
   * let closest = jmap.getClosestDestinationToWaypoint(waypoint, filter2, elevator)
   *
   *
   * @return {Object} closest
   * @return {Destination} closest.destination - Closest destination matching filter. In the case of multiple destinations on waypoint, filter can be more specific
   * @return {Waypoint} closest.waypoint - The waypoint belonging to the destination that was the closest to the specified starting waypoint.
   */
  getClosestDestinationToWaypoint(waypoint, filter, elevator) {
    if(waypoint.constructor === Waypoint) {
      let self = this;
      filter = filter && filter.constructor === Function ? filter : () => true
      let wps = this.MapCollection.getWaypointsWithDestination().filter((wp) => {
        return self.DestinationCollection.getByWaypointId(wp.id).filter(filter)[0]
      })
      let closestWaypoint = this.getClosestWaypointInArrayToWaypoint(wps, waypoint, elevator)

      return {
        destination: this.DestinationCollection.getByWaypointId(closestWaypoint.id).filter(filter)[0],
        waypoint: closestWaypoint
      }
    } else {
      return null
    }
  }

  /**
   * Returns the closest amenity to the specified waypoint
   * @param {Waypoint} waypoint - Waypoint to compare paths against
   * @param {Function} filter - function that returns a condition
   * @param {Boolean} elevator - Force elevator path
   * @example
   * // Get closest amenity with component id 1234
   * let waypoint = jmap.MapCollection.getAllWaypoints()[0]
   * let filter1 = amenity => amenity.componentId === 1234
   * let closest = jmap.getClosestAmenityToWaypoint(waypoint, filter1, elevator)
   *
   *
   * // Get closest amenity with description containing 'washroom'
   * let waypoint = jmap.MapCollection.getAllWaypoints()[0]
   * let filter2 = amenity => amenity.description.indexOf('washroom') > -1
   * let closest = jmap.getClosestAmenityToWaypoint(waypoint, filter2, elevator)
   *
   *
   * @return {Object} closest
   * @return {Amenity} closest.amenity - Closest amenity matching filter. In the case of multiple amenities on waypoint, filter can be more specific
   * @return {Waypoint} closest.waypoint - The waypoint belonging to the amenity that was the closest to the specified starting waypoint.
   */
  getClosestAmenityToWaypoint(waypoint, filter, elevator) {
    if(waypoint.constructor === Waypoint) {
      let self = this;
      filter = filter && filter.constructor === Function ? filter : () => true
      let wps = this.MapCollection.getWaypointsWithAmenity().filter((wp) => {
        return self.AmenityCollection.getByWaypointId(wp.id).filter(filter)[0]
      })
      let closestWaypoint = this.getClosestWaypointInArrayToWaypoint(wps, waypoint, elevator)

      return {
        amenity: this.AmenityCollection.getByWaypointId(closestWaypoint.id).filter(filter)[0],
        waypoint: closestWaypoint
      }
    } else {
      return null
    }
  }

}

/**
 * @static JMap#util
 * @member {Utility} - Utility class for JMap
 */
JMap.util = new Utility();
JMap._items = [];

/*
  Export handler used to export into browser or node.js runtime
*/
((_export) => {
  try {
    window.JMap = _export
  } catch(e) {
    module.exports = _export
  }
})(JMap)

/**
 * @member {JMapOptions}   JMap#options
 */
/**
 * @member {Object}   JMap#response
 */
/**
 * @member {Location}   JMap#location
 */
/**
 * @member {AmenityCollection}   JMap#AmenityCollection
 */
/**
 * @member {CategoryCollection}   JMap#CategoryCollection
 */
/**
 * @member {DestinationCollection}   JMap#DestinationCollection
 */
/**
 * @member {DeviceCollection}   JMap#DeviceCollection
 */
/**
 * @member {EventCollection}   JMap#EventCollection
 */
/**
 * @member {MapCollection}   JMap#MapCollection
 */
/**
 * @member {PathCollection}   JMap#PathCollection
 */
/**
 * @member {PathTypeCollection}   JMap#PathTypeCollection
 */
