/* global jQuery */
'use strict';

(function($) {
  var DEBUG = false;

  $.fn.touchPanel = function(options) {
    if (options) {
      if ($.isFunction(options)) {
        options = {
          handler: options
        };
      } else if (!$.isPlainObject(options)) {
        console.log('touchPanel: Invalid parameters!');
        return $(this);
      }
    }

    var settings = $.extend({
      touchReportPeriod: 60,      // milliseconds
      dblClickTimeThreshold: 250, // milliseconds
      clickTimeThreshold: 100,    // milliseconds
      clickMoveThreshold: 5,      // pixels
      swipeMoveThreshold: 25,     // pixels
      touchingClass: null,        // class name
      handler: null               // function(type, detail) {}
    }, options);

    if (!settings.handler) {
      settings.handler = function() {};
    }

    return $(this).each(function() {
      var waitForClickTimer, identifier, pendingEvent;
      var startX, startY, panelX, panelY, panelWidth, panelHeight;
      var prevDx, prevDy, hasMouseDown;
      var timer, pendingClickTimer, startTime;

      var $touchPanel = $(this);
      var sendMessage = $.proxy(settings.handler, $touchPanel);

      $(window).mouseup(function(evt) {
        if (hasMouseDown && evt.button === 0) {
          hasMouseDown = false;
          onEnd(evt.clientX, evt.clientY);
        }
      });

      $touchPanel.mousedown(function(evt) {
        if (evt.button !== 0) {
          return true;
        }
        hasMouseDown = true;
        return onStart(evt.clientX, evt.clientY);
      })
      .mousemove(function(evt) {
        if (! hasMouseDown) {
          return true;
        }
        return onMove(evt.clientX, evt.clientY);
      })
      .mouseup(function(evt) {
        if (! hasMouseDown || evt.button !== 0) {
          return true;
        }
        hasMouseDown = false;
        return onEnd(evt.clientX, evt.clientY);
      })
      .bind('touchstart', function(evt) {
        if (identifier !== undefined) {
          return false;
        }
        var touches = evt.originalEvent.changedTouches;
        if (touches.length > 1) {
          return true;
        }
        var touch = touches[0];
        identifier = touch.identifier;
        return onStart(touch.pageX - panelX, touch.pageY - panelY);
      })
      .bind('touchmove touchend', function(evt) {
        var touches = $.grep(evt.originalEvent.changedTouches, function(elem) {
          return elem.identifier == identifier;
        });

        if (touches.length != 1) {
          return false;
        }

        var touch = touches[0];
        if (evt.type == 'touchend') {
          identifier = undefined;
          return onEnd(touch.pageX - panelX, touch.pageY - panelY);
        }
        return onMove(touch.pageX - panelX, touch.pageY - panelY);
      });

      function onStart(x, y) {
        if (settings.touchingClass) {
          $touchPanel.addClass(settings.touchingClass);
        }

        startX = x;
        startY = y;
        startTime = $.now();

        var handleTouchStart = function() {
          waitForClickTimer = null;
          handleTouch('touchstart', 0, 0);
        };

        if (settings.clickTimeThreshold) {
          waitForClickTimer = setTimeout(handleTouchStart,
            settings.clickTimeThreshold);
        } else {
          handleTouchStart();
        }

        return false;
      }

      function onMove(x, y) {
        var dx = x - startX;
        var dy = y - startY;

        if (waitForClickTimer) {
          if (Math.abs(dx) <= settings.clickMoveThreshold &&
              Math.abs(dy) <= settings.clickMoveThreshold) {
            return false;
          }
          clearTimeout(waitForClickTimer);
          waitForClickTimer = null;
          handleTouch('touchstart', 0, 0);
        }

        handleTouch('touchmove', dx, dy);
        return false;
      }

      function onEnd(x, y) {
        var dx = x - startX;
        var dy = y - startY;

        if (waitForClickTimer) {
          clearTimeout(waitForClickTimer);
          waitForClickTimer = null;

          if (settings.dblClickTimeThreshold) {
            if (pendingClickTimer) {
              clearTimeout(pendingClickTimer);
              pendingClickTimer = null;
              handleTouch('dblclick');
            } else {
              pendingClickTimer = setTimeout(function() {
                pendingClickTimer = null;
                handleTouch('click');
              }, settings.dblClickTimeThreshold);
            }
          } else {
            handleTouch('click');
          }
        } else {
          var direction;
          var distance = Math.round(Math.sqrt(dx * dx + dy * dy));
          if (distance >= settings.swipeMoveThreshold) {
            var angle = Math.atan2(dy, dx) * 180 / Math.PI;
            if (angle < 0) {
              angle += 360;
            }
            if (angle >= 315 || angle < 45) {
              direction = 'right';
            } else if (angle >= 45 && angle < 135) {
              direction = 'down';
            } else if (angle >= 135 && angle < 225) {
              direction = 'left';
            } else if (angle >= 225 && angle < 315) {
              direction = 'up';
            }
          }

          handleTouch('touchend', dx, dy, direction);
        }

        if (settings.touchingClass) {
          $touchPanel.removeClass(settings.touchingClass);
        }

        return false;
      }

      function handleTouch(type, dx, dy, swipe) {
        if (DEBUG) {
          console.log('[touchPanel] handling ' + type);
        }

        switch (type) {
          case 'touchstart':
            prevDx = undefined;
            prevDy = undefined;

            sendMessage(type, {
              width: panelWidth,
              height: panelHeight
            });

            timer = setInterval(function() {
              if (pendingEvent) {
                sendMessage(
                  pendingEvent.type,
                  pendingEvent.detail
                );
                pendingEvent = null;
              }
            }, settings.touchReportPeriod);

            break;
          case 'touchmove':
            if (dx === prevDx && dy === prevDy) {
              return;
            }

            prevDx = dx;
            prevDy = dy;

            pendingEvent = {
              type: type,
              detail: {
                dx: dx,
                dy: dy,
                duration: $.now() - startTime
              }
            };

            break;
          case 'touchend':
            pendingEvent = null;
            clearInterval(timer);

            sendMessage(type, {
              dx: dx,
              dy: dy,
              duration: $.now() - startTime,
              swipe: swipe
            });

            break;
          case 'click':
          case 'dblclick':
            sendMessage(type, {});
            break;
        }
      }

      function updatePanelInfo() {
        panelX = Math.round($touchPanel.offset().left);
        panelY = Math.round($touchPanel.offset().top);
        panelWidth = $touchPanel.width();
        panelHeight = $touchPanel.height();
      }

      updatePanelInfo();
      $(window).resize(updatePanelInfo);
    });
  };
}(jQuery));
