window.Global = {};
window.getURL = function(a, b) {
    if (!b) {
        b = "_blank"
    }
    window.open(a, b)
};
if (typeof(console) === "undefined") {
    window.console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = function() {}
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(b, a) {
            window.setTimeout(b, 1000 / 60)
        }
    })()
}
window.performance = (function() {
    if (window.performance && window.performance.now) {
        return window.performance
    } else {
        return Date
    }
})();
Date.now = Date.now || function() {
    return +new Date
};
window.Class = function(b, c) {
    var f = this || window;
    var d = b.toString();
    var a = b.toString().match(/function ([^\(]+)/)[1];
    var e = null;
    if (typeof c === "function") {
        e = c;
        c = null
    }
    c = (c || "").toLowerCase();
    b.prototype.__call = function() {
        if (this.events) {
            this.events.scope(this)
        }
    };
    if (!c) {
        f[a] = b;
        e && e()
    } else {
        if (c == "static") {
            f[a] = new b()
        } else {
            if (c == "singleton") {
                f[a] = (function() {
                    var h = {};
                    var g;
                    h.instance = function() {
                        if (!g) {
                            g = new b()
                        }
                        return g
                    };
                    return h
                })()
            }
        }
    }
    if (this !== window) {
        if (!this.__namespace) {
            this.__namespace = this.constructor.toString().match(/function ([^\(]+)/)[1]
        }
        this[a]._namespace = this.__namespace
    }
};
window.Inherit = function(f, a, d) {
    if (typeof d === "undefined") {
        d = f
    }
    var c = new a(d, true);
    var b = {};
    for (var e in c) {
        f[e] = c[e];
        b[e] = c[e]
    }
    if (f.__call) {
        f.__call()
    }
    defer(function() {
        for (e in c) {
            if ((f[e] && b[e]) && f[e] !== b[e]) {
                f["_" + e] = b[e]
            }
        }
        c = b = null;
        f = a = d = null
    })
};
window.Implement = function(b, a) {
    Render.nextFrame(function() {
        var c = new a();
        for (var e in c) {
            if (typeof b[e] === "undefined") {
                throw "Interface Error: Missing Property: " + e + " ::: " + a
            } else {
                var d = typeof c[e];
                if (typeof b[e] != d) {
                    throw "Interface Error: Property " + e + " is Incorrect Type ::: " + a
                }
            }
        }
    })
};
window.Namespace = function(a) {
    if (typeof a === "string") {
        window[a] = {
            Class: window.Class
        }
    } else {
        a.Class = window.Class
    }
};
window.Interface = function(b) {
    var a = b.toString().match(/function ([^\(]+)/)[1];
    Hydra.INTERFACES[a] = b
};
window.THREAD = false;
Class(function HydraObject(a, b, d, c) {
    this._children = new LinkedList();
    this.__useFragment = c;
    this._initSelector(a, b, d)
}, function() {
    var a = HydraObject.prototype;
    a._initSelector = function(b, d, f) {
        if (b && typeof b !== "string") {
            this.div = b
        } else {
            var e = b ? b.charAt(0) : null;
            var c = b ? b.slice(1) : null;
            if (e != "." && e != "#") {
                c = b;
                e = "."
            }
            if (!f) {
                this._type = d || "div";
                if (this._type == "svg") {
                    this.div = document.createElementNS("http://www.w3.org/2000/svg", this._type);
                    this.div.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink")
                } else {
                    this.div = document.createElement(this._type);
                    if (e) {
                        if (e == "#") {
                            this.div.id = c
                        } else {
                            this.div.className = c
                        }
                    }
                }
            } else {
                if (e != "#") {
                    throw "Hydra Selectors Require #ID"
                }
                this.div = document.getElementById(c)
            }
        }
        this.div.hydraObject = this
    };
    a.addChild = a.add = function(d) {
        var c = this.div;
        var b = function() {
            if (this.__useFragment) {
                if (!this._fragment) {
                    this._fragment = document.createDocumentFragment();
                    var e = this;
                    defer(function() {
                        if (!e._fragment || !e.div) {
                            return e._fragment = null
                        }
                        e.div.appendChild(e._fragment);
                        e._fragment = null
                    })
                }
                c = this._fragment
            }
        };
        if (d.element && d.element instanceof HydraObject) {
            b();
            c.appendChild(d.element.div);
            this._children.push(d.element);
            d.element._parent = this;
            d.element.div.parentNode = this.div
        } else {
            if (d.div) {
                b();
                c.appendChild(d.div);
                this._children.push(d);
                d._parent = this;
                d.div.parentNode = this.div
            } else {
                if (d.nodeName) {
                    b();
                    c.appendChild(d);
                    d.parentNode = this.div
                }
            }
        }
        return this
    };
    a.clone = function() {
        return $(this.div.cloneNode(true))
    };
    a.create = function(b, c) {
        var d = $(b, c);
        this.addChild(d);
        if (this.__root) {
            this.__root.__append[b] = d;
            d.__root = this.__root
        }
        return d
    };
    a.empty = function() {
        var b = this._children.start();
        while (b) {
            if (b && b.remove) {
                b.remove()
            }
            b = this._children.next()
        }
        this.div.innerHTML = "";
        return this
    };
    a.parent = function() {
        return this._parent
    };
    a.children = function() {
        return this.div.children ? this.div.children : this.div.childNodes
    };
    a.append = function(c, b) {
        if (!this.__root) {
            this.__root = this;
            this.__append = {}
        }
        return c.apply(this, b)
    };
    a.removeChild = function(c, b) {
        try {
            c.div.parentNode.removeChild(c.div)
        } catch (d) {}
        if (!b) {
            this._children.remove(c)
        }
    };
    a.remove = a.destroy = function() {
        this.removed = true;
        var b = this._parent;
        if (!!(b && !b.removed && b.removeChild)) {
            b.removeChild(this, true)
        }
        var c = this._children.start();
        while (c) {
            if (c && c.remove) {
                c.remove()
            }
            c = this._children.next()
        }
        this._children.destroy();
        this.div.hydraObject = null;
        Utils.nullObject(this)
    }
});
Class(function Hydra() {
    var f = this;
    var d, b;
    var e = [];
    this.READY = false;
    this.HASH = window.location.hash.slice(1);
    this.LOCAL = location.hostname.indexOf("local") > -1 || location.hostname.split(".")[0] == "10" || location.hostname.split(".")[0] == "192";
    (function() {
        a()
    })();

    function a() {
        if (!document || !window) {
            return setTimeout(a, 1)
        }
        if (window._NODE_) {
            f.addEvent = "addEventListener";
            f.removeEvent = "removeEventListener";
            return setTimeout(c, 1)
        }
        if (window.addEventListener) {
            f.addEvent = "addEventListener";
            f.removeEvent = "removeEventListener";
            window.addEventListener("load", c, false)
        } else {
            f.addEvent = "attachEvent";
            f.removeEvent = "detachEvent";
            window.attachEvent("onload", c)
        }
    }

    function c() {
        if (window.removeEventListener) {
            window.removeEventListener("load", c, false)
        }
        for (var g = 0; g < e.length; g++) {
            e[g]()
        }
        e = null;
        f.READY = true;
        if (window.Main) {
            Hydra.Main = new window.Main()
        }
    }
    this.development = function(g) {
        if (!g) {
            clearInterval(d)
        } else {
            d = setInterval(function() {
                for (var l in window) {
                    if (l.strpos("webkit")) {
                        continue
                    }
                    var k = window[l];
                    if (typeof k !== "function" && l.length > 2) {
                        if (l.strpos("_ga") || l.strpos("_typeface_js")) {
                            continue
                        }
                        var j = l.charAt(0);
                        var h = l.charAt(1);
                        if (j == "_" || j == "$") {
                            if (h !== h.toUpperCase()) {
                                console.log(window[l]);
                                throw "Hydra Warning:: " + l + " leaking into global scope"
                            }
                        }
                    }
                }
            }, 1000)
        }
    };
    this.getArguments = function(k) {
        var j = this.arguments;
        var g = [];
        for (var h = 1; h < j.length; h++) {
            if (j[h] !== null) {
                g.push(j[h])
            }
        }
        return g
    };
    this.getClassName = function(g) {
        return g.constructor.name || g.constructor.toString().match(/function ([^\(]+)/)[1]
    };
    this.ready = function(g) {
        if (this.READY) {
            return g()
        }
        e.push(g)
    };
    this.$ = function(g, h, j) {
        return new HydraObject(g, h, j)
    };
    this.__triggerReady = function() {
        c()
    };
    this.INTERFACES = {};
    this.HTML = {};
    this.JSON = {};
    this.$.fn = HydraObject.prototype;
    window.$ = this.$;
    window.ready = this.ready
}, "Static");
Hydra.ready(function() {
    window.__window = $(window);
    window.__document = $(document);
    window.__body = $(document.getElementsByTagName("body")[0]);
    window.Stage = __body.create("#Stage");
    Stage.size("100%");
    Stage.__useFragment = true;
    Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
    Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;
    (function() {
        var b = Date.now();
        var a;
        setTimeout(function() {
            var g = ["hidden", "msHidden", "webkitHidden"];
            var f, e;
            (function() {
                for (var h in g) {
                    if (document[g[h]] !== "undefined") {
                        f = g[h];
                        switch (f) {
                            case "hidden":
                                e = "visibilitychange";
                                break;
                            case "msHidden":
                                e = "msvisibilitychange";
                                break;
                            case "webkitHidden":
                                e = "webkitvisibilitychange";
                                break
                        }
                        return
                    }
                }
            })();
            if (typeof document[f] === "undefined") {
                if (Device.browser.ie) {
                    document.onfocus = c;
                    document.onblur = d
                } else {
                    window.onfocus = c;
                    window.onblur = d
                }
            } else {
                document.addEventListener(e, function() {
                    var h = Date.now();
                    if (h - b > 10) {
                        if (document[f] === false) {
                            c()
                        } else {
                            d()
                        }
                    }
                    b = h
                })
            }
        }, 250);

        function c() {
            if (a != "focus") {
                HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {
                    type: "focus"
                })
            }
            a = "focus"
        }

        function d() {
            if (a != "blur") {
                HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {
                    type: "blur"
                })
            }
            a = "blur"
        }
    })();
    window.onresize = function() {
        if (!Device.mobile) {
            Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
            Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;
            HydraEvents._fireEvent(HydraEvents.RESIZE)
        }
    }
});
(function() {
    $.fn.text = function(a) {
        if (typeof a !== "undefined") {
            this.div.textContent = a;
            return this
        } else {
            return this.div.textContent
        }
    };
    $.fn.html = function(b, a) {
        if (b && !b.strpos("<") && !a) {
            return this.text(b)
        }
        if (typeof b !== "undefined") {
            this.div.innerHTML = b;
            return this
        } else {
            return this.div.innerHTML
        }
    };
    $.fn.hide = function() {
        this.div.style.display = "none";
        return this
    };
    $.fn.show = function() {
        this.div.style.display = "";
        return this
    };
    $.fn.visible = function() {
        this.div.style.visibility = "visible";
        return this
    };
    $.fn.invisible = function() {
        this.div.style.visibility = "hidden";
        return this
    };
    $.fn.setZ = function(a) {
        this.div.style.zIndex = a;
        return this
    };
    $.fn.clearAlpha = function() {
        this.div.style.opacity = "";
        return this
    };
    $.fn.size = function(a, b, c) {
        if (typeof a === "string") {
            if (typeof b === "undefined") {
                b = "100%"
            } else {
                if (typeof b !== "string") {
                    b = b + "px"
                }
            }
            this.div.style.width = a;
            this.div.style.height = b
        } else {
            this.div.style.width = a + "px";
            this.div.style.height = b + "px";
            if (!c) {
                this.div.style.backgroundSize = a + "px " + b + "px"
            }
        }
        this.width = a;
        this.height = b;
        return this
    };
    $.fn.mouseEnabled = function(a) {
        this.div.style.pointerEvents = a ? "auto" : "none";
        return this
    };
    $.fn.fontStyle = function(e, c, b, d) {
        var a = {};
        if (e) {
            a.fontFamily = e
        }
        if (c) {
            a.fontSize = c
        }
        if (b) {
            a.color = b
        }
        if (d) {
            a.fontStyle = d
        }
        this.css(a);
        return this
    };
    $.fn.bg = function(c, a, d, b) {
        if (!c) {
            return this
        }
        if (Hydra.CDN) {
            if (!c.strpos("http") && c.strpos(".")) {
                c = Hydra.CDN + c
            }
        }
        if (!c.strpos(".")) {
            this.div.style.backgroundColor = c
        } else {
            this.div.style.backgroundImage = "url(" + c + ")"
        }
        if (typeof a !== "undefined") {
            a = typeof a == "number" ? a + "px" : a;
            d = typeof d == "number" ? d + "px" : d;
            this.div.style.backgroundPosition = a + " " + d
        }
        if (b) {
            this.div.style.backgroundSize = "";
            this.div.style.backgroundRepeat = b
        }
        if (a == "cover" || a == "contain") {
            this.div.style.backgroundSize = a;
            this.div.style.backgroundPosition = typeof d != "undefined" ? d + " " + b : "center"
        }
        return this
    };
    $.fn.center = function(a, d, b) {
        var c = {};
        if (typeof a === "undefined") {
            c.left = "50%";
            c.top = "50%";
            c.marginLeft = -this.width / 2;
            c.marginTop = -this.height / 2
        } else {
            if (a) {
                c.left = "50%";
                c.marginLeft = -this.width / 2
            }
            if (d) {
                c.top = "50%";
                c.marginTop = -this.height / 2
            }
        }
        if (b) {
            delete c.left;
            delete c.top
        }
        this.css(c);
        return this
    };
    $.fn.mask = function(b, a, e, c, d) {
        this.div.style[CSS.prefix("Mask")] = (b.strpos(".") ? "url(" + b + ")" : b) + " no-repeat";
        return this
    };
    $.fn.blendMode = function(b, a) {
        if (a) {
            this.div.style["background-blend-mode"] = b
        } else {
            this.div.style["mix-blend-mode"] = b
        }
        return this
    };
    $.fn.css = function(d, c) {
        if (typeof c == "boolean") {
            skip = c;
            c = null
        }
        if (typeof d !== "object") {
            if (!c) {
                var b = this.div.style[d];
                if (typeof b !== "number") {
                    if (b.strpos("px")) {
                        b = Number(b.slice(0, -2))
                    }
                    if (d == "opacity") {
                        b = !isNaN(Number(this.div.style.opacity)) ? Number(this.div.style.opacity) : 1
                    }
                }
                if (!b) {
                    b = 0
                }
                return b
            } else {
                this.div.style[d] = c;
                return this
            }
        }
        TweenManager.clearCSSTween(this);
        for (var a in d) {
            var e = d[a];
            if (!(typeof e === "string" || typeof e === "number")) {
                continue
            }
            if (typeof e !== "string" && a != "opacity" && a != "zIndex") {
                e += "px"
            }
            this.div.style[a] = e
        }
        return this
    };
    $.fn.transform = function(c) {
        if (this.multiTween && this._cssTweens.length > 1 && this.__transformTime && Render.TIME - this.__transformTime < 15) {
            return
        }
        this.__transformTime = Render.TIME;
        TweenManager.clearCSSTween(this);
        if (Device.tween.css2d) {
            if (!c) {
                c = this
            } else {
                for (var b in c) {
                    if (typeof c[b] === "number") {
                        this[b] = c[b]
                    }
                }
            }
            var a;
            if (!this._matrix) {
                a = TweenManager.parseTransform(c)
            } else {
                if (this._matrix.type == "matrix2") {
                    this._matrix.setTRS(this.x, this.y, this.rotation, this.scaleX || this.scale, this.scaleY || this.scale)
                } else {
                    this._matrix.setTRS(this.x, this.y, this.z, this.rotationX, this.rotationY, this.rotationZ, this.scaleX || this.scale, this.scaleY || this.scale, this.scaleZ || this.scale)
                }
                a = this._matrix.getCSS()
            }
            if (this.__transformCache != a) {
                this.div.style[Device.styles.vendorTransform] = a;
                this.__transformCache = a
            }
        }
        return this
    };
    $.fn.useMatrix3D = function() {
        this._matrix = new Matrix4();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scale = 1;
        return this
    };
    $.fn.useMatrix2D = function() {
        this._matrix = new Matrix2();
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scale = 1;
        return this
    };
    $.fn.willChange = function(b) {
        if (typeof b === "boolean") {
            if (b === true) {
                this._willChangeLock = true
            } else {
                this._willChangeLock = false
            }
        } else {
            if (this._willChangeLock) {
                return
            }
        }
        var a = typeof b === "string";
        if ((!this._willChange || a) && typeof b !== "null") {
            this._willChange = true;
            this.div.style["will-change"] = a ? b : Device.transformProperty + ", opacity"
        } else {
            this._willChange = false;
            this.div.style["will-change"] = ""
        }
    };
    $.fn.backfaceVisibility = function(a) {
        if (a) {
            this.div.style[CSS.prefix("BackfaceVisibility")] = "visible"
        } else {
            this.div.style[CSS.prefix("BackfaceVisibility")] = "hidden"
        }
    };
    $.fn.enable3D = function(b, a, c) {
        this.div.style[CSS.prefix("TransformStyle")] = "preserve-3d";
        if (b) {
            this.div.style[CSS.prefix("Perspective")] = b + "px"
        }
        if (typeof a !== "undefined") {
            a = typeof a === "number" ? a + "px" : a;
            c = typeof c === "number" ? c + "px" : c;
            this.div.style[CSS.prefix("PerspectiveOrigin")] = a + " " + c
        }
        return this
    };
    $.fn.disable3D = function() {
        this.div.style[CSS.prefix("TransformStyle")] = "";
        this.div.style[CSS.prefix("Perspective")] = "";
        return this
    };
    $.fn.transformPoint = function(a, d, c) {
        var b = "";
        if (typeof a !== "undefined") {
            b += (typeof a === "number" ? a + "px " : a + " ")
        }
        if (typeof d !== "undefined") {
            b += (typeof d === "number" ? d + "px " : d + " ")
        }
        if (typeof c !== "undefined") {
            b += (typeof c === "number" ? c + "px" : c)
        }
        this.div.style[CSS.prefix("TransformOrigin")] = b;
        return this
    };
    $.fn.tween = function(c, d, e, a, f, b) {
        if (typeof a === "boolean") {
            b = a;
            a = 0;
            f = null
        } else {
            if (typeof a === "function") {
                f = a;
                a = 0
            }
        }
        if (typeof f === "boolean") {
            b = f;
            f = null
        }
        if (!a) {
            a = 0
        }
        return TweenManager._detectTween(this, c, d, e, a, f, b)
    };
    $.fn.clearTransform = function() {
        if (typeof this.x === "number") {
            this.x = 0
        }
        if (typeof this.y === "number") {
            this.y = 0
        }
        if (typeof this.z === "number") {
            this.z = 0
        }
        if (typeof this.scale === "number") {
            this.scale = 1
        }
        if (typeof this.scaleX === "number") {
            this.scaleX = 1
        }
        if (typeof this.scaleY === "number") {
            this.scaleY = 1
        }
        if (typeof this.rotation === "number") {
            this.rotation = 0
        }
        if (typeof this.rotationX === "number") {
            this.rotationX = 0
        }
        if (typeof this.rotationY === "number") {
            this.rotationY = 0
        }
        if (typeof this.rotationZ === "number") {
            this.rotationZ = 0
        }
        if (typeof this.skewX === "number") {
            this.skewX = 0
        }
        if (typeof this.skewY === "number") {
            this.skewY = 0
        }
        this.div.style[Device.styles.vendorTransform] = "";
        return this
    };
    $.fn.stopTween = function() {
        if (this._cssTween) {
            this._cssTween.stop()
        }
        if (this._mathTween) {
            this._mathTween.stop()
        }
        return this
    };
    $.fn.keypress = function(a) {
        this.div.onkeypress = function(b) {
            b = b || window.event;
            b.code = b.keyCode ? b.keyCode : b.charCode;
            if (a) {
                a(b)
            }
        }
    };
    $.fn.keydown = function(a) {
        this.div.onkeydown = function(b) {
            b = b || window.event;
            b.code = b.keyCode;
            if (a) {
                a(b)
            }
        }
    };
    $.fn.keyup = function(a) {
        this.div.onkeyup = function(b) {
            b = b || window.event;
            b.code = b.keyCode;
            if (a) {
                a(b)
            }
        }
    };
    $.fn.attr = function(a, b) {
        if (a && b) {
            if (b == "") {
                this.div.removeAttribute(a)
            } else {
                this.div.setAttribute(a, b)
            }
        } else {
            if (a) {
                return this.div.getAttribute(a)
            }
        }
        return this
    };
    $.fn.val = function(a) {
        if (typeof a === "undefined") {
            return this.div.value
        } else {
            this.div.value = a
        }
        return this
    };
    $.fn.change = function(b) {
        var a = this;
        if (this._type == "select") {
            this.div.onchange = function() {
                b({
                    object: a,
                    value: a.div.value || ""
                })
            }
        }
    };
    $.fn.svgSymbol = function(e, d, a) {
        var c = SVG.getSymbolConfig(e);
        var b = '<svg viewBox="0 0 ' + c.width + " " + c.height + '" width="' + d + '" height="' + a + '"><use xlink:href="#' + c.id + '" x="0" y="0" /></svg>';
        this.html(b, true)
    }
})();
(function() {
    var a = !!window.MSGesture;
    var b = function(c) {
        if (Hydra.addEvent == "attachEvent") {
            switch (c) {
                case "click":
                    return "onclick";
                    break;
                case "mouseover":
                    return "onmouseover";
                    break;
                case "mouseout":
                    return "onmouseleave";
                    break;
                case "mousedown":
                    return "onmousedown";
                    break;
                case "mouseup":
                    return "onmouseup";
                    break;
                case "mousemove":
                    return "onmousemove";
                    break
            }
        }
        if (a) {
            switch (c) {
                case "touchstart":
                    return "pointerdown";
                    break;
                case "touchmove":
                    return "MSGestureChange";
                    break;
                case "touchend":
                    return "pointerup";
                    break
            }
        }
        return c
    };
    $.fn.click = function(e) {
        var d = this;

        function c(f) {
            if (!d.div) {
                return false
            }
            if (Mouse._preventClicks) {
                return false
            }
            f.object = d.div.className == "hit" ? d.parent() : d;
            f.action = "click";
            if (!f.pageX) {
                f.pageX = f.clientX;
                f.pageY = f.clientY
            }
            if (e) {
                e(f)
            }
            if (Mouse.autoPreventClicks) {
                Mouse.preventClicks()
            }
        }
        this.div[Hydra.addEvent](b("click"), c, true);
        this.div.style.cursor = "pointer";
        return this
    };
    $.fn.hover = function(h) {
        var g = this;
        var f = false;
        var e;

        function c(l) {
            if (!g.div) {
                return false
            }
            var k = Date.now();
            var j = l.toElement || l.relatedTarget;
            if (e && (k - e) < 5) {
                e = k;
                return false
            }
            e = k;
            l.object = g.div.className == "hit" ? g.parent() : g;
            switch (l.type) {
                case "mouseout":
                    l.action = "out";
                    break;
                case "mouseleave":
                    l.action = "out";
                    break;
                default:
                    l.action = "over";
                    break
            }
            if (f) {
                if (Mouse._preventClicks) {
                    return false
                }
                if (l.action == "over") {
                    return false
                }
                if (l.action == "out") {
                    if (d(g.div, j)) {
                        return false
                    }
                }
                f = false
            } else {
                if (l.action == "out") {
                    return false
                }
                f = true
            }
            if (!l.pageX) {
                l.pageX = l.clientX;
                l.pageY = l.clientY
            }
            if (h) {
                h(l)
            }
        }

        function d(m, k) {
            var j = m.children.length - 1;
            for (var l = j; l > -1; l--) {
                if (k == m.children[l]) {
                    return true
                }
            }
            for (l = j; l > -1; l--) {
                if (d(m.children[l], k)) {
                    return true
                }
            }
        }
        this.div[Hydra.addEvent](b("mouseover"), c, true);
        this.div[Hydra.addEvent](b("mouseout"), c, true);
        return this
    };
    $.fn.press = function(e) {
        var d = this;

        function c(f) {
            if (!d.div) {
                return false
            }
            f.object = d.div.className == "hit" ? d.parent() : d;
            switch (f.type) {
                case "mousedown":
                    f.action = "down";
                    break;
                default:
                    f.action = "up";
                    break
            }
            if (!f.pageX) {
                f.pageX = f.clientX;
                f.pageY = f.clientY
            }
            if (e) {
                e(f)
            }
        }
        this.div[Hydra.addEvent](b("mousedown"), c, true);
        this.div[Hydra.addEvent](b("mouseup"), c, true);
        return this
    };
    $.fn.bind = function(d, j) {
        if (!this._events) {
            this._events = {}
        }
        if (a && this == __window) {
            return Stage.bind(d, j)
        }
        if (d == "touchstart") {
            if (!Device.mobile) {
                d = "mousedown"
            }
        } else {
            if (d == "touchmove") {
                if (!Device.mobile) {
                    d = "mousemove"
                }
                if (a && !this.div.msGesture) {
                    this.div.msGesture = new MSGesture();
                    this.div.msGesture.target = this.div
                }
            } else {
                if (d == "touchend") {
                    if (!Device.mobile) {
                        d = "mouseup"
                    }
                }
            }
        }
        this._events["bind_" + d] = this._events["bind_" + d] || [];
        var h = this._events["bind_" + d];
        var g = {};
        var f = this.div;
        g.callback = j;
        g.target = this.div;
        h.push(g);

        function c(o) {
            if (a && f.msGesture && d == "touchstart") {
                f.msGesture.addPointer(o.pointerId)
            }
            var p = Utils.touchEvent(o);
            if (a) {
                var n = o;
                o = {};
                o.x = Number(n.pageX || n.clientX);
                o.y = Number(n.pageY || n.clientY);
                o.target = n.target;
                o.currentTarget = n.currentTarget;
                o.path = [];
                var m = o.target;
                while (m) {
                    o.path.push(m);
                    m = m.parentElement || null
                }
                o.windowsPointer = true
            } else {
                o.x = p.x;
                o.y = p.y
            }
            for (var k = 0; k < h.length; k++) {
                var l = h[k];
                if (l.target == o.currentTarget) {
                    l.callback(o)
                }
            }
        }
        if (!this._events["fn_" + d]) {
            this._events["fn_" + d] = c;
            this.div[Hydra.addEvent](b(d), c, true)
        }
        return this
    };
    $.fn.unbind = function(c, g) {
        if (!this._events) {
            this._events = {}
        }
        if (a && this == __window) {
            return Stage.unbind(c, g)
        }
        if (c == "touchstart") {
            if (!Device.mobile) {
                c = "mousedown"
            }
        } else {
            if (c == "touchmove") {
                if (!Device.mobile) {
                    c = "mousemove"
                }
            } else {
                if (c == "touchend") {
                    if (!Device.mobile) {
                        c = "mouseup"
                    }
                }
            }
        }
        var f = this._events["bind_" + c];
        if (!f) {
            return this
        }
        for (var d = 0; d < f.length; d++) {
            var e = f[d];
            if (e.callback == g) {
                f.splice(d, 1)
            }
        }
        if (this._events["fn_" + c] && !f.length) {
            this.div[Hydra.removeEvent](b(c), this._events["fn_" + c], true);
            this._events["fn_" + c] = null
        }
        return this
    };
    $.fn.interact = function(d, c) {
        if (!this.hit) {
            this.hit = $(".hit");
            this.hit.css({
                width: "100%",
                height: "100%",
                zIndex: 99999,
                top: 0,
                left: 0,
                position: "absolute",
                background: "rgba(255, 255, 255, 0)"
            });
            this.addChild(this.hit)
        }
        if (!Device.mobile) {
            this.hit.hover(d).click(c)
        } else {
            this.hit.touchClick(d, c)
        }
    };
    $.fn.touchSwipe = function(k, c) {
        if (!window.addEventListener) {
            return this
        }
        var f = this;
        var d = c || 75;
        var m, l;
        var g = false;
        var n = {};
        if (Device.mobile) {
            this.div.addEventListener(b("touchstart"), e);
            this.div.addEventListener(b("touchend"), j);
            this.div.addEventListener(b("touchcancel"), j)
        }

        function e(o) {
            var p = Utils.touchEvent(o);
            if (!f.div) {
                return false
            }
            if (o.touches.length == 1) {
                m = p.x;
                l = p.y;
                g = true;
                f.div.addEventListener(b("touchmove"), h)
            }
        }

        function h(q) {
            if (!f.div) {
                return false
            }
            if (g) {
                var r = Utils.touchEvent(q);
                var p = m - r.x;
                var o = l - r.y;
                n.direction = null;
                n.moving = null;
                n.x = null;
                n.y = null;
                n.evt = q;
                if (Math.abs(p) >= d) {
                    j();
                    if (p > 0) {
                        n.direction = "left"
                    } else {
                        n.direction = "right"
                    }
                } else {
                    if (Math.abs(o) >= d) {
                        j();
                        if (o > 0) {
                            n.direction = "up"
                        } else {
                            n.direction = "down"
                        }
                    } else {
                        n.moving = true;
                        n.x = p;
                        n.y = o
                    }
                }
                if (k) {
                    k(n, q)
                }
            }
        }

        function j(o) {
            if (!f.div) {
                return false
            }
            m = l = g = false;
            f.div.removeEventListener(b("touchmove"), h)
        }
        return this
    };
    $.fn.touchClick = function(f, l) {
        if (!window.addEventListener) {
            return this
        }
        var e = this;
        var n, m;
        var d = {};
        var g = {};
        if (Device.mobile) {
            this.div.addEventListener(b("touchmove"), h, false);
            this.div.addEventListener(b("touchstart"), c, false);
            this.div.addEventListener(b("touchend"), j, false)
        }

        function h(o) {
            if (!e.div) {
                return false
            }
            g = Utils.touchEvent(o);
            if (Utils.findDistance(d, g) > 5) {
                m = true
            } else {
                m = false
            }
        }

        function k(o) {
            var p = Utils.touchEvent(o);
            o.touchX = p.x;
            o.touchY = p.y;
            d.x = o.touchX;
            d.y = o.touchY
        }

        function c(o) {
            if (!e.div) {
                return false
            }
            n = Date.now();
            o.action = "over";
            o.object = e.div.className == "hit" ? e.parent() : e;
            k(o);
            if (f && !m) {
                f(o)
            }
        }

        function j(q) {
            if (!e.div) {
                return false
            }
            var p = Date.now();
            var o = false;
            q.object = e.div.className == "hit" ? e.parent() : e;
            k(q);
            if (n && p - n < 750) {
                if (Mouse._preventClicks) {
                    return false
                }
                if (l && !m) {
                    o = true;
                    q.action = "click";
                    if (l && !m) {
                        l(q)
                    }
                    if (Mouse.autoPreventClicks) {
                        Mouse.preventClicks()
                    }
                }
            }
            if (f) {
                q.action = "out";
                if (!Mouse._preventFire) {
                    f(q)
                }
            }
            m = false
        }
        return this
    }
})();
Class(function MVC() {
    Inherit(this, Events);
    var c = {};
    var b = {};
    var a = [];
    this.classes = {};

    function d(f, e) {
        c[e] = {};
        Object.defineProperty(f, e, {
            set: function(g) {
                if (c[e] && c[e].s) {
                    c[e].s.call(f, g)
                }
                g = null
            },
            get: function() {
                if (c[e] && c[e].g) {
                    return c[e].g.apply(f)
                }
            }
        })
    }
    this.set = function(f, e) {
        if (!c[f]) {
            d(this, f)
        }
        c[f].s = e
    };
    this.get = function(f, e) {
        if (!c[f]) {
            d(this, f)
        }
        c[f].g = e
    };
    this.delayedCall = function(j, e, f) {
        var h = this;
        var g = Timer.create(function() {
            if (h.destroy) {
                j(f)
            }
            h = j = null
        }, e || 0);
        a.push(g);
        if (a.length > 20) {
            a.shift()
        }
        return g
    };
    this.initClass = function(o, r, q, p, n, m, l, k) {
        var h = Utils.timestamp();
        if (window.Hydra) {
            Hydra.arguments = arguments
        }
        var j = new o(r, q, p, n, m, l, k);
        if (window.Hydra) {
            Hydra.arguments = null
        }
        j.parent = this;
        if (j.destroy) {
            this.classes[h] = j;
            this.classes[h].__id = h
        }
        var s = arguments[arguments.length - 1];
        if (Array.isArray(s) && s.length == 1 && s[0] instanceof HydraObject) {
            s[0].addChild(j)
        } else {
            if (this.element && s !== null) {
                this.element.addChild(j)
            }
        }
        return j
    };
    this.destroy = function() {
        if (this.onDestroy) {
            this.onDestroy()
        }
        for (var f in this.classes) {
            var e = this.classes[f];
            if (e && e.destroy) {
                e.destroy()
            }
        }
        this.clearTimers && this.clearTimers();
        this.classes = null;
        if (this.events) {
            this.events = this.events.destroy()
        }
        if (this.element && this.element.remove) {
            this.element = this.container = this.element.remove()
        }
        if (this.parent && this.parent.__destroyChild) {
            this.parent.__destroyChild(this.__id)
        }
        return Utils.nullObject(this)
    };
    this.clearTimers = function() {
        for (i = 0; i < a.length; i++) {
            clearTimeout(a[i])
        }
        a.length = 0
    };
    this.active = function(e, f) {
        if (typeof f !== "undefined") {
            b[e] = f
        } else {
            return b[e]
        }
    };
    this.__destroyChild = function(e) {
        delete this.classes[e]
    }
});
Class(function Model(a) {
    Inherit(this, MVC);
    var b = {};
    this.push = function(c, d) {
        b[c] = d
    };
    this.pull = function(c) {
        return b[c]
    };
    this.initWithData = function(f) {
        this.STATIC_DATA = f;
        for (var e in this) {
            var c = this[e];
            var g = false;
            for (var d in f) {
                if (d.toLowerCase().replace(/-/g, "") == e.toLowerCase()) {
                    g = true;
                    if (c.init) {
                        c.init(f[d])
                    }
                }
            }
            if (!g && c.init) {
                c.init()
            }
        }
    };
    this.loadData = function(c, e) {
        var d = this;
        XHR.get(c + "?" + Utils.timestamp(), function(f) {
            defer(function() {
                d.initWithData(f);
                e(f)
            })
        })
    };
    this.Class = function(d) {
        var c = d.toString().match(/function ([^\(]+)/)[1];
        this[c] = new d()
    }
});
Class(function View(e) {
    Inherit(this, MVC);
    var f;
    var c = Hydra.getClassName(e);
    this.element = $("." + c);
    this.element.__useFragment = true;
    this.css = function(h) {
        this.element.css(h);
        return this
    };
    this.transform = function(h) {
        this.element.transform(h || this);
        return this
    };
    this.tween = function(k, l, m, h, n, j) {
        return this.element.tween(k, l, m, h, n, j)
    };
    var b = Hydra.INTERFACES[c] || Hydra.INTERFACES[c + "UI"];
    if (b) {
        this.ui = {};
        var g = Hydra.getArguments();
        g.push(e);
        f = this.element.append(b, g);
        var a = this.element.__append;
        for (var d in a) {
            this.ui[d] = a[d]
        }
        if (f) {
            this.resize = function() {
                f.apply(this.ui, arguments)
            }
        }
    }
    this.__call = function() {
        this.events.scope(this)
    }
});
Class(function Controller(a) {
    Inherit(this, MVC);
    a = Hydra.getClassName(a);
    this.element = this.container = $("#" + a);
    this.element.__useFragment = true;
    this.css = function(b) {
        this.container.css(b)
    }
});
Class(function Component() {
    Inherit(this, MVC);
    this.__call = function() {
        this.events.scope(this);
        delete this.__call
    }
});
Class(function Utils() {
    var c = this;
    if (typeof Float32Array == "undefined") {
        Float32Array = Array
    }

    function b(e, d) {
        return a(Math.random(), e, d)
    }

    function a(e, f, d) {
        return f + (d - f) * e
    }
    this.doRandom = function(e, d) {
        return Math.round(b(e - 0.5, d + 0.5))
    };
    this.headsTails = function(d, e) {
        return !c.doRandom(0, 1) ? d : e
    };
    this.toDegrees = function(d) {
        return d * (180 / Math.PI)
    };
    this.toRadians = function(d) {
        return d * (Math.PI / 180)
    };
    this.findDistance = function(g, f) {
        var e = f.x - g.x;
        var d = f.y - g.y;
        return Math.sqrt(e * e + d * d)
    };
    this.timestamp = function() {
        var d = Date.now() + c.doRandom(0, 99999);
        return d.toString()
    };
    this.hitTestObject = function(k, j) {
        var e = k.x,
            o = k.y,
            p = k.width,
            l = k.height;
        var s = j.x,
            g = j.y,
            n = j.width,
            r = j.height;
        var d = e + p,
            m = o + l,
            q = s + n,
            f = g + r;
        if (s >= e && s <= d) {
            if (g >= o && g <= m) {
                return true
            } else {
                if (o >= g && o <= f) {
                    return true
                }
            }
        } else {
            if (e >= s && e <= q) {
                if (g >= o && g <= m) {
                    return true
                } else {
                    if (o >= g && o <= f) {
                        return true
                    }
                }
            }
        }
        return false
    };
    this.randomColor = function() {
        var d = "#" + Math.floor(Math.random() * 16777215).toString(16);
        if (d.length < 7) {
            d = this.randomColor()
        }
        return d
    };
    this.touchEvent = function(f) {
        var d = {};
        d.x = 0;
        d.y = 0;
        if (f.windowsPointer) {
            return f
        }
        if (!f) {
            return d
        }
        if (Device.mobile && (f.touches || f.changedTouches)) {
            if (f.changedTouches.length) {
                d.x = f.changedTouches[0].pageX;
                d.y = f.changedTouches[0].pageY - Mobile.scrollTop
            } else {
                d.x = f.touches[0].pageX;
                d.y = f.touches[0].pageY - Mobile.scrollTop
            }
        } else {
            d.x = f.pageX;
            d.y = f.pageY
        }
        return d
    };
    this.clamp = function(e, f, d) {
        return Math.min(Math.max(e, f), d)
    };
    this.constrain = function(e, f, d) {
        return Math.min(Math.max(e, Math.min(f, d)), Math.max(f, d))
    };
    this.nullObject = function(d) {
        if (d.destroy || d.div) {
            for (var e in d) {
                if (typeof d[e] !== "undefined") {
                    d[e] = null
                }
            }
        }
        return null
    };
    this.convertRange = this.range = function(d, m, g, f, j, l) {
        var h = (g - m);
        var k = (j - f);
        var e = (((d - m) * k) / h) + f;
        if (l) {
            return c.clamp(e, Math.min(f, j), Math.max(f, j))
        }
        return e
    };
    String.prototype.strpos = function(e) {
        if (Array.isArray(e)) {
            for (var d = 0; d < e.length; d++) {
                if (this.indexOf(e[d]) > -1) {
                    return true
                }
            }
            return false
        } else {
            return this.indexOf(e) != -1
        }
    };
    String.prototype.clip = function(e, d) {
        return this.length > e ? this.slice(0, e) + d : this
    };
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1)
    };
    Array.prototype.findAndRemove = function(d) {
        var e = this.indexOf(d);
        if (e > -1) {
            return this.splice(e, 1)
        }
    }
}, "Static");
Class(function CSS() {
    var g = this;
    var f, b, a;
    Hydra.ready(function() {
        b = "";
        f = document.createElement("style");
        f.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(f)
    });

    function d(k) {
        var j = k.match(/[A-Z]/);
        var l = j ? j.index : null;
        if (l) {
            var m = k.slice(0, l);
            var h = k.slice(l);
            k = m + "-" + h.toLowerCase()
        }
        return k
    }

    function e(k) {
        var j = k.match(/\-/);
        var m = j ? j.index : null;
        if (m) {
            var n = k.slice(0, m);
            var h = k.slice(m).slice(1);
            var l = h.charAt(0);
            h = h.slice(1);
            h = l.toUpperCase() + h;
            k = n + h
        }
        return k
    }

    function c() {
        f.innerHTML = b;
        a = false
    }
    this._read = function() {
        return b
    };
    this._write = function(h) {
        b = h;
        if (!a) {
            a = true;
            Render.nextFrame(c)
        }
    };
    this._toCSS = d;
    this.style = function(h, l) {
        var k = h + " {";
        for (var j in l) {
            var n = d(j);
            var m = l[j];
            if (typeof m !== "string" && j != "opacity") {
                m += "px"
            }
            k += n + ":" + m + "!important;"
        }
        k += "}";
        f.innerHTML += k
    };
    this.get = function(k, h) {
        var q = new Object();
        var n = f.innerHTML.split(k + " {");
        for (var m = 0; m < n.length; m++) {
            var o = n[m];
            if (!o.length) {
                continue
            }
            var p = o.split("!important;");
            for (var l in p) {
                if (p[l].strpos(":")) {
                    var r = p[l].split(":");
                    if (r[1].slice(-2) == "px") {
                        r[1] = Number(r[1].slice(0, -2))
                    }
                    q[e(r[0])] = r[1]
                }
            }
        }
        if (!h) {
            return q
        } else {
            return q[h]
        }
    };
    this.textSize = function(l) {
        var k = l.clone();
        k.css({
            position: "relative",
            cssFloat: "left",
            styleFloat: "left",
            marginTop: -99999,
            width: "",
            height: ""
        });
        __body.addChild(k);
        var j = k.div.offsetWidth;
        var h = k.div.offsetHeight;
        k.remove();
        return {
            width: j,
            height: h
        }
    };
    this.prefix = function(h) {
        return Device.styles.vendor == "" ? h.charAt(0).toLowerCase() + h.slice(1) : Device.styles.vendor + h
    }
}, "Static");
Class(function Device() {
    var g = this;
    var b;
    this.agent = navigator.userAgent.toLowerCase();
    this.detect = function(h) {
        if (typeof h === "string") {
            h = [h]
        }
        for (var e = 0; e < h.length; e++) {
            if (this.agent.strpos(h[e])) {
                return true
            }
        }
        return false
    };
    var d = (function() {
        var h = "";
        if (!window._NODE_) {
            var e = window.getComputedStyle(document.documentElement, "");
            h = (Array.prototype.slice.call(e).join("").match(/-(moz|webkit|ms)-/) || (e.OLink === "" && ["", "o"]))[1];
            var j = ("WebKit|Moz|MS|O").match(new RegExp("(" + h + ")", "i"))[1]
        } else {
            h = "webkit"
        }
        var k = g.detect("trident");
        return {
            unprefixed: k && !g.detect("msie 9"),
            dom: j,
            lowercase: h,
            css: "-" + h + "-",
            js: (k ? h[0] : h[0].toUpperCase()) + h.substr(1)
        }
    })();

    function a(k) {
        var j = b || document.createElement("div"),
            h = "Khtml ms O Moz Webkit".split(" "),
            e = h.length;
        b = j;
        if (k in j.style) {
            return true
        }
        k = k.replace(/^[a-z]/, function(l) {
            return l.toUpperCase()
        });
        while (e--) {
            if (h[e] + k in j.style) {
                return true
            }
        }
        return false
    }
    this.mobile = !window._NODE_ && (!!(("ontouchstart" in window) || ("onpointerdown" in window)) && this.detect(["ios", "iphone", "ipad", "windows", "android", "blackberry"])) ? {} : false;
    if (this.mobile && this.detect("windows") && !this.detect("touch")) {
        this.mobile = false
    }
    if (this.mobile) {
        this.mobile.tablet = Math.max(screen.width, screen.height) > 800;
        this.mobile.phone = !this.mobile.tablet
    }
    this.browser = {};
    this.browser.ie = (function() {
        if (g.detect("msie")) {
            return true
        }
        if (g.detect("trident") && g.detect("rv:")) {
            return true
        }
        if (g.detect("windows") && g.detect("edge")) {
            return true
        }
    })();
    this.browser.chrome = !this.browser.ie && this.detect("chrome");
    this.browser.safari = !this.browser.chrome && !this.browser.ie && this.detect("safari");
    this.browser.firefox = this.detect("firefox");
    this.browser.version = (function() {
        try {
            if (g.browser.chrome) {
                return Number(g.agent.split("chrome/")[1].split(".")[0])
            }
            if (g.browser.firefox) {
                return Number(g.agent.split("firefox/")[1].split(".")[0])
            }
            if (g.browser.safari) {
                return Number(g.agent.split("version/")[1].split(".")[0].charAt(0))
            }
            if (g.browser.ie) {
                if (g.detect("msie")) {
                    return Number(g.agent.split("msie ")[1].split(".")[0])
                }
                if (g.detect("rv:")) {
                    return Number(g.agent.split("rv:")[1].split(".")[0])
                }
                return Number(g.agent.split("edge/")[1].split(".")[0])
            }
        } catch (h) {
            return -1
        }
    })();
    this.vendor = d.css;
    this.transformProperty = (function() {
        switch (d.lowercase) {
            case "moz":
                return "-moz-transform";
                break;
            case "webkit":
                return "-webkit-transform";
                break;
            case "o":
                return "-o-transform";
                break;
            case "ms":
                return "-ms-transform";
                break;
            default:
                return "transform";
                break
        }
    })();
    this.system = {};
    this.system.retina = window.devicePixelRatio > 1;
    this.system.webworker = typeof window.Worker !== "undefined";
    this.system.offline = typeof window.applicationCache !== "undefined";
    if (!window._NODE_) {
        this.system.geolocation = typeof navigator.geolocation !== "undefined";
        this.system.pushstate = typeof window.history.pushState !== "undefined"
    }
    this.system.webcam = !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    this.system.language = window.navigator.userLanguage || window.navigator.language;
    this.system.webaudio = typeof window.AudioContext !== "undefined";
    try {
        this.system.localStorage = typeof window.localStorage !== "undefined"
    } catch (f) {
        this.system.localStorage = false
    }
    this.system.fullscreen = typeof document[d.lowercase + "CancelFullScreen"] !== "undefined";
    this.system.os = (function() {
        if (g.detect("mac os")) {
            return "mac"
        } else {
            if (g.detect("windows nt 6.3")) {
                return "windows8.1"
            } else {
                if (g.detect("windows nt 6.2")) {
                    return "windows8"
                } else {
                    if (g.detect("windows nt 6.1")) {
                        return "windows7"
                    } else {
                        if (g.detect("windows nt 6.0")) {
                            return "windowsvista"
                        } else {
                            if (g.detect("windows nt 5.1")) {
                                return "windowsxp"
                            } else {
                                if (g.detect("windows")) {
                                    return "windows"
                                } else {
                                    if (g.detect("linux")) {
                                        return "linux"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return "undetected"
    })();
    this.pixelRatio = window.devicePixelRatio;
    this.media = {};
    this.media.audio = (function() {
        if (!!document.createElement("audio").canPlayType) {
            return g.detect(["firefox", "opera"]) ? "ogg" : "mp3"
        } else {
            return false
        }
    })();
    this.media.video = (function() {
        var e = document.createElement("video");
        if (!!e.canPlayType) {
            if (Device.mobile) {
                return "mp4"
            }
            if (g.browser.chrome) {
                return "webm"
            }
            if (g.browser.firefox || g.browser.opera) {
                if (e.canPlayType('video/webm; codecs="vorbis,vp8"')) {
                    return "webm"
                }
                return "ogv"
            }
            return "mp4"
        } else {
            return false
        }
    })();
    this.graphics = {};
    this.graphics.webgl = (function() {
        try {
            var p;
            var o = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
            var k = document.createElement("canvas");
            for (var l = 0; l < o.length; l++) {
                p = k.getContext(o[l]);
                if (p) {
                    break
                }
            }
            var n = p.getExtension("WEBGL_debug_renderer_info");
            var j = {};
            if (n) {
                var h = n.UNMASKED_RENDERER_WEBGL;
                j.gpu = p.getParameter(h).toLowerCase()
            }
            j.renderer = p.getParameter(p.RENDERER).toLowerCase();
            j.version = p.getParameter(p.VERSION).toLowerCase();
            j.glsl = p.getParameter(p.SHADING_LANGUAGE_VERSION).toLowerCase();
            j.extensions = p.getSupportedExtensions();
            j.detect = function(q) {
                if (j.gpu && j.gpu.toLowerCase().strpos(q)) {
                    return true
                }
                if (j.version && j.version.toLowerCase().strpos(q)) {
                    return true
                }
                for (var e = 0; e < j.extensions.length; e++) {
                    if (j.extensions[e].toLowerCase().strpos(q)) {
                        return true
                    }
                }
                return false
            };
            return j
        } catch (m) {
            return false
        }
    })();
    this.graphics.canvas = (function() {
        var e = document.createElement("canvas");
        return e.getContext ? true : false
    })();
    this.styles = {};
    this.styles.filter = a("filter");
    this.styles.blendMode = a("mix-blend-mode");
    this.styles.vendor = d.unprefixed ? "" : d.js;
    this.styles.vendorTransition = this.styles.vendor.length ? this.styles.vendor + "Transition" : "transition";
    this.styles.vendorTransform = this.styles.vendor.length ? this.styles.vendor + "Transform" : "transform";
    this.tween = {};
    this.tween.transition = a("transition");
    this.tween.css2d = a("transform");
    this.tween.css3d = a("perspective");
    this.tween.complete = (function() {
        if (d.unprefixed) {
            return "transitionend"
        }
        return d.lowercase + "TransitionEnd"
    })();
    this.test = function(e, h) {
        this[e] = h()
    };
    this.detectGPU = function(h) {
        var e = g.graphics.webgl;
        if (e.gpu && e.gpu.strpos(h)) {
            return true
        }
        if (e.version && e.version.strpos(h)) {
            return true
        }
        return false
    };

    function c() {
        if (!g.getFullscreen()) {
            HydraEvents._fireEvent(HydraEvents.FULLSCREEN, {
                fullscreen: false
            });
            Render.stop(c)
        }
    }
    this.openFullscreen = function(e) {
        e = e || __body;
        if (e && g.system.fullscreen) {
            if (e == __body) {
                e.css({
                    top: 0
                })
            }
            e.div[d.lowercase + "RequestFullScreen"]();
            HydraEvents._fireEvent(HydraEvents.FULLSCREEN, {
                fullscreen: true
            });
            Render.start(c, 10)
        }
    };
    this.closeFullscreen = function() {
        if (g.system.fullscreen) {
            document[d.lowercase + "CancelFullScreen"]()
        }
        Render.stop(c)
    };
    this.getFullscreen = function() {
        if (g.browser.firefox) {
            return document.mozFullScreen
        }
        return document[d.lowercase + "IsFullScreen"]
    }
}, "Static");
Class(function DynamicObject(a) {
    var b = DynamicObject.prototype;
    if (a) {
        for (var c in a) {
            this[c] = a[c]
        }
    }
    this._tweens = {};
    if (typeof b.tween !== "undefined") {
        return
    }
    b.tween = function(f, g, h, e, j, d) {
        if (typeof e !== "number") {
            d = j;
            j = e;
            e = 0
        }
        if (!this.multiTween) {
            this.stopTween()
        }
        if (typeof d !== "function") {
            d = null
        }
        if (typeof j !== "function") {
            j = null
        }
        this._tween = TweenManager.tween(this, f, g, h, e, d, j);
        return this._tween
    };
    b.stopTween = function(d) {
        var e = d || this._tween;
        if (e && e.stop) {
            e.stop()
        }
    };
    b.pause = function() {
        var d = this._tween;
        if (d && d.pause) {
            d.pause()
        }
    };
    b.resume = function() {
        var d = this._tween;
        if (d && d.resume) {
            d.resume()
        }
    };
    b.copy = function(e) {
        var f = e && e.get ? e.get() : new DynamicObject();
        for (var d in this) {
            if (typeof this[d] === "number") {
                f[d] = this[d]
            }
        }
        return f
    };
    b.copyFrom = function(e) {
        for (var d in e) {
            if (typeof e[d] == "number") {
                this[d] = e[d]
            }
        }
    };
    b.copyTo = function(e) {
        for (var d in e) {
            if (typeof this[d] == "number") {
                e[d] = this[d]
            }
        }
    };
    b.clear = function() {
        for (var d in this) {
            if (typeof this[d] !== "function") {
                delete this[d]
            }
        }
        return this
    }
});
Class(function ObjectPool(b, d) {
    Inherit(this, Component);
    var c = this;
    var a = [];
    (function() {
        if (b) {
            d = d || 10;
            b = b || Object;
            for (var e = 0; e < d; e++) {
                a.push(new b())
            }
        }
    })();
    this.get = function() {
        return a.shift()
    };
    this.empty = function() {
        a.length = 0
    };
    this.put = function(e) {
        if (e) {
            a.push(e)
        }
    };
    this.insert = function(f) {
        if (typeof f.push === "undefined") {
            f = [f]
        }
        for (var e = 0; e < f.length; e++) {
            a.push(f[e])
        }
    };
    this.onDestroy = function() {
        for (var e = 0; e < a.length; e++) {
            if (a[e].destroy) {
                a[e].destroy()
            }
        }
        a = null
    }
});
Class(function LinkedList() {
    var a = LinkedList.prototype;
    this.length = 0;
    this.first = null;
    this.last = null;
    this.current = null;
    this.prev = null;
    if (typeof a.push !== "undefined") {
        return
    }
    a.push = function(b) {
        if (!this.first) {
            this.first = b;
            this.last = b;
            b.__prev = b;
            b.__next = b
        } else {
            b.__next = this.first;
            b.__prev = this.last;
            this.last.__next = b;
            this.last = b
        }
        this.length++
    };
    a.remove = function(b) {
        if (!b || !b.__next) {
            return
        }
        if (this.length <= 1) {
            this.empty()
        } else {
            if (b == this.first) {
                this.first = b.__next;
                this.last.__next = this.first;
                this.first.__prev = this.last
            } else {
                if (b == this.last) {
                    this.last = b.__prev;
                    this.last.__next = this.first;
                    this.first.__prev = this.last
                } else {
                    b.__prev.__next = b.__next;
                    b.__next.__prev = b.__prev
                }
            }
            this.length--
        }
        b.__prev = null;
        b.__next = null
    };
    a.empty = function() {
        this.first = null;
        this.last = null;
        this.current = null;
        this.prev = null;
        this.length = 0
    };
    a.start = function() {
        this.current = this.first;
        this.prev = this.current;
        return this.current
    };
    a.next = function() {
        if (!this.current) {
            return
        }
        this.current = this.current.__next;
        if (this.length == 1 || this.prev.__next == this.first) {
            return
        }
        this.prev = this.current;
        return this.current
    };
    a.destroy = function() {
        Utils.nullObject(this);
        return null
    }
});
Class(function Pact() {
    var a = this;
    Namespace(this);
    (function() {})();
    this.create = function() {
        return new a.Broadcaster(arguments)
    };
    this.batch = function() {
        return new a.Batch()
    }
}, "Static");
Pact.Class(function Broadcaster(e) {
    var g = this;
    var d, f;
    var b;
    var c = [];
    this._fire = this.fire = function() {
        if (b) {
            return
        }
        b = true;
        var h = arguments;
        var j = false;
        Render.nextFrame(function() {
            if (f || d) {
                var l = h[0];
                var k = h[1];
                if (l instanceof Error) {
                    if (f) {
                        f.apply(g, [l])
                    }
                    j = true
                } else {
                    if (k instanceof Error) {
                        if (f) {
                            f.apply(g, [k])
                        }
                        j = true
                    } else {
                        if (!l && k && d) {
                            d.apply(g, [k]);
                            j = true
                        }
                        if (!k && l && d) {
                            d.apply(g, [l]);
                            j = true
                        }
                    }
                }
            }
            if (!j && c.length) {
                var m = c.shift();
                m.apply(g, h);
                if (c.length) {
                    b = false
                }
            }
        })
    };
    this.exec = function() {
        a(arguments);
        return this
    };
    this.then = function(h) {
        c.push(h);
        return this
    };
    this.error = function(h) {
        f = h;
        return this
    };
    this.success = function(h) {
        d = h;
        return this
    };

    function a(l) {
        var h = [];
        var k = l[0];
        for (var j = 1; j < l.length; j++) {
            h.push(l[j])
        }
        h.push(g._fire);
        k.apply(k, h)
    }
    if (e.length) {
        a(e)
    }
});
Pact.Class(function Batch() {
    Inherit(this, Events);
    var e = this;
    var g = 0;
    var a = [];
    var j = [];
    var k = [];
    var c = [];
    this.push = function(l) {
        l.then(h).error(d).success(f);
        c.push(l)
    };
    this.timeout = function() {
        e.events.fire(HydraEvents.COMPLETE, {
            complete: a,
            success: j,
            error: k
        })
    };

    function f() {
        this.data = arguments;
        j.push(this);
        b();
        e.events.fire(HydraEvents.UPDATE)
    }

    function d() {
        this.data = arguments;
        k.push(this);
        b();
        e.events.fire(HydraEvents.UPDATE)
    }

    function h() {
        this.data = arguments;
        a.push(this);
        b();
        e.events.fire(HydraEvents.UPDATE)
    }

    function b() {
        g++;
        if (g == c.length) {
            e.events.fire(HydraEvents.COMPLETE, {
                complete: a,
                success: j,
                error: k
            })
        }
    }
});
Class(function Mouse() {
    var d = this;
    var b;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.autoPreventClicks = false;

    function c(g) {
        d.lastX = d.x;
        d.lastY = d.y;
        d.ready = true;
        if (g.windowsPointer) {
            d.x = g.x;
            d.y = g.y
        } else {
            var f = Utils.touchEvent(g);
            d.x = f.x;
            d.y = f.y
        }
        d.moveX = d.x - d.lastX;
        d.moveY = d.y - d.lastY;
        defer(a)
    }
    this.capture = function(e, f) {
        if (b) {
            return false
        }
        b = true;
        d.x = e || 0;
        d.y = f || 0;
        if (!Device.mobile) {
            __window.bind("mousemove", c)
        } else {
            __window.bind("touchmove", c);
            __window.bind("touchstart", c)
        }
    };
    this.stop = function() {
        if (!b) {
            return false
        }
        b = false;
        d.x = 0;
        d.y = 0;
        if (!Device.mobile) {
            __window.unbind("mousemove", c)
        } else {
            __window.unbind("touchmove", c);
            __window.unbind("touchstart", c)
        }
    };
    this.preventClicks = function() {
        d._preventClicks = true;
        Timer.create(function() {
            d._preventClicks = false
        }, 300)
    };
    this.preventFireAfterClick = function() {
        d._preventFire = true
    };

    function a() {
        d.moveX = 0;
        d.moveY = 0
    }
}, "Static");
Class(function Render() {
    var f = this;
    var c, j, a;
    var h = [];
    var o = Date.now();
    var m = new LinkedList();
    var l = new LinkedList();
    var d = m;
    var e = 0;
    this.TIME = Date.now();
    this.TARGET_FPS = 60;
    (function() {
        if (!THREAD) {
            requestAnimationFrame(b);
            Hydra.ready(k)
        }
    })();

    function b() {
        var q = Date.now();
        var v = q - o;
        var s = 0;
        var r = 60;
        if (j) {
            s = q - j;
            r = 1000 / s
        }
        j = q;
        f.FPS = r;
        f.TIME = q;
        f.DELTA = s;
        f.TSL = v;
        for (var p = h.length - 1; p > -1; p--) {
            var u = h[p];
            if (!u) {
                continue
            }
            if (u.fps) {
                e += s > 200 ? 0 : s;
                if (e < (1000 / u.fps)) {
                    continue
                }
                e -= (1000 / u.fps)
            }
            u(q, v, s, r, u.frameCount++)
        }
        if (d.length) {
            g()
        }
        if (!THREAD) {
            requestAnimationFrame(b)
        }
    }

    function g() {
        var q = d;
        d = d == m ? l : m;
        var r = q.start();
        while (r) {
            var p = r;
            r();
            r = q.next();
            p.__prev = p.__next = p = null
        }
        q.empty()
    }

    function k() {
        HydraEvents._addEvent(HydraEvents.BROWSER_FOCUS, n, f)
    }

    function n(p) {
        if (p.type == "focus") {
            j = Date.now()
        }
    }
    this.startRender = this.start = function(s, q) {
        var r = true;
        var p = h.length - 1;
        if (this.TARGET_FPS < 60) {
            q = this.TARGET_FPS
        }
        if (typeof q == "number") {
            s.fps = q
        }
        s.frameCount = 0;
        if (h.indexOf(s) == -1) {
            h.push(s)
        }
    };
    this.stopRender = this.stop = function(q) {
        var p = h.indexOf(q);
        if (p > -1) {
            h.splice(p, 1)
        }
    };
    this.startTimer = function(p) {
        a = p || "Timer";
        if (console.time && !window._NODE_) {
            console.time(a)
        } else {
            c = Date.now()
        }
    };
    this.stopTimer = function() {
        if (console.time && !window._NODE_) {
            console.timeEnd(a)
        } else {
            console.log("Render " + a + ": " + (Date.now() - c))
        }
    };
    this.nextFrame = function(p) {
        d.push(p)
    };
    this.setupTween = function(p) {
        f.nextFrame(function() {
            f.nextFrame(p)
        })
    };
    this.tick = function() {
        b()
    };
    window.defer = this.nextFrame;
    window.nextFrame = this.setupTween
}, "Static");
Class(function HydraEvents() {
    var b = [];
    var a = {};
    this.BROWSER_FOCUS = "hydra_focus";
    this.HASH_UPDATE = "hydra_hash_update";
    this.COMPLETE = "hydra_complete";
    this.PROGRESS = "hydra_progress";
    this.UPDATE = "hydra_update";
    this.LOADED = "hydra_loaded";
    this.END = "hydra_end";
    this.FAIL = "hydra_fail";
    this.SELECT = "hydra_select";
    this.ERROR = "hydra_error";
    this.READY = "hydra_ready";
    this.RESIZE = "hydra_resize";
    this.CLICK = "hydra_click";
    this.HOVER = "hydra_hover";
    this.MESSAGE = "hydra_message";
    this.ORIENTATION = "orientation";
    this.BACKGROUND = "background";
    this.BACK = "hydra_back";
    this.PREVIOUS = "hydra_previous";
    this.NEXT = "hydra_next";
    this.RELOAD = "hydra_reload";
    this.FULLSCREEN = "hydra_fullscreen";
    this._checkDefinition = function(c) {
        if (typeof c == "undefined") {
            throw "Undefined event"
        }
    };
    this._addEvent = function(f, g, c) {
        if (this._checkDefinition) {
            this._checkDefinition(f)
        }
        var d = new Object();
        d.evt = f;
        d.object = c;
        d.callback = g;
        b.push(d)
    };
    this._removeEvent = function(c, d) {
        if (this._checkDefinition) {
            this._checkDefinition(c)
        }
        defer(function() {
            for (var e = b.length - 1; e > -1; e--) {
                if (b[e].evt == c && b[e].callback == d) {
                    b[e] = null;
                    b.splice(e, 1)
                }
            }
        })
    };
    this._destroyEvents = function(c) {
        for (var d = b.length - 1; d > -1; d--) {
            if (b[d].object == c) {
                b[d] = null;
                b.splice(d, 1)
            }
        }
    };
    this._fireEvent = function(c, f) {
        if (this._checkDefinition) {
            this._checkDefinition(c)
        }
        var e = true;
        f = f || a;
        f.cancel = function() {
            e = false
        };
        for (var d = 0; d < b.length; d++) {
            if (b[d].evt == c) {
                if (e) {
                    b[d].callback(f)
                } else {
                    return false
                }
            }
        }
    };
    this._consoleEvents = function() {
        console.log(b)
    };
    this.createLocalEmitter = function(d) {
        var c = new HydraEvents();
        d.on = c._addEvent;
        d.off = c._removeEvent;
        d.fire = c._fireEvent
    }
}, "Static");
Class(function Events(c) {
    this.events = {};
    var b = {};
    var a = {};
    this.events.subscribe = function(d, e) {
        HydraEvents._addEvent(d, !!e._fire ? e._fire : e, c);
        return e
    };
    this.events.unsubscribe = function(d, e) {
        HydraEvents._removeEvent(d, !!e._fire ? e._fire : e)
    };
    this.events.fire = function(d, f, e) {
        f = f || a;
        HydraEvents._checkDefinition(d);
        if (b[d]) {
            f.target = f.target || c;
            b[d](f);
            f.target = null
        } else {
            if (!e) {
                HydraEvents._fireEvent(d, f)
            }
        }
    };
    this.events.add = function(d, e) {
        HydraEvents._checkDefinition(d);
        b[d] = !!e._fire ? e._fire : e;
        return e
    };
    this.events.remove = function(d) {
        HydraEvents._checkDefinition(d);
        if (b[d]) {
            delete b[d]
        }
    };
    this.events.bubble = function(e, d) {
        HydraEvents._checkDefinition(d);
        var f = this;
        e.events.add(d, function(g) {
            f.fire(d, g)
        })
    };
    this.events.scope = function(d) {
        c = d
    };
    this.events.destroy = function() {
        HydraEvents._destroyEvents(c);
        b = null;
        c = null;
        return null
    }
});
Class(function Dispatch() {
    var c = this;
    var a = {};

    function b() {}
    this.register = function(d, e) {
        defer(function() {
            a[Hydra.getClassName(d) + "-" + e] = d[e]
        })
    };
    this.find = function(e, g, d) {
        var f = e.toString().match(/function ([^\(]+)/)[1] + "-" + g;
        if (a[f]) {
            return a[f]
        } else {
            delete a[f];
            return b
        }
    }
}, "static");
Class(function Mobile() {
    Inherit(this, Component);
    var s = this;
    var e;
    var f = true;
    var q = {};
    var n, l, w, o, c, k, t;
    this.sleepTime = 10000;
    this.scrollTop = 0;
    this.autoResizeReload = true;
    if (Device.mobile) {
        for (var v in Device.browser) {
            Device.browser[v] = false
        }
        setInterval(r, 250);
        this.phone = Device.mobile.phone;
        this.tablet = Device.mobile.tablet;
        this.orientation = Math.abs(window.orientation) == 90 ? "landscape" : "portrait";
        this.os = (function() {
            if (Device.detect("windows", "iemobile")) {
                return "Windows"
            }
            if (Device.detect(["ipad", "iphone"])) {
                return "iOS"
            }
            if (Device.detect(["android", "kindle"])) {
                return "Android"
            }
            if (Device.detect("blackberry")) {
                return "Blackberry"
            }
            return "Unknown"
        })();
        this.version = (function() {
            try {
                if (s.os == "iOS") {
                    var y = Device.agent.split("os ")[1].split("_");
                    var b = y[0];
                    var z = y[1].split(" ")[0];
                    return Number(b + "." + z)
                }
                if (s.os == "Android") {
                    var x = Device.agent.split("android ")[1].split(";")[0];
                    if (x.length > 3) {
                        x = x.slice(0, -2)
                    }
                    return Number(x)
                }
                if (s.os == "Windows") {
                    if (Device.agent.strpos("rv:11")) {
                        return 11
                    }
                    return Number(Device.agent.split("windows phone ")[1].split(";")[0])
                }
            } catch (A) {}
            return -1
        })();
        this.browser = (function() {
            if (s.os == "iOS") {
                if (Device.detect(["twitter", "fbios"])) {
                    return "Social"
                }
                if (Device.detect("crios")) {
                    return "Chrome"
                }
                if (Device.detect("safari")) {
                    return "Safari"
                }
                return "Unknown"
            }
            if (s.os == "Android") {
                if (Device.detect("chrome")) {
                    return "Chrome"
                }
                if (Device.detect("firefox")) {
                    return "Firefox"
                }
                return "Browser"
            }
            if (s.os == "Windows") {
                return "IE"
            }
            return "Unknown"
        })();
        Hydra.ready(function() {
            window.onresize = u;
            if (s.browser == "Safari" && (!s.NativeCore || !s.NativeCore.active)) {
                document.body.scrollTop = 0;
                __body.css({
                    height: "101%"
                })
            }
            j();
            s.orientation = Stage.width > Stage.height ? "landscape" : "portrait";
            if (!(s.NativeCore && s.NativeCore.active)) {
                window.addEventListener("touchstart", d)
            } else {
                Stage.css({
                    overflow: "hidden"
                })
            }
            m();
            t = s.phone ? "phone" : "tablet"
        });

        function m() {
            Device.mobile.tablet = (function() {
                if (Stage.width > Stage.height) {
                    return document.body.clientWidth > 800
                } else {
                    return document.body.clientHeight > 800
                }
            })();
            Device.mobile.phone = !Device.mobile.tablet;
            s.phone = Device.mobile.phone;
            s.tablet = Device.mobile.tablet
        }

        function j() {
            Stage.width = document.body.clientWidth;
            Stage.height = document.body.clientHeight
        }

        function u() {
            clearTimeout(s.fireResize);
            if (!s.allowScroll) {
                document.body.scrollTop = 0
            }
            s.fireResize = s.delayedCall(function() {
                j();
                m();
                var b = s.phone ? "phone" : "tablet";
                if (s.os == "iOS" && b != t && s.autoResizeReload) {
                    window.location.reload()
                }
                s.orientation = Stage.width > Stage.height ? "landscape" : "portrait";
                s.events.fire(HydraEvents.RESIZE)
            }, 32)
        }

        function a() {
            s.delayedCall(function() {
                Stage.width = document.body.clientWidth;
                Stage.height = document.body.clientHeight;
                HydraEvents._fireEvent(HydraEvents.ORIENTATION, {
                    orientation: s.orientation
                })
            }, 32);
            if (s.tablet && s.browser == "Chrome" && l) {
                l = document.body.clientHeight
            }
            if (s.phone && l) {
                l = Stage.height;
                if (s.orientation == "portrait" && s.browser == "Safari") {
                    w = false;
                    document.body.scrollTop = 0;
                    h(true);
                    k = true;
                    s.delayedCall(function() {
                        k = false
                    }, 100)
                }
            }
        }

        function d(z) {
            var A = Utils.touchEvent(z);
            var y = z.target;
            var x = y.nodeName == "INPUT" || y.nodeName == "TEXTAREA" || y.nodeName == "SELECT" || y.nodeName == "A";
            if (s.allowScroll || x) {
                return
            }
            if (l) {
                if (!w) {
                    return
                }
                if (s.browser == "Chrome" && A.y < 50) {
                    z.stopPropagation();
                    return
                }
            }
            if (f) {
                return z.preventDefault()
            }
            var b = true;
            y = z.target;
            while (y.parentNode) {
                if (y._scrollParent) {
                    b = false;
                    q.target = y;
                    q.y = A.y;
                    y.hydraObject.__preventY = A.y
                }
                y = y.parentNode
            }
            if (b) {
                z.preventDefault()
            }
        }
    }

    function r() {
        var b = Date.now();
        if (e) {
            if (b - e > s.sleepTime) {
                s.events.fire(HydraEvents.BACKGROUND)
            }
        }
        e = b
    }

    function p() {
        n = true;
        f = false;
        l = Stage.height;
        __body.css({
            height: Stage.height * 3
        });
        Stage.css({
            position: "fixed"
        });
        __window.bind("scroll", g);
        setInterval(h, 1000)
    }

    function g(b) {
        if (k) {
            return
        }
        Stage.width = document.body.clientWidth;
        Stage.height = document.body.clientHeight;
        s.scrollTop = document.body.scrollTop;
        if (Stage.height != c) {
            s.events.fire(HydraEvents.RESIZE)
        }
        c = Stage.height;
        if (s.scrollTop > 20) {
            if (!w) {
                s.events.fire(HydraEvents.FULLSCREEN, {
                    fullscreen: true
                })
            }
            w = true;
            clearTimeout(s.changeHeight);
            s.changeHeight = s.delayedCall(function() {
                l = Stage.height
            }, 100)
        }
        h()
    }

    function h(b) {
        if ((document.body.clientHeight < l && w) || b) {
            Stage.height = document.body.clientHeight;
            w = false;
            l = Stage.height;
            document.body.scrollTop = 0;
            u();
            s.events.fire(HydraEvents.FULLSCREEN, {
                fullscreen: false
            })
        }
    }
    this.Class = window.Class;
    this.fullscreen = function() {
        if (s.NativeCore && s.NativeCore.active) {
            return
        }
        if (s.os == "Android") {
            __window.bind("touchstart", function() {
                Device.openFullscreen()
            });
            return true
        } else {
            if (s.os == "iOS" && s.version >= 7) {
                if (s.browser == "Chrome" || s.browser == "Safari") {
                    p();
                    return true
                }
            }
        }
        return false
    };
    this.overflowScroll = function(A, z) {
        if (!Device.mobile) {
            return false
        }
        var b = !!z.x;
        var C = !!z.y;
        var B = {
            "-webkit-overflow-scrolling": "touch"
        };
        if ((!b && !C) || (b && C)) {
            B.overflow = "scroll"
        }
        if (!b && C) {
            B.overflowY = "scroll";
            B.overflowX = "hidden"
        }
        if (b && !C) {
            B.overflowX = "scroll";
            B.overflowY = "hidden"
        }
        A.css(B);
        A.div._scrollParent = true;
        f = false;
        A.div._preventEvent = function(x) {
            if (A.maxScroll) {
                var D = Utils.touchEvent(x);
                var y = D.y - A.__preventY < 0 ? 1 : -1;
                if (A.div.scrollTop < 2) {
                    if (y == -1) {
                        x.preventDefault()
                    } else {
                        x.stopPropagation()
                    }
                } else {
                    if (A.div.scrollTop > A.maxScroll - 2) {
                        if (y == 1) {
                            x.preventDefault()
                        } else {
                            x.stopPropagation()
                        }
                    }
                }
            } else {
                x.stopPropagation()
            }
        };
        A.div.addEventListener("touchmove", A.div._preventEvent)
    };
    this.removeOverflowScroll = function(b) {
        b.css({
            overflow: "hidden",
            overflowX: "",
            overflowY: "",
            "-webkit-overflow-scrolling": ""
        });
        b.div.removeEventListener("touchmove", b.div._preventEvent)
    };
    this.setOrientation = function(b) {
        if (s.System && s.NativeCore.active) {
            s.System.orientation = s.System[b.toUpperCase()];
            return
        }
        if (window.screen) {
            if (window.screen.lockOrientation) {
                if (b == "landscape") {
                    window.screen.lockOrientation("landscape-primary", "landscape-secondary")
                } else {
                    window.screen.lockOrientation("portrait-primary", "portrait-secondary")
                }
            }
            if (window.screen.orientation) {
                if (b == "landscape") {
                    window.screen.orientation.lock("landscape-primary", "landscape-secondary")
                } else {
                    window.screen.orientation.lock("portrait-primary", "portrait-secondary")
                }
            }
        }
    };
    this.isNative = function() {
        return s.NativeCore && s.NativeCore.active
    }
}, "Static");
Class(function Modules() {
    var d = this;
    var a = {};
    (function() {
        defer(b)
    })();

    function b() {
        for (var e in a) {
            for (var g in a[e]) {
                var f = a[e][g];
                if (f._ready) {
                    continue
                }
                f._ready = true;
                if (f.exec) {
                    f.exec()
                }
            }
        }
    }

    function c(e, g) {
        var f = a[e][g];
        if (!f._ready) {
            f._ready = true;
            if (f.exec) {
                f.exec()
            }
        }
        return f
    }
    this.push = function(e) {};
    this.Module = function(g) {
        var e = new g();
        var f = g.toString().slice(0, 100).match(/function ([^\(]+)/);
        if (f) {
            e._ready = true;
            f = f[1];
            a[f] = {
                index: e
            }
        } else {
            if (!a[e.module]) {
                a[e.module] = {}
            }
            a[e.module][e.path] = e
        }
    };
    this.require = function(f) {
        var e;
        if (!f.strpos("/")) {
            e = f;
            f = "index"
        } else {
            e = f.split("/")[0];
            f = f.replace(e + "/", "")
        }
        return c(e, f).exports
    };
    window.Module = this.Module;
    if (!window._NODE_) {
        window.requireNative = window.require;
        window.require = this.require
    }
}, "Static");
Class(function Timer() {
    var e = this;
    var d;
    var b = [];
    (function() {
        Render.start(a)
    })();

    function a(g, h, k) {
        for (var f = 0; f < b.length; f++) {
            var j = b[f];
            j.current += k;
            if (j.current >= j.time) {
                j();
                b.findAndRemove(j)
            }
        }
    }

    function c(g) {
        for (var f = b.length - 1; f > -1; f--) {
            var h = b[f];
            if (h.ref == g) {
                return h
            }
        }
    }
    d = window.clearTimeout;
    window.clearTimeout = function(f) {
        var g = c(f);
        if (g) {
            b.findAndRemove(g)
        } else {
            d(f)
        }
    };
    this.create = function(g, f) {
        g.time = f;
        g.current = 0;
        g.ref = Utils.timestamp();
        b.push(g);
        return g.ref
    }
}, "static");
Class(function Color(j) {
    Inherit(this, Component);
    var f = this;
    var b, g;
    this.r = 1;
    this.g = 1;
    this.b = 1;
    (function() {
        h(j)
    })();

    function h(k) {
        if (k instanceof Color) {
            a(k)
        } else {
            if (typeof k === "number") {
                e(k)
            } else {
                if (Array.isArray(k)) {
                    d(k)
                } else {
                    e(Number("0x" + k.slice(1)))
                }
            }
        }
    }

    function a(k) {
        f.r = k.r;
        f.g = k.g;
        f.b = k.b
    }

    function e(k) {
        k = Math.floor(k);
        f.r = (k >> 16 & 255) / 255;
        f.g = (k >> 8 & 255) / 255;
        f.b = (k & 255) / 255
    }

    function d(k) {
        f.r = k[0];
        f.g = k[1];
        f.b = k[2]
    }

    function c(m, l, k) {
        if (k < 0) {
            k += 1
        }
        if (k > 1) {
            k -= 1
        }
        if (k < 1 / 6) {
            return m + (l - m) * 6 * k
        }
        if (k < 1 / 2) {
            return l
        }
        if (k < 2 / 3) {
            return m + (l - m) * 6 * (2 / 3 - k)
        }
        return m
    }
    this.set = function(k) {
        h(k);
        return this
    };
    this.setRGB = function(m, l, k) {
        this.r = m;
        this.g = l;
        this.b = k;
        return this
    };
    this.setHSL = function(n, m, k) {
        if (m === 0) {
            this.r = this.g = this.b = k
        } else {
            var r = k <= 0.5 ? k * (1 + m) : k + m - (k * m);
            var o = (2 * k) - r;
            this.r = c(o, r, n + 1 / 3);
            this.g = c(o, r, n);
            this.b = c(o, r, n - 1 / 3)
        }
        return this
    };
    this.offsetHSL = function(o, n, k) {
        var m = this.getHSL();
        m.h += o;
        m.s += n;
        m.l += k;
        this.setHSL(m.h, m.s, m.l);
        return this
    };
    this.getStyle = function() {
        return "rgb(" + ((this.r * 255) | 0) + "," + ((this.g * 255) | 0) + "," + ((this.b * 255) | 0) + ")"
    };
    this.getHex = function() {
        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0
    };
    this.getHexString = function() {
        return "#" + ("000000" + this.getHex().toString(16)).slice(-6)
    };
    this.getHSL = function() {
        b = b || {
            h: 0,
            s: 0,
            l: 0
        };
        var u = b;
        var k = this.r,
            n = this.g,
            p = this.b;
        var q = Math.max(k, n, p);
        var l = Math.min(k, n, p);
        var o, m;
        var t = (l + q) / 2;
        if (l === q) {
            o = 0;
            m = 0
        } else {
            var s = q - l;
            m = t <= 0.5 ? s / (q + l) : s / (2 - q - l);
            switch (q) {
                case k:
                    o = (n - p) / s + (n < p ? 6 : 0);
                    break;
                case n:
                    o = (p - k) / s + 2;
                    break;
                case p:
                    o = (k - n) / s + 4;
                    break
            }
            o /= 6
        }
        u.h = o;
        u.s = m;
        u.l = t;
        return u
    };
    this.add = function(k) {
        this.r += k.r;
        this.g += k.g;
        this.b += k.b
    };
    this.mix = function(k, l) {
        this.r = this.r * (1 - l) + (k.r * l);
        this.g = this.g * (1 - l) + (k.g * l);
        this.b = this.b * (1 - l) + (k.b * l)
    };
    this.addScalar = function(k) {
        this.r += k;
        this.g += k;
        this.b += k
    };
    this.multiply = function(k) {
        this.r *= k.r;
        this.g *= k.g;
        this.b *= k.b
    };
    this.multiplyScalar = function(k) {
        this.r *= k;
        this.g *= k;
        this.b *= k
    };
    this.clone = function() {
        return new Color([this.r, this.g, this.b])
    };
    this.toArray = function() {
        if (!g) {
            g = []
        }
        g[0] = this.r;
        g[1] = this.g;
        g[2] = this.b;
        return g
    }
});
Class(function Noise() {
    var f = this;

    function e(n, p, o) {
        this.x = n;
        this.y = p;
        this.z = o
    }
    e.prototype.dot2 = function(n, o) {
        return this.x * n + this.y * o
    };
    e.prototype.dot3 = function(n, p, o) {
        return this.x * n + this.y * p + this.z * o
    };
    var k = [new e(1, 1, 0), new e(-1, 1, 0), new e(1, -1, 0), new e(-1, -1, 0), new e(1, 0, 1), new e(-1, 0, 1), new e(1, 0, -1), new e(-1, 0, -1), new e(0, 1, 1), new e(0, -1, 1), new e(0, 1, -1), new e(0, -1, -1)];
    var b = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    var j = new Array(512);
    var c = new Array(512);
    f.seed = function(n) {
        if (n > 0 && n < 1) {
            n *= 65536
        }
        n = Math.floor(n);
        if (n < 256) {
            n |= n << 8
        }
        for (var p = 0; p < 256; p++) {
            var o;
            if (p & 1) {
                o = b[p] ^ (n & 255)
            } else {
                o = b[p] ^ ((n >> 8) & 255)
            }
            j[p] = j[p + 256] = o;
            c[p] = c[p + 256] = k[o % 12]
        }
    };
    f.seed(0);
    var m = 0.5 * (Math.sqrt(3) - 1);
    var d = (3 - Math.sqrt(3)) / 6;
    var l = 1 / 3;
    var a = 1 / 6;
    f.simplex2 = function(I, r) {
        var x, v, u;
        var B = (I + r) * m;
        var H = Math.floor(I + B);
        var G = Math.floor(r + B);
        var A = (H + G) * d;
        var L = I - H + A;
        var q = r - G + A;
        var F, n;
        if (L > q) {
            F = 1;
            n = 0
        } else {
            F = 0;
            n = 1
        }
        var K = L - F + d;
        var p = q - n + d;
        var J = L - 1 + 2 * d;
        var o = q - 1 + 2 * d;
        H &= 255;
        G &= 255;
        var E = c[H + j[G]];
        var D = c[H + F + j[G + n]];
        var C = c[H + 1 + j[G + 1]];
        var z = 0.5 - L * L - q * q;
        if (z < 0) {
            x = 0
        } else {
            z *= z;
            x = z * z * E.dot2(L, q)
        }
        var y = 0.5 - K * K - p * p;
        if (y < 0) {
            v = 0
        } else {
            y *= y;
            v = y * y * D.dot2(K, p)
        }
        var w = 0.5 - J * J - o * o;
        if (w < 0) {
            u = 0
        } else {
            w *= w;
            u = w * w * C.dot2(J, o)
        }
        return 70 * (x + v + u)
    };
    f.simplex3 = function(P, E, A) {
        var H, G, F, D;
        var S = (P + E + A) * l;
        var W = Math.floor(P + S);
        var U = Math.floor(E + S);
        var T = Math.floor(A + S);
        var R = (W + U + T) * a;
        var z = P - W + R;
        var n = E - U + R;
        var Q = A - T + R;
        var p, X, C;
        var o, V, B;
        if (z >= n) {
            if (n >= Q) {
                p = 1;
                X = 0;
                C = 0;
                o = 1;
                V = 1;
                B = 0
            } else {
                if (z >= Q) {
                    p = 1;
                    X = 0;
                    C = 0;
                    o = 1;
                    V = 0;
                    B = 1
                } else {
                    p = 0;
                    X = 0;
                    C = 1;
                    o = 1;
                    V = 0;
                    B = 1
                }
            }
        } else {
            if (n < Q) {
                p = 0;
                X = 0;
                C = 1;
                o = 0;
                V = 1;
                B = 1
            } else {
                if (z < Q) {
                    p = 0;
                    X = 1;
                    C = 0;
                    o = 0;
                    V = 1;
                    B = 1
                } else {
                    p = 0;
                    X = 1;
                    C = 0;
                    o = 1;
                    V = 1;
                    B = 0
                }
            }
        }
        var y = z - p + a;
        var aa = n - X + a;
        var O = Q - C + a;
        var x = z - o + 2 * a;
        var Z = n - V + 2 * a;
        var N = Q - B + 2 * a;
        var v = z - 1 + 3 * a;
        var Y = n - 1 + 3 * a;
        var M = Q - 1 + 3 * a;
        W &= 255;
        U &= 255;
        T &= 255;
        var w = c[W + j[U + j[T]]];
        var u = c[W + p + j[U + X + j[T + C]]];
        var r = c[W + o + j[U + V + j[T + B]]];
        var q = c[W + 1 + j[U + 1 + j[T + 1]]];
        var L = 0.6 - z * z - n * n - Q * Q;
        if (L < 0) {
            H = 0
        } else {
            L *= L;
            H = L * L * w.dot3(z, n, Q)
        }
        var K = 0.6 - y * y - aa * aa - O * O;
        if (K < 0) {
            G = 0
        } else {
            K *= K;
            G = K * K * u.dot3(y, aa, O)
        }
        var J = 0.6 - x * x - Z * Z - N * N;
        if (J < 0) {
            F = 0
        } else {
            J *= J;
            F = J * J * r.dot3(x, Z, N)
        }
        var I = 0.6 - v * v - Y * Y - M * M;
        if (I < 0) {
            D = 0
        } else {
            I *= I;
            D = I * I * q.dot3(v, Y, M)
        }
        return 32 * (H + G + F + D)
    };

    function h(n) {
        return n * n * n * (n * (n * 6 - 15) + 10)
    }

    function g(o, n, p) {
        return (1 - p) * o + p * n
    }
    f.perlin = function(n) {
        return f.perlin2(n, 0)
    };
    f.perlin2 = function(v, r) {
        var q = Math.floor(v),
            o = Math.floor(r);
        v = v - q;
        r = r - o;
        q = q & 255;
        o = o & 255;
        var p = c[q + j[o]].dot2(v, r);
        var n = c[q + j[o + 1]].dot2(v, r - 1);
        var t = c[q + 1 + j[o]].dot2(v - 1, r);
        var s = c[q + 1 + j[o + 1]].dot2(v - 1, r - 1);
        var w = h(v);
        return g(g(p, t, w), g(n, s, w), h(r))
    };
    f.perlin3 = function(D, B, A) {
        var r = Math.floor(D),
            p = Math.floor(B),
            n = Math.floor(A);
        D = D - r;
        B = B - p;
        A = A - n;
        r = r & 255;
        p = p & 255;
        n = n & 255;
        var J = c[r + j[p + j[n]]].dot3(D, B, A);
        var I = c[r + j[p + j[n + 1]]].dot3(D, B, A - 1);
        var t = c[r + j[p + 1 + j[n]]].dot3(D, B - 1, A);
        var s = c[r + j[p + 1 + j[n + 1]]].dot3(D, B - 1, A - 1);
        var q = c[r + 1 + j[p + j[n]]].dot3(D - 1, B, A);
        var o = c[r + 1 + j[p + j[n + 1]]].dot3(D - 1, B, A - 1);
        var F = c[r + 1 + j[p + 1 + j[n]]].dot3(D - 1, B - 1, A);
        var C = c[r + 1 + j[p + 1 + j[n + 1]]].dot3(D - 1, B - 1, A - 1);
        var H = h(D);
        var G = h(B);
        var E = h(A);
        return g(g(g(J, q, H), g(I, o, H), E), g(g(t, F, H), g(s, C, H), E), G)
    }
}, "Static");
Class(function Matrix2() {
    var p = this;
    var l = Matrix2.prototype;
    var g, f, e, o, n, m, v, u, t;
    var s, r, q, d, c, a, k, j, h;
    this.type = "matrix2";
    this.data = new Float32Array(9);
    (function() {
        w()
    })();

    function w(x) {
        x = x || p.data;
        x[0] = 1, x[1] = 0, x[2] = 0;
        x[3] = 0, x[4] = 1, x[5] = 0;
        x[6] = 0, x[7] = 0, x[8] = 1
    }

    function b(x) {
        x = Math.abs(x) < 0.000001 ? 0 : x;
        return x
    }
    if (typeof l.identity !== "undefined") {
        return
    }
    l.identity = function(x) {
        w(x);
        return this
    };
    l.transformVector = function(A) {
        var B = this.data;
        var z = A.x;
        var C = A.y;
        A.x = B[0] * z + B[1] * C + B[2];
        A.y = B[3] * z + B[4] * C + B[5];
        return A
    };
    l.setTranslation = function(z, y, x) {
        var A = x || this.data;
        A[0] = 1, A[1] = 0, A[2] = z;
        A[3] = 0, A[4] = 1, A[5] = y;
        A[6] = 0, A[7] = 0, A[8] = 1;
        return this
    };
    l.getTranslation = function(x) {
        var y = this.data;
        x = x || new Vector2();
        x.x = y[2];
        x.y = y[5];
        return x
    };
    l.setScale = function(A, z, x) {
        var y = x || this.data;
        y[0] = A, y[1] = 0, y[2] = 0;
        y[3] = 0, y[4] = z, y[5] = 0;
        y[6] = 0, y[7] = 0, y[8] = 1;
        return this
    };
    l.setShear = function(A, z, x) {
        var y = x || this.data;
        y[0] = 1, y[1] = A, y[2] = 0;
        y[3] = z, y[4] = 1, y[5] = 0;
        y[6] = 0, y[7] = 0, y[8] = 1;
        return this
    };
    l.setRotation = function(y, x) {
        var B = x || this.data;
        var A = Math.cos(y);
        var z = Math.sin(y);
        B[0] = A, B[1] = -z, B[2] = 0;
        B[3] = z, B[4] = A, B[5] = 0;
        B[6] = 0, B[7] = 0, B[8] = 1;
        return this
    };
    l.setTRS = function(z, x, y, E, D) {
        var C = this.data;
        var B = Math.cos(y);
        var A = Math.sin(y);
        C[0] = B * E, C[1] = -A * D, C[2] = z;
        C[3] = A * E, C[4] = B * D, C[5] = x;
        C[6] = 0, C[7] = 0, C[8] = 1;
        return this
    };
    l.translate = function(y, x) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(y, x, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    l.rotate = function(x) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(x, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    l.scale = function(y, x) {
        this.identity(Matrix2.__TEMP__);
        this.setScale(y, x, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    l.shear = function(y, x) {
        this.identity(Matrix2.__TEMP__);
        this.setRotation(y, x, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    l.multiply = function(y) {
        var z = this.data;
        var x = y.data || y;
        g = z[0], f = z[1], e = z[2];
        o = z[3], n = z[4], m = z[5];
        v = z[6], u = z[7], t = z[8];
        s = x[0], r = x[1], q = x[2];
        d = x[3], c = x[4], a = x[5];
        k = x[6], j = x[7], h = x[8];
        z[0] = g * s + f * d + e * k;
        z[1] = g * r + f * c + e * j;
        z[2] = g * q + f * a + e * h;
        z[3] = o * s + n * d + m * k;
        z[4] = o * r + n * c + m * j;
        z[5] = o * q + n * a + m * h;
        return this
    };
    l.inverse = function(y) {
        y = y || this;
        var z = y.data;
        var x = this.data;
        g = z[0], f = z[1], e = z[2];
        o = z[3], n = z[4], m = z[5];
        v = z[6], u = z[7], t = z[8];
        var A = y.determinant();
        if (Math.abs(A) < 1e-7) {}
        var B = 1 / A;
        x[0] = (n * t - u * m) * B;
        x[1] = (e * u - f * t) * B;
        x[2] = (f * m - e * n) * B;
        x[3] = (m * v - o * t) * B;
        x[4] = (g * t - e * v) * B;
        x[5] = (o * e - g * m) * B;
        x[6] = (o * u - v * n) * B;
        x[7] = (v * f - g * u) * B;
        x[8] = (g * n - o * f) * B;
        return y
    };
    l.determinant = function() {
        var x = this.data;
        g = x[0], f = x[1], e = x[2];
        o = x[3], n = x[4], m = x[5];
        v = x[6], u = x[7], t = x[8];
        return g * (n * t - u * m) - f * (o * t - m * v) + e * (o * u * n * v)
    };
    l.copyTo = function(y) {
        var z = this.data;
        var x = y.data || y;
        x[0] = z[0], x[1] = z[1], x[2] = z[2];
        x[3] = z[3], x[4] = z[4], x[5] = z[5];
        x[6] = z[6], x[7] = z[7], x[8] = z[8];
        return y
    };
    l.copyFrom = function(y) {
        var z = this.data;
        var x = y.data || y;
        x[0] = z[0], x[1] = z[1], x[2] = z[2];
        x[3] = z[3], x[4] = z[4], x[5] = z[5];
        x[6] = z[6], x[7] = z[7], x[8] = z[8];
        return this
    };
    l.getCSS = function(x) {
        var y = this.data;
        if (Device.tween.css3d && !x) {
            return "matrix3d(" + b(y[0]) + ", " + b(y[3]) + ", 0, 0, " + b(y[1]) + ", " + b(y[4]) + ", 0, 0, 0, 0, 1, 0, " + b(y[2]) + ", " + b(y[5]) + ", 0, 1)"
        } else {
            return "matrix(" + b(y[0]) + ", " + b(y[3]) + ", " + b(y[1]) + ", " + b(y[4]) + ", " + b(y[2]) + ", " + b(y[5]) + ")"
        }
    }
}, function() {
    Matrix2.__TEMP__ = new Matrix2().data
});
Class(function Matrix4() {
    var d = this;
    var b = Matrix4.prototype;
    this.type = "matrix4";
    this.data = new Float32Array(16);
    (function() {
        a()
    })();

    function a(e) {
        var f = e || d.data;
        f[0] = 1, f[4] = 0, f[8] = 0, f[12] = 0;
        f[1] = 0, f[5] = 1, f[9] = 0, f[13] = 0;
        f[2] = 0, f[6] = 0, f[10] = 1, f[14] = 0;
        f[3] = 0, f[7] = 0, f[11] = 0, f[15] = 1
    }

    function c(e) {
        return Math.abs(e) < 0.000001 ? 0 : e
    }
    if (typeof b.identity !== "undefined") {
        return
    }
    b.identity = function() {
        a();
        return this
    };
    b.transformVector = function(g, h) {
        var k = this.data;
        var e = g.x,
            l = g.y,
            j = g.z,
            f = g.w;
        h = h || g;
        h.x = k[0] * e + k[4] * l + k[8] * j + k[12] * f;
        h.y = k[1] * e + k[5] * l + k[9] * j + k[13] * f;
        h.z = k[2] * e + k[6] * l + k[10] * j + k[14] * f;
        return h
    };
    b.multiply = function(M, N) {
        var P = this.data;
        var O = M.data || M;
        var L, K, J, I, H, G, F, E, D, C, r, q, p, o, n, l;
        var B, A, z, y, x, w, v, u, t, s, k, j, h, g, f, e;
        L = P[0], K = P[1], J = P[2], I = P[3];
        H = P[4], G = P[5], F = P[6], E = P[7];
        D = P[8], C = P[9], r = P[10], q = P[11];
        p = P[12], o = P[13], n = P[14], l = P[15];
        B = O[0], A = O[1], z = O[2], y = O[3];
        x = O[4], w = O[5], v = O[6], u = O[7];
        t = O[8], s = O[9], k = O[10], j = O[11];
        h = O[12], g = O[13], f = O[14], e = O[15];
        P[0] = L * B + H * A + D * z + p * y;
        P[1] = K * B + G * A + C * z + o * y;
        P[2] = J * B + F * A + r * z + n * y;
        P[3] = I * B + E * A + q * z + l * y;
        P[4] = L * x + H * w + D * v + p * u;
        P[5] = K * x + G * w + C * v + o * u;
        P[6] = J * x + F * w + r * v + n * u;
        P[7] = I * x + E * w + q * v + l * u;
        P[8] = L * t + H * s + D * k + p * j;
        P[9] = K * t + G * s + C * k + o * j;
        P[10] = J * t + F * s + r * k + n * j;
        P[11] = I * t + E * s + q * k + l * j;
        P[12] = L * h + H * g + D * f + p * e;
        P[13] = K * h + G * g + C * f + o * e;
        P[14] = J * h + F * g + r * f + n * e;
        P[15] = I * h + E * g + q * f + l * e;
        return this
    };
    b.setTRS = function(p, o, n, g, f, e, w, v, u, l) {
        l = l || this;
        var s = l.data;
        a(l);
        var k = Math.sin(g);
        var t = Math.cos(g);
        var j = Math.sin(f);
        var r = Math.cos(f);
        var h = Math.sin(e);
        var q = Math.cos(e);
        s[0] = (r * q + j * k * h) * w;
        s[1] = (-r * h + j * k * q) * w;
        s[2] = j * t * w;
        s[4] = h * t * v;
        s[5] = q * t * v;
        s[6] = -k * v;
        s[8] = (-j * q + r * k * h) * u;
        s[9] = (h * j + r * k * q) * u;
        s[10] = r * t * u;
        s[12] = p;
        s[13] = o;
        s[14] = n;
        return l
    };
    b.setScale = function(j, h, f, e) {
        e = e || this;
        var g = e.data || e;
        a(e);
        g[0] = j, g[5] = h, g[10] = f;
        return e
    };
    b.setTranslation = function(g, f, j, e) {
        e = e || this;
        var h = e.data || e;
        a(e);
        h[12] = g, h[13] = f, h[14] = j;
        return e
    };
    b.setRotation = function(g, f, e, j) {
        j = j || this;
        var n = j.data || j;
        a(j);
        var q = Math.sin(g);
        var l = Math.cos(g);
        var p = Math.sin(f);
        var k = Math.cos(f);
        var o = Math.sin(e);
        var h = Math.cos(e);
        n[0] = k * h + p * q * o;
        n[1] = -k * o + p * q * h;
        n[2] = p * l;
        n[4] = o * l;
        n[5] = h * l;
        n[6] = -q;
        n[8] = -p * h + k * q * o;
        n[9] = o * p + k * q * h;
        n[10] = k * l;
        return j
    };
    b.setLookAt = function(j, h, g, e) {
        e = e || this;
        var o = e.data || e;
        var n = D3.m4v31;
        var l = D3.m4v32;
        var k = D3.m4v33;
        n.subVectors(h, j).normalize();
        l.cross(n, g).normalize();
        k.cross(l, n);
        o[0] = l.x;
        o[1] = k.x;
        o[2] = -n.x;
        o[3] = 0;
        o[4] = l.y;
        o[5] = k.y;
        o[6] = -n.y;
        o[7] = 0;
        o[8] = l.z;
        o[9] = k.z;
        o[10] = -n.z;
        o[11] = 0;
        o[12] = 0;
        o[13] = 0;
        o[14] = 0;
        o[15] = 1;
        this.translate(-j.x, -j.y, -j.z);
        return this
    };
    b.setPerspective = function(g, f, l, j, h) {
        var n, o, p, k;
        if (l === j || f === 0) {
            throw "null frustum"
        }
        if (l <= 0) {
            throw "near <= 0"
        }
        if (j <= 0) {
            throw "far <= 0"
        }
        g = Math.PI * g / 180 / 2;
        p = Math.sin(g);
        if (p === 0) {
            throw "null frustum"
        }
        o = 1 / (j - l);
        k = Math.cos(g) / p;
        n = h ? (h.data || h) : this.data;
        n[0] = k / f;
        n[1] = 0;
        n[2] = 0;
        n[3] = 0;
        n[4] = 0;
        n[5] = k;
        n[6] = 0;
        n[7] = 0;
        n[8] = 0;
        n[9] = 0;
        n[10] = -(j + l) * o;
        n[11] = -1;
        n[12] = 0;
        n[13] = 0;
        n[14] = -2 * l * j * o;
        n[15] = 0
    };
    b.perspective = function(g, f, h, e) {
        this.setPerspective(g, f, h, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.lookAt = function(g, f, e) {
        this.setLookAt(g, f, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.translate = function(f, e, g) {
        this.setTranslation(f, e, g, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.rotate = function(g, f, e) {
        this.setRotation(g, f, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.scale = function(g, f, e) {
        this.setScale(g, f, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.copyTo = function(f) {
        var g = this.data;
        var e = f.data || f;
        for (var h = 0; h < 16; h++) {
            e[h] = g[h]
        }
    };
    b.copyFrom = function(f) {
        var g = this.data;
        var e = f.data || f;
        for (var h = 0; h < 16; h++) {
            g[h] = e[h]
        }
        return this
    };
    b.copyRotationTo = function(f) {
        var g = this.data;
        var e = f.data || f;
        e[0] = g[0];
        e[1] = g[1];
        e[2] = g[2];
        e[3] = g[4];
        e[4] = g[5];
        e[5] = g[6];
        e[6] = g[8];
        e[7] = g[9];
        e[8] = g[10];
        return f
    };
    b.copyPosition = function(e) {
        var g = this.data;
        var f = e.data || e;
        g[12] = f[12];
        g[13] = f[13];
        g[14] = f[14];
        return this
    };
    b.getCSS = function() {
        var e = this.data;
        return "matrix3d(" + c(e[0]) + "," + c(e[1]) + "," + c(e[2]) + "," + c(e[3]) + "," + c(e[4]) + "," + c(e[5]) + "," + c(e[6]) + "," + c(e[7]) + "," + c(e[8]) + "," + c(e[9]) + "," + c(e[10]) + "," + c(e[11]) + "," + c(e[12]) + "," + c(e[13]) + "," + c(e[14]) + "," + c(e[15]) + ")"
    };
    b.extractPosition = function(e) {
        e = e || new Vector3();
        var f = this.data;
        e.set(f[12], f[13], f[14]);
        return e
    };
    b.determinant = function() {
        var e = this.data;
        return e[0] * (e[5] * e[10] - e[9] * e[6]) + e[4] * (e[9] * e[2] - e[1] * e[10]) + e[8] * (e[1] * e[6] - e[5] * e[2])
    };
    b.inverse = function(h) {
        var p = this.data;
        var r = (h) ? h.data || h : this.data;
        var n = this.determinant();
        if (Math.abs(n) < 0.0001) {
            console.warn("Attempt to inverse a singular Matrix4. ", this.data);
            console.trace();
            return h
        }
        var g = p[0],
            v = p[4],
            s = p[8],
            l = p[12],
            f = p[1],
            u = p[5],
            q = p[9],
            k = p[13],
            e = p[2],
            t = p[6],
            o = p[10],
            j = p[14];
        n = 1 / n;
        r[0] = (u * o - q * t) * n;
        r[1] = (s * t - v * o) * n;
        r[2] = (v * q - s * u) * n;
        r[4] = (q * e - f * o) * n;
        r[5] = (g * o - s * e) * n;
        r[6] = (s * f - g * q) * n;
        r[8] = (f * t - u * e) * n;
        r[9] = (v * e - g * t) * n;
        r[10] = (g * u - v * f) * n;
        r[12] = -(l * r[0] + k * r[4] + j * r[8]);
        r[13] = -(l * r[1] + k * r[5] + j * r[9]);
        r[14] = -(l * r[2] + k * r[6] + j * r[10]);
        return h
    };
    b.transpose = function(h) {
        var k = this.data;
        var n = h ? h.data || h : this.data;
        var g = k[0],
            r = k[4],
            o = k[8],
            f = k[1],
            q = k[5],
            l = k[9],
            e = k[2],
            p = k[6],
            j = k[10];
        n[0] = g;
        n[1] = r;
        n[2] = o;
        n[4] = f;
        n[5] = q;
        n[6] = l;
        n[8] = e;
        n[9] = p;
        n[10] = j
    }
}, function() {
    Matrix4.__TEMP__ = new Matrix4().data
});
Class(function Vector2(c, a) {
    var d = this;
    var b = Vector2.prototype;
    this.x = typeof c == "number" ? c : 0;
    this.y = typeof a == "number" ? a : 0;
    this.type = "vector2";
    if (typeof b.set !== "undefined") {
        return
    }
    b.set = function(e, f) {
        this.x = e;
        this.y = f;
        return this
    };
    b.clear = function() {
        this.x = 0;
        this.y = 0;
        return this
    };
    b.copyTo = function(e) {
        e.x = this.x;
        e.y = this.y;
        return this
    };
    b.copyFrom = b.copy = function(e) {
        this.x = e.x;
        this.y = e.y;
        return this
    };
    b.addVectors = function(f, e) {
        this.x = f.x + e.x;
        this.y = f.y + e.y;
        return this
    };
    b.subVectors = function(f, e) {
        this.x = f.x - e.x;
        this.y = f.y - e.y;
        return this
    };
    b.multiplyVectors = function(f, e) {
        this.x = f.x * e.x;
        this.y = f.y * e.y;
        return this
    };
    b.add = function(e) {
        this.x += e.x;
        this.y += e.y;
        return this
    };
    b.sub = function(e) {
        this.x -= e.x;
        this.y -= e.y;
        return this
    };
    b.multiply = function(e) {
        this.x *= e;
        this.y *= e;
        return this
    };
    b.divide = function(e) {
        this.x /= e;
        this.y /= e;
        return this
    };
    b.lengthSq = function() {
        return (this.x * this.x + this.y * this.y) || 0.00001
    };
    b.length = function() {
        return Math.sqrt(this.lengthSq())
    };
    b.setLength = function(e) {
        this.normalize().multiply(e);
        return this
    };
    b.normalize = function() {
        var e = this.length();
        this.x /= e;
        this.y /= e;
        return this
    };
    b.perpendicular = function(h, f) {
        var g = this.x;
        var e = this.y;
        this.x = -e;
        this.y = g;
        return this
    };
    b.lerp = function(e, f) {
        this.x += (e.x - this.x) * f;
        this.y += (e.y - this.y) * f;
        return this
    };
    b.interp = function(g, k, m) {
        var e = 0;
        var j = TweenManager.Interpolation.convertEase(m);
        var h = Vector2.__TEMP__;
        h.subVectors(this, g);
        var l = Utils.clamp(Utils.range(h.lengthSq(), 0, (5000 * 5000), 1, 0), 0, 1) * (k / 10);
        if (typeof j === "function") {
            e = j(l)
        } else {
            e = TweenManager.Interpolation.solve(j, l)
        }
        this.x += (g.x - this.x) * e;
        this.y += (g.y - this.y) * e
    };
    b.setAngleRadius = function(e, f) {
        this.x = Math.cos(e) * f;
        this.y = Math.sin(e) * f;
        return this
    };
    b.addAngleRadius = function(e, f) {
        this.x += Math.cos(e) * f;
        this.y += Math.sin(e) * f;
        return this
    };
    b.clone = function() {
        return new Vector2(this.x, this.y)
    };
    b.dot = function(f, e) {
        e = e || this;
        return (f.x * e.x + f.y * e.y)
    };
    b.distanceTo = function(g, h) {
        var f = this.x - g.x;
        var e = this.y - g.y;
        if (!h) {
            return Math.sqrt(f * f + e * e)
        }
        return f * f + e * e
    };
    b.solveAngle = function(f, e) {
        if (!e) {
            e = this
        }
        return Math.atan2(f.y - e.y, f.x - e.x)
    };
    b.equals = function(e) {
        return this.x == e.x && this.y == e.y
    };
    b.console = function() {
        console.log(this.x, this.y)
    }
}, function() {
    Vector2.__TEMP__ = new Vector2()
});
Class(function Vector3(d, b, a, e) {
    var f = this;
    var c = Vector3.prototype;
    this.x = typeof d === "number" ? d : 0;
    this.y = typeof b === "number" ? b : 0;
    this.z = typeof a === "number" ? a : 0;
    this.w = typeof e === "number" ? e : 1;
    this.type = "vector3";
    if (typeof c.set !== "undefined") {
        return
    }
    c.set = function(g, k, j, h) {
        this.x = g || 0;
        this.y = k || 0;
        this.z = j || 0;
        this.w = h || 1;
        return this
    };
    c.clear = function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this
    };
    c.copyTo = function(g) {
        g.x = this.x;
        g.y = this.y;
        g.z = this.z;
        g.w = this.w;
        return g
    };
    c.copyFrom = c.copy = function(g) {
        this.x = g.x || 0;
        this.y = g.y || 0;
        this.z = g.z || 0;
        this.w = g.w || 1;
        return this
    };
    c.lengthSq = function() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    };
    c.length = function() {
        return Math.sqrt(this.lengthSq())
    };
    c.normalize = function() {
        var g = 1 / this.length();
        this.set(this.x * g, this.y * g, this.z * g);
        return this
    };
    c.setLength = function(g) {
        this.normalize().multiply(g);
        return this
    };
    c.addVectors = function(h, g) {
        this.x = h.x + g.x;
        this.y = h.y + g.y;
        this.z = h.z + g.z;
        return this
    };
    c.subVectors = function(h, g) {
        this.x = h.x - g.x;
        this.y = h.y - g.y;
        this.z = h.z - g.z;
        return this
    };
    c.multiplyVectors = function(h, g) {
        this.x = h.x * g.x;
        this.y = h.y * g.y;
        this.z = h.z * g.z;
        return this
    };
    c.add = function(g) {
        this.x += g.x;
        this.y += g.y;
        this.z += g.z;
        return this
    };
    c.sub = function(g) {
        this.x -= g.x;
        this.y -= g.y;
        this.z -= g.z;
        return this
    };
    c.multiply = function(g) {
        this.x *= g;
        this.y *= g;
        this.z *= g;
        return this
    };
    c.divide = function(g) {
        this.x /= g;
        this.y /= g;
        this.z /= g;
        return this
    };
    c.limit = function(g) {
        if (this.length() > g) {
            this.normalize();
            this.multiply(g)
        }
    };
    c.heading2D = function() {
        var g = Math.atan2(-this.y, this.x);
        return -g
    };
    c.lerp = function(g, h) {
        this.x += (g.x - this.x) * h;
        this.y += (g.y - this.y) * h;
        this.z += (g.z - this.z) * h;
        return this
    };
    c.deltaLerp = function(g, k, l) {
        l = l || 1;
        for (var h = 0; h < l; h++) {
            var j = k;
            this.x += ((g.x - this.x) * k);
            this.y += ((g.y - this.y) * k);
            this.z += ((g.z - this.z) * k)
        }
        return this
    };
    c.interp = function(h, l, n, m) {
        if (!Vector3.__TEMP__) {
            Vector3.__TEMP__ = new Vector3()
        }
        m = m || 5000;
        var g = 0;
        var k = TweenManager.Interpolation.convertEase(n);
        var j = Vector3.__TEMP__;
        j.subVectors(this, h);
        var m = Utils.clamp(Utils.range(j.lengthSq(), 0, (m * m), 1, 0), 0, 1) * (l / 10);
        if (typeof k === "function") {
            g = k(m)
        } else {
            g = TweenManager.Interpolation.solve(k, m)
        }
        this.x += (h.x - this.x) * g;
        this.y += (h.y - this.y) * g;
        this.z += (h.z - this.z) * g
    };
    c.setAngleRadius = function(g, h) {
        this.x = Math.cos(g) * h;
        this.y = Math.sin(g) * h;
        this.z = Math.sin(g) * h;
        return this
    };
    c.addAngleRadius = function(g, h) {
        this.x += Math.cos(g) * h;
        this.y += Math.sin(g) * h;
        this.z += Math.sin(g) * h;
        return this
    };
    c.dot = function(h, g) {
        g = g || this;
        return h.x * g.x + h.y * g.y + h.z * g.z
    };
    c.clone = function() {
        return new Vector3(this.x, this.y, this.z)
    };
    c.cross = function(j, h) {
        if (!h) {
            h = this
        }
        var g = j.y * h.z - j.z * h.y;
        var l = j.z * h.x - j.x * h.z;
        var k = j.x * h.y - j.y * h.x;
        this.set(g, l, k, this.w);
        return this
    };
    c.distanceTo = function(k, l) {
        var j = this.x - k.x;
        var h = this.y - k.y;
        var g = this.z - k.z;
        if (!l) {
            return Math.sqrt(j * j + h * h + g * g)
        }
        return j * j + h * h + g * g
    };
    c.solveAngle = function(h, g) {
        if (!g) {
            g = this
        }
        return Math.acos(h.dot(g) / (h.length() * g.length()))
    };
    c.equals = function(g) {
        return this.x == g.x && this.y == g.y && this.z == g.z
    };
    c.console = function() {
        console.log(this.x, this.y, this.z)
    }
}, function() {
    Vector3.__TEMP__ = new Vector3()
});
Mobile.Class(function Accelerometer() {
    var b = this;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.toRadians = Mobile.os == "iOS" ? Math.PI / 180 : 1;

    function a(c) {
        switch (window.orientation) {
            case 0:
                b.x = -c.accelerationIncludingGravity.x;
                b.y = c.accelerationIncludingGravity.y;
                b.z = c.accelerationIncludingGravity.z;
                if (c.rotationRate) {
                    b.alpha = c.rotationRate.beta * b.toRadians;
                    b.beta = -c.rotationRate.alpha * b.toRadians;
                    b.gamma = c.rotationRate.gamma * b.toRadians
                }
                break;
            case 180:
                b.x = c.accelerationIncludingGravity.x;
                b.y = -c.accelerationIncludingGravity.y;
                b.z = c.accelerationIncludingGravity.z;
                if (c.rotationRate) {
                    b.alpha = -c.rotationRate.beta * b.toRadians;
                    b.beta = c.rotationRate.alpha * b.toRadians;
                    b.gamma = c.rotationRate.gamma * b.toRadians
                }
                break;
            case 90:
                b.x = c.accelerationIncludingGravity.y;
                b.y = c.accelerationIncludingGravity.x;
                b.z = c.accelerationIncludingGravity.z;
                if (c.rotationRate) {
                    b.alpha = c.rotationRate.alpha * b.toRadians;
                    b.beta = c.rotationRate.beta * b.toRadians;
                    b.gamma = c.rotationRate.gamma * b.toRadians
                }
                break;
            case -90:
                b.x = -c.accelerationIncludingGravity.y;
                b.y = -c.accelerationIncludingGravity.x;
                b.z = c.accelerationIncludingGravity.z;
                if (c.rotationRate) {
                    b.alpha = -c.rotationRate.alpha * b.toRadians;
                    b.beta = -c.rotationRate.beta * b.toRadians;
                    b.gamma = c.rotationRate.gamma * b.toRadians
                }
                break
        }
    }
    this.capture = function() {
        window.ondevicemotion = a
    };
    this.stop = function() {
        window.ondevicemotion = null;
        b.x = b.y = b.z = 0
    }
}, "Static");
Class(function Interaction() {
    Namespace(this)
}, "static");
Interaction.Class(function Input(k) {
    Inherit(this, Component);
    var e = this;
    var l = new Vector2();
    var f = new Vector2();
    var c = new Vector2();
    var a = Render.TIME;
    var b = Render.TIME;
    var h = false;
    this.velocity = new Vector2();
    (function() {
        if (k instanceof HydraObject) {
            g()
        }
    })();

    function g() {
        if (k == Stage || k == __window) {
            Interaction.Input.bind("touchstart", d)
        } else {
            k.bind("touchstart", d)
        }
        Interaction.Input.bind("touchmove", j);
        Interaction.Input.bind("touchend", m)
    }

    function d(n) {
        h = true;
        e.velocity.clear();
        l.copyFrom(n);
        if (e.onStart) {
            defer(function() {
                if (e.onStart) {
                    e.onStart(n)
                }
            })
        }
    }

    function j(n) {
        if (!h) {
            return
        }
        f.subVectors(n, l);
        a = (Render.TIME - b) || 0.01;
        if (a >= 16) {
            e.velocity.subVectors(n, c);
            e.velocity.divide(a);
            b = Render.TIME;
            c.copyFrom(n)
        }
        if (e.onUpdate) {
            defer(function() {
                if (e.onUpdate) {
                    e.onUpdate(f, n)
                }
            })
        }
    }

    function m(n) {
        if (!h) {
            return
        }
        h = false;
        if (e.onEnd) {
            defer(function() {
                if (e.onEnd) {
                    e.onEnd(n)
                }
            })
        }
    }
    this.attach = function(n) {
        if (k instanceof HydraObject) {
            k.unbind("touchstart", d)
        }
        k = n;
        g()
    };
    this.touchStart = function(n) {
        d({
            x: Mouse.x,
            y: Mouse.y
        })
    };
    this.end = this.touchEnd = function() {
        m()
    };
    this.destroy = function() {
        Interaction.Input.unbind("touchmove", j);
        Interaction.Input.unbind("touchstart", d);
        Interaction.Input.unbind("touchend", m);
        k && k.unbind && k.unbind("touchstart", d);
        return this._destroy()
    }
}, function() {
    var d = {
        touchstart: [],
        touchmove: [],
        touchend: []
    };
    var a;

    function f() {
        a = true;
        __window.bind("touchstart", b);
        __window.bind("touchmove", e);
        __window.bind("touchend", c);
        __window.bind("touchcancel", c);
        __window.bind("contextmenu", c)
    }

    function e(g) {
        d.touchmove.forEach(function(h) {
            h(g)
        })
    }

    function b(g) {
        d.touchstart.forEach(function(h) {
            h(g)
        })
    }

    function c(g) {
        d.touchend.forEach(function(h) {
            h(g)
        })
    }
    Interaction.Input.bind = function(g, h) {
        d[g].push(h);
        if (!a) {
            f()
        }
    };
    Interaction.Input.unbind = function(g, h) {
        d[g].findAndRemove(h)
    }
});
Interaction.Class(function Renderer(b) {
    Inherit(this, Component);
    var c = this;
    var a = b instanceof HydraObject;
    this.needsUpdate = !!a;
    if (a) {
        b.x = b.x || 0;
        b.y = b.y || 0;
        b.z = b.z || 0;
        b.pos = {
            x: 0,
            y: 0,
            z: 0
        }
    }
    this.update = function() {
        b.transform()
    }
});
Interaction.Class(function SnapBack(j, g) {
    Inherit(this, Component);
    var f = this;
    var m, h, c, b;
    this.autoRender = true;
    this.elapsed = 0;
    this.friction = 0.3;
    this.easeTime = 500;
    this.ease = "easeOutCubic";
    this.damping = 1;
    (function() {
        k();
        l()
    })();

    function l() {
        b = {};
        if (!g) {
            g = {
                x: 1,
                y: 1
            }
        }
        for (var n in g) {
            b[n] = j[n]
        }
    }

    function k() {
        m = f.initClass(Interaction.Input, j);
        m.onUpdate = e;
        m.onStart = d;
        m.onEnd = a;
        f.input = m;
        c = new DynamicObject();
        h = f.initClass(Interaction.Renderer, j)
    }

    function e(o) {
        o.multiply(f.friction);
        for (var n in g) {
            j[n] = o[n]
        }
        if (f.onUpdate) {
            f.onUpdate(o)
        }
        if (f.autoRender && h.needsUpdate) {
            h.update()
        }
    }

    function d() {
        c.stopTween();
        if (f.onStart) {
            f.onStart()
        }
    }

    function a() {
        c.copyFrom(j);
        if (f.ease == "spring") {
            b.damping = f.damping
        }
        c.tween(b, f.easeTime, f.ease, function(n) {
            c.copyTo(j);
            if (f.autoRender && h.needsUpdate) {
                h.update()
            }
            f.elapsed = n
        });
        if (b.damping) {
            delete b.damping
        }
        if (f.onEnd) {
            f.onEnd()
        }
    }
    this.set("directions", function(n) {
        g = n;
        l()
    });
    this.resetOrigin = function() {
        l()
    }
});
Interaction.Class(function Drawer(j, m) {
    Inherit(this, Component);
    var s = this;
    var b, k, p, x, y, t, f, d;
    var w = 0;
    var n = new Vector2();
    var u = new Vector2();
    var q = new Vector2();
    this.autoRender = true;
    this.friction = 0.5;
    this.ease = "easeOutCubic";
    this.easeTime = 500;
    this.snap = true;
    this.prevent = null;
    this.enabled = true;
    (function() {
        l();
        r()
    })();

    function l() {
        b = s.initClass(Interaction.Input, j);
        b.onUpdate = g;
        b.onStart = o;
        b.onEnd = a;
        p = new DynamicObject();
        x = s.initClass(Interaction.Renderer, j);
        s.input = b
    }

    function r() {
        k = {};
        y = {};
        f = {};
        if (!m) {
            m = {
                x: 1,
                y: 1
            }
        }
        for (var z in m) {
            k[z] = j[z];
            y[z] = m[z]
        }
        t = z
    }

    function c() {
        if (y[t] < 1) {
            if (j[t] < y[t]) {
                return true
            }
            if (j[t] > w) {
                return true
            }
        } else {
            if (j[t] > y[t]) {
                return true
            }
            if (j[t] < w) {
                return true
            }
        }
    }

    function v() {
        var z = y[t];
        var A = j[t];
        if (z < 1) {
            if (A < z) {
                j[t] = z - ((z - A) * s.friction);
                f[t] = z
            }
            if (A > 0) {
                j[t] = A * s.friction;
                f[t] = w
            }
        } else {
            if (A > z) {
                j[t] = z + ((A - z) * s.friction);
                f[t] = z
            }
            if (A < 0) {
                j[t] = A * s.friction;
                f[t] = w
            }
        }
    }

    function h() {
        return j[t] / y[t]
    }

    function e(A, z) {
        p.copyFrom(j);
        if (s.ease == "spring") {
            z.damping = s.damping
        }
        p.tween(z, A, s.ease, function() {
            p.copyTo(j);
            if (s.autoRender && x.needsUpdate) {
                x.update()
            }
            if (s.onUpdate) {
                s.onUpdate(h())
            }
        });
        if (z.damping) {
            delete z.damping
        }
    }

    function g(B, A) {
        if (s.prevent && s.prevent.disabled) {
            return
        }
        if (s.prevent) {
            if (Math.abs(B[t]) < 20 && !s.prevent.frozen) {
                var z = s.prevent.axis;
                if (Math.abs(B[z]) > s.prevent.pixels) {
                    return s.prevent.disabled = true
                }
            } else {
                if (!s.prevent.disabled) {
                    s.prevent.frozen = true
                }
            }
        }
        if (!s.enabled) {
            return
        }
        d = true;
        j[t] = n[t] + B[t];
        u.subVectors(j, k);
        if (c()) {
            v()
        }
        if (s.onUpdate) {
            s.onUpdate(h())
        }
        if (s.autoRender && x.needsUpdate) {
            x.update()
        }
    }

    function o() {
        if (!s.enabled) {
            return
        }
        n.copyFrom(j);
        p.stopTween();
        if (s.onStart) {
            s.onStart()
        }
    }

    function a() {
        if (s.onEnd) {
            s.onEnd()
        }
        if (s.prevent) {
            s.prevent.disabled = false;
            s.prevent.frozen = false;
            if (Math.abs(b.velocity[s.prevent.axis]) > 1 && Math.abs(b.velocity[t]) < 1) {
                return
            }
        }
        if (!d || !s.enabled || s.active("toggle")) {
            return
        }
        d = false;
        if (s.snap) {
            var B = {};
            var A = s.easeTime;
            var z = Math.abs(b.velocity[t]);
            if (z > 0.5) {
                if (b.velocity[t] < 0 && y[t] < 0) {
                    B[t] = y[t]
                } else {
                    if (b.velocity[t] > 0 && y[t] > 0) {
                        B[t] = y[t]
                    } else {
                        B[t] = w
                    }
                }
            } else {
                if (h() > 0.5) {
                    B[t] = y[t]
                } else {
                    B[t] = w
                }
            }
            e(A, B)
        } else {
            if (c()) {
                e(s.easeTime, f)
            }
        }
    }
    this.set("directions", function(z) {
        m = z;
        r()
    });
    this.set("min", function(z) {
        w = z
    });
    this.resetOrigin = function() {
        r()
    };
    this.toggle = function(A) {
        s.active("toggle", true);
        var z = {};
        if (h() < 0.5) {
            z[t] = y[t]
        } else {
            z[t] = w
        }
        e(A || s.easeTime, z);
        s.delayedCall(function() {
            s.active("toggle", false)
        }, 250)
    };
    this.getElapsed = function() {
        return h()
    }
});
Interaction.Class(function Slider(m, h, j) {
    Inherit(this, Component);
    var s = this;
    var b, p, x, t, q;
    var u, z, y, w;
    var A = 0;
    this.autoRender = true;
    this.currentSlide = 0;
    this.maxSlides = j.slides;
    this.width = j.width;
    this.height = j.height;
    this.snapPoint = 0.3;
    this.ease = "easeOutCubic";
    this.easeTime = 500;
    this.friction = 0.3;
    this.infinite = false;
    this.desktopDrag = true;
    this.preventMovement = true;
    this.cssTransitions = false;
    (function() {
        n();
        d()
    })();

    function n() {
        b = s.initClass(Interaction.Input, m);
        b.onUpdate = k;
        b.onStart = o;
        b.onEnd = a;
        s.input = b;
        p = new DynamicObject();
        x = s.initClass(Interaction.Renderer, m)
    }

    function d() {
        t = h.x ? "width" : "height";
        u = h.x ? "x" : "y"
    }

    function l() {
        if (!q) {
            return
        }
        return -q[u] / s[t]
    }

    function f() {
        s.elapsed = Math.abs(m.x) / Math.abs(-s[t] * (s.maxSlides - 1));
        if (z) {
            for (var C = 0; C < z.length; C++) {
                var B = z[C];
                var E = s[t] * C;
                var D = (m[u] + E) / s[t];
                if (B.updatePosition) {
                    B.updatePosition(D)
                }
            }
        }
    }

    function e(C) {
        var B = s.cssTransitions;
        p.copyFrom(m);
        p.tween(C, s.easeTime, s.ease, function() {
            p.copyTo((B ? m.pos : m));
            if (!B && s.autoRender && x.needsUpdate) {
                x.update()
            }
            s.elapsed = f();
            if (s.onUpdate) {
                s.onUpdate(s.elapsed)
            }
        });
        if (B) {
            var D = {};
            D[u] = C[u];
            m.tween(D, s.easeTime, s.ease)
        }
    }

    function r() {
        s.currentSlide++;
        if (s.repeatable && s.currentSlide > s.maxSlides - 1) {
            s.currentSlide = 0
        }
        if (!s.infinite && s.currentSlide > s.maxSlides - 1) {
            s.currentSlide = s.maxSlides - 1
        }
        if (s.onUpdateSlide) {
            s.onUpdateSlide(s.currentSlide, 1)
        }
    }

    function g() {
        s.currentSlide--;
        if (s.repeatable && s.currentSlide < 0) {
            s.currentSlide = s.maxSlides - 1
        }
        if (!s.infinite && s.currentSlide < 0) {
            s.currentSlide = 0
        }
        if (s.onUpdateSlide) {
            s.onUpdateSlide(s.currentSlide, -1)
        }
    }

    function c() {
        return m[u] > 0 || (s.currentSlide == s.maxSlides - 1 && m[u] < -s[t] * s.currentSlide)
    }

    function v() {
        var C = m[u];
        var B = -s[t] * s.currentSlide;
        if (C > 0) {
            m[u] = C * s.friction
        } else {
            if (C < B) {
                m[u] = B + ((C - B) * s.friction)
            }
        }
    }

    function k(B) {
        if ((!Device.mobile && !s.desktopDrag) || !w || s.preventMovement) {
            return
        }
        m[u] = (-s[t] * s.currentSlide) + B[u] + A;
        if (!s.infinite && c()) {
            v()
        }
        s.elapsed = f();
        if (s.cssTransitions) {
            m.stopTween()
        }
        if (s.onUpdate) {
            s.onUpdate(s.elapsed)
        }
        if (s.autoRender && x.needsUpdate) {
            m.pos[u] = m[u];
            x.update()
        }
        q = B
    }

    function o(B) {
        if ((!Device.mobile && !s.desktopDrag) || (B.target.className == "hit" && j.allowHit != true) || s.preventMovement) {
            return
        }
        w = true;
        p.stopTween();
        A = (p[u] + (s[t] * s.currentSlide)) || 0;
        y = Date.now()
    }

    function a(F) {
        if ((!Device.mobile && !s.desktopDrag) || !w || s.preventMovement) {
            return
        }
        var E = {};
        var B = l();
        var C = b.velocity[u];
        var D = Date.now() - y;
        if (D < 50) {
            return
        }
        if (Math.abs(C) > 0.2) {
            if (C > 0) {
                g()
            } else {
                r()
            }
        } else {
            if (C < 0) {
                if (B > s.snapPoint) {
                    r()
                }
            } else {
                if (Math.abs(B) > s.snapPoint) {
                    g()
                }
            }
        }
        E[u] = -s[t] * s.currentSlide;
        w = false;
        e(E)
    }
    this.set("views", function(B) {
        z = B
    });
    this.moveTo = function(B) {
        if (!s.infinite) {
            if (B < 0) {
                B = 0
            }
            if (B >= s.maxSlides) {
                B = s.maxSlides - 1
            }
        }
        s.currentSlide = B;
        var C = {};
        C[u] = -s[t] * s.currentSlide;
        e(C)
    };
    this.jumpTo = function(B) {
        if (!s.infinite) {
            if (B < 0) {
                B = 0
            }
            if (B >= s.maxSlides) {
                B = s.maxSlides - 1
            }
        }
        s.currentSlide = B;
        p[u] = -s[t] * s.currentSlide;
        p.copyTo(m);
        if (s.autoRender && x.needsUpdate) {
            m.pos[u] = m[u];
            x.update()
        }
    };
    this.next = function() {
        r();
        var B = {};
        B[u] = -s[t] * s.currentSlide;
        e(B)
    };
    this.prev = function() {
        g();
        var B = {};
        B[u] = -s[t] * s.currentSlide;
        e(B)
    }
});
Class(function ParticlePhysics(g) {
    Inherit(this, Component);
    var d = this;
    g = g || new EulerIntegrator();
    var a = 1 / 60;
    var n = 0;
    var m = 0;
    var c = null;
    var j = 0;
    var e = [];
    this.friction = 1;
    this.maxSteps = 1;
    this.emitters = new LinkedList();
    this.initializers = new LinkedList();
    this.behaviors = new LinkedList();
    this.particles = new LinkedList();
    this.springs = new LinkedList();

    function l(q) {
        var o = d.initializers.start();
        while (o) {
            o(q);
            o = d.initializers.next()
        }
    }

    function h(p) {
        var o = d.springs.start();
        while (o) {
            o.update(p);
            o = d.springs.next()
        }
    }

    function k() {
        for (var o = e.length - 1; o > -1; o--) {
            var p = e[o];
            d.particles.remove(p);
            p.system = null
        }
        e.length = 0
    }

    function f(r) {
        var q = 0;
        var s = d.particles.start();
        while (s) {
            if (!s.disabled) {
                var o = d.behaviors.start();
                while (o) {
                    o.applyBehavior(s, r, q);
                    o = d.behaviors.next()
                }
                if (s.behaviors.length) {
                    s.update(r, q)
                }
            }
            q++;
            s = d.particles.next()
        }
    }

    function b(o) {
        f(o);
        if (d.springs.length) {
            h(o)
        }
        if (!d.skipIntegration) {
            g.integrate(d.particles, o, d.friction)
        }
    }
    this.addEmitter = function(o) {
        if (!(o instanceof Emitter)) {
            throw "Emitter must be Emitter"
        }
        this.emitters.push(o);
        o.parent = o.system = this
    };
    this.removeEmitter = function(o) {
        if (!(o instanceof Emitter)) {
            throw "Emitter must be Emitter"
        }
        this.emitters.remove(o);
        o.parent = o.system = null
    };
    this.addInitializer = function(o) {
        if (typeof o !== "function") {
            throw "Initializer must be a function"
        }
        this.initializers.push(o)
    };
    this.removeInitializer = function(o) {
        this.initializers.remove(o)
    };
    this.addBehavior = function(o) {
        this.behaviors.push(o);
        o.system = this
    };
    this.removeBehavior = function(o) {
        this.behaviors.remove(o)
    };
    this.addParticle = function(o) {
        if (!g.type) {
            if (typeof o.pos.z === "number") {
                g.type = "3D"
            } else {
                g.type = "2D"
            }
        }
        o.system = this;
        this.particles.push(o);
        if (this.initializers.length) {
            l(o)
        }
    };
    this.removeParticle = function(o) {
        o.system = null;
        e.push(o)
    };
    this.addSpring = function(o) {
        o.system = this;
        this.springs.push(o)
    };
    this.removeSpring = function(o) {
        o.system = null;
        this.springs.remove(o)
    };
    this.update = function(p) {
        if (!c) {
            c = THREAD ? Date.now() : Render.TIME
        }
        var q = THREAD ? Date.now() : Render.TIME;
        var r = q - c;
        if (!p && r <= 0) {
            return
        }
        r *= 0.001;
        c = q;
        j += r;
        if (!p) {
            var o = 0;
            while (j >= a && o++ < d.maxSteps) {
                b(a);
                j -= a;
                n += a
            }
        } else {
            b(0.016)
        }
        m = Date.now() - q;
        if (e.length) {
            k()
        }
    }
});
Class(function Particle(j, c, b) {
    var f = this;
    var a, g, d;
    var h = Particle.prototype;
    this.mass = c || 1;
    this.massInv = 1 / this.mass;
    this.radius = b || 1;
    this.radiusSq = this.radius * this.radius;
    this.behaviors = new LinkedList();
    this.fixed = false;
    (function() {
        e()
    })();

    function e() {
        var k = typeof j.z === "number" ? Vector3 : Vector2;
        j = j || new k();
        a = new k();
        g = new k();
        d = {};
        d.pos = new k();
        d.acc = new k();
        d.vel = new k();
        d.pos.copyFrom(j);
        f.pos = f.position = j;
        f.vel = f.velocity = a;
        f.acc = f.acceleration = g;
        f.old = d
    }
    this.moveTo = function(k) {
        j.copyFrom(k);
        d.pos.copyFrom(j);
        g.clear();
        a.clear()
    };
    if (typeof h.setMass !== "undefined") {
        return
    }
    h.setMass = function(k) {
        this.mass = k || 1;
        this.massInv = 1 / this.mass
    };
    h.setRadius = function(k) {
        this.radius = k;
        this.radiusSq = k * k
    };
    h.update = function(l) {
        if (!this.behaviors.length) {
            return
        }
        var k = this.behaviors.start();
        while (k) {
            k.applyBehavior(this, l);
            k = this.behaviors.next()
        }
    };
    h.applyForce = function(k) {
        this.acc.add(k)
    };
    h.addBehavior = function(k) {
        if (!k || typeof k.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        this.behaviors.push(k)
    };
    h.removeBehavior = function(k) {
        if (!k || typeof k.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        this.behaviors.remove(k)
    }
});
Class(function SpringPhysics(f, d, g, h) {
    var e = this;
    var j = Spring.prototype;
    var c = typeof f.pos.z !== "undefined" ? Vector3 : Vector2;
    var a = new c();
    var b = new c();
    h = h || b.subVectors(f.pos, d.pos).length();
    if (typeof j.update !== "undefined") {
        return
    }
    j.update = function(k) {
        a.copyFrom(d.pos).sub(f.pos);
        b.copyFrom(a);
        var m = a.length() + 1e-7;
        var l = (m - h) / (m * (f.massInv + d.massInv)) * g;
        if (!f.fixed) {
            f.pos.add(b.multiply(l * f.massInv))
        }
        if (!d.fixed) {
            d.pos.add(a.multiply(-l * d.massInv))
        }
    }
});
Class(function Spring(j, f, b, c) {
    Inherit(this, Component);
    var g = this;
    var e = typeof j.z !== "undefined" ? Vector3 : Vector2;
    var d = new e();
    var h = new e();
    var a = new e();
    this.update = function() {
        d.subVectors(f, j);
        h.copyFrom(d).multiply(b);
        a.add(h).multiply(c);
        j.add(a)
    };
    this.set("position", function(k) {
        j = k
    });
    this.set("target", function(k) {
        f = k
    });
    this.set("damping", function(k) {
        b = k
    });
    this.set("friction", function(k) {
        c = k
    })
});
Class(function EulerIntegrator() {
    Inherit(this, Component);
    var d = this;
    var b, c;
    this.useDeltaTime = false;
    (function() {})();

    function a() {
        var e = d.type == "3D" ? Vector3 : Vector2;
        b = new e();
        c = new e()
    }
    this.integrate = function(h, g, f) {
        if (!b) {
            a()
        }
        var e = g * g;
        var j = h.start();
        while (j) {
            if (!j.fixed && !j.disabled) {
                j.old.pos.copyFrom(j.pos);
                j.acc.multiply(j.massInv);
                b.copyFrom(j.vel);
                c.copyFrom(j.acc);
                if (this.useDeltaTime) {
                    j.pos.add(b.multiply(g)).add(c.multiply(0.5 * e));
                    j.vel.add(j.acc.multiply(g))
                } else {
                    j.pos.add(b).add(c.multiply(0.5));
                    j.vel.add(j.acc)
                }
                if (f) {
                    j.vel.multiply(f)
                }
                j.acc.clear()
            }
            if (j.saveTo) {
                j.pos.copyTo(j.saveTo)
            }
            j = h.next()
        }
    }
});
Class(function Emitter(c, e) {
    Inherit(this, Component);
    var h = this;
    var d;
    var b = 0;
    var a = c.type == "vector3" ? Vector3 : Vector2;
    this.initializers = [];
    this.position = c;
    this.autoEmit = 1;
    (function() {
        g();
        if (e != 0) {
            f(e || 100)
        }
    })();

    function g() {
        d = h.initClass(ObjectPool)
    }

    function f(l) {
        b += l;
        var k = [];
        for (var j = 0; j < l; j++) {
            k.push(new Particle())
        }
        d.insert(k)
    }
    this.addInitializer = function(j) {
        if (typeof j !== "function") {
            throw "Initializer must be a function"
        }
        this.initializers.push(j)
    };
    this.removeInitializer = function(k) {
        var j = this.initializers.indexOf(k);
        if (j > -1) {
            this.initializers.splice(j, 1)
        }
    };
    this.emit = function(l) {
        if (!this.parent) {
            throw "Emitter needs to be added to a System"
        }
        l = l || this.autoEmit;
        for (var m = 0; m < l; m++) {
            var n = d.get();
            if (!n) {
                return
            }
            n.moveTo(this.position);
            n.emitter = this;
            if (!n.system) {
                this.parent.addParticle(n)
            }
            for (var k = 0; k < this.initializers.length; k++) {
                this.initializers[k](n)
            }
        }
    };
    this.remove = function(j) {
        d.put(j);
        h.parent.removeParticle(j)
    };
    this.addToPool = function(j) {
        d.put(j)
    }
});
Class(function D3() {
    Namespace(this);
    if (THREAD) {
        return
    }
    this.CSS3D = Device.tween.css3d;
    this.m4v31 = new Vector3();
    this.m4v32 = new Vector3();
    this.m4v33 = new Vector3();
    this.UP = new Vector3(0, 1, 0);
    this.FWD = new Vector3(0, 0, -1);
    this.CENTER = new Vector3(0, 0, 0);
    this.translate = function(a, c, b) {
        a = typeof a == "string" ? a : (a || 0) + "px";
        c = typeof c == "string" ? c : (c || 0) + "px";
        b = typeof b == "string" ? b : (b || 0) + "px";
        if (Device.browser.ie) {
            a = 0;
            c = 0
        }
        return "translate3d(" + a + "," + c + "," + b + ")"
    }
}, "Static");
D3.Class(function Camera(d, c, b) {
    Inherit(this, D3.Object3D);
    var h = this;
    var a, f, e, g;
    this.inverseWorldMatrix = new Matrix4();
    (function() {
        defer(function() {
            h.scene.setProjection(d, c, b)
        })
    })();
    this.set("fov", function(j) {
        d = j;
        h.scene.setProjection(d, c, b)
    });
    this.computeInverseMatrix = function() {
        this.worldMatrix.inverse(this.inverseWorldMatrix);
        return this.inverseWorldMatrix
    };
    this.unproject = function(r) {
        if (!a) {
            e = new Vector3();
            a = new Vector3();
            f = new Matrix4();
            g = new Matrix4()
        }
        var q = h.uniforms;
        a.set((r.x / q.width) * 2 - 1, -(r.y / q.height) * 2 + 1, 40);
        g.identity();
        f.copyFrom(h.worldMatrix).multiply(q.projection.inverse(g));
        var p = a.x,
            n = a.y,
            m = a.z;
        var j = f.data;
        var k = 1 / (j[3] * p + j[7] * n + j[11] * m + j[15]);
        a.x = (j[0] * p + j[4] * n + j[8] * m + j[12]) * k;
        a.y = (j[1] * p + j[5] * n + j[9] * m + j[13]) * k;
        a.z = (j[2] * p + j[6] * n + j[10] * m + j[14]) * k;
        var o = h.position;
        a.sub(o).normalize();
        var l = (-o.z / a.z);
        e.copyFrom(o).add(a.multiply(l));
        return e
    };
    this.render = function() {}
});
D3.Class(function CSSMaterial(p) {
    Inherit(this, Component);
    var l = this;
    var f, n;
    var d, o, g, e, b, h, k;
    var c = true;
    this.material = p;
    this.width = p.width;
    this.height = p.height;
    (function() {
        j();
        m()
    })();

    function j() {
        k = new Vector3();
        h = new Vector3();
        if (Device.browser.ie) {
            p.css({
                marginLeft: -p.width / 2,
                marginTop: -p.height / 2
            })
        }
        if (D3.CSS3D) {
            return false
        }
        d = new Matrix2();
        o = new Matrix4();
        g = new Vector3()
    }

    function m() {
        n = p.element || p;
        if (p.element) {
            Render.nextFrame(function() {
                p.material = l;
                p.object = l.object
            })
        }
    }

    function a(r) {
        var t = l.object._scene.fog;
        h.subVectors(r.camera.position, k);
        var u = h.length();
        if (u > t) {
            var q = (t * 2) - t;
            u -= t;
            var s = Utils.convertRange(u, 0, q, 0, 1);
            s = Utils.clamp(s, 0, 1);
            e = 1 - s;
            n.div.style.opacity = e
        } else {
            if (e < 1) {
                n.div.style.opacity = 1;
                e = 1
            }
        }
    }
    this.set("visible", function(q) {
        c = q;
        if (q) {
            p.show()
        } else {
            p.hide()
        }
    });
    this.draw = function(q) {
        q.renderer.addChild(p)
    };
    this.remove = function() {
        if (p.destroy) {
            p.destroy()
        } else {
            if (p.remove) {
                p.remove(true)
            }
        }
    };
    this.render = function(q) {
        if (!c) {
            return
        }
        l.object.worldMatrix.extractPosition(k);
        if (l.object && l.object._scene && l.object._scene.fog) {
            a(q)
        }
        if (D3.CSS3D) {
            var w = D3.translate("-50%", "-50%", q.cssDistance);
            var v = "perspective(" + q.cssDistance + "px)";
            var s = w + " " + l.object.viewMatrix.getCSS();
            if (Device.browser.ie) {
                n.div.style[CSS.prefix("Transform")] = v + s
            } else {
                n.div.style[CSS.prefix("Transform")] = s
            }
        } else {
            q.projection.copyTo(o);
            o.multiply(l.object.viewMatrix);
            g.set(0, 0, 0);
            o.transformVector(g);
            g.x = g.x / g.z * q.centerX;
            g.y = g.y / g.z * q.centerY;
            var u = 1 / (g.z / q.cssDistance);
            var r = l.object.rotation.z;
            d.setTRS(g.x, g.y, r, u, u);
            h.subVectors(q.camera.position, k);
            var t = h.length();
            p.setZ(~~(999999 - t)).matrix("translate(-50%, -50%) " + d.getCSS());
            if (g.z <= 0 && !p._meshHidden) {
                p._meshHidden = true;
                p.hide()
            } else {
                if (g.z > 0 && p._meshHidden) {
                    p._meshHidden = false;
                    p.show()
                }
            }
        }
    }
});
D3.Class(function AbstractMaterial() {
    Inherit(this, Component);
    var c = this;
    var b = new Matrix4();
    var a = new Vector3();
    this.draw = function() {};
    this.remove = function() {};
    this.render = function(d) {
        d.projection.copyTo(b);
        b.multiply(c.object.viewMatrix);
        a.set(0, 0, 0);
        b.transformVector(a);
        a.x = a.x / a.z * d.centerX;
        a.y = a.y / a.z * d.centerY;
        a.scale = 1 / (a.z / d.cssDistance);
        a.rotation = c.object.rotation.z;
        a.x += d.centerX;
        a.y += d.centerY;
        a.x += d.offsetX;
        a.y += d.offsetY;
        if (c.object.position.z > d.camera.position.z) {
            a.x = -9999999
        }
        c.object.screen = a
    }
});
D3.Class(function Object3D(f) {
    Inherit(this, Component);
    var h = this;
    var g, c, e;
    var a = true;
    var b = new Matrix4();
    var d = new Vector3();
    this.id = Utils.timestamp();
    this.directMatrix = false;
    this.billboard = false;
    this.material = f || null;
    this.position = new Vector3(0, 0, 0);
    this.rotation = new Vector3(0, 0, 0);
    this.scale = new Vector3(1, 1, 1);
    this.matrix = new Matrix4();
    this.worldMatrix = new Matrix4();
    this.viewMatrix = new Matrix4();
    this.children = new LinkedList();
    (function() {
        if (h.material) {
            h.material.object = h
        }
    })();
    this.get("numChildren", function() {
        return h.children.length
    });
    this.get("depth", function() {
        return h.viewMatrix.data[14]
    });
    this.get("globalPosition", function() {
        h.worldMatrix.extractPosition(d);
        return d
    });
    this.get("enabled", function() {
        return a
    });
    this.set("enabled", function(j) {
        a = j;
        if (h.material) {
            h.material.visibility(a)
        }
        var k = h.children.start();
        while (k) {
            k.enabled = j;
            k = h.children.next()
        }
    });
    this.set("scene", function(j) {
        if (!j) {
            return false
        }
        e = h._scene = j;
        if (h.material) {
            h.material.draw(j)
        }
    });
    this.add = function(j) {
        if (!(j instanceof D3.Object3D)) {
            throw "Can only add D3.Object3D"
        }
        j._parent = this;
        this.children.push(j);
        Render.nextFrame(function() {
            j.scene = e
        })
    };
    this.remove = function(j) {
        if (!(j instanceof D3.Object3D)) {
            throw "Can only remove D3.Object3D"
        }
        j._parent = null;
        j.removed();
        this.children.remove(j)
    };
    this.removed = function() {
        if (this.material) {
            this.material.remove()
        }
    };
    this.empty = function() {
        var j = this.children.start();
        while (j) {
            j._parent = null;
            j.removed();
            j = this.children.next()
        }
        this.children.empty()
    };
    this.updateMatrix = function() {
        if (!this.directMatrix) {
            var l = this.position;
            var k = this.rotation;
            var j = this.scale;
            this.matrix.setTRS(l.x, l.y, l.z, k.x, k.y, k.z, j.x, j.y, j.z)
        }
        if (g) {
            this.matrix.setLookAt(g, D3.CENTER, D3.UP)
        }
        if (this._parent && this._parent.worldMatrix) {
            this._parent.worldMatrix.copyTo(this.worldMatrix);
            this.worldMatrix.multiply(this.matrix)
        } else {
            this.matrix.copyTo(this.worldMatrix)
        }
        if (c) {
            this.worldMatrix.setLookAt(c.globalPosition, D3.CENTER, D3.UP)
        }
        var m = this.children.start();
        while (m) {
            m.updateMatrix();
            m = this.children.next()
        }
    };
    this.updateView = function(j) {
        if (!a) {
            return false
        }
        if (this.billboard) {
            j.copyTo(b);
            b.transpose();
            b.copyPosition(this.worldMatrix);
            b.scale(this.scale.x, this.scale.y, this.scale.z);
            b.data[3] = 0;
            b.data[7] = 0;
            b.data[11] = 0;
            b.data[15] = 1;
            b.copyTo(this.worldMatrix)
        }
        j.copyTo(this.viewMatrix);
        this.viewMatrix.multiply(this.worldMatrix);
        var k = this.children.start();
        while (k) {
            k.updateView(j);
            k = this.children.next()
        }
    };
    this.render = function(j) {
        if (!a) {
            return false
        }
        if (this.material) {
            this.material.render(j)
        }
        var k = this.children.start();
        while (k) {
            k.render(j);
            k = this.children.next()
        }
    };
    this.lookAt = function(j) {
        if (j instanceof Vector3) {
            g = j
        } else {
            c = j
        }
    };
    this.destroy = function() {
        if (!this._destroy) {
            return
        }
        this.empty();
        if (this._parent && this._parent.remove) {
            this._parent.remove(this)
        }
        return this._destroy()
    }
});
D3.Class(function PerspectiveProjection() {
    var c = this;
    var b = PerspectiveProjection.prototype;
    this.data = new Float32Array(16);
    (function() {
        a()
    })();

    function a() {
        var d = c.data;
        d[0] = 1, d[1] = 0, d[2] = 0, d[3] = 0;
        d[4] = 0, d[5] = 1, d[6] = 0, d[7] = 0;
        d[8] = 0, d[9] = 0, d[10] = 1, d[11] = 0;
        d[12] = 0, d[13] = 0, d[14] = 0, d[15] = 1
    }
    b.identity = function() {
        a();
        return this
    };
    b.perspective = function(g, f, j, e) {
        var d = this.data;
        var h = j * Math.tan(g * Math.PI / 360);
        var k = e - j;
        d[0] = j / (h * f);
        d[4] = 0;
        d[8] = 0;
        d[12] = 0;
        d[1] = 0;
        d[5] = j / h;
        d[9] = 0;
        d[13] = 0;
        d[2] = 0;
        d[6] = 0;
        d[10] = -(e + j) / k;
        d[14] = -(2 * e * j) / k;
        d[3] = 0;
        d[7] = 0;
        d[11] = -1;
        d[15] = 0
    };
    b.transformVector = function(g, h) {
        var e = g.x,
            k = g.y,
            j = g.z,
            f = g.w;
        var d = this.data;
        h = h || g;
        h.x = d[0] * e + d[4] * k + d[8] * j + d[12] * f;
        h.y = d[1] * e + d[5] * k + d[9] * j + d[13] * f;
        h.z = d[2] * e + d[6] * k + d[10] * j + d[14] * f;
        return h
    };
    b.inverse = function(y) {
        var B = this.data;
        y = y || this.data;
        var J = B[0],
            H = B[1],
            G = B[2],
            E = B[3],
            h = B[4],
            g = B[5],
            f = B[6],
            e = B[7],
            x = B[8],
            w = B[9],
            v = B[10],
            u = B[11],
            L = B[12],
            K = B[13],
            I = B[14],
            F = B[15],
            t = J * g - H * h,
            s = J * f - G * h,
            r = J * e - E * h,
            q = H * f - G * g,
            p = H * e - E * g,
            o = G * e - E * f,
            n = x * K - w * L,
            l = x * I - v * L,
            k = x * F - u * L,
            j = w * I - v * K,
            D = w * F - u * K,
            A = v * F - u * I,
            C = (t * A - s * D + r * j + q * k - p * l + o * n),
            z;
        if (!C) {
            return null
        }
        y[0] = (g * A - f * D + e * j) * z;
        y[1] = (-H * A + G * D - E * j) * z;
        y[2] = (K * o - I * p + F * q) * z;
        y[3] = (-w * o + v * p - u * q) * z;
        y[4] = (-h * A + f * k - e * l) * z;
        y[5] = (J * A - G * k + E * l) * z;
        y[6] = (-L * o + I * r - F * s) * z;
        y[7] = (x * o - v * r + u * s) * z;
        y[8] = (h * D - g * k + e * n) * z;
        y[9] = (-J * D + H * k - E * n) * z;
        y[10] = (L * p - K * r + F * t) * z;
        y[11] = (-x * p + w * r - u * t) * z;
        y[12] = (-h * j + g * l - f * n) * z;
        y[13] = (J * j - H * l + G * n) * z;
        y[14] = (-L * q + K * s - I * t) * z;
        y[15] = (x * q - w * s + v * t) * z;
        return y
    };
    b.copyTo = function(e) {
        var f = this.data;
        var d = e.data || e;
        for (var g = 0; g < 16; g++) {
            d[g] = f[g]
        }
        return e
    }
});
D3.Class(function Scene(l, e) {
    Inherit(this, Component);
    var g = this;
    var m;
    var n, b;
    var j, c, k, h;
    this.children = new LinkedList();
    this.center = new Vector3(0, 0, 0);
    (function() {
        d();
        a();
        f()
    })();

    function d() {
        if (!l || !e) {
            throw "D3.Scene requires width, height"
        }
        if (!THREAD) {
            n = $("#Scene3D");
            b = n.create("Renderer");
            b.center();
            g.container = n;
            g.renderer = b
        }
    }

    function a() {
        m = {};
        m.projection = new D3.PerspectiveProjection();
        m.scene = g;
        m.offsetX = 0;
        m.offsetY = 0;
        g.uniforms = m
    }

    function f() {
        m.width = l;
        m.height = e;
        m.aspect = l / e;
        m.centerX = l / 2;
        m.centerY = e / 2;
        if (n) {
            n.size(l, e)
        }
    }
    this.get("numChildren", function() {
        return g.children.length
    });
    this.get("distance", function() {
        return m.cssDistance
    });
    this.setProjection = function(p, q, o) {
        j = p || (j || 30);
        c = q || 0.1;
        k = o || 1000;
        m.cssDistance = 0.5 / Math.tan(j * Math.PI / 360) * m.height;
        m.projection.perspective(j, m.width / m.height, c, k);
        if (n) {
            n.div.style[CSS.prefix("Perspective")] = m.cssDistance + "px";
            b.div.style[CSS.prefix("TransformStyle")] = "preserve-3d"
        }
    };
    this.resize = function(o, p) {
        l = o;
        e = p;
        f();
        g.setProjection()
    };
    this.add = function(o) {
        if (!(o instanceof D3.Object3D) && !(o instanceof D3.Camera)) {
            throw "Can only add D3.Object3D"
        }
        o._parent = this;
        o.scene = this;
        this.children.push(o)
    };
    this.remove = function(o) {
        if (!(o instanceof D3.Object3D) && !(o instanceof D3.Camera)) {
            throw "Can only remove D3.Object3D"
        }
        o.removed();
        o._parent = null;
        this.children.remove(o)
    };
    this.empty = function() {
        var o = this.children.start();
        while (o) {
            o.removed();
            o = this.children.next()
        }
        this.children.empty()
    };
    this.offset = function(o, p) {
        m.offsetX = o;
        m.offsetY = p
    };
    this.render = function(o) {
        o.updateMatrix();
        m.camera = o;
        m.viewMatrix = o.computeInverseMatrix();
        o.uniforms = m;
        var p = this.children.start();
        while (p) {
            p.updateMatrix();
            p.updateView(m.viewMatrix);
            p.render(m);
            p = this.children.next()
        }
    }
});
Class(function SplitTextfield() {
    var a = {
        display: "block",
        position: "relative",
        padding: 0,
        margin: 0,
        cssFloat: "left",
        styleFloat: "left",
        width: "auto",
        height: "auto"
    };

    function c(j) {
        var f = [];
        var h = j.div.innerHTML;
        var e = h.split("");
        j.div.innerHTML = "";
        for (var d = 0; d < e.length; d++) {
            if (e[d] == " ") {
                e[d] = "&nbsp;"
            }
            var g = $("t", "span");
            g.html(e[d], true).css(a);
            f.push(g);
            j.addChild(g)
        }
        return f
    }

    function b(k) {
        var f = [];
        var j = k.div.innerHTML;
        var e = j.split(" ");
        k.empty();
        for (var d = 0; d < e.length; d++) {
            var h = $("t", "span");
            var g = $("t", "span");
            h.html(e[d]).css(a);
            g.html("&nbsp", true).css(a);
            f.push(h);
            f.push(g);
            k.addChild(h);
            k.addChild(g)
        }
        return f
    }
    this.split = function(e, d) {
        if (d == "word") {
            return b(e)
        } else {
            return c(e)
        }
    }
}, "Static");
Class(function CSSFilter(k, d, h) {
    Inherit(this, Component);
    var f = this;
    var g = "";
    var b = ["grayscale", "sepia", "saturate", "hue", "invert", "opacity", "brightness", "contrast", "blur"];
    var j, a;

    function c(n) {
        for (var m = b.length - 1; m > -1; m--) {
            if (b[m] == n) {
                return true
            }
        }
        return false
    }

    function l() {
        var q = "";
        var m = b.length - 1;
        for (var n in f) {
            if (!c(n)) {
                continue
            }
            var o = n;
            var p = f[n];
            if (typeof p === "number") {
                o = o == "hue" ? "hue-rotate" : o;
                p = o == "hue-rotate" ? p + "deg" : p;
                p = o == "blur" ? p + "px" : p;
                q += o + "(" + p + ") "
            }
        }
        g = q
    }

    function e() {
        if (a || !k || !k.div) {
            return false
        }
        k.div.style[CSS.prefix("Transition")] = ""
    }
    this.apply = function() {
        l();
        k.div.style[CSS.prefix("Filter")] = g
    };
    this.tween = function(o, p, q, m, r) {
        if (typeof m === "function") {
            r = m;
            m = 0
        }
        m = m || 0;
        j = false;
        var n = "-" + Device.styles.vendor.toLowerCase() + "-filter";
        k.willChange(n);
        Render.setupTween(function() {
            if (j) {
                return
            }
            k.div.style[CSS.prefix("Transition")] = n + " " + p + "ms " + TweenManager.getEase(q) + " " + m + "ms";
            for (var s in o) {
                f[s] = o[s]
            }
            a = f.delayedCall(function() {
                k.willChange(null);
                if (r) {
                    r()
                }
            }, p + m);
            f.apply()
        })
    };
    this.stopTween = function() {
        clearTimeout(a);
        j = true;
        e()
    };
    this.clear = function() {
        for (var m in f) {
            if (c(m)) {
                delete f[m]
            }
        }
        if (a) {
            this.stopTween()
        }
        this.apply()
    };
    this.destroy = function() {
        this.clear();
        k = null;
        a = null;
        return this._destroy()
    }
});
Class(function CSSAnimation() {
    Inherit(this, Component);
    var k = this;
    var p = "a" + Utils.timestamp();
    var c, h, l;
    var j = 1000;
    var a = "linear";
    var m = 0;
    var e = false;
    var n = 1;
    var q = null;
    var d = [];
    (function() {})();

    function b() {
        k.playing = false;
        if (k.events) {
            k.events.fire(HydraEvents.COMPLETE, null, true)
        }
    }

    function f() {
        var w = CSS._read();
        var r = "/*" + p + "*/";
        var F = "@" + Device.vendor + "keyframes " + p + " {\n";
        var x = r + F;
        if (w.strpos(p)) {
            var z = w.split(r);
            w = w.replace(r + z[1] + r, "")
        }
        var B = c.length - 1;
        var C = Math.round(100 / B);
        var A = 0;
        for (var v = 0; v < c.length; v++) {
            var t = c[v];
            if (v == c.length - 1) {
                A = 100
            }
            x += (t.percent || A) + "% {\n";
            var s = false;
            var y = {};
            var E = {};
            for (var D in t) {
                if (TweenManager.checkTransform(D)) {
                    y[D] = t[D];
                    s = true
                } else {
                    E[D] = t[D]
                }
            }
            if (s) {
                x += Device.vendor + "transform: " + TweenManager.parseTransform(y) + ";"
            }
            for (D in E) {
                var u = E[D];
                if (typeof u !== "string" && D != "opacity" && D != "zIndex") {
                    u += "px"
                }
                x += CSS._toCSS(D) + ": " + u + ";"
            }
            x += "\n}\n";
            A += C
        }
        x += "}" + r;
        w += x;
        CSS._write(w)
    }

    function o() {
        var s = CSS._read();
        var t = "/*" + p + "*/";
        if (s.strpos(p)) {
            var r = s.split(t);
            s = s.replace(t + r[1] + t, "")
        }
        CSS._write(s)
    }

    function g(s) {
        for (var r = d.length - 1; r > -1; r--) {
            s(d[r])
        }
    }
    this.set("frames", function(r) {
        c = r;
        f()
    });
    this.set("steps", function(r) {
        q = r;
        if (k.playing) {
            g(function(s) {
                s.div.style[CSS.prefix("AnimationTimingFunction")] = "steps(" + r + ")"
            })
        }
    });
    this.set("duration", function(r) {
        j = Math.round(r);
        if (k.playing) {
            g(function(s) {
                s.div.style[CSS.prefix("AnimationDuration")] = k.duration + "ms"
            })
        }
    });
    this.get("duration", function() {
        return j
    });
    this.set("ease", function(r) {
        a = r;
        if (k.playing) {
            g(function(s) {
                s.div.style[CSS.prefix("AnimationTimingFunction")] = TweenManager.getEase(a)
            })
        }
    });
    this.get("ease", function() {
        return a
    });
    this.set("loop", function(r) {
        e = r;
        if (k.playing) {
            g(function(s) {
                s.div.style[CSS.prefix("AnimationIterationCount")] = e ? "infinite" : n
            })
        }
    });
    this.get("loop", function() {
        return e
    });
    this.set("count", function(r) {
        n = r;
        if (k.playing) {
            g(function(s) {
                s.div.style[CSS.prefix("AnimationIterationCount")] = e ? "infinite" : n
            })
        }
    });
    this.get("count", function() {
        return n
    });
    this.set("delay", function(r) {
        m = r;
        if (k.playing) {
            g(function(s) {
                s.div.style[CSS.prefix("AnimationDelay")] = m + "ms"
            })
        }
    });
    this.get("delay", function() {
        return m
    });
    this.play = function() {
        g(function(r) {
            r.div.style[CSS.prefix("AnimationName")] = p;
            r.div.style[CSS.prefix("AnimationDuration")] = k.duration + "ms";
            r.div.style[CSS.prefix("AnimationTimingFunction")] = q ? "steps(" + q + ")" : TweenManager.getEase(a);
            r.div.style[CSS.prefix("AnimationIterationCount")] = e ? "infinite" : n;
            r.div.style[CSS.prefix("AnimationPlayState")] = "running";
            r.div.style[CSS.prefix("AnimationDelay")] = m + "ms"
        });
        k.playing = true;
        clearTimeout(h);
        if (!k.loop) {
            l = Date.now();
            h = k.delayedCall(b, n * j)
        }
    };
    this.pause = function() {
        k.playing = false;
        clearTimeout(h);
        g(function(r) {
            r.div.style[CSS.prefix("AnimationPlayState")] = "paused"
        })
    };
    this.stop = function() {
        k.playing = false;
        clearTimeout(h);
        g(function(r) {
            r.div.style[CSS.prefix("AnimationName")] = ""
        })
    };
    this.applyTo = function(r) {
        d.push(r);
        if (k.playing) {
            r.div.style[CSS.prefix("AnimationName")] = p;
            r.div.style[CSS.prefix("AnimationDuration")] = k.duration + "ms";
            r.div.style[CSS.prefix("AnimationTimingFunction")] = q ? "steps(" + q + ")" : TweenManager.getEase(a);
            r.div.style[CSS.prefix("AnimationIterationCount")] = e ? "infinite" : n;
            r.div.style[CSS.prefix("AnimationPlayState")] = "running"
        }
    };
    this.remove = function(s) {
        s.div.style[CSS.prefix("AnimationName")] = "";
        var r = d.indexOf(s);
        if (r > -1) {
            d.splice(r, 1)
        }
    };
    this.destroy = function() {
        this.stop();
        c = null;
        o();
        return this._destroy()
    }
});
Class(function Warp(n, c) {
    Inherit(this, Component);
    var g = this;
    var o, f, d;
    this.useCSS = c;
    this.points = [new Vector2(), new Vector2(), new Vector2(), new Vector2()];
    this.tl = this.points[0];
    this.tr = this.points[1];
    this.bl = this.points[2];
    this.br = this.points[3];

    function h() {
        if (g.points[1].x == 0) {
            g.points[1].x = g.width
        }
        if (g.points[2].y == 0) {
            g.points[2].y = g.height
        }
        if (g.points[3].x == 0) {
            g.points[3].x = g.width
        }
        if (g.points[3].y == 0) {
            g.points[3].y = g.height
        }
    }

    function m(A, p, F, v, G, w, t, C, u, D, z, q, B, r, H, x) {
        var y = b(A, p, G, w, u, D, B, r);
        var E = b(F, v, t, C, z, q, H, x);
        return j(E, k(y))
    }

    function b(r, x, q, w, p, u, z, t) {
        var s = [r, q, p, x, w, u, 1, 1, 1];
        var y = e(k(s), [z, t, 1]);
        return j(s, [y[0], 0, 0, 0, y[1], 0, 0, 0, y[2]])
    }

    function k(p) {
        return [p[4] * p[8] - p[5] * p[7], p[2] * p[7] - p[1] * p[8], p[1] * p[5] - p[2] * p[4], p[5] * p[6] - p[3] * p[8], p[0] * p[8] - p[2] * p[6], p[2] * p[3] - p[0] * p[5], p[3] * p[7] - p[4] * p[6], p[1] * p[6] - p[0] * p[7], p[0] * p[4] - p[1] * p[3]]
    }

    function j(q, p) {
        var v = Array(9);
        for (var u = 0; u != 3; ++u) {
            for (var s = 0; s != 3; ++s) {
                var t = 0;
                for (var r = 0; r != 3; ++r) {
                    t += q[3 * u + r] * p[3 * r + s]
                }
                v[3 * u + s] = t
            }
        }
        return v
    }

    function e(p, q) {
        return [p[0] * q[0] + p[1] * q[1] + p[2] * q[2], p[3] * q[0] + p[4] * q[1] + p[5] * q[2], p[6] * q[0] + p[7] * q[1] + p[8] * q[2]]
    }

    function a(B, A, u) {
        var r = B[0].x;
        var z = B[0].y;
        var q = B[1].x;
        var y = B[1].y;
        var p = B[2].x;
        var x = B[2].y;
        var D = B[3].x;
        var v = B[3].y;
        var C = m(0, 0, r, z, A, 0, q, y, 0, u, p, x, A, u, D, v);
        for (var s = 0; s < 9; s++) {
            C[s] = C[s] / C[8]
        }
        C = [C[0], C[3], 0, C[6], C[1], C[4], 0, C[7], 0, 0, 1, 0, C[2], C[5], 0, C[8]];
        if (Mobile.os == "iOS" || Device.browser.safari) {
            for (var s = 0; s < C.length; s++) {
                C[s] = C[s].toFixed(8)
            }
        }
        C = "matrix3d(" + C.join(", ") + ")";
        return C
    }

    function l(r, s) {
        f = false;
        var p = a(g.points, g.width, g.height);
        var q = Device.transformProperty + " " + r + "ms " + TweenManager.getEase(s) + " 0ms";
        n.div.style[Device.styles.vendorTransition] = q;
        n.div.style[Device.styles.vendorTransform] = p;
        g.delayedCall(function() {
            if (d) {
                d()
            }
            d = null;
            if (n.willChange) {
                n.willChange(false);
                n.div.style[Device.styles.vendorTransition] = ""
            }
        }, r)
    }(function() {})();
    this.render = function() {
        var p = Render.TIME;
        if (p - o < 5 || !g.points || !n.div) {
            return false
        }
        o = p;
        if (!g.width) {
            g.width = n.width;
            g.height = n.height;
            n.transformPoint(0, 0);
            if (!g.width) {
                throw "Warp requires width and height"
            }
            h()
        }
        n.div.style[CSS.prefix("Transform")] = a(g.points, g.width, g.height)
    };
    this.tween = function(q, t, v, w, s, r) {
        if (!this.points) {
            return
        }
        if (typeof s !== "number") {
            r = s;
            s = 0
        }
        var u;
        switch (q) {
            case "tl":
                u = this.points[0];
                break;
            case "tr":
                u = this.points[1];
                break;
            case "bl":
                u = this.points[2];
                break;
            case "br":
                u = this.points[3];
                break;
            default:
                throw q + "not found on WarpView. Only tl, tr, bl, br accepted.";
                break
        }
        if (this.useCSS) {
            if (!f) {
                n.willChange(Device.transformProperty);
                f = true;
                g.render();
                Render.setupTween(function() {
                    l(v, w)
                })
            }
            if (r) {
                d = r
            }
            u.copyFrom(t)
        } else {
            return TweenManager.tween(u, t, v, w, s, r, this.render)
        }
    };
    this.destroy = function() {
        this.points.forEach(function(q) {
            TweenManager.clearTween(q)
        });
        return this._destroy()
    }
});
Class(function Canvas(d, f, l) {
    Inherit(this, Component);
    var h = this;
    var q, e, j, o, a;
    this.children = [];
    this.offset = {
        x: 0,
        y: 0
    };
    this.retina = l;
    (function() {
        if (l instanceof HydraObject) {
            m(l)
        } else {
            g()
        }
        h.width = d;
        h.height = f;
        h.context._matrix = new Matrix2();
        b(d, f, l)
    })();

    function m() {
        var r = "c" + Utils.timestamp();
        h.context = document.getCSSCanvasContext("2d", r, d, f);
        h.background = "-" + Device.styles.vendor.toLowerCase() + "-canvas(" + r + ")";
        l.css({
            backgroundImage: h.background
        });
        l = null
    }

    function g() {
        h.div = document.createElement("canvas");
        h.context = h.div.getContext("2d");
        h.object = $(h.div)
    }

    function b(r, u, s) {
        var t = s && Device.system.retina ? 2 : 1;
        if (h.div) {
            h.div.width = r * t;
            h.div.height = u * t
        }
        h.width = r;
        h.height = u;
        h.scale = t;
        if (h.object) {
            h.object.size(h.width, h.height)
        }
        if (Device.system.retina && s) {
            h.context.scale(t, t);
            h.div.style.width = r + "px";
            h.div.style.height = u + "px"
        }
    }

    function p(t) {
        t = Utils.touchEvent(t);
        t.x -= h.offset.x;
        t.y -= h.offset.y;
        t.width = 1;
        t.height = 1;
        for (var r = h.children.length - 1; r > -1; r--) {
            var s = h.children[r].hit(t);
            if (s) {
                return s
            }
        }
        return false
    }

    function c(s) {
        var r = p(s);
        if (!r) {
            return h.interacting = false
        }
        h.interacting = true;
        j = r;
        if (Device.mobile) {
            r.events.fire(HydraEvents.HOVER, {
                action: "over"
            }, true);
            r.__time = Date.now()
        }
    }

    function k(s) {
        var r = p(s);
        if (r) {
            h.interacting = true
        } else {
            h.interacting = false
        }
        if (!Device.mobile) {
            if (r && e) {
                if (r != e) {
                    e.events.fire(HydraEvents.HOVER, {
                        action: "out"
                    }, true);
                    r.events.fire(HydraEvents.HOVER, {
                        action: "over"
                    }, true);
                    e = r
                }
            } else {
                if (r && !e) {
                    e = r;
                    r.events.fire(HydraEvents.HOVER, {
                        action: "over"
                    }, true)
                } else {
                    if (!r && e) {
                        if (e) {
                            e.events.fire(HydraEvents.HOVER, {
                                action: "out"
                            }, true)
                        }
                        e = null
                    }
                }
            }
        }
    }

    function n(s) {
        var r = p(s);
        if (r) {
            h.interacting = true
        } else {
            h.interacting = false
        }
        if (!j && !r) {
            return
        }
        if (!Device.mobile) {
            if (r && r == j) {
                r.events.fire(HydraEvents.CLICK, {
                    action: "click"
                }, true)
            }
        } else {
            if (j) {
                j.events.fire(HydraEvents.HOVER, {
                    action: "out"
                }, true)
            }
            if (r == j) {
                if (Date.now() - j.__time < 750) {
                    r.events.fire(HydraEvents.CLICK, {
                        action: "click"
                    }, true)
                }
            }
        }
        j = null
    }
    this.set("interactive", function(r) {
        if (!q && r) {
            Stage.bind("touchstart", c);
            Stage.bind("touchmove", k);
            Stage.bind("touchend", n)
        } else {
            if (q && !r) {
                Stage.unbind("touchstart", c);
                Stage.unbind("touchmove", k);
                Stage.unbind("touchend", n)
            }
        }
        q = r
    });
    this.get("interactive", function() {
        return q
    });
    this.toDataURL = function(r, s) {
        return h.div.toDataURL(r, s)
    };
    this.sort = function() {
        _objects.sort(function(s, r) {
            return s.z - r.z
        })
    };
    this.render = function(t) {
        if (!(typeof t === "boolean" && t)) {
            h.clear()
        }
        var r = h.children.length;
        for (var s = 0; s < r; s++) {
            h.children[s].render()
        }
    };
    this.clear = function() {
        h.context.clearRect(0, 0, h.div.width, h.div.height)
    };
    this.add = function(r) {
        r.setCanvas(this);
        r._parent = this;
        this.children.push(r);
        r._z = this.children.length
    };
    this.remove = function(s) {
        s._canvas = null;
        s._parent = null;
        var r = this.children.indexOf(s);
        if (r > -1) {
            this.children.splice(r, 1)
        }
    };
    this.destroy = function() {
        if (q) {
            Stage.unbind("touchstart", c);
            Stage.unbind("touchmove", k);
            Stage.unbind("touchend", n)
        }
        this.stopRender();
        for (var r = 0; r < this.children.length; r++) {
            if (this.children[r].destroy) {
                this.children[r].destroy()
            }
        }
        return this._destroy()
    };
    this.startRender = function() {
        Render.startRender(h.render)
    };
    this.stopRender = function() {
        Render.stopRender(h.render)
    };
    this.getImageData = function(r, u, s, t) {
        this.imageData = this.context.getImageData(r || 0, u || 0, s || this.width, t || this.height);
        return this.imageData
    };
    this.getPixel = function(r, v, t) {
        if (!this.imageData || t) {
            h.getImageData(0, 0, h.width, h.height)
        }
        if (!a) {
            a = {}
        }
        var s = (r + v * h.width) * 4;
        var u = this.imageData.data;
        a.r = u[s];
        a.g = u[s + 1];
        a.b = u[s + 2];
        a.a = u[s + 3];
        return a
    };
    this.texture = function(s) {
        var r = new Image();
        r.src = s;
        return r
    };
    this.localizeMouse = function() {
        o = o || {};
        o.x = Mouse.x - h.offset.x;
        o.y = Mouse.y - h.offset.y;
        return o
    };
    this.size = b
});
Class(function CanvasTexture(b, d, f, a) {
    Inherit(this, CanvasObject);
    var h = this;
    var g;
    this.width = d || 0;
    this.height = f || 0;
    (function() {
        e()
    })();

    function e() {
        if (typeof b === "string") {
            b = CanvasTexture.createImage(b, a);
            if (b.width > 0) {
                c()
            } else {
                b.onload = c
            }
        } else {
            c()
        }
        h.texture = b
    }

    function c() {
        if (h.onload) {
            h.onload()
        }
        if (!h.width && !h.height) {
            h.width = b.width / (h._canvas && h._canvas.retina ? 2 : 1);
            h.height = b.height / (h._canvas && h._canvas.retina ? 2 : 1)
        }
    }
    this.set("texture", function(j) {
        b = j
    });
    this.draw = function(k) {
        var j = this._canvas.context;
        if (this.isMask() && !k) {
            return false
        }
        if (b) {
            this.startDraw(this.anchor.tx, this.anchor.ty, k);
            j.drawImage(b, -this.anchor.tx, -this.anchor.ty, this.width, this.height);
            this.endDraw()
        }
        if (g) {
            j.globalCompositeOperation = "source-in";
            g.render(true);
            j.globalCompositeOperation = "source-over"
        }
    };
    this.mask = function(j) {
        if (!j) {
            return g = null
        }
        if (!this._parent) {
            throw "CanvasTexture :: Must add to parent before masking."
        }
        var m = this._parent.children;
        var l = false;
        for (var k = 0; k < m.length; k++) {
            if (j == m[k]) {
                l = true
            }
        }
        if (l) {
            g = j;
            j.masked = this
        } else {
            throw "CanvasGraphics :: Can only mask a sibling"
        }
    }
}, function() {
    var a = {};
    CanvasTexture.createImage = function(d, c) {
        if (!a[d] || c) {
            var b = new Image();
            b.crossOrigin = "";
            b.src = d;
            if (c) {
                return b
            }
            a[d] = b
        }
        return a[d]
    }
});
Class(function CanvasGraphics(h, c) {
    Inherit(this, CanvasObject);
    var e = this;
    var k = {};
    var d = [];
    var a, f;
    this.width = h || 0;
    this.height = c || 0;
    (function() {
        j()
    })();

    function b(m) {
        for (var l in k) {
            var n = k[l];
            if (n instanceof Color) {
                m[l] = n.getHexString()
            } else {
                m[l] = n
            }
        }
    }

    function j() {
        a = new ObjectPool(Array, 25)
    }

    function g() {
        var m = a.get() || [];
        for (var l = 0; l < arguments.length; l++) {
            m[l] = arguments[l]
        }
        d.push(m)
    }
    this.set("strokeStyle", function(l) {
        k.strokeStyle = l
    });
    this.get("strokeStyle", function() {
        return k.strokeStyle
    });
    this.set("fillStyle", function(l) {
        k.fillStyle = l
    });
    this.get("fillStyle", function() {
        return k.fillStyle
    });
    this.set("lineWidth", function(l) {
        k.lineWidth = l
    });
    this.get("lineWidth", function() {
        return k.lineWidth
    });
    this.set("lineWidth", function(l) {
        k.lineWidth = l
    });
    this.get("lineWidth", function() {
        return k.lineWidth
    });
    this.set("lineCap", function(l) {
        k.lineCap = l
    });
    this.get("lineCap", function() {
        return k.lineCap
    });
    this.set("lineDashOffset", function(l) {
        k.lineDashOffset = l
    });
    this.get("lineDashOffset", function() {
        return k.lineDashOffset
    });
    this.set("lineJoin", function(l) {
        k.lineJoin = l
    });
    this.get("lineJoin", function() {
        return k.lineJoin
    });
    this.set("lineJoin", function(l) {
        k.lineJoin = l
    });
    this.get("lineJoin", function() {
        return k.lineJoin
    });
    this.set("lineJoin", function(l) {
        k.lineJoin = l
    });
    this.get("lineJoin", function() {
        return k.lineJoin
    });
    this.set("miterLimit", function(l) {
        k.miterLimit = l
    });
    this.get("miterLimit", function() {
        return k.miterLimit
    });
    this.set("font", function(l) {
        k.font = l
    });
    this.get("font", function(l) {
        return k.font
    });
    this.set("textAlign", function(l) {
        k.textAlign = l
    });
    this.get("textAlign", function(l) {
        return k.textAlign
    });
    this.set("textBaseline", function(l) {
        k.textBaseline = l
    });
    this.get("textBaseline", function(l) {
        return k.textBaseline
    });
    this.draw = function(n) {
        if (this.isMask() && !n) {
            return false
        }
        var m = this._canvas.context;
        this.startDraw(-this.anchor.tx, -this.anchor.ty);
        b(m);
        for (var l = 0; l < d.length; l++) {
            var p = d[l];
            if (!p) {
                continue
            }
            var o = p.shift();
            m[o].apply(m, p);
            p.unshift(o)
        }
        this.endDraw();
        if (f) {
            m.save();
            m.clip();
            f.render(true);
            m.restore()
        }
    };
    this.clear = function() {
        for (var l = 0; l < d.length; l++) {
            d[l].length = 0;
            a.put(d[l])
        }
        d.length = 0
    };
    this.arc = function(n, q, o, m, p, l) {
        if (n && !q) {
            o = n;
            n = 0;
            q = 0
        }
        n = n || 0;
        q = q || 0;
        o = o || 0;
        o -= 90;
        l = l || false;
        p = p || 0;
        p -= 90;
        m = m ? m : this.radius || this.width / 2;
        g("beginPath");
        g("arc", n, q, m, Utils.toRadians(p), Utils.toRadians(o), l)
    };
    this.quadraticCurveTo = function(n, m, l, o) {
        g("quadraticCurveTo", n, m, l, o)
    };
    this.bezierCurveTo = function(n, m, p, o, l, q) {
        g("bezierCurveTo", n, m, p, o, l, q)
    };
    this.fillRect = function(l, o, m, n) {
        g("fillRect", l, o, m, n)
    };
    this.clearRect = function(l, o, m, n) {
        g("clearRect", l, o, m, n)
    };
    this.strokeRect = function(l, o, m, n) {
        g("strokeRect", l, o, m, n)
    };
    this.moveTo = function(l, m) {
        g("moveTo", l, m)
    };
    this.lineTo = function(l, m) {
        g("lineTo", l, m)
    };
    this.stroke = function() {
        g("stroke")
    };
    this.fill = function() {
        if (!f) {
            g("fill")
        }
    };
    this.beginPath = function() {
        g("beginPath")
    };
    this.closePath = function() {
        g("closePath")
    };
    this.fillText = function(n, l, o, m) {
        g("fillText", n, l, o, m)
    };
    this.strokeText = function(n, l, o, m) {
        g("strokeText", n, l, o, m)
    };
    this.setLineDash = function(l) {
        g("setLineDash", l)
    };
    this.mask = function(l) {
        if (!l) {
            return f = null
        }
        if (!this._parent) {
            throw "CanvasTexture :: Must add to parent before masking."
        }
        var o = this._parent.children;
        var n = false;
        for (var m = 0; m < o.length; m++) {
            if (l == o[m]) {
                n = true
            }
        }
        if (n) {
            f = l;
            l.masked = this;
            for (m = 0; m < d.length; m++) {
                if (d[m][0] == "fill" || d[m][0] == "stroke") {
                    d[m].length = 0;
                    a.put(d[m]);
                    d.splice(m, 1)
                }
            }
        } else {
            throw "CanvasGraphics :: Can only mask a sibling"
        }
    }
});
Class(function CanvasObject() {
    Inherit(this, Component);
    var a = this;
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.scale = 1;
    this.visible = true;
    this.anchor = {
        x: 0.5,
        y: 0.5
    };
    this.values = new CanvasValues();
    this.styles = new CanvasValues(true);
    this.children = [];
    this.blendMode = "normal";
    this.updateValues = function() {
        this.anchor.tx = this.anchor.x <= 1 && !this.anchor.full ? this.anchor.x * this.width : this.anchor.x;
        this.anchor.ty = this.anchor.y <= 1 && !this.anchor.full ? this.anchor.y * this.height : this.anchor.y;
        this.values.setTRSA(this.x, this.y, Utils.toRadians(this.rotation), this.scaleX || this.scale, this.scaleY || this.scale, this.alpha);
        if (this._parent.values) {
            this.values.calculate(this._parent.values)
        }
        if (this._parent.styles) {
            this.styles.calculateStyle(this._parent.styles)
        }
    };
    this.render = function(d) {
        if (!this.visible) {
            return false
        }
        this.updateValues();
        if (this.draw) {
            this.draw(d)
        }
        var b = this.children.length;
        for (var c = 0; c < b; c++) {
            this.children[c].render(d)
        }
    };
    this.startDraw = function(e, d, b) {
        var c = this._canvas.context;
        var n = this.values.data;
        var j = n[0] + (e || 0);
        var h = n[1] + (d || 0);
        if (this.styles.styled) {
            c.save()
        }
        c._matrix.setTRS(j, h, n[2], n[3], n[4]);
        if (!b) {
            c.globalCompositeOperation = this.blendMode || "normal"
        }
        var g = c._matrix.data;
        c.transform(g[0], g[3], g[1], g[4], g[2], g[5]);
        c.globalAlpha = n[5];
        if (this.styles.styled) {
            var l = this.styles.values;
            for (var k in l) {
                var f = l[k];
                if (f instanceof Color) {
                    c[k] = f.getHexString()
                } else {
                    c[k] = f
                }
            }
        }
    };
    this.endDraw = function() {
        var c = this._canvas.context;
        c._matrix.inverse();
        var b = c._matrix.data;
        if (this.styles.styled) {
            c.restore()
        } else {
            c.transform(b[0], b[3], b[1], b[4], b[2], b[5])
        }
    };
    this.add = function(b) {
        b._canvas = this._canvas;
        b._parent = this;
        this.children.push(b);
        b._z = this.children.length
    };
    this.setCanvas = function(b) {
        this._canvas = b;
        for (var c = this.children.length - 1; c > -1; c--) {
            var d = this.children[c];
            d.setCanvas(b)
        }
    };
    this.remove = function(c) {
        c._canvas = null;
        c._parent = null;
        var b = this.children.indexOf(c);
        if (b > -1) {
            this.children.splice(b, 1)
        }
    };
    this.isMask = function() {
        var b = this;
        while (b) {
            if (b.masked) {
                return true
            }
            b = b._parent
        }
        return false
    };
    this.unmask = function() {
        this.masked.mask(null);
        this.masked = null
    };
    this.setZ = function(b) {
        if (!this._parent) {
            throw "CanvasObject :: Must add to parent before setZ"
        }
        this._z = b;
        this._parent.children.sort(function(d, c) {
            return d._z - c._z
        })
    };
    this.hit = function(d) {
        if (!this.ignoreHit) {
            var c = Utils.hitTestObject(d, this.values.hit(this));
            if (c) {
                return this
            }
        }
        for (var b = this.children.length - 1; b > -1; b--) {
            var f = this.children[b];
            c = f.hit(d);
            if (c) {
                return f
            }
        }
        return false
    };
    this.destroy = function() {
        for (var b = 0; b < this.children.length; b++) {
            if (this.children[b].destroy) {
                this.children[b].destroy()
            }
        }
        return Utils.nullObject(this)
    }
});
Class(function CanvasValues(a) {
    Inherit(this, Component);
    var d = this;
    var c = {};
    var b = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    if (!a) {
        this.data = new Float32Array(6)
    } else {
        this.styled = false
    }
    this.set("shadowOffsetX", function(e) {
        d.styled = true;
        c.shadowOffsetX = e
    });
    this.get("shadowOffsetX", function() {
        return c.shadowOffsetX
    });
    this.set("shadowOffsetY", function(e) {
        d.styled = true;
        c.shadowOffsetY = e
    });
    this.get("shadowOffsetY", function() {
        return c.shadowOffsetY
    });
    this.set("shadowBlur", function(e) {
        d.styled = true;
        c.shadowBlur = e
    });
    this.get("shadowBlur", function() {
        return c.shadowBlur
    });
    this.set("shadowColor", function(e) {
        d.styled = true;
        c.shadowColor = e
    });
    this.get("shadowColor", function() {
        d.styled = true;
        return c.shadowColor
    });
    this.get("values", function() {
        return c
    });
    this.setTRSA = function(f, l, h, k, j, g) {
        var e = this.data;
        e[0] = f;
        e[1] = l;
        e[2] = h;
        e[3] = k;
        e[4] = j;
        e[5] = g
    };
    this.calculate = function(g) {
        var f = g.data;
        var e = this.data;
        e[0] = e[0] + f[0];
        e[1] = e[1] + f[1];
        e[2] = e[2] + f[2];
        e[3] = e[3] * f[3];
        e[4] = e[4] * f[4];
        e[5] = e[5] * f[5]
    };
    this.calculateStyle = function(g) {
        if (!g.styled) {
            return false
        }
        this.styled = true;
        var e = g.values;
        for (var f in e) {
            if (!c[f]) {
                c[f] = e[f]
            }
        }
    };
    this.hit = function(e) {
        b.x = this.data[0];
        b.y = this.data[1];
        b.width = e.width;
        b.height = e.height;
        return b
    }
});
Class(function GLStage(e, f, m, o) {
    Inherit(this, Component);
    var h = this;
    var k, c, b;
    var g, q, l;
    this.children = [];
    this.retina = m;
    (function() {
        p();
        d(e, f, m);
        n();
        j();
        HydraEvents.createLocalEmitter(h)
    })();

    function p() {
        k = document.createElement("canvas");
        h.div = k;
        h.object = $(k)
    }

    function n() {
        var t = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        for (var r = 0; r < t.length; r++) {
            try {
                c = k.getContext(t[r], o)
            } catch (s) {}
            if (c) {
                break
            }
        }
        for (r = 0; r < h.children.length; r++) {
            h.children[r].gl(c, h)
        }
        if (b) {
            b.gl(c, h)
        }
        c.blendFunc(c.SRC_ALPHA, c.ONE_MINUS_SRC_ALPHA);
        c.enable(c.BLEND);
        c.disable(c.DEPTH_TEST);
        if (h.fire && h.context != c) {
            h.fire("context", {
                gl: c
            })
        }
        h.context = c;
        if (l) {
            l.forEach(function(u) {
                c.getExtension(u)
            })
        }
    }

    function d(r, u, s) {
        var t = s && Device.system.retina ? 2 : 1;
        if (h.div) {
            h.div.width = r * t;
            h.div.height = u * t
        }
        h.width = r;
        h.height = u;
        h.scale = t;
        if (h.object) {
            h.object.size(h.width, h.height, true)
        }
        if (c) {
            c.viewport(0, 0, r * t, u * t)
        }
        if (b) {
            b.resize(h.width, h.height)
        }
    }

    function j() {
        k.addEventListener("webglcontextlost", a);
        k.addEventListener("webglcontextrestored", n)
    }

    function a() {
        c = null
    }
    this.size = function(t, r, s) {
        d(t, r, s);
        h.fire("resize")
    };
    this.startRender = function() {
        Render.startRender(h.render)
    };
    this.stopRender = function() {
        Render.stopRender(h.render)
    };
    this.add = function(r) {
        r.gl(c, this);
        r._parent = this;
        this.children.push(r);
        r._z = this.children.length
    };
    this.remove = function(s) {
        var r = this.children.indexOf(s);
        if (r > -1) {
            s._parent = null;
            this.children.splice(r, 1)
        }
    };
    this.render = function(r) {
        if (!c) {
            return
        }
        r = r && typeof r !== "number" ? r : null;
        if (r) {
            r._startDraw(c, h)
        }
        c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BIT);
        this.renderChildren();
        if (r) {
            r._endDraw()
        }
    };
    this.renderChildren = function() {
        for (var r = 0; r < h.children.length; r++) {
            var s = h.children[r];
            if (s.render) {
                s.render()
            }
        }
    };
    this.setClearColor = function(r, s) {
        c.clearColor(r.r, r.g, r.b, s)
    };
    this.enableExtension = function(r) {
        if (!l) {
            l = []
        }
        l.push(r);
        c.getExtension(r)
    };
    this._draw = function(s) {
        if (c.program != s.shader.program) {
            c.program = s.shader.program;
            c.useProgram(c.program)
        }
        if (s.blending == GLObject.ADDITIVE_BLENDING) {
            c.blendFunc(c.SRC_ALPHA, c.ONE)
        } else {
            c.blendFunc(c.SRC_ALPHA, c.ONE_MINUS_SRC_ALPHA)
        }
        c.uniform2f(c.getUniformLocation(c.program, "resolution"), h.width, h.height);
        s.geometry.setupBuffers(c);
        s.setupMatrices();
        s.shader.update();
        s.draw();
        var r;
        switch (s.getDrawMode()) {
            case "points":
                r = c.POINTS;
                break;
            case "wireframe":
                r = c.LINE_STRIP;
                break;
            default:
                r = c.TRIANGLES;
                break
        }
        c.drawArrays(r, 0, s.geometry._vertexCount)
    };
    this.destroy = function() {
        if (!this._destroy) {
            return
        }
        h.object.remove();
        this.stopRender();
        return this._destroy()
    }
});
Class(function GLShader(a, d) {
    var g = this;
    var c;
    this.uniforms = {
        flipY: {
            type: "f",
            value: 1
        }
    };
    (function() {
        if (a && !d) {
            d = a;
            a = null
        }
    })();

    function f() {
        if (!a && !d && GLShader.baseProgram) {
            return g.program = GLShader.baseProgram
        }
        var j = GLShaderUtil.getVertex(a);
        var h = GLShaderUtil.getFragment(d);
        if (g.processShader) {
            j = g.processShader("vertex", j);
            h = g.processShader("fragment", h)
        }
        g.vSrc = j;
        g.fSrc = h;
        g.program = b(j, h);
        if (!a && !d) {
            GLShader.baseProgram = g.program
        }
    }

    function b(l, k) {
        var m = e(c.VERTEX_SHADER, l);
        var h = e(c.FRAGMENT_SHADER, k);
        var j = c.createProgram();
        if (!j) {
            throw "Could not create WebGL program"
        }
        c.attachShader(j, m);
        c.attachShader(j, h);
        c.linkProgram(j);
        var n = c.getProgramParameter(j, c.LINK_STATUS);
        if (!n) {
            throw "Could not link program!"
        }
        return j
    }

    function e(h, k) {
        var j = c.createShader(h);
        if (!j) {
            throw "Could not create shader " + k
        }
        c.shaderSource(j, k);
        c.compileShader(j);
        var l = c.getShaderParameter(j, c.COMPILE_STATUS);
        if (!l) {
            throw "SHADER COMPILATION " + c.getShaderInfoLog(j) + " " + k
        }
        return j
    }
    this.gl = function(h) {
        c = h;
        f()
    };
    this.update = function() {
        var k = 1;
        for (var h in this.uniforms) {
            var l = this.uniforms[h];
            var j = c.getUniformLocation(c.program, h);
            switch (l.type) {
                case "f":
                    c.uniform1f(j, l.value);
                    break;
                case "v2":
                    c.uniform2f(j, l.value.x, l.value.y);
                    break;
                case "v3":
                    c.uniform3f(j, l.value.x, l.value.y, l.value.z);
                    break;
                case "v3v":
                    c.uniform3fv(j, l.value);
                    break;
                case "v2v":
                    c.uniform2fv(j, l.value);
                    break;
                case "c":
                    c.uniform3f(j, l.value.r, l.value.g, l.value.b);
                    break;
                case "t":
                    l.value.drawTexture(c, h, k++);
                    break;
                case "fv":
                    c.uniform1fv(j, l.value);
                    break
            }
        }
    };
    this.set = function(h, j) {
        TweenManager.clearTween(g.uniforms[h]);
        this.uniforms[h].value = j
    };
    this.tween = function(j, k, l, m, h, o, n) {
        TweenManager.tween(g.uniforms[j], {
            value: k
        }, l, m, h, o, n)
    };
    this.destroy = function() {
        c.deleteProgram(g.program)
    }
});
Class(function GLShaderUtil() {
    var c = this;
    var a = ["attribute vec4 position;", "attribute vec2 uv;", "uniform vec2 resolution;", "uniform float flipY;", "uniform mat4 transformMatrix;", "varying vec2 vUv;", "vec2 _position(vec2 p) {", "vec2 zeroToOne = p / resolution;", "vec2 zeroToTwo = zeroToOne * 2.0;", "vec2 clipSpace = zeroToTwo - 1.0;", "return clipSpace * vec2(1.0, -1.0 * flipY);", "}", "void main() {", "vUv = uv;", "vec4 pos = transformMatrix * position;", "pos.xy = _position(pos.xy);", "gl_Position = pos;", "}"];
    var b = ["precision mediump float;", "uniform sampler2D uTexture;", "uniform float alpha;", "varying vec2 vUv;", "void main() {", "vec4 color = texture2D(uTexture, vUv);", "gl_FragColor = color;", "}"];
    this.getFragment = function(e) {
        var d = b.join("\n");
        var f = Shaders[e + ".fs"];
        if (f) {
            d = d.split("void main")[0];
            d += f
        }
        return d
    };
    this.getVertex = function(d) {
        var f = a.join("\n");
        var e = Shaders[d + ".vs"];
        if (e) {
            f = f.split("void main")[0];
            f += e
        }
        return f
    }
}, "Static");
Class(function GLObject() {
    Inherit(this, Component);
    var d = this;
    var a, c;
    this.children = [];
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1, 1, 1);
    this.alpha = 1;
    this.globalAlpha = 1;
    this.matrix = new Matrix4();
    this.worldMatrix = new Matrix4();
    this.visible = true;
    this.useMatrix = true;

    function b() {
        var e = d._parent;
        while (e && !(e instanceof GLStage)) {
            if (!e.visible) {
                return false
            }
            e = e._parent
        }
        return d.visible
    }
    this.gl = this.init = function(g, e) {
        d = this;
        a = g;
        c = e;
        for (var f = 0; f < this.children.length; f++) {
            this.children[f].gl(a, e)
        }
    };
    this.updateMatrix = function(g) {
        if (!this.useMatrix && !g) {
            return
        }
        var h = this.position;
        var f = this.rotation;
        var e = this.scale;
        this.matrix.setTRS(h.x, h.y, h.z, f.x, f.y, f.z, e.x, e.y, e.z);
        if (this._parent && this._parent.worldMatrix) {
            this._parent.worldMatrix.copyTo(this.worldMatrix);
            this.worldMatrix.multiply(this.matrix);
            this.globalAlpha = this._parent.globalAlpha * this.alpha
        } else {
            this.matrix.copyTo(this.worldMatrix);
            this.globalAlpha = this.alpha
        }
    };
    this.setupMatrices = function() {
        var e = a.getUniformLocation(a.program, "transformMatrix");
        a.uniformMatrix4fv(e, false, d.worldMatrix.data);
        if (this.uniformMatrix) {
            for (var f in this.uniformMatrix) {
                var h = a.getUniformLocation(a.program, f);
                a.uniformMatrix4fv(h, false, this.uniformMatrix[f])
            }
        }
        var g = a.getUniformLocation(a.program, "alpha");
        a.uniform1f(g, false, d.globalAlpha)
    };
    this.add = function(e) {
        e.gl(a, c);
        e._parent = this;
        this.children.push(e);
        e._z = this.children.length
    };
    this.remove = function(f) {
        var e = this.children.indexOf(f);
        if (e > -1) {
            f._parent = null;
            this.children.splice(e, 1)
        }
    };
    this.setZ = function(e) {
        if (!this._parent) {
            return
        }
        this._z = e;
        this._parent.children.sort(function(g, f) {
            if (g._z == f._z) {
                if (g == this) {
                    return g
                }
                return f
            }
            return g._z - f._z
        })
    };
    this.render = function() {
        this.updateMatrix();
        if (this.shader && b()) {
            c._draw(this)
        }
        for (var e = 0; e < this.children.length; e++) {
            var f = this.children[e];
            f.render()
        }
    }
}, function() {
    GLObject.ADDITIVE_BLENDING = 1
});
Class(function GLTexture(j) {
    var h = this;
    var f, a, k, c, g;
    var l = j instanceof Video || j instanceof Webcam ? j : null;
    this.needsUpdate = false;
    this.wrapping = GLTexture.CLAMP_TO_EDGE;

    function b() {
        f = j instanceof GLFBO ? j.texture : a.createTexture();
        if (typeof j === "string") {
            var m = j;
            j = new Image();
            j.crossOrigin = "";
            j.src = m;
            j.onload = e
        } else {
            e()
        }
    }

    function e() {
        if (j instanceof GLFBO) {
            return g = true
        }
        if (j.div) {
            j = j.div;
            if (typeof h.dynamic === "undefined") {
                h.dynamic = true
            }
        }
        d()
    }

    function d() {
        if (l && !l.ready()) {
            return
        }
        a.bindTexture(a.TEXTURE_2D, f);
        var m = h.wrapping == GLTexture.CLAMP_TO_EDGE ? a.CLAMP_TO_EDGE : a.REPEAT;
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, m);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, m);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
        if (!h.dynamic) {
            a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, j)
        }
        g = true
    }
    this.gl = function(n, m) {
        a = n;
        k = m;
        b()
    };
    this.drawTexture = function(q, m, n) {
        if (q != a) {
            a = q;
            b()
        }
        var p = l ? l.ready() : true;
        if (!g && l && p) {
            d()
        }
        if (!g || !p) {
            return
        }
        var o = a.getUniformLocation(a.program, m);
        a.uniform1i(o, n);
        a.activeTexture(a["TEXTURE" + n]);
        a.bindTexture(a.TEXTURE_2D, f);
        if (h.needsUpdate) {
            d()
        }
        if (h.dynamic) {
            a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, j)
        }
        h.needsUpdate = false
    };
    this.update = function() {
        if (!a) {
            return
        }
        a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, j)
    };
    this.updateTexture = function(m) {
        a.deleteTexture(f);
        j = m;
        b()
    };
    this.destroy = function() {
        if (a && a.deleteTexture) {
            a.deleteTexture(f)
        }
    }
}, function() {
    GLTexture.CLAMP_TO_EDGE = 0;
    GLTexture.REPEAT_WRAPPING = 1
});
Class(function TweenManager() {
    Namespace(this);
    var f = this;
    var a = [];
    (function() {
        if (window.Hydra) {
            Hydra.ready(b)
        }
        if (window.Render) {
            Render.startRender(c)
        }
    })();

    function b() {
        f._dynamicPool = new ObjectPool(DynamicObject, 100);
        f._arrayPool = new ObjectPool(Array, 100);
        f._dynamicPool.debug = true
    }

    function c(h) {
        for (var g = 0; g < a.length; g++) {
            a[g].update(h)
        }
    }

    function e(j) {
        var g = j.split("(")[1].slice(0, -1).split(",");
        for (var h = 0; h < g.length; h++) {
            g[h] = parseFloat(g[h])
        }
        return g
    }

    function d(g) {
        var j = f.CSSEases;
        for (var h = j.length - 1; h > -1; h--) {
            if (j[h].name == g) {
                return j[h]
            }
        }
        return false
    }
    this._addMathTween = function(g) {
        a.push(g)
    };
    this._removeMathTween = function(g) {
        a.findAndRemove(g)
    };
    this._detectTween = function(h, j, k, l, g, m) {
        if (l === "spring") {
            return new SpringTween(h, j, k, l, g, m)
        }
        if (!f.useCSSTrans(j, l, h)) {
            return new FrameTween(h, j, k, l, g, m)
        } else {
            if (Device.tween.webAnimation) {
                return new CSSWebAnimation(h, j, k, l, g, m)
            } else {
                return new CSSTransition(h, j, k, l, g, m)
            }
        }
    };
    this.tween = function(m, k, l, n, h, g, o, j) {
        if (typeof h !== "number") {
            o = g;
            g = h;
            h = 0
        }
        if (n === "spring") {
            return new SpringTween(m, k, l, n, h, o, g)
        } else {
            return new MathTween(m, k, l, n, h, o, g, j)
        }
    };
    this.iterate = function(p, q, h, j, k, n, r) {
        if (typeof n !== "number") {
            r = n;
            n = 0
        }
        q = new DynamicObject(q);
        if (!p.length) {
            throw "TweenManager.iterate :: array is empty"
        }
        var o = p.length;
        for (var m = 0; m < o; m++) {
            var l = p[m];
            var g = m == o - 1 ? r : null;
            l.tween(q.copy(), h, j, n + (k * m), g)
        }
    };
    this.clearTween = function(k) {
        if (k._mathTween && k._mathTween.stop) {
            k._mathTween.stop()
        }
        if (k._mathTweens) {
            var j = k._mathTweens;
            for (var h = 0; h < j.length; h++) {
                var g = j[h];
                if (g && g.stop) {
                    g.stop()
                }
            }
            k._mathTweens = null
        }
    };
    this.clearCSSTween = function(g) {
        if (g && !g._cssTween && g.div._transition) {
            g.div.style[Device.styles.vendorTransition] = "";
            g.div._transition = false;
            g._cssTween = null
        }
    };
    this.checkTransform = function(h) {
        var g = f.Transforms.indexOf(h);
        return g > -1
    };
    this.addCustomEase = function(j) {
        var h = true;
        if (typeof j !== "object" || !j.name || !j.curve) {
            throw "TweenManager :: addCustomEase requires {name, curve}"
        }
        for (var g = f.CSSEases.length - 1; g > -1; g--) {
            if (j.name == f.CSSEases[g].name) {
                h = false
            }
        }
        if (h) {
            if (j.curve.charAt(0).toLowerCase() == "m") {
                j.path = new EasingPath(j.curve)
            } else {
                j.values = e(j.curve)
            }
            f.CSSEases.push(j)
        }
        return j
    };
    this.getEase = function(h, g) {
        if (Array.isArray(h)) {
            var k = d(h[0]);
            var j = d(h[1]);
            if (!k || !j) {
                throw "Multi-ease tween missing values " + JSON.stringify(h)
            }
            if (!k.values) {
                k.values = e(k.curve)
            }
            if (!j.values) {
                j.values = e(j.curve)
            }
            if (g) {
                return [k.values[0], k.values[1], j.values[2], j.values[3]]
            }
            return "cubic-bezier(" + k.values[0] + "," + k.values[1] + "," + j.values[2] + "," + j.values[3] + ")"
        } else {
            var l = d(h);
            if (!l) {
                return false
            }
            if (g) {
                return l.path ? l.path.solve : l.values
            } else {
                return l.curve
            }
        }
    };
    this.inspectEase = function(g) {
        return d(g)
    };
    this.getAllTransforms = function(g) {
        var k = {};
        for (var h = f.Transforms.length - 1; h > -1; h--) {
            var j = f.Transforms[h];
            var l = g[j];
            if (l !== 0 && typeof l === "number") {
                k[j] = l
            }
        }
        return k
    };
    this.parseTransform = function(j) {
        var h = "";
        var l = "";
        if (j.perspective > 0) {
            h += "perspective(" + j.perspective + "px)"
        }
        if (typeof j.x !== "undefined" || typeof j.y !== "undefined" || typeof j.z !== "undefined") {
            var g = (j.x || 0);
            var m = (j.y || 0);
            var k = (j.z || 0);
            l += g + "px, ";
            l += m + "px";
            if (Device.tween.css3d) {
                l += ", " + k + "px";
                h += "translate3d(" + l + ")"
            } else {
                h += "translate(" + l + ")"
            }
        }
        if (typeof j.scale !== "undefined") {
            h += "scale(" + j.scale + ")"
        } else {
            if (typeof j.scaleX !== "undefined") {
                h += "scaleX(" + j.scaleX + ")"
            }
            if (typeof j.scaleY !== "undefined") {
                h += "scaleY(" + j.scaleY + ")"
            }
        }
        if (typeof j.rotation !== "undefined") {
            h += "rotate(" + j.rotation + "deg)"
        }
        if (typeof j.rotationX !== "undefined") {
            h += "rotateX(" + j.rotationX + "deg)"
        }
        if (typeof j.rotationY !== "undefined") {
            h += "rotateY(" + j.rotationY + "deg)"
        }
        if (typeof j.rotationZ !== "undefined") {
            h += "rotateZ(" + j.rotationZ + "deg)"
        }
        if (typeof j.skewX !== "undefined") {
            h += "skewX(" + j.skewX + "deg)"
        }
        if (typeof j.skewY !== "undefined") {
            h += "skewY(" + j.skewY + "deg)"
        }
        return h
    };
    this.interpolate = function(g, j, k) {
        var h = f.Interpolation.convertEase(k);
        return g * (typeof h == "function" ? h(j) : f.Interpolation.solve(h, j))
    };
    this.interpolateValues = function(l, g, j, k) {
        var h = f.Interpolation.convertEase(k);
        return l + (g - l) * (typeof h == "function" ? h(j) : f.Interpolation.solve(h, j))
    }
}, "Static");
(function() {
    TweenManager.Transforms = ["scale", "scaleX", "scaleY", "x", "y", "z", "rotation", "rotationX", "rotationY", "rotationZ", "skewX", "skewY", "perspective", ];
    TweenManager.CSSEases = [{
        name: "easeOutCubic",
        curve: "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
    }, {
        name: "easeOutQuad",
        curve: "cubic-bezier(0.250, 0.460, 0.450, 0.940)"
    }, {
        name: "easeOutQuart",
        curve: "cubic-bezier(0.165, 0.840, 0.440, 1.000)"
    }, {
        name: "easeOutQuint",
        curve: "cubic-bezier(0.230, 1.000, 0.320, 1.000)"
    }, {
        name: "easeOutSine",
        curve: "cubic-bezier(0.390, 0.575, 0.565, 1.000)"
    }, {
        name: "easeOutExpo",
        curve: "cubic-bezier(0.190, 1.000, 0.220, 1.000)"
    }, {
        name: "easeOutCirc",
        curve: "cubic-bezier(0.075, 0.820, 0.165, 1.000)"
    }, {
        name: "easeOutBack",
        curve: "cubic-bezier(0.175, 0.885, 0.320, 1.275)"
    }, {
        name: "easeInCubic",
        curve: "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
    }, {
        name: "easeInQuad",
        curve: "cubic-bezier(0.550, 0.085, 0.680, 0.530)"
    }, {
        name: "easeInQuart",
        curve: "cubic-bezier(0.895, 0.030, 0.685, 0.220)"
    }, {
        name: "easeInQuint",
        curve: "cubic-bezier(0.755, 0.050, 0.855, 0.060)"
    }, {
        name: "easeInSine",
        curve: "cubic-bezier(0.470, 0.000, 0.745, 0.715)"
    }, {
        name: "easeInCirc",
        curve: "cubic-bezier(0.600, 0.040, 0.980, 0.335)"
    }, {
        name: "easeInBack",
        curve: "cubic-bezier(0.600, -0.280, 0.735, 0.045)"
    }, {
        name: "easeInOutCubic",
        curve: "cubic-bezier(0.645, 0.045, 0.355, 1.000)"
    }, {
        name: "easeInOutQuad",
        curve: "cubic-bezier(0.455, 0.030, 0.515, 0.955)"
    }, {
        name: "easeInOutQuart",
        curve: "cubic-bezier(0.770, 0.000, 0.175, 1.000)"
    }, {
        name: "easeInOutQuint",
        curve: "cubic-bezier(0.860, 0.000, 0.070, 1.000)"
    }, {
        name: "easeInOutSine",
        curve: "cubic-bezier(0.445, 0.050, 0.550, 0.950)"
    }, {
        name: "easeInOutExpo",
        curve: "cubic-bezier(1.000, 0.000, 0.000, 1.000)"
    }, {
        name: "easeInOutCirc",
        curve: "cubic-bezier(0.785, 0.135, 0.150, 0.860)"
    }, {
        name: "easeInOutBack",
        curve: "cubic-bezier(0.680, -0.550, 0.265, 1.550)"
    }, {
        name: "easeInOut",
        curve: "cubic-bezier(.42,0,.58,1)"
    }, {
        name: "linear",
        curve: "linear"
    }];
    TweenManager.useCSSTrans = function(b, c, a) {
        if (b.math) {
            return false
        }
        if (typeof c === "string" && (c.strpos("Elastic") || c.strpos("Bounce"))) {
            return false
        }
        if (a.multiTween || TweenManager.inspectEase(c).path) {
            return false
        }
        if (!Device.tween.transition) {
            return false
        }
        return true
    }
})();
Class(function CSSTransition(g, p, t, f, k, j) {
    var o = this;
    var e, l, q, b;
    var h, u;
    this.playing = true;
    (function() {
        if (typeof t !== "number") {
            throw "CSSTween Requires object, props, time, ease"
        }
        d();
        if (typeof f == "object" && !Array.isArray(f)) {
            w()
        } else {
            a()
        }
    })();

    function v() {
        return !o || o.kill || !g || !g.div
    }

    function d() {
        var x = TweenManager.getAllTransforms(g);
        var z = [];
        for (var y in p) {
            if (TweenManager.checkTransform(y)) {
                x.use = true;
                x[y] = p[y];
                delete p[y]
            } else {
                if (typeof p[y] === "number" || y.strpos("-")) {
                    z.push(y)
                }
            }
        }
        if (x.use) {
            z.push(Device.transformProperty)
        }
        delete x.use;
        e = x;
        l = z
    }

    function w() {
        r();
        var y = 0;
        var D = function(P, J, N, O, M, K) {
            var L = M[H];
            if (L) {
                P += L
            }
            return TweenManager.interpolateValues(P, J, N, O)
        };
        q = [];
        b = 0;
        for (var z in f) {
            var G = z.strpos("%") ? Number(z.replace("%", "")) / 100 : ((Number(z) + 1) / f.length);
            if (isNaN(G)) {
                continue
            }
            var C = f[z];
            b++;
            var A = {};
            var F = {};
            var I = q[q.length - 1];
            var x = I ? I.props : {};
            var E = !I;
            for (var H in e) {
                if (!h[H]) {
                    h[H] = H.strpos("scale") ? 1 : 0
                }
                A[H] = D(h[H], e[H], G, C, x, H);
                if (E) {
                    x[H] = h[H]
                }
            }
            for (H in p) {
                F[H] = D(u[H], p[H], G, C, x, H);
                if (E) {
                    x[H] = u[H]
                }
            }
            var B = (G * t) - y;
            y += B;
            q.push({
                percent: G,
                ease: C,
                transform: A,
                props: F,
                delay: b == 1 ? k : 0,
                time: B
            })
        }
        a(q.shift())
    }

    function r() {
        h = TweenManager.getAllTransforms(g);
        var x = TweenManager.parseTransform(h);
        if (!x.length) {
            for (var z = TweenManager.Transforms.length - 1; z > -1; z--) {
                var y = TweenManager.Transforms[z];
                h[y] = y == "scale" ? 1 : 0
            }
        }
        u = {};
        for (y in p) {
            u[y] = g.css(y)
        }
    }

    function a(y) {
        if (v()) {
            return
        }
        if (g._cssTween) {
            g._cssTween.kill = true
        }
        g._cssTween = o;
        g.div._transition = true;
        var x = (function() {
            if (!y) {
                return s(t, f, k)
            } else {
                return s(y.time, y.ease, y.delay)
            }
        })();
        g.willChange(x.props);
        var C = y ? y.time : t;
        var z = y ? y.delay : k;
        var B = y ? y.props : p;
        var A = y ? y.transform : e;
        Render.setupTween(function() {
            if (v()) {
                return
            }
            g.div.style[Device.styles.vendorTransition] = x.transition;
            o.playing = true;
            if (Device.browser.safari) {
                Render.setupTween(function() {
                    if (v()) {
                        return
                    }
                    g.css(B);
                    g.transform(A)
                })
            } else {
                g.css(B);
                g.transform(A)
            }
            Timer.create(function() {
                if (v()) {
                    return
                }
                if (!q) {
                    c();
                    if (j) {
                        j()
                    }
                } else {
                    m()
                }
            }, C + z)
        })
    }

    function m() {
        if (v()) {
            return
        }
        var y = q.shift();
        if (!y) {
            c();
            if (j) {
                j
            }
        } else {
            var x = s(y.time, y.ease, y.delay);
            g.div.style[Device.styles.vendorTransition] = x.transition;
            g.css(y.props);
            g.transform(y.transform);
            Timer.create(m, y.time)
        }
    }

    function s(C, E, z) {
        var B = "";
        var D = "";
        var x = l.length;
        for (var A = 0; A < x; A++) {
            var y = l[A];
            B += (B.length ? ", " : "") + y;
            D += (D.length ? ", " : "") + y + " " + C + "ms " + TweenManager.getEase(E) + " " + z + "ms"
        }
        return {
            props: B,
            transition: D
        }
    }

    function c() {
        if (v()) {
            return
        }
        o.playing = false;
        g._cssTween = null;
        g.willChange(null);
        g = p = null;
        o = null;
        Utils.nullObject(this)
    }

    function n() {
        if (!j && o.playing) {
            c()
        }
    }
    this.stop = function() {
        if (!this.playing) {
            return
        }
        this.kill = true;
        this.playing = false;
        g.div.style[Device.styles.vendorTransition] = "";
        g.div._transition = false;
        g.willChange(null);
        g._cssTween = null;
        o = null;
        Utils.nullObject(this)
    }
});
Class(function FrameTween(h, s, u, f, n, m, l) {
    var q = this;
    var v, c, j, x;
    var r, a, e;
    var d, g;
    this.playing = true;
    (function() {
        if (typeof f === "object") {
            f = "easeOutCubic"
        }
        if (h && s) {
            if (typeof u !== "number") {
                throw "FrameTween Requires object, props, time, ease"
            }
            t();
            b()
        }
    })();

    function w() {
        return q.kill || !h || !h.div
    }

    function t() {
        if (s.math) {
            delete s.math
        }
        if (Device.tween.transition && h.div._transition) {
            h.div.style[Device.styles.vendorTransition] = "";
            h.div._transition = false
        }
        v = new DynamicObject();
        c = new DynamicObject();
        j = new DynamicObject();
        x = new DynamicObject();
        if (!h.multiTween) {
            if (typeof s.x === "undefined") {
                s.x = h.x
            }
            if (typeof s.y === "undefined") {
                s.y = h.y
            }
            if (typeof s.z === "undefined") {
                s.z = h.z
            }
        }
        for (var z in s) {
            if (TweenManager.checkTransform(z)) {
                r = true;
                j[z] = h[z] || (z == "scale" ? 1 : 0);
                c[z] = s[z]
            } else {
                a = true;
                var y = s[z];
                if (typeof y === "string") {
                    h.div.style[z] = y
                } else {
                    if (typeof y === "number") {
                        x[z] = Number(h.css(z));
                        v[z] = y
                    }
                }
            }
        }
    }

    function b() {
        if (h._cssTween && !l && !h.multiTween) {
            h._cssTween.kill = true
        }
        if (h.multiTween) {
            if (!h._cssTweens) {
                h._cssTweens = []
            }
            h._cssTweens.push(q)
        }
        h._cssTween = q;
        q.playing = true;
        s = x.copy();
        e = j.copy();
        if (a) {
            d = TweenManager.tween(s, v, u, f, n, p, k, l)
        }
        if (r) {
            g = TweenManager.tween(e, c, u, f, n, (!a ? p : null), (!a ? k : null), l)
        }
    }

    function o() {
        if (h._cssTweens) {
            h._cssTweens.findAndRemove(q)
        }
        q.playing = false;
        h._cssTween = null;
        h = s = null
    }

    function k() {
        if (w()) {
            return
        }
        if (a) {
            h.css(s)
        }
        if (r) {
            if (h.multiTween) {
                for (var y in e) {
                    if (typeof e[y] === "number") {
                        h[y] = e[y]
                    }
                }
                h.transform()
            } else {
                h.transform(e)
            }
        }
    }

    function p() {
        if (q.playing) {
            o();
            if (m) {
                m()
            }
        }
    }
    this.stop = function() {
        if (!this.playing) {
            return
        }
        if (d && d.stop) {
            d.stop()
        }
        if (g && g.stop) {
            g.stop()
        }
        o()
    };
    this.interpolate = function(y) {
        if (d) {
            d.interpolate(y)
        }
        if (g) {
            g.interpolate(y)
        }
        k()
    };
    this.setEase = function(y) {
        if (d) {
            d.setEase(y)
        }
        if (g) {
            g.setEase(y)
        }
    }
});
Class(function CSSWebAnimation(j, s, z, e, m, l) {
    var r = this;
    var x, w, f, v;
    var p, h, c, k;
    (function() {
        if (j._cssTween) {
            j._cssTween.stop()
        }
        d();
        t();
        y();
        u();
        Render.setupTween(b)
    })();

    function d() {
        var D = [];
        var B = false;
        for (var C in s) {
            if (TweenManager.checkTransform(C)) {
                B = true
            } else {
                if (typeof s[C] === "number" || C.strpos("-")) {
                    D.push(C)
                }
            }
        }
        if (B) {
            D.push(Device.transformProperty)
        }
        j.willChange(D);
        if (j._cssTween) {
            j._cssTween.kill = true
        }
        j._cssTween = r;
        j.div._transition = true
    }

    function t() {
        var B = TweenManager.getAllTransforms(j);
        for (var C in s) {
            if (TweenManager.checkTransform(C)) {
                B[C] = s[C];
                delete s[C]
            }
        }
        c = B;
        x = TweenManager.parseTransform(B)
    }

    function y() {
        k = TweenManager.getAllTransforms(j);
        var B = TweenManager.parseTransform(k);
        if (!B.length) {
            B = "translate3d(0, 0, 0)";
            for (var D = TweenManager.Transforms.length - 1; D > -1; D--) {
                var C = TweenManager.Transforms[D];
                k[C] = C == "scale" ? 1 : 0
            }
        }
        w = {};
        if (x) {
            w.transform = B
        }
        for (var C in s) {
            w[C] = j.css(C)
        }
    }

    function u() {
        f = {};
        if (x) {
            f.transform = x
        }
        for (var B in s) {
            f[B] = s[B]
        }
    }

    function b() {
        r.playing = true;
        v = j.div.animate([w, f], {
            duration: z,
            delay: m,
            easing: TweenManager.getEase(e),
            fill: "forwards"
        });
        v.addEventListener("finish", q)
    }

    function A() {
        return !r || r.kill || !j || !j.div
    }

    function o() {
        r.playing = false;
        j = s = null;
        r = null;
        v = null;
        Utils.nullObject(this)
    }

    function a() {
        j.css(s);
        j.transform(c)
    }

    function g(D, B, C) {
        return TweenManager.interpolate(D + (B - D), C, e)
    }

    function n() {
        if (!v) {
            return
        }
        var B = v.currentTime / z;
        var C = {};
        var E = {};
        for (var D in c) {
            C[D] = g(k[D], c[D], B)
        }
        for (D in s) {
            E[D] = TweenManager.interpolate(w[D], s[D], B)
        }
        j.css(E);
        j.transform(C)
    }

    function q() {
        if (A()) {
            return
        }
        a();
        j.willChange(null);
        if (l) {
            Render.nextFrame(l)
        }
        o()
    }
    this.stop = function() {
        if (!r || !r.playing) {
            return
        }
        n();
        r.kill = true;
        r.playing = false;
        j.willChange(null);
        v.pause();
        o()
    }
});
TweenManager.Class(function Interpolation() {
    function d(j, g, h) {
        return ((a(g, h) * j + f(g, h)) * j + e(g)) * j
    }

    function b(k, n, l) {
        var h = k;
        for (var j = 0; j < 4; j++) {
            var m = c(h, n, l);
            if (m == 0) {
                return h
            }
            var g = d(h, n, l) - k;
            h -= g / m
        }
        return h
    }

    function c(j, g, h) {
        return 3 * a(g, h) * j * j + 2 * f(g, h) * j + e(g)
    }

    function a(g, h) {
        return 1 - 3 * h + 3 * g
    }

    function f(g, h) {
        return 3 * h - 6 * g
    }

    function e(g) {
        return 3 * g
    }
    this.convertEase = function(j) {
        var g = (function() {
            switch (j) {
                case "easeInQuad":
                    return TweenManager.Interpolation.Quad.In;
                    break;
                case "easeInCubic":
                    return TweenManager.Interpolation.Cubic.In;
                    break;
                case "easeInQuart":
                    return TweenManager.Interpolation.Quart.In;
                    break;
                case "easeInQuint":
                    return TweenManager.Interpolation.Quint.In;
                    break;
                case "easeInSine":
                    return TweenManager.Interpolation.Sine.In;
                    break;
                case "easeInExpo":
                    return TweenManager.Interpolation.Expo.In;
                    break;
                case "easeInCirc":
                    return TweenManager.Interpolation.Circ.In;
                    break;
                case "easeInElastic":
                    return TweenManager.Interpolation.Elastic.In;
                    break;
                case "easeInBack":
                    return TweenManager.Interpolation.Back.In;
                    break;
                case "easeInBounce":
                    return TweenManager.Interpolation.Bounce.In;
                    break;
                case "easeOutQuad":
                    return TweenManager.Interpolation.Quad.Out;
                    break;
                case "easeOutCubic":
                    return TweenManager.Interpolation.Cubic.Out;
                    break;
                case "easeOutQuart":
                    return TweenManager.Interpolation.Quart.Out;
                    break;
                case "easeOutQuint":
                    return TweenManager.Interpolation.Quint.Out;
                    break;
                case "easeOutSine":
                    return TweenManager.Interpolation.Sine.Out;
                    break;
                case "easeOutExpo":
                    return TweenManager.Interpolation.Expo.Out;
                    break;
                case "easeOutCirc":
                    return TweenManager.Interpolation.Circ.Out;
                    break;
                case "easeOutElastic":
                    return TweenManager.Interpolation.Elastic.Out;
                    break;
                case "easeOutBack":
                    return TweenManager.Interpolation.Back.Out;
                    break;
                case "easeOutBounce":
                    return TweenManager.Interpolation.Bounce.Out;
                    break;
                case "easeInOutQuad":
                    return TweenManager.Interpolation.Quad.InOut;
                    break;
                case "easeInOutCubic":
                    return TweenManager.Interpolation.Cubic.InOut;
                    break;
                case "easeInOutQuart":
                    return TweenManager.Interpolation.Quart.InOut;
                    break;
                case "easeInOutQuint":
                    return TweenManager.Interpolation.Quint.InOut;
                    break;
                case "easeInOutSine":
                    return TweenManager.Interpolation.Sine.InOut;
                    break;
                case "easeInOutExpo":
                    return TweenManager.Interpolation.Expo.InOut;
                    break;
                case "easeInOutCirc":
                    return TweenManager.Interpolation.Circ.InOut;
                    break;
                case "easeInOutElastic":
                    return TweenManager.Interpolation.Elastic.InOut;
                    break;
                case "easeInOutBack":
                    return TweenManager.Interpolation.Back.InOut;
                    break;
                case "easeInOutBounce":
                    return TweenManager.Interpolation.Bounce.InOut;
                    break;
                case "linear":
                    return TweenManager.Interpolation.Linear.None;
                    break
            }
        })();
        if (!g) {
            var h = TweenManager.getEase(j, true);
            if (h) {
                g = h
            } else {
                g = TweenManager.Interpolation.Cubic.Out
            }
        }
        return g
    };
    this.solve = function(h, g) {
        if (h[0] == h[1] && h[2] == h[3]) {
            return g
        }
        return d(b(g, h[0], h[2]), h[1], h[3])
    };
    this.Linear = {
        None: function(g) {
            return g
        }
    };
    this.Quad = {
        In: function(g) {
            return g * g
        },
        Out: function(g) {
            return g * (2 - g)
        },
        InOut: function(g) {
            if ((g *= 2) < 1) {
                return 0.5 * g * g
            }
            return -0.5 * (--g * (g - 2) - 1)
        }
    };
    this.Cubic = {
        In: function(g) {
            return g * g * g
        },
        Out: function(g) {
            return --g * g * g + 1
        },
        InOut: function(g) {
            if ((g *= 2) < 1) {
                return 0.5 * g * g * g
            }
            return 0.5 * ((g -= 2) * g * g + 2)
        }
    };
    this.Quart = {
        In: function(g) {
            return g * g * g * g
        },
        Out: function(g) {
            return 1 - --g * g * g * g
        },
        InOut: function(g) {
            if ((g *= 2) < 1) {
                return 0.5 * g * g * g * g
            }
            return -0.5 * ((g -= 2) * g * g * g - 2)
        }
    };
    this.Quint = {
        In: function(g) {
            return g * g * g * g * g
        },
        Out: function(g) {
            return --g * g * g * g * g + 1
        },
        InOut: function(g) {
            if ((g *= 2) < 1) {
                return 0.5 * g * g * g * g * g
            }
            return 0.5 * ((g -= 2) * g * g * g * g + 2)
        }
    };
    this.Sine = {
        In: function(g) {
            return 1 - Math.cos(g * Math.PI / 2)
        },
        Out: function(g) {
            return Math.sin(g * Math.PI / 2)
        },
        InOut: function(g) {
            return 0.5 * (1 - Math.cos(Math.PI * g))
        }
    };
    this.Expo = {
        In: function(g) {
            return g === 0 ? 0 : Math.pow(1024, g - 1)
        },
        Out: function(g) {
            return g === 1 ? 1 : 1 - Math.pow(2, -10 * g)
        },
        InOut: function(g) {
            if (g === 0) {
                return 0
            }
            if (g === 1) {
                return 1
            }
            if ((g *= 2) < 1) {
                return 0.5 * Math.pow(1024, g - 1)
            }
            return 0.5 * (-Math.pow(2, -10 * (g - 1)) + 2)
        }
    };
    this.Circ = {
        In: function(g) {
            return 1 - Math.sqrt(1 - g * g)
        },
        Out: function(g) {
            return Math.sqrt(1 - --g * g)
        },
        InOut: function(g) {
            if ((g *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - g * g) - 1)
            }
            return 0.5 * (Math.sqrt(1 - (g -= 2) * g) + 1)
        }
    };
    this.Elastic = {
        In: function(h) {
            var j, g = 0.1,
                l = 0.4;
            if (h === 0) {
                return 0
            }
            if (h === 1) {
                return 1
            }
            if (!g || g < 1) {
                g = 1;
                j = l / 4
            } else {
                j = l * Math.asin(1 / g) / (2 * Math.PI)
            }
            return -(g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h - j) * (2 * Math.PI) / l))
        },
        Out: function(h) {
            var j, g = 0.1,
                l = 0.4;
            if (h === 0) {
                return 0
            }
            if (h === 1) {
                return 1
            }
            if (!g || g < 1) {
                g = 1;
                j = l / 4
            } else {
                j = l * Math.asin(1 / g) / (2 * Math.PI)
            }
            return (g * Math.pow(2, -10 * h) * Math.sin((h - j) * (2 * Math.PI) / l) + 1)
        },
        InOut: function(h) {
            var j, g = 0.1,
                l = 0.4;
            if (h === 0) {
                return 0
            }
            if (h === 1) {
                return 1
            }
            if (!g || g < 1) {
                g = 1;
                j = l / 4
            } else {
                j = l * Math.asin(1 / g) / (2 * Math.PI)
            }
            if ((h *= 2) < 1) {
                return -0.5 * (g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h - j) * (2 * Math.PI) / l))
            }
            return g * Math.pow(2, -10 * (h -= 1)) * Math.sin((h - j) * (2 * Math.PI) / l) * 0.5 + 1
        }
    };
    this.Back = {
        In: function(g) {
            var h = 1.70158;
            return g * g * ((h + 1) * g - h)
        },
        Out: function(g) {
            var h = 1.70158;
            return --g * g * ((h + 1) * g + h) + 1
        },
        InOut: function(g) {
            var h = 1.70158 * 1.525;
            if ((g *= 2) < 1) {
                return 0.5 * (g * g * ((h + 1) * g - h))
            }
            return 0.5 * ((g -= 2) * g * ((h + 1) * g + h) + 2)
        }
    };
    this.Bounce = {
        In: function(g) {
            return 1 - this.Bounce.Out(1 - g)
        },
        Out: function(g) {
            if (g < (1 / 2.75)) {
                return 7.5625 * g * g
            } else {
                if (g < (2 / 2.75)) {
                    return 7.5625 * (g -= (1.5 / 2.75)) * g + 0.75
                } else {
                    if (g < (2.5 / 2.75)) {
                        return 7.5625 * (g -= (2.25 / 2.75)) * g + 0.9375
                    } else {
                        return 7.5625 * (g -= (2.625 / 2.75)) * g + 0.984375
                    }
                }
            }
        },
        InOut: function(g) {
            if (g < 0.5) {
                return this.Bounce.In(g * 2) * 0.5
            }
            return this.Bounce.Out(g * 2 - 1) * 0.5 + 0.5
        }
    }
}, "Static");
Class(function EasingPath(d) {
    Inherit(this, Component);
    var x = this;
    var h, o, t, f;
    var g = 1450;
    var A = 1 / g;
    var u = 100;
    var e = 5;
    var v = 0.001;
    var F = -1;
    var c = {};
    var w = {};
    var E = [];
    var j = [];
    (function() {
        q();
        r();
        D()
    })();

    function q() {
        f = x.initClass(ObjectPool, Object, 100)
    }

    function r() {
        h = document.createElementNS("http://www.w3.org/2000/svg", "path");
        h.setAttributeNS(null, "d", C(d));
        t = h.getTotalLength()
    }

    function D() {
        var J, I, L, G, H, K;
        for (J = I = 0, K = g; 0 <= K ? I <= K : I >= K; J = 0 <= K ? ++I : --I) {
            H = J * A;
            L = t * H;
            G = h.getPointAtLength(L);
            E.push({
                point: G,
                length: L,
                progress: H
            })
        }
    }

    function C(K) {
        var H = /[M|L|H|V|C|S|Q|T|A]/gim;
        var I = K.split(H);
        I.shift();
        var G = K.match(H);
        var L = 0;
        I[L] = l(I[L], 0);
        var J = I.length - 1;
        I[J] = l(I[J], u);
        return b(G, I)
    }

    function l(K, O) {
        O = O || 0;
        K = K.trim();
        var H = /(-|\+)?((\d+(\.(\d|\e(-|\+)?)+)?)|(\.?(\d|\e|(\-|\+))+))/gim;
        var I = p(K.match(H));
        var L = I[I.length - 1];
        var M = L[0];
        var P = Number(M);
        if (P !== O) {
            K = "";
            L[0] = O;
            for (var J = 0; J < I.length; J++) {
                var N = I[J];
                var G = J === 0 ? "" : " ";
                K += "" + G + N[0] + "," + N[1]
            }
        }
        return K
    }

    function b(H, J) {
        var G = "";
        for (var I = 0; I < H.length; I++) {
            var L = H[I];
            var K = I === 0 ? "" : " ";
            G += "" + K + L + (J[I].trim())
        }
        return G
    }

    function p(K) {
        if (K.length % 2 !== 0) {
            throw "EasingPath :: Failed to parse path -- segment pairs are not even."
        }
        var G = [];
        for (var H = 0; H < K.length; H += 2) {
            var I = K[H];
            var J = [K[H], K[H + 1]];
            G.push(J)
        }
        return G
    }

    function n(R, I) {
        if (I == F) {
            return c
        }
        if (!o) {
            o = 0
        }
        var P = R.length;
        var K, S, H;
        if (F > I) {
            K = 0;
            S = "reverse"
        } else {
            K = P;
            S = "forward"
        }
        if (S == "forward") {
            H = R[0];
            end = R[R.length - 1]
        } else {
            H = R[R.length - 1];
            end = R[0]
        }
        var O, N, J, Q, M;
        for (O = N = J = o, Q = K; J <= Q ? N < Q : N > Q; O = J <= Q ? ++N : --N) {
            var T = R[O];
            var G = T.point.x / u;
            var L = I;
            if (S == "reverse") {
                M = G;
                G = L;
                L = M
            }
            if (G < L) {
                H = T;
                o = O
            } else {
                end = T;
                break
            }
        }
        F = I;
        c.start = H;
        c.end = end;
        return c
    }

    function a(I, H) {
        var G;
        var J = s(I, H.start.point);
        if (J) {
            return J
        }
        return s(I, H.end.point)
    }

    function m(M, N, K, L) {
        L = L || e;
        var J = B(N, K, M);
        var H = h.getPointAtLength(J);
        var G = H.x / u;
        if (k(M, G)) {
            return z(H)
        } else {
            if (L-- < 1) {
                return z(H)
            }
            var I = f.get();
            I.point = H;
            I.length = J;
            j.push(I);
            if (M < G) {
                return m(M, N, I, L)
            } else {
                return m(M, I, K, L)
            }
        }
    }

    function B(K, G, I) {
        var J = G.point.x - K.point.x;
        var H = (I - (K.point.x / u)) / (J / u);
        return K.length + H * (G.length - K.length)
    }

    function s(H, G) {
        if (k(H, G.x / u)) {
            return z(G)
        }
    }

    function k(H, G) {
        return Math.abs(H - G) < v
    }

    function z(G) {
        return 1 - (G.y / u)
    }

    function y() {
        for (var G = j.length - 1; G > -1; G--) {
            f.put(j[G])
        }
        j.length = 0
    }
    this.solve = function(J) {
        J = Utils.clamp(J, 0, 1);
        var I = n(E, J);
        var H = a(J, I);
        var G = H;
        if (!G) {
            G = m(J, I.start, I.end)
        }
        y();
        return G
    }
});
Class(function MathTween(h, q, u, f, l, r, k, j) {
    var p = this;
    var w, y, v, g;
    var s, d, n, t, a;
    var m = 0;
    (function() {
        if (h && q) {
            if (typeof u !== "number") {
                throw "MathTween Requires object, props, time, ease"
            }
            c();
            if (typeof f == "object" && !Array.isArray(f)) {
                x()
            }
        }
    })();

    function c() {
        if (!h.multiTween && h._mathTween && !j) {
            TweenManager.clearTween(h)
        }
        if (!j) {
            TweenManager._addMathTween(p)
        }
        h._mathTween = p;
        if (h.multiTween) {
            if (!h._mathTweens) {
                h._mathTweens = []
            }
            h._mathTweens.push(p)
        }
        if (typeof f == "string") {
            f = TweenManager.Interpolation.convertEase(f);
            s = typeof f === "function"
        } else {
            if (Array.isArray(f)) {
                s = false;
                f = TweenManager.getEase(f, true)
            }
        }
        w = Date.now();
        w += l;
        v = q;
        y = {};
        p.startValues = y;
        for (var z in v) {
            if (typeof h[z] === "number") {
                y[z] = h[z]
            }
        }
    }

    function x() {
        var A = 0;
        var E = function(Q, K, O, P, N, L) {
            var M = N[L];
            if (M) {
                Q += M
            }
            return TweenManager.interpolateValues(Q, K, O, P)
        };
        t = [];
        for (var B in f) {
            var H = B.strpos("%") ? Number(B.replace("%", "")) / 100 : ((Number(B) + 1) / f.length);
            if (isNaN(H)) {
                continue
            }
            var D = f[B];
            var J = t[t.length - 1];
            var G = {};
            var z = J ? J.end : {};
            var F = !J;
            for (var I in y) {
                G[I] = E(y[I], v[I], H, D, z, I);
                if (F) {
                    z[I] = y[I]
                }
            }
            var C = (H * u) - A;
            A += C;
            t.push({
                percent: H,
                ease: D,
                start: z,
                end: G,
                time: C
            })
        }
        g = t.shift()
    }

    function o() {
        if (!h && !q) {
            return false
        }
        h._mathTween = null;
        TweenManager._removeMathTween(p);
        Utils.nullObject(p);
        if (h._mathTweens) {
            h._mathTweens.findAndRemove(p)
        }
    }

    function e(A) {
        m = (A - w) / u;
        m = m > 1 ? 1 : m;
        var D = s ? f(m) : TweenManager.Interpolation.solve(f, m);
        for (var C in y) {
            if (typeof y[C] === "number") {
                var B = y[C];
                var z = v[C];
                h[C] = B + (z - B) * D
            }
        }
        if (r) {
            r(D)
        }
        if (m == 1) {
            if (k) {
                k()
            }
            o()
        }
    }

    function b(A) {
        var z = g;
        if (!z.elapsed) {
            z.elapsed = 0;
            z.timer = 0
        }
        z.timer += Render.DELTA;
        z.elapsed = z.timer / z.time;
        if (z.elapsed < 1) {
            for (var B in z.start) {
                h[B] = TweenManager.interpolateValues(z.start[B], z.end[B], z.elapsed, z.ease)
            }
            if (r) {
                r(z.elapsed)
            }
        } else {
            g = t.shift();
            if (!g) {
                if (k) {
                    k()
                }
                o()
            }
        }
    }
    this.update = function(z) {
        if (d || z < w) {
            return
        }
        if (t) {
            b(z)
        } else {
            e(z)
        }
    };
    this.pause = function() {
        d = true
    };
    this.resume = function() {
        d = false;
        w = Date.now() - (m * u)
    };
    this.stop = function() {
        p.stopped = true;
        o();
        return null
    };
    this.setEase = function(z) {
        if (n != z) {
            n = z;
            f = TweenManager.Interpolation.convertEase(z);
            s = typeof f === "function"
        }
    };
    this.interpolate = function(A) {
        var D = s ? f(A) : TweenManager.Interpolation.solve(f, A);
        for (var C in y) {
            if (typeof y[C] === "number" && typeof v[C] === "number") {
                var B = y[C];
                var z = v[C];
                h[C] = B + (z - B) * D
            }
        }
    }
});
Class(function SpringTween(o, q, j, b, m, p, r) {
    var l = this;
    var d, e, h, a;
    var f, j, n, g;
    (function() {
        if (o && q) {
            if (typeof j !== "number") {
                throw "SpringTween Requires object, props, time, ease"
            }
            c()
        }
    })();

    function c() {
        TweenManager.clearTween(o);
        o._mathTween = l;
        TweenManager._addMathTween(l);
        d = Date.now();
        d += m;
        h = {};
        a = {};
        e = {};
        if (q.x || q.y || q.z) {
            if (typeof q.x === "undefined") {
                q.x = o.x
            }
            if (typeof q.y === "undefined") {
                q.y = o.y
            }
            if (typeof q.z === "undefined") {
                q.z = o.z
            }
        }
        n = 0;
        f = q.damping || 0.5;
        delete q.damping;
        for (var s in q) {
            if (typeof q[s] === "number") {
                e[s] = 0;
                h[s] = q[s]
            }
        }
        for (s in q) {
            if (typeof o[s] === "number") {
                a[s] = o[s] || 0;
                q[s] = a[s]
            }
        }
    }

    function k(s) {
        if (o) {
            o._mathTween = null;
            if (!s) {
                for (var t in h) {
                    if (typeof h[t] === "number") {
                        o[t] = h[t]
                    }
                }
                if (o.transform) {
                    o.transform()
                }
            }
        }
        TweenManager._removeMathTween(l)
    }
    this.update = function(v) {
        if (v < d || g) {
            return
        }
        var u;
        for (var z in a) {
            if (typeof a[z] === "number") {
                var y = a[z];
                var t = h[z];
                var x = q[z];
                var w = t - x;
                var s = w * f;
                e[z] += s;
                e[z] *= j;
                q[z] += e[z];
                o[z] = q[z];
                u = e[z]
            }
        }
        if (Math.abs(u) < 0.1) {
            n++;
            if (n > 30) {
                if (r) {
                    r.apply(o)
                }
                k()
            }
        }
        if (p) {
            p(v)
        }
        if (o.transform) {
            o.transform()
        }
    };
    this.pause = function() {
        g = true
    };
    this.stop = function() {
        k(true);
        return null
    }
});
Class(function TweenTimeline() {
    Inherit(this, Component);
    var f = this;
    var e;
    var c = 0;
    var b = [];
    this.elapsed = 0;
    (function() {})();

    function d() {
        b.sort(function(k, h) {
            var l = k.time + k.delay;
            var j = h.time + h.delay;
            return j - l
        });
        var g = b[0];
        c = g.time + g.delay
    }

    function a() {
        var l = f.elapsed * c;
        for (var k = b.length - 1; k > -1; k--) {
            var j = b[k];
            var h = l - j.delay;
            var g = Utils.clamp(h / j.time, 0, 1);
            j.interpolate(g)
        }
    }
    this.add = function(h, k, l, m, g) {
        var j;
        if (h instanceof HydraObject) {
            j = new FrameTween(h, k, l, m, g, null, true)
        } else {
            j = new MathTween(h, k, l, m, g, null, null, true)
        }
        b.push(j);
        j.time = l;
        j.delay = g || 0;
        d();
        return j
    };
    this.tween = function(l, h, j, g, k) {
        this.stopTween();
        e = TweenManager.tween(f, {
            elapsed: l
        }, h, j, g, k, a)
    };
    this.stopTween = function() {
        if (e && e.stop) {
            e.stop()
        }
    };
    this.startRender = function() {
        Render.startRender(a)
    };
    this.stopRender = function() {
        Render.stopRender(a)
    };
    this.update = function() {
        a()
    };
    this.calculateRemainingTime = function() {
        return c - (f.elapsed * c)
    };
    this.destroy = function() {
        Render.stopRender(a);
        for (var g = 0; g < b.length; g++) {
            b[g].stop()
        }
        return this._destroy()
    }
});
Class(function Shaders() {
    var d = this;
    (function() {})();

    function c(f) {
        var h = f.split("{@}");
        h.shift();
        for (var g = 0; g < h.length; g += 2) {
            var e = h[g];
            var j = h[g + 1];
            d[e] = j
        }
    }

    function b() {
        for (var e in d) {
            var f = d[e];
            if (typeof f === "string") {
                d[e] = a(f)
            }
        }
    }

    function a(g) {
        if (!g.strpos("require")) {
            return g
        }
        g = g.replace(/# require/g, "#require");
        while (g.strpos("#require")) {
            var f = g.split("#require(");
            var e = f[1].split(")")[0];
            e = e.replace(/ /g, "");
            if (!d[e]) {
                throw "Shader required " + e + ", but not found in compiled shaders.\n" + g
            }
            g = g.replace("#require(" + e + ")", d[e])
        }
        return g
    }
    this.parse = function(f, e) {
        if (!f.strpos("{@}")) {
            e = e.split("/");
            e = e[e.length - 1];
            d[e] = f
        } else {
            c(f);
            b()
        }
    };
    this.getShader = function(e) {
        if (d.FALLBACKS) {
            if (d.FALLBACKS[e]) {
                e = d.FALLBACKS[e]
            }
        }
        return d[e]
    }
}, "static");
Class(function RenderPerformance() {
    Inherit(this, Component);
    var d = this;
    var b;
    var a = [];
    var c = [];
    this.enabled = true;
    this.pastFrames = 60;
    this.time = function() {
        if (!this.enabled) {
            return
        }
        if (!b) {
            b = performance.now()
        } else {
            var g = performance.now() - b;
            b = null;
            a.unshift(g);
            if (a.length > this.pastFrames) {
                a.pop()
            }
            c.unshift(Render.FPS);
            if (c.length > this.pastFrames) {
                c.pop()
            }
            this.average = 0;
            var e = a.length;
            for (var f = 0; f < e; f++) {
                this.average += a[f]
            }
            this.average /= e;
            this.averageFPS = 0;
            e = c.length;
            for (f = 0; f < e; f++) {
                this.averageFPS += c[f]
            }
            this.averageFPS /= e
        }
    };
    this.clear = function() {
        a.length = 0
    };
    this.dump = function() {
        console.log(a)
    };
    this.get("times", function() {
        return a
    });
    this.get("median", function() {
        a.sort(function(f, e) {
            return f - e
        });
        return a[~~(a.length / 2)]
    })
});
Class(function Video(o) {
    Inherit(this, Component);
    var h = this;
    var f, p, a, l, n, c, k;
    var b = 0;
    var d = {};
    this.loop = false;
    this.playing = false;
    this.width = o.width || 0;
    this.height = o.height || 0;
    (function() {
        j();
        if (o.preload !== false) {
            m()
        }
    })();

    function j() {
        var q = o.src;
        if (q && !q.strpos("webm") && !q.strpos("mp4") && !q.strpos("ogv")) {
            q += "." + Device.media.video
        }
        h.div = document.createElement("video");
        if (q) {
            h.div.src = q
        }
        h.div.controls = o.controls;
        h.div.id = o.id || "";
        h.div.width = o.width;
        h.div.height = o.height;
        c = h.div.loop = o.loop;
        if (Mobile.os == "iOS" && Mobile.version >= 9 && !h.div.controls) {
            h.div.autoplay = true;
            h.div.load()
        }
        h.object = $(h.div);
        h.width = o.width;
        h.height = o.height;
        h.object.size(h.width, h.height);
        if (Mobile.isNative() && Mobile.os == "iOS") {
            h.object.attr("webkit-playsinline", true)
        }
    }

    function m() {
        if (Device.mobile) {
            return
        }
        h.div.preload = "none";
        h.div.load();
        h.div.addEventListener("canplaythrough", function() {
            if (h.div && !h.playing && !h.div.preloadThroguh) {
                h.div.play();
                h.div.pause();
                h.div.preloadThrough = true
            }
        })
    }

    function e() {
        if (!h.div || !h.events) {
            return Render.stopRender(e)
        }
        h.duration = h.div.duration;
        h.time = h.div.currentTime;
        if (h.div.currentTime == a) {
            b++;
            if (b > 30 && !l) {
                l = true;
                h.events.fire(HydraEvents.ERROR, null, true)
            }
        } else {
            b = 0;
            if (l) {
                h.events.fire(HydraEvents.READY, null, true);
                l = false
            }
        }
        a = h.div.currentTime;
        if (h.div.currentTime >= (h.duration || h.div.duration) - 0.001) {
            if (!c) {
                if (!k) {
                    Render.stopRender(e)
                }
                h.events.fire(HydraEvents.COMPLETE, null, true)
            }
        }
        d.time = h.div.currentTime;
        d.duration = h.div.duration;
        h.events.fire(HydraEvents.UPDATE, d, true)
    }

    function g() {
        if (!h.div) {
            return false
        }
        if (!Device.mobile) {
            if (!n) {
                h.buffered = h.div.readyState == h.div.HAVE_ENOUGH_DATA
            } else {
                var q = -1;
                var s = h.div.seekable;
                if (s) {
                    for (var r = 0; r < s.length; r++) {
                        if (s.start(r) < n) {
                            q = s.end(r) - 0.5
                        }
                    }
                    if (q >= n) {
                        h.buffered = true
                    }
                } else {
                    h.buffered = true
                }
            }
        } else {
            h.buffered = true
        }
        if (h.buffered) {
            Render.stopRender(g);
            h.events.fire(HydraEvents.READY, null, true)
        }
    }
    this.set("loop", function(q) {
        if (!h.div) {
            return
        }
        c = q;
        h.div.loop = q
    });
    this.get("loop", function() {
        return c
    });
    this.set("src", function(q) {
        if (q && !q.strpos("webm") && !q.strpos("mp4") && !q.strpos("ogv")) {
            q += "." + Device.media.video
        }
        h.div.src = q
    });
    this.get("src", function() {
        return h.div.src
    });
    this.play = function() {
        if (!h.div) {
            return false
        }
        h.playing = true;
        h.div.play();
        Render.startRender(e)
    };
    this.pause = function() {
        if (!h.div) {
            return false
        }
        h.playing = false;
        h.div.pause();
        Render.stopRender(e)
    };
    this.stop = function() {
        h.playing = false;
        Render.stopRender(e);
        if (!h.div) {
            return false
        }
        h.div.pause();
        if (h.ready()) {
            h.div.currentTime = 0
        }
    };
    this.volume = function(q) {
        if (!h.div) {
            return false
        }
        h.div.volume = q
    };
    this.seek = function(q) {
        if (!h.div) {
            return false
        }
        if (h.div.readyState <= 1) {
            Render.nextFrame(function() {
                h.seek && h.seek(q)
            });
            return
        }
        h.div.currentTime = q
    };
    this.canPlayTo = function(q) {
        n = null;
        if (q) {
            n = q
        }
        if (!h.div) {
            return false
        }
        if (!h.buffered) {
            Render.startRender(g)
        }
        return this.buffered
    };
    this.ready = function() {
        if (!h.div) {
            return false
        }
        return h.div.readyState >= 2
    };
    this.size = function(q, r) {
        if (!h.div) {
            return false
        }
        this.div.width = this.width = q;
        this.div.height = this.height = r;
        this.object.css({
            width: q,
            height: r
        })
    };
    this.forceRender = function() {
        k = true;
        Render.startRender(e)
    };
    this.destroy = function() {
        this.stop();
        this.object.remove();
        this.div.src = "";
        return this._destroy()
    }
});
Class(function SVG() {
    var a = [];
    (function() {
        (function(k) {
            var f = ["SVGSVGElement", "SVGGElement"],
                m = document.createElement("dummy");
            if (!f[0] in k) {
                return !1
            }
            if (Object.defineProperty) {
                var l = {
                    get: function() {
                        m.innerHTML = "";
                        Array.prototype.slice.call(this.childNodes).forEach(function(d) {
                            m.appendChild(d.cloneNode(!0))
                        });
                        return m.innerHTML
                    },
                    set: function(g) {
                        var d = this,
                            n = Array.prototype.slice.call(d.childNodes),
                            h = function(o, p) {
                                if (1 !== p.nodeType) {
                                    return !1
                                }
                                var e = document.createElementNS("http://www.w3.org/2000/svg", p.nodeName.toLowerCase());
                                Array.prototype.slice.call(p.attributes).forEach(function(q) {
                                    e.setAttribute(q.name, q.value)
                                });
                                "TEXT" === p.nodeName && (e.textContent = p.innerHTML);
                                o.appendChild(e);
                                p.childNodes.length && Array.prototype.slice.call(p.childNodes).forEach(function(q) {
                                    h(e, q)
                                })
                            },
                            g = g.replace(/<(\w+)([^<]+?)\/>/, "<$1$2></$1>");
                        n.forEach(function(e) {
                            e.parentNode.removeChild(e)
                        });
                        m.innerHTML = g;
                        Array.prototype.slice.call(m.childNodes).forEach(function(e) {
                            h(d, e)
                        })
                    },
                    enumerable: !0,
                    configurable: !0
                };
                try {
                    f.forEach(function(d) {
                        Object.defineProperty(window[d].prototype, "innerHTML", l)
                    })
                } catch (j) {}
            } else {
                Object.prototype.__defineGetter__ && f.forEach(function(d) {
                    window[d].prototype.__defineSetter__("innerHTML", l.set);
                    window[d].prototype.__defineGetter__("innerHTML", l.get)
                })
            }
        })(window)
    }());

    function c(e) {
        for (var d = 0; d < a.length; d++) {
            if (a[d].id == e) {
                return true
            }
        }
    }

    function b(e) {
        for (var d = 0; d < a.length; d++) {
            if (a[d].id == e) {
                return a[d]
            }
        }
    }
    this.defineSymbol = function(h, f, d, g) {
        if (c(h)) {
            throw "SVG symbol " + h + " is already defined"
        }
        var e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        e.setAttribute("style", "display: none;");
        e.setAttribute("width", f);
        e.setAttribute("height", d);
        e.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        e.innerHTML = '<symbol id="' + h + '">' + g + "</symbol>";
        document.body.insertBefore(e, document.body.firstChild);
        a.push({
            id: h,
            width: f,
            height: d
        })
    };
    this.getSymbolConfig = function(e) {
        var d = b(e);
        if (typeof d == "undefined") {
            throw "SVG symbol " + e + " is not defined"
        }
        return d
    }
}, "Static");
Class(function AssetLoader(_assets, _complete, _images) {
    Inherit(this, Component);
    var _this = this;
    var _total = 0;
    var _loaded = 0;
    var _added = 0;
    var _triggered = 0;
    var _lastTriggered = 0;
    var _queue, _qLoad;
    var _output, _loadedFiles;
    (function() {
        if (typeof _complete !== "function") {
            _images = _complete;
            _complete = null
        }
        _queue = [];
        _loadedFiles = [];
        prepareAssets();
        _this.delayedCall(startLoading, 10)
    })();

    function prepareAssets() {
        for (var i = 0; i < _assets.length; i++) {
            if (typeof _assets[i] !== "undefined") {
                _total++;
                _queue.push(_assets[i])
            }
        }
    }

    function startLoading() {
        _qLoad = Math.round(_total * 0.5);
        for (var i = 0; i < _qLoad; i++) {
            loadAsset(_queue[i])
        }
    }

    function missingFiles() {
        if (!_queue) {
            return
        }
        var missing = [];
        for (var i = 0; i < _queue.length; i++) {
            var loaded = false;
            for (var j = 0; j < _loadedFiles.length; j++) {
                if (_loadedFiles[j] == _queue[i]) {
                    loaded = true
                }
            }
            if (!loaded) {
                missing.push(_queue[i])
            }
        }
        if (missing.length) {
            console.log("AssetLoader Files Failed To Load:");
            console.log(missing)
        }
    }

    function loadAsset(asset) {
        if (!asset) {
            return
        }
        var name = asset.split("/");
        name = name[name.length - 1];
        var split = name.split(".");
        var ext = split[split.length - 1].split("?")[0];
        switch (ext) {
            case "html":
                XHR.get(asset, function(contents) {
                    Hydra.HTML[split[0]] = contents;
                    assetLoaded(asset)
                }, "text");
                break;
            case "js":
            case "php":
            case undefined:
                XHR.get(asset, function(script) {
                    script = script.replace("use strict", "");
                    eval.call(window, script);
                    assetLoaded(asset)
                }, "text");
                break;
            case "csv":
            case "json":
                XHR.get(asset, function(contents) {
                    Hydra.JSON[split[0]] = contents;
                    assetLoaded(asset)
                }, ext == "csv" ? "text" : null);
                break;
            case "fs":
            case "vs":
                XHR.get(asset, function(contents) {
                    Shaders.parse(contents, asset);
                    assetLoaded(asset)
                }, "text");
                break;
            default:
                var image = new Image();
                image.src = asset;
                image.onload = function() {
                    assetLoaded(asset);
                    if (_images) {
                        _images[asset] = image
                    }
                };
                break
        }
    }

    function checkQ() {
        if (_loaded == _qLoad && _loaded < _total) {
            var start = _qLoad;
            _qLoad *= 2;
            for (var i = start; i < _qLoad; i++) {
                if (_queue[i]) {
                    loadAsset(_queue[i])
                }
            }
        }
    }

    function assetLoaded(asset) {
        if (_queue) {
            _loaded++;
            _this.events.fire(HydraEvents.PROGRESS, {
                percent: _loaded / _total
            });
            _loadedFiles.push(asset);
            clearTimeout(_output);
            checkQ();
            if (_loaded == _total) {
                _this.complete = true;
                Render.nextFrame(function() {
                    if (_this.events) {
                        _this.events.fire(HydraEvents.COMPLETE, null, true)
                    }
                    if (_complete) {
                        _complete()
                    }
                })
            } else {
                _output = _this.delayedCall(missingFiles, 5000)
            }
        }
    }
    this.add = function(num) {
        _total += num;
        _added += num
    };
    this.trigger = function(num) {
        num = num || 1;
        for (var i = 0; i < num; i++) {
            assetLoaded("trigger")
        }
    };
    this.triggerPercent = function(percent, num) {
        num = num || _added;
        var trigger = Math.ceil(num * percent);
        if (trigger > _lastTriggered) {
            this.trigger(trigger - _lastTriggered)
        }
        _lastTriggered = trigger
    };
    this.destroy = function() {
        _assets = null;
        _loaded = null;
        _queue = null;
        _qLoad = null;
        return this._destroy()
    }
}, function() {
    AssetLoader.loadAllAssets = function(e, a) {
        a = a || "";
        var d = [];
        for (var b = 0; b < ASSETS.length; b++) {
            d.push(a + ASSETS[b])
        }
        var c = new AssetLoader(d, function() {
            if (e) {
                e()
            }
            c = c.destroy()
        })
    };
    AssetLoader.loadAssets = function(b, c) {
        var a = new AssetLoader(b, function() {
            if (c) {
                c()
            }
            a = a.destroy()
        })
    }
});
Class(function FontLoader(d, a) {
    Inherit(this, Component);
    var f = this;
    var b;
    (function() {
        e();
        c()
    })();

    function e() {
        if (!Array.isArray(d)) {
            d = [d]
        }
        b = Stage.create("FontLoader");
        for (var h = 0; h < d.length; h++) {
            var g = b.create("font");
            g.fontStyle(d[h], 12, "#000").text("LOAD").css({
                top: -999
            })
        }
    }

    function c() {
        f.delayedCall(function() {
            b.remove();
            if (a) {
                a()
            } else {
                f.events.fire(HydraEvents.COMPLETE)
            }
        }, 500)
    }
}, function() {
    FontLoader.loadFonts = function(c, b) {
        var a = new FontLoader(c, function() {
            if (b) {
                b()
            }
            a = null
        })
    }
});
Class(function PushState(a) {
    var b = this;
    if (typeof a !== "boolean") {
        a = Hydra.LOCAL
    }
    this.locked = false;
    this.dispatcher = new StateDispatcher(a);
    this.getState = function() {
        return this.dispatcher.getState()
    };
    this.setState = function(c) {
        this.dispatcher.setState(c)
    };
    this.replaceState = function(c) {
        this.dispatcher.replaceState(c)
    };
    this.setTitle = function(c) {
        this.dispatcher.setTitle(c)
    };
    this.lock = function() {
        this.locked = true;
        this.dispatcher.lock()
    };
    this.unlock = function() {
        this.locked = false;
        this.dispatcher.unlock()
    };
    this.setPathRoot = function(c) {
        this.dispatcher.setPathRoot(c)
    }
});
Class(function StateDispatcher(g) {
    Inherit(this, Events);
    var f = this;
    var j, a;
    var d = "/";
    this.locked = false;
    (function() {
        b();
        j = c();
        a = j
    })();

    function b() {
        if (!Device.system.pushstate || g) {
            window.addEventListener("hashchange", function() {
                h(c())
            }, false)
        } else {
            window.onpopstate = history.onpushstate = e
        }
    }

    function c() {
        if (!Device.system.pushstate || g) {
            var k = window.location.hash;
            k = k.slice(3);
            return String(k)
        } else {
            var l = location.pathname.toString();
            l = d != "/" ? l.split(d)[1] : l.slice(1);
            l = l || "";
            return l
        }
    }

    function e() {
        var k = location.pathname;
        if (!f.locked && k != a) {
            k = d != "/" ? k.split(d)[1] : k.slice(1);
            k = k || "";
            a = k;
            f.events.fire(HydraEvents.UPDATE, {
                value: k,
                split: k.split("/")
            })
        } else {
            if (k != a) {
                if (a) {
                    window.history.pushState(null, null, d + k)
                }
            }
        }
    }

    function h(k) {
        if (!f.locked && k != a) {
            a = k;
            f.events.fire(HydraEvents.UPDATE, {
                value: k,
                split: k.split("/")
            })
        } else {
            if (k != a) {
                if (a) {
                    window.location.hash = "!/" + a
                }
            }
        }
    }
    this.getState = function() {
        if (Mobile.NativeCore && Mobile.NativeCore.active) {
            return Storage.get("app_state") || ""
        }
        return c()
    };
    this.setPathRoot = function(k) {
        if (k.charAt(0) == "/") {
            d = k
        } else {
            d = "/" + k
        }
    };
    this.setState = function(k) {
        if (Mobile.NativeCore && Mobile.NativeCore.active) {
            Storage.set("app_state", k)
        }
        if (!Device.system.pushstate || g) {
            if (k != a) {
                window.location.hash = "!/" + k;
                a = k
            }
        } else {
            if (k != a) {
                window.history.pushState(null, null, d + k);
                a = k
            }
        }
    };
    this.replaceState = function(k) {
        if (!Device.system.pushstate || g) {
            if (k != a) {
                window.location.hash = "!/" + k;
                a = k
            }
        } else {
            if (k != a) {
                window.history.replaceState(null, null, d + k);
                a = k
            }
        }
    };
    this.setTitle = function(k) {
        document.title = k
    };
    this.lock = function() {
        this.locked = true
    };
    this.unlock = function() {
        this.locked = false
    };
    this.forceHash = function() {
        g = true
    }
});
Class(function GATracker() {
    this.trackPage = function(a) {
        if (typeof ga !== "undefined") {
            ga("send", "pageview", a)
        }
    };
    this.trackEvent = function(b, d, a, c) {
        if (typeof ga !== "undefined") {
            ga("send", "event", b, d, a, (c || 0))
        }
    }
}, "Static");
Class(function XHR() {
    var d = this;
    var b;
    var c = window.location.href.strpos("file://");
    this.headers = {};

    function a(f, g) {
        if (typeof g === "object") {
            for (var e in g) {
                var h = f + "[" + e + "]";
                if (typeof g[e] === "object") {
                    a(h, g[e])
                } else {
                    b.push(h + "=" + g[e])
                }
            }
        } else {
            b.push(f + "=" + g)
        }
    }
    this.get = function(f, j, l, h) {
        if (typeof j === "function") {
            h = l;
            l = j;
            j = null
        } else {
            if (typeof j === "object") {
                var e = "?";
                for (var g in j) {
                    e += g + "=" + j[g] + "&"
                }
                e = e.slice(0, -1);
                f += e
            }
        }
        var k = new XMLHttpRequest();
        k.open("GET", f, true);
        for (var g in d.headers) {
            k.setRequestHeader(g, d.headers)
        }
        k.send();
        k.onreadystatechange = function() {
            if (k.readyState == 4 && (c || k.status == 200)) {
                if (typeof l === "function") {
                    var m = k.responseText;
                    if (h == "text") {
                        l(m)
                    } else {
                        try {
                            l(JSON.parse(m))
                        } catch (n) {
                            console.error(n)
                        }
                    }
                }
                k = null
            }
        }
    };
    this.post = function(e, h, l, g, k) {
        if (typeof h === "function") {
            k = g;
            g = l;
            l = h;
            h = null
        } else {
            if (typeof h === "object") {
                if (l == "json" || g == "json" || k == "json") {
                    h = JSON.stringify(h)
                } else {
                    b = new Array();
                    for (var f in h) {
                        a(f, h[f])
                    }
                    h = b.join("&");
                    h = h.replace(/\[/g, "%5B");
                    h = h.replace(/\]/g, "%5D");
                    b = null
                }
            }
        }
        var j = new XMLHttpRequest();
        j.open("POST", e, true);
        switch (k) {
            case "upload":
                k = "application/upload";
                break;
            default:
                k = "application/x-www-form-urlencoded";
                break
        }
        j.setRequestHeader("Content-type", k);
        for (var f in d.headers) {
            j.setRequestHeader(f, d.headers)
        }
        j.onreadystatechange = function() {
            if (j.readyState == 4 && (c || j.status == 200)) {
                if (typeof l === "function") {
                    var m = j.responseText;
                    if (g == "text") {
                        l(m)
                    } else {
                        try {
                            l(JSON.parse(m))
                        } catch (n) {
                            console.error(n)
                        }
                    }
                }
                j = null
            }
        };
        j.send(h)
    }
}, "Static");
Class(function Storage() {
    var d = this;
    var c;
    (function() {
        a()
    })();

    function a() {
        try {
            if (window.localStorage) {
                try {
                    window.localStorage.test = 1;
                    window.localStorage.removeItem("test");
                    c = true
                } catch (f) {
                    c = false
                }
            } else {
                c = false
            }
        } catch (f) {
            c = false
        }
    }

    function b(j, k, f) {
        var g;
        if (arguments.length > 1 && (k === null || typeof k !== "object")) {
            g = {};
            g.path = "/";
            g.expires = f || 1;
            if (k === null) {
                g.expires = -1
            }
            if (typeof g.expires === "number") {
                var m = g.expires,
                    h = g.expires = new Date();
                h.setDate(h.getDate() + m)
            }
            return (document.cookie = [encodeURIComponent(j), "=", g.raw ? String(k) : encodeURIComponent(String(k)), g.expires ? "; expires=" + g.expires.toUTCString() : "", g.path ? "; path=" + g.path : "", g.domain ? "; domain=" + g.domain : "", g.secure ? "; secure" : ""].join(""))
        }
        g = k || {};
        var e, l = g.raw ? function(n) {
            return n
        } : decodeURIComponent;
        return (e = new RegExp("(?:^|; )" + encodeURIComponent(j) + "=([^;]*)").exec(document.cookie)) ? l(e[1]) : null
    }
    this.setCookie = function(f, g, e) {
        b(f, g, e)
    };
    this.getCookie = function(e) {
        return b(e)
    };
    this.set = function(e, f) {
        if (typeof f === "object") {
            f = JSON.stringify(f)
        }
        if (c) {
            if (typeof f === "null") {
                window.localStorage.removeItem(e)
            } else {
                window.localStorage[e] = f
            }
        } else {
            b(e, f, 365)
        }
    };
    this.get = function(e) {
        var g;
        if (c) {
            g = window.localStorage[e]
        } else {
            g = b(e)
        }
        if (g) {
            var f;
            if (g.charAt) {
                f = g.charAt(0)
            }
            if (f == "{" || f == "[") {
                g = JSON.parse(g)
            }
        }
        return g
    }
}, "Static");
Class(function Thread(c) {
    Inherit(this, Component);
    var d = this;
    var k, f, j, e;
    (function() {
        m();
        g();
        h()
    })();

    function m() {
        j = Thread.PATH;
        f = {};
        k = new Worker(j + "assets/js/hydra/hydra-thread.js")
    }

    function g() {
        a(Utils);
        a(MVC);
        a(Component);
        a(Events);
        a(c, true)
    }

    function a(n, t) {
        if (!n) {
            return
        }
        var r, q;
        if (!t) {
            if (typeof n !== "function") {
                q = n.constructor._namespace ? n.constructor._namespace + "." : "";
                r = q + "Class(" + n.constructor.toString() + ', "static");'
            } else {
                q = n._namespace ? n._namespace + "." : "";
                r = q + "Class(" + n.toString() + ");"
            }
        } else {
            r = n.toString().replace("{", "!!!");
            r = r.split("!!!")[1];
            var s = window._MINIFIED_ ? "=" : " ";
            while (r.strpos("this")) {
                var p = r.slice(r.indexOf("this."));
                var o = p.split("this.")[1].split(s)[0];
                r = r.replace("this", "self");
                b(o)
            }
            r = r.slice(0, -1)
        }
        k.postMessage({
            code: r
        })
    }

    function b(n) {
        d[n] = function(o, p) {
            d.send(n, o, p)
        }
    }

    function h() {
        k.addEventListener("message", l)
    }

    function l(n) {
        if (n.data.console) {
            console.log(n.data.message)
        } else {
            if (n.data.id) {
                var o = f[n.data.id];
                if (o) {
                    o(n.data.message)
                }
                delete f[n.data.id]
            } else {
                if (n.data.emit) {
                    var o = f[n.data.evt];
                    if (o) {
                        o(n.data.msg)
                    }
                } else {
                    var o = f.transfer;
                    if (o) {
                        o(n.data)
                    }
                }
            }
        }
    }
    this.on = function(n, o) {
        f[n] = o
    };
    this.off = function(n) {
        delete f[n]
    };
    this.loadFunctions = function() {
        for (var n = 0; n < arguments.length; n++) {
            this.loadFunction(arguments[n])
        }
    };
    this.loadFunction = function(p) {
        p = p.toString();
        p = p.replace("(", "!!!");
        var o = p.split("!!!");
        var n = o[0].split(" ")[1];
        p = "self." + n + " = function(" + o[1];
        k.postMessage({
            code: p
        });
        b(n)
    };
    this.importScript = function(n) {
        k.postMessage({
            path: n,
            importScript: true
        })
    };
    this.importClass = function() {
        for (var n = 0; n < arguments.length; n++) {
            var o = arguments[n];
            a(o)
        }
    };
    this.send = function(n, p, r) {
        if (typeof n === "string") {
            var o = n;
            p = p || {};
            p.fn = n
        } else {
            r = p;
            p = n
        }
        var q = Utils.timestamp();
        if (r) {
            f[q] = r
        }
        if (p.transfer) {
            p.msg.id = q;
            p.msg.fn = p.fn;
            p.msg.transfer = true;
            k.postMessage(p.msg, p.buffer)
        } else {
            k.postMessage({
                message: p,
                id: q
            })
        }
    };
    this.destroy = function() {
        if (k.terminate) {
            k.terminate()
        }
        return this._destroy()
    }
}, function() {
    Thread.PATH = ""
});
Class(function Dev() {
    var e = this;
    var a, c;
    (function() {
        if (Hydra.LOCAL) {
            Hydra.development(true)
        }
    })();

    function d() {
        window.onerror = function(j, h, f) {
            var g = j + " ::: " + h + " : " + f;
            if (c) {
                alert(g)
            }
            if (a) {
                XHR.post(a + "/api/data/debug", b(g), "json")
            }
        }
    }

    function b(f) {
        var g = {};
        g.err = f;
        g.ua = Device.agent;
        g.browser = {
            width: Stage.width,
            height: Stage.height
        };
        return g
    }
    this.alertErrors = function(f) {
        c = true;
        if (typeof f === "string") {
            f = [f]
        }
        for (var g = 0; g < f.length; g++) {
            if (location.href.strpos(f[g]) || location.hash.strpos(f[g])) {
                return d()
            }
        }
    };
    this.postErrors = function(f, h) {
        a = h;
        if (typeof f === "string") {
            f = [f]
        }
        for (var g = 0; g < f.length; g++) {
            if (location.href.strpos(f[g])) {
                return d()
            }
        }
    };
    this.expose = function(f, h, g) {
        if (Hydra.LOCAL || g) {
            window[f] = h
        }
    }
}, "Static");
window.ASSETS = ["assets/geometry/logo.json", "assets/geometry/terrain.json", "assets/images/about/awards/adc.png", "assets/images/about/awards/addy.png", "assets/images/about/awards/awwwards.png", "assets/images/about/awards/cannes.png", "assets/images/about/awards/dnad.png", "assets/images/about/awards/emmy.png", "assets/images/about/awards/fwa.png", "assets/images/about/awards/oneshow.png", "assets/images/about/awards/webby.png", "assets/images/about/awards.jpg", "assets/images/about/bg-blur.jpg", "assets/images/about/bg.jpg", "assets/images/about/design.jpg", "assets/images/about/logo-wide-invert.png", "assets/images/about/logo-wide.png", "assets/images/about/process_design.jpg", "assets/images/about/process_tech.jpg", "assets/images/about/shadow.png", "assets/images/common/awards/adc.png", "assets/images/common/awards/addy.png", "assets/images/common/awards/awwwards.png", "assets/images/common/awards/cannes.png", "assets/images/common/awards/dnad.png", "assets/images/common/awards/emmy.png", "assets/images/common/awards/fwa.png", "assets/images/common/awards/oneshow.png", "assets/images/common/awards/webby.png", "assets/images/common/circlelogo.png", "assets/images/common/fb.png", "assets/images/common/gradient.png", "assets/images/common/loader.png", "assets/images/common/logos/53.png", "assets/images/common/logos/android.png", "assets/images/common/logos/ashworth.png", "assets/images/common/logos/chelsea.png", "assets/images/common/logos/chevy.png", "assets/images/common/logos/cocacola.png", "assets/images/common/logos/dicks.png", "assets/images/common/logos/fox.png", "assets/images/common/logos/google.png", "assets/images/common/logos/gradient.png", "assets/images/common/logos/halo.png", "assets/images/common/logos/ibm.png", "assets/images/common/logos/stance.png", "assets/images/common/logos/toyota.png", "assets/images/common/logos/underarmour.png", "assets/images/common/logos/xbox.png", "assets/images/common/shadow.png", "assets/images/common/tw.png", "assets/images/fallback/logo.png", "assets/images/home/frame.jpg", "assets/images/home/logo_2.png", "assets/images/home/outline.png", "assets/images/home/still.jpg", "assets/images/icons/apple-touch-icon-120.png", "assets/images/icons/apple-touch-icon-152.png", "assets/images/icons/apple-touch-icon-180.png", "assets/images/icons/apple-touch-icon-76.png", "assets/images/icons/icon-128.png", "assets/images/icons/icon-144.png", "assets/images/icons/icon-192.png", "assets/images/icons/icon-36.png", "assets/images/icons/icon-48.png", "assets/images/icons/icon-72.png", "assets/images/icons/icon-96.png", "assets/images/menu/brightness.jpg", "assets/images/menu/fallback.jpg", "assets/images/share/share_facebook.jpg", "assets/images/share/share_twitter.jpg", "assets/images/temp/bg.jpg", "assets/images/temp/gotham.jpg", "assets/images/temp/logo.jpg", "assets/images/temp/screenshot.jpg", "assets/images/temp/thumb.jpg", "assets/images/temp/uv.jpg", "assets/js/lib/three.min.js", "assets/shaders/compiled.vs"];
window.PROJECTS = {
    work: {},
    ashworth: {
        bg: true,
        thumb: true,
        video: true
    },
    chelsea: {
        bg: true,
        thumb: true,
        video: true
    },
    clouds: {
        bg: true,
        thumb: true,
        video: true
    },
    contact: {
        bg: true,
        thumb: true,
        video: true
    },
    fifa: {
        bg: true,
        thumb: true,
        video: true
    },
    gisele: {
        bg: true,
        thumb: true,
        video: true
    },
    gotham: {
        bg: true,
        thumb: true,
        video: true
    },
    halo: {
        bg: true,
        thumb: true,
        video: true
    },
    iwwiw: {},
    leapsecond: {
        bg: true,
        thumb: true,
        video: true
    },
    penguin: {
        bg: true,
        thumb: true,
        video: true
    },
    racer: {
        bg: true,
        thumb: true,
        video: true
    },
    racer_installation: {
        bg: true,
        thumb: true,
        video: true
    },
    source: {
        bg: true,
        thumb: true,
        video: true
    },
    stance: {
        bg: true,
        thumb: true,
        video: true
    },
    stingray: {
        bg: true,
        thumb: true,
        video: true
    },
    sutc: {
        bg: true,
        thumb: true,
        video: true
    },
    ua: {
        bg: true,
        thumb: true,
        video: true
    },
    watson: {
        bg: true,
        thumb: true,
        video: true
    },
    lab: {},
    finding: {
        bg: true,
        thumb: true,
        video: true
    },
    mira: {
        bg: true,
        thumb: true,
        video: true
    },
    neve: {
        bg: true,
        thumb: true,
        video: true
    },
    nova: {
        bg: true,
        thumb: true,
        video: true
    },
    p2p: {
        bg: true,
        thumb: true,
        video: true
    }
};
Class(function Config() {
    var a = window.innerWidth > window.innerHeight ? (Mobile.browser === "Safari" ? 20 : 20) : 25;
    this.UI_OFFSET = Mobile.phone ? 25 : Device.mobile ? 70 : 80;
    this.UI_NAV_WIDTH = 427;
    this.UI_NAV_ITEM_HEIGHT = 160;
    this.SCENE_OFFSET = 0;
    this.BG_COLOR = "#080808";
    this.DATA_API = (function() {
        if (window.location.href.strpos("v3.activetheory.net") || location.hostname == "activetheory.net") {
            return "https://at-v3-prod.s3.amazonaws.com/assets/data/data.js"
        }
        return "http://stage.activetheory.net/api/data"
    })();
    this.CDN = (function() {
        if (window.location.href.strpos("stage.activetheory")) {
            return "https://at-v3-stage.s3.amazonaws.com/"
        }
        if (window.location.href.strpos("v3.activetheory.net")) {
            return "https://at-v3-prod.s3.amazonaws.com/"
        }
        if (window.location.href.strpos("activetheory.net")) {
            return "https://at-v3-prod.s3.amazonaws.com/"
        }
        return ""
    })();
    this.PROXY = (function() {
        if (window.location.href.strpos("stage.activetheory")) {
            return "http://stage.activetheory.net/cdn/"
        }
        if (window.location.href.strpos("v3.activetheory")) {
            return location.protocol + "//v3.activetheory.net/cdn/"
        }
        if (window.location.href.strpos("activetheory.net")) {
            return location.protocol + "//activetheory.net/cdn/"
        }
        return ""
    })();
    this.MENU_TINT = {
        home: 16777215,
        work: 16776387,
        lab: 12184831,
        about: 16761574
    };
    this.MENU_COLORS = [9888767, 8447945, 15965116, 11268809, 13612543];
    this.PAGES = ["home", "work", "about", "lab"]
}, "Static");
Class(function ATEvents() {
    var a = this;
    this.RESIZE = "resize";
    this.SIZZLE_CHANGE = "sizzle_change";
    this.FILTER_CHANGE = "filter_change";
    this.STATE_CHANGE = "state_change";
    this.RESET_FILTERS = "reset_filters"
}, "static");
Class(function AssetUtil() {
    var d = this;
    var c = {};
    var b = ["!!!"];
    this.PATH = "";

    function a(g, e) {
        for (var f = 0; f < b.length; f++) {
            var h = b[f];
            if (g.strpos(h) && e != h) {
                return false
            }
        }
        return true
    }
    this.loadAssets = function(j) {
        var h = this.get(j);
        var e = [];
        for (var f = h.length - 1; f > -1; f--) {
            var g = h[f];
            if (!c[g]) {
                e.push(g.strpos("http") ? g : d.PATH + g);
                c[g] = 1
            }
        }
        return e
    };
    this.get = function(l) {
        if (!Array.isArray(l)) {
            l = [l]
        }
        var k = [];
        for (var g = ASSETS.length - 1; g > -1; g--) {
            var h = ASSETS[g];
            for (var f = l.length - 1; f > -1; f--) {
                var e = l[f];
                if (h.strpos(e)) {
                    if (a(h, e)) {
                        k.push(h)
                    }
                }
            }
        }
        return k
    };
    this.exclude = function(f) {
        if (!Array.isArray(f)) {
            f = [f]
        }
        for (var e = 0; e < f.length; e++) {
            b.push(f[e])
        }
    };
    this.removeExclude = function(f) {
        if (!Array.isArray(f)) {
            f = [f]
        }
        for (var e = 0; e < f.length; e++) {
            b.findAndRemove(f[e])
        }
    };
    this.loadAllAssets = function(g) {
        var f = d.loadAssets(g || "/");
        var e = new AssetLoader(f)
    };
    this.exists = function(e) {
        for (var f = ASSETS.length - 1; f > -1; f--) {
            var g = ASSETS[f];
            if (g.strpos(e)) {
                return true
            }
        }
        return false
    };
    this.prependPath = function(h, g) {
        if (!Array.isArray(g)) {
            g = [g]
        }
        for (var e = ASSETS.length - 1; e > -1; e--) {
            var f = ASSETS[e];
            g.forEach(function(j) {
                if (f.strpos(j)) {
                    ASSETS[e] = h + f
                }
            })
        }
    }
}, "Static");
Class(function ATUtil() {
    Inherit(this, Component);
    var e = this;
    var a;
    (function() {
        d();
        c()
    })();

    function d() {
        TweenManager.addCustomEase({
            name: "homeIn",
            curve: "M0,100c3.3,0,32.8-0.8,52-18.3C81.5,54.7,74.7,0,100,0"
        });
        TweenManager.addCustomEase({
            name: "homeOut",
            curve: "M0,100c14.6-2.2,27.4-10,41.5-39.6C59.6,22.5,80.9,0,100,0"
        });
        TweenManager.addCustomEase({
            name: "wipeInOut",
            curve: "cubic-bezier(.29,.23,.13,1)"
        });
        TweenManager.addCustomEase({
            name: "wipe",
            curve: Device.mobile ? "cubic-bezier(.08,.3,.02,.98)" : "cubic-bezier(.29,.23,.13,1)"
        })
    }

    function c() {
        e.events.subscribe(HydraEvents.RESIZE, b)
    }

    function b() {
        if (Device.mobile) {
            e.events.fire(ATEvents.RESIZE)
        } else {
            clearTimeout(a);
            a = e.delayedCall(function() {
                e.events.fire(ATEvents.RESIZE)
            }, 100)
        }
    }
    this.exists = function(f, g) {
        var h = PROJECTS[f];
        return h && h[g]
    };
    this.matchTag = function(f, g) {
        return g.tags.indexOf(f) > -1
    }
}, "static");
Class(function DelaunayTriangulation(d, f, e) {
    var g = this;
    this.rect = [{
        x: 0,
        y: 0
    }, {
        x: d,
        y: 0
    }, {
        x: 0,
        y: f
    }, {
        x: d,
        y: f
    }];
    this.points = e;
    this.triangles = [
        [this.rect[0], this.rect[1], this.rect[2]],
        [this.rect[1], this.rect[2], this.rect[3]]
    ];

    function j(m, o) {
        var n = l(m);
        return n ? n.r2 >= b(o, n.o) : 0
    }

    function b(n, m) {
        return Math.pow((n.x - m.x), 2) + Math.pow((n.y - m.y), 2)
    }

    function l(x) {
        var t, s, E, C, p, n;
        var r, q, A, z;
        var B, F, D, v, m, y, u, w;
        t = x[0].x;
        s = x[0].y;
        E = x[1].x;
        C = x[1].y;
        p = x[2].x;
        n = x[2].y;
        r = t - p;
        q = s - n;
        A = E - p;
        z = C - n;
        B = r * z - q * A;
        if (B === 0) {
            return null
        }
        v = t * t + s * s;
        m = E * E + C * C;
        y = p * p + n * n;
        F = v - y;
        D = m - y;
        u = {
            x: (z * F - q * D) / B / 2,
            y: (-A * F + r * D) / B / 2
        };
        w = b(u, x[2]);
        return {
            o: u,
            r2: w
        }
    }

    function h(r, s) {
        var o = [];
        var q = [];
        for (var m = 0, t = r.length; m < t; m++) {
            if (j(r[m], s)) {
                o.push(r[m])
            } else {
                q.push(r[m])
            }
        }
        return {
            ok: o,
            ng: q
        }
    }

    function c(o) {
        var u = [];
        var q = a(o);
        var m = q.length;
        for (var r = 0; r < m - 1; r++) {
            var t = q[r];
            if (t.skip) {
                continue
            }
            var v = false;
            for (var p = r + 1; p < m; p++) {
                var s = q[p];
                if ((t[0].x == s[0].x && t[0].y == s[0].y && t[1].x == s[1].x && t[1].y == s[1].y) || (t[0].x == s[1].x && t[0].y == s[1].y && t[1].x == s[0].x && t[1].y == s[0].y)) {
                    q[p].skip = true;
                    v = true;
                    break
                }
            }
            v || u.push([t[0], t[1]])
        }
        if (!q[m - 1].skip) {
            u.push([q[m - 1][0], q[m - 1][1]])
        }
        return u
    }

    function a(q) {
        var m = [];
        for (var p = 0, r = q.length; p < r; p++) {
            var o = q[p];
            m.push([o[0], o[1]], [o[1], o[2]], [o[2], o[0]])
        }
        return m
    }

    function k(o, s) {
        var r = [];
        for (var m = 0, t = o.length; m < t; m++) {
            var q = o[m];
            r.push([q[0], q[1], s])
        }
        return r
    }
    this.updateRect = function(n, m) {
        this.rect = [{
            x: 0,
            y: 0
        }, {
            x: n,
            y: 0
        }, {
            x: 0,
            y: m
        }, {
            x: n,
            y: m
        }];
        this.triangles = [
            [this.rect[0], this.rect[1], this.rect[2]],
            [this.rect[1], this.rect[2], this.rect[3]]
        ]
    };
    this.split = function() {
        var r = this.triangles;
        for (var o = 0, u = this.points.length; o < u; o++) {
            var s = this.points[o];
            var m = h(r, s);
            var q = c(m.ok);
            r = m.ng.concat(k(q, s))
        }
        return r
    }
});
Class(function Hardware() {
    var a = this;
    this.OLD_IE = Device.browser.ie && Device.browser.version < 13;
    this.iOSCHROME = (function() {
        var b = Device.detect("crios/") ? Number(Device.agent.split("crios/")[1].split(".")[0]) : 0;
        if (Mobile.os == "iOS" && Mobile.browser == "Chrome" && Mobile.version >= 9 && b >= 48) {
            return false
        }
        return Mobile.os == "iOS" && Mobile.browser == "Chrome"
    })();
    this.BAD_MBP = (function() {
        if (Device.system.os == "mac" && Device.pixelRatio == 2 && screen.width == 1280 && screen.height == 800) {
            return true
        }
        if (Device.system.os.strpos("windows") && !Device.browser.chrome) {
            return true
        }
    })();
    this.BASIC_NAV = Mobile.os == "Android" || this.iOSCHROME;
    this.WEBGL = !Storage.get("preventWebGL") && Device.graphics.webgl;
    this.FORCE_WEBGL_FAIL = false;
    this.FORCE_WEBGL_FALLBACK = false;
    this.MAC = Device.system.os == "mac";
    this.NEW_IPHONE = Device.graphics.webgl.detect(["a8", "a9", "a10", "a11"]);
    this.PERF_RESULTS = {};
    this.REDUCED_WORK = Mobile.os == "Android" || a.OLD_IE;
    this.LONG_LOAD = Mobile.os == "Android" || a.OLD_IE;
    this.PREVENT_TILT = false;
    this.FORCE_RETINA = Device.detect("pixel c") || a.NEW_IPHONE;
    this.HOME_VIDEO = !Device.mobile && !Device.browser.ie;
    this.ANIMATE_BG = !Device.browser.firefox && !a.OLD_IE && !a.iOSCHROME;
    this.SIMPLE_OPEN = Device.browser.safari || Device.browser.firefox || Device.browser.ie || a.iOSCHROME;
    this.DEDICATED_GRAPHICS = Device.graphics.webgl.detect(["nvidia", "amd"]);
    Hydra.ready(function() {
        if (a.OLD_IE) {
            a.WEBGL = false;
            a.REDUCED_WORK = true
        }
        nextFrame(function() {
            if (Mobile.os == "Android" && Mobile.tablet && Math.min(Stage.width, Stage.height) < 580) {
                Mobile.tablet = false;
                Mobile.phone = true;
                a.FORCE_PHONE = true;
                Render.start(function() {
                    Mobile.tablet = false;
                    Mobile.phone = true
                })
            }
        })
    });
    this.test = function() {
        if (!a.WEBGL) {
            a.ANIMATE_BG = false;
            a.SIMPLE_OPEN = true;
            a.LONG_LOAD = true;
            a.BASIC_NAV = true;
            a.REDUCED_WORK = true
        }
        var b = this.PERF_RESULTS;
        if (Device.mobile) {
            if (Mobile.os == "Android") {
                if (Device.detect("pixel c")) {
                    this.BASIC_NAV = false
                }
                if (this.REDUCED_WORK && Mobile.phone) {
                    this.REDUCED_CLOSE = true
                }
                this.ANIMATE_BG = false
            }
            if (Mobile.os == "iOS") {
                if (!this.NEW_IPHONE) {
                    this.LONG_LOAD = true;
                    this.REDUCED_WORK = true;
                    this.BASIC_NAV = true;
                    this.SIMPLE_OPEN = true;
                    this.ANIMATE_BG = false
                }
                if (Mobile.version < 9) {
                    this.HOME_VIDEO = false
                }
            }
            if (Storage.get("preventWebGL") || (Device.graphics.webgl.detect(["a5", "a4"]))) {
                this.LONG_LOAD = true;
                this.REDUCED_WORK = true;
                this.BASIC_NAV = true;
                this.PREVENT_TILT = true;
                this.SIMPLE_OPEN = true;
                this.ANIMATE_BG = false
            }
            if (a.REDUCED_WORK) {
                this.HOME_VIDEO = false
            }
            this.HOME_VIDEO = false
        } else {
            if (a.FALLBACK_TRANSITION) {
                a.LONG_LOAD = true
            }
            if (!a.DEDICATED_GRAPHICS && !a.MAC) {
                this.ANIMATE_BG = false;
                this.SIMPLE_OPEN = true;
                if (Stage.width > 1500) {
                    this.NO_VIDEO = true;
                    this.HOME_VIDEO = false
                }
            }
        }
    };
    if (Mobile.os == "Android" && Mobile.browser != "Chrome") {
        window.location.href = "http://activetheory.net/fallback/unsupported.html"
    }
}, "static");
Class(function BasicPass() {
    Inherit(this, NukePass);
    var a = this;
    this.fragmentShader = ["varying vec2 vUv;", "uniform sampler2D tDiffuse;", "void main() {", "gl_FragColor = texture2D(tDiffuse, vUv);", "}"];
    this.init(this.fragmentShader)
});
Class(function Nuke(l, m) {
    Inherit(this, Component);
    var h = this;
    if (!m.renderer) {
        console.error("Nuke :: Must define renderer")
    }
    h.stage = l;
    h.renderer = m.renderer;
    h.camera = m.camera;
    h.scene = m.scene;
    h.rtt = m.rtt;
    h.enabled = m.enabled || true;
    h.passes = m.passes || [];
    var a = m.dpr || 1;
    var f, k, o, d, c;
    var n = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false
    };
    (function() {
        g();
        j()
    })();

    function g() {
        var r = h.stage.width * a;
        var p = h.stage.height * a;
        f = new THREE.WebGLRenderTarget(r, p, n);
        k = new THREE.WebGLRenderTarget(r, p, n);
        c = new THREE.OrthographicCamera(h.stage.width / -2, h.stage.width / 2, h.stage.height / 2, h.stage.height / -2, 1, 1000);
        o = new THREE.Scene();
        var q = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
        d = new THREE.Mesh(q, new THREE.MeshBasicMaterial());
        o.add(d)
    }

    function e(q, p) {
        if (h.rtt) {
            h.renderer.render(q, p || h.camera, h.rtt)
        } else {
            h.renderer.render(q, p || h.camera)
        }
    }

    function j() {
        h.events.subscribe(HydraEvents.RESIZE, b)
    }

    function b() {
        var q = h.stage.width * a;
        var p = h.stage.height * a;
        if (f) {
            f.dispose()
        }
        if (k) {
            k.dispose()
        }
        f = new THREE.WebGLRenderTarget(q, p, n);
        k = new THREE.WebGLRenderTarget(q, p, n);
        c.left = h.stage.width / -2;
        c.right = h.stage.width / 2;
        c.top = h.stage.height / 2;
        c.bottom = h.stage.height / -2;
        c.updateProjectionMatrix()
    }
    h.add = function(q, p) {
        if (typeof p == "number") {
            h.passes.splice(p, 0, q);
            return
        }
        h.passes.push(q)
    };
    h.remove = function(p) {
        if (typeof p == "number") {
            h.passes.splice(p)
        } else {
            h.passes.findAndRemove(p)
        }
    };
    h.renderToTexture = function(q, p) {
        h.renderer.render(h.scene, h.camera, p || f, typeof q == "boolean" ? q : true)
    };
    h.render = function() {
        if (!h.enabled || !h.passes.length) {
            e(h.scene);
            return
        }
        if (!h.multiRender) {
            h.renderer.render(h.scene, h.camera, f, true)
        }
        var q = true;
        for (var p = 0; p < h.passes.length - 1; p++) {
            d.material = h.passes[p].pass;
            d.material.uniforms.tDiffuse.value = q ? f : k;
            h.renderer.render(o, c, q ? k : f);
            q = !q
        }
        d.material = h.passes[h.passes.length - 1].pass;
        d.material.uniforms.tDiffuse.value = q ? f : k;
        e(o, c)
    };
    h.set("dpr", function(p) {
        a = p || Device.pixelRatio;
        b()
    });
    this.get("dpr", function() {
        return a
    })
});
Class(function NukePass(b, a) {
    Inherit(this, Component);
    var c = this;
    this.init = function(d) {
        c = this;
        var f = d || this.constructor.toString().match(/function ([^\(]+)/)[1];
        var e = Array.isArray(d) ? d.join("") : null;
        c.uniforms = c.uniforms || {};
        c.uniforms.tDiffuse = {
            type: "t",
            value: null
        };
        c.pass = new THREE.ShaderMaterial({
            uniforms: c.uniforms,
            vertexShader: typeof a === "string" ? Shaders[f + ".vs"] : "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }",
            fragmentShader: e || Shaders[f + ".fs"]
        });
        c.uniforms = c.pass.uniforms
    };
    this.set = function(d, e) {
        TweenManager.clearTween(c.uniforms[d]);
        this.uniforms[d].value = e
    };
    this.tween = function(e, f, g, h, d, k, j) {
        TweenManager.tween(c.uniforms[e], {
            value: f
        }, g, h, d, k, j)
    };
    if (typeof b === "string") {
        this.init(b)
    }
});
Class(function Raycaster(f) {
    Inherit(this, Component);
    var g = this;
    var e = new THREE.Vector3();
    var b = new THREE.Raycaster();
    var d = null;
    (function() {})();

    function a(j) {
        var h;
        if (Array.isArray(j)) {
            h = b.intersectObjects(j)
        } else {
            h = b.intersectObject(j)
        }
        if (d) {
            c()
        }
        return h
    }

    function c() {
        var h = d.geometry.vertices;
        h[0].copy(b.ray.origin.clone());
        h[1].copy(b.ray.origin.clone().add(b.ray.direction.clone().multiplyScalar(10000)));
        h[0].x += 1;
        d.geometry.verticesNeedUpdate = true
    }
    this.set("camera", function(h) {
        f = h
    });
    this.debug = function(k) {
        var j = new THREE.Geometry();
        j.vertices.push(new THREE.Vector3(-100, 0, 0));
        j.vertices.push(new THREE.Vector3(100, 0, 0));
        var h = new THREE.LineBasicMaterial({
            color: 16711680
        });
        d = new THREE.Line(j, h);
        k.add(d)
    };
    this.checkHit = function(k, h) {
        h = h || Mouse;
        var j = g.rect || Stage;
        e.x = (h.x / j.width) * 2 - 1;
        e.y = -(h.y / j.height) * 2 + 1;
        b.setFromCamera(e, f);
        return a(k)
    };
    this.checkFromValues = function(j, h, k) {
        b.set(h, k, 0, Number.POSITIVE_INFINITY);
        return a(j)
    }
});
Class(function ScreenProjection(c) {
    Inherit(this, Component);
    var d = this;
    var b = new THREE.Vector3();
    var a = new THREE.Vector3();
    (function() {})();
    this.set("camera", function(e) {
        c = e
    });
    this.unproject = function(e) {
        var f = d.rect || Stage;
        b.set((e.x / f.width) * 2 - 1, -(e.y / f.height) * 2 + 1, 0.5);
        b.unproject(c);
        var h = c.position;
        b.sub(h).normalize();
        var g = -h.z / b.z;
        a.copy(h).add(b.multiplyScalar(g));
        return a
    };
    this.project = function(f, e) {
        e = e || Stage;
        if (f instanceof THREE.Object3D) {
            f.updateMatrixWorld();
            b.set(0, 0, 0).setFromMatrixPosition(f.matrixWorld)
        } else {
            b.copy(f)
        }
        b.project(c);
        b.x = (b.x + 1) / 2 * e.width;
        b.y = -(b.y - 1) / 2 * e.height;
        return b
    }
});
Class(function RandomEulerRotation(b) {
    var e = this;
    var c = ["x", "y", "z"];
    var a;
    this.speed = 1;
    (function() {
        d()
    })();

    function d() {
        a = {};
        a.x = Utils.doRandom(0, 2);
        a.y = Utils.doRandom(0, 2);
        a.z = Utils.doRandom(0, 2);
        a.vx = Utils.doRandom(-5, 5) * 0.0025;
        a.vy = Utils.doRandom(-5, 5) * 0.0025;
        a.vz = Utils.doRandom(-5, 5) * 0.0025
    }
    this.update = function() {
        var h = Render.TIME;
        for (var g = 0; g < 3; g++) {
            var f = c[g];
            switch (a[f]) {
                case 0:
                    b.rotation[f] += Math.cos(Math.sin(h * 0.25)) * a["v" + f] * e.speed;
                    break;
                case 1:
                    b.rotation[f] += Math.cos(Math.sin(h * 0.25)) * a["v" + f] * e.speed;
                    break;
                case 2:
                    b.rotation[f] += Math.cos(Math.cos(h * 0.25)) * a["v" + f] * e.speed;
                    break
            }
        }
    }
});
Class(function Shader(f, b, a, d) {
    Inherit(this, Component);
    var e = this;
    (function() {
        if (Hydra.LOCAL && a) {
            c()
        }
        if (d) {
            e.uniforms = d.uniforms;
            e.attributes = d.attributes
        }
    })();

    function c() {
        Dev.expose(a, e)
    }
    this.get("material", function() {
        if (!d) {
            var g = {};
            g.vertexShader = Shaders.getShader(f + ".vs");
            g.fragmentShader = Shaders.getShader(b + ".fs");
            if (e.attributes) {
                g.attributes = e.attributes
            }
            if (e.uniforms) {
                g.uniforms = e.uniforms
            }
            d = new THREE.ShaderMaterial(g);
            d.shader = e
        }
        return d
    });
    this.set = function(g, h) {
        TweenManager.clearTween(e.uniforms[g]);
        if (typeof h !== "undefined") {
            e.uniforms[g].value = h
        }
        return e.uniforms[g].value
    };
    this.getValues = function() {
        var g = {};
        for (var h in e.uniforms) {
            g[h] = e.uniforms[h].value
        }
        return g
    };
    this.copyUniformsTo = function(h) {
        for (var g in e.uniforms) {
            h.uniforms[g] = e.uniforms[g]
        }
    };
    this.tween = function(h, j, k, l, g, n, m) {
        TweenManager.tween(e.uniforms[h], {
            value: j
        }, k, l, g, n, m)
    };
    this.clone = function(g) {
        return new Shader(f, b, g || a, e.material.clone())
    }
});
Class(function Utils3D() {
    var e = this;
    var d, c, a;
    var b = {};
    this.PATH = "";
    this.decompose = function(f, g) {
        f.matrixWorld.decompose(g.position, g.quaternion, g.scale)
    };
    this.createDebug = function(j, f) {
        var h = new THREE.IcosahedronGeometry(j || 40, 1);
        var g = f ? new THREE.MeshBasicMaterial({
            color: f
        }) : new THREE.MeshNormalMaterial();
        return new THREE.Mesh(h, g)
    };
    this.createRT = function(g, f) {
        var h = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        return new THREE.WebGLRenderTarget(g, f, h)
    };
    this.getTexture = function(j, h) {
        if (!b[j]) {
            var f = new Image();
            f.crossOrigin = "";
            f.src = e.PATH + j;
            var g = new THREE.Texture(f);
            f.onload = function() {
                g.needsUpdate = true;
                if (g.onload) {
                    g.onload();
                    g.onload = null
                }
            };
            b[j] = g;
            if (!h) {
                g.minFilter = THREE.LinearFilter
            }
        }
        return b[j]
    };
    this.setInfinity = function(f) {
        var g = Number.POSITIVE_INFINITY;
        f.set(g, g, g);
        return f
    };
    this.freezeMatrix = function(f) {
        f.matrixAutoUpdate = false;
        f.updateMatrix()
    };
    this.getCubemap = function(k) {
        var j = "cube_" + (Array.isArray(k) ? k[0] : k);
        if (!b[j]) {
            var f = [];
            for (var h = 0; h < 6; h++) {
                var g = new Image();
                g.crossOrigin = "";
                g.src = e.PATH + (Array.isArray(k) ? k[h] : k);
                f.push(g);
                g.onload = function() {
                    b[j].needsUpdate = true
                }
            }
            b[j] = new THREE.Texture();
            b[j].image = f;
            b[j].minFilter = THREE.LinearFilter
        }
        return b[j]
    };
    this.loadObject = function(f) {
        if (!d) {
            d = new THREE.ObjectLoader()
        }
        return d.parse(Hydra.JSON[f])
    };
    this.loadGeometry = function(f) {
        if (!c) {
            c = new THREE.JSONLoader()
        }
        if (!a) {
            a = new THREE.BufferGeometryLoader()
        }
        var g = Hydra.JSON[f];
        if (g.type == "BufferGeometry") {
            return a.parse(g)
        } else {
            return c.parse(g.data).geometry
        }
    };
    this.disposeAllTextures = function() {
        for (var f in b) {
            b[f].dispose()
        }
    };
    this.disableWarnings = function() {
        window.console.warn = function(g, f) {};
        window.console.error = function() {}
    }
}, "static");
Class(function InlineVideo(c) {
    Inherit(this, Component);
    var l = this;
    var m = {
        time: 0,
        duration: 0
    };
    this.width = c.width || 0;
    this.height = c.height || 0;
    this.loop = c.loop || true;
    this.fps = 1000 / (c.fps || 24);
    this.autoPlay = c.autoPlay || false;
    this.playing = false;
    this.loaded = false;
    var d, h, j, a;
    var q = 0;
    var n = 0;
    (function() {
        g();
        e();
        f();
        d.div.addEventListener("timeupdate", s, false)
    })();

    function g() {
        if (!c.src) {
            console.warn("src is required")
        }
        d = l.initClass(Video, {
            src: c.src,
            loop: c.loop,
            width: c.width,
            height: c.height
        });
        d.div.load();
        l.video = d
    }

    function e() {
        h = l.initClass(Canvas, l.width, l.height);
        j = h.context;
        l.element = h.object;
        l.div = h.div;
        l.object = h.object
    }

    function p(u, v, w) {
        q += w;
        if (q < l.fps) {
            return
        }
        q -= l.fps;
        n++;
        if (n * l.fps > a) {
            n = 0;
            if (!l.loop) {
                b()
            }
        }
        d.div.currentTime = (n * l.fps) / 1000
    }

    function r() {
        Render.start(p);
        l.playing = true
    }

    function b() {
        Render.stop(p);
        l.playing = false
    }

    function f() {
        d.div.addEventListener("canplay", o, false);
        d.div.addEventListener("timeupdate", s, false)
    }

    function o() {
        d.div.removeEventListener("canplay", o, false);
        l.loaded = true;
        a = d.div.duration * 1000;
        if (l.autoPlay) {
            r()
        }
        if (l.onLoad && typeof l.onLoad == "function") {
            l.onLoad()
        }
    }

    function s() {
        if (!l.loaded) {
            return
        }
        j.drawImage(d.div, 0, 0, h.width, h.height);
        m.time = d.div.currentTime;
        m.duration = d.div.duration;
        l.events.fire(HydraEvents.UPDATE, m, true)
    }

    function k(u, t) {
        l.width = u;
        l.height = t;
        h.size(u, t)
    }
    this.play = r;
    this.pause = b;
    this.size = k;
    this.render = s;
    this.seek = d.seek;
    this.stop = d.stop;
    this.ready = function() {
        return false
    }
});
Class(function KeyboardUtil() {
    Inherit(this, Component);
    var e = this;
    e.DOWN = "keyboard_down";
    e.PRESS = "keyboard_press";
    e.UP = "keyboard_up";
    (function() {
        Hydra.ready(c)
    })();

    function c() {
        __window.keydown(b);
        __window.keyup(d);
        __window.keypress(a)
    }

    function b(f) {
        e.events.fire(e.DOWN, f)
    }

    function d(f) {
        e.events.fire(e.UP, f)
    }

    function a(f) {
        e.events.fire(e.PRESS, f)
    }
}, "static");
Module(function Randomizr() {
    this.exports = b;
    var a = [];

    function b(f, c, d) {
        var e = Utils.doRandom(f, c);
        if (c > 3) {
            while (a.indexOf(e) > -1) {
                e = Utils.doRandom(f, c)
            }
            a.push(e);
            if (a.length > d) {
                a.shift()
            }
        }
        return e
    }
});
Class(function ScrollUtil() {
    Inherit(this, Component);
    var d = this;
    var m;
    var e = [];
    var j = false;
    var b = {};
    var f = {};
    var k = {};
    d.lerp = Device.mobile ? 1 : 0.075;
    (function() {
        c();
        Hydra.ready(g)
    })();

    function c() {
        if (Device.browser.ie) {
            return m = 2
        }
        if (Device.system.os == "mac") {
            if (Device.browser.chrome || Device.browser.safari) {
                m = 40
            } else {
                m = 1
            }
        } else {
            if (Device.browser.chrome) {
                m = 15
            } else {
                m = 0.5
            }
        }
    }

    function g() {
        if (!Device.mobile) {
            __document.bind("wheel", h);
            __document.bind("mousewheel", h);
            d.events.subscribe(KeyboardUtil.DOWN, a)
        }
    }

    function a(o) {
        var n = 750;
        if (o.code == 40) {
            h({
                deltaY: n,
                deltaX: 0,
                key: true
            })
        }
        if (o.code == 39) {
            h({
                deltaY: 0,
                deltaX: n,
                key: true
            })
        }
        if (o.code == 38) {
            h({
                deltaY: -n,
                deltaX: 0,
                key: true
            })
        }
        if (o.code == 37) {
            h({
                deltaY: 0,
                deltaX: -n,
                key: true
            })
        }
    }

    function h(q) {
        if (d.stopDefault) {
            return
        }
        if (q.preventDefault && !d.disabled) {
            q.preventDefault()
        }
        if (Device.browser.ie && !q.key) {
            q = window.event || q
        }
        var o = q.wheelDelta || -q.detail;
        if (typeof q.deltaX !== "undefined" || q.key) {
            b.x = -q.deltaX * 0.4;
            b.y = q.deltaY * 0.4
        } else {
            b.x = 0;
            var r = Math.ceil(-o / m);
            if (q.preventDefault) {
                q.preventDefault()
            }
            if (r <= 0) {
                r -= 1
            }
            r = Utils.clamp(r, -60, 60);
            b.y = r * 3.5
        }
        var n = Render.TIME - f.time;
        var p = b.y - f.y;
        f.time = Render.TIME;
        f.x = b.x;
        f.y = b.y;
        if (k.allow) {
            if (n == 0 && Math.abs(p) > 5 || n > 50) {
                k.allow = false;
                k.prevent = false;
                k.y = null
            }
        }
        if (k.prevent) {
            return
        }
        if (k.y != null) {
            if (k.y < 0) {
                if (b.y <= f.y) {
                    k.prevent = true;
                    return
                }
            } else {
                if (b.y >= f.y) {
                    k.prevent = true;
                    return
                }
            }
        }
        if (Math.abs(b.y) < 1) {
            d.lerp = 0.2
        }
        defer(function() {
            l(b)
        })
    }

    function l(o) {
        if (Device.browser.firefox && o.x == 0 && Math.abs(o.y) < 20) {
            o.y *= 5
        }
        for (var n = 0; n < e.length; n++) {
            e[n](o)
        }
    }
    this.reset = function() {
        this.value = 0
    };
    this.link = function(n) {
        e.push(n)
    };
    this.unlink = function(o) {
        var n = e.indexOf(o);
        if (n > -1) {
            e.splice(n, 1)
        }
    };
    this.block = function() {
        k.x = f.x;
        k.y = f.y
    };
    this.unblock = function() {
        if (!k.y) {
            return
        }
        k.allow = true
    }
}, "Static");
Class(function WiggleBehavior(a) {
    Inherit(this, Component);
    var e = this;
    var c = Utils.toRadians(Utils.doRandom(0, 360));
    var b = new Vector3();
    var d = new Vector3();
    this.target = b;
    this.scale = 0.1;
    this.alpha = 0.025;
    this.speed = 1;
    this.zMove = 2;
    this.enabled = true;
    (function() {
        if (a) {
            d.copyFrom(a)
        }
    })();
    this.update = function() {
        if (!e.enabled || e.disabled) {
            return
        }
        var f = window.Render ? Render.TIME : Date.now();
        b.x = Math.cos(c + f * (0.00075 * e.speed)) * (c + Math.sin(f * (0.00095 * e.speed)) * 200);
        b.y = Math.sin(Math.asin(Math.cos(c + f * (0.00085 * e.speed)))) * (Math.sin(c + f * (0.00075 * e.speed)) * 150);
        b.x *= Math.sin(c + f * (0.00075 * e.speed)) * 2;
        b.y *= Math.cos(c + f * (0.00065 * e.speed)) * 1.75;
        b.x *= Math.cos(c + f * (0.00075 * e.speed)) * 1.1;
        b.y *= Math.sin(c + f * (0.00025 * e.speed)) * 1.15;
        b.z = Math.sin(c + b.x * 0.0025) * (100 * e.zMove);
        b.multiply(e.scale);
        b.add(d);
        if (a) {
            if (e.ease) {
                a.interp(b, e.alpha, e.ease)
            } else {
                a.lerp(b, e.alpha)
            }
        }
    };
    this.copyOrigin = function() {
        d.copyFrom(a)
    }
});
Class(function Data() {
    Inherit(this, Model);
    Inherit(this, PushState);
    var e = this;
    var c;
    (function() {
        d()
    })();

    function b(f) {
        return Config.PAGES.indexOf(f.toLowerCase()) > -1 ? f : "home"
    }

    function d() {
        e.dispatcher.events.add(HydraEvents.UPDATE, a)
    }

    function a(f) {
        e.events.fire(ATEvents.STATE_CHANGE, f)
    }
    this.getPage = function() {
        if (Global.PLAYGROUND) {
            if (Hydra.HASH.toLowerCase().strpos("lab")) {
                return "lab"
            }
            return Hydra.HASH.split("playground/")[1].split("/")[0].toLowerCase()
        }
        var f = (c || this.getState()).split("/");
        return b(f[0])
    };
    this.getDeeplink = function() {
        var f = this.getState().split("/");
        return f[1]
    };
    this.getState = function() {
        return this._getState()
    };
    this.setState = function(f) {
        c = f;
        if (Global.PLAYGROUND) {
            return
        }
        if (f != this.getState() && f != "work" && f != "lab") {
            this._setState(f)
        }
        GATracker.trackPage(f)
    };
    this.replaceState = function(f) {
        c = f;
        if (Global.PLAYGROUND) {
            return
        }
        if (!Hydra.LOCAL && f != this.getState()) {
            this._replaceState(f)
        }
    }
}, "static");
Data.Class(function About() {
    Inherit(this, Model);
    var c = this;
    var b;
    (function() {})();

    function a() {
        var d = [];
        var e = b.awards_count.split("\n");
        e.forEach(function(h) {
            var j = h.split(" (");
            var f = j[1].split(")")[0];
            var g = {};
            g.title = j[0];
            g.count = Number(f);
            g.image = g.title.toLowerCase();
            d.push(g)
        });
        b.awards_obj = d
    }
    this.init = function(d) {
        b = d
    };
    this.getData = function() {
        a();
        return b
    }
});
Data.Class(function Contact() {
    Inherit(this, Model);
    var b = this;
    var a;
    (function() {})();
    this.init = function(c) {
        a = c
    }
});
Data.Class(function Home() {
    Inherit(this, Model);
    var b = this;
    var a;
    (function() {})();
    this.init = function(f) {
        a = [];
        for (var c = 0; c < f.length; c++) {
            var h = f[c];
            var e = {};
            e.deeplink = h.deeplink;
            e.title = h.title;
            var g = h.timecode.split("/");
            e.timeIn = parseFloat(g[0]);
            e.timeOut = parseFloat(g[1]);
            a.push(e)
        }
    };
    this.getProjects = function() {
        return a
    }
});
Class(function BaseWork() {
    var h = this;
    var b, c, a;
    var g = 0;
    this.sortTag = "everything";
    (function() {
        if (!Data.awards) {
            Data.awards = {}
        }
        b = Data.awards
    })();

    function f() {
        c.forEach(function(m) {
            var j = [];
            if (m.awards && m.awards.length) {
                var l = m.awards.split("\n");
                l.forEach(function(p) {
                    var q = p.split(" (");
                    var n = q[1].split(")")[0];
                    var o = {};
                    o.title = q[0];
                    o.count = Number(n);
                    o.image = o.title.toLowerCase();
                    j.push(o);
                    if (!b[o.title]) {
                        b[o.title] = {
                            title: o.title,
                            count: o.count
                        }
                    } else {
                        b[o.title].count += o.count
                    }
                })
            }
            for (var k in m) {
                if (!m[k].length) {
                    delete m[k]
                }
            }
            m.awards = j
        })
    }

    function e(j) {
        for (var k = 0; k < c.length; k++) {
            var l = c[k];
            if (l.perma == j) {
                return k
            }
        }
    }

    function d(k) {
        var j = [Config.CDN + "assets/projects/" + h.type + "/" + k.asset_folder + "/bg.jpg", Config.CDN + "assets/projects/" + h.type + "/" + k.asset_folder + "/thumb.jpg", ];
        if (k.client_logo) {
            j.push(Config.CDN + "assets/images/common/logos/" + k.client_logo + ".png")
        }
        return j
    }
    this.init = function(j) {
        h = this;
        a = j;
        c = j;
        f();
        this.ready && this.ready(j)
    };
    this.getAllData = function() {
        return c
    };
    this.setCurrent = function(j, k) {
        var l = g;
        g = e(j) || 0;
        if (!k) {
            Data.setState(h.type + "/" + c[g].perma);
            Data.setTitle(c[g].title + " / Active Theory")
        }
        return g - l
    };
    this.moveIndex = function(j) {
        g += j;
        if (g < 0) {
            g = c.length - 1
        }
        if (g > c.length - 1) {
            g = 0
        }
        Data.setState(h.type + "/" + c[g].perma);
        Data.setTitle(c[g].title + " / Active Theory")
    };
    this.getFirst = function() {
        return c[0]
    };
    this.getCurrent = function() {
        return c[g]
    };
    this.getPrev = function() {
        var j = g - 1;
        if (j < 0) {
            j = c.length - 1
        }
        return c[j]
    };
    this.getNext = function() {
        var j = g + 1;
        if (j > c.length - 1) {
            j = 0
        }
        return c[j]
    };
    this.setup = function(k) {
        if (Global.PLAYGROUND) {
            return
        }
        var j = Data.getDeeplink();
        if (j || k) {
            this.setCurrent(j, true)
        } else {
            Data.replaceState(h.type + "/" + h.getCurrent().perma)
        }
        Data.setTitle(h.getCurrent().title + " / Active Theory")
    };
    this.teardown = function() {
        c = a;
        this.sortTag = "everything"
    };
    this.sort = function(k) {
        var j = h.getCurrent().perma;
        c = [];
        k.forEach(function(l) {
            c.push(l.data)
        });
        h.setCurrent(j, true)
    };
    this.loadInitialAssets = function(k) {
        this.setup(true);
        var j = d(h.getCurrent());
        AssetLoader.loadAssets(j, k)
    };
    this.loadAllAssets = function(k) {
        if (this.loaded) {
            return []
        }
        this.loaded = true;
        var j = [];
        a.forEach(function(l) {
            j = j.concat(d(l))
        });
        if (k) {
            return j
        }
        AssetLoader.loadAssets(j)
    }
});
Data.Class(function Lab() {
    Inherit(this, Model);
    Inherit(this, BaseWork);
    var a = this;
    this.type = "lab";
    (function() {})()
});
Data.Class(function Work() {
    Inherit(this, Model);
    Inherit(this, BaseWork);
    var c = this;
    var a = [];
    this.type = "work";
    (function() {})();

    function b(d) {
        var e = function(g) {
            g = "everything, " + g;
            g = g.replace(/ /g, "").toLowerCase();
            g = g.split(",");
            for (var h = 0; h < g.length; h++) {
                var f = g[h];
                if (!f.length) {
                    a.splice(h, 1);
                    continue
                }
                if (a.indexOf(f) == -1) {
                    a.push(f)
                }
            }
            return g
        };
        d.forEach(function(g, f) {
            g.sortOrder = f;
            g.tags = g.tags || [];
            g.tags = e(g.tags)
        })
    }
    this.ready = function(e) {
        if (Hydra.HASH.strpos("playground")) {
            var d = Hydra.HASH.split("/");
            d = d[d.length - 1];
            c.setCurrent(d, true)
        }
        b(e)
    };
    this.getTags = function() {
        return a
    }
});
Class(function About() {
    Inherit(this, Controller);
    var p = this;
    var o, f, h, b, f, t;
    var c;
    var j = new Vector2(0, 0);
    var g = new Vector2(0, 0);
    var y = 5000;
    var z = Device.mobile ? 1 : 0.09;
    var q = 0;
    var x = Hardware.iOSCHROME || navigator.standalone;
    var v;
    (function() {
        r();
        k();
        l()
    })();

    function r() {
        o = p.container;
        o.size("100%").invisible();
        f = o.create(".scroll");
        f.size("100%").setZ(2).css({
            overflow: "scroll"
        });
        f.inner = f.create(".scroll-inner");
        f.inner.css({
            height: y,
            position: "relative",
            top: 0
        }).mouseEnabled(false);
        t = o.create(".fixed");
        t.size("100%").css({
            position: "fixed",
            top: 0
        }).mouseEnabled(false).invisible().setZ(3).bg("#000");
        t.back = t.create(".fixed-bg");
        t.back.size("100%").bg("assets/images/about/bg.jpg", "cover");
        t.blur = t.create(".fixed-bg");
        t.blur.size("100%").bg("assets/images/about/bg-blur.jpg", "cover").css({
            opacity: 0
        });
        t.inner = t.create(".fixed-inner");
        t.inner.size("100%").css({
            height: "",
            top: 0
        });
        h = o.create(".logo");
        var A = Mobile.phone ? 0.3 : 0.4;
        h.size(600 * A, 50 * A).center(1, 0).css({
            top: Config.UI_OFFSET + 5,
            opacity: 0
        }).bg("assets/images/about/logo-wide.png").setZ(10)
    }

    function k() {
        c = p.initClass(AboutView, x, null);
        t.inner.add(c);
        if (x) {
            f.inner.add(c);
            f.setZ(10)
        }
    }

    function l() {
        p.events.subscribe(HydraEvents.RESIZE, u);
        p.events.subscribe(KeyboardUtil.DOWN, n);
        if (Device.browser.ie && Device.browser.version <= 10) {
            ScrollUtil.link(a)
        } else {
            if (!Device.mobile) {
                ScrollUtil.link(e)
            }
        }
    }

    function s(A) {
        return !isNaN(parseFloat(A)) && isFinite(A)
    }

    function m() {
        o.visible();
        t.back.css({
            opacity: 0
        }).transform({
            scale: 1.08
        }).tween({
            opacity: 1,
            scale: 1
        }, 4000, "easeOutSine");
        t.visible();
        t.inner.css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 500, "easeInOutSine", 200);
        h.tween({
            opacity: 1
        }, 2000, "easeInOutSine", 1000);
        p.delayedCall(c.animateIn, 2500);
        p.delayedCall(function() {
            ScrollUtil.disabled = true;
            Render.start(w);
            f.size("100%").css({
                overflowY: "scroll",
                overflowX: "hidden"
            });
            f.div.scrollTop = 0;
            Mobile.overflowScroll(f, false, true)
        }, 1000)
    }

    function n(C) {
        if (!ScrollUtil.disabled) {
            return
        }
        if (C.code == 38 || C.code == 40 || C.keyCode === 38 || C.keyCode === 40) {
            var B = s(C.code) ? C.code == 38 ? -1 : 1 : C.keyCode === 38 ? -1 : 1;
            var A = c.current + B;
            d(A)
        }
    }

    function a(B) {
        var A = y - Stage.height;
        if (ScrollUtil.disabled) {
            q = q + B.y;
            if (q <= 0) {
                q = 0
            }
            if (q >= A) {
                q = A
            }
            j.y = q;
            g.lerp(j, ScrollUtil.lerp)
        }
    }

    function e(A) {
        if (p.scrolling) {
            TweenManager.clearTween(g);
            p.scrolling = false;
            ScrollUtil.disabled = true
        }
        clearTimeout(v);
        if (Math.abs(y - Stage.height - g.y) < 100) {
            return
        }
        v = setTimeout(function() {
            if (!c.centers) {
                return
            }
            var B = c.current;
            var E = c.centers[c.current];
            var D = c.centers[c.current - 1];
            if (D && Math.abs(g.y - D) < Math.abs(g.y - E)) {
                B = c.current - 1
            }
            var C = c.centers[c.current + 1];
            if (C && Math.abs(g.y - C) < Math.abs(g.y - E)) {
                B = c.current + 1
            }
            d(B)
        }, ScrollUtil.trackPad ? 100 : 800)
    }

    function d(A) {
        var C = c.centers[A];
        C = Utils.clamp(C, 0, y - Stage.height);
        if (Math.abs(C - g.y) > Stage.height * 0.33 || A < 2 || A > 4) {
            return
        }
        if (!s(C)) {
            C = 0
        }
        ScrollUtil.disabled = false;
        p.scrolling = true;
        var B = Math.abs(C - g.y);
        TweenManager.tween(g, {
            y: C
        }, 500 + B, "easeInOutCubic", function() {
            ScrollUtil.disabled = true;
            p.scrolling = false
        }, function() {
            f.div.scrollTop = g.y
        })
    }

    function w() {
        if (ScrollUtil.disabled && !(Device.browser.ie && Device.browser.version <= 10)) {
            j.y = f.div.scrollTop;
            g.lerp(j, ScrollUtil.lerp)
        }
        if (!x) {
            t.inner.y = -g.y;
            t.inner.transform()
        }
        var A = g.y / (y - Stage.height);
        c.update(A);
        if (g.y > 200) {
            if (!t.blur.showing) {
                t.blur.showing = true;
                t.blur.tween({
                    opacity: 1
                }, 2000, "easeInOutSine")
            }
        } else {
            if (t.blur.showing) {
                t.blur.showing = false;
                t.blur.tween({
                    opacity: 0
                }, 2000, "easeInOutSine")
            }
        }
    }

    function u() {
        o.css({
            width: Stage.width,
            overflowX: "hidden"
        });
        c.resize();
        defer(function() {
            y = c.element.div.offsetHeight;
            f.inner.css({
                height: y,
                width: Stage.width - 1,
                overflow: "hidden"
            })
        })
    }
    this.activate = function() {
        o.show();
        if (Device.browser.firefox || (Device.browser.ie && Device.browser.version > 10)) {
            ScrollUtil.stopDefault = true
        }
        if (p.visible) {
            Render.start(w);
            ScrollUtil.disabled = true
        } else {
            ScrollUtil.disabled = false;
            defer(u);
            p.delayedCall(m, 800)
        }
        p.visible = true
    };
    this.deactivate = function() {
        Render.stop(w);
        ScrollUtil.disabled = false;
        if (ScrollUtil.stopDefault) {
            ScrollUtil.stopDefault = false
        }
        p.delayedCall(function() {
            o.hide()
        }, Hardware.FALLBACK_TRANSITION ? 200 : 700)
    };
    this.onDestroy = function() {
        Render.stop(w);
        ScrollUtil.disabled = false
    }
});
Class(function Container() {
    Inherit(this, Controller);
    var g = this;
    var p;
    var n, f, j;
    var e;
    (function() {
        c();
        o();
        h()
    })();

    function c() {
        p = g.container;
        p.size("100%");
        Stage.add(p)
    }

    function o() {
        var r = g.initClass(Loader);
        r.events.add(Loader.LOAD_GL, l);
        r.events.add(HydraEvents.COMPLETE, function() {
            OuterUI.instance().animateIn();
            var s = Data.getPage();
            b(s);
            r.animateOut(function() {
                r.destroy();
                n.forceComposite()
            })
        })
    }

    function b(r) {
        switch (r) {
            case "work":
            case "lab":
                e = g.initClass(Work);
                break;
            case "about":
                Data.setTitle("About / Active Theory");
                e = g.initClass(About);
                break;
            case "home":
            default:
                Data.setTitle("Active Theory / Creative Digital Production / Venice, CA");
                e = f;
                break
        }
        if (!Hardware.FALLBACK_TRANSITION) {
            e.element.willChange(true)
        }
        e.name = r;
        e.activate()
    }

    function m() {
        g.delayedCall(j.start, 200);
        g.delayedCall(j.animateOut, 300, function() {
            j.stop()
        })
    }

    function k(r) {
        e.deactivate();
        j.color(16777215);
        j.position(0);
        j.animateIn(function() {
            if (!e.persist) {
                e.destroy()
            } else {
                e.hide(true)
            }
            b(r);
            g.delayedCall(function() {
                j.animateOut(function() {
                    j.stop();
                    Data.unlock()
                })
            }, 400)
        })
    }

    function h() {
        g.events.subscribe(ATEvents.STATE_CHANGE, d);
        g.events.subscribe(HydraEvents.BROWSER_FOCUS, q);
        g.events.subscribe(KeyboardUtil.UP, a)
    }

    function a(r) {
        if (r.keyCode == 27 && g.active("menu")) {
            g.menu("close");
            Dispatch.find(HamburgerButton, "close")()
        }
    }

    function q(r) {
        if (r.type == "focus") {
            n && n.forceComposite()
        }
    }

    function d(r) {
        if (!e) {
            return
        }
        if (r.split[0] == e.name) {
            return
        }
        k(r.split[0])
    }

    function l(u) {
        var v = function() {
            j = g.initClass(Transition);
            return Pact.create(j.test)
        };
        var s = function() {
            n = g.initClass(Menu);
            return this.exec(n.test)
        };
        var r = function() {
            Hardware.test();
            f = g.initClass(Home);
            return this.exec(f.test)
        };
        var t = function() {
            u.callback()
        };
        v().then(s).then(r).then(t)
    }
    this.menu = function(s, r, t) {
        if (s == "open") {
            g.active("menu", true);
            Data.lock();
            e.deactivate();
            n.start();
            n.animateIn();
            defer(function() {
                if (!Hardware.FALLBACK_TRANSITION) {
                    e.element.tween({
                        scale: 0.9
                    }, 700, "easeOutQuart")
                }
            });
            j.menu = true;
            j.color(Config.BG_COLOR);
            j.animateIn(function() {
                j.stop();
                j.menu = false;
                if (e.hide) {
                    e.hide()
                }
            })
        } else {
            if (!Hardware.FALLBACK_TRANSITION) {
                g.active("menu", false);
                n.animateOut(function() {
                    n.stop()
                }, r);
                defer(function() {
                    if (!Hardware.FALLBACK_TRANSITION) {
                        e.element.tween({
                            scale: 1
                        }, 800, "easeOutQuart", 100)
                    }
                });
                e.activate();
                g.delayedCall(function() {
                    j.menu = true;
                    j.animateOut(function() {
                        j.menu = false;
                        j.stop();
                        Data.unlock()
                    })
                }, r && !Hardware.FALLBACK_TRANSITION ? 250 : 0)
            } else {
                g.active("menu", false);
                j.show();
                if (!Hardware.WEBGL) {
                    n.element.setZ(99999)
                }
                n.animateOut(function() {
                    n.stop();
                    n.element.setZ(20);
                    if (t) {
                        t()
                    }
                    e.activate();
                    if (r) {
                        j.animateInLoader()
                    }
                    g.delayedCall(function() {
                        j.menu = true;
                        j.animateOut(function() {
                            j.menu = false;
                            j.stop();
                            Data.unlock()
                        })
                    }, Hardware.LONG_LOAD && r ? 1000 : (r ? 200 : 50))
                }, r)
            }
        }
    };
    this.page = function(r) {
        if (r == Data.getPage()) {
            if (g.active("menu")) {
                Dispatch.find(HamburgerButton, "close")();
                g.menu("close")
            }
            return
        }
        Data.lock();
        Data.setState(r);
        Dispatch.find(HamburgerButton, "close")();
        if (g.active("menu")) {
            e.deactivate();
            if (!e.persist) {
                e.destroy()
            }
            if (!Hardware.FALLBACK_TRANSITION) {
                b(r)
            }
            g.menu("close", true, function() {
                if (Hardware.FALLBACK_TRANSITION) {
                    b(r)
                }
            })
        } else {
            j.needsLoader = true;
            k(r);
            j.needsLoader = false;
            defer(function() {
                if (!Hardware.FALLBACK_TRANSITION) {
                    e.element.clearTransform()
                }
            })
        }
    }
}, "singleton");
Class(function Home() {
    Inherit(this, Controller);
    var g = this;
    var j;
    var f, c, l, a, k;
    this.persist = true;
    (function() {
        e();
        h();
        d();
        Dispatch.register(g, "launchWork")
    })();

    function e() {
        j = g.container;
        j.size("100%");
        Stage.add(j);
        if (!Global.PLAYGROUND) {
            j.hide()
        }
    }

    function h() {
        c = HomeVideoController.instance();
        f = g.initClass(HomeSizzle, c.video);
        l = g.initClass(HomeInfo, c.video);
        a = g.initClass(HomeLogo);
        k = g.initClass(HomeButton);
        defer(function() {
            if (!Device.mobile) {
                return
            }
            Mouse.x = Stage.width / 2;
            Mouse.y = Stage.height / 2;
            Dispatch.find(HomeSizzleParticleBehavior, "forceRadius")("over")
        });
        if (Global.PLAYGROUND) {
            f.start()
        }
    }

    function d() {
        g.events.subscribe(HydraEvents.RESIZE, b)
    }

    function b() {
        a.resize()
    }
    this.test = function(m) {
        f.start();
        g.delayedCall(function() {
            f.stop();
            c.reset();
            m()
        }, 50)
    };
    this.activate = function() {
        c.play();
        f.start();
        g.delayedCall(k.animateIn, 500);
        g.delayedCall(function() {
            if (Device.mobile) {
                Dispatch.find(HomeSizzleParticleBehavior, "forceRadius")("out")
            }
        }, 250);
        j.show()
    };
    this.deactivate = function() {
        f.stop();
        c.pause()
    };
    this.hide = function(m) {
        j.hide();
        if (m) {
            c.reset();
            k.reset()
        }
    };
    this.launchWork = function() {
        var m = c.getCurrent() ? c.getCurrent().deeplink : "work/null";
        var n = m.split("/");
        var o = n[0] == "work" ? Data.Work : Data.Lab;
        Container.instance().page(n[0]);
        o.setCurrent(n[1])
    }
});
Class(function HomeSizzle(a) {
    Inherit(this, Controller);
    var g = this;
    var c;
    var b, f;
    (function() {
        e();
        d()
    })();

    function e() {
        c = g.container;
        c.size("100%")
    }

    function d() {
        f = g.initClass(Hardware.WEBGL ? HomeSizzleGL : HomeSizzleBasic, a)
    }
    this.start = function() {
        f.start()
    };
    this.stop = function() {
        f.stop();
        a && a.pause()
    }
});
Class(function HomeVideoController() {
    Inherit(this, Component);
    var g = this;
    var a;
    var c = null;
    var d = null;
    this.elapsed = 0;
    (function() {
        if (Hardware.HOME_VIDEO) {
            b()
        }
    })();

    function b() {
        var l = Device.mobile ? InlineVideo : Video;
        var j = Device.mobile ? "home-mobile" : "home";
        var k = Device.browser.firefox ? "webm" : "mp4";
        var h = Device.browser.safari || Device.mobile || Device.browser.ie ? Config.PROXY : Config.CDN;
        if (l == InlineVideo) {
            k += "?" + Utils.timestamp()
        }
        a = g.initClass(l, {
            src: h + "assets/videos/" + j + "." + k,
            loop: true,
            width: 1024,
            height: 576,
            fps: 30
        });
        a.div.type = "video/" + k;
        a.div.crossOrigin = "";
        a.events.add(HydraEvents.UPDATE, e);
        g.video = a
    }

    function f(h) {
        g.events.fire(ATEvents.SIZZLE_CHANGE, h)
    }

    function e(l) {
        var j = Data.Home.getProjects();
        if (!j) {
            return
        }
        if (a.texture) {
            if (l.time != d && a.ready()) {
                a.texture.needsUpdate = true
            }
            d = l.time
        }
        for (var h = 0; h < j.length; h++) {
            var k = j[h];
            if (l.time > k.timeIn && l.time < k.timeOut) {
                if (c != k) {
                    f(k)
                }
                c = k;
                g.elapsed = Utils.range(l.time, k.timeIn, k.timeOut, 0, 1)
            }
        }
    }
    this.play = function() {
        a && a.play()
    };
    this.pause = function() {
        a && a.pause()
    };
    this.getCurrent = function() {
        return c
    };
    this.reset = function() {
        if (a) {
            a.seek(0);
            a.stop()
        }
    }
}, "singleton");
Class(function Loader() {
    Inherit(this, Controller);
    var s = this;
    var r;
    var b, u, l;
    var d = 0;
    var g = 0;
    (function() {
        t();
        h();
        defer(c);
        Render.start(v)
    })();

    function t() {
        r = s.container;
        r.percent = 0;
        r.size("100%").setZ(9999999).bg("#fff");
        Stage.add(r)
    }

    function h() {
        b = s.initClass(LoaderView)
    }

    function c() {
        AssetUtil.prependPath(Config.PROXY, ["outline.png", "still.jpg", "brightness.jpg", "frame.jpg"]);
        FontLoader.loadFonts(["OpenSans", "OpenSansLight", "OpenSansSemi", "OpenSansBold"]);
        u = s.initClass(AssetLoader, j());
        u.events.add(HydraEvents.PROGRESS, f);
        u.events.add(HydraEvents.COMPLETE, q);
        u.add(2);
        u.time = Date.now();
        a()
    }

    function a() {
        Data.loadData(Config.DATA_API, function() {
            u.trigger(2);
            s.dataLoaded && s.dataLoaded()
        })
    }

    function j() {
        AssetUtil.exclude(["common/logos", "common/awards"]);
        if (Hardware.WEBGL) {
            AssetUtil.exclude("menu/fallback")
        }
        var w = AssetUtil.loadAssets(["common", "menu", "lib", "geometry", "shaders"]);
        var x = Data.getPage();
        switch (x) {
            case "home":
                if (Hardware.HOME_VIDEO) {
                    AssetUtil.exclude("home/still.jpg")
                } else {
                    AssetUtil.exclude("home/frame.jpg")
                }
                HomeVideoController.instance();
                w = w.concat(e());
                break;
            case "work":
            case "lab":
                w = w.concat(o(x));
                break;
            case "about":
                w = w.concat(n());
                break
        }
        return w
    }

    function e() {
        HomeVideoController.instance();
        if (Hardware.WEBGL) {
            AssetUtil.exclude("home/still")
        }
        return AssetUtil.loadAssets("home")
    }

    function o(w) {
        defer(function() {
            u.add(3)
        });
        var x = w == "work" ? Data.Work : Data.Lab;
        s.dataLoaded = function() {
            x.loadInitialAssets(function() {
                x.loadAllAssets();
                u.trigger(3)
            })
        };
        AssetUtil.removeExclude("common/awards");
        return AssetUtil.loadAssets("common/awards")
    }

    function n() {
        return AssetUtil.loadAssets("about")
    }

    function m() {
        var w = [];
        w = w.concat(Data.Work.loadAllAssets(true));
        w = w.concat(Data.Lab.loadAllAssets(true));
        w = w.concat(AssetUtil.loadAssets(["home", "about"]));
        AssetLoader.loadAssets(w);
        HomeVideoController.instance()
    }

    function v() {
        b.updatePath(r.percent, s.complete)
    }

    function f(w) {
        d = w.percent;
        TweenManager.tween(r, {
            percent: w.percent
        }, 300, "easeOutCubic", k)
    }

    function k() {
        if (l) {
            s.events.fire(Loader.LOAD_GL, {
                callback: p
            })
        }
    }

    function q(x) {
        var w = Date.now() - u.time;
        l = true;
        Timer.create(m, 4000)
    }

    function p() {
        d = 1;
        s.complete = true;
        s.events.fire(HydraEvents.COMPLETE)
    }
    this.animateOut = function(y) {
        var x = function() {
            r.tween({
                opacity: 0
            }, 700, "easeOutSine", w, function() {
                if (y) {
                    y()
                }
                Render.stop(v)
            })
        };
        if (Data.getPage() == "home") {
            TweenManager.tween(r, {
                percent: 0
            }, 600, "easeOutExpo");
            x()
        } else {
            var w = Hardware.OLD_IE || Hardware.LONG_LOAD ? 600 : 0;
            b.element.tween({
                opacity: 0,
                scale: 1.05
            }, 300, "easeOutCubic", w, x)
        }
    }
}, function() {
    Loader.LOAD_GL = "load_gl"
});
Class(function Menu() {
    Inherit(this, Controller);
    var l = this;
    var p, c;
    var k, o, g, e, q, b;
    (function() {
        f();
        j();
        if (Mobile.phone) {
            n()
        }
        m();
        d();
        Dispatch.register(l, "forceComposite")
    })();

    function f() {
        p = l.container;
        p.size("100%").setZ(20);
        Stage.add(p);
        if (!Global.PLAYGROUND) {
            p.hide()
        } else {
            Render.start(h)
        }
    }

    function n() {
        c = p.create(".logo");
        var r = Mobile.phone ? 0.3 : 0.4;
        c.size(600 * r, 50 * r).center(1, 0).css({
            top: Config.UI_OFFSET + 5
        }).bg("assets/images/about/logo-wide.png").setZ(100)
    }

    function j() {
        if (Hardware.WEBGL) {
            k = l.initClass(MenuGL)
        } else {
            k = l.initClass(MenuBasic)
        }
        if (!Hardware.WEBGL) {
            g = l.initClass(MenuList)
        } else {
            g = l.initClass(MenuCSS, k)
        }
        e = l.initClass(MenuFooter);
        if (Global.PLAYGROUND && g) {
            g.animateIn()
        }
        if (Global.PLAYGROUND && e) {
            e.animateIn()
        }
        if (!Mobile.phone) {
            b = l.initClass(MenuShare)
        }
    }

    function h() {
        k.render();
        g.render()
    }

    function m() {
        l.events.subscribe(ATEvents.RESIZE, d);
        l.events.subscribe(MenuGL.TEST_END, a)
    }

    function a() {
        defer(function() {
            var r = Hardware.PERF_RESULTS.menuRender;
            if (Hardware.FORCE_WEBGL_FAIL || (r > 200 && Hardware.WEBGL)) {
                Hardware.WEBGL = false;
                k.destroy();
                g.destroy();
                j();
                if (g) {
                    g.resize()
                }
                q && q();
                Storage.set("preventWebGL", true)
            }
            l.events.unsubscribe(MenuGL.TEST_END, a);
            q = null
        })
    }

    function d() {
        k.resize();
        g.resize();
        e.resize()
    }
    this.start = function() {
        p.show();
        Render.start(h)
    };
    this.stop = function() {
        Render.stop(h);
        p.hide()
    };
    this.animateIn = function() {
        l.clearTimers();
        p.setZ(20).clearAlpha();
        if (k) {
            k.animateIn()
        }
        if (g) {
            g.animateIn()
        }
        if (e) {
            e.animateIn()
        }
        if (b) {
            b.animateIn()
        }
        p.mouseEnabled(true);
        c && c.css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 500, "easeOutSine", 500);
        h();
        Menu.OPEN = true
    };
    this.forceComposite = function(r) {
        if (Hardware.FALLBACK_TRANSITION || Menu.OPEN) {
            return
        }
        p.show().mouseEnabled(false);
        Render.start(h);
        l.delayedCall(function() {
            p.mouseEnabled(true);
            if (Menu.OPEN) {
                return
            }
            Render.stop(h);
            p.hide()
        }, 1000)
    };
    this.animateOut = function(s, r) {
        p.bg("#000").setZ(9999);
        defer(function() {
            c && c.tween({
                opacity: 0
            }, 500, "easeOutSine");
            l.delayedCall(function() {
                p.css({
                    background: ""
                })
            }, r ? 300 : 100);
            if (g) {
                g.animateOut()
            }
            if (b) {
                b.animateOut()
            }
            if (k) {
                k.animateOut()
            }
            if (e) {
                e.animateOut()
            }
            l.delayedCall(function() {
                l.delayedCall(s, 600);
                Menu.OPEN = false
            }, r ? 700 : 0)
        })
    };
    this.test = function(r) {
        q = r;
        if (!Hardware.WEBGL) {
            defer(r)
        } else {
            Render.start(h);
            k.test(function() {
                Render.stop(h);
                r();
                q = null
            })
        }
    }
});
Class(function OuterUI() {
    Inherit(this, Controller);
    var f = this;
    var d;
    var c, b;
    (function() {
        e();
        a()
    })();

    function e() {
        d = f.container;
        d.setZ(999999);
        Stage.add(d)
    }

    function a() {
        c = f.initClass(HamburgerButton);
        Stage.add(c);
        f.delayedCall(c.animateIn, 400);
        if (!Mobile.phone) {
            b = f.initClass(CircleLogo);
            Stage.add(b)
        }
    }
    this.animateIn = function() {}
}, "singleton");
Class(function Playground() {
    Inherit(this, Controller);
    var d = this;
    var b;
    (function() {
        c();
        a()
    })();

    function c() {
        b = d.container;
        b.size("100%");
        Stage.add(b);
        Global.PLAYGROUND = true
    }

    function a() {
        var e = Hydra.HASH.split("layground/")[1].split("/")[0];
        if (!window[e]) {
            throw "No class " + e + " found"
        }
        var f = window[e];
        if (f.instance) {
            f.instance()
        } else {
            clss = d.initClass(f)
        }
        if (clss && clss.activate) {
            clss.activate()
        }
    }
}, "singleton");
Class(function Transition() {
    Inherit(this, View);
    var f = this;
    var e;
    var c, d, a;
    (function() {
        b()
    })();

    function b() {
        c = f.element;
        c.size("100%").setZ(9999).hide();
        d = c.create("solid");
        d.size("100%").bg("#fff").setZ(2).css({
            opacity: 0
        });
        a = c.create("loader");
        a.size(40, 40).bg("assets/images/common/loader.png").center().hide().setZ(2);
        var g = new CSSAnimation();
        g.duration = 1000;
        g.loop = true;
        g.frames = [{
            rotation: 0
        }, {
            rotation: 360
        }];
        g.applyTo(a);
        g.play();
        if (Global.PLAYGROUND) {
            defer(function() {
                f.start()
            })
        }
        e = f.initClass(TransitionView)
    }
    this.test = function(g) {
        defer(g)
    };
    this.color = function(g) {};
    this.position = function(g) {
        if (f.menu && !Hardware.WEBGL) {
            return
        }
        c.show();
        e.position(g);
        d.stopTween().css({
            opacity: g
        })
    };
    this.animateIn = function(g) {
        if (!f.menu) {
            c.show()
        }
        if ((!f.menu && !MenuGL.USE_TEXTURE) || Hardware.FALLBACK_TRANSITION) {
            c.show();
            if (f.menu) {
                d.bg(Config.BG_COLOR)
            } else {
                d.bg("#fff")
            }
            d.css({
                opacity: 0
            }).tween({
                opacity: 1
            }, 300, "easeOutCubic", g);
            if (Hardware.LONG_LOAD && f.needsLoader) {
                a.show().css({
                    opacity: 0
                }).tween({
                    opacity: 1
                }, 300, "easeOutSine", 400)
            }
            if (!f.needsLoader) {
                a.hide()
            }
        } else {
            e.start();
            e.animateIn(g)
        }
    };
    this.animateOut = function(j) {
        f.clearTimers();
        if (!f.menu) {
            c.show()
        }
        if ((!f.menu && !MenuGL.USE_TEXTURE) || Hardware.FALLBACK_TRANSITION) {
            c.show();
            var g = Hardware.LONG_LOAD ? 700 : 0;
            var h = Hardware.OLD_IE || Mobile.os == "Android" || Hardware.SIMPLE_OPEN ? g : 100;
            if (!Hardware.WEBGL && f.menu) {
                g *= 1.2
            }
            a.tween({
                opacity: 0
            }, 300, "easeOutCubic", function() {
                a.hide()
            });
            if (f.menu) {
                d.tween({
                    opacity: 0
                }, 300, "easeOutSine", h, j)
            } else {
                d.tween({
                    opacity: 0
                }, 750, "easeOutCubic", g, j)
            }
        } else {
            e.start();
            e.animateOut(j)
        }
    };
    this.animateInLoader = function() {
        if (Hardware.LONG_LOAD) {
            a.show().css({
                opacity: 0
            }).tween({
                opacity: 1
            }, 300, "easeOutSine")
        }
    };
    this.show = function() {
        c.show().css({
            opacity: 1
        })
    };
    this.start = function() {
        if (f.menu && !Hardware.WEBGL) {
            return
        }
        if ((!f.menu && !MenuGL.USE_TEXTURE) || Hardware.FALLBACK_TRANSITION) {
            c.show()
        } else {
            e.start()
        }
    };
    this.stop = function() {
        if (Hardware.LONG_LOAD) {
            a.hide()
        }
        c.hide();
        e.stop()
    }
});
Class(function Filter() {
    Inherit(this, Controller);
    var l = this;
    var q, f, n;
    var k, r, e, o;
    (function() {
        g();
        d();
        c();
        m();
        Dispatch.register(l, "forceClose")
    })();

    function g() {
        q = l.container;
        q.size("100%").css({
            top: 0,
            right: 0
        }).hide().setZ(9);
        q.hidden = true;
        if (!Device.mobile) {
            q.mouseEnabled(false)
        }
        if (Device.mobile) {
            n = q.create(".hit");
            n.size(500, 180).css({
                right: 300,
                top: 0
            })
        }
    }

    function d() {
        k = l.initClass(FilterView)
    }

    function c() {
        if (Mobile.tablet && !Hardware.BASIC_NAV) {
            q.transform({
                x: 200
            });
            r = l.initClass(TweenTimeline);
            r.add(q, {
                x: 0
            }, 600, "linear");
            Render.start(p)
        }
    }

    function j() {
        return;
        if (l.disabled || !WorkNav.OPEN || WorkNavOpenMechanic.TRANSITION) {
            return
        }
        if (Mouse.x > Stage.width - 800 && Mouse.x < Stage.width - 500 && Mouse.y < 200) {
            if (!k.visible) {
                k.animateIn();
                l.disabled = true;
                l.delayedCall(function() {
                    l.disabled = false
                }, 300)
            }
        } else {
            if (k.visible && !k.hovered) {
                k.animateOut();
                l.delayedCall(function() {
                    l.disabled = false
                }, 300)
            }
        }
    }

    function p() {
        r.elapsed = WorkNavOpenMechanic.AMOUNT || 0;
        r.update();
        if (r.elapsed > 0.99) {
            if (o) {
                o = false;
                b({
                    type: "open"
                })
            }
        }
        if (r.elapsed > 0 && q.hidden) {
            q.hidden = false;
            q.visible()
        } else {
            if (r.elapsed == 0 && !q.hidden) {
                q.hidden = true;
                q.invisible()
            }
        }
    }

    function m() {
        l.events.subscribe(WorkNavOpenMechanic.OPEN, b);
        l.events.subscribe(WorkNavOpenMechanic.MOBILE_OPEN, h);
        l.events.subscribe(WorkNavOpenMechanic.TOUCH_CLOSE, a)
    }

    function a() {
        if (!e) {
            b({
                type: "close"
            })
        }
    }

    function h(s) {
        if (s.type == "open") {
            o = true
        } else {
            o = false;
            if (!e) {
                b({
                    type: "close"
                })
            }
        }
    }

    function b(s) {
        if (s.type == "open") {
            e = false;
            q.show();
            k.element.transform({
                x: 200
            }).css({
                opacity: 0
            }).tween({
                x: 0,
                opacity: 1
            }, 600, "easeOutQuart");
            k.line.transform({
                x: 200
            }).tween({
                x: 0
            }, 600, "easeOutQuart", 100);
            k.animateIn()
        } else {
            e = true;
            k.animateOut();
            k.element.tween({
                opacity: 0,
                x: 100
            }, 300, "easeOutCubic");
            k.line.tween({
                x: 50
            }, 300, "easeOutCubic", function() {
                q.hide()
            })
        }
    }
    this.onDestroy = function() {
        Render.stop(p);
        Render.stop(j)
    };
    this.forceClose = function() {
        if (!Device.mobile) {
            return
        }
    }
});
Class(function Work(f) {
    Inherit(this, Controller);
    var g = this;
    var m, l;
    var d, n, c, h;
    var b;
    (function() {
        e();
        k();
        j()
    })();

    function e() {
        m = g.container;
        m.size("100%").css({
            overflow: "hidden"
        })
    }

    function k() {
        b = Data.getPage() == "work" ? Data.Work : Data.Lab;
        b.setup();
        d = g.initClass(WorkLayoutManager, b);
        n = g.initClass(WorkInteraction, d);
        if (!Mobile.phone) {
            l = m.create(".overlay");
            l.size("100%").bg("#000").css({
                opacity: 0
            }).mouseEnabled(false).setZ(8)
        }
        c = g.initClass(WorkNav, b, [Container.instance().element]);
        if (!Mobile.phone && Data.getPage() == "work") {
            h = g.initClass(Filter)
        }
    }

    function j() {
        g.events.subscribe(WorkNavOpenMechanic.OPEN, a);
        g.events.subscribe(WorkNavOpenMechanic.MOBILE_OPEN, a)
    }

    function a(o) {
        if (l) {
            l.tween({
                opacity: o.type == "open" ? 0.6 : 0
            }, 400, "easeOutSine")
        }
    }
    this.deactivate = function() {
        g.clearTimers();
        g.delayedCall(function() {
            m.hide();
            c.element.hide()
        }, Hardware.FALLBACK_TRANSITION ? 300 : 500)
    };
    this.activate = function() {
        g.clearTimers();
        m.show();
        c.element.show()
    };
    this.onDestroy = function() {
        b.teardown()
    }
});
Class(function WorkInteraction(c) {
    Inherit(this, Component);
    var e = this;
    var o, p, g;
    (function() {
        if (Device.mobile) {
            h()
        }
        f()
    })();

    function h() {
        o = e.initClass(Interaction.Input, c.element);
        o.onStart = b;
        o.onUpdate = j;
        o.onEnd = m
    }

    function f() {
        if (!Device.mobile) {
            Stage.bind("touchmove", d);
            Stage.bind("click", n);
            e.events.subscribe(KeyboardUtil.UP, a);
            ScrollUtil.link(l)
        }
    }

    function l(r) {
        if (WorkLayoutManager.TRANSITION || WorkNav.OPEN || Menu.OPEN) {
            return
        }
        TweenManager.clearTween(c);
        c.movement += r.y * 0.002;
        if (Math.abs(c.movement) > 0.2) {
            var q = c.movement < 0 ? -1 : 1;
            c.transition(q);
            ScrollUtil.block()
        } else {
            clearTimeout(g);
            g = e.delayedCall(k, 100)
        }
    }

    function k() {
        TweenManager.tween(c, {
            movement: 0
        }, 700, "easeOutCubic")
    }

    function a(q) {
        if (WorkNav.OPEN || WorkLayoutManager.TRANSITION || Menu.OPEN) {
            return
        }
        if (q.keyCode == 40) {
            c.transition(1)
        } else {
            if (q.keyCode == 38) {
                c.transition(-1)
            }
        }
    }

    function b(q) {
        WorkInteraction.TOUCHING = true;
        if (WorkNav.OPEN || WorkNavOpenMechanic.TRANSITION || WorkLayoutManager.TRANSITION || Menu.OPEN) {
            return
        }
        TweenManager.clearTween(c);
        c.alpha = 1;
        p = true
    }

    function d(r) {
        if (p || WorkNav.OPEN || WorkNavOpenMechanic.DRAGGING || WorkLayoutManager.TRANSITION || Menu.OPEN) {
            return
        }
        c.alpha = 0.07;
        var q;
        if (r.y <= 40) {
            q = Utils.range(r.y, 0, 40, 1, 0);
            c.movement = -q * 0.05
        } else {
            if (r.y >= Stage.height - 40) {
                q = Utils.range(r.y, Stage.height - 40, Stage.height, 0, 1);
                c.movement = q * 0.05
            } else {
                c.movement = 0
            }
        }
    }

    function j(s, r) {
        if (WorkNav.OPEN || WorkNavOpenMechanic.DRAGGING || WorkNavOpenMechanic.TRANSITION || WorkLayoutManager.TRANSITION || Menu.OPEN) {
            return
        }
        var q = (s.y < 0 ? 1 : -1) * Math.abs(s.y) / Stage.height;
        c.movement = q;
        WorkInteraction.TOUCHING = true
    }

    function m(r) {
        WorkInteraction.TOUCHING = false;
        if (WorkNav.OPEN || WorkNavOpenMechanic.DRAGGING || WorkNavOpenMechanic.TRANSITION || WorkLayoutManager.TRANSITION || Menu.OPEN) {
            return
        }
        c.alpha = 1;
        if (Math.abs(c.movement) > 0.5 || Math.abs(o.velocity.y) > 0.2) {
            var q = c.movement < 0 ? -1 : 1;
            c.transition(q);
            p = false;
            c.alpha = 0.07
        } else {
            TweenManager.tween(c, {
                movement: 0
            }, 700, "easeOutCubic", function() {
                p = false;
                c.alpha = 0.07
            })
        }
    }

    function n(q) {
        if (WorkNav.OPEN || q.target.className == "hit" || Menu.OPEN) {
            return
        }
        if (!Device.mobile) {
            if (Mouse.y <= 40) {
                p = false;
                return c.transition(-1)
            }
            if (Mouse.y >= Stage.height - 40) {
                p = false;
                return c.transition(1)
            }
        }
    }
    this.onDestroy = function() {
        ScrollUtil.unlink(l);
        Stage.unbind("touchmove", d);
        Stage.unbind("click", n)
    }
});
Class(function WorkLayoutManager(q) {
    Inherit(this, Controller);
    var x = this;
    var w;
    var c, j, l, f, G, k, h, g;
    this.alpha = 0.07;
    this.movement = 0;
    var C = 0;
    var D = 0;
    var F = 800;
    var m = "wipe";
    var u = Data.getPage();
    (function() {
        y();
        a();
        s()
    })();

    function y() {
        w = x.container;
        w.size("100%");
        if (!Mobile.phone && Hardware.ANIMATE_BG) {
            var H = w.create("cover");
            H.size("100%").bg("#000").css({
                top: "100%"
            }).setZ(99);
            H = w.create("cover");
            H.size("100%").bg("#000").css({
                top: "-100%"
            }).setZ(99)
        }
    }

    function a() {
        c = x.initClass(WorkLayout, q.getCurrent());
        j = x.initClass(WorkLayout, q.getPrev());
        l = x.initClass(WorkLayout, q.getNext());
        j.forceComposite = true;
        l.forceComposite = true;
        x.delayedCall(function() {
            j.forceComposite = false;
            l.forceComposite = false;
            Render.start(B)
        }, 200);
        x.delayedCall(function() {
            c.activate();
            c.animator.animateIn("up");
            e()
        }, Hardware.REDUCED_WORK ? 1000 : 0);
        f = x.initClass(WorkLayoutOpenMechanic, w)
    }

    function e(H) {
        c.element.transform({
            y: 0
        }).willChange(true);
        var H = Mobile.os == "iOS";
        if ((!j.forceComposite || H) || !Hardware.WEBGL) {
            j.element.transform({
                y: -Stage.height
            }).willChange(true)
        }
        if ((!l.forceComposite || H) || !Hardware.WEBGL) {
            l.element.transform({
                y: Stage.height
            }).willChange(true)
        }
        c.baseY = 0;
        j.baseY = -Stage.height;
        l.baseY = Stage.height
    }

    function E(H) {
        H.element.invisible();
        x.delayedCall(function() {
            H.destroy()
        }, Mobile.os == "Android" ? 0 : 30)
    }

    function B() {
        if (x.active("transition") || WorkNav.OPEN || WorkNavOpenMechanic.TRANSITION) {
            return
        }
        D += (x.movement - D) * x.alpha;
        if (Math.abs(D) < 0.0001) {
            D = 0
        }
        var H = Utils.range(D, -1, 1, Stage.height, -Stage.height);
        c.element.y = c.baseY + H;
        j.element.y = j.baseY + H;
        l.element.y = l.baseY + H;
        c.element.transform();
        if (!j.forceComposite) {
            j.element.transform()
        }
        if (!l.forceComposite) {
            l.element.transform()
        }
        c.animator.update(D);
        if (Mobile.tablet && !Hardware.BASIC_NAV) {
            if (WorkNavOpenMechanic.AMOUNT < 0.01 && h) {
                G = x.delayedCall(n, 100)
            } else {
                if (G) {
                    G = clearTimeout(G)
                }
            }
        }
    }

    function d(H) {
        c.animator.animateOut("down");
        x.active("transition", true);
        c.element.tween({
            y: Stage.height
        }, F, m);
        if (!H) {
            q.moveIndex(-1)
        }
        j.animator.animateIn("down");
        if (!k) {
            n(j)
        }
        WorkLayoutManager.TRANSITION = true;
        Data.lock();
        j.element.tween({
            y: 0
        }, F, m, function() {
            E(l);
            l = c;
            c = j;
            c.element.setZ(2);
            j = x.initClass(WorkLayout, q.getPrev());
            j.element.setZ(-1);
            j.forceComposite = true;
            l.deactivate();
            c.activate();
            x.movement = 0;
            D = 0;
            ScrollUtil.unblock();
            e();
            x.active("transition", false);
            v();
            H && H()
        });
        if (!H) {
            x.events.fire(WorkLayoutManager.CHANGE, {
                type: "auto"
            })
        }
    }

    function o(H) {
        c.animator.animateOut("up");
        x.active("transition", true);
        c.element.tween({
            y: -Stage.height
        }, F, m);
        if (!H) {
            q.moveIndex(1)
        }
        if (!k) {
            n(l)
        }
        l.animator.animateIn("up");
        WorkLayoutManager.TRANSITION = true;
        Data.lock();
        l.element.tween({
            y: 0
        }, F, m, function() {
            E(j);
            j = c;
            c = l;
            c.element.setZ(2);
            l = x.initClass(WorkLayout, q.getNext());
            l.forceComposite = true;
            l.element.setZ(-1);
            j.deactivate();
            c.activate();
            x.movement = 0;
            D = 0;
            ScrollUtil.unblock();
            e();
            x.active("transition", false);
            v();
            H && H()
        });
        if (!H) {
            x.events.fire(WorkLayoutManager.CHANGE, {
                type: "auto"
            })
        }
    }

    function v() {
        TweenManager.clearCSSTween(j.elemenet);
        TweenManager.clearCSSTween(c.elemenet);
        TweenManager.clearCSSTween(l.elemenet);
        x.delayedCall(function() {
            j.forceComposite = false;
            l.forceComposite = false;
            nextFrame(function() {
                c.element.css({
                    zIndex: ""
                });
                j.element.css({
                    zIndex: ""
                });
                l.element.css({
                    zIndex: ""
                });
                e();
                nextFrame(e);
                WorkLayoutManager.TRANSITION = false;
                Data.unlock();
                C++;
                if (C > 3) {
                    Dispatch.find(Menu, "forceComposite")(true);
                    C = 0
                }
            })
        }, 200)
    }

    function b() {
        if (WorkLayoutManager.TRANSITION) {
            return
        }
        var I = q.getPrev();
        var H = q.getNext();
        var J = function() {
            j.forceComposite = false;
            l.forceComposite = false;
            l.element.css({
                zIndex: ""
            });
            j.element.css({
                zIndex: ""
            });
            e()
        };
        if (j.data.perma != I.perma) {
            j.destroy();
            j = x.initClass(WorkLayout, I);
            j.forceComposite = true;
            j.element.setZ(-1);
            x.delayedCall(J, 100)
        }
        if (l.data.perma != H.perma) {
            l.destroy();
            l = x.initClass(WorkLayout, H);
            l.forceComposite = true;
            l.element.setZ(-1);
            x.delayedCall(J, 100)
        }
    }

    function n(H) {
        if (q == Data.Lab) {
            return
        }
        if (!Device.mobile && g) {
            if (j.data == g) {
                H = j
            } else {
                if (l.data == g) {
                    H = l
                } else {
                    if (c.data == g) {
                        H = c
                    }
                }
            }
            g = null
        }
        H = H || c;
        if (!ATUtil.matchTag(q.sortTag, H.data)) {
            x.events.fire(ATEvents.RESET_FILTERS)
        }
        defer(b);
        h = false
    }

    function s() {
        x.events.subscribe(HydraEvents.RESIZE, z);
        x.events.subscribe(WorkNavListItem.CLICK, t);
        x.events.subscribe(ATEvents.STATE_CHANGE, p);
        x.events.subscribe(WorkNavOpenMechanic.OPEN, A);
        x.events.subscribe(WorkNavOpenMechanic.MOBILE_OPEN, r)
    }

    function r(H) {
        if (q == Data.Lab) {
            return
        }
        h = H.type != "open"
    }

    function A(H) {
        if (q == Data.Lab) {
            return
        }
        if (H.type != "open") {
            G = x.delayedCall(n, Device.mobile && !Hardware.BASIC_NAV ? 100 : 500)
        } else {
            clearTimeout(G)
        }
        if (Mobile.os == "Android" && Mobile.phone && Hardware.BASIC_NAV) {
            if (H.type == "open") {
                if (!x.active("hidden")) {
                    x.active("hidden", true);
                    x.delayedCall(function() {
                        w.css({
                            left: -999
                        })
                    }, 700)
                }
            } else {
                if (x.active("hidden")) {
                    x.active("hidden", false);
                    w.css({
                        left: 0
                    })
                }
            }
        }
    }

    function p(I) {
        if (I.split[0] != u) {
            return
        }
        var H = I.split[1];
        if (!H) {
            H = q.getFirst().perma
        }
        if (H == c.data.perma) {
            return
        }
        if (j.data.perma == H) {
            x.transition(-1)
        } else {
            if (l.data.perma == H) {
                x.transition(1)
            } else {
                t({
                    perma: H
                })
            }
        }
    }

    function t(I) {
        k = true;
        var H = q.setCurrent(I.perma);
        x.events.fire(WorkLayoutManager.CHANGE, {
            type: "manual"
        });
        if (Mobile.phone) {
            WorkLayoutManager.OVERRIDE_ANIMATION = true;
            F = 1
        }
        if (H > 0) {
            l.destroy();
            l = x.initClass(WorkLayout, q.getCurrent());
            l.element.setZ(-1)
        } else {
            j.destroy();
            j = x.initClass(WorkLayout, q.getCurrent());
            j.element.setZ(-1)
        }
        g = I.item.data;
        x.delayedCall(function() {
            l.element.css({
                zIndex: ""
            });
            j.element.css({
                zIndex: ""
            });
            e();
            nextFrame(e);
            x.transition(H, function() {
                nextFrame(function() {
                    if (H > 0) {
                        j.destroy();
                        j = x.initClass(WorkLayout, q.getPrev());
                        j.element.setZ(-1);
                        j.forceComposite = Mobile.os != "Android"
                    } else {
                        l.destroy();
                        l = x.initClass(WorkLayout, q.getNext());
                        l.element.setZ(-1);
                        l.forceComposite = Mobile.os != "Android"
                    }
                    e()
                })
            });
            k = false;
            if (Mobile.phone) {
                F = 800;
                WorkLayoutManager.OVERRIDE_ANIMATION = false
            }
        }, 75)
    }

    function z() {
        e();
        c.resize();
        j.resize();
        l.resize()
    }
    this.transition = function(H, I) {
        if (H > 0) {
            o(I)
        } else {
            d(I)
        }
    };
    this.onDestroy = function() {
        Render.stop(B)
    }
}, function() {
    WorkLayoutManager.CHANGE = "work_layout_manager_change"
});
Class(function WorkNav(c) {
    Inherit(this, Controller);
    var g = this;
    var l, h;
    var e, m, b, f;
    (function() {
        d();
        a();
        k();
        j()
    })();

    function d() {
        l = g.container;
        l.size("100%").setZ(10);
        if (!Mobile.phone) {
            l.css({
                width: Config.UI_NAV_WIDTH
            }).css({
                right: 0
            })
        }
        h = l.create(".wrapper");
        h.size("100%").css({
            overflow: "hidden"
        });
        if ((!Device.mobile || Hardware.BASIC_NAV) && !Device.browser.ie) {
            l.css({
                left: 0
            });
            Timer.create(function() {
                l.css({
                    left: ""
                })
            }, 150)
        }
    }

    function k() {
        f = g.initClass(WorkNavOuterUI);
        b = g.initClass(WorkNavOpenMechanic, l, f);
        h.add(b);
        e = g.initClass(WorkNavList, c);
        h.add(e);
        m = g.initClass(WorkNavInteraction, e);
        h.add(m);
        l.scroll = e.element
    }

    function j() {
        g.events.subscribe(HydraEvents.RESIZE, a)
    }

    function a() {
        l.height = Stage.height;
        if (Device.mobile) {
            l.width = Mobile.phone || Hardware.FORCE_PHONE ? Stage.width : Config.UI_NAV_WIDTH;
            if (WorkNav.OPEN) {
                l.css({
                    right: 0
                })
            } else {
                l.css({
                    right: -l.width
                })
            }
        } else {
            l.width = Config.UI_NAV_WIDTH;
            if (WorkNav.OPEN) {
                l.transform({
                    x: 0
                })
            } else {
                l.transform({
                    x: Config.UI_NAV_WIDTH
                })
            }
        }
        e && e.resize();
        b && b.resize()
    }
    this.onDestroy = function() {
        WorkNav.OPEN = false
    }
}, function() {
    WorkNav.OPEN = false
});
Class(function AboutView(m) {
    Inherit(this, View);
    var j = this;
    var o;
    var q, p, l, e, g, k, h;
    var r = new Vector2();
    var a = new Vector2();
    var d = Data.About.getData();
    j.current = 0;
    (function() {
        f();
        b();
        n();
        defer(c)
    })();

    function f() {
        o = j.element;
        o.size("100%").css({
            height: "",
            position: "relative",
            display: "block"
        })
    }

    function b() {
        q = j.initClass(AboutHeader, d);
        j.delayedCall(q.animateIn, 800);
        p = j.initClass(AboutUnderstanding, d, 1);
        l = j.initClass(AboutDesign, d, 2);
        e = j.initClass(AboutAnimation, d, 3);
        g = j.initClass(AboutDevelopment, d, 4);
        k = j.initClass(AboutAwards, d, 5);
        h = j.initClass(AboutContact)
    }

    function n() {}

    function c() {
        j.centers = [];
        for (var s in j.classes) {
            var t = j.classes[s];
            t.top = t.element.div.offsetTop;
            t.height = t.element.div.offsetHeight;
            t.center = t.top - (Stage.height - t.height) / 2;
            if (!t.position) {
                t.position = new Vector2()
            }
            if (!t.move) {
                t.move = new Vector2()
            }
            if (!t.lerp) {
                t.lerp = 0.2
            }
            j.centers.push(t.center)
        }
        j.max = o.div.offsetHeight - Stage.height
    }
    this.animateIn = function() {
        p.init();
        if (m) {
            var t = 0;
            for (var s in j.classes) {
                if (j.classes[s].animateIn) {
                    j.delayedCall(j.classes[s].animateIn, t * 500);
                    t++
                }
            }
        }
    };
    this.resize = function() {
        var t = 0;
        for (var s in j.classes) {
            var u = j.classes[s];
            u.index = t;
            if (u.resize) {
                u.resize()
            }
            t++
        }
        defer(c)
    };
    this.update = function(t) {
        var v = 0;
        if (m) {
            return
        }
        for (var s in j.classes) {
            var x = j.classes[s];
            if (!x.position) {
                continue
            }
            var u = w(t);
            if (v == 0) {
                u = (u - 0.5) * 2
            }
            if (u > 0.25 && u < 0.75) {
                if (v > 0) {
                    if (x.animateIn && !x.isVisible) {
                        x.animateIn()
                    }
                    x.isVisible = true
                }
                if (u > 0.4 && u < 0.6) {
                    j.current = x.index
                }
            } else {
                if (t < 0.05) {
                    if (x.animateOut && x.isVisible) {
                        x.animateOut()
                    }
                    x.isVisible = false
                }
            }
            if (x.position.y > -1 && x.position.y < 1) {
                if (!x.activated && x.activate) {
                    x.activate()
                }
            } else {
                if (x.activated && x.deactivate) {
                    x.deactivate()
                }
            }
            if (x.position) {
                x.position.y = u;
                x.move.lerp(x.position, x.lerp);
                if (x.update && ((x.move.y > -1.2 && x.move.y < 1.2) || v == 0) && !Hardware.iOSCHROME) {
                    x.update(x.move.y, x.position.y)
                }
            }
            v++
        }

        function w(A) {
            var C = Stage.height / j.max;
            var D = x.top / j.max - C;
            var y = (x.top + x.height) / j.max - C;
            var z = y - D + C;
            var B = (A - D) / z;
            return B
        }
    }
});
Class(function AboutAnimation(a, h) {
    Inherit(this, View);
    var d = this;
    var e, j;
    var f;
    (function() {
        c();
        g();
        b()
    })();

    function c() {
        e = d.element;
        e.size("100%", Stage.height).css({
            position: "relative",
            display: "block",
            overflow: "hidden"
        }).setZ(1)
    }

    function g() {
        f = d.initClass(AboutBox, {
            title: "STORYTELLING",
            text: a.animation,
            dir: 0,
            number: h,
            invert: false
        })
    }

    function b() {
        j = e.create(".line");
        j.css({
            height: "100%",
            overflow: "hidden",
            width: 1,
            left: "50%",
            marginLeft: -1
        });
        j.behind = j.create(".behind");
        j.behind.size("100%").bg("#fff").css({
            opacity: 0.2
        });
        j.inner = j.create(".inner");
        j.inner.size("100%").css({
            top: "-100%"
        }).bg("#fff")
    }
    this.animateIn = function() {
        f.animateIn()
    };
    this.animateOut = function() {
        f.animateOut()
    };
    this.resize = function() {
        var k = Math.max(440, Stage.height * 0.5);
        e.size("100%", k)
    };
    this.update = function(l, k) {
        f.update(l, k);
        j.inner.y = Stage.height * l * 0.6;
        j.inner.transform()
    }
});
Class(function AboutAwards(a, k) {
    Inherit(this, View);
    var e = this;
    var f, b;
    var g, j;
    (function() {
        d();
        h();
        c()
    })();

    function d() {
        f = e.element;
        f.size("100%", 800).bg("#fff").css({
            position: "relative",
            display: "block",
            overflow: "hidden"
        }).enable3D(2000);
        b = f.create(".bg");
        b.size("100%").bg("assets/images/about/awards.jpg", "cover")
    }

    function h() {
        g = e.initClass(AboutBox, {
            title: "AWARDS",
            text: a.awards,
            dir: -1,
            number: k,
            invert: true
        });
        e.delayedCall(function() {
            if (Mobile.phone) {
                g.element.css({
                    marginTop: 0,
                    top: 100
                })
            }
        }, 500)
    }

    function c() {
        j = e.initClass(AboutAwardsGrid, a.awards_obj)
    }
    this.resize = function() {
        var l = Mobile.phone ? 720 : 600;
        f.size("100%", l)
    };
    this.animateIn = function() {
        g.animateIn()
    };
    this.animateOut = function() {
        g.animateOut()
    };
    this.update = function(m, l) {
        g.update(m, l)
    }
});
Class(function AboutAwardsGrid(b) {
    Inherit(this, View);
    var g = this;
    var j;
    var l;
    var a = Device.mobile ? 140 : 150;
    var k = Mobile.phone ? 80 : Device.mobile ? 90 : 100;
    var d = Mobile.phone ? 2 : 2;
    (function() {
        e();
        f();
        h();
        c()
    })();

    function e() {
        j = g.element
    }

    function f() {
        l = [];
        var m = 0;
        var q = 0;
        var p = 0;
        for (var n = 0; n < b.length; n++) {
            b[n].height = k;
            b[n].width = a;
            var o = g.initClass(AboutAwardsGridItem, b[n]);
            o.element.css({
                left: m,
                top: q
            });
            l.push(o);
            m += a;
            if (n % d == d - 1) {
                p++;
                m = Mobile.phone ? 0 : -11 * p;
                q += k
            }
        }
        j.size(a * d, k * p).center();
        if (!Mobile.phone) {
            j.css({
                marginLeft: 70
            })
        } else {
            j.css({
                top: "",
                bottom: 50,
                marginTop: 0
            })
        }
    }

    function h() {
        g.events.subscribe(HydraEvents.RESIZE, c)
    }

    function c() {
        var m = Utils.clamp(Stage.width / 900, 0.5, 1)
    }
    this.animateIn = function() {}
});
Class(function AboutAwardsGridItem(c) {
    Inherit(this, View);
    var h = this;
    var e, a, g;
    (function() {
        b();
        f();
        d()
    })();

    function b() {
        e = h.element;
        e.size(c.width, c.height)
    }

    function f() {
        a = e.create(".icon");
        a.size(60, 60).center().css({
            marginLeft: -20
        }).bg("assets/images/about/awards/" + c.image + ".png")
    }

    function d() {
        g = e.create(".line");
        g.fontStyle("OpenSans", 14, "#000");
        g.css({
            top: "50%",
            marginTop: -10,
            width: 30,
            textAlign: "center",
            left: "50%",
            marginLeft: -60
        });
        g.text(c.count)
    }
    this.animateIn = function() {}
});
Class(function AboutBox(n, j) {
    Inherit(this, View);
    var q = this;
    var g, f, k, s, c, h, p, m, r, b;
    var a = new Vector2();
    var e = Mobile.phone ? 235 : 280;
    var w = Mobile.phone ? 27 : 42;
    var d = 0;
    var t = 4;
    (function() {
        l();
        o();
        q.delayedCall(u, 300)
    })();

    function l() {
        g = q.element;
        g.size(e + w * 2, 400).center().setZ(10000).invisible().transform({
            skewX: -t
        });
        if (Hardware.REDUCED_WORK) {
            g.visible()
        }
        k = g.create(".shadow");
        k.size("100%").bg("assets/images/about/shadow.png").css({
            opacity: 0
        });
        s = g.create(".wrapper");
        s.size("100%").css({
            overflow: "hidden"
        });
        if (!n.trans) {
            h = s.create(".behind");
            h.size("100%").bg(n.invert ? "#000" : "#fff").css({
                opacity: n.invert ? 0.06 : 0.2
            })
        }
        c = s.create(".inner");
        c.size("100%").css({
            overflow: "hidden"
        });
        if (!n.trans) {
            c.bg(n.invert ? "#000" : "#fff")
        }
        c.wrap = c.create(".wrap");
        c.wrap.size("100%");
        c.wrapAgain = c.wrap.create(".wrap-again");
        c.wrapAgain.size("100%").css({
            zIndex: 5
        });
        m = c.wrapAgain.create(".title");
        m.fontStyle("OpenSansBold", Mobile.phone ? 26 : 32, n.invert ? "#fff" : "#000");
        m.text(n.title).css({
            textAlign: "left",
            width: "100%",
            left: w + 3,
            top: w + d / 2 + 2
        });
        r = c.wrapAgain.create(".text");
        var x = Mobile.phone ? 10 : 12;
        r.fontStyle("OpenSans", x, n.invert ? "#fff" : "#000");
        r.css({
            top: Mobile.phone ? w + 40 : w + 45,
            width: e - 10,
            textAlign: "left",
            left: w + 5,
            lineHeight: x * 1.6,
            position: "relative",
            display: "block"
        });
        r.html(n.text);
        if (n.dir && !Hardware.iOSCHROME) {
            p = g.create(".line");
            p.size(Stage.width / 2, 1).css({
                top: "50%",
                marginTop: -1
            }).bg(n.invert ? "#000" : "#fff")
        }
    }

    function u() {
        var x = r.div.offsetHeight;
        q.height = x + w * 2 + 50;
        q.width = e + w * 2;
        g.size(q.width, q.height).center();
        if (k) {
            k.size(q.width * 1.3, q.height * 1.3).center()
        }
        if (!Mobile.phone || Stage.width > Stage, x) {
            if (n.dir > 0) {
                g.css({
                    left: "",
                    right: "10%",
                    marginLeft: 0
                })
            }
            if (n.dir < 0) {
                g.css({
                    left: "10%",
                    right: "",
                    marginLeft: 0
                })
            }
            if (n.invert && !Mobile.phone) {
                g.css({
                    left: "50%",
                    marginLeft: Device.mobile ? -330 : -380,
                    right: ""
                })
            }
        }
        if (h) {
            h.size(q.width - 2, q.height - 2).center()
        }
        if (p) {
            p.size(Stage.width / 2, 1).css({
                left: n.dir > 0 ? q.width : (Stage.width / 2) * n.dir
            })
        }
        if (Hardware.REDUCED_WORK) {
            return
        }
        if (p) {
            p.stopTween().transform({
                x: (Stage.width / 2) * n.dir
            })
        }
        if (n.dir) {
            c.stopTween().transform({
                x: q.width * n.dir
            });
            if (h) {
                h.stopTween().transform({
                    x: q.width * n.dir
                })
            }
            c.wrap.stopTween().transform({
                x: -q.width * n.dir * 1.2
            })
        } else {
            c.stopTween().transform({
                y: -q.height
            });
            if (h) {
                h.stopTween().transform({
                    y: -q.height
                })
            }
            c.wrap.stopTween().transform({
                y: q.height * 0.9
            })
        }
    }

    function o() {}

    function v(x) {
        switch (x.action) {
            case "over":
                q.hovered = true;
                c.tween({
                    y: 0
                }, 300, "easeOutCubic");
                c.wrap.tween({
                    y: 0
                }, 300, "easeOutCubic");
                break;
            case "out":
                c.tween({
                    y: c.saveY
                }, 400, "easeOutCubic");
                c.wrap.tween({
                    y: c.wrap.saveY
                }, 400, "easeOutCubic", function() {
                    q.hovered = false
                });
                break
        }
    }
    this.animateIn = function() {
        if (Hardware.REDUCED_WORK) {
            return
        }
        g.visible();
        if (p) {
            p.tween({
                x: 0
            }, 300, "easeOutQuart")
        }
        if (n.dir) {
            if (h) {
                h.tween({
                    x: 0
                }, 800, "easeOutQuart")
            }
            c.tween({
                x: 0
            }, 800, "easeInOutQuart");
            c.wrap.tween({
                x: 0
            }, 800, "easeInOutQuart")
        } else {
            if (h) {
                h.tween({
                    y: 0
                }, 800, "easeOutQuart")
            }
            c.tween({
                y: 0
            }, 800, "easeInOutQuart");
            c.wrap.tween({
                y: 0
            }, 800, "easeInOutQuart")
        }
        if (k) {
            k.tween({
                opacity: n.dir ? 0.2 : 0.08
            }, 600, "easeInOutSine", 200)
        }
    };
    this.animateOut = function() {
        if (Hardware.REDUCED_WORK) {
            return
        }
        if (p) {
            p.tween({
                x: (Stage.width / 2) * n.dir
            }, 500, "easeInCubic")
        }
        if (n.dir) {
            if (h) {
                h.tween({
                    x: q.width * n.dir
                }, 800, "easeOutQuart")
            }
            c.tween({
                x: q.width * n.dir
            }, 800, "easeInOutCubic");
            c.wrap.tween({
                x: -q.width * n.dir * 1.2
            }, 800, "easeInOutCubic", function() {
                g.invisible()
            })
        } else {
            if (h) {
                h.tween({
                    y: -q.height
                }, 800, "easeInOutQuart")
            }
            c.tween({
                y: -q.height
            }, 800, "easeOutQuart");
            c.wrap.tween({
                y: q.height * 0.9
            }, 800, "easeOutQuart")
        }
        if (k) {
            k.tween({
                opacity: 0
            }, 800, "easeOutSine")
        }
    };
    this.update = function(z, y) {
        var A = Stage.height * 0.35;
        g.y = -A / 2 + A * z;
        g.transform();
        var x = (-A / 2 + A * y);
        if (k) {
            k.x = 10 + x * 0.3;
            k.y = x * 0.5 + 10;
            k.transform()
        }
        if (f) {
            f.y = -x * 0.3;
            f.transform()
        }
    }
});
Class(function AboutContact() {
    Inherit(this, View);
    var e = this;
    var g, a, b;
    var j;
    var c = Mobile.phone ? 220 : Config.UI_OFFSET * 2 + 30;
    (function() {
        d();
        f()
    })();

    function d() {
        g = e.element;
        g.size("100%", c).css({
            position: "relative",
            display: "block"
        });
        b = g.create(".bg");
        b.size("100%", c + 100).bg("#000")
    }

    function h() {
        a = g.create(".logo");
        var k = 0.4
    }

    function f() {
        var l = e.initClass(MenuFooter, true);
        l.animateIn();
        l.resize();
        if (Mobile.phone) {
            l.css({
                top: 50
            })
        }
        var k = e.initClass(MenuShare);
        k.element.mouseEnabled(true);
        k.animateIn();
        if (Mobile.phone) {
            k.element.center(1, 0).css({
                marginLeft: -50,
                bottom: 70
            })
        }
    }
    this.animateIn = function() {};
    this.animateOut = function() {};
    this.resize = function() {
        if (!Mobile.phone) {
            c = Stage.width < 770 ? 230 : Config.UI_OFFSET * 2 + 30;
            g.size("100%", c);
            b.size("100%", c + 100)
        }
    }
});
Class(function AboutDesign(a, m) {
    Inherit(this, View);
    var f = this;
    var g, b, k, l;
    var h, c;
    (function() {
        e();
        d();
        j()
    })();

    function e() {
        g = f.element;
        g.size("100%", 500).css({
            position: "relative",
            display: "block"
        }).transform({
            z: 1
        }).setZ(10)
    }

    function d() {
        b = g.create(".image");
        b.size("100%").css({
            overflow: "hidden"
        }).setZ(1).transform({
            z: -1
        });
        b.inner = b.create(".inner");
        b.inner.size("100%").bg("assets/images/about/process_design.jpg", "cover");
        if (!Device.mobile) {
            c = f.initClass(Video, {
                width: 1280,
                height: 720,
                src: Config.CDN + "assets/videos/design.mp4",
                loop: true
            });
            b.inner.add(c)
        }
    }

    function j() {
        h = f.initClass(AboutBox, {
            title: "DESIGN",
            text: a.design,
            number: m,
            dir: -1,
            invert: false
        })
    }
    this.resize = function() {
        var n = Mobile.phone ? Stage.height * 0.8 : Device.mobile && Stage.height > Stage.width ? Stage.height * 0.7 : Stage.height;
        g.size("100%", n);
        var o = Stage.width;
        var n = o * (720 / 1280);
        if (n < Stage.height) {
            n = Stage.height;
            o = n * (1280 / 720)
        }
        if (c) {
            c.object.size(o, n).center()
        }
    };
    this.activate = function() {
        f.activated = true;
        if (c) {
            c.play()
        }
    };
    this.deactivate = function() {
        f.activated = false;
        if (c) {
            c.pause()
        }
    };
    this.animateIn = function() {
        h.animateIn()
    };
    this.animateOut = function() {
        h.animateOut()
    };
    this.update = function(o, n) {
        h.update(o, n);
        b.inner.y = -Stage.height * 0.5 + Stage.height * n;
        b.inner.transform()
    }
});
Class(function AboutDevelopment(a, k) {
    Inherit(this, View);
    var f = this;
    var g, b;
    var h, c;
    (function() {
        e();
        d();
        j()
    })();

    function e() {
        g = f.element;
        g.size("100%", 600).css({
            position: "relative",
            display: "block"
        }).enable3D(2000).setZ(10)
    }

    function d() {
        b = g.create(".image");
        b.size("100%").css({
            overflow: "hidden"
        }).setZ(1).transform({
            z: -1
        });
        b.inner = b.create(".inner");
        b.inner.size("100%").bg("assets/images/about/process_tech.jpg", "cover");
        if (!Device.mobile) {
            c = f.initClass(Video, {
                width: 1280,
                height: 720,
                src: Config.CDN + "assets/videos/tech.mp4",
                loop: true
            });
            b.inner.add(c)
        }
    }

    function j() {
        h = f.initClass(AboutBox, {
            title: "DEVELOPMENT",
            text: a.development,
            number: k,
            dir: 1
        })
    }
    this.resize = function() {
        var l = Mobile.phone ? Stage.height * 0.8 : Device.mobile && Stage.height > Stage.width ? Stage.height * 0.7 : Stage.height;
        g.size("100%", l);
        var m = Stage.width;
        var l = m * (720 / 1280);
        if (l < Stage.height) {
            l = Stage.height;
            m = l * (1280 / 720)
        }
        if (c) {
            c.object.size(m, l).center()
        }
    };
    this.activate = function() {
        f.activated = true;
        if (c) {
            c.play()
        }
    };
    this.deactivate = function() {
        f.activated = false;
        if (c) {
            c.pause()
        }
    };
    this.animateIn = function() {
        h.animateIn()
    };
    this.animateOut = function() {
        h.animateOut()
    };
    this.update = function(m, l) {
        h.update(m, l);
        b.inner.y = -Stage.height * 0.5 + Stage.height * l;
        b.inner.transform()
    }
});
Class(function AboutHeader() {
    Inherit(this, View);
    var g = this;
    var e, b;
    var a, d;
    (function() {
        c();
        f()
    })();

    function c() {
        e = g.element;
        e.size("100%", Stage.height).css({
            position: "relative",
            display: "block"
        })
    }

    function f() {
        a = g.initClass(AboutHeaderTitle);
        d = g.initClass(AboutHeaderCopy)
    }
    this.resize = function() {
        e.size("100%", Stage.height);
        a.resize();
        d.resize()
    };
    this.animateIn = function() {
        g.delayedCall(a.animateIn, 200);
        g.delayedCall(d.animateIn, 1200)
    };
    this.animateOut = function() {};
    this.update = function(j, h) {
        a.update(h);
        d.update(h)
    }
});
Class(function AboutHeaderCopy() {
    Inherit(this, View);
    var f = this;
    var e, d;
    var c;
    (function() {
        b();
        a()
    })();

    function b() {
        e = f.element;
        e.size(350, 100).center().css({
            marginLeft: 110,
            marginTop: -33
        }).invisible();
        d = e.create(".wrapper");
        d.size("100%")
    }

    function a() {
        var l = ["A company founded on web technology.", "We believe that screens of all shapes and sizes", "can be used to tell engaging, interactive stories", "and connect people in meaningful ways."];
        var h = 14;
        c = [];
        var k = 6;
        for (var g = 0; g < l.length; g++) {
            var j = d.create(".line");
            j.fontStyle(g == 0 ? "OpenSansBold" : "OpenSans", h, "#fff");
            j.css({
                top: g * h * 1.6,
                left: k * l.length - g * k
            });
            j.text(l[g]);
            c.push(j)
        }
    }
    this.animateIn = function() {
        e.visible();
        d.css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 2500, "easeInOutSine")
    };
    this.resize = function() {
        var g = Utils.convertRange(Stage.height, 0, 1020, 0.5, 1);
        g = Utils.clamp(g, 0, 1);
        if (!Mobile.phone) {
            e.x = -400 + 400 * g
        }
        e.y = -80 + 80 * g;
        e.scale = g;
        e.transform();
        e.size(350, 100).center().css({
            marginLeft: 110,
            marginTop: -33
        });
        if (Mobile.phone || Stage.height > Stage.width) {
            e.css({
                marginLeft: -175,
                marginTop: 50
            })
        }
    };
    this.update = function(h) {
        e.div.style.opacity = 1 - h * 2;
        for (var g = 0; g < c.length; g++) {
            c[g].y = 400 * h;
            c[g].x = 50 * h + (h > 0 ? -20 * g * h : 20 * g * h);
            c[g].skewX = -4;
            if (g % 2 == 1) {
                c[g].x += 50 * h
            }
            c[g].transform()
        }
    }
});
Class(function AboutHeaderTitle() {
    Inherit(this, View);
    var d = this;
    var f, b, g;
    var a, e, j;
    (function() {
        c();
        h()
    })();

    function c() {
        f = d.element;
        f.size("100%", Stage.height).css({
            position: "relative",
            display: "block"
        });
        b = f.create(".bg");
        b.size("100%").css({
            position: "fixed"
        })
    }

    function h() {
        g = f.create(".title");
        g.size(1050, 520).center().invisible();
        if (Mobile.phone) {
            g.css({
                marginTop: -310
            })
        }
        var q = ["CREATIVE", "DIGITAL", "PRODUCTION"];
        var n = 150;
        a = [];
        for (var m = 0; m < q.length; m++) {
            var p = g.create(".line");
            p.fontStyle(m == 0 ? "OpenSansLight" : "OpenSansBold", n, "#fff");
            p.css({
                top: m * n,
                fontStyle: "italic"
            });
            p.text(q[m]);
            var l = SplitTextfield.split(p);
            a.push(l)
        }
        e = [];
        for (var m = 0; m < a.length; m++) {
            for (var k = 0; k < a[m].length; k++) {
                var o = a[m][k];
                o.css({
                    paddingRight: 30,
                    marginLeft: -30,
                    left: 30
                }).setZ((1000 + o.offset) / 100);
                e.push(o)
            }
        }
    }
    this.animateIn = function() {
        if (d.visible) {
            return
        }
        d.visible = true;
        g.visible().transform({
            scale: j * 2
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0,
            scale: j
        }, 3000, "easeOutQuart");
        for (var k = 0; k < e.length; k++) {
            e[k].css({
                opacity: 0
            }).tween({
                opacity: 1
            }, Utils.doRandom(2000, 2500), "easeInOutSine", Utils.doRandom(0, 1000) + k * 40)
        }
    };
    this.resize = function() {
        f.size("100%", Stage.height);
        var l = Utils.convertRange(Stage.height, 0, 1020, 0, 1);
        var m = Utils.convertRange(Stage.width, 0, 1300, 0, 1);
        var o = Math.min(l, m);
        if (Mobile.phone) {
            m = Utils.convertRange(Stage.width, 0, 500, 0, 0.4);
            l = Utils.convertRange(Stage.height, 0, 500, 0, 0.4);
            o = Math.min(l, m)
        }
        j = Utils.clamp(o, 0, 1);
        g.transform({
            scale: j
        });
        var k = Mobile.phone ? 300 : 250;
        for (var n = 0; n < e.length; n++) {
            e[n].offset = Utils.doRandom(k, k * 2.5)
        }
        g.size(1050, 520).center();
        if (Mobile.phone || Stage.height > Stage.width) {
            g.css({
                marginTop: Mobile.phone ? -310 : -370
            })
        }
    };
    this.update = function(l) {
        for (var k = 0; k < e.length; k++) {
            var m = e[k];
            m.y = m.offset * l;
            m.transform()
        }
    }
});
Class(function AboutUnderstanding(b, j) {
    Inherit(this, View);
    var d = this;
    var e, k, h, l;
    var f;
    (function() {
        c();
        a();
        g()
    })();

    function c() {
        e = d.element;
        e.size("100%", 600).css({
            position: "relative",
            display: "block"
        }).setZ(0);
        var m = e.create(".bg");
        m.size("100%").bg("#fff").css({
            opacity: 0.06
        })
    }

    function a() {
        l = e.create(".process");
        l.size("100%").css({
            top: -Config.UI_OFFSET - 5
        }).invisible();
        h = l.create(".process");
        h.fontStyle("OpenSansBold", 10, "#fff");
        h.css({
            width: "100%",
            textAlign: "center",
            top: 0,
            letterSpacing: 3
        });
        h.text("OUR PROCESS");
        k = l.create(".line");
        k.css({
            height: "100%",
            overflow: "hidden",
            width: 1,
            left: "50%",
            marginLeft: -1,
            top: 30
        });
        k.behind = k.create(".behind");
        k.behind.size("100%").bg("#fff").css({
            opacity: 0.2
        });
        k.inner = k.create(".inner");
        k.inner.size("100%").bg("#fff")
    }

    function g() {
        f = d.initClass(AboutBox, {
            title: "IDEATION",
            text: b.ideation,
            dir: 0,
            number: j,
            invert: false
        })
    }
    this.init = function() {
        l.visible();
        h.transform({
            y: 50
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 1400, "easeOutQuart");
        k.transform({
            y: 50
        }).tween({
            y: 0
        }, 2000, "easeOutQuart")
    };
    this.animateIn = function() {
        f.animateIn()
    };
    this.animateOut = function() {
        f.animateOut()
    };
    this.resize = function() {
        var m = Math.max(550, Stage.height * 0.7);
        e.size("100%", m)
    };
    this.update = function(n, m) {
        f.update(n * 0.78 + 0.22, m);
        l.y = Stage.height * 0.5 * n;
        l.transform();
        k.inner.y = Stage.height * n * 0.3;
        k.inner.transform()
    }
});
Class(function FilterItem(d) {
    Inherit(this, View);
    var g = this;
    var k, l, h, a, n;
    g.height = 50;
    g.active = false;
    (function() {
        e();
        b();
        c();
        j()
    })();

    function e() {
        k = g.element;
        k.size("100%", g.height).css({
            overflow: "hidden",
            width: "125%",
            left: "-25%"
        }).invisible();
        h = k.create(".wrapper");
        h.size("100%").transform({
            skewX: -4
        })
    }

    function b() {
        l = h.create(".title");
        l.fontStyle("OpenSansLight", 30, "#fff");
        l.css({
            letterSpacing: 2.6,
            right: Config.UI_NAV_WIDTH + Config.UI_OFFSET,
            lineHeight: g.height,
            textAlign: "right",
            width: "100%",
            opacity: 0.9
        });
        l.text(d.text.toUpperCase())
    }

    function c() {
        a = h.create(".bg");
        a.size("100%").bg("#fff").transform({
            y: g.height
        }).css({
            overflow: "hidden"
        }).invisible();
        n = a.create(".title");
        n.fontStyle("OpenSansBold", 30, "#222");
        n.css({
            letterSpacing: 1,
            right: Config.UI_NAV_WIDTH + Config.UI_OFFSET,
            lineHeight: g.height,
            textAlign: "right",
            width: "100%"
        });
        n.text(d.text.toUpperCase())
    }

    function j() {
        k.interact(f, m);
        k.hit.mouseEnabled(true);
        k.hit.css({
            width: 250 + Config.UI_NAV_WIDTH + Config.UI_OFFSET,
            left: "",
            right: 0
        })
    }

    function f(o) {
        if (g.active) {
            return
        }
        o.index = d.index;
        g.events.fire(HydraEvents.HOVER, o)
    }

    function m() {
        if (g.active) {
            return
        }
        g.events.fire(HydraEvents.CLICK, d)
    }
    this.goIn = function(o) {
        if (g.hovered || !g.visible) {
            return
        }
        g.hovered = true;
        a.visible().stopTween().transform({
            y: -g.height * o,
            x: 0
        }).tween({
            y: 0
        }, 500, "easeOutQuint");
        n.stopTween().transform({
            y: g.height * o * 1.2,
            x: 0
        }).tween({
            y: 0
        }, 500, "easeOutQuint")
    };
    this.goOut = function(o) {
        if (!g.hovered) {
            return
        }
        g.hovered = false;
        a.tween({
            y: -g.height * o * 1.02
        }, 250, "easeOutQuint", function() {
            a.invisible()
        });
        n.tween({
            y: g.height * o * 1.2
        }, 250, "easeOutQuint")
    };
    this.activate = function() {
        if (g.active) {
            return
        }
        g.active = true;
        l.css({
            fontFamily: "OpenSansBold",
            letterSpacing: 1
        });
        k.hit.css({
            cursor: ""
        });
        l.tween({
            opacity: 1
        }, 300, "easeOutSine");
        g.hovered = false;
        a.visible().stopTween().transform({
            x: 0,
            y: 0
        }).tween({
            x: Stage.width
        }, 700, "easeInOutQuint", function() {
            a.invisible()
        });
        n.stopTween().transform({
            x: 0,
            y: 0
        }).tween({
            y: 0,
            x: -Stage.width
        }, 700, "easeInOutQuint")
    };
    this.deactivate = function() {
        if (!g.active) {
            return
        }
        g.active = false;
        g.hovered = false;
        l.tween({
            opacity: 0.9
        }, 300, "easeOutSine");
        a.tween({
            y: g.height * 1.04
        }, 500, "easeOutQuint");
        n.tween({
            y: -g.height * 1.2
        }, 500, "easeOutQuint");
        l.css({
            fontFamily: "OpenSansLight",
            letterSpacing: 2.6
        });
        k.hit.css({
            cursor: "pointer"
        })
    };
    this.animateIn = function() {
        g.visible = true;
        k.visible();
        h.css({
            opacity: 0
        }).transform({
            y: 15
        }).tween({
            opacity: 1,
            y: 0
        }, 400, "easeOutCubic", function() {
            k.hit.show()
        })
    };
    this.animateOut = function() {
        g.visible = false;
        k.hit.hide();
        h.tween({
            opacity: 0,
            y: 5
        }, 300, "easeInCubic", function() {
            k.invisible()
        })
    }
});
Class(function FilterView() {
    Inherit(this, View);
    var j = this;
    var m, o, q, c;
    var l;
    (function() {
        e();
        n();
        h();
        k();
        b()
    })();

    function e() {
        m = j.element;
        m.size("100%")
    }

    function n() {
        o = m.create(".title");
        o.fontStyle("OpenSansBold", 10, "#fff");
        o.css({
            top: Config.UI_OFFSET,
            right: Config.UI_NAV_WIDTH + Config.UI_OFFSET,
            letterSpacing: 2,
            textAlign: "right",
            width: "100%"
        });
        o.text("SHOW ME");
        q = m.create(".line");
        q.size(Config.UI_NAV_WIDTH + Config.UI_OFFSET - 15, 1).css({
            top: Config.UI_OFFSET + 38,
            right: 0
        }).bg("#fff");
        j.line = q
    }

    function h() {
        var r = Data.Work.getTags();
        j.items = [];
        for (var s = 0; s < r.length; s++) {
            var t = j.initClass(FilterItem, {
                text: r[s],
                index: s
            });
            t.text = r[s];
            t.transform({
                y: s * 38 + Config.UI_OFFSET + 12
            });
            j.items.push(t)
        }
        j.items[0].activate();
        j.items[0].animateIn()
    }

    function g() {
        var s = Config.UI_OFFSET + 12;
        for (var r = 0; r < j.items.length; r++) {
            j.items[r].tween({
                y: j.items[r].hovered ? s + 15 : s
            }, 400, "easeOutExpo");
            j.items[r].element.setZ(r);
            s += j.items[r].hovered ? 68 : 38
        }
    }

    function k() {
        for (var r = 0; r < j.items.length; r++) {
            j.items[r].events.add(HydraEvents.HOVER, a);
            j.items[r].events.add(HydraEvents.CLICK, d)
        }
        j.events.subscribe(ATEvents.RESET_FILTERS, f);
        j.events.subscribe(HydraEvents.RESIZE, b)
    }

    function b() {
        m.css({
            top: Stage.width < 800 ? 50 : 0
        })
    }

    function f() {
        l = setTimeout(function() {
            j.items[0].deactivate();
            j.items[0].animateOut();
            var r = 0;
            for (var s = 0; s < j.items.length; s++) {
                if (j.items[s].text == "everything") {
                    r = s
                }
            }
            p(j.items, r, 0);
            j.items[0].activate();
            j.items[0].animateIn();
            g()
        }, 800)
    }

    function a(t) {
        if (j.disabled) {
            return
        }
        clearTimeout(l);
        var s = t.movementY > 0 ? 1 : -1;
        switch (t.action) {
            case "over":
                j.hovered = true;
                for (var r = 0; r < j.items.length; r++) {
                    if (!j.items[r].active) {
                        if (t.object == j.items[r].element) {
                            j.items[r].goIn(s)
                        } else {
                            j.items[r].goOut(s)
                        }
                    }
                }
                break;
            case "out":
                l = setTimeout(function() {
                    j.hovered = false;
                    for (var u = 0; u < j.items.length; u++) {
                        j.items[u].goOut(-s)
                    }
                    g()
                }, 400);
                break
        }
        g()
    }

    function d(t) {
        j.disabled = true;
        j.delayedCall(function() {
            j.disabled = false
        }, 1000);
        if (!t.reset) {
            j.events.fire(ATEvents.FILTER_CHANGE, t)
        }
        j.items[0].deactivate();
        var r = 0;
        for (var s = 0; s < j.items.length; s++) {
            if (j.items[s].text == t.text) {
                r = s
            }
        }
        p(j.items, r, 0);
        if (r > 0 && t.text !== "Everything") {
            for (var s = 0; s < j.items.length; s++) {
                if (j.items[s].text == "Everything") {
                    r = s
                }
            }
            p(j.items, r, 1)
        }
        g();
        j.items[0].activate();
        if (!t.force) {
            j.delayedCall(g, 750)
        }
        j.delayedCall(function() {}, 100)
    }

    function p(r, t, u) {
        var s = r[t];
        r.splice(t, 1);
        r.splice(u, 0, s)
    }
    this.animateIn = function() {
        clearTimeout(l);
        if (j.disabled) {
            return
        }
        j.visible = true;
        for (var r = 1; r < j.items.length; r++) {
            j.delayedCall(j.items[r].animateIn, r * 40)
        }
    };
    this.animateOut = function() {
        j.visible = false;
        for (var r = 1; r < j.items.length; r++) {
            j.items[r].animateOut()
        }
    }
});
Class(function GlitchCanvas(c, e) {
    Inherit(this, Component);
    var h = this;
    var j, d;
    var m = [];
    var k = [{
        fn: a,
        num: 6
    }, {
        fn: g,
        num: 6
    }, {
        fn: n,
        num: 1
    }, ];
    (function() {
        o();
        p()
    })();

    function p() {
        d = h.initClass(ObjectPool);
        for (var r = 0; r < 20; r++) {
            var q = new CanvasGraphics();
            d.put(q)
        }
    }

    function o() {
        j = h.initClass(Canvas, c || 1024, e || 512);
        h.texture = new THREE.Texture(j.div);
        var q = new CanvasGraphics();
        q.fillStyle = "#000";
        q.fillRect(0, 0, j.width, j.height);
        j.add(q)
    }

    function l(t) {
        var q = t.num;
        var s = t.fn;
        for (var r = 0; r < q; r++) {
            var t = d.get();
            m.push(t);
            s(t);
            j.add(t)
        }
    }

    function a(u) {
        var t = j.width;
        var q = (Utils.doRandom(1, 10) / 100) * j.height;
        u.x = 0;
        u.y = (Utils.doRandom(0, 8) / 10) * j.height;
        u.clear();
        u.fillRect(0, 0, t, q);
        u.fillStyle = "#ff0000";
        u.scale = 1;
        u.rotation = 0;
        var s = Utils.doRandom(0, 10) / 100;
        var r = Utils.doRandom(0, 10) / 100;
        var v = Utils.doRandom(0, 5) / 100;
        u.fillStyle = "rgba(" + ~~(s * 255) + "," + ~~(r * 255) + ", " + ~~(v * 255) + ", 255)"
    }

    function g(u) {
        var t = (Utils.doRandom(5, 10) / 100) * j.width * 0.5;
        var q = j.height * 2;
        u.x = (Utils.doRandom(0, 90) / 100) * j.width;
        u.y = -j.height * 0.2;
        u.clear();
        u.fillRect(0, 0, t, q);
        u.fillStyle = "#ff0000";
        var s = Utils.doRandom(2, 5) / 100;
        var r = Utils.doRandom(2, 5) / 100;
        u.rotation = 45;
        u.scale = 1;
        var v = Utils.doRandom(0, 5) / 100;
        u.fillStyle = "rgba(" + ~~(s * 255) + "," + ~~(r * 255) + ", " + ~~(v * 255) + ", 255)"
    }

    function n(s) {
        s.clear();
        s.beginPath();
        s.moveTo(0, -5);
        s.lineTo(8, 5);
        s.lineTo(-8, 5);
        s.closePath();
        s.fill();
        var r = 0;
        var q = 0;
        var t = Utils.doRandom(5, 30) / 100;
        s.fillStyle = "rgba(" + ~~(r * 255) + "," + ~~(q * 255) + ", " + ~~(t * 255) + ", 255)";
        s.x = Utils.doRandom(0, j.width);
        s.y = Utils.doRandom(0, j.height);
        s.rotation = Utils.doRandom(0, 360);
        s.scale = Utils.doRandom(20, 40) * 3
    }

    function f() {
        m.forEach(function(q) {
            j.remove(q);
            d.put(q)
        });
        m.length = 0
    }

    function b() {
        f();
        var q = k[Utils.doRandom(0, k.length - 1)];
        l(q);
        h.texture.needsUpdate = true;
        j.render()
    }
    this.start = function() {
        Render.start(b, 18)
    };
    this.stop = function() {
        Render.stop(b);
        f();
        j.render()
    }
});
Class(function CircleLogo() {
    Inherit(this, View);
    var g = this;
    var f;
    var a = (Device.browser.firefox || Device.browser.ie) ? true : false;
    (function() {
        d();
        c()
    })();

    function d() {
        f = g.element;
        f.size(44, 44).css({
            bottom: Config.UI_OFFSET - 6,
            right: Config.UI_OFFSET - 3
        }).setZ(10000).transform({
            z: a ? 0 : 1
        });
        f.bg("assets/images/common/circlelogo.png")
    }

    function c() {
        f.interact(b, e)
    }

    function b(h) {
        if (Data.getPage() == "home") {
            return
        }
        switch (h.action) {
            case "over":
                f.tween({
                    opacity: 0.9
                }, 100, "easeOutSine");
                break;
            case "out":
                f.tween({
                    opacity: 1
                }, 300, "easeOutSine");
                break
        }
    }

    function e() {
        if (Data.getPage() == "home") {
            return
        }
        Container.instance().page("home");
        f.tween({
            opacity: 1
        }, 300, "easeOutSine")
    }
    this.animateIn = function() {}
});
Class(function HamburgerButton() {
    Inherit(this, View);
    var b = this;
    var f, e;
    var g = Mobile.phone ? 26 : 32;
    (function() {
        a();
        h();
        Dispatch.register(b, "close")
    })();

    function a() {
        f = b.element;
        f.size(g, g).css({
            top: Config.UI_OFFSET,
            left: Config.UI_OFFSET,
            opacity: 0.9
        }).setZ(10000).transform({
            z: 1
        }).hide();
        e = f.create(".circle");
        e.size(g * 2, g * 2).center().bg("#fff").css({
            borderRadius: g,
            opacity: 0.5
        }).transform({
            scale: 0
        })
    }

    function h() {
        b.lines = [];
        for (var k = 0; k < 3; k++) {
            var l = f.create(".line");
            l.size(g, Math.round(g * 0.06)).css({
                top: Math.round(k * g * 0.25 + g * 0.2)
            }).bg("#fff").transform({
                skewX: -40,
                scale: Device.browser.firefox ? 0.9999 : 1
            });
            b.lines.push(l)
        }
    }

    function d() {
        f.interact(c, j);
        f.hit.size(g * 3, g * 3).center()
    }

    function c(k) {
        if (Device.mobile || b.active("disable")) {
            return
        }
        switch (k.action) {
            case "over":
                f.tween({
                    opacity: 1
                }, 300, "easeOutCubic");
                e.stopTween().transform({
                    scale: 0
                }).css({
                    opacity: 0.2
                }).tween({
                    scale: 1.5,
                    opacity: 0
                }, 1200, "easeOutQuart");
                if (!Device.mobile) {
                    if (!b.open) {
                        b.lines[0].tween({
                            x: 2
                        }, 300, "easeOutExpo");
                        b.lines[1].tween({
                            x: -2
                        }, 300, "easeOutExpo");
                        b.lines[2].tween({
                            x: 2
                        }, 300, "easeOutExpo")
                    } else {
                        b.lines[0].tween({
                            rotation: Device.browser.firefox ? 45 : 35,
                            opacity: Device.browser.firefox ? 0.5 : 1
                        }, 300, "easeOutExpo");
                        b.lines[2].tween({
                            rotation: Device.browser.firefox ? -45 : -35,
                            opacity: Device.browser.firefox ? 0.5 : 1
                        }, 300, "easeOutExpo")
                    }
                }
                break;
            case "out":
                f.tween({
                    opacity: 0.9
                }, 300, "easeOutCubic");
                if (!Device.mobile) {
                    if (!b.open) {
                        b.lines[0].tween({
                            x: 0
                        }, 300, "easeOutExpo");
                        b.lines[1].tween({
                            x: 0
                        }, 300, "easeOutExpo");
                        b.lines[2].tween({
                            x: 0
                        }, 300, "easeOutExpo")
                    } else {
                        b.lines[0].tween({
                            rotation: 45,
                            opacity: 1
                        }, 300, "easeOutExpo");
                        b.lines[2].tween({
                            rotation: -45,
                            opacity: 1
                        }, 300, "easeOutExpo")
                    }
                }
                break
        }
    }

    function j(k) {
        if (b.active("disable")) {
            return
        }
        b.active("disable", true);
        b.delayedCall(function() {
            b.active("disable", false)
        }, 600);
        if (!b.open) {
            b.open = true;
            b.lines[0].tween({
                x: 0,
                rotation: 45,
                y: g * 0.25,
                skewX: 0
            }, 500, "easeOutExpo", 100);
            b.lines[1].tween({
                x: -15,
                opacity: 0
            }, 500, "easeOutExpo");
            b.lines[2].tween({
                x: 0,
                rotation: -45,
                y: -g * 0.25,
                skewX: 0
            }, 500, "easeOutExpo", 100);
            if (k) {
                Container.instance().menu("open")
            }
        } else {
            b.open = false;
            b.lines[0].tween({
                x: 0,
                rotation: 0,
                y: 0,
                skewX: -30
            }, 500, "easeOutExpo");
            b.lines[1].tween({
                x: 0,
                opacity: 1
            }, 500, "easeOutExpo", 50);
            b.lines[2].tween({
                x: 0,
                rotation: 0,
                y: 0,
                skewX: -30
            }, 500, "easeOutExpo");
            if (k) {
                Container.instance().menu("close")
            }
        }
    }
    this.animateIn = function() {
        f.show();
        for (var k = 0; k < b.lines.length; k++) {
            b.lines[k].transform({
                x: -15
            }).css({
                opacity: 0
            }).tween({
                x: 0,
                opacity: 1
            }, 500, "easeOutExpo", k * 100)
        }
        b.delayedCall(d, 1000)
    };
    this.close = function() {
        if (b.open) {
            j()
        }
    }
});
Class(function HomeButton() {
    Inherit(this, View);
    var g = this;
    var l, d, a, m, h, n, e, o;
    var b;
    var k = Device.browser.firefox ? 0 : 4;
    g.width = 170;
    g.height = 56;
    (function() {
        c();
        j()
    })();

    function c() {
        l = g.element;
        l.size(g.width, g.height).center().css({
            marginTop: Mobile.phone ? 60 : 145
        }).invisible();
        m = l.create(".glow");
        m.size("100%").css({
            boxShadow: "0 0 80px #fff",
            opacity: 0
        });
        h = l.create(".wrapper");
        h.size("100%").css({
            overflow: "hidden"
        });
        a = h.create(".bg");
        a.size(g.width - 2, g.height - 2).css({
            left: 1,
            top: 1
        }).bg("#fff");
        n = a.create(".circle");
        n.fontStyle("OpenSansBold", 11, "#222");
        n.css({
            letterSpacing: 3,
            width: "100%",
            textAlign: "center",
            top: "50%",
            marginTop: -6,
            lineHeight: 11
        });
        n.text("VIEW WORK");
        e = h.create(".over");
        e.size("100%").bg("#000").transform({
            y: g.height
        }).hide();
        o = n.clone();
        o.css({
            color: "#fff",
            opacity: 0
        }).transform({
            y: 10
        });
        h.add(o)
    }

    function j() {
        l.interact(f, p)
    }

    function f(q) {
        Dispatch.find(HomeSizzleParticleBehavior, "forceRadius")(q.action);
        switch (q.action) {
            case "over":
                m.tween({
                    opacity: 0.6
                }, 300, "easeOutSine");
                o.stopTween().transform({
                    y: 20
                }).tween({
                    y: 0,
                    opacity: 1
                }, 300, "easeOutQuart");
                e.stopTween().transform({
                    y: g.height
                }).tween({
                    y: 0
                }, 300, "easeOutQuart");
                n.tween({
                    y: -20,
                    skewX: k,
                    opacity: 0
                }, 300, "easeOutQuart");
                break;
            case "out":
                if (g.active("preventOut")) {
                    return
                }
                m.tween({
                    opacity: 0
                }, 300, "easeOutSine");
                o.tween({
                    y: -20,
                    opacity: 0
                }, 400, "easeOutQuart");
                e.tween({
                    y: -g.height
                }, 600, "easeOutExpo");
                n.stopTween().transform({
                    y: 20,
                    skewX: k
                }).tween({
                    y: 0,
                    skewX: k,
                    opacity: 1
                }, 400, "easeOutQuart");
                break
        }
    }

    function p() {
        Dispatch.find(Home, "launchWork")();
        g.clicked = true;
        g.active("preventOut", true);
        Timer.create(function() {
            g.clicked = false;
            g.active("preventOut", false);
            f({
                action: "out"
            })
        }, 500)
    }
    this.animateIn = function() {
        g.active("preventOut", false);
        if (b) {
            return
        }
        b = true;
        defer(function() {
            l.visible().transform({
                skewX: -(k)
            });
            a.transform({
                y: -g.height
            }).tween({
                y: 0
            }, 1000, "easeInOutExpo");
            n.transform({
                y: 30,
                skewX: k
            }).css({
                opacity: 0
            }).tween({
                y: 0,
                skewX: k,
                opacity: 1
            }, 800, "easeOutQuart", 450);
            g.delayedCall(function() {
                e.show()
            }, 800)
        })
    };
    this.reset = function() {
        l.invisible();
        b = false
    }
});
Class(function HomeInfo() {
    Inherit(this, View);
    var e = this;
    var g, j, a;
    (function() {
        b();
        h();
        k();
        f()
    })();

    function b() {
        g = e.element;
        g.size(300, 50);
        g.css({
            bottom: Config.UI_OFFSET - 50,
            left: Config.UI_OFFSET - 10,
            opacity: 0.7
        });
        g.transformPoint(0, 0).transform({
            rotation: -90
        })
    }

    function h() {
        j = g.create(".title");
        j.fontStyle("OpenSansBold", 10, "#fff");
        j.text("SLAY YOUR NEXT GIANT");
        j.css({
            letterSpacing: 3,
            opacity: 0,
            top: 10,
            left: 10
        })
    }

    function k() {
        a = g.create(".bar");
        a.size(100, 1).css({
            top: 26,
            left: 10,
            overflow: "hidden"
        });
        a.inner = a.create(".inner");
        a.inner.size("100%").css({
            left: "-100%"
        }).bg("#fff")
    }

    function f() {
        g.interact(d, l);
        e.events.subscribe(ATEvents.SIZZLE_CHANGE, c)
    }

    function d(m) {
        switch (m.action) {
            case "over":
                g.tween({
                    opacity: 1
                }, 100, "easeOutSine");
                break;
            case "out":
                g.tween({
                    opacity: 0.7
                }, 300, "easeOutSine");
                break
        }
    }

    function l() {
        Dispatch.find(Home, "launchWork")()
    }

    function c(n) {
        if (e.width) {
            a.inner.tween({
                x: e.width * 2
            }, 300, "easeOutQuart", m)
        } else {
            m()
        }
        j.tween({
            y: 5,
            opacity: 0
        }, 300, "easeInCubic");

        function m() {
            j.text(n.title.toUpperCase());
            defer(function() {
                e.width = CSS.textSize(j).width - 4;
                a.size(e.width, 2);
                var o = (n.timeOut - n.timeIn) * 1000 - 500;
                a.inner.transform({
                    x: 0
                }).tween({
                    x: e.width
                }, o, "linear");
                j.stopTween().transform({
                    y: -7
                }).tween({
                    y: 0,
                    opacity: 1
                }, 700, "easeOutQuart")
            })
        }
    }
    this.animateIn = function() {}
});
Class(function HomeLogo() {
    Inherit(this, View);
    var d = this;
    var c;
    (function() {
        b();
        a()
    })();

    function b() {
        c = d.element
    }

    function a() {
        var g = 634 / 354;
        var f = 634;
        var e = f / g;
        if (Stage.height < 550) {
            var j = Stage.height / 550;
            f *= j;
            e *= j
        }
        if (Stage.width < 600) {
            var j = Stage.width / 600;
            f *= j;
            e *= j
        }
        var h = -(e / 2) - 0.75;
        if (Mobile.phone) {
            h -= 30
        }
        c.size(f, e).bg("assets/images/home/logo_2.png").css({
            top: "50%",
            left: "50%",
            marginLeft: -(f / 2),
            marginTop: h
        })
    }
    this.animateIn = function() {};
    this.resize = a
});
Class(function HomeSizzleBasic(a) {
    Inherit(this, View);
    var g = this;
    var f, b;
    (function() {
        e();
        d();
        c()
    })();

    function e() {
        f = g.element;
        f.size("100%");
        if (Device.mobile || !Hardware.HOME_VIDEO) {
            b = f.create("video");
            b.bg("assets/images/home/still.jpg");
            b.object = b
        } else {
            f.add(a)
        }
    }

    function d() {
        g.events.subscribe(HydraEvents.RESIZE, c)
    }

    function c() {
        var j = Stage.width;
        var h = j * (720 / 1280);
        if (h < Stage.height) {
            h = Stage.height;
            j = h * (1280 / 720)
        }
        var k = b || a;
        k.size(j, h);
        k.object.css({
            left: Stage.width / 2 - j / 2,
            top: Stage.height / 2 - h / 2
        })
    }
    this.start = function() {};
    this.stop = function() {}
});
Class(function HomeSizzleGL() {
    Inherit(this, View);
    var g = this;
    var l;
    var k, n, a;
    var o, m, d, c;
    (function() {
        e();
        q();
        p();
        j()
    })();

    function e() {
        l = g.element;
        l.size("100%")
    }

    function q() {
        n = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true
        });
        n.setPixelRatio(Device.pixelRatio);
        n.setSize(Stage.width, Stage.height);
        n.autoClear = false;
        a = new THREE.PerspectiveCamera(45, Stage.width / Stage.height, 10, 10000);
        a.position.z = h();
        l.add(n.domElement)
    }

    function h() {
        return 1.3 * Stage.height / Math.tan(45 / 2) / 2
    }

    function p() {
        d = g.initClass(HomeSizzleVideoTexture, n);
        m = g.initClass(HomeSizzlePlane, d);
        o = g.initClass(HomeSizzleMesh, d);
        c = g.initClass(HomeSizzleLogoContainer, d)
    }

    function f() {
        o.update();
        d.render();
        m.update();
        c.update();
        n.clearDepth();
        n.render(m.scene, a);
        n.clearDepth();
        n.render(o.scene, a);
        if (Stage.width > 600 && !Mobile.phone) {
            n.render(c.scene, c.camera)
        }
    }

    function j() {
        g.events.subscribe(ATEvents.RESIZE, b)
    }

    function b() {
        a.position.z = h();
        a.aspect = Stage.width / Stage.height;
        a.updateProjectionMatrix();
        n.setSize(Stage.width, Stage.height);
        o.resize();
        m.resize()
    }
    this.start = function() {
        Render.start(f)
    };
    this.stop = function() {
        Render.stop(f)
    }
});
Class(function HomeSizzleMesh(g) {
    Inherit(this, Component);
    var d = this;
    var f, a, e, b;
    var j = [];
    this.scene = new THREE.Scene();
    (function() {
        c();
        h();
        l()
    })();

    function c() {
        e = d.initClass(ParticlePhysics);
        b = d.initClass(HomeSizzleParticleBehavior);
        e.addBehavior(b)
    }

    function h() {
        a = d.initClass(HomeSizzleMeshShader, g);
        f = d.initClass(HomeSizzleMeshGenerator, a);
        k()
    }

    function k() {
        f.exec(function(m) {
            d.scene.add(m);
            j.push(m)
        })
    }

    function l() {
        j.forEach(function(n) {
            var m = new Particle(new Vector3(n.position.x, n.position.y, 0));
            e.addParticle(m);
            m.mesh = n;
            n.particle = m
        })
    }
    this.update = function() {
        b.update();
        e.update();
        a.update()
    };
    this.resize = function() {
        j.forEach(function(m) {
            e.removeParticle(m.particle);
            d.scene.remove(m);
            m.geometry.dispose()
        });
        j.length = 0;
        k();
        l()
    }
});
Class(function HomeSizzleMeshGenerator(a) {
    Inherit(this, Component);
    var g = this;
    var b;
    var f = new Vector2();
    var e = new Vector2();
    (function() {})();

    function c() {
        b = g.initClass(DelaunayTriangulation, Stage.width, Stage.height)
    }

    function h() {
        var l = (function() {
            if (Mobile.tablet) {
                return 150
            }
            if (Mobile.phone) {
                return 10
            }
            return 300
        })();
        var n = [];
        for (var m = 0; m < l; m++) {
            n.push({
                x: Utils.doRandom(0, Stage.width),
                y: Utils.doRandom(0, Stage.height)
            })
        }
        return n
    }

    function j() {
        var w = [];
        var r = (function() {
            if (Mobile.tablet) {
                return 14
            }
            if (Mobile.phone) {
                return 7
            }
            if (Device.browser.ie) {
                return 10
            }
            if (Hardware.REDUCED_RETINA) {
                return 15
            }
            if (Device.browser.safari) {
                return 17
            }
            return 20
        })();
        var m = r;
        var t = r;
        var l = Stage.width / m;
        var q = Stage.height / t;
        var v;
        var n = function() {
            v = []
        };
        var u = function(z, A) {
            z += Utils.doRandom(-10, 10);
            A += Utils.doRandom(-10, 10);
            v.push({
                x: z,
                y: A
            })
        };
        var p = function() {
            w.push(v)
        };
        var o = function(C) {
            var B = -1;
            for (var z = 0; z < Stage.width * 1.1; z += l) {
                var A = B++ % 2 == 0;
                n();
                if (A) {
                    u(z, C + q);
                    u(z + (l / 2), C);
                    u(z + l, C + q)
                } else {
                    u(z, C + q);
                    u(z - (l / 2), C);
                    u(z + (l / 2), C);
                    z -= l / 2
                }
                p()
            }
        };
        for (var s = 0; s < Stage.height; s += q) {
            o(s)
        }
        return w
    }

    function d(u) {
        var r = new THREE.BufferGeometry();
        var q = new Float32Array(u.length * 3);
        var l = new Float32Array(u.length * 2);
        for (var o = 0; o < u.length; o++) {
            var s = u[o];
            q[o * 3 + 0] = s.x - u.centroid.x;
            q[o * 3 + 1] = s.y - u.centroid.y;
            q[o * 3 + 2] = s.z || 0
        }
        r.addAttribute("position", new THREE.BufferAttribute(q, 3));
        r.applyMatrix(new THREE.Matrix4().makeRotationZ(Utils.toRadians(Utils.doRandom(0, 360))));
        var m = Utils.doRandom(10, 40) / 10;
        r.applyMatrix(new THREE.Matrix4().makeScale(m, m, m));
        for (o = 0; o < u.length; o++) {
            var p = q[o * 3 + 0] + u.centroid.x;
            var n = q[o * 3 + 1] + u.centroid.y;
            l[o * 2 + 0] = Utils.range(p, 0, Stage.width, 0, 1);
            l[o * 2 + 1] = Utils.range(n, 0, Stage.height, 0, 1)
        }
        r.addAttribute("uv", new THREE.BufferAttribute(l, 2));
        r.computeFaceNormals();
        r.computeVertexNormals();
        r.centroid = u.centroid;
        return r
    }

    function k(l) {
        f.clear();
        l.forEach(function(m) {
            f.add(m)
        });
        f.divide(l.length);
        l.centroid = new Vector2().copy(f);
        l.forEach(function(m) {
            m.angle = e.solveAngle(f, m)
        });
        l.sort(function(n, m) {
            return n.angle - m.angle
        });
        return l
    }
    this.exec = function(m) {
        var l = j();
        l.forEach(function(p) {
            var n = d(k(p));
            var o = new THREE.Mesh(n, a.material);
            o.centroid = n.centroid;
            o.locked = n.locked;
            o.position.x = n.centroid.x - Stage.width / 2;
            o.position.y = n.centroid.y - Stage.height / 2;
            delete n.centroid;
            delete n.locked;
            m(o)
        })
    }
});
Class(function HomeSizzleMeshShader(b) {
    Inherit(this, Component);
    var g = this;
    var f, b, a;
    (function() {
        e();
        d();
        c()
    })();

    function e() {
        f = g.initClass(Shader, "Sizzle", "Sizzle");
        f.uniforms = {
            tMap: {
                type: "t",
                value: b.texture
            },
            aspect: {
                type: "fv1",
                value: []
            },
        };
        f.material.side = THREE.DoubleSide;
        g.material = f.material
    }

    function d() {
        g.events.subscribe(HydraEvents.RESIZE, c)
    }

    function c() {
        var l = Stage.width;
        var h = l * (720 / 1280);
        if (h < Stage.height) {
            h = Stage.height;
            l = h * (1280 / 720)
        }
        var k = l / Stage.width;
        var j = h / Stage.height;
        f.uniforms.aspect.value = [0, 0, 0, 0, 0, k, j, 0.5, 0.5]
    }
    this.update = function() {
        f.uniforms.tMap.value = b.texture
    }
});
Class(function HomeSizzleParticleBehavior() {
    Inherit(this, Component);
    var f = this;
    var c = false;
    var e = 0;
    var b = 0;
    var d = new Vector2();
    var g = new Vector2();
    var h = new Vector2();
    var a = new Vector2();
    var k = ["easeOutQuad", "easeOutCubic", "easeOutQuint", "easeOutCirc"];
    (function() {
        Dispatch.register(f, "forceRadius")
    })();

    function j(l) {
        l.target = new Vector3(l.pos.x, l.pos.y, 0);
        l.origin = new Vector2(l.pos.x, l.pos.y);
        l.dir = Utils.headsTails(-1, 1);
        l.mult = Utils.doRandom(10, 100) / 100;
        l.rx = Utils.toRadians(Utils.doRandom(0, 40));
        l.ry = Utils.toRadians(Utils.doRandom(0, 40));
        l.rz = Utils.toRadians(Utils.doRandom(0, 40));
        l.ease = k[Utils.doRandom(0, k.length - 1)];
        l.speed = Utils.doRandom(20, 40) / 100
    }
    this.update = function(m) {
        g.x = Mouse.x - Stage.width / 2;
        g.y = -(Mouse.y - Stage.height / 2);
        a.subVectors(Mouse, h).divide(Render.DELTA);
        h.copy(Mouse);
        var l = a.length();
        e = l > 0.01 ? 300 : 0;
        if (l > 5) {
            e = 500
        }
        b += (e - b) * 0.07;
        if (c) {
            b = 500
        }
    };
    this.applyBehavior = function(l) {
        if (!l.target) {
            j(l)
        }
        d.subVectors(l.origin, g);
        var n = d.length();
        if (n < b) {
            var m = Math.atan2(d.y, d.x);
            l.target.copy(l.origin).addAngleRadius(m, (b - n) * l.mult * 1.2);
            l.target.z = Utils.range(n, 0, b, -300, 0)
        } else {
            l.target.copy(l.origin)
        }
        var o = Utils.range(l.pos.z, 0, -300, 0, 1);
        l.mesh.rotation.x = l.rx * o * l.dir;
        l.mesh.rotation.y = l.ry * o * l.dir;
        l.mesh.rotation.z = l.rz * o * l.dir;
        l.pos.interp(l.target, l.speed, l.ease);
        l.pos.copyTo(l.mesh.position)
    };
    this.forceRadius = function(l) {
        if (l == "over") {
            c = true
        } else {
            c = false
        }
    }
});
Class(function HomeSizzleLogoContainer(g) {
    Inherit(this, Component);
    var f = this;
    var k, a;
    this.scene = new THREE.Object3D();
    this.camera = l();
    var c = 634;
    var d = 354;
    (function() {
        j();
        h();
        b()
    })();

    function j() {
        a = f.initClass(Shader, "SizzleContainer", "SizzleContainer");
        a.uniforms = {
            tMap: {
                type: "t",
                value: g.texture
            },
            tOutline: {
                type: "t",
                value: Utils3D.getTexture("assets/images/home/outline.png")
            },
            aspect: {
                type: "fv1",
                value: []
            },
            res: {
                type: "v2",
                value: new THREE.Vector2(Stage.width, Stage.height)
            }
        };
        a.material.transparent = true
    }

    function e() {
        var m = new THREE.PlaneGeometry(c, d);
        k = new THREE.Mesh(m, a.material);
        f.scene.add(k)
    }

    function l() {
        var m = new THREE.OrthographicCamera(Stage.width / -2, Stage.width / 2, Stage.height / 2, Stage.height / -2, 1, 1000);
        m.position.z = 1;
        return m
    }

    function h() {
        f.events.subscribe(HydraEvents.RESIZE, b)
    }

    function b() {
        if (k) {
            k.geometry.dispose();
            f.scene.remove(k)
        }
        e();
        var p = Stage.width;
        var m = p * (720 / 1280);
        if (m < Stage.height) {
            m = Stage.height;
            p = m * (1280 / 720)
        }
        var o = p / c;
        var n = m / d;
        a.uniforms.aspect.value = [0, 0, 0, 0, 0, o, n, 0.5, 0.5];
        f.camera.left = Stage.width / -2;
        f.camera.right = Stage.width / 2;
        f.camera.top = Stage.height / 2;
        f.camera.bottom = Stage.height / -2;
        f.camera.updateProjectionMatrix()
    }
    this.resize = function() {
        k.geometry.dispose();
        a.uniforms.res.value.set(Stage.width, Stage.height);
        e()
    };
    this.update = function() {
        a.uniforms.tMap.value = g.texture
    }
});
Class(function HomeSizzlePlane(b) {
    Inherit(this, Component);
    var h = this;
    var f, g;
    this.scene = new THREE.Object3D();
    (function() {
        e();
        a();
        d();
        c()
    })();

    function e() {
        g = h.initClass(Shader, "SizzleBG", "SizzleBG");
        g.uniforms = {
            tMap: {
                type: "t",
                value: b.texture
            },
            aspect: {
                type: "fv1",
                value: []
            },
            res: {
                type: "v2",
                value: new THREE.Vector2(Stage.width, Stage.height)
            }
        }
    }

    function a() {
        var j = new THREE.PlaneGeometry(Stage.width, Stage.height);
        f = new THREE.Mesh(j, g.material);
        h.scene.add(f);
        f.position.z += 200
    }

    function d() {
        h.events.subscribe(HydraEvents.RESIZE, c)
    }

    function c() {
        var m = Stage.width;
        var j = m * (720 / 1280);
        if (j < Stage.height) {
            j = Stage.height;
            m = j * (1280 / 720)
        }
        var l = m / Stage.width;
        var k = j / Stage.height;
        g.uniforms.aspect.value = [0, 0, 0, 0, 0, l, k, 0.5, 0.5]
    }
    this.resize = function() {
        f.geometry.dispose();
        g.uniforms.res.value.set(Stage.width, Stage.height);
        a()
    };
    this.update = function() {
        g.uniforms.tMap.value = b.texture
    }
});
Class(function HomeSizzleVideoTexture() {
    Inherit(this, Component);
    var g = this;
    var b, a, d, e;
    (function() {
        f()
    })();

    function f() {
        if (Hardware.HOME_VIDEO) {
            a = HomeVideoController.instance().video;
            b = new THREE.Texture(a.div);
            b.minFilter = b.magFilter = THREE.LinafearFilter;
            a.texture = b;
            d = Utils3D.getTexture("assets/images/home/frame.jpg");
            g.texture = d
        } else {
            b = Utils3D.getTexture("assets/images/home/still.jpg");
            g.texture = b
        }
    }

    function c() {
        if (e) {
            return
        }
        e = true;
        g.delayedCall(function() {
            g.texture = a.texture
        }, 500)
    }
    this.render = function() {
        if (a) {
            if (a.ready() || Hydra.LOCAL) {
                if (!e) {
                    c()
                }
            }
        }
    }
});
Class(function LoaderView() {
    Inherit(this, View);
    var d = this;
    var f;
    var h;
    var g = require("LoaderPathConfig");
    (function() {
        c();
        j();
        b();
        a();
        e()
    })();

    function c() {
        f = d.element;
        f.size("100%").css({
            opacity: 0
        });
        if (Mobile.phone) {
            f.css({
                top: -30
            })
        }
    }

    function j() {
        h = d.initClass(LoaderSVG, g, f);
        d.svg = h.svg
    }

    function b() {
        d.events.subscribe(HydraEvents.RESIZE, a)
    }

    function a() {
        f.size("100%");
        h.resize()
    }

    function e() {
        f.tween({
            opacity: 1
        }, 300, "easeOutCubic", 100)
    }
    this.updatePath = h.updatePath
});
Module(function LoaderPathConfig() {
    this.exports = {
        ns: "http://www.w3.org/2000/svg",
        viewWidth: 634,
        viewHeight: 354,
        type: ['<polygon class="st0" points="131,98.4 122.7,98.4 99.2,152.4 110,152.4 114.9,140.1 118.2,131.8 126.6,109.8 134.9,131.8 138.3,140.1 143.3,152.4 154.3,152.4"/>', '<path class="st0" d="M230.5,111.1c-1.4-1.9-3.3-3.3-5.6-4.2c-2.3-0.9-4.5-1.3-6.7-1.3c-2.8,0-5.3,0.5-7.6,1.5c-2.3,1-4.3,2.4-5.9,4.2c-1.7,1.8-2.9,3.9-3.8,6.3c-0.9,2.4-1.3,5-1.3,7.8c0,3,0.4,5.6,1.3,8.1c0.9,2.4,2.1,4.5,3.7,6.3c1.6,1.8,3.5,3.1,5.8,4.1c2.2,1,4.8,1.4,7.6,1.4c2.9,0,5.5-0.6,7.7-1.7c2.2-1.1,4-2.7,5.4-4.5l7.7,5.4c-2.4,3-5.3,5.3-8.8,7c-3.5,1.7-7.5,2.5-12.1,2.5c-4.2,0-8.1-0.7-11.6-2.1c-3.5-1.4-6.6-3.4-9.1-5.9c-2.5-2.5-4.5-5.5-6-9c-1.4-3.5-2.1-7.3-2.1-11.6c0-4.3,0.7-8.2,2.3-11.7c1.5-3.5,3.6-6.4,6.2-8.9c2.6-2.4,5.7-4.3,9.3-5.6c3.6-1.3,7.4-2,11.6-2c1.7,0,3.5,0.2,5.4,0.5c1.9,0.3,3.7,0.8,5.4,1.5c1.7,0.7,3.4,1.5,4.9,2.6c1.5,1,2.8,2.2,3.9,3.7L230.5,111.1z"/>', '<path class="st0" d="M291.4,106.8h-16.6v-8.4h42.7v8.4H301v45.6h-9.6V106.8z"/>', '<path class="st0" d="M361.2,98.4h9.6v54h-9.6V98.4z"/>', '<path class="st0" d="M411.2,98.4H422l14.9,41.6h0.3l15-41.6h10.4l-21.7,54h-8.3L411.2,98.4z"/>', '<path class="st0" d="M499.5,98.4h37.2v8.4h-27.5v13.7h27.5v8.1h-27.5v15.3h27.5v8.5h-37.2V98.4z"/>', '<path class="st0" d="M122.8,256.5h-5.5v-49.1H99.2v-4.9h41.7v4.9h-18.1V256.5z"/>', '<path class="st0" d="M182.4,202.5h5.5v23.4h29.4v-23.4h5.5v54h-5.5v-25.6h-29.4v25.6h-5.5V202.5z"/>', '<path class="st0" d="M268.5,251.6h29.1v4.9H263v-54h34.6v4.9h-29.1v18.5h29.1v4.9h-29.1V251.6z"/>', '<path class="st0" d="M387.7,229.5c0,4.1-0.7,7.9-2.1,11.4c-1.4,3.5-3.4,6.4-5.9,9c-2.5,2.5-5.5,4.5-8.9,5.9c-3.4,1.4-7.2,2.1-11.2,2.1c-4,0-7.7-0.7-11.2-2.1c-3.4-1.4-6.4-3.4-8.9-5.9c-2.5-2.5-4.5-5.5-5.9-9c-1.4-3.5-2.1-7.2-2.1-11.4c0-4.1,0.7-7.9,2.1-11.4c1.4-3.5,3.4-6.4,5.9-9c2.5-2.5,5.5-4.5,8.9-5.9c3.4-1.4,7.2-2.1,11.2-2.1c4,0,7.7,0.7,11.2,2.1c3.4,1.4,6.4,3.4,8.9,5.9c2.5,2.5,4.5,5.5,5.9,9C387,221.6,387.7,225.4,387.7,229.5z M381.9,229.5c0-3.1-0.5-6.1-1.5-9c-1-2.8-2.5-5.3-4.4-7.5c-1.9-2.2-4.3-3.9-7.1-5.1c-2.8-1.3-5.9-1.9-9.3-1.9c-3.5,0-6.6,0.6-9.3,1.9c-2.8,1.3-5.1,3-7.1,5.1c-1.9,2.2-3.4,4.7-4.4,7.5c-1,2.8-1.5,5.8-1.5,9c0,3.1,0.5,6.1,1.5,9c1,2.8,2.5,5.3,4.4,7.5c1.9,2.1,4.3,3.8,7.1,5.1c2.8,1.3,5.9,1.9,9.3,1.9c3.5,0,6.6-0.6,9.3-1.9c2.8-1.3,5.1-3,7.1-5.1c1.9-2.1,3.4-4.6,4.4-7.5C381.4,235.7,381.9,232.7,381.9,229.5z"/>', '<path class="st0" d="M443.2,230.8c2-0.2,3.8-0.7,5.5-1.4c1.7-0.7,3.1-1.7,4.3-2.9c1.2-1.2,2.2-2.6,2.9-4.2c0.7-1.6,1.1-3.4,1.1-5.4c0-2.6-0.5-4.9-1.4-6.7c-0.9-1.8-2.2-3.3-3.9-4.5c-1.7-1.1-3.6-2-5.9-2.5c-2.3-0.5-4.7-0.8-7.4-0.8h-15.9v4.7h5.5h9.8c2,0,3.9,0.2,5.6,0.5c1.7,0.4,3.1,0.9,4.3,1.7c1.2,0.8,2.1,1.8,2.7,3c0.7,1.2,1,2.7,1,4.5c0,3.2-1.2,5.6-3.6,7.2c-2.4,1.6-5.8,2.4-10.2,2.4h-9.5v0h-5.5v30h5.5v-25.3h9.2l15,25.3h6.7L443.2,230.8z"/>', '<path class="st0" d="M516.4,256.5H511v-23.3l-20.2-30.7h6.9l16.3,26.2l16.4-26.2h6.4l-20.2,30.7V256.5z"/>'],
        mask: [{
            svg: '<polyline class="st2" points="101.8,159.8 126.8,98.4 148.8,152.4"/>',
            mask: 0,
            stroke: 9
        }, {
            svg: '<path class="st3" d="M234.5,108c-6.8-10.9-40.4-10.9-39.6,17.4c0.8,30.6,34.7,27,40.2,16.3"/>',
            mask: 1,
            stroke: 12
        }, {
            svg: '<line class="st4" x1="269.5" y1="102.3" x2="318" y2="102.3"/>',
            mask: 2,
            start: 0,
            end: 0.5,
            stroke: 9
        }, {
            svg: '<line class="st4" x1="296.2" y1="157" x2="296.2" y2="109"/>',
            mask: 2,
            start: 0.5,
            end: 1,
            stroke: 12
        }, {
            svg: '<line class="st4" x1="366" y1="90.8" x2="366" y2="152.4"/>',
            mask: 3,
            stroke: 12
        }, {
            svg: '<polyline class="st4" points="413.2,89 436.9,152.4 457.8,98.4"/>',
            mask: 4,
            stroke: 9
        }, {
            svg: '<polyline class="st4" points="542.2,102.3 504.2,102.3 504.2,147.8 536.7,147.8"/>',
            mask: 5,
            start: 0,
            end: 0.75,
            stroke: 9
        }, {
            svg: '<line class="st4" x1="542.2" y1="125.1" x2="509.2" y2="124.8"/>',
            mask: 5,
            start: 0.75,
            end: 1,
            stroke: 12
        }, {
            svg: '<line class="st2" x1="95.8" y1="204.8" x2="140.9" y2="204.8"/>',
            mask: 6,
            start: 0,
            end: 0.5,
            stroke: 6
        }, {
            svg: '<line class="st2" x1="120.1" y1="262" x2="120.1" y2="207.8"/>',
            mask: 6,
            start: 0.5,
            end: 1,
            stroke: 6
        }, {
            svg: '<line class="st2" x1="185.3" y1="197.2" x2="185.3" y2="256.5"/>',
            mask: 7,
            start: 0,
            end: 0.5,
            stroke: 6
        }, {
            svg: '<line class="st2" x1="188.7" y1="228.4" x2="216.8" y2="228.4"/>',
            mask: 7,
            start: 0.5,
            end: 1,
            stroke: 5
        }, {
            svg: '<line class="st2" x1="219.8" y1="265.8" x2="219.8" y2="202.5"/>',
            mask: 7,
            start: 0,
            end: 0.5,
            stroke: 5
        }, {
            svg: '<polyline class="st2" points="301.5,204.8 266.2,204.8 266.2,254 297.6,254"/>',
            mask: 8,
            start: 6,
            end: 0.5,
            stroke: 6
        }, {
            svg: '<line class="st2" x1="297.6" y1="228.4" x2="266.2" y2="228.4"/>',
            mask: 8,
            start: 0.5,
            end: 1,
            stroke: 6
        }, {
            svg: '<circle class="st2" cx="359.6" cy="229.4" r="25.8"/>',
            mask: 9,
            stroke: 6
        }, {
            svg: '<path class="st2" d="M416.8,204.8c0,0,12.3,0,23.1,0s13.9,5.5,13.9,11c0,3.8,0.8,13-14.1,13c-13.7,0-13.9,0-13.9,0l-0.1,27.7"/>',
            mask: 10,
            start: 0,
            end: 0.5,
            stroke: 6
        }, {
            svg: '<line class="st2" x1="457.8" y1="260.2" x2="439.6" y2="228.8"/>',
            mask: 10,
            start: 0.5,
            end: 1,
            stroke: 6
        }, {
            svg: '<polyline class="st2" points="490.7,197.2 513.7,232.2 513.7,256.5"/>',
            mask: 11,
            start: 0,
            end: 0.5,
            stroke: 6
        }, {
            svg: '<polyline class="st2" points="536.7,197.2 513.7,232.2 513.7,257"/>',
            mask: 11,
            start: 0.5,
            end: 1,
            stroke: 6
        }],
        rectangle: ['<polyline class="st1" points="317,6 5,6 5,349 317,349"/>', '<polyline class="st1" points="317,349 629,349 629,6 317,6"/>']
    }
});
Class(function LoaderSVG(g, c) {
    Inherit(this, Component);
    var f = this;
    var h, e, j;
    (function() {
        d();
        b()
    })();

    function d() {
        h = document.createElementNS(g.ns, "svg");
        h.setAttribute("viewBox", "0 0 " + g.viewWidth + " " + g.viewHeight);
        h.setAttribute("version", "1.1");
        j = $(h);
        c.add(h);
        f.svg = $(h)
    }

    function b() {
        e = f.initClass(LoaderSVGItems, g, h)
    }

    function a() {
        var l = g.viewWidth;
        var k = g.viewHeight;
        if (Stage.height < 550) {
            var m = Stage.height / 550;
            l *= m;
            k *= m
        }
        if (Stage.width < 600) {
            var m = Stage.width / 600;
            l *= m;
            k *= m
        }
        j.size(l, k).center();
        e.resize()
    }
    this.resize = a;
    this.updatePath = e.updatePath
});
Class(function LoaderSVGItems(l, d) {
    Inherit(this, Component);
    var h = this;
    var o = [];
    var n = [];
    var m = [];
    var j = [];
    var f = (Device.browser.ie || Mobile.phone) ? true : false;
    (function() {
        if (!f) {
            a()
        }
        k();
        e();
        g();
        p()
    })();

    function a() {
        l.rectangle.forEach(function(t, r) {
            var q = {};
            var s = t.substr(t.indexOf("<") + 1, t.indexOf("class") - 2);
            q.path = new LoaderSVGObject(s, t);
            q.length = q.path.getLength();
            q.path.object.css({
                fill: "none",
                stroke: "black",
                strokeWidth: 10,
                strokeDasharray: q.length + " " + q.length,
                strokeDashoffset: q.length
            });
            q.path.addTo(d);
            m.push(q)
        })
    }

    function g() {
        l.type.forEach(function(t, q) {
            var r = t.substr(t.indexOf("<") + 1, t.indexOf("class") - 2);
            var s = new LoaderSVGObject(r, t);
            s.addTo(d);
            s.object.css({
                fill: "black"
            });
            o.push(s)
        })
    }

    function k() {
        var q = 0;
        l.mask.forEach(function(t, r) {
            var s;
            if (q === t.mask) {
                s = new LoaderSVGObject("mask", "clip-" + q);
                s.addTo(d)
            } else {
                q = t.mask;
                s = j[j.length - 1]
            }
            q++;
            j.push(s)
        })
    }

    function e() {
        l.mask.forEach(function(t, r) {
            var q = {};
            var s = t.svg.substr(t.svg.indexOf("<") + 1, t.svg.indexOf("class") - 2);
            q.path = new LoaderSVGObject(s, t.svg);
            q.length = q.path.getLength();
            q.path.object.css({
                fill: "none",
                stroke: "white",
                opacity: 0,
                strokeWidth: t.stroke,
                "stroke-linecap": "square",
                "stroke-linejoin": "miter",
                strokeDasharray: q.length + " " + q.length,
                strokeDashoffset: q.length
            });
            q.path.addTo(j[r]);
            q.start = t.start;
            q.end = t.end;
            n.push(q)
        })
    }

    function p() {
        o.forEach(function(r, q) {
            r.attribute = "mask,url(#clip-" + q + ")"
        })
    }

    function c(r, q) {
        r *= 100;
        n.forEach(function(x, u) {
            var v = x.path.object;
            var w = 0;
            var t = 100;
            if (x.start) {
                w = x.start * 100;
                t = x.end * 100
            }
            var s = Utils.convertRange(r, 0, 100, x.length, 0);
            v.div.style.strokeDashoffset = s + "px";
            v.div.style.opacity = 1
        });
        if (!q && !f) {
            m.forEach(function(v, t) {
                var u = v.path.object;
                var s = Utils.convertRange(r, 0, 100, v.length, 0);
                u.div.style.strokeDashoffset = s + "px"
            })
        }
    }

    function b() {
        if (f) {
            return
        }
        m.forEach(function(q) {
            q.path.object.css({
                display: (Stage.width <= 600) ? "none" : "block"
            })
        })
    }
    this.updatePath = c;
    this.resize = b
});
Class(function LoaderSVGObject(d, n) {
    Inherit(this, Component);
    var p = this;
    var a, r;
    var g = {};
    var m = 0;
    var h = require("LoaderPathConfig");
    (function() {
        c()
    })();

    function c() {
        var t = d;
        if (d === "line" || d === "polyline" || d === "circle" || d === "polygon") {
            t = "path"
        }
        a = document.createElementNS(h.ns, t);
        if (d === "clipPath" || d === "mask") {
            return k()
        }
        if (d === "line" || d === "polyline" || d === "circle" || d === "polygon" || d === "path") {
            q();
            s()
        }
    }

    function q() {
        var t = "d",
            v = 3;
        switch (d) {
            case "polygon":
                n = j();
                break;
            case "polyline":
                t = "points";
                v = 8;
                break;
            case "line":
                n = l();
                break;
            case "circle":
                n = o();
                break
        }
        var w = (n.indexOf(t + "=") + v);
        var u = n.lastIndexOf('"') - w;
        n = n.substr(w, u);
        if (d === "polyline") {
            t = "d";
            n = "M" + n
        }
        a.setAttributeNS(null, t, n)
    }

    function o() {
        var t, w, v, u;
        t = n.substr(n.indexOf("cx=") + 4, (n.indexOf("cy=") - 2) - (n.indexOf("cx=") + 4));
        w = n.substr(n.indexOf("cy=") + 4, (n.indexOf("r=") - 2) - (n.indexOf("cy=") + 4));
        v = n.substr(n.indexOf("r=") + 3, (n.length - 6) - n.indexOf("r="));
        u = parseFloat(v * 2);
        m = v;
        return 'd="M' + t + ", " + w + " m" + (-v) + ", 0 a " + v + ", " + v + " 0 1,0 " + u + ",0 a " + v + ", " + v + " 0 1,0 " + (-u) + ',0"'
    }

    function l() {
        var u, t, w, v;
        u = n.substr(n.indexOf("x1=") + 4, (n.indexOf("y1=") - 2) - (n.indexOf("x1=") + 4));
        w = n.substr(n.indexOf("y1=") + 4, (n.indexOf("x2=") - 2) - (n.indexOf("y1=") + 4));
        t = n.substr(n.indexOf("x2=") + 4, (n.indexOf("y2=") - 2) - (n.indexOf("x2=") + 4));
        v = n.substr(n.indexOf("y2=") + 4, (n.length - 7) - n.indexOf("y2="));
        return 'd="M' + u + "," + w + " " + t + "," + v + '"'
    }

    function j() {
        var u = (n.indexOf("points=") + 8);
        var t = n.lastIndexOf('"') - u;
        return 'd="M' + n.substr(u, t) + '"'
    }

    function s() {
        r = $(a)
    }

    function k() {
        a.setAttribute("id", n)
    }

    function f(t) {
        if (t.points) {
            t = t.points
        }
        t.appendChild(a)
    }

    function e(u) {
        var t = u.substr(0, u.indexOf(","));
        var v = u.substr(u.indexOf(",") + 1, u.length);
        g[t] = v;
        return {
            style: t,
            property: g[t]
        }
    }

    function b() {
        return a.getTotalLength()
    }
    this.addTo = f;
    this.getLength = b;
    this.set("attribute", function(t) {
        var u = e(t);
        a.setAttribute(u.style, u.property)
    });
    this.get("attribute", function() {
        return g
    });
    this.get("points", function() {
        return a
    });
    this.get("object", function() {
        return r
    })
});
Class(function MenuBasic() {
    Inherit(this, View);
    var d = this;
    var c, a;
    (function() {
        b()
    })();

    function b() {
        c = d.element;
        c.size("100%").bg(Config.BG_COLOR).css({
            opacity: 0
        });
        a = c.create("img");
        a.size("100%").bg("assets/images/menu/fallback.jpg", "cover").css({
            opacity: 0
        });
        defer(function() {
            d.parent.element.setZ(9999)
        });
        Hardware.FALLBACK_TRANSITION = true
    }
    this.render = function() {};
    this.resize = function() {};
    this.animateIn = function() {
        c.tween({
            opacity: 1
        }, 500, "easeOutSine");
        a.tween({
            opacity: 1
        }, 500, "easeInOutSine", 300)
    };
    this.animateOut = function() {
        a.tween({
            opacity: 0
        }, 500, "easeOutSine");
        c.tween({
            opacity: 0
        }, 500, "easeInOutSine", 300)
    };
    this.test = function(e) {
        defer(e)
    }
});
Class(function MenuCSS(b) {
    Inherit(this, Component);
    var f = this;
    var j, h, a;
    var c, g, d;
    (function() {
        k();
        if (!Mobile.phone) {
            e()
        } else {
            l()
        }
    })();

    function k() {
        j = new THREE.CSS3DRenderer();
        j.setSize(Stage.width, Stage.height);
        b.element.add(j.domElement);
        h = new THREE.Scene();
        a = MenuGLCamera.instance().worldCamera;
        h.position.x = Config.SCENE_OFFSET;
        MenuCSS.SCENE = h
    }

    function e() {
        c = new THREE.Object3D();
        h.add(c);
        c.position.x = Mobile.phone ? 0 : -580;
        var o = ["HOME", "WORK", "LAB", "ABOUT"];
        g = [];
        for (var n = 0; n < o.length; n++) {
            var m = f.initClass(MenuCSSButton, o[n]);
            c.add(m.mesh);
            m.mesh.position.y = (-n * 140) + 220;
            m.mesh.position.x = 50 - n * 10;
            m.mesh.position.z = n == 1 || n == 2 ? 70 : 0;
            m.mesh.position.x = 50 - n * 10 + m.mesh.position.z * 0.45;
            g.push(m)
        }
    }

    function l() {
        d = f.initClass(MenuList);
        d.resize();
        d.mesh = new THREE.CSS3DObject(d.element.div);
        d.mesh.scale.set(3.3, 3.3, 3.3);
        d.mesh.position.y = 70;
        h.add(d.mesh)
    }
    this.render = function() {
        j.render(h, a)
    };
    this.resize = function() {
        j.setSize(Stage.width, Stage.height);
        d && d.resize()
    };
    this.animateIn = function() {
        if (g) {
            for (var m = 0; m < g.length; m++) {
                f.delayedCall(g[m].animateIn, m * 80)
            }
        } else {
            d.animateIn()
        }
    };
    this.animateOut = function() {
        if (g) {
            for (var m = 0; m < g.length; m++) {
                f.delayedCall(g[m].animateOut, m * 30)
            }
        } else {
            d.animateOut()
        }
    }
});
Class(function MenuCSSButton(m) {
    Inherit(this, Component);
    var h = this;
    var o, k, a, j, p, b, e, r;
    var n = -4;
    if (Device.browser.firefox) {
        n = 0
    }(function() {
        d();
        c();
        defer(f);
        l()
    })();

    function d() {
        o = $("MenuCSSButton");
        o.size(350, 130).invisible();
        a = o.create(".wrap");
        a.size("100%");
        k = a.create(".solid");
        k.css({
            overflow: "hidden"
        });
        k.inner = k.create(".inner");
        k.inner.size("100%").bg("#fff").css({
            left: "100%"
        });
        r = a.create(".behind");
        h.mesh = new THREE.CSS3DObject(o.div)
    }

    function c() {
        j = a.create(".wrapper");
        j.size("100%").css({
            overflow: "hidden"
        });
        p = j.create(".text");
        p.fontStyle("OpenSansBold", 24, "#fff");
        p.text(m).css({
            textAlign: "left",
            letterSpacing: 7,
            top: "50%",
            marginTop: -14,
            opacity: 0.8
        });
        b = j.create(".bg");
        b.size("100%").bg("#fff").css({
            left: "-100%",
            overflow: "hidden"
        });
        e = p.clone();
        e.css({
            color: "#111"
        });
        b.add(e)
    }

    function f() {
        h.offset = 60;
        h.width = CSS.textSize(p).width + h.offset * 2;
        j.size(h.width, 110);
        p.css({
            width: "100%",
            left: h.offset
        });
        e.css({
            width: "100%",
            left: h.offset
        });
        h.lineSize = Stage.width * 0.9;
        k.size(h.lineSize, 6).center(0, 1).css({
            left: -h.lineSize,
            marginTop: -6
        });
        r.size(h.lineSize, 4).center(0, 1).css({
            left: -h.lineSize,
            marginTop: -5
        }).bg("#fff").css({
            opacity: 0.1
        })
    }

    function l() {
        o.interact(g, q)
    }

    function g(s) {
        h.events.fire(MenuCSSButton.HOVER, {
            type: s.action,
            text: m
        });
        switch (s.action) {
            case "over":
                k.stopTween().css({
                    opacity: 1
                });
                k.inner.stopTween().transform({
                    x: 0
                }).tween({
                    x: -h.lineSize
                }, 700, "easeInOutCubic");
                b.stopTween().transform({
                    x: 0
                }).tween({
                    x: h.width
                }, 500, "easeOutQuint");
                e.stopTween().transform({
                    x: h.width,
                    skewX: -n
                }).css({
                    opacity: 1
                }).tween({
                    x: 0,
                    skewX: -n
                }, 500, "easeOutQuint");
                break;
            case "out":
                k.tween({
                    opacity: 0
                }, 500, "easeOutCubic");
                b.tween({
                    x: Device.browser.safari || Mobile.os === "Safari" ? h.width * 2 + 1 : h.width * 2
                }, 500, "easeOutQuint");
                e.tween({
                    x: -h.width,
                    skewX: -n
                }, 500, "easeOutQuint");
                break
        }
    }

    function q() {
        Container.instance().page(m.toLowerCase())
    }
    this.animateIn = function() {
        defer(function() {
            o.visible();
            a.css({
                opacity: 0
            }).transform({
                skewX: n
            }).tween({
                opacity: 1
            }, 500, "easeOutSine");
            r.transform({
                x: -h.lineSize
            }).css({
                opacity: 1
            }).tween({
                x: 0,
                opacity: 0.1
            }, 1000, "easeOutExpo");
            p.transform({
                x: 20,
                skewX: -n
            }).css({
                opacity: 0
            }).tween({
                x: 0,
                opacity: 1,
                skewX: -n
            }, 700, "easeOutExpo", 500);
            b.stopTween().transform({
                x: 0
            }).tween({
                x: Device.browser.safari || Mobile.os === "Safari" ? h.width * 2 + 1 : h.width * 2
            }, 700, "easeInOutQuint", 50);
            e.css({
                opacity: 0
            }).transform({
                skewX: -n
            })
        })
    };
    this.animateOut = function() {
        a.tween({
            opacity: 0
        }, 300, "easeOutSine");
        p.tween({
            x: -20,
            opacity: 0
        }, 200, "easeOutCubic")
    }
}, function() {
    MenuCSSButton.HOVER = "hover"
});
Class(function MenuFooter(c) {
    Inherit(this, View);
    var g = this;
    var e, f;
    var d;
    (function() {
        b();
        a()
    })();

    function b() {
        e = g.element;
        e.size("100%", 30).css({
            bottom: Config.UI_OFFSET - 8
        }).setZ(100).hide()
    }

    function a() {
        f = e.create(".items");
        f.size("100%", 30).css({
            textAlign: "center",
            top: 0
        });
        var h = [{
            text: "HELLO@ACTIVETHEORY.NET",
            link: "mailto:hello@activetheory.net",
            ext: "_parent"
        }, {
            text: "615 HAMPTON DRIVE A311, VENICE CA 90291",
            link: "https://goo.gl/9lvyYd",
            ext: "_blank"
        }, {
            text: "310 310 8869",
            link: "tel:3103108869",
            ext: "_parent"
        }];
        d = [];
        for (var j = 0; j < h.length; j++) {
            var k = g.initClass(MenuFooterLink, h[j], c, null);
            f.addChild(k);
            d.push(k);
            if (j < h.length - 1 && !Mobile.phone) {
                k.sep = f.create(".sep");
                k.sep.size(2, 2).css({
                    borderRadius: 2,
                    marginBottom: Device.browser.safari || Mobile.browser == "Safari" ? 3 : 17,
                    position: "relative",
                    display: "inline-block",
                    opacity: 0.4
                }).bg("#fff")
            }
        }
    }
    this.resize = function() {
        var j = Stage.width < 920;
        e.size("100%", j ? 80 : 30);
        for (var h = 0; h < d.length; h++) {
            d[h].css({
                width: j ? "100%" : ""
            });
            if (d[h].sep) {
                if (j) {
                    d[h].sep.hide()
                } else {
                    d[h].sep.css({
                        display: "inline-block"
                    })
                }
            }
        }
    };
    this.animateIn = function() {
        e.show().css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 400, "easeOutSine", 200);
        for (var h = 0; h < d.length; h++) {
            d[h].transform({
                y: 15
            }).css({
                opacity: 0
            }).tween({
                opacity: c ? 0.7 : 0.5,
                y: 0
            }, 800, "easeOutQuart", h * 150 + 200)
        }
    };
    this.animateOut = function() {
        for (var h = 0; h < d.length; h++) {
            d[h].tween({
                opacity: 0,
                y: 5
            }, 400, "easeOutQuart")
        }
        g.delayedCall(function() {
            e.hide()
        }, 500)
    }
});
Class(function MenuFooterLink(d, n) {
    Inherit(this, View);
    var f = this;
    var j, l, b, m, g;
    var k;
    (function() {
        c();
        if (Device.mobile) {
            a()
        }
        o();
        h()
    })();

    function c() {
        j = f.element;
        j.css({
            position: "relative",
            letterSpacing: Mobile.phone ? 1 : 1.5,
            width: Mobile.phone ? "100%" : "",
            display: "inline-block",
            margin: Mobile.phone ? "0 0px" : "0 15px",
            opacity: 0.4,
            overflow: "hidden"
        });
        j.mouseEnabled(true);
        l = j.create(".inner");
        l.fontStyle("OpenSans", 10, "#fff");
        l.css({
            position: "relative",
            height: Mobile.phone ? 16 : 20,
            overflow: "hidden",
            display: "inline-block"
        });
        l.text(d.text)
    }

    function a() {
        g = j.create("footer-link", "a");
        g.size("100%").css({
            left: 0,
            top: 0,
            zIndex: 99999999
        });
        g.div.setAttribute("href", d.link)
    }

    function o() {
        b = l.create(".line");
        b.css({
            width: "50%",
            height: 1,
            bottom: Device.mobile ? 1 : 7,
            left: "-50%"
        }).bg("#fff");
        m = l.create(".line");
        m.css({
            width: "50%",
            height: 1,
            bottom: Device.mobile ? 1 : 7,
            right: "-50%"
        }).bg("#fff")
    }

    function h() {
        if (Device.mobile) {
            j.touchClick(e)
        }
        if (!Device.mobile) {
            j.interact(e, p);
            j.hit.css({
                height: "200%",
                top: "-50%"
            })
        }
    }

    function e(q) {
        switch (q.action) {
            case "over":
                k = k || j.div.offsetWidth / 2;
                j.tween({
                    opacity: 1
                }, 100, "easeOutSine");
                if (!Device.mobile) {
                    b.tween({
                        x: k
                    }, 300, "easeOutCirc");
                    m.tween({
                        x: -k
                    }, 300, "easeOutCirc")
                }
                break;
            case "out":
                j.tween({
                    opacity: n ? 0.7 : 0.5
                }, 300, "easeOutSine");
                if (!Device.mobile) {
                    b.tween({
                        x: 0
                    }, 500, "easeOutCirc");
                    m.tween({
                        x: 0
                    }, 500, "easeOutCirc")
                }
                break
        }
    }

    function p() {
        getURL(d.link, d.ext)
    }
    this.animateIn = function() {}
});
Class(function MenuGL() {
    Inherit(this, View);
    var q = this;
    var h;
    var u, l, w, b;
    var d, p, b, j;
    var g, t;
    var s = new RenderPerformance();
    var a = require("Randomizr");
    MenuGL.DPI = Math.min(Device.pixelRatio, 2);
    (function() {
        m();
        n();
        c();
        k();
        o()
    })();

    function m() {
        h = q.element;
        h.size("100%").setZ(2)
    }

    function n() {
        u = new THREE.WebGLRenderer({
            alpha: true
        });
        u.setPixelRatio(Device.pixelRatio);
        u.setSize(Stage.width, Stage.height);
        u.setClearColor(0);
        MenuGL.RENDERER = u;
        h.add(u.domElement);
        u.object = $(u.domElement)
    }

    function k() {
        w = q.initClass(Nuke, Stage, {
            renderer: u,
            scene: MenuGLScene.SCENE,
            camera: MenuGLCamera.instance().worldCamera,
            dpr: MenuGL.DPI
        });
        d = q.initClass(NukePass, "Chroma");
        d.uniforms.lightGlow = {
            type: "t",
            value: MenuGLSceneLogo.GLOW_MAP
        };
        d.uniforms.brightness = {
            type: "f",
            value: 0.75
        };
        w.add(d);
        j = new THREE.Color(15786751);
        p = q.initClass(NukePass, "ColorPass");
        p.uniforms.tint = {
            type: "c",
            value: j.clone()
        };
        p.uniforms.dark = {
            type: "f",
            value: 0
        };
        p.uniforms.rgbAmount = {
            type: "f",
            value: 1
        };
        p.uniforms.glitchAmount = {
            type: "f",
            value: 0
        };
        p.uniforms.darkColor = {
            type: "c",
            value: new THREE.Color(Config.BG_COLOR)
        };
        p.uniforms.tMask = {
            type: "t",
            value: TransitionView.TEXTURE
        };
        p.uniforms.time = {
            type: "f",
            value: 0
        };
        p.uniforms.noiseAmount = {
            type: "f",
            value: 0
        };
        w.add(p);
        g = new DynamicObject({
            v: 0
        });
        t = new DynamicObject({
            v: 0
        })
    }

    function c() {
        l = q.initClass(MenuGLScene, u)
    }

    function r(z) {
        var y = a(0, Config.MENU_COLORS.length - 1, 3);
        var x = Config.MENU_COLORS[y];
        if (!(x instanceof THREE.Color)) {
            x = new THREE.Color(x);
            Config.MENU_COLORS[y] = x
        }
        g.v = 0;
        g.tween({
            v: 1
        }, 1000, "easeOutSine", function() {
            var A = g.v;
            A += Utils.doRandom(-10, 10) / 30;
            p.uniforms.tint.value.lerp(x, A)
        })
    }

    function e() {
        g.v = 1;
        g.tween({
            v: 0
        }, 10000, "easeInOutSine", function() {
            var x = g.v;
            p.uniforms.tint.value.lerp(j, 1 - x)
        })
    }

    function o() {
        q.events.subscribe(MenuCSSButton.HOVER, v)
    }

    function v(x) {
        clearTimeout(b);
        if (x.type == "over") {
            r(x.text.toLowerCase());
            q.events.fire(MenuGL.HOVER, {
                action: "over",
                type: x.text
            });
            t.tween({
                v: 1
            }, 100, "easeOutSine");
            p.set("rgbAmount", 5);
            p.tween("rgbAmount", 1, 300, "easeOutCubic");
            p.set("glitchAmount", 1);
            p.tween("glitchAmount", 0, 50, "easeOutCubic")
        } else {
            b = q.delayedCall(function() {
                q.events.fire(MenuGL.HOVER, {
                    action: "out"
                });
                t.tween({
                    v: 0
                }, 750, "easeInOutSine");
                e()
            }, 250)
        }
    }

    function f() {
        if (w.enabled && !Hardware.DEDICATED_GRAPHICS) {
            w.remove(d);
            MenuGL.DISABLE_CHROMA = true
        }
        if (!w.enabled) {
            MenuGL.DISABLE_CHROMA = true
        }
    }
    this.render = function() {
        p.set("tMask", TransitionView.TEXTURE);
        s.enabled = MenuGL.TESTING;
        MenuGL.USE_TEXTURE = w.enabled;
        d.set("brightness", Utils.range(t.v, 0, 1, 0.3, 1));
        s.time();
        l.update();
        w.render();
        s.time();
        p.set("time", Render.TSL * 0.2);
        MenuGL.BRIGHTNESS = t.v
    };
    this.resize = function() {
        u.setSize(Stage.width, Stage.height)
    };
    this.animateIn = function() {
        MenuGLCamera.instance().animateIn();
        if (!w.enabled) {
            u.object.css({
                opacity: 0
            }).tween({
                opacity: 1
            }, 500, "easeOutSine", 100)
        } else {
            p.set("dark", 1);
            p.tween("dark", 0, 800, "easeInOutSine");
            p.tween("noiseAmount", 1, 2000, "easeOutSine", 800)
        }
    };
    this.animateOut = function() {
        if (!w.enabled) {
            MenuGLCamera.instance().animateOut();
            u.object.tween({
                opacity: 0
            }, 300, "easeOutCubic", 300)
        } else {
            p.tween("dark", 1, 600, "easeOutSine");
            p.set("noiseAmount", 0)
        }
    };
    this.test = function(y) {
        MenuGL.TESTING = true;
        var x = function(z) {
            if (!Hardware.DEDICATED_GRAPHICS) {
                if (Device.mobile || Hardware.FORCE_WEBGL_FALLBACK || !Hardware.MAC || (Device.system.retina || Stage.width > 1500)) {
                    w.enabled = false;
                    if (!q.NEW_IPHONE) {
                        Hardware.FALLBACK_TRANSITION = true
                    }
                    Hardware.REMOVED_POST = true
                }
            }
            Hardware.PERF_RESULTS.menuNuke = z;
            y();
            f();
            MenuGL.TESTING = false
        };
        q.delayedCall(function() {
            Hardware.PERF_RESULTS.menuInit = s.median;
            s.clear();
            w.enabled = Device.pixelRatio < 2;
            q.delayedCall(function() {
                q.events.fire(MenuGL.TEST_END);
                Hardware.PERF_RESULTS.menuRender = s.median;
                var z = Hardware.PERF_RESULTS;
                if (Device.pixelRatio > 1) {
                    if (!Hardware.DEDICATED_GRAPHICS) {
                        if (!Hardware.FORCE_RETINA) {
                            u.setPixelRatio(1);
                            w.dpr = 1;
                            u.setSize(Stage.width, Stage.height);
                            MenuGL.DPI = 1;
                            Hardware.REDUCED_RETINA = true
                        }
                    }
                    w.enabled = true;
                    s.clear();
                    q.delayedCall(function() {
                        x(s.median)
                    }, 10)
                } else {
                    x(s.median)
                }
            }, 10)
        }, 10)
    }
}, function() {
    MenuGL.HOVER = "menu_gl_hover";
    MenuGL.TEST_END = "menu_gl_test_end"
});
Class(function MenuGLScene(f) {
    Inherit(this, Component);
    var d = this;
    var e, j, b, a, c;
    var h;
    (function() {
        g()
    })();

    function g() {
        e = new THREE.Scene();
        b = MenuGLCamera.instance();
        if (!Mobile.phone) {
            a = d.initClass(MenuGLSceneLogo);
            e.add(a.object3D)
        }
        j = d.initClass(MenuGLSceneTerrain, a ? a.object3D : new THREE.Object3D());
        e.add(j.object3D);
        c = d.initClass(MenuGLSceneBG);
        e.add(c.mesh);
        h = d.initClass(MenuGLSceneParticles);
        d.delayedCall(function() {
            e.add(h.mesh)
        }, 500);
        e.position.x = Config.SCENE_OFFSET;
        MenuGLScene.SCENE = e
    }
    this.update = function() {
        j.update();
        c.update();
        a && a.update();
        b.update();
        h.update()
    }
});
Class(function MenuGLSceneBG() {
    Inherit(this, Component);
    var c = this;
    var b;
    (function() {
        a()
    })();

    function a() {
        var d = new THREE.IcosahedronGeometry(2000, 3);
        b = new Shader("MenuBG", "MenuBG");
        b.uniforms = {
            time: {
                type: "f",
                value: 0
            },
        };
        b.material.side = THREE.BackSide;
        var e = new THREE.Mesh(d, b.material);
        c.mesh = e
    }
    this.update = function() {
        b.set("time", Render.TSL * 0.00007)
    }
});
Class(function MenuGLCamera() {
    Inherit(this, Component);
    var f = this;
    var j = [];
    var d = new THREE.Object3D();
    var g = Mobile.Accelerometer;
    var a = m();
    this.worldCamera = m();
    (function() {
        g.capture();
        l();
        h();
        defer(k)
    })();

    function m() {
        var n = new THREE.PerspectiveCamera(60, Stage.width / Stage.height, 10, 30000);
        j.push(n);
        return n
    }

    function l() {
        d.add(a);
        d.position.z = 1500
    }

    function c() {
        if (!a.lookAtV) {
            a.lookAtV = new THREE.Vector3();
            a.lookAtM = new THREE.Matrix4();
            a.lookAtT = new Vector3();
            a.pos = new Vector3()
        }
        a.lookAtM.getInverse(d.matrixWorld);
        var n = a.lookAtM.elements;
        a.lookAtV.set(n[12], n[13], n[14]);
        a.lookAt(a.lookAtV);
        if (!Device.mobile) {
            var p = 300;
            var o = 200;
            a.lookAtT.x = Utils.range(Mouse.x, 0, Stage.width, -p, p);
            a.lookAtT.y = Utils.range(Mouse.y, 0, Stage.height, -o, o)
        } else {
            var p = 500;
            var o = 200;
            a.lookAtT.x = -Utils.range(g.x, -3, 3, -p, p, true)
        }
        a.lookAtT.z = a.pos.z = a.position.z;
        a.pos.interp(a.lookAtT, 0.1, "easeOutQuint");
        a.position.lerp(a.pos, 0.1)
    }

    function e() {
        if (!d.wiggle) {
            d.wiggle = new WiggleBehavior(d.position);
            d.wiggle.scale = 0.8;
            d.wiggle.zMove = 0;
            d.wiggle.speed = 0.2
        }
        d.wiggle.update()
    }

    function k() {
        if (Mobile.tablet) {
            if (Stage.width < Stage.height) {
                MenuGLScene.SCENE.position.x = 200;
                MenuCSS.SCENE.position.x = 320
            } else {
                MenuGLScene.SCENE.position.x = MenuCSS.SCENE.position.x = 0
            }
        }
    }

    function h() {
        f.events.subscribe(HydraEvents.RESIZE, b)
    }

    function b() {
        j.forEach(function(n) {
            n.aspect = Stage.width / Stage.height;
            n.updateProjectionMatrix()
        });
        k()
    }
    this.update = function() {
        d.updateMatrixWorld();
        c();
        e();
        a.updateMatrixWorld();
        a.controls && a.controls.update();
        Utils3D.decompose(a, f.worldCamera)
    };
    this.animateIn = function() {
        var n = Stage.width / Stage.height;
        TweenManager.clearTween(a.position);
        a.position.z = 0;
        d.position.z = n > 1.7 ? 2000 : 2500
    };
    this.animateOut = function() {
        TweenManager.tween(a.position, {
            z: 500
        }, 600, "easeInCubic")
    }
}, "singleton");
Class(function MenuGLSceneLogo() {
    Inherit(this, Component);
    var r = this;
    var h, w, c, q, b;
    var j, v, t, f, k, l, m;
    this.object3D = new THREE.Object3D();
    var b = new RenderPerformance();
    (function() {
        e();
        d();
        a();
        p();
        g();
        o();
        s()
    })();

    function e() {
        c = new THREE.CubeCamera(10, 10000, 1024);
        r.delayedCall(function() {
            c.needsRender = true
        }, 100)
    }

    function d() {}

    function a() {
        f = new THREE.BufferGeometry().fromGeometry(Utils3D.loadGeometry("logo"));
        delete Hydra.JSON.logo;
        h = r.initClass(Shader, "LogoRefract", "LogoRefract");
        h.uniforms = {
            tReflect: {
                type: "t",
                value: c.renderTarget
            },
            time: {
                type: "f",
                value: 0
            },
            brightness: {
                type: "f",
                value: 0
            },
            reflBlend: {
                type: "f",
                value: 1
            },
            lightColor: {
                type: "c",
                value: new THREE.Color(14600447)
            }
        };
        var x = new THREE.Mesh(f, h.material);
        r.object3D.add(x);
        q = x
    }

    function p() {
        var y = new THREE.PlaneBufferGeometry(1400, 1400);
        var x = new THREE.MeshBasicMaterial({
            map: Utils3D.getTexture("assets/images/menu/brightness.jpg"),
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        var z = new THREE.Mesh(y, x);
        x.opacity = 0.2;
        x.depthWrite = false;
        z.position.z = -100;
        r.object3D.add(z);
        m = z
    }

    function g() {
        j = new THREE.Scene();
        t = Utils3D.createRT(Stage.width, Stage.height);
        v = r.initClass(Nuke, Stage, {
            scene: j,
            camera: MenuGLCamera.instance().worldCamera,
            renderer: MenuGL.RENDERER,
            rtt: t,
            dpr: 1
        });
        j.position.x = Config.SCENE_OFFSET;
        MenuGLSceneLogo.GLOW_MAP = t;
        var z = new Shader("LogoOcclusion", "LogoOcclusion");
        z.uniforms = {
            color: {
                type: "c",
                value: new THREE.Color(14992127)
            }
        };
        k = new THREE.Mesh(f, z.material);
        j.add(k);
        l = new NukePass("LogoBlur");
        l.uniforms.resolution = {
            type: "v2",
            value: new THREE.Vector2(Stage.width, Stage.height)
        };
        l.uniforms.direction = {
            type: "v2",
            value: new THREE.Vector2(1.5, 0)
        };
        var y = new NukePass("LogoBlur");
        y.uniforms.resolution = l.uniforms.resolution;
        y.uniforms.direction = {
            type: "v2",
            value: new THREE.Vector2(2.5, 1.5)
        };
        for (var x = 0; x < 2; x++) {
            v.add(l);
            v.add(y)
        }
    }

    function o() {
        r.events.subscribe(MenuGL.HOVER, u);
        r.events.subscribe(MenuGL.TEST_END, n);
        r.events.subscribe(HydraEvents.RESIZE, s)
    }

    function s() {
        if (Mobile.tablet && Stage.height > Stage.width) {
            r.object3D.scale.set(0.8, 0.8, 0.8)
        } else {
            r.object3D.scale.set(1, 1, 1)
        }
    }

    function u(x) {
        if (x.action == "over") {
            w && w.swap(x.type);
            h.tween("reflBlend", 1, 300, "easeOutSine");
            h.set("brightness", Hardware.FALLBACK_TRANSITION ? 0.3 : 1)
        } else {
            h.tween("reflBlend", 0, 1000, "easeInOutSine");
            h.tween("brightness", 0, 1200, "easeInOutSine")
        }
    }

    function n() {
        Hardware.PERF_RESULTS.logoBlur = b.median
    }
    this.update = function() {
        b.enabled = MenuGL.TESTING;
        k.position.copy(r.object3D.position);
        b.time();
        if (!MenuGL.DISABLE_CHROMA) {
            v.render()
        }
        b.time();
        m.material.opacity = Utils.range(MenuGL.BRIGHTNESS, 0, 1, 0.1, 0.2);
        r.object3D.visible = false;
        c.position.copy(r.object3D.position);
        if (c.needsRender) {
            c.updateCubeMap(MenuGL.RENDERER, MenuGLScene.SCENE);
            c.needsRender = false
        }
        r.object3D.visible = true;
        h.set("time", Render.TSL * 0.00035)
    }
});
Class(function MenuGLSceneLogoTexture(h) {
    Inherit(this, Component);
    var o = this;
    var t, s, j, c, m;
    var d, q, f, u;
    var e = 1024;
    var l = 1024;
    var g = {};
    (function() {
        b();
        n();
        r();
        k();
        p();
        a()
    })();

    function n() {
        s = MenuGL.RENDERER;
        f = Utils3D.createRT(e, l);
        var v = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        t = new THREE.WebGLRenderTargetCube(e, l, v);
        t.activeCubeFace = 5;
        o.texture = t;
        o.cubeMap = t
    }

    function k() {
        j = new THREE.Scene();
        c = new THREE.OrthographicCamera(e / -2, e / 2, l / 2, l / -2, 1, 1000);
        c.position.z = 1
    }

    function r() {
        u = o.initClass(GlitchCanvas, e, l)
    }

    function a() {
        var v = new THREE.PlaneBufferGeometry(e, l);
        m = new THREE.Mesh(v, q.material);
        j.add(m)
    }

    function p() {
        q = o.initClass(Shader, "VideoTexture", "VideoTexture");
        q.uniforms = {
            tMap: {
                type: "t",
                value: null
            },
        }
    }

    function b() {
        ["HOME", "WORK", "LAB", "ABOUT"].forEach(function(v) {
            g[v] = Utils3D.getTexture("assets/images/menu/textures/" + v.toLowerCase() + ".jpg")
        })
    }
    this.swap = function(v) {
        q.uniforms.tMap.value = g[v];
        s.render(j, c, t)
    }
});
Class(function MenuGLSceneLogoVideo() {
    Inherit(this, Component);
    var d = this;
    var a, b;
    (function() {
        c()
    })();

    function c() {
        a = d.initClass(Video, {
            src: "assets/videos/audi.mp4",
            width: 1280,
            height: 720,
            loop: true
        });
        a.volume(0);
        a.seek(20);
        a.play();
        b = new THREE.Texture(a.div);
        b.minFilter = THREE.NearestFilter;
        d.texture = b;
        d.texture = Utils3D.getTexture("assets/images/temp/screenshot.jpg", true)
    }
    this.update = function() {
        if (a.ready()) {
            b.needsUpdate = true
        }
    }
});
Class(function MenuGLSceneParticleBehavior() {
    Inherit(this, Component);
    var f = this;
    var b = new Vector2();
    var a = new Vector3();
    var d = new ScreenProjection(MenuGLCamera.instance().worldCamera);
    var c = Math.pow(200, 2);

    function e(g) {
        g.speed = Utils.doRandom(100, 500) / 100;
        g.v2 = new Vector2().copy(g.pos);
        g.v2pos = new Vector2().copy(g.pos);
        g.origin = new Vector2().copy(g.pos);
        g.o = new Vector2().copy(g.pos);
        g.v3 = new Vector3();
        g.rangeX = Utils.doRandom(-50, 50);
        g.rangeY = Utils.doRandom(-50, 50);
        g.speedX = Utils.doRandom(10, 50) / 50000;
        g.speedY = Utils.doRandom(10, 50) / 50000
    }
    this.applyBehavior = function(j) {
        if (!j.speed) {
            e(j)
        }
        j.origin.x = j.o.x + Math.sin(Render.TIME * j.speedX) * j.rangeX;
        j.origin.y = j.o.y + Math.sin(Render.TIME * j.speedY) * j.rangeY;
        if (j.pos.z < -1500) {
            j.pos.z = 1500
        }
        j.v3.set(j.origin.x, j.origin.y, j.pos.z);
        var h = d.project(j.v3);
        b.subVectors(h, Mouse);
        var g = b.lengthSq();
        if (g < c) {
            var k = Math.atan2(b.y, b.x);
            j.v2.copy(j.origin).addAngleRadius(-k, Math.sqrt(c - g))
        } else {
            j.v2.copy(j.origin)
        }
        j.v2pos.interp(j.v2, 0.3, "easeOutQuad");
        j.v2pos.copyTo(j.pos)
    }
});
Class(function MenuGLSceneParticles() {
    Inherit(this, Component);
    var j = this;
    var h, a, m, k;
    var d, g;
    var e = 200;
    (function() {
        o();
        f();
        c();
        l()
    })();

    function o() {
        h = new THREE.BufferGeometry();
        var p = new Float32Array(e * 3);
        for (var q = 0; q < e; q++) {
            p[q * 3 + 0] = Utils.doRandom(-2000, 2000);
            p[q * 3 + 1] = Utils.doRandom(-2000, 2000);
            p[q * 3 + 2] = Utils.doRandom(-2000, 2000)
        }
        h.addAttribute("position", new THREE.BufferAttribute(p, 3))
    }

    function c() {
        k = j.initClass(ParticlePhysics);
        for (var q = 0; q < e; q++) {
            var r = j.initClass(Particle, new Vector3());
            n(r);
            k.addParticle(r)
        }
        d = j.initClass(MenuGLSceneParticleBehavior);
        k.addBehavior(d)
    }

    function n(q) {
        if (!g) {
            g = new Vector2()
        }
        var r = function() {
            q.pos.x = Utils.doRandom(-1500, 1500);
            q.pos.y = Utils.doRandom(-1500, 1500);
            q.pos.z = Utils.doRandom(-1500, 1500)
        };
        var s = function() {
            g.set(q.pos.x, q.pos.y);
            return g.length() < 500
        };
        r();
        if (Mobile.phone) {
            return
        }
        while (s()) {
            r()
        }
    }

    function f() {
        var p = new Shader("MenuParticles", "MenuParticles");
        p.uniforms = {
            size: {
                type: "f",
                value: 3
            }
        };
        p.material.transparent = true;
        p.material.depthWrite = false;
        m = new THREE.Points(h, p.material);
        j.mesh = m;
        m.frustumCulled = false;
        a = p
    }

    function l() {
        j.events.subscribe(MenuGL.TEST_END, b)
    }

    function b() {
        j.events.unsubscribe(MenuGL.TEST_END, b);
        defer(function() {
            if (MenuGL.DPI == 1) {
                a.set("size", 1.5)
            }
        })
    }
    this.update = function() {
        k.update();
        var q = 0;
        var r = k.particles;
        var s = r.start();
        while (s) {
            h.attributes.position.setXYZ(q, s.pos.x, s.pos.y, s.pos.z);
            s = r.next();
            q++
        }
        h.attributes.position.needsUpdate = true
    }
});
Class(function MenuGLSceneTerrain(b) {
    Inherit(this, Component);
    var d = this;
    var c;
    this.object3D = new THREE.Object3D();
    (function() {
        a()
    })();

    function a() {
        var e = new THREE.BufferGeometry().fromGeometry(Utils3D.loadGeometry("terrain"));
        delete Hydra.JSON.terrain;
        var f = new Shader("Terrain", "Terrain");
        f.uniforms = {
            logoPos: {
                type: "v3",
                value: b.position
            },
            brightness: {
                type: "f",
                value: 0.75
            }
        };
        c = f;
        var g = new THREE.Mesh(e, f.material);
        g.position.set(0, -560, -300);
        g.scale.set(2.5, 2.5, 2.5);
        d.object3D.add(g)
    }
    this.update = function() {
        c.set("brightness", Utils.range(MenuGL.BRIGHTNESS, 0, 1, 0.65, 1))
    }
});
Class(function MenuList() {
    Inherit(this, View);
    var h = this;
    var g, b, d;
    var f;
    (function() {
        c();
        a()
    })();

    function c() {
        g = h.element;
        g.size("100%").setZ(10);
        if (!Device.mobile) {
            b = g.create(".bg");
            b.size("100%").bg("#000").css({
                opacity: 0
            })
        }
        d = g.create(".wrapper");
        d.size("100%")
    }

    function a() {
        var l = ["HOME", "WORK", "LAB", "ABOUT"];
        f = [];
        for (var j = 0; j < l.length; j++) {
            var k = h.initClass(MenuListItem, l[j], null);
            k.size = 40;
            d.add(k);
            f.push(k);
            k.events.add(HydraEvents.CLICK, e)
        }
    }

    function e(j) {
        Container.instance().page(j.target.page)
    }
    this.render = function() {};
    this.resize = function() {
        var k = Utils.convertRange(Stage.height, 400, 1000, 50, 80);
        k = Utils.clamp(k, 50, 80);
        for (var j = 0; j < f.length; j++) {
            f[j].size = k;
            f[j].css({
                top: j * k,
                height: k
            })
        }
        d.css({
            height: f.length * k,
            top: "50%",
            marginTop: -(f.length * k) / 2
        });
        if (Mobile.phone) {
            g.size(1000, f.length * k)
        }
    };
    this.animateIn = function() {
        b && b.css({
            opacity: 0
        }).tween({
            opacity: 0.5
        }, 500, "easeOutSine");
        for (var j = 0; j < f.length; j++) {
            f[j].transform({
                y: 15
            }).css({
                opacity: 0
            }).tween({
                y: 0,
                opacity: 1
            }, 600, "easeOutQuart", j * 100 + 300)
        }
    };
    this.animateOut = function() {
        b && b.tween({
            opacity: 0
        }, 500, "easeOutSine");
        for (var j = 0; j < f.length; j++) {
            f[j].tween({
                y: 5,
                opacity: 0
            }, 300, "easeOutCubic", (j * 50))
        }
    }
});
Class(function MenuListItem(l) {
    Inherit(this, View);
    var g = this;
    var j, a, k, e;
    this.page = l.toLowerCase();
    (function() {
        c();
        d();
        b();
        h()
    })();

    function c() {
        j = g.element;
        j.size("100%", g.size).css({
            overflow: "hidden"
        })
    }

    function d() {
        a = j.create(".bg");
        a.size("100%").bg("#fff").css({
            top: "100%",
            marginTop: 1
        })
    }

    function b() {
        k = j.create(".text");
        k.fontStyle("OpenSans", 13, "#fff");
        k.css({
            width: "100%",
            letterSpacing: 5,
            top: "50%",
            marginTop: -8,
            textAlign: "center"
        });
        k.text(l);
        e = j.create(".over");
        e.fontStyle("OpenSans", 13, "#2C2D37");
        e.css({
            width: "100%",
            letterSpacing: 5,
            top: "50%",
            marginTop: -8,
            textAlign: "center",
            opacity: 0
        });
        e.text(l)
    }

    function h() {
        j.interact(f, m)
    }

    function f(o) {
        var n = o.movementY > 0 ? -1 : 1;
        switch (o.action) {
            case "over":
                a.transform({
                    y: 0
                }).tween({
                    y: -g.size + 2
                }, 500, "easeOutExpo");
                k.tween({
                    y: -10 * n,
                    opacity: 0
                }, 500, "easeOutExpo");
                e.transform({
                    y: 10 * n
                }).tween({
                    y: 0,
                    opacity: 1
                }, 500, "easeOutExpo");
                break;
            case "out":
                if (g.active("preventOut")) {
                    return
                }
                a.tween({
                    y: 0
                }, 300, "easeOutExpo");
                k.tween({
                    y: 0,
                    opacity: 1
                }, 300, "easeOutExpo");
                e.tween({
                    y: 10 * n,
                    opacity: 0
                }, 300, "easeOutExpo");
                break
        }
    }

    function m() {
        if (Device.mobile) {
            g.active("preventOut", true);
            g.delayedCall(function() {
                g.active("preventOut", false);
                f({
                    action: "out"
                })
            }, 1000)
        }
        g.events.fire(HydraEvents.CLICK)
    }
    this.animateIn = function() {}
});
Class(function MenuShare() {
    Inherit(this, View);
    var h = this;
    var f;
    var g;
    (function() {
        d();
        a();
        c()
    })();

    function d() {
        f = h.element;
        f.size(80, 20).css({
            left: Config.UI_OFFSET + 5,
            bottom: Config.UI_OFFSET + 5
        }).setZ(100).invisible()
    }

    function a() {
        g = ["tw", "fb"];
        h.icons = [];
        for (var k = 0; k < g.length; k++) {
            var j = f.create(".icon");
            j.size(20, 20).css({
                right: 45 * k,
                top: 0,
                opacity: 0.5
            }).bg("assets/images/common/" + g[k] + ".png");
            j.type = g[k];
            h.icons.push(j)
        }
    }

    function c() {
        for (var j = 0; j < h.icons.length; j++) {
            h.icons[j].interact(b, e);
            h.icons[j].hit.size(60, 60).center()
        }
    }

    function b(j) {
        switch (j.action) {
            case "over":
                j.object.tween({
                    opacity: 0.8
                }, 150, "easeOutSine");
                break;
            case "out":
                j.object.tween({
                    opacity: 0.5
                }, 300, "easeOutSine");
                break
        }
    }

    function e(k) {
        for (var j = 0; j < h.icons.length; j++) {
            if (k.object === h.icons[j]) {
                if (h.icons[j].type === "fb") {
                    getURL("https://www.facebook.com/ActiveTheory/", "_blank")
                } else {
                    getURL("https://twitter.com/active_theory", "_blank")
                }
            }
        }
    }
    this.animateIn = function() {
        f.visible().css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 500, "easeOutSine")
    };
    this.animateOut = function() {
        f.tween({
            opacity: 0
        }, 500, "easeOutSine")
    }
});
Class(function Refraction() {
    Inherit(this, View);
    var h = this;
    var f;
    var b, e, g;
    (function() {
        d();
        c();
        Render.start(a)
    })();

    function d() {
        f = h.element;
        f.size("100%")
    }

    function c() {
        b = new THREE.Scene();
        e = new THREE.WebGLRenderer();
        e.setPixelRatio(Device.pixelRatio);
        e.setSize(Stage.width, Stage.height);
        g = new THREE.PerspectiveCamera(60, Stage.width / Stage.height, 10, 10000);
        g.position.z = 1400;
        g.controls = new THREE.TrackballControls(g);
        b.add(new THREE.AmbientLight(16777215));
        var k = new Shader("Refraction", "Refraction");
        k.uniforms = {
            reflectivity: {
                type: "f",
                value: 1
            },
            refractionRatio: {
                type: "f",
                value: 0.98
            },
            envMap: {
                type: "t",
                value: Utils3D.getCubemap("assets/images/temp/bg.jpg")
            },
        };
        var j = new THREE.CubeGeometry(500, 500, 500);
        var l = new THREE.Mesh(j, k.material);
        h.delayedCall(function() {}, 400);
        b.add(l);
        f.add(e.domElement)
    }

    function a() {
        g.controls.update();
        e.render(b, g)
    }
});
Module(function TransitionMaskConfig() {
    this.exports = [
        [{
            x: 0,
            y: 0
        }, {
            x: 0.5,
            y: 0
        }, {
            x: 0,
            y: 1
        }],
        [{
            x: 0.49,
            y: 0
        }, {
            x: 1.01,
            y: 0
        }, {
            x: 0.51,
            y: 1
        }, {
            x: 0,
            y: 1
        }],
        [{
            x: 1,
            y: 0
        }, {
            x: 1,
            y: 1
        }, {
            x: 0.5,
            y: 1
        }]
    ]
});
Class(function TransitionView() {
    Inherit(this, Component);
    var h = this;
    var l, b, m, j;
    var f = "out";
    var a = "#fff";
    (function() {
        o();
        n();
        g();
        d();
        k();
        if (Global.PLAYGROUND) {
            Render.start(e)
        }
    })();

    function o() {
        l = h.initClass(Canvas, Stage.width, Stage.height);
        h.element = l.object
    }

    function n() {
        b = [];
        require("TransitionMaskConfig").forEach(function(q) {
            var p = h.initClass(CanvasGraphics);
            p.fillStyle = "#fff";
            p.config = q;
            p.beginPath();
            p.moveTo(q[0].x * l.width, q[0].y * l.height);
            for (var r = 1; r < q.length; r++) {
                p.lineTo(q[r].x * l.width, q[r].y * l.height)
            }
            p.fill();
            l.add(p);
            b.push(p)
        })
    }

    function g() {
        m = [];
        for (var s = 0; s < 3; s++) {
            var r = b[s];
            var t = h.initClass(CanvasGraphics);
            t.fillRect(0, 0, l.width, l.height);
            l.add(t);
            r.mask(t);
            m.push(t);
            t.s = 0
        }
        var q = m[0];
        var p = m[1];
        var u = m[2];
        q.y = -Stage.height;
        p.y = Stage.height;
        u.y = -Stage.height
    }

    function d() {
        j = h.initClass(THREE.Texture, l.div);
        j.minFilter = THREE.LinearFilter;
        TransitionView.TEXTURE = j
    }

    function e() {
        for (var p = 0; p < 3; p++) {
            var q = m[p];
            if (MenuGL.USE_TEXTURE && h.parent.menu) {
                q.fillStyle = "rgb(255, " + ~~((q.s * 127.5) + 127.5) + ", 255)"
            } else {
                q.fillStyle = a
            }
        }
        j.needsUpdate = true;
        l.render()
    }

    function k() {
        h.events.subscribe(HydraEvents.RESIZE, c)
    }

    function c() {
        l.size(Stage.width, Stage.height);
        b.forEach(function(s) {
            l.remove(s)
        });
        m.forEach(function(s) {
            l.remove(s)
        });
        n();
        g();
        var q = m[0];
        var p = m[1];
        var r = m[2];
        TweenManager.clearTween(q);
        TweenManager.clearTween(p);
        TweenManager.clearTween(r);
        if (f == "out") {
            q.y = -Stage.height;
            p.y = Stage.height;
            r.y = -Stage.height;
            q.s = -1;
            p.s = 1;
            r.s = -1
        } else {
            q.y = p.y = r.y = 0;
            q.s = p.s = r.s = 0
        }
        e()
    }
    this.animateIn = function(t) {
        var q = m[0];
        var p = m[1];
        var s = m[2];
        var r = h.parent.menu ? 400 : 300;
        TweenManager.tween(q, {
            y: 0,
            s: 0
        }, r, "easeOutCubic");
        TweenManager.tween(p, {
            y: 0,
            s: 0
        }, r, "easeOutQuint", 100);
        TweenManager.tween(s, {
            y: 0,
            s: 0
        }, r, "easeOutQuart", 200, t);
        f = "in"
    };
    this.animateOut = function(t) {
        var q = m[0];
        var p = m[1];
        var s = m[2];
        var r = h.parent.menu ? 400 : 300;
        TweenManager.tween(q, {
            y: Stage.height,
            s: -1
        }, r, "easeInOutCubic");
        TweenManager.tween(p, {
            y: -Stage.height,
            s: 1
        }, r, "easeInOutQuint");
        TweenManager.tween(s, {
            y: Stage.height,
            s: -1
        }, r, "easeInOutQuart", t);
        f = "out"
    };
    this.position = function(s) {
        var r = m[0];
        var q = m[1];
        var t = m[2];
        if (s == 1) {
            r.y = q.y = t.y = 0
        } else {
            r.y = -Stage.height;
            q.y = Stage.height;
            t.y = -Stage.height
        }
    };
    this.start = function() {
        Render.start(e)
    };
    this.stop = function() {
        Render.stop(e)
    }
});
Class(function WorkAnimator() {
    Inherit(this, Component);
    var p = this;
    var o;
    var n, b, g, a, q;
    var d = require("WorkAnimatorConfig");
    var h = {};
    var t = {};
    var f = 0;
    var r = 800;
    var e = "wipe";
    (function() {
        m()
    })();

    function j(w) {
        var x = ["logo", "awards", "client", "project", "headingoverview", "textoverview", "headingtech", "texttech"];
        x.forEach(function(y) {
            var z = h[y];
            if (!z) {
                return
            }
            z.y = 120 * w;
            z.transform();
            z.css({
                opacity: 0
            })
        });
        var v = h.bg;
        if (Hardware.ANIMATE_BG) {
            v && v.clearTransform().transform({
                z: -400
            })
        }
        if (Mobile.tablet && WorkNav.OPEN && !Hardware.SIMPLE_OPEN && Hardware.ANIMATE_BG) {
            o.transform({
                x: -100
            })
        }
    }

    function u(z, y, A, B) {
        if (!h) {
            return
        }
        var x = y.strpos("in") ? 250 : 0;
        z.forEach(function(D, C) {
            h[D.name] && h[D.name].stopTween().tween({
                y: A.y,
                opacity: A.opacity
            }, r, e, D.delay + x)
        });
        if (Hardware.ANIMATE_BG) {
            var w = h.bg;
            if (y.strpos("in")) {
                w.css({
                    opacity: 1
                }).tween({
                    z: 0
                }, r, e)
            } else {
                if (y.strpos("up")) {
                    var v = w.tween({
                        y: Stage.height * 0.35,
                        z: -200
                    }, r, e, l);
                    v.special = true
                } else {
                    w.tween({
                        y: -Stage.height * 0.35,
                        z: -200
                    }, r, e, l)
                }
            }
        }
        p.delayedCall(function() {
            a = false;
            if (B) {
                B()
            }
        }, r + 500)
    }

    function l() {
        p.delayedCall(function() {
            if (!h || !h.bg) {
                return
            }
            h.bg.z = -400;
            h.bg.clearTransform().transform()
        }, 250)
    }

    function s(v, w) {
        v.startRender();
        v.tween(1, v.calculateRemainingTime(), "linear", 0, w)
    }

    function k() {
        if (q) {
            return
        }
        h.bg.rotationX = 0;
        h.bg.stopTween().transform();
        b = true
    }

    function m() {
        p.events.subscribe(WorkNavOpenMechanic.OPEN, c)
    }

    function c(v) {
        if (Hardware.SIMPLE_OPEN || Hardware.iOSCHROME) {
            return
        }
        if (v.type == "open") {
            o.tween({
                x: -80,
                rotationY: 8
            }, 500, "easeOutCubic")
        } else {
            o.tween({
                x: 0,
                rotationY: 0
            }, 500, "easeOutCubic")
        }
    }
    this.set("container", function(v) {
        o = v
    });
    this.register = function(w, v) {
        v = v || w.div.className;
        h[v] = w;
        w.willChange(true);
        w.transform({
            y: 10,
            z: 0
        }).tween({
            y: 0,
            opacity: 0
        }, 1, "easeOutCubic", function() {
            TweenManager.clearTween(w);
            if (v == "bg") {
                w.css({
                    opacity: 1
                });
                if (Hardware.ANIMATE_BG) {
                    w.transform({
                        z: -200,
                        rotationX: 0
                    })
                }
            }
        })
    };
    this.animateIn = function(v) {
        a = true;
        if (v == "down" && !WorkLayoutManager.OVERRIDE_ANIMATION) {
            j(-1);
            u(d.down, "in_down", {
                y: 0,
                opacity: 1
            }, k)
        } else {
            j(1);
            u(d.up, "in_up", {
                y: 0,
                opacity: 1
            }, k)
        }
    };
    this.animateOut = function(v) {
        a = true;
        q = true;
        if (v == "up") {
            u(d.up, "out_up", {
                y: -75,
                opacity: 0
            })
        } else {
            if (!Hardware.REDUCED_WORK) {
                u(d.down, "out_down", {
                    y: 75,
                    opacity: 0
                })
            }
        }
    };
    this.update = function(v) {
        if (v == 0) {
            g = false
        }
        if (!b || g || a || Hardware.REDUCED_WORK || h.bg._cssTween) {
            return g = true
        }
        var A = Device.mobile ? 0.4 : 1;
        for (var y in h) {
            var z = d.alpha[y];
            if (!z) {
                continue
            }
            var B = h[y];
            B.y = -750 * v * z * A;
            B.transform()
        }
        var w = h.bg;
        if (!w._cssTween && Hardware.ANIMATE_BG) {
            w.y = (Stage.height * 0.35) * v * A;
            w.rotationX = v * (Device.mobile ? 30 : 60) * A;
            if (!Hardware.SIMPLE_OPEN) {
                w.transform()
            }
        }
        var x = WorkNavOpenMechanic.AMOUNT || 0;
        x = Utils.clamp(x, 0, 1);
        if (!o._cssTween && !WorkNavOpenMechanic.TRANSITION) {
            o.x = -100 * x;
            if (!Hardware.SIMPLE_OPEN) {
                o.transform()
            }
        }
    };
    this.onDestroy = function() {
        h = null
    }
});
Module(function WorkAnimatorConfig() {
    this.exports = {
        up: [{
            name: "logo",
            delay: 0
        }, {
            name: "awards",
            delay: 0
        }, {
            name: "client",
            delay: 40
        }, {
            name: "project",
            delay: 80
        }, {
            name: "link",
            delay: 110
        }, {
            name: "casestudy",
            delay: 140
        }, {
            name: "headingoverview",
            delay: 120
        }, {
            name: "textoverview",
            delay: 140
        }, {
            name: "headingtech",
            delay: 160
        }, {
            name: "texttech",
            delay: 180
        }, ],
        down: [{
            name: "logo",
            delay: 120
        }, {
            name: "awards",
            delay: 0
        }, {
            name: "client",
            delay: 100
        }, {
            name: "project",
            delay: 80
        }, {
            name: "link",
            delay: 70
        }, {
            name: "casestudy",
            delay: 50
        }, {
            name: "headingoverview",
            delay: 0
        }, {
            name: "textoverview",
            delay: 20
        }, {
            name: "headingtech",
            delay: 40
        }, {
            name: "texttech",
            delay: 60
        }, ],
        alpha: {
            awards: 1,
            logo: 1,
            client: 0.95,
            project: 0.9,
            headingoverview: 0.85,
            textoverview: 0.85,
            headingtech: 0.85,
            texttech: 0.85
        }
    }
});
Class(function WorkAwards(a) {
    Inherit(this, View);
    var e = this;
    var f, g, c;
    var j;
    (function() {
        b();
        h();
        d()
    })();

    function b() {
        f = e.element;
        f.size(200, 300).css({
            top: Config.UI_OFFSET,
            right: Config.UI_OFFSET
        });
        WorkLayout.ANIMATOR.register(f, "awards")
    }

    function h() {
        c = f.create("heading");
        c.fontStyle("OpenSansBold", 9, "#fff");
        c.css({
            letterSpacing: 4,
            right: -45,
            top: 42,
            width: 100,
            height: 15,
            textAlign: "right"
        });
        c.transform({
            rotation: -90
        });
        c.text("AWARDS")
    }

    function d() {
        g = f.create(".awards");
        g.size("100%");
        if (Mobile.phone) {
            g.transformPoint("100%", "0%").transform({
                scale: 0.8
            })
        }
        var k = a.awards;
        var o = [];
        var n = k[0].image == "fwa" ? -15 : -5;
        for (var l in k) {
            if (!k[l].image) {
                continue
            }
            var m = e.initClass(WorkAwardsItem, k[l], null);
            g.add(m);
            m.css({
                top: n,
                right: 25
            });
            n += 50;
            o.push(m)
        }
    }
    this.animateIn = function() {}
});
Class(function WorkAwardsItem(e) {
    Inherit(this, View);
    var h = this;
    var f, b, a;
    (function() {
        d();
        g();
        c()
    })();

    function d() {
        f = h.element;
        f.size("100%", 50)
    }

    function g() {
        a = f.create(".icon");
        a.size(50, 50).bg("assets/images/common/awards/" + e.image + ".png").css({
            right: 0
        })
    }

    function c() {
        b = f.create(".client");
        b.fontStyle("OpenSans", 12, "#fff");
        b.css({
            right: 60,
            top: 16
        });
        b.text(e.count)
    }
    this.animateIn = function() {}
});
Class(function WorkBG(l) {
    Inherit(this, View);
    var n = this;
    var e, d, r, b, g;
    var f;
    var a = Mobile.Accelerometer;
    var o = new DynamicObject({
        lerp: 0
    });
    (function() {
        k()
    })();

    function k() {
        e = n.element;
        e.size("100%").css({
            overflow: "hidden"
        }).bg("#000").setZ(0);
        b = e.create("bg");
        b.x = b.tx = 0;
        b.willChange(true);
        s();
        p(b);
        b.transform({
            perspective: 2000
        }).css({
            opacity: 0.75
        });
        c();
        WorkLayout.ANIMATOR.register(b)
    }

    function s() {
        r = b.create(".gradient");
        r.size(1000, 600).bg("assets/images/common/gradient.png").css({
            bottom: 0
        }).setZ(100).transform({
            scale: Device.mobile ? 1.1 : 1.3
        })
    }

    function c() {
        if (ATUtil.exists(l.asset_folder, "bg")) {
            b.bg("assets/projects/" + Data.getPage() + "/" + l.asset_folder + "/bg.jpg")
        } else {
            b.bg("assets/images/temp/bg.jpg")
        }
    }

    function m() {
        if (Device.mobile || Hardware.NO_VIDEO) {
            return
        }
        if (f) {
            f.object.show();
            f.play();
            n.events.fire(WorkBG.VIDEO_READY);
            g.show().css({
                opacity: 0
            }).tween({
                opacity: 1
            }, 500, "easeOutSine")
        } else {
            j()
        }
    }

    function j() {
        g = e.create(".video");
        g.size("100%").bg("#000").hide();
        var t = "mp4";
        f = n.initClass(Video, {
            src: Config.CDN + "assets/projects/" + Data.getPage() + "/" + l.asset_folder + "/video." + t,
            width: 1280,
            height: 720,
            loop: true,
            preload: false
        }, null);
        g.add(f);
        f.volume(0);
        f.play();
        f.object.css({
            opacity: 0.8
        });
        p();
        Render.start(h)
    }

    function h() {
        if (f.canPlayTo(9)) {
            g.show().css({
                opacity: 0
            }).tween({
                opacity: 1
            }, 500, "easeOutSine");
            Render.stop(h);
            n.events.fire(WorkBG.VIDEO_READY)
        }
    }

    function p() {
        var v = Stage.width;
        var u = v / (1920 / 1080);
        if (u < Stage.height) {
            u = Stage.height;
            v = u * (1920 / 1080)
        }
        v *= 1.1;
        u *= 1.1;
        var t = Stage.width / 2 - v / 2;
        var w = Stage.height / 2 - u / 2;
        b.size(v, u).css({
            left: t,
            top: w
        });
        r.css({
            left: -t,
            bottom: -w
        });
        if (f) {
            f.size(v, u);
            f.object.css({
                left: t,
                top: w
            })
        }
    }

    function q() {
        if (b._cssTween || WorkNav.OPEN || WorkInteraction.TOUCHING) {
            return
        }
        var t = (b.width - Stage.width) - Stage.width;
        if (!b.tx) {
            b.tx = 0
        }
        b.tx = Utils.range(a.x, -5, 5, -t, t, true) * (Mobile.os == "Android" ? -1 : 1);
        if (!b.sx) {
            b.sx = 0
        }
        b.sx += (b.tx - b.sx) * o.lerp;
        b.x += (b.sx - b.x) * 0.07;
        if (Stage.width > Stage.height) {
            b.x = 0
        }
        r.x = -b.x;
        r.transform();
        b.transform();
        a.lx = a.x
    }
    this.activate = function() {
        if (Device.mobile && !Hardware.PREVENT_TILT) {
            n.delayedCall(function() {
                Render.start(q);
                o.stopTween();
                o.lerp = 0;
                o.tween({
                    lerp: 0.025
                }, 1000, "easeInOutCubic")
            }, Mobile.os == "Android" ? 2000 : 1000)
        }
        if (ATUtil.exists(l.asset_folder, "video")) {
            if (!Hydra.LOCAL || Global.PLAYGROUND || Config.CDN != "") {
                n.delayedCall(m, 1000)
            }
        }
    };
    this.deactivate = function() {
        Render.stop(q);
        n.clearTimers();
        if (Device.mobile && !Hardware.PREVENT_TILT) {
            b.tx = b.x = 0;
            b.transform();
            r.x = -b.x;
            r.transform()
        }
        if (f) {
            f.stop();
            g.hide();
            f.seek(0)
        }
    };
    this.onDestroy = function() {
        Render.stop(h);
        Render.stop(q)
    };
    this.resize = function() {
        p()
    }
}, function() {
    WorkBG.VIDEO_READY = "work_bg_video_ready"
});
Class(function WorkInfo(d) {
    Inherit(this, View);
    var g = this;
    var j, h;
    var k;
    var a, b;
    (function() {
        f();
        e();
        if (d.details || d.tech) {
            c()
        }
    })();

    function f() {
        j = g.element;
        j.size(700, 500).css({
            height: "",
            bottom: Mobile.phone ? Config.UI_OFFSET : Config.UI_OFFSET - 5,
            left: Config.UI_OFFSET
        });
        if (Mobile.phone) {
            j.css({
                width: Stage.width - Config.UI_OFFSET * 2
            })
        }
        WorkLayout.ANIMATOR.container = j
    }

    function e() {
        k = g.initClass(WorkInfoMeta, d)
    }

    function c() {
        h = j.create(".sections");
        h.css({
            position: "relative",
            display: "block",
            marginTop: Mobile.phone ? 20 : 30
        });
        if (d.details) {
            a = g.initClass(WorkInfoSection, "overview", d.details, null);
            a.css({
                cssFloat: "left",
                styleFloat: "left"
            });
            h.add(a)
        }
        if (d.tech && !(Mobile.phone && d.details)) {
            b = g.initClass(WorkInfoSection, "tech", d.tech, null);
            h.add(b)
        }
        h.div.style.minHeight = a ? "80px" : "50px"
    }
});
Class(function WorkInfoMeta(b) {
    Inherit(this, View);
    var g = this;
    var l, c, m, h;
    var f, o;
    var k = -4;
    (function() {
        d();
        j();
        a();
        n();
        e()
    })();

    function d() {
        l = g.element;
        l.size("100%").css({
            height: "",
            position: "relative",
            display: "block"
        });
        if (Mobile.phone && (b.project_link || b.casestudy_link)) {
            l.css({
                marginBottom: 60
            })
        }
    }

    function j() {
        c = l.create(".logo");
        var p = Mobile.phone ? 0.8 : 1;
        if (b.client_logo == "ashworth") {
            p *= 1.5
        }
        c.size(140 * p, 40 * p).css({
            position: "relative",
            display: "block"
        });
        if (b.client_logo) {
            c.bg("assets/images/common/logos/" + b.client_logo + ".png");
            WorkLayout.ANIMATOR.register(c)
        }
    }

    function a() {
        m = l.create(".client");
        var p = Device.mobile ? 11 : 12;
        m.fontStyle("OpenSansBold", p, "#fff");
        m.css({
            letterSpacing: 1
        }).css({
            marginTop: Mobile.phone ? 20 : 35,
            lineHeight: p * 1.6,
            position: "relative",
            display: "block"
        });
        if (b && b.client) {
            m.text(b.client.toUpperCase()).transform({
                skewX: k
            })
        } else {
            if (b && b.tech_keyword && !Mobile.phone) {
                m.text(b.tech_keywords.toUpperCase()).transform({
                    skewX: k
                })
            }
        }
        WorkLayout.ANIMATOR.register(m)
    }

    function n() {
        var p = Mobile.phone ? 25 : 40;
        h = l.create(".project");
        h.css({
            marginTop: Mobile.phone ? 3 : 1,
            position: "relative",
            lineHeight: p * 1.1,
            display: "block"
        });
        WorkLayout.ANIMATOR.register(h);
        h.inner = h.create(".inner");
        h.inner.fontStyle("OpenSansBold", p, "#fff");
        h.inner.css({
            position: "relative",
            display: "block"
        });
        if (b && b.title) {
            h.inner.text(b.title.toUpperCase()).transform({
                skewX: k
            })
        }
    }

    function e() {
        if (b.project_link) {
            f = g.initClass(WorkInfoMetaButton, {
                text: "Visit",
                width: 74,
                url: b.project_link
            }, [h]);
            WorkLayout.ANIMATOR.register(f.element, "link")
        }
        if (b.casestudy_link) {
            o = g.initClass(WorkInfoMetaButton, {
                text: "Case Study",
                width: 120,
                url: b.casestudy_link
            }, [h]);
            WorkLayout.ANIMATOR.register(o.element, "casestudy")
        }
        if (Mobile.phone) {
            if (f) {
                h.add(f)
            }
            if (o) {
                h.add(o)
            }
        }
        defer(function() {
            var p = CSS.textSize(h);
            h.width = p.width;
            m.css({
                width: h.width + 10
            });
            var q = Mobile.phone ? 0 : h.width + 30;
            if (f) {
                f.element.css({
                    left: q,
                    bottom: Mobile.phone ? -47 : 3
                })
            }
            if (o) {
                o.element.css({
                    left: q + (f ? 85 : 0),
                    bottom: Mobile.phone ? -47 : 3
                })
            }
        })
    }
});
Class(function WorkInfoMetaButton(d) {
    Inherit(this, View);
    var g = this;
    var l, e, h, m, a, n, o;
    g.border = 2;
    g.height = Mobile.phone ? 34 : 40;
    g.width = d.width;
    var k = -4;
    (function() {
        c();
        b();
        j()
    })();

    function c() {
        l = g.element;
        l.size(g.width, g.height).transform({
            z: 1,
            skewX: k
        });
        e = l.create(".shadow");
        e.size("100%").css({
            boxShadow: "0 0 40px #fff",
            opacity: 0
        });
        h = l.create(".wrapper");
        h.size("100%").css({
            overflow: "hidden",
            opacity: 1
        });
        var r = h.create(".border");
        r.size(g.width - 4, g.height - 4).css({
            border: "2px solid #fff"
        });
        a = h.create(".bg");
        a.css({
            width: "70%",
            height: "100%",
            left: "-20%",
            marginLeft: 3
        }).bg("#fff").transform({
            y: -g.height - 1,
            skewX: -30,
            x: 25
        });
        n = h.create(".bg");
        n.css({
            width: "70%",
            height: "100%",
            right: "-20%",
            marginLeft: -3
        }).bg("#fff").transform({
            y: g.height + 1,
            skewX: -30,
            x: -25
        })
    }

    function p() {
        g.lines = [];
        for (var r = 0; r < 4; r++) {
            var s = h.create(".line");
            s.css({
                overflow: "hidden"
            });
            switch (r) {
                case 0:
                    s.css({
                        width: "100%",
                        height: g.border,
                        top: 0,
                        left: 0
                    });
                    break;
                case 1:
                    s.css({
                        width: g.border,
                        height: "100%",
                        bottom: 0,
                        right: 0
                    });
                    break;
                case 2:
                    s.css({
                        width: "100%",
                        height: g.border,
                        bottom: 0,
                        right: 0
                    });
                    break;
                case 3:
                    s.css({
                        width: g.border,
                        height: "100%",
                        top: 0,
                        left: 0
                    });
                    break
            }
            s.inner = s.create(".line");
            s.inner.size("100%").bg("#fff");
            g.lines.push(s)
        }
    }

    function b() {
        m = h.create("tech-title");
        m.fontStyle("OpenSansBold", 10, "#fff");
        m.css({
            letterSpacing: 2,
            width: "100%",
            textAlign: "center",
            lineHeight: g.height,
            opacity: 1
        }).transform({
            skewX: -k
        });
        m.text(d.text.toUpperCase());
        o = h.create("tech-title");
        o.fontStyle("OpenSansBold", 10, "#222");
        o.css({
            letterSpacing: 2,
            width: "100%",
            textAlign: "center",
            lineHeight: g.height,
            opacity: 0
        }).transform({
            skewX: -k
        });
        o.text(d.text.toUpperCase())
    }

    function j() {
        l.interact(f, q)
    }

    function f(r) {
        switch (r.action) {
            case "over":
                e.tween({
                    opacity: 0.6
                }, 200, "easeOutSine");
                o.tween({
                    opacity: 1,
                    skewX: -k
                }, 300, "easeOutCubic");
                a.tween({
                    y: 0,
                    skewX: -32,
                    x: 0
                }, 250, "easeOutExpo");
                n.tween({
                    y: 0,
                    skewX: -32,
                    x: 0
                }, 250, "easeOutExpo");
                break;
            case "out":
                e.tween({
                    opacity: 0
                }, 200, "easeOutSine");
                o.tween({
                    opacity: 0,
                    skewX: -k
                }, 400, "easeOutCubic");
                a.tween({
                    y: -g.height - 1,
                    skewX: -32,
                    x: 25
                }, 400, "easeOutExpo");
                n.tween({
                    y: g.height + 1,
                    skewX: -32,
                    x: -25
                }, 400, "easeOutExpo");
                break
        }
    }

    function q() {
        GATracker.trackEvent("link", "outgoing", d.url);
        getURL(d.url, "_blank")
    }
    this.animateIn = function(r) {
        l.visible();
        m.tween({
            opacity: 1
        }, 500, "easeOutSine")
    };
    this.reset = function() {
        l.invisible()
    }
});
Class(function WorkInfoSection(d, k) {
    Inherit(this, View);
    var f = this;
    var g, e, j;
    (function() {
        c();
        h();
        b()
    })();

    function c() {
        g = f.element;
        g.size(320, 200).css({
            height: "",
            display: "inline-block",
            position: "relative"
        })
    }

    function h() {
        e = g.create("heading" + d);
        e.fontStyle("OpenSansBold", Mobile.phone ? 8 : 9, "#fff");
        e.css({
            letterSpacing: Mobile.phone ? 2 : 3,
            left: -45,
            top: 47,
            width: 100,
            height: 15,
            textAlign: "right"
        });
        e.transform({
            rotation: -90
        });
        e.text(d.toUpperCase());
        WorkLayout.ANIMATOR.register(e)
    }

    function b() {
        j = g.create("text" + d);
        j.fontStyle("OpenSans", Mobile.phone ? 9 : 11, "#eee");
        j.css({
            width: 260,
            lineHeight: Mobile.phone ? 16 : 19,
            position: "relative",
            display: "block",
            left: Mobile.phone ? 16 : 22,
            letterSpacing: 0.8
        });
        j.text(k);
        WorkLayout.ANIMATOR.register(j)
    }

    function a() {
        var l = d == "tech" ? _data.tech : _data.details;
        if (!l || !l.length) {
            return Config.DEFAULT_COPY
        }
        return l
    }
    this.animateIn = function() {}
});
Class(function WorkLayout(b) {
    Inherit(this, View);
    var g = this;
    var j, l, d, c;
    var m, h, a, e;
    this.data = b;
    (function() {
        f();
        k()
    })();

    function f() {
        j = g.element;
        j.size("100%").bg("#000").willChange(true)
    }

    function k() {
        e = g.initClass(WorkAnimator);
        WorkLayout.ANIMATOR = e;
        g.animator = e;
        a = g.initClass(WorkBG, b);
        if (b && b.awards.length > 0) {
            h = g.initClass(WorkAwards, b)
        }
        m = g.initClass(WorkInfo, b)
    }
    this.update = function() {};
    this.resize = function() {
        a.resize()
    };
    this.activate = function() {
        a.activate()
    };
    this.deactivate = function() {
        a.deactivate()
    }
});
Class(function WorkLayoutOpenMechanic(d) {
    Inherit(this, Component);
    var e = this;
    (function() {
        d.perspective = 2000;
        b();
        Render.start(a)
    })();

    function b() {
        e.events.subscribe(WorkNavOpenMechanic.OPEN, c)
    }

    function c(f) {
        e.animating = true;
        e.delayedCall(function() {
            e.animating = false
        }, 600);
        if (f.type == "open") {
            d.tween({
                x: -120,
                rotationY: Hardware.ANIMATE_BG && Mobile.os != "iOS" ? 10 : 0
            }, 500, "easeOutCubic")
        } else {
            d.tween({
                x: 0,
                rotationY: 0
            }, 500, "easeOutCubic")
        }
    }

    function a() {
        if (d._cssTween && Hardware.ANIMATE_BG) {
            return
        }
        var f = WorkNavOpenMechanic.AMOUNT || 0;
        f = Utils.clamp(f, 0, 1);
        if (!WorkNav.OPEN && !WorkNavOpenMechanic.TRANSITION) {
            d.x = -120 * f;
            if (!Hardware.SIMPLE_OPEN && Hardware.ANIMATE_BG && Mobile.os == "iOS") {
                d.rotationY = 10 * f
            }
            if (!d._cssTween) {
                d.transform()
            }
        }
    }
    this.onDestroy = function() {
        Render.stop(a)
    }
});
Class(function WorkNavInteraction(b) {
    Inherit(this, Component);
    var c = this;
    var k;
    var h = new Vector2();
    (function() {
        if (Device.mobile) {
            e()
        } else {
            d()
        }
    })();

    function e() {
        k = c.initClass(Interaction.Input, b.element);
        k.onStart = a;
        k.onUpdate = f;
        k.onEnd = j
    }

    function d() {
        ScrollUtil.link(g)
    }

    function a(l) {
        if (!WorkNav.OPEN) {
            return
        }
        TweenManager.clearTween(b);
        h.y = b.y
    }

    function f(m, l) {
        if (!WorkNav.OPEN) {
            return
        }
        b.y = h.y + m.y
    }

    function j(n) {
        if (!WorkNav.OPEN) {
            return
        }
        var l = k.velocity.y;
        var m = Utils.range(Math.abs(l), 0, 10, 500, 700);
        if (Math.abs(l) < 0.2) {
            return
        }
        TweenManager.tween(b, {
            y: b.y + (200 * l)
        }, m, "easeOutCubic")
    }

    function g(m) {
        if (!WorkNav.OPEN) {
            return
        }
        var l = 100;
        var n = Utils.clamp(m.y, -l, l);
        b.y += -n * 1.2
    }
    this.onDestroy = function() {
        ScrollUtil.unlink(g)
    }
});
Class(function WorkNavOpenMechanic(n) {
    Inherit(this, Component);
    var t = this;
    var e, f, v, m;
    var j = n.x;
    var b = new Vector2();
    var c = new Vector2();
    (function() {
        defer(g);
        if (Device.mobile) {
            d()
        }
        q();
        Render.start(x)
    })();

    function g() {
        if (Hardware.BASIC_NAV) {
            return
        }
        n.scroll.perspective = 2000;
        n.scroll.x = -150;
        n.scroll.transformPoint(0, 0)
    }

    function d() {
        if (Hardware.BASIC_NAV) {
            n.touchSwipe(l)
        } else {
            f = t.initClass(Interaction.Drawer, n, {
                x: Mobile.phone ? -Stage.width : -Config.UI_NAV_WIDTH
            });
            f.friction = Mobile.phone ? 0 : 0.05;
            f.prevent = {
                axis: "y",
                pixels: 5
            };
            f.onStart = s;
            f.onEnd = h;
            if (Mobile.os == "Android" && Device.tablet) {
                f.toggle();
                t.delayedCall(f.toggle, 150)
            }
            if (Hardware.REDUCED_CLOSE) {
                n.touchSwipe(p)
            }
        }
    }

    function o() {
        if (WorkLayoutManager.TRANSITION || WorkNavOpenMechanic.PREVENT_OPEN) {
            return
        }
        WorkNav.OPEN = true;
        WorkNavOpenMechanic.TRANSITION = true;
        t.events.fire(WorkNavOpenMechanic.OPEN, {
            type: "open"
        });
        ScrollUtil.unblock();
        if (!Device.mobile) {
            n.scroll.tween({
                x: 0
            }, 500, "wipe");
            n.tween({
                x: 0
            }, 500, "wipe", function() {
                t.delayedCall(function() {
                    WorkNavOpenMechanic.TRANSITION = false
                }, 150)
            })
        } else {
            n.tween({
                x: -n.width
            }, 500, "wipe", function() {
                WorkNavOpenMechanic.TRANSITION = false
            })
        }
    }

    function y(A, z) {
        WorkNavOpenMechanic.PREVENT_OPEN = true;
        m = false;
        e = false;
        WorkNav.OPEN = false;
        WorkNavOpenMechanic.TRANSITION = true;
        t.events.fire(WorkNavOpenMechanic.OPEN, {
            type: "false"
        });
        if (!Device.mobile) {
            n.scroll.tween({
                x: -150
            }, 500, "wipe");
            n.tween({
                x: n.width
            }, 500, "wipe", function() {
                WorkNavOpenMechanic.TRANSITION = false;
                WorkNavOpenMechanic.PREVENT_OPEN = false
            })
        } else {
            if (!z) {
                n.tween({
                    x: 0
                }, 500, "wipe", function() {
                    WorkNavOpenMechanic.TRANSITION = false;
                    WorkNavOpenMechanic.PREVENT_OPEN = false
                })
            } else {
                n.stopTween().transform({
                    x: 0
                });
                WorkNavOpenMechanic.TRANSITION = false;
                WorkNavOpenMechanic.PREVENT_OPEN = false
            }
        }
    }

    function x() {
        if (Hardware.BASIC_NAV) {
            return
        }
        if (!Device.mobile) {
            if (!WorkNav.OPEN && !WorkNavOpenMechanic.TRANSITION) {
                n.x += (j - n.x) * 0.1;
                var A = n.x / n.width;
                WorkNavOpenMechanic.AMOUNT = 1 - A;
                if (A < 1 && !m) {}
                n.scroll.x = -150 * A;
                n.scroll.transform();
                n.transform()
            }
        } else {
            var B = f.getElapsed();
            WorkNav.OPEN = B > 0.95;
            WorkNavOpenMechanic.DRAGGING = f.dragging || B > 0;
            var z = Utils.range(B, 0, 0.5, 1, 0);
            z = Utils.clamp(z, 0, 1);
            n.scroll.x = -60 * z;
            n.scroll.transform();
            WorkNavOpenMechanic.AMOUNT = Math.abs(n.x / n.width);
            if (WorkNavOpenMechanic.AMOUNT > 0 && !m) {
                Dispatch.find(WorkNavList, "forceRender")();
                m = true
            } else {
                if (WorkNavOpenMechanic.AMOUNT == 0) {
                    m = false
                }
            }
            f.enabled = !WorkLayoutManager.TRANSITION;
            if (B > 0.5 && !v) {
                v = true;
                t.events.fire(WorkNavOpenMechanic.MOBILE_OPEN, {
                    type: "open"
                })
            }
            if (B < 0.5 && v) {
                v = false;
                t.events.fire(WorkNavOpenMechanic.MOBILE_OPEN, {
                    type: "false"
                })
            }
            if (Mobile.os == "Android" && Hardware.REDUCED_WORK && Mobile.phone && WorkNavOpenMechanic.AMOUNT > 0.99) {
                f.enabled = false
            }
        }
    }

    function q() {
        if (!Device.mobile) {
            t.delayedCall(function() {
                Stage.bind("touchmove", w);
                Stage.bind("click", r)
            }, 1000)
        } else {
            Stage.bind("touchend", k)
        }
        t.events.subscribe(WorkLayoutManager.CHANGE, a);
        t.events.subscribe(WorkNavOuterUI.CLICK, u)
    }

    function a(z) {
        if (Mobile.phone && z.type == "manual") {
            if (f) {
                if (!Hardware.REDUCED_WORK) {
                    t.delayedCall(function() {
                        f.easeTime = 600;
                        f.ease = "easeInOutCubic";
                        f.toggle();
                        f.ease = "easeOutCubic";
                        f.easeTime = 500
                    }, 300)
                } else {
                    WorkNavOpenMechanic.FORCE_RENDER = true;
                    f.enabled = false;
                    n.tween({
                        x: 0
                    }, 500, "easeOutCubic", 250, function() {
                        WorkNavOpenMechanic.FORCE_RENDER = false;
                        f.enabled = true
                    })
                }
            } else {
                if (WorkNav.OPEN) {
                    if (Hardware.BASIC_NAV) {
                        t.delayedCall(y, 1000)
                    } else {
                        y()
                    }
                }
            }
        } else {
            if (Mobile.tablet) {
                return
            }
            if (WorkNav.OPEN) {
                WorkNavOpenMechanic.AUTO_TRIGGER = true;
                t.delayedCall(y, 75, true)
            }
        }
    }

    function u() {
        if (WorkLayoutManager.TRANSITION) {
            return
        }
        if (f) {
            f.ease = "easeInOutCubic";
            f.easeTime = 600;
            f.toggle();
            f.ease = "easeOutCubic";
            f.easeTime = 500
        } else {
            if (!WorkNav.OPEN) {
                o()
            }
        }
    }

    function w() {
        var z = 0;
        b.subVectors(Mouse, c);
        c.copy(Mouse);
        b.value = b.length();
        if (!WorkNav.OPEN) {
            if (Mouse.y > 100 && Mouse.y < Stage.height - 100) {
                if (!WorkNavOpenMechanic.AUTO_TRIGGER) {
                    if (Mouse.x > Stage.width * 0.8) {
                        e = true;
                        z = Utils.range(Mouse.x, Stage.width * 0.8, Stage.width, 0, 0.2);
                        if (b.value > 8 || WorkLayoutManager.TRANSITION) {
                            z = 0
                        }
                        if (Mouse.x > Stage.width - 100) {
                            o()
                        }
                    } else {
                        e = false
                    }
                }
            }
            if (Mouse.x < Stage.width * 0.8 || b.x > 0) {
                WorkNavOpenMechanic.AUTO_TRIGGER = false
            }
        } else {
            if (Mouse.x < Stage.width - 770) {
                y()
            }
        }
        j = n.width - (n.width * z);
        if (j < 3) {
            j = 0
        }
    }

    function r(z) {
        if (WorkLayoutManager.TRANSITION || z.target.className == "hit") {
            return
        }
        if (e && !WorkNav.OPEN) {
            o()
        }
        if (Mouse.x < Stage.width - n.width && WorkNav.OPEN) {
            y()
        }
    }

    function k(z) {
        if (WorkLayoutManager.TRANSITION || z.target.className == "hit") {
            return
        }
        if (WorkNav.OPEN && z.x < Stage.width - n.width) {
            if (f) {
                t.events.fire(WorkNavOpenMechanic.TOUCH_CLOSE);
                f.ease = "easeInOutCubic";
                f.easeTime = 600;
                f.toggle();
                Dispatch.find(Filter, "forceClose")();
                f.ease = "easeOutCubic";
                f.easeTime = 500
            } else {
                y()
            }
        }
    }

    function s() {
        f.dragging = true
    }

    function h() {
        f.dragging = false
    }

    function l(z) {
        if (!WorkNav.OPEN && z.direction == "left") {
            o()
        }
        if (WorkNav.OPEN && z.direction == "right") {
            y()
        }
    }

    function p(z) {
        if (z.direction == "right") {
            WorkNavOpenMechanic.FORCE_RENDER = true;
            WorkNavOpenMechanic.AMOUNT = 0;
            nextFrame(function() {
                n.tween({
                    x: 0
                }, 500, "easeOutCubic", function() {
                    WorkNavOpenMechanic.FORCE_RENDER = false;
                    f.enabled = true
                })
            })
        }
    }
    this.resize = function() {
        WorkNavOpenMechanic.PREVENT_OPEN = false;
        if (Device.mobile) {
            if (f) {
                if (f.getElapsed() > 0.5) {
                    f.toggle()
                }
                f.directions = {
                    x: Mobile.phone || Hardware.FORCE_PHONE ? -Stage.width : -Config.UI_NAV_WIDTH
                }
            } else {
                y(false, true)
            }
            n.stopTween().css({
                right: Mobile.phone || Hardware.FORCE_PHONE ? -Stage.width : -Config.UI_NAV_WIDTH
            })
        }
        if (Hardware.BASIC_NAV) {
            WorkNavOpenMechanic.TRANSITION = false
        }
    };
    this.onDestroy = function() {
        Render.stop(x);
        Stage.unbind("touchmove", w);
        Stage.unbind("click", r);
        Stage.unbind("touchend", k);
        WorkNavOpenMechanic.TRANSITION = false;
        WorkNavOpenMechanic.DRAGGING = false;
        WorkNavOpenMechanic.AMOUNT = 0;
        WorkNavOpenMechanic.DRAGGING = false;
        WorkNavOpenMechanic.PREVENT_OPEN = false;
        WorkNavOpenMechanic.FORCE_RENDER = false;
        WorkNavOpenMechanic.AUTO_TRIGGER = false
    }
}, function() {
    WorkNavOpenMechanic.OPEN = "work_nav_mech_open";
    WorkNavOpenMechanic.MOBILE_OPEN = "work_nav_mech_mobile_open";
    WorkNavOpenMechanic.TOUCH_CLOSE = "work_nav_mech_touch_close";
    WorkNavOpenMechanic.TRANSITION = false;
    WorkNavOpenMechanic.DRAGGING = false
});
Class(function WorkNavList(k) {
    Inherit(this, View);
    var q = this;
    var j, g;
    var l;
    this.y = 0;
    this.alpha = Device.mobile ? 1 : 0.07;
    var c = false;
    var e = [];
    var m = 0;
    (function() {
        n();
        b();
        s();
        p();
        Render.start(t);
        Dispatch.register(q, "forceRender")
    })();

    function n() {
        j = q.element;
        j.size("100%").css({
            overflow: "hidden"
        });
        g = j.create("scroll");
        g.size("100%");
        g.y = 0;
        g.last = 0
    }

    function b() {
        var D = k.getAllData();
        var z = 0;
        var C = D.length < 11 ? 2 : 1;
        for (var y = 0; y < C; y++) {
            for (var A = 0; A < D.length; A++) {
                var B = q.initClass(WorkNavListItem, D[A], [g]);
                B.element.y = z * B.height;
                B.element.transform();
                B.absY = B.element.y;
                B.update();
                e.push(B);
                z++
            }
        }
        q.delayedCall(x, 500)
    }

    function x() {
        d(k.getCurrent().perma).activate();
        a({
            type: "auto"
        }, true);
        q.delayedCall(f, 250)
    }

    function s() {
        l = q.initClass(WorkNavListSort, e, j, g)
    }

    function w(z) {
        var y = e[e.length - 1];
        z.element.y = y.element.y + z.height;
        z.element.transform();
        e.shift();
        e.push(z)
    }

    function h(y) {
        var z = e[0];
        y.element.y = z.element.y - y.height;
        y.element.transform();
        e.pop();
        e.unshift(y)
    }

    function t() {
        if ((!WorkNav.OPEN || WorkNavOpenMechanic.TRANSITION) && !c && (Device.mobile && !Hardware.BASIC_NAV && WorkNavOpenMechanic.AMOUNT < 0.01)) {
            return
        }
        g.y += (q.y - g.y) * ScrollUtil.lerp;
        if (!c || c == 1) {
            g.transform()
        }
        m = g.y - g.last;
        g.last = g.y;
        for (var y = 0; y < e.length; y++) {
            var z = e[y];
            if (z.onScreen(g.y) || c == 1) {
                z.update()
            }
        }
        if (m > 0) {
            z = e[e.length - 1];
            if (z.absY > Stage.height + 200) {
                h(z)
            }
        } else {
            if (m < 0) {
                z = e[0];
                if (z.absY < -200) {
                    w(z)
                }
            }
        }
    }

    function d(y) {
        for (var z = 0; z < e.length; z++) {
            var A = e[z];
            if (A.data.perma == y) {
                return A
            }
        }
    }

    function f() {
        c = true;
        q.delayedCall(function() {
            c = false
        }, 250)
    }

    function p() {
        q.events.subscribe(WorkLayoutManager.CHANGE, a);
        q.events.subscribe(WorkNavOpenMechanic.OPEN, r);
        q.events.subscribe(WorkNavOpenMechanic.MOBILE_OPEN, v);
        q.events.subscribe(ATEvents.RESET_FILTERS, u)
    }

    function u() {
        q.delayedCall(f, 250)
    }

    function o(y) {
        e.forEach(function(z) {
            z.deactivate()
        });
        y.activate()
    }

    function a(C, D) {
        if (C.type != "auto") {
            return o(d(k.getCurrent().perma))
        }
        var z = function(E) {
            var G = g.y;
            var F = G + E.element.y;
            if (F < 0) {
                return false
            }
            if (F + E.height > Stage.height) {
                return false
            }
            return true
        };
        var B = k.getCurrent();
        var A = d(B.perma);
        if (!D) {
            o(A)
        }
        if (WorkNav.OPEN) {
            return
        }
        if (!z(A)) {
            var y = 10 * (A.absY < 0 ? -1 : 1);
            c = true;
            while (!z(A)) {
                q.y += y;
                t()
            }
            g.y = q.y;
            c = 1;
            t();
            q.delayedCall(function() {
                c = false
            }, 100)
        }
        if (k == Data.Lab) {
            e.forEach(function(E) {
                if (E.data.perma == B.perma && !E.enabled) {
                    E.activate()
                }
            })
        }
    }

    function v(y) {
        r(y)
    }

    function r(B) {
        if (B.type == "open") {
            var y = e.slice(0);
            t();
            y.sort(function(D, C) {
                if (D.absY < -160) {
                    D.absY = 999
                }
                if (C.absY < -160) {
                    C.absY = 999
                }
                return D.absY - C.absY
            });
            for (var z = 0; z < y.length; z++) {
                var A = y[z];
                A.animateIn(A.onScreen(g.y) ? z * 50 : 0)
            }
        } else {
            for (var z = 0; z < e.length; z++) {
                e[z].animateOut()
            }
            q.delayedCall(f, 500)
        }
    }
    this.resize = function() {
        for (var y = 0; y < e.length; y++) {
            e[y].resize()
        }
    };
    this.animateIn = function() {};
    this.animateOut = function() {};
    this.onDestroy = function() {
        Render.stop(t)
    };
    this.forceRender = function() {
        c = 1;
        q.delayedCall(function() {
            c = false
        }, 50)
    }
});
Class(function WorkNavListItem(j) {
    Inherit(this, View);
    var n = this;
    var c, e, p, f, d, b, m;
    var a, q;
    this.height = Config.UI_NAV_ITEM_HEIGHT;
    this.data = j;
    (function() {
        h();
        g();
        defer(k)
    })();

    function h() {
        c = n.element;
        if (Mobile.phone) {
            c.size(Stage.width, n.height)
        } else {
            c.size(Config.UI_NAV_WIDTH, n.height)
        }
        c.css({
            overflow: "hidden",
            cursor: "pointer"
        }).bg("#000");
        c.interact(o, l);
        p = c.create(".wrapper");
        p.size("100%");
        d = p.create("img");
        r();
        d.bg(ATUtil.exists(j.asset_folder, "thumb") ? "assets/projects/" + Data.getPage() + "/" + j.asset_folder + "/thumb.jpg" : "assets/images/temp/thumb.jpg").center();
        q = n.initClass(CSSFilter, d);
        if (!Device.mobile) {
            f = p.create(".left");
            f.css({
                width: 4,
                height: "100%",
                left: 0
            }).bg("#fff").setZ(10).transform({
                x: -6
            })
        }
        m = p.create(".line");
        m.size("100%", 1).css({
            width: "50%",
            top: "50%",
            left: "-100%",
            opacity: 1
        }).bg("#fff")
    }

    function g() {
        a = n.initClass(WorkNavListItemText, j.title.toUpperCase(), null);
        p.add(a)
    }

    function r() {
        var t = n.height / Config.UI_NAV_WIDTH;
        d.width = c.width;
        d.height = c.width * t;
        d.size(d.width, d.height * 2).css({
            opacity: 0.6
        })
    }

    function k() {
        if (Data.getPage() == "lab") {
            n.events.subscribe(WorkNavListItem.CLICK, s)
        }
    }

    function o(t) {
        if (n.enabled) {
            return
        }
        switch (t.action) {
            case "over":
                d.tween({
                    opacity: 1
                }, 200, "easeOutSine");
                if (!Hardware.REDUCED_WORK) {
                    m.stopTween().css({
                        width: (c.width - a.width) / 2
                    }).transform({
                        x: 0
                    }).tween({
                        x: c.width
                    }, 500, "easeOutQuint");
                    if (!n.enabled) {
                        a.hoverIn()
                    }
                }
                break;
            case "out":
                if (n.active("preventOut")) {
                    return
                }
                d.tween({
                    opacity: n.active("disable") ? 0.4 : 0.6
                }, 200, "easeOutSine");
                if (!Hardware.REDUCED_WORK || !t.touches) {
                    m.tween({
                        x: c.width * 2
                    }, 500, "easeOutQuint");
                    if (!n.enabled) {
                        a.hoverOut()
                    }
                }
                break
        }
    }

    function l() {
        if (WorkLayoutManager.TRANSITION || n.enabled) {
            return
        }
        if (Device.mobile) {
            n.active("preventOut", true)
        }
        n.events.fire(WorkNavListItem.CLICK, {
            perma: j.perma,
            item: n,
            disabled: n.active("disabled")
        })
    }

    function s(t) {
        if (t.item == n) {
            return
        }
        if (a.active) {
            n.enabled = true
        }
        n.delayedCall(function() {
            if (t.perma == n.data.perma) {
                n.activate()
            } else {
                n.deactivate()
            }
        }, 100)
    }
    this.update = function() {
        var t = n.absY + (n.height / 2);
        d.y = -Utils.range(t, 0, Stage.height, -0.5, 0.5) * n.height;
        d.transform()
    };
    this.onScreen = function(u) {
        var t = u + c.y;
        n.absY = t;
        if (t + n.height < 0) {
            return false
        }
        if (t > Stage.height) {
            return false
        }
        return true
    };
    this.resize = function() {
        if (Mobile.phone || Hardware.FORCE_PHONE) {
            c.size(Stage.width, n.height);
            r();
            d.center()
        }
        this.update()
    };
    this.animateIn = function(t) {
        a.animateIn(t);
        if (f && !n.active("disable")) {
            f.transform({
                x: -6
            }).tween({
                x: 0
            }, 300, "easeOutCubic", 500)
        }
    };
    this.animateOut = function() {
        a.animateOut()
    };
    this.sortDisable = function() {
        n.active("disable", true);
        if (f) {
            f.tween({
                x: -4
            }, 300, "easeOutCubic")
        }
        d.tween({
            opacity: 0.4
        }, 300, "easeOutSine");
        p.tween({
            opacity: 0.7
        }, 300, "easeOutSine");
        q.grayscale = 1;
        if (!Hardware.REDUCED_WORK) {
            q.apply()
        }
    };
    this.sortEnable = function() {
        n.active("disable", false);
        if (f) {
            f.transform({
                x: -4
            }).tween({
                x: 0
            }, 300, "easeOutCubic")
        }
        d.tween({
            opacity: 0.6
        }, 300, "easeOutSine");
        p.tween({
            opacity: 1
        }, 300, "easeOutSine");
        if (!Hardware.REDUCED_WORK) {
            q.clear()
        }
    };
    this.activate = function() {
        if (n.enabled) {
            return
        }
        n.enabled = true;
        a.hoverIn();
        d.tween({
            opacity: 1
        }, 300, "easeOutSine")
    };
    this.deactivate = function(t) {
        if (!n.enabled) {
            return
        }
        n.active("preventOut", false);
        n.enabled = false;
        o({
            action: "out"
        })
    }
}, function() {
    WorkNavListItem.CLICK = "work_nav_list_item_click"
});
Class(function WorkNavListItemText(g) {
    Inherit(this, View);
    var f = this;
    var h, k, a, d;
    var b;
    var j = -4;
    (function() {
        c();
        defer(e)
    })();

    function c() {
        h = f.element;
        h.size(200, 30).center().css({
            overflow: "hidden",
            opacity: 0
        }).transform({
            skewX: j
        });
        k = h.create("text");
        k.fontStyle("OpenSansBold", 10, "#fff").text(g.toUpperCase()).css({
            letterSpacing: 2,
            top: 13
        });
        a = h.create(".over");
        a.size("100%").bg("#fff").css({
            left: "-100%",
            overflow: "hidden"
        });
        d = k.clone();
        d.css({
            color: "#111"
        });
        a.add(d)
    }

    function e() {
        f.width = CSS.textSize(k).width + 40;
        h.size(f.width, 40).center();
        k.css({
            width: "100%",
            textAlign: "center",
            left: 1
        });
        d.css({
            width: "100%",
            textAlign: "center",
            left: 1
        })
    }
    this.hoverIn = function() {
        if (b) {
            return
        }
        b = true;
        a.stopTween().visible().transform({
            x: 0
        }).tween({
            x: Mobile.browser === "Chrome" ? f.width + 1 : f.width
        }, 500, "easeOutQuint");
        d.stopTween().transform({
            x: f.width - 10,
            skewX: -j
        }).tween({
            x: 0,
            skewX: -j
        }, 500, "easeOutQuint");
        k.stopTween().tween({
            x: 10,
            skewX: -j
        }, 500, "easeOutQuint")
    };
    this.hoverOut = function() {
        if (!b) {
            return
        }
        b = false;
        a.tween({
            x: f.width * 2 + 1
        }, 600, "easeOutQuint", function() {
            a.invisible()
        });
        d.tween({
            x: -f.width + 10,
            skewX: -j
        }, 600, "easeOutQuint");
        k.stopTween().transform({
            x: -10,
            skewX: -j
        }).tween({
            x: 0,
            skewX: -j
        }, 600, "easeOutQuint")
    };
    this.animateIn = function(l) {
        h.transform({
            x: 30,
            skewX: j
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            x: 0,
            skewX: j
        }, 600, ["easeInCubic", "easeOutQuint"], l)
    };
    this.animateOut = function() {
        h.tween({
            opacity: 0
        }, 300, "easeOutCubic")
    };
    this.get("active", function() {
        return b
    })
});
Class(function WorkNavListSort(l, d, c) {
    Inherit(this, Component);
    var j = this;
    var o;
    (function() {
        n();
        k()
    })();

    function n() {
        o = $("cover");
        o.width = Config.UI_NAV_WIDTH;
        o.css({
            width: o.width,
            height: "100%"
        }).bg("#fff").setZ(20).invisible().mouseEnabled(false);
        d.add(o)
    }

    function b(q, p) {
        return q.data.sortOrder - p.data.sortOrder
    }

    function a(q) {
        for (var p = 0; p < q.length; p++) {
            l.push(q[p])
        }
    }

    function h(p) {
        p.forEach(function(q) {
            q.sortEnable()
        })
    }

    function f(p) {
        p.forEach(function(q) {
            q.sortDisable()
        })
    }

    function e(r) {
        var q = [];
        var p = [];
        l.forEach(function(t) {
            var u = t.data;
            if (u.tags && u.tags.indexOf(r) > -1) {
                q.push(t)
            } else {
                p.push(t)
            }
        });
        q.sort(b);
        p.sort(b);
        l.length = 0;
        a(q);
        a(p);
        h(q);
        f(p);
        j.parent.y = c.y = 0;
        c.transform();
        l.forEach(function(u, t) {
            u.element.y = u.absY = t * u.height;
            u.update();
            u.element.transform()
        });
        var s = Data.getPage() == "work" ? Data.Work : Data.Lab;
        s.sort(l);
        s.sortTag = r
    }

    function k() {
        j.events.subscribe(ATEvents.FILTER_CHANGE, m);
        j.events.subscribe(ATEvents.RESET_FILTERS, g)
    }

    function g() {
        e("everything")
    }

    function m(p) {
        o.visible().stopTween().transform({
            x: -o.width
        });
        o.tween({
            x: 0
        }, 450, "easeInOutQuint", 180, function() {
            e(p.text);
            o.tween({
                x: o.width
            }, 900, "easeOutExpo", function() {
                o.invisible()
            })
        })
    }
});
Class(function WorkNavOuterUI() {
    Inherit(this, View);
    var j = this;
    var l, n, g, a;
    var o;
    (function() {
        e();
        m();
        d();
        c();
        k()
    })();

    function e() {
        var p = (function() {
            if (Mobile.tablet) {
                return 400
            }
            if (Device.mobile) {
                return 80
            }
            return 100
        })();
        l = j.element;
        l.size(p, 200).center(0, 1).css({
            left: -p
        }).mouseEnabled(false)
    }

    function m() {
        g = l.create("heading");
        g.fontStyle("OpenSansBold", 9, "#fff");
        g.css({
            letterSpacing: 4,
            right: -45 + Config.UI_OFFSET,
            top: "50%",
            width: 100,
            marginTop: -10,
            height: 15,
            textAlign: "center",
            opacity: 1
        });
        g.transform({
            rotation: -90
        });
        g.text("MORE " + Data.getPage().toUpperCase());
        a = l.create("button");
        a.css({
            width: 100,
            height: "100%",
            right: 0
        }).mouseEnabled(true).interact(null, h)
    }

    function d() {
        n = l.create(".line");
        n.size(Config.UI_OFFSET, 1).center(0, 1).css({
            right: Mobile.phone ? -10 : -20,
            opacity: 1
        }).bg("#fff")
    }

    function c() {
        if (Device.mobile && !Hardware.BASIC_NAV) {
            o = j.initClass(TweenTimeline);
            o.add(g, {
                x: 50,
                opacity: 0,
                rotation: -90
            }, 500, "linear");
            o.add(n, {
                x: 50,
                opacity: 0
            }, 500, "linear");
            Render.start(f)
        }
    }

    function f() {
        o.elapsed = WorkNavOpenMechanic.AMOUNT || 0;
        o.update();
        if (o.elapsed > 0.9) {
            if (!a.hidden) {
                a.hidden = true;
                a.hide()
            }
        } else {
            if (a.hidden) {
                a.hidden = false;
                a.show()
            }
        }
    }

    function k() {
        j.events.subscribe(WorkNavOpenMechanic.OPEN, b)
    }

    function h() {
        if (!Hardware.BASIC_NAV && o && o.elapsed > 0.1) {
            return
        }
        j.events.fire(WorkNavOuterUI.CLICK)
    }

    function b(p) {
        if (p.type == "open") {
            a.hide();
            g.tween({
                x: 50,
                opacity: 0
            }, 400, "easeOutCubic");
            n.tween({
                x: 100,
                width: 0,
                opacity: 0
            }, 400, "easeOutCubic")
        } else {
            g.tween({
                x: 0,
                opacity: 1
            }, 500, "easeOutCubic", 300);
            n.tween({
                x: 0,
                width: Config.UI_OFFSET,
                opacity: 1
            }, 500, "easeOutCubic", 150, function() {
                a.show()
            })
        }
    }
    this.onDestroy = function() {
        Render.stop(f)
    }
}, function() {
    WorkNavOuterUI.CLICK = "work_nav_outerui_click"
});
Class(function Main() {
    (function() {
        b();
        __body.bg("#000");
        Mouse.capture();
        if (Hydra.HASH.strpos("playground")) {
            a()
        } else {
            c()
        }
    })();

    function b() {
        AssetUtil.PATH = Config.CDN;
        Hydra.CDN = Config.CDN;
        Utils3D.PATH = Config.PROXY
    }

    function a() {
        Global.PLAYGROUND = true;
        Data.loadData(Config.DATA_API, function() {
            AssetLoader.loadAllAssets(function() {
                Playground.instance()
            })
        })
    }

    function c() {
        Utils3D.disableWarnings();
        Container.instance()
    }
});
window._MINIFIED_ = true;
