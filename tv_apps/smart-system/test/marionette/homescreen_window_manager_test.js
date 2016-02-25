'use strict';

//var assert = require('chai').assert;

marionette('Test Homescreen Window Manager', function() {
  var opts = {
    apps: {},
    hostOptions: {
      screen: {
        width: 1920,
        height: 1080
      }
    }
  };

  var client = marionette.client({
    profile: opts,
    // XXX: Set this to true once Accessibility is implemented in TV
    desiredCapabilities: { raisesAccessibilityExceptions: false }
  });
  var testOptions = { devices: ['tv'] };
  var system;

  setup(function() {
    system = client.loader.getAppClass('system');
    system.waitForStartup();
    system.waitForFullyLoaded();
  });

  test('a sample test', testOptions, function() {

  });
});
