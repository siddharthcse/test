'use strict'
const chai = require('chai')
const expect = chai.expect

const TextDirections = require('../TextDirections')
const Instruction = require('../Instruction')

describe('TextDirections', function() {
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
        describe('TextDirections - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(jmap.TextDirections).to.be.an.instanceof(TextDirections)
            })
          })

          describe('compile', function() {
            it('should return an array of WayfinderData', function() {
              let waypoints = jmap.MapCollection.getAllWaypoints();
              let _from = waypoints[0]
              let i = waypoints.length - 1
              let data = []
              while(!data.length && i) {
                data = jmap.Wayfinder.search(_from, waypoints[i])
                i--
              }
              let test = jmap.TextDirections.compile(data)
              expect(test).to.be.an.instanceof(Array)
              test.forEach((inst) => {
                inst.forEach((i) => {
                  expect(i).to.be.instanceof(Instruction)
                })
              })
            });
          });

          done()
        });
      }
    })
  });
})
