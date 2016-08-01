'use strict'
const chai = require('chai')
const expect = chai.expect

const MapLabel = require('../MapLabel')

describe('MapLabel', function() {

  describe('init with defaults', function() {
    let data = {
      ck: '',
      componentId: null,
      componentTypeName: '',
      description: '',
      label: '',
      localizedText: '',
      locationId: null,
      locationX: '',
      locationY: '',
      mapId: null,
      projectId: null,
      rotation: '',
      typeId: null,
      zoomlevel: null
    }

    let loc = new MapLabel({})

    it('should give default values', function() {
      expect(loc.ck).to.equal(data.ck)
      expect(loc.componentId).to.equal(data.componentId)
      expect(loc.componentTypeName).to.equal(data.componentTypeName)
      expect(loc.description).to.equal(data.description)
      expect(loc.label).to.equal(data.label)
      expect(loc.localizedText).to.equal(data.localizedText)
      expect(loc.locationId).to.equal(data.locationId)
      expect(loc.locationX).to.equal(data.locationX)
      expect(loc.locationY).to.equal(data.locationY)
      expect(loc.mapId).to.equal(data.mapId)
      expect(loc.projectId).to.equal(data.projectId)
      expect(loc.rotation).to.equal(data.rotation)
      expect(loc.typeId).to.equal(data.typeId)
      expect(loc.zoomlevel).to.equal(data.zoomlevel)
    });

  });

  describe('init with good data', function() {
    let data = {
      ck: 'true',
      componentId: 126505,
      componentTypeName: 'Map Labels',
      description: 'Market St.',
      label: 'Market St.',
      localizedText: 'Market St.',
      locationId: 127306,
      locationX: '2431.25',
      locationY: '2515.15',
      mapId: 0,
      projectId: 263,
      rotation: '315',
      typeId: 23,
      zoomlevel: 0
    }

    let loc = new MapLabel(data)

    it('should reflect input', function() {
      expect(loc.ck).to.equal(data.ck)
        // expect(loc.componentId).to.equal(data.componentId)
      expect(loc.componentTypeName).to.equal(data.componentTypeName)
      expect(loc.description).to.equal(data.description)
      expect(loc.label).to.equal(data.label)
      expect(loc.localizedText).to.equal(data.localizedText)
      expect(loc.locationId).to.equal(data.locationId)
      expect(loc.locationX).to.equal(data.locationX)
      expect(loc.locationY).to.equal(data.locationY)
      expect(loc.mapId).to.equal(data.mapId)
      expect(loc.projectId).to.equal(data.projectId)
      expect(loc.rotation).to.equal(data.rotation)
      expect(loc.typeId).to.equal(data.typeId)
      expect(loc.zoomlevel).to.equal(data.zoomlevel)
    });

  });

})
