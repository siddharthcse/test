'use strict'
const chai = require('chai')
const expect = chai.expect
const Association = require('../../Association/Association')
const AssociationCollection = require('../../Association/AssociationCollection')
const Waypoint = require('../Waypoint')

describe('Waypoint', function() {

  describe('init with defaults', function() {
    let data = {
      AssociationCollection: new AssociationCollection(),
      decisionPoint: null,
      id: null,
      localId: null,
      mapId: null,
      status: null,
      x: 0,
      y: 0,
      zoneId: null
    }

    let loc = new Waypoint({})

    it('should give default values', function() {
      expect(loc.AssociationCollection).to.eql(data.AssociationCollection)
      expect(loc.decisionPoint).to.eql(data.decisionPoint)
      expect(loc.id).to.eql(data.id)
      expect(loc.localId).to.eql(data.localId)
      expect(loc.mapId).to.eql(data.mapId)
      expect(loc.status).to.eql(data.status)
      expect(loc.x).to.eql(data.x)
      expect(loc.y).to.eql(data.y)
      expect(loc.point).to.eql([data.x, data.y])
      expect(loc.zoneId).to.eql(data.zoneId)
    });

  });

  describe('init with good data', function() {
    let data = {
      associations: [{
        entityId: 10915640,
        entityTypeId: 1,
        landmarkRating: 0,
        waypointId: 45948
      }],
      decisionPoint: 0,
      id: 45948,
      localId: 0,
      mapId: 126137,
      status: 1,
      x: 2601.3718,
      y: 2622.9402,
      zoneId: 0
    }

    let loc = new Waypoint(data)

    it('should reflect input', function() {

      expect(loc.AssociationCollection).to.be.an.instanceof(AssociationCollection)
      loc.AssociationCollection.getAll().forEach((a) => {
        expect(a).to.be.an.instanceof(Association)
      })

      expect(loc.decisionPoint).to.eql(data.decisionPoint)
      expect(loc.id).to.eql(data.id)
      expect(loc.localId).to.eql(data.localId)
      expect(loc.mapId).to.eql(data.mapId)
      expect(loc.status).to.eql(data.status)
      expect(loc.x).to.eql(data.x)
      expect(loc.y).to.eql(data.y)
      expect(loc.point).to.eql([data.x, data.y])
      expect(loc.zoneId).to.eql(data.zoneId)
    });

  });

})
