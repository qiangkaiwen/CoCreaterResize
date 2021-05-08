// "use strict";
import observer from "@cocreate/observer";
import "./style.css";

const EVENTS = ['mousemove touchmove', 'mousedown touchstart', 'mouseup touchend'];

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
            this.Drags = [];

            this.leftDrag = this.resizeWidget.querySelector(handleObj['dragLeft']);
            this.rightDrag = this.resizeWidget.querySelector(handleObj['dragRight']);
            this.topDrag = this.resizeWidget.querySelector(handleObj['dragTop']);
            this.bottomDrag = this.resizeWidget.querySelector(handleObj['dragBottom']);
            this.bindListeners();
            this.initResize();
        }
    },

    initResize: function() {
        if (this.leftDrag) {
            this.addListenerMulti(this.leftDrag, EVENTS[0], this.checkLeftDragTopCorner);
            this.addListenerMulti(this.leftDrag, EVENTS[0], this.checkLeftDragBottomCorner);
        }
        if (this.topDrag) {
            this.addListenerMulti(this.topDrag, EVENTS[0], this.checkTopDragLeftCorner);
            this.addListenerMulti(this.topDrag, EVENTS[0], this.checkTopDragRightCorner);
        }
        if (this.rightDrag) {
            this.addListenerMulti(this.rightDrag, EVENTS[0], this.checkRightDragTopCorner);
            this.addListenerMulti(this.rightDrag, EVENTS[0], this.checkRightDragBottomCorner);
        }
        if (this.bottomDrag) {
            this.addListenerMulti(this.bottomDrag, EVENTS[0], this.checkBottomDragLeftCorner);
            this.addListenerMulti(this.bottomDrag, EVENTS[0], this.checkBottomDragRightCorner);
        }
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
    
    initTopDrag: function(e) {
        this.processIframe();
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).top, 10);
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).height, 10);

        if (e.touches)
            this.startY = e.touches[0].clientY;
        else
            this.startY = e.clientY;

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doTopDrag);
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

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doBottomDrag);
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

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doLeftDrag);
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

        this.addListenerMulti(document.documentElement, EVENTS[0], this.doRightDrag);
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

        this.removeListenerMulti(document.documentElement, EVENTS[0], this.doTopDrag);
        this.removeListenerMulti(document.documentElement, EVENTS[0], this.doBottomDrag);
        this.removeListenerMulti(document.documentElement, EVENTS[0], this.doLeftDrag);
        this.removeListenerMulti(document.documentElement, EVENTS[0], this.doRightDrag);
        this.removeListenerMulti(document.documentElement, EVENTS[2], this.stopDrag);
    },

    checkTopDragLeftCorner: function(e) {
        const offset = e.clientX - this.getLeftDistance(this.topDrag) + document.documentElement.scrollLeft;
        this.checkDragImplementation(e, 'top', 'left', offset, 'se-resize', 's-resize');
    },
    checkLeftDragTopCorner: function(e) {
        const offset = e.clientY - this.getTopDistance(this.leftDrag) + document.documentElement.scrollTop;
        this.checkDragImplementation(e, 'left', 'top', offset, 'se-resize', 'e-resize');
    },
    checkTopDragRightCorner: function(e) {
        const offset = this.getLeftDistance(this.rightDrag) - e.clientX - document.documentElement.scrollLeft;
        this.checkDragImplementation(e, 'top', 'right', offset, 'ne-resize', 's-resize');
    },
    checkRightDragTopCorner: function(e) {
        const offset = e.clientY - this.getTopDistance(this.topDrag) + document.documentElement.scrollTop;
        this.checkDragImplementation(e, 'right', 'top', offset, 'ne-resize', 'e-resize');
    },
    checkBottomDragLeftCorner: function(e) {
        const offset = e.clientX - this.getLeftDistance(this.bottomDrag) + document.documentElement.scrollLeft;
        this.checkDragImplementation(e, 'bottom', 'left', offset, 'ne-resize', 's-resize');
    },
    checkLeftDragBottomCorner: function(e) {
        const offset = this.getTopDistance(this.bottomDrag) - e.clientY - document.documentElement.scrollTop;
        this.checkDragImplementation(e, 'left', 'bottom', offset, 'ne-resize', 'e-resize');
    },
    checkBottomDragRightCorner: function(e) {
        const offset = this.getLeftDistance(this.rightDrag) - e.clientX - document.documentElement.scrollLeft;
        this.checkDragImplementation(e, 'bottom', 'right', offset, 'se-resize', 's-resize');
    },
    checkRightDragBottomCorner: function(e) {
        const offset =  this.getTopDistance(this.bottomDrag) - e.clientY - document.documentElement.scrollTop;
        this.checkDragImplementation(e, 'right', 'bottom', offset, 'se-resize', 'e-resize');
    },

    bindListeners: function() {
        this.initLeftDrag = this.initLeftDrag.bind(this);
        this.initTopDrag = this.initTopDrag.bind(this);
        this.initRightDrag = this.initRightDrag.bind(this);
        this.initBottomDrag = this.initBottomDrag.bind(this);
        
        this.doLeftDrag = this.doLeftDrag.bind(this);
        this.doTopDrag = this.doTopDrag.bind(this);
        this.doRightDrag = this.doRightDrag.bind(this);
        this.doBottomDrag = this.doBottomDrag.bind(this);
        
        this.stopDrag = this.stopDrag.bind(this);

        this.checkTopDragLeftCorner = this.checkTopDragLeftCorner.bind(this);
        this.checkLeftDragTopCorner = this.checkLeftDragTopCorner.bind(this);
        this.checkTopDragRightCorner = this.checkTopDragRightCorner.bind(this);
        this.checkRightDragTopCorner = this.checkRightDragTopCorner.bind(this);
        this.checkBottomDragLeftCorner = this.checkBottomDragLeftCorner.bind(this);
        this.checkLeftDragBottomCorner = this.checkLeftDragBottomCorner.bind(this);
        this.checkBottomDragRightCorner = this.checkBottomDragRightCorner.bind(this);
        this.checkRightDragBottomCorner = this.checkRightDragBottomCorner.bind(this);
 
        this.initDrags['top'] = this.initTopDrag;
        this.initDrags['left'] = this.initLeftDrag;
        this.initDrags['bottom'] = this.initBottomDrag;
        this.initDrags['right'] = this.initRightDrag;

        this.Drags['top'] = this.topDrag;
        this.Drags['left'] = this.leftDrag;
        this.Drags['bottom'] = this.bottomDrag;
        this.Drags['right'] = this.rightDrag;
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
// CoCreateResize.init({
//     selector: "* [data-resize]",
//     dragLeft: "[data-resize='left']",
//     dragRight: "[data-resize='right']",
//     dragTop: "[data-resize='top']",
//     dragBottom: "[data-resize='bottom']",
// });


export default coCreateResize;