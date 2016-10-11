/*
 * Mark and share text
 *
 * by SmartTeleMax team
 * Released under the MIT License
 */


;(function (global, factory) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define(['masha'], factory);
  } else if (typeof exports === 'object' && typeof module !== 'undefined') {
    // XXX debug
    // Node/CommonJS style for Browserify
    module.exports = factory(require('masha'));
  } else {
    // Browser globals
    global.MaShaNav = factory({MaSha: global.MaSha});
  }
}(this, function (masha) {
    var MaSha = masha.MaSha;

    var $M = MaSha.$M;

    var MaShaNav = function(options) {

        options = options || {};

        this.options = $M.extend({}, MaShaNav.defaultOptions, options);

        $M.extend(this, {
            counter: 0,
            savedSel: [],
            ranges: {},
            childs: [],
            blocks: {}
        });

        this.init();
    };

    MaShaNav.defaultOptions = {
        'selectable' : 'selectable-content',
        't_offsetTop': 100
    };

    MaShaNav.prototype = {
        init: function(){
            this.selectable = (typeof this.options.selectable === 'string'?
                 document.getElementById(this.options.selectable):
                 this.options.selectable);
            this.total = this.countTotal();
            this.drawNav();
            if (this.total > 1) {
                this.fillNav();
                this.current = 0;
                this.getElements();
                this.noScrollEvent = false;
                document.getElementById("mashajs-nav-current").innerHTML = (this.current + 1);
            } else {
                if(document.getElementById("mashajs-nav") !== null ){
                    document.getElementById("mashajs-nav").style.display = "none";
                }
            }
            this.scrollTimeout = null;
        },
        addEvents: function(){
            var up = document.getElementById("mashajs-up");
            var down = document.getElementById("mashajs-down");
            this.windowScroll = $M.bind(this.calculateCurrent, this);
            $M.addEvent(window, 'scroll', this.windowScroll);
            this.upClick = $M.bind(function(){
                this.goTo(this.current - 1);
            }, this);
            $M.addEvent(up, 'click', this.upClick);
            this.downClick = $M.bind(function(){
                this.goTo(this.current + 1);
            }, this);
            $M.addEvent(down, 'click', this.downClick);
        },
        removeEvents: function(){
            var up = document.getElementById("mashajs-up");
            var down = document.getElementById("mashajs-down");
            $M.removeEvent(window, 'scroll', this.windowScroll);
            if (up) {
                $M.removeEvent(up, 'click', this.upClick);
            }
            if (down) {
                $M.removeEvent(down, 'click', this.downClick);
            }
        },
        countTotal: function(){
            var count = 0;
            for(var i in this.options.ranges){
                for(var j in this.options.ranges[i]){
                    count++;
                }
            }
            return count;
        },
        fillNav: function(){
            if(this.total > 1){
                document.getElementById('mashajs-nav').style.display = 'block';
                document.getElementById('mashajs-nav-total').innerHTML = this.total;
            } else {
                if(document.getElementById("mashajs-nav") !== null)
                document.getElementById('mashajs-nav').style.display = 'none';
            }
        },
        resetData: function(ranges){
            this.options.ranges = [];
            this.options.ranges.push(ranges);
            this.total = this.countTotal();
            this.drawNav();
            this.fillNav();
            if(this.total > 1){
                this.calculateCurrent();
            }
        },
        calculateCurrent: function(){
            if(this.noScrollEvent){
                this.noScrollEvent = false;
                return false;
            }
            window.clearTimeout(this.scrollTimeout);
            var x = f_scrollTop();

            this.getElements();
            var el = this.getClosestEl((x + this.options.t_offsetTop), this.elements);
            this.current = el[1];
            document.getElementById("mashajs-nav-current").innerHTML = (this.current + 1);
            this.refreshArrows();
        },
        getElements: function(){
            var c = {};
            for(var i in this.options.ranges){
                for(var j in this.options.ranges[i])
                {

                    var el = $M.byClassName(this.options.selectable, j);

                    c[j] = offset(el[0]).top; // jQuery dependency
                }
            }
            var sortable = [];
            for (var n in c) {
              sortable.push([n, c[n]]);
            }
            sortable.sort(function(a, b) {
                return a[1] - b[1];
            });
            this.elements = sortable;
        },
        getClosestEl: function(pos, ar) {
            if(ar.length) {
                var closestDiff, currentDiff;
                var closest = ar[0][1];
                var closestEl = ar[0][0];
                var num = 0;

                for(var i=0; i<ar.length; i++) {
                    closestDiff = Math.abs(pos - closest);
                    currentDiff = Math.abs(pos - ar[i][1]);
                    if(currentDiff < closestDiff){
                        closest = ar[i][1];
                        closestEl = ar[i][0];
                        num = i;
                    }
                    closestDiff = null;
                    currentDiff = null;
               }
               return [closestEl, num];
            }
            return false;
        },

        refreshArrows: function(){
            (this.current === 0 ? $M.addClass : $M.removeClass)(
                document.getElementById('mashajs-up'), 'disabled');
            (this.current == this.total - 1 ? $M.addClass : $M.removeClass)(
                document.getElementById('mashajs-down'), 'disabled');
        },

        goTo: function(num){
            if(num >= 0 && this.elements.length >= (num+1)){
                this.noScrollEvent = true;
                var top = ((this.elements[num][1] - this.options.t_offsetTop) > 0) ? (this.elements[num][1] - this.options.t_offsetTop) : 0;
                this.smoothScroll(top, this.elements[num]);
                this.current = num;
                document.getElementById("mashajs-nav-current").innerHTML = (num+1);
                this.refreshArrows();
            } else {
                if(num > 0) {
                    this.current = this.elements.length-1;
                }
                return false;
            }
        },
        drawNav: function(){
            var node = document.getElementById("mashajs-nav-position");
            if(node === null ){
                node = document.createElement('DIV');

                node.setAttribute("id", "mashajs-nav-position");
                node.innerHTML = '<div id="mashajs-nav-center"><div id="mashajs-nav">' +
                '<div id="mashajs-up"></div>' +
                '<div id="mashajs-down"></div>' +
                '<div class="num">' +
                    '<span id="mashajs-nav-current"></span> / <span id="mashajs-nav-total"></span>' +
                    '<span class="right"></span>' +
                '</div></div></div></div>';
                var w = this.selectable.offsetWidth;
                node.style.width = w + "px";

                this.selectable.parentNode.insertBefore(node, this.selectable.nextSibling);
                this.addEvents();
            }
            node.style.display = this.total > 1? "block": "none";
        },
        smoothScroll: function(stopY) {
            var leapY = f_scrollTop();
            var distance = stopY - leapY;
            var speed = Math.round(Math.abs(distance) / 20);
            if (speed >= 20) speed = 20;
            var step = Math.round(distance / 25);
            window.clearTimeout(this.scrollTimeout);

            if (Math.abs(step) < 2) {
                this.noScrollEvent = true;
                window.scrollTo(0, stopY); return;
            }

            var this_ = this;
            function go(){
                leapY += step;
                if ((step > 0 && leapY > stopY) || (step < 0 && leapY < stopY)) {
                    leapY = stopY;
                } else{
                    this_.scrollTimeout = window.setTimeout(go, speed);
                }
                window.scrollTo(0, leapY);
                this_.noScrollEvent = true;
            }
            this.scrollTimeout = window.setTimeout(go, speed);
        }

    };

    // Monkeypatching MaSha

    var oldUpdateHash = MaSha.prototype.updateHash;

    MaSha.prototype.showNav = function(){
        this.nav = new MaShaNav({
            'ranges' : [this.ranges],
            'selectable' : this.selectable
        });
        this.nav.calculateCurrent();
    };
    MaSha.prototype.updateHash = function(){
        oldUpdateHash.call(this);
        if(typeof(this.nav) != "undefined"){
          this.nav.resetData(this.ranges);
        }
    };

    function getY(oElement){
        var iReturnValue = 0;
        while (oElement !== null) {
            iReturnValue += oElement.offsetTop;
            oElement = oElement.offsetParent;
        }
        return iReturnValue;
    }

    function f_scrollTop() {
        return f_filterResults (
            window.pageYOffset ? window.pageYOffset : 0,
            document.documentElement ? document.documentElement.scrollTop : 0,
            document.body ? document.body.scrollTop : 0
        );
    }

    function f_filterResults(n_win, n_docel, n_body) {
        var n_result = n_win ? n_win : 0;
        if (n_docel && (!n_result || (n_result > n_docel)))
            n_result = n_docel;
        return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
    }

    // copied from jQuery
    function offset(elem){
        // Support: IE <=11 only
        // Running getBoundingClientRect on a
        // disconnected node in IE throws an error
        if ( !elem.getClientRects().length ) {
            return { top: 0, left: 0 };
        }

        var rect = elem.getBoundingClientRect();

        // Make sure element is not hidden (display: none)
        if ( rect.width || rect.height ) {
          var doc = elem.ownerDocument,
              win = doc.defaultView,
              docElem = doc.documentElement;

          return {
              top: rect.top + win.pageYOffset - docElem.clientTop,
              left: rect.left + win.pageXOffset - docElem.clientLeft
          };
        }

        // Return zeros for disconnected and hidden elements (gh-2310)
        return rect;
    }

    return MaShaNav;

}));
