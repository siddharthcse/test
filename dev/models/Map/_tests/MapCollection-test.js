'use strict'
const chai = require('chai')
const expect = chai.expect

const MapCollection = require('../MapCollection')
const _Map = require('../Map')
const Waypoint = require('../../Waypoint/Waypoint')
const MapLabel = require('../../MapLabel/MapLabel')
const DestinationLabel = require('../../DestinationLabel/DestinationLabel')

describe('MapCollection', function() {
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
        const Map = jmap.MapCollection

        describe('MapCollection - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(Map).to.be.an.instanceof(MapCollection)
            });

            it('should throw type error if no DOMParser', function() {
              expect(() => {
                return new MapCollection()
              }).to.throw(TypeError, /MapCollection :: No XML parser provided. Map.svgTree & Text Directions will not be available/)
            });

            it('should instanciate a single by using #create', function() {
              let a = Map.create(jmap.response.body.maps[0])
              expect(a).to.be.an.instanceof(_Map)
            })

            it('should instanciate an array by using #create', function() {
              let a = Map.create(jmap.response.body.maps)
              a.forEach((_a) => {
                expect(_a).to.be.an.instanceof(_Map)
              })
            })

          });

          describe('isMap', function() {
            it('should return true if item is Map', function() {
              let item = Map.getAll()[0]
              expect(Map.isMap(item)).to.equal(true)
            })
            it('should return false if item is not Map', function() {
              let item = {}
              expect(Map.isMap(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(Map.getAll()).to.equal(Map._items)
            })
          });

          describe('getByFloorSequence', function() {

            it('should return Map by its floorSequence', function() {
              let d = Map.getByFloorSequence(Map._items[0].floorSequence)
              expect(d).to.be.an.instanceof(_Map)
              expect(d).to.equal(Map._items[0])
            })

            it('should return null if nothing is found', function() {
              let d = Map.getByFloorSequence('null')
              expect(d).to.equal(null)
            })

          })

          describe('getByLocationId', function() {

            it('should return Map by its locationId', function() {
              let d = Map.getByLocationId(Map._items[0].locationId)
              expect(d).to.be.an.instanceof(_Map)
              expect(d).to.equal(Map._items[0])
            })

            it('should return null if nothing is found', function() {
              let d = Map.getByLocationId('null')
              expect(d).to.equal(null)
            })

          })

          describe('getByMapId', function() {

            it('should return array of devices by its mapId', function() {
              let mapId = Map._items[0].mapId
              let d = Map.getByMapId(mapId)
              expect(d).to.be.an.instanceof(_Map)
              expect(d).to.equal(Map._items[0])
            })

            it('should return null if nothing is found', function() {
              let d = Map.getByMapId('null')
              expect(d).to.equal(null)
            })

          })

          describe('getByDestinationId', function() {
            it('should return array of Map associated with a destinationId', function() {
              let dest = jmap.DestinationCollection.getAll()[0];
              let destinationId = dest.id
              let m = Map.getByDestinationId(destinationId)
              expect(m).to.be.an.instanceof(Array)

              m.forEach((_m) => {
                expect(_m).to.be.an.instanceof(_Map)
                expect(_m).to.satisfy((__m) => {
                  return dest.waypoints.filter(wp => wp.mapId === __m.mapId).length
                })
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = 1
              let d = Map.getByDestinationId(wpId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })
          });

          describe('getWaypointsByMapId', function() {
            it('should return array of waypoints associated with a mapId', function() {
              let mapId = Map._items[0].mapId
              let d = Map.getWaypointsByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(Waypoint)
                expect(_d.mapId).to.equal(mapId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = 1
              let d = Map.getWaypointsByMapId(wpId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })
          });

          describe('getAllWaypoints', function() {

            it('should return all waypoints associated collection', function() {
              let d = Map.getAllWaypoints()
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(Waypoint)
              })
            })
          });

          describe('getWaypointsWithDestination', function() {

            it('should return all waypoints associated collection', function() {
              let wp = Map.getWaypointsWithDestination()
              expect(wp).to.be.an.instanceof(Array)

              wp.forEach((_wp) => {
                expect(_wp).to.be.an.instanceof(Waypoint)
                let t = _wp.AssociationCollection.getByEntityTypeId(1)
                expect(t.length).to.be.above(0)
              })
            })
          });

          describe('getWaypointsWithAmenity', function() {

            it('should return all waypoints associated collection', function() {
              let wp = Map.getWaypointsWithAmenity()
              expect(wp).to.be.an.instanceof(Array)

              wp.forEach((_wp) => {
                expect(_wp).to.be.an.instanceof(Waypoint)
                let t = _wp.AssociationCollection.getByEntityTypeId(26)
                expect(t.length).to.be.above(0)
              })
            })
          });

          describe('getMapLabelsByMapId', function() {
            it('should return array of waypoints associated with a mapId', function() {
              let mapId = Map._items[0].mapId
              let d = Map.getMapLabelsByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(MapLabel)
                expect(_d.mapId).to.equal(mapId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = 1
              let d = Map.getMapLabelsByMapId(wpId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })
          });

          describe('getAllMapLabels', function() {

            it('should return all waypoints associated collection', function() {
              let d = Map.getAllMapLabels()
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(MapLabel)
              })
            })
          });

          describe('getDestinationLabelsByMapId', function() {
            it('should return array of waypoints associated with a mapId', function() {
              let mapId = Map._items[0].mapId
              let d = Map.getDestinationLabelsByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(DestinationLabel)
                expect(_d.mapId).to.equal(mapId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = 1
              let d = Map.getDestinationLabelsByMapId(wpId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })
          });

          describe('getWaypointByWaypointId', function() {

            it('should return a waypoint associated with an waypoint id', function() {
              let wpId = Map.getAllWaypoints()[0].id
              let d = Map.getWaypointByWaypointId(wpId)
              expect(d).to.be.an.instanceof(Waypoint)
              expect(d).to.equal(Map.getAllWaypoints()[0])
            })

            it('should return null if nothing is found', function() {
              let d = Map.getWaypointByWaypointId('null')
              expect(d).to.equal(null)
            })

          })

          describe('getWaypointsByDestinationId', function() {
            it('should return array of waypoints associated with a destination id', function() {
              let id = jmap.DestinationCollection.getAll()[0].id
              let d = Map.getWaypointsByDestinationId(id)
              expect(d).to.be.an.instanceof(Array)
              expect(d.length).to.be.above(0);

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(Waypoint)
                expect(_d.AssociationCollection.getAll().filter(a => a.entityId === id)).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = null
              let d = Map.getWaypointsByDestinationId(wpId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })
          });

          describe('getAllDestinationLabels', function() {

            it('should return all waypoints associated collection', function() {
              let d = Map.getAllDestinationLabels()
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(DestinationLabel)
              })
            })
          });

          done()
        });
      }
    })
  });
})
