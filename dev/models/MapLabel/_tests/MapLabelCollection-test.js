'use strict'
const chai = require('chai')
const expect = chai.expect
const MapLabel = require('../MapLabel')
const MapLabelCollection_ = require('../MapLabelCollection')
const MapLabelCollection = new MapLabelCollection_()

describe('MapLabelCollection', function() {

  let data = [{
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
  }, {
    ck: 'trsdfue',
    componentId: 12653405,
    componentTypeName: 'Map gerLabels',
    description: 'Maaegerrket St.',
    label: 'Marefefket St.',
    localizedText: 'Maasdedrket St.',
    locationId: 1234347306,
    locationX: '2asa431.25',
    locationY: '25asa15.15',
    mapId: 2220,
    projectId: 23363,
    rotation: '34415',
    typeId: 24443,
    zoomlevel: 444
  }]

  MapLabelCollection.create(data)

  it('should instanciate properly', function() {
    expect(MapLabelCollection).to.be.an.instanceof(MapLabelCollection_)
  });

  describe('isMapLabel', function() {
    it('should return true if item is MapLabel', function() {
      let item = MapLabelCollection.getAll()[0]
      expect(MapLabelCollection.isMapLabel(item)).to.equal(true)
    })
    it('should return false if item is not MapLabel', function() {
      let item = {}
      expect(MapLabelCollection.isMapLabel(item)).to.equal(false)
    })
  });

  describe('getAll', function() {
    let test = MapLabelCollection.getAll()

    expect(test).to.be.an.instanceof(Array)

    test.forEach((a, index) => {
      expect(a).to.be.an.instanceof(MapLabel)
        // expect(a.entityId).to.equal(data[index].componentId)
    })
  });

})
