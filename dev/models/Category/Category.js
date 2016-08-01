'use strict'
/** Class representing a category. */
class Category {
  /**
   * Create a category.
   * @param {object} model - The model object passed back from the /full payload
   */
  constructor(model) {
    this._ = {}
    for(var property in model) {
      if(model.hasOwnProperty(property)) {
        this._[property] = model[property]
      }
    }
  }

  get(prop, _default) {
    return this._[prop] !== undefined ? this._[prop] : _default
  }

  set(prop, value, constructor, _default) {
    if(value.constructor === constructor) {
      this._[prop] = value
    } else {
      this._[prop] = _default
    }
  }

  /**
   * @member {Number}   Category#tegoryType
   */
  get categoryType() {
    return this.get('categoryType', null)
  }
  set categoryType(categoryType) {
    this.set('categoryType', categoryType, Number, null)
  }

  /**
   * @member {String}   Category#categoryTypeName
   */
  get categoryTypeName() {
    return this.get('categoryTypeName', '')
  }
  set categoryTypeName(categoryTypeName) {
    this.set('categoryTypeName', categoryTypeName, String, '')
  }

  /**
   * @member {String}   Category#clientCategoryId
   */
  get clientCategoryId() {
    return this.get('clientCategoryId', '')
  }
  set clientCategoryId(clientCategoryId) {
    this.set('clientCategoryId', clientCategoryId, String, '')
  }

  /**
   * @member {Number}   Category#id
   */
  get id() {
    return this.get('id', null)
  }
  set id(id) {
    this.set('id', id, Number, null)
  }

  /**
   * @member {String}   Category#keywords
   */
  get keywords() {
    return this.get('keywords', '')
  }
  set keywords(keywords) {
    this.set('keywords', keywords, String, '')
  }

  /**
   * @member {String}   Category#name
   */
  get name() {
    return this.get('name', '')
  }
  set name(name) {
    this.set('name', name, String, '')
  }

  /**
   * @member {Number}   Category#parent
   */
  get parent() {
    return this.get('parent', null)
  }
  set parent(parent) {
    this.set('parent', parent, Number, null)
  }

  /**
   * @member {Number}   Category#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }
  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {String}   Category#text
   */
  get text() {
    return this.get('text', '')
  }
  set text(text) {
    this.set('text', text, String, '')
  }

}

module.exports = Category
