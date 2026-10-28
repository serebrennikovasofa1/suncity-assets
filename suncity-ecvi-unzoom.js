/* SUN CITY: preserve Tilda's scaled element box without zooming ECVI.
   For the current Zero Block implementation, which applies zoom to .tn-elem.
   Does not modify the cross-origin iframe or ECVI configuration. */
(function () {
    'use strict';
    function start() {
        var root = document.getElementById('ecvi-booking');
        var elem = root && root.closest('.tn-elem');
        var board = elem && elem.closest('.t396__artboard');
        if (!elem || !board || elem.getAttribute('data-sc-unzoom-ready')) return;
        elem.setAttribute('data-sc-unzoom-ready', '1');
        var sheet = document.createElement('style');
        sheet.id = 'sc-ecvi-unzoom-style';
        document.head.appendChild(sheet);
        var selector = '#'+board.closest('.t-rec').id+
            ' .tn-elem[data-sc-ecvi-unzoom="1"]';
        var pending = false;
        function refresh() {
            pending = false;
            // Read the original Tilda geometry, without our override.
            elem.removeAttribute('data-sc-ecvi-unzoom');
            var zoom = parseFloat(getComputedStyle(elem).zoom) || 1;
            if (Math.abs(zoom - 1) < 0.001) return;
            var parent = elem.offsetParent;
            if (!parent) return;
            var box = elem.getBoundingClientRect();
            var anchor = parent.getBoundingClientRect();
            if (!(box.width > 0)) return;
            var left = box.left - anchor.left - parent.clientLeft + parent.scrollLeft;
            var top = box.top - anchor.top - parent.clientTop + parent.scrollTop;
            var css = selector + '{zoom:1!important;width:' + box.width +
                'px!important;left:' + left + 'px!important;top:' + top +
                'px!important;}';
            if (sheet.textContent !== css) sheet.textContent = css;
            elem.setAttribute('data-sc-ecvi-unzoom', '1');
        }
        function schedule() {
            if (pending) return;
            pending = true;
            requestAnimationFrame(refresh);
        }
        // Tilda recalculates inline geometry after initialization and resizing.
        var observer = new MutationObserver(schedule);
        observer.observe(elem, {attributes:true, attributeFilter:['style']});
        observer.observe(board, {attributes:true, attributeFilter:['style','class']});
        window.addEventListener('resize', schedule);
        window.addEventListener('orientationchange', schedule);
        window.addEventListener('pageshow', schedule);
        window.addEventListener('load', schedule);
        if (window.ResizeObserver) {
            var resizeObserver = new ResizeObserver(schedule);
            resizeObserver.observe(board);
        }
        schedule();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, {once:true});
    } else {
        start();
    }
})();
