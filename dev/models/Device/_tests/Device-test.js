'use strict'
const chai = require('chai')
const expect = chai.expect

const Device = require('../Device')

describe('Device', function() {

  describe('init with defaults', function() {
    let data = {
      description: '',
      deviceTypeDescription: '',
      deviceTypeId: null,
      heading: '',
      id: null,
      projectId: null,
      status: ''
    }

    let loc = new Device({})

    it('should give default values', function() {
      expect(loc.description).to.eql(data.description)
      expect(loc.deviceTypeDescription).to.eql(data.deviceTypeDescription)
      expect(loc.deviceTypeId).to.eql(data.deviceTypeId)
      expect(loc.heading).to.eql(data.heading)
      expect(loc.id).to.eql(data.id)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.status).to.eql(data.status)
    });

  });

  describe('init with good data', function() {
    let data = {
      description: 'TestKiosk-London',
      deviceTypeDescription: 'Kiosk Default - Portrait',
      deviceTypeId: 2,
      heading: '0',
      id: 126304,
      projectId: 264,
      status: 'Active'
    }

    let loc = new Device(data)

    it('should reflect input', function() {
      expect(loc.description).to.eql(data.description)
      expect(loc.deviceTypeDescription).to.eql(data.deviceTypeDescription)
      expect(loc.deviceTypeId).to.eql(data.deviceTypeId)
      expect(loc.heading).to.eql(data.heading)
      expect(loc.id).to.eql(data.id)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.status).to.eql(data.status)
    });

  });

})
