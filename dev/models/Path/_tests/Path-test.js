'use strict'
const chai = require('chai')
const expect = chai.expect

const Path = require('../Path')

describe('Path', function() {

  describe('init with defaults', function() {
    let data = {
      defaultWeight: false,
      direction: null,
      id: null,
      localId: null,
      name: '',
      status: null,
      type: null,
      waypoints: [],
      weight: null
    }

    let loc = new Path({})

    it('should give default values', function() {
      expect(loc.accessibility).to.eql(data.accessibility)
      expect(loc.description).to.eql(data.description)
      expect(loc.direction).to.eql(data.direction)
      expect(loc.maxfloors).to.eql(data.maxfloors)
      expect(loc.metaData).to.eql(data.metaData)
      expect(loc.pathTypeId).to.eql(data.pathTypeId)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.speed).to.eql(data.speed)
      expect(loc.typeName).to.eql(data.typeName)
      expect(loc.typeidPK).to.eql(data.typeidPK)
      expect(loc.weight).to.eql(data.weight)
    });

  });

  describe('init with good data', function() {
    let data = {
      defaultWeight: false,
      direction: 0,
      id: 48463,
      localId: 0,
      name: '',
      status: 1,
      type: 1,
      waypoints: [1, 2],
      weight: 1
    }

    let loc = new Path(data)

    it('should reflect input', function() {
      expect(loc.accessibility).to.eql(data.accessibility)
      expect(loc.description).to.eql(data.description)
      expect(loc.direction).to.eql(data.direction)
      expect(loc.maxfloors).to.eql(data.maxfloors)
      expect(loc.metaData).to.eql(data.metaData)
      expect(loc.pathTypeId).to.eql(data.pathTypeId)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.speed).to.eql(data.speed)
      expect(loc.typeName).to.eql(data.typeName)
      expect(loc.typeidPK).to.eql(data.typeidPK)
      expect(loc.weight).to.eql(data.weight)
    });

  });

})
