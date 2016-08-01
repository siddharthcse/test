'use strict'
/** Class representing an destination. */
class Destination {
  /**
   * Create an destination.
   * @param {object} model - The model object passed back from the /full payload
   */
  constructor(model) {
    this._ = {
      waypoints: []
    }

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
   * @member {Array}   Destination#category
   */
  get category() {
    return this.get('category', [])
  }

  set category(category) {
      this.set('category', category, Array, [])
    }
    /**
     * @member {Array}   Destination#categoryId
     */
  get categoryId() {
    return this.get('categoryId', [])
  }

  set categoryId(categoryId) {
    this.set('categoryId', categoryId, Array, [])
  }

  /**
   * @member {String}   Destination#clientId
   */
  get clientId() {
    return this.get('clientId', '')
  }

  set clientId(clientId) {
    this.set('clientId', clientId, String, '')
  }

  /**
   * @member {String}   Destination#description
   */
  get description() {
    return this.get('description', '')
  }

  set description(description) {
    this.set('description', description, String, '')
  }

  /**
   * @member {String}   Destination#descriptionMore
   */
  get descriptionMore() {
    return this.get('descriptionMore', '')
  }

  set descriptionMore(descriptionMore) {
    this.set('descriptionMore', descriptionMore, String, '')
  }

  /**
   * @member {String}   Destination#helperImage
   */
  get helperImage() {
    return this.get('helperImage', '')
  }

  set helperImage(helperImage) {
    this.set('helperImage', helperImage, String, '')
  }

  /**
   * @member {Number}   Destination#id
   */
  get id() {
    return this.get('id', null)
  }

  set id(id) {
    this.set('id', id, Number, null)
  }

  /**
   * @member {String}   Destination#keywords
   */
  get keywords() {
    return this.get('keywords', '')
  }

  set keywords(keywords) {
    this.set('keywords', keywords, String, '')
  }

  /**
   * @member {String}   Destination#name
   */
  get name() {
    return this.get('name', '')
  }

  set name(name) {
      this.set('name', name, String, '')
    }
    /**
     * @member {Number}   Destination#openingDate
     */
  get openingDate() {
    return this.get('openingDate', null)
  }

  set openingDate(openingDate) {
    this.set('openingDate', openingDate, Number, null)
  }

  /**
   * @member {Number}   Destination#operatingStatus
   */
  get operatingStatus() {
    return this.get('operatingStatus', null)
  }

  set operatingStatus(operatingStatus) {
    this.set('operatingStatus', operatingStatus, Number, null)
  }

  /**
   * @member {Number}   Destination#projectId
   */
  get projectId() {
    return this.get('projectId', null)
  }

  set projectId(projectId) {
    this.set('projectId', projectId, Number, null)
  }

  /**
   * @member {String}   Destination#qrCodeImage
   */
  get qrCodeImage() {
    return this.get('qrCodeImage', null)
  }

  set qrCodeImage(qrCodeImage) {
    this.set('qrCodeImage', qrCodeImage, String, null)
  }

  /**
   * @member {Number}   Destination#sponsoredRating
   */
  get sponsoredRating() {
    return this.get('sponsoredRating', null)
  }

  set sponsoredRating(sponsoredRating) {
    this.set('sponsoredRating', sponsoredRating, Number, null)
  }

  /**
   * @member {Array}   Destination#waypoints
   */
  get waypoints() {
    return this.get('waypoints', [])
  }

  set waypoints(waypoints) {
    this.set('waypoints', waypoints, Array, [])
  }

}

module.exports = Destination
