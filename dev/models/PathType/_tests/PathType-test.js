'use strict'
const chai = require('chai')
const expect = chai.expect

const PathType = require('../PathType')

describe('PathType', function() {

  describe('init with defaults', function() {
    let data = {
      accessibility: null,
      description: '',
      direction: null,
      maxfloors: null,
      metaData: '',
      pathTypeId: null,
      projectId: null,
      speed: null,
      typeName: '',
      typeidPK: null,
      weight: null
    }

    let loc = new PathType({})

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
      accessibility: 0,
      description: 'Normal Path',
      direction: 1,
      maxfloors: 0,
      metaData: '',
      pathTypeId: 1,
      projectId: 264,
      speed: 1,
      typeName: 'Normal Path',
      typeidPK: 25,
      weight: 1
    }

    let loc = new PathType(data)

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
