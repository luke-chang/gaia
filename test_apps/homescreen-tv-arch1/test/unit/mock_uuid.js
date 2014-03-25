'use strict';
(function(exports){
  var MockUuid = {
    FAKE_UUID: 'aa096188-4198-4a76-a09a-48bd25c5d437',
    v4: function() {
      return MockUuid.FAKE_UUID;
    }
  };
  exports.uuid = MockUuid;
}(window));