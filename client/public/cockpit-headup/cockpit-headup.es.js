import t1, { useState as yi, useEffect as So, useCallback as uA, useRef as aE, createContext as iA } from "react";
import SE from "react-dom";
function cA(b) {
  return b && b.__esModule && Object.prototype.hasOwnProperty.call(b, "default") ? b.default : b;
}
var Jv = { exports: {} }, p0 = {};
var uE;
function oA() {
  if (uE) return p0;
  uE = 1;
  var b = Symbol.for("react.transitional.element"), m = Symbol.for("react.fragment");
  function y(g, x, G) {
    var ee = null;
    if (G !== void 0 && (ee = "" + G), x.key !== void 0 && (ee = "" + x.key), "key" in x) {
      G = {};
      for (var X in x)
        X !== "key" && (G[X] = x[X]);
    } else G = x;
    return x = G.ref, {
      $$typeof: b,
      type: g,
      key: ee,
      ref: x !== void 0 ? x : null,
      props: G
    };
  }
  return p0.Fragment = m, p0.jsx = y, p0.jsxs = y, p0;
}
var y0 = {};
var iE;
function sA() {
  return iE || (iE = 1, process.env.NODE_ENV !== "production" && (function() {
    function b(Q) {
      if (Q == null) return null;
      if (typeof Q == "function")
        return Q.$$typeof === bt ? null : Q.displayName || Q.name || null;
      if (typeof Q == "string") return Q;
      switch (Q) {
        case Ze:
          return "Fragment";
        case mn:
          return "Profiler";
        case Je:
          return "StrictMode";
        case nl:
          return "Suspense";
        case I:
          return "SuspenseList";
        case ie:
          return "Activity";
      }
      if (typeof Q == "object")
        switch (typeof Q.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), Q.$$typeof) {
          case Ct:
            return "Portal";
          case ol:
            return Q.displayName || "Context";
          case wt:
            return (Q._context.displayName || "Context") + ".Consumer";
          case Gl:
            var ne = Q.render;
            return Q = Q.displayName, Q || (Q = ne.displayName || ne.name || "", Q = Q !== "" ? "ForwardRef(" + Q + ")" : "ForwardRef"), Q;
          case me:
            return ne = Q.displayName || null, ne !== null ? ne : b(Q.type) || "Memo";
          case Dt:
            ne = Q._payload, Q = Q._init;
            try {
              return b(Q(ne));
            } catch {
            }
        }
      return null;
    }
    function m(Q) {
      return "" + Q;
    }
    function y(Q) {
      try {
        m(Q);
        var ne = !1;
      } catch {
        ne = !0;
      }
      if (ne) {
        ne = console;
        var se = ne.error, fe = typeof Symbol == "function" && Symbol.toStringTag && Q[Symbol.toStringTag] || Q.constructor.name || "Object";
        return se.call(
          ne,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          fe
        ), m(Q);
      }
    }
    function g(Q) {
      if (Q === Ze) return "<>";
      if (typeof Q == "object" && Q !== null && Q.$$typeof === Dt)
        return "<...>";
      try {
        var ne = b(Q);
        return ne ? "<" + ne + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function x() {
      var Q = Ue.A;
      return Q === null ? null : Q.getOwner();
    }
    function G() {
      return Error("react-stack-top-frame");
    }
    function ee(Q) {
      if (Me.call(Q, "key")) {
        var ne = Object.getOwnPropertyDescriptor(Q, "key").get;
        if (ne && ne.isReactWarning) return !1;
      }
      return Q.key !== void 0;
    }
    function X(Q, ne) {
      function se() {
        C || (C = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          ne
        ));
      }
      se.isReactWarning = !0, Object.defineProperty(Q, "key", {
        get: se,
        configurable: !0
      });
    }
    function re() {
      var Q = b(this.type);
      return K[Q] || (K[Q] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), Q = this.props.ref, Q !== void 0 ? Q : null;
    }
    function Re(Q, ne, se, fe, Qt, Wn) {
      var _t = se.ref;
      return Q = {
        $$typeof: lt,
        type: Q,
        key: ne,
        props: se,
        _owner: fe
      }, (_t !== void 0 ? _t : null) !== null ? Object.defineProperty(Q, "ref", {
        enumerable: !1,
        get: re
      }) : Object.defineProperty(Q, "ref", { enumerable: !1, value: null }), Q._store = {}, Object.defineProperty(Q._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(Q, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(Q, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: Qt
      }), Object.defineProperty(Q, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: Wn
      }), Object.freeze && (Object.freeze(Q.props), Object.freeze(Q)), Q;
    }
    function ke(Q, ne, se, fe, Qt, Wn) {
      var _t = ne.children;
      if (_t !== void 0)
        if (fe)
          if (yl(_t)) {
            for (fe = 0; fe < _t.length; fe++)
              ae(_t[fe]);
            Object.freeze && Object.freeze(_t);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else ae(_t);
      if (Me.call(ne, "key")) {
        _t = b(Q);
        var Fn = Object.keys(ne).filter(function(ef) {
          return ef !== "key";
        });
        fe = 0 < Fn.length ? "{key: someKey, " + Fn.join(": ..., ") + ": ...}" : "{key: someKey}", Se[_t + fe] || (Fn = 0 < Fn.length ? "{" + Fn.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          fe,
          _t,
          Fn,
          _t
        ), Se[_t + fe] = !0);
      }
      if (_t = null, se !== void 0 && (y(se), _t = "" + se), ee(ne) && (y(ne.key), _t = "" + ne.key), "key" in ne) {
        se = {};
        for (var On in ne)
          On !== "key" && (se[On] = ne[On]);
      } else se = ne;
      return _t && X(
        se,
        typeof Q == "function" ? Q.displayName || Q.name || "Unknown" : Q
      ), Re(
        Q,
        _t,
        se,
        x(),
        Qt,
        Wn
      );
    }
    function ae(Q) {
      Te(Q) ? Q._store && (Q._store.validated = 1) : typeof Q == "object" && Q !== null && Q.$$typeof === Dt && (Q._payload.status === "fulfilled" ? Te(Q._payload.value) && Q._payload.value._store && (Q._payload.value._store.validated = 1) : Q._store && (Q._store.validated = 1));
    }
    function Te(Q) {
      return typeof Q == "object" && Q !== null && Q.$$typeof === lt;
    }
    var it = t1, lt = Symbol.for("react.transitional.element"), Ct = Symbol.for("react.portal"), Ze = Symbol.for("react.fragment"), Je = Symbol.for("react.strict_mode"), mn = Symbol.for("react.profiler"), wt = Symbol.for("react.consumer"), ol = Symbol.for("react.context"), Gl = Symbol.for("react.forward_ref"), nl = Symbol.for("react.suspense"), I = Symbol.for("react.suspense_list"), me = Symbol.for("react.memo"), Dt = Symbol.for("react.lazy"), ie = Symbol.for("react.activity"), bt = Symbol.for("react.client.reference"), Ue = it.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Me = Object.prototype.hasOwnProperty, yl = Array.isArray, Vt = console.createTask ? console.createTask : function() {
      return null;
    };
    it = {
      react_stack_bottom_frame: function(Q) {
        return Q();
      }
    };
    var C, K = {}, W = it.react_stack_bottom_frame.bind(
      it,
      G
    )(), ye = Vt(g(G)), Se = {};
    y0.Fragment = Ze, y0.jsx = function(Q, ne, se) {
      var fe = 1e4 > Ue.recentlyCreatedOwnerStacks++;
      return ke(
        Q,
        ne,
        se,
        !1,
        fe ? Error("react-stack-top-frame") : W,
        fe ? Vt(g(Q)) : ye
      );
    }, y0.jsxs = function(Q, ne, se) {
      var fe = 1e4 > Ue.recentlyCreatedOwnerStacks++;
      return ke(
        Q,
        ne,
        se,
        !0,
        fe ? Error("react-stack-top-frame") : W,
        fe ? Vt(g(Q)) : ye
      );
    };
  })()), y0;
}
var cE;
function fA() {
  return cE || (cE = 1, process.env.NODE_ENV === "production" ? Jv.exports = oA() : Jv.exports = sA()), Jv.exports;
}
var k = fA(), Kv = { exports: {} }, g0 = {}, $v = { exports: {} }, Ub = {};
var oE;
function rA() {
  return oE || (oE = 1, (function(b) {
    function m(C, K) {
      var W = C.length;
      C.push(K);
      e: for (; 0 < W; ) {
        var ye = W - 1 >>> 1, Se = C[ye];
        if (0 < x(Se, K))
          C[ye] = K, C[W] = Se, W = ye;
        else break e;
      }
    }
    function y(C) {
      return C.length === 0 ? null : C[0];
    }
    function g(C) {
      if (C.length === 0) return null;
      var K = C[0], W = C.pop();
      if (W !== K) {
        C[0] = W;
        e: for (var ye = 0, Se = C.length, Q = Se >>> 1; ye < Q; ) {
          var ne = 2 * (ye + 1) - 1, se = C[ne], fe = ne + 1, Qt = C[fe];
          if (0 > x(se, W))
            fe < Se && 0 > x(Qt, se) ? (C[ye] = Qt, C[fe] = W, ye = fe) : (C[ye] = se, C[ne] = W, ye = ne);
          else if (fe < Se && 0 > x(Qt, W))
            C[ye] = Qt, C[fe] = W, ye = fe;
          else break e;
        }
      }
      return K;
    }
    function x(C, K) {
      var W = C.sortIndex - K.sortIndex;
      return W !== 0 ? W : C.id - K.id;
    }
    if (b.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var G = performance;
      b.unstable_now = function() {
        return G.now();
      };
    } else {
      var ee = Date, X = ee.now();
      b.unstable_now = function() {
        return ee.now() - X;
      };
    }
    var re = [], Re = [], ke = 1, ae = null, Te = 3, it = !1, lt = !1, Ct = !1, Ze = !1, Je = typeof setTimeout == "function" ? setTimeout : null, mn = typeof clearTimeout == "function" ? clearTimeout : null, wt = typeof setImmediate < "u" ? setImmediate : null;
    function ol(C) {
      for (var K = y(Re); K !== null; ) {
        if (K.callback === null) g(Re);
        else if (K.startTime <= C)
          g(Re), K.sortIndex = K.expirationTime, m(re, K);
        else break;
        K = y(Re);
      }
    }
    function Gl(C) {
      if (Ct = !1, ol(C), !lt)
        if (y(re) !== null)
          lt = !0, nl || (nl = !0, Ue());
        else {
          var K = y(Re);
          K !== null && Vt(Gl, K.startTime - C);
        }
    }
    var nl = !1, I = -1, me = 5, Dt = -1;
    function ie() {
      return Ze ? !0 : !(b.unstable_now() - Dt < me);
    }
    function bt() {
      if (Ze = !1, nl) {
        var C = b.unstable_now();
        Dt = C;
        var K = !0;
        try {
          e: {
            lt = !1, Ct && (Ct = !1, mn(I), I = -1), it = !0;
            var W = Te;
            try {
              t: {
                for (ol(C), ae = y(re); ae !== null && !(ae.expirationTime > C && ie()); ) {
                  var ye = ae.callback;
                  if (typeof ye == "function") {
                    ae.callback = null, Te = ae.priorityLevel;
                    var Se = ye(
                      ae.expirationTime <= C
                    );
                    if (C = b.unstable_now(), typeof Se == "function") {
                      ae.callback = Se, ol(C), K = !0;
                      break t;
                    }
                    ae === y(re) && g(re), ol(C);
                  } else g(re);
                  ae = y(re);
                }
                if (ae !== null) K = !0;
                else {
                  var Q = y(Re);
                  Q !== null && Vt(
                    Gl,
                    Q.startTime - C
                  ), K = !1;
                }
              }
              break e;
            } finally {
              ae = null, Te = W, it = !1;
            }
            K = void 0;
          }
        } finally {
          K ? Ue() : nl = !1;
        }
      }
    }
    var Ue;
    if (typeof wt == "function")
      Ue = function() {
        wt(bt);
      };
    else if (typeof MessageChannel < "u") {
      var Me = new MessageChannel(), yl = Me.port2;
      Me.port1.onmessage = bt, Ue = function() {
        yl.postMessage(null);
      };
    } else
      Ue = function() {
        Je(bt, 0);
      };
    function Vt(C, K) {
      I = Je(function() {
        C(b.unstable_now());
      }, K);
    }
    b.unstable_IdlePriority = 5, b.unstable_ImmediatePriority = 1, b.unstable_LowPriority = 4, b.unstable_NormalPriority = 3, b.unstable_Profiling = null, b.unstable_UserBlockingPriority = 2, b.unstable_cancelCallback = function(C) {
      C.callback = null;
    }, b.unstable_forceFrameRate = function(C) {
      0 > C || 125 < C ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : me = 0 < C ? Math.floor(1e3 / C) : 5;
    }, b.unstable_getCurrentPriorityLevel = function() {
      return Te;
    }, b.unstable_next = function(C) {
      switch (Te) {
        case 1:
        case 2:
        case 3:
          var K = 3;
          break;
        default:
          K = Te;
      }
      var W = Te;
      Te = K;
      try {
        return C();
      } finally {
        Te = W;
      }
    }, b.unstable_requestPaint = function() {
      Ze = !0;
    }, b.unstable_runWithPriority = function(C, K) {
      switch (C) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          C = 3;
      }
      var W = Te;
      Te = C;
      try {
        return K();
      } finally {
        Te = W;
      }
    }, b.unstable_scheduleCallback = function(C, K, W) {
      var ye = b.unstable_now();
      switch (typeof W == "object" && W !== null ? (W = W.delay, W = typeof W == "number" && 0 < W ? ye + W : ye) : W = ye, C) {
        case 1:
          var Se = -1;
          break;
        case 2:
          Se = 250;
          break;
        case 5:
          Se = 1073741823;
          break;
        case 4:
          Se = 1e4;
          break;
        default:
          Se = 5e3;
      }
      return Se = W + Se, C = {
        id: ke++,
        callback: K,
        priorityLevel: C,
        startTime: W,
        expirationTime: Se,
        sortIndex: -1
      }, W > ye ? (C.sortIndex = W, m(Re, C), y(re) === null && C === y(Re) && (Ct ? (mn(I), I = -1) : Ct = !0, Vt(Gl, W - ye))) : (C.sortIndex = Se, m(re, C), lt || it || (lt = !0, nl || (nl = !0, Ue()))), C;
    }, b.unstable_shouldYield = ie, b.unstable_wrapCallback = function(C) {
      var K = Te;
      return function() {
        var W = Te;
        Te = K;
        try {
          return C.apply(this, arguments);
        } finally {
          Te = W;
        }
      };
    };
  })(Ub)), Ub;
}
var xb = {};
var sE;
function dA() {
  return sE || (sE = 1, (function(b) {
    process.env.NODE_ENV !== "production" && (function() {
      function m() {
        if (Gl = !1, Dt) {
          var C = b.unstable_now();
          Ue = C;
          var K = !0;
          try {
            e: {
              wt = !1, ol && (ol = !1, I(ie), ie = -1), mn = !0;
              var W = Je;
              try {
                t: {
                  for (ee(C), Ze = g(it); Ze !== null && !(Ze.expirationTime > C && re()); ) {
                    var ye = Ze.callback;
                    if (typeof ye == "function") {
                      Ze.callback = null, Je = Ze.priorityLevel;
                      var Se = ye(
                        Ze.expirationTime <= C
                      );
                      if (C = b.unstable_now(), typeof Se == "function") {
                        Ze.callback = Se, ee(C), K = !0;
                        break t;
                      }
                      Ze === g(it) && x(it), ee(C);
                    } else x(it);
                    Ze = g(it);
                  }
                  if (Ze !== null) K = !0;
                  else {
                    var Q = g(lt);
                    Q !== null && Re(
                      X,
                      Q.startTime - C
                    ), K = !1;
                  }
                }
                break e;
              } finally {
                Ze = null, Je = W, mn = !1;
              }
              K = void 0;
            }
          } finally {
            K ? Me() : Dt = !1;
          }
        }
      }
      function y(C, K) {
        var W = C.length;
        C.push(K);
        e: for (; 0 < W; ) {
          var ye = W - 1 >>> 1, Se = C[ye];
          if (0 < G(Se, K))
            C[ye] = K, C[W] = Se, W = ye;
          else break e;
        }
      }
      function g(C) {
        return C.length === 0 ? null : C[0];
      }
      function x(C) {
        if (C.length === 0) return null;
        var K = C[0], W = C.pop();
        if (W !== K) {
          C[0] = W;
          e: for (var ye = 0, Se = C.length, Q = Se >>> 1; ye < Q; ) {
            var ne = 2 * (ye + 1) - 1, se = C[ne], fe = ne + 1, Qt = C[fe];
            if (0 > G(se, W))
              fe < Se && 0 > G(Qt, se) ? (C[ye] = Qt, C[fe] = W, ye = fe) : (C[ye] = se, C[ne] = W, ye = ne);
            else if (fe < Se && 0 > G(Qt, W))
              C[ye] = Qt, C[fe] = W, ye = fe;
            else break e;
          }
        }
        return K;
      }
      function G(C, K) {
        var W = C.sortIndex - K.sortIndex;
        return W !== 0 ? W : C.id - K.id;
      }
      function ee(C) {
        for (var K = g(lt); K !== null; ) {
          if (K.callback === null) x(lt);
          else if (K.startTime <= C)
            x(lt), K.sortIndex = K.expirationTime, y(it, K);
          else break;
          K = g(lt);
        }
      }
      function X(C) {
        if (ol = !1, ee(C), !wt)
          if (g(it) !== null)
            wt = !0, Dt || (Dt = !0, Me());
          else {
            var K = g(lt);
            K !== null && Re(
              X,
              K.startTime - C
            );
          }
      }
      function re() {
        return Gl ? !0 : !(b.unstable_now() - Ue < bt);
      }
      function Re(C, K) {
        ie = nl(function() {
          C(b.unstable_now());
        }, K);
      }
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error()), b.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
        var ke = performance;
        b.unstable_now = function() {
          return ke.now();
        };
      } else {
        var ae = Date, Te = ae.now();
        b.unstable_now = function() {
          return ae.now() - Te;
        };
      }
      var it = [], lt = [], Ct = 1, Ze = null, Je = 3, mn = !1, wt = !1, ol = !1, Gl = !1, nl = typeof setTimeout == "function" ? setTimeout : null, I = typeof clearTimeout == "function" ? clearTimeout : null, me = typeof setImmediate < "u" ? setImmediate : null, Dt = !1, ie = -1, bt = 5, Ue = -1;
      if (typeof me == "function")
        var Me = function() {
          me(m);
        };
      else if (typeof MessageChannel < "u") {
        var yl = new MessageChannel(), Vt = yl.port2;
        yl.port1.onmessage = m, Me = function() {
          Vt.postMessage(null);
        };
      } else
        Me = function() {
          nl(m, 0);
        };
      b.unstable_IdlePriority = 5, b.unstable_ImmediatePriority = 1, b.unstable_LowPriority = 4, b.unstable_NormalPriority = 3, b.unstable_Profiling = null, b.unstable_UserBlockingPriority = 2, b.unstable_cancelCallback = function(C) {
        C.callback = null;
      }, b.unstable_forceFrameRate = function(C) {
        0 > C || 125 < C ? console.error(
          "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
        ) : bt = 0 < C ? Math.floor(1e3 / C) : 5;
      }, b.unstable_getCurrentPriorityLevel = function() {
        return Je;
      }, b.unstable_next = function(C) {
        switch (Je) {
          case 1:
          case 2:
          case 3:
            var K = 3;
            break;
          default:
            K = Je;
        }
        var W = Je;
        Je = K;
        try {
          return C();
        } finally {
          Je = W;
        }
      }, b.unstable_requestPaint = function() {
        Gl = !0;
      }, b.unstable_runWithPriority = function(C, K) {
        switch (C) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            C = 3;
        }
        var W = Je;
        Je = C;
        try {
          return K();
        } finally {
          Je = W;
        }
      }, b.unstable_scheduleCallback = function(C, K, W) {
        var ye = b.unstable_now();
        switch (typeof W == "object" && W !== null ? (W = W.delay, W = typeof W == "number" && 0 < W ? ye + W : ye) : W = ye, C) {
          case 1:
            var Se = -1;
            break;
          case 2:
            Se = 250;
            break;
          case 5:
            Se = 1073741823;
            break;
          case 4:
            Se = 1e4;
            break;
          default:
            Se = 5e3;
        }
        return Se = W + Se, C = {
          id: Ct++,
          callback: K,
          priorityLevel: C,
          startTime: W,
          expirationTime: Se,
          sortIndex: -1
        }, W > ye ? (C.sortIndex = W, y(lt, C), g(it) === null && C === g(lt) && (ol ? (I(ie), ie = -1) : ol = !0, Re(X, W - ye))) : (C.sortIndex = Se, y(it, C), wt || mn || (wt = !0, Dt || (Dt = !0, Me()))), C;
      }, b.unstable_shouldYield = re, b.unstable_wrapCallback = function(C) {
        var K = Je;
        return function() {
          var W = Je;
          Je = K;
          try {
            return C.apply(this, arguments);
          } finally {
            Je = W;
          }
        };
      }, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  })(xb)), xb;
}
var fE;
function EE() {
  return fE || (fE = 1, process.env.NODE_ENV === "production" ? $v.exports = rA() : $v.exports = dA()), $v.exports;
}
var rE;
function hA() {
  if (rE) return g0;
  rE = 1;
  var b = EE(), m = t1, y = SE;
  function g(l) {
    var a = "https://react.dev/errors/" + l;
    if (1 < arguments.length) {
      a += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var u = 2; u < arguments.length; u++)
        a += "&args[]=" + encodeURIComponent(arguments[u]);
    }
    return "Minified React error #" + l + "; visit " + a + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function x(l) {
    return !(!l || l.nodeType !== 1 && l.nodeType !== 9 && l.nodeType !== 11);
  }
  function G(l) {
    var a = l, u = l;
    if (l.alternate) for (; a.return; ) a = a.return;
    else {
      l = a;
      do
        a = l, (a.flags & 4098) !== 0 && (u = a.return), l = a.return;
      while (l);
    }
    return a.tag === 3 ? u : null;
  }
  function ee(l) {
    if (l.tag === 13) {
      var a = l.memoizedState;
      if (a === null && (l = l.alternate, l !== null && (a = l.memoizedState)), a !== null) return a.dehydrated;
    }
    return null;
  }
  function X(l) {
    if (l.tag === 31) {
      var a = l.memoizedState;
      if (a === null && (l = l.alternate, l !== null && (a = l.memoizedState)), a !== null) return a.dehydrated;
    }
    return null;
  }
  function re(l) {
    if (G(l) !== l)
      throw Error(g(188));
  }
  function Re(l) {
    var a = l.alternate;
    if (!a) {
      if (a = G(l), a === null) throw Error(g(188));
      return a !== l ? null : l;
    }
    for (var u = l, c = a; ; ) {
      var f = u.return;
      if (f === null) break;
      var r = f.alternate;
      if (r === null) {
        if (c = f.return, c !== null) {
          u = c;
          continue;
        }
        break;
      }
      if (f.child === r.child) {
        for (r = f.child; r; ) {
          if (r === u) return re(f), l;
          if (r === c) return re(f), a;
          r = r.sibling;
        }
        throw Error(g(188));
      }
      if (u.return !== c.return) u = f, c = r;
      else {
        for (var p = !1, E = f.child; E; ) {
          if (E === u) {
            p = !0, u = f, c = r;
            break;
          }
          if (E === c) {
            p = !0, c = f, u = r;
            break;
          }
          E = E.sibling;
        }
        if (!p) {
          for (E = r.child; E; ) {
            if (E === u) {
              p = !0, u = r, c = f;
              break;
            }
            if (E === c) {
              p = !0, c = r, u = f;
              break;
            }
            E = E.sibling;
          }
          if (!p) throw Error(g(189));
        }
      }
      if (u.alternate !== c) throw Error(g(190));
    }
    if (u.tag !== 3) throw Error(g(188));
    return u.stateNode.current === u ? l : a;
  }
  function ke(l) {
    var a = l.tag;
    if (a === 5 || a === 26 || a === 27 || a === 6) return l;
    for (l = l.child; l !== null; ) {
      if (a = ke(l), a !== null) return a;
      l = l.sibling;
    }
    return null;
  }
  var ae = Object.assign, Te = Symbol.for("react.element"), it = Symbol.for("react.transitional.element"), lt = Symbol.for("react.portal"), Ct = Symbol.for("react.fragment"), Ze = Symbol.for("react.strict_mode"), Je = Symbol.for("react.profiler"), mn = Symbol.for("react.consumer"), wt = Symbol.for("react.context"), ol = Symbol.for("react.forward_ref"), Gl = Symbol.for("react.suspense"), nl = Symbol.for("react.suspense_list"), I = Symbol.for("react.memo"), me = Symbol.for("react.lazy"), Dt = Symbol.for("react.activity"), ie = Symbol.for("react.memo_cache_sentinel"), bt = Symbol.iterator;
  function Ue(l) {
    return l === null || typeof l != "object" ? null : (l = bt && l[bt] || l["@@iterator"], typeof l == "function" ? l : null);
  }
  var Me = Symbol.for("react.client.reference");
  function yl(l) {
    if (l == null) return null;
    if (typeof l == "function")
      return l.$$typeof === Me ? null : l.displayName || l.name || null;
    if (typeof l == "string") return l;
    switch (l) {
      case Ct:
        return "Fragment";
      case Je:
        return "Profiler";
      case Ze:
        return "StrictMode";
      case Gl:
        return "Suspense";
      case nl:
        return "SuspenseList";
      case Dt:
        return "Activity";
    }
    if (typeof l == "object")
      switch (l.$$typeof) {
        case lt:
          return "Portal";
        case wt:
          return l.displayName || "Context";
        case mn:
          return (l._context.displayName || "Context") + ".Consumer";
        case ol:
          var a = l.render;
          return l = l.displayName, l || (l = a.displayName || a.name || "", l = l !== "" ? "ForwardRef(" + l + ")" : "ForwardRef"), l;
        case I:
          return a = l.displayName || null, a !== null ? a : yl(l.type) || "Memo";
        case me:
          a = l._payload, l = l._init;
          try {
            return yl(l(a));
          } catch {
          }
      }
    return null;
  }
  var Vt = Array.isArray, C = m.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, K = y.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, W = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, ye = [], Se = -1;
  function Q(l) {
    return { current: l };
  }
  function ne(l) {
    0 > Se || (l.current = ye[Se], ye[Se] = null, Se--);
  }
  function se(l, a) {
    Se++, ye[Se] = l.current, l.current = a;
  }
  var fe = Q(null), Qt = Q(null), Wn = Q(null), _t = Q(null);
  function Fn(l, a) {
    switch (se(Wn, a), se(Qt, l), se(fe, null), a.nodeType) {
      case 9:
      case 11:
        l = (l = a.documentElement) && (l = l.namespaceURI) ? jg(l) : 0;
        break;
      default:
        if (l = a.tagName, a = a.namespaceURI)
          a = jg(a), l = fy(a, l);
        else
          switch (l) {
            case "svg":
              l = 1;
              break;
            case "math":
              l = 2;
              break;
            default:
              l = 0;
          }
    }
    ne(fe), se(fe, l);
  }
  function On() {
    ne(fe), ne(Qt), ne(Wn);
  }
  function ef(l) {
    l.memoizedState !== null && se(_t, l);
    var a = fe.current, u = fy(a, l.type);
    a !== u && (se(Qt, l), se(fe, u));
  }
  function le(l) {
    Qt.current === l && (ne(fe), ne(Qt)), _t.current === l && (ne(_t), gr._currentValue = W);
  }
  var tf, lf;
  function Ja(l) {
    if (tf === void 0)
      try {
        throw Error();
      } catch (u) {
        var a = u.stack.trim().match(/\n( *(at )?)/);
        tf = a && a[1] || "", lf = -1 < u.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < u.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + tf + l + lf;
  }
  var cc = !1;
  function dt(l, a) {
    if (!l || cc) return "";
    cc = !0;
    var u = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var c = {
        DetermineComponentFrameRoot: function() {
          try {
            if (a) {
              var J = function() {
                throw Error();
              };
              if (Object.defineProperty(J.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(J, []);
                } catch (Y) {
                  var B = Y;
                }
                Reflect.construct(l, [], J);
              } else {
                try {
                  J.call();
                } catch (Y) {
                  B = Y;
                }
                l.call(J.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (Y) {
                B = Y;
              }
              (J = l()) && typeof J.catch == "function" && J.catch(function() {
              });
            }
          } catch (Y) {
            if (Y && B && typeof Y.stack == "string")
              return [Y.stack, B.stack];
          }
          return [null, null];
        }
      };
      c.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var f = Object.getOwnPropertyDescriptor(
        c.DetermineComponentFrameRoot,
        "name"
      );
      f && f.configurable && Object.defineProperty(
        c.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var r = c.DetermineComponentFrameRoot(), p = r[0], E = r[1];
      if (p && E) {
        var O = p.split(`
`), H = E.split(`
`);
        for (f = c = 0; c < O.length && !O[c].includes("DetermineComponentFrameRoot"); )
          c++;
        for (; f < H.length && !H[f].includes(
          "DetermineComponentFrameRoot"
        ); )
          f++;
        if (c === O.length || f === H.length)
          for (c = O.length - 1, f = H.length - 1; 1 <= c && 0 <= f && O[c] !== H[f]; )
            f--;
        for (; 1 <= c && 0 <= f; c--, f--)
          if (O[c] !== H[f]) {
            if (c !== 1 || f !== 1)
              do
                if (c--, f--, 0 > f || O[c] !== H[f]) {
                  var L = `
` + O[c].replace(" at new ", " at ");
                  return l.displayName && L.includes("<anonymous>") && (L = L.replace("<anonymous>", l.displayName)), L;
                }
              while (1 <= c && 0 <= f);
            break;
          }
      }
    } finally {
      cc = !1, Error.prepareStackTrace = u;
    }
    return (u = l ? l.displayName || l.name : "") ? Ja(u) : "";
  }
  function pm(l, a) {
    switch (l.tag) {
      case 26:
      case 27:
      case 5:
        return Ja(l.type);
      case 16:
        return Ja("Lazy");
      case 13:
        return l.child !== a && a !== null ? Ja("Suspense Fallback") : Ja("Suspense");
      case 19:
        return Ja("SuspenseList");
      case 0:
      case 15:
        return dt(l.type, !1);
      case 11:
        return dt(l.type.render, !1);
      case 1:
        return dt(l.type, !0);
      case 31:
        return Ja("Activity");
      default:
        return "";
    }
  }
  function Qr(l) {
    try {
      var a = "", u = null;
      do
        a += pm(l, u), u = l, l = l.return;
      while (l);
      return a;
    } catch (c) {
      return `
Error generating stack: ` + c.message + `
` + c.stack;
    }
  }
  var ym = Object.prototype.hasOwnProperty, St = b.unstable_scheduleCallback, gm = b.unstable_cancelCallback, oc = b.unstable_shouldYield, Zr = b.unstable_requestPaint, Nl = b.unstable_now, a1 = b.unstable_getCurrentPriorityLevel, Jr = b.unstable_ImmediatePriority, Kr = b.unstable_UserBlockingPriority, gi = b.unstable_NormalPriority, u1 = b.unstable_LowPriority, vm = b.unstable_IdlePriority, E0 = b.log, T0 = b.unstable_setDisableYieldValue, sc = null, pn = null;
  function wu(l) {
    if (typeof E0 == "function" && T0(l), pn && typeof pn.setStrictMode == "function")
      try {
        pn.setStrictMode(sc, l);
      } catch {
      }
  }
  var kl = Math.clz32 ? Math.clz32 : bm, A0 = Math.log, z0 = Math.LN2;
  function bm(l) {
    return l >>>= 0, l === 0 ? 32 : 31 - (A0(l) / z0 | 0) | 0;
  }
  var Yu = 256, pa = 262144, vi = 4194304;
  function In(l) {
    var a = l & 42;
    if (a !== 0) return a;
    switch (l & -l) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return l & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return l & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return l & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return l;
    }
  }
  function Wt(l, a, u) {
    var c = l.pendingLanes;
    if (c === 0) return 0;
    var f = 0, r = l.suspendedLanes, p = l.pingedLanes;
    l = l.warmLanes;
    var E = c & 134217727;
    return E !== 0 ? (c = E & ~r, c !== 0 ? f = In(c) : (p &= E, p !== 0 ? f = In(p) : u || (u = E & ~l, u !== 0 && (f = In(u))))) : (E = c & ~r, E !== 0 ? f = In(E) : p !== 0 ? f = In(p) : u || (u = c & ~l, u !== 0 && (f = In(u)))), f === 0 ? 0 : a !== 0 && a !== f && (a & r) === 0 && (r = f & -f, u = a & -a, r >= u || r === 32 && (u & 4194048) !== 0) ? a : f;
  }
  function ya(l, a) {
    return (l.pendingLanes & ~(l.suspendedLanes & ~l.pingedLanes) & a) === 0;
  }
  function Eo(l, a) {
    switch (l) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return a + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return a + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function fc() {
    var l = vi;
    return vi <<= 1, (vi & 62914560) === 0 && (vi = 4194304), l;
  }
  function nf(l) {
    for (var a = [], u = 0; 31 > u; u++) a.push(l);
    return a;
  }
  function To(l, a) {
    l.pendingLanes |= a, a !== 268435456 && (l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0);
  }
  function $r(l, a, u, c, f, r) {
    var p = l.pendingLanes;
    l.pendingLanes = u, l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0, l.expiredLanes &= u, l.entangledLanes &= u, l.errorRecoveryDisabledLanes &= u, l.shellSuspendCounter = 0;
    var E = l.entanglements, O = l.expirationTimes, H = l.hiddenUpdates;
    for (u = p & ~u; 0 < u; ) {
      var L = 31 - kl(u), J = 1 << L;
      E[L] = 0, O[L] = -1;
      var B = H[L];
      if (B !== null)
        for (H[L] = null, L = 0; L < B.length; L++) {
          var Y = B[L];
          Y !== null && (Y.lane &= -536870913);
        }
      u &= ~J;
    }
    c !== 0 && af(l, c, 0), r !== 0 && f === 0 && l.tag !== 0 && (l.suspendedLanes |= r & ~(p & ~a));
  }
  function af(l, a, u) {
    l.pendingLanes |= a, l.suspendedLanes &= ~a;
    var c = 31 - kl(a);
    l.entangledLanes |= a, l.entanglements[c] = l.entanglements[c] | 1073741824 | u & 261930;
  }
  function Ka(l, a) {
    var u = l.entangledLanes |= a;
    for (l = l.entanglements; u; ) {
      var c = 31 - kl(u), f = 1 << c;
      f & a | l[c] & a && (l[c] |= a), u &= ~f;
    }
  }
  function Dn(l, a) {
    var u = a & -a;
    return u = (u & 42) !== 0 ? 1 : kr(u), (u & (l.suspendedLanes | a)) !== 0 ? 0 : u;
  }
  function kr(l) {
    switch (l) {
      case 2:
        l = 1;
        break;
      case 8:
        l = 4;
        break;
      case 32:
        l = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        l = 128;
        break;
      case 268435456:
        l = 134217728;
        break;
      default:
        l = 0;
    }
    return l;
  }
  function Sm(l) {
    return l &= -l, 2 < l ? 8 < l ? (l & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Wr() {
    var l = K.p;
    return l !== 0 ? l : (l = window.event, l === void 0 ? 32 : vr(l.type));
  }
  function Em(l, a) {
    var u = K.p;
    try {
      return K.p = l, a();
    } finally {
      K.p = u;
    }
  }
  var ga = Math.random().toString(36).slice(2), ht = "__reactFiber$" + ga, Wl = "__reactProps$" + ga, bi = "__reactContainer$" + ga, Fr = "__reactEvents$" + ga, Tm = "__reactListeners$" + ga, O0 = "__reactHandles$" + ga, Am = "__reactResources$" + ga, $a = "__reactMarker$" + ga;
  function Ir(l) {
    delete l[ht], delete l[Wl], delete l[Fr], delete l[Tm], delete l[O0];
  }
  function rc(l) {
    var a = l[ht];
    if (a) return a;
    for (var u = l.parentNode; u; ) {
      if (a = u[bi] || u[ht]) {
        if (u = a.alternate, a.child !== null || u !== null && u.child !== null)
          for (l = wa(l); l !== null; ) {
            if (u = l[ht]) return u;
            l = wa(l);
          }
        return a;
      }
      l = u, u = l.parentNode;
    }
    return null;
  }
  function dc(l) {
    if (l = l[ht] || l[bi]) {
      var a = l.tag;
      if (a === 5 || a === 6 || a === 13 || a === 31 || a === 26 || a === 27 || a === 3)
        return l;
    }
    return null;
  }
  function Ao(l) {
    var a = l.tag;
    if (a === 5 || a === 26 || a === 27 || a === 6) return l.stateNode;
    throw Error(g(33));
  }
  function hc(l) {
    var a = l[Am];
    return a || (a = l[Am] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), a;
  }
  function ct(l) {
    l[$a] = !0;
  }
  var mc = /* @__PURE__ */ new Set(), Si = {};
  function Ei(l, a) {
    ka(l, a), ka(l + "Capture", a);
  }
  function ka(l, a) {
    for (Si[l] = a, l = 0; l < a.length; l++)
      mc.add(a[l]);
  }
  var Pr = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), ed = {}, zo = {};
  function Oo(l) {
    return ym.call(zo, l) ? !0 : ym.call(ed, l) ? !1 : Pr.test(l) ? zo[l] = !0 : (ed[l] = !0, !1);
  }
  function Do(l, a, u) {
    if (Oo(a))
      if (u === null) l.removeAttribute(a);
      else {
        switch (typeof u) {
          case "undefined":
          case "function":
          case "symbol":
            l.removeAttribute(a);
            return;
          case "boolean":
            var c = a.toLowerCase().slice(0, 5);
            if (c !== "data-" && c !== "aria-") {
              l.removeAttribute(a);
              return;
            }
        }
        l.setAttribute(a, "" + u);
      }
  }
  function td(l, a, u) {
    if (u === null) l.removeAttribute(a);
    else {
      switch (typeof u) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(a);
          return;
      }
      l.setAttribute(a, "" + u);
    }
  }
  function Gu(l, a, u, c) {
    if (c === null) l.removeAttribute(u);
    else {
      switch (typeof c) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(u);
          return;
      }
      l.setAttributeNS(a, u, "" + c);
    }
  }
  function _n(l) {
    switch (typeof l) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return l;
      case "object":
        return l;
      default:
        return "";
    }
  }
  function ld(l) {
    var a = l.type;
    return (l = l.nodeName) && l.toLowerCase() === "input" && (a === "checkbox" || a === "radio");
  }
  function zm(l, a, u) {
    var c = Object.getOwnPropertyDescriptor(
      l.constructor.prototype,
      a
    );
    if (!l.hasOwnProperty(a) && typeof c < "u" && typeof c.get == "function" && typeof c.set == "function") {
      var f = c.get, r = c.set;
      return Object.defineProperty(l, a, {
        configurable: !0,
        get: function() {
          return f.call(this);
        },
        set: function(p) {
          u = "" + p, r.call(this, p);
        }
      }), Object.defineProperty(l, a, {
        enumerable: c.enumerable
      }), {
        getValue: function() {
          return u;
        },
        setValue: function(p) {
          u = "" + p;
        },
        stopTracking: function() {
          l._valueTracker = null, delete l[a];
        }
      };
    }
  }
  function nd(l) {
    if (!l._valueTracker) {
      var a = ld(l) ? "checked" : "value";
      l._valueTracker = zm(
        l,
        a,
        "" + l[a]
      );
    }
  }
  function Om(l) {
    if (!l) return !1;
    var a = l._valueTracker;
    if (!a) return !0;
    var u = a.getValue(), c = "";
    return l && (c = ld(l) ? l.checked ? "true" : "false" : l.value), l = c, l !== u ? (a.setValue(l), !0) : !1;
  }
  function uf(l) {
    if (l = l || (typeof document < "u" ? document : void 0), typeof l > "u") return null;
    try {
      return l.activeElement || l.body;
    } catch {
      return l.body;
    }
  }
  var i1 = /[\n"\\]/g;
  function Rn(l) {
    return l.replace(
      i1,
      function(a) {
        return "\\" + a.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function cf(l, a, u, c, f, r, p, E) {
    l.name = "", p != null && typeof p != "function" && typeof p != "symbol" && typeof p != "boolean" ? l.type = p : l.removeAttribute("type"), a != null ? p === "number" ? (a === 0 && l.value === "" || l.value != a) && (l.value = "" + _n(a)) : l.value !== "" + _n(a) && (l.value = "" + _n(a)) : p !== "submit" && p !== "reset" || l.removeAttribute("value"), a != null ? pc(l, p, _n(a)) : u != null ? pc(l, p, _n(u)) : c != null && l.removeAttribute("value"), f == null && r != null && (l.defaultChecked = !!r), f != null && (l.checked = f && typeof f != "function" && typeof f != "symbol"), E != null && typeof E != "function" && typeof E != "symbol" && typeof E != "boolean" ? l.name = "" + _n(E) : l.removeAttribute("name");
  }
  function of(l, a, u, c, f, r, p, E) {
    if (r != null && typeof r != "function" && typeof r != "symbol" && typeof r != "boolean" && (l.type = r), a != null || u != null) {
      if (!(r !== "submit" && r !== "reset" || a != null)) {
        nd(l);
        return;
      }
      u = u != null ? "" + _n(u) : "", a = a != null ? "" + _n(a) : u, E || a === l.value || (l.value = a), l.defaultValue = a;
    }
    c = c ?? f, c = typeof c != "function" && typeof c != "symbol" && !!c, l.checked = E ? l.checked : !!c, l.defaultChecked = !!c, p != null && typeof p != "function" && typeof p != "symbol" && typeof p != "boolean" && (l.name = p), nd(l);
  }
  function pc(l, a, u) {
    a === "number" && uf(l.ownerDocument) === l || l.defaultValue === "" + u || (l.defaultValue = "" + u);
  }
  function _o(l, a, u, c) {
    if (l = l.options, a) {
      a = {};
      for (var f = 0; f < u.length; f++)
        a["$" + u[f]] = !0;
      for (u = 0; u < l.length; u++)
        f = a.hasOwnProperty("$" + l[u].value), l[u].selected !== f && (l[u].selected = f), f && c && (l[u].defaultSelected = !0);
    } else {
      for (u = "" + _n(u), a = null, f = 0; f < l.length; f++) {
        if (l[f].value === u) {
          l[f].selected = !0, c && (l[f].defaultSelected = !0);
          return;
        }
        a !== null || l[f].disabled || (a = l[f]);
      }
      a !== null && (a.selected = !0);
    }
  }
  function Dm(l, a, u) {
    if (a != null && (a = "" + _n(a), a !== l.value && (l.value = a), u == null)) {
      l.defaultValue !== a && (l.defaultValue = a);
      return;
    }
    l.defaultValue = u != null ? "" + _n(u) : "";
  }
  function _m(l, a, u, c) {
    if (a == null) {
      if (c != null) {
        if (u != null) throw Error(g(92));
        if (Vt(c)) {
          if (1 < c.length) throw Error(g(93));
          c = c[0];
        }
        u = c;
      }
      u == null && (u = ""), a = u;
    }
    u = _n(a), l.defaultValue = u, c = l.textContent, c === u && c !== "" && c !== null && (l.value = c), nd(l);
  }
  function Wa(l, a) {
    if (a) {
      var u = l.firstChild;
      if (u && u === l.lastChild && u.nodeType === 3) {
        u.nodeValue = a;
        return;
      }
    }
    l.textContent = a;
  }
  var D0 = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function _0(l, a, u) {
    var c = a.indexOf("--") === 0;
    u == null || typeof u == "boolean" || u === "" ? c ? l.setProperty(a, "") : a === "float" ? l.cssFloat = "" : l[a] = "" : c ? l.setProperty(a, u) : typeof u != "number" || u === 0 || D0.has(a) ? a === "float" ? l.cssFloat = u : l[a] = ("" + u).trim() : l[a] = u + "px";
  }
  function R0(l, a, u) {
    if (a != null && typeof a != "object")
      throw Error(g(62));
    if (l = l.style, u != null) {
      for (var c in u)
        !u.hasOwnProperty(c) || a != null && a.hasOwnProperty(c) || (c.indexOf("--") === 0 ? l.setProperty(c, "") : c === "float" ? l.cssFloat = "" : l[c] = "");
      for (var f in a)
        c = a[f], a.hasOwnProperty(f) && u[f] !== c && _0(l, f, c);
    } else
      for (var r in a)
        a.hasOwnProperty(r) && _0(l, r, a[r]);
  }
  function Rm(l) {
    if (l.indexOf("-") === -1) return !1;
    switch (l) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var c1 = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), sf = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Pn(l) {
    return sf.test("" + l) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : l;
  }
  function va() {
  }
  var ad = null;
  function ud(l) {
    return l = l.target || l.srcElement || window, l.correspondingUseElement && (l = l.correspondingUseElement), l.nodeType === 3 ? l.parentNode : l;
  }
  var Fa = null, yc = null;
  function ff(l) {
    var a = dc(l);
    if (a && (l = a.stateNode)) {
      var u = l[Wl] || null;
      e: switch (l = a.stateNode, a.type) {
        case "input":
          if (cf(
            l,
            u.value,
            u.defaultValue,
            u.defaultValue,
            u.checked,
            u.defaultChecked,
            u.type,
            u.name
          ), a = u.name, u.type === "radio" && a != null) {
            for (u = l; u.parentNode; ) u = u.parentNode;
            for (u = u.querySelectorAll(
              'input[name="' + Rn(
                "" + a
              ) + '"][type="radio"]'
            ), a = 0; a < u.length; a++) {
              var c = u[a];
              if (c !== l && c.form === l.form) {
                var f = c[Wl] || null;
                if (!f) throw Error(g(90));
                cf(
                  c,
                  f.value,
                  f.defaultValue,
                  f.defaultValue,
                  f.checked,
                  f.defaultChecked,
                  f.type,
                  f.name
                );
              }
            }
            for (a = 0; a < u.length; a++)
              c = u[a], c.form === l.form && Om(c);
          }
          break e;
        case "textarea":
          Dm(l, u.value, u.defaultValue);
          break e;
        case "select":
          a = u.value, a != null && _o(l, !!u.multiple, a, !1);
      }
    }
  }
  var Ro = !1;
  function Mm(l, a, u) {
    if (Ro) return l(a, u);
    Ro = !0;
    try {
      var c = l(a);
      return c;
    } finally {
      if (Ro = !1, (Fa !== null || yc !== null) && (fs(), Fa && (a = Fa, l = yc, yc = Fa = null, ff(a), l)))
        for (a = 0; a < l.length; a++) ff(l[a]);
    }
  }
  function gl(l, a) {
    var u = l.stateNode;
    if (u === null) return null;
    var c = u[Wl] || null;
    if (c === null) return null;
    u = c[a];
    e: switch (a) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (c = !c.disabled) || (l = l.type, c = !(l === "button" || l === "input" || l === "select" || l === "textarea")), l = !c;
        break e;
      default:
        l = !1;
    }
    if (l) return null;
    if (u && typeof u != "function")
      throw Error(
        g(231, a, typeof u)
      );
    return u;
  }
  var Xu = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), rf = !1;
  if (Xu)
    try {
      var Mo = {};
      Object.defineProperty(Mo, "passive", {
        get: function() {
          rf = !0;
        }
      }), window.addEventListener("test", Mo, Mo), window.removeEventListener("test", Mo, Mo);
    } catch {
      rf = !1;
    }
  var Lu = null, Cm = null, id = null;
  function Um() {
    if (id) return id;
    var l, a = Cm, u = a.length, c, f = "value" in Lu ? Lu.value : Lu.textContent, r = f.length;
    for (l = 0; l < u && a[l] === f[l]; l++) ;
    var p = u - l;
    for (c = 1; c <= p && a[u - c] === f[r - c]; c++) ;
    return id = f.slice(l, 1 < c ? 1 - c : void 0);
  }
  function cd(l) {
    var a = l.keyCode;
    return "charCode" in l ? (l = l.charCode, l === 0 && a === 13 && (l = 13)) : l = a, l === 10 && (l = 13), 32 <= l || l === 13 ? l : 0;
  }
  function df() {
    return !0;
  }
  function M0() {
    return !1;
  }
  function Hl(l) {
    function a(u, c, f, r, p) {
      this._reactName = u, this._targetInst = f, this.type = c, this.nativeEvent = r, this.target = p, this.currentTarget = null;
      for (var E in l)
        l.hasOwnProperty(E) && (u = l[E], this[E] = u ? u(r) : r[E]);
      return this.isDefaultPrevented = (r.defaultPrevented != null ? r.defaultPrevented : r.returnValue === !1) ? df : M0, this.isPropagationStopped = M0, this;
    }
    return ae(a.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var u = this.nativeEvent;
        u && (u.preventDefault ? u.preventDefault() : typeof u.returnValue != "unknown" && (u.returnValue = !1), this.isDefaultPrevented = df);
      },
      stopPropagation: function() {
        var u = this.nativeEvent;
        u && (u.stopPropagation ? u.stopPropagation() : typeof u.cancelBubble != "unknown" && (u.cancelBubble = !0), this.isPropagationStopped = df);
      },
      persist: function() {
      },
      isPersistent: df
    }), a;
  }
  var Ti = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(l) {
      return l.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, hf = Hl(Ti), Co = ae({}, Ti, { view: 0, detail: 0 }), o1 = Hl(Co), xm, Nm, mf, od = ae({}, Co, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: ea,
    button: 0,
    buttons: 0,
    relatedTarget: function(l) {
      return l.relatedTarget === void 0 ? l.fromElement === l.srcElement ? l.toElement : l.fromElement : l.relatedTarget;
    },
    movementX: function(l) {
      return "movementX" in l ? l.movementX : (l !== mf && (mf && l.type === "mousemove" ? (xm = l.screenX - mf.screenX, Nm = l.screenY - mf.screenY) : Nm = xm = 0, mf = l), xm);
    },
    movementY: function(l) {
      return "movementY" in l ? l.movementY : Nm;
    }
  }), Uo = Hl(od), C0 = ae({}, od, { dataTransfer: 0 }), U0 = Hl(C0), x0 = ae({}, Co, { relatedTarget: 0 }), sd = Hl(x0), Hm = ae({}, Ti, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), N0 = Hl(Hm), gc = ae({}, Ti, {
    clipboardData: function(l) {
      return "clipboardData" in l ? l.clipboardData : window.clipboardData;
    }
  }), vc = Hl(gc), ba = ae({}, Ti, { data: 0 }), H0 = Hl(ba), Bm = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, Ia = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, B0 = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function Sa(l) {
    var a = this.nativeEvent;
    return a.getModifierState ? a.getModifierState(l) : (l = B0[l]) ? !!a[l] : !1;
  }
  function ea() {
    return Sa;
  }
  var fd = ae({}, Co, {
    key: function(l) {
      if (l.key) {
        var a = Bm[l.key] || l.key;
        if (a !== "Unidentified") return a;
      }
      return l.type === "keypress" ? (l = cd(l), l === 13 ? "Enter" : String.fromCharCode(l)) : l.type === "keydown" || l.type === "keyup" ? Ia[l.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: ea,
    charCode: function(l) {
      return l.type === "keypress" ? cd(l) : 0;
    },
    keyCode: function(l) {
      return l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
    },
    which: function(l) {
      return l.type === "keypress" ? cd(l) : l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
    }
  }), rd = Hl(fd), qm = ae({}, od, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), Ea = Hl(qm), s1 = ae({}, Co, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: ea
  }), q0 = Hl(s1), j0 = ae({}, Ti, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), f1 = Hl(j0), jm = ae({}, od, {
    deltaX: function(l) {
      return "deltaX" in l ? l.deltaX : "wheelDeltaX" in l ? -l.wheelDeltaX : 0;
    },
    deltaY: function(l) {
      return "deltaY" in l ? l.deltaY : "wheelDeltaY" in l ? -l.wheelDeltaY : "wheelDelta" in l ? -l.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), r1 = Hl(jm), w0 = ae({}, Ti, {
    newState: 0,
    oldState: 0
  }), wm = Hl(w0), dd = [9, 13, 27, 32], xo = Xu && "CompositionEvent" in window, bc = null;
  Xu && "documentMode" in document && (bc = document.documentMode);
  var Xl = Xu && "TextEvent" in window && !bc, Ym = Xu && (!xo || bc && 8 < bc && 11 >= bc), pf = " ", Ai = !1;
  function hd(l, a) {
    switch (l) {
      case "keyup":
        return dd.indexOf(a.keyCode) !== -1;
      case "keydown":
        return a.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Gm(l) {
    return l = l.detail, typeof l == "object" && "data" in l ? l.data : null;
  }
  var Sc = !1;
  function Y0(l, a) {
    switch (l) {
      case "compositionend":
        return Gm(a);
      case "keypress":
        return a.which !== 32 ? null : (Ai = !0, pf);
      case "textInput":
        return l = a.data, l === pf && Ai ? null : l;
      default:
        return null;
    }
  }
  function d1(l, a) {
    if (Sc)
      return l === "compositionend" || !xo && hd(l, a) ? (l = Um(), id = Cm = Lu = null, Sc = !1, l) : null;
    switch (l) {
      case "paste":
        return null;
      case "keypress":
        if (!(a.ctrlKey || a.altKey || a.metaKey) || a.ctrlKey && a.altKey) {
          if (a.char && 1 < a.char.length)
            return a.char;
          if (a.which) return String.fromCharCode(a.which);
        }
        return null;
      case "compositionend":
        return Ym && a.locale !== "ko" ? null : a.data;
      default:
        return null;
    }
  }
  var Xm = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function Pa(l) {
    var a = l && l.nodeName && l.nodeName.toLowerCase();
    return a === "input" ? !!Xm[l.type] : a === "textarea";
  }
  function Lm(l, a, u, c) {
    Fa ? yc ? yc.push(c) : yc = [c] : Fa = c, a = rr(a, "onChange"), 0 < a.length && (u = new hf(
      "onChange",
      "change",
      null,
      u,
      c
    ), l.push({ event: u, listeners: a }));
  }
  var Ec = null, zi = null;
  function Tc(l) {
    Hg(l, 0);
  }
  function No(l) {
    var a = Ao(l);
    if (Om(a)) return l;
  }
  function Vm(l, a) {
    if (l === "change") return a;
  }
  var md = !1;
  if (Xu) {
    var Fl;
    if (Xu) {
      var Ta = "oninput" in document;
      if (!Ta) {
        var Qm = document.createElement("div");
        Qm.setAttribute("oninput", "return;"), Ta = typeof Qm.oninput == "function";
      }
      Fl = Ta;
    } else Fl = !1;
    md = Fl && (!document.documentMode || 9 < document.documentMode);
  }
  function pd() {
    Ec && (Ec.detachEvent("onpropertychange", yd), zi = Ec = null);
  }
  function yd(l) {
    if (l.propertyName === "value" && No(zi)) {
      var a = [];
      Lm(
        a,
        zi,
        l,
        ud(l)
      ), Mm(Tc, a);
    }
  }
  function G0(l, a, u) {
    l === "focusin" ? (pd(), Ec = a, zi = u, Ec.attachEvent("onpropertychange", yd)) : l === "focusout" && pd();
  }
  function X0(l) {
    if (l === "selectionchange" || l === "keyup" || l === "keydown")
      return No(zi);
  }
  function Oi(l, a) {
    if (l === "click") return No(a);
  }
  function Ac(l, a) {
    if (l === "input" || l === "change")
      return No(a);
  }
  function L0(l, a) {
    return l === a && (l !== 0 || 1 / l === 1 / a) || l !== l && a !== a;
  }
  var Ll = typeof Object.is == "function" ? Object.is : L0;
  function ta(l, a) {
    if (Ll(l, a)) return !0;
    if (typeof l != "object" || l === null || typeof a != "object" || a === null)
      return !1;
    var u = Object.keys(l), c = Object.keys(a);
    if (u.length !== c.length) return !1;
    for (c = 0; c < u.length; c++) {
      var f = u[c];
      if (!ym.call(a, f) || !Ll(l[f], a[f]))
        return !1;
    }
    return !0;
  }
  function Zm(l) {
    for (; l && l.firstChild; ) l = l.firstChild;
    return l;
  }
  function Jm(l, a) {
    var u = Zm(l);
    l = 0;
    for (var c; u; ) {
      if (u.nodeType === 3) {
        if (c = l + u.textContent.length, l <= a && c >= a)
          return { node: u, offset: a - l };
        l = c;
      }
      e: {
        for (; u; ) {
          if (u.nextSibling) {
            u = u.nextSibling;
            break e;
          }
          u = u.parentNode;
        }
        u = void 0;
      }
      u = Zm(u);
    }
  }
  function zc(l, a) {
    return l && a ? l === a ? !0 : l && l.nodeType === 3 ? !1 : a && a.nodeType === 3 ? zc(l, a.parentNode) : "contains" in l ? l.contains(a) : l.compareDocumentPosition ? !!(l.compareDocumentPosition(a) & 16) : !1 : !1;
  }
  function Di(l) {
    l = l != null && l.ownerDocument != null && l.ownerDocument.defaultView != null ? l.ownerDocument.defaultView : window;
    for (var a = uf(l.document); a instanceof l.HTMLIFrameElement; ) {
      try {
        var u = typeof a.contentWindow.location.href == "string";
      } catch {
        u = !1;
      }
      if (u) l = a.contentWindow;
      else break;
      a = uf(l.document);
    }
    return a;
  }
  function yf(l) {
    var a = l && l.nodeName && l.nodeName.toLowerCase();
    return a && (a === "input" && (l.type === "text" || l.type === "search" || l.type === "tel" || l.type === "url" || l.type === "password") || a === "textarea" || l.contentEditable === "true");
  }
  var gf = Xu && "documentMode" in document && 11 >= document.documentMode, _i = null, Ho = null, la = null, Aa = !1;
  function gd(l, a, u) {
    var c = u.window === u ? u.document : u.nodeType === 9 ? u : u.ownerDocument;
    Aa || _i == null || _i !== uf(c) || (c = _i, "selectionStart" in c && yf(c) ? c = { start: c.selectionStart, end: c.selectionEnd } : (c = (c.ownerDocument && c.ownerDocument.defaultView || window).getSelection(), c = {
      anchorNode: c.anchorNode,
      anchorOffset: c.anchorOffset,
      focusNode: c.focusNode,
      focusOffset: c.focusOffset
    }), la && ta(la, c) || (la = c, c = rr(Ho, "onSelect"), 0 < c.length && (a = new hf(
      "onSelect",
      "select",
      null,
      a,
      u
    ), l.push({ event: a, listeners: c }), a.target = _i)));
  }
  function Vu(l, a) {
    var u = {};
    return u[l.toLowerCase()] = a.toLowerCase(), u["Webkit" + l] = "webkit" + a, u["Moz" + l] = "moz" + a, u;
  }
  var za = {
    animationend: Vu("Animation", "AnimationEnd"),
    animationiteration: Vu("Animation", "AnimationIteration"),
    animationstart: Vu("Animation", "AnimationStart"),
    transitionrun: Vu("Transition", "TransitionRun"),
    transitionstart: Vu("Transition", "TransitionStart"),
    transitioncancel: Vu("Transition", "TransitionCancel"),
    transitionend: Vu("Transition", "TransitionEnd")
  }, Bo = {}, Ri = {};
  Xu && (Ri = document.createElement("div").style, "AnimationEvent" in window || (delete za.animationend.animation, delete za.animationiteration.animation, delete za.animationstart.animation), "TransitionEvent" in window || delete za.transitionend.transition);
  function nt(l) {
    if (Bo[l]) return Bo[l];
    if (!za[l]) return l;
    var a = za[l], u;
    for (u in a)
      if (a.hasOwnProperty(u) && u in Ri)
        return Bo[l] = a[u];
    return l;
  }
  var vf = nt("animationend"), Km = nt("animationiteration"), vd = nt("animationstart"), Oc = nt("transitionrun"), bf = nt("transitionstart"), eu = nt("transitioncancel"), V0 = nt("transitionend"), tu = /* @__PURE__ */ new Map(), qo = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  qo.push("scrollEnd");
  function Il(l, a) {
    tu.set(l, a), Ei(a, [l]);
  }
  var Dc = typeof reportError == "function" ? reportError : function(l) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var a = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof l == "object" && l !== null && typeof l.message == "string" ? String(l.message) : String(l),
        error: l
      });
      if (!window.dispatchEvent(a)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", l);
      return;
    }
    console.error(l);
  }, Ut = [], vl = 0, na = 0;
  function Mn() {
    for (var l = vl, a = na = vl = 0; a < l; ) {
      var u = Ut[a];
      Ut[a++] = null;
      var c = Ut[a];
      Ut[a++] = null;
      var f = Ut[a];
      Ut[a++] = null;
      var r = Ut[a];
      if (Ut[a++] = null, c !== null && f !== null) {
        var p = c.pending;
        p === null ? f.next = f : (f.next = p.next, p.next = f), c.pending = f;
      }
      r !== 0 && bd(u, f, r);
    }
  }
  function Cn(l, a, u, c) {
    Ut[vl++] = l, Ut[vl++] = a, Ut[vl++] = u, Ut[vl++] = c, na |= c, l.lanes |= c, l = l.alternate, l !== null && (l.lanes |= c);
  }
  function aa(l, a, u, c) {
    return Cn(l, a, u, c), Sf(l);
  }
  function Qu(l, a) {
    return Cn(l, null, null, a), Sf(l);
  }
  function bd(l, a, u) {
    l.lanes |= u;
    var c = l.alternate;
    c !== null && (c.lanes |= u);
    for (var f = !1, r = l.return; r !== null; )
      r.childLanes |= u, c = r.alternate, c !== null && (c.childLanes |= u), r.tag === 22 && (l = r.stateNode, l === null || l._visibility & 1 || (f = !0)), l = r, r = r.return;
    return l.tag === 3 ? (r = l.stateNode, f && a !== null && (f = 31 - kl(u), l = r.hiddenUpdates, c = l[f], c === null ? l[f] = [a] : c.push(a), a.lane = u | 536870912), r) : null;
  }
  function Sf(l) {
    if (50 < ss)
      throw ss = 0, lr = null, Error(g(185));
    for (var a = l.return; a !== null; )
      l = a, a = l.return;
    return l.tag === 3 ? l.stateNode : null;
  }
  var Pl = {};
  function Q0(l, a, u, c) {
    this.tag = l, this.key = u, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = a, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = c, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Zt(l, a, u, c) {
    return new Q0(l, a, u, c);
  }
  function _c(l) {
    return l = l.prototype, !(!l || !l.isReactComponent);
  }
  function Zu(l, a) {
    var u = l.alternate;
    return u === null ? (u = Zt(
      l.tag,
      a,
      l.key,
      l.mode
    ), u.elementType = l.elementType, u.type = l.type, u.stateNode = l.stateNode, u.alternate = l, l.alternate = u) : (u.pendingProps = a, u.type = l.type, u.flags = 0, u.subtreeFlags = 0, u.deletions = null), u.flags = l.flags & 65011712, u.childLanes = l.childLanes, u.lanes = l.lanes, u.child = l.child, u.memoizedProps = l.memoizedProps, u.memoizedState = l.memoizedState, u.updateQueue = l.updateQueue, a = l.dependencies, u.dependencies = a === null ? null : { lanes: a.lanes, firstContext: a.firstContext }, u.sibling = l.sibling, u.index = l.index, u.ref = l.ref, u.refCleanup = l.refCleanup, u;
  }
  function $m(l, a) {
    l.flags &= 65011714;
    var u = l.alternate;
    return u === null ? (l.childLanes = 0, l.lanes = a, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = u.childLanes, l.lanes = u.lanes, l.child = u.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = u.memoizedProps, l.memoizedState = u.memoizedState, l.updateQueue = u.updateQueue, l.type = u.type, a = u.dependencies, l.dependencies = a === null ? null : {
      lanes: a.lanes,
      firstContext: a.firstContext
    }), l;
  }
  function Sd(l, a, u, c, f, r) {
    var p = 0;
    if (c = l, typeof l == "function") _c(l) && (p = 1);
    else if (typeof l == "string")
      p = gy(
        l,
        u,
        fe.current
      ) ? 26 : l === "html" || l === "head" || l === "body" ? 27 : 5;
    else
      e: switch (l) {
        case Dt:
          return l = Zt(31, u, a, f), l.elementType = Dt, l.lanes = r, l;
        case Ct:
          return Ju(u.children, f, r, a);
        case Ze:
          p = 8, f |= 24;
          break;
        case Je:
          return l = Zt(12, u, a, f | 2), l.elementType = Je, l.lanes = r, l;
        case Gl:
          return l = Zt(13, u, a, f), l.elementType = Gl, l.lanes = r, l;
        case nl:
          return l = Zt(19, u, a, f), l.elementType = nl, l.lanes = r, l;
        default:
          if (typeof l == "object" && l !== null)
            switch (l.$$typeof) {
              case wt:
                p = 10;
                break e;
              case mn:
                p = 9;
                break e;
              case ol:
                p = 11;
                break e;
              case I:
                p = 14;
                break e;
              case me:
                p = 16, c = null;
                break e;
            }
          p = 29, u = Error(
            g(130, l === null ? "null" : typeof l, "")
          ), c = null;
      }
    return a = Zt(p, u, a, f), a.elementType = l, a.type = c, a.lanes = r, a;
  }
  function Ju(l, a, u, c) {
    return l = Zt(7, l, c, a), l.lanes = u, l;
  }
  function jo(l, a, u) {
    return l = Zt(6, l, null, a), l.lanes = u, l;
  }
  function km(l) {
    var a = Zt(18, null, null, 0);
    return a.stateNode = l, a;
  }
  function Ed(l, a, u) {
    return a = Zt(
      4,
      l.children !== null ? l.children : [],
      l.key,
      a
    ), a.lanes = u, a.stateNode = {
      containerInfo: l.containerInfo,
      pendingChildren: null,
      implementation: l.implementation
    }, a;
  }
  var Wm = /* @__PURE__ */ new WeakMap();
  function Un(l, a) {
    if (typeof l == "object" && l !== null) {
      var u = Wm.get(l);
      return u !== void 0 ? u : (a = {
        value: l,
        source: a,
        stack: Qr(a)
      }, Wm.set(l, a), a);
    }
    return {
      value: l,
      source: a,
      stack: Qr(a)
    };
  }
  var xn = [], Rc = 0, Ef = null, Ft = 0, yn = [], en = 0, Oa = null, gn = 1, Da = "";
  function ua(l, a) {
    xn[Rc++] = Ft, xn[Rc++] = Ef, Ef = l, Ft = a;
  }
  function Fm(l, a, u) {
    yn[en++] = gn, yn[en++] = Da, yn[en++] = Oa, Oa = l;
    var c = gn;
    l = Da;
    var f = 32 - kl(c) - 1;
    c &= ~(1 << f), u += 1;
    var r = 32 - kl(a) + f;
    if (30 < r) {
      var p = f - f % 5;
      r = (c & (1 << p) - 1).toString(32), c >>= p, f -= p, gn = 1 << 32 - kl(a) + f | u << f | c, Da = r + l;
    } else
      gn = 1 << r | u << f | c, Da = l;
  }
  function wo(l) {
    l.return !== null && (ua(l, 1), Fm(l, 1, 0));
  }
  function Td(l) {
    for (; l === Ef; )
      Ef = xn[--Rc], xn[Rc] = null, Ft = xn[--Rc], xn[Rc] = null;
    for (; l === Oa; )
      Oa = yn[--en], yn[en] = null, Da = yn[--en], yn[en] = null, gn = yn[--en], yn[en] = null;
  }
  function Tf(l, a) {
    yn[en++] = gn, yn[en++] = Da, yn[en++] = Oa, gn = a.id, Da = a.overflow, Oa = l;
  }
  var bl = null, Et = null, Le = !1, lu = null, sl = !1, nu = Error(g(519));
  function ia(l) {
    var a = Error(
      g(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Go(Un(a, l)), nu;
  }
  function Af(l) {
    var a = l.stateNode, u = l.type, c = l.memoizedProps;
    switch (a[ht] = l, a[Wl] = c, u) {
      case "dialog":
        Xe("cancel", a), Xe("close", a);
        break;
      case "iframe":
      case "object":
      case "embed":
        Xe("load", a);
        break;
      case "video":
      case "audio":
        for (u = 0; u < ps.length; u++)
          Xe(ps[u], a);
        break;
      case "source":
        Xe("error", a);
        break;
      case "img":
      case "image":
      case "link":
        Xe("error", a), Xe("load", a);
        break;
      case "details":
        Xe("toggle", a);
        break;
      case "input":
        Xe("invalid", a), of(
          a,
          c.value,
          c.defaultValue,
          c.checked,
          c.defaultChecked,
          c.type,
          c.name,
          !0
        );
        break;
      case "select":
        Xe("invalid", a);
        break;
      case "textarea":
        Xe("invalid", a), _m(a, c.value, c.defaultValue, c.children);
    }
    u = c.children, typeof u != "string" && typeof u != "number" && typeof u != "bigint" || a.textContent === "" + u || c.suppressHydrationWarning === !0 || iy(a.textContent, u) ? (c.popover != null && (Xe("beforetoggle", a), Xe("toggle", a)), c.onScroll != null && Xe("scroll", a), c.onScrollEnd != null && Xe("scrollend", a), c.onClick != null && (a.onclick = va), a = !0) : a = !1, a || ia(l, !0);
  }
  function Yo(l) {
    for (bl = l.return; bl; )
      switch (bl.tag) {
        case 5:
        case 31:
        case 13:
          sl = !1;
          return;
        case 27:
        case 3:
          sl = !0;
          return;
        default:
          bl = bl.return;
      }
  }
  function au(l) {
    if (l !== bl) return !1;
    if (!Le) return Yo(l), Le = !0, !1;
    var a = l.tag, u;
    if ((u = a !== 3 && a !== 27) && ((u = a === 5) && (u = l.type, u = !(u !== "form" && u !== "button") || gs(l.type, l.memoizedProps)), u = !u), u && Et && ia(l), Yo(l), a === 13) {
      if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(g(317));
      Et = Oh(l);
    } else if (a === 31) {
      if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(g(317));
      Et = Oh(l);
    } else
      a === 27 ? (a = Et, ja(l.type) ? (l = mr, mr = null, Et = l) : Et = a) : Et = bl ? rn(l.stateNode.nextSibling) : null;
    return !0;
  }
  function Mi() {
    Et = bl = null, Le = !1;
  }
  function Im() {
    var l = lu;
    return l !== null && (Xt === null ? Xt = l : Xt.push.apply(
      Xt,
      l
    ), lu = null), l;
  }
  function Go(l) {
    lu === null ? lu = [l] : lu.push(l);
  }
  var Ad = Q(null), Ku = null, _a = null;
  function tn(l, a, u) {
    se(Ad, a._currentValue), a._currentValue = u;
  }
  function Ra(l) {
    l._currentValue = Ad.current, ne(Ad);
  }
  function zd(l, a, u) {
    for (; l !== null; ) {
      var c = l.alternate;
      if ((l.childLanes & a) !== a ? (l.childLanes |= a, c !== null && (c.childLanes |= a)) : c !== null && (c.childLanes & a) !== a && (c.childLanes |= a), l === u) break;
      l = l.return;
    }
  }
  function uu(l, a, u, c) {
    var f = l.child;
    for (f !== null && (f.return = l); f !== null; ) {
      var r = f.dependencies;
      if (r !== null) {
        var p = f.child;
        r = r.firstContext;
        e: for (; r !== null; ) {
          var E = r;
          r = f;
          for (var O = 0; O < a.length; O++)
            if (E.context === a[O]) {
              r.lanes |= u, E = r.alternate, E !== null && (E.lanes |= u), zd(
                r.return,
                u,
                l
              ), c || (p = null);
              break e;
            }
          r = E.next;
        }
      } else if (f.tag === 18) {
        if (p = f.return, p === null) throw Error(g(341));
        p.lanes |= u, r = p.alternate, r !== null && (r.lanes |= u), zd(p, u, l), p = null;
      } else p = f.child;
      if (p !== null) p.return = f;
      else
        for (p = f; p !== null; ) {
          if (p === l) {
            p = null;
            break;
          }
          if (f = p.sibling, f !== null) {
            f.return = p.return, p = f;
            break;
          }
          p = p.return;
        }
      f = p;
    }
  }
  function Sl(l, a, u, c) {
    l = null;
    for (var f = a, r = !1; f !== null; ) {
      if (!r) {
        if ((f.flags & 524288) !== 0) r = !0;
        else if ((f.flags & 262144) !== 0) break;
      }
      if (f.tag === 10) {
        var p = f.alternate;
        if (p === null) throw Error(g(387));
        if (p = p.memoizedProps, p !== null) {
          var E = f.type;
          Ll(f.pendingProps.value, p.value) || (l !== null ? l.push(E) : l = [E]);
        }
      } else if (f === _t.current) {
        if (p = f.alternate, p === null) throw Error(g(387));
        p.memoizedState.memoizedState !== f.memoizedState.memoizedState && (l !== null ? l.push(gr) : l = [gr]);
      }
      f = f.return;
    }
    l !== null && uu(
      a,
      l,
      u,
      c
    ), a.flags |= 262144;
  }
  function Mc(l) {
    for (l = l.firstContext; l !== null; ) {
      if (!Ll(
        l.context._currentValue,
        l.memoizedValue
      ))
        return !0;
      l = l.next;
    }
    return !1;
  }
  function ze(l) {
    Ku = l, _a = null, l = l.dependencies, l !== null && (l.firstContext = null);
  }
  function $(l) {
    return zf(Ku, l);
  }
  function $u(l, a) {
    return Ku === null && ze(l), zf(l, a);
  }
  function zf(l, a) {
    var u = a._currentValue;
    if (a = { context: a, memoizedValue: u, next: null }, _a === null) {
      if (l === null) throw Error(g(308));
      _a = a, l.dependencies = { lanes: 0, firstContext: a }, l.flags |= 524288;
    } else _a = _a.next = a;
    return u;
  }
  var Jt = typeof AbortController < "u" ? AbortController : function() {
    var l = [], a = this.signal = {
      aborted: !1,
      addEventListener: function(u, c) {
        l.push(c);
      }
    };
    this.abort = function() {
      a.aborted = !0, l.forEach(function(u) {
        return u();
      });
    };
  }, Pm = b.unstable_scheduleCallback, ep = b.unstable_NormalPriority, It = {
    $$typeof: wt,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function Of() {
    return {
      controller: new Jt(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Df(l) {
    l.refCount--, l.refCount === 0 && Pm(ep, function() {
      l.controller.abort();
    });
  }
  var Cc = null, _f = 0, Ci = 0, al = null;
  function ot(l, a) {
    if (Cc === null) {
      var u = Cc = [];
      _f = 0, Ci = gh(), al = {
        status: "pending",
        value: void 0,
        then: function(c) {
          u.push(c);
        }
      };
    }
    return _f++, a.then(Rf, Rf), a;
  }
  function Rf() {
    if (--_f === 0 && Cc !== null) {
      al !== null && (al.status = "fulfilled");
      var l = Cc;
      Cc = null, Ci = 0, al = null;
      for (var a = 0; a < l.length; a++) (0, l[a])();
    }
  }
  function Mf(l, a) {
    var u = [], c = {
      status: "pending",
      value: null,
      reason: null,
      then: function(f) {
        u.push(f);
      }
    };
    return l.then(
      function() {
        c.status = "fulfilled", c.value = a;
        for (var f = 0; f < u.length; f++) (0, u[f])(a);
      },
      function(f) {
        for (c.status = "rejected", c.reason = f, f = 0; f < u.length; f++)
          (0, u[f])(void 0);
      }
    ), c;
  }
  var ku = C.S;
  C.S = function(l, a) {
    Kp = Nl(), typeof a == "object" && a !== null && typeof a.then == "function" && ot(l, a), ku !== null && ku(l, a);
  };
  var Nn = Q(null);
  function Hn() {
    var l = Nn.current;
    return l !== null ? l : pt.pooledCache;
  }
  function Xo(l, a) {
    a === null ? se(Nn, Nn.current) : se(Nn, a.pool);
  }
  function Uc() {
    var l = Hn();
    return l === null ? null : { parent: It._currentValue, pool: l };
  }
  var Ui = Error(g(460)), xc = Error(g(474)), Lo = Error(g(542)), Nc = { then: function() {
  } };
  function tp(l) {
    return l = l.status, l === "fulfilled" || l === "rejected";
  }
  function lp(l, a, u) {
    switch (u = l[u], u === void 0 ? l.push(a) : u !== a && (a.then(va, va), a = u), a.status) {
      case "fulfilled":
        return a.value;
      case "rejected":
        throw l = a.reason, Od(l), l;
      default:
        if (typeof a.status == "string") a.then(va, va);
        else {
          if (l = pt, l !== null && 100 < l.shellSuspendCounter)
            throw Error(g(482));
          l = a, l.status = "pending", l.then(
            function(c) {
              if (a.status === "pending") {
                var f = a;
                f.status = "fulfilled", f.value = c;
              }
            },
            function(c) {
              if (a.status === "pending") {
                var f = a;
                f.status = "rejected", f.reason = c;
              }
            }
          );
        }
        switch (a.status) {
          case "fulfilled":
            return a.value;
          case "rejected":
            throw l = a.reason, Od(l), l;
        }
        throw Ni = a, Ui;
    }
  }
  function xi(l) {
    try {
      var a = l._init;
      return a(l._payload);
    } catch (u) {
      throw u !== null && typeof u == "object" && typeof u.then == "function" ? (Ni = u, Ui) : u;
    }
  }
  var Ni = null;
  function np() {
    if (Ni === null) throw Error(g(459));
    var l = Ni;
    return Ni = null, l;
  }
  function Od(l) {
    if (l === Ui || l === Lo)
      throw Error(g(483));
  }
  var Hi = null, Hc = 0;
  function Cf(l) {
    var a = Hc;
    return Hc += 1, Hi === null && (Hi = []), lp(Hi, l, a);
  }
  function Vo(l, a) {
    a = a.props.ref, l.ref = a !== void 0 ? a : null;
  }
  function Uf(l, a) {
    throw a.$$typeof === Te ? Error(g(525)) : (l = Object.prototype.toString.call(a), Error(
      g(
        31,
        l === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : l
      )
    ));
  }
  function Z0(l) {
    function a(U, R) {
      if (l) {
        var N = U.deletions;
        N === null ? (U.deletions = [R], U.flags |= 16) : N.push(R);
      }
    }
    function u(U, R) {
      if (!l) return null;
      for (; R !== null; )
        a(U, R), R = R.sibling;
      return null;
    }
    function c(U) {
      for (var R = /* @__PURE__ */ new Map(); U !== null; )
        U.key !== null ? R.set(U.key, U) : R.set(U.index, U), U = U.sibling;
      return R;
    }
    function f(U, R) {
      return U = Zu(U, R), U.index = 0, U.sibling = null, U;
    }
    function r(U, R, N) {
      return U.index = N, l ? (N = U.alternate, N !== null ? (N = N.index, N < R ? (U.flags |= 67108866, R) : N) : (U.flags |= 67108866, R)) : (U.flags |= 1048576, R);
    }
    function p(U) {
      return l && U.alternate === null && (U.flags |= 67108866), U;
    }
    function E(U, R, N, Z) {
      return R === null || R.tag !== 6 ? (R = jo(N, U.mode, Z), R.return = U, R) : (R = f(R, N), R.return = U, R);
    }
    function O(U, R, N, Z) {
      var de = N.type;
      return de === Ct ? L(
        U,
        R,
        N.props.children,
        Z,
        N.key
      ) : R !== null && (R.elementType === de || typeof de == "object" && de !== null && de.$$typeof === me && xi(de) === R.type) ? (R = f(R, N.props), Vo(R, N), R.return = U, R) : (R = Sd(
        N.type,
        N.key,
        N.props,
        null,
        U.mode,
        Z
      ), Vo(R, N), R.return = U, R);
    }
    function H(U, R, N, Z) {
      return R === null || R.tag !== 4 || R.stateNode.containerInfo !== N.containerInfo || R.stateNode.implementation !== N.implementation ? (R = Ed(N, U.mode, Z), R.return = U, R) : (R = f(R, N.children || []), R.return = U, R);
    }
    function L(U, R, N, Z, de) {
      return R === null || R.tag !== 7 ? (R = Ju(
        N,
        U.mode,
        Z,
        de
      ), R.return = U, R) : (R = f(R, N), R.return = U, R);
    }
    function J(U, R, N) {
      if (typeof R == "string" && R !== "" || typeof R == "number" || typeof R == "bigint")
        return R = jo(
          "" + R,
          U.mode,
          N
        ), R.return = U, R;
      if (typeof R == "object" && R !== null) {
        switch (R.$$typeof) {
          case it:
            return N = Sd(
              R.type,
              R.key,
              R.props,
              null,
              U.mode,
              N
            ), Vo(N, R), N.return = U, N;
          case lt:
            return R = Ed(
              R,
              U.mode,
              N
            ), R.return = U, R;
          case me:
            return R = xi(R), J(U, R, N);
        }
        if (Vt(R) || Ue(R))
          return R = Ju(
            R,
            U.mode,
            N,
            null
          ), R.return = U, R;
        if (typeof R.then == "function")
          return J(U, Cf(R), N);
        if (R.$$typeof === wt)
          return J(
            U,
            $u(U, R),
            N
          );
        Uf(U, R);
      }
      return null;
    }
    function B(U, R, N, Z) {
      var de = R !== null ? R.key : null;
      if (typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint")
        return de !== null ? null : E(U, R, "" + N, Z);
      if (typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case it:
            return N.key === de ? O(U, R, N, Z) : null;
          case lt:
            return N.key === de ? H(U, R, N, Z) : null;
          case me:
            return N = xi(N), B(U, R, N, Z);
        }
        if (Vt(N) || Ue(N))
          return de !== null ? null : L(U, R, N, Z, null);
        if (typeof N.then == "function")
          return B(
            U,
            R,
            Cf(N),
            Z
          );
        if (N.$$typeof === wt)
          return B(
            U,
            R,
            $u(U, N),
            Z
          );
        Uf(U, N);
      }
      return null;
    }
    function Y(U, R, N, Z, de) {
      if (typeof Z == "string" && Z !== "" || typeof Z == "number" || typeof Z == "bigint")
        return U = U.get(N) || null, E(R, U, "" + Z, de);
      if (typeof Z == "object" && Z !== null) {
        switch (Z.$$typeof) {
          case it:
            return U = U.get(
              Z.key === null ? N : Z.key
            ) || null, O(R, U, Z, de);
          case lt:
            return U = U.get(
              Z.key === null ? N : Z.key
            ) || null, H(R, U, Z, de);
          case me:
            return Z = xi(Z), Y(
              U,
              R,
              N,
              Z,
              de
            );
        }
        if (Vt(Z) || Ue(Z))
          return U = U.get(N) || null, L(R, U, Z, de, null);
        if (typeof Z.then == "function")
          return Y(
            U,
            R,
            N,
            Cf(Z),
            de
          );
        if (Z.$$typeof === wt)
          return Y(
            U,
            R,
            N,
            $u(R, Z),
            de
          );
        Uf(R, Z);
      }
      return null;
    }
    function ue(U, R, N, Z) {
      for (var de = null, Fe = null, ce = R, _e = R = 0, Ne = null; ce !== null && _e < N.length; _e++) {
        ce.index > _e ? (Ne = ce, ce = null) : Ne = ce.sibling;
        var tt = B(
          U,
          ce,
          N[_e],
          Z
        );
        if (tt === null) {
          ce === null && (ce = Ne);
          break;
        }
        l && ce && tt.alternate === null && a(U, ce), R = r(tt, R, _e), Fe === null ? de = tt : Fe.sibling = tt, Fe = tt, ce = Ne;
      }
      if (_e === N.length)
        return u(U, ce), Le && ua(U, _e), de;
      if (ce === null) {
        for (; _e < N.length; _e++)
          ce = J(U, N[_e], Z), ce !== null && (R = r(
            ce,
            R,
            _e
          ), Fe === null ? de = ce : Fe.sibling = ce, Fe = ce);
        return Le && ua(U, _e), de;
      }
      for (ce = c(ce); _e < N.length; _e++)
        Ne = Y(
          ce,
          U,
          _e,
          N[_e],
          Z
        ), Ne !== null && (l && Ne.alternate !== null && ce.delete(
          Ne.key === null ? _e : Ne.key
        ), R = r(
          Ne,
          R,
          _e
        ), Fe === null ? de = Ne : Fe.sibling = Ne, Fe = Ne);
      return l && ce.forEach(function(Ga) {
        return a(U, Ga);
      }), Le && ua(U, _e), de;
    }
    function ge(U, R, N, Z) {
      if (N == null) throw Error(g(151));
      for (var de = null, Fe = null, ce = R, _e = R = 0, Ne = null, tt = N.next(); ce !== null && !tt.done; _e++, tt = N.next()) {
        ce.index > _e ? (Ne = ce, ce = null) : Ne = ce.sibling;
        var Ga = B(U, ce, tt.value, Z);
        if (Ga === null) {
          ce === null && (ce = Ne);
          break;
        }
        l && ce && Ga.alternate === null && a(U, ce), R = r(Ga, R, _e), Fe === null ? de = Ga : Fe.sibling = Ga, Fe = Ga, ce = Ne;
      }
      if (tt.done)
        return u(U, ce), Le && ua(U, _e), de;
      if (ce === null) {
        for (; !tt.done; _e++, tt = N.next())
          tt = J(U, tt.value, Z), tt !== null && (R = r(tt, R, _e), Fe === null ? de = tt : Fe.sibling = tt, Fe = tt);
        return Le && ua(U, _e), de;
      }
      for (ce = c(ce); !tt.done; _e++, tt = N.next())
        tt = Y(ce, U, _e, tt.value, Z), tt !== null && (l && tt.alternate !== null && ce.delete(tt.key === null ? _e : tt.key), R = r(tt, R, _e), Fe === null ? de = tt : Fe.sibling = tt, Fe = tt);
      return l && ce.forEach(function(kg) {
        return a(U, kg);
      }), Le && ua(U, _e), de;
    }
    function gt(U, R, N, Z) {
      if (typeof N == "object" && N !== null && N.type === Ct && N.key === null && (N = N.props.children), typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case it:
            e: {
              for (var de = N.key; R !== null; ) {
                if (R.key === de) {
                  if (de = N.type, de === Ct) {
                    if (R.tag === 7) {
                      u(
                        U,
                        R.sibling
                      ), Z = f(
                        R,
                        N.props.children
                      ), Z.return = U, U = Z;
                      break e;
                    }
                  } else if (R.elementType === de || typeof de == "object" && de !== null && de.$$typeof === me && xi(de) === R.type) {
                    u(
                      U,
                      R.sibling
                    ), Z = f(R, N.props), Vo(Z, N), Z.return = U, U = Z;
                    break e;
                  }
                  u(U, R);
                  break;
                } else a(U, R);
                R = R.sibling;
              }
              N.type === Ct ? (Z = Ju(
                N.props.children,
                U.mode,
                Z,
                N.key
              ), Z.return = U, U = Z) : (Z = Sd(
                N.type,
                N.key,
                N.props,
                null,
                U.mode,
                Z
              ), Vo(Z, N), Z.return = U, U = Z);
            }
            return p(U);
          case lt:
            e: {
              for (de = N.key; R !== null; ) {
                if (R.key === de)
                  if (R.tag === 4 && R.stateNode.containerInfo === N.containerInfo && R.stateNode.implementation === N.implementation) {
                    u(
                      U,
                      R.sibling
                    ), Z = f(R, N.children || []), Z.return = U, U = Z;
                    break e;
                  } else {
                    u(U, R);
                    break;
                  }
                else a(U, R);
                R = R.sibling;
              }
              Z = Ed(N, U.mode, Z), Z.return = U, U = Z;
            }
            return p(U);
          case me:
            return N = xi(N), gt(
              U,
              R,
              N,
              Z
            );
        }
        if (Vt(N))
          return ue(
            U,
            R,
            N,
            Z
          );
        if (Ue(N)) {
          if (de = Ue(N), typeof de != "function") throw Error(g(150));
          return N = de.call(N), ge(
            U,
            R,
            N,
            Z
          );
        }
        if (typeof N.then == "function")
          return gt(
            U,
            R,
            Cf(N),
            Z
          );
        if (N.$$typeof === wt)
          return gt(
            U,
            R,
            $u(U, N),
            Z
          );
        Uf(U, N);
      }
      return typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint" ? (N = "" + N, R !== null && R.tag === 6 ? (u(U, R.sibling), Z = f(R, N), Z.return = U, U = Z) : (u(U, R), Z = jo(N, U.mode, Z), Z.return = U, U = Z), p(U)) : u(U, R);
    }
    return function(U, R, N, Z) {
      try {
        Hc = 0;
        var de = gt(
          U,
          R,
          N,
          Z
        );
        return Hi = null, de;
      } catch (ce) {
        if (ce === Ui || ce === Lo) throw ce;
        var Fe = Zt(29, ce, null, U.mode);
        return Fe.lanes = Z, Fe.return = U, Fe;
      } finally {
      }
    };
  }
  var Bi = Z0(!0), ap = Z0(!1), Wu = !1;
  function xf(l) {
    l.updateQueue = {
      baseState: l.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function Dd(l, a) {
    l = l.updateQueue, a.updateQueue === l && (a.updateQueue = {
      baseState: l.baseState,
      firstBaseUpdate: l.firstBaseUpdate,
      lastBaseUpdate: l.lastBaseUpdate,
      shared: l.shared,
      callbacks: null
    });
  }
  function Fu(l) {
    return { lane: l, tag: 0, payload: null, callback: null, next: null };
  }
  function Bn(l, a, u) {
    var c = l.updateQueue;
    if (c === null) return null;
    if (c = c.shared, (et & 2) !== 0) {
      var f = c.pending;
      return f === null ? a.next = a : (a.next = f.next, f.next = a), c.pending = a, a = Sf(l), bd(l, null, u), a;
    }
    return Cn(l, c, a, u), Sf(l);
  }
  function qi(l, a, u) {
    if (a = a.updateQueue, a !== null && (a = a.shared, (u & 4194048) !== 0)) {
      var c = a.lanes;
      c &= l.pendingLanes, u |= c, a.lanes = u, Ka(l, u);
    }
  }
  function _d(l, a) {
    var u = l.updateQueue, c = l.alternate;
    if (c !== null && (c = c.updateQueue, u === c)) {
      var f = null, r = null;
      if (u = u.firstBaseUpdate, u !== null) {
        do {
          var p = {
            lane: u.lane,
            tag: u.tag,
            payload: u.payload,
            callback: null,
            next: null
          };
          r === null ? f = r = p : r = r.next = p, u = u.next;
        } while (u !== null);
        r === null ? f = r = a : r = r.next = a;
      } else f = r = a;
      u = {
        baseState: c.baseState,
        firstBaseUpdate: f,
        lastBaseUpdate: r,
        shared: c.shared,
        callbacks: c.callbacks
      }, l.updateQueue = u;
      return;
    }
    l = u.lastBaseUpdate, l === null ? u.firstBaseUpdate = a : l.next = a, u.lastBaseUpdate = a;
  }
  var up = !1;
  function ji() {
    if (up) {
      var l = al;
      if (l !== null) throw l;
    }
  }
  function iu(l, a, u, c) {
    up = !1;
    var f = l.updateQueue;
    Wu = !1;
    var r = f.firstBaseUpdate, p = f.lastBaseUpdate, E = f.shared.pending;
    if (E !== null) {
      f.shared.pending = null;
      var O = E, H = O.next;
      O.next = null, p === null ? r = H : p.next = H, p = O;
      var L = l.alternate;
      L !== null && (L = L.updateQueue, E = L.lastBaseUpdate, E !== p && (E === null ? L.firstBaseUpdate = H : E.next = H, L.lastBaseUpdate = O));
    }
    if (r !== null) {
      var J = f.baseState;
      p = 0, L = H = O = null, E = r;
      do {
        var B = E.lane & -536870913, Y = B !== E.lane;
        if (Y ? (Ye & B) === B : (c & B) === B) {
          B !== 0 && B === Ci && (up = !0), L !== null && (L = L.next = {
            lane: 0,
            tag: E.tag,
            payload: E.payload,
            callback: null,
            next: null
          });
          e: {
            var ue = l, ge = E;
            B = a;
            var gt = u;
            switch (ge.tag) {
              case 1:
                if (ue = ge.payload, typeof ue == "function") {
                  J = ue.call(gt, J, B);
                  break e;
                }
                J = ue;
                break e;
              case 3:
                ue.flags = ue.flags & -65537 | 128;
              case 0:
                if (ue = ge.payload, B = typeof ue == "function" ? ue.call(gt, J, B) : ue, B == null) break e;
                J = ae({}, J, B);
                break e;
              case 2:
                Wu = !0;
            }
          }
          B = E.callback, B !== null && (l.flags |= 64, Y && (l.flags |= 8192), Y = f.callbacks, Y === null ? f.callbacks = [B] : Y.push(B));
        } else
          Y = {
            lane: B,
            tag: E.tag,
            payload: E.payload,
            callback: E.callback,
            next: null
          }, L === null ? (H = L = Y, O = J) : L = L.next = Y, p |= B;
        if (E = E.next, E === null) {
          if (E = f.shared.pending, E === null)
            break;
          Y = E, E = Y.next, Y.next = null, f.lastBaseUpdate = Y, f.shared.pending = null;
        }
      } while (!0);
      L === null && (O = J), f.baseState = O, f.firstBaseUpdate = H, f.lastBaseUpdate = L, r === null && (f.shared.lanes = 0), Ba |= p, l.lanes = p, l.memoizedState = J;
    }
  }
  function Rd(l, a) {
    if (typeof l != "function")
      throw Error(g(191, l));
    l.call(a);
  }
  function wi(l, a) {
    var u = l.callbacks;
    if (u !== null)
      for (l.callbacks = null, l = 0; l < u.length; l++)
        Rd(u[l], a);
  }
  var fl = Q(null), Bc = Q(0);
  function J0(l, a) {
    l = Ha, se(Bc, l), se(fl, a), Ha = l | a.baseLanes;
  }
  function Nf() {
    se(Bc, Ha), se(fl, fl.current);
  }
  function Qo() {
    Ha = Bc.current, ne(fl), ne(Bc);
  }
  var ln = Q(null), qn = null;
  function cu(l) {
    var a = l.alternate;
    se(xt, xt.current & 1), se(ln, l), qn === null && (a === null || fl.current !== null || a.memoizedState !== null) && (qn = l);
  }
  function Zo(l) {
    se(xt, xt.current), se(ln, l), qn === null && (qn = l);
  }
  function Md(l) {
    l.tag === 22 ? (se(xt, xt.current), se(ln, l), qn === null && (qn = l)) : Ma();
  }
  function Ma() {
    se(xt, xt.current), se(ln, ln.current);
  }
  function nn(l) {
    ne(ln), qn === l && (qn = null), ne(xt);
  }
  var xt = Q(0);
  function Jo(l) {
    for (var a = l; a !== null; ) {
      if (a.tag === 13) {
        var u = a.memoizedState;
        if (u !== null && (u = u.dehydrated, u === null || fa(u) || Wi(u)))
          return a;
      } else if (a.tag === 19 && (a.memoizedProps.revealOrder === "forwards" || a.memoizedProps.revealOrder === "backwards" || a.memoizedProps.revealOrder === "unstable_legacy-backwards" || a.memoizedProps.revealOrder === "together")) {
        if ((a.flags & 128) !== 0) return a;
      } else if (a.child !== null) {
        a.child.return = a, a = a.child;
        continue;
      }
      if (a === l) break;
      for (; a.sibling === null; ) {
        if (a.return === null || a.return === l) return null;
        a = a.return;
      }
      a.sibling.return = a.return, a = a.sibling;
    }
    return null;
  }
  var ou = 0, Ce = null, st = null, Pt = null, qc = !1, jc = !1, Iu = !1, Hf = 0, Ko = 0, Yi = null, K0 = 0;
  function Yt() {
    throw Error(g(321));
  }
  function Pu(l, a) {
    if (a === null) return !1;
    for (var u = 0; u < a.length && u < l.length; u++)
      if (!Ll(l[u], a[u])) return !1;
    return !0;
  }
  function Bf(l, a, u, c, f, r) {
    return ou = r, Ce = a, a.memoizedState = null, a.updateQueue = null, a.lanes = 0, C.H = l === null || l.memoizedState === null ? tg : Jd, Iu = !1, r = u(c, f), Iu = !1, jc && (r = $0(
      a,
      u,
      c,
      f
    )), Cd(l), r;
  }
  function Cd(l) {
    C.H = Qf;
    var a = st !== null && st.next !== null;
    if (ou = 0, Pt = st = Ce = null, qc = !1, Ko = 0, Yi = null, a) throw Error(g(300));
    l === null || el || (l = l.dependencies, l !== null && Mc(l) && (el = !0));
  }
  function $0(l, a, u, c) {
    Ce = l;
    var f = 0;
    do {
      if (jc && (Yi = null), Ko = 0, jc = !1, 25 <= f) throw Error(g(301));
      if (f += 1, Pt = st = null, l.updateQueue != null) {
        var r = l.updateQueue;
        r.lastEffect = null, r.events = null, r.stores = null, r.memoCache != null && (r.memoCache.index = 0);
      }
      C.H = lg, r = a(u, c);
    } while (jc);
    return r;
  }
  function h1() {
    var l = C.H, a = l.useState()[0];
    return a = typeof a.then == "function" ? Yc(a) : a, l = l.useState()[0], (st !== null ? st.memoizedState : null) !== l && (Ce.flags |= 1024), a;
  }
  function Ud() {
    var l = Hf !== 0;
    return Hf = 0, l;
  }
  function wc(l, a, u) {
    a.updateQueue = l.updateQueue, a.flags &= -2053, l.lanes &= ~u;
  }
  function qf(l) {
    if (qc) {
      for (l = l.memoizedState; l !== null; ) {
        var a = l.queue;
        a !== null && (a.pending = null), l = l.next;
      }
      qc = !1;
    }
    ou = 0, Pt = st = Ce = null, jc = !1, Ko = Hf = 0, Yi = null;
  }
  function El() {
    var l = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Pt === null ? Ce.memoizedState = Pt = l : Pt = Pt.next = l, Pt;
  }
  function Kt() {
    if (st === null) {
      var l = Ce.alternate;
      l = l !== null ? l.memoizedState : null;
    } else l = st.next;
    var a = Pt === null ? Ce.memoizedState : Pt.next;
    if (a !== null)
      Pt = a, st = l;
    else {
      if (l === null)
        throw Ce.alternate === null ? Error(g(467)) : Error(g(310));
      st = l, l = {
        memoizedState: st.memoizedState,
        baseState: st.baseState,
        baseQueue: st.baseQueue,
        queue: st.queue,
        next: null
      }, Pt === null ? Ce.memoizedState = Pt = l : Pt = Pt.next = l;
    }
    return Pt;
  }
  function jf() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function Yc(l) {
    var a = Ko;
    return Ko += 1, Yi === null && (Yi = []), l = lp(Yi, l, a), a = Ce, (Pt === null ? a.memoizedState : Pt.next) === null && (a = a.alternate, C.H = a === null || a.memoizedState === null ? tg : Jd), l;
  }
  function $o(l) {
    if (l !== null && typeof l == "object") {
      if (typeof l.then == "function") return Yc(l);
      if (l.$$typeof === wt) return $(l);
    }
    throw Error(g(438, String(l)));
  }
  function xd(l) {
    var a = null, u = Ce.updateQueue;
    if (u !== null && (a = u.memoCache), a == null) {
      var c = Ce.alternate;
      c !== null && (c = c.updateQueue, c !== null && (c = c.memoCache, c != null && (a = {
        data: c.data.map(function(f) {
          return f.slice();
        }),
        index: 0
      })));
    }
    if (a == null && (a = { data: [], index: 0 }), u === null && (u = jf(), Ce.updateQueue = u), u.memoCache = a, u = a.data[a.index], u === void 0)
      for (u = a.data[a.index] = Array(l), c = 0; c < l; c++)
        u[c] = ie;
    return a.index++, u;
  }
  function su(l, a) {
    return typeof a == "function" ? a(l) : a;
  }
  function fu(l) {
    var a = Kt();
    return Nd(a, st, l);
  }
  function Nd(l, a, u) {
    var c = l.queue;
    if (c === null) throw Error(g(311));
    c.lastRenderedReducer = u;
    var f = l.baseQueue, r = c.pending;
    if (r !== null) {
      if (f !== null) {
        var p = f.next;
        f.next = r.next, r.next = p;
      }
      a.baseQueue = f = r, c.pending = null;
    }
    if (r = l.baseState, f === null) l.memoizedState = r;
    else {
      a = f.next;
      var E = p = null, O = null, H = a, L = !1;
      do {
        var J = H.lane & -536870913;
        if (J !== H.lane ? (Ye & J) === J : (ou & J) === J) {
          var B = H.revertLane;
          if (B === 0)
            O !== null && (O = O.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: H.action,
              hasEagerState: H.hasEagerState,
              eagerState: H.eagerState,
              next: null
            }), J === Ci && (L = !0);
          else if ((ou & B) === B) {
            H = H.next, B === Ci && (L = !0);
            continue;
          } else
            J = {
              lane: 0,
              revertLane: H.revertLane,
              gesture: null,
              action: H.action,
              hasEagerState: H.hasEagerState,
              eagerState: H.eagerState,
              next: null
            }, O === null ? (E = O = J, p = r) : O = O.next = J, Ce.lanes |= B, Ba |= B;
          J = H.action, Iu && u(r, J), r = H.hasEagerState ? H.eagerState : u(r, J);
        } else
          B = {
            lane: J,
            revertLane: H.revertLane,
            gesture: H.gesture,
            action: H.action,
            hasEagerState: H.hasEagerState,
            eagerState: H.eagerState,
            next: null
          }, O === null ? (E = O = B, p = r) : O = O.next = B, Ce.lanes |= J, Ba |= J;
        H = H.next;
      } while (H !== null && H !== a);
      if (O === null ? p = r : O.next = E, !Ll(r, l.memoizedState) && (el = !0, L && (u = al, u !== null)))
        throw u;
      l.memoizedState = r, l.baseState = p, l.baseQueue = O, c.lastRenderedState = r;
    }
    return f === null && (c.lanes = 0), [l.memoizedState, c.dispatch];
  }
  function Hd(l) {
    var a = Kt(), u = a.queue;
    if (u === null) throw Error(g(311));
    u.lastRenderedReducer = l;
    var c = u.dispatch, f = u.pending, r = a.memoizedState;
    if (f !== null) {
      u.pending = null;
      var p = f = f.next;
      do
        r = l(r, p.action), p = p.next;
      while (p !== f);
      Ll(r, a.memoizedState) || (el = !0), a.memoizedState = r, a.baseQueue === null && (a.baseState = r), u.lastRenderedState = r;
    }
    return [r, c];
  }
  function ip(l, a, u) {
    var c = Ce, f = Kt(), r = Le;
    if (r) {
      if (u === void 0) throw Error(g(407));
      u = u();
    } else u = a();
    var p = !Ll(
      (st || f).memoizedState,
      u
    );
    if (p && (f.memoizedState = u, el = !0), f = f.queue, Yd(Bd.bind(null, c, f, l), [
      l
    ]), f.getSnapshot !== a || p || Pt !== null && Pt.memoizedState.tag & 1) {
      if (c.flags |= 2048, Xc(
        9,
        { destroy: void 0 },
        cp.bind(
          null,
          c,
          f,
          u,
          a
        ),
        null
      ), pt === null) throw Error(g(349));
      r || (ou & 127) !== 0 || wf(c, a, u);
    }
    return u;
  }
  function wf(l, a, u) {
    l.flags |= 16384, l = { getSnapshot: a, value: u }, a = Ce.updateQueue, a === null ? (a = jf(), Ce.updateQueue = a, a.stores = [l]) : (u = a.stores, u === null ? a.stores = [l] : u.push(l));
  }
  function cp(l, a, u, c) {
    a.value = u, a.getSnapshot = c, qd(a) && jd(l);
  }
  function Bd(l, a, u) {
    return u(function() {
      qd(a) && jd(l);
    });
  }
  function qd(l) {
    var a = l.getSnapshot;
    l = l.value;
    try {
      var u = a();
      return !Ll(l, u);
    } catch {
      return !0;
    }
  }
  function jd(l) {
    var a = Qu(l, 2);
    a !== null && fn(a, l, 2);
  }
  function op(l) {
    var a = El();
    if (typeof l == "function") {
      var u = l;
      if (l = u(), Iu) {
        wu(!0);
        try {
          u();
        } finally {
          wu(!1);
        }
      }
    }
    return a.memoizedState = a.baseState = l, a.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: su,
      lastRenderedState: l
    }, a;
  }
  function Tl(l, a, u, c) {
    return l.baseState = u, Nd(
      l,
      st,
      typeof c == "function" ? c : su
    );
  }
  function k0(l, a, u, c, f) {
    if (Vf(l)) throw Error(g(485));
    if (l = a.action, l !== null) {
      var r = {
        payload: f,
        action: l,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(p) {
          r.listeners.push(p);
        }
      };
      C.T !== null ? u(!0) : r.isTransition = !1, c(r), u = a.pending, u === null ? (r.next = a.pending = r, sp(a, r)) : (r.next = u.next, a.pending = u.next = r);
    }
  }
  function sp(l, a) {
    var u = a.action, c = a.payload, f = l.state;
    if (a.isTransition) {
      var r = C.T, p = {};
      C.T = p;
      try {
        var E = u(f, c), O = C.S;
        O !== null && O(p, E), fp(l, a, E);
      } catch (H) {
        Gc(l, a, H);
      } finally {
        r !== null && p.types !== null && (r.types = p.types), C.T = r;
      }
    } else
      try {
        r = u(f, c), fp(l, a, r);
      } catch (H) {
        Gc(l, a, H);
      }
  }
  function fp(l, a, u) {
    u !== null && typeof u == "object" && typeof u.then == "function" ? u.then(
      function(c) {
        rp(l, a, c);
      },
      function(c) {
        return Gc(l, a, c);
      }
    ) : rp(l, a, u);
  }
  function rp(l, a, u) {
    a.status = "fulfilled", a.value = u, dp(a), l.state = u, a = l.pending, a !== null && (u = a.next, u === a ? l.pending = null : (u = u.next, a.next = u, sp(l, u)));
  }
  function Gc(l, a, u) {
    var c = l.pending;
    if (l.pending = null, c !== null) {
      c = c.next;
      do
        a.status = "rejected", a.reason = u, dp(a), a = a.next;
      while (a !== c);
    }
    l.action = null;
  }
  function dp(l) {
    l = l.listeners;
    for (var a = 0; a < l.length; a++) (0, l[a])();
  }
  function Yf(l, a) {
    return a;
  }
  function hp(l, a) {
    if (Le) {
      var u = pt.formState;
      if (u !== null) {
        e: {
          var c = Ce;
          if (Le) {
            if (Et) {
              t: {
                for (var f = Et, r = sl; f.nodeType !== 8; ) {
                  if (!r) {
                    f = null;
                    break t;
                  }
                  if (f = rn(
                    f.nextSibling
                  ), f === null) {
                    f = null;
                    break t;
                  }
                }
                r = f.data, f = r === "F!" || r === "F" ? f : null;
              }
              if (f) {
                Et = rn(
                  f.nextSibling
                ), c = f.data === "F!";
                break e;
              }
            }
            ia(c);
          }
          c = !1;
        }
        c && (a = u[0]);
      }
    }
    return u = El(), u.memoizedState = u.baseState = a, c = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Yf,
      lastRenderedState: a
    }, u.queue = c, u = Qd.bind(
      null,
      Ce,
      c
    ), c.dispatch = u, c = op(!1), r = Gi.bind(
      null,
      Ce,
      !1,
      c.queue
    ), c = El(), f = {
      state: a,
      dispatch: null,
      action: l,
      pending: null
    }, c.queue = f, u = k0.bind(
      null,
      Ce,
      f,
      r,
      u
    ), f.dispatch = u, c.memoizedState = l, [a, u, !1];
  }
  function W0(l) {
    var a = Kt();
    return Gf(a, st, l);
  }
  function Gf(l, a, u) {
    if (a = Nd(
      l,
      a,
      Yf
    )[0], l = fu(su)[0], typeof a == "object" && a !== null && typeof a.then == "function")
      try {
        var c = Yc(a);
      } catch (p) {
        throw p === Ui ? Lo : p;
      }
    else c = a;
    a = Kt();
    var f = a.queue, r = f.dispatch;
    return u !== a.memoizedState && (Ce.flags |= 2048, Xc(
      9,
      { destroy: void 0 },
      mp.bind(null, f, u),
      null
    )), [c, r, l];
  }
  function mp(l, a) {
    l.action = a;
  }
  function pp(l) {
    var a = Kt(), u = st;
    if (u !== null)
      return Gf(a, u, l);
    Kt(), a = a.memoizedState, u = Kt();
    var c = u.queue.dispatch;
    return u.memoizedState = l, [a, c, !1];
  }
  function Xc(l, a, u, c) {
    return l = { tag: l, create: u, deps: c, inst: a, next: null }, a = Ce.updateQueue, a === null && (a = jf(), Ce.updateQueue = a), u = a.lastEffect, u === null ? a.lastEffect = l.next = l : (c = u.next, u.next = l, l.next = c, a.lastEffect = l), l;
  }
  function yp() {
    return Kt().memoizedState;
  }
  function ko(l, a, u, c) {
    var f = El();
    Ce.flags |= l, f.memoizedState = Xc(
      1 | a,
      { destroy: void 0 },
      u,
      c === void 0 ? null : c
    );
  }
  function Wo(l, a, u, c) {
    var f = Kt();
    c = c === void 0 ? null : c;
    var r = f.memoizedState.inst;
    st !== null && c !== null && Pu(c, st.memoizedState.deps) ? f.memoizedState = Xc(a, r, u, c) : (Ce.flags |= l, f.memoizedState = Xc(
      1 | a,
      r,
      u,
      c
    ));
  }
  function wd(l, a) {
    ko(8390656, 8, l, a);
  }
  function Yd(l, a) {
    Wo(2048, 8, l, a);
  }
  function gp(l) {
    Ce.flags |= 4;
    var a = Ce.updateQueue;
    if (a === null)
      a = jf(), Ce.updateQueue = a, a.events = [l];
    else {
      var u = a.events;
      u === null ? a.events = [l] : u.push(l);
    }
  }
  function Xf(l) {
    var a = Kt().memoizedState;
    return gp({ ref: a, nextImpl: l }), function() {
      if ((et & 2) !== 0) throw Error(g(440));
      return a.impl.apply(void 0, arguments);
    };
  }
  function Gd(l, a) {
    return Wo(4, 2, l, a);
  }
  function vp(l, a) {
    return Wo(4, 4, l, a);
  }
  function Xd(l, a) {
    if (typeof a == "function") {
      l = l();
      var u = a(l);
      return function() {
        typeof u == "function" ? u() : a(null);
      };
    }
    if (a != null)
      return l = l(), a.current = l, function() {
        a.current = null;
      };
  }
  function bp(l, a, u) {
    u = u != null ? u.concat([l]) : null, Wo(4, 4, Xd.bind(null, a, l), u);
  }
  function Ca() {
  }
  function Ld(l, a) {
    var u = Kt();
    a = a === void 0 ? null : a;
    var c = u.memoizedState;
    return a !== null && Pu(a, c[1]) ? c[0] : (u.memoizedState = [l, a], l);
  }
  function F0(l, a) {
    var u = Kt();
    a = a === void 0 ? null : a;
    var c = u.memoizedState;
    if (a !== null && Pu(a, c[1]))
      return c[0];
    if (c = l(), Iu) {
      wu(!0);
      try {
        l();
      } finally {
        wu(!1);
      }
    }
    return u.memoizedState = [c, a], c;
  }
  function Lf(l, a, u) {
    return u === void 0 || (ou & 1073741824) !== 0 && (Ye & 261930) === 0 ? l.memoizedState = a : (l.memoizedState = u, l = dg(), Ce.lanes |= l, Ba |= l, u);
  }
  function ru(l, a, u, c) {
    return Ll(u, a) ? u : fl.current !== null ? (l = Lf(l, u, c), Ll(l, a) || (el = !0), l) : (ou & 42) === 0 || (ou & 1073741824) !== 0 && (Ye & 261930) === 0 ? (el = !0, l.memoizedState = u) : (l = dg(), Ce.lanes |= l, Ba |= l, a);
  }
  function Vd(l, a, u, c, f) {
    var r = K.p;
    K.p = r !== 0 && 8 > r ? r : 8;
    var p = C.T, E = {};
    C.T = E, Gi(l, !1, a, u);
    try {
      var O = f(), H = C.S;
      if (H !== null && H(E, O), O !== null && typeof O == "object" && typeof O.then == "function") {
        var L = Mf(
          O,
          c
        );
        ei(
          l,
          a,
          L,
          En(l)
        );
      } else
        ei(
          l,
          a,
          c,
          En(l)
        );
    } catch (J) {
      ei(
        l,
        a,
        { then: function() {
        }, status: "rejected", reason: J },
        En()
      );
    } finally {
      K.p = r, p !== null && E.types !== null && (p.types = E.types), C.T = p;
    }
  }
  function I0() {
  }
  function Fo(l, a, u, c) {
    if (l.tag !== 5) throw Error(g(476));
    var f = Io(l).queue;
    Vd(
      l,
      f,
      a,
      W,
      u === null ? I0 : function() {
        return mt(l), u(c);
      }
    );
  }
  function Io(l) {
    var a = l.memoizedState;
    if (a !== null) return a;
    a = {
      memoizedState: W,
      baseState: W,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: su,
        lastRenderedState: W
      },
      next: null
    };
    var u = {};
    return a.next = {
      memoizedState: u,
      baseState: u,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: su,
        lastRenderedState: u
      },
      next: null
    }, l.memoizedState = a, l = l.alternate, l !== null && (l.memoizedState = a), a;
  }
  function mt(l) {
    var a = Io(l);
    a.next === null && (a = l.alternate.memoizedState), ei(
      l,
      a.next.queue,
      {},
      En()
    );
  }
  function Sp() {
    return $(gr);
  }
  function P0() {
    return Kt().memoizedState;
  }
  function Ep() {
    return Kt().memoizedState;
  }
  function du(l) {
    for (var a = l.return; a !== null; ) {
      switch (a.tag) {
        case 24:
        case 3:
          var u = En();
          l = Fu(u);
          var c = Bn(a, l, u);
          c !== null && (fn(c, a, u), qi(c, a, u)), a = { cache: Of() }, l.payload = a;
          return;
      }
      a = a.return;
    }
  }
  function eg(l, a, u) {
    var c = En();
    u = {
      lane: c,
      revertLane: 0,
      gesture: null,
      action: u,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Vf(l) ? Zd(a, u) : (u = aa(l, a, u, c), u !== null && (fn(u, l, c), Tp(u, a, c)));
  }
  function Qd(l, a, u) {
    var c = En();
    ei(l, a, u, c);
  }
  function ei(l, a, u, c) {
    var f = {
      lane: c,
      revertLane: 0,
      gesture: null,
      action: u,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (Vf(l)) Zd(a, f);
    else {
      var r = l.alternate;
      if (l.lanes === 0 && (r === null || r.lanes === 0) && (r = a.lastRenderedReducer, r !== null))
        try {
          var p = a.lastRenderedState, E = r(p, u);
          if (f.hasEagerState = !0, f.eagerState = E, Ll(E, p))
            return Cn(l, a, f, 0), pt === null && Mn(), !1;
        } catch {
        } finally {
        }
      if (u = aa(l, a, f, c), u !== null)
        return fn(u, l, c), Tp(u, a, c), !0;
    }
    return !1;
  }
  function Gi(l, a, u, c) {
    if (c = {
      lane: 2,
      revertLane: gh(),
      gesture: null,
      action: c,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Vf(l)) {
      if (a) throw Error(g(479));
    } else
      a = aa(
        l,
        u,
        c,
        2
      ), a !== null && fn(a, l, 2);
  }
  function Vf(l) {
    var a = l.alternate;
    return l === Ce || a !== null && a === Ce;
  }
  function Zd(l, a) {
    jc = qc = !0;
    var u = l.pending;
    u === null ? a.next = a : (a.next = u.next, u.next = a), l.pending = a;
  }
  function Tp(l, a, u) {
    if ((u & 4194048) !== 0) {
      var c = a.lanes;
      c &= l.pendingLanes, u |= c, a.lanes = u, Ka(l, u);
    }
  }
  var Qf = {
    readContext: $,
    use: $o,
    useCallback: Yt,
    useContext: Yt,
    useEffect: Yt,
    useImperativeHandle: Yt,
    useLayoutEffect: Yt,
    useInsertionEffect: Yt,
    useMemo: Yt,
    useReducer: Yt,
    useRef: Yt,
    useState: Yt,
    useDebugValue: Yt,
    useDeferredValue: Yt,
    useTransition: Yt,
    useSyncExternalStore: Yt,
    useId: Yt,
    useHostTransitionStatus: Yt,
    useFormState: Yt,
    useActionState: Yt,
    useOptimistic: Yt,
    useMemoCache: Yt,
    useCacheRefresh: Yt
  };
  Qf.useEffectEvent = Yt;
  var tg = {
    readContext: $,
    use: $o,
    useCallback: function(l, a) {
      return El().memoizedState = [
        l,
        a === void 0 ? null : a
      ], l;
    },
    useContext: $,
    useEffect: wd,
    useImperativeHandle: function(l, a, u) {
      u = u != null ? u.concat([l]) : null, ko(
        4194308,
        4,
        Xd.bind(null, a, l),
        u
      );
    },
    useLayoutEffect: function(l, a) {
      return ko(4194308, 4, l, a);
    },
    useInsertionEffect: function(l, a) {
      ko(4, 2, l, a);
    },
    useMemo: function(l, a) {
      var u = El();
      a = a === void 0 ? null : a;
      var c = l();
      if (Iu) {
        wu(!0);
        try {
          l();
        } finally {
          wu(!1);
        }
      }
      return u.memoizedState = [c, a], c;
    },
    useReducer: function(l, a, u) {
      var c = El();
      if (u !== void 0) {
        var f = u(a);
        if (Iu) {
          wu(!0);
          try {
            u(a);
          } finally {
            wu(!1);
          }
        }
      } else f = a;
      return c.memoizedState = c.baseState = f, l = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: l,
        lastRenderedState: f
      }, c.queue = l, l = l.dispatch = eg.bind(
        null,
        Ce,
        l
      ), [c.memoizedState, l];
    },
    useRef: function(l) {
      var a = El();
      return l = { current: l }, a.memoizedState = l;
    },
    useState: function(l) {
      l = op(l);
      var a = l.queue, u = Qd.bind(null, Ce, a);
      return a.dispatch = u, [l.memoizedState, u];
    },
    useDebugValue: Ca,
    useDeferredValue: function(l, a) {
      var u = El();
      return Lf(u, l, a);
    },
    useTransition: function() {
      var l = op(!1);
      return l = Vd.bind(
        null,
        Ce,
        l.queue,
        !0,
        !1
      ), El().memoizedState = l, [!1, l];
    },
    useSyncExternalStore: function(l, a, u) {
      var c = Ce, f = El();
      if (Le) {
        if (u === void 0)
          throw Error(g(407));
        u = u();
      } else {
        if (u = a(), pt === null)
          throw Error(g(349));
        (Ye & 127) !== 0 || wf(c, a, u);
      }
      f.memoizedState = u;
      var r = { value: u, getSnapshot: a };
      return f.queue = r, wd(Bd.bind(null, c, r, l), [
        l
      ]), c.flags |= 2048, Xc(
        9,
        { destroy: void 0 },
        cp.bind(
          null,
          c,
          r,
          u,
          a
        ),
        null
      ), u;
    },
    useId: function() {
      var l = El(), a = pt.identifierPrefix;
      if (Le) {
        var u = Da, c = gn;
        u = (c & ~(1 << 32 - kl(c) - 1)).toString(32) + u, a = "_" + a + "R_" + u, u = Hf++, 0 < u && (a += "H" + u.toString(32)), a += "_";
      } else
        u = K0++, a = "_" + a + "r_" + u.toString(32) + "_";
      return l.memoizedState = a;
    },
    useHostTransitionStatus: Sp,
    useFormState: hp,
    useActionState: hp,
    useOptimistic: function(l) {
      var a = El();
      a.memoizedState = a.baseState = l;
      var u = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return a.queue = u, a = Gi.bind(
        null,
        Ce,
        !0,
        u
      ), u.dispatch = a, [l, a];
    },
    useMemoCache: xd,
    useCacheRefresh: function() {
      return El().memoizedState = du.bind(
        null,
        Ce
      );
    },
    useEffectEvent: function(l) {
      var a = El(), u = { impl: l };
      return a.memoizedState = u, function() {
        if ((et & 2) !== 0)
          throw Error(g(440));
        return u.impl.apply(void 0, arguments);
      };
    }
  }, Jd = {
    readContext: $,
    use: $o,
    useCallback: Ld,
    useContext: $,
    useEffect: Yd,
    useImperativeHandle: bp,
    useInsertionEffect: Gd,
    useLayoutEffect: vp,
    useMemo: F0,
    useReducer: fu,
    useRef: yp,
    useState: function() {
      return fu(su);
    },
    useDebugValue: Ca,
    useDeferredValue: function(l, a) {
      var u = Kt();
      return ru(
        u,
        st.memoizedState,
        l,
        a
      );
    },
    useTransition: function() {
      var l = fu(su)[0], a = Kt().memoizedState;
      return [
        typeof l == "boolean" ? l : Yc(l),
        a
      ];
    },
    useSyncExternalStore: ip,
    useId: P0,
    useHostTransitionStatus: Sp,
    useFormState: W0,
    useActionState: W0,
    useOptimistic: function(l, a) {
      var u = Kt();
      return Tl(u, st, l, a);
    },
    useMemoCache: xd,
    useCacheRefresh: Ep
  };
  Jd.useEffectEvent = Xf;
  var lg = {
    readContext: $,
    use: $o,
    useCallback: Ld,
    useContext: $,
    useEffect: Yd,
    useImperativeHandle: bp,
    useInsertionEffect: Gd,
    useLayoutEffect: vp,
    useMemo: F0,
    useReducer: Hd,
    useRef: yp,
    useState: function() {
      return Hd(su);
    },
    useDebugValue: Ca,
    useDeferredValue: function(l, a) {
      var u = Kt();
      return st === null ? Lf(u, l, a) : ru(
        u,
        st.memoizedState,
        l,
        a
      );
    },
    useTransition: function() {
      var l = Hd(su)[0], a = Kt().memoizedState;
      return [
        typeof l == "boolean" ? l : Yc(l),
        a
      ];
    },
    useSyncExternalStore: ip,
    useId: P0,
    useHostTransitionStatus: Sp,
    useFormState: pp,
    useActionState: pp,
    useOptimistic: function(l, a) {
      var u = Kt();
      return st !== null ? Tl(u, st, l, a) : (u.baseState = l, [l, u.queue.dispatch]);
    },
    useMemoCache: xd,
    useCacheRefresh: Ep
  };
  lg.useEffectEvent = Xf;
  function Lc(l, a, u, c) {
    a = l.memoizedState, u = u(c, a), u = u == null ? a : ae({}, a, u), l.memoizedState = u, l.lanes === 0 && (l.updateQueue.baseState = u);
  }
  var ca = {
    enqueueSetState: function(l, a, u) {
      l = l._reactInternals;
      var c = En(), f = Fu(c);
      f.payload = a, u != null && (f.callback = u), a = Bn(l, f, c), a !== null && (fn(a, l, c), qi(a, l, c));
    },
    enqueueReplaceState: function(l, a, u) {
      l = l._reactInternals;
      var c = En(), f = Fu(c);
      f.tag = 1, f.payload = a, u != null && (f.callback = u), a = Bn(l, f, c), a !== null && (fn(a, l, c), qi(a, l, c));
    },
    enqueueForceUpdate: function(l, a) {
      l = l._reactInternals;
      var u = En(), c = Fu(u);
      c.tag = 2, a != null && (c.callback = a), a = Bn(l, c, u), a !== null && (fn(a, l, u), qi(a, l, u));
    }
  };
  function Ap(l, a, u, c, f, r, p) {
    return l = l.stateNode, typeof l.shouldComponentUpdate == "function" ? l.shouldComponentUpdate(c, r, p) : a.prototype && a.prototype.isPureReactComponent ? !ta(u, c) || !ta(f, r) : !0;
  }
  function ng(l, a, u, c) {
    l = a.state, typeof a.componentWillReceiveProps == "function" && a.componentWillReceiveProps(u, c), typeof a.UNSAFE_componentWillReceiveProps == "function" && a.UNSAFE_componentWillReceiveProps(u, c), a.state !== l && ca.enqueueReplaceState(a, a.state, null);
  }
  function Xi(l, a) {
    var u = a;
    if ("ref" in a) {
      u = {};
      for (var c in a)
        c !== "ref" && (u[c] = a[c]);
    }
    if (l = l.defaultProps) {
      u === a && (u = ae({}, u));
      for (var f in l)
        u[f] === void 0 && (u[f] = l[f]);
    }
    return u;
  }
  function Kd(l) {
    Dc(l);
  }
  function zp(l) {
    console.error(l);
  }
  function $d(l) {
    Dc(l);
  }
  function Po(l, a) {
    try {
      var u = l.onUncaughtError;
      u(a.value, { componentStack: a.stack });
    } catch (c) {
      setTimeout(function() {
        throw c;
      });
    }
  }
  function Zf(l, a, u) {
    try {
      var c = l.onCaughtError;
      c(u.value, {
        componentStack: u.stack,
        errorBoundary: a.tag === 1 ? a.stateNode : null
      });
    } catch (f) {
      setTimeout(function() {
        throw f;
      });
    }
  }
  function Op(l, a, u) {
    return u = Fu(u), u.tag = 3, u.payload = { element: null }, u.callback = function() {
      Po(l, a);
    }, u;
  }
  function Dp(l) {
    return l = Fu(l), l.tag = 3, l;
  }
  function _p(l, a, u, c) {
    var f = u.type.getDerivedStateFromError;
    if (typeof f == "function") {
      var r = c.value;
      l.payload = function() {
        return f(r);
      }, l.callback = function() {
        Zf(a, u, c);
      };
    }
    var p = u.stateNode;
    p !== null && typeof p.componentDidCatch == "function" && (l.callback = function() {
      Zf(a, u, c), typeof f != "function" && (Nt === null ? Nt = /* @__PURE__ */ new Set([this]) : Nt.add(this));
      var E = c.stack;
      this.componentDidCatch(c.value, {
        componentStack: E !== null ? E : ""
      });
    });
  }
  function m1(l, a, u, c, f) {
    if (u.flags |= 32768, c !== null && typeof c == "object" && typeof c.then == "function") {
      if (a = u.alternate, a !== null && Sl(
        a,
        u,
        f,
        !0
      ), u = ln.current, u !== null) {
        switch (u.tag) {
          case 31:
          case 13:
            return qn === null ? hh() : u.alternate === null && At === 0 && (At = 3), u.flags &= -257, u.flags |= 65536, u.lanes = f, c === Nc ? u.flags |= 16384 : (a = u.updateQueue, a === null ? u.updateQueue = /* @__PURE__ */ new Set([c]) : a.add(c), ur(l, c, f)), !1;
          case 22:
            return u.flags |= 65536, c === Nc ? u.flags |= 16384 : (a = u.updateQueue, a === null ? (a = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([c])
            }, u.updateQueue = a) : (u = a.retryQueue, u === null ? a.retryQueue = /* @__PURE__ */ new Set([c]) : u.add(c)), ur(l, c, f)), !1;
        }
        throw Error(g(435, u.tag));
      }
      return ur(l, c, f), hh(), !1;
    }
    if (Le)
      return a = ln.current, a !== null ? ((a.flags & 65536) === 0 && (a.flags |= 256), a.flags |= 65536, a.lanes = f, c !== nu && (l = Error(g(422), { cause: c }), Go(Un(l, u)))) : (c !== nu && (a = Error(g(423), {
        cause: c
      }), Go(
        Un(a, u)
      )), l = l.current.alternate, l.flags |= 65536, f &= -f, l.lanes |= f, c = Un(c, u), f = Op(
        l.stateNode,
        c,
        f
      ), _d(l, f), At !== 4 && (At = 2)), !1;
    var r = Error(g(520), { cause: c });
    if (r = Un(r, u), tr === null ? tr = [r] : tr.push(r), At !== 4 && (At = 2), a === null) return !0;
    c = Un(c, u), u = a;
    do {
      switch (u.tag) {
        case 3:
          return u.flags |= 65536, l = f & -f, u.lanes |= l, l = Op(u.stateNode, c, l), _d(u, l), !1;
        case 1:
          if (a = u.type, r = u.stateNode, (u.flags & 128) === 0 && (typeof a.getDerivedStateFromError == "function" || r !== null && typeof r.componentDidCatch == "function" && (Nt === null || !Nt.has(r))))
            return u.flags |= 65536, f &= -f, u.lanes |= f, f = Dp(f), _p(
              f,
              l,
              u,
              c
            ), _d(u, f), !1;
      }
      u = u.return;
    } while (u !== null);
    return !1;
  }
  var kd = Error(g(461)), el = !1;
  function Rt(l, a, u, c) {
    a.child = l === null ? ap(a, null, u, c) : Bi(
      a,
      l.child,
      u,
      c
    );
  }
  function Rp(l, a, u, c, f) {
    u = u.render;
    var r = a.ref;
    if ("ref" in c) {
      var p = {};
      for (var E in c)
        E !== "ref" && (p[E] = c[E]);
    } else p = c;
    return ze(a), c = Bf(
      l,
      a,
      u,
      p,
      r,
      f
    ), E = Ud(), l !== null && !el ? (wc(l, a, f), Yn(l, a, f)) : (Le && E && wo(a), a.flags |= 1, Rt(l, a, c, f), a.child);
  }
  function Mp(l, a, u, c, f) {
    if (l === null) {
      var r = u.type;
      return typeof r == "function" && !_c(r) && r.defaultProps === void 0 && u.compare === null ? (a.tag = 15, a.type = r, Cp(
        l,
        a,
        r,
        c,
        f
      )) : (l = Sd(
        u.type,
        null,
        c,
        a,
        a.mode,
        f
      ), l.ref = a.ref, l.return = a, a.child = l);
    }
    if (r = l.child, !Id(l, f)) {
      var p = r.memoizedProps;
      if (u = u.compare, u = u !== null ? u : ta, u(p, c) && l.ref === a.ref)
        return Yn(l, a, f);
    }
    return a.flags |= 1, l = Zu(r, c), l.ref = a.ref, l.return = a, a.child = l;
  }
  function Cp(l, a, u, c, f) {
    if (l !== null) {
      var r = l.memoizedProps;
      if (ta(r, c) && l.ref === a.ref)
        if (el = !1, a.pendingProps = c = r, Id(l, f))
          (l.flags & 131072) !== 0 && (el = !0);
        else
          return a.lanes = l.lanes, Yn(l, a, f);
    }
    return Wd(
      l,
      a,
      u,
      c,
      f
    );
  }
  function ag(l, a, u, c) {
    var f = c.children, r = l !== null ? l.memoizedState : null;
    if (l === null && a.stateNode === null && (a.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), c.mode === "hidden") {
      if ((a.flags & 128) !== 0) {
        if (r = r !== null ? r.baseLanes | u : u, l !== null) {
          for (c = a.child = l.child, f = 0; c !== null; )
            f = f | c.lanes | c.childLanes, c = c.sibling;
          c = f & ~r;
        } else c = 0, a.child = null;
        return an(
          l,
          a,
          r,
          u,
          c
        );
      }
      if ((u & 536870912) !== 0)
        a.memoizedState = { baseLanes: 0, cachePool: null }, l !== null && Xo(
          a,
          r !== null ? r.cachePool : null
        ), r !== null ? J0(a, r) : Nf(), Md(a);
      else
        return c = a.lanes = 536870912, an(
          l,
          a,
          r !== null ? r.baseLanes | u : u,
          u,
          c
        );
    } else
      r !== null ? (Xo(a, r.cachePool), J0(a, r), Ma(), a.memoizedState = null) : (l !== null && Xo(a, null), Nf(), Ma());
    return Rt(l, a, f, u), a.child;
  }
  function Li(l, a) {
    return l !== null && l.tag === 22 || a.stateNode !== null || (a.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), a.sibling;
  }
  function an(l, a, u, c, f) {
    var r = Hn();
    return r = r === null ? null : { parent: It._currentValue, pool: r }, a.memoizedState = {
      baseLanes: u,
      cachePool: r
    }, l !== null && Xo(a, null), Nf(), Md(a), l !== null && Sl(l, a, c, !0), a.childLanes = f, null;
  }
  function Jf(l, a) {
    return a = kf(
      { mode: a.mode, children: a.children },
      l.mode
    ), a.ref = l.ref, l.child = a, a.return = l, a;
  }
  function un(l, a, u) {
    return Bi(a, l.child, null, u), l = Jf(a, a.pendingProps), l.flags |= 2, nn(a), a.memoizedState = null, l;
  }
  function ug(l, a, u) {
    var c = a.pendingProps, f = (a.flags & 128) !== 0;
    if (a.flags &= -129, l === null) {
      if (Le) {
        if (c.mode === "hidden")
          return l = Jf(a, c), a.lanes = 536870912, Li(null, l);
        if (Zo(a), (l = Et) ? (l = Gg(
          l,
          sl
        ), l = l !== null && l.data === "&" ? l : null, l !== null && (a.memoizedState = {
          dehydrated: l,
          treeContext: Oa !== null ? { id: gn, overflow: Da } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, u = km(l), u.return = a, a.child = u, bl = a, Et = null)) : l = null, l === null) throw ia(a);
        return a.lanes = 536870912, null;
      }
      return Jf(a, c);
    }
    var r = l.memoizedState;
    if (r !== null) {
      var p = r.dehydrated;
      if (Zo(a), f)
        if (a.flags & 256)
          a.flags &= -257, a = un(
            l,
            a,
            u
          );
        else if (a.memoizedState !== null)
          a.child = l.child, a.flags |= 128, a = null;
        else throw Error(g(558));
      else if (el || Sl(l, a, u, !1), f = (u & l.childLanes) !== 0, el || f) {
        if (c = pt, c !== null && (p = Dn(c, u), p !== 0 && p !== r.retryLane))
          throw r.retryLane = p, Qu(l, p), fn(c, l, p), kd;
        hh(), a = un(
          l,
          a,
          u
        );
      } else
        l = r.treeContext, Et = rn(p.nextSibling), bl = a, Le = !0, lu = null, sl = !1, l !== null && Tf(a, l), a = Jf(a, c), a.flags |= 4096;
      return a;
    }
    return l = Zu(l.child, {
      mode: c.mode,
      children: c.children
    }), l.ref = a.ref, a.child = l, l.return = a, l;
  }
  function jn(l, a) {
    var u = a.ref;
    if (u === null)
      l !== null && l.ref !== null && (a.flags |= 4194816);
    else {
      if (typeof u != "function" && typeof u != "object")
        throw Error(g(284));
      (l === null || l.ref !== u) && (a.flags |= 4194816);
    }
  }
  function Wd(l, a, u, c, f) {
    return ze(a), u = Bf(
      l,
      a,
      u,
      c,
      void 0,
      f
    ), c = Ud(), l !== null && !el ? (wc(l, a, f), Yn(l, a, f)) : (Le && c && wo(a), a.flags |= 1, Rt(l, a, u, f), a.child);
  }
  function Vi(l, a, u, c, f, r) {
    return ze(a), a.updateQueue = null, u = $0(
      a,
      c,
      u,
      f
    ), Cd(l), c = Ud(), l !== null && !el ? (wc(l, a, r), Yn(l, a, r)) : (Le && c && wo(a), a.flags |= 1, Rt(l, a, u, r), a.child);
  }
  function Up(l, a, u, c, f) {
    if (ze(a), a.stateNode === null) {
      var r = Pl, p = u.contextType;
      typeof p == "object" && p !== null && (r = $(p)), r = new u(c, r), a.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = ca, a.stateNode = r, r._reactInternals = a, r = a.stateNode, r.props = c, r.state = a.memoizedState, r.refs = {}, xf(a), p = u.contextType, r.context = typeof p == "object" && p !== null ? $(p) : Pl, r.state = a.memoizedState, p = u.getDerivedStateFromProps, typeof p == "function" && (Lc(
        a,
        u,
        p,
        c
      ), r.state = a.memoizedState), typeof u.getDerivedStateFromProps == "function" || typeof r.getSnapshotBeforeUpdate == "function" || typeof r.UNSAFE_componentWillMount != "function" && typeof r.componentWillMount != "function" || (p = r.state, typeof r.componentWillMount == "function" && r.componentWillMount(), typeof r.UNSAFE_componentWillMount == "function" && r.UNSAFE_componentWillMount(), p !== r.state && ca.enqueueReplaceState(r, r.state, null), iu(a, c, r, f), ji(), r.state = a.memoizedState), typeof r.componentDidMount == "function" && (a.flags |= 4194308), c = !0;
    } else if (l === null) {
      r = a.stateNode;
      var E = a.memoizedProps, O = Xi(u, E);
      r.props = O;
      var H = r.context, L = u.contextType;
      p = Pl, typeof L == "object" && L !== null && (p = $(L));
      var J = u.getDerivedStateFromProps;
      L = typeof J == "function" || typeof r.getSnapshotBeforeUpdate == "function", E = a.pendingProps !== E, L || typeof r.UNSAFE_componentWillReceiveProps != "function" && typeof r.componentWillReceiveProps != "function" || (E || H !== p) && ng(
        a,
        r,
        c,
        p
      ), Wu = !1;
      var B = a.memoizedState;
      r.state = B, iu(a, c, r, f), ji(), H = a.memoizedState, E || B !== H || Wu ? (typeof J == "function" && (Lc(
        a,
        u,
        J,
        c
      ), H = a.memoizedState), (O = Wu || Ap(
        a,
        u,
        O,
        c,
        B,
        H,
        p
      )) ? (L || typeof r.UNSAFE_componentWillMount != "function" && typeof r.componentWillMount != "function" || (typeof r.componentWillMount == "function" && r.componentWillMount(), typeof r.UNSAFE_componentWillMount == "function" && r.UNSAFE_componentWillMount()), typeof r.componentDidMount == "function" && (a.flags |= 4194308)) : (typeof r.componentDidMount == "function" && (a.flags |= 4194308), a.memoizedProps = c, a.memoizedState = H), r.props = c, r.state = H, r.context = p, c = O) : (typeof r.componentDidMount == "function" && (a.flags |= 4194308), c = !1);
    } else {
      r = a.stateNode, Dd(l, a), p = a.memoizedProps, L = Xi(u, p), r.props = L, J = a.pendingProps, B = r.context, H = u.contextType, O = Pl, typeof H == "object" && H !== null && (O = $(H)), E = u.getDerivedStateFromProps, (H = typeof E == "function" || typeof r.getSnapshotBeforeUpdate == "function") || typeof r.UNSAFE_componentWillReceiveProps != "function" && typeof r.componentWillReceiveProps != "function" || (p !== J || B !== O) && ng(
        a,
        r,
        c,
        O
      ), Wu = !1, B = a.memoizedState, r.state = B, iu(a, c, r, f), ji();
      var Y = a.memoizedState;
      p !== J || B !== Y || Wu || l !== null && l.dependencies !== null && Mc(l.dependencies) ? (typeof E == "function" && (Lc(
        a,
        u,
        E,
        c
      ), Y = a.memoizedState), (L = Wu || Ap(
        a,
        u,
        L,
        c,
        B,
        Y,
        O
      ) || l !== null && l.dependencies !== null && Mc(l.dependencies)) ? (H || typeof r.UNSAFE_componentWillUpdate != "function" && typeof r.componentWillUpdate != "function" || (typeof r.componentWillUpdate == "function" && r.componentWillUpdate(c, Y, O), typeof r.UNSAFE_componentWillUpdate == "function" && r.UNSAFE_componentWillUpdate(
        c,
        Y,
        O
      )), typeof r.componentDidUpdate == "function" && (a.flags |= 4), typeof r.getSnapshotBeforeUpdate == "function" && (a.flags |= 1024)) : (typeof r.componentDidUpdate != "function" || p === l.memoizedProps && B === l.memoizedState || (a.flags |= 4), typeof r.getSnapshotBeforeUpdate != "function" || p === l.memoizedProps && B === l.memoizedState || (a.flags |= 1024), a.memoizedProps = c, a.memoizedState = Y), r.props = c, r.state = Y, r.context = O, c = L) : (typeof r.componentDidUpdate != "function" || p === l.memoizedProps && B === l.memoizedState || (a.flags |= 4), typeof r.getSnapshotBeforeUpdate != "function" || p === l.memoizedProps && B === l.memoizedState || (a.flags |= 1024), c = !1);
    }
    return r = c, jn(l, a), c = (a.flags & 128) !== 0, r || c ? (r = a.stateNode, u = c && typeof u.getDerivedStateFromError != "function" ? null : r.render(), a.flags |= 1, l !== null && c ? (a.child = Bi(
      a,
      l.child,
      null,
      f
    ), a.child = Bi(
      a,
      null,
      u,
      f
    )) : Rt(l, a, u, f), a.memoizedState = r.state, l = a.child) : l = Yn(
      l,
      a,
      f
    ), l;
  }
  function Ua(l, a, u, c) {
    return Mi(), a.flags |= 256, Rt(l, a, u, c), a.child;
  }
  var Kf = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function $f(l) {
    return { baseLanes: l, cachePool: Uc() };
  }
  function wn(l, a, u) {
    return l = l !== null ? l.childLanes & ~u : 0, a && (l |= sn), l;
  }
  function xp(l, a, u) {
    var c = a.pendingProps, f = !1, r = (a.flags & 128) !== 0, p;
    if ((p = r) || (p = l !== null && l.memoizedState === null ? !1 : (xt.current & 2) !== 0), p && (f = !0, a.flags &= -129), p = (a.flags & 32) !== 0, a.flags &= -33, l === null) {
      if (Le) {
        if (f ? cu(a) : Ma(), (l = Et) ? (l = Gg(
          l,
          sl
        ), l = l !== null && l.data !== "&" ? l : null, l !== null && (a.memoizedState = {
          dehydrated: l,
          treeContext: Oa !== null ? { id: gn, overflow: Da } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, u = km(l), u.return = a, a.child = u, bl = a, Et = null)) : l = null, l === null) throw ia(a);
        return Wi(l) ? a.lanes = 32 : a.lanes = 536870912, null;
      }
      var E = c.children;
      return c = c.fallback, f ? (Ma(), f = a.mode, E = kf(
        { mode: "hidden", children: E },
        f
      ), c = Ju(
        c,
        f,
        u,
        null
      ), E.return = a, c.return = a, E.sibling = c, a.child = E, c = a.child, c.memoizedState = $f(u), c.childLanes = wn(
        l,
        p,
        u
      ), a.memoizedState = Kf, Li(null, c)) : (cu(a), Qi(a, E));
    }
    var O = l.memoizedState;
    if (O !== null && (E = O.dehydrated, E !== null)) {
      if (r)
        a.flags & 256 ? (cu(a), a.flags &= -257, a = Vc(
          l,
          a,
          u
        )) : a.memoizedState !== null ? (Ma(), a.child = l.child, a.flags |= 128, a = null) : (Ma(), E = c.fallback, f = a.mode, c = kf(
          { mode: "visible", children: c.children },
          f
        ), E = Ju(
          E,
          f,
          u,
          null
        ), E.flags |= 2, c.return = a, E.return = a, c.sibling = E, a.child = c, Bi(
          a,
          l.child,
          null,
          u
        ), c = a.child, c.memoizedState = $f(u), c.childLanes = wn(
          l,
          p,
          u
        ), a.memoizedState = Kf, a = Li(null, c));
      else if (cu(a), Wi(E)) {
        if (p = E.nextSibling && E.nextSibling.dataset, p) var H = p.dgst;
        p = H, c = Error(g(419)), c.stack = "", c.digest = p, Go({ value: c, source: null, stack: null }), a = Vc(
          l,
          a,
          u
        );
      } else if (el || Sl(l, a, u, !1), p = (u & l.childLanes) !== 0, el || p) {
        if (p = pt, p !== null && (c = Dn(p, u), c !== 0 && c !== O.retryLane))
          throw O.retryLane = c, Qu(l, c), fn(p, l, c), kd;
        fa(E) || hh(), a = Vc(
          l,
          a,
          u
        );
      } else
        fa(E) ? (a.flags |= 192, a.child = l.child, a = null) : (l = O.treeContext, Et = rn(
          E.nextSibling
        ), bl = a, Le = !0, lu = null, sl = !1, l !== null && Tf(a, l), a = Qi(
          a,
          c.children
        ), a.flags |= 4096);
      return a;
    }
    return f ? (Ma(), E = c.fallback, f = a.mode, O = l.child, H = O.sibling, c = Zu(O, {
      mode: "hidden",
      children: c.children
    }), c.subtreeFlags = O.subtreeFlags & 65011712, H !== null ? E = Zu(
      H,
      E
    ) : (E = Ju(
      E,
      f,
      u,
      null
    ), E.flags |= 2), E.return = a, c.return = a, c.sibling = E, a.child = c, Li(null, c), c = a.child, E = l.child.memoizedState, E === null ? E = $f(u) : (f = E.cachePool, f !== null ? (O = It._currentValue, f = f.parent !== O ? { parent: O, pool: O } : f) : f = Uc(), E = {
      baseLanes: E.baseLanes | u,
      cachePool: f
    }), c.memoizedState = E, c.childLanes = wn(
      l,
      p,
      u
    ), a.memoizedState = Kf, Li(l.child, c)) : (cu(a), u = l.child, l = u.sibling, u = Zu(u, {
      mode: "visible",
      children: c.children
    }), u.return = a, u.sibling = null, l !== null && (p = a.deletions, p === null ? (a.deletions = [l], a.flags |= 16) : p.push(l)), a.child = u, a.memoizedState = null, u);
  }
  function Qi(l, a) {
    return a = kf(
      { mode: "visible", children: a },
      l.mode
    ), a.return = l, l.child = a;
  }
  function kf(l, a) {
    return l = Zt(22, l, null, a), l.lanes = 0, l;
  }
  function Vc(l, a, u) {
    return Bi(a, l.child, null, u), l = Qi(
      a,
      a.pendingProps.children
    ), l.flags |= 2, a.memoizedState = null, l;
  }
  function Qc(l, a, u) {
    l.lanes |= a;
    var c = l.alternate;
    c !== null && (c.lanes |= a), zd(l.return, a, u);
  }
  function Fd(l, a, u, c, f, r) {
    var p = l.memoizedState;
    p === null ? l.memoizedState = {
      isBackwards: a,
      rendering: null,
      renderingStartTime: 0,
      last: c,
      tail: u,
      tailMode: f,
      treeForkCount: r
    } : (p.isBackwards = a, p.rendering = null, p.renderingStartTime = 0, p.last = c, p.tail = u, p.tailMode = f, p.treeForkCount = r);
  }
  function Np(l, a, u) {
    var c = a.pendingProps, f = c.revealOrder, r = c.tail;
    c = c.children;
    var p = xt.current, E = (p & 2) !== 0;
    if (E ? (p = p & 1 | 2, a.flags |= 128) : p &= 1, se(xt, p), Rt(l, a, c, u), c = Le ? Ft : 0, !E && l !== null && (l.flags & 128) !== 0)
      e: for (l = a.child; l !== null; ) {
        if (l.tag === 13)
          l.memoizedState !== null && Qc(l, u, a);
        else if (l.tag === 19)
          Qc(l, u, a);
        else if (l.child !== null) {
          l.child.return = l, l = l.child;
          continue;
        }
        if (l === a) break e;
        for (; l.sibling === null; ) {
          if (l.return === null || l.return === a)
            break e;
          l = l.return;
        }
        l.sibling.return = l.return, l = l.sibling;
      }
    switch (f) {
      case "forwards":
        for (u = a.child, f = null; u !== null; )
          l = u.alternate, l !== null && Jo(l) === null && (f = u), u = u.sibling;
        u = f, u === null ? (f = a.child, a.child = null) : (f = u.sibling, u.sibling = null), Fd(
          a,
          !1,
          f,
          u,
          r,
          c
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (u = null, f = a.child, a.child = null; f !== null; ) {
          if (l = f.alternate, l !== null && Jo(l) === null) {
            a.child = f;
            break;
          }
          l = f.sibling, f.sibling = u, u = f, f = l;
        }
        Fd(
          a,
          !0,
          u,
          null,
          r,
          c
        );
        break;
      case "together":
        Fd(
          a,
          !1,
          null,
          null,
          void 0,
          c
        );
        break;
      default:
        a.memoizedState = null;
    }
    return a.child;
  }
  function Yn(l, a, u) {
    if (l !== null && (a.dependencies = l.dependencies), Ba |= a.lanes, (u & a.childLanes) === 0)
      if (l !== null) {
        if (Sl(
          l,
          a,
          u,
          !1
        ), (u & a.childLanes) === 0)
          return null;
      } else return null;
    if (l !== null && a.child !== l.child)
      throw Error(g(153));
    if (a.child !== null) {
      for (l = a.child, u = Zu(l, l.pendingProps), a.child = u, u.return = a; l.sibling !== null; )
        l = l.sibling, u = u.sibling = Zu(l, l.pendingProps), u.return = a;
      u.sibling = null;
    }
    return a.child;
  }
  function Id(l, a) {
    return (l.lanes & a) !== 0 ? !0 : (l = l.dependencies, !!(l !== null && Mc(l)));
  }
  function Pd(l, a, u) {
    switch (a.tag) {
      case 3:
        Fn(a, a.stateNode.containerInfo), tn(a, It, l.memoizedState.cache), Mi();
        break;
      case 27:
      case 5:
        ef(a);
        break;
      case 4:
        Fn(a, a.stateNode.containerInfo);
        break;
      case 10:
        tn(
          a,
          a.type,
          a.memoizedProps.value
        );
        break;
      case 31:
        if (a.memoizedState !== null)
          return a.flags |= 128, Zo(a), null;
        break;
      case 13:
        var c = a.memoizedState;
        if (c !== null)
          return c.dehydrated !== null ? (cu(a), a.flags |= 128, null) : (u & a.child.childLanes) !== 0 ? xp(l, a, u) : (cu(a), l = Yn(
            l,
            a,
            u
          ), l !== null ? l.sibling : null);
        cu(a);
        break;
      case 19:
        var f = (l.flags & 128) !== 0;
        if (c = (u & a.childLanes) !== 0, c || (Sl(
          l,
          a,
          u,
          !1
        ), c = (u & a.childLanes) !== 0), f) {
          if (c)
            return Np(
              l,
              a,
              u
            );
          a.flags |= 128;
        }
        if (f = a.memoizedState, f !== null && (f.rendering = null, f.tail = null, f.lastEffect = null), se(xt, xt.current), c) break;
        return null;
      case 22:
        return a.lanes = 0, ag(
          l,
          a,
          u,
          a.pendingProps
        );
      case 24:
        tn(a, It, l.memoizedState.cache);
    }
    return Yn(l, a, u);
  }
  function Hp(l, a, u) {
    if (l !== null)
      if (l.memoizedProps !== a.pendingProps)
        el = !0;
      else {
        if (!Id(l, u) && (a.flags & 128) === 0)
          return el = !1, Pd(
            l,
            a,
            u
          );
        el = (l.flags & 131072) !== 0;
      }
    else
      el = !1, Le && (a.flags & 1048576) !== 0 && Fm(a, Ft, a.index);
    switch (a.lanes = 0, a.tag) {
      case 16:
        e: {
          var c = a.pendingProps;
          if (l = xi(a.elementType), a.type = l, typeof l == "function")
            _c(l) ? (c = Xi(l, c), a.tag = 1, a = Up(
              null,
              a,
              l,
              c,
              u
            )) : (a.tag = 0, a = Wd(
              null,
              a,
              l,
              c,
              u
            ));
          else {
            if (l != null) {
              var f = l.$$typeof;
              if (f === ol) {
                a.tag = 11, a = Rp(
                  null,
                  a,
                  l,
                  c,
                  u
                );
                break e;
              } else if (f === I) {
                a.tag = 14, a = Mp(
                  null,
                  a,
                  l,
                  c,
                  u
                );
                break e;
              }
            }
            throw a = yl(l) || l, Error(g(306, a, ""));
          }
        }
        return a;
      case 0:
        return Wd(
          l,
          a,
          a.type,
          a.pendingProps,
          u
        );
      case 1:
        return c = a.type, f = Xi(
          c,
          a.pendingProps
        ), Up(
          l,
          a,
          c,
          f,
          u
        );
      case 3:
        e: {
          if (Fn(
            a,
            a.stateNode.containerInfo
          ), l === null) throw Error(g(387));
          c = a.pendingProps;
          var r = a.memoizedState;
          f = r.element, Dd(l, a), iu(a, c, null, u);
          var p = a.memoizedState;
          if (c = p.cache, tn(a, It, c), c !== r.cache && uu(
            a,
            [It],
            u,
            !0
          ), ji(), c = p.element, r.isDehydrated)
            if (r = {
              element: c,
              isDehydrated: !1,
              cache: p.cache
            }, a.updateQueue.baseState = r, a.memoizedState = r, a.flags & 256) {
              a = Ua(
                l,
                a,
                c,
                u
              );
              break e;
            } else if (c !== f) {
              f = Un(
                Error(g(424)),
                a
              ), Go(f), a = Ua(
                l,
                a,
                c,
                u
              );
              break e;
            } else {
              switch (l = a.stateNode.containerInfo, l.nodeType) {
                case 9:
                  l = l.body;
                  break;
                default:
                  l = l.nodeName === "HTML" ? l.ownerDocument.body : l;
              }
              for (Et = rn(l.firstChild), bl = a, Le = !0, lu = null, sl = !0, u = ap(
                a,
                null,
                c,
                u
              ), a.child = u; u; )
                u.flags = u.flags & -3 | 4096, u = u.sibling;
            }
          else {
            if (Mi(), c === f) {
              a = Yn(
                l,
                a,
                u
              );
              break e;
            }
            Rt(l, a, c, u);
          }
          a = a.child;
        }
        return a;
      case 26:
        return jn(l, a), l === null ? (u = Es(
          a.type,
          null,
          a.pendingProps,
          null
        )) ? a.memoizedState = u : Le || (u = a.type, l = a.pendingProps, c = ki(
          Wn.current
        ).createElement(u), c[ht] = a, c[Wl] = l, Bl(c, u, l), ct(c), a.stateNode = c) : a.memoizedState = Es(
          a.type,
          l.memoizedProps,
          a.pendingProps,
          l.memoizedState
        ), null;
      case 27:
        return ef(a), l === null && Le && (c = a.stateNode = bs(
          a.type,
          a.pendingProps,
          Wn.current
        ), bl = a, sl = !0, f = Et, ja(a.type) ? (mr = f, Et = rn(c.firstChild)) : Et = f), Rt(
          l,
          a,
          a.pendingProps.children,
          u
        ), jn(l, a), l === null && (a.flags |= 4194304), a.child;
      case 5:
        return l === null && Le && ((f = c = Et) && (c = g1(
          c,
          a.type,
          a.pendingProps,
          sl
        ), c !== null ? (a.stateNode = c, bl = a, Et = rn(c.firstChild), sl = !1, f = !0) : f = !1), f || ia(a)), ef(a), f = a.type, r = a.pendingProps, p = l !== null ? l.memoizedProps : null, c = r.children, gs(f, r) ? c = null : p !== null && gs(f, p) && (a.flags |= 32), a.memoizedState !== null && (f = Bf(
          l,
          a,
          h1,
          null,
          null,
          u
        ), gr._currentValue = f), jn(l, a), Rt(l, a, c, u), a.child;
      case 6:
        return l === null && Le && ((l = u = Et) && (u = Be(
          u,
          a.pendingProps,
          sl
        ), u !== null ? (a.stateNode = u, bl = a, Et = null, l = !0) : l = !1), l || ia(a)), null;
      case 13:
        return xp(l, a, u);
      case 4:
        return Fn(
          a,
          a.stateNode.containerInfo
        ), c = a.pendingProps, l === null ? a.child = Bi(
          a,
          null,
          c,
          u
        ) : Rt(l, a, c, u), a.child;
      case 11:
        return Rp(
          l,
          a,
          a.type,
          a.pendingProps,
          u
        );
      case 7:
        return Rt(
          l,
          a,
          a.pendingProps,
          u
        ), a.child;
      case 8:
        return Rt(
          l,
          a,
          a.pendingProps.children,
          u
        ), a.child;
      case 12:
        return Rt(
          l,
          a,
          a.pendingProps.children,
          u
        ), a.child;
      case 10:
        return c = a.pendingProps, tn(a, a.type, c.value), Rt(l, a, c.children, u), a.child;
      case 9:
        return f = a.type._context, c = a.pendingProps.children, ze(a), f = $(f), c = c(f), a.flags |= 1, Rt(l, a, c, u), a.child;
      case 14:
        return Mp(
          l,
          a,
          a.type,
          a.pendingProps,
          u
        );
      case 15:
        return Cp(
          l,
          a,
          a.type,
          a.pendingProps,
          u
        );
      case 19:
        return Np(l, a, u);
      case 31:
        return ug(l, a, u);
      case 22:
        return ag(
          l,
          a,
          u,
          a.pendingProps
        );
      case 24:
        return ze(a), c = $(It), l === null ? (f = Hn(), f === null && (f = pt, r = Of(), f.pooledCache = r, r.refCount++, r !== null && (f.pooledCacheLanes |= u), f = r), a.memoizedState = { parent: c, cache: f }, xf(a), tn(a, It, f)) : ((l.lanes & u) !== 0 && (Dd(l, a), iu(a, null, null, u), ji()), f = l.memoizedState, r = a.memoizedState, f.parent !== c ? (f = { parent: c, cache: c }, a.memoizedState = f, a.lanes === 0 && (a.memoizedState = a.updateQueue.baseState = f), tn(a, It, c)) : (c = r.cache, tn(a, It, c), c !== f.cache && uu(
          a,
          [It],
          u,
          !0
        ))), Rt(
          l,
          a,
          a.pendingProps.children,
          u
        ), a.child;
      case 29:
        throw a.pendingProps;
    }
    throw Error(g(156, a.tag));
  }
  function hu(l) {
    l.flags |= 4;
  }
  function Bp(l, a, u, c, f) {
    if ((a = (l.mode & 32) !== 0) && (a = !1), a) {
      if (l.flags |= 16777216, (f & 335544128) === f)
        if (l.stateNode.complete) l.flags |= 8192;
        else if (pg()) l.flags |= 8192;
        else
          throw Ni = Nc, xc;
    } else l.flags &= -16777217;
  }
  function qp(l, a) {
    if (a.type !== "stylesheet" || (a.state.loading & 4) !== 0)
      l.flags &= -16777217;
    else if (l.flags |= 16777216, !An(a))
      if (pg()) l.flags |= 8192;
      else
        throw Ni = Nc, xc;
  }
  function Vl(l, a) {
    a !== null && (l.flags |= 4), l.flags & 16384 && (a = l.tag !== 22 ? fc() : 536870912, l.lanes |= a, Gt |= a);
  }
  function es(l, a) {
    if (!Le)
      switch (l.tailMode) {
        case "hidden":
          a = l.tail;
          for (var u = null; a !== null; )
            a.alternate !== null && (u = a), a = a.sibling;
          u === null ? l.tail = null : u.sibling = null;
          break;
        case "collapsed":
          u = l.tail;
          for (var c = null; u !== null; )
            u.alternate !== null && (c = u), u = u.sibling;
          c === null ? a || l.tail === null ? l.tail = null : l.tail.sibling = null : c.sibling = null;
      }
  }
  function Ae(l) {
    var a = l.alternate !== null && l.alternate.child === l.child, u = 0, c = 0;
    if (a)
      for (var f = l.child; f !== null; )
        u |= f.lanes | f.childLanes, c |= f.subtreeFlags & 65011712, c |= f.flags & 65011712, f.return = l, f = f.sibling;
    else
      for (f = l.child; f !== null; )
        u |= f.lanes | f.childLanes, c |= f.subtreeFlags, c |= f.flags, f.return = l, f = f.sibling;
    return l.subtreeFlags |= c, l.childLanes = u, a;
  }
  function ig(l, a, u) {
    var c = a.pendingProps;
    switch (Td(a), a.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Ae(a), null;
      case 1:
        return Ae(a), null;
      case 3:
        return u = a.stateNode, c = null, l !== null && (c = l.memoizedState.cache), a.memoizedState.cache !== c && (a.flags |= 2048), Ra(It), On(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (l === null || l.child === null) && (au(a) ? hu(a) : l === null || l.memoizedState.isDehydrated && (a.flags & 256) === 0 || (a.flags |= 1024, Im())), Ae(a), null;
      case 26:
        var f = a.type, r = a.memoizedState;
        return l === null ? (hu(a), r !== null ? (Ae(a), qp(a, r)) : (Ae(a), Bp(
          a,
          f,
          null,
          c,
          u
        ))) : r ? r !== l.memoizedState ? (hu(a), Ae(a), qp(a, r)) : (Ae(a), a.flags &= -16777217) : (l = l.memoizedProps, l !== c && hu(a), Ae(a), Bp(
          a,
          f,
          l,
          c,
          u
        )), null;
      case 27:
        if (le(a), u = Wn.current, f = a.type, l !== null && a.stateNode != null)
          l.memoizedProps !== c && hu(a);
        else {
          if (!c) {
            if (a.stateNode === null)
              throw Error(g(166));
            return Ae(a), null;
          }
          l = fe.current, au(a) ? Af(a) : (l = bs(f, c, u), a.stateNode = l, hu(a));
        }
        return Ae(a), null;
      case 5:
        if (le(a), f = a.type, l !== null && a.stateNode != null)
          l.memoizedProps !== c && hu(a);
        else {
          if (!c) {
            if (a.stateNode === null)
              throw Error(g(166));
            return Ae(a), null;
          }
          if (r = fe.current, au(a))
            Af(a);
          else {
            var p = ki(
              Wn.current
            );
            switch (r) {
              case 1:
                r = p.createElementNS(
                  "http://www.w3.org/2000/svg",
                  f
                );
                break;
              case 2:
                r = p.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  f
                );
                break;
              default:
                switch (f) {
                  case "svg":
                    r = p.createElementNS(
                      "http://www.w3.org/2000/svg",
                      f
                    );
                    break;
                  case "math":
                    r = p.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      f
                    );
                    break;
                  case "script":
                    r = p.createElement("div"), r.innerHTML = "<script><\/script>", r = r.removeChild(
                      r.firstChild
                    );
                    break;
                  case "select":
                    r = typeof c.is == "string" ? p.createElement("select", {
                      is: c.is
                    }) : p.createElement("select"), c.multiple ? r.multiple = !0 : c.size && (r.size = c.size);
                    break;
                  default:
                    r = typeof c.is == "string" ? p.createElement(f, { is: c.is }) : p.createElement(f);
                }
            }
            r[ht] = a, r[Wl] = c;
            e: for (p = a.child; p !== null; ) {
              if (p.tag === 5 || p.tag === 6)
                r.appendChild(p.stateNode);
              else if (p.tag !== 4 && p.tag !== 27 && p.child !== null) {
                p.child.return = p, p = p.child;
                continue;
              }
              if (p === a) break e;
              for (; p.sibling === null; ) {
                if (p.return === null || p.return === a)
                  break e;
                p = p.return;
              }
              p.sibling.return = p.return, p = p.sibling;
            }
            a.stateNode = r;
            e: switch (Bl(r, f, c), f) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                c = !!c.autoFocus;
                break e;
              case "img":
                c = !0;
                break e;
              default:
                c = !1;
            }
            c && hu(a);
          }
        }
        return Ae(a), Bp(
          a,
          a.type,
          l === null ? null : l.memoizedProps,
          a.pendingProps,
          u
        ), null;
      case 6:
        if (l && a.stateNode != null)
          l.memoizedProps !== c && hu(a);
        else {
          if (typeof c != "string" && a.stateNode === null)
            throw Error(g(166));
          if (l = Wn.current, au(a)) {
            if (l = a.stateNode, u = a.memoizedProps, c = null, f = bl, f !== null)
              switch (f.tag) {
                case 27:
                case 5:
                  c = f.memoizedProps;
              }
            l[ht] = a, l = !!(l.nodeValue === u || c !== null && c.suppressHydrationWarning === !0 || iy(l.nodeValue, u)), l || ia(a, !0);
          } else
            l = ki(l).createTextNode(
              c
            ), l[ht] = a, a.stateNode = l;
        }
        return Ae(a), null;
      case 31:
        if (u = a.memoizedState, l === null || l.memoizedState !== null) {
          if (c = au(a), u !== null) {
            if (l === null) {
              if (!c) throw Error(g(318));
              if (l = a.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(g(557));
              l[ht] = a;
            } else
              Mi(), (a.flags & 128) === 0 && (a.memoizedState = null), a.flags |= 4;
            Ae(a), l = !1;
          } else
            u = Im(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = u), l = !0;
          if (!l)
            return a.flags & 256 ? (nn(a), a) : (nn(a), null);
          if ((a.flags & 128) !== 0)
            throw Error(g(558));
        }
        return Ae(a), null;
      case 13:
        if (c = a.memoizedState, l === null || l.memoizedState !== null && l.memoizedState.dehydrated !== null) {
          if (f = au(a), c !== null && c.dehydrated !== null) {
            if (l === null) {
              if (!f) throw Error(g(318));
              if (f = a.memoizedState, f = f !== null ? f.dehydrated : null, !f) throw Error(g(317));
              f[ht] = a;
            } else
              Mi(), (a.flags & 128) === 0 && (a.memoizedState = null), a.flags |= 4;
            Ae(a), f = !1;
          } else
            f = Im(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = f), f = !0;
          if (!f)
            return a.flags & 256 ? (nn(a), a) : (nn(a), null);
        }
        return nn(a), (a.flags & 128) !== 0 ? (a.lanes = u, a) : (u = c !== null, l = l !== null && l.memoizedState !== null, u && (c = a.child, f = null, c.alternate !== null && c.alternate.memoizedState !== null && c.alternate.memoizedState.cachePool !== null && (f = c.alternate.memoizedState.cachePool.pool), r = null, c.memoizedState !== null && c.memoizedState.cachePool !== null && (r = c.memoizedState.cachePool.pool), r !== f && (c.flags |= 2048)), u !== l && u && (a.child.flags |= 8192), Vl(a, a.updateQueue), Ae(a), null);
      case 4:
        return On(), l === null && ys(a.stateNode.containerInfo), Ae(a), null;
      case 10:
        return Ra(a.type), Ae(a), null;
      case 19:
        if (ne(xt), c = a.memoizedState, c === null) return Ae(a), null;
        if (f = (a.flags & 128) !== 0, r = c.rendering, r === null)
          if (f) es(c, !1);
          else {
            if (At !== 0 || l !== null && (l.flags & 128) !== 0)
              for (l = a.child; l !== null; ) {
                if (r = Jo(l), r !== null) {
                  for (a.flags |= 128, es(c, !1), l = r.updateQueue, a.updateQueue = l, Vl(a, l), a.subtreeFlags = 0, l = u, u = a.child; u !== null; )
                    $m(u, l), u = u.sibling;
                  return se(
                    xt,
                    xt.current & 1 | 2
                  ), Le && ua(a, c.treeForkCount), a.child;
                }
                l = l.sibling;
              }
            c.tail !== null && Nl() > at && (a.flags |= 128, f = !0, es(c, !1), a.lanes = 4194304);
          }
        else {
          if (!f)
            if (l = Jo(r), l !== null) {
              if (a.flags |= 128, f = !0, l = l.updateQueue, a.updateQueue = l, Vl(a, l), es(c, !0), c.tail === null && c.tailMode === "hidden" && !r.alternate && !Le)
                return Ae(a), null;
            } else
              2 * Nl() - c.renderingStartTime > at && u !== 536870912 && (a.flags |= 128, f = !0, es(c, !1), a.lanes = 4194304);
          c.isBackwards ? (r.sibling = a.child, a.child = r) : (l = c.last, l !== null ? l.sibling = r : a.child = r, c.last = r);
        }
        return c.tail !== null ? (l = c.tail, c.rendering = l, c.tail = l.sibling, c.renderingStartTime = Nl(), l.sibling = null, u = xt.current, se(
          xt,
          f ? u & 1 | 2 : u & 1
        ), Le && ua(a, c.treeForkCount), l) : (Ae(a), null);
      case 22:
      case 23:
        return nn(a), Qo(), c = a.memoizedState !== null, l !== null ? l.memoizedState !== null !== c && (a.flags |= 8192) : c && (a.flags |= 8192), c ? (u & 536870912) !== 0 && (a.flags & 128) === 0 && (Ae(a), a.subtreeFlags & 6 && (a.flags |= 8192)) : Ae(a), u = a.updateQueue, u !== null && Vl(a, u.retryQueue), u = null, l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (u = l.memoizedState.cachePool.pool), c = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (c = a.memoizedState.cachePool.pool), c !== u && (a.flags |= 2048), l !== null && ne(Nn), null;
      case 24:
        return u = null, l !== null && (u = l.memoizedState.cache), a.memoizedState.cache !== u && (a.flags |= 2048), Ra(It), Ae(a), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(g(156, a.tag));
  }
  function cg(l, a) {
    switch (Td(a), a.tag) {
      case 1:
        return l = a.flags, l & 65536 ? (a.flags = l & -65537 | 128, a) : null;
      case 3:
        return Ra(It), On(), l = a.flags, (l & 65536) !== 0 && (l & 128) === 0 ? (a.flags = l & -65537 | 128, a) : null;
      case 26:
      case 27:
      case 5:
        return le(a), null;
      case 31:
        if (a.memoizedState !== null) {
          if (nn(a), a.alternate === null)
            throw Error(g(340));
          Mi();
        }
        return l = a.flags, l & 65536 ? (a.flags = l & -65537 | 128, a) : null;
      case 13:
        if (nn(a), l = a.memoizedState, l !== null && l.dehydrated !== null) {
          if (a.alternate === null)
            throw Error(g(340));
          Mi();
        }
        return l = a.flags, l & 65536 ? (a.flags = l & -65537 | 128, a) : null;
      case 19:
        return ne(xt), null;
      case 4:
        return On(), null;
      case 10:
        return Ra(a.type), null;
      case 22:
      case 23:
        return nn(a), Qo(), l !== null && ne(Nn), l = a.flags, l & 65536 ? (a.flags = l & -65537 | 128, a) : null;
      case 24:
        return Ra(It), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function og(l, a) {
    switch (Td(a), a.tag) {
      case 3:
        Ra(It), On();
        break;
      case 26:
      case 27:
      case 5:
        le(a);
        break;
      case 4:
        On();
        break;
      case 31:
        a.memoizedState !== null && nn(a);
        break;
      case 13:
        nn(a);
        break;
      case 19:
        ne(xt);
        break;
      case 10:
        Ra(a.type);
        break;
      case 22:
      case 23:
        nn(a), Qo(), l !== null && ne(Nn);
        break;
      case 24:
        Ra(It);
    }
  }
  function oa(l, a) {
    try {
      var u = a.updateQueue, c = u !== null ? u.lastEffect : null;
      if (c !== null) {
        var f = c.next;
        u = f;
        do {
          if ((u.tag & l) === l) {
            c = void 0;
            var r = u.create, p = u.inst;
            c = r(), p.destroy = c;
          }
          u = u.next;
        } while (u !== f);
      }
    } catch (E) {
      rt(a, a.return, E);
    }
  }
  function Gn(l, a, u) {
    try {
      var c = a.updateQueue, f = c !== null ? c.lastEffect : null;
      if (f !== null) {
        var r = f.next;
        c = r;
        do {
          if ((c.tag & l) === l) {
            var p = c.inst, E = p.destroy;
            if (E !== void 0) {
              p.destroy = void 0, f = a;
              var O = u, H = E;
              try {
                H();
              } catch (L) {
                rt(
                  f,
                  O,
                  L
                );
              }
            }
          }
          c = c.next;
        } while (c !== r);
      }
    } catch (L) {
      rt(a, a.return, L);
    }
  }
  function eh(l) {
    var a = l.updateQueue;
    if (a !== null) {
      var u = l.stateNode;
      try {
        wi(a, u);
      } catch (c) {
        rt(l, l.return, c);
      }
    }
  }
  function Zi(l, a, u) {
    u.props = Xi(
      l.type,
      l.memoizedProps
    ), u.state = l.memoizedState;
    try {
      u.componentWillUnmount();
    } catch (c) {
      rt(l, a, c);
    }
  }
  function mu(l, a) {
    try {
      var u = l.ref;
      if (u !== null) {
        switch (l.tag) {
          case 26:
          case 27:
          case 5:
            var c = l.stateNode;
            break;
          case 30:
            c = l.stateNode;
            break;
          default:
            c = l.stateNode;
        }
        typeof u == "function" ? l.refCleanup = u(c) : u.current = c;
      }
    } catch (f) {
      rt(l, a, f);
    }
  }
  function xa(l, a) {
    var u = l.ref, c = l.refCleanup;
    if (u !== null)
      if (typeof c == "function")
        try {
          c();
        } catch (f) {
          rt(l, a, f);
        } finally {
          l.refCleanup = null, l = l.alternate, l != null && (l.refCleanup = null);
        }
      else if (typeof u == "function")
        try {
          u(null);
        } catch (f) {
          rt(l, a, f);
        }
      else u.current = null;
  }
  function jp(l) {
    var a = l.type, u = l.memoizedProps, c = l.stateNode;
    try {
      e: switch (a) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          u.autoFocus && c.focus();
          break e;
        case "img":
          u.src ? c.src = u.src : u.srcSet && (c.srcset = u.srcSet);
      }
    } catch (f) {
      rt(l, l.return, f);
    }
  }
  function th(l, a, u) {
    try {
      var c = l.stateNode;
      oy(c, l.type, u, a), c[Wl] = a;
    } catch (f) {
      rt(l, l.return, f);
    }
  }
  function wp(l) {
    return l.tag === 5 || l.tag === 3 || l.tag === 26 || l.tag === 27 && ja(l.type) || l.tag === 4;
  }
  function ts(l) {
    e: for (; ; ) {
      for (; l.sibling === null; ) {
        if (l.return === null || wp(l.return)) return null;
        l = l.return;
      }
      for (l.sibling.return = l.return, l = l.sibling; l.tag !== 5 && l.tag !== 6 && l.tag !== 18; ) {
        if (l.tag === 27 && ja(l.type) || l.flags & 2 || l.child === null || l.tag === 4) continue e;
        l.child.return = l, l = l.child;
      }
      if (!(l.flags & 2)) return l.stateNode;
    }
  }
  function ls(l, a, u) {
    var c = l.tag;
    if (c === 5 || c === 6)
      l = l.stateNode, a ? (u.nodeType === 9 ? u.body : u.nodeName === "HTML" ? u.ownerDocument.body : u).insertBefore(l, a) : (a = u.nodeType === 9 ? u.body : u.nodeName === "HTML" ? u.ownerDocument.body : u, a.appendChild(l), u = u._reactRootContainer, u != null || a.onclick !== null || (a.onclick = va));
    else if (c !== 4 && (c === 27 && ja(l.type) && (u = l.stateNode, a = null), l = l.child, l !== null))
      for (ls(l, a, u), l = l.sibling; l !== null; )
        ls(l, a, u), l = l.sibling;
  }
  function ns(l, a, u) {
    var c = l.tag;
    if (c === 5 || c === 6)
      l = l.stateNode, a ? u.insertBefore(l, a) : u.appendChild(l);
    else if (c !== 4 && (c === 27 && ja(l.type) && (u = l.stateNode), l = l.child, l !== null))
      for (ns(l, a, u), l = l.sibling; l !== null; )
        ns(l, a, u), l = l.sibling;
  }
  function Yp(l) {
    var a = l.stateNode, u = l.memoizedProps;
    try {
      for (var c = l.type, f = a.attributes; f.length; )
        a.removeAttributeNode(f[0]);
      Bl(a, c, u), a[ht] = l, a[Wl] = u;
    } catch (r) {
      rt(l, l.return, r);
    }
  }
  var ti = !1, ul = !1, lh = !1, Gp = typeof WeakSet == "function" ? WeakSet : Set, Al = null;
  function as(l, a) {
    if (l = l.containerInfo, Th = dl, l = Di(l), yf(l)) {
      if ("selectionStart" in l)
        var u = {
          start: l.selectionStart,
          end: l.selectionEnd
        };
      else
        e: {
          u = (u = l.ownerDocument) && u.defaultView || window;
          var c = u.getSelection && u.getSelection();
          if (c && c.rangeCount !== 0) {
            u = c.anchorNode;
            var f = c.anchorOffset, r = c.focusNode;
            c = c.focusOffset;
            try {
              u.nodeType, r.nodeType;
            } catch {
              u = null;
              break e;
            }
            var p = 0, E = -1, O = -1, H = 0, L = 0, J = l, B = null;
            t: for (; ; ) {
              for (var Y; J !== u || f !== 0 && J.nodeType !== 3 || (E = p + f), J !== r || c !== 0 && J.nodeType !== 3 || (O = p + c), J.nodeType === 3 && (p += J.nodeValue.length), (Y = J.firstChild) !== null; )
                B = J, J = Y;
              for (; ; ) {
                if (J === l) break t;
                if (B === u && ++H === f && (E = p), B === r && ++L === c && (O = p), (Y = J.nextSibling) !== null) break;
                J = B, B = J.parentNode;
              }
              J = Y;
            }
            u = E === -1 || O === -1 ? null : { start: E, end: O };
          } else u = null;
        }
      u = u || { start: 0, end: 0 };
    } else u = null;
    for (Ah = { focusedElem: l, selectionRange: u }, dl = !1, Al = a; Al !== null; )
      if (a = Al, l = a.child, (a.subtreeFlags & 1028) !== 0 && l !== null)
        l.return = a, Al = l;
      else
        for (; Al !== null; ) {
          switch (a = Al, r = a.alternate, l = a.flags, a.tag) {
            case 0:
              if ((l & 4) !== 0 && (l = a.updateQueue, l = l !== null ? l.events : null, l !== null))
                for (u = 0; u < l.length; u++)
                  f = l[u], f.ref.impl = f.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((l & 1024) !== 0 && r !== null) {
                l = void 0, u = a, f = r.memoizedProps, r = r.memoizedState, c = u.stateNode;
                try {
                  var ue = Xi(
                    u.type,
                    f
                  );
                  l = c.getSnapshotBeforeUpdate(
                    ue,
                    r
                  ), c.__reactInternalSnapshotBeforeUpdate = l;
                } catch (ge) {
                  rt(
                    u,
                    u.return,
                    ge
                  );
                }
              }
              break;
            case 3:
              if ((l & 1024) !== 0) {
                if (l = a.stateNode.containerInfo, u = l.nodeType, u === 9)
                  hr(l);
                else if (u === 1)
                  switch (l.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      hr(l);
                      break;
                    default:
                      l.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((l & 1024) !== 0) throw Error(g(163));
          }
          if (l = a.sibling, l !== null) {
            l.return = a.return, Al = l;
            break;
          }
          Al = a.return;
        }
  }
  function Wf(l, a, u) {
    var c = u.flags;
    switch (u.tag) {
      case 0:
      case 11:
      case 15:
        li(l, u), c & 4 && oa(5, u);
        break;
      case 1:
        if (li(l, u), c & 4)
          if (l = u.stateNode, a === null)
            try {
              l.componentDidMount();
            } catch (p) {
              rt(u, u.return, p);
            }
          else {
            var f = Xi(
              u.type,
              a.memoizedProps
            );
            a = a.memoizedState;
            try {
              l.componentDidUpdate(
                f,
                a,
                l.__reactInternalSnapshotBeforeUpdate
              );
            } catch (p) {
              rt(
                u,
                u.return,
                p
              );
            }
          }
        c & 64 && eh(u), c & 512 && mu(u, u.return);
        break;
      case 3:
        if (li(l, u), c & 64 && (l = u.updateQueue, l !== null)) {
          if (a = null, u.child !== null)
            switch (u.child.tag) {
              case 27:
              case 5:
                a = u.child.stateNode;
                break;
              case 1:
                a = u.child.stateNode;
            }
          try {
            wi(l, a);
          } catch (p) {
            rt(u, u.return, p);
          }
        }
        break;
      case 27:
        a === null && c & 4 && Yp(u);
      case 26:
      case 5:
        li(l, u), a === null && c & 4 && jp(u), c & 512 && mu(u, u.return);
        break;
      case 12:
        li(l, u);
        break;
      case 31:
        li(l, u), c & 4 && sg(l, u);
        break;
      case 13:
        li(l, u), c & 4 && Vp(l, u), c & 64 && (l = u.memoizedState, l !== null && (l = l.dehydrated, l !== null && (u = Xn.bind(
          null,
          u
        ), vs(l, u))));
        break;
      case 22:
        if (c = u.memoizedState !== null || ti, !c) {
          a = a !== null && a.memoizedState !== null || ul, f = ti;
          var r = ul;
          ti = c, (ul = a) && !r ? Na(
            l,
            u,
            (u.subtreeFlags & 8772) !== 0
          ) : li(l, u), ti = f, ul = r;
        }
        break;
      case 30:
        break;
      default:
        li(l, u);
    }
  }
  function Xp(l) {
    var a = l.alternate;
    a !== null && (l.alternate = null, Xp(a)), l.child = null, l.deletions = null, l.sibling = null, l.tag === 5 && (a = l.stateNode, a !== null && Ir(a)), l.stateNode = null, l.return = null, l.dependencies = null, l.memoizedProps = null, l.memoizedState = null, l.pendingProps = null, l.stateNode = null, l.updateQueue = null;
  }
  var Tt = null, cn = !1;
  function pu(l, a, u) {
    for (u = u.child; u !== null; )
      Lp(l, a, u), u = u.sibling;
  }
  function Lp(l, a, u) {
    if (pn && typeof pn.onCommitFiberUnmount == "function")
      try {
        pn.onCommitFiberUnmount(sc, u);
      } catch {
      }
    switch (u.tag) {
      case 26:
        ul || xa(u, a), pu(
          l,
          a,
          u
        ), u.memoizedState ? u.memoizedState.count-- : u.stateNode && (u = u.stateNode, u.parentNode.removeChild(u));
        break;
      case 27:
        ul || xa(u, a);
        var c = Tt, f = cn;
        ja(u.type) && (Tt = u.stateNode, cn = !1), pu(
          l,
          a,
          u
        ), Ic(u.stateNode), Tt = c, cn = f;
        break;
      case 5:
        ul || xa(u, a);
      case 6:
        if (c = Tt, f = cn, Tt = null, pu(
          l,
          a,
          u
        ), Tt = c, cn = f, Tt !== null)
          if (cn)
            try {
              (Tt.nodeType === 9 ? Tt.body : Tt.nodeName === "HTML" ? Tt.ownerDocument.body : Tt).removeChild(u.stateNode);
            } catch (r) {
              rt(
                u,
                a,
                r
              );
            }
          else
            try {
              Tt.removeChild(u.stateNode);
            } catch (r) {
              rt(
                u,
                a,
                r
              );
            }
        break;
      case 18:
        Tt !== null && (cn ? (l = Tt, dy(
          l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l,
          u.stateNode
        ), Ms(l)) : dy(Tt, u.stateNode));
        break;
      case 4:
        c = Tt, f = cn, Tt = u.stateNode.containerInfo, cn = !0, pu(
          l,
          a,
          u
        ), Tt = c, cn = f;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Gn(2, u, a), ul || Gn(4, u, a), pu(
          l,
          a,
          u
        );
        break;
      case 1:
        ul || (xa(u, a), c = u.stateNode, typeof c.componentWillUnmount == "function" && Zi(
          u,
          a,
          c
        )), pu(
          l,
          a,
          u
        );
        break;
      case 21:
        pu(
          l,
          a,
          u
        );
        break;
      case 22:
        ul = (c = ul) || u.memoizedState !== null, pu(
          l,
          a,
          u
        ), ul = c;
        break;
      default:
        pu(
          l,
          a,
          u
        );
    }
  }
  function sg(l, a) {
    if (a.memoizedState === null && (l = a.alternate, l !== null && (l = l.memoizedState, l !== null))) {
      l = l.dehydrated;
      try {
        Ms(l);
      } catch (u) {
        rt(a, a.return, u);
      }
    }
  }
  function Vp(l, a) {
    if (a.memoizedState === null && (l = a.alternate, l !== null && (l = l.memoizedState, l !== null && (l = l.dehydrated, l !== null))))
      try {
        Ms(l);
      } catch (u) {
        rt(a, a.return, u);
      }
  }
  function Ff(l) {
    switch (l.tag) {
      case 31:
      case 13:
      case 19:
        var a = l.stateNode;
        return a === null && (a = l.stateNode = new Gp()), a;
      case 22:
        return l = l.stateNode, a = l._retryCache, a === null && (a = l._retryCache = new Gp()), a;
      default:
        throw Error(g(435, l.tag));
    }
  }
  function If(l, a) {
    var u = Ff(l);
    a.forEach(function(c) {
      if (!u.has(c)) {
        u.add(c);
        var f = Cg.bind(null, l, c);
        c.then(f, f);
      }
    });
  }
  function on(l, a) {
    var u = a.deletions;
    if (u !== null)
      for (var c = 0; c < u.length; c++) {
        var f = u[c], r = l, p = a, E = p;
        e: for (; E !== null; ) {
          switch (E.tag) {
            case 27:
              if (ja(E.type)) {
                Tt = E.stateNode, cn = !1;
                break e;
              }
              break;
            case 5:
              Tt = E.stateNode, cn = !1;
              break e;
            case 3:
            case 4:
              Tt = E.stateNode.containerInfo, cn = !0;
              break e;
          }
          E = E.return;
        }
        if (Tt === null) throw Error(g(160));
        Lp(r, p, f), Tt = null, cn = !1, r = f.alternate, r !== null && (r.return = null), f.return = null;
      }
    if (a.subtreeFlags & 13886)
      for (a = a.child; a !== null; )
        nh(a, l), a = a.sibling;
  }
  var xe = null;
  function nh(l, a) {
    var u = l.alternate, c = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        on(a, l), vn(l), c & 4 && (Gn(3, l, l.return), oa(3, l), Gn(5, l, l.return));
        break;
      case 1:
        on(a, l), vn(l), c & 512 && (ul || u === null || xa(u, u.return)), c & 64 && ti && (l = l.updateQueue, l !== null && (c = l.callbacks, c !== null && (u = l.shared.hiddenCallbacks, l.shared.hiddenCallbacks = u === null ? c : u.concat(c))));
        break;
      case 26:
        var f = xe;
        if (on(a, l), vn(l), c & 512 && (ul || u === null || xa(u, u.return)), c & 4) {
          var r = u !== null ? u.memoizedState : null;
          if (c = l.memoizedState, u === null)
            if (c === null)
              if (l.stateNode === null) {
                e: {
                  c = l.type, u = l.memoizedProps, f = f.ownerDocument || f;
                  t: switch (c) {
                    case "title":
                      r = f.getElementsByTagName("title")[0], (!r || r[$a] || r[ht] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = f.createElement(c), f.head.insertBefore(
                        r,
                        f.querySelector("head > title")
                      )), Bl(r, c, u), r[ht] = l, ct(r), c = r;
                      break e;
                    case "link":
                      var p = yy(
                        "link",
                        "href",
                        f
                      ).get(c + (u.href || ""));
                      if (p) {
                        for (var E = 0; E < p.length; E++)
                          if (r = p[E], r.getAttribute("href") === (u.href == null || u.href === "" ? null : u.href) && r.getAttribute("rel") === (u.rel == null ? null : u.rel) && r.getAttribute("title") === (u.title == null ? null : u.title) && r.getAttribute("crossorigin") === (u.crossOrigin == null ? null : u.crossOrigin)) {
                            p.splice(E, 1);
                            break t;
                          }
                      }
                      r = f.createElement(c), Bl(r, c, u), f.head.appendChild(r);
                      break;
                    case "meta":
                      if (p = yy(
                        "meta",
                        "content",
                        f
                      ).get(c + (u.content || ""))) {
                        for (E = 0; E < p.length; E++)
                          if (r = p[E], r.getAttribute("content") === (u.content == null ? null : "" + u.content) && r.getAttribute("name") === (u.name == null ? null : u.name) && r.getAttribute("property") === (u.property == null ? null : u.property) && r.getAttribute("http-equiv") === (u.httpEquiv == null ? null : u.httpEquiv) && r.getAttribute("charset") === (u.charSet == null ? null : u.charSet)) {
                            p.splice(E, 1);
                            break t;
                          }
                      }
                      r = f.createElement(c), Bl(r, c, u), f.head.appendChild(r);
                      break;
                    default:
                      throw Error(g(468, c));
                  }
                  r[ht] = l, ct(r), c = r;
                }
                l.stateNode = c;
              } else
                Rh(
                  f,
                  l.type,
                  l.stateNode
                );
            else
              l.stateNode = py(
                f,
                c,
                l.memoizedProps
              );
          else
            r !== c ? (r === null ? u.stateNode !== null && (u = u.stateNode, u.parentNode.removeChild(u)) : r.count--, c === null ? Rh(
              f,
              l.type,
              l.stateNode
            ) : py(
              f,
              c,
              l.memoizedProps
            )) : c === null && l.stateNode !== null && th(
              l,
              l.memoizedProps,
              u.memoizedProps
            );
        }
        break;
      case 27:
        on(a, l), vn(l), c & 512 && (ul || u === null || xa(u, u.return)), u !== null && c & 4 && th(
          l,
          l.memoizedProps,
          u.memoizedProps
        );
        break;
      case 5:
        if (on(a, l), vn(l), c & 512 && (ul || u === null || xa(u, u.return)), l.flags & 32) {
          f = l.stateNode;
          try {
            Wa(f, "");
          } catch (ue) {
            rt(l, l.return, ue);
          }
        }
        c & 4 && l.stateNode != null && (f = l.memoizedProps, th(
          l,
          f,
          u !== null ? u.memoizedProps : f
        )), c & 1024 && (lh = !0);
        break;
      case 6:
        if (on(a, l), vn(l), c & 4) {
          if (l.stateNode === null)
            throw Error(g(162));
          c = l.memoizedProps, u = l.stateNode;
          try {
            u.nodeValue = c;
          } catch (ue) {
            rt(l, l.return, ue);
          }
        }
        break;
      case 3:
        if (zs = null, f = xe, xe = Ql(a.containerInfo), on(a, l), xe = f, vn(l), c & 4 && u !== null && u.memoizedState.isDehydrated)
          try {
            Ms(a.containerInfo);
          } catch (ue) {
            rt(l, l.return, ue);
          }
        lh && (lh = !1, Qp(l));
        break;
      case 4:
        c = xe, xe = Ql(
          l.stateNode.containerInfo
        ), on(a, l), vn(l), xe = c;
        break;
      case 12:
        on(a, l), vn(l);
        break;
      case 31:
        on(a, l), vn(l), c & 4 && (c = l.updateQueue, c !== null && (l.updateQueue = null, If(l, c)));
        break;
      case 13:
        on(a, l), vn(l), l.child.flags & 8192 && l.memoizedState !== null != (u !== null && u.memoizedState !== null) && (qa = Nl()), c & 4 && (c = l.updateQueue, c !== null && (l.updateQueue = null, If(l, c)));
        break;
      case 22:
        f = l.memoizedState !== null;
        var O = u !== null && u.memoizedState !== null, H = ti, L = ul;
        if (ti = H || f, ul = L || O, on(a, l), ul = L, ti = H, vn(l), c & 8192)
          e: for (a = l.stateNode, a._visibility = f ? a._visibility & -2 : a._visibility | 1, f && (u === null || O || ti || ul || Zc(l)), u = null, a = l; ; ) {
            if (a.tag === 5 || a.tag === 26) {
              if (u === null) {
                O = u = a;
                try {
                  if (r = O.stateNode, f)
                    p = r.style, typeof p.setProperty == "function" ? p.setProperty("display", "none", "important") : p.display = "none";
                  else {
                    E = O.stateNode;
                    var J = O.memoizedProps.style, B = J != null && J.hasOwnProperty("display") ? J.display : null;
                    E.style.display = B == null || typeof B == "boolean" ? "" : ("" + B).trim();
                  }
                } catch (ue) {
                  rt(O, O.return, ue);
                }
              }
            } else if (a.tag === 6) {
              if (u === null) {
                O = a;
                try {
                  O.stateNode.nodeValue = f ? "" : O.memoizedProps;
                } catch (ue) {
                  rt(O, O.return, ue);
                }
              }
            } else if (a.tag === 18) {
              if (u === null) {
                O = a;
                try {
                  var Y = O.stateNode;
                  f ? tl(Y, !0) : tl(O.stateNode, !1);
                } catch (ue) {
                  rt(O, O.return, ue);
                }
              }
            } else if ((a.tag !== 22 && a.tag !== 23 || a.memoizedState === null || a === l) && a.child !== null) {
              a.child.return = a, a = a.child;
              continue;
            }
            if (a === l) break e;
            for (; a.sibling === null; ) {
              if (a.return === null || a.return === l) break e;
              u === a && (u = null), a = a.return;
            }
            u === a && (u = null), a.sibling.return = a.return, a = a.sibling;
          }
        c & 4 && (c = l.updateQueue, c !== null && (u = c.retryQueue, u !== null && (c.retryQueue = null, If(l, u))));
        break;
      case 19:
        on(a, l), vn(l), c & 4 && (c = l.updateQueue, c !== null && (l.updateQueue = null, If(l, c)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        on(a, l), vn(l);
    }
  }
  function vn(l) {
    var a = l.flags;
    if (a & 2) {
      try {
        for (var u, c = l.return; c !== null; ) {
          if (wp(c)) {
            u = c;
            break;
          }
          c = c.return;
        }
        if (u == null) throw Error(g(160));
        switch (u.tag) {
          case 27:
            var f = u.stateNode, r = ts(l);
            ns(l, r, f);
            break;
          case 5:
            var p = u.stateNode;
            u.flags & 32 && (Wa(p, ""), u.flags &= -33);
            var E = ts(l);
            ns(l, E, p);
            break;
          case 3:
          case 4:
            var O = u.stateNode.containerInfo, H = ts(l);
            ls(
              l,
              H,
              O
            );
            break;
          default:
            throw Error(g(161));
        }
      } catch (L) {
        rt(l, l.return, L);
      }
      l.flags &= -3;
    }
    a & 4096 && (l.flags &= -4097);
  }
  function Qp(l) {
    if (l.subtreeFlags & 1024)
      for (l = l.child; l !== null; ) {
        var a = l;
        Qp(a), a.tag === 5 && a.flags & 1024 && a.stateNode.reset(), l = l.sibling;
      }
  }
  function li(l, a) {
    if (a.subtreeFlags & 8772)
      for (a = a.child; a !== null; )
        Wf(l, a.alternate, a), a = a.sibling;
  }
  function Zc(l) {
    for (l = l.child; l !== null; ) {
      var a = l;
      switch (a.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Gn(4, a, a.return), Zc(a);
          break;
        case 1:
          xa(a, a.return);
          var u = a.stateNode;
          typeof u.componentWillUnmount == "function" && Zi(
            a,
            a.return,
            u
          ), Zc(a);
          break;
        case 27:
          Ic(a.stateNode);
        case 26:
        case 5:
          xa(a, a.return), Zc(a);
          break;
        case 22:
          a.memoizedState === null && Zc(a);
          break;
        case 30:
          Zc(a);
          break;
        default:
          Zc(a);
      }
      l = l.sibling;
    }
  }
  function Na(l, a, u) {
    for (u = u && (a.subtreeFlags & 8772) !== 0, a = a.child; a !== null; ) {
      var c = a.alternate, f = l, r = a, p = r.flags;
      switch (r.tag) {
        case 0:
        case 11:
        case 15:
          Na(
            f,
            r,
            u
          ), oa(4, r);
          break;
        case 1:
          if (Na(
            f,
            r,
            u
          ), c = r, f = c.stateNode, typeof f.componentDidMount == "function")
            try {
              f.componentDidMount();
            } catch (H) {
              rt(c, c.return, H);
            }
          if (c = r, f = c.updateQueue, f !== null) {
            var E = c.stateNode;
            try {
              var O = f.shared.hiddenCallbacks;
              if (O !== null)
                for (f.shared.hiddenCallbacks = null, f = 0; f < O.length; f++)
                  Rd(O[f], E);
            } catch (H) {
              rt(c, c.return, H);
            }
          }
          u && p & 64 && eh(r), mu(r, r.return);
          break;
        case 27:
          Yp(r);
        case 26:
        case 5:
          Na(
            f,
            r,
            u
          ), u && c === null && p & 4 && jp(r), mu(r, r.return);
          break;
        case 12:
          Na(
            f,
            r,
            u
          );
          break;
        case 31:
          Na(
            f,
            r,
            u
          ), u && p & 4 && sg(f, r);
          break;
        case 13:
          Na(
            f,
            r,
            u
          ), u && p & 4 && Vp(f, r);
          break;
        case 22:
          r.memoizedState === null && Na(
            f,
            r,
            u
          ), mu(r, r.return);
          break;
        case 30:
          break;
        default:
          Na(
            f,
            r,
            u
          );
      }
      a = a.sibling;
    }
  }
  function ah(l, a) {
    var u = null;
    l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (u = l.memoizedState.cachePool.pool), l = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (l = a.memoizedState.cachePool.pool), l !== u && (l != null && l.refCount++, u != null && Df(u));
  }
  function uh(l, a) {
    l = null, a.alternate !== null && (l = a.alternate.memoizedState.cache), a = a.memoizedState.cache, a !== l && (a.refCount++, l != null && Df(l));
  }
  function sa(l, a, u, c) {
    if (a.subtreeFlags & 10256)
      for (a = a.child; a !== null; )
        us(
          l,
          a,
          u,
          c
        ), a = a.sibling;
  }
  function us(l, a, u, c) {
    var f = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        sa(
          l,
          a,
          u,
          c
        ), f & 2048 && oa(9, a);
        break;
      case 1:
        sa(
          l,
          a,
          u,
          c
        );
        break;
      case 3:
        sa(
          l,
          a,
          u,
          c
        ), f & 2048 && (l = null, a.alternate !== null && (l = a.alternate.memoizedState.cache), a = a.memoizedState.cache, a !== l && (a.refCount++, l != null && Df(l)));
        break;
      case 12:
        if (f & 2048) {
          sa(
            l,
            a,
            u,
            c
          ), l = a.stateNode;
          try {
            var r = a.memoizedProps, p = r.id, E = r.onPostCommit;
            typeof E == "function" && E(
              p,
              a.alternate === null ? "mount" : "update",
              l.passiveEffectDuration,
              -0
            );
          } catch (O) {
            rt(a, a.return, O);
          }
        } else
          sa(
            l,
            a,
            u,
            c
          );
        break;
      case 31:
        sa(
          l,
          a,
          u,
          c
        );
        break;
      case 13:
        sa(
          l,
          a,
          u,
          c
        );
        break;
      case 23:
        break;
      case 22:
        r = a.stateNode, p = a.alternate, a.memoizedState !== null ? r._visibility & 2 ? sa(
          l,
          a,
          u,
          c
        ) : Pf(l, a) : r._visibility & 2 ? sa(
          l,
          a,
          u,
          c
        ) : (r._visibility |= 2, is(
          l,
          a,
          u,
          c,
          (a.subtreeFlags & 10256) !== 0 || !1
        )), f & 2048 && ah(p, a);
        break;
      case 24:
        sa(
          l,
          a,
          u,
          c
        ), f & 2048 && uh(a.alternate, a);
        break;
      default:
        sa(
          l,
          a,
          u,
          c
        );
    }
  }
  function is(l, a, u, c, f) {
    for (f = f && ((a.subtreeFlags & 10256) !== 0 || !1), a = a.child; a !== null; ) {
      var r = l, p = a, E = u, O = c, H = p.flags;
      switch (p.tag) {
        case 0:
        case 11:
        case 15:
          is(
            r,
            p,
            E,
            O,
            f
          ), oa(8, p);
          break;
        case 23:
          break;
        case 22:
          var L = p.stateNode;
          p.memoizedState !== null ? L._visibility & 2 ? is(
            r,
            p,
            E,
            O,
            f
          ) : Pf(
            r,
            p
          ) : (L._visibility |= 2, is(
            r,
            p,
            E,
            O,
            f
          )), f && H & 2048 && ah(
            p.alternate,
            p
          );
          break;
        case 24:
          is(
            r,
            p,
            E,
            O,
            f
          ), f && H & 2048 && uh(p.alternate, p);
          break;
        default:
          is(
            r,
            p,
            E,
            O,
            f
          );
      }
      a = a.sibling;
    }
  }
  function Pf(l, a) {
    if (a.subtreeFlags & 10256)
      for (a = a.child; a !== null; ) {
        var u = l, c = a, f = c.flags;
        switch (c.tag) {
          case 22:
            Pf(u, c), f & 2048 && ah(
              c.alternate,
              c
            );
            break;
          case 24:
            Pf(u, c), f & 2048 && uh(c.alternate, c);
            break;
          default:
            Pf(u, c);
        }
        a = a.sibling;
      }
  }
  var bn = 8192;
  function yu(l, a, u) {
    if (l.subtreeFlags & bn)
      for (l = l.child; l !== null; )
        fg(
          l,
          a,
          u
        ), l = l.sibling;
  }
  function fg(l, a, u) {
    switch (l.tag) {
      case 26:
        yu(
          l,
          a,
          u
        ), l.flags & bn && l.memoizedState !== null && Eu(
          u,
          xe,
          l.memoizedState,
          l.memoizedProps
        );
        break;
      case 5:
        yu(
          l,
          a,
          u
        );
        break;
      case 3:
      case 4:
        var c = xe;
        xe = Ql(l.stateNode.containerInfo), yu(
          l,
          a,
          u
        ), xe = c;
        break;
      case 22:
        l.memoizedState === null && (c = l.alternate, c !== null && c.memoizedState !== null ? (c = bn, bn = 16777216, yu(
          l,
          a,
          u
        ), bn = c) : yu(
          l,
          a,
          u
        ));
        break;
      default:
        yu(
          l,
          a,
          u
        );
    }
  }
  function ih(l) {
    var a = l.alternate;
    if (a !== null && (l = a.child, l !== null)) {
      a.child = null;
      do
        a = l.sibling, l.sibling = null, l = a;
      while (l !== null);
    }
  }
  function cs(l) {
    var a = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (a !== null)
        for (var u = 0; u < a.length; u++) {
          var c = a[u];
          Al = c, ch(
            c,
            l
          );
        }
      ih(l);
    }
    if (l.subtreeFlags & 10256)
      for (l = l.child; l !== null; )
        Zp(l), l = l.sibling;
  }
  function Zp(l) {
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        cs(l), l.flags & 2048 && Gn(9, l, l.return);
        break;
      case 3:
        cs(l);
        break;
      case 12:
        cs(l);
        break;
      case 22:
        var a = l.stateNode;
        l.memoizedState !== null && a._visibility & 2 && (l.return === null || l.return.tag !== 13) ? (a._visibility &= -3, er(l)) : cs(l);
        break;
      default:
        cs(l);
    }
  }
  function er(l) {
    var a = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (a !== null)
        for (var u = 0; u < a.length; u++) {
          var c = a[u];
          Al = c, ch(
            c,
            l
          );
        }
      ih(l);
    }
    for (l = l.child; l !== null; ) {
      switch (a = l, a.tag) {
        case 0:
        case 11:
        case 15:
          Gn(8, a, a.return), er(a);
          break;
        case 22:
          u = a.stateNode, u._visibility & 2 && (u._visibility &= -3, er(a));
          break;
        default:
          er(a);
      }
      l = l.sibling;
    }
  }
  function ch(l, a) {
    for (; Al !== null; ) {
      var u = Al;
      switch (u.tag) {
        case 0:
        case 11:
        case 15:
          Gn(8, u, a);
          break;
        case 23:
        case 22:
          if (u.memoizedState !== null && u.memoizedState.cachePool !== null) {
            var c = u.memoizedState.cachePool.pool;
            c != null && c.refCount++;
          }
          break;
        case 24:
          Df(u.memoizedState.cache);
      }
      if (c = u.child, c !== null) c.return = u, Al = c;
      else
        e: for (u = l; Al !== null; ) {
          c = Al;
          var f = c.sibling, r = c.return;
          if (Xp(c), c === u) {
            Al = null;
            break e;
          }
          if (f !== null) {
            f.return = r, Al = f;
            break e;
          }
          Al = r;
        }
    }
  }
  var rg = {
    getCacheForType: function(l) {
      var a = $(It), u = a.data.get(l);
      return u === void 0 && (u = l(), a.data.set(l, u)), u;
    },
    cacheSignal: function() {
      return $(It).controller.signal;
    }
  }, Jp = typeof WeakMap == "function" ? WeakMap : Map, et = 0, pt = null, Ve = null, Ye = 0, ft = 0, be = null, gu = !1, Ji = !1, oh = !1, Ha = 0, At = 0, Ba = 0, Jc = 0, sh = 0, sn = 0, Gt = 0, tr = null, Xt = null, fh = !1, qa = 0, Kp = 0, at = 1 / 0, os = null, Nt = null, rl = 0, ni = null, Ki = null, vu = 0, Sn = 0, rh = null, dh = null, ss = 0, lr = null;
  function En() {
    return (et & 2) !== 0 && Ye !== 0 ? Ye & -Ye : C.T !== null ? gh() : Wr();
  }
  function dg() {
    if (sn === 0)
      if ((Ye & 536870912) === 0 || Le) {
        var l = pa;
        pa <<= 1, (pa & 3932160) === 0 && (pa = 262144), sn = l;
      } else sn = 536870912;
    return l = ln.current, l !== null && (l.flags |= 32), sn;
  }
  function fn(l, a, u) {
    (l === pt && (ft === 2 || ft === 9) || l.cancelPendingCommit !== null) && (bu(l, 0), ai(
      l,
      Ye,
      sn,
      !1
    )), To(l, u), ((et & 2) === 0 || l !== pt) && (l === pt && ((et & 2) === 0 && (Jc |= u), At === 4 && ai(
      l,
      Ye,
      sn,
      !1
    )), Su(l));
  }
  function hg(l, a, u) {
    if ((et & 6) !== 0) throw Error(g(327));
    var c = !u && (a & 127) === 0 && (a & l.expiredLanes) === 0 || ya(l, a), f = c ? vg(l, a) : mh(l, a, !0), r = c;
    do {
      if (f === 0) {
        Ji && !c && ai(l, a, 0, !1);
        break;
      } else {
        if (u = l.current.alternate, r && !mg(u)) {
          f = mh(l, a, !1), r = !1;
          continue;
        }
        if (f === 2) {
          if (r = a, l.errorRecoveryDisabledLanes & r)
            var p = 0;
          else
            p = l.pendingLanes & -536870913, p = p !== 0 ? p : p & 536870912 ? 536870912 : 0;
          if (p !== 0) {
            a = p;
            e: {
              var E = l;
              f = tr;
              var O = E.current.memoizedState.isDehydrated;
              if (O && (bu(E, p).flags |= 256), p = mh(
                E,
                p,
                !1
              ), p !== 2) {
                if (oh && !O) {
                  E.errorRecoveryDisabledLanes |= r, Jc |= r, f = 4;
                  break e;
                }
                r = Xt, Xt = f, r !== null && (Xt === null ? Xt = r : Xt.push.apply(
                  Xt,
                  r
                ));
              }
              f = p;
            }
            if (r = !1, f !== 2) continue;
          }
        }
        if (f === 1) {
          bu(l, 0), ai(l, a, 0, !0);
          break;
        }
        e: {
          switch (c = l, r = f, r) {
            case 0:
            case 1:
              throw Error(g(345));
            case 4:
              if ((a & 4194048) !== a) break;
            case 6:
              ai(
                c,
                a,
                sn,
                !gu
              );
              break e;
            case 2:
              Xt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(g(329));
          }
          if ((a & 62914560) === a && (f = qa + 300 - Nl(), 10 < f)) {
            if (ai(
              c,
              a,
              sn,
              !gu
            ), Wt(c, 0, !0) !== 0) break e;
            vu = a, c.timeoutHandle = dr(
              nr.bind(
                null,
                c,
                u,
                Xt,
                os,
                fh,
                a,
                sn,
                Jc,
                Gt,
                gu,
                r,
                "Throttled",
                -0,
                0
              ),
              f
            );
            break e;
          }
          nr(
            c,
            u,
            Xt,
            os,
            fh,
            a,
            sn,
            Jc,
            Gt,
            gu,
            r,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    Su(l);
  }
  function nr(l, a, u, c, f, r, p, E, O, H, L, J, B, Y) {
    if (l.timeoutHandle = -1, J = a.subtreeFlags, J & 8192 || (J & 16785408) === 16785408) {
      J = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: va
      }, fg(
        a,
        r,
        J
      );
      var ue = (r & 62914560) === r ? qa - Nl() : (r & 4194048) === r ? Kp - Nl() : 0;
      if (ue = vy(
        J,
        ue
      ), ue !== null) {
        vu = r, l.cancelPendingCommit = ue(
          Tg.bind(
            null,
            l,
            a,
            r,
            u,
            c,
            f,
            p,
            E,
            O,
            L,
            J,
            null,
            B,
            Y
          )
        ), ai(l, r, p, !H);
        return;
      }
    }
    Tg(
      l,
      a,
      r,
      u,
      c,
      f,
      p,
      E,
      O
    );
  }
  function mg(l) {
    for (var a = l; ; ) {
      var u = a.tag;
      if ((u === 0 || u === 11 || u === 15) && a.flags & 16384 && (u = a.updateQueue, u !== null && (u = u.stores, u !== null)))
        for (var c = 0; c < u.length; c++) {
          var f = u[c], r = f.getSnapshot;
          f = f.value;
          try {
            if (!Ll(r(), f)) return !1;
          } catch {
            return !1;
          }
        }
      if (u = a.child, a.subtreeFlags & 16384 && u !== null)
        u.return = a, a = u;
      else {
        if (a === l) break;
        for (; a.sibling === null; ) {
          if (a.return === null || a.return === l) return !0;
          a = a.return;
        }
        a.sibling.return = a.return, a = a.sibling;
      }
    }
    return !0;
  }
  function ai(l, a, u, c) {
    a &= ~sh, a &= ~Jc, l.suspendedLanes |= a, l.pingedLanes &= ~a, c && (l.warmLanes |= a), c = l.expirationTimes;
    for (var f = a; 0 < f; ) {
      var r = 31 - kl(f), p = 1 << r;
      c[r] = -1, f &= ~p;
    }
    u !== 0 && af(l, u, a);
  }
  function fs() {
    return (et & 6) === 0 ? (ii(0), !1) : !0;
  }
  function $p() {
    if (Ve !== null) {
      if (ft === 0)
        var l = Ve.return;
      else
        l = Ve, _a = Ku = null, qf(l), Hi = null, Hc = 0, l = Ve;
      for (; l !== null; )
        og(l.alternate, l), l = l.return;
      Ve = null;
    }
  }
  function bu(l, a) {
    var u = l.timeoutHandle;
    u !== -1 && (l.timeoutHandle = -1, wg(u)), u = l.cancelPendingCommit, u !== null && (l.cancelPendingCommit = null, u()), vu = 0, $p(), pt = l, Ve = u = Zu(l.current, null), Ye = a, ft = 0, be = null, gu = !1, Ji = ya(l, a), oh = !1, Gt = sn = sh = Jc = Ba = At = 0, Xt = tr = null, fh = !1, (a & 8) !== 0 && (a |= a & 32);
    var c = l.entangledLanes;
    if (c !== 0)
      for (l = l.entanglements, c &= a; 0 < c; ) {
        var f = 31 - kl(c), r = 1 << f;
        a |= l[f], c &= ~r;
      }
    return Ha = a, Mn(), u;
  }
  function rs(l, a) {
    Ce = null, C.H = Qf, a === Ui || a === Lo ? (a = np(), ft = 3) : a === xc ? (a = np(), ft = 4) : ft = a === kd ? 8 : a !== null && typeof a == "object" && typeof a.then == "function" ? 6 : 1, be = a, Ve === null && (At = 1, Po(
      l,
      Un(a, l.current)
    ));
  }
  function pg() {
    var l = ln.current;
    return l === null ? !0 : (Ye & 4194048) === Ye ? qn === null : (Ye & 62914560) === Ye || (Ye & 536870912) !== 0 ? l === qn : !1;
  }
  function yg() {
    var l = C.H;
    return C.H = Qf, l === null ? Qf : l;
  }
  function gg() {
    var l = C.A;
    return C.A = rg, l;
  }
  function hh() {
    At = 4, gu || (Ye & 4194048) !== Ye && ln.current !== null || (Ji = !0), (Ba & 134217727) === 0 && (Jc & 134217727) === 0 || pt === null || ai(
      pt,
      Ye,
      sn,
      !1
    );
  }
  function mh(l, a, u) {
    var c = et;
    et |= 2;
    var f = yg(), r = gg();
    (pt !== l || Ye !== a) && (os = null, bu(l, a)), a = !1;
    var p = At;
    e: do
      try {
        if (ft !== 0 && Ve !== null) {
          var E = Ve, O = be;
          switch (ft) {
            case 8:
              $p(), p = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              ln.current === null && (a = !0);
              var H = ft;
              if (ft = 0, be = null, Kc(l, E, O, H), u && Ji) {
                p = 0;
                break e;
              }
              break;
            default:
              H = ft, ft = 0, be = null, Kc(l, E, O, H);
          }
        }
        p1(), p = At;
        break;
      } catch (L) {
        rs(l, L);
      }
    while (!0);
    return a && l.shellSuspendCounter++, _a = Ku = null, et = c, C.H = f, C.A = r, Ve === null && (pt = null, Ye = 0, Mn()), p;
  }
  function p1() {
    for (; Ve !== null; ) bg(Ve);
  }
  function vg(l, a) {
    var u = et;
    et |= 2;
    var c = yg(), f = gg();
    pt !== l || Ye !== a ? (os = null, at = Nl() + 500, bu(l, a)) : Ji = ya(
      l,
      a
    );
    e: do
      try {
        if (ft !== 0 && Ve !== null) {
          a = Ve;
          var r = be;
          t: switch (ft) {
            case 1:
              ft = 0, be = null, Kc(l, a, r, 1);
              break;
            case 2:
            case 9:
              if (tp(r)) {
                ft = 0, be = null, Sg(a);
                break;
              }
              a = function() {
                ft !== 2 && ft !== 9 || pt !== l || (ft = 7), Su(l);
              }, r.then(a, a);
              break e;
            case 3:
              ft = 7;
              break e;
            case 4:
              ft = 5;
              break e;
            case 7:
              tp(r) ? (ft = 0, be = null, Sg(a)) : (ft = 0, be = null, Kc(l, a, r, 7));
              break;
            case 5:
              var p = null;
              switch (Ve.tag) {
                case 26:
                  p = Ve.memoizedState;
                case 5:
                case 27:
                  var E = Ve;
                  if (p ? An(p) : E.stateNode.complete) {
                    ft = 0, be = null;
                    var O = E.sibling;
                    if (O !== null) Ve = O;
                    else {
                      var H = E.return;
                      H !== null ? (Ve = H, ar(H)) : Ve = null;
                    }
                    break t;
                  }
              }
              ft = 0, be = null, Kc(l, a, r, 5);
              break;
            case 6:
              ft = 0, be = null, Kc(l, a, r, 6);
              break;
            case 8:
              $p(), At = 6;
              break e;
            default:
              throw Error(g(462));
          }
        }
        $i();
        break;
      } catch (L) {
        rs(l, L);
      }
    while (!0);
    return _a = Ku = null, C.H = c, C.A = f, et = u, Ve !== null ? 0 : (pt = null, Ye = 0, Mn(), At);
  }
  function $i() {
    for (; Ve !== null && !oc(); )
      bg(Ve);
  }
  function bg(l) {
    var a = Hp(l.alternate, l, Ha);
    l.memoizedProps = l.pendingProps, a === null ? ar(l) : Ve = a;
  }
  function Sg(l) {
    var a = l, u = a.alternate;
    switch (a.tag) {
      case 15:
      case 0:
        a = Vi(
          u,
          a,
          a.pendingProps,
          a.type,
          void 0,
          Ye
        );
        break;
      case 11:
        a = Vi(
          u,
          a,
          a.pendingProps,
          a.type.render,
          a.ref,
          Ye
        );
        break;
      case 5:
        qf(a);
      default:
        og(u, a), a = Ve = $m(a, Ha), a = Hp(u, a, Ha);
    }
    l.memoizedProps = l.pendingProps, a === null ? ar(l) : Ve = a;
  }
  function Kc(l, a, u, c) {
    _a = Ku = null, qf(a), Hi = null, Hc = 0;
    var f = a.return;
    try {
      if (m1(
        l,
        f,
        a,
        u,
        Ye
      )) {
        At = 1, Po(
          l,
          Un(u, l.current)
        ), Ve = null;
        return;
      }
    } catch (r) {
      if (f !== null) throw Ve = f, r;
      At = 1, Po(
        l,
        Un(u, l.current)
      ), Ve = null;
      return;
    }
    a.flags & 32768 ? (Le || c === 1 ? l = !0 : Ji || (Ye & 536870912) !== 0 ? l = !1 : (gu = l = !0, (c === 2 || c === 9 || c === 3 || c === 6) && (c = ln.current, c !== null && c.tag === 13 && (c.flags |= 16384))), Eg(a, l)) : ar(a);
  }
  function ar(l) {
    var a = l;
    do {
      if ((a.flags & 32768) !== 0) {
        Eg(
          a,
          gu
        );
        return;
      }
      l = a.return;
      var u = ig(
        a.alternate,
        a,
        Ha
      );
      if (u !== null) {
        Ve = u;
        return;
      }
      if (a = a.sibling, a !== null) {
        Ve = a;
        return;
      }
      Ve = a = l;
    } while (a !== null);
    At === 0 && (At = 5);
  }
  function Eg(l, a) {
    do {
      var u = cg(l.alternate, l);
      if (u !== null) {
        u.flags &= 32767, Ve = u;
        return;
      }
      if (u = l.return, u !== null && (u.flags |= 32768, u.subtreeFlags = 0, u.deletions = null), !a && (l = l.sibling, l !== null)) {
        Ve = l;
        return;
      }
      Ve = l = u;
    } while (l !== null);
    At = 6, Ve = null;
  }
  function Tg(l, a, u, c, f, r, p, E, O) {
    l.cancelPendingCommit = null;
    do
      ds();
    while (rl !== 0);
    if ((et & 6) !== 0) throw Error(g(327));
    if (a !== null) {
      if (a === l.current) throw Error(g(177));
      if (r = a.lanes | a.childLanes, r |= na, $r(
        l,
        u,
        r,
        p,
        E,
        O
      ), l === pt && (Ve = pt = null, Ye = 0), Ki = a, ni = l, vu = u, Sn = r, rh = f, dh = c, (a.subtreeFlags & 10256) !== 0 || (a.flags & 10256) !== 0 ? (l.callbackNode = null, l.callbackPriority = 0, Ug(gi, function() {
        return _g(), null;
      })) : (l.callbackNode = null, l.callbackPriority = 0), c = (a.flags & 13878) !== 0, (a.subtreeFlags & 13878) !== 0 || c) {
        c = C.T, C.T = null, f = K.p, K.p = 2, p = et, et |= 4;
        try {
          as(l, a, u);
        } finally {
          et = p, K.p = f, C.T = c;
        }
      }
      rl = 1, Ag(), zg(), Og();
    }
  }
  function Ag() {
    if (rl === 1) {
      rl = 0;
      var l = ni, a = Ki, u = (a.flags & 13878) !== 0;
      if ((a.subtreeFlags & 13878) !== 0 || u) {
        u = C.T, C.T = null;
        var c = K.p;
        K.p = 2;
        var f = et;
        et |= 4;
        try {
          nh(a, l);
          var r = Ah, p = Di(l.containerInfo), E = r.focusedElem, O = r.selectionRange;
          if (p !== E && E && E.ownerDocument && zc(
            E.ownerDocument.documentElement,
            E
          )) {
            if (O !== null && yf(E)) {
              var H = O.start, L = O.end;
              if (L === void 0 && (L = H), "selectionStart" in E)
                E.selectionStart = H, E.selectionEnd = Math.min(
                  L,
                  E.value.length
                );
              else {
                var J = E.ownerDocument || document, B = J && J.defaultView || window;
                if (B.getSelection) {
                  var Y = B.getSelection(), ue = E.textContent.length, ge = Math.min(O.start, ue), gt = O.end === void 0 ? ge : Math.min(O.end, ue);
                  !Y.extend && ge > gt && (p = gt, gt = ge, ge = p);
                  var U = Jm(
                    E,
                    ge
                  ), R = Jm(
                    E,
                    gt
                  );
                  if (U && R && (Y.rangeCount !== 1 || Y.anchorNode !== U.node || Y.anchorOffset !== U.offset || Y.focusNode !== R.node || Y.focusOffset !== R.offset)) {
                    var N = J.createRange();
                    N.setStart(U.node, U.offset), Y.removeAllRanges(), ge > gt ? (Y.addRange(N), Y.extend(R.node, R.offset)) : (N.setEnd(R.node, R.offset), Y.addRange(N));
                  }
                }
              }
            }
            for (J = [], Y = E; Y = Y.parentNode; )
              Y.nodeType === 1 && J.push({
                element: Y,
                left: Y.scrollLeft,
                top: Y.scrollTop
              });
            for (typeof E.focus == "function" && E.focus(), E = 0; E < J.length; E++) {
              var Z = J[E];
              Z.element.scrollLeft = Z.left, Z.element.scrollTop = Z.top;
            }
          }
          dl = !!Th, Ah = Th = null;
        } finally {
          et = f, K.p = c, C.T = u;
        }
      }
      l.current = a, rl = 2;
    }
  }
  function zg() {
    if (rl === 2) {
      rl = 0;
      var l = ni, a = Ki, u = (a.flags & 8772) !== 0;
      if ((a.subtreeFlags & 8772) !== 0 || u) {
        u = C.T, C.T = null;
        var c = K.p;
        K.p = 2;
        var f = et;
        et |= 4;
        try {
          Wf(l, a.alternate, a);
        } finally {
          et = f, K.p = c, C.T = u;
        }
      }
      rl = 3;
    }
  }
  function Og() {
    if (rl === 4 || rl === 3) {
      rl = 0, Zr();
      var l = ni, a = Ki, u = vu, c = dh;
      (a.subtreeFlags & 10256) !== 0 || (a.flags & 10256) !== 0 ? rl = 5 : (rl = 0, Ki = ni = null, Dg(l, l.pendingLanes));
      var f = l.pendingLanes;
      if (f === 0 && (Nt = null), Sm(u), a = a.stateNode, pn && typeof pn.onCommitFiberRoot == "function")
        try {
          pn.onCommitFiberRoot(
            sc,
            a,
            void 0,
            (a.current.flags & 128) === 128
          );
        } catch {
        }
      if (c !== null) {
        a = C.T, f = K.p, K.p = 2, C.T = null;
        try {
          for (var r = l.onRecoverableError, p = 0; p < c.length; p++) {
            var E = c[p];
            r(E.value, {
              componentStack: E.stack
            });
          }
        } finally {
          C.T = a, K.p = f;
        }
      }
      (vu & 3) !== 0 && ds(), Su(l), f = l.pendingLanes, (u & 261930) !== 0 && (f & 42) !== 0 ? l === lr ? ss++ : (ss = 0, lr = l) : ss = 0, ii(0);
    }
  }
  function Dg(l, a) {
    (l.pooledCacheLanes &= a) === 0 && (a = l.pooledCache, a != null && (l.pooledCache = null, Df(a)));
  }
  function ds() {
    return Ag(), zg(), Og(), _g();
  }
  function _g() {
    if (rl !== 5) return !1;
    var l = ni, a = Sn;
    Sn = 0;
    var u = Sm(vu), c = C.T, f = K.p;
    try {
      K.p = 32 > u ? 32 : u, C.T = null, u = rh, rh = null;
      var r = ni, p = vu;
      if (rl = 0, Ki = ni = null, vu = 0, (et & 6) !== 0) throw Error(g(331));
      var E = et;
      if (et |= 4, Zp(r.current), us(
        r,
        r.current,
        p,
        u
      ), et = E, ii(0, !1), pn && typeof pn.onPostCommitFiberRoot == "function")
        try {
          pn.onPostCommitFiberRoot(sc, r);
        } catch {
        }
      return !0;
    } finally {
      K.p = f, C.T = c, Dg(l, a);
    }
  }
  function Rg(l, a, u) {
    a = Un(u, a), a = Op(l.stateNode, a, 2), l = Bn(l, a, 2), l !== null && (To(l, 2), Su(l));
  }
  function rt(l, a, u) {
    if (l.tag === 3)
      Rg(l, l, u);
    else
      for (; a !== null; ) {
        if (a.tag === 3) {
          Rg(
            a,
            l,
            u
          );
          break;
        } else if (a.tag === 1) {
          var c = a.stateNode;
          if (typeof a.type.getDerivedStateFromError == "function" || typeof c.componentDidCatch == "function" && (Nt === null || !Nt.has(c))) {
            l = Un(u, l), u = Dp(2), c = Bn(a, u, 2), c !== null && (_p(
              u,
              c,
              a,
              l
            ), To(c, 2), Su(c));
            break;
          }
        }
        a = a.return;
      }
  }
  function ur(l, a, u) {
    var c = l.pingCache;
    if (c === null) {
      c = l.pingCache = new Jp();
      var f = /* @__PURE__ */ new Set();
      c.set(a, f);
    } else
      f = c.get(a), f === void 0 && (f = /* @__PURE__ */ new Set(), c.set(a, f));
    f.has(u) || (oh = !0, f.add(u), l = kp.bind(null, l, a, u), a.then(l, l));
  }
  function kp(l, a, u) {
    var c = l.pingCache;
    c !== null && c.delete(a), l.pingedLanes |= l.suspendedLanes & u, l.warmLanes &= ~u, pt === l && (Ye & u) === u && (At === 4 || At === 3 && (Ye & 62914560) === Ye && 300 > Nl() - qa ? (et & 2) === 0 && bu(l, 0) : sh |= u, Gt === Ye && (Gt = 0)), Su(l);
  }
  function Mg(l, a) {
    a === 0 && (a = fc()), l = Qu(l, a), l !== null && (To(l, a), Su(l));
  }
  function Xn(l) {
    var a = l.memoizedState, u = 0;
    a !== null && (u = a.retryLane), Mg(l, u);
  }
  function Cg(l, a) {
    var u = 0;
    switch (l.tag) {
      case 31:
      case 13:
        var c = l.stateNode, f = l.memoizedState;
        f !== null && (u = f.retryLane);
        break;
      case 19:
        c = l.stateNode;
        break;
      case 22:
        c = l.stateNode._retryCache;
        break;
      default:
        throw Error(g(314));
    }
    c !== null && c.delete(a), Mg(l, u);
  }
  function Ug(l, a) {
    return St(l, a);
  }
  var hs = null, $c = null, Wp = !1, ph = !1, Fp = !1, ui = 0;
  function Su(l) {
    l !== $c && l.next === null && ($c === null ? hs = $c = l : $c = $c.next = l), ph = !0, Wp || (Wp = !0, cr());
  }
  function ii(l, a) {
    if (!Fp && ph) {
      Fp = !0;
      do
        for (var u = !1, c = hs; c !== null; ) {
          if (l !== 0) {
            var f = c.pendingLanes;
            if (f === 0) var r = 0;
            else {
              var p = c.suspendedLanes, E = c.pingedLanes;
              r = (1 << 31 - kl(42 | l) + 1) - 1, r &= f & ~(p & ~E), r = r & 201326741 ? r & 201326741 | 1 : r ? r | 2 : 0;
            }
            r !== 0 && (u = !0, kc(c, r));
          } else
            r = Ye, r = Wt(
              c,
              c === pt ? r : 0,
              c.cancelPendingCommit !== null || c.timeoutHandle !== -1
            ), (r & 3) === 0 || ya(c, r) || (u = !0, kc(c, r));
          c = c.next;
        }
      while (u);
      Fp = !1;
    }
  }
  function yh() {
    Ip();
  }
  function Ip() {
    ph = Wp = !1;
    var l = 0;
    ui !== 0 && y1() && (l = ui);
    for (var a = Nl(), u = null, c = hs; c !== null; ) {
      var f = c.next, r = Pp(c, a);
      r === 0 ? (c.next = null, u === null ? hs = f : u.next = f, f === null && ($c = u)) : (u = c, (l !== 0 || (r & 3) !== 0) && (ph = !0)), c = f;
    }
    rl !== 0 && rl !== 5 || ii(l), ui !== 0 && (ui = 0);
  }
  function Pp(l, a) {
    for (var u = l.suspendedLanes, c = l.pingedLanes, f = l.expirationTimes, r = l.pendingLanes & -62914561; 0 < r; ) {
      var p = 31 - kl(r), E = 1 << p, O = f[p];
      O === -1 ? ((E & u) === 0 || (E & c) !== 0) && (f[p] = Eo(E, a)) : O <= a && (l.expiredLanes |= E), r &= ~E;
    }
    if (a = pt, u = Ye, u = Wt(
      l,
      l === a ? u : 0,
      l.cancelPendingCommit !== null || l.timeoutHandle !== -1
    ), c = l.callbackNode, u === 0 || l === a && (ft === 2 || ft === 9) || l.cancelPendingCommit !== null)
      return c !== null && c !== null && gm(c), l.callbackNode = null, l.callbackPriority = 0;
    if ((u & 3) === 0 || ya(l, u)) {
      if (a = u & -u, a === l.callbackPriority) return a;
      switch (c !== null && gm(c), Sm(u)) {
        case 2:
        case 8:
          u = Kr;
          break;
        case 32:
          u = gi;
          break;
        case 268435456:
          u = vm;
          break;
        default:
          u = gi;
      }
      return c = ir.bind(null, l), u = St(u, c), l.callbackPriority = a, l.callbackNode = u, a;
    }
    return c !== null && c !== null && gm(c), l.callbackPriority = 2, l.callbackNode = null, 2;
  }
  function ir(l, a) {
    if (rl !== 0 && rl !== 5)
      return l.callbackNode = null, l.callbackPriority = 0, null;
    var u = l.callbackNode;
    if (ds() && l.callbackNode !== u)
      return null;
    var c = Ye;
    return c = Wt(
      l,
      l === pt ? c : 0,
      l.cancelPendingCommit !== null || l.timeoutHandle !== -1
    ), c === 0 ? null : (hg(l, c, a), Pp(l, Nl()), l.callbackNode != null && l.callbackNode === u ? ir.bind(null, l) : null);
  }
  function kc(l, a) {
    if (ds()) return null;
    hg(l, a, !0);
  }
  function cr() {
    Yg(function() {
      (et & 6) !== 0 ? St(
        Jr,
        yh
      ) : Ip();
    });
  }
  function gh() {
    if (ui === 0) {
      var l = Ci;
      l === 0 && (l = Yu, Yu <<= 1, (Yu & 261888) === 0 && (Yu = 256)), ui = l;
    }
    return ui;
  }
  function xg(l) {
    return l == null || typeof l == "symbol" || typeof l == "boolean" ? null : typeof l == "function" ? l : Pn("" + l);
  }
  function Wc(l, a) {
    var u = a.ownerDocument.createElement("input");
    return u.name = a.name, u.value = a.value, l.id && u.setAttribute("form", l.id), a.parentNode.insertBefore(u, a), l = new FormData(l), u.parentNode.removeChild(u), l;
  }
  function or(l, a, u, c, f) {
    if (a === "submit" && u && u.stateNode === f) {
      var r = xg(
        (f[Wl] || null).action
      ), p = c.submitter;
      p && (a = (a = p[Wl] || null) ? xg(a.formAction) : p.getAttribute("formAction"), a !== null && (r = a, p = null));
      var E = new hf(
        "action",
        "action",
        null,
        c,
        f
      );
      l.push({
        event: E,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (c.defaultPrevented) {
                if (ui !== 0) {
                  var O = p ? Wc(f, p) : new FormData(f);
                  Fo(
                    u,
                    {
                      pending: !0,
                      data: O,
                      method: f.method,
                      action: r
                    },
                    null,
                    O
                  );
                }
              } else
                typeof r == "function" && (E.preventDefault(), O = p ? Wc(f, p) : new FormData(f), Fo(
                  u,
                  {
                    pending: !0,
                    data: O,
                    method: f.method,
                    action: r
                  },
                  r,
                  O
                ));
            },
            currentTarget: f
          }
        ]
      });
    }
  }
  for (var vh = 0; vh < qo.length; vh++) {
    var ms = qo[vh], ey = ms.toLowerCase(), ty = ms[0].toUpperCase() + ms.slice(1);
    Il(
      ey,
      "on" + ty
    );
  }
  Il(vf, "onAnimationEnd"), Il(Km, "onAnimationIteration"), Il(vd, "onAnimationStart"), Il("dblclick", "onDoubleClick"), Il("focusin", "onFocus"), Il("focusout", "onBlur"), Il(Oc, "onTransitionRun"), Il(bf, "onTransitionStart"), Il(eu, "onTransitionCancel"), Il(V0, "onTransitionEnd"), ka("onMouseEnter", ["mouseout", "mouseover"]), ka("onMouseLeave", ["mouseout", "mouseover"]), ka("onPointerEnter", ["pointerout", "pointerover"]), ka("onPointerLeave", ["pointerout", "pointerover"]), Ei(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), Ei(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), Ei("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), Ei(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), Ei(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), Ei(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var ps = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), Ng = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ps)
  );
  function Hg(l, a) {
    a = (a & 4) !== 0;
    for (var u = 0; u < l.length; u++) {
      var c = l[u], f = c.event;
      c = c.listeners;
      e: {
        var r = void 0;
        if (a)
          for (var p = c.length - 1; 0 <= p; p--) {
            var E = c[p], O = E.instance, H = E.currentTarget;
            if (E = E.listener, O !== r && f.isPropagationStopped())
              break e;
            r = E, f.currentTarget = H;
            try {
              r(f);
            } catch (L) {
              Dc(L);
            }
            f.currentTarget = null, r = O;
          }
        else
          for (p = 0; p < c.length; p++) {
            if (E = c[p], O = E.instance, H = E.currentTarget, E = E.listener, O !== r && f.isPropagationStopped())
              break e;
            r = E, f.currentTarget = H;
            try {
              r(f);
            } catch (L) {
              Dc(L);
            }
            f.currentTarget = null, r = O;
          }
      }
    }
  }
  function Xe(l, a) {
    var u = a[Fr];
    u === void 0 && (u = a[Fr] = /* @__PURE__ */ new Set());
    var c = l + "__bubble";
    u.has(c) || (sr(a, l, 2, !1), u.add(c));
  }
  function ly(l, a, u) {
    var c = 0;
    a && (c |= 4), sr(
      u,
      l,
      c,
      a
    );
  }
  var bh = "_reactListening" + Math.random().toString(36).slice(2);
  function ys(l) {
    if (!l[bh]) {
      l[bh] = !0, mc.forEach(function(u) {
        u !== "selectionchange" && (Ng.has(u) || ly(u, !1, l), ly(u, !0, l));
      });
      var a = l.nodeType === 9 ? l : l.ownerDocument;
      a === null || a[bh] || (a[bh] = !0, ly("selectionchange", !1, a));
    }
  }
  function sr(l, a, u, c) {
    switch (vr(a)) {
      case 2:
        var f = Tu;
        break;
      case 8:
        f = Au;
        break;
      default:
        f = ql;
    }
    u = f.bind(
      null,
      a,
      u,
      l
    ), f = void 0, !rf || a !== "touchstart" && a !== "touchmove" && a !== "wheel" || (f = !0), c ? f !== void 0 ? l.addEventListener(a, u, {
      capture: !0,
      passive: f
    }) : l.addEventListener(a, u, !0) : f !== void 0 ? l.addEventListener(a, u, {
      passive: f
    }) : l.addEventListener(a, u, !1);
  }
  function ny(l, a, u, c, f) {
    var r = c;
    if ((a & 1) === 0 && (a & 2) === 0 && c !== null)
      e: for (; ; ) {
        if (c === null) return;
        var p = c.tag;
        if (p === 3 || p === 4) {
          var E = c.stateNode.containerInfo;
          if (E === f) break;
          if (p === 4)
            for (p = c.return; p !== null; ) {
              var O = p.tag;
              if ((O === 3 || O === 4) && p.stateNode.containerInfo === f)
                return;
              p = p.return;
            }
          for (; E !== null; ) {
            if (p = rc(E), p === null) return;
            if (O = p.tag, O === 5 || O === 6 || O === 26 || O === 27) {
              c = r = p;
              continue e;
            }
            E = E.parentNode;
          }
        }
        c = c.return;
      }
    Mm(function() {
      var H = r, L = ud(u), J = [];
      e: {
        var B = tu.get(l);
        if (B !== void 0) {
          var Y = hf, ue = l;
          switch (l) {
            case "keypress":
              if (cd(u) === 0) break e;
            case "keydown":
            case "keyup":
              Y = rd;
              break;
            case "focusin":
              ue = "focus", Y = sd;
              break;
            case "focusout":
              ue = "blur", Y = sd;
              break;
            case "beforeblur":
            case "afterblur":
              Y = sd;
              break;
            case "click":
              if (u.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              Y = Uo;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              Y = U0;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              Y = q0;
              break;
            case vf:
            case Km:
            case vd:
              Y = N0;
              break;
            case V0:
              Y = f1;
              break;
            case "scroll":
            case "scrollend":
              Y = o1;
              break;
            case "wheel":
              Y = r1;
              break;
            case "copy":
            case "cut":
            case "paste":
              Y = vc;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              Y = Ea;
              break;
            case "toggle":
            case "beforetoggle":
              Y = wm;
          }
          var ge = (a & 4) !== 0, gt = !ge && (l === "scroll" || l === "scrollend"), U = ge ? B !== null ? B + "Capture" : null : B;
          ge = [];
          for (var R = H, N; R !== null; ) {
            var Z = R;
            if (N = Z.stateNode, Z = Z.tag, Z !== 5 && Z !== 26 && Z !== 27 || N === null || U === null || (Z = gl(R, U), Z != null && ge.push(
              fr(R, Z, N)
            )), gt) break;
            R = R.return;
          }
          0 < ge.length && (B = new Y(
            B,
            ue,
            null,
            u,
            L
          ), J.push({ event: B, listeners: ge }));
        }
      }
      if ((a & 7) === 0) {
        e: {
          if (B = l === "mouseover" || l === "pointerover", Y = l === "mouseout" || l === "pointerout", B && u !== ad && (ue = u.relatedTarget || u.fromElement) && (rc(ue) || ue[bi]))
            break e;
          if ((Y || B) && (B = L.window === L ? L : (B = L.ownerDocument) ? B.defaultView || B.parentWindow : window, Y ? (ue = u.relatedTarget || u.toElement, Y = H, ue = ue ? rc(ue) : null, ue !== null && (gt = G(ue), ge = ue.tag, ue !== gt || ge !== 5 && ge !== 27 && ge !== 6) && (ue = null)) : (Y = null, ue = H), Y !== ue)) {
            if (ge = Uo, Z = "onMouseLeave", U = "onMouseEnter", R = "mouse", (l === "pointerout" || l === "pointerover") && (ge = Ea, Z = "onPointerLeave", U = "onPointerEnter", R = "pointer"), gt = Y == null ? B : Ao(Y), N = ue == null ? B : Ao(ue), B = new ge(
              Z,
              R + "leave",
              Y,
              u,
              L
            ), B.target = gt, B.relatedTarget = N, Z = null, rc(L) === H && (ge = new ge(
              U,
              R + "enter",
              ue,
              u,
              L
            ), ge.target = N, ge.relatedTarget = gt, Z = ge), gt = Z, Y && ue)
              t: {
                for (ge = Bg, U = Y, R = ue, N = 0, Z = U; Z; Z = ge(Z))
                  N++;
                Z = 0;
                for (var de = R; de; de = ge(de))
                  Z++;
                for (; 0 < N - Z; )
                  U = ge(U), N--;
                for (; 0 < Z - N; )
                  R = ge(R), Z--;
                for (; N--; ) {
                  if (U === R || R !== null && U === R.alternate) {
                    ge = U;
                    break t;
                  }
                  U = ge(U), R = ge(R);
                }
                ge = null;
              }
            else ge = null;
            Y !== null && Sh(
              J,
              B,
              Y,
              ge,
              !1
            ), ue !== null && gt !== null && Sh(
              J,
              gt,
              ue,
              ge,
              !0
            );
          }
        }
        e: {
          if (B = H ? Ao(H) : window, Y = B.nodeName && B.nodeName.toLowerCase(), Y === "select" || Y === "input" && B.type === "file")
            var Fe = Vm;
          else if (Pa(B))
            if (md)
              Fe = Ac;
            else {
              Fe = X0;
              var ce = G0;
            }
          else
            Y = B.nodeName, !Y || Y.toLowerCase() !== "input" || B.type !== "checkbox" && B.type !== "radio" ? H && Rm(H.elementType) && (Fe = Vm) : Fe = Oi;
          if (Fe && (Fe = Fe(l, H))) {
            Lm(
              J,
              Fe,
              u,
              L
            );
            break e;
          }
          ce && ce(l, B, H), l === "focusout" && H && B.type === "number" && H.memoizedProps.value != null && pc(B, "number", B.value);
        }
        switch (ce = H ? Ao(H) : window, l) {
          case "focusin":
            (Pa(ce) || ce.contentEditable === "true") && (_i = ce, Ho = H, la = null);
            break;
          case "focusout":
            la = Ho = _i = null;
            break;
          case "mousedown":
            Aa = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Aa = !1, gd(J, u, L);
            break;
          case "selectionchange":
            if (gf) break;
          case "keydown":
          case "keyup":
            gd(J, u, L);
        }
        var _e;
        if (xo)
          e: {
            switch (l) {
              case "compositionstart":
                var Ne = "onCompositionStart";
                break e;
              case "compositionend":
                Ne = "onCompositionEnd";
                break e;
              case "compositionupdate":
                Ne = "onCompositionUpdate";
                break e;
            }
            Ne = void 0;
          }
        else
          Sc ? hd(l, u) && (Ne = "onCompositionEnd") : l === "keydown" && u.keyCode === 229 && (Ne = "onCompositionStart");
        Ne && (Ym && u.locale !== "ko" && (Sc || Ne !== "onCompositionStart" ? Ne === "onCompositionEnd" && Sc && (_e = Um()) : (Lu = L, Cm = "value" in Lu ? Lu.value : Lu.textContent, Sc = !0)), ce = rr(H, Ne), 0 < ce.length && (Ne = new H0(
          Ne,
          l,
          null,
          u,
          L
        ), J.push({ event: Ne, listeners: ce }), _e ? Ne.data = _e : (_e = Gm(u), _e !== null && (Ne.data = _e)))), (_e = Xl ? Y0(l, u) : d1(l, u)) && (Ne = rr(H, "onBeforeInput"), 0 < Ne.length && (ce = new H0(
          "onBeforeInput",
          "beforeinput",
          null,
          u,
          L
        ), J.push({
          event: ce,
          listeners: Ne
        }), ce.data = _e)), or(
          J,
          l,
          H,
          u,
          L
        );
      }
      Hg(J, a);
    });
  }
  function fr(l, a, u) {
    return {
      instance: l,
      listener: a,
      currentTarget: u
    };
  }
  function rr(l, a) {
    for (var u = a + "Capture", c = []; l !== null; ) {
      var f = l, r = f.stateNode;
      if (f = f.tag, f !== 5 && f !== 26 && f !== 27 || r === null || (f = gl(l, u), f != null && c.unshift(
        fr(l, f, r)
      ), f = gl(l, a), f != null && c.push(
        fr(l, f, r)
      )), l.tag === 3) return c;
      l = l.return;
    }
    return [];
  }
  function Bg(l) {
    if (l === null) return null;
    do
      l = l.return;
    while (l && l.tag !== 5 && l.tag !== 27);
    return l || null;
  }
  function Sh(l, a, u, c, f) {
    for (var r = a._reactName, p = []; u !== null && u !== c; ) {
      var E = u, O = E.alternate, H = E.stateNode;
      if (E = E.tag, O !== null && O === c) break;
      E !== 5 && E !== 26 && E !== 27 || H === null || (O = H, f ? (H = gl(u, r), H != null && p.unshift(
        fr(u, H, O)
      )) : f || (H = gl(u, r), H != null && p.push(
        fr(u, H, O)
      ))), u = u.return;
    }
    p.length !== 0 && l.push({ event: a, listeners: p });
  }
  var qg = /\r\n?/g, ay = /\u0000|\uFFFD/g;
  function uy(l) {
    return (typeof l == "string" ? l : "" + l).replace(qg, `
`).replace(ay, "");
  }
  function iy(l, a) {
    return a = uy(a), uy(l) === a;
  }
  function yt(l, a, u, c, f, r) {
    switch (u) {
      case "children":
        typeof c == "string" ? a === "body" || a === "textarea" && c === "" || Wa(l, c) : (typeof c == "number" || typeof c == "bigint") && a !== "body" && Wa(l, "" + c);
        break;
      case "className":
        td(l, "class", c);
        break;
      case "tabIndex":
        td(l, "tabindex", c);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        td(l, u, c);
        break;
      case "style":
        R0(l, c, r);
        break;
      case "data":
        if (a !== "object") {
          td(l, "data", c);
          break;
        }
      case "src":
      case "href":
        if (c === "" && (a !== "a" || u !== "href")) {
          l.removeAttribute(u);
          break;
        }
        if (c == null || typeof c == "function" || typeof c == "symbol" || typeof c == "boolean") {
          l.removeAttribute(u);
          break;
        }
        c = Pn("" + c), l.setAttribute(u, c);
        break;
      case "action":
      case "formAction":
        if (typeof c == "function") {
          l.setAttribute(
            u,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof r == "function" && (u === "formAction" ? (a !== "input" && yt(l, a, "name", f.name, f, null), yt(
            l,
            a,
            "formEncType",
            f.formEncType,
            f,
            null
          ), yt(
            l,
            a,
            "formMethod",
            f.formMethod,
            f,
            null
          ), yt(
            l,
            a,
            "formTarget",
            f.formTarget,
            f,
            null
          )) : (yt(l, a, "encType", f.encType, f, null), yt(l, a, "method", f.method, f, null), yt(l, a, "target", f.target, f, null)));
        if (c == null || typeof c == "symbol" || typeof c == "boolean") {
          l.removeAttribute(u);
          break;
        }
        c = Pn("" + c), l.setAttribute(u, c);
        break;
      case "onClick":
        c != null && (l.onclick = va);
        break;
      case "onScroll":
        c != null && Xe("scroll", l);
        break;
      case "onScrollEnd":
        c != null && Xe("scrollend", l);
        break;
      case "dangerouslySetInnerHTML":
        if (c != null) {
          if (typeof c != "object" || !("__html" in c))
            throw Error(g(61));
          if (u = c.__html, u != null) {
            if (f.children != null) throw Error(g(60));
            l.innerHTML = u;
          }
        }
        break;
      case "multiple":
        l.multiple = c && typeof c != "function" && typeof c != "symbol";
        break;
      case "muted":
        l.muted = c && typeof c != "function" && typeof c != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (c == null || typeof c == "function" || typeof c == "boolean" || typeof c == "symbol") {
          l.removeAttribute("xlink:href");
          break;
        }
        u = Pn("" + c), l.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          u
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        c != null && typeof c != "function" && typeof c != "symbol" ? l.setAttribute(u, "" + c) : l.removeAttribute(u);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        c && typeof c != "function" && typeof c != "symbol" ? l.setAttribute(u, "") : l.removeAttribute(u);
        break;
      case "capture":
      case "download":
        c === !0 ? l.setAttribute(u, "") : c !== !1 && c != null && typeof c != "function" && typeof c != "symbol" ? l.setAttribute(u, c) : l.removeAttribute(u);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        c != null && typeof c != "function" && typeof c != "symbol" && !isNaN(c) && 1 <= c ? l.setAttribute(u, c) : l.removeAttribute(u);
        break;
      case "rowSpan":
      case "start":
        c == null || typeof c == "function" || typeof c == "symbol" || isNaN(c) ? l.removeAttribute(u) : l.setAttribute(u, c);
        break;
      case "popover":
        Xe("beforetoggle", l), Xe("toggle", l), Do(l, "popover", c);
        break;
      case "xlinkActuate":
        Gu(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          c
        );
        break;
      case "xlinkArcrole":
        Gu(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          c
        );
        break;
      case "xlinkRole":
        Gu(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          c
        );
        break;
      case "xlinkShow":
        Gu(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          c
        );
        break;
      case "xlinkTitle":
        Gu(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          c
        );
        break;
      case "xlinkType":
        Gu(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          c
        );
        break;
      case "xmlBase":
        Gu(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          c
        );
        break;
      case "xmlLang":
        Gu(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          c
        );
        break;
      case "xmlSpace":
        Gu(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          c
        );
        break;
      case "is":
        Do(l, "is", c);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < u.length) || u[0] !== "o" && u[0] !== "O" || u[1] !== "n" && u[1] !== "N") && (u = c1.get(u) || u, Do(l, u, c));
    }
  }
  function cy(l, a, u, c, f, r) {
    switch (u) {
      case "style":
        R0(l, c, r);
        break;
      case "dangerouslySetInnerHTML":
        if (c != null) {
          if (typeof c != "object" || !("__html" in c))
            throw Error(g(61));
          if (u = c.__html, u != null) {
            if (f.children != null) throw Error(g(60));
            l.innerHTML = u;
          }
        }
        break;
      case "children":
        typeof c == "string" ? Wa(l, c) : (typeof c == "number" || typeof c == "bigint") && Wa(l, "" + c);
        break;
      case "onScroll":
        c != null && Xe("scroll", l);
        break;
      case "onScrollEnd":
        c != null && Xe("scrollend", l);
        break;
      case "onClick":
        c != null && (l.onclick = va);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Si.hasOwnProperty(u))
          e: {
            if (u[0] === "o" && u[1] === "n" && (f = u.endsWith("Capture"), a = u.slice(2, f ? u.length - 7 : void 0), r = l[Wl] || null, r = r != null ? r[u] : null, typeof r == "function" && l.removeEventListener(a, r, f), typeof c == "function")) {
              typeof r != "function" && r !== null && (u in l ? l[u] = null : l.hasAttribute(u) && l.removeAttribute(u)), l.addEventListener(a, c, f);
              break e;
            }
            u in l ? l[u] = c : c === !0 ? l.setAttribute(u, "") : Do(l, u, c);
          }
    }
  }
  function Bl(l, a, u) {
    switch (a) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        Xe("error", l), Xe("load", l);
        var c = !1, f = !1, r;
        for (r in u)
          if (u.hasOwnProperty(r)) {
            var p = u[r];
            if (p != null)
              switch (r) {
                case "src":
                  c = !0;
                  break;
                case "srcSet":
                  f = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(g(137, a));
                default:
                  yt(l, a, r, p, u, null);
              }
          }
        f && yt(l, a, "srcSet", u.srcSet, u, null), c && yt(l, a, "src", u.src, u, null);
        return;
      case "input":
        Xe("invalid", l);
        var E = r = p = f = null, O = null, H = null;
        for (c in u)
          if (u.hasOwnProperty(c)) {
            var L = u[c];
            if (L != null)
              switch (c) {
                case "name":
                  f = L;
                  break;
                case "type":
                  p = L;
                  break;
                case "checked":
                  O = L;
                  break;
                case "defaultChecked":
                  H = L;
                  break;
                case "value":
                  r = L;
                  break;
                case "defaultValue":
                  E = L;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (L != null)
                    throw Error(g(137, a));
                  break;
                default:
                  yt(l, a, c, L, u, null);
              }
          }
        of(
          l,
          r,
          E,
          O,
          H,
          p,
          f,
          !1
        );
        return;
      case "select":
        Xe("invalid", l), c = p = r = null;
        for (f in u)
          if (u.hasOwnProperty(f) && (E = u[f], E != null))
            switch (f) {
              case "value":
                r = E;
                break;
              case "defaultValue":
                p = E;
                break;
              case "multiple":
                c = E;
              default:
                yt(l, a, f, E, u, null);
            }
        a = r, u = p, l.multiple = !!c, a != null ? _o(l, !!c, a, !1) : u != null && _o(l, !!c, u, !0);
        return;
      case "textarea":
        Xe("invalid", l), r = f = c = null;
        for (p in u)
          if (u.hasOwnProperty(p) && (E = u[p], E != null))
            switch (p) {
              case "value":
                c = E;
                break;
              case "defaultValue":
                f = E;
                break;
              case "children":
                r = E;
                break;
              case "dangerouslySetInnerHTML":
                if (E != null) throw Error(g(91));
                break;
              default:
                yt(l, a, p, E, u, null);
            }
        _m(l, c, f, r);
        return;
      case "option":
        for (O in u)
          if (u.hasOwnProperty(O) && (c = u[O], c != null))
            switch (O) {
              case "selected":
                l.selected = c && typeof c != "function" && typeof c != "symbol";
                break;
              default:
                yt(l, a, O, c, u, null);
            }
        return;
      case "dialog":
        Xe("beforetoggle", l), Xe("toggle", l), Xe("cancel", l), Xe("close", l);
        break;
      case "iframe":
      case "object":
        Xe("load", l);
        break;
      case "video":
      case "audio":
        for (c = 0; c < ps.length; c++)
          Xe(ps[c], l);
        break;
      case "image":
        Xe("error", l), Xe("load", l);
        break;
      case "details":
        Xe("toggle", l);
        break;
      case "embed":
      case "source":
      case "link":
        Xe("error", l), Xe("load", l);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (H in u)
          if (u.hasOwnProperty(H) && (c = u[H], c != null))
            switch (H) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(g(137, a));
              default:
                yt(l, a, H, c, u, null);
            }
        return;
      default:
        if (Rm(a)) {
          for (L in u)
            u.hasOwnProperty(L) && (c = u[L], c !== void 0 && cy(
              l,
              a,
              L,
              c,
              u,
              void 0
            ));
          return;
        }
    }
    for (E in u)
      u.hasOwnProperty(E) && (c = u[E], c != null && yt(l, a, E, c, u, null));
  }
  function oy(l, a, u, c) {
    switch (a) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var f = null, r = null, p = null, E = null, O = null, H = null, L = null;
        for (Y in u) {
          var J = u[Y];
          if (u.hasOwnProperty(Y) && J != null)
            switch (Y) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                O = J;
              default:
                c.hasOwnProperty(Y) || yt(l, a, Y, null, c, J);
            }
        }
        for (var B in c) {
          var Y = c[B];
          if (J = u[B], c.hasOwnProperty(B) && (Y != null || J != null))
            switch (B) {
              case "type":
                r = Y;
                break;
              case "name":
                f = Y;
                break;
              case "checked":
                H = Y;
                break;
              case "defaultChecked":
                L = Y;
                break;
              case "value":
                p = Y;
                break;
              case "defaultValue":
                E = Y;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (Y != null)
                  throw Error(g(137, a));
                break;
              default:
                Y !== J && yt(
                  l,
                  a,
                  B,
                  Y,
                  c,
                  J
                );
            }
        }
        cf(
          l,
          p,
          E,
          O,
          H,
          L,
          r,
          f
        );
        return;
      case "select":
        Y = p = E = B = null;
        for (r in u)
          if (O = u[r], u.hasOwnProperty(r) && O != null)
            switch (r) {
              case "value":
                break;
              case "multiple":
                Y = O;
              default:
                c.hasOwnProperty(r) || yt(
                  l,
                  a,
                  r,
                  null,
                  c,
                  O
                );
            }
        for (f in c)
          if (r = c[f], O = u[f], c.hasOwnProperty(f) && (r != null || O != null))
            switch (f) {
              case "value":
                B = r;
                break;
              case "defaultValue":
                E = r;
                break;
              case "multiple":
                p = r;
              default:
                r !== O && yt(
                  l,
                  a,
                  f,
                  r,
                  c,
                  O
                );
            }
        a = E, u = p, c = Y, B != null ? _o(l, !!u, B, !1) : !!c != !!u && (a != null ? _o(l, !!u, a, !0) : _o(l, !!u, u ? [] : "", !1));
        return;
      case "textarea":
        Y = B = null;
        for (E in u)
          if (f = u[E], u.hasOwnProperty(E) && f != null && !c.hasOwnProperty(E))
            switch (E) {
              case "value":
                break;
              case "children":
                break;
              default:
                yt(l, a, E, null, c, f);
            }
        for (p in c)
          if (f = c[p], r = u[p], c.hasOwnProperty(p) && (f != null || r != null))
            switch (p) {
              case "value":
                B = f;
                break;
              case "defaultValue":
                Y = f;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (f != null) throw Error(g(91));
                break;
              default:
                f !== r && yt(l, a, p, f, c, r);
            }
        Dm(l, B, Y);
        return;
      case "option":
        for (var ue in u)
          if (B = u[ue], u.hasOwnProperty(ue) && B != null && !c.hasOwnProperty(ue))
            switch (ue) {
              case "selected":
                l.selected = !1;
                break;
              default:
                yt(
                  l,
                  a,
                  ue,
                  null,
                  c,
                  B
                );
            }
        for (O in c)
          if (B = c[O], Y = u[O], c.hasOwnProperty(O) && B !== Y && (B != null || Y != null))
            switch (O) {
              case "selected":
                l.selected = B && typeof B != "function" && typeof B != "symbol";
                break;
              default:
                yt(
                  l,
                  a,
                  O,
                  B,
                  c,
                  Y
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var ge in u)
          B = u[ge], u.hasOwnProperty(ge) && B != null && !c.hasOwnProperty(ge) && yt(l, a, ge, null, c, B);
        for (H in c)
          if (B = c[H], Y = u[H], c.hasOwnProperty(H) && B !== Y && (B != null || Y != null))
            switch (H) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (B != null)
                  throw Error(g(137, a));
                break;
              default:
                yt(
                  l,
                  a,
                  H,
                  B,
                  c,
                  Y
                );
            }
        return;
      default:
        if (Rm(a)) {
          for (var gt in u)
            B = u[gt], u.hasOwnProperty(gt) && B !== void 0 && !c.hasOwnProperty(gt) && cy(
              l,
              a,
              gt,
              void 0,
              c,
              B
            );
          for (L in c)
            B = c[L], Y = u[L], !c.hasOwnProperty(L) || B === Y || B === void 0 && Y === void 0 || cy(
              l,
              a,
              L,
              B,
              c,
              Y
            );
          return;
        }
    }
    for (var U in u)
      B = u[U], u.hasOwnProperty(U) && B != null && !c.hasOwnProperty(U) && yt(l, a, U, null, c, B);
    for (J in c)
      B = c[J], Y = u[J], !c.hasOwnProperty(J) || B === Y || B == null && Y == null || yt(l, a, J, B, c, Y);
  }
  function Eh(l) {
    switch (l) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function sy() {
    if (typeof performance.getEntriesByType == "function") {
      for (var l = 0, a = 0, u = performance.getEntriesByType("resource"), c = 0; c < u.length; c++) {
        var f = u[c], r = f.transferSize, p = f.initiatorType, E = f.duration;
        if (r && E && Eh(p)) {
          for (p = 0, E = f.responseEnd, c += 1; c < u.length; c++) {
            var O = u[c], H = O.startTime;
            if (H > E) break;
            var L = O.transferSize, J = O.initiatorType;
            L && Eh(J) && (O = O.responseEnd, p += L * (O < E ? 1 : (E - H) / (O - H)));
          }
          if (--c, a += 8 * (r + p) / (f.duration / 1e3), l++, 10 < l) break;
        }
      }
      if (0 < l) return a / l / 1e6;
    }
    return navigator.connection && (l = navigator.connection.downlink, typeof l == "number") ? l : 5;
  }
  var Th = null, Ah = null;
  function ki(l) {
    return l.nodeType === 9 ? l : l.ownerDocument;
  }
  function jg(l) {
    switch (l) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function fy(l, a) {
    if (l === 0)
      switch (a) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return l === 1 && a === "foreignObject" ? 0 : l;
  }
  function gs(l, a) {
    return l === "textarea" || l === "noscript" || typeof a.children == "string" || typeof a.children == "number" || typeof a.children == "bigint" || typeof a.dangerouslySetInnerHTML == "object" && a.dangerouslySetInnerHTML !== null && a.dangerouslySetInnerHTML.__html != null;
  }
  var zh = null;
  function y1() {
    var l = window.event;
    return l && l.type === "popstate" ? l === zh ? !1 : (zh = l, !0) : (zh = null, !1);
  }
  var dr = typeof setTimeout == "function" ? setTimeout : void 0, wg = typeof clearTimeout == "function" ? clearTimeout : void 0, Fc = typeof Promise == "function" ? Promise : void 0, Yg = typeof queueMicrotask == "function" ? queueMicrotask : typeof Fc < "u" ? function(l) {
    return Fc.resolve(null).then(l).catch(ry);
  } : dr;
  function ry(l) {
    setTimeout(function() {
      throw l;
    });
  }
  function ja(l) {
    return l === "head";
  }
  function dy(l, a) {
    var u = a, c = 0;
    do {
      var f = u.nextSibling;
      if (l.removeChild(u), f && f.nodeType === 8)
        if (u = f.data, u === "/$" || u === "/&") {
          if (c === 0) {
            l.removeChild(f), Ms(a);
            return;
          }
          c--;
        } else if (u === "$" || u === "$?" || u === "$~" || u === "$!" || u === "&")
          c++;
        else if (u === "html")
          Ic(l.ownerDocument.documentElement);
        else if (u === "head") {
          u = l.ownerDocument.head, Ic(u);
          for (var r = u.firstChild; r; ) {
            var p = r.nextSibling, E = r.nodeName;
            r[$a] || E === "SCRIPT" || E === "STYLE" || E === "LINK" && r.rel.toLowerCase() === "stylesheet" || u.removeChild(r), r = p;
          }
        } else
          u === "body" && Ic(l.ownerDocument.body);
      u = f;
    } while (u);
    Ms(a);
  }
  function tl(l, a) {
    var u = l;
    l = 0;
    do {
      var c = u.nextSibling;
      if (u.nodeType === 1 ? a ? (u._stashedDisplay = u.style.display, u.style.display = "none") : (u.style.display = u._stashedDisplay || "", u.getAttribute("style") === "" && u.removeAttribute("style")) : u.nodeType === 3 && (a ? (u._stashedText = u.nodeValue, u.nodeValue = "") : u.nodeValue = u._stashedText || ""), c && c.nodeType === 8)
        if (u = c.data, u === "/$") {
          if (l === 0) break;
          l--;
        } else
          u !== "$" && u !== "$?" && u !== "$~" && u !== "$!" || l++;
      u = c;
    } while (u);
  }
  function hr(l) {
    var a = l.firstChild;
    for (a && a.nodeType === 10 && (a = a.nextSibling); a; ) {
      var u = a;
      switch (a = a.nextSibling, u.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          hr(u), Ir(u);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (u.rel.toLowerCase() === "stylesheet") continue;
      }
      l.removeChild(u);
    }
  }
  function g1(l, a, u, c) {
    for (; l.nodeType === 1; ) {
      var f = u;
      if (l.nodeName.toLowerCase() !== a.toLowerCase()) {
        if (!c && (l.nodeName !== "INPUT" || l.type !== "hidden"))
          break;
      } else if (c) {
        if (!l[$a])
          switch (a) {
            case "meta":
              if (!l.hasAttribute("itemprop")) break;
              return l;
            case "link":
              if (r = l.getAttribute("rel"), r === "stylesheet" && l.hasAttribute("data-precedence"))
                break;
              if (r !== f.rel || l.getAttribute("href") !== (f.href == null || f.href === "" ? null : f.href) || l.getAttribute("crossorigin") !== (f.crossOrigin == null ? null : f.crossOrigin) || l.getAttribute("title") !== (f.title == null ? null : f.title))
                break;
              return l;
            case "style":
              if (l.hasAttribute("data-precedence")) break;
              return l;
            case "script":
              if (r = l.getAttribute("src"), (r !== (f.src == null ? null : f.src) || l.getAttribute("type") !== (f.type == null ? null : f.type) || l.getAttribute("crossorigin") !== (f.crossOrigin == null ? null : f.crossOrigin)) && r && l.hasAttribute("async") && !l.hasAttribute("itemprop"))
                break;
              return l;
            default:
              return l;
          }
      } else if (a === "input" && l.type === "hidden") {
        var r = f.name == null ? null : "" + f.name;
        if (f.type === "hidden" && l.getAttribute("name") === r)
          return l;
      } else return l;
      if (l = rn(l.nextSibling), l === null) break;
    }
    return null;
  }
  function Be(l, a, u) {
    if (a === "") return null;
    for (; l.nodeType !== 3; )
      if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !u || (l = rn(l.nextSibling), l === null)) return null;
    return l;
  }
  function Gg(l, a) {
    for (; l.nodeType !== 8; )
      if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !a || (l = rn(l.nextSibling), l === null)) return null;
    return l;
  }
  function fa(l) {
    return l.data === "$?" || l.data === "$~";
  }
  function Wi(l) {
    return l.data === "$!" || l.data === "$?" && l.ownerDocument.readyState !== "loading";
  }
  function vs(l, a) {
    var u = l.ownerDocument;
    if (l.data === "$~") l._reactRetry = a;
    else if (l.data !== "$?" || u.readyState !== "loading")
      a();
    else {
      var c = function() {
        a(), u.removeEventListener("DOMContentLoaded", c);
      };
      u.addEventListener("DOMContentLoaded", c), l._reactRetry = c;
    }
  }
  function rn(l) {
    for (; l != null; l = l.nextSibling) {
      var a = l.nodeType;
      if (a === 1 || a === 3) break;
      if (a === 8) {
        if (a = l.data, a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&" || a === "F!" || a === "F")
          break;
        if (a === "/$" || a === "/&") return null;
      }
    }
    return l;
  }
  var mr = null;
  function Oh(l) {
    l = l.nextSibling;
    for (var a = 0; l; ) {
      if (l.nodeType === 8) {
        var u = l.data;
        if (u === "/$" || u === "/&") {
          if (a === 0)
            return rn(l.nextSibling);
          a--;
        } else
          u !== "$" && u !== "$!" && u !== "$?" && u !== "$~" && u !== "&" || a++;
      }
      l = l.nextSibling;
    }
    return null;
  }
  function wa(l) {
    l = l.previousSibling;
    for (var a = 0; l; ) {
      if (l.nodeType === 8) {
        var u = l.data;
        if (u === "$" || u === "$!" || u === "$?" || u === "$~" || u === "&") {
          if (a === 0) return l;
          a--;
        } else u !== "/$" && u !== "/&" || a++;
      }
      l = l.previousSibling;
    }
    return null;
  }
  function bs(l, a, u) {
    switch (a = ki(u), l) {
      case "html":
        if (l = a.documentElement, !l) throw Error(g(452));
        return l;
      case "head":
        if (l = a.head, !l) throw Error(g(453));
        return l;
      case "body":
        if (l = a.body, !l) throw Error(g(454));
        return l;
      default:
        throw Error(g(451));
    }
  }
  function Ic(l) {
    for (var a = l.attributes; a.length; )
      l.removeAttributeNode(a[0]);
    Ir(l);
  }
  var Tn = /* @__PURE__ */ new Map(), pr = /* @__PURE__ */ new Set();
  function Ql(l) {
    return typeof l.getRootNode == "function" ? l.getRootNode() : l.nodeType === 9 ? l : l.ownerDocument;
  }
  var Ya = K.d;
  K.d = {
    f: v1,
    r: Xg,
    D: w,
    C: ut,
    L: b1,
    m: hy,
    X: ci,
    S: my,
    M: Fi
  };
  function v1() {
    var l = Ya.f(), a = fs();
    return l || a;
  }
  function Xg(l) {
    var a = dc(l);
    a !== null && a.tag === 5 && a.type === "form" ? mt(a) : Ya.r(l);
  }
  var Ss = typeof document > "u" ? null : document;
  function il(l, a, u) {
    var c = Ss;
    if (c && typeof a == "string" && a) {
      var f = Rn(a);
      f = 'link[rel="' + l + '"][href="' + f + '"]', typeof u == "string" && (f += '[crossorigin="' + u + '"]'), pr.has(f) || (pr.add(f), l = { rel: l, crossOrigin: u, href: a }, c.querySelector(f) === null && (a = c.createElement("link"), Bl(a, "link", l), ct(a), c.head.appendChild(a)));
    }
  }
  function w(l) {
    Ya.D(l), il("dns-prefetch", l, null);
  }
  function ut(l, a) {
    Ya.C(l, a), il("preconnect", l, a);
  }
  function b1(l, a, u) {
    Ya.L(l, a, u);
    var c = Ss;
    if (c && l && a) {
      var f = 'link[rel="preload"][as="' + Rn(a) + '"]';
      a === "image" && u && u.imageSrcSet ? (f += '[imagesrcset="' + Rn(
        u.imageSrcSet
      ) + '"]', typeof u.imageSizes == "string" && (f += '[imagesizes="' + Rn(
        u.imageSizes
      ) + '"]')) : f += '[href="' + Rn(l) + '"]';
      var r = f;
      switch (a) {
        case "style":
          r = Ln(l);
          break;
        case "script":
          r = Pc(l);
      }
      Tn.has(r) || (l = ae(
        {
          rel: "preload",
          href: a === "image" && u && u.imageSrcSet ? void 0 : l,
          as: a
        },
        u
      ), Tn.set(r, l), c.querySelector(f) !== null || a === "style" && c.querySelector(Ii(r)) || a === "script" && c.querySelector(As(r)) || (a = c.createElement("link"), Bl(a, "link", l), ct(a), c.head.appendChild(a)));
    }
  }
  function hy(l, a) {
    Ya.m(l, a);
    var u = Ss;
    if (u && l) {
      var c = a && typeof a.as == "string" ? a.as : "script", f = 'link[rel="modulepreload"][as="' + Rn(c) + '"][href="' + Rn(l) + '"]', r = f;
      switch (c) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          r = Pc(l);
      }
      if (!Tn.has(r) && (l = ae({ rel: "modulepreload", href: l }, a), Tn.set(r, l), u.querySelector(f) === null)) {
        switch (c) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (u.querySelector(As(r)))
              return;
        }
        c = u.createElement("link"), Bl(c, "link", l), ct(c), u.head.appendChild(c);
      }
    }
  }
  function my(l, a, u) {
    Ya.S(l, a, u);
    var c = Ss;
    if (c && l) {
      var f = hc(c).hoistableStyles, r = Ln(l);
      a = a || "default";
      var p = f.get(r);
      if (!p) {
        var E = { loading: 0, preload: null };
        if (p = c.querySelector(
          Ii(r)
        ))
          E.loading = 5;
        else {
          l = ae(
            { rel: "stylesheet", href: l, "data-precedence": a },
            u
          ), (u = Tn.get(r)) && Dh(l, u);
          var O = p = c.createElement("link");
          ct(O), Bl(O, "link", l), O._p = new Promise(function(H, L) {
            O.onload = H, O.onerror = L;
          }), O.addEventListener("load", function() {
            E.loading |= 1;
          }), O.addEventListener("error", function() {
            E.loading |= 2;
          }), E.loading |= 4, yr(p, a, c);
        }
        p = {
          type: "stylesheet",
          instance: p,
          count: 1,
          state: E
        }, f.set(r, p);
      }
    }
  }
  function ci(l, a) {
    Ya.X(l, a);
    var u = Ss;
    if (u && l) {
      var c = hc(u).hoistableScripts, f = Pc(l), r = c.get(f);
      r || (r = u.querySelector(As(f)), r || (l = ae({ src: l, async: !0 }, a), (a = Tn.get(f)) && _h(l, a), r = u.createElement("script"), ct(r), Bl(r, "link", l), u.head.appendChild(r)), r = {
        type: "script",
        instance: r,
        count: 1,
        state: null
      }, c.set(f, r));
    }
  }
  function Fi(l, a) {
    Ya.M(l, a);
    var u = Ss;
    if (u && l) {
      var c = hc(u).hoistableScripts, f = Pc(l), r = c.get(f);
      r || (r = u.querySelector(As(f)), r || (l = ae({ src: l, async: !0, type: "module" }, a), (a = Tn.get(f)) && _h(l, a), r = u.createElement("script"), ct(r), Bl(r, "link", l), u.head.appendChild(r)), r = {
        type: "script",
        instance: r,
        count: 1,
        state: null
      }, c.set(f, r));
    }
  }
  function Es(l, a, u, c) {
    var f = (f = Wn.current) ? Ql(f) : null;
    if (!f) throw Error(g(446));
    switch (l) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof u.precedence == "string" && typeof u.href == "string" ? (a = Ln(u.href), u = hc(
          f
        ).hoistableStyles, c = u.get(a), c || (c = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, u.set(a, c)), c) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (u.rel === "stylesheet" && typeof u.href == "string" && typeof u.precedence == "string") {
          l = Ln(u.href);
          var r = hc(
            f
          ).hoistableStyles, p = r.get(l);
          if (p || (f = f.ownerDocument || f, p = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, r.set(l, p), (r = f.querySelector(
            Ii(l)
          )) && !r._p && (p.instance = r, p.state.loading = 5), Tn.has(l) || (u = {
            rel: "preload",
            as: "style",
            href: u.href,
            crossOrigin: u.crossOrigin,
            integrity: u.integrity,
            media: u.media,
            hrefLang: u.hrefLang,
            referrerPolicy: u.referrerPolicy
          }, Tn.set(l, u), r || Lg(
            f,
            l,
            u,
            p.state
          ))), a && c === null)
            throw Error(g(528, ""));
          return p;
        }
        if (a && c !== null)
          throw Error(g(529, ""));
        return null;
      case "script":
        return a = u.async, u = u.src, typeof u == "string" && a && typeof a != "function" && typeof a != "symbol" ? (a = Pc(u), u = hc(
          f
        ).hoistableScripts, c = u.get(a), c || (c = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, u.set(a, c)), c) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(g(444, l));
    }
  }
  function Ln(l) {
    return 'href="' + Rn(l) + '"';
  }
  function Ii(l) {
    return 'link[rel="stylesheet"][' + l + "]";
  }
  function Ts(l) {
    return ae({}, l, {
      "data-precedence": l.precedence,
      precedence: null
    });
  }
  function Lg(l, a, u, c) {
    l.querySelector('link[rel="preload"][as="style"][' + a + "]") ? c.loading = 1 : (a = l.createElement("link"), c.preload = a, a.addEventListener("load", function() {
      return c.loading |= 1;
    }), a.addEventListener("error", function() {
      return c.loading |= 2;
    }), Bl(a, "link", u), ct(a), l.head.appendChild(a));
  }
  function Pc(l) {
    return '[src="' + Rn(l) + '"]';
  }
  function As(l) {
    return "script[async]" + l;
  }
  function py(l, a, u) {
    if (a.count++, a.instance === null)
      switch (a.type) {
        case "style":
          var c = l.querySelector(
            'style[data-href~="' + Rn(u.href) + '"]'
          );
          if (c)
            return a.instance = c, ct(c), c;
          var f = ae({}, u, {
            "data-href": u.href,
            "data-precedence": u.precedence,
            href: null,
            precedence: null
          });
          return c = (l.ownerDocument || l).createElement(
            "style"
          ), ct(c), Bl(c, "style", f), yr(c, u.precedence, l), a.instance = c;
        case "stylesheet":
          f = Ln(u.href);
          var r = l.querySelector(
            Ii(f)
          );
          if (r)
            return a.state.loading |= 4, a.instance = r, ct(r), r;
          c = Ts(u), (f = Tn.get(f)) && Dh(c, f), r = (l.ownerDocument || l).createElement("link"), ct(r);
          var p = r;
          return p._p = new Promise(function(E, O) {
            p.onload = E, p.onerror = O;
          }), Bl(r, "link", c), a.state.loading |= 4, yr(r, u.precedence, l), a.instance = r;
        case "script":
          return r = Pc(u.src), (f = l.querySelector(
            As(r)
          )) ? (a.instance = f, ct(f), f) : (c = u, (f = Tn.get(r)) && (c = ae({}, u), _h(c, f)), l = l.ownerDocument || l, f = l.createElement("script"), ct(f), Bl(f, "link", c), l.head.appendChild(f), a.instance = f);
        case "void":
          return null;
        default:
          throw Error(g(443, a.type));
      }
    else
      a.type === "stylesheet" && (a.state.loading & 4) === 0 && (c = a.instance, a.state.loading |= 4, yr(c, u.precedence, l));
    return a.instance;
  }
  function yr(l, a, u) {
    for (var c = u.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), f = c.length ? c[c.length - 1] : null, r = f, p = 0; p < c.length; p++) {
      var E = c[p];
      if (E.dataset.precedence === a) r = E;
      else if (r !== f) break;
    }
    r ? r.parentNode.insertBefore(l, r.nextSibling) : (a = u.nodeType === 9 ? u.head : u, a.insertBefore(l, a.firstChild));
  }
  function Dh(l, a) {
    l.crossOrigin == null && (l.crossOrigin = a.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = a.referrerPolicy), l.title == null && (l.title = a.title);
  }
  function _h(l, a) {
    l.crossOrigin == null && (l.crossOrigin = a.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = a.referrerPolicy), l.integrity == null && (l.integrity = a.integrity);
  }
  var zs = null;
  function yy(l, a, u) {
    if (zs === null) {
      var c = /* @__PURE__ */ new Map(), f = zs = /* @__PURE__ */ new Map();
      f.set(u, c);
    } else
      f = zs, c = f.get(u), c || (c = /* @__PURE__ */ new Map(), f.set(u, c));
    if (c.has(l)) return c;
    for (c.set(l, null), u = u.getElementsByTagName(l), f = 0; f < u.length; f++) {
      var r = u[f];
      if (!(r[$a] || r[ht] || l === "link" && r.getAttribute("rel") === "stylesheet") && r.namespaceURI !== "http://www.w3.org/2000/svg") {
        var p = r.getAttribute(a) || "";
        p = l + p;
        var E = c.get(p);
        E ? E.push(r) : c.set(p, [r]);
      }
    }
    return c;
  }
  function Rh(l, a, u) {
    l = l.ownerDocument || l, l.head.insertBefore(
      u,
      a === "title" ? l.querySelector("head > title") : null
    );
  }
  function gy(l, a, u) {
    if (u === 1 || a.itemProp != null) return !1;
    switch (l) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof a.precedence != "string" || typeof a.href != "string" || a.href === "")
          break;
        return !0;
      case "link":
        if (typeof a.rel != "string" || typeof a.href != "string" || a.href === "" || a.onLoad || a.onError)
          break;
        switch (a.rel) {
          case "stylesheet":
            return l = a.disabled, typeof a.precedence == "string" && l == null;
          default:
            return !0;
        }
      case "script":
        if (a.async && typeof a.async != "function" && typeof a.async != "symbol" && !a.onLoad && !a.onError && a.src && typeof a.src == "string")
          return !0;
    }
    return !1;
  }
  function An(l) {
    return !(l.type === "stylesheet" && (l.state.loading & 3) === 0);
  }
  function Eu(l, a, u, c) {
    if (u.type === "stylesheet" && (typeof c.media != "string" || matchMedia(c.media).matches !== !1) && (u.state.loading & 4) === 0) {
      if (u.instance === null) {
        var f = Ln(c.href), r = a.querySelector(
          Ii(f)
        );
        if (r) {
          a = r._p, a !== null && typeof a == "object" && typeof a.then == "function" && (l.count++, l = Mh.bind(l), a.then(l, l)), u.state.loading |= 4, u.instance = r, ct(r);
          return;
        }
        r = a.ownerDocument || a, c = Ts(c), (f = Tn.get(f)) && Dh(c, f), r = r.createElement("link"), ct(r);
        var p = r;
        p._p = new Promise(function(E, O) {
          p.onload = E, p.onerror = O;
        }), Bl(r, "link", c), u.instance = r;
      }
      l.stylesheets === null && (l.stylesheets = /* @__PURE__ */ new Map()), l.stylesheets.set(u, a), (a = u.state.preload) && (u.state.loading & 3) === 0 && (l.count++, u = Mh.bind(l), a.addEventListener("load", u), a.addEventListener("error", u));
    }
  }
  var Vn = 0;
  function vy(l, a) {
    return l.stylesheets && l.count === 0 && Uh(l, l.stylesheets), 0 < l.count || 0 < l.imgCount ? function(u) {
      var c = setTimeout(function() {
        if (l.stylesheets && Uh(l, l.stylesheets), l.unsuspend) {
          var r = l.unsuspend;
          l.unsuspend = null, r();
        }
      }, 6e4 + a);
      0 < l.imgBytes && Vn === 0 && (Vn = 62500 * sy());
      var f = setTimeout(
        function() {
          if (l.waitingForImages = !1, l.count === 0 && (l.stylesheets && Uh(l, l.stylesheets), l.unsuspend)) {
            var r = l.unsuspend;
            l.unsuspend = null, r();
          }
        },
        (l.imgBytes > Vn ? 50 : 800) + a
      );
      return l.unsuspend = u, function() {
        l.unsuspend = null, clearTimeout(c), clearTimeout(f);
      };
    } : null;
  }
  function Mh() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Uh(this, this.stylesheets);
      else if (this.unsuspend) {
        var l = this.unsuspend;
        this.unsuspend = null, l();
      }
    }
  }
  var Ch = null;
  function Uh(l, a) {
    l.stylesheets = null, l.unsuspend !== null && (l.count++, Ch = /* @__PURE__ */ new Map(), a.forEach(zl, l), Ch = null, Mh.call(l));
  }
  function zl(l, a) {
    if (!(a.state.loading & 4)) {
      var u = Ch.get(l);
      if (u) var c = u.get(null);
      else {
        u = /* @__PURE__ */ new Map(), Ch.set(l, u);
        for (var f = l.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), r = 0; r < f.length; r++) {
          var p = f[r];
          (p.nodeName === "LINK" || p.getAttribute("media") !== "not all") && (u.set(p.dataset.precedence, p), c = p);
        }
        c && u.set(null, c);
      }
      f = a.instance, p = f.getAttribute("data-precedence"), r = u.get(p) || c, r === c && u.set(null, f), u.set(p, f), this.count++, c = Mh.bind(this), f.addEventListener("load", c), f.addEventListener("error", c), r ? r.parentNode.insertBefore(f, r.nextSibling) : (l = l.nodeType === 9 ? l.head : l, l.insertBefore(f, l.firstChild)), a.state.loading |= 4;
    }
  }
  var gr = {
    $$typeof: wt,
    Provider: null,
    Consumer: null,
    _currentValue: W,
    _currentValue2: W,
    _threadCount: 0
  };
  function by(l, a, u, c, f, r, p, E, O) {
    this.tag = 1, this.containerInfo = l, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = nf(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = nf(0), this.hiddenUpdates = nf(null), this.identifierPrefix = c, this.onUncaughtError = f, this.onCaughtError = r, this.onRecoverableError = p, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = O, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function xh(l, a, u, c, f, r, p, E, O, H, L, J) {
    return l = new by(
      l,
      a,
      u,
      p,
      O,
      H,
      L,
      J,
      E
    ), a = 1, r === !0 && (a |= 24), r = Zt(3, null, null, a), l.current = r, r.stateNode = l, a = Of(), a.refCount++, l.pooledCache = a, a.refCount++, r.memoizedState = {
      element: c,
      isDehydrated: u,
      cache: a
    }, xf(r), l;
  }
  function eo(l) {
    return l ? (l = Pl, l) : Pl;
  }
  function Vg(l, a, u, c, f, r) {
    f = eo(f), c.context === null ? c.context = f : c.pendingContext = f, c = Fu(a), c.payload = { element: u }, r = r === void 0 ? null : r, r !== null && (c.callback = r), u = Bn(l, c, a), u !== null && (fn(u, l, a), qi(u, l, a));
  }
  function Nh(l, a) {
    if (l = l.memoizedState, l !== null && l.dehydrated !== null) {
      var u = l.retryLane;
      l.retryLane = u !== 0 && u < a ? u : a;
    }
  }
  function Sy(l, a) {
    Nh(l, a), (l = l.alternate) && Nh(l, a);
  }
  function Qg(l) {
    if (l.tag === 13 || l.tag === 31) {
      var a = Qu(l, 67108864);
      a !== null && fn(a, l, 67108864), Sy(l, 67108864);
    }
  }
  function to(l) {
    if (l.tag === 13 || l.tag === 31) {
      var a = En();
      a = kr(a);
      var u = Qu(l, a);
      u !== null && fn(u, l, a), Sy(l, a);
    }
  }
  var dl = !0;
  function Tu(l, a, u, c) {
    var f = C.T;
    C.T = null;
    var r = K.p;
    try {
      K.p = 2, ql(l, a, u, c);
    } finally {
      K.p = r, C.T = f;
    }
  }
  function Au(l, a, u, c) {
    var f = C.T;
    C.T = null;
    var r = K.p;
    try {
      K.p = 8, ql(l, a, u, c);
    } finally {
      K.p = r, C.T = f;
    }
  }
  function ql(l, a, u, c) {
    if (dl) {
      var f = Ey(c);
      if (f === null)
        ny(
          l,
          a,
          c,
          Hh,
          u
        ), oi(l, c);
      else if (S1(
        f,
        l,
        a,
        u,
        c
      ))
        c.stopPropagation();
      else if (oi(l, c), a & 4 && -1 < dn.indexOf(l)) {
        for (; f !== null; ) {
          var r = dc(f);
          if (r !== null)
            switch (r.tag) {
              case 3:
                if (r = r.stateNode, r.current.memoizedState.isDehydrated) {
                  var p = In(r.pendingLanes);
                  if (p !== 0) {
                    var E = r;
                    for (E.pendingLanes |= 2, E.entangledLanes |= 2; p; ) {
                      var O = 1 << 31 - kl(p);
                      E.entanglements[1] |= O, p &= ~O;
                    }
                    Su(r), (et & 6) === 0 && (at = Nl() + 500, ii(0));
                  }
                }
                break;
              case 31:
              case 13:
                E = Qu(r, 2), E !== null && fn(E, r, 2), fs(), Sy(r, 2);
            }
          if (r = Ey(c), r === null && ny(
            l,
            a,
            c,
            Hh,
            u
          ), r === f) break;
          f = r;
        }
        f !== null && c.stopPropagation();
      } else
        ny(
          l,
          a,
          c,
          null,
          u
        );
    }
  }
  function Ey(l) {
    return l = ud(l), Os(l);
  }
  var Hh = null;
  function Os(l) {
    if (Hh = null, l = rc(l), l !== null) {
      var a = G(l);
      if (a === null) l = null;
      else {
        var u = a.tag;
        if (u === 13) {
          if (l = ee(a), l !== null) return l;
          l = null;
        } else if (u === 31) {
          if (l = X(a), l !== null) return l;
          l = null;
        } else if (u === 3) {
          if (a.stateNode.current.memoizedState.isDehydrated)
            return a.tag === 3 ? a.stateNode.containerInfo : null;
          l = null;
        } else a !== l && (l = null);
      }
    }
    return Hh = l, null;
  }
  function vr(l) {
    switch (l) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (a1()) {
          case Jr:
            return 2;
          case Kr:
            return 8;
          case gi:
          case u1:
            return 32;
          case vm:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var Ds = !1, hl = null, jl = null, Zl = null, Pi = /* @__PURE__ */ new Map(), ra = /* @__PURE__ */ new Map(), Ht = [], dn = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function oi(l, a) {
    switch (l) {
      case "focusin":
      case "focusout":
        hl = null;
        break;
      case "dragenter":
      case "dragleave":
        jl = null;
        break;
      case "mouseover":
      case "mouseout":
        Zl = null;
        break;
      case "pointerover":
      case "pointerout":
        Pi.delete(a.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        ra.delete(a.pointerId);
    }
  }
  function lo(l, a, u, c, f, r) {
    return l === null || l.nativeEvent !== r ? (l = {
      blockedOn: a,
      domEventName: u,
      eventSystemFlags: c,
      nativeEvent: r,
      targetContainers: [f]
    }, a !== null && (a = dc(a), a !== null && Qg(a)), l) : (l.eventSystemFlags |= c, a = l.targetContainers, f !== null && a.indexOf(f) === -1 && a.push(f), l);
  }
  function S1(l, a, u, c, f) {
    switch (a) {
      case "focusin":
        return hl = lo(
          hl,
          l,
          a,
          u,
          c,
          f
        ), !0;
      case "dragenter":
        return jl = lo(
          jl,
          l,
          a,
          u,
          c,
          f
        ), !0;
      case "mouseover":
        return Zl = lo(
          Zl,
          l,
          a,
          u,
          c,
          f
        ), !0;
      case "pointerover":
        var r = f.pointerId;
        return Pi.set(
          r,
          lo(
            Pi.get(r) || null,
            l,
            a,
            u,
            c,
            f
          )
        ), !0;
      case "gotpointercapture":
        return r = f.pointerId, ra.set(
          r,
          lo(
            ra.get(r) || null,
            l,
            a,
            u,
            c,
            f
          )
        ), !0;
    }
    return !1;
  }
  function Zg(l) {
    var a = rc(l.target);
    if (a !== null) {
      var u = G(a);
      if (u !== null) {
        if (a = u.tag, a === 13) {
          if (a = ee(u), a !== null) {
            l.blockedOn = a, Em(l.priority, function() {
              to(u);
            });
            return;
          }
        } else if (a === 31) {
          if (a = X(u), a !== null) {
            l.blockedOn = a, Em(l.priority, function() {
              to(u);
            });
            return;
          }
        } else if (a === 3 && u.stateNode.current.memoizedState.isDehydrated) {
          l.blockedOn = u.tag === 3 ? u.stateNode.containerInfo : null;
          return;
        }
      }
    }
    l.blockedOn = null;
  }
  function br(l) {
    if (l.blockedOn !== null) return !1;
    for (var a = l.targetContainers; 0 < a.length; ) {
      var u = Ey(l.nativeEvent);
      if (u === null) {
        u = l.nativeEvent;
        var c = new u.constructor(
          u.type,
          u
        );
        ad = c, u.target.dispatchEvent(c), ad = null;
      } else
        return a = dc(u), a !== null && Qg(a), l.blockedOn = u, !1;
      a.shift();
    }
    return !0;
  }
  function _s(l, a, u) {
    br(l) && u.delete(a);
  }
  function Jg() {
    Ds = !1, hl !== null && br(hl) && (hl = null), jl !== null && br(jl) && (jl = null), Zl !== null && br(Zl) && (Zl = null), Pi.forEach(_s), ra.forEach(_s);
  }
  function zu(l, a) {
    l.blockedOn === a && (l.blockedOn = null, Ds || (Ds = !0, b.unstable_scheduleCallback(
      b.unstable_NormalPriority,
      Jg
    )));
  }
  var Rs = null;
  function Kg(l) {
    Rs !== l && (Rs = l, b.unstable_scheduleCallback(
      b.unstable_NormalPriority,
      function() {
        Rs === l && (Rs = null);
        for (var a = 0; a < l.length; a += 3) {
          var u = l[a], c = l[a + 1], f = l[a + 2];
          if (typeof c != "function") {
            if (Os(c || u) === null)
              continue;
            break;
          }
          var r = dc(u);
          r !== null && (l.splice(a, 3), a -= 3, Fo(
            r,
            {
              pending: !0,
              data: f,
              method: u.method,
              action: c
            },
            c,
            f
          ));
        }
      }
    ));
  }
  function Ms(l) {
    function a(O) {
      return zu(O, l);
    }
    hl !== null && zu(hl, l), jl !== null && zu(jl, l), Zl !== null && zu(Zl, l), Pi.forEach(a), ra.forEach(a);
    for (var u = 0; u < Ht.length; u++) {
      var c = Ht[u];
      c.blockedOn === l && (c.blockedOn = null);
    }
    for (; 0 < Ht.length && (u = Ht[0], u.blockedOn === null); )
      Zg(u), u.blockedOn === null && Ht.shift();
    if (u = (l.ownerDocument || l).$$reactFormReplay, u != null)
      for (c = 0; c < u.length; c += 3) {
        var f = u[c], r = u[c + 1], p = f[Wl] || null;
        if (typeof r == "function")
          p || Kg(u);
        else if (p) {
          var E = null;
          if (r && r.hasAttribute("formAction")) {
            if (f = r, p = r[Wl] || null)
              E = p.formAction;
            else if (Os(f) !== null) continue;
          } else E = p.action;
          typeof E == "function" ? u[c + 1] = E : (u.splice(c, 3), c -= 3), Kg(u);
        }
      }
  }
  function Ty() {
    function l(r) {
      r.canIntercept && r.info === "react-transition" && r.intercept({
        handler: function() {
          return new Promise(function(p) {
            return f = p;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function a() {
      f !== null && (f(), f = null), c || setTimeout(u, 20);
    }
    function u() {
      if (!c && !navigation.transition) {
        var r = navigation.currentEntry;
        r && r.url != null && navigation.navigate(r.url, {
          state: r.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var c = !1, f = null;
      return navigation.addEventListener("navigate", l), navigation.addEventListener("navigatesuccess", a), navigation.addEventListener("navigateerror", a), setTimeout(u, 100), function() {
        c = !0, navigation.removeEventListener("navigate", l), navigation.removeEventListener("navigatesuccess", a), navigation.removeEventListener("navigateerror", a), f !== null && (f(), f = null);
      };
    }
  }
  function Bh(l) {
    this._internalRoot = l;
  }
  qh.prototype.render = Bh.prototype.render = function(l) {
    var a = this._internalRoot;
    if (a === null) throw Error(g(409));
    var u = a.current, c = En();
    Vg(u, c, l, a, null, null);
  }, qh.prototype.unmount = Bh.prototype.unmount = function() {
    var l = this._internalRoot;
    if (l !== null) {
      this._internalRoot = null;
      var a = l.containerInfo;
      Vg(l.current, 2, null, l, null, null), fs(), a[bi] = null;
    }
  };
  function qh(l) {
    this._internalRoot = l;
  }
  qh.prototype.unstable_scheduleHydration = function(l) {
    if (l) {
      var a = Wr();
      l = { blockedOn: null, target: l, priority: a };
      for (var u = 0; u < Ht.length && a !== 0 && a < Ht[u].priority; u++) ;
      Ht.splice(u, 0, l), u === 0 && Zg(l);
    }
  };
  var Ay = m.version;
  if (Ay !== "19.2.1")
    throw Error(
      g(
        527,
        Ay,
        "19.2.1"
      )
    );
  K.findDOMNode = function(l) {
    var a = l._reactInternals;
    if (a === void 0)
      throw typeof l.render == "function" ? Error(g(188)) : (l = Object.keys(l).join(","), Error(g(268, l)));
    return l = Re(a), l = l !== null ? ke(l) : null, l = l === null ? null : l.stateNode, l;
  };
  var $g = {
    bundleType: 0,
    version: "19.2.1",
    rendererPackageName: "react-dom",
    currentDispatcherRef: C,
    reconcilerVersion: "19.2.1"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Sr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Sr.isDisabled && Sr.supportsFiber)
      try {
        sc = Sr.inject(
          $g
        ), pn = Sr;
      } catch {
      }
  }
  return g0.createRoot = function(l, a) {
    if (!x(l)) throw Error(g(299));
    var u = !1, c = "", f = Kd, r = zp, p = $d;
    return a != null && (a.unstable_strictMode === !0 && (u = !0), a.identifierPrefix !== void 0 && (c = a.identifierPrefix), a.onUncaughtError !== void 0 && (f = a.onUncaughtError), a.onCaughtError !== void 0 && (r = a.onCaughtError), a.onRecoverableError !== void 0 && (p = a.onRecoverableError)), a = xh(
      l,
      1,
      !1,
      null,
      null,
      u,
      c,
      null,
      f,
      r,
      p,
      Ty
    ), l[bi] = a.current, ys(l), new Bh(a);
  }, g0.hydrateRoot = function(l, a, u) {
    if (!x(l)) throw Error(g(299));
    var c = !1, f = "", r = Kd, p = zp, E = $d, O = null;
    return u != null && (u.unstable_strictMode === !0 && (c = !0), u.identifierPrefix !== void 0 && (f = u.identifierPrefix), u.onUncaughtError !== void 0 && (r = u.onUncaughtError), u.onCaughtError !== void 0 && (p = u.onCaughtError), u.onRecoverableError !== void 0 && (E = u.onRecoverableError), u.formState !== void 0 && (O = u.formState)), a = xh(
      l,
      1,
      !0,
      a,
      u ?? null,
      c,
      f,
      O,
      r,
      p,
      E,
      Ty
    ), a.context = eo(null), u = a.current, c = En(), c = kr(c), f = Fu(c), f.callback = null, Bn(u, f, c), u = c, a.current.lanes = u, To(a, u), Su(a), l[bi] = a.current, ys(l), new qh(a);
  }, g0.version = "19.2.1", g0;
}
var v0 = {};
var dE;
function mA() {
  return dE || (dE = 1, process.env.NODE_ENV !== "production" && (function() {
    function b(e, t) {
      for (e = e.memoizedState; e !== null && 0 < t; )
        e = e.next, t--;
      return e;
    }
    function m(e, t, n, i) {
      if (n >= t.length) return i;
      var o = t[n], s = il(e) ? e.slice() : Be({}, e);
      return s[o] = m(e[o], t, n + 1, i), s;
    }
    function y(e, t, n) {
      if (t.length !== n.length)
        console.warn("copyWithRename() expects paths of the same length");
      else {
        for (var i = 0; i < n.length - 1; i++)
          if (t[i] !== n[i]) {
            console.warn(
              "copyWithRename() expects paths to be the same except for the deepest key"
            );
            return;
          }
        return g(e, t, n, 0);
      }
    }
    function g(e, t, n, i) {
      var o = t[i], s = il(e) ? e.slice() : Be({}, e);
      return i + 1 === t.length ? (s[n[i]] = s[o], il(s) ? s.splice(o, 1) : delete s[o]) : s[o] = g(
        e[o],
        t,
        n,
        i + 1
      ), s;
    }
    function x(e, t, n) {
      var i = t[n], o = il(e) ? e.slice() : Be({}, e);
      return n + 1 === t.length ? (il(o) ? o.splice(i, 1) : delete o[i], o) : (o[i] = x(e[i], t, n + 1), o);
    }
    function G() {
      return !1;
    }
    function ee() {
      return null;
    }
    function X() {
      console.error(
        "Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://react.dev/link/rules-of-hooks"
      );
    }
    function re() {
      console.error(
        "Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo()."
      );
    }
    function Re() {
    }
    function ke() {
    }
    function ae(e) {
      var t = [];
      return e.forEach(function(n) {
        t.push(n);
      }), t.sort().join(", ");
    }
    function Te(e, t, n, i) {
      return new d1(e, t, n, i);
    }
    function it(e, t) {
      e.context === Ns && (Sh(e.current, 2, t, e, null, null), Gn());
    }
    function lt(e, t) {
      if (_u !== null) {
        var n = t.staleFamilies;
        t = t.updatedFamilies, Ff(), Y0(
          e.current,
          t,
          n
        ), Gn();
      }
    }
    function Ct(e) {
      _u = e;
    }
    function Ze(e) {
      return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
    }
    function Je(e) {
      var t = e, n = e;
      if (e.alternate) for (; t.return; ) t = t.return;
      else {
        e = t;
        do
          t = e, (t.flags & 4098) !== 0 && (n = t.return), e = t.return;
        while (e);
      }
      return t.tag === 3 ? n : null;
    }
    function mn(e) {
      if (e.tag === 13) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
      }
      return null;
    }
    function wt(e) {
      if (e.tag === 31) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
      }
      return null;
    }
    function ol(e) {
      if (Je(e) !== e)
        throw Error("Unable to find node on an unmounted component.");
    }
    function Gl(e) {
      var t = e.alternate;
      if (!t) {
        if (t = Je(e), t === null)
          throw Error("Unable to find node on an unmounted component.");
        return t !== e ? null : e;
      }
      for (var n = e, i = t; ; ) {
        var o = n.return;
        if (o === null) break;
        var s = o.alternate;
        if (s === null) {
          if (i = o.return, i !== null) {
            n = i;
            continue;
          }
          break;
        }
        if (o.child === s.child) {
          for (s = o.child; s; ) {
            if (s === n) return ol(o), e;
            if (s === i) return ol(o), t;
            s = s.sibling;
          }
          throw Error("Unable to find node on an unmounted component.");
        }
        if (n.return !== i.return) n = o, i = s;
        else {
          for (var d = !1, h = o.child; h; ) {
            if (h === n) {
              d = !0, n = o, i = s;
              break;
            }
            if (h === i) {
              d = !0, i = o, n = s;
              break;
            }
            h = h.sibling;
          }
          if (!d) {
            for (h = s.child; h; ) {
              if (h === n) {
                d = !0, n = s, i = o;
                break;
              }
              if (h === i) {
                d = !0, i = s, n = o;
                break;
              }
              h = h.sibling;
            }
            if (!d)
              throw Error(
                "Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue."
              );
          }
        }
        if (n.alternate !== i)
          throw Error(
            "Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue."
          );
      }
      if (n.tag !== 3)
        throw Error("Unable to find node on an unmounted component.");
      return n.stateNode.current === n ? e : t;
    }
    function nl(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return e;
      for (e = e.child; e !== null; ) {
        if (t = nl(e), t !== null) return t;
        e = e.sibling;
      }
      return null;
    }
    function I(e) {
      return e === null || typeof e != "object" ? null : (e = Xg && e[Xg] || e["@@iterator"], typeof e == "function" ? e : null);
    }
    function me(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === Ss ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case vs:
          return "Fragment";
        case mr:
          return "Profiler";
        case rn:
          return "StrictMode";
        case Ic:
          return "Suspense";
        case Tn:
          return "SuspenseList";
        case Ya:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case Wi:
            return "Portal";
          case wa:
            return e.displayName || "Context";
          case Oh:
            return (e._context.displayName || "Context") + ".Consumer";
          case bs:
            var t = e.render;
            return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case pr:
            return t = e.displayName || null, t !== null ? t : me(e.type) || "Memo";
          case Ql:
            t = e._payload, e = e._init;
            try {
              return me(e(t));
            } catch {
            }
        }
      return null;
    }
    function Dt(e) {
      return typeof e.tag == "number" ? ie(e) : typeof e.name == "string" ? e.name : null;
    }
    function ie(e) {
      var t = e.type;
      switch (e.tag) {
        case 31:
          return "Activity";
        case 24:
          return "Cache";
        case 9:
          return (t._context.displayName || "Context") + ".Consumer";
        case 10:
          return t.displayName || "Context";
        case 18:
          return "DehydratedFragment";
        case 11:
          return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
        case 7:
          return "Fragment";
        case 26:
        case 27:
        case 5:
          return t;
        case 4:
          return "Portal";
        case 3:
          return "Root";
        case 6:
          return "Text";
        case 16:
          return me(t);
        case 8:
          return t === rn ? "StrictMode" : "Mode";
        case 22:
          return "Offscreen";
        case 12:
          return "Profiler";
        case 21:
          return "Scope";
        case 13:
          return "Suspense";
        case 19:
          return "SuspenseList";
        case 25:
          return "TracingMarker";
        case 1:
        case 0:
        case 14:
        case 15:
          if (typeof t == "function")
            return t.displayName || t.name || null;
          if (typeof t == "string") return t;
          break;
        case 29:
          if (t = e._debugInfo, t != null) {
            for (var n = t.length - 1; 0 <= n; n--)
              if (typeof t[n].name == "string") return t[n].name;
          }
          if (e.return !== null)
            return ie(e.return);
      }
      return null;
    }
    function bt(e) {
      return { current: e };
    }
    function Ue(e, t) {
      0 > ci ? console.error("Unexpected pop.") : (t !== my[ci] && console.error("Unexpected Fiber popped."), e.current = hy[ci], hy[ci] = null, my[ci] = null, ci--);
    }
    function Me(e, t, n) {
      ci++, hy[ci] = e.current, my[ci] = n, e.current = t;
    }
    function yl(e) {
      return e === null && console.error(
        "Expected host context to exist. This error is likely caused by a bug in React. Please file an issue."
      ), e;
    }
    function Vt(e, t) {
      Me(Ln, t, e), Me(Es, e, e), Me(Fi, null, e);
      var n = t.nodeType;
      switch (n) {
        case 9:
        case 11:
          n = n === 9 ? "#document" : "#fragment", t = (t = t.documentElement) && (t = t.namespaceURI) ? mg(t) : go;
          break;
        default:
          if (n = t.tagName, t = t.namespaceURI)
            t = mg(t), t = ai(
              t,
              n
            );
          else
            switch (n) {
              case "svg":
                t = dm;
                break;
              case "math":
                t = Yv;
                break;
              default:
                t = go;
            }
      }
      n = n.toLowerCase(), n = Om(null, n), n = {
        context: t,
        ancestorInfo: n
      }, Ue(Fi, e), Me(Fi, n, e);
    }
    function C(e) {
      Ue(Fi, e), Ue(Es, e), Ue(Ln, e);
    }
    function K() {
      return yl(Fi.current);
    }
    function W(e) {
      e.memoizedState !== null && Me(Ii, e, e);
      var t = yl(Fi.current), n = e.type, i = ai(t.context, n);
      n = Om(t.ancestorInfo, n), i = { context: i, ancestorInfo: n }, t !== i && (Me(Es, e, e), Me(Fi, i, e));
    }
    function ye(e) {
      Es.current === e && (Ue(Fi, e), Ue(Es, e)), Ii.current === e && (Ue(Ii, e), d0._currentValue = Vr);
    }
    function Se() {
    }
    function Q() {
      if (Ts === 0) {
        Lg = console.log, Pc = console.info, As = console.warn, py = console.error, yr = console.group, Dh = console.groupCollapsed, _h = console.groupEnd;
        var e = {
          configurable: !0,
          enumerable: !0,
          value: Se,
          writable: !0
        };
        Object.defineProperties(console, {
          info: e,
          log: e,
          warn: e,
          error: e,
          group: e,
          groupCollapsed: e,
          groupEnd: e
        });
      }
      Ts++;
    }
    function ne() {
      if (Ts--, Ts === 0) {
        var e = { configurable: !0, enumerable: !0, writable: !0 };
        Object.defineProperties(console, {
          log: Be({}, e, { value: Lg }),
          info: Be({}, e, { value: Pc }),
          warn: Be({}, e, { value: As }),
          error: Be({}, e, { value: py }),
          group: Be({}, e, { value: yr }),
          groupCollapsed: Be({}, e, { value: Dh }),
          groupEnd: Be({}, e, { value: _h })
        });
      }
      0 > Ts && console.error(
        "disabledDepth fell below zero. This is a bug in React. Please file an issue."
      );
    }
    function se(e) {
      var t = Error.prepareStackTrace;
      if (Error.prepareStackTrace = void 0, e = e.stack, Error.prepareStackTrace = t, e.startsWith(`Error: react-stack-top-frame
`) && (e = e.slice(29)), t = e.indexOf(`
`), t !== -1 && (e = e.slice(t + 1)), t = e.indexOf("react_stack_bottom_frame"), t !== -1 && (t = e.lastIndexOf(
        `
`,
        t
      )), t !== -1)
        e = e.slice(0, t);
      else return "";
      return e;
    }
    function fe(e) {
      if (zs === void 0)
        try {
          throw Error();
        } catch (n) {
          var t = n.stack.trim().match(/\n( *(at )?)/);
          zs = t && t[1] || "", yy = -1 < n.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < n.stack.indexOf("@") ? "@unknown:0:0" : "";
        }
      return `
` + zs + e + yy;
    }
    function Qt(e, t) {
      if (!e || Rh) return "";
      var n = gy.get(e);
      if (n !== void 0) return n;
      Rh = !0, n = Error.prepareStackTrace, Error.prepareStackTrace = void 0;
      var i = null;
      i = w.H, w.H = null, Q();
      try {
        var o = {
          DetermineComponentFrameRoot: function() {
            try {
              if (t) {
                var A = function() {
                  throw Error();
                };
                if (Object.defineProperty(A.prototype, "props", {
                  set: function() {
                    throw Error();
                  }
                }), typeof Reflect == "object" && Reflect.construct) {
                  try {
                    Reflect.construct(A, []);
                  } catch (F) {
                    var q = F;
                  }
                  Reflect.construct(e, [], A);
                } else {
                  try {
                    A.call();
                  } catch (F) {
                    q = F;
                  }
                  e.call(A.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (F) {
                  q = F;
                }
                (A = e()) && typeof A.catch == "function" && A.catch(function() {
                });
              }
            } catch (F) {
              if (F && q && typeof F.stack == "string")
                return [F.stack, q.stack];
            }
            return [null, null];
          }
        };
        o.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var s = Object.getOwnPropertyDescriptor(
          o.DetermineComponentFrameRoot,
          "name"
        );
        s && s.configurable && Object.defineProperty(
          o.DetermineComponentFrameRoot,
          "name",
          { value: "DetermineComponentFrameRoot" }
        );
        var d = o.DetermineComponentFrameRoot(), h = d[0], v = d[1];
        if (h && v) {
          var S = h.split(`
`), _ = v.split(`
`);
          for (d = s = 0; s < S.length && !S[s].includes(
            "DetermineComponentFrameRoot"
          ); )
            s++;
          for (; d < _.length && !_[d].includes(
            "DetermineComponentFrameRoot"
          ); )
            d++;
          if (s === S.length || d === _.length)
            for (s = S.length - 1, d = _.length - 1; 1 <= s && 0 <= d && S[s] !== _[d]; )
              d--;
          for (; 1 <= s && 0 <= d; s--, d--)
            if (S[s] !== _[d]) {
              if (s !== 1 || d !== 1)
                do
                  if (s--, d--, 0 > d || S[s] !== _[d]) {
                    var M = `
` + S[s].replace(
                      " at new ",
                      " at "
                    );
                    return e.displayName && M.includes("<anonymous>") && (M = M.replace("<anonymous>", e.displayName)), typeof e == "function" && gy.set(e, M), M;
                  }
                while (1 <= s && 0 <= d);
              break;
            }
        }
      } finally {
        Rh = !1, w.H = i, ne(), Error.prepareStackTrace = n;
      }
      return S = (S = e ? e.displayName || e.name : "") ? fe(S) : "", typeof e == "function" && gy.set(e, S), S;
    }
    function Wn(e, t) {
      switch (e.tag) {
        case 26:
        case 27:
        case 5:
          return fe(e.type);
        case 16:
          return fe("Lazy");
        case 13:
          return e.child !== t && t !== null ? fe("Suspense Fallback") : fe("Suspense");
        case 19:
          return fe("SuspenseList");
        case 0:
        case 15:
          return Qt(e.type, !1);
        case 11:
          return Qt(e.type.render, !1);
        case 1:
          return Qt(e.type, !0);
        case 31:
          return fe("Activity");
        default:
          return "";
      }
    }
    function _t(e) {
      try {
        var t = "", n = null;
        do {
          t += Wn(e, n);
          var i = e._debugInfo;
          if (i)
            for (var o = i.length - 1; 0 <= o; o--) {
              var s = i[o];
              if (typeof s.name == "string") {
                var d = t;
                e: {
                  var h = s.name, v = s.env, S = s.debugLocation;
                  if (S != null) {
                    var _ = se(S), M = _.lastIndexOf(`
`), A = M === -1 ? _ : _.slice(M + 1);
                    if (A.indexOf(h) !== -1) {
                      var q = `
` + A;
                      break e;
                    }
                  }
                  q = fe(
                    h + (v ? " [" + v + "]" : "")
                  );
                }
                t = d + q;
              }
            }
          n = e, e = e.return;
        } while (e);
        return t;
      } catch (F) {
        return `
Error generating stack: ` + F.message + `
` + F.stack;
      }
    }
    function Fn(e) {
      return (e = e ? e.displayName || e.name : "") ? fe(e) : "";
    }
    function On() {
      if (An === null) return null;
      var e = An._debugOwner;
      return e != null ? Dt(e) : null;
    }
    function ef() {
      if (An === null) return "";
      var e = An;
      try {
        var t = "";
        switch (e.tag === 6 && (e = e.return), e.tag) {
          case 26:
          case 27:
          case 5:
            t += fe(e.type);
            break;
          case 13:
            t += fe("Suspense");
            break;
          case 19:
            t += fe("SuspenseList");
            break;
          case 31:
            t += fe("Activity");
            break;
          case 30:
          case 0:
          case 15:
          case 1:
            e._debugOwner || t !== "" || (t += Fn(
              e.type
            ));
            break;
          case 11:
            e._debugOwner || t !== "" || (t += Fn(
              e.type.render
            ));
        }
        for (; e; )
          if (typeof e.tag == "number") {
            var n = e;
            e = n._debugOwner;
            var i = n._debugStack;
            if (e && i) {
              var o = se(i);
              o !== "" && (t += `
` + o);
            }
          } else if (e.debugStack != null) {
            var s = e.debugStack;
            (e = e.owner) && s && (t += `
` + se(s));
          } else break;
        var d = t;
      } catch (h) {
        d = `
Error generating stack: ` + h.message + `
` + h.stack;
      }
      return d;
    }
    function le(e, t, n, i, o, s, d) {
      var h = An;
      tf(e);
      try {
        return e !== null && e._debugTask ? e._debugTask.run(
          t.bind(null, n, i, o, s, d)
        ) : t(n, i, o, s, d);
      } finally {
        tf(h);
      }
      throw Error(
        "runWithFiberInDEV should never be called in production. This is a bug in React."
      );
    }
    function tf(e) {
      w.getCurrentStack = e === null ? null : ef, Eu = !1, An = e;
    }
    function lf(e) {
      return typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
    }
    function Ja(e) {
      try {
        return cc(e), !1;
      } catch {
        return !0;
      }
    }
    function cc(e) {
      return "" + e;
    }
    function dt(e, t) {
      if (Ja(e))
        return console.error(
          "The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before using it here.",
          t,
          lf(e)
        ), cc(e);
    }
    function pm(e, t) {
      if (Ja(e))
        return console.error(
          "The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before using it here.",
          t,
          lf(e)
        ), cc(e);
    }
    function Qr(e) {
      if (Ja(e))
        return console.error(
          "Form field values (value, checked, defaultValue, or defaultChecked props) must be strings, not %s. This value must be coerced to a string before using it here.",
          lf(e)
        ), cc(e);
    }
    function ym(e) {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u") return !1;
      var t = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (t.isDisabled) return !0;
      if (!t.supportsFiber)
        return console.error(
          "The installed version of React DevTools is too old and will not work with the current version of React. Please update React DevTools. https://react.dev/link/react-devtools"
        ), !0;
      try {
        to = t.inject(e), dl = t;
      } catch (n) {
        console.error("React instrumentation encountered an error: %o.", n);
      }
      return !!t.checkDCE;
    }
    function St(e) {
      if (typeof Sy == "function" && Qg(e), dl && typeof dl.setStrictMode == "function")
        try {
          dl.setStrictMode(to, e);
        } catch (t) {
          Tu || (Tu = !0, console.error(
            "React instrumentation encountered an error: %o",
            t
          ));
        }
    }
    function gm(e) {
      return e >>>= 0, e === 0 ? 32 : 31 - (Ey(e) / Hh | 0) | 0;
    }
    function oc(e) {
      var t = e & 42;
      if (t !== 0) return t;
      switch (e & -e) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return e & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return e & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return console.error(
            "Should have found matching lanes. This is a bug in React."
          ), e;
      }
    }
    function Zr(e, t, n) {
      var i = e.pendingLanes;
      if (i === 0) return 0;
      var o = 0, s = e.suspendedLanes, d = e.pingedLanes;
      e = e.warmLanes;
      var h = i & 134217727;
      return h !== 0 ? (i = h & ~s, i !== 0 ? o = oc(i) : (d &= h, d !== 0 ? o = oc(d) : n || (n = h & ~e, n !== 0 && (o = oc(n))))) : (h = i & ~s, h !== 0 ? o = oc(h) : d !== 0 ? o = oc(d) : n || (n = i & ~e, n !== 0 && (o = oc(n)))), o === 0 ? 0 : t !== 0 && t !== o && (t & s) === 0 && (s = o & -o, n = t & -t, s >= n || s === 32 && (n & 4194048) !== 0) ? t : o;
    }
    function Nl(e, t) {
      return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
    }
    function a1(e, t) {
      switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return console.error(
            "Should have found matching lanes. This is a bug in React."
          ), -1;
      }
    }
    function Jr() {
      var e = Ds;
      return Ds <<= 1, (Ds & 62914560) === 0 && (Ds = 4194304), e;
    }
    function Kr(e) {
      for (var t = [], n = 0; 31 > n; n++) t.push(e);
      return t;
    }
    function gi(e, t) {
      e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
    }
    function u1(e, t, n, i, o, s) {
      var d = e.pendingLanes;
      e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
      var h = e.entanglements, v = e.expirationTimes, S = e.hiddenUpdates;
      for (n = d & ~n; 0 < n; ) {
        var _ = 31 - ql(n), M = 1 << _;
        h[_] = 0, v[_] = -1;
        var A = S[_];
        if (A !== null)
          for (S[_] = null, _ = 0; _ < A.length; _++) {
            var q = A[_];
            q !== null && (q.lane &= -536870913);
          }
        n &= ~M;
      }
      i !== 0 && vm(e, i, 0), s !== 0 && o === 0 && e.tag !== 0 && (e.suspendedLanes |= s & ~(d & ~t));
    }
    function vm(e, t, n) {
      e.pendingLanes |= t, e.suspendedLanes &= ~t;
      var i = 31 - ql(t);
      e.entangledLanes |= t, e.entanglements[i] = e.entanglements[i] | 1073741824 | n & 261930;
    }
    function E0(e, t) {
      var n = e.entangledLanes |= t;
      for (e = e.entanglements; n; ) {
        var i = 31 - ql(n), o = 1 << i;
        o & t | e[i] & t && (e[i] |= t), n &= ~o;
      }
    }
    function T0(e, t) {
      var n = t & -t;
      return n = (n & 42) !== 0 ? 1 : sc(n), (n & (e.suspendedLanes | t)) !== 0 ? 0 : n;
    }
    function sc(e) {
      switch (e) {
        case 2:
          e = 1;
          break;
        case 8:
          e = 4;
          break;
        case 32:
          e = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          e = 128;
          break;
        case 268435456:
          e = 134217728;
          break;
        default:
          e = 0;
      }
      return e;
    }
    function pn(e, t, n) {
      if (Au)
        for (e = e.pendingUpdatersLaneMap; 0 < n; ) {
          var i = 31 - ql(n), o = 1 << i;
          e[i].add(t), n &= ~o;
        }
    }
    function wu(e, t) {
      if (Au)
        for (var n = e.pendingUpdatersLaneMap, i = e.memoizedUpdaters; 0 < t; ) {
          var o = 31 - ql(t);
          e = 1 << o, o = n[o], 0 < o.size && (o.forEach(function(s) {
            var d = s.alternate;
            d !== null && i.has(d) || i.add(s);
          }), o.clear()), t &= ~e;
        }
    }
    function kl(e) {
      return e &= -e, hl < e ? jl < e ? (e & 134217727) !== 0 ? Zl : Pi : jl : hl;
    }
    function A0() {
      var e = ut.p;
      return e !== 0 ? e : (e = window.event, e === void 0 ? Zl : Th(e.type));
    }
    function z0(e, t) {
      var n = ut.p;
      try {
        return ut.p = e, t();
      } finally {
        ut.p = n;
      }
    }
    function bm(e) {
      delete e[Ht], delete e[dn], delete e[lo], delete e[S1], delete e[Zg];
    }
    function Yu(e) {
      var t = e[Ht];
      if (t) return t;
      for (var n = e.parentNode; n; ) {
        if (t = n[oi] || n[Ht]) {
          if (n = t.alternate, t.child !== null || n !== null && n.child !== null)
            for (e = $c(e); e !== null; ) {
              if (n = e[Ht])
                return n;
              e = $c(e);
            }
          return t;
        }
        e = n, n = e.parentNode;
      }
      return null;
    }
    function pa(e) {
      if (e = e[Ht] || e[oi]) {
        var t = e.tag;
        if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
          return e;
      }
      return null;
    }
    function vi(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6)
        return e.stateNode;
      throw Error("getNodeFromInstance: Invalid argument.");
    }
    function In(e) {
      var t = e[br];
      return t || (t = e[br] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
    }
    function Wt(e) {
      e[_s] = !0;
    }
    function ya(e, t) {
      Eo(e, t), Eo(e + "Capture", t);
    }
    function Eo(e, t) {
      zu[e] && console.error(
        "EventRegistry: More than one plugin attempted to publish the same registration name, `%s`.",
        e
      ), zu[e] = t;
      var n = e.toLowerCase();
      for (Rs[n] = e, e === "onDoubleClick" && (Rs.ondblclick = e), e = 0; e < t.length; e++)
        Jg.add(t[e]);
    }
    function fc(e, t) {
      Kg[t.type] || t.onChange || t.onInput || t.readOnly || t.disabled || t.value == null || console.error(
        e === "select" ? "You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set `onChange`." : "You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."
      ), t.onChange || t.readOnly || t.disabled || t.checked == null || console.error(
        "You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`."
      );
    }
    function nf(e) {
      return Vn.call(Bh, e) ? !0 : Vn.call(Ty, e) ? !1 : Ms.test(e) ? Bh[e] = !0 : (Ty[e] = !0, console.error("Invalid attribute name: `%s`", e), !1);
    }
    function To(e, t, n) {
      if (nf(t)) {
        if (!e.hasAttribute(t)) {
          switch (typeof n) {
            case "symbol":
            case "object":
              return n;
            case "function":
              return n;
            case "boolean":
              if (n === !1) return n;
          }
          return n === void 0 ? void 0 : null;
        }
        return e = e.getAttribute(t), e === "" && n === !0 ? !0 : (dt(n, t), e === "" + n ? n : e);
      }
    }
    function $r(e, t, n) {
      if (nf(t))
        if (n === null) e.removeAttribute(t);
        else {
          switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
              e.removeAttribute(t);
              return;
            case "boolean":
              var i = t.toLowerCase().slice(0, 5);
              if (i !== "data-" && i !== "aria-") {
                e.removeAttribute(t);
                return;
              }
          }
          dt(n, t), e.setAttribute(t, "" + n);
        }
    }
    function af(e, t, n) {
      if (n === null) e.removeAttribute(t);
      else {
        switch (typeof n) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(t);
            return;
        }
        dt(n, t), e.setAttribute(t, "" + n);
      }
    }
    function Ka(e, t, n, i) {
      if (i === null) e.removeAttribute(n);
      else {
        switch (typeof i) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(n);
            return;
        }
        dt(i, n), e.setAttributeNS(t, n, "" + i);
      }
    }
    function Dn(e) {
      switch (typeof e) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return e;
        case "object":
          return Qr(e), e;
        default:
          return "";
      }
    }
    function kr(e) {
      var t = e.type;
      return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
    }
    function Sm(e, t, n) {
      var i = Object.getOwnPropertyDescriptor(
        e.constructor.prototype,
        t
      );
      if (!e.hasOwnProperty(t) && typeof i < "u" && typeof i.get == "function" && typeof i.set == "function") {
        var o = i.get, s = i.set;
        return Object.defineProperty(e, t, {
          configurable: !0,
          get: function() {
            return o.call(this);
          },
          set: function(d) {
            Qr(d), n = "" + d, s.call(this, d);
          }
        }), Object.defineProperty(e, t, {
          enumerable: i.enumerable
        }), {
          getValue: function() {
            return n;
          },
          setValue: function(d) {
            Qr(d), n = "" + d;
          },
          stopTracking: function() {
            e._valueTracker = null, delete e[t];
          }
        };
      }
    }
    function Wr(e) {
      if (!e._valueTracker) {
        var t = kr(e) ? "checked" : "value";
        e._valueTracker = Sm(
          e,
          t,
          "" + e[t]
        );
      }
    }
    function Em(e) {
      if (!e) return !1;
      var t = e._valueTracker;
      if (!t) return !0;
      var n = t.getValue(), i = "";
      return e && (i = kr(e) ? e.checked ? "true" : "false" : e.value), e = i, e !== n ? (t.setValue(e), !0) : !1;
    }
    function ga(e) {
      if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    function ht(e) {
      return e.replace(
        qh,
        function(t) {
          return "\\" + t.charCodeAt(0).toString(16) + " ";
        }
      );
    }
    function Wl(e, t) {
      t.checked === void 0 || t.defaultChecked === void 0 || $g || (console.error(
        "%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://react.dev/link/controlled-components",
        On() || "A component",
        t.type
      ), $g = !0), t.value === void 0 || t.defaultValue === void 0 || Ay || (console.error(
        "%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://react.dev/link/controlled-components",
        On() || "A component",
        t.type
      ), Ay = !0);
    }
    function bi(e, t, n, i, o, s, d, h) {
      e.name = "", d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" ? (dt(d, "type"), e.type = d) : e.removeAttribute("type"), t != null ? d === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Dn(t)) : e.value !== "" + Dn(t) && (e.value = "" + Dn(t)) : d !== "submit" && d !== "reset" || e.removeAttribute("value"), t != null ? Tm(e, d, Dn(t)) : n != null ? Tm(e, d, Dn(n)) : i != null && e.removeAttribute("value"), o == null && s != null && (e.defaultChecked = !!s), o != null && (e.checked = o && typeof o != "function" && typeof o != "symbol"), h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" ? (dt(h, "name"), e.name = "" + Dn(h)) : e.removeAttribute("name");
    }
    function Fr(e, t, n, i, o, s, d, h) {
      if (s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" && (dt(s, "type"), e.type = s), t != null || n != null) {
        if (!(s !== "submit" && s !== "reset" || t != null)) {
          Wr(e);
          return;
        }
        n = n != null ? "" + Dn(n) : "", t = t != null ? "" + Dn(t) : n, h || t === e.value || (e.value = t), e.defaultValue = t;
      }
      i = i ?? o, i = typeof i != "function" && typeof i != "symbol" && !!i, e.checked = h ? e.checked : !!i, e.defaultChecked = !!i, d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" && (dt(d, "name"), e.name = d), Wr(e);
    }
    function Tm(e, t, n) {
      t === "number" && ga(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
    }
    function O0(e, t) {
      t.value == null && (typeof t.children == "object" && t.children !== null ? hr.Children.forEach(t.children, function(n) {
        n == null || typeof n == "string" || typeof n == "number" || typeof n == "bigint" || l || (l = !0, console.error(
          "Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>."
        ));
      }) : t.dangerouslySetInnerHTML == null || a || (a = !0, console.error(
        "Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected."
      ))), t.selected == null || Sr || (console.error(
        "Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>."
      ), Sr = !0);
    }
    function Am() {
      var e = On();
      return e ? `

Check the render method of \`` + e + "`." : "";
    }
    function $a(e, t, n, i) {
      if (e = e.options, t) {
        t = {};
        for (var o = 0; o < n.length; o++)
          t["$" + n[o]] = !0;
        for (n = 0; n < e.length; n++)
          o = t.hasOwnProperty("$" + e[n].value), e[n].selected !== o && (e[n].selected = o), o && i && (e[n].defaultSelected = !0);
      } else {
        for (n = "" + Dn(n), t = null, o = 0; o < e.length; o++) {
          if (e[o].value === n) {
            e[o].selected = !0, i && (e[o].defaultSelected = !0);
            return;
          }
          t !== null || e[o].disabled || (t = e[o]);
        }
        t !== null && (t.selected = !0);
      }
    }
    function Ir(e, t) {
      for (e = 0; e < c.length; e++) {
        var n = c[e];
        if (t[n] != null) {
          var i = il(t[n]);
          t.multiple && !i ? console.error(
            "The `%s` prop supplied to <select> must be an array if `multiple` is true.%s",
            n,
            Am()
          ) : !t.multiple && i && console.error(
            "The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.%s",
            n,
            Am()
          );
        }
      }
      t.value === void 0 || t.defaultValue === void 0 || u || (console.error(
        "Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://react.dev/link/controlled-components"
      ), u = !0);
    }
    function rc(e, t) {
      t.value === void 0 || t.defaultValue === void 0 || f || (console.error(
        "%s contains a textarea with both value and defaultValue props. Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://react.dev/link/controlled-components",
        On() || "A component"
      ), f = !0), t.children != null && t.value == null && console.error(
        "Use the `defaultValue` or `value` props instead of setting children on <textarea>."
      );
    }
    function dc(e, t, n) {
      if (t != null && (t = "" + Dn(t), t !== e.value && (e.value = t), n == null)) {
        e.defaultValue !== t && (e.defaultValue = t);
        return;
      }
      e.defaultValue = n != null ? "" + Dn(n) : "";
    }
    function Ao(e, t, n, i) {
      if (t == null) {
        if (i != null) {
          if (n != null)
            throw Error(
              "If you supply `defaultValue` on a <textarea>, do not pass children."
            );
          if (il(i)) {
            if (1 < i.length)
              throw Error("<textarea> can only have at most one child.");
            i = i[0];
          }
          n = i;
        }
        n == null && (n = ""), t = n;
      }
      n = Dn(t), e.defaultValue = n, i = e.textContent, i === n && i !== "" && i !== null && (e.value = i), Wr(e);
    }
    function hc(e, t) {
      return e.serverProps === void 0 && e.serverTail.length === 0 && e.children.length === 1 && 3 < e.distanceFromLeaf && e.distanceFromLeaf > 15 - t ? hc(e.children[0], t) : e;
    }
    function ct(e) {
      return "  " + "  ".repeat(e);
    }
    function mc(e) {
      return "+ " + "  ".repeat(e);
    }
    function Si(e) {
      return "- " + "  ".repeat(e);
    }
    function Ei(e) {
      switch (e.tag) {
        case 26:
        case 27:
        case 5:
          return e.type;
        case 16:
          return "Lazy";
        case 31:
          return "Activity";
        case 13:
          return "Suspense";
        case 19:
          return "SuspenseList";
        case 0:
        case 15:
          return e = e.type, e.displayName || e.name || null;
        case 11:
          return e = e.type.render, e.displayName || e.name || null;
        case 1:
          return e = e.type, e.displayName || e.name || null;
        default:
          return null;
      }
    }
    function ka(e, t) {
      return r.test(e) ? (e = JSON.stringify(e), e.length > t - 2 ? 8 > t ? '{"..."}' : "{" + e.slice(0, t - 7) + '..."}' : "{" + e + "}") : e.length > t ? 5 > t ? '{"..."}' : e.slice(0, t - 3) + "..." : e;
    }
    function Pr(e, t, n) {
      var i = 120 - 2 * n;
      if (t === null)
        return mc(n) + ka(e, i) + `
`;
      if (typeof t == "string") {
        for (var o = 0; o < t.length && o < e.length && t.charCodeAt(o) === e.charCodeAt(o); o++) ;
        return o > i - 8 && 10 < o && (e = "..." + e.slice(o - 8), t = "..." + t.slice(o - 8)), mc(n) + ka(e, i) + `
` + Si(n) + ka(t, i) + `
`;
      }
      return ct(n) + ka(e, i) + `
`;
    }
    function ed(e) {
      return Object.prototype.toString.call(e).replace(/^\[object (.*)\]$/, function(t, n) {
        return n;
      });
    }
    function zo(e, t) {
      switch (typeof e) {
        case "string":
          return e = JSON.stringify(e), e.length > t ? 5 > t ? '"..."' : e.slice(0, t - 4) + '..."' : e;
        case "object":
          if (e === null) return "null";
          if (il(e)) return "[...]";
          if (e.$$typeof === fa)
            return (t = me(e.type)) ? "<" + t + ">" : "<...>";
          var n = ed(e);
          if (n === "Object") {
            n = "", t -= 2;
            for (var i in e)
              if (e.hasOwnProperty(i)) {
                var o = JSON.stringify(i);
                if (o !== '"' + i + '"' && (i = o), t -= i.length - 2, o = zo(
                  e[i],
                  15 > t ? t : 15
                ), t -= o.length, 0 > t) {
                  n += n === "" ? "..." : ", ...";
                  break;
                }
                n += (n === "" ? "" : ",") + i + ":" + o;
              }
            return "{" + n + "}";
          }
          return n;
        case "function":
          return (t = e.displayName || e.name) ? "function " + t : "function";
        default:
          return String(e);
      }
    }
    function Oo(e, t) {
      return typeof e != "string" || r.test(e) ? "{" + zo(e, t - 2) + "}" : e.length > t - 2 ? 5 > t ? '"..."' : '"' + e.slice(0, t - 5) + '..."' : '"' + e + '"';
    }
    function Do(e, t, n) {
      var i = 120 - n.length - e.length, o = [], s;
      for (s in t)
        if (t.hasOwnProperty(s) && s !== "children") {
          var d = Oo(
            t[s],
            120 - n.length - s.length - 1
          );
          i -= s.length + d.length + 2, o.push(s + "=" + d);
        }
      return o.length === 0 ? n + "<" + e + `>
` : 0 < i ? n + "<" + e + " " + o.join(" ") + `>
` : n + "<" + e + `
` + n + "  " + o.join(`
` + n + "  ") + `
` + n + `>
`;
    }
    function td(e, t, n) {
      var i = "", o = Be({}, t), s;
      for (s in e)
        if (e.hasOwnProperty(s)) {
          delete o[s];
          var d = 120 - 2 * n - s.length - 2, h = zo(e[s], d);
          t.hasOwnProperty(s) ? (d = zo(t[s], d), i += mc(n) + s + ": " + h + `
`, i += Si(n) + s + ": " + d + `
`) : i += mc(n) + s + ": " + h + `
`;
        }
      for (var v in o)
        o.hasOwnProperty(v) && (e = zo(
          o[v],
          120 - 2 * n - v.length - 2
        ), i += Si(n) + v + ": " + e + `
`);
      return i;
    }
    function Gu(e, t, n, i) {
      var o = "", s = /* @__PURE__ */ new Map();
      for (S in n)
        n.hasOwnProperty(S) && s.set(
          S.toLowerCase(),
          S
        );
      if (s.size === 1 && s.has("children"))
        o += Do(
          e,
          t,
          ct(i)
        );
      else {
        for (var d in t)
          if (t.hasOwnProperty(d) && d !== "children") {
            var h = 120 - 2 * (i + 1) - d.length - 1, v = s.get(d.toLowerCase());
            if (v !== void 0) {
              s.delete(d.toLowerCase());
              var S = t[d];
              v = n[v];
              var _ = Oo(
                S,
                h
              );
              h = Oo(
                v,
                h
              ), typeof S == "object" && S !== null && typeof v == "object" && v !== null && ed(S) === "Object" && ed(v) === "Object" && (2 < Object.keys(S).length || 2 < Object.keys(v).length || -1 < _.indexOf("...") || -1 < h.indexOf("...")) ? o += ct(i + 1) + d + `={{
` + td(
                S,
                v,
                i + 2
              ) + ct(i + 1) + `}}
` : (o += mc(i + 1) + d + "=" + _ + `
`, o += Si(i + 1) + d + "=" + h + `
`);
            } else
              o += ct(i + 1) + d + "=" + Oo(t[d], h) + `
`;
          }
        s.forEach(function(M) {
          if (M !== "children") {
            var A = 120 - 2 * (i + 1) - M.length - 1;
            o += Si(i + 1) + M + "=" + Oo(n[M], A) + `
`;
          }
        }), o = o === "" ? ct(i) + "<" + e + `>
` : ct(i) + "<" + e + `
` + o + ct(i) + `>
`;
      }
      return e = n.children, t = t.children, typeof e == "string" || typeof e == "number" || typeof e == "bigint" ? (s = "", (typeof t == "string" || typeof t == "number" || typeof t == "bigint") && (s = "" + t), o += Pr(s, "" + e, i + 1)) : (typeof t == "string" || typeof t == "number" || typeof t == "bigint") && (o = e == null ? o + Pr("" + t, null, i + 1) : o + Pr("" + t, void 0, i + 1)), o;
    }
    function _n(e, t) {
      var n = Ei(e);
      if (n === null) {
        for (n = "", e = e.child; e; )
          n += _n(e, t), e = e.sibling;
        return n;
      }
      return ct(t) + "<" + n + `>
`;
    }
    function ld(e, t) {
      var n = hc(e, t);
      if (n !== e && (e.children.length !== 1 || e.children[0] !== n))
        return ct(t) + `...
` + ld(n, t + 1);
      n = "";
      var i = e.fiber._debugInfo;
      if (i)
        for (var o = 0; o < i.length; o++) {
          var s = i[o].name;
          typeof s == "string" && (n += ct(t) + "<" + s + `>
`, t++);
        }
      if (i = "", o = e.fiber.pendingProps, e.fiber.tag === 6)
        i = Pr(o, e.serverProps, t), t++;
      else if (s = Ei(e.fiber), s !== null)
        if (e.serverProps === void 0) {
          i = t;
          var d = 120 - 2 * i - s.length - 2, h = "";
          for (S in o)
            if (o.hasOwnProperty(S) && S !== "children") {
              var v = Oo(o[S], 15);
              if (d -= S.length + v.length + 2, 0 > d) {
                h += " ...";
                break;
              }
              h += " " + S + "=" + v;
            }
          i = ct(i) + "<" + s + h + `>
`, t++;
        } else
          e.serverProps === null ? (i = Do(
            s,
            o,
            mc(t)
          ), t++) : typeof e.serverProps == "string" ? console.error(
            "Should not have matched a non HostText fiber to a Text node. This is a bug in React."
          ) : (i = Gu(
            s,
            o,
            e.serverProps,
            t
          ), t++);
      var S = "";
      for (o = e.fiber.child, s = 0; o && s < e.children.length; )
        d = e.children[s], d.fiber === o ? (S += ld(d, t), s++) : S += _n(o, t), o = o.sibling;
      for (o && 0 < e.children.length && (S += ct(t) + `...
`), o = e.serverTail, e.serverProps === null && t--, e = 0; e < o.length; e++)
        s = o[e], S = typeof s == "string" ? S + (Si(t) + ka(s, 120 - 2 * t) + `
`) : S + Do(
          s.type,
          s.props,
          Si(t)
        );
      return n + i + S;
    }
    function zm(e) {
      try {
        return `

` + ld(e, 0);
      } catch {
        return "";
      }
    }
    function nd(e, t, n) {
      for (var i = t, o = null, s = 0; i; )
        i === e && (s = 0), o = {
          fiber: i,
          children: o !== null ? [o] : [],
          serverProps: i === t ? n : i === e ? null : void 0,
          serverTail: [],
          distanceFromLeaf: s
        }, s++, i = i.return;
      return o !== null ? zm(o).replaceAll(/^[+-]/gm, ">") : "";
    }
    function Om(e, t) {
      var n = Be({}, e || L), i = { tag: t };
      return E.indexOf(t) !== -1 && (n.aTagInScope = null, n.buttonTagInScope = null, n.nobrTagInScope = null), O.indexOf(t) !== -1 && (n.pTagInButtonScope = null), p.indexOf(t) !== -1 && t !== "address" && t !== "div" && t !== "p" && (n.listItemTagAutoclosing = null, n.dlItemTagAutoclosing = null), n.current = i, t === "form" && (n.formTag = i), t === "a" && (n.aTagInScope = i), t === "button" && (n.buttonTagInScope = i), t === "nobr" && (n.nobrTagInScope = i), t === "p" && (n.pTagInButtonScope = i), t === "li" && (n.listItemTagAutoclosing = i), (t === "dd" || t === "dt") && (n.dlItemTagAutoclosing = i), t === "#document" || t === "html" ? n.containerTagInScope = null : n.containerTagInScope || (n.containerTagInScope = i), e !== null || t !== "#document" && t !== "html" && t !== "body" ? n.implicitRootScope === !0 && (n.implicitRootScope = !1) : n.implicitRootScope = !0, n;
    }
    function uf(e, t, n) {
      switch (t) {
        case "select":
          return e === "hr" || e === "option" || e === "optgroup" || e === "script" || e === "template" || e === "#text";
        case "optgroup":
          return e === "option" || e === "#text";
        case "option":
          return e === "#text";
        case "tr":
          return e === "th" || e === "td" || e === "style" || e === "script" || e === "template";
        case "tbody":
        case "thead":
        case "tfoot":
          return e === "tr" || e === "style" || e === "script" || e === "template";
        case "colgroup":
          return e === "col" || e === "template";
        case "table":
          return e === "caption" || e === "colgroup" || e === "tbody" || e === "tfoot" || e === "thead" || e === "style" || e === "script" || e === "template";
        case "head":
          return e === "base" || e === "basefont" || e === "bgsound" || e === "link" || e === "meta" || e === "title" || e === "noscript" || e === "noframes" || e === "style" || e === "script" || e === "template";
        case "html":
          if (n) break;
          return e === "head" || e === "body" || e === "frameset";
        case "frameset":
          return e === "frame";
        case "#document":
          if (!n) return e === "html";
      }
      switch (e) {
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          return t !== "h1" && t !== "h2" && t !== "h3" && t !== "h4" && t !== "h5" && t !== "h6";
        case "rp":
        case "rt":
          return H.indexOf(t) === -1;
        case "caption":
        case "col":
        case "colgroup":
        case "frameset":
        case "frame":
        case "tbody":
        case "td":
        case "tfoot":
        case "th":
        case "thead":
        case "tr":
          return t == null;
        case "head":
          return n || t === null;
        case "html":
          return n && t === "#document" || t === null;
        case "body":
          return n && (t === "#document" || t === "html") || t === null;
      }
      return !0;
    }
    function i1(e, t) {
      switch (e) {
        case "address":
        case "article":
        case "aside":
        case "blockquote":
        case "center":
        case "details":
        case "dialog":
        case "dir":
        case "div":
        case "dl":
        case "fieldset":
        case "figcaption":
        case "figure":
        case "footer":
        case "header":
        case "hgroup":
        case "main":
        case "menu":
        case "nav":
        case "ol":
        case "p":
        case "section":
        case "summary":
        case "ul":
        case "pre":
        case "listing":
        case "table":
        case "hr":
        case "xmp":
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          return t.pTagInButtonScope;
        case "form":
          return t.formTag || t.pTagInButtonScope;
        case "li":
          return t.listItemTagAutoclosing;
        case "dd":
        case "dt":
          return t.dlItemTagAutoclosing;
        case "button":
          return t.buttonTagInScope;
        case "a":
          return t.aTagInScope;
        case "nobr":
          return t.nobrTagInScope;
      }
      return null;
    }
    function Rn(e, t) {
      for (; e; ) {
        switch (e.tag) {
          case 5:
          case 26:
          case 27:
            if (e.type === t) return e;
        }
        e = e.return;
      }
      return null;
    }
    function cf(e, t) {
      t = t || L;
      var n = t.current;
      if (t = (n = uf(
        e,
        n && n.tag,
        t.implicitRootScope
      ) ? null : n) ? null : i1(e, t), t = n || t, !t) return !0;
      var i = t.tag;
      if (t = String(!!n) + "|" + e + "|" + i, J[t]) return !1;
      J[t] = !0;
      var o = (t = An) ? Rn(t.return, i) : null, s = t !== null && o !== null ? nd(o, t, null) : "", d = "<" + e + ">";
      return n ? (n = "", i === "table" && e === "tr" && (n += " Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by the browser."), console.error(
        `In HTML, %s cannot be a child of <%s>.%s
This will cause a hydration error.%s`,
        d,
        i,
        n,
        s
      )) : console.error(
        `In HTML, %s cannot be a descendant of <%s>.
This will cause a hydration error.%s`,
        d,
        i,
        s
      ), t && (e = t.return, o === null || e === null || o === e && e._debugOwner === t._debugOwner || le(o, function() {
        console.error(
          `<%s> cannot contain a nested %s.
See this log for the ancestor stack trace.`,
          i,
          d
        );
      })), !1;
    }
    function of(e, t, n) {
      if (n || uf("#text", t, !1))
        return !0;
      if (n = "#text|" + t, J[n]) return !1;
      J[n] = !0;
      var i = (n = An) ? Rn(n, t) : null;
      return n = n !== null && i !== null ? nd(
        i,
        n,
        n.tag !== 6 ? { children: null } : null
      ) : "", /\S/.test(e) ? console.error(
        `In HTML, text nodes cannot be a child of <%s>.
This will cause a hydration error.%s`,
        t,
        n
      ) : console.error(
        `In HTML, whitespace text nodes cannot be a child of <%s>. Make sure you don't have any extra whitespace between tags on each line of your source code.
This will cause a hydration error.%s`,
        t,
        n
      ), !1;
    }
    function pc(e, t) {
      if (t) {
        var n = e.firstChild;
        if (n && n === e.lastChild && n.nodeType === 3) {
          n.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }
    function _o(e) {
      return e.replace(U, function(t, n) {
        return n.toUpperCase();
      });
    }
    function Dm(e, t, n) {
      var i = t.indexOf("--") === 0;
      i || (-1 < t.indexOf("-") ? N.hasOwnProperty(t) && N[t] || (N[t] = !0, console.error(
        "Unsupported style property %s. Did you mean %s?",
        t,
        _o(t.replace(gt, "ms-"))
      )) : ge.test(t) ? N.hasOwnProperty(t) && N[t] || (N[t] = !0, console.error(
        "Unsupported vendor-prefixed style property %s. Did you mean %s?",
        t,
        t.charAt(0).toUpperCase() + t.slice(1)
      )) : !R.test(n) || Z.hasOwnProperty(n) && Z[n] || (Z[n] = !0, console.error(
        `Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`,
        t,
        n.replace(R, "")
      )), typeof n == "number" && (isNaN(n) ? de || (de = !0, console.error(
        "`NaN` is an invalid value for the `%s` css style property.",
        t
      )) : isFinite(n) || Fe || (Fe = !0, console.error(
        "`Infinity` is an invalid value for the `%s` css style property.",
        t
      )))), n == null || typeof n == "boolean" || n === "" ? i ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : i ? e.setProperty(t, n) : typeof n != "number" || n === 0 || ce.has(t) ? t === "float" ? e.cssFloat = n : (pm(n, t), e[t] = ("" + n).trim()) : e[t] = n + "px";
    }
    function _m(e, t, n) {
      if (t != null && typeof t != "object")
        throw Error(
          "The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX."
        );
      if (t && Object.freeze(t), e = e.style, n != null) {
        if (t) {
          var i = {};
          if (n) {
            for (var o in n)
              if (n.hasOwnProperty(o) && !t.hasOwnProperty(o))
                for (var s = B[o] || [o], d = 0; d < s.length; d++)
                  i[s[d]] = o;
          }
          for (var h in t)
            if (t.hasOwnProperty(h) && (!n || n[h] !== t[h]))
              for (o = B[h] || [h], s = 0; s < o.length; s++)
                i[o[s]] = h;
          h = {};
          for (var v in t)
            for (o = B[v] || [v], s = 0; s < o.length; s++)
              h[o[s]] = v;
          v = {};
          for (var S in i)
            if (o = i[S], (s = h[S]) && o !== s && (d = o + "," + s, !v[d])) {
              v[d] = !0, d = console;
              var _ = t[o];
              d.error.call(
                d,
                "%s a style property during rerender (%s) when a conflicting property is set (%s) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, replace the shorthand with separate values.",
                _ == null || typeof _ == "boolean" || _ === "" ? "Removing" : "Updating",
                o,
                s
              );
            }
        }
        for (var M in n)
          !n.hasOwnProperty(M) || t != null && t.hasOwnProperty(M) || (M.indexOf("--") === 0 ? e.setProperty(M, "") : M === "float" ? e.cssFloat = "" : e[M] = "");
        for (var A in t)
          S = t[A], t.hasOwnProperty(A) && n[A] !== S && Dm(e, A, S);
      } else
        for (i in t)
          t.hasOwnProperty(i) && Dm(e, i, t[i]);
    }
    function Wa(e) {
      if (e.indexOf("-") === -1) return !1;
      switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return !1;
        default:
          return !0;
      }
    }
    function D0(e) {
      return tt.get(e) || e;
    }
    function _0(e, t) {
      if (Vn.call(jh, t) && jh[t])
        return !0;
      if (wE.test(t)) {
        if (e = "aria-" + t.slice(4).toLowerCase(), e = kg.hasOwnProperty(e) ? e : null, e == null)
          return console.error(
            "Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.",
            t
          ), jh[t] = !0;
        if (t !== e)
          return console.error(
            "Invalid ARIA attribute `%s`. Did you mean `%s`?",
            t,
            e
          ), jh[t] = !0;
      }
      if (jE.test(t)) {
        if (e = t.toLowerCase(), e = kg.hasOwnProperty(e) ? e : null, e == null) return jh[t] = !0, !1;
        t !== e && (console.error(
          "Unknown ARIA attribute `%s`. Did you mean `%s`?",
          t,
          e
        ), jh[t] = !0);
      }
      return !0;
    }
    function R0(e, t) {
      var n = [], i;
      for (i in t)
        _0(e, i) || n.push(i);
      t = n.map(function(o) {
        return "`" + o + "`";
      }).join(", "), n.length === 1 ? console.error(
        "Invalid aria prop %s on <%s> tag. For details, see https://react.dev/link/invalid-aria-props",
        t,
        e
      ) : 1 < n.length && console.error(
        "Invalid aria props %s on <%s> tag. For details, see https://react.dev/link/invalid-aria-props",
        t,
        e
      );
    }
    function Rm(e, t, n, i) {
      if (Vn.call(Qn, t) && Qn[t])
        return !0;
      var o = t.toLowerCase();
      if (o === "onfocusin" || o === "onfocusout")
        return console.error(
          "React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React."
        ), Qn[t] = !0;
      if (typeof n == "function" && (e === "form" && t === "action" || e === "input" && t === "formAction" || e === "button" && t === "formAction"))
        return !0;
      if (i != null) {
        if (e = i.possibleRegistrationNames, i.registrationNameDependencies.hasOwnProperty(t))
          return !0;
        if (i = e.hasOwnProperty(o) ? e[o] : null, i != null)
          return console.error(
            "Invalid event handler property `%s`. Did you mean `%s`?",
            t,
            i
          ), Qn[t] = !0;
        if (kb.test(t))
          return console.error(
            "Unknown event handler property `%s`. It will be ignored.",
            t
          ), Qn[t] = !0;
      } else if (kb.test(t))
        return YE.test(t) && console.error(
          "Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.",
          t
        ), Qn[t] = !0;
      if (GE.test(t) || XE.test(t)) return !0;
      if (o === "innerhtml")
        return console.error(
          "Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`."
        ), Qn[t] = !0;
      if (o === "aria")
        return console.error(
          "The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead."
        ), Qn[t] = !0;
      if (o === "is" && n !== null && n !== void 0 && typeof n != "string")
        return console.error(
          "Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.",
          typeof n
        ), Qn[t] = !0;
      if (typeof n == "number" && isNaN(n))
        return console.error(
          "Received NaN for the `%s` attribute. If this is expected, cast the value to a string.",
          t
        ), Qn[t] = !0;
      if (Ga.hasOwnProperty(o)) {
        if (o = Ga[o], o !== t)
          return console.error(
            "Invalid DOM property `%s`. Did you mean `%s`?",
            t,
            o
          ), Qn[t] = !0;
      } else if (t !== o)
        return console.error(
          "React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.",
          t,
          o
        ), Qn[t] = !0;
      switch (t) {
        case "dangerouslySetInnerHTML":
        case "children":
        case "style":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
          return !0;
        case "innerText":
        case "textContent":
          return !0;
      }
      switch (typeof n) {
        case "boolean":
          switch (t) {
            case "autoFocus":
            case "checked":
            case "multiple":
            case "muted":
            case "selected":
            case "contentEditable":
            case "spellCheck":
            case "draggable":
            case "value":
            case "autoReverse":
            case "externalResourcesRequired":
            case "focusable":
            case "preserveAlpha":
            case "allowFullScreen":
            case "async":
            case "autoPlay":
            case "controls":
            case "default":
            case "defer":
            case "disabled":
            case "disablePictureInPicture":
            case "disableRemotePlayback":
            case "formNoValidate":
            case "hidden":
            case "loop":
            case "noModule":
            case "noValidate":
            case "open":
            case "playsInline":
            case "readOnly":
            case "required":
            case "reversed":
            case "scoped":
            case "seamless":
            case "itemScope":
            case "capture":
            case "download":
            case "inert":
              return !0;
            default:
              return o = t.toLowerCase().slice(0, 5), o === "data-" || o === "aria-" ? !0 : (n ? console.error(
                'Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.',
                n,
                t,
                t,
                n,
                t
              ) : console.error(
                'Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.',
                n,
                t,
                t,
                n,
                t,
                t,
                t
              ), Qn[t] = !0);
          }
        case "function":
        case "symbol":
          return Qn[t] = !0, !1;
        case "string":
          if (n === "false" || n === "true") {
            switch (t) {
              case "checked":
              case "selected":
              case "multiple":
              case "muted":
              case "allowFullScreen":
              case "async":
              case "autoPlay":
              case "controls":
              case "default":
              case "defer":
              case "disabled":
              case "disablePictureInPicture":
              case "disableRemotePlayback":
              case "formNoValidate":
              case "hidden":
              case "loop":
              case "noModule":
              case "noValidate":
              case "open":
              case "playsInline":
              case "readOnly":
              case "required":
              case "reversed":
              case "scoped":
              case "seamless":
              case "itemScope":
              case "inert":
                break;
              default:
                return !0;
            }
            console.error(
              "Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?",
              n,
              t,
              n === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".',
              t,
              n
            ), Qn[t] = !0;
          }
      }
      return !0;
    }
    function c1(e, t, n) {
      var i = [], o;
      for (o in t)
        Rm(e, o, t[o], n) || i.push(o);
      t = i.map(function(s) {
        return "`" + s + "`";
      }).join(", "), i.length === 1 ? console.error(
        "Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://react.dev/link/attribute-behavior ",
        t,
        e
      ) : 1 < i.length && console.error(
        "Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://react.dev/link/attribute-behavior ",
        t,
        e
      );
    }
    function sf(e) {
      return LE.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
    }
    function Pn() {
    }
    function va(e) {
      return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
    }
    function ad(e) {
      var t = pa(e);
      if (t && (e = t.stateNode)) {
        var n = e[dn] || null;
        e: switch (e = t.stateNode, t.type) {
          case "input":
            if (bi(
              e,
              n.value,
              n.defaultValue,
              n.defaultValue,
              n.checked,
              n.defaultChecked,
              n.type,
              n.name
            ), t = n.name, n.type === "radio" && t != null) {
              for (n = e; n.parentNode; ) n = n.parentNode;
              for (dt(t, "name"), n = n.querySelectorAll(
                'input[name="' + ht(
                  "" + t
                ) + '"][type="radio"]'
              ), t = 0; t < n.length; t++) {
                var i = n[t];
                if (i !== e && i.form === e.form) {
                  var o = i[dn] || null;
                  if (!o)
                    throw Error(
                      "ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported."
                    );
                  bi(
                    i,
                    o.value,
                    o.defaultValue,
                    o.defaultValue,
                    o.checked,
                    o.defaultChecked,
                    o.type,
                    o.name
                  );
                }
              }
              for (t = 0; t < n.length; t++)
                i = n[t], i.form === e.form && Em(i);
            }
            break e;
          case "textarea":
            dc(e, n.value, n.defaultValue);
            break e;
          case "select":
            t = n.value, t != null && $a(e, !!n.multiple, t, !1);
        }
      }
    }
    function ud(e, t, n) {
      if (E1) return e(t, n);
      E1 = !0;
      try {
        var i = e(t);
        return i;
      } finally {
        if (E1 = !1, (wh !== null || Yh !== null) && (Gn(), wh && (t = wh, e = Yh, Yh = wh = null, ad(t), e)))
          for (t = 0; t < e.length; t++) ad(e[t]);
      }
    }
    function Fa(e, t) {
      var n = e.stateNode;
      if (n === null) return null;
      var i = n[dn] || null;
      if (i === null) return null;
      n = i[t];
      e: switch (t) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (i = !i.disabled) || (e = e.type, i = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !i;
          break e;
        default:
          e = !1;
      }
      if (e) return null;
      if (n && typeof n != "function")
        throw Error(
          "Expected `" + t + "` listener to be a function, instead got a value of `" + typeof n + "` type."
        );
      return n;
    }
    function yc() {
      if (Wg) return Wg;
      var e, t = A1, n = t.length, i, o = "value" in Cs ? Cs.value : Cs.textContent, s = o.length;
      for (e = 0; e < n && t[e] === o[e]; e++) ;
      var d = n - e;
      for (i = 1; i <= d && t[n - i] === o[s - i]; i++) ;
      return Wg = o.slice(e, 1 < i ? 1 - i : void 0);
    }
    function ff(e) {
      var t = e.keyCode;
      return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
    }
    function Ro() {
      return !0;
    }
    function Mm() {
      return !1;
    }
    function gl(e) {
      function t(n, i, o, s, d) {
        this._reactName = n, this._targetInst = o, this.type = i, this.nativeEvent = s, this.target = d, this.currentTarget = null;
        for (var h in e)
          e.hasOwnProperty(h) && (n = e[h], this[h] = n ? n(s) : s[h]);
        return this.isDefaultPrevented = (s.defaultPrevented != null ? s.defaultPrevented : s.returnValue === !1) ? Ro : Mm, this.isPropagationStopped = Mm, this;
      }
      return Be(t.prototype, {
        preventDefault: function() {
          this.defaultPrevented = !0;
          var n = this.nativeEvent;
          n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Ro);
        },
        stopPropagation: function() {
          var n = this.nativeEvent;
          n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Ro);
        },
        persist: function() {
        },
        isPersistent: Ro
      }), t;
    }
    function Xu(e) {
      var t = this.nativeEvent;
      return t.getModifierState ? t.getModifierState(e) : (e = tT[e]) ? !!t[e] : !1;
    }
    function rf() {
      return Xu;
    }
    function Mo(e, t) {
      switch (e) {
        case "keyup":
          return hT.indexOf(t.keyCode) !== -1;
        case "keydown":
          return t.keyCode !== Pb;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function Lu(e) {
      return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
    }
    function Cm(e, t) {
      switch (e) {
        case "compositionend":
          return Lu(t);
        case "keypress":
          return t.which !== tS ? null : (nS = !0, lS);
        case "textInput":
          return e = t.data, e === lS && nS ? null : e;
        default:
          return null;
      }
    }
    function id(e, t) {
      if (Gh)
        return e === "compositionend" || !_1 && Mo(e, t) ? (e = yc(), Wg = A1 = Cs = null, Gh = !1, e) : null;
      switch (e) {
        case "paste":
          return null;
        case "keypress":
          if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
            if (t.char && 1 < t.char.length)
              return t.char;
            if (t.which)
              return String.fromCharCode(t.which);
          }
          return null;
        case "compositionend":
          return eS && t.locale !== "ko" ? null : t.data;
        default:
          return null;
      }
    }
    function Um(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === "input" ? !!pT[e.type] : t === "textarea";
    }
    function cd(e) {
      if (!ec) return !1;
      e = "on" + e;
      var t = e in document;
      return t || (t = document.createElement("div"), t.setAttribute(e, "return;"), t = typeof t[e] == "function"), t;
    }
    function df(e, t, n, i) {
      wh ? Yh ? Yh.push(i) : Yh = [i] : wh = i, t = Ba(t, "onChange"), 0 < t.length && (n = new Fg(
        "onChange",
        "change",
        null,
        n,
        i
      ), e.push({ event: n, listeners: t }));
    }
    function M0(e) {
      ft(e, 0);
    }
    function Hl(e) {
      var t = vi(e);
      if (Em(t)) return e;
    }
    function Ti(e, t) {
      if (e === "change") return t;
    }
    function hf() {
      My && (My.detachEvent("onpropertychange", Co), Cy = My = null);
    }
    function Co(e) {
      if (e.propertyName === "value" && Hl(Cy)) {
        var t = [];
        df(
          t,
          Cy,
          e,
          va(e)
        ), ud(M0, t);
      }
    }
    function o1(e, t, n) {
      e === "focusin" ? (hf(), My = t, Cy = n, My.attachEvent("onpropertychange", Co)) : e === "focusout" && hf();
    }
    function xm(e) {
      if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return Hl(Cy);
    }
    function Nm(e, t) {
      if (e === "click") return Hl(t);
    }
    function mf(e, t) {
      if (e === "input" || e === "change")
        return Hl(t);
    }
    function od(e, t) {
      return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
    }
    function Uo(e, t) {
      if (Zn(e, t)) return !0;
      if (typeof e != "object" || e === null || typeof t != "object" || t === null)
        return !1;
      var n = Object.keys(e), i = Object.keys(t);
      if (n.length !== i.length) return !1;
      for (i = 0; i < n.length; i++) {
        var o = n[i];
        if (!Vn.call(t, o) || !Zn(e[o], t[o]))
          return !1;
      }
      return !0;
    }
    function C0(e) {
      for (; e && e.firstChild; ) e = e.firstChild;
      return e;
    }
    function U0(e, t) {
      var n = C0(e);
      e = 0;
      for (var i; n; ) {
        if (n.nodeType === 3) {
          if (i = e + n.textContent.length, e <= t && i >= t)
            return { node: n, offset: t - e };
          e = i;
        }
        e: {
          for (; n; ) {
            if (n.nextSibling) {
              n = n.nextSibling;
              break e;
            }
            n = n.parentNode;
          }
          n = void 0;
        }
        n = C0(n);
      }
    }
    function x0(e, t) {
      return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? x0(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
    }
    function sd(e) {
      e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
      for (var t = ga(e.document); t instanceof e.HTMLIFrameElement; ) {
        try {
          var n = typeof t.contentWindow.location.href == "string";
        } catch {
          n = !1;
        }
        if (n) e = t.contentWindow;
        else break;
        t = ga(e.document);
      }
      return t;
    }
    function Hm(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
    }
    function N0(e, t, n) {
      var i = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
      M1 || Xh == null || Xh !== ga(i) || (i = Xh, "selectionStart" in i && Hm(i) ? i = { start: i.selectionStart, end: i.selectionEnd } : (i = (i.ownerDocument && i.ownerDocument.defaultView || window).getSelection(), i = {
        anchorNode: i.anchorNode,
        anchorOffset: i.anchorOffset,
        focusNode: i.focusNode,
        focusOffset: i.focusOffset
      }), Uy && Uo(Uy, i) || (Uy = i, i = Ba(R1, "onSelect"), 0 < i.length && (t = new Fg(
        "onSelect",
        "select",
        null,
        t,
        n
      ), e.push({ event: t, listeners: i }), t.target = Xh)));
    }
    function gc(e, t) {
      var n = {};
      return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
    }
    function vc(e) {
      if (C1[e]) return C1[e];
      if (!Lh[e]) return e;
      var t = Lh[e], n;
      for (n in t)
        if (t.hasOwnProperty(n) && n in uS)
          return C1[e] = t[n];
      return e;
    }
    function ba(e, t) {
      fS.set(e, t), ya(t, [e]);
    }
    function H0(e) {
      for (var t = Pg, n = 0; n < e.length; n++) {
        var i = e[n];
        if (typeof i == "object" && i !== null)
          if (il(i) && i.length === 2 && typeof i[0] == "string") {
            if (t !== Pg && t !== B1)
              return N1;
            t = B1;
          } else return N1;
        else {
          if (typeof i == "function" || typeof i == "string" && 50 < i.length || t !== Pg && t !== H1)
            return N1;
          t = H1;
        }
      }
      return t;
    }
    function Bm(e, t, n, i) {
      for (var o in e)
        Vn.call(e, o) && o[0] !== "_" && Ia(o, e[o], t, n, i);
    }
    function Ia(e, t, n, i, o) {
      switch (typeof t) {
        case "object":
          if (t === null) {
            t = "null";
            break;
          } else {
            if (t.$$typeof === fa) {
              var s = me(t.type) || "…", d = t.key;
              t = t.props;
              var h = Object.keys(t), v = h.length;
              if (d == null && v === 0) {
                t = "<" + s + " />";
                break;
              }
              if (3 > i || v === 1 && h[0] === "children" && d == null) {
                t = "<" + s + " … />";
                break;
              }
              n.push([
                o + "  ".repeat(i) + e,
                "<" + s
              ]), d !== null && Ia(
                "key",
                d,
                n,
                i + 1,
                o
              ), e = !1;
              for (var S in t)
                S === "children" ? t.children != null && (!il(t.children) || 0 < t.children.length) && (e = !0) : Vn.call(t, S) && S[0] !== "_" && Ia(
                  S,
                  t[S],
                  n,
                  i + 1,
                  o
                );
              n.push([
                "",
                e ? ">…</" + s + ">" : "/>"
              ]);
              return;
            }
            if (s = Object.prototype.toString.call(t), s = s.slice(8, s.length - 1), s === "Array") {
              if (S = H0(t), S === H1 || S === Pg) {
                t = JSON.stringify(t);
                break;
              } else if (S === B1) {
                for (n.push([
                  o + "  ".repeat(i) + e,
                  ""
                ]), e = 0; e < t.length; e++)
                  s = t[e], Ia(
                    s[0],
                    s[1],
                    n,
                    i + 1,
                    o
                  );
                return;
              }
            }
            if (s === "Promise") {
              if (t.status === "fulfilled") {
                if (s = n.length, Ia(
                  e,
                  t.value,
                  n,
                  i,
                  o
                ), n.length > s) {
                  n = n[s], n[1] = "Promise<" + (n[1] || "Object") + ">";
                  return;
                }
              } else if (t.status === "rejected" && (s = n.length, Ia(
                e,
                t.reason,
                n,
                i,
                o
              ), n.length > s)) {
                n = n[s], n[1] = "Rejected Promise<" + n[1] + ">";
                return;
              }
              n.push([
                "  ".repeat(i) + e,
                "Promise"
              ]);
              return;
            }
            s === "Object" && (S = Object.getPrototypeOf(t)) && typeof S.constructor == "function" && (s = S.constructor.name), n.push([
              o + "  ".repeat(i) + e,
              s === "Object" ? 3 > i ? "" : "…" : s
            ]), 3 > i && Bm(t, n, i + 1, o);
            return;
          }
        case "function":
          t = t.name === "" ? "() => {}" : t.name + "() {}";
          break;
        case "string":
          t = t === TT ? "…" : JSON.stringify(t);
          break;
        case "undefined":
          t = "undefined";
          break;
        case "boolean":
          t = t ? "true" : "false";
          break;
        default:
          t = String(t);
      }
      n.push([
        o + "  ".repeat(i) + e,
        t
      ]);
    }
    function B0(e, t, n, i) {
      var o = !0;
      for (d in e)
        d in t || (n.push([
          ev + "  ".repeat(i) + d,
          "…"
        ]), o = !1);
      for (var s in t)
        if (s in e) {
          var d = e[s], h = t[s];
          if (d !== h) {
            if (i === 0 && s === "children")
              o = "  ".repeat(i) + s, n.push(
                [ev + o, "…"],
                [tv + o, "…"]
              );
            else {
              if (!(3 <= i)) {
                if (typeof d == "object" && typeof h == "object" && d !== null && h !== null && d.$$typeof === h.$$typeof)
                  if (h.$$typeof === fa) {
                    if (d.type === h.type && d.key === h.key) {
                      d = me(h.type) || "…", o = "  ".repeat(i) + s, d = "<" + d + " … />", n.push(
                        [ev + o, d],
                        [tv + o, d]
                      ), o = !1;
                      continue;
                    }
                  } else {
                    var v = Object.prototype.toString.call(d), S = Object.prototype.toString.call(h);
                    if (v === S && (S === "[object Object]" || S === "[object Array]")) {
                      v = [
                        hS + "  ".repeat(i) + s,
                        S === "[object Array]" ? "Array" : ""
                      ], n.push(v), S = n.length, B0(
                        d,
                        h,
                        n,
                        i + 1
                      ) ? S === n.length && (v[1] = "Referentially unequal but deeply equal objects. Consider memoization.") : o = !1;
                      continue;
                    }
                  }
                else if (typeof d == "function" && typeof h == "function" && d.name === h.name && d.length === h.length && (v = Function.prototype.toString.call(d), S = Function.prototype.toString.call(h), v === S)) {
                  d = h.name === "" ? "() => {}" : h.name + "() {}", n.push([
                    hS + "  ".repeat(i) + s,
                    d + " Referentially unequal function closure. Consider memoization."
                  ]);
                  continue;
                }
              }
              Ia(s, d, n, i, ev), Ia(s, h, n, i, tv);
            }
            o = !1;
          }
        } else
          n.push([
            tv + "  ".repeat(i) + s,
            "…"
          ]), o = !1;
      return o;
    }
    function Sa(e) {
      We = e & 63 ? "Blocking" : e & 64 ? "Gesture" : e & 4194176 ? "Transition" : e & 62914560 ? "Suspense" : e & 2080374784 ? "Idle" : "Other";
    }
    function ea(e, t, n, i) {
      Bt && (xs.start = t, xs.end = n, no.color = "warning", no.tooltipText = i, no.properties = null, (e = e._debugTask) ? e.run(
        performance.measure.bind(
          performance,
          i,
          xs
        )
      ) : performance.measure(i, xs));
    }
    function fd(e, t, n) {
      ea(e, t, n, "Reconnect");
    }
    function rd(e, t, n, i, o) {
      var s = ie(e);
      if (s !== null && Bt) {
        var d = e.alternate, h = e.actualDuration;
        if (d === null || d.child !== e.child)
          for (var v = e.child; v !== null; v = v.sibling)
            h -= v.actualDuration;
        i = 0.5 > h ? i ? "tertiary-light" : "primary-light" : 10 > h ? i ? "tertiary" : "primary" : 100 > h ? i ? "tertiary-dark" : "primary-dark" : "error";
        var S = e.memoizedProps;
        h = e._debugTask, S !== null && d !== null && d.memoizedProps !== S ? (v = [AT], S = B0(
          d.memoizedProps,
          S,
          v,
          0
        ), 1 < v.length && (S && !Us && (d.lanes & o) === 0 && 100 < e.actualDuration ? (Us = !0, v[0] = zT, no.color = "warning", no.tooltipText = mS) : (no.color = i, no.tooltipText = s), no.properties = v, xs.start = t, xs.end = n, h != null ? h.run(
          performance.measure.bind(
            performance,
            "​" + s,
            xs
          )
        ) : performance.measure(
          "​" + s,
          xs
        ))) : h != null ? h.run(
          console.timeStamp.bind(
            console,
            s,
            t,
            n,
            Ou,
            void 0,
            i
          )
        ) : console.timeStamp(
          s,
          t,
          n,
          Ou,
          void 0,
          i
        );
      }
    }
    function qm(e, t, n, i) {
      if (Bt) {
        var o = ie(e);
        if (o !== null) {
          for (var s = null, d = [], h = 0; h < i.length; h++) {
            var v = i[h];
            s == null && v.source !== null && (s = v.source._debugTask), v = v.value, d.push([
              "Error",
              typeof v == "object" && v !== null && typeof v.message == "string" ? String(v.message) : String(v)
            ]);
          }
          e.key !== null && Ia("key", e.key, d, 0, ""), e.memoizedProps !== null && Bm(e.memoizedProps, d, 0, ""), s == null && (s = e._debugTask), e = {
            start: t,
            end: n,
            detail: {
              devtools: {
                color: "error",
                track: Ou,
                tooltipText: e.tag === 13 ? "Hydration failed" : "Error boundary caught an error",
                properties: d
              }
            }
          }, s ? s.run(
            performance.measure.bind(performance, "​" + o, e)
          ) : performance.measure("​" + o, e);
        }
      }
    }
    function Ea(e, t, n, i, o) {
      if (o !== null) {
        if (Bt) {
          var s = ie(e);
          if (s !== null) {
            i = [];
            for (var d = 0; d < o.length; d++) {
              var h = o[d].value;
              i.push([
                "Error",
                typeof h == "object" && h !== null && typeof h.message == "string" ? String(h.message) : String(h)
              ]);
            }
            e.key !== null && Ia("key", e.key, i, 0, ""), e.memoizedProps !== null && Bm(e.memoizedProps, i, 0, ""), t = {
              start: t,
              end: n,
              detail: {
                devtools: {
                  color: "error",
                  track: Ou,
                  tooltipText: "A lifecycle or effect errored",
                  properties: i
                }
              }
            }, (e = e._debugTask) ? e.run(
              performance.measure.bind(
                performance,
                "​" + s,
                t
              )
            ) : performance.measure("​" + s, t);
          }
        }
      } else
        s = ie(e), s !== null && Bt && (o = 1 > i ? "secondary-light" : 100 > i ? "secondary" : 500 > i ? "secondary-dark" : "error", (e = e._debugTask) ? e.run(
          console.timeStamp.bind(
            console,
            s,
            t,
            n,
            Ou,
            void 0,
            o
          )
        ) : console.timeStamp(
          s,
          t,
          n,
          Ou,
          void 0,
          o
        ));
    }
    function s1(e, t, n, i) {
      if (Bt && !(t <= e)) {
        var o = (n & 738197653) === n ? "tertiary-dark" : "primary-dark";
        n = (n & 536870912) === n ? "Prepared" : (n & 201326741) === n ? "Hydrated" : "Render", i ? i.run(
          console.timeStamp.bind(
            console,
            n,
            e,
            t,
            We,
            Ke,
            o
          )
        ) : console.timeStamp(
          n,
          e,
          t,
          We,
          Ke,
          o
        );
      }
    }
    function q0(e, t, n, i) {
      !Bt || t <= e || (n = (n & 738197653) === n ? "tertiary-dark" : "primary-dark", i ? i.run(
        console.timeStamp.bind(
          console,
          "Prewarm",
          e,
          t,
          We,
          Ke,
          n
        )
      ) : console.timeStamp(
        "Prewarm",
        e,
        t,
        We,
        Ke,
        n
      ));
    }
    function j0(e, t, n, i) {
      !Bt || t <= e || (n = (n & 738197653) === n ? "tertiary-dark" : "primary-dark", i ? i.run(
        console.timeStamp.bind(
          console,
          "Suspended",
          e,
          t,
          We,
          Ke,
          n
        )
      ) : console.timeStamp(
        "Suspended",
        e,
        t,
        We,
        Ke,
        n
      ));
    }
    function f1(e, t, n, i, o, s) {
      if (Bt && !(t <= e)) {
        n = [];
        for (var d = 0; d < i.length; d++) {
          var h = i[d].value;
          n.push([
            "Recoverable Error",
            typeof h == "object" && h !== null && typeof h.message == "string" ? String(h.message) : String(h)
          ]);
        }
        e = {
          start: e,
          end: t,
          detail: {
            devtools: {
              color: "primary-dark",
              track: We,
              trackGroup: Ke,
              tooltipText: o ? "Hydration Failed" : "Recovered after Error",
              properties: n
            }
          }
        }, s ? s.run(
          performance.measure.bind(performance, "Recovered", e)
        ) : performance.measure("Recovered", e);
      }
    }
    function jm(e, t, n, i) {
      !Bt || t <= e || (i ? i.run(
        console.timeStamp.bind(
          console,
          "Errored",
          e,
          t,
          We,
          Ke,
          "error"
        )
      ) : console.timeStamp(
        "Errored",
        e,
        t,
        We,
        Ke,
        "error"
      ));
    }
    function r1(e, t, n, i) {
      !Bt || t <= e || (i ? i.run(
        console.timeStamp.bind(
          console,
          n,
          e,
          t,
          We,
          Ke,
          "secondary-light"
        )
      ) : console.timeStamp(
        n,
        e,
        t,
        We,
        Ke,
        "secondary-light"
      ));
    }
    function w0(e, t, n, i, o) {
      if (Bt && !(t <= e)) {
        for (var s = [], d = 0; d < n.length; d++) {
          var h = n[d].value;
          s.push([
            "Error",
            typeof h == "object" && h !== null && typeof h.message == "string" ? String(h.message) : String(h)
          ]);
        }
        e = {
          start: e,
          end: t,
          detail: {
            devtools: {
              color: "error",
              track: We,
              trackGroup: Ke,
              tooltipText: i ? "Remaining Effects Errored" : "Commit Errored",
              properties: s
            }
          }
        }, o ? o.run(
          performance.measure.bind(performance, "Errored", e)
        ) : performance.measure("Errored", e);
      }
    }
    function wm(e, t, n) {
      !Bt || t <= e || console.timeStamp(
        "Animating",
        e,
        t,
        We,
        Ke,
        "secondary-dark"
      );
    }
    function dd() {
      for (var e = Vh, t = q1 = Vh = 0; t < e; ) {
        var n = Du[t];
        Du[t++] = null;
        var i = Du[t];
        Du[t++] = null;
        var o = Du[t];
        Du[t++] = null;
        var s = Du[t];
        if (Du[t++] = null, i !== null && o !== null) {
          var d = i.pending;
          d === null ? o.next = o : (o.next = d.next, d.next = o), i.pending = o;
        }
        s !== 0 && Ym(n, o, s);
      }
    }
    function xo(e, t, n, i) {
      Du[Vh++] = e, Du[Vh++] = t, Du[Vh++] = n, Du[Vh++] = i, q1 |= i, e.lanes |= i, e = e.alternate, e !== null && (e.lanes |= i);
    }
    function bc(e, t, n, i) {
      return xo(e, t, n, i), pf(e);
    }
    function Xl(e, t) {
      return xo(e, null, null, t), pf(e);
    }
    function Ym(e, t, n) {
      e.lanes |= n;
      var i = e.alternate;
      i !== null && (i.lanes |= n);
      for (var o = !1, s = e.return; s !== null; )
        s.childLanes |= n, i = s.alternate, i !== null && (i.childLanes |= n), s.tag === 22 && (e = s.stateNode, e === null || e._visibility & xy || (o = !0)), e = s, s = s.return;
      return e.tag === 3 ? (s = e.stateNode, o && t !== null && (o = 31 - ql(n), e = s.hiddenUpdates, i = e[o], i === null ? e[o] = [t] : i.push(t), t.lane = n | 536870912), s) : null;
    }
    function pf(e) {
      if (u0 > GT)
        throw jr = u0 = 0, i0 = pb = null, Error(
          "Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops."
        );
      jr > XT && (jr = 0, i0 = null, console.error(
        "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."
      )), e.alternate === null && (e.flags & 4098) !== 0 && sa(e);
      for (var t = e, n = t.return; n !== null; )
        t.alternate === null && (t.flags & 4098) !== 0 && sa(e), t = n, n = t.return;
      return t.tag === 3 ? t.stateNode : null;
    }
    function Ai(e) {
      if (_u === null) return e;
      var t = _u(e);
      return t === void 0 ? e : t.current;
    }
    function hd(e) {
      if (_u === null) return e;
      var t = _u(e);
      return t === void 0 ? e != null && typeof e.render == "function" && (t = Ai(e.render), e.render !== t) ? (t = { $$typeof: bs, render: t }, e.displayName !== void 0 && (t.displayName = e.displayName), t) : e : t.current;
    }
    function Gm(e, t) {
      if (_u === null) return !1;
      var n = e.elementType;
      t = t.type;
      var i = !1, o = typeof t == "object" && t !== null ? t.$$typeof : null;
      switch (e.tag) {
        case 1:
          typeof t == "function" && (i = !0);
          break;
        case 0:
          (typeof t == "function" || o === Ql) && (i = !0);
          break;
        case 11:
          (o === bs || o === Ql) && (i = !0);
          break;
        case 14:
        case 15:
          (o === pr || o === Ql) && (i = !0);
          break;
        default:
          return !1;
      }
      return !!(i && (e = _u(n), e !== void 0 && e === _u(t)));
    }
    function Sc(e) {
      _u !== null && typeof WeakSet == "function" && (Qh === null && (Qh = /* @__PURE__ */ new WeakSet()), Qh.add(e));
    }
    function Y0(e, t, n) {
      do {
        var i = e, o = i.alternate, s = i.child, d = i.sibling, h = i.tag;
        i = i.type;
        var v = null;
        switch (h) {
          case 0:
          case 15:
          case 1:
            v = i;
            break;
          case 11:
            v = i.render;
        }
        if (_u === null)
          throw Error("Expected resolveFamily to be set during hot reload.");
        var S = !1;
        if (i = !1, v !== null && (v = _u(v), v !== void 0 && (n.has(v) ? i = !0 : t.has(v) && (h === 1 ? i = !0 : S = !0))), Qh !== null && (Qh.has(e) || o !== null && Qh.has(o)) && (i = !0), i && (e._debugNeedsRemount = !0), (i || S) && (o = Xl(e, 2), o !== null && Ae(o, e, 2)), s === null || i || Y0(
          s,
          t,
          n
        ), d === null) break;
        e = d;
      } while (!0);
    }
    function d1(e, t, n, i) {
      this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = i, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null, this.actualDuration = -0, this.actualStartTime = -1.1, this.treeBaseDuration = this.selfBaseDuration = -0, this._debugTask = this._debugStack = this._debugOwner = this._debugInfo = null, this._debugNeedsRemount = !1, this._debugHookTypes = null, pS || typeof Object.preventExtensions != "function" || Object.preventExtensions(this);
    }
    function Xm(e) {
      return e = e.prototype, !(!e || !e.isReactComponent);
    }
    function Pa(e, t) {
      var n = e.alternate;
      switch (n === null ? (n = Te(
        e.tag,
        t,
        e.key,
        e.mode
      ), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n._debugOwner = e._debugOwner, n._debugStack = e._debugStack, n._debugTask = e._debugTask, n._debugHookTypes = e._debugHookTypes, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null, n.actualDuration = -0, n.actualStartTime = -1.1), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
        lanes: t.lanes,
        firstContext: t.firstContext,
        _debugThenableState: t._debugThenableState
      }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n.selfBaseDuration = e.selfBaseDuration, n.treeBaseDuration = e.treeBaseDuration, n._debugInfo = e._debugInfo, n._debugNeedsRemount = e._debugNeedsRemount, n.tag) {
        case 0:
        case 15:
          n.type = Ai(e.type);
          break;
        case 1:
          n.type = Ai(e.type);
          break;
        case 11:
          n.type = hd(e.type);
      }
      return n;
    }
    function Lm(e, t) {
      e.flags &= 65011714;
      var n = e.alternate;
      return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null, e.selfBaseDuration = 0, e.treeBaseDuration = 0) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
        lanes: t.lanes,
        firstContext: t.firstContext,
        _debugThenableState: t._debugThenableState
      }, e.selfBaseDuration = n.selfBaseDuration, e.treeBaseDuration = n.treeBaseDuration), e;
    }
    function Ec(e, t, n, i, o, s) {
      var d = 0, h = e;
      if (typeof e == "function")
        Xm(e) && (d = 1), h = Ai(h);
      else if (typeof e == "string")
        d = K(), d = Hg(e, n, d) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
      else
        e: switch (e) {
          case Ya:
            return t = Te(31, n, t, o), t.elementType = Ya, t.lanes = s, t;
          case vs:
            return Tc(
              n.children,
              o,
              s,
              t
            );
          case rn:
            d = 8, o |= zn, o |= si;
            break;
          case mr:
            return e = n, i = o, typeof e.id != "string" && console.error(
              'Profiler must specify an "id" of type `string` as a prop. Received the type `%s` instead.',
              typeof e.id
            ), t = Te(12, e, t, i | qe), t.elementType = mr, t.lanes = s, t.stateNode = { effectDuration: 0, passiveEffectDuration: 0 }, t;
          case Ic:
            return t = Te(13, n, t, o), t.elementType = Ic, t.lanes = s, t;
          case Tn:
            return t = Te(19, n, t, o), t.elementType = Tn, t.lanes = s, t;
          default:
            if (typeof e == "object" && e !== null)
              switch (e.$$typeof) {
                case wa:
                  d = 10;
                  break e;
                case Oh:
                  d = 9;
                  break e;
                case bs:
                  d = 11, h = hd(h);
                  break e;
                case pr:
                  d = 14;
                  break e;
                case Ql:
                  d = 16, h = null;
                  break e;
              }
            h = "", (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (h += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports."), e === null ? n = "null" : il(e) ? n = "array" : e !== void 0 && e.$$typeof === fa ? (n = "<" + (me(e.type) || "Unknown") + " />", h = " Did you accidentally export a JSX literal instead of a component?") : n = typeof e, (d = i ? Dt(i) : null) && (h += `

Check the render method of \`` + d + "`."), d = 29, n = Error(
              "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + (n + "." + h)
            ), h = null;
        }
      return t = Te(d, n, t, o), t.elementType = e, t.type = h, t.lanes = s, t._debugOwner = i, t;
    }
    function zi(e, t, n) {
      return t = Ec(
        e.type,
        e.key,
        e.props,
        e._owner,
        t,
        n
      ), t._debugOwner = e._owner, t._debugStack = e._debugStack, t._debugTask = e._debugTask, t;
    }
    function Tc(e, t, n, i) {
      return e = Te(7, e, i, t), e.lanes = n, e;
    }
    function No(e, t, n) {
      return e = Te(6, e, null, t), e.lanes = n, e;
    }
    function Vm(e) {
      var t = Te(18, null, null, Ee);
      return t.stateNode = e, t;
    }
    function md(e, t, n) {
      return t = Te(
        4,
        e.children !== null ? e.children : [],
        e.key,
        t
      ), t.lanes = n, t.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation
      }, t;
    }
    function Fl(e, t) {
      if (typeof e == "object" && e !== null) {
        var n = j1.get(e);
        return n !== void 0 ? n : (t = {
          value: e,
          source: t,
          stack: _t(t)
        }, j1.set(e, t), t);
      }
      return {
        value: e,
        source: t,
        stack: _t(t)
      };
    }
    function Ta(e, t) {
      Oi(), Zh[Jh++] = Ny, Zh[Jh++] = lv, lv = e, Ny = t;
    }
    function Qm(e, t, n) {
      Oi(), Ru[Mu++] = uo, Ru[Mu++] = io, Ru[Mu++] = Tr, Tr = e;
      var i = uo;
      e = io;
      var o = 32 - ql(i) - 1;
      i &= ~(1 << o), n += 1;
      var s = 32 - ql(t) + o;
      if (30 < s) {
        var d = o - o % 5;
        s = (i & (1 << d) - 1).toString(32), i >>= d, o -= d, uo = 1 << 32 - ql(t) + o | n << o | i, io = s + e;
      } else
        uo = 1 << s | n << o | i, io = e;
    }
    function pd(e) {
      Oi(), e.return !== null && (Ta(e, 1), Qm(e, 1, 0));
    }
    function yd(e) {
      for (; e === lv; )
        lv = Zh[--Jh], Zh[Jh] = null, Ny = Zh[--Jh], Zh[Jh] = null;
      for (; e === Tr; )
        Tr = Ru[--Mu], Ru[Mu] = null, io = Ru[--Mu], Ru[Mu] = null, uo = Ru[--Mu], Ru[Mu] = null;
    }
    function G0() {
      return Oi(), Tr !== null ? { id: uo, overflow: io } : null;
    }
    function X0(e, t) {
      Oi(), Ru[Mu++] = uo, Ru[Mu++] = io, Ru[Mu++] = Tr, uo = t.id, io = t.overflow, Tr = e;
    }
    function Oi() {
      Qe || console.error(
        "Expected to be hydrating. This is a bug in React. Please file an issue."
      );
    }
    function Ac(e, t) {
      if (e.return === null) {
        if (Xa === null)
          Xa = {
            fiber: e,
            children: [],
            serverProps: void 0,
            serverTail: [],
            distanceFromLeaf: t
          };
        else {
          if (Xa.fiber !== e)
            throw Error(
              "Saw multiple hydration diff roots in a pass. This is a bug in React."
            );
          Xa.distanceFromLeaf > t && (Xa.distanceFromLeaf = t);
        }
        return Xa;
      }
      var n = Ac(
        e.return,
        t + 1
      ).children;
      return 0 < n.length && n[n.length - 1].fiber === e ? (n = n[n.length - 1], n.distanceFromLeaf > t && (n.distanceFromLeaf = t), n) : (t = {
        fiber: e,
        children: [],
        serverProps: void 0,
        serverTail: [],
        distanceFromLeaf: t
      }, n.push(t), t);
    }
    function L0() {
      Qe && console.error(
        "We should not be hydrating here. This is a bug in React. Please file a bug."
      );
    }
    function Ll(e, t) {
      tc || (e = Ac(e, 0), e.serverProps = null, t !== null && (t = Cg(t), e.serverTail.push(t)));
    }
    function ta(e) {
      var t = 1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : !1, n = "", i = Xa;
      throw i !== null && (Xa = null, n = zm(i)), gf(
        Fl(
          Error(
            "Hydration failed because the server rendered " + (t ? "text" : "HTML") + ` didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch \`if (typeof window !== 'undefined')\`.
- Variable input such as \`Date.now()\` or \`Math.random()\` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch` + n
          ),
          e
        )
      ), w1;
    }
    function Zm(e) {
      var t = e.stateNode, n = e.type, i = e.memoizedProps;
      switch (t[Ht] = e, t[dn] = i, sn(n, i), n) {
        case "dialog":
          be("cancel", t), be("close", t);
          break;
        case "iframe":
        case "object":
        case "embed":
          be("load", t);
          break;
        case "video":
        case "audio":
          for (n = 0; n < c0.length; n++)
            be(c0[n], t);
          break;
        case "source":
          be("error", t);
          break;
        case "img":
        case "image":
        case "link":
          be("error", t), be("load", t);
          break;
        case "details":
          be("toggle", t);
          break;
        case "input":
          fc("input", i), be("invalid", t), Wl(t, i), Fr(
            t,
            i.value,
            i.defaultValue,
            i.checked,
            i.defaultChecked,
            i.type,
            i.name,
            !0
          );
          break;
        case "option":
          O0(t, i);
          break;
        case "select":
          fc("select", i), be("invalid", t), Ir(t, i);
          break;
        case "textarea":
          fc("textarea", i), be("invalid", t), rc(t, i), Ao(
            t,
            i.value,
            i.defaultValue,
            i.children
          );
      }
      n = i.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || i.suppressHydrationWarning === !0 || Kp(t.textContent, n) ? (i.popover != null && (be("beforetoggle", t), be("toggle", t)), i.onScroll != null && be("scroll", t), i.onScrollEnd != null && be("scrollend", t), i.onClick != null && (t.onclick = Pn), t = !0) : t = !1, t || ta(e, !0);
    }
    function Jm(e) {
      for (hn = e.return; hn; )
        switch (hn.tag) {
          case 5:
          case 31:
          case 13:
            Cu = !1;
            return;
          case 27:
          case 3:
            Cu = !0;
            return;
          default:
            hn = hn.return;
        }
    }
    function zc(e) {
      if (e !== hn) return !1;
      if (!Qe)
        return Jm(e), Qe = !0, !1;
      var t = e.tag, n;
      if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || fs(e.type, e.memoizedProps)), n = !n), n && qt) {
        for (n = qt; n; ) {
          var i = Ac(e, 0), o = Cg(n);
          i.serverTail.push(o), n = o.type === "Suspense" ? hs(n) : Xn(n.nextSibling);
        }
        ta(e);
      }
      if (Jm(e), t === 13) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
          throw Error(
            "Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue."
          );
        qt = hs(e);
      } else if (t === 31) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
          throw Error(
            "Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue."
          );
        qt = hs(e);
      } else
        t === 27 ? (t = qt, $i(e.type) ? (e = _b, _b = null, qt = e) : qt = t) : qt = hn ? Xn(e.stateNode.nextSibling) : null;
      return !0;
    }
    function Di() {
      qt = hn = null, tc = Qe = !1;
    }
    function yf() {
      var e = Hs;
      return e !== null && (kn === null ? kn = e : kn.push.apply(
        kn,
        e
      ), Hs = null), e;
    }
    function gf(e) {
      Hs === null ? Hs = [e] : Hs.push(e);
    }
    function _i() {
      var e = Xa;
      if (e !== null) {
        Xa = null;
        for (var t = zm(e); 0 < e.children.length; )
          e = e.children[0];
        le(e.fiber, function() {
          console.error(
            `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch \`if (typeof window !== 'undefined')\`.
- Variable input such as \`Date.now()\` or \`Math.random()\` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

%s%s`,
            "https://react.dev/link/hydration-mismatch",
            t
          );
        });
      }
    }
    function Ho() {
      Kh = nv = null, $h = !1;
    }
    function la(e, t, n) {
      Me(Y1, t._currentValue, e), t._currentValue = n, Me(G1, t._currentRenderer, e), t._currentRenderer !== void 0 && t._currentRenderer !== null && t._currentRenderer !== gS && console.error(
        "Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."
      ), t._currentRenderer = gS;
    }
    function Aa(e, t) {
      e._currentValue = Y1.current;
      var n = G1.current;
      Ue(G1, t), e._currentRenderer = n, Ue(Y1, t);
    }
    function gd(e, t, n) {
      for (; e !== null; ) {
        var i = e.alternate;
        if ((e.childLanes & t) !== t ? (e.childLanes |= t, i !== null && (i.childLanes |= t)) : i !== null && (i.childLanes & t) !== t && (i.childLanes |= t), e === n) break;
        e = e.return;
      }
      e !== n && console.error(
        "Expected to find the propagation root when scheduling context work. This error is likely caused by a bug in React. Please file an issue."
      );
    }
    function Vu(e, t, n, i) {
      var o = e.child;
      for (o !== null && (o.return = e); o !== null; ) {
        var s = o.dependencies;
        if (s !== null) {
          var d = o.child;
          s = s.firstContext;
          e: for (; s !== null; ) {
            var h = s;
            s = o;
            for (var v = 0; v < t.length; v++)
              if (h.context === t[v]) {
                s.lanes |= n, h = s.alternate, h !== null && (h.lanes |= n), gd(
                  s.return,
                  n,
                  e
                ), i || (d = null);
                break e;
              }
            s = h.next;
          }
        } else if (o.tag === 18) {
          if (d = o.return, d === null)
            throw Error(
              "We just came from a parent so we must have had a parent. This is a bug in React."
            );
          d.lanes |= n, s = d.alternate, s !== null && (s.lanes |= n), gd(
            d,
            n,
            e
          ), d = null;
        } else d = o.child;
        if (d !== null) d.return = o;
        else
          for (d = o; d !== null; ) {
            if (d === e) {
              d = null;
              break;
            }
            if (o = d.sibling, o !== null) {
              o.return = d.return, d = o;
              break;
            }
            d = d.return;
          }
        o = d;
      }
    }
    function za(e, t, n, i) {
      e = null;
      for (var o = t, s = !1; o !== null; ) {
        if (!s) {
          if ((o.flags & 524288) !== 0) s = !0;
          else if ((o.flags & 262144) !== 0) break;
        }
        if (o.tag === 10) {
          var d = o.alternate;
          if (d === null)
            throw Error("Should have a current fiber. This is a bug in React.");
          if (d = d.memoizedProps, d !== null) {
            var h = o.type;
            Zn(o.pendingProps.value, d.value) || (e !== null ? e.push(h) : e = [h]);
          }
        } else if (o === Ii.current) {
          if (d = o.alternate, d === null)
            throw Error("Should have a current fiber. This is a bug in React.");
          d.memoizedState.memoizedState !== o.memoizedState.memoizedState && (e !== null ? e.push(d0) : e = [d0]);
        }
        o = o.return;
      }
      e !== null && Vu(
        t,
        e,
        n,
        i
      ), t.flags |= 262144;
    }
    function Bo(e) {
      for (e = e.firstContext; e !== null; ) {
        if (!Zn(
          e.context._currentValue,
          e.memoizedValue
        ))
          return !0;
        e = e.next;
      }
      return !1;
    }
    function Ri(e) {
      nv = e, Kh = null, e = e.dependencies, e !== null && (e.firstContext = null);
    }
    function nt(e) {
      return $h && console.error(
        "Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo()."
      ), Km(nv, e);
    }
    function vf(e, t) {
      return nv === null && Ri(e), Km(e, t);
    }
    function Km(e, t) {
      var n = t._currentValue;
      if (t = { context: t, memoizedValue: n, next: null }, Kh === null) {
        if (e === null)
          throw Error(
            "Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo()."
          );
        Kh = t, e.dependencies = {
          lanes: 0,
          firstContext: t,
          _debugThenableState: null
        }, e.flags |= 524288;
      } else Kh = Kh.next = t;
      return n;
    }
    function vd() {
      return {
        controller: new _T(),
        data: /* @__PURE__ */ new Map(),
        refCount: 0
      };
    }
    function Oc(e) {
      e.controller.signal.aborted && console.warn(
        "A cache instance was retained after it was already freed. This likely indicates a bug in React."
      ), e.refCount++;
    }
    function bf(e) {
      e.refCount--, 0 > e.refCount && console.warn(
        "A cache instance was released after it was already freed. This likely indicates a bug in React."
      ), e.refCount === 0 && RT(MT, function() {
        e.controller.abort();
      });
    }
    function eu(e, t, n) {
      (e & 127) !== 0 ? 0 > lc && (lc = Dl(), By = av(t), X1 = t, n != null && (L1 = ie(n)), (Ie & (Yl | Qa)) !== $l && (ll = !0, qs = Hy), e = rs(), t = bu(), e !== kh || t !== qy ? kh = -1.1 : t !== null && (qs = Hy), Or = e, qy = t) : (e & 4194048) !== 0 && 0 > Uu && (Uu = Dl(), jy = av(t), vS = t, n != null && (bS = ie(n)), 0 > fo) && (e = rs(), t = bu(), (e !== ws || t !== Dr) && (ws = -1.1), js = e, Dr = t);
    }
    function V0(e) {
      if (0 > lc) {
        lc = Dl(), By = e._debugTask != null ? e._debugTask : null, (Ie & (Yl | Qa)) !== $l && (qs = Hy);
        var t = rs(), n = bu();
        t !== kh || n !== qy ? kh = -1.1 : n !== null && (qs = Hy), Or = t, qy = n;
      }
      0 > Uu && (Uu = Dl(), jy = e._debugTask != null ? e._debugTask : null, 0 > fo) && (e = rs(), t = bu(), (e !== ws || t !== Dr) && (ws = -1.1), js = e, Dr = t);
    }
    function tu() {
      var e = Ar;
      return Ar = 0, e;
    }
    function qo(e) {
      var t = Ar;
      return Ar = e, t;
    }
    function Il(e) {
      var t = Ar;
      return Ar += e, t;
    }
    function Dc() {
      ve = pe = -1.1;
    }
    function Ut() {
      var e = pe;
      return pe = -1.1, e;
    }
    function vl(e) {
      0 <= e && (pe = e);
    }
    function na() {
      var e = $t;
      return $t = -0, e;
    }
    function Mn(e) {
      0 <= e && ($t = e);
    }
    function Cn() {
      var e = Lt;
      return Lt = null, e;
    }
    function aa() {
      var e = ll;
      return ll = !1, e;
    }
    function Qu(e) {
      Jn = Dl(), 0 > e.actualStartTime && (e.actualStartTime = Jn);
    }
    function bd(e) {
      if (0 <= Jn) {
        var t = Dl() - Jn;
        e.actualDuration += t, e.selfBaseDuration = t, Jn = -1;
      }
    }
    function Sf(e) {
      if (0 <= Jn) {
        var t = Dl() - Jn;
        e.actualDuration += t, Jn = -1;
      }
    }
    function Pl() {
      if (0 <= Jn) {
        var e = Dl(), t = e - Jn;
        Jn = -1, Ar += t, $t += t, ve = e;
      }
    }
    function Q0(e) {
      Lt === null && (Lt = []), Lt.push(e), oo === null && (oo = []), oo.push(e);
    }
    function Zt() {
      Jn = Dl(), 0 > pe && (pe = Jn);
    }
    function _c(e) {
      for (var t = e.child; t; )
        e.actualDuration += t.actualDuration, t = t.sibling;
    }
    function Zu(e, t) {
      if (Yy === null) {
        var n = Yy = [];
        Q1 = 0, _r = Jp(), Wh = {
          status: "pending",
          value: void 0,
          then: function(i) {
            n.push(i);
          }
        };
      }
      return Q1++, t.then($m, $m), t;
    }
    function $m() {
      if (--Q1 === 0 && (-1 < Uu || (fo = -1.1), Yy !== null)) {
        Wh !== null && (Wh.status = "fulfilled");
        var e = Yy;
        Yy = null, _r = 0, Wh = null;
        for (var t = 0; t < e.length; t++) (0, e[t])();
      }
    }
    function Sd(e, t) {
      var n = [], i = {
        status: "pending",
        value: null,
        reason: null,
        then: function(o) {
          n.push(o);
        }
      };
      return e.then(
        function() {
          i.status = "fulfilled", i.value = t;
          for (var o = 0; o < n.length; o++) (0, n[o])(t);
        },
        function(o) {
          for (i.status = "rejected", i.reason = o, o = 0; o < n.length; o++)
            (0, n[o])(void 0);
        }
      ), i;
    }
    function Ju() {
      var e = Rr.current;
      return e !== null ? e : Ot.pooledCache;
    }
    function jo(e, t) {
      t === null ? Me(Rr, Rr.current, e) : Me(Rr, t.pool, e);
    }
    function km() {
      var e = Ju();
      return e === null ? null : { parent: Ol._currentValue, pool: e };
    }
    function Ed() {
      return { didWarnAboutUncachedPromise: !1, thenables: [] };
    }
    function Wm(e) {
      return e = e.status, e === "fulfilled" || e === "rejected";
    }
    function Un(e, t, n) {
      w.actQueue !== null && (w.didUsePromise = !0);
      var i = e.thenables;
      if (n = i[n], n === void 0 ? i.push(t) : n !== t && (e.didWarnAboutUncachedPromise || (e.didWarnAboutUncachedPromise = !0, console.error(
        "A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework."
      )), t.then(Pn, Pn), t = n), t._debugInfo === void 0) {
        e = performance.now(), i = t.displayName;
        var o = {
          name: typeof i == "string" ? i : "Promise",
          start: e,
          end: e,
          value: t
        };
        t._debugInfo = [{ awaited: o }], t.status !== "fulfilled" && t.status !== "rejected" && (e = function() {
          o.end = performance.now();
        }, t.then(e, e));
      }
      switch (t.status) {
        case "fulfilled":
          return t.value;
        case "rejected":
          throw e = t.reason, Ef(e), e;
        default:
          if (typeof t.status == "string")
            t.then(Pn, Pn);
          else {
            if (e = Ot, e !== null && 100 < e.shellSuspendCounter)
              throw Error(
                "An unknown Component is an async Client Component. Only Server Components can be async at the moment. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server."
              );
            e = t, e.status = "pending", e.then(
              function(s) {
                if (t.status === "pending") {
                  var d = t;
                  d.status = "fulfilled", d.value = s;
                }
              },
              function(s) {
                if (t.status === "pending") {
                  var d = t;
                  d.status = "rejected", d.reason = s;
                }
              }
            );
          }
          switch (t.status) {
            case "fulfilled":
              return t.value;
            case "rejected":
              throw e = t.reason, Ef(e), e;
          }
          throw Cr = t, Jy = !0, Fh;
      }
    }
    function xn(e) {
      try {
        return HT(e);
      } catch (t) {
        throw t !== null && typeof t == "object" && typeof t.then == "function" ? (Cr = t, Jy = !0, Fh) : t;
      }
    }
    function Rc() {
      if (Cr === null)
        throw Error(
          "Expected a suspended thenable. This is a bug in React. Please file an issue."
        );
      var e = Cr;
      return Cr = null, Jy = !1, e;
    }
    function Ef(e) {
      if (e === Fh || e === dv)
        throw Error(
          "Hooks are not supported inside an async component. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server."
        );
    }
    function Ft(e) {
      var t = je;
      return e != null && (je = t === null ? e : t.concat(e)), t;
    }
    function yn() {
      var e = je;
      if (e != null) {
        for (var t = e.length - 1; 0 <= t; t--)
          if (e[t].name != null) {
            var n = e[t].debugTask;
            if (n != null) return n;
          }
      }
      return null;
    }
    function en(e, t, n) {
      for (var i = Object.keys(e.props), o = 0; o < i.length; o++) {
        var s = i[o];
        if (s !== "children" && s !== "key") {
          t === null && (t = zi(e, n.mode, 0), t._debugInfo = je, t.return = n), le(
            t,
            function(d) {
              console.error(
                "Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.",
                d
              );
            },
            s
          );
          break;
        }
      }
    }
    function Oa(e) {
      var t = Ky;
      return Ky += 1, Ih === null && (Ih = Ed()), Un(Ih, e, t);
    }
    function gn(e, t) {
      t = t.props.ref, e.ref = t !== void 0 ? t : null;
    }
    function Da(e, t) {
      throw t.$$typeof === Gg ? Error(
        `A React Element from an older version of React was rendered. This is not supported. It can happen if:
- Multiple copies of the "react" package is used.
- A library pre-bundled an old copy of "react" or "react/jsx-runtime".
- A compiler tries to "inline" JSX instead of using the runtime.`
      ) : (e = Object.prototype.toString.call(t), Error(
        "Objects are not valid as a React child (found: " + (e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e) + "). If you meant to render a collection of children, use an array instead."
      ));
    }
    function ua(e, t) {
      var n = yn();
      n !== null ? n.run(
        Da.bind(null, e, t)
      ) : Da(e, t);
    }
    function Fm(e, t) {
      var n = ie(e) || "Component";
      YS[n] || (YS[n] = !0, t = t.displayName || t.name || "Component", e.tag === 3 ? console.error(
        `Functions are not valid as a React child. This may happen if you return %s instead of <%s /> from render. Or maybe you meant to call this function rather than return it.
  root.render(%s)`,
        t,
        t,
        t
      ) : console.error(
        `Functions are not valid as a React child. This may happen if you return %s instead of <%s /> from render. Or maybe you meant to call this function rather than return it.
  <%s>{%s}</%s>`,
        t,
        t,
        n,
        t,
        n
      ));
    }
    function wo(e, t) {
      var n = yn();
      n !== null ? n.run(
        Fm.bind(null, e, t)
      ) : Fm(e, t);
    }
    function Td(e, t) {
      var n = ie(e) || "Component";
      GS[n] || (GS[n] = !0, t = String(t), e.tag === 3 ? console.error(
        `Symbols are not valid as a React child.
  root.render(%s)`,
        t
      ) : console.error(
        `Symbols are not valid as a React child.
  <%s>%s</%s>`,
        n,
        t,
        n
      ));
    }
    function Tf(e, t) {
      var n = yn();
      n !== null ? n.run(
        Td.bind(null, e, t)
      ) : Td(e, t);
    }
    function bl(e) {
      function t(T, z) {
        if (e) {
          var D = T.deletions;
          D === null ? (T.deletions = [z], T.flags |= 16) : D.push(z);
        }
      }
      function n(T, z) {
        if (!e) return null;
        for (; z !== null; )
          t(T, z), z = z.sibling;
        return null;
      }
      function i(T) {
        for (var z = /* @__PURE__ */ new Map(); T !== null; )
          T.key !== null ? z.set(T.key, T) : z.set(T.index, T), T = T.sibling;
        return z;
      }
      function o(T, z) {
        return T = Pa(T, z), T.index = 0, T.sibling = null, T;
      }
      function s(T, z, D) {
        return T.index = D, e ? (D = T.alternate, D !== null ? (D = D.index, D < z ? (T.flags |= 67108866, z) : D) : (T.flags |= 67108866, z)) : (T.flags |= 1048576, z);
      }
      function d(T) {
        return e && T.alternate === null && (T.flags |= 67108866), T;
      }
      function h(T, z, D, V) {
        return z === null || z.tag !== 6 ? (z = No(
          D,
          T.mode,
          V
        ), z.return = T, z._debugOwner = T, z._debugTask = T._debugTask, z._debugInfo = je, z) : (z = o(z, D), z.return = T, z._debugInfo = je, z);
      }
      function v(T, z, D, V) {
        var P = D.type;
        return P === vs ? (z = _(
          T,
          z,
          D.props.children,
          V,
          D.key
        ), en(D, z, T), z) : z !== null && (z.elementType === P || Gm(z, D) || typeof P == "object" && P !== null && P.$$typeof === Ql && xn(P) === z.type) ? (z = o(z, D.props), gn(z, D), z.return = T, z._debugOwner = D._owner, z._debugInfo = je, z) : (z = zi(D, T.mode, V), gn(z, D), z.return = T, z._debugInfo = je, z);
      }
      function S(T, z, D, V) {
        return z === null || z.tag !== 4 || z.stateNode.containerInfo !== D.containerInfo || z.stateNode.implementation !== D.implementation ? (z = md(D, T.mode, V), z.return = T, z._debugInfo = je, z) : (z = o(z, D.children || []), z.return = T, z._debugInfo = je, z);
      }
      function _(T, z, D, V, P) {
        return z === null || z.tag !== 7 ? (z = Tc(
          D,
          T.mode,
          V,
          P
        ), z.return = T, z._debugOwner = T, z._debugTask = T._debugTask, z._debugInfo = je, z) : (z = o(z, D), z.return = T, z._debugInfo = je, z);
      }
      function M(T, z, D) {
        if (typeof z == "string" && z !== "" || typeof z == "number" || typeof z == "bigint")
          return z = No(
            "" + z,
            T.mode,
            D
          ), z.return = T, z._debugOwner = T, z._debugTask = T._debugTask, z._debugInfo = je, z;
        if (typeof z == "object" && z !== null) {
          switch (z.$$typeof) {
            case fa:
              return D = zi(
                z,
                T.mode,
                D
              ), gn(D, z), D.return = T, T = Ft(z._debugInfo), D._debugInfo = je, je = T, D;
            case Wi:
              return z = md(
                z,
                T.mode,
                D
              ), z.return = T, z._debugInfo = je, z;
            case Ql:
              var V = Ft(z._debugInfo);
              return z = xn(z), T = M(T, z, D), je = V, T;
          }
          if (il(z) || I(z))
            return D = Tc(
              z,
              T.mode,
              D,
              null
            ), D.return = T, D._debugOwner = T, D._debugTask = T._debugTask, T = Ft(z._debugInfo), D._debugInfo = je, je = T, D;
          if (typeof z.then == "function")
            return V = Ft(z._debugInfo), T = M(
              T,
              Oa(z),
              D
            ), je = V, T;
          if (z.$$typeof === wa)
            return M(
              T,
              vf(T, z),
              D
            );
          ua(T, z);
        }
        return typeof z == "function" && wo(T, z), typeof z == "symbol" && Tf(T, z), null;
      }
      function A(T, z, D, V) {
        var P = z !== null ? z.key : null;
        if (typeof D == "string" && D !== "" || typeof D == "number" || typeof D == "bigint")
          return P !== null ? null : h(T, z, "" + D, V);
        if (typeof D == "object" && D !== null) {
          switch (D.$$typeof) {
            case fa:
              return D.key === P ? (P = Ft(D._debugInfo), T = v(
                T,
                z,
                D,
                V
              ), je = P, T) : null;
            case Wi:
              return D.key === P ? S(T, z, D, V) : null;
            case Ql:
              return P = Ft(D._debugInfo), D = xn(D), T = A(
                T,
                z,
                D,
                V
              ), je = P, T;
          }
          if (il(D) || I(D))
            return P !== null ? null : (P = Ft(D._debugInfo), T = _(
              T,
              z,
              D,
              V,
              null
            ), je = P, T);
          if (typeof D.then == "function")
            return P = Ft(D._debugInfo), T = A(
              T,
              z,
              Oa(D),
              V
            ), je = P, T;
          if (D.$$typeof === wa)
            return A(
              T,
              z,
              vf(T, D),
              V
            );
          ua(T, D);
        }
        return typeof D == "function" && wo(T, D), typeof D == "symbol" && Tf(T, D), null;
      }
      function q(T, z, D, V, P) {
        if (typeof V == "string" && V !== "" || typeof V == "number" || typeof V == "bigint")
          return T = T.get(D) || null, h(z, T, "" + V, P);
        if (typeof V == "object" && V !== null) {
          switch (V.$$typeof) {
            case fa:
              return D = T.get(
                V.key === null ? D : V.key
              ) || null, T = Ft(V._debugInfo), z = v(
                z,
                D,
                V,
                P
              ), je = T, z;
            case Wi:
              return T = T.get(
                V.key === null ? D : V.key
              ) || null, S(z, T, V, P);
            case Ql:
              var De = Ft(V._debugInfo);
              return V = xn(V), z = q(
                T,
                z,
                D,
                V,
                P
              ), je = De, z;
          }
          if (il(V) || I(V))
            return D = T.get(D) || null, T = Ft(V._debugInfo), z = _(
              z,
              D,
              V,
              P,
              null
            ), je = T, z;
          if (typeof V.then == "function")
            return De = Ft(V._debugInfo), z = q(
              T,
              z,
              D,
              Oa(V),
              P
            ), je = De, z;
          if (V.$$typeof === wa)
            return q(
              T,
              z,
              D,
              vf(z, V),
              P
            );
          ua(z, V);
        }
        return typeof V == "function" && wo(z, V), typeof V == "symbol" && Tf(z, V), null;
      }
      function F(T, z, D, V) {
        if (typeof D != "object" || D === null) return V;
        switch (D.$$typeof) {
          case fa:
          case Wi:
            ke(T, z, D);
            var P = D.key;
            if (typeof P != "string") break;
            if (V === null) {
              V = /* @__PURE__ */ new Set(), V.add(P);
              break;
            }
            if (!V.has(P)) {
              V.add(P);
              break;
            }
            le(z, function() {
              console.error(
                "Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.",
                P
              );
            });
            break;
          case Ql:
            D = xn(D), F(T, z, D, V);
        }
        return V;
      }
      function te(T, z, D, V) {
        for (var P = null, De = null, he = null, oe = z, He = z = 0, jt = null; oe !== null && He < D.length; He++) {
          oe.index > He ? (jt = oe, oe = null) : jt = oe.sibling;
          var pl = A(
            T,
            oe,
            D[He],
            V
          );
          if (pl === null) {
            oe === null && (oe = jt);
            break;
          }
          P = F(
            T,
            pl,
            D[He],
            P
          ), e && oe && pl.alternate === null && t(T, oe), z = s(pl, z, He), he === null ? De = pl : he.sibling = pl, he = pl, oe = jt;
        }
        if (He === D.length)
          return n(T, oe), Qe && Ta(T, He), De;
        if (oe === null) {
          for (; He < D.length; He++)
            oe = M(T, D[He], V), oe !== null && (P = F(
              T,
              oe,
              D[He],
              P
            ), z = s(
              oe,
              z,
              He
            ), he === null ? De = oe : he.sibling = oe, he = oe);
          return Qe && Ta(T, He), De;
        }
        for (oe = i(oe); He < D.length; He++)
          jt = q(
            oe,
            T,
            He,
            D[He],
            V
          ), jt !== null && (P = F(
            T,
            jt,
            D[He],
            P
          ), e && jt.alternate !== null && oe.delete(
            jt.key === null ? He : jt.key
          ), z = s(
            jt,
            z,
            He
          ), he === null ? De = jt : he.sibling = jt, he = jt);
        return e && oe.forEach(function(bo) {
          return t(T, bo);
        }), Qe && Ta(T, He), De;
      }
      function Mt(T, z, D, V) {
        if (D == null)
          throw Error("An iterable object provided no iterator.");
        for (var P = null, De = null, he = z, oe = z = 0, He = null, jt = null, pl = D.next(); he !== null && !pl.done; oe++, pl = D.next()) {
          he.index > oe ? (He = he, he = null) : He = he.sibling;
          var bo = A(T, he, pl.value, V);
          if (bo === null) {
            he === null && (he = He);
            break;
          }
          jt = F(
            T,
            bo,
            pl.value,
            jt
          ), e && he && bo.alternate === null && t(T, he), z = s(bo, z, oe), De === null ? P = bo : De.sibling = bo, De = bo, he = He;
        }
        if (pl.done)
          return n(T, he), Qe && Ta(T, oe), P;
        if (he === null) {
          for (; !pl.done; oe++, pl = D.next())
            he = M(T, pl.value, V), he !== null && (jt = F(
              T,
              he,
              pl.value,
              jt
            ), z = s(
              he,
              z,
              oe
            ), De === null ? P = he : De.sibling = he, De = he);
          return Qe && Ta(T, oe), P;
        }
        for (he = i(he); !pl.done; oe++, pl = D.next())
          He = q(
            he,
            T,
            oe,
            pl.value,
            V
          ), He !== null && (jt = F(
            T,
            He,
            pl.value,
            jt
          ), e && He.alternate !== null && he.delete(
            He.key === null ? oe : He.key
          ), z = s(
            He,
            z,
            oe
          ), De === null ? P = He : De.sibling = He, De = He);
        return e && he.forEach(function(aA) {
          return t(T, aA);
        }), Qe && Ta(T, oe), P;
      }
      function $e(T, z, D, V) {
        if (typeof D == "object" && D !== null && D.type === vs && D.key === null && (en(D, null, T), D = D.props.children), typeof D == "object" && D !== null) {
          switch (D.$$typeof) {
            case fa:
              var P = Ft(D._debugInfo);
              e: {
                for (var De = D.key; z !== null; ) {
                  if (z.key === De) {
                    if (De = D.type, De === vs) {
                      if (z.tag === 7) {
                        n(
                          T,
                          z.sibling
                        ), V = o(
                          z,
                          D.props.children
                        ), V.return = T, V._debugOwner = D._owner, V._debugInfo = je, en(D, V, T), T = V;
                        break e;
                      }
                    } else if (z.elementType === De || Gm(
                      z,
                      D
                    ) || typeof De == "object" && De !== null && De.$$typeof === Ql && xn(De) === z.type) {
                      n(
                        T,
                        z.sibling
                      ), V = o(z, D.props), gn(V, D), V.return = T, V._debugOwner = D._owner, V._debugInfo = je, T = V;
                      break e;
                    }
                    n(T, z);
                    break;
                  } else t(T, z);
                  z = z.sibling;
                }
                D.type === vs ? (V = Tc(
                  D.props.children,
                  T.mode,
                  V,
                  D.key
                ), V.return = T, V._debugOwner = T, V._debugTask = T._debugTask, V._debugInfo = je, en(D, V, T), T = V) : (V = zi(
                  D,
                  T.mode,
                  V
                ), gn(V, D), V.return = T, V._debugInfo = je, T = V);
              }
              return T = d(T), je = P, T;
            case Wi:
              e: {
                for (P = D, D = P.key; z !== null; ) {
                  if (z.key === D)
                    if (z.tag === 4 && z.stateNode.containerInfo === P.containerInfo && z.stateNode.implementation === P.implementation) {
                      n(
                        T,
                        z.sibling
                      ), V = o(
                        z,
                        P.children || []
                      ), V.return = T, T = V;
                      break e;
                    } else {
                      n(T, z);
                      break;
                    }
                  else t(T, z);
                  z = z.sibling;
                }
                V = md(
                  P,
                  T.mode,
                  V
                ), V.return = T, T = V;
              }
              return d(T);
            case Ql:
              return P = Ft(D._debugInfo), D = xn(D), T = $e(
                T,
                z,
                D,
                V
              ), je = P, T;
          }
          if (il(D))
            return P = Ft(D._debugInfo), T = te(
              T,
              z,
              D,
              V
            ), je = P, T;
          if (I(D)) {
            if (P = Ft(D._debugInfo), De = I(D), typeof De != "function")
              throw Error(
                "An object is not an iterable. This error is likely caused by a bug in React. Please file an issue."
              );
            var he = De.call(D);
            return he === D ? (T.tag !== 0 || Object.prototype.toString.call(T.type) !== "[object GeneratorFunction]" || Object.prototype.toString.call(he) !== "[object Generator]") && (jS || console.error(
              "Using Iterators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. You can also use an Iterable that can iterate multiple times over the same items."
            ), jS = !0) : D.entries !== De || $1 || (console.error(
              "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
            ), $1 = !0), T = Mt(
              T,
              z,
              he,
              V
            ), je = P, T;
          }
          if (typeof D.then == "function")
            return P = Ft(D._debugInfo), T = $e(
              T,
              z,
              Oa(D),
              V
            ), je = P, T;
          if (D.$$typeof === wa)
            return $e(
              T,
              z,
              vf(T, D),
              V
            );
          ua(T, D);
        }
        return typeof D == "string" && D !== "" || typeof D == "number" || typeof D == "bigint" ? (P = "" + D, z !== null && z.tag === 6 ? (n(
          T,
          z.sibling
        ), V = o(z, P), V.return = T, T = V) : (n(T, z), V = No(
          P,
          T.mode,
          V
        ), V.return = T, V._debugOwner = T, V._debugTask = T._debugTask, V._debugInfo = je, T = V), d(T)) : (typeof D == "function" && wo(T, D), typeof D == "symbol" && Tf(T, D), n(T, z));
      }
      return function(T, z, D, V) {
        var P = je;
        je = null;
        try {
          Ky = 0;
          var De = $e(
            T,
            z,
            D,
            V
          );
          return Ih = null, De;
        } catch (jt) {
          if (jt === Fh || jt === dv) throw jt;
          var he = Te(29, jt, null, T.mode);
          he.lanes = V, he.return = T;
          var oe = he._debugInfo = je;
          if (he._debugOwner = T._debugOwner, he._debugTask = T._debugTask, oe != null) {
            for (var He = oe.length - 1; 0 <= He; He--)
              if (typeof oe[He].stack == "string") {
                he._debugOwner = oe[He], he._debugTask = oe[He].debugTask;
                break;
              }
          }
          return he;
        } finally {
          je = P;
        }
      };
    }
    function Et(e, t) {
      var n = il(e);
      return e = !n && typeof I(e) == "function", n || e ? (n = n ? "array" : "iterable", console.error(
        "A nested %s was passed to row #%s in <SuspenseList />. Wrap it in an additional SuspenseList to configure its revealOrder: <SuspenseList revealOrder=...> ... <SuspenseList revealOrder=...>{%s}</SuspenseList> ... </SuspenseList>",
        n,
        t,
        n
      ), !1) : !0;
    }
    function Le(e) {
      e.updateQueue = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, lanes: 0, hiddenCallbacks: null },
        callbacks: null
      };
    }
    function lu(e, t) {
      e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        callbacks: null
      });
    }
    function sl(e) {
      return {
        lane: e,
        tag: LS,
        payload: null,
        callback: null,
        next: null
      };
    }
    function nu(e, t, n) {
      var i = e.updateQueue;
      if (i === null) return null;
      if (i = i.shared, W1 === i && !ZS) {
        var o = ie(e);
        console.error(
          `An update (setState, replaceState, or forceUpdate) was scheduled from inside an update function. Update functions should be pure, with zero side-effects. Consider using componentDidUpdate or a callback.

Please update the following component: %s`,
          o
        ), ZS = !0;
      }
      return (Ie & Yl) !== $l ? (o = i.pending, o === null ? t.next = t : (t.next = o.next, o.next = t), i.pending = t, t = pf(e), Ym(e, null, n), t) : (xo(e, i, t, n), pf(e));
    }
    function ia(e, t, n) {
      if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194048) !== 0)) {
        var i = t.lanes;
        i &= e.pendingLanes, n |= i, t.lanes = n, E0(e, n);
      }
    }
    function Af(e, t) {
      var n = e.updateQueue, i = e.alternate;
      if (i !== null && (i = i.updateQueue, n === i)) {
        var o = null, s = null;
        if (n = n.firstBaseUpdate, n !== null) {
          do {
            var d = {
              lane: n.lane,
              tag: n.tag,
              payload: n.payload,
              callback: null,
              next: null
            };
            s === null ? o = s = d : s = s.next = d, n = n.next;
          } while (n !== null);
          s === null ? o = s = t : s = s.next = t;
        } else o = s = t;
        n = {
          baseState: i.baseState,
          firstBaseUpdate: o,
          lastBaseUpdate: s,
          shared: i.shared,
          callbacks: i.callbacks
        }, e.updateQueue = n;
        return;
      }
      e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
    }
    function Yo() {
      if (F1) {
        var e = Wh;
        if (e !== null) throw e;
      }
    }
    function au(e, t, n, i) {
      F1 = !1;
      var o = e.updateQueue;
      Ys = !1, W1 = o.shared;
      var s = o.firstBaseUpdate, d = o.lastBaseUpdate, h = o.shared.pending;
      if (h !== null) {
        o.shared.pending = null;
        var v = h, S = v.next;
        v.next = null, d === null ? s = S : d.next = S, d = v;
        var _ = e.alternate;
        _ !== null && (_ = _.updateQueue, h = _.lastBaseUpdate, h !== d && (h === null ? _.firstBaseUpdate = S : h.next = S, _.lastBaseUpdate = v));
      }
      if (s !== null) {
        var M = o.baseState;
        d = 0, _ = S = v = null, h = s;
        do {
          var A = h.lane & -536870913, q = A !== h.lane;
          if (q ? (we & A) === A : (i & A) === A) {
            A !== 0 && A === _r && (F1 = !0), _ !== null && (_ = _.next = {
              lane: 0,
              tag: h.tag,
              payload: h.payload,
              callback: null,
              next: null
            });
            e: {
              A = e;
              var F = h, te = t, Mt = n;
              switch (F.tag) {
                case VS:
                  if (F = F.payload, typeof F == "function") {
                    $h = !0;
                    var $e = F.call(
                      Mt,
                      M,
                      te
                    );
                    if (A.mode & zn) {
                      St(!0);
                      try {
                        F.call(Mt, M, te);
                      } finally {
                        St(!1);
                      }
                    }
                    $h = !1, M = $e;
                    break e;
                  }
                  M = F;
                  break e;
                case k1:
                  A.flags = A.flags & -65537 | 128;
                case LS:
                  if ($e = F.payload, typeof $e == "function") {
                    if ($h = !0, F = $e.call(
                      Mt,
                      M,
                      te
                    ), A.mode & zn) {
                      St(!0);
                      try {
                        $e.call(Mt, M, te);
                      } finally {
                        St(!1);
                      }
                    }
                    $h = !1;
                  } else F = $e;
                  if (F == null) break e;
                  M = Be({}, M, F);
                  break e;
                case QS:
                  Ys = !0;
              }
            }
            A = h.callback, A !== null && (e.flags |= 64, q && (e.flags |= 8192), q = o.callbacks, q === null ? o.callbacks = [A] : q.push(A));
          } else
            q = {
              lane: A,
              tag: h.tag,
              payload: h.payload,
              callback: h.callback,
              next: null
            }, _ === null ? (S = _ = q, v = M) : _ = _.next = q, d |= A;
          if (h = h.next, h === null) {
            if (h = o.shared.pending, h === null)
              break;
            q = h, h = q.next, q.next = null, o.lastBaseUpdate = q, o.shared.pending = null;
          }
        } while (!0);
        _ === null && (v = M), o.baseState = v, o.firstBaseUpdate = S, o.lastBaseUpdate = _, s === null && (o.shared.lanes = 0), Ls |= d, e.lanes = d, e.memoizedState = M;
      }
      W1 = null;
    }
    function Mi(e, t) {
      if (typeof e != "function")
        throw Error(
          "Invalid argument passed as callback. Expected a function. Instead received: " + e
        );
      e.call(t);
    }
    function Im(e, t) {
      var n = e.shared.hiddenCallbacks;
      if (n !== null)
        for (e.shared.hiddenCallbacks = null, e = 0; e < n.length; e++)
          Mi(n[e], t);
    }
    function Go(e, t) {
      var n = e.callbacks;
      if (n !== null)
        for (e.callbacks = null, e = 0; e < n.length; e++)
          Mi(n[e], t);
    }
    function Ad(e, t) {
      var n = ac;
      Me(mv, n, e), Me(Ph, t, e), ac = n | t.baseLanes;
    }
    function Ku(e) {
      Me(mv, ac, e), Me(
        Ph,
        Ph.current,
        e
      );
    }
    function _a(e) {
      ac = mv.current, Ue(Ph, e), Ue(mv, e);
    }
    function tn(e) {
      var t = e.alternate;
      Me(
        ml,
        ml.current & em,
        e
      ), Me(La, e, e), xu === null && (t === null || Ph.current !== null || t.memoizedState !== null) && (xu = e);
    }
    function Ra(e) {
      Me(ml, ml.current, e), Me(La, e, e), xu === null && (xu = e);
    }
    function zd(e) {
      e.tag === 22 ? (Me(ml, ml.current, e), Me(La, e, e), xu === null && (xu = e)) : uu(e);
    }
    function uu(e) {
      Me(ml, ml.current, e), Me(
        La,
        La.current,
        e
      );
    }
    function Sl(e) {
      Ue(La, e), xu === e && (xu = null), Ue(ml, e);
    }
    function Mc(e) {
      for (var t = e; t !== null; ) {
        if (t.tag === 13) {
          var n = t.memoizedState;
          if (n !== null && (n = n.dehydrated, n === null || ur(n) || kp(n)))
            return t;
        } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
          if ((t.flags & 128) !== 0) return t;
        } else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return null;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return null;
    }
    function ze() {
      var e = j;
      Hu === null ? Hu = [e] : Hu.push(e);
    }
    function $() {
      var e = j;
      if (Hu !== null && (mo++, Hu[mo] !== e)) {
        var t = ie(Oe);
        if (!JS.has(t) && (JS.add(t), Hu !== null)) {
          for (var n = "", i = 0; i <= mo; i++) {
            var o = Hu[i], s = i === mo ? e : o;
            for (o = i + 1 + ". " + o; 30 > o.length; )
              o += " ";
            o += s + `
`, n += o;
          }
          console.error(
            `React has detected a change in the order of Hooks called by %s. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://react.dev/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
%s   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
`,
            t,
            n
          );
        }
      }
    }
    function $u(e) {
      e == null || il(e) || console.error(
        "%s received a final argument that is not an array (instead, received `%s`). When specified, the final argument must be an array.",
        j,
        typeof e
      );
    }
    function zf() {
      var e = ie(Oe);
      $S.has(e) || ($S.add(e), console.error(
        "ReactDOM.useFormState has been renamed to React.useActionState. Please update %s to use React.useActionState.",
        e
      ));
    }
    function Jt() {
      throw Error(
        `Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.`
      );
    }
    function Pm(e, t) {
      if (Wy) return !1;
      if (t === null)
        return console.error(
          "%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.",
          j
        ), !1;
      e.length !== t.length && console.error(
        `The final argument passed to %s changed size between renders. The order and size of this array must remain constant.

Previous: %s
Incoming: %s`,
        j,
        "[" + t.join(", ") + "]",
        "[" + e.join(", ") + "]"
      );
      for (var n = 0; n < t.length && n < e.length; n++)
        if (!Zn(e[n], t[n])) return !1;
      return !0;
    }
    function ep(e, t, n, i, o, s) {
      ro = s, Oe = t, Hu = e !== null ? e._debugHookTypes : null, mo = -1, Wy = e !== null && e.type !== t.type, (Object.prototype.toString.call(n) === "[object AsyncFunction]" || Object.prototype.toString.call(n) === "[object AsyncGeneratorFunction]") && (s = ie(Oe), I1.has(s) || (I1.add(s), console.error(
        "%s is an async Client Component. Only Server Components can be async at the moment. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.",
        s === null ? "An unknown Component" : "<" + s + ">"
      ))), t.memoizedState = null, t.updateQueue = null, t.lanes = 0, w.H = e !== null && e.memoizedState !== null ? eb : Hu !== null ? kS : P1, xr = s = (t.mode & zn) !== Ee;
      var d = Z1(n, i, o);
      if (xr = !1, lm && (d = Of(
        t,
        n,
        i,
        o
      )), s) {
        St(!0);
        try {
          d = Of(
            t,
            n,
            i,
            o
          );
        } finally {
          St(!1);
        }
      }
      return It(e, t), d;
    }
    function It(e, t) {
      t._debugHookTypes = Hu, t.dependencies === null ? ho !== null && (t.dependencies = {
        lanes: 0,
        firstContext: null,
        _debugThenableState: ho
      }) : t.dependencies._debugThenableState = ho, w.H = Fy;
      var n = zt !== null && zt.next !== null;
      if (ro = 0, Hu = j = _l = zt = Oe = null, mo = -1, e !== null && (e.flags & 65011712) !== (t.flags & 65011712) && console.error(
        "Internal React error: Expected static flag was missing. Please notify the React team."
      ), yv = !1, ky = 0, ho = null, n)
        throw Error(
          "Rendered fewer hooks than expected. This may be caused by an accidental early return statement."
        );
      e === null || Rl || (e = e.dependencies, e !== null && Bo(e) && (Rl = !0)), Jy ? (Jy = !1, e = !0) : e = !1, e && (t = ie(t) || "Unknown", KS.has(t) || I1.has(t) || (KS.add(t), console.error(
        "`use` was called from inside a try/catch block. This is not allowed and can lead to unexpected behavior. To handle errors triggered by `use`, wrap your component in a error boundary."
      )));
    }
    function Of(e, t, n, i) {
      Oe = e;
      var o = 0;
      do {
        if (lm && (ho = null), ky = 0, lm = !1, o >= qT)
          throw Error(
            "Too many re-renders. React limits the number of renders to prevent an infinite loop."
          );
        if (o += 1, Wy = !1, _l = zt = null, e.updateQueue != null) {
          var s = e.updateQueue;
          s.lastEffect = null, s.events = null, s.stores = null, s.memoCache != null && (s.memoCache.index = 0);
        }
        mo = -1, w.H = WS, s = Z1(t, n, i);
      } while (lm);
      return s;
    }
    function Df() {
      var e = w.H, t = e.useState()[0];
      return t = typeof t.then == "function" ? Mf(t) : t, e = e.useState()[0], (zt !== null ? zt.memoizedState : null) !== e && (Oe.flags |= 1024), t;
    }
    function Cc() {
      var e = gv !== 0;
      return gv = 0, e;
    }
    function _f(e, t, n) {
      t.updateQueue = e.updateQueue, t.flags = (t.mode & si) !== Ee ? t.flags & -402655237 : t.flags & -2053, e.lanes &= ~n;
    }
    function Ci(e) {
      if (yv) {
        for (e = e.memoizedState; e !== null; ) {
          var t = e.queue;
          t !== null && (t.pending = null), e = e.next;
        }
        yv = !1;
      }
      ro = 0, Hu = _l = zt = Oe = null, mo = -1, j = null, lm = !1, ky = gv = 0, ho = null;
    }
    function al() {
      var e = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
      };
      return _l === null ? Oe.memoizedState = _l = e : _l = _l.next = e, _l;
    }
    function ot() {
      if (zt === null) {
        var e = Oe.alternate;
        e = e !== null ? e.memoizedState : null;
      } else e = zt.next;
      var t = _l === null ? Oe.memoizedState : _l.next;
      if (t !== null)
        _l = t, zt = e;
      else {
        if (e === null)
          throw Oe.alternate === null ? Error(
            "Update hook called on initial render. This is likely a bug in React. Please file an issue."
          ) : Error("Rendered more hooks than during the previous render.");
        zt = e, e = {
          memoizedState: zt.memoizedState,
          baseState: zt.baseState,
          baseQueue: zt.baseQueue,
          queue: zt.queue,
          next: null
        }, _l === null ? Oe.memoizedState = _l = e : _l = _l.next = e;
      }
      return _l;
    }
    function Rf() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function Mf(e) {
      var t = ky;
      return ky += 1, ho === null && (ho = Ed()), e = Un(ho, e, t), t = Oe, (_l === null ? t.memoizedState : _l.next) === null && (t = t.alternate, w.H = t !== null && t.memoizedState !== null ? eb : P1), e;
    }
    function ku(e) {
      if (e !== null && typeof e == "object") {
        if (typeof e.then == "function") return Mf(e);
        if (e.$$typeof === wa) return nt(e);
      }
      throw Error("An unsupported type was passed to use(): " + String(e));
    }
    function Nn(e) {
      var t = null, n = Oe.updateQueue;
      if (n !== null && (t = n.memoCache), t == null) {
        var i = Oe.alternate;
        i !== null && (i = i.updateQueue, i !== null && (i = i.memoCache, i != null && (t = {
          data: i.data.map(function(o) {
            return o.slice();
          }),
          index: 0
        })));
      }
      if (t == null && (t = { data: [], index: 0 }), n === null && (n = Rf(), Oe.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0 || Wy)
        for (n = t.data[t.index] = Array(e), i = 0; i < e; i++)
          n[i] = v1;
      else
        n.length !== e && console.error(
          "Expected a constant size argument for each invocation of useMemoCache. The previous cache was allocated with size %s but size %s was requested.",
          n.length,
          e
        );
      return t.index++, n;
    }
    function Hn(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    function Xo(e, t, n) {
      var i = al();
      if (n !== void 0) {
        var o = n(t);
        if (xr) {
          St(!0);
          try {
            n(t);
          } finally {
            St(!1);
          }
        }
      } else o = t;
      return i.memoizedState = i.baseState = o, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: o
      }, i.queue = e, e = e.dispatch = h1.bind(
        null,
        Oe,
        e
      ), [i.memoizedState, e];
    }
    function Uc(e) {
      var t = ot();
      return Ui(t, zt, e);
    }
    function Ui(e, t, n) {
      var i = e.queue;
      if (i === null)
        throw Error(
          "Should have a queue. You are likely calling Hooks conditionally, which is not allowed. (https://react.dev/link/invalid-hook-call)"
        );
      i.lastRenderedReducer = n;
      var o = e.baseQueue, s = i.pending;
      if (s !== null) {
        if (o !== null) {
          var d = o.next;
          o.next = s.next, s.next = d;
        }
        t.baseQueue !== o && console.error(
          "Internal error: Expected work-in-progress queue to be a clone. This is a bug in React."
        ), t.baseQueue = o = s, i.pending = null;
      }
      if (s = e.baseState, o === null) e.memoizedState = s;
      else {
        t = o.next;
        var h = d = null, v = null, S = t, _ = !1;
        do {
          var M = S.lane & -536870913;
          if (M !== S.lane ? (we & M) === M : (ro & M) === M) {
            var A = S.revertLane;
            if (A === 0)
              v !== null && (v = v.next = {
                lane: 0,
                revertLane: 0,
                gesture: null,
                action: S.action,
                hasEagerState: S.hasEagerState,
                eagerState: S.eagerState,
                next: null
              }), M === _r && (_ = !0);
            else if ((ro & A) === A) {
              S = S.next, A === _r && (_ = !0);
              continue;
            } else
              M = {
                lane: 0,
                revertLane: S.revertLane,
                gesture: null,
                action: S.action,
                hasEagerState: S.hasEagerState,
                eagerState: S.eagerState,
                next: null
              }, v === null ? (h = v = M, d = s) : v = v.next = M, Oe.lanes |= A, Ls |= A;
            M = S.action, xr && n(s, M), s = S.hasEagerState ? S.eagerState : n(s, M);
          } else
            A = {
              lane: M,
              revertLane: S.revertLane,
              gesture: S.gesture,
              action: S.action,
              hasEagerState: S.hasEagerState,
              eagerState: S.eagerState,
              next: null
            }, v === null ? (h = v = A, d = s) : v = v.next = A, Oe.lanes |= M, Ls |= M;
          S = S.next;
        } while (S !== null && S !== t);
        if (v === null ? d = s : v.next = h, !Zn(s, e.memoizedState) && (Rl = !0, _ && (n = Wh, n !== null)))
          throw n;
        e.memoizedState = s, e.baseState = d, e.baseQueue = v, i.lastRenderedState = s;
      }
      return o === null && (i.lanes = 0), [e.memoizedState, i.dispatch];
    }
    function xc(e) {
      var t = ot(), n = t.queue;
      if (n === null)
        throw Error(
          "Should have a queue. You are likely calling Hooks conditionally, which is not allowed. (https://react.dev/link/invalid-hook-call)"
        );
      n.lastRenderedReducer = e;
      var i = n.dispatch, o = n.pending, s = t.memoizedState;
      if (o !== null) {
        n.pending = null;
        var d = o = o.next;
        do
          s = e(s, d.action), d = d.next;
        while (d !== o);
        Zn(s, t.memoizedState) || (Rl = !0), t.memoizedState = s, t.baseQueue === null && (t.baseState = s), n.lastRenderedState = s;
      }
      return [s, i];
    }
    function Lo(e, t, n) {
      var i = Oe, o = al();
      if (Qe) {
        if (n === void 0)
          throw Error(
            "Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering."
          );
        var s = n();
        tm || s === n() || (console.error(
          "The result of getServerSnapshot should be cached to avoid an infinite loop"
        ), tm = !0);
      } else {
        if (s = t(), tm || (n = t(), Zn(s, n) || (console.error(
          "The result of getSnapshot should be cached to avoid an infinite loop"
        ), tm = !0)), Ot === null)
          throw Error(
            "Expected a work-in-progress root. This is a bug in React. Please file an issue."
          );
        (we & 127) !== 0 || tp(i, t, s);
      }
      return o.memoizedState = s, n = { value: s, getSnapshot: t }, o.queue = n, Bc(
        xi.bind(null, i, n, e),
        [e]
      ), i.flags |= 2048, iu(
        Nu | $n,
        { destroy: void 0 },
        lp.bind(
          null,
          i,
          n,
          s,
          t
        ),
        null
      ), s;
    }
    function Nc(e, t, n) {
      var i = Oe, o = ot(), s = Qe;
      if (s) {
        if (n === void 0)
          throw Error(
            "Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering."
          );
        n = n();
      } else if (n = t(), !tm) {
        var d = t();
        Zn(n, d) || (console.error(
          "The result of getSnapshot should be cached to avoid an infinite loop"
        ), tm = !0);
      }
      (d = !Zn(
        (zt || o).memoizedState,
        n
      )) && (o.memoizedState = n, Rl = !0), o = o.queue;
      var h = xi.bind(null, i, o, e);
      if (fl(2048, $n, h, [e]), o.getSnapshot !== t || d || _l !== null && _l.memoizedState.tag & Nu) {
        if (i.flags |= 2048, iu(
          Nu | $n,
          { destroy: void 0 },
          lp.bind(
            null,
            i,
            o,
            n,
            t
          ),
          null
        ), Ot === null)
          throw Error(
            "Expected a work-in-progress root. This is a bug in React. Please file an issue."
          );
        s || (ro & 127) !== 0 || tp(i, t, n);
      }
      return n;
    }
    function tp(e, t, n) {
      e.flags |= 16384, e = { getSnapshot: t, value: n }, t = Oe.updateQueue, t === null ? (t = Rf(), Oe.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
    }
    function lp(e, t, n, i) {
      t.value = n, t.getSnapshot = i, Ni(t) && np(e);
    }
    function xi(e, t, n) {
      return n(function() {
        Ni(t) && (eu(2, "updateSyncExternalStore()", e), np(e));
      });
    }
    function Ni(e) {
      var t = e.getSnapshot;
      e = e.value;
      try {
        var n = t();
        return !Zn(e, n);
      } catch {
        return !0;
      }
    }
    function np(e) {
      var t = Xl(e, 2);
      t !== null && Ae(t, e, 2);
    }
    function Od(e) {
      var t = al();
      if (typeof e == "function") {
        var n = e;
        if (e = n(), xr) {
          St(!0);
          try {
            n();
          } finally {
            St(!1);
          }
        }
      }
      return t.memoizedState = t.baseState = e, t.queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Hn,
        lastRenderedState: e
      }, t;
    }
    function Hi(e) {
      e = Od(e);
      var t = e.queue, n = Ud.bind(null, Oe, t);
      return t.dispatch = n, [e.memoizedState, n];
    }
    function Hc(e) {
      var t = al();
      t.memoizedState = t.baseState = e;
      var n = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = n, t = qf.bind(
        null,
        Oe,
        !0,
        n
      ), n.dispatch = t, [e, t];
    }
    function Cf(e, t) {
      var n = ot();
      return Vo(n, zt, e, t);
    }
    function Vo(e, t, n, i) {
      return e.baseState = n, Ui(
        e,
        zt,
        typeof i == "function" ? i : Hn
      );
    }
    function Uf(e, t) {
      var n = ot();
      return zt !== null ? Vo(n, zt, e, t) : (n.baseState = e, [e, n.queue.dispatch]);
    }
    function Z0(e, t, n, i, o) {
      if (El(e))
        throw Error("Cannot update form state while rendering.");
      if (e = t.action, e !== null) {
        var s = {
          payload: o,
          action: e,
          next: null,
          isTransition: !0,
          status: "pending",
          value: null,
          reason: null,
          listeners: [],
          then: function(d) {
            s.listeners.push(d);
          }
        };
        w.T !== null ? n(!0) : s.isTransition = !1, i(s), n = t.pending, n === null ? (s.next = t.pending = s, Bi(t, s)) : (s.next = n.next, t.pending = n.next = s);
      }
    }
    function Bi(e, t) {
      var n = t.action, i = t.payload, o = e.state;
      if (t.isTransition) {
        var s = w.T, d = {};
        d._updatedFibers = /* @__PURE__ */ new Set(), w.T = d;
        try {
          var h = n(o, i), v = w.S;
          v !== null && v(d, h), ap(e, t, h);
        } catch (S) {
          xf(e, t, S);
        } finally {
          s !== null && d.types !== null && (s.types !== null && s.types !== d.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), s.types = d.types), w.T = s, s === null && d._updatedFibers && (e = d._updatedFibers.size, d._updatedFibers.clear(), 10 < e && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          ));
        }
      } else
        try {
          d = n(o, i), ap(e, t, d);
        } catch (S) {
          xf(e, t, S);
        }
    }
    function ap(e, t, n) {
      n !== null && typeof n == "object" && typeof n.then == "function" ? (w.asyncTransitions++, n.then(qc, qc), n.then(
        function(i) {
          Wu(e, t, i);
        },
        function(i) {
          return xf(e, t, i);
        }
      ), t.isTransition || console.error(
        "An async function with useActionState was called outside of a transition. This is likely not what you intended (for example, isPending will not update correctly). Either call the returned function inside startTransition, or pass it to an `action` or `formAction` prop."
      )) : Wu(e, t, n);
    }
    function Wu(e, t, n) {
      t.status = "fulfilled", t.value = n, Dd(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Bi(e, n)));
    }
    function xf(e, t, n) {
      var i = e.pending;
      if (e.pending = null, i !== null) {
        i = i.next;
        do
          t.status = "rejected", t.reason = n, Dd(t), t = t.next;
        while (t !== i);
      }
      e.action = null;
    }
    function Dd(e) {
      e = e.listeners;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
    function Fu(e, t) {
      return t;
    }
    function Bn(e, t) {
      if (Qe) {
        var n = Ot.formState;
        if (n !== null) {
          e: {
            var i = Oe;
            if (Qe) {
              if (qt) {
                t: {
                  for (var o = qt, s = Cu; o.nodeType !== 8; ) {
                    if (!s) {
                      o = null;
                      break t;
                    }
                    if (o = Xn(
                      o.nextSibling
                    ), o === null) {
                      o = null;
                      break t;
                    }
                  }
                  s = o.data, o = s === Ab || s === B2 ? o : null;
                }
                if (o) {
                  qt = Xn(
                    o.nextSibling
                  ), i = o.data === Ab;
                  break e;
                }
              }
              ta(i);
            }
            i = !1;
          }
          i && (t = n[0]);
        }
      }
      return n = al(), n.memoizedState = n.baseState = t, i = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Fu,
        lastRenderedState: t
      }, n.queue = i, n = Ud.bind(
        null,
        Oe,
        i
      ), i.dispatch = n, i = Od(!1), s = qf.bind(
        null,
        Oe,
        !1,
        i.queue
      ), i = al(), o = {
        state: t,
        dispatch: null,
        action: e,
        pending: null
      }, i.queue = o, n = Z0.bind(
        null,
        Oe,
        o,
        s,
        n
      ), o.dispatch = n, i.memoizedState = e, [t, n, !1];
    }
    function qi(e) {
      var t = ot();
      return _d(t, zt, e);
    }
    function _d(e, t, n) {
      if (t = Ui(
        e,
        t,
        Fu
      )[0], e = Uc(Hn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
        try {
          var i = Mf(t);
        } catch (d) {
          throw d === Fh ? dv : d;
        }
      else i = t;
      t = ot();
      var o = t.queue, s = o.dispatch;
      return n !== t.memoizedState && (Oe.flags |= 2048, iu(
        Nu | $n,
        { destroy: void 0 },
        up.bind(null, o, n),
        null
      )), [i, s, e];
    }
    function up(e, t) {
      e.action = t;
    }
    function ji(e) {
      var t = ot(), n = zt;
      if (n !== null)
        return _d(t, n, e);
      ot(), t = t.memoizedState, n = ot();
      var i = n.queue.dispatch;
      return n.memoizedState = e, [t, i, !1];
    }
    function iu(e, t, n, i) {
      return e = { tag: e, create: n, deps: i, inst: t, next: null }, t = Oe.updateQueue, t === null && (t = Rf(), Oe.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (i = n.next, n.next = e, e.next = i, t.lastEffect = e), e;
    }
    function Rd(e) {
      var t = al();
      return e = { current: e }, t.memoizedState = e;
    }
    function wi(e, t, n, i) {
      var o = al();
      Oe.flags |= e, o.memoizedState = iu(
        Nu | t,
        { destroy: void 0 },
        n,
        i === void 0 ? null : i
      );
    }
    function fl(e, t, n, i) {
      var o = ot();
      i = i === void 0 ? null : i;
      var s = o.memoizedState.inst;
      zt !== null && i !== null && Pm(i, zt.memoizedState.deps) ? o.memoizedState = iu(t, s, n, i) : (Oe.flags |= e, o.memoizedState = iu(
        Nu | t,
        s,
        n,
        i
      ));
    }
    function Bc(e, t) {
      (Oe.mode & si) !== Ee ? wi(276826112, $n, e, t) : wi(8390656, $n, e, t);
    }
    function J0(e) {
      Oe.flags |= 4;
      var t = Oe.updateQueue;
      if (t === null)
        t = Rf(), Oe.updateQueue = t, t.events = [e];
      else {
        var n = t.events;
        n === null ? t.events = [e] : n.push(e);
      }
    }
    function Nf(e) {
      var t = al(), n = { impl: e };
      return t.memoizedState = n, function() {
        if ((Ie & Yl) !== $l)
          throw Error(
            "A function wrapped in useEffectEvent can't be called during rendering."
          );
        return n.impl.apply(void 0, arguments);
      };
    }
    function Qo(e) {
      var t = ot().memoizedState;
      return J0({ ref: t, nextImpl: e }), function() {
        if ((Ie & Yl) !== $l)
          throw Error(
            "A function wrapped in useEffectEvent can't be called during rendering."
          );
        return t.impl.apply(void 0, arguments);
      };
    }
    function ln(e, t) {
      var n = 4194308;
      return (Oe.mode & si) !== Ee && (n |= 134217728), wi(n, Va, e, t);
    }
    function qn(e, t) {
      if (typeof t == "function") {
        e = e();
        var n = t(e);
        return function() {
          typeof n == "function" ? n() : t(null);
        };
      }
      if (t != null)
        return t.hasOwnProperty("current") || console.error(
          "Expected useImperativeHandle() first argument to either be a ref callback or React.createRef() object. Instead received: %s.",
          "an object with keys {" + Object.keys(t).join(", ") + "}"
        ), e = e(), t.current = e, function() {
          t.current = null;
        };
    }
    function cu(e, t, n) {
      typeof t != "function" && console.error(
        "Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.",
        t !== null ? typeof t : "null"
      ), n = n != null ? n.concat([e]) : null;
      var i = 4194308;
      (Oe.mode & si) !== Ee && (i |= 134217728), wi(
        i,
        Va,
        qn.bind(null, t, e),
        n
      );
    }
    function Zo(e, t, n) {
      typeof t != "function" && console.error(
        "Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.",
        t !== null ? typeof t : "null"
      ), n = n != null ? n.concat([e]) : null, fl(
        4,
        Va,
        qn.bind(null, t, e),
        n
      );
    }
    function Md(e, t) {
      return al().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    }
    function Ma(e, t) {
      var n = ot();
      t = t === void 0 ? null : t;
      var i = n.memoizedState;
      return t !== null && Pm(t, i[1]) ? i[0] : (n.memoizedState = [e, t], e);
    }
    function nn(e, t) {
      var n = al();
      t = t === void 0 ? null : t;
      var i = e();
      if (xr) {
        St(!0);
        try {
          e();
        } finally {
          St(!1);
        }
      }
      return n.memoizedState = [i, t], i;
    }
    function xt(e, t) {
      var n = ot();
      t = t === void 0 ? null : t;
      var i = n.memoizedState;
      if (t !== null && Pm(t, i[1]))
        return i[0];
      if (i = e(), xr) {
        St(!0);
        try {
          e();
        } finally {
          St(!1);
        }
      }
      return n.memoizedState = [i, t], i;
    }
    function Jo(e, t) {
      var n = al();
      return st(n, e, t);
    }
    function ou(e, t) {
      var n = ot();
      return Pt(
        n,
        zt.memoizedState,
        e,
        t
      );
    }
    function Ce(e, t) {
      var n = ot();
      return zt === null ? st(n, e, t) : Pt(
        n,
        zt.memoizedState,
        e,
        t
      );
    }
    function st(e, t, n) {
      return n === void 0 || (ro & 1073741824) !== 0 && (we & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n, e = es(), Oe.lanes |= e, Ls |= e, n);
    }
    function Pt(e, t, n, i) {
      return Zn(n, t) ? n : Ph.current !== null ? (e = st(e, n, i), Zn(e, t) || (Rl = !0), e) : (ro & 42) === 0 || (ro & 1073741824) !== 0 && (we & 261930) === 0 ? (Rl = !0, e.memoizedState = n) : (e = es(), Oe.lanes |= e, Ls |= e, t);
    }
    function qc() {
      w.asyncTransitions--;
    }
    function jc(e, t, n, i, o) {
      var s = ut.p;
      ut.p = s !== 0 && s < jl ? s : jl;
      var d = w.T, h = {};
      h._updatedFibers = /* @__PURE__ */ new Set(), w.T = h, qf(e, !1, t, n);
      try {
        var v = o(), S = w.S;
        if (S !== null && S(h, v), v !== null && typeof v == "object" && typeof v.then == "function") {
          w.asyncTransitions++, v.then(qc, qc);
          var _ = Sd(
            v,
            i
          );
          wc(
            e,
            t,
            _,
            Vl(e)
          );
        } else
          wc(
            e,
            t,
            i,
            Vl(e)
          );
      } catch (M) {
        wc(
          e,
          t,
          { then: function() {
          }, status: "rejected", reason: M },
          Vl(e)
        );
      } finally {
        ut.p = s, d !== null && h.types !== null && (d.types !== null && d.types !== h.types && console.error(
          "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
        ), d.types = h.types), w.T = d, d === null && h._updatedFibers && (e = h._updatedFibers.size, h._updatedFibers.clear(), 10 < e && console.warn(
          "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
        ));
      }
    }
    function Iu(e, t, n, i) {
      if (e.tag !== 5)
        throw Error(
          "Expected the form instance to be a HostComponent. This is a bug in React."
        );
      var o = Hf(e).queue;
      V0(e), jc(
        e,
        o,
        t,
        Vr,
        n === null ? Re : function() {
          return Ko(e), n(i);
        }
      );
    }
    function Hf(e) {
      var t = e.memoizedState;
      if (t !== null) return t;
      t = {
        memoizedState: Vr,
        baseState: Vr,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Hn,
          lastRenderedState: Vr
        },
        next: null
      };
      var n = {};
      return t.next = {
        memoizedState: n,
        baseState: n,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Hn,
          lastRenderedState: n
        },
        next: null
      }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
    }
    function Ko(e) {
      w.T === null && console.error(
        "requestFormReset was called outside a transition or action. To fix, move to an action, or wrap with startTransition."
      );
      var t = Hf(e);
      t.next === null && (t = e.alternate.memoizedState), wc(
        e,
        t.next.queue,
        {},
        Vl(e)
      );
    }
    function Yi() {
      var e = Od(!1);
      return e = jc.bind(
        null,
        Oe,
        e.queue,
        !0,
        !1
      ), al().memoizedState = e, [!1, e];
    }
    function K0() {
      var e = Uc(Hn)[0], t = ot().memoizedState;
      return [
        typeof e == "boolean" ? e : Mf(e),
        t
      ];
    }
    function Yt() {
      var e = xc(Hn)[0], t = ot().memoizedState;
      return [
        typeof e == "boolean" ? e : Mf(e),
        t
      ];
    }
    function Pu() {
      return nt(d0);
    }
    function Bf() {
      var e = al(), t = Ot.identifierPrefix;
      if (Qe) {
        var n = io, i = uo;
        n = (i & ~(1 << 32 - ql(i) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = gv++, 0 < n && (t += "H" + n.toString(32)), t += "_";
      } else
        n = BT++, t = "_" + t + "r_" + n.toString(32) + "_";
      return e.memoizedState = t;
    }
    function Cd() {
      return al().memoizedState = $0.bind(
        null,
        Oe
      );
    }
    function $0(e, t) {
      for (var n = e.return; n !== null; ) {
        switch (n.tag) {
          case 24:
          case 3:
            var i = Vl(n), o = sl(i), s = nu(n, o, i);
            s !== null && (eu(i, "refresh()", e), Ae(s, n, i), ia(s, n, i)), e = vd(), t != null && s !== null && console.error(
              "The seed argument is not enabled outside experimental channels."
            ), o.payload = { cache: e };
            return;
        }
        n = n.return;
      }
    }
    function h1(e, t, n) {
      var i = arguments;
      typeof i[3] == "function" && console.error(
        "State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect()."
      ), i = Vl(e);
      var o = {
        lane: i,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      El(e) ? Kt(t, o) : (o = bc(e, t, o, i), o !== null && (eu(i, "dispatch()", e), Ae(o, e, i), jf(o, t, i)));
    }
    function Ud(e, t, n) {
      var i = arguments;
      typeof i[3] == "function" && console.error(
        "State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect()."
      ), i = Vl(e), wc(e, t, n, i) && eu(i, "setState()", e);
    }
    function wc(e, t, n, i) {
      var o = {
        lane: i,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      if (El(e)) Kt(t, o);
      else {
        var s = e.alternate;
        if (e.lanes === 0 && (s === null || s.lanes === 0) && (s = t.lastRenderedReducer, s !== null)) {
          var d = w.H;
          w.H = ri;
          try {
            var h = t.lastRenderedState, v = s(h, n);
            if (o.hasEagerState = !0, o.eagerState = v, Zn(v, h))
              return xo(e, t, o, 0), Ot === null && dd(), !1;
          } catch {
          } finally {
            w.H = d;
          }
        }
        if (n = bc(e, t, o, i), n !== null)
          return Ae(n, e, i), jf(n, t, i), !0;
      }
      return !1;
    }
    function qf(e, t, n, i) {
      if (w.T === null && _r === 0 && console.error(
        "An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition."
      ), i = {
        lane: 2,
        revertLane: Jp(),
        gesture: null,
        action: i,
        hasEagerState: !1,
        eagerState: null,
        next: null
      }, El(e)) {
        if (t)
          throw Error("Cannot update optimistic state while rendering.");
        console.error("Cannot call startTransition while rendering.");
      } else
        t = bc(
          e,
          n,
          i,
          2
        ), t !== null && (eu(2, "setOptimistic()", e), Ae(t, e, 2));
    }
    function El(e) {
      var t = e.alternate;
      return e === Oe || t !== null && t === Oe;
    }
    function Kt(e, t) {
      lm = yv = !0;
      var n = e.pending;
      n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
    }
    function jf(e, t, n) {
      if ((n & 4194048) !== 0) {
        var i = t.lanes;
        i &= e.pendingLanes, n |= i, t.lanes = n, E0(e, n);
      }
    }
    function Yc(e) {
      if (e !== null && typeof e != "function") {
        var t = String(e);
        c2.has(t) || (c2.add(t), console.error(
          "Expected the last optional `callback` argument to be a function. Instead received: %s.",
          e
        ));
      }
    }
    function $o(e, t, n, i) {
      var o = e.memoizedState, s = n(i, o);
      if (e.mode & zn) {
        St(!0);
        try {
          s = n(i, o);
        } finally {
          St(!1);
        }
      }
      s === void 0 && (t = me(t) || "Component", n2.has(t) || (n2.add(t), console.error(
        "%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.",
        t
      ))), o = s == null ? o : Be({}, o, s), e.memoizedState = o, e.lanes === 0 && (e.updateQueue.baseState = o);
    }
    function xd(e, t, n, i, o, s, d) {
      var h = e.stateNode;
      if (typeof h.shouldComponentUpdate == "function") {
        if (n = h.shouldComponentUpdate(
          i,
          s,
          d
        ), e.mode & zn) {
          St(!0);
          try {
            n = h.shouldComponentUpdate(
              i,
              s,
              d
            );
          } finally {
            St(!1);
          }
        }
        return n === void 0 && console.error(
          "%s.shouldComponentUpdate(): Returned undefined instead of a boolean value. Make sure to return true or false.",
          me(t) || "Component"
        ), n;
      }
      return t.prototype && t.prototype.isPureReactComponent ? !Uo(n, i) || !Uo(o, s) : !0;
    }
    function su(e, t, n, i) {
      var o = t.state;
      typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, i), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, i), t.state !== o && (e = ie(e) || "Component", IS.has(e) || (IS.add(e), console.error(
        "%s.componentWillReceiveProps(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.",
        e
      )), tb.enqueueReplaceState(
        t,
        t.state,
        null
      ));
    }
    function fu(e, t) {
      var n = t;
      if ("ref" in t) {
        n = {};
        for (var i in t)
          i !== "ref" && (n[i] = t[i]);
      }
      if (e = e.defaultProps) {
        n === t && (n = Be({}, n));
        for (var o in e)
          n[o] === void 0 && (n[o] = e[o]);
      }
      return n;
    }
    function Nd(e) {
      x1(e), console.warn(
        `%s

%s
`,
        nm ? "An error occurred in the <" + nm + "> component." : "An error occurred in one of your React components.",
        `Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.`
      );
    }
    function Hd(e) {
      var t = nm ? "The above error occurred in the <" + nm + "> component." : "The above error occurred in one of your React components.", n = "React will try to recreate this component tree from scratch using the error boundary you provided, " + ((lb || "Anonymous") + ".");
      if (typeof e == "object" && e !== null && typeof e.environmentName == "string") {
        var i = e.environmentName;
        e = [
          `%o

%s

%s
`,
          e,
          t,
          n
        ].slice(0), typeof e[0] == "string" ? e.splice(
          0,
          1,
          V2 + " " + e[0],
          Q2,
          Lv + i + Lv,
          Z2
        ) : e.splice(
          0,
          0,
          V2,
          Q2,
          Lv + i + Lv,
          Z2
        ), e.unshift(console), i = lA.apply(console.error, e), i();
      } else
        console.error(
          `%o

%s

%s
`,
          e,
          t,
          n
        );
    }
    function ip(e) {
      x1(e);
    }
    function wf(e, t) {
      try {
        nm = t.source ? ie(t.source) : null, lb = null;
        var n = t.value;
        if (w.actQueue !== null)
          w.thrownErrors.push(n);
        else {
          var i = e.onUncaughtError;
          i(n, { componentStack: t.stack });
        }
      } catch (o) {
        setTimeout(function() {
          throw o;
        });
      }
    }
    function cp(e, t, n) {
      try {
        nm = n.source ? ie(n.source) : null, lb = ie(t);
        var i = e.onCaughtError;
        i(n.value, {
          componentStack: n.stack,
          errorBoundary: t.tag === 1 ? t.stateNode : null
        });
      } catch (o) {
        setTimeout(function() {
          throw o;
        });
      }
    }
    function Bd(e, t, n) {
      return n = sl(n), n.tag = k1, n.payload = { element: null }, n.callback = function() {
        le(t.source, wf, e, t);
      }, n;
    }
    function qd(e) {
      return e = sl(e), e.tag = k1, e;
    }
    function jd(e, t, n, i) {
      var o = n.type.getDerivedStateFromError;
      if (typeof o == "function") {
        var s = i.value;
        e.payload = function() {
          return o(s);
        }, e.callback = function() {
          Sc(n), le(
            i.source,
            cp,
            t,
            n,
            i
          );
        };
      }
      var d = n.stateNode;
      d !== null && typeof d.componentDidCatch == "function" && (e.callback = function() {
        Sc(n), le(
          i.source,
          cp,
          t,
          n,
          i
        ), typeof o != "function" && (Qs === null ? Qs = /* @__PURE__ */ new Set([this]) : Qs.add(this)), UT(this, i), typeof o == "function" || (n.lanes & 2) === 0 && console.error(
          "%s: Error boundaries should implement getDerivedStateFromError(). In that method, return a state update to display an error message or fallback UI.",
          ie(n) || "Unknown"
        );
      });
    }
    function op(e, t, n, i, o) {
      if (n.flags |= 32768, Au && us(e, o), i !== null && typeof i == "object" && typeof i.then == "function") {
        if (t = n.alternate, t !== null && za(
          t,
          n,
          o,
          !0
        ), Qe && (tc = !0), n = La.current, n !== null) {
          switch (n.tag) {
            case 31:
            case 13:
              return xu === null ? ls() : n.alternate === null && kt === yo && (kt = Sv), n.flags &= -257, n.flags |= 65536, n.lanes = o, i === hv ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([i]) : t.add(i), nh(e, i, o)), !1;
            case 22:
              return n.flags |= 65536, i === hv ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
                transitions: null,
                markerInstances: null,
                retryQueue: /* @__PURE__ */ new Set([i])
              }, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([i]) : n.add(i)), nh(e, i, o)), !1;
          }
          throw Error(
            "Unexpected Suspense handler tag (" + n.tag + "). This is a bug in React."
          );
        }
        return nh(e, i, o), ls(), !1;
      }
      if (Qe)
        return tc = !0, t = La.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = o, i !== w1 && gf(
          Fl(
            Error(
              "There was an error while hydrating but React was able to recover by instead client rendering from the nearest Suspense boundary.",
              { cause: i }
            ),
            n
          )
        )) : (i !== w1 && gf(
          Fl(
            Error(
              "There was an error while hydrating but React was able to recover by instead client rendering the entire root.",
              { cause: i }
            ),
            n
          )
        ), e = e.current.alternate, e.flags |= 65536, o &= -o, e.lanes |= o, i = Fl(i, n), o = Bd(
          e.stateNode,
          i,
          o
        ), Af(e, o), kt !== Gs && (kt = Nr)), !1;
      var s = Fl(
        Error(
          "There was an error during concurrent rendering but React was able to recover by instead synchronously rendering the entire root.",
          { cause: i }
        ),
        n
      );
      if (n0 === null ? n0 = [s] : n0.push(s), kt !== Gs && (kt = Nr), t === null) return !0;
      i = Fl(i, n), n = t;
      do {
        switch (n.tag) {
          case 3:
            return n.flags |= 65536, e = o & -o, n.lanes |= e, e = Bd(
              n.stateNode,
              i,
              e
            ), Af(n, e), !1;
          case 1:
            if (t = n.type, s = n.stateNode, (n.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || s !== null && typeof s.componentDidCatch == "function" && (Qs === null || !Qs.has(s))))
              return n.flags |= 65536, o &= -o, n.lanes |= o, o = qd(o), jd(
                o,
                e,
                n,
                i
              ), Af(n, o), !1;
        }
        n = n.return;
      } while (n !== null);
      return !1;
    }
    function Tl(e, t, n, i) {
      t.child = e === null ? XS(t, null, n, i) : Ur(
        t,
        e.child,
        n,
        i
      );
    }
    function k0(e, t, n, i, o) {
      n = n.render;
      var s = t.ref;
      if ("ref" in i) {
        var d = {};
        for (var h in i)
          h !== "ref" && (d[h] = i[h]);
      } else d = i;
      return Ri(t), i = ep(
        e,
        t,
        n,
        d,
        s,
        o
      ), h = Cc(), e !== null && !Rl ? (_f(e, t, o), Ca(e, t, o)) : (Qe && h && pd(t), t.flags |= 1, Tl(e, t, i, o), t.child);
    }
    function sp(e, t, n, i, o) {
      if (e === null) {
        var s = n.type;
        return typeof s == "function" && !Xm(s) && s.defaultProps === void 0 && n.compare === null ? (n = Ai(s), t.tag = 15, t.type = n, ko(t, s), fp(
          e,
          t,
          n,
          i,
          o
        )) : (e = Ec(
          n.type,
          null,
          i,
          t,
          t.mode,
          o
        ), e.ref = t.ref, e.return = t, t.child = e);
      }
      if (s = e.child, !Ld(e, o)) {
        var d = s.memoizedProps;
        if (n = n.compare, n = n !== null ? n : Uo, n(d, i) && e.ref === t.ref)
          return Ca(
            e,
            t,
            o
          );
      }
      return t.flags |= 1, e = Pa(s, i), e.ref = t.ref, e.return = t, t.child = e;
    }
    function fp(e, t, n, i, o) {
      if (e !== null) {
        var s = e.memoizedProps;
        if (Uo(s, i) && e.ref === t.ref && t.type === e.type)
          if (Rl = !1, t.pendingProps = i = s, Ld(e, o))
            (e.flags & 131072) !== 0 && (Rl = !0);
          else
            return t.lanes = e.lanes, Ca(e, t, o);
      }
      return mp(
        e,
        t,
        n,
        i,
        o
      );
    }
    function rp(e, t, n, i) {
      var o = i.children, s = e !== null ? e.memoizedState : null;
      if (e === null && t.stateNode === null && (t.stateNode = {
        _visibility: xy,
        _pendingMarkers: null,
        _retryCache: null,
        _transitions: null
      }), i.mode === "hidden") {
        if ((t.flags & 128) !== 0) {
          if (s = s !== null ? s.baseLanes | n : n, e !== null) {
            for (i = t.child = e.child, o = 0; i !== null; )
              o = o | i.lanes | i.childLanes, i = i.sibling;
            i = o & ~s;
          } else i = 0, t.child = null;
          return dp(
            e,
            t,
            s,
            n,
            i
          );
        }
        if ((n & 536870912) !== 0)
          t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && jo(
            t,
            s !== null ? s.cachePool : null
          ), s !== null ? Ad(t, s) : Ku(t), zd(t);
        else
          return i = t.lanes = 536870912, dp(
            e,
            t,
            s !== null ? s.baseLanes | n : n,
            n,
            i
          );
      } else
        s !== null ? (jo(t, s.cachePool), Ad(t, s), uu(t), t.memoizedState = null) : (e !== null && jo(t, null), Ku(t), uu(t));
      return Tl(e, t, o, n), t.child;
    }
    function Gc(e, t) {
      return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
        _visibility: xy,
        _pendingMarkers: null,
        _retryCache: null,
        _transitions: null
      }), t.sibling;
    }
    function dp(e, t, n, i, o) {
      var s = Ju();
      return s = s === null ? null : {
        parent: Ol._currentValue,
        pool: s
      }, t.memoizedState = {
        baseLanes: n,
        cachePool: s
      }, e !== null && jo(t, null), Ku(t), zd(t), e !== null && za(e, t, i, !0), t.childLanes = o, null;
    }
    function Yf(e, t) {
      var n = t.hidden;
      return n !== void 0 && console.error(
        `<Activity> doesn't accept a hidden prop. Use mode="hidden" instead.
- <Activity %s>
+ <Activity %s>`,
        n === !0 ? "hidden" : n === !1 ? "hidden={false}" : "hidden={...}",
        n ? 'mode="hidden"' : 'mode="visible"'
      ), t = Xf(
        { mode: t.mode, children: t.children },
        e.mode
      ), t.ref = e.ref, e.child = t, t.return = e, t;
    }
    function hp(e, t, n) {
      return Ur(t, e.child, null, n), e = Yf(
        t,
        t.pendingProps
      ), e.flags |= 2, Sl(t), t.memoizedState = null, e;
    }
    function W0(e, t, n) {
      var i = t.pendingProps, o = (t.flags & 128) !== 0;
      if (t.flags &= -129, e === null) {
        if (Qe) {
          if (i.mode === "hidden")
            return e = Yf(t, i), t.lanes = 536870912, Gc(null, e);
          if (Ra(t), (e = qt) ? (n = rt(
            e,
            Cu
          ), n = n !== null && n.data === Yr ? n : null, n !== null && (i = {
            dehydrated: n,
            treeContext: G0(),
            retryLane: 536870912,
            hydrationErrors: null
          }, t.memoizedState = i, i = Vm(n), i.return = t, t.child = i, hn = t, qt = null)) : n = null, n === null)
            throw Ll(t, e), ta(t);
          return t.lanes = 536870912, null;
        }
        return Yf(t, i);
      }
      var s = e.memoizedState;
      if (s !== null) {
        var d = s.dehydrated;
        if (Ra(t), o)
          if (t.flags & 256)
            t.flags &= -257, t = hp(
              e,
              t,
              n
            );
          else if (t.memoizedState !== null)
            t.child = e.child, t.flags |= 128, t = null;
          else
            throw Error(
              "Client rendering an Activity suspended it again. This is a bug in React."
            );
        else if (L0(), (n & 536870912) !== 0 && ts(t), Rl || za(
          e,
          t,
          n,
          !1
        ), o = (n & e.childLanes) !== 0, Rl || o) {
          if (i = Ot, i !== null && (d = T0(
            i,
            n
          ), d !== 0 && d !== s.retryLane))
            throw s.retryLane = d, Xl(e, d), Ae(i, e, d), nb;
          ls(), t = hp(
            e,
            t,
            n
          );
        } else
          e = s.treeContext, qt = Xn(
            d.nextSibling
          ), hn = t, Qe = !0, Hs = null, tc = !1, Xa = null, Cu = !1, e !== null && X0(t, e), t = Yf(t, i), t.flags |= 4096;
        return t;
      }
      return s = e.child, i = { mode: i.mode, children: i.children }, (n & 536870912) !== 0 && (n & e.lanes) !== 0 && ts(t), e = Pa(s, i), e.ref = t.ref, t.child = e, e.return = t, e;
    }
    function Gf(e, t) {
      var n = t.ref;
      if (n === null)
        e !== null && e.ref !== null && (t.flags |= 4194816);
      else {
        if (typeof n != "function" && typeof n != "object")
          throw Error(
            "Expected ref to be a function, an object returned by React.createRef(), or undefined/null."
          );
        (e === null || e.ref !== n) && (t.flags |= 4194816);
      }
    }
    function mp(e, t, n, i, o) {
      if (n.prototype && typeof n.prototype.render == "function") {
        var s = me(n) || "Unknown";
        o2[s] || (console.error(
          "The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.",
          s,
          s
        ), o2[s] = !0);
      }
      return t.mode & zn && fi.recordLegacyContextWarning(
        t,
        null
      ), e === null && (ko(t, t.type), n.contextTypes && (s = me(n) || "Unknown", f2[s] || (f2[s] = !0, console.error(
        "%s uses the legacy contextTypes API which was removed in React 19. Use React.createContext() with React.useContext() instead. (https://react.dev/link/legacy-context)",
        s
      )))), Ri(t), n = ep(
        e,
        t,
        n,
        i,
        void 0,
        o
      ), i = Cc(), e !== null && !Rl ? (_f(e, t, o), Ca(e, t, o)) : (Qe && i && pd(t), t.flags |= 1, Tl(e, t, n, o), t.child);
    }
    function pp(e, t, n, i, o, s) {
      return Ri(t), mo = -1, Wy = e !== null && e.type !== t.type, t.updateQueue = null, n = Of(
        t,
        i,
        n,
        o
      ), It(e, t), i = Cc(), e !== null && !Rl ? (_f(e, t, s), Ca(e, t, s)) : (Qe && i && pd(t), t.flags |= 1, Tl(e, t, n, s), t.child);
    }
    function Xc(e, t, n, i, o) {
      switch (ee(t)) {
        case !1:
          var s = t.stateNode, d = new t.type(
            t.memoizedProps,
            s.context
          ).state;
          s.updater.enqueueSetState(s, d, null);
          break;
        case !0:
          t.flags |= 128, t.flags |= 65536, s = Error("Simulated error coming from DevTools");
          var h = o & -o;
          if (t.lanes |= h, d = Ot, d === null)
            throw Error(
              "Expected a work-in-progress root. This is a bug in React. Please file an issue."
            );
          h = qd(h), jd(
            h,
            d,
            t,
            Fl(s, t)
          ), Af(t, h);
      }
      if (Ri(t), t.stateNode === null) {
        if (d = Ns, s = n.contextType, "contextType" in n && s !== null && (s === void 0 || s.$$typeof !== wa) && !i2.has(n) && (i2.add(n), h = s === void 0 ? " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file." : typeof s != "object" ? " However, it is set to a " + typeof s + "." : s.$$typeof === Oh ? " Did you accidentally pass the Context.Consumer instead?" : " However, it is set to an object with keys {" + Object.keys(s).join(", ") + "}.", console.error(
          "%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s",
          me(n) || "Component",
          h
        )), typeof s == "object" && s !== null && (d = nt(s)), s = new n(i, d), t.mode & zn) {
          St(!0);
          try {
            s = new n(i, d);
          } finally {
            St(!1);
          }
        }
        if (d = t.memoizedState = s.state !== null && s.state !== void 0 ? s.state : null, s.updater = tb, t.stateNode = s, s._reactInternals = t, s._reactInternalInstance = FS, typeof n.getDerivedStateFromProps == "function" && d === null && (d = me(n) || "Component", PS.has(d) || (PS.add(d), console.error(
          "`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.",
          d,
          s.state === null ? "null" : "undefined",
          d
        ))), typeof n.getDerivedStateFromProps == "function" || typeof s.getSnapshotBeforeUpdate == "function") {
          var v = h = d = null;
          if (typeof s.componentWillMount == "function" && s.componentWillMount.__suppressDeprecationWarning !== !0 ? d = "componentWillMount" : typeof s.UNSAFE_componentWillMount == "function" && (d = "UNSAFE_componentWillMount"), typeof s.componentWillReceiveProps == "function" && s.componentWillReceiveProps.__suppressDeprecationWarning !== !0 ? h = "componentWillReceiveProps" : typeof s.UNSAFE_componentWillReceiveProps == "function" && (h = "UNSAFE_componentWillReceiveProps"), typeof s.componentWillUpdate == "function" && s.componentWillUpdate.__suppressDeprecationWarning !== !0 ? v = "componentWillUpdate" : typeof s.UNSAFE_componentWillUpdate == "function" && (v = "UNSAFE_componentWillUpdate"), d !== null || h !== null || v !== null) {
            s = me(n) || "Component";
            var S = typeof n.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
            t2.has(s) || (t2.add(s), console.error(
              `Unsafe legacy lifecycles will not be called for components using new component APIs.

%s uses %s but also contains the following legacy lifecycles:%s%s%s

The above lifecycles should be removed. Learn more about this warning here:
https://react.dev/link/unsafe-component-lifecycles`,
              s,
              S,
              d !== null ? `
  ` + d : "",
              h !== null ? `
  ` + h : "",
              v !== null ? `
  ` + v : ""
            ));
          }
        }
        s = t.stateNode, d = me(n) || "Component", s.render || (n.prototype && typeof n.prototype.render == "function" ? console.error(
          "No `render` method found on the %s instance: did you accidentally return an object from the constructor?",
          d
        ) : console.error(
          "No `render` method found on the %s instance: you may have forgotten to define `render`.",
          d
        )), !s.getInitialState || s.getInitialState.isReactClassApproved || s.state || console.error(
          "getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?",
          d
        ), s.getDefaultProps && !s.getDefaultProps.isReactClassApproved && console.error(
          "getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.",
          d
        ), s.contextType && console.error(
          "contextType was defined as an instance property on %s. Use a static property to define contextType instead.",
          d
        ), n.childContextTypes && !u2.has(n) && (u2.add(n), console.error(
          "%s uses the legacy childContextTypes API which was removed in React 19. Use React.createContext() instead. (https://react.dev/link/legacy-context)",
          d
        )), n.contextTypes && !a2.has(n) && (a2.add(n), console.error(
          "%s uses the legacy contextTypes API which was removed in React 19. Use React.createContext() with static contextType instead. (https://react.dev/link/legacy-context)",
          d
        )), typeof s.componentShouldUpdate == "function" && console.error(
          "%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.",
          d
        ), n.prototype && n.prototype.isPureReactComponent && typeof s.shouldComponentUpdate < "u" && console.error(
          "%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.",
          me(n) || "A pure component"
        ), typeof s.componentDidUnmount == "function" && console.error(
          "%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?",
          d
        ), typeof s.componentDidReceiveProps == "function" && console.error(
          "%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().",
          d
        ), typeof s.componentWillRecieveProps == "function" && console.error(
          "%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?",
          d
        ), typeof s.UNSAFE_componentWillRecieveProps == "function" && console.error(
          "%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?",
          d
        ), h = s.props !== i, s.props !== void 0 && h && console.error(
          "When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.",
          d
        ), s.defaultProps && console.error(
          "Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.",
          d,
          d
        ), typeof s.getSnapshotBeforeUpdate != "function" || typeof s.componentDidUpdate == "function" || e2.has(n) || (e2.add(n), console.error(
          "%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.",
          me(n)
        )), typeof s.getDerivedStateFromProps == "function" && console.error(
          "%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.",
          d
        ), typeof s.getDerivedStateFromError == "function" && console.error(
          "%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.",
          d
        ), typeof n.getSnapshotBeforeUpdate == "function" && console.error(
          "%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.",
          d
        ), (h = s.state) && (typeof h != "object" || il(h)) && console.error("%s.state: must be set to an object or null", d), typeof s.getChildContext == "function" && typeof n.childContextTypes != "object" && console.error(
          "%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().",
          d
        ), s = t.stateNode, s.props = i, s.state = t.memoizedState, s.refs = {}, Le(t), d = n.contextType, s.context = typeof d == "object" && d !== null ? nt(d) : Ns, s.state === i && (d = me(n) || "Component", l2.has(d) || (l2.add(d), console.error(
          "%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.",
          d
        ))), t.mode & zn && fi.recordLegacyContextWarning(
          t,
          s
        ), fi.recordUnsafeLifecycleWarnings(
          t,
          s
        ), s.state = t.memoizedState, d = n.getDerivedStateFromProps, typeof d == "function" && ($o(
          t,
          n,
          d,
          i
        ), s.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof s.getSnapshotBeforeUpdate == "function" || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (d = s.state, typeof s.componentWillMount == "function" && s.componentWillMount(), typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount(), d !== s.state && (console.error(
          "%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.",
          ie(t) || "Component"
        ), tb.enqueueReplaceState(
          s,
          s.state,
          null
        )), au(t, i, s, o), Yo(), s.state = t.memoizedState), typeof s.componentDidMount == "function" && (t.flags |= 4194308), (t.mode & si) !== Ee && (t.flags |= 134217728), s = !0;
      } else if (e === null) {
        s = t.stateNode;
        var _ = t.memoizedProps;
        h = fu(n, _), s.props = h;
        var M = s.context;
        v = n.contextType, d = Ns, typeof v == "object" && v !== null && (d = nt(v)), S = n.getDerivedStateFromProps, v = typeof S == "function" || typeof s.getSnapshotBeforeUpdate == "function", _ = t.pendingProps !== _, v || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (_ || M !== d) && su(
          t,
          s,
          i,
          d
        ), Ys = !1;
        var A = t.memoizedState;
        s.state = A, au(t, i, s, o), Yo(), M = t.memoizedState, _ || A !== M || Ys ? (typeof S == "function" && ($o(
          t,
          n,
          S,
          i
        ), M = t.memoizedState), (h = Ys || xd(
          t,
          n,
          h,
          i,
          A,
          M,
          d
        )) ? (v || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (typeof s.componentWillMount == "function" && s.componentWillMount(), typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount()), typeof s.componentDidMount == "function" && (t.flags |= 4194308), (t.mode & si) !== Ee && (t.flags |= 134217728)) : (typeof s.componentDidMount == "function" && (t.flags |= 4194308), (t.mode & si) !== Ee && (t.flags |= 134217728), t.memoizedProps = i, t.memoizedState = M), s.props = i, s.state = M, s.context = d, s = h) : (typeof s.componentDidMount == "function" && (t.flags |= 4194308), (t.mode & si) !== Ee && (t.flags |= 134217728), s = !1);
      } else {
        s = t.stateNode, lu(e, t), d = t.memoizedProps, v = fu(n, d), s.props = v, S = t.pendingProps, A = s.context, M = n.contextType, h = Ns, typeof M == "object" && M !== null && (h = nt(M)), _ = n.getDerivedStateFromProps, (M = typeof _ == "function" || typeof s.getSnapshotBeforeUpdate == "function") || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (d !== S || A !== h) && su(
          t,
          s,
          i,
          h
        ), Ys = !1, A = t.memoizedState, s.state = A, au(t, i, s, o), Yo();
        var q = t.memoizedState;
        d !== S || A !== q || Ys || e !== null && e.dependencies !== null && Bo(e.dependencies) ? (typeof _ == "function" && ($o(
          t,
          n,
          _,
          i
        ), q = t.memoizedState), (v = Ys || xd(
          t,
          n,
          v,
          i,
          A,
          q,
          h
        ) || e !== null && e.dependencies !== null && Bo(e.dependencies)) ? (M || typeof s.UNSAFE_componentWillUpdate != "function" && typeof s.componentWillUpdate != "function" || (typeof s.componentWillUpdate == "function" && s.componentWillUpdate(i, q, h), typeof s.UNSAFE_componentWillUpdate == "function" && s.UNSAFE_componentWillUpdate(
          i,
          q,
          h
        )), typeof s.componentDidUpdate == "function" && (t.flags |= 4), typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof s.componentDidUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof s.getSnapshotBeforeUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), t.memoizedProps = i, t.memoizedState = q), s.props = i, s.state = q, s.context = h, s = v) : (typeof s.componentDidUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof s.getSnapshotBeforeUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), s = !1);
      }
      if (h = s, Gf(e, t), d = (t.flags & 128) !== 0, h || d) {
        if (h = t.stateNode, tf(t), d && typeof n.getDerivedStateFromError != "function")
          n = null, Jn = -1;
        else if (n = _S(h), t.mode & zn) {
          St(!0);
          try {
            _S(h);
          } finally {
            St(!1);
          }
        }
        t.flags |= 1, e !== null && d ? (t.child = Ur(
          t,
          e.child,
          null,
          o
        ), t.child = Ur(
          t,
          null,
          n,
          o
        )) : Tl(e, t, n, o), t.memoizedState = h.state, e = t.child;
      } else
        e = Ca(
          e,
          t,
          o
        );
      return o = t.stateNode, s && o.props !== i && (am || console.error(
        "It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.",
        ie(t) || "a component"
      ), am = !0), e;
    }
    function yp(e, t, n, i) {
      return Di(), t.flags |= 256, Tl(e, t, n, i), t.child;
    }
    function ko(e, t) {
      t && t.childContextTypes && console.error(
        `childContextTypes cannot be defined on a function component.
  %s.childContextTypes = ...`,
        t.displayName || t.name || "Component"
      ), typeof t.getDerivedStateFromProps == "function" && (e = me(t) || "Unknown", r2[e] || (console.error(
        "%s: Function components do not support getDerivedStateFromProps.",
        e
      ), r2[e] = !0)), typeof t.contextType == "object" && t.contextType !== null && (t = me(t) || "Unknown", s2[t] || (console.error(
        "%s: Function components do not support contextType.",
        t
      ), s2[t] = !0));
    }
    function Wo(e) {
      return { baseLanes: e, cachePool: km() };
    }
    function wd(e, t, n) {
      return e = e !== null ? e.childLanes & ~n : 0, t && (e |= ma), e;
    }
    function Yd(e, t, n) {
      var i, o = t.pendingProps;
      G(t) && (t.flags |= 128);
      var s = !1, d = (t.flags & 128) !== 0;
      if ((i = d) || (i = e !== null && e.memoizedState === null ? !1 : (ml.current & $y) !== 0), i && (s = !0, t.flags &= -129), i = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
        if (Qe) {
          if (s ? tn(t) : uu(t), (e = qt) ? (n = rt(
            e,
            Cu
          ), n = n !== null && n.data !== Yr ? n : null, n !== null && (i = {
            dehydrated: n,
            treeContext: G0(),
            retryLane: 536870912,
            hydrationErrors: null
          }, t.memoizedState = i, i = Vm(n), i.return = t, t.child = i, hn = t, qt = null)) : n = null, n === null)
            throw Ll(t, e), ta(t);
          return kp(n) ? t.lanes = 32 : t.lanes = 536870912, null;
        }
        var h = o.children;
        if (o = o.fallback, s) {
          uu(t);
          var v = t.mode;
          return h = Xf(
            { mode: "hidden", children: h },
            v
          ), o = Tc(
            o,
            v,
            n,
            null
          ), h.return = t, o.return = t, h.sibling = o, t.child = h, o = t.child, o.memoizedState = Wo(n), o.childLanes = wd(
            e,
            i,
            n
          ), t.memoizedState = ab, Gc(
            null,
            o
          );
        }
        return tn(t), gp(
          t,
          h
        );
      }
      var S = e.memoizedState;
      if (S !== null) {
        var _ = S.dehydrated;
        if (_ !== null) {
          if (d)
            t.flags & 256 ? (tn(t), t.flags &= -257, t = Gd(
              e,
              t,
              n
            )) : t.memoizedState !== null ? (uu(t), t.child = e.child, t.flags |= 128, t = null) : (uu(t), h = o.fallback, v = t.mode, o = Xf(
              {
                mode: "visible",
                children: o.children
              },
              v
            ), h = Tc(
              h,
              v,
              n,
              null
            ), h.flags |= 2, o.return = t, h.return = t, o.sibling = h, t.child = o, Ur(
              t,
              e.child,
              null,
              n
            ), o = t.child, o.memoizedState = Wo(n), o.childLanes = wd(
              e,
              i,
              n
            ), t.memoizedState = ab, t = Gc(
              null,
              o
            ));
          else if (tn(t), L0(), (n & 536870912) !== 0 && ts(t), kp(
            _
          )) {
            if (i = _.nextSibling && _.nextSibling.dataset, i) {
              h = i.dgst;
              var M = i.msg;
              v = i.stck;
              var A = i.cstck;
            }
            s = M, i = h, o = v, _ = A, h = s, v = _, h = Error(h || "The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering."), h.stack = o || "", h.digest = i, i = v === void 0 ? null : v, o = {
              value: h,
              source: null,
              stack: i
            }, typeof i == "string" && j1.set(
              h,
              o
            ), gf(o), t = Gd(
              e,
              t,
              n
            );
          } else if (Rl || za(
            e,
            t,
            n,
            !1
          ), i = (n & e.childLanes) !== 0, Rl || i) {
            if (i = Ot, i !== null && (o = T0(
              i,
              n
            ), o !== 0 && o !== S.retryLane))
              throw S.retryLane = o, Xl(
                e,
                o
              ), Ae(
                i,
                e,
                o
              ), nb;
            ur(
              _
            ) || ls(), t = Gd(
              e,
              t,
              n
            );
          } else
            ur(
              _
            ) ? (t.flags |= 192, t.child = e.child, t = null) : (e = S.treeContext, qt = Xn(
              _.nextSibling
            ), hn = t, Qe = !0, Hs = null, tc = !1, Xa = null, Cu = !1, e !== null && X0(t, e), t = gp(
              t,
              o.children
            ), t.flags |= 4096);
          return t;
        }
      }
      return s ? (uu(t), h = o.fallback, v = t.mode, A = e.child, _ = A.sibling, o = Pa(
        A,
        {
          mode: "hidden",
          children: o.children
        }
      ), o.subtreeFlags = A.subtreeFlags & 65011712, _ !== null ? h = Pa(
        _,
        h
      ) : (h = Tc(
        h,
        v,
        n,
        null
      ), h.flags |= 2), h.return = t, o.return = t, o.sibling = h, t.child = o, Gc(null, o), o = t.child, h = e.child.memoizedState, h === null ? h = Wo(n) : (v = h.cachePool, v !== null ? (A = Ol._currentValue, v = v.parent !== A ? { parent: A, pool: A } : v) : v = km(), h = {
        baseLanes: h.baseLanes | n,
        cachePool: v
      }), o.memoizedState = h, o.childLanes = wd(
        e,
        i,
        n
      ), t.memoizedState = ab, Gc(
        e.child,
        o
      )) : (S !== null && (n & 62914560) === n && (n & e.lanes) !== 0 && ts(t), tn(t), n = e.child, e = n.sibling, n = Pa(n, {
        mode: "visible",
        children: o.children
      }), n.return = t, n.sibling = null, e !== null && (i = t.deletions, i === null ? (t.deletions = [e], t.flags |= 16) : i.push(e)), t.child = n, t.memoizedState = null, n);
    }
    function gp(e, t) {
      return t = Xf(
        { mode: "visible", children: t },
        e.mode
      ), t.return = e, e.child = t;
    }
    function Xf(e, t) {
      return e = Te(22, e, null, t), e.lanes = 0, e;
    }
    function Gd(e, t, n) {
      return Ur(t, e.child, null, n), e = gp(
        t,
        t.pendingProps.children
      ), e.flags |= 2, t.memoizedState = null, e;
    }
    function vp(e, t, n) {
      e.lanes |= t;
      var i = e.alternate;
      i !== null && (i.lanes |= t), gd(
        e.return,
        t,
        n
      );
    }
    function Xd(e, t, n, i, o, s) {
      var d = e.memoizedState;
      d === null ? e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: i,
        tail: n,
        tailMode: o,
        treeForkCount: s
      } : (d.isBackwards = t, d.rendering = null, d.renderingStartTime = 0, d.last = i, d.tail = n, d.tailMode = o, d.treeForkCount = s);
    }
    function bp(e, t, n) {
      var i = t.pendingProps, o = i.revealOrder, s = i.tail, d = i.children, h = ml.current;
      if ((i = (h & $y) !== 0) ? (h = h & em | $y, t.flags |= 128) : h &= em, Me(ml, h, t), h = o ?? "null", o !== "forwards" && o !== "unstable_legacy-backwards" && o !== "together" && o !== "independent" && !d2[h])
        if (d2[h] = !0, o == null)
          console.error(
            'The default for the <SuspenseList revealOrder="..."> prop is changing. To be future compatible you must explictly specify either "independent" (the current default), "together", "forwards" or "legacy_unstable-backwards".'
          );
        else if (o === "backwards")
          console.error(
            'The rendering order of <SuspenseList revealOrder="backwards"> is changing. To be future compatible you must specify revealOrder="legacy_unstable-backwards" instead.'
          );
        else if (typeof o == "string")
          switch (o.toLowerCase()) {
            case "together":
            case "forwards":
            case "backwards":
            case "independent":
              console.error(
                '"%s" is not a valid value for revealOrder on <SuspenseList />. Use lowercase "%s" instead.',
                o,
                o.toLowerCase()
              );
              break;
            case "forward":
            case "backward":
              console.error(
                '"%s" is not a valid value for revealOrder on <SuspenseList />. React uses the -s suffix in the spelling. Use "%ss" instead.',
                o,
                o.toLowerCase()
              );
              break;
            default:
              console.error(
                '"%s" is not a supported revealOrder on <SuspenseList />. Did you mean "independent", "together", "forwards" or "backwards"?',
                o
              );
          }
        else
          console.error(
            '%s is not a supported value for revealOrder on <SuspenseList />. Did you mean "independent", "together", "forwards" or "backwards"?',
            o
          );
      h = s ?? "null", bv[h] || (s == null ? (o === "forwards" || o === "backwards" || o === "unstable_legacy-backwards") && (bv[h] = !0, console.error(
        'The default for the <SuspenseList tail="..."> prop is changing. To be future compatible you must explictly specify either "visible" (the current default), "collapsed" or "hidden".'
      )) : s !== "visible" && s !== "collapsed" && s !== "hidden" ? (bv[h] = !0, console.error(
        '"%s" is not a supported value for tail on <SuspenseList />. Did you mean "visible", "collapsed" or "hidden"?',
        s
      )) : o !== "forwards" && o !== "backwards" && o !== "unstable_legacy-backwards" && (bv[h] = !0, console.error(
        '<SuspenseList tail="%s" /> is only valid if revealOrder is "forwards" or "backwards". Did you mean to specify revealOrder="forwards"?',
        s
      )));
      e: if ((o === "forwards" || o === "backwards" || o === "unstable_legacy-backwards") && d !== void 0 && d !== null && d !== !1)
        if (il(d)) {
          for (h = 0; h < d.length; h++)
            if (!Et(
              d[h],
              h
            ))
              break e;
        } else if (h = I(d), typeof h == "function") {
          if (h = h.call(d))
            for (var v = h.next(), S = 0; !v.done; v = h.next()) {
              if (!Et(v.value, S)) break e;
              S++;
            }
        } else
          console.error(
            'A single row was passed to a <SuspenseList revealOrder="%s" />. This is not useful since it needs multiple rows. Did you mean to pass multiple children or an array?',
            o
          );
      if (Tl(e, t, d, n), Qe ? (Oi(), d = Ny) : d = 0, !i && e !== null && (e.flags & 128) !== 0)
        e: for (e = t.child; e !== null; ) {
          if (e.tag === 13)
            e.memoizedState !== null && vp(e, n, t);
          else if (e.tag === 19)
            vp(e, n, t);
          else if (e.child !== null) {
            e.child.return = e, e = e.child;
            continue;
          }
          if (e === t) break e;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === t)
              break e;
            e = e.return;
          }
          e.sibling.return = e.return, e = e.sibling;
        }
      switch (o) {
        case "forwards":
          for (n = t.child, o = null; n !== null; )
            e = n.alternate, e !== null && Mc(e) === null && (o = n), n = n.sibling;
          n = o, n === null ? (o = t.child, t.child = null) : (o = n.sibling, n.sibling = null), Xd(
            t,
            !1,
            o,
            n,
            s,
            d
          );
          break;
        case "backwards":
        case "unstable_legacy-backwards":
          for (n = null, o = t.child, t.child = null; o !== null; ) {
            if (e = o.alternate, e !== null && Mc(e) === null) {
              t.child = o;
              break;
            }
            e = o.sibling, o.sibling = n, n = o, o = e;
          }
          Xd(
            t,
            !0,
            n,
            null,
            s,
            d
          );
          break;
        case "together":
          Xd(
            t,
            !1,
            null,
            null,
            void 0,
            d
          );
          break;
        default:
          t.memoizedState = null;
      }
      return t.child;
    }
    function Ca(e, t, n) {
      if (e !== null && (t.dependencies = e.dependencies), Jn = -1, Ls |= t.lanes, (n & t.childLanes) === 0)
        if (e !== null) {
          if (za(
            e,
            t,
            n,
            !1
          ), (n & t.childLanes) === 0)
            return null;
        } else return null;
      if (e !== null && t.child !== e.child)
        throw Error("Resuming work not yet implemented.");
      if (t.child !== null) {
        for (e = t.child, n = Pa(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
          e = e.sibling, n = n.sibling = Pa(e, e.pendingProps), n.return = t;
        n.sibling = null;
      }
      return t.child;
    }
    function Ld(e, t) {
      return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && Bo(e)));
    }
    function F0(e, t, n) {
      switch (t.tag) {
        case 3:
          Vt(
            t,
            t.stateNode.containerInfo
          ), la(
            t,
            Ol,
            e.memoizedState.cache
          ), Di();
          break;
        case 27:
        case 5:
          W(t);
          break;
        case 4:
          Vt(
            t,
            t.stateNode.containerInfo
          );
          break;
        case 10:
          la(
            t,
            t.type,
            t.memoizedProps.value
          );
          break;
        case 12:
          (n & t.childLanes) !== 0 && (t.flags |= 4), t.flags |= 2048;
          var i = t.stateNode;
          i.effectDuration = -0, i.passiveEffectDuration = -0;
          break;
        case 31:
          if (t.memoizedState !== null)
            return t.flags |= 128, Ra(t), null;
          break;
        case 13:
          if (i = t.memoizedState, i !== null)
            return i.dehydrated !== null ? (tn(t), t.flags |= 128, null) : (n & t.child.childLanes) !== 0 ? Yd(
              e,
              t,
              n
            ) : (tn(t), e = Ca(
              e,
              t,
              n
            ), e !== null ? e.sibling : null);
          tn(t);
          break;
        case 19:
          var o = (e.flags & 128) !== 0;
          if (i = (n & t.childLanes) !== 0, i || (za(
            e,
            t,
            n,
            !1
          ), i = (n & t.childLanes) !== 0), o) {
            if (i)
              return bp(
                e,
                t,
                n
              );
            t.flags |= 128;
          }
          if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), Me(
            ml,
            ml.current,
            t
          ), i) break;
          return null;
        case 22:
          return t.lanes = 0, rp(
            e,
            t,
            n,
            t.pendingProps
          );
        case 24:
          la(
            t,
            Ol,
            e.memoizedState.cache
          );
      }
      return Ca(e, t, n);
    }
    function Lf(e, t, n) {
      if (t._debugNeedsRemount && e !== null) {
        n = Ec(
          t.type,
          t.key,
          t.pendingProps,
          t._debugOwner || null,
          t.mode,
          t.lanes
        ), n._debugStack = t._debugStack, n._debugTask = t._debugTask;
        var i = t.return;
        if (i === null) throw Error("Cannot swap the root fiber.");
        if (e.alternate = null, t.alternate = null, n.index = t.index, n.sibling = t.sibling, n.return = t.return, n.ref = t.ref, n._debugInfo = t._debugInfo, t === i.child)
          i.child = n;
        else {
          var o = i.child;
          if (o === null)
            throw Error("Expected parent to have a child.");
          for (; o.sibling !== t; )
            if (o = o.sibling, o === null)
              throw Error("Expected to find the previous sibling.");
          o.sibling = n;
        }
        return t = i.deletions, t === null ? (i.deletions = [e], i.flags |= 16) : t.push(e), n.flags |= 2, n;
      }
      if (e !== null)
        if (e.memoizedProps !== t.pendingProps || t.type !== e.type)
          Rl = !0;
        else {
          if (!Ld(e, n) && (t.flags & 128) === 0)
            return Rl = !1, F0(
              e,
              t,
              n
            );
          Rl = (e.flags & 131072) !== 0;
        }
      else
        Rl = !1, (i = Qe) && (Oi(), i = (t.flags & 1048576) !== 0), i && (i = t.index, Oi(), Qm(t, Ny, i));
      switch (t.lanes = 0, t.tag) {
        case 16:
          e: if (i = t.pendingProps, e = xn(t.elementType), t.type = e, typeof e == "function")
            Xm(e) ? (i = fu(
              e,
              i
            ), t.tag = 1, t.type = e = Ai(e), t = Xc(
              null,
              t,
              e,
              i,
              n
            )) : (t.tag = 0, ko(t, e), t.type = e = Ai(e), t = mp(
              null,
              t,
              e,
              i,
              n
            ));
          else {
            if (e != null) {
              if (o = e.$$typeof, o === bs) {
                t.tag = 11, t.type = e = hd(e), t = k0(
                  null,
                  t,
                  e,
                  i,
                  n
                );
                break e;
              } else if (o === pr) {
                t.tag = 14, t = sp(
                  null,
                  t,
                  e,
                  i,
                  n
                );
                break e;
              }
            }
            throw t = "", e !== null && typeof e == "object" && e.$$typeof === Ql && (t = " Did you wrap a component in React.lazy() more than once?"), n = me(e) || e, Error(
              "Element type is invalid. Received a promise that resolves to: " + n + ". Lazy element type must resolve to a class or function." + t
            );
          }
          return t;
        case 0:
          return mp(
            e,
            t,
            t.type,
            t.pendingProps,
            n
          );
        case 1:
          return i = t.type, o = fu(
            i,
            t.pendingProps
          ), Xc(
            e,
            t,
            i,
            o,
            n
          );
        case 3:
          e: {
            if (Vt(
              t,
              t.stateNode.containerInfo
            ), e === null)
              throw Error(
                "Should have a current fiber. This is a bug in React."
              );
            i = t.pendingProps;
            var s = t.memoizedState;
            o = s.element, lu(e, t), au(t, i, null, n);
            var d = t.memoizedState;
            if (i = d.cache, la(t, Ol, i), i !== s.cache && Vu(
              t,
              [Ol],
              n,
              !0
            ), Yo(), i = d.element, s.isDehydrated)
              if (s = {
                element: i,
                isDehydrated: !1,
                cache: d.cache
              }, t.updateQueue.baseState = s, t.memoizedState = s, t.flags & 256) {
                t = yp(
                  e,
                  t,
                  i,
                  n
                );
                break e;
              } else if (i !== o) {
                o = Fl(
                  Error(
                    "This root received an early update, before anything was able hydrate. Switched the entire root to client rendering."
                  ),
                  t
                ), gf(o), t = yp(
                  e,
                  t,
                  i,
                  n
                );
                break e;
              } else {
                switch (e = t.stateNode.containerInfo, e.nodeType) {
                  case 9:
                    e = e.body;
                    break;
                  default:
                    e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
                }
                for (qt = Xn(e.firstChild), hn = t, Qe = !0, Hs = null, tc = !1, Xa = null, Cu = !0, n = XS(
                  t,
                  null,
                  i,
                  n
                ), t.child = n; n; )
                  n.flags = n.flags & -3 | 4096, n = n.sibling;
              }
            else {
              if (Di(), i === o) {
                t = Ca(
                  e,
                  t,
                  n
                );
                break e;
              }
              Tl(
                e,
                t,
                i,
                n
              );
            }
            t = t.child;
          }
          return t;
        case 26:
          return Gf(e, t), e === null ? (n = Pp(
            t.type,
            null,
            t.pendingProps,
            null
          )) ? t.memoizedState = n : Qe || (n = t.type, e = t.pendingProps, i = yl(
            Ln.current
          ), i = nr(
            i
          ).createElement(n), i[Ht] = t, i[dn] = e, Nt(i, n, e), Wt(i), t.stateNode = i) : t.memoizedState = Pp(
            t.type,
            e.memoizedProps,
            t.pendingProps,
            e.memoizedState
          ), null;
        case 27:
          return W(t), e === null && Qe && (i = yl(Ln.current), o = K(), i = t.stateNode = ui(
            t.type,
            t.pendingProps,
            i,
            o,
            !1
          ), tc || (o = En(
            i,
            t.type,
            t.pendingProps,
            o
          ), o !== null && (Ac(t, 0).serverProps = o)), hn = t, Cu = !0, o = qt, $i(t.type) ? (_b = o, qt = Xn(
            i.firstChild
          )) : qt = o), Tl(
            e,
            t,
            t.pendingProps.children,
            n
          ), Gf(e, t), e === null && (t.flags |= 4194304), t.child;
        case 5:
          return e === null && Qe && (s = K(), i = cf(
            t.type,
            s.ancestorInfo
          ), o = qt, (d = !o) || (d = _g(
            o,
            t.type,
            t.pendingProps,
            Cu
          ), d !== null ? (t.stateNode = d, tc || (s = En(
            d,
            t.type,
            t.pendingProps,
            s
          ), s !== null && (Ac(t, 0).serverProps = s)), hn = t, qt = Xn(
            d.firstChild
          ), Cu = !1, s = !0) : s = !1, d = !s), d && (i && Ll(t, o), ta(t))), W(t), o = t.type, s = t.pendingProps, d = e !== null ? e.memoizedProps : null, i = s.children, fs(o, s) ? i = null : d !== null && fs(o, d) && (t.flags |= 32), t.memoizedState !== null && (o = ep(
            e,
            t,
            Df,
            null,
            null,
            n
          ), d0._currentValue = o), Gf(e, t), Tl(
            e,
            t,
            i,
            n
          ), t.child;
        case 6:
          return e === null && Qe && (n = t.pendingProps, e = K(), i = e.ancestorInfo.current, n = i != null ? of(
            n,
            i.tag,
            e.ancestorInfo.implicitRootScope
          ) : !0, e = qt, (i = !e) || (i = Rg(
            e,
            t.pendingProps,
            Cu
          ), i !== null ? (t.stateNode = i, hn = t, qt = null, i = !0) : i = !1, i = !i), i && (n && Ll(t, e), ta(t))), null;
        case 13:
          return Yd(e, t, n);
        case 4:
          return Vt(
            t,
            t.stateNode.containerInfo
          ), i = t.pendingProps, e === null ? t.child = Ur(
            t,
            null,
            i,
            n
          ) : Tl(
            e,
            t,
            i,
            n
          ), t.child;
        case 11:
          return k0(
            e,
            t,
            t.type,
            t.pendingProps,
            n
          );
        case 7:
          return Tl(
            e,
            t,
            t.pendingProps,
            n
          ), t.child;
        case 8:
          return Tl(
            e,
            t,
            t.pendingProps.children,
            n
          ), t.child;
        case 12:
          return t.flags |= 4, t.flags |= 2048, i = t.stateNode, i.effectDuration = -0, i.passiveEffectDuration = -0, Tl(
            e,
            t,
            t.pendingProps.children,
            n
          ), t.child;
        case 10:
          return i = t.type, o = t.pendingProps, s = o.value, "value" in o || h2 || (h2 = !0, console.error(
            "The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?"
          )), la(t, i, s), Tl(
            e,
            t,
            o.children,
            n
          ), t.child;
        case 9:
          return o = t.type._context, i = t.pendingProps.children, typeof i != "function" && console.error(
            "A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it."
          ), Ri(t), o = nt(o), i = Z1(
            i,
            o,
            void 0
          ), t.flags |= 1, Tl(
            e,
            t,
            i,
            n
          ), t.child;
        case 14:
          return sp(
            e,
            t,
            t.type,
            t.pendingProps,
            n
          );
        case 15:
          return fp(
            e,
            t,
            t.type,
            t.pendingProps,
            n
          );
        case 19:
          return bp(
            e,
            t,
            n
          );
        case 31:
          return W0(e, t, n);
        case 22:
          return rp(
            e,
            t,
            n,
            t.pendingProps
          );
        case 24:
          return Ri(t), i = nt(Ol), e === null ? (o = Ju(), o === null && (o = Ot, s = vd(), o.pooledCache = s, Oc(s), s !== null && (o.pooledCacheLanes |= n), o = s), t.memoizedState = {
            parent: i,
            cache: o
          }, Le(t), la(t, Ol, o)) : ((e.lanes & n) !== 0 && (lu(e, t), au(t, null, null, n), Yo()), o = e.memoizedState, s = t.memoizedState, o.parent !== i ? (o = {
            parent: i,
            cache: i
          }, t.memoizedState = o, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = o), la(t, Ol, i)) : (i = s.cache, la(t, Ol, i), i !== o.cache && Vu(
            t,
            [Ol],
            n,
            !0
          ))), Tl(
            e,
            t,
            t.pendingProps.children,
            n
          ), t.child;
        case 29:
          throw t.pendingProps;
      }
      throw Error(
        "Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue."
      );
    }
    function ru(e) {
      e.flags |= 4;
    }
    function Vd(e, t, n, i, o) {
      if ((t = (e.mode & DT) !== Ee) && (t = !1), t) {
        if (e.flags |= 16777216, (o & 335544128) === o)
          if (e.stateNode.complete) e.flags |= 8192;
          else if (jp()) e.flags |= 8192;
          else
            throw Cr = hv, K1;
      } else e.flags &= -16777217;
    }
    function I0(e, t) {
      if (t.type !== "stylesheet" || (t.state.loading & Bu) !== Lr)
        e.flags &= -16777217;
      else if (e.flags |= 16777216, !Xe(t))
        if (jp()) e.flags |= 8192;
        else
          throw Cr = hv, K1;
    }
    function Fo(e, t) {
      t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? Jr() : 536870912, e.lanes |= t, qr |= t);
    }
    function Io(e, t) {
      if (!Qe)
        switch (e.tailMode) {
          case "hidden":
            t = e.tail;
            for (var n = null; t !== null; )
              t.alternate !== null && (n = t), t = t.sibling;
            n === null ? e.tail = null : n.sibling = null;
            break;
          case "collapsed":
            n = e.tail;
            for (var i = null; n !== null; )
              n.alternate !== null && (i = n), n = n.sibling;
            i === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : i.sibling = null;
        }
    }
    function mt(e) {
      var t = e.alternate !== null && e.alternate.child === e.child, n = 0, i = 0;
      if (t)
        if ((e.mode & qe) !== Ee) {
          for (var o = e.selfBaseDuration, s = e.child; s !== null; )
            n |= s.lanes | s.childLanes, i |= s.subtreeFlags & 65011712, i |= s.flags & 65011712, o += s.treeBaseDuration, s = s.sibling;
          e.treeBaseDuration = o;
        } else
          for (o = e.child; o !== null; )
            n |= o.lanes | o.childLanes, i |= o.subtreeFlags & 65011712, i |= o.flags & 65011712, o.return = e, o = o.sibling;
      else if ((e.mode & qe) !== Ee) {
        o = e.actualDuration, s = e.selfBaseDuration;
        for (var d = e.child; d !== null; )
          n |= d.lanes | d.childLanes, i |= d.subtreeFlags, i |= d.flags, o += d.actualDuration, s += d.treeBaseDuration, d = d.sibling;
        e.actualDuration = o, e.treeBaseDuration = s;
      } else
        for (o = e.child; o !== null; )
          n |= o.lanes | o.childLanes, i |= o.subtreeFlags, i |= o.flags, o.return = e, o = o.sibling;
      return e.subtreeFlags |= i, e.childLanes = n, t;
    }
    function Sp(e, t, n) {
      var i = t.pendingProps;
      switch (yd(t), t.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return mt(t), null;
        case 1:
          return mt(t), null;
        case 3:
          return n = t.stateNode, i = null, e !== null && (i = e.memoizedState.cache), t.memoizedState.cache !== i && (t.flags |= 2048), Aa(Ol, t), C(t), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (zc(t) ? (_i(), ru(t)) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, yf())), mt(t), null;
        case 26:
          var o = t.type, s = t.memoizedState;
          return e === null ? (ru(t), s !== null ? (mt(t), I0(
            t,
            s
          )) : (mt(t), Vd(
            t,
            o,
            null,
            i,
            n
          ))) : s ? s !== e.memoizedState ? (ru(t), mt(t), I0(
            t,
            s
          )) : (mt(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== i && ru(t), mt(t), Vd(
            t,
            o,
            e,
            i,
            n
          )), null;
        case 27:
          if (ye(t), n = yl(Ln.current), o = t.type, e !== null && t.stateNode != null)
            e.memoizedProps !== i && ru(t);
          else {
            if (!i) {
              if (t.stateNode === null)
                throw Error(
                  "We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue."
                );
              return mt(t), null;
            }
            e = K(), zc(t) ? Zm(t) : (e = ui(
              o,
              i,
              n,
              e,
              !0
            ), t.stateNode = e, ru(t));
          }
          return mt(t), null;
        case 5:
          if (ye(t), o = t.type, e !== null && t.stateNode != null)
            e.memoizedProps !== i && ru(t);
          else {
            if (!i) {
              if (t.stateNode === null)
                throw Error(
                  "We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue."
                );
              return mt(t), null;
            }
            var d = K();
            if (zc(t))
              Zm(t);
            else {
              switch (s = yl(Ln.current), cf(o, d.ancestorInfo), d = d.context, s = nr(s), d) {
                case dm:
                  s = s.createElementNS(
                    Ne,
                    o
                  );
                  break;
                case Yv:
                  s = s.createElementNS(
                    _e,
                    o
                  );
                  break;
                default:
                  switch (o) {
                    case "svg":
                      s = s.createElementNS(
                        Ne,
                        o
                      );
                      break;
                    case "math":
                      s = s.createElementNS(
                        _e,
                        o
                      );
                      break;
                    case "script":
                      s = s.createElement("div"), s.innerHTML = "<script><\/script>", s = s.removeChild(
                        s.firstChild
                      );
                      break;
                    case "select":
                      s = typeof i.is == "string" ? s.createElement("select", {
                        is: i.is
                      }) : s.createElement("select"), i.multiple ? s.multiple = !0 : i.size && (s.size = i.size);
                      break;
                    default:
                      s = typeof i.is == "string" ? s.createElement(o, {
                        is: i.is
                      }) : s.createElement(o), o.indexOf("-") === -1 && (o !== o.toLowerCase() && console.error(
                        "<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.",
                        o
                      ), Object.prototype.toString.call(s) !== "[object HTMLUnknownElement]" || Vn.call(j2, o) || (j2[o] = !0, console.error(
                        "The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.",
                        o
                      )));
                  }
              }
              s[Ht] = t, s[dn] = i;
              e: for (d = t.child; d !== null; ) {
                if (d.tag === 5 || d.tag === 6)
                  s.appendChild(d.stateNode);
                else if (d.tag !== 4 && d.tag !== 27 && d.child !== null) {
                  d.child.return = d, d = d.child;
                  continue;
                }
                if (d === t) break e;
                for (; d.sibling === null; ) {
                  if (d.return === null || d.return === t)
                    break e;
                  d = d.return;
                }
                d.sibling.return = d.return, d = d.sibling;
              }
              t.stateNode = s;
              e: switch (Nt(s, o, i), o) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  i = !!i.autoFocus;
                  break e;
                case "img":
                  i = !0;
                  break e;
                default:
                  i = !1;
              }
              i && ru(t);
            }
          }
          return mt(t), Vd(
            t,
            t.type,
            e === null ? null : e.memoizedProps,
            t.pendingProps,
            n
          ), null;
        case 6:
          if (e && t.stateNode != null)
            e.memoizedProps !== i && ru(t);
          else {
            if (typeof i != "string" && t.stateNode === null)
              throw Error(
                "We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue."
              );
            if (e = yl(Ln.current), n = K(), zc(t)) {
              if (e = t.stateNode, n = t.memoizedProps, o = !tc, i = null, s = hn, s !== null)
                switch (s.tag) {
                  case 3:
                    o && (o = Ug(
                      e,
                      n,
                      i
                    ), o !== null && (Ac(t, 0).serverProps = o));
                    break;
                  case 27:
                  case 5:
                    i = s.memoizedProps, o && (o = Ug(
                      e,
                      n,
                      i
                    ), o !== null && (Ac(
                      t,
                      0
                    ).serverProps = o));
                }
              e[Ht] = t, e = !!(e.nodeValue === n || i !== null && i.suppressHydrationWarning === !0 || Kp(e.nodeValue, n)), e || ta(t, !0);
            } else
              o = n.ancestorInfo.current, o != null && of(
                i,
                o.tag,
                n.ancestorInfo.implicitRootScope
              ), e = nr(e).createTextNode(
                i
              ), e[Ht] = t, t.stateNode = e;
          }
          return mt(t), null;
        case 31:
          if (n = t.memoizedState, e === null || e.memoizedState !== null) {
            if (i = zc(t), n !== null) {
              if (e === null) {
                if (!i)
                  throw Error(
                    "A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React."
                  );
                if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e)
                  throw Error(
                    "Expected to have a hydrated activity instance. This error is likely caused by a bug in React. Please file an issue."
                  );
                e[Ht] = t, mt(t), (t.mode & qe) !== Ee && n !== null && (e = t.child, e !== null && (t.treeBaseDuration -= e.treeBaseDuration));
              } else
                _i(), Di(), (t.flags & 128) === 0 && (n = t.memoizedState = null), t.flags |= 4, mt(t), (t.mode & qe) !== Ee && n !== null && (e = t.child, e !== null && (t.treeBaseDuration -= e.treeBaseDuration));
              e = !1;
            } else
              n = yf(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
            if (!e)
              return t.flags & 256 ? (Sl(t), t) : (Sl(t), null);
            if ((t.flags & 128) !== 0)
              throw Error(
                "Client rendering an Activity suspended it again. This is a bug in React."
              );
          }
          return mt(t), null;
        case 13:
          if (i = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
            if (o = i, s = zc(t), o !== null && o.dehydrated !== null) {
              if (e === null) {
                if (!s)
                  throw Error(
                    "A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React."
                  );
                if (s = t.memoizedState, s = s !== null ? s.dehydrated : null, !s)
                  throw Error(
                    "Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue."
                  );
                s[Ht] = t, mt(t), (t.mode & qe) !== Ee && o !== null && (o = t.child, o !== null && (t.treeBaseDuration -= o.treeBaseDuration));
              } else
                _i(), Di(), (t.flags & 128) === 0 && (o = t.memoizedState = null), t.flags |= 4, mt(t), (t.mode & qe) !== Ee && o !== null && (o = t.child, o !== null && (t.treeBaseDuration -= o.treeBaseDuration));
              o = !1;
            } else
              o = yf(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = o), o = !0;
            if (!o)
              return t.flags & 256 ? (Sl(t), t) : (Sl(t), null);
          }
          return Sl(t), (t.flags & 128) !== 0 ? (t.lanes = n, (t.mode & qe) !== Ee && _c(t), t) : (n = i !== null, e = e !== null && e.memoizedState !== null, n && (i = t.child, o = null, i.alternate !== null && i.alternate.memoizedState !== null && i.alternate.memoizedState.cachePool !== null && (o = i.alternate.memoizedState.cachePool.pool), s = null, i.memoizedState !== null && i.memoizedState.cachePool !== null && (s = i.memoizedState.cachePool.pool), s !== o && (i.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Fo(t, t.updateQueue), mt(t), (t.mode & qe) !== Ee && n && (e = t.child, e !== null && (t.treeBaseDuration -= e.treeBaseDuration)), null);
        case 4:
          return C(t), e === null && Ji(
            t.stateNode.containerInfo
          ), mt(t), null;
        case 10:
          return Aa(t.type, t), mt(t), null;
        case 19:
          if (Ue(ml, t), i = t.memoizedState, i === null) return mt(t), null;
          if (o = (t.flags & 128) !== 0, s = i.rendering, s === null)
            if (o) Io(i, !1);
            else {
              if (kt !== yo || e !== null && (e.flags & 128) !== 0)
                for (e = t.child; e !== null; ) {
                  if (s = Mc(e), s !== null) {
                    for (t.flags |= 128, Io(i, !1), e = s.updateQueue, t.updateQueue = e, Fo(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null; )
                      Lm(n, e), n = n.sibling;
                    return Me(
                      ml,
                      ml.current & em | $y,
                      t
                    ), Qe && Ta(t, i.treeForkCount), t.child;
                  }
                  e = e.sibling;
                }
              i.tail !== null && zl() > Dv && (t.flags |= 128, o = !0, Io(i, !1), t.lanes = 4194304);
            }
          else {
            if (!o)
              if (e = Mc(s), e !== null) {
                if (t.flags |= 128, o = !0, e = e.updateQueue, t.updateQueue = e, Fo(t, e), Io(i, !0), i.tail === null && i.tailMode === "hidden" && !s.alternate && !Qe)
                  return mt(t), null;
              } else
                2 * zl() - i.renderingStartTime > Dv && n !== 536870912 && (t.flags |= 128, o = !0, Io(i, !1), t.lanes = 4194304);
            i.isBackwards ? (s.sibling = t.child, t.child = s) : (e = i.last, e !== null ? e.sibling = s : t.child = s, i.last = s);
          }
          return i.tail !== null ? (e = i.tail, i.rendering = e, i.tail = e.sibling, i.renderingStartTime = zl(), e.sibling = null, n = ml.current, n = o ? n & em | $y : n & em, Me(ml, n, t), Qe && Ta(t, i.treeForkCount), e) : (mt(t), null);
        case 22:
        case 23:
          return Sl(t), _a(t), i = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== i && (t.flags |= 8192) : i && (t.flags |= 8192), i ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (mt(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : mt(t), n = t.updateQueue, n !== null && Fo(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), i = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (i = t.memoizedState.cachePool.pool), i !== n && (t.flags |= 2048), e !== null && Ue(Rr, t), null;
        case 24:
          return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Aa(Ol, t), mt(t), null;
        case 25:
          return null;
        case 30:
          return null;
      }
      throw Error(
        "Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue."
      );
    }
    function P0(e, t) {
      switch (yd(t), t.tag) {
        case 1:
          return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, (t.mode & qe) !== Ee && _c(t), t) : null;
        case 3:
          return Aa(Ol, t), C(t), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
        case 26:
        case 27:
        case 5:
          return ye(t), null;
        case 31:
          if (t.memoizedState !== null) {
            if (Sl(t), t.alternate === null)
              throw Error(
                "Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue."
              );
            Di();
          }
          return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, (t.mode & qe) !== Ee && _c(t), t) : null;
        case 13:
          if (Sl(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
            if (t.alternate === null)
              throw Error(
                "Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue."
              );
            Di();
          }
          return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, (t.mode & qe) !== Ee && _c(t), t) : null;
        case 19:
          return Ue(ml, t), null;
        case 4:
          return C(t), null;
        case 10:
          return Aa(t.type, t), null;
        case 22:
        case 23:
          return Sl(t), _a(t), e !== null && Ue(Rr, t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, (t.mode & qe) !== Ee && _c(t), t) : null;
        case 24:
          return Aa(Ol, t), null;
        case 25:
          return null;
        default:
          return null;
      }
    }
    function Ep(e, t) {
      switch (yd(t), t.tag) {
        case 3:
          Aa(Ol, t), C(t);
          break;
        case 26:
        case 27:
        case 5:
          ye(t);
          break;
        case 4:
          C(t);
          break;
        case 31:
          t.memoizedState !== null && Sl(t);
          break;
        case 13:
          Sl(t);
          break;
        case 19:
          Ue(ml, t);
          break;
        case 10:
          Aa(t.type, t);
          break;
        case 22:
        case 23:
          Sl(t), _a(t), e !== null && Ue(Rr, t);
          break;
        case 24:
          Aa(Ol, t);
      }
    }
    function du(e) {
      return (e.mode & qe) !== Ee;
    }
    function eg(e, t) {
      du(e) ? (Zt(), ei(t, e), Pl()) : ei(t, e);
    }
    function Qd(e, t, n) {
      du(e) ? (Zt(), Gi(
        n,
        e,
        t
      ), Pl()) : Gi(
        n,
        e,
        t
      );
    }
    function ei(e, t) {
      try {
        var n = t.updateQueue, i = n !== null ? n.lastEffect : null;
        if (i !== null) {
          var o = i.next;
          n = o;
          do {
            if ((n.tag & e) === e && (i = void 0, (e & Kn) !== pv && (sm = !0), i = le(
              t,
              xT,
              n
            ), (e & Kn) !== pv && (sm = !1), i !== void 0 && typeof i != "function")) {
              var s = void 0;
              s = (n.tag & Va) !== 0 ? "useLayoutEffect" : (n.tag & Kn) !== 0 ? "useInsertionEffect" : "useEffect";
              var d = void 0;
              d = i === null ? " You returned null. If your effect does not require clean up, return undefined (or nothing)." : typeof i.then == "function" ? `

It looks like you wrote ` + s + `(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:

` + s + `(() => {
  async function fetchData() {
    // You can await here
    const response = await MyAPI.getData(someId);
    // ...
  }
  fetchData();
}, [someId]); // Or [] if effect doesn't need props or state

Learn more about data fetching with Hooks: https://react.dev/link/hooks-data-fetching` : " You returned: " + i, le(
                t,
                function(h, v) {
                  console.error(
                    "%s must not return anything besides a function, which is used for clean-up.%s",
                    h,
                    v
                  );
                },
                s,
                d
              );
            }
            n = n.next;
          } while (n !== o);
        }
      } catch (h) {
        xe(t, t.return, h);
      }
    }
    function Gi(e, t, n) {
      try {
        var i = t.updateQueue, o = i !== null ? i.lastEffect : null;
        if (o !== null) {
          var s = o.next;
          i = s;
          do {
            if ((i.tag & e) === e) {
              var d = i.inst, h = d.destroy;
              h !== void 0 && (d.destroy = void 0, (e & Kn) !== pv && (sm = !0), o = t, le(
                o,
                NT,
                o,
                n,
                h
              ), (e & Kn) !== pv && (sm = !1));
            }
            i = i.next;
          } while (i !== s);
        }
      } catch (v) {
        xe(t, t.return, v);
      }
    }
    function Vf(e, t) {
      du(e) ? (Zt(), ei(t, e), Pl()) : ei(t, e);
    }
    function Zd(e, t, n) {
      du(e) ? (Zt(), Gi(
        n,
        e,
        t
      ), Pl()) : Gi(
        n,
        e,
        t
      );
    }
    function Tp(e) {
      var t = e.updateQueue;
      if (t !== null) {
        var n = e.stateNode;
        e.type.defaultProps || "ref" in e.memoizedProps || am || (n.props !== e.memoizedProps && console.error(
          "Expected %s props to match memoized props before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.",
          ie(e) || "instance"
        ), n.state !== e.memoizedState && console.error(
          "Expected %s state to match memoized state before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.",
          ie(e) || "instance"
        ));
        try {
          le(
            e,
            Go,
            t,
            n
          );
        } catch (i) {
          xe(e, e.return, i);
        }
      }
    }
    function Qf(e, t, n) {
      return e.getSnapshotBeforeUpdate(t, n);
    }
    function tg(e, t) {
      var n = t.memoizedProps, i = t.memoizedState;
      t = e.stateNode, e.type.defaultProps || "ref" in e.memoizedProps || am || (t.props !== e.memoizedProps && console.error(
        "Expected %s props to match memoized props before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.",
        ie(e) || "instance"
      ), t.state !== e.memoizedState && console.error(
        "Expected %s state to match memoized state before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.",
        ie(e) || "instance"
      ));
      try {
        var o = fu(
          e.type,
          n
        ), s = le(
          e,
          Qf,
          t,
          o,
          i
        );
        n = m2, s !== void 0 || n.has(e.type) || (n.add(e.type), le(e, function() {
          console.error(
            "%s.getSnapshotBeforeUpdate(): A snapshot value (or null) must be returned. You have returned undefined.",
            ie(e)
          );
        })), t.__reactInternalSnapshotBeforeUpdate = s;
      } catch (d) {
        xe(e, e.return, d);
      }
    }
    function Jd(e, t, n) {
      n.props = fu(
        e.type,
        e.memoizedProps
      ), n.state = e.memoizedState, du(e) ? (Zt(), le(
        e,
        NS,
        e,
        t,
        n
      ), Pl()) : le(
        e,
        NS,
        e,
        t,
        n
      );
    }
    function lg(e) {
      var t = e.ref;
      if (t !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var n = e.stateNode;
            break;
          case 30:
            n = e.stateNode;
            break;
          default:
            n = e.stateNode;
        }
        if (typeof t == "function")
          if (du(e))
            try {
              Zt(), e.refCleanup = t(n);
            } finally {
              Pl();
            }
          else e.refCleanup = t(n);
        else
          typeof t == "string" ? console.error("String refs are no longer supported.") : t.hasOwnProperty("current") || console.error(
            "Unexpected ref object provided for %s. Use either a ref-setter function or React.createRef().",
            ie(e)
          ), t.current = n;
      }
    }
    function Lc(e, t) {
      try {
        le(e, lg, e);
      } catch (n) {
        xe(e, t, n);
      }
    }
    function ca(e, t) {
      var n = e.ref, i = e.refCleanup;
      if (n !== null)
        if (typeof i == "function")
          try {
            if (du(e))
              try {
                Zt(), le(e, i);
              } finally {
                Pl(e);
              }
            else le(e, i);
          } catch (o) {
            xe(e, t, o);
          } finally {
            e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
          }
        else if (typeof n == "function")
          try {
            if (du(e))
              try {
                Zt(), le(e, n, null);
              } finally {
                Pl(e);
              }
            else le(e, n, null);
          } catch (o) {
            xe(e, t, o);
          }
        else n.current = null;
    }
    function Ap(e, t, n, i) {
      var o = e.memoizedProps, s = o.id, d = o.onCommit;
      o = o.onRender, t = t === null ? "mount" : "update", sv && (t = "nested-update"), typeof o == "function" && o(
        s,
        t,
        e.actualDuration,
        e.treeBaseDuration,
        e.actualStartTime,
        n
      ), typeof d == "function" && d(s, t, i, n);
    }
    function ng(e, t, n, i) {
      var o = e.memoizedProps;
      e = o.id, o = o.onPostCommit, t = t === null ? "mount" : "update", sv && (t = "nested-update"), typeof o == "function" && o(
        e,
        t,
        i,
        n
      );
    }
    function Xi(e) {
      var t = e.type, n = e.memoizedProps, i = e.stateNode;
      try {
        le(
          e,
          yg,
          i,
          t,
          n,
          e
        );
      } catch (o) {
        xe(e, e.return, o);
      }
    }
    function Kd(e, t, n) {
      try {
        le(
          e,
          hh,
          e.stateNode,
          e.type,
          n,
          t,
          e
        );
      } catch (i) {
        xe(e, e.return, i);
      }
    }
    function zp(e) {
      return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && $i(e.type) || e.tag === 4;
    }
    function $d(e) {
      e: for (; ; ) {
        for (; e.sibling === null; ) {
          if (e.return === null || zp(e.return)) return null;
          e = e.return;
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
          if (e.tag === 27 && $i(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
          e.child.return = e, e = e.child;
        }
        if (!(e.flags & 2)) return e.stateNode;
      }
    }
    function Po(e, t, n) {
      var i = e.tag;
      if (i === 5 || i === 6)
        e = e.stateNode, t ? (vg(n), (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t)) : (vg(n), t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Pn));
      else if (i !== 4 && (i === 27 && $i(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null))
        for (Po(e, t, n), e = e.sibling; e !== null; )
          Po(e, t, n), e = e.sibling;
    }
    function Zf(e, t, n) {
      var i = e.tag;
      if (i === 5 || i === 6)
        e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
      else if (i !== 4 && (i === 27 && $i(e.type) && (n = e.stateNode), e = e.child, e !== null))
        for (Zf(e, t, n), e = e.sibling; e !== null; )
          Zf(e, t, n), e = e.sibling;
    }
    function Op(e) {
      for (var t, n = e.return; n !== null; ) {
        if (zp(n)) {
          t = n;
          break;
        }
        n = n.return;
      }
      if (t == null)
        throw Error(
          "Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue."
        );
      switch (t.tag) {
        case 27:
          t = t.stateNode, n = $d(e), Zf(
            e,
            n,
            t
          );
          break;
        case 5:
          n = t.stateNode, t.flags & 32 && (mh(n), t.flags &= -33), t = $d(e), Zf(
            e,
            t,
            n
          );
          break;
        case 3:
        case 4:
          t = t.stateNode.containerInfo, n = $d(e), Po(
            e,
            n,
            t
          );
          break;
        default:
          throw Error(
            "Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue."
          );
      }
    }
    function Dp(e) {
      var t = e.stateNode, n = e.memoizedProps;
      try {
        le(
          e,
          Su,
          e.type,
          n,
          t,
          e
        );
      } catch (i) {
        xe(e, e.return, i);
      }
    }
    function _p(e, t) {
      return t.tag === 31 ? (t = t.memoizedState, e.memoizedState !== null && t === null) : t.tag === 13 ? (e = e.memoizedState, t = t.memoizedState, e !== null && e.dehydrated !== null && (t === null || t.dehydrated === null)) : t.tag === 3 ? e.memoizedState.isDehydrated && (t.flags & 256) === 0 : !1;
    }
    function m1(e, t) {
      if (e = e.containerInfo, zb = Vv, e = sd(e), Hm(e)) {
        if ("selectionStart" in e)
          var n = {
            start: e.selectionStart,
            end: e.selectionEnd
          };
        else
          e: {
            n = (n = e.ownerDocument) && n.defaultView || window;
            var i = n.getSelection && n.getSelection();
            if (i && i.rangeCount !== 0) {
              n = i.anchorNode;
              var o = i.anchorOffset, s = i.focusNode;
              i = i.focusOffset;
              try {
                n.nodeType, s.nodeType;
              } catch {
                n = null;
                break e;
              }
              var d = 0, h = -1, v = -1, S = 0, _ = 0, M = e, A = null;
              t: for (; ; ) {
                for (var q; M !== n || o !== 0 && M.nodeType !== 3 || (h = d + o), M !== s || i !== 0 && M.nodeType !== 3 || (v = d + i), M.nodeType === 3 && (d += M.nodeValue.length), (q = M.firstChild) !== null; )
                  A = M, M = q;
                for (; ; ) {
                  if (M === e) break t;
                  if (A === n && ++S === o && (h = d), A === s && ++_ === i && (v = d), (q = M.nextSibling) !== null) break;
                  M = A, A = M.parentNode;
                }
                M = q;
              }
              n = h === -1 || v === -1 ? null : { start: h, end: v };
            } else n = null;
          }
        n = n || { start: 0, end: 0 };
      } else n = null;
      for (Ob = {
        focusedElem: e,
        selectionRange: n
      }, Vv = !1, Kl = t; Kl !== null; )
        if (t = Kl, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
          e.return = t, Kl = e;
        else
          for (; Kl !== null; ) {
            switch (e = t = Kl, n = e.alternate, o = e.flags, e.tag) {
              case 0:
                if ((o & 4) !== 0 && (e = e.updateQueue, e = e !== null ? e.events : null, e !== null))
                  for (n = 0; n < e.length; n++)
                    o = e[n], o.ref.impl = o.nextImpl;
                break;
              case 11:
              case 15:
                break;
              case 1:
                (o & 1024) !== 0 && n !== null && tg(e, n);
                break;
              case 3:
                if ((o & 1024) !== 0) {
                  if (e = e.stateNode.containerInfo, n = e.nodeType, n === 9)
                    ds(e);
                  else if (n === 1)
                    switch (e.nodeName) {
                      case "HEAD":
                      case "HTML":
                      case "BODY":
                        ds(e);
                        break;
                      default:
                        e.textContent = "";
                    }
                }
                break;
              case 5:
              case 26:
              case 27:
              case 6:
              case 4:
              case 17:
                break;
              default:
                if ((o & 1024) !== 0)
                  throw Error(
                    "This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue."
                  );
            }
            if (e = t.sibling, e !== null) {
              e.return = t.return, Kl = e;
              break;
            }
            Kl = t.return;
          }
    }
    function kd(e, t, n) {
      var i = Ut(), o = na(), s = Cn(), d = aa(), h = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          jn(e, n), h & 4 && eg(n, Va | Nu);
          break;
        case 1:
          if (jn(e, n), h & 4)
            if (e = n.stateNode, t === null)
              n.type.defaultProps || "ref" in n.memoizedProps || am || (e.props !== n.memoizedProps && console.error(
                "Expected %s props to match memoized props before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.",
                ie(n) || "instance"
              ), e.state !== n.memoizedState && console.error(
                "Expected %s state to match memoized state before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.",
                ie(n) || "instance"
              )), du(n) ? (Zt(), le(
                n,
                J1,
                n,
                e
              ), Pl()) : le(
                n,
                J1,
                n,
                e
              );
            else {
              var v = fu(
                n.type,
                t.memoizedProps
              );
              t = t.memoizedState, n.type.defaultProps || "ref" in n.memoizedProps || am || (e.props !== n.memoizedProps && console.error(
                "Expected %s props to match memoized props before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.",
                ie(n) || "instance"
              ), e.state !== n.memoizedState && console.error(
                "Expected %s state to match memoized state before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.",
                ie(n) || "instance"
              )), du(n) ? (Zt(), le(
                n,
                CS,
                n,
                e,
                v,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              ), Pl()) : le(
                n,
                CS,
                n,
                e,
                v,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              );
            }
          h & 64 && Tp(n), h & 512 && Lc(n, n.return);
          break;
        case 3:
          if (t = tu(), jn(e, n), h & 64 && (h = n.updateQueue, h !== null)) {
            if (v = null, n.child !== null)
              switch (n.child.tag) {
                case 27:
                case 5:
                  v = n.child.stateNode;
                  break;
                case 1:
                  v = n.child.stateNode;
              }
            try {
              le(
                n,
                Go,
                h,
                v
              );
            } catch (_) {
              xe(n, n.return, _);
            }
          }
          e.effectDuration += qo(t);
          break;
        case 27:
          t === null && h & 4 && Dp(n);
        case 26:
        case 5:
          if (jn(e, n), t === null) {
            if (h & 4) Xi(n);
            else if (h & 64) {
              e = n.type, t = n.memoizedProps, v = n.stateNode;
              try {
                le(
                  n,
                  gg,
                  v,
                  e,
                  t,
                  n
                );
              } catch (_) {
                xe(
                  n,
                  n.return,
                  _
                );
              }
            }
          }
          h & 512 && Lc(n, n.return);
          break;
        case 12:
          if (h & 4) {
            h = tu(), jn(e, n), e = n.stateNode, e.effectDuration += Il(h);
            try {
              le(
                n,
                Ap,
                n,
                t,
                Bs,
                e.effectDuration
              );
            } catch (_) {
              xe(n, n.return, _);
            }
          } else jn(e, n);
          break;
        case 31:
          jn(e, n), h & 4 && Mp(e, n);
          break;
        case 13:
          jn(e, n), h & 4 && Cp(e, n), h & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (h = li.bind(
            null,
            n
          ), Mg(e, h))));
          break;
        case 22:
          if (h = n.memoizedState !== null || po, !h) {
            t = t !== null && t.memoizedState !== null || Ml, v = po;
            var S = Ml;
            po = h, (Ml = t) && !S ? (Ua(
              e,
              n,
              (n.subtreeFlags & 8772) !== 0
            ), (n.mode & qe) !== Ee && 0 <= pe && 0 <= ve && 0.05 < ve - pe && fd(
              n,
              pe,
              ve
            )) : jn(e, n), po = v, Ml = S;
          }
          break;
        case 30:
          break;
        default:
          jn(e, n);
      }
      (n.mode & qe) !== Ee && 0 <= pe && 0 <= ve && ((ll || 0.05 < $t) && Ea(
        n,
        pe,
        ve,
        $t,
        Lt
      ), n.alternate === null && n.return !== null && n.return.alternate !== null && 0.05 < ve - pe && (_p(
        n.return.alternate,
        n.return
      ) || ea(
        n,
        pe,
        ve,
        "Mount"
      ))), vl(i), Mn(o), Lt = s, ll = d;
    }
    function el(e) {
      var t = e.alternate;
      t !== null && (e.alternate = null, el(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && bm(t)), e.stateNode = null, e._debugOwner = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
    }
    function Rt(e, t, n) {
      for (n = n.child; n !== null; )
        Rp(
          e,
          t,
          n
        ), n = n.sibling;
    }
    function Rp(e, t, n) {
      if (dl && typeof dl.onCommitFiberUnmount == "function")
        try {
          dl.onCommitFiberUnmount(to, n);
        } catch (S) {
          Tu || (Tu = !0, console.error(
            "React instrumentation encountered an error: %o",
            S
          ));
        }
      var i = Ut(), o = na(), s = Cn(), d = aa();
      switch (n.tag) {
        case 26:
          Ml || ca(n, t), Rt(
            e,
            t,
            n
          ), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (e = n.stateNode, e.parentNode.removeChild(e));
          break;
        case 27:
          Ml || ca(n, t);
          var h = Cl, v = da;
          $i(n.type) && (Cl = n.stateNode, da = !1), Rt(
            e,
            t,
            n
          ), le(
            n,
            ii,
            n.stateNode
          ), Cl = h, da = v;
          break;
        case 5:
          Ml || ca(n, t);
        case 6:
          if (h = Cl, v = da, Cl = null, Rt(
            e,
            t,
            n
          ), Cl = h, da = v, Cl !== null)
            if (da)
              try {
                le(
                  n,
                  Sg,
                  Cl,
                  n.stateNode
                );
              } catch (S) {
                xe(
                  n,
                  t,
                  S
                );
              }
            else
              try {
                le(
                  n,
                  bg,
                  Cl,
                  n.stateNode
                );
              } catch (S) {
                xe(
                  n,
                  t,
                  S
                );
              }
          break;
        case 18:
          Cl !== null && (da ? (e = Cl, Kc(
            e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
            n.stateNode
          ), Fc(e)) : Kc(Cl, n.stateNode));
          break;
        case 4:
          h = Cl, v = da, Cl = n.stateNode.containerInfo, da = !0, Rt(
            e,
            t,
            n
          ), Cl = h, da = v;
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          Gi(
            Kn,
            n,
            t
          ), Ml || Qd(
            n,
            t,
            Va
          ), Rt(
            e,
            t,
            n
          );
          break;
        case 1:
          Ml || (ca(n, t), h = n.stateNode, typeof h.componentWillUnmount == "function" && Jd(
            n,
            t,
            h
          )), Rt(
            e,
            t,
            n
          );
          break;
        case 21:
          Rt(
            e,
            t,
            n
          );
          break;
        case 22:
          Ml = (h = Ml) || n.memoizedState !== null, Rt(
            e,
            t,
            n
          ), Ml = h;
          break;
        default:
          Rt(
            e,
            t,
            n
          );
      }
      (n.mode & qe) !== Ee && 0 <= pe && 0 <= ve && (ll || 0.05 < $t) && Ea(
        n,
        pe,
        ve,
        $t,
        Lt
      ), vl(i), Mn(o), Lt = s, ll = d;
    }
    function Mp(e, t) {
      if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
        e = e.dehydrated;
        try {
          le(
            t,
            ph,
            e
          );
        } catch (n) {
          xe(t, t.return, n);
        }
      }
    }
    function Cp(e, t) {
      if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
        try {
          le(
            t,
            Fp,
            e
          );
        } catch (n) {
          xe(t, t.return, n);
        }
    }
    function ag(e) {
      switch (e.tag) {
        case 31:
        case 13:
        case 19:
          var t = e.stateNode;
          return t === null && (t = e.stateNode = new p2()), t;
        case 22:
          return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new p2()), t;
        default:
          throw Error(
            "Unexpected Suspense handler tag (" + e.tag + "). This is a bug in React."
          );
      }
    }
    function Li(e, t) {
      var n = ag(e);
      t.forEach(function(i) {
        if (!n.has(i)) {
          if (n.add(i), Au)
            if (um !== null && im !== null)
              us(im, um);
            else
              throw Error(
                "Expected finished root and lanes to be set. This is a bug in React."
              );
          var o = Zc.bind(null, e, i);
          i.then(o, o);
        }
      });
    }
    function an(e, t) {
      var n = t.deletions;
      if (n !== null)
        for (var i = 0; i < n.length; i++) {
          var o = e, s = t, d = n[i], h = Ut(), v = s;
          e: for (; v !== null; ) {
            switch (v.tag) {
              case 27:
                if ($i(v.type)) {
                  Cl = v.stateNode, da = !1;
                  break e;
                }
                break;
              case 5:
                Cl = v.stateNode, da = !1;
                break e;
              case 3:
              case 4:
                Cl = v.stateNode.containerInfo, da = !0;
                break e;
            }
            v = v.return;
          }
          if (Cl === null)
            throw Error(
              "Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue."
            );
          Rp(o, s, d), Cl = null, da = !1, (d.mode & qe) !== Ee && 0 <= pe && 0 <= ve && 0.05 < ve - pe && ea(
            d,
            pe,
            ve,
            "Unmount"
          ), vl(h), o = d, s = o.alternate, s !== null && (s.return = null), o.return = null;
        }
      if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null; )
          Jf(t, e), t = t.sibling;
    }
    function Jf(e, t) {
      var n = Ut(), i = na(), o = Cn(), s = aa(), d = e.alternate, h = e.flags;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          an(t, e), un(e), h & 4 && (Gi(
            Kn | Nu,
            e,
            e.return
          ), ei(Kn | Nu, e), Qd(
            e,
            e.return,
            Va | Nu
          ));
          break;
        case 1:
          if (an(t, e), un(e), h & 512 && (Ml || d === null || ca(d, d.return)), h & 64 && po && (h = e.updateQueue, h !== null && (d = h.callbacks, d !== null))) {
            var v = h.shared.hiddenCallbacks;
            h.shared.hiddenCallbacks = v === null ? d : v.concat(d);
          }
          break;
        case 26:
          if (v = di, an(t, e), un(e), h & 512 && (Ml || d === null || ca(d, d.return)), h & 4) {
            var S = d !== null ? d.memoizedState : null;
            if (h = e.memoizedState, d === null)
              if (h === null)
                if (e.stateNode === null) {
                  e: {
                    h = e.type, d = e.memoizedProps, v = v.ownerDocument || v;
                    t: switch (h) {
                      case "title":
                        S = v.getElementsByTagName(
                          "title"
                        )[0], (!S || S[_s] || S[Ht] || S.namespaceURI === Ne || S.hasAttribute("itemprop")) && (S = v.createElement(h), v.head.insertBefore(
                          S,
                          v.querySelector(
                            "head > title"
                          )
                        )), Nt(S, h, d), S[Ht] = e, Wt(S), h = S;
                        break e;
                      case "link":
                        var _ = ps(
                          "link",
                          "href",
                          v
                        ).get(h + (d.href || ""));
                        if (_) {
                          for (var M = 0; M < _.length; M++)
                            if (S = _[M], S.getAttribute("href") === (d.href == null || d.href === "" ? null : d.href) && S.getAttribute("rel") === (d.rel == null ? null : d.rel) && S.getAttribute("title") === (d.title == null ? null : d.title) && S.getAttribute("crossorigin") === (d.crossOrigin == null ? null : d.crossOrigin)) {
                              _.splice(M, 1);
                              break t;
                            }
                        }
                        S = v.createElement(h), Nt(S, h, d), v.head.appendChild(
                          S
                        );
                        break;
                      case "meta":
                        if (_ = ps(
                          "meta",
                          "content",
                          v
                        ).get(h + (d.content || ""))) {
                          for (M = 0; M < _.length; M++)
                            if (S = _[M], dt(
                              d.content,
                              "content"
                            ), S.getAttribute("content") === (d.content == null ? null : "" + d.content) && S.getAttribute("name") === (d.name == null ? null : d.name) && S.getAttribute("property") === (d.property == null ? null : d.property) && S.getAttribute("http-equiv") === (d.httpEquiv == null ? null : d.httpEquiv) && S.getAttribute("charset") === (d.charSet == null ? null : d.charSet)) {
                              _.splice(M, 1);
                              break t;
                            }
                        }
                        S = v.createElement(h), Nt(S, h, d), v.head.appendChild(
                          S
                        );
                        break;
                      default:
                        throw Error(
                          'getNodesForType encountered a type it did not expect: "' + h + '". This is a bug in React.'
                        );
                    }
                    S[Ht] = e, Wt(S), h = S;
                  }
                  e.stateNode = h;
                } else
                  Ng(
                    v,
                    e.type,
                    e.stateNode
                  );
              else
                e.stateNode = vh(
                  v,
                  h,
                  e.memoizedProps
                );
            else
              S !== h ? (S === null ? d.stateNode !== null && (d = d.stateNode, d.parentNode.removeChild(d)) : S.count--, h === null ? Ng(
                v,
                e.type,
                e.stateNode
              ) : vh(
                v,
                h,
                e.memoizedProps
              )) : h === null && e.stateNode !== null && Kd(
                e,
                e.memoizedProps,
                d.memoizedProps
              );
          }
          break;
        case 27:
          an(t, e), un(e), h & 512 && (Ml || d === null || ca(d, d.return)), d !== null && h & 4 && Kd(
            e,
            e.memoizedProps,
            d.memoizedProps
          );
          break;
        case 5:
          if (an(t, e), un(e), h & 512 && (Ml || d === null || ca(d, d.return)), e.flags & 32) {
            v = e.stateNode;
            try {
              le(
                e,
                mh,
                v
              );
            } catch (te) {
              xe(e, e.return, te);
            }
          }
          h & 4 && e.stateNode != null && (v = e.memoizedProps, Kd(
            e,
            v,
            d !== null ? d.memoizedProps : v
          )), h & 1024 && (ub = !0, e.type !== "form" && console.error(
            "Unexpected host component type. Expected a form. This is a bug in React."
          ));
          break;
        case 6:
          if (an(t, e), un(e), h & 4) {
            if (e.stateNode === null)
              throw Error(
                "This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue."
              );
            h = e.memoizedProps, d = d !== null ? d.memoizedProps : h, v = e.stateNode;
            try {
              le(
                e,
                p1,
                v,
                d,
                h
              );
            } catch (te) {
              xe(e, e.return, te);
            }
          }
          break;
        case 3:
          if (v = tu(), Gv = null, S = di, di = yh(t.containerInfo), an(t, e), di = S, un(e), h & 4 && d !== null && d.memoizedState.isDehydrated)
            try {
              le(
                e,
                Wp,
                t.containerInfo
              );
            } catch (te) {
              xe(e, e.return, te);
            }
          ub && (ub = !1, ug(e)), t.effectDuration += qo(
            v
          );
          break;
        case 4:
          h = di, di = yh(
            e.stateNode.containerInfo
          ), an(t, e), un(e), di = h;
          break;
        case 12:
          h = tu(), an(t, e), un(e), e.stateNode.effectDuration += Il(h);
          break;
        case 31:
          an(t, e), un(e), h & 4 && (h = e.updateQueue, h !== null && (e.updateQueue = null, Li(e, h)));
          break;
        case 13:
          an(t, e), un(e), e.child.flags & 8192 && e.memoizedState !== null != (d !== null && d.memoizedState !== null) && (Ov = zl()), h & 4 && (h = e.updateQueue, h !== null && (e.updateQueue = null, Li(e, h)));
          break;
        case 22:
          v = e.memoizedState !== null;
          var A = d !== null && d.memoizedState !== null, q = po, F = Ml;
          if (po = q || v, Ml = F || A, an(t, e), Ml = F, po = q, A && !v && !q && !F && (e.mode & qe) !== Ee && 0 <= pe && 0 <= ve && 0.05 < ve - pe && fd(
            e,
            pe,
            ve
          ), un(e), h & 8192)
            e: for (t = e.stateNode, t._visibility = v ? t._visibility & ~xy : t._visibility | xy, !v || d === null || A || po || Ml || (Vi(e), (e.mode & qe) !== Ee && 0 <= pe && 0 <= ve && 0.05 < ve - pe && ea(
              e,
              pe,
              ve,
              "Disconnect"
            )), d = null, t = e; ; ) {
              if (t.tag === 5 || t.tag === 26) {
                if (d === null) {
                  A = d = t;
                  try {
                    S = A.stateNode, v ? le(
                      A,
                      Tg,
                      S
                    ) : le(
                      A,
                      Og,
                      A.stateNode,
                      A.memoizedProps
                    );
                  } catch (te) {
                    xe(A, A.return, te);
                  }
                }
              } else if (t.tag === 6) {
                if (d === null) {
                  A = t;
                  try {
                    _ = A.stateNode, v ? le(
                      A,
                      Ag,
                      _
                    ) : le(
                      A,
                      Dg,
                      _,
                      A.memoizedProps
                    );
                  } catch (te) {
                    xe(A, A.return, te);
                  }
                }
              } else if (t.tag === 18) {
                if (d === null) {
                  A = t;
                  try {
                    M = A.stateNode, v ? le(
                      A,
                      Eg,
                      M
                    ) : le(
                      A,
                      zg,
                      A.stateNode
                    );
                  } catch (te) {
                    xe(A, A.return, te);
                  }
                }
              } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
                t.child.return = t, t = t.child;
                continue;
              }
              if (t === e) break e;
              for (; t.sibling === null; ) {
                if (t.return === null || t.return === e)
                  break e;
                d === t && (d = null), t = t.return;
              }
              d === t && (d = null), t.sibling.return = t.return, t = t.sibling;
            }
          h & 4 && (h = e.updateQueue, h !== null && (d = h.retryQueue, d !== null && (h.retryQueue = null, Li(e, d))));
          break;
        case 19:
          an(t, e), un(e), h & 4 && (h = e.updateQueue, h !== null && (e.updateQueue = null, Li(e, h)));
          break;
        case 30:
          break;
        case 21:
          break;
        default:
          an(t, e), un(e);
      }
      (e.mode & qe) !== Ee && 0 <= pe && 0 <= ve && ((ll || 0.05 < $t) && Ea(
        e,
        pe,
        ve,
        $t,
        Lt
      ), e.alternate === null && e.return !== null && e.return.alternate !== null && 0.05 < ve - pe && (_p(
        e.return.alternate,
        e.return
      ) || ea(
        e,
        pe,
        ve,
        "Mount"
      ))), vl(n), Mn(i), Lt = o, ll = s;
    }
    function un(e) {
      var t = e.flags;
      if (t & 2) {
        try {
          le(e, Op, e);
        } catch (n) {
          xe(e, e.return, n);
        }
        e.flags &= -3;
      }
      t & 4096 && (e.flags &= -4097);
    }
    function ug(e) {
      if (e.subtreeFlags & 1024)
        for (e = e.child; e !== null; ) {
          var t = e;
          ug(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
        }
    }
    function jn(e, t) {
      if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null; )
          kd(e, t.alternate, t), t = t.sibling;
    }
    function Wd(e) {
      var t = Ut(), n = na(), i = Cn(), o = aa();
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Qd(
            e,
            e.return,
            Va
          ), Vi(e);
          break;
        case 1:
          ca(e, e.return);
          var s = e.stateNode;
          typeof s.componentWillUnmount == "function" && Jd(
            e,
            e.return,
            s
          ), Vi(e);
          break;
        case 27:
          le(
            e,
            ii,
            e.stateNode
          );
        case 26:
        case 5:
          ca(e, e.return), Vi(e);
          break;
        case 22:
          e.memoizedState === null && Vi(e);
          break;
        case 30:
          Vi(e);
          break;
        default:
          Vi(e);
      }
      (e.mode & qe) !== Ee && 0 <= pe && 0 <= ve && (ll || 0.05 < $t) && Ea(
        e,
        pe,
        ve,
        $t,
        Lt
      ), vl(t), Mn(n), Lt = i, ll = o;
    }
    function Vi(e) {
      for (e = e.child; e !== null; )
        Wd(e), e = e.sibling;
    }
    function Up(e, t, n, i) {
      var o = Ut(), s = na(), d = Cn(), h = aa(), v = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          Ua(
            e,
            n,
            i
          ), eg(n, Va);
          break;
        case 1:
          if (Ua(
            e,
            n,
            i
          ), t = n.stateNode, typeof t.componentDidMount == "function" && le(
            n,
            J1,
            n,
            t
          ), t = n.updateQueue, t !== null) {
            e = n.stateNode;
            try {
              le(
                n,
                Im,
                t,
                e
              );
            } catch (S) {
              xe(n, n.return, S);
            }
          }
          i && v & 64 && Tp(n), Lc(n, n.return);
          break;
        case 27:
          Dp(n);
        case 26:
        case 5:
          Ua(
            e,
            n,
            i
          ), i && t === null && v & 4 && Xi(n), Lc(n, n.return);
          break;
        case 12:
          if (i && v & 4) {
            v = tu(), Ua(
              e,
              n,
              i
            ), i = n.stateNode, i.effectDuration += Il(v);
            try {
              le(
                n,
                Ap,
                n,
                t,
                Bs,
                i.effectDuration
              );
            } catch (S) {
              xe(n, n.return, S);
            }
          } else
            Ua(
              e,
              n,
              i
            );
          break;
        case 31:
          Ua(
            e,
            n,
            i
          ), i && v & 4 && Mp(e, n);
          break;
        case 13:
          Ua(
            e,
            n,
            i
          ), i && v & 4 && Cp(e, n);
          break;
        case 22:
          n.memoizedState === null && Ua(
            e,
            n,
            i
          ), Lc(n, n.return);
          break;
        case 30:
          break;
        default:
          Ua(
            e,
            n,
            i
          );
      }
      (n.mode & qe) !== Ee && 0 <= pe && 0 <= ve && (ll || 0.05 < $t) && Ea(
        n,
        pe,
        ve,
        $t,
        Lt
      ), vl(o), Mn(s), Lt = d, ll = h;
    }
    function Ua(e, t, n) {
      for (n = n && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; )
        Up(
          e,
          t.alternate,
          t,
          n
        ), t = t.sibling;
    }
    function Kf(e, t) {
      var n = null;
      e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && Oc(e), n != null && bf(n));
    }
    function $f(e, t) {
      e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (Oc(t), e != null && bf(e));
    }
    function wn(e, t, n, i, o) {
      if (t.subtreeFlags & 10256 || t.actualDuration !== 0 && (t.alternate === null || t.alternate.child !== t.child))
        for (t = t.child; t !== null; ) {
          var s = t.sibling;
          xp(
            e,
            t,
            n,
            i,
            s !== null ? s.actualStartTime : o
          ), t = s;
        }
    }
    function xp(e, t, n, i, o) {
      var s = Ut(), d = na(), h = Cn(), v = aa(), S = Us, _ = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          (t.mode & qe) !== Ee && 0 < t.actualStartTime && (t.flags & 1) !== 0 && rd(
            t,
            t.actualStartTime,
            o,
            wl,
            n
          ), wn(
            e,
            t,
            n,
            i,
            o
          ), _ & 2048 && Vf(t, $n | Nu);
          break;
        case 1:
          (t.mode & qe) !== Ee && 0 < t.actualStartTime && ((t.flags & 128) !== 0 ? qm(
            t,
            t.actualStartTime,
            o,
            []
          ) : (t.flags & 1) !== 0 && rd(
            t,
            t.actualStartTime,
            o,
            wl,
            n
          )), wn(
            e,
            t,
            n,
            i,
            o
          );
          break;
        case 3:
          var M = tu(), A = wl;
          wl = t.alternate !== null && t.alternate.memoizedState.isDehydrated && (t.flags & 256) === 0, wn(
            e,
            t,
            n,
            i,
            o
          ), wl = A, _ & 2048 && (n = null, t.alternate !== null && (n = t.alternate.memoizedState.cache), i = t.memoizedState.cache, i !== n && (Oc(i), n != null && bf(n))), e.passiveEffectDuration += qo(
            M
          );
          break;
        case 12:
          if (_ & 2048) {
            _ = tu(), wn(
              e,
              t,
              n,
              i,
              o
            ), e = t.stateNode, e.passiveEffectDuration += Il(_);
            try {
              le(
                t,
                ng,
                t,
                t.alternate,
                Bs,
                e.passiveEffectDuration
              );
            } catch (q) {
              xe(t, t.return, q);
            }
          } else
            wn(
              e,
              t,
              n,
              i,
              o
            );
          break;
        case 31:
          _ = wl, M = t.alternate !== null ? t.alternate.memoizedState : null, A = t.memoizedState, M !== null && A === null ? (A = t.deletions, A !== null && 0 < A.length && A[0].tag === 18 ? (wl = !1, M = M.hydrationErrors, M !== null && qm(
            t,
            t.actualStartTime,
            o,
            M
          )) : wl = !0) : wl = !1, wn(
            e,
            t,
            n,
            i,
            o
          ), wl = _;
          break;
        case 13:
          _ = wl, M = t.alternate !== null ? t.alternate.memoizedState : null, A = t.memoizedState, M === null || M.dehydrated === null || A !== null && A.dehydrated !== null ? wl = !1 : (A = t.deletions, A !== null && 0 < A.length && A[0].tag === 18 ? (wl = !1, M = M.hydrationErrors, M !== null && qm(
            t,
            t.actualStartTime,
            o,
            M
          )) : wl = !0), wn(
            e,
            t,
            n,
            i,
            o
          ), wl = _;
          break;
        case 23:
          break;
        case 22:
          A = t.stateNode, M = t.alternate, t.memoizedState !== null ? A._visibility & ao ? wn(
            e,
            t,
            n,
            i,
            o
          ) : Vc(
            e,
            t,
            n,
            i,
            o
          ) : A._visibility & ao ? wn(
            e,
            t,
            n,
            i,
            o
          ) : (A._visibility |= ao, Qi(
            e,
            t,
            n,
            i,
            (t.subtreeFlags & 10256) !== 0 || t.actualDuration !== 0 && (t.alternate === null || t.alternate.child !== t.child),
            o
          ), (t.mode & qe) === Ee || wl || (e = t.actualStartTime, 0 <= e && 0.05 < o - e && fd(t, e, o), 0 <= pe && 0 <= ve && 0.05 < ve - pe && fd(
            t,
            pe,
            ve
          ))), _ & 2048 && Kf(
            M,
            t
          );
          break;
        case 24:
          wn(
            e,
            t,
            n,
            i,
            o
          ), _ & 2048 && $f(t.alternate, t);
          break;
        default:
          wn(
            e,
            t,
            n,
            i,
            o
          );
      }
      (t.mode & qe) !== Ee && ((e = !wl && t.alternate === null && t.return !== null && t.return.alternate !== null) && (n = t.actualStartTime, 0 <= n && 0.05 < o - n && ea(
        t,
        n,
        o,
        "Mount"
      )), 0 <= pe && 0 <= ve && ((ll || 0.05 < $t) && Ea(
        t,
        pe,
        ve,
        $t,
        Lt
      ), e && 0.05 < ve - pe && ea(
        t,
        pe,
        ve,
        "Mount"
      ))), vl(s), Mn(d), Lt = h, ll = v, Us = S;
    }
    function Qi(e, t, n, i, o, s) {
      for (o = o && ((t.subtreeFlags & 10256) !== 0 || t.actualDuration !== 0 && (t.alternate === null || t.alternate.child !== t.child)), t = t.child; t !== null; ) {
        var d = t.sibling;
        kf(
          e,
          t,
          n,
          i,
          o,
          d !== null ? d.actualStartTime : s
        ), t = d;
      }
    }
    function kf(e, t, n, i, o, s) {
      var d = Ut(), h = na(), v = Cn(), S = aa(), _ = Us;
      o && (t.mode & qe) !== Ee && 0 < t.actualStartTime && (t.flags & 1) !== 0 && rd(
        t,
        t.actualStartTime,
        s,
        wl,
        n
      );
      var M = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          Qi(
            e,
            t,
            n,
            i,
            o,
            s
          ), Vf(t, $n);
          break;
        case 23:
          break;
        case 22:
          var A = t.stateNode;
          t.memoizedState !== null ? A._visibility & ao ? Qi(
            e,
            t,
            n,
            i,
            o,
            s
          ) : Vc(
            e,
            t,
            n,
            i,
            s
          ) : (A._visibility |= ao, Qi(
            e,
            t,
            n,
            i,
            o,
            s
          )), o && M & 2048 && Kf(
            t.alternate,
            t
          );
          break;
        case 24:
          Qi(
            e,
            t,
            n,
            i,
            o,
            s
          ), o && M & 2048 && $f(t.alternate, t);
          break;
        default:
          Qi(
            e,
            t,
            n,
            i,
            o,
            s
          );
      }
      (t.mode & qe) !== Ee && 0 <= pe && 0 <= ve && (ll || 0.05 < $t) && Ea(
        t,
        pe,
        ve,
        $t,
        Lt
      ), vl(d), Mn(h), Lt = v, ll = S, Us = _;
    }
    function Vc(e, t, n, i, o) {
      if (t.subtreeFlags & 10256 || t.actualDuration !== 0 && (t.alternate === null || t.alternate.child !== t.child))
        for (var s = t.child; s !== null; ) {
          t = s.sibling;
          var d = e, h = n, v = i, S = t !== null ? t.actualStartTime : o, _ = Us;
          (s.mode & qe) !== Ee && 0 < s.actualStartTime && (s.flags & 1) !== 0 && rd(
            s,
            s.actualStartTime,
            S,
            wl,
            h
          );
          var M = s.flags;
          switch (s.tag) {
            case 22:
              Vc(
                d,
                s,
                h,
                v,
                S
              ), M & 2048 && Kf(s.alternate, s);
              break;
            case 24:
              Vc(
                d,
                s,
                h,
                v,
                S
              ), M & 2048 && $f(s.alternate, s);
              break;
            default:
              Vc(
                d,
                s,
                h,
                v,
                S
              );
          }
          Us = _, s = t;
        }
    }
    function Qc(e, t, n) {
      if (e.subtreeFlags & Iy)
        for (e = e.child; e !== null; )
          Fd(
            e,
            t,
            n
          ), e = e.sibling;
    }
    function Fd(e, t, n) {
      switch (e.tag) {
        case 26:
          Qc(
            e,
            t,
            n
          ), e.flags & Iy && e.memoizedState !== null && ly(
            n,
            di,
            e.memoizedState,
            e.memoizedProps
          );
          break;
        case 5:
          Qc(
            e,
            t,
            n
          );
          break;
        case 3:
        case 4:
          var i = di;
          di = yh(
            e.stateNode.containerInfo
          ), Qc(
            e,
            t,
            n
          ), di = i;
          break;
        case 22:
          e.memoizedState === null && (i = e.alternate, i !== null && i.memoizedState !== null ? (i = Iy, Iy = 16777216, Qc(
            e,
            t,
            n
          ), Iy = i) : Qc(
            e,
            t,
            n
          ));
          break;
        default:
          Qc(
            e,
            t,
            n
          );
      }
    }
    function Np(e) {
      var t = e.alternate;
      if (t !== null && (e = t.child, e !== null)) {
        t.child = null;
        do
          t = e.sibling, e.sibling = null, e = t;
        while (e !== null);
      }
    }
    function Yn(e) {
      var t = e.deletions;
      if ((e.flags & 16) !== 0) {
        if (t !== null)
          for (var n = 0; n < t.length; n++) {
            var i = t[n], o = Ut();
            Kl = i, hu(
              i,
              e
            ), (i.mode & qe) !== Ee && 0 <= pe && 0 <= ve && 0.05 < ve - pe && ea(
              i,
              pe,
              ve,
              "Unmount"
            ), vl(o);
          }
        Np(e);
      }
      if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null; )
          Id(e), e = e.sibling;
    }
    function Id(e) {
      var t = Ut(), n = na(), i = Cn(), o = aa();
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          Yn(e), e.flags & 2048 && Zd(
            e,
            e.return,
            $n | Nu
          );
          break;
        case 3:
          var s = tu();
          Yn(e), e.stateNode.passiveEffectDuration += qo(s);
          break;
        case 12:
          s = tu(), Yn(e), e.stateNode.passiveEffectDuration += Il(s);
          break;
        case 22:
          s = e.stateNode, e.memoizedState !== null && s._visibility & ao && (e.return === null || e.return.tag !== 13) ? (s._visibility &= ~ao, Pd(e), (e.mode & qe) !== Ee && 0 <= pe && 0 <= ve && 0.05 < ve - pe && ea(
            e,
            pe,
            ve,
            "Disconnect"
          )) : Yn(e);
          break;
        default:
          Yn(e);
      }
      (e.mode & qe) !== Ee && 0 <= pe && 0 <= ve && (ll || 0.05 < $t) && Ea(
        e,
        pe,
        ve,
        $t,
        Lt
      ), vl(t), Mn(n), ll = o, Lt = i;
    }
    function Pd(e) {
      var t = e.deletions;
      if ((e.flags & 16) !== 0) {
        if (t !== null)
          for (var n = 0; n < t.length; n++) {
            var i = t[n], o = Ut();
            Kl = i, hu(
              i,
              e
            ), (i.mode & qe) !== Ee && 0 <= pe && 0 <= ve && 0.05 < ve - pe && ea(
              i,
              pe,
              ve,
              "Unmount"
            ), vl(o);
          }
        Np(e);
      }
      for (e = e.child; e !== null; )
        Hp(e), e = e.sibling;
    }
    function Hp(e) {
      var t = Ut(), n = na(), i = Cn(), o = aa();
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          Zd(
            e,
            e.return,
            $n
          ), Pd(e);
          break;
        case 22:
          var s = e.stateNode;
          s._visibility & ao && (s._visibility &= ~ao, Pd(e));
          break;
        default:
          Pd(e);
      }
      (e.mode & qe) !== Ee && 0 <= pe && 0 <= ve && (ll || 0.05 < $t) && Ea(
        e,
        pe,
        ve,
        $t,
        Lt
      ), vl(t), Mn(n), ll = o, Lt = i;
    }
    function hu(e, t) {
      for (; Kl !== null; ) {
        var n = Kl, i = n, o = t, s = Ut(), d = na(), h = Cn(), v = aa();
        switch (i.tag) {
          case 0:
          case 11:
          case 15:
            Zd(
              i,
              o,
              $n
            );
            break;
          case 23:
          case 22:
            i.memoizedState !== null && i.memoizedState.cachePool !== null && (o = i.memoizedState.cachePool.pool, o != null && Oc(o));
            break;
          case 24:
            bf(i.memoizedState.cache);
        }
        if ((i.mode & qe) !== Ee && 0 <= pe && 0 <= ve && (ll || 0.05 < $t) && Ea(
          i,
          pe,
          ve,
          $t,
          Lt
        ), vl(s), Mn(d), ll = v, Lt = h, i = n.child, i !== null) i.return = n, Kl = i;
        else
          e: for (n = e; Kl !== null; ) {
            if (i = Kl, s = i.sibling, d = i.return, el(i), i === n) {
              Kl = null;
              break e;
            }
            if (s !== null) {
              s.return = d, Kl = s;
              break e;
            }
            Kl = d;
          }
      }
    }
    function Bp() {
      wT.forEach(function(e) {
        return e();
      });
    }
    function qp() {
      var e = typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0;
      return e || w.actQueue === null || console.error(
        "The current testing environment is not configured to support act(...)"
      ), e;
    }
    function Vl(e) {
      if ((Ie & Yl) !== $l && we !== 0)
        return we & -we;
      var t = w.T;
      return t !== null ? (t._updatedFibers || (t._updatedFibers = /* @__PURE__ */ new Set()), t._updatedFibers.add(e), Jp()) : A0();
    }
    function es() {
      if (ma === 0)
        if ((we & 536870912) === 0 || Qe) {
          var e = vr;
          vr <<= 1, (vr & 3932160) === 0 && (vr = 262144), ma = e;
        } else ma = 536870912;
      return e = La.current, e !== null && (e.flags |= 32), ma;
    }
    function Ae(e, t, n) {
      if (sm && console.error("useInsertionEffect must not schedule updates."), yb && (Mv = !0), (e === Ot && (vt === Hr || vt === Br) || e.cancelPendingCommit !== null) && (mu(e, 0), oa(
        e,
        we,
        ma,
        !1
      )), gi(e, n), (Ie & Yl) !== $l && e === Ot) {
        if (Eu)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              e = Ge && ie(Ge) || "Unknown", C2.has(e) || (C2.add(e), t = ie(t) || "Unknown", console.error(
                "Cannot update a component (`%s`) while rendering a different component (`%s`). To locate the bad setState() call inside `%s`, follow the stack trace as described in https://react.dev/link/setstate-in-render",
                t,
                e,
                e
              ));
              break;
            case 1:
              M2 || (console.error(
                "Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state."
              ), M2 = !0);
          }
      } else
        Au && pn(e, t, n), Pf(t), e === Ot && ((Ie & Yl) === $l && (Vs |= n), kt === Gs && oa(
          e,
          we,
          ma,
          !1
        )), bn(e);
    }
    function ig(e, t, n) {
      if ((Ie & (Yl | Qa)) !== $l)
        throw Error("Should not already be working.");
      if (we !== 0 && Ge !== null) {
        var i = Ge, o = zl();
        switch (TS) {
          case t0:
          case Hr:
            var s = wy;
            Bt && ((i = i._debugTask) ? i.run(
              console.timeStamp.bind(
                console,
                "Suspended",
                s,
                o,
                Ou,
                void 0,
                "primary-light"
              )
            ) : console.timeStamp(
              "Suspended",
              s,
              o,
              Ou,
              void 0,
              "primary-light"
            ));
            break;
          case Br:
            s = wy, Bt && ((i = i._debugTask) ? i.run(
              console.timeStamp.bind(
                console,
                "Action",
                s,
                o,
                Ou,
                void 0,
                "primary-light"
              )
            ) : console.timeStamp(
              "Action",
              s,
              o,
              Ou,
              void 0,
              "primary-light"
            ));
            break;
          default:
            Bt && (i = o - wy, 3 > i || console.timeStamp(
              "Blocked",
              wy,
              o,
              Ou,
              void 0,
              5 > i ? "primary-light" : 10 > i ? "primary" : 100 > i ? "primary-dark" : "error"
            ));
        }
      }
      s = (n = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Nl(e, t)) ? ti(e, t) : ns(e, t, !0);
      var d = n;
      do {
        if (s === yo) {
          cm && !n && oa(e, t, 0, !1), t = vt, wy = Dl(), TS = t;
          break;
        } else {
          if (i = zl(), o = e.current.alternate, d && !og(o)) {
            Sa(t), o = Jl, s = i, !Bt || s <= o || (cl ? cl.run(
              console.timeStamp.bind(
                console,
                "Teared Render",
                o,
                s,
                We,
                Ke,
                "error"
              )
            ) : console.timeStamp(
              "Teared Render",
              o,
              s,
              We,
              Ke,
              "error"
            )), Zi(t, i), s = ns(e, t, !1), d = !1;
            continue;
          }
          if (s === Nr) {
            if (d = t, e.errorRecoveryDisabledLanes & d)
              var h = 0;
            else
              h = e.pendingLanes & -536870913, h = h !== 0 ? h : h & 536870912 ? 536870912 : 0;
            if (h !== 0) {
              Sa(t), jm(
                Jl,
                i,
                t,
                cl
              ), Zi(t, i), t = h;
              e: {
                i = e, s = d, d = n0;
                var v = i.current.memoizedState.isDehydrated;
                if (v && (mu(i, h).flags |= 256), h = ns(
                  i,
                  h,
                  !1
                ), h !== Nr) {
                  if (ob && !v) {
                    i.errorRecoveryDisabledLanes |= s, Vs |= s, s = Gs;
                    break e;
                  }
                  i = kn, kn = d, i !== null && (kn === null ? kn = i : kn.push.apply(
                    kn,
                    i
                  ));
                }
                s = h;
              }
              if (d = !1, s !== Nr) continue;
              i = zl();
            }
          }
          if (s === e0) {
            Sa(t), jm(
              Jl,
              i,
              t,
              cl
            ), Zi(t, i), mu(e, 0), oa(e, t, 0, !0);
            break;
          }
          e: {
            switch (n = e, s) {
              case yo:
              case e0:
                throw Error("Root did not complete. This is a bug in React.");
              case Gs:
                if ((t & 4194048) !== t) break;
              case Ev:
                Sa(t), q0(
                  Jl,
                  i,
                  t,
                  cl
                ), Zi(t, i), o = t, (o & 127) !== 0 ? iv = i : (o & 4194048) !== 0 && (cv = i), oa(
                  n,
                  t,
                  ma,
                  !Xs
                );
                break e;
              case Nr:
                kn = null;
                break;
              case Sv:
              case y2:
                break;
              default:
                throw Error("Unknown root exit status.");
            }
            if (w.actQueue !== null)
              Tt(
                n,
                o,
                t,
                kn,
                a0,
                zv,
                ma,
                Vs,
                qr,
                s,
                null,
                null,
                Jl,
                i
              );
            else {
              if ((t & 62914560) === t && (d = Ov + b2 - zl(), 10 < d)) {
                if (oa(
                  n,
                  t,
                  ma,
                  !Xs
                ), Zr(n, 0, !0) !== 0) break e;
                hi = t, n.timeoutHandle = w2(
                  cg.bind(
                    null,
                    n,
                    o,
                    kn,
                    a0,
                    zv,
                    t,
                    ma,
                    Vs,
                    qr,
                    Xs,
                    s,
                    "Throttled",
                    Jl,
                    i
                  ),
                  d
                );
                break e;
              }
              cg(
                n,
                o,
                kn,
                a0,
                zv,
                t,
                ma,
                Vs,
                qr,
                Xs,
                s,
                null,
                Jl,
                i
              );
            }
          }
        }
        break;
      } while (!0);
      bn(e);
    }
    function cg(e, t, n, i, o, s, d, h, v, S, _, M, A, q) {
      e.timeoutHandle = Xr;
      var F = t.subtreeFlags, te = null;
      if ((F & 8192 || (F & 16785408) === 16785408) && (te = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: Pn
      }, Fd(t, s, te), F = (s & 62914560) === s ? Ov - zl() : (s & 4194048) === s ? v2 - zl() : 0, F = bh(te, F), F !== null)) {
        hi = s, e.cancelPendingCommit = F(
          Tt.bind(
            null,
            e,
            t,
            s,
            n,
            i,
            o,
            d,
            h,
            v,
            _,
            te,
            te.waitingForViewTransition ? "Waiting for the previous Animation" : 0 < te.count ? 0 < te.imgCount ? "Suspended on CSS and Images" : "Suspended on CSS" : te.imgCount === 1 ? "Suspended on an Image" : 0 < te.imgCount ? "Suspended on Images" : null,
            A,
            q
          )
        ), oa(
          e,
          s,
          d,
          !S
        );
        return;
      }
      Tt(
        e,
        t,
        s,
        n,
        i,
        o,
        d,
        h,
        v,
        _,
        te,
        M,
        A,
        q
      );
    }
    function og(e) {
      for (var t = e; ; ) {
        var n = t.tag;
        if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null)))
          for (var i = 0; i < n.length; i++) {
            var o = n[i], s = o.getSnapshot;
            o = o.value;
            try {
              if (!Zn(s(), o)) return !1;
            } catch {
              return !1;
            }
          }
        if (n = t.child, t.subtreeFlags & 16384 && n !== null)
          n.return = t, t = n;
        else {
          if (t === e) break;
          for (; t.sibling === null; ) {
            if (t.return === null || t.return === e) return !0;
            t = t.return;
          }
          t.sibling.return = t.return, t = t.sibling;
        }
      }
      return !0;
    }
    function oa(e, t, n, i) {
      t &= ~sb, t &= ~Vs, e.suspendedLanes |= t, e.pingedLanes &= ~t, i && (e.warmLanes |= t), i = e.expirationTimes;
      for (var o = t; 0 < o; ) {
        var s = 31 - ql(o), d = 1 << s;
        i[s] = -1, o &= ~d;
      }
      n !== 0 && vm(e, n, t);
    }
    function Gn() {
      return (Ie & (Yl | Qa)) === $l ? (yu(0), !1) : !0;
    }
    function eh() {
      if (Ge !== null) {
        if (vt === ha)
          var e = Ge.return;
        else
          e = Ge, Ho(), Ci(e), Ih = null, Ky = 0, e = Ge;
        for (; e !== null; )
          Ep(e.alternate, e), e = e.return;
        Ge = null;
      }
    }
    function Zi(e, t) {
      (e & 127) !== 0 && (zr = t), (e & 4194048) !== 0 && (so = t), (e & 62914560) !== 0 && (SS = t), (e & 2080374784) !== 0 && (ES = t);
    }
    function mu(e, t) {
      Bt && (console.timeStamp(
        "Blocking Track",
        3e-3,
        3e-3,
        "Blocking",
        Ke,
        "primary-light"
      ), console.timeStamp(
        "Transition Track",
        3e-3,
        3e-3,
        "Transition",
        Ke,
        "primary-light"
      ), console.timeStamp(
        "Suspense Track",
        3e-3,
        3e-3,
        "Suspense",
        Ke,
        "primary-light"
      ), console.timeStamp(
        "Idle Track",
        3e-3,
        3e-3,
        "Idle",
        Ke,
        "primary-light"
      ));
      var n = Jl;
      if (Jl = Dl(), we !== 0 && 0 < n) {
        if (Sa(we), kt === Sv || kt === Gs)
          q0(
            n,
            Jl,
            t,
            cl
          );
        else {
          var i = Jl, o = cl;
          if (Bt && !(i <= n)) {
            var s = (t & 738197653) === t ? "tertiary-dark" : "primary-dark", d = (t & 536870912) === t ? "Prewarm" : (t & 201326741) === t ? "Interrupted Hydration" : "Interrupted Render";
            o ? o.run(
              console.timeStamp.bind(
                console,
                d,
                n,
                i,
                We,
                Ke,
                s
              )
            ) : console.timeStamp(
              d,
              n,
              i,
              We,
              Ke,
              s
            );
          }
        }
        Zi(we, Jl);
      }
      if (n = cl, cl = null, (t & 127) !== 0) {
        cl = By, o = 0 <= lc && lc < zr ? zr : lc, i = 0 <= Or && Or < zr ? zr : Or, s = 0 <= i ? i : 0 <= o ? o : Jl, 0 <= iv ? (Sa(2), j0(
          iv,
          s,
          t,
          n
        )) : ov & 127, n = o;
        var h = i, v = qy, S = 0 < kh, _ = qs === Hy, M = qs === uv;
        if (o = Jl, i = By, s = X1, d = L1, Bt) {
          if (We = "Blocking", 0 < n ? n > o && (n = o) : n = o, 0 < h ? h > n && (h = n) : h = n, v !== null && n > h) {
            var A = S ? "secondary-light" : "warning";
            i ? i.run(
              console.timeStamp.bind(
                console,
                S ? "Consecutive" : "Event: " + v,
                h,
                n,
                We,
                Ke,
                A
              )
            ) : console.timeStamp(
              S ? "Consecutive" : "Event: " + v,
              h,
              n,
              We,
              Ke,
              A
            );
          }
          o > n && (h = _ ? "error" : (t & 738197653) === t ? "tertiary-light" : "primary-light", _ = M ? "Promise Resolved" : _ ? "Cascading Update" : 5 < o - n ? "Update Blocked" : "Update", M = [], d != null && M.push(["Component name", d]), s != null && M.push(["Method name", s]), n = {
            start: n,
            end: o,
            detail: {
              devtools: {
                properties: M,
                track: We,
                trackGroup: Ke,
                color: h
              }
            }
          }, i ? i.run(
            performance.measure.bind(
              performance,
              _,
              n
            )
          ) : performance.measure(_, n));
        }
        lc = -1.1, qs = 0, L1 = X1 = null, iv = -1.1, kh = Or, Or = -1.1, zr = Dl();
      }
      if ((t & 4194048) !== 0 && (cl = jy, o = 0 <= fo && fo < so ? so : fo, n = 0 <= Uu && Uu < so ? so : Uu, i = 0 <= js && js < so ? so : js, s = 0 <= i ? i : 0 <= n ? n : Jl, 0 <= cv ? (Sa(256), j0(
        cv,
        s,
        t,
        cl
      )) : ov & 4194048, M = i, h = Dr, v = 0 < ws, S = V1 === uv, s = Jl, i = jy, d = vS, _ = bS, Bt && (We = "Transition", 0 < n ? n > s && (n = s) : n = s, 0 < o ? o > n && (o = n) : o = n, 0 < M ? M > o && (M = o) : M = o, o > M && h !== null && (A = v ? "secondary-light" : "warning", i ? i.run(
        console.timeStamp.bind(
          console,
          v ? "Consecutive" : "Event: " + h,
          M,
          o,
          We,
          Ke,
          A
        )
      ) : console.timeStamp(
        v ? "Consecutive" : "Event: " + h,
        M,
        o,
        We,
        Ke,
        A
      )), n > o && (i ? i.run(
        console.timeStamp.bind(
          console,
          "Action",
          o,
          n,
          We,
          Ke,
          "primary-dark"
        )
      ) : console.timeStamp(
        "Action",
        o,
        n,
        We,
        Ke,
        "primary-dark"
      )), s > n && (o = S ? "Promise Resolved" : 5 < s - n ? "Update Blocked" : "Update", M = [], _ != null && M.push(["Component name", _]), d != null && M.push(["Method name", d]), n = {
        start: n,
        end: s,
        detail: {
          devtools: {
            properties: M,
            track: We,
            trackGroup: Ke,
            color: "primary-light"
          }
        }
      }, i ? i.run(
        performance.measure.bind(
          performance,
          o,
          n
        )
      ) : performance.measure(o, n))), Uu = fo = -1.1, V1 = 0, cv = -1.1, ws = js, js = -1.1, so = Dl()), (t & 62914560) !== 0 && (ov & 62914560) !== 0 && (Sa(4194304), wm(SS, Jl)), (t & 2080374784) !== 0 && (ov & 2080374784) !== 0 && (Sa(268435456), wm(ES, Jl)), n = e.timeoutHandle, n !== Xr && (e.timeoutHandle = Xr, FT(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), hi = 0, eh(), Ot = e, Ge = n = Pa(
        e.current,
        null
      ), we = t, vt = ha, Za = null, Xs = !1, cm = Nl(e, t), ob = !1, kt = yo, qr = ma = sb = Vs = Ls = 0, kn = n0 = null, zv = !1, (t & 8) !== 0 && (t |= t & 32), i = e.entangledLanes, i !== 0)
        for (e = e.entanglements, i &= t; 0 < i; )
          o = 31 - ql(i), s = 1 << o, t |= e[o], i &= ~s;
      return ac = t, dd(), e = dS(), 1e3 < e - rS && (w.recentlyCreatedOwnerStacks = 0, rS = e), fi.discardPendingWarnings(), n;
    }
    function xa(e, t) {
      Oe = null, w.H = Fy, w.getCurrentStack = null, Eu = !1, An = null, t === Fh || t === dv ? (t = Rc(), vt = t0) : t === K1 ? (t = Rc(), vt = g2) : vt = t === nb ? cb : t !== null && typeof t == "object" && typeof t.then == "function" ? l0 : Tv, Za = t;
      var n = Ge;
      n === null ? (kt = e0, wf(
        e,
        Fl(t, e.current)
      )) : n.mode & qe && bd(n);
    }
    function jp() {
      var e = La.current;
      return e === null ? !0 : (we & 4194048) === we ? xu === null : (we & 62914560) === we || (we & 536870912) !== 0 ? e === xu : !1;
    }
    function th() {
      var e = w.H;
      return w.H = Fy, e === null ? Fy : e;
    }
    function wp() {
      var e = w.A;
      return w.A = jT, e;
    }
    function ts(e) {
      cl === null && (cl = e._debugTask == null ? null : e._debugTask);
    }
    function ls() {
      kt = Gs, Xs || (we & 4194048) !== we && La.current !== null || (cm = !0), (Ls & 134217727) === 0 && (Vs & 134217727) === 0 || Ot === null || oa(
        Ot,
        we,
        ma,
        !1
      );
    }
    function ns(e, t, n) {
      var i = Ie;
      Ie |= Yl;
      var o = th(), s = wp();
      if (Ot !== e || we !== t) {
        if (Au) {
          var d = e.memoizedUpdaters;
          0 < d.size && (us(e, we), d.clear()), wu(e, t);
        }
        a0 = null, mu(e, t);
      }
      t = !1, d = kt;
      e: do
        try {
          if (vt !== ha && Ge !== null) {
            var h = Ge, v = Za;
            switch (vt) {
              case cb:
                eh(), d = Ev;
                break e;
              case t0:
              case Hr:
              case Br:
              case l0:
                La.current === null && (t = !0);
                var S = vt;
                if (vt = ha, Za = null, as(e, h, v, S), n && cm) {
                  d = yo;
                  break e;
                }
                break;
              default:
                S = vt, vt = ha, Za = null, as(e, h, v, S);
            }
          }
          Yp(), d = kt;
          break;
        } catch (_) {
          xa(e, _);
        }
      while (!0);
      return t && e.shellSuspendCounter++, Ho(), Ie = i, w.H = o, w.A = s, Ge === null && (Ot = null, we = 0, dd()), d;
    }
    function Yp() {
      for (; Ge !== null; ) lh(Ge);
    }
    function ti(e, t) {
      var n = Ie;
      Ie |= Yl;
      var i = th(), o = wp();
      if (Ot !== e || we !== t) {
        if (Au) {
          var s = e.memoizedUpdaters;
          0 < s.size && (us(e, we), s.clear()), wu(e, t);
        }
        a0 = null, Dv = zl() + S2, mu(e, t);
      } else
        cm = Nl(
          e,
          t
        );
      e: do
        try {
          if (vt !== ha && Ge !== null)
            t: switch (t = Ge, s = Za, vt) {
              case Tv:
                vt = ha, Za = null, as(
                  e,
                  t,
                  s,
                  Tv
                );
                break;
              case Hr:
              case Br:
                if (Wm(s)) {
                  vt = ha, Za = null, Gp(t);
                  break;
                }
                t = function() {
                  vt !== Hr && vt !== Br || Ot !== e || (vt = Av), bn(e);
                }, s.then(t, t);
                break e;
              case t0:
                vt = Av;
                break e;
              case g2:
                vt = ib;
                break e;
              case Av:
                Wm(s) ? (vt = ha, Za = null, Gp(t)) : (vt = ha, Za = null, as(
                  e,
                  t,
                  s,
                  Av
                ));
                break;
              case ib:
                var d = null;
                switch (Ge.tag) {
                  case 26:
                    d = Ge.memoizedState;
                  case 5:
                  case 27:
                    var h = Ge;
                    if (d ? Xe(d) : h.stateNode.complete) {
                      vt = ha, Za = null;
                      var v = h.sibling;
                      if (v !== null) Ge = v;
                      else {
                        var S = h.return;
                        S !== null ? (Ge = S, Wf(S)) : Ge = null;
                      }
                      break t;
                    }
                    break;
                  default:
                    console.error(
                      "Unexpected type of fiber triggered a suspensey commit. This is a bug in React."
                    );
                }
                vt = ha, Za = null, as(
                  e,
                  t,
                  s,
                  ib
                );
                break;
              case l0:
                vt = ha, Za = null, as(
                  e,
                  t,
                  s,
                  l0
                );
                break;
              case cb:
                eh(), kt = Ev;
                break e;
              default:
                throw Error(
                  "Unexpected SuspendedReason. This is a bug in React."
                );
            }
          w.actQueue !== null ? Yp() : ul();
          break;
        } catch (_) {
          xa(e, _);
        }
      while (!0);
      return Ho(), w.H = i, w.A = o, Ie = n, Ge !== null ? yo : (Ot = null, we = 0, dd(), kt);
    }
    function ul() {
      for (; Ge !== null && !Ch(); )
        lh(Ge);
    }
    function lh(e) {
      var t = e.alternate;
      (e.mode & qe) !== Ee ? (Qu(e), t = le(
        e,
        Lf,
        t,
        e,
        ac
      ), bd(e)) : t = le(
        e,
        Lf,
        t,
        e,
        ac
      ), e.memoizedProps = e.pendingProps, t === null ? Wf(e) : Ge = t;
    }
    function Gp(e) {
      var t = le(e, Al, e);
      e.memoizedProps = e.pendingProps, t === null ? Wf(e) : Ge = t;
    }
    function Al(e) {
      var t = e.alternate, n = (e.mode & qe) !== Ee;
      switch (n && Qu(e), e.tag) {
        case 15:
        case 0:
          t = pp(
            t,
            e,
            e.pendingProps,
            e.type,
            void 0,
            we
          );
          break;
        case 11:
          t = pp(
            t,
            e,
            e.pendingProps,
            e.type.render,
            e.ref,
            we
          );
          break;
        case 5:
          Ci(e);
        default:
          Ep(t, e), e = Ge = Lm(e, ac), t = Lf(t, e, ac);
      }
      return n && bd(e), t;
    }
    function as(e, t, n, i) {
      Ho(), Ci(t), Ih = null, Ky = 0;
      var o = t.return;
      try {
        if (op(
          e,
          o,
          t,
          n,
          we
        )) {
          kt = e0, wf(
            e,
            Fl(n, e.current)
          ), Ge = null;
          return;
        }
      } catch (s) {
        if (o !== null) throw Ge = o, s;
        kt = e0, wf(
          e,
          Fl(n, e.current)
        ), Ge = null;
        return;
      }
      t.flags & 32768 ? (Qe || i === Tv ? e = !0 : cm || (we & 536870912) !== 0 ? e = !1 : (Xs = e = !0, (i === Hr || i === Br || i === t0 || i === l0) && (i = La.current, i !== null && i.tag === 13 && (i.flags |= 16384))), Xp(t, e)) : Wf(t);
    }
    function Wf(e) {
      var t = e;
      do {
        if ((t.flags & 32768) !== 0) {
          Xp(
            t,
            Xs
          );
          return;
        }
        var n = t.alternate;
        if (e = t.return, Qu(t), n = le(
          t,
          Sp,
          n,
          t,
          ac
        ), (t.mode & qe) !== Ee && Sf(t), n !== null) {
          Ge = n;
          return;
        }
        if (t = t.sibling, t !== null) {
          Ge = t;
          return;
        }
        Ge = t = e;
      } while (t !== null);
      kt === yo && (kt = y2);
    }
    function Xp(e, t) {
      do {
        var n = P0(e.alternate, e);
        if (n !== null) {
          n.flags &= 32767, Ge = n;
          return;
        }
        if ((e.mode & qe) !== Ee) {
          Sf(e), n = e.actualDuration;
          for (var i = e.child; i !== null; )
            n += i.actualDuration, i = i.sibling;
          e.actualDuration = n;
        }
        if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
          Ge = e;
          return;
        }
        Ge = e = n;
      } while (e !== null);
      kt = Ev, Ge = null;
    }
    function Tt(e, t, n, i, o, s, d, h, v, S, _, M, A, q) {
      e.cancelPendingCommit = null;
      do
        Ff();
      while (Ul !== Zs);
      if (fi.flushLegacyContextWarning(), fi.flushPendingUnsafeLifecycleWarnings(), (Ie & (Yl | Qa)) !== $l)
        throw Error("Should not already be working.");
      if (Sa(n), S === Nr ? jm(
        A,
        q,
        n,
        cl
      ) : i !== null ? f1(
        A,
        q,
        n,
        i,
        t !== null && t.alternate !== null && t.alternate.memoizedState.isDehydrated && (t.flags & 256) !== 0,
        cl
      ) : s1(
        A,
        q,
        n,
        cl
      ), t !== null) {
        if (n === 0 && console.error(
          "finishedLanes should not be empty during a commit. This is a bug in React."
        ), t === e.current)
          throw Error(
            "Cannot commit the same tree as before. This error is likely caused by a bug in React. Please file an issue."
          );
        if (s = t.lanes | t.childLanes, s |= q1, u1(
          e,
          n,
          s,
          d,
          h,
          v
        ), e === Ot && (Ge = Ot = null, we = 0), om = t, Js = e, hi = n, db = s, mb = o, D2 = i, hb = q, _2 = M, mi = _v, R2 = null, t.actualDuration !== 0 || (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, is(eo, function() {
          return f0 = window.event, mi === _v && (mi = rb), If(), null;
        })) : (e.callbackNode = null, e.callbackPriority = 0), oo = null, Bs = Dl(), M !== null && r1(
          q,
          Bs,
          M,
          cl
        ), i = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || i) {
          i = w.T, w.T = null, o = ut.p, ut.p = hl, d = Ie, Ie |= Qa;
          try {
            m1(e, t, n);
          } finally {
            Ie = d, ut.p = o, w.T = i;
          }
        }
        Ul = T2, cn(), pu(), Lp();
      }
    }
    function cn() {
      if (Ul === T2) {
        Ul = Zs;
        var e = Js, t = om, n = hi, i = (t.flags & 13878) !== 0;
        if ((t.subtreeFlags & 13878) !== 0 || i) {
          i = w.T, w.T = null;
          var o = ut.p;
          ut.p = hl;
          var s = Ie;
          Ie |= Qa;
          try {
            um = n, im = e, Dc(), Jf(t, e), im = um = null, n = Ob;
            var d = sd(e.containerInfo), h = n.focusedElem, v = n.selectionRange;
            if (d !== h && h && h.ownerDocument && x0(
              h.ownerDocument.documentElement,
              h
            )) {
              if (v !== null && Hm(h)) {
                var S = v.start, _ = v.end;
                if (_ === void 0 && (_ = S), "selectionStart" in h)
                  h.selectionStart = S, h.selectionEnd = Math.min(
                    _,
                    h.value.length
                  );
                else {
                  var M = h.ownerDocument || document, A = M && M.defaultView || window;
                  if (A.getSelection) {
                    var q = A.getSelection(), F = h.textContent.length, te = Math.min(
                      v.start,
                      F
                    ), Mt = v.end === void 0 ? te : Math.min(v.end, F);
                    !q.extend && te > Mt && (d = Mt, Mt = te, te = d);
                    var $e = U0(
                      h,
                      te
                    ), T = U0(
                      h,
                      Mt
                    );
                    if ($e && T && (q.rangeCount !== 1 || q.anchorNode !== $e.node || q.anchorOffset !== $e.offset || q.focusNode !== T.node || q.focusOffset !== T.offset)) {
                      var z = M.createRange();
                      z.setStart($e.node, $e.offset), q.removeAllRanges(), te > Mt ? (q.addRange(z), q.extend(T.node, T.offset)) : (z.setEnd(T.node, T.offset), q.addRange(z));
                    }
                  }
                }
              }
              for (M = [], q = h; q = q.parentNode; )
                q.nodeType === 1 && M.push({
                  element: q,
                  left: q.scrollLeft,
                  top: q.scrollTop
                });
              for (typeof h.focus == "function" && h.focus(), h = 0; h < M.length; h++) {
                var D = M[h];
                D.element.scrollLeft = D.left, D.element.scrollTop = D.top;
              }
            }
            Vv = !!zb, Ob = zb = null;
          } finally {
            Ie = s, ut.p = o, w.T = i;
          }
        }
        e.current = t, Ul = A2;
      }
    }
    function pu() {
      if (Ul === A2) {
        Ul = Zs;
        var e = R2;
        if (e !== null) {
          Bs = Dl();
          var t = co, n = Bs;
          !Bt || n <= t || console.timeStamp(
            e,
            t,
            n,
            We,
            Ke,
            "secondary-light"
          );
        }
        e = Js, t = om, n = hi;
        var i = (t.flags & 8772) !== 0;
        if ((t.subtreeFlags & 8772) !== 0 || i) {
          i = w.T, w.T = null;
          var o = ut.p;
          ut.p = hl;
          var s = Ie;
          Ie |= Qa;
          try {
            um = n, im = e, Dc(), kd(
              e,
              t.alternate,
              t
            ), im = um = null;
          } finally {
            Ie = s, ut.p = o, w.T = i;
          }
        }
        e = hb, t = _2, co = Dl(), e = t === null ? e : Bs, t = co, n = mi === fb, i = cl, oo !== null ? w0(
          e,
          t,
          oo,
          !1,
          i
        ) : !Bt || t <= e || (i ? i.run(
          console.timeStamp.bind(
            console,
            n ? "Commit Interrupted View Transition" : "Commit",
            e,
            t,
            We,
            Ke,
            n ? "error" : "secondary-dark"
          )
        ) : console.timeStamp(
          n ? "Commit Interrupted View Transition" : "Commit",
          e,
          t,
          We,
          Ke,
          n ? "error" : "secondary-dark"
        )), Ul = z2;
      }
    }
    function Lp() {
      if (Ul === O2 || Ul === z2) {
        if (Ul === O2) {
          var e = co;
          co = Dl();
          var t = co, n = mi === fb;
          !Bt || t <= e || console.timeStamp(
            n ? "Interrupted View Transition" : "Starting Animation",
            e,
            t,
            We,
            Ke,
            n ? " error" : "secondary-light"
          ), mi !== fb && (mi = E2);
        }
        Ul = Zs, Uh(), e = Js;
        var i = om;
        t = hi, n = D2;
        var o = i.actualDuration !== 0 || (i.subtreeFlags & 10256) !== 0 || (i.flags & 10256) !== 0;
        o ? Ul = Rv : (Ul = Zs, om = Js = null, Vp(
          e,
          e.pendingLanes
        ), jr = 0, i0 = null);
        var s = e.pendingLanes;
        if (s === 0 && (Qs = null), o || uh(e), s = kl(t), i = i.stateNode, dl && typeof dl.onCommitFiberRoot == "function")
          try {
            var d = (i.current.flags & 128) === 128;
            switch (s) {
              case hl:
                var h = by;
                break;
              case jl:
                h = xh;
                break;
              case Zl:
                h = eo;
                break;
              case Pi:
                h = Nh;
                break;
              default:
                h = eo;
            }
            dl.onCommitFiberRoot(
              to,
              i,
              h,
              d
            );
          } catch (M) {
            Tu || (Tu = !0, console.error(
              "React instrumentation encountered an error: %o",
              M
            ));
          }
        if (Au && e.memoizedUpdaters.clear(), Bp(), n !== null) {
          d = w.T, h = ut.p, ut.p = hl, w.T = null;
          try {
            var v = e.onRecoverableError;
            for (i = 0; i < n.length; i++) {
              var S = n[i], _ = sg(S.stack);
              le(
                S.source,
                v,
                S.value,
                _
              );
            }
          } finally {
            w.T = d, ut.p = h;
          }
        }
        (hi & 3) !== 0 && Ff(), bn(e), s = e.pendingLanes, (t & 261930) !== 0 && (s & 42) !== 0 ? (fv = !0, e === pb ? u0++ : (u0 = 0, pb = e)) : u0 = 0, o || Zi(t, co), yu(0);
      }
    }
    function sg(e) {
      return e = { componentStack: e }, Object.defineProperty(e, "digest", {
        get: function() {
          console.error(
            'You are accessing "digest" from the errorInfo object passed to onRecoverableError. This property is no longer provided as part of errorInfo but can be accessed as a property of the Error instance itself.'
          );
        }
      }), e;
    }
    function Vp(e, t) {
      (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, bf(t)));
    }
    function Ff() {
      return cn(), pu(), Lp(), If();
    }
    function If() {
      if (Ul !== Rv) return !1;
      var e = Js, t = db;
      db = 0;
      var n = kl(hi), i = Zl > n ? Zl : n;
      n = w.T;
      var o = ut.p;
      try {
        ut.p = i, w.T = null;
        var s = mb;
        mb = null, i = Js;
        var d = hi;
        if (Ul = Zs, om = Js = null, hi = 0, (Ie & (Yl | Qa)) !== $l)
          throw Error("Cannot flush passive effects while already rendering.");
        Sa(d), yb = !0, Mv = !1;
        var h = 0;
        if (oo = null, h = zl(), mi === E2)
          wm(
            co,
            h,
            CT
          );
        else {
          var v = co, S = h, _ = mi === rb;
          !Bt || S <= v || (cl ? cl.run(
            console.timeStamp.bind(
              console,
              _ ? "Waiting for Paint" : "Waiting",
              v,
              S,
              We,
              Ke,
              "secondary-light"
            )
          ) : console.timeStamp(
            _ ? "Waiting for Paint" : "Waiting",
            v,
            S,
            We,
            Ke,
            "secondary-light"
          ));
        }
        v = Ie, Ie |= Qa;
        var M = i.current;
        Dc(), Id(M);
        var A = i.current;
        M = hb, Dc(), xp(
          i,
          A,
          d,
          s,
          M
        ), uh(i), Ie = v;
        var q = zl();
        if (A = h, M = cl, oo !== null ? w0(
          A,
          q,
          oo,
          !0,
          M
        ) : !Bt || q <= A || (M ? M.run(
          console.timeStamp.bind(
            console,
            "Remaining Effects",
            A,
            q,
            We,
            Ke,
            "secondary-dark"
          )
        ) : console.timeStamp(
          "Remaining Effects",
          A,
          q,
          We,
          Ke,
          "secondary-dark"
        )), Zi(d, q), yu(0, !1), Mv ? i === i0 ? jr++ : (jr = 0, i0 = i) : jr = 0, Mv = yb = !1, dl && typeof dl.onPostCommitFiberRoot == "function")
          try {
            dl.onPostCommitFiberRoot(to, i);
          } catch (te) {
            Tu || (Tu = !0, console.error(
              "React instrumentation encountered an error: %o",
              te
            ));
          }
        var F = i.current.stateNode;
        return F.effectDuration = 0, F.passiveEffectDuration = 0, !0;
      } finally {
        ut.p = o, w.T = n, Vp(e, t);
      }
    }
    function on(e, t, n) {
      t = Fl(n, t), Q0(t), t = Bd(e.stateNode, t, 2), e = nu(e, t, 2), e !== null && (gi(e, 2), bn(e));
    }
    function xe(e, t, n) {
      if (sm = !1, e.tag === 3)
        on(e, e, n);
      else {
        for (; t !== null; ) {
          if (t.tag === 3) {
            on(
              t,
              e,
              n
            );
            return;
          }
          if (t.tag === 1) {
            var i = t.stateNode;
            if (typeof t.type.getDerivedStateFromError == "function" || typeof i.componentDidCatch == "function" && (Qs === null || !Qs.has(i))) {
              e = Fl(n, e), Q0(e), n = qd(2), i = nu(t, n, 2), i !== null && (jd(
                n,
                i,
                t,
                e
              ), gi(i, 2), bn(i));
              return;
            }
          }
          t = t.return;
        }
        console.error(
          `Internal React error: Attempted to capture a commit phase error inside a detached tree. This indicates a bug in React. Potential causes include deleting the same fiber more than once, committing an already-finished tree, or an inconsistent return pointer.

Error message:

%s`,
          n
        );
      }
    }
    function nh(e, t, n) {
      var i = e.pingCache;
      if (i === null) {
        i = e.pingCache = new YT();
        var o = /* @__PURE__ */ new Set();
        i.set(t, o);
      } else
        o = i.get(t), o === void 0 && (o = /* @__PURE__ */ new Set(), i.set(t, o));
      o.has(n) || (ob = !0, o.add(n), i = vn.bind(null, e, t, n), Au && us(e, n), t.then(i, i));
    }
    function vn(e, t, n) {
      var i = e.pingCache;
      i !== null && i.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, (n & 127) !== 0 ? 0 > lc && (zr = lc = Dl(), By = av("Promise Resolved"), qs = uv) : (n & 4194048) !== 0 && 0 > Uu && (so = Uu = Dl(), jy = av("Promise Resolved"), V1 = uv), qp() && w.actQueue === null && console.error(
        `A suspended resource finished loading inside a test, but the event was not wrapped in act(...).

When testing, code that resolves suspended data should be wrapped into act(...):

act(() => {
  /* finish loading suspended data */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act`
      ), Ot === e && (we & n) === n && (kt === Gs || kt === Sv && (we & 62914560) === we && zl() - Ov < b2 ? (Ie & Yl) === $l && mu(e, 0) : sb |= n, qr === we && (qr = 0)), bn(e);
    }
    function Qp(e, t) {
      t === 0 && (t = Jr()), e = Xl(e, t), e !== null && (gi(e, t), bn(e));
    }
    function li(e) {
      var t = e.memoizedState, n = 0;
      t !== null && (n = t.retryLane), Qp(e, n);
    }
    function Zc(e, t) {
      var n = 0;
      switch (e.tag) {
        case 31:
        case 13:
          var i = e.stateNode, o = e.memoizedState;
          o !== null && (n = o.retryLane);
          break;
        case 19:
          i = e.stateNode;
          break;
        case 22:
          i = e.stateNode._retryCache;
          break;
        default:
          throw Error(
            "Pinged unknown suspense boundary type. This is probably a bug in React."
          );
      }
      i !== null && i.delete(t), Qp(e, n);
    }
    function Na(e, t, n) {
      if ((t.subtreeFlags & 67117056) !== 0)
        for (t = t.child; t !== null; ) {
          var i = e, o = t, s = o.type === rn;
          s = n || s, o.tag !== 22 ? o.flags & 67108864 ? s && le(
            o,
            ah,
            i,
            o
          ) : Na(
            i,
            o,
            s
          ) : o.memoizedState === null && (s && o.flags & 8192 ? le(
            o,
            ah,
            i,
            o
          ) : o.subtreeFlags & 67108864 && le(
            o,
            Na,
            i,
            o,
            s
          )), t = t.sibling;
        }
    }
    function ah(e, t) {
      St(!0);
      try {
        Wd(t), Hp(t), Up(e, t.alternate, t, !1), kf(e, t, 0, null, !1, 0);
      } finally {
        St(!1);
      }
    }
    function uh(e) {
      var t = !0;
      e.current.mode & (zn | si) || (t = !1), Na(
        e,
        e.current,
        t
      );
    }
    function sa(e) {
      if ((Ie & Yl) === $l) {
        var t = e.tag;
        if (t === 3 || t === 1 || t === 0 || t === 11 || t === 14 || t === 15) {
          if (t = ie(e) || "ReactComponent", Cv !== null) {
            if (Cv.has(t)) return;
            Cv.add(t);
          } else Cv = /* @__PURE__ */ new Set([t]);
          le(e, function() {
            console.error(
              "Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously tries to update the component. Move this work to useEffect instead."
            );
          });
        }
      }
    }
    function us(e, t) {
      Au && e.memoizedUpdaters.forEach(function(n) {
        pn(e, n, t);
      });
    }
    function is(e, t) {
      var n = w.actQueue;
      return n !== null ? (n.push(t), LT) : vy(e, t);
    }
    function Pf(e) {
      qp() && w.actQueue === null && le(e, function() {
        console.error(
          `An update to %s inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act`,
          ie(e)
        );
      });
    }
    function bn(e) {
      e !== fm && e.next === null && (fm === null ? Uv = fm = e : fm = fm.next = e), xv = !0, w.actQueue !== null ? vb || (vb = !0, rg()) : gb || (gb = !0, rg());
    }
    function yu(e, t) {
      if (!bb && xv) {
        bb = !0;
        do
          for (var n = !1, i = Uv; i !== null; ) {
            if (e !== 0) {
              var o = i.pendingLanes;
              if (o === 0) var s = 0;
              else {
                var d = i.suspendedLanes, h = i.pingedLanes;
                s = (1 << 31 - ql(42 | e) + 1) - 1, s &= o & ~(d & ~h), s = s & 201326741 ? s & 201326741 | 1 : s ? s | 2 : 0;
              }
              s !== 0 && (n = !0, er(i, s));
            } else
              s = we, s = Zr(
                i,
                i === Ot ? s : 0,
                i.cancelPendingCommit !== null || i.timeoutHandle !== Xr
              ), (s & 3) === 0 || Nl(i, s) || (n = !0, er(i, s));
            i = i.next;
          }
        while (n);
        bb = !1;
      }
    }
    function fg() {
      f0 = window.event, ih();
    }
    function ih() {
      xv = vb = gb = !1;
      var e = 0;
      Ks !== 0 && $p() && (e = Ks);
      for (var t = zl(), n = null, i = Uv; i !== null; ) {
        var o = i.next, s = cs(i, t);
        s === 0 ? (i.next = null, n === null ? Uv = o : n.next = o, o === null && (fm = n)) : (n = i, (e !== 0 || (s & 3) !== 0) && (xv = !0)), i = o;
      }
      Ul !== Zs && Ul !== Rv || yu(e), Ks !== 0 && (Ks = 0);
    }
    function cs(e, t) {
      for (var n = e.suspendedLanes, i = e.pingedLanes, o = e.expirationTimes, s = e.pendingLanes & -62914561; 0 < s; ) {
        var d = 31 - ql(s), h = 1 << d, v = o[d];
        v === -1 ? ((h & n) === 0 || (h & i) !== 0) && (o[d] = a1(h, t)) : v <= t && (e.expiredLanes |= h), s &= ~h;
      }
      if (t = Ot, n = we, n = Zr(
        e,
        e === t ? n : 0,
        e.cancelPendingCommit !== null || e.timeoutHandle !== Xr
      ), i = e.callbackNode, n === 0 || e === t && (vt === Hr || vt === Br) || e.cancelPendingCommit !== null)
        return i !== null && ch(i), e.callbackNode = null, e.callbackPriority = 0;
      if ((n & 3) === 0 || Nl(e, n)) {
        if (t = n & -n, t !== e.callbackPriority || w.actQueue !== null && i !== Sb)
          ch(i);
        else return t;
        switch (kl(n)) {
          case hl:
          case jl:
            n = xh;
            break;
          case Zl:
            n = eo;
            break;
          case Pi:
            n = Nh;
            break;
          default:
            n = eo;
        }
        return i = Zp.bind(null, e), w.actQueue !== null ? (w.actQueue.push(i), n = Sb) : n = vy(n, i), e.callbackPriority = t, e.callbackNode = n, t;
      }
      return i !== null && ch(i), e.callbackPriority = 2, e.callbackNode = null, 2;
    }
    function Zp(e, t) {
      if (fv = sv = !1, f0 = window.event, Ul !== Zs && Ul !== Rv)
        return e.callbackNode = null, e.callbackPriority = 0, null;
      var n = e.callbackNode;
      if (mi === _v && (mi = rb), Ff() && e.callbackNode !== n)
        return null;
      var i = we;
      return i = Zr(
        e,
        e === Ot ? i : 0,
        e.cancelPendingCommit !== null || e.timeoutHandle !== Xr
      ), i === 0 ? null : (ig(
        e,
        i,
        t
      ), cs(e, zl()), e.callbackNode != null && e.callbackNode === n ? Zp.bind(null, e) : null);
    }
    function er(e, t) {
      if (Ff()) return null;
      sv = fv, fv = !1, ig(e, t, !0);
    }
    function ch(e) {
      e !== Sb && e !== null && Mh(e);
    }
    function rg() {
      w.actQueue !== null && w.actQueue.push(function() {
        return ih(), null;
      }), IT(function() {
        (Ie & (Yl | Qa)) !== $l ? vy(
          by,
          fg
        ) : ih();
      });
    }
    function Jp() {
      if (Ks === 0) {
        var e = _r;
        e === 0 && (e = Os, Os <<= 1, (Os & 261888) === 0 && (Os = 256)), Ks = e;
      }
      return Ks;
    }
    function et(e) {
      return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : (dt(e, "action"), sf("" + e));
    }
    function pt(e, t) {
      var n = t.ownerDocument.createElement("input");
      return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
    }
    function Ve(e, t, n, i, o) {
      if (t === "submit" && n && n.stateNode === o) {
        var s = et(
          (o[dn] || null).action
        ), d = i.submitter;
        d && (t = (t = d[dn] || null) ? et(t.formAction) : d.getAttribute("formAction"), t !== null && (s = t, d = null));
        var h = new Fg(
          "action",
          "action",
          null,
          i,
          o
        );
        e.push({
          event: h,
          listeners: [
            {
              instance: null,
              listener: function() {
                if (i.defaultPrevented) {
                  if (Ks !== 0) {
                    var v = d ? pt(
                      o,
                      d
                    ) : new FormData(o), S = {
                      pending: !0,
                      data: v,
                      method: o.method,
                      action: s
                    };
                    Object.freeze(S), Iu(
                      n,
                      S,
                      null,
                      v
                    );
                  }
                } else
                  typeof s == "function" && (h.preventDefault(), v = d ? pt(
                    o,
                    d
                  ) : new FormData(o), S = {
                    pending: !0,
                    data: v,
                    method: o.method,
                    action: s
                  }, Object.freeze(S), Iu(
                    n,
                    S,
                    s,
                    v
                  ));
              },
              currentTarget: o
            }
          ]
        });
      }
    }
    function Ye(e, t, n) {
      e.currentTarget = n;
      try {
        t(e);
      } catch (i) {
        x1(i);
      }
      e.currentTarget = null;
    }
    function ft(e, t) {
      t = (t & 4) !== 0;
      for (var n = 0; n < e.length; n++) {
        var i = e[n];
        e: {
          var o = void 0, s = i.event;
          if (i = i.listeners, t)
            for (var d = i.length - 1; 0 <= d; d--) {
              var h = i[d], v = h.instance, S = h.currentTarget;
              if (h = h.listener, v !== o && s.isPropagationStopped())
                break e;
              v !== null ? le(
                v,
                Ye,
                s,
                h,
                S
              ) : Ye(s, h, S), o = v;
            }
          else
            for (d = 0; d < i.length; d++) {
              if (h = i[d], v = h.instance, S = h.currentTarget, h = h.listener, v !== o && s.isPropagationStopped())
                break e;
              v !== null ? le(
                v,
                Ye,
                s,
                h,
                S
              ) : Ye(s, h, S), o = v;
            }
        }
      }
    }
    function be(e, t) {
      Eb.has(e) || console.error(
        'Did not expect a listenToNonDelegatedEvent() call for "%s". This is a bug in React. Please file an issue.',
        e
      );
      var n = t[lo];
      n === void 0 && (n = t[lo] = /* @__PURE__ */ new Set());
      var i = e + "__bubble";
      n.has(i) || (oh(t, e, 2, !1), n.add(i));
    }
    function gu(e, t, n) {
      Eb.has(e) && !t && console.error(
        'Did not expect a listenToNativeEvent() call for "%s" in the bubble phase. This is a bug in React. Please file an issue.',
        e
      );
      var i = 0;
      t && (i |= 4), oh(
        n,
        e,
        i,
        t
      );
    }
    function Ji(e) {
      if (!e[Nv]) {
        e[Nv] = !0, Jg.forEach(function(n) {
          n !== "selectionchange" && (Eb.has(n) || gu(n, !1, e), gu(n, !0, e));
        });
        var t = e.nodeType === 9 ? e : e.ownerDocument;
        t === null || t[Nv] || (t[Nv] = !0, gu("selectionchange", !1, t));
      }
    }
    function oh(e, t, n, i) {
      switch (Th(t)) {
        case hl:
          var o = cy;
          break;
        case jl:
          o = Bl;
          break;
        default:
          o = oy;
      }
      n = o.bind(
        null,
        t,
        n,
        e
      ), o = void 0, !T1 || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), i ? o !== void 0 ? e.addEventListener(t, n, {
        capture: !0,
        passive: o
      }) : e.addEventListener(t, n, !0) : o !== void 0 ? e.addEventListener(t, n, {
        passive: o
      }) : e.addEventListener(
        t,
        n,
        !1
      );
    }
    function Ha(e, t, n, i, o) {
      var s = i;
      if ((t & 1) === 0 && (t & 2) === 0 && i !== null)
        e: for (; ; ) {
          if (i === null) return;
          var d = i.tag;
          if (d === 3 || d === 4) {
            var h = i.stateNode.containerInfo;
            if (h === o) break;
            if (d === 4)
              for (d = i.return; d !== null; ) {
                var v = d.tag;
                if ((v === 3 || v === 4) && d.stateNode.containerInfo === o)
                  return;
                d = d.return;
              }
            for (; h !== null; ) {
              if (d = Yu(h), d === null) return;
              if (v = d.tag, v === 5 || v === 6 || v === 26 || v === 27) {
                i = s = d;
                continue e;
              }
              h = h.parentNode;
            }
          }
          i = i.return;
        }
      ud(function() {
        var S = s, _ = va(n), M = [];
        e: {
          var A = fS.get(e);
          if (A !== void 0) {
            var q = Fg, F = e;
            switch (e) {
              case "keypress":
                if (ff(n) === 0) break e;
              case "keydown":
              case "keyup":
                q = nT;
                break;
              case "focusin":
                F = "focus", q = D1;
                break;
              case "focusout":
                F = "blur", q = D1;
                break;
              case "beforeblur":
              case "afterblur":
                q = D1;
                break;
              case "click":
                if (n.button === 2) break e;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                q = Wb;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                q = ZE;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                q = iT;
                break;
              case iS:
              case cS:
              case oS:
                q = $E;
                break;
              case sS:
                q = oT;
                break;
              case "scroll":
              case "scrollend":
                q = VE;
                break;
              case "wheel":
                q = fT;
                break;
              case "copy":
              case "cut":
              case "paste":
                q = WE;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                q = Ib;
                break;
              case "toggle":
              case "beforetoggle":
                q = dT;
            }
            var te = (t & 4) !== 0, Mt = !te && (e === "scroll" || e === "scrollend"), $e = te ? A !== null ? A + "Capture" : null : A;
            te = [];
            for (var T = S, z; T !== null; ) {
              var D = T;
              if (z = D.stateNode, D = D.tag, D !== 5 && D !== 26 && D !== 27 || z === null || $e === null || (D = Fa(T, $e), D != null && te.push(
                At(
                  T,
                  D,
                  z
                )
              )), Mt) break;
              T = T.return;
            }
            0 < te.length && (A = new q(
              A,
              F,
              null,
              n,
              _
            ), M.push({
              event: A,
              listeners: te
            }));
          }
        }
        if ((t & 7) === 0) {
          e: {
            if (A = e === "mouseover" || e === "pointerover", q = e === "mouseout" || e === "pointerout", A && n !== zy && (F = n.relatedTarget || n.fromElement) && (Yu(F) || F[oi]))
              break e;
            if ((q || A) && (A = _.window === _ ? _ : (A = _.ownerDocument) ? A.defaultView || A.parentWindow : window, q ? (F = n.relatedTarget || n.toElement, q = S, F = F ? Yu(F) : null, F !== null && (Mt = Je(F), te = F.tag, F !== Mt || te !== 5 && te !== 27 && te !== 6) && (F = null)) : (q = null, F = S), q !== F)) {
              if (te = Wb, D = "onMouseLeave", $e = "onMouseEnter", T = "mouse", (e === "pointerout" || e === "pointerover") && (te = Ib, D = "onPointerLeave", $e = "onPointerEnter", T = "pointer"), Mt = q == null ? A : vi(q), z = F == null ? A : vi(F), A = new te(
                D,
                T + "leave",
                q,
                n,
                _
              ), A.target = Mt, A.relatedTarget = z, D = null, Yu(_) === S && (te = new te(
                $e,
                T + "enter",
                F,
                n,
                _
              ), te.target = z, te.relatedTarget = Mt, D = te), Mt = D, q && F)
                t: {
                  for (te = Jc, $e = q, T = F, z = 0, D = $e; D; D = te(D))
                    z++;
                  D = 0;
                  for (var V = T; V; V = te(V))
                    D++;
                  for (; 0 < z - D; )
                    $e = te($e), z--;
                  for (; 0 < D - z; )
                    T = te(T), D--;
                  for (; z--; ) {
                    if ($e === T || T !== null && $e === T.alternate) {
                      te = $e;
                      break t;
                    }
                    $e = te($e), T = te(T);
                  }
                  te = null;
                }
              else te = null;
              q !== null && sh(
                M,
                A,
                q,
                te,
                !1
              ), F !== null && Mt !== null && sh(
                M,
                Mt,
                F,
                te,
                !0
              );
            }
          }
          e: {
            if (A = S ? vi(S) : window, q = A.nodeName && A.nodeName.toLowerCase(), q === "select" || q === "input" && A.type === "file")
              var P = Ti;
            else if (Um(A))
              if (aS)
                P = mf;
              else {
                P = xm;
                var De = o1;
              }
            else
              q = A.nodeName, !q || q.toLowerCase() !== "input" || A.type !== "checkbox" && A.type !== "radio" ? S && Wa(S.elementType) && (P = Ti) : P = Nm;
            if (P && (P = P(e, S))) {
              df(
                M,
                P,
                n,
                _
              );
              break e;
            }
            De && De(e, A, S), e === "focusout" && S && A.type === "number" && S.memoizedProps.value != null && Tm(A, "number", A.value);
          }
          switch (De = S ? vi(S) : window, e) {
            case "focusin":
              (Um(De) || De.contentEditable === "true") && (Xh = De, R1 = S, Uy = null);
              break;
            case "focusout":
              Uy = R1 = Xh = null;
              break;
            case "mousedown":
              M1 = !0;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              M1 = !1, N0(
                M,
                n,
                _
              );
              break;
            case "selectionchange":
              if (yT) break;
            case "keydown":
            case "keyup":
              N0(
                M,
                n,
                _
              );
          }
          var he;
          if (_1)
            e: {
              switch (e) {
                case "compositionstart":
                  var oe = "onCompositionStart";
                  break e;
                case "compositionend":
                  oe = "onCompositionEnd";
                  break e;
                case "compositionupdate":
                  oe = "onCompositionUpdate";
                  break e;
              }
              oe = void 0;
            }
          else
            Gh ? Mo(e, n) && (oe = "onCompositionEnd") : e === "keydown" && n.keyCode === Pb && (oe = "onCompositionStart");
          oe && (eS && n.locale !== "ko" && (Gh || oe !== "onCompositionStart" ? oe === "onCompositionEnd" && Gh && (he = yc()) : (Cs = _, A1 = "value" in Cs ? Cs.value : Cs.textContent, Gh = !0)), De = Ba(
            S,
            oe
          ), 0 < De.length && (oe = new Fb(
            oe,
            e,
            null,
            n,
            _
          ), M.push({
            event: oe,
            listeners: De
          }), he ? oe.data = he : (he = Lu(n), he !== null && (oe.data = he)))), (he = mT ? Cm(e, n) : id(e, n)) && (oe = Ba(
            S,
            "onBeforeInput"
          ), 0 < oe.length && (De = new IE(
            "onBeforeInput",
            "beforeinput",
            null,
            n,
            _
          ), M.push({
            event: De,
            listeners: oe
          }), De.data = he)), Ve(
            M,
            e,
            S,
            n,
            _
          );
        }
        ft(M, t);
      });
    }
    function At(e, t, n) {
      return {
        instance: e,
        listener: t,
        currentTarget: n
      };
    }
    function Ba(e, t) {
      for (var n = t + "Capture", i = []; e !== null; ) {
        var o = e, s = o.stateNode;
        if (o = o.tag, o !== 5 && o !== 26 && o !== 27 || s === null || (o = Fa(e, n), o != null && i.unshift(
          At(e, o, s)
        ), o = Fa(e, t), o != null && i.push(
          At(e, o, s)
        )), e.tag === 3) return i;
        e = e.return;
      }
      return [];
    }
    function Jc(e) {
      if (e === null) return null;
      do
        e = e.return;
      while (e && e.tag !== 5 && e.tag !== 27);
      return e || null;
    }
    function sh(e, t, n, i, o) {
      for (var s = t._reactName, d = []; n !== null && n !== i; ) {
        var h = n, v = h.alternate, S = h.stateNode;
        if (h = h.tag, v !== null && v === i) break;
        h !== 5 && h !== 26 && h !== 27 || S === null || (v = S, o ? (S = Fa(n, s), S != null && d.unshift(
          At(n, S, v)
        )) : o || (S = Fa(n, s), S != null && d.push(
          At(n, S, v)
        ))), n = n.return;
      }
      d.length !== 0 && e.push({ event: t, listeners: d });
    }
    function sn(e, t) {
      R0(e, t), e !== "input" && e !== "textarea" && e !== "select" || t == null || t.value !== null || $b || ($b = !0, e === "select" && t.multiple ? console.error(
        "`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.",
        e
      ) : console.error(
        "`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.",
        e
      ));
      var n = {
        registrationNameDependencies: zu,
        possibleRegistrationNames: Rs
      };
      Wa(e) || typeof t.is == "string" || c1(e, t, n), t.contentEditable && !t.suppressContentEditableWarning && t.children != null && console.error(
        "A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional."
      );
    }
    function Gt(e, t, n, i) {
      t !== n && (n = qa(n), qa(t) !== n && (i[e] = t));
    }
    function tr(e, t, n) {
      t.forEach(function(i) {
        n[ni(i)] = i === "style" ? Ki(e) : e.getAttribute(i);
      });
    }
    function Xt(e, t) {
      t === !1 ? console.error(
        "Expected `%s` listener to be a function, instead got `false`.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.",
        e,
        e,
        e
      ) : console.error(
        "Expected `%s` listener to be a function, instead got a value of `%s` type.",
        e,
        typeof t
      );
    }
    function fh(e, t) {
      return e = e.namespaceURI === _e || e.namespaceURI === Ne ? e.ownerDocument.createElementNS(
        e.namespaceURI,
        e.tagName
      ) : e.ownerDocument.createElement(e.tagName), e.innerHTML = t, e.innerHTML;
    }
    function qa(e) {
      return Ja(e) && (console.error(
        "The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before using it here.",
        lf(e)
      ), cc(e)), (typeof e == "string" ? e : "" + e).replace(VT, `
`).replace(QT, "");
    }
    function Kp(e, t) {
      return t = qa(t), qa(e) === t;
    }
    function at(e, t, n, i, o, s) {
      switch (n) {
        case "children":
          typeof i == "string" ? (of(i, t, !1), t === "body" || t === "textarea" && i === "" || pc(e, i)) : (typeof i == "number" || typeof i == "bigint") && (of("" + i, t, !1), t !== "body" && pc(e, "" + i));
          break;
        case "className":
          af(e, "class", i);
          break;
        case "tabIndex":
          af(e, "tabindex", i);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          af(e, n, i);
          break;
        case "style":
          _m(e, i, s);
          break;
        case "data":
          if (t !== "object") {
            af(e, "data", i);
            break;
          }
        case "src":
        case "href":
          if (i === "" && (t !== "a" || n !== "href")) {
            console.error(
              n === "src" ? 'An empty string ("") was passed to the %s attribute. This may cause the browser to download the whole page again over the network. To fix this, either do not render the element at all or pass null to %s instead of an empty string.' : 'An empty string ("") was passed to the %s attribute. To fix this, either do not render the element at all or pass null to %s instead of an empty string.',
              n,
              n
            ), e.removeAttribute(n);
            break;
          }
          if (i == null || typeof i == "function" || typeof i == "symbol" || typeof i == "boolean") {
            e.removeAttribute(n);
            break;
          }
          dt(i, n), i = sf("" + i), e.setAttribute(n, i);
          break;
        case "action":
        case "formAction":
          if (i != null && (t === "form" ? n === "formAction" ? console.error(
            "You can only pass the formAction prop to <input> or <button>. Use the action prop on <form>."
          ) : typeof i == "function" && (o.encType == null && o.method == null || qv || (qv = !0, console.error(
            "Cannot specify a encType or method for a form that specifies a function as the action. React provides those automatically. They will get overridden."
          )), o.target == null || Bv || (Bv = !0, console.error(
            "Cannot specify a target for a form that specifies a function as the action. The function will always be executed in the same window."
          ))) : t === "input" || t === "button" ? n === "action" ? console.error(
            "You can only pass the action prop to <form>. Use the formAction prop on <input> or <button>."
          ) : t !== "input" || o.type === "submit" || o.type === "image" || Hv ? t !== "button" || o.type == null || o.type === "submit" || Hv ? typeof i == "function" && (o.name == null || N2 || (N2 = !0, console.error(
            'Cannot specify a "name" prop for a button that specifies a function as a formAction. React needs it to encode which action should be invoked. It will get overridden.'
          )), o.formEncType == null && o.formMethod == null || qv || (qv = !0, console.error(
            "Cannot specify a formEncType or formMethod for a button that specifies a function as a formAction. React provides those automatically. They will get overridden."
          )), o.formTarget == null || Bv || (Bv = !0, console.error(
            "Cannot specify a formTarget for a button that specifies a function as a formAction. The function will always be executed in the same window."
          ))) : (Hv = !0, console.error(
            'A button can only specify a formAction along with type="submit" or no type.'
          )) : (Hv = !0, console.error(
            'An input can only specify a formAction along with type="submit" or type="image".'
          )) : console.error(
            n === "action" ? "You can only pass the action prop to <form>." : "You can only pass the formAction prop to <input> or <button>."
          )), typeof i == "function") {
            e.setAttribute(
              n,
              "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
            );
            break;
          } else
            typeof s == "function" && (n === "formAction" ? (t !== "input" && at(e, t, "name", o.name, o, null), at(
              e,
              t,
              "formEncType",
              o.formEncType,
              o,
              null
            ), at(
              e,
              t,
              "formMethod",
              o.formMethod,
              o,
              null
            ), at(
              e,
              t,
              "formTarget",
              o.formTarget,
              o,
              null
            )) : (at(
              e,
              t,
              "encType",
              o.encType,
              o,
              null
            ), at(e, t, "method", o.method, o, null), at(
              e,
              t,
              "target",
              o.target,
              o,
              null
            )));
          if (i == null || typeof i == "symbol" || typeof i == "boolean") {
            e.removeAttribute(n);
            break;
          }
          dt(i, n), i = sf("" + i), e.setAttribute(n, i);
          break;
        case "onClick":
          i != null && (typeof i != "function" && Xt(n, i), e.onclick = Pn);
          break;
        case "onScroll":
          i != null && (typeof i != "function" && Xt(n, i), be("scroll", e));
          break;
        case "onScrollEnd":
          i != null && (typeof i != "function" && Xt(n, i), be("scrollend", e));
          break;
        case "dangerouslySetInnerHTML":
          if (i != null) {
            if (typeof i != "object" || !("__html" in i))
              throw Error(
                "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information."
              );
            if (n = i.__html, n != null) {
              if (o.children != null)
                throw Error(
                  "Can only set one of `children` or `props.dangerouslySetInnerHTML`."
                );
              e.innerHTML = n;
            }
          }
          break;
        case "multiple":
          e.multiple = i && typeof i != "function" && typeof i != "symbol";
          break;
        case "muted":
          e.muted = i && typeof i != "function" && typeof i != "symbol";
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
          break;
        case "autoFocus":
          break;
        case "xlinkHref":
          if (i == null || typeof i == "function" || typeof i == "boolean" || typeof i == "symbol") {
            e.removeAttribute("xlink:href");
            break;
          }
          dt(i, n), n = sf("" + i), e.setAttributeNS(wr, "xlink:href", n);
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          i != null && typeof i != "function" && typeof i != "symbol" ? (dt(i, n), e.setAttribute(n, "" + i)) : e.removeAttribute(n);
          break;
        case "inert":
          i !== "" || jv[n] || (jv[n] = !0, console.error(
            "Received an empty string for a boolean attribute `%s`. This will treat the attribute as if it were false. Either pass `false` to silence this warning, or pass `true` if you used an empty string in earlier versions of React to indicate this attribute is true.",
            n
          ));
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
          i && typeof i != "function" && typeof i != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
          break;
        case "capture":
        case "download":
          i === !0 ? e.setAttribute(n, "") : i !== !1 && i != null && typeof i != "function" && typeof i != "symbol" ? (dt(i, n), e.setAttribute(n, i)) : e.removeAttribute(n);
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          i != null && typeof i != "function" && typeof i != "symbol" && !isNaN(i) && 1 <= i ? (dt(i, n), e.setAttribute(n, i)) : e.removeAttribute(n);
          break;
        case "rowSpan":
        case "start":
          i == null || typeof i == "function" || typeof i == "symbol" || isNaN(i) ? e.removeAttribute(n) : (dt(i, n), e.setAttribute(n, i));
          break;
        case "popover":
          be("beforetoggle", e), be("toggle", e), $r(e, "popover", i);
          break;
        case "xlinkActuate":
          Ka(
            e,
            wr,
            "xlink:actuate",
            i
          );
          break;
        case "xlinkArcrole":
          Ka(
            e,
            wr,
            "xlink:arcrole",
            i
          );
          break;
        case "xlinkRole":
          Ka(
            e,
            wr,
            "xlink:role",
            i
          );
          break;
        case "xlinkShow":
          Ka(
            e,
            wr,
            "xlink:show",
            i
          );
          break;
        case "xlinkTitle":
          Ka(
            e,
            wr,
            "xlink:title",
            i
          );
          break;
        case "xlinkType":
          Ka(
            e,
            wr,
            "xlink:type",
            i
          );
          break;
        case "xmlBase":
          Ka(
            e,
            Tb,
            "xml:base",
            i
          );
          break;
        case "xmlLang":
          Ka(
            e,
            Tb,
            "xml:lang",
            i
          );
          break;
        case "xmlSpace":
          Ka(
            e,
            Tb,
            "xml:space",
            i
          );
          break;
        case "is":
          s != null && console.error(
            'Cannot update the "is" prop after it has been initialized.'
          ), $r(e, "is", i);
          break;
        case "innerText":
        case "textContent":
          break;
        case "popoverTarget":
          H2 || i == null || typeof i != "object" || (H2 = !0, console.error(
            "The `popoverTarget` prop expects the ID of an Element as a string. Received %s instead.",
            i
          ));
        default:
          !(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N" ? (n = D0(n), $r(e, n, i)) : zu.hasOwnProperty(n) && i != null && typeof i != "function" && Xt(n, i);
      }
    }
    function os(e, t, n, i, o, s) {
      switch (n) {
        case "style":
          _m(e, i, s);
          break;
        case "dangerouslySetInnerHTML":
          if (i != null) {
            if (typeof i != "object" || !("__html" in i))
              throw Error(
                "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information."
              );
            if (n = i.__html, n != null) {
              if (o.children != null)
                throw Error(
                  "Can only set one of `children` or `props.dangerouslySetInnerHTML`."
                );
              e.innerHTML = n;
            }
          }
          break;
        case "children":
          typeof i == "string" ? pc(e, i) : (typeof i == "number" || typeof i == "bigint") && pc(e, "" + i);
          break;
        case "onScroll":
          i != null && (typeof i != "function" && Xt(n, i), be("scroll", e));
          break;
        case "onScrollEnd":
          i != null && (typeof i != "function" && Xt(n, i), be("scrollend", e));
          break;
        case "onClick":
          i != null && (typeof i != "function" && Xt(n, i), e.onclick = Pn);
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          if (zu.hasOwnProperty(n))
            i != null && typeof i != "function" && Xt(n, i);
          else
            e: {
              if (n[0] === "o" && n[1] === "n" && (o = n.endsWith("Capture"), t = n.slice(2, o ? n.length - 7 : void 0), s = e[dn] || null, s = s != null ? s[n] : null, typeof s == "function" && e.removeEventListener(t, s, o), typeof i == "function")) {
                typeof s != "function" && s !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, i, o);
                break e;
              }
              n in e ? e[n] = i : i === !0 ? e.setAttribute(n, "") : $r(e, n, i);
            }
      }
    }
    function Nt(e, t, n) {
      switch (sn(t, n), t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "img":
          be("error", e), be("load", e);
          var i = !1, o = !1, s;
          for (s in n)
            if (n.hasOwnProperty(s)) {
              var d = n[s];
              if (d != null)
                switch (s) {
                  case "src":
                    i = !0;
                    break;
                  case "srcSet":
                    o = !0;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(
                      t + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`."
                    );
                  default:
                    at(e, t, s, d, n, null);
                }
            }
          o && at(e, t, "srcSet", n.srcSet, n, null), i && at(e, t, "src", n.src, n, null);
          return;
        case "input":
          fc("input", n), be("invalid", e);
          var h = s = d = o = null, v = null, S = null;
          for (i in n)
            if (n.hasOwnProperty(i)) {
              var _ = n[i];
              if (_ != null)
                switch (i) {
                  case "name":
                    o = _;
                    break;
                  case "type":
                    d = _;
                    break;
                  case "checked":
                    v = _;
                    break;
                  case "defaultChecked":
                    S = _;
                    break;
                  case "value":
                    s = _;
                    break;
                  case "defaultValue":
                    h = _;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (_ != null)
                      throw Error(
                        t + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`."
                      );
                    break;
                  default:
                    at(e, t, i, _, n, null);
                }
            }
          Wl(e, n), Fr(
            e,
            s,
            h,
            v,
            S,
            d,
            o,
            !1
          );
          return;
        case "select":
          fc("select", n), be("invalid", e), i = d = s = null;
          for (o in n)
            if (n.hasOwnProperty(o) && (h = n[o], h != null))
              switch (o) {
                case "value":
                  s = h;
                  break;
                case "defaultValue":
                  d = h;
                  break;
                case "multiple":
                  i = h;
                default:
                  at(
                    e,
                    t,
                    o,
                    h,
                    n,
                    null
                  );
              }
          Ir(e, n), t = s, n = d, e.multiple = !!i, t != null ? $a(e, !!i, t, !1) : n != null && $a(e, !!i, n, !0);
          return;
        case "textarea":
          fc("textarea", n), be("invalid", e), s = o = i = null;
          for (d in n)
            if (n.hasOwnProperty(d) && (h = n[d], h != null))
              switch (d) {
                case "value":
                  i = h;
                  break;
                case "defaultValue":
                  o = h;
                  break;
                case "children":
                  s = h;
                  break;
                case "dangerouslySetInnerHTML":
                  if (h != null)
                    throw Error(
                      "`dangerouslySetInnerHTML` does not make sense on <textarea>."
                    );
                  break;
                default:
                  at(
                    e,
                    t,
                    d,
                    h,
                    n,
                    null
                  );
              }
          rc(e, n), Ao(e, i, o, s);
          return;
        case "option":
          O0(e, n);
          for (v in n)
            if (n.hasOwnProperty(v) && (i = n[v], i != null))
              switch (v) {
                case "selected":
                  e.selected = i && typeof i != "function" && typeof i != "symbol";
                  break;
                default:
                  at(e, t, v, i, n, null);
              }
          return;
        case "dialog":
          be("beforetoggle", e), be("toggle", e), be("cancel", e), be("close", e);
          break;
        case "iframe":
        case "object":
          be("load", e);
          break;
        case "video":
        case "audio":
          for (i = 0; i < c0.length; i++)
            be(c0[i], e);
          break;
        case "image":
          be("error", e), be("load", e);
          break;
        case "details":
          be("toggle", e);
          break;
        case "embed":
        case "source":
        case "link":
          be("error", e), be("load", e);
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
          for (S in n)
            if (n.hasOwnProperty(S) && (i = n[S], i != null))
              switch (S) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(
                    t + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`."
                  );
                default:
                  at(e, t, S, i, n, null);
              }
          return;
        default:
          if (Wa(t)) {
            for (_ in n)
              n.hasOwnProperty(_) && (i = n[_], i !== void 0 && os(
                e,
                t,
                _,
                i,
                n,
                void 0
              ));
            return;
          }
      }
      for (h in n)
        n.hasOwnProperty(h) && (i = n[h], i != null && at(e, t, h, i, n, null));
    }
    function rl(e, t, n, i) {
      switch (sn(t, i), t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "input":
          var o = null, s = null, d = null, h = null, v = null, S = null, _ = null;
          for (q in n) {
            var M = n[q];
            if (n.hasOwnProperty(q) && M != null)
              switch (q) {
                case "checked":
                  break;
                case "value":
                  break;
                case "defaultValue":
                  v = M;
                default:
                  i.hasOwnProperty(q) || at(
                    e,
                    t,
                    q,
                    null,
                    i,
                    M
                  );
              }
          }
          for (var A in i) {
            var q = i[A];
            if (M = n[A], i.hasOwnProperty(A) && (q != null || M != null))
              switch (A) {
                case "type":
                  s = q;
                  break;
                case "name":
                  o = q;
                  break;
                case "checked":
                  S = q;
                  break;
                case "defaultChecked":
                  _ = q;
                  break;
                case "value":
                  d = q;
                  break;
                case "defaultValue":
                  h = q;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (q != null)
                    throw Error(
                      t + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`."
                    );
                  break;
                default:
                  q !== M && at(
                    e,
                    t,
                    A,
                    q,
                    i,
                    M
                  );
              }
          }
          t = n.type === "checkbox" || n.type === "radio" ? n.checked != null : n.value != null, i = i.type === "checkbox" || i.type === "radio" ? i.checked != null : i.value != null, t || !i || x2 || (console.error(
            "A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://react.dev/link/controlled-components"
          ), x2 = !0), !t || i || U2 || (console.error(
            "A component is changing a controlled input to be uncontrolled. This is likely caused by the value changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://react.dev/link/controlled-components"
          ), U2 = !0), bi(
            e,
            d,
            h,
            v,
            S,
            _,
            s,
            o
          );
          return;
        case "select":
          q = d = h = A = null;
          for (s in n)
            if (v = n[s], n.hasOwnProperty(s) && v != null)
              switch (s) {
                case "value":
                  break;
                case "multiple":
                  q = v;
                default:
                  i.hasOwnProperty(s) || at(
                    e,
                    t,
                    s,
                    null,
                    i,
                    v
                  );
              }
          for (o in i)
            if (s = i[o], v = n[o], i.hasOwnProperty(o) && (s != null || v != null))
              switch (o) {
                case "value":
                  A = s;
                  break;
                case "defaultValue":
                  h = s;
                  break;
                case "multiple":
                  d = s;
                default:
                  s !== v && at(
                    e,
                    t,
                    o,
                    s,
                    i,
                    v
                  );
              }
          i = h, t = d, n = q, A != null ? $a(e, !!t, A, !1) : !!n != !!t && (i != null ? $a(e, !!t, i, !0) : $a(e, !!t, t ? [] : "", !1));
          return;
        case "textarea":
          q = A = null;
          for (h in n)
            if (o = n[h], n.hasOwnProperty(h) && o != null && !i.hasOwnProperty(h))
              switch (h) {
                case "value":
                  break;
                case "children":
                  break;
                default:
                  at(e, t, h, null, i, o);
              }
          for (d in i)
            if (o = i[d], s = n[d], i.hasOwnProperty(d) && (o != null || s != null))
              switch (d) {
                case "value":
                  A = o;
                  break;
                case "defaultValue":
                  q = o;
                  break;
                case "children":
                  break;
                case "dangerouslySetInnerHTML":
                  if (o != null)
                    throw Error(
                      "`dangerouslySetInnerHTML` does not make sense on <textarea>."
                    );
                  break;
                default:
                  o !== s && at(e, t, d, o, i, s);
              }
          dc(e, A, q);
          return;
        case "option":
          for (var F in n)
            if (A = n[F], n.hasOwnProperty(F) && A != null && !i.hasOwnProperty(F))
              switch (F) {
                case "selected":
                  e.selected = !1;
                  break;
                default:
                  at(
                    e,
                    t,
                    F,
                    null,
                    i,
                    A
                  );
              }
          for (v in i)
            if (A = i[v], q = n[v], i.hasOwnProperty(v) && A !== q && (A != null || q != null))
              switch (v) {
                case "selected":
                  e.selected = A && typeof A != "function" && typeof A != "symbol";
                  break;
                default:
                  at(
                    e,
                    t,
                    v,
                    A,
                    i,
                    q
                  );
              }
          return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
          for (var te in n)
            A = n[te], n.hasOwnProperty(te) && A != null && !i.hasOwnProperty(te) && at(
              e,
              t,
              te,
              null,
              i,
              A
            );
          for (S in i)
            if (A = i[S], q = n[S], i.hasOwnProperty(S) && A !== q && (A != null || q != null))
              switch (S) {
                case "children":
                case "dangerouslySetInnerHTML":
                  if (A != null)
                    throw Error(
                      t + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`."
                    );
                  break;
                default:
                  at(
                    e,
                    t,
                    S,
                    A,
                    i,
                    q
                  );
              }
          return;
        default:
          if (Wa(t)) {
            for (var Mt in n)
              A = n[Mt], n.hasOwnProperty(Mt) && A !== void 0 && !i.hasOwnProperty(Mt) && os(
                e,
                t,
                Mt,
                void 0,
                i,
                A
              );
            for (_ in i)
              A = i[_], q = n[_], !i.hasOwnProperty(_) || A === q || A === void 0 && q === void 0 || os(
                e,
                t,
                _,
                A,
                i,
                q
              );
            return;
          }
      }
      for (var $e in n)
        A = n[$e], n.hasOwnProperty($e) && A != null && !i.hasOwnProperty($e) && at(e, t, $e, null, i, A);
      for (M in i)
        A = i[M], q = n[M], !i.hasOwnProperty(M) || A === q || A == null && q == null || at(e, t, M, A, i, q);
    }
    function ni(e) {
      switch (e) {
        case "class":
          return "className";
        case "for":
          return "htmlFor";
        default:
          return e;
      }
    }
    function Ki(e) {
      var t = {};
      e = e.style;
      for (var n = 0; n < e.length; n++) {
        var i = e[n];
        t[i] = e.getPropertyValue(i);
      }
      return t;
    }
    function vu(e, t, n) {
      if (t != null && typeof t != "object")
        console.error(
          "The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX."
        );
      else {
        var i, o = i = "", s;
        for (s in t)
          if (t.hasOwnProperty(s)) {
            var d = t[s];
            d != null && typeof d != "boolean" && d !== "" && (s.indexOf("--") === 0 ? (pm(d, s), i += o + s + ":" + ("" + d).trim()) : typeof d != "number" || d === 0 || ce.has(s) ? (pm(d, s), i += o + s.replace(Y, "-$1").toLowerCase().replace(ue, "-ms-") + ":" + ("" + d).trim()) : i += o + s.replace(Y, "-$1").toLowerCase().replace(ue, "-ms-") + ":" + d + "px", o = ";");
          }
        i = i || null, t = e.getAttribute("style"), t !== i && (i = qa(i), qa(t) !== i && (n.style = Ki(e)));
      }
    }
    function Sn(e, t, n, i, o, s) {
      if (o.delete(n), e = e.getAttribute(n), e === null)
        switch (typeof i) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            return;
        }
      else if (i != null)
        switch (typeof i) {
          case "function":
          case "symbol":
          case "boolean":
            break;
          default:
            if (dt(i, t), e === "" + i)
              return;
        }
      Gt(t, e, i, s);
    }
    function rh(e, t, n, i, o, s) {
      if (o.delete(n), e = e.getAttribute(n), e === null) {
        switch (typeof i) {
          case "function":
          case "symbol":
            return;
        }
        if (!i) return;
      } else
        switch (typeof i) {
          case "function":
          case "symbol":
            break;
          default:
            if (i) return;
        }
      Gt(t, e, i, s);
    }
    function dh(e, t, n, i, o, s) {
      if (o.delete(n), e = e.getAttribute(n), e === null)
        switch (typeof i) {
          case "undefined":
          case "function":
          case "symbol":
            return;
        }
      else if (i != null)
        switch (typeof i) {
          case "function":
          case "symbol":
            break;
          default:
            if (dt(i, n), e === "" + i)
              return;
        }
      Gt(t, e, i, s);
    }
    function ss(e, t, n, i, o, s) {
      if (o.delete(n), e = e.getAttribute(n), e === null)
        switch (typeof i) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            return;
          default:
            if (isNaN(i)) return;
        }
      else if (i != null)
        switch (typeof i) {
          case "function":
          case "symbol":
          case "boolean":
            break;
          default:
            if (!isNaN(i) && (dt(i, t), e === "" + i))
              return;
        }
      Gt(t, e, i, s);
    }
    function lr(e, t, n, i, o, s) {
      if (o.delete(n), e = e.getAttribute(n), e === null)
        switch (typeof i) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            return;
        }
      else if (i != null)
        switch (typeof i) {
          case "function":
          case "symbol":
          case "boolean":
            break;
          default:
            if (dt(i, t), n = sf("" + i), e === n)
              return;
        }
      Gt(t, e, i, s);
    }
    function En(e, t, n, i) {
      for (var o = {}, s = /* @__PURE__ */ new Set(), d = e.attributes, h = 0; h < d.length; h++)
        switch (d[h].name.toLowerCase()) {
          case "value":
            break;
          case "checked":
            break;
          case "selected":
            break;
          default:
            s.add(d[h].name);
        }
      if (Wa(t)) {
        for (var v in n)
          if (n.hasOwnProperty(v)) {
            var S = n[v];
            if (S != null) {
              if (zu.hasOwnProperty(v))
                typeof S != "function" && Xt(v, S);
              else if (n.suppressHydrationWarning !== !0)
                switch (v) {
                  case "children":
                    typeof S != "string" && typeof S != "number" || Gt(
                      "children",
                      e.textContent,
                      S,
                      o
                    );
                    continue;
                  case "suppressContentEditableWarning":
                  case "suppressHydrationWarning":
                  case "defaultValue":
                  case "defaultChecked":
                  case "innerHTML":
                  case "ref":
                    continue;
                  case "dangerouslySetInnerHTML":
                    d = e.innerHTML, S = S ? S.__html : void 0, S != null && (S = fh(e, S), Gt(
                      v,
                      d,
                      S,
                      o
                    ));
                    continue;
                  case "style":
                    s.delete(v), vu(e, S, o);
                    continue;
                  case "offsetParent":
                  case "offsetTop":
                  case "offsetLeft":
                  case "offsetWidth":
                  case "offsetHeight":
                  case "isContentEditable":
                  case "outerText":
                  case "outerHTML":
                    s.delete(v.toLowerCase()), console.error(
                      "Assignment to read-only property will result in a no-op: `%s`",
                      v
                    );
                    continue;
                  case "className":
                    s.delete("class"), d = To(
                      e,
                      "class",
                      S
                    ), Gt(
                      "className",
                      d,
                      S,
                      o
                    );
                    continue;
                  default:
                    i.context === go && t !== "svg" && t !== "math" ? s.delete(v.toLowerCase()) : s.delete(v), d = To(
                      e,
                      v,
                      S
                    ), Gt(
                      v,
                      d,
                      S,
                      o
                    );
                }
            }
          }
      } else
        for (S in n)
          if (n.hasOwnProperty(S) && (v = n[S], v != null)) {
            if (zu.hasOwnProperty(S))
              typeof v != "function" && Xt(S, v);
            else if (n.suppressHydrationWarning !== !0)
              switch (S) {
                case "children":
                  typeof v != "string" && typeof v != "number" || Gt(
                    "children",
                    e.textContent,
                    v,
                    o
                  );
                  continue;
                case "suppressContentEditableWarning":
                case "suppressHydrationWarning":
                case "value":
                case "checked":
                case "selected":
                case "defaultValue":
                case "defaultChecked":
                case "innerHTML":
                case "ref":
                  continue;
                case "dangerouslySetInnerHTML":
                  d = e.innerHTML, v = v ? v.__html : void 0, v != null && (v = fh(e, v), d !== v && (o[S] = { __html: d }));
                  continue;
                case "className":
                  Sn(
                    e,
                    S,
                    "class",
                    v,
                    s,
                    o
                  );
                  continue;
                case "tabIndex":
                  Sn(
                    e,
                    S,
                    "tabindex",
                    v,
                    s,
                    o
                  );
                  continue;
                case "style":
                  s.delete(S), vu(e, v, o);
                  continue;
                case "multiple":
                  s.delete(S), Gt(
                    S,
                    e.multiple,
                    v,
                    o
                  );
                  continue;
                case "muted":
                  s.delete(S), Gt(
                    S,
                    e.muted,
                    v,
                    o
                  );
                  continue;
                case "autoFocus":
                  s.delete("autofocus"), Gt(
                    S,
                    e.autofocus,
                    v,
                    o
                  );
                  continue;
                case "data":
                  if (t !== "object") {
                    s.delete(S), d = e.getAttribute("data"), Gt(
                      S,
                      d,
                      v,
                      o
                    );
                    continue;
                  }
                case "src":
                case "href":
                  if (!(v !== "" || t === "a" && S === "href" || t === "object" && S === "data")) {
                    console.error(
                      S === "src" ? 'An empty string ("") was passed to the %s attribute. This may cause the browser to download the whole page again over the network. To fix this, either do not render the element at all or pass null to %s instead of an empty string.' : 'An empty string ("") was passed to the %s attribute. To fix this, either do not render the element at all or pass null to %s instead of an empty string.',
                      S,
                      S
                    );
                    continue;
                  }
                  lr(
                    e,
                    S,
                    S,
                    v,
                    s,
                    o
                  );
                  continue;
                case "action":
                case "formAction":
                  if (d = e.getAttribute(S), typeof v == "function") {
                    s.delete(S.toLowerCase()), S === "formAction" ? (s.delete("name"), s.delete("formenctype"), s.delete("formmethod"), s.delete("formtarget")) : (s.delete("enctype"), s.delete("method"), s.delete("target"));
                    continue;
                  } else if (d === ZT) {
                    s.delete(S.toLowerCase()), Gt(
                      S,
                      "function",
                      v,
                      o
                    );
                    continue;
                  }
                  lr(
                    e,
                    S,
                    S.toLowerCase(),
                    v,
                    s,
                    o
                  );
                  continue;
                case "xlinkHref":
                  lr(
                    e,
                    S,
                    "xlink:href",
                    v,
                    s,
                    o
                  );
                  continue;
                case "contentEditable":
                  dh(
                    e,
                    S,
                    "contenteditable",
                    v,
                    s,
                    o
                  );
                  continue;
                case "spellCheck":
                  dh(
                    e,
                    S,
                    "spellcheck",
                    v,
                    s,
                    o
                  );
                  continue;
                case "draggable":
                case "autoReverse":
                case "externalResourcesRequired":
                case "focusable":
                case "preserveAlpha":
                  dh(
                    e,
                    S,
                    S,
                    v,
                    s,
                    o
                  );
                  continue;
                case "allowFullScreen":
                case "async":
                case "autoPlay":
                case "controls":
                case "default":
                case "defer":
                case "disabled":
                case "disablePictureInPicture":
                case "disableRemotePlayback":
                case "formNoValidate":
                case "hidden":
                case "loop":
                case "noModule":
                case "noValidate":
                case "open":
                case "playsInline":
                case "readOnly":
                case "required":
                case "reversed":
                case "scoped":
                case "seamless":
                case "itemScope":
                  rh(
                    e,
                    S,
                    S.toLowerCase(),
                    v,
                    s,
                    o
                  );
                  continue;
                case "capture":
                case "download":
                  e: {
                    h = e;
                    var _ = d = S, M = o;
                    if (s.delete(_), h = h.getAttribute(_), h === null)
                      switch (typeof v) {
                        case "undefined":
                        case "function":
                        case "symbol":
                          break e;
                        default:
                          if (v === !1) break e;
                      }
                    else if (v != null)
                      switch (typeof v) {
                        case "function":
                        case "symbol":
                          break;
                        case "boolean":
                          if (v === !0 && h === "") break e;
                          break;
                        default:
                          if (dt(v, d), h === "" + v)
                            break e;
                      }
                    Gt(
                      d,
                      h,
                      v,
                      M
                    );
                  }
                  continue;
                case "cols":
                case "rows":
                case "size":
                case "span":
                  e: {
                    if (h = e, _ = d = S, M = o, s.delete(_), h = h.getAttribute(_), h === null)
                      switch (typeof v) {
                        case "undefined":
                        case "function":
                        case "symbol":
                        case "boolean":
                          break e;
                        default:
                          if (isNaN(v) || 1 > v) break e;
                      }
                    else if (v != null)
                      switch (typeof v) {
                        case "function":
                        case "symbol":
                        case "boolean":
                          break;
                        default:
                          if (!(isNaN(v) || 1 > v) && (dt(v, d), h === "" + v))
                            break e;
                      }
                    Gt(
                      d,
                      h,
                      v,
                      M
                    );
                  }
                  continue;
                case "rowSpan":
                  ss(
                    e,
                    S,
                    "rowspan",
                    v,
                    s,
                    o
                  );
                  continue;
                case "start":
                  ss(
                    e,
                    S,
                    S,
                    v,
                    s,
                    o
                  );
                  continue;
                case "xHeight":
                  Sn(
                    e,
                    S,
                    "x-height",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xlinkActuate":
                  Sn(
                    e,
                    S,
                    "xlink:actuate",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xlinkArcrole":
                  Sn(
                    e,
                    S,
                    "xlink:arcrole",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xlinkRole":
                  Sn(
                    e,
                    S,
                    "xlink:role",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xlinkShow":
                  Sn(
                    e,
                    S,
                    "xlink:show",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xlinkTitle":
                  Sn(
                    e,
                    S,
                    "xlink:title",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xlinkType":
                  Sn(
                    e,
                    S,
                    "xlink:type",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xmlBase":
                  Sn(
                    e,
                    S,
                    "xml:base",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xmlLang":
                  Sn(
                    e,
                    S,
                    "xml:lang",
                    v,
                    s,
                    o
                  );
                  continue;
                case "xmlSpace":
                  Sn(
                    e,
                    S,
                    "xml:space",
                    v,
                    s,
                    o
                  );
                  continue;
                case "inert":
                  v !== "" || jv[S] || (jv[S] = !0, console.error(
                    "Received an empty string for a boolean attribute `%s`. This will treat the attribute as if it were false. Either pass `false` to silence this warning, or pass `true` if you used an empty string in earlier versions of React to indicate this attribute is true.",
                    S
                  )), rh(
                    e,
                    S,
                    S,
                    v,
                    s,
                    o
                  );
                  continue;
                default:
                  if (!(2 < S.length) || S[0] !== "o" && S[0] !== "O" || S[1] !== "n" && S[1] !== "N") {
                    h = D0(S), d = !1, i.context === go && t !== "svg" && t !== "math" ? s.delete(h.toLowerCase()) : (_ = S.toLowerCase(), _ = Ga.hasOwnProperty(
                      _
                    ) && Ga[_] || null, _ !== null && _ !== S && (d = !0, s.delete(_)), s.delete(h));
                    e: if (_ = e, M = h, h = v, nf(M))
                      if (_.hasAttribute(M))
                        _ = _.getAttribute(
                          M
                        ), dt(
                          h,
                          M
                        ), h = _ === "" + h ? h : _;
                      else {
                        switch (typeof h) {
                          case "function":
                          case "symbol":
                            break e;
                          case "boolean":
                            if (_ = M.toLowerCase().slice(0, 5), _ !== "data-" && _ !== "aria-")
                              break e;
                        }
                        h = h === void 0 ? void 0 : null;
                      }
                    else h = void 0;
                    d || Gt(
                      S,
                      h,
                      v,
                      o
                    );
                  }
              }
          }
      return 0 < s.size && n.suppressHydrationWarning !== !0 && tr(e, s, o), Object.keys(o).length === 0 ? null : o;
    }
    function dg(e, t) {
      switch (e.length) {
        case 0:
          return "";
        case 1:
          return e[0];
        case 2:
          return e[0] + " " + t + " " + e[1];
        default:
          return e.slice(0, -1).join(", ") + ", " + t + " " + e[e.length - 1];
      }
    }
    function fn(e) {
      switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
          return !0;
        default:
          return !1;
      }
    }
    function hg() {
      if (typeof performance.getEntriesByType == "function") {
        for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), i = 0; i < n.length; i++) {
          var o = n[i], s = o.transferSize, d = o.initiatorType, h = o.duration;
          if (s && h && fn(d)) {
            for (d = 0, h = o.responseEnd, i += 1; i < n.length; i++) {
              var v = n[i], S = v.startTime;
              if (S > h) break;
              var _ = v.transferSize, M = v.initiatorType;
              _ && fn(M) && (v = v.responseEnd, d += _ * (v < h ? 1 : (h - S) / (v - S)));
            }
            if (--i, t += 8 * (s + d) / (o.duration / 1e3), e++, 10 < e) break;
          }
        }
        if (0 < e) return t / e / 1e6;
      }
      return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
    }
    function nr(e) {
      return e.nodeType === 9 ? e : e.ownerDocument;
    }
    function mg(e) {
      switch (e) {
        case Ne:
          return dm;
        case _e:
          return Yv;
        default:
          return go;
      }
    }
    function ai(e, t) {
      if (e === go)
        switch (t) {
          case "svg":
            return dm;
          case "math":
            return Yv;
          default:
            return go;
        }
      return e === dm && t === "foreignObject" ? go : e;
    }
    function fs(e, t) {
      return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
    }
    function $p() {
      var e = window.event;
      return e && e.type === "popstate" ? e === Db ? !1 : (Db = e, !0) : (Db = null, !1);
    }
    function bu() {
      var e = window.event;
      return e && e !== f0 ? e.type : null;
    }
    function rs() {
      var e = window.event;
      return e && e !== f0 ? e.timeStamp : -1.1;
    }
    function pg(e) {
      setTimeout(function() {
        throw e;
      });
    }
    function yg(e, t, n) {
      switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          n.autoFocus && e.focus();
          break;
        case "img":
          n.src ? e.src = n.src : n.srcSet && (e.srcset = n.srcSet);
      }
    }
    function gg() {
    }
    function hh(e, t, n, i) {
      rl(e, t, n, i), e[dn] = i;
    }
    function mh(e) {
      pc(e, "");
    }
    function p1(e, t, n) {
      e.nodeValue = n;
    }
    function vg(e) {
      if (!e.__reactWarnedAboutChildrenConflict) {
        var t = e[dn] || null;
        if (t !== null) {
          var n = pa(e);
          n !== null && (typeof t.children == "string" || typeof t.children == "number" ? (e.__reactWarnedAboutChildrenConflict = !0, le(n, function() {
            console.error(
              'Cannot use a ref on a React element as a container to `createRoot` or `createPortal` if that element also sets "children" text content using React. It should be a leaf with no children. Otherwise it\'s ambiguous which children should be used.'
            );
          })) : t.dangerouslySetInnerHTML != null && (e.__reactWarnedAboutChildrenConflict = !0, le(n, function() {
            console.error(
              'Cannot use a ref on a React element as a container to `createRoot` or `createPortal` if that element also sets "dangerouslySetInnerHTML" using React. It should be a leaf with no children. Otherwise it\'s ambiguous which children should be used.'
            );
          })));
        }
      }
    }
    function $i(e) {
      return e === "head";
    }
    function bg(e, t) {
      e.removeChild(t);
    }
    function Sg(e, t) {
      (e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e).removeChild(t);
    }
    function Kc(e, t) {
      var n = t, i = 0;
      do {
        var o = n.nextSibling;
        if (e.removeChild(n), o && o.nodeType === 8)
          if (n = o.data, n === s0 || n === wv) {
            if (i === 0) {
              e.removeChild(o), Fc(t);
              return;
            }
            i--;
          } else if (n === o0 || n === $s || n === Gr || n === rm || n === Yr)
            i++;
          else if (n === KT)
            ii(
              e.ownerDocument.documentElement
            );
          else if (n === kT) {
            n = e.ownerDocument.head, ii(n);
            for (var s = n.firstChild; s; ) {
              var d = s.nextSibling, h = s.nodeName;
              s[_s] || h === "SCRIPT" || h === "STYLE" || h === "LINK" && s.rel.toLowerCase() === "stylesheet" || n.removeChild(s), s = d;
            }
          } else
            n === $T && ii(e.ownerDocument.body);
        n = o;
      } while (n);
      Fc(t);
    }
    function ar(e, t) {
      var n = e;
      e = 0;
      do {
        var i = n.nextSibling;
        if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), i && i.nodeType === 8)
          if (n = i.data, n === s0) {
            if (e === 0) break;
            e--;
          } else
            n !== o0 && n !== $s && n !== Gr && n !== rm || e++;
        n = i;
      } while (n);
    }
    function Eg(e) {
      ar(e, !0);
    }
    function Tg(e) {
      e = e.style, typeof e.setProperty == "function" ? e.setProperty("display", "none", "important") : e.display = "none";
    }
    function Ag(e) {
      e.nodeValue = "";
    }
    function zg(e) {
      ar(e, !1);
    }
    function Og(e, t) {
      t = t[WT], t = t != null && t.hasOwnProperty("display") ? t.display : null, e.style.display = t == null || typeof t == "boolean" ? "" : ("" + t).trim();
    }
    function Dg(e, t) {
      e.nodeValue = t;
    }
    function ds(e) {
      var t = e.firstChild;
      for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
        var n = t;
        switch (t = t.nextSibling, n.nodeName) {
          case "HTML":
          case "HEAD":
          case "BODY":
            ds(n), bm(n);
            continue;
          case "SCRIPT":
          case "STYLE":
            continue;
          case "LINK":
            if (n.rel.toLowerCase() === "stylesheet") continue;
        }
        e.removeChild(n);
      }
    }
    function _g(e, t, n, i) {
      for (; e.nodeType === 1; ) {
        var o = n;
        if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
          if (!i && (e.nodeName !== "INPUT" || e.type !== "hidden"))
            break;
        } else if (i) {
          if (!e[_s])
            switch (t) {
              case "meta":
                if (!e.hasAttribute("itemprop")) break;
                return e;
              case "link":
                if (s = e.getAttribute("rel"), s === "stylesheet" && e.hasAttribute("data-precedence"))
                  break;
                if (s !== o.rel || e.getAttribute("href") !== (o.href == null || o.href === "" ? null : o.href) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin) || e.getAttribute("title") !== (o.title == null ? null : o.title))
                  break;
                return e;
              case "style":
                if (e.hasAttribute("data-precedence")) break;
                return e;
              case "script":
                if (s = e.getAttribute("src"), (s !== (o.src == null ? null : o.src) || e.getAttribute("type") !== (o.type == null ? null : o.type) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin)) && s && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                  break;
                return e;
              default:
                return e;
            }
        } else if (t === "input" && e.type === "hidden") {
          dt(o.name, "name");
          var s = o.name == null ? null : "" + o.name;
          if (o.type === "hidden" && e.getAttribute("name") === s)
            return e;
        } else return e;
        if (e = Xn(e.nextSibling), e === null) break;
      }
      return null;
    }
    function Rg(e, t, n) {
      if (t === "") return null;
      for (; e.nodeType !== 3; )
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = Xn(e.nextSibling), e === null)) return null;
      return e;
    }
    function rt(e, t) {
      for (; e.nodeType !== 8; )
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Xn(e.nextSibling), e === null)) return null;
      return e;
    }
    function ur(e) {
      return e.data === $s || e.data === Gr;
    }
    function kp(e) {
      return e.data === rm || e.data === $s && e.ownerDocument.readyState !== q2;
    }
    function Mg(e, t) {
      var n = e.ownerDocument;
      if (e.data === Gr)
        e._reactRetry = t;
      else if (e.data !== $s || n.readyState !== q2)
        t();
      else {
        var i = function() {
          t(), n.removeEventListener("DOMContentLoaded", i);
        };
        n.addEventListener("DOMContentLoaded", i), e._reactRetry = i;
      }
    }
    function Xn(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === 1 || t === 3) break;
        if (t === 8) {
          if (t = e.data, t === o0 || t === rm || t === $s || t === Gr || t === Yr || t === Ab || t === B2)
            break;
          if (t === s0 || t === wv)
            return null;
        }
      }
      return e;
    }
    function Cg(e) {
      if (e.nodeType === 1) {
        for (var t = e.nodeName.toLowerCase(), n = {}, i = e.attributes, o = 0; o < i.length; o++) {
          var s = i[o];
          n[ni(s.name)] = s.name.toLowerCase() === "style" ? Ki(e) : s.value;
        }
        return { type: t, props: n };
      }
      return e.nodeType === 8 ? e.data === Yr ? { type: "Activity", props: {} } : { type: "Suspense", props: {} } : e.nodeValue;
    }
    function Ug(e, t, n) {
      return n === null || n[JT] !== !0 ? (e.nodeValue === t ? e = null : (t = qa(t), e = qa(e.nodeValue) === t ? null : e.nodeValue), e) : null;
    }
    function hs(e) {
      e = e.nextSibling;
      for (var t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === s0 || n === wv) {
            if (t === 0)
              return Xn(e.nextSibling);
            t--;
          } else
            n !== o0 && n !== rm && n !== $s && n !== Gr && n !== Yr || t++;
        }
        e = e.nextSibling;
      }
      return null;
    }
    function $c(e) {
      e = e.previousSibling;
      for (var t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === o0 || n === rm || n === $s || n === Gr || n === Yr) {
            if (t === 0) return e;
            t--;
          } else
            n !== s0 && n !== wv || t++;
        }
        e = e.previousSibling;
      }
      return null;
    }
    function Wp(e) {
      Fc(e);
    }
    function ph(e) {
      Fc(e);
    }
    function Fp(e) {
      Fc(e);
    }
    function ui(e, t, n, i, o) {
      switch (o && cf(e, i.ancestorInfo), t = nr(n), e) {
        case "html":
          if (e = t.documentElement, !e)
            throw Error(
              "React expected an <html> element (document.documentElement) to exist in the Document but one was not found. React never removes the documentElement for any Document it renders into so the cause is likely in some other script running on this page."
            );
          return e;
        case "head":
          if (e = t.head, !e)
            throw Error(
              "React expected a <head> element (document.head) to exist in the Document but one was not found. React never removes the head for any Document it renders into so the cause is likely in some other script running on this page."
            );
          return e;
        case "body":
          if (e = t.body, !e)
            throw Error(
              "React expected a <body> element (document.body) to exist in the Document but one was not found. React never removes the body for any Document it renders into so the cause is likely in some other script running on this page."
            );
          return e;
        default:
          throw Error(
            "resolveSingletonInstance was called with an element type that is not supported. This is a bug in React."
          );
      }
    }
    function Su(e, t, n, i) {
      if (!n[oi] && pa(n)) {
        var o = n.tagName.toLowerCase();
        console.error(
          "You are mounting a new %s component when a previous one has not first unmounted. It is an error to render more than one %s component at a time and attributes and children of these components will likely fail in unpredictable ways. Please only render a single instance of <%s> and if you need to mount a new one, ensure any previous ones have unmounted first.",
          o,
          o,
          o
        );
      }
      switch (e) {
        case "html":
        case "head":
        case "body":
          break;
        default:
          console.error(
            "acquireSingletonInstance was called with an element type that is not supported. This is a bug in React."
          );
      }
      for (o = n.attributes; o.length; )
        n.removeAttributeNode(o[0]);
      Nt(n, e, t), n[Ht] = i, n[dn] = t;
    }
    function ii(e) {
      for (var t = e.attributes; t.length; )
        e.removeAttributeNode(t[0]);
      bm(e);
    }
    function yh(e) {
      return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
    }
    function Ip(e, t, n) {
      var i = hm;
      if (i && typeof t == "string" && t) {
        var o = ht(t);
        o = 'link[rel="' + e + '"][href="' + o + '"]', typeof n == "string" && (o += '[crossorigin="' + n + '"]'), L2.has(o) || (L2.add(o), e = { rel: e, crossOrigin: n, href: t }, i.querySelector(o) === null && (t = i.createElement("link"), Nt(t, "link", e), Wt(t), i.head.appendChild(t)));
      }
    }
    function Pp(e, t, n, i) {
      var o = (o = Ln.current) ? yh(o) : null;
      if (!o)
        throw Error(
          '"resourceRoot" was expected to exist. This is a bug in React.'
        );
      switch (e) {
        case "meta":
        case "title":
          return null;
        case "style":
          return typeof n.precedence == "string" && typeof n.href == "string" ? (n = kc(n.href), t = In(o).hoistableStyles, i = t.get(n), i || (i = {
            type: "style",
            instance: null,
            count: 0,
            state: null
          }, t.set(n, i)), i) : { type: "void", instance: null, count: 0, state: null };
        case "link":
          if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
            e = kc(n.href);
            var s = In(o).hoistableStyles, d = s.get(e);
            if (!d && (o = o.ownerDocument || o, d = {
              type: "stylesheet",
              instance: null,
              count: 0,
              state: { loading: Lr, preload: null }
            }, s.set(e, d), (s = o.querySelector(
              cr(e)
            )) && !s._p && (d.instance = s, d.state.loading = r0 | Bu), !qu.has(e))) {
              var h = {
                rel: "preload",
                as: "style",
                href: n.href,
                crossOrigin: n.crossOrigin,
                integrity: n.integrity,
                media: n.media,
                hrefLang: n.hrefLang,
                referrerPolicy: n.referrerPolicy
              };
              qu.set(e, h), s || xg(
                o,
                e,
                h,
                d.state
              );
            }
            if (t && i === null)
              throw n = `

  - ` + ir(t) + `
  + ` + ir(n), Error(
                "Expected <link> not to update to be updated to a stylesheet with precedence. Check the `rel`, `href`, and `precedence` props of this component. Alternatively, check whether two different <link> components render in the same slot or share the same key." + n
              );
            return d;
          }
          if (t && i !== null)
            throw n = `

  - ` + ir(t) + `
  + ` + ir(n), Error(
              "Expected stylesheet with precedence to not be updated to a different kind of <link>. Check the `rel`, `href`, and `precedence` props of this component. Alternatively, check whether two different <link> components render in the same slot or share the same key." + n
            );
          return null;
        case "script":
          return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Wc(n), t = In(o).hoistableScripts, i = t.get(n), i || (i = {
            type: "script",
            instance: null,
            count: 0,
            state: null
          }, t.set(n, i)), i) : { type: "void", instance: null, count: 0, state: null };
        default:
          throw Error(
            'getResource encountered a type it did not expect: "' + e + '". this is a bug in React.'
          );
      }
    }
    function ir(e) {
      var t = 0, n = "<link";
      return typeof e.rel == "string" ? (t++, n += ' rel="' + e.rel + '"') : Vn.call(e, "rel") && (t++, n += ' rel="' + (e.rel === null ? "null" : "invalid type " + typeof e.rel) + '"'), typeof e.href == "string" ? (t++, n += ' href="' + e.href + '"') : Vn.call(e, "href") && (t++, n += ' href="' + (e.href === null ? "null" : "invalid type " + typeof e.href) + '"'), typeof e.precedence == "string" ? (t++, n += ' precedence="' + e.precedence + '"') : Vn.call(e, "precedence") && (t++, n += " precedence={" + (e.precedence === null ? "null" : "invalid type " + typeof e.precedence) + "}"), Object.getOwnPropertyNames(e).length > t && (n += " ..."), n + " />";
    }
    function kc(e) {
      return 'href="' + ht(e) + '"';
    }
    function cr(e) {
      return 'link[rel="stylesheet"][' + e + "]";
    }
    function gh(e) {
      return Be({}, e, {
        "data-precedence": e.precedence,
        precedence: null
      });
    }
    function xg(e, t, n, i) {
      e.querySelector(
        'link[rel="preload"][as="style"][' + t + "]"
      ) ? i.loading = r0 : (t = e.createElement("link"), i.preload = t, t.addEventListener("load", function() {
        return i.loading |= r0;
      }), t.addEventListener("error", function() {
        return i.loading |= G2;
      }), Nt(t, "link", n), Wt(t), e.head.appendChild(t));
    }
    function Wc(e) {
      return '[src="' + ht(e) + '"]';
    }
    function or(e) {
      return "script[async]" + e;
    }
    function vh(e, t, n) {
      if (t.count++, t.instance === null)
        switch (t.type) {
          case "style":
            var i = e.querySelector(
              'style[data-href~="' + ht(n.href) + '"]'
            );
            if (i)
              return t.instance = i, Wt(i), i;
            var o = Be({}, n, {
              "data-href": n.href,
              "data-precedence": n.precedence,
              href: null,
              precedence: null
            });
            return i = (e.ownerDocument || e).createElement("style"), Wt(i), Nt(i, "style", o), ms(i, n.precedence, e), t.instance = i;
          case "stylesheet":
            o = kc(n.href);
            var s = e.querySelector(
              cr(o)
            );
            if (s)
              return t.state.loading |= Bu, t.instance = s, Wt(s), s;
            i = gh(n), (o = qu.get(o)) && ey(i, o), s = (e.ownerDocument || e).createElement("link"), Wt(s);
            var d = s;
            return d._p = new Promise(function(h, v) {
              d.onload = h, d.onerror = v;
            }), Nt(s, "link", i), t.state.loading |= Bu, ms(s, n.precedence, e), t.instance = s;
          case "script":
            return s = Wc(n.src), (o = e.querySelector(
              or(s)
            )) ? (t.instance = o, Wt(o), o) : (i = n, (o = qu.get(s)) && (i = Be({}, n), ty(i, o)), e = e.ownerDocument || e, o = e.createElement("script"), Wt(o), Nt(o, "link", i), e.head.appendChild(o), t.instance = o);
          case "void":
            return null;
          default:
            throw Error(
              'acquireResource encountered a resource type it did not expect: "' + t.type + '". this is a bug in React.'
            );
        }
      else
        t.type === "stylesheet" && (t.state.loading & Bu) === Lr && (i = t.instance, t.state.loading |= Bu, ms(i, n.precedence, e));
      return t.instance;
    }
    function ms(e, t, n) {
      for (var i = n.querySelectorAll(
        'link[rel="stylesheet"][data-precedence],style[data-precedence]'
      ), o = i.length ? i[i.length - 1] : null, s = o, d = 0; d < i.length; d++) {
        var h = i[d];
        if (h.dataset.precedence === t) s = h;
        else if (s !== o) break;
      }
      s ? s.parentNode.insertBefore(e, s.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
    }
    function ey(e, t) {
      e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
    }
    function ty(e, t) {
      e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
    }
    function ps(e, t, n) {
      if (Gv === null) {
        var i = /* @__PURE__ */ new Map(), o = Gv = /* @__PURE__ */ new Map();
        o.set(n, i);
      } else
        o = Gv, i = o.get(n), i || (i = /* @__PURE__ */ new Map(), o.set(n, i));
      if (i.has(e)) return i;
      for (i.set(e, null), n = n.getElementsByTagName(e), o = 0; o < n.length; o++) {
        var s = n[o];
        if (!(s[_s] || s[Ht] || e === "link" && s.getAttribute("rel") === "stylesheet") && s.namespaceURI !== Ne) {
          var d = s.getAttribute(t) || "";
          d = e + d;
          var h = i.get(d);
          h ? h.push(s) : i.set(d, [s]);
        }
      }
      return i;
    }
    function Ng(e, t, n) {
      e = e.ownerDocument || e, e.head.insertBefore(
        n,
        t === "title" ? e.querySelector("head > title") : null
      );
    }
    function Hg(e, t, n) {
      var i = !n.ancestorInfo.containerTagInScope;
      if (n.context === dm || t.itemProp != null)
        return !i || t.itemProp == null || e !== "meta" && e !== "title" && e !== "style" && e !== "link" && e !== "script" || console.error(
          "Cannot render a <%s> outside the main document if it has an `itemProp` prop. `itemProp` suggests the tag belongs to an `itemScope` which can appear anywhere in the DOM. If you were intending for React to hoist this <%s> remove the `itemProp` prop. Otherwise, try moving this tag into the <head> or <body> of the Document.",
          e,
          e
        ), !1;
      switch (e) {
        case "meta":
        case "title":
          return !0;
        case "style":
          if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") {
            i && console.error(
              'Cannot render a <style> outside the main document without knowing its precedence and a unique href key. React can hoist and deduplicate <style> tags if you provide a `precedence` prop along with an `href` prop that does not conflict with the `href` values used in any other hoisted <style> or <link rel="stylesheet" ...> tags.  Note that hoisting <style> tags is considered an advanced feature that most will not use directly. Consider moving the <style> tag to the <head> or consider adding a `precedence="default"` and `href="some unique resource identifier"`.'
            );
            break;
          }
          return !0;
        case "link":
          if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) {
            if (t.rel === "stylesheet" && typeof t.precedence == "string") {
              e = t.href;
              var o = t.onError, s = t.disabled;
              n = [], t.onLoad && n.push("`onLoad`"), o && n.push("`onError`"), s != null && n.push("`disabled`"), o = dg(n, "and"), o += n.length === 1 ? " prop" : " props", s = n.length === 1 ? "an " + o : "the " + o, n.length && console.error(
                'React encountered a <link rel="stylesheet" href="%s" ... /> with a `precedence` prop that also included %s. The presence of loading and error handlers indicates an intent to manage the stylesheet loading state from your from your Component code and React will not hoist or deduplicate this stylesheet. If your intent was to have React hoist and deduplciate this stylesheet using the `precedence` prop remove the %s, otherwise remove the `precedence` prop.',
                e,
                s,
                o
              );
            }
            i && (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" ? console.error(
              "Cannot render a <link> outside the main document without a `rel` and `href` prop. Try adding a `rel` and/or `href` prop to this <link> or moving the link into the <head> tag"
            ) : (t.onError || t.onLoad) && console.error(
              "Cannot render a <link> with onLoad or onError listeners outside the main document. Try removing onLoad={...} and onError={...} or moving it into the root <head> tag or somewhere in the <body>."
            ));
            break;
          }
          switch (t.rel) {
            case "stylesheet":
              return e = t.precedence, t = t.disabled, typeof e != "string" && i && console.error(
                'Cannot render a <link rel="stylesheet" /> outside the main document without knowing its precedence. Consider adding precedence="default" or moving it into the root <head> tag.'
              ), typeof e == "string" && t == null;
            default:
              return !0;
          }
        case "script":
          if (e = t.async && typeof t.async != "function" && typeof t.async != "symbol", !e || t.onLoad || t.onError || !t.src || typeof t.src != "string") {
            i && (e ? t.onLoad || t.onError ? console.error(
              "Cannot render a <script> with onLoad or onError listeners outside the main document. Try removing onLoad={...} and onError={...} or moving it into the root <head> tag or somewhere in the <body>."
            ) : console.error(
              "Cannot render a <script> outside the main document without `async={true}` and a non-empty `src` prop. Ensure there is a valid `src` and either make the script async or move it into the root <head> tag or somewhere in the <body>."
            ) : console.error(
              'Cannot render a sync or defer <script> outside the main document without knowing its order. Try adding async="" or moving it into the root <head> tag.'
            ));
            break;
          }
          return !0;
        case "noscript":
        case "template":
          i && console.error(
            "Cannot render <%s> outside the main document. Try moving it into the root <head> tag.",
            e
          );
      }
      return !1;
    }
    function Xe(e) {
      return !(e.type === "stylesheet" && (e.state.loading & X2) === Lr);
    }
    function ly(e, t, n, i) {
      if (n.type === "stylesheet" && (typeof i.media != "string" || matchMedia(i.media).matches !== !1) && (n.state.loading & Bu) === Lr) {
        if (n.instance === null) {
          var o = kc(i.href), s = t.querySelector(
            cr(o)
          );
          if (s) {
            t = s._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = ys.bind(e), t.then(e, e)), n.state.loading |= Bu, n.instance = s, Wt(s);
            return;
          }
          s = t.ownerDocument || t, i = gh(i), (o = qu.get(o)) && ey(i, o), s = s.createElement("link"), Wt(s);
          var d = s;
          d._p = new Promise(function(h, v) {
            d.onload = h, d.onerror = v;
          }), Nt(s, "link", i), n.instance = s;
        }
        e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && (n.state.loading & X2) === Lr && (e.count++, n = ys.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
      }
    }
    function bh(e, t) {
      return e.stylesheets && e.count === 0 && sr(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
        var i = setTimeout(function() {
          if (e.stylesheets && sr(e, e.stylesheets), e.unsuspend) {
            var s = e.unsuspend;
            e.unsuspend = null, s();
          }
        }, PT + t);
        0 < e.imgBytes && Rb === 0 && (Rb = 125 * hg() * tA);
        var o = setTimeout(
          function() {
            if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && sr(e, e.stylesheets), e.unsuspend)) {
              var s = e.unsuspend;
              e.unsuspend = null, s();
            }
          },
          (e.imgBytes > Rb ? 50 : eA) + t
        );
        return e.unsuspend = n, function() {
          e.unsuspend = null, clearTimeout(i), clearTimeout(o);
        };
      } : null;
    }
    function ys() {
      if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
        if (this.stylesheets)
          sr(this, this.stylesheets);
        else if (this.unsuspend) {
          var e = this.unsuspend;
          this.unsuspend = null, e();
        }
      }
    }
    function sr(e, t) {
      e.stylesheets = null, e.unsuspend !== null && (e.count++, Xv = /* @__PURE__ */ new Map(), t.forEach(ny, e), Xv = null, ys.call(e));
    }
    function ny(e, t) {
      if (!(t.state.loading & Bu)) {
        var n = Xv.get(e);
        if (n) var i = n.get(Mb);
        else {
          n = /* @__PURE__ */ new Map(), Xv.set(e, n);
          for (var o = e.querySelectorAll(
            "link[data-precedence],style[data-precedence]"
          ), s = 0; s < o.length; s++) {
            var d = o[s];
            (d.nodeName === "LINK" || d.getAttribute("media") !== "not all") && (n.set(d.dataset.precedence, d), i = d);
          }
          i && n.set(Mb, i);
        }
        o = t.instance, d = o.getAttribute("data-precedence"), s = n.get(d) || i, s === i && n.set(Mb, o), n.set(d, o), this.count++, i = ys.bind(this), o.addEventListener("load", i), o.addEventListener("error", i), s ? s.parentNode.insertBefore(o, s.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(o, e.firstChild)), t.state.loading |= Bu;
      }
    }
    function fr(e, t, n, i, o, s, d, h, v) {
      for (this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = Xr, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Kr(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Kr(0), this.hiddenUpdates = Kr(null), this.identifierPrefix = i, this.onUncaughtError = o, this.onCaughtError = s, this.onRecoverableError = d, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = v, this.incompleteTransitions = /* @__PURE__ */ new Map(), this.passiveEffectDuration = this.effectDuration = -0, this.memoizedUpdaters = /* @__PURE__ */ new Set(), e = this.pendingUpdatersLaneMap = [], t = 0; 31 > t; t++) e.push(/* @__PURE__ */ new Set());
      this._debugRootType = n ? "hydrateRoot()" : "createRoot()";
    }
    function rr(e, t, n, i, o, s, d, h, v, S, _, M) {
      return e = new fr(
        e,
        t,
        n,
        d,
        v,
        S,
        _,
        M,
        h
      ), t = OT, s === !0 && (t |= zn | si), t |= qe, s = Te(3, null, null, t), e.current = s, s.stateNode = e, t = vd(), Oc(t), e.pooledCache = t, Oc(t), s.memoizedState = {
        element: i,
        isDehydrated: n,
        cache: t
      }, Le(s), e;
    }
    function Bg(e) {
      return e ? (e = Ns, e) : Ns;
    }
    function Sh(e, t, n, i, o, s) {
      if (dl && typeof dl.onScheduleFiberRoot == "function")
        try {
          dl.onScheduleFiberRoot(to, i, n);
        } catch (d) {
          Tu || (Tu = !0, console.error(
            "React instrumentation encountered an error: %o",
            d
          ));
        }
      o = Bg(o), i.context === null ? i.context = o : i.pendingContext = o, Eu && An !== null && !J2 && (J2 = !0, console.error(
        `Render methods should be a pure function of props and state; triggering nested component updates from render is not allowed. If necessary, trigger nested updates in componentDidUpdate.

Check the render method of %s.`,
        ie(An) || "Unknown"
      )), i = sl(t), i.payload = { element: n }, s = s === void 0 ? null : s, s !== null && (typeof s != "function" && console.error(
        "Expected the last optional `callback` argument to be a function. Instead received: %s.",
        s
      ), i.callback = s), n = nu(e, i, t), n !== null && (eu(t, "root.render()", null), Ae(n, e, t), ia(n, e, t));
    }
    function qg(e, t) {
      if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
        var n = e.retryLane;
        e.retryLane = n !== 0 && n < t ? n : t;
      }
    }
    function ay(e, t) {
      qg(e, t), (e = e.alternate) && qg(e, t);
    }
    function uy(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = Xl(e, 67108864);
        t !== null && Ae(t, e, 67108864), ay(e, 67108864);
      }
    }
    function iy(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = Vl(e);
        t = sc(t);
        var n = Xl(e, t);
        n !== null && Ae(n, e, t), ay(e, t);
      }
    }
    function yt() {
      return An;
    }
    function cy(e, t, n, i) {
      var o = w.T;
      w.T = null;
      var s = ut.p;
      try {
        ut.p = hl, oy(e, t, n, i);
      } finally {
        ut.p = s, w.T = o;
      }
    }
    function Bl(e, t, n, i) {
      var o = w.T;
      w.T = null;
      var s = ut.p;
      try {
        ut.p = jl, oy(e, t, n, i);
      } finally {
        ut.p = s, w.T = o;
      }
    }
    function oy(e, t, n, i) {
      if (Vv) {
        var o = Eh(i);
        if (o === null)
          Ha(
            e,
            t,
            i,
            Qv,
            n
          ), Ah(e, i);
        else if (jg(
          o,
          e,
          t,
          n,
          i
        ))
          i.stopPropagation();
        else if (Ah(e, i), t & 4 && -1 < nA.indexOf(e)) {
          for (; o !== null; ) {
            var s = pa(o);
            if (s !== null)
              switch (s.tag) {
                case 3:
                  if (s = s.stateNode, s.current.memoizedState.isDehydrated) {
                    var d = oc(s.pendingLanes);
                    if (d !== 0) {
                      var h = s;
                      for (h.pendingLanes |= 2, h.entangledLanes |= 2; d; ) {
                        var v = 1 << 31 - ql(d);
                        h.entanglements[1] |= v, d &= ~v;
                      }
                      bn(s), (Ie & (Yl | Qa)) === $l && (Dv = zl() + S2, yu(0));
                    }
                  }
                  break;
                case 31:
                case 13:
                  h = Xl(s, 2), h !== null && Ae(h, s, 2), Gn(), ay(s, 2);
              }
            if (s = Eh(i), s === null && Ha(
              e,
              t,
              i,
              Qv,
              n
            ), s === o) break;
            o = s;
          }
          o !== null && i.stopPropagation();
        } else
          Ha(
            e,
            t,
            i,
            null,
            n
          );
      }
    }
    function Eh(e) {
      return e = va(e), sy(e);
    }
    function sy(e) {
      if (Qv = null, e = Yu(e), e !== null) {
        var t = Je(e);
        if (t === null) e = null;
        else {
          var n = t.tag;
          if (n === 13) {
            if (e = mn(t), e !== null) return e;
            e = null;
          } else if (n === 31) {
            if (e = wt(t), e !== null) return e;
            e = null;
          } else if (n === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated)
              return t.tag === 3 ? t.stateNode.containerInfo : null;
            e = null;
          } else t !== e && (e = null);
        }
      }
      return Qv = e, null;
    }
    function Th(e) {
      switch (e) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return hl;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return jl;
        case "message":
          switch (gr()) {
            case by:
              return hl;
            case xh:
              return jl;
            case eo:
            case Vg:
              return Zl;
            case Nh:
              return Pi;
            default:
              return Zl;
          }
        default:
          return Zl;
      }
    }
    function Ah(e, t) {
      switch (e) {
        case "focusin":
        case "focusout":
          ks = null;
          break;
        case "dragenter":
        case "dragleave":
          Ws = null;
          break;
        case "mouseover":
        case "mouseout":
          Fs = null;
          break;
        case "pointerover":
        case "pointerout":
          h0.delete(t.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          m0.delete(t.pointerId);
      }
    }
    function ki(e, t, n, i, o, s) {
      return e === null || e.nativeEvent !== s ? (e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: i,
        nativeEvent: s,
        targetContainers: [o]
      }, t !== null && (t = pa(t), t !== null && uy(t)), e) : (e.eventSystemFlags |= i, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e);
    }
    function jg(e, t, n, i, o) {
      switch (t) {
        case "focusin":
          return ks = ki(
            ks,
            e,
            t,
            n,
            i,
            o
          ), !0;
        case "dragenter":
          return Ws = ki(
            Ws,
            e,
            t,
            n,
            i,
            o
          ), !0;
        case "mouseover":
          return Fs = ki(
            Fs,
            e,
            t,
            n,
            i,
            o
          ), !0;
        case "pointerover":
          var s = o.pointerId;
          return h0.set(
            s,
            ki(
              h0.get(s) || null,
              e,
              t,
              n,
              i,
              o
            )
          ), !0;
        case "gotpointercapture":
          return s = o.pointerId, m0.set(
            s,
            ki(
              m0.get(s) || null,
              e,
              t,
              n,
              i,
              o
            )
          ), !0;
      }
      return !1;
    }
    function fy(e) {
      var t = Yu(e.target);
      if (t !== null) {
        var n = Je(t);
        if (n !== null) {
          if (t = n.tag, t === 13) {
            if (t = mn(n), t !== null) {
              e.blockedOn = t, z0(e.priority, function() {
                iy(n);
              });
              return;
            }
          } else if (t === 31) {
            if (t = wt(n), t !== null) {
              e.blockedOn = t, z0(e.priority, function() {
                iy(n);
              });
              return;
            }
          } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
            e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
            return;
          }
        }
      }
      e.blockedOn = null;
    }
    function gs(e) {
      if (e.blockedOn !== null) return !1;
      for (var t = e.targetContainers; 0 < t.length; ) {
        var n = Eh(e.nativeEvent);
        if (n === null) {
          n = e.nativeEvent;
          var i = new n.constructor(
            n.type,
            n
          ), o = i;
          zy !== null && console.error(
            "Expected currently replaying event to be null. This error is likely caused by a bug in React. Please file an issue."
          ), zy = o, n.target.dispatchEvent(i), zy === null && console.error(
            "Expected currently replaying event to not be null. This error is likely caused by a bug in React. Please file an issue."
          ), zy = null;
        } else
          return t = pa(n), t !== null && uy(t), e.blockedOn = n, !1;
        t.shift();
      }
      return !0;
    }
    function zh(e, t, n) {
      gs(e) && n.delete(t);
    }
    function y1() {
      Cb = !1, ks !== null && gs(ks) && (ks = null), Ws !== null && gs(Ws) && (Ws = null), Fs !== null && gs(Fs) && (Fs = null), h0.forEach(zh), m0.forEach(zh);
    }
    function dr(e, t) {
      e.blockedOn === t && (e.blockedOn = null, Cb || (Cb = !0, tl.unstable_scheduleCallback(
        tl.unstable_NormalPriority,
        y1
      )));
    }
    function wg(e) {
      Zv !== e && (Zv = e, tl.unstable_scheduleCallback(
        tl.unstable_NormalPriority,
        function() {
          Zv === e && (Zv = null);
          for (var t = 0; t < e.length; t += 3) {
            var n = e[t], i = e[t + 1], o = e[t + 2];
            if (typeof i != "function") {
              if (sy(i || n) === null)
                continue;
              break;
            }
            var s = pa(n);
            s !== null && (e.splice(t, 3), t -= 3, n = {
              pending: !0,
              data: o,
              method: n.method,
              action: i
            }, Object.freeze(n), Iu(
              s,
              n,
              i,
              o
            ));
          }
        }
      ));
    }
    function Fc(e) {
      function t(v) {
        return dr(v, e);
      }
      ks !== null && dr(ks, e), Ws !== null && dr(Ws, e), Fs !== null && dr(Fs, e), h0.forEach(t), m0.forEach(t);
      for (var n = 0; n < Is.length; n++) {
        var i = Is[n];
        i.blockedOn === e && (i.blockedOn = null);
      }
      for (; 0 < Is.length && (n = Is[0], n.blockedOn === null); )
        fy(n), n.blockedOn === null && Is.shift();
      if (n = (e.ownerDocument || e).$$reactFormReplay, n != null)
        for (i = 0; i < n.length; i += 3) {
          var o = n[i], s = n[i + 1], d = o[dn] || null;
          if (typeof s == "function")
            d || wg(n);
          else if (d) {
            var h = null;
            if (s && s.hasAttribute("formAction")) {
              if (o = s, d = s[dn] || null)
                h = d.formAction;
              else if (sy(o) !== null) continue;
            } else h = d.action;
            typeof h == "function" ? n[i + 1] = h : (n.splice(i, 3), i -= 3), wg(n);
          }
        }
    }
    function Yg() {
      function e(s) {
        s.canIntercept && s.info === "react-transition" && s.intercept({
          handler: function() {
            return new Promise(function(d) {
              return o = d;
            });
          },
          focusReset: "manual",
          scroll: "manual"
        });
      }
      function t() {
        o !== null && (o(), o = null), i || setTimeout(n, 20);
      }
      function n() {
        if (!i && !navigation.transition) {
          var s = navigation.currentEntry;
          s && s.url != null && navigation.navigate(s.url, {
            state: s.getState(),
            info: "react-transition",
            history: "replace"
          });
        }
      }
      if (typeof navigation == "object") {
        var i = !1, o = null;
        return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
          i = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener(
            "navigatesuccess",
            t
          ), navigation.removeEventListener(
            "navigateerror",
            t
          ), o !== null && (o(), o = null);
        };
      }
    }
    function ry(e) {
      this._internalRoot = e;
    }
    function ja(e) {
      this._internalRoot = e;
    }
    function dy(e) {
      e[oi] && (e._reactRootContainer ? console.error(
        "You are calling ReactDOMClient.createRoot() on a container that was previously passed to ReactDOM.render(). This is not supported."
      ) : console.error(
        "You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it."
      ));
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var tl = EE(), hr = t1, g1 = SE, Be = Object.assign, Gg = Symbol.for("react.element"), fa = Symbol.for("react.transitional.element"), Wi = Symbol.for("react.portal"), vs = Symbol.for("react.fragment"), rn = Symbol.for("react.strict_mode"), mr = Symbol.for("react.profiler"), Oh = Symbol.for("react.consumer"), wa = Symbol.for("react.context"), bs = Symbol.for("react.forward_ref"), Ic = Symbol.for("react.suspense"), Tn = Symbol.for("react.suspense_list"), pr = Symbol.for("react.memo"), Ql = Symbol.for("react.lazy"), Ya = Symbol.for("react.activity"), v1 = Symbol.for("react.memo_cache_sentinel"), Xg = Symbol.iterator, Ss = Symbol.for("react.client.reference"), il = Array.isArray, w = hr.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ut = g1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, b1 = Object.freeze({
      pending: !1,
      data: null,
      method: null,
      action: null
    }), hy = [], my = [], ci = -1, Fi = bt(null), Es = bt(null), Ln = bt(null), Ii = bt(null), Ts = 0, Lg, Pc, As, py, yr, Dh, _h;
    Se.__reactDisabledLog = !0;
    var zs, yy, Rh = !1, gy = new (typeof WeakMap == "function" ? WeakMap : Map)(), An = null, Eu = !1, Vn = Object.prototype.hasOwnProperty, vy = tl.unstable_scheduleCallback, Mh = tl.unstable_cancelCallback, Ch = tl.unstable_shouldYield, Uh = tl.unstable_requestPaint, zl = tl.unstable_now, gr = tl.unstable_getCurrentPriorityLevel, by = tl.unstable_ImmediatePriority, xh = tl.unstable_UserBlockingPriority, eo = tl.unstable_NormalPriority, Vg = tl.unstable_LowPriority, Nh = tl.unstable_IdlePriority, Sy = tl.log, Qg = tl.unstable_setDisableYieldValue, to = null, dl = null, Tu = !1, Au = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u", ql = Math.clz32 ? Math.clz32 : gm, Ey = Math.log, Hh = Math.LN2, Os = 256, vr = 262144, Ds = 4194304, hl = 2, jl = 8, Zl = 32, Pi = 268435456, ra = Math.random().toString(36).slice(2), Ht = "__reactFiber$" + ra, dn = "__reactProps$" + ra, oi = "__reactContainer$" + ra, lo = "__reactEvents$" + ra, S1 = "__reactListeners$" + ra, Zg = "__reactHandles$" + ra, br = "__reactResources$" + ra, _s = "__reactMarker$" + ra, Jg = /* @__PURE__ */ new Set(), zu = {}, Rs = {}, Kg = {
      button: !0,
      checkbox: !0,
      image: !0,
      hidden: !0,
      radio: !0,
      reset: !0,
      submit: !0
    }, Ms = RegExp(
      "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    ), Ty = {}, Bh = {}, qh = /[\n"\\]/g, Ay = !1, $g = !1, Sr = !1, l = !1, a = !1, u = !1, c = ["value", "defaultValue"], f = !1, r = /["'&<>\n\t]|^\s|\s$/, p = "address applet area article aside base basefont bgsound blockquote body br button caption center col colgroup dd details dir div dl dt embed fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html iframe img input isindex li link listing main marquee menu menuitem meta nav noembed noframes noscript object ol p param plaintext pre script section select source style summary table tbody td template textarea tfoot th thead title tr track ul wbr xmp".split(
      " "
    ), E = "applet caption html table td th marquee object template foreignObject desc title".split(
      " "
    ), O = E.concat(["button"]), H = "dd dt li option optgroup p rp rt".split(" "), L = {
      current: null,
      formTag: null,
      aTagInScope: null,
      buttonTagInScope: null,
      nobrTagInScope: null,
      pTagInButtonScope: null,
      listItemTagAutoclosing: null,
      dlItemTagAutoclosing: null,
      containerTagInScope: null,
      implicitRootScope: !1
    }, J = {}, B = {
      animation: "animationDelay animationDirection animationDuration animationFillMode animationIterationCount animationName animationPlayState animationTimingFunction".split(
        " "
      ),
      background: "backgroundAttachment backgroundClip backgroundColor backgroundImage backgroundOrigin backgroundPositionX backgroundPositionY backgroundRepeat backgroundSize".split(
        " "
      ),
      backgroundPosition: ["backgroundPositionX", "backgroundPositionY"],
      border: "borderBottomColor borderBottomStyle borderBottomWidth borderImageOutset borderImageRepeat borderImageSlice borderImageSource borderImageWidth borderLeftColor borderLeftStyle borderLeftWidth borderRightColor borderRightStyle borderRightWidth borderTopColor borderTopStyle borderTopWidth".split(
        " "
      ),
      borderBlockEnd: [
        "borderBlockEndColor",
        "borderBlockEndStyle",
        "borderBlockEndWidth"
      ],
      borderBlockStart: [
        "borderBlockStartColor",
        "borderBlockStartStyle",
        "borderBlockStartWidth"
      ],
      borderBottom: [
        "borderBottomColor",
        "borderBottomStyle",
        "borderBottomWidth"
      ],
      borderColor: [
        "borderBottomColor",
        "borderLeftColor",
        "borderRightColor",
        "borderTopColor"
      ],
      borderImage: [
        "borderImageOutset",
        "borderImageRepeat",
        "borderImageSlice",
        "borderImageSource",
        "borderImageWidth"
      ],
      borderInlineEnd: [
        "borderInlineEndColor",
        "borderInlineEndStyle",
        "borderInlineEndWidth"
      ],
      borderInlineStart: [
        "borderInlineStartColor",
        "borderInlineStartStyle",
        "borderInlineStartWidth"
      ],
      borderLeft: ["borderLeftColor", "borderLeftStyle", "borderLeftWidth"],
      borderRadius: [
        "borderBottomLeftRadius",
        "borderBottomRightRadius",
        "borderTopLeftRadius",
        "borderTopRightRadius"
      ],
      borderRight: [
        "borderRightColor",
        "borderRightStyle",
        "borderRightWidth"
      ],
      borderStyle: [
        "borderBottomStyle",
        "borderLeftStyle",
        "borderRightStyle",
        "borderTopStyle"
      ],
      borderTop: ["borderTopColor", "borderTopStyle", "borderTopWidth"],
      borderWidth: [
        "borderBottomWidth",
        "borderLeftWidth",
        "borderRightWidth",
        "borderTopWidth"
      ],
      columnRule: ["columnRuleColor", "columnRuleStyle", "columnRuleWidth"],
      columns: ["columnCount", "columnWidth"],
      flex: ["flexBasis", "flexGrow", "flexShrink"],
      flexFlow: ["flexDirection", "flexWrap"],
      font: "fontFamily fontFeatureSettings fontKerning fontLanguageOverride fontSize fontSizeAdjust fontStretch fontStyle fontVariant fontVariantAlternates fontVariantCaps fontVariantEastAsian fontVariantLigatures fontVariantNumeric fontVariantPosition fontWeight lineHeight".split(
        " "
      ),
      fontVariant: "fontVariantAlternates fontVariantCaps fontVariantEastAsian fontVariantLigatures fontVariantNumeric fontVariantPosition".split(
        " "
      ),
      gap: ["columnGap", "rowGap"],
      grid: "gridAutoColumns gridAutoFlow gridAutoRows gridTemplateAreas gridTemplateColumns gridTemplateRows".split(
        " "
      ),
      gridArea: [
        "gridColumnEnd",
        "gridColumnStart",
        "gridRowEnd",
        "gridRowStart"
      ],
      gridColumn: ["gridColumnEnd", "gridColumnStart"],
      gridColumnGap: ["columnGap"],
      gridGap: ["columnGap", "rowGap"],
      gridRow: ["gridRowEnd", "gridRowStart"],
      gridRowGap: ["rowGap"],
      gridTemplate: [
        "gridTemplateAreas",
        "gridTemplateColumns",
        "gridTemplateRows"
      ],
      listStyle: ["listStyleImage", "listStylePosition", "listStyleType"],
      margin: ["marginBottom", "marginLeft", "marginRight", "marginTop"],
      marker: ["markerEnd", "markerMid", "markerStart"],
      mask: "maskClip maskComposite maskImage maskMode maskOrigin maskPositionX maskPositionY maskRepeat maskSize".split(
        " "
      ),
      maskPosition: ["maskPositionX", "maskPositionY"],
      outline: ["outlineColor", "outlineStyle", "outlineWidth"],
      overflow: ["overflowX", "overflowY"],
      padding: ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop"],
      placeContent: ["alignContent", "justifyContent"],
      placeItems: ["alignItems", "justifyItems"],
      placeSelf: ["alignSelf", "justifySelf"],
      textDecoration: [
        "textDecorationColor",
        "textDecorationLine",
        "textDecorationStyle"
      ],
      textEmphasis: ["textEmphasisColor", "textEmphasisStyle"],
      transition: [
        "transitionDelay",
        "transitionDuration",
        "transitionProperty",
        "transitionTimingFunction"
      ],
      wordWrap: ["overflowWrap"]
    }, Y = /([A-Z])/g, ue = /^ms-/, ge = /^(?:webkit|moz|o)[A-Z]/, gt = /^-ms-/, U = /-(.)/g, R = /;\s*$/, N = {}, Z = {}, de = !1, Fe = !1, ce = new Set(
      "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
        " "
      )
    ), _e = "http://www.w3.org/1998/Math/MathML", Ne = "http://www.w3.org/2000/svg", tt = /* @__PURE__ */ new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"]
    ]), Ga = {
      accept: "accept",
      acceptcharset: "acceptCharset",
      "accept-charset": "acceptCharset",
      accesskey: "accessKey",
      action: "action",
      allowfullscreen: "allowFullScreen",
      alt: "alt",
      as: "as",
      async: "async",
      autocapitalize: "autoCapitalize",
      autocomplete: "autoComplete",
      autocorrect: "autoCorrect",
      autofocus: "autoFocus",
      autoplay: "autoPlay",
      autosave: "autoSave",
      capture: "capture",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing",
      challenge: "challenge",
      charset: "charSet",
      checked: "checked",
      children: "children",
      cite: "cite",
      class: "className",
      classid: "classID",
      classname: "className",
      cols: "cols",
      colspan: "colSpan",
      content: "content",
      contenteditable: "contentEditable",
      contextmenu: "contextMenu",
      controls: "controls",
      controlslist: "controlsList",
      coords: "coords",
      crossorigin: "crossOrigin",
      dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
      data: "data",
      datetime: "dateTime",
      default: "default",
      defaultchecked: "defaultChecked",
      defaultvalue: "defaultValue",
      defer: "defer",
      dir: "dir",
      disabled: "disabled",
      disablepictureinpicture: "disablePictureInPicture",
      disableremoteplayback: "disableRemotePlayback",
      download: "download",
      draggable: "draggable",
      enctype: "encType",
      enterkeyhint: "enterKeyHint",
      fetchpriority: "fetchPriority",
      for: "htmlFor",
      form: "form",
      formmethod: "formMethod",
      formaction: "formAction",
      formenctype: "formEncType",
      formnovalidate: "formNoValidate",
      formtarget: "formTarget",
      frameborder: "frameBorder",
      headers: "headers",
      height: "height",
      hidden: "hidden",
      high: "high",
      href: "href",
      hreflang: "hrefLang",
      htmlfor: "htmlFor",
      httpequiv: "httpEquiv",
      "http-equiv": "httpEquiv",
      icon: "icon",
      id: "id",
      imagesizes: "imageSizes",
      imagesrcset: "imageSrcSet",
      inert: "inert",
      innerhtml: "innerHTML",
      inputmode: "inputMode",
      integrity: "integrity",
      is: "is",
      itemid: "itemID",
      itemprop: "itemProp",
      itemref: "itemRef",
      itemscope: "itemScope",
      itemtype: "itemType",
      keyparams: "keyParams",
      keytype: "keyType",
      kind: "kind",
      label: "label",
      lang: "lang",
      list: "list",
      loop: "loop",
      low: "low",
      manifest: "manifest",
      marginwidth: "marginWidth",
      marginheight: "marginHeight",
      max: "max",
      maxlength: "maxLength",
      media: "media",
      mediagroup: "mediaGroup",
      method: "method",
      min: "min",
      minlength: "minLength",
      multiple: "multiple",
      muted: "muted",
      name: "name",
      nomodule: "noModule",
      nonce: "nonce",
      novalidate: "noValidate",
      open: "open",
      optimum: "optimum",
      pattern: "pattern",
      placeholder: "placeholder",
      playsinline: "playsInline",
      poster: "poster",
      preload: "preload",
      profile: "profile",
      radiogroup: "radioGroup",
      readonly: "readOnly",
      referrerpolicy: "referrerPolicy",
      rel: "rel",
      required: "required",
      reversed: "reversed",
      role: "role",
      rows: "rows",
      rowspan: "rowSpan",
      sandbox: "sandbox",
      scope: "scope",
      scoped: "scoped",
      scrolling: "scrolling",
      seamless: "seamless",
      selected: "selected",
      shape: "shape",
      size: "size",
      sizes: "sizes",
      span: "span",
      spellcheck: "spellCheck",
      src: "src",
      srcdoc: "srcDoc",
      srclang: "srcLang",
      srcset: "srcSet",
      start: "start",
      step: "step",
      style: "style",
      summary: "summary",
      tabindex: "tabIndex",
      target: "target",
      title: "title",
      type: "type",
      usemap: "useMap",
      value: "value",
      width: "width",
      wmode: "wmode",
      wrap: "wrap",
      about: "about",
      accentheight: "accentHeight",
      "accent-height": "accentHeight",
      accumulate: "accumulate",
      additive: "additive",
      alignmentbaseline: "alignmentBaseline",
      "alignment-baseline": "alignmentBaseline",
      allowreorder: "allowReorder",
      alphabetic: "alphabetic",
      amplitude: "amplitude",
      arabicform: "arabicForm",
      "arabic-form": "arabicForm",
      ascent: "ascent",
      attributename: "attributeName",
      attributetype: "attributeType",
      autoreverse: "autoReverse",
      azimuth: "azimuth",
      basefrequency: "baseFrequency",
      baselineshift: "baselineShift",
      "baseline-shift": "baselineShift",
      baseprofile: "baseProfile",
      bbox: "bbox",
      begin: "begin",
      bias: "bias",
      by: "by",
      calcmode: "calcMode",
      capheight: "capHeight",
      "cap-height": "capHeight",
      clip: "clip",
      clippath: "clipPath",
      "clip-path": "clipPath",
      clippathunits: "clipPathUnits",
      cliprule: "clipRule",
      "clip-rule": "clipRule",
      color: "color",
      colorinterpolation: "colorInterpolation",
      "color-interpolation": "colorInterpolation",
      colorinterpolationfilters: "colorInterpolationFilters",
      "color-interpolation-filters": "colorInterpolationFilters",
      colorprofile: "colorProfile",
      "color-profile": "colorProfile",
      colorrendering: "colorRendering",
      "color-rendering": "colorRendering",
      contentscripttype: "contentScriptType",
      contentstyletype: "contentStyleType",
      cursor: "cursor",
      cx: "cx",
      cy: "cy",
      d: "d",
      datatype: "datatype",
      decelerate: "decelerate",
      descent: "descent",
      diffuseconstant: "diffuseConstant",
      direction: "direction",
      display: "display",
      divisor: "divisor",
      dominantbaseline: "dominantBaseline",
      "dominant-baseline": "dominantBaseline",
      dur: "dur",
      dx: "dx",
      dy: "dy",
      edgemode: "edgeMode",
      elevation: "elevation",
      enablebackground: "enableBackground",
      "enable-background": "enableBackground",
      end: "end",
      exponent: "exponent",
      externalresourcesrequired: "externalResourcesRequired",
      fill: "fill",
      fillopacity: "fillOpacity",
      "fill-opacity": "fillOpacity",
      fillrule: "fillRule",
      "fill-rule": "fillRule",
      filter: "filter",
      filterres: "filterRes",
      filterunits: "filterUnits",
      floodopacity: "floodOpacity",
      "flood-opacity": "floodOpacity",
      floodcolor: "floodColor",
      "flood-color": "floodColor",
      focusable: "focusable",
      fontfamily: "fontFamily",
      "font-family": "fontFamily",
      fontsize: "fontSize",
      "font-size": "fontSize",
      fontsizeadjust: "fontSizeAdjust",
      "font-size-adjust": "fontSizeAdjust",
      fontstretch: "fontStretch",
      "font-stretch": "fontStretch",
      fontstyle: "fontStyle",
      "font-style": "fontStyle",
      fontvariant: "fontVariant",
      "font-variant": "fontVariant",
      fontweight: "fontWeight",
      "font-weight": "fontWeight",
      format: "format",
      from: "from",
      fx: "fx",
      fy: "fy",
      g1: "g1",
      g2: "g2",
      glyphname: "glyphName",
      "glyph-name": "glyphName",
      glyphorientationhorizontal: "glyphOrientationHorizontal",
      "glyph-orientation-horizontal": "glyphOrientationHorizontal",
      glyphorientationvertical: "glyphOrientationVertical",
      "glyph-orientation-vertical": "glyphOrientationVertical",
      glyphref: "glyphRef",
      gradienttransform: "gradientTransform",
      gradientunits: "gradientUnits",
      hanging: "hanging",
      horizadvx: "horizAdvX",
      "horiz-adv-x": "horizAdvX",
      horizoriginx: "horizOriginX",
      "horiz-origin-x": "horizOriginX",
      ideographic: "ideographic",
      imagerendering: "imageRendering",
      "image-rendering": "imageRendering",
      in2: "in2",
      in: "in",
      inlist: "inlist",
      intercept: "intercept",
      k1: "k1",
      k2: "k2",
      k3: "k3",
      k4: "k4",
      k: "k",
      kernelmatrix: "kernelMatrix",
      kernelunitlength: "kernelUnitLength",
      kerning: "kerning",
      keypoints: "keyPoints",
      keysplines: "keySplines",
      keytimes: "keyTimes",
      lengthadjust: "lengthAdjust",
      letterspacing: "letterSpacing",
      "letter-spacing": "letterSpacing",
      lightingcolor: "lightingColor",
      "lighting-color": "lightingColor",
      limitingconeangle: "limitingConeAngle",
      local: "local",
      markerend: "markerEnd",
      "marker-end": "markerEnd",
      markerheight: "markerHeight",
      markermid: "markerMid",
      "marker-mid": "markerMid",
      markerstart: "markerStart",
      "marker-start": "markerStart",
      markerunits: "markerUnits",
      markerwidth: "markerWidth",
      mask: "mask",
      maskcontentunits: "maskContentUnits",
      maskunits: "maskUnits",
      mathematical: "mathematical",
      mode: "mode",
      numoctaves: "numOctaves",
      offset: "offset",
      opacity: "opacity",
      operator: "operator",
      order: "order",
      orient: "orient",
      orientation: "orientation",
      origin: "origin",
      overflow: "overflow",
      overlineposition: "overlinePosition",
      "overline-position": "overlinePosition",
      overlinethickness: "overlineThickness",
      "overline-thickness": "overlineThickness",
      paintorder: "paintOrder",
      "paint-order": "paintOrder",
      panose1: "panose1",
      "panose-1": "panose1",
      pathlength: "pathLength",
      patterncontentunits: "patternContentUnits",
      patterntransform: "patternTransform",
      patternunits: "patternUnits",
      pointerevents: "pointerEvents",
      "pointer-events": "pointerEvents",
      points: "points",
      pointsatx: "pointsAtX",
      pointsaty: "pointsAtY",
      pointsatz: "pointsAtZ",
      popover: "popover",
      popovertarget: "popoverTarget",
      popovertargetaction: "popoverTargetAction",
      prefix: "prefix",
      preservealpha: "preserveAlpha",
      preserveaspectratio: "preserveAspectRatio",
      primitiveunits: "primitiveUnits",
      property: "property",
      r: "r",
      radius: "radius",
      refx: "refX",
      refy: "refY",
      renderingintent: "renderingIntent",
      "rendering-intent": "renderingIntent",
      repeatcount: "repeatCount",
      repeatdur: "repeatDur",
      requiredextensions: "requiredExtensions",
      requiredfeatures: "requiredFeatures",
      resource: "resource",
      restart: "restart",
      result: "result",
      results: "results",
      rotate: "rotate",
      rx: "rx",
      ry: "ry",
      scale: "scale",
      security: "security",
      seed: "seed",
      shaperendering: "shapeRendering",
      "shape-rendering": "shapeRendering",
      slope: "slope",
      spacing: "spacing",
      specularconstant: "specularConstant",
      specularexponent: "specularExponent",
      speed: "speed",
      spreadmethod: "spreadMethod",
      startoffset: "startOffset",
      stddeviation: "stdDeviation",
      stemh: "stemh",
      stemv: "stemv",
      stitchtiles: "stitchTiles",
      stopcolor: "stopColor",
      "stop-color": "stopColor",
      stopopacity: "stopOpacity",
      "stop-opacity": "stopOpacity",
      strikethroughposition: "strikethroughPosition",
      "strikethrough-position": "strikethroughPosition",
      strikethroughthickness: "strikethroughThickness",
      "strikethrough-thickness": "strikethroughThickness",
      string: "string",
      stroke: "stroke",
      strokedasharray: "strokeDasharray",
      "stroke-dasharray": "strokeDasharray",
      strokedashoffset: "strokeDashoffset",
      "stroke-dashoffset": "strokeDashoffset",
      strokelinecap: "strokeLinecap",
      "stroke-linecap": "strokeLinecap",
      strokelinejoin: "strokeLinejoin",
      "stroke-linejoin": "strokeLinejoin",
      strokemiterlimit: "strokeMiterlimit",
      "stroke-miterlimit": "strokeMiterlimit",
      strokewidth: "strokeWidth",
      "stroke-width": "strokeWidth",
      strokeopacity: "strokeOpacity",
      "stroke-opacity": "strokeOpacity",
      suppresscontenteditablewarning: "suppressContentEditableWarning",
      suppresshydrationwarning: "suppressHydrationWarning",
      surfacescale: "surfaceScale",
      systemlanguage: "systemLanguage",
      tablevalues: "tableValues",
      targetx: "targetX",
      targety: "targetY",
      textanchor: "textAnchor",
      "text-anchor": "textAnchor",
      textdecoration: "textDecoration",
      "text-decoration": "textDecoration",
      textlength: "textLength",
      textrendering: "textRendering",
      "text-rendering": "textRendering",
      to: "to",
      transform: "transform",
      transformorigin: "transformOrigin",
      "transform-origin": "transformOrigin",
      typeof: "typeof",
      u1: "u1",
      u2: "u2",
      underlineposition: "underlinePosition",
      "underline-position": "underlinePosition",
      underlinethickness: "underlineThickness",
      "underline-thickness": "underlineThickness",
      unicode: "unicode",
      unicodebidi: "unicodeBidi",
      "unicode-bidi": "unicodeBidi",
      unicoderange: "unicodeRange",
      "unicode-range": "unicodeRange",
      unitsperem: "unitsPerEm",
      "units-per-em": "unitsPerEm",
      unselectable: "unselectable",
      valphabetic: "vAlphabetic",
      "v-alphabetic": "vAlphabetic",
      values: "values",
      vectoreffect: "vectorEffect",
      "vector-effect": "vectorEffect",
      version: "version",
      vertadvy: "vertAdvY",
      "vert-adv-y": "vertAdvY",
      vertoriginx: "vertOriginX",
      "vert-origin-x": "vertOriginX",
      vertoriginy: "vertOriginY",
      "vert-origin-y": "vertOriginY",
      vhanging: "vHanging",
      "v-hanging": "vHanging",
      videographic: "vIdeographic",
      "v-ideographic": "vIdeographic",
      viewbox: "viewBox",
      viewtarget: "viewTarget",
      visibility: "visibility",
      vmathematical: "vMathematical",
      "v-mathematical": "vMathematical",
      vocab: "vocab",
      widths: "widths",
      wordspacing: "wordSpacing",
      "word-spacing": "wordSpacing",
      writingmode: "writingMode",
      "writing-mode": "writingMode",
      x1: "x1",
      x2: "x2",
      x: "x",
      xchannelselector: "xChannelSelector",
      xheight: "xHeight",
      "x-height": "xHeight",
      xlinkactuate: "xlinkActuate",
      "xlink:actuate": "xlinkActuate",
      xlinkarcrole: "xlinkArcrole",
      "xlink:arcrole": "xlinkArcrole",
      xlinkhref: "xlinkHref",
      "xlink:href": "xlinkHref",
      xlinkrole: "xlinkRole",
      "xlink:role": "xlinkRole",
      xlinkshow: "xlinkShow",
      "xlink:show": "xlinkShow",
      xlinktitle: "xlinkTitle",
      "xlink:title": "xlinkTitle",
      xlinktype: "xlinkType",
      "xlink:type": "xlinkType",
      xmlbase: "xmlBase",
      "xml:base": "xmlBase",
      xmllang: "xmlLang",
      "xml:lang": "xmlLang",
      xmlns: "xmlns",
      "xml:space": "xmlSpace",
      xmlnsxlink: "xmlnsXlink",
      "xmlns:xlink": "xmlnsXlink",
      xmlspace: "xmlSpace",
      y1: "y1",
      y2: "y2",
      y: "y",
      ychannelselector: "yChannelSelector",
      z: "z",
      zoomandpan: "zoomAndPan"
    }, kg = {
      "aria-current": 0,
      "aria-description": 0,
      "aria-details": 0,
      "aria-disabled": 0,
      "aria-hidden": 0,
      "aria-invalid": 0,
      "aria-keyshortcuts": 0,
      "aria-label": 0,
      "aria-roledescription": 0,
      "aria-autocomplete": 0,
      "aria-checked": 0,
      "aria-expanded": 0,
      "aria-haspopup": 0,
      "aria-level": 0,
      "aria-modal": 0,
      "aria-multiline": 0,
      "aria-multiselectable": 0,
      "aria-orientation": 0,
      "aria-placeholder": 0,
      "aria-pressed": 0,
      "aria-readonly": 0,
      "aria-required": 0,
      "aria-selected": 0,
      "aria-sort": 0,
      "aria-valuemax": 0,
      "aria-valuemin": 0,
      "aria-valuenow": 0,
      "aria-valuetext": 0,
      "aria-atomic": 0,
      "aria-busy": 0,
      "aria-live": 0,
      "aria-relevant": 0,
      "aria-dropeffect": 0,
      "aria-grabbed": 0,
      "aria-activedescendant": 0,
      "aria-colcount": 0,
      "aria-colindex": 0,
      "aria-colspan": 0,
      "aria-controls": 0,
      "aria-describedby": 0,
      "aria-errormessage": 0,
      "aria-flowto": 0,
      "aria-labelledby": 0,
      "aria-owns": 0,
      "aria-posinset": 0,
      "aria-rowcount": 0,
      "aria-rowindex": 0,
      "aria-rowspan": 0,
      "aria-setsize": 0,
      "aria-braillelabel": 0,
      "aria-brailleroledescription": 0,
      "aria-colindextext": 0,
      "aria-rowindextext": 0
    }, jh = {}, jE = RegExp(
      "^(aria)-[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    ), wE = RegExp(
      "^(aria)[A-Z][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    ), $b = !1, Qn = {}, kb = /^on./, YE = /^on[^A-Z]/, GE = RegExp(
      "^(aria)-[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    ), XE = RegExp(
      "^(aria)[A-Z][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    ), LE = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i, zy = null, wh = null, Yh = null, E1 = !1, ec = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), T1 = !1;
    if (ec)
      try {
        var Oy = {};
        Object.defineProperty(Oy, "passive", {
          get: function() {
            T1 = !0;
          }
        }), window.addEventListener("test", Oy, Oy), window.removeEventListener("test", Oy, Oy);
      } catch {
        T1 = !1;
      }
    var Cs = null, A1 = null, Wg = null, Er = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function(e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0
    }, Fg = gl(Er), Dy = Be({}, Er, { view: 0, detail: 0 }), VE = gl(Dy), z1, O1, _y, Ig = Be({}, Dy, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: rf,
      button: 0,
      buttons: 0,
      relatedTarget: function(e) {
        return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
      },
      movementX: function(e) {
        return "movementX" in e ? e.movementX : (e !== _y && (_y && e.type === "mousemove" ? (z1 = e.screenX - _y.screenX, O1 = e.screenY - _y.screenY) : O1 = z1 = 0, _y = e), z1);
      },
      movementY: function(e) {
        return "movementY" in e ? e.movementY : O1;
      }
    }), Wb = gl(Ig), QE = Be({}, Ig, { dataTransfer: 0 }), ZE = gl(QE), JE = Be({}, Dy, { relatedTarget: 0 }), D1 = gl(JE), KE = Be({}, Er, {
      animationName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), $E = gl(KE), kE = Be({}, Er, {
      clipboardData: function(e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      }
    }), WE = gl(kE), FE = Be({}, Er, { data: 0 }), Fb = gl(
      FE
    ), IE = Fb, PE = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    }, eT = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    }, tT = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey"
    }, lT = Be({}, Dy, {
      key: function(e) {
        if (e.key) {
          var t = PE[e.key] || e.key;
          if (t !== "Unidentified") return t;
        }
        return e.type === "keypress" ? (e = ff(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? eT[e.keyCode] || "Unidentified" : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: rf,
      charCode: function(e) {
        return e.type === "keypress" ? ff(e) : 0;
      },
      keyCode: function(e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function(e) {
        return e.type === "keypress" ? ff(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      }
    }), nT = gl(lT), aT = Be({}, Ig, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0
    }), Ib = gl(aT), uT = Be({}, Dy, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: rf
    }), iT = gl(uT), cT = Be({}, Er, {
      propertyName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), oT = gl(cT), sT = Be({}, Ig, {
      deltaX: function(e) {
        return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
      },
      deltaY: function(e) {
        return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
      },
      deltaZ: 0,
      deltaMode: 0
    }), fT = gl(sT), rT = Be({}, Er, {
      newState: 0,
      oldState: 0
    }), dT = gl(rT), hT = [9, 13, 27, 32], Pb = 229, _1 = ec && "CompositionEvent" in window, Ry = null;
    ec && "documentMode" in document && (Ry = document.documentMode);
    var mT = ec && "TextEvent" in window && !Ry, eS = ec && (!_1 || Ry && 8 < Ry && 11 >= Ry), tS = 32, lS = String.fromCharCode(tS), nS = !1, Gh = !1, pT = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0
    }, My = null, Cy = null, aS = !1;
    ec && (aS = cd("input") && (!document.documentMode || 9 < document.documentMode));
    var Zn = typeof Object.is == "function" ? Object.is : od, yT = ec && "documentMode" in document && 11 >= document.documentMode, Xh = null, R1 = null, Uy = null, M1 = !1, Lh = {
      animationend: gc("Animation", "AnimationEnd"),
      animationiteration: gc("Animation", "AnimationIteration"),
      animationstart: gc("Animation", "AnimationStart"),
      transitionrun: gc("Transition", "TransitionRun"),
      transitionstart: gc("Transition", "TransitionStart"),
      transitioncancel: gc("Transition", "TransitionCancel"),
      transitionend: gc("Transition", "TransitionEnd")
    }, C1 = {}, uS = {};
    ec && (uS = document.createElement("div").style, "AnimationEvent" in window || (delete Lh.animationend.animation, delete Lh.animationiteration.animation, delete Lh.animationstart.animation), "TransitionEvent" in window || delete Lh.transitionend.transition);
    var iS = vc("animationend"), cS = vc("animationiteration"), oS = vc("animationstart"), gT = vc("transitionrun"), vT = vc("transitionstart"), bT = vc("transitioncancel"), sS = vc("transitionend"), fS = /* @__PURE__ */ new Map(), U1 = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " "
    );
    U1.push("scrollEnd");
    var rS = 0;
    if (typeof performance == "object" && typeof performance.now == "function")
      var ST = performance, dS = function() {
        return ST.now();
      };
    else {
      var ET = Date;
      dS = function() {
        return ET.now();
      };
    }
    var x1 = typeof reportError == "function" ? reportError : function(e) {
      if (typeof window == "object" && typeof window.ErrorEvent == "function") {
        var t = new window.ErrorEvent("error", {
          bubbles: !0,
          cancelable: !0,
          message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
          error: e
        });
        if (!window.dispatchEvent(t)) return;
      } else if (typeof process == "object" && typeof process.emit == "function") {
        process.emit("uncaughtException", e);
        return;
      }
      console.error(e);
    }, TT = "This object has been omitted by React in the console log to avoid sending too much data from the server. Try logging smaller or more specific objects.", Pg = 0, N1 = 1, H1 = 2, B1 = 3, ev = "– ", tv = "+ ", hS = "  ", Bt = typeof console < "u" && typeof console.timeStamp == "function" && typeof performance < "u" && typeof performance.measure == "function", Ou = "Components ⚛", Ke = "Scheduler ⚛", We = "Blocking", Us = !1, no = {
      color: "primary",
      properties: null,
      tooltipText: "",
      track: Ou
    }, xs = {
      start: -0,
      end: -0,
      detail: { devtools: no }
    }, AT = ["Changed Props", ""], mS = "This component received deeply equal props. It might benefit from useMemo or the React Compiler in its owner.", zT = ["Changed Props", mS], xy = 1, ao = 2, Du = [], Vh = 0, q1 = 0, Ns = {};
    Object.freeze(Ns);
    var _u = null, Qh = null, Ee = 0, OT = 1, qe = 2, zn = 8, si = 16, DT = 32, pS = !1;
    try {
      var yS = Object.preventExtensions({});
    } catch {
      pS = !0;
    }
    var j1 = /* @__PURE__ */ new WeakMap(), Zh = [], Jh = 0, lv = null, Ny = 0, Ru = [], Mu = 0, Tr = null, uo = 1, io = "", hn = null, qt = null, Qe = !1, tc = !1, Xa = null, Hs = null, Cu = !1, w1 = Error(
      "Hydration Mismatch Exception: This is not a real error, and should not leak into userspace. If you're seeing this, it's likely a bug in React."
    ), Y1 = bt(null), G1 = bt(null), gS = {}, nv = null, Kh = null, $h = !1, _T = typeof AbortController < "u" ? AbortController : function() {
      var e = [], t = this.signal = {
        aborted: !1,
        addEventListener: function(n, i) {
          e.push(i);
        }
      };
      this.abort = function() {
        t.aborted = !0, e.forEach(function(n) {
          return n();
        });
      };
    }, RT = tl.unstable_scheduleCallback, MT = tl.unstable_NormalPriority, Ol = {
      $$typeof: wa,
      Consumer: null,
      Provider: null,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0,
      _currentRenderer: null,
      _currentRenderer2: null
    }, Dl = tl.unstable_now, av = console.createTask ? console.createTask : function() {
      return null;
    }, Hy = 1, uv = 2, Jl = -0, Bs = -0, co = -0, oo = null, Jn = -1.1, Ar = -0, $t = -0, pe = -1.1, ve = -1.1, Lt = null, ll = !1, zr = -0, lc = -1.1, By = null, qs = 0, X1 = null, L1 = null, Or = -1.1, qy = null, kh = -1.1, iv = -1.1, so = -0, fo = -1.1, Uu = -1.1, V1 = 0, jy = null, vS = null, bS = null, js = -1.1, Dr = null, ws = -1.1, cv = -1.1, SS = -0, ES = -0, ov = 0, CT = null, TS = 0, wy = -1.1, sv = !1, fv = !1, Yy = null, Q1 = 0, _r = 0, Wh = null, AS = w.S;
    w.S = function(e, t) {
      if (v2 = zl(), typeof t == "object" && t !== null && typeof t.then == "function") {
        if (0 > fo && 0 > Uu) {
          fo = Dl();
          var n = rs(), i = bu();
          (n !== ws || i !== Dr) && (ws = -1.1), js = n, Dr = i;
        }
        Zu(e, t);
      }
      AS !== null && AS(e, t);
    };
    var Rr = bt(null), fi = {
      recordUnsafeLifecycleWarnings: function() {
      },
      flushPendingUnsafeLifecycleWarnings: function() {
      },
      recordLegacyContextWarning: function() {
      },
      flushLegacyContextWarning: function() {
      },
      discardPendingWarnings: function() {
      }
    }, Gy = [], Xy = [], Ly = [], Vy = [], Qy = [], Zy = [], Mr = /* @__PURE__ */ new Set();
    fi.recordUnsafeLifecycleWarnings = function(e, t) {
      Mr.has(e.type) || (typeof t.componentWillMount == "function" && t.componentWillMount.__suppressDeprecationWarning !== !0 && Gy.push(e), e.mode & zn && typeof t.UNSAFE_componentWillMount == "function" && Xy.push(e), typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps.__suppressDeprecationWarning !== !0 && Ly.push(e), e.mode & zn && typeof t.UNSAFE_componentWillReceiveProps == "function" && Vy.push(e), typeof t.componentWillUpdate == "function" && t.componentWillUpdate.__suppressDeprecationWarning !== !0 && Qy.push(e), e.mode & zn && typeof t.UNSAFE_componentWillUpdate == "function" && Zy.push(e));
    }, fi.flushPendingUnsafeLifecycleWarnings = function() {
      var e = /* @__PURE__ */ new Set();
      0 < Gy.length && (Gy.forEach(function(h) {
        e.add(
          ie(h) || "Component"
        ), Mr.add(h.type);
      }), Gy = []);
      var t = /* @__PURE__ */ new Set();
      0 < Xy.length && (Xy.forEach(function(h) {
        t.add(
          ie(h) || "Component"
        ), Mr.add(h.type);
      }), Xy = []);
      var n = /* @__PURE__ */ new Set();
      0 < Ly.length && (Ly.forEach(function(h) {
        n.add(
          ie(h) || "Component"
        ), Mr.add(h.type);
      }), Ly = []);
      var i = /* @__PURE__ */ new Set();
      0 < Vy.length && (Vy.forEach(
        function(h) {
          i.add(
            ie(h) || "Component"
          ), Mr.add(h.type);
        }
      ), Vy = []);
      var o = /* @__PURE__ */ new Set();
      0 < Qy.length && (Qy.forEach(function(h) {
        o.add(
          ie(h) || "Component"
        ), Mr.add(h.type);
      }), Qy = []);
      var s = /* @__PURE__ */ new Set();
      if (0 < Zy.length && (Zy.forEach(function(h) {
        s.add(
          ie(h) || "Component"
        ), Mr.add(h.type);
      }), Zy = []), 0 < t.size) {
        var d = ae(
          t
        );
        console.error(
          `Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.

Please update the following components: %s`,
          d
        );
      }
      0 < i.size && (d = ae(
        i
      ), console.error(
        `Using UNSAFE_componentWillReceiveProps in strict mode is not recommended and may indicate bugs in your code. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://react.dev/link/derived-state

Please update the following components: %s`,
        d
      )), 0 < s.size && (d = ae(
        s
      ), console.error(
        `Using UNSAFE_componentWillUpdate in strict mode is not recommended and may indicate bugs in your code. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.

Please update the following components: %s`,
        d
      )), 0 < e.size && (d = ae(e), console.warn(
        `componentWillMount has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.
* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`,
        d
      )), 0 < n.size && (d = ae(
        n
      ), console.warn(
        `componentWillReceiveProps has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://react.dev/link/derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`,
        d
      )), 0 < o.size && (d = ae(o), console.warn(
        `componentWillUpdate has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* Rename componentWillUpdate to UNSAFE_componentWillUpdate to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`,
        d
      ));
    };
    var rv = /* @__PURE__ */ new Map(), zS = /* @__PURE__ */ new Set();
    fi.recordLegacyContextWarning = function(e, t) {
      for (var n = null, i = e; i !== null; )
        i.mode & zn && (n = i), i = i.return;
      n === null ? console.error(
        "Expected to find a StrictMode component in a strict mode tree. This error is likely caused by a bug in React. Please file an issue."
      ) : !zS.has(e.type) && (i = rv.get(n), e.type.contextTypes != null || e.type.childContextTypes != null || t !== null && typeof t.getChildContext == "function") && (i === void 0 && (i = [], rv.set(n, i)), i.push(e));
    }, fi.flushLegacyContextWarning = function() {
      rv.forEach(function(e) {
        if (e.length !== 0) {
          var t = e[0], n = /* @__PURE__ */ new Set();
          e.forEach(function(o) {
            n.add(ie(o) || "Component"), zS.add(o.type);
          });
          var i = ae(n);
          le(t, function() {
            console.error(
              `Legacy context API has been detected within a strict-mode tree.

The old API will be supported in all 16.x releases, but applications using it should migrate to the new version.

Please update the following components: %s

Learn more about this warning here: https://react.dev/link/legacy-context`,
              i
            );
          });
        }
      });
    }, fi.discardPendingWarnings = function() {
      Gy = [], Xy = [], Ly = [], Vy = [], Qy = [], Zy = [], rv = /* @__PURE__ */ new Map();
    };
    var OS = {
      react_stack_bottom_frame: function(e, t, n) {
        var i = Eu;
        Eu = !0;
        try {
          return e(t, n);
        } finally {
          Eu = i;
        }
      }
    }, Z1 = OS.react_stack_bottom_frame.bind(OS), DS = {
      react_stack_bottom_frame: function(e) {
        var t = Eu;
        Eu = !0;
        try {
          return e.render();
        } finally {
          Eu = t;
        }
      }
    }, _S = DS.react_stack_bottom_frame.bind(DS), RS = {
      react_stack_bottom_frame: function(e, t) {
        try {
          t.componentDidMount();
        } catch (n) {
          xe(e, e.return, n);
        }
      }
    }, J1 = RS.react_stack_bottom_frame.bind(
      RS
    ), MS = {
      react_stack_bottom_frame: function(e, t, n, i, o) {
        try {
          t.componentDidUpdate(n, i, o);
        } catch (s) {
          xe(e, e.return, s);
        }
      }
    }, CS = MS.react_stack_bottom_frame.bind(
      MS
    ), US = {
      react_stack_bottom_frame: function(e, t) {
        var n = t.stack;
        e.componentDidCatch(t.value, {
          componentStack: n !== null ? n : ""
        });
      }
    }, UT = US.react_stack_bottom_frame.bind(
      US
    ), xS = {
      react_stack_bottom_frame: function(e, t, n) {
        try {
          n.componentWillUnmount();
        } catch (i) {
          xe(e, t, i);
        }
      }
    }, NS = xS.react_stack_bottom_frame.bind(
      xS
    ), HS = {
      react_stack_bottom_frame: function(e) {
        var t = e.create;
        return e = e.inst, t = t(), e.destroy = t;
      }
    }, xT = HS.react_stack_bottom_frame.bind(HS), BS = {
      react_stack_bottom_frame: function(e, t, n) {
        try {
          n();
        } catch (i) {
          xe(e, t, i);
        }
      }
    }, NT = BS.react_stack_bottom_frame.bind(BS), qS = {
      react_stack_bottom_frame: function(e) {
        var t = e._init;
        return t(e._payload);
      }
    }, HT = qS.react_stack_bottom_frame.bind(qS), Fh = Error(
      "Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`."
    ), K1 = Error(
      "Suspense Exception: This is not a real error, and should not leak into userspace. If you're seeing this, it's likely a bug in React."
    ), dv = Error(
      "Suspense Exception: This is not a real error! It's an implementation detail of `useActionState` to interrupt the current render. You must either rethrow it immediately, or move the `useActionState` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary."
    ), hv = {
      then: function() {
        console.error(
          'Internal React error: A listener was unexpectedly attached to a "noop" thenable. This is a bug in React. Please file an issue.'
        );
      }
    }, Cr = null, Jy = !1, Ih = null, Ky = 0, je = null, $1, jS = $1 = !1, wS = {}, YS = {}, GS = {};
    ke = function(e, t, n) {
      if (n !== null && typeof n == "object" && n._store && (!n._store.validated && n.key == null || n._store.validated === 2)) {
        if (typeof n._store != "object")
          throw Error(
            "React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue."
          );
        n._store.validated = 1;
        var i = ie(e), o = i || "null";
        if (!wS[o]) {
          wS[o] = !0, n = n._owner, e = e._debugOwner;
          var s = "";
          e && typeof e.tag == "number" && (o = ie(e)) && (s = `

Check the render method of \`` + o + "`."), s || i && (s = `

Check the top-level render call using <` + i + ">.");
          var d = "";
          n != null && e !== n && (i = null, typeof n.tag == "number" ? i = ie(n) : typeof n.name == "string" && (i = n.name), i && (d = " It was passed a child from " + i + ".")), le(t, function() {
            console.error(
              'Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.',
              s,
              d
            );
          });
        }
      }
    };
    var Ur = bl(!0), XS = bl(!1), LS = 0, VS = 1, QS = 2, k1 = 3, Ys = !1, ZS = !1, W1 = null, F1 = !1, Ph = bt(null), mv = bt(0), La = bt(null), xu = null, em = 1, $y = 2, ml = bt(0), pv = 0, Nu = 1, Kn = 2, Va = 4, $n = 8, tm, JS = /* @__PURE__ */ new Set(), KS = /* @__PURE__ */ new Set(), I1 = /* @__PURE__ */ new Set(), $S = /* @__PURE__ */ new Set(), ro = 0, Oe = null, zt = null, _l = null, yv = !1, lm = !1, xr = !1, gv = 0, ky = 0, ho = null, BT = 0, qT = 25, j = null, Hu = null, mo = -1, Wy = !1, Fy = {
      readContext: nt,
      use: ku,
      useCallback: Jt,
      useContext: Jt,
      useEffect: Jt,
      useImperativeHandle: Jt,
      useLayoutEffect: Jt,
      useInsertionEffect: Jt,
      useMemo: Jt,
      useReducer: Jt,
      useRef: Jt,
      useState: Jt,
      useDebugValue: Jt,
      useDeferredValue: Jt,
      useTransition: Jt,
      useSyncExternalStore: Jt,
      useId: Jt,
      useHostTransitionStatus: Jt,
      useFormState: Jt,
      useActionState: Jt,
      useOptimistic: Jt,
      useMemoCache: Jt,
      useCacheRefresh: Jt
    };
    Fy.useEffectEvent = Jt;
    var P1 = null, kS = null, eb = null, WS = null, nc = null, ri = null, vv = null;
    P1 = {
      readContext: function(e) {
        return nt(e);
      },
      use: ku,
      useCallback: function(e, t) {
        return j = "useCallback", ze(), $u(t), Md(e, t);
      },
      useContext: function(e) {
        return j = "useContext", ze(), nt(e);
      },
      useEffect: function(e, t) {
        return j = "useEffect", ze(), $u(t), Bc(e, t);
      },
      useImperativeHandle: function(e, t, n) {
        return j = "useImperativeHandle", ze(), $u(n), cu(e, t, n);
      },
      useInsertionEffect: function(e, t) {
        j = "useInsertionEffect", ze(), $u(t), wi(4, Kn, e, t);
      },
      useLayoutEffect: function(e, t) {
        return j = "useLayoutEffect", ze(), $u(t), ln(e, t);
      },
      useMemo: function(e, t) {
        j = "useMemo", ze(), $u(t);
        var n = w.H;
        w.H = nc;
        try {
          return nn(e, t);
        } finally {
          w.H = n;
        }
      },
      useReducer: function(e, t, n) {
        j = "useReducer", ze();
        var i = w.H;
        w.H = nc;
        try {
          return Xo(e, t, n);
        } finally {
          w.H = i;
        }
      },
      useRef: function(e) {
        return j = "useRef", ze(), Rd(e);
      },
      useState: function(e) {
        j = "useState", ze();
        var t = w.H;
        w.H = nc;
        try {
          return Hi(e);
        } finally {
          w.H = t;
        }
      },
      useDebugValue: function() {
        j = "useDebugValue", ze();
      },
      useDeferredValue: function(e, t) {
        return j = "useDeferredValue", ze(), Jo(e, t);
      },
      useTransition: function() {
        return j = "useTransition", ze(), Yi();
      },
      useSyncExternalStore: function(e, t, n) {
        return j = "useSyncExternalStore", ze(), Lo(
          e,
          t,
          n
        );
      },
      useId: function() {
        return j = "useId", ze(), Bf();
      },
      useFormState: function(e, t) {
        return j = "useFormState", ze(), zf(), Bn(e, t);
      },
      useActionState: function(e, t) {
        return j = "useActionState", ze(), Bn(e, t);
      },
      useOptimistic: function(e) {
        return j = "useOptimistic", ze(), Hc(e);
      },
      useHostTransitionStatus: Pu,
      useMemoCache: Nn,
      useCacheRefresh: function() {
        return j = "useCacheRefresh", ze(), Cd();
      },
      useEffectEvent: function(e) {
        return j = "useEffectEvent", ze(), Nf(e);
      }
    }, kS = {
      readContext: function(e) {
        return nt(e);
      },
      use: ku,
      useCallback: function(e, t) {
        return j = "useCallback", $(), Md(e, t);
      },
      useContext: function(e) {
        return j = "useContext", $(), nt(e);
      },
      useEffect: function(e, t) {
        return j = "useEffect", $(), Bc(e, t);
      },
      useImperativeHandle: function(e, t, n) {
        return j = "useImperativeHandle", $(), cu(e, t, n);
      },
      useInsertionEffect: function(e, t) {
        j = "useInsertionEffect", $(), wi(4, Kn, e, t);
      },
      useLayoutEffect: function(e, t) {
        return j = "useLayoutEffect", $(), ln(e, t);
      },
      useMemo: function(e, t) {
        j = "useMemo", $();
        var n = w.H;
        w.H = nc;
        try {
          return nn(e, t);
        } finally {
          w.H = n;
        }
      },
      useReducer: function(e, t, n) {
        j = "useReducer", $();
        var i = w.H;
        w.H = nc;
        try {
          return Xo(e, t, n);
        } finally {
          w.H = i;
        }
      },
      useRef: function(e) {
        return j = "useRef", $(), Rd(e);
      },
      useState: function(e) {
        j = "useState", $();
        var t = w.H;
        w.H = nc;
        try {
          return Hi(e);
        } finally {
          w.H = t;
        }
      },
      useDebugValue: function() {
        j = "useDebugValue", $();
      },
      useDeferredValue: function(e, t) {
        return j = "useDeferredValue", $(), Jo(e, t);
      },
      useTransition: function() {
        return j = "useTransition", $(), Yi();
      },
      useSyncExternalStore: function(e, t, n) {
        return j = "useSyncExternalStore", $(), Lo(
          e,
          t,
          n
        );
      },
      useId: function() {
        return j = "useId", $(), Bf();
      },
      useActionState: function(e, t) {
        return j = "useActionState", $(), Bn(e, t);
      },
      useFormState: function(e, t) {
        return j = "useFormState", $(), zf(), Bn(e, t);
      },
      useOptimistic: function(e) {
        return j = "useOptimistic", $(), Hc(e);
      },
      useHostTransitionStatus: Pu,
      useMemoCache: Nn,
      useCacheRefresh: function() {
        return j = "useCacheRefresh", $(), Cd();
      },
      useEffectEvent: function(e) {
        return j = "useEffectEvent", $(), Nf(e);
      }
    }, eb = {
      readContext: function(e) {
        return nt(e);
      },
      use: ku,
      useCallback: function(e, t) {
        return j = "useCallback", $(), Ma(e, t);
      },
      useContext: function(e) {
        return j = "useContext", $(), nt(e);
      },
      useEffect: function(e, t) {
        j = "useEffect", $(), fl(2048, $n, e, t);
      },
      useImperativeHandle: function(e, t, n) {
        return j = "useImperativeHandle", $(), Zo(e, t, n);
      },
      useInsertionEffect: function(e, t) {
        return j = "useInsertionEffect", $(), fl(4, Kn, e, t);
      },
      useLayoutEffect: function(e, t) {
        return j = "useLayoutEffect", $(), fl(4, Va, e, t);
      },
      useMemo: function(e, t) {
        j = "useMemo", $();
        var n = w.H;
        w.H = ri;
        try {
          return xt(e, t);
        } finally {
          w.H = n;
        }
      },
      useReducer: function(e, t, n) {
        j = "useReducer", $();
        var i = w.H;
        w.H = ri;
        try {
          return Uc(e, t, n);
        } finally {
          w.H = i;
        }
      },
      useRef: function() {
        return j = "useRef", $(), ot().memoizedState;
      },
      useState: function() {
        j = "useState", $();
        var e = w.H;
        w.H = ri;
        try {
          return Uc(Hn);
        } finally {
          w.H = e;
        }
      },
      useDebugValue: function() {
        j = "useDebugValue", $();
      },
      useDeferredValue: function(e, t) {
        return j = "useDeferredValue", $(), ou(e, t);
      },
      useTransition: function() {
        return j = "useTransition", $(), K0();
      },
      useSyncExternalStore: function(e, t, n) {
        return j = "useSyncExternalStore", $(), Nc(
          e,
          t,
          n
        );
      },
      useId: function() {
        return j = "useId", $(), ot().memoizedState;
      },
      useFormState: function(e) {
        return j = "useFormState", $(), zf(), qi(e);
      },
      useActionState: function(e) {
        return j = "useActionState", $(), qi(e);
      },
      useOptimistic: function(e, t) {
        return j = "useOptimistic", $(), Cf(e, t);
      },
      useHostTransitionStatus: Pu,
      useMemoCache: Nn,
      useCacheRefresh: function() {
        return j = "useCacheRefresh", $(), ot().memoizedState;
      },
      useEffectEvent: function(e) {
        return j = "useEffectEvent", $(), Qo(e);
      }
    }, WS = {
      readContext: function(e) {
        return nt(e);
      },
      use: ku,
      useCallback: function(e, t) {
        return j = "useCallback", $(), Ma(e, t);
      },
      useContext: function(e) {
        return j = "useContext", $(), nt(e);
      },
      useEffect: function(e, t) {
        j = "useEffect", $(), fl(2048, $n, e, t);
      },
      useImperativeHandle: function(e, t, n) {
        return j = "useImperativeHandle", $(), Zo(e, t, n);
      },
      useInsertionEffect: function(e, t) {
        return j = "useInsertionEffect", $(), fl(4, Kn, e, t);
      },
      useLayoutEffect: function(e, t) {
        return j = "useLayoutEffect", $(), fl(4, Va, e, t);
      },
      useMemo: function(e, t) {
        j = "useMemo", $();
        var n = w.H;
        w.H = vv;
        try {
          return xt(e, t);
        } finally {
          w.H = n;
        }
      },
      useReducer: function(e, t, n) {
        j = "useReducer", $();
        var i = w.H;
        w.H = vv;
        try {
          return xc(e, t, n);
        } finally {
          w.H = i;
        }
      },
      useRef: function() {
        return j = "useRef", $(), ot().memoizedState;
      },
      useState: function() {
        j = "useState", $();
        var e = w.H;
        w.H = vv;
        try {
          return xc(Hn);
        } finally {
          w.H = e;
        }
      },
      useDebugValue: function() {
        j = "useDebugValue", $();
      },
      useDeferredValue: function(e, t) {
        return j = "useDeferredValue", $(), Ce(e, t);
      },
      useTransition: function() {
        return j = "useTransition", $(), Yt();
      },
      useSyncExternalStore: function(e, t, n) {
        return j = "useSyncExternalStore", $(), Nc(
          e,
          t,
          n
        );
      },
      useId: function() {
        return j = "useId", $(), ot().memoizedState;
      },
      useFormState: function(e) {
        return j = "useFormState", $(), zf(), ji(e);
      },
      useActionState: function(e) {
        return j = "useActionState", $(), ji(e);
      },
      useOptimistic: function(e, t) {
        return j = "useOptimistic", $(), Uf(e, t);
      },
      useHostTransitionStatus: Pu,
      useMemoCache: Nn,
      useCacheRefresh: function() {
        return j = "useCacheRefresh", $(), ot().memoizedState;
      },
      useEffectEvent: function(e) {
        return j = "useEffectEvent", $(), Qo(e);
      }
    }, nc = {
      readContext: function(e) {
        return re(), nt(e);
      },
      use: function(e) {
        return X(), ku(e);
      },
      useCallback: function(e, t) {
        return j = "useCallback", X(), ze(), Md(e, t);
      },
      useContext: function(e) {
        return j = "useContext", X(), ze(), nt(e);
      },
      useEffect: function(e, t) {
        return j = "useEffect", X(), ze(), Bc(e, t);
      },
      useImperativeHandle: function(e, t, n) {
        return j = "useImperativeHandle", X(), ze(), cu(e, t, n);
      },
      useInsertionEffect: function(e, t) {
        j = "useInsertionEffect", X(), ze(), wi(4, Kn, e, t);
      },
      useLayoutEffect: function(e, t) {
        return j = "useLayoutEffect", X(), ze(), ln(e, t);
      },
      useMemo: function(e, t) {
        j = "useMemo", X(), ze();
        var n = w.H;
        w.H = nc;
        try {
          return nn(e, t);
        } finally {
          w.H = n;
        }
      },
      useReducer: function(e, t, n) {
        j = "useReducer", X(), ze();
        var i = w.H;
        w.H = nc;
        try {
          return Xo(e, t, n);
        } finally {
          w.H = i;
        }
      },
      useRef: function(e) {
        return j = "useRef", X(), ze(), Rd(e);
      },
      useState: function(e) {
        j = "useState", X(), ze();
        var t = w.H;
        w.H = nc;
        try {
          return Hi(e);
        } finally {
          w.H = t;
        }
      },
      useDebugValue: function() {
        j = "useDebugValue", X(), ze();
      },
      useDeferredValue: function(e, t) {
        return j = "useDeferredValue", X(), ze(), Jo(e, t);
      },
      useTransition: function() {
        return j = "useTransition", X(), ze(), Yi();
      },
      useSyncExternalStore: function(e, t, n) {
        return j = "useSyncExternalStore", X(), ze(), Lo(
          e,
          t,
          n
        );
      },
      useId: function() {
        return j = "useId", X(), ze(), Bf();
      },
      useFormState: function(e, t) {
        return j = "useFormState", X(), ze(), Bn(e, t);
      },
      useActionState: function(e, t) {
        return j = "useActionState", X(), ze(), Bn(e, t);
      },
      useOptimistic: function(e) {
        return j = "useOptimistic", X(), ze(), Hc(e);
      },
      useMemoCache: function(e) {
        return X(), Nn(e);
      },
      useHostTransitionStatus: Pu,
      useCacheRefresh: function() {
        return j = "useCacheRefresh", ze(), Cd();
      },
      useEffectEvent: function(e) {
        return j = "useEffectEvent", X(), ze(), Nf(e);
      }
    }, ri = {
      readContext: function(e) {
        return re(), nt(e);
      },
      use: function(e) {
        return X(), ku(e);
      },
      useCallback: function(e, t) {
        return j = "useCallback", X(), $(), Ma(e, t);
      },
      useContext: function(e) {
        return j = "useContext", X(), $(), nt(e);
      },
      useEffect: function(e, t) {
        j = "useEffect", X(), $(), fl(2048, $n, e, t);
      },
      useImperativeHandle: function(e, t, n) {
        return j = "useImperativeHandle", X(), $(), Zo(e, t, n);
      },
      useInsertionEffect: function(e, t) {
        return j = "useInsertionEffect", X(), $(), fl(4, Kn, e, t);
      },
      useLayoutEffect: function(e, t) {
        return j = "useLayoutEffect", X(), $(), fl(4, Va, e, t);
      },
      useMemo: function(e, t) {
        j = "useMemo", X(), $();
        var n = w.H;
        w.H = ri;
        try {
          return xt(e, t);
        } finally {
          w.H = n;
        }
      },
      useReducer: function(e, t, n) {
        j = "useReducer", X(), $();
        var i = w.H;
        w.H = ri;
        try {
          return Uc(e, t, n);
        } finally {
          w.H = i;
        }
      },
      useRef: function() {
        return j = "useRef", X(), $(), ot().memoizedState;
      },
      useState: function() {
        j = "useState", X(), $();
        var e = w.H;
        w.H = ri;
        try {
          return Uc(Hn);
        } finally {
          w.H = e;
        }
      },
      useDebugValue: function() {
        j = "useDebugValue", X(), $();
      },
      useDeferredValue: function(e, t) {
        return j = "useDeferredValue", X(), $(), ou(e, t);
      },
      useTransition: function() {
        return j = "useTransition", X(), $(), K0();
      },
      useSyncExternalStore: function(e, t, n) {
        return j = "useSyncExternalStore", X(), $(), Nc(
          e,
          t,
          n
        );
      },
      useId: function() {
        return j = "useId", X(), $(), ot().memoizedState;
      },
      useFormState: function(e) {
        return j = "useFormState", X(), $(), qi(e);
      },
      useActionState: function(e) {
        return j = "useActionState", X(), $(), qi(e);
      },
      useOptimistic: function(e, t) {
        return j = "useOptimistic", X(), $(), Cf(e, t);
      },
      useMemoCache: function(e) {
        return X(), Nn(e);
      },
      useHostTransitionStatus: Pu,
      useCacheRefresh: function() {
        return j = "useCacheRefresh", $(), ot().memoizedState;
      },
      useEffectEvent: function(e) {
        return j = "useEffectEvent", X(), $(), Qo(e);
      }
    }, vv = {
      readContext: function(e) {
        return re(), nt(e);
      },
      use: function(e) {
        return X(), ku(e);
      },
      useCallback: function(e, t) {
        return j = "useCallback", X(), $(), Ma(e, t);
      },
      useContext: function(e) {
        return j = "useContext", X(), $(), nt(e);
      },
      useEffect: function(e, t) {
        j = "useEffect", X(), $(), fl(2048, $n, e, t);
      },
      useImperativeHandle: function(e, t, n) {
        return j = "useImperativeHandle", X(), $(), Zo(e, t, n);
      },
      useInsertionEffect: function(e, t) {
        return j = "useInsertionEffect", X(), $(), fl(4, Kn, e, t);
      },
      useLayoutEffect: function(e, t) {
        return j = "useLayoutEffect", X(), $(), fl(4, Va, e, t);
      },
      useMemo: function(e, t) {
        j = "useMemo", X(), $();
        var n = w.H;
        w.H = ri;
        try {
          return xt(e, t);
        } finally {
          w.H = n;
        }
      },
      useReducer: function(e, t, n) {
        j = "useReducer", X(), $();
        var i = w.H;
        w.H = ri;
        try {
          return xc(e, t, n);
        } finally {
          w.H = i;
        }
      },
      useRef: function() {
        return j = "useRef", X(), $(), ot().memoizedState;
      },
      useState: function() {
        j = "useState", X(), $();
        var e = w.H;
        w.H = ri;
        try {
          return xc(Hn);
        } finally {
          w.H = e;
        }
      },
      useDebugValue: function() {
        j = "useDebugValue", X(), $();
      },
      useDeferredValue: function(e, t) {
        return j = "useDeferredValue", X(), $(), Ce(e, t);
      },
      useTransition: function() {
        return j = "useTransition", X(), $(), Yt();
      },
      useSyncExternalStore: function(e, t, n) {
        return j = "useSyncExternalStore", X(), $(), Nc(
          e,
          t,
          n
        );
      },
      useId: function() {
        return j = "useId", X(), $(), ot().memoizedState;
      },
      useFormState: function(e) {
        return j = "useFormState", X(), $(), ji(e);
      },
      useActionState: function(e) {
        return j = "useActionState", X(), $(), ji(e);
      },
      useOptimistic: function(e, t) {
        return j = "useOptimistic", X(), $(), Uf(e, t);
      },
      useMemoCache: function(e) {
        return X(), Nn(e);
      },
      useHostTransitionStatus: Pu,
      useCacheRefresh: function() {
        return j = "useCacheRefresh", $(), ot().memoizedState;
      },
      useEffectEvent: function(e) {
        return j = "useEffectEvent", X(), $(), Qo(e);
      }
    };
    var FS = {}, IS = /* @__PURE__ */ new Set(), PS = /* @__PURE__ */ new Set(), e2 = /* @__PURE__ */ new Set(), t2 = /* @__PURE__ */ new Set(), l2 = /* @__PURE__ */ new Set(), n2 = /* @__PURE__ */ new Set(), a2 = /* @__PURE__ */ new Set(), u2 = /* @__PURE__ */ new Set(), i2 = /* @__PURE__ */ new Set(), c2 = /* @__PURE__ */ new Set();
    Object.freeze(FS);
    var tb = {
      enqueueSetState: function(e, t, n) {
        e = e._reactInternals;
        var i = Vl(e), o = sl(i);
        o.payload = t, n != null && (Yc(n), o.callback = n), t = nu(e, o, i), t !== null && (eu(i, "this.setState()", e), Ae(t, e, i), ia(t, e, i));
      },
      enqueueReplaceState: function(e, t, n) {
        e = e._reactInternals;
        var i = Vl(e), o = sl(i);
        o.tag = VS, o.payload = t, n != null && (Yc(n), o.callback = n), t = nu(e, o, i), t !== null && (eu(i, "this.replaceState()", e), Ae(t, e, i), ia(t, e, i));
      },
      enqueueForceUpdate: function(e, t) {
        e = e._reactInternals;
        var n = Vl(e), i = sl(n);
        i.tag = QS, t != null && (Yc(t), i.callback = t), t = nu(e, i, n), t !== null && (eu(n, "this.forceUpdate()", e), Ae(t, e, n), ia(t, e, n));
      }
    }, nm = null, lb = null, nb = Error(
      "This is not a real error. It's an implementation detail of React's selective hydration feature. If this leaks into userspace, it's a bug in React. Please file an issue."
    ), Rl = !1, o2 = {}, s2 = {}, f2 = {}, r2 = {}, am = !1, d2 = {}, bv = {}, ab = {
      dehydrated: null,
      treeContext: null,
      retryLane: 0,
      hydrationErrors: null
    }, h2 = !1, m2 = null;
    m2 = /* @__PURE__ */ new Set();
    var po = !1, Ml = !1, ub = !1, p2 = typeof WeakSet == "function" ? WeakSet : Set, Kl = null, um = null, im = null, Cl = null, da = !1, di = null, wl = !1, Iy = 8192, jT = {
      getCacheForType: function(e) {
        var t = nt(Ol), n = t.data.get(e);
        return n === void 0 && (n = e(), t.data.set(e, n)), n;
      },
      cacheSignal: function() {
        return nt(Ol).controller.signal;
      },
      getOwner: function() {
        return An;
      }
    };
    if (typeof Symbol == "function" && Symbol.for) {
      var Py = Symbol.for;
      Py("selector.component"), Py("selector.has_pseudo_class"), Py("selector.role"), Py("selector.test_id"), Py("selector.text");
    }
    var wT = [], YT = typeof WeakMap == "function" ? WeakMap : Map, $l = 0, Yl = 2, Qa = 4, yo = 0, e0 = 1, Nr = 2, Sv = 3, Gs = 4, Ev = 6, y2 = 5, Ie = $l, Ot = null, Ge = null, we = 0, ha = 0, Tv = 1, Hr = 2, t0 = 3, g2 = 4, ib = 5, l0 = 6, Av = 7, cb = 8, Br = 9, vt = ha, Za = null, Xs = !1, cm = !1, ob = !1, ac = 0, kt = yo, Ls = 0, Vs = 0, sb = 0, ma = 0, qr = 0, n0 = null, kn = null, zv = !1, Ov = 0, v2 = 0, b2 = 300, Dv = 1 / 0, S2 = 500, a0 = null, cl = null, Qs = null, _v = 0, fb = 1, rb = 2, E2 = 3, Zs = 0, T2 = 1, A2 = 2, z2 = 3, O2 = 4, Rv = 5, Ul = 0, Js = null, om = null, hi = 0, db = 0, hb = -0, mb = null, D2 = null, _2 = null, mi = _v, R2 = null, GT = 50, u0 = 0, pb = null, yb = !1, Mv = !1, XT = 50, jr = 0, i0 = null, sm = !1, Cv = null, M2 = !1, C2 = /* @__PURE__ */ new Set(), LT = {}, Uv = null, fm = null, gb = !1, vb = !1, xv = !1, bb = !1, Ks = 0, Sb = {};
    (function() {
      for (var e = 0; e < U1.length; e++) {
        var t = U1[e], n = t.toLowerCase();
        t = t[0].toUpperCase() + t.slice(1), ba(n, "on" + t);
      }
      ba(iS, "onAnimationEnd"), ba(cS, "onAnimationIteration"), ba(oS, "onAnimationStart"), ba("dblclick", "onDoubleClick"), ba("focusin", "onFocus"), ba("focusout", "onBlur"), ba(gT, "onTransitionRun"), ba(vT, "onTransitionStart"), ba(bT, "onTransitionCancel"), ba(sS, "onTransitionEnd");
    })(), Eo("onMouseEnter", ["mouseout", "mouseover"]), Eo("onMouseLeave", ["mouseout", "mouseover"]), Eo("onPointerEnter", ["pointerout", "pointerover"]), Eo("onPointerLeave", ["pointerout", "pointerover"]), ya(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " "
      )
    ), ya(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " "
      )
    ), ya("onBeforeInput", [
      "compositionend",
      "keypress",
      "textInput",
      "paste"
    ]), ya(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" ")
    ), ya(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" ")
    ), ya(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
    );
    var c0 = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " "
    ), Eb = new Set(
      "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(c0)
    ), Nv = "_reactListening" + Math.random().toString(36).slice(2), U2 = !1, x2 = !1, Hv = !1, N2 = !1, Bv = !1, qv = !1, H2 = !1, jv = {}, VT = /\r\n?/g, QT = /\u0000|\uFFFD/g, wr = "http://www.w3.org/1999/xlink", Tb = "http://www.w3.org/XML/1998/namespace", ZT = "javascript:throw new Error('React form unexpectedly submitted.')", JT = "suppressHydrationWarning", Yr = "&", wv = "/&", o0 = "$", s0 = "/$", $s = "$?", Gr = "$~", rm = "$!", KT = "html", $T = "body", kT = "head", Ab = "F!", B2 = "F", q2 = "loading", WT = "style", go = 0, dm = 1, Yv = 2, zb = null, Ob = null, j2 = { dialog: !0, webview: !0 }, Db = null, f0 = void 0, w2 = typeof setTimeout == "function" ? setTimeout : void 0, FT = typeof clearTimeout == "function" ? clearTimeout : void 0, Xr = -1, Y2 = typeof Promise == "function" ? Promise : void 0, IT = typeof queueMicrotask == "function" ? queueMicrotask : typeof Y2 < "u" ? function(e) {
      return Y2.resolve(null).then(e).catch(pg);
    } : w2, _b = null, Lr = 0, r0 = 1, G2 = 2, X2 = 3, Bu = 4, qu = /* @__PURE__ */ new Map(), L2 = /* @__PURE__ */ new Set(), vo = ut.d;
    ut.d = {
      f: function() {
        var e = vo.f(), t = Gn();
        return e || t;
      },
      r: function(e) {
        var t = pa(e);
        t !== null && t.tag === 5 && t.type === "form" ? Ko(t) : vo.r(e);
      },
      D: function(e) {
        vo.D(e), Ip("dns-prefetch", e, null);
      },
      C: function(e, t) {
        vo.C(e, t), Ip("preconnect", e, t);
      },
      L: function(e, t, n) {
        vo.L(e, t, n);
        var i = hm;
        if (i && e && t) {
          var o = 'link[rel="preload"][as="' + ht(t) + '"]';
          t === "image" && n && n.imageSrcSet ? (o += '[imagesrcset="' + ht(
            n.imageSrcSet
          ) + '"]', typeof n.imageSizes == "string" && (o += '[imagesizes="' + ht(
            n.imageSizes
          ) + '"]')) : o += '[href="' + ht(e) + '"]';
          var s = o;
          switch (t) {
            case "style":
              s = kc(e);
              break;
            case "script":
              s = Wc(e);
          }
          qu.has(s) || (e = Be(
            {
              rel: "preload",
              href: t === "image" && n && n.imageSrcSet ? void 0 : e,
              as: t
            },
            n
          ), qu.set(s, e), i.querySelector(o) !== null || t === "style" && i.querySelector(
            cr(s)
          ) || t === "script" && i.querySelector(or(s)) || (t = i.createElement("link"), Nt(t, "link", e), Wt(t), i.head.appendChild(t)));
        }
      },
      m: function(e, t) {
        vo.m(e, t);
        var n = hm;
        if (n && e) {
          var i = t && typeof t.as == "string" ? t.as : "script", o = 'link[rel="modulepreload"][as="' + ht(i) + '"][href="' + ht(e) + '"]', s = o;
          switch (i) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              s = Wc(e);
          }
          if (!qu.has(s) && (e = Be({ rel: "modulepreload", href: e }, t), qu.set(s, e), n.querySelector(o) === null)) {
            switch (i) {
              case "audioworklet":
              case "paintworklet":
              case "serviceworker":
              case "sharedworker":
              case "worker":
              case "script":
                if (n.querySelector(or(s)))
                  return;
            }
            i = n.createElement("link"), Nt(i, "link", e), Wt(i), n.head.appendChild(i);
          }
        }
      },
      X: function(e, t) {
        vo.X(e, t);
        var n = hm;
        if (n && e) {
          var i = In(n).hoistableScripts, o = Wc(e), s = i.get(o);
          s || (s = n.querySelector(
            or(o)
          ), s || (e = Be({ src: e, async: !0 }, t), (t = qu.get(o)) && ty(e, t), s = n.createElement("script"), Wt(s), Nt(s, "link", e), n.head.appendChild(s)), s = {
            type: "script",
            instance: s,
            count: 1,
            state: null
          }, i.set(o, s));
        }
      },
      S: function(e, t, n) {
        vo.S(e, t, n);
        var i = hm;
        if (i && e) {
          var o = In(i).hoistableStyles, s = kc(e);
          t = t || "default";
          var d = o.get(s);
          if (!d) {
            var h = { loading: Lr, preload: null };
            if (d = i.querySelector(
              cr(s)
            ))
              h.loading = r0 | Bu;
            else {
              e = Be(
                {
                  rel: "stylesheet",
                  href: e,
                  "data-precedence": t
                },
                n
              ), (n = qu.get(s)) && ey(e, n);
              var v = d = i.createElement("link");
              Wt(v), Nt(v, "link", e), v._p = new Promise(function(S, _) {
                v.onload = S, v.onerror = _;
              }), v.addEventListener("load", function() {
                h.loading |= r0;
              }), v.addEventListener("error", function() {
                h.loading |= G2;
              }), h.loading |= Bu, ms(d, t, i);
            }
            d = {
              type: "stylesheet",
              instance: d,
              count: 1,
              state: h
            }, o.set(s, d);
          }
        }
      },
      M: function(e, t) {
        vo.M(e, t);
        var n = hm;
        if (n && e) {
          var i = In(n).hoistableScripts, o = Wc(e), s = i.get(o);
          s || (s = n.querySelector(
            or(o)
          ), s || (e = Be({ src: e, async: !0, type: "module" }, t), (t = qu.get(o)) && ty(e, t), s = n.createElement("script"), Wt(s), Nt(s, "link", e), n.head.appendChild(s)), s = {
            type: "script",
            instance: s,
            count: 1,
            state: null
          }, i.set(o, s));
        }
      }
    };
    var hm = typeof document > "u" ? null : document, Gv = null, PT = 6e4, eA = 800, tA = 500, Rb = 0, Mb = null, Xv = null, Vr = b1, d0 = {
      $$typeof: wa,
      Provider: null,
      Consumer: null,
      _currentValue: Vr,
      _currentValue2: Vr,
      _threadCount: 0
    }, V2 = "%c%s%c", Q2 = "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px", Z2 = "", Lv = " ", lA = Function.prototype.bind, J2 = !1, K2 = null, $2 = null, k2 = null, W2 = null, F2 = null, I2 = null, P2 = null, eE = null, tE = null, lE = null;
    K2 = function(e, t, n, i) {
      t = b(e, t), t !== null && (n = m(t.memoizedState, n, 0, i), t.memoizedState = n, t.baseState = n, e.memoizedProps = Be({}, e.memoizedProps), n = Xl(e, 2), n !== null && Ae(n, e, 2));
    }, $2 = function(e, t, n) {
      t = b(e, t), t !== null && (n = x(t.memoizedState, n, 0), t.memoizedState = n, t.baseState = n, e.memoizedProps = Be({}, e.memoizedProps), n = Xl(e, 2), n !== null && Ae(n, e, 2));
    }, k2 = function(e, t, n, i) {
      t = b(e, t), t !== null && (n = y(t.memoizedState, n, i), t.memoizedState = n, t.baseState = n, e.memoizedProps = Be({}, e.memoizedProps), n = Xl(e, 2), n !== null && Ae(n, e, 2));
    }, W2 = function(e, t, n) {
      e.pendingProps = m(e.memoizedProps, t, 0, n), e.alternate && (e.alternate.pendingProps = e.pendingProps), t = Xl(e, 2), t !== null && Ae(t, e, 2);
    }, F2 = function(e, t) {
      e.pendingProps = x(e.memoizedProps, t, 0), e.alternate && (e.alternate.pendingProps = e.pendingProps), t = Xl(e, 2), t !== null && Ae(t, e, 2);
    }, I2 = function(e, t, n) {
      e.pendingProps = y(
        e.memoizedProps,
        t,
        n
      ), e.alternate && (e.alternate.pendingProps = e.pendingProps), t = Xl(e, 2), t !== null && Ae(t, e, 2);
    }, P2 = function(e) {
      var t = Xl(e, 2);
      t !== null && Ae(t, e, 2);
    }, eE = function(e) {
      var t = Jr(), n = Xl(e, t);
      n !== null && Ae(n, e, t);
    }, tE = function(e) {
      ee = e;
    }, lE = function(e) {
      G = e;
    };
    var Vv = !0, Qv = null, Cb = !1, ks = null, Ws = null, Fs = null, h0 = /* @__PURE__ */ new Map(), m0 = /* @__PURE__ */ new Map(), Is = [], nA = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
      " "
    ), Zv = null;
    if (ja.prototype.render = ry.prototype.render = function(e) {
      var t = this._internalRoot;
      if (t === null) throw Error("Cannot update an unmounted root.");
      var n = arguments;
      typeof n[1] == "function" ? console.error(
        "does not support the second callback argument. To execute a side effect after rendering, declare it in a component body with useEffect()."
      ) : Ze(n[1]) ? console.error(
        "You passed a container to the second argument of root.render(...). You don't need to pass it again since you already passed it to create the root."
      ) : typeof n[1] < "u" && console.error(
        "You passed a second argument to root.render(...) but it only accepts one argument."
      ), n = e;
      var i = t.current, o = Vl(i);
      Sh(i, o, n, t, null, null);
    }, ja.prototype.unmount = ry.prototype.unmount = function() {
      var e = arguments;
      if (typeof e[0] == "function" && console.error(
        "does not support a callback argument. To execute a side effect after rendering, declare it in a component body with useEffect()."
      ), e = this._internalRoot, e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        (Ie & (Yl | Qa)) !== $l && console.error(
          "Attempted to synchronously unmount a root while React was already rendering. React cannot finish unmounting the root until the current render has completed, which may lead to a race condition."
        ), Sh(e.current, 2, null, e, null, null), Gn(), t[oi] = null;
      }
    }, ja.prototype.unstable_scheduleHydration = function(e) {
      if (e) {
        var t = A0();
        e = { blockedOn: null, target: e, priority: t };
        for (var n = 0; n < Is.length && t !== 0 && t < Is[n].priority; n++) ;
        Is.splice(n, 0, e), n === 0 && fy(e);
      }
    }, (function() {
      var e = hr.version;
      if (e !== "19.2.1")
        throw Error(
          `Incompatible React versions: The "react" and "react-dom" packages must have the exact same version. Instead got:
  - react:      ` + (e + `
  - react-dom:  19.2.1
Learn more: https://react.dev/warnings/version-mismatch`)
        );
    })(), typeof Map == "function" && Map.prototype != null && typeof Map.prototype.forEach == "function" && typeof Set == "function" && Set.prototype != null && typeof Set.prototype.clear == "function" && typeof Set.prototype.forEach == "function" || console.error(
      "React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://react.dev/link/react-polyfills"
    ), ut.findDOMNode = function(e) {
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == "function" ? Error("Unable to find node on an unmounted component.") : (e = Object.keys(e).join(","), Error(
          "Argument appears to not be a ReactComponent. Keys: " + e
        ));
      return e = Gl(t), e = e !== null ? nl(e) : null, e = e === null ? null : e.stateNode, e;
    }, !(function() {
      var e = {
        bundleType: 1,
        version: "19.2.1",
        rendererPackageName: "react-dom",
        currentDispatcherRef: w,
        reconcilerVersion: "19.2.1"
      };
      return e.overrideHookState = K2, e.overrideHookStateDeletePath = $2, e.overrideHookStateRenamePath = k2, e.overrideProps = W2, e.overridePropsDeletePath = F2, e.overridePropsRenamePath = I2, e.scheduleUpdate = P2, e.scheduleRetry = eE, e.setErrorHandler = tE, e.setSuspenseHandler = lE, e.scheduleRefresh = lt, e.scheduleRoot = it, e.setRefreshHandler = Ct, e.getCurrentFiber = yt, ym(e);
    })() && ec && window.top === window.self && (-1 < navigator.userAgent.indexOf("Chrome") && navigator.userAgent.indexOf("Edge") === -1 || -1 < navigator.userAgent.indexOf("Firefox"))) {
      var nE = window.location.protocol;
      /^(https?|file):$/.test(nE) && console.info(
        "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools" + (nE === "file:" ? `
You might need to use a local HTTP server (instead of file://): https://react.dev/link/react-devtools-faq` : ""),
        "font-weight:bold"
      );
    }
    v0.createRoot = function(e, t) {
      if (!Ze(e))
        throw Error("Target container is not a DOM element.");
      dy(e);
      var n = !1, i = "", o = Nd, s = Hd, d = ip;
      return t != null && (t.hydrate ? console.warn(
        "hydrate through createRoot is deprecated. Use ReactDOMClient.hydrateRoot(container, <App />) instead."
      ) : typeof t == "object" && t !== null && t.$$typeof === fa && console.error(
        `You passed a JSX element to createRoot. You probably meant to call root.render instead. Example usage:

  let root = createRoot(domContainer);
  root.render(<App />);`
      ), t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (i = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (d = t.onRecoverableError)), t = rr(
        e,
        1,
        !1,
        null,
        null,
        n,
        i,
        null,
        o,
        s,
        d,
        Yg
      ), e[oi] = t.current, Ji(e), new ry(t);
    }, v0.hydrateRoot = function(e, t, n) {
      if (!Ze(e))
        throw Error("Target container is not a DOM element.");
      dy(e), t === void 0 && console.error(
        "Must provide initial children as second argument to hydrateRoot. Example usage: hydrateRoot(domContainer, <App />)"
      );
      var i = !1, o = "", s = Nd, d = Hd, h = ip, v = null;
      return n != null && (n.unstable_strictMode === !0 && (i = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onUncaughtError !== void 0 && (s = n.onUncaughtError), n.onCaughtError !== void 0 && (d = n.onCaughtError), n.onRecoverableError !== void 0 && (h = n.onRecoverableError), n.formState !== void 0 && (v = n.formState)), t = rr(
        e,
        1,
        !0,
        t,
        n ?? null,
        i,
        o,
        v,
        s,
        d,
        h,
        Yg
      ), t.context = Bg(null), n = t.current, i = Vl(n), i = sc(i), o = sl(i), o.callback = null, nu(n, o, i), eu(i, "hydrateRoot()", null), n = i, t.current.lanes = n, gi(t, n), bn(t), e[oi] = t.current, Ji(e), new ja(t);
    }, v0.version = "19.2.1", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })()), v0;
}
var hE;
function pA() {
  if (hE) return Kv.exports;
  hE = 1;
  function b() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) {
      if (process.env.NODE_ENV !== "production")
        throw new Error("^_^");
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(b);
      } catch (m) {
        console.error(m);
      }
    }
  }
  return process.env.NODE_ENV === "production" ? (b(), Kv.exports = hA()) : Kv.exports = mA(), Kv.exports;
}
var yA = pA();
const gA = /* @__PURE__ */ cA(yA), ic = /* @__PURE__ */ Object.create(null);
ic.open = "0";
ic.close = "1";
ic.ping = "2";
ic.pong = "3";
ic.message = "4";
ic.upgrade = "5";
ic.noop = "6";
const Fv = /* @__PURE__ */ Object.create(null);
Object.keys(ic).forEach((b) => {
  Fv[ic[b]] = b;
});
const qb = { type: "error", data: "parser error" }, TE = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", AE = typeof ArrayBuffer == "function", zE = (b) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(b) : b && b.buffer instanceof ArrayBuffer, Lb = ({ type: b, data: m }, y, g) => TE && m instanceof Blob ? y ? g(m) : mE(m, g) : AE && (m instanceof ArrayBuffer || zE(m)) ? y ? g(m) : mE(new Blob([m]), g) : g(ic[b] + (m || "")), mE = (b, m) => {
  const y = new FileReader();
  return y.onload = function() {
    const g = y.result.split(",")[1];
    m("b" + (g || ""));
  }, y.readAsDataURL(b);
};
function pE(b) {
  return b instanceof Uint8Array ? b : b instanceof ArrayBuffer ? new Uint8Array(b) : new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
}
let Nb;
function vA(b, m) {
  if (TE && b.data instanceof Blob)
    return b.data.arrayBuffer().then(pE).then(m);
  if (AE && (b.data instanceof ArrayBuffer || zE(b.data)))
    return m(pE(b.data));
  Lb(b, !1, (y) => {
    Nb || (Nb = new TextEncoder()), m(Nb.encode(y));
  });
}
const yE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", S0 = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let b = 0; b < yE.length; b++)
  S0[yE.charCodeAt(b)] = b;
const bA = (b) => {
  let m = b.length * 0.75, y = b.length, g, x = 0, G, ee, X, re;
  b[b.length - 1] === "=" && (m--, b[b.length - 2] === "=" && m--);
  const Re = new ArrayBuffer(m), ke = new Uint8Array(Re);
  for (g = 0; g < y; g += 4)
    G = S0[b.charCodeAt(g)], ee = S0[b.charCodeAt(g + 1)], X = S0[b.charCodeAt(g + 2)], re = S0[b.charCodeAt(g + 3)], ke[x++] = G << 2 | ee >> 4, ke[x++] = (ee & 15) << 4 | X >> 2, ke[x++] = (X & 3) << 6 | re & 63;
  return Re;
}, SA = typeof ArrayBuffer == "function", Vb = (b, m) => {
  if (typeof b != "string")
    return {
      type: "message",
      data: OE(b, m)
    };
  const y = b.charAt(0);
  return y === "b" ? {
    type: "message",
    data: EA(b.substring(1), m)
  } : Fv[y] ? b.length > 1 ? {
    type: Fv[y],
    data: b.substring(1)
  } : {
    type: Fv[y]
  } : qb;
}, EA = (b, m) => {
  if (SA) {
    const y = bA(b);
    return OE(y, m);
  } else
    return { base64: !0, data: b };
}, OE = (b, m) => {
  switch (m) {
    case "blob":
      return b instanceof Blob ? b : new Blob([b]);
    case "arraybuffer":
    default:
      return b instanceof ArrayBuffer ? b : b.buffer;
  }
}, DE = "", TA = (b, m) => {
  const y = b.length, g = new Array(y);
  let x = 0;
  b.forEach((G, ee) => {
    Lb(G, !1, (X) => {
      g[ee] = X, ++x === y && m(g.join(DE));
    });
  });
}, AA = (b, m) => {
  const y = b.split(DE), g = [];
  for (let x = 0; x < y.length; x++) {
    const G = Vb(y[x], m);
    if (g.push(G), G.type === "error")
      break;
  }
  return g;
};
function zA() {
  return new TransformStream({
    transform(b, m) {
      vA(b, (y) => {
        const g = y.length;
        let x;
        if (g < 126)
          x = new Uint8Array(1), new DataView(x.buffer).setUint8(0, g);
        else if (g < 65536) {
          x = new Uint8Array(3);
          const G = new DataView(x.buffer);
          G.setUint8(0, 126), G.setUint16(1, g);
        } else {
          x = new Uint8Array(9);
          const G = new DataView(x.buffer);
          G.setUint8(0, 127), G.setBigUint64(1, BigInt(g));
        }
        b.data && typeof b.data != "string" && (x[0] |= 128), m.enqueue(x), m.enqueue(y);
      });
    }
  });
}
let Hb;
function kv(b) {
  return b.reduce((m, y) => m + y.length, 0);
}
function Wv(b, m) {
  if (b[0].length === m)
    return b.shift();
  const y = new Uint8Array(m);
  let g = 0;
  for (let x = 0; x < m; x++)
    y[x] = b[0][g++], g === b[0].length && (b.shift(), g = 0);
  return b.length && g < b[0].length && (b[0] = b[0].slice(g)), y;
}
function OA(b, m) {
  Hb || (Hb = new TextDecoder());
  const y = [];
  let g = 0, x = -1, G = !1;
  return new TransformStream({
    transform(ee, X) {
      for (y.push(ee); ; ) {
        if (g === 0) {
          if (kv(y) < 1)
            break;
          const re = Wv(y, 1);
          G = (re[0] & 128) === 128, x = re[0] & 127, x < 126 ? g = 3 : x === 126 ? g = 1 : g = 2;
        } else if (g === 1) {
          if (kv(y) < 2)
            break;
          const re = Wv(y, 2);
          x = new DataView(re.buffer, re.byteOffset, re.length).getUint16(0), g = 3;
        } else if (g === 2) {
          if (kv(y) < 8)
            break;
          const re = Wv(y, 8), Re = new DataView(re.buffer, re.byteOffset, re.length), ke = Re.getUint32(0);
          if (ke > Math.pow(2, 21) - 1) {
            X.enqueue(qb);
            break;
          }
          x = ke * Math.pow(2, 32) + Re.getUint32(4), g = 3;
        } else {
          if (kv(y) < x)
            break;
          const re = Wv(y, x);
          X.enqueue(Vb(G ? re : Hb.decode(re), m)), g = 0;
        }
        if (x === 0 || x > b) {
          X.enqueue(qb);
          break;
        }
      }
    }
  });
}
const _E = 4;
function xl(b) {
  if (b) return DA(b);
}
function DA(b) {
  for (var m in xl.prototype)
    b[m] = xl.prototype[m];
  return b;
}
xl.prototype.on = xl.prototype.addEventListener = function(b, m) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + b] = this._callbacks["$" + b] || []).push(m), this;
};
xl.prototype.once = function(b, m) {
  function y() {
    this.off(b, y), m.apply(this, arguments);
  }
  return y.fn = m, this.on(b, y), this;
};
xl.prototype.off = xl.prototype.removeListener = xl.prototype.removeAllListeners = xl.prototype.removeEventListener = function(b, m) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this;
  var y = this._callbacks["$" + b];
  if (!y) return this;
  if (arguments.length == 1)
    return delete this._callbacks["$" + b], this;
  for (var g, x = 0; x < y.length; x++)
    if (g = y[x], g === m || g.fn === m) {
      y.splice(x, 1);
      break;
    }
  return y.length === 0 && delete this._callbacks["$" + b], this;
};
xl.prototype.emit = function(b) {
  this._callbacks = this._callbacks || {};
  for (var m = new Array(arguments.length - 1), y = this._callbacks["$" + b], g = 1; g < arguments.length; g++)
    m[g - 1] = arguments[g];
  if (y) {
    y = y.slice(0);
    for (var g = 0, x = y.length; g < x; ++g)
      y[g].apply(this, m);
  }
  return this;
};
xl.prototype.emitReserved = xl.prototype.emit;
xl.prototype.listeners = function(b) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + b] || [];
};
xl.prototype.hasListeners = function(b) {
  return !!this.listeners(b).length;
};
const l1 = typeof Promise == "function" && typeof Promise.resolve == "function" ? (m) => Promise.resolve().then(m) : (m, y) => y(m, 0), ju = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), _A = "arraybuffer";
function RE(b, ...m) {
  return m.reduce((y, g) => (b.hasOwnProperty(g) && (y[g] = b[g]), y), {});
}
const RA = ju.setTimeout, MA = ju.clearTimeout;
function n1(b, m) {
  m.useNativeTimers ? (b.setTimeoutFn = RA.bind(ju), b.clearTimeoutFn = MA.bind(ju)) : (b.setTimeoutFn = ju.setTimeout.bind(ju), b.clearTimeoutFn = ju.clearTimeout.bind(ju));
}
const CA = 1.33;
function UA(b) {
  return typeof b == "string" ? xA(b) : Math.ceil((b.byteLength || b.size) * CA);
}
function xA(b) {
  let m = 0, y = 0;
  for (let g = 0, x = b.length; g < x; g++)
    m = b.charCodeAt(g), m < 128 ? y += 1 : m < 2048 ? y += 2 : m < 55296 || m >= 57344 ? y += 3 : (g++, y += 4);
  return y;
}
function ME() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function NA(b) {
  let m = "";
  for (let y in b)
    b.hasOwnProperty(y) && (m.length && (m += "&"), m += encodeURIComponent(y) + "=" + encodeURIComponent(b[y]));
  return m;
}
function HA(b) {
  let m = {}, y = b.split("&");
  for (let g = 0, x = y.length; g < x; g++) {
    let G = y[g].split("=");
    m[decodeURIComponent(G[0])] = decodeURIComponent(G[1]);
  }
  return m;
}
class BA extends Error {
  constructor(m, y, g) {
    super(m), this.description = y, this.context = g, this.type = "TransportError";
  }
}
class Qb extends xl {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(m) {
    super(), this.writable = !1, n1(this, m), this.opts = m, this.query = m.query, this.socket = m.socket, this.supportsBinary = !m.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(m, y, g) {
    return super.emitReserved("error", new BA(m, y, g)), this;
  }
  /**
   * Opens the transport.
   */
  open() {
    return this.readyState = "opening", this.doOpen(), this;
  }
  /**
   * Closes the transport.
   */
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(m) {
    this.readyState === "open" && this.write(m);
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(m) {
    const y = Vb(m, this.socket.binaryType);
    this.onPacket(y);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(m) {
    super.emitReserved("packet", m);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(m) {
    this.readyState = "closed", super.emitReserved("close", m);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(m) {
  }
  createUri(m, y = {}) {
    return m + "://" + this._hostname() + this._port() + this.opts.path + this._query(y);
  }
  _hostname() {
    const m = this.opts.hostname;
    return m.indexOf(":") === -1 ? m : "[" + m + "]";
  }
  _port() {
    return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(m) {
    const y = NA(m);
    return y.length ? "?" + y : "";
  }
}
class qA extends Qb {
  constructor() {
    super(...arguments), this._polling = !1;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(m) {
    this.readyState = "pausing";
    const y = () => {
      this.readyState = "paused", m();
    };
    if (this._polling || !this.writable) {
      let g = 0;
      this._polling && (g++, this.once("pollComplete", function() {
        --g || y();
      })), this.writable || (g++, this.once("drain", function() {
        --g || y();
      }));
    } else
      y();
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = !0, this.doPoll(), this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(m) {
    const y = (g) => {
      if (this.readyState === "opening" && g.type === "open" && this.onOpen(), g.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(g);
    };
    AA(m, this.socket.binaryType).forEach(y), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const m = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? m() : this.once("open", m);
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(m) {
    this.writable = !1, TA(m, (y) => {
      this.doWrite(y, () => {
        this.writable = !0, this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const m = this.opts.secure ? "https" : "http", y = this.query || {};
    return this.opts.timestampRequests !== !1 && (y[this.opts.timestampParam] = ME()), !this.supportsBinary && !y.sid && (y.b64 = 1), this.createUri(m, y);
  }
}
let CE = !1;
try {
  CE = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const jA = CE;
function wA() {
}
class YA extends qA {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(m) {
    if (super(m), typeof location < "u") {
      const y = location.protocol === "https:";
      let g = location.port;
      g || (g = y ? "443" : "80"), this.xd = typeof location < "u" && m.hostname !== location.hostname || g !== m.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(m, y) {
    const g = this.request({
      method: "POST",
      data: m
    });
    g.on("success", y), g.on("error", (x, G) => {
      this.onError("xhr post error", x, G);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const m = this.request();
    m.on("data", this.onData.bind(this)), m.on("error", (y, g) => {
      this.onError("xhr poll error", y, g);
    }), this.pollXhr = m;
  }
}
class uc extends xl {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(m, y, g) {
    super(), this.createRequest = m, n1(this, g), this._opts = g, this._method = g.method || "GET", this._uri = y, this._data = g.data !== void 0 ? g.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var m;
    const y = RE(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    y.xdomain = !!this._opts.xd;
    const g = this._xhr = this.createRequest(y);
    try {
      g.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          g.setDisableHeaderCheck && g.setDisableHeaderCheck(!0);
          for (let x in this._opts.extraHeaders)
            this._opts.extraHeaders.hasOwnProperty(x) && g.setRequestHeader(x, this._opts.extraHeaders[x]);
        }
      } catch {
      }
      if (this._method === "POST")
        try {
          g.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch {
        }
      try {
        g.setRequestHeader("Accept", "*/*");
      } catch {
      }
      (m = this._opts.cookieJar) === null || m === void 0 || m.addCookies(g), "withCredentials" in g && (g.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (g.timeout = this._opts.requestTimeout), g.onreadystatechange = () => {
        var x;
        g.readyState === 3 && ((x = this._opts.cookieJar) === null || x === void 0 || x.parseCookies(
          // @ts-ignore
          g.getResponseHeader("set-cookie")
        )), g.readyState === 4 && (g.status === 200 || g.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof g.status == "number" ? g.status : 0);
        }, 0));
      }, g.send(this._data);
    } catch (x) {
      this.setTimeoutFn(() => {
        this._onError(x);
      }, 0);
      return;
    }
    typeof document < "u" && (this._index = uc.requestsCount++, uc.requests[this._index] = this);
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(m) {
    this.emitReserved("error", m, this._xhr), this._cleanup(!0);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(m) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = wA, m)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete uc.requests[this._index], this._xhr = null;
    }
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const m = this._xhr.responseText;
    m !== null && (this.emitReserved("data", m), this.emitReserved("success"), this._cleanup());
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
}
uc.requestsCount = 0;
uc.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", gE);
  else if (typeof addEventListener == "function") {
    const b = "onpagehide" in ju ? "pagehide" : "unload";
    addEventListener(b, gE, !1);
  }
}
function gE() {
  for (let b in uc.requests)
    uc.requests.hasOwnProperty(b) && uc.requests[b].abort();
}
const GA = (function() {
  const b = UE({
    xdomain: !1
  });
  return b && b.responseType !== null;
})();
class XA extends YA {
  constructor(m) {
    super(m);
    const y = m && m.forceBase64;
    this.supportsBinary = GA && !y;
  }
  request(m = {}) {
    return Object.assign(m, { xd: this.xd }, this.opts), new uc(UE, this.uri(), m);
  }
}
function UE(b) {
  const m = b.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!m || jA))
      return new XMLHttpRequest();
  } catch {
  }
  if (!m)
    try {
      return new ju[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const xE = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class LA extends Qb {
  get name() {
    return "websocket";
  }
  doOpen() {
    const m = this.uri(), y = this.opts.protocols, g = xE ? {} : RE(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (g.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(m, y, g);
    } catch (x) {
      return this.emitReserved("error", x);
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
    }, this.ws.onclose = (m) => this.onClose({
      description: "websocket connection closed",
      context: m
    }), this.ws.onmessage = (m) => this.onData(m.data), this.ws.onerror = (m) => this.onError("websocket error", m);
  }
  write(m) {
    this.writable = !1;
    for (let y = 0; y < m.length; y++) {
      const g = m[y], x = y === m.length - 1;
      Lb(g, this.supportsBinary, (G) => {
        try {
          this.doWrite(g, G);
        } catch {
        }
        x && l1(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {
    }, this.ws.close(), this.ws = null);
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const m = this.opts.secure ? "wss" : "ws", y = this.query || {};
    return this.opts.timestampRequests && (y[this.opts.timestampParam] = ME()), this.supportsBinary || (y.b64 = 1), this.createUri(m, y);
  }
}
const Bb = ju.WebSocket || ju.MozWebSocket;
class VA extends LA {
  createSocket(m, y, g) {
    return xE ? new Bb(m, y, g) : y ? new Bb(m, y) : new Bb(m);
  }
  doWrite(m, y) {
    this.ws.send(y);
  }
}
class QA extends Qb {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (m) {
      return this.emitReserved("error", m);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((m) => {
      this.onError("webtransport error", m);
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((m) => {
        const y = OA(Number.MAX_SAFE_INTEGER, this.socket.binaryType), g = m.readable.pipeThrough(y).getReader(), x = zA();
        x.readable.pipeTo(m.writable), this._writer = x.writable.getWriter();
        const G = () => {
          g.read().then(({ done: X, value: re }) => {
            X || (this.onPacket(re), G());
          }).catch((X) => {
          });
        };
        G();
        const ee = { type: "open" };
        this.query.sid && (ee.data = `{"sid":"${this.query.sid}"}`), this._writer.write(ee).then(() => this.onOpen());
      });
    });
  }
  write(m) {
    this.writable = !1;
    for (let y = 0; y < m.length; y++) {
      const g = m[y], x = y === m.length - 1;
      this._writer.write(g).then(() => {
        x && l1(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var m;
    (m = this._transport) === null || m === void 0 || m.close();
  }
}
const ZA = {
  websocket: VA,
  webtransport: QA,
  polling: XA
}, JA = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, KA = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function jb(b) {
  if (b.length > 8e3)
    throw "URI too long";
  const m = b, y = b.indexOf("["), g = b.indexOf("]");
  y != -1 && g != -1 && (b = b.substring(0, y) + b.substring(y, g).replace(/:/g, ";") + b.substring(g, b.length));
  let x = JA.exec(b || ""), G = {}, ee = 14;
  for (; ee--; )
    G[KA[ee]] = x[ee] || "";
  return y != -1 && g != -1 && (G.source = m, G.host = G.host.substring(1, G.host.length - 1).replace(/;/g, ":"), G.authority = G.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), G.ipv6uri = !0), G.pathNames = $A(G, G.path), G.queryKey = kA(G, G.query), G;
}
function $A(b, m) {
  const y = /\/{2,9}/g, g = m.replace(y, "/").split("/");
  return (m.slice(0, 1) == "/" || m.length === 0) && g.splice(0, 1), m.slice(-1) == "/" && g.splice(g.length - 1, 1), g;
}
function kA(b, m) {
  const y = {};
  return m.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(g, x, G) {
    x && (y[x] = G);
  }), y;
}
const wb = typeof addEventListener == "function" && typeof removeEventListener == "function", Iv = [];
wb && addEventListener("offline", () => {
  Iv.forEach((b) => b());
}, !1);
class Ps extends xl {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(m, y) {
    if (super(), this.binaryType = _A, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, m && typeof m == "object" && (y = m, m = null), m) {
      const g = jb(m);
      y.hostname = g.host, y.secure = g.protocol === "https" || g.protocol === "wss", y.port = g.port, g.query && (y.query = g.query);
    } else y.host && (y.hostname = jb(y.host).host);
    n1(this, y), this.secure = y.secure != null ? y.secure : typeof location < "u" && location.protocol === "https:", y.hostname && !y.port && (y.port = this.secure ? "443" : "80"), this.hostname = y.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = y.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, y.transports.forEach((g) => {
      const x = g.prototype.name;
      this.transports.push(x), this._transportsByName[x] = g;
    }), this.opts = Object.assign({
      path: "/engine.io",
      agent: !1,
      withCredentials: !1,
      upgrade: !0,
      timestampParam: "t",
      rememberUpgrade: !1,
      addTrailingSlash: !0,
      rejectUnauthorized: !0,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: !1
    }, y), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = HA(this.opts.query)), wb && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Iv.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(m) {
    const y = Object.assign({}, this.opts.query);
    y.EIO = _E, y.transport = m, this.id && (y.sid = this.id);
    const g = Object.assign({}, this.opts, {
      query: y,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[m]);
    return new this._transportsByName[m](g);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const m = this.opts.rememberUpgrade && Ps.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const y = this.createTransport(m);
    y.open(), this.setTransport(y);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(m) {
    this.transport && this.transport.removeAllListeners(), this.transport = m, m.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (y) => this._onClose("transport close", y));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open", Ps.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(m) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
      switch (this.emitReserved("packet", m), this.emitReserved("heartbeat"), m.type) {
        case "open":
          this.onHandshake(JSON.parse(m.data));
          break;
        case "ping":
          this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
          break;
        case "error":
          const y = new Error("server error");
          y.code = m.data, this._onError(y);
          break;
        case "message":
          this.emitReserved("data", m.data), this.emitReserved("message", m.data);
          break;
      }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(m) {
    this.emitReserved("handshake", m), this.id = m.sid, this.transport.query.sid = m.sid, this._pingInterval = m.pingInterval, this._pingTimeout = m.pingTimeout, this._maxPayload = m.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const m = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + m, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, m), this.opts.autoUnref && this._pingTimeoutTimer.unref();
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const m = this._getWritablePackets();
      this.transport.send(m), this._prevBufferLen = m.length, this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1))
      return this.writeBuffer;
    let y = 1;
    for (let g = 0; g < this.writeBuffer.length; g++) {
      const x = this.writeBuffer[g].data;
      if (x && (y += UA(x)), g > 0 && y > this._maxPayload)
        return this.writeBuffer.slice(0, g);
      y += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return !0;
    const m = Date.now() > this._pingTimeoutTime;
    return m && (this._pingTimeoutTime = 0, l1(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), m;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(m, y, g) {
    return this._sendPacket("message", m, y, g), this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(m, y, g) {
    return this._sendPacket("message", m, y, g), this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(m, y, g, x) {
    if (typeof y == "function" && (x = y, y = void 0), typeof g == "function" && (x = g, g = null), this.readyState === "closing" || this.readyState === "closed")
      return;
    g = g || {}, g.compress = g.compress !== !1;
    const G = {
      type: m,
      data: y,
      options: g
    };
    this.emitReserved("packetCreate", G), this.writeBuffer.push(G), x && this.once("flush", x), this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const m = () => {
      this._onClose("forced close"), this.transport.close();
    }, y = () => {
      this.off("upgrade", y), this.off("upgradeError", y), m();
    }, g = () => {
      this.once("upgrade", y), this.once("upgradeError", y);
    };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? g() : m();
    }) : this.upgrading ? g() : m()), this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(m) {
    if (Ps.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
      return this.transports.shift(), this._open();
    this.emitReserved("error", m), this._onClose("transport error", m);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(m, y) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), wb && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const g = Iv.indexOf(this._offlineEventListener);
        g !== -1 && Iv.splice(g, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", m, y), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Ps.protocol = _E;
class WA extends Ps {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
      for (let m = 0; m < this._upgrades.length; m++)
        this._probe(this._upgrades[m]);
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(m) {
    let y = this.createTransport(m), g = !1;
    Ps.priorWebsocketSuccess = !1;
    const x = () => {
      g || (y.send([{ type: "ping", data: "probe" }]), y.once("packet", (ae) => {
        if (!g)
          if (ae.type === "pong" && ae.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", y), !y)
              return;
            Ps.priorWebsocketSuccess = y.name === "websocket", this.transport.pause(() => {
              g || this.readyState !== "closed" && (ke(), this.setTransport(y), y.send([{ type: "upgrade" }]), this.emitReserved("upgrade", y), y = null, this.upgrading = !1, this.flush());
            });
          } else {
            const Te = new Error("probe error");
            Te.transport = y.name, this.emitReserved("upgradeError", Te);
          }
      }));
    };
    function G() {
      g || (g = !0, ke(), y.close(), y = null);
    }
    const ee = (ae) => {
      const Te = new Error("probe error: " + ae);
      Te.transport = y.name, G(), this.emitReserved("upgradeError", Te);
    };
    function X() {
      ee("transport closed");
    }
    function re() {
      ee("socket closed");
    }
    function Re(ae) {
      y && ae.name !== y.name && G();
    }
    const ke = () => {
      y.removeListener("open", x), y.removeListener("error", ee), y.removeListener("close", X), this.off("close", re), this.off("upgrading", Re);
    };
    y.once("open", x), y.once("error", ee), y.once("close", X), this.once("close", re), this.once("upgrading", Re), this._upgrades.indexOf("webtransport") !== -1 && m !== "webtransport" ? this.setTimeoutFn(() => {
      g || y.open();
    }, 200) : y.open();
  }
  onHandshake(m) {
    this._upgrades = this._filterUpgrades(m.upgrades), super.onHandshake(m);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(m) {
    const y = [];
    for (let g = 0; g < m.length; g++)
      ~this.transports.indexOf(m[g]) && y.push(m[g]);
    return y;
  }
}
let FA = class extends WA {
  constructor(m, y = {}) {
    const g = typeof m == "object" ? m : y;
    (!g.transports || g.transports && typeof g.transports[0] == "string") && (g.transports = (g.transports || ["polling", "websocket", "webtransport"]).map((x) => ZA[x]).filter((x) => !!x)), super(m, g);
  }
};
function IA(b, m = "", y) {
  let g = b;
  y = y || typeof location < "u" && location, b == null && (b = y.protocol + "//" + y.host), typeof b == "string" && (b.charAt(0) === "/" && (b.charAt(1) === "/" ? b = y.protocol + b : b = y.host + b), /^(https?|wss?):\/\//.test(b) || (typeof y < "u" ? b = y.protocol + "//" + b : b = "https://" + b), g = jb(b)), g.port || (/^(http|ws)$/.test(g.protocol) ? g.port = "80" : /^(http|ws)s$/.test(g.protocol) && (g.port = "443")), g.path = g.path || "/";
  const G = g.host.indexOf(":") !== -1 ? "[" + g.host + "]" : g.host;
  return g.id = g.protocol + "://" + G + ":" + g.port + m, g.href = g.protocol + "://" + G + (y && y.port === g.port ? "" : ":" + g.port), g;
}
const PA = typeof ArrayBuffer == "function", e3 = (b) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(b) : b.buffer instanceof ArrayBuffer, NE = Object.prototype.toString, t3 = typeof Blob == "function" || typeof Blob < "u" && NE.call(Blob) === "[object BlobConstructor]", l3 = typeof File == "function" || typeof File < "u" && NE.call(File) === "[object FileConstructor]";
function Zb(b) {
  return PA && (b instanceof ArrayBuffer || e3(b)) || t3 && b instanceof Blob || l3 && b instanceof File;
}
function Pv(b, m) {
  if (!b || typeof b != "object")
    return !1;
  if (Array.isArray(b)) {
    for (let y = 0, g = b.length; y < g; y++)
      if (Pv(b[y]))
        return !0;
    return !1;
  }
  if (Zb(b))
    return !0;
  if (b.toJSON && typeof b.toJSON == "function" && arguments.length === 1)
    return Pv(b.toJSON(), !0);
  for (const y in b)
    if (Object.prototype.hasOwnProperty.call(b, y) && Pv(b[y]))
      return !0;
  return !1;
}
function n3(b) {
  const m = [], y = b.data, g = b;
  return g.data = Yb(y, m), g.attachments = m.length, { packet: g, buffers: m };
}
function Yb(b, m) {
  if (!b)
    return b;
  if (Zb(b)) {
    const y = { _placeholder: !0, num: m.length };
    return m.push(b), y;
  } else if (Array.isArray(b)) {
    const y = new Array(b.length);
    for (let g = 0; g < b.length; g++)
      y[g] = Yb(b[g], m);
    return y;
  } else if (typeof b == "object" && !(b instanceof Date)) {
    const y = {};
    for (const g in b)
      Object.prototype.hasOwnProperty.call(b, g) && (y[g] = Yb(b[g], m));
    return y;
  }
  return b;
}
function a3(b, m) {
  return b.data = Gb(b.data, m), delete b.attachments, b;
}
function Gb(b, m) {
  if (!b)
    return b;
  if (b && b._placeholder === !0) {
    if (typeof b.num == "number" && b.num >= 0 && b.num < m.length)
      return m[b.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(b))
    for (let y = 0; y < b.length; y++)
      b[y] = Gb(b[y], m);
  else if (typeof b == "object")
    for (const y in b)
      Object.prototype.hasOwnProperty.call(b, y) && (b[y] = Gb(b[y], m));
  return b;
}
const u3 = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], i3 = 5;
var Pe;
(function(b) {
  b[b.CONNECT = 0] = "CONNECT", b[b.DISCONNECT = 1] = "DISCONNECT", b[b.EVENT = 2] = "EVENT", b[b.ACK = 3] = "ACK", b[b.CONNECT_ERROR = 4] = "CONNECT_ERROR", b[b.BINARY_EVENT = 5] = "BINARY_EVENT", b[b.BINARY_ACK = 6] = "BINARY_ACK";
})(Pe || (Pe = {}));
class c3 {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(m) {
    this.replacer = m;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(m) {
    return (m.type === Pe.EVENT || m.type === Pe.ACK) && Pv(m) ? this.encodeAsBinary({
      type: m.type === Pe.EVENT ? Pe.BINARY_EVENT : Pe.BINARY_ACK,
      nsp: m.nsp,
      data: m.data,
      id: m.id
    }) : [this.encodeAsString(m)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(m) {
    let y = "" + m.type;
    return (m.type === Pe.BINARY_EVENT || m.type === Pe.BINARY_ACK) && (y += m.attachments + "-"), m.nsp && m.nsp !== "/" && (y += m.nsp + ","), m.id != null && (y += m.id), m.data != null && (y += JSON.stringify(m.data, this.replacer)), y;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(m) {
    const y = n3(m), g = this.encodeAsString(y.packet), x = y.buffers;
    return x.unshift(g), x;
  }
}
function vE(b) {
  return Object.prototype.toString.call(b) === "[object Object]";
}
class Jb extends xl {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(m) {
    super(), this.reviver = m;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(m) {
    let y;
    if (typeof m == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      y = this.decodeString(m);
      const g = y.type === Pe.BINARY_EVENT;
      g || y.type === Pe.BINARY_ACK ? (y.type = g ? Pe.EVENT : Pe.ACK, this.reconstructor = new o3(y), y.attachments === 0 && super.emitReserved("decoded", y)) : super.emitReserved("decoded", y);
    } else if (Zb(m) || m.base64)
      if (this.reconstructor)
        y = this.reconstructor.takeBinaryData(m), y && (this.reconstructor = null, super.emitReserved("decoded", y));
      else
        throw new Error("got binary data when not reconstructing a packet");
    else
      throw new Error("Unknown type: " + m);
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(m) {
    let y = 0;
    const g = {
      type: Number(m.charAt(0))
    };
    if (Pe[g.type] === void 0)
      throw new Error("unknown packet type " + g.type);
    if (g.type === Pe.BINARY_EVENT || g.type === Pe.BINARY_ACK) {
      const G = y + 1;
      for (; m.charAt(++y) !== "-" && y != m.length; )
        ;
      const ee = m.substring(G, y);
      if (ee != Number(ee) || m.charAt(y) !== "-")
        throw new Error("Illegal attachments");
      g.attachments = Number(ee);
    }
    if (m.charAt(y + 1) === "/") {
      const G = y + 1;
      for (; ++y && !(m.charAt(y) === "," || y === m.length); )
        ;
      g.nsp = m.substring(G, y);
    } else
      g.nsp = "/";
    const x = m.charAt(y + 1);
    if (x !== "" && Number(x) == x) {
      const G = y + 1;
      for (; ++y; ) {
        const ee = m.charAt(y);
        if (ee == null || Number(ee) != ee) {
          --y;
          break;
        }
        if (y === m.length)
          break;
      }
      g.id = Number(m.substring(G, y + 1));
    }
    if (m.charAt(++y)) {
      const G = this.tryParse(m.substr(y));
      if (Jb.isPayloadValid(g.type, G))
        g.data = G;
      else
        throw new Error("invalid payload");
    }
    return g;
  }
  tryParse(m) {
    try {
      return JSON.parse(m, this.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(m, y) {
    switch (m) {
      case Pe.CONNECT:
        return vE(y);
      case Pe.DISCONNECT:
        return y === void 0;
      case Pe.CONNECT_ERROR:
        return typeof y == "string" || vE(y);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(y) && (typeof y[0] == "number" || typeof y[0] == "string" && u3.indexOf(y[0]) === -1);
      case Pe.ACK:
      case Pe.BINARY_ACK:
        return Array.isArray(y);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null);
  }
}
class o3 {
  constructor(m) {
    this.packet = m, this.buffers = [], this.reconPack = m;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(m) {
    if (this.buffers.push(m), this.buffers.length === this.reconPack.attachments) {
      const y = a3(this.reconPack, this.buffers);
      return this.finishedReconstruction(), y;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null, this.buffers = [];
  }
}
const s3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Jb,
  Encoder: c3,
  get PacketType() {
    return Pe;
  },
  protocol: i3
}, Symbol.toStringTag, { value: "Module" }));
function pi(b, m, y) {
  return b.on(m, y), function() {
    b.off(m, y);
  };
}
const f3 = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class HE extends xl {
  /**
   * `Socket` constructor.
   */
  constructor(m, y, g) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = m, this.nsp = y, g && g.auth && (this.auth = g.auth), this._opts = Object.assign({}, g), this.io._autoConnect && this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const m = this.io;
    this.subs = [
      pi(m, "open", this.onopen.bind(this)),
      pi(m, "packet", this.onpacket.bind(this)),
      pi(m, "error", this.onerror.bind(this)),
      pi(m, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...m) {
    return m.unshift("message"), this.emit.apply(this, m), this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(m, ...y) {
    var g, x, G;
    if (f3.hasOwnProperty(m))
      throw new Error('"' + m.toString() + '" is a reserved event name');
    if (y.unshift(m), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(y), this;
    const ee = {
      type: Pe.EVENT,
      data: y
    };
    if (ee.options = {}, ee.options.compress = this.flags.compress !== !1, typeof y[y.length - 1] == "function") {
      const ke = this.ids++, ae = y.pop();
      this._registerAckCallback(ke, ae), ee.id = ke;
    }
    const X = (x = (g = this.io.engine) === null || g === void 0 ? void 0 : g.transport) === null || x === void 0 ? void 0 : x.writable, re = this.connected && !(!((G = this.io.engine) === null || G === void 0) && G._hasPingExpired());
    return this.flags.volatile && !X || (re ? (this.notifyOutgoingListeners(ee), this.packet(ee)) : this.sendBuffer.push(ee)), this.flags = {}, this;
  }
  /**
   * @private
   */
  _registerAckCallback(m, y) {
    var g;
    const x = (g = this.flags.timeout) !== null && g !== void 0 ? g : this._opts.ackTimeout;
    if (x === void 0) {
      this.acks[m] = y;
      return;
    }
    const G = this.io.setTimeoutFn(() => {
      delete this.acks[m];
      for (let X = 0; X < this.sendBuffer.length; X++)
        this.sendBuffer[X].id === m && this.sendBuffer.splice(X, 1);
      y.call(this, new Error("operation has timed out"));
    }, x), ee = (...X) => {
      this.io.clearTimeoutFn(G), y.apply(this, X);
    };
    ee.withError = !0, this.acks[m] = ee;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(m, ...y) {
    return new Promise((g, x) => {
      const G = (ee, X) => ee ? x(ee) : g(X);
      G.withError = !0, y.push(G), this.emit(m, ...y);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(m) {
    let y;
    typeof m[m.length - 1] == "function" && (y = m.pop());
    const g = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: m,
      flags: Object.assign({ fromQueue: !0 }, this.flags)
    };
    m.push((x, ...G) => g !== this._queue[0] ? void 0 : (x !== null ? g.tryCount > this._opts.retries && (this._queue.shift(), y && y(x)) : (this._queue.shift(), y && y(null, ...G)), g.pending = !1, this._drainQueue())), this._queue.push(g), this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(m = !1) {
    if (!this.connected || this._queue.length === 0)
      return;
    const y = this._queue[0];
    y.pending && !m || (y.pending = !0, y.tryCount++, this.flags = y.flags, this.emit.apply(this, y.args));
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(m) {
    m.nsp = this.nsp, this.io._packet(m);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    typeof this.auth == "function" ? this.auth((m) => {
      this._sendConnectPacket(m);
    }) : this._sendConnectPacket(this.auth);
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(m) {
    this.packet({
      type: Pe.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, m) : m
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(m) {
    this.connected || this.emitReserved("connect_error", m);
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(m, y) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", m, y), this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((m) => {
      if (!this.sendBuffer.some((g) => String(g.id) === m)) {
        const g = this.acks[m];
        delete this.acks[m], g.withError && g.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(m) {
    if (m.nsp === this.nsp)
      switch (m.type) {
        case Pe.CONNECT:
          m.data && m.data.sid ? this.onconnect(m.data.sid, m.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Pe.EVENT:
        case Pe.BINARY_EVENT:
          this.onevent(m);
          break;
        case Pe.ACK:
        case Pe.BINARY_ACK:
          this.onack(m);
          break;
        case Pe.DISCONNECT:
          this.ondisconnect();
          break;
        case Pe.CONNECT_ERROR:
          this.destroy();
          const g = new Error(m.data.message);
          g.data = m.data.data, this.emitReserved("connect_error", g);
          break;
      }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(m) {
    const y = m.data || [];
    m.id != null && y.push(this.ack(m.id)), this.connected ? this.emitEvent(y) : this.receiveBuffer.push(Object.freeze(y));
  }
  emitEvent(m) {
    if (this._anyListeners && this._anyListeners.length) {
      const y = this._anyListeners.slice();
      for (const g of y)
        g.apply(this, m);
    }
    super.emit.apply(this, m), this._pid && m.length && typeof m[m.length - 1] == "string" && (this._lastOffset = m[m.length - 1]);
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(m) {
    const y = this;
    let g = !1;
    return function(...x) {
      g || (g = !0, y.packet({
        type: Pe.ACK,
        id: m,
        data: x
      }));
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(m) {
    const y = this.acks[m.id];
    typeof y == "function" && (delete this.acks[m.id], y.withError && m.data.unshift(null), y.apply(this, m.data));
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(m, y) {
    this.id = m, this.recovered = y && this._pid === y, this._pid = y, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((m) => this.emitEvent(m)), this.receiveBuffer = [], this.sendBuffer.forEach((m) => {
      this.notifyOutgoingListeners(m), this.packet(m);
    }), this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy(), this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    this.subs && (this.subs.forEach((m) => m()), this.subs = void 0), this.io._destroy(this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    return this.connected && this.packet({ type: Pe.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(m) {
    return this.flags.compress = m, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    return this.flags.volatile = !0, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(m) {
    return this.flags.timeout = m, this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(m) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(m), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(m) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(m), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(m) {
    if (!this._anyListeners)
      return this;
    if (m) {
      const y = this._anyListeners;
      for (let g = 0; g < y.length; g++)
        if (m === y[g])
          return y.splice(g, 1), this;
    } else
      this._anyListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(m) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(m), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(m) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(m), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(m) {
    if (!this._anyOutgoingListeners)
      return this;
    if (m) {
      const y = this._anyOutgoingListeners;
      for (let g = 0; g < y.length; g++)
        if (m === y[g])
          return y.splice(g, 1), this;
    } else
      this._anyOutgoingListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(m) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const y = this._anyOutgoingListeners.slice();
      for (const g of y)
        g.apply(this, m.data);
    }
  }
}
function mm(b) {
  b = b || {}, this.ms = b.min || 100, this.max = b.max || 1e4, this.factor = b.factor || 2, this.jitter = b.jitter > 0 && b.jitter <= 1 ? b.jitter : 0, this.attempts = 0;
}
mm.prototype.duration = function() {
  var b = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var m = Math.random(), y = Math.floor(m * this.jitter * b);
    b = (Math.floor(m * 10) & 1) == 0 ? b - y : b + y;
  }
  return Math.min(b, this.max) | 0;
};
mm.prototype.reset = function() {
  this.attempts = 0;
};
mm.prototype.setMin = function(b) {
  this.ms = b;
};
mm.prototype.setMax = function(b) {
  this.max = b;
};
mm.prototype.setJitter = function(b) {
  this.jitter = b;
};
class Xb extends xl {
  constructor(m, y) {
    var g;
    super(), this.nsps = {}, this.subs = [], m && typeof m == "object" && (y = m, m = void 0), y = y || {}, y.path = y.path || "/socket.io", this.opts = y, n1(this, y), this.reconnection(y.reconnection !== !1), this.reconnectionAttempts(y.reconnectionAttempts || 1 / 0), this.reconnectionDelay(y.reconnectionDelay || 1e3), this.reconnectionDelayMax(y.reconnectionDelayMax || 5e3), this.randomizationFactor((g = y.randomizationFactor) !== null && g !== void 0 ? g : 0.5), this.backoff = new mm({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(y.timeout == null ? 2e4 : y.timeout), this._readyState = "closed", this.uri = m;
    const x = y.parser || s3;
    this.encoder = new x.Encoder(), this.decoder = new x.Decoder(), this._autoConnect = y.autoConnect !== !1, this._autoConnect && this.open();
  }
  reconnection(m) {
    return arguments.length ? (this._reconnection = !!m, m || (this.skipReconnect = !0), this) : this._reconnection;
  }
  reconnectionAttempts(m) {
    return m === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = m, this);
  }
  reconnectionDelay(m) {
    var y;
    return m === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = m, (y = this.backoff) === null || y === void 0 || y.setMin(m), this);
  }
  randomizationFactor(m) {
    var y;
    return m === void 0 ? this._randomizationFactor : (this._randomizationFactor = m, (y = this.backoff) === null || y === void 0 || y.setJitter(m), this);
  }
  reconnectionDelayMax(m) {
    var y;
    return m === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = m, (y = this.backoff) === null || y === void 0 || y.setMax(m), this);
  }
  timeout(m) {
    return arguments.length ? (this._timeout = m, this) : this._timeout;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(m) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new FA(this.uri, this.opts);
    const y = this.engine, g = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const x = pi(y, "open", function() {
      g.onopen(), m && m();
    }), G = (X) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", X), m ? m(X) : this.maybeReconnectOnOpen();
    }, ee = pi(y, "error", G);
    if (this._timeout !== !1) {
      const X = this._timeout, re = this.setTimeoutFn(() => {
        x(), G(new Error("timeout")), y.close();
      }, X);
      this.opts.autoUnref && re.unref(), this.subs.push(() => {
        this.clearTimeoutFn(re);
      });
    }
    return this.subs.push(x), this.subs.push(ee), this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(m) {
    return this.open(m);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const m = this.engine;
    this.subs.push(
      pi(m, "ping", this.onping.bind(this)),
      pi(m, "data", this.ondata.bind(this)),
      pi(m, "error", this.onerror.bind(this)),
      pi(m, "close", this.onclose.bind(this)),
      // @ts-ignore
      pi(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(m) {
    try {
      this.decoder.add(m);
    } catch (y) {
      this.onclose("parse error", y);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(m) {
    l1(() => {
      this.emitReserved("packet", m);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(m) {
    this.emitReserved("error", m);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(m, y) {
    let g = this.nsps[m];
    return g ? this._autoConnect && !g.active && g.connect() : (g = new HE(this, m, y), this.nsps[m] = g), g;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(m) {
    const y = Object.keys(this.nsps);
    for (const g of y)
      if (this.nsps[g].active)
        return;
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(m) {
    const y = this.encoder.encode(m);
    for (let g = 0; g < y.length; g++)
      this.engine.write(y[g], m.options);
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((m) => m()), this.subs.length = 0, this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(m, y) {
    var g;
    this.cleanup(), (g = this.engine) === null || g === void 0 || g.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", m, y), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const m = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const y = this.backoff.duration();
      this._reconnecting = !0;
      const g = this.setTimeoutFn(() => {
        m.skipReconnect || (this.emitReserved("reconnect_attempt", m.backoff.attempts), !m.skipReconnect && m.open((x) => {
          x ? (m._reconnecting = !1, m.reconnect(), this.emitReserved("reconnect_error", x)) : m.onreconnect();
        }));
      }, y);
      this.opts.autoUnref && g.unref(), this.subs.push(() => {
        this.clearTimeoutFn(g);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const m = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", m);
  }
}
const b0 = {};
function e1(b, m) {
  typeof b == "object" && (m = b, b = void 0), m = m || {};
  const y = IA(b, m.path || "/socket.io"), g = y.source, x = y.id, G = y.path, ee = b0[x] && G in b0[x].nsps, X = m.forceNew || m["force new connection"] || m.multiplex === !1 || ee;
  let re;
  return X ? re = new Xb(g, m) : (b0[x] || (b0[x] = new Xb(g, m)), re = b0[x]), y.query && !m.query && (m.query = y.queryKey), re.socket(y.path, m);
}
Object.assign(e1, {
  Manager: Xb,
  Socket: HE,
  io: e1,
  connect: e1
});
const r3 = window.location.hostname.includes("robinswood.io") || window.location.hostname.includes("localhost"), Kb = r3 && document.getElementById("cockpit-headup-root") !== null;
console.log("[Cockpit Config] isInjected:", Kb);
console.log("[Cockpit Config] hostname:", window.location.hostname);
const BE = Kb ? `${window.location.protocol}//${window.location.host}` : "http://localhost:3100", qE = Kb ? "/api/chatbot/socket.io" : "/socket.io";
console.log("[Cockpit Config] PILOTE_WS_URL:", BE);
console.log("[Cockpit Config] PILOTE_SOCKET_PATH:", qE);
function d3() {
  const [b, m] = yi(null), [y, g] = yi(!1), [x, G] = yi(!1), [ee, X] = yi(null);
  So(() => {
    const Re = e1(BE, {
      path: qE,
      transports: ["websocket", "polling"]
    });
    return Re.on("connect", () => {
      console.log("✅ Connected to Pilote"), g(!0);
    }), Re.on("disconnect", () => {
      console.log("❌ Disconnected from Pilote"), g(!1);
    }), Re.on("agent:progress", (ke) => {
      X(ke);
    }), Re.on("agent:result", (ke) => {
      G(!1), X(null);
    }), Re.on("agent:error", (ke) => {
      console.error("Agent error:", ke), G(!1), X(null);
    }), m(Re), () => {
      Re.close();
    };
  }, []);
  const re = uA((Re, ke) => new Promise((ae, Te) => {
    if (!b || !y) {
      Te(new Error("Not connected to Pilote"));
      return;
    }
    G(!0), X(null);
    const it = (Ze) => {
      G(!1), b.off("agent:result", it), b.off("agent:error", lt), ae(Ze.result);
    }, lt = (Ze) => {
      G(!1), b.off("agent:result", it), b.off("agent:error", lt), Te(new Error(Ze.error));
    };
    b.once("agent:result", it), b.once("agent:error", lt);
    const Ct = typeof window < "u" && window.localStorage && window.localStorage.getItem("cockpit-user-id") || "default-user";
    b.emit("agent:execute", {
      query: Re,
      project: ke,
      userId: Ct,
      options: {
        autoCommit: !0,
        runTests: !1
      }
    });
  }), [b, y]);
  return {
    connected: y,
    executing: x,
    progress: ee,
    execute: re
  };
}
function h3({ project: b }) {
  const [m, y] = yi([]), [g, x] = yi(""), [G, ee] = yi(!1);
  So(() => (G ? document.body.style.overflowX = "hidden" : document.body.style.overflowX = "", () => {
    document.body.style.overflowX = "";
  }), [G]);
  const [X, re] = yi("agent"), [Re, ke] = yi(null), [ae, Te] = yi(!1), it = aE(null), lt = aE(null), { connected: Ct, executing: Ze, progress: Je, execute: mn } = d3();
  So(() => {
    it.current?.scrollIntoView({ behavior: "smooth" });
  }, [m]), So(() => {
    G && lt.current && lt.current.focus();
  }, [G]), So(() => {
    if (Je) {
      const I = {
        id: `system-${Date.now()}`,
        type: "system",
        content: Je.message,
        timestamp: /* @__PURE__ */ new Date(),
        metadata: {
          tool: Je.tool,
          phase: Je.step
        }
      };
      y((me) => [...me.filter((ie) => ie.type !== "system"), I]);
    }
  }, [Je]), So(() => {
    const I = document.createElement("script");
    return I.src = "/cockpit-headup/element-selector.js", I.async = !0, document.body.appendChild(I), () => {
      document.body.removeChild(I);
    };
  }, []), So(() => {
    const I = (me) => {
      me.altKey && me.key === "Tab" && (me.preventDefault(), wt());
    };
    return window.addEventListener("keydown", I), () => window.removeEventListener("keydown", I);
  }, [X]);
  const wt = () => {
    const I = ["agent", "ask", "plan", "comment"], Dt = (I.indexOf(X) + 1) % I.length;
    re(I[Dt]);
  }, ol = () => {
    ae || (Te(!0), window.elementSelector?.activate((I) => {
      ke({
        selector: I.selector,
        tag: I.tag,
        className: I.className,
        textContent: I.textContent,
        outerHTML: I.outerHTML
      }), Te(!1);
      const me = I.textContent ? `${I.tag} contenant "${I.textContent.substring(0, 30)}..."` : `${I.tag}`;
      x(`Analyse l'élément ${I.selector} (${me})`);
      const Dt = {
        id: `system-${Date.now()}`,
        type: "system",
        content: `🎯 Élément sélectionné: ${I.selector} (${I.tag})

Décrivez ce que vous souhaitez faire avec cet élément, ou modifiez la suggestion ci-dessous.`,
        timestamp: /* @__PURE__ */ new Date()
      };
      y((ie) => [...ie, Dt]);
    }));
  }, Gl = async () => {
    if (!g.trim() || Ze) return;
    let I = g;
    Re && (I = `[ELEMENT_CONTEXT: ${Re.selector} - ${Re.tag}]
${g}`);
    const Dt = (X !== "agent" ? `[MODE: ${X.toUpperCase()}]
` : "") + I, ie = {
      id: `user-${Date.now()}`,
      type: "user",
      content: g,
      timestamp: /* @__PURE__ */ new Date()
    };
    y((bt) => [...bt, ie]), x(""), Re && ke(null);
    try {
      const bt = await mn(Dt, b), Ue = {
        id: `agent-${Date.now()}`,
        type: "agent",
        content: bt.message || "Tâche terminée",
        timestamp: /* @__PURE__ */ new Date()
      };
      y((Me) => [...Me.filter((Vt) => Vt.type !== "system"), Ue]);
    } catch (bt) {
      const Ue = {
        id: `error-${Date.now()}`,
        type: "error",
        content: bt.message || "Erreur",
        timestamp: /* @__PURE__ */ new Date()
      };
      y((Me) => [...Me.filter((Vt) => Vt.type !== "system"), Ue]);
    }
  }, nl = (I) => ({
    agent: { icon: "🤖", label: "Agent", color: "#667eea", description: "Exécution complète" },
    ask: { icon: "❓", label: "Ask", color: "#48bb78", description: "Questions uniquement" },
    plan: { icon: "📋", label: "Plan", color: "#ed8936", description: "Planification" },
    comment: { icon: "💬", label: "Comment", color: "#9f7aea", description: "Feedback" }
  })[I];
  return /* @__PURE__ */ k.jsxs("div", { className: `modern-chat ${G ? "expanded" : "collapsed"}`, children: [
    !G && /* @__PURE__ */ k.jsx(
      "button",
      {
        className: "modern-chat-fab",
        onClick: () => ee(!0),
        title: "Ouvrir Cockpit Agent",
        children: /* @__PURE__ */ k.jsxs("div", { className: "fab-content", children: [
          /* @__PURE__ */ k.jsx("span", { className: "fab-icon", children: "🤖" }),
          /* @__PURE__ */ k.jsx("span", { className: "fab-badge", children: Ct ? "●" : "○" })
        ] })
      }
    ),
    G && /* @__PURE__ */ k.jsxs("div", { className: `modern-chat-window ${ae ? "selecting" : ""}`, "data-mode": X, children: [
      /* @__PURE__ */ k.jsxs("div", { className: "chat-header", children: [
        /* @__PURE__ */ k.jsxs("div", { className: "header-left", children: [
          /* @__PURE__ */ k.jsx("div", { className: "header-icon", children: "🚀" }),
          /* @__PURE__ */ k.jsxs("div", { className: "header-info", children: [
            /* @__PURE__ */ k.jsx("div", { className: "header-title", children: "Cockpit Agent" }),
            /* @__PURE__ */ k.jsxs("div", { className: `header-status ${Ct ? "online" : "offline"}`, children: [
              /* @__PURE__ */ k.jsx("span", { className: "status-dot" }),
              Ct ? "En ligne" : "Hors ligne"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ k.jsxs("div", { className: "header-right", children: [
          /* @__PURE__ */ k.jsx("div", { className: "mode-switcher", title: "Alt+Tab pour changer", children: ["agent", "ask", "plan", "comment"].map((I) => {
            const me = nl(I);
            return /* @__PURE__ */ k.jsxs(
              "button",
              {
                className: `mode-btn ${X === I ? "active" : ""}`,
                onClick: () => re(I),
                style: {
                  borderColor: X === I ? me.color : "transparent",
                  color: X === I ? me.color : "#999"
                },
                title: `${me.label} - ${me.description}`,
                children: [
                  /* @__PURE__ */ k.jsx("span", { className: "mode-icon", children: me.icon }),
                  /* @__PURE__ */ k.jsx("span", { className: "mode-label", children: me.label })
                ]
              },
              I
            );
          }) }),
          /* @__PURE__ */ k.jsx(
            "button",
            {
              className: `header-action-btn ${ae ? "active" : ""}`,
              onClick: ol,
              disabled: ae,
              title: "Sélectionner un élément",
              children: "🎯"
            }
          ),
          /* @__PURE__ */ k.jsx("div", { className: "header-project", children: b }),
          /* @__PURE__ */ k.jsx(
            "button",
            {
              className: "header-close",
              onClick: () => ee(!1),
              title: "Réduire",
              children: "✕"
            }
          )
        ] })
      ] }),
      Re && /* @__PURE__ */ k.jsxs("div", { className: "selected-element-badge", children: [
        /* @__PURE__ */ k.jsx("span", { className: "badge-icon", children: "🎯" }),
        /* @__PURE__ */ k.jsx("span", { className: "badge-text", children: Re.selector }),
        /* @__PURE__ */ k.jsx(
          "button",
          {
            className: "badge-clear",
            onClick: () => ke(null),
            title: "Effacer la sélection",
            children: "✕"
          }
        )
      ] }),
      /* @__PURE__ */ k.jsxs("div", { className: "chat-messages-area", children: [
        m.length === 0 && /* @__PURE__ */ k.jsxs("div", { className: "chat-welcome", children: [
          /* @__PURE__ */ k.jsx("div", { className: "welcome-icon", children: "🚀" }),
          /* @__PURE__ */ k.jsx("h2", { children: "Cockpit Agent v3.4" }),
          /* @__PURE__ */ k.jsx("p", { className: "welcome-subtitle", children: "Advanced Intelligence • Exécution & Automation" }),
          /* @__PURE__ */ k.jsxs("div", { className: "welcome-features", children: [
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "🔍" }),
              /* @__PURE__ */ k.jsx("span", { children: "Proactive Suggestions" })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "🎓" }),
              /* @__PURE__ */ k.jsx("span", { children: "Learning Engine" })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "🔀" }),
              /* @__PURE__ */ k.jsx("span", { children: "Multi-Model (Opus/Sonnet/Haiku)" })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "🧠" }),
              /* @__PURE__ */ k.jsx("span", { children: "Memory & Context" })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "🔒" }),
              /* @__PURE__ */ k.jsx("span", { children: "Sandbox Execution" })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "🧪" }),
              /* @__PURE__ */ k.jsx("span", { children: "Auto Testing" })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "🔀" }),
              /* @__PURE__ */ k.jsx("span", { children: "Git Workflow" })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "feature-item", children: [
              /* @__PURE__ */ k.jsx("span", { className: "feature-icon", children: "💰" }),
              /* @__PURE__ */ k.jsx("span", { children: "Cost Optimization (40-70%)" })
            ] })
          ] }),
          /* @__PURE__ */ k.jsxs("div", { className: "welcome-examples", children: [
            /* @__PURE__ */ k.jsx("p", { className: "examples-title", children: "Essayez :" }),
            /* @__PURE__ */ k.jsx("button", { className: "example-btn", onClick: () => x("Analyse mon projet pour des problèmes"), children: '🔍 "Analyse mon projet pour des problèmes"' }),
            /* @__PURE__ */ k.jsx("button", { className: "example-btn", onClick: () => x("Teste l'application avec Browser MCP"), children: `🌐 "Teste l'application avec Browser MCP"` }),
            /* @__PURE__ */ k.jsx("button", { className: "example-btn", onClick: () => x("Génère des tests pour ce fichier"), children: '🧪 "Génère des tests pour ce fichier"' }),
            /* @__PURE__ */ k.jsx("button", { className: "example-btn", onClick: () => x("Create une PR pour cette feature"), children: '🔀 "Create une PR pour cette feature"' })
          ] })
        ] }),
        m.map((I) => /* @__PURE__ */ k.jsxs("div", { className: `chat-message ${I.type}`, children: [
          /* @__PURE__ */ k.jsxs("div", { className: "message-avatar", children: [
            I.type === "user" && "👤",
            I.type === "agent" && "🤖",
            I.type === "system" && "⚙️",
            I.type === "error" && "⚠️"
          ] }),
          /* @__PURE__ */ k.jsxs("div", { className: "message-bubble", children: [
            I.metadata?.phase && /* @__PURE__ */ k.jsxs("div", { className: "message-meta", children: [
              I.metadata.phase,
              " ",
              I.metadata.tool && `• ${I.metadata.tool}`
            ] }),
            /* @__PURE__ */ k.jsx("div", { className: "message-text", children: I.content }),
            /* @__PURE__ */ k.jsx("div", { className: "message-time", children: I.timestamp.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit"
            }) })
          ] })
        ] }, I.id)),
        /* @__PURE__ */ k.jsx("div", { ref: it })
      ] }),
      /* @__PURE__ */ k.jsxs("div", { className: "chat-input-area", children: [
        Ze && /* @__PURE__ */ k.jsxs("div", { className: "input-progress", children: [
          /* @__PURE__ */ k.jsx("div", { className: "progress-spinner" }),
          /* @__PURE__ */ k.jsx("span", { children: "L'agent travaille..." })
        ] }),
        /* @__PURE__ */ k.jsxs("div", { className: "input-container", children: [
          /* @__PURE__ */ k.jsx(
            "textarea",
            {
              ref: lt,
              value: g,
              onChange: (I) => x(I.target.value),
              onKeyDown: (I) => {
                I.key === "Enter" && !I.shiftKey && (I.preventDefault(), Gl());
              },
              placeholder: Ze ? "Veuillez patienter..." : "Décrivez votre tâche...",
              disabled: !Ct || Ze,
              rows: 1
            }
          ),
          /* @__PURE__ */ k.jsx(
            "button",
            {
              className: "send-button",
              onClick: Gl,
              disabled: !Ct || Ze || !g.trim(),
              title: "Envoyer (Entrée)",
              children: /* @__PURE__ */ k.jsx("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor", children: /* @__PURE__ */ k.jsx("path", { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" }) })
            }
          )
        ] }),
        /* @__PURE__ */ k.jsx("div", { className: "input-footer", children: /* @__PURE__ */ k.jsxs("span", { className: "footer-hint", children: [
          /* @__PURE__ */ k.jsx("kbd", { children: "Entrée" }),
          " pour envoyer • ",
          /* @__PURE__ */ k.jsx("kbd", { children: "Shift+Entrée" }),
          " pour nouvelle ligne"
        ] }) })
      ] }),
      /* @__PURE__ */ k.jsxs("div", { className: "mode-indicator-footer", children: [
        /* @__PURE__ */ k.jsxs("span", { className: "mode-indicator", "data-mode": X, children: [
          nl(X).icon,
          " ",
          nl(X).label
        ] }),
        /* @__PURE__ */ k.jsx("span", { children: "•" }),
        /* @__PURE__ */ k.jsx("kbd", { children: "Alt+Tab" }),
        " pour changer de mode"
      ] })
    ] })
  ] });
}
function m3({ project: b, isInjected: m }) {
  return b ? /* @__PURE__ */ k.jsx(h3, { project: b }) : m ? /* @__PURE__ */ k.jsxs("div", { className: "cockpit-no-project", children: [
    /* @__PURE__ */ k.jsx("p", { children: "⚠️ Impossible de détecter le projet actuel" }),
    /* @__PURE__ */ k.jsx("p", { className: "hint", children: "Assurez-vous d'être sur l'URL d'un projet (ex: jlm-app.robinswood.io)" })
  ] }) : /* @__PURE__ */ k.jsxs("div", { className: "cockpit-no-project", children: [
    /* @__PURE__ */ k.jsx("p", { children: "👆 Sélectionnez un projet pour commencer" }),
    /* @__PURE__ */ k.jsx("p", { className: "hint", children: "Le sélecteur vous redirigera vers l'URL du projet" })
  ] });
}
const p3 = iA(void 0);
function y3({ children: b }) {
  const [m, y] = yi(() => {
    const G = localStorage.getItem("cockpit-theme");
    return G === "light" || G === "dark" ? G : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  So(() => {
    const G = document.querySelector(".cockpit-headup");
    G ? G.setAttribute("data-theme", m) : document.documentElement.setAttribute("data-theme", m), localStorage.setItem("cockpit-theme", m);
  }, [m]), So(() => {
    const G = window.matchMedia("(prefers-color-scheme: dark)"), ee = (X) => {
      localStorage.getItem("cockpit-theme") || y(X.matches ? "dark" : "light");
    };
    return G.addEventListener("change", ee), () => G.removeEventListener("change", ee);
  }, []);
  const g = (G) => {
    y(G);
  }, x = () => {
    y((G) => G === "light" ? "dark" : "light");
  };
  return /* @__PURE__ */ k.jsx(p3.Provider, { value: { theme: m, setTheme: g, toggleTheme: x }, children: b });
}
class bE {
  root = null;
  container = null;
  config;
  constructor(m = {}) {
    this.config = {
      containerId: "cockpit-headup-root",
      autoDetect: !0,
      ...m
    };
  }
  /**
   * Detect project from URL hostname
   */
  detectProject() {
    if (!this.config.autoDetect)
      return this.config.project || null;
    try {
      const y = window.location.hostname.match(/^([^.]+)\./);
      if (y) {
        const g = y[1];
        return {
          paperbridge: "paperbridge",
          cjd80: "cjd80",
          "game-plug": "game-plug",
          saxium: "saxium",
          "jlm-app": "jlm-app",
          work: "work-hub"
        }[g] || g;
      }
    } catch (m) {
      console.warn("[Cockpit HeadsUp] Cannot detect project from URL", m);
    }
    return this.config.project || null;
  }
  /**
   * Initialize and mount the cockpit overlay
   */
  mount() {
    if (this.root) {
      console.warn("[Cockpit HeadsUp] Already mounted");
      return;
    }
    this.container = document.getElementById(this.config.containerId), this.container || (this.container = document.createElement("div"), this.container.id = this.config.containerId, this.container.style.position = "fixed", this.container.style.top = "0", this.container.style.left = "0", this.container.style.width = "100%", this.container.style.height = "100%", this.container.style.pointerEvents = "none", this.container.style.zIndex = "999999", document.body.appendChild(this.container));
    const m = this.detectProject();
    console.log("[Cockpit HeadsUp] Mounting with project:", m), this.root = gA.createRoot(this.container), this.root.render(
      /* @__PURE__ */ k.jsx(t1.StrictMode, { children: /* @__PURE__ */ k.jsx(y3, { children: /* @__PURE__ */ k.jsx(m3, { project: m || "", isInjected: !0 }) }) })
    );
  }
  /**
   * Unmount and cleanup
   */
  unmount() {
    this.root && (this.root.unmount(), this.root = null), this.container && this.container.parentNode && (this.container.parentNode.removeChild(this.container), this.container = null), console.log("[Cockpit HeadsUp] Unmounted");
  }
  /**
   * Update project
   */
  setProject(m) {
    this.config.project = m, this.root && (this.unmount(), this.mount());
  }
  /**
   * Check if mounted
   */
  isMounted() {
    return this.root !== null;
  }
}
if (typeof window < "u" && (window.CockpitHeadsUp = bE, window.CockpitHeadsUpConfig)) {
  const b = new bE(window.CockpitHeadsUpConfig);
  b.mount(), window.cockpitHeadsUpInstance = b;
}
export {
  bE as CockpitHeadsUp,
  bE as default
};
//# sourceMappingURL=cockpit-headup.es.js.map
