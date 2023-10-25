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
  for (let key in obj) {//iterates through the currently-selected object or inner-object
    if (key === targetKey) {//when the targetKey is found...
      obj[newKey] = obj[key];//a new key-value pair is created with the key of the inputted newKey and the value of the value linked to the found targetKey
      delete (obj[key]);//the targetKey and it's value are deleted to make sure that the total number of key-value pairs do not change
    }
    if (typeof (obj[key]) === "object") {//checks to see if a key's value is an object, and if it is, recalls the function to run within that inner-object
      replaceKeysInObj(obj[key], targetKey, newKey);//recursive case (constraint)
    }
  }
  return obj;//base case that returns the altered object as the output (ends the function when the last iteration of the for loop has finished going through the last available object or sub-object)
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
  let newArr = customers.map((customer) => {//alters each customer so that the lat and lon key-value pairs are replaced with a dist key-value pair using the calcDist function
    let customerLoc = { ...customer };//repeatedly creates two temporary object clones to use without altering the original input objects (each customer)
    let tempCustomer = { ...customer };
    delete (tempCustomer.lat);//deletes the lat and lon from the tempCustomer so that they may be replaced with dist later on
    delete (tempCustomer.lon);
    delete (customerLoc.tel);//deletes everything except the lat and lon from customerLoc so that it may be used to get the customer's distance from the antenna later on
    delete (customerLoc.name);
    let numHolder = calcDist(antennaLocation, customerLoc);//the distance between the customer an the antenna is calculated using ca;cDist and then assigned to a variable
    tempCustomer.dist = Math.floor(numHolder) + "km";//tempCustomer is given a new key of the name "dist", which is assigned the number of km between the customer and the antenna rounded down to the nearest integer
    return tempCustomer//returns tempCustomer as an output to be used as an input in the filter function
  }).filter((customer) => {//removes all customers from the array who have a dist value above 55km
    let comparisonNumber = customer.dist.slice(0, 2)//removes the "km" from the distance variable of the customer and assigns it to a new variable to save it for use later in the filter function
    return comparisonNumber <= 55;//this gets rid of all the customers in newArr that are over 55km away from the antenna
  });
  return newArr;//main output
};

/**
 * Solve by using native method of reduce only
 */
const customersReduced = customers => {
  // Your code here
  let result = customers.reduce((newArr, customer) => {//alters each customer so that the lat and lon key-value pairs are replaced with a dist key-value pair using the calcDist function
    let customerLoc = { ...customer };//repeatedly creates two temporary object clones to use without altering the original input objects (each customer)
    let tempCustomer = { ...customer };
    delete (tempCustomer.lat);//deletes the lat and lon from the tempCustomer so that they may be replaced with dist later on
    delete (tempCustomer.lon);
    delete (customerLoc.tel);//deletes everything except the lat and lon from customerLoc so that it may be used to get the customer's distance from the antenna later on
    delete (customerLoc.name);
    let numHolder = calcDist(antennaLocation, customerLoc);//the distance between the customer an the antenna is calculated using ca;cDist and then assigned to a variable
    tempCustomer.dist = Math.floor(numHolder) + "km";//tempCustomer is given a new key of the name "dist", which is assigned the number of km between the customer and the antenna rounded down to the nearest integer
    let comparisonNumber = tempCustomer.dist.slice(0, 2)//removes the "km" from the distance variable of the customer and assigns it to a new variable to save it for use later in the reduce function
    if (comparisonNumber <= 55) {
      newArr.push(tempCustomer);//adds the altered customer onto the newArr if the distance between the customer and the antenna is below 55
    }
    return newArr//the output that is ultimately returned by the main output
  }, [])
  return result;//The main output
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
