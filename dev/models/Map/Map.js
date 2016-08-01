'use strict'
const WaypointCollection = require('../Waypoint/WaypointCollection')
const DestinationLabelCollection = require('../DestinationLabel/DestinationLabelCollection')
const MapLabelCollection = require('../MapLabel/MapLabelCollection')

/** Class representing a Map. */
class Map {
  /**
   * Create a Map.
   * @param {object} model - The model object passed back from the /full payload
   * @param {DOMParser} DOMParser - XML DOM parser window.DOMParser for browser or https://www.npmjs.com/package/xmldom
   */
  constructor(model, DOMParser) {
    this._ = {}
    for(var property in model) {
      if(model.hasOwnProperty(property)) {

        //Flatten map property
        if(property == 'map') {
          let map = model[property]
          for(var property2 in map) {
            if(map.hasOwnProperty(property2)) {
              this._[property2] = map[property2]
            }
          }

          //Create waypoint collection
        } else if(property == 'waypoints') {
          this.WaypointCollection = new WaypointCollection()
          this.WaypointCollection.create(model[property])

          //Create Destination Label collection
        } else if(property == 'destinationLabels') {
          this.DestinationLabelCollection = new DestinationLabelCollection()
          this.DestinationLabelCollection.create(model[property])

          //Create Map Label collection
        } else if(property == 'mapLabels') {
          this.MapLabelCollection = new MapLabelCollection()
          this.MapLabelCollection.create(model[property])

          //Parse SVG into XML DOM tree
        } else if(property == 'svg' && model[property] && DOMParser) {
          try {
            //Clean svg
            model[property] = model[property].replace(/\r\n|\r|\n|\t/g, '')
            model[property] = model[property].replace(/\s+/g, ' ')

            //Parse
            this._.svgTree = (new DOMParser()).parseFromString(model[property], 'text/xml');

            //Check for errors
            if(!this._.svgTree.documentElement || this._.svgTree.documentElement.nodeName == 'parsererror') {
              throw new TypeError('Map :: input contains invalid XML data')
            } else {
              this._[property] = model[property]
            }

            //Parse out LBoxes
            let rects = this._.svgTree.documentElement.getElementsByTagName('rect')
            this._.lboxes = []
            for(var i = 0; i < rects.length; i++) {
              let _class = rects[i].getAttribute('class')
              if(_class === 'LBox') this._.lboxes.push(rects[i])
            }

            //Add *-Layer class to all layers

            let layers = this._.svgTree.getElementsByTagName('svg')[0].childNodes
            for(var j = 0; j < layers.length; j++) {
              //Get Id of layer
              let id = layers[j].getAttribute('id')

              //Make sure its not the <style> tag
              if(id) {
                //Remove '_' from id and append as class name
                let baseName = id.replace(/_.*/, '')
                if(baseName) {
                  layers[j].setAttribute('name', baseName)
                  layers[j].setAttribute('class', baseName + '-Layer')
                }
              }

            }

          } catch(error) {
            throw error
          }

          //Catch any new or stray porperties
        } else {
          this._[property] = model[property]
        }

      }
    }
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
   * Returns the closest amenity to the specified waypoint
   * @param {Object} point - x/y coordinate (can be a waypoint)
   * @param {Object} point.x - x coordinate
   * @param {Object} point.y - y coordinate
   * @param {Number} raduis - raduis of the area to look in, default is 100
   * @return {Array/Waypoint} - An array of waypoints sorted by distance to point
   */
  getWaypointsInArea(point, radius) {
    //Validate input
    if(!point || !point.x || !point.y || point.x.constructor !== Number || point.y.constructor !== Number) {
      throw new TypeError('Map :: first argument by be valid {x: Number, y: Number}')
    }
    if(!radius || radius !== Number) radius = 100

    //Radius to power of 2
    let radius2 = Math.pow(radius, 2)

    //Collection of found points
    let nodes = []

    //All Waypoints on this Map
    let collection = this.WaypointCollection;

    //Get waypoint in bounds
    collection.getAll().forEach((wp) => {
      let xy2 = Math.pow((wp.x - point.x), 2) + Math.pow((wp.y - point.y), 2)
        //Point is inside circle
      if(xy2 < radius2) {
        nodes.push({
          id: wp.id,
          distance: Math.sqrt(xy2)
        })
      }
    })

    // Sort by distance and map to waypoint
    return nodes.sort((a, b) => {
      return a.distance - b.distance
    }).map((node) => {
      return collection.getById(node.id)
    })
  }

  /**
   * @member {WaypointCollection}   Map#WaypointCollection
   */
  get WaypointCollection() {
    return this.get('WaypointCollection', null)
  }
  set WaypointCollection(collection) {
    this.set('WaypointCollection', collection, WaypointCollection, null)
  }

  /**
   * @member {DestinationLabelCollection}   Map#DestinationLabelCollection
   */
  get DestinationLabelCollection() {
    return this.get('DestinationLabelCollection', null)
  }
  set DestinationLabelCollection(collection) {
    this.set('DestinationLabelCollection', collection, DestinationLabelCollection, null)
  }

  /**
   * @member {MapLabelCollection}   Map#MapLabelCollection
   */
  get MapLabelCollection() {
    return this.get('MapLabelCollection', null)
  }
  set MapLabelCollection(collection) {
    this.set('MapLabelCollection', collection, MapLabelCollection, null)
  }

  /**
   * @member {Array}   Map#destinationLabels
   */
  get destinationLabels() {
    return this.get('destinationLabels', [])
  }
  set destinationLabels(destinationLabels) {
    this.set('destinationLabels', destinationLabels, Array, [])
  }

  /**
   * @member {Boolean}   Map#defaultMapForDevice
   */
  get defaultMapForDevice() {
    return this.get('defaultMapForDevice', false)
  }
  set defaultMapForDevice(defaultMapForDevice) {
    this.set('defaultMapForDevice', defaultMapForDevice, Boolean, false)
  }

  /**
   * @member {String}   Map#description
   */
  get description() {
    return this.get('description', '')
  }
  set description(description) {
    this.set('description', description, String, '')
  }

  /**
   * @member {Number}   Map#floorSequence
   */
  get floorSequence() {
    return this.get('floorSequence', null)
  }
  set floorSequence(floorSequence) {
    this.set('floorSequence', floorSequence, Number, null)
  }

  /**
   * @member {Number}   Map#locationId
   */
  get locationId() {
    return this.get('locationId', null)
  }
  set locationId(locationId) {
    this.set('locationId', locationId, Number, null)
  }

  /**
   * @member {String}   Map#locationName
   */
  get locationName() {
    return this.get('locationName', '')
  }
  set locationName(locationName) {
    this.set('locationName', locationName, String, '')
  }

  /**
   * @member {Number}   Map#mapId
   */
  get mapId() {
    return this.get('mapId', null)
  }
  set mapId(mapId) {
    this.set('mapId', mapId, Number, null)
  }

  /**
   * @member {String}   Map#name
   */
  get name() {
    return this.get('name', '')
  }
  set name(name) {
    this.set('name', name, String, '')
  }

  /**
   * @member {Number}   Map#parentLocationId
   */
  get parentLocationId() {
    return this.get('parentLocationId', null)
  }
  set parentLocationId(parentLocationId) {
    this.set('parentLocationId', parentLocationId, Number, null)
  }

  /**
   * @member {Number}   Map#preference
   */
  get preference() {
    return this.get('preference', null)
  }
  set preference(preference) {
    this.set('preference', preference, Number, null)
  }

  /**
   * @member {Number}   Map#status
   */
  get status() {
    return this.get('status', null)
  }
  set status(status) {
    this.set('status', status, Number, null)
  }

  /**
   * @member {String}   Map#statusDesc
   */
  get statusDesc() {
    return this.get('statusDesc', '')
  }
  set statusDesc(statusDesc) {
    this.set('statusDesc', statusDesc, String, '')
  }

  /**
   * @member {String}   Map#svgMap
   */
  get svgMap() {
    return this.get('svgMap', '')
  }
  set svgMap(svgMap) {
    this.set('svgMap', svgMap, String, '')
  }

  /**
   * @member {String}   Map#thumbnailHTML
   */
  get thumbnailHTML() {
    return this.get('thumbnailHTML', '')
  }
  set thumbnailHTML(thumbnailHTML) {
    this.set('thumbnailHTML', thumbnailHTML, String, '')
  }

  /**
   * @member {String}   Map#uri
   */
  get uri() {
    return this.get('uri', '')
  }
  set uri(uri) {
    this.set('uri', uri, String, '')
  }

  /**
   * @member {Number}   Map#xOffset
   */
  get xOffset() {
    return this.get('xOffset', null)
  }
  set xOffset(xOffset) {
    this.set('xOffset', xOffset, Number, null)
  }

  /**
   * @member {Number}   Map#xScale
   */
  get xScale() {
    return this.get('xScale', null)
  }
  set xScale(xScale) {
    this.set('xScale', xScale, Number, null)
  }

  /**
   * @member {Number}   Map#yOffset
   */
  get yOffset() {
    return this.get('yOffset', null)
  }
  set yOffset(yOffset) {
    this.set('yOffset', yOffset, Number, null)
  }

  /**
   * @member {Number}   Map#yScale
   */
  get yScale() {
    return this.get('yScale', null)
  }
  set yScale(yScale) {
    this.set('yScale', yScale, Number, null)
  }

  /**
   * @member {Array}   Map#mapLabels
   */
  get mapLabels() {
    return this.get('mapLabels', [])
  }
  set mapLabels(mapLabels) {
    this.set('mapLabels', mapLabels, Array, [])
  }

  /**
   * @member {String}   Map#svg
   */
  get svg() {
    return this.get('svg', '')
  }
  set svg(svg) {
    this.set('svg', svg, String, '')
  }

  /**
   * @member {String}   Map#svgTree
   */
  get svgTree() {
    let tree = this.get('svgTree', null)
    return tree //? tree.documentElement : tree
  }

  /**
   * @member {Array}   Map#lboxes
   */
  get lboxes() {
    return this.get('lboxes', [])
  }

  /**
   * @member {Array}   Map#waypoints
   */
  get waypoints() {
    return this.get('waypoints', [])
  }
  set waypoints(waypoints) {
    this.set('waypoints', waypoints, Array, [])
  }

}

module.exports = Map
