'use strict'
const chai = require('chai')
const expect = chai.expect
const Association = require('../Association')
const AssociationCollection_ = require('../AssociationCollection')
const AssociationCollection = new AssociationCollection_()

describe('AssociationCollection', function() {

  let data = [{
    entityId: 10915640,
    entityTypeId: 1,
    landmarkRating: 0,
    waypointId: 45948
  }, {
    entityId: 1234,
    entityTypeId: 27,
    landmarkRating: 1,
    waypointId: 909090
  }]

  AssociationCollection.create(data)

  it('should instanciate properly', function() {
    expect(AssociationCollection).to.be.an.instanceof(AssociationCollection_)
  });

  describe('isAssociation', function() {
    it('should return true if item is Association', function() {
      let item = AssociationCollection.getAll()[0]
      expect(AssociationCollection.isAssociation(item)).to.equal(true)
    })
    it('should return false if item is not Association', function() {
      let item = {}
      expect(AssociationCollection.isAssociation(item)).to.equal(false)
    })
  });

  describe('getByEntityId', function() {
    let test = AssociationCollection.getByEntityId(data[0].entityId)

    expect(test).to.be.an.instanceof(Array)

    test.forEach((a) => {
      expect(a).to.be.an.instanceof(Association)
      expect(a.entityId).to.equal(data[0].entityId)
    })
  });

  describe('getByEntityTypeId', function() {
    let test = AssociationCollection.getByEntityTypeId(data[1].entityTypeId)

    expect(test).to.be.an.instanceof(Array)

    test.forEach((a) => {
      expect(a).to.be.an.instanceof(Association)
      expect(a.entityTypeId).to.equal(data[1].entityTypeId)
    })
  });

})
