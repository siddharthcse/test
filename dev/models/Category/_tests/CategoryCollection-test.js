'use strict'
const chai = require('chai')
const expect = chai.expect

const CategoryCollection = require('../CategoryCollection')
const _Category = require('../Category')

describe('CategoryCollection', function() {
  it('should initialize jmap', function(done) {

    const JMap = require('../../../jmap/jmap')
    const jmap = new JMap({
      server: 'https://maps.westfield.io',
      locationId: 263,
      request: require('request'),
      DOMParser: require('xmldom').DOMParser,
      onReady: (err) => {
        if(err) throw err
          /* All tests go here */
          //Wait for data
        const Category = jmap.CategoryCollection

        describe('CategoryCollection - tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(Category).to.be.an.instanceof(CategoryCollection)
            });

            it('should instanciate a single by using #create', function() {
              let test = Category.create(jmap.response.body.categories[0])
              expect(test).to.be.an.instanceof(_Category)
            })

            it('should instanciate an array by using #create', function() {
              let test = Category.create(jmap.response.body.categories)
              test.forEach((_test) => {
                expect(_test).to.be.an.instanceof(_Category)
              })
            })

          })

          describe('isCategory', function() {
            it('should return true if item is Category', function() {
              let item = Category.getAll()[0]
              expect(Category.isCategory(item)).to.equal(true)
            })
            it('should return false if item is not Category', function() {
              let item = {}
              expect(Category.isCategory(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(Category.getAll()).to.equal(Category._items)
            })
          });

          describe('getByCategoryType', function() {

            it('should return array of Category associated with a categoryType', function() {
              let categoryType = Category._items[0].categoryType
              let c = Category.getByCategoryType(categoryType)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length.above(0)

              c.forEach((_c) => {
                expect(_c).to.be.an.instanceof(_Category)
                expect(_c.categoryType).to.equal(categoryType)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let categoryType = null
              let c = Category.getByCategoryType(categoryType)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length(0)
            })

          })

          describe('getByCategoryTypeName', function() {

            it('should return array of Category associated with a categoryTypeName', function() {
              let categoryTypeName = Category._items[0].categoryTypeName
              let c = Category.getByCategoryTypeName(categoryTypeName)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length.above(0)

              c.forEach((_c) => {
                expect(_c).to.be.an.instanceof(_Category)
                expect(_c.categoryTypeName).to.equal(categoryTypeName)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let categoryTypeName = null
              let c = Category.getByCategoryTypeName(categoryTypeName)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length(0)
            })

          })

          describe('getByClientCategoryId', function() {

            it('should return array of Category associated with a clientCategoryId', function() {
              let clientCategoryId = Category._items[0].clientCategoryId
              let c = Category.getByClientCategoryId(clientCategoryId)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length.above(0)

              c.forEach((_c) => {
                expect(_c).to.be.an.instanceof(_Category)
                expect(_c.clientCategoryId).to.equal(clientCategoryId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let clientCategoryId = null
              let c = Category.getByClientCategoryId(clientCategoryId)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length(0)
            })

          })

          describe('getByKeyword', function() {

            it('should return array of Category associated with a keyword', function() {
              let keyword = Category._items[0].keywords.split(',')[0]
              let c = Category.getByKeyword(keyword)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length.above(0)

              c.forEach((_c) => {
                expect(_c).to.be.an.instanceof(_Category)
                expect(_c.keywords).to.have.string(keyword)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let keyword = null
              let c = Category.getByKeyword(keyword)
              expect(c).to.be.an.instanceof(Array)
              expect(c).to.have.length(0)
            })

          })

          describe('getByName', function() {

            it('should return Category by its name', function() {
              let c = Category.getByName(Category._items[0].name)
              expect(c).to.be.an.instanceof(_Category)
              expect(c).to.equal(Category._items[0])
            })

            it('should return null if nothing is found', function() {
              let c = Category.getByName(null)
              expect(c).to.equal(null)
            })

          })

          describe('getById', function() {

            it('should return Category by its id', function() {
              let c = Category.getById(Category._items[0].id)
              expect(c).to.be.an.instanceof(_Category)
              expect(c).to.equal(Category._items[0])
            })

            it('should return null if nothing is found', function() {
              let c = Category.getById(null)
              expect(c).to.equal(null)
            })

          })

          done()
        });
      }
    })
  });
})
