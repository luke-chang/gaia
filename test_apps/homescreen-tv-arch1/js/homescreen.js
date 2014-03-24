'use strict';

(function() {
  var appList;
  var widgetEditor;
  var widgetManager;
  var spatialNav;
  var staticObjectPositions = [];
  var selectionBorder;
  var focusedItem;


  function $(id) {
    return document.getElementById(id);
  }

  function init() {
    staticObjectPositions = [$('app-list-open-button'), $('edit-widget')];

    Applications.init();

    appList = new AppList();
    appList.init();

    selectionBorder = new SelectionBorder({ multiple: false,
                                            container: $('main-section'),
                                            forground: true });

    widgetManager = new WidgetManager(window.systemConnection);
    widgetManager.on('update', updateSelection);
    widgetManager.start();

    $('app-list-open-button').addEventListener('click', function() {
      window.systemConnection.hideAll();
      appList.show();
      $('main-section').classList.add('app-list-shown');
    });
    appList.on('closed', function() {
      $('main-section').classList.remove('app-list-shown');
      window.systemConnection.showAll();
    });

    document.addEventListener('visibilitychange', function(evt) {
      if (document.visibilityState === 'visible') {
        appList.hide();
        $('main-section').classList.remove('app-list-shown');
        window.systemConnection.showAll();
      }
    });

    document.addEventListener('contextmenu', function(evt) {
      evt.preventDefault();
    });

    $('edit-widget').addEventListener('click', enterWidgetEditor);
    $('widget-editor-close').addEventListener('click', leaveWidgetEditor);

    window.addEventListener('keydown', handleKeyEvent);

    // for testing only
    initFakeAppEvent();
    initGesture();
  }

  function handleKeyEvent(evt) {
    if (!spatialNav) {
      return;
    }

    if (appList.isShown()) {
      appList.handleEvent(evt);
    } else if (widgetEditor && widgetEditor.isShown()) {
      if (evt.key === 'Esc') {
        $('widget-editor-close').click();
      } else {
        widgetEditor.handleKeyDown(evt);
      }
    } else {
      switch(evt.key) {
        case 'Left':
        case 'Right':
        case 'Up':
        case 'Down':
          if (!spatialNav.move(evt.key)) {
            console.log(evt.key + ': no elements');
          }
          break;
        case 'Enter':
          handleEnterKey(focusedItem);
          break;
      }
    }
    evt.preventDefault();
  }

  function handleEnterKey(focused) {
    if (focused === $('app-list-open-button')) {
      $('app-list-open-button').click();
    } else if (focused === $('edit-widget')) {
      $('edit-widget').click();
    } else {

    }
  }

  function leaveWidgetEditor() {
    widgetEditor.setVisible(false);
    var newConfig = widgetEditor.exportConfig();
    widgetManager.save(newConfig);
    $('widget-editor').hidden = true;
    $('main-section').classList.remove('widget-editor-shown');
    window.systemConnection.showAll();
  }

  function enterWidgetEditor() {
    $('main-section').classList.add('widget-editor-shown');
    window.systemConnection.hideAll();
    // We need to init widget editor which uses the size of container to
    // calculate the block size. So, the widget-editor should be shown before
    // the creation of WidgetEditor.
    $('widget-editor').hidden = false;
    if (!widgetEditor) {
      var widgetPane = $('widget-pane');
      widgetEditor = new WidgetEditor({
                                        dom: $('widget-view'),
                                        appList: appList,
                                        offset: {
                                          top: widgetPane.offsetTop,
                                          left: widgetPane.offsetLeft
                                        },
                                        targetSize: {
                                          w: widgetPane.clientWidth,
                                          h: widgetPane.clientHeight
                                        }
                                      });
      widgetEditor.start();
      widgetEditor.importConfig(widgetManager.widgetConfig);
    }
    widgetEditor.setVisible(true);
  }

  function updateSelection(config) {
    var allSelectable = [].concat(staticObjectPositions).concat(config);

    if (spatialNav) {
      spatialNav.off('focus', handleSelection);
    }

    spatialNav = new SpatialNavigator(allSelectable);
    spatialNav.on('focus', handleSelection);

    spatialNav.focus();
  }

  function handleSelection(elem) {
    if (elem.nodeName) {
      selectionBorder.select(elem);
    } else {
      selectionBorder.selectRect(elem);
    }
    focusedItem = elem;
  }

  window.addEventListener('load', init);
})();
