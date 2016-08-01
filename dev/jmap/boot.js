'use strict'
//No collection
const Location = require('../models/Location/Location')

class Boot {
  constructor(jmap, opts) {
      this.jmap = jmap

      //Set request based on what is passed. ALLOWS FOR NODE environment
      if(opts.request) this.request = opts.request
      else this.request = this.getRequest;

      if(opts.DOMParser) this.xmlParser = opts.DOMParser
      else this.xmlParser = this.getXMLParser()
    }
    /*
      Parses the /full call into properly defined/typed objects
    */
  parseResponse(response) {
    //Create location object
    this.jmap.location = new Location(response.location)

    //Before creating all amenities & pathtypes, add SVG property to object model
    // this.extractAndSetSvgFrom(response.amenities).then(this.jmap.AmenityCollection.create)//.bind(this)
    this.jmap.AmenityCollection.create(response.amenities)
    this.jmap.PathTypeCollection.create(response.pathTypes)

    //Straight forward creation
    this.jmap.CategoryCollection.create(response.categories)
    this.jmap.DestinationCollection.create(response.destinations)
    this.jmap.DeviceCollection.create(response.devices)
      // this.jmap.Event.create(response.events)
    this.jmap.MapCollection.create(response.maps)
    this.jmap.PathCollection.create(response.paths)
    this.jmap.ZoneCollection.create(response.zones)

    return this.attachWaypointsToCollections()
  }

  extractAndSetSvgFrom(items) {
    return new Promise((resolve) => {

      //Map Promise
      let svgs = items.map((item) => {
        return new Promise((resolveItem) => {
          let filePath = null
            //Item is amenity or pathType
          if(item.bean) {
            filePath = item.bean.filePath
          } else if(item.pathtypeUri) {
            filePath = item.pathtypeUri[0] ? item.pathtypeUri[0].filePath : null
          }

          // console.log(filePath)

          if(!filePath) {
            resolveItem(item)
          } else {
            //Get filepath
            resolveItem(item)
          }
        })
      })

      Promise.all(svgs).then(resolve)
    })
  }

  /*
    Iterates waypoints ans adds them to collections based on association
  */
  attachWaypointsToCollections() {
    //Entity type ids
    let destinationEntitiyType = 1;
    let deviceEntityType = 2;
    let amenityEntityType = 26;
    let eventEntityType = 19;

    //Iterate though all waypints & associations
    let waypoints = this.jmap.MapCollection.getAllWaypoints()
    waypoints.forEach((waypoint) => {
      let associations = waypoint.AssociationCollection.getAll()
      associations.forEach((association) => {

        //Figure out what collection item to attach waypoint to
        let item = null
        switch(association.entityTypeId) {
          case destinationEntitiyType:
            item = this.jmap.DestinationCollection.getById(association.entityId)
            break
          case deviceEntityType:
            item = this.jmap.DeviceCollection.getById(association.entityId)
            break;
          case amenityEntityType:
            item = this.jmap.AmenityCollection.getByComponentId(association.entityId)
            break;
          case eventEntityType:
            //TODO
            break;
        }

        if(item) {
          if(item.waypoints.indexOf(waypoint) === -1) {
            item.waypoints.push(waypoint)
          }
        }

      })
    })
  }

  /*
    Validates options object passed into jmap
  */
  validateOptions(opts) {
    try {
      opts.server = this.validateProperty('server', opts.server, String, null, true)
      opts.locationId = this.validateProperty('locationId', opts.locationId, Number, null, true)
      return opts
    } catch(error) {
      return error
    }
  }

  /*
    Validates individual object
  */
  validateProperty(prop, value, expectation, _default, required) {
    let err = new TypeError();
    //If value is given
    if(value) {
      //If constructor is not what is expected
      if(value.constructor !== expectation) {
        //If there is a default and it is not required
        if(_default && !required) {
          return _default
        } else {
          err.message = 'Invalid: Cannot use ' + value + ' as ' + prop
          throw err
        }
      } else {
        return value
      }
    } else {
      err.message = 'Invalid: Cannot use ' + value + ' as ' + prop
      throw err
    }

  }

  /*
    Returns formatted /full call based on jmap options
  */
  generateApi(opts) {
    return opts.server + '/v3/location/' + opts.locationId + '/full'
  }

  /*
    Request method used inside DOM
  */
  getRequest(opts, cb) {
    let xhttp = new XMLHttpRequest()
    xhttp.open('GET', opts.url, true);

    for(var header in opts.headers) {
      if(opts.headers.hasOwnProperty(header)) {
        xhttp.setRequestHeader(header, opts.headers[header])
      }
    }

    xhttp.onreadystatechange = function() {
      if(xhttp.readyState == 4 && xhttp.status == 200) {
        if(xhttp.status === 200) cb(null, xhttp, xhttp.responseText)
        else cb('Status code: ' + xhttp.status, xhttp, xhttp.responseText)
      }
    }

    xhttp.send()
  }

  getXMLParser() {
    let parser
    try {
      parser = window.DOMParser
    } catch(e) {
      parser = null
    }
    return parser
  }

}

module.exports = Boot
