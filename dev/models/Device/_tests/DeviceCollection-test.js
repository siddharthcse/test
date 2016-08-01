'use strict'
const chai = require('chai')
const expect = chai.expect

const DeviceCollection = require('../DeviceCollection')
const _Device = require('../Device')

describe('Device', function() {
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
        const Device = jmap.DeviceCollection

        describe('DeviceCollection - Tests', function() {

          describe('create', function() {
            it('should instanciate by itself', function() {
              expect(Device).to.be.an.instanceof(DeviceCollection)
            });

            it('should instanciate a single by using #create', function() {
              let a = Device.create(jmap.response.body.devices[0])
              expect(a).to.be.an.instanceof(_Device)
            })

            it('should instanciate an array by using #create', function() {
              let a = Device.create(jmap.response.body.devices)
              a.forEach((_a) => {
                expect(_a).to.be.an.instanceof(_Device)
              })
            })

          });

          describe('isDevice', function() {
            it('should return true if item is Device', function() {
              let item = Device.getAll()[0]
              expect(Device.isDevice(item)).to.equal(true)
            })
            it('should return false if item is not Device', function() {
              let item = {}
              expect(Device.isDevice(item)).to.equal(false)
            })
          });

          describe('getAll', function() {
            it('should return all created objects', function() {
              expect(Device.getAll()).to.equal(Device._items)
            })
          });

          describe('getById', function() {

            it('should return Device by its id', function() {
              let d = Device.getById(Device._items[0].id)
              expect(d).to.be.an.instanceof(_Device)
              expect(d).to.equal(Device._items[0])
            })

            it('should return null if nothing is found', function() {
              let d = Device.getById(0)
              expect(d).to.equal(null)
            })

          })

          describe('getByMapId', function() {

            it('should return array of devices by its mapId', function() {
              let mapId = Device._items[0].waypoints[0].mapId
              let d = Device.getByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Device)
                let wps = _d.waypoints.filter(wp => wp.mapId === mapId)
                expect(wps).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let mapId = 1
              let d = Device.getByMapId(mapId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          })

          describe('getByWaypointId', function() {

            it('should return array of devices associated with a waypointId', function() {
              let wpId = Device._items[0].waypoints[0].id
              let d = Device.getByWaypointId(wpId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Device)
                let wps = _d.waypoints.filter(wp => wp.id === wpId)
                expect(wps).to.have.length.above(0)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let wpId = 1
              let d = Device.getByWaypointId(wpId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          });

          describe('getByDeviceTypeId', function() {

            it('should return array of devices associated with a deviceTypeId', function() {
              let deviceTypeId = Device._items[0].deviceTypeId
              let d = Device.getByDeviceTypeId(deviceTypeId)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Device)
                expect(_d.deviceTypeId).to.equal(deviceTypeId)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let deviceTypeId = null
              let d = Device.getByDeviceTypeId(deviceTypeId)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          });

          describe('getByStatus', function() {

            it('should return array of devices associated with a status', function() {
              let status = Device._items[0].status
              let d = Device.getByStatus(status)
              expect(d).to.be.an.instanceof(Array)

              d.forEach((_d) => {
                expect(_d).to.be.an.instanceof(_Device)
                expect(_d.status).to.equal(status)
              })
            })

            it('should return empty Array if nothing is found', function() {
              let status = null
              let d = Device.getByStatus(status)
              expect(d).to.be.an.instanceof(Array)
              expect(d).to.have.length(0)
            })

          });

          done()
        });
      }
    })
  });
})
