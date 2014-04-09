'use strict';

describe('Service: KlickService', function () {

  // load the service's module
  beforeEach(module('klickrChromeApp'));

  // instantiate service
  var KlickService;
  beforeEach(inject(function (_KlickService_) {
    KlickService = _KlickService_;
  }));

  it('should do something', function () {
    expect(!!KlickService).toBe(true);
  });

});
