'use strict'
const chai = require('chai')
const expect = chai.expect

const AmenityCollection = require('../AmenityCollection')
const _Amenity = require('../Amenity')

describe('AmenityCollection', function() {
  it('should initialize jmap', function(done) {

    const JMap = require('../../../jmap/jmap')
    const jmap = new JMap({
      server: 'https://maps.westfield.io',
      locationId: 263,
      request: require('request'),
      DOMParser: require('xmldom').DOMParser,
      onReady: (err) => {
        if(err) throw err
          /* All tests go here */
          //Wait for data
        const Amenity = jmap.AmenityCollection

        describe('AmenityCollection - tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(Amenity).to.be.an.instanceof(AmenityCollection)
            });

            it('should instanciate a single by using #create', function() {
              let a = Amenity.create(jmap.response.body.amenities[0])
              expect(a).to.be.an.instanceof(_Amenity)
            })

            it('should instanciate an array by using #create', function() {
              let a = Amenity.create(jmap.response.body.amenities)
              a.forEach((_a) => {
                expect(_a).to.be.an.instanceof(_Amenity)
              })
            })

          });

          describe('isAmenity', function() {
            it('should return true if item is amenity', function() {
              let item = Amenity.getAll()[0]
              expect(Amenity.isAmenity(item)).to.equal(true)
            })
            it('should return false if item is not amenity', function() {
              let item = {}
              expect(Amenity.isAmenity(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(Amenity.getAll()).to.equal(jmap.AmenityCollection._items)
            })
          });

          describe('getByComponentId', function() {

            it('should return Amenity by its component id', function() {
              let a = Amenity.getByComponentId(jmap.AmenityCollection._items[0].componentId)
              expect(a).to.be.an.instanceof(_Amenity)
              expect(a).to.equal(jmap.AmenityCollection._items[0])
            })

            it('should return null if nothing is found', function() {
              let a = Amenity.getByComponentId(1)
              expect(a).to.equal(null)
            })

          })

          describe('getByMapId', function() {

            it('should return array of Amenities by its mapId', function() {
              let mapId = jmap.AmenityCollection._items[0].waypoints[0].mapId
              let a = Amenity.getByMapId(mapId)
              expect(a).to.be.an.instanceof(Array)

              a.forEach((_a) => {
                expect(_a).to.be.an.instanceof(_Amenity)
                let wps = _a.waypoints.filter(wp => wp.mapId === mapId)
                expect(wps).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let mapId = 1
              let a = Amenity.getByMapId(mapId)
              expect(a).to.be.an.instanceof(Array)
              expect(a).to.have.length(0)
            })

          })

          describe('getByWaypointId', function() {

            it('should return array of Amenities associated with a waypointId', function() {
              let wpId = jmap.AmenityCollection._items[0].waypoints[0].id
              let a = Amenity.getByWaypointId(wpId)
              expect(a).to.be.an.instanceof(Array)

              a.forEach((_a) => {
                expect(_a).to.be.an.instanceof(_Amenity)
                let wps = _a.waypoints.filter(wp => wp.id === wpId)
                expect(wps).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = 1
              let a = Amenity.getByWaypointId(wpId)
              expect(a).to.be.an.instanceof(Array)
              expect(a).to.have.length(0)
            })

          });

          done()
        });
      }
    })
  });
})
