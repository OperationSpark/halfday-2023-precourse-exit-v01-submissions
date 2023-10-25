/**
 * Step 1 | Recursion
 *
 * - Find all keys of a provided name in an Object (and nested Objects)
 * - Rename the keys to the provided `newKey` while preserving the value
 *
 * ### Must use recursion in your solution
 */
let replaceKeysInObj = (obj, targetKey, newKey) => {
  // your code here
  //i : obj and target key and the new name for the key
  //o : object with renamed keys
  //constraints: the object is nested
  //edge cases: the nested objects

  //for each key in obj, we need to check if its name is equal to target key
  //if the key name is equal to the target key, set the keys name to newKey
  //if the object is nested, recurse the funtion inside of the if statement to do it for each nested key


  for (const key in obj) {

    if (key === targetKey) {

      key = newKey
    }


    if (typeof key === "object") {
      return replaceKeysInObj(obj, targetKey, newKey)
    }


    return replaceKeysInObj(obj, targetKey, newKey)

  }


  return obj
};

/**
 * Step 2
 *
 * Executing Higher Order Functions
 */

const antennaLocation = { lat: 29.9512317, lon: -90.0814391 };

const customers = [
  { lat: 52.793043, lon: 18.231232, tel: '243-334-3008', name: 'Kayes' },
  { lat: 14.5272379, lon: -87.2157947, tel: '154-700-5634', name: 'Timony' },
  { lat: 42.3369976, lon: 23.5527975, tel: '788-299-1863', name: 'Goodban' },
  { lat: 29.673196, lon: 110.73404, tel: '399-141-3895', name: 'Ralling' },
  { lat: 44.2136985, lon: 3.9996505, tel: '901-711-1889', name: 'Dabs' },
  { lat: 8.0693651, lon: 123.535497, tel: '184-179-9672', name: 'Brookwood' },
  { lat: 13.3304675, lon: -13.8694543, tel: '690-224-9625', name: 'Ommanney' },
  { lat: 55.0375016, lon: 43.2464427, tel: '695-307-7107', name: 'Skerm' },
  { lat: 32.6901244, lon: -96.937016, tel: '972-164-7806', name: 'Falls' },
  { lat: -30.2932904, lon: 28.7693554, tel: '965-920-0577', name: 'Bernette' }
];

/**
 * Solve by chaining native methods of map and filter only
 */
const customersFilteredAndMapped = customers => {
  // Your code here


  //i : customers
  //o : array of objects
  //constraints:
  //edge cases:


  //we start by filtering customers by the ones that are within 55 km of the tower
  //then we use map to make a new key called dist and add it to each customer
  //remove lat and lon keys


  const result = customers.filter((customer) => calcDist(antennaLocation, customer) <= 55)

  result.map((customer) => {
    customer.dist = `${Math.round(calcDist(antennaLocation, customer))} km`
    // delete customer.lat
    // delete customer.lon
  })


  console.log(result)
  return result







};

/**
 * Solve by using native method of reduce only
 */
const customersReduced = customers => {
  // Your code here

  //i : customers
  //o : array of objects
  //constraints:
  //edge cases:

  //since we cant filter, we need a foor loop to go through every customer
  //for every index in customers, we need to apply the calc dist function
  //we then add the dist key to the customers
  customers.reduce(calcDist(antennaLocation, customers))

    for(i = 0; i < customers.length; i++){
      customers[i].dist = `${Math.round(calcDist(antennaLocation, customers[i]))} km`
      return customers
    }






};

/**
 * calcDist takes two location points and
 * returns the distance in kilometers between them.
 * Each point should an Object: { lat: <number>, log: <number> }
 */
function calcDist(point1, point2) {
  // DO NOT CHANGE THIS FUNCTION
  const toRadians = num => (num * Math.PI) / 180;

  const earthRadius = 6371e3; // meters
  const φ1 = toRadians(point1.lat);
  const φ2 = toRadians(point2.lat);
  const Δφ = toRadians(point2.lat - point1.lat);
  const Δλ = toRadians(point2.lon - point1.lon);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const dist = earthRadius * c;
  return dist / 1000;
  // ^^^ DO NOT CHANGE THIS FUNCTION ^^^
}
