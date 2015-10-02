/* global jQuery */
'use strict';

(function($) {
  $.fn.touchPanel = function(options) {
    var settings = $.extend({
      touchReportPeriod: 60,    // milliseconds
      clickTimeThreshold: 100,  // milliseconds
      clickMoveThreshold: 5     // pixels
    }, options);

    return $(this).each(function() {
      var waitForClickTimer, identifier, pendingEvent;
      var startX, startY, panelX, panelY, panelWidth, panelHeight;
      var prevDx, prevDy, hasMouseDown;
      var timer;

      var $touchPanel = $(this);

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
        if (evt.button !== 0) {
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
        startX = x;
        startY = y;

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
          handleTouch('click');
        } else {
          handleTouch('touchend', dx, dy);
        }

        return false;
      }

      function sendMessage(type, detail) {
        $touchPanel.trigger('touchPanel:action', {
          type: type,
          detail: detail
        });
      }

      function handleTouch(type, dx, dy) {
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
                dy: dy
              }
            };

            break;
          case 'touchend':
            clearInterval(timer);

            sendMessage(type, {
              dx: dx,
              dy: dy
            });

            break;
          case 'click':
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
