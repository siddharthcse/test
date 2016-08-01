'use strict'
const chai = require('chai')
const expect = chai.expect

const PathTypeCollection = require('../PathTypeCollection')
const _PathType = require('../PathType')

describe('PathType', function() {
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
        const PathType = jmap.PathTypeCollection

        describe('PathType - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(PathType).to.be.an.instanceof(PathTypeCollection)
            });

            it('should instanciate a single by using #create', function() {
              let p = PathType.create(jmap.response.body.pathTypes[0])
              expect(p).to.be.an.instanceof(_PathType)
            })

            it('should instanciate an array by using #create', function() {
              let p = PathType.create(jmap.response.body.pathTypes)
              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_PathType)
              })
            })
          });

          describe('isPathType', function() {
            it('should return true if item is PathType', function() {
              let item = PathType.getAll()[0]
              expect(PathType.isPathType(item)).to.equal(true)
            })
            it('should return false if item is not PathType', function() {
              let item = {}
              expect(PathType.isPathType(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(PathType.getAll()).to.equal(PathType._items)
            })
          });

          describe('getByPathTypeId', function() {

            it('should return PathType by its id', function() {
              let p = PathType.getByPathTypeId(PathType._items[0].pathTypeId)
              expect(p).to.be.an.instanceof(_PathType)
              expect(p).to.equal(PathType._items[0])
            })

            it('should return null if nothing is found', function() {
              let p = PathType.getByPathTypeId(0)
              expect(p).to.equal(null)
            })

          })

          describe('getByTypeName', function() {

            it('should return PathType by its id', function() {
              let p = PathType.getByTypeName(PathType._items[0].typeName)
              expect(p).to.be.an.instanceof(_PathType)
              expect(p).to.equal(PathType._items[0])
            })

            it('should return null if nothing is found', function() {
              let p = PathType.getByTypeName(0)
              expect(p).to.equal(null)
            })

          })

          describe('getByDirection', function() {

            it('should return array of path associated with a direction', function() {
              let direction = PathType._items[0].direction
              let p = PathType.getByDirection(direction)
              expect(p).to.be.an.instanceof(Array)

              p.forEach((_p) => {
                expect(_p).to.be.an.instanceof(_PathType)
                expect(_p.direction).to.equal(direction)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let direction = 'null'
              let p = PathType.getByDirection(direction)
              expect(p).to.be.an.instanceof(Array)
              expect(p).to.have.length(0)
            })

          });

          describe('sortByAccessibility', function() {

            it('should return sorted Array of all PathTypes by accessibility', function() {
              let d = PathType.sortByAccessibility()
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(PathType._items.length);

              d.forEach((_d) => {
                expect(_d).to.satisfy(ds => ds.accessibility >= d[d.length - 1].accessibility)
                expect(_d).to.be.an.instanceof(_PathType)
              })
            })

          });

          describe('sortByWeight', function() {

            it('should return sorted Array of all PathTypes by weight', function() {
              let d = PathType.sortByWeight()
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(PathType._items.length);

              d.forEach((_d) => {
                expect(_d).to.satisfy(ds => ds.weight >= d[d.length - 1].weight)
                expect(_d).to.be.an.instanceof(_PathType)
              })
            })

          })

          done()
        });
      }
    })
  });
})
