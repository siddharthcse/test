'use strict'
const chai = require('chai')
const expect = chai.expect

const Amenity = require('../Amenity')
const _DOMParser = require('xmldom').DOMParser

describe('Amenity', function() {

  describe('init with defaults', function() {
    let data = {
      componentId: null,
      componentTypeId: null,
      componentTypeName: '',
      description: '',
      destinations: [],
      endDate: null,
      filePath: '',
      iconImagePath: '',
      localizedText: '',
      position: '',
      projectId: null,
      startDate: null,
      waypoints: []
    }

    let loc = new Amenity(data, _DOMParser)

    it('should give default values', function() {
      expect(loc.componentId).to.eql(data.componentId)
      expect(loc.componentTypeId).to.eql(data.componentTypeId)
      expect(loc.componentTypeName).to.eql(data.componentTypeName)
      expect(loc.description).to.eql(data.description)
      expect(loc.destinations).to.eql(data.destinations)
      expect(loc.endDate).to.eql(data.endDate)
      expect(loc.filePath).to.eql(data.filePath)
      expect(loc.iconImagePath).to.eql(data.iconImagePath)
      expect(loc.localizedText).to.eql(data.localizedText)
      expect(loc.position).to.eql(data.position)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.startDate).to.eql(data.startDate)
      expect(loc.waypoints).to.eql(data.waypoints)
    });

  });

  describe('init with good data', function() {
    let data = {
      bean: {
        componentId: 126290,
        componentTypeId: 11,
        componentTypeName: 'Legend Item',
        description: 'ADA',
        destinations: [],
        endDate: 2524694399000,
        filePath: '/cms/components/legend/126290_1_264_wf-amenities-v6_ADA-Default-Alt_1.svg',
        iconImagePath: '/cms/components/legend/defaults/ADA-Default.png',
        localizedText: 'ADA',
        position: 'null',
        projectId: 264,
        startDate: 1452545760609,
      },
      waypoints: []
    }

    let loc = new Amenity(data, _DOMParser)

    it('should reflect input', function() {
      expect(loc.componentId).to.eql(data.bean.componentId)
      expect(loc.componentTypeId).to.eql(data.bean.componentTypeId)
      expect(loc.componentTypeName).to.eql(data.bean.componentTypeName)
      expect(loc.description).to.eql(data.bean.description)
      expect(loc.destinations).to.eql(data.bean.destinations)
      expect(loc.endDate).to.eql(data.bean.endDate)
      expect(loc.filePath).to.eql(data.bean.filePath)
      expect(loc.iconImagePath).to.eql(data.bean.iconImagePath)
      expect(loc.localizedText).to.eql(data.bean.localizedText)
      expect(loc.position).to.eql(data.bean.position)
      expect(loc.projectId).to.eql(data.bean.projectId)
      expect(loc.startDate).to.eql(data.bean.startDate)
      expect(loc.waypoints).to.eql(data.waypoints)
    });

  });

})
