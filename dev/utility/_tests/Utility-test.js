'use strict'
const chai = require('chai')
const expect = chai.expect
const Utility = require('../Utility')
const util = new Utility()

describe('Utility', function() {

  describe('getObjectsInArrayByString', function() {
    it('Should return a object matching one from the array to the matching string', function() {
      //String to search by
      let query = 'hello';

      //Search all destinations
      let toQuery = [{
        name: 'hello'
      }, {
        name: 'nope'
      }, {
        name: 'help'
      }, {
        name: 'helperMethods',
        extra: 'h'
      }]

      //Amount of search results
      var amount = 2;

      //If object contains a match inside this property,
      //it will score higher as a result.
      var highRankProperties = ['extra'];
      var results = util.getObjectsInArrayByString(toQuery, query, highRankProperties, amount);

      expect(results[0]).to.eql(toQuery[0])
    });

    it('Should return a object utilizing the highRankProps', function() {
      //String to search by
      let query = 'hello';

      //Search all destinations
      let toQuery = [{
        name: 'hello'
      }, {
        name: 'nope'
      }, {
        name: 'help'
      }, {
        name: 'hello',
        extra: 'hello'
      }]

      //Amount of search results
      var amount = 2;

      //If object contains a match inside this property,
      //it will score higher as a result.
      var highRankProperties = ['extra'];
      var results = util.getObjectsInArrayByString(toQuery, query, highRankProperties, amount);

      expect(results[0]).to.eql(toQuery[3])
    });
  });

  describe('getDistanceBetweenTwoPoints', function() {
    it('should return a distance between two points', function() {
      let pointa = {
        x: 0,
        y: 100
      }
      let pointb = {
        x: 0,
        y: 0
      }

      let d = util.getDistanceBetweenTwoPoints(pointa, pointb)
      expect(d).to.equal(100)
    });
  });

  describe('getRotationFromMatrix', function() {

    it('should return a rotation from a matrix', function() {
      let mx = 'matrix(0.866025, 0.5, -0.5, 0.866025, 0px, 0px)'
      let rotation = util.getRotationFromMatrix(mx)
      expect(rotation).to.equal(30)
    });

    it('should return a rotation of 0 from invalid input', function() {
      let mx = null
      let rotation = util.getRotationFromMatrix(mx)
      expect(rotation).to.equal(0)
    });

  });

  describe('getScaleFromMatrix', function() {

    it('should return a scale from a matrix', function() {
      let mx = 'matrix(0.866025, 0.5, -0.5, 0.866025, 0px, 0px)'
      let scale = util.getScaleFromMatrix(mx)
      expect(scale).to.equal(0.866025)
    });

    it('should return a scale of 1 from invalid input', function() {
      let mx = null
      let rotation = util.getScaleFromMatrix(mx)
      expect(rotation).to.equal(1)
    });

  });

  describe('decodeEntities', function() {

    it('should throw an error when un inside nodejs env', function() {
      expect(() => {
        util.decodeEntities()
      }).to.throw(/Utility :: Cannot Decode HTML entites outside of browser/)
    });

  });

});
