'use strict'
/* jshint -W055*/
const chai = require('chai')
const expect = chai.expect
const JMap = require('../jmap')
const request = require('request')
const Waypoint = require('../../models/Waypoint/Waypoint')
const Destination = require('../../models/Destination/Destination')
const Amenity = require('../../models/Amenity/Amenity')

describe('jmap', function() {
  let map;

  it('should instanciate with valid options', function(done) {
    new JMap({
      server: 'https://maps.westfield.io',
      locationId: 263,
      request,
      DOMParser: require('xmldom').DOMParser,
      onReady(err) {
        expect(err).to.equal(null)
        done()
      }
    })
  })

  it('should thow type error for invalid server', function(done) {
    new JMap({
      server: ['https://maps.westfield.io'],
      locationId: '263',
      request,
      DOMParser: require('xmldom').DOMParser,
      onReady(e) {
        expect(e.toString()).to.equal('TypeError: Invalid: Cannot use https://maps.westfield.io as server')
        done()
      }
    })
  })

  it('should thow type error for invalid locationId', function(done) {
    new JMap({
      server: 'https://maps.westfield.io',
      locationId: '263',
      request,
      DOMParser: require('xmldom').DOMParser,
      onReady(e) {
        expect(e.toString()).to.equal('TypeError: Invalid: Cannot use 263 as locationId')
        done()
      }
    })
  })

  it('should have valid api response', function(done) {
    let schema = {
      amenities: Array,
      categories: Array,
      destinations: Array,
      devices: Array,
      events: Array,
      location: Object,
      maps: Array,
      pathTypes: Array,
      paths: Array
    };
    let options = {
      server: 'https://maps.westfield.io',
      locationId: 263,
      request,
      DOMParser: require('xmldom').DOMParser,
      onReady(error) {
        expect(error).to.equal(null)
        for(let prop in map.response.body) {
          if(map.response.body.hasOwnProperty(prop)) {
            expect(map.response.body[prop].constructor).to.equal(schema[prop])
          }
        }
        done()
      }
    }
    map = new JMap(options)
  })

  describe('getClosestWaypointInArrayToWaypoint', function() {

    it('should return closest waypoint in array of waypoints', function() {
      let waypoints = map.MapCollection.getAllWaypoints()
      let _from = waypoints[0]
      let array = [waypoints[2], waypoints[3], waypoints[4]]
      let test = map.getClosestWaypointInArrayToWaypoint(array, _from)
      expect(test).to.be.an.instanceof(Waypoint)
    })

    it('should retun null for bad inputs', function() {
      let test = map.getClosestWaypointInArrayToWaypoint()
      expect(test).to.equal(null)
    });

  });

  describe('getClosestDestinationToWaypoint', function() {

    it('Should return Array of Objects with Destination/Waypoint', function() {
      let waypoint = map.MapCollection.getAllWaypoints()[0]
      let test = map.getClosestDestinationToWaypoint(waypoint)
      expect(test).to.have.property('destination')
      expect(test).to.have.property('waypoint')
      expect(test.destination).to.be.instanceof(Destination)
      expect(test.waypoint).to.be.instanceof(Waypoint)
    });

    it('Should return filtered Destination', function() {
      let waypoint = map.MapCollection.getAllWaypoints()[0]
      let filter = destination => destination.sponsoredRating >= 50
      let test = map.getClosestDestinationToWaypoint(waypoint, filter, false)
      expect(test).to.have.property('destination')
      expect(test).to.have.property('waypoint')
      expect(test.destination).to.be.instanceof(Destination)
      expect(test.waypoint).to.be.instanceof(Waypoint)
      expect(test.destination.sponsoredRating).to.be.above(49)
    });

  });

  describe('getClosestAmenityToWaypoint', function() {

    it('Should return Array of Objects with Amenity/Waypoint', function() {
      let waypoint = map.MapCollection.getAllWaypoints()[0]
      let test = map.getClosestAmenityToWaypoint(waypoint)
      expect(test).to.have.property('amenity')
      expect(test).to.have.property('waypoint')
      expect(test.amenity).to.be.instanceof(Amenity)
      expect(test.waypoint).to.be.instanceof(Waypoint)
    });

    it('Should return filtered Amenity', function() {
      let waypoint = map.MapCollection.getAllWaypoints()[0]
      let filter = amenity => amenity.description.indexOf('a') > -1
      let test = map.getClosestAmenityToWaypoint(waypoint, filter, false)
      expect(test).to.have.property('amenity')
      expect(test).to.have.property('waypoint')
      expect(test.amenity).to.be.instanceof(Amenity)
      expect(test.waypoint).to.be.instanceof(Waypoint)
      expect(test.amenity.description.indexOf('a')).to.be.above(-1)
    });

  });

});
