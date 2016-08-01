'use strict'
const chai = require('chai')
const expect = chai.expect

const PathCollection = require('../PathCollection')
const _Path = require('../Path')

describe('Path', function() {
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
        const Path = jmap.PathCollection

        describe('Path - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(Path).to.be.an.instanceof(PathCollection)
            });

            it('should instanciate a single by using #create', function() {
              let p = Path.create(jmap.response.body.pathTypes[0])
              expect(p).to.be.an.instanceof(_Path)
            })

            it('should instanciate an array by using #create', function() {
              let p = Path.create(jmap.response.body.pathTypes)
              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_Path)
              })
            })
          });

          describe('isPath', function() {
            it('should return true if item is Path', function() {
              let item = Path.getAll()[0]
              expect(Path.isPath(item)).to.equal(true)
            })
            it('should return false if item is not Path', function() {
              let item = {}
              expect(Path.isPath(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(Path.getAll()).to.equal(Path._items)
            })
          });

          describe('getById', function() {

            it('should return Path by its id', function() {
              let p = Path.getById(Path._items[0].id)
              expect(p).to.be.an.instanceof(_Path)
              expect(p).to.equal(Path._items[0])
            })

            it('should return null if nothing is found', function() {
              let p = Path.getById('null')
              expect(p).to.equal(null)
            })

          })

          describe('getByName', function() {

            it('should return Path by its name', function() {
              Path.create({
                name: 'test'
              })
              let p = Path.getByName('test')
              expect(p).to.be.an.instanceof(_Path)
              expect(p.name).to.eql('test')
            })

            it('should return null if nothing is found', function() {
              let p = Path.getByName(0)
              expect(p).to.equal(null)
            })

          })

          describe('getByDirection', function() {

            it('should return array of path associated with a direction', function() {
              let direction = Path._items[0].direction
              let p = Path.getByDirection(direction)
              expect(p).to.be.an.instanceof(Array)

              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_Path)
                expect(_p.direction).to.equal(direction)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let direction = 'null'
              let p = Path.getByDirection(direction)
              expect(p).to.be.an.instanceof(Array)
              expect(p).to.have.length(0)
            })

          });

          describe('getByStatus', function() {

            it('should return array of path associated with a status', function() {
              let status = Path._items[0].status
              let p = Path.getByStatus(status)
              expect(p).to.be.an.instanceof(Array)

              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_Path)
                expect(_p.status).to.equal(status)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let status = 'null'
              let p = Path.getByStatus(status)
              expect(p).to.be.an.instanceof(Array)
              expect(p).to.have.length(0)
            })

          });

          describe('getByType', function() {

            it('should return array of path associated with a type', function() {
              let type = Path._items[0].type
              let p = Path.getByType(type)
              expect(p).to.be.an.instanceof(Array)

              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_Path)
                expect(_p.type).to.equal(type)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let type = 'null'
              let p = Path.getByType(type)
              expect(p).to.be.an.instanceof(Array)
              expect(p).to.have.length(0)
            })

          });

          describe('getByWaypointId', function() {

            it('should return array of path associated with a waypointId', function() {
              let waypointId = Path._items[0].waypoints[0]
              let p = Path.getByWaypointId(waypointId)
              expect(p).to.be.an.instanceof(Array)

              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_Path)
                expect(_p.waypoints).to.include(waypointId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let waypointId = 'null'
              let p = Path.getByWaypointId(waypointId)
              expect(p).to.be.an.instanceof(Array)
              expect(p).to.have.length(0)
            })

          });

          describe('getByWeight', function() {

            it('should return array of path associated with a weight', function() {
              let weight = Path._items[0].weight
              let p = Path.getByWeight(weight)
              expect(p).to.be.an.instanceof(Array)

              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_Path)
                expect(_p.weight).to.equal(weight)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let weight = 'null'
              let p = Path.getByWeight(weight)
              expect(p).to.be.an.instanceof(Array)
              expect(p).to.have.length(0)
            })

          });

          done()
        });
      }
    })
  });
})
