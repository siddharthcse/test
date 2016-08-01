'use strict'
const chai = require('chai')
const expect = chai.expect

const Location = require('../Location')

describe('Location', function() {

  describe('init with good data', function() {
    let data = {
      addresses: [],
      clientProjectId: 'sanfrancisco',
      languages: ['en', 'fr'],
      locationId: 9,
      locationName: 'San Francisco Centre',
      name: 'SFC',
      projectId: 263,
      status: 'Active'
    }

    let loc = new Location(data)

    it('should reflect input', function() {
      expect(loc.addresses).to.equal(data.addresses)
      expect(loc.clientProjectId).to.equal(data.clientProjectId)
      expect(loc.languages).to.equal(data.languages)
      expect(loc.locationId).to.equal(data.locationId)
      expect(loc.locationName).to.equal(data.locationName)
      expect(loc.name).to.equal(data.name)
      expect(loc.projectId).to.equal(data.projectId)
      expect(loc.status).to.equal(data.status)
    });

    Location._items = []

  });

  describe('init with defaults', function() {
    let data = {
      addresses: [],
      clientProjectId: '',
      languages: [],
      locationId: null,
      locationName: '',
      name: '',
      projectId: null,
      status: ''
    }

    let loc = new Location({})

    Location._items = []

    it('should give default values ', function(done) {
      expect(loc.addresses).to.eql(data.addresses)
      expect(loc.clientProjectId).to.eql(data.clientProjectId)
      expect(loc.languages).to.eql(data.languages)
      expect(loc.locationId).to.eql(data.locationId)
      expect(loc.locationName).to.eql(data.locationName)
      expect(loc.name).to.eql(data.name)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.status).to.eql(data.status)
      done()
    });

  });

})
