'use strict'
const chai = require('chai')
const expect = chai.expect

const Wayfinder = require('../Wayfinder')
const WayfinderData = require('../WayfinderData')

describe('Wayfinder', function() {
  it('should initialize jmap', function(done) {

    const JMap = require('../../jmap/jmap')
    const jmap = new JMap({
      server: 'https://maps.westfield.io',
      locationId: 263,
      request: require('request'),
      DOMParser: require('xmldom').DOMParser,
      onReady: (err) => {
        if(err) throw err
          /* All tests go here */
        describe('Wayfinder - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(jmap.Wayfinder).to.be.an.instanceof(Wayfinder)
            })
          })

          describe('search', function() {
            it('should return an array of WayfinderData', function() {
              let waypoints = jmap.MapCollection.getAllWaypoints();
              let _from = waypoints[0]
              let _to = waypoints[waypoints.length - 1]
              let data = jmap.Wayfinder.search(_from, _to)
              data.forEach((d) => {
                expect(d).to.be.an.instanceof(WayfinderData)
              })
            });
          });

          done()
        });
      }
    })
  });
})
