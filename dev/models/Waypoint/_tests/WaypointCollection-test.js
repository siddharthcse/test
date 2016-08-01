'use strict'
const chai = require('chai')
const expect = chai.expect

const WaypointCollection = require('../WaypointCollection')
const _Waypoint = require('../Waypoint')

describe('WaypointCollection', function() {
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
        const Waypoint = jmap.MapCollection.getAll()[0].WaypointCollection

        describe('Waypoint - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(Waypoint).to.be.an.instanceof(WaypointCollection)
            });

            it('should instanciate a single by using #create', function() {
              let d = Waypoint.create(jmap.response.body.maps[0].waypoints[0])
              expect(d).to.be.an.instanceof(_Waypoint)
            })

            it('should instanciate an array by using #create', function() {
              let d = Waypoint.create(jmap.response.body.maps[0].waypoints)
              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Waypoint)
              })
            })

          });

          describe('isWaypoint', function() {
            it('should return true if item is Waypoint', function() {
              let item = Waypoint.getAll()[0]
              expect(Waypoint.isWaypoint(item)).to.equal(true)
            })
            it('should return false if item is not Waypoint', function() {
              let item = {}
              expect(Waypoint.isWaypoint(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(Waypoint.getAll()).to.equal(Waypoint._items)
            })
          });

          describe('getById', function() {

            it('should return Waypoint by its id', function() {
              let d = Waypoint.getById(Waypoint._items[0].id)
              expect(d).to.be.an.instanceof(_Waypoint)
              expect(d).to.equal(Waypoint._items[0])
            })

            it('should return null if nothing is found', function() {
              let d = Waypoint.getById(1)
              expect(d).to.equal(null)
            })

          })

          describe('getByMapId', function() {

            it('should return array of Waypoint by its mapId', function() {
              let mapId = Waypoint._items[0].mapId
              let d = Waypoint.getByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Waypoint)
                expect(_d.mapId).to.equal(mapId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let mapId = '1'
              let d = Waypoint.getByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          describe('getByStatus', function() {

            it('should return array of Waypoint by its status', function() {
              let status = Waypoint._items[0].status[0]
              let d = Waypoint.getByStatus(status)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Waypoint)
                expect(_d.status).to.equal(status)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let status = null
              let d = Waypoint.getByStatus(status)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          describe('getByZoneId', function() {

            it('should return array of Waypoint by its zoneId', function() {
              let zoneId = Waypoint._items[0].zoneId[0]
              let d = Waypoint.getByZoneId(zoneId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Waypoint)
                expect(_d.zoneId).to.equal(zoneId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let zoneId = null
              let d = Waypoint.getByZoneId(zoneId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          done()
        });
      }
    })
  });
})
