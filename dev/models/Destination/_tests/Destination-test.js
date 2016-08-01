'use strict'
const chai = require('chai')
const expect = chai.expect

const Destination = require('../Destination')

describe('Destination', function() {

  describe('init with defaults', function() {
    let data = {
      clientId: '',
      description: '',
      descriptionMore: '',
      helperImage: '',
      id: null,
      keywords: '',
      name: '',
      openingDate: null,
      operatingStatus: null,
      projectId: null,
      sponsoredRating: null
    }

    let loc = new Destination({})

    it('should give default values', function() {
      expect(loc.clientId).to.eql(data.clientId)
      expect(loc.description).to.eql(data.description)
      expect(loc.descriptionMore).to.eql(data.descriptionMore)
      expect(loc.helperImage).to.eql(data.helperImage)
      expect(loc.id).to.eql(data.id)
      expect(loc.keywords).to.eql(data.keywords)
      expect(loc.name).to.eql(data.name)
      expect(loc.openingDate).to.eql(data.openingDate)
      expect(loc.operatingStatus).to.eql(data.operatingStatus)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.sponsoredRating).to.eql(data.sponsoredRating)
    });

  });

  describe('init with good data', function() {
    let data = {
      clientId: '56115',
      description: 'Ernest ',
      descriptionMore: '0208 811 8880',
      helperImage: 'http://res.cloudinary.com/wlabs/image/upload/vfshdohrferhnkl3dtda.png',
      id: 10870343,
      keywords: 'Fashion,Watches,Jewelry',
      name: 'Ernest Jones',
      openingDate: 1426118400000,
      operatingStatus: 1,
      projectId: 264,
      sponsoredRating: 0
    }

    let loc = new Destination(data)

    it('should reflect input', function() {
      expect(loc.clientId).to.eql(data.clientId)
      expect(loc.description).to.eql(data.description)
      expect(loc.descriptionMore).to.eql(data.descriptionMore)
      expect(loc.helperImage).to.eql(data.helperImage)
      expect(loc.id).to.eql(data.id)
      expect(loc.keywords).to.eql(data.keywords)
      expect(loc.name).to.eql(data.name)
      expect(loc.openingDate).to.eql(data.openingDate)
      expect(loc.operatingStatus).to.eql(data.operatingStatus)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.sponsoredRating).to.eql(data.sponsoredRating)
    });

  });

})
