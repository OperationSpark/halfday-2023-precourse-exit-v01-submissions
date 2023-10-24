/* global chai sinon shuffle replaceKeysInObj doctorsReduced */
/* global doctorsFilteredAndMapped doctorsReduced doctors */

'use strict';
mocha.setup('bdd');

const assert = (window.assert = chai.assert);
const expect = (window.expect = chai.expect);
const should = (window.should = chai.should());

describe('1) Replace keys in object', function () {
  var tallyKeys = function (obj) {
    let count = 0;
    for (const k in obj) {
      if (typeof obj[k] === 'object') {
        count += tallyKeys(obj[k]);
      }
      count++;
    }
    return count;
  };

  it('should return an object', function () {
    const input = {
      echo: { xray: 'yankee' },
      tango: {
        romeo: { echo: 'romeo' },
        papa: { yankee: 'romeo' }
      },
      yankee: 'echo'
    };
    expect(typeof replaceKeysInObj(input, 'romeo', 'alpha')).to.equal('object');
    expect(typeof replaceKeysInObj(input, 'echo', 0)).to.equal('object');
  });

  it('should return object containing renamed keys', function () {
    const input = {
      echo: { xray: 'yankee' },
      tango: {
        romeo: { echo: 'romeo' },
        papa: { yankee: 'romeo' }
      },
      yankee: 'echo'
    };
    const output = replaceKeysInObj(input, 'echo', 'foxtrot');

    expect(output.echo).to.equal(undefined);
    expect(output.foxtrot.xray).to.equal('yankee');
    expect(output.tango.romeo.echo).to.equal(undefined);
    expect(output.tango.romeo.foxtrot).to.equal('romeo');
    expect(output.tango.papa.yankee).to.equal('romeo');
    expect(output.yankee).to.equal('echo');

    expect(output.hasOwnProperty('echo')).to.equal(false);
    expect(output.hasOwnProperty('foxtrot')).to.equal(true);
    expect(output.hasOwnProperty('tango')).to.equal(true);
    expect(output.hasOwnProperty('yankee')).to.equal(true);

    expect(output.tango.hasOwnProperty('romeo')).to.equal(true);
    expect(output.tango.hasOwnProperty('papa')).to.equal(true);

    expect(output.tango.romeo.hasOwnProperty('echo')).to.equal(false);
    expect(output.tango.romeo.hasOwnProperty('foxtrot')).to.equal(true);
    expect(output.tango.papa.hasOwnProperty('yankee')).to.equal(true);
  });

  it('should return object with same number of keys', function () {
    const input = {
      echo: { xray: 'yankee' },
      tango: {
        romeo: { echo: 'romeo' },
        papa: { yankee: 'romeo' }
      },
      yankee: 'echo'
    };
    const output1 = replaceKeysInObj(input, 'echo', 'foxtrot');
    const output2 = replaceKeysInObj(output1, 'echo', 'foxtrot');
    expect(tallyKeys(input)).to.equal(8);
    expect(tallyKeys(output1)).to.equal(8);
    expect(tallyKeys(output2)).to.equal(8);
  });

  it('should use recursion by calling self', function () {
    const input = {
      echo: { xray: 'yankee' },
      tango: {
        romeo: { echo: 'romeo' },
        papa: { yankee: 'romeo' }
      },
      yankee: 'echo'
    };
    const originalReplaceKeysInObj = replaceKeysInObj;
    replaceKeysInObj = sinon.spy(replaceKeysInObj);
    replaceKeysInObj(input, 'romeo', 'alpha');
    expect(replaceKeysInObj.callCount).to.be.above(1);
    replaceKeysInObj = originalReplaceKeysInObj;
  });
});

describe('2) customersFilteredAndMapped()', () => {
  const tCustomers = [
    { lat: 30.04791975, lon: -90.16167136, tel: '243-334-3008', name: 'Kayes' },
    {
      lat: 30.46848459,
      lon: -89.51881836,
      tel: '154-700-5634',
      name: 'Timony'
    },
    {
      lat: 29.49714818,
      lon: -90.25647677,
      tel: '788-299-1863',
      name: 'Goodban'
    },
    {
      lat: 30.19327285,
      lon: -89.86483915,
      tel: '399-141-3895',
      name: 'Ralling'
    },
    { lat: 30.10636979, lon: -89.39886325, tel: '901-711-1889', name: 'Dabs' },
    {
      lat: 29.44814501,
      lon: -90.17537846,
      tel: '184-179-9672',
      name: 'Brookwood'
    },
    {
      lat: 30.44160368,
      lon: -90.03639599,
      tel: '690-224-9625',
      name: 'Ommanney'
    },
    { lat: 29.65371182, lon: -89.58728063, tel: '695-307-7107', name: 'Skerm' },
    { lat: 29.6612399, lon: -90.58964663, tel: '972-164-7806', name: 'Falls' },
    {
      lat: 29.39973781,
      lon: -90.09664989,
      tel: '965-920-0577',
      name: 'Bernette'
    }
  ];

  const tResult = [
    { dist: '13km', tel: '243-334-3008', name: 'Kayes' },
    { dist: '53km', tel: '788-299-1863', name: 'Goodban' },
    { dist: '34km', tel: '399-141-3895', name: 'Ralling' },
    { dist: '54km', tel: '690-224-9625', name: 'Ommanney' }
  ];

  before(function () {
    sinon.spy(Array.prototype, 'filter');
    sinon.spy(Array.prototype, 'map');
  });

  afterEach(function () {
    Array.prototype.filter.reset();
    Array.prototype.map.reset();
  });

  after(function () {
    Array.prototype.filter.restore();
    Array.prototype.map.restore();
  });

  it('should exist', () => {
    customersFilteredAndMapped.should.be.an.instanceOf(Function);
  });

  it('should use the native filter', function () {
    customersFilteredAndMapped(tCustomers);
    Array.prototype.filter.called.should.be.true;
    Array.prototype.map.called.should.be.true;
  });

  it('should return an array', () =>
    customersFilteredAndMapped(tCustomers).should.be.an('array'));

  it('should return customers with "dist", "name", and "tel" properties', () => {
    customersFilteredAndMapped(tCustomers)[0].should.have.all.keys(
      'dist',
      'name',
      'tel'
    );
  });

  it('should round down the "dist" property to nearest integer converted to a String', () => {
    customersFilteredAndMapped(tCustomers)[0].dist.should.not.include('.');
  });

  it('should convert the "dist" property to a String ', () => {
    customersFilteredAndMapped(tCustomers)[0].dist.should.be.a('string');
  });

  it('should label the "dist" with "km"', () => {
    customersFilteredAndMapped(tCustomers)[0].dist.should.include('km');
  });

  it('should label the "dist" with "km"', () => {
    customersFilteredAndMapped(tCustomers)[0].dist.should.include('km');
  });

  it('should return the proper customers', function () {
    customersFilteredAndMapped(tCustomers).should.eql(tResult);
  });
});

describe('3) customersReduced()', () => {
  const tCustomers = [
    { lat: 30.04791975, lon: -90.16167136, tel: '243-334-3008', name: 'Kayes' },
    {
      lat: 30.46848459,
      lon: -89.51881836,
      tel: '154-700-5634',
      name: 'Timony'
    },
    {
      lat: 29.49714818,
      lon: -90.25647677,
      tel: '788-299-1863',
      name: 'Goodban'
    },
    {
      lat: 30.19327285,
      lon: -89.86483915,
      tel: '399-141-3895',
      name: 'Ralling'
    },
    { lat: 30.10636979, lon: -89.39886325, tel: '901-711-1889', name: 'Dabs' },
    {
      lat: 29.44814501,
      lon: -90.17537846,
      tel: '184-179-9672',
      name: 'Brookwood'
    },
    {
      lat: 30.44160368,
      lon: -90.03639599,
      tel: '690-224-9625',
      name: 'Ommanney'
    },
    { lat: 29.65371182, lon: -89.58728063, tel: '695-307-7107', name: 'Skerm' },
    { lat: 29.6612399, lon: -90.58964663, tel: '972-164-7806', name: 'Falls' },
    {
      lat: 29.39973781,
      lon: -90.09664989,
      tel: '965-920-0577',
      name: 'Bernette'
    }
  ];

  const tResult = [
    { dist: '13km', tel: '243-334-3008', name: 'Kayes' },
    { dist: '53km', tel: '788-299-1863', name: 'Goodban' },
    { dist: '34km', tel: '399-141-3895', name: 'Ralling' },
    { dist: '54km', tel: '690-224-9625', name: 'Ommanney' }
  ];

  before(() => sinon.spy(Array.prototype, 'reduce'));

  afterEach(() => Array.prototype.reduce.reset());

  after(() => Array.prototype.reduce.restore());

  it('should exist', () => {
    customersReduced.should.be.an.instanceOf(Function);
    should.exist(tCustomers);
  });

  it('should use the native .reduce()', () => {
    customersReduced(tCustomers);
    Array.prototype.reduce.called.should.be.true;
  });

  it('should return an array', function () {
    customersReduced(tCustomers).should.be.an('array');
  });

  it('should return customers with "dist", "name", and "tel" properties', () => {
    customersReduced(tCustomers)[0].should.have.all.keys('dist', 'name', 'tel');
  });

  it('should round down the "dist" property to nearest integer ', () => {
    customersReduced(tCustomers)[0].dist.should.not.include('.');
  });

  it('should convert the "dist" property to a String ', () => {
    customersReduced(tCustomers)[0].dist.should.be.a('string');
  });

  it('should label the "dist" with "km"', () => {
    customersReduced(tCustomers)[0].dist.should.include('km');
  });

  it('should label the "dist" with "km"', () => {
    customersReduced(tCustomers)[0].dist.should.include('km');
  });

  it('should return the proper customers', function () {
    customersReduced(tCustomers).should.eql(tResult);
  });
});
