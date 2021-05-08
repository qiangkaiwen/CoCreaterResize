// "use strict";
import observer from "@cocreate/observer";
import "./style.css";

const EVENTS = ['mousemove touchmove', 'mousedown touchstart', 'mouseup touchend'];
const DIRECTIONS = ['left', 'right', 'top', 'bottom'];

const coCreateResize = {
    selector: '', //'.resize',
    resizers: [],
    resizeWidgets: [],

    init: function(handleObj) {
        for (var handleKey in handleObj)
            if (handleObj.hasOwnProperty(handleKey) && handleKey == 'selector')
                this.selector = handleObj[handleKey];

        this.resizers = document.querySelectorAll(this.selector);
        var _this = this;
        this.resizers.forEach(function(resize, idx) {
            let resizeWidget = new CoCreateResize(resize, handleObj);
            _this.resizeWidgets[idx] = resizeWidget;
        })
    },

    initElement: function(target) {
        let resizeWidget = new CoCreateResize(target, {
            dragLeft: "[data-resize_handle='left']",
            dragRight: "[data-resize_handle='right']",
            dragTop: "[data-resize_handle='top']",
            dragBottom: "[data-resize_handle='bottom']"
        });
        this.resizeWidgets[0] = resizeWidget;
    }
}

function CoCreateResize(resizer, options) {
    this.resizeWidget = resizer;
    this.cornerSize = 10;
    this.init(options);
}

CoCreateResize.prototype = {
    init: function(handleObj) {
        if (this.resizeWidget) {
            this.initDrags = [];
            this.checkCorners = [];
            this.doDrags = [];
            this.Drags = [];
            
            DIRECTIONS.map(d => {
                this.Drags[d] = this.resizeWidget.querySelector(handleObj['drag' + d.charAt(0).toUpperCase() + d.slice(1)]);
            })

            this.bindListeners();
            this.initResize();
        }
    },

    initResize: function() {
        DIRECTIONS.map(d => {if(this.Drags[d])   this.addListenerMulti(this.Drags[d], EVENTS[0], this.checkCorners[d]);})
    },

    checkDragImplementation: function(e, from, to, offset, fcur, scur){
        if (e.touches)
            e = e.touches[0];

        this.removeListenerMulti(this.Drags[from], EVENTS[1], this.initDrags[from]);
        this.removeListenerMulti(this.Drags[from], EVENTS[1], this.initDrags[to]);
        this.addListenerMulti(this.Drags[from], EVENTS[1], this.initDrags[from]);

        if (offset < this.cornerSize && this.Drags[to]) {
            this.Drags[from].style.cursor = fcur;
            this.addListenerMulti(this.Drags[from], EVENTS[1], this.initDrags[to]);
        } else {
            this.Drags[from].style.cursor = scur;
        }
    },

    initDrag: function() {

    },
    
    initTopDrag: function(e) {
        this.processIframe();
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).top, 10);
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).height, 10);

        if (e.touches)
            this.startY = e.touches[0].clientY;
        else
            this.startY = e.clientY;

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doDrags['top']);
        this.addListenerMulti(document.documentElement, EVENTS[2], this.stopDrag);
    },

    doTopDrag: function(e) {
        let top, height;

        if (e.touches)
            e = e.touches[0];
        top = this.startTop + e.clientY - this.startY;
        height = this.startHeight - e.clientY + this.startY;

        if (top < 10 || height < 10)
            return;
        this.resizeWidget.style.top = top + 'px';
        this.resizeWidget.style.height = height + 'px';
    },

    initBottomDrag: function(e) {
        this.processIframe();
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).top, 10);
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).height, 10);

        if (e.touches)
            this.startY = e.touches[0].clientY;
        else
            this.startY = e.clientY;

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doDrags['bottom']);
        this.addListenerMulti(document.documentElement, EVENTS[2], this.stopDrag);
    },

    doBottomDrag: function(e) {
        let height = 0;

        if (e.touches)
            height = this.startHeight + e.touches[0].clientY - this.startY;
        else
            height = this.startHeight + e.clientY - this.startY;

        if (height < 10)
            return;
        this.resizeWidget.style.height = height + 'px';
    },

    initLeftDrag: function(e) {
        this.processIframe();
        this.startLeft = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).left, 10);
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).width, 10);

        if (e.touches)
            this.startX = e.touches[0].clientX;
        else
            this.startX = e.clientX;

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doDrags['left']);
        this.addListenerMulti(document.documentElement, EVENTS[2], this.stopDrag);
    },

    doLeftDrag: function(e) {
        let left, width;
        if (e.touches)
            e = e.touches[0];
        left = this.startLeft + e.clientX - this.startX;
        width = this.startWidth - e.clientX + this.startX;

        if (width < 10)
            return;
        this.resizeWidget.style.left = left + 'px';
        this.resizeWidget.style.width = width + 'px';
    },

    initRightDrag: function(e) {
        this.processIframe();
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).width, 10);

        if (e.touches)
            this.startX = e.touches[0].clientX;
        else
            this.startX = e.clientX;

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doDrags['right']);
        this.addListenerMulti(document.documentElement, EVENTS[2], this.stopDrag);
    },

    doRightDrag: function(e) {
        let width = 0;
        if (e.touches)
            width = this.startWidth + e.touches[0].clientX - this.startX;
        else
            width = this.startWidth + e.clientX - this.startX;
        if (width < 10)
            return;
        this.resizeWidget.style.width = width + 'px';
    },

    stopDrag: function(e) {
        this.resizeWidget.querySelectorAll('iframe').forEach(function(item) {
            item.style.pointerEvents = null;
        });

        DIRECTIONS.map(d => {this.removeListenerMulti(document.documentElement, EVENTS[0], this.doDrags[d]);})
        this.removeListenerMulti(document.documentElement, EVENTS[2], this.stopDrag);
    },
    checkLeftDragTopCorner: function(e) {
        const offset = e.clientY - this.getTopDistance(this.Drags['left']) + document.documentElement.scrollTop;
        this.checkDragImplementation(e, 'left', 'top', offset, 'se-resize', 'e-resize');
    },
    checkTopDragRightCorner: function(e) {
        const offset = this.getLeftDistance(this.Drags['right']) - e.clientX - document.documentElement.scrollLeft;
        this.checkDragImplementation(e, 'top', 'right', offset, 'ne-resize', 's-resize');
    },
    checkBottomDragLeftCorner: function(e) {
        const offset = e.clientX - this.getLeftDistance(this.Drags['bottom']) + document.documentElement.scrollLeft;
        this.checkDragImplementation(e, 'bottom', 'left', offset, 'ne-resize', 's-resize');
    },
    checkRightDragBottomCorner: function(e) {
        const offset =  this.getTopDistance(this.Drags['bottom']) - e.clientY - document.documentElement.scrollTop;
        this.checkDragImplementation(e, 'right', 'bottom', offset, 'se-resize', 'e-resize');
    },

    bindListeners: function() {
        this.doDrags['left'] = this.doLeftDrag.bind(this);
        this.doDrags['top'] = this.doTopDrag.bind(this);
        this.doDrags['right'] = this.doRightDrag.bind(this);
        this.doDrags['bottom'] = this.doBottomDrag.bind(this);
        
        this.stopDrag = this.stopDrag.bind(this);

        this.checkCorners['left'] = this.checkLeftDragTopCorner.bind(this);
        this.checkCorners['top'] = this.checkTopDragRightCorner.bind(this);
        this.checkCorners['bottom'] = this.checkBottomDragLeftCorner.bind(this);
        this.checkCorners['right'] = this.checkRightDragBottomCorner.bind(this);
 
        this.initDrags['top'] = this.initTopDrag.bind(this);
        this.initDrags['left'] = this.initLeftDrag.bind(this);
        this.initDrags['bottom'] = this.initBottomDrag.bind(this);
        this.initDrags['right'] = this.initRightDrag.bind(this);

    },

    // Get an element's distance from the top of the page
    getTopDistance: function(elem) {
        var location = 0;
        if (elem.offsetParent) {
            do {
                location += elem.offsetTop;
                elem = elem.offsetParent;
            } while (elem);
        }
        return location >= 0 ? location : 0;
    },

    // Get an element's distance from the left of the page
    getLeftDistance: function(elem) {
        var location = 0;
        if (elem.offsetParent) {
            do {
                location += elem.offsetLeft;
                elem = elem.offsetParent;
            } while (elem);
        }
        return location >= 0 ? location : 0;
    },

    // Bind multiiple events to a listener
    addListenerMulti: function(element, eventNames, listener) {
        var events = eventNames.split(' ');
        for (var i = 0, iLen = events.length; i < iLen; i++) {
            element.addEventListener(events[i], listener, false);
        }
    },

    // Remove multiiple events from a listener
    removeListenerMulti: function(element, eventNames, listener) {
        var events = eventNames.split(' ');
        for (var i = 0, iLen = events.length; i < iLen; i++) {
            element.removeEventListener(events[i], listener, false);
        }
    },

    // style="pointer-events:none" for iframe when drag event starts
    processIframe: function() {
        this.resizeWidget.querySelectorAll('iframe').forEach(function(item) {
            item.style.pointerEvents = 'none';
        });
    }
}

observer.init({
    name: 'CoCreateResize',
    observe: ['subtree', 'childList'],
    include: '.resize',
    callback: function(mutation) {
        coCreateResize.initElement(mutation.target);
    }
})


export default coCreateResize;