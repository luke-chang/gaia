'use strict';

//var assert = require('chai').assert;

marionette('Test Homescreen Window Manager', function() {
  /*var Keys = {
    'enter': '\ue006',
    'right': '\ue014',
    'esc': '\ue00c',
    'backspace': '\ue003'
  };*/

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
  var system, home;

  var arbitraryAppUrl = 'app://app-deck.gaiamobile.org';

  setup(function() {
    system = client.loader.getAppClass('system');
    home = client.loader.getAppClass('smart-home', 'home', 'tv_apps');
    system.waitForStartup();
    system.waitForFullyLoaded();
    home.switchFrame();
    home.skipFte();
    client.switchToFrame();
  });

  test('a sample test', testOptions, function() {
    // Launch test app
    var frame = system.waitForLaunch(arbitraryAppUrl);
    client.switchToFrame(frame);
  });
});
