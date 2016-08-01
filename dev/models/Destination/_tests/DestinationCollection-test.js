'use strict'
const chai = require('chai')
const expect = chai.expect

const DestinationCollection = require('../DestinationCollection')
const _Destination = require('../Destination')

describe('Destination', function() {
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
        const Destination = jmap.DestinationCollection

        describe('Destination - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(Destination).to.be.an.instanceof(DestinationCollection)
            });

            it('should instanciate a single by using #create', function() {
              let d = Destination.create(jmap.response.body.destinations[0])
              expect(d).to.be.an.instanceof(_Destination)
            })

            it('should instanciate an array by using #create', function() {
              let d = Destination.create(jmap.response.body.destinations)
              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Destination)
              })
            })

          });

          describe('isDestination', function() {
            it('should return true if item is Destination', function() {
              let item = Destination.getAll()[0]
              expect(Destination.isDestination(item)).to.equal(true)
            })
            it('should return false if item is not Destination', function() {
              let item = {}
              expect(Destination.isDestination(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(Destination.getAll()).to.equal(Destination._items)
            })
          });

          describe('getById', function() {

            it('should return Destination by its id', function() {
              let d = Destination.getById(Destination._items[0].id)
              expect(d).to.be.an.instanceof(_Destination)
              expect(d).to.equal(Destination._items[0])
            })

            it('should return null if nothing is found', function() {
              let d = Destination.getById(1)
              expect(d).to.equal(null)
            })

          })

          describe('getByClientId', function() {

            it('should return Destination by its clientId', function() {
              let d = Destination.getByClientId(Destination._items[0].clientId)
              expect(d).to.be.an.instanceof(_Destination)
              expect(d).to.equal(Destination._items[0])
            })

            it('should return null if nothing is found', function() {
              let d = Destination.getByClientId(1)
              expect(d).to.equal(null)
            })

          })

          describe('getByMapId', function() {

            it('should return array of Destination by its mapId', function() {
              let mapId = Destination._items[0].waypoints[0].mapId
              let d = Destination.getByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Destination)
                let wps = _d.waypoints.filter(wp => wp.mapId === mapId)
                expect(wps).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let mapId = 1
              let d = Destination.getByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          describe('getByWaypointId', function() {

            it('should return array of Destination associated with a waypointId', function() {
              let wpId = Destination._items[0].waypoints[0].id

              let d = Destination.getByWaypointId(wpId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Destination)
                let wps = _d.waypoints.filter(wp => wp.id === wpId)
                expect(wps).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = 1
              let d = Destination.getByWaypointId(wpId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          });

          describe('getByZoneId', function() {

            it('should return array of Destination associated with a zoneId', function() {
              let zoneId = Destination._items[0].waypoints[0].zoneId

              let d = Destination.getByZoneId(zoneId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Destination)
                let wps = _d.waypoints.filter(wp => wp.zoneId === zoneId)
                expect(wps).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let zoneId = null
              let d = Destination.getByZoneId(zoneId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          });

          describe('getByCategoryId', function() {

            it('should return array of Destination by its categoryId', function() {
              let categoryId = Destination._items[0].categoryId[0]
              let d = Destination.getByCategoryId(categoryId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Destination)
                let cat = _d.categoryId.filter(c => c === categoryId)
                expect(cat).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let categoryId = null
              let d = Destination.getByCategoryId(categoryId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          describe('getByKeyword', function() {

            it('should return array of Destination associated with a keyword', function() {
              let keyword = Destination._items[0].keywords.split(',')[0]
              let c = Destination.getByKeyword(keyword)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length.above(0)

              c.forEach((_c) => {
                expect(_c).to.be.an.instanceof(_Destination)
                expect(_c.keywords).to.have.string(keyword)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let keyword = null
              let c = Destination.getByKeyword(keyword)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length(0)
            })

          })

          describe('getByOperatingStatus', function() {

            it('should return array of Destination by its operatingStatus', function() {
              let operatingStatus = Destination._items[0].operatingStatus
              let d = Destination.getByOperatingStatus(operatingStatus)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Destination)
                expect(_d.operatingStatus).to.equal(operatingStatus)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let operatingStatus = null
              let d = Destination.getByOperatingStatus(operatingStatus)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          describe('getBySponsoredRating', function() {

            it('should return array of Destination by its sponsoredRating', function() {
              let sponsoredRating = Destination._items[0].sponsoredRating
              let d = Destination.getBySponsoredRating(sponsoredRating)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Destination)
                expect(_d.sponsoredRating).to.equal(sponsoredRating)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let sponsoredRating = null
              let d = Destination.getBySponsoredRating(sponsoredRating)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          describe('sortBySponsoredRating', function() {

            it('should sort an array of Destinations by thier sponsoredRating', function() {
              let destinations = Destination._items.splice(10, 20)
              let d = Destination.sortBySponsoredRating(destinations)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(destinations.length);
              d.forEach((_d) => {
                expect(_d).to.satisfy(ds => ds.sponsoredRating >= d[d.length - 1].sponsoredRating)
                expect(_d).to.be.an.instanceof(_Destination)
              })
            })

            it('should return Array of all Destinations if no argument is passed in', function() {
              let d = Destination.sortBySponsoredRating()
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(Destination._items.length);

              d.forEach((_d) => {
                expect(_d).to.satisfy(ds => ds.sponsoredRating >= d[d.length - 1].sponsoredRating)
                expect(_d).to.be.an.instanceof(_Destination)
              })
            })

            it('should throw TypeError for invalid argument', function() {
              expect(Destination.sortBySponsoredRating.bind(Destination, [1, 2, 3]))
                .to.throw(TypeError, /JMap : All items must be type Destination/)
            });

          })

          done()
        });
      }
    })
  });
})
