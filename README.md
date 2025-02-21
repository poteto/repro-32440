# Repro for https://github.com/facebook/react/issues/32440

This is a new Expo app running `52.0.36` along with the React Compiler. It was reported that a cyclic dependency containing a hook would result in the function being undefined when the compiler is enabled. Disabling the compiler in Expo fixes the issue.

While require cycles already issue a warning, it should not crash the app entirely with a different error as it makes it very difficult to debug why.

Upon inspecting `metroRequire(id of circular dep)`, it seems that Metro's internal map of `modules` returns an empty object for that dependency when the compiler is enabled.

I am not quite sure if this is an Expo-specific or Metro bug.

```js
// COMPILER ENABLED
require(_dependencyMap[0], "components/SomeFile.tsx"); // 877

// breakpoint in metroRequire
const module = modules.get(877);
console.log(module.publicModule.exports); // {__esModule: true}

// COMPILER DISABLED
require(_dependencyMap[0], "./SomeFile"); // 877

// breakpoint in metroRequire
const module = modules.get(877);
console.log(module.publicModule.exports);

/**
 * {
 *   __esModule: true,
 *   SomeComponent: ƒ SomeComponent(),
 *   myContext: undefined,
 *   useMyHook: ƒ useMyHook()
 * }
 **/
```

Another thing to note is that React Compiler leaves `Circular.tsx` untouched ([see playground](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEwBUYCAsgJ4ASEEA1gQL4EBmMEGBAOiAHQB6AMqcEAMTQAbBLwDc3AHaKEADxz42UBXDxoICgqrwIYCgIaSxWnXoUAKAJRFFBAnH1hCAEzN4zBAF4SMipaBkd5AwIYBDxYAx8-SKYQJiA)), but its output changes to be less lazy when the compiler is enabled. This might indicate that the module being called before it has been evaluated.

Since the compiler does not transform this file, it suggests to me that this might be an issue with Expo's special handling of [import statements](https://github.com/expo/expo/blob/d40d6300a615f2fd23605f77f4d5b0ce7599bf3e/packages/%40expo/metro-config/src/transform-worker/metro-transform-worker.ts#L583-L592).

```js
// COMPILER ENABLED
var useMyHook = require(_dependencyMap[0], "./SomeFile").useMyHook;
function externalFunction() {
  _s();
  const data = useMyHook();
  return data;
}

// COMPILER DISABLED
var _SomeFile = require(_dependencyMap[0], "./SomeFile");
var _s = $RefreshSig$();
function externalFunction() {
  _s();
  const data = (0, _SomeFile.useMyHook)();
  return data;
}
```

## Transformed Output

### With compiler enabled

```js
__d(
  function (
    global,
    require,
    _$$_IMPORT_DEFAULT,
    _$$_IMPORT_ALL,
    module,
    exports,
    _dependencyMap
  ) {
    "use strict";

    var _jsxFileName = "/Users/.../code/repro/components/SomeFile.tsx",
      _s = $RefreshSig$();
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    var _c = require(_dependencyMap[0], "react-compiler-runtime").c;
    var _react = require(_dependencyMap[1], "react"),
      createContext = _react.createContext,
      useContext = _react.useContext;
    var externalFunction =
      require(_dependencyMap[2], "./Circular").externalFunction;
    var View = _$$_IMPORT_DEFAULT(
      _dependencyMap[3],
      "react-native-web/dist/exports/View"
    );
    var Text = _$$_IMPORT_DEFAULT(
      _dependencyMap[4],
      "react-native-web/dist/exports/Text"
    );
    var _jsxDEV = require(_dependencyMap[5], "react/jsx-dev-runtime").jsxDEV;
    const myContext = /*#__PURE__*/ createContext(undefined);
    function useMyHook() {
      _s();
      const $ = _c(1);
      if (
        $[0] !==
        "e92afe7f23bd78f68e5dc1b4ee4a0711ceac03f0f16ee0bc31a2bcafa80ff99b"
      ) {
        for (let $i = 0; $i < 1; $i += 1) {
          $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] =
          "e92afe7f23bd78f68e5dc1b4ee4a0711ceac03f0f16ee0bc31a2bcafa80ff99b";
      }
      const context = useContext(myContext);
      return context;
    }
    _s(useMyHook, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
    function SomeComponent() {
      const $ = _c(3);
      if (
        $[0] !==
        "e92afe7f23bd78f68e5dc1b4ee4a0711ceac03f0f16ee0bc31a2bcafa80ff99b"
      ) {
        for (let $i = 0; $i < 3; $i += 1) {
          $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] =
          "e92afe7f23bd78f68e5dc1b4ee4a0711ceac03f0f16ee0bc31a2bcafa80ff99b";
      }
      let t0;
      if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = externalFunction();
        $[1] = t0;
      } else {
        t0 = $[1];
      }
      const _datum = t0;
      let t1;
      if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ _jsxDEV(
          View,
          {
            children: /*#__PURE__*/ _jsxDEV(
              Text,
              {
                children: _datum,
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 19,
                columnNumber: 7,
              },
              this
            ),
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 17,
            columnNumber: 5,
          },
          this
        );
        $[2] = t1;
      } else {
        t1 = $[2];
      }
      return t1;
    }
    _c2 = SomeComponent;
    var _c2;
    $RefreshReg$(_c2, "SomeComponent");
    exports.myContext = myContext;
    exports.useMyHook = useMyHook;
    exports.SomeComponent = SomeComponent;
  },
  877,
  [951, 894, 878, 82, 159, 667],
  "components/SomeFile.tsx"
);
__d(
  function (
    global,
    require,
    _$$_IMPORT_DEFAULT,
    _$$_IMPORT_ALL,
    module,
    exports,
    _dependencyMap
  ) {
    "use strict";

    var _s = $RefreshSig$();
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    var useMyHook = require(_dependencyMap[0], "./SomeFile").useMyHook;
    function externalFunction() {
      _s();
      const data = useMyHook();
      return data;
    }
    _s(externalFunction, "8bX5mKR0A/4poSip9DVzupx6RbE=", false, function () {
      return [useMyHook];
    });
    exports.externalFunction = externalFunction;
  },
  878,
  [877],
  "components/Circular.tsx"
);
```

### With compiler disabled

```js
__d(
  function (
    global,
    require,
    _$$_IMPORT_DEFAULT,
    _$$_IMPORT_ALL,
    module,
    exports,
    _dependencyMap
  ) {
    var _interopRequireDefault = require(_dependencyMap[0], "@babel/runtime/helpers/interopRequireDefault");
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports.SomeComponent = SomeComponent;
    exports.myContext = void 0;
    exports.useMyHook = useMyHook;
    var _react = require(_dependencyMap[1], "react");
    var _Circular = require(_dependencyMap[2], "./Circular");
    var _View = _interopRequireDefault(
      require(_dependencyMap[3], "react-native-web/dist/exports/View")
    );
    var _Text = _interopRequireDefault(
      require(_dependencyMap[4], "react-native-web/dist/exports/Text")
    );
    var _jsxDevRuntime = require(_dependencyMap[5], "react/jsx-dev-runtime");
    var _jsxFileName = "/Users/.../code/repro/components/SomeFile.tsx",
      _s = $RefreshSig$();
    const myContext = (exports.myContext = /*#__PURE__*/ (0,
    _react.createContext)(undefined));
    function useMyHook() {
      _s();
      const context = (0, _react.useContext)(myContext);
      return context;
    }
    _s(useMyHook, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
    function SomeComponent() {
      const _datum = (0, _Circular.externalFunction)();
      return /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)(
        _View.default,
        {
          children: /*#__PURE__*/ (0, _jsxDevRuntime.jsxDEV)(
            _Text.default,
            {
              children: _datum,
            },
            void 0,
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 19,
              columnNumber: 7,
            },
            this
          ),
        },
        void 0,
        false,
        {
          fileName: _jsxFileName,
          lineNumber: 17,
          columnNumber: 5,
        },
        this
      );
    }
    _c = SomeComponent;
    var _c;
    $RefreshReg$(_c, "SomeComponent");
  },
  877,
  [894, 895, 878, 82, 159, 667],
  "components/SomeFile.tsx"
);
__d(
  function (
    global,
    require,
    _$$_IMPORT_DEFAULT,
    _$$_IMPORT_ALL,
    module,
    exports,
    _dependencyMap
  ) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports.externalFunction = externalFunction;
    var _SomeFile = require(_dependencyMap[0], "./SomeFile");
    var _s = $RefreshSig$();
    function externalFunction() {
      _s();
      const data = (0, _SomeFile.useMyHook)();
      return data;
    }
    _s(externalFunction, "8bX5mKR0A/4poSip9DVzupx6RbE=", false, function () {
      return [_SomeFile.useMyHook];
    });
  },
  878,
  [877],
  "components/Circular.tsx"
);
```
