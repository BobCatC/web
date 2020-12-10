export class Location {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

export const saintPetersburgLocation = new Location(59.894444, 30.264168);

export function getLocation(geolocation, defaultLocation = saintPetersburgLocation) {
  // const geolocation = navigator.geolocation;
  return new Promise(function (resolve, _) {
    geolocation.getCurrentPosition(l => {
      const location = new Location(l.coords.latitude, l.coords.longitude)
      resolve(location)
    }, error => {
      console.log(`Unable to get current location, using default: ${defaultLocation}. Error: ${error}`)
      resolve(defaultLocation)
    })
  })
}