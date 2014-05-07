'use strict';
/* global SpatialNavigator */

requireApp('homescreen-stingray/js/vendor/evt.js');
requireApp('homescreen-stingray/js/spatial_navigator.js');

suite('SpatialNavigator', function() {

  suite('predefined list - without overlapping', function() {
    var spatialNav;
    /*  |--------------------------|
     *  | item 1 | item 2 | item 3 |
     *  |--------+--------+--------|
     *  | item 4 | item 5 | item 6 |
     *  |--------+--------+--------|
     *  | item 7 | item 8 | item 9 |
     *  |--------+--------+--------|
     *
     */
     var itemList = [
        {'id': 'item1', 'x': 100, 'y': 100, 'w': 100, 'h': 100},
        {'id': 'item2', 'x': 200, 'y': 100, 'w': 100, 'h': 100},
        {'id': 'item3', 'x': 300, 'y': 100, 'w': 100, 'h': 100},
        {'id': 'item4', 'x': 100, 'y': 200, 'w': 100, 'h': 100},
        {'id': 'item5', 'x': 200, 'y': 200, 'w': 100, 'h': 100},
        {'id': 'item6', 'x': 300, 'y': 200, 'w': 100, 'h': 100},
        {'id': 'item7', 'x': 100, 'y': 300, 'w': 100, 'h': 100},
        {'id': 'item8', 'x': 200, 'y': 300, 'w': 100, 'h': 100},
        {'id': 'item9', 'x': 300, 'y': 300, 'w': 100, 'h': 100}
      ];
    setup(function() {
      spatialNav = new SpatialNavigator(itemList);
    });

    test('focus without argument', function(done) {
      spatialNav.on('focus', function(elm) {
        assert.equal(elm.id, 'item1');
        done();
      });
      spatialNav.focus();
    });

    test('focus item 5', function(done) {
      spatialNav.on('focus', function(elm) {
        assert.equal(elm.id, 'item5');
        done();
      });
      spatialNav.focus(itemList[4]);
    });

    test('refocus item 5', function() {
      spatialNav.refocus(itemList[4]);
      assert.equal(spatialNav.currentFocus().id, 'item5');
      spatialNav.refocus(itemList[4]);
      assert.equal(spatialNav.currentFocus().id, 'item5');
    });

    test('move up on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item2');
    });

    test('move right on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('right');
      assert.equal(spatialNav.currentFocus().id, 'item6');
    });

    test('move down on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('down');
      assert.equal(spatialNav.currentFocus().id, 'item8');
    });

    test('move left on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('left');
      assert.equal(spatialNav.currentFocus().id, 'item4');
    });

    test('move up on item 2', function() {
      spatialNav.focus(itemList[1]);
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item2');
    });

    test('move right on item 6', function() {
      spatialNav.focus(itemList[5]);
      spatialNav.move('right');
      assert.equal(spatialNav.currentFocus().id, 'item6');
    });

    test('move down on item 8', function() {
      spatialNav.focus(itemList[7]);
      spatialNav.move('down');
      assert.equal(spatialNav.currentFocus().id, 'item8');
    });

    test('move left on item 4', function() {
      spatialNav.focus(itemList[3]);
      spatialNav.move('left');
      assert.equal(spatialNav.currentFocus().id, 'item4');
    });
  });

  suite('predefined list - without overlapping 2', function() {
    var spatialNav;
    /*  |--------------------------|
     *  | item 1 |        | item 2 |
     *  |--------+--------+--------|
     *  |        | item 3 |        |
     *  |--------+--------+--------|
     *  | item 4 |        | item 5 |
     *  |--------+--------+--------|
     *
     */
     var itemList = [
        {'id': 'item1', 'x': 100, 'y': 100, 'w': 100, 'h': 100},
        {'id': 'item2', 'x': 300, 'y': 100, 'w': 100, 'h': 100},
        {'id': 'item3', 'x': 200, 'y': 200, 'w': 100, 'h': 100},
        {'id': 'item4', 'x': 100, 'y': 300, 'w': 100, 'h': 100},
        {'id': 'item5', 'x': 300, 'y': 300, 'w': 100, 'h': 100}
      ];
    setup(function() {
      spatialNav = new SpatialNavigator(itemList);
    });

    test('move up on item 3', function() {
      spatialNav.focus(itemList[2]);
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item1');
    });

    test('move right on item 3', function() {
      spatialNav.focus(itemList[2]);
      spatialNav.move('right');
      assert.equal(spatialNav.currentFocus().id, 'item2');
    });

    test('move down on item 3', function() {
      spatialNav.focus(itemList[2]);
      spatialNav.move('down');
      assert.equal(spatialNav.currentFocus().id, 'item4');
    });

    test('move left on item 3', function() {
      spatialNav.focus(itemList[2]);
      spatialNav.move('left');
      assert.equal(spatialNav.currentFocus().id, 'item1');
    });
  });


  suite('predefined list with overlapping', function() {
    var spatialNav;
    /*  |----item 2---------------|
     *  | item 1
     *  |--------+------ item 3 ---|
     *  |        | item 5 | item 6 |
     *  item 4 --+--------+--------|
     *  | item 7 |        |
     *  |--------+--------+---item 8
     *
     */
     var itemList = [
        {'id': 'item1', 'x': 100, 'y': 100, 'w': 100, 'h': 100},
        {'id': 'item2', 'x': 50, 'y': 50, 'w': 100, 'h': 100},
        {'id': 'item3', 'x': 250, 'y': 150, 'w': 100, 'h': 100},
        {'id': 'item4', 'x': 50, 'y': 250, 'w': 100, 'h': 100},
        {'id': 'item5', 'x': 200, 'y': 200, 'w': 100, 'h': 100},
        {'id': 'item6', 'x': 300, 'y': 200, 'w': 100, 'h': 100},
        {'id': 'item7', 'x': 100, 'y': 300, 'w': 100, 'h': 100},
        {'id': 'item8', 'x': 350, 'y': 350, 'w': 100, 'h': 100}
      ];
    setup(function() {
      spatialNav = new SpatialNavigator(itemList);
    });

    test('move up on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item3');
    });

    test('move up on item 7', function() {
      spatialNav.focus(itemList[6]);
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item4');
    });

    test('move up on item 6', function() {
      spatialNav.focus(itemList[5]);
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item3');
    });

    test('move up on item 1', function() {
      spatialNav.focus(itemList[0]);
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item2');
    });

    test('move right on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('right');
      assert.equal(spatialNav.currentFocus().id, 'item3');
    });

    test('move left on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('left');
      assert.equal(spatialNav.currentFocus().id, 'item4');
    });

    test('move down on item 5', function() {
      spatialNav.focus(itemList[4]);
      spatialNav.move('down');
      assert.equal(spatialNav.currentFocus().id, 'item7');
    });

    test('move down on item 4', function() {
      spatialNav.focus(itemList[3]);
      spatialNav.move('down');
      assert.equal(spatialNav.currentFocus().id, 'item7');
    });
  });

  suite('dynamic group', function() {
    var spatialNav;

    setup(function() {
      spatialNav = new SpatialNavigator([
        {'id': 'item-center', 'x': 200, 'y': 200, 'w': 100, 'h': 100}
      ]);
      spatialNav.focus();
    });

    test('add top and move up', function() {
      assert.isTrue(spatialNav.add(
        {'id': 'item-top', 'x': 200, 'y': 100, 'w': 100, 'h': 100}));
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item-top');
    });

    test('add left and move left', function() {
      assert.isTrue(spatialNav.add(
        {'id': 'item-left', 'x': 100, 'y': 200, 'w': 100, 'h': 100}));
      spatialNav.move('left');
      assert.equal(spatialNav.currentFocus().id, 'item-left');
    });

    test('add bottom and move down', function() {
      assert.isTrue(spatialNav.add(
        {'id': 'item-bottom', 'x': 200, 'y': 300, 'w': 100, 'h': 100}));
      spatialNav.move('down');
      assert.equal(spatialNav.currentFocus().id, 'item-bottom');
    });

    test('add right and move right', function() {
      assert.isTrue(spatialNav.add(
        {'id': 'item-right', 'x': 300, 'y': 200, 'w': 100, 'h': 100}));
      spatialNav.move('right');
      assert.equal(spatialNav.currentFocus().id, 'item-right');
    });

    test('add left-top and move top', function() {
      assert.isTrue(spatialNav.add(
        {'id': 'item-lt', 'x': 100, 'y': 100, 'w': 100, 'h': 100}));
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item-lt');
    });

    test('add right-top and move top', function() {
      assert.isTrue(spatialNav.add(
        {'id': 'item-rt', 'x': 300, 'y': 100, 'w': 100, 'h': 100}));
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item-rt');
    });

    test('add twice', function() {
      var item = {'id': 'item', 'x': 300, 'y': 100, 'w': 100, 'h': 100};
      assert.isTrue(spatialNav.add(item));
      assert.isFalse(spatialNav.add(item));
    });

    test('add, remove, move', function() {
      var item = {'id': 'item', 'x': 300, 'y': 100, 'w': 100, 'h': 100};
      assert.isTrue(spatialNav.add(item));
      assert.isTrue(spatialNav.remove(item));
      spatialNav.move('up');
      assert.equal(spatialNav.currentFocus().id, 'item-center');
    });
  });
});
