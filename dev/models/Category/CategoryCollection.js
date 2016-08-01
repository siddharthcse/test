'use strict'
const Category = require('./Category')

/** Class representing a collection of categories. */
class CategoryColelction {

  /**
   * Create a collection of categories.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Category object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isCategory(item) {
    return item && item.constructor === Category
  }

  /**
   * Generate a single or an array of category based on the input model data
   * @param {Array/Category} model - The model object passed back from the /full payload
   * @return {Array/Category} A created Category instance or an array of Category instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Category(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Category(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Category objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get a specific category by its categoryType
   * @param {Number} categoryType - The categoryType used to define an category
   * @return {Array}
   */
  getByCategoryType(categoryType) {
    return this._items.filter(c => c.categoryType === categoryType)
  }

  /**
   * Get a specific category by its categoryTypeName
   * @param {String} categoryTypeName - The categoryTypeName used to define an category
   * @return {Array}
   */
  getByCategoryTypeName(categoryTypeName) {
    return this._items.filter(c => c.categoryTypeName === categoryTypeName)
  }

  /**
   * Get a specific category by its clientCategoryId
   * @param {String} clientCategoryId - The clientCategoryId used to define an category
   * @return {Array}
   */
  getByClientCategoryId(clientCategoryId) {
    return this._items.filter(c => c.clientCategoryId === clientCategoryId)
  }

  /**
   * Get a specific category by its keyword
   * @param {String} keyword - The keyword used to define an category
   * @return {Array}
   */
  getByKeyword(keyword) {
    if(keyword && keyword.constructor === String) {
      return this._items.filter(c => c.keywords.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
    } else {
      return []
    }
  }

  /**
   * Get a specific category by its name
   * @param {String} name - The name used to define an category
   * @return {Array}
   */
  getByName(name) {
    if(name && name.constructor === String) {
      return this._items.find(c => c.name.toLowerCase() === name.toLowerCase()) || null
    } else {
      return null
    }
  }

  /**
   * Get a specific category by its id
   * @param {Number} id - The id used to define an category
   * @return {Array}
   */
  getById(id) {
    return this._items.find(c => c.id === id) || null
  }

}

module.exports = CategoryColelction
