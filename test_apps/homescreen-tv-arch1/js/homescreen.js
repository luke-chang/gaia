'use strict';

(function() {
  var appList;
  var widgetEditor;
  var widgetManager;
  var spatialNav;
  var staticObjectPositions = [];
  var selectionBorder;
  var focusedItem;
  var showAllCallback;
  var hideAllCallback;

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

    // app list
    $('app-list-open-button').addEventListener('click', function() {
      window.systemConnection.hideAll();
      hideAllCallback = function() {
        appList.show();
        $('main-section').classList.add('app-list-shown');
      };
    });
    appList.on('closed', function() {
      $('main-section').classList.remove('app-list-shown');
      handleSomethingClosed();
    });

    document.addEventListener('visibilitychange', function(evt) {
      if (document.visibilityState === 'visible') {
        appList.hide();
      }
    });

    document.addEventListener('contextmenu', function(evt) {
      evt.preventDefault();
    });

    // widget editor
    $('edit-widget').addEventListener('click', enterWidgetEditor);
    $('widget-editor-close').addEventListener('click', function() {
      widgetEditor.hide();
    });

    spatialNav = new SpatialNavigator(staticObjectPositions);
    spatialNav.on('focus', handleSelection);
    spatialNav.focus();

    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('system-action-object',
                            handleSystemConnMsg);

    // for testing only
    initFakeAppEvent();
    initGesture();
  }

  function handleSomethingClosed() {
    // widgetEditor may ask appList to show. We need to wait for widgetEditor
    // is hide before showAll widgets in this case.
    if (!widgetEditor.isShown() && !appList.isShown()) {
      window.systemConnection.showAll();
    }
  }

  function handleSystemConnMsg(evt) {
    var detail = evt.detail;
    for (var i = 0; i < detail.length; i++) {
      if (detail[i].action === 'showall' && showAllCallback) {
        showAllCallback();
        showAllCallback = null;
      } else if (detail[i].action === 'hideall' && hideAllCallback) {
        hideAllCallback();
        hideAllCallback = null;
      }
    }
  }

  function handleKeyEvent(evt) {
    if (appList.isShown()) {
      appList.handleEvent(evt);
    } else if (widgetEditor && widgetEditor.isShown()) {
      if (evt.key === 'Esc') {
        widgetEditor.hide();
      } else {
        widgetEditor.handleKeyDown(evt);
      }
    } else {
      switch(evt.key) {
        case 'Left':
        case 'Right':
        case 'Up':
        case 'Down':
          spatialNav.move(evt.key);
          break;
        case 'Enter':
          handleEnterKey(focusedItem);
          break;
        default:
          return;
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
      Applications.launch(focused.origin, focused.entryPoint);
    }
  }

  function enterWidgetEditor() {
    $('main-section').classList.add('widget-editor-shown');
    window.systemConnection.hideAll();
    hideAllCallback = function() {
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
        widgetEditor.on('closed', handleWidgetEditorClosed);
        widgetEditor.start();
        widgetEditor.importConfig(widgetManager.widgetConfig);
      }
      widgetEditor.show();
    };
  }

  function handleWidgetEditorClosed() {
    var newConfig = widgetEditor.exportConfig();
    widgetManager.save(newConfig);
    $('widget-editor').hidden = true;
    $('main-section').classList.remove('widget-editor-shown');
    handleSomethingClosed();
  }

  function updateSelection(config) {
    var previousFocusedItem = spatialNav.currentFocus();
    var allSelectable = staticObjectPositions.concat(config);
    spatialNav.reset(allSelectable);
    if (!previousFocusedItem || !spatialNav.focus(previousFocusedItem)) {
      spatialNav.focus();
    }
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
