(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
//No collection

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Location = require('../models/Location/Location');

var Boot = function () {
  function Boot(jmap, opts) {
    _classCallCheck(this, Boot);

    this.jmap = jmap;

    //Set request based on what is passed. ALLOWS FOR NODE environment
    if (opts.request) this.request = opts.request;else this.request = this.getRequest;

    if (opts.DOMParser) this.xmlParser = opts.DOMParser;else this.xmlParser = this.getXMLParser();
  }
  /*
    Parses the /full call into properly defined/typed objects
  */


  _createClass(Boot, [{
    key: 'parseResponse',
    value: function parseResponse(response) {
      //Create location object
      this.jmap.location = new Location(response.location);

      //Before creating all amenities & pathtypes, add SVG property to object model
      // this.extractAndSetSvgFrom(response.amenities).then(this.jmap.AmenityCollection.create)//.bind(this)
      this.jmap.AmenityCollection.create(response.amenities);
      this.jmap.PathTypeCollection.create(response.pathTypes);

      //Straight forward creation
      this.jmap.CategoryCollection.create(response.categories);
      this.jmap.DestinationCollection.create(response.destinations);
      this.jmap.DeviceCollection.create(response.devices);
      // this.jmap.Event.create(response.events)
      this.jmap.MapCollection.create(response.maps);
      this.jmap.PathCollection.create(response.paths);
      this.jmap.ZoneCollection.create(response.zones);

      return this.attachWaypointsToCollections();
    }
  }, {
    key: 'extractAndSetSvgFrom',
    value: function extractAndSetSvgFrom(items) {
      return new Promise(function (resolve) {

        //Map Promise
        var svgs = items.map(function (item) {
          return new Promise(function (resolveItem) {
            var filePath = null;
            //Item is amenity or pathType
            if (item.bean) {
              filePath = item.bean.filePath;
            } else if (item.pathtypeUri) {
              filePath = item.pathtypeUri[0] ? item.pathtypeUri[0].filePath : null;
            }

            // console.log(filePath)

            if (!filePath) {
              resolveItem(item);
            } else {
              //Get filepath
              resolveItem(item);
            }
          });
        });

        Promise.all(svgs).then(resolve);
      });
    }

    /*
      Iterates waypoints ans adds them to collections based on association
    */

  }, {
    key: 'attachWaypointsToCollections',
    value: function attachWaypointsToCollections() {
      var _this = this;

      //Entity type ids
      var destinationEntitiyType = 1;
      var deviceEntityType = 2;
      var amenityEntityType = 26;
      var eventEntityType = 19;

      //Iterate though all waypints & associations
      var waypoints = this.jmap.MapCollection.getAllWaypoints();
      waypoints.forEach(function (waypoint) {
        var associations = waypoint.AssociationCollection.getAll();
        associations.forEach(function (association) {

          //Figure out what collection item to attach waypoint to
          var item = null;
          switch (association.entityTypeId) {
            case destinationEntitiyType:
              item = _this.jmap.DestinationCollection.getById(association.entityId);
              break;
            case deviceEntityType:
              item = _this.jmap.DeviceCollection.getById(association.entityId);
              break;
            case amenityEntityType:
              item = _this.jmap.AmenityCollection.getByComponentId(association.entityId);
              break;
            case eventEntityType:
              //TODO
              break;
          }

          if (item) {
            if (item.waypoints.indexOf(waypoint) === -1) {
              item.waypoints.push(waypoint);
            }
          }
        });
      });
    }

    /*
      Validates options object passed into jmap
    */

  }, {
    key: 'validateOptions',
    value: function validateOptions(opts) {
      try {
        opts.server = this.validateProperty('server', opts.server, String, null, true);
        opts.locationId = this.validateProperty('locationId', opts.locationId, Number, null, true);
        return opts;
      } catch (error) {
        return error;
      }
    }

    /*
      Validates individual object
    */

  }, {
    key: 'validateProperty',
    value: function validateProperty(prop, value, expectation, _default, required) {
      var err = new TypeError();
      //If value is given
      if (value) {
        //If constructor is not what is expected
        if (value.constructor !== expectation) {
          //If there is a default and it is not required
          if (_default && !required) {
            return _default;
          } else {
            err.message = 'Invalid: Cannot use ' + value + ' as ' + prop;
            throw err;
          }
        } else {
          return value;
        }
      } else {
        err.message = 'Invalid: Cannot use ' + value + ' as ' + prop;
        throw err;
      }
    }

    /*
      Returns formatted /full call based on jmap options
    */

  }, {
    key: 'generateApi',
    value: function generateApi(opts) {
      return opts.server + '/v3/location/' + opts.locationId + '/full';
    }

    /*
      Request method used inside DOM
    */

  }, {
    key: 'getRequest',
    value: function getRequest(opts, cb) {
      var xhttp = new XMLHttpRequest();
      xhttp.open('GET', opts.url, true);

      for (var header in opts.headers) {
        if (opts.headers.hasOwnProperty(header)) {
          xhttp.setRequestHeader(header, opts.headers[header]);
        }
      }

      xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          if (xhttp.status === 200) cb(null, xhttp, xhttp.responseText);else cb('Status code: ' + xhttp.status, xhttp, xhttp.responseText);
        }
      };

      xhttp.send();
    }
  }, {
    key: 'getXMLParser',
    value: function getXMLParser() {
      var parser = undefined;
      try {
        parser = window.DOMParser;
      } catch (e) {
        parser = null;
      }
      return parser;
    }
  }]);

  return Boot;
}();

module.exports = Boot;

},{"../models/Location/Location":16}],2:[function(require,module,exports){
'use strict';

//Boot methods

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Boot = require('./boot');

//models
var Waypoint = require('../models/Waypoint/Waypoint');

//Collections
var AmenityCollection = require('../models/Amenity/AmenityCollection');
var CategoryCollection = require('../models/Category/CategoryCollection');
var DestinationCollection = require('../models/Destination/DestinationCollection');
var DeviceCollection = require('../models/Device/DeviceCollection');
var EventCollection = require('../models/Event/EventCollection');
var MapCollection = require('../models/Map/MapCollection');
var PathCollection = require('../models/Path/PathCollection');
var PathTypeCollection = require('../models/PathType/PathTypeCollection');
var ZoneCollection = require('../models/Zone/ZoneCollection');

//Wayfinding
var Wayfinder = require('../wayfinding/Wayfinder');
var TextDirections = require('../text-directions/TextDirections');
var Utility = require('../utility/Utility');

/** Class representing an instance JMap. This is the main classes where all your collections will be held.*/

var JMap = function () {

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

  function JMap(opts) {
    var _this = this;

    _classCallCheck(this, JMap);

    this.boot = new Boot(this, opts);

    //Parse options and check for returned error
    this.options = this.boot.validateOptions(opts);
    if (this.options.constructor === TypeError) {
      opts.onReady(this.options);
      return false;
    }

    this.response = {
      url: this.boot.generateApi(this.options),
      headers: this.options.headers
    };

    var request = this.boot.request;
    var xmlParser = this.boot.xmlParser;

    this.AmenityCollection = new AmenityCollection(xmlParser);
    this.CategoryCollection = new CategoryCollection();
    this.DestinationCollection = new DestinationCollection();
    this.DeviceCollection = new DeviceCollection();
    this.EventCollection = EventCollection;
    this.MapCollection = new MapCollection(xmlParser);
    this.PathCollection = new PathCollection();
    this.PathTypeCollection = new PathTypeCollection();
    this.ZoneCollection = new ZoneCollection();

    //Generate model

    request(this.response, function (er, response, body) {
      if (!er) {
        _this.response.response = response;
        _this.response.body = JSON.parse(body);

        //Build out model this is where all collection classes are used to create items
        _this.boot.parseResponse(_this.response.body);

        //Create wayfinding classes
        _this.Wayfinder = new Wayfinder(_this);
        _this.TextDirections = new TextDirections(_this);
      } else {
        console.error(er);
      }

      if (opts.onReady && opts.onReady.constructor === Function) {
        opts.onReady(er);
      }
    });

    //Add to items array
    JMap._items.push(this);
  }

  /**
   * Returns the closest waypoint inside of specified array to the waypoint in the second argument
   * @param {Array/Waypoint} array - Array of waypoints to search through
   * @param {Waypoint} waypoint - Waypoint to compar paths against
   * @param {Boolean} elevator - Force elevator path
   * @return {Waypoint} - Closest waypoint insode array
   */


  _createClass(JMap, [{
    key: 'getClosestWaypointInArrayToWaypoint',
    value: function getClosestWaypointInArrayToWaypoint(array, waypoint, elevator) {
      var closest = {};
      if (!array || !array.length || !waypoint || waypoint.constructor !== Waypoint) return null;
      for (var j = 0; j < array.length; j++) {
        var wp = array[j];
        if (wp.constructor !== Waypoint) continue;
        if (waypoint.id === wp.id) continue;
        var path = this.Wayfinder.search(waypoint, wp, elevator);
        var currentCost = undefined;
        if (path[path.length - 1]) currentCost = path[path.length - 1].cost;
        if (!closest.cost || closest.cost > currentCost) {
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

  }, {
    key: 'getClosestDestinationToWaypoint',
    value: function getClosestDestinationToWaypoint(waypoint, filter, elevator) {
      var _this2 = this;

      if (waypoint.constructor === Waypoint) {
        var _ret = function () {
          var self = _this2;
          filter = filter && filter.constructor === Function ? filter : function () {
            return true;
          };
          var wps = _this2.MapCollection.getWaypointsWithDestination().filter(function (wp) {
            return self.DestinationCollection.getByWaypointId(wp.id).filter(filter)[0];
          });
          var closestWaypoint = _this2.getClosestWaypointInArrayToWaypoint(wps, waypoint, elevator);

          return {
            v: {
              destination: _this2.DestinationCollection.getByWaypointId(closestWaypoint.id).filter(filter)[0],
              waypoint: closestWaypoint
            }
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else {
        return null;
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

  }, {
    key: 'getClosestAmenityToWaypoint',
    value: function getClosestAmenityToWaypoint(waypoint, filter, elevator) {
      var _this3 = this;

      if (waypoint.constructor === Waypoint) {
        var _ret2 = function () {
          var self = _this3;
          filter = filter && filter.constructor === Function ? filter : function () {
            return true;
          };
          var wps = _this3.MapCollection.getWaypointsWithAmenity().filter(function (wp) {
            return self.AmenityCollection.getByWaypointId(wp.id).filter(filter)[0];
          });
          var closestWaypoint = _this3.getClosestWaypointInArrayToWaypoint(wps, waypoint, elevator);

          return {
            v: {
              amenity: _this3.AmenityCollection.getByWaypointId(closestWaypoint.id).filter(filter)[0],
              waypoint: closestWaypoint
            }
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      } else {
        return null;
      }
    }
  }]);

  return JMap;
}();

/**
 * @static JMap#util
 * @member {Utility} - Utility class for JMap
 */


JMap.util = new Utility();
JMap._items = [];

/*
  Export handler used to export into browser or node.js runtime
*/
(function (_export) {
  try {
    window.JMap = _export;
  } catch (e) {
    module.exports = _export;
  }
})(JMap);

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

},{"../models/Amenity/AmenityCollection":4,"../models/Category/CategoryCollection":8,"../models/Destination/DestinationCollection":10,"../models/Device/DeviceCollection":14,"../models/Event/EventCollection":15,"../models/Map/MapCollection":18,"../models/Path/PathCollection":22,"../models/PathType/PathTypeCollection":24,"../models/Waypoint/Waypoint":25,"../models/Zone/ZoneCollection":28,"../text-directions/TextDirections":30,"../utility/Utility":40,"../wayfinding/Wayfinder":46,"./boot":1}],3:[function(require,module,exports){
'use strict';
/** Class representing an amenity. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Amenity = function () {
  /**
   * Create an amenity.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Amenity(model, DOMParser) {
    _classCallCheck(this, Amenity);

    this._ = {
      waypoints: []
    };

    for (var property in model.bean) {
      if (model.bean.hasOwnProperty(property)) {
        this._[property] = model.bean[property];

        //TODO: check for svg file.
        if (property === 'filePath' && property.indexOf('.svg')) {
          try {
            if (this._.svg) {

              //Clean svg
              this._.svg = this._.svg.replace(/\r\n|\r|\n|\t/g, '');
              this._.svg = this._.svg.replace(/\s+/g, ' ');

              //Parse
              this._.svgTree = new DOMParser().parseFromString(this._.svg, 'text/xml');

              //Check for errors
              if (!this._.svgTree || !this._.svgTree.documentElement || this._.svgTree.documentElement.nodeName == 'parsererror') {
                throw new TypeError('Amenity :: input contains invalid XML data');
              }
            }
          } catch (error) {
            throw error;
          }
        }
      }
    }
  }

  _createClass(Amenity, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Number}   Amenity#componentId
     */

  }, {
    key: 'componentId',
    get: function get() {
      return this.get('componentId', null);
    },
    set: function set(componentId) {
      this.set('componentId', componentId, Number, null);
    }

    /**
     * @member {Number}   Amenity#componentTypeId
     */

  }, {
    key: 'componentTypeId',
    get: function get() {
      return this.get('componentTypeId', null);
    },
    set: function set(componentTypeId) {
      this.set('componentTypeId', componentTypeId, Number, null);
    }

    /**
     * @member {String}   Amenity#componentTypeName
     */

  }, {
    key: 'componentTypeName',
    get: function get() {
      return this.get('componentTypeName', '');
    },
    set: function set(componentTypeName) {
      this.set('componentTypeName', componentTypeName, String, '');
    }

    /**
     * @member {String}   Amenity#description
     */

  }, {
    key: 'description',
    get: function get() {
      return this.get('description', '');
    },
    set: function set(description) {
      this.set('description', description, String, '');
    }

    /**
     * @member {Array}   Amenity#destinations
     */

  }, {
    key: 'destinations',
    get: function get() {
      return this.get('destinations', []);
    },
    set: function set(destinations) {
      this.set('destinations', destinations, Array, []);
    }

    /**
     * @member {Number}   Amenity#endDate
     */

  }, {
    key: 'endDate',
    get: function get() {
      return this.get('endDate', null);
    },
    set: function set(endDate) {
      this.set('endDate', endDate, Number, null);
    }

    /**
     * @member {String}   Amenity#filePath
     */

  }, {
    key: 'filePath',
    get: function get() {
      return this.get('filePath', '');
    },
    set: function set(filePath) {
      this.set('filePath', filePath, String, '');
    }

    /**
     * @member {String}   Amenity#iconImagePath
     */

  }, {
    key: 'iconImagePath',
    get: function get() {
      return this.get('iconImagePath', '');
    },
    set: function set(iconImagePath) {
      this.set('iconImagePath', iconImagePath, String, '');
    }

    /**
     * @member {String}   Amenity#localizedText
     */

  }, {
    key: 'localizedText',
    get: function get() {
      return this.get('localizedText', '');
    },
    set: function set(localizedText) {
      this.set('localizedText', localizedText, String, '');
    }

    /**
     * @member {String}   Amenity#position
     */

  }, {
    key: 'position',
    get: function get() {
      return this.get('position', '');
    },
    set: function set(position) {
      this.set('position', position, String, '');
    }

    /**
     * @member {Number}   Amenity#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {Number}   Amenity#startDate
     */

  }, {
    key: 'startDate',
    get: function get() {
      return this.get('startDate', null);
    },
    set: function set(startDate) {
      this.set('startDate', startDate, Number, null);
    }

    /**
     * @member {Array}   Amenity#waypoints
     */

  }, {
    key: 'waypoints',
    get: function get() {
      return this.get('waypoints', []);
    },
    set: function set(waypoints) {
      this.set('waypoints', waypoints, Array, []);
    }
  }]);

  return Amenity;
}();

module.exports = Amenity;

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Amenity = require('./Amenity');

/** Class representing a collection of amenities. */

var AmenityCollection = function () {

  /**
   * Create an amenity collection.
   */

  function AmenityCollection(xmlParser) {
    _classCallCheck(this, AmenityCollection);

    this._items = [];
    //Set SVG XML parser
    if (xmlParser) {
      this.DOMParser = xmlParser;
    } else {
      throw new TypeError('AmenityCollection :: No XML parser provided. Amenity.svgTree will not be available');
    }
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Amenity object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(AmenityCollection, [{
    key: 'isAmenity',
    value: function isAmenity(item) {
      return item && item.constructor === Amenity;
    }

    /**
     * Generate a single or an array of amenities based on the input model data
     * @param {Array/Amenity} model - The model object passed back from the /full payload
     * @return {Array/Amenity} A created amenity instance or an array of amenity instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var _this = this;

      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Amenity(m, _this.DOMParser);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Amenity(model, this.DOMParser);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Amenity objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get a specific amenity by its componentId
     * @param {Number} componentId - The component id used to define an amenity
     * @return {Amenity}
     */

  }, {
    key: 'getByComponentId',
    value: function getByComponentId(componentId) {
      return this._items.find(function (amenity) {
        return amenity.componentId === componentId;
      }) || null;
    }

    /**
     * Get a specific set of amenities by its mapId
     * @param {Number} mapId - The id used to define a map
     * @return {Array} an array of amenities
     */

  }, {
    key: 'getByMapId',
    value: function getByMapId(mapId) {
      return this._items.filter(function (amenity) {
        return amenity.waypoints.find(function (w) {
          return w.mapId === mapId;
        });
      });
    }

    /**
     * Get a specific set of amenities belonging to a waypoint
     * @param {Number} waypointId - The id used to define a waypoint
     * @return {Array} an array of amenities
     */

  }, {
    key: 'getByWaypointId',
    value: function getByWaypointId(waypointId) {
      return this._items.filter(function (amenity) {
        return amenity.waypoints.find(function (w) {
          return w.id === waypointId;
        });
      });
    }
  }]);

  return AmenityCollection;
}();

module.exports = AmenityCollection;

},{"./Amenity":3}],5:[function(require,module,exports){
'use strict';
/** Class representing an Association. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Association = function () {
  /**
   * Create an Association.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Association(model) {
    _classCallCheck(this, Association);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(Association, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Number}   Association#entityId
     */

  }, {
    key: 'entityId',
    get: function get() {
      return this.get('entityId', null);
    },
    set: function set(entityId) {
      this.set('entityId', entityId, Number, null);
    }

    /**
     * @member {Number}   Association#entityTypeId
     */

  }, {
    key: 'entityTypeId',
    get: function get() {
      return this.get('entityTypeId', null);
    },
    set: function set(entityTypeId) {
      this.set('entityTypeId', entityTypeId, Number, null);
    }

    /**
     * @member {Number}   Association#landmarkRating
     */

  }, {
    key: 'landmarkRating',
    get: function get() {
      return this.get('landmarkRating', null);
    },
    set: function set(landmarkRating) {
      this.set('landmarkRating', landmarkRating, Number, null);
    }

    /**
     * @member {Number}   Association#waypointId
     */

  }, {
    key: 'waypointId',
    get: function get() {
      return this.get('waypointId', null);
    },
    set: function set(waypointId) {
      this.set('waypointId', waypointId, Number, null);
    }
  }]);

  return Association;
}();

module.exports = Association;

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Association = require('./Association');
/** Class representing an collection of Associations. */

var AssociationCollection = function () {

  /**
   * Create a collection of Associations.
   */

  function AssociationCollection() {
    _classCallCheck(this, AssociationCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Association object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(AssociationCollection, [{
    key: 'isAssociation',
    value: function isAssociation(item) {
      return item && item.constructor === Association;
    }

    /**
     * Generate a single or an array of devices based on the input model data
     * @param {Array/Association} model - The model object passed back from the /full payload
     * @return {Array/Association} A created Association instance or an array of Association instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Association(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Association(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Association objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * return array of associations associated with an entityId
     * @param {Number} entityId - Number representing each Associations entityId
     * @return {Array/Association} Array of Associations
     */

  }, {
    key: 'getByEntityId',
    value: function getByEntityId(entityId) {
      return this._items.filter(function (a) {
        return a.entityId === entityId;
      });
    }

    /**
     * return array of associations associated with an entityTypeId
     * @param {Number} entityTypeId - Number representing each Associations entityTypeId
     * @return {Array/Association} Array of Associations
     */

  }, {
    key: 'getByEntityTypeId',
    value: function getByEntityTypeId(entityTypeId) {
      return this._items.filter(function (a) {
        return a.entityTypeId === entityTypeId;
      });
    }
  }]);

  return AssociationCollection;
}();

module.exports = AssociationCollection;

},{"./Association":5}],7:[function(require,module,exports){
'use strict';
/** Class representing a category. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Category = function () {
  /**
   * Create a category.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Category(model) {
    _classCallCheck(this, Category);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(Category, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Number}   Category#tegoryType
     */

  }, {
    key: 'categoryType',
    get: function get() {
      return this.get('categoryType', null);
    },
    set: function set(categoryType) {
      this.set('categoryType', categoryType, Number, null);
    }

    /**
     * @member {String}   Category#categoryTypeName
     */

  }, {
    key: 'categoryTypeName',
    get: function get() {
      return this.get('categoryTypeName', '');
    },
    set: function set(categoryTypeName) {
      this.set('categoryTypeName', categoryTypeName, String, '');
    }

    /**
     * @member {String}   Category#clientCategoryId
     */

  }, {
    key: 'clientCategoryId',
    get: function get() {
      return this.get('clientCategoryId', '');
    },
    set: function set(clientCategoryId) {
      this.set('clientCategoryId', clientCategoryId, String, '');
    }

    /**
     * @member {Number}   Category#id
     */

  }, {
    key: 'id',
    get: function get() {
      return this.get('id', null);
    },
    set: function set(id) {
      this.set('id', id, Number, null);
    }

    /**
     * @member {String}   Category#keywords
     */

  }, {
    key: 'keywords',
    get: function get() {
      return this.get('keywords', '');
    },
    set: function set(keywords) {
      this.set('keywords', keywords, String, '');
    }

    /**
     * @member {String}   Category#name
     */

  }, {
    key: 'name',
    get: function get() {
      return this.get('name', '');
    },
    set: function set(name) {
      this.set('name', name, String, '');
    }

    /**
     * @member {Number}   Category#parent
     */

  }, {
    key: 'parent',
    get: function get() {
      return this.get('parent', null);
    },
    set: function set(parent) {
      this.set('parent', parent, Number, null);
    }

    /**
     * @member {Number}   Category#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {String}   Category#text
     */

  }, {
    key: 'text',
    get: function get() {
      return this.get('text', '');
    },
    set: function set(text) {
      this.set('text', text, String, '');
    }
  }]);

  return Category;
}();

module.exports = Category;

},{}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Category = require('./Category');

/** Class representing a collection of categories. */

var CategoryColelction = function () {

  /**
   * Create a collection of categories.
   */

  function CategoryColelction() {
    _classCallCheck(this, CategoryColelction);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Category object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(CategoryColelction, [{
    key: 'isCategory',
    value: function isCategory(item) {
      return item && item.constructor === Category;
    }

    /**
     * Generate a single or an array of category based on the input model data
     * @param {Array/Category} model - The model object passed back from the /full payload
     * @return {Array/Category} A created Category instance or an array of Category instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Category(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Category(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Category objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get a specific category by its categoryType
     * @param {Number} categoryType - The categoryType used to define an category
     * @return {Array}
     */

  }, {
    key: 'getByCategoryType',
    value: function getByCategoryType(categoryType) {
      return this._items.filter(function (c) {
        return c.categoryType === categoryType;
      });
    }

    /**
     * Get a specific category by its categoryTypeName
     * @param {String} categoryTypeName - The categoryTypeName used to define an category
     * @return {Array}
     */

  }, {
    key: 'getByCategoryTypeName',
    value: function getByCategoryTypeName(categoryTypeName) {
      return this._items.filter(function (c) {
        return c.categoryTypeName === categoryTypeName;
      });
    }

    /**
     * Get a specific category by its clientCategoryId
     * @param {String} clientCategoryId - The clientCategoryId used to define an category
     * @return {Array}
     */

  }, {
    key: 'getByClientCategoryId',
    value: function getByClientCategoryId(clientCategoryId) {
      return this._items.filter(function (c) {
        return c.clientCategoryId === clientCategoryId;
      });
    }

    /**
     * Get a specific category by its keyword
     * @param {String} keyword - The keyword used to define an category
     * @return {Array}
     */

  }, {
    key: 'getByKeyword',
    value: function getByKeyword(keyword) {
      if (keyword && keyword.constructor === String) {
        return this._items.filter(function (c) {
          return c.keywords.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
        });
      } else {
        return [];
      }
    }

    /**
     * Get a specific category by its name
     * @param {String} name - The name used to define an category
     * @return {Array}
     */

  }, {
    key: 'getByName',
    value: function getByName(name) {
      if (name && name.constructor === String) {
        return this._items.find(function (c) {
          return c.name.toLowerCase() === name.toLowerCase();
        }) || null;
      } else {
        return null;
      }
    }

    /**
     * Get a specific category by its id
     * @param {Number} id - The id used to define an category
     * @return {Array}
     */

  }, {
    key: 'getById',
    value: function getById(id) {
      return this._items.find(function (c) {
        return c.id === id;
      }) || null;
    }
  }]);

  return CategoryColelction;
}();

module.exports = CategoryColelction;

},{"./Category":7}],9:[function(require,module,exports){
'use strict';
/** Class representing an destination. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Destination = function () {
  /**
   * Create an destination.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Destination(model) {
    _classCallCheck(this, Destination);

    this._ = {
      waypoints: []
    };

    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(Destination, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Array}   Destination#category
     */

  }, {
    key: 'category',
    get: function get() {
      return this.get('category', []);
    },
    set: function set(category) {
      this.set('category', category, Array, []);
    }
    /**
     * @member {Array}   Destination#categoryId
     */

  }, {
    key: 'categoryId',
    get: function get() {
      return this.get('categoryId', []);
    },
    set: function set(categoryId) {
      this.set('categoryId', categoryId, Array, []);
    }

    /**
     * @member {String}   Destination#clientId
     */

  }, {
    key: 'clientId',
    get: function get() {
      return this.get('clientId', '');
    },
    set: function set(clientId) {
      this.set('clientId', clientId, String, '');
    }

    /**
     * @member {String}   Destination#description
     */

  }, {
    key: 'description',
    get: function get() {
      return this.get('description', '');
    },
    set: function set(description) {
      this.set('description', description, String, '');
    }

    /**
     * @member {String}   Destination#descriptionMore
     */

  }, {
    key: 'descriptionMore',
    get: function get() {
      return this.get('descriptionMore', '');
    },
    set: function set(descriptionMore) {
      this.set('descriptionMore', descriptionMore, String, '');
    }

    /**
     * @member {String}   Destination#helperImage
     */

  }, {
    key: 'helperImage',
    get: function get() {
      return this.get('helperImage', '');
    },
    set: function set(helperImage) {
      this.set('helperImage', helperImage, String, '');
    }

    /**
     * @member {Number}   Destination#id
     */

  }, {
    key: 'id',
    get: function get() {
      return this.get('id', null);
    },
    set: function set(id) {
      this.set('id', id, Number, null);
    }

    /**
     * @member {String}   Destination#keywords
     */

  }, {
    key: 'keywords',
    get: function get() {
      return this.get('keywords', '');
    },
    set: function set(keywords) {
      this.set('keywords', keywords, String, '');
    }

    /**
     * @member {String}   Destination#name
     */

  }, {
    key: 'name',
    get: function get() {
      return this.get('name', '');
    },
    set: function set(name) {
      this.set('name', name, String, '');
    }
    /**
     * @member {Number}   Destination#openingDate
     */

  }, {
    key: 'openingDate',
    get: function get() {
      return this.get('openingDate', null);
    },
    set: function set(openingDate) {
      this.set('openingDate', openingDate, Number, null);
    }

    /**
     * @member {Number}   Destination#operatingStatus
     */

  }, {
    key: 'operatingStatus',
    get: function get() {
      return this.get('operatingStatus', null);
    },
    set: function set(operatingStatus) {
      this.set('operatingStatus', operatingStatus, Number, null);
    }

    /**
     * @member {Number}   Destination#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {String}   Destination#qrCodeImage
     */

  }, {
    key: 'qrCodeImage',
    get: function get() {
      return this.get('qrCodeImage', null);
    },
    set: function set(qrCodeImage) {
      this.set('qrCodeImage', qrCodeImage, String, null);
    }

    /**
     * @member {Number}   Destination#sponsoredRating
     */

  }, {
    key: 'sponsoredRating',
    get: function get() {
      return this.get('sponsoredRating', null);
    },
    set: function set(sponsoredRating) {
      this.set('sponsoredRating', sponsoredRating, Number, null);
    }

    /**
     * @member {Array}   Destination#waypoints
     */

  }, {
    key: 'waypoints',
    get: function get() {
      return this.get('waypoints', []);
    },
    set: function set(waypoints) {
      this.set('waypoints', waypoints, Array, []);
    }
  }]);

  return Destination;
}();

module.exports = Destination;

},{}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Destination = require('./Destination');
var Waypoint = require('../Waypoint/Waypoint');

/** Class representing a collection of destination. */

var DestinationCollection = function () {
  /**
   * Create a collection of destinations.
   */

  function DestinationCollection() {
    _classCallCheck(this, DestinationCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Destination object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(DestinationCollection, [{
    key: 'isDestination',
    value: function isDestination(item) {
      return item && item.constructor === Destination;
    }

    /**
     * Generate a single or an array of destinations based on the input model data
     * @param {Array/Destination} model - The model object passed back from the /full payload
     * @return {Array/Destination} A created destination instance or an array of destination instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Destination(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Destination(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Destination objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get a specific destination by its id
     * @param {Number} id - The id used to define a destination
     * @return {Destination}
     */

  }, {
    key: 'getById',
    value: function getById(id) {
      return this._items.find(function (destination) {
        return destination.id === id;
      }) || null;
    }

    /**
     * Get a specific destination by its clientId
     * @param {Number} clientId - The clientId used to define a destination
     * @return {Destination}
     */

  }, {
    key: 'getByClientId',
    value: function getByClientId(clientId) {
      return this._items.find(function (destination) {
        return destination.clientId === clientId;
      }) || null;
    }

    /**
     * Get a specific set of destinations by its mapId
     * @param {Number} mapId - The id used to define a map
     * @return {Array/Destination} an array of destinations
     */

  }, {
    key: 'getByMapId',
    value: function getByMapId(mapId) {
      return this._items.filter(function (destination) {
        return destination.waypoints.find(function (w) {
          return w.mapId === mapId;
        });
      });
    }

    /**
     * Get a specific set of destinations belonging to a waypoint
     * @param {Number} waypointId - The id used to define a waypoint
     * @return {Array/Destination} an array of destinations
     */

  }, {
    key: 'getByWaypointId',
    value: function getByWaypointId(waypointId) {
      return this._items.filter(function (destination) {
        return destination.waypoints.find(function (w) {
          return w.id === waypointId;
        });
      });
    }

    /**
     * Get a specific set of destinations belonging to a zone
     * @param {Number} zoneId - The id used to define a zone
     * @return {Array/Destination} an array of destinations
     */

  }, {
    key: 'getByZoneId',
    value: function getByZoneId(zoneId) {
      return this._items.filter(function (destination) {
        return destination.waypoints.find(function (w) {
          return w.zoneId === zoneId;
        });
      });
    }

    /**
     * Get a specific set of destinations by its categoryId
     * @param {Number} mapId - The id used to define a map
     * @return {Array/Destination} an array of destinations
     */

  }, {
    key: 'getByCategoryId',
    value: function getByCategoryId(categoryId) {
      return this._items.filter(function (destination) {
        return destination.categoryId.find(function (c) {
          return c === categoryId;
        });
      });
    }

    /**
     * Get an array of destinations by its keyword
     * @param {String} keyword - The keyword used to define a destination
     * @return {Array/Destination}
     */

  }, {
    key: 'getByKeyword',
    value: function getByKeyword(keyword) {
      if (keyword && keyword.constructor === String) {
        return this._items.filter(function (d) {
          return d.keywords.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
        });
      } else {
        return [];
      }
    }

    /**
     * Get an array of destinations by its keyword
     * @param {Number} operatingStatus - The operatingStatus of a destination
     * @return {Array}
     */

  }, {
    key: 'getByOperatingStatus',
    value: function getByOperatingStatus(operatingStatus) {
      return this._items.filter(function (d) {
        return d.operatingStatus === operatingStatus;
      });
    }

    /**
     * Get an array of destinations by its keyword
     * @param {Number} operatingStatus - The operatingStatus of a destination
     * @return {Array/Destination}
     */

  }, {
    key: 'getBySponsoredRating',
    value: function getBySponsoredRating(sponsoredRating) {
      return this._items.filter(function (d) {
        return d.sponsoredRating === sponsoredRating;
      });
    }

    /**
     * Get a sorted array of destinations by sponspored rating, highest to lowest
     * @param {Array} - Optional: Array of Destination objects, if none are passed method will return a sorted list of all destinations
     * @return {Array/Destination}
     */

  }, {
    key: 'sortBySponsoredRating',
    value: function sortBySponsoredRating(destinations) {
      if (destinations && destinations.constructor === Array) {
        destinations.forEach(function (d) {
          if (d.constructor !== Destination) {
            throw new TypeError('JMap : All items must be type Destination');
          }
        });
      } else {
        destinations = this._items;
      }

      return destinations.sort(function (a, b) {
        return a.sponsoredRating < b.sponsoredRating ? 1 : b.sponsoredRating < a.sponsoredRating ? -1 : 0;
      });
    }

    /**
     * Get a Destination that has the highest sponsoredRating belonging to specified waypoint
     * @param {Waypoint} - Waypoint object
     * @return {Destination}
     */

  }, {
    key: 'getHighestSponsoredDestinationByWaypoint',
    value: function getHighestSponsoredDestinationByWaypoint(waypoint) {
      var _this = this;

      //Entity type id is 1
      if (waypoint && waypoint.constructor === Waypoint) {
        var associations = waypoint.AssociationCollection.getByEntityTypeId(1);
        var destinations = associations.map(function (a) {
          return _this.getById(a.entityId);
        });
        return this.sortBySponsoredRating(destinations)[0] || null;
      } else {
        return null;
      }
    }
  }]);

  return DestinationCollection;
}();

module.exports = DestinationCollection;

},{"../Waypoint/Waypoint":25,"./Destination":9}],11:[function(require,module,exports){
'use strict';
/** Class representing an DestinationLabel. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DestinationLabel = function () {
  /**
   * Create a DestinationLabel.
   * @param {object} model - The model object passed back from the /full payload
   */

  function DestinationLabel(model) {
    _classCallCheck(this, DestinationLabel);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(DestinationLabel, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }
  }]);

  return DestinationLabel;
}();

module.exports = DestinationLabel;

},{}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DestinationLabel = require('./DestinationLabel');
/** Class representing an collection of DestinationLabels. */

var DestinationLabelCollection = function () {

  /**
   * Create a collection of DestinationLabels.
   */

  function DestinationLabelCollection() {
    _classCallCheck(this, DestinationLabelCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an DestinationLabel object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(DestinationLabelCollection, [{
    key: 'isDestinationLabel',
    value: function isDestinationLabel(item) {
      return item && item.constructor === DestinationLabel;
    }

    /**
     * Generate a single or an array of devices based on the input model data
     * @param {Array/DestinationLabel} model - The model object passed back from the /full payload
     * @return {Array/DestinationLabel} A created DestinationLabel instance or an array of DestinationLabel instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new DestinationLabel(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new DestinationLabel(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all DestinationLabel objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }
  }]);

  return DestinationLabelCollection;
}();

module.exports = DestinationLabelCollection;

},{"./DestinationLabel":11}],13:[function(require,module,exports){
'use strict';
/** Class representing an Device. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Device = function () {
  /**
   * Create an Device.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Device(model) {
    _classCallCheck(this, Device);

    this._ = {
      waypoints: []
    };
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(Device, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {String}   Device#description
     */

  }, {
    key: 'description',
    get: function get() {
      return this.get('description', '');
    },
    set: function set(description) {
      this.set('description', description, String, '');
    }

    /**
     * @member {String}   Device#deviceTypeDescription
     */

  }, {
    key: 'deviceTypeDescription',
    get: function get() {
      return this.get('deviceTypeDescription', '');
    },
    set: function set(deviceTypeDescription) {
      this.set('deviceTypeDescription', deviceTypeDescription, String, '');
    }

    /**
     * @member {Number}   Device#deviceTypeId
     */

  }, {
    key: 'deviceTypeId',
    get: function get() {
      return this.get('deviceTypeId', null);
    },
    set: function set(deviceTypeId) {
      this.set('deviceTypeId', deviceTypeId, Number, null);
    }

    /**
     * @member {String}   Device#heading
     */

  }, {
    key: 'heading',
    get: function get() {
      return this.get('heading', '');
    },
    set: function set(heading) {
      this.set('heading', heading, String, '');
    }

    /**
     * @member {Number}   Device#id
     */

  }, {
    key: 'id',
    get: function get() {
      return this.get('id', null);
    },
    set: function set(id) {
      this.set('id', id, Number, null);
    }

    /**
     * @member {Number}   Device#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {String}   Device#status
     */

  }, {
    key: 'status',
    get: function get() {
      return this.get('status', '');
    },
    set: function set(status) {
      this.set('status', status, String, '');
    }

    /**
     * @member {Array}   Destination#waypoints
     */

  }, {
    key: 'waypoints',
    get: function get() {
      return this.get('waypoints', []);
    },
    set: function set(waypoints) {
      this.set('waypoints', waypoints, Array, []);
    }
  }]);

  return Device;
}();

module.exports = Device;

},{}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Device = require('./Device');
/** Class representing an collection of Devices. */

var DeviceCollection = function () {

  /**
   * Create a collection of Devices.
   */

  function DeviceCollection() {
    _classCallCheck(this, DeviceCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Device object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(DeviceCollection, [{
    key: 'isDevice',
    value: function isDevice(item) {
      return item && item.constructor === Device;
    }

    /**
     * Generate a single or an array of devices based on the input model data
     * @param {Array/Device} model - The model object passed back from the /full payload
     * @return {Array/Device} A created Device instance or an array of Device instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Device(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Device(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Device objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get a specific Device by its componentId
     * @param {Number} componentId - The component id used to define a Device
     * @return {Device}
     */

  }, {
    key: 'getById',
    value: function getById(id) {
      return this._items.find(function (device) {
        return device.id === id;
      }) || null;
    }

    /**
     * Get a specific set of devices by its mapId
     * @param {Number} mapId - The id used to define a map
     * @return {Array} an array of devices
     */

  }, {
    key: 'getByMapId',
    value: function getByMapId(mapId) {
      return this._items.filter(function (Device) {
        return Device.waypoints.find(function (w) {
          return w.mapId === mapId;
        });
      });
    }

    /**
     * Get a specific set of devices belonging to a waypoint
     * @param {Number} waypointId - The id used to define a waypoint
     * @return {Array} an array of devices
     */

  }, {
    key: 'getByWaypointId',
    value: function getByWaypointId(waypointId) {
      return this._items.filter(function (Device) {
        return Device.waypoints.find(function (w) {
          return w.id === waypointId;
        });
      });
    }

    /**
     * Get a specific set of devices by its deviceTypeId
     * @param {Number} deviceTypeId - The deviceTypeId used to define a device type
     * @return {Array} an array of devices
     */

  }, {
    key: 'getByDeviceTypeId',
    value: function getByDeviceTypeId(deviceTypeId) {
      return this._items.filter(function (device) {
        return device.deviceTypeId === deviceTypeId;
      });
    }

    /**
     * Get a specific set of devices by its deviceTypeId
     * @param {String} Status - The status used to define a device type "Active" || "Inactive"
     * @return {Array} an array of devices
     */

  }, {
    key: 'getByStatus',
    value: function getByStatus(status) {
      if (status && status.constructor === String) {
        return this._items.filter(function (device) {
          return device.status.toLowerCase() === status.toLowerCase();
        });
      } else {
        return [];
      }
    }
  }]);

  return DeviceCollection;
}();

module.exports = DeviceCollection;

},{"./Device":13}],15:[function(require,module,exports){
"use strict";

},{}],16:[function(require,module,exports){
'use strict';
/** Class representing an Location. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Location = function () {
  /**
   * Create an Location.
   * @param {object} model - The model object passed back from the /full payload
   *
   */

  function Location(model) {
    _classCallCheck(this, Location);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(Location, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Array}   Location#addresses
     */

  }, {
    key: 'addresses',
    get: function get() {
      return this.get('addresses', []);
    },
    set: function set(addresses) {
      this.set('addresses', addresses, Array, []);
    }

    /**
     * @member {Number}  Location#clientProjectId
     */

  }, {
    key: 'clientProjectId',
    get: function get() {
      return this.get('clientProjectId', '');
    },
    set: function set(clientProjectId) {
      this.set('clientProjectId', clientProjectId, String, []);
    }

    /**
     * @member {Array}   Location#languages
     */

  }, {
    key: 'languages',
    get: function get() {
      return this.get('languages', []);
    },
    set: function set(languages) {
      this.set('languages', languages, Array, []);
    }

    /**
     * @member {Number}  Location#locationId
     */

  }, {
    key: 'locationId',
    get: function get() {
      return this.get('locationId', null);
    },
    set: function set(locationId) {
      this.set('locationId', locationId, Number, null);
    }

    /**
     * @member {String}  Location#locationName
     */

  }, {
    key: 'locationName',
    get: function get() {
      return this.get('locationName', '');
    },
    set: function set(locationName) {
      this.set('locationName', locationName, String, '');
    }

    /**
     * @member {String}  Location#name
     */

  }, {
    key: 'name',
    get: function get() {
      return this.get('name', '');
    },
    set: function set(name) {
      this.set('name', name, String, '');
    }

    /**
     * @member {Number}  Location#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {String}  Location#status
     */

  }, {
    key: 'status',
    get: function get() {
      return this.get('status', '');
    },
    set: function set(status) {
      this.set('status', status, String, '');
    }
  }]);

  return Location;
}();

// Location._items = []


module.exports = Location;

},{}],17:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WaypointCollection = require('../Waypoint/WaypointCollection');
var DestinationLabelCollection = require('../DestinationLabel/DestinationLabelCollection');
var MapLabelCollection = require('../MapLabel/MapLabelCollection');

/** Class representing a Map. */

var Map = function () {
  /**
   * Create a Map.
   * @param {object} model - The model object passed back from the /full payload
   * @param {DOMParser} DOMParser - XML DOM parser window.DOMParser for browser or https://www.npmjs.com/package/xmldom
   */

  function Map(model, DOMParser) {
    _classCallCheck(this, Map);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {

        //Flatten map property
        if (property == 'map') {
          var map = model[property];
          for (var property2 in map) {
            if (map.hasOwnProperty(property2)) {
              this._[property2] = map[property2];
            }
          }

          //Create waypoint collection
        } else if (property == 'waypoints') {
            this.WaypointCollection = new WaypointCollection();
            this.WaypointCollection.create(model[property]);

            //Create Destination Label collection
          } else if (property == 'destinationLabels') {
              this.DestinationLabelCollection = new DestinationLabelCollection();
              this.DestinationLabelCollection.create(model[property]);

              //Create Map Label collection
            } else if (property == 'mapLabels') {
                this.MapLabelCollection = new MapLabelCollection();
                this.MapLabelCollection.create(model[property]);

                //Parse SVG into XML DOM tree
              } else if (property == 'svg' && model[property] && DOMParser) {
                  try {
                    //Clean svg
                    model[property] = model[property].replace(/\r\n|\r|\n|\t/g, '');
                    model[property] = model[property].replace(/\s+/g, ' ');

                    //Parse
                    this._.svgTree = new DOMParser().parseFromString(model[property], 'text/xml');

                    //Check for errors
                    if (!this._.svgTree.documentElement || this._.svgTree.documentElement.nodeName == 'parsererror') {
                      throw new TypeError('Map :: input contains invalid XML data');
                    } else {
                      this._[property] = model[property];
                    }

                    //Parse out LBoxes
                    var rects = this._.svgTree.documentElement.getElementsByTagName('rect');
                    this._.lboxes = [];
                    for (var i = 0; i < rects.length; i++) {
                      var _class = rects[i].getAttribute('class');
                      if (_class === 'LBox') this._.lboxes.push(rects[i]);
                    }

                    //Add *-Layer class to all layers

                    var layers = this._.svgTree.getElementsByTagName('svg')[0].childNodes;
                    for (var j = 0; j < layers.length; j++) {
                      //Get Id of layer
                      var id = layers[j].getAttribute('id');

                      //Make sure its not the <style> tag
                      if (id) {
                        //Remove '_' from id and append as class name
                        var baseName = id.replace(/_.*/, '');
                        if (baseName) {
                          layers[j].setAttribute('name', baseName);
                          layers[j].setAttribute('class', baseName + '-Layer');
                        }
                      }
                    }
                  } catch (error) {
                    throw error;
                  }

                  //Catch any new or stray porperties
                } else {
                    this._[property] = model[property];
                  }
      }
    }
  }

  _createClass(Map, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * Returns the closest amenity to the specified waypoint
     * @param {Object} point - x/y coordinate (can be a waypoint)
     * @param {Object} point.x - x coordinate
     * @param {Object} point.y - y coordinate
     * @param {Number} raduis - raduis of the area to look in, default is 100
     * @return {Array/Waypoint} - An array of waypoints sorted by distance to point
     */

  }, {
    key: 'getWaypointsInArea',
    value: function getWaypointsInArea(point, radius) {
      //Validate input
      if (!point || !point.x || !point.y || point.x.constructor !== Number || point.y.constructor !== Number) {
        throw new TypeError('Map :: first argument by be valid {x: Number, y: Number}');
      }
      if (!radius || radius !== Number) radius = 100;

      //Radius to power of 2
      var radius2 = Math.pow(radius, 2);

      //Collection of found points
      var nodes = [];

      //All Waypoints on this Map
      var collection = this.WaypointCollection;

      //Get waypoint in bounds
      collection.getAll().forEach(function (wp) {
        var xy2 = Math.pow(wp.x - point.x, 2) + Math.pow(wp.y - point.y, 2);
        //Point is inside circle
        if (xy2 < radius2) {
          nodes.push({
            id: wp.id,
            distance: Math.sqrt(xy2)
          });
        }
      });

      // Sort by distance and map to waypoint
      return nodes.sort(function (a, b) {
        return a.distance - b.distance;
      }).map(function (node) {
        return collection.getById(node.id);
      });
    }

    /**
     * @member {WaypointCollection}   Map#WaypointCollection
     */

  }, {
    key: 'WaypointCollection',
    get: function get() {
      return this.get('WaypointCollection', null);
    },
    set: function set(collection) {
      this.set('WaypointCollection', collection, WaypointCollection, null);
    }

    /**
     * @member {DestinationLabelCollection}   Map#DestinationLabelCollection
     */

  }, {
    key: 'DestinationLabelCollection',
    get: function get() {
      return this.get('DestinationLabelCollection', null);
    },
    set: function set(collection) {
      this.set('DestinationLabelCollection', collection, DestinationLabelCollection, null);
    }

    /**
     * @member {MapLabelCollection}   Map#MapLabelCollection
     */

  }, {
    key: 'MapLabelCollection',
    get: function get() {
      return this.get('MapLabelCollection', null);
    },
    set: function set(collection) {
      this.set('MapLabelCollection', collection, MapLabelCollection, null);
    }

    /**
     * @member {Array}   Map#destinationLabels
     */

  }, {
    key: 'destinationLabels',
    get: function get() {
      return this.get('destinationLabels', []);
    },
    set: function set(destinationLabels) {
      this.set('destinationLabels', destinationLabels, Array, []);
    }

    /**
     * @member {Boolean}   Map#defaultMapForDevice
     */

  }, {
    key: 'defaultMapForDevice',
    get: function get() {
      return this.get('defaultMapForDevice', false);
    },
    set: function set(defaultMapForDevice) {
      this.set('defaultMapForDevice', defaultMapForDevice, Boolean, false);
    }

    /**
     * @member {String}   Map#description
     */

  }, {
    key: 'description',
    get: function get() {
      return this.get('description', '');
    },
    set: function set(description) {
      this.set('description', description, String, '');
    }

    /**
     * @member {Number}   Map#floorSequence
     */

  }, {
    key: 'floorSequence',
    get: function get() {
      return this.get('floorSequence', null);
    },
    set: function set(floorSequence) {
      this.set('floorSequence', floorSequence, Number, null);
    }

    /**
     * @member {Number}   Map#locationId
     */

  }, {
    key: 'locationId',
    get: function get() {
      return this.get('locationId', null);
    },
    set: function set(locationId) {
      this.set('locationId', locationId, Number, null);
    }

    /**
     * @member {String}   Map#locationName
     */

  }, {
    key: 'locationName',
    get: function get() {
      return this.get('locationName', '');
    },
    set: function set(locationName) {
      this.set('locationName', locationName, String, '');
    }

    /**
     * @member {Number}   Map#mapId
     */

  }, {
    key: 'mapId',
    get: function get() {
      return this.get('mapId', null);
    },
    set: function set(mapId) {
      this.set('mapId', mapId, Number, null);
    }

    /**
     * @member {String}   Map#name
     */

  }, {
    key: 'name',
    get: function get() {
      return this.get('name', '');
    },
    set: function set(name) {
      this.set('name', name, String, '');
    }

    /**
     * @member {Number}   Map#parentLocationId
     */

  }, {
    key: 'parentLocationId',
    get: function get() {
      return this.get('parentLocationId', null);
    },
    set: function set(parentLocationId) {
      this.set('parentLocationId', parentLocationId, Number, null);
    }

    /**
     * @member {Number}   Map#preference
     */

  }, {
    key: 'preference',
    get: function get() {
      return this.get('preference', null);
    },
    set: function set(preference) {
      this.set('preference', preference, Number, null);
    }

    /**
     * @member {Number}   Map#status
     */

  }, {
    key: 'status',
    get: function get() {
      return this.get('status', null);
    },
    set: function set(status) {
      this.set('status', status, Number, null);
    }

    /**
     * @member {String}   Map#statusDesc
     */

  }, {
    key: 'statusDesc',
    get: function get() {
      return this.get('statusDesc', '');
    },
    set: function set(statusDesc) {
      this.set('statusDesc', statusDesc, String, '');
    }

    /**
     * @member {String}   Map#svgMap
     */

  }, {
    key: 'svgMap',
    get: function get() {
      return this.get('svgMap', '');
    },
    set: function set(svgMap) {
      this.set('svgMap', svgMap, String, '');
    }

    /**
     * @member {String}   Map#thumbnailHTML
     */

  }, {
    key: 'thumbnailHTML',
    get: function get() {
      return this.get('thumbnailHTML', '');
    },
    set: function set(thumbnailHTML) {
      this.set('thumbnailHTML', thumbnailHTML, String, '');
    }

    /**
     * @member {String}   Map#uri
     */

  }, {
    key: 'uri',
    get: function get() {
      return this.get('uri', '');
    },
    set: function set(uri) {
      this.set('uri', uri, String, '');
    }

    /**
     * @member {Number}   Map#xOffset
     */

  }, {
    key: 'xOffset',
    get: function get() {
      return this.get('xOffset', null);
    },
    set: function set(xOffset) {
      this.set('xOffset', xOffset, Number, null);
    }

    /**
     * @member {Number}   Map#xScale
     */

  }, {
    key: 'xScale',
    get: function get() {
      return this.get('xScale', null);
    },
    set: function set(xScale) {
      this.set('xScale', xScale, Number, null);
    }

    /**
     * @member {Number}   Map#yOffset
     */

  }, {
    key: 'yOffset',
    get: function get() {
      return this.get('yOffset', null);
    },
    set: function set(yOffset) {
      this.set('yOffset', yOffset, Number, null);
    }

    /**
     * @member {Number}   Map#yScale
     */

  }, {
    key: 'yScale',
    get: function get() {
      return this.get('yScale', null);
    },
    set: function set(yScale) {
      this.set('yScale', yScale, Number, null);
    }

    /**
     * @member {Array}   Map#mapLabels
     */

  }, {
    key: 'mapLabels',
    get: function get() {
      return this.get('mapLabels', []);
    },
    set: function set(mapLabels) {
      this.set('mapLabels', mapLabels, Array, []);
    }

    /**
     * @member {String}   Map#svg
     */

  }, {
    key: 'svg',
    get: function get() {
      return this.get('svg', '');
    },
    set: function set(svg) {
      this.set('svg', svg, String, '');
    }

    /**
     * @member {String}   Map#svgTree
     */

  }, {
    key: 'svgTree',
    get: function get() {
      var tree = this.get('svgTree', null);
      return tree; //? tree.documentElement : tree
    }

    /**
     * @member {Array}   Map#lboxes
     */

  }, {
    key: 'lboxes',
    get: function get() {
      return this.get('lboxes', []);
    }

    /**
     * @member {Array}   Map#waypoints
     */

  }, {
    key: 'waypoints',
    get: function get() {
      return this.get('waypoints', []);
    },
    set: function set(waypoints) {
      this.set('waypoints', waypoints, Array, []);
    }
  }]);

  return Map;
}();

module.exports = Map;

},{"../DestinationLabel/DestinationLabelCollection":12,"../MapLabel/MapLabelCollection":20,"../Waypoint/WaypointCollection":26}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Map_ = require('./Map');
var Waypoint = require('../Waypoint/Waypoint');
/** Class representing an collection of Maps. */

var MapCollection = function () {

  /**
   * Create a collection of Maps.
   * @param {DOMParser} xmlParser - XML DOM parser window.DOMParser for browser or https://www.npmjs.com/package/xmldom
   * @throws {TypeError} - No XML parser provided. Map.svgTree & Text Directions will not be available.
   */

  function MapCollection(xmlParser) {
    _classCallCheck(this, MapCollection);

    this._items = [];

    //Set SVG XML parser
    if (xmlParser) {
      this.DOMParser = xmlParser;
    } else {
      throw new TypeError('MapCollection :: No XML parser provided. Map.svgTree & Text Directions will not be available');
    }
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Map object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(MapCollection, [{
    key: 'isMap',
    value: function isMap(item) {
      return item && item.constructor === Map_;
    }

    /**
     * Returns a boolean for weather or not argument is constructed as an Waypoint object
     * @param {Object} item - Item to evaluate
     * @return {Boolean} Boolean based on evaluation result
     */

  }, {
    key: 'isWaypoint',
    value: function isWaypoint(item) {
      return item && item.constructor === Waypoint;
    }

    /**
     * Generate a single or an array of devices based on the input model data
     * @param {Array/Map} model - The model object passed back from the /full payload
     * @return {Array/Map} A created Map instance or an array of Map instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var _this = this;

      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Map_(m, _this.DOMParser);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Map_(model, this.DOMParser);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Map objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get Map object associated with floorSequence
     * @param {Number} floorSequence - Number representing each Maps floorSequence
     * @return {Map}
     */

  }, {
    key: 'getByFloorSequence',
    value: function getByFloorSequence(floorSequence) {
      return this._items.find(function (m) {
        return m.floorSequence === floorSequence;
      }) || null;
    }

    /**
     * Get Map object associated with locationId
     * @param {Number} locationId - Number representing each Maps locationId
     * @return {Map}
     */

  }, {
    key: 'getByLocationId',
    value: function getByLocationId(locationId) {
      return this._items.find(function (m) {
        return m.locationId === locationId;
      }) || null;
    }

    /**
     * Get Map object associated with mapId
     * @param {Number} mapId - Number representing each Maps mapId
     * @return {Map}
     */

  }, {
    key: 'getByMapId',
    value: function getByMapId(mapId) {
      return this._items.find(function (m) {
        return m.mapId === mapId;
      }) || null;
    }

    /**
     * Get a set of Map objects associated with Destination
     * @param {Number} destinationId - Number representing a #Destination id
     * @return {Array/Map}
     */

  }, {
    key: 'getByDestinationId',
    value: function getByDestinationId(destinationId) {
      var _this2 = this;

      var waypoints = this.getWaypointsByDestinationId(destinationId);
      return waypoints.map(function (wp) {
        return _this2.getByMapId(wp.mapId);
      });
    }

    /**
     * Get all Waypoint associated with mapId
     * @param {Number} mapId - Number representing each Maps mapId
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getWaypointsByMapId',
    value: function getWaypointsByMapId(mapId) {
      var map = this.getByMapId(mapId);
      return map && map.WaypointCollection ? map.WaypointCollection.getAll() : [];
    }

    /**
     * Get all Waypoint associated with MapCollection
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getAllWaypoints',
    value: function getAllWaypoints() {
      return this._items.reduce(function (wps, map) {
        return map && map.WaypointCollection ? wps.concat(map.WaypointCollection.getAll()) : wps;
      }, []);
    }

    /**
     * Get all Waypoint associated with a Destination
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getWaypointsWithDestination',
    value: function getWaypointsWithDestination() {
      return this.getAllWaypoints().filter(function (wp) {
        return wp.AssociationCollection.getByEntityTypeId(1).length;
      });
    }

    /**
     * Get all Waypoint associated with a Amenity
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getWaypointsWithAmenity',
    value: function getWaypointsWithAmenity() {
      return this.getAllWaypoints().filter(function (wp) {
        return wp.AssociationCollection.getByEntityTypeId(26).length;
      });
    }

    /**
     * Get a single Waypoint associated a waypoint id
     * @param {Number} waypointId - Number representing each Waypoint id
     * @return {Waypoint}
     */

  }, {
    key: 'getWaypointByWaypointId',
    value: function getWaypointByWaypointId(waypointId) {
      return this.getAllWaypoints().find(function (wp) {
        return wp.id === waypointId;
      }) || null;
    }

    /**
     * Get a set of Waypoints associated a destination id
     * @param {Number} destinationId - Number representing each Destination id
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getWaypointsByDestinationId',
    value: function getWaypointsByDestinationId(destinationId) {
      return this.getAllWaypoints().filter(function (wp) {
        return wp.AssociationCollection.getAll().find(function (a) {
          return a.entityId === destinationId;
        });
      });
    }

    /**
     * Get all MapLabel associated with mapId
     * @param {Number} mapId - Number representing each Maps mapId
     * @return {Map}
     */

  }, {
    key: 'getMapLabelsByMapId',
    value: function getMapLabelsByMapId(mapId) {
      var map = this.getByMapId(mapId);
      return map && map.MapLabelCollection ? map.MapLabelCollection.getAll() : [];
    }

    /**
     * Get all MapLabel associated with MapCollection
     * @return {Array/MapLabel}
     */

  }, {
    key: 'getAllMapLabels',
    value: function getAllMapLabels() {
      return this._items.reduce(function (label, map) {
        return map && map.MapLabelCollection ? label.concat(map.MapLabelCollection.getAll()) : label;
      }, []);
    }

    /**
     * Get all DestinationLabel associated with mapId
     * @param {Number} mapId - Number representing each Maps mapId
     * @return {Map}
     */

  }, {
    key: 'getDestinationLabelsByMapId',
    value: function getDestinationLabelsByMapId(mapId) {
      var map = this.getByMapId(mapId);
      return map && map.DestinationLabelCollection ? map.DestinationLabelCollection.getAll() : [];
    }

    /**
     * Get all DestinationLabel associated with MapCollection
     * @return {Array/DestinationLabel}
     */

  }, {
    key: 'getAllDestinationLabels',
    value: function getAllDestinationLabels() {
      return this._items.reduce(function (label, map) {
        return map && map.DestinationLabelCollection ? label.concat(map.DestinationLabelCollection.getAll()) : label;
      }, []);
    }
  }]);

  return MapCollection;
}();

module.exports = MapCollection;

},{"../Waypoint/Waypoint":25,"./Map":17}],19:[function(require,module,exports){
'use strict';
/** Class representing an MapLabel. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapLabel = function () {
  /**
   * Create a MapLabel.
   * @param {object} model - The model object passed back from the /full payload
   */

  function MapLabel(model) {
    _classCallCheck(this, MapLabel);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(MapLabel, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {String}   Device#ck
     */

  }, {
    key: 'ck',
    get: function get() {
      return this.get('ck', '');
    },
    set: function set(ck) {
      this.set('ck', ck, String, '');
    }

    /**
     * @member {Number}   MapLabel#componentId
     */

  }, {
    key: 'componentId',
    get: function get() {
      return this.get('componentId', null);
    },
    set: function set(componentId) {
      this.set('componentId', componentId, Number, null);
    }

    /**
     * @member {String}   MapLabel#componentTypeName
     */

  }, {
    key: 'componentTypeName',
    get: function get() {
      return this.get('componentTypeName', '');
    },
    set: function set(componentTypeName) {
      this.set('componentTypeName', componentTypeName, String, '');
    }

    /**
     * @member {String}   MapLabel#description
     */

  }, {
    key: 'description',
    get: function get() {
      return this.get('description', '');
    },
    set: function set(description) {
      this.set('description', description, String, '');
    }

    /**
     * @member {String}   MapLabel#label
     */

  }, {
    key: 'label',
    get: function get() {
      return this.get('label', '');
    },
    set: function set(label) {
      this.set('label', label, String, '');
    }

    /**
     * @member {String}   MapLabel#localizedText
     */

  }, {
    key: 'localizedText',
    get: function get() {
      return this.get('localizedText', '');
    },
    set: function set(localizedText) {
      this.set('localizedText', localizedText, String, '');
    }

    /**
     * @member {Number}   MapLabel#locationId
     */

  }, {
    key: 'locationId',
    get: function get() {
      return this.get('locationId', null);
    },
    set: function set(locationId) {
      this.set('locationId', locationId, Number, null);
    }

    /**
     * @member {String}   MapLabel#locationX
     */

  }, {
    key: 'locationX',
    get: function get() {
      return this.get('locationX', '');
    },
    set: function set(locationX) {
      this.set('locationX', locationX, String, '');
    }

    /**
     * @member {String}   MapLabel#locationY
     */

  }, {
    key: 'locationY',
    get: function get() {
      return this.get('locationY', '');
    },
    set: function set(locationY) {
      this.set('locationY', locationY, String, '');
    }

    /**
     * @member {Number}   MapLabel#mapId
     */

  }, {
    key: 'mapId',
    get: function get() {
      return this.get('mapId', null);
    },
    set: function set(mapId) {
      this.set('mapId', mapId, Number, null);
    }

    /**
     * @member {Number}   MapLabel#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {String}   MapLabel#rotation
     */

  }, {
    key: 'rotation',
    get: function get() {
      return this.get('rotation', '');
    },
    set: function set(rotation) {
      this.set('rotation', rotation, String, '');
    }

    /**
     * @member {Number}   MapLabel#typeId
     */

  }, {
    key: 'typeId',
    get: function get() {
      return this.get('typeId', null);
    },
    set: function set(typeId) {
      this.set('typeId', typeId, Number, null);
    }

    /**
     * @member {Number}   MapLabel#zoomlevel
     */

  }, {
    key: 'zoomlevel',
    get: function get() {
      return this.get('zoomlevel', null);
    },
    set: function set(zoomlevel) {
      this.set('zoomlevel', zoomlevel, Number, null);
    }
  }]);

  return MapLabel;
}();

module.exports = MapLabel;

},{}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapLabel = require('./MapLabel');
/** Class representing an collection of MapLabels. */

var MapLabelCollection = function () {

  /**
   * Create a collection of MapLabels.
   */

  function MapLabelCollection() {
    _classCallCheck(this, MapLabelCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an MapLabel object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(MapLabelCollection, [{
    key: 'isMapLabel',
    value: function isMapLabel(item) {
      return item && item.constructor === MapLabel;
    }

    /**
     * Generate a single or an array of devices based on the input model data
     * @param {Array/MapLabel} model - The model object passed back from the /full payload
     * @return {Array/MapLabel} A created MapLabel instance or an array of MapLabel instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new MapLabel(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new MapLabel(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all MapLabel objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }
  }]);

  return MapLabelCollection;
}();

module.exports = MapLabelCollection;

},{"./MapLabel":19}],21:[function(require,module,exports){
'use strict';
/** Class representing a Path. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Path = function () {
  /**
   * Create an Path.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Path(model) {
    _classCallCheck(this, Path);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(Path, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Boolean}   Path#defaultWeight
     */

  }, {
    key: 'defaultWeight',
    get: function get() {
      return this.get('defaultWeight', false);
    },
    set: function set(defaultWeight) {
      this.set('defaultWeight', defaultWeight, Boolean, false);
    }

    /**
     * @member {Number}   Path#direction
     */

  }, {
    key: 'direction',
    get: function get() {
      return this.get('direction', null);
    },
    set: function set(direction) {
      this.set('direction', direction, Number, null);
    }

    /**
     * @member {Number}   Path#id
     */

  }, {
    key: 'id',
    get: function get() {
      return this.get('id', null);
    },
    set: function set(id) {
      this.set('id', id, Number, null);
    }

    /**
     * @member {Number}   Path#localId
     */

  }, {
    key: 'localId',
    get: function get() {
      return this.get('localId', null);
    },
    set: function set(localId) {
      this.set('localId', localId, Number, null);
    }

    /**
     * @member {String}   Path#name
     */

  }, {
    key: 'name',
    get: function get() {
      return this.get('name', '');
    },
    set: function set(name) {
      this.set('name', name, String, '');
    }

    /**
     * @member {Number}   Path#status
     */

  }, {
    key: 'status',
    get: function get() {
      return this.get('status', null);
    },
    set: function set(status) {
      this.set('status', status, Number, null);
    }

    /**
     * @member {Number}   Path#type
     */

  }, {
    key: 'type',
    get: function get() {
      return this.get('type', null);
    },
    set: function set(type) {
      this.set('type', type, Number, null);
    }

    /**
     * @member {Array}   Path#waypoints
     */

  }, {
    key: 'waypoints',
    get: function get() {
      return this.get('waypoints', []);
    },
    set: function set(waypoints) {
      this.set('waypoints', waypoints, Array, []);
    }

    /**
     * @member {Number}   Path#weight
     */

  }, {
    key: 'weight',
    get: function get() {
      return this.get('weight', null);
    },
    set: function set(weight) {
      this.set('weight', weight, Number, null);
    }
  }]);

  return Path;
}();

module.exports = Path;

},{}],22:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Path = require('./Path');
/** Class representing a collection of Paths. */

var PathCollection = function () {
  /**
   * Create a collection of Paths.
   */

  function PathCollection() {
    _classCallCheck(this, PathCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Path object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(PathCollection, [{
    key: 'isPath',
    value: function isPath(item) {
      return item && item.constructor === Path;
    }

    /**
     * Generate a single or an array of paths based on the input model data
     * @param {Array/Path} model - The model object passed back from the /full payload
     * @return {Array/Path} A created Path instance or an array of Path instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Path(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Path(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Path objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get all Path objects associated with specifed direction
     * @param {Number} direction - The Number used to define a path direction
     * @return {Array/Path}
     */

  }, {
    key: 'getByDirection',
    value: function getByDirection(direction) {
      return this._items.filter(function (p) {
        return p.direction === direction;
      });
    }

    /**
     * Get Path associated with specifed id
     * @param {Number} id - The Number used to define a path id
     * @return {Path}
     */

  }, {
    key: 'getById',
    value: function getById(id) {
      return this._items.find(function (p) {
        return p.id === id;
      }) || null;
    }

    /**
     * Get Path associated with specifed name
     * @param {String} name - The String used to define a path name
     * @return {Path}
     */

  }, {
    key: 'getByName',
    value: function getByName(name) {
      if (name && name.constructor === String) {
        return this._items.find(function (p) {
          return p.name.toLowerCase() == name.toLowerCase();
        }) || null;
      } else {
        return null;
      }
    }

    /**
     * Get Paths associated with specifed status
     * @param {String} status - The String used to define a path status
     * @return {Array/Path}
     */

  }, {
    key: 'getByStatus',
    value: function getByStatus(status) {
      return this._items.filter(function (p) {
        return p.status === status;
      });
    }

    /**
     * Get Paths associated with specifed type
     * @param {Number} type - The Number used to define a path type
     * @return {Array/Path}
     */

  }, {
    key: 'getByType',
    value: function getByType(type) {
      return this._items.filter(function (p) {
        return p.type === type;
      });
    }

    /**
     * Get Paths associated with specifed waypointId
     * @param {Number} waypointId - The Number used to define a path waypointId
     * @return {Array/Path}
     */

  }, {
    key: 'getByWaypointId',
    value: function getByWaypointId(waypointId) {
      return this._items.filter(function (p) {
        return p.waypoints.find(function (wp) {
          return wp === waypointId;
        });
      });
    }

    /**
     * Get Paths associated with specifed weight
     * @param {Number} weight - The Number used to define a path weight
     * @return {Array/Path}
     */

  }, {
    key: 'getByWeight',
    value: function getByWeight(weight) {
      return this._items.filter(function (p) {
        return p.weight === weight;
      });
    }
  }]);

  return PathCollection;
}();

module.exports = PathCollection;

},{"./Path":21}],23:[function(require,module,exports){
'use strict';
/** Class representing a PathType. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PathType = function () {
  /**
   * Create an PathType.
   * @param {object} model - The model object passed back from the /full payload
   */

  function PathType(model) {
    _classCallCheck(this, PathType);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(PathType, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Number}   PathType#accessibility
     */

  }, {
    key: 'accessibility',
    get: function get() {
      return this.get('accessibility', null);
    },
    set: function set(accessibility) {
      this.set('accessibility', accessibility, Number, null);
    }

    /**
     * @member {String}   PathType#description
     */

  }, {
    key: 'description',
    get: function get() {
      return this.get('description', '');
    },
    set: function set(description) {
      this.set('description', description, String, '');
    }

    /**
     * @member {Number}   PathType#direction
     */

  }, {
    key: 'direction',
    get: function get() {
      return this.get('direction', null);
    },
    set: function set(direction) {
      this.set('direction', direction, Number, null);
    }

    /**
     * @member {Number}   PathType#maxfloors
     */

  }, {
    key: 'maxfloors',
    get: function get() {
      return this.get('maxfloors', null);
    },
    set: function set(maxfloors) {
      this.set('maxfloors', maxfloors, Number, null);
    }

    /**
     * @member {String}   PathType#metaData
     */

  }, {
    key: 'metaData',
    get: function get() {
      return this.get('metaData', '');
    },
    set: function set(metaData) {
      this.set('metaData', metaData, String, '');
    }

    /**
     * @member {Number}   PathType#pathTypeId
     */

  }, {
    key: 'pathTypeId',
    get: function get() {
      return this.get('pathTypeId', null);
    },
    set: function set(pathTypeId) {
      this.set('pathTypeId', pathTypeId, Number, null);
    }

    /**
     * @member {Number}   PathType#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {Number}   PathType#speed
     */

  }, {
    key: 'speed',
    get: function get() {
      return this.get('speed', null);
    },
    set: function set(speed) {
      this.set('speed', speed, Number, null);
    }

    /**
     * @member {String}   PathType#typeName
     */

  }, {
    key: 'typeName',
    get: function get() {
      return this.get('typeName', '');
    },
    set: function set(typeName) {
      this.set('typeName', typeName, String, '');
    }

    /**
     * @member {Number}   PathType#typeidPK
     */

  }, {
    key: 'typeidPK',
    get: function get() {
      return this.get('typeidPK', null);
    },
    set: function set(typeidPK) {
      this.set('typeidPK', typeidPK, Number, null);
    }

    /**
     * @member {Number}   PathType#weight
     */

  }, {
    key: 'weight',
    get: function get() {
      return this.get('weight', null);
    },
    set: function set(weight) {
      this.set('weight', weight, Number, null);
    }
  }]);

  return PathType;
}();

module.exports = PathType;

},{}],24:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PathType = require('./PathType');
/** Class representing a collection of PathTypes. */

var PathTypeCollection = function () {
  /**
   * Create a collection of PathTypes.
   */

  function PathTypeCollection() {
    _classCallCheck(this, PathTypeCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an PathType object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(PathTypeCollection, [{
    key: 'isPathType',
    value: function isPathType(item) {
      return item && item.constructor === PathType;
    }

    /**
     * Generate a single or an array of pathTypes based on the input model data
     * @param {Array/PathType} model - The model object passed back from the /full payload
     * @return {Array/PathType} A created PathType instance or an array of PathType instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new PathType(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new PathType(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all PathType objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get a specific set of pathTypes by its pathTypeId
     * @param {Number} pathTypeId - The pathTypeId used to define a pathType
     * @return {Array} an array of PathTypes
     */

  }, {
    key: 'getByPathTypeId',
    value: function getByPathTypeId(pathTypeId) {
      return this._items.find(function (pathType) {
        return pathType.pathTypeId === pathTypeId;
      }) || null;
    }

    /**
     * Get a specific set of pathTypes by its deviceTypeId
     * @param {String} typeName - The typeName used to define a PathType
     * @return {Array} an array of PathTypes
     */

  }, {
    key: 'getByTypeName',
    value: function getByTypeName(typeName) {
      if (typeName && typeName.constructor === String) {
        return this._items.find(function (pathType) {
          return pathType.typeName.toLowerCase() === typeName.toLowerCase();
        }) || null;
      } else {
        return null;
      }
    }

    /**
     * Get a specific set of PathType by its direction
     * @param {Number} direction - The direction used to define a device type
     * @return {Array} an array of PathType
     */

  }, {
    key: 'getByDirection',
    value: function getByDirection(direction) {
      return this._items.filter(function (device) {
        return device.direction === direction;
      });
    }

    /**
     * Get a sorted array of PathType by accessibility, highest to lowest
     * @return {Array/Destination}
     */

  }, {
    key: 'sortByAccessibility',
    value: function sortByAccessibility() {
      return this._items.sort(function (a, b) {
        return a.accessibility < b.accessibility ? 1 : b.accessibility < a.accessibility ? -1 : 0;
      });
    }

    /**
     * Get a sorted array of PathType by weight, highest to lowest
     * @return {Array/Destination}
     */

  }, {
    key: 'sortByWeight',
    value: function sortByWeight() {
      return this._items.sort(function (a, b) {
        return a.weight < b.weight ? 1 : b.weight < a.weight ? -1 : 0;
      });
    }
  }]);

  return PathTypeCollection;
}();

module.exports = PathTypeCollection;

},{"./PathType":23}],25:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AssociationCollection = require('../Association/AssociationCollection');

/** Class representing a Waypoint. */

var Waypoint = function () {
  /**
   * Create a Waypoint.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Waypoint(model) {
    _classCallCheck(this, Waypoint);

    this._ = {};

    this.AssociationCollection = new AssociationCollection();

    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        if (property == 'associations') {
          this.AssociationCollection.create(model[property]);
        } else {
          this._[property] = model[property];
        }
      }
    }
  }

  _createClass(Waypoint, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {AssociationCollection}   Waypoint#AssociationCollection
     */

  }, {
    key: 'AssociationCollection',
    get: function get() {
      return this.get('AssociationCollection', null);
    },
    set: function set(collection) {
      this.set('AssociationCollection', collection, AssociationCollection, null);
    }

    /**
     * @member {Number}   Waypoint#decisionPoint
     */

  }, {
    key: 'decisionPoint',
    get: function get() {
      return this.get('decisionPoint', null);
    },
    set: function set(decisionPoint) {
      this.set('decisionPoint', decisionPoint, Number, null);
    }

    /**
     * @member {Number}   Waypoint#id
     */

  }, {
    key: 'id',
    get: function get() {
      return this.get('id', null);
    },
    set: function set(id) {
      this.set('id', id, Number, null);
    }

    /**
     * @member {Number}   Waypoint#localId
     */

  }, {
    key: 'localId',
    get: function get() {
      return this.get('localId', null);
    },
    set: function set(localId) {
      this.set('localId', localId, Number, null);
    }

    /**
     * @member {Number}   Waypoint#mapId
     */

  }, {
    key: 'mapId',
    get: function get() {
      return this.get('mapId', null);
    },
    set: function set(mapId) {
      this.set('mapId', mapId, Number, null);
    }

    /**
     * @member {Number}   Waypoint#status
     */

  }, {
    key: 'status',
    get: function get() {
      return this.get('status', null);
    },
    set: function set(status) {
      this.set('status', status, Number, null);
    }

    /**
     * @member {Number}   Waypoint#x
     */

  }, {
    key: 'x',
    get: function get() {
      return this.get('x', 0);
    },
    set: function set(x) {
      this.set('x', x, Number, 0);
    }

    /**
     * @member {Number}   Waypoint#y
     */

  }, {
    key: 'y',
    get: function get() {
      return this.get('y', 0);
    },
    set: function set(y) {
      this.set('y', y, Number, 0);
    }

    /**
     * @member {Array}   Waypoint#point - x/y coordinates inside array [x, y]
     */

  }, {
    key: 'point',
    get: function get() {
      return [this.x, this.y];
    }

    /**
     * @member {Number}   Waypoint#zoneId
     */

  }, {
    key: 'zoneId',
    get: function get() {
      return this.get('zoneId', null);
    },
    set: function set(zoneId) {
      this.set('zoneId', zoneId, Number, null);
    }
  }]);

  return Waypoint;
}();

module.exports = Waypoint;

},{"../Association/AssociationCollection":6}],26:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Waypoint = require('./Waypoint');

/** Class representing an collection of Waypoints. */

var WaypointCollection = function () {

  /**
   * Create a collection of Waypoints.
   */

  function WaypointCollection() {
    _classCallCheck(this, WaypointCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Waypoint object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(WaypointCollection, [{
    key: 'isWaypoint',
    value: function isWaypoint(item) {
      return item && item.constructor === Waypoint;
    }

    /**
     * Generate a single or an array of devices based on the input model data
     * @param {Array/Waypoint} model - The model object passed back from the /full payload
     * @return {Array/Waypoint} A created Waypoint instance or an array of Waypoint instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Waypoint(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Waypoint(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Waypoint objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * Get Waypoint object associated with id
     * @param {Number} id - Number representing each Waypoints id
     * @return {Waypoint}
     */

  }, {
    key: 'getById',
    value: function getById(id) {
      return this._items.find(function (wp) {
        return wp.id === id;
      }) || null;
    }

    /**
     * Get Waypoint objects associated with mapId
     * @param {Number} mapId - Number representing each Waypoints mapId
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getByMapId',
    value: function getByMapId(mapId) {
      return this._items.filter(function (wp) {
        return wp.mapId === mapId;
      });
    }

    /**
     * Get Waypoint objects associated with status
     * @param {Number} status - Number representing each Waypoints status
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getByStatus',
    value: function getByStatus(status) {
      return this._items.filter(function (wp) {
        return wp.status === status;
      });
    }

    /**
     * Get Waypoint objects associated with zoneId
     * @param {Number} zoneId - Number representing each Waypoints zoneId
     * @return {Array/Waypoint}
     */

  }, {
    key: 'getByZoneId',
    value: function getByZoneId(zoneId) {
      return this._items.filter(function (wp) {
        return wp.zoneId === zoneId;
      });
    }
  }]);

  return WaypointCollection;
}();

module.exports = WaypointCollection;

},{"./Waypoint":25}],27:[function(require,module,exports){
'use strict';
/** Class representing an Zone. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Zone = function () {
  /**
   * Create an Zone.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Zone(model) {
    _classCallCheck(this, Zone);

    this._ = {};
    for (var property in model) {
      if (model.hasOwnProperty(property)) {
        this._[property] = model[property];
      }
    }
  }

  _createClass(Zone, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {String}   Zone#entityId
     */

  }, {
    key: 'clientId',
    get: function get() {
      return this.get('clientId', null);
    },
    set: function set(clientId) {
      this.set('clientId', clientId, String, null);
    }

    /**
     * @member {Number}   Zone#projectId
     */

  }, {
    key: 'projectId',
    get: function get() {
      return this.get('projectId', null);
    },
    set: function set(projectId) {
      this.set('projectId', projectId, Number, null);
    }

    /**
     * @member {Number}   Zone#statusCode
     */

  }, {
    key: 'statusCode',
    get: function get() {
      return this.get('statusCode', null);
    },
    set: function set(statusCode) {
      this.set('statusCode', statusCode, Number, null);
    }

    /**
     * @member {Number}   Zone#zoneId
     */

  }, {
    key: 'zoneId',
    get: function get() {
      return this.get('zoneId', null);
    },
    set: function set(zoneId) {
      this.set('zoneId', zoneId, Number, null);
    }

    /**
     * @member {Array}   Zone#zoneDetails
     */

  }, {
    key: 'zoneDetails',
    get: function get() {
      return this.get('zoneDetails', null);
    },
    set: function set(zoneDetails) {
      this.set('zoneDetails', zoneDetails, Array, null);
    }
  }]);

  return Zone;
}();

module.exports = Zone;

},{}],28:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Zone = require('./Zone');
/** Class representing a collection of Zones. */

var ZoneCollection = function () {

  /**
   * Create a collection of Zones.
   */

  function ZoneCollection() {
    _classCallCheck(this, ZoneCollection);

    this._items = [];
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Zone object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */


  _createClass(ZoneCollection, [{
    key: 'isZone',
    value: function isZone(item) {
      return item && item.constructor === Zone;
    }

    /**
     * Generate a single or an array of devices based on the input model data
     * @param {Array/Zone} model - The model object passed back from the /full payload
     * @return {Array/Zone} A created Zone instance or an array of Zone instances
     */

  }, {
    key: 'create',
    value: function create(model) {
      var res = null;
      if (model) {
        if (model.constructor === Array) {
          res = model.map(function (m) {
            return new Zone(m);
          });
          this._items = this._items.concat(res);
        } else if (model.constructor === Object) {
          res = new Zone(model);
          this._items.push(res);
        }
      }
      return res;
    }

    /**
     * Get all Zone objects
     * @return {Array}
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._items;
    }

    /**
     * return array of associations associated with a clientId
     * @param {Number} clientId - Number representing each Zones clientId
     * @return {Zone} Zone Object
     */

  }, {
    key: 'getByClientId',
    value: function getByClientId(clientId) {
      return this._items.filter(function (z) {
        return z.clientId === clientId;
      });
    }

    /**
     * return array of associations associated with a zoneId
     * @param {Number} zoneId - Number representing each Zones zoneId
     * @return {Zone} Zone Object
     */

  }, {
    key: 'getByZoneId',
    value: function getByZoneId(zoneId) {
      return this._items.filter(function (z) {
        return z.zoneId === zoneId;
      });
    }

    /**
     * return array of associations associated with a statusCode
     * @param {Number} statusCode - Number representing each Zones statusCode
     * @return {Array/Zone} Array of Zones
     */

  }, {
    key: 'getByStatusCode',
    value: function getByStatusCode(statusCode) {
      return this._items.filter(function (z) {
        return z.statusCode === statusCode;
      });
    }
  }]);

  return ZoneCollection;
}();

module.exports = ZoneCollection;

},{"./Zone":27}],29:[function(require,module,exports){
'use strict';
/** Class representing an Instruction. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instruction = function () {
  /**
   * Create an Instruction.
   * @param {object} model - The model object passed back from the /full payload
   */

  function Instruction() {
    _classCallCheck(this, Instruction);
  }

  _createClass(Instruction, [{
    key: 'foldToBack',
    value: function foldToBack(instruction) {
      // Fold it and its points accordingly
      // Make sure there if Front array
      if (!this.foldedPointsFront) {
        this.foldedPointsFront = [];
      }
      // Make sure there if Back array
      if (!this.foldedPointsBack) {
        this.foldedPointsBack = [];
      }

      // Add it
      // Add to front end
      this.foldedPointsBack.push(instruction);
    }
  }, {
    key: 'foldInFront',
    value: function foldInFront(instruction) {
      // Fold it and its points accordingly
      // Make sure there if Front array
      if (!this.foldedPointsFront) {
        this.foldedPointsFront = [];
      }
      // Make sure there if Back array
      if (!this.foldedPointsBack) {
        this.foldedPointsBack = [];
      }

      // Add it
      // Add to front end
      this.foldedPointsFront.push(instruction);
    }

    /**
     * @member {Number}   Instruction#entityId
     */
    /**
     * @member {Number}   Instruction#angleToLandmark
     */
    /**
     * @member {Number}   Instruction#angleToNext
     */
    /**
     * @member {Number}   Instruction#angleToNextOfPreviousDirection
     */
    /**
     * @member {String}   Instruction#direction
     */
    /**
     * @member {String}   Instruction#directionToLandmark
     */
    /**
     * @member {Number}   Instruction#distanceFromStartMeters
     */
    /**
     * @member {Number}   Instruction#distanceFromStartPixels
     */
    /**
     * @member {Number}   Instruction#distanceToNextMeters
     */
    /**
     * @member {Number}   Instruction#distanceToNextPixels
     */
    /**
     * @member {Number}   Instruction#floor
     */
    /**
     * @member {String}   Instruction#floorName
     */
    /**
     * @member {Array}   Instruction#foldedPointsBack
     */
    /**
     * @member {Array}   Instruction#foldedPointsFront
     */
    /**
     * @member {Destination}   Instruction#landmarkDestination
     */
    /**
     * @member {Waypoint}   Instruction#landmarkWP
     */
    /**
     * @member {String}   Instruction#output
     */
    /**
     * @member {Array}   Instruction#secondaryDirections
     */
    /**
     * @member {String}   Instruction#type
     */
    /**
     * @member {Waypoint}   Instruction#wp
     */

  }]);

  return Instruction;
}();

module.exports = Instruction;

},{}],30:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var makeTextDirections = require('./makeTextDirections');
var lineOfSight = require('./lineOfSight');

/** Class representing an InstructionCompiler object used to generate text directions from an array of #WayfindData*/

var InstructionCompiler =
/**
 * Create a new InstructionCompiler object
 * @param {JMap} jmap - constructed jmap object
 */
function InstructionCompiler(jmap) {
  _classCallCheck(this, InstructionCompiler);

  //Build shapes object
  var self = this;
  this.shapes = {};
  jmap.MapCollection.getAll().forEach(function (map) {
    self.shapes[map.mapId] = {
      lboxes: map.lboxes
    };
  });

  this.model = {
    getWaypointInformation: function getWaypointInformation(x) {
      return jmap.MapCollection.getWaypointByWaypointId(x);
    },
    getFloorBySequence: function getFloorBySequence(x) {
      return jmap.MapCollection.getByFloorSequence(x);
    },
    getFloorById: function getFloorById(x) {
      return jmap.MapCollection.getByMapId(x);
    },
    getDestinationByWaypointId: function getDestinationByWaypointId(x) {
      return jmap.DestinationCollection.getByWaypointId(x);
    },
    getWaypointsByDestinationId: function getWaypointsByDestinationId(x) {
      return jmap.MapCollection.getWaypointsByDestinationId(x);
    },

    destinations: jmap.DestinationCollection.getAll()
  };

  //Init methods
  makeTextDirections(this);
  lineOfSight(this);
};

/** Wrapper Class representing a TextDirections object used to generate text directions from an array of #WayfindData*/


var TextDirections = function () {
  /**
   * Create a new TextDirections object
   * @param {JMap} jmap - constructed jmap object
   */

  function TextDirections(jmap) {
    _classCallCheck(this, TextDirections);

    /**
     * @member {Object}   TextDirections#directionData
     */
    this.directionData = {
      filter: true,
      UTurnInMeters: 30,
      addTDifEmptyMeters: 50
    };

    /**
     * @member {InstructionCompiler}   TextDirections#compiler
     */
    this.compiler = new InstructionCompiler(jmap);
  }

  /**
   * Get Array of Instructions from an array of WayfindData
   * @param {Array/WayfindData} pointArray - Number representing each Maps floorSequence
   * @param {Boolean} filter - Filter instructions or not, based on Jibestream standard algorithm
   * @param {Number} UTurnInMeters - Amount of meters used in order to justify a Utrn has occured (set to 0 to disable uturns)
   * @param {Number} addTDifEmptyMeters - Amount of meters to justify a 'Continue past' instruction
   * @return {Array/Instructions}
   */


  _createClass(TextDirections, [{
    key: 'compile',
    value: function compile(pointArray, filter, UTurnInMeters, addTDifEmptyMeters) {
      if (!pointArray || pointArray.length === 0) {
        throw new TypeError('TextDirections :: pointArray must have length greater than zero.');
      }

      return this.compiler.makeTextDirections({
        pointArray: pointArray,
        filter: filter || this.directionData.filter,
        UTurnInMeters: UTurnInMeters || this.directionData.UTurnInMeters,
        addTDifEmptyMeters: addTDifEmptyMeters || this.directionData.addTDifEmptyMeters
      });
    }
  }]);

  return TextDirections;
}();

module.exports = TextDirections;

},{"./lineOfSight":38,"./makeTextDirections":39}],31:[function(require,module,exports){
'use strict';

var __ = require('../helpers');

module.exports = function comboDirections(inst) {

  var loopTo = inst.textDirectionsFloorArray.length - 1;
  var consecutiveArrayDirection = [];
  var consecutiveArrayTimes = [];
  var firstConsecutiveInstruction = null;
  for (var i = 1; i < loopTo; i++) {
    // Fold second last
    var currentInstruction = inst.textDirectionsFloorArray[i];

    // Different landmark?
    if (!firstConsecutiveInstruction || firstConsecutiveInstruction.landmarkDestination.id != currentInstruction.landmarkDestination.id) {
      // Process array if more than 1
      if (consecutiveArrayDirection.length > 1) {
        // combinedDirections
        var combinedDirections = '';
        var nextDirection = '';
        var consecutive = [];
        for (var j = 0; j < consecutiveArrayDirection.length; j++) {
          nextDirection = consecutiveArrayDirection[j];
          var nextDirectionTimes = consecutiveArrayTimes[j];

          // Avoid "Forward" unless this is the last textDirection
          var canPass = true;
          if (nextDirection.toLowerCase() === 'Forward'.toLowerCase() && j < consecutiveArrayDirection.length - 1)
            // -1 is to allow for last consecutive direction to be Forward
            {
              // Do not process
              canPass = false;
              //NSLog(@"Forward blocked");
            }
          if (canPass) {
            // Make string
            var nextCombinedDirection = '';
            // Singular or plural
            if (nextDirectionTimes == 1) {
              // Singular
              nextCombinedDirection = __.stringWithFormat('%', nextDirection);
            } else {
              // Plural
              nextCombinedDirection = __.stringWithFormat('% % times', nextDirection, nextDirectionTimes);
            }

            consecutive.push({
              direction: nextDirection,
              amount: nextDirectionTimes
            });

            // Last?
            if (j != consecutiveArrayDirection.length - 1) {
              // Not Last
              nextCombinedDirection += ', then ';
            }

            // combinedDirections
            combinedDirections += nextCombinedDirection;
          }
        }

        // Combine firstConsecutiveInstruction output
        var newOutput = __.stringWithFormat('With % on your %, go %.', firstConsecutiveInstruction.landmarkDestination.name, firstConsecutiveInstruction.directionToLandmark, combinedDirections);

        //Remove first item in consecutive array, belongs to initial instruction
        consecutive.shift();

        // Update
        firstConsecutiveInstruction.type = 'combo';
        firstConsecutiveInstruction.secondaryDirections = consecutive;
        firstConsecutiveInstruction.output = newOutput;
      }
      // Reset array
      consecutiveArrayDirection = [];
      consecutiveArrayTimes = [];

      // Next consecutive
      firstConsecutiveInstruction = currentInstruction;

      // Add first direction
      consecutiveArrayDirection.push(firstConsecutiveInstruction.direction);
      consecutiveArrayTimes.push(1);
    } else {
      // Add direction to array
      // Unless the last direction is same as this one, then add another step to it
      var lastObject = consecutiveArrayDirection[consecutiveArrayDirection.length - 1];
      if (lastObject.toLowerCase() === currentInstruction.direction.toLowerCase()) {
        // NOTE: Do not count up in case of Forward.
        // Bad:  With X on your Left, go Forward 3 times.
        // Good: With X on your Left, go Forward
        if (currentInstruction.direction.toLowerCase() !== 'Forward'.toLowerCase()) {
          // Inc one more
          var currentCounter = consecutiveArrayTimes[consecutiveArrayTimes.length - 1];
          currentCounter++;
          // Delete last object
          consecutiveArrayTimes.pop();
          // Add new
          consecutiveArrayTimes.push(currentCounter);
        }
      } else {
        // Add first different direction
        consecutiveArrayDirection.push(currentInstruction.direction);
        consecutiveArrayTimes.push(1);
      }

      // Fold current into firstConsecutiveInstruction
      firstConsecutiveInstruction.foldInFront(currentInstruction);

      // Remove from textDirectionsFloorArray
      inst.textDirectionsFloorArray.splice(i, 1);

      // Dec loopTo
      loopTo--;
      // Go back one index
      i--;
    }
  }
};

/*

// Filter No.5 Redundant instructions in the Middle of Instructions (combo-directions)
-(void)filterNo5RedundantInstructionsInMiddleInstructionsComboDirections:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    NSInteger loopTo = [*textDirectionsFloorArray count] - 1;
    NSMutableArray *consecutiveArrayDirection = [[NSMutableArray alloc] init];
    NSMutableArray *consecutiveArrayTimes = [[NSMutableArray alloc] init];
    JMapTextDirectionInstruction *firstConsecutiveInstruction = nil;
    for(int i = 1; i < loopTo; i++)
    {
        // Fold second last
        JMapTextDirectionInstruction *currentInstruction = [*textDirectionsFloorArray objectAtIndex:i];

        // Different landmark?
        if(firstConsecutiveInstruction.landmarkDestination.id.intValue != currentInstruction.landmarkDestination.id.intValue)
        {
            // Process array if more than 1
            if(consecutiveArrayDirection.count > 1)
            {
                // combinedDirections
                NSString *combinedDirections = @"";
                for(int j = 0; j < consecutiveArrayDirection.count; j++)
                {
                    NSString *nextDirection = [consecutiveArrayDirection objectAtIndex:j];
                    NSNumber *nextDirectionTimes = [consecutiveArrayTimes objectAtIndex:j];
                    
                    // Avoid "Forward" unless this is the last textDirection
                    BOOL canPass = YES;
                    if(([nextDirection.lowercaseString isEqualToString:@"Forward".lowercaseString]) &&
                       (j < (consecutiveArrayDirection.count - 1)))
                        // -1 is to allow for last consecutive direction to be Forward
                    {
                        // Do not process
                        canPass = NO;
                        //NSLog(@"Forward blocked");
                    }
                    if(canPass)
                    {
                        // Make string
                        NSString *nextCombinedDirection = @"";
                        // Singular or plural
                        if(nextDirectionTimes.intValue == 1)
                        {
                            // Singular
                            nextCombinedDirection = [NSString stringWithFormat:@"%@", nextDirection];
                        }
                        else
                        {
                            // Plural
                            nextCombinedDirection = [NSString stringWithFormat:@"%@ %@ times", nextDirection, nextDirectionTimes];
                        }
                        // Last?
                        if(j != (consecutiveArrayDirection.count - 1))
                        {
                            // Not Last
                            nextCombinedDirection = [nextCombinedDirection stringByAppendingString:@", then "];
                        }
                        
                        // combinedDirections
                        combinedDirections = [combinedDirections stringByAppendingString:nextCombinedDirection];
                    }
                }
                
                // Combine firstConsecutiveInstruction output
                NSString *newOutput = [NSString stringWithFormat:@"With %@ on your %@, go %@.", firstConsecutiveInstruction.landmarkDestination.name, firstConsecutiveInstruction.directionToLandmark, combinedDirections];
                
                // Update
                firstConsecutiveInstruction.output = newOutput;
            }
            // Reset array
            [consecutiveArrayDirection removeAllObjects];
            [consecutiveArrayTimes removeAllObjects];
            
            // Next consecutive
            firstConsecutiveInstruction = currentInstruction;
            
            // Add first direction
            [consecutiveArrayDirection addObject:firstConsecutiveInstruction.direction];
            [consecutiveArrayTimes addObject:[NSNumber numberWithInt:1]];
        }
        else
        {
            // Add direction to array
            // Unless the last direction is same as this one, then add another step to it
            if([((NSString *)[consecutiveArrayDirection lastObject]).lowercaseString isEqualToString:currentInstruction.direction.lowercaseString])
            {
                // NOTE: Do not count up in case of Forward.
                // Bad:  With X on your Left, go Forward 3 times.
                // Good: With X on your Left, go Forward
                if(![currentInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                {
                    // Inc one more
                    int currentCounter = [[consecutiveArrayTimes lastObject] intValue];
                    currentCounter++;
                    // Delete last object
                    [consecutiveArrayTimes removeLastObject];
                    // Add new
                    [consecutiveArrayTimes addObject:[NSNumber numberWithInt:currentCounter]];
                }
            }
            else
            {
                // Add first different direction
                [consecutiveArrayDirection addObject:currentInstruction.direction];
                [consecutiveArrayTimes addObject:[NSNumber numberWithInt:1]];
            }
            
            // Fold current into firstConsecutiveInstruction
            [firstConsecutiveInstruction foldInFront:currentInstruction];
            
            // Remove from textDirectionsFloorArray
            [*textDirectionsFloorArray removeObjectAtIndex:i];
            
            // Dec loopTo
            loopTo--;
            // Go back one index
            i--;
        }
    }
}

*/

},{"../helpers":37}],32:[function(require,module,exports){
'use strict';

var __ = require('../helpers');

module.exports = function consecutiveForwards(inst) {

    if (inst.enableDistanceFilters) {
        // Fill in the gaps
        // Disable is not over zero
        if (inst.addTDifEmptyMeters > 0) {
            // Make array
            var numberOfReduced = 0;
            var distanceTotalPX = null;
            //consecutiveArrayDirection = [[NSMutableArray alloc] init];
            //JMapTextDirectionInstruction *firstConsecutiveInstruction = nil;
            //CGPoint firstPoint;
            // Use xyScale
            var theAbsorbingDistance = __.convertMetersToPixels(inst.addTDifEmptyMeters, inst.xScale);
            // Get previous
            var indexOfReferenceForward = 0;
            var lastStandingInstruction = inst.textDirectionsFloorArray[0];
            var previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
            // Loop through all else
            var loopTo3 = inst.textDirectionsFloorArray.length - 1;
            for (var i = 1; i < loopTo3; i++) {
                // Get direction
                var nextInstruction = inst.textDirectionsFloorArray[i];
                var nextPoint = [nextInstruction.wp.x, nextInstruction.wp.y];

                // Forward?
                if (nextInstruction.direction.toLowerCase() === 'Forward'.toLowerCase()) {
                    // Process

                    // Calculate the distance between first and last
                    // Distance in px
                    distanceTotalPX = __.distanceBetween(previousPoint, nextPoint);

                    // Within absorbing distance?
                    if (distanceTotalPX < theAbsorbingDistance) {
                        // PacMan it
                        // Carry angleTo back and forth
                        //...

                        // Fold to back of next next
                        lastStandingInstruction.foldInFront(nextInstruction);

                        // Remove from textDirectionsFloorArray
                        inst.textDirectionsFloorArray.splice(i, 1);

                        numberOfReduced++;

                        // Dec loopTo
                        loopTo3--;
                        // Go back one index
                        i--;
                    } else {
                        // Outside of theAbsorbingDistance
                        // Reset cycle
                        previousPoint = [0, 0];

                        // Pick up first in cycle
                        if (true)
                            //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                            {
                                lastStandingInstruction = nextInstruction;
                                indexOfReferenceForward = i;
                                previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
                            }
                    }
                }
                // If lastStandingInstruction if Forward and next instruction is not forward and if lastStandingInstruction is within distance, elminate self
                //else if(NO)
                else if (lastStandingInstruction.direction.toLowerCase() === 'Forward'.toLowerCase()) {
                        // lastStandingInstruction

                        // Calculate the distance between first and last
                        // Distance in px
                        distanceTotalPX = __.distanceBetween(previousPoint, nextPoint);

                        // Within absorbing distance?
                        if (distanceTotalPX < theAbsorbingDistance) {
                            // PacMan self
                            // Carry angleTo back and forth
                            //...

                            // Not if first
                            // Fold it to previous
                            if (0 !== indexOfReferenceForward) {
                                // Fold it in next behind
                                nextInstruction.foldToBack(lastStandingInstruction);

                                // Remove from textDirectionsFloorArray
                                inst.textDirectionsFloorArray.splice(indexOfReferenceForward, 1);

                                numberOfReduced++;

                                // Dec loopTo
                                loopTo3--;
                                // Go back one index
                                // Don't prev index, because we have to skip to next
                                //i--;
                            }
                        }
                        // Skip to next point?
                        // Set new previous
                        lastStandingInstruction = nextInstruction;
                        indexOfReferenceForward = i;
                        previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
                    } else {
                        // Direction change
                        // Pick up first in cycle
                        if (true)
                            //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                            {
                                lastStandingInstruction = nextInstruction;
                                indexOfReferenceForward = i;
                                previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
                            }
                    }
            }
            //NSLog(@"numberOfReduced: %d", numberOfReduced);
        }
    }
};

/*

// Filter No.4 Remove consecutive Forwards
-(void)filterNo4RemoveConsecutiveForwards:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(enableDistanceFilters)
    {
        // Fill in the gaps
        // Disable is not over zero
        if(addTDifEmptyMeters > 0.0)
        {
            // Make array
            int numberOfReduced = 0;
            //consecutiveArrayDirection = [[NSMutableArray alloc] init];
            //JMapTextDirectionInstruction *firstConsecutiveInstruction = nil;
            //CGPoint firstPoint;
            // Use xyScale
            float theAbsorbingDistance = [UIKitHelper convertMetersToPixels:addTDifEmptyMeters usingXYScale:xScale];
            // Get previous
            NSInteger indexOfReferenceForward = 0;
            JMapTextDirectionInstruction *lastStandingInstruction = [*textDirectionsFloorArray objectAtIndex:0];
            CGPoint previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
            // Loop through all else
            NSInteger loopTo3 = [*textDirectionsFloorArray count] - 1;
            for(int i = 1; i < loopTo3; i++)
            {
                // Get direction
                JMapTextDirectionInstruction *nextInstruction = [*textDirectionsFloorArray objectAtIndex:i];
                CGPoint nextPoint = CGPointMake(nextInstruction.wp.x.floatValue, nextInstruction.wp.y.floatValue);

                // Forward?
                if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                {
                    // Process
                    
                    // Calculate the distance between first and last
                    // Distance in px
                    float distanceTotalPX = [UIKitHelper distanceBetween:previousPoint and:nextPoint];
                    
                    // Within absorbing distance?
                    if(distanceTotalPX < theAbsorbingDistance)
                    {
                        // PacMan it
                        // Carry angleTo back and forth
                        //...
                      
                        // Fold it to back of next
                        // NSInteger nextNextIndex = i + 1;
                        // if(nextNextIndex < [*textDirectionsFloorArray count])
                        // {
                        //     // Can do
                        //     JMapTextDirectionInstruction *nextNextInstruction = [*textDirectionsFloorArray objectAtIndex:nextNextIndex];
                      
                        
                            // Fold to back of next next
                            [lastStandingInstruction foldInFront:nextInstruction];
                            
                            // Remove from textDirectionsFloorArray
                            [*textDirectionsFloorArray removeObjectAtIndex:i];
                            
                            numberOfReduced++;
                            
                            // Dec loopTo
                            loopTo3--;
                            // Go back one index
                            i--;
                        //}
                    }
                    else
                    {
                        // Outside of theAbsorbingDistance
                        // Reset cycle
                        previousPoint = CGPointZero;
                        
                        // Pick up first in cycle
                        if(YES)
                        //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                        {
                            lastStandingInstruction = nextInstruction;
                            indexOfReferenceForward = i;
                            previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
                        }
                    }
                }
                // If lastStandingInstruction if Forward and next instruction is not forward and if lastStandingInstruction is within distance, elminate self
                //else if(NO)
                else if([lastStandingInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                {
                    // lastStandingInstruction
                    
                    // Calculate the distance between first and last
                    // Distance in px
                    float distanceTotalPX = [UIKitHelper distanceBetween:previousPoint and:nextPoint];
                    
                    // Within absorbing distance?
                    if(distanceTotalPX < theAbsorbingDistance)
                    {
                        // PacMan self
                        // Carry angleTo back and forth
                        //...
                        
                        // Not if first
                        // Fold it to previous
                        if(0 != indexOfReferenceForward)
                        {
                            // Fold it in next behind
                            [nextInstruction foldToBack:lastStandingInstruction];
                            
                            // Remove from textDirectionsFloorArray
                            [*textDirectionsFloorArray removeObjectAtIndex:indexOfReferenceForward];
                            
                            numberOfReduced++;
                            
                            // Dec loopTo
                            loopTo3--;
                            // Go back one index
                            // Don't prev index, because we have to skip to next
                            //i--;
                        }
                    }
                    // Skip to next point?
                    // Set new previous
                    lastStandingInstruction = nextInstruction;
                    indexOfReferenceForward = i;
                    previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
                }
                else
                {
                    // Direction change
                    // Pick up first in cycle
                    if(YES)
                        //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                    {
                        lastStandingInstruction = nextInstruction;
                        indexOfReferenceForward = i;
                        previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
                    }
                }
            }
            //NSLog(@"numberOfReduced: %d", numberOfReduced);
        }
    }
}

*/

},{"../helpers":37}],33:[function(require,module,exports){
'use strict';

var __ = require('../helpers');

module.exports = function continuePast(inst) {

    if (inst.enableDistanceFilters) {
        // Fill in the gaps
        // Disable is not over zero
        if (inst.addTDifEmptyMeters > 0) {
            // Use xyScale
            var theDistance = __.convertMetersToPixels(inst.addTDifEmptyMeters, inst.xScale);
            // Language filters:
            var loopToContinuePast = inst.textDirectionsFloorArray.length - 1;
            for (var i = 0; i < loopToContinuePast; i++) {
                // Get direction
                var instruction1 = inst.textDirectionsFloorArray[i];

                // Get next
                var instruction2 = inst.textDirectionsFloorArray[i + 1];

                // Need two consecutive waypoints on straight line.
                // If instruction has folded points use the wolded point at its end of array
                // If no folded points, use wp of instruction
                var usedInstruction1;
                var usedInstruction2;

                // From point
                var waypoint1;
                usedInstruction1 = instruction1;
                waypoint1 = usedInstruction1.wp;
                var point1 = [waypoint1.x, waypoint1.y];

                // To point
                var waypoint2;
                usedInstruction2 = instruction2;
                waypoint2 = usedInstruction2.wp;
                var point2 = [waypoint2.x, waypoint2.y];

                // Get distance in pixels
                var distanceInPX = __.distanceBetween(point1, point2);

                // Over?
                var difference = -1;
                var evenDistance = -1;
                // How many points?
                var denominator = parseInt(distanceInPX / theDistance);
                if (denominator > 1) {
                    // Get soft difference

                    difference = (distanceInPX - theDistance * denominator) / denominator;
                    evenDistance = theDistance + difference;
                    // Generate all points that would fit the gap
                    for (var j = 0; j < denominator - 1; j++) {
                        // Make new point
                        var newPoint = __.pointOnLineUsingDistanceFromStart(point1, point2, evenDistance);

                        // Correct the point so it's on the path
                        newPoint = __.correctPointUsingWayfindPath(inst.useArrayOfFloorWaypoints, newPoint, 0);

                        // Turn into text direction
                        var nextInsertDir = {};

                        // Populate fields
                        nextInsertDir.floor = inst.currentFloorTD.id;
                        nextInsertDir.floorName = inst.currentFloorTD.name;
                        nextInsertDir.wp = {
                            x: newPoint[0],
                            y: newPoint[1],
                            mapId: inst.currentFloorTD.id
                        };
                        nextInsertDir.direction = usedInstruction1.direction;

                        // Get Angle to next
                        var angleToNext = __.pointPairToBearingDegrees(point1, newPoint);
                        nextInsertDir.angleToNext = angleToNext;
                        // Get angle to previous
                        var angleToNextOfPrevious = __.pointPairToBearingDegrees(newPoint, point2);
                        nextInsertDir.angleToNextOfPreviousDirection = angleToNextOfPrevious;

                        // Landmark
                        // Get Landmark using line of sight
                        // Used to describe point of reference eg.: "With *Landmark* on your Left, proceed Forward"

                        // Get nearest destination using line of sight
                        var returnClosestPoint = {
                            value: null
                        };
                        //NSDate *startLOS = [NSDate date];
                        var tempLandmark = this.lineOfSightFromClosestLandmarkToXY(newPoint, returnClosestPoint, nextInsertDir.direction, nextInsertDir.angleToNextOfPreviousDirection, inst.curCanvas);

                        if (tempLandmark) {
                            nextInsertDir.landmarkDestination = tempLandmark;
                            // Find WP so we can accurately determine angle to destination's entrance
                            var landmarkWP = this.model.getWaypointsByDestinationId(nextInsertDir.landmarkDestination.id);
                            if (landmarkWP.length) {

                                //NOTE: Xerxes this is an issue, choosing the first waypoint
                                nextInsertDir.landmarkWP = landmarkWP[0];

                                // Get angle comparing Direction angleToNext
                                // Direction
                                // Get Direction
                                // Figure out the angle to next
                                // Get angle

                                var angle = __.pointPairToBearingDegrees(newPoint, returnClosestPoint.value);

                                // Get angle to next
                                nextInsertDir.angleToLandmark = angle;

                                // What is the angle difference?
                                var angleToLandmarkDifference = nextInsertDir.angleToNextOfPreviousDirection - nextInsertDir.angleToLandmark;
                                while (angleToLandmarkDifference < -180) {
                                    angleToLandmarkDifference += 360;
                                }while (angleToLandmarkDifference > 180) {
                                    angleToLandmarkDifference -= 360;
                                } // Compute next direction
                                nextInsertDir.directionToLandmark = __.directionFromAngle(angleToLandmarkDifference, null);
                            }
                        } else {
                            // debugger;
                            // No destination
                            nextInsertDir.landmarkDestination = null;
                            nextInsertDir.landmarkWP = null;
                            nextInsertDir.angleToLandmark = -1;
                        }

                        // Set output
                        if (nextInsertDir.landmarkDestination) {
                            nextInsertDir.output = __.stringWithFormat('Continue Past %', nextInsertDir.landmarkDestination.name);
                        } else {
                            nextInsertDir.output = 'Continue Past';
                        }

                        nextInsertDir.type = 'continuepast';

                        // Insert to array
                        inst.textDirectionsFloorArray.splice(i + 1, 0, nextInsertDir);

                        // Inc bounds
                        loopToContinuePast++;
                        // Inc for loop driver
                        i++;

                        // Recalculate distance using newly generated point
                        point1 = newPoint;
                    }
                }
            }
        }
    }
};

/*

// Filter No.6 Continue Past, Filler!
-(void)filterNo6ContinuePastFiller:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    //addTDifEmptyMeters = 9;
    if(enableDistanceFilters)
    {
        // Fill in the gaps
        // Disable is not over zero
        if(addTDifEmptyMeters > 0.0)
        {
            // Use xyScale
            float theDistance = [UIKitHelper convertMetersToPixels:addTDifEmptyMeters usingXYScale:xScale];
            // Language filters:
            //NSLog(@"count: %lu", (unsigned long)textDirectionsFloorArray.count);
            NSInteger loopToContinuePast = [*textDirectionsFloorArray count] - 1;
            for(int i = 0; i < loopToContinuePast; i++)
            {
                // Get direction
                JMapTextDirectionInstruction *instruction1 = [*textDirectionsFloorArray objectAtIndex:i];
                
                //NSLog(@"%d: %@", i, instruction1.landmarkDestination.name);
                
                // Get next
                JMapTextDirectionInstruction *instruction2 = [*textDirectionsFloorArray objectAtIndex:(i + 1)];
                
                //NSLog(@"%d: %@", i + 1, instruction2.landmarkDestination.name);
                
                // Need two consecutive waypoints on straight line.
                // If instruction has folded points use the wolded point at its end of array
                // If no folded points, use wp of instruction
                JMapTextDirectionInstruction *usedInstruction1;
                JMapTextDirectionInstruction *usedInstruction2;
                
                // From point
                JMapWaypoint *waypoint1;
                //  if((instruction1.foldedPointsFront.count > 0) && (i == 0))
                //  {
                //  usedInstruction1 = [instruction1.foldedPointsFront lastObject];
                //  }
                //  else
                //  {
                //  usedInstruction1 = instruction1;
                //  }
                usedInstruction1 = instruction1;
                waypoint1 = usedInstruction1.wp;
                CGPoint point1 = CGPointMake(waypoint1.x.floatValue, waypoint1.y.floatValue);
                
                // To point
                JMapWaypoint *waypoint2;
                //  if((instruction2.foldedPointsBack.count > 0) && ((i + 1) == loopToContinuePast))
                //  {
                //  usedInstruction2 = [instruction2.foldedPointsBack lastObject];
                //  }
                //  else
                //  {
                //  usedInstruction2 = instruction2;
                //  }
                usedInstruction2 = instruction2;
                waypoint2 = usedInstruction2.wp;
                CGPoint point2 = CGPointMake(waypoint2.x.floatValue, waypoint2.y.floatValue);
                
                
                // Visualize unit tests
                //  dispatch_async(dispatch_get_main_queue(), ^{
                //
                //  UIColor *rndCol = [UIKitHelper randomColor];
                //
                //  UIView *addedTextDir1 = [[UIView alloc] initWithFrame:CGRectMake(point1.x - 20, point1.y - 20, 40, 40)];
                //  [addedTextDir1 setBackgroundColor:rndCol];
                //  [[self getCurrentFloorView] addSubview:addedTextDir1];
                //
                //  UIView *addedTextDir2 = [[UIView alloc] initWithFrame:CGRectMake(point2.x - 20, point2.y - 20, 40, 40)];
                //  [addedTextDir2 setBackgroundColor:rndCol];
                //  [[self getCurrentFloorView] addSubview:addedTextDir2];
                //  });
                
                
                // Get distance in pixels
                float distanceInPX = [UIKitHelper distanceBetween:point1 and:point2];
                
                // Over?
                float difference = -1;
                float evenDistance = -1;
                // How many points?
                int denominator = distanceInPX / theDistance;
                if(denominator > 1)
                {
                    // Get soft difference
                    
                    
                    
                    UIColor *randomColor = [UIKitHelper randomColor];
                    
                    
                    
                    
                    
                    difference = (distanceInPX - (theDistance * denominator)) / denominator;
                    evenDistance = theDistance + difference;
                    // Generate all points that would fit the gap
                    for(int j = 0; j < (denominator - 1); j++)
                    {
                        // Make new point
                        CGPoint newPoint = [UIKitHelper pointOnLineUsingDistanceFromStart:point1 lp2:point2 distanceFromP1:evenDistance];
                        
                        // Correct the point so it's on the path
                        newPoint = [self correctPointUsingWayfindPath:useArrayOfFloorWaypoints point:newPoint noFurtherThan:0];
                        
                        // Turn into text direction
                        JMapTextDirectionInstruction *nextInsertDir = [[JMapTextDirectionInstruction alloc] init];
                        
                        // Populate fields
                        nextInsertDir.floor = currentFloorTD.mapId.intValue;
                        nextInsertDir.floorName = currentFloorTD.name;
                        nextInsertDir.wp = [[JMapWaypoint alloc] initWithCGPoint:[NSValue valueWithCGPoint:newPoint]];
                        nextInsertDir.direction = usedInstruction1.direction;
                        
                        // Get Angle to next
                        float angleToNext = [UIKitHelper pointPairToBearingDegrees:point1 endingPoint:newPoint];
                        nextInsertDir.angleToNext = angleToNext;
                        // Get angle to previous
                        float angleToNextOfPrevious = [UIKitHelper pointPairToBearingDegrees:newPoint endingPoint:point2];
                        nextInsertDir.angleToNextOfPreviousDirection = angleToNextOfPrevious;
                        
                        // Visualize it
                        //  if(NO)
                        //  {
                        //  dispatch_async(dispatch_get_main_queue(), ^{
                        //  // For now just draw on map
                        //
                        //  // Mark it
                        //  UILabel *fromView = [[UILabel alloc] initWithFrame:CGRectMake(newPoint.x - 10, newPoint.y - 10, 20, 20)];
                        //  fromView.backgroundColor = randomColor;
                        //  fromView.text = [NSString stringWithFormat:@"%d", j];
                        //  [[self getCurrentFloorView] addSubview:fromView];
                        //  });
                        //  }
                        
                        // Landmark
                        // Get Landmark using line of sight
                        // Used to describe point of reference eg.: "With *Landmark* on your Left, proceed Forward"
                        //@property JMapWaypoint *landmarkWP;
                        //@property JMapDestination *landmarkDestination;
                        //@property float angleToLandmark;
                        //@property NSString *directionToLandmark;
                        
                        // Get nearest destination using line of sight
                        CGPoint returnClosestPoint;
                        //NSDate *startLOS = [NSDate date];
                        JMapDestination *tempLandmark = [self lineOfSightFromClosestLandmarkToXY:newPoint pointOfIntercept:&returnClosestPoint direction:nextInsertDir.direction previousAngle:nextInsertDir.angleToNextOfPreviousDirection forCanvas:curCanvas];
                        //NSTimeInterval timeIntervalLOS = fabs([startLOS timeIntervalSinceNow]);
                        //NSLog(@"lineOfSightFromClosestLandmarkToXY took: %f", timeIntervalLOS);
                        if(tempLandmark)
                        {
                            nextInsertDir.landmarkDestination = tempLandmark;
                            // Find WP so we can accurately determine angle to destination's entrance
                            JMapWaypoint *landmarkWP = [self getWayPointByDestinationId:nextInsertDir.landmarkDestination.id];
                            if(landmarkWP)
                            {
                                nextInsertDir.landmarkWP = landmarkWP;
                                
                                // Get angle comparing Direction angleToNext
                                // Direction
                                //@property NSString *direction;
                                // Get Direction
                                // Figure out the angle to next
                                // Get angle
                                float angle = [UIKitHelper pointPairToBearingDegrees:newPoint endingPoint:returnClosestPoint];
                                // Get angle to next
                                nextInsertDir.angleToLandmark = angle;
                                
                                // What is the angle difference?
                                //NSLog(@"next: %d landmark: %d name:%@", (int)nextDir.angleToNext, (int)nextDir.angleToLandmark, nextDir.landmarkDestination.name);
                                float angleToLandmarkDifference = nextInsertDir.angleToNextOfPreviousDirection - nextInsertDir.angleToLandmark;
                                while (angleToLandmarkDifference < -180) angleToLandmarkDifference += 360;
                                while (angleToLandmarkDifference > 180) angleToLandmarkDifference -= 360;
                                //NSLog(@"angleDifference %@: %f", nextDir.landmarkDestination.name, angleToLandmarkDifference);
                                // Compute next direction
                                nextInsertDir.directionToLandmark = [UIKitHelper directionFromAngle:angleToLandmarkDifference customTresholds:nil];
                                //NSLog(@"directionToLandmark: %@", nextDir.directionToLandmark);
                                //NSLog(@"next");
                            }
                        }
                        else
                        {
                            // No destination
                            nextInsertDir.landmarkDestination = nil;
                            nextInsertDir.landmarkWP = nil;
                            nextInsertDir.angleToLandmark = -1;
                            NSLog(@"No destination");
                        }
                        
                        // Set output
                        nextInsertDir.output = [NSString stringWithFormat:@"Continue Past %@", nextInsertDir.landmarkDestination.name];
                        
                        // Insert to array
                        //[textDirectionsFloorArray addObject:nextInsertDir];
                        [*textDirectionsFloorArray insertObject:nextInsertDir atIndex:(i + 1)];
                        
                        //NSLog(@"ins: %d", insertAt);
                        
                        // Inc bounds
                        loopToContinuePast++;
                        // Inc for loop driver
                        i++;
                        
                        //NSLog(@"ins count: %lu", (unsigned long)textDirectionsFloorArray.count);
                        
                        // Plot it on screen for now
                        //  // On main thread
                        //  dispatch_async(dispatch_get_main_queue(), ^{
                        //  UIView *addedTextDir = [[UIView alloc] initWithFrame:CGRectMake(newPoint.x - 10, newPoint.y - 10, 20, 20)];
                        //  [addedTextDir setBackgroundColor:[UIColor whiteColor]];
                        //  [[self getCurrentFloorView] addSubview:addedTextDir];
                        //  });
                        
                        // Recalculate distance using newly generated point
                        point1 = newPoint;
                        //distanceInPX = [UIKitHelper distanceBetween:point1 and:point2];
                    }
                }
            }
        }
    }
}



-(CGPoint)correctPointUsingWayfindPath:(JMapPathPerFloor *)setOfPoints point:(CGPoint)point noFurtherThan:(float)noFurtherThan
{
    CGPoint returnPoint = CGPointZero;
    float closestDistanceFromPath = -1;
    
    // Loop through points and make lines
    for(int i = 0; i < (setOfPoints.points.count - 1); i++)
    {
        // Get next two points
        JMapASNode *first = [setOfPoints.points objectAtIndex:i];
        CGPoint lineP1 = CGPointMake(first.x.floatValue, first.y.floatValue);
        
        JMapASNode *second = [setOfPoints.points objectAtIndex:(i + 1)];
        CGPoint lineP2 = CGPointMake(second.x.floatValue, second.y.floatValue);
        
        // Get the distance
        CGPoint tempPointOfIntercept = CGPointZero;
        float nextDistance = [UIKitHelper distanceToLine:point lineP1:lineP1 lineP2:lineP2 intersectPoint:&tempPointOfIntercept];
        if((closestDistanceFromPath == -1) || (nextDistance < closestDistanceFromPath))
        {
            // New point
            closestDistanceFromPath = nextDistance;
            
            // Get new point
            returnPoint = tempPointOfIntercept;
        }
    }
    
    // noFurtherThan?
    if(0 < noFurtherThan)
    {
        CGFloat xDist = (returnPoint.x - point.x);
        CGFloat yDist = (returnPoint.y - point.y);
        float distanceFromIntended = sqrt((xDist * xDist) + (yDist * yDist));
        if(noFurtherThan < distanceFromIntended)
        {
            // Point too far from intended, return original point
            returnPoint = point;
        }
    }
    
    return returnPoint;
}

*/

},{"../helpers":37}],34:[function(require,module,exports){
"use strict";

module.exports = function endAsLandMark(inst) {
    if (inst.useArrayOfFloorWaypoints == inst.wayfindArray[inst.wayfindArray.length - 1]) {
        // This is the last floor
        var lastDirection = inst.textDirectionsFloorArray[inst.textDirectionsFloorArray.length - 1];
        if (lastDirection && lastDirection.destination) {
            // Still looking
            var foundIt = false;
            var firstIndex = 0;
            for (var i = 0; i < inst.textDirectionsFloorArray.length; i++) {
                var nextDirection = inst.textDirectionsFloorArray[i];
                // Ignore first direction--it could be a mover
                if (nextDirection != inst.textDirectionsFloorArray[0]) {
                    // Match?
                    // Same Landmark
                    if (nextDirection.landmarkDestination.id == lastDirection.destination.id) {
                        // Got it
                        foundIt = true;
                        // Break
                        break;
                    }
                }
                // Inc firstIndex
                firstIndex++;
            }

            if (foundIt) {
                var loopTo = inst.textDirectionsFloorArray.length - 1;
                for (i = loopTo - 1; i >= firstIndex; i--) {
                    // Fold second last
                    var foldDirection = inst.textDirectionsFloorArray[i];

                    // Carry last direction behind you
                    lastDirection.foldToBack(foldDirection);

                    // Same, remove it
                    inst.textDirectionsFloorArray.splice(i, 1);
                }
            }
        }
    }
};

/*

// Filter No.1 Take Out Directions Between Last And First
-(void)filterNo1TakeOutDirectionsBetweenLastAndFirst:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(useArrayOfFloorWaypoints == [wayfindArray lastObject])
    {
        // This is the last floor
        JMapTextDirectionInstruction *lastDirection = [*textDirectionsFloorArray lastObject];
        if(lastDirection)
        {
            //NSLog(@"last: %@", lastDirection.destination.name);
            // Still looking
            BOOL foundIt = NO;
            int firstIndex = 0;
            for(JMapTextDirectionInstruction *nextDirection in *textDirectionsFloorArray)
            {
                // Ignore first direction--it could be a mover
                if(nextDirection != [*textDirectionsFloorArray firstObject])
                {
                    // Match?
                    // Same Landmark
                    //NSLog(@"next: %@", nextDirection.landmarkDestination.name);
                    if(nextDirection.landmarkDestination.id.intValue == lastDirection.destination.id.intValue)
                    {
                        // Got it
                        foundIt = YES;
                        
                        // Break
                        break;
                    }
                }
                
                // Inc firstIndex
                firstIndex++;
            }
            if(foundIt)
            {
                NSInteger loopTo = [*textDirectionsFloorArray count] - 1;
                for(long i = (loopTo - 1); i >= firstIndex; i--)
                {
                    // Fold second last
                    JMapTextDirectionInstruction *foldDirection = [*textDirectionsFloorArray objectAtIndex:i];
                    
                    // Carry last direction behind you
                    [lastDirection foldToBack:foldDirection];
                    
                    // Same, remove it
                    [*textDirectionsFloorArray removeObjectAtIndex:i];
                }
            }
        }
    }
}
*/

},{}],35:[function(require,module,exports){
'use strict';

var _ = require('../helpers');

module.exports = function startAsLandMark(inst) {

  if (inst.useArrayOfFloorWaypoints == inst.wayfindArray[0]) {
    // On first floor!
    // See if next text direction is using start-destination and if it does, fold it, taking its direction as first.

    // Take first
    var loopToFirst = inst.textDirectionsFloorArray.length - 1;
    var firstInstruction = inst.textDirectionsFloorArray[0];

    for (var i = 1; i < loopToFirst; i++) {
      // Take ONLY !next!
      var currentInstruction = inst.textDirectionsFloorArray[i];

      // If landmarkDestination same as Destination, fold next into first
      if (firstInstruction.destination) {
        if (currentInstruction.landmarkDestination.id == firstInstruction.destination.id) {
          // Copy direction
          // Apply its direction to first
          firstInstruction.direction = currentInstruction.direction;

          // Rebuild output
          firstInstruction.output = _.stringWithFormat('With % behind you, go %.', firstInstruction.destination.name, firstInstruction.direction);

          // Fold current into firstConsecutiveInstruction
          firstInstruction.foldInFront(currentInstruction);

          // Remove from textDirectionsFloorArray
          inst.textDirectionsFloorArray.splice(i, 1);

          // Break out
          break;
        }
      }
    }
  }
};

/*

// Filter No.2 Start Direction assumes directions of all next directions which use its Destination as their Landmarks.
-(void)filterNo2StartDirectionCleanUpAllWhichUseDestinationAsLandmarks:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(useArrayOfFloorWaypoints == [wayfindArray firstObject])
    {
        // On first floor!
        // See if next text direction is using start-destination and if it does, fold it, taking its direction as first.
        
        // Take first
        NSInteger loopToFirst = [*textDirectionsFloorArray count] - 1;
        JMapTextDirectionInstruction *firstInstruction = [*textDirectionsFloorArray objectAtIndex:0];
        for(int i = 1; i < loopToFirst; i++)
        {
            // Take ONLY !next!
            JMapTextDirectionInstruction *currentInstruction = [*textDirectionsFloorArray objectAtIndex:i];
            
            // If landmarkDestination same as Destination, fold next into first
            if(currentInstruction.landmarkDestination.id.intValue == firstInstruction.destination.id.intValue)
            {
                // Copy direction
                // Apply its direction to first
                firstInstruction.direction = currentInstruction.direction;
                
                // Rebuild output
                firstInstruction.output = [NSString stringWithFormat:@"With %@ behind you, go %@.", firstInstruction.destination.name, firstInstruction.direction];
                
                // Fold current into firstConsecutiveInstruction
                [firstInstruction foldInFront:currentInstruction];
                
                // Remove from textDirectionsFloorArray
                [*textDirectionsFloorArray removeObjectAtIndex:i];
                
                // Break out
                break;
          
            }
        }
    }
}

*/

},{"../helpers":37}],36:[function(require,module,exports){
'use strict';

var __ = require('../helpers');

module.exports = function uTurn(inst) {

  // Filter No.3 U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
  if (inst.enableDistanceFilters) {
    // Disable is not over zero
    if (inst.UTurnInMeters > 0) {
      // Skip UTurn if first floor
      if (inst.useArrayOfFloorWaypoints != inst.wayfindArray[0]) {
        // U-Turn detection
        var firstConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[0];
        // Does this waypoint have only one connection?
        var firstNode = inst.useArrayOfFloorWaypoints.points[0];
        var arr = firstNode.edges.slice();
        // Count type 1
        var type1Counter = 0;
        // We have to have only one of type 1
        // Disregard the others
        arr.forEach(function (nextEdge) {
          // Look for Type one?
          if (nextEdge.type == 1) {
            // Found one more
            type1Counter++;
          }
        });

        // Only 1 type 1?
        if (type1Counter != 1) {
          // Waypoint has more than one connection
          // This cannot be a U-Turn
          return;
        }
        // else continue

        // More than 3 directions?
        if (inst.textDirectionsFloorArray.length < 4) {
          // This cannot be U-Turn. Not enough directions/waypoints
          return;
        }
        // else continue

        // Decide Direction of U-Turn
        var directionIsRight = true;
        // Can you get one more text direction?
        var secondConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[1];
        // Get angle difference
        var angleToDifference1 = firstConsecutiveInstructionUTurn.angleToNext - secondConsecutiveInstructionUTurn.angleToNext;
        while (angleToDifference1 < -180) {
          angleToDifference1 += 360;
        }while (angleToDifference1 > 180) {
          angleToDifference1 -= 360;
        } // Minus for Right
        // Plus for Left

        if (angleToDifference1 >= 0) {
          // Right
          directionIsRight = true;
        } else {
          // Left
          directionIsRight = false;
        }

        //UTurnInMeters

        // Tresholds
        var angle1_t = 95;
        var angle2_t = 95;
        var distance1_t = 2;
        var distance2_t = 5;
        var distance3_t = 5;

        // Segment A
        // Test Angle
        if (angle1_t < Math.abs(angleToDifference1)) {
          // This cannot be U-Turn, first angle treshold broken
          return;
        }
        // Test Direction
        var segmentADirectionRight = true;
        if (angleToDifference1 >= 0) {
          // Right
          segmentADirectionRight = true;
        } else {
          // Left
          segmentADirectionRight = false;
        }
        if (directionIsRight != segmentADirectionRight) {
          // Not in the same direction
          // This cannot be UTurn
          return;
        }
        // Test Distance
        var point1xy = [firstConsecutiveInstructionUTurn.wp.x, firstConsecutiveInstructionUTurn.wp.y];
        var point2xy = [secondConsecutiveInstructionUTurn.wp.x, secondConsecutiveInstructionUTurn.wp.y];
        var distance1 = __.distanceBetween(point1xy, point2xy);
        var distance1Meters = __.convertPixelsToMeters(distance1, inst.xScale);
        if (distance1Meters <= distance1_t) {
          // This cannot be UTurn
          // Segment 1 is too long
          return;
        }

        // Segment B
        // Third point
        var thirdConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[2];
        // Get angle difference
        var angleToDifference2 = secondConsecutiveInstructionUTurn.angleToNext - thirdConsecutiveInstructionUTurn.angleToNext;
        while (angleToDifference2 < -180) {
          angleToDifference2 += 360;
        }while (angleToDifference2 > 180) {
          angleToDifference2 -= 360;
        } // Test Angle
        if (angle2_t < Math.abs(angleToDifference2)) {
          // This cannot be U-Turn, first angle treshold broken
          return;
        }
        // Test Direction
        var segmentBDirectionRight = true;
        if (angleToDifference2 >= 0) {
          // Right
          segmentBDirectionRight = true;
        } else {
          // Left
          segmentBDirectionRight = false;
        }
        if (directionIsRight != segmentBDirectionRight) {
          // Not in the same direction
          // This cannot be UTurn
          return;
        }
        // Test Distance
        var point3xy = [thirdConsecutiveInstructionUTurn.wp.x, thirdConsecutiveInstructionUTurn.wp.y];
        var distance2 = __.distanceBetween(point2xy, point3xy);
        var distance2Meters = __.convertPixelsToMeters(distance2, inst.xScale);
        if (distance2Meters <= distance2_t) {
          // This cannot be UTurn
          // Segment 2 is too long
          return;
        }

        // Segment C
        // Fourth point
        var fourthConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[3];
        // Test Distance ONLY.
        // It should be less than 3rd treshold
        var point4xy = [fourthConsecutiveInstructionUTurn.wp.x, fourthConsecutiveInstructionUTurn.wp.y];
        var distance3 = __.distanceBetween(point3xy, point4xy);
        var distance3Meters = __.convertPixelsToMeters(distance3, inst.xScale);
        // Note 3rd must be greater than treshold
        if (distance3_t >= distance3Meters) {
          // This cannot be UTurn
          // Segment 3 is too SHORT!
          return;
        }

        // This is a U-Turn
        // Direction
        if (directionIsRight) {
          // Left
          firstConsecutiveInstructionUTurn.direction = 'Right';
        } else {
          // Left
          firstConsecutiveInstructionUTurn.direction = 'Left';
        }
        // Add UTurn Direction
        firstConsecutiveInstructionUTurn.direction += ' UTurn';

        // First is going to be U-Turn on Left/Right side
        // Combine firstConsecutiveInstruction output

        var newOutput = __.stringWithFormat('With % on your %, make %.', firstConsecutiveInstructionUTurn.landmarkDestination.name, firstConsecutiveInstructionUTurn.directionToLandmark, firstConsecutiveInstructionUTurn.direction);

        // Update
        firstConsecutiveInstructionUTurn.type = 'uturn';
        firstConsecutiveInstructionUTurn.output = newOutput;

        // Fold 2
        // Add distance
        var combinedFirstDistance = firstConsecutiveInstructionUTurn.distanceToNextPixels;
        // 2nd to 3rd
        combinedFirstDistance += secondConsecutiveInstructionUTurn.distanceToNextPixels;
        // 3nd to 4th
        combinedFirstDistance += thirdConsecutiveInstructionUTurn.distanceToNextPixels;

        // Update First
        firstConsecutiveInstructionUTurn.distanceToNextPixels = combinedFirstDistance;
        firstConsecutiveInstructionUTurn.distanceToNextMeters = __.convertPixelsToMeters(combinedFirstDistance, inst.xScale);

        // Fold current into firstConsecutiveInstruction
        firstConsecutiveInstructionUTurn.foldInFront(secondConsecutiveInstructionUTurn);
        // Remove from textDirectionsFloorArray
        inst.textDirectionsFloorArray.splice(1, 1);

        // Fold 3 into firstConsecutiveInstruction
        firstConsecutiveInstructionUTurn.foldInFront(thirdConsecutiveInstructionUTurn);
        // Remove from textDirectionsFloorArray
        inst.textDirectionsFloorArray.splice(1, 1);
      }
    }
  }
};

/*

// Filter No.3 U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
// Filter No.3 U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
-(void)filterNo3UTurnDetection:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(enableDistanceFilters)
    {
        // Disable is not over zero
        if(UTurnInMeters > 0.0)
        {
            // Skip UTurn if first floor
            if(useArrayOfFloorWaypoints != [wayfindArray firstObject])
            {
                // U-Turn detection
                JMapTextDirectionInstruction *firstConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:0];
                
                // Does this waypoint have only one connection?
                JMapASNode *firstNode = [useArrayOfFloorWaypoints.points objectAtIndex:0];
                NSArray *arr = [firstNode.edges copy];
                // Count type 1
                int type1Counter = 0;
                // We have to have only one of type 1
                // Disregard the others
                for(JMapASEdge *nextEdge in arr)
                {
                    // Look for Type one?
                    if(nextEdge.type.intValue == 1)
                    {
                        // Found one more
                        type1Counter++;
                    }
                }

                // Only 1 type 1?
                if(type1Counter != 1)
                {
                    // Waypoint has more than one connection
                    // This cannot be a U-Turn
                    return;
                }
                // else continue
                
                // More than 3 directions?
                if([*textDirectionsFloorArray count] < 4)
                {
                    // This cannot be U-Turn. Not enough directions/waypoints
                    return;
                }
                // else continue

                // Decide Direction of U-Turn
                BOOL directionIsRight = YES;
                // Can you get one more text direction?
                JMapTextDirectionInstruction *secondConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:1];
                // Get angle difference
                float angleToDifference1 = firstConsecutiveInstructionUTurn.angleToNext - secondConsecutiveInstructionUTurn.angleToNext;
                while (angleToDifference1 < -180) angleToDifference1 += 360;
                while (angleToDifference1 > 180) angleToDifference1 -= 360;
                
                // Minus for Right
                // Plus for Left
                
                if(angleToDifference1 >= 0)
                {
                    // Right
                    directionIsRight = YES;
                }
                else
                {
                    // Left
                    directionIsRight = NO;
                }

                //UTurnInMeters
                
                // Tresholds
                float angle1_t = 95.0;
                float angle2_t = 95.0;
                float distance1_t = 2.0;
                float distance2_t = 5.0;
                float distance3_t = 5.0;

                // Segment A
                // Test Angle
                if(angle1_t < fabs(angleToDifference1))
                {
                    // This cannot be U-Turn, first angle treshold broken
                    return;
                }
                // Test Direction
                BOOL segmentADirectionRight = YES;
                if(angleToDifference1 >= 0)
                {
                    // Right
                    segmentADirectionRight = YES;
                }
                else
                {
                    // Left
                    segmentADirectionRight = NO;
                }
                if(directionIsRight != segmentADirectionRight)
                {
                    // Not in the same direction
                    // This cannot be UTurn
                    return;
                }
                // Test Distance
                CGPoint point1xy = CGPointMake(firstConsecutiveInstructionUTurn.wp.x.floatValue, firstConsecutiveInstructionUTurn.wp.y.floatValue);
                CGPoint point2xy = CGPointMake(secondConsecutiveInstructionUTurn.wp.x.floatValue, secondConsecutiveInstructionUTurn.wp.y.floatValue);
                float distance1 = [UIKitHelper distanceBetween:point1xy and:point2xy];
                float distance1Meters = [UIKitHelper convertPixelsToMeters:distance1 usingXYScale:xScale];
                if(distance1Meters <= distance1_t)
                {
                    // This cannot be UTurn
                    // Segment 1 is too long
                    return;
                }
                
                // Segment B
                // Third point
                JMapTextDirectionInstruction *thirdConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:2];
                // Get angle difference
                float angleToDifference2 = secondConsecutiveInstructionUTurn.angleToNext - thirdConsecutiveInstructionUTurn.angleToNext;
                while (angleToDifference2 < -180) angleToDifference2 += 360;
                while (angleToDifference2 > 180) angleToDifference2 -= 360;
                // Test Angle
                if(angle2_t < fabs(angleToDifference2))
                {
                    // This cannot be U-Turn, first angle treshold broken
                    return;
                }
                // Test Direction
                BOOL segmentBDirectionRight = YES;
                if(angleToDifference2 >= 0)
                {
                    // Right
                    segmentBDirectionRight = YES;
                }
                else
                {
                    // Left
                    segmentBDirectionRight = NO;
                }
                if(directionIsRight != segmentBDirectionRight)
                {
                    // Not in the same direction
                    // This cannot be UTurn
                    return;
                }
                // Test Distance
                CGPoint point3xy = CGPointMake(thirdConsecutiveInstructionUTurn.wp.x.floatValue, thirdConsecutiveInstructionUTurn.wp.y.floatValue);
                float distance2 = [UIKitHelper distanceBetween:point2xy and:point3xy];
                float distance2Meters = [UIKitHelper convertPixelsToMeters:distance2 usingXYScale:xScale];
                if(distance2Meters <= distance2_t)
                {
                    // This cannot be UTurn
                    // Segment 2 is too long
                    return;
                }

                // Segment C
                // Fourth point
                JMapTextDirectionInstruction *fourthConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:3];
                // Test Distance ONLY.
                // It should be less than 3rd treshold
                CGPoint point4xy = CGPointMake(fourthConsecutiveInstructionUTurn.wp.x.floatValue, fourthConsecutiveInstructionUTurn.wp.y.floatValue);
                float distance3 = [UIKitHelper distanceBetween:point3xy and:point4xy];
                float distance3Meters = [UIKitHelper convertPixelsToMeters:distance3 usingXYScale:xScale];
                // Note 3rd must be greater than treshold
                if(distance3_t >= distance3Meters)
                {
                    // This cannot be UTurn
                    // Segment 3 is too SHORT!
                    return;
                }
                
                // This is a U-Turn
                // Direction
                if(directionIsRight)
                {
                    // Left
                    firstConsecutiveInstructionUTurn.direction = @"Right";
                }
                else
                {
                    // Left
                    firstConsecutiveInstructionUTurn.direction = @"Left";
                }
                // Add UTurn Direction
                firstConsecutiveInstructionUTurn.direction = [firstConsecutiveInstructionUTurn.direction stringByAppendingString:@" UTurn"];
                
                // First is going to be U-Turn on Left/Right side
                // Combine firstConsecutiveInstruction output
                NSString *newOutput = [NSString stringWithFormat:@"With %@ on your %@, make %@.", firstConsecutiveInstructionUTurn.landmarkDestination.name, firstConsecutiveInstructionUTurn.directionToLandmark, firstConsecutiveInstructionUTurn.direction];
                // Update
                firstConsecutiveInstructionUTurn.output = newOutput;

                NSLog(@"Detected UTurn");
                
                // Fold 2
                // Add distance
                float combinedFirstDistance = firstConsecutiveInstructionUTurn.distanceToNextPixels.floatValue;
                // 2nd to 3rd
                combinedFirstDistance += secondConsecutiveInstructionUTurn.distanceToNextPixels.floatValue;
                // 3nd to 4th
                combinedFirstDistance += thirdConsecutiveInstructionUTurn.distanceToNextPixels.floatValue;

                // Update First
                firstConsecutiveInstructionUTurn.distanceToNextPixels = [NSNumber numberWithFloat:combinedFirstDistance];
                firstConsecutiveInstructionUTurn.distanceToNextMeters = [NSNumber numberWithFloat:[UIKitHelper convertPixelsToMeters:combinedFirstDistance usingXYScale:xScale]];
                
                // Fold current into firstConsecutiveInstruction
                [firstConsecutiveInstructionUTurn foldInFront:secondConsecutiveInstructionUTurn];
                // Remove from textDirectionsFloorArray
                [*textDirectionsFloorArray removeObjectAtIndex:1];
                
                // Fold 3 into firstConsecutiveInstruction
                [firstConsecutiveInstructionUTurn foldInFront:thirdConsecutiveInstructionUTurn];
                // Remove from textDirectionsFloorArray
                [*textDirectionsFloorArray removeObjectAtIndex:1];
            }
        }
    }
}
*/

},{"../helpers":37}],37:[function(require,module,exports){
'use strict';

var __ = {

  stringWithFormat: function stringWithFormat() {
    var output = [];
    var string = arguments[0].split('%');
    for (var i = 1; i < arguments.length; i++) {
      output.push(string[i - 1]);
      output.push(arguments[i]);
    }
    return output.join('');
  },

  landmarkDirectionFromDeltaAngle: function landmarkDirectionFromDeltaAngle() {},

  directionFromAngle: function directionFromAngle(angle, customTresholds) {
    // if (isNaN(angle)) debugger;

    // Direction threshholds
    var forwardFrom = -25;
    var forwardTo = 25;

    // Right
    var rightSlightFrom = 25;
    var rightSlightTo = 45;
    var rightFrom = 45;
    var rightTo = 135;
    var rightBackFrom = 135;
    var rightBackTo = 180;

    // Left
    var leftSlightFrom = -45;
    var leftSlightTo = -25;
    var leftFrom = -135;
    var leftTo = -45;
    var leftBackFrom = -180;
    var leftBackTo = -135;

    // Custom tresholds?
    if (customTresholds) {
      // Apply them
      //...
      void 0;
    }

    // Return dir
    var returnDirection = '';

    // Forward
    if (forwardFrom <= angle && angle <= forwardTo) {
      // Forward

      // Direction
      returnDirection = 'Forward';
    }
    // Slight Right
    else if (rightSlightFrom <= angle && angle <= rightSlightTo) {
        // Right

        // Direction
        returnDirection = 'Slight Right';
      }
      // Right
      else if (rightFrom <= angle && angle <= rightTo) {
          // Right

          // Direction
          returnDirection = 'Right';
        }
        // Slight Left
        else if (leftSlightFrom <= angle && angle <= leftSlightTo) {
            // Left

            // Direction
            returnDirection = 'Slight Left';
          }
          // Left
          else if (leftFrom <= angle && angle <= leftTo) {
              // Left

              // Direction
              returnDirection = 'Left';
            }
            // Back
            else if (leftBackFrom <= angle && angle <= leftBackTo || rightBackFrom <= angle && angle <= rightBackTo) {
                // Left

                // Direction
                returnDirection = 'Back';
              } else {
                console.log('-directionFromAngle-\n', 'No coverage for angle difference:', angle);
              }

    // Ret
    return returnDirection;
  },

  returnDirectionToPoint: function returnDirectionToPoint(currentPoint, toPoint, previousAngle) {
    // Get angle comparing Direction angleToNext
    // Direction
    // Get Direction
    // Figure out the angle to next
    // Get angle
    var angle = __.pointPairToBearingDegrees(currentPoint, toPoint);

    // What is the angle difference?
    var angleToLandmarkDifference = previousAngle - angle;
    while (angleToLandmarkDifference < -180) {
      angleToLandmarkDifference += 360;
    }while (angleToLandmarkDifference > 180) {
      angleToLandmarkDifference -= 360;
    } // Compute next direction
    var returnString = __.directionFromAngle(angleToLandmarkDifference, null);

    // Ret
    return returnString;
  },

  isPointInsideRotatedRect: function isPointInsideRotatedRect(p, a, b, c, d) {
    if (__.triangleArea(a, b, p) > 0 || __.triangleArea(b, c, p) > 0 || __.triangleArea(c, d, p) > 0 || __.triangleArea(d, a, p) > 0) {
      return false;
    }
    return true;
  },

  triangleArea: function triangleArea(a, b, c) {
    return c[0] * b[1] - b[0] * c[1] - (c[0] * a[1] - a[0] * c[1]) + (b[0] * a[1] - a[0] * b[1]);
  },

  doLineSegmentsIntersect: function doLineSegmentsIntersect(l11, l12, l21, l22) {
    var d = (l12[0] - l11[0]) * (l22[1] - l21[1]) - (l12[1] - l11[1]) * (l22[0] - l21[0]);
    if (d === 0) {
      // Slope is same--lines are parallel
      return false;
    }
    var u = ((l21[0] - l11[0]) * (l22[1] - l21[1]) - (l21[1] - l11[1]) * (l22[0] - l21[0])) / d;
    var v = ((l21[0] - l11[0]) * (l12[1] - l11[1]) - (l21[1] - l11[1]) * (l12[0] - l11[0])) / d;
    if (u < 0.0 || u > 1.0) {
      // Line1 passes by Line2 on the left
      return false;
    }
    if (v < 0.0 || v > 1.0) {
      // Line1 passes by Line2 on the right
      return false;
    }
    // They do intersect
    return true;
  },

  arrayOfRotatedPoints: function arrayOfRotatedPoints(rect) {
    // Angle
    var theta = 0;
    // Get transform matrix, if any
    // This rotates rect
    if (rect.transform && rect.transform.length > 0) {
      if (rect.transform.indexOf('matrix(') > -1) {
        //'matrix(0.7071 0.7071 -0.7071 0.7071 1067.124 -522.2766)'
        var newMatrix = rect.transform.split('matrix(').join('').split(')').join('');
        var components = newMatrix.split(' ');
        if (components.length > 5) {
          var a = parseFloat(components[0]),
              b = parseFloat(components[1]);

          theta = Math.atan2(b, a);
        }
      }
    }

    // Get center of rect
    var c = __.returnCenterOfRect(rect);

    // Make array of points, make sure they are connected to each other (don't make diagonal points in sequence)
    var points = [];

    // 1
    var p1 = [rect.x, rect.y];
    points[0] = __.rotatePoint(p1, c, theta);
    // 2
    var p2 = [rect.x + rect.width, rect.y];
    points[1] = __.rotatePoint(p2, c, theta);
    // 3
    var p3 = [rect.x + rect.width, rect.y + rect.height];
    points[2] = __.rotatePoint(p3, c, theta);
    // 4
    var p4 = [rect.x, rect.y + rect.height];
    points[3] = __.rotatePoint(p4, c, theta);

    return points;
  },

  returnCenterOfRect: function returnCenterOfRect(rect) {
    var centerX = rect.x + rect.width / 2.0;
    var centerY = rect.y + rect.height / 2.0;
    return [centerX, centerY];
  },

  rotatePoint: function rotatePoint(point, center, angle) {
    // cx, cy - center of square coordinates
    // x, y - coordinates of a corner point of the square
    // theta is the angle of rotation

    // translate point to origin
    var tempX = point[0] - center[0];
    var tempY = point[1] - center[1];

    // now apply rotation
    var rotatedX = tempX * Math.cos(angle) - tempY * Math.sin(angle);
    var rotatedY = tempX * Math.sin(angle) + tempY * Math.cos(angle);

    // translate back
    var x = rotatedX + center[0];
    var y = rotatedY + center[1];

    return [x, y];
  },

  distanceToLine: function distanceToLine(xy, p1, p2, instersect) {
    return Math.sqrt(__.distToSegmentSquared(xy, p1, p2, instersect));
  },

  distToSegmentSquared: function distToSegmentSquared(xy, p1, p2, pointOfIntersect) {
    var l2 = __.dist2(p1, p2);

    if (l2 === 0) {
      pointOfIntersect.value = p2;
      return __.dist2(xy, p2);
    }

    var t = ((xy[0] - p1[0]) * (p2[0] - p1[0]) + (xy[1] - p1[1]) * (p2[1] - p1[1])) / l2;

    if (t < 0) {
      pointOfIntersect.value = p1;
      return __.dist2(xy, p1);
    }
    if (t > 1) {
      pointOfIntersect.value = p2;
      return __.dist2(xy, p2);
    }

    // Point of intersect
    pointOfIntersect.value = [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];

    return __.dist2(xy, pointOfIntersect.value);
  },

  dist2: function dist2(p1, p2) {
    return __.sqr(p1[0] - p2[0]) + __.sqr(p1[1] - p2[1]);
  },

  sqr: function sqr(x) {
    return x * x;
  },

  pointPairToBearingDegrees: function pointPairToBearingDegrees(startingPoint, endingPoint) {
    // NOTE: 0 degree is on y axis on top side
    //        0
    //        |
    //  q=2   y     q=1
    //        |
    // 180--x-+--- 0 degrees
    //        |
    //  q=3   270   q=4
    //        |
    //        |
    var vector = [endingPoint[0] - startingPoint[0], endingPoint[1] - startingPoint[1]];
    var angleCalc;
    if (vector[1] < 0) {
      // upper Half
      angleCalc = Math.atan2(-vector[1], vector[0]);
    } else {
      angleCalc = Math.atan2(vector[1], -vector[0]) + Math.PI;
    }

    return angleCalc * (180 / Math.PI);
  },

  pointOnLineUsingDistanceFromStart: function pointOnLineUsingDistanceFromStart(lp1, lp2, distanceFromP1) {
    var radians = Math.atan2(lp2[1] - lp1[1], lp2[0] - lp1[0]);

    var derivedPointX = lp1[0] + distanceFromP1 * Math.cos(radians);
    var derivedPointY = lp1[1] + distanceFromP1 * Math.sin(radians);

    return [derivedPointX, derivedPointY];
  },

  distanceBetween: function distanceBetween(fromXY, andXY) {
    var xSegment = andXY[0] - fromXY[0];
    var ySegment = andXY[1] - fromXY[1];
    return Math.sqrt(xSegment * xSegment + ySegment * ySegment);
  },

  stringContainsString: function stringContainsString(str, cont) {
    return str.indexOf(cont) > -1;
  },

  convertMetersToPixels: function convertMetersToPixels(meters, xyScale) {
    // xyScale is milimeters per pixel
    if (xyScale === 0) {
      // 11th commandment--"Thou shall not divide by zero!"
      return -1.0;
    }
    return meters * 1000 / xyScale;
  },

  convertPixelsToMeters: function convertPixelsToMeters(pixels, xyScale) {
    // xyScale is milimeters per pixel
    if (xyScale === 0) {
      // 11th commandment--"Thou shall not divide by zero!"
      return -1.0;
    }
    // xyScale is milimeters per pixel
    return pixels * xyScale / 1000;
  },

  correctPointUsingWayfindPath: function correctPointUsingWayfindPath(setOfPoints, point, noFurtherThan) {
    var returnPoint = [0, 0];
    var closestDistanceFromPath = -1;

    // Loop through points and make lines
    for (var i = 0; i < setOfPoints.points.length - 1; i++) {
      // Get next two points
      var first = setOfPoints.points[i];
      var lineP1 = [first.x, first.y];

      var second = setOfPoints.points[i + 1];
      var lineP2 = [second.x, second.y];

      // Get the distance
      var tempPointOfIntercept = {
        value: [0, 0]
      };

      var nextDistance = __.distanceToLine(point, lineP1, lineP2, tempPointOfIntercept);
      if (closestDistanceFromPath == -1 || nextDistance < closestDistanceFromPath) {
        // New point
        closestDistanceFromPath = nextDistance;

        // Get new point
        returnPoint = tempPointOfIntercept.value;
      }
    }

    // noFurtherThan?
    if (0 < noFurtherThan) {
      var xDist = returnPoint.x - point.x;
      var yDist = returnPoint.y - point.y;
      var distanceFromIntended = Math.sqrt(__.sqr(xDist) + __.sqr(yDist));
      if (noFurtherThan < distanceFromIntended) {
        // Point too far from intended, return original point
        returnPoint = point;
      }
    }

    return returnPoint;
  }

};

module.exports = __;

},{}],38:[function(require,module,exports){
'use strict';

/* jshint -W083 */
var __ = require('./helpers');

module.exports = function (processor) {

  // lineOfSightFromClosestLandmarkToXY version based on rankings
  // It will find 4 landmarks going in four major directions.
  // It will return the closest landmark which is in same direction as the direction of next step.
  processor.lineOfSightFromClosestLandmarkToXY = function (thisXY, pointOfIntercept, direction, previousAngle, forCanvas) {
    var returnDest = null;
    // var intersectPoint = [0, 0];
    var finalUnitId = null;

    // Let's find all four landmarks
    // Forward
    var tempIntersectPointForward = [0, 0];
    var closestDestinationPixelsForward = -1;
    var closestUnitIdForward = null;
    //Slight left
    var tempIntersectPointLeftSlight = [0, 0];
    var closestDestinationPixelsLeftSlight = -1;
    var closestUnitIdLeftSlight = null;
    // Left
    var tempIntersectPointLeft = [0, 0];
    var closestDestinationPixelsLeft = -1;
    var closestUnitIdLeft = null;
    // Slight Right
    var tempIntersectPointRightSlight = [0, 0];
    var closestDestinationPixelsRightSlight = -1;
    var closestUnitIdRightSlight = null;
    // Right
    var tempIntersectPointRight = [0, 0];
    var closestDestinationPixelsRight = -1;
    var closestUnitIdRight = null;
    // Back
    var tempIntersectPointBack = [0, 0];
    var closestDestinationPixelsBack = -1;
    var closestUnitIdBack = null;

    // Get access to shapes
    var canvasShapes = forCanvas;

    // Go through all LBoxes
    for (var i = 0; i < canvasShapes.length; i++) {
      var lbox = canvasShapes[i];
      // Bryan: Got the needed data to highlight Units
      if (lbox) {
        var unitId, lBoxFrame, rotatedPoints;

        if (lbox.parsed) {
          unitId = lbox.parsed.unitId;
          lBoxFrame = lbox.parsed.lBoxFrame;
          rotatedPoints = lbox.parsed.rotatedPoints;
        } else {
          // Get Unit Id
          // Bryan: possible flawed design. I am using first id in array of (possibly) multiple ids
          var dataLbox = lbox.getAttribute('data-lbox');
          if (dataLbox) unitId = parseInt(dataLbox);

          // The CGPath frame is bounding frame (rotated) of LBox
          lBoxFrame = {
            x: parseFloat(lbox.getAttribute('x')),
            y: parseFloat(lbox.getAttribute('y')),
            width: parseFloat(lbox.getAttribute('width')),
            height: parseFloat(lbox.getAttribute('height')),
            transform: lbox.getAttribute('transform')
          };

          // Get rotated points
          rotatedPoints = __.arrayOfRotatedPoints(lBoxFrame);

          lbox.parsed = {
            unitId: unitId,
            lBoxFrame: lBoxFrame,
            rotatedPoints: rotatedPoints,
            dataLbox: dataLbox ? dataLbox.split(',') : []
          };
        }

        // Skip if nil
        if (!unitId) continue;

        // Now get pairs of points and get closest intersection from ThisXY
        var tempIntersectPoint = {
          value: [0, 0]
        };
        // New record will be used to check for line of sight
        var newRecordForward = false;
        var newRecordLeftSlight = false;
        var newRecordLeft = false;
        var newRecordRightSlight = false;
        var newRecordRight = false;
        var newRecordBack = false;
        // Of 4 lines, which one is the closest?
        var currentProposedDestinationPixelsForward = -1;
        var currentProposedDestinationPixelsLeftSlight = -1;
        var currentProposedDestinationPixelsLeft = -1;
        var currentProposedDestinationPixelsRightSlight = -1;
        var currentProposedDestinationPixelsRight = -1;
        var currentProposedDestinationPixelsBack = -1;

        // Top line
        var p1 = rotatedPoints[0];
        var p2 = rotatedPoints[1];
        var p3 = rotatedPoints[2];
        var p4 = rotatedPoints[3];

        // Get distance of nearest intercept
        var distance = __.distanceToLine(thisXY, p1, p2, tempIntersectPoint);
        // Find which way this is pointing to
        var proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);
        // Update the one needed

        switch (proposedDirection.toLowerCase()) {
          case 'forward':
            // Forward
            if (distance < closestDestinationPixelsForward || closestDestinationPixelsForward == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsForward == -1 || distance < currentProposedDestinationPixelsForward) {
                // This is the closest one
                currentProposedDestinationPixelsForward = distance;
                // newRecord
                newRecordForward = true;
                // tempIntersectPointForward
                tempIntersectPointForward = tempIntersectPoint.value;
              }
            }
            break;
          case 'left':
            // Left
            if (distance < closestDestinationPixelsLeft || closestDestinationPixelsLeft == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeft == -1 || distance < currentProposedDestinationPixelsLeft) {
                // This is the closest one
                currentProposedDestinationPixelsLeft = distance;
                // newRecord
                newRecordLeft = true;
                // tempIntersectPointLeft
                tempIntersectPointLeft = tempIntersectPoint.value;
              }
            }
            break;
          case 'right':
            // Right
            if (distance < closestDestinationPixelsRight || closestDestinationPixelsRight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRight == -1 || distance < currentProposedDestinationPixelsRight) {
                // This is the closest one
                currentProposedDestinationPixelsRight = distance;
                // newRecord
                newRecordRight = true;
                // tempIntersectPointRight
                tempIntersectPointRight = tempIntersectPoint.value;
              }
            }
            break;
          case 'back':
            // Back
            if (distance < closestDestinationPixelsBack || closestDestinationPixelsBack == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsBack == -1 || distance < currentProposedDestinationPixelsBack) {
                // This is the closest one
                currentProposedDestinationPixelsBack = distance;
                // newRecord
                newRecordBack = true;
                // tempIntersectPointBack
                tempIntersectPointBack = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight right':
            // Right
            if (distance < closestDestinationPixelsRightSlight || closestDestinationPixelsRightSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRightSlight == -1 || distance < currentProposedDestinationPixelsRightSlight) {
                // This is the closest one
                currentProposedDestinationPixelsRightSlight = distance;
                // newRecord
                newRecordRightSlight = true;
                // tempIntersectPointRight
                tempIntersectPointRightSlight = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight left':
            // Left Slight
            if (distance < closestDestinationPixelsLeftSlight || closestDestinationPixelsLeftSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeftSlight == -1 || distance < currentProposedDestinationPixelsLeftSlight) {
                // This is the closest one
                currentProposedDestinationPixelsLeftSlight = distance;
                // newRecord
                newRecordLeftSlight = true;
                // tempIntersectPointLeft
                tempIntersectPointLeftSlight = tempIntersectPoint.value;
              }
            }
            break;
        }

        // Right line
        // Get distance of nearest intercept
        distance = __.distanceToLine(thisXY, p2, p3, tempIntersectPoint);

        // Find which way this is pointing to
        proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);

        // Update the one needed
        switch (proposedDirection.toLowerCase()) {
          case 'forward':
            // Forward
            if (distance < closestDestinationPixelsForward || closestDestinationPixelsForward == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsForward == -1 || distance < currentProposedDestinationPixelsForward) {
                // This is the closest one
                currentProposedDestinationPixelsForward = distance;
                // newRecord
                newRecordForward = true;
                // tempIntersectPointForward
                tempIntersectPointForward = tempIntersectPoint.value;
              }
            }
            break;
          case 'left':
            // Left
            if (distance < closestDestinationPixelsLeft || closestDestinationPixelsLeft == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeft == -1 || distance < currentProposedDestinationPixelsLeft) {
                // This is the closest one
                currentProposedDestinationPixelsLeft = distance;
                // newRecord
                newRecordLeft = true;
                // tempIntersectPointLeft
                tempIntersectPointLeft = tempIntersectPoint.value;
              }
            }
            break;
          case 'right':
            // Right
            if (distance < closestDestinationPixelsRight || closestDestinationPixelsRight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRight == -1 || distance < currentProposedDestinationPixelsRight) {
                // This is the closest one
                currentProposedDestinationPixelsRight = distance;
                // newRecord
                newRecordRight = true;
                // tempIntersectPointRight
                tempIntersectPointRight = tempIntersectPoint.value;
              }
            }
            break;
          case 'back':
            // Back
            if (distance < closestDestinationPixelsBack || closestDestinationPixelsBack == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsBack == -1 || distance < currentProposedDestinationPixelsBack) {
                // This is the closest one
                currentProposedDestinationPixelsBack = distance;
                // newRecord
                newRecordBack = true;
                // tempIntersectPointBack
                tempIntersectPointBack = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight right':
            // Right
            if (distance < closestDestinationPixelsRightSlight || closestDestinationPixelsRightSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRightSlight == -1 || distance < currentProposedDestinationPixelsRightSlight) {
                // This is the closest one
                currentProposedDestinationPixelsRightSlight = distance;
                // newRecord
                newRecordRightSlight = true;
                // tempIntersectPointRight
                tempIntersectPointRightSlight = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight left':
            // Left Slight
            if (distance < closestDestinationPixelsLeftSlight || closestDestinationPixelsLeftSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeftSlight == -1 || distance < currentProposedDestinationPixelsLeftSlight) {
                // This is the closest one
                currentProposedDestinationPixelsLeftSlight = distance;
                // newRecord
                newRecordLeftSlight = true;
                // tempIntersectPointLeft
                tempIntersectPointLeftSlight = tempIntersectPoint.value;
              }
            }
            break;
        }

        // Bottom line
        // Get distance of nearest intercept
        distance = __.distanceToLine(thisXY, p3, p4, tempIntersectPoint);
        // Find which way this is pointing to
        proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);

        switch (proposedDirection.toLowerCase()) {
          case 'forward':
            // Forward
            if (distance < closestDestinationPixelsForward || closestDestinationPixelsForward == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsForward == -1 || distance < currentProposedDestinationPixelsForward) {
                // This is the closest one
                currentProposedDestinationPixelsForward = distance;
                // newRecord
                newRecordForward = true;
                // tempIntersectPointForward
                tempIntersectPointForward = tempIntersectPoint.value;
              }
            }
            break;
          case 'left':
            // Left
            if (distance < closestDestinationPixelsLeft || closestDestinationPixelsLeft == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeft == -1 || distance < currentProposedDestinationPixelsLeft) {
                // This is the closest one
                currentProposedDestinationPixelsLeft = distance;
                // newRecord
                newRecordLeft = true;
                // tempIntersectPointLeft
                tempIntersectPointLeft = tempIntersectPoint.value;
              }
            }
            break;
          case 'right':
            // Right
            if (distance < closestDestinationPixelsRight || closestDestinationPixelsRight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRight == -1 || distance < currentProposedDestinationPixelsRight) {
                // This is the closest one
                currentProposedDestinationPixelsRight = distance;
                // newRecord
                newRecordRight = true;
                // tempIntersectPointRight
                tempIntersectPointRight = tempIntersectPoint.value;
              }
            }
            break;
          case 'back':
            // Back
            if (distance < closestDestinationPixelsBack || closestDestinationPixelsBack == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsBack == -1 || distance < currentProposedDestinationPixelsBack) {
                // This is the closest one
                currentProposedDestinationPixelsBack = distance;
                // newRecord
                newRecordBack = true;
                // tempIntersectPointBack
                tempIntersectPointBack = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight right':
            // Right
            if (distance < closestDestinationPixelsRightSlight || closestDestinationPixelsRightSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRightSlight == -1 || distance < currentProposedDestinationPixelsRightSlight) {
                // This is the closest one
                currentProposedDestinationPixelsRightSlight = distance;
                // newRecord
                newRecordRightSlight = true;
                // tempIntersectPointRight
                tempIntersectPointRightSlight = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight left':
            // Left Slight
            if (distance < closestDestinationPixelsLeftSlight || closestDestinationPixelsLeftSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeftSlight == -1 || distance < currentProposedDestinationPixelsLeftSlight) {
                // This is the closest one
                currentProposedDestinationPixelsLeftSlight = distance;
                // newRecord
                newRecordLeftSlight = true;
                // tempIntersectPointLeft
                tempIntersectPointLeftSlight = tempIntersectPoint.value;
              }
            }
            break;
        }

        // Left
        // Left line
        // Get distance of nearest intercept
        distance = __.distanceToLine(thisXY, p1, p4, tempIntersectPoint);
        // Find which way this is pointing to
        proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);
        // Update the one needed
        switch (proposedDirection.toLowerCase()) {
          case 'forward':
            // Forward
            if (distance < closestDestinationPixelsForward || closestDestinationPixelsForward == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsForward == -1 || distance < currentProposedDestinationPixelsForward) {
                // This is the closest one
                currentProposedDestinationPixelsForward = distance;
                // newRecord
                newRecordForward = true;
                // tempIntersectPointForward
                tempIntersectPointForward = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight left':
            // Left Slight
            if (distance < closestDestinationPixelsLeftSlight || closestDestinationPixelsLeftSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeftSlight == -1 || distance < currentProposedDestinationPixelsLeftSlight) {
                // This is the closest one
                currentProposedDestinationPixelsLeftSlight = distance;
                // newRecord
                newRecordLeftSlight = true;
                // tempIntersectPointLeft
                tempIntersectPointLeftSlight = tempIntersectPoint.value;
              }
            }
            break;
          case 'left':
            // Left
            if (distance < closestDestinationPixelsLeft || closestDestinationPixelsLeft == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsLeft == -1 || distance < currentProposedDestinationPixelsLeft) {
                // This is the closest one
                currentProposedDestinationPixelsLeft = distance;
                // newRecord
                newRecordLeft = true;
                // tempIntersectPointLeft
                tempIntersectPointLeft = tempIntersectPoint.value;
              }
            }
            break;
          case 'slight right':
            // Right
            if (distance < closestDestinationPixelsRightSlight || closestDestinationPixelsRightSlight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRightSlight == -1 || distance < currentProposedDestinationPixelsRightSlight) {
                // This is the closest one
                currentProposedDestinationPixelsRightSlight = distance;
                // newRecord
                newRecordRightSlight = true;
                // tempIntersectPointRight
                tempIntersectPointRightSlight = tempIntersectPoint.value;
              }
            }
            break;
          case 'right':
            // Right
            if (distance < closestDestinationPixelsRight || closestDestinationPixelsRight == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsRight == -1 || distance < currentProposedDestinationPixelsRight) {
                // This is the closest one
                currentProposedDestinationPixelsRight = distance;
                // newRecord
                newRecordRight = true;
                // tempIntersectPointRight
                tempIntersectPointRight = tempIntersectPoint.value;
              }
            }
            break;
          case 'back':
            // Back
            if (distance < closestDestinationPixelsBack || closestDestinationPixelsBack == -1) {
              // Of current 4, which one is the closest?
              if (currentProposedDestinationPixelsBack == -1 || distance < currentProposedDestinationPixelsBack) {
                // This is the closest one
                currentProposedDestinationPixelsBack = distance;
                // newRecord
                newRecordBack = true;
                // tempIntersectPointBack
                tempIntersectPointBack = tempIntersectPoint.value;
              }
            }
            break;
        }

        // New record(s)?
        var weHaveLineOfSight = false;
        if (newRecordForward || newRecordLeft || newRecordLeftSlight || newRecordRight || newRecordRightSlight || newRecordBack) {
          weHaveLineOfSight = this.lineOfSight(unitId, thisXY, unitId, tempIntersectPoint.value, forCanvas);
        }
        if (newRecordForward) {
          // Line of sight?
          if (weHaveLineOfSight) {
            // Set new record
            closestDestinationPixelsForward = currentProposedDestinationPixelsForward;
            // closestUnitId
            closestUnitIdForward = unitId;
          }
        }
        if (newRecordLeft) {
          // Line of sight?
          if (weHaveLineOfSight) {
            // Set new record
            closestDestinationPixelsLeft = currentProposedDestinationPixelsLeft;
            // closestUnitId
            closestUnitIdLeft = unitId;
          }
        }
        if (newRecordLeftSlight) {
          // Line of sight?
          if (weHaveLineOfSight) {
            // Set new record
            closestDestinationPixelsLeftSlight = currentProposedDestinationPixelsLeftSlight;
            // closestUnitId
            closestUnitIdLeftSlight = unitId;
          }
        }
        if (newRecordRight) {
          // Line of sight?
          if (weHaveLineOfSight) {
            // Set new record
            closestDestinationPixelsRight = currentProposedDestinationPixelsRight;
            // closestUnitId
            closestUnitIdRight = unitId;
          }
        }
        if (newRecordRightSlight) {
          // Line of sight?
          if (weHaveLineOfSight) {
            // Set new record
            closestDestinationPixelsRightSlight = currentProposedDestinationPixelsRightSlight;
            // closestUnitId
            closestUnitIdRightSlight = unitId;
          }
        }
        if (newRecordBack) {
          // Line of sight?
          if (weHaveLineOfSight) {
            // Set new record
            closestDestinationPixelsBack = currentProposedDestinationPixelsBack;
            // closestUnitId
            closestUnitIdBack = unitId;
          }
        }
      }
    }

    // Ranking system
    switch (direction.toLowerCase()) {
      case 'forward':
        // Forward
        if (closestUnitIdForward) {
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
        } else if (closestUnitIdLeftSlight) {
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
        } else if (closestUnitIdRightSlight) {
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
        } else if (closestUnitIdLeft) {
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
        } else if (closestUnitIdRight) {
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        } else if (closestUnitIdBack) {
          finalUnitId = closestUnitIdBack;
          pointOfIntercept.value = tempIntersectPointBack;
        } else {
          void 0;
          console.log('Failed to find unit id for Forward');
        }

        // If right/slight or left/slight closer than forward or back, use it
        // See if left/s or right/s beat it
        if (closestDestinationPixelsForward > closestDestinationPixelsLeftSlight && closestUnitIdLeftSlight) {
          // Left Slight
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
          // This prevents Right from overwriting but allows it to compete
          closestDestinationPixelsForward = closestDestinationPixelsLeftSlight;
        }
        // See if left/s or right/s beat it
        if (closestDestinationPixelsForward > closestDestinationPixelsRightSlight && closestUnitIdRightSlight) {
          // Left Slight
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
          // This prevents Right from overwriting but allows it to compete
          closestDestinationPixelsForward = closestDestinationPixelsRightSlight;
        }
        // See if left or right beat it
        if (closestDestinationPixelsForward > closestDestinationPixelsLeft && closestUnitIdLeft) {
          // Left
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
          // This prevents Right from overwriting but allows it to compete
          closestDestinationPixelsForward = closestDestinationPixelsLeft;
        }
        // Right
        if (closestDestinationPixelsForward > closestDestinationPixelsRight && closestUnitIdRight) {
          // Right
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        }
        break;
      case 'left':
        // Left
        if (closestUnitIdLeft) {
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
        } else if (closestUnitIdLeftSlight) {
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
        } else if (closestUnitIdForward) {
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
        } else if (closestUnitIdBack) {
          finalUnitId = closestUnitIdBack;
          pointOfIntercept.value = tempIntersectPointBack;
        } else if (closestUnitIdRight) {
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        } else if (closestUnitIdRightSlight) {
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
        } else {
          void 0;
          console.log('Failed to find unit id for Left');
        }

        // Left:
        // Forward, Slight Left can beat it
        if (closestDestinationPixelsLeft > closestDestinationPixelsForward && closestUnitIdForward) {
          // Left Slight
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
          closestDestinationPixelsLeft = closestDestinationPixelsForward;
        }
        // See if left or right beat it
        if (closestDestinationPixelsLeft > closestDestinationPixelsLeftSlight && closestUnitIdLeftSlight) {
          // Left Slight
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
          closestDestinationPixelsLeft = closestDestinationPixelsLeftSlight;
        }
        break;
      case 'right':
        // Right
        if (closestUnitIdRight) {
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        } else if (closestUnitIdRightSlight) {
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
        } else if (closestUnitIdForward) {
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
        } else if (closestUnitIdBack) {
          finalUnitId = closestUnitIdBack;
          pointOfIntercept.value = tempIntersectPointBack;
        } else if (closestUnitIdLeft) {
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
        } else if (closestUnitIdLeftSlight) {
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
        } else {
          void 0;
          console.log('Failed to find unit id for Right');
        }

        // Right:
        // Forward, Slight Right can beat it
        if (closestDestinationPixelsRight > closestDestinationPixelsForward && closestUnitIdForward) {
          // Left Slight
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
          closestDestinationPixelsRight = closestDestinationPixelsForward;
        }
        // See if left or right beat it
        if (closestDestinationPixelsRight > closestDestinationPixelsRightSlight && closestUnitIdRightSlight) {
          // Right
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
          closestDestinationPixelsRight = closestDestinationPixelsRightSlight;
        }
        break;
      case 'back':

        // If right or left closer than forward or back, use it
        // Back
        if (closestUnitIdBack) {
          finalUnitId = closestUnitIdBack;
          pointOfIntercept.value = tempIntersectPointBack;
        }
        if (closestUnitIdRight) {
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        } else if (closestUnitIdRightSlight) {
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
        } else if (closestUnitIdLeft) {
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
        } else if (closestUnitIdLeftSlight) {
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
        } else if (closestUnitIdForward) {
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
        } else {
          void 0;
          console.log('Failed to find unit id for Back');
        }

        // Back
        // If right/slight or left/slight closer than forward or back, use it
        // See if left/s or right/s beat it
        if (closestDestinationPixelsForward > closestDestinationPixelsLeftSlight && closestUnitIdLeftSlight) {
          // Left Slight
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
          // This prevents Right from overwriting but allows it to compete
          closestDestinationPixelsForward = closestDestinationPixelsLeftSlight;
        }
        // See if left/s or right/s beat it
        if (closestDestinationPixelsForward > closestDestinationPixelsRightSlight && closestUnitIdRightSlight) {
          // Left Slight
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
          // This prevents Right from overwriting but allows it to compete
          closestDestinationPixelsForward = closestDestinationPixelsRightSlight;
        }
        // See if left or right beat it
        if (closestDestinationPixelsBack > closestDestinationPixelsLeft && closestUnitIdLeft) {
          // Left
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
          // This prevents Right from overwriting but allows it to compete
          closestDestinationPixelsForward = closestDestinationPixelsLeft;
        }
        // Right
        if (closestDestinationPixelsBack > closestDestinationPixelsRight && closestUnitIdRight) {
          // Right
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        }

        break;

      case 'slight right':
        // Slight Right
        if (closestUnitIdRightSlight) {
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
        } else if (closestUnitIdRight) {
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        } else if (closestUnitIdForward) {
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
        } else if (closestUnitIdBack) {
          finalUnitId = closestUnitIdBack;
          pointOfIntercept.value = tempIntersectPointBack;
        } else if (closestUnitIdLeft) {
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
        } else if (closestUnitIdLeftSlight) {
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
        } else {
          void 0;
          console.log('Failed to find unit id for Slight Right');
        }

        // Slight Right:
        // Forward, Right can beat it
        if (closestDestinationPixelsRightSlight > closestDestinationPixelsForward && closestUnitIdForward) {
          // Left Slight
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
          closestDestinationPixelsRightSlight = closestDestinationPixelsForward;
        }
        // See if left or right beat it
        if (closestDestinationPixelsRightSlight > closestDestinationPixelsRight && closestUnitIdRight) {
          // Right
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
          closestDestinationPixelsRightSlight = closestDestinationPixelsRight;
        }
        break;
      case 'slight left':
        // Slight Left
        if (closestUnitIdLeftSlight) {
          finalUnitId = closestUnitIdLeftSlight;
          pointOfIntercept.value = tempIntersectPointLeftSlight;
        } else if (closestUnitIdLeft) {
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
        } else if (closestUnitIdForward) {
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
        } else if (closestUnitIdBack) {
          finalUnitId = closestUnitIdBack;
          pointOfIntercept.value = tempIntersectPointBack;
        } else if (closestUnitIdRight) {
          finalUnitId = closestUnitIdRight;
          pointOfIntercept.value = tempIntersectPointRight;
        } else if (closestUnitIdRightSlight) {
          finalUnitId = closestUnitIdRightSlight;
          pointOfIntercept.value = tempIntersectPointRightSlight;
        } else {
          void 0;
          console.log('Failed to find unit id for Slight Left');
        }

        // Slight Left:
        // Forward, Left can beat it
        if (closestDestinationPixelsLeftSlight > closestDestinationPixelsForward && closestUnitIdForward) {
          // Left Slight
          finalUnitId = closestUnitIdForward;
          pointOfIntercept.value = tempIntersectPointForward;
          closestDestinationPixelsLeftSlight = closestDestinationPixelsForward;
        }
        // See if left or right beat it
        if (closestDestinationPixelsLeftSlight > closestDestinationPixelsLeft && closestUnitIdLeft) {
          // Left
          finalUnitId = closestUnitIdLeft;
          pointOfIntercept.value = tempIntersectPointLeft;
          // This prevents Right from overwriting but allows it to compete
          closestDestinationPixelsLeftSlight = closestDestinationPixelsLeft;
        }
        break;
    }

    // Found solution?
    if (finalUnitId) {
      // Get the unit
      for (var j = 0; j < this.model.destinations.length; j++) {
        if (this.model.destinations[j].id == finalUnitId) {
          returnDest = this.model.destinations[j];
          break;
        }
      }
    } else {
      console.log('No final Unit Id');
    }
    return returnDest;
  };

  // Line of Sight worker method
  processor.lineOfSight = function (unitId, fromXY, toUnitId, toXY, forCanvas) {
    // We have the new closest distance, but do we have line of sight?
    // NOTE: algorithm assumes from point is not obstructed by Blockers
    // Flag that fails if Unit's shape gets in the line of sight

    var weHaveLineOfSight = true;
    // Get access to shapes
    var canvasShapes = forCanvas;
    for (var i = 0; i < canvasShapes.length; i++) {
      var nextInWayElement = canvasShapes[i];

      // LBox
      if (nextInWayElement) {
        var lbox = nextInWayElement;
        // Use every LBox
        var lBoxFrame, rotatedPoints, dataLbox, lBoxUnit;
        // Are all 4 points of this LBox inside blockers?
        // The CGPath frame is bounding frame (rotated) of LBox
        if (lbox.parsed) {
          lBoxFrame = lbox.parsed.lBoxFrame;
          rotatedPoints = lbox.parsed.rotatedPoints;
          dataLbox = lbox.parsed.dataLbox;
        } else {
          lBoxFrame = {
            x: parseFloat(lbox.getAttribute('x')),
            y: parseFloat(lbox.getAttribute('y')),
            width: parseFloat(lbox.getAttribute('width')),
            height: parseFloat(lbox.getAttribute('height')),
            transform: lbox.getAttribute('transform')
          };
          // Get rotated points
          rotatedPoints = __.arrayOfRotatedPoints(lBoxFrame);
          lBoxUnit = lbox.getAttribute('data-lbox');
          dataLbox = lBoxUnit ? lBoxUnit.split(',') : [];
          lbox.parsed = {
            unitId: lBoxUnit ? parseInt(lBoxUnit) : null,
            lBoxFrame: lBoxFrame,
            rotatedPoints: rotatedPoints,
            dataLbox: dataLbox
          };
        }

        // Find LBoxes only
        if (lbox) {
          // Use every LBox
          // Are all 4 points of this LBox inside blockers?
          // The CGPath frame is bounding frame (rotated) of LBox
          // Get rotated points
          if (rotatedPoints.length === 0) {
            rotatedPoints = __.arrayOfRotatedPoints(lBoxFrame);
          }
          // Points
          var p1 = rotatedPoints[0];
          var p2 = rotatedPoints[1];
          var p3 = rotatedPoints[2];
          var p4 = rotatedPoints[3];

          // Make sure the Shape doesn't belong to currently tested LBox
          var differentUnit = true;

          dataLbox.forEach(function (nextUnitId) {
            if (nextUnitId == unitId) differentUnit = false;
          });

          if (differentUnit) {
            // Identify if fromXY is inside empty LBox and avoid using it for lineOfSight
            if (dataLbox.length === 0) {
              // If fromXY is inside?
              // If inside, don't use the rect, continue
              // If not inside, use the rect
              if (__.isPointInsideRotatedRect(fromXY, p1, p2, p3, p4)) {
                continue;
              }
            }

            // intersect?
            // Dont do all if you don't have to
            var b1 = __.doLineSegmentsIntersect(fromXY, toXY, p1, p2);
            if (b1 === false) {
              var b2 = __.doLineSegmentsIntersect(fromXY, toXY, p2, p3);
              if (b2 === false) {
                var b3 = __.doLineSegmentsIntersect(fromXY, toXY, p3, p4);
                if (b3 === false) {
                  var b4 = __.doLineSegmentsIntersect(fromXY, toXY, p4, p1);
                  if (b4 === false) {
                    // Good
                    void 0;
                  } else {
                    // This rect is in the way
                    return false;
                  }
                } else {
                  // This rect is in the way
                  return false;
                }
              } else {
                // This rect is in the way
                return false;
              }
            } else {
              // This rect is in the way
              return false;
            }
          }
        }
      }
    }
    return weHaveLineOfSight;
  };
};

/*

*/

},{"./helpers":37}],39:[function(require,module,exports){
'use strict';

var __ = require('./helpers');
var filterNo1TakeOutDirectionsBetweenLastAndFirst = require('./filter/end-as-landmark');
var filterNo2StartDirectionCleanUpAllWhichUseDestinationAsLandmarks = require('./filter/start-as-landmark');
var filterNo3UTurnDetection = require('./filter/uturn');
var filterNo4RemoveConsecutiveForwards = require('./filter/consecutive-forwards');
var filterNo5RedundantInstructionsInMiddleInstructionsComboDirections = require('./filter/combo-directions');
var filterNo6ContinuePastFiller = require('./filter/continue-past');

var Instruction = require('./Instruction');

module.exports = function (processor) {

  processor.makeTextDirections = function (options) {
    console.time('makeTextDirections');
    var wayfindArray = options.pointArray;
    var filterOn = options.filter;
    var UTurnInMeters = options.UTurnInMeters;
    var addTDifEmptyMeters = options.addTDifEmptyMeters;

    // Protect code
    if (wayfindArray.length === 0) {
      // Do not proceed
      throw '!';
      return null;
    }

    // Array of text directions
    var textDirectionsForAllFloorsArray = [];
    // Text directions of One floor
    // First node
    var firstNode = null;
    // Direction to next point will always be from 0 to 360
    // Negative means start
    // This angle will be carried to next direction to figure out turning direction
    var previousAngle = -1;

    // NOTE: Once we figure out which floor mover will take us to, skip all other floors in sequence
    var moverTakesUsToFloor = null;

    for (var i = 0; i < wayfindArray.length; i++) {
      var useArrayOfFloorWaypoints = wayfindArray[i];
      var textDirectionsFloorArray = [];

      // Loop throught all
      // Continue if this is not the next floor
      if (moverTakesUsToFloor) {
        // Skip if not expected floor
        if (moverTakesUsToFloor != useArrayOfFloorWaypoints) {
          continue;
        }
      }
      // Reset moverTakesUsToFloor
      moverTakesUsToFloor = null;

      firstNode = useArrayOfFloorWaypoints.points[0];

      if (firstNode) {
        // Make next text instruction
        // Get arrayOfFloorWaypoints for input floor
        var currentFloorTextDirection = this.model.getFloorById(firstNode.mapId);
        var curCanvas = this.shapes[firstNode.mapId].lboxes;

        if (currentFloorTextDirection.mapId == firstNode.mapId) {
          // Got it

          // Make new set of text directions for this floor
          var nextNode = null;
          if (useArrayOfFloorWaypoints.points.length > 1) {
            nextNode = useArrayOfFloorWaypoints.points[1];
          }

          // Populate basic info
          var nextDir = this.makeTextDirectionInstruction(wayfindArray, useArrayOfFloorWaypoints, currentFloorTextDirection, firstNode, nextNode, -1);

          // Carry angle to next for next step and call it previousAngle
          previousAngle = nextDir.angleToNext;

          // Coming from ...?
          // 'Arrive at *'
          var startingFrom = '';
          var usingLandmark = false;

          // Absolute start?
          //Get Edge type ID
          // if (firstNode.usedEdgeTypeId == -1) {
          if (i === 0) {
            // console.log('Absolute start');

            // This will always be the case if this is the absolute start
            // Make sure we have nearest destination
            if (nextDir.destination) {
              startingFrom = nextDir.destination.name;
            } else {
              // Find nearest Destination
              //...
              if (nextDir.landmarkDestination) {
                startingFrom = nextDir.landmarkDestination.name;
                usingLandmark = true;
              } else {
                startingFrom = 'Nearest Destination';
              }
            }
          } else if (firstNode.usedEdgeTypeId == 1) {
            // Not sure this will ever be the case
            startingFrom = nextDir.destination.name;
          }
          // Mover?
          // //if(firstNode.usedEdgeTypeId == 3)
          else {
              // console.log('Mover');

              startingFrom = 'Mover';
              // Go to parent node floor and pick up mover info
              // var parentWaypoint = this.model.getWaypointInformation(firstNode.id); //firstNode.parent.nodeId
              var parentWaypoint = this.model.getWaypointInformation(firstNode.parent.id); //firstNode.parent.nodeId
              // Find floor info
              // Get arrayOfFloorWaypoints for input floor
              for (var k = 0; k < wayfindArray.length; k++) {
                var arrayOfFloorWaypoints = wayfindArray[k];
                // From Direction
                // Get current
                var tempNode = arrayOfFloorWaypoints.points[0];
                if (tempNode) {
                  // Same floor as parent?
                  if (parentWaypoint.mapId == tempNode.mapId) {
                    // Got it
                    startingFrom = arrayOfFloorWaypoints.mover ? arrayOfFloorWaypoints.mover.typeName : 'Mover';

                    // Break
                    break;
                  }
                }
              }
            }

          // Output
          if (usingLandmark) {
            nextDir.output = __.stringWithFormat('With % on your %, go %.', startingFrom, nextDir.directionToLandmark, nextDir.direction);
          } else {
            nextDir.output = __.stringWithFormat('With % behind you, go %.', startingFrom, nextDir.direction);
          }

          //Set type
          nextDir.type = 'orientation';

          // Add to array
          textDirectionsFloorArray.push(nextDir);

          // Decision points
          // Get previous, current and next
          for (var l = 1; l < useArrayOfFloorWaypoints.points.length - 1; l++) {
            // Get current
            var curentNode = useArrayOfFloorWaypoints.points[l];
            // Get next
            nextNode = useArrayOfFloorWaypoints.points[l + 1];
            // Make next text instruction
            nextDir = this.makeTextDirectionInstruction(wayfindArray, useArrayOfFloorWaypoints, currentFloorTextDirection, curentNode, nextNode, previousAngle);
            // Carry angle to next for next step and call it previousAngle
            previousAngle = nextDir.angleToNext;
            // Output
            if (nextDir.landmarkDestination) {

              nextDir.output = __.stringWithFormat('With % on your %, go %.', nextDir.landmarkDestination.name, nextDir.directionToLandmark, nextDir.direction);

              //Set type
              nextDir.type = 'orientation';

              // Add to array
              textDirectionsFloorArray.push(nextDir);
            }
          }

          // Last?
          // Get current
          var lastNode = useArrayOfFloorWaypoints.points[useArrayOfFloorWaypoints.points.length - 1];
          if (lastNode) {
            // Add last
            // Make last text instruction
            nextDir = this.makeTextDirectionInstruction(wayfindArray, useArrayOfFloorWaypoints, currentFloorTextDirection, lastNode, null, previousAngle);

            // 'Arrive at... ?
            var lastDirection = '';

            if (!useArrayOfFloorWaypoints.mover || useArrayOfFloorWaypoints.mover.pathTypeId == 1) {
              void 0;
              // Final destination
              var de = nextDir.destination;
              nextDir.type = 'end';
              lastDirection = __.stringWithFormat('Arrive at %.', de ? de.name : 'destination');
            }
            // Mover?
            else {
                // Mover Name
                var moverName = useArrayOfFloorWaypoints.mover.typeName;

                // Mover Direction
                var floorAfter = wayfindArray[i + 1];
                var moverGoesToLevel = '';
                var nextSeq = null;
                if (floorAfter) {
                  nextSeq = floorAfter.seq;
                }
                if (nextSeq > useArrayOfFloorWaypoints.seq) {
                  // Up
                  nextDir.direction = 'Up';
                } else if (nextSeq < useArrayOfFloorWaypoints.seq) {
                  // Down
                  nextDir.direction = 'Down';
                } else {
                  // Unknown
                  nextDir.direction = 'Unknown Mover Direction';
                }

                // Let's try to figure out how far we can go
                // var moverId = useArrayOfFloorWaypoints.mover;
                // Get next floor by going one array up/down using wayfind array
                // Get next array using floorIndex
                // pathTypeId:
                // 2 == Elevator
                // 4 == Stairs
                // 3 == Escalator
                // Get index of current floor
                var flIndex = wayfindArray.indexOf(useArrayOfFloorWaypoints);
                var previousFloorNodeId = lastNode.id;
                var highestFloorSeq = useArrayOfFloorWaypoints.seq;
                var keepLooking = true;
                while (keepLooking) {
                  // Get next floor index
                  flIndex++;
                  // Can it be?
                  if (wayfindArray.length > flIndex && flIndex >= 0) {
                    // Get next floor
                    var nextArrayOfFloorWaypoints = wayfindArray[flIndex];

                    // Logic: Is the first node same as previous (parent node) AND
                    // Is first node same as last node AND
                    // Is first next node same as last next node
                    var pts = nextArrayOfFloorWaypoints.points;
                    var firstNodeNext = pts[0];
                    var lastNodeNext = pts[pts.length - 1];

                    // Is the first node same as previous (parent node)
                    if (previousFloorNodeId == firstNodeNext.parent.id) {
                      // Yes
                      // This is new highest floor
                      highestFloorSeq = nextArrayOfFloorWaypoints.seq;

                      // Remember it so we don't generate text directions for skipped floors
                      moverTakesUsToFloor = nextArrayOfFloorWaypoints;

                      // First node same as next node
                      if (firstNodeNext.id == lastNodeNext.id) {
                        // There is a possibility we can go higher
                        previousFloorNodeId = lastNodeNext.id;
                      } else {
                        // Cannot continue
                        keepLooking = false;
                      }
                    } else {
                      // No match
                      // This would be odd
                      keepLooking = false;
                    }
                  } else {
                    // No more floors, out of the loop
                    keepLooking = false;
                  }
                }
                // Get next floor
                var finalNextFloor = this.model.getFloorBySequence(highestFloorSeq);
                moverGoesToLevel = finalNextFloor.name;

                // Translate Mover information
                nextDir.type = 'mover';
                nextDir.moverType = moverName;
                lastDirection = __.stringWithFormat('Take % %, to %', moverName, nextDir.direction, moverGoesToLevel);
              }

            // Output
            nextDir.output = lastDirection;

            // Angle to next
            nextDir.angleToNext = -1;

            // Add to array
            textDirectionsFloorArray.push(nextDir);
          }
        } else {
          return null;
        }

        // Filter?
        //filterOn = false;
        if (filterOn) {
          // console.log('Instructions to start with:', textDirectionsFloorArray.length);

          // Get scale
          // this is a float of how many milimeters are prepresented by one pixel on the map
          var currentFloor = this.model.getFloorById(useArrayOfFloorWaypoints.mapId);
          var xScale = currentFloor.xScale;
          var yScale = currentFloor.yScale;
          var enableDistanceFilters = xScale > 0 && yScale > 0;

          var instruction = {
            textDirectionsFloorArray: textDirectionsFloorArray,
            useArrayOfFloorWaypoints: useArrayOfFloorWaypoints,
            wayfindArray: wayfindArray,
            filterOn: filterOn,
            addTDifEmptyMeters: addTDifEmptyMeters,
            UTurnInMeters: UTurnInMeters,
            enableDistanceFilters: enableDistanceFilters,
            xScale: xScale,
            yScale: yScale,
            currentFloorTD: currentFloor,
            curCanvas: curCanvas
          };

          // Filter array
          // 1. Take out text directions between last one and the first one that has final Destination as its landmark.
          if (true) {
            // console.log('f1 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo1TakeOutDirectionsBetweenLastAndFirst.call(this, instruction);

            // console.log('f1 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 2. Start Direction assumes directions of all next directions which use its Destination as their Landmarks.
          // Start with: 1) With Store behind you, go Forward. 2) With Store on your Right, go Right. 3) next...
          // Correct to: 1) With Store behind you, go Right. 2) next...
          // On first floor!
          // See if next text direction is using start-destination and if it does, fold it, taking its direction as first.
          if (true) {
            // console.log('f2 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo2StartDirectionCleanUpAllWhichUseDestinationAsLandmarks.call(this, instruction);

            // console.log('f2 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 3. U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
          if (true) {
            // console.log('f3 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo3UTurnDetection.call(this, instruction);

            // console.log('f3 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 4. Remove consecutive Forwards
          if (true) {
            // console.log('f4 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo4RemoveConsecutiveForwards.call(this, instruction);

            // console.log('f4 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 5. Redundant instructions in the Middle of Instructions (combo-directions)
          // Left at Macys, Right at Macys... into: "Turn Left then Right at Macys"
          // NOTE: Avoid Forward directions unless they are at the very end of combo-instruction.
          // Don't have Right, Forward, Left, Forward
          // Instead have: Right, Left, Forward
          // Keep looping while
          if (true) {
            // console.log('f5 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo5RedundantInstructionsInMiddleInstructionsComboDirections.call(this, instruction);

            // console.log('f5 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // Filter No.6 Continue Past, FiLLer!
          if (true) {
            // console.log('f6 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo6ContinuePastFiller.call(this, instruction);

            // console.log('f6 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }
        }

        // Language filters:
        var loopTo5 = textDirectionsFloorArray.length - 1;
        for (var s = 1; s < loopTo5; s++) {

          // Get direction
          var _currentInstruction = textDirectionsFloorArray[s];
          // Filter its output
          _currentInstruction.output = this.languageFilters(_currentInstruction.output);
        }

        // Add to array
        textDirectionsForAllFloorsArray.push(textDirectionsFloorArray);
      }
    }

    //Add distance to every text direction
    for (var floorIndex = 0; floorIndex < textDirectionsForAllFloorsArray.length; floorIndex++) {
      // Get next floor
      var _nextFloor = textDirectionsForAllFloorsArray[floorIndex];

      // Get to way find array
      var _useArrayOfFloorWaypoints = wayfindArray[floorIndex];
      var currentFloor_ = this.model.getFloorById(_useArrayOfFloorWaypoints.mapId);
      var xScale_ = currentFloor_.xScale;
      var yScale_ = currentFloor_.yScale;
      var enableDistanceFilters_ = xScale_ > 0 && yScale_ > 0;

      // Counters
      var currentDistancePixels = 0;

      // Go through text directions
      for (var __nextDirection = 1; __nextDirection < _nextFloor.length; __nextDirection++) {
        var nextInstruction__ = _nextFloor[__nextDirection];

        var previousInstruction__ = _nextFloor[__nextDirection - 1];

        // Get CGPoint
        var nextPoint__ = [nextInstruction__.wp.x, nextInstruction__.wp.y];
        var previousPoint__ = [previousInstruction__.wp.x, previousInstruction__.wp.y];

        // Get distance from to
        var distance = __.distanceBetween(previousPoint__, nextPoint__);

        // currentDistancePixels
        currentDistancePixels += distance;

        // Add to total distance
        nextInstruction__.distanceFromStartPixels = currentDistancePixels;

        // Add to previousInstruction__
        previousInstruction__.distanceToNextPixels = distance;

        // Meters
        if (enableDistanceFilters_) {
          // Add to total distance in meters
          nextInstruction__.distanceFromStartMeters = __.convertPixelsToMeters(nextInstruction__.distanceFromStartPixels, xScale_);

          // Add to previousInstruction__
          previousInstruction__.distanceToNextMeters = __.convertPixelsToMeters(previousInstruction__.distanceToNextPixels, xScale_);
        }

        // Carry point
        previousPoint__ = nextPoint__;
      }
    }

    // Ret
    console.timeEnd('makeTextDirections');
    return textDirectionsForAllFloorsArray;
  };

  // Make single Text Direction
  processor.makeTextDirectionInstruction = function (wayfindArray, floorWaypoints, floor, currentNode, nextNode, previousToAngle) {

    // Make next text instruction
    //Initial properties are at bottom of file.
    //This should probably become a class
    // var nextDir = {
    //   foldToBack: foldToBack,
    //   foldInFront: foldInFront
    // };
    var nextDir = new Instruction();

    // Text direction floor information
    // Get first WP
    nextDir.floor = floor.mapId;
    nextDir.floorName = floor.description;

    // Current Waypoint, Destination and Direction

    // Waypoint
    nextDir.wp = this.model.getWaypointInformation(currentNode.id);
    if (nextDir.wp === null) {
      // console.log('No WAYPOINT???');
      // I don't think we can continue
      return null;
    }

    // Get destination
    var destinationsArray = this.model.getDestinationByWaypointId(currentNode.id);
    if (destinationsArray.length === 0) {
      void 0;
      // console.log('No Destination at waypoint.');
    } else {
        nextDir.destination = destinationsArray[0];
      }

    // Direction
    // Get Direction
    // Figure out the angle to next

    // Current point
    var currentPoint = [currentNode.x, currentNode.y];

    // Next point
    var nextPoint;
    if (nextNode === null) {
      nextPoint = currentPoint;
    } else {
      nextPoint = [nextNode.x, nextNode.y];
    }

    // Get angle
    var angle = __.pointPairToBearingDegrees(currentPoint, nextPoint);
    // Get angle to next
    nextDir.angleToNext = angle;
    // previousAngle
    // If we are starting on new floor, previousToAngle should be -1
    if (previousToAngle == -1) {
      // Repeat angle
      nextDir.angleToNextOfPreviousDirection = angle;
    } else {
      // This Text Direction is not the first one on this floor so use previousToAngle
      nextDir.angleToNextOfPreviousDirection = previousToAngle;
    }
    // What is the angle difference?
    var angleDifference = nextDir.angleToNextOfPreviousDirection - nextDir.angleToNext;
    while (angleDifference < -180) {
      angleDifference += 360;
    }while (angleDifference > 180) {
      angleDifference -= 360;
    } // Compute next direction
    nextDir.direction = __.directionFromAngle(angleDifference, null);

    // Use angleToNext to create blockers
    // If you don't find any destinations, go in sequence:
    // Step 1 - Left Down
    // Step 2 - Up Left
    // Step 3 - Right Down
    // Step 4 - Right Up

    // falseTE: Using true angles (pointPairToBearingDegrees) produces angle with 0 degree which is on x axis on left side
    //        90
    //        |
    //        y
    //        |
    // 180--x-+--- 0 degrees
    //        |
    //        |
    //        270
    //        |
    // ************************
    // Create blockers
    // These will be rectangles covering the portion of map with possible Landmarks which are less desirable

    // Get link to helper method class
    // var curCanvas = this.shapes[floor.id].lboxes;
    // Produce Landmark using Blockers sequence
    // var nextStep = 0;
    var tempLandmark = null;

    // Next angle
    // var nextAngle = -1;

    // Landmark
    // Get Landmark using line of sight
    // Used to describe point of reference eg.: 'With *Landmark* on your Left, proceed Forward'
    // Get nearest destination using line of sight
    var returnClosestPoint = {
      value: null
    };
    var theCanvas = this.shapes[floor.mapId].lboxes;

    tempLandmark = this.lineOfSightFromClosestLandmarkToXY(currentPoint, returnClosestPoint, nextDir.direction, nextDir.angleToNextOfPreviousDirection, theCanvas);

    if (tempLandmark) {
      nextDir.landmarkDestination = tempLandmark;
      // Find WP so we can accurately determine angle to destination's entrance
      var landmarkWP = this.model.getWaypointsByDestinationId(nextDir.landmarkDestination.id)[0];
      if (landmarkWP) {
        nextDir.landmarkWP = landmarkWP;

        // Get angle comparing Direction angleToNext
        // Direction
        //property NSString *direction;
        // Get Direction
        // Figure out the angle to next
        // Get angle
        angle = __.pointPairToBearingDegrees(currentPoint, returnClosestPoint.value);
        // Get angle to next
        nextDir.angleToLandmark = angle;

        // What is the angle difference?
        var angleToLandmarkDifference = nextDir.angleToNextOfPreviousDirection - nextDir.angleToLandmark;
        while (angleToLandmarkDifference < -180) {
          angleToLandmarkDifference += 360;
        }while (angleToLandmarkDifference > 180) {
          angleToLandmarkDifference -= 360;
        } // Compute next direction
        nextDir.directionToLandmark = __.directionFromAngle(angleToLandmarkDifference, null);
      }
    } else {
      // No destination
      nextDir.landmarkDestination = null;
      nextDir.landmarkWP = null;
      nextDir.angleToLandmark = -1;
      console.log('No Landmark Destination.');
    }

    // Ret
    return nextDir;
  };

  processor.languageFilters = function (thisOutput) {
    // Bad:  On your Forward
    // Good: in front
    if (__.stringContainsString(thisOutput, 'on your Forward')) {
      thisOutput = thisOutput.split('on your Forward').join('in front');
    }

    // Bad:  On your Back
    // Good: in front
    if (__.stringContainsString(thisOutput, 'on your Back')) {
      thisOutput = thisOutput.split('on your Back').join('behind you');
    }

    // Bad:  go Right
    // Good: turn Right
    if (__.stringContainsString(thisOutput, 'go Right')) {
      thisOutput = thisOutput.split('go Right').join('turn Right');
    }

    // Bad:  go Left
    // Good: turn Left
    if (__.stringContainsString(thisOutput, 'go Left')) {
      thisOutput = thisOutput.split('go Left').join('turn Left');
    }

    // Ret
    return thisOutput;
  };
};

},{"./Instruction":29,"./filter/combo-directions":31,"./filter/consecutive-forwards":32,"./filter/continue-past":33,"./filter/end-as-landmark":34,"./filter/start-as-landmark":35,"./filter/uturn":36,"./helpers":37}],40:[function(require,module,exports){
'use strict';
/** Class representing utility functions */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utility = function () {

  /**
   * Create a Utility method set
   */

  function Utility() {
    _classCallCheck(this, Utility);
  }

  /**
   * This method can only be used in the browser, used to decode any HTML entities found in strings
   * @throws {Error} - Utility :: Cannot Decode HTML entites outside of browser
   * @param str - string to decode
   * @returns {String} - String with HTML entity decoded
   */


  _createClass(Utility, [{
    key: 'decodeEntities',
    value: function decodeEntities(str) {
      try {
        // this prevents any overhead from creating the object each time
        if (!this.elementDecoder) this.elementDecoder = document.createElement('div');

        if (str && typeof str === 'string') {
          // strip script/html tags
          var element = this.elementDecoder;
          str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
          str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
          element.innerHTML = str;
          str = element.textContent;
          element.textContent = '';
          return str;
        }
        return str;
      } catch (e) {
        throw new Error('Utility :: Cannot Decode HTML entites outside of browser');
      }
    }

    /**
     * @param matrix - Css transform matrix value: matrix(a,b,c,d,e,f)
     * @returns number
     */

  }, {
    key: 'getScaleFromMatrix',
    value: function getScaleFromMatrix(mx) {
      if (!mx || mx.constructor !== String) return 1;
      var values = undefined,
          a = undefined;
      values = mx.split('(')[1].split(')')[0].split(' ');
      a = parseFloat(values[0]);
      return a;
    }

    /**
     * @param matrix - Css transform matrix value: matrix(a,b,c,d,e,f)
     * @returns number
     */

  }, {
    key: 'getRotationFromMatrix',
    value: function getRotationFromMatrix(mx) {
      if (!mx || mx.constructor !== String) return 0;
      var values = undefined,
          a = undefined,
          b = undefined;
      values = mx.split('(')[1].split(')')[0].split(' ');
      a = parseFloat(values[0]);
      b = parseFloat(values[1]);
      return Math.round(Math.atan2(b, a) * (180 / Math.PI));
    }

    /**
     * Return distance between two points
     * @param {Object} point1 - Frist point
     * @param {Number} point1.x - X coordinate of first point
     * @param {Number} point1.y - Y coordinate of first point
     * @param {Object} point2 - Second point
     * @param {Object} point2.x - X coordinate of second point
     * @param {Object} point2.y - Y coordinate of second point
     * @return {Number} Distance between two points
     */

  }, {
    key: 'getDistanceBetweenTwoPoints',
    value: function getDistanceBetweenTwoPoints(point1, point2) {
      return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    /**
     * return array of associations associated with an entityId
     * @param {Array} array - The array of objects you wish to search. This method will scan all properties with the type of string.
     * @param {String} string - The query to return results by.
     * @param {Array} highRankProperties - This will add more points to an object containing a match inside this property.
     * @param {Number} results - The amount of results to be returned.
     * @example
     *
     * //String to search by
     * let query = 'my query';
     *
     * //Search all destinations
     * let toQuery = jmap.DestinationCollection.getAll()
     *
     * //Amount of search results
     * var amount = 5;
     *
     * //If object contains a match inside this property,
     * //it will score higher as a result.
     * var highRankProperties = ['name', 'keywords'];
     * var results = JMap.util.getObjectsInArrayByString(toQuery, query, highRankProperties, amount);
     *
     * console.log(results) //-> Array of destinations matching 'my query'
     *
     * @return {Array} Filtered Array of passed in objects
     */

  }, {
    key: 'getObjectsInArrayByString',
    value: function getObjectsInArrayByString(array, query, highRankProperties, maxResults) {
      query = query.trim();
      if (query === '') return [];
      var results = [];
      var doesMatch = [];
      if (!highRankProperties) highRankProperties = [];
      if (!maxResults) maxResults = 5;

      function getPropertyScore(_item, _prop, _query) {
        var score = 0;

        var queryPattern = new RegExp(_query.toLowerCase());

        //Position of query inside property value
        var queryIndex = _item[_prop].toLowerCase().search(queryPattern);

        //If property contains query, add one point.
        if (queryIndex < 0) return 0;else score++;

        //If query is at the start of the string, add 5 points
        if (queryIndex === 0) score++;

        //Gets the percentage of the index compared to the property.length and subtracts that by 1 and adds that value to score
        var indexPercentage = 1 - queryIndex / _item[_prop].length;
        score += indexPercentage;

        //Gets the percentage of the query.length compared to the property.length and adds that to the score.
        var lengthPercentage = _query.length / _item[_prop].length;
        score += lengthPercentage;

        //If property is inside a high ranking property, add more points.
        highRankProperties.forEach(function (prop) {
          if (_prop.toLowerCase() === prop.toLowerCase()) score++;
          if (queryIndex === 0) score++; //Repeated.
        });

        //If property is a destination and has a sponsoredRating add percentage to score;
        if (_prop === 'sponsoredRating') score += _item[_prop] / 100;

        return score;
      }

      //Loop through all objects in array
      array.forEach(function (item) {
        var score = 0;
        for (var prop in item) {
          if (!item.hasOwnProperty(prop)) continue;
          if (typeof item[prop] != 'string') continue;

          //Get Score for entire query
          score += getPropertyScore(item, prop, query);

          //If query is multiple words, get score for each word.
          var splitQuery = query.split(' ');
          if (splitQuery.length > 1) {
            for (var i = 0; i < splitQuery.length; i++) {
              score += getPropertyScore(item, prop, splitQuery[i]);
            }
          }
        }
        if (score > 0) {
          doesMatch.push({
            score: score,
            item: item
          });
        }
      });

      //Sort matching objects by score.
      doesMatch.sort(function (a, b) {
        if (a.score > b.score) {
          return -1;
        }
        if (a.score < b.score) {
          return 1;
        }
        return 0;
      });

      //Add items until maxResults achieved.
      for (var m = 0; m < doesMatch.length; m++) {
        if (m === maxResults) break;
        results.push(doesMatch[m].item);
      }

      return results;
    }
  }]);

  return Utility;
}();

module.exports = Utility;

},{}],41:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AS_Edge = function AS_Edge(id, nodeIds, type, cost, acc, speed, direction) {
  _classCallCheck(this, AS_Edge);

  this.id = id;
  this.nodes = nodeIds;
  this.type = type;
  this.cost = cost;
  this.acc = acc;
  this.speed = speed;
  this.direction = direction;
};

module.exports = AS_Edge;

},{}],42:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AS_Node = require('./AS_Node.js');
var AS_Edge = require('./AS_Edge.js');

var AS_Grid = function () {
  function AS_Grid(waypoints, paths, pathTypes, maps) {
    _classCallCheck(this, AS_Grid);

    var settings = {
      verticalScale: 100
    };

    this.waypoints = waypoints;
    this.paths = paths;
    this.pathTypes = pathTypes;
    this.maps = maps;
    this.verticalScale = settings.verticalScale;
    this.moverTypes = [];
    this.nodes = [];
    this.edges = [];

    for (var i = 0; i < waypoints.length; i++) {
      var edges = this.generateEdges(waypoints[i].id);
      var neighbors = this.generateNeighbors(waypoints[i].id, edges);
      var node = new AS_Node(waypoints[i].id, waypoints[i].x, waypoints[i].y, this.getMapZValue(this.waypoints[i].mapId), this.waypoints[i].decisionPoint, this.waypoints[i].mapId, edges, neighbors);
      this.nodes.push(node);
    }

    for (var i = 0; i < this.pathTypes.length; i++) {
      if (this.pathTypes[i].pathTypeId != 1) {
        var pathTypeImg = '';
        if (this.pathTypes[i].pathtypeUri && this.pathTypes[i].pathtypeUri[0]) pathTypeImg = this.pathTypes[i].pathtypeUri[0].uri;
        var lObj = {
          moverId: this.pathTypes[i].pathTypeId,
          speed: this.pathTypes[i].speed,
          maxFloors: this.pathTypes[i].maxfloors,
          imagePath: pathTypeImg,
          accessiblity: this.pathTypes[i].accessibility,
          typeName: this.pathTypes[i].typeName
        };
        this.moverTypes.push(lObj);
      }
    }
  }

  _createClass(AS_Grid, [{
    key: 'getPathsWithWaypoint',
    value: function getPathsWithWaypoint(wpid) {
      var pathsReturn = [];
      for (var i = 0; i < this.paths.length; i++) {
        for (var j = 0; j < this.paths[i].waypoints.length; j++) {
          if (this.paths[i].waypoints[j] == wpid) {
            pathsReturn.push(this.paths[i]);
          }
        }
      }
      return pathsReturn;
    }
  }, {
    key: 'getPathTypeById',
    value: function getPathTypeById(pathTypeId) {
      for (var i = 0; i < this.pathTypes.length; i++) {
        if (this.pathTypes[i].pathTypeId == pathTypeId) {
          return this.pathTypes[i];
        }
      }
      return null;
    }
  }, {
    key: 'getWPById',
    value: function getWPById(wpid) {
      for (var i = 0; i < this.waypoints.length; i++) {
        if (this.waypoints[i].id == wpid) return this.waypoints[i];
      }
    }
  }, {
    key: 'generateEdges',
    value: function generateEdges(wpid) {
      var paths = this.getPathsWithWaypoint(wpid);
      var returnArray = [];
      for (var i = 0; i < paths.length; i++) {
        if (paths[i].status !== 0) {
          var pathType = this.getPathTypeById(paths[i].type);
          var edge = new AS_Edge(paths[i].id, paths[i].waypoints, paths[i].type, pathType.weight, pathType.accessibility, pathType.speed, paths[i].direction);
          returnArray.push(edge);
        }
      }
      return returnArray;
    }
  }, {
    key: 'generateNeighbors',
    value: function generateNeighbors(wpid, edges) {
      var neighbors = [];
      var srcWP = this.getWPById(wpid);
      var srcWPPos = {
        x: srcWP.x,
        y: srcWP.y,
        z: this.getMapZValue(srcWP.mapId)
      };
      for (var i = 0; i < edges.length; i++) {
        var currentEdge = edges[i];
        for (var j = 0; j < currentEdge.nodes.length; j++) {
          if (currentEdge.nodes[j] == wpid) continue;
          var currentWP = this.getWPById(currentEdge.nodes[j]);
          var wpStart = {
            x: currentWP.x,
            y: currentWP.y,
            z: this.getMapZValue(currentWP.mapId)
          };

          var distance = this.heuristic(wpStart, srcWPPos);

          var floorPref = 1;
          if (srcWPPos.z == wpStart.z) {
            floorPref = this.getFloorPreferenceMultiplier(currentWP.mapId);
          } else {

            if (currentEdge.direction !== 0) {
              if (currentEdge.direction == 1) {
                if (srcWPPos.z > wpStart.z) continue;
              } else if (currentEdge.direction == 2) {
                if (srcWPPos.z < wpStart.z) continue;
              }
            }
          }

          var totalCost = distance * currentEdge.cost * floorPref * (Math.abs(wpStart.z - srcWPPos.z) / currentEdge.speed + 1);

          var neighbor = {
            id: currentWP.id,
            cost: totalCost,
            acc: currentEdge.acc,
            edgeId: currentEdge.id,
            edgeTypeId: currentEdge.type,
            distance: distance,
            x: currentWP.x,
            y: currentWP.y,
            z: this.getMapZValue(currentWP.mapId)
          };
          neighbors.push(neighbor);
        }
      }
      return neighbors;
    }
  }, {
    key: 'getFloorPreferenceMultiplier',
    value: function getFloorPreferenceMultiplier(mapId) {
      var currentMultiplier = 1;
      if (this.maps) {
        for (var i = 0; i < this.maps.length; i++) {
          if (this.maps[i].mapId == mapId) {
            if (!this.maps[i].preference) break;
            if (this.maps[i].preference === 0) {
              currentMultiplier = 1;
            } else if (this.maps[i].preference > 0) {
              currentMultiplier = currentMultiplier / (this.maps[i].preference + 1);
            } else if (this.maps[i].preference < 0) {
              currentMultiplier = currentMultiplier * (Math.abs(this.maps[i].preference) + 1);
            }
            break;
          }
        }
      }
      return currentMultiplier;
    }
  }, {
    key: 'getMapZValue',
    value: function getMapZValue(mapId) {
      for (var i = 0; i < this.maps.length; i++) {
        if (this.maps[i].mapId == mapId) {
          return this.maps[i].floorSequence * this.verticalScale;
        }
      }
      return null;
    }
  }, {
    key: 'heuristic',
    value: function heuristic(start, end) {
      return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2) + Math.pow(start.z - end.z, 2));
    }
  }]);

  return AS_Grid;
}();

module.exports = AS_Grid;

},{"./AS_Edge.js":41,"./AS_Node.js":43}],43:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AS_Node = function AS_Node(id, x, y, z, decisionPoint, mapId, edges, neighbors) {
  _classCallCheck(this, AS_Node);

  this.id = id;
  this.x = x;
  this.y = y;
  this.z = z;
  this.decisionPoint = decisionPoint;
  this.mapId = mapId;
  this.edges = edges;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.visited = false;
  this.closed = false;
  this.parent = null;
  this.neighbors = neighbors;
  this.usedEdgeTypeId = null;
};

module.exports = AS_Node;

},{}],44:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinaryHeap = require('./BinaryHeap');
var AS_Grid = require('./AS_Grid');
var WayfinderData = require('./WayfinderData');

var AS_Search = function () {
  function AS_Search(waypoints, paths, pathTypes, maps) {
    _classCallCheck(this, AS_Search);

    this.grid = new AS_Grid(waypoints, paths, pathTypes, maps);
  }

  _createClass(AS_Search, [{
    key: 'search',
    value: function search(from, to, accessLevel) {
      this.cleanGrid();
      var start = this.getNodeById(from);
      var end = this.getNodeById(to);
      var openStartHeap = this.getHeap();

      start.h = 0;
      openStartHeap.push(start);

      while (openStartHeap.size() > 0) {
        var currentNode = openStartHeap.pop();

        if (currentNode === end) {
          return this.pathTo(currentNode, start);
        }

        currentNode.closed = true;

        var neighbors = this.getNeighbors(currentNode);

        for (var i = 0, il = neighbors.length; i < il; ++i) {
          var neighbor = neighbors[i];
          var neighborNode = this.getNeighborNodeObject(neighbor.id);

          if (neighbor.acc > accessLevel) {
            continue;
          }

          var heur = 0;

          if (neighborNode.closed) {
            continue;
          }

          var gScore = currentNode.g + this.getNeighborCost(neighbor);
          var beenVisited = neighborNode.visited;

          if (!beenVisited || gScore + heur < neighborNode.f) {
            neighborNode.visited = true;
            neighborNode.parent = currentNode;
            neighborNode.h = heur;
            neighborNode.g = gScore;
            neighborNode.f = neighborNode.g + heur;
            neighborNode.usedEdgeTypeId = neighbor.edgeTypeId;

            if (!beenVisited) {
              openStartHeap.push(neighborNode);
            } else {
              openStartHeap.rescoreElement(neighborNode);
            }
          }
        }
      }

      return [];
    }
  }, {
    key: 'cleanNode',
    value: function cleanNode(node) {
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.visited = false;
      node.closed = false;
      node.parent = null;
      node.usedEdgeTypeId = null;
    }
  }, {
    key: 'cleanGrid',
    value: function cleanGrid() {
      for (var i = 0; i < this.grid.nodes.length; i++) {
        this.cleanNode(this.grid.nodes[i]);
      }
    }
  }, {
    key: 'getNodeById',
    value: function getNodeById(id) {
      for (var i = 0; i < this.grid.nodes.length; i++) {
        if (id == this.grid.nodes[i].id) return this.grid.nodes[i];
      }
    }
  }, {
    key: 'getHeap',
    value: function getHeap() {
      return new BinaryHeap(function (node) {
        return node.f;
      });
    }
  }, {
    key: 'pathTo',
    value: function pathTo(node, start) {
      var curr = node,
          path = [];
      while (curr.parent) {
        path.push(curr);
        curr = curr.parent;
      }
      path.push(start);
      path = path.reverse();

      var floorArray = [];
      var currentFloor = [];
      var currentFloorId = -1;
      for (var i = 0; i < path.length; i++) {

        if (i === 0) {
          currentFloorId = path[i].mapId;
        }

        if (path[i].mapId != currentFloorId) {
          var pointSet = new WayfinderData({
            seq: path[i - 1].z / this.grid.verticalScale,
            mapId: currentFloorId,
            mover: this.getPathTypeById(path[i].usedEdgeTypeId),
            points: currentFloor.slice(0),
            cost: path[i].f
          });

          floorArray.push(pointSet);
          currentFloor = [];
          currentFloorId = path[i].mapId;
        }

        //NOTE: Using entire path object, it is needed for Textdirections.
        currentFloor.push(path[i]);

        if (i == path.length - 1) {

          var pointSet = new WayfinderData({
            seq: path[i].z / this.grid.verticalScale,
            mapId: currentFloorId,
            mover: this.getPathTypeById(path[i].usedEdgeTypeId),
            points: currentFloor,
            cost: path[i].f
          });

          floorArray.push(pointSet);
        }
      }
      return floorArray;
    }
  }, {
    key: 'getNeighbors',
    value: function getNeighbors(node) {
      return node.neighbors;
    }
  }, {
    key: 'getNeighborNodeObject',
    value: function getNeighborNodeObject(id) {
      for (var i = 0; i < this.grid.nodes.length; i++) {
        if (id == this.grid.nodes[i].id) return this.grid.nodes[i];
      }
    }
  }, {
    key: 'getNeighborCost',
    value: function getNeighborCost(neighbor) {
      return neighbor.cost;
    }
  }, {
    key: 'getPathTypeById',
    value: function getPathTypeById(typeId) {
      for (var i = 0; i < this.grid.moverTypes.length; i++) {
        if (this.grid.moverTypes[i].moverId == typeId) return this.grid.moverTypes[i];
      }
      return null;
    }
  }, {
    key: 'heuristic',
    value: function heuristic(start, end) {
      return Math.abs(start.x - end.x) + Math.abs(start.y - end.y) + Math.abs(start.z - end.z);
    }
  }]);

  return AS_Search;
}();

module.exports = AS_Search;

},{"./AS_Grid":42,"./BinaryHeap":45,"./WayfinderData":47}],45:[function(require,module,exports){
'use strict';
/* jshint -W016 */
//Ignore Binary Shifts

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinaryHeap = function () {
  function BinaryHeap(scoreFunction) {
    _classCallCheck(this, BinaryHeap);

    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  _createClass(BinaryHeap, [{
    key: 'push',
    value: function push(element) {
      // Add the new element to the end of the array.
      this.content.push(element);
      // Allow it to sink down.
      this.sinkDown(this.content.length - 1);
    }
  }, {
    key: 'pop',
    value: function pop() {
      // Store the first element so we can return it later.
      var result = this.content[0];
      // Get the element at the end of the array.
      var end = this.content.pop();
      // If there are any elements left, put the end element at the
      // start, and let it bubble up.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    }
  }, {
    key: 'remove',
    value: function remove(node) {
      var i = this.content.indexOf(node);

      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      if (i !== this.content.length - 1) {
        this.content[i] = end;
        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    }
  }, {
    key: 'size',
    value: function size() {
      return this.content.length;
    }
  }, {
    key: 'rescoreElement',
    value: function rescoreElement(node) {
      this.sinkDown(this.content.indexOf(node));
    }
  }, {
    key: 'sinkDown',
    value: function sinkDown(n) {
      // Fetch the element that has to be sunk.
      var element = this.content[n];

      // When at 0, an element can not sink any further.
      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        var parentN = (n + 1 >> 1) - 1,
            parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        }
        // Found a parent that is less, no need to sink any further.
        else {
            break;
          }
      }
    }
  }, {
    key: 'bubbleUp',
    value: function bubbleUp(n) {
      // Look up the target element and its score.
      var length = this.content.length,
          element = this.content[n],
          elemScore = this.scoreFunction(element);

      while (true) {
        // Compute the indices of the child elements.
        var child2N = n + 1 << 1,
            child1N = child2N - 1;
        // This is used to store the new position of the element, if any.
        var swap = null,
            child1Score = undefined;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);
          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore) {
            swap = child1N;
          }
        }

        // Do the same checks for the other child.
        if (child2N < length) {
          var child2 = this.content[child2N],
              child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }

        // Otherwise, we are done.
        else {
            break;
          }
      }
    }
  }]);

  return BinaryHeap;
}();

module.exports = BinaryHeap;

},{}],46:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AS_Search = require('./AS_Search');
var Waypoint = require('../models/Waypoint/Waypoint');

/** Class representing a Wayfinder object used to generate a path between two points*/

var Wayfinder = function () {

  /**
   * Create a new Wayfinder object
   * @param {object} data - AStar search data
   */

  function Wayfinder(jmap) {
    _classCallCheck(this, Wayfinder);

    var waypoints = jmap.MapCollection.getAllWaypoints();
    var paths = jmap.PathCollection.getAll();
    var pathTypes = jmap.PathTypeCollection.getAll();
    var maps = jmap.MapCollection.getAll();
    this._ = {
      astar: new AS_Search(waypoints, paths, pathTypes, maps)
    };
  }

  /**
   * Generate SVG path data from an array of waypoints
   * @param {Array/Waypoint} points - Array of waypoints
   * @return {String} svg Path elemnt d="" attribute
   */


  _createClass(Wayfinder, [{
    key: 'convertPointsToSVGPathData',
    value: function convertPointsToSVGPathData(points) {
      var str = '';
      var n = points.length;

      if (n < 2) {
        return null;
      }
      str += 'M ' + points[0].x + ' ' + points[0].y;
      for (var i = 1; i < n; i++) {
        str += ' L ' + points[i].x + ' ' + points[i].y;
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

  }, {
    key: 'search',
    value: function search(_from, _to, access) {
      var accessLevel = 100;
      if (access) accessLevel = 50;
      if (_from && _to && _from.constructor === Waypoint && _to.constructor === Waypoint) {
        return this._.astar.search(_from.id, _to.id, accessLevel);
      } else {
        throw new TypeError('Wayfinder :: First two arguments must be Waypoints');
      }
    }
  }]);

  return Wayfinder;
}();

module.exports = Wayfinder;

},{"../models/Waypoint/Waypoint":25,"./AS_Search":44}],47:[function(require,module,exports){
'use strict';

/** Class representing WayfinderData parsed from Wayfinder*/

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WayfinderData = function () {

  /**
   * Create a WayfinderData object
   * @param {object} data - AStar search data
   */

  function WayfinderData(data) {
    _classCallCheck(this, WayfinderData);

    this._ = {};
    this._.seq = data.seq;
    this._.mapId = data.mapId;
    this._.mover = data.mover;
    this._.points = data.points;
    this._.cost = data.cost;
  }

  _createClass(WayfinderData, [{
    key: 'get',
    value: function get(prop, _default) {
      return this._[prop] !== undefined ? this._[prop] : _default;
    }
  }, {
    key: 'set',
    value: function set(prop, value, constructor, _default) {
      if (value.constructor === constructor) {
        this._[prop] = value;
      } else {
        this._[prop] = _default;
      }
    }

    /**
     * @member {Number}   WayfinderData#seq
     */

  }, {
    key: 'seq',
    get: function get() {
      return this.get('seq', null);
    },
    set: function set(seq) {
      this.set('seq', seq, Number, null);
    }

    /**
     * @member {Number}   WayfinderData#mapId
     */

  }, {
    key: 'mapId',
    get: function get() {
      return this.get('mapId', null);
    },
    set: function set(mapId) {
      this.set('mapId', mapId, Number, null);
    }

    /**
     * @member {Object}   WayfinderData#mover
     */

  }, {
    key: 'mover',
    get: function get() {
      return this.get('mover', null);
    },
    set: function set(mover) {
      this.set('mover', mover, Object, null);
    }

    /**
     * @member {Array}   WayfinderData#points
     */

  }, {
    key: 'points',
    get: function get() {
      return this.get('points', []);
    },
    set: function set(points) {
      this.set('points', points, Array, []);
    }

    /**
     * @member {Number}   WayfinderData#cost
     */

  }, {
    key: 'cost',
    get: function get() {
      return this.get('cost', null);
    }

    /**
     * @member {Number}   WayfinderData#entityId
     */
    ,
    set: function set(cost) {
      this.set('cost', cost, Number, null);
    }
  }]);

  return WayfinderData;
}();

module.exports = WayfinderData;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvam1hcC9ib290LmpzIiwiZGV2L2ptYXAvam1hcC5qcyIsImRldi9tb2RlbHMvQW1lbml0eS9BbWVuaXR5LmpzIiwiZGV2L21vZGVscy9BbWVuaXR5L0FtZW5pdHlDb2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9Bc3NvY2lhdGlvbi9Bc3NvY2lhdGlvbi5qcyIsImRldi9tb2RlbHMvQXNzb2NpYXRpb24vQXNzb2NpYXRpb25Db2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9DYXRlZ29yeS9DYXRlZ29yeS5qcyIsImRldi9tb2RlbHMvQ2F0ZWdvcnkvQ2F0ZWdvcnlDb2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9EZXN0aW5hdGlvbi9EZXN0aW5hdGlvbi5qcyIsImRldi9tb2RlbHMvRGVzdGluYXRpb24vRGVzdGluYXRpb25Db2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9EZXN0aW5hdGlvbkxhYmVsL0Rlc3RpbmF0aW9uTGFiZWwuanMiLCJkZXYvbW9kZWxzL0Rlc3RpbmF0aW9uTGFiZWwvRGVzdGluYXRpb25MYWJlbENvbGxlY3Rpb24uanMiLCJkZXYvbW9kZWxzL0RldmljZS9EZXZpY2UuanMiLCJkZXYvbW9kZWxzL0RldmljZS9EZXZpY2VDb2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9FdmVudC9FdmVudENvbGxlY3Rpb24uanMiLCJkZXYvbW9kZWxzL0xvY2F0aW9uL0xvY2F0aW9uLmpzIiwiZGV2L21vZGVscy9NYXAvTWFwLmpzIiwiZGV2L21vZGVscy9NYXAvTWFwQ29sbGVjdGlvbi5qcyIsImRldi9tb2RlbHMvTWFwTGFiZWwvTWFwTGFiZWwuanMiLCJkZXYvbW9kZWxzL01hcExhYmVsL01hcExhYmVsQ29sbGVjdGlvbi5qcyIsImRldi9tb2RlbHMvUGF0aC9QYXRoLmpzIiwiZGV2L21vZGVscy9QYXRoL1BhdGhDb2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9QYXRoVHlwZS9QYXRoVHlwZS5qcyIsImRldi9tb2RlbHMvUGF0aFR5cGUvUGF0aFR5cGVDb2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9XYXlwb2ludC9XYXlwb2ludC5qcyIsImRldi9tb2RlbHMvV2F5cG9pbnQvV2F5cG9pbnRDb2xsZWN0aW9uLmpzIiwiZGV2L21vZGVscy9ab25lL1pvbmUuanMiLCJkZXYvbW9kZWxzL1pvbmUvWm9uZUNvbGxlY3Rpb24uanMiLCJkZXYvdGV4dC1kaXJlY3Rpb25zL0luc3RydWN0aW9uLmpzIiwiZGV2L3RleHQtZGlyZWN0aW9ucy9UZXh0RGlyZWN0aW9ucy5qcyIsImRldi90ZXh0LWRpcmVjdGlvbnMvZmlsdGVyL2NvbWJvLWRpcmVjdGlvbnMuanMiLCJkZXYvdGV4dC1kaXJlY3Rpb25zL2ZpbHRlci9jb25zZWN1dGl2ZS1mb3J3YXJkcy5qcyIsImRldi90ZXh0LWRpcmVjdGlvbnMvZmlsdGVyL2NvbnRpbnVlLXBhc3QuanMiLCJkZXYvdGV4dC1kaXJlY3Rpb25zL2ZpbHRlci9lbmQtYXMtbGFuZG1hcmsuanMiLCJkZXYvdGV4dC1kaXJlY3Rpb25zL2ZpbHRlci9zdGFydC1hcy1sYW5kbWFyay5qcyIsImRldi90ZXh0LWRpcmVjdGlvbnMvZmlsdGVyL3V0dXJuLmpzIiwiZGV2L3RleHQtZGlyZWN0aW9ucy9oZWxwZXJzLmpzIiwiZGV2L3RleHQtZGlyZWN0aW9ucy9saW5lT2ZTaWdodC5qcyIsImRldi90ZXh0LWRpcmVjdGlvbnMvbWFrZVRleHREaXJlY3Rpb25zLmpzIiwiZGV2L3V0aWxpdHkvVXRpbGl0eS5qcyIsImRldi93YXlmaW5kaW5nL0FTX0VkZ2UuanMiLCJkZXYvd2F5ZmluZGluZy9BU19HcmlkLmpzIiwiZGV2L3dheWZpbmRpbmcvQVNfTm9kZS5qcyIsImRldi93YXlmaW5kaW5nL0FTX1NlYXJjaC5qcyIsImRldi93YXlmaW5kaW5nL0JpbmFyeUhlYXAuanMiLCJkZXYvd2F5ZmluZGluZy9XYXlmaW5kZXIuanMi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Q2YsV0FBSyxHQUFMLENBQVMsT0FBVCxFQUFrQixLQUFsQixFQUF5QixNQUF6QixFQUFpQyxJQUFqQyxFQURlOzs7Ozs7Ozs7d0JBT0w7QUFDVixhQUFPLEtBQUssR0FBTCxDQUFTLE9BQVQsRUFBa0IsSUFBbEIsQ0FBUCxDQURVOztzQkFHRixPQUFPO0FBQ2YsV0FBSyxHQUFMLENBQVMsT0FBVCxFQUFrQixLQUFsQixFQUF5QixNQUF6QixFQUFpQyxJQUFqQyxFQURlOzs7Ozs7Ozs7d0JBT0o7QUFDWCxhQUFPLEtBQUssR0FBTCxDQUFTLFFBQVQsRUFBbUIsRUFBbkIsQ0FBUCxDQURXOztzQkFHRixRQUFRO0FBQ2pCLFdBQUssR0FBTCxDQUFTLFFBQVQsRUFBbUIsTUFBbkIsRUFBMkIsS0FBM0IsRUFBa0MsRUFBbEMsRUFEaUI7Ozs7Ozs7Ozt3QkFPUjtBQUNULGFBQU8sS0FBSyxHQUFMLENBQVMsTUFBVCxFQUFpQixJQUFqQixDQUFQLENBRFM7Ozs7Ozs7c0JBT0YsTUFBTTtBQUNiLFdBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFBdUIsTUFBdkIsRUFBK0IsSUFBL0IsRUFEYTs7OztTQTdFWDs7O0FBa0ZOLE9BQU8sT0FBUCxHQUFpQixhQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcbi8vTm8gY29sbGVjdGlvblxuY29uc3QgTG9jYXRpb24gPSByZXF1aXJlKCcuLi9tb2RlbHMvTG9jYXRpb24vTG9jYXRpb24nKVxuXG5jbGFzcyBCb290IHtcbiAgY29uc3RydWN0b3Ioam1hcCwgb3B0cykge1xuICAgICAgdGhpcy5qbWFwID0gam1hcFxuXG4gICAgICAvL1NldCByZXF1ZXN0IGJhc2VkIG9uIHdoYXQgaXMgcGFzc2VkLiBBTExPV1MgRk9SIE5PREUgZW52aXJvbm1lbnRcbiAgICAgIGlmKG9wdHMucmVxdWVzdCkgdGhpcy5yZXF1ZXN0ID0gb3B0cy5yZXF1ZXN0XG4gICAgICBlbHNlIHRoaXMucmVxdWVzdCA9IHRoaXMuZ2V0UmVxdWVzdDtcblxuICAgICAgaWYob3B0cy5ET01QYXJzZXIpIHRoaXMueG1sUGFyc2VyID0gb3B0cy5ET01QYXJzZXJcbiAgICAgIGVsc2UgdGhpcy54bWxQYXJzZXIgPSB0aGlzLmdldFhNTFBhcnNlcigpXG4gICAgfVxuICAgIC8qXG4gICAgICBQYXJzZXMgdGhlIC9mdWxsIGNhbGwgaW50byBwcm9wZXJseSBkZWZpbmVkL3R5cGVkIG9iamVjdHNcbiAgICAqL1xuICBwYXJzZVJlc3BvbnNlKHJlc3BvbnNlKSB7XG4gICAgLy9DcmVhdGUgbG9jYXRpb24gb2JqZWN0XG4gICAgdGhpcy5qbWFwLmxvY2F0aW9uID0gbmV3IExvY2F0aW9uKHJlc3BvbnNlLmxvY2F0aW9uKVxuXG4gICAgLy9CZWZvcmUgY3JlYXRpbmcgYWxsIGFtZW5pdGllcyAmIHBhdGh0eXBlcywgYWRkIFNWRyBwcm9wZXJ0eSB0byBvYmplY3QgbW9kZWxcbiAgICAvLyB0aGlzLmV4dHJhY3RBbmRTZXRTdmdGcm9tKHJlc3BvbnNlLmFtZW5pdGllcykudGhlbih0aGlzLmptYXAuQW1lbml0eUNvbGxlY3Rpb24uY3JlYXRlKS8vLmJpbmQodGhpcylcbiAgICB0aGlzLmptYXAuQW1lbml0eUNvbGxlY3Rpb24uY3JlYXRlKHJlc3BvbnNlLmFtZW5pdGllcylcbiAgICB0aGlzLmptYXAuUGF0aFR5cGVDb2xsZWN0aW9uLmNyZWF0ZShyZXNwb25zZS5wYXRoVHlwZXMpXG5cbiAgICAvL1N0cmFpZ2h0IGZvcndhcmQgY3JlYXRpb25cbiAgICB0aGlzLmptYXAuQ2F0ZWdvcnlDb2xsZWN0aW9uLmNyZWF0ZShyZXNwb25zZS5jYXRlZ29yaWVzKVxuICAgIHRoaXMuam1hcC5EZXN0aW5hdGlvbkNvbGxlY3Rpb24uY3JlYXRlKHJlc3BvbnNlLmRlc3RpbmF0aW9ucylcbiAgICB0aGlzLmptYXAuRGV2aWNlQ29sbGVjdGlvbi5jcmVhdGUocmVzcG9uc2UuZGV2aWNlcylcbiAgICAgIC8vIHRoaXMuam1hcC5FdmVudC5jcmVhdGUocmVzcG9uc2UuZXZlbnRzKVxuICAgIHRoaXMuam1hcC5NYXBDb2xsZWN0aW9uLmNyZWF0ZShyZXNwb25zZS5tYXBzKVxuICAgIHRoaXMuam1hcC5QYXRoQ29sbGVjdGlvbi5jcmVhdGUocmVzcG9uc2UucGF0aHMpXG4gICAgdGhpcy5qbWFwLlpvbmVDb2xsZWN0aW9uLmNyZWF0ZShyZXNwb25zZS56b25lcylcblxuICAgIHJldHVybiB0aGlzLmF0dGFjaFdheXBvaW50c1RvQ29sbGVjdGlvbnMoKVxuICB9XG5cbiAgZXh0cmFjdEFuZFNldFN2Z0Zyb20oaXRlbXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuICAgICAgLy9NYXAgUHJvbWlzZVxuICAgICAgbGV0IHN2Z3MgPSBpdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlSXRlbSkgPT4ge1xuICAgICAgICAgIGxldCBmaWxlUGF0aCA9IG51bGxcbiAgICAgICAgICAgIC8vSXRlbSBpcyBhbWVuaXR5IG9yIHBhdGhUeXBlXG4gICAgICAgICAgaWYoaXRlbS5iZWFuKSB7XG4gICAgICAgICAgICBmaWxlUGF0aCA9IGl0ZW0uYmVhbi5maWxlUGF0aFxuICAgICAgICAgIH0gZWxzZSBpZihpdGVtLnBhdGh0eXBlVXJpKSB7XG4gICAgICAgICAgICBmaWxlUGF0aCA9IGl0ZW0ucGF0aHR5cGVVcmlbMF0gPyBpdGVtLnBhdGh0eXBlVXJpWzBdLmZpbGVQYXRoIDogbnVsbFxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZpbGVQYXRoKVxuXG4gICAgICAgICAgaWYoIWZpbGVQYXRoKSB7XG4gICAgICAgICAgICByZXNvbHZlSXRlbShpdGVtKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL0dldCBmaWxlcGF0aFxuICAgICAgICAgICAgcmVzb2x2ZUl0ZW0oaXRlbSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBQcm9taXNlLmFsbChzdmdzKS50aGVuKHJlc29sdmUpXG4gICAgfSlcbiAgfVxuXG4gIC8qXG4gICAgSXRlcmF0ZXMgd2F5cG9pbnRzIGFucyBhZGRzIHRoZW0gdG8gY29sbGVjdGlvbnMgYmFzZWQgb24gYXNzb2NpYXRpb25cbiAgKi9cbiAgYXR0YWNoV2F5cG9pbnRzVG9Db2xsZWN0aW9ucygpIHtcbiAgICAvL0VudGl0eSB0eXBlIGlkc1xuICAgIGxldCBkZXN0aW5hdGlvbkVudGl0aXlUeXBlID0gMTtcbiAgICBsZXQgZGV2aWNlRW50aXR5VHlwZSA9IDI7XG4gICAgbGV0IGFtZW5pdHlFbnRpdHlUeXBlID0gMjY7XG4gICAgbGV0IGV2ZW50RW50aXR5VHlwZSA9IDE5O1xuXG4gICAgLy9JdGVyYXRlIHRob3VnaCBhbGwgd2F5cGludHMgJiBhc3NvY2lhdGlvbnNcbiAgICBsZXQgd2F5cG9pbnRzID0gdGhpcy5qbWFwLk1hcENvbGxlY3Rpb24uZ2V0QWxsV2F5cG9pbnRzKClcbiAgICB3YXlwb2ludHMuZm9yRWFjaCgod2F5cG9pbnQpID0+IHtcbiAgICAgIGxldCBhc3NvY2lhdGlvbnMgPSB3YXlwb2ludC5Bc3NvY2lhdGlvbkNvbGxlY3Rpb24uZ2V0QWxsKClcbiAgICAgIGFzc29jaWF0aW9ucy5mb3JFYWNoKChhc3NvY2lhdGlvbikgPT4ge1xuXG4gICAgICAgIC8vRmlndXJlIG91dCB3aGF0IGNvbGxlY3Rpb24gaXRlbSB0byBhdHRhY2ggd2F5cG9pbnQgdG9cbiAgICAgICAgbGV0IGl0ZW0gPSBudWxsXG4gICAgICAgIHN3aXRjaChhc3NvY2lhdGlvbi5lbnRpdHlUeXBlSWQpIHtcbiAgICAgICAgICBjYXNlIGRlc3RpbmF0aW9uRW50aXRpeVR5cGU6XG4gICAgICAgICAgICBpdGVtID0gdGhpcy5qbWFwLkRlc3RpbmF0aW9uQ29sbGVjdGlvbi5nZXRCeUlkKGFzc29jaWF0aW9uLmVudGl0eUlkKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIGRldmljZUVudGl0eVR5cGU6XG4gICAgICAgICAgICBpdGVtID0gdGhpcy5qbWFwLkRldmljZUNvbGxlY3Rpb24uZ2V0QnlJZChhc3NvY2lhdGlvbi5lbnRpdHlJZClcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgYW1lbml0eUVudGl0eVR5cGU6XG4gICAgICAgICAgICBpdGVtID0gdGhpcy5qbWFwLkFtZW5pdHlDb2xsZWN0aW9uLmdldEJ5Q29tcG9uZW50SWQoYXNzb2NpYXRpb24uZW50aXR5SWQpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGV2ZW50RW50aXR5VHlwZTpcbiAgICAgICAgICAgIC8vVE9ET1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZihpdGVtKSB7XG4gICAgICAgICAgaWYoaXRlbS53YXlwb2ludHMuaW5kZXhPZih3YXlwb2ludCkgPT09IC0xKSB7XG4gICAgICAgICAgICBpdGVtLndheXBvaW50cy5wdXNoKHdheXBvaW50KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKlxuICAgIFZhbGlkYXRlcyBvcHRpb25zIG9iamVjdCBwYXNzZWQgaW50byBqbWFwXG4gICovXG4gIHZhbGlkYXRlT3B0aW9ucyhvcHRzKSB7XG4gICAgdHJ5IHtcbiAgICAgIG9wdHMuc2VydmVyID0gdGhpcy52YWxpZGF0ZVByb3BlcnR5KCdzZXJ2ZXInLCBvcHRzLnNlcnZlciwgU3RyaW5nLCBudWxsLCB0cnVlKVxuICAgICAgb3B0cy5sb2NhdGlvbklkID0gdGhpcy52YWxpZGF0ZVByb3BlcnR5KCdsb2NhdGlvbklkJywgb3B0cy5sb2NhdGlvbklkLCBOdW1iZXIsIG51bGwsIHRydWUpXG4gICAgICByZXR1cm4gb3B0c1xuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIHJldHVybiBlcnJvclxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAgVmFsaWRhdGVzIGluZGl2aWR1YWwgb2JqZWN0XG4gICovXG4gIHZhbGlkYXRlUHJvcGVydHkocHJvcCwgdmFsdWUsIGV4cGVjdGF0aW9uLCBfZGVmYXVsdCwgcmVxdWlyZWQpIHtcbiAgICBsZXQgZXJyID0gbmV3IFR5cGVFcnJvcigpO1xuICAgIC8vSWYgdmFsdWUgaXMgZ2l2ZW5cbiAgICBpZih2YWx1ZSkge1xuICAgICAgLy9JZiBjb25zdHJ1Y3RvciBpcyBub3Qgd2hhdCBpcyBleHBlY3RlZFxuICAgICAgaWYodmFsdWUuY29uc3RydWN0b3IgIT09IGV4cGVjdGF0aW9uKSB7XG4gICAgICAgIC8vSWYgdGhlcmUgaXMgYSBkZWZhdWx0IGFuZCBpdCBpcyBub3QgcmVxdWlyZWRcbiAgICAgICAgaWYoX2RlZmF1bHQgJiYgIXJlcXVpcmVkKSB7XG4gICAgICAgICAgcmV0dXJuIF9kZWZhdWx0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXJyLm1lc3NhZ2UgPSAnSW52YWxpZDogQ2Fubm90IHVzZSAnICsgdmFsdWUgKyAnIGFzICcgKyBwcm9wXG4gICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnIubWVzc2FnZSA9ICdJbnZhbGlkOiBDYW5ub3QgdXNlICcgKyB2YWx1ZSArICcgYXMgJyArIHByb3BcbiAgICAgIHRocm93IGVyclxuICAgIH1cblxuICB9XG5cbiAgLypcbiAgICBSZXR1cm5zIGZvcm1hdHRlZCAvZnVsbCBjYWxsIGJhc2VkIG9uIGptYXAgb3B0aW9uc1xuICAqL1xuICBnZW5lcmF0ZUFwaShvcHRzKSB7XG4gICAgcmV0dXJuIG9wdHMuc2VydmVyICsgJy92My9sb2NhdGlvbi8nICsgb3B0cy5sb2NhdGlvbklkICsgJy9mdWxsJ1xuICB9XG5cbiAgLypcbiAgICBSZXF1ZXN0IG1ldGhvZCB1c2VkIGluc2lkZSBET01cbiAgKi9cbiAgZ2V0UmVxdWVzdChvcHRzLCBjYikge1xuICAgIGxldCB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub3BlbignR0VUJywgb3B0cy51cmwsIHRydWUpO1xuXG4gICAgZm9yKHZhciBoZWFkZXIgaW4gb3B0cy5oZWFkZXJzKSB7XG4gICAgICBpZihvcHRzLmhlYWRlcnMuaGFzT3duUHJvcGVydHkoaGVhZGVyKSkge1xuICAgICAgICB4aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgb3B0cy5oZWFkZXJzW2hlYWRlcl0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZih4aHR0cC5yZWFkeVN0YXRlID09IDQgJiYgeGh0dHAuc3RhdHVzID09IDIwMCkge1xuICAgICAgICBpZih4aHR0cC5zdGF0dXMgPT09IDIwMCkgY2IobnVsbCwgeGh0dHAsIHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgZWxzZSBjYignU3RhdHVzIGNvZGU6ICcgKyB4aHR0cC5zdGF0dXMsIHhodHRwLCB4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgeGh0dHAuc2VuZCgpXG4gIH1cblxuICBnZXRYTUxQYXJzZXIoKSB7XG4gICAgbGV0IHBhcnNlclxuICAgIHRyeSB7XG4gICAgICBwYXJzZXIgPSB3aW5kb3cuRE9NUGFyc2VyXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBwYXJzZXIgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiBwYXJzZXJcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vdFxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8vQm9vdCBtZXRob2RzXG5jb25zdCBCb290ID0gcmVxdWlyZSgnLi9ib290JylcblxuLy9tb2RlbHNcbmNvbnN0IFdheXBvaW50ID0gcmVxdWlyZSgnLi4vbW9kZWxzL1dheXBvaW50L1dheXBvaW50JylcblxuLy9Db2xsZWN0aW9uc1xuY29uc3QgQW1lbml0eUNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9tb2RlbHMvQW1lbml0eS9BbWVuaXR5Q29sbGVjdGlvbicpXG5jb25zdCBDYXRlZ29yeUNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9tb2RlbHMvQ2F0ZWdvcnkvQ2F0ZWdvcnlDb2xsZWN0aW9uJylcbmNvbnN0IERlc3RpbmF0aW9uQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL21vZGVscy9EZXN0aW5hdGlvbi9EZXN0aW5hdGlvbkNvbGxlY3Rpb24nKVxuY29uc3QgRGV2aWNlQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL21vZGVscy9EZXZpY2UvRGV2aWNlQ29sbGVjdGlvbicpXG5jb25zdCBFdmVudENvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9tb2RlbHMvRXZlbnQvRXZlbnRDb2xsZWN0aW9uJylcbmNvbnN0IE1hcENvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9tb2RlbHMvTWFwL01hcENvbGxlY3Rpb24nKVxuY29uc3QgUGF0aENvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9tb2RlbHMvUGF0aC9QYXRoQ29sbGVjdGlvbicpXG5jb25zdCBQYXRoVHlwZUNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9tb2RlbHMvUGF0aFR5cGUvUGF0aFR5cGVDb2xsZWN0aW9uJylcbmNvbnN0IFpvbmVDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vbW9kZWxzL1pvbmUvWm9uZUNvbGxlY3Rpb24nKVxuXG4vL1dheWZpbmRpbmdcbmNvbnN0IFdheWZpbmRlciA9IHJlcXVpcmUoJy4uL3dheWZpbmRpbmcvV2F5ZmluZGVyJylcbmNvbnN0IFRleHREaXJlY3Rpb25zID0gcmVxdWlyZSgnLi4vdGV4dC1kaXJlY3Rpb25zL1RleHREaXJlY3Rpb25zJylcbmNvbnN0IFV0aWxpdHkgPSByZXF1aXJlKCcuLi91dGlsaXR5L1V0aWxpdHknKVxuXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIGluc3RhbmNlIEpNYXAuIFRoaXMgaXMgdGhlIG1haW4gY2xhc3NlcyB3aGVyZSBhbGwgeW91ciBjb2xsZWN0aW9ucyB3aWxsIGJlIGhlbGQuKi9cbmNsYXNzIEpNYXAge1xuXG4gIC8qKlxuICAgKiBPcHRpb25zIG9iamVjdCwgaG9sZGluZyBhbGwgdGhlIGRhdGEgbmVlZGVkIHRvIGNvbnN0cnVjdCBKTWFwXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEpNYXBPcHRpb25zXG4gICAqIEBleGFtcGxlXG4gICAqe1xuICAgKiAgc2VydmVyOiAnaHR0cHM6Ly9tYXBzLndlc3RmaWVsZC5pbycsXG4gICAqICBoZWFkZXJzOiB7XG4gICAqICAgICd4LWxjb2RlJzogJ2VuJyxcbiAgICogICAgJ3gtanNhcGlfdXNlcic6ICd1c2VyJyxcbiAgICogICAgJ3gtanNhcGlfcGFzc2NvZGUnOiAncGFzcycsXG4gICAqICAgICd4LWpzYXBpX2tleSc6ICdrZXknLFxuICAgKiAgfVxuICAgKiAgbG9jYXRpb25JZDogMjYzLFxuICAgKiAgb25SZWFkeTogZnVuY3Rpb24oZXJyKXtcbiAgICogICAgaWYoZXJyKSB0aHJvdyBlcnJcbiAgICogIH1cbiAgICp9XG4gICAqXG4gICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBzZXJ2ZXIgLSBVcmwgb2YgSmliZXN0cmVhbSBVWE0gKGV4LiBcImh0dHA6Ly9kZXZlbG9wZXIuanMtbmV0d29yay5jb1wiKVxuICAgKiBAcHJvcGVydHkge09iamVjdH0gaGVhZGVycyAtIHtcIm5hbWVcIjpcInZhbHVlXCJ9IHNldCBmb3IgZWFjaCBIZWFkZXIsIHVzZWQgZm9yIEFQSSBhdXRoZW50aWNhdGlvblxuICAgKiBAcHJvcGVydHkge051bWJlcn0gbG9jYXRpb25JZCAtIExvY2F0aW9uIElkIHJlZmVyZW5jaW5nIGEgbG9jYXRpb24uXG4gICAqIEBwcm9wZXJ0eSB7TW9kdWxlfSByZXF1ZXN0IC0gTm9kZS5qcyBvbmx5OiBOUE0gbW9kdWxlIGZvciBtYWtpbmcgaHR0cCByZXF1ZXN0cyAoaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcmVxdWVzdClcbiAgICogQHByb3BlcnR5IHtNb2R1bGV9IERPTVBhcnNlciAtIE5vZGUuanMgb25seTogTlBNIG1vZHVsZSBmb3IgcGFyc2luZyBTVkcgWE1MIHRvIHVzZSBMQm94ZXMgaW4gVGV4dERpcmVjdGlvbnMgKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3htbGRvbSlcbiAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gb25SZWFkeShlcnJvcikgLSBDYWxsYmFjayBmdW5jdGlvbiBleGVjdXRlZCBvbmNlIGFsbCBkYXRhIGlzIHB1bGxlZCAmIHBhcnNlZCBhbmQgdGhlIGNyZWF0ZWQgaW5zdGFuY2Ugb2YgSk1hcCBpcyByZWFkeSB0byB1c2VcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBKTWFwIG9iamVjdFxuICAgKiBAcGFyYW0ge0pNYXBPcHRpb25zfSBvcHRzIC0gT3B0aW9ucyBvYmplY3QsIGhvbGRpbmcgYWxsIHRoZSBkYXRhIG5lZWRlZCB0byBjb25zdHJ1Y3QgSk1hcFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHRoaXMuYm9vdCA9IG5ldyBCb290KHRoaXMsIG9wdHMpXG5cbiAgICAvL1BhcnNlIG9wdGlvbnMgYW5kIGNoZWNrIGZvciByZXR1cm5lZCBlcnJvclxuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMuYm9vdC52YWxpZGF0ZU9wdGlvbnMob3B0cylcbiAgICBpZih0aGlzLm9wdGlvbnMuY29uc3RydWN0b3IgPT09IFR5cGVFcnJvcikge1xuICAgICAgb3B0cy5vblJlYWR5KHRoaXMub3B0aW9ucylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMucmVzcG9uc2UgPSB7XG4gICAgICB1cmw6IHRoaXMuYm9vdC5nZW5lcmF0ZUFwaSh0aGlzLm9wdGlvbnMpLFxuICAgICAgaGVhZGVyczogdGhpcy5vcHRpb25zLmhlYWRlcnNcbiAgICB9XG5cbiAgICBsZXQgcmVxdWVzdCA9IHRoaXMuYm9vdC5yZXF1ZXN0XG4gICAgbGV0IHhtbFBhcnNlciA9IHRoaXMuYm9vdC54bWxQYXJzZXJcblxuICAgIHRoaXMuQW1lbml0eUNvbGxlY3Rpb24gPSBuZXcgQW1lbml0eUNvbGxlY3Rpb24oeG1sUGFyc2VyKVxuICAgIHRoaXMuQ2F0ZWdvcnlDb2xsZWN0aW9uID0gbmV3IENhdGVnb3J5Q29sbGVjdGlvbigpXG4gICAgdGhpcy5EZXN0aW5hdGlvbkNvbGxlY3Rpb24gPSBuZXcgRGVzdGluYXRpb25Db2xsZWN0aW9uKClcbiAgICB0aGlzLkRldmljZUNvbGxlY3Rpb24gPSBuZXcgRGV2aWNlQ29sbGVjdGlvbigpXG4gICAgdGhpcy5FdmVudENvbGxlY3Rpb24gPSBFdmVudENvbGxlY3Rpb25cbiAgICB0aGlzLk1hcENvbGxlY3Rpb24gPSBuZXcgTWFwQ29sbGVjdGlvbih4bWxQYXJzZXIpXG4gICAgdGhpcy5QYXRoQ29sbGVjdGlvbiA9IG5ldyBQYXRoQ29sbGVjdGlvbigpXG4gICAgdGhpcy5QYXRoVHlwZUNvbGxlY3Rpb24gPSBuZXcgUGF0aFR5cGVDb2xsZWN0aW9uKClcbiAgICB0aGlzLlpvbmVDb2xsZWN0aW9uID0gbmV3IFpvbmVDb2xsZWN0aW9uKClcblxuICAgIC8vR2VuZXJhdGUgbW9kZWxcblxuICAgIHJlcXVlc3QodGhpcy5yZXNwb25zZSwgKGVyLCByZXNwb25zZSwgYm9keSkgPT4ge1xuICAgICAgaWYoIWVyKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2UucmVzcG9uc2UgPSByZXNwb25zZVxuICAgICAgICB0aGlzLnJlc3BvbnNlLmJvZHkgPSBKU09OLnBhcnNlKGJvZHkpXG5cbiAgICAgICAgLy9CdWlsZCBvdXQgbW9kZWwgdGhpcyBpcyB3aGVyZSBhbGwgY29sbGVjdGlvbiBjbGFzc2VzIGFyZSB1c2VkIHRvIGNyZWF0ZSBpdGVtc1xuICAgICAgICB0aGlzLmJvb3QucGFyc2VSZXNwb25zZSh0aGlzLnJlc3BvbnNlLmJvZHkpXG5cbiAgICAgICAgLy9DcmVhdGUgd2F5ZmluZGluZyBjbGFzc2VzXG4gICAgICAgIHRoaXMuV2F5ZmluZGVyID0gbmV3IFdheWZpbmRlcih0aGlzKVxuICAgICAgICB0aGlzLlRleHREaXJlY3Rpb25zID0gbmV3IFRleHREaXJlY3Rpb25zKHRoaXMpXG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpXG4gICAgICB9XG5cbiAgICAgIGlmKG9wdHMub25SZWFkeSAmJiBvcHRzLm9uUmVhZHkuY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uKSB7XG4gICAgICAgIG9wdHMub25SZWFkeShlcilcbiAgICAgIH1cblxuICAgIH0pXG5cbiAgICAvL0FkZCB0byBpdGVtcyBhcnJheVxuICAgIEpNYXAuX2l0ZW1zLnB1c2godGhpcylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjbG9zZXN0IHdheXBvaW50IGluc2lkZSBvZiBzcGVjaWZpZWQgYXJyYXkgdG8gdGhlIHdheXBvaW50IGluIHRoZSBzZWNvbmQgYXJndW1lbnRcbiAgICogQHBhcmFtIHtBcnJheS9XYXlwb2ludH0gYXJyYXkgLSBBcnJheSBvZiB3YXlwb2ludHMgdG8gc2VhcmNoIHRocm91Z2hcbiAgICogQHBhcmFtIHtXYXlwb2ludH0gd2F5cG9pbnQgLSBXYXlwb2ludCB0byBjb21wYXIgcGF0aHMgYWdhaW5zdFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGVsZXZhdG9yIC0gRm9yY2UgZWxldmF0b3IgcGF0aFxuICAgKiBAcmV0dXJuIHtXYXlwb2ludH0gLSBDbG9zZXN0IHdheXBvaW50IGluc29kZSBhcnJheVxuICAgKi9cbiAgZ2V0Q2xvc2VzdFdheXBvaW50SW5BcnJheVRvV2F5cG9pbnQoYXJyYXksIHdheXBvaW50LCBlbGV2YXRvcikge1xuICAgIGxldCBjbG9zZXN0ID0ge307XG4gICAgaWYoIWFycmF5IHx8ICFhcnJheS5sZW5ndGggfHwgIXdheXBvaW50IHx8IHdheXBvaW50LmNvbnN0cnVjdG9yICE9PSBXYXlwb2ludCkgcmV0dXJuIG51bGw7XG4gICAgZm9yKGxldCBqID0gMDsgaiA8IGFycmF5Lmxlbmd0aDsgaisrKSB7XG4gICAgICBsZXQgd3AgPSBhcnJheVtqXTtcbiAgICAgIGlmKHdwLmNvbnN0cnVjdG9yICE9PSBXYXlwb2ludCkgY29udGludWU7XG4gICAgICBpZih3YXlwb2ludC5pZCA9PT0gd3AuaWQpIGNvbnRpbnVlO1xuICAgICAgbGV0IHBhdGggPSB0aGlzLldheWZpbmRlci5zZWFyY2god2F5cG9pbnQsIHdwLCBlbGV2YXRvcik7XG4gICAgICBsZXQgY3VycmVudENvc3Q7XG4gICAgICBpZihwYXRoW3BhdGgubGVuZ3RoIC0gMV0pIGN1cnJlbnRDb3N0ID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdLmNvc3Q7XG4gICAgICBpZighY2xvc2VzdC5jb3N0IHx8IGNsb3Nlc3QuY29zdCA+IGN1cnJlbnRDb3N0KSB7XG4gICAgICAgIGNsb3Nlc3QuY29zdCA9IGN1cnJlbnRDb3N0O1xuICAgICAgICBjbG9zZXN0LndwID0gd3A7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbG9zZXN0LndwIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2xvc2VzdCBkZXN0aW5hdGlvbiB0byB0aGUgc3BlY2lmaWVkIHdheXBvaW50XG4gICAqIEBwYXJhbSB7V2F5cG9pbnR9IHdheXBvaW50IC0gV2F5cG9pbnQgdG8gY29tcGFyZSBwYXRocyBhZ2FpbnN0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZpbHRlciAtIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIGNvbmRpdGlvblxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGVsZXZhdG9yIC0gRm9yY2UgZWxldmF0b3IgcGF0aFxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBHZXQgY2xvc2VzdCBkZXN0aW5hdGlvbiB3aXRoIHNwb25zb3JTaGlwIGFib3ZlIG9yIGVxdWFsIHRvIDUwXG4gICAqIGxldCB3YXlwb2ludCA9IGptYXAuTWFwQ29sbGVjdGlvbi5nZXRBbGxXYXlwb2ludHMoKVswXVxuICAgKiBsZXQgZmlsdGVyMSA9IGRlc3RpbmF0aW9uID0+IGRlc3RpbmF0aW9uLnNwb25zb3JlZFJhdGluZyA+PSA1MFxuICAgKiBsZXQgY2xvc2VzdCA9IGptYXAuZ2V0Q2xvc2VzdERlc3RpbmF0aW9uVG9XYXlwb2ludCh3YXlwb2ludCwgZmlsdGVyMSwgZWxldmF0b3IpXG4gICAqXG4gICAqXG4gICAqIC8vIEdldCBjbG9zZXN0IGRlc3RpbmF0aW9uIHdpdGggbmFtZSBjb250YWluaW5nICdoZWxsbydcbiAgICogbGV0IHdheXBvaW50ID0gam1hcC5NYXBDb2xsZWN0aW9uLmdldEFsbFdheXBvaW50cygpWzBdXG4gICAqIGxldCBmaWx0ZXIyID0gZGVzdGluYXRpb24gPT4gZGVzdGluYXRpb24ubmFtZS5pbmRleE9mKCdoZWxsbycpID4gLTFcbiAgICogbGV0IGNsb3Nlc3QgPSBqbWFwLmdldENsb3Nlc3REZXN0aW5hdGlvblRvV2F5cG9pbnQod2F5cG9pbnQsIGZpbHRlcjIsIGVsZXZhdG9yKVxuICAgKlxuICAgKlxuICAgKiAvLyBHZXQgY2xvc2VzdCBkZXN0aW5hdGlvbiB3aXRoIGNhdGVnb3J5ICdGYXNoaW9uJ1xuICAgKiBsZXQgd2F5cG9pbnQgPSBqbWFwLk1hcENvbGxlY3Rpb24uZ2V0QWxsV2F5cG9pbnRzKClbMF1cbiAgICogbGV0IGZpbHRlcjIgPSBkZXN0aW5hdGlvbiA9PiBkZXN0aW5hdGlvbi5jYXRlZ29yeS5pbmRleE9mKCdGYXNoaW9uJykgPiAtMVxuICAgKiBsZXQgY2xvc2VzdCA9IGptYXAuZ2V0Q2xvc2VzdERlc3RpbmF0aW9uVG9XYXlwb2ludCh3YXlwb2ludCwgZmlsdGVyMiwgZWxldmF0b3IpXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gY2xvc2VzdFxuICAgKiBAcmV0dXJuIHtEZXN0aW5hdGlvbn0gY2xvc2VzdC5kZXN0aW5hdGlvbiAtIENsb3Nlc3QgZGVzdGluYXRpb24gbWF0Y2hpbmcgZmlsdGVyLiBJbiB0aGUgY2FzZSBvZiBtdWx0aXBsZSBkZXN0aW5hdGlvbnMgb24gd2F5cG9pbnQsIGZpbHRlciBjYW4gYmUgbW9yZSBzcGVjaWZpY1xuICAgKiBAcmV0dXJuIHtXYXlwb2ludH0gY2xvc2VzdC53YXlwb2ludCAtIFRoZSB3YXlwb2ludCBiZWxvbmdpbmcgdG8gdGhlIGRlc3RpbmF0aW9uIHRoYXQgd2FzIHRoZSBjbG9zZXN0IHRvIHRoZSBzcGVjaWZpZWQgc3RhcnRpbmcgd2F5cG9pbnQuXG4gICAqL1xuICBnZXRDbG9zZXN0RGVzdGluYXRpb25Ub1dheXBvaW50KHdheXBvaW50LCBmaWx0ZXIsIGVsZXZhdG9yKSB7XG4gICAgaWYod2F5cG9pbnQuY29uc3RydWN0b3IgPT09IFdheXBvaW50KSB7XG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIgJiYgZmlsdGVyLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiA/IGZpbHRlciA6ICgpID0+IHRydWVcbiAgICAgIGxldCB3cHMgPSB0aGlzLk1hcENvbGxlY3Rpb24uZ2V0V2F5cG9pbnRzV2l0aERlc3RpbmF0aW9uKCkuZmlsdGVyKCh3cCkgPT4ge1xuICAgICAgICByZXR1cm4gc2VsZi5EZXN0aW5hdGlvbkNvbGxlY3Rpb24uZ2V0QnlXYXlwb2ludElkKHdwLmlkKS5maWx0ZXIoZmlsdGVyKVswXVxuICAgICAgfSlcbiAgICAgIGxldCBjbG9zZXN0V2F5cG9pbnQgPSB0aGlzLmdldENsb3Nlc3RXYXlwb2ludEluQXJyYXlUb1dheXBvaW50KHdwcywgd2F5cG9pbnQsIGVsZXZhdG9yKVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkZXN0aW5hdGlvbjogdGhpcy5EZXN0aW5hdGlvbkNvbGxlY3Rpb24uZ2V0QnlXYXlwb2ludElkKGNsb3Nlc3RXYXlwb2ludC5pZCkuZmlsdGVyKGZpbHRlcilbMF0sXG4gICAgICAgIHdheXBvaW50OiBjbG9zZXN0V2F5cG9pbnRcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2xvc2VzdCBhbWVuaXR5IHRvIHRoZSBzcGVjaWZpZWQgd2F5cG9pbnRcbiAgICogQHBhcmFtIHtXYXlwb2ludH0gd2F5cG9pbnQgLSBXYXlwb2ludCB0byBjb21wYXJlIHBhdGhzIGFnYWluc3RcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZmlsdGVyIC0gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgY29uZGl0aW9uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZWxldmF0b3IgLSBGb3JjZSBlbGV2YXRvciBwYXRoXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIEdldCBjbG9zZXN0IGFtZW5pdHkgd2l0aCBjb21wb25lbnQgaWQgMTIzNFxuICAgKiBsZXQgd2F5cG9pbnQgPSBqbWFwLk1hcENvbGxlY3Rpb24uZ2V0QWxsV2F5cG9pbnRzKClbMF1cbiAgICogbGV0IGZpbHRlcjEgPSBhbWVuaXR5ID0+IGFtZW5pdHkuY29tcG9uZW50SWQgPT09IDEyMzRcbiAgICogbGV0IGNsb3Nlc3QgPSBqbWFwLmdldENsb3Nlc3RBbWVuaXR5VG9XYXlwb2ludCh3YXlwb2ludCwgZmlsdGVyMSwgZWxldmF0b3IpXG4gICAqXG4gICAqXG4gICAqIC8vIEdldCBjbG9zZXN0IGFtZW5pdHkgd2l0aCBkZXNjcmlwdGlvbiBjb250YWluaW5nICd3YXNocm9vbSdcbiAgICogbGV0IHdheXBvaW50ID0gam1hcC5NYXBDb2xsZWN0aW9uLmdldEFsbFdheXBvaW50cygpWzBdXG4gICAqIGxldCBmaWx0ZXIyID0gYW1lbml0eSA9PiBhbWVuaXR5LmRlc2NyaXB0aW9uLmluZGV4T2YoJ3dhc2hyb29tJykgPiAtMVxuICAgKiBsZXQgY2xvc2VzdCA9IGptYXAuZ2V0Q2xvc2VzdEFtZW5pdHlUb1dheXBvaW50KHdheXBvaW50LCBmaWx0ZXIyLCBlbGV2YXRvcilcbiAgICpcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSBjbG9zZXN0XG4gICAqIEByZXR1cm4ge0FtZW5pdHl9IGNsb3Nlc3QuYW1lbml0eSAtIENsb3Nlc3QgYW1lbml0eSBtYXRjaGluZyBmaWx0ZXIuIEluIHRoZSBjYXNlIG9mIG11bHRpcGxlIGFtZW5pdGllcyBvbiB3YXlwb2ludCwgZmlsdGVyIGNhbiBiZSBtb3JlIHNwZWNpZmljXG4gICAqIEByZXR1cm4ge1dheXBvaW50fSBjbG9zZXN0LndheXBvaW50IC0gVGhlIHdheXBvaW50IGJlbG9uZ2luZyB0byB0aGUgYW1lbml0eSB0aGF0IHdhcyB0aGUgY2xvc2VzdCB0byB0aGUgc3BlY2lmaWVkIHN0YXJ0aW5nIHdheXBvaW50LlxuICAgKi9cbiAgZ2V0Q2xvc2VzdEFtZW5pdHlUb1dheXBvaW50KHdheXBvaW50LCBmaWx0ZXIsIGVsZXZhdG9yKSB7XG4gICAgaWYod2F5cG9pbnQuY29uc3RydWN0b3IgPT09IFdheXBvaW50KSB7XG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIgJiYgZmlsdGVyLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiA/IGZpbHRlciA6ICgpID0+IHRydWVcbiAgICAgIGxldCB3cHMgPSB0aGlzLk1hcENvbGxlY3Rpb24uZ2V0V2F5cG9pbnRzV2l0aEFtZW5pdHkoKS5maWx0ZXIoKHdwKSA9PiB7XG4gICAgICAgIHJldHVybiBzZWxmLkFtZW5pdHlDb2xsZWN0aW9uLmdldEJ5V2F5cG9pbnRJZCh3cC5pZCkuZmlsdGVyKGZpbHRlcilbMF1cbiAgICAgIH0pXG4gICAgICBsZXQgY2xvc2VzdFdheXBvaW50ID0gdGhpcy5nZXRDbG9zZXN0V2F5cG9pbnRJbkFycmF5VG9XYXlwb2ludCh3cHMsIHdheXBvaW50LCBlbGV2YXRvcilcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYW1lbml0eTogdGhpcy5BbWVuaXR5Q29sbGVjdGlvbi5nZXRCeVdheXBvaW50SWQoY2xvc2VzdFdheXBvaW50LmlkKS5maWx0ZXIoZmlsdGVyKVswXSxcbiAgICAgICAgd2F5cG9pbnQ6IGNsb3Nlc3RXYXlwb2ludFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG59XG5cbi8qKlxuICogQHN0YXRpYyBKTWFwI3V0aWxcbiAqIEBtZW1iZXIge1V0aWxpdHl9IC0gVXRpbGl0eSBjbGFzcyBmb3IgSk1hcFxuICovXG5KTWFwLnV0aWwgPSBuZXcgVXRpbGl0eSgpO1xuSk1hcC5faXRlbXMgPSBbXTtcblxuLypcbiAgRXhwb3J0IGhhbmRsZXIgdXNlZCB0byBleHBvcnQgaW50byBicm93c2VyIG9yIG5vZGUuanMgcnVudGltZVxuKi9cbigoX2V4cG9ydCkgPT4ge1xuICB0cnkge1xuICAgIHdpbmRvdy5KTWFwID0gX2V4cG9ydFxuICB9IGNhdGNoKGUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9leHBvcnRcbiAgfVxufSkoSk1hcClcblxuLyoqXG4gKiBAbWVtYmVyIHtKTWFwT3B0aW9uc30gICBKTWFwI29wdGlvbnNcbiAqL1xuLyoqXG4gKiBAbWVtYmVyIHtPYmplY3R9ICAgSk1hcCNyZXNwb25zZVxuICovXG4vKipcbiAqIEBtZW1iZXIge0xvY2F0aW9ufSAgIEpNYXAjbG9jYXRpb25cbiAqL1xuLyoqXG4gKiBAbWVtYmVyIHtBbWVuaXR5Q29sbGVjdGlvbn0gICBKTWFwI0FtZW5pdHlDb2xsZWN0aW9uXG4gKi9cbi8qKlxuICogQG1lbWJlciB7Q2F0ZWdvcnlDb2xsZWN0aW9ufSAgIEpNYXAjQ2F0ZWdvcnlDb2xsZWN0aW9uXG4gKi9cbi8qKlxuICogQG1lbWJlciB7RGVzdGluYXRpb25Db2xsZWN0aW9ufSAgIEpNYXAjRGVzdGluYXRpb25Db2xsZWN0aW9uXG4gKi9cbi8qKlxuICogQG1lbWJlciB7RGV2aWNlQ29sbGVjdGlvbn0gICBKTWFwI0RldmljZUNvbGxlY3Rpb25cbiAqL1xuLyoqXG4gKiBAbWVtYmVyIHtFdmVudENvbGxlY3Rpb259ICAgSk1hcCNFdmVudENvbGxlY3Rpb25cbiAqL1xuLyoqXG4gKiBAbWVtYmVyIHtNYXBDb2xsZWN0aW9ufSAgIEpNYXAjTWFwQ29sbGVjdGlvblxuICovXG4vKipcbiAqIEBtZW1iZXIge1BhdGhDb2xsZWN0aW9ufSAgIEpNYXAjUGF0aENvbGxlY3Rpb25cbiAqL1xuLyoqXG4gKiBAbWVtYmVyIHtQYXRoVHlwZUNvbGxlY3Rpb259ICAgSk1hcCNQYXRoVHlwZUNvbGxlY3Rpb25cbiAqL1xuIiwiJ3VzZSBzdHJpY3QnXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIGFtZW5pdHkuICovXG5jbGFzcyBBbWVuaXR5IHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBhbWVuaXR5LlxuICAgKiBAcGFyYW0ge29iamVjdH0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1vZGVsLCBET01QYXJzZXIpIHtcbiAgICB0aGlzLl8gPSB7XG4gICAgICB3YXlwb2ludHM6IFtdXG4gICAgfVxuXG4gICAgZm9yKHZhciBwcm9wZXJ0eSBpbiBtb2RlbC5iZWFuKSB7XG4gICAgICBpZihtb2RlbC5iZWFuLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICB0aGlzLl9bcHJvcGVydHldID0gbW9kZWwuYmVhbltwcm9wZXJ0eV1cblxuICAgICAgICAvL1RPRE86IGNoZWNrIGZvciBzdmcgZmlsZS5cbiAgICAgICAgaWYocHJvcGVydHkgPT09ICdmaWxlUGF0aCcgJiYgcHJvcGVydHkuaW5kZXhPZignLnN2ZycpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmKHRoaXMuXy5zdmcpIHtcblxuICAgICAgICAgICAgICAvL0NsZWFuIHN2Z1xuICAgICAgICAgICAgICB0aGlzLl8uc3ZnID0gdGhpcy5fLnN2Zy5yZXBsYWNlKC9cXHJcXG58XFxyfFxcbnxcXHQvZywgJycpXG4gICAgICAgICAgICAgIHRoaXMuXy5zdmcgPSB0aGlzLl8uc3ZnLnJlcGxhY2UoL1xccysvZywgJyAnKVxuXG4gICAgICAgICAgICAgIC8vUGFyc2VcbiAgICAgICAgICAgICAgdGhpcy5fLnN2Z1RyZWUgPSAobmV3IERPTVBhcnNlcigpKS5wYXJzZUZyb21TdHJpbmcodGhpcy5fLnN2ZywgJ3RleHQveG1sJyk7XG5cbiAgICAgICAgICAgICAgLy9DaGVjayBmb3IgZXJyb3JzXG4gICAgICAgICAgICAgIGlmKCF0aGlzLl8uc3ZnVHJlZSB8fCAhdGhpcy5fLnN2Z1RyZWUuZG9jdW1lbnRFbGVtZW50IHx8IHRoaXMuXy5zdmdUcmVlLmRvY3VtZW50RWxlbWVudC5ub2RlTmFtZSA9PSAncGFyc2VyZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQW1lbml0eSA6OiBpbnB1dCBjb250YWlucyBpbnZhbGlkIFhNTCBkYXRhJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQocHJvcCwgX2RlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5fW3Byb3BdICE9PSB1bmRlZmluZWQgPyB0aGlzLl9bcHJvcF0gOiBfZGVmYXVsdFxuICB9XG5cbiAgc2V0KHByb3AsIHZhbHVlLCBjb25zdHJ1Y3RvciwgX2RlZmF1bHQpIHtcbiAgICBpZih2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gY29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IF9kZWZhdWx0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBBbWVuaXR5I2NvbXBvbmVudElkXG4gICAqL1xuICBnZXQgY29tcG9uZW50SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb21wb25lbnRJZCcsIG51bGwpXG4gIH1cbiAgc2V0IGNvbXBvbmVudElkKGNvbXBvbmVudElkKSB7XG4gICAgdGhpcy5zZXQoJ2NvbXBvbmVudElkJywgY29tcG9uZW50SWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgQW1lbml0eSNjb21wb25lbnRUeXBlSWRcbiAgICovXG4gIGdldCBjb21wb25lbnRUeXBlSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb21wb25lbnRUeXBlSWQnLCBudWxsKVxuICB9XG4gIHNldCBjb21wb25lbnRUeXBlSWQoY29tcG9uZW50VHlwZUlkKSB7XG4gICAgdGhpcy5zZXQoJ2NvbXBvbmVudFR5cGVJZCcsIGNvbXBvbmVudFR5cGVJZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBBbWVuaXR5I2NvbXBvbmVudFR5cGVOYW1lXG4gICAqL1xuICBnZXQgY29tcG9uZW50VHlwZU5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb21wb25lbnRUeXBlTmFtZScsICcnKVxuICB9XG4gIHNldCBjb21wb25lbnRUeXBlTmFtZShjb21wb25lbnRUeXBlTmFtZSkge1xuICAgIHRoaXMuc2V0KCdjb21wb25lbnRUeXBlTmFtZScsIGNvbXBvbmVudFR5cGVOYW1lLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBBbWVuaXR5I2Rlc2NyaXB0aW9uXG4gICAqL1xuICBnZXQgZGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZXNjcmlwdGlvbicsICcnKVxuICB9XG4gIHNldCBkZXNjcmlwdGlvbihkZXNjcmlwdGlvbikge1xuICAgIHRoaXMuc2V0KCdkZXNjcmlwdGlvbicsIGRlc2NyaXB0aW9uLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge0FycmF5fSAgIEFtZW5pdHkjZGVzdGluYXRpb25zXG4gICAqL1xuICBnZXQgZGVzdGluYXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGVzdGluYXRpb25zJywgW10pXG4gIH1cbiAgc2V0IGRlc3RpbmF0aW9ucyhkZXN0aW5hdGlvbnMpIHtcbiAgICB0aGlzLnNldCgnZGVzdGluYXRpb25zJywgZGVzdGluYXRpb25zLCBBcnJheSwgW10pXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIEFtZW5pdHkjZW5kRGF0ZVxuICAgKi9cbiAgZ2V0IGVuZERhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdlbmREYXRlJywgbnVsbClcbiAgfVxuICBzZXQgZW5kRGF0ZShlbmREYXRlKSB7XG4gICAgdGhpcy5zZXQoJ2VuZERhdGUnLCBlbmREYXRlLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIEFtZW5pdHkjZmlsZVBhdGhcbiAgICovXG4gIGdldCBmaWxlUGF0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2ZpbGVQYXRoJywgJycpXG4gIH1cbiAgc2V0IGZpbGVQYXRoKGZpbGVQYXRoKSB7XG4gICAgdGhpcy5zZXQoJ2ZpbGVQYXRoJywgZmlsZVBhdGgsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIEFtZW5pdHkjaWNvbkltYWdlUGF0aFxuICAgKi9cbiAgZ2V0IGljb25JbWFnZVBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpY29uSW1hZ2VQYXRoJywgJycpXG4gIH1cbiAgc2V0IGljb25JbWFnZVBhdGgoaWNvbkltYWdlUGF0aCkge1xuICAgIHRoaXMuc2V0KCdpY29uSW1hZ2VQYXRoJywgaWNvbkltYWdlUGF0aCwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgQW1lbml0eSNsb2NhbGl6ZWRUZXh0XG4gICAqL1xuICBnZXQgbG9jYWxpemVkVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2xvY2FsaXplZFRleHQnLCAnJylcbiAgfVxuICBzZXQgbG9jYWxpemVkVGV4dChsb2NhbGl6ZWRUZXh0KSB7XG4gICAgdGhpcy5zZXQoJ2xvY2FsaXplZFRleHQnLCBsb2NhbGl6ZWRUZXh0LCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBBbWVuaXR5I3Bvc2l0aW9uXG4gICAqL1xuICBnZXQgcG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwb3NpdGlvbicsICcnKVxuICB9XG4gIHNldCBwb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHRoaXMuc2V0KCdwb3NpdGlvbicsIHBvc2l0aW9uLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBBbWVuaXR5I3Byb2plY3RJZFxuICAgKi9cbiAgZ2V0IHByb2plY3RJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Byb2plY3RJZCcsIG51bGwpXG4gIH1cbiAgc2V0IHByb2plY3RJZChwcm9qZWN0SWQpIHtcbiAgICB0aGlzLnNldCgncHJvamVjdElkJywgcHJvamVjdElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIEFtZW5pdHkjc3RhcnREYXRlXG4gICAqL1xuICBnZXQgc3RhcnREYXRlKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc3RhcnREYXRlJywgbnVsbClcbiAgfVxuICBzZXQgc3RhcnREYXRlKHN0YXJ0RGF0ZSkge1xuICAgIHRoaXMuc2V0KCdzdGFydERhdGUnLCBzdGFydERhdGUsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtBcnJheX0gICBBbWVuaXR5I3dheXBvaW50c1xuICAgKi9cbiAgZ2V0IHdheXBvaW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3dheXBvaW50cycsIFtdKVxuICB9XG4gIHNldCB3YXlwb2ludHMod2F5cG9pbnRzKSB7XG4gICAgdGhpcy5zZXQoJ3dheXBvaW50cycsIHdheXBvaW50cywgQXJyYXksIFtdKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBbWVuaXR5XG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IEFtZW5pdHkgPSByZXF1aXJlKCcuL0FtZW5pdHknKVxuXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGEgY29sbGVjdGlvbiBvZiBhbWVuaXRpZXMuICovXG5jbGFzcyBBbWVuaXR5Q29sbGVjdGlvbiB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBhbWVuaXR5IGNvbGxlY3Rpb24uXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih4bWxQYXJzZXIpIHtcbiAgICB0aGlzLl9pdGVtcyA9IFtdXG4gICAgICAvL1NldCBTVkcgWE1MIHBhcnNlclxuICAgIGlmKHhtbFBhcnNlcikge1xuICAgICAgdGhpcy5ET01QYXJzZXIgPSB4bWxQYXJzZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQW1lbml0eUNvbGxlY3Rpb24gOjogTm8gWE1MIHBhcnNlciBwcm92aWRlZC4gQW1lbml0eS5zdmdUcmVlIHdpbGwgbm90IGJlIGF2YWlsYWJsZScpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciB3ZWF0aGVyIG9yIG5vdCBhcmd1bWVudCBpcyBjb25zdHJ1Y3RlZCBhcyBhbiBBbWVuaXR5IG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSAtIEl0ZW0gdG8gZXZhbHVhdGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gQm9vbGVhbiBiYXNlZCBvbiBldmFsdWF0aW9uIHJlc3VsdFxuICAgKi9cbiAgaXNBbWVuaXR5KGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAmJiBpdGVtLmNvbnN0cnVjdG9yID09PSBBbWVuaXR5XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBzaW5nbGUgb3IgYW4gYXJyYXkgb2YgYW1lbml0aWVzIGJhc2VkIG9uIHRoZSBpbnB1dCBtb2RlbCBkYXRhXG4gICAqIEBwYXJhbSB7QXJyYXkvQW1lbml0eX0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICogQHJldHVybiB7QXJyYXkvQW1lbml0eX0gQSBjcmVhdGVkIGFtZW5pdHkgaW5zdGFuY2Ugb3IgYW4gYXJyYXkgb2YgYW1lbml0eSBpbnN0YW5jZXNcbiAgICovXG4gIGNyZWF0ZShtb2RlbCkge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGlmKG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmVzID0gbW9kZWwubWFwKG0gPT4gbmV3IEFtZW5pdHkobSwgdGhpcy5ET01QYXJzZXIpKVxuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuX2l0ZW1zLmNvbmNhdChyZXMpXG4gICAgICB9IGVsc2UgaWYobW9kZWwuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICByZXMgPSBuZXcgQW1lbml0eShtb2RlbCwgdGhpcy5ET01QYXJzZXIpXG4gICAgICAgIHRoaXMuX2l0ZW1zLnB1c2gocmVzKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBBbWVuaXR5IG9iamVjdHNcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgYW1lbml0eSBieSBpdHMgY29tcG9uZW50SWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvbXBvbmVudElkIC0gVGhlIGNvbXBvbmVudCBpZCB1c2VkIHRvIGRlZmluZSBhbiBhbWVuaXR5XG4gICAqIEByZXR1cm4ge0FtZW5pdHl9XG4gICAqL1xuICBnZXRCeUNvbXBvbmVudElkKGNvbXBvbmVudElkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbmQoYW1lbml0eSA9PiBhbWVuaXR5LmNvbXBvbmVudElkID09PSBjb21wb25lbnRJZCkgfHwgbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIHNldCBvZiBhbWVuaXRpZXMgYnkgaXRzIG1hcElkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtYXBJZCAtIFRoZSBpZCB1c2VkIHRvIGRlZmluZSBhIG1hcFxuICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgb2YgYW1lbml0aWVzXG4gICAqL1xuICBnZXRCeU1hcElkKG1hcElkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbHRlcigoYW1lbml0eSkgPT4ge1xuICAgICAgcmV0dXJuIGFtZW5pdHkud2F5cG9pbnRzLmZpbmQodyA9PiB3Lm1hcElkID09PSBtYXBJZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIHNldCBvZiBhbWVuaXRpZXMgYmVsb25naW5nIHRvIGEgd2F5cG9pbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHdheXBvaW50SWQgLSBUaGUgaWQgdXNlZCB0byBkZWZpbmUgYSB3YXlwb2ludFxuICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgb2YgYW1lbml0aWVzXG4gICAqL1xuICBnZXRCeVdheXBvaW50SWQod2F5cG9pbnRJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoKGFtZW5pdHkpID0+IHtcbiAgICAgIHJldHVybiBhbWVuaXR5LndheXBvaW50cy5maW5kKHcgPT4gdy5pZCA9PT0gd2F5cG9pbnRJZClcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQW1lbml0eUNvbGxlY3Rpb25cbiIsIid1c2Ugc3RyaWN0J1xuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhbiBBc3NvY2lhdGlvbi4gKi9cbmNsYXNzIEFzc29jaWF0aW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBBc3NvY2lhdGlvbi5cbiAgICogQHBhcmFtIHtvYmplY3R9IG1vZGVsIC0gVGhlIG1vZGVsIG9iamVjdCBwYXNzZWQgYmFjayBmcm9tIHRoZSAvZnVsbCBwYXlsb2FkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihtb2RlbCkge1xuICAgIHRoaXMuXyA9IHt9XG4gICAgZm9yKHZhciBwcm9wZXJ0eSBpbiBtb2RlbCkge1xuICAgICAgaWYobW9kZWwuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgIHRoaXMuX1twcm9wZXJ0eV0gPSBtb2RlbFtwcm9wZXJ0eV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQocHJvcCwgX2RlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5fW3Byb3BdICE9PSB1bmRlZmluZWQgPyB0aGlzLl9bcHJvcF0gOiBfZGVmYXVsdFxuICB9XG5cbiAgc2V0KHByb3AsIHZhbHVlLCBjb25zdHJ1Y3RvciwgX2RlZmF1bHQpIHtcbiAgICBpZih2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gY29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IF9kZWZhdWx0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBBc3NvY2lhdGlvbiNlbnRpdHlJZFxuICAgKi9cbiAgZ2V0IGVudGl0eUlkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZW50aXR5SWQnLCBudWxsKVxuICB9XG5cbiAgc2V0IGVudGl0eUlkKGVudGl0eUlkKSB7XG4gICAgdGhpcy5zZXQoJ2VudGl0eUlkJywgZW50aXR5SWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgQXNzb2NpYXRpb24jZW50aXR5VHlwZUlkXG4gICAqL1xuICBnZXQgZW50aXR5VHlwZUlkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZW50aXR5VHlwZUlkJywgbnVsbClcbiAgfVxuXG4gIHNldCBlbnRpdHlUeXBlSWQoZW50aXR5VHlwZUlkKSB7XG4gICAgdGhpcy5zZXQoJ2VudGl0eVR5cGVJZCcsIGVudGl0eVR5cGVJZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBBc3NvY2lhdGlvbiNsYW5kbWFya1JhdGluZ1xuICAgKi9cbiAgZ2V0IGxhbmRtYXJrUmF0aW5nKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbGFuZG1hcmtSYXRpbmcnLCBudWxsKVxuICB9XG5cbiAgc2V0IGxhbmRtYXJrUmF0aW5nKGxhbmRtYXJrUmF0aW5nKSB7XG4gICAgdGhpcy5zZXQoJ2xhbmRtYXJrUmF0aW5nJywgbGFuZG1hcmtSYXRpbmcsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgQXNzb2NpYXRpb24jd2F5cG9pbnRJZFxuICAgKi9cbiAgZ2V0IHdheXBvaW50SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd3YXlwb2ludElkJywgbnVsbClcbiAgfVxuXG4gIHNldCB3YXlwb2ludElkKHdheXBvaW50SWQpIHtcbiAgICB0aGlzLnNldCgnd2F5cG9pbnRJZCcsIHdheXBvaW50SWQsIE51bWJlciwgbnVsbClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFzc29jaWF0aW9uXG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IEFzc29jaWF0aW9uID0gcmVxdWlyZSgnLi9Bc3NvY2lhdGlvbicpXG4gIC8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gY29sbGVjdGlvbiBvZiBBc3NvY2lhdGlvbnMuICovXG5jbGFzcyBBc3NvY2lhdGlvbkNvbGxlY3Rpb24ge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb2xsZWN0aW9uIG9mIEFzc29jaWF0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2l0ZW1zID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3Igd2VhdGhlciBvciBub3QgYXJndW1lbnQgaXMgY29uc3RydWN0ZWQgYXMgYW4gQXNzb2NpYXRpb24gb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIC0gSXRlbSB0byBldmFsdWF0ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBCb29sZWFuIGJhc2VkIG9uIGV2YWx1YXRpb24gcmVzdWx0XG4gICAqL1xuICBpc0Fzc29jaWF0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAmJiBpdGVtLmNvbnN0cnVjdG9yID09PSBBc3NvY2lhdGlvblxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgc2luZ2xlIG9yIGFuIGFycmF5IG9mIGRldmljZXMgYmFzZWQgb24gdGhlIGlucHV0IG1vZGVsIGRhdGFcbiAgICogQHBhcmFtIHtBcnJheS9Bc3NvY2lhdGlvbn0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICogQHJldHVybiB7QXJyYXkvQXNzb2NpYXRpb259IEEgY3JlYXRlZCBBc3NvY2lhdGlvbiBpbnN0YW5jZSBvciBhbiBhcnJheSBvZiBBc3NvY2lhdGlvbiBpbnN0YW5jZXNcbiAgICovXG4gIGNyZWF0ZShtb2RlbCkge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGlmKG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmVzID0gbW9kZWwubWFwKG0gPT4gbmV3IEFzc29jaWF0aW9uKG0pKVxuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuX2l0ZW1zLmNvbmNhdChyZXMpXG4gICAgICB9IGVsc2UgaWYobW9kZWwuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICByZXMgPSBuZXcgQXNzb2NpYXRpb24obW9kZWwpXG4gICAgICAgIHRoaXMuX2l0ZW1zLnB1c2gocmVzKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBBc3NvY2lhdGlvbiBvYmplY3RzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtc1xuICB9XG5cbiAgLyoqXG4gICAqIHJldHVybiBhcnJheSBvZiBhc3NvY2lhdGlvbnMgYXNzb2NpYXRlZCB3aXRoIGFuIGVudGl0eUlkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbnRpdHlJZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBBc3NvY2lhdGlvbnMgZW50aXR5SWRcbiAgICogQHJldHVybiB7QXJyYXkvQXNzb2NpYXRpb259IEFycmF5IG9mIEFzc29jaWF0aW9uc1xuICAgKi9cbiAgZ2V0QnlFbnRpdHlJZChlbnRpdHlJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoYSA9PiBhLmVudGl0eUlkID09PSBlbnRpdHlJZClcbiAgfVxuXG4gIC8qKlxuICAgKiByZXR1cm4gYXJyYXkgb2YgYXNzb2NpYXRpb25zIGFzc29jaWF0ZWQgd2l0aCBhbiBlbnRpdHlUeXBlSWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGVudGl0eVR5cGVJZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBBc3NvY2lhdGlvbnMgZW50aXR5VHlwZUlkXG4gICAqIEByZXR1cm4ge0FycmF5L0Fzc29jaWF0aW9ufSBBcnJheSBvZiBBc3NvY2lhdGlvbnNcbiAgICovXG4gIGdldEJ5RW50aXR5VHlwZUlkKGVudGl0eVR5cGVJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoYSA9PiBhLmVudGl0eVR5cGVJZCA9PT0gZW50aXR5VHlwZUlkKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBc3NvY2lhdGlvbkNvbGxlY3Rpb25cbiIsIid1c2Ugc3RyaWN0J1xuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIGNhdGVnb3J5LiAqL1xuY2xhc3MgQ2F0ZWdvcnkge1xuICAvKipcbiAgICogQ3JlYXRlIGEgY2F0ZWdvcnkuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKi9cbiAgY29uc3RydWN0b3IobW9kZWwpIHtcbiAgICB0aGlzLl8gPSB7fVxuICAgIGZvcih2YXIgcHJvcGVydHkgaW4gbW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICB0aGlzLl9bcHJvcGVydHldID0gbW9kZWxbcHJvcGVydHldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0KHByb3AsIF9kZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuX1twcm9wXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fW3Byb3BdIDogX2RlZmF1bHRcbiAgfVxuXG4gIHNldChwcm9wLCB2YWx1ZSwgY29uc3RydWN0b3IsIF9kZWZhdWx0KSB7XG4gICAgaWYodmFsdWUuY29uc3RydWN0b3IgPT09IGNvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSBfZGVmYXVsdFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgQ2F0ZWdvcnkjdGVnb3J5VHlwZVxuICAgKi9cbiAgZ2V0IGNhdGVnb3J5VHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NhdGVnb3J5VHlwZScsIG51bGwpXG4gIH1cbiAgc2V0IGNhdGVnb3J5VHlwZShjYXRlZ29yeVR5cGUpIHtcbiAgICB0aGlzLnNldCgnY2F0ZWdvcnlUeXBlJywgY2F0ZWdvcnlUeXBlLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIENhdGVnb3J5I2NhdGVnb3J5VHlwZU5hbWVcbiAgICovXG4gIGdldCBjYXRlZ29yeVR5cGVOYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY2F0ZWdvcnlUeXBlTmFtZScsICcnKVxuICB9XG4gIHNldCBjYXRlZ29yeVR5cGVOYW1lKGNhdGVnb3J5VHlwZU5hbWUpIHtcbiAgICB0aGlzLnNldCgnY2F0ZWdvcnlUeXBlTmFtZScsIGNhdGVnb3J5VHlwZU5hbWUsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIENhdGVnb3J5I2NsaWVudENhdGVnb3J5SWRcbiAgICovXG4gIGdldCBjbGllbnRDYXRlZ29yeUlkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY2xpZW50Q2F0ZWdvcnlJZCcsICcnKVxuICB9XG4gIHNldCBjbGllbnRDYXRlZ29yeUlkKGNsaWVudENhdGVnb3J5SWQpIHtcbiAgICB0aGlzLnNldCgnY2xpZW50Q2F0ZWdvcnlJZCcsIGNsaWVudENhdGVnb3J5SWQsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIENhdGVnb3J5I2lkXG4gICAqL1xuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpZCcsIG51bGwpXG4gIH1cbiAgc2V0IGlkKGlkKSB7XG4gICAgdGhpcy5zZXQoJ2lkJywgaWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgQ2F0ZWdvcnkja2V5d29yZHNcbiAgICovXG4gIGdldCBrZXl3b3JkcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2tleXdvcmRzJywgJycpXG4gIH1cbiAgc2V0IGtleXdvcmRzKGtleXdvcmRzKSB7XG4gICAgdGhpcy5zZXQoJ2tleXdvcmRzJywga2V5d29yZHMsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIENhdGVnb3J5I25hbWVcbiAgICovXG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbmFtZScsICcnKVxuICB9XG4gIHNldCBuYW1lKG5hbWUpIHtcbiAgICB0aGlzLnNldCgnbmFtZScsIG5hbWUsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIENhdGVnb3J5I3BhcmVudFxuICAgKi9cbiAgZ2V0IHBhcmVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3BhcmVudCcsIG51bGwpXG4gIH1cbiAgc2V0IHBhcmVudChwYXJlbnQpIHtcbiAgICB0aGlzLnNldCgncGFyZW50JywgcGFyZW50LCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIENhdGVnb3J5I3Byb2plY3RJZFxuICAgKi9cbiAgZ2V0IHByb2plY3RJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Byb2plY3RJZCcsIG51bGwpXG4gIH1cbiAgc2V0IHByb2plY3RJZChwcm9qZWN0SWQpIHtcbiAgICB0aGlzLnNldCgncHJvamVjdElkJywgcHJvamVjdElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIENhdGVnb3J5I3RleHRcbiAgICovXG4gIGdldCB0ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndGV4dCcsICcnKVxuICB9XG4gIHNldCB0ZXh0KHRleHQpIHtcbiAgICB0aGlzLnNldCgndGV4dCcsIHRleHQsIFN0cmluZywgJycpXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhdGVnb3J5XG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IENhdGVnb3J5ID0gcmVxdWlyZSgnLi9DYXRlZ29yeScpXG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBjb2xsZWN0aW9uIG9mIGNhdGVnb3JpZXMuICovXG5jbGFzcyBDYXRlZ29yeUNvbGVsY3Rpb24ge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb2xsZWN0aW9uIG9mIGNhdGVnb3JpZXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pdGVtcyA9IFtdXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIHdlYXRoZXIgb3Igbm90IGFyZ3VtZW50IGlzIGNvbnN0cnVjdGVkIGFzIGFuIENhdGVnb3J5IG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSAtIEl0ZW0gdG8gZXZhbHVhdGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gQm9vbGVhbiBiYXNlZCBvbiBldmFsdWF0aW9uIHJlc3VsdFxuICAgKi9cbiAgaXNDYXRlZ29yeShpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0gJiYgaXRlbS5jb25zdHJ1Y3RvciA9PT0gQ2F0ZWdvcnlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHNpbmdsZSBvciBhbiBhcnJheSBvZiBjYXRlZ29yeSBiYXNlZCBvbiB0aGUgaW5wdXQgbW9kZWwgZGF0YVxuICAgKiBAcGFyYW0ge0FycmF5L0NhdGVnb3J5fSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKiBAcmV0dXJuIHtBcnJheS9DYXRlZ29yeX0gQSBjcmVhdGVkIENhdGVnb3J5IGluc3RhbmNlIG9yIGFuIGFycmF5IG9mIENhdGVnb3J5IGluc3RhbmNlc1xuICAgKi9cbiAgY3JlYXRlKG1vZGVsKSB7XG4gICAgbGV0IHJlcyA9IG51bGw7XG4gICAgaWYobW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICByZXMgPSBtb2RlbC5tYXAobSA9PiBuZXcgQ2F0ZWdvcnkobSkpXG4gICAgICAgIHRoaXMuX2l0ZW1zID0gdGhpcy5faXRlbXMuY29uY2F0KHJlcylcbiAgICAgIH0gZWxzZSBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgIHJlcyA9IG5ldyBDYXRlZ29yeShtb2RlbClcbiAgICAgICAgdGhpcy5faXRlbXMucHVzaChyZXMpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIENhdGVnb3J5IG9iamVjdHNcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgY2F0ZWdvcnkgYnkgaXRzIGNhdGVnb3J5VHlwZVxuICAgKiBAcGFyYW0ge051bWJlcn0gY2F0ZWdvcnlUeXBlIC0gVGhlIGNhdGVnb3J5VHlwZSB1c2VkIHRvIGRlZmluZSBhbiBjYXRlZ29yeVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGdldEJ5Q2F0ZWdvcnlUeXBlKGNhdGVnb3J5VHlwZSkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoYyA9PiBjLmNhdGVnb3J5VHlwZSA9PT0gY2F0ZWdvcnlUeXBlKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIGNhdGVnb3J5IGJ5IGl0cyBjYXRlZ29yeVR5cGVOYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjYXRlZ29yeVR5cGVOYW1lIC0gVGhlIGNhdGVnb3J5VHlwZU5hbWUgdXNlZCB0byBkZWZpbmUgYW4gY2F0ZWdvcnlcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRCeUNhdGVnb3J5VHlwZU5hbWUoY2F0ZWdvcnlUeXBlTmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoYyA9PiBjLmNhdGVnb3J5VHlwZU5hbWUgPT09IGNhdGVnb3J5VHlwZU5hbWUpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgY2F0ZWdvcnkgYnkgaXRzIGNsaWVudENhdGVnb3J5SWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsaWVudENhdGVnb3J5SWQgLSBUaGUgY2xpZW50Q2F0ZWdvcnlJZCB1c2VkIHRvIGRlZmluZSBhbiBjYXRlZ29yeVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGdldEJ5Q2xpZW50Q2F0ZWdvcnlJZChjbGllbnRDYXRlZ29yeUlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbHRlcihjID0+IGMuY2xpZW50Q2F0ZWdvcnlJZCA9PT0gY2xpZW50Q2F0ZWdvcnlJZClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzcGVjaWZpYyBjYXRlZ29yeSBieSBpdHMga2V5d29yZFxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCAtIFRoZSBrZXl3b3JkIHVzZWQgdG8gZGVmaW5lIGFuIGNhdGVnb3J5XG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QnlLZXl3b3JkKGtleXdvcmQpIHtcbiAgICBpZihrZXl3b3JkICYmIGtleXdvcmQuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbHRlcihjID0+IGMua2V5d29yZHMudG9Mb3dlckNhc2UoKS5pbmRleE9mKGtleXdvcmQudG9Mb3dlckNhc2UoKSkgPiAtMSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIGNhdGVnb3J5IGJ5IGl0cyBuYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgdXNlZCB0byBkZWZpbmUgYW4gY2F0ZWdvcnlcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRCeU5hbWUobmFtZSkge1xuICAgIGlmKG5hbWUgJiYgbmFtZS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChjID0+IGMubmFtZS50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpIHx8IG51bGxcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgY2F0ZWdvcnkgYnkgaXRzIGlkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCAtIFRoZSBpZCB1c2VkIHRvIGRlZmluZSBhbiBjYXRlZ29yeVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGdldEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChjID0+IGMuaWQgPT09IGlkKSB8fCBudWxsXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhdGVnb3J5Q29sZWxjdGlvblxuIiwiJ3VzZSBzdHJpY3QnXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIGRlc3RpbmF0aW9uLiAqL1xuY2xhc3MgRGVzdGluYXRpb24ge1xuICAvKipcbiAgICogQ3JlYXRlIGFuIGRlc3RpbmF0aW9uLlxuICAgKiBAcGFyYW0ge29iamVjdH0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1vZGVsKSB7XG4gICAgdGhpcy5fID0ge1xuICAgICAgd2F5cG9pbnRzOiBbXVxuICAgIH1cblxuICAgIGZvcih2YXIgcHJvcGVydHkgaW4gbW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICB0aGlzLl9bcHJvcGVydHldID0gbW9kZWxbcHJvcGVydHldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0KHByb3AsIF9kZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuX1twcm9wXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fW3Byb3BdIDogX2RlZmF1bHRcbiAgfVxuXG4gIHNldChwcm9wLCB2YWx1ZSwgY29uc3RydWN0b3IsIF9kZWZhdWx0KSB7XG4gICAgaWYodmFsdWUuY29uc3RydWN0b3IgPT09IGNvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSBfZGVmYXVsdFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtBcnJheX0gICBEZXN0aW5hdGlvbiNjYXRlZ29yeVxuICAgKi9cbiAgZ2V0IGNhdGVnb3J5KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY2F0ZWdvcnknLCBbXSlcbiAgfVxuXG4gIHNldCBjYXRlZ29yeShjYXRlZ29yeSkge1xuICAgICAgdGhpcy5zZXQoJ2NhdGVnb3J5JywgY2F0ZWdvcnksIEFycmF5LCBbXSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXl9ICAgRGVzdGluYXRpb24jY2F0ZWdvcnlJZFxuICAgICAqL1xuICBnZXQgY2F0ZWdvcnlJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NhdGVnb3J5SWQnLCBbXSlcbiAgfVxuXG4gIHNldCBjYXRlZ29yeUlkKGNhdGVnb3J5SWQpIHtcbiAgICB0aGlzLnNldCgnY2F0ZWdvcnlJZCcsIGNhdGVnb3J5SWQsIEFycmF5LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgRGVzdGluYXRpb24jY2xpZW50SWRcbiAgICovXG4gIGdldCBjbGllbnRJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NsaWVudElkJywgJycpXG4gIH1cblxuICBzZXQgY2xpZW50SWQoY2xpZW50SWQpIHtcbiAgICB0aGlzLnNldCgnY2xpZW50SWQnLCBjbGllbnRJZCwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgRGVzdGluYXRpb24jZGVzY3JpcHRpb25cbiAgICovXG4gIGdldCBkZXNjcmlwdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2Rlc2NyaXB0aW9uJywgJycpXG4gIH1cblxuICBzZXQgZGVzY3JpcHRpb24oZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnNldCgnZGVzY3JpcHRpb24nLCBkZXNjcmlwdGlvbiwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgRGVzdGluYXRpb24jZGVzY3JpcHRpb25Nb3JlXG4gICAqL1xuICBnZXQgZGVzY3JpcHRpb25Nb3JlKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGVzY3JpcHRpb25Nb3JlJywgJycpXG4gIH1cblxuICBzZXQgZGVzY3JpcHRpb25Nb3JlKGRlc2NyaXB0aW9uTW9yZSkge1xuICAgIHRoaXMuc2V0KCdkZXNjcmlwdGlvbk1vcmUnLCBkZXNjcmlwdGlvbk1vcmUsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIERlc3RpbmF0aW9uI2hlbHBlckltYWdlXG4gICAqL1xuICBnZXQgaGVscGVySW1hZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdoZWxwZXJJbWFnZScsICcnKVxuICB9XG5cbiAgc2V0IGhlbHBlckltYWdlKGhlbHBlckltYWdlKSB7XG4gICAgdGhpcy5zZXQoJ2hlbHBlckltYWdlJywgaGVscGVySW1hZ2UsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIERlc3RpbmF0aW9uI2lkXG4gICAqL1xuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpZCcsIG51bGwpXG4gIH1cblxuICBzZXQgaWQoaWQpIHtcbiAgICB0aGlzLnNldCgnaWQnLCBpZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBEZXN0aW5hdGlvbiNrZXl3b3Jkc1xuICAgKi9cbiAgZ2V0IGtleXdvcmRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgna2V5d29yZHMnLCAnJylcbiAgfVxuXG4gIHNldCBrZXl3b3JkcyhrZXl3b3Jkcykge1xuICAgIHRoaXMuc2V0KCdrZXl3b3JkcycsIGtleXdvcmRzLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBEZXN0aW5hdGlvbiNuYW1lXG4gICAqL1xuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ25hbWUnLCAnJylcbiAgfVxuXG4gIHNldCBuYW1lKG5hbWUpIHtcbiAgICAgIHRoaXMuc2V0KCduYW1lJywgbmFtZSwgU3RyaW5nLCAnJylcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7TnVtYmVyfSAgIERlc3RpbmF0aW9uI29wZW5pbmdEYXRlXG4gICAgICovXG4gIGdldCBvcGVuaW5nRGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ29wZW5pbmdEYXRlJywgbnVsbClcbiAgfVxuXG4gIHNldCBvcGVuaW5nRGF0ZShvcGVuaW5nRGF0ZSkge1xuICAgIHRoaXMuc2V0KCdvcGVuaW5nRGF0ZScsIG9wZW5pbmdEYXRlLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIERlc3RpbmF0aW9uI29wZXJhdGluZ1N0YXR1c1xuICAgKi9cbiAgZ2V0IG9wZXJhdGluZ1N0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ29wZXJhdGluZ1N0YXR1cycsIG51bGwpXG4gIH1cblxuICBzZXQgb3BlcmF0aW5nU3RhdHVzKG9wZXJhdGluZ1N0YXR1cykge1xuICAgIHRoaXMuc2V0KCdvcGVyYXRpbmdTdGF0dXMnLCBvcGVyYXRpbmdTdGF0dXMsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgRGVzdGluYXRpb24jcHJvamVjdElkXG4gICAqL1xuICBnZXQgcHJvamVjdElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncHJvamVjdElkJywgbnVsbClcbiAgfVxuXG4gIHNldCBwcm9qZWN0SWQocHJvamVjdElkKSB7XG4gICAgdGhpcy5zZXQoJ3Byb2plY3RJZCcsIHByb2plY3RJZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBEZXN0aW5hdGlvbiNxckNvZGVJbWFnZVxuICAgKi9cbiAgZ2V0IHFyQ29kZUltYWdlKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncXJDb2RlSW1hZ2UnLCBudWxsKVxuICB9XG5cbiAgc2V0IHFyQ29kZUltYWdlKHFyQ29kZUltYWdlKSB7XG4gICAgdGhpcy5zZXQoJ3FyQ29kZUltYWdlJywgcXJDb2RlSW1hZ2UsIFN0cmluZywgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgRGVzdGluYXRpb24jc3BvbnNvcmVkUmF0aW5nXG4gICAqL1xuICBnZXQgc3BvbnNvcmVkUmF0aW5nKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc3BvbnNvcmVkUmF0aW5nJywgbnVsbClcbiAgfVxuXG4gIHNldCBzcG9uc29yZWRSYXRpbmcoc3BvbnNvcmVkUmF0aW5nKSB7XG4gICAgdGhpcy5zZXQoJ3Nwb25zb3JlZFJhdGluZycsIHNwb25zb3JlZFJhdGluZywgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge0FycmF5fSAgIERlc3RpbmF0aW9uI3dheXBvaW50c1xuICAgKi9cbiAgZ2V0IHdheXBvaW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3dheXBvaW50cycsIFtdKVxuICB9XG5cbiAgc2V0IHdheXBvaW50cyh3YXlwb2ludHMpIHtcbiAgICB0aGlzLnNldCgnd2F5cG9pbnRzJywgd2F5cG9pbnRzLCBBcnJheSwgW10pXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlc3RpbmF0aW9uXG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IERlc3RpbmF0aW9uID0gcmVxdWlyZSgnLi9EZXN0aW5hdGlvbicpXG5jb25zdCBXYXlwb2ludCA9IHJlcXVpcmUoJy4uL1dheXBvaW50L1dheXBvaW50JylcblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIGNvbGxlY3Rpb24gb2YgZGVzdGluYXRpb24uICovXG5jbGFzcyBEZXN0aW5hdGlvbkNvbGxlY3Rpb24ge1xuICAvKipcbiAgICogQ3JlYXRlIGEgY29sbGVjdGlvbiBvZiBkZXN0aW5hdGlvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pdGVtcyA9IFtdXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIHdlYXRoZXIgb3Igbm90IGFyZ3VtZW50IGlzIGNvbnN0cnVjdGVkIGFzIGFuIERlc3RpbmF0aW9uIG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSAtIEl0ZW0gdG8gZXZhbHVhdGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gQm9vbGVhbiBiYXNlZCBvbiBldmFsdWF0aW9uIHJlc3VsdFxuICAgKi9cbiAgaXNEZXN0aW5hdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0gJiYgaXRlbS5jb25zdHJ1Y3RvciA9PT0gRGVzdGluYXRpb25cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHNpbmdsZSBvciBhbiBhcnJheSBvZiBkZXN0aW5hdGlvbnMgYmFzZWQgb24gdGhlIGlucHV0IG1vZGVsIGRhdGFcbiAgICogQHBhcmFtIHtBcnJheS9EZXN0aW5hdGlvbn0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICogQHJldHVybiB7QXJyYXkvRGVzdGluYXRpb259IEEgY3JlYXRlZCBkZXN0aW5hdGlvbiBpbnN0YW5jZSBvciBhbiBhcnJheSBvZiBkZXN0aW5hdGlvbiBpbnN0YW5jZXNcbiAgICovXG4gIGNyZWF0ZShtb2RlbCkge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGlmKG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmVzID0gbW9kZWwubWFwKG0gPT4gbmV3IERlc3RpbmF0aW9uKG0pKVxuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuX2l0ZW1zLmNvbmNhdChyZXMpXG4gICAgICB9IGVsc2UgaWYobW9kZWwuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICByZXMgPSBuZXcgRGVzdGluYXRpb24obW9kZWwpXG4gICAgICAgIHRoaXMuX2l0ZW1zLnB1c2gocmVzKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBEZXN0aW5hdGlvbiBvYmplY3RzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIGRlc3RpbmF0aW9uIGJ5IGl0cyBpZFxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgLSBUaGUgaWQgdXNlZCB0byBkZWZpbmUgYSBkZXN0aW5hdGlvblxuICAgKiBAcmV0dXJuIHtEZXN0aW5hdGlvbn1cbiAgICovXG4gIGdldEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZCgoZGVzdGluYXRpb24pID0+IHtcbiAgICAgIHJldHVybiBkZXN0aW5hdGlvbi5pZCA9PT0gaWRcbiAgICB9KSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgZGVzdGluYXRpb24gYnkgaXRzIGNsaWVudElkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBjbGllbnRJZCAtIFRoZSBjbGllbnRJZCB1c2VkIHRvIGRlZmluZSBhIGRlc3RpbmF0aW9uXG4gICAqIEByZXR1cm4ge0Rlc3RpbmF0aW9ufVxuICAgKi9cbiAgZ2V0QnlDbGllbnRJZChjbGllbnRJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maW5kKChkZXN0aW5hdGlvbikgPT4ge1xuICAgICAgcmV0dXJuIGRlc3RpbmF0aW9uLmNsaWVudElkID09PSBjbGllbnRJZFxuICAgIH0pIHx8IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzcGVjaWZpYyBzZXQgb2YgZGVzdGluYXRpb25zIGJ5IGl0cyBtYXBJZFxuICAgKiBAcGFyYW0ge051bWJlcn0gbWFwSWQgLSBUaGUgaWQgdXNlZCB0byBkZWZpbmUgYSBtYXBcbiAgICogQHJldHVybiB7QXJyYXkvRGVzdGluYXRpb259IGFuIGFycmF5IG9mIGRlc3RpbmF0aW9uc1xuICAgKi9cbiAgZ2V0QnlNYXBJZChtYXBJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoKGRlc3RpbmF0aW9uKSA9PiB7XG4gICAgICByZXR1cm4gZGVzdGluYXRpb24ud2F5cG9pbnRzLmZpbmQodyA9PiB3Lm1hcElkID09PSBtYXBJZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIHNldCBvZiBkZXN0aW5hdGlvbnMgYmVsb25naW5nIHRvIGEgd2F5cG9pbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHdheXBvaW50SWQgLSBUaGUgaWQgdXNlZCB0byBkZWZpbmUgYSB3YXlwb2ludFxuICAgKiBAcmV0dXJuIHtBcnJheS9EZXN0aW5hdGlvbn0gYW4gYXJyYXkgb2YgZGVzdGluYXRpb25zXG4gICAqL1xuICBnZXRCeVdheXBvaW50SWQod2F5cG9pbnRJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoKGRlc3RpbmF0aW9uKSA9PiB7XG4gICAgICByZXR1cm4gZGVzdGluYXRpb24ud2F5cG9pbnRzLmZpbmQodyA9PiB3LmlkID09PSB3YXlwb2ludElkKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgc2V0IG9mIGRlc3RpbmF0aW9ucyBiZWxvbmdpbmcgdG8gYSB6b25lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB6b25lSWQgLSBUaGUgaWQgdXNlZCB0byBkZWZpbmUgYSB6b25lXG4gICAqIEByZXR1cm4ge0FycmF5L0Rlc3RpbmF0aW9ufSBhbiBhcnJheSBvZiBkZXN0aW5hdGlvbnNcbiAgICovXG4gIGdldEJ5Wm9uZUlkKHpvbmVJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoKGRlc3RpbmF0aW9uKSA9PiB7XG4gICAgICByZXR1cm4gZGVzdGluYXRpb24ud2F5cG9pbnRzLmZpbmQodyA9PiB3LnpvbmVJZCA9PT0gem9uZUlkKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgc2V0IG9mIGRlc3RpbmF0aW9ucyBieSBpdHMgY2F0ZWdvcnlJZFxuICAgKiBAcGFyYW0ge051bWJlcn0gbWFwSWQgLSBUaGUgaWQgdXNlZCB0byBkZWZpbmUgYSBtYXBcbiAgICogQHJldHVybiB7QXJyYXkvRGVzdGluYXRpb259IGFuIGFycmF5IG9mIGRlc3RpbmF0aW9uc1xuICAgKi9cbiAgZ2V0QnlDYXRlZ29yeUlkKGNhdGVnb3J5SWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKChkZXN0aW5hdGlvbikgPT4ge1xuICAgICAgcmV0dXJuIGRlc3RpbmF0aW9uLmNhdGVnb3J5SWQuZmluZChjID0+IGMgPT09IGNhdGVnb3J5SWQpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gYXJyYXkgb2YgZGVzdGluYXRpb25zIGJ5IGl0cyBrZXl3b3JkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIC0gVGhlIGtleXdvcmQgdXNlZCB0byBkZWZpbmUgYSBkZXN0aW5hdGlvblxuICAgKiBAcmV0dXJuIHtBcnJheS9EZXN0aW5hdGlvbn1cbiAgICovXG4gIGdldEJ5S2V5d29yZChrZXl3b3JkKSB7XG4gICAgaWYoa2V5d29yZCAmJiBrZXl3b3JkLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoZCA9PiBkLmtleXdvcmRzLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihrZXl3b3JkLnRvTG93ZXJDYXNlKCkpID4gLTEpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gYXJyYXkgb2YgZGVzdGluYXRpb25zIGJ5IGl0cyBrZXl3b3JkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcGVyYXRpbmdTdGF0dXMgLSBUaGUgb3BlcmF0aW5nU3RhdHVzIG9mIGEgZGVzdGluYXRpb25cbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRCeU9wZXJhdGluZ1N0YXR1cyhvcGVyYXRpbmdTdGF0dXMpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKGQgPT4gZC5vcGVyYXRpbmdTdGF0dXMgPT09IG9wZXJhdGluZ1N0YXR1cylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gYXJyYXkgb2YgZGVzdGluYXRpb25zIGJ5IGl0cyBrZXl3b3JkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcGVyYXRpbmdTdGF0dXMgLSBUaGUgb3BlcmF0aW5nU3RhdHVzIG9mIGEgZGVzdGluYXRpb25cbiAgICogQHJldHVybiB7QXJyYXkvRGVzdGluYXRpb259XG4gICAqL1xuICBnZXRCeVNwb25zb3JlZFJhdGluZyhzcG9uc29yZWRSYXRpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKGQgPT4gZC5zcG9uc29yZWRSYXRpbmcgPT09IHNwb25zb3JlZFJhdGluZylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzb3J0ZWQgYXJyYXkgb2YgZGVzdGluYXRpb25zIGJ5IHNwb25zcG9yZWQgcmF0aW5nLCBoaWdoZXN0IHRvIGxvd2VzdFxuICAgKiBAcGFyYW0ge0FycmF5fSAtIE9wdGlvbmFsOiBBcnJheSBvZiBEZXN0aW5hdGlvbiBvYmplY3RzLCBpZiBub25lIGFyZSBwYXNzZWQgbWV0aG9kIHdpbGwgcmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgYWxsIGRlc3RpbmF0aW9uc1xuICAgKiBAcmV0dXJuIHtBcnJheS9EZXN0aW5hdGlvbn1cbiAgICovXG4gIHNvcnRCeVNwb25zb3JlZFJhdGluZyhkZXN0aW5hdGlvbnMpIHtcbiAgICBpZihkZXN0aW5hdGlvbnMgJiYgZGVzdGluYXRpb25zLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgZGVzdGluYXRpb25zLmZvckVhY2goKGQpID0+IHtcbiAgICAgICAgaWYoZC5jb25zdHJ1Y3RvciAhPT0gRGVzdGluYXRpb24pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdKTWFwIDogQWxsIGl0ZW1zIG11c3QgYmUgdHlwZSBEZXN0aW5hdGlvbicpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGRlc3RpbmF0aW9ucyA9IHRoaXMuX2l0ZW1zXG4gICAgfVxuXG4gICAgcmV0dXJuIGRlc3RpbmF0aW9ucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4oYS5zcG9uc29yZWRSYXRpbmcgPCBiLnNwb25zb3JlZFJhdGluZykgPyAxIDogKChiLnNwb25zb3JlZFJhdGluZyA8IGEuc3BvbnNvcmVkUmF0aW5nKSA/IC0xIDogMCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgRGVzdGluYXRpb24gdGhhdCBoYXMgdGhlIGhpZ2hlc3Qgc3BvbnNvcmVkUmF0aW5nIGJlbG9uZ2luZyB0byBzcGVjaWZpZWQgd2F5cG9pbnRcbiAgICogQHBhcmFtIHtXYXlwb2ludH0gLSBXYXlwb2ludCBvYmplY3RcbiAgICogQHJldHVybiB7RGVzdGluYXRpb259XG4gICAqL1xuICBnZXRIaWdoZXN0U3BvbnNvcmVkRGVzdGluYXRpb25CeVdheXBvaW50KHdheXBvaW50KSB7XG4gICAgLy9FbnRpdHkgdHlwZSBpZCBpcyAxXG4gICAgaWYod2F5cG9pbnQgJiYgd2F5cG9pbnQuY29uc3RydWN0b3IgPT09IFdheXBvaW50KSB7XG4gICAgICBsZXQgYXNzb2NpYXRpb25zID0gd2F5cG9pbnQuQXNzb2NpYXRpb25Db2xsZWN0aW9uLmdldEJ5RW50aXR5VHlwZUlkKDEpXG4gICAgICBsZXQgZGVzdGluYXRpb25zID0gYXNzb2NpYXRpb25zLm1hcChhID0+IHRoaXMuZ2V0QnlJZChhLmVudGl0eUlkKSlcbiAgICAgIHJldHVybiB0aGlzLnNvcnRCeVNwb25zb3JlZFJhdGluZyhkZXN0aW5hdGlvbnMpWzBdIHx8IG51bGxcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZXN0aW5hdGlvbkNvbGxlY3Rpb25cbiIsIid1c2Ugc3RyaWN0J1xuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhbiBEZXN0aW5hdGlvbkxhYmVsLiAqL1xuY2xhc3MgRGVzdGluYXRpb25MYWJlbCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBEZXN0aW5hdGlvbkxhYmVsLlxuICAgKiBAcGFyYW0ge29iamVjdH0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1vZGVsKSB7XG4gICAgdGhpcy5fID0ge31cbiAgICBmb3IodmFyIHByb3BlcnR5IGluIG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgdGhpcy5fW3Byb3BlcnR5XSA9IG1vZGVsW3Byb3BlcnR5XVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldChwcm9wLCBfZGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLl9bcHJvcF0gIT09IHVuZGVmaW5lZCA/IHRoaXMuX1twcm9wXSA6IF9kZWZhdWx0XG4gIH1cblxuICBzZXQocHJvcCwgdmFsdWUsIGNvbnN0cnVjdG9yLCBfZGVmYXVsdCkge1xuICAgIGlmKHZhbHVlLmNvbnN0cnVjdG9yID09PSBjb25zdHJ1Y3Rvcikge1xuICAgICAgdGhpcy5fW3Byb3BdID0gdmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fW3Byb3BdID0gX2RlZmF1bHRcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlc3RpbmF0aW9uTGFiZWxcbiIsIid1c2Ugc3RyaWN0J1xuY29uc3QgRGVzdGluYXRpb25MYWJlbCA9IHJlcXVpcmUoJy4vRGVzdGluYXRpb25MYWJlbCcpXG4gIC8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gY29sbGVjdGlvbiBvZiBEZXN0aW5hdGlvbkxhYmVscy4gKi9cbmNsYXNzIERlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9uIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29sbGVjdGlvbiBvZiBEZXN0aW5hdGlvbkxhYmVscy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2l0ZW1zID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3Igd2VhdGhlciBvciBub3QgYXJndW1lbnQgaXMgY29uc3RydWN0ZWQgYXMgYW4gRGVzdGluYXRpb25MYWJlbCBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gLSBJdGVtIHRvIGV2YWx1YXRlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IEJvb2xlYW4gYmFzZWQgb24gZXZhbHVhdGlvbiByZXN1bHRcbiAgICovXG4gIGlzRGVzdGluYXRpb25MYWJlbChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0gJiYgaXRlbS5jb25zdHJ1Y3RvciA9PT0gRGVzdGluYXRpb25MYWJlbFxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgc2luZ2xlIG9yIGFuIGFycmF5IG9mIGRldmljZXMgYmFzZWQgb24gdGhlIGlucHV0IG1vZGVsIGRhdGFcbiAgICogQHBhcmFtIHtBcnJheS9EZXN0aW5hdGlvbkxhYmVsfSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKiBAcmV0dXJuIHtBcnJheS9EZXN0aW5hdGlvbkxhYmVsfSBBIGNyZWF0ZWQgRGVzdGluYXRpb25MYWJlbCBpbnN0YW5jZSBvciBhbiBhcnJheSBvZiBEZXN0aW5hdGlvbkxhYmVsIGluc3RhbmNlc1xuICAgKi9cbiAgY3JlYXRlKG1vZGVsKSB7XG4gICAgbGV0IHJlcyA9IG51bGw7XG4gICAgaWYobW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICByZXMgPSBtb2RlbC5tYXAobSA9PiBuZXcgRGVzdGluYXRpb25MYWJlbChtKSlcbiAgICAgICAgdGhpcy5faXRlbXMgPSB0aGlzLl9pdGVtcy5jb25jYXQocmVzKVxuICAgICAgfSBlbHNlIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgcmVzID0gbmV3IERlc3RpbmF0aW9uTGFiZWwobW9kZWwpXG4gICAgICAgIHRoaXMuX2l0ZW1zLnB1c2gocmVzKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBEZXN0aW5hdGlvbkxhYmVsIG9iamVjdHNcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9uXG4iLCIndXNlIHN0cmljdCdcbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gRGV2aWNlLiAqL1xuY2xhc3MgRGV2aWNlIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBEZXZpY2UuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKi9cbiAgY29uc3RydWN0b3IobW9kZWwpIHtcbiAgICB0aGlzLl8gPSB7XG4gICAgICB3YXlwb2ludHM6IFtdXG4gICAgfVxuICAgIGZvcih2YXIgcHJvcGVydHkgaW4gbW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICB0aGlzLl9bcHJvcGVydHldID0gbW9kZWxbcHJvcGVydHldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0KHByb3AsIF9kZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuX1twcm9wXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fW3Byb3BdIDogX2RlZmF1bHRcbiAgfVxuXG4gIHNldChwcm9wLCB2YWx1ZSwgY29uc3RydWN0b3IsIF9kZWZhdWx0KSB7XG4gICAgaWYodmFsdWUuY29uc3RydWN0b3IgPT09IGNvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSBfZGVmYXVsdFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgRGV2aWNlI2Rlc2NyaXB0aW9uXG4gICAqL1xuICBnZXQgZGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZXNjcmlwdGlvbicsICcnKVxuICB9XG5cbiAgc2V0IGRlc2NyaXB0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5zZXQoJ2Rlc2NyaXB0aW9uJywgZGVzY3JpcHRpb24sIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIERldmljZSNkZXZpY2VUeXBlRGVzY3JpcHRpb25cbiAgICovXG4gIGdldCBkZXZpY2VUeXBlRGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZXZpY2VUeXBlRGVzY3JpcHRpb24nLCAnJylcbiAgfVxuXG4gIHNldCBkZXZpY2VUeXBlRGVzY3JpcHRpb24oZGV2aWNlVHlwZURlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5zZXQoJ2RldmljZVR5cGVEZXNjcmlwdGlvbicsIGRldmljZVR5cGVEZXNjcmlwdGlvbiwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgRGV2aWNlI2RldmljZVR5cGVJZFxuICAgKi9cbiAgZ2V0IGRldmljZVR5cGVJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2RldmljZVR5cGVJZCcsIG51bGwpXG4gIH1cblxuICBzZXQgZGV2aWNlVHlwZUlkKGRldmljZVR5cGVJZCkge1xuICAgIHRoaXMuc2V0KCdkZXZpY2VUeXBlSWQnLCBkZXZpY2VUeXBlSWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgRGV2aWNlI2hlYWRpbmdcbiAgICovXG4gIGdldCBoZWFkaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnaGVhZGluZycsICcnKVxuICB9XG5cbiAgc2V0IGhlYWRpbmcoaGVhZGluZykge1xuICAgIHRoaXMuc2V0KCdoZWFkaW5nJywgaGVhZGluZywgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgRGV2aWNlI2lkXG4gICAqL1xuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpZCcsIG51bGwpXG4gIH1cblxuICBzZXQgaWQoaWQpIHtcbiAgICB0aGlzLnNldCgnaWQnLCBpZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBEZXZpY2UjcHJvamVjdElkXG4gICAqL1xuICBnZXQgcHJvamVjdElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncHJvamVjdElkJywgbnVsbClcbiAgfVxuXG4gIHNldCBwcm9qZWN0SWQocHJvamVjdElkKSB7XG4gICAgdGhpcy5zZXQoJ3Byb2plY3RJZCcsIHByb2plY3RJZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBEZXZpY2Ujc3RhdHVzXG4gICAqL1xuICBnZXQgc3RhdHVzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc3RhdHVzJywgJycpXG4gIH1cblxuICBzZXQgc3RhdHVzKHN0YXR1cykge1xuICAgIHRoaXMuc2V0KCdzdGF0dXMnLCBzdGF0dXMsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgRGVzdGluYXRpb24jd2F5cG9pbnRzXG4gICAqL1xuICBnZXQgd2F5cG9pbnRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnd2F5cG9pbnRzJywgW10pXG4gIH1cblxuICBzZXQgd2F5cG9pbnRzKHdheXBvaW50cykge1xuICAgIHRoaXMuc2V0KCd3YXlwb2ludHMnLCB3YXlwb2ludHMsIEFycmF5LCBbXSlcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGV2aWNlXG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IERldmljZSA9IHJlcXVpcmUoJy4vRGV2aWNlJylcbiAgLyoqIENsYXNzIHJlcHJlc2VudGluZyBhbiBjb2xsZWN0aW9uIG9mIERldmljZXMuICovXG5jbGFzcyBEZXZpY2VDb2xsZWN0aW9uIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29sbGVjdGlvbiBvZiBEZXZpY2VzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5faXRlbXMgPSBbXVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciB3ZWF0aGVyIG9yIG5vdCBhcmd1bWVudCBpcyBjb25zdHJ1Y3RlZCBhcyBhbiBEZXZpY2Ugb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIC0gSXRlbSB0byBldmFsdWF0ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBCb29sZWFuIGJhc2VkIG9uIGV2YWx1YXRpb24gcmVzdWx0XG4gICAqL1xuICBpc0RldmljZShpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0gJiYgaXRlbS5jb25zdHJ1Y3RvciA9PT0gRGV2aWNlXG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBzaW5nbGUgb3IgYW4gYXJyYXkgb2YgZGV2aWNlcyBiYXNlZCBvbiB0aGUgaW5wdXQgbW9kZWwgZGF0YVxuICAgKiBAcGFyYW0ge0FycmF5L0RldmljZX0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICogQHJldHVybiB7QXJyYXkvRGV2aWNlfSBBIGNyZWF0ZWQgRGV2aWNlIGluc3RhbmNlIG9yIGFuIGFycmF5IG9mIERldmljZSBpbnN0YW5jZXNcbiAgICovXG4gIGNyZWF0ZShtb2RlbCkge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGlmKG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmVzID0gbW9kZWwubWFwKG0gPT4gbmV3IERldmljZShtKSlcbiAgICAgICAgdGhpcy5faXRlbXMgPSB0aGlzLl9pdGVtcy5jb25jYXQocmVzKVxuICAgICAgfSBlbHNlIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgcmVzID0gbmV3IERldmljZShtb2RlbClcbiAgICAgICAgdGhpcy5faXRlbXMucHVzaChyZXMpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIERldmljZSBvYmplY3RzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIERldmljZSBieSBpdHMgY29tcG9uZW50SWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvbXBvbmVudElkIC0gVGhlIGNvbXBvbmVudCBpZCB1c2VkIHRvIGRlZmluZSBhIERldmljZVxuICAgKiBAcmV0dXJuIHtEZXZpY2V9XG4gICAqL1xuICBnZXRCeUlkKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbmQoKGRldmljZSkgPT4ge1xuICAgICAgcmV0dXJuIGRldmljZS5pZCA9PT0gaWRcbiAgICB9KSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgc2V0IG9mIGRldmljZXMgYnkgaXRzIG1hcElkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtYXBJZCAtIFRoZSBpZCB1c2VkIHRvIGRlZmluZSBhIG1hcFxuICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgb2YgZGV2aWNlc1xuICAgKi9cbiAgZ2V0QnlNYXBJZChtYXBJZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIoKERldmljZSkgPT4ge1xuICAgICAgcmV0dXJuIERldmljZS53YXlwb2ludHMuZmluZCh3ID0+IHcubWFwSWQgPT09IG1hcElkKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgc2V0IG9mIGRldmljZXMgYmVsb25naW5nIHRvIGEgd2F5cG9pbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHdheXBvaW50SWQgLSBUaGUgaWQgdXNlZCB0byBkZWZpbmUgYSB3YXlwb2ludFxuICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgb2YgZGV2aWNlc1xuICAgKi9cbiAgZ2V0QnlXYXlwb2ludElkKHdheXBvaW50SWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKChEZXZpY2UpID0+IHtcbiAgICAgIHJldHVybiBEZXZpY2Uud2F5cG9pbnRzLmZpbmQodyA9PiB3LmlkID09PSB3YXlwb2ludElkKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgc2V0IG9mIGRldmljZXMgYnkgaXRzIGRldmljZVR5cGVJZFxuICAgKiBAcGFyYW0ge051bWJlcn0gZGV2aWNlVHlwZUlkIC0gVGhlIGRldmljZVR5cGVJZCB1c2VkIHRvIGRlZmluZSBhIGRldmljZSB0eXBlXG4gICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBvZiBkZXZpY2VzXG4gICAqL1xuICBnZXRCeURldmljZVR5cGVJZChkZXZpY2VUeXBlSWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKChkZXZpY2UpID0+IHtcbiAgICAgIHJldHVybiBkZXZpY2UuZGV2aWNlVHlwZUlkID09PSBkZXZpY2VUeXBlSWRcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIHNldCBvZiBkZXZpY2VzIGJ5IGl0cyBkZXZpY2VUeXBlSWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IFN0YXR1cyAtIFRoZSBzdGF0dXMgdXNlZCB0byBkZWZpbmUgYSBkZXZpY2UgdHlwZSBcIkFjdGl2ZVwiIHx8IFwiSW5hY3RpdmVcIlxuICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgb2YgZGV2aWNlc1xuICAgKi9cbiAgZ2V0QnlTdGF0dXMoc3RhdHVzKSB7XG4gICAgaWYoc3RhdHVzICYmIHN0YXR1cy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKGRldmljZSA9PiBkZXZpY2Uuc3RhdHVzLnRvTG93ZXJDYXNlKCkgPT09IHN0YXR1cy50b0xvd2VyQ2FzZSgpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERldmljZUNvbGxlY3Rpb25cbiIsIlwidXNlIHN0cmljdFwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lKRmRtVnVkRU52Ykd4bFkzUnBiMjR1YW5NaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNlcxMTkiLCIndXNlIHN0cmljdCdcbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gTG9jYXRpb24uICovXG5jbGFzcyBMb2NhdGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gTG9jYXRpb24uXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IobW9kZWwpIHtcbiAgICB0aGlzLl8gPSB7fTtcbiAgICBmb3IodmFyIHByb3BlcnR5IGluIG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgdGhpcy5fW3Byb3BlcnR5XSA9IG1vZGVsW3Byb3BlcnR5XVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldChwcm9wLCBfZGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLl9bcHJvcF0gIT09IHVuZGVmaW5lZCA/IHRoaXMuX1twcm9wXSA6IF9kZWZhdWx0XG4gIH1cblxuICBzZXQocHJvcCwgdmFsdWUsIGNvbnN0cnVjdG9yLCBfZGVmYXVsdCkge1xuICAgIGlmKHZhbHVlLmNvbnN0cnVjdG9yID09PSBjb25zdHJ1Y3Rvcikge1xuICAgICAgdGhpcy5fW3Byb3BdID0gdmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fW3Byb3BdID0gX2RlZmF1bHRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgTG9jYXRpb24jYWRkcmVzc2VzXG4gICAqL1xuICBnZXQgYWRkcmVzc2VzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnYWRkcmVzc2VzJywgW10pXG4gIH1cblxuICBzZXQgYWRkcmVzc2VzKGFkZHJlc3Nlcykge1xuICAgIHRoaXMuc2V0KCdhZGRyZXNzZXMnLCBhZGRyZXNzZXMsIEFycmF5LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICBMb2NhdGlvbiNjbGllbnRQcm9qZWN0SWRcbiAgICovXG4gIGdldCBjbGllbnRQcm9qZWN0SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjbGllbnRQcm9qZWN0SWQnLCAnJylcbiAgfVxuXG4gIHNldCBjbGllbnRQcm9qZWN0SWQoY2xpZW50UHJvamVjdElkKSB7XG4gICAgdGhpcy5zZXQoJ2NsaWVudFByb2plY3RJZCcsIGNsaWVudFByb2plY3RJZCwgU3RyaW5nLCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtBcnJheX0gICBMb2NhdGlvbiNsYW5ndWFnZXNcbiAgICovXG4gIGdldCBsYW5ndWFnZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdsYW5ndWFnZXMnLCBbXSlcbiAgfVxuXG4gIHNldCBsYW5ndWFnZXMobGFuZ3VhZ2VzKSB7XG4gICAgdGhpcy5zZXQoJ2xhbmd1YWdlcycsIGxhbmd1YWdlcywgQXJyYXksIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gIExvY2F0aW9uI2xvY2F0aW9uSWRcbiAgICovXG4gIGdldCBsb2NhdGlvbklkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbG9jYXRpb25JZCcsIG51bGwpXG4gIH1cblxuICBzZXQgbG9jYXRpb25JZChsb2NhdGlvbklkKSB7XG4gICAgdGhpcy5zZXQoJ2xvY2F0aW9uSWQnLCBsb2NhdGlvbklkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgTG9jYXRpb24jbG9jYXRpb25OYW1lXG4gICAqL1xuICBnZXQgbG9jYXRpb25OYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbG9jYXRpb25OYW1lJywgJycpXG4gIH1cblxuICBzZXQgbG9jYXRpb25OYW1lKGxvY2F0aW9uTmFtZSkge1xuICAgIHRoaXMuc2V0KCdsb2NhdGlvbk5hbWUnLCBsb2NhdGlvbk5hbWUsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgTG9jYXRpb24jbmFtZVxuICAgKi9cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCduYW1lJywgJycpXG4gIH1cblxuICBzZXQgbmFtZShuYW1lKSB7XG4gICAgdGhpcy5zZXQoJ25hbWUnLCBuYW1lLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gIExvY2F0aW9uI3Byb2plY3RJZFxuICAgKi9cbiAgZ2V0IHByb2plY3RJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Byb2plY3RJZCcsIG51bGwpXG4gIH1cblxuICBzZXQgcHJvamVjdElkKHByb2plY3RJZCkge1xuICAgIHRoaXMuc2V0KCdwcm9qZWN0SWQnLCBwcm9qZWN0SWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICBMb2NhdGlvbiNzdGF0dXNcbiAgICovXG4gIGdldCBzdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdzdGF0dXMnLCAnJylcbiAgfVxuXG4gIHNldCBzdGF0dXMoc3RhdHVzKSB7XG4gICAgdGhpcy5zZXQoJ3N0YXR1cycsIHN0YXR1cywgU3RyaW5nLCAnJylcbiAgfVxuXG59XG5cbi8vIExvY2F0aW9uLl9pdGVtcyA9IFtdXG5tb2R1bGUuZXhwb3J0cyA9IExvY2F0aW9uXG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IFdheXBvaW50Q29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL1dheXBvaW50L1dheXBvaW50Q29sbGVjdGlvbicpXG5jb25zdCBEZXN0aW5hdGlvbkxhYmVsQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL0Rlc3RpbmF0aW9uTGFiZWwvRGVzdGluYXRpb25MYWJlbENvbGxlY3Rpb24nKVxuY29uc3QgTWFwTGFiZWxDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vTWFwTGFiZWwvTWFwTGFiZWxDb2xsZWN0aW9uJylcblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIE1hcC4gKi9cbmNsYXNzIE1hcCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBNYXAuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKiBAcGFyYW0ge0RPTVBhcnNlcn0gRE9NUGFyc2VyIC0gWE1MIERPTSBwYXJzZXIgd2luZG93LkRPTVBhcnNlciBmb3IgYnJvd3NlciBvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS94bWxkb21cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1vZGVsLCBET01QYXJzZXIpIHtcbiAgICB0aGlzLl8gPSB7fVxuICAgIGZvcih2YXIgcHJvcGVydHkgaW4gbW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuXG4gICAgICAgIC8vRmxhdHRlbiBtYXAgcHJvcGVydHlcbiAgICAgICAgaWYocHJvcGVydHkgPT0gJ21hcCcpIHtcbiAgICAgICAgICBsZXQgbWFwID0gbW9kZWxbcHJvcGVydHldXG4gICAgICAgICAgZm9yKHZhciBwcm9wZXJ0eTIgaW4gbWFwKSB7XG4gICAgICAgICAgICBpZihtYXAuaGFzT3duUHJvcGVydHkocHJvcGVydHkyKSkge1xuICAgICAgICAgICAgICB0aGlzLl9bcHJvcGVydHkyXSA9IG1hcFtwcm9wZXJ0eTJdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9DcmVhdGUgd2F5cG9pbnQgY29sbGVjdGlvblxuICAgICAgICB9IGVsc2UgaWYocHJvcGVydHkgPT0gJ3dheXBvaW50cycpIHtcbiAgICAgICAgICB0aGlzLldheXBvaW50Q29sbGVjdGlvbiA9IG5ldyBXYXlwb2ludENvbGxlY3Rpb24oKVxuICAgICAgICAgIHRoaXMuV2F5cG9pbnRDb2xsZWN0aW9uLmNyZWF0ZShtb2RlbFtwcm9wZXJ0eV0pXG5cbiAgICAgICAgICAvL0NyZWF0ZSBEZXN0aW5hdGlvbiBMYWJlbCBjb2xsZWN0aW9uXG4gICAgICAgIH0gZWxzZSBpZihwcm9wZXJ0eSA9PSAnZGVzdGluYXRpb25MYWJlbHMnKSB7XG4gICAgICAgICAgdGhpcy5EZXN0aW5hdGlvbkxhYmVsQ29sbGVjdGlvbiA9IG5ldyBEZXN0aW5hdGlvbkxhYmVsQ29sbGVjdGlvbigpXG4gICAgICAgICAgdGhpcy5EZXN0aW5hdGlvbkxhYmVsQ29sbGVjdGlvbi5jcmVhdGUobW9kZWxbcHJvcGVydHldKVxuXG4gICAgICAgICAgLy9DcmVhdGUgTWFwIExhYmVsIGNvbGxlY3Rpb25cbiAgICAgICAgfSBlbHNlIGlmKHByb3BlcnR5ID09ICdtYXBMYWJlbHMnKSB7XG4gICAgICAgICAgdGhpcy5NYXBMYWJlbENvbGxlY3Rpb24gPSBuZXcgTWFwTGFiZWxDb2xsZWN0aW9uKClcbiAgICAgICAgICB0aGlzLk1hcExhYmVsQ29sbGVjdGlvbi5jcmVhdGUobW9kZWxbcHJvcGVydHldKVxuXG4gICAgICAgICAgLy9QYXJzZSBTVkcgaW50byBYTUwgRE9NIHRyZWVcbiAgICAgICAgfSBlbHNlIGlmKHByb3BlcnR5ID09ICdzdmcnICYmIG1vZGVsW3Byb3BlcnR5XSAmJiBET01QYXJzZXIpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9DbGVhbiBzdmdcbiAgICAgICAgICAgIG1vZGVsW3Byb3BlcnR5XSA9IG1vZGVsW3Byb3BlcnR5XS5yZXBsYWNlKC9cXHJcXG58XFxyfFxcbnxcXHQvZywgJycpXG4gICAgICAgICAgICBtb2RlbFtwcm9wZXJ0eV0gPSBtb2RlbFtwcm9wZXJ0eV0ucmVwbGFjZSgvXFxzKy9nLCAnICcpXG5cbiAgICAgICAgICAgIC8vUGFyc2VcbiAgICAgICAgICAgIHRoaXMuXy5zdmdUcmVlID0gKG5ldyBET01QYXJzZXIoKSkucGFyc2VGcm9tU3RyaW5nKG1vZGVsW3Byb3BlcnR5XSwgJ3RleHQveG1sJyk7XG5cbiAgICAgICAgICAgIC8vQ2hlY2sgZm9yIGVycm9yc1xuICAgICAgICAgICAgaWYoIXRoaXMuXy5zdmdUcmVlLmRvY3VtZW50RWxlbWVudCB8fCB0aGlzLl8uc3ZnVHJlZS5kb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgPT0gJ3BhcnNlcmVycm9yJykge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNYXAgOjogaW5wdXQgY29udGFpbnMgaW52YWxpZCBYTUwgZGF0YScpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLl9bcHJvcGVydHldID0gbW9kZWxbcHJvcGVydHldXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vUGFyc2Ugb3V0IExCb3hlc1xuICAgICAgICAgICAgbGV0IHJlY3RzID0gdGhpcy5fLnN2Z1RyZWUuZG9jdW1lbnRFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdyZWN0JylcbiAgICAgICAgICAgIHRoaXMuXy5sYm94ZXMgPSBbXVxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHJlY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGxldCBfY2xhc3MgPSByZWN0c1tpXS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJylcbiAgICAgICAgICAgICAgaWYoX2NsYXNzID09PSAnTEJveCcpIHRoaXMuXy5sYm94ZXMucHVzaChyZWN0c1tpXSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9BZGQgKi1MYXllciBjbGFzcyB0byBhbGwgbGF5ZXJzXG5cbiAgICAgICAgICAgIGxldCBsYXllcnMgPSB0aGlzLl8uc3ZnVHJlZS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uY2hpbGROb2Rlc1xuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGxheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAvL0dldCBJZCBvZiBsYXllclxuICAgICAgICAgICAgICBsZXQgaWQgPSBsYXllcnNbal0uZ2V0QXR0cmlidXRlKCdpZCcpXG5cbiAgICAgICAgICAgICAgLy9NYWtlIHN1cmUgaXRzIG5vdCB0aGUgPHN0eWxlPiB0YWdcbiAgICAgICAgICAgICAgaWYoaWQpIHtcbiAgICAgICAgICAgICAgICAvL1JlbW92ZSAnXycgZnJvbSBpZCBhbmQgYXBwZW5kIGFzIGNsYXNzIG5hbWVcbiAgICAgICAgICAgICAgICBsZXQgYmFzZU5hbWUgPSBpZC5yZXBsYWNlKC9fLiovLCAnJylcbiAgICAgICAgICAgICAgICBpZihiYXNlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgbGF5ZXJzW2pdLnNldEF0dHJpYnV0ZSgnbmFtZScsIGJhc2VOYW1lKVxuICAgICAgICAgICAgICAgICAgbGF5ZXJzW2pdLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBiYXNlTmFtZSArICctTGF5ZXInKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vQ2F0Y2ggYW55IG5ldyBvciBzdHJheSBwb3JwZXJ0aWVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fW3Byb3BlcnR5XSA9IG1vZGVsW3Byb3BlcnR5XVxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQocHJvcCwgX2RlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5fW3Byb3BdICE9PSB1bmRlZmluZWQgPyB0aGlzLl9bcHJvcF0gOiBfZGVmYXVsdFxuICB9XG5cbiAgc2V0KHByb3AsIHZhbHVlLCBjb25zdHJ1Y3RvciwgX2RlZmF1bHQpIHtcbiAgICBpZih2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gY29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IF9kZWZhdWx0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNsb3Nlc3QgYW1lbml0eSB0byB0aGUgc3BlY2lmaWVkIHdheXBvaW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludCAtIHgveSBjb29yZGluYXRlIChjYW4gYmUgYSB3YXlwb2ludClcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50LnggLSB4IGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50LnkgLSB5IGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJhZHVpcyAtIHJhZHVpcyBvZiB0aGUgYXJlYSB0byBsb29rIGluLCBkZWZhdWx0IGlzIDEwMFxuICAgKiBAcmV0dXJuIHtBcnJheS9XYXlwb2ludH0gLSBBbiBhcnJheSBvZiB3YXlwb2ludHMgc29ydGVkIGJ5IGRpc3RhbmNlIHRvIHBvaW50XG4gICAqL1xuICBnZXRXYXlwb2ludHNJbkFyZWEocG9pbnQsIHJhZGl1cykge1xuICAgIC8vVmFsaWRhdGUgaW5wdXRcbiAgICBpZighcG9pbnQgfHwgIXBvaW50LnggfHwgIXBvaW50LnkgfHwgcG9pbnQueC5jb25zdHJ1Y3RvciAhPT0gTnVtYmVyIHx8IHBvaW50LnkuY29uc3RydWN0b3IgIT09IE51bWJlcikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIDo6IGZpcnN0IGFyZ3VtZW50IGJ5IGJlIHZhbGlkIHt4OiBOdW1iZXIsIHk6IE51bWJlcn0nKVxuICAgIH1cbiAgICBpZighcmFkaXVzIHx8IHJhZGl1cyAhPT0gTnVtYmVyKSByYWRpdXMgPSAxMDBcblxuICAgIC8vUmFkaXVzIHRvIHBvd2VyIG9mIDJcbiAgICBsZXQgcmFkaXVzMiA9IE1hdGgucG93KHJhZGl1cywgMilcblxuICAgIC8vQ29sbGVjdGlvbiBvZiBmb3VuZCBwb2ludHNcbiAgICBsZXQgbm9kZXMgPSBbXVxuXG4gICAgLy9BbGwgV2F5cG9pbnRzIG9uIHRoaXMgTWFwXG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLldheXBvaW50Q29sbGVjdGlvbjtcblxuICAgIC8vR2V0IHdheXBvaW50IGluIGJvdW5kc1xuICAgIGNvbGxlY3Rpb24uZ2V0QWxsKCkuZm9yRWFjaCgod3ApID0+IHtcbiAgICAgIGxldCB4eTIgPSBNYXRoLnBvdygod3AueCAtIHBvaW50LngpLCAyKSArIE1hdGgucG93KCh3cC55IC0gcG9pbnQueSksIDIpXG4gICAgICAgIC8vUG9pbnQgaXMgaW5zaWRlIGNpcmNsZVxuICAgICAgaWYoeHkyIDwgcmFkaXVzMikge1xuICAgICAgICBub2Rlcy5wdXNoKHtcbiAgICAgICAgICBpZDogd3AuaWQsXG4gICAgICAgICAgZGlzdGFuY2U6IE1hdGguc3FydCh4eTIpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFNvcnQgYnkgZGlzdGFuY2UgYW5kIG1hcCB0byB3YXlwb2ludFxuICAgIHJldHVybiBub2Rlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYS5kaXN0YW5jZSAtIGIuZGlzdGFuY2VcbiAgICB9KS5tYXAoKG5vZGUpID0+IHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmdldEJ5SWQobm9kZS5pZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1dheXBvaW50Q29sbGVjdGlvbn0gICBNYXAjV2F5cG9pbnRDb2xsZWN0aW9uXG4gICAqL1xuICBnZXQgV2F5cG9pbnRDb2xsZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnV2F5cG9pbnRDb2xsZWN0aW9uJywgbnVsbClcbiAgfVxuICBzZXQgV2F5cG9pbnRDb2xsZWN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB0aGlzLnNldCgnV2F5cG9pbnRDb2xsZWN0aW9uJywgY29sbGVjdGlvbiwgV2F5cG9pbnRDb2xsZWN0aW9uLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge0Rlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9ufSAgIE1hcCNEZXN0aW5hdGlvbkxhYmVsQ29sbGVjdGlvblxuICAgKi9cbiAgZ2V0IERlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnRGVzdGluYXRpb25MYWJlbENvbGxlY3Rpb24nLCBudWxsKVxuICB9XG4gIHNldCBEZXN0aW5hdGlvbkxhYmVsQ29sbGVjdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXQoJ0Rlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9uJywgY29sbGVjdGlvbiwgRGVzdGluYXRpb25MYWJlbENvbGxlY3Rpb24sIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TWFwTGFiZWxDb2xsZWN0aW9ufSAgIE1hcCNNYXBMYWJlbENvbGxlY3Rpb25cbiAgICovXG4gIGdldCBNYXBMYWJlbENvbGxlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdNYXBMYWJlbENvbGxlY3Rpb24nLCBudWxsKVxuICB9XG4gIHNldCBNYXBMYWJlbENvbGxlY3Rpb24oY29sbGVjdGlvbikge1xuICAgIHRoaXMuc2V0KCdNYXBMYWJlbENvbGxlY3Rpb24nLCBjb2xsZWN0aW9uLCBNYXBMYWJlbENvbGxlY3Rpb24sIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgTWFwI2Rlc3RpbmF0aW9uTGFiZWxzXG4gICAqL1xuICBnZXQgZGVzdGluYXRpb25MYWJlbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZXN0aW5hdGlvbkxhYmVscycsIFtdKVxuICB9XG4gIHNldCBkZXN0aW5hdGlvbkxhYmVscyhkZXN0aW5hdGlvbkxhYmVscykge1xuICAgIHRoaXMuc2V0KCdkZXN0aW5hdGlvbkxhYmVscycsIGRlc3RpbmF0aW9uTGFiZWxzLCBBcnJheSwgW10pXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7Qm9vbGVhbn0gICBNYXAjZGVmYXVsdE1hcEZvckRldmljZVxuICAgKi9cbiAgZ2V0IGRlZmF1bHRNYXBGb3JEZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZWZhdWx0TWFwRm9yRGV2aWNlJywgZmFsc2UpXG4gIH1cbiAgc2V0IGRlZmF1bHRNYXBGb3JEZXZpY2UoZGVmYXVsdE1hcEZvckRldmljZSkge1xuICAgIHRoaXMuc2V0KCdkZWZhdWx0TWFwRm9yRGV2aWNlJywgZGVmYXVsdE1hcEZvckRldmljZSwgQm9vbGVhbiwgZmFsc2UpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcCNkZXNjcmlwdGlvblxuICAgKi9cbiAgZ2V0IGRlc2NyaXB0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGVzY3JpcHRpb24nLCAnJylcbiAgfVxuICBzZXQgZGVzY3JpcHRpb24oZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnNldCgnZGVzY3JpcHRpb24nLCBkZXNjcmlwdGlvbiwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgTWFwI2Zsb29yU2VxdWVuY2VcbiAgICovXG4gIGdldCBmbG9vclNlcXVlbmNlKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZmxvb3JTZXF1ZW5jZScsIG51bGwpXG4gIH1cbiAgc2V0IGZsb29yU2VxdWVuY2UoZmxvb3JTZXF1ZW5jZSkge1xuICAgIHRoaXMuc2V0KCdmbG9vclNlcXVlbmNlJywgZmxvb3JTZXF1ZW5jZSwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBNYXAjbG9jYXRpb25JZFxuICAgKi9cbiAgZ2V0IGxvY2F0aW9uSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdsb2NhdGlvbklkJywgbnVsbClcbiAgfVxuICBzZXQgbG9jYXRpb25JZChsb2NhdGlvbklkKSB7XG4gICAgdGhpcy5zZXQoJ2xvY2F0aW9uSWQnLCBsb2NhdGlvbklkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcCNsb2NhdGlvbk5hbWVcbiAgICovXG4gIGdldCBsb2NhdGlvbk5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdsb2NhdGlvbk5hbWUnLCAnJylcbiAgfVxuICBzZXQgbG9jYXRpb25OYW1lKGxvY2F0aW9uTmFtZSkge1xuICAgIHRoaXMuc2V0KCdsb2NhdGlvbk5hbWUnLCBsb2NhdGlvbk5hbWUsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIE1hcCNtYXBJZFxuICAgKi9cbiAgZ2V0IG1hcElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbWFwSWQnLCBudWxsKVxuICB9XG4gIHNldCBtYXBJZChtYXBJZCkge1xuICAgIHRoaXMuc2V0KCdtYXBJZCcsIG1hcElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcCNuYW1lXG4gICAqL1xuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ25hbWUnLCAnJylcbiAgfVxuICBzZXQgbmFtZShuYW1lKSB7XG4gICAgdGhpcy5zZXQoJ25hbWUnLCBuYW1lLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBNYXAjcGFyZW50TG9jYXRpb25JZFxuICAgKi9cbiAgZ2V0IHBhcmVudExvY2F0aW9uSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwYXJlbnRMb2NhdGlvbklkJywgbnVsbClcbiAgfVxuICBzZXQgcGFyZW50TG9jYXRpb25JZChwYXJlbnRMb2NhdGlvbklkKSB7XG4gICAgdGhpcy5zZXQoJ3BhcmVudExvY2F0aW9uSWQnLCBwYXJlbnRMb2NhdGlvbklkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIE1hcCNwcmVmZXJlbmNlXG4gICAqL1xuICBnZXQgcHJlZmVyZW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ByZWZlcmVuY2UnLCBudWxsKVxuICB9XG4gIHNldCBwcmVmZXJlbmNlKHByZWZlcmVuY2UpIHtcbiAgICB0aGlzLnNldCgncHJlZmVyZW5jZScsIHByZWZlcmVuY2UsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgTWFwI3N0YXR1c1xuICAgKi9cbiAgZ2V0IHN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3N0YXR1cycsIG51bGwpXG4gIH1cbiAgc2V0IHN0YXR1cyhzdGF0dXMpIHtcbiAgICB0aGlzLnNldCgnc3RhdHVzJywgc3RhdHVzLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcCNzdGF0dXNEZXNjXG4gICAqL1xuICBnZXQgc3RhdHVzRGVzYygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3N0YXR1c0Rlc2MnLCAnJylcbiAgfVxuICBzZXQgc3RhdHVzRGVzYyhzdGF0dXNEZXNjKSB7XG4gICAgdGhpcy5zZXQoJ3N0YXR1c0Rlc2MnLCBzdGF0dXNEZXNjLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBNYXAjc3ZnTWFwXG4gICAqL1xuICBnZXQgc3ZnTWFwKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc3ZnTWFwJywgJycpXG4gIH1cbiAgc2V0IHN2Z01hcChzdmdNYXApIHtcbiAgICB0aGlzLnNldCgnc3ZnTWFwJywgc3ZnTWFwLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBNYXAjdGh1bWJuYWlsSFRNTFxuICAgKi9cbiAgZ2V0IHRodW1ibmFpbEhUTUwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd0aHVtYm5haWxIVE1MJywgJycpXG4gIH1cbiAgc2V0IHRodW1ibmFpbEhUTUwodGh1bWJuYWlsSFRNTCkge1xuICAgIHRoaXMuc2V0KCd0aHVtYm5haWxIVE1MJywgdGh1bWJuYWlsSFRNTCwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgTWFwI3VyaVxuICAgKi9cbiAgZ2V0IHVyaSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VyaScsICcnKVxuICB9XG4gIHNldCB1cmkodXJpKSB7XG4gICAgdGhpcy5zZXQoJ3VyaScsIHVyaSwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgTWFwI3hPZmZzZXRcbiAgICovXG4gIGdldCB4T2Zmc2V0KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgneE9mZnNldCcsIG51bGwpXG4gIH1cbiAgc2V0IHhPZmZzZXQoeE9mZnNldCkge1xuICAgIHRoaXMuc2V0KCd4T2Zmc2V0JywgeE9mZnNldCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBNYXAjeFNjYWxlXG4gICAqL1xuICBnZXQgeFNjYWxlKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgneFNjYWxlJywgbnVsbClcbiAgfVxuICBzZXQgeFNjYWxlKHhTY2FsZSkge1xuICAgIHRoaXMuc2V0KCd4U2NhbGUnLCB4U2NhbGUsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgTWFwI3lPZmZzZXRcbiAgICovXG4gIGdldCB5T2Zmc2V0KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgneU9mZnNldCcsIG51bGwpXG4gIH1cbiAgc2V0IHlPZmZzZXQoeU9mZnNldCkge1xuICAgIHRoaXMuc2V0KCd5T2Zmc2V0JywgeU9mZnNldCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBNYXAjeVNjYWxlXG4gICAqL1xuICBnZXQgeVNjYWxlKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgneVNjYWxlJywgbnVsbClcbiAgfVxuICBzZXQgeVNjYWxlKHlTY2FsZSkge1xuICAgIHRoaXMuc2V0KCd5U2NhbGUnLCB5U2NhbGUsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtBcnJheX0gICBNYXAjbWFwTGFiZWxzXG4gICAqL1xuICBnZXQgbWFwTGFiZWxzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbWFwTGFiZWxzJywgW10pXG4gIH1cbiAgc2V0IG1hcExhYmVscyhtYXBMYWJlbHMpIHtcbiAgICB0aGlzLnNldCgnbWFwTGFiZWxzJywgbWFwTGFiZWxzLCBBcnJheSwgW10pXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcCNzdmdcbiAgICovXG4gIGdldCBzdmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdzdmcnLCAnJylcbiAgfVxuICBzZXQgc3ZnKHN2Zykge1xuICAgIHRoaXMuc2V0KCdzdmcnLCBzdmcsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcCNzdmdUcmVlXG4gICAqL1xuICBnZXQgc3ZnVHJlZSgpIHtcbiAgICBsZXQgdHJlZSA9IHRoaXMuZ2V0KCdzdmdUcmVlJywgbnVsbClcbiAgICByZXR1cm4gdHJlZSAvLz8gdHJlZS5kb2N1bWVudEVsZW1lbnQgOiB0cmVlXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgTWFwI2xib3hlc1xuICAgKi9cbiAgZ2V0IGxib3hlcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2xib3hlcycsIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge0FycmF5fSAgIE1hcCN3YXlwb2ludHNcbiAgICovXG4gIGdldCB3YXlwb2ludHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd3YXlwb2ludHMnLCBbXSlcbiAgfVxuICBzZXQgd2F5cG9pbnRzKHdheXBvaW50cykge1xuICAgIHRoaXMuc2V0KCd3YXlwb2ludHMnLCB3YXlwb2ludHMsIEFycmF5LCBbXSlcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwXG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IE1hcF8gPSByZXF1aXJlKCcuL01hcCcpXG5jb25zdCBXYXlwb2ludCA9IHJlcXVpcmUoJy4uL1dheXBvaW50L1dheXBvaW50JylcbiAgLyoqIENsYXNzIHJlcHJlc2VudGluZyBhbiBjb2xsZWN0aW9uIG9mIE1hcHMuICovXG5jbGFzcyBNYXBDb2xsZWN0aW9uIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29sbGVjdGlvbiBvZiBNYXBzLlxuICAgKiBAcGFyYW0ge0RPTVBhcnNlcn0geG1sUGFyc2VyIC0gWE1MIERPTSBwYXJzZXIgd2luZG93LkRPTVBhcnNlciBmb3IgYnJvd3NlciBvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS94bWxkb21cbiAgICogQHRocm93cyB7VHlwZUVycm9yfSAtIE5vIFhNTCBwYXJzZXIgcHJvdmlkZWQuIE1hcC5zdmdUcmVlICYgVGV4dCBEaXJlY3Rpb25zIHdpbGwgbm90IGJlIGF2YWlsYWJsZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHhtbFBhcnNlcikge1xuICAgIHRoaXMuX2l0ZW1zID0gW11cblxuICAgIC8vU2V0IFNWRyBYTUwgcGFyc2VyXG4gICAgaWYoeG1sUGFyc2VyKSB7XG4gICAgICB0aGlzLkRPTVBhcnNlciA9IHhtbFBhcnNlclxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNYXBDb2xsZWN0aW9uIDo6IE5vIFhNTCBwYXJzZXIgcHJvdmlkZWQuIE1hcC5zdmdUcmVlICYgVGV4dCBEaXJlY3Rpb25zIHdpbGwgbm90IGJlIGF2YWlsYWJsZScpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciB3ZWF0aGVyIG9yIG5vdCBhcmd1bWVudCBpcyBjb25zdHJ1Y3RlZCBhcyBhbiBNYXAgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIC0gSXRlbSB0byBldmFsdWF0ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBCb29sZWFuIGJhc2VkIG9uIGV2YWx1YXRpb24gcmVzdWx0XG4gICAqL1xuICBpc01hcChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0gJiYgaXRlbS5jb25zdHJ1Y3RvciA9PT0gTWFwX1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciB3ZWF0aGVyIG9yIG5vdCBhcmd1bWVudCBpcyBjb25zdHJ1Y3RlZCBhcyBhbiBXYXlwb2ludCBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gLSBJdGVtIHRvIGV2YWx1YXRlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IEJvb2xlYW4gYmFzZWQgb24gZXZhbHVhdGlvbiByZXN1bHRcbiAgICovXG4gIGlzV2F5cG9pbnQoaXRlbSkge1xuICAgIHJldHVybiBpdGVtICYmIGl0ZW0uY29uc3RydWN0b3IgPT09IFdheXBvaW50XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBzaW5nbGUgb3IgYW4gYXJyYXkgb2YgZGV2aWNlcyBiYXNlZCBvbiB0aGUgaW5wdXQgbW9kZWwgZGF0YVxuICAgKiBAcGFyYW0ge0FycmF5L01hcH0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICogQHJldHVybiB7QXJyYXkvTWFwfSBBIGNyZWF0ZWQgTWFwIGluc3RhbmNlIG9yIGFuIGFycmF5IG9mIE1hcCBpbnN0YW5jZXNcbiAgICovXG4gIGNyZWF0ZShtb2RlbCkge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGlmKG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmVzID0gbW9kZWwubWFwKG0gPT4gbmV3IE1hcF8obSwgdGhpcy5ET01QYXJzZXIpKVxuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuX2l0ZW1zLmNvbmNhdChyZXMpXG4gICAgICB9IGVsc2UgaWYobW9kZWwuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICByZXMgPSBuZXcgTWFwXyhtb2RlbCwgdGhpcy5ET01QYXJzZXIpXG4gICAgICAgIHRoaXMuX2l0ZW1zLnB1c2gocmVzKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBNYXAgb2JqZWN0c1xuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGdldEFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgTWFwIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggZmxvb3JTZXF1ZW5jZVxuICAgKiBAcGFyYW0ge051bWJlcn0gZmxvb3JTZXF1ZW5jZSAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBNYXBzIGZsb29yU2VxdWVuY2VcbiAgICogQHJldHVybiB7TWFwfVxuICAgKi9cbiAgZ2V0QnlGbG9vclNlcXVlbmNlKGZsb29yU2VxdWVuY2UpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChtID0+IG0uZmxvb3JTZXF1ZW5jZSA9PT0gZmxvb3JTZXF1ZW5jZSkgfHwgbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBNYXAgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCBsb2NhdGlvbklkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsb2NhdGlvbklkIC0gTnVtYmVyIHJlcHJlc2VudGluZyBlYWNoIE1hcHMgbG9jYXRpb25JZFxuICAgKiBAcmV0dXJuIHtNYXB9XG4gICAqL1xuICBnZXRCeUxvY2F0aW9uSWQobG9jYXRpb25JZCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maW5kKG0gPT4gbS5sb2NhdGlvbklkID09PSBsb2NhdGlvbklkKSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IE1hcCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIG1hcElkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtYXBJZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBNYXBzIG1hcElkXG4gICAqIEByZXR1cm4ge01hcH1cbiAgICovXG4gIGdldEJ5TWFwSWQobWFwSWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChtID0+IG0ubWFwSWQgPT09IG1hcElkKSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc2V0IG9mIE1hcCBvYmplY3RzIGFzc29jaWF0ZWQgd2l0aCBEZXN0aW5hdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVzdGluYXRpb25JZCAtIE51bWJlciByZXByZXNlbnRpbmcgYSAjRGVzdGluYXRpb24gaWRcbiAgICogQHJldHVybiB7QXJyYXkvTWFwfVxuICAgKi9cbiAgZ2V0QnlEZXN0aW5hdGlvbklkKGRlc3RpbmF0aW9uSWQpIHtcbiAgICBsZXQgd2F5cG9pbnRzID0gdGhpcy5nZXRXYXlwb2ludHNCeURlc3RpbmF0aW9uSWQoZGVzdGluYXRpb25JZClcbiAgICByZXR1cm4gd2F5cG9pbnRzLm1hcCh3cCA9PiB0aGlzLmdldEJ5TWFwSWQod3AubWFwSWQpKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgV2F5cG9pbnQgYXNzb2NpYXRlZCB3aXRoIG1hcElkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtYXBJZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBNYXBzIG1hcElkXG4gICAqIEByZXR1cm4ge0FycmF5L1dheXBvaW50fVxuICAgKi9cbiAgZ2V0V2F5cG9pbnRzQnlNYXBJZChtYXBJZCkge1xuICAgIGxldCBtYXAgPSB0aGlzLmdldEJ5TWFwSWQobWFwSWQpXG4gICAgcmV0dXJuIG1hcCAmJiBtYXAuV2F5cG9pbnRDb2xsZWN0aW9uID8gbWFwLldheXBvaW50Q29sbGVjdGlvbi5nZXRBbGwoKSA6IFtdXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBXYXlwb2ludCBhc3NvY2lhdGVkIHdpdGggTWFwQ29sbGVjdGlvblxuICAgKiBAcmV0dXJuIHtBcnJheS9XYXlwb2ludH1cbiAgICovXG4gIGdldEFsbFdheXBvaW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMucmVkdWNlKCh3cHMsIG1hcCkgPT4ge1xuICAgICAgcmV0dXJuIG1hcCAmJiBtYXAuV2F5cG9pbnRDb2xsZWN0aW9uID8gd3BzLmNvbmNhdChtYXAuV2F5cG9pbnRDb2xsZWN0aW9uLmdldEFsbCgpKSA6IHdwc1xuICAgIH0sIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgV2F5cG9pbnQgYXNzb2NpYXRlZCB3aXRoIGEgRGVzdGluYXRpb25cbiAgICogQHJldHVybiB7QXJyYXkvV2F5cG9pbnR9XG4gICAqL1xuICBnZXRXYXlwb2ludHNXaXRoRGVzdGluYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsV2F5cG9pbnRzKCkuZmlsdGVyKCh3cCkgPT4ge1xuICAgICAgcmV0dXJuIHdwLkFzc29jaWF0aW9uQ29sbGVjdGlvbi5nZXRCeUVudGl0eVR5cGVJZCgxKS5sZW5ndGhcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgV2F5cG9pbnQgYXNzb2NpYXRlZCB3aXRoIGEgQW1lbml0eVxuICAgKiBAcmV0dXJuIHtBcnJheS9XYXlwb2ludH1cbiAgICovXG4gIGdldFdheXBvaW50c1dpdGhBbWVuaXR5KCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFdheXBvaW50cygpLmZpbHRlcigod3ApID0+IHtcbiAgICAgIHJldHVybiB3cC5Bc3NvY2lhdGlvbkNvbGxlY3Rpb24uZ2V0QnlFbnRpdHlUeXBlSWQoMjYpLmxlbmd0aFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc2luZ2xlIFdheXBvaW50IGFzc29jaWF0ZWQgYSB3YXlwb2ludCBpZFxuICAgKiBAcGFyYW0ge051bWJlcn0gd2F5cG9pbnRJZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBXYXlwb2ludCBpZFxuICAgKiBAcmV0dXJuIHtXYXlwb2ludH1cbiAgICovXG4gIGdldFdheXBvaW50QnlXYXlwb2ludElkKHdheXBvaW50SWQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxXYXlwb2ludHMoKS5maW5kKHdwID0+IHdwLmlkID09PSB3YXlwb2ludElkKSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc2V0IG9mIFdheXBvaW50cyBhc3NvY2lhdGVkIGEgZGVzdGluYXRpb24gaWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlc3RpbmF0aW9uSWQgLSBOdW1iZXIgcmVwcmVzZW50aW5nIGVhY2ggRGVzdGluYXRpb24gaWRcbiAgICogQHJldHVybiB7QXJyYXkvV2F5cG9pbnR9XG4gICAqL1xuICBnZXRXYXlwb2ludHNCeURlc3RpbmF0aW9uSWQoZGVzdGluYXRpb25JZCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFdheXBvaW50cygpLmZpbHRlcigod3ApID0+IHtcbiAgICAgIHJldHVybiB3cC5Bc3NvY2lhdGlvbkNvbGxlY3Rpb24uZ2V0QWxsKCkuZmluZChhID0+IGEuZW50aXR5SWQgPT09IGRlc3RpbmF0aW9uSWQpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIE1hcExhYmVsIGFzc29jaWF0ZWQgd2l0aCBtYXBJZFxuICAgKiBAcGFyYW0ge051bWJlcn0gbWFwSWQgLSBOdW1iZXIgcmVwcmVzZW50aW5nIGVhY2ggTWFwcyBtYXBJZFxuICAgKiBAcmV0dXJuIHtNYXB9XG4gICAqL1xuICBnZXRNYXBMYWJlbHNCeU1hcElkKG1hcElkKSB7XG4gICAgbGV0IG1hcCA9IHRoaXMuZ2V0QnlNYXBJZChtYXBJZClcbiAgICByZXR1cm4gbWFwICYmIG1hcC5NYXBMYWJlbENvbGxlY3Rpb24gPyBtYXAuTWFwTGFiZWxDb2xsZWN0aW9uLmdldEFsbCgpIDogW11cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIE1hcExhYmVsIGFzc29jaWF0ZWQgd2l0aCBNYXBDb2xsZWN0aW9uXG4gICAqIEByZXR1cm4ge0FycmF5L01hcExhYmVsfVxuICAgKi9cbiAgZ2V0QWxsTWFwTGFiZWxzKCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5yZWR1Y2UoKGxhYmVsLCBtYXApID0+IHtcbiAgICAgIHJldHVybiBtYXAgJiYgbWFwLk1hcExhYmVsQ29sbGVjdGlvbiA/IGxhYmVsLmNvbmNhdChtYXAuTWFwTGFiZWxDb2xsZWN0aW9uLmdldEFsbCgpKSA6IGxhYmVsXG4gICAgfSwgW10pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBEZXN0aW5hdGlvbkxhYmVsIGFzc29jaWF0ZWQgd2l0aCBtYXBJZFxuICAgKiBAcGFyYW0ge051bWJlcn0gbWFwSWQgLSBOdW1iZXIgcmVwcmVzZW50aW5nIGVhY2ggTWFwcyBtYXBJZFxuICAgKiBAcmV0dXJuIHtNYXB9XG4gICAqL1xuICBnZXREZXN0aW5hdGlvbkxhYmVsc0J5TWFwSWQobWFwSWQpIHtcbiAgICBsZXQgbWFwID0gdGhpcy5nZXRCeU1hcElkKG1hcElkKVxuICAgIHJldHVybiBtYXAgJiYgbWFwLkRlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9uID8gbWFwLkRlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9uLmdldEFsbCgpIDogW11cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIERlc3RpbmF0aW9uTGFiZWwgYXNzb2NpYXRlZCB3aXRoIE1hcENvbGxlY3Rpb25cbiAgICogQHJldHVybiB7QXJyYXkvRGVzdGluYXRpb25MYWJlbH1cbiAgICovXG4gIGdldEFsbERlc3RpbmF0aW9uTGFiZWxzKCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5yZWR1Y2UoKGxhYmVsLCBtYXApID0+IHtcbiAgICAgIHJldHVybiBtYXAgJiYgbWFwLkRlc3RpbmF0aW9uTGFiZWxDb2xsZWN0aW9uID8gbGFiZWwuY29uY2F0KG1hcC5EZXN0aW5hdGlvbkxhYmVsQ29sbGVjdGlvbi5nZXRBbGwoKSkgOiBsYWJlbFxuICAgIH0sIFtdKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDb2xsZWN0aW9uXG4iLCIndXNlIHN0cmljdCdcbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gTWFwTGFiZWwuICovXG5jbGFzcyBNYXBMYWJlbCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBNYXBMYWJlbC5cbiAgICogQHBhcmFtIHtvYmplY3R9IG1vZGVsIC0gVGhlIG1vZGVsIG9iamVjdCBwYXNzZWQgYmFjayBmcm9tIHRoZSAvZnVsbCBwYXlsb2FkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihtb2RlbCkge1xuICAgIHRoaXMuXyA9IHt9XG4gICAgZm9yKHZhciBwcm9wZXJ0eSBpbiBtb2RlbCkge1xuICAgICAgaWYobW9kZWwuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgIHRoaXMuX1twcm9wZXJ0eV0gPSBtb2RlbFtwcm9wZXJ0eV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQocHJvcCwgX2RlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5fW3Byb3BdICE9PSB1bmRlZmluZWQgPyB0aGlzLl9bcHJvcF0gOiBfZGVmYXVsdFxuICB9XG5cbiAgc2V0KHByb3AsIHZhbHVlLCBjb25zdHJ1Y3RvciwgX2RlZmF1bHQpIHtcbiAgICBpZih2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gY29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IF9kZWZhdWx0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBEZXZpY2UjY2tcbiAgICovXG4gIGdldCBjaygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NrJywgJycpXG4gIH1cbiAgc2V0IGNrKGNrKSB7XG4gICAgdGhpcy5zZXQoJ2NrJywgY2ssIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIE1hcExhYmVsI2NvbXBvbmVudElkXG4gICAqL1xuICBnZXQgY29tcG9uZW50SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb21wb25lbnRJZCcsIG51bGwpXG4gIH1cbiAgc2V0IGNvbXBvbmVudElkKGNvbXBvbmVudElkKSB7XG4gICAgdGhpcy5zZXQoJ2NvbXBvbmVudElkJywgY29tcG9uZW50SWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgTWFwTGFiZWwjY29tcG9uZW50VHlwZU5hbWVcbiAgICovXG4gIGdldCBjb21wb25lbnRUeXBlTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NvbXBvbmVudFR5cGVOYW1lJywgJycpXG4gIH1cbiAgc2V0IGNvbXBvbmVudFR5cGVOYW1lKGNvbXBvbmVudFR5cGVOYW1lKSB7XG4gICAgdGhpcy5zZXQoJ2NvbXBvbmVudFR5cGVOYW1lJywgY29tcG9uZW50VHlwZU5hbWUsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcExhYmVsI2Rlc2NyaXB0aW9uXG4gICAqL1xuICBnZXQgZGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZXNjcmlwdGlvbicsICcnKVxuICB9XG4gIHNldCBkZXNjcmlwdGlvbihkZXNjcmlwdGlvbikge1xuICAgIHRoaXMuc2V0KCdkZXNjcmlwdGlvbicsIGRlc2NyaXB0aW9uLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBNYXBMYWJlbCNsYWJlbFxuICAgKi9cbiAgZ2V0IGxhYmVsKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbGFiZWwnLCAnJylcbiAgfVxuICBzZXQgbGFiZWwobGFiZWwpIHtcbiAgICB0aGlzLnNldCgnbGFiZWwnLCBsYWJlbCwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgTWFwTGFiZWwjbG9jYWxpemVkVGV4dFxuICAgKi9cbiAgZ2V0IGxvY2FsaXplZFRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdsb2NhbGl6ZWRUZXh0JywgJycpXG4gIH1cbiAgc2V0IGxvY2FsaXplZFRleHQobG9jYWxpemVkVGV4dCkge1xuICAgIHRoaXMuc2V0KCdsb2NhbGl6ZWRUZXh0JywgbG9jYWxpemVkVGV4dCwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgTWFwTGFiZWwjbG9jYXRpb25JZFxuICAgKi9cbiAgZ2V0IGxvY2F0aW9uSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdsb2NhdGlvbklkJywgbnVsbClcbiAgfVxuICBzZXQgbG9jYXRpb25JZChsb2NhdGlvbklkKSB7XG4gICAgdGhpcy5zZXQoJ2xvY2F0aW9uSWQnLCBsb2NhdGlvbklkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcExhYmVsI2xvY2F0aW9uWFxuICAgKi9cbiAgZ2V0IGxvY2F0aW9uWCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2xvY2F0aW9uWCcsICcnKVxuICB9XG4gIHNldCBsb2NhdGlvblgobG9jYXRpb25YKSB7XG4gICAgdGhpcy5zZXQoJ2xvY2F0aW9uWCcsIGxvY2F0aW9uWCwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgTWFwTGFiZWwjbG9jYXRpb25ZXG4gICAqL1xuICBnZXQgbG9jYXRpb25ZKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbG9jYXRpb25ZJywgJycpXG4gIH1cbiAgc2V0IGxvY2F0aW9uWShsb2NhdGlvblkpIHtcbiAgICB0aGlzLnNldCgnbG9jYXRpb25ZJywgbG9jYXRpb25ZLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBNYXBMYWJlbCNtYXBJZFxuICAgKi9cbiAgZ2V0IG1hcElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbWFwSWQnLCBudWxsKVxuICB9XG4gIHNldCBtYXBJZChtYXBJZCkge1xuICAgIHRoaXMuc2V0KCdtYXBJZCcsIG1hcElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIE1hcExhYmVsI3Byb2plY3RJZFxuICAgKi9cbiAgZ2V0IHByb2plY3RJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Byb2plY3RJZCcsIG51bGwpXG4gIH1cbiAgc2V0IHByb2plY3RJZChwcm9qZWN0SWQpIHtcbiAgICB0aGlzLnNldCgncHJvamVjdElkJywgcHJvamVjdElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIE1hcExhYmVsI3JvdGF0aW9uXG4gICAqL1xuICBnZXQgcm90YXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdyb3RhdGlvbicsICcnKVxuICB9XG4gIHNldCByb3RhdGlvbihyb3RhdGlvbikge1xuICAgIHRoaXMuc2V0KCdyb3RhdGlvbicsIHJvdGF0aW9uLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBNYXBMYWJlbCN0eXBlSWRcbiAgICovXG4gIGdldCB0eXBlSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd0eXBlSWQnLCBudWxsKVxuICB9XG4gIHNldCB0eXBlSWQodHlwZUlkKSB7XG4gICAgdGhpcy5zZXQoJ3R5cGVJZCcsIHR5cGVJZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBNYXBMYWJlbCN6b29tbGV2ZWxcbiAgICovXG4gIGdldCB6b29tbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd6b29tbGV2ZWwnLCBudWxsKVxuICB9XG4gIHNldCB6b29tbGV2ZWwoem9vbWxldmVsKSB7XG4gICAgdGhpcy5zZXQoJ3pvb21sZXZlbCcsIHpvb21sZXZlbCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBMYWJlbFxuIiwiJ3VzZSBzdHJpY3QnXG5jb25zdCBNYXBMYWJlbCA9IHJlcXVpcmUoJy4vTWFwTGFiZWwnKVxuICAvKiogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIGNvbGxlY3Rpb24gb2YgTWFwTGFiZWxzLiAqL1xuY2xhc3MgTWFwTGFiZWxDb2xsZWN0aW9uIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29sbGVjdGlvbiBvZiBNYXBMYWJlbHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pdGVtcyA9IFtdXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIHdlYXRoZXIgb3Igbm90IGFyZ3VtZW50IGlzIGNvbnN0cnVjdGVkIGFzIGFuIE1hcExhYmVsIG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSAtIEl0ZW0gdG8gZXZhbHVhdGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gQm9vbGVhbiBiYXNlZCBvbiBldmFsdWF0aW9uIHJlc3VsdFxuICAgKi9cbiAgaXNNYXBMYWJlbChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0gJiYgaXRlbS5jb25zdHJ1Y3RvciA9PT0gTWFwTGFiZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHNpbmdsZSBvciBhbiBhcnJheSBvZiBkZXZpY2VzIGJhc2VkIG9uIHRoZSBpbnB1dCBtb2RlbCBkYXRhXG4gICAqIEBwYXJhbSB7QXJyYXkvTWFwTGFiZWx9IG1vZGVsIC0gVGhlIG1vZGVsIG9iamVjdCBwYXNzZWQgYmFjayBmcm9tIHRoZSAvZnVsbCBwYXlsb2FkXG4gICAqIEByZXR1cm4ge0FycmF5L01hcExhYmVsfSBBIGNyZWF0ZWQgTWFwTGFiZWwgaW5zdGFuY2Ugb3IgYW4gYXJyYXkgb2YgTWFwTGFiZWwgaW5zdGFuY2VzXG4gICAqL1xuICBjcmVhdGUobW9kZWwpIHtcbiAgICBsZXQgcmVzID0gbnVsbDtcbiAgICBpZihtb2RlbCkge1xuICAgICAgaWYobW9kZWwuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgIHJlcyA9IG1vZGVsLm1hcChtID0+IG5ldyBNYXBMYWJlbChtKSlcbiAgICAgICAgdGhpcy5faXRlbXMgPSB0aGlzLl9pdGVtcy5jb25jYXQocmVzKVxuICAgICAgfSBlbHNlIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgcmVzID0gbmV3IE1hcExhYmVsKG1vZGVsKVxuICAgICAgICB0aGlzLl9pdGVtcy5wdXNoKHJlcylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgTWFwTGFiZWwgb2JqZWN0c1xuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGdldEFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXNcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwTGFiZWxDb2xsZWN0aW9uXG4iLCIndXNlIHN0cmljdCdcbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBQYXRoLiAqL1xuY2xhc3MgUGF0aCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gUGF0aC5cbiAgICogQHBhcmFtIHtvYmplY3R9IG1vZGVsIC0gVGhlIG1vZGVsIG9iamVjdCBwYXNzZWQgYmFjayBmcm9tIHRoZSAvZnVsbCBwYXlsb2FkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihtb2RlbCkge1xuICAgIHRoaXMuXyA9IHt9XG4gICAgZm9yKHZhciBwcm9wZXJ0eSBpbiBtb2RlbCkge1xuICAgICAgaWYobW9kZWwuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgIHRoaXMuX1twcm9wZXJ0eV0gPSBtb2RlbFtwcm9wZXJ0eV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQocHJvcCwgX2RlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5fW3Byb3BdICE9PSB1bmRlZmluZWQgPyB0aGlzLl9bcHJvcF0gOiBfZGVmYXVsdFxuICB9XG5cbiAgc2V0KHByb3AsIHZhbHVlLCBjb25zdHJ1Y3RvciwgX2RlZmF1bHQpIHtcbiAgICBpZih2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gY29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX1twcm9wXSA9IF9kZWZhdWx0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge0Jvb2xlYW59ICAgUGF0aCNkZWZhdWx0V2VpZ2h0XG4gICAqL1xuICBnZXQgZGVmYXVsdFdlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2RlZmF1bHRXZWlnaHQnLCBmYWxzZSlcbiAgfVxuICBzZXQgZGVmYXVsdFdlaWdodChkZWZhdWx0V2VpZ2h0KSB7XG4gICAgdGhpcy5zZXQoJ2RlZmF1bHRXZWlnaHQnLCBkZWZhdWx0V2VpZ2h0LCBCb29sZWFuLCBmYWxzZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgUGF0aCNkaXJlY3Rpb25cbiAgICovXG4gIGdldCBkaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkaXJlY3Rpb24nLCBudWxsKVxuICB9XG4gIHNldCBkaXJlY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5zZXQoJ2RpcmVjdGlvbicsIGRpcmVjdGlvbiwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBQYXRoI2lkXG4gICAqL1xuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpZCcsIG51bGwpXG4gIH1cbiAgc2V0IGlkKGlkKSB7XG4gICAgdGhpcy5zZXQoJ2lkJywgaWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgUGF0aCNsb2NhbElkXG4gICAqL1xuICBnZXQgbG9jYWxJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2xvY2FsSWQnLCBudWxsKVxuICB9XG4gIHNldCBsb2NhbElkKGxvY2FsSWQpIHtcbiAgICB0aGlzLnNldCgnbG9jYWxJZCcsIGxvY2FsSWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgUGF0aCNuYW1lXG4gICAqL1xuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ25hbWUnLCAnJylcbiAgfVxuICBzZXQgbmFtZShuYW1lKSB7XG4gICAgdGhpcy5zZXQoJ25hbWUnLCBuYW1lLCBTdHJpbmcsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBQYXRoI3N0YXR1c1xuICAgKi9cbiAgZ2V0IHN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3N0YXR1cycsIG51bGwpXG4gIH1cbiAgc2V0IHN0YXR1cyhzdGF0dXMpIHtcbiAgICB0aGlzLnNldCgnc3RhdHVzJywgc3RhdHVzLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFBhdGgjdHlwZVxuICAgKi9cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd0eXBlJywgbnVsbClcbiAgfVxuICBzZXQgdHlwZSh0eXBlKSB7XG4gICAgdGhpcy5zZXQoJ3R5cGUnLCB0eXBlLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgUGF0aCN3YXlwb2ludHNcbiAgICovXG4gIGdldCB3YXlwb2ludHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd3YXlwb2ludHMnLCBbXSlcbiAgfVxuICBzZXQgd2F5cG9pbnRzKHdheXBvaW50cykge1xuICAgIHRoaXMuc2V0KCd3YXlwb2ludHMnLCB3YXlwb2ludHMsIEFycmF5LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgUGF0aCN3ZWlnaHRcbiAgICovXG4gIGdldCB3ZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd3ZWlnaHQnLCBudWxsKVxuICB9XG4gIHNldCB3ZWlnaHQod2VpZ2h0KSB7XG4gICAgdGhpcy5zZXQoJ3dlaWdodCcsIHdlaWdodCwgTnVtYmVyLCBudWxsKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGF0aFxuIiwiJ3VzZSBzdHJpY3QnXG5jb25zdCBQYXRoID0gcmVxdWlyZSgnLi9QYXRoJylcbiAgLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIGNvbGxlY3Rpb24gb2YgUGF0aHMuICovXG5jbGFzcyBQYXRoQ29sbGVjdGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb2xsZWN0aW9uIG9mIFBhdGhzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5faXRlbXMgPSBbXVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciB3ZWF0aGVyIG9yIG5vdCBhcmd1bWVudCBpcyBjb25zdHJ1Y3RlZCBhcyBhbiBQYXRoIG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSAtIEl0ZW0gdG8gZXZhbHVhdGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gQm9vbGVhbiBiYXNlZCBvbiBldmFsdWF0aW9uIHJlc3VsdFxuICAgKi9cbiAgaXNQYXRoKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAmJiBpdGVtLmNvbnN0cnVjdG9yID09PSBQYXRoXG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBzaW5nbGUgb3IgYW4gYXJyYXkgb2YgcGF0aHMgYmFzZWQgb24gdGhlIGlucHV0IG1vZGVsIGRhdGFcbiAgICogQHBhcmFtIHtBcnJheS9QYXRofSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKiBAcmV0dXJuIHtBcnJheS9QYXRofSBBIGNyZWF0ZWQgUGF0aCBpbnN0YW5jZSBvciBhbiBhcnJheSBvZiBQYXRoIGluc3RhbmNlc1xuICAgKi9cbiAgY3JlYXRlKG1vZGVsKSB7XG4gICAgbGV0IHJlcyA9IG51bGw7XG4gICAgaWYobW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICByZXMgPSBtb2RlbC5tYXAobSA9PiBuZXcgUGF0aChtKSlcbiAgICAgICAgdGhpcy5faXRlbXMgPSB0aGlzLl9pdGVtcy5jb25jYXQocmVzKVxuICAgICAgfSBlbHNlIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgcmVzID0gbmV3IFBhdGgobW9kZWwpXG4gICAgICAgIHRoaXMuX2l0ZW1zLnB1c2gocmVzKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBQYXRoIG9iamVjdHNcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBQYXRoIG9iamVjdHMgYXNzb2NpYXRlZCB3aXRoIHNwZWNpZmVkIGRpcmVjdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gZGlyZWN0aW9uIC0gVGhlIE51bWJlciB1c2VkIHRvIGRlZmluZSBhIHBhdGggZGlyZWN0aW9uXG4gICAqIEByZXR1cm4ge0FycmF5L1BhdGh9XG4gICAqL1xuICBnZXRCeURpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKHAgPT4gcC5kaXJlY3Rpb24gPT09IGRpcmVjdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgUGF0aCBhc3NvY2lhdGVkIHdpdGggc3BlY2lmZWQgaWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkIC0gVGhlIE51bWJlciB1c2VkIHRvIGRlZmluZSBhIHBhdGggaWRcbiAgICogQHJldHVybiB7UGF0aH1cbiAgICovXG4gIGdldEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChwID0+IHAuaWQgPT09IGlkKSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IFBhdGggYXNzb2NpYXRlZCB3aXRoIHNwZWNpZmVkIG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgU3RyaW5nIHVzZWQgdG8gZGVmaW5lIGEgcGF0aCBuYW1lXG4gICAqIEByZXR1cm4ge1BhdGh9XG4gICAqL1xuICBnZXRCeU5hbWUobmFtZSkge1xuICAgIGlmKG5hbWUgJiYgbmFtZS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChwID0+IHAubmFtZS50b0xvd2VyQ2FzZSgpID09IG5hbWUudG9Mb3dlckNhc2UoKSkgfHwgbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgUGF0aHMgYXNzb2NpYXRlZCB3aXRoIHNwZWNpZmVkIHN0YXR1c1xuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RhdHVzIC0gVGhlIFN0cmluZyB1c2VkIHRvIGRlZmluZSBhIHBhdGggc3RhdHVzXG4gICAqIEByZXR1cm4ge0FycmF5L1BhdGh9XG4gICAqL1xuICBnZXRCeVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKHAgPT4gcC5zdGF0dXMgPT09IHN0YXR1cylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgUGF0aHMgYXNzb2NpYXRlZCB3aXRoIHNwZWNpZmVkIHR5cGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHR5cGUgLSBUaGUgTnVtYmVyIHVzZWQgdG8gZGVmaW5lIGEgcGF0aCB0eXBlXG4gICAqIEByZXR1cm4ge0FycmF5L1BhdGh9XG4gICAqL1xuICBnZXRCeVR5cGUodHlwZSkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIocCA9PiBwLnR5cGUgPT09IHR5cGUpXG4gIH1cblxuICAvKipcbiAgICogR2V0IFBhdGhzIGFzc29jaWF0ZWQgd2l0aCBzcGVjaWZlZCB3YXlwb2ludElkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB3YXlwb2ludElkIC0gVGhlIE51bWJlciB1c2VkIHRvIGRlZmluZSBhIHBhdGggd2F5cG9pbnRJZFxuICAgKiBAcmV0dXJuIHtBcnJheS9QYXRofVxuICAgKi9cbiAgZ2V0QnlXYXlwb2ludElkKHdheXBvaW50SWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKChwKSA9PiB7XG4gICAgICByZXR1cm4gcC53YXlwb2ludHMuZmluZCh3cCA9PiB3cCA9PT0gd2F5cG9pbnRJZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBQYXRocyBhc3NvY2lhdGVkIHdpdGggc3BlY2lmZWQgd2VpZ2h0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSB3ZWlnaHQgLSBUaGUgTnVtYmVyIHVzZWQgdG8gZGVmaW5lIGEgcGF0aCB3ZWlnaHRcbiAgICogQHJldHVybiB7QXJyYXkvUGF0aH1cbiAgICovXG4gIGdldEJ5V2VpZ2h0KHdlaWdodCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcy5maWx0ZXIocCA9PiBwLndlaWdodCA9PT0gd2VpZ2h0KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoQ29sbGVjdGlvblxuIiwiJ3VzZSBzdHJpY3QnXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGEgUGF0aFR5cGUuICovXG5jbGFzcyBQYXRoVHlwZSB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gUGF0aFR5cGUuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKi9cbiAgY29uc3RydWN0b3IobW9kZWwpIHtcbiAgICB0aGlzLl8gPSB7fVxuICAgIGZvcih2YXIgcHJvcGVydHkgaW4gbW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICB0aGlzLl9bcHJvcGVydHldID0gbW9kZWxbcHJvcGVydHldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0KHByb3AsIF9kZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuX1twcm9wXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fW3Byb3BdIDogX2RlZmF1bHRcbiAgfVxuXG4gIHNldChwcm9wLCB2YWx1ZSwgY29uc3RydWN0b3IsIF9kZWZhdWx0KSB7XG4gICAgaWYodmFsdWUuY29uc3RydWN0b3IgPT09IGNvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSBfZGVmYXVsdFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgUGF0aFR5cGUjYWNjZXNzaWJpbGl0eVxuICAgKi9cbiAgZ2V0IGFjY2Vzc2liaWxpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdhY2Nlc3NpYmlsaXR5JywgbnVsbClcbiAgfVxuXG4gIHNldCBhY2Nlc3NpYmlsaXR5KGFjY2Vzc2liaWxpdHkpIHtcbiAgICB0aGlzLnNldCgnYWNjZXNzaWJpbGl0eScsIGFjY2Vzc2liaWxpdHksIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgUGF0aFR5cGUjZGVzY3JpcHRpb25cbiAgICovXG4gIGdldCBkZXNjcmlwdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2Rlc2NyaXB0aW9uJywgJycpXG4gIH1cblxuICBzZXQgZGVzY3JpcHRpb24oZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnNldCgnZGVzY3JpcHRpb24nLCBkZXNjcmlwdGlvbiwgU3RyaW5nLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgUGF0aFR5cGUjZGlyZWN0aW9uXG4gICAqL1xuICBnZXQgZGlyZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGlyZWN0aW9uJywgbnVsbClcbiAgfVxuXG4gIHNldCBkaXJlY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5zZXQoJ2RpcmVjdGlvbicsIGRpcmVjdGlvbiwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBQYXRoVHlwZSNtYXhmbG9vcnNcbiAgICovXG4gIGdldCBtYXhmbG9vcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdtYXhmbG9vcnMnLCBudWxsKVxuICB9XG5cbiAgc2V0IG1heGZsb29ycyhtYXhmbG9vcnMpIHtcbiAgICB0aGlzLnNldCgnbWF4Zmxvb3JzJywgbWF4Zmxvb3JzLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIFBhdGhUeXBlI21ldGFEYXRhXG4gICAqL1xuICBnZXQgbWV0YURhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdtZXRhRGF0YScsICcnKVxuICB9XG5cbiAgc2V0IG1ldGFEYXRhKG1ldGFEYXRhKSB7XG4gICAgdGhpcy5zZXQoJ21ldGFEYXRhJywgbWV0YURhdGEsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFBhdGhUeXBlI3BhdGhUeXBlSWRcbiAgICovXG4gIGdldCBwYXRoVHlwZUlkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncGF0aFR5cGVJZCcsIG51bGwpXG4gIH1cblxuICBzZXQgcGF0aFR5cGVJZChwYXRoVHlwZUlkKSB7XG4gICAgdGhpcy5zZXQoJ3BhdGhUeXBlSWQnLCBwYXRoVHlwZUlkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFBhdGhUeXBlI3Byb2plY3RJZFxuICAgKi9cbiAgZ2V0IHByb2plY3RJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Byb2plY3RJZCcsIG51bGwpXG4gIH1cblxuICBzZXQgcHJvamVjdElkKHByb2plY3RJZCkge1xuICAgIHRoaXMuc2V0KCdwcm9qZWN0SWQnLCBwcm9qZWN0SWQsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgUGF0aFR5cGUjc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3NwZWVkJywgbnVsbClcbiAgfVxuXG4gIHNldCBzcGVlZChzcGVlZCkge1xuICAgIHRoaXMuc2V0KCdzcGVlZCcsIHNwZWVkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIFBhdGhUeXBlI3R5cGVOYW1lXG4gICAqL1xuICBnZXQgdHlwZU5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd0eXBlTmFtZScsICcnKVxuICB9XG5cbiAgc2V0IHR5cGVOYW1lKHR5cGVOYW1lKSB7XG4gICAgdGhpcy5zZXQoJ3R5cGVOYW1lJywgdHlwZU5hbWUsIFN0cmluZywgJycpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFBhdGhUeXBlI3R5cGVpZFBLXG4gICAqL1xuICBnZXQgdHlwZWlkUEsoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd0eXBlaWRQSycsIG51bGwpXG4gIH1cblxuICBzZXQgdHlwZWlkUEsodHlwZWlkUEspIHtcbiAgICB0aGlzLnNldCgndHlwZWlkUEsnLCB0eXBlaWRQSywgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBQYXRoVHlwZSN3ZWlnaHRcbiAgICovXG4gIGdldCB3ZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd3ZWlnaHQnLCBudWxsKVxuICB9XG5cbiAgc2V0IHdlaWdodCh3ZWlnaHQpIHtcbiAgICB0aGlzLnNldCgnd2VpZ2h0Jywgd2VpZ2h0LCBOdW1iZXIsIG51bGwpXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhUeXBlXG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IFBhdGhUeXBlID0gcmVxdWlyZSgnLi9QYXRoVHlwZScpXG4gIC8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBjb2xsZWN0aW9uIG9mIFBhdGhUeXBlcy4gKi9cbmNsYXNzIFBhdGhUeXBlQ29sbGVjdGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb2xsZWN0aW9uIG9mIFBhdGhUeXBlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2l0ZW1zID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3Igd2VhdGhlciBvciBub3QgYXJndW1lbnQgaXMgY29uc3RydWN0ZWQgYXMgYW4gUGF0aFR5cGUgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIC0gSXRlbSB0byBldmFsdWF0ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBCb29sZWFuIGJhc2VkIG9uIGV2YWx1YXRpb24gcmVzdWx0XG4gICAqL1xuICBpc1BhdGhUeXBlKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAmJiBpdGVtLmNvbnN0cnVjdG9yID09PSBQYXRoVHlwZVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgc2luZ2xlIG9yIGFuIGFycmF5IG9mIHBhdGhUeXBlcyBiYXNlZCBvbiB0aGUgaW5wdXQgbW9kZWwgZGF0YVxuICAgKiBAcGFyYW0ge0FycmF5L1BhdGhUeXBlfSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKiBAcmV0dXJuIHtBcnJheS9QYXRoVHlwZX0gQSBjcmVhdGVkIFBhdGhUeXBlIGluc3RhbmNlIG9yIGFuIGFycmF5IG9mIFBhdGhUeXBlIGluc3RhbmNlc1xuICAgKi9cbiAgY3JlYXRlKG1vZGVsKSB7XG4gICAgbGV0IHJlcyA9IG51bGw7XG4gICAgaWYobW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICByZXMgPSBtb2RlbC5tYXAobSA9PiBuZXcgUGF0aFR5cGUobSkpXG4gICAgICAgIHRoaXMuX2l0ZW1zID0gdGhpcy5faXRlbXMuY29uY2F0KHJlcylcbiAgICAgIH0gZWxzZSBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgIHJlcyA9IG5ldyBQYXRoVHlwZShtb2RlbClcbiAgICAgICAgdGhpcy5faXRlbXMucHVzaChyZXMpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIFBhdGhUeXBlIG9iamVjdHNcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgc2V0IG9mIHBhdGhUeXBlcyBieSBpdHMgcGF0aFR5cGVJZFxuICAgKiBAcGFyYW0ge051bWJlcn0gcGF0aFR5cGVJZCAtIFRoZSBwYXRoVHlwZUlkIHVzZWQgdG8gZGVmaW5lIGEgcGF0aFR5cGVcbiAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IG9mIFBhdGhUeXBlc1xuICAgKi9cbiAgZ2V0QnlQYXRoVHlwZUlkKHBhdGhUeXBlSWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChwYXRoVHlwZSA9PiBwYXRoVHlwZS5wYXRoVHlwZUlkID09PSBwYXRoVHlwZUlkKSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgc2V0IG9mIHBhdGhUeXBlcyBieSBpdHMgZGV2aWNlVHlwZUlkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlTmFtZSAtIFRoZSB0eXBlTmFtZSB1c2VkIHRvIGRlZmluZSBhIFBhdGhUeXBlXG4gICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBvZiBQYXRoVHlwZXNcbiAgICovXG4gIGdldEJ5VHlwZU5hbWUodHlwZU5hbWUpIHtcbiAgICBpZih0eXBlTmFtZSAmJiB0eXBlTmFtZS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlbXMuZmluZChwYXRoVHlwZSA9PiBwYXRoVHlwZS50eXBlTmFtZS50b0xvd2VyQ2FzZSgpID09PSB0eXBlTmFtZS50b0xvd2VyQ2FzZSgpKSB8fCBudWxsXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIHNldCBvZiBQYXRoVHlwZSBieSBpdHMgZGlyZWN0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkaXJlY3Rpb24gLSBUaGUgZGlyZWN0aW9uIHVzZWQgdG8gZGVmaW5lIGEgZGV2aWNlIHR5cGVcbiAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IG9mIFBhdGhUeXBlXG4gICAqL1xuICBnZXRCeURpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKGRldmljZSA9PiBkZXZpY2UuZGlyZWN0aW9uID09PSBkaXJlY3Rpb24pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc29ydGVkIGFycmF5IG9mIFBhdGhUeXBlIGJ5IGFjY2Vzc2liaWxpdHksIGhpZ2hlc3QgdG8gbG93ZXN0XG4gICAqIEByZXR1cm4ge0FycmF5L0Rlc3RpbmF0aW9ufVxuICAgKi9cbiAgc29ydEJ5QWNjZXNzaWJpbGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuKGEuYWNjZXNzaWJpbGl0eSA8IGIuYWNjZXNzaWJpbGl0eSkgPyAxIDogKChiLmFjY2Vzc2liaWxpdHkgPCBhLmFjY2Vzc2liaWxpdHkpID8gLTEgOiAwKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzb3J0ZWQgYXJyYXkgb2YgUGF0aFR5cGUgYnkgd2VpZ2h0LCBoaWdoZXN0IHRvIGxvd2VzdFxuICAgKiBAcmV0dXJuIHtBcnJheS9EZXN0aW5hdGlvbn1cbiAgICovXG4gIHNvcnRCeVdlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuKGEud2VpZ2h0IDwgYi53ZWlnaHQpID8gMSA6ICgoYi53ZWlnaHQgPCBhLndlaWdodCkgPyAtMSA6IDApO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGF0aFR5cGVDb2xsZWN0aW9uXG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IEFzc29jaWF0aW9uQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL0Fzc29jaWF0aW9uL0Fzc29jaWF0aW9uQ29sbGVjdGlvbicpXG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBXYXlwb2ludC4gKi9cbmNsYXNzIFdheXBvaW50IHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIFdheXBvaW50LlxuICAgKiBAcGFyYW0ge29iamVjdH0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1vZGVsKSB7XG4gICAgdGhpcy5fID0ge31cblxuICAgIHRoaXMuQXNzb2NpYXRpb25Db2xsZWN0aW9uID0gbmV3IEFzc29jaWF0aW9uQ29sbGVjdGlvbigpXG5cbiAgICBmb3IodmFyIHByb3BlcnR5IGluIG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgaWYocHJvcGVydHkgPT0gJ2Fzc29jaWF0aW9ucycpIHtcbiAgICAgICAgICB0aGlzLkFzc29jaWF0aW9uQ29sbGVjdGlvbi5jcmVhdGUobW9kZWxbcHJvcGVydHldKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX1twcm9wZXJ0eV0gPSBtb2RlbFtwcm9wZXJ0eV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgZ2V0KHByb3AsIF9kZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuX1twcm9wXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fW3Byb3BdIDogX2RlZmF1bHRcbiAgfVxuXG4gIHNldChwcm9wLCB2YWx1ZSwgY29uc3RydWN0b3IsIF9kZWZhdWx0KSB7XG4gICAgaWYodmFsdWUuY29uc3RydWN0b3IgPT09IGNvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSBfZGVmYXVsdFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtBc3NvY2lhdGlvbkNvbGxlY3Rpb259ICAgV2F5cG9pbnQjQXNzb2NpYXRpb25Db2xsZWN0aW9uXG4gICAqL1xuICBnZXQgQXNzb2NpYXRpb25Db2xsZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnQXNzb2NpYXRpb25Db2xsZWN0aW9uJywgbnVsbClcbiAgfVxuXG4gIHNldCBBc3NvY2lhdGlvbkNvbGxlY3Rpb24oY29sbGVjdGlvbikge1xuICAgIHRoaXMuc2V0KCdBc3NvY2lhdGlvbkNvbGxlY3Rpb24nLCBjb2xsZWN0aW9uLCBBc3NvY2lhdGlvbkNvbGxlY3Rpb24sIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFdheXBvaW50I2RlY2lzaW9uUG9pbnRcbiAgICovXG4gIGdldCBkZWNpc2lvblBvaW50KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGVjaXNpb25Qb2ludCcsIG51bGwpXG4gIH1cbiAgc2V0IGRlY2lzaW9uUG9pbnQoZGVjaXNpb25Qb2ludCkge1xuICAgIHRoaXMuc2V0KCdkZWNpc2lvblBvaW50JywgZGVjaXNpb25Qb2ludCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBXYXlwb2ludCNpZFxuICAgKi9cbiAgZ2V0IGlkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnaWQnLCBudWxsKVxuICB9XG4gIHNldCBpZChpZCkge1xuICAgIHRoaXMuc2V0KCdpZCcsIGlkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFdheXBvaW50I2xvY2FsSWRcbiAgICovXG4gIGdldCBsb2NhbElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbG9jYWxJZCcsIG51bGwpXG4gIH1cbiAgc2V0IGxvY2FsSWQobG9jYWxJZCkge1xuICAgIHRoaXMuc2V0KCdsb2NhbElkJywgbG9jYWxJZCwgTnVtYmVyLCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBXYXlwb2ludCNtYXBJZFxuICAgKi9cbiAgZ2V0IG1hcElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbWFwSWQnLCBudWxsKVxuICB9XG4gIHNldCBtYXBJZChtYXBJZCkge1xuICAgIHRoaXMuc2V0KCdtYXBJZCcsIG1hcElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFdheXBvaW50I3N0YXR1c1xuICAgKi9cbiAgZ2V0IHN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3N0YXR1cycsIG51bGwpXG4gIH1cbiAgc2V0IHN0YXR1cyhzdGF0dXMpIHtcbiAgICB0aGlzLnNldCgnc3RhdHVzJywgc3RhdHVzLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFdheXBvaW50I3hcbiAgICovXG4gIGdldCB4KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgneCcsIDApXG4gIH1cbiAgc2V0IHgoeCkge1xuICAgIHRoaXMuc2V0KCd4JywgeCwgTnVtYmVyLCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBXYXlwb2ludCN5XG4gICAqL1xuICBnZXQgeSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3knLCAwKVxuICB9XG4gIHNldCB5KHkpIHtcbiAgICB0aGlzLnNldCgneScsIHksIE51bWJlciwgMClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtBcnJheX0gICBXYXlwb2ludCNwb2ludCAtIHgveSBjb29yZGluYXRlcyBpbnNpZGUgYXJyYXkgW3gsIHldXG4gICAqL1xuICBnZXQgcG9pbnQoKSB7XG4gICAgcmV0dXJuIFt0aGlzLngsIHRoaXMueV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgV2F5cG9pbnQjem9uZUlkXG4gICAqL1xuICBnZXQgem9uZUlkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnem9uZUlkJywgbnVsbClcbiAgfVxuICBzZXQgem9uZUlkKHpvbmVJZCkge1xuICAgIHRoaXMuc2V0KCd6b25lSWQnLCB6b25lSWQsIE51bWJlciwgbnVsbClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdheXBvaW50XG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IFdheXBvaW50ID0gcmVxdWlyZSgnLi9XYXlwb2ludCcpXG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gY29sbGVjdGlvbiBvZiBXYXlwb2ludHMuICovXG5jbGFzcyBXYXlwb2ludENvbGxlY3Rpb24ge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb2xsZWN0aW9uIG9mIFdheXBvaW50cy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2l0ZW1zID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3Igd2VhdGhlciBvciBub3QgYXJndW1lbnQgaXMgY29uc3RydWN0ZWQgYXMgYW4gV2F5cG9pbnQgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIC0gSXRlbSB0byBldmFsdWF0ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBCb29sZWFuIGJhc2VkIG9uIGV2YWx1YXRpb24gcmVzdWx0XG4gICAqL1xuICBpc1dheXBvaW50KGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAmJiBpdGVtLmNvbnN0cnVjdG9yID09PSBXYXlwb2ludFxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgc2luZ2xlIG9yIGFuIGFycmF5IG9mIGRldmljZXMgYmFzZWQgb24gdGhlIGlucHV0IG1vZGVsIGRhdGFcbiAgICogQHBhcmFtIHtBcnJheS9XYXlwb2ludH0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICogQHJldHVybiB7QXJyYXkvV2F5cG9pbnR9IEEgY3JlYXRlZCBXYXlwb2ludCBpbnN0YW5jZSBvciBhbiBhcnJheSBvZiBXYXlwb2ludCBpbnN0YW5jZXNcbiAgICovXG4gIGNyZWF0ZShtb2RlbCkge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGlmKG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmVzID0gbW9kZWwubWFwKG0gPT4gbmV3IFdheXBvaW50KG0pKVxuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuX2l0ZW1zLmNvbmNhdChyZXMpXG4gICAgICB9IGVsc2UgaWYobW9kZWwuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICByZXMgPSBuZXcgV2F5cG9pbnQobW9kZWwpXG4gICAgICAgIHRoaXMuX2l0ZW1zLnB1c2gocmVzKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBXYXlwb2ludCBvYmplY3RzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBXYXlwb2ludCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIGlkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBXYXlwb2ludHMgaWRcbiAgICogQHJldHVybiB7V2F5cG9pbnR9XG4gICAqL1xuICBnZXRCeUlkKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbmQod3AgPT4gd3AuaWQgPT09IGlkKSB8fCBudWxsXG4gIH1cblxuICAvKipcbiAgICogR2V0IFdheXBvaW50IG9iamVjdHMgYXNzb2NpYXRlZCB3aXRoIG1hcElkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtYXBJZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBXYXlwb2ludHMgbWFwSWRcbiAgICogQHJldHVybiB7QXJyYXkvV2F5cG9pbnR9XG4gICAqL1xuICBnZXRCeU1hcElkKG1hcElkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbHRlcih3cCA9PiB3cC5tYXBJZCA9PT0gbWFwSWQpXG4gIH1cblxuICAvKipcbiAgICogR2V0IFdheXBvaW50IG9iamVjdHMgYXNzb2NpYXRlZCB3aXRoIHN0YXR1c1xuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzIC0gTnVtYmVyIHJlcHJlc2VudGluZyBlYWNoIFdheXBvaW50cyBzdGF0dXNcbiAgICogQHJldHVybiB7QXJyYXkvV2F5cG9pbnR9XG4gICAqL1xuICBnZXRCeVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKHdwID0+IHdwLnN0YXR1cyA9PT0gc3RhdHVzKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBXYXlwb2ludCBvYmplY3RzIGFzc29jaWF0ZWQgd2l0aCB6b25lSWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHpvbmVJZCAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBXYXlwb2ludHMgem9uZUlkXG4gICAqIEByZXR1cm4ge0FycmF5L1dheXBvaW50fVxuICAgKi9cbiAgZ2V0Qnlab25lSWQoem9uZUlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbHRlcih3cCA9PiB3cC56b25lSWQgPT09IHpvbmVJZClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2F5cG9pbnRDb2xsZWN0aW9uXG4iLCIndXNlIHN0cmljdCdcbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gWm9uZS4gKi9cbmNsYXNzIFpvbmUge1xuICAvKipcbiAgICogQ3JlYXRlIGFuIFpvbmUuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBtb2RlbCAtIFRoZSBtb2RlbCBvYmplY3QgcGFzc2VkIGJhY2sgZnJvbSB0aGUgL2Z1bGwgcGF5bG9hZFxuICAgKi9cbiAgY29uc3RydWN0b3IobW9kZWwpIHtcbiAgICB0aGlzLl8gPSB7fVxuICAgIGZvcih2YXIgcHJvcGVydHkgaW4gbW9kZWwpIHtcbiAgICAgIGlmKG1vZGVsLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICB0aGlzLl9bcHJvcGVydHldID0gbW9kZWxbcHJvcGVydHldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0KHByb3AsIF9kZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuX1twcm9wXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fW3Byb3BdIDogX2RlZmF1bHRcbiAgfVxuXG4gIHNldChwcm9wLCB2YWx1ZSwgY29uc3RydWN0b3IsIF9kZWZhdWx0KSB7XG4gICAgaWYodmFsdWUuY29uc3RydWN0b3IgPT09IGNvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9bcHJvcF0gPSBfZGVmYXVsdFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgWm9uZSNlbnRpdHlJZFxuICAgKi9cbiAgZ2V0IGNsaWVudElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY2xpZW50SWQnLCBudWxsKVxuICB9XG5cbiAgc2V0IGNsaWVudElkKGNsaWVudElkKSB7XG4gICAgdGhpcy5zZXQoJ2NsaWVudElkJywgY2xpZW50SWQsIFN0cmluZywgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgWm9uZSNwcm9qZWN0SWRcbiAgICovXG4gIGdldCBwcm9qZWN0SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwcm9qZWN0SWQnLCBudWxsKVxuICB9XG5cbiAgc2V0IHByb2plY3RJZChwcm9qZWN0SWQpIHtcbiAgICB0aGlzLnNldCgncHJvamVjdElkJywgcHJvamVjdElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFpvbmUjc3RhdHVzQ29kZVxuICAgKi9cbiAgZ2V0IHN0YXR1c0NvZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdzdGF0dXNDb2RlJywgbnVsbClcbiAgfVxuXG4gIHNldCBzdGF0dXNDb2RlKHN0YXR1c0NvZGUpIHtcbiAgICB0aGlzLnNldCgnc3RhdHVzQ29kZScsIHN0YXR1c0NvZGUsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgWm9uZSN6b25lSWRcbiAgICovXG4gIGdldCB6b25lSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd6b25lSWQnLCBudWxsKVxuICB9XG5cbiAgc2V0IHpvbmVJZCh6b25lSWQpIHtcbiAgICB0aGlzLnNldCgnem9uZUlkJywgem9uZUlkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgWm9uZSN6b25lRGV0YWlsc1xuICAgKi9cbiAgZ2V0IHpvbmVEZXRhaWxzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnem9uZURldGFpbHMnLCBudWxsKVxuICB9XG5cbiAgc2V0IHpvbmVEZXRhaWxzKHpvbmVEZXRhaWxzKSB7XG4gICAgdGhpcy5zZXQoJ3pvbmVEZXRhaWxzJywgem9uZURldGFpbHMsIEFycmF5LCBudWxsKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gWm9uZVxuIiwiJ3VzZSBzdHJpY3QnXG5jb25zdCBab25lID0gcmVxdWlyZSgnLi9ab25lJylcbiAgLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIGNvbGxlY3Rpb24gb2YgWm9uZXMuICovXG5jbGFzcyBab25lQ29sbGVjdGlvbiB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNvbGxlY3Rpb24gb2YgWm9uZXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pdGVtcyA9IFtdXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIHdlYXRoZXIgb3Igbm90IGFyZ3VtZW50IGlzIGNvbnN0cnVjdGVkIGFzIGFuIFpvbmUgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIC0gSXRlbSB0byBldmFsdWF0ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBCb29sZWFuIGJhc2VkIG9uIGV2YWx1YXRpb24gcmVzdWx0XG4gICAqL1xuICBpc1pvbmUoaXRlbSkge1xuICAgIHJldHVybiBpdGVtICYmIGl0ZW0uY29uc3RydWN0b3IgPT09IFpvbmVcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHNpbmdsZSBvciBhbiBhcnJheSBvZiBkZXZpY2VzIGJhc2VkIG9uIHRoZSBpbnB1dCBtb2RlbCBkYXRhXG4gICAqIEBwYXJhbSB7QXJyYXkvWm9uZX0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICogQHJldHVybiB7QXJyYXkvWm9uZX0gQSBjcmVhdGVkIFpvbmUgaW5zdGFuY2Ugb3IgYW4gYXJyYXkgb2YgWm9uZSBpbnN0YW5jZXNcbiAgICovXG4gIGNyZWF0ZShtb2RlbCkge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGlmKG1vZGVsKSB7XG4gICAgICBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmVzID0gbW9kZWwubWFwKG0gPT4gbmV3IFpvbmUobSkpXG4gICAgICAgIHRoaXMuX2l0ZW1zID0gdGhpcy5faXRlbXMuY29uY2F0KHJlcylcbiAgICAgIH0gZWxzZSBpZihtb2RlbC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgIHJlcyA9IG5ldyBab25lKG1vZGVsKVxuICAgICAgICB0aGlzLl9pdGVtcy5wdXNoKHJlcylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgWm9uZSBvYmplY3RzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtc1xuICB9XG5cbiAgLyoqXG4gICAqIHJldHVybiBhcnJheSBvZiBhc3NvY2lhdGlvbnMgYXNzb2NpYXRlZCB3aXRoIGEgY2xpZW50SWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNsaWVudElkIC0gTnVtYmVyIHJlcHJlc2VudGluZyBlYWNoIFpvbmVzIGNsaWVudElkXG4gICAqIEByZXR1cm4ge1pvbmV9IFpvbmUgT2JqZWN0XG4gICAqL1xuICBnZXRCeUNsaWVudElkKGNsaWVudElkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmZpbHRlcih6ID0+IHouY2xpZW50SWQgPT09IGNsaWVudElkKVxuICB9XG5cbiAgLyoqXG4gICAqIHJldHVybiBhcnJheSBvZiBhc3NvY2lhdGlvbnMgYXNzb2NpYXRlZCB3aXRoIGEgem9uZUlkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB6b25lSWQgLSBOdW1iZXIgcmVwcmVzZW50aW5nIGVhY2ggWm9uZXMgem9uZUlkXG4gICAqIEByZXR1cm4ge1pvbmV9IFpvbmUgT2JqZWN0XG4gICAqL1xuICBnZXRCeVpvbmVJZCh6b25lSWQpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKHogPT4gei56b25lSWQgPT09IHpvbmVJZClcbiAgfVxuXG4gIC8qKlxuICAgKiByZXR1cm4gYXJyYXkgb2YgYXNzb2NpYXRpb25zIGFzc29jaWF0ZWQgd2l0aCBhIHN0YXR1c0NvZGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c0NvZGUgLSBOdW1iZXIgcmVwcmVzZW50aW5nIGVhY2ggWm9uZXMgc3RhdHVzQ29kZVxuICAgKiBAcmV0dXJuIHtBcnJheS9ab25lfSBBcnJheSBvZiBab25lc1xuICAgKi9cbiAgZ2V0QnlTdGF0dXNDb2RlKHN0YXR1c0NvZGUpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMuZmlsdGVyKHogPT4gei5zdGF0dXNDb2RlID09PSBzdGF0dXNDb2RlKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBab25lQ29sbGVjdGlvblxuIiwiJ3VzZSBzdHJpY3QnXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIEluc3RydWN0aW9uLiAqL1xuY2xhc3MgSW5zdHJ1Y3Rpb24ge1xuICAvKipcbiAgICogQ3JlYXRlIGFuIEluc3RydWN0aW9uLlxuICAgKiBAcGFyYW0ge29iamVjdH0gbW9kZWwgLSBUaGUgbW9kZWwgb2JqZWN0IHBhc3NlZCBiYWNrIGZyb20gdGhlIC9mdWxsIHBheWxvYWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBmb2xkVG9CYWNrKGluc3RydWN0aW9uKSB7XG4gICAgLy8gRm9sZCBpdCBhbmQgaXRzIHBvaW50cyBhY2NvcmRpbmdseVxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBpZiBGcm9udCBhcnJheVxuICAgIGlmKCF0aGlzLmZvbGRlZFBvaW50c0Zyb250KSB7XG4gICAgICB0aGlzLmZvbGRlZFBvaW50c0Zyb250ID0gW107XG4gICAgfVxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBpZiBCYWNrIGFycmF5XG4gICAgaWYoIXRoaXMuZm9sZGVkUG9pbnRzQmFjaykge1xuICAgICAgdGhpcy5mb2xkZWRQb2ludHNCYWNrID0gW107XG4gICAgfVxuXG4gICAgLy8gQWRkIGl0XG4gICAgLy8gQWRkIHRvIGZyb250IGVuZFxuICAgIHRoaXMuZm9sZGVkUG9pbnRzQmFjay5wdXNoKGluc3RydWN0aW9uKTtcbiAgfVxuXG4gIGZvbGRJbkZyb250KGluc3RydWN0aW9uKSB7XG4gICAgLy8gRm9sZCBpdCBhbmQgaXRzIHBvaW50cyBhY2NvcmRpbmdseVxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBpZiBGcm9udCBhcnJheVxuICAgIGlmKCF0aGlzLmZvbGRlZFBvaW50c0Zyb250KSB7XG4gICAgICB0aGlzLmZvbGRlZFBvaW50c0Zyb250ID0gW107XG4gICAgfVxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBpZiBCYWNrIGFycmF5XG4gICAgaWYoIXRoaXMuZm9sZGVkUG9pbnRzQmFjaykge1xuICAgICAgdGhpcy5mb2xkZWRQb2ludHNCYWNrID0gW107XG4gICAgfVxuXG4gICAgLy8gQWRkIGl0XG4gICAgLy8gQWRkIHRvIGZyb250IGVuZFxuICAgIHRoaXMuZm9sZGVkUG9pbnRzRnJvbnQucHVzaChpbnN0cnVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIEluc3RydWN0aW9uI2VudGl0eUlkXG4gICAqL1xuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIEluc3RydWN0aW9uI2FuZ2xlVG9MYW5kbWFya1xuICAgKi9cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBJbnN0cnVjdGlvbiNhbmdsZVRvTmV4dFxuICAgKi9cbiAgLyoqXG4gICAqIEBtZW1iZXIge051bWJlcn0gICBJbnN0cnVjdGlvbiNhbmdsZVRvTmV4dE9mUHJldmlvdXNEaXJlY3Rpb25cbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgSW5zdHJ1Y3Rpb24jZGlyZWN0aW9uXG4gICAqL1xuICAvKipcbiAgICogQG1lbWJlciB7U3RyaW5nfSAgIEluc3RydWN0aW9uI2RpcmVjdGlvblRvTGFuZG1hcmtcbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgSW5zdHJ1Y3Rpb24jZGlzdGFuY2VGcm9tU3RhcnRNZXRlcnNcbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgSW5zdHJ1Y3Rpb24jZGlzdGFuY2VGcm9tU3RhcnRQaXhlbHNcbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgSW5zdHJ1Y3Rpb24jZGlzdGFuY2VUb05leHRNZXRlcnNcbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgSW5zdHJ1Y3Rpb24jZGlzdGFuY2VUb05leHRQaXhlbHNcbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgSW5zdHJ1Y3Rpb24jZmxvb3JcbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgSW5zdHJ1Y3Rpb24jZmxvb3JOYW1lXG4gICAqL1xuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgSW5zdHJ1Y3Rpb24jZm9sZGVkUG9pbnRzQmFja1xuICAgKi9cbiAgLyoqXG4gICAqIEBtZW1iZXIge0FycmF5fSAgIEluc3RydWN0aW9uI2ZvbGRlZFBvaW50c0Zyb250XG4gICAqL1xuICAvKipcbiAgICogQG1lbWJlciB7RGVzdGluYXRpb259ICAgSW5zdHJ1Y3Rpb24jbGFuZG1hcmtEZXN0aW5hdGlvblxuICAgKi9cbiAgLyoqXG4gICAqIEBtZW1iZXIge1dheXBvaW50fSAgIEluc3RydWN0aW9uI2xhbmRtYXJrV1BcbiAgICovXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtTdHJpbmd9ICAgSW5zdHJ1Y3Rpb24jb3V0cHV0XG4gICAqL1xuICAvKipcbiAgICogQG1lbWJlciB7QXJyYXl9ICAgSW5zdHJ1Y3Rpb24jc2Vjb25kYXJ5RGlyZWN0aW9uc1xuICAgKi9cbiAgLyoqXG4gICAqIEBtZW1iZXIge1N0cmluZ30gICBJbnN0cnVjdGlvbiN0eXBlXG4gICAqL1xuICAvKipcbiAgICogQG1lbWJlciB7V2F5cG9pbnR9ICAgSW5zdHJ1Y3Rpb24jd3BcbiAgICovXG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1Y3Rpb25cbiIsIid1c2Ugc3RyaWN0J1xuY29uc3QgbWFrZVRleHREaXJlY3Rpb25zID0gcmVxdWlyZSgnLi9tYWtlVGV4dERpcmVjdGlvbnMnKVxuY29uc3QgbGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL2xpbmVPZlNpZ2h0JylcblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhbiBJbnN0cnVjdGlvbkNvbXBpbGVyIG9iamVjdCB1c2VkIHRvIGdlbmVyYXRlIHRleHQgZGlyZWN0aW9ucyBmcm9tIGFuIGFycmF5IG9mICNXYXlmaW5kRGF0YSovXG5jbGFzcyBJbnN0cnVjdGlvbkNvbXBpbGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBJbnN0cnVjdGlvbkNvbXBpbGVyIG9iamVjdFxuICAgKiBAcGFyYW0ge0pNYXB9IGptYXAgLSBjb25zdHJ1Y3RlZCBqbWFwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3Ioam1hcCkge1xuICAgIC8vQnVpbGQgc2hhcGVzIG9iamVjdFxuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICB0aGlzLnNoYXBlcyA9IHt9XG4gICAgam1hcC5NYXBDb2xsZWN0aW9uLmdldEFsbCgpLmZvckVhY2goKG1hcCkgPT4ge1xuICAgICAgc2VsZi5zaGFwZXNbbWFwLm1hcElkXSA9IHtcbiAgICAgICAgbGJveGVzOiBtYXAubGJveGVzXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMubW9kZWwgPSB7XG4gICAgICBnZXRXYXlwb2ludEluZm9ybWF0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIGptYXAuTWFwQ29sbGVjdGlvbi5nZXRXYXlwb2ludEJ5V2F5cG9pbnRJZCh4KVxuICAgICAgfSxcbiAgICAgIGdldEZsb29yQnlTZXF1ZW5jZSh4KSB7XG4gICAgICAgIHJldHVybiBqbWFwLk1hcENvbGxlY3Rpb24uZ2V0QnlGbG9vclNlcXVlbmNlKHgpXG4gICAgICB9LFxuICAgICAgZ2V0Rmxvb3JCeUlkKHgpIHtcbiAgICAgICAgcmV0dXJuIGptYXAuTWFwQ29sbGVjdGlvbi5nZXRCeU1hcElkKHgpXG4gICAgICB9LFxuICAgICAgZ2V0RGVzdGluYXRpb25CeVdheXBvaW50SWQoeCkge1xuICAgICAgICByZXR1cm4gam1hcC5EZXN0aW5hdGlvbkNvbGxlY3Rpb24uZ2V0QnlXYXlwb2ludElkKHgpXG4gICAgICB9LFxuICAgICAgZ2V0V2F5cG9pbnRzQnlEZXN0aW5hdGlvbklkKHgpIHtcbiAgICAgICAgcmV0dXJuIGptYXAuTWFwQ29sbGVjdGlvbi5nZXRXYXlwb2ludHNCeURlc3RpbmF0aW9uSWQoeClcbiAgICAgIH0sXG4gICAgICBkZXN0aW5hdGlvbnM6IGptYXAuRGVzdGluYXRpb25Db2xsZWN0aW9uLmdldEFsbCgpXG4gICAgfVxuXG4gICAgLy9Jbml0IG1ldGhvZHNcbiAgICBtYWtlVGV4dERpcmVjdGlvbnModGhpcylcbiAgICBsaW5lT2ZTaWdodCh0aGlzKVxuICB9XG5cbn1cblxuLyoqIFdyYXBwZXIgQ2xhc3MgcmVwcmVzZW50aW5nIGEgVGV4dERpcmVjdGlvbnMgb2JqZWN0IHVzZWQgdG8gZ2VuZXJhdGUgdGV4dCBkaXJlY3Rpb25zIGZyb20gYW4gYXJyYXkgb2YgI1dheWZpbmREYXRhKi9cbmNsYXNzIFRleHREaXJlY3Rpb25zIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBUZXh0RGlyZWN0aW9ucyBvYmplY3RcbiAgICogQHBhcmFtIHtKTWFwfSBqbWFwIC0gY29uc3RydWN0ZWQgam1hcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGptYXApIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtPYmplY3R9ICAgVGV4dERpcmVjdGlvbnMjZGlyZWN0aW9uRGF0YVxuICAgICAqL1xuICAgIHRoaXMuZGlyZWN0aW9uRGF0YSA9IHtcbiAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgIFVUdXJuSW5NZXRlcnM6IDMwLFxuICAgICAgYWRkVERpZkVtcHR5TWV0ZXJzOiA1MFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0luc3RydWN0aW9uQ29tcGlsZXJ9ICAgVGV4dERpcmVjdGlvbnMjY29tcGlsZXJcbiAgICAgKi9cbiAgICB0aGlzLmNvbXBpbGVyID0gbmV3IEluc3RydWN0aW9uQ29tcGlsZXIoam1hcClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgQXJyYXkgb2YgSW5zdHJ1Y3Rpb25zIGZyb20gYW4gYXJyYXkgb2YgV2F5ZmluZERhdGFcbiAgICogQHBhcmFtIHtBcnJheS9XYXlmaW5kRGF0YX0gcG9pbnRBcnJheSAtIE51bWJlciByZXByZXNlbnRpbmcgZWFjaCBNYXBzIGZsb29yU2VxdWVuY2VcbiAgICogQHBhcmFtIHtCb29sZWFufSBmaWx0ZXIgLSBGaWx0ZXIgaW5zdHJ1Y3Rpb25zIG9yIG5vdCwgYmFzZWQgb24gSmliZXN0cmVhbSBzdGFuZGFyZCBhbGdvcml0aG1cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFVUdXJuSW5NZXRlcnMgLSBBbW91bnQgb2YgbWV0ZXJzIHVzZWQgaW4gb3JkZXIgdG8ganVzdGlmeSBhIFV0cm4gaGFzIG9jY3VyZWQgKHNldCB0byAwIHRvIGRpc2FibGUgdXR1cm5zKVxuICAgKiBAcGFyYW0ge051bWJlcn0gYWRkVERpZkVtcHR5TWV0ZXJzIC0gQW1vdW50IG9mIG1ldGVycyB0byBqdXN0aWZ5IGEgJ0NvbnRpbnVlIHBhc3QnIGluc3RydWN0aW9uXG4gICAqIEByZXR1cm4ge0FycmF5L0luc3RydWN0aW9uc31cbiAgICovXG4gIGNvbXBpbGUocG9pbnRBcnJheSwgZmlsdGVyLCBVVHVybkluTWV0ZXJzLCBhZGRURGlmRW1wdHlNZXRlcnMpIHtcbiAgICBpZighcG9pbnRBcnJheSB8fCBwb2ludEFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGV4dERpcmVjdGlvbnMgOjogcG9pbnRBcnJheSBtdXN0IGhhdmUgbGVuZ3RoIGdyZWF0ZXIgdGhhbiB6ZXJvLicpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZXIubWFrZVRleHREaXJlY3Rpb25zKHtcbiAgICAgIHBvaW50QXJyYXksXG4gICAgICBmaWx0ZXI6IGZpbHRlciB8fCB0aGlzLmRpcmVjdGlvbkRhdGEuZmlsdGVyLFxuICAgICAgVVR1cm5Jbk1ldGVyczogVVR1cm5Jbk1ldGVycyB8fCB0aGlzLmRpcmVjdGlvbkRhdGEuVVR1cm5Jbk1ldGVycyxcbiAgICAgIGFkZFREaWZFbXB0eU1ldGVyczogYWRkVERpZkVtcHR5TWV0ZXJzIHx8IHRoaXMuZGlyZWN0aW9uRGF0YS5hZGRURGlmRW1wdHlNZXRlcnNcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGV4dERpcmVjdGlvbnNcbiIsInZhciBfXyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21ib0RpcmVjdGlvbnMoaW5zdCkge1xuXG4gIHZhciBsb29wVG8gPSBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGggLSAxO1xuICB2YXIgY29uc2VjdXRpdmVBcnJheURpcmVjdGlvbiA9IFtdO1xuICB2YXIgY29uc2VjdXRpdmVBcnJheVRpbWVzID0gW107XG4gIHZhciBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICBmb3IodmFyIGkgPSAxOyBpIDwgbG9vcFRvOyBpKyspIHtcbiAgICAvLyBGb2xkIHNlY29uZCBsYXN0XG4gICAgdmFyIGN1cnJlbnRJbnN0cnVjdGlvbiA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5W2ldO1xuXG4gICAgLy8gRGlmZmVyZW50IGxhbmRtYXJrP1xuICAgIGlmKCFmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24gfHwgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uLmxhbmRtYXJrRGVzdGluYXRpb24uaWQgIT0gY3VycmVudEluc3RydWN0aW9uLmxhbmRtYXJrRGVzdGluYXRpb24uaWQpIHtcbiAgICAgIC8vIFByb2Nlc3MgYXJyYXkgaWYgbW9yZSB0aGFuIDFcbiAgICAgIGlmKGNvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBjb21iaW5lZERpcmVjdGlvbnNcbiAgICAgICAgdmFyIGNvbWJpbmVkRGlyZWN0aW9ucyA9ICcnO1xuICAgICAgICB2YXIgbmV4dERpcmVjdGlvbiA9ICcnO1xuICAgICAgICB2YXIgY29uc2VjdXRpdmUgPSBbXTtcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGNvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBuZXh0RGlyZWN0aW9uID0gY29uc2VjdXRpdmVBcnJheURpcmVjdGlvbltqXTtcbiAgICAgICAgICB2YXIgbmV4dERpcmVjdGlvblRpbWVzID0gY29uc2VjdXRpdmVBcnJheVRpbWVzW2pdO1xuXG4gICAgICAgICAgLy8gQXZvaWQgXCJGb3J3YXJkXCIgdW5sZXNzIHRoaXMgaXMgdGhlIGxhc3QgdGV4dERpcmVjdGlvblxuICAgICAgICAgIHZhciBjYW5QYXNzID0gdHJ1ZTtcbiAgICAgICAgICBpZigobmV4dERpcmVjdGlvbi50b0xvd2VyQ2FzZSgpID09PSAnRm9yd2FyZCcudG9Mb3dlckNhc2UoKSkgJiZcbiAgICAgICAgICAgIChqIDwgKGNvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24ubGVuZ3RoIC0gMSkpKVxuICAgICAgICAgIC8vIC0xIGlzIHRvIGFsbG93IGZvciBsYXN0IGNvbnNlY3V0aXZlIGRpcmVjdGlvbiB0byBiZSBGb3J3YXJkXG4gICAgICAgICAge1xuICAgICAgICAgICAgLy8gRG8gbm90IHByb2Nlc3NcbiAgICAgICAgICAgIGNhblBhc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vTlNMb2coQFwiRm9yd2FyZCBibG9ja2VkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihjYW5QYXNzKSB7XG4gICAgICAgICAgICAvLyBNYWtlIHN0cmluZ1xuICAgICAgICAgICAgdmFyIG5leHRDb21iaW5lZERpcmVjdGlvbiA9ICcnO1xuICAgICAgICAgICAgLy8gU2luZ3VsYXIgb3IgcGx1cmFsXG4gICAgICAgICAgICBpZihuZXh0RGlyZWN0aW9uVGltZXMgPT0gMSkge1xuICAgICAgICAgICAgICAvLyBTaW5ndWxhclxuICAgICAgICAgICAgICBuZXh0Q29tYmluZWREaXJlY3Rpb24gPSBfXy5zdHJpbmdXaXRoRm9ybWF0KCclJywgbmV4dERpcmVjdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBQbHVyYWxcbiAgICAgICAgICAgICAgbmV4dENvbWJpbmVkRGlyZWN0aW9uID0gX18uc3RyaW5nV2l0aEZvcm1hdCgnJSAlIHRpbWVzJywgbmV4dERpcmVjdGlvbiwgbmV4dERpcmVjdGlvblRpbWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc2VjdXRpdmUucHVzaCh7XG4gICAgICAgICAgICAgIGRpcmVjdGlvbjogbmV4dERpcmVjdGlvbixcbiAgICAgICAgICAgICAgYW1vdW50OiBuZXh0RGlyZWN0aW9uVGltZXNcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMYXN0P1xuICAgICAgICAgICAgaWYoaiAhPSAoY29uc2VjdXRpdmVBcnJheURpcmVjdGlvbi5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAvLyBOb3QgTGFzdFxuICAgICAgICAgICAgICBuZXh0Q29tYmluZWREaXJlY3Rpb24gKz0gJywgdGhlbiAnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb21iaW5lZERpcmVjdGlvbnNcbiAgICAgICAgICAgIGNvbWJpbmVkRGlyZWN0aW9ucyArPSBuZXh0Q29tYmluZWREaXJlY3Rpb247XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29tYmluZSBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24gb3V0cHV0XG4gICAgICAgIHZhciBuZXdPdXRwdXQgPSBfXy5zdHJpbmdXaXRoRm9ybWF0KCdXaXRoICUgb24geW91ciAlLCBnbyAlLicsXG4gICAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uLmxhbmRtYXJrRGVzdGluYXRpb24ubmFtZSxcbiAgICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24uZGlyZWN0aW9uVG9MYW5kbWFyayxcbiAgICAgICAgICBjb21iaW5lZERpcmVjdGlvbnMpO1xuXG4gICAgICAgIC8vUmVtb3ZlIGZpcnN0IGl0ZW0gaW4gY29uc2VjdXRpdmUgYXJyYXksIGJlbG9uZ3MgdG8gaW5pdGlhbCBpbnN0cnVjdGlvblxuICAgICAgICBjb25zZWN1dGl2ZS5zaGlmdCgpO1xuXG4gICAgICAgIC8vIFVwZGF0ZVxuICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24udHlwZSA9ICdjb21ibyc7XG4gICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbi5zZWNvbmRhcnlEaXJlY3Rpb25zID0gY29uc2VjdXRpdmU7XG4gICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbi5vdXRwdXQgPSBuZXdPdXRwdXQ7XG4gICAgICB9XG4gICAgICAvLyBSZXNldCBhcnJheVxuICAgICAgY29uc2VjdXRpdmVBcnJheURpcmVjdGlvbiA9IFtdO1xuICAgICAgY29uc2VjdXRpdmVBcnJheVRpbWVzID0gW107XG5cbiAgICAgIC8vIE5leHQgY29uc2VjdXRpdmVcbiAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbiA9IGN1cnJlbnRJbnN0cnVjdGlvbjtcblxuICAgICAgLy8gQWRkIGZpcnN0IGRpcmVjdGlvblxuICAgICAgY29uc2VjdXRpdmVBcnJheURpcmVjdGlvbi5wdXNoKGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbi5kaXJlY3Rpb24pO1xuICAgICAgY29uc2VjdXRpdmVBcnJheVRpbWVzLnB1c2goMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFkZCBkaXJlY3Rpb24gdG8gYXJyYXlcbiAgICAgIC8vIFVubGVzcyB0aGUgbGFzdCBkaXJlY3Rpb24gaXMgc2FtZSBhcyB0aGlzIG9uZSwgdGhlbiBhZGQgYW5vdGhlciBzdGVwIHRvIGl0XG4gICAgICB2YXIgbGFzdE9iamVjdCA9IGNvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb25bY29uc2VjdXRpdmVBcnJheURpcmVjdGlvbi5sZW5ndGggLSAxXTtcbiAgICAgIGlmKGxhc3RPYmplY3QudG9Mb3dlckNhc2UoKSA9PT0gY3VycmVudEluc3RydWN0aW9uLmRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIC8vIE5PVEU6IERvIG5vdCBjb3VudCB1cCBpbiBjYXNlIG9mIEZvcndhcmQuXG4gICAgICAgIC8vIEJhZDogIFdpdGggWCBvbiB5b3VyIExlZnQsIGdvIEZvcndhcmQgMyB0aW1lcy5cbiAgICAgICAgLy8gR29vZDogV2l0aCBYIG9uIHlvdXIgTGVmdCwgZ28gRm9yd2FyZFxuICAgICAgICBpZihjdXJyZW50SW5zdHJ1Y3Rpb24uZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgIT09ICdGb3J3YXJkJy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgLy8gSW5jIG9uZSBtb3JlXG4gICAgICAgICAgdmFyIGN1cnJlbnRDb3VudGVyID0gY29uc2VjdXRpdmVBcnJheVRpbWVzW2NvbnNlY3V0aXZlQXJyYXlUaW1lcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICBjdXJyZW50Q291bnRlcisrO1xuICAgICAgICAgIC8vIERlbGV0ZSBsYXN0IG9iamVjdFxuICAgICAgICAgIGNvbnNlY3V0aXZlQXJyYXlUaW1lcy5wb3AoKTtcbiAgICAgICAgICAvLyBBZGQgbmV3XG4gICAgICAgICAgY29uc2VjdXRpdmVBcnJheVRpbWVzLnB1c2goY3VycmVudENvdW50ZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBZGQgZmlyc3QgZGlmZmVyZW50IGRpcmVjdGlvblxuICAgICAgICBjb25zZWN1dGl2ZUFycmF5RGlyZWN0aW9uLnB1c2goY3VycmVudEluc3RydWN0aW9uLmRpcmVjdGlvbik7XG4gICAgICAgIGNvbnNlY3V0aXZlQXJyYXlUaW1lcy5wdXNoKDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBGb2xkIGN1cnJlbnQgaW50byBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25cbiAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbi5mb2xkSW5Gcm9udChjdXJyZW50SW5zdHJ1Y3Rpb24pO1xuXG4gICAgICAvLyBSZW1vdmUgZnJvbSB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlcbiAgICAgIGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5LnNwbGljZShpLCAxKTtcblxuICAgICAgLy8gRGVjIGxvb3BUb1xuICAgICAgbG9vcFRvLS07XG4gICAgICAvLyBHbyBiYWNrIG9uZSBpbmRleFxuICAgICAgaS0tO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vKlxuXG4vLyBGaWx0ZXIgTm8uNSBSZWR1bmRhbnQgaW5zdHJ1Y3Rpb25zIGluIHRoZSBNaWRkbGUgb2YgSW5zdHJ1Y3Rpb25zIChjb21iby1kaXJlY3Rpb25zKVxuLSh2b2lkKWZpbHRlck5vNVJlZHVuZGFudEluc3RydWN0aW9uc0luTWlkZGxlSW5zdHJ1Y3Rpb25zQ29tYm9EaXJlY3Rpb25zOihOU011dGFibGVBcnJheSAqKil0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzOihKTWFwUGF0aFBlckZsb29yICopdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzIHdheWZpbmRBcnJheTooTlNBcnJheSAqKXdheWZpbmRBcnJheSBmaWx0ZXJPbjooQk9PTClmaWx0ZXJPbiBhZGRURGlmRW1wdHlNZXRlcnM6KGZsb2F0KWFkZFREaWZFbXB0eU1ldGVycyBVVHVybkluTWV0ZXJzOihmbG9hdClVVHVybkluTWV0ZXJzIGVuYWJsZURpc3RhbmNlRmlsdGVyczooQk9PTCllbmFibGVEaXN0YW5jZUZpbHRlcnMgeFNjYWxlOihmbG9hdCl4U2NhbGUgeVNjYWxlOihmbG9hdCl5U2NhbGUgY3VycmVudEZsb29yVEQ6KEpNYXBGbG9vciAqKWN1cnJlbnRGbG9vclREIGN1ckNhbnZhczooSk1hcENhbnZhcyAqKWN1ckNhbnZhc1xue1xuICAgIE5TSW50ZWdlciBsb29wVG8gPSBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBjb3VudF0gLSAxO1xuICAgIE5TTXV0YWJsZUFycmF5ICpjb25zZWN1dGl2ZUFycmF5RGlyZWN0aW9uID0gW1tOU011dGFibGVBcnJheSBhbGxvY10gaW5pdF07XG4gICAgTlNNdXRhYmxlQXJyYXkgKmNvbnNlY3V0aXZlQXJyYXlUaW1lcyA9IFtbTlNNdXRhYmxlQXJyYXkgYWxsb2NdIGluaXRdO1xuICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbiA9IG5pbDtcbiAgICBmb3IoaW50IGkgPSAxOyBpIDwgbG9vcFRvOyBpKyspXG4gICAge1xuICAgICAgICAvLyBGb2xkIHNlY29uZCBsYXN0XG4gICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmN1cnJlbnRJbnN0cnVjdGlvbiA9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IG9iamVjdEF0SW5kZXg6aV07XG5cbiAgICAgICAgLy8gRGlmZmVyZW50IGxhbmRtYXJrP1xuICAgICAgICBpZihmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24ubGFuZG1hcmtEZXN0aW5hdGlvbi5pZC5pbnRWYWx1ZSAhPSBjdXJyZW50SW5zdHJ1Y3Rpb24ubGFuZG1hcmtEZXN0aW5hdGlvbi5pZC5pbnRWYWx1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gUHJvY2VzcyBhcnJheSBpZiBtb3JlIHRoYW4gMVxuICAgICAgICAgICAgaWYoY29uc2VjdXRpdmVBcnJheURpcmVjdGlvbi5jb3VudCA+IDEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gY29tYmluZWREaXJlY3Rpb25zXG4gICAgICAgICAgICAgICAgTlNTdHJpbmcgKmNvbWJpbmVkRGlyZWN0aW9ucyA9IEBcIlwiO1xuICAgICAgICAgICAgICAgIGZvcihpbnQgaiA9IDA7IGogPCBjb25zZWN1dGl2ZUFycmF5RGlyZWN0aW9uLmNvdW50OyBqKyspXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBOU1N0cmluZyAqbmV4dERpcmVjdGlvbiA9IFtjb25zZWN1dGl2ZUFycmF5RGlyZWN0aW9uIG9iamVjdEF0SW5kZXg6al07XG4gICAgICAgICAgICAgICAgICAgIE5TTnVtYmVyICpuZXh0RGlyZWN0aW9uVGltZXMgPSBbY29uc2VjdXRpdmVBcnJheVRpbWVzIG9iamVjdEF0SW5kZXg6al07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBcIkZvcndhcmRcIiB1bmxlc3MgdGhpcyBpcyB0aGUgbGFzdCB0ZXh0RGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIEJPT0wgY2FuUGFzcyA9IFlFUztcbiAgICAgICAgICAgICAgICAgICAgaWYoKFtuZXh0RGlyZWN0aW9uLmxvd2VyY2FzZVN0cmluZyBpc0VxdWFsVG9TdHJpbmc6QFwiRm9yd2FyZFwiLmxvd2VyY2FzZVN0cmluZ10pICYmXG4gICAgICAgICAgICAgICAgICAgICAgIChqIDwgKGNvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24uY291bnQgLSAxKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtMSBpcyB0byBhbGxvdyBmb3IgbGFzdCBjb25zZWN1dGl2ZSBkaXJlY3Rpb24gdG8gYmUgRm9yd2FyZFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEbyBub3QgcHJvY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuUGFzcyA9IE5PO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9OU0xvZyhAXCJGb3J3YXJkIGJsb2NrZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoY2FuUGFzcylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIE5TU3RyaW5nICpuZXh0Q29tYmluZWREaXJlY3Rpb24gPSBAXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmd1bGFyIG9yIHBsdXJhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobmV4dERpcmVjdGlvblRpbWVzLmludFZhbHVlID09IDEpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luZ3VsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q29tYmluZWREaXJlY3Rpb24gPSBbTlNTdHJpbmcgc3RyaW5nV2l0aEZvcm1hdDpAXCIlQFwiLCBuZXh0RGlyZWN0aW9uXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQbHVyYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q29tYmluZWREaXJlY3Rpb24gPSBbTlNTdHJpbmcgc3RyaW5nV2l0aEZvcm1hdDpAXCIlQCAlQCB0aW1lc1wiLCBuZXh0RGlyZWN0aW9uLCBuZXh0RGlyZWN0aW9uVGltZXNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGFzdD9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGogIT0gKGNvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24uY291bnQgLSAxKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3QgTGFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRDb21iaW5lZERpcmVjdGlvbiA9IFtuZXh0Q29tYmluZWREaXJlY3Rpb24gc3RyaW5nQnlBcHBlbmRpbmdTdHJpbmc6QFwiLCB0aGVuIFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tYmluZWREaXJlY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21iaW5lZERpcmVjdGlvbnMgPSBbY29tYmluZWREaXJlY3Rpb25zIHN0cmluZ0J5QXBwZW5kaW5nU3RyaW5nOm5leHRDb21iaW5lZERpcmVjdGlvbl07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gQ29tYmluZSBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24gb3V0cHV0XG4gICAgICAgICAgICAgICAgTlNTdHJpbmcgKm5ld091dHB1dCA9IFtOU1N0cmluZyBzdHJpbmdXaXRoRm9ybWF0OkBcIldpdGggJUAgb24geW91ciAlQCwgZ28gJUAuXCIsIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbi5sYW5kbWFya0Rlc3RpbmF0aW9uLm5hbWUsIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbi5kaXJlY3Rpb25Ub0xhbmRtYXJrLCBjb21iaW5lZERpcmVjdGlvbnNdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZVxuICAgICAgICAgICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbi5vdXRwdXQgPSBuZXdPdXRwdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZXNldCBhcnJheVxuICAgICAgICAgICAgW2NvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24gcmVtb3ZlQWxsT2JqZWN0c107XG4gICAgICAgICAgICBbY29uc2VjdXRpdmVBcnJheVRpbWVzIHJlbW92ZUFsbE9iamVjdHNdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBOZXh0IGNvbnNlY3V0aXZlXG4gICAgICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24gPSBjdXJyZW50SW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEFkZCBmaXJzdCBkaXJlY3Rpb25cbiAgICAgICAgICAgIFtjb25zZWN1dGl2ZUFycmF5RGlyZWN0aW9uIGFkZE9iamVjdDpmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb24uZGlyZWN0aW9uXTtcbiAgICAgICAgICAgIFtjb25zZWN1dGl2ZUFycmF5VGltZXMgYWRkT2JqZWN0OltOU051bWJlciBudW1iZXJXaXRoSW50OjFdXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIEFkZCBkaXJlY3Rpb24gdG8gYXJyYXlcbiAgICAgICAgICAgIC8vIFVubGVzcyB0aGUgbGFzdCBkaXJlY3Rpb24gaXMgc2FtZSBhcyB0aGlzIG9uZSwgdGhlbiBhZGQgYW5vdGhlciBzdGVwIHRvIGl0XG4gICAgICAgICAgICBpZihbKChOU1N0cmluZyAqKVtjb25zZWN1dGl2ZUFycmF5RGlyZWN0aW9uIGxhc3RPYmplY3RdKS5sb3dlcmNhc2VTdHJpbmcgaXNFcXVhbFRvU3RyaW5nOmN1cnJlbnRJbnN0cnVjdGlvbi5kaXJlY3Rpb24ubG93ZXJjYXNlU3RyaW5nXSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBEbyBub3QgY291bnQgdXAgaW4gY2FzZSBvZiBGb3J3YXJkLlxuICAgICAgICAgICAgICAgIC8vIEJhZDogIFdpdGggWCBvbiB5b3VyIExlZnQsIGdvIEZvcndhcmQgMyB0aW1lcy5cbiAgICAgICAgICAgICAgICAvLyBHb29kOiBXaXRoIFggb24geW91ciBMZWZ0LCBnbyBGb3J3YXJkXG4gICAgICAgICAgICAgICAgaWYoIVtjdXJyZW50SW5zdHJ1Y3Rpb24uZGlyZWN0aW9uLmxvd2VyY2FzZVN0cmluZyBpc0VxdWFsVG9TdHJpbmc6QFwiRm9yd2FyZFwiLmxvd2VyY2FzZVN0cmluZ10pXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbmMgb25lIG1vcmVcbiAgICAgICAgICAgICAgICAgICAgaW50IGN1cnJlbnRDb3VudGVyID0gW1tjb25zZWN1dGl2ZUFycmF5VGltZXMgbGFzdE9iamVjdF0gaW50VmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q291bnRlcisrO1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWxldGUgbGFzdCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgW2NvbnNlY3V0aXZlQXJyYXlUaW1lcyByZW1vdmVMYXN0T2JqZWN0XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIG5ld1xuICAgICAgICAgICAgICAgICAgICBbY29uc2VjdXRpdmVBcnJheVRpbWVzIGFkZE9iamVjdDpbTlNOdW1iZXIgbnVtYmVyV2l0aEludDpjdXJyZW50Q291bnRlcl1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgZmlyc3QgZGlmZmVyZW50IGRpcmVjdGlvblxuICAgICAgICAgICAgICAgIFtjb25zZWN1dGl2ZUFycmF5RGlyZWN0aW9uIGFkZE9iamVjdDpjdXJyZW50SW5zdHJ1Y3Rpb24uZGlyZWN0aW9uXTtcbiAgICAgICAgICAgICAgICBbY29uc2VjdXRpdmVBcnJheVRpbWVzIGFkZE9iamVjdDpbTlNOdW1iZXIgbnVtYmVyV2l0aEludDoxXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZvbGQgY3VycmVudCBpbnRvIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblxuICAgICAgICAgICAgW2ZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvbiBmb2xkSW5Gcm9udDpjdXJyZW50SW5zdHJ1Y3Rpb25dO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZW1vdmUgZnJvbSB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlcbiAgICAgICAgICAgIFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IHJlbW92ZU9iamVjdEF0SW5kZXg6aV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIERlYyBsb29wVG9cbiAgICAgICAgICAgIGxvb3BUby0tO1xuICAgICAgICAgICAgLy8gR28gYmFjayBvbmUgaW5kZXhcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuKi9cbiIsInZhciBfXyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb25zZWN1dGl2ZUZvcndhcmRzKGluc3QpIHtcblxuICBpZihpbnN0LmVuYWJsZURpc3RhbmNlRmlsdGVycykge1xuICAgIC8vIEZpbGwgaW4gdGhlIGdhcHNcbiAgICAvLyBEaXNhYmxlIGlzIG5vdCBvdmVyIHplcm9cbiAgICBpZihpbnN0LmFkZFREaWZFbXB0eU1ldGVycyA+IDApIHtcbiAgICAgIC8vIE1ha2UgYXJyYXlcbiAgICAgIHZhciBudW1iZXJPZlJlZHVjZWQgPSAwO1xuICAgICAgdmFyIGRpc3RhbmNlVG90YWxQWCA9IG51bGw7XG4gICAgICAvL2NvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24gPSBbW05TTXV0YWJsZUFycmF5IGFsbG9jXSBpbml0XTtcbiAgICAgIC8vSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uID0gbmlsO1xuICAgICAgLy9DR1BvaW50IGZpcnN0UG9pbnQ7XG4gICAgICAvLyBVc2UgeHlTY2FsZVxuICAgICAgdmFyIHRoZUFic29yYmluZ0Rpc3RhbmNlID0gX18uY29udmVydE1ldGVyc1RvUGl4ZWxzKGluc3QuYWRkVERpZkVtcHR5TWV0ZXJzLCBpbnN0LnhTY2FsZSk7XG4gICAgICAvLyBHZXQgcHJldmlvdXNcbiAgICAgIHZhciBpbmRleE9mUmVmZXJlbmNlRm9yd2FyZCA9IDA7XG4gICAgICB2YXIgbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24gPSBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheVswXTtcbiAgICAgIHZhciBwcmV2aW91c1BvaW50ID0gW2xhc3RTdGFuZGluZ0luc3RydWN0aW9uLndwLngsIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uLndwLnldO1xuICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBlbHNlXG4gICAgICB2YXIgbG9vcFRvMyA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICBmb3IodmFyIGkgPSAxOyBpIDwgbG9vcFRvMzsgaSsrKSB7XG4gICAgICAgIC8vIEdldCBkaXJlY3Rpb25cbiAgICAgICAgdmFyIG5leHRJbnN0cnVjdGlvbiA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5W2ldO1xuICAgICAgICB2YXIgbmV4dFBvaW50ID0gW25leHRJbnN0cnVjdGlvbi53cC54LCBuZXh0SW5zdHJ1Y3Rpb24ud3AueV07XG5cbiAgICAgICAgLy8gRm9yd2FyZD9cbiAgICAgICAgaWYobmV4dEluc3RydWN0aW9uLmRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpID09PSAnRm9yd2FyZCcudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIC8vIFByb2Nlc3NcblxuICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgYmV0d2VlbiBmaXJzdCBhbmQgbGFzdFxuICAgICAgICAgIC8vIERpc3RhbmNlIGluIHB4XG4gICAgICAgICAgZGlzdGFuY2VUb3RhbFBYID0gX18uZGlzdGFuY2VCZXR3ZWVuKHByZXZpb3VzUG9pbnQsIG5leHRQb2ludCk7XG5cbiAgICAgICAgICAvLyBXaXRoaW4gYWJzb3JiaW5nIGRpc3RhbmNlP1xuICAgICAgICAgIGlmKGRpc3RhbmNlVG90YWxQWCA8IHRoZUFic29yYmluZ0Rpc3RhbmNlKSB7XG4gICAgICAgICAgICAvLyBQYWNNYW4gaXRcbiAgICAgICAgICAgIC8vIENhcnJ5IGFuZ2xlVG8gYmFjayBhbmQgZm9ydGhcbiAgICAgICAgICAgIC8vLi4uXG5cbiAgICAgICAgICAgIC8vIEZvbGQgdG8gYmFjayBvZiBuZXh0IG5leHRcbiAgICAgICAgICAgIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uLmZvbGRJbkZyb250KG5leHRJbnN0cnVjdGlvbik7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBmcm9tIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheVxuICAgICAgICAgICAgaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgICAgICBudW1iZXJPZlJlZHVjZWQrKztcblxuICAgICAgICAgICAgLy8gRGVjIGxvb3BUb1xuICAgICAgICAgICAgbG9vcFRvMy0tO1xuICAgICAgICAgICAgLy8gR28gYmFjayBvbmUgaW5kZXhcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gT3V0c2lkZSBvZiB0aGVBYnNvcmJpbmdEaXN0YW5jZVxuICAgICAgICAgICAgLy8gUmVzZXQgY3ljbGVcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnQgPSBbMCwgMF07XG5cbiAgICAgICAgICAgIC8vIFBpY2sgdXAgZmlyc3QgaW4gY3ljbGVcbiAgICAgICAgICAgIGlmKHRydWUpXG4gICAgICAgICAgICAvL2lmKFtuZXh0SW5zdHJ1Y3Rpb24uZGlyZWN0aW9uLmxvd2VyY2FzZVN0cmluZyBpc0VxdWFsVG9TdHJpbmc6QFwiRm9yd2FyZFwiLmxvd2VyY2FzZVN0cmluZ10pXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uID0gbmV4dEluc3RydWN0aW9uO1xuICAgICAgICAgICAgICBpbmRleE9mUmVmZXJlbmNlRm9yd2FyZCA9IGk7XG4gICAgICAgICAgICAgIHByZXZpb3VzUG9pbnQgPSBbbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24ud3AueCwgbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24ud3AueV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIElmIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uIGlmIEZvcndhcmQgYW5kIG5leHQgaW5zdHJ1Y3Rpb24gaXMgbm90IGZvcndhcmQgYW5kIGlmIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uIGlzIHdpdGhpbiBkaXN0YW5jZSwgZWxtaW5hdGUgc2VsZlxuICAgICAgICAvL2Vsc2UgaWYoTk8pXG4gICAgICAgIGVsc2UgaWYobGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24uZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgPT09ICdGb3J3YXJkJy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgLy8gbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb25cblxuICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgYmV0d2VlbiBmaXJzdCBhbmQgbGFzdFxuICAgICAgICAgIC8vIERpc3RhbmNlIGluIHB4XG4gICAgICAgICAgZGlzdGFuY2VUb3RhbFBYID0gX18uZGlzdGFuY2VCZXR3ZWVuKHByZXZpb3VzUG9pbnQsIG5leHRQb2ludCk7XG5cbiAgICAgICAgICAvLyBXaXRoaW4gYWJzb3JiaW5nIGRpc3RhbmNlP1xuICAgICAgICAgIGlmKGRpc3RhbmNlVG90YWxQWCA8IHRoZUFic29yYmluZ0Rpc3RhbmNlKSB7XG4gICAgICAgICAgICAvLyBQYWNNYW4gc2VsZlxuICAgICAgICAgICAgLy8gQ2FycnkgYW5nbGVUbyBiYWNrIGFuZCBmb3J0aFxuICAgICAgICAgICAgLy8uLi5cblxuICAgICAgICAgICAgLy8gTm90IGlmIGZpcnN0XG4gICAgICAgICAgICAvLyBGb2xkIGl0IHRvIHByZXZpb3VzXG4gICAgICAgICAgICBpZigwICE9PSBpbmRleE9mUmVmZXJlbmNlRm9yd2FyZCkge1xuICAgICAgICAgICAgICAvLyBGb2xkIGl0IGluIG5leHQgYmVoaW5kXG4gICAgICAgICAgICAgIG5leHRJbnN0cnVjdGlvbi5mb2xkVG9CYWNrKGxhc3RTdGFuZGluZ0luc3RydWN0aW9uKTtcblxuICAgICAgICAgICAgICAvLyBSZW1vdmUgZnJvbSB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlcbiAgICAgICAgICAgICAgaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkuc3BsaWNlKGluZGV4T2ZSZWZlcmVuY2VGb3J3YXJkLCAxKTtcblxuICAgICAgICAgICAgICBudW1iZXJPZlJlZHVjZWQrKztcblxuICAgICAgICAgICAgICAvLyBEZWMgbG9vcFRvXG4gICAgICAgICAgICAgIGxvb3BUbzMtLTtcbiAgICAgICAgICAgICAgLy8gR28gYmFjayBvbmUgaW5kZXhcbiAgICAgICAgICAgICAgLy8gRG9uJ3QgcHJldiBpbmRleCwgYmVjYXVzZSB3ZSBoYXZlIHRvIHNraXAgdG8gbmV4dFxuICAgICAgICAgICAgICAvL2ktLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU2tpcCB0byBuZXh0IHBvaW50P1xuICAgICAgICAgIC8vIFNldCBuZXcgcHJldmlvdXNcbiAgICAgICAgICBsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcbiAgICAgICAgICBpbmRleE9mUmVmZXJlbmNlRm9yd2FyZCA9IGk7XG4gICAgICAgICAgcHJldmlvdXNQb2ludCA9IFtsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbi53cC54LCBsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbi53cC55XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBEaXJlY3Rpb24gY2hhbmdlXG4gICAgICAgICAgLy8gUGljayB1cCBmaXJzdCBpbiBjeWNsZVxuICAgICAgICAgIGlmKHRydWUpXG4gICAgICAgICAgLy9pZihbbmV4dEluc3RydWN0aW9uLmRpcmVjdGlvbi5sb3dlcmNhc2VTdHJpbmcgaXNFcXVhbFRvU3RyaW5nOkBcIkZvcndhcmRcIi5sb3dlcmNhc2VTdHJpbmddKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uID0gbmV4dEluc3RydWN0aW9uO1xuICAgICAgICAgICAgaW5kZXhPZlJlZmVyZW5jZUZvcndhcmQgPSBpO1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludCA9IFtsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbi53cC54LCBsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbi53cC55XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vTlNMb2coQFwibnVtYmVyT2ZSZWR1Y2VkOiAlZFwiLCBudW1iZXJPZlJlZHVjZWQpO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vKlxuXG4vLyBGaWx0ZXIgTm8uNCBSZW1vdmUgY29uc2VjdXRpdmUgRm9yd2FyZHNcbi0odm9pZClmaWx0ZXJObzRSZW1vdmVDb25zZWN1dGl2ZUZvcndhcmRzOihOU011dGFibGVBcnJheSAqKil0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzOihKTWFwUGF0aFBlckZsb29yICopdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzIHdheWZpbmRBcnJheTooTlNBcnJheSAqKXdheWZpbmRBcnJheSBmaWx0ZXJPbjooQk9PTClmaWx0ZXJPbiBhZGRURGlmRW1wdHlNZXRlcnM6KGZsb2F0KWFkZFREaWZFbXB0eU1ldGVycyBVVHVybkluTWV0ZXJzOihmbG9hdClVVHVybkluTWV0ZXJzIGVuYWJsZURpc3RhbmNlRmlsdGVyczooQk9PTCllbmFibGVEaXN0YW5jZUZpbHRlcnMgeFNjYWxlOihmbG9hdCl4U2NhbGUgeVNjYWxlOihmbG9hdCl5U2NhbGUgY3VycmVudEZsb29yVEQ6KEpNYXBGbG9vciAqKWN1cnJlbnRGbG9vclREIGN1ckNhbnZhczooSk1hcENhbnZhcyAqKWN1ckNhbnZhc1xue1xuICAgIGlmKGVuYWJsZURpc3RhbmNlRmlsdGVycylcbiAgICB7XG4gICAgICAgIC8vIEZpbGwgaW4gdGhlIGdhcHNcbiAgICAgICAgLy8gRGlzYWJsZSBpcyBub3Qgb3ZlciB6ZXJvXG4gICAgICAgIGlmKGFkZFREaWZFbXB0eU1ldGVycyA+IDAuMClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gTWFrZSBhcnJheVxuICAgICAgICAgICAgaW50IG51bWJlck9mUmVkdWNlZCA9IDA7XG4gICAgICAgICAgICAvL2NvbnNlY3V0aXZlQXJyYXlEaXJlY3Rpb24gPSBbW05TTXV0YWJsZUFycmF5IGFsbG9jXSBpbml0XTtcbiAgICAgICAgICAgIC8vSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uID0gbmlsO1xuICAgICAgICAgICAgLy9DR1BvaW50IGZpcnN0UG9pbnQ7XG4gICAgICAgICAgICAvLyBVc2UgeHlTY2FsZVxuICAgICAgICAgICAgZmxvYXQgdGhlQWJzb3JiaW5nRGlzdGFuY2UgPSBbVUlLaXRIZWxwZXIgY29udmVydE1ldGVyc1RvUGl4ZWxzOmFkZFREaWZFbXB0eU1ldGVycyB1c2luZ1hZU2NhbGU6eFNjYWxlXTtcbiAgICAgICAgICAgIC8vIEdldCBwcmV2aW91c1xuICAgICAgICAgICAgTlNJbnRlZ2VyIGluZGV4T2ZSZWZlcmVuY2VGb3J3YXJkID0gMDtcbiAgICAgICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmxhc3RTdGFuZGluZ0luc3RydWN0aW9uID0gWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgb2JqZWN0QXRJbmRleDowXTtcbiAgICAgICAgICAgIENHUG9pbnQgcHJldmlvdXNQb2ludCA9IENHUG9pbnRNYWtlKGxhc3RTdGFuZGluZ0luc3RydWN0aW9uLndwLnguZmxvYXRWYWx1ZSwgbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24ud3AueS5mbG9hdFZhbHVlKTtcbiAgICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgZWxzZVxuICAgICAgICAgICAgTlNJbnRlZ2VyIGxvb3BUbzMgPSBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBjb3VudF0gLSAxO1xuICAgICAgICAgICAgZm9yKGludCBpID0gMTsgaSA8IGxvb3BUbzM7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqbmV4dEluc3RydWN0aW9uID0gWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgb2JqZWN0QXRJbmRleDppXTtcbiAgICAgICAgICAgICAgICBDR1BvaW50IG5leHRQb2ludCA9IENHUG9pbnRNYWtlKG5leHRJbnN0cnVjdGlvbi53cC54LmZsb2F0VmFsdWUsIG5leHRJbnN0cnVjdGlvbi53cC55LmZsb2F0VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gRm9yd2FyZD9cbiAgICAgICAgICAgICAgICBpZihbbmV4dEluc3RydWN0aW9uLmRpcmVjdGlvbi5sb3dlcmNhc2VTdHJpbmcgaXNFcXVhbFRvU3RyaW5nOkBcIkZvcndhcmRcIi5sb3dlcmNhc2VTdHJpbmddKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2Vzc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIGZpcnN0IGFuZCBsYXN0XG4gICAgICAgICAgICAgICAgICAgIC8vIERpc3RhbmNlIGluIHB4XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGRpc3RhbmNlVG90YWxQWCA9IFtVSUtpdEhlbHBlciBkaXN0YW5jZUJldHdlZW46cHJldmlvdXNQb2ludCBhbmQ6bmV4dFBvaW50XTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFdpdGhpbiBhYnNvcmJpbmcgZGlzdGFuY2U/XG4gICAgICAgICAgICAgICAgICAgIGlmKGRpc3RhbmNlVG90YWxQWCA8IHRoZUFic29yYmluZ0Rpc3RhbmNlKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQYWNNYW4gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhcnJ5IGFuZ2xlVG8gYmFjayBhbmQgZm9ydGhcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLi4uXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb2xkIGl0IHRvIGJhY2sgb2YgbmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTlNJbnRlZ2VyIG5leHROZXh0SW5kZXggPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmKG5leHROZXh0SW5kZXggPCBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBjb3VudF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgLy8gQ2FuIGRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqbmV4dE5leHRJbnN0cnVjdGlvbiA9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IG9iamVjdEF0SW5kZXg6bmV4dE5leHRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb2xkIHRvIGJhY2sgb2YgbmV4dCBuZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2xhc3RTdGFuZGluZ0luc3RydWN0aW9uIGZvbGRJbkZyb250Om5leHRJbnN0cnVjdGlvbl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGZyb20gdGV4dERpcmVjdGlvbnNGbG9vckFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgcmVtb3ZlT2JqZWN0QXRJbmRleDppXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1iZXJPZlJlZHVjZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEZWMgbG9vcFRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFRvMy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvIGJhY2sgb25lIGluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPdXRzaWRlIG9mIHRoZUFic29yYmluZ0Rpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBjeWNsZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNQb2ludCA9IENHUG9pbnRaZXJvO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQaWNrIHVwIGZpcnN0IGluIGN5Y2xlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihZRVMpXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmKFtuZXh0SW5zdHJ1Y3Rpb24uZGlyZWN0aW9uLmxvd2VyY2FzZVN0cmluZyBpc0VxdWFsVG9TdHJpbmc6QFwiRm9yd2FyZFwiLmxvd2VyY2FzZVN0cmluZ10pXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhPZlJlZmVyZW5jZUZvcndhcmQgPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzUG9pbnQgPSBDR1BvaW50TWFrZShsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbi53cC54LmZsb2F0VmFsdWUsIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uLndwLnkuZmxvYXRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24gaWYgRm9yd2FyZCBhbmQgbmV4dCBpbnN0cnVjdGlvbiBpcyBub3QgZm9yd2FyZCBhbmQgaWYgbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24gaXMgd2l0aGluIGRpc3RhbmNlLCBlbG1pbmF0ZSBzZWxmXG4gICAgICAgICAgICAgICAgLy9lbHNlIGlmKE5PKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoW2xhc3RTdGFuZGluZ0luc3RydWN0aW9uLmRpcmVjdGlvbi5sb3dlcmNhc2VTdHJpbmcgaXNFcXVhbFRvU3RyaW5nOkBcIkZvcndhcmRcIi5sb3dlcmNhc2VTdHJpbmddKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb25cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgYmV0d2VlbiBmaXJzdCBhbmQgbGFzdFxuICAgICAgICAgICAgICAgICAgICAvLyBEaXN0YW5jZSBpbiBweFxuICAgICAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZVRvdGFsUFggPSBbVUlLaXRIZWxwZXIgZGlzdGFuY2VCZXR3ZWVuOnByZXZpb3VzUG9pbnQgYW5kOm5leHRQb2ludF07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBXaXRoaW4gYWJzb3JiaW5nIGRpc3RhbmNlP1xuICAgICAgICAgICAgICAgICAgICBpZihkaXN0YW5jZVRvdGFsUFggPCB0aGVBYnNvcmJpbmdEaXN0YW5jZSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGFjTWFuIHNlbGZcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhcnJ5IGFuZ2xlVG8gYmFjayBhbmQgZm9ydGhcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLi4uXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBpZiBmaXJzdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9sZCBpdCB0byBwcmV2aW91c1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoMCAhPSBpbmRleE9mUmVmZXJlbmNlRm9yd2FyZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb2xkIGl0IGluIG5leHQgYmVoaW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW25leHRJbnN0cnVjdGlvbiBmb2xkVG9CYWNrOmxhc3RTdGFuZGluZ0luc3RydWN0aW9uXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgZnJvbSB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSByZW1vdmVPYmplY3RBdEluZGV4OmluZGV4T2ZSZWZlcmVuY2VGb3J3YXJkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1iZXJPZlJlZHVjZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEZWMgbG9vcFRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFRvMy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvIGJhY2sgb25lIGluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgcHJldiBpbmRleCwgYmVjYXVzZSB3ZSBoYXZlIHRvIHNraXAgdG8gbmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFNraXAgdG8gbmV4dCBwb2ludD9cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IG5ldyBwcmV2aW91c1xuICAgICAgICAgICAgICAgICAgICBsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhPZlJlZmVyZW5jZUZvcndhcmQgPSBpO1xuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c1BvaW50ID0gQ0dQb2ludE1ha2UobGFzdFN0YW5kaW5nSW5zdHJ1Y3Rpb24ud3AueC5mbG9hdFZhbHVlLCBsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbi53cC55LmZsb2F0VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBEaXJlY3Rpb24gY2hhbmdlXG4gICAgICAgICAgICAgICAgICAgIC8vIFBpY2sgdXAgZmlyc3QgaW4gY3ljbGVcbiAgICAgICAgICAgICAgICAgICAgaWYoWUVTKVxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZihbbmV4dEluc3RydWN0aW9uLmRpcmVjdGlvbi5sb3dlcmNhc2VTdHJpbmcgaXNFcXVhbFRvU3RyaW5nOkBcIkZvcndhcmRcIi5sb3dlcmNhc2VTdHJpbmddKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4T2ZSZWZlcmVuY2VGb3J3YXJkID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzUG9pbnQgPSBDR1BvaW50TWFrZShsYXN0U3RhbmRpbmdJbnN0cnVjdGlvbi53cC54LmZsb2F0VmFsdWUsIGxhc3RTdGFuZGluZ0luc3RydWN0aW9uLndwLnkuZmxvYXRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL05TTG9nKEBcIm51bWJlck9mUmVkdWNlZDogJWRcIiwgbnVtYmVyT2ZSZWR1Y2VkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuKi9cbiIsInZhciBfXyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb250aW51ZVBhc3QoaW5zdCkge1xuXG4gIGlmKGluc3QuZW5hYmxlRGlzdGFuY2VGaWx0ZXJzKSB7XG4gICAgLy8gRmlsbCBpbiB0aGUgZ2Fwc1xuICAgIC8vIERpc2FibGUgaXMgbm90IG92ZXIgemVyb1xuICAgIGlmKGluc3QuYWRkVERpZkVtcHR5TWV0ZXJzID4gMCkge1xuICAgICAgLy8gVXNlIHh5U2NhbGVcbiAgICAgIHZhciB0aGVEaXN0YW5jZSA9IF9fLmNvbnZlcnRNZXRlcnNUb1BpeGVscyhpbnN0LmFkZFREaWZFbXB0eU1ldGVycywgaW5zdC54U2NhbGUpO1xuICAgICAgLy8gTGFuZ3VhZ2UgZmlsdGVyczpcbiAgICAgIHZhciBsb29wVG9Db250aW51ZVBhc3QgPSBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGggLSAxO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGxvb3BUb0NvbnRpbnVlUGFzdDsgaSsrKSB7XG4gICAgICAgIC8vIEdldCBkaXJlY3Rpb25cbiAgICAgICAgdmFyIGluc3RydWN0aW9uMSA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5W2ldO1xuXG4gICAgICAgIC8vIEdldCBuZXh0XG4gICAgICAgIHZhciBpbnN0cnVjdGlvbjIgPSBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheVtpICsgMV07XG5cbiAgICAgICAgLy8gTmVlZCB0d28gY29uc2VjdXRpdmUgd2F5cG9pbnRzIG9uIHN0cmFpZ2h0IGxpbmUuXG4gICAgICAgIC8vIElmIGluc3RydWN0aW9uIGhhcyBmb2xkZWQgcG9pbnRzIHVzZSB0aGUgd29sZGVkIHBvaW50IGF0IGl0cyBlbmQgb2YgYXJyYXlcbiAgICAgICAgLy8gSWYgbm8gZm9sZGVkIHBvaW50cywgdXNlIHdwIG9mIGluc3RydWN0aW9uXG4gICAgICAgIHZhciB1c2VkSW5zdHJ1Y3Rpb24xO1xuICAgICAgICB2YXIgdXNlZEluc3RydWN0aW9uMjtcblxuICAgICAgICAvLyBGcm9tIHBvaW50XG4gICAgICAgIHZhciB3YXlwb2ludDE7XG4gICAgICAgIHVzZWRJbnN0cnVjdGlvbjEgPSBpbnN0cnVjdGlvbjE7XG4gICAgICAgIHdheXBvaW50MSA9IHVzZWRJbnN0cnVjdGlvbjEud3A7XG4gICAgICAgIHZhciBwb2ludDEgPSBbd2F5cG9pbnQxLngsIHdheXBvaW50MS55XTtcblxuICAgICAgICAvLyBUbyBwb2ludFxuICAgICAgICB2YXIgd2F5cG9pbnQyO1xuICAgICAgICB1c2VkSW5zdHJ1Y3Rpb24yID0gaW5zdHJ1Y3Rpb24yO1xuICAgICAgICB3YXlwb2ludDIgPSB1c2VkSW5zdHJ1Y3Rpb24yLndwO1xuICAgICAgICB2YXIgcG9pbnQyID0gW3dheXBvaW50Mi54LCB3YXlwb2ludDIueV07XG5cbiAgICAgICAgLy8gR2V0IGRpc3RhbmNlIGluIHBpeGVsc1xuICAgICAgICB2YXIgZGlzdGFuY2VJblBYID0gX18uZGlzdGFuY2VCZXR3ZWVuKHBvaW50MSwgcG9pbnQyKTtcblxuICAgICAgICAvLyBPdmVyP1xuICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IC0xO1xuICAgICAgICB2YXIgZXZlbkRpc3RhbmNlID0gLTE7XG4gICAgICAgIC8vIEhvdyBtYW55IHBvaW50cz9cbiAgICAgICAgdmFyIGRlbm9taW5hdG9yID0gcGFyc2VJbnQoZGlzdGFuY2VJblBYIC8gdGhlRGlzdGFuY2UpO1xuICAgICAgICBpZihkZW5vbWluYXRvciA+IDEpIHtcbiAgICAgICAgICAvLyBHZXQgc29mdCBkaWZmZXJlbmNlXG5cbiAgICAgICAgICBkaWZmZXJlbmNlID0gKGRpc3RhbmNlSW5QWCAtICh0aGVEaXN0YW5jZSAqIGRlbm9taW5hdG9yKSkgLyBkZW5vbWluYXRvcjtcbiAgICAgICAgICBldmVuRGlzdGFuY2UgPSB0aGVEaXN0YW5jZSArIGRpZmZlcmVuY2U7XG4gICAgICAgICAgLy8gR2VuZXJhdGUgYWxsIHBvaW50cyB0aGF0IHdvdWxkIGZpdCB0aGUgZ2FwXG4gICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IChkZW5vbWluYXRvciAtIDEpOyBqKyspIHtcbiAgICAgICAgICAgIC8vIE1ha2UgbmV3IHBvaW50XG4gICAgICAgICAgICB2YXIgbmV3UG9pbnQgPSBfXy5wb2ludE9uTGluZVVzaW5nRGlzdGFuY2VGcm9tU3RhcnQocG9pbnQxLCBwb2ludDIsIGV2ZW5EaXN0YW5jZSk7XG5cbiAgICAgICAgICAgIC8vIENvcnJlY3QgdGhlIHBvaW50IHNvIGl0J3Mgb24gdGhlIHBhdGhcbiAgICAgICAgICAgIG5ld1BvaW50ID0gX18uY29ycmVjdFBvaW50VXNpbmdXYXlmaW5kUGF0aChpbnN0LnVzZUFycmF5T2ZGbG9vcldheXBvaW50cywgbmV3UG9pbnQsIDApO1xuXG4gICAgICAgICAgICAvLyBUdXJuIGludG8gdGV4dCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHZhciBuZXh0SW5zZXJ0RGlyID0ge307XG5cbiAgICAgICAgICAgIC8vIFBvcHVsYXRlIGZpZWxkc1xuICAgICAgICAgICAgbmV4dEluc2VydERpci5mbG9vciA9IGluc3QuY3VycmVudEZsb29yVEQuaWQ7XG4gICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmZsb29yTmFtZSA9IGluc3QuY3VycmVudEZsb29yVEQubmFtZTtcbiAgICAgICAgICAgIG5leHRJbnNlcnREaXIud3AgPSB7XG4gICAgICAgICAgICAgIHg6IG5ld1BvaW50WzBdLFxuICAgICAgICAgICAgICB5OiBuZXdQb2ludFsxXSxcbiAgICAgICAgICAgICAgbWFwSWQ6IGluc3QuY3VycmVudEZsb29yVEQuaWRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmRpcmVjdGlvbiA9IHVzZWRJbnN0cnVjdGlvbjEuZGlyZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBHZXQgQW5nbGUgdG8gbmV4dFxuICAgICAgICAgICAgdmFyIGFuZ2xlVG9OZXh0ID0gX18ucG9pbnRQYWlyVG9CZWFyaW5nRGVncmVlcyhwb2ludDEsIG5ld1BvaW50KTtcbiAgICAgICAgICAgIG5leHRJbnNlcnREaXIuYW5nbGVUb05leHQgPSBhbmdsZVRvTmV4dDtcbiAgICAgICAgICAgIC8vIEdldCBhbmdsZSB0byBwcmV2aW91c1xuICAgICAgICAgICAgdmFyIGFuZ2xlVG9OZXh0T2ZQcmV2aW91cyA9IF9fLnBvaW50UGFpclRvQmVhcmluZ0RlZ3JlZXMobmV3UG9pbnQsIHBvaW50Mik7XG4gICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmFuZ2xlVG9OZXh0T2ZQcmV2aW91c0RpcmVjdGlvbiA9IGFuZ2xlVG9OZXh0T2ZQcmV2aW91cztcblxuICAgICAgICAgICAgLy8gTGFuZG1hcmtcbiAgICAgICAgICAgIC8vIEdldCBMYW5kbWFyayB1c2luZyBsaW5lIG9mIHNpZ2h0XG4gICAgICAgICAgICAvLyBVc2VkIHRvIGRlc2NyaWJlIHBvaW50IG9mIHJlZmVyZW5jZSBlZy46IFwiV2l0aCAqTGFuZG1hcmsqIG9uIHlvdXIgTGVmdCwgcHJvY2VlZCBGb3J3YXJkXCJcblxuICAgICAgICAgICAgLy8gR2V0IG5lYXJlc3QgZGVzdGluYXRpb24gdXNpbmcgbGluZSBvZiBzaWdodFxuICAgICAgICAgICAgdmFyIHJldHVybkNsb3Nlc3RQb2ludCA9IHtcbiAgICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvL05TRGF0ZSAqc3RhcnRMT1MgPSBbTlNEYXRlIGRhdGVdO1xuICAgICAgICAgICAgdmFyIHRlbXBMYW5kbWFyayA9IHRoaXMubGluZU9mU2lnaHRGcm9tQ2xvc2VzdExhbmRtYXJrVG9YWShcbiAgICAgICAgICAgICAgbmV3UG9pbnQsXG4gICAgICAgICAgICAgIHJldHVybkNsb3Nlc3RQb2ludCxcbiAgICAgICAgICAgICAgbmV4dEluc2VydERpci5kaXJlY3Rpb24sXG4gICAgICAgICAgICAgIG5leHRJbnNlcnREaXIuYW5nbGVUb05leHRPZlByZXZpb3VzRGlyZWN0aW9uLFxuICAgICAgICAgICAgICBpbnN0LmN1ckNhbnZhcyk7XG5cbiAgICAgICAgICAgIGlmKHRlbXBMYW5kbWFyaykge1xuICAgICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmxhbmRtYXJrRGVzdGluYXRpb24gPSB0ZW1wTGFuZG1hcms7XG4gICAgICAgICAgICAgIC8vIEZpbmQgV1Agc28gd2UgY2FuIGFjY3VyYXRlbHkgZGV0ZXJtaW5lIGFuZ2xlIHRvIGRlc3RpbmF0aW9uJ3MgZW50cmFuY2VcbiAgICAgICAgICAgICAgdmFyIGxhbmRtYXJrV1AgPSB0aGlzLm1vZGVsLmdldFdheXBvaW50c0J5RGVzdGluYXRpb25JZChuZXh0SW5zZXJ0RGlyLmxhbmRtYXJrRGVzdGluYXRpb24uaWQpO1xuICAgICAgICAgICAgICBpZihsYW5kbWFya1dQLmxlbmd0aCkge1xuXG4gICAgICAgICAgICAgICAgLy9OT1RFOiBYZXJ4ZXMgdGhpcyBpcyBhbiBpc3N1ZSwgY2hvb3NpbmcgdGhlIGZpcnN0IHdheXBvaW50XG4gICAgICAgICAgICAgICAgbmV4dEluc2VydERpci5sYW5kbWFya1dQID0gbGFuZG1hcmtXUFswXTtcblxuICAgICAgICAgICAgICAgIC8vIEdldCBhbmdsZSBjb21wYXJpbmcgRGlyZWN0aW9uIGFuZ2xlVG9OZXh0XG4gICAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgLy8gR2V0IERpcmVjdGlvblxuICAgICAgICAgICAgICAgIC8vIEZpZ3VyZSBvdXQgdGhlIGFuZ2xlIHRvIG5leHRcbiAgICAgICAgICAgICAgICAvLyBHZXQgYW5nbGVcblxuICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IF9fLnBvaW50UGFpclRvQmVhcmluZ0RlZ3JlZXMobmV3UG9pbnQsIHJldHVybkNsb3Nlc3RQb2ludC52YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgYW5nbGUgdG8gbmV4dFxuICAgICAgICAgICAgICAgIG5leHRJbnNlcnREaXIuYW5nbGVUb0xhbmRtYXJrID0gYW5nbGU7XG5cbiAgICAgICAgICAgICAgICAvLyBXaGF0IGlzIHRoZSBhbmdsZSBkaWZmZXJlbmNlP1xuICAgICAgICAgICAgICAgIHZhciBhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlID0gbmV4dEluc2VydERpci5hbmdsZVRvTmV4dE9mUHJldmlvdXNEaXJlY3Rpb24gLSBuZXh0SW5zZXJ0RGlyLmFuZ2xlVG9MYW5kbWFyaztcbiAgICAgICAgICAgICAgICB3aGlsZShhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlIDwgLTE4MCkgYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSArPSAzNjA7XG4gICAgICAgICAgICAgICAgd2hpbGUoYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSA+IDE4MCkgYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSAtPSAzNjA7XG5cbiAgICAgICAgICAgICAgICAvLyBDb21wdXRlIG5leHQgZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgbmV4dEluc2VydERpci5kaXJlY3Rpb25Ub0xhbmRtYXJrID0gX18uZGlyZWN0aW9uRnJvbUFuZ2xlKGFuZ2xlVG9MYW5kbWFya0RpZmZlcmVuY2UsIG51bGwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgLy8gTm8gZGVzdGluYXRpb25cbiAgICAgICAgICAgICAgbmV4dEluc2VydERpci5sYW5kbWFya0Rlc3RpbmF0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgbmV4dEluc2VydERpci5sYW5kbWFya1dQID0gbnVsbDtcbiAgICAgICAgICAgICAgbmV4dEluc2VydERpci5hbmdsZVRvTGFuZG1hcmsgPSAtMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2V0IG91dHB1dFxuICAgICAgICAgICAgaWYobmV4dEluc2VydERpci5sYW5kbWFya0Rlc3RpbmF0aW9uKSB7XG4gICAgICAgICAgICAgIG5leHRJbnNlcnREaXIub3V0cHV0ID0gX18uc3RyaW5nV2l0aEZvcm1hdCgnQ29udGludWUgUGFzdCAlJywgbmV4dEluc2VydERpci5sYW5kbWFya0Rlc3RpbmF0aW9uLm5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV4dEluc2VydERpci5vdXRwdXQgPSAnQ29udGludWUgUGFzdCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5leHRJbnNlcnREaXIudHlwZSA9ICdjb250aW51ZXBhc3QnO1xuXG4gICAgICAgICAgICAvLyBJbnNlcnQgdG8gYXJyYXlcbiAgICAgICAgICAgIGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5LnNwbGljZShpICsgMSwgMCwgbmV4dEluc2VydERpcik7XG5cbiAgICAgICAgICAgIC8vIEluYyBib3VuZHNcbiAgICAgICAgICAgIGxvb3BUb0NvbnRpbnVlUGFzdCsrO1xuICAgICAgICAgICAgLy8gSW5jIGZvciBsb29wIGRyaXZlclxuICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBkaXN0YW5jZSB1c2luZyBuZXdseSBnZW5lcmF0ZWQgcG9pbnRcbiAgICAgICAgICAgIHBvaW50MSA9IG5ld1BvaW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG59O1xuXG4vKlxuXG4vLyBGaWx0ZXIgTm8uNiBDb250aW51ZSBQYXN0LCBGaWxsZXIhXG4tKHZvaWQpZmlsdGVyTm82Q29udGludWVQYXN0RmlsbGVyOihOU011dGFibGVBcnJheSAqKil0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzOihKTWFwUGF0aFBlckZsb29yICopdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzIHdheWZpbmRBcnJheTooTlNBcnJheSAqKXdheWZpbmRBcnJheSBmaWx0ZXJPbjooQk9PTClmaWx0ZXJPbiBhZGRURGlmRW1wdHlNZXRlcnM6KGZsb2F0KWFkZFREaWZFbXB0eU1ldGVycyBVVHVybkluTWV0ZXJzOihmbG9hdClVVHVybkluTWV0ZXJzIGVuYWJsZURpc3RhbmNlRmlsdGVyczooQk9PTCllbmFibGVEaXN0YW5jZUZpbHRlcnMgeFNjYWxlOihmbG9hdCl4U2NhbGUgeVNjYWxlOihmbG9hdCl5U2NhbGUgY3VycmVudEZsb29yVEQ6KEpNYXBGbG9vciAqKWN1cnJlbnRGbG9vclREIGN1ckNhbnZhczooSk1hcENhbnZhcyAqKWN1ckNhbnZhc1xue1xuICAgIC8vYWRkVERpZkVtcHR5TWV0ZXJzID0gOTtcbiAgICBpZihlbmFibGVEaXN0YW5jZUZpbHRlcnMpXG4gICAge1xuICAgICAgICAvLyBGaWxsIGluIHRoZSBnYXBzXG4gICAgICAgIC8vIERpc2FibGUgaXMgbm90IG92ZXIgemVyb1xuICAgICAgICBpZihhZGRURGlmRW1wdHlNZXRlcnMgPiAwLjApXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFVzZSB4eVNjYWxlXG4gICAgICAgICAgICBmbG9hdCB0aGVEaXN0YW5jZSA9IFtVSUtpdEhlbHBlciBjb252ZXJ0TWV0ZXJzVG9QaXhlbHM6YWRkVERpZkVtcHR5TWV0ZXJzIHVzaW5nWFlTY2FsZTp4U2NhbGVdO1xuICAgICAgICAgICAgLy8gTGFuZ3VhZ2UgZmlsdGVyczpcbiAgICAgICAgICAgIC8vTlNMb2coQFwiY291bnQ6ICVsdVwiLCAodW5zaWduZWQgbG9uZyl0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkuY291bnQpO1xuICAgICAgICAgICAgTlNJbnRlZ2VyIGxvb3BUb0NvbnRpbnVlUGFzdCA9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50XSAtIDE7XG4gICAgICAgICAgICBmb3IoaW50IGkgPSAwOyBpIDwgbG9vcFRvQ29udGludWVQYXN0OyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IGRpcmVjdGlvblxuICAgICAgICAgICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmluc3RydWN0aW9uMSA9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IG9iamVjdEF0SW5kZXg6aV07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9OU0xvZyhAXCIlZDogJUBcIiwgaSwgaW5zdHJ1Y3Rpb24xLmxhbmRtYXJrRGVzdGluYXRpb24ubmFtZSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gR2V0IG5leHRcbiAgICAgICAgICAgICAgICBKTWFwVGV4dERpcmVjdGlvbkluc3RydWN0aW9uICppbnN0cnVjdGlvbjIgPSBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBvYmplY3RBdEluZGV4OihpICsgMSldO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vTlNMb2coQFwiJWQ6ICVAXCIsIGkgKyAxLCBpbnN0cnVjdGlvbjIubGFuZG1hcmtEZXN0aW5hdGlvbi5uYW1lKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHR3byBjb25zZWN1dGl2ZSB3YXlwb2ludHMgb24gc3RyYWlnaHQgbGluZS5cbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0cnVjdGlvbiBoYXMgZm9sZGVkIHBvaW50cyB1c2UgdGhlIHdvbGRlZCBwb2ludCBhdCBpdHMgZW5kIG9mIGFycmF5XG4gICAgICAgICAgICAgICAgLy8gSWYgbm8gZm9sZGVkIHBvaW50cywgdXNlIHdwIG9mIGluc3RydWN0aW9uXG4gICAgICAgICAgICAgICAgSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqdXNlZEluc3RydWN0aW9uMTtcbiAgICAgICAgICAgICAgICBKTWFwVGV4dERpcmVjdGlvbkluc3RydWN0aW9uICp1c2VkSW5zdHJ1Y3Rpb24yO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEZyb20gcG9pbnRcbiAgICAgICAgICAgICAgICBKTWFwV2F5cG9pbnQgKndheXBvaW50MTtcbiAgICAgICAgICAgICAgICAvLyAgaWYoKGluc3RydWN0aW9uMS5mb2xkZWRQb2ludHNGcm9udC5jb3VudCA+IDApICYmIChpID09IDApKVxuICAgICAgICAgICAgICAgIC8vICB7XG4gICAgICAgICAgICAgICAgLy8gIHVzZWRJbnN0cnVjdGlvbjEgPSBbaW5zdHJ1Y3Rpb24xLmZvbGRlZFBvaW50c0Zyb250IGxhc3RPYmplY3RdO1xuICAgICAgICAgICAgICAgIC8vICB9XG4gICAgICAgICAgICAgICAgLy8gIGVsc2VcbiAgICAgICAgICAgICAgICAvLyAge1xuICAgICAgICAgICAgICAgIC8vICB1c2VkSW5zdHJ1Y3Rpb24xID0gaW5zdHJ1Y3Rpb24xO1xuICAgICAgICAgICAgICAgIC8vICB9XG4gICAgICAgICAgICAgICAgdXNlZEluc3RydWN0aW9uMSA9IGluc3RydWN0aW9uMTtcbiAgICAgICAgICAgICAgICB3YXlwb2ludDEgPSB1c2VkSW5zdHJ1Y3Rpb24xLndwO1xuICAgICAgICAgICAgICAgIENHUG9pbnQgcG9pbnQxID0gQ0dQb2ludE1ha2Uod2F5cG9pbnQxLnguZmxvYXRWYWx1ZSwgd2F5cG9pbnQxLnkuZmxvYXRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gVG8gcG9pbnRcbiAgICAgICAgICAgICAgICBKTWFwV2F5cG9pbnQgKndheXBvaW50MjtcbiAgICAgICAgICAgICAgICAvLyAgaWYoKGluc3RydWN0aW9uMi5mb2xkZWRQb2ludHNCYWNrLmNvdW50ID4gMCkgJiYgKChpICsgMSkgPT0gbG9vcFRvQ29udGludWVQYXN0KSlcbiAgICAgICAgICAgICAgICAvLyAge1xuICAgICAgICAgICAgICAgIC8vICB1c2VkSW5zdHJ1Y3Rpb24yID0gW2luc3RydWN0aW9uMi5mb2xkZWRQb2ludHNCYWNrIGxhc3RPYmplY3RdO1xuICAgICAgICAgICAgICAgIC8vICB9XG4gICAgICAgICAgICAgICAgLy8gIGVsc2VcbiAgICAgICAgICAgICAgICAvLyAge1xuICAgICAgICAgICAgICAgIC8vICB1c2VkSW5zdHJ1Y3Rpb24yID0gaW5zdHJ1Y3Rpb24yO1xuICAgICAgICAgICAgICAgIC8vICB9XG4gICAgICAgICAgICAgICAgdXNlZEluc3RydWN0aW9uMiA9IGluc3RydWN0aW9uMjtcbiAgICAgICAgICAgICAgICB3YXlwb2ludDIgPSB1c2VkSW5zdHJ1Y3Rpb24yLndwO1xuICAgICAgICAgICAgICAgIENHUG9pbnQgcG9pbnQyID0gQ0dQb2ludE1ha2Uod2F5cG9pbnQyLnguZmxvYXRWYWx1ZSwgd2F5cG9pbnQyLnkuZmxvYXRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gVmlzdWFsaXplIHVuaXQgdGVzdHNcbiAgICAgICAgICAgICAgICAvLyAgZGlzcGF0Y2hfYXN5bmMoZGlzcGF0Y2hfZ2V0X21haW5fcXVldWUoKSwgXntcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vICBVSUNvbG9yICpybmRDb2wgPSBbVUlLaXRIZWxwZXIgcmFuZG9tQ29sb3JdO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gIFVJVmlldyAqYWRkZWRUZXh0RGlyMSA9IFtbVUlWaWV3IGFsbG9jXSBpbml0V2l0aEZyYW1lOkNHUmVjdE1ha2UocG9pbnQxLnggLSAyMCwgcG9pbnQxLnkgLSAyMCwgNDAsIDQwKV07XG4gICAgICAgICAgICAgICAgLy8gIFthZGRlZFRleHREaXIxIHNldEJhY2tncm91bmRDb2xvcjpybmRDb2xdO1xuICAgICAgICAgICAgICAgIC8vICBbW3NlbGYgZ2V0Q3VycmVudEZsb29yVmlld10gYWRkU3VidmlldzphZGRlZFRleHREaXIxXTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vICBVSVZpZXcgKmFkZGVkVGV4dERpcjIgPSBbW1VJVmlldyBhbGxvY10gaW5pdFdpdGhGcmFtZTpDR1JlY3RNYWtlKHBvaW50Mi54IC0gMjAsIHBvaW50Mi55IC0gMjAsIDQwLCA0MCldO1xuICAgICAgICAgICAgICAgIC8vICBbYWRkZWRUZXh0RGlyMiBzZXRCYWNrZ3JvdW5kQ29sb3I6cm5kQ29sXTtcbiAgICAgICAgICAgICAgICAvLyAgW1tzZWxmIGdldEN1cnJlbnRGbG9vclZpZXddIGFkZFN1YnZpZXc6YWRkZWRUZXh0RGlyMl07XG4gICAgICAgICAgICAgICAgLy8gIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEdldCBkaXN0YW5jZSBpbiBwaXhlbHNcbiAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZUluUFggPSBbVUlLaXRIZWxwZXIgZGlzdGFuY2VCZXR3ZWVuOnBvaW50MSBhbmQ6cG9pbnQyXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBPdmVyP1xuICAgICAgICAgICAgICAgIGZsb2F0IGRpZmZlcmVuY2UgPSAtMTtcbiAgICAgICAgICAgICAgICBmbG9hdCBldmVuRGlzdGFuY2UgPSAtMTtcbiAgICAgICAgICAgICAgICAvLyBIb3cgbWFueSBwb2ludHM/XG4gICAgICAgICAgICAgICAgaW50IGRlbm9taW5hdG9yID0gZGlzdGFuY2VJblBYIC8gdGhlRGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgaWYoZGVub21pbmF0b3IgPiAxKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHNvZnQgZGlmZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBVSUNvbG9yICpyYW5kb21Db2xvciA9IFtVSUtpdEhlbHBlciByYW5kb21Db2xvcl07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZGlmZmVyZW5jZSA9IChkaXN0YW5jZUluUFggLSAodGhlRGlzdGFuY2UgKiBkZW5vbWluYXRvcikpIC8gZGVub21pbmF0b3I7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW5EaXN0YW5jZSA9IHRoZURpc3RhbmNlICsgZGlmZmVyZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYWxsIHBvaW50cyB0aGF0IHdvdWxkIGZpdCB0aGUgZ2FwXG4gICAgICAgICAgICAgICAgICAgIGZvcihpbnQgaiA9IDA7IGogPCAoZGVub21pbmF0b3IgLSAxKTsgaisrKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIG5ldyBwb2ludFxuICAgICAgICAgICAgICAgICAgICAgICAgQ0dQb2ludCBuZXdQb2ludCA9IFtVSUtpdEhlbHBlciBwb2ludE9uTGluZVVzaW5nRGlzdGFuY2VGcm9tU3RhcnQ6cG9pbnQxIGxwMjpwb2ludDIgZGlzdGFuY2VGcm9tUDE6ZXZlbkRpc3RhbmNlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29ycmVjdCB0aGUgcG9pbnQgc28gaXQncyBvbiB0aGUgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UG9pbnQgPSBbc2VsZiBjb3JyZWN0UG9pbnRVc2luZ1dheWZpbmRQYXRoOnVzZUFycmF5T2ZGbG9vcldheXBvaW50cyBwb2ludDpuZXdQb2ludCBub0Z1cnRoZXJUaGFuOjBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUdXJuIGludG8gdGV4dCBkaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKm5leHRJbnNlcnREaXIgPSBbW0pNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gYWxsb2NdIGluaXRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQb3B1bGF0ZSBmaWVsZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbnNlcnREaXIuZmxvb3IgPSBjdXJyZW50Rmxvb3JURC5tYXBJZC5pbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbnNlcnREaXIuZmxvb3JOYW1lID0gY3VycmVudEZsb29yVEQubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbnNlcnREaXIud3AgPSBbW0pNYXBXYXlwb2ludCBhbGxvY10gaW5pdFdpdGhDR1BvaW50OltOU1ZhbHVlIHZhbHVlV2l0aENHUG9pbnQ6bmV3UG9pbnRdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbnNlcnREaXIuZGlyZWN0aW9uID0gdXNlZEluc3RydWN0aW9uMS5kaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCBBbmdsZSB0byBuZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdCBhbmdsZVRvTmV4dCA9IFtVSUtpdEhlbHBlciBwb2ludFBhaXJUb0JlYXJpbmdEZWdyZWVzOnBvaW50MSBlbmRpbmdQb2ludDpuZXdQb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmFuZ2xlVG9OZXh0ID0gYW5nbGVUb05leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgYW5nbGUgdG8gcHJldmlvdXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IGFuZ2xlVG9OZXh0T2ZQcmV2aW91cyA9IFtVSUtpdEhlbHBlciBwb2ludFBhaXJUb0JlYXJpbmdEZWdyZWVzOm5ld1BvaW50IGVuZGluZ1BvaW50OnBvaW50Ml07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmFuZ2xlVG9OZXh0T2ZQcmV2aW91c0RpcmVjdGlvbiA9IGFuZ2xlVG9OZXh0T2ZQcmV2aW91cztcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVmlzdWFsaXplIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgaWYoTk8pXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGRpc3BhdGNoX2FzeW5jKGRpc3BhdGNoX2dldF9tYWluX3F1ZXVlKCksIF57XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgLy8gRm9yIG5vdyBqdXN0IGRyYXcgb24gbWFwXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIC8vIE1hcmsgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBVSUxhYmVsICpmcm9tVmlldyA9IFtbVUlMYWJlbCBhbGxvY10gaW5pdFdpdGhGcmFtZTpDR1JlY3RNYWtlKG5ld1BvaW50LnggLSAxMCwgbmV3UG9pbnQueSAtIDEwLCAyMCwgMjApXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBmcm9tVmlldy5iYWNrZ3JvdW5kQ29sb3IgPSByYW5kb21Db2xvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBmcm9tVmlldy50ZXh0ID0gW05TU3RyaW5nIHN0cmluZ1dpdGhGb3JtYXQ6QFwiJWRcIiwgal07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgW1tzZWxmIGdldEN1cnJlbnRGbG9vclZpZXddIGFkZFN1YnZpZXc6ZnJvbVZpZXddO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGFuZG1hcmtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCBMYW5kbWFyayB1c2luZyBsaW5lIG9mIHNpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2VkIHRvIGRlc2NyaWJlIHBvaW50IG9mIHJlZmVyZW5jZSBlZy46IFwiV2l0aCAqTGFuZG1hcmsqIG9uIHlvdXIgTGVmdCwgcHJvY2VlZCBGb3J3YXJkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQHByb3BlcnR5IEpNYXBXYXlwb2ludCAqbGFuZG1hcmtXUDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQHByb3BlcnR5IEpNYXBEZXN0aW5hdGlvbiAqbGFuZG1hcmtEZXN0aW5hdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQHByb3BlcnR5IGZsb2F0IGFuZ2xlVG9MYW5kbWFyaztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQHByb3BlcnR5IE5TU3RyaW5nICpkaXJlY3Rpb25Ub0xhbmRtYXJrO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgbmVhcmVzdCBkZXN0aW5hdGlvbiB1c2luZyBsaW5lIG9mIHNpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBDR1BvaW50IHJldHVybkNsb3Nlc3RQb2ludDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTlNEYXRlICpzdGFydExPUyA9IFtOU0RhdGUgZGF0ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBKTWFwRGVzdGluYXRpb24gKnRlbXBMYW5kbWFyayA9IFtzZWxmIGxpbmVPZlNpZ2h0RnJvbUNsb3Nlc3RMYW5kbWFya1RvWFk6bmV3UG9pbnQgcG9pbnRPZkludGVyY2VwdDomcmV0dXJuQ2xvc2VzdFBvaW50IGRpcmVjdGlvbjpuZXh0SW5zZXJ0RGlyLmRpcmVjdGlvbiBwcmV2aW91c0FuZ2xlOm5leHRJbnNlcnREaXIuYW5nbGVUb05leHRPZlByZXZpb3VzRGlyZWN0aW9uIGZvckNhbnZhczpjdXJDYW52YXNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9OU1RpbWVJbnRlcnZhbCB0aW1lSW50ZXJ2YWxMT1MgPSBmYWJzKFtzdGFydExPUyB0aW1lSW50ZXJ2YWxTaW5jZU5vd10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9OU0xvZyhAXCJsaW5lT2ZTaWdodEZyb21DbG9zZXN0TGFuZG1hcmtUb1hZIHRvb2s6ICVmXCIsIHRpbWVJbnRlcnZhbExPUyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0ZW1wTGFuZG1hcmspXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluc2VydERpci5sYW5kbWFya0Rlc3RpbmF0aW9uID0gdGVtcExhbmRtYXJrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgV1Agc28gd2UgY2FuIGFjY3VyYXRlbHkgZGV0ZXJtaW5lIGFuZ2xlIHRvIGRlc3RpbmF0aW9uJ3MgZW50cmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKTWFwV2F5cG9pbnQgKmxhbmRtYXJrV1AgPSBbc2VsZiBnZXRXYXlQb2ludEJ5RGVzdGluYXRpb25JZDpuZXh0SW5zZXJ0RGlyLmxhbmRtYXJrRGVzdGluYXRpb24uaWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGxhbmRtYXJrV1ApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmxhbmRtYXJrV1AgPSBsYW5kbWFya1dQO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IGFuZ2xlIGNvbXBhcmluZyBEaXJlY3Rpb24gYW5nbGVUb05leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQHByb3BlcnR5IE5TU3RyaW5nICpkaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCBEaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlndXJlIG91dCB0aGUgYW5nbGUgdG8gbmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgYW5nbGUgPSBbVUlLaXRIZWxwZXIgcG9pbnRQYWlyVG9CZWFyaW5nRGVncmVlczpuZXdQb2ludCBlbmRpbmdQb2ludDpyZXR1cm5DbG9zZXN0UG9pbnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgYW5nbGUgdG8gbmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmFuZ2xlVG9MYW5kbWFyayA9IGFuZ2xlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2hhdCBpcyB0aGUgYW5nbGUgZGlmZmVyZW5jZT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9OU0xvZyhAXCJuZXh0OiAlZCBsYW5kbWFyazogJWQgbmFtZTolQFwiLCAoaW50KW5leHREaXIuYW5nbGVUb05leHQsIChpbnQpbmV4dERpci5hbmdsZVRvTGFuZG1hcmssIG5leHREaXIubGFuZG1hcmtEZXN0aW5hdGlvbi5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSA9IG5leHRJbnNlcnREaXIuYW5nbGVUb05leHRPZlByZXZpb3VzRGlyZWN0aW9uIC0gbmV4dEluc2VydERpci5hbmdsZVRvTGFuZG1hcms7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlIDwgLTE4MCkgYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSArPSAzNjA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlID4gMTgwKSBhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlIC09IDM2MDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9OU0xvZyhAXCJhbmdsZURpZmZlcmVuY2UgJUA6ICVmXCIsIG5leHREaXIubGFuZG1hcmtEZXN0aW5hdGlvbi5uYW1lLCBhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tcHV0ZSBuZXh0IGRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmRpcmVjdGlvblRvTGFuZG1hcmsgPSBbVUlLaXRIZWxwZXIgZGlyZWN0aW9uRnJvbUFuZ2xlOmFuZ2xlVG9MYW5kbWFya0RpZmZlcmVuY2UgY3VzdG9tVHJlc2hvbGRzOm5pbF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vTlNMb2coQFwiZGlyZWN0aW9uVG9MYW5kbWFyazogJUBcIiwgbmV4dERpci5kaXJlY3Rpb25Ub0xhbmRtYXJrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9OU0xvZyhAXCJuZXh0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBObyBkZXN0aW5hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbnNlcnREaXIubGFuZG1hcmtEZXN0aW5hdGlvbiA9IG5pbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5zZXJ0RGlyLmxhbmRtYXJrV1AgPSBuaWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluc2VydERpci5hbmdsZVRvTGFuZG1hcmsgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOU0xvZyhAXCJObyBkZXN0aW5hdGlvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluc2VydERpci5vdXRwdXQgPSBbTlNTdHJpbmcgc3RyaW5nV2l0aEZvcm1hdDpAXCJDb250aW51ZSBQYXN0ICVAXCIsIG5leHRJbnNlcnREaXIubGFuZG1hcmtEZXN0aW5hdGlvbi5uYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHRvIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1t0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgYWRkT2JqZWN0Om5leHRJbnNlcnREaXJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgaW5zZXJ0T2JqZWN0Om5leHRJbnNlcnREaXIgYXRJbmRleDooaSArIDEpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9OU0xvZyhAXCJpbnM6ICVkXCIsIGluc2VydEF0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5jIGJvdW5kc1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFRvQ29udGludWVQYXN0Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbmMgZm9yIGxvb3AgZHJpdmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTlNMb2coQFwiaW5zIGNvdW50OiAlbHVcIiwgKHVuc2lnbmVkIGxvbmcpdGV4dERpcmVjdGlvbnNGbG9vckFycmF5LmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGxvdCBpdCBvbiBzY3JlZW4gZm9yIG5vd1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIC8vIE9uIG1haW4gdGhyZWFkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgZGlzcGF0Y2hfYXN5bmMoZGlzcGF0Y2hfZ2V0X21haW5fcXVldWUoKSwgXntcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBVSVZpZXcgKmFkZGVkVGV4dERpciA9IFtbVUlWaWV3IGFsbG9jXSBpbml0V2l0aEZyYW1lOkNHUmVjdE1ha2UobmV3UG9pbnQueCAtIDEwLCBuZXdQb2ludC55IC0gMTAsIDIwLCAyMCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIFthZGRlZFRleHREaXIgc2V0QmFja2dyb3VuZENvbG9yOltVSUNvbG9yIHdoaXRlQ29sb3JdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBbW3NlbGYgZ2V0Q3VycmVudEZsb29yVmlld10gYWRkU3VidmlldzphZGRlZFRleHREaXJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBkaXN0YW5jZSB1c2luZyBuZXdseSBnZW5lcmF0ZWQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50MSA9IG5ld1BvaW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9kaXN0YW5jZUluUFggPSBbVUlLaXRIZWxwZXIgZGlzdGFuY2VCZXR3ZWVuOnBvaW50MSBhbmQ6cG9pbnQyXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cbi0oQ0dQb2ludCljb3JyZWN0UG9pbnRVc2luZ1dheWZpbmRQYXRoOihKTWFwUGF0aFBlckZsb29yICopc2V0T2ZQb2ludHMgcG9pbnQ6KENHUG9pbnQpcG9pbnQgbm9GdXJ0aGVyVGhhbjooZmxvYXQpbm9GdXJ0aGVyVGhhblxue1xuICAgIENHUG9pbnQgcmV0dXJuUG9pbnQgPSBDR1BvaW50WmVybztcbiAgICBmbG9hdCBjbG9zZXN0RGlzdGFuY2VGcm9tUGF0aCA9IC0xO1xuICAgIFxuICAgIC8vIExvb3AgdGhyb3VnaCBwb2ludHMgYW5kIG1ha2UgbGluZXNcbiAgICBmb3IoaW50IGkgPSAwOyBpIDwgKHNldE9mUG9pbnRzLnBvaW50cy5jb3VudCAtIDEpOyBpKyspXG4gICAge1xuICAgICAgICAvLyBHZXQgbmV4dCB0d28gcG9pbnRzXG4gICAgICAgIEpNYXBBU05vZGUgKmZpcnN0ID0gW3NldE9mUG9pbnRzLnBvaW50cyBvYmplY3RBdEluZGV4OmldO1xuICAgICAgICBDR1BvaW50IGxpbmVQMSA9IENHUG9pbnRNYWtlKGZpcnN0LnguZmxvYXRWYWx1ZSwgZmlyc3QueS5mbG9hdFZhbHVlKTtcbiAgICAgICAgXG4gICAgICAgIEpNYXBBU05vZGUgKnNlY29uZCA9IFtzZXRPZlBvaW50cy5wb2ludHMgb2JqZWN0QXRJbmRleDooaSArIDEpXTtcbiAgICAgICAgQ0dQb2ludCBsaW5lUDIgPSBDR1BvaW50TWFrZShzZWNvbmQueC5mbG9hdFZhbHVlLCBzZWNvbmQueS5mbG9hdFZhbHVlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldCB0aGUgZGlzdGFuY2VcbiAgICAgICAgQ0dQb2ludCB0ZW1wUG9pbnRPZkludGVyY2VwdCA9IENHUG9pbnRaZXJvO1xuICAgICAgICBmbG9hdCBuZXh0RGlzdGFuY2UgPSBbVUlLaXRIZWxwZXIgZGlzdGFuY2VUb0xpbmU6cG9pbnQgbGluZVAxOmxpbmVQMSBsaW5lUDI6bGluZVAyIGludGVyc2VjdFBvaW50OiZ0ZW1wUG9pbnRPZkludGVyY2VwdF07XG4gICAgICAgIGlmKChjbG9zZXN0RGlzdGFuY2VGcm9tUGF0aCA9PSAtMSkgfHwgKG5leHREaXN0YW5jZSA8IGNsb3Nlc3REaXN0YW5jZUZyb21QYXRoKSlcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gTmV3IHBvaW50XG4gICAgICAgICAgICBjbG9zZXN0RGlzdGFuY2VGcm9tUGF0aCA9IG5leHREaXN0YW5jZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gR2V0IG5ldyBwb2ludFxuICAgICAgICAgICAgcmV0dXJuUG9pbnQgPSB0ZW1wUG9pbnRPZkludGVyY2VwdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBub0Z1cnRoZXJUaGFuP1xuICAgIGlmKDAgPCBub0Z1cnRoZXJUaGFuKVxuICAgIHtcbiAgICAgICAgQ0dGbG9hdCB4RGlzdCA9IChyZXR1cm5Qb2ludC54IC0gcG9pbnQueCk7XG4gICAgICAgIENHRmxvYXQgeURpc3QgPSAocmV0dXJuUG9pbnQueSAtIHBvaW50LnkpO1xuICAgICAgICBmbG9hdCBkaXN0YW5jZUZyb21JbnRlbmRlZCA9IHNxcnQoKHhEaXN0ICogeERpc3QpICsgKHlEaXN0ICogeURpc3QpKTtcbiAgICAgICAgaWYobm9GdXJ0aGVyVGhhbiA8IGRpc3RhbmNlRnJvbUludGVuZGVkKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBQb2ludCB0b28gZmFyIGZyb20gaW50ZW5kZWQsIHJldHVybiBvcmlnaW5hbCBwb2ludFxuICAgICAgICAgICAgcmV0dXJuUG9pbnQgPSBwb2ludDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmV0dXJuUG9pbnQ7XG59XG5cbiovXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuZEFzTGFuZE1hcmsoaW5zdCkge1xuICBpZihpbnN0LnVzZUFycmF5T2ZGbG9vcldheXBvaW50cyA9PSBpbnN0LndheWZpbmRBcnJheVtpbnN0LndheWZpbmRBcnJheS5sZW5ndGggLSAxXSkge1xuICAgIC8vIFRoaXMgaXMgdGhlIGxhc3QgZmxvb3JcbiAgICB2YXIgbGFzdERpcmVjdGlvbiA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5W2luc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5Lmxlbmd0aCAtIDFdO1xuICAgIGlmKGxhc3REaXJlY3Rpb24gJiYgbGFzdERpcmVjdGlvbi5kZXN0aW5hdGlvbikge1xuICAgICAgLy8gU3RpbGwgbG9va2luZ1xuICAgICAgdmFyIGZvdW5kSXQgPSBmYWxzZTtcbiAgICAgIHZhciBmaXJzdEluZGV4ID0gMDtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dERpcmVjdGlvbiA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5W2ldO1xuICAgICAgICAvLyBJZ25vcmUgZmlyc3QgZGlyZWN0aW9uLS1pdCBjb3VsZCBiZSBhIG1vdmVyXG4gICAgICAgIGlmKG5leHREaXJlY3Rpb24gIT0gaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlbMF0pIHtcbiAgICAgICAgICAvLyBNYXRjaD9cbiAgICAgICAgICAvLyBTYW1lIExhbmRtYXJrXG4gICAgICAgICAgaWYobmV4dERpcmVjdGlvbi5sYW5kbWFya0Rlc3RpbmF0aW9uLmlkID09IGxhc3REaXJlY3Rpb24uZGVzdGluYXRpb24uaWQpIHtcbiAgICAgICAgICAgIC8vIEdvdCBpdFxuICAgICAgICAgICAgZm91bmRJdCA9IHRydWU7XG4gICAgICAgICAgICAvLyBCcmVha1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEluYyBmaXJzdEluZGV4XG4gICAgICAgIGZpcnN0SW5kZXgrKztcbiAgICAgIH1cblxuICAgICAgaWYoZm91bmRJdCkge1xuICAgICAgICB2YXIgbG9vcFRvID0gaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yKGkgPSAobG9vcFRvIC0gMSk7IGkgPj0gZmlyc3RJbmRleDsgaS0tKSB7XG4gICAgICAgICAgLy8gRm9sZCBzZWNvbmQgbGFzdFxuICAgICAgICAgIHZhciBmb2xkRGlyZWN0aW9uID0gaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlbaV07XG5cbiAgICAgICAgICAvLyBDYXJyeSBsYXN0IGRpcmVjdGlvbiBiZWhpbmQgeW91XG4gICAgICAgICAgbGFzdERpcmVjdGlvbi5mb2xkVG9CYWNrKGZvbGREaXJlY3Rpb24pO1xuXG4gICAgICAgICAgLy8gU2FtZSwgcmVtb3ZlIGl0XG4gICAgICAgICAgaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKlxuXG4vLyBGaWx0ZXIgTm8uMSBUYWtlIE91dCBEaXJlY3Rpb25zIEJldHdlZW4gTGFzdCBBbmQgRmlyc3Rcbi0odm9pZClmaWx0ZXJObzFUYWtlT3V0RGlyZWN0aW9uc0JldHdlZW5MYXN0QW5kRmlyc3Q6KE5TTXV0YWJsZUFycmF5ICoqKXRleHREaXJlY3Rpb25zRmxvb3JBcnJheSB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHM6KEpNYXBQYXRoUGVyRmxvb3IgKil1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMgd2F5ZmluZEFycmF5OihOU0FycmF5ICopd2F5ZmluZEFycmF5IGZpbHRlck9uOihCT09MKWZpbHRlck9uIGFkZFREaWZFbXB0eU1ldGVyczooZmxvYXQpYWRkVERpZkVtcHR5TWV0ZXJzIFVUdXJuSW5NZXRlcnM6KGZsb2F0KVVUdXJuSW5NZXRlcnMgZW5hYmxlRGlzdGFuY2VGaWx0ZXJzOihCT09MKWVuYWJsZURpc3RhbmNlRmlsdGVycyB4U2NhbGU6KGZsb2F0KXhTY2FsZSB5U2NhbGU6KGZsb2F0KXlTY2FsZSBjdXJyZW50Rmxvb3JURDooSk1hcEZsb29yICopY3VycmVudEZsb29yVEQgY3VyQ2FudmFzOihKTWFwQ2FudmFzICopY3VyQ2FudmFzXG57XG4gICAgaWYodXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzID09IFt3YXlmaW5kQXJyYXkgbGFzdE9iamVjdF0pXG4gICAge1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBsYXN0IGZsb29yXG4gICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmxhc3REaXJlY3Rpb24gPSBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBsYXN0T2JqZWN0XTtcbiAgICAgICAgaWYobGFzdERpcmVjdGlvbilcbiAgICAgICAge1xuICAgICAgICAgICAgLy9OU0xvZyhAXCJsYXN0OiAlQFwiLCBsYXN0RGlyZWN0aW9uLmRlc3RpbmF0aW9uLm5hbWUpO1xuICAgICAgICAgICAgLy8gU3RpbGwgbG9va2luZ1xuICAgICAgICAgICAgQk9PTCBmb3VuZEl0ID0gTk87XG4gICAgICAgICAgICBpbnQgZmlyc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBmb3IoSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqbmV4dERpcmVjdGlvbiBpbiAqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBmaXJzdCBkaXJlY3Rpb24tLWl0IGNvdWxkIGJlIGEgbW92ZXJcbiAgICAgICAgICAgICAgICBpZihuZXh0RGlyZWN0aW9uICE9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGZpcnN0T2JqZWN0XSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoP1xuICAgICAgICAgICAgICAgICAgICAvLyBTYW1lIExhbmRtYXJrXG4gICAgICAgICAgICAgICAgICAgIC8vTlNMb2coQFwibmV4dDogJUBcIiwgbmV4dERpcmVjdGlvbi5sYW5kbWFya0Rlc3RpbmF0aW9uLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZihuZXh0RGlyZWN0aW9uLmxhbmRtYXJrRGVzdGluYXRpb24uaWQuaW50VmFsdWUgPT0gbGFzdERpcmVjdGlvbi5kZXN0aW5hdGlvbi5pZC5pbnRWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR290IGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZEl0ID0gWUVTO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBCcmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gSW5jIGZpcnN0SW5kZXhcbiAgICAgICAgICAgICAgICBmaXJzdEluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihmb3VuZEl0KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIE5TSW50ZWdlciBsb29wVG8gPSBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBjb3VudF0gLSAxO1xuICAgICAgICAgICAgICAgIGZvcihsb25nIGkgPSAobG9vcFRvIC0gMSk7IGkgPj0gZmlyc3RJbmRleDsgaS0tKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9sZCBzZWNvbmQgbGFzdFxuICAgICAgICAgICAgICAgICAgICBKTWFwVGV4dERpcmVjdGlvbkluc3RydWN0aW9uICpmb2xkRGlyZWN0aW9uID0gWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgb2JqZWN0QXRJbmRleDppXTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIENhcnJ5IGxhc3QgZGlyZWN0aW9uIGJlaGluZCB5b3VcbiAgICAgICAgICAgICAgICAgICAgW2xhc3REaXJlY3Rpb24gZm9sZFRvQmFjazpmb2xkRGlyZWN0aW9uXTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhbWUsIHJlbW92ZSBpdFxuICAgICAgICAgICAgICAgICAgICBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSByZW1vdmVPYmplY3RBdEluZGV4OmldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiovXG4iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdGFydEFzTGFuZE1hcmsoaW5zdCkge1xuXG4gIGlmKGluc3QudXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzID09IGluc3Qud2F5ZmluZEFycmF5WzBdKSB7XG4gICAgLy8gT24gZmlyc3QgZmxvb3IhXG4gICAgLy8gU2VlIGlmIG5leHQgdGV4dCBkaXJlY3Rpb24gaXMgdXNpbmcgc3RhcnQtZGVzdGluYXRpb24gYW5kIGlmIGl0IGRvZXMsIGZvbGQgaXQsIHRha2luZyBpdHMgZGlyZWN0aW9uIGFzIGZpcnN0LlxuXG4gICAgLy8gVGFrZSBmaXJzdFxuICAgIHZhciBsb29wVG9GaXJzdCA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5Lmxlbmd0aCAtIDE7XG4gICAgdmFyIGZpcnN0SW5zdHJ1Y3Rpb24gPSBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheVswXTtcblxuICAgIGZvcih2YXIgaSA9IDE7IGkgPCBsb29wVG9GaXJzdDsgaSsrKSB7XG4gICAgICAvLyBUYWtlIE9OTFkgIW5leHQhXG4gICAgICB2YXIgY3VycmVudEluc3RydWN0aW9uID0gaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlbaV07XG5cbiAgICAgIC8vIElmIGxhbmRtYXJrRGVzdGluYXRpb24gc2FtZSBhcyBEZXN0aW5hdGlvbiwgZm9sZCBuZXh0IGludG8gZmlyc3RcbiAgICAgIGlmKGZpcnN0SW5zdHJ1Y3Rpb24uZGVzdGluYXRpb24pIHtcbiAgICAgICAgaWYoY3VycmVudEluc3RydWN0aW9uLmxhbmRtYXJrRGVzdGluYXRpb24uaWQgPT0gZmlyc3RJbnN0cnVjdGlvbi5kZXN0aW5hdGlvbi5pZCkge1xuICAgICAgICAgIC8vIENvcHkgZGlyZWN0aW9uXG4gICAgICAgICAgLy8gQXBwbHkgaXRzIGRpcmVjdGlvbiB0byBmaXJzdFxuICAgICAgICAgIGZpcnN0SW5zdHJ1Y3Rpb24uZGlyZWN0aW9uID0gY3VycmVudEluc3RydWN0aW9uLmRpcmVjdGlvbjtcblxuICAgICAgICAgIC8vIFJlYnVpbGQgb3V0cHV0XG4gICAgICAgICAgZmlyc3RJbnN0cnVjdGlvbi5vdXRwdXQgPSBfLnN0cmluZ1dpdGhGb3JtYXQoJ1dpdGggJSBiZWhpbmQgeW91LCBnbyAlLicsIGZpcnN0SW5zdHJ1Y3Rpb24uZGVzdGluYXRpb24ubmFtZSwgZmlyc3RJbnN0cnVjdGlvbi5kaXJlY3Rpb24pO1xuXG4gICAgICAgICAgLy8gRm9sZCBjdXJyZW50IGludG8gZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uXG4gICAgICAgICAgZmlyc3RJbnN0cnVjdGlvbi5mb2xkSW5Gcm9udChjdXJyZW50SW5zdHJ1Y3Rpb24pO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIGZyb20gdGV4dERpcmVjdGlvbnNGbG9vckFycmF5XG4gICAgICAgICAgaW5zdC50ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgICAgLy8gQnJlYWsgb3V0XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG59O1xuXG4vKlxuXG4vLyBGaWx0ZXIgTm8uMiBTdGFydCBEaXJlY3Rpb24gYXNzdW1lcyBkaXJlY3Rpb25zIG9mIGFsbCBuZXh0IGRpcmVjdGlvbnMgd2hpY2ggdXNlIGl0cyBEZXN0aW5hdGlvbiBhcyB0aGVpciBMYW5kbWFya3MuXG4tKHZvaWQpZmlsdGVyTm8yU3RhcnREaXJlY3Rpb25DbGVhblVwQWxsV2hpY2hVc2VEZXN0aW5hdGlvbkFzTGFuZG1hcmtzOihOU011dGFibGVBcnJheSAqKil0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzOihKTWFwUGF0aFBlckZsb29yICopdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzIHdheWZpbmRBcnJheTooTlNBcnJheSAqKXdheWZpbmRBcnJheSBmaWx0ZXJPbjooQk9PTClmaWx0ZXJPbiBhZGRURGlmRW1wdHlNZXRlcnM6KGZsb2F0KWFkZFREaWZFbXB0eU1ldGVycyBVVHVybkluTWV0ZXJzOihmbG9hdClVVHVybkluTWV0ZXJzIGVuYWJsZURpc3RhbmNlRmlsdGVyczooQk9PTCllbmFibGVEaXN0YW5jZUZpbHRlcnMgeFNjYWxlOihmbG9hdCl4U2NhbGUgeVNjYWxlOihmbG9hdCl5U2NhbGUgY3VycmVudEZsb29yVEQ6KEpNYXBGbG9vciAqKWN1cnJlbnRGbG9vclREIGN1ckNhbnZhczooSk1hcENhbnZhcyAqKWN1ckNhbnZhc1xue1xuICAgIGlmKHVzZUFycmF5T2ZGbG9vcldheXBvaW50cyA9PSBbd2F5ZmluZEFycmF5IGZpcnN0T2JqZWN0XSlcbiAgICB7XG4gICAgICAgIC8vIE9uIGZpcnN0IGZsb29yIVxuICAgICAgICAvLyBTZWUgaWYgbmV4dCB0ZXh0IGRpcmVjdGlvbiBpcyB1c2luZyBzdGFydC1kZXN0aW5hdGlvbiBhbmQgaWYgaXQgZG9lcywgZm9sZCBpdCwgdGFraW5nIGl0cyBkaXJlY3Rpb24gYXMgZmlyc3QuXG4gICAgICAgIFxuICAgICAgICAvLyBUYWtlIGZpcnN0XG4gICAgICAgIE5TSW50ZWdlciBsb29wVG9GaXJzdCA9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50XSAtIDE7XG4gICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmZpcnN0SW5zdHJ1Y3Rpb24gPSBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBvYmplY3RBdEluZGV4OjBdO1xuICAgICAgICBmb3IoaW50IGkgPSAxOyBpIDwgbG9vcFRvRmlyc3Q7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGFrZSBPTkxZICFuZXh0IVxuICAgICAgICAgICAgSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqY3VycmVudEluc3RydWN0aW9uID0gWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgb2JqZWN0QXRJbmRleDppXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSWYgbGFuZG1hcmtEZXN0aW5hdGlvbiBzYW1lIGFzIERlc3RpbmF0aW9uLCBmb2xkIG5leHQgaW50byBmaXJzdFxuICAgICAgICAgICAgaWYoY3VycmVudEluc3RydWN0aW9uLmxhbmRtYXJrRGVzdGluYXRpb24uaWQuaW50VmFsdWUgPT0gZmlyc3RJbnN0cnVjdGlvbi5kZXN0aW5hdGlvbi5pZC5pbnRWYWx1ZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBDb3B5IGRpcmVjdGlvblxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IGl0cyBkaXJlY3Rpb24gdG8gZmlyc3RcbiAgICAgICAgICAgICAgICBmaXJzdEluc3RydWN0aW9uLmRpcmVjdGlvbiA9IGN1cnJlbnRJbnN0cnVjdGlvbi5kaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gUmVidWlsZCBvdXRwdXRcbiAgICAgICAgICAgICAgICBmaXJzdEluc3RydWN0aW9uLm91dHB1dCA9IFtOU1N0cmluZyBzdHJpbmdXaXRoRm9ybWF0OkBcIldpdGggJUAgYmVoaW5kIHlvdSwgZ28gJUAuXCIsIGZpcnN0SW5zdHJ1Y3Rpb24uZGVzdGluYXRpb24ubmFtZSwgZmlyc3RJbnN0cnVjdGlvbi5kaXJlY3Rpb25dO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEZvbGQgY3VycmVudCBpbnRvIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblxuICAgICAgICAgICAgICAgIFtmaXJzdEluc3RydWN0aW9uIGZvbGRJbkZyb250OmN1cnJlbnRJbnN0cnVjdGlvbl07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGZyb20gdGV4dERpcmVjdGlvbnNGbG9vckFycmF5XG4gICAgICAgICAgICAgICAgWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgcmVtb3ZlT2JqZWN0QXRJbmRleDppXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBCcmVhayBvdXRcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuKi9cbiIsInZhciBfXyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1VHVybihpbnN0KSB7XG5cbiAgLy8gRmlsdGVyIE5vLjMgVS1UdXJuIGRldGVjdGlvbjogZWcuOiBUaHJlZSBsZWZ0cyB3aXRoIGNvbWJpbmVkIGFuZ2xlIG9mIG92ZXIgMTAwIGRlZyBiZWNvbWUgTGVmdCBVLVR1cm5cbiAgaWYoaW5zdC5lbmFibGVEaXN0YW5jZUZpbHRlcnMpIHtcbiAgICAvLyBEaXNhYmxlIGlzIG5vdCBvdmVyIHplcm9cbiAgICBpZihpbnN0LlVUdXJuSW5NZXRlcnMgPiAwKSB7XG4gICAgICAvLyBTa2lwIFVUdXJuIGlmIGZpcnN0IGZsb29yXG4gICAgICBpZihpbnN0LnVzZUFycmF5T2ZGbG9vcldheXBvaW50cyAhPSBpbnN0LndheWZpbmRBcnJheVswXSkge1xuICAgICAgICAvLyBVLVR1cm4gZGV0ZWN0aW9uXG4gICAgICAgIHZhciBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybiA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5WzBdO1xuICAgICAgICAvLyBEb2VzIHRoaXMgd2F5cG9pbnQgaGF2ZSBvbmx5IG9uZSBjb25uZWN0aW9uP1xuICAgICAgICB2YXIgZmlyc3ROb2RlID0gaW5zdC51c2VBcnJheU9mRmxvb3JXYXlwb2ludHMucG9pbnRzWzBdO1xuICAgICAgICB2YXIgYXJyID0gZmlyc3ROb2RlLmVkZ2VzLnNsaWNlKCk7XG4gICAgICAgIC8vIENvdW50IHR5cGUgMVxuICAgICAgICB2YXIgdHlwZTFDb3VudGVyID0gMDtcbiAgICAgICAgLy8gV2UgaGF2ZSB0byBoYXZlIG9ubHkgb25lIG9mIHR5cGUgMVxuICAgICAgICAvLyBEaXNyZWdhcmQgdGhlIG90aGVyc1xuICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbihuZXh0RWRnZSkge1xuICAgICAgICAgIC8vIExvb2sgZm9yIFR5cGUgb25lP1xuICAgICAgICAgIGlmKG5leHRFZGdlLnR5cGUgPT0gMSkge1xuICAgICAgICAgICAgLy8gRm91bmQgb25lIG1vcmVcbiAgICAgICAgICAgIHR5cGUxQ291bnRlcisrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gT25seSAxIHR5cGUgMT9cbiAgICAgICAgaWYodHlwZTFDb3VudGVyICE9IDEpIHtcbiAgICAgICAgICAvLyBXYXlwb2ludCBoYXMgbW9yZSB0aGFuIG9uZSBjb25uZWN0aW9uXG4gICAgICAgICAgLy8gVGhpcyBjYW5ub3QgYmUgYSBVLVR1cm5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBjb250aW51ZVxuXG4gICAgICAgIC8vIE1vcmUgdGhhbiAzIGRpcmVjdGlvbnM/XG4gICAgICAgIGlmKGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5Lmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAvLyBUaGlzIGNhbm5vdCBiZSBVLVR1cm4uIE5vdCBlbm91Z2ggZGlyZWN0aW9ucy93YXlwb2ludHNcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBjb250aW51ZVxuXG4gICAgICAgIC8vIERlY2lkZSBEaXJlY3Rpb24gb2YgVS1UdXJuXG4gICAgICAgIHZhciBkaXJlY3Rpb25Jc1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgLy8gQ2FuIHlvdSBnZXQgb25lIG1vcmUgdGV4dCBkaXJlY3Rpb24/XG4gICAgICAgIHZhciBzZWNvbmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4gPSBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheVsxXTtcbiAgICAgICAgLy8gR2V0IGFuZ2xlIGRpZmZlcmVuY2VcbiAgICAgICAgdmFyIGFuZ2xlVG9EaWZmZXJlbmNlMSA9IGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmFuZ2xlVG9OZXh0IC0gc2Vjb25kQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmFuZ2xlVG9OZXh0O1xuICAgICAgICB3aGlsZShhbmdsZVRvRGlmZmVyZW5jZTEgPCAtMTgwKSBhbmdsZVRvRGlmZmVyZW5jZTEgKz0gMzYwO1xuICAgICAgICB3aGlsZShhbmdsZVRvRGlmZmVyZW5jZTEgPiAxODApIGFuZ2xlVG9EaWZmZXJlbmNlMSAtPSAzNjA7XG5cbiAgICAgICAgLy8gTWludXMgZm9yIFJpZ2h0XG4gICAgICAgIC8vIFBsdXMgZm9yIExlZnRcblxuICAgICAgICBpZihhbmdsZVRvRGlmZmVyZW5jZTEgPj0gMCkge1xuICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgZGlyZWN0aW9uSXNSaWdodCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgIGRpcmVjdGlvbklzUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVVR1cm5Jbk1ldGVyc1xuXG4gICAgICAgIC8vIFRyZXNob2xkc1xuICAgICAgICB2YXIgYW5nbGUxX3QgPSA5NTtcbiAgICAgICAgdmFyIGFuZ2xlMl90ID0gOTU7XG4gICAgICAgIHZhciBkaXN0YW5jZTFfdCA9IDI7XG4gICAgICAgIHZhciBkaXN0YW5jZTJfdCA9IDU7XG4gICAgICAgIHZhciBkaXN0YW5jZTNfdCA9IDU7XG5cbiAgICAgICAgLy8gU2VnbWVudCBBXG4gICAgICAgIC8vIFRlc3QgQW5nbGVcbiAgICAgICAgaWYoYW5nbGUxX3QgPCBNYXRoLmFicyhhbmdsZVRvRGlmZmVyZW5jZTEpKSB7XG4gICAgICAgICAgLy8gVGhpcyBjYW5ub3QgYmUgVS1UdXJuLCBmaXJzdCBhbmdsZSB0cmVzaG9sZCBicm9rZW5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGVzdCBEaXJlY3Rpb25cbiAgICAgICAgdmFyIHNlZ21lbnRBRGlyZWN0aW9uUmlnaHQgPSB0cnVlO1xuICAgICAgICBpZihhbmdsZVRvRGlmZmVyZW5jZTEgPj0gMCkge1xuICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgc2VnbWVudEFEaXJlY3Rpb25SaWdodCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgIHNlZ21lbnRBRGlyZWN0aW9uUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZihkaXJlY3Rpb25Jc1JpZ2h0ICE9IHNlZ21lbnRBRGlyZWN0aW9uUmlnaHQpIHtcbiAgICAgICAgICAvLyBOb3QgaW4gdGhlIHNhbWUgZGlyZWN0aW9uXG4gICAgICAgICAgLy8gVGhpcyBjYW5ub3QgYmUgVVR1cm5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGVzdCBEaXN0YW5jZVxuICAgICAgICB2YXIgcG9pbnQxeHkgPSBbZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueCwgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueV07XG4gICAgICAgIHZhciBwb2ludDJ4eSA9IFtzZWNvbmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueCwgc2Vjb25kQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLndwLnldO1xuICAgICAgICB2YXIgZGlzdGFuY2UxID0gX18uZGlzdGFuY2VCZXR3ZWVuKHBvaW50MXh5LCBwb2ludDJ4eSk7XG4gICAgICAgIHZhciBkaXN0YW5jZTFNZXRlcnMgPSBfXy5jb252ZXJ0UGl4ZWxzVG9NZXRlcnMoZGlzdGFuY2UxLCBpbnN0LnhTY2FsZSk7XG4gICAgICAgIGlmKGRpc3RhbmNlMU1ldGVycyA8PSBkaXN0YW5jZTFfdCkge1xuICAgICAgICAgIC8vIFRoaXMgY2Fubm90IGJlIFVUdXJuXG4gICAgICAgICAgLy8gU2VnbWVudCAxIGlzIHRvbyBsb25nXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2VnbWVudCBCXG4gICAgICAgIC8vIFRoaXJkIHBvaW50XG4gICAgICAgIHZhciB0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybiA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5WzJdO1xuICAgICAgICAvLyBHZXQgYW5nbGUgZGlmZmVyZW5jZVxuICAgICAgICB2YXIgYW5nbGVUb0RpZmZlcmVuY2UyID0gc2Vjb25kQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmFuZ2xlVG9OZXh0IC0gdGhpcmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uYW5nbGVUb05leHQ7XG4gICAgICAgIHdoaWxlKGFuZ2xlVG9EaWZmZXJlbmNlMiA8IC0xODApIGFuZ2xlVG9EaWZmZXJlbmNlMiArPSAzNjA7XG4gICAgICAgIHdoaWxlKGFuZ2xlVG9EaWZmZXJlbmNlMiA+IDE4MCkgYW5nbGVUb0RpZmZlcmVuY2UyIC09IDM2MDtcbiAgICAgICAgLy8gVGVzdCBBbmdsZVxuICAgICAgICBpZihhbmdsZTJfdCA8IE1hdGguYWJzKGFuZ2xlVG9EaWZmZXJlbmNlMikpIHtcbiAgICAgICAgICAvLyBUaGlzIGNhbm5vdCBiZSBVLVR1cm4sIGZpcnN0IGFuZ2xlIHRyZXNob2xkIGJyb2tlblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUZXN0IERpcmVjdGlvblxuICAgICAgICB2YXIgc2VnbWVudEJEaXJlY3Rpb25SaWdodCA9IHRydWU7XG4gICAgICAgIGlmKGFuZ2xlVG9EaWZmZXJlbmNlMiA+PSAwKSB7XG4gICAgICAgICAgLy8gUmlnaHRcbiAgICAgICAgICBzZWdtZW50QkRpcmVjdGlvblJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBMZWZ0XG4gICAgICAgICAgc2VnbWVudEJEaXJlY3Rpb25SaWdodCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKGRpcmVjdGlvbklzUmlnaHQgIT0gc2VnbWVudEJEaXJlY3Rpb25SaWdodCkge1xuICAgICAgICAgIC8vIE5vdCBpbiB0aGUgc2FtZSBkaXJlY3Rpb25cbiAgICAgICAgICAvLyBUaGlzIGNhbm5vdCBiZSBVVHVyblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUZXN0IERpc3RhbmNlXG4gICAgICAgIHZhciBwb2ludDN4eSA9IFt0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi53cC54LCB0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi53cC55XTtcbiAgICAgICAgdmFyIGRpc3RhbmNlMiA9IF9fLmRpc3RhbmNlQmV0d2Vlbihwb2ludDJ4eSwgcG9pbnQzeHkpO1xuICAgICAgICB2YXIgZGlzdGFuY2UyTWV0ZXJzID0gX18uY29udmVydFBpeGVsc1RvTWV0ZXJzKGRpc3RhbmNlMiwgaW5zdC54U2NhbGUpO1xuICAgICAgICBpZihkaXN0YW5jZTJNZXRlcnMgPD0gZGlzdGFuY2UyX3QpIHtcbiAgICAgICAgICAvLyBUaGlzIGNhbm5vdCBiZSBVVHVyblxuICAgICAgICAgIC8vIFNlZ21lbnQgMiBpcyB0b28gbG9uZ1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlZ21lbnQgQ1xuICAgICAgICAvLyBGb3VydGggcG9pbnRcbiAgICAgICAgdmFyIGZvdXJ0aENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybiA9IGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5WzNdO1xuICAgICAgICAvLyBUZXN0IERpc3RhbmNlIE9OTFkuXG4gICAgICAgIC8vIEl0IHNob3VsZCBiZSBsZXNzIHRoYW4gM3JkIHRyZXNob2xkXG4gICAgICAgIHZhciBwb2ludDR4eSA9IFtmb3VydGhDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueCwgZm91cnRoQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLndwLnldO1xuICAgICAgICB2YXIgZGlzdGFuY2UzID0gX18uZGlzdGFuY2VCZXR3ZWVuKHBvaW50M3h5LCBwb2ludDR4eSk7XG4gICAgICAgIHZhciBkaXN0YW5jZTNNZXRlcnMgPSBfXy5jb252ZXJ0UGl4ZWxzVG9NZXRlcnMoZGlzdGFuY2UzLCBpbnN0LnhTY2FsZSk7XG4gICAgICAgIC8vIE5vdGUgM3JkIG11c3QgYmUgZ3JlYXRlciB0aGFuIHRyZXNob2xkXG4gICAgICAgIGlmKGRpc3RhbmNlM190ID49IGRpc3RhbmNlM01ldGVycykge1xuICAgICAgICAgIC8vIFRoaXMgY2Fubm90IGJlIFVUdXJuXG4gICAgICAgICAgLy8gU2VnbWVudCAzIGlzIHRvbyBTSE9SVCFcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGlzIGEgVS1UdXJuXG4gICAgICAgIC8vIERpcmVjdGlvblxuICAgICAgICBpZihkaXJlY3Rpb25Jc1JpZ2h0KSB7XG4gICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpcmVjdGlvbiA9ICdSaWdodCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpcmVjdGlvbiA9ICdMZWZ0JztcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgVVR1cm4gRGlyZWN0aW9uXG4gICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpcmVjdGlvbiArPSAnIFVUdXJuJztcblxuICAgICAgICAvLyBGaXJzdCBpcyBnb2luZyB0byBiZSBVLVR1cm4gb24gTGVmdC9SaWdodCBzaWRlXG4gICAgICAgIC8vIENvbWJpbmUgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uIG91dHB1dFxuXG4gICAgICAgIHZhciBuZXdPdXRwdXQgPSBfXy5zdHJpbmdXaXRoRm9ybWF0KCdXaXRoICUgb24geW91ciAlLCBtYWtlICUuJyxcbiAgICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi5sYW5kbWFya0Rlc3RpbmF0aW9uLm5hbWUsXG4gICAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlyZWN0aW9uVG9MYW5kbWFyayxcbiAgICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi5kaXJlY3Rpb24pO1xuXG4gICAgICAgIC8vIFVwZGF0ZVxuICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi50eXBlID0gJ3V0dXJuJztcbiAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ub3V0cHV0ID0gbmV3T3V0cHV0O1xuXG4gICAgICAgIC8vIEZvbGQgMlxuICAgICAgICAvLyBBZGQgZGlzdGFuY2VcbiAgICAgICAgdmFyIGNvbWJpbmVkRmlyc3REaXN0YW5jZSA9IGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpc3RhbmNlVG9OZXh0UGl4ZWxzO1xuICAgICAgICAvLyAybmQgdG8gM3JkXG4gICAgICAgIGNvbWJpbmVkRmlyc3REaXN0YW5jZSArPSBzZWNvbmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlzdGFuY2VUb05leHRQaXhlbHM7XG4gICAgICAgIC8vIDNuZCB0byA0dGhcbiAgICAgICAgY29tYmluZWRGaXJzdERpc3RhbmNlICs9IHRoaXJkQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpc3RhbmNlVG9OZXh0UGl4ZWxzO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBGaXJzdFxuICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi5kaXN0YW5jZVRvTmV4dFBpeGVscyA9IGNvbWJpbmVkRmlyc3REaXN0YW5jZTtcbiAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlzdGFuY2VUb05leHRNZXRlcnMgPSBfXy5jb252ZXJ0UGl4ZWxzVG9NZXRlcnMoY29tYmluZWRGaXJzdERpc3RhbmNlLCBpbnN0LnhTY2FsZSk7XG5cbiAgICAgICAgLy8gRm9sZCBjdXJyZW50IGludG8gZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uXG4gICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmZvbGRJbkZyb250KHNlY29uZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybik7XG4gICAgICAgIC8vIFJlbW92ZSBmcm9tIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheVxuICAgICAgICBpbnN0LnRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5zcGxpY2UoMSwgMSk7XG5cbiAgICAgICAgLy8gRm9sZCAzIGludG8gZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uXG4gICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmZvbGRJbkZyb250KHRoaXJkQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuKTtcbiAgICAgICAgLy8gUmVtb3ZlIGZyb20gdGV4dERpcmVjdGlvbnNGbG9vckFycmF5XG4gICAgICAgIGluc3QudGV4dERpcmVjdGlvbnNGbG9vckFycmF5LnNwbGljZSgxLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qXG5cbi8vIEZpbHRlciBOby4zIFUtVHVybiBkZXRlY3Rpb246IGVnLjogVGhyZWUgbGVmdHMgd2l0aCBjb21iaW5lZCBhbmdsZSBvZiBvdmVyIDEwMCBkZWcgYmVjb21lIExlZnQgVS1UdXJuXG4vLyBGaWx0ZXIgTm8uMyBVLVR1cm4gZGV0ZWN0aW9uOiBlZy46IFRocmVlIGxlZnRzIHdpdGggY29tYmluZWQgYW5nbGUgb2Ygb3ZlciAxMDAgZGVnIGJlY29tZSBMZWZ0IFUtVHVyblxuLSh2b2lkKWZpbHRlck5vM1VUdXJuRGV0ZWN0aW9uOihOU011dGFibGVBcnJheSAqKil0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzOihKTWFwUGF0aFBlckZsb29yICopdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzIHdheWZpbmRBcnJheTooTlNBcnJheSAqKXdheWZpbmRBcnJheSBmaWx0ZXJPbjooQk9PTClmaWx0ZXJPbiBhZGRURGlmRW1wdHlNZXRlcnM6KGZsb2F0KWFkZFREaWZFbXB0eU1ldGVycyBVVHVybkluTWV0ZXJzOihmbG9hdClVVHVybkluTWV0ZXJzIGVuYWJsZURpc3RhbmNlRmlsdGVyczooQk9PTCllbmFibGVEaXN0YW5jZUZpbHRlcnMgeFNjYWxlOihmbG9hdCl4U2NhbGUgeVNjYWxlOihmbG9hdCl5U2NhbGUgY3VycmVudEZsb29yVEQ6KEpNYXBGbG9vciAqKWN1cnJlbnRGbG9vclREIGN1ckNhbnZhczooSk1hcENhbnZhcyAqKWN1ckNhbnZhc1xue1xuICAgIGlmKGVuYWJsZURpc3RhbmNlRmlsdGVycylcbiAgICB7XG4gICAgICAgIC8vIERpc2FibGUgaXMgbm90IG92ZXIgemVyb1xuICAgICAgICBpZihVVHVybkluTWV0ZXJzID4gMC4wKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBTa2lwIFVUdXJuIGlmIGZpcnN0IGZsb29yXG4gICAgICAgICAgICBpZih1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMgIT0gW3dheWZpbmRBcnJheSBmaXJzdE9iamVjdF0pXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVS1UdXJuIGRldGVjdGlvblxuICAgICAgICAgICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuID0gWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgb2JqZWN0QXRJbmRleDowXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBEb2VzIHRoaXMgd2F5cG9pbnQgaGF2ZSBvbmx5IG9uZSBjb25uZWN0aW9uP1xuICAgICAgICAgICAgICAgIEpNYXBBU05vZGUgKmZpcnN0Tm9kZSA9IFt1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMucG9pbnRzIG9iamVjdEF0SW5kZXg6MF07XG4gICAgICAgICAgICAgICAgTlNBcnJheSAqYXJyID0gW2ZpcnN0Tm9kZS5lZGdlcyBjb3B5XTtcbiAgICAgICAgICAgICAgICAvLyBDb3VudCB0eXBlIDFcbiAgICAgICAgICAgICAgICBpbnQgdHlwZTFDb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGhhdmUgb25seSBvbmUgb2YgdHlwZSAxXG4gICAgICAgICAgICAgICAgLy8gRGlzcmVnYXJkIHRoZSBvdGhlcnNcbiAgICAgICAgICAgICAgICBmb3IoSk1hcEFTRWRnZSAqbmV4dEVkZ2UgaW4gYXJyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTG9vayBmb3IgVHlwZSBvbmU/XG4gICAgICAgICAgICAgICAgICAgIGlmKG5leHRFZGdlLnR5cGUuaW50VmFsdWUgPT0gMSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm91bmQgb25lIG1vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUxQ291bnRlcisrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gT25seSAxIHR5cGUgMT9cbiAgICAgICAgICAgICAgICBpZih0eXBlMUNvdW50ZXIgIT0gMSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdheXBvaW50IGhhcyBtb3JlIHRoYW4gb25lIGNvbm5lY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjYW5ub3QgYmUgYSBVLVR1cm5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbHNlIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gTW9yZSB0aGFuIDMgZGlyZWN0aW9ucz9cbiAgICAgICAgICAgICAgICBpZihbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBjb3VudF0gPCA0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjYW5ub3QgYmUgVS1UdXJuLiBOb3QgZW5vdWdoIGRpcmVjdGlvbnMvd2F5cG9pbnRzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZWxzZSBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgLy8gRGVjaWRlIERpcmVjdGlvbiBvZiBVLVR1cm5cbiAgICAgICAgICAgICAgICBCT09MIGRpcmVjdGlvbklzUmlnaHQgPSBZRVM7XG4gICAgICAgICAgICAgICAgLy8gQ2FuIHlvdSBnZXQgb25lIG1vcmUgdGV4dCBkaXJlY3Rpb24/XG4gICAgICAgICAgICAgICAgSk1hcFRleHREaXJlY3Rpb25JbnN0cnVjdGlvbiAqc2Vjb25kQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuID0gWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgb2JqZWN0QXRJbmRleDoxXTtcbiAgICAgICAgICAgICAgICAvLyBHZXQgYW5nbGUgZGlmZmVyZW5jZVxuICAgICAgICAgICAgICAgIGZsb2F0IGFuZ2xlVG9EaWZmZXJlbmNlMSA9IGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmFuZ2xlVG9OZXh0IC0gc2Vjb25kQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmFuZ2xlVG9OZXh0O1xuICAgICAgICAgICAgICAgIHdoaWxlIChhbmdsZVRvRGlmZmVyZW5jZTEgPCAtMTgwKSBhbmdsZVRvRGlmZmVyZW5jZTEgKz0gMzYwO1xuICAgICAgICAgICAgICAgIHdoaWxlIChhbmdsZVRvRGlmZmVyZW5jZTEgPiAxODApIGFuZ2xlVG9EaWZmZXJlbmNlMSAtPSAzNjA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gTWludXMgZm9yIFJpZ2h0XG4gICAgICAgICAgICAgICAgLy8gUGx1cyBmb3IgTGVmdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKGFuZ2xlVG9EaWZmZXJlbmNlMSA+PSAwKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uSXNSaWdodCA9IFlFUztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb25Jc1JpZ2h0ID0gTk87XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9VVHVybkluTWV0ZXJzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gVHJlc2hvbGRzXG4gICAgICAgICAgICAgICAgZmxvYXQgYW5nbGUxX3QgPSA5NS4wO1xuICAgICAgICAgICAgICAgIGZsb2F0IGFuZ2xlMl90ID0gOTUuMDtcbiAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZTFfdCA9IDIuMDtcbiAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZTJfdCA9IDUuMDtcbiAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZTNfdCA9IDUuMDtcblxuICAgICAgICAgICAgICAgIC8vIFNlZ21lbnQgQVxuICAgICAgICAgICAgICAgIC8vIFRlc3QgQW5nbGVcbiAgICAgICAgICAgICAgICBpZihhbmdsZTFfdCA8IGZhYnMoYW5nbGVUb0RpZmZlcmVuY2UxKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2Fubm90IGJlIFUtVHVybiwgZmlyc3QgYW5nbGUgdHJlc2hvbGQgYnJva2VuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGVzdCBEaXJlY3Rpb25cbiAgICAgICAgICAgICAgICBCT09MIHNlZ21lbnRBRGlyZWN0aW9uUmlnaHQgPSBZRVM7XG4gICAgICAgICAgICAgICAgaWYoYW5nbGVUb0RpZmZlcmVuY2UxID49IDApXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50QURpcmVjdGlvblJpZ2h0ID0gWUVTO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZWZ0XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRBRGlyZWN0aW9uUmlnaHQgPSBOTztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoZGlyZWN0aW9uSXNSaWdodCAhPSBzZWdtZW50QURpcmVjdGlvblJpZ2h0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IGluIHRoZSBzYW1lIGRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNhbm5vdCBiZSBVVHVyblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFRlc3QgRGlzdGFuY2VcbiAgICAgICAgICAgICAgICBDR1BvaW50IHBvaW50MXh5ID0gQ0dQb2ludE1ha2UoZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueC5mbG9hdFZhbHVlLCBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi53cC55LmZsb2F0VmFsdWUpO1xuICAgICAgICAgICAgICAgIENHUG9pbnQgcG9pbnQyeHkgPSBDR1BvaW50TWFrZShzZWNvbmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueC5mbG9hdFZhbHVlLCBzZWNvbmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueS5mbG9hdFZhbHVlKTtcbiAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZTEgPSBbVUlLaXRIZWxwZXIgZGlzdGFuY2VCZXR3ZWVuOnBvaW50MXh5IGFuZDpwb2ludDJ4eV07XG4gICAgICAgICAgICAgICAgZmxvYXQgZGlzdGFuY2UxTWV0ZXJzID0gW1VJS2l0SGVscGVyIGNvbnZlcnRQaXhlbHNUb01ldGVyczpkaXN0YW5jZTEgdXNpbmdYWVNjYWxlOnhTY2FsZV07XG4gICAgICAgICAgICAgICAgaWYoZGlzdGFuY2UxTWV0ZXJzIDw9IGRpc3RhbmNlMV90KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjYW5ub3QgYmUgVVR1cm5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2VnbWVudCAxIGlzIHRvbyBsb25nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gU2VnbWVudCBCXG4gICAgICAgICAgICAgICAgLy8gVGhpcmQgcG9pbnRcbiAgICAgICAgICAgICAgICBKTWFwVGV4dERpcmVjdGlvbkluc3RydWN0aW9uICp0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybiA9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IG9iamVjdEF0SW5kZXg6Ml07XG4gICAgICAgICAgICAgICAgLy8gR2V0IGFuZ2xlIGRpZmZlcmVuY2VcbiAgICAgICAgICAgICAgICBmbG9hdCBhbmdsZVRvRGlmZmVyZW5jZTIgPSBzZWNvbmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uYW5nbGVUb05leHQgLSB0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi5hbmdsZVRvTmV4dDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoYW5nbGVUb0RpZmZlcmVuY2UyIDwgLTE4MCkgYW5nbGVUb0RpZmZlcmVuY2UyICs9IDM2MDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoYW5nbGVUb0RpZmZlcmVuY2UyID4gMTgwKSBhbmdsZVRvRGlmZmVyZW5jZTIgLT0gMzYwO1xuICAgICAgICAgICAgICAgIC8vIFRlc3QgQW5nbGVcbiAgICAgICAgICAgICAgICBpZihhbmdsZTJfdCA8IGZhYnMoYW5nbGVUb0RpZmZlcmVuY2UyKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2Fubm90IGJlIFUtVHVybiwgZmlyc3QgYW5nbGUgdHJlc2hvbGQgYnJva2VuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGVzdCBEaXJlY3Rpb25cbiAgICAgICAgICAgICAgICBCT09MIHNlZ21lbnRCRGlyZWN0aW9uUmlnaHQgPSBZRVM7XG4gICAgICAgICAgICAgICAgaWYoYW5nbGVUb0RpZmZlcmVuY2UyID49IDApXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50QkRpcmVjdGlvblJpZ2h0ID0gWUVTO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZWZ0XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRCRGlyZWN0aW9uUmlnaHQgPSBOTztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoZGlyZWN0aW9uSXNSaWdodCAhPSBzZWdtZW50QkRpcmVjdGlvblJpZ2h0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IGluIHRoZSBzYW1lIGRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNhbm5vdCBiZSBVVHVyblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFRlc3QgRGlzdGFuY2VcbiAgICAgICAgICAgICAgICBDR1BvaW50IHBvaW50M3h5ID0gQ0dQb2ludE1ha2UodGhpcmRDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4ud3AueC5mbG9hdFZhbHVlLCB0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi53cC55LmZsb2F0VmFsdWUpO1xuICAgICAgICAgICAgICAgIGZsb2F0IGRpc3RhbmNlMiA9IFtVSUtpdEhlbHBlciBkaXN0YW5jZUJldHdlZW46cG9pbnQyeHkgYW5kOnBvaW50M3h5XTtcbiAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZTJNZXRlcnMgPSBbVUlLaXRIZWxwZXIgY29udmVydFBpeGVsc1RvTWV0ZXJzOmRpc3RhbmNlMiB1c2luZ1hZU2NhbGU6eFNjYWxlXTtcbiAgICAgICAgICAgICAgICBpZihkaXN0YW5jZTJNZXRlcnMgPD0gZGlzdGFuY2UyX3QpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNhbm5vdCBiZSBVVHVyblxuICAgICAgICAgICAgICAgICAgICAvLyBTZWdtZW50IDIgaXMgdG9vIGxvbmdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNlZ21lbnQgQ1xuICAgICAgICAgICAgICAgIC8vIEZvdXJ0aCBwb2ludFxuICAgICAgICAgICAgICAgIEpNYXBUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gKmZvdXJ0aENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybiA9IFsqdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IG9iamVjdEF0SW5kZXg6M107XG4gICAgICAgICAgICAgICAgLy8gVGVzdCBEaXN0YW5jZSBPTkxZLlxuICAgICAgICAgICAgICAgIC8vIEl0IHNob3VsZCBiZSBsZXNzIHRoYW4gM3JkIHRyZXNob2xkXG4gICAgICAgICAgICAgICAgQ0dQb2ludCBwb2ludDR4eSA9IENHUG9pbnRNYWtlKGZvdXJ0aENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi53cC54LmZsb2F0VmFsdWUsIGZvdXJ0aENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi53cC55LmZsb2F0VmFsdWUpO1xuICAgICAgICAgICAgICAgIGZsb2F0IGRpc3RhbmNlMyA9IFtVSUtpdEhlbHBlciBkaXN0YW5jZUJldHdlZW46cG9pbnQzeHkgYW5kOnBvaW50NHh5XTtcbiAgICAgICAgICAgICAgICBmbG9hdCBkaXN0YW5jZTNNZXRlcnMgPSBbVUlLaXRIZWxwZXIgY29udmVydFBpeGVsc1RvTWV0ZXJzOmRpc3RhbmNlMyB1c2luZ1hZU2NhbGU6eFNjYWxlXTtcbiAgICAgICAgICAgICAgICAvLyBOb3RlIDNyZCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiB0cmVzaG9sZFxuICAgICAgICAgICAgICAgIGlmKGRpc3RhbmNlM190ID49IGRpc3RhbmNlM01ldGVycylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2Fubm90IGJlIFVUdXJuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZ21lbnQgMyBpcyB0b28gU0hPUlQhXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIFUtVHVyblxuICAgICAgICAgICAgICAgIC8vIERpcmVjdGlvblxuICAgICAgICAgICAgICAgIGlmKGRpcmVjdGlvbklzUmlnaHQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZWZ0XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpcmVjdGlvbiA9IEBcIlJpZ2h0XCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIExlZnRcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlyZWN0aW9uID0gQFwiTGVmdFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBZGQgVVR1cm4gRGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlyZWN0aW9uID0gW2ZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpcmVjdGlvbiBzdHJpbmdCeUFwcGVuZGluZ1N0cmluZzpAXCIgVVR1cm5cIl07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QgaXMgZ29pbmcgdG8gYmUgVS1UdXJuIG9uIExlZnQvUmlnaHQgc2lkZVxuICAgICAgICAgICAgICAgIC8vIENvbWJpbmUgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uIG91dHB1dFxuICAgICAgICAgICAgICAgIE5TU3RyaW5nICpuZXdPdXRwdXQgPSBbTlNTdHJpbmcgc3RyaW5nV2l0aEZvcm1hdDpAXCJXaXRoICVAIG9uIHlvdXIgJUAsIG1ha2UgJUAuXCIsIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmxhbmRtYXJrRGVzdGluYXRpb24ubmFtZSwgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlyZWN0aW9uVG9MYW5kbWFyaywgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlyZWN0aW9uXTtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGVcbiAgICAgICAgICAgICAgICBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi5vdXRwdXQgPSBuZXdPdXRwdXQ7XG5cbiAgICAgICAgICAgICAgICBOU0xvZyhAXCJEZXRlY3RlZCBVVHVyblwiKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBGb2xkIDJcbiAgICAgICAgICAgICAgICAvLyBBZGQgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICBmbG9hdCBjb21iaW5lZEZpcnN0RGlzdGFuY2UgPSBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi5kaXN0YW5jZVRvTmV4dFBpeGVscy5mbG9hdFZhbHVlO1xuICAgICAgICAgICAgICAgIC8vIDJuZCB0byAzcmRcbiAgICAgICAgICAgICAgICBjb21iaW5lZEZpcnN0RGlzdGFuY2UgKz0gc2Vjb25kQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuLmRpc3RhbmNlVG9OZXh0UGl4ZWxzLmZsb2F0VmFsdWU7XG4gICAgICAgICAgICAgICAgLy8gM25kIHRvIDR0aFxuICAgICAgICAgICAgICAgIGNvbWJpbmVkRmlyc3REaXN0YW5jZSArPSB0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybi5kaXN0YW5jZVRvTmV4dFBpeGVscy5mbG9hdFZhbHVlO1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIEZpcnN0XG4gICAgICAgICAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlzdGFuY2VUb05leHRQaXhlbHMgPSBbTlNOdW1iZXIgbnVtYmVyV2l0aEZsb2F0OmNvbWJpbmVkRmlyc3REaXN0YW5jZV07XG4gICAgICAgICAgICAgICAgZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4uZGlzdGFuY2VUb05leHRNZXRlcnMgPSBbTlNOdW1iZXIgbnVtYmVyV2l0aEZsb2F0OltVSUtpdEhlbHBlciBjb252ZXJ0UGl4ZWxzVG9NZXRlcnM6Y29tYmluZWRGaXJzdERpc3RhbmNlIHVzaW5nWFlTY2FsZTp4U2NhbGVdXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBGb2xkIGN1cnJlbnQgaW50byBmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25cbiAgICAgICAgICAgICAgICBbZmlyc3RDb25zZWN1dGl2ZUluc3RydWN0aW9uVVR1cm4gZm9sZEluRnJvbnQ6c2Vjb25kQ29uc2VjdXRpdmVJbnN0cnVjdGlvblVUdXJuXTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgZnJvbSB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXlcbiAgICAgICAgICAgICAgICBbKnRleHREaXJlY3Rpb25zRmxvb3JBcnJheSByZW1vdmVPYmplY3RBdEluZGV4OjFdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEZvbGQgMyBpbnRvIGZpcnN0Q29uc2VjdXRpdmVJbnN0cnVjdGlvblxuICAgICAgICAgICAgICAgIFtmaXJzdENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybiBmb2xkSW5Gcm9udDp0aGlyZENvbnNlY3V0aXZlSW5zdHJ1Y3Rpb25VVHVybl07XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGZyb20gdGV4dERpcmVjdGlvbnNGbG9vckFycmF5XG4gICAgICAgICAgICAgICAgWyp0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgcmVtb3ZlT2JqZWN0QXRJbmRleDoxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiovXG4iLCJ2YXIgX18gPSB7XG5cbiAgc3RyaW5nV2l0aEZvcm1hdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIHZhciBzdHJpbmcgPSBhcmd1bWVudHNbMF0uc3BsaXQoJyUnKTtcbiAgICBmb3IodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvdXRwdXQucHVzaChzdHJpbmdbaSAtIDFdKTtcbiAgICAgIG91dHB1dC5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQuam9pbignJyk7XG4gIH0sXG5cbiAgbGFuZG1hcmtEaXJlY3Rpb25Gcm9tRGVsdGFBbmdsZTogZnVuY3Rpb24oKSB7fSxcblxuICBkaXJlY3Rpb25Gcm9tQW5nbGU6IGZ1bmN0aW9uKGFuZ2xlLCBjdXN0b21UcmVzaG9sZHMpIHtcbiAgICAvLyBpZiAoaXNOYU4oYW5nbGUpKSBkZWJ1Z2dlcjtcblxuICAgIC8vIERpcmVjdGlvbiB0aHJlc2hob2xkc1xuICAgIHZhciBmb3J3YXJkRnJvbSA9IC0yNTtcbiAgICB2YXIgZm9yd2FyZFRvID0gMjU7XG5cbiAgICAvLyBSaWdodFxuICAgIHZhciByaWdodFNsaWdodEZyb20gPSAyNTtcbiAgICB2YXIgcmlnaHRTbGlnaHRUbyA9IDQ1O1xuICAgIHZhciByaWdodEZyb20gPSA0NTtcbiAgICB2YXIgcmlnaHRUbyA9IDEzNTtcbiAgICB2YXIgcmlnaHRCYWNrRnJvbSA9IDEzNTtcbiAgICB2YXIgcmlnaHRCYWNrVG8gPSAxODA7XG5cbiAgICAvLyBMZWZ0XG4gICAgdmFyIGxlZnRTbGlnaHRGcm9tID0gLTQ1O1xuICAgIHZhciBsZWZ0U2xpZ2h0VG8gPSAtMjU7XG4gICAgdmFyIGxlZnRGcm9tID0gLTEzNTtcbiAgICB2YXIgbGVmdFRvID0gLTQ1O1xuICAgIHZhciBsZWZ0QmFja0Zyb20gPSAtMTgwO1xuICAgIHZhciBsZWZ0QmFja1RvID0gLTEzNTtcblxuICAgIC8vIEN1c3RvbSB0cmVzaG9sZHM/XG4gICAgaWYoY3VzdG9tVHJlc2hvbGRzKSB7XG4gICAgICAvLyBBcHBseSB0aGVtXG4gICAgICAvLy4uLlxuICAgICAgdm9pZCAwO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBkaXJcbiAgICB2YXIgcmV0dXJuRGlyZWN0aW9uID0gJyc7XG5cbiAgICAvLyBGb3J3YXJkXG4gICAgaWYoKGZvcndhcmRGcm9tIDw9IGFuZ2xlKSAmJiAoYW5nbGUgPD0gZm9yd2FyZFRvKSkge1xuICAgICAgLy8gRm9yd2FyZFxuXG4gICAgICAvLyBEaXJlY3Rpb25cbiAgICAgIHJldHVybkRpcmVjdGlvbiA9ICdGb3J3YXJkJztcbiAgICB9XG4gICAgLy8gU2xpZ2h0IFJpZ2h0XG4gICAgZWxzZSBpZigocmlnaHRTbGlnaHRGcm9tIDw9IGFuZ2xlKSAmJiAoYW5nbGUgPD0gcmlnaHRTbGlnaHRUbykpIHtcbiAgICAgIC8vIFJpZ2h0XG5cbiAgICAgIC8vIERpcmVjdGlvblxuICAgICAgcmV0dXJuRGlyZWN0aW9uID0gJ1NsaWdodCBSaWdodCc7XG4gICAgfVxuICAgIC8vIFJpZ2h0XG4gICAgZWxzZSBpZigocmlnaHRGcm9tIDw9IGFuZ2xlKSAmJiAoYW5nbGUgPD0gcmlnaHRUbykpIHtcbiAgICAgIC8vIFJpZ2h0XG5cbiAgICAgIC8vIERpcmVjdGlvblxuICAgICAgcmV0dXJuRGlyZWN0aW9uID0gJ1JpZ2h0JztcbiAgICB9XG4gICAgLy8gU2xpZ2h0IExlZnRcbiAgICBlbHNlIGlmKChsZWZ0U2xpZ2h0RnJvbSA8PSBhbmdsZSkgJiYgKGFuZ2xlIDw9IGxlZnRTbGlnaHRUbykpIHtcbiAgICAgIC8vIExlZnRcblxuICAgICAgLy8gRGlyZWN0aW9uXG4gICAgICByZXR1cm5EaXJlY3Rpb24gPSAnU2xpZ2h0IExlZnQnO1xuICAgIH1cbiAgICAvLyBMZWZ0XG4gICAgZWxzZSBpZigobGVmdEZyb20gPD0gYW5nbGUpICYmIChhbmdsZSA8PSBsZWZ0VG8pKSB7XG4gICAgICAvLyBMZWZ0XG5cbiAgICAgIC8vIERpcmVjdGlvblxuICAgICAgcmV0dXJuRGlyZWN0aW9uID0gJ0xlZnQnO1xuICAgIH1cbiAgICAvLyBCYWNrXG4gICAgZWxzZSBpZigoKGxlZnRCYWNrRnJvbSA8PSBhbmdsZSkgJiYgKGFuZ2xlIDw9IGxlZnRCYWNrVG8pKSB8fFxuICAgICAgKChyaWdodEJhY2tGcm9tIDw9IGFuZ2xlKSAmJiAoYW5nbGUgPD0gcmlnaHRCYWNrVG8pKSkge1xuICAgICAgLy8gTGVmdFxuXG4gICAgICAvLyBEaXJlY3Rpb25cbiAgICAgIHJldHVybkRpcmVjdGlvbiA9ICdCYWNrJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJy1kaXJlY3Rpb25Gcm9tQW5nbGUtXFxuJywgJ05vIGNvdmVyYWdlIGZvciBhbmdsZSBkaWZmZXJlbmNlOicsIGFuZ2xlKTtcbiAgICB9XG5cbiAgICAvLyBSZXRcbiAgICByZXR1cm4gcmV0dXJuRGlyZWN0aW9uO1xuICB9LFxuXG4gIHJldHVybkRpcmVjdGlvblRvUG9pbnQ6IGZ1bmN0aW9uKGN1cnJlbnRQb2ludCwgdG9Qb2ludCwgcHJldmlvdXNBbmdsZSkge1xuICAgIC8vIEdldCBhbmdsZSBjb21wYXJpbmcgRGlyZWN0aW9uIGFuZ2xlVG9OZXh0XG4gICAgLy8gRGlyZWN0aW9uXG4gICAgLy8gR2V0IERpcmVjdGlvblxuICAgIC8vIEZpZ3VyZSBvdXQgdGhlIGFuZ2xlIHRvIG5leHRcbiAgICAvLyBHZXQgYW5nbGVcbiAgICB2YXIgYW5nbGUgPSBfXy5wb2ludFBhaXJUb0JlYXJpbmdEZWdyZWVzKGN1cnJlbnRQb2ludCwgdG9Qb2ludCk7XG5cbiAgICAvLyBXaGF0IGlzIHRoZSBhbmdsZSBkaWZmZXJlbmNlP1xuICAgIHZhciBhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlID0gcHJldmlvdXNBbmdsZSAtIGFuZ2xlO1xuICAgIHdoaWxlKGFuZ2xlVG9MYW5kbWFya0RpZmZlcmVuY2UgPCAtMTgwKSBhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlICs9IDM2MDtcbiAgICB3aGlsZShhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlID4gMTgwKSBhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlIC09IDM2MDtcblxuICAgIC8vIENvbXB1dGUgbmV4dCBkaXJlY3Rpb25cbiAgICB2YXIgcmV0dXJuU3RyaW5nID0gX18uZGlyZWN0aW9uRnJvbUFuZ2xlKGFuZ2xlVG9MYW5kbWFya0RpZmZlcmVuY2UsIG51bGwpO1xuXG4gICAgLy8gUmV0XG4gICAgcmV0dXJuIHJldHVyblN0cmluZztcbiAgfSxcblxuICBpc1BvaW50SW5zaWRlUm90YXRlZFJlY3Q6IGZ1bmN0aW9uKHAsIGEsIGIsIGMsIGQpIHtcbiAgICBpZigoX18udHJpYW5nbGVBcmVhKGEsIGIsIHApID4gMCkgfHxcbiAgICAgIChfXy50cmlhbmdsZUFyZWEoYiwgYywgcCkgPiAwKSB8fFxuICAgICAgKF9fLnRyaWFuZ2xlQXJlYShjLCBkLCBwKSA+IDApIHx8XG4gICAgICAoX18udHJpYW5nbGVBcmVhKGQsIGEsIHApID4gMCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgdHJpYW5nbGVBcmVhOiBmdW5jdGlvbihhLCBiLCBjKSB7XG4gICAgcmV0dXJuKChjWzBdICogYlsxXSkgLSAoYlswXSAqIGNbMV0pKSAtICgoY1swXSAqIGFbMV0pIC0gKGFbMF0gKiBjWzFdKSkgKyAoKGJbMF0gKiBhWzFdKSAtIChhWzBdICogYlsxXSkpO1xuICB9LFxuXG4gIGRvTGluZVNlZ21lbnRzSW50ZXJzZWN0OiBmdW5jdGlvbihsMTEsIGwxMiwgbDIxLCBsMjIpIHtcbiAgICB2YXIgZCA9IChsMTJbMF0gLSBsMTFbMF0pICogKGwyMlsxXSAtIGwyMVsxXSkgLSAobDEyWzFdIC0gbDExWzFdKSAqIChsMjJbMF0gLSBsMjFbMF0pO1xuICAgIGlmKGQgPT09IDApIHtcbiAgICAgIC8vIFNsb3BlIGlzIHNhbWUtLWxpbmVzIGFyZSBwYXJhbGxlbFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgdSA9ICgobDIxWzBdIC0gbDExWzBdKSAqIChsMjJbMV0gLSBsMjFbMV0pIC0gKGwyMVsxXSAtIGwxMVsxXSkgKiAobDIyWzBdIC0gbDIxWzBdKSkgLyBkO1xuICAgIHZhciB2ID0gKChsMjFbMF0gLSBsMTFbMF0pICogKGwxMlsxXSAtIGwxMVsxXSkgLSAobDIxWzFdIC0gbDExWzFdKSAqIChsMTJbMF0gLSBsMTFbMF0pKSAvIGQ7XG4gICAgaWYodSA8IDAuMCB8fCB1ID4gMS4wKSB7XG4gICAgICAvLyBMaW5lMSBwYXNzZXMgYnkgTGluZTIgb24gdGhlIGxlZnRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYodiA8IDAuMCB8fCB2ID4gMS4wKSB7XG4gICAgICAvLyBMaW5lMSBwYXNzZXMgYnkgTGluZTIgb24gdGhlIHJpZ2h0XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFRoZXkgZG8gaW50ZXJzZWN0XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgYXJyYXlPZlJvdGF0ZWRQb2ludHM6IGZ1bmN0aW9uKHJlY3QpIHtcbiAgICAvLyBBbmdsZVxuICAgIHZhciB0aGV0YSA9IDA7XG4gICAgLy8gR2V0IHRyYW5zZm9ybSBtYXRyaXgsIGlmIGFueVxuICAgIC8vIFRoaXMgcm90YXRlcyByZWN0XG4gICAgaWYocmVjdC50cmFuc2Zvcm0gJiYgcmVjdC50cmFuc2Zvcm0ubGVuZ3RoID4gMCkge1xuICAgICAgaWYocmVjdC50cmFuc2Zvcm0uaW5kZXhPZignbWF0cml4KCcpID4gLTEpIHtcbiAgICAgICAgLy8nbWF0cml4KDAuNzA3MSAwLjcwNzEgLTAuNzA3MSAwLjcwNzEgMTA2Ny4xMjQgLTUyMi4yNzY2KSdcbiAgICAgICAgdmFyIG5ld01hdHJpeCA9IHJlY3QudHJhbnNmb3JtLnNwbGl0KCdtYXRyaXgoJykuam9pbignJykuc3BsaXQoJyknKS5qb2luKCcnKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBuZXdNYXRyaXguc3BsaXQoJyAnKTtcbiAgICAgICAgaWYoY29tcG9uZW50cy5sZW5ndGggPiA1KSB7XG4gICAgICAgICAgdmFyIGEgPSBwYXJzZUZsb2F0KGNvbXBvbmVudHNbMF0pLFxuICAgICAgICAgICAgYiA9IHBhcnNlRmxvYXQoY29tcG9uZW50c1sxXSk7XG5cbiAgICAgICAgICB0aGV0YSA9IE1hdGguYXRhbjIoYiwgYSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgY2VudGVyIG9mIHJlY3RcbiAgICB2YXIgYyA9IF9fLnJldHVybkNlbnRlck9mUmVjdChyZWN0KTtcblxuICAgIC8vIE1ha2UgYXJyYXkgb2YgcG9pbnRzLCBtYWtlIHN1cmUgdGhleSBhcmUgY29ubmVjdGVkIHRvIGVhY2ggb3RoZXIgKGRvbid0IG1ha2UgZGlhZ29uYWwgcG9pbnRzIGluIHNlcXVlbmNlKVxuICAgIHZhciBwb2ludHMgPSBbXTtcblxuICAgIC8vIDFcbiAgICB2YXIgcDEgPSBbcmVjdC54LCByZWN0LnldO1xuICAgIHBvaW50c1swXSA9IF9fLnJvdGF0ZVBvaW50KHAxLCBjLCB0aGV0YSk7XG4gICAgLy8gMlxuICAgIHZhciBwMiA9IFtyZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnldO1xuICAgIHBvaW50c1sxXSA9IF9fLnJvdGF0ZVBvaW50KHAyLCBjLCB0aGV0YSk7XG4gICAgLy8gM1xuICAgIHZhciBwMyA9IFtyZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnkgKyByZWN0LmhlaWdodF07XG4gICAgcG9pbnRzWzJdID0gX18ucm90YXRlUG9pbnQocDMsIGMsIHRoZXRhKTtcbiAgICAvLyA0XG4gICAgdmFyIHA0ID0gW3JlY3QueCwgcmVjdC55ICsgcmVjdC5oZWlnaHRdO1xuICAgIHBvaW50c1szXSA9IF9fLnJvdGF0ZVBvaW50KHA0LCBjLCB0aGV0YSk7XG5cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9LFxuXG4gIHJldHVybkNlbnRlck9mUmVjdDogZnVuY3Rpb24ocmVjdCkge1xuICAgIHZhciBjZW50ZXJYID0gcmVjdC54ICsgKHJlY3Qud2lkdGggLyAyLjApO1xuICAgIHZhciBjZW50ZXJZID0gcmVjdC55ICsgKHJlY3QuaGVpZ2h0IC8gMi4wKTtcbiAgICByZXR1cm4gW2NlbnRlclgsIGNlbnRlclldO1xuICB9LFxuXG4gIHJvdGF0ZVBvaW50OiBmdW5jdGlvbihwb2ludCwgY2VudGVyLCBhbmdsZSkge1xuICAgIC8vIGN4LCBjeSAtIGNlbnRlciBvZiBzcXVhcmUgY29vcmRpbmF0ZXNcbiAgICAvLyB4LCB5IC0gY29vcmRpbmF0ZXMgb2YgYSBjb3JuZXIgcG9pbnQgb2YgdGhlIHNxdWFyZVxuICAgIC8vIHRoZXRhIGlzIHRoZSBhbmdsZSBvZiByb3RhdGlvblxuXG4gICAgLy8gdHJhbnNsYXRlIHBvaW50IHRvIG9yaWdpblxuICAgIHZhciB0ZW1wWCA9IHBvaW50WzBdIC0gY2VudGVyWzBdO1xuICAgIHZhciB0ZW1wWSA9IHBvaW50WzFdIC0gY2VudGVyWzFdO1xuXG4gICAgLy8gbm93IGFwcGx5IHJvdGF0aW9uXG4gICAgdmFyIHJvdGF0ZWRYID0gdGVtcFggKiBNYXRoLmNvcyhhbmdsZSkgLSB0ZW1wWSAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICB2YXIgcm90YXRlZFkgPSB0ZW1wWCAqIE1hdGguc2luKGFuZ2xlKSArIHRlbXBZICogTWF0aC5jb3MoYW5nbGUpO1xuXG4gICAgLy8gdHJhbnNsYXRlIGJhY2tcbiAgICB2YXIgeCA9IHJvdGF0ZWRYICsgY2VudGVyWzBdO1xuICAgIHZhciB5ID0gcm90YXRlZFkgKyBjZW50ZXJbMV07XG5cbiAgICByZXR1cm4gW3gsIHldO1xuICB9LFxuXG4gIGRpc3RhbmNlVG9MaW5lOiBmdW5jdGlvbih4eSwgcDEsIHAyLCBpbnN0ZXJzZWN0KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChfXy5kaXN0VG9TZWdtZW50U3F1YXJlZCh4eSwgcDEsIHAyLCBpbnN0ZXJzZWN0KSk7XG4gIH0sXG5cbiAgZGlzdFRvU2VnbWVudFNxdWFyZWQ6IGZ1bmN0aW9uKHh5LCBwMSwgcDIsIHBvaW50T2ZJbnRlcnNlY3QpIHtcbiAgICB2YXIgbDIgPSBfXy5kaXN0MihwMSwgcDIpO1xuXG4gICAgaWYobDIgPT09IDApIHtcbiAgICAgIHBvaW50T2ZJbnRlcnNlY3QudmFsdWUgPSBwMjtcbiAgICAgIHJldHVybiBfXy5kaXN0Mih4eSwgcDIpO1xuICAgIH1cblxuICAgIHZhciB0ID0gKCh4eVswXSAtIHAxWzBdKSAqIChwMlswXSAtIHAxWzBdKSArICh4eVsxXSAtIHAxWzFdKSAqIChwMlsxXSAtIHAxWzFdKSkgLyBsMjtcblxuICAgIGlmKHQgPCAwKSB7XG4gICAgICBwb2ludE9mSW50ZXJzZWN0LnZhbHVlID0gcDE7XG4gICAgICByZXR1cm4gX18uZGlzdDIoeHksIHAxKTtcbiAgICB9XG4gICAgaWYodCA+IDEpIHtcbiAgICAgIHBvaW50T2ZJbnRlcnNlY3QudmFsdWUgPSBwMjtcbiAgICAgIHJldHVybiBfXy5kaXN0Mih4eSwgcDIpO1xuICAgIH1cblxuICAgIC8vIFBvaW50IG9mIGludGVyc2VjdFxuICAgIHBvaW50T2ZJbnRlcnNlY3QudmFsdWUgPSBbXG4gICAgICBwMVswXSArIHQgKiAocDJbMF0gLSBwMVswXSksXG4gICAgICBwMVsxXSArIHQgKiAocDJbMV0gLSBwMVsxXSlcbiAgICBdO1xuXG4gICAgcmV0dXJuIF9fLmRpc3QyKHh5LCBwb2ludE9mSW50ZXJzZWN0LnZhbHVlKTtcbiAgfSxcblxuICBkaXN0MjogZnVuY3Rpb24ocDEsIHAyKSB7XG4gICAgcmV0dXJuKF9fLnNxcihwMVswXSAtIHAyWzBdKSArIF9fLnNxcihwMVsxXSAtIHAyWzFdKSk7XG4gIH0sXG5cbiAgc3FyOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggKiB4O1xuICB9LFxuXG4gIHBvaW50UGFpclRvQmVhcmluZ0RlZ3JlZXM6IGZ1bmN0aW9uKHN0YXJ0aW5nUG9pbnQsIGVuZGluZ1BvaW50KSB7XG4gICAgLy8gTk9URTogMCBkZWdyZWUgaXMgb24geSBheGlzIG9uIHRvcCBzaWRlXG4gICAgLy8gICAgICAgIDBcbiAgICAvLyAgICAgICAgfFxuICAgIC8vICBxPTIgICB5ICAgICBxPTFcbiAgICAvLyAgICAgICAgfFxuICAgIC8vIDE4MC0teC0rLS0tIDAgZGVncmVlc1xuICAgIC8vICAgICAgICB8XG4gICAgLy8gIHE9MyAgIDI3MCAgIHE9NFxuICAgIC8vICAgICAgICB8XG4gICAgLy8gICAgICAgIHxcbiAgICB2YXIgdmVjdG9yID0gW2VuZGluZ1BvaW50WzBdIC0gc3RhcnRpbmdQb2ludFswXSwgZW5kaW5nUG9pbnRbMV0gLSBzdGFydGluZ1BvaW50WzFdXTtcbiAgICB2YXIgYW5nbGVDYWxjO1xuICAgIGlmKHZlY3RvclsxXSA8IDApIHtcbiAgICAgIC8vIHVwcGVyIEhhbGZcbiAgICAgIGFuZ2xlQ2FsYyA9IE1hdGguYXRhbjIoLXZlY3RvclsxXSwgdmVjdG9yWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5nbGVDYWxjID0gTWF0aC5hdGFuMih2ZWN0b3JbMV0sIC12ZWN0b3JbMF0pICsgTWF0aC5QSTtcbiAgICB9XG5cbiAgICByZXR1cm4gYW5nbGVDYWxjICogKDE4MCAvIE1hdGguUEkpO1xuICB9LFxuXG4gIHBvaW50T25MaW5lVXNpbmdEaXN0YW5jZUZyb21TdGFydDogZnVuY3Rpb24obHAxLCBscDIsIGRpc3RhbmNlRnJvbVAxKSB7XG4gICAgdmFyIHJhZGlhbnMgPSBNYXRoLmF0YW4yKGxwMlsxXSAtIGxwMVsxXSwgbHAyWzBdIC0gbHAxWzBdKTtcblxuICAgIHZhciBkZXJpdmVkUG9pbnRYID0gbHAxWzBdICsgZGlzdGFuY2VGcm9tUDEgKiBNYXRoLmNvcyhyYWRpYW5zKTtcbiAgICB2YXIgZGVyaXZlZFBvaW50WSA9IGxwMVsxXSArIGRpc3RhbmNlRnJvbVAxICogTWF0aC5zaW4ocmFkaWFucyk7XG5cbiAgICByZXR1cm4gW2Rlcml2ZWRQb2ludFgsIGRlcml2ZWRQb2ludFldO1xuICB9LFxuXG4gIGRpc3RhbmNlQmV0d2VlbjogZnVuY3Rpb24oZnJvbVhZLCBhbmRYWSkge1xuICAgIHZhciB4U2VnbWVudCA9IGFuZFhZWzBdIC0gZnJvbVhZWzBdO1xuICAgIHZhciB5U2VnbWVudCA9IGFuZFhZWzFdIC0gZnJvbVhZWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHhTZWdtZW50ICogeFNlZ21lbnQpICsgKHlTZWdtZW50ICogeVNlZ21lbnQpKTtcbiAgfSxcblxuICBzdHJpbmdDb250YWluc1N0cmluZzogZnVuY3Rpb24oc3RyLCBjb250KSB7XG4gICAgcmV0dXJuIHN0ci5pbmRleE9mKGNvbnQpID4gLTE7XG4gIH0sXG5cbiAgY29udmVydE1ldGVyc1RvUGl4ZWxzOiBmdW5jdGlvbihtZXRlcnMsIHh5U2NhbGUpIHtcbiAgICAvLyB4eVNjYWxlIGlzIG1pbGltZXRlcnMgcGVyIHBpeGVsXG4gICAgaWYoeHlTY2FsZSA9PT0gMCkge1xuICAgICAgLy8gMTF0aCBjb21tYW5kbWVudC0tXCJUaG91IHNoYWxsIG5vdCBkaXZpZGUgYnkgemVybyFcIlxuICAgICAgcmV0dXJuIC0xLjA7XG4gICAgfVxuICAgIHJldHVybihtZXRlcnMgKiAxMDAwKSAvIHh5U2NhbGU7XG4gIH0sXG5cbiAgY29udmVydFBpeGVsc1RvTWV0ZXJzOiBmdW5jdGlvbihwaXhlbHMsIHh5U2NhbGUpIHtcbiAgICAvLyB4eVNjYWxlIGlzIG1pbGltZXRlcnMgcGVyIHBpeGVsXG4gICAgaWYoeHlTY2FsZSA9PT0gMCkge1xuICAgICAgLy8gMTF0aCBjb21tYW5kbWVudC0tXCJUaG91IHNoYWxsIG5vdCBkaXZpZGUgYnkgemVybyFcIlxuICAgICAgcmV0dXJuIC0xLjA7XG4gICAgfVxuICAgIC8vIHh5U2NhbGUgaXMgbWlsaW1ldGVycyBwZXIgcGl4ZWxcbiAgICByZXR1cm4ocGl4ZWxzICogeHlTY2FsZSkgLyAxMDAwO1xuICB9LFxuXG4gIGNvcnJlY3RQb2ludFVzaW5nV2F5ZmluZFBhdGg6IGZ1bmN0aW9uKHNldE9mUG9pbnRzLCBwb2ludCwgbm9GdXJ0aGVyVGhhbikge1xuICAgIHZhciByZXR1cm5Qb2ludCA9IFswLCAwXTtcbiAgICB2YXIgY2xvc2VzdERpc3RhbmNlRnJvbVBhdGggPSAtMTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBwb2ludHMgYW5kIG1ha2UgbGluZXNcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2V0T2ZQb2ludHMucG9pbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgLy8gR2V0IG5leHQgdHdvIHBvaW50c1xuICAgICAgdmFyIGZpcnN0ID0gc2V0T2ZQb2ludHMucG9pbnRzW2ldO1xuICAgICAgdmFyIGxpbmVQMSA9IFtmaXJzdC54LCBmaXJzdC55XTtcblxuICAgICAgdmFyIHNlY29uZCA9IHNldE9mUG9pbnRzLnBvaW50c1tpICsgMV07XG4gICAgICB2YXIgbGluZVAyID0gW3NlY29uZC54LCBzZWNvbmQueV07XG5cbiAgICAgIC8vIEdldCB0aGUgZGlzdGFuY2VcbiAgICAgIHZhciB0ZW1wUG9pbnRPZkludGVyY2VwdCA9IHtcbiAgICAgICAgdmFsdWU6IFswLCAwXVxuICAgICAgfTtcblxuICAgICAgdmFyIG5leHREaXN0YW5jZSA9IF9fLmRpc3RhbmNlVG9MaW5lKHBvaW50LCBsaW5lUDEsIGxpbmVQMiwgdGVtcFBvaW50T2ZJbnRlcmNlcHQpO1xuICAgICAgaWYoKGNsb3Nlc3REaXN0YW5jZUZyb21QYXRoID09IC0xKSB8fCAobmV4dERpc3RhbmNlIDwgY2xvc2VzdERpc3RhbmNlRnJvbVBhdGgpKSB7XG4gICAgICAgIC8vIE5ldyBwb2ludFxuICAgICAgICBjbG9zZXN0RGlzdGFuY2VGcm9tUGF0aCA9IG5leHREaXN0YW5jZTtcblxuICAgICAgICAvLyBHZXQgbmV3IHBvaW50XG4gICAgICAgIHJldHVyblBvaW50ID0gdGVtcFBvaW50T2ZJbnRlcmNlcHQudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbm9GdXJ0aGVyVGhhbj9cbiAgICBpZigwIDwgbm9GdXJ0aGVyVGhhbikge1xuICAgICAgdmFyIHhEaXN0ID0gKHJldHVyblBvaW50LnggLSBwb2ludC54KTtcbiAgICAgIHZhciB5RGlzdCA9IChyZXR1cm5Qb2ludC55IC0gcG9pbnQueSk7XG4gICAgICB2YXIgZGlzdGFuY2VGcm9tSW50ZW5kZWQgPSBNYXRoLnNxcnQoX18uc3FyKHhEaXN0KSArIF9fLnNxcih5RGlzdCkpO1xuICAgICAgaWYobm9GdXJ0aGVyVGhhbiA8IGRpc3RhbmNlRnJvbUludGVuZGVkKSB7XG4gICAgICAgIC8vIFBvaW50IHRvbyBmYXIgZnJvbSBpbnRlbmRlZCwgcmV0dXJuIG9yaWdpbmFsIHBvaW50XG4gICAgICAgIHJldHVyblBvaW50ID0gcG9pbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblBvaW50O1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gX187XG4iLCIgIC8qIGpzaGludCAtVzA4MyAqL1xuICB2YXIgX18gPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb2Nlc3Nvcikge1xuXG4gICAgLy8gbGluZU9mU2lnaHRGcm9tQ2xvc2VzdExhbmRtYXJrVG9YWSB2ZXJzaW9uIGJhc2VkIG9uIHJhbmtpbmdzXG4gICAgLy8gSXQgd2lsbCBmaW5kIDQgbGFuZG1hcmtzIGdvaW5nIGluIGZvdXIgbWFqb3IgZGlyZWN0aW9ucy5cbiAgICAvLyBJdCB3aWxsIHJldHVybiB0aGUgY2xvc2VzdCBsYW5kbWFyayB3aGljaCBpcyBpbiBzYW1lIGRpcmVjdGlvbiBhcyB0aGUgZGlyZWN0aW9uIG9mIG5leHQgc3RlcC5cbiAgICBwcm9jZXNzb3IubGluZU9mU2lnaHRGcm9tQ2xvc2VzdExhbmRtYXJrVG9YWSA9IGZ1bmN0aW9uKHRoaXNYWSwgcG9pbnRPZkludGVyY2VwdCwgZGlyZWN0aW9uLCBwcmV2aW91c0FuZ2xlLCBmb3JDYW52YXMpIHtcbiAgICAgIHZhciByZXR1cm5EZXN0ID0gbnVsbDtcbiAgICAgIC8vIHZhciBpbnRlcnNlY3RQb2ludCA9IFswLCAwXTtcbiAgICAgIHZhciBmaW5hbFVuaXRJZCA9IG51bGw7XG5cbiAgICAgIC8vIExldCdzIGZpbmQgYWxsIGZvdXIgbGFuZG1hcmtzXG4gICAgICAvLyBGb3J3YXJkXG4gICAgICB2YXIgdGVtcEludGVyc2VjdFBvaW50Rm9yd2FyZCA9IFswLCAwXTtcbiAgICAgIHZhciBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID0gLTE7XG4gICAgICB2YXIgY2xvc2VzdFVuaXRJZEZvcndhcmQgPSBudWxsO1xuICAgICAgLy9TbGlnaHQgbGVmdFxuICAgICAgdmFyIHRlbXBJbnRlcnNlY3RQb2ludExlZnRTbGlnaHQgPSBbMCwgMF07XG4gICAgICB2YXIgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA9IC0xO1xuICAgICAgdmFyIGNsb3Nlc3RVbml0SWRMZWZ0U2xpZ2h0ID0gbnVsbDtcbiAgICAgIC8vIExlZnRcbiAgICAgIHZhciB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0ID0gWzAsIDBdO1xuICAgICAgdmFyIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQgPSAtMTtcbiAgICAgIHZhciBjbG9zZXN0VW5pdElkTGVmdCA9IG51bGw7XG4gICAgICAvLyBTbGlnaHQgUmlnaHRcbiAgICAgIHZhciB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFNsaWdodCA9IFswLCAwXTtcbiAgICAgIHZhciBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA9IC0xO1xuICAgICAgdmFyIGNsb3Nlc3RVbml0SWRSaWdodFNsaWdodCA9IG51bGw7XG4gICAgICAvLyBSaWdodFxuICAgICAgdmFyIHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0ID0gWzAsIDBdO1xuICAgICAgdmFyIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0ID0gLTE7XG4gICAgICB2YXIgY2xvc2VzdFVuaXRJZFJpZ2h0ID0gbnVsbDtcbiAgICAgIC8vIEJhY2tcbiAgICAgIHZhciB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrID0gWzAsIDBdO1xuICAgICAgdmFyIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0JhY2sgPSAtMTtcbiAgICAgIHZhciBjbG9zZXN0VW5pdElkQmFjayA9IG51bGw7XG5cbiAgICAgIC8vIEdldCBhY2Nlc3MgdG8gc2hhcGVzXG4gICAgICB2YXIgY2FudmFzU2hhcGVzID0gZm9yQ2FudmFzO1xuXG4gICAgICAvLyBHbyB0aHJvdWdoIGFsbCBMQm94ZXNcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjYW52YXNTaGFwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGxib3ggPSBjYW52YXNTaGFwZXNbaV07XG4gICAgICAgIC8vIEJyeWFuOiBHb3QgdGhlIG5lZWRlZCBkYXRhIHRvIGhpZ2hsaWdodCBVbml0c1xuICAgICAgICBpZihsYm94KSB7XG4gICAgICAgICAgdmFyIHVuaXRJZCwgbEJveEZyYW1lLCByb3RhdGVkUG9pbnRzO1xuXG4gICAgICAgICAgaWYobGJveC5wYXJzZWQpIHtcbiAgICAgICAgICAgIHVuaXRJZCA9IGxib3gucGFyc2VkLnVuaXRJZDtcbiAgICAgICAgICAgIGxCb3hGcmFtZSA9IGxib3gucGFyc2VkLmxCb3hGcmFtZTtcbiAgICAgICAgICAgIHJvdGF0ZWRQb2ludHMgPSBsYm94LnBhcnNlZC5yb3RhdGVkUG9pbnRzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBHZXQgVW5pdCBJZFxuICAgICAgICAgICAgLy8gQnJ5YW46IHBvc3NpYmxlIGZsYXdlZCBkZXNpZ24uIEkgYW0gdXNpbmcgZmlyc3QgaWQgaW4gYXJyYXkgb2YgKHBvc3NpYmx5KSBtdWx0aXBsZSBpZHNcbiAgICAgICAgICAgIHZhciBkYXRhTGJveCA9IGxib3guZ2V0QXR0cmlidXRlKCdkYXRhLWxib3gnKTtcbiAgICAgICAgICAgIGlmKGRhdGFMYm94KSB1bml0SWQgPSBwYXJzZUludChkYXRhTGJveCk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBDR1BhdGggZnJhbWUgaXMgYm91bmRpbmcgZnJhbWUgKHJvdGF0ZWQpIG9mIExCb3hcbiAgICAgICAgICAgIGxCb3hGcmFtZSA9IHtcbiAgICAgICAgICAgICAgeDogcGFyc2VGbG9hdChsYm94LmdldEF0dHJpYnV0ZSgneCcpKSxcbiAgICAgICAgICAgICAgeTogcGFyc2VGbG9hdChsYm94LmdldEF0dHJpYnV0ZSgneScpKSxcbiAgICAgICAgICAgICAgd2lkdGg6IHBhcnNlRmxvYXQobGJveC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpLFxuICAgICAgICAgICAgICBoZWlnaHQ6IHBhcnNlRmxvYXQobGJveC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKSxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiBsYm94LmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJylcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEdldCByb3RhdGVkIHBvaW50c1xuICAgICAgICAgICAgcm90YXRlZFBvaW50cyA9IF9fLmFycmF5T2ZSb3RhdGVkUG9pbnRzKGxCb3hGcmFtZSk7XG5cbiAgICAgICAgICAgIGxib3gucGFyc2VkID0ge1xuICAgICAgICAgICAgICB1bml0SWQ6IHVuaXRJZCxcbiAgICAgICAgICAgICAgbEJveEZyYW1lOiBsQm94RnJhbWUsXG4gICAgICAgICAgICAgIHJvdGF0ZWRQb2ludHM6IHJvdGF0ZWRQb2ludHMsXG4gICAgICAgICAgICAgIGRhdGFMYm94OiBkYXRhTGJveCA/IGRhdGFMYm94LnNwbGl0KCcsJykgOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTa2lwIGlmIG5pbFxuICAgICAgICAgIGlmKCF1bml0SWQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgLy8gTm93IGdldCBwYWlycyBvZiBwb2ludHMgYW5kIGdldCBjbG9zZXN0IGludGVyc2VjdGlvbiBmcm9tIFRoaXNYWVxuICAgICAgICAgIHZhciB0ZW1wSW50ZXJzZWN0UG9pbnQgPSB7XG4gICAgICAgICAgICB2YWx1ZTogWzAsIDBdXG4gICAgICAgICAgfTtcbiAgICAgICAgICAvLyBOZXcgcmVjb3JkIHdpbGwgYmUgdXNlZCB0byBjaGVjayBmb3IgbGluZSBvZiBzaWdodFxuICAgICAgICAgIHZhciBuZXdSZWNvcmRGb3J3YXJkID0gZmFsc2U7XG4gICAgICAgICAgdmFyIG5ld1JlY29yZExlZnRTbGlnaHQgPSBmYWxzZTtcbiAgICAgICAgICB2YXIgbmV3UmVjb3JkTGVmdCA9IGZhbHNlO1xuICAgICAgICAgIHZhciBuZXdSZWNvcmRSaWdodFNsaWdodCA9IGZhbHNlO1xuICAgICAgICAgIHZhciBuZXdSZWNvcmRSaWdodCA9IGZhbHNlO1xuICAgICAgICAgIHZhciBuZXdSZWNvcmRCYWNrID0gZmFsc2U7XG4gICAgICAgICAgLy8gT2YgNCBsaW5lcywgd2hpY2ggb25lIGlzIHRoZSBjbG9zZXN0P1xuICAgICAgICAgIHZhciBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPSAtMTtcbiAgICAgICAgICB2YXIgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID0gLTE7XG4gICAgICAgICAgdmFyIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9IC0xO1xuICAgICAgICAgIHZhciBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0ID0gLTE7XG4gICAgICAgICAgdmFyIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPSAtMTtcbiAgICAgICAgICB2YXIgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNCYWNrID0gLTE7XG5cbiAgICAgICAgICAvLyBUb3AgbGluZVxuICAgICAgICAgIHZhciBwMSA9IHJvdGF0ZWRQb2ludHNbMF07XG4gICAgICAgICAgdmFyIHAyID0gcm90YXRlZFBvaW50c1sxXTtcbiAgICAgICAgICB2YXIgcDMgPSByb3RhdGVkUG9pbnRzWzJdO1xuICAgICAgICAgIHZhciBwNCA9IHJvdGF0ZWRQb2ludHNbM107XG5cbiAgICAgICAgICAvLyBHZXQgZGlzdGFuY2Ugb2YgbmVhcmVzdCBpbnRlcmNlcHRcbiAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBfXy5kaXN0YW5jZVRvTGluZSh0aGlzWFksIHAxLCBwMiwgdGVtcEludGVyc2VjdFBvaW50KTtcbiAgICAgICAgICAvLyBGaW5kIHdoaWNoIHdheSB0aGlzIGlzIHBvaW50aW5nIHRvXG4gICAgICAgICAgdmFyIHByb3Bvc2VkRGlyZWN0aW9uID0gX18ucmV0dXJuRGlyZWN0aW9uVG9Qb2ludCh0aGlzWFksIHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZSwgcHJldmlvdXNBbmdsZSk7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBvbmUgbmVlZGVkXG5cbiAgICAgICAgICBzd2l0Y2gocHJvcG9zZWREaXJlY3Rpb24udG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgY2FzZSAnZm9yd2FyZCc6XG4gICAgICAgICAgICAgIC8vIEZvcndhcmRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNGb3J3YXJkKSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRGb3J3YXJkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludEZvcndhcmRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludEZvcndhcmQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgIC8vIExlZnRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0KSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludExlZnRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludExlZnQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAvLyBSaWdodFxuICAgICAgICAgICAgICBpZigoZGlzdGFuY2UgPCBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0ID09IC0xKSkge1xuICAgICAgICAgICAgICAgIC8vIE9mIGN1cnJlbnQgNCwgd2hpY2ggb25lIGlzIHRoZSBjbG9zZXN0P1xuICAgICAgICAgICAgICAgIGlmKChjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc1JpZ2h0ID09IC0xKSB8fCAoZGlzdGFuY2UgPCBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc1JpZ2h0KSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIC8vIG5ld1JlY29yZFxuICAgICAgICAgICAgICAgICAgbmV3UmVjb3JkUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgLy8gdGVtcEludGVyc2VjdFBvaW50UmlnaHRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0ID0gdGVtcEludGVyc2VjdFBvaW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JhY2snOlxuICAgICAgICAgICAgICAvLyBCYWNrXG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0JhY2spIHx8IChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNCYWNrID09IC0xKSkge1xuICAgICAgICAgICAgICAgIC8vIE9mIGN1cnJlbnQgNCwgd2hpY2ggb25lIGlzIHRoZSBjbG9zZXN0P1xuICAgICAgICAgICAgICAgIGlmKChjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0JhY2sgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzQmFjaykpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNsb3Nlc3Qgb25lXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0JhY2sgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIC8vIG5ld1JlY29yZFxuICAgICAgICAgICAgICAgICAgbmV3UmVjb3JkQmFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrXG4gICAgICAgICAgICAgICAgICB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrID0gdGVtcEludGVyc2VjdFBvaW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NsaWdodCByaWdodCc6XG4gICAgICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0KSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRSaWdodFNsaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50UmlnaHRTbGlnaHQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2xpZ2h0IGxlZnQnOlxuICAgICAgICAgICAgICAvLyBMZWZ0IFNsaWdodFxuICAgICAgICAgICAgICBpZigoZGlzdGFuY2UgPCBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0KSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA9PSAtMSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPZiBjdXJyZW50IDQsIHdoaWNoIG9uZSBpcyB0aGUgY2xvc2VzdD9cbiAgICAgICAgICAgICAgICBpZigoY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID09IC0xKSB8fCAoZGlzdGFuY2UgPCBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0xlZnRTbGlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAvLyBuZXdSZWNvcmRcbiAgICAgICAgICAgICAgICAgIG5ld1JlY29yZExlZnRTbGlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgLy8gdGVtcEludGVyc2VjdFBvaW50TGVmdFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50TGVmdFNsaWdodCA9IHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmlnaHQgbGluZVxuICAgICAgICAgIC8vIEdldCBkaXN0YW5jZSBvZiBuZWFyZXN0IGludGVyY2VwdFxuICAgICAgICAgIGRpc3RhbmNlID0gX18uZGlzdGFuY2VUb0xpbmUodGhpc1hZLCBwMiwgcDMsIHRlbXBJbnRlcnNlY3RQb2ludCk7XG5cbiAgICAgICAgICAvLyBGaW5kIHdoaWNoIHdheSB0aGlzIGlzIHBvaW50aW5nIHRvXG4gICAgICAgICAgcHJvcG9zZWREaXJlY3Rpb24gPSBfXy5yZXR1cm5EaXJlY3Rpb25Ub1BvaW50KHRoaXNYWSwgdGVtcEludGVyc2VjdFBvaW50LnZhbHVlLCBwcmV2aW91c0FuZ2xlKTtcblxuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgb25lIG5lZWRlZFxuICAgICAgICAgIHN3aXRjaChwcm9wb3NlZERpcmVjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICBjYXNlICdmb3J3YXJkJzpcbiAgICAgICAgICAgICAgLy8gRm9yd2FyZFxuICAgICAgICAgICAgICBpZigoZGlzdGFuY2UgPCBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNGb3J3YXJkKSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCA9PSAtMSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPZiBjdXJyZW50IDQsIHdoaWNoIG9uZSBpcyB0aGUgY2xvc2VzdD9cbiAgICAgICAgICAgICAgICBpZigoY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID09IC0xKSB8fCAoZGlzdGFuY2UgPCBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAvLyBuZXdSZWNvcmRcbiAgICAgICAgICAgICAgICAgIG5ld1JlY29yZEZvcndhcmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgLy8gdGVtcEludGVyc2VjdFBvaW50Rm9yd2FyZFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50Rm9yd2FyZCA9IHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgICAgICBpZigoZGlzdGFuY2UgPCBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0KSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9PSAtMSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPZiBjdXJyZW50IDQsIHdoaWNoIG9uZSBpcyB0aGUgY2xvc2VzdD9cbiAgICAgICAgICAgICAgICBpZigoY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0ID09IC0xKSB8fCAoZGlzdGFuY2UgPCBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0xlZnQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0ID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAvLyBuZXdSZWNvcmRcbiAgICAgICAgICAgICAgICAgIG5ld1JlY29yZExlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgLy8gdGVtcEludGVyc2VjdFBvaW50TGVmdFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50TGVmdCA9IHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0KSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50UmlnaHQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmFjayc6XG4gICAgICAgICAgICAgIC8vIEJhY2tcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzQmFjaykgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0JhY2sgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzQmFjayA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNCYWNrKSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzQmFjayA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRCYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludEJhY2tcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludEJhY2sgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2xpZ2h0IHJpZ2h0JzpcbiAgICAgICAgICAgICAgLy8gUmlnaHRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQpIHx8IChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA9PSAtMSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPZiBjdXJyZW50IDQsIHdoaWNoIG9uZSBpcyB0aGUgY2xvc2VzdD9cbiAgICAgICAgICAgICAgICBpZigoY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCkpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNsb3Nlc3Qgb25lXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0ID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAvLyBuZXdSZWNvcmRcbiAgICAgICAgICAgICAgICAgIG5ld1JlY29yZFJpZ2h0U2xpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0XG4gICAgICAgICAgICAgICAgICB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFNsaWdodCA9IHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzbGlnaHQgbGVmdCc6XG4gICAgICAgICAgICAgIC8vIExlZnQgU2xpZ2h0XG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnRTbGlnaHQpIHx8IChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID09IC0xKSkge1xuICAgICAgICAgICAgICAgIC8vIE9mIGN1cnJlbnQgNCwgd2hpY2ggb25lIGlzIHRoZSBjbG9zZXN0P1xuICAgICAgICAgICAgICAgIGlmKChjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0xlZnRTbGlnaHQgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCkpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNsb3Nlc3Qgb25lXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0xlZnRTbGlnaHQgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIC8vIG5ld1JlY29yZFxuICAgICAgICAgICAgICAgICAgbmV3UmVjb3JkTGVmdFNsaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0XG4gICAgICAgICAgICAgICAgICB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0U2xpZ2h0ID0gdGVtcEludGVyc2VjdFBvaW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBCb3R0b20gbGluZVxuICAgICAgICAgIC8vIEdldCBkaXN0YW5jZSBvZiBuZWFyZXN0IGludGVyY2VwdFxuICAgICAgICAgIGRpc3RhbmNlID0gX18uZGlzdGFuY2VUb0xpbmUodGhpc1hZLCBwMywgcDQsIHRlbXBJbnRlcnNlY3RQb2ludCk7XG4gICAgICAgICAgLy8gRmluZCB3aGljaCB3YXkgdGhpcyBpcyBwb2ludGluZyB0b1xuICAgICAgICAgIHByb3Bvc2VkRGlyZWN0aW9uID0gX18ucmV0dXJuRGlyZWN0aW9uVG9Qb2ludCh0aGlzWFksIHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZSwgcHJldmlvdXNBbmdsZSk7XG5cbiAgICAgICAgICBzd2l0Y2gocHJvcG9zZWREaXJlY3Rpb24udG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgY2FzZSAnZm9yd2FyZCc6XG4gICAgICAgICAgICAgIC8vIEZvcndhcmRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNGb3J3YXJkKSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRGb3J3YXJkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludEZvcndhcmRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludEZvcndhcmQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgIC8vIExlZnRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0KSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludExlZnRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludExlZnQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAvLyBSaWdodFxuICAgICAgICAgICAgICBpZigoZGlzdGFuY2UgPCBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0ID09IC0xKSkge1xuICAgICAgICAgICAgICAgIC8vIE9mIGN1cnJlbnQgNCwgd2hpY2ggb25lIGlzIHRoZSBjbG9zZXN0P1xuICAgICAgICAgICAgICAgIGlmKChjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc1JpZ2h0ID09IC0xKSB8fCAoZGlzdGFuY2UgPCBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc1JpZ2h0KSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIC8vIG5ld1JlY29yZFxuICAgICAgICAgICAgICAgICAgbmV3UmVjb3JkUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgLy8gdGVtcEludGVyc2VjdFBvaW50UmlnaHRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0ID0gdGVtcEludGVyc2VjdFBvaW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JhY2snOlxuICAgICAgICAgICAgICAvLyBCYWNrXG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0JhY2spIHx8IChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNCYWNrID09IC0xKSkge1xuICAgICAgICAgICAgICAgIC8vIE9mIGN1cnJlbnQgNCwgd2hpY2ggb25lIGlzIHRoZSBjbG9zZXN0P1xuICAgICAgICAgICAgICAgIGlmKChjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0JhY2sgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzQmFjaykpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNsb3Nlc3Qgb25lXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0JhY2sgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIC8vIG5ld1JlY29yZFxuICAgICAgICAgICAgICAgICAgbmV3UmVjb3JkQmFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrXG4gICAgICAgICAgICAgICAgICB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrID0gdGVtcEludGVyc2VjdFBvaW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NsaWdodCByaWdodCc6XG4gICAgICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0KSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRSaWdodFNsaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50UmlnaHRTbGlnaHQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2xpZ2h0IGxlZnQnOlxuICAgICAgICAgICAgICAvLyBMZWZ0IFNsaWdodFxuICAgICAgICAgICAgICBpZigoZGlzdGFuY2UgPCBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0KSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA9PSAtMSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPZiBjdXJyZW50IDQsIHdoaWNoIG9uZSBpcyB0aGUgY2xvc2VzdD9cbiAgICAgICAgICAgICAgICBpZigoY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID09IC0xKSB8fCAoZGlzdGFuY2UgPCBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0xlZnRTbGlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAvLyBuZXdSZWNvcmRcbiAgICAgICAgICAgICAgICAgIG5ld1JlY29yZExlZnRTbGlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgLy8gdGVtcEludGVyc2VjdFBvaW50TGVmdFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50TGVmdFNsaWdodCA9IHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgIC8vIExlZnQgbGluZVxuICAgICAgICAgIC8vIEdldCBkaXN0YW5jZSBvZiBuZWFyZXN0IGludGVyY2VwdFxuICAgICAgICAgIGRpc3RhbmNlID0gX18uZGlzdGFuY2VUb0xpbmUodGhpc1hZLCBwMSwgcDQsIHRlbXBJbnRlcnNlY3RQb2ludCk7XG4gICAgICAgICAgLy8gRmluZCB3aGljaCB3YXkgdGhpcyBpcyBwb2ludGluZyB0b1xuICAgICAgICAgIHByb3Bvc2VkRGlyZWN0aW9uID0gX18ucmV0dXJuRGlyZWN0aW9uVG9Qb2ludCh0aGlzWFksIHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZSwgcHJldmlvdXNBbmdsZSk7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBvbmUgbmVlZGVkXG4gICAgICAgICAgc3dpdGNoKHByb3Bvc2VkRGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZvcndhcmQnOlxuICAgICAgICAgICAgICAvLyBGb3J3YXJkXG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQpIHx8IChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID09IC0xKSkge1xuICAgICAgICAgICAgICAgIC8vIE9mIGN1cnJlbnQgNCwgd2hpY2ggb25lIGlzIHRoZSBjbG9zZXN0P1xuICAgICAgICAgICAgICAgIGlmKChjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCkpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNsb3Nlc3Qgb25lXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIC8vIG5ld1JlY29yZFxuICAgICAgICAgICAgICAgICAgbmV3UmVjb3JkRm9yd2FyZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRGb3J3YXJkXG4gICAgICAgICAgICAgICAgICB0ZW1wSW50ZXJzZWN0UG9pbnRGb3J3YXJkID0gdGVtcEludGVyc2VjdFBvaW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NsaWdodCBsZWZ0JzpcbiAgICAgICAgICAgICAgLy8gTGVmdCBTbGlnaHRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnRTbGlnaHQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0KSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRMZWZ0U2xpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludExlZnRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludExlZnRTbGlnaHQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgIC8vIExlZnRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdCkgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0KSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludExlZnRcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludExlZnQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2xpZ2h0IHJpZ2h0JzpcbiAgICAgICAgICAgICAgLy8gUmlnaHRcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQpIHx8IChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA9PSAtMSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPZiBjdXJyZW50IDQsIHdoaWNoIG9uZSBpcyB0aGUgY2xvc2VzdD9cbiAgICAgICAgICAgICAgICBpZigoY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCkpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNsb3Nlc3Qgb25lXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0ID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAvLyBuZXdSZWNvcmRcbiAgICAgICAgICAgICAgICAgIG5ld1JlY29yZFJpZ2h0U2xpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0XG4gICAgICAgICAgICAgICAgICB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFNsaWdodCA9IHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgICAgIGlmKChkaXN0YW5jZSA8IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0KSB8fCAoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPT0gLTEpIHx8IChkaXN0YW5jZSA8IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjbG9zZXN0IG9uZVxuICAgICAgICAgICAgICAgICAgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodCA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAvLyB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFxuICAgICAgICAgICAgICAgICAgdGVtcEludGVyc2VjdFBvaW50UmlnaHQgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmFjayc6XG4gICAgICAgICAgICAgIC8vIEJhY2tcbiAgICAgICAgICAgICAgaWYoKGRpc3RhbmNlIDwgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzQmFjaykgfHwgKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0JhY2sgPT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gT2YgY3VycmVudCA0LCB3aGljaCBvbmUgaXMgdGhlIGNsb3Nlc3Q/XG4gICAgICAgICAgICAgICAgaWYoKGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzQmFjayA9PSAtMSkgfHwgKGRpc3RhbmNlIDwgY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNCYWNrKSkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2xvc2VzdCBvbmVcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzQmFjayA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgLy8gbmV3UmVjb3JkXG4gICAgICAgICAgICAgICAgICBuZXdSZWNvcmRCYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIC8vIHRlbXBJbnRlcnNlY3RQb2ludEJhY2tcbiAgICAgICAgICAgICAgICAgIHRlbXBJbnRlcnNlY3RQb2ludEJhY2sgPSB0ZW1wSW50ZXJzZWN0UG9pbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE5ldyByZWNvcmQocyk/XG4gICAgICAgICAgdmFyIHdlSGF2ZUxpbmVPZlNpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgaWYobmV3UmVjb3JkRm9yd2FyZCB8fCBuZXdSZWNvcmRMZWZ0IHx8IG5ld1JlY29yZExlZnRTbGlnaHQgfHwgbmV3UmVjb3JkUmlnaHQgfHwgbmV3UmVjb3JkUmlnaHRTbGlnaHQgfHwgbmV3UmVjb3JkQmFjaykge1xuICAgICAgICAgICAgd2VIYXZlTGluZU9mU2lnaHQgPSB0aGlzLmxpbmVPZlNpZ2h0KHVuaXRJZCwgdGhpc1hZLCB1bml0SWQsIHRlbXBJbnRlcnNlY3RQb2ludC52YWx1ZSwgZm9yQ2FudmFzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYobmV3UmVjb3JkRm9yd2FyZCkge1xuICAgICAgICAgICAgLy8gTGluZSBvZiBzaWdodD9cbiAgICAgICAgICAgIGlmKHdlSGF2ZUxpbmVPZlNpZ2h0KSB7XG4gICAgICAgICAgICAgIC8vIFNldCBuZXcgcmVjb3JkXG4gICAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPSBjdXJyZW50UHJvcG9zZWREZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQ7XG4gICAgICAgICAgICAgIC8vIGNsb3Nlc3RVbml0SWRcbiAgICAgICAgICAgICAgY2xvc2VzdFVuaXRJZEZvcndhcmQgPSB1bml0SWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKG5ld1JlY29yZExlZnQpIHtcbiAgICAgICAgICAgIC8vIExpbmUgb2Ygc2lnaHQ/XG4gICAgICAgICAgICBpZih3ZUhhdmVMaW5lT2ZTaWdodCkge1xuICAgICAgICAgICAgICAvLyBTZXQgbmV3IHJlY29yZFxuICAgICAgICAgICAgICBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0ID0gY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNMZWZ0O1xuICAgICAgICAgICAgICAvLyBjbG9zZXN0VW5pdElkXG4gICAgICAgICAgICAgIGNsb3Nlc3RVbml0SWRMZWZ0ID0gdW5pdElkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZihuZXdSZWNvcmRMZWZ0U2xpZ2h0KSB7XG4gICAgICAgICAgICAvLyBMaW5lIG9mIHNpZ2h0P1xuICAgICAgICAgICAgaWYod2VIYXZlTGluZU9mU2lnaHQpIHtcbiAgICAgICAgICAgICAgLy8gU2V0IG5ldyByZWNvcmRcbiAgICAgICAgICAgICAgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA9IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodDtcbiAgICAgICAgICAgICAgLy8gY2xvc2VzdFVuaXRJZFxuICAgICAgICAgICAgICBjbG9zZXN0VW5pdElkTGVmdFNsaWdodCA9IHVuaXRJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYobmV3UmVjb3JkUmlnaHQpIHtcbiAgICAgICAgICAgIC8vIExpbmUgb2Ygc2lnaHQ/XG4gICAgICAgICAgICBpZih3ZUhhdmVMaW5lT2ZTaWdodCkge1xuICAgICAgICAgICAgICAvLyBTZXQgbmV3IHJlY29yZFxuICAgICAgICAgICAgICBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodCA9IGN1cnJlbnRQcm9wb3NlZERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQ7XG4gICAgICAgICAgICAgIC8vIGNsb3Nlc3RVbml0SWRcbiAgICAgICAgICAgICAgY2xvc2VzdFVuaXRJZFJpZ2h0ID0gdW5pdElkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZihuZXdSZWNvcmRSaWdodFNsaWdodCkge1xuICAgICAgICAgICAgLy8gTGluZSBvZiBzaWdodD9cbiAgICAgICAgICAgIGlmKHdlSGF2ZUxpbmVPZlNpZ2h0KSB7XG4gICAgICAgICAgICAgIC8vIFNldCBuZXcgcmVjb3JkXG4gICAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0ID0gY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodDtcbiAgICAgICAgICAgICAgLy8gY2xvc2VzdFVuaXRJZFxuICAgICAgICAgICAgICBjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQgPSB1bml0SWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKG5ld1JlY29yZEJhY2spIHtcbiAgICAgICAgICAgIC8vIExpbmUgb2Ygc2lnaHQ/XG4gICAgICAgICAgICBpZih3ZUhhdmVMaW5lT2ZTaWdodCkge1xuICAgICAgICAgICAgICAvLyBTZXQgbmV3IHJlY29yZFxuICAgICAgICAgICAgICBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNCYWNrID0gY3VycmVudFByb3Bvc2VkRGVzdGluYXRpb25QaXhlbHNCYWNrO1xuICAgICAgICAgICAgICAvLyBjbG9zZXN0VW5pdElkXG4gICAgICAgICAgICAgIGNsb3Nlc3RVbml0SWRCYWNrID0gdW5pdElkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSYW5raW5nIHN5c3RlbVxuICAgICAgc3dpdGNoKGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ2ZvcndhcmQnOlxuICAgICAgICAgIC8vIEZvcndhcmRcbiAgICAgICAgICBpZihjbG9zZXN0VW5pdElkRm9yd2FyZCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkRm9yd2FyZDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRGb3J3YXJkO1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkTGVmdFNsaWdodCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdFNsaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkTGVmdCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkUmlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkQmFjaykge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkQmFjaztcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2b2lkIDA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGZpbmQgdW5pdCBpZCBmb3IgRm9yd2FyZCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHJpZ2h0L3NsaWdodCBvciBsZWZ0L3NsaWdodCBjbG9zZXIgdGhhbiBmb3J3YXJkIG9yIGJhY2ssIHVzZSBpdFxuICAgICAgICAgIC8vIFNlZSBpZiBsZWZ0L3Mgb3IgcmlnaHQvcyBiZWF0IGl0XG4gICAgICAgICAgaWYoKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPiBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0KSAmJiAoY2xvc2VzdFVuaXRJZExlZnRTbGlnaHQpKSB7XG4gICAgICAgICAgICAvLyBMZWZ0IFNsaWdodFxuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdFNsaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0U2xpZ2h0O1xuICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBSaWdodCBmcm9tIG92ZXJ3cml0aW5nIGJ1dCBhbGxvd3MgaXQgdG8gY29tcGV0ZVxuICAgICAgICAgICAgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCA9IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnRTbGlnaHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFNlZSBpZiBsZWZ0L3Mgb3IgcmlnaHQvcyBiZWF0IGl0XG4gICAgICAgICAgaWYoKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPiBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCkgJiYgKGNsb3Nlc3RVbml0SWRSaWdodFNsaWdodCkpIHtcbiAgICAgICAgICAgIC8vIExlZnQgU2xpZ2h0XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRSaWdodFNsaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFNsaWdodDtcbiAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgUmlnaHQgZnJvbSBvdmVyd3JpdGluZyBidXQgYWxsb3dzIGl0IHRvIGNvbXBldGVcbiAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPSBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU2VlIGlmIGxlZnQgb3IgcmlnaHQgYmVhdCBpdFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdCkgJiYgKGNsb3Nlc3RVbml0SWRMZWZ0KSkge1xuICAgICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0O1xuICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBSaWdodCBmcm9tIG92ZXJ3cml0aW5nIGJ1dCBhbGxvd3MgaXQgdG8gY29tcGV0ZVxuICAgICAgICAgICAgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCA9IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgaWYoKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPiBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodCkgJiYgKGNsb3Nlc3RVbml0SWRSaWdodCkpIHtcbiAgICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRSaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgIC8vIExlZnRcbiAgICAgICAgICBpZihjbG9zZXN0VW5pdElkTGVmdCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkTGVmdFNsaWdodCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdFNsaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkRm9yd2FyZCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkRm9yd2FyZDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRGb3J3YXJkO1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkQmFjaykge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkQmFjaztcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrO1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkUmlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2b2lkIDA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGZpbmQgdW5pdCBpZCBmb3IgTGVmdCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExlZnQ6XG4gICAgICAgICAgLy8gRm9yd2FyZCwgU2xpZ2h0IExlZnQgY2FuIGJlYXQgaXRcbiAgICAgICAgICBpZigoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdCA+IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQpICYmIChjbG9zZXN0VW5pdElkRm9yd2FyZCkpIHtcbiAgICAgICAgICAgIC8vIExlZnQgU2xpZ2h0XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRGb3J3YXJkO1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludEZvcndhcmQ7XG4gICAgICAgICAgICBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0ID0gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU2VlIGlmIGxlZnQgb3IgcmlnaHQgYmVhdCBpdFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0ID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCkgJiYgKGNsb3Nlc3RVbml0SWRMZWZ0U2xpZ2h0KSkge1xuICAgICAgICAgICAgLy8gTGVmdCBTbGlnaHRcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZExlZnRTbGlnaHQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50TGVmdFNsaWdodDtcbiAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQgPSBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgIC8vIFJpZ2h0XG4gICAgICAgICAgaWYoY2xvc2VzdFVuaXRJZFJpZ2h0KSB7XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRSaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodDtcbiAgICAgICAgICB9IGVsc2UgaWYoY2xvc2VzdFVuaXRJZFJpZ2h0U2xpZ2h0KSB7XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRSaWdodFNsaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRSaWdodFNsaWdodDtcbiAgICAgICAgICB9IGVsc2UgaWYoY2xvc2VzdFVuaXRJZEZvcndhcmQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZEZvcndhcmQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50Rm9yd2FyZDtcbiAgICAgICAgICB9IGVsc2UgaWYoY2xvc2VzdFVuaXRJZEJhY2spIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZEJhY2s7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50QmFjaztcbiAgICAgICAgICB9IGVsc2UgaWYoY2xvc2VzdFVuaXRJZExlZnQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZExlZnQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50TGVmdDtcbiAgICAgICAgICB9IGVsc2UgaWYoY2xvc2VzdFVuaXRJZExlZnRTbGlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZExlZnRTbGlnaHQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50TGVmdFNsaWdodDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdm9pZCAwO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZhaWxlZCB0byBmaW5kIHVuaXQgaWQgZm9yIFJpZ2h0Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmlnaHQ6XG4gICAgICAgICAgLy8gRm9yd2FyZCwgU2xpZ2h0IFJpZ2h0IGNhbiBiZWF0IGl0XG4gICAgICAgICAgaWYoKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0ID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCkgJiYgKGNsb3Nlc3RVbml0SWRGb3J3YXJkKSkge1xuICAgICAgICAgICAgLy8gTGVmdCBTbGlnaHRcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZEZvcndhcmQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50Rm9yd2FyZDtcbiAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0ID0gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU2VlIGlmIGxlZnQgb3IgcmlnaHQgYmVhdCBpdFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodCA+IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0KSAmJiAoY2xvc2VzdFVuaXRJZFJpZ2h0U2xpZ2h0KSkge1xuICAgICAgICAgICAgLy8gUmlnaHRcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgICAgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQgPSBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2JhY2snOlxuXG4gICAgICAgICAgLy8gSWYgcmlnaHQgb3IgbGVmdCBjbG9zZXIgdGhhbiBmb3J3YXJkIG9yIGJhY2ssIHVzZSBpdFxuICAgICAgICAgIC8vIEJhY2tcbiAgICAgICAgICBpZihjbG9zZXN0VW5pdElkQmFjaykge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkQmFjaztcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihjbG9zZXN0VW5pdElkUmlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkTGVmdCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkTGVmdFNsaWdodCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdFNsaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkRm9yd2FyZCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkRm9yd2FyZDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRGb3J3YXJkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2b2lkIDA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGZpbmQgdW5pdCBpZCBmb3IgQmFjaycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEJhY2tcbiAgICAgICAgICAvLyBJZiByaWdodC9zbGlnaHQgb3IgbGVmdC9zbGlnaHQgY2xvc2VyIHRoYW4gZm9yd2FyZCBvciBiYWNrLCB1c2UgaXRcbiAgICAgICAgICAvLyBTZWUgaWYgbGVmdC9zIG9yIHJpZ2h0L3MgYmVhdCBpdFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCkgJiYgKGNsb3Nlc3RVbml0SWRMZWZ0U2xpZ2h0KSkge1xuICAgICAgICAgICAgLy8gTGVmdCBTbGlnaHRcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZExlZnRTbGlnaHQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50TGVmdFNsaWdodDtcbiAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgUmlnaHQgZnJvbSBvdmVyd3JpdGluZyBidXQgYWxsb3dzIGl0IHRvIGNvbXBldGVcbiAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPSBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0O1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBTZWUgaWYgbGVmdC9zIG9yIHJpZ2h0L3MgYmVhdCBpdFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQpICYmIChjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQpKSB7XG4gICAgICAgICAgICAvLyBMZWZ0IFNsaWdodFxuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50UmlnaHRTbGlnaHQ7XG4gICAgICAgICAgICAvLyBUaGlzIHByZXZlbnRzIFJpZ2h0IGZyb20gb3ZlcndyaXRpbmcgYnV0IGFsbG93cyBpdCB0byBjb21wZXRlXG4gICAgICAgICAgICBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNGb3J3YXJkID0gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFNlZSBpZiBsZWZ0IG9yIHJpZ2h0IGJlYXQgaXRcbiAgICAgICAgICBpZigoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzQmFjayA+IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQpICYmIChjbG9zZXN0VW5pdElkTGVmdCkpIHtcbiAgICAgICAgICAgIC8vIExlZnRcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZExlZnQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50TGVmdDtcbiAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgUmlnaHQgZnJvbSBvdmVyd3JpdGluZyBidXQgYWxsb3dzIGl0IHRvIGNvbXBldGVcbiAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQgPSBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0O1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSaWdodFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNCYWNrID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHQpICYmIChjbG9zZXN0VW5pdElkUmlnaHQpKSB7XG4gICAgICAgICAgICAvLyBSaWdodFxuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkUmlnaHQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50UmlnaHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc2xpZ2h0IHJpZ2h0JzpcbiAgICAgICAgICAvLyBTbGlnaHQgUmlnaHRcbiAgICAgICAgICBpZihjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkUmlnaHQpIHtcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkRm9yd2FyZCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkRm9yd2FyZDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRGb3J3YXJkO1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkQmFjaykge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkQmFjaztcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRCYWNrO1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkTGVmdCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0O1xuICAgICAgICAgIH0gZWxzZSBpZihjbG9zZXN0VW5pdElkTGVmdFNsaWdodCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdFNsaWdodDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0U2xpZ2h0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2b2lkIDA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGZpbmQgdW5pdCBpZCBmb3IgU2xpZ2h0IFJpZ2h0Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU2xpZ2h0IFJpZ2h0OlxuICAgICAgICAgIC8vIEZvcndhcmQsIFJpZ2h0IGNhbiBiZWF0IGl0XG4gICAgICAgICAgaWYoKGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0ID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZCkgJiYgKGNsb3Nlc3RVbml0SWRGb3J3YXJkKSkge1xuICAgICAgICAgICAgLy8gTGVmdCBTbGlnaHRcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZEZvcndhcmQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50Rm9yd2FyZDtcbiAgICAgICAgICAgIGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0U2xpZ2h0ID0gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU2VlIGlmIGxlZnQgb3IgcmlnaHQgYmVhdCBpdFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodFNsaWdodCA+IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc1JpZ2h0KSAmJiAoY2xvc2VzdFVuaXRJZFJpZ2h0KSkge1xuICAgICAgICAgICAgLy8gUmlnaHRcbiAgICAgICAgICAgIGZpbmFsVW5pdElkID0gY2xvc2VzdFVuaXRJZFJpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludFJpZ2h0O1xuICAgICAgICAgICAgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzUmlnaHRTbGlnaHQgPSBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNSaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NsaWdodCBsZWZ0JzpcbiAgICAgICAgICAvLyBTbGlnaHQgTGVmdFxuICAgICAgICAgIGlmKGNsb3Nlc3RVbml0SWRMZWZ0U2xpZ2h0KSB7XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRMZWZ0U2xpZ2h0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludExlZnRTbGlnaHQ7XG4gICAgICAgICAgfSBlbHNlIGlmKGNsb3Nlc3RVbml0SWRMZWZ0KSB7XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRMZWZ0O1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludExlZnQ7XG4gICAgICAgICAgfSBlbHNlIGlmKGNsb3Nlc3RVbml0SWRGb3J3YXJkKSB7XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRGb3J3YXJkO1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludEZvcndhcmQ7XG4gICAgICAgICAgfSBlbHNlIGlmKGNsb3Nlc3RVbml0SWRCYWNrKSB7XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRCYWNrO1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludEJhY2s7XG4gICAgICAgICAgfSBlbHNlIGlmKGNsb3Nlc3RVbml0SWRSaWdodCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkUmlnaHQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50UmlnaHQ7XG4gICAgICAgICAgfSBlbHNlIGlmKGNsb3Nlc3RVbml0SWRSaWdodFNsaWdodCkge1xuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkUmlnaHRTbGlnaHQ7XG4gICAgICAgICAgICBwb2ludE9mSW50ZXJjZXB0LnZhbHVlID0gdGVtcEludGVyc2VjdFBvaW50UmlnaHRTbGlnaHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZvaWQgMDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGYWlsZWQgdG8gZmluZCB1bml0IGlkIGZvciBTbGlnaHQgTGVmdCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNsaWdodCBMZWZ0OlxuICAgICAgICAgIC8vIEZvcndhcmQsIExlZnQgY2FuIGJlYXQgaXRcbiAgICAgICAgICBpZigoY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA+IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0ZvcndhcmQpICYmIChjbG9zZXN0VW5pdElkRm9yd2FyZCkpIHtcbiAgICAgICAgICAgIC8vIExlZnQgU2xpZ2h0XG4gICAgICAgICAgICBmaW5hbFVuaXRJZCA9IGNsb3Nlc3RVbml0SWRGb3J3YXJkO1xuICAgICAgICAgICAgcG9pbnRPZkludGVyY2VwdC52YWx1ZSA9IHRlbXBJbnRlcnNlY3RQb2ludEZvcndhcmQ7XG4gICAgICAgICAgICBjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID0gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzRm9yd2FyZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU2VlIGlmIGxlZnQgb3IgcmlnaHQgYmVhdCBpdFxuICAgICAgICAgIGlmKChjbG9zZXN0RGVzdGluYXRpb25QaXhlbHNMZWZ0U2xpZ2h0ID4gY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdCkgJiYgKGNsb3Nlc3RVbml0SWRMZWZ0KSkge1xuICAgICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgICAgZmluYWxVbml0SWQgPSBjbG9zZXN0VW5pdElkTGVmdDtcbiAgICAgICAgICAgIHBvaW50T2ZJbnRlcmNlcHQudmFsdWUgPSB0ZW1wSW50ZXJzZWN0UG9pbnRMZWZ0O1xuICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBSaWdodCBmcm9tIG92ZXJ3cml0aW5nIGJ1dCBhbGxvd3MgaXQgdG8gY29tcGV0ZVxuICAgICAgICAgICAgY2xvc2VzdERlc3RpbmF0aW9uUGl4ZWxzTGVmdFNsaWdodCA9IGNsb3Nlc3REZXN0aW5hdGlvblBpeGVsc0xlZnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBGb3VuZCBzb2x1dGlvbj9cbiAgICAgIGlmKGZpbmFsVW5pdElkKSB7XG4gICAgICAgIC8vIEdldCB0aGUgdW5pdFxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5tb2RlbC5kZXN0aW5hdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZih0aGlzLm1vZGVsLmRlc3RpbmF0aW9uc1tqXS5pZCA9PSBmaW5hbFVuaXRJZCkge1xuICAgICAgICAgICAgcmV0dXJuRGVzdCA9IHRoaXMubW9kZWwuZGVzdGluYXRpb25zW2pdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnTm8gZmluYWwgVW5pdCBJZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldHVybkRlc3Q7XG4gICAgfTtcblxuICAgIC8vIExpbmUgb2YgU2lnaHQgd29ya2VyIG1ldGhvZFxuICAgIHByb2Nlc3Nvci5saW5lT2ZTaWdodCA9IGZ1bmN0aW9uKHVuaXRJZCwgZnJvbVhZLCB0b1VuaXRJZCwgdG9YWSwgZm9yQ2FudmFzKSB7XG4gICAgICAvLyBXZSBoYXZlIHRoZSBuZXcgY2xvc2VzdCBkaXN0YW5jZSwgYnV0IGRvIHdlIGhhdmUgbGluZSBvZiBzaWdodD9cbiAgICAgIC8vIE5PVEU6IGFsZ29yaXRobSBhc3N1bWVzIGZyb20gcG9pbnQgaXMgbm90IG9ic3RydWN0ZWQgYnkgQmxvY2tlcnNcbiAgICAgIC8vIEZsYWcgdGhhdCBmYWlscyBpZiBVbml0J3Mgc2hhcGUgZ2V0cyBpbiB0aGUgbGluZSBvZiBzaWdodFxuXG4gICAgICB2YXIgd2VIYXZlTGluZU9mU2lnaHQgPSB0cnVlO1xuICAgICAgLy8gR2V0IGFjY2VzcyB0byBzaGFwZXNcbiAgICAgIHZhciBjYW52YXNTaGFwZXMgPSBmb3JDYW52YXM7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2FudmFzU2hhcGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBuZXh0SW5XYXlFbGVtZW50ID0gY2FudmFzU2hhcGVzW2ldO1xuXG4gICAgICAgIC8vIExCb3hcbiAgICAgICAgaWYobmV4dEluV2F5RWxlbWVudCkge1xuICAgICAgICAgIHZhciBsYm94ID0gbmV4dEluV2F5RWxlbWVudDtcbiAgICAgICAgICAvLyBVc2UgZXZlcnkgTEJveFxuICAgICAgICAgIHZhciBsQm94RnJhbWUsIHJvdGF0ZWRQb2ludHMsIGRhdGFMYm94LCBsQm94VW5pdDtcbiAgICAgICAgICAvLyBBcmUgYWxsIDQgcG9pbnRzIG9mIHRoaXMgTEJveCBpbnNpZGUgYmxvY2tlcnM/XG4gICAgICAgICAgLy8gVGhlIENHUGF0aCBmcmFtZSBpcyBib3VuZGluZyBmcmFtZSAocm90YXRlZCkgb2YgTEJveFxuICAgICAgICAgIGlmKGxib3gucGFyc2VkKSB7XG4gICAgICAgICAgICBsQm94RnJhbWUgPSBsYm94LnBhcnNlZC5sQm94RnJhbWU7XG4gICAgICAgICAgICByb3RhdGVkUG9pbnRzID0gbGJveC5wYXJzZWQucm90YXRlZFBvaW50cztcbiAgICAgICAgICAgIGRhdGFMYm94ID0gbGJveC5wYXJzZWQuZGF0YUxib3g7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxCb3hGcmFtZSA9IHtcbiAgICAgICAgICAgICAgeDogcGFyc2VGbG9hdChsYm94LmdldEF0dHJpYnV0ZSgneCcpKSxcbiAgICAgICAgICAgICAgeTogcGFyc2VGbG9hdChsYm94LmdldEF0dHJpYnV0ZSgneScpKSxcbiAgICAgICAgICAgICAgd2lkdGg6IHBhcnNlRmxvYXQobGJveC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpLFxuICAgICAgICAgICAgICBoZWlnaHQ6IHBhcnNlRmxvYXQobGJveC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKSxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiBsYm94LmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBHZXQgcm90YXRlZCBwb2ludHNcbiAgICAgICAgICAgIHJvdGF0ZWRQb2ludHMgPSBfXy5hcnJheU9mUm90YXRlZFBvaW50cyhsQm94RnJhbWUpO1xuICAgICAgICAgICAgbEJveFVuaXQgPSBsYm94LmdldEF0dHJpYnV0ZSgnZGF0YS1sYm94Jyk7XG4gICAgICAgICAgICBkYXRhTGJveCA9IGxCb3hVbml0ID8gbEJveFVuaXQuc3BsaXQoJywnKSA6IFtdO1xuICAgICAgICAgICAgbGJveC5wYXJzZWQgPSB7XG4gICAgICAgICAgICAgIHVuaXRJZDogbEJveFVuaXQgPyBwYXJzZUludChsQm94VW5pdCkgOiBudWxsLFxuICAgICAgICAgICAgICBsQm94RnJhbWU6IGxCb3hGcmFtZSxcbiAgICAgICAgICAgICAgcm90YXRlZFBvaW50czogcm90YXRlZFBvaW50cyxcbiAgICAgICAgICAgICAgZGF0YUxib3g6IGRhdGFMYm94XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZpbmQgTEJveGVzIG9ubHlcbiAgICAgICAgICBpZihsYm94KSB7XG4gICAgICAgICAgICAvLyBVc2UgZXZlcnkgTEJveFxuICAgICAgICAgICAgLy8gQXJlIGFsbCA0IHBvaW50cyBvZiB0aGlzIExCb3ggaW5zaWRlIGJsb2NrZXJzP1xuICAgICAgICAgICAgLy8gVGhlIENHUGF0aCBmcmFtZSBpcyBib3VuZGluZyBmcmFtZSAocm90YXRlZCkgb2YgTEJveFxuICAgICAgICAgICAgLy8gR2V0IHJvdGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBpZihyb3RhdGVkUG9pbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByb3RhdGVkUG9pbnRzID0gX18uYXJyYXlPZlJvdGF0ZWRQb2ludHMobEJveEZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBvaW50c1xuICAgICAgICAgICAgdmFyIHAxID0gcm90YXRlZFBvaW50c1swXTtcbiAgICAgICAgICAgIHZhciBwMiA9IHJvdGF0ZWRQb2ludHNbMV07XG4gICAgICAgICAgICB2YXIgcDMgPSByb3RhdGVkUG9pbnRzWzJdO1xuICAgICAgICAgICAgdmFyIHA0ID0gcm90YXRlZFBvaW50c1szXTtcblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBTaGFwZSBkb2Vzbid0IGJlbG9uZyB0byBjdXJyZW50bHkgdGVzdGVkIExCb3hcbiAgICAgICAgICAgIHZhciBkaWZmZXJlbnRVbml0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGF0YUxib3guZm9yRWFjaChmdW5jdGlvbihuZXh0VW5pdElkKSB7XG4gICAgICAgICAgICAgIGlmKG5leHRVbml0SWQgPT0gdW5pdElkKSBkaWZmZXJlbnRVbml0ID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYoZGlmZmVyZW50VW5pdCkge1xuICAgICAgICAgICAgICAvLyBJZGVudGlmeSBpZiBmcm9tWFkgaXMgaW5zaWRlIGVtcHR5IExCb3ggYW5kIGF2b2lkIHVzaW5nIGl0IGZvciBsaW5lT2ZTaWdodFxuICAgICAgICAgICAgICBpZihkYXRhTGJveC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBmcm9tWFkgaXMgaW5zaWRlP1xuICAgICAgICAgICAgICAgIC8vIElmIGluc2lkZSwgZG9uJ3QgdXNlIHRoZSByZWN0LCBjb250aW51ZVxuICAgICAgICAgICAgICAgIC8vIElmIG5vdCBpbnNpZGUsIHVzZSB0aGUgcmVjdFxuICAgICAgICAgICAgICAgIGlmKF9fLmlzUG9pbnRJbnNpZGVSb3RhdGVkUmVjdChmcm9tWFksIHAxLCBwMiwgcDMsIHA0KSkge1xuICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gaW50ZXJzZWN0P1xuICAgICAgICAgICAgICAvLyBEb250IGRvIGFsbCBpZiB5b3UgZG9uJ3QgaGF2ZSB0b1xuICAgICAgICAgICAgICB2YXIgYjEgPSBfXy5kb0xpbmVTZWdtZW50c0ludGVyc2VjdChmcm9tWFksIHRvWFksIHAxLCBwMik7XG4gICAgICAgICAgICAgIGlmKGIxID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHZhciBiMiA9IF9fLmRvTGluZVNlZ21lbnRzSW50ZXJzZWN0KGZyb21YWSwgdG9YWSwgcDIsIHAzKTtcbiAgICAgICAgICAgICAgICBpZihiMiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBiMyA9IF9fLmRvTGluZVNlZ21lbnRzSW50ZXJzZWN0KGZyb21YWSwgdG9YWSwgcDMsIHA0KTtcbiAgICAgICAgICAgICAgICAgIGlmKGIzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYjQgPSBfXy5kb0xpbmVTZWdtZW50c0ludGVyc2VjdChmcm9tWFksIHRvWFksIHA0LCBwMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmKGI0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2RcbiAgICAgICAgICAgICAgICAgICAgICB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyByZWN0IGlzIGluIHRoZSB3YXlcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcmVjdCBpcyBpbiB0aGUgd2F5XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyByZWN0IGlzIGluIHRoZSB3YXlcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyByZWN0IGlzIGluIHRoZSB3YXlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHdlSGF2ZUxpbmVPZlNpZ2h0O1xuICAgIH07XG5cbiAgfTtcblxuICAvKlxuICBcblxuXG4qL1xuIiwidmFyIF9fID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgZmlsdGVyTm8xVGFrZU91dERpcmVjdGlvbnNCZXR3ZWVuTGFzdEFuZEZpcnN0ID0gcmVxdWlyZSgnLi9maWx0ZXIvZW5kLWFzLWxhbmRtYXJrJyk7XG52YXIgZmlsdGVyTm8yU3RhcnREaXJlY3Rpb25DbGVhblVwQWxsV2hpY2hVc2VEZXN0aW5hdGlvbkFzTGFuZG1hcmtzID0gcmVxdWlyZSgnLi9maWx0ZXIvc3RhcnQtYXMtbGFuZG1hcmsnKTtcbnZhciBmaWx0ZXJObzNVVHVybkRldGVjdGlvbiA9IHJlcXVpcmUoJy4vZmlsdGVyL3V0dXJuJyk7XG52YXIgZmlsdGVyTm80UmVtb3ZlQ29uc2VjdXRpdmVGb3J3YXJkcyA9IHJlcXVpcmUoJy4vZmlsdGVyL2NvbnNlY3V0aXZlLWZvcndhcmRzJyk7XG52YXIgZmlsdGVyTm81UmVkdW5kYW50SW5zdHJ1Y3Rpb25zSW5NaWRkbGVJbnN0cnVjdGlvbnNDb21ib0RpcmVjdGlvbnMgPSByZXF1aXJlKCcuL2ZpbHRlci9jb21iby1kaXJlY3Rpb25zJyk7XG52YXIgZmlsdGVyTm82Q29udGludWVQYXN0RmlsbGVyID0gcmVxdWlyZSgnLi9maWx0ZXIvY29udGludWUtcGFzdCcpO1xuXG5jb25zdCBJbnN0cnVjdGlvbiA9IHJlcXVpcmUoJy4vSW5zdHJ1Y3Rpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb2Nlc3Nvcikge1xuXG4gIHByb2Nlc3Nvci5tYWtlVGV4dERpcmVjdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgY29uc29sZS50aW1lKCdtYWtlVGV4dERpcmVjdGlvbnMnKTtcbiAgICB2YXIgd2F5ZmluZEFycmF5ID0gb3B0aW9ucy5wb2ludEFycmF5O1xuICAgIHZhciBmaWx0ZXJPbiA9IG9wdGlvbnMuZmlsdGVyO1xuICAgIHZhciBVVHVybkluTWV0ZXJzID0gb3B0aW9ucy5VVHVybkluTWV0ZXJzO1xuICAgIHZhciBhZGRURGlmRW1wdHlNZXRlcnMgPSBvcHRpb25zLmFkZFREaWZFbXB0eU1ldGVycztcblxuICAgIC8vIFByb3RlY3QgY29kZVxuICAgIGlmKHdheWZpbmRBcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIERvIG5vdCBwcm9jZWVkXG4gICAgICB0aHJvdyAnISdcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEFycmF5IG9mIHRleHQgZGlyZWN0aW9uc1xuICAgIHZhciB0ZXh0RGlyZWN0aW9uc0ZvckFsbEZsb29yc0FycmF5ID0gW107XG4gICAgLy8gVGV4dCBkaXJlY3Rpb25zIG9mIE9uZSBmbG9vclxuICAgIC8vIEZpcnN0IG5vZGVcbiAgICB2YXIgZmlyc3ROb2RlID0gbnVsbDtcbiAgICAvLyBEaXJlY3Rpb24gdG8gbmV4dCBwb2ludCB3aWxsIGFsd2F5cyBiZSBmcm9tIDAgdG8gMzYwXG4gICAgLy8gTmVnYXRpdmUgbWVhbnMgc3RhcnRcbiAgICAvLyBUaGlzIGFuZ2xlIHdpbGwgYmUgY2FycmllZCB0byBuZXh0IGRpcmVjdGlvbiB0byBmaWd1cmUgb3V0IHR1cm5pbmcgZGlyZWN0aW9uXG4gICAgdmFyIHByZXZpb3VzQW5nbGUgPSAtMTtcblxuICAgIC8vIE5PVEU6IE9uY2Ugd2UgZmlndXJlIG91dCB3aGljaCBmbG9vciBtb3ZlciB3aWxsIHRha2UgdXMgdG8sIHNraXAgYWxsIG90aGVyIGZsb29ycyBpbiBzZXF1ZW5jZVxuICAgIHZhciBtb3ZlclRha2VzVXNUb0Zsb29yID0gbnVsbDtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB3YXlmaW5kQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMgPSB3YXlmaW5kQXJyYXlbaV07XG4gICAgICB2YXIgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5ID0gW107XG5cbiAgICAgIC8vIExvb3AgdGhyb3VnaHQgYWxsXG4gICAgICAvLyBDb250aW51ZSBpZiB0aGlzIGlzIG5vdCB0aGUgbmV4dCBmbG9vclxuICAgICAgaWYobW92ZXJUYWtlc1VzVG9GbG9vcikge1xuICAgICAgICAvLyBTa2lwIGlmIG5vdCBleHBlY3RlZCBmbG9vclxuICAgICAgICBpZihtb3ZlclRha2VzVXNUb0Zsb29yICE9IHVzZUFycmF5T2ZGbG9vcldheXBvaW50cykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBSZXNldCBtb3ZlclRha2VzVXNUb0Zsb29yXG4gICAgICBtb3ZlclRha2VzVXNUb0Zsb29yID0gbnVsbDtcblxuICAgICAgZmlyc3ROb2RlID0gdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLnBvaW50c1swXTtcblxuICAgICAgaWYoZmlyc3ROb2RlKSB7XG4gICAgICAgIC8vIE1ha2UgbmV4dCB0ZXh0IGluc3RydWN0aW9uXG4gICAgICAgIC8vIEdldCBhcnJheU9mRmxvb3JXYXlwb2ludHMgZm9yIGlucHV0IGZsb29yXG4gICAgICAgIHZhciBjdXJyZW50Rmxvb3JUZXh0RGlyZWN0aW9uID0gdGhpcy5tb2RlbC5nZXRGbG9vckJ5SWQoZmlyc3ROb2RlLm1hcElkKTtcbiAgICAgICAgdmFyIGN1ckNhbnZhcyA9IHRoaXMuc2hhcGVzW2ZpcnN0Tm9kZS5tYXBJZF0ubGJveGVzO1xuXG4gICAgICAgIGlmKGN1cnJlbnRGbG9vclRleHREaXJlY3Rpb24ubWFwSWQgPT0gZmlyc3ROb2RlLm1hcElkKSB7XG4gICAgICAgICAgLy8gR290IGl0XG5cbiAgICAgICAgICAvLyBNYWtlIG5ldyBzZXQgb2YgdGV4dCBkaXJlY3Rpb25zIGZvciB0aGlzIGZsb29yXG4gICAgICAgICAgdmFyIG5leHROb2RlID0gbnVsbDtcbiAgICAgICAgICBpZih1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMucG9pbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIG5leHROb2RlID0gdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLnBvaW50c1sxXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQb3B1bGF0ZSBiYXNpYyBpbmZvXG4gICAgICAgICAgdmFyIG5leHREaXIgPSB0aGlzLm1ha2VUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICB3YXlmaW5kQXJyYXksXG4gICAgICAgICAgICB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMsXG4gICAgICAgICAgICBjdXJyZW50Rmxvb3JUZXh0RGlyZWN0aW9uLFxuICAgICAgICAgICAgZmlyc3ROb2RlLFxuICAgICAgICAgICAgbmV4dE5vZGUsIC0xKTtcblxuICAgICAgICAgIC8vIENhcnJ5IGFuZ2xlIHRvIG5leHQgZm9yIG5leHQgc3RlcCBhbmQgY2FsbCBpdCBwcmV2aW91c0FuZ2xlXG4gICAgICAgICAgcHJldmlvdXNBbmdsZSA9IG5leHREaXIuYW5nbGVUb05leHQ7XG5cbiAgICAgICAgICAvLyBDb21pbmcgZnJvbSAuLi4/XG4gICAgICAgICAgLy8gJ0Fycml2ZSBhdCAqJ1xuICAgICAgICAgIHZhciBzdGFydGluZ0Zyb20gPSAnJztcbiAgICAgICAgICB2YXIgdXNpbmdMYW5kbWFyayA9IGZhbHNlO1xuXG4gICAgICAgICAgLy8gQWJzb2x1dGUgc3RhcnQ/XG4gICAgICAgICAgLy9HZXQgRWRnZSB0eXBlIElEXG4gICAgICAgICAgLy8gaWYgKGZpcnN0Tm9kZS51c2VkRWRnZVR5cGVJZCA9PSAtMSkge1xuICAgICAgICAgIGlmKGkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdBYnNvbHV0ZSBzdGFydCcpO1xuXG4gICAgICAgICAgICAvLyBUaGlzIHdpbGwgYWx3YXlzIGJlIHRoZSBjYXNlIGlmIHRoaXMgaXMgdGhlIGFic29sdXRlIHN0YXJ0XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBuZWFyZXN0IGRlc3RpbmF0aW9uXG4gICAgICAgICAgICBpZihuZXh0RGlyLmRlc3RpbmF0aW9uKSB7XG4gICAgICAgICAgICAgIHN0YXJ0aW5nRnJvbSA9IG5leHREaXIuZGVzdGluYXRpb24ubmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEZpbmQgbmVhcmVzdCBEZXN0aW5hdGlvblxuICAgICAgICAgICAgICAvLy4uLlxuICAgICAgICAgICAgICBpZihuZXh0RGlyLmxhbmRtYXJrRGVzdGluYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzdGFydGluZ0Zyb20gPSBuZXh0RGlyLmxhbmRtYXJrRGVzdGluYXRpb24ubmFtZTtcbiAgICAgICAgICAgICAgICB1c2luZ0xhbmRtYXJrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGFydGluZ0Zyb20gPSAnTmVhcmVzdCBEZXN0aW5hdGlvbic7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYoZmlyc3ROb2RlLnVzZWRFZGdlVHlwZUlkID09IDEpIHtcbiAgICAgICAgICAgIC8vIE5vdCBzdXJlIHRoaXMgd2lsbCBldmVyIGJlIHRoZSBjYXNlXG4gICAgICAgICAgICBzdGFydGluZ0Zyb20gPSBuZXh0RGlyLmRlc3RpbmF0aW9uLm5hbWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE1vdmVyP1xuICAgICAgICAgIC8vIC8vaWYoZmlyc3ROb2RlLnVzZWRFZGdlVHlwZUlkID09IDMpXG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnTW92ZXInKTtcblxuICAgICAgICAgICAgc3RhcnRpbmdGcm9tID0gJ01vdmVyJztcbiAgICAgICAgICAgIC8vIEdvIHRvIHBhcmVudCBub2RlIGZsb29yIGFuZCBwaWNrIHVwIG1vdmVyIGluZm9cbiAgICAgICAgICAgIC8vIHZhciBwYXJlbnRXYXlwb2ludCA9IHRoaXMubW9kZWwuZ2V0V2F5cG9pbnRJbmZvcm1hdGlvbihmaXJzdE5vZGUuaWQpOyAvL2ZpcnN0Tm9kZS5wYXJlbnQubm9kZUlkXG4gICAgICAgICAgICB2YXIgcGFyZW50V2F5cG9pbnQgPSB0aGlzLm1vZGVsLmdldFdheXBvaW50SW5mb3JtYXRpb24oZmlyc3ROb2RlLnBhcmVudC5pZCk7IC8vZmlyc3ROb2RlLnBhcmVudC5ub2RlSWRcbiAgICAgICAgICAgIC8vIEZpbmQgZmxvb3IgaW5mb1xuICAgICAgICAgICAgLy8gR2V0IGFycmF5T2ZGbG9vcldheXBvaW50cyBmb3IgaW5wdXQgZmxvb3JcbiAgICAgICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCB3YXlmaW5kQXJyYXkubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgdmFyIGFycmF5T2ZGbG9vcldheXBvaW50cyA9IHdheWZpbmRBcnJheVtrXTtcbiAgICAgICAgICAgICAgLy8gRnJvbSBEaXJlY3Rpb25cbiAgICAgICAgICAgICAgLy8gR2V0IGN1cnJlbnRcbiAgICAgICAgICAgICAgdmFyIHRlbXBOb2RlID0gYXJyYXlPZkZsb29yV2F5cG9pbnRzLnBvaW50c1swXTtcbiAgICAgICAgICAgICAgaWYodGVtcE5vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBTYW1lIGZsb29yIGFzIHBhcmVudD9cbiAgICAgICAgICAgICAgICBpZihwYXJlbnRXYXlwb2ludC5tYXBJZCA9PSB0ZW1wTm9kZS5tYXBJZCkge1xuICAgICAgICAgICAgICAgICAgLy8gR290IGl0XG4gICAgICAgICAgICAgICAgICBzdGFydGluZ0Zyb20gPSBhcnJheU9mRmxvb3JXYXlwb2ludHMubW92ZXIgPyBhcnJheU9mRmxvb3JXYXlwb2ludHMubW92ZXIudHlwZU5hbWUgOiAnTW92ZXInO1xuXG4gICAgICAgICAgICAgICAgICAvLyBCcmVha1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gT3V0cHV0XG4gICAgICAgICAgaWYodXNpbmdMYW5kbWFyaykge1xuICAgICAgICAgICAgbmV4dERpci5vdXRwdXQgPSBfXy5zdHJpbmdXaXRoRm9ybWF0KCdXaXRoICUgb24geW91ciAlLCBnbyAlLicsIHN0YXJ0aW5nRnJvbSwgbmV4dERpci5kaXJlY3Rpb25Ub0xhbmRtYXJrLCBuZXh0RGlyLmRpcmVjdGlvbik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHREaXIub3V0cHV0ID0gX18uc3RyaW5nV2l0aEZvcm1hdCgnV2l0aCAlIGJlaGluZCB5b3UsIGdvICUuJywgc3RhcnRpbmdGcm9tLCBuZXh0RGlyLmRpcmVjdGlvbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9TZXQgdHlwZVxuICAgICAgICAgIG5leHREaXIudHlwZSA9ICdvcmllbnRhdGlvbic7XG5cbiAgICAgICAgICAvLyBBZGQgdG8gYXJyYXlcbiAgICAgICAgICB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkucHVzaChuZXh0RGlyKTtcblxuICAgICAgICAgIC8vIERlY2lzaW9uIHBvaW50c1xuICAgICAgICAgIC8vIEdldCBwcmV2aW91cywgY3VycmVudCBhbmQgbmV4dFxuICAgICAgICAgIGZvcih2YXIgbCA9IDE7IGwgPCAodXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLnBvaW50cy5sZW5ndGggLSAxKTsgbCsrKSB7XG4gICAgICAgICAgICAvLyBHZXQgY3VycmVudFxuICAgICAgICAgICAgdmFyIGN1cmVudE5vZGUgPSB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMucG9pbnRzW2xdO1xuICAgICAgICAgICAgLy8gR2V0IG5leHRcbiAgICAgICAgICAgIG5leHROb2RlID0gdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLnBvaW50c1tsICsgMV07XG4gICAgICAgICAgICAvLyBNYWtlIG5leHQgdGV4dCBpbnN0cnVjdGlvblxuICAgICAgICAgICAgbmV4dERpciA9IHRoaXMubWFrZVRleHREaXJlY3Rpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICAgICAgd2F5ZmluZEFycmF5LFxuICAgICAgICAgICAgICB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMsXG4gICAgICAgICAgICAgIGN1cnJlbnRGbG9vclRleHREaXJlY3Rpb24sXG4gICAgICAgICAgICAgIGN1cmVudE5vZGUsXG4gICAgICAgICAgICAgIG5leHROb2RlLFxuICAgICAgICAgICAgICBwcmV2aW91c0FuZ2xlKTtcbiAgICAgICAgICAgIC8vIENhcnJ5IGFuZ2xlIHRvIG5leHQgZm9yIG5leHQgc3RlcCBhbmQgY2FsbCBpdCBwcmV2aW91c0FuZ2xlXG4gICAgICAgICAgICBwcmV2aW91c0FuZ2xlID0gbmV4dERpci5hbmdsZVRvTmV4dDtcbiAgICAgICAgICAgIC8vIE91dHB1dFxuICAgICAgICAgICAgaWYobmV4dERpci5sYW5kbWFya0Rlc3RpbmF0aW9uKSB7XG5cbiAgICAgICAgICAgICAgbmV4dERpci5vdXRwdXQgPSBfXy5zdHJpbmdXaXRoRm9ybWF0KFxuICAgICAgICAgICAgICAgICdXaXRoICUgb24geW91ciAlLCBnbyAlLicsXG4gICAgICAgICAgICAgICAgbmV4dERpci5sYW5kbWFya0Rlc3RpbmF0aW9uLm5hbWUsXG4gICAgICAgICAgICAgICAgbmV4dERpci5kaXJlY3Rpb25Ub0xhbmRtYXJrLFxuICAgICAgICAgICAgICAgIG5leHREaXIuZGlyZWN0aW9uXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgLy9TZXQgdHlwZVxuICAgICAgICAgICAgICBuZXh0RGlyLnR5cGUgPSAnb3JpZW50YXRpb24nO1xuXG4gICAgICAgICAgICAgIC8vIEFkZCB0byBhcnJheVxuICAgICAgICAgICAgICB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkucHVzaChuZXh0RGlyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExhc3Q/XG4gICAgICAgICAgLy8gR2V0IGN1cnJlbnRcbiAgICAgICAgICB2YXIgbGFzdE5vZGUgPSB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMucG9pbnRzW3VzZUFycmF5T2ZGbG9vcldheXBvaW50cy5wb2ludHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgaWYobGFzdE5vZGUpIHtcbiAgICAgICAgICAgIC8vIEFkZCBsYXN0XG4gICAgICAgICAgICAvLyBNYWtlIGxhc3QgdGV4dCBpbnN0cnVjdGlvblxuICAgICAgICAgICAgbmV4dERpciA9IHRoaXMubWFrZVRleHREaXJlY3Rpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICAgICAgd2F5ZmluZEFycmF5LFxuICAgICAgICAgICAgICB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMsXG4gICAgICAgICAgICAgIGN1cnJlbnRGbG9vclRleHREaXJlY3Rpb24sXG4gICAgICAgICAgICAgIGxhc3ROb2RlLFxuICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICBwcmV2aW91c0FuZ2xlKTtcblxuICAgICAgICAgICAgLy8gJ0Fycml2ZSBhdC4uLiA/XG4gICAgICAgICAgICB2YXIgbGFzdERpcmVjdGlvbiA9ICcnO1xuXG4gICAgICAgICAgICBpZighdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLm1vdmVyIHx8IHVzZUFycmF5T2ZGbG9vcldheXBvaW50cy5tb3Zlci5wYXRoVHlwZUlkID09IDEpIHtcbiAgICAgICAgICAgICAgdm9pZCAwO1xuICAgICAgICAgICAgICAvLyBGaW5hbCBkZXN0aW5hdGlvblxuICAgICAgICAgICAgICB2YXIgZGUgPSBuZXh0RGlyLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgICBuZXh0RGlyLnR5cGUgPSAnZW5kJztcbiAgICAgICAgICAgICAgbGFzdERpcmVjdGlvbiA9IF9fLnN0cmluZ1dpdGhGb3JtYXQoJ0Fycml2ZSBhdCAlLicsIGRlID8gZGUubmFtZSA6ICdkZXN0aW5hdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTW92ZXI/XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gTW92ZXIgTmFtZVxuICAgICAgICAgICAgICB2YXIgbW92ZXJOYW1lID0gdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLm1vdmVyLnR5cGVOYW1lO1xuXG4gICAgICAgICAgICAgIC8vIE1vdmVyIERpcmVjdGlvblxuICAgICAgICAgICAgICB2YXIgZmxvb3JBZnRlciA9IHdheWZpbmRBcnJheVtpICsgMV07XG4gICAgICAgICAgICAgIHZhciBtb3ZlckdvZXNUb0xldmVsID0gJyc7XG4gICAgICAgICAgICAgIHZhciBuZXh0U2VxID0gbnVsbDtcbiAgICAgICAgICAgICAgaWYoZmxvb3JBZnRlcikge1xuICAgICAgICAgICAgICAgIG5leHRTZXEgPSBmbG9vckFmdGVyLnNlcTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZihuZXh0U2VxID4gdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLnNlcSkge1xuICAgICAgICAgICAgICAgIC8vIFVwXG4gICAgICAgICAgICAgICAgbmV4dERpci5kaXJlY3Rpb24gPSAnVXAnO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYobmV4dFNlcSA8IHVzZUFycmF5T2ZGbG9vcldheXBvaW50cy5zZXEpIHtcbiAgICAgICAgICAgICAgICAvLyBEb3duXG4gICAgICAgICAgICAgICAgbmV4dERpci5kaXJlY3Rpb24gPSAnRG93bic7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVW5rbm93blxuICAgICAgICAgICAgICAgIG5leHREaXIuZGlyZWN0aW9uID0gJ1Vua25vd24gTW92ZXIgRGlyZWN0aW9uJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIExldCdzIHRyeSB0byBmaWd1cmUgb3V0IGhvdyBmYXIgd2UgY2FuIGdvXG4gICAgICAgICAgICAgIC8vIHZhciBtb3ZlcklkID0gdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLm1vdmVyO1xuICAgICAgICAgICAgICAvLyBHZXQgbmV4dCBmbG9vciBieSBnb2luZyBvbmUgYXJyYXkgdXAvZG93biB1c2luZyB3YXlmaW5kIGFycmF5XG4gICAgICAgICAgICAgIC8vIEdldCBuZXh0IGFycmF5IHVzaW5nIGZsb29ySW5kZXhcbiAgICAgICAgICAgICAgLy8gcGF0aFR5cGVJZDpcbiAgICAgICAgICAgICAgLy8gMiA9PSBFbGV2YXRvclxuICAgICAgICAgICAgICAvLyA0ID09IFN0YWlyc1xuICAgICAgICAgICAgICAvLyAzID09IEVzY2FsYXRvclxuICAgICAgICAgICAgICAvLyBHZXQgaW5kZXggb2YgY3VycmVudCBmbG9vclxuICAgICAgICAgICAgICB2YXIgZmxJbmRleCA9IHdheWZpbmRBcnJheS5pbmRleE9mKHVzZUFycmF5T2ZGbG9vcldheXBvaW50cyk7XG4gICAgICAgICAgICAgIHZhciBwcmV2aW91c0Zsb29yTm9kZUlkID0gbGFzdE5vZGUuaWQ7XG4gICAgICAgICAgICAgIHZhciBoaWdoZXN0Rmxvb3JTZXEgPSB1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMuc2VxO1xuICAgICAgICAgICAgICB2YXIga2VlcExvb2tpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICB3aGlsZShrZWVwTG9va2luZykge1xuICAgICAgICAgICAgICAgIC8vIEdldCBuZXh0IGZsb29yIGluZGV4XG4gICAgICAgICAgICAgICAgZmxJbmRleCsrO1xuICAgICAgICAgICAgICAgIC8vIENhbiBpdCBiZT9cbiAgICAgICAgICAgICAgICBpZigod2F5ZmluZEFycmF5Lmxlbmd0aCA+IGZsSW5kZXgpICYmIChmbEluZGV4ID49IDApKSB7XG4gICAgICAgICAgICAgICAgICAvLyBHZXQgbmV4dCBmbG9vclxuICAgICAgICAgICAgICAgICAgdmFyIG5leHRBcnJheU9mRmxvb3JXYXlwb2ludHMgPSB3YXlmaW5kQXJyYXlbZmxJbmRleF07XG5cbiAgICAgICAgICAgICAgICAgIC8vIExvZ2ljOiBJcyB0aGUgZmlyc3Qgbm9kZSBzYW1lIGFzIHByZXZpb3VzIChwYXJlbnQgbm9kZSkgQU5EXG4gICAgICAgICAgICAgICAgICAvLyBJcyBmaXJzdCBub2RlIHNhbWUgYXMgbGFzdCBub2RlIEFORFxuICAgICAgICAgICAgICAgICAgLy8gSXMgZmlyc3QgbmV4dCBub2RlIHNhbWUgYXMgbGFzdCBuZXh0IG5vZGVcbiAgICAgICAgICAgICAgICAgIHZhciBwdHMgPSBuZXh0QXJyYXlPZkZsb29yV2F5cG9pbnRzLnBvaW50cztcbiAgICAgICAgICAgICAgICAgIHZhciBmaXJzdE5vZGVOZXh0ID0gcHRzWzBdO1xuICAgICAgICAgICAgICAgICAgdmFyIGxhc3ROb2RlTmV4dCA9IHB0c1twdHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgICAgICAgIC8vIElzIHRoZSBmaXJzdCBub2RlIHNhbWUgYXMgcHJldmlvdXMgKHBhcmVudCBub2RlKVxuICAgICAgICAgICAgICAgICAgaWYocHJldmlvdXNGbG9vck5vZGVJZCA9PSBmaXJzdE5vZGVOZXh0LnBhcmVudC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBZZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBuZXcgaGlnaGVzdCBmbG9vclxuICAgICAgICAgICAgICAgICAgICBoaWdoZXN0Rmxvb3JTZXEgPSBuZXh0QXJyYXlPZkZsb29yV2F5cG9pbnRzLnNlcTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1lbWJlciBpdCBzbyB3ZSBkb24ndCBnZW5lcmF0ZSB0ZXh0IGRpcmVjdGlvbnMgZm9yIHNraXBwZWQgZmxvb3JzXG4gICAgICAgICAgICAgICAgICAgIG1vdmVyVGFrZXNVc1RvRmxvb3IgPSBuZXh0QXJyYXlPZkZsb29yV2F5cG9pbnRzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IG5vZGUgc2FtZSBhcyBuZXh0IG5vZGVcbiAgICAgICAgICAgICAgICAgICAgaWYoZmlyc3ROb2RlTmV4dC5pZCA9PSBsYXN0Tm9kZU5leHQuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVyZSBpcyBhIHBvc3NpYmlsaXR5IHdlIGNhbiBnbyBoaWdoZXJcbiAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0Zsb29yTm9kZUlkID0gbGFzdE5vZGVOZXh0LmlkO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIENhbm5vdCBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb29raW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgd291bGQgYmUgb2RkXG4gICAgICAgICAgICAgICAgICAgIGtlZXBMb29raW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIE5vIG1vcmUgZmxvb3JzLCBvdXQgb2YgdGhlIGxvb3BcbiAgICAgICAgICAgICAgICAgIGtlZXBMb29raW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIEdldCBuZXh0IGZsb29yXG4gICAgICAgICAgICAgIHZhciBmaW5hbE5leHRGbG9vciA9IHRoaXMubW9kZWwuZ2V0Rmxvb3JCeVNlcXVlbmNlKGhpZ2hlc3RGbG9vclNlcSk7XG4gICAgICAgICAgICAgIG1vdmVyR29lc1RvTGV2ZWwgPSBmaW5hbE5leHRGbG9vci5uYW1lO1xuXG4gICAgICAgICAgICAgIC8vIFRyYW5zbGF0ZSBNb3ZlciBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICBuZXh0RGlyLnR5cGUgPSAnbW92ZXInO1xuICAgICAgICAgICAgICBuZXh0RGlyLm1vdmVyVHlwZSA9IG1vdmVyTmFtZTtcbiAgICAgICAgICAgICAgbGFzdERpcmVjdGlvbiA9IF9fLnN0cmluZ1dpdGhGb3JtYXQoJ1Rha2UgJSAlLCB0byAlJywgbW92ZXJOYW1lLCBuZXh0RGlyLmRpcmVjdGlvbiwgbW92ZXJHb2VzVG9MZXZlbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE91dHB1dFxuICAgICAgICAgICAgbmV4dERpci5vdXRwdXQgPSBsYXN0RGlyZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBBbmdsZSB0byBuZXh0XG4gICAgICAgICAgICBuZXh0RGlyLmFuZ2xlVG9OZXh0ID0gLTE7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0byBhcnJheVxuICAgICAgICAgICAgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5LnB1c2gobmV4dERpcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVyP1xuICAgICAgICAvL2ZpbHRlck9uID0gZmFsc2U7XG4gICAgICAgIGlmKGZpbHRlck9uKSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ0luc3RydWN0aW9ucyB0byBzdGFydCB3aXRoOicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuXG4gICAgICAgICAgLy8gR2V0IHNjYWxlXG4gICAgICAgICAgLy8gdGhpcyBpcyBhIGZsb2F0IG9mIGhvdyBtYW55IG1pbGltZXRlcnMgYXJlIHByZXByZXNlbnRlZCBieSBvbmUgcGl4ZWwgb24gdGhlIG1hcFxuICAgICAgICAgIHZhciBjdXJyZW50Rmxvb3IgPSB0aGlzLm1vZGVsLmdldEZsb29yQnlJZCh1c2VBcnJheU9mRmxvb3JXYXlwb2ludHMubWFwSWQpO1xuICAgICAgICAgIHZhciB4U2NhbGUgPSBjdXJyZW50Rmxvb3IueFNjYWxlO1xuICAgICAgICAgIHZhciB5U2NhbGUgPSBjdXJyZW50Rmxvb3IueVNjYWxlO1xuICAgICAgICAgIHZhciBlbmFibGVEaXN0YW5jZUZpbHRlcnMgPSAoKHhTY2FsZSA+IDApICYmICh5U2NhbGUgPiAwKSk7XG5cbiAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSB7XG4gICAgICAgICAgICB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXk6IHRleHREaXJlY3Rpb25zRmxvb3JBcnJheSxcbiAgICAgICAgICAgIHVzZUFycmF5T2ZGbG9vcldheXBvaW50czogdXNlQXJyYXlPZkZsb29yV2F5cG9pbnRzLFxuICAgICAgICAgICAgd2F5ZmluZEFycmF5OiB3YXlmaW5kQXJyYXksXG4gICAgICAgICAgICBmaWx0ZXJPbjogZmlsdGVyT24sXG4gICAgICAgICAgICBhZGRURGlmRW1wdHlNZXRlcnM6IGFkZFREaWZFbXB0eU1ldGVycyxcbiAgICAgICAgICAgIFVUdXJuSW5NZXRlcnM6IFVUdXJuSW5NZXRlcnMsXG4gICAgICAgICAgICBlbmFibGVEaXN0YW5jZUZpbHRlcnM6IGVuYWJsZURpc3RhbmNlRmlsdGVycyxcbiAgICAgICAgICAgIHhTY2FsZTogeFNjYWxlLFxuICAgICAgICAgICAgeVNjYWxlOiB5U2NhbGUsXG4gICAgICAgICAgICBjdXJyZW50Rmxvb3JURDogY3VycmVudEZsb29yLFxuICAgICAgICAgICAgY3VyQ2FudmFzOiBjdXJDYW52YXNcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gRmlsdGVyIGFycmF5XG4gICAgICAgICAgLy8gMS4gVGFrZSBvdXQgdGV4dCBkaXJlY3Rpb25zIGJldHdlZW4gbGFzdCBvbmUgYW5kIHRoZSBmaXJzdCBvbmUgdGhhdCBoYXMgZmluYWwgRGVzdGluYXRpb24gYXMgaXRzIGxhbmRtYXJrLlxuICAgICAgICAgIGlmKHRydWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmMSBiZWZvcmUgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50OicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuXG4gICAgICAgICAgICBmaWx0ZXJObzFUYWtlT3V0RGlyZWN0aW9uc0JldHdlZW5MYXN0QW5kRmlyc3QuY2FsbCh0aGlzLCBpbnN0cnVjdGlvbik7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmMSBhZnRlciAgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50OicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIDIuIFN0YXJ0IERpcmVjdGlvbiBhc3N1bWVzIGRpcmVjdGlvbnMgb2YgYWxsIG5leHQgZGlyZWN0aW9ucyB3aGljaCB1c2UgaXRzIERlc3RpbmF0aW9uIGFzIHRoZWlyIExhbmRtYXJrcy5cbiAgICAgICAgICAvLyBTdGFydCB3aXRoOiAxKSBXaXRoIFN0b3JlIGJlaGluZCB5b3UsIGdvIEZvcndhcmQuIDIpIFdpdGggU3RvcmUgb24geW91ciBSaWdodCwgZ28gUmlnaHQuIDMpIG5leHQuLi5cbiAgICAgICAgICAvLyBDb3JyZWN0IHRvOiAxKSBXaXRoIFN0b3JlIGJlaGluZCB5b3UsIGdvIFJpZ2h0LiAyKSBuZXh0Li4uXG4gICAgICAgICAgLy8gT24gZmlyc3QgZmxvb3IhXG4gICAgICAgICAgLy8gU2VlIGlmIG5leHQgdGV4dCBkaXJlY3Rpb24gaXMgdXNpbmcgc3RhcnQtZGVzdGluYXRpb24gYW5kIGlmIGl0IGRvZXMsIGZvbGQgaXQsIHRha2luZyBpdHMgZGlyZWN0aW9uIGFzIGZpcnN0LlxuICAgICAgICAgIGlmKHRydWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmMiBiZWZvcmUgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50OicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuXG4gICAgICAgICAgICBmaWx0ZXJObzJTdGFydERpcmVjdGlvbkNsZWFuVXBBbGxXaGljaFVzZURlc3RpbmF0aW9uQXNMYW5kbWFya3MuY2FsbCh0aGlzLCBpbnN0cnVjdGlvbik7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmMiBhZnRlciAgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50OicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIDMuIFUtVHVybiBkZXRlY3Rpb246IGVnLjogVGhyZWUgbGVmdHMgd2l0aCBjb21iaW5lZCBhbmdsZSBvZiBvdmVyIDEwMCBkZWcgYmVjb21lIExlZnQgVS1UdXJuXG4gICAgICAgICAgaWYodHJ1ZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2YzIGJlZm9yZSB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgY291bnQ6JywgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5Lmxlbmd0aCk7XG5cbiAgICAgICAgICAgIGZpbHRlck5vM1VUdXJuRGV0ZWN0aW9uLmNhbGwodGhpcywgaW5zdHJ1Y3Rpb24pO1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZjMgYWZ0ZXIgIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBjb3VudDonLCB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA0LiBSZW1vdmUgY29uc2VjdXRpdmUgRm9yd2FyZHNcbiAgICAgICAgICBpZih0cnVlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZjQgYmVmb3JlIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheSBjb3VudDonLCB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkubGVuZ3RoKTtcblxuICAgICAgICAgICAgZmlsdGVyTm80UmVtb3ZlQ29uc2VjdXRpdmVGb3J3YXJkcy5jYWxsKHRoaXMsIGluc3RydWN0aW9uKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Y0IGFmdGVyICB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgY291bnQ6JywgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5Lmxlbmd0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gNS4gUmVkdW5kYW50IGluc3RydWN0aW9ucyBpbiB0aGUgTWlkZGxlIG9mIEluc3RydWN0aW9ucyAoY29tYm8tZGlyZWN0aW9ucylcbiAgICAgICAgICAvLyBMZWZ0IGF0IE1hY3lzLCBSaWdodCBhdCBNYWN5cy4uLiBpbnRvOiBcIlR1cm4gTGVmdCB0aGVuIFJpZ2h0IGF0IE1hY3lzXCJcbiAgICAgICAgICAvLyBOT1RFOiBBdm9pZCBGb3J3YXJkIGRpcmVjdGlvbnMgdW5sZXNzIHRoZXkgYXJlIGF0IHRoZSB2ZXJ5IGVuZCBvZiBjb21iby1pbnN0cnVjdGlvbi5cbiAgICAgICAgICAvLyBEb24ndCBoYXZlIFJpZ2h0LCBGb3J3YXJkLCBMZWZ0LCBGb3J3YXJkXG4gICAgICAgICAgLy8gSW5zdGVhZCBoYXZlOiBSaWdodCwgTGVmdCwgRm9yd2FyZFxuICAgICAgICAgIC8vIEtlZXAgbG9vcGluZyB3aGlsZVxuICAgICAgICAgIGlmKHRydWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmNSBiZWZvcmUgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50OicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuXG4gICAgICAgICAgICBmaWx0ZXJObzVSZWR1bmRhbnRJbnN0cnVjdGlvbnNJbk1pZGRsZUluc3RydWN0aW9uc0NvbWJvRGlyZWN0aW9ucy5jYWxsKHRoaXMsIGluc3RydWN0aW9uKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Y1IGFmdGVyICB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkgY291bnQ6JywgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5Lmxlbmd0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRmlsdGVyIE5vLjYgQ29udGludWUgUGFzdCwgRmlMTGVyIVxuICAgICAgICAgIGlmKHRydWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmNiBiZWZvcmUgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50OicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuXG4gICAgICAgICAgICBmaWx0ZXJObzZDb250aW51ZVBhc3RGaWxsZXIuY2FsbCh0aGlzLCBpbnN0cnVjdGlvbik7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmNiBhZnRlciAgdGV4dERpcmVjdGlvbnNGbG9vckFycmF5IGNvdW50OicsIHRleHREaXJlY3Rpb25zRmxvb3JBcnJheS5sZW5ndGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGFuZ3VhZ2UgZmlsdGVyczpcbiAgICAgICAgdmFyIGxvb3BUbzUgPSB0ZXh0RGlyZWN0aW9uc0Zsb29yQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yKHZhciBzID0gMTsgcyA8IGxvb3BUbzU7IHMrKykge1xuXG4gICAgICAgICAgLy8gR2V0IGRpcmVjdGlvblxuICAgICAgICAgIHZhciBfY3VycmVudEluc3RydWN0aW9uID0gdGV4dERpcmVjdGlvbnNGbG9vckFycmF5W3NdO1xuICAgICAgICAgIC8vIEZpbHRlciBpdHMgb3V0cHV0XG4gICAgICAgICAgX2N1cnJlbnRJbnN0cnVjdGlvbi5vdXRwdXQgPSB0aGlzLmxhbmd1YWdlRmlsdGVycyhfY3VycmVudEluc3RydWN0aW9uLm91dHB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgdG8gYXJyYXlcbiAgICAgICAgdGV4dERpcmVjdGlvbnNGb3JBbGxGbG9vcnNBcnJheS5wdXNoKHRleHREaXJlY3Rpb25zRmxvb3JBcnJheSk7XG5cbiAgICAgIH1cblxuICAgIH1cblxuICAgIC8vQWRkIGRpc3RhbmNlIHRvIGV2ZXJ5IHRleHQgZGlyZWN0aW9uXG4gICAgZm9yKHZhciBmbG9vckluZGV4ID0gMDsgZmxvb3JJbmRleCA8IHRleHREaXJlY3Rpb25zRm9yQWxsRmxvb3JzQXJyYXkubGVuZ3RoOyBmbG9vckluZGV4KyspIHtcbiAgICAgIC8vIEdldCBuZXh0IGZsb29yXG4gICAgICB2YXIgX25leHRGbG9vciA9IHRleHREaXJlY3Rpb25zRm9yQWxsRmxvb3JzQXJyYXlbZmxvb3JJbmRleF07XG5cbiAgICAgIC8vIEdldCB0byB3YXkgZmluZCBhcnJheVxuICAgICAgdmFyIF91c2VBcnJheU9mRmxvb3JXYXlwb2ludHMgPSB3YXlmaW5kQXJyYXlbZmxvb3JJbmRleF07XG4gICAgICB2YXIgY3VycmVudEZsb29yXyA9IHRoaXMubW9kZWwuZ2V0Rmxvb3JCeUlkKF91c2VBcnJheU9mRmxvb3JXYXlwb2ludHMubWFwSWQpO1xuICAgICAgdmFyIHhTY2FsZV8gPSBjdXJyZW50Rmxvb3JfLnhTY2FsZTtcbiAgICAgIHZhciB5U2NhbGVfID0gY3VycmVudEZsb29yXy55U2NhbGU7XG4gICAgICB2YXIgZW5hYmxlRGlzdGFuY2VGaWx0ZXJzXyA9ICgoeFNjYWxlXyA+IDApICYmICh5U2NhbGVfID4gMCkpO1xuXG4gICAgICAvLyBDb3VudGVyc1xuICAgICAgdmFyIGN1cnJlbnREaXN0YW5jZVBpeGVscyA9IDA7XG5cbiAgICAgIC8vIEdvIHRocm91Z2ggdGV4dCBkaXJlY3Rpb25zXG4gICAgICBmb3IodmFyIF9fbmV4dERpcmVjdGlvbiA9IDE7IF9fbmV4dERpcmVjdGlvbiA8IF9uZXh0Rmxvb3IubGVuZ3RoOyBfX25leHREaXJlY3Rpb24rKykge1xuICAgICAgICB2YXIgbmV4dEluc3RydWN0aW9uX18gPSBfbmV4dEZsb29yW19fbmV4dERpcmVjdGlvbl07XG5cbiAgICAgICAgdmFyIHByZXZpb3VzSW5zdHJ1Y3Rpb25fXyA9IF9uZXh0Rmxvb3JbKF9fbmV4dERpcmVjdGlvbiAtIDEpXTtcblxuICAgICAgICAvLyBHZXQgQ0dQb2ludFxuICAgICAgICB2YXIgbmV4dFBvaW50X18gPSBbbmV4dEluc3RydWN0aW9uX18ud3AueCwgbmV4dEluc3RydWN0aW9uX18ud3AueV07XG4gICAgICAgIHZhciBwcmV2aW91c1BvaW50X18gPSBbcHJldmlvdXNJbnN0cnVjdGlvbl9fLndwLngsIHByZXZpb3VzSW5zdHJ1Y3Rpb25fXy53cC55XTtcblxuICAgICAgICAvLyBHZXQgZGlzdGFuY2UgZnJvbSB0b1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBfXy5kaXN0YW5jZUJldHdlZW4ocHJldmlvdXNQb2ludF9fLCBuZXh0UG9pbnRfXyk7XG5cbiAgICAgICAgLy8gY3VycmVudERpc3RhbmNlUGl4ZWxzXG4gICAgICAgIGN1cnJlbnREaXN0YW5jZVBpeGVscyArPSBkaXN0YW5jZTtcblxuICAgICAgICAvLyBBZGQgdG8gdG90YWwgZGlzdGFuY2VcbiAgICAgICAgbmV4dEluc3RydWN0aW9uX18uZGlzdGFuY2VGcm9tU3RhcnRQaXhlbHMgPSBjdXJyZW50RGlzdGFuY2VQaXhlbHM7XG5cbiAgICAgICAgLy8gQWRkIHRvIHByZXZpb3VzSW5zdHJ1Y3Rpb25fX1xuICAgICAgICBwcmV2aW91c0luc3RydWN0aW9uX18uZGlzdGFuY2VUb05leHRQaXhlbHMgPSBkaXN0YW5jZTtcblxuICAgICAgICAvLyBNZXRlcnNcbiAgICAgICAgaWYoZW5hYmxlRGlzdGFuY2VGaWx0ZXJzXykge1xuICAgICAgICAgIC8vIEFkZCB0byB0b3RhbCBkaXN0YW5jZSBpbiBtZXRlcnNcbiAgICAgICAgICBuZXh0SW5zdHJ1Y3Rpb25fXy5kaXN0YW5jZUZyb21TdGFydE1ldGVycyA9IF9fLmNvbnZlcnRQaXhlbHNUb01ldGVycyhuZXh0SW5zdHJ1Y3Rpb25fXy5kaXN0YW5jZUZyb21TdGFydFBpeGVscywgeFNjYWxlXyk7XG5cbiAgICAgICAgICAvLyBBZGQgdG8gcHJldmlvdXNJbnN0cnVjdGlvbl9fXG4gICAgICAgICAgcHJldmlvdXNJbnN0cnVjdGlvbl9fLmRpc3RhbmNlVG9OZXh0TWV0ZXJzID0gX18uY29udmVydFBpeGVsc1RvTWV0ZXJzKHByZXZpb3VzSW5zdHJ1Y3Rpb25fXy5kaXN0YW5jZVRvTmV4dFBpeGVscywgeFNjYWxlXyk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhcnJ5IHBvaW50XG4gICAgICAgIHByZXZpb3VzUG9pbnRfXyA9IG5leHRQb2ludF9fO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldFxuICAgIGNvbnNvbGUudGltZUVuZCgnbWFrZVRleHREaXJlY3Rpb25zJyk7XG4gICAgcmV0dXJuIHRleHREaXJlY3Rpb25zRm9yQWxsRmxvb3JzQXJyYXk7XG4gIH07XG5cbiAgLy8gTWFrZSBzaW5nbGUgVGV4dCBEaXJlY3Rpb25cbiAgcHJvY2Vzc29yLm1ha2VUZXh0RGlyZWN0aW9uSW5zdHJ1Y3Rpb24gPSBmdW5jdGlvbih3YXlmaW5kQXJyYXksIGZsb29yV2F5cG9pbnRzLCBmbG9vciwgY3VycmVudE5vZGUsIG5leHROb2RlLCBwcmV2aW91c1RvQW5nbGUpIHtcblxuICAgIC8vIE1ha2UgbmV4dCB0ZXh0IGluc3RydWN0aW9uXG4gICAgLy9Jbml0aWFsIHByb3BlcnRpZXMgYXJlIGF0IGJvdHRvbSBvZiBmaWxlLlxuICAgIC8vVGhpcyBzaG91bGQgcHJvYmFibHkgYmVjb21lIGEgY2xhc3NcbiAgICAvLyB2YXIgbmV4dERpciA9IHtcbiAgICAvLyAgIGZvbGRUb0JhY2s6IGZvbGRUb0JhY2ssXG4gICAgLy8gICBmb2xkSW5Gcm9udDogZm9sZEluRnJvbnRcbiAgICAvLyB9O1xuICAgIHZhciBuZXh0RGlyID0gbmV3IEluc3RydWN0aW9uKClcblxuICAgIC8vIFRleHQgZGlyZWN0aW9uIGZsb29yIGluZm9ybWF0aW9uXG4gICAgLy8gR2V0IGZpcnN0IFdQXG4gICAgbmV4dERpci5mbG9vciA9IGZsb29yLm1hcElkO1xuICAgIG5leHREaXIuZmxvb3JOYW1lID0gZmxvb3IuZGVzY3JpcHRpb247XG5cbiAgICAvLyBDdXJyZW50IFdheXBvaW50LCBEZXN0aW5hdGlvbiBhbmQgRGlyZWN0aW9uXG5cbiAgICAvLyBXYXlwb2ludFxuICAgIG5leHREaXIud3AgPSB0aGlzLm1vZGVsLmdldFdheXBvaW50SW5mb3JtYXRpb24oY3VycmVudE5vZGUuaWQpO1xuICAgIGlmKG5leHREaXIud3AgPT09IG51bGwpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdObyBXQVlQT0lOVD8/PycpO1xuICAgICAgLy8gSSBkb24ndCB0aGluayB3ZSBjYW4gY29udGludWVcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEdldCBkZXN0aW5hdGlvblxuICAgIHZhciBkZXN0aW5hdGlvbnNBcnJheSA9IHRoaXMubW9kZWwuZ2V0RGVzdGluYXRpb25CeVdheXBvaW50SWQoY3VycmVudE5vZGUuaWQpO1xuICAgIGlmKGRlc3RpbmF0aW9uc0FycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdm9pZCAwO1xuICAgICAgLy8gY29uc29sZS5sb2coJ05vIERlc3RpbmF0aW9uIGF0IHdheXBvaW50LicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0RGlyLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb25zQXJyYXlbMF07XG4gICAgfVxuXG4gICAgLy8gRGlyZWN0aW9uXG4gICAgLy8gR2V0IERpcmVjdGlvblxuICAgIC8vIEZpZ3VyZSBvdXQgdGhlIGFuZ2xlIHRvIG5leHRcblxuICAgIC8vIEN1cnJlbnQgcG9pbnRcbiAgICB2YXIgY3VycmVudFBvaW50ID0gW2N1cnJlbnROb2RlLngsIGN1cnJlbnROb2RlLnldO1xuXG4gICAgLy8gTmV4dCBwb2ludFxuICAgIHZhciBuZXh0UG9pbnQ7XG4gICAgaWYobmV4dE5vZGUgPT09IG51bGwpIHtcbiAgICAgIG5leHRQb2ludCA9IGN1cnJlbnRQb2ludDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFBvaW50ID0gW25leHROb2RlLngsIG5leHROb2RlLnldO1xuICAgIH1cblxuICAgIC8vIEdldCBhbmdsZVxuICAgIHZhciBhbmdsZSA9IF9fLnBvaW50UGFpclRvQmVhcmluZ0RlZ3JlZXMoY3VycmVudFBvaW50LCBuZXh0UG9pbnQpO1xuICAgIC8vIEdldCBhbmdsZSB0byBuZXh0XG4gICAgbmV4dERpci5hbmdsZVRvTmV4dCA9IGFuZ2xlO1xuICAgIC8vIHByZXZpb3VzQW5nbGVcbiAgICAvLyBJZiB3ZSBhcmUgc3RhcnRpbmcgb24gbmV3IGZsb29yLCBwcmV2aW91c1RvQW5nbGUgc2hvdWxkIGJlIC0xXG4gICAgaWYocHJldmlvdXNUb0FuZ2xlID09IC0xKSB7XG4gICAgICAvLyBSZXBlYXQgYW5nbGVcbiAgICAgIG5leHREaXIuYW5nbGVUb05leHRPZlByZXZpb3VzRGlyZWN0aW9uID0gYW5nbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgVGV4dCBEaXJlY3Rpb24gaXMgbm90IHRoZSBmaXJzdCBvbmUgb24gdGhpcyBmbG9vciBzbyB1c2UgcHJldmlvdXNUb0FuZ2xlXG4gICAgICBuZXh0RGlyLmFuZ2xlVG9OZXh0T2ZQcmV2aW91c0RpcmVjdGlvbiA9IHByZXZpb3VzVG9BbmdsZTtcbiAgICB9XG4gICAgLy8gV2hhdCBpcyB0aGUgYW5nbGUgZGlmZmVyZW5jZT9cbiAgICB2YXIgYW5nbGVEaWZmZXJlbmNlID0gbmV4dERpci5hbmdsZVRvTmV4dE9mUHJldmlvdXNEaXJlY3Rpb24gLSBuZXh0RGlyLmFuZ2xlVG9OZXh0O1xuICAgIHdoaWxlKGFuZ2xlRGlmZmVyZW5jZSA8IC0xODApIGFuZ2xlRGlmZmVyZW5jZSArPSAzNjA7XG4gICAgd2hpbGUoYW5nbGVEaWZmZXJlbmNlID4gMTgwKSBhbmdsZURpZmZlcmVuY2UgLT0gMzYwO1xuXG4gICAgLy8gQ29tcHV0ZSBuZXh0IGRpcmVjdGlvblxuICAgIG5leHREaXIuZGlyZWN0aW9uID0gX18uZGlyZWN0aW9uRnJvbUFuZ2xlKGFuZ2xlRGlmZmVyZW5jZSwgbnVsbCk7XG5cbiAgICAvLyBVc2UgYW5nbGVUb05leHQgdG8gY3JlYXRlIGJsb2NrZXJzXG4gICAgLy8gSWYgeW91IGRvbid0IGZpbmQgYW55IGRlc3RpbmF0aW9ucywgZ28gaW4gc2VxdWVuY2U6XG4gICAgLy8gU3RlcCAxIC0gTGVmdCBEb3duXG4gICAgLy8gU3RlcCAyIC0gVXAgTGVmdFxuICAgIC8vIFN0ZXAgMyAtIFJpZ2h0IERvd25cbiAgICAvLyBTdGVwIDQgLSBSaWdodCBVcFxuXG4gICAgLy8gZmFsc2VURTogVXNpbmcgdHJ1ZSBhbmdsZXMgKHBvaW50UGFpclRvQmVhcmluZ0RlZ3JlZXMpIHByb2R1Y2VzIGFuZ2xlIHdpdGggMCBkZWdyZWUgd2hpY2ggaXMgb24geCBheGlzIG9uIGxlZnQgc2lkZVxuICAgIC8vICAgICAgICA5MFxuICAgIC8vICAgICAgICB8XG4gICAgLy8gICAgICAgIHlcbiAgICAvLyAgICAgICAgfFxuICAgIC8vIDE4MC0teC0rLS0tIDAgZGVncmVlc1xuICAgIC8vICAgICAgICB8XG4gICAgLy8gICAgICAgIHxcbiAgICAvLyAgICAgICAgMjcwXG4gICAgLy8gICAgICAgIHxcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyBDcmVhdGUgYmxvY2tlcnNcbiAgICAvLyBUaGVzZSB3aWxsIGJlIHJlY3RhbmdsZXMgY292ZXJpbmcgdGhlIHBvcnRpb24gb2YgbWFwIHdpdGggcG9zc2libGUgTGFuZG1hcmtzIHdoaWNoIGFyZSBsZXNzIGRlc2lyYWJsZVxuXG4gICAgLy8gR2V0IGxpbmsgdG8gaGVscGVyIG1ldGhvZCBjbGFzc1xuICAgIC8vIHZhciBjdXJDYW52YXMgPSB0aGlzLnNoYXBlc1tmbG9vci5pZF0ubGJveGVzO1xuICAgIC8vIFByb2R1Y2UgTGFuZG1hcmsgdXNpbmcgQmxvY2tlcnMgc2VxdWVuY2VcbiAgICAvLyB2YXIgbmV4dFN0ZXAgPSAwO1xuICAgIHZhciB0ZW1wTGFuZG1hcmsgPSBudWxsO1xuXG4gICAgLy8gTmV4dCBhbmdsZVxuICAgIC8vIHZhciBuZXh0QW5nbGUgPSAtMTtcblxuICAgIC8vIExhbmRtYXJrXG4gICAgLy8gR2V0IExhbmRtYXJrIHVzaW5nIGxpbmUgb2Ygc2lnaHRcbiAgICAvLyBVc2VkIHRvIGRlc2NyaWJlIHBvaW50IG9mIHJlZmVyZW5jZSBlZy46ICdXaXRoICpMYW5kbWFyayogb24geW91ciBMZWZ0LCBwcm9jZWVkIEZvcndhcmQnXG4gICAgLy8gR2V0IG5lYXJlc3QgZGVzdGluYXRpb24gdXNpbmcgbGluZSBvZiBzaWdodFxuICAgIHZhciByZXR1cm5DbG9zZXN0UG9pbnQgPSB7XG4gICAgICB2YWx1ZTogbnVsbFxuICAgIH07XG4gICAgdmFyIHRoZUNhbnZhcyA9IHRoaXMuc2hhcGVzW2Zsb29yLm1hcElkXS5sYm94ZXM7XG5cbiAgICB0ZW1wTGFuZG1hcmsgPSB0aGlzLmxpbmVPZlNpZ2h0RnJvbUNsb3Nlc3RMYW5kbWFya1RvWFkoXG4gICAgICBjdXJyZW50UG9pbnQsXG4gICAgICByZXR1cm5DbG9zZXN0UG9pbnQsXG4gICAgICBuZXh0RGlyLmRpcmVjdGlvbixcbiAgICAgIG5leHREaXIuYW5nbGVUb05leHRPZlByZXZpb3VzRGlyZWN0aW9uLFxuICAgICAgdGhlQ2FudmFzXG4gICAgKTtcblxuICAgIGlmKHRlbXBMYW5kbWFyaykge1xuICAgICAgbmV4dERpci5sYW5kbWFya0Rlc3RpbmF0aW9uID0gdGVtcExhbmRtYXJrO1xuICAgICAgLy8gRmluZCBXUCBzbyB3ZSBjYW4gYWNjdXJhdGVseSBkZXRlcm1pbmUgYW5nbGUgdG8gZGVzdGluYXRpb24ncyBlbnRyYW5jZVxuICAgICAgdmFyIGxhbmRtYXJrV1AgPSB0aGlzLm1vZGVsLmdldFdheXBvaW50c0J5RGVzdGluYXRpb25JZChuZXh0RGlyLmxhbmRtYXJrRGVzdGluYXRpb24uaWQpWzBdO1xuICAgICAgaWYobGFuZG1hcmtXUCkge1xuICAgICAgICBuZXh0RGlyLmxhbmRtYXJrV1AgPSBsYW5kbWFya1dQO1xuXG4gICAgICAgIC8vIEdldCBhbmdsZSBjb21wYXJpbmcgRGlyZWN0aW9uIGFuZ2xlVG9OZXh0XG4gICAgICAgIC8vIERpcmVjdGlvblxuICAgICAgICAvL3Byb3BlcnR5IE5TU3RyaW5nICpkaXJlY3Rpb247XG4gICAgICAgIC8vIEdldCBEaXJlY3Rpb25cbiAgICAgICAgLy8gRmlndXJlIG91dCB0aGUgYW5nbGUgdG8gbmV4dFxuICAgICAgICAvLyBHZXQgYW5nbGVcbiAgICAgICAgYW5nbGUgPSBfXy5wb2ludFBhaXJUb0JlYXJpbmdEZWdyZWVzKGN1cnJlbnRQb2ludCwgcmV0dXJuQ2xvc2VzdFBvaW50LnZhbHVlKTtcbiAgICAgICAgLy8gR2V0IGFuZ2xlIHRvIG5leHRcbiAgICAgICAgbmV4dERpci5hbmdsZVRvTGFuZG1hcmsgPSBhbmdsZTtcblxuICAgICAgICAvLyBXaGF0IGlzIHRoZSBhbmdsZSBkaWZmZXJlbmNlP1xuICAgICAgICB2YXIgYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSA9IG5leHREaXIuYW5nbGVUb05leHRPZlByZXZpb3VzRGlyZWN0aW9uIC0gbmV4dERpci5hbmdsZVRvTGFuZG1hcms7XG4gICAgICAgIHdoaWxlKGFuZ2xlVG9MYW5kbWFya0RpZmZlcmVuY2UgPCAtMTgwKSBhbmdsZVRvTGFuZG1hcmtEaWZmZXJlbmNlICs9IDM2MDtcbiAgICAgICAgd2hpbGUoYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSA+IDE4MCkgYW5nbGVUb0xhbmRtYXJrRGlmZmVyZW5jZSAtPSAzNjA7XG4gICAgICAgIC8vIENvbXB1dGUgbmV4dCBkaXJlY3Rpb25cbiAgICAgICAgbmV4dERpci5kaXJlY3Rpb25Ub0xhbmRtYXJrID0gX18uZGlyZWN0aW9uRnJvbUFuZ2xlKGFuZ2xlVG9MYW5kbWFya0RpZmZlcmVuY2UsIG51bGwpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBObyBkZXN0aW5hdGlvblxuICAgICAgbmV4dERpci5sYW5kbWFya0Rlc3RpbmF0aW9uID0gbnVsbDtcbiAgICAgIG5leHREaXIubGFuZG1hcmtXUCA9IG51bGw7XG4gICAgICBuZXh0RGlyLmFuZ2xlVG9MYW5kbWFyayA9IC0xO1xuICAgICAgY29uc29sZS5sb2coJ05vIExhbmRtYXJrIERlc3RpbmF0aW9uLicpO1xuICAgIH1cblxuICAgIC8vIFJldFxuICAgIHJldHVybiBuZXh0RGlyO1xuICB9O1xuXG4gIHByb2Nlc3Nvci5sYW5ndWFnZUZpbHRlcnMgPSBmdW5jdGlvbih0aGlzT3V0cHV0KSB7XG4gICAgLy8gQmFkOiAgT24geW91ciBGb3J3YXJkXG4gICAgLy8gR29vZDogaW4gZnJvbnRcbiAgICBpZihfXy5zdHJpbmdDb250YWluc1N0cmluZyh0aGlzT3V0cHV0LCAnb24geW91ciBGb3J3YXJkJykpIHtcbiAgICAgIHRoaXNPdXRwdXQgPSB0aGlzT3V0cHV0LnNwbGl0KCdvbiB5b3VyIEZvcndhcmQnKS5qb2luKCdpbiBmcm9udCcpO1xuICAgIH1cblxuICAgIC8vIEJhZDogIE9uIHlvdXIgQmFja1xuICAgIC8vIEdvb2Q6IGluIGZyb250XG4gICAgaWYoX18uc3RyaW5nQ29udGFpbnNTdHJpbmcodGhpc091dHB1dCwgJ29uIHlvdXIgQmFjaycpKSB7XG4gICAgICB0aGlzT3V0cHV0ID0gdGhpc091dHB1dC5zcGxpdCgnb24geW91ciBCYWNrJykuam9pbignYmVoaW5kIHlvdScpO1xuICAgIH1cblxuICAgIC8vIEJhZDogIGdvIFJpZ2h0XG4gICAgLy8gR29vZDogdHVybiBSaWdodFxuICAgIGlmKF9fLnN0cmluZ0NvbnRhaW5zU3RyaW5nKHRoaXNPdXRwdXQsICdnbyBSaWdodCcpKSB7XG4gICAgICB0aGlzT3V0cHV0ID0gdGhpc091dHB1dC5zcGxpdCgnZ28gUmlnaHQnKS5qb2luKCd0dXJuIFJpZ2h0Jyk7XG4gICAgfVxuXG4gICAgLy8gQmFkOiAgZ28gTGVmdFxuICAgIC8vIEdvb2Q6IHR1cm4gTGVmdFxuICAgIGlmKF9fLnN0cmluZ0NvbnRhaW5zU3RyaW5nKHRoaXNPdXRwdXQsICdnbyBMZWZ0JykpIHtcbiAgICAgIHRoaXNPdXRwdXQgPSB0aGlzT3V0cHV0LnNwbGl0KCdnbyBMZWZ0Jykuam9pbigndHVybiBMZWZ0Jyk7XG4gICAgfVxuXG4gICAgLy8gUmV0XG4gICAgcmV0dXJuIHRoaXNPdXRwdXQ7XG4gIH07XG5cbn07XG4iLCIndXNlIHN0cmljdCdcbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgdXRpbGl0eSBmdW5jdGlvbnMgKi9cbmNsYXNzIFV0aWxpdHkge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBVdGlsaXR5IG1ldGhvZCBzZXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY2FuIG9ubHkgYmUgdXNlZCBpbiB0aGUgYnJvd3NlciwgdXNlZCB0byBkZWNvZGUgYW55IEhUTUwgZW50aXRpZXMgZm91bmQgaW4gc3RyaW5nc1xuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBVdGlsaXR5IDo6IENhbm5vdCBEZWNvZGUgSFRNTCBlbnRpdGVzIG91dHNpZGUgb2YgYnJvd3NlclxuICAgKiBAcGFyYW0gc3RyIC0gc3RyaW5nIHRvIGRlY29kZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIFN0cmluZyB3aXRoIEhUTUwgZW50aXR5IGRlY29kZWRcbiAgICovXG4gIGRlY29kZUVudGl0aWVzKHN0cikge1xuICAgIHRyeSB7XG4gICAgICAvLyB0aGlzIHByZXZlbnRzIGFueSBvdmVyaGVhZCBmcm9tIGNyZWF0aW5nIHRoZSBvYmplY3QgZWFjaCB0aW1lXG4gICAgICBpZighdGhpcy5lbGVtZW50RGVjb2RlcikgdGhpcy5lbGVtZW50RGVjb2RlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICBpZihzdHIgJiYgdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gc3RyaXAgc2NyaXB0L2h0bWwgdGFnc1xuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudERlY29kZXI7XG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC88c2NyaXB0W14+XSo+KFtcXFNcXHNdKj8pPFxcL3NjcmlwdD4vZ21pLCAnJyk7XG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC88XFwvP1xcdyg/OlteXCInPl18XCJbXlwiXSpcInwnW14nXSonKSo+L2dtaSwgJycpO1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHN0cjtcbiAgICAgICAgc3RyID0gZWxlbWVudC50ZXh0Q29udGVudDtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVXRpbGl0eSA6OiBDYW5ub3QgRGVjb2RlIEhUTUwgZW50aXRlcyBvdXRzaWRlIG9mIGJyb3dzZXInKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gbWF0cml4IC0gQ3NzIHRyYW5zZm9ybSBtYXRyaXggdmFsdWU6IG1hdHJpeChhLGIsYyxkLGUsZilcbiAgICogQHJldHVybnMgbnVtYmVyXG4gICAqL1xuICBnZXRTY2FsZUZyb21NYXRyaXgobXgpIHtcbiAgICBpZighbXggfHwgbXguY29uc3RydWN0b3IgIT09IFN0cmluZykgcmV0dXJuIDE7XG4gICAgbGV0IHZhbHVlcywgYTtcbiAgICB2YWx1ZXMgPSBteC5zcGxpdCgnKCcpWzFdLnNwbGl0KCcpJylbMF0uc3BsaXQoJyAnKTtcbiAgICBhID0gcGFyc2VGbG9hdCh2YWx1ZXNbMF0pO1xuICAgIHJldHVybiBhO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtYXRyaXggLSBDc3MgdHJhbnNmb3JtIG1hdHJpeCB2YWx1ZTogbWF0cml4KGEsYixjLGQsZSxmKVxuICAgKiBAcmV0dXJucyBudW1iZXJcbiAgICovXG4gIGdldFJvdGF0aW9uRnJvbU1hdHJpeChteCkge1xuICAgIGlmKCFteCB8fCBteC5jb25zdHJ1Y3RvciAhPT0gU3RyaW5nKSByZXR1cm4gMDtcbiAgICBsZXQgdmFsdWVzLCBhLCBiO1xuICAgIHZhbHVlcyA9IG14LnNwbGl0KCcoJylbMV0uc3BsaXQoJyknKVswXS5zcGxpdCgnICcpO1xuICAgIGEgPSBwYXJzZUZsb2F0KHZhbHVlc1swXSk7XG4gICAgYiA9IHBhcnNlRmxvYXQodmFsdWVzWzFdKTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChNYXRoLmF0YW4yKGIsIGEpICogKDE4MCAvIE1hdGguUEkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludDEgLSBGcmlzdCBwb2ludFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9pbnQxLnggLSBYIGNvb3JkaW5hdGUgb2YgZmlyc3QgcG9pbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvaW50MS55IC0gWSBjb29yZGluYXRlIG9mIGZpcnN0IHBvaW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludDIgLSBTZWNvbmQgcG9pbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50Mi54IC0gWCBjb29yZGluYXRlIG9mIHNlY29uZCBwb2ludFxuICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnQyLnkgLSBZIGNvb3JkaW5hdGUgb2Ygc2Vjb25kIHBvaW50XG4gICAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXG4gICAqL1xuICBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMocG9pbnQxLCBwb2ludDIpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChwb2ludDIueCAtIHBvaW50MS54KSwgMikgKyBNYXRoLnBvdygocG9pbnQyLnkgLSBwb2ludDEueSksIDIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZXR1cm4gYXJyYXkgb2YgYXNzb2NpYXRpb25zIGFzc29jaWF0ZWQgd2l0aCBhbiBlbnRpdHlJZFxuICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSAtIFRoZSBhcnJheSBvZiBvYmplY3RzIHlvdSB3aXNoIHRvIHNlYXJjaC4gVGhpcyBtZXRob2Qgd2lsbCBzY2FuIGFsbCBwcm9wZXJ0aWVzIHdpdGggdGhlIHR5cGUgb2Ygc3RyaW5nLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIC0gVGhlIHF1ZXJ5IHRvIHJldHVybiByZXN1bHRzIGJ5LlxuICAgKiBAcGFyYW0ge0FycmF5fSBoaWdoUmFua1Byb3BlcnRpZXMgLSBUaGlzIHdpbGwgYWRkIG1vcmUgcG9pbnRzIHRvIGFuIG9iamVjdCBjb250YWluaW5nIGEgbWF0Y2ggaW5zaWRlIHRoaXMgcHJvcGVydHkuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSByZXN1bHRzIC0gVGhlIGFtb3VudCBvZiByZXN1bHRzIHRvIGJlIHJldHVybmVkLlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiAvL1N0cmluZyB0byBzZWFyY2ggYnlcbiAgICogbGV0IHF1ZXJ5ID0gJ215IHF1ZXJ5JztcbiAgICpcbiAgICogLy9TZWFyY2ggYWxsIGRlc3RpbmF0aW9uc1xuICAgKiBsZXQgdG9RdWVyeSA9IGptYXAuRGVzdGluYXRpb25Db2xsZWN0aW9uLmdldEFsbCgpXG4gICAqXG4gICAqIC8vQW1vdW50IG9mIHNlYXJjaCByZXN1bHRzXG4gICAqIHZhciBhbW91bnQgPSA1O1xuICAgKlxuICAgKiAvL0lmIG9iamVjdCBjb250YWlucyBhIG1hdGNoIGluc2lkZSB0aGlzIHByb3BlcnR5LFxuICAgKiAvL2l0IHdpbGwgc2NvcmUgaGlnaGVyIGFzIGEgcmVzdWx0LlxuICAgKiB2YXIgaGlnaFJhbmtQcm9wZXJ0aWVzID0gWyduYW1lJywgJ2tleXdvcmRzJ107XG4gICAqIHZhciByZXN1bHRzID0gSk1hcC51dGlsLmdldE9iamVjdHNJbkFycmF5QnlTdHJpbmcodG9RdWVyeSwgcXVlcnksIGhpZ2hSYW5rUHJvcGVydGllcywgYW1vdW50KTtcbiAgICpcbiAgICogY29uc29sZS5sb2cocmVzdWx0cykgLy8tPiBBcnJheSBvZiBkZXN0aW5hdGlvbnMgbWF0Y2hpbmcgJ215IHF1ZXJ5J1xuICAgKlxuICAgKiBAcmV0dXJuIHtBcnJheX0gRmlsdGVyZWQgQXJyYXkgb2YgcGFzc2VkIGluIG9iamVjdHNcbiAgICovXG4gIGdldE9iamVjdHNJbkFycmF5QnlTdHJpbmcoYXJyYXksIHF1ZXJ5LCBoaWdoUmFua1Byb3BlcnRpZXMsIG1heFJlc3VsdHMpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5LnRyaW0oKTtcbiAgICBpZihxdWVyeSA9PT0gJycpIHJldHVybiBbXTtcbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGxldCBkb2VzTWF0Y2ggPSBbXTtcbiAgICBpZighaGlnaFJhbmtQcm9wZXJ0aWVzKSBoaWdoUmFua1Byb3BlcnRpZXMgPSBbXTtcbiAgICBpZighbWF4UmVzdWx0cykgbWF4UmVzdWx0cyA9IDU7XG5cbiAgICBmdW5jdGlvbiBnZXRQcm9wZXJ0eVNjb3JlKF9pdGVtLCBfcHJvcCwgX3F1ZXJ5KSB7XG4gICAgICBsZXQgc2NvcmUgPSAwO1xuXG4gICAgICBsZXQgcXVlcnlQYXR0ZXJuID0gbmV3IFJlZ0V4cChfcXVlcnkudG9Mb3dlckNhc2UoKSk7XG5cbiAgICAgIC8vUG9zaXRpb24gb2YgcXVlcnkgaW5zaWRlIHByb3BlcnR5IHZhbHVlXG4gICAgICBsZXQgcXVlcnlJbmRleCA9IF9pdGVtW19wcm9wXS50b0xvd2VyQ2FzZSgpLnNlYXJjaChxdWVyeVBhdHRlcm4pO1xuXG4gICAgICAvL0lmIHByb3BlcnR5IGNvbnRhaW5zIHF1ZXJ5LCBhZGQgb25lIHBvaW50LlxuICAgICAgaWYocXVlcnlJbmRleCA8IDApIHJldHVybiAwO1xuICAgICAgZWxzZSBzY29yZSsrO1xuXG4gICAgICAvL0lmIHF1ZXJ5IGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgc3RyaW5nLCBhZGQgNSBwb2ludHNcbiAgICAgIGlmKHF1ZXJ5SW5kZXggPT09IDApIHNjb3JlKys7XG5cbiAgICAgIC8vR2V0cyB0aGUgcGVyY2VudGFnZSBvZiB0aGUgaW5kZXggY29tcGFyZWQgdG8gdGhlIHByb3BlcnR5Lmxlbmd0aCBhbmQgc3VidHJhY3RzIHRoYXQgYnkgMSBhbmQgYWRkcyB0aGF0IHZhbHVlIHRvIHNjb3JlXG4gICAgICBsZXQgaW5kZXhQZXJjZW50YWdlID0gMSAtIChxdWVyeUluZGV4IC8gX2l0ZW1bX3Byb3BdLmxlbmd0aCk7XG4gICAgICBzY29yZSArPSBpbmRleFBlcmNlbnRhZ2U7XG5cbiAgICAgIC8vR2V0cyB0aGUgcGVyY2VudGFnZSBvZiB0aGUgcXVlcnkubGVuZ3RoIGNvbXBhcmVkIHRvIHRoZSBwcm9wZXJ0eS5sZW5ndGggYW5kIGFkZHMgdGhhdCB0byB0aGUgc2NvcmUuXG4gICAgICBsZXQgbGVuZ3RoUGVyY2VudGFnZSA9IF9xdWVyeS5sZW5ndGggLyBfaXRlbVtfcHJvcF0ubGVuZ3RoO1xuICAgICAgc2NvcmUgKz0gbGVuZ3RoUGVyY2VudGFnZTtcblxuICAgICAgLy9JZiBwcm9wZXJ0eSBpcyBpbnNpZGUgYSBoaWdoIHJhbmtpbmcgcHJvcGVydHksIGFkZCBtb3JlIHBvaW50cy5cbiAgICAgIGhpZ2hSYW5rUHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGlmKF9wcm9wLnRvTG93ZXJDYXNlKCkgPT09IHByb3AudG9Mb3dlckNhc2UoKSkgc2NvcmUrKztcbiAgICAgICAgaWYocXVlcnlJbmRleCA9PT0gMCkgc2NvcmUrKzsgLy9SZXBlYXRlZC5cbiAgICAgIH0pO1xuXG4gICAgICAvL0lmIHByb3BlcnR5IGlzIGEgZGVzdGluYXRpb24gYW5kIGhhcyBhIHNwb25zb3JlZFJhdGluZyBhZGQgcGVyY2VudGFnZSB0byBzY29yZTtcbiAgICAgIGlmKF9wcm9wID09PSAnc3BvbnNvcmVkUmF0aW5nJykgc2NvcmUgKz0gKF9pdGVtW19wcm9wXSAvIDEwMCk7XG5cbiAgICAgIHJldHVybiBzY29yZTtcbiAgICB9XG5cbiAgICAvL0xvb3AgdGhyb3VnaCBhbGwgb2JqZWN0cyBpbiBhcnJheVxuICAgIGFycmF5LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICBmb3IobGV0IHByb3AgaW4gaXRlbSkge1xuICAgICAgICBpZighaXRlbS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkgY29udGludWU7XG4gICAgICAgIGlmKHR5cGVvZiBpdGVtW3Byb3BdICE9ICdzdHJpbmcnKSBjb250aW51ZTtcblxuICAgICAgICAvL0dldCBTY29yZSBmb3IgZW50aXJlIHF1ZXJ5XG4gICAgICAgIHNjb3JlICs9IGdldFByb3BlcnR5U2NvcmUoaXRlbSwgcHJvcCwgcXVlcnkpO1xuXG4gICAgICAgIC8vSWYgcXVlcnkgaXMgbXVsdGlwbGUgd29yZHMsIGdldCBzY29yZSBmb3IgZWFjaCB3b3JkLlxuICAgICAgICBsZXQgc3BsaXRRdWVyeSA9IHF1ZXJ5LnNwbGl0KCcgJyk7XG4gICAgICAgIGlmKHNwbGl0UXVlcnkubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzcGxpdFF1ZXJ5Lmxlbmd0aDsgaSsrKSBzY29yZSArPSBnZXRQcm9wZXJ0eVNjb3JlKGl0ZW0sIHByb3AsIHNwbGl0UXVlcnlbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihzY29yZSA+IDApIHtcbiAgICAgICAgZG9lc01hdGNoLnB1c2goe1xuICAgICAgICAgIHNjb3JlOiBzY29yZSxcbiAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9Tb3J0IG1hdGNoaW5nIG9iamVjdHMgYnkgc2NvcmUuXG4gICAgZG9lc01hdGNoLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmKGEuc2NvcmUgPiBiLnNjb3JlKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIGlmKGEuc2NvcmUgPCBiLnNjb3JlKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG5cbiAgICAvL0FkZCBpdGVtcyB1bnRpbCBtYXhSZXN1bHRzIGFjaGlldmVkLlxuICAgIGZvcihsZXQgbSA9IDA7IG0gPCBkb2VzTWF0Y2gubGVuZ3RoOyBtKyspIHtcbiAgICAgIGlmKG0gPT09IG1heFJlc3VsdHMpIGJyZWFrO1xuICAgICAgcmVzdWx0cy5wdXNoKGRvZXNNYXRjaFttXS5pdGVtKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0eVxuIiwiJ3VzZSBzdHJpY3QnXG5jbGFzcyBBU19FZGdlIHtcbiAgY29uc3RydWN0b3IoaWQsIG5vZGVJZHMsIHR5cGUsIGNvc3QsIGFjYywgc3BlZWQsIGRpcmVjdGlvbikge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLm5vZGVzID0gbm9kZUlkcztcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuY29zdCA9IGNvc3Q7XG4gICAgdGhpcy5hY2MgPSBhY2M7XG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQVNfRWRnZTtcbiIsIid1c2Ugc3RyaWN0J1xuY29uc3QgQVNfTm9kZSA9IHJlcXVpcmUoJy4vQVNfTm9kZS5qcycpO1xuY29uc3QgQVNfRWRnZSA9IHJlcXVpcmUoJy4vQVNfRWRnZS5qcycpO1xuXG5jbGFzcyBBU19HcmlkIHtcbiAgY29uc3RydWN0b3Iod2F5cG9pbnRzLCBwYXRocywgcGF0aFR5cGVzLCBtYXBzKSB7XG4gICAgbGV0IHNldHRpbmdzID0ge1xuICAgICAgdmVydGljYWxTY2FsZTogMTAwXG4gICAgfTtcblxuICAgIHRoaXMud2F5cG9pbnRzID0gd2F5cG9pbnRzO1xuICAgIHRoaXMucGF0aHMgPSBwYXRocztcbiAgICB0aGlzLnBhdGhUeXBlcyA9IHBhdGhUeXBlcztcbiAgICB0aGlzLm1hcHMgPSBtYXBzO1xuICAgIHRoaXMudmVydGljYWxTY2FsZSA9IHNldHRpbmdzLnZlcnRpY2FsU2NhbGU7XG4gICAgdGhpcy5tb3ZlclR5cGVzID0gW107XG4gICAgdGhpcy5ub2RlcyA9IFtdO1xuICAgIHRoaXMuZWRnZXMgPSBbXTtcblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB3YXlwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBlZGdlcyA9IHRoaXMuZ2VuZXJhdGVFZGdlcyh3YXlwb2ludHNbaV0uaWQpO1xuICAgICAgbGV0IG5laWdoYm9ycyA9IHRoaXMuZ2VuZXJhdGVOZWlnaGJvcnMod2F5cG9pbnRzW2ldLmlkLCBlZGdlcyk7XG4gICAgICBsZXQgbm9kZSA9IG5ldyBBU19Ob2RlKHdheXBvaW50c1tpXS5pZCwgd2F5cG9pbnRzW2ldLngsIHdheXBvaW50c1tpXS55LCB0aGlzLmdldE1hcFpWYWx1ZSh0aGlzLndheXBvaW50c1tpXS5tYXBJZCksIHRoaXMud2F5cG9pbnRzW2ldLmRlY2lzaW9uUG9pbnQsIHRoaXMud2F5cG9pbnRzW2ldLm1hcElkLCBlZGdlcywgbmVpZ2hib3JzKTtcbiAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcbiAgICB9XG5cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXRoVHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHRoaXMucGF0aFR5cGVzW2ldLnBhdGhUeXBlSWQgIT0gMSkge1xuICAgICAgICBsZXQgcGF0aFR5cGVJbWcgPSAnJztcbiAgICAgICAgaWYodGhpcy5wYXRoVHlwZXNbaV0ucGF0aHR5cGVVcmkgJiYgdGhpcy5wYXRoVHlwZXNbaV0ucGF0aHR5cGVVcmlbMF0pIHBhdGhUeXBlSW1nID0gdGhpcy5wYXRoVHlwZXNbaV0ucGF0aHR5cGVVcmlbMF0udXJpO1xuICAgICAgICBsZXQgbE9iaiA9IHtcbiAgICAgICAgICBtb3ZlcklkOiB0aGlzLnBhdGhUeXBlc1tpXS5wYXRoVHlwZUlkLFxuICAgICAgICAgIHNwZWVkOiB0aGlzLnBhdGhUeXBlc1tpXS5zcGVlZCxcbiAgICAgICAgICBtYXhGbG9vcnM6IHRoaXMucGF0aFR5cGVzW2ldLm1heGZsb29ycyxcbiAgICAgICAgICBpbWFnZVBhdGg6IHBhdGhUeXBlSW1nLFxuICAgICAgICAgIGFjY2Vzc2libGl0eTogdGhpcy5wYXRoVHlwZXNbaV0uYWNjZXNzaWJpbGl0eSxcbiAgICAgICAgICB0eXBlTmFtZTogdGhpcy5wYXRoVHlwZXNbaV0udHlwZU5hbWVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5tb3ZlclR5cGVzLnB1c2gobE9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0aHNXaXRoV2F5cG9pbnQod3BpZCkge1xuICAgIGxldCBwYXRoc1JldHVybiA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IobGV0IGogPSAwOyBqIDwgdGhpcy5wYXRoc1tpXS53YXlwb2ludHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYodGhpcy5wYXRoc1tpXS53YXlwb2ludHNbal0gPT0gd3BpZCkge1xuICAgICAgICAgIHBhdGhzUmV0dXJuLnB1c2godGhpcy5wYXRoc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGhzUmV0dXJuO1xuICB9XG5cbiAgZ2V0UGF0aFR5cGVCeUlkKHBhdGhUeXBlSWQpIHtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXRoVHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHRoaXMucGF0aFR5cGVzW2ldLnBhdGhUeXBlSWQgPT0gcGF0aFR5cGVJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoVHlwZXNbaV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0V1BCeUlkKHdwaWQpIHtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy53YXlwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHRoaXMud2F5cG9pbnRzW2ldLmlkID09IHdwaWQpIHJldHVybiB0aGlzLndheXBvaW50c1tpXTtcbiAgICB9XG4gIH1cblxuICBnZW5lcmF0ZUVkZ2VzKHdwaWQpIHtcbiAgICBsZXQgcGF0aHMgPSB0aGlzLmdldFBhdGhzV2l0aFdheXBvaW50KHdwaWQpO1xuICAgIGxldCByZXR1cm5BcnJheSA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYocGF0aHNbaV0uc3RhdHVzICE9PSAwKSB7XG4gICAgICAgIGxldCBwYXRoVHlwZSA9IHRoaXMuZ2V0UGF0aFR5cGVCeUlkKHBhdGhzW2ldLnR5cGUpO1xuICAgICAgICBsZXQgZWRnZSA9IG5ldyBBU19FZGdlKHBhdGhzW2ldLmlkLCBwYXRoc1tpXS53YXlwb2ludHMsIHBhdGhzW2ldLnR5cGUsIHBhdGhUeXBlLndlaWdodCwgcGF0aFR5cGUuYWNjZXNzaWJpbGl0eSwgcGF0aFR5cGUuc3BlZWQsIHBhdGhzW2ldLmRpcmVjdGlvbik7XG4gICAgICAgIHJldHVybkFycmF5LnB1c2goZWRnZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5BcnJheTtcbiAgfVxuXG4gIGdlbmVyYXRlTmVpZ2hib3JzKHdwaWQsIGVkZ2VzKSB7XG4gICAgbGV0IG5laWdoYm9ycyA9IFtdO1xuICAgIGxldCBzcmNXUCA9IHRoaXMuZ2V0V1BCeUlkKHdwaWQpO1xuICAgIGxldCBzcmNXUFBvcyA9IHtcbiAgICAgIHg6IHNyY1dQLngsXG4gICAgICB5OiBzcmNXUC55LFxuICAgICAgejogdGhpcy5nZXRNYXBaVmFsdWUoc3JjV1AubWFwSWQpXG4gICAgfTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgZWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjdXJyZW50RWRnZSA9IGVkZ2VzW2ldO1xuICAgICAgZm9yKGxldCBqID0gMDsgaiA8IGN1cnJlbnRFZGdlLm5vZGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmKGN1cnJlbnRFZGdlLm5vZGVzW2pdID09IHdwaWQpIGNvbnRpbnVlO1xuICAgICAgICBsZXQgY3VycmVudFdQID0gdGhpcy5nZXRXUEJ5SWQoY3VycmVudEVkZ2Uubm9kZXNbal0pO1xuICAgICAgICBsZXQgd3BTdGFydCA9IHtcbiAgICAgICAgICB4OiBjdXJyZW50V1AueCxcbiAgICAgICAgICB5OiBjdXJyZW50V1AueSxcbiAgICAgICAgICB6OiB0aGlzLmdldE1hcFpWYWx1ZShjdXJyZW50V1AubWFwSWQpXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGRpc3RhbmNlID0gdGhpcy5oZXVyaXN0aWMod3BTdGFydCwgc3JjV1BQb3MpO1xuXG4gICAgICAgIGxldCBmbG9vclByZWYgPSAxO1xuICAgICAgICBpZihzcmNXUFBvcy56ID09IHdwU3RhcnQueikge1xuICAgICAgICAgIGZsb29yUHJlZiA9IHRoaXMuZ2V0Rmxvb3JQcmVmZXJlbmNlTXVsdGlwbGllcihjdXJyZW50V1AubWFwSWQpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgaWYoY3VycmVudEVkZ2UuZGlyZWN0aW9uICE9PSAwKSB7XG4gICAgICAgICAgICBpZihjdXJyZW50RWRnZS5kaXJlY3Rpb24gPT0gMSkge1xuICAgICAgICAgICAgICBpZihzcmNXUFBvcy56ID4gd3BTdGFydC56KSBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihjdXJyZW50RWRnZS5kaXJlY3Rpb24gPT0gMikge1xuICAgICAgICAgICAgICBpZihzcmNXUFBvcy56IDwgd3BTdGFydC56KSBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdG90YWxDb3N0ID0gKChkaXN0YW5jZSAqIGN1cnJlbnRFZGdlLmNvc3QpICogZmxvb3JQcmVmKSAqICgoTWF0aC5hYnMod3BTdGFydC56IC0gc3JjV1BQb3MueikgLyBjdXJyZW50RWRnZS5zcGVlZCkgKyAxKTtcblxuICAgICAgICBsZXQgbmVpZ2hib3IgPSB7XG4gICAgICAgICAgaWQ6IGN1cnJlbnRXUC5pZCxcbiAgICAgICAgICBjb3N0OiB0b3RhbENvc3QsXG4gICAgICAgICAgYWNjOiBjdXJyZW50RWRnZS5hY2MsXG4gICAgICAgICAgZWRnZUlkOiBjdXJyZW50RWRnZS5pZCxcbiAgICAgICAgICBlZGdlVHlwZUlkOiBjdXJyZW50RWRnZS50eXBlLFxuICAgICAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZSxcbiAgICAgICAgICB4OiBjdXJyZW50V1AueCxcbiAgICAgICAgICB5OiBjdXJyZW50V1AueSxcbiAgICAgICAgICB6OiB0aGlzLmdldE1hcFpWYWx1ZShjdXJyZW50V1AubWFwSWQpXG4gICAgICAgIH07XG4gICAgICAgIG5laWdoYm9ycy5wdXNoKG5laWdoYm9yKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5laWdoYm9ycztcbiAgfVxuXG4gIGdldEZsb29yUHJlZmVyZW5jZU11bHRpcGxpZXIobWFwSWQpIHtcbiAgICBsZXQgY3VycmVudE11bHRpcGxpZXIgPSAxO1xuICAgIGlmKHRoaXMubWFwcykge1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMubWFwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZih0aGlzLm1hcHNbaV0ubWFwSWQgPT0gbWFwSWQpIHtcbiAgICAgICAgICBpZighdGhpcy5tYXBzW2ldLnByZWZlcmVuY2UpIGJyZWFrO1xuICAgICAgICAgIGlmKHRoaXMubWFwc1tpXS5wcmVmZXJlbmNlID09PSAwKSB7XG4gICAgICAgICAgICBjdXJyZW50TXVsdGlwbGllciA9IDE7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoaXMubWFwc1tpXS5wcmVmZXJlbmNlID4gMCkge1xuICAgICAgICAgICAgY3VycmVudE11bHRpcGxpZXIgPSBjdXJyZW50TXVsdGlwbGllciAvICh0aGlzLm1hcHNbaV0ucHJlZmVyZW5jZSArIDEpO1xuICAgICAgICAgIH0gZWxzZSBpZih0aGlzLm1hcHNbaV0ucHJlZmVyZW5jZSA8IDApIHtcbiAgICAgICAgICAgIGN1cnJlbnRNdWx0aXBsaWVyID0gY3VycmVudE11bHRpcGxpZXIgKiAoTWF0aC5hYnModGhpcy5tYXBzW2ldLnByZWZlcmVuY2UpICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50TXVsdGlwbGllcjtcbiAgfVxuXG4gIGdldE1hcFpWYWx1ZShtYXBJZCkge1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLm1hcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHRoaXMubWFwc1tpXS5tYXBJZCA9PSBtYXBJZCkge1xuICAgICAgICByZXR1cm4odGhpcy5tYXBzW2ldLmZsb29yU2VxdWVuY2UgKiB0aGlzLnZlcnRpY2FsU2NhbGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGhldXJpc3RpYyhzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdygoc3RhcnQueCAtIGVuZC54KSwgMikgKyBNYXRoLnBvdygoc3RhcnQueSAtIGVuZC55KSwgMikgKyBNYXRoLnBvdygoc3RhcnQueiAtIGVuZC56KSwgMikpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQVNfR3JpZDtcbiIsIid1c2Ugc3RyaWN0J1xuY2xhc3MgQVNfTm9kZSB7XG4gIGNvbnN0cnVjdG9yKGlkLCB4LCB5LCB6LCBkZWNpc2lvblBvaW50LCBtYXBJZCwgZWRnZXMsIG5laWdoYm9ycykge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy56ID0gejtcbiAgICB0aGlzLmRlY2lzaW9uUG9pbnQgPSBkZWNpc2lvblBvaW50O1xuICAgIHRoaXMubWFwSWQgPSBtYXBJZDtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gICAgdGhpcy5mID0gMDtcbiAgICB0aGlzLmcgPSAwO1xuICAgIHRoaXMuaCA9IDA7XG4gICAgdGhpcy52aXNpdGVkID0gZmFsc2U7XG4gICAgdGhpcy5jbG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgdGhpcy5uZWlnaGJvcnMgPSBuZWlnaGJvcnM7XG4gICAgdGhpcy51c2VkRWRnZVR5cGVJZCA9IG51bGw7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBU19Ob2RlO1xuIiwiJ3VzZSBzdHJpY3QnXG5jb25zdCBCaW5hcnlIZWFwID0gcmVxdWlyZSgnLi9CaW5hcnlIZWFwJylcbmNvbnN0IEFTX0dyaWQgPSByZXF1aXJlKCcuL0FTX0dyaWQnKVxuY29uc3QgV2F5ZmluZGVyRGF0YSA9IHJlcXVpcmUoJy4vV2F5ZmluZGVyRGF0YScpXG5cbmNsYXNzIEFTX1NlYXJjaCB7XG5cbiAgY29uc3RydWN0b3Iod2F5cG9pbnRzLCBwYXRocywgcGF0aFR5cGVzLCBtYXBzKSB7XG4gICAgdGhpcy5ncmlkID0gbmV3IEFTX0dyaWQod2F5cG9pbnRzLCBwYXRocywgcGF0aFR5cGVzLCBtYXBzKVxuICB9XG5cbiAgc2VhcmNoKGZyb20sIHRvLCBhY2Nlc3NMZXZlbCkge1xuICAgIHRoaXMuY2xlYW5HcmlkKClcbiAgICBsZXQgc3RhcnQgPSB0aGlzLmdldE5vZGVCeUlkKGZyb20pXG4gICAgbGV0IGVuZCA9IHRoaXMuZ2V0Tm9kZUJ5SWQodG8pXG4gICAgbGV0IG9wZW5TdGFydEhlYXAgPSB0aGlzLmdldEhlYXAoKVxuXG4gICAgc3RhcnQuaCA9IDBcbiAgICBvcGVuU3RhcnRIZWFwLnB1c2goc3RhcnQpXG5cbiAgICB3aGlsZShvcGVuU3RhcnRIZWFwLnNpemUoKSA+IDApIHtcbiAgICAgIGxldCBjdXJyZW50Tm9kZSA9IG9wZW5TdGFydEhlYXAucG9wKClcblxuICAgICAgaWYoY3VycmVudE5vZGUgPT09IGVuZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoVG8oY3VycmVudE5vZGUsIHN0YXJ0KVxuICAgICAgfVxuXG4gICAgICBjdXJyZW50Tm9kZS5jbG9zZWQgPSB0cnVlXG5cbiAgICAgIGxldCBuZWlnaGJvcnMgPSB0aGlzLmdldE5laWdoYm9ycyhjdXJyZW50Tm9kZSlcblxuICAgICAgZm9yKGxldCBpID0gMCwgaWwgPSBuZWlnaGJvcnMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgICAgICBsZXQgbmVpZ2hib3IgPSBuZWlnaGJvcnNbaV1cbiAgICAgICAgbGV0IG5laWdoYm9yTm9kZSA9IHRoaXMuZ2V0TmVpZ2hib3JOb2RlT2JqZWN0KG5laWdoYm9yLmlkKVxuXG4gICAgICAgIGlmKG5laWdoYm9yLmFjYyA+IGFjY2Vzc0xldmVsKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoZXVyID0gMFxuXG4gICAgICAgIGlmKG5laWdoYm9yTm9kZS5jbG9zZWQpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGdTY29yZSA9IGN1cnJlbnROb2RlLmcgKyB0aGlzLmdldE5laWdoYm9yQ29zdChuZWlnaGJvcilcbiAgICAgICAgbGV0IGJlZW5WaXNpdGVkID0gbmVpZ2hib3JOb2RlLnZpc2l0ZWRcblxuICAgICAgICBpZighYmVlblZpc2l0ZWQgfHwgKChnU2NvcmUgKyBoZXVyKSA8IG5laWdoYm9yTm9kZS5mKSkge1xuICAgICAgICAgIG5laWdoYm9yTm9kZS52aXNpdGVkID0gdHJ1ZVxuICAgICAgICAgIG5laWdoYm9yTm9kZS5wYXJlbnQgPSBjdXJyZW50Tm9kZVxuICAgICAgICAgIG5laWdoYm9yTm9kZS5oID0gaGV1clxuICAgICAgICAgIG5laWdoYm9yTm9kZS5nID0gZ1Njb3JlXG4gICAgICAgICAgbmVpZ2hib3JOb2RlLmYgPSBuZWlnaGJvck5vZGUuZyArIGhldXJcbiAgICAgICAgICBuZWlnaGJvck5vZGUudXNlZEVkZ2VUeXBlSWQgPSBuZWlnaGJvci5lZGdlVHlwZUlkXG5cbiAgICAgICAgICBpZighYmVlblZpc2l0ZWQpIHtcbiAgICAgICAgICAgIG9wZW5TdGFydEhlYXAucHVzaChuZWlnaGJvck5vZGUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9wZW5TdGFydEhlYXAucmVzY29yZUVsZW1lbnQobmVpZ2hib3JOb2RlKVxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW11cblxuICB9XG5cbiAgY2xlYW5Ob2RlKG5vZGUpIHtcbiAgICBub2RlLmYgPSAwXG4gICAgbm9kZS5nID0gMFxuICAgIG5vZGUuaCA9IDBcbiAgICBub2RlLnZpc2l0ZWQgPSBmYWxzZVxuICAgIG5vZGUuY2xvc2VkID0gZmFsc2VcbiAgICBub2RlLnBhcmVudCA9IG51bGxcbiAgICBub2RlLnVzZWRFZGdlVHlwZUlkID0gbnVsbFxuICB9XG5cbiAgY2xlYW5HcmlkKCkge1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWQubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY2xlYW5Ob2RlKHRoaXMuZ3JpZC5ub2Rlc1tpXSlcbiAgICB9XG4gIH1cblxuICBnZXROb2RlQnlJZChpZCkge1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWQubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKGlkID09IHRoaXMuZ3JpZC5ub2Rlc1tpXS5pZCkgcmV0dXJuIHRoaXMuZ3JpZC5ub2Rlc1tpXVxuICAgIH1cbiAgfVxuXG4gIGdldEhlYXAoKSB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlIZWFwKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHJldHVybiBub2RlLmZcbiAgICB9KTtcbiAgfVxuXG4gIHBhdGhUbyhub2RlLCBzdGFydCkge1xuICAgIGxldCBjdXJyID0gbm9kZSxcbiAgICAgIHBhdGggPSBbXTtcbiAgICB3aGlsZShjdXJyLnBhcmVudCkge1xuICAgICAgcGF0aC5wdXNoKGN1cnIpXG4gICAgICBjdXJyID0gY3Vyci5wYXJlbnRcbiAgICB9XG4gICAgcGF0aC5wdXNoKHN0YXJ0KVxuICAgIHBhdGggPSBwYXRoLnJldmVyc2UoKVxuXG4gICAgbGV0IGZsb29yQXJyYXkgPSBbXVxuICAgIGxldCBjdXJyZW50Rmxvb3IgPSBbXVxuICAgIGxldCBjdXJyZW50Rmxvb3JJZCA9IC0xXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcblxuICAgICAgaWYoaSA9PT0gMCkge1xuICAgICAgICBjdXJyZW50Rmxvb3JJZCA9IHBhdGhbaV0ubWFwSWRcbiAgICAgIH1cblxuICAgICAgaWYocGF0aFtpXS5tYXBJZCAhPSBjdXJyZW50Rmxvb3JJZCkge1xuICAgICAgICBsZXQgcG9pbnRTZXQgPSBuZXcgV2F5ZmluZGVyRGF0YSh7XG4gICAgICAgICAgc2VxOiAocGF0aFtpIC0gMV0ueiAvIHRoaXMuZ3JpZC52ZXJ0aWNhbFNjYWxlKSxcbiAgICAgICAgICBtYXBJZDogY3VycmVudEZsb29ySWQsXG4gICAgICAgICAgbW92ZXI6IHRoaXMuZ2V0UGF0aFR5cGVCeUlkKHBhdGhbaV0udXNlZEVkZ2VUeXBlSWQpLFxuICAgICAgICAgIHBvaW50czogY3VycmVudEZsb29yLnNsaWNlKDApLFxuICAgICAgICAgIGNvc3Q6IHBhdGhbaV0uZlxuICAgICAgICB9KVxuXG4gICAgICAgIGZsb29yQXJyYXkucHVzaChwb2ludFNldClcbiAgICAgICAgY3VycmVudEZsb29yID0gW11cbiAgICAgICAgY3VycmVudEZsb29ySWQgPSBwYXRoW2ldLm1hcElkXG4gICAgICB9XG5cbiAgICAgIC8vTk9URTogVXNpbmcgZW50aXJlIHBhdGggb2JqZWN0LCBpdCBpcyBuZWVkZWQgZm9yIFRleHRkaXJlY3Rpb25zLlxuICAgICAgY3VycmVudEZsb29yLnB1c2gocGF0aFtpXSlcblxuICAgICAgaWYoaSA9PSBwYXRoLmxlbmd0aCAtIDEpIHtcblxuICAgICAgICBsZXQgcG9pbnRTZXQgPSBuZXcgV2F5ZmluZGVyRGF0YSh7XG4gICAgICAgICAgc2VxOiAocGF0aFtpXS56IC8gdGhpcy5ncmlkLnZlcnRpY2FsU2NhbGUpLFxuICAgICAgICAgIG1hcElkOiBjdXJyZW50Rmxvb3JJZCxcbiAgICAgICAgICBtb3ZlcjogdGhpcy5nZXRQYXRoVHlwZUJ5SWQocGF0aFtpXS51c2VkRWRnZVR5cGVJZCksXG4gICAgICAgICAgcG9pbnRzOiBjdXJyZW50Rmxvb3IsXG4gICAgICAgICAgY29zdDogcGF0aFtpXS5mXG4gICAgICAgIH0pXG5cbiAgICAgICAgZmxvb3JBcnJheS5wdXNoKHBvaW50U2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmxvb3JBcnJheVxuICB9XG5cbiAgZ2V0TmVpZ2hib3JzKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZWlnaGJvcnNcbiAgfVxuXG4gIGdldE5laWdoYm9yTm9kZU9iamVjdChpZCkge1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWQubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKGlkID09IHRoaXMuZ3JpZC5ub2Rlc1tpXS5pZCkgcmV0dXJuIHRoaXMuZ3JpZC5ub2Rlc1tpXVxuICAgIH1cbiAgfVxuXG4gIGdldE5laWdoYm9yQ29zdChuZWlnaGJvcikge1xuICAgIHJldHVybiBuZWlnaGJvci5jb3N0XG4gIH1cblxuICBnZXRQYXRoVHlwZUJ5SWQodHlwZUlkKSB7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZC5tb3ZlclR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih0aGlzLmdyaWQubW92ZXJUeXBlc1tpXS5tb3ZlcklkID09IHR5cGVJZCkgcmV0dXJuIHRoaXMuZ3JpZC5tb3ZlclR5cGVzW2ldXG4gICAgfVxuICAgIHJldHVybiBudWxsXG5cbiAgfVxuXG4gIGhldXJpc3RpYyhzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHN0YXJ0LnggLSBlbmQueCkgKyBNYXRoLmFicyhzdGFydC55IC0gZW5kLnkpICsgTWF0aC5hYnMoc3RhcnQueiAtIGVuZC56KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBU19TZWFyY2hcbiIsIid1c2Ugc3RyaWN0J1xuLyoganNoaW50IC1XMDE2ICovXG4vL0lnbm9yZSBCaW5hcnkgU2hpZnRzXG5cbmNsYXNzIEJpbmFyeUhlYXAge1xuXG4gIGNvbnN0cnVjdG9yKHNjb3JlRnVuY3Rpb24pIHtcbiAgICB0aGlzLmNvbnRlbnQgPSBbXTtcbiAgICB0aGlzLnNjb3JlRnVuY3Rpb24gPSBzY29yZUZ1bmN0aW9uO1xuICB9XG5cbiAgcHVzaChlbGVtZW50KSB7XG4gICAgLy8gQWRkIHRoZSBuZXcgZWxlbWVudCB0byB0aGUgZW5kIG9mIHRoZSBhcnJheS5cbiAgICB0aGlzLmNvbnRlbnQucHVzaChlbGVtZW50KTtcbiAgICAvLyBBbGxvdyBpdCB0byBzaW5rIGRvd24uXG4gICAgdGhpcy5zaW5rRG93bih0aGlzLmNvbnRlbnQubGVuZ3RoIC0gMSk7XG4gIH1cblxuICBwb3AoKSB7XG4gICAgLy8gU3RvcmUgdGhlIGZpcnN0IGVsZW1lbnQgc28gd2UgY2FuIHJldHVybiBpdCBsYXRlci5cbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5jb250ZW50WzBdO1xuICAgIC8vIEdldCB0aGUgZWxlbWVudCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cbiAgICBsZXQgZW5kID0gdGhpcy5jb250ZW50LnBvcCgpO1xuICAgIC8vIElmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgbGVmdCwgcHV0IHRoZSBlbmQgZWxlbWVudCBhdCB0aGVcbiAgICAvLyBzdGFydCwgYW5kIGxldCBpdCBidWJibGUgdXAuXG4gICAgaWYodGhpcy5jb250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuY29udGVudFswXSA9IGVuZDtcbiAgICAgIHRoaXMuYnViYmxlVXAoMCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICByZW1vdmUobm9kZSkge1xuICAgIGxldCBpID0gdGhpcy5jb250ZW50LmluZGV4T2Yobm9kZSk7XG5cbiAgICAvLyBXaGVuIGl0IGlzIGZvdW5kLCB0aGUgcHJvY2VzcyBzZWVuIGluICdwb3AnIGlzIHJlcGVhdGVkXG4gICAgLy8gdG8gZmlsbCB1cCB0aGUgaG9sZS5cbiAgICBsZXQgZW5kID0gdGhpcy5jb250ZW50LnBvcCgpO1xuICAgIGlmKGkgIT09IHRoaXMuY29udGVudC5sZW5ndGggLSAxKSB7XG4gICAgICB0aGlzLmNvbnRlbnRbaV0gPSBlbmQ7XG4gICAgICBpZih0aGlzLnNjb3JlRnVuY3Rpb24oZW5kKSA8IHRoaXMuc2NvcmVGdW5jdGlvbihub2RlKSkge1xuICAgICAgICB0aGlzLnNpbmtEb3duKGkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idWJibGVVcChpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnRlbnQubGVuZ3RoO1xuICB9XG5cbiAgcmVzY29yZUVsZW1lbnQobm9kZSkge1xuICAgIHRoaXMuc2lua0Rvd24odGhpcy5jb250ZW50LmluZGV4T2Yobm9kZSkpO1xuICB9XG5cbiAgc2lua0Rvd24obikge1xuICAgIC8vIEZldGNoIHRoZSBlbGVtZW50IHRoYXQgaGFzIHRvIGJlIHN1bmsuXG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmNvbnRlbnRbbl07XG5cbiAgICAvLyBXaGVuIGF0IDAsIGFuIGVsZW1lbnQgY2FuIG5vdCBzaW5rIGFueSBmdXJ0aGVyLlxuICAgIHdoaWxlKG4gPiAwKSB7XG4gICAgICAvLyBDb21wdXRlIHRoZSBwYXJlbnQgZWxlbWVudCdzIGluZGV4LCBhbmQgZmV0Y2ggaXQuXG4gICAgICBsZXQgcGFyZW50TiA9ICgobiArIDEpID4+IDEpIC0gMSxcbiAgICAgICAgcGFyZW50ID0gdGhpcy5jb250ZW50W3BhcmVudE5dO1xuICAgICAgLy8gU3dhcCB0aGUgZWxlbWVudHMgaWYgdGhlIHBhcmVudCBpcyBncmVhdGVyLlxuICAgICAgaWYodGhpcy5zY29yZUZ1bmN0aW9uKGVsZW1lbnQpIDwgdGhpcy5zY29yZUZ1bmN0aW9uKHBhcmVudCkpIHtcbiAgICAgICAgdGhpcy5jb250ZW50W3BhcmVudE5dID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5jb250ZW50W25dID0gcGFyZW50O1xuICAgICAgICAvLyBVcGRhdGUgJ24nIHRvIGNvbnRpbnVlIGF0IHRoZSBuZXcgcG9zaXRpb24uXG4gICAgICAgIG4gPSBwYXJlbnROO1xuICAgICAgfVxuICAgICAgLy8gRm91bmQgYSBwYXJlbnQgdGhhdCBpcyBsZXNzLCBubyBuZWVkIHRvIHNpbmsgYW55IGZ1cnRoZXIuXG4gICAgICBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYnViYmxlVXAobikge1xuICAgIC8vIExvb2sgdXAgdGhlIHRhcmdldCBlbGVtZW50IGFuZCBpdHMgc2NvcmUuXG4gICAgbGV0IGxlbmd0aCA9IHRoaXMuY29udGVudC5sZW5ndGgsXG4gICAgICBlbGVtZW50ID0gdGhpcy5jb250ZW50W25dLFxuICAgICAgZWxlbVNjb3JlID0gdGhpcy5zY29yZUZ1bmN0aW9uKGVsZW1lbnQpO1xuXG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgLy8gQ29tcHV0ZSB0aGUgaW5kaWNlcyBvZiB0aGUgY2hpbGQgZWxlbWVudHMuXG4gICAgICBsZXQgY2hpbGQyTiA9IChuICsgMSkgPDwgMSxcbiAgICAgICAgY2hpbGQxTiA9IGNoaWxkMk4gLSAxO1xuICAgICAgLy8gVGhpcyBpcyB1c2VkIHRvIHN0b3JlIHRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIGlmIGFueS5cbiAgICAgIGxldCBzd2FwID0gbnVsbCxcbiAgICAgICAgY2hpbGQxU2NvcmU7XG4gICAgICAvLyBJZiB0aGUgZmlyc3QgY2hpbGQgZXhpc3RzIChpcyBpbnNpZGUgdGhlIGFycmF5KS4uLlxuICAgICAgaWYoY2hpbGQxTiA8IGxlbmd0aCkge1xuICAgICAgICAvLyBMb29rIGl0IHVwIGFuZCBjb21wdXRlIGl0cyBzY29yZS5cbiAgICAgICAgbGV0IGNoaWxkMSA9IHRoaXMuY29udGVudFtjaGlsZDFOXTtcbiAgICAgICAgY2hpbGQxU2NvcmUgPSB0aGlzLnNjb3JlRnVuY3Rpb24oY2hpbGQxKTtcbiAgICAgICAgLy8gSWYgdGhlIHNjb3JlIGlzIGxlc3MgdGhhbiBvdXIgZWxlbWVudCdzLCB3ZSBuZWVkIHRvIHN3YXAuXG4gICAgICAgIGlmKGNoaWxkMVNjb3JlIDwgZWxlbVNjb3JlKSB7XG4gICAgICAgICAgc3dhcCA9IGNoaWxkMU47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRG8gdGhlIHNhbWUgY2hlY2tzIGZvciB0aGUgb3RoZXIgY2hpbGQuXG4gICAgICBpZihjaGlsZDJOIDwgbGVuZ3RoKSB7XG4gICAgICAgIGxldCBjaGlsZDIgPSB0aGlzLmNvbnRlbnRbY2hpbGQyTl0sXG4gICAgICAgICAgY2hpbGQyU2NvcmUgPSB0aGlzLnNjb3JlRnVuY3Rpb24oY2hpbGQyKTtcbiAgICAgICAgaWYoY2hpbGQyU2NvcmUgPCAoc3dhcCA9PT0gbnVsbCA/IGVsZW1TY29yZSA6IGNoaWxkMVNjb3JlKSkge1xuICAgICAgICAgIHN3YXAgPSBjaGlsZDJOO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBlbGVtZW50IG5lZWRzIHRvIGJlIG1vdmVkLCBzd2FwIGl0LCBhbmQgY29udGludWUuXG4gICAgICBpZihzd2FwICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuY29udGVudFtuXSA9IHRoaXMuY29udGVudFtzd2FwXTtcbiAgICAgICAgdGhpcy5jb250ZW50W3N3YXBdID0gZWxlbWVudDtcbiAgICAgICAgbiA9IHN3YXA7XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSwgd2UgYXJlIGRvbmUuXG4gICAgICBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmluYXJ5SGVhcDtcbiIsIid1c2Ugc3RyaWN0J1xuY29uc3QgQVNfU2VhcmNoID0gcmVxdWlyZSgnLi9BU19TZWFyY2gnKVxuY29uc3QgV2F5cG9pbnQgPSByZXF1aXJlKCcuLi9tb2RlbHMvV2F5cG9pbnQvV2F5cG9pbnQnKVxuXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGEgV2F5ZmluZGVyIG9iamVjdCB1c2VkIHRvIGdlbmVyYXRlIGEgcGF0aCBiZXR3ZWVuIHR3byBwb2ludHMqL1xuY2xhc3MgV2F5ZmluZGVyIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFdheWZpbmRlciBvYmplY3RcbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgLSBBU3RhciBzZWFyY2ggZGF0YVxuICAgKi9cbiAgY29uc3RydWN0b3Ioam1hcCkge1xuICAgIGxldCB3YXlwb2ludHMgPSBqbWFwLk1hcENvbGxlY3Rpb24uZ2V0QWxsV2F5cG9pbnRzKClcbiAgICBsZXQgcGF0aHMgPSBqbWFwLlBhdGhDb2xsZWN0aW9uLmdldEFsbCgpXG4gICAgbGV0IHBhdGhUeXBlcyA9IGptYXAuUGF0aFR5cGVDb2xsZWN0aW9uLmdldEFsbCgpXG4gICAgbGV0IG1hcHMgPSBqbWFwLk1hcENvbGxlY3Rpb24uZ2V0QWxsKClcbiAgICB0aGlzLl8gPSB7XG4gICAgICBhc3RhcjogbmV3IEFTX1NlYXJjaCh3YXlwb2ludHMsIHBhdGhzLCBwYXRoVHlwZXMsIG1hcHMpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIFNWRyBwYXRoIGRhdGEgZnJvbSBhbiBhcnJheSBvZiB3YXlwb2ludHNcbiAgICogQHBhcmFtIHtBcnJheS9XYXlwb2ludH0gcG9pbnRzIC0gQXJyYXkgb2Ygd2F5cG9pbnRzXG4gICAqIEByZXR1cm4ge1N0cmluZ30gc3ZnIFBhdGggZWxlbW50IGQ9XCJcIiBhdHRyaWJ1dGVcbiAgICovXG4gIGNvbnZlcnRQb2ludHNUb1NWR1BhdGhEYXRhKHBvaW50cykge1xuICAgIHZhciBzdHIgPSAnJztcbiAgICB2YXIgbiA9IHBvaW50cy5sZW5ndGg7XG5cbiAgICBpZihuIDwgMikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHN0ciArPSAnTSAnICsgKHBvaW50c1swXS54KSArICcgJyArIChwb2ludHNbMF0ueSk7XG4gICAgZm9yKHZhciBpID0gMTsgaSA8IG47IGkrKykge1xuICAgICAgc3RyICs9ICcgTCAnICsgKHBvaW50c1tpXS54KSArICcgJyArIChwb2ludHNbaV0ueSk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgV2F5ZmluZGVyRGF0YSBiZXR3ZWVuIHR3byBwb2ludHNcbiAgICogQHBhcmFtIHtXYXlwb2ludH0gX2Zyb20gLSBTdGFydGluZyB3YXlwb2ludFxuICAgKiBAcGFyYW0ge1dheXBvaW50fSBfdG8gLSBFbmRpbmcgd2F5cG9pbnRcbiAgICogQHBhcmFtIHtCb29sZWFufSBhY2Nlc3MgLSBGb3JjZSB1c2Ugb2Ygb25seSBtb3ZlcnMgd2l0aCBhY2Nlc3MgbGV2ZWwgPCA1MSAodHlwaWNhbGx5LCBlbGV2YXRvcnMpXG4gICAqIEByZXR1cm4ge0FycmF5L1dheWZpbmRlckRhdGF9IC0gUmV0dXJuIGRhdGFcbiAgICogQHRocm93cyB7VHlwZUVycm9yfSBtZXNzYWdlIC0gV2F5ZmluZGVyIDo6IEZpcnN0IHR3byBhcmd1bWVudHMgbXVzdCBiZSBXYXlwb2ludHNcbiAgICovXG4gIHNlYXJjaChfZnJvbSwgX3RvLCBhY2Nlc3MpIHtcbiAgICBsZXQgYWNjZXNzTGV2ZWwgPSAxMDBcbiAgICBpZihhY2Nlc3MpIGFjY2Vzc0xldmVsID0gNTBcbiAgICBpZihfZnJvbSAmJiBfdG8gJiYgX2Zyb20uY29uc3RydWN0b3IgPT09IFdheXBvaW50ICYmIF90by5jb25zdHJ1Y3RvciA9PT0gV2F5cG9pbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl8uYXN0YXIuc2VhcmNoKF9mcm9tLmlkLCBfdG8uaWQsIGFjY2Vzc0xldmVsKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdXYXlmaW5kZXIgOjogRmlyc3QgdHdvIGFyZ3VtZW50cyBtdXN0IGJlIFdheXBvaW50cycpXG4gICAgfVxuXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdheWZpbmRlclxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgV2F5ZmluZGVyRGF0YSBwYXJzZWQgZnJvbSBXYXlmaW5kZXIqL1xuY2xhc3MgV2F5ZmluZGVyRGF0YSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIFdheWZpbmRlckRhdGEgb2JqZWN0XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIC0gQVN0YXIgc2VhcmNoIGRhdGFcbiAgICovXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICB0aGlzLl8gPSB7fVxuICAgIHRoaXMuXy5zZXEgPSBkYXRhLnNlcVxuICAgIHRoaXMuXy5tYXBJZCA9IGRhdGEubWFwSWRcbiAgICB0aGlzLl8ubW92ZXIgPSBkYXRhLm1vdmVyXG4gICAgdGhpcy5fLnBvaW50cyA9IGRhdGEucG9pbnRzXG4gICAgdGhpcy5fLmNvc3QgPSBkYXRhLmNvc3RcbiAgfVxuXG4gIGdldChwcm9wLCBfZGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLl9bcHJvcF0gIT09IHVuZGVmaW5lZCA/IHRoaXMuX1twcm9wXSA6IF9kZWZhdWx0XG4gIH1cblxuICBzZXQocHJvcCwgdmFsdWUsIGNvbnN0cnVjdG9yLCBfZGVmYXVsdCkge1xuICAgIGlmKHZhbHVlLmNvbnN0cnVjdG9yID09PSBjb25zdHJ1Y3Rvcikge1xuICAgICAgdGhpcy5fW3Byb3BdID0gdmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fW3Byb3BdID0gX2RlZmF1bHRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFdheWZpbmRlckRhdGEjc2VxXG4gICAqL1xuICBnZXQgc2VxKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc2VxJywgbnVsbClcbiAgfVxuICBzZXQgc2VxKHNlcSkge1xuICAgIHRoaXMuc2V0KCdzZXEnLCBzZXEsIE51bWJlciwgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgV2F5ZmluZGVyRGF0YSNtYXBJZFxuICAgKi9cbiAgZ2V0IG1hcElkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbWFwSWQnLCBudWxsKVxuICB9XG4gIHNldCBtYXBJZChtYXBJZCkge1xuICAgIHRoaXMuc2V0KCdtYXBJZCcsIG1hcElkLCBOdW1iZXIsIG51bGwpXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7T2JqZWN0fSAgIFdheWZpbmRlckRhdGEjbW92ZXJcbiAgICovXG4gIGdldCBtb3ZlcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ21vdmVyJywgbnVsbClcbiAgfVxuICBzZXQgbW92ZXIobW92ZXIpIHtcbiAgICB0aGlzLnNldCgnbW92ZXInLCBtb3ZlciwgT2JqZWN0LCBudWxsKVxuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXIge0FycmF5fSAgIFdheWZpbmRlckRhdGEjcG9pbnRzXG4gICAqL1xuICBnZXQgcG9pbnRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncG9pbnRzJywgW10pXG4gIH1cbiAgc2V0IHBvaW50cyhwb2ludHMpIHtcbiAgICB0aGlzLnNldCgncG9pbnRzJywgcG9pbnRzLCBBcnJheSwgW10pXG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlciB7TnVtYmVyfSAgIFdheWZpbmRlckRhdGEjY29zdFxuICAgKi9cbiAgZ2V0IGNvc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb3N0JywgbnVsbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyIHtOdW1iZXJ9ICAgV2F5ZmluZGVyRGF0YSNlbnRpdHlJZFxuICAgKi9cbiAgc2V0IGNvc3QoY29zdCkge1xuICAgIHRoaXMuc2V0KCdjb3N0JywgY29zdCwgTnVtYmVyLCBudWxsKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2F5ZmluZGVyRGF0YVxuIl19
