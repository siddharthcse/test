'use strict'
const chai = require('chai')
const expect = chai.expect

const Association = require('../Association')

describe('Association', function() {

  describe('init with defaults', function() {
    let data = {
      entityId: null,
      entityTypeId: null,
      landmarkRating: null,
      waypointId: null
    }

    let loc = new Association({})

    it('should give default values', function() {
      expect(loc.entityId).to.eql(data.entityId)
      expect(loc.entityTypeId).to.eql(data.entityTypeId)
      expect(loc.landmarkRating).to.eql(data.landmarkRating)
      expect(loc.waypointId).to.eql(data.waypointId)
    });

  });

  describe('init with good data', function() {
    let data = {
      entityId: 1234,
      entityTypeId: 5678,
      landmarkRating: 9101,
      waypointId: 1121
    }

    let loc = new Association(data)

    it('should reflect input', function() {
      expect(loc.entityId).to.eql(data.entityId)
      expect(loc.entityTypeId).to.eql(data.entityTypeId)
      expect(loc.landmarkRating).to.eql(data.landmarkRating)
      expect(loc.waypointId).to.eql(data.waypointId)
    });

  });

})
