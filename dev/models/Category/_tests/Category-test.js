'use strict'
const chai = require('chai')
const expect = chai.expect

const Category = require('../Category')

describe('Category', function() {

  describe('init with defaults', function() {
    let data = {
      categoryType: null,
      categoryTypeName: '',
      clientCategoryId: '',
      id: null,
      keywords: '',
      name: '',
      parent: null,
      projectId: null,
      text: ''
    }

    let loc = new Category({})

    it('should give default values', function() {
      expect(loc.categoryType).to.eql(data.categoryType)
      expect(loc.categoryTypeName).to.eql(data.categoryTypeName)
      expect(loc.clientCategoryId).to.eql(data.clientCategoryId)
      expect(loc.id).to.eql(data.id)
      expect(loc.keywords).to.eql(data.keywords)
      expect(loc.name).to.eql(data.name)
      expect(loc.parent).to.eql(data.parent)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.text).to.eql(data.text)
    });

  });

  describe('init with good data', function() {
    let data = {
      categoryType: 1,
      categoryTypeName: 'Indoor',
      clientCategoryId: '259',
      id: 97514,
      keywords: 'Boardshorts',
      name: 'Boardshorts',
      parent: 97485,
      projectId: 264,
      text: 'Boardshorts'
    }

    let loc = new Category(data)

    it('should reflect input', function() {
      expect(loc.categoryType).to.eql(data.categoryType)
      expect(loc.categoryTypeName).to.eql(data.categoryTypeName)
      expect(loc.clientCategoryId).to.eql(data.clientCategoryId)
      expect(loc.id).to.eql(data.id)
      expect(loc.keywords).to.eql(data.keywords)
      expect(loc.name).to.eql(data.name)
      expect(loc.parent).to.eql(data.parent)
      expect(loc.projectId).to.eql(data.projectId)
      expect(loc.text).to.eql(data.text)
    });

  });

})
