'use strict'
const Device = require('./Device')
  /** Class representing an collection of Devices. */
class DeviceCollection {

  /**
   * Create a collection of Devices.
   */
  constructor() {
    this._items = []
  }

  /**
   * Returns a boolean for weather or not argument is constructed as an Device object
   * @param {Object} item - Item to evaluate
   * @return {Boolean} Boolean based on evaluation result
   */
  isDevice(item) {
    return item && item.constructor === Device
  }

  /**
   * Generate a single or an array of devices based on the input model data
   * @param {Array/Device} model - The model object passed back from the /full payload
   * @return {Array/Device} A created Device instance or an array of Device instances
   */
  create(model) {
    let res = null;
    if(model) {
      if(model.constructor === Array) {
        res = model.map(m => new Device(m))
        this._items = this._items.concat(res)
      } else if(model.constructor === Object) {
        res = new Device(model)
        this._items.push(res)
      }
    }
    return res
  }

  /**
   * Get all Device objects
   * @return {Array}
   */
  getAll() {
    return this._items
  }

  /**
   * Get a specific Device by its componentId
   * @param {Number} componentId - The component id used to define a Device
   * @return {Device}
   */
  getById(id) {
    return this._items.find((device) => {
      return device.id === id
    }) || null
  }

  /**
   * Get a specific set of devices by its mapId
   * @param {Number} mapId - The id used to define a map
   * @return {Array} an array of devices
   */
  getByMapId(mapId) {
    return this._items.filter((Device) => {
      return Device.waypoints.find(w => w.mapId === mapId)
    })
  }

  /**
   * Get a specific set of devices belonging to a waypoint
   * @param {Number} waypointId - The id used to define a waypoint
   * @return {Array} an array of devices
   */
  getByWaypointId(waypointId) {
    return this._items.filter((Device) => {
      return Device.waypoints.find(w => w.id === waypointId)
    })
  }

  /**
   * Get a specific set of devices by its deviceTypeId
   * @param {Number} deviceTypeId - The deviceTypeId used to define a device type
   * @return {Array} an array of devices
   */
  getByDeviceTypeId(deviceTypeId) {
    return this._items.filter((device) => {
      return device.deviceTypeId === deviceTypeId
    })
  }

  /**
   * Get a specific set of devices by its deviceTypeId
   * @param {String} Status - The status used to define a device type "Active" || "Inactive"
   * @return {Array} an array of devices
   */
  getByStatus(status) {
    if(status && status.constructor === String) {
      return this._items.filter(device => device.status.toLowerCase() === status.toLowerCase())
    } else {
      return []
    }
  }

}

module.exports = DeviceCollection
