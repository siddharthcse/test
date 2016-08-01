'use strict'
console.time('Map 1')
window.building = new window.JMap({
  server: 'https://maps.westfield.io',
  locationId: 263,
  onReady: onReady
})
//
// console.time('Map 2')
// window.map2 = new window.JMap({
//   server: 'https://maps.westfield.io',
//   locationId: 262,
//   onReady: function(err){
//     console.log(wayfind(window.map2))
//   }
// })

function onReady(err){
  console.timeEnd('Map 1')
  if(err) throw err
  
  //Get Starting location
  let myKiosk = building.DeviceCollection.getAll()[0]
  // let myKiosk = building.DeviceCollection.getById(1234)
  
  //Access level
  let usingElevators = false
  
  //Filter to define an anchor
  let isAnchor = destination => destination.sponsoredRating >= 50
  
  
  //Get closest anchor to kiosk
  let closestAnchor = building.getClosestDestinationToWaypoint(myKiosk.waypoints[0], isAnchor, usingElevators)
  
  //Log anchor name and waypoint id
  console.log('Closest anchor to me is ' + closestAnchor.destination.name) // Closest anchor to me is Bloomingdale's
  
  
  
  // //Find the closest restroom
  //
  // let isRestroom = amenity => amenity.description.toLowerCase() === 'restroom'
  //
  // let closestRestroom = building.getClosestAmenityToWaypoint(myKiosk.waypoints[0], isRestroom, usingElevators)
  //
  // let path = building.Wayfinder.search(myKiosk.waypoints[0], closestRestroom.waypoint, usingElevators)
  //
  // console.log(path) // [WayfinderData, WayfinderData]
  
  
  //Get start/end
  let start = building.MapCollection.getAllWaypoints()[0]
  // let start = building.MapCollection.getWaypointByWaypointId(54321)
  // let endDestination = building.DestinationCollection.getById(98765)
  let endDestination = building.DestinationCollection.getAll()[0]
  
  //Access level
  // let usingElevators = false
  
  //Destinations can have multiple waypoints, find the closest one.
  let end = building.getClosestWaypointInArrayToWaypoint(endDestination.waypoints, start, usingElevators)
  
  //Find path
  let path = building.Wayfinder.search(start, end, usingElevators)
  
  let instructions = building.TextDirections.compile(path)
  
  //Initially seperated by map
  let flatInstructions = instructions.reduce((arr, inst) => { return arr.concat(inst) }, [])
  
  flatInstructions.forEach((inst) => {
    console.log(inst.output) // With X on your Y turn Z
  })
  
  
  
  
  
  
}


