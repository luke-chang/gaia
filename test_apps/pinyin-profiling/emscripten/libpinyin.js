// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
  module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 131072;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 4194304;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 21376;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var ___progname;
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv119__pointer_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTIy;
var __ZTIx;
var __ZTIt;
var __ZTIs;
var __ZTIm;
var __ZTIl;
var __ZTIj;
var __ZTIi;
var __ZTIh;
var __ZTIf;
var __ZTIe;
var __ZTId;
var __ZTIc;
var __ZTIa;
var __ZN10ime_pinyin11DictBuilderC1Ev;
var __ZN10ime_pinyin11DictBuilderD1Ev;
var __ZN10ime_pinyin8DictTrieC1Ev;
var __ZN10ime_pinyin8DictTrieD1Ev;
var __ZN10ime_pinyin12MatrixSearchC1Ev;
var __ZN10ime_pinyin12MatrixSearchD1Ev;
var __ZN10ime_pinyin5NGramC1Ev;
var __ZN10ime_pinyin5NGramD1Ev;
var __ZN10ime_pinyin12SpellingTrieC1Ev;
var __ZN10ime_pinyin12SpellingTrieD1Ev;
var __ZN10ime_pinyin4SyncC1Ev;
var __ZN10ime_pinyin4SyncD1Ev;
var __ZN10ime_pinyin8DictListC1Ev;
var __ZN10ime_pinyin8DictListD1Ev;
var __ZN10ime_pinyin8LpiCacheC1Ev;
var __ZN10ime_pinyin8LpiCacheD1Ev;
var __ZN10ime_pinyin13SpellingTableC1Ev;
var __ZN10ime_pinyin13SpellingTableD1Ev;
var __ZN10ime_pinyin14SpellingParserC1Ev;
var __ZN10ime_pinyin8UserDictC1Ev;
var __ZN10ime_pinyin8UserDictD1Ev;
var __ZN10ime_pinyin11Utf16ReaderC1Ev;
var __ZN10ime_pinyin11Utf16ReaderD1Ev;
var __ZNSt9type_infoD1Ev;
var __ZNSt8bad_castC1Ev;
var __ZNSt8bad_castD1Ev;
var __ZNSt10bad_typeidC1Ev;
var __ZNSt10bad_typeidD1Ev;
var __ZN10__cxxabiv116__shim_type_infoD1Ev;
var __ZN10__cxxabiv123__fundamental_type_infoD1Ev;
var __ZN10__cxxabiv123__fundamental_type_infoD2Ev;
var __ZN10__cxxabiv117__array_type_infoD1Ev;
var __ZN10__cxxabiv117__array_type_infoD2Ev;
var __ZN10__cxxabiv120__function_type_infoD1Ev;
var __ZN10__cxxabiv120__function_type_infoD2Ev;
var __ZN10__cxxabiv116__enum_type_infoD1Ev;
var __ZN10__cxxabiv116__enum_type_infoD2Ev;
var __ZN10__cxxabiv117__class_type_infoD1Ev;
var __ZN10__cxxabiv117__class_type_infoD2Ev;
var __ZN10__cxxabiv120__si_class_type_infoD1Ev;
var __ZN10__cxxabiv120__si_class_type_infoD2Ev;
var __ZN10__cxxabiv121__vmi_class_type_infoD1Ev;
var __ZN10__cxxabiv121__vmi_class_type_infoD2Ev;
var __ZN10__cxxabiv117__pbase_type_infoD1Ev;
var __ZN10__cxxabiv117__pbase_type_infoD2Ev;
var __ZN10__cxxabiv119__pointer_type_infoD1Ev;
var __ZN10__cxxabiv119__pointer_type_infoD2Ev;
var __ZN10__cxxabiv129__pointer_to_member_type_infoD1Ev;
var __ZN10__cxxabiv129__pointer_to_member_type_infoD2Ev;
var __ZNSt9bad_allocC1Ev;
var __ZNSt9bad_allocD1Ev;
var __ZNSt20bad_array_new_lengthC1Ev;
var __ZNSt20bad_array_new_lengthD1Ev;
var __ZNSt20bad_array_new_lengthD2Ev;
var _err;
var _errx;
var _warn;
var _warnx;
var _verr;
var _verrx;
var _vwarn;
var _vwarnx;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,248,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv119__pointer_type_infoE=allocate([0,0,0,0,24,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,56,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIy=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIx=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIt=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIs=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIm=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIl=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIj=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIi=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIh=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIf=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIe=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTId=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIc=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIa=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([45,44,32,0,0,0,0,0,45,44,32,0,0,0,0,0,45,44,32,0,0,0,0,0,45,44,32,0,0,0,0,0,45,44,32,0,0,0,0,0,91,114,111,111,116,32,105,115,32,108,97,121,101,114,32,45,49,93,0,0,0,0,0,0,10,45,45,45,45,45,45,45,45,45,45,45,45,83,84,65,84,32,73,78,70,79,45,45,45,45,45,45,45,45,45,45,45,45,45,0,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,115,0,0,0,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,99,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,120,79,0,0,0,0,0,0,63,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,111,112,116,105,111,110,32,100,111,101,115,110,39,116,32,116,97,107,101,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,46,42,115,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,115,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,99,0,0,0,0,255,255,255,255,0,0,0,0,97,109,98,105,103,117,111,117,115,32,111,112,116,105,111,110,32,45,45,32,37,46,42,115,0,0,0,0,0,0,0,0,32,77,105,108,101,83,116,111,110,101,58,32,37,120,44,32,37,120,10,0,0,0,0,0,78,85,76,76,32,33,61,32,100,101,112,32,38,38,32,102,114,111,109,95,104,97,110,100,108,101,32,62,32,48,32,38,38,32,102,114,111,109,95,104,97,110,100,108,101,32,60,32,109,105,108,101,95,115,116,111,110,101,115,95,112,111,115,95,0,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,102,111,117,110,100,95,110,117,109,32,43,32,49,32,60,32,109,97,120,95,115,112,108,105,100,115,0,0,0,0,0,0,83,104,0,0,0,0,0,0,108,109,97,95,102,114,101,113,95,105,100,120,95,0,0,0,100,108,95,115,117,99,99,101,115,115,0,0,0,0,0,0,45,45,45,37,100,10,0,0,115,111,110,45,62,115,112,108,95,105,100,120,32,62,61,32,105,100,95,115,116,97,114,116,32,38,38,32,115,111,110,45,62,115,112,108,95,105,100,120,32,60,32,105,100,95,115,116,97,114,116,32,43,32,105,100,95,110,117,109,0,0,0,0,78,85,76,76,32,33,61,32,104,122,95,102,111,117,110,100,32,38,38,32,104,97,110,122,105,32,61,61,32,42,104,122,95,102,111,117,110,100,0,0,67,104,0,0,0,0,0,0,102,114,101,113,95,99,111,100,101,115,95,0,0,0,0,0,48,32,33,61,32,110,117,109,0,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,37,100,39,116,104,32,68,77,73,32,110,111,100,101,32,98,101,103,105,110,45,45,45,45,45,45,45,45,45,45,45,62,10,0,0,0,0,0,0,49,32,61,61,32,110,111,100,101,45,62,115,111,110,95,49,115,116,95,111,102,102,0,0,104,122,115,95,108,101,110,32,60,61,32,107,77,97,120,80,114,101,100,105,99,116,83,105,122,101,32,38,38,32,104,122,115,95,108,101,110,32,62,32,48,0,0,0,0,0,0,0,37,115,0,0,0,0,0,0,102,114,101,113,95,99,111,100,101,115,95,100,102,95,0,0,49,32,61,61,32,115,112,108,95,105,100,120,95,110,117,109,0,0,0,0,0,0,0,0,115,112,108,95,105,100,95,102,114,32,60,61,32,107,77,97,120,76,101,109,109,97,83,105,122,101,0,0,0,0,0,0,78,85,76,76,32,33,61,32,100,101,112,32,38,38,32,48,32,61,61,32,102,114,111,109,95,104,97,110,100,108,101,0,105,100,95,110,117,109,32,61,61,32,115,116,97,114,116,95,105,100,95,91,107,77,97,120,76,101,109,109,97,83,105,122,101,93,0,0,0,0,0,0,115,111,110,95,112,111,115,32,43,32,49,32,61,61,32,110,117,109,95,111,102,95,115,111,110,0,0,0,0,0,0,0,102,114,101,113,115,91,112,111,115,93,32,62,32,48,0,0,117,116,102,49,54,95,115,116,114,108,101,110,40,116,111,107,101,110,41,32,60,61,32,107,77,97,120,80,105,110,121,105,110,83,105,122,101,0,0,0,116,109,112,32,61,61,32,108,109,97,95,108,101,110,0,0,48,32,61,61,32,100,101,112,45,62,115,112,108,105,100,115,95,101,120,116,101,110,100,101,100,0,0,0,0,0,0,0,46,46,47,115,104,97,114,101,47,109,97,116,114,105,120,115,101,97,114,99,104,46,99,112,112,0,0,0,0,0,0,0,80,79,83,73,88,76,89,95,67,79,82,82,69,67,84,0,99,117,114,114,101,110,116,95,112,111,115,32,61,61,32,115,116,97,114,116,95,112,111,115,95,91,107,77,97,120,76,101,109,109,97,83,105,122,101,93,0,0,0,0,0,0,0,0,105,115,95,118,97,108,105,100,95,115,112,108,95,99,104,97,114,40,99,104,97,114,95,99,117,114,114,101,110,116,41,0,105,100,120,95,110,111,119,32,43,32,49,32,61,61,32,110,101,120,116,95,105,100,120,95,117,110,117,115,101,100,0,0,78,85,76,76,32,33,61,32,116,111,107,101,110,0,0,0,99,95,112,104,114,97,115,101,95,46,108,101,110,103,116,104,32,62,32,48,32,38,38,32,99,95,112,121,95,108,101,110,32,61,61,32,99,95,112,104,114,97,115,101,95,46,115,112,108,95,115,116,97,114,116,91,99,95,112,104,114,97,115,101,95,46,115,117,98,108,109,97,95,115,116,97,114,116,91,99,95,112,104,114,97,115,101,95,46,115,117,98,108,109,97,95,110,117,109,93,93,0,0,0,114,98,0,0,0,0,0,0,115,99,105,115,95,110,117,109,95,32,61,61,32,115,99,105,115,95,110,117,109,0,0,0,40,99,104,97,114,95,102,111,114,95,110,111,100,101,32,62,61,32,39,65,39,41,32,38,38,32,40,99,104,97,114,95,102,111,114,95,110,111,100,101,32,60,61,32,39,90,39,32,124,124,32,39,104,39,32,61,61,32,99,104,97,114,95,102,111,114,95,110,111,100,101,41,0,0,0,0,0,0,0,0,108,101,109,109,97,95,97,114,114,91,112,111,115,93,46,105,100,120,95,98,121,95,104,122,32,61,61,32,105,100,120,95,110,111,119,0,0,0,0,0,109,111,118,101,95,112,111,115,32,62,32,48,0,0,0,0,98,95,97,99,95,116,109,112,0,0,0,0,0,0,0,0,119,98,0,0,0,0,0,0,46,46,32,116,111,116,97,108,32,108,101,109,109,97,32,110,111,100,101,32,110,117,109,98,101,114,58,32,37,108,100,10,0,0,0,0,0,0,0,0,115,116,97,116,105,99,95,99,97,115,116,60,115,105,122,101,95,116,62,40,115,112,108,105,100,32,45,32,107,70,117,108,108,83,112,108,73,100,83,116,97,114,116,41,32,60,32,98,117,102,95,115,105,122,101,0,109,97,120,32,115,121,115,116,101,109,32,98,121,116,101,115,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,46,46,32,115,111,110,32,98,117,102,32,97,108,108,111,99,97,116,105,111,110,32,110,117,109,98,101,114,32,119,105,116,104,32,109,111,114,101,32,116,104,97,110,32,49,32,115,111,110,58,32,37,108,100,10,0,102,97,108,115,101,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,78,85,76,76,32,33,61,32,105,110,115,116,97,110,99,101,95,0,0,0,0,0,0,0,99,117,114,114,101,110,116,95,104,122,95,108,101,110,32,62,61,32,108,97,115,116,95,104,122,95,108,101,110,0,0,0,46,46,32,115,111,110,32,98,117,102,32,97,108,108,111,99,97,116,105,111,110,32,110,117,109,98,101,114,32,119,105,116,104,32,111,110,108,121,32,49,32,115,111,110,58,32,37,108,100,10,0,0,0,0,0,0,121,109,95,105,100,32,62,32,48,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,105,116,101,109,95,110,117,109,91,99,111,100,101,93,32,62,32,48,0,0,0,0,0,0,46,46,32,116,111,116,97,108,95,104,111,109,111,95,110,117,109,32,112,101,114,32,108,97,121,101,114,58,10,32,32,32,48,44,32,0,0,0,0,0,46,46,32,116,111,116,97,108,95,110,111,100,101,95,105,110,95,115,111,110,98,117,102,95,97,108,108,110,111,115,111,110,32,112,101,114,32,108,97,121,101,114,58,10,32,32,32,0,42,102,111,117,110,100,32,61,61,32,104,122,0,0,0,0,108,109,97,95,98,117,102,91,114,101,109,97,105,110,95,110,117,109,32,45,32,49,93,46,104,97,110,122,105,32,61,61,32,108,109,97,95,98,117,102,91,112,111,115,93,46,104,97,110,122,105,0,0,0,0,0,119,43,0,0,0,0,0,0,46,46,32,116,111,116,97,108,95,115,111,110,98,117,102,95,97,108,108,110,111,115,111,110,32,112,101,114,32,108,97,121,101,114,58,10,32,32,32,0,114,101,109,97,105,110,95,110,117,109,32,62,32,48,0,0,46,46,32,116,111,116,97,108,95,115,111,110,98,117,102,95,110,117,109,32,112,101,114,32,108,97,121,101,114,58,10,32,32,32,0,0,0,0,0,0,108,112,115,105,95,110,117,109,32,62,32,110,117,109,0,0,46,46,47,115,104,97,114,101,47,115,112,101,108,108,105,110,103,116,97,98,108,101,46,99,112,112,0,0,0,0,0,0,46,46,32,116,111,116,97,108,95,110,111,100,101,95,104,97,115,115,111,110,32,112,101,114,32,108,97,121,101,114,58,10,32,32,32,49,44,32,0,0,78,85,76,76,32,33,61,32,109,116,114,120,95,110,100,0,46,46,32,116,111,116,97,108,95,115,111,110,95,110,117,109,32,112,101,114,32,108,97,121,101,114,58,10,32,32,32,0,100,109,105,95,99,95,112,104,114,97,115,101,95,0,0,0,108,109,97,95,115,116,97,114,116,95,91,102,105,120,101,100,95,108,109,97,115,95,93,32,61,61,32,102,105,120,101,100,95,104,122,115,95,0,0,0,46,46,47,115,104,97,114,101,47,108,112,105,99,97,99,104,101,46,99,112,112,0,0,0,115,112,108,95,116,114,105,101,95,45,62,105,115,95,104,97,108,102,95,105,100,40,115,112,108,105,100,41,0,0,0,0,46,46,32,109,97,120,95,104,111,109,111,98,117,102,95,108,101,110,32,112,101,114,32,108,97,121,101,114,58,10,32,32,32,45,44,32,0,0,0,0,108,109,97,95,105,100,95,110,117,109,95,32,43,32,102,105,120,101,100,95,108,109,97,115,95,32,45,32,112,111,115,32,45,32,49,32,62,61,32,112,111,115,0,0,0,0,0,0,108,109,97,95,110,111,100,101,95,110,117,109,95,108,101,48,95,32,60,61,32,98,117,102,95,115,105,122,101,0,0,0,105,110,32,117,115,101,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,46,46,47,115,104,97,114,101,47,117,115,101,114,100,105,99,116,46,99,112,112,0,0,0,112,104,114,97,115,101,95,108,101,110,32,62,32,48,0,0,97,118,101,114,97,103,101,95,115,99,111,114,101,32,60,61,32,50,53,53,0,0,0,0,78,85,76,76,32,33,61,32,108,112,105,95,99,97,99,104,101,95,108,101,110,95,0,0,108,101,109,109,97,95,97,114,114,91,48,93,46,105,100,120,95,98,121,95,104,122,32,61,61,32,49,0,0,0,0,0,37,115,10,0,0,0,0,0,37,108,100,44,32,0,0,0,46,46,47,115,104,97,114,101,47,100,105,99,116,108,105,115,116,46,99,112,112,0,0,0,112,104,114,97,115,101,95,108,101,110,32,61,61,32,108,109,97,95,115,116,97,114,116,95,91,102,105,120,101,100,95,108,109,97,115,95,93,0,0,0,115,117,99,101,115,115,0,0,99,98,95,110,101,119,0,0,37,115,10,0,0,0,0,0,46,46,32,109,97,120,95,115,111,110,98,117,102,95,108,101,110,32,112,101,114,32,108,97,121,101,114,40,102,114,111,109,32,108,97,121,101,114,32,48,41,58,10,32,32,32,0,0,108,109,97,95,108,101,110,32,61,61,32,108,109,97,95,115,116,97,114,116,95,91,112,111,115,32,43,32,49,93,32,45,32,108,109,97,95,115,116,97,114,116,95,91,112,111,115,93,0,0,0,0,0,0,0,0,42,110,117,109,32,62,61,32,49,0,0,0,0,0,0,0,111,108,100,114,111,119,32,62,61,32,100,109,105,45,62,115,112,108,115,116,114,95,108,101,110,0,0,0,0,0,0,0,100,101,112,95,45,62,105,100,95,110,117,109,32,62,32,48,0,0,0,0,0,0,0,0,99,97,110,100,95,115,112,108,105,100,115,95,116,104,105,115,32,62,32,48,0,0,0,0,37,115,58,32,0,0,0,0,115,111,110,95,112,111,115,32,43,32,49,32,61,61,32,112,97,114,101,110,116,95,115,111,110,95,110,117,109,0,0,0,48,32,61,61,32,112,114,101,118,95,105,100,115,95,110,117,109,0,0,0,0,0,0,0,40,33,97,114,103,95,118,97,108,105,100,32,38,38,32,115,112,108,105,100,115,95,109,97,120,32,62,61,32,108,109,97,95,108,101,110,41,32,124,124,32,108,109,97,95,108,101,110,32,61,61,32,115,112,108,105,100,115,95,109,97,120,0,0,104,111,109,111,95,110,117,109,32,60,61,32,50,53,53,0,78,85,76,76,32,33,61,32,101,110,100,95,110,111,100,101,0,0,0,0,0,0,0,0,110,111,100,101,95,115,111,110,45,62,115,112,108,95,105,100,120,32,62,61,32,105,100,95,115,116,97,114,116,32,38,38,32,110,111,100,101,95,115,111,110,45,62,115,112,108,95,105,100,120,32,60,32,105,100,95,115,116,97,114,116,32,43,32,105,100,95,110,117,109,0,0,46,46,47,115,104,97,114,101,47,115,112,101,108,108,105,110,103,116,114,105,101,46,99,112,112,0,0,0,0,0,0,0,104,111,109,111,95,110,117,109,32,60,61,32,54,53,53,51,53,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,110,111,100,101,32,61,61,32,114,111,111,116,95,32,38,38,32,49,32,61,61,32,110,111,100,101,95,102,114,95,110,117,109,0,0,0,0,0,0,0,115,112,108,95,115,116,97,114,116,95,91,102,105,120,101,100,95,104,122,115,95,93,32,61,61,32,102,105,120,101,100,95,99,104,95,112,111,115,0,0,37,115,58,32,0,0,0,0,112,97,114,101,110,116,95,115,111,110,95,110,117,109,32,60,61,32,50,53,53,0,0,0,115,116,101,112,95,116,111,95,100,109,105,95,102,114,32,33,61,32,115,116,97,116,105,99,95,99,97,115,116,60,80,111,111,108,80,111,115,84,121,112,101,62,40,45,49,41,0,0,105,100,95,110,117,109,32,62,32,48,0,0,0,0,0,0,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,112,97,114,101,110,116,95,115,111,110,95,110,117,109,32,60,61,32,54,53,53,51,53,0,99,97,110,100,95,108,101,110,32,62,32,48,0,0,0,0,46,46,47,115,104,97,114,101,47,100,105,99,116,116,114,105,101,46,99,112,112,0,0,0,110,111,100,101,95,103,101,49,45,62,115,111,110,95,49,115,116,95,111,102,102,95,108,32,62,32,48,32,124,124,32,110,111,100,101,95,103,101,49,45,62,115,111,110,95,49,115,116,95,111,102,102,95,104,32,62,32,48,0,0,0,0,0,0,115,121,115,116,101,109,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,116,121,112,101,105,100,0,108,101,118,101,108,32,60,32,107,77,97,120,76,101,109,109,97,83,105,122,101,0,0,0,114,98,0,0,0,0,0,0,115,99,111,114,101,32,62,61,32,48,0,0,0,0,0,0,60,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,37,100,39,116,104,32,68,77,73,32,110,111,100,101,32,101,110,100,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,10,0,0,0,0,0,78,85,76,76,32,33,61,32,108,112,105,95,99,97,99,104,101,95,0,0,0,0,0,0,110,111,100,101,95,108,101,48,45,62,115,111,110,95,49,115,116,95,111,102,102,32,60,61,32,108,109,97,95,110,111,100,101,95,110,117,109,95,103,101,49,95,0,0,0,0,0,0,78,85,76,76,32,33,61,32,115,116,114,0,0,0,0,0,108,97,115,116,95,104,122,95,108,101,110,32,62,32,48,0,46,46,47,115,104,97,114,101,47,110,103,114,97,109,46,99,112,112,0,0,0,0,0,0,102,111,117,110,100,0,0,0,58,32,0,0,0,0,0,0,32,84,111,116,97,108,32,80,105,110,121,105,110,32,76,101,110,58,32,37,100,10,0,0,104,50,102,95,110,117,109,95,91,42,115,112,108,105,100,93,32,62,32,48,0,0,0,0,110,111,100,101,45,62,115,111,110,95,49,115,116,95,111,102,102,95,108,32,62,32,48,32,124,124,32,110,111,100,101,45,62,115,111,110,95,49,115,116,95,111,102,102,95,104,32,62,32,48,0,0,0,0,0,0,115,116,97,116,105,99,95,99,97,115,116,60,115,105,122,101,95,116,62,40,102,111,117,110,100,32,45,32,98,117,102,95,41,32,62,61,32,115,116,97,114,116,95,112,111,115,95,91,115,116,114,95,108,101,110,32,45,32,49,93,0,0,0,0,105,116,101,109,95,110,117,109,0,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,78,85,76,76,32,33,61,32,100,105,99,116,95,116,114,105,101,45,62,108,109,97,95,105,100,120,95,98,117,102,95,0,32,83,112,101,108,108,105,110,103,32,58,32,37,115,44,32,37,100,10,0,0,0,0,0,110,111,100,101,45,62,115,111,110,95,49,115,116,95,111,102,102,32,60,61,32,108,109,97,95,110,111,100,101,95,110,117,109,95,103,101,49,95,0,0,102,111,117,110,100,32,62,32,98,117,102,95,0,0,0,0,90,104,0,0,0,0,0,0,78,85,76,76,32,33,61,32,100,105,99,116,95,116,114,105,101,45,62,114,111,111,116,95,0,0,0,0,0,0,0,0,46,46,47,115,104,97,114,101,47,100,105,99,116,98,117,105,108,100,101,114,46,99,112,112,0,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,83,112,101,108,108,105,110,103,84,114,105,101,58,58,105,102,95,118,97,108,105,100,95,105,100,95,117,112,100,97,116,101,40,117,105,110,116,49,54,32,42,41,32,99,111,110,115,116,0,0,0,0,0,0,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,85,115,101,114,68,105,99,116,58,58,114,101,99,108,97,105,109,40,41,0,0,0,0,105,109,101,95,112,105,110,121,105,110,58,58,76,112,105,67,97,99,104,101,58,58,76,112,105,67,97,99,104,101,40,41,0,0,0,0,0,0,0,0,115,116,97,116,105,99,32,105,109,101,95,112,105,110,121,105,110,58,58,76,112,105,67,97,99,104,101,32,38,105,109,101,95,112,105,110,121,105,110,58,58,76,112,105,67,97,99,104,101,58,58,103,101,116,95,105,110,115,116,97,110,99,101,40,41,0,0,0,0,0,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,108,111,97,100,95,100,105,99,116,40,70,73,76,69,32,42,41,0,0,0,0,118,105,114,116,117,97,108,32,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,103,101,116,95,108,112,105,115,40,99,111,110,115,116,32,117,105,110,116,49,54,32,42,44,32,117,105,110,116,49,54,44,32,76,109,97,80,115,98,73,116,101,109,32,42,44,32,115,105,122,101,95,116,41,0,0,0,0,0,118,105,114,116,117,97,108,32,117,105,110,116,49,54,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,103,101,116,95,108,101,109,109,97,95,115,112,108,105,100,115,40,76,101,109,109,97,73,100,84,121,112,101,44,32,117,105,110,116,49,54,32,42,44,32,117,105,110,116,49,54,44,32,98,111,111,108,41,0,0,0,0,0,0,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,101,120,116,101,110,100,95,100,105,99,116,50,40,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,44,32,99,111,110,115,116,32,68,105,99,116,69,120,116,80,97,114,97,32,42,44,32,76,109,97,80,115,98,73,116,101,109,32,42,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,32,42,41,0,0,0,0,0,0,0,0,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,101,120,116,101,110,100,95,100,105,99,116,49,40,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,44,32,99,111,110,115,116,32,68,105,99,116,69,120,116,80,97,114,97,32,42,44,32,76,109,97,80,115,98,73,116,101,109,32,42,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,32,42,41,0,0,0,0,0,0,0,0,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,101,120,116,101,110,100,95,100,105,99,116,48,40,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,44,32,99,111,110,115,116,32,68,105,99,116,69,120,116,80,97,114,97,32,42,44,32,76,109,97,80,115,98,73,116,101,109,32,42,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,32,42,41,0,0,0,0,0,0,0,0,118,105,114,116,117,97,108,32,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,101,120,116,101,110,100,95,100,105,99,116,40,77,105,108,101,83,116,111,110,101,72,97,110,100,108,101,44,32,99,111,110,115,116,32,68,105,99,116,69,120,116,80,97,114,97,32,42,44,32,76,109,97,80,115,98,73,116,101,109,32,42,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,32,42,41,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,58,58,116,114,121,95,101,120,116,101,110,100,40,99,111,110,115,116,32,117,105,110,116,49,54,32,42,44,32,117,105,110,116,49,54,44,32,76,101,109,109,97,73,100,84,121,112,101,41,0,0,0,0,0,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,102,105,108,108,95,115,99,105,115,40,99,111,110,115,116,32,105,109,101,95,112,105,110,121,105,110,58,58,83,105,110,103,108,101,67,104,97,114,73,116,101,109,32,42,44,32,115,105,122,101,95,116,41,0,0,0,0,0,0,0,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,102,105,108,108,95,108,105,115,116,40,99,111,110,115,116,32,105,109,101,95,112,105,110,121,105,110,58,58,76,101,109,109,97,69,110,116,114,121,32,42,44,32,115,105,122,101,95,116,41,0,0,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,112,114,101,100,105,99,116,40,99,111,110,115,116,32,99,104,97,114,49,54,32,42,44,32,117,105,110,116,49,54,44,32,78,80,114,101,100,105,99,116,73,116,101,109,32,42,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,41,0,0,0,0,117,105,110,116,49,54,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,103,101,116,95,115,112,108,105,100,115,95,102,111,114,95,104,97,110,122,105,40,99,104,97,114,49,54,44,32,117,105,110,116,49,54,44,32,117,105,110,116,49,54,32,42,44,32,117,105,110,116,49,54,41,0,0,0,0,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,99,111,110,118,101,114,116,95,116,111,95,115,99,105,115,95,105,100,115,40,99,104,97,114,49,54,32,42,44,32,117,105,110,116,49,54,41,0,0,0,0,0,0,0,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,99,111,110,118,101,114,116,95,116,111,95,104,97,110,122,105,115,40,99,104,97,114,49,54,32,42,44,32,117,105,110,116,49,54,41,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,99,97,108,99,117,108,97,116,101,95,115,105,122,101,40,99,111,110,115,116,32,105,109,101,95,112,105,110,121,105,110,58,58,76,101,109,109,97,69,110,116,114,121,32,42,44,32,115,105,122,101,95,116,41,0,0,0,0,0,76,101,109,109,97,73,100,84,121,112,101,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,76,105,115,116,58,58,103,101,116,95,108,101,109,109,97,95,105,100,40,99,111,110,115,116,32,99,104,97,114,49,54,32,42,44,32,117,105,110,116,49,54,41,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,78,71,114,97,109,58,58,98,117,105,108,100,95,117,110,105,103,114,97,109,40,105,109,101,95,112,105,110,121,105,110,58,58,76,101,109,109,97,69,110,116,114,121,32,42,44,32,115,105,122,101,95,116,44,32,76,101,109,109,97,73,100,84,121,112,101,41,0,0,0,0,100,111,117,98,108,101,32,105,109,101,95,112,105,110,121,105,110,58,58,114,101,99,97,108,99,117,108,97,116,101,95,107,101,114,110,101,108,40,100,111,117,98,108,101,32,42,44,32,115,105,122,101,95,116,44,32,100,111,117,98,108,101,32,42,44,32,67,79,68,69,66,79,79,75,95,84,89,80,69,32,42,41,0,0,0,0,0,0,99,111,110,115,116,32,99,104,97,114,32,42,105,109,101,95,112,105,110,121,105,110,58,58,83,112,101,108,108,105,110,103,84,97,98,108,101,58,58,97,114,114,97,110,103,101,40,115,105,122,101,95,116,32,42,44,32,115,105,122,101,95,116,32,42,41,0,0,0,0,0,0,105,109,101,95,112,105,110,121,105,110,58,58,83,112,101,108,108,105,110,103,78,111,100,101,32,42,105,109,101,95,112,105,110,121,105,110,58,58,83,112,101,108,108,105,110,103,84,114,105,101,58,58,99,111,110,115,116,114,117,99,116,95,115,112,101,108,108,105,110,103,115,95,115,117,98,115,101,116,40,115,105,122,101,95,116,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,44,32,105,109,101,95,112,105,110,121,105,110,58,58,83,112,101,108,108,105,110,103,78,111,100,101,32,42,41,0,0,0,0,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,83,112,101,108,108,105,110,103,84,114,105,101,58,58,98,117,105,108,100,95,121,109,95,105,110,102,111,40,41,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,100,101,108,115,101,97,114,99,104,40,115,105,122,101,95,116,44,32,98,111,111,108,44,32,98,111,111,108,41,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,103,101,116,95,108,112,105,115,40,99,111,110,115,116,32,117,105,110,116,49,54,32,42,44,32,115,105,122,101,95,116,44,32,76,109,97,80,115,98,73,116,101,109,32,42,44,32,115,105,122,101,95,116,44,32,99,111,110,115,116,32,99,104,97,114,49,54,32,42,44,32,98,111,111,108,41,0,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,99,104,111,111,115,101,40,115,105,122,101,95,116,41,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,97,100,100,95,108,109,97,95,116,111,95,117,115,101,114,100,105,99,116,40,117,105,110,116,49,54,44,32,117,105,110,116,49,54,44,32,102,108,111,97,116,41,0,0,0,0,0,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,99,97,110,99,101,108,95,108,97,115,116,95,99,104,111,105,99,101,40,41,0,0,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,109,101,114,103,101,95,102,105,120,101,100,95,108,109,97,115,40,115,105,122,101,95,116,41,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,103,101,116,95,115,112,108,95,115,116,97,114,116,95,105,100,40,41,0,0,0,0,0,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,97,100,100,95,99,104,97,114,95,113,119,101,114,116,121,40,41,0,0,0,0,0,0,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,101,120,116,101,110,100,95,109,116,114,120,95,110,100,40,77,97,116,114,105,120,78,111,100,101,32,42,44,32,76,109,97,80,115,98,73,116,101,109,32,42,44,32,115,105,122,101,95,116,44,32,80,111,111,108,80,111,115,84,121,112,101,44,32,115,105,122,101,95,116,41,0,0,0,0,0,0,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,114,101,115,101,116,95,115,101,97,114,99,104,40,115,105,122,101,95,116,44,32,98,111,111,108,44,32,98,111,111,108,44,32,98,111,111,108,41,0,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,101,120,116,101,110,100,95,100,109,105,95,99,40,68,105,99,116,69,120,116,80,97,114,97,32,42,44,32,68,105,99,116,77,97,116,99,104,73,110,102,111,32,42,41,0,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,77,97,116,114,105,120,83,101,97,114,99,104,58,58,101,120,116,101,110,100,95,100,109,105,40,68,105,99,116,69,120,116,80,97,114,97,32,42,44,32,68,105,99,116,77,97,116,99,104,73,110,102,111,32,42,41,0,0,0,0,0,99,104,97,114,49,54,32,42,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,66,117,105,108,100,101,114,58,58,114,101,97,100,95,118,97,108,105,100,95,104,97,110,122,105,115,40,99,111,110,115,116,32,99,104,97,114,32,42,44,32,115,105,122,101,95,116,32,42,41,0,0,0,0,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,66,117,105,108,100,101,114,58,58,104,122,95,105,110,95,104,97,110,122,105,115,95,108,105,115,116,40,99,111,110,115,116,32,99,104,97,114,49,54,32,42,44,32,115,105,122,101,95,116,44,32,99,104,97,114,49,54,41,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,66,117,105,108,100,101,114,58,58,99,111,110,115,116,114,117,99,116,95,115,117,98,115,101,116,40,118,111,105,100,32,42,44,32,105,109,101,95,112,105,110,121,105,110,58,58,76,101,109,109,97,69,110,116,114,121,32,42,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,44,32,115,105,122,101,95,116,41,0,0,0,0,0,0,0,0,118,111,105,100,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,66,117,105,108,100,101,114,58,58,103,101,116,95,116,111,112,95,108,101,109,109,97,115,40,41,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,66,117,105,108,100,101,114,58,58,114,101,97,100,95,114,97,119,95,100,105,99,116,40,99,111,110,115,116,32,99,104,97,114,32,42,44,32,99,111,110,115,116,32,99,104,97,114,32,42,44,32,115,105,122,101,95,116,41,0,0,0,0,0,0,0,115,105,122,101,95,116,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,66,117,105,108,100,101,114,58,58,98,117,105,108,100,95,115,99,105,115,40,41,0,0,0,0,98,111,111,108,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,66,117,105,108,100,101,114,58,58,98,117,105,108,100,95,100,105,99,116,40,99,111,110,115,116,32,99,104,97,114,32,42,44,32,99,111,110,115,116,32,99,104,97,114,32,42,44,32,105,109,101,95,112,105,110,121,105,110,58,58,68,105,99,116,84,114,105,101,32,42,41,0,0,0,0,88,81,0,0,0,0,0,0,0,0,0,0,200,38,0,0,62,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,38,0,0,38,0,0,0,84,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,38,0,0,98,0,0,0,50,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,38,0,0,38,0,0,0,82,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,39,0,0,26,0,0,0,78,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,41,0,0,30,0,0,0,2,0,0,0,2,0,0,0,14,0,0,0,12,0,0,0,2,0,0,0,2,0,0,0,10,0,0,0,20,0,0,0,4,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,8,0,0,0,34,0,0,0,16,0,0,0,50,0,0,0,16,0,0,0,10,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,41,0,0,68,0,0,0,12,0,0,0,12,0,0,0,8,0,0,0,18,0,0,0,10,0,0,0,4,0,0,0,6,0,0,0,14,0,0,0,12,0,0,0,6,0,0,0,8,0,0,0,18,0,0,0,10,0,0,0,44,0,0,0,4,0,0,0,32,0,0,0,6,0,0,0,8,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,41,0,0,74,0,0,0,34,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,41,0,0,88,0,0,0,60,0,0,0,94,0,0,0,22,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,41,0,0,88,0,0,0,24,0,0,0,94,0,0,0,22,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,41,0,0,88,0,0,0,106,0,0,0,94,0,0,0,22,0,0,0,10,0,0,0,4,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,42,0,0,88,0,0,0,46,0,0,0,94,0,0,0,22,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,42,0,0,88,0,0,0,70,0,0,0,94,0,0,0,22,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,42,0,0,88,0,0,0,20,0,0,0,94,0,0,0,22,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,42,0,0,88,0,0,0,72,0,0,0,94,0,0,0,22,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,42,0,0,88,0,0,0,100,0,0,0,94,0,0,0,22,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,121,0,0,0,0,0,0,0,120,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,105,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,101,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,50,48,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,0,0,0,0,83,116,49,48,98,97,100,95,116,121,112,101,105,100,0,0,80,121,0,0,0,0,0,0,80,120,0,0,0,0,0,0,80,119,0,0,0,0,0,0,80,118,0,0,0,0,0,0,80,116,0,0,0,0,0,0,80,115,0,0,0,0,0,0,80,109,0,0,0,0,0,0,80,108,0,0,0,0,0,0,80,106,0,0,0,0,0,0,80,105,0,0,0,0,0,0,80,104,0,0,0,0,0,0,80,102,0,0,0,0,0,0,80,101,0,0,0,0,0,0,80,100,0,0,0,0,0,0,80,99,0,0,0,0,0,0,80,98,0,0,0,0,0,0,80,97,0,0,0,0,0,0,80,75,121,0,0,0,0,0,80,75,120,0,0,0,0,0,80,75,119,0,0,0,0,0,80,75,118,0,0,0,0,0,80,75,116,0,0,0,0,0,80,75,115,0,0,0,0,0,80,75,109,0,0,0,0,0,80,75,108,0,0,0,0,0,80,75,106,0,0,0,0,0,80,75,105,0,0,0,0,0,80,75,104,0,0,0,0,0,80,75,102,0,0,0,0,0,80,75,101,0,0,0,0,0,80,75,100,0,0,0,0,0,80,75,99,0,0,0,0,0,80,75,98,0,0,0,0,0,80,75,97,0,0,0,0,0,80,75,68,115,0,0,0,0,80,75,68,110,0,0,0,0,80,75,68,105,0,0,0,0,80,68,115,0,0,0,0,0,80,68,110,0,0,0,0,0,80,68,105,0,0,0,0,0,78,49,48,105,109,101,95,112,105,110,121,105,110,56,85,115,101,114,68,105,99,116,69,0,78,49,48,105,109,101,95,112,105,110,121,105,110,56,68,105,99,116,84,114,105,101,69,0,78,49,48,105,109,101,95,112,105,110,121,105,110,49,50,65,116,111,109,68,105,99,116,66,97,115,101,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,57,95,95,112,111,105,110,116,101,114,95,116,111,95,109,101,109,98,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,102,117,110,99,116,105,111,110,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,97,114,114,97,121,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,101,110,117,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,68,115,0,0,0,0,0,0,68,110,0,0,0,0,0,0,68,105,0,0,0,0,0,0,56,33,0,0,96,34,0,0,56,33,0,0,104,34,0,0,56,33,0,0,200,34,0,0,0,0,0,0,216,34,0,0,0,0,0,0,232,34,0,0,0,0,0,0,248,34,0,0,208,38,0,0,0,0,0,0,0,0,0,0,8,35,0,0,208,38,0,0,0,0,0,0,0,0,0,0,24,35,0,0,216,38,0,0,0,0,0,0,0,0,0,0,56,35,0,0,208,38,0,0,0,0,0,0,0,0,0,0,72,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,35,0,0,0,0,0,0,176,38,0,0,0,0,0,0,96,35,0,0,0,0,0,0,184,38,0,0,0,0,0,0,104,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,35,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,192,35,0,0,0,0,0,0,192,38,0,0,0,0,0,0,200,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,35,0,0,1,0,0,0,0,0,0,0,0,0,0,0,216,35,0,0,1,0,0,0,0,0,0,0,0,0,0,0,224,35,0,0,1,0,0,0,176,38,0,0,0,0,0,0,232,35,0,0,1,0,0,0,184,38,0,0,0,0,0,0,240,35,0,0,1,0,0,0,0,0,0,0,0,0,0,0,248,35,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,8,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,16,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,24,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,32,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,40,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,48,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,56,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,64,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,72,36,0,0,1,0,0,0,192,38,0,0,0,0,0,0,80,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,88,36,0,0,1,0,0,0,120,42,0,0,0,0,0,0,96,36,0,0,1,0,0,0,128,42,0,0,0,0,0,0,104,36,0,0,1,0,0,0,136,42,0,0,0,0,0,0,112,36,0,0,0,0,0,0,120,42,0,0,0,0,0,0,120,36,0,0,0,0,0,0,128,42,0,0,0,0,0,0,128,36,0,0,0,0,0,0,136,42,0,0,0,0,0,0,136,36,0,0,192,41,0,0,0,0,0,0,96,33,0,0,160,36,0,0,0,0,0,0,1,0,0,0,192,41,0,0,0,0,0,0,0,0,0,0,184,36,0,0,0,0,0,0,216,36,0,0,40,42,0,0,0,0,0,0,0,0,0,0,8,37,0,0,88,42,0,0,0,0,0,0,0,0,0,0,48,37,0,0,56,42,0,0,0,0,0,0,0,0,0,0,88,37,0,0,56,42,0,0,0,0,0,0,0,0,0,0,128,37,0,0,88,42,0,0,0,0,0,0,0,0,0,0,168,37,0,0,40,42,0,0,0,0,0,0,0,0,0,0,208,37,0,0,88,42,0,0,0,0,0,0,0,0,0,0,248,37,0,0,88,42,0,0,0,0,0,0,0,0,0,0,32,38,0,0,88,42,0,0,0,0,0,0,0,0,0,0,72,38,0,0,200,38,0,0,0,0,0,0,0,0,0,0,112,38,0,0,88,42,0,0,0,0,0,0,56,33,0,0,152,38,0,0,56,33,0,0,160,38,0,0,56,33,0,0,168,38,0,0,72,77,0,0,0,0,0,72,78,71,0,0,0,0,78,71,0,0,0,0,0,0,0,0,48,65,66,67,99,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,115,84,85,86,87,88,89,90,122,0,0,2,1,1,1,2,1,1,1,0,1,1,1,1,1,2,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0,128,48,0,0,128,32,14,0,128,32,200,3,128,32,8,250,128,32,8,130,0,0,192,224,240,248,252,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___gxx_personality_v0() {
    }
  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x*y > 4294967295),(x*y)>>>0)|0);
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        stdin.isTerminal = !stdinOverridden;
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        stdout.isTerminal = !stdoutOverridden;
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        stderr.isTerminal = !stderrOverridden;
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id;
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        });
      } else {
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        });
      }
      return id;
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) return 0;
      var bytesRead = _read(stream, ptr, bytesToRead);
      var streamObj = FS.streams[stream];
      if (bytesRead == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        if (bytesRead < bytesToRead) streamObj.eof = true;
        return Math.floor(bytesRead / size);
      }
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  Module["_strlen"] = _strlen;
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  var _llvm_memset_p0i8_i64=_memset;
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    }
  function _fdopen(fildes, mode) {
      // FILE *fdopen(int fildes, const char *mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fdopen.html
      if (FS.streams[fildes]) {
        var stream = FS.streams[fildes];
        mode = Pointer_stringify(mode);
        if ((mode.indexOf('w') != -1 && !stream.isWrite) ||
            (mode.indexOf('r') != -1 && !stream.isRead) ||
            (mode.indexOf('a') != -1 && !stream.isAppend) ||
            (mode.indexOf('+') != -1 && (!stream.isRead || !stream.isWrite))) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return 0;
        } else {
          stream.error = false;
          stream.eof = false;
          return fildes;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
    }
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  var _fabs=Math.abs;
  var _log=Math.log;
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var comparator = function(x, y) {
        return Runtime.dynCall('iii', cmp, [x, y]);
      }
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return comparator(base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  function _bsearch(key, base, num, size, compar) {
      var cmp = function(x, y) {
        return Runtime.dynCall('iii', compar, [x, y])
      };
      var left = 0;
      var right = num;
      var mid, test, addr;
      while (left < right) {
        mid = (left + right) >>> 1;
        addr = base + (mid * size);
        test = cmp(key, addr);
        if (test < 0) {
          right = mid;
        } else if (test > 0) {
          left = mid + 1;
        } else {
          return addr;
        }
      }
      return 0;
    }
  var _sqrt=Math.sqrt;
  Module["_strncpy"] = _strncpy;
  function _gettimeofday(ptr) {
      // %struct.timeval = type { i32, i32 }
      var now = Date.now();
      HEAP32[((ptr)>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((ptr)+(4))>>2)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
      return 0;
    }
  Module["_memcmp"] = _memcmp;
  function _unlink(path) {
      // int unlink(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/unlink.html
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists || !path.exists) {
        ___setErrNo(path.error);
        return -1;
      } else if (path.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (!path.object.write) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else {
        delete path.parentObject.contents[path.name];
        return 0;
      }
    }
  function _ferror(stream) {
      // int ferror(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ferror.html
      return Number(FS.streams[stream] && FS.streams[stream].error);
    }
  function _feof(stream) {
      // int feof(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/feof.html
      return Number(FS.streams[stream] && FS.streams[stream].eof);
    }
  function _truncate(path, length) {
      // int truncate(const char *path, off_t length);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/truncate.html
      // NOTE: The path argument may be a string, to simplify ftruncate().
      if (length < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (typeof path !== 'string') path = Pointer_stringify(path);
        var target = FS.findObject(path);
        if (target === null) return -1;
        if (target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        } else if (target.isDevice) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else if (!target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        } else {
          var contents = target.contents;
          if (length < contents.length) contents.length = length;
          else while (length > contents.length) contents.push(0);
          target.timestamp = Date.now();
          return 0;
        }
      }
    }function _ftruncate(fildes, length) {
      // int ftruncate(int fildes, off_t length);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftruncate.html
      if (FS.streams[fildes] && FS.streams[fildes].isWrite) {
        return _truncate(FS.streams[fildes].path, length);
      } else if (FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
___buildEnvironment(ENV);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 131072;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;
  var ctlz_i8=env.ctlz_i8|0;
  var __ZTIy=env.__ZTIy|0;
  var __ZTIx=env.__ZTIx|0;
  var __ZTIt=env.__ZTIt|0;
  var __ZTIs=env.__ZTIs|0;
  var __ZTIm=env.__ZTIm|0;
  var __ZTIl=env.__ZTIl|0;
  var __ZTIi=env.__ZTIi|0;
  var __ZTIh=env.__ZTIh|0;
  var __ZTIj=env.__ZTIj|0;
  var __ZTIe=env.__ZTIe|0;
  var __ZTId=env.__ZTId|0;
  var __ZTVN10__cxxabiv117__class_type_infoE=env.__ZTVN10__cxxabiv117__class_type_infoE|0;
  var __ZTIf=env.__ZTIf|0;
  var __ZTIa=env.__ZTIa|0;
  var __ZTIc=env.__ZTIc|0;
  var __ZTVN10__cxxabiv120__si_class_type_infoE=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;
  var _stderr=env._stderr|0;
  var ___progname=env.___progname|0;
  var __ZTVN10__cxxabiv119__pointer_type_infoE=env.__ZTVN10__cxxabiv119__pointer_type_infoE|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;
  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_iiiiiii=env.invoke_iiiiiii;
  var invoke_ii=env.invoke_ii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_iiiii=env.invoke_iiiii;
  var invoke_viiiiii=env.invoke_viiiiii;
  var invoke_iii=env.invoke_iii;
  var invoke_iiiiii=env.invoke_iiiiii;
  var invoke_viiii=env.invoke_viiii;
  var _strncmp=env._strncmp;
  var _lseek=env._lseek;
  var ___cxa_call_unexpected=env.___cxa_call_unexpected;
  var _snprintf=env._snprintf;
  var ___cxa_free_exception=env.___cxa_free_exception;
  var ___cxa_throw=env.___cxa_throw;
  var _fread=env._fread;
  var _fclose=env._fclose;
  var _strerror=env._strerror;
  var ___cxa_pure_virtual=env.___cxa_pure_virtual;
  var _fprintf=env._fprintf;
  var _sqrt=env._sqrt;
  var _llvm_va_end=env._llvm_va_end;
  var _pread=env._pread;
  var _close=env._close;
  var _feof=env._feof;
  var _fopen=env._fopen;
  var _strchr=env._strchr;
  var _fputc=env._fputc;
  var ___buildEnvironment=env.___buildEnvironment;
  var _log=env._log;
  var _open=env._open;
  var ___setErrNo=env.___setErrNo;
  var _recv=env._recv;
  var _fseek=env._fseek;
  var _qsort=env._qsort;
  var _send=env._send;
  var _write=env._write;
  var _fputs=env._fputs;
  var _ftell=env._ftell;
  var _llvm_umul_with_overflow_i32=env._llvm_umul_with_overflow_i32;
  var _exit=env._exit;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var _strdup=env._strdup;
  var ___cxa_allocate_exception=env.___cxa_allocate_exception;
  var _ferror=env._ferror;
  var _printf=env._printf;
  var _sysconf=env._sysconf;
  var _sbrk=env._sbrk;
  var _truncate=env._truncate;
  var _read=env._read;
  var ___cxa_is_number_type=env.___cxa_is_number_type;
  var __reallyNegative=env.__reallyNegative;
  var _time=env._time;
  var __formatString=env.__formatString;
  var ___cxa_does_inherit=env.___cxa_does_inherit;
  var _getenv=env._getenv;
  var __ZSt9terminatev=env.__ZSt9terminatev;
  var _gettimeofday=env._gettimeofday;
  var _vfprintf=env._vfprintf;
  var ___cxa_begin_catch=env.___cxa_begin_catch;
  var _llvm_eh_exception=env._llvm_eh_exception;
  var _unlink=env._unlink;
  var ___assert_func=env.___assert_func;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var _pwrite=env._pwrite;
  var _putchar=env._putchar;
  var _puts=env._puts;
  var _fsync=env._fsync;
  var _fabs=env._fabs;
  var _strerror_r=env._strerror_r;
  var ___errno_location=env.___errno_location;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var _isspace=env._isspace;
  var _fdopen=env._fdopen;
  var _abort=env._abort;
  var _bsearch=env._bsearch;
  var _fwrite=env._fwrite;
  var _ftruncate=env._ftruncate;
  var __exit=env.__exit;
  var ___resumeException=env.___resumeException;
  var _strcmp=env._strcmp;
  var ___cxa_end_catch=env.___cxa_end_catch;
// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 7 >> 3 << 3;
 return ret | 0;
}
function stackSave() {
 return STACKTOP | 0;
}
function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}
function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}
function copyTempFloat(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1 | 0] = HEAP8[ptr + 1 | 0];
 HEAP8[tempDoublePtr + 2 | 0] = HEAP8[ptr + 2 | 0];
 HEAP8[tempDoublePtr + 3 | 0] = HEAP8[ptr + 3 | 0];
}
function copyTempDouble(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1 | 0] = HEAP8[ptr + 1 | 0];
 HEAP8[tempDoublePtr + 2 | 0] = HEAP8[ptr + 2 | 0];
 HEAP8[tempDoublePtr + 3 | 0] = HEAP8[ptr + 3 | 0];
 HEAP8[tempDoublePtr + 4 | 0] = HEAP8[ptr + 4 | 0];
 HEAP8[tempDoublePtr + 5 | 0] = HEAP8[ptr + 5 | 0];
 HEAP8[tempDoublePtr + 6 | 0] = HEAP8[ptr + 6 | 0];
 HEAP8[tempDoublePtr + 7 | 0] = HEAP8[ptr + 7 | 0];
}
function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}
function setTempRet1(value) {
 value = value | 0;
 tempRet1 = value;
}
function setTempRet2(value) {
 value = value | 0;
 tempRet2 = value;
}
function setTempRet3(value) {
 value = value | 0;
 tempRet3 = value;
}
function setTempRet4(value) {
 value = value | 0;
 tempRet4 = value;
}
function setTempRet5(value) {
 value = value | 0;
 tempRet5 = value;
}
function setTempRet6(value) {
 value = value | 0;
 tempRet6 = value;
}
function setTempRet7(value) {
 value = value | 0;
 tempRet7 = value;
}
function setTempRet8(value) {
 value = value | 0;
 tempRet8 = value;
}
function setTempRet9(value) {
 value = value | 0;
 tempRet9 = value;
}
function runPostSets() {
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 8 >> 2] = 88;
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 12 >> 2] = 108;
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 16 >> 2] = 94;
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 20 >> 2] = 22;
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 24 >> 2] = 10;
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 28 >> 2] = 6;
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 32 >> 2] = 2;
 HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 36 >> 2] = 4;
 HEAP32[__ZTVN10__cxxabiv119__pointer_type_infoE + 8 >> 2] = 88;
 HEAP32[__ZTVN10__cxxabiv119__pointer_type_infoE + 12 >> 2] = 96;
 HEAP32[__ZTVN10__cxxabiv119__pointer_type_infoE + 16 >> 2] = 94;
 HEAP32[__ZTVN10__cxxabiv119__pointer_type_infoE + 20 >> 2] = 22;
 HEAP32[__ZTVN10__cxxabiv119__pointer_type_infoE + 24 >> 2] = 12;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 8 >> 2] = 88;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 12 >> 2] = 86;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 16 >> 2] = 94;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 20 >> 2] = 22;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 24 >> 2] = 10;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 28 >> 2] = 2;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 32 >> 2] = 6;
 HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 36 >> 2] = 2;
 HEAP32[__ZTIy >> 2] = 8504;
 HEAP32[__ZTIy + 4 >> 2] = 8784;
 HEAP32[__ZTIx >> 2] = 8504;
 HEAP32[__ZTIx + 4 >> 2] = 8792;
 HEAP32[__ZTIt >> 2] = 8504;
 HEAP32[__ZTIt + 4 >> 2] = 8816;
 HEAP32[__ZTIs >> 2] = 8504;
 HEAP32[__ZTIs + 4 >> 2] = 8824;
 HEAP32[__ZTIm >> 2] = 8504;
 HEAP32[__ZTIm + 4 >> 2] = 8832;
 HEAP32[__ZTIl >> 2] = 8504;
 HEAP32[__ZTIl + 4 >> 2] = 8840;
 HEAP32[__ZTIj >> 2] = 8504;
 HEAP32[__ZTIj + 4 >> 2] = 8848;
 HEAP32[__ZTIi >> 2] = 8504;
 HEAP32[__ZTIi + 4 >> 2] = 8856;
 HEAP32[__ZTIh >> 2] = 8504;
 HEAP32[__ZTIh + 4 >> 2] = 8864;
 HEAP32[__ZTIf >> 2] = 8504;
 HEAP32[__ZTIf + 4 >> 2] = 8872;
 HEAP32[__ZTIe >> 2] = 8504;
 HEAP32[__ZTIe + 4 >> 2] = 8880;
 HEAP32[__ZTId >> 2] = 8504;
 HEAP32[__ZTId + 4 >> 2] = 8888;
 HEAP32[__ZTIc >> 2] = 8504;
 HEAP32[__ZTIc + 4 >> 2] = 8896;
 HEAP32[__ZTIa >> 2] = 8504;
 HEAP32[__ZTIa + 4 >> 2] = 8912;
 HEAP32[2482] = __ZTVN10__cxxabiv117__class_type_infoE + 8;
 HEAP32[2484] = __ZTVN10__cxxabiv117__class_type_infoE + 8;
 HEAP32[2486] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2490] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2494] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2498] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2502] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2505] = __ZTIy;
 HEAP32[2506] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2509] = __ZTIx;
 HEAP32[2510] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2514] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2518] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2521] = __ZTIt;
 HEAP32[2522] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2525] = __ZTIs;
 HEAP32[2526] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2529] = __ZTIm;
 HEAP32[2530] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2533] = __ZTIl;
 HEAP32[2534] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2537] = __ZTIj;
 HEAP32[2538] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2541] = __ZTIi;
 HEAP32[2542] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2545] = __ZTIh;
 HEAP32[2546] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2549] = __ZTIf;
 HEAP32[2550] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2553] = __ZTIe;
 HEAP32[2554] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2557] = __ZTId;
 HEAP32[2558] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2561] = __ZTIc;
 HEAP32[2562] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2566] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2569] = __ZTIa;
 HEAP32[2570] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2573] = __ZTIy;
 HEAP32[2574] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2577] = __ZTIx;
 HEAP32[2578] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2582] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2586] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2589] = __ZTIt;
 HEAP32[2590] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2593] = __ZTIs;
 HEAP32[2594] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2597] = __ZTIm;
 HEAP32[2598] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2601] = __ZTIl;
 HEAP32[2602] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2605] = __ZTIj;
 HEAP32[2606] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2609] = __ZTIi;
 HEAP32[2610] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2613] = __ZTIh;
 HEAP32[2614] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2617] = __ZTIf;
 HEAP32[2618] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2621] = __ZTIe;
 HEAP32[2622] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2625] = __ZTId;
 HEAP32[2626] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2629] = __ZTIc;
 HEAP32[2630] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2634] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2637] = __ZTIa;
 HEAP32[2638] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2642] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2646] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2650] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2654] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2658] = __ZTVN10__cxxabiv119__pointer_type_infoE + 8;
 HEAP32[2662] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2672] = __ZTVN10__cxxabiv117__class_type_infoE + 8;
 HEAP32[2674] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2678] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2682] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2686] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2690] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2694] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2698] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2702] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2706] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2710] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
 HEAP32[2714] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;
}
function __ZN10ime_pinyin14compare_char16EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $2 = 0, $4 = 0, $_0 = 0;
 $2 = HEAP16[$p1 >> 1] | 0;
 $4 = HEAP16[$p2 >> 1] | 0;
 if (($2 & 65535) < ($4 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 $_0 = ($2 & 65535) > ($4 & 65535) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin22cmp_scis_hz_splid_freqEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $3 = 0, $6 = 0, $13 = 0, $14 = 0, $17 = 0, $18 = 0, $23 = 0, $24 = 0, $30 = 0.0, $32 = 0.0, $_0 = 0;
 $3 = HEAP16[$p1 + 4 >> 1] | 0;
 $6 = HEAP16[$p2 + 4 >> 1] | 0;
 do {
  if (($3 & 65535) < ($6 & 65535)) {
   $_0 = -1;
  } else {
   if (($3 & 65535) > ($6 & 65535)) {
    $_0 = 1;
    break;
   }
   $13 = HEAP16[$p1 + 6 >> 1] | 0;
   $14 = $13 & 31;
   $17 = HEAP16[$p2 + 6 >> 1] | 0;
   $18 = $17 & 31;
   if (($14 & 65535) < ($18 & 65535)) {
    $_0 = -1;
    break;
   }
   if (($14 & 65535) > ($18 & 65535)) {
    $_0 = 1;
    break;
   }
   $23 = ($13 & 65535) >>> 5;
   $24 = ($17 & 65535) >>> 5;
   if (($23 & 65535) < ($24 & 65535)) {
    $_0 = -1;
    break;
   }
   if (($23 & 65535) > ($24 & 65535)) {
    $_0 = 1;
    break;
   }
   $30 = +HEAPF32[$p1 >> 2];
   $32 = +HEAPF32[$p2 >> 2];
   if ($30 > $32) {
    $_0 = -1;
    break;
   }
   $_0 = $30 < $32 | 0;
  }
 } while (0);
 return $_0 | 0;
}
function __ZN10ime_pinyin17cmp_scis_hz_splidEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $3 = 0, $6 = 0, $13 = 0, $14 = 0, $17 = 0, $18 = 0, $23 = 0, $24 = 0, $_0 = 0;
 $3 = HEAP16[$p1 + 4 >> 1] | 0;
 $6 = HEAP16[$p2 + 4 >> 1] | 0;
 if (($3 & 65535) < ($6 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 if (($3 & 65535) > ($6 & 65535)) {
  $_0 = 1;
  return $_0 | 0;
 }
 $13 = HEAP16[$p1 + 6 >> 1] | 0;
 $14 = $13 & 31;
 $17 = HEAP16[$p2 + 6 >> 1] | 0;
 $18 = $17 & 31;
 if (($14 & 65535) < ($18 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 if (($14 & 65535) > ($18 & 65535)) {
  $_0 = 1;
  return $_0 | 0;
 }
 $23 = ($13 & 65535) >>> 5;
 $24 = ($17 & 65535) >>> 5;
 if (($23 & 65535) < ($24 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 $_0 = ($23 & 65535) > ($24 & 65535) | 0;
 return $_0 | 0;
}
function _im_open_decoder($fn_sys_dict, $fn_usr_dict) {
 $fn_sys_dict = $fn_sys_dict | 0;
 $fn_usr_dict = $fn_usr_dict | 0;
 var $1 = 0, $12 = 0, $13 = 0, $_06 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) != 0) {
  __ZN10ime_pinyin12MatrixSearchD2Ev($1);
  __ZdlPv($1 | 0);
 }
 $12 = __Znwj(12504) | 0;
 $13 = $12;
 __ZN10ime_pinyin12MatrixSearchC2Ev($13);
 HEAP32[4828] = $13;
 if (($12 | 0) == 0) {
  $_06 = 0;
  return $_06 | 0;
 }
 $_06 = __ZN10ime_pinyin12MatrixSearch4initEPKcS2_($13, $fn_sys_dict, $fn_usr_dict) | 0;
 return $_06 | 0;
}
function _im_open_decoder_fd($sys_fd, $start_offset, $length, $fn_usr_dict) {
 $sys_fd = $sys_fd | 0;
 $start_offset = $start_offset | 0;
 $length = $length | 0;
 $fn_usr_dict = $fn_usr_dict | 0;
 var $1 = 0, $12 = 0, $13 = 0, $_08 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) != 0) {
  __ZN10ime_pinyin12MatrixSearchD2Ev($1);
  __ZdlPv($1 | 0);
 }
 $12 = __Znwj(12504) | 0;
 $13 = $12;
 __ZN10ime_pinyin12MatrixSearchC2Ev($13);
 HEAP32[4828] = $13;
 if (($12 | 0) == 0) {
  $_08 = 0;
  return $_08 | 0;
 }
 $_08 = __ZN10ime_pinyin12MatrixSearch7init_fdEillPKc($13, $sys_fd, $start_offset, $length, $fn_usr_dict) | 0;
 return $_08 | 0;
}
function _im_close_decoder() {
 var $1 = 0, $4 = 0;
 $1 = HEAP32[4828] | 0;
 do {
  if (($1 | 0) != 0) {
   __ZN10ime_pinyin12MatrixSearch5closeEv($1);
   $4 = HEAP32[4828] | 0;
   if (($4 | 0) == 0) {
    break;
   }
   __ZN10ime_pinyin12MatrixSearchD2Ev($4);
   __ZdlPv($4 | 0);
  }
 } while (0);
 HEAP32[4828] = 0;
 return;
}
function _im_set_max_lens($max_sps_len, $max_hzs_len) {
 $max_sps_len = $max_sps_len | 0;
 $max_hzs_len = $max_hzs_len | 0;
 var $1 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  return;
 }
 __ZN10ime_pinyin12MatrixSearch12set_max_lensEjj($1, $max_sps_len, $max_hzs_len);
 return;
}
function _im_flush_cache() {
 var $1 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  return;
 }
 __ZN10ime_pinyin12MatrixSearch11flush_cacheEv($1);
 return;
}
function _im_search($pybuf, $pylen) {
 $pybuf = $pybuf | 0;
 $pylen = $pylen | 0;
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin12MatrixSearch6searchEPKcj($1, $pybuf, $pylen) | 0;
 $_0 = __ZN10ime_pinyin12MatrixSearch17get_candidate_numEv(HEAP32[4828] | 0) | 0;
 return $_0 | 0;
}
function _im_delsearch($pos, $is_pos_in_splid, $clear_fixed_this_step) {
 $pos = $pos | 0;
 $is_pos_in_splid = $is_pos_in_splid | 0;
 $clear_fixed_this_step = $clear_fixed_this_step | 0;
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin12MatrixSearch9delsearchEjbb($1, $pos, $is_pos_in_splid, $clear_fixed_this_step) | 0;
 $_0 = __ZN10ime_pinyin12MatrixSearch17get_candidate_numEv(HEAP32[4828] | 0) | 0;
 return $_0 | 0;
}
function _im_reset_search() {
 var $1 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  return;
 }
 __ZN10ime_pinyin12MatrixSearch12reset_searchEv($1) | 0;
 return;
}
function _im_get_sps_str($decoded_len) {
 $decoded_len = $decoded_len | 0;
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch9get_pystrEPj($1, $decoded_len) | 0;
 return $_0 | 0;
}
function _im_get_candidate($cand_id, $cand_str, $max_len) {
 $cand_id = $cand_id | 0;
 $cand_str = $cand_str | 0;
 $max_len = $max_len | 0;
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch13get_candidateEjPtj($1, $cand_id, $cand_str, $max_len) | 0;
 return $_0 | 0;
}
function _toUTF8($src, $length) {
 $src = $src | 0;
 $length = $length | 0;
 var $utf16Start = 0, $utf8Start = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $utf16Start = sp | 0;
 $utf8Start = sp + 8 | 0;
 HEAP32[$utf16Start >> 2] = $src;
 HEAP32[$utf8Start >> 2] = 19320;
 _ConvertUTF16toUTF8($utf16Start, $src + ($length << 1) | 0, $utf8Start, 20344, 0) | 0;
 STACKTOP = sp;
 return 19320 | 0;
}
function _im_get_candidate_char($cand_id) {
 $cand_id = $cand_id | 0;
 var $1 = 0, $4 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128 | 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $4 = sp | 0;
 __ZN10ime_pinyin12MatrixSearch13get_candidateEjPtj($1, $cand_id, $4, 64) | 0;
 _toUTF8($4, 64) | 0;
 $_0 = 19320;
 STACKTOP = sp;
 return $_0 | 0;
}
function _im_get_spl_start_pos($spl_start) {
 $spl_start = $spl_start | 0;
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch13get_spl_startERPKt($1, $spl_start) | 0;
 return $_0 | 0;
}
function _im_choose($choice_id) {
 $choice_id = $choice_id | 0;
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch6chooseEj($1, $choice_id) | 0;
 return $_0 | 0;
}
function _im_cancel_last_choice() {
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch18cancel_last_choiceEv($1) | 0;
 return $_0 | 0;
}
function _im_get_fixed_len() {
 var $1 = 0, $_0 = 0;
 $1 = HEAP32[4828] | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch12get_fixedlenEv($1) | 0;
 return $_0 | 0;
}
function _im_get_predicts($his_buf, $pre_buf) {
 $his_buf = $his_buf | 0;
 $pre_buf = $pre_buf | 0;
 var $_0 = 0;
 if (($his_buf | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 _utf16_strlen($his_buf) | 0;
 HEAP32[$pre_buf >> 2] = 11272;
 $_0 = __ZN10ime_pinyin12MatrixSearch12get_predictsEPKtPA8_tj(HEAP32[4828] | 0, $his_buf, 11272, 500) | 0;
 return $_0 | 0;
}
function _im_enable_shm_as_szm($enable) {
 $enable = $enable | 0;
 __ZN10ime_pinyin12SpellingTrie14szm_enable_shmEb(__ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0, $enable);
 return;
}
function _im_enable_ym_as_szm($enable) {
 $enable = $enable | 0;
 __ZN10ime_pinyin12SpellingTrie13szm_enable_ymEb(__ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0, $enable);
 return;
}
function __ZN10ime_pinyin19cmp_lemma_entry_hzsEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $2 = 0, $3 = 0, $5 = 0, $6 = 0, $_0 = 0;
 $2 = $p1 + 8 | 0;
 $3 = _utf16_strlen($2) | 0;
 $5 = $p2 + 8 | 0;
 $6 = _utf16_strlen($5) | 0;
 if ($3 >>> 0 < $6 >>> 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 if ($3 >>> 0 > $6 >>> 0) {
  $_0 = 1;
  return $_0 | 0;
 }
 $_0 = _utf16_strcmp($2, $5) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin10compare_pyEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $5 = 0, $_0 = 0;
 $5 = _utf16_strcmp($p1 + 42 | 0, $p2 + 42 | 0) | 0;
 if (($5 | 0) != 0) {
  $_0 = $5;
  return $_0 | 0;
 }
 $_0 = ~~+HEAPF32[$p2 + 120 >> 2] - ~~+HEAPF32[$p1 + 120 >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin22cmp_lemma_entry_hzspysEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $2 = 0, $3 = 0, $5 = 0, $6 = 0, $11 = 0, $_0 = 0;
 $2 = $p1 + 8 | 0;
 $3 = _utf16_strlen($2) | 0;
 $5 = $p2 + 8 | 0;
 $6 = _utf16_strlen($5) | 0;
 if ($3 >>> 0 < $6 >>> 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 if ($3 >>> 0 > $6 >>> 0) {
  $_0 = 1;
  return $_0 | 0;
 }
 $11 = _utf16_strcmp($2, $5) | 0;
 if (($11 | 0) != 0) {
  $_0 = $11;
  return $_0 | 0;
 }
 $_0 = _utf16_strcmp($p1 + 42 | 0, $p2 + 42 | 0) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin14compare_splid2EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strcmp($p1 + 42 | 0, $p2 + 42 | 0) | 0;
}
function __ZN10ime_pinyin11DictBuilderC2Ev($this) {
 $this = $this | 0;
 _memset($this | 0, 0, 60);
 return;
}
function __ZN10ime_pinyin11DictBuilderD2Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
 return;
}
function __ZN10ime_pinyin11DictBuilder13free_resourceEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $7 = 0, $8 = 0, $13 = 0, $14 = 0, $20 = 0, $26 = 0, $31 = 0, $32 = 0, $41 = 0, $42 = 0;
 $1 = $this | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) != 0) {
  __ZdaPv($2);
 }
 $7 = $this + 8 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 if (($8 | 0) != 0) {
  __ZdaPv($8);
 }
 $13 = $this + 16 | 0;
 $14 = HEAP32[$13 >> 2] | 0;
 if (($14 | 0) != 0) {
  __ZdaPv($14);
 }
 $20 = HEAP32[$this + 20 >> 2] | 0;
 if (($20 | 0) != 0) {
  __ZdaPv($20);
 }
 $26 = HEAP32[$this + 32 >> 2] | 0;
 if (($26 | 0) != 0) {
  __ZdaPv($26);
 }
 $31 = $this + 52 | 0;
 $32 = HEAP32[$31 >> 2] | 0;
 if (($32 | 0) != 0) {
  __ZN10ime_pinyin13SpellingTableD2Ev($32);
  __ZdlPv($32 | 0);
 }
 $41 = $this + 56 | 0;
 $42 = HEAP32[$41 >> 2] | 0;
 if (($42 | 0) != 0) {
  __ZdlPv($42);
 }
 HEAP32[$1 >> 2] = 0;
 HEAP32[$7 >> 2] = 0;
 HEAP32[$31 >> 2] = 0;
 HEAP32[$41 >> 2] = 0;
 HEAP32[$this + 4 >> 2] = 0;
 _memset($13 | 0, 0, 28);
 return;
}
function __ZN10ime_pinyin11DictBuilder14alloc_resourceEj($this, $lma_num) {
 $this = $this | 0;
 $lma_num = $lma_num | 0;
 var $3 = 0, $4$0 = 0, $10 = 0, $14 = 0, $16 = 0, $17 = 0, $18$0 = 0, $24 = 0, $28 = 0, $31$0 = 0, $37 = 0, $39$0 = 0, $45 = 0, $47 = 0, $49 = 0, $50 = 0, $51 = 0, $54 = 0, $102 = 0, $_07 = 0;
 if (($lma_num | 0) == 0) {
  $_07 = 0;
  return $_07 | 0;
 }
 __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
 $3 = $this + 4 | 0;
 HEAP32[$3 >> 2] = $lma_num;
 $4$0 = _llvm_umul_with_overflow_i32($lma_num | 0, 124) | 0;
 $10 = $this | 0;
 HEAP32[$10 >> 2] = __Znaj(tempRet0 ? -1 : $4$0) | 0;
 HEAP32[$this + 48 >> 2] = 0;
 $14 = $this + 44 | 0;
 HEAP32[$14 >> 2] = __Znaj(1240) | 0;
 $16 = HEAP32[$3 >> 2] << 3;
 $17 = $this + 12 | 0;
 HEAP32[$17 >> 2] = $16;
 $18$0 = _llvm_umul_with_overflow_i32($16 | 0, 8) | 0;
 $24 = $this + 8 | 0;
 HEAP32[$24 >> 2] = __Znaj(tempRet0 ? -1 : $18$0) | 0;
 HEAP32[$this + 24 >> 2] = 0;
 $28 = $this + 16 | 0;
 HEAP32[$28 >> 2] = __Znaj(7728) | 0;
 HEAP32[$this + 28 >> 2] = 0;
 $31$0 = _llvm_umul_with_overflow_i32(HEAP32[$3 >> 2] | 0, 10) | 0;
 $37 = $this + 20 | 0;
 HEAP32[$37 >> 2] = __Znaj(tempRet0 ? -1 : $31$0) | 0;
 $39$0 = _llvm_umul_with_overflow_i32(HEAP32[$3 >> 2] | 0, 4) | 0;
 $45 = $this + 32 | 0;
 HEAP32[$45 >> 2] = __Znaj(tempRet0 ? -1 : $39$0) | 0;
 $47 = __Znwj(56) | 0;
 __ZN10ime_pinyin13SpellingTableC2Ev($47);
 $49 = $this + 52 | 0;
 HEAP32[$49 >> 2] = $47;
 $50 = __Znwj(4) | 0;
 $51 = $50;
 __ZN10ime_pinyin14SpellingParserC2Ev($51);
 HEAP32[$this + 56 >> 2] = $51;
 $54 = HEAP32[$10 >> 2] | 0;
 do {
  if (($54 | 0) != 0) {
   if ((HEAP32[$14 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$24 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$49 >> 2] | 0) == 0 | ($50 | 0) == 0) {
    break;
   }
   if ((HEAP32[$28 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$37 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$45 >> 2] | 0) == 0) {
    break;
   }
   _memset($54 | 0, 0, (HEAP32[$3 >> 2] | 0) * 124 | 0 | 0);
   _memset(HEAP32[$24 >> 2] | 0, 0, HEAP32[$17 >> 2] << 3 | 0);
   _memset(HEAP32[$28 >> 2] | 0, 0, 7728);
   _memset(HEAP32[$37 >> 2] | 0, 0, (HEAP32[$3 >> 2] | 0) * 10 | 0 | 0);
   _memset(HEAP32[$45 >> 2] | 0, 0, HEAP32[$3 >> 2] << 2 | 0);
   $102 = HEAP32[$49 >> 2] | 0;
   __ZN10ime_pinyin13SpellingTable10init_tableEjjb($102, 6, 2e3, 1) | 0;
   $_07 = 1;
   return $_07 | 0;
  }
 } while (0);
 __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
 $_07 = 0;
 return $_07 | 0;
}
function __ZN10ime_pinyin11DictBuilder18str_in_hanzis_listEPKtjS2_j($this, $hzs, $hzs_len, $str, $str_len) {
 $this = $this | 0;
 $hzs = $hzs | 0;
 $hzs_len = $hzs_len | 0;
 $str = $str | 0;
 $str_len = $str_len | 0;
 var $pos_0 = 0, $_0 = 0, label = 0;
 if (($hzs | 0) == 0 | ($str | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $pos_0 = 0;
 }
 while (1) {
  if ($pos_0 >>> 0 >= $str_len >>> 0) {
   $_0 = 1;
   label = 190;
   break;
  }
  if (__ZN10ime_pinyin11DictBuilder17hz_in_hanzis_listEPKtjt(0, $hzs, $hzs_len, HEAP16[$str + ($pos_0 << 1) >> 1] | 0) | 0) {
   $pos_0 = $pos_0 + 1 | 0;
  } else {
   $_0 = 0;
   label = 192;
   break;
  }
 }
 if ((label | 0) == 190) {
  return $_0 | 0;
 } else if ((label | 0) == 192) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin11DictBuilder17read_valid_hanzisEPKcPj($this, $fn_validhzs, $num) {
 $this = $this | 0;
 $fn_validhzs = $fn_validhzs | 0;
 $num = $num | 0;
 var $utf16header = 0, $4 = 0, $9 = 0, $17 = 0, $21 = 0, $22$0 = 0, $26 = 0, $34 = 0, $36 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $utf16header = sp | 0;
 if (($fn_validhzs | 0) == 0 | ($num | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 HEAP32[$num >> 2] = 0;
 $4 = _fopen($fn_validhzs | 0, 4440) | 0;
 if (($4 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $9 = (_fread($utf16header | 0, 2, 1, $4 | 0) | 0) == 1;
 if (!($9 & (HEAP16[$utf16header >> 1] | 0) == -257)) {
  _fclose($4 | 0) | 0;
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 _fseek($4 | 0, 0, 2) | 0;
 $17 = (_ftell($4 | 0) | 0) >>> 1;
 HEAP32[$num >> 2] = $17;
 if (($17 | 0) == 0) {
  ___assert_func(4408, 240, 7456, 3040);
  return 0;
 }
 $21 = $17 - 1 | 0;
 HEAP32[$num >> 2] = $21;
 $22$0 = _llvm_umul_with_overflow_i32($21 | 0, 2) | 0;
 $26 = __Znaj(tempRet0 ? -1 : $22$0) | 0;
 if (($26 | 0) == 0) {
  _fclose($4 | 0) | 0;
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 _fseek($4 | 0, 2, 0) | 0;
 $34 = _fread($26 | 0, 2, HEAP32[$num >> 2] | 0, $4 | 0) | 0;
 $36 = ($34 | 0) == (HEAP32[$num >> 2] | 0);
 _fclose($4 | 0) | 0;
 if ($36) {
  __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($26, HEAP32[$num >> 2] | 0, 2, 26);
  $_0 = $26;
  STACKTOP = sp;
  return $_0 | 0;
 } else {
  __ZdaPv($26);
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin11DictBuilder17hz_in_hanzis_listEPKtjt($this, $hzs, $hzs_len, $hz) {
 $this = $this | 0;
 $hzs = $hzs | 0;
 $hzs_len = $hzs_len | 0;
 $hz = $hz | 0;
 var $1 = 0, $6 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $1 = sp | 0;
 HEAP16[$1 >> 1] = $hz;
 if (($hzs | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $6 = __ZN10ime_pinyin9mybsearchEPKvS1_jjPFiS1_S1_E($1, $hzs, $hzs_len, 2, 26) | 0;
 if (($6 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if ((HEAP16[$6 >> 1] | 0) == (HEAP16[$1 >> 1] | 0)) {
  $_0 = 1;
  STACKTOP = sp;
  return $_0 | 0;
 } else {
  ___assert_func(4408, 273, 7536, 2128);
  return 0;
 }
 return 0;
}
function __ZN10ime_pinyin11DictBuilder19format_spelling_strEPc($this, $spl_str) {
 $this = $this | 0;
 $spl_str = $spl_str | 0;
 var $2 = 0, $4 = 0, $5 = 0, $pos_020 = 0, $15 = 0;
 if (($spl_str | 0) == 0) {
  return;
 }
 $2 = HEAP8[$spl_str] | 0;
 if ($2 << 24 >> 24 == 0) {
  return;
 } else {
  $pos_020 = 0;
  $5 = $spl_str;
  $4 = $2;
 }
 do {
  if (($4 - 97 & 255) < 26) {
   HEAP8[$5] = $4 - 32 & 255;
  }
  do {
   if ($pos_020 << 16 >> 16 == 1) {
    if ((HEAP8[$5] | 0) != 72) {
     break;
    }
    $15 = HEAP8[$spl_str] | 0;
    if (!(($15 << 24 >> 24 | 0) == 67 | ($15 << 24 >> 24 | 0) == 83 | ($15 << 24 >> 24 | 0) == 90)) {
     break;
    }
    HEAP8[$5] = 104;
   }
  } while (0);
  $pos_020 = $pos_020 + 1 & 65535;
  $5 = $spl_str + ($pos_020 & 65535) | 0;
  $4 = HEAP8[$5] | 0;
 } while ($4 << 24 >> 24 != 0);
 return;
}
function __ZN10ime_pinyin11DictBuilder17sort_lemmas_by_hzEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $5 = 0, $6 = 0, $i_09 = 0, $idx_max_08 = 0, $14 = 0, $21 = 0, $phitmp = 0, $_0 = 0;
 $1 = $this | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = $this + 4 | 0;
 $6 = HEAP32[$5 >> 2] | 0;
 if (($6 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($2, $6, 124, 24);
 HEAP32[(HEAP32[$1 >> 2] | 0) + 4 >> 2] = 1;
 if ((HEAP32[$5 >> 2] | 0) >>> 0 > 1) {
  $idx_max_08 = 2;
  $i_09 = 1;
 } else {
  $_0 = 2;
  return $_0 | 0;
 }
 while (1) {
  $14 = HEAP32[$1 >> 2] | 0;
  _utf16_strcmp($14 + ($i_09 * 124 | 0) + 8 | 0, $14 + (($i_09 - 1 | 0) * 124 | 0) + 8 | 0) | 0;
  HEAP32[(HEAP32[$1 >> 2] | 0) + ($i_09 * 124 | 0) + 4 >> 2] = $idx_max_08;
  $21 = $i_09 + 1 | 0;
  $phitmp = $idx_max_08 + 1 | 0;
  if ($21 >>> 0 < (HEAP32[$5 >> 2] | 0) >>> 0) {
   $idx_max_08 = $phitmp;
   $i_09 = $21;
  } else {
   $_0 = $phitmp;
   break;
  }
 }
 return $_0 | 0;
}
function __ZN10ime_pinyin11DictBuilder14get_top_lemmasEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $5 = 0, $8 = 0, $9 = 0, $pos_015 = 0, $11 = 0, $17 = 0, $18 = 0, $20 = 0, $21 = 0, $25 = 0, $29 = 0, $move_pos_0_in = 0, $move_pos_0 = 0, $38 = 0, $40 = 0, $42 = 0, $43 = 0, $59 = 0, $60 = 0, $64 = 0, $65 = 0, $69 = 0, label = 0;
 $1 = $this + 48 | 0;
 HEAP32[$1 >> 2] = 0;
 $2 = $this | 0;
 if ((HEAP32[$2 >> 2] | 0) == 0) {
  return;
 }
 $5 = $this + 4 | 0;
 if ((HEAP32[$5 >> 2] | 0) == 0) {
  return;
 }
 $8 = $this + 44 | 0;
 $9 = $this + 44 | 0;
 $pos_015 = 0;
 L271 : while (1) {
  $11 = HEAP32[$1 >> 2] | 0;
  do {
   if (($11 | 0) == 0) {
    $17 = HEAP32[$8 >> 2] | 0;
    $18 = (HEAP32[$2 >> 2] | 0) + ($pos_015 * 124 | 0) | 0;
    _memcpy($17 | 0, $18 | 0, 124) | 0;
    HEAP32[$1 >> 2] = 1;
   } else {
    $20 = HEAP32[$2 >> 2] | 0;
    $21 = $20 + ($pos_015 * 124 | 0) | 0;
    $25 = HEAP32[$9 >> 2] | 0;
    $29 = $11 >>> 0 < 10;
    if (+HEAPF32[$20 + ($pos_015 * 124 | 0) + 120 >> 2] <= +HEAPF32[$25 + (($11 - 1 | 0) * 124 | 0) + 120 >> 2]) {
     if (!$29) {
      break;
     }
     $64 = $25 + ($11 * 124 | 0) | 0;
     $65 = $21;
     _memcpy($64 | 0, $65 | 0, 124) | 0;
     HEAP32[$1 >> 2] = (HEAP32[$1 >> 2] | 0) + 1;
     break;
    }
    if ($29) {
     HEAP32[$1 >> 2] = $11 + 1;
    }
    $move_pos_0_in = HEAP32[$1 >> 2] | 0;
    while (1) {
     $move_pos_0 = $move_pos_0_in - 1 | 0;
     if (($move_pos_0 | 0) == 0) {
      label = 253;
      break L271;
     }
     $38 = HEAP32[$9 >> 2] | 0;
     $40 = $move_pos_0_in - 2 | 0;
     $42 = $38 + ($move_pos_0 * 124 | 0) | 0;
     $43 = $38 + ($40 * 124 | 0) | 0;
     _memcpy($42 | 0, $43 | 0, 124) | 0;
     if (($40 | 0) == 0) {
      break;
     }
     if (+HEAPF32[(HEAP32[$9 >> 2] | 0) + (($move_pos_0_in - 3 | 0) * 124 | 0) + 120 >> 2] > +HEAPF32[(HEAP32[$2 >> 2] | 0) + ($pos_015 * 124 | 0) + 120 >> 2]) {
      break;
     } else {
      $move_pos_0_in = $move_pos_0;
     }
    }
    $59 = (HEAP32[$9 >> 2] | 0) + ($40 * 124 | 0) | 0;
    $60 = (HEAP32[$2 >> 2] | 0) + ($pos_015 * 124 | 0) | 0;
    _memcpy($59 | 0, $60 | 0, 124) | 0;
   }
  } while (0);
  $69 = $pos_015 + 1 | 0;
  if ($69 >>> 0 < (HEAP32[$5 >> 2] | 0) >>> 0) {
   $pos_015 = $69;
  } else {
   label = 261;
   break;
  }
 }
 if ((label | 0) == 253) {
  ___assert_func(4408, 315, 7728, 1616);
 } else if ((label | 0) == 261) {
  return;
 }
}
function __ZN10ime_pinyin11DictBuilder13read_raw_dictEPKcS2_j($this, $fn_raw, $fn_validhzs, $max_item) {
 $this = $this | 0;
 $fn_raw = $fn_raw | 0;
 $fn_validhzs = $fn_validhzs | 0;
 $max_item = $max_item | 0;
 var $utf16_reader = 0, $read_buf = 0, $valid_hzs_num = 0, $token_size = 0, $to_tokenize = 0, $11 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $i_049 = 0, $22 = 0, $29 = 0, $40 = 0, $48 = 0, $55 = 0.0, $69 = 0, $75 = 0, $78 = 0, $85 = 0, $hz_pos_0 = 0, $101 = 0, $121 = 0, $spelling_not_support_0_off0 = 0, $i_1 = 0, $136 = 0, $lemma_num_0 = 0, $_0 = 0, $_1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 1072 | 0;
 $utf16_reader = sp | 0;
 $read_buf = sp + 24 | 0;
 $valid_hzs_num = sp + 1048 | 0;
 $token_size = sp + 1056 | 0;
 $to_tokenize = sp + 1064 | 0;
 if (($fn_raw | 0) == 0) {
  $_1 = 0;
  STACKTOP = sp;
  return $_1 | 0;
 }
 __ZN10ime_pinyin11Utf16ReaderC2Ev($utf16_reader);
 L297 : do {
  if (__ZN10ime_pinyin11Utf16Reader4openEPKcj($utf16_reader, $fn_raw, 5120) | 0) {
   if (!(__ZN10ime_pinyin11DictBuilder14alloc_resourceEj($this, 24e4) | 0)) {
    __ZN10ime_pinyin11Utf16Reader5closeEv($utf16_reader) | 0;
   }
   HEAP32[$valid_hzs_num >> 2] = 0;
   $11 = __ZN10ime_pinyin11DictBuilder17read_valid_hanzisEPKcPj(0, $fn_validhzs, $valid_hzs_num) | 0;
   L304 : do {
    if (($max_item | 0) == 0) {
     $lemma_num_0 = 24e4;
    } else {
     $13 = $read_buf | 0;
     $14 = $this | 0;
     $15 = ($11 | 0) == 0;
     $16 = $this + 52 | 0;
     $i_049 = 0;
     L306 : while (1) {
      if ((__ZN10ime_pinyin11Utf16Reader8readlineEPtj($utf16_reader, $13, 512) | 0) == 0) {
       $lemma_num_0 = $i_049;
       break L304;
      }
      HEAP32[$to_tokenize >> 2] = $13;
      $22 = _utf16_strtok($13, $token_size, $to_tokenize) | 0;
      if (($22 | 0) == 0) {
       label = 279;
       break;
      }
      $29 = _utf16_strlen($22) | 0;
      L313 : do {
       if ($29 >>> 0 > 8) {
        $i_1 = $i_049 - 1 | 0;
       } else {
        if ($29 >>> 0 > 4) {
         $i_1 = $i_049 - 1 | 0;
         break;
        }
        $40 = (HEAP32[$14 >> 2] | 0) + ($i_049 * 124 | 0) + 8 | 0;
        _utf16_strcpy($40, $22) | 0;
        HEAP8[(HEAP32[$14 >> 2] | 0) + ($i_049 * 124 | 0) + 116 | 0] = HEAP32[$token_size >> 2] & 255;
        $48 = _utf16_strtok(HEAP32[$to_tokenize >> 2] | 0, $token_size, $to_tokenize) | 0;
        if (($48 | 0) == 0) {
         label = 289;
         break L306;
        }
        $55 = +_utf16_atof($48);
        HEAPF32[(HEAP32[$14 >> 2] | 0) + ($i_049 * 124 | 0) + 120 >> 2] = $55;
        do {
         if ($29 >>> 0 > 1) {
          if (+HEAPF32[(HEAP32[$14 >> 2] | 0) + ($i_049 * 124 | 0) + 120 >> 2] >= 60.0) {
           break;
          }
          $i_1 = $i_049 - 1 | 0;
          break L313;
         }
        } while (0);
        $69 = _utf16_strtok(HEAP32[$to_tokenize >> 2] | 0, $token_size, $to_tokenize) | 0;
        if (($69 | 0) == 0) {
         label = 297;
         break L306;
        }
        $75 = _utf16_atoi($69) | 0;
        do {
         if ($15) {
          label = 302;
         } else {
          $78 = HEAP32[$valid_hzs_num >> 2] | 0;
          if (($78 | 0) == 0) {
           label = 302;
           break;
          }
          $85 = HEAP32[$14 >> 2] | 0;
          if (__ZN10ime_pinyin11DictBuilder18str_in_hanzis_listEPKtjS2_j(0, $11, $78, $85 + ($i_049 * 124 | 0) + 8 | 0, HEAPU8[$85 + ($i_049 * 124 | 0) + 116 | 0] | 0) | 0) {
           $hz_pos_0 = 0;
           break;
          }
          $i_1 = $i_049 - 1 | 0;
          break L313;
         }
        } while (0);
        do {
         if ((label | 0) == 302) {
          label = 0;
          if (($75 | 0) == 0) {
           $hz_pos_0 = 0;
           break;
          }
          $i_1 = $i_049 - 1 | 0;
          break L313;
         }
        } while (0);
        while (1) {
         if ($hz_pos_0 >>> 0 >= (HEAPU8[(HEAP32[$14 >> 2] | 0) + ($i_049 * 124 | 0) + 116 | 0] | 0) >>> 0) {
          $spelling_not_support_0_off0 = 1;
          break;
         }
         $101 = _utf16_strtok(HEAP32[$to_tokenize >> 2] | 0, $token_size, $to_tokenize) | 0;
         if (($101 | 0) == 0) {
          label = 310;
          break L306;
         }
         if ((_utf16_strlen($101) | 0) >>> 0 >= 7) {
          label = 314;
          break L306;
         }
         _utf16_strcpy_tochar((HEAP32[$14 >> 2] | 0) + ($i_049 * 124 | 0) + 60 + ($hz_pos_0 * 7 | 0) | 0, $101) | 0;
         __ZN10ime_pinyin11DictBuilder19format_spelling_strEPc(0, (HEAP32[$14 >> 2] | 0) + ($i_049 * 124 | 0) + 60 + ($hz_pos_0 * 7 | 0) | 0);
         $121 = HEAP32[$14 >> 2] | 0;
         if (__ZN10ime_pinyin13SpellingTable12put_spellingEPKcd(HEAP32[$16 >> 2] | 0, $121 + ($i_049 * 124 | 0) + 60 + ($hz_pos_0 * 7 | 0) | 0, +HEAPF32[$121 + ($i_049 * 124 | 0) + 120 >> 2]) | 0) {
          $hz_pos_0 = $hz_pos_0 + 1 | 0;
         } else {
          $spelling_not_support_0_off0 = 0;
          break;
         }
        }
        $i_1 = (($spelling_not_support_0_off0 & (_utf16_strtok(HEAP32[$to_tokenize >> 2] | 0, $token_size, $to_tokenize) | 0) == 0 ^ 1) << 31 >> 31) + $i_049 | 0;
       }
      } while (0);
      $136 = $i_1 + 1 | 0;
      if ($136 >>> 0 < $max_item >>> 0) {
       $i_049 = $136;
      } else {
       $lemma_num_0 = 24e4;
       break L304;
      }
     }
     if ((label | 0) == 289) {
      __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
      __ZN10ime_pinyin11Utf16Reader5closeEv($utf16_reader) | 0;
      $_0 = 0;
      break L297;
     } else if ((label | 0) == 279) {
      __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
      __ZN10ime_pinyin11Utf16Reader5closeEv($utf16_reader) | 0;
      $_0 = 0;
      break L297;
     } else if ((label | 0) == 297) {
      ___assert_func(4408, 448, 7776, 1344);
      return 0;
     } else if ((label | 0) == 310) {
      __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
      __ZN10ime_pinyin11Utf16Reader5closeEv($utf16_reader) | 0;
      $_0 = 0;
      break L297;
     } else if ((label | 0) == 314) {
      ___assert_func(4408, 475, 7776, 1096);
      return 0;
     }
    }
   } while (0);
   if (($11 | 0) != 0) {
    __ZdaPv($11);
   }
   __ZN10ime_pinyin11Utf16Reader5closeEv($utf16_reader) | 0;
   $_0 = $lemma_num_0;
  } else {
   $_0 = 0;
  }
 } while (0);
 __ZN10ime_pinyin11Utf16ReaderD2Ev($utf16_reader);
 $_1 = $_0;
 STACKTOP = sp;
 return $_1 | 0;
}
function __ZN10ime_pinyin11DictBuilder10build_dictEPKcS2_PNS_8DictTrieE($this, $fn_raw, $fn_validhzs, $dict_trie) {
 $this = $this | 0;
 $fn_raw = $fn_raw | 0;
 $fn_validhzs = $fn_validhzs | 0;
 $dict_trie = $dict_trie | 0;
 var $spl_item_size = 0, $spl_num = 0, $is_pre = 0, $4 = 0, $5 = 0, $8 = 0, $10 = 0, $14 = 0, $15 = 0, $16 = 0, $18 = 0.0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $i_054 = 0, $hz_pos_050 = 0, $33 = 0, $35 = 0, $64 = 0, $66 = 0, $72 = 0, $80 = 0, $81 = 0, $82 = 0, $91 = 0, $92 = 0, $97 = 0, $101$0 = 0, $107 = 0, $108 = 0, $110$0 = 0, $116 = 0, $117 = 0, $119 = 0, $122 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $143 = 0, $145 = 0, $147 = 0, $149 = 0, $152 = 0, $154 = 0, $159 = 0, $_lcssa = 0, $161 = 0, $pos_046 = 0, $169 = 0, $172 = 0, $pos1_045 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40 | 0;
 $spl_item_size = sp | 0;
 $spl_num = sp + 8 | 0;
 $is_pre = sp + 32 | 0;
 if (($fn_raw | 0) == 0 | ($dict_trie | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $4 = __ZN10ime_pinyin11DictBuilder13read_raw_dictEPKcS2_j($this, $fn_raw, $fn_validhzs, 24e4) | 0;
 $5 = $this + 4 | 0;
 HEAP32[$5 >> 2] = $4;
 if (($4 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $8 = $this + 52 | 0;
 $10 = __ZN10ime_pinyin13SpellingTable7arrangeEPjS1_(HEAP32[$8 >> 2] | 0, $spl_item_size, $spl_num) | 0;
 if (($10 | 0) == 0) {
  __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $14 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $15 = HEAP32[$spl_item_size >> 2] | 0;
 $16 = HEAP32[$spl_num >> 2] | 0;
 $18 = +__ZN10ime_pinyin13SpellingTable19get_score_amplifierEv(HEAP32[$8 >> 2] | 0);
 if (!(__ZN10ime_pinyin12SpellingTrie9constructEPKcjjfh($14, $10, $15, $16, $18, __ZN10ime_pinyin13SpellingTable17get_average_scoreEv(HEAP32[$8 >> 2] | 0) | 0) | 0)) {
  __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 L382 : do {
  if ((HEAP32[$5 >> 2] | 0) != 0) {
   $24 = $this | 0;
   $25 = $this + 56 | 0;
   $26 = sp + 16 | 0;
   $27 = sp + 24 | 0;
   $i_054 = 0;
   L384 : while (1) {
    if ((HEAP8[(HEAP32[$24 >> 2] | 0) + ($i_054 * 124 | 0) + 116 | 0] | 0) != 0) {
     $hz_pos_050 = 0;
     do {
      HEAP8[$is_pre] = 1;
      $33 = HEAP32[$25 >> 2] | 0;
      $35 = (HEAP32[$24 >> 2] | 0) + ($i_054 * 124 | 0) + 60 + ($hz_pos_050 * 7 | 0) | 0;
      if ((__ZN10ime_pinyin14SpellingParser14splstr_to_idxsEPKctPtS3_tRb($33, $35, (_strlen($35 | 0) | 0) & 65535, $26, $27, 2, $is_pre) | 0) << 16 >> 16 != 1) {
       label = 341;
       break L384;
      }
      if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt($14, HEAP16[$26 >> 1] | 0) | 0) {
       if ((__ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt($14, HEAP16[$26 >> 1] | 0, $26) | 0) << 16 >> 16 == 0) {
        label = 344;
        break L384;
       }
      }
      HEAP16[(HEAP32[$24 >> 2] | 0) + ($i_054 * 124 | 0) + 42 + ($hz_pos_050 << 1) >> 1] = HEAP16[$26 >> 1] | 0;
      $hz_pos_050 = $hz_pos_050 + 1 | 0;
     } while ($hz_pos_050 >>> 0 < (HEAPU8[(HEAP32[$24 >> 2] | 0) + ($i_054 * 124 | 0) + 116 | 0] | 0) >>> 0);
    }
    $i_054 = $i_054 + 1 | 0;
    if ($i_054 >>> 0 >= (HEAP32[$5 >> 2] | 0) >>> 0) {
     break L382;
    }
   }
   if ((label | 0) == 344) {
    ___assert_func(4408, 556, 7912, 752);
    return 0;
   } else if ((label | 0) == 341) {
    ___assert_func(4408, 552, 7912, 920);
    return 0;
   }
  }
 } while (0);
 __ZN10ime_pinyin11DictBuilder17sort_lemmas_by_hzEv($this) | 0;
 $64 = $this + 12 | 0;
 HEAP32[$64 >> 2] = __ZN10ime_pinyin11DictBuilder10build_scisEv($this) | 0;
 $66 = __Znwj(128) | 0;
 __ZN10ime_pinyin8DictListC2Ev($66);
 HEAP32[$dict_trie + 4 >> 2] = $66;
 $72 = $this | 0;
 if (!(__ZN10ime_pinyin8DictList9init_listEPKNS_14SingleCharItemEjPKNS_10LemmaEntryEj($66, HEAP32[$this + 8 >> 2] | 0, HEAP32[$64 >> 2] | 0, HEAP32[$72 >> 2] | 0, HEAP32[$5 >> 2] | 0) | 0)) {
  ___assert_func(4408, 572, 7912, 600);
  return 0;
 }
 $80 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 $81 = HEAP32[$72 >> 2] | 0;
 $82 = HEAP32[$5 >> 2] | 0;
 __ZN10ime_pinyin5NGram13build_unigramEPNS_10LemmaEntryEjj($80, $81, $82, (HEAP32[$81 + (($82 - 1 | 0) * 124 | 0) + 4 >> 2] | 0) + 1 | 0) | 0;
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E(HEAP32[$72 >> 2] | 0, HEAP32[$5 >> 2] | 0, 124, 6);
 __ZN10ime_pinyin11DictBuilder14get_top_lemmasEv($this);
 __ZN10ime_pinyin11DictBuilder9stat_initEv($this);
 $91 = $this + 24 | 0;
 HEAP32[$91 >> 2] = 1;
 $92 = $this + 16 | 0;
 $97 = __ZN10ime_pinyin11DictBuilder16construct_subsetEPvPNS_10LemmaEntryEjjj($this, HEAP32[$92 >> 2] | 0, HEAP32[$72 >> 2] | 0, 0, HEAP32[$5 >> 2] | 0, 0) | 0;
 if (!$97) {
  __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $101$0 = _llvm_umul_with_overflow_i32(HEAP32[$91 >> 2] | 0, 16) | 0;
 $107 = $dict_trie + 12 | 0;
 HEAP32[$107 >> 2] = __Znaj(tempRet0 ? -1 : $101$0) | 0;
 $108 = $this + 28 | 0;
 $110$0 = _llvm_umul_with_overflow_i32(HEAP32[$108 >> 2] | 0, 10) | 0;
 $116 = $dict_trie + 16 | 0;
 HEAP32[$116 >> 2] = __Znaj(tempRet0 ? -1 : $110$0) | 0;
 $117 = $this + 36 | 0;
 $119 = $this + 40 | 0;
 $122 = $this + 48 | 0;
 $124 = (HEAP32[$119 >> 2] | 0) + (HEAP32[$117 >> 2] | 0) + (HEAP32[$122 >> 2] | 0) | 0;
 $125 = $124 * 3 | 0;
 $126 = __Znaj($125) | 0;
 $127 = $dict_trie + 32 | 0;
 HEAP32[$127 >> 2] = $126;
 if ((HEAP32[$107 >> 2] | 0) == 0) {
  ___assert_func(4408, 606, 7912, 4376);
  return 0;
 }
 if (($126 | 0) == 0) {
  ___assert_func(4408, 607, 7912, 4256);
  return 0;
 }
 HEAP32[$dict_trie + 24 >> 2] = HEAP32[$91 >> 2];
 HEAP32[$dict_trie + 28 >> 2] = HEAP32[$108 >> 2];
 HEAP32[$dict_trie + 36 >> 2] = $125;
 HEAP32[$dict_trie + 44 >> 2] = HEAP32[$122 >> 2];
 $143 = HEAP32[$107 >> 2] | 0;
 $145 = HEAP32[$92 >> 2] | 0;
 $147 = HEAP32[$91 >> 2] << 4;
 _memcpy($143 | 0, $145 | 0, $147) | 0;
 $149 = HEAP32[$116 >> 2] | 0;
 $152 = HEAP32[$this + 20 >> 2] | 0;
 $154 = (HEAP32[$108 >> 2] | 0) * 10 | 0;
 _memcpy($149 | 0, $152 | 0, $154) | 0;
 if ((HEAP32[$119 >> 2] | 0) == (-(HEAP32[$117 >> 2] | 0) | 0)) {
  $_lcssa = 0;
 } else {
  $159 = $this + 32 | 0;
  $pos_046 = 0;
  while (1) {
   __ZN10ime_pinyin11DictBuilder13id_to_charbufEPhj(0, (HEAP32[$127 >> 2] | 0) + ($pos_046 * 3 | 0) | 0, HEAP32[(HEAP32[$159 >> 2] | 0) + ($pos_046 << 2) >> 2] | 0);
   $169 = $pos_046 + 1 | 0;
   $172 = (HEAP32[$119 >> 2] | 0) + (HEAP32[$117 >> 2] | 0) | 0;
   if ($169 >>> 0 < $172 >>> 0) {
    $pos_046 = $169;
   } else {
    $_lcssa = $172;
    break;
   }
  }
 }
 if ($_lcssa >>> 0 < $124 >>> 0) {
  $161 = $this + 44 | 0;
  $pos1_045 = $_lcssa;
  do {
   __ZN10ime_pinyin11DictBuilder13id_to_charbufEPhj(0, (HEAP32[$127 >> 2] | 0) + ($pos1_045 * 3 | 0) | 0, HEAP32[(HEAP32[$161 >> 2] | 0) + (($pos1_045 - (HEAP32[$117 >> 2] | 0) - (HEAP32[$119 >> 2] | 0) | 0) * 124 | 0) + 4 >> 2] | 0);
   $pos1_045 = $pos1_045 + 1 | 0;
  } while ($pos1_045 >>> 0 < $124 >>> 0);
 }
 __ZN10ime_pinyin11DictBuilder13free_resourceEv($this);
 $_0 = $97;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin11DictBuilder13id_to_charbufEPhj($this, $buf, $id) {
 $this = $this | 0;
 $buf = $buf | 0;
 $id = $id | 0;
 if (($buf | 0) == 0) {
  return;
 }
 HEAP8[$buf] = $id & 255;
 HEAP8[$buf + 1 | 0] = $id >>> 8 & 255;
 HEAP8[$buf + 2 | 0] = $id >>> 16 & 255;
 return;
}
function __ZN10ime_pinyin11DictBuilder14set_son_offsetEPNS_10LmaNodeGE1Ej($this, $node, $offset) {
 $this = $this | 0;
 $node = $node | 0;
 $offset = $offset | 0;
 HEAP16[$node >> 1] = $offset & 65535;
 HEAP8[$node + 8 | 0] = $offset >>> 16 & 255;
 return;
}
function __ZN10ime_pinyin11DictBuilder22set_homo_id_buf_offsetEPNS_10LmaNodeGE1Ej($this, $node, $offset) {
 $this = $this | 0;
 $node = $node | 0;
 $offset = $offset | 0;
 HEAP16[$node + 2 >> 1] = $offset & 65535;
 HEAP8[$node + 9 | 0] = $offset >>> 16 & 255;
 return;
}
function __ZN10ime_pinyin11DictBuilder9stat_initEv($this) {
 $this = $this | 0;
 _memset($this + 60 | 0, 0, 268);
 return;
}
function __ZN10ime_pinyin11DictBuilder10build_scisEv($this) {
 $this = $this | 0;
 var $key = 0, $1 = 0, $5 = 0, $8 = 0, $12 = 0, $19 = 0, $24 = 0, $29 = 0, $pos_053 = 0, $33 = 0, $34 = 0, $36 = 0, $hzpos_049 = 0, $50 = 0, $61 = 0, $66 = 0, $pos1_044 = 0, $unique_scis_num_043 = 0, $94 = 0, $97 = 0, $112 = 0, $115 = 0, $116 = 0, $117$1 = 0, $123 = 0, $127 = 0, $unique_scis_num_1 = 0, $133 = 0, $unique_scis_num_0_lcssa = 0, $138 = 0, $139 = 0, $141 = 0, $142 = 0, $pos2_038 = 0, $146 = 0, $147 = 0, $hzpos4_037 = 0, $154 = 0, $161 = 0, $167 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $key = sp | 0;
 $1 = $this + 8 | 0;
 if ((HEAP32[$1 >> 2] | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $5 = $this + 4 | 0;
 $8 = $this + 12 | 0;
 if (HEAP32[$5 >> 2] << 3 >>> 0 > (HEAP32[$8 >> 2] | 0) >>> 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $12 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 HEAPF32[HEAP32[$1 >> 2] >> 2] = 0.0;
 HEAP16[(HEAP32[$1 >> 2] | 0) + 4 >> 1] = 0;
 $19 = (HEAP32[$1 >> 2] | 0) + 6 | 0;
 HEAP16[$19 >> 1] = HEAP16[$19 >> 1] & 31;
 $24 = (HEAP32[$1 >> 2] | 0) + 6 | 0;
 HEAP16[$24 >> 1] = HEAP16[$24 >> 1] & -32;
 HEAP32[$8 >> 2] = 1;
 if ((HEAP32[$5 >> 2] | 0) != 0) {
  $29 = $this | 0;
  $pos_053 = 0;
  do {
   $33 = HEAP8[(HEAP32[$29 >> 2] | 0) + ($pos_053 * 124 | 0) + 116 | 0] | 0;
   $34 = $33 & 255;
   if ($33 << 24 >> 24 != 0) {
    $36 = $33 << 24 >> 24 == 1;
    $hzpos_049 = 0;
    do {
     HEAP16[(HEAP32[$1 >> 2] | 0) + (HEAP32[$8 >> 2] << 3) + 4 >> 1] = HEAP16[(HEAP32[$29 >> 2] | 0) + ($pos_053 * 124 | 0) + 8 + ($hzpos_049 << 1) >> 1] | 0;
     $50 = (HEAP32[$1 >> 2] | 0) + (HEAP32[$8 >> 2] << 3) + 6 | 0;
     HEAP16[$50 >> 1] = HEAP16[$50 >> 1] & 31 | HEAP16[(HEAP32[$29 >> 2] | 0) + ($pos_053 * 124 | 0) + 42 + ($hzpos_049 << 1) >> 1] << 5;
     $61 = __ZNK10ime_pinyin12SpellingTrie12full_to_halfEt($12, (HEAPU16[(HEAP32[$1 >> 2] | 0) + (HEAP32[$8 >> 2] << 3) + 6 >> 1] | 0) >>> 5) | 0;
     $66 = (HEAP32[$1 >> 2] | 0) + (HEAP32[$8 >> 2] << 3) + 6 | 0;
     HEAP16[$66 >> 1] = HEAP16[$66 >> 1] & -32 | $61 & 31;
     if ($36) {
      HEAPF32[(HEAP32[$1 >> 2] | 0) + (HEAP32[$8 >> 2] << 3) >> 2] = +HEAPF32[(HEAP32[$29 >> 2] | 0) + ($pos_053 * 124 | 0) + 120 >> 2];
     } else {
      HEAPF32[(HEAP32[$1 >> 2] | 0) + (HEAP32[$8 >> 2] << 3) >> 2] = 9.999999974752427e-7;
     }
     HEAP32[$8 >> 2] = (HEAP32[$8 >> 2] | 0) + 1;
     $hzpos_049 = $hzpos_049 + 1 | 0;
    } while ($hzpos_049 >>> 0 < $34 >>> 0);
   }
   $pos_053 = $pos_053 + 1 | 0;
  } while ($pos_053 >>> 0 < (HEAP32[$5 >> 2] | 0) >>> 0);
 }
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E(HEAP32[$1 >> 2] | 0, HEAP32[$8 >> 2] | 0, 8, 52);
 if ((HEAP32[$8 >> 2] | 0) >>> 0 > 1) {
  $unique_scis_num_043 = 1;
  $pos1_044 = 1;
  while (1) {
   $94 = HEAP32[$1 >> 2] | 0;
   $97 = $pos1_044 - 1 | 0;
   if ((HEAP16[$94 + ($pos1_044 << 3) + 4 >> 1] | 0) == (HEAP16[$94 + ($97 << 3) + 4 >> 1] | 0)) {
    if ((HEAPU16[$94 + ($pos1_044 << 3) + 6 >> 1] | 0) >>> 5 << 16 >> 16 == (HEAPU16[$94 + ($97 << 3) + 6 >> 1] | 0) >>> 5 << 16 >> 16) {
     $unique_scis_num_1 = $unique_scis_num_043;
    } else {
     label = 393;
    }
   } else {
    label = 393;
   }
   if ((label | 0) == 393) {
    label = 0;
    $112 = HEAP32[$1 >> 2] | 0;
    $115 = $112 + ($pos1_044 << 3) | 0;
    $116 = $112 + ($unique_scis_num_043 << 3) | 0;
    $117$1 = HEAP32[$115 + 4 >> 2] | 0;
    HEAP32[$116 >> 2] = HEAP32[$115 >> 2];
    HEAP32[$116 + 4 >> 2] = $117$1;
    $123 = __ZNK10ime_pinyin12SpellingTrie12full_to_halfEt($12, (HEAPU16[(HEAP32[$1 >> 2] | 0) + ($pos1_044 << 3) + 6 >> 1] | 0) >>> 5) | 0;
    $127 = (HEAP32[$1 >> 2] | 0) + ($unique_scis_num_043 << 3) + 6 | 0;
    HEAP16[$127 >> 1] = HEAP16[$127 >> 1] & -32 | $123 & 31;
    $unique_scis_num_1 = $unique_scis_num_043 + 1 | 0;
   }
   $133 = $pos1_044 + 1 | 0;
   if ($133 >>> 0 < (HEAP32[$8 >> 2] | 0) >>> 0) {
    $unique_scis_num_043 = $unique_scis_num_1;
    $pos1_044 = $133;
   } else {
    $unique_scis_num_0_lcssa = $unique_scis_num_1;
    break;
   }
  }
 } else {
  $unique_scis_num_0_lcssa = 1;
 }
 HEAP32[$8 >> 2] = $unique_scis_num_0_lcssa;
 L461 : do {
  if ((HEAP32[$5 >> 2] | 0) != 0) {
   $138 = $this | 0;
   $139 = $key + 4 | 0;
   $141 = $key + 6 | 0;
   $142 = $key;
   $pos2_038 = 0;
   L463 : while (1) {
    $146 = HEAP8[(HEAP32[$138 >> 2] | 0) + ($pos2_038 * 124 | 0) + 116 | 0] | 0;
    $147 = $146 & 255;
    if ($146 << 24 >> 24 != 0) {
     $hzpos4_037 = 0;
     do {
      HEAP16[$139 >> 1] = HEAP16[(HEAP32[$138 >> 2] | 0) + ($pos2_038 * 124 | 0) + 8 + ($hzpos4_037 << 1) >> 1] | 0;
      $154 = HEAP16[(HEAP32[$138 >> 2] | 0) + ($pos2_038 * 124 | 0) + 42 + ($hzpos4_037 << 1) >> 1] | 0;
      HEAP16[$141 >> 1] = HEAP16[$141 >> 1] & 31 | $154 << 5;
      $161 = (__ZNK10ime_pinyin12SpellingTrie12full_to_halfEt($12, $154 & 2047) | 0) & 31;
      HEAP16[$141 >> 1] = HEAP16[$141 >> 1] & -32 | $161;
      $167 = __ZN10ime_pinyin9mybsearchEPKvS1_jjPFiS1_S1_E($142, HEAP32[$1 >> 2] | 0, $unique_scis_num_0_lcssa, 8, 38) | 0;
      if (($167 | 0) == 0) {
       break L463;
      }
      HEAP16[(HEAP32[$138 >> 2] | 0) + ($pos2_038 * 124 | 0) + 26 + ($hzpos4_037 << 1) >> 1] = ($167 - (HEAP32[$1 >> 2] | 0) | 0) >>> 3 & 65535;
      HEAP16[(HEAP32[$138 >> 2] | 0) + ($pos2_038 * 124 | 0) + 42 + ($hzpos4_037 << 1) >> 1] = (HEAPU16[$167 + 6 >> 1] | 0) >>> 5;
      $hzpos4_037 = $hzpos4_037 + 1 | 0;
     } while ($hzpos4_037 >>> 0 < $147 >>> 0);
    }
    $pos2_038 = $pos2_038 + 1 | 0;
    if ($pos2_038 >>> 0 >= (HEAP32[$5 >> 2] | 0) >>> 0) {
     break L461;
    }
   }
   ___assert_func(4408, 763, 7864, 4048);
   return 0;
  }
 } while (0);
 $_0 = HEAP32[$8 >> 2] | 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin11DictBuilder16construct_subsetEPvPNS_10LemmaEntryEjjj($this, $parent, $lemma_arr, $item_start, $item_end, $level) {
 $this = $this | 0;
 $parent = $parent | 0;
 $lemma_arr = $lemma_arr | 0;
 $item_start = $item_start | 0;
 $item_end = $item_end | 0;
 $level = $level | 0;
 var $4 = 0, $5 = 0, $parent_son_num_0205 = 0, $spl_idx_node_0204 = 0, $i_0203 = 0, $12 = 0, $parent_son_num_0_ = 0, $14 = 0, $parent_son_num_0_lcssa = 0, $16 = 0, $20 = 0, $25 = 0, $28 = 0, $33 = 0, $37 = 0, $41 = 0, $44 = 0, $46 = 0, $50 = 0, $51 = 0, $63 = 0, $67 = 0, $68 = 0, $79 = 0, $82 = 0, $83 = 0, $son_1st_le0_0 = 0, $son_1st_ge1_0 = 0, $92 = 0, $94 = 0, $95 = 0, $_ = 0, $homo_num_1_neg183 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $homo_num_1_neg194 = 0, $spl_idx_node_2193 = 0, $i1_0191 = 0, $item_start_next_0188 = 0, $homo_num_1186 = 0, $son_pos_0185 = 0, $allson_noson_0_off0184 = 0, $111 = 0, $113 = 0, $122 = 0, $132 = 0, $node_cur_le0_0 = 0, $node_cur_ge1_0 = 0, $142 = 0, $143 = 0, $144 = 0, $_sum160 = 0, $homo_pos_0165 = 0, $next_parent_0 = 0, $181 = 0, $allson_noson_1_off0 = 0, $allson_noson_2_off0 = 0, $son_pos_1 = 0, $homo_num_3 = 0, $item_start_next_1 = 0, $spl_idx_node_3 = 0, $191 = 0, $homo_num_1_neg = 0, $homo_num_1_neg_lcssa = 0, $spl_idx_node_2_lcssa = 0, $item_start_next_0_lcssa = 0, $homo_num_1_lcssa = 0, $son_pos_0_lcssa = 0, $allson_noson_0_off0_lcssa = 0, $194 = 0, $196 = 0, $206 = 0, $210 = 0, $node_cur_le04_0 = 0, $node_cur_ge15_0 = 0, $219 = 0, $221 = 0, $223 = 0, $_sum157 = 0, $homo_pos7_0163 = 0, $244 = 0, $249 = 0, $next_parent8_0 = 0, $260 = 0, $262 = 0, $267 = 0, $270 = 0, $_0 = 0, label = 0;
 if (!($level >>> 0 < 8 & $item_end >>> 0 > $item_start >>> 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $4 = $this | 0;
 $5 = $item_start + 1 | 0;
 if ($5 >>> 0 < $item_end >>> 0) {
  $i_0203 = $5;
  $spl_idx_node_0204 = HEAP16[(HEAP32[$4 >> 2] | 0) + ($item_start * 124 | 0) + 42 + ($level << 1) >> 1] | 0;
  $parent_son_num_0205 = 0;
  while (1) {
   $12 = HEAP16[$lemma_arr + ($i_0203 * 124 | 0) + 42 + ($level << 1) >> 1] | 0;
   $parent_son_num_0_ = ($12 << 16 >> 16 != $spl_idx_node_0204 << 16 >> 16) + $parent_son_num_0205 | 0;
   $14 = $i_0203 + 1 | 0;
   if ($14 >>> 0 < $item_end >>> 0) {
    $i_0203 = $14;
    $spl_idx_node_0204 = $12;
    $parent_son_num_0205 = $parent_son_num_0_;
   } else {
    $parent_son_num_0_lcssa = $parent_son_num_0_;
    break;
   }
  }
 } else {
  $parent_son_num_0_lcssa = 0;
 }
 $16 = $parent_son_num_0_lcssa + 1 | 0;
 if ($level >>> 0 >= 8) {
  ___assert_func(4408, 803, 7616, 3816);
  return 0;
 }
 $20 = $this + 60 + ($level << 2) | 0;
 if ($16 >>> 0 > (HEAP32[$20 >> 2] | 0) >>> 0) {
  HEAP32[$20 >> 2] = $16;
 }
 $25 = $this + 124 + ($level << 2) | 0;
 HEAP32[$25 >> 2] = (HEAP32[$25 >> 2] | 0) + $16;
 $28 = $this + 188 + ($level << 2) | 0;
 HEAP32[$28 >> 2] = (HEAP32[$28 >> 2] | 0) + 1;
 if (($parent_son_num_0_lcssa | 0) == 0) {
  $33 = $this + 316 | 0;
  HEAP32[$33 >> 2] = (HEAP32[$33 >> 2] | 0) + 1;
 } else {
  $37 = $this + 320 | 0;
  HEAP32[$37 >> 2] = (HEAP32[$37 >> 2] | 0) + 1;
 }
 $41 = $this + 324 | 0;
 HEAP32[$41 >> 2] = (HEAP32[$41 >> 2] | 0) + $16;
 $44 = ($level | 0) == 0;
 do {
  if ($44) {
   $46 = $this + 24 | 0;
   HEAP32[$parent >> 2] = HEAP32[$46 >> 2];
   $50 = HEAP32[$this + 16 >> 2] | 0;
   $51 = HEAP32[$46 >> 2] | 0;
   HEAP32[$46 >> 2] = $51 + $16;
   if ($16 >>> 0 < 65536) {
    HEAP16[$parent + 10 >> 1] = $16 & 65535;
    $son_1st_ge1_0 = 0;
    $son_1st_le0_0 = $50 + ($51 << 4) | 0;
    break;
   } else {
    ___assert_func(4408, 827, 7616, 3640);
    return 0;
   }
  } else {
   if (($level | 0) == 1) {
    $63 = $this + 28 | 0;
    HEAP32[$parent >> 2] = HEAP32[$63 >> 2];
    $67 = HEAP32[$this + 20 >> 2] | 0;
    $68 = HEAP32[$63 >> 2] | 0;
    HEAP32[$63 >> 2] = $68 + $16;
    if ($16 >>> 0 < 65536) {
     HEAP16[$parent + 10 >> 1] = $16 & 65535;
     $son_1st_ge1_0 = $67 + ($68 * 10 | 0) | 0;
     $son_1st_le0_0 = 0;
     break;
    } else {
     ___assert_func(4408, 836, 7616, 3640);
     return 0;
    }
   } else {
    $79 = $this + 28 | 0;
    __ZN10ime_pinyin11DictBuilder14set_son_offsetEPNS_10LmaNodeGE1Ej(0, $parent, HEAP32[$79 >> 2] | 0);
    $82 = HEAP32[$this + 20 >> 2] | 0;
    $83 = HEAP32[$79 >> 2] | 0;
    HEAP32[$79 >> 2] = $83 + $16;
    if ($16 >>> 0 < 256) {
     HEAP8[$parent + 6 | 0] = $16 & 255;
     $son_1st_ge1_0 = $82 + ($83 * 10 | 0) | 0;
     $son_1st_le0_0 = 0;
     break;
    } else {
     ___assert_func(4408, 845, 7616, 3528);
     return 0;
    }
   }
  }
 } while (0);
 $92 = HEAP32[$4 >> 2] | 0;
 $94 = HEAP16[$92 + ($item_start * 124 | 0) + 42 + ($level << 1) >> 1] | 0;
 $95 = $level + 1 | 0;
 $_ = (HEAP16[$92 + ($item_start * 124 | 0) + 42 + ($95 << 1) >> 1] | 0) == 0 | 0;
 $homo_num_1_neg183 = -$_ | 0;
 L508 : do {
  if ($5 >>> 0 < $item_end >>> 0) {
   $100 = $this + 36 | 0;
   $101 = $this + 40 | 0;
   $102 = $this + 156 + ($level << 2) | 0;
   $103 = $this + 32 | 0;
   $104 = $this + 36 | 0;
   $105 = $this + 40 | 0;
   $106 = $this + 92 + ($level << 2) | 0;
   $107 = $this + 284 + ($level << 2) | 0;
   $108 = $this + 36 | 0;
   $109 = $this + 40 | 0;
   $allson_noson_0_off0184 = 1;
   $son_pos_0185 = 0;
   $homo_num_1186 = $_;
   $item_start_next_0188 = $item_start;
   $i1_0191 = $5;
   $spl_idx_node_2193 = $94;
   $homo_num_1_neg194 = $homo_num_1_neg183;
   while (1) {
    $111 = HEAP32[$4 >> 2] | 0;
    $113 = HEAP16[$111 + ($i1_0191 * 124 | 0) + 42 + ($level << 1) >> 1] | 0;
    if ($113 << 16 >> 16 == $spl_idx_node_2193 << 16 >> 16) {
     $spl_idx_node_3 = $spl_idx_node_2193;
     $item_start_next_1 = $item_start_next_0188;
     $homo_num_3 = ((HEAP16[$111 + ($i1_0191 * 124 | 0) + 42 + ($95 << 1) >> 1] | 0) == 0) + $homo_num_1186 | 0;
     $son_pos_1 = $son_pos_0185;
     $allson_noson_2_off0 = $allson_noson_0_off0184;
    } else {
     if ($44) {
      $122 = $son_1st_le0_0 + ($son_pos_0185 << 4) | 0;
      HEAP16[$son_1st_le0_0 + ($son_pos_0185 << 4) + 8 >> 1] = $spl_idx_node_2193;
      HEAP32[$son_1st_le0_0 + ($son_pos_0185 << 4) + 4 >> 2] = (HEAP32[$101 >> 2] | 0) + (HEAP32[$100 >> 2] | 0);
      HEAP32[$122 >> 2] = 0;
      HEAP32[$100 >> 2] = (HEAP32[$100 >> 2] | 0) + $homo_num_1186;
      $node_cur_ge1_0 = 0;
      $node_cur_le0_0 = $122;
     } else {
      $132 = $son_1st_ge1_0 + ($son_pos_0185 * 10 | 0) | 0;
      HEAP16[$son_1st_ge1_0 + ($son_pos_0185 * 10 | 0) + 4 >> 1] = $spl_idx_node_2193;
      __ZN10ime_pinyin11DictBuilder22set_homo_id_buf_offsetEPNS_10LmaNodeGE1Ej(0, $132, (HEAP32[$109 >> 2] | 0) + (HEAP32[$108 >> 2] | 0) | 0);
      __ZN10ime_pinyin11DictBuilder14set_son_offsetEPNS_10LmaNodeGE1Ej(0, $132, 0);
      HEAP32[$109 >> 2] = (HEAP32[$109 >> 2] | 0) + $homo_num_1186;
      $node_cur_ge1_0 = $132;
      $node_cur_le0_0 = 0;
     }
     if (($homo_num_1186 | 0) != 0) {
      $142 = HEAP32[$103 >> 2] | 0;
      $143 = HEAP32[$104 >> 2] | 0;
      $144 = HEAP32[$105 >> 2] | 0;
      if ($44) {
       if ($homo_num_1186 >>> 0 >= 65536) {
        label = 439;
        break;
       }
       HEAP16[$node_cur_le0_0 + 12 >> 1] = $homo_num_1186 & 65535;
      } else {
       if ($homo_num_1186 >>> 0 >= 256) {
        label = 442;
        break;
       }
       HEAP8[$node_cur_ge1_0 + 7 | 0] = $homo_num_1186 & 255;
      }
      if (($homo_num_1186 | 0) != 0) {
       $_sum160 = $143 + $homo_num_1_neg194 + $144 | 0;
       $homo_pos_0165 = 0;
       do {
        HEAP32[$142 + ($_sum160 + $homo_pos_0165 << 2) >> 2] = HEAP32[(HEAP32[$4 >> 2] | 0) + (($homo_pos_0165 + $item_start_next_0188 | 0) * 124 | 0) + 4 >> 2];
        $homo_pos_0165 = $homo_pos_0165 + 1 | 0;
       } while ($homo_pos_0165 >>> 0 < $homo_num_1186 >>> 0);
      }
      if ($homo_num_1186 >>> 0 > (HEAP32[$106 >> 2] | 0) >>> 0) {
       HEAP32[$106 >> 2] = $homo_num_1186;
      }
      HEAP32[$107 >> 2] = (HEAP32[$107 >> 2] | 0) + $homo_num_1186;
     }
     if (($i1_0191 - $item_start_next_0188 | 0) >>> 0 > $homo_num_1186 >>> 0) {
      if ($44) {
       $next_parent_0 = $node_cur_le0_0;
      } else {
       $next_parent_0 = $node_cur_ge1_0;
      }
      $181 = $item_start_next_0188 + $homo_num_1186 | 0;
      __ZN10ime_pinyin11DictBuilder16construct_subsetEPvPNS_10LemmaEntryEjjj($this, $next_parent_0, $lemma_arr, $181, $i1_0191, $95) | 0;
      HEAP32[$102 >> 2] = (HEAP32[$102 >> 2] | 0) + 1;
      $allson_noson_1_off0 = 0;
     } else {
      $allson_noson_1_off0 = $allson_noson_0_off0184;
     }
     $spl_idx_node_3 = $113;
     $item_start_next_1 = $i1_0191;
     $homo_num_3 = (HEAP16[$111 + ($i1_0191 * 124 | 0) + 42 + ($95 << 1) >> 1] | 0) == 0 | 0;
     $son_pos_1 = $son_pos_0185 + 1 | 0;
     $allson_noson_2_off0 = $allson_noson_1_off0;
    }
    $191 = $i1_0191 + 1 | 0;
    $homo_num_1_neg = -$homo_num_3 | 0;
    if ($191 >>> 0 < $item_end >>> 0) {
     $allson_noson_0_off0184 = $allson_noson_2_off0;
     $son_pos_0185 = $son_pos_1;
     $homo_num_1186 = $homo_num_3;
     $item_start_next_0188 = $item_start_next_1;
     $i1_0191 = $191;
     $spl_idx_node_2193 = $spl_idx_node_3;
     $homo_num_1_neg194 = $homo_num_1_neg;
    } else {
     $allson_noson_0_off0_lcssa = $allson_noson_2_off0;
     $son_pos_0_lcssa = $son_pos_1;
     $homo_num_1_lcssa = $homo_num_3;
     $item_start_next_0_lcssa = $item_start_next_1;
     $spl_idx_node_2_lcssa = $spl_idx_node_3;
     $homo_num_1_neg_lcssa = $homo_num_1_neg;
     break L508;
    }
   }
   if ((label | 0) == 439) {
    ___assert_func(4408, 893, 7616, 3408);
    return 0;
   } else if ((label | 0) == 442) {
    ___assert_func(4408, 896, 7616, 3264);
    return 0;
   }
  } else {
   $allson_noson_0_off0_lcssa = 1;
   $son_pos_0_lcssa = 0;
   $homo_num_1_lcssa = $_;
   $item_start_next_0_lcssa = $item_start;
   $spl_idx_node_2_lcssa = $94;
   $homo_num_1_neg_lcssa = $homo_num_1_neg183;
  }
 } while (0);
 if ($44) {
  $194 = $son_1st_le0_0 + ($son_pos_0_lcssa << 4) | 0;
  HEAP16[$son_1st_le0_0 + ($son_pos_0_lcssa << 4) + 8 >> 1] = $spl_idx_node_2_lcssa;
  $196 = $this + 36 | 0;
  HEAP32[$son_1st_le0_0 + ($son_pos_0_lcssa << 4) + 4 >> 2] = (HEAP32[$this + 40 >> 2] | 0) + (HEAP32[$196 >> 2] | 0);
  HEAP32[$194 >> 2] = 0;
  HEAP32[$196 >> 2] = (HEAP32[$196 >> 2] | 0) + $homo_num_1_lcssa;
  $node_cur_ge15_0 = 0;
  $node_cur_le04_0 = $194;
 } else {
  $206 = $son_1st_ge1_0 + ($son_pos_0_lcssa * 10 | 0) | 0;
  HEAP16[$son_1st_ge1_0 + ($son_pos_0_lcssa * 10 | 0) + 4 >> 1] = $spl_idx_node_2_lcssa;
  $210 = $this + 40 | 0;
  __ZN10ime_pinyin11DictBuilder22set_homo_id_buf_offsetEPNS_10LmaNodeGE1Ej(0, $206, (HEAP32[$210 >> 2] | 0) + (HEAP32[$this + 36 >> 2] | 0) | 0);
  __ZN10ime_pinyin11DictBuilder14set_son_offsetEPNS_10LmaNodeGE1Ej(0, $206, 0);
  HEAP32[$210 >> 2] = (HEAP32[$210 >> 2] | 0) + $homo_num_1_lcssa;
  $node_cur_ge15_0 = $206;
  $node_cur_le04_0 = 0;
 }
 if (($homo_num_1_lcssa | 0) != 0) {
  $219 = HEAP32[$this + 32 >> 2] | 0;
  $221 = HEAP32[$this + 36 >> 2] | 0;
  $223 = HEAP32[$this + 40 >> 2] | 0;
  do {
   if ($44) {
    if ($homo_num_1_lcssa >>> 0 < 65536) {
     HEAP16[$node_cur_le04_0 + 12 >> 1] = $homo_num_1_lcssa & 65535;
     break;
    } else {
     ___assert_func(4408, 962, 7616, 3408);
     return 0;
    }
   } else {
    if ($homo_num_1_lcssa >>> 0 < 256) {
     HEAP8[$node_cur_ge15_0 + 7 | 0] = $homo_num_1_lcssa & 255;
     break;
    } else {
     ___assert_func(4408, 965, 7616, 3264);
     return 0;
    }
   }
  } while (0);
  if (($homo_num_1_lcssa | 0) != 0) {
   $_sum157 = $221 + $homo_num_1_neg_lcssa + $223 | 0;
   $homo_pos7_0163 = 0;
   do {
    HEAP32[$219 + ($_sum157 + $homo_pos7_0163 << 2) >> 2] = HEAP32[$lemma_arr + (($homo_pos7_0163 + $item_start_next_0_lcssa | 0) * 124 | 0) + 4 >> 2];
    $homo_pos7_0163 = $homo_pos7_0163 + 1 | 0;
   } while ($homo_pos7_0163 >>> 0 < $homo_num_1_lcssa >>> 0);
  }
  $244 = $this + 92 + ($level << 2) | 0;
  if ($homo_num_1_lcssa >>> 0 > (HEAP32[$244 >> 2] | 0) >>> 0) {
   HEAP32[$244 >> 2] = $homo_num_1_lcssa;
  }
  $249 = $this + 284 + ($level << 2) | 0;
  HEAP32[$249 >> 2] = (HEAP32[$249 >> 2] | 0) + $homo_num_1_lcssa;
 }
 do {
  if (($item_end - $item_start_next_0_lcssa | 0) >>> 0 > $homo_num_1_lcssa >>> 0) {
   if ($44) {
    $next_parent8_0 = $node_cur_le04_0;
   } else {
    $next_parent8_0 = $node_cur_ge15_0;
   }
   $260 = $item_start_next_0_lcssa + $homo_num_1_lcssa | 0;
   __ZN10ime_pinyin11DictBuilder16construct_subsetEPvPNS_10LemmaEntryEjjj($this, $next_parent8_0, $lemma_arr, $260, $item_end, $95) | 0;
   $262 = $this + 156 + ($level << 2) | 0;
   HEAP32[$262 >> 2] = (HEAP32[$262 >> 2] | 0) + 1;
  } else {
   if (!$allson_noson_0_off0_lcssa) {
    break;
   }
   $267 = $this + 220 + ($level << 2) | 0;
   HEAP32[$267 >> 2] = (HEAP32[$267 >> 2] | 0) + 1;
   $270 = $this + 252 + ($level << 2) | 0;
   HEAP32[$270 >> 2] = (HEAP32[$270 >> 2] | 0) + $16;
  }
 } while (0);
 if (($son_pos_0_lcssa + 1 | 0) == ($16 | 0)) {
  $_0 = 1;
  return $_0 | 0;
 } else {
  ___assert_func(4408, 1003, 7616, 3144);
  return 0;
 }
 return 0;
}
function __ZN10ime_pinyin12AtomDictBaseC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 8368;
 return;
}
function __ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, $id_offset) {
 $this = $this | 0;
 $id_offset = $id_offset | 0;
 var $1 = 0, $3 = 0;
 $1 = $id_offset * 3 | 0;
 $3 = HEAP32[$this + 32 >> 2] | 0;
 return HEAPU8[(HEAP32[$this + 32 >> 2] | 0) + $1 | 0] | 0 | (HEAPU8[$3 + ($1 + 1) | 0] | 0 | (HEAPU8[$3 + ($1 + 2) | 0] | 0) << 8) << 8 | 0;
}
function __ZN10ime_pinyin11DictBuilder10stat_printEv($this) {
 $this = $this | 0;
 var sp = 0;
 sp = STACKTOP;
 _puts(72) | 0;
 _puts(48) | 0;
 _printf(2936, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 60 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 64 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 68 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 72 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 76 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 80 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 84 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 88 >> 2], tempInt) | 0) | 0;
 _puts(40) | 0;
 _printf(2552, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 92 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 96 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 100 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 104 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 108 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 112 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 116 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 120 >> 2], tempInt) | 0) | 0;
 _putchar(10) | 0;
 _printf(2408, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 124 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 128 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 132 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 136 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 140 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 144 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 148 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 152 >> 2], tempInt) | 0) | 0;
 _puts(32) | 0;
 _printf(2352, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 156 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 160 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 164 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 168 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 172 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 176 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 180 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 184 >> 2], tempInt) | 0) | 0;
 _putchar(10) | 0;
 _printf(2264, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 188 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 192 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 196 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 200 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 204 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 208 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 212 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 216 >> 2], tempInt) | 0) | 0;
 _puts(24) | 0;
 _printf(2208, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 220 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 224 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 228 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 232 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 236 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 240 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 244 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 248 >> 2], tempInt) | 0) | 0;
 _puts(16) | 0;
 _printf(2080, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 252 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 256 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 260 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 264 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 268 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 272 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 276 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 280 >> 2], tempInt) | 0) | 0;
 _puts(8) | 0;
 _printf(2040, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 284 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 288 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 292 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 296 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 300 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 304 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 308 >> 2], tempInt) | 0) | 0;
 _printf(2840, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 312 >> 2], tempInt) | 0) | 0;
 _putchar(10) | 0;
 _printf(1936, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 316 >> 2], tempInt) | 0) | 0;
 _printf(1800, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP32[$this + 320 >> 2], tempInt) | 0) | 0;
 _printf(1656, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = (HEAP32[$this + 324 >> 2] | 0) + 1, tempInt) | 0) | 0;
 STACKTOP = sp;
 return;
}
function __ZN10ime_pinyin8DictTrieC2Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin12AtomDictBaseC2Ev($this | 0);
 HEAP32[$this >> 2] = 8272;
 HEAP32[$this + 8 >> 2] = __ZN10ime_pinyin12SpellingTrie14get_cpinstanceEv() | 0;
 HEAP32[$this + 4 >> 2] = 0;
 HEAP32[$this + 56 >> 2] = 0;
 _memset($this + 12 | 0, 0, 40);
 FUNCTION_TABLE_viii[HEAP32[(HEAP32[$this >> 2] | 0) + 20 >> 2] & 15]($this, 0, 1);
 return;
}
function __ZN10ime_pinyin8DictTrieD0Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin8DictTrieD2Ev($this);
 __ZdlPv($this);
 return;
}
function __ZN10ime_pinyin8DictTrieD2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 8272;
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 1);
 return;
}
function __ZN10ime_pinyin8DictTrie13free_resourceEb($this, $free_dict_list) {
 $this = $this | 0;
 $free_dict_list = $free_dict_list | 0;
 var $1 = 0, $2 = 0, $7 = 0, $8 = 0, $13 = 0, $14 = 0, $20 = 0, $21 = 0, $31 = 0, $32 = 0, $37 = 0, $38 = 0;
 $1 = $this + 12 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) != 0) {
  _free($2);
 }
 HEAP32[$1 >> 2] = 0;
 $7 = $this + 20 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 if (($8 | 0) != 0) {
  _free($8);
 }
 HEAP32[$7 >> 2] = 0;
 $13 = $this + 16 | 0;
 $14 = HEAP32[$13 >> 2] | 0;
 if (($14 | 0) != 0) {
  _free($14);
 }
 HEAP32[$13 >> 2] = 0;
 if ($free_dict_list) {
  $20 = $this + 4 | 0;
  $21 = HEAP32[$20 >> 2] | 0;
  if (($21 | 0) != 0) {
   __ZN10ime_pinyin8DictListD2Ev($21);
   __ZdlPv($21 | 0);
  }
  HEAP32[$20 >> 2] = 0;
 }
 $31 = $this + 48 | 0;
 $32 = HEAP32[$31 >> 2] | 0;
 if (($32 | 0) != 0) {
  __ZdaPv($32 | 0);
 }
 HEAP32[$31 >> 2] = 0;
 $37 = $this + 56 | 0;
 $38 = HEAP32[$37 >> 2] | 0;
 if (($38 | 0) != 0) {
  __ZdaPv($38);
 }
 HEAP32[$37 >> 2] = 0;
 FUNCTION_TABLE_viii[HEAP32[(HEAP32[$this >> 2] | 0) + 20 >> 2] & 15]($this, 0, 1);
 return;
}
function __ZN10ime_pinyin8DictTrie10build_dictEPKcS2_($this, $fn_raw, $fn_validhzs) {
 $this = $this | 0;
 $fn_raw = $fn_raw | 0;
 $fn_validhzs = $fn_validhzs | 0;
 var $2 = 0;
 $2 = __Znwj(328) | 0;
 __ZN10ime_pinyin11DictBuilderC2Ev($2);
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 1);
 return __ZN10ime_pinyin11DictBuilder10build_dictEPKcS2_PNS_8DictTrieE($2, $fn_raw, $fn_validhzs, $this) | 0;
}
function __ZN10ime_pinyin8DictTrie9save_dictEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $3 = 0, $8 = 0, $13 = 0, $27 = 0, $35 = 0, $42 = 0, $_0 = 0;
 if (($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this + 24 | 0;
 if ((_fwrite($3 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = $this + 28 | 0;
 if ((_fwrite($8 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $13 = $this + 36 | 0;
 if ((_fwrite($13 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite($this + 44 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $27 = _fwrite(HEAP32[$this + 12 >> 2] | 0, 16, HEAP32[$3 >> 2] | 0, $fp | 0) | 0;
 if (($27 | 0) != (HEAP32[$3 >> 2] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $35 = _fwrite(HEAP32[$this + 16 >> 2] | 0, 10, HEAP32[$8 >> 2] | 0, $fp | 0) | 0;
 if (($35 | 0) != (HEAP32[$8 >> 2] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $42 = _fwrite(HEAP32[$this + 32 >> 2] | 0, 1, HEAP32[$13 >> 2] | 0, $fp | 0) | 0;
 $_0 = ($42 | 0) == (HEAP32[$13 >> 2] | 0);
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictTrie9save_dictEPKc($this, $filename) {
 $this = $this | 0;
 $filename = $filename | 0;
 var $7 = 0, $11 = 0, $12 = 0, $13 = 0, $_0 = 0;
 if (($filename | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 12 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = $this + 4 | 0;
 if ((HEAP32[$7 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $12 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 $13 = _fopen($filename | 0, 1648) | 0;
 if (($13 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 do {
  if (__ZN10ime_pinyin12SpellingTrie13save_spl_trieEP7__sFILE($11, $13) | 0) {
   if (!(__ZN10ime_pinyin8DictList9save_listEP7__sFILE(HEAP32[$7 >> 2] | 0, $13) | 0)) {
    break;
   }
   if (!(__ZN10ime_pinyin8DictTrie9save_dictEP7__sFILE($this, $13) | 0)) {
    break;
   }
   if (!(__ZN10ime_pinyin5NGram10save_ngramEP7__sFILE($12, $13) | 0)) {
    break;
   }
   _fclose($13 | 0) | 0;
   $_0 = 1;
   return $_0 | 0;
  }
 } while (0);
 _fclose($13 | 0) | 0;
 $_0 = 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictTrie9load_dictEPKcjj($this, $filename, $start_id, $end_id) {
 $this = $this | 0;
 $filename = $filename | 0;
 $start_id = $start_id | 0;
 $end_id = $end_id | 0;
 var $4 = 0, $7 = 0, $8 = 0, $10 = 0, $17 = 0, $18 = 0, $_0 = 0;
 if (!(($filename | 0) != 0 & $end_id >>> 0 > $start_id >>> 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $4 = _fopen($filename | 0, 1464) | 0;
 if (($4 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 1);
 $7 = __Znwj(128) | 0;
 $8 = $7;
 __ZN10ime_pinyin8DictListC2Ev($8);
 $10 = $this + 4 | 0;
 HEAP32[$10 >> 2] = $8;
 if (($7 | 0) == 0) {
  _fclose($4 | 0) | 0;
  $_0 = 0;
  return $_0 | 0;
 }
 $17 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $18 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 do {
  if (__ZN10ime_pinyin12SpellingTrie13load_spl_trieEP7__sFILE($17, $4) | 0) {
   if (!(__ZN10ime_pinyin8DictList9load_listEP7__sFILE(HEAP32[$10 >> 2] | 0, $4) | 0)) {
    break;
   }
   if (!(__ZN10ime_pinyin8DictTrie9load_dictEP7__sFILE($this, $4) | 0)) {
    break;
   }
   if (!(__ZN10ime_pinyin5NGram10load_ngramEP7__sFILE($18, $4) | 0)) {
    break;
   }
   if ((HEAP32[$this + 40 >> 2] | 0) >>> 0 > (1 - $start_id + $end_id | 0) >>> 0) {
    break;
   }
   _fclose($4 | 0) | 0;
   $_0 = 1;
   return $_0 | 0;
  }
 } while (0);
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 1);
 _fclose($4 | 0) | 0;
 $_0 = 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictTrie12load_dict_fdEilljj($this, $sys_fd, $start_offset, $length, $start_id, $end_id) {
 $this = $this | 0;
 $sys_fd = $sys_fd | 0;
 $start_offset = $start_offset | 0;
 $length = $length | 0;
 $start_id = $start_id | 0;
 $end_id = $end_id | 0;
 var $3 = 0, $11 = 0, $12 = 0, $14 = 0, $21 = 0, $22 = 0, $_0 = 0;
 if (!(($length | 0) > 0 & ($start_offset | 0) > -1 & $end_id >>> 0 > $start_id >>> 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = _fdopen($sys_fd | 0, 1464) | 0;
 if (($3 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fseek($3 | 0, $start_offset | 0, 0) | 0) == -1) {
  _fclose($3 | 0) | 0;
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 1);
 $11 = __Znwj(128) | 0;
 $12 = $11;
 __ZN10ime_pinyin8DictListC2Ev($12);
 $14 = $this + 4 | 0;
 HEAP32[$14 >> 2] = $12;
 if (($11 | 0) == 0) {
  _fclose($3 | 0) | 0;
  $_0 = 0;
  return $_0 | 0;
 }
 $21 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $22 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 do {
  if (__ZN10ime_pinyin12SpellingTrie13load_spl_trieEP7__sFILE($21, $3) | 0) {
   if (!(__ZN10ime_pinyin8DictList9load_listEP7__sFILE(HEAP32[$14 >> 2] | 0, $3) | 0)) {
    break;
   }
   if (!(__ZN10ime_pinyin8DictTrie9load_dictEP7__sFILE($this, $3) | 0)) {
    break;
   }
   if (!(__ZN10ime_pinyin5NGram10load_ngramEP7__sFILE($22, $3) | 0)) {
    break;
   }
   if ((_ftell($3 | 0) | 0) < ($length + $start_offset | 0)) {
    break;
   }
   if ((HEAP32[$this + 40 >> 2] | 0) >>> 0 > (1 - $start_id + $end_id | 0) >>> 0) {
    break;
   }
   _fclose($3 | 0) | 0;
   $_0 = 1;
   return $_0 | 0;
  }
 } while (0);
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 1);
 _fclose($3 | 0) | 0;
 $_0 = 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictTrie15fill_lpi_bufferEPNS_10LmaPsbItemEjPNS_10LmaNodeLE0E($this, $lpi_items, $lpi_max, $node) {
 $this = $this | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $node = $node | 0;
 var $1 = 0, $2 = 0, $3 = 0, $lpi_num_0 = 0, $13 = 0, $14 = 0, $22 = 0, $lpi_num_1 = 0, label = 0;
 $1 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 $2 = $node + 4 | 0;
 $3 = $node + 12 | 0;
 $lpi_num_0 = 0;
 while (1) {
  if ($lpi_num_0 >>> 0 >= (HEAPU16[$3 >> 1] | 0) >>> 0) {
   $lpi_num_1 = $lpi_num_0;
   label = 595;
   break;
  }
  $13 = (__ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, (HEAP32[$2 >> 2] | 0) + $lpi_num_0 | 0) | 0) & 16777215;
  $14 = $lpi_items + ($lpi_num_0 << 3) | 0;
  HEAP32[$14 >> 2] = $13 | HEAP32[$14 >> 2] & -268435456 | 16777216;
  HEAP16[$lpi_items + ($lpi_num_0 << 3) + 4 >> 1] = ~~+__ZN10ime_pinyin5NGram11get_uni_psbEj($1, $13);
  $22 = $lpi_num_0 + 1 | 0;
  if ($22 >>> 0 < $lpi_max >>> 0) {
   $lpi_num_0 = $22;
  } else {
   $lpi_num_1 = $22;
   label = 594;
   break;
  }
 }
 if ((label | 0) == 594) {
  return $lpi_num_1 | 0;
 } else if ((label | 0) == 595) {
  return $lpi_num_1 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictTrie9load_dictEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $3 = 0, $8 = 0, $13 = 0, $18 = 0, $31 = 0, $36 = 0, $39 = 0, $44 = 0, $45 = 0, $53 = 0, $56 = 0, $59 = 0, $64 = 0, $85 = 0, $92 = 0, $98 = 0, $i_033 = 0, $last_pos_032_off0 = 0, $last_splid_031 = 0, $105 = 0, $last_pos_0_lcssa = 0, $last_splid_0_lcssa = 0, $107 = 0, $108 = 0, $111 = 0, $splid_028 = 0, $116 = 0, $119 = 0, $_lcssa = 0, $128 = 0, $129 = 0, $133 = 0, $splid1_026 = 0, $134 = 0, $splid1_0 = 0, $140 = 0, $_0 = 0, label = 0;
 if (($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this + 24 | 0;
 if ((_fread($3 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = $this + 28 | 0;
 if ((_fread($8 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $13 = $this + 36 | 0;
 if ((_fread($13 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $18 = $this + 44 | 0;
 if ((_fread($18 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP32[$18 >> 2] | 0) >>> 0 >= (HEAP32[$13 >> 2] | 0) >>> 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 0);
 $31 = $this + 12 | 0;
 HEAP32[$31 >> 2] = _malloc(HEAP32[$3 >> 2] << 4) | 0;
 $36 = $this + 16 | 0;
 HEAP32[$36 >> 2] = _malloc((HEAP32[$8 >> 2] | 0) * 10 | 0) | 0;
 $39 = $this + 32 | 0;
 HEAP32[$39 >> 2] = _malloc(HEAP32[$13 >> 2] | 0) | 0;
 HEAP32[$this + 40 >> 2] = ((HEAP32[$13 >> 2] | 0) >>> 0) / 3 | 0;
 $44 = __ZN10ime_pinyin12SpellingTrie16get_spelling_numEv(__ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0) | 0;
 $45 = $44 + 1 | 0;
 if ((HEAP32[$3 >> 2] | 0) >>> 0 > $45 >>> 0) {
  ___assert_func(3680, 196, 4672, 2640);
  return 0;
 }
 $53 = $this + 20 | 0;
 HEAP32[$53 >> 2] = _malloc($45 << 1) | 0;
 $56 = $this + 48 | 0;
 HEAP32[$56 >> 2] = __Znaj(2400) | 0;
 $59 = $this + 56 | 0;
 HEAP32[$59 >> 2] = __Znaj(400) | 0;
 FUNCTION_TABLE_viii[HEAP32[(HEAP32[$this >> 2] | 0) + 20 >> 2] & 15]($this, 0, 1);
 $64 = HEAP32[$31 >> 2] | 0;
 do {
  if (($64 | 0) != 0) {
   if ((HEAP32[$36 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$39 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$53 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$56 >> 2] | 0) == 0) {
    break;
   }
   if ((HEAP32[$59 >> 2] | 0) == 0) {
    break;
   }
   $85 = _fread($64 | 0, 16, HEAP32[$3 >> 2] | 0, $fp | 0) | 0;
   if (($85 | 0) != (HEAP32[$3 >> 2] | 0)) {
    $_0 = 0;
    return $_0 | 0;
   }
   $92 = _fread(HEAP32[$36 >> 2] | 0, 10, HEAP32[$8 >> 2] | 0, $fp | 0) | 0;
   if (($92 | 0) != (HEAP32[$8 >> 2] | 0)) {
    $_0 = 0;
    return $_0 | 0;
   }
   $98 = _fread(HEAP32[$39 >> 2] | 0, 1, HEAP32[$13 >> 2] | 0, $fp | 0) | 0;
   if (($98 | 0) != (HEAP32[$13 >> 2] | 0)) {
    $_0 = 0;
    return $_0 | 0;
   }
   if ((HEAP32[$3 >> 2] | 0) >>> 0 > 1) {
    $last_splid_031 = 30;
    $last_pos_032_off0 = 0;
    $i_033 = 1;
    while (1) {
     $105 = HEAP16[(HEAP32[$31 >> 2] | 0) + ($i_033 << 4) + 8 >> 1] | 0;
     if (($last_splid_031 & 65535) < ($105 & 65535)) {
      $splid_028 = $last_splid_031;
      while (1) {
       HEAP16[(HEAP32[$53 >> 2] | 0) + (($splid_028 & 65535) - 30 << 1) >> 1] = $last_pos_032_off0;
       $116 = $splid_028 + 1 & 65535;
       $119 = HEAP16[(HEAP32[$31 >> 2] | 0) + ($i_033 << 4) + 8 >> 1] | 0;
       if (($116 & 65535) < ($119 & 65535)) {
        $splid_028 = $116;
       } else {
        $_lcssa = $119;
        break;
       }
      }
     } else {
      $_lcssa = $105;
     }
     HEAP16[(HEAP32[$53 >> 2] | 0) + (($_lcssa & 65535) - 30 << 1) >> 1] = $i_033 & 65535;
     $128 = HEAP16[(HEAP32[$31 >> 2] | 0) + ($i_033 << 4) + 8 >> 1] | 0;
     $129 = $i_033 + 1 | 0;
     if ($129 >>> 0 < (HEAP32[$3 >> 2] | 0) >>> 0) {
      $last_splid_031 = $128;
      $last_pos_032_off0 = $i_033 & 65535;
      $i_033 = $129;
     } else {
      break;
     }
    }
    $last_splid_0_lcssa = $128 + 1 & 65535;
    $last_pos_0_lcssa = $i_033;
   } else {
    $last_splid_0_lcssa = 31;
    $last_pos_0_lcssa = 0;
   }
   $107 = $last_splid_0_lcssa & 65535;
   $108 = $44 + 31 | 0;
   if ($107 >>> 0 >= $108 >>> 0) {
    $_0 = 1;
    return $_0 | 0;
   }
   $111 = $last_pos_0_lcssa + 1 & 65535;
   $splid1_026 = $last_splid_0_lcssa;
   $133 = $107;
   while (1) {
    $134 = $133 - 30 | 0;
    if ($134 >>> 0 >= $45 >>> 0) {
     label = 622;
     break;
    }
    HEAP16[(HEAP32[$53 >> 2] | 0) + ($134 << 1) >> 1] = $111;
    $splid1_0 = $splid1_026 + 1 & 65535;
    $140 = $splid1_0 & 65535;
    if ($140 >>> 0 < $108 >>> 0) {
     $splid1_026 = $splid1_0;
     $133 = $140;
    } else {
     $_0 = 1;
     label = 635;
     break;
    }
   }
   if ((label | 0) == 622) {
    ___assert_func(3680, 238, 4672, 1696);
    return 0;
   } else if ((label | 0) == 635) {
    return $_0 | 0;
   }
  }
 } while (0);
 __ZN10ime_pinyin8DictTrie13free_resourceEb($this, 0);
 $_0 = 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictTrie16reset_milestonesEtt($this, $from_step, $from_handle) {
 $this = $this | 0;
 $from_step = $from_step | 0;
 $from_handle = $from_handle | 0;
 var $9 = 0;
 if ($from_step << 16 >> 16 == 0) {
  HEAP16[$this + 52 >> 1] = 0;
  HEAP16[$this + 60 >> 1] = 1;
  return;
 }
 if ($from_handle << 16 >> 16 == 0) {
  return;
 }
 $9 = $this + 60 | 0;
 if ((HEAPU16[$9 >> 1] | 0) <= ($from_handle & 65535)) {
  return;
 }
 HEAP16[$9 >> 1] = $from_handle;
 HEAP16[$this + 52 >> 1] = HEAP16[(HEAP32[$this + 56 >> 2] | 0) + (($from_handle & 65535) << 2) >> 1] | 0;
 return;
}
function __ZN10ime_pinyin8DictTrie23get_homo_idx_buf_offsetEPKNS_10LmaNodeGE1E($this, $node) {
 $this = $this | 0;
 $node = $node | 0;
 return (HEAPU8[$node + 9 | 0] | 0) << 16 | (HEAPU16[$node + 2 >> 1] | 0) | 0;
}
function __ZN10ime_pinyin8DictTrie14get_son_offsetEPKNS_10LmaNodeGE1E($this, $node) {
 $this = $this | 0;
 $node = $node | 0;
 return (HEAPU8[$node + 8 | 0] | 0) << 16 | (HEAPU16[$node >> 1] | 0) | 0;
}
function __ZN10ime_pinyin8DictTrie15fill_lpi_bufferEPNS_10LmaPsbItemEjjPNS_10LmaNodeGE1Et($this, $lpi_items, $lpi_max, $homo_buf_off, $node, $lma_len) {
 $this = $this | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $homo_buf_off = $homo_buf_off | 0;
 $node = $node | 0;
 $lma_len = $lma_len | 0;
 var $1 = 0, $2 = 0, $5 = 0, $lpi_num_0 = 0, $14 = 0, $15 = 0, $23 = 0, $lpi_num_1 = 0, label = 0;
 $1 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 $2 = $node + 7 | 0;
 $5 = ($lma_len & 65535) << 24 & 251658240;
 $lpi_num_0 = 0;
 while (1) {
  if ($lpi_num_0 >>> 0 >= (HEAPU8[$2] | 0) >>> 0) {
   $lpi_num_1 = $lpi_num_0;
   label = 653;
   break;
  }
  $14 = (__ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, $lpi_num_0 + $homo_buf_off | 0) | 0) & 16777215;
  $15 = $lpi_items + ($lpi_num_0 << 3) | 0;
  HEAP32[$15 >> 2] = $14 | $5 | HEAP32[$15 >> 2] & -268435456;
  HEAP16[$lpi_items + ($lpi_num_0 << 3) + 4 >> 1] = ~~+__ZN10ime_pinyin5NGram11get_uni_psbEj($1, $14);
  $23 = $lpi_num_0 + 1 | 0;
  if ($23 >>> 0 < $lpi_max >>> 0) {
   $lpi_num_0 = $23;
  } else {
   $lpi_num_1 = $23;
   label = 654;
   break;
  }
 }
 if ((label | 0) == 654) {
  return $lpi_num_1 | 0;
 } else if ((label | 0) == 653) {
  return $lpi_num_1 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictTrie11extend_dictEtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) {
 $this = $this | 0;
 $from_handle = $from_handle | 0;
 $dep = $dep | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $lpi_num = $lpi_num | 0;
 var $5 = 0, $_0 = 0;
 if (($dep | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = HEAP16[$dep + 80 >> 1] | 0;
 if ($from_handle << 16 >> 16 == 0) {
  if ($5 << 16 >> 16 != 0) {
   ___assert_func(3680, 375, 5296, 1152);
   return 0;
  }
  $_0 = __ZN10ime_pinyin8DictTrie12extend_dict0EtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) | 0;
  return $_0 | 0;
 }
 if ($5 << 16 >> 16 == 1) {
  $_0 = __ZN10ime_pinyin8DictTrie12extend_dict1EtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) | 0;
  return $_0 | 0;
 } else {
  $_0 = __ZN10ime_pinyin8DictTrie12extend_dict2EtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) | 0;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictTrie12extend_dict0EtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) {
 $this = $this | 0;
 $from_handle = $from_handle | 0;
 $dep = $dep | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $lpi_num = $lpi_num | 0;
 var $9 = 0, $11 = 0, $13 = 0, $15 = 0, $16 = 0, $18 = 0, $21 = 0, $24 = 0, $25 = 0, $26 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $son_pos_0 = 0, $ret_handle_0 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $63 = 0, $66 = 0, $75 = 0, $82 = 0, $90 = 0, $103 = 0, $ret_handle_1 = 0, $ret_handle_2 = 0, label = 0;
 if (!(($dep | 0) != 0 & $from_handle << 16 >> 16 == 0)) {
  ___assert_func(3680, 391, 5168, 976);
  return 0;
 }
 HEAP32[$lpi_num >> 2] = 0;
 $9 = HEAP16[$dep + (HEAPU16[$dep + 80 >> 1] << 1) >> 1] | 0;
 $11 = HEAP16[$dep + 88 >> 1] | 0;
 $13 = HEAP16[$dep + 90 >> 1] | 0;
 $15 = __ZN10ime_pinyin8LpiCache9is_cachedEt(__ZN10ime_pinyin8LpiCache12get_instanceEv() | 0, $9) | 0;
 $16 = $this + 12 | 0;
 $18 = $11 & 65535;
 $21 = HEAP32[$this + 20 >> 2] | 0;
 $24 = HEAPU16[$21 + ($18 - 30 << 1) >> 1] | 0;
 $25 = $13 & 65535;
 $26 = $25 + $18 | 0;
 $30 = HEAPU16[$21 + ($26 - 30 << 1) >> 1] | 0;
 $31 = HEAP32[$16 >> 2] | 0;
 $32 = $this + 60 | 0;
 $33 = $this + 52 | 0;
 $34 = $this + 48 | 0;
 $35 = $25 << 24;
 $36 = $this + 56 | 0;
 $37 = $26 - 1 | 0;
 $38 = $this + 8 | 0;
 $ret_handle_0 = 0;
 $son_pos_0 = $24;
 while (1) {
  if ($son_pos_0 >>> 0 >= $30 >>> 0) {
   $ret_handle_2 = $ret_handle_0;
   label = 686;
   break;
  }
  if ((HEAP32[$31 >> 2] | 0) != 1) {
   label = 673;
   break;
  }
  $46 = HEAP32[$16 >> 2] | 0;
  $47 = $46 + ($son_pos_0 << 4) | 0;
  $48 = $46 + ($son_pos_0 << 4) + 8 | 0;
  $49 = HEAP16[$48 >> 1] | 0;
  if (!(($49 & 65535) >= ($11 & 65535) & ($49 & 65535 | 0) < ($26 | 0))) {
   label = 675;
   break;
  }
  do {
   if (!$15) {
    if ((HEAP32[$lpi_num >> 2] | 0) >>> 0 >= $lpi_max >>> 0) {
     break;
    }
    if (!(($son_pos_0 | 0) == ($24 | 0) | (__ZNK10ime_pinyin12SpellingTrie16is_half_id_yunmuEt(HEAP32[$38 >> 2] | 0, $9) | 0) ^ 1)) {
     break;
    }
    $63 = HEAP32[$lpi_num >> 2] | 0;
    $66 = __ZN10ime_pinyin8DictTrie15fill_lpi_bufferEPNS_10LmaPsbItemEjPNS_10LmaNodeLE0E($this, $lpi_items + ($63 << 3) | 0, $lpi_max - $63 | 0, $47) | 0;
    HEAP32[$lpi_num >> 2] = (HEAP32[$lpi_num >> 2] | 0) + $66;
   }
  } while (0);
  do {
   if ((HEAP16[$48 >> 1] | 0) == $11 << 16 >> 16) {
    if ((HEAPU16[$32 >> 1] | 0) >= 100) {
     $ret_handle_1 = $ret_handle_0;
     break;
    }
    $75 = HEAP16[$33 >> 1] | 0;
    if (($75 & 65535) >= 600) {
     $ret_handle_1 = $ret_handle_0;
     break;
    }
    $82 = (HEAP32[$34 >> 2] | 0) + (($75 & 65535) << 2) | 0;
    HEAP32[$82 >> 2] = HEAP32[$82 >> 2] & -16777216 | $son_pos_0 & 16777215;
    $90 = (HEAP32[$34 >> 2] | 0) + (HEAPU16[$33 >> 1] << 2) | 0;
    HEAP32[$90 >> 2] = HEAP32[$90 >> 2] & 16777215 | $35;
    HEAP16[(HEAP32[$36 >> 2] | 0) + (HEAPU16[$32 >> 1] << 2) >> 1] = HEAP16[$33 >> 1] | 0;
    HEAP16[(HEAP32[$36 >> 2] | 0) + (HEAPU16[$32 >> 1] << 2) + 2 >> 1] = 1;
    $103 = HEAP16[$32 >> 1] | 0;
    HEAP16[$33 >> 1] = (HEAP16[$33 >> 1] | 0) + 1 & 65535;
    HEAP16[$32 >> 1] = (HEAP16[$32 >> 1] | 0) + 1 & 65535;
    $ret_handle_1 = $103;
   } else {
    $ret_handle_1 = $ret_handle_0;
   }
  } while (0);
  if ((HEAPU16[$48 >> 1] | 0) < ($37 | 0)) {
   $ret_handle_0 = $ret_handle_1;
   $son_pos_0 = $son_pos_0 + 1 | 0;
  } else {
   $ret_handle_2 = $ret_handle_1;
   label = 687;
   break;
  }
 }
 if ((label | 0) == 675) {
  ___assert_func(3680, 410, 5168, 624);
  return 0;
 } else if ((label | 0) == 686) {
  return $ret_handle_2 | 0;
 } else if ((label | 0) == 687) {
  return $ret_handle_2 | 0;
 } else if ((label | 0) == 673) {
  ___assert_func(3680, 408, 5168, 824);
  return 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictTrie12extend_dict1EtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) {
 $this = $this | 0;
 $from_handle = $from_handle | 0;
 $dep = $dep | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $lpi_num = $lpi_num | 0;
 var $3 = 0, $6 = 0, $12 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $28 = 0, $30 = 0, $31 = 0, $ret_val_048 = 0, $h_pos_047 = 0, $p_mark_sroa_0_0_copyload = 0, $39 = 0, $41 = 0, $43 = 0, $ret_val_145 = 0, $ext_pos_044 = 0, $44 = 0, $_sum = 0, $45 = 0, $46 = 0, $found_start_0 = 0, $found_num_0 = 0, $son_pos_0 = 0, $52 = 0, $57 = 0, $_sum41 = 0, $58 = 0, $59 = 0, $60 = 0, $65 = 0, $71 = 0, $found_start_2 = 0, $found_num_1 = 0, $93 = 0, $102 = 0, $110 = 0, $ret_val_2 = 0, $127 = 0, $128 = 0, $ret_val_1_lcssa = 0, $130 = 0, $140 = 0, $ret_handle_0 = 0, label = 0;
 if (($dep | 0) == 0) {
  ___assert_func(3680, 450, 5040, 464);
  return 0;
 }
 $3 = $from_handle & 65535;
 if ($from_handle << 16 >> 16 == 0) {
  ___assert_func(3680, 450, 5040, 464);
  return 0;
 }
 $6 = $this + 60 | 0;
 if ((HEAPU16[$6 >> 1] | 0) <= ($from_handle & 65535)) {
  ___assert_func(3680, 450, 5040, 464);
  return 0;
 }
 $12 = HEAP16[$dep + 88 >> 1] | 0;
 $14 = HEAP16[$dep + 90 >> 1] | 0;
 $15 = $this + 56 | 0;
 $16 = HEAP32[$15 >> 2] | 0;
 $17 = $16 + ($3 << 2) + 2 | 0;
 if ((HEAP16[$17 >> 1] | 0) == 0) {
  $ret_handle_0 = 0;
  return $ret_handle_0 | 0;
 }
 $20 = $16 + ($3 << 2) | 0;
 $21 = $this + 48 | 0;
 $22 = $this + 12 | 0;
 $23 = $this + 28 | 0;
 $24 = $this + 16 | 0;
 $25 = $12 & 65535;
 $28 = $25 - 1 + ($14 & 65535) | 0;
 $30 = ($14 & 65535) + $25 | 0;
 $31 = $this + 52 | 0;
 $h_pos_047 = 0;
 $ret_val_048 = 0;
 L847 : while (1) {
  $p_mark_sroa_0_0_copyload = HEAP32[(HEAP32[$21 >> 2] | 0) + ((HEAPU16[$20 >> 1] | 0) + ($h_pos_047 & 65535) << 2) >> 2] | 0;
  $39 = $p_mark_sroa_0_0_copyload >>> 24;
  if (($39 | 0) == 0) {
   $ret_val_1_lcssa = $ret_val_048;
  } else {
   $41 = $p_mark_sroa_0_0_copyload & 16777215;
   $ext_pos_044 = 0;
   $ret_val_145 = $ret_val_048;
   $43 = 0;
   while (1) {
    $44 = HEAP32[$22 >> 2] | 0;
    $_sum = $43 + $41 | 0;
    $45 = $44 + ($_sum << 4) + 10 | 0;
    $46 = $44 + ($_sum << 4) | 0;
    $son_pos_0 = 0;
    $found_num_0 = 0;
    $found_start_0 = 0;
    while (1) {
     if ($son_pos_0 >>> 0 >= (HEAPU16[$45 >> 1] | 0) >>> 0) {
      $ret_val_2 = $ret_val_145;
      break;
     }
     $52 = HEAP32[$46 >> 2] | 0;
     if ($52 >>> 0 > (HEAP32[$23 >> 2] | 0) >>> 0) {
      label = 699;
      break L847;
     }
     $57 = HEAP32[$24 >> 2] | 0;
     $_sum41 = $52 + $son_pos_0 | 0;
     $58 = $57 + ($_sum41 * 10 | 0) | 0;
     $59 = $57 + ($_sum41 * 10 | 0) + 4 | 0;
     $60 = HEAP16[$59 >> 1] | 0;
     if (($60 & 65535) >= ($12 & 65535) & ($60 & 65535 | 0) < ($30 | 0)) {
      $65 = HEAP32[$lpi_num >> 2] | 0;
      if ($65 >>> 0 < $lpi_max >>> 0) {
       $71 = __ZN10ime_pinyin8DictTrie15fill_lpi_bufferEPNS_10LmaPsbItemEjjPNS_10LmaNodeGE1Et($this, $lpi_items + ($65 << 3) | 0, $lpi_max - $65 | 0, __ZN10ime_pinyin8DictTrie23get_homo_idx_buf_offsetEPKNS_10LmaNodeGE1E(0, $58) | 0, $58, 2) | 0;
       HEAP32[$lpi_num >> 2] = (HEAP32[$lpi_num >> 2] | 0) + $71;
      }
      $found_num_1 = $found_num_0 + 1 | 0;
      $found_start_2 = ($found_num_0 | 0) == 0 ? $son_pos_0 : $found_start_0;
     } else {
      $found_num_1 = $found_num_0;
      $found_start_2 = $found_start_0;
     }
     if ((HEAPU16[$59 >> 1] | 0) >= ($28 | 0)) {
      label = 706;
      break;
     }
     if (($son_pos_0 | 0) == ((HEAPU16[$45 >> 1] | 0) - 1 | 0)) {
      label = 706;
      break;
     } else {
      $son_pos_0 = $son_pos_0 + 1 | 0;
      $found_num_0 = $found_num_1;
      $found_start_0 = $found_start_2;
     }
    }
    do {
     if ((label | 0) == 706) {
      label = 0;
      if (($found_num_1 | 0) == 0) {
       $ret_val_2 = $ret_val_145;
       break;
      }
      do {
       if ((HEAPU16[$6 >> 1] | 0) < 100) {
        $93 = HEAP16[$31 >> 1] | 0;
        if (($93 & 65535) >= 600) {
         break;
        }
        $102 = (HEAP32[$21 >> 2] | 0) + (($93 & 65535) << 2) | 0;
        HEAP32[$102 >> 2] = HEAP32[$102 >> 2] & -16777216 | (HEAP32[$46 >> 2] | 0) + $found_start_2 & 16777215;
        $110 = (HEAP32[$21 >> 2] | 0) + (HEAPU16[$31 >> 1] << 2) | 0;
        HEAP32[$110 >> 2] = HEAP32[$110 >> 2] & 16777215 | $found_num_1 << 24;
        if (($ret_val_145 | 0) == 0) {
         HEAP16[(HEAP32[$15 >> 2] | 0) + (HEAPU16[$6 >> 1] << 2) >> 1] = HEAP16[$31 >> 1] | 0;
        }
        HEAP16[$31 >> 1] = (HEAP16[$31 >> 1] | 0) + 1 & 65535;
       }
      } while (0);
      $ret_val_2 = $ret_val_145 + 1 | 0;
     }
    } while (0);
    $127 = $ext_pos_044 + 1 & 65535;
    $128 = $127 & 65535;
    if ($128 >>> 0 < $39 >>> 0) {
     $ext_pos_044 = $127;
     $ret_val_145 = $ret_val_2;
     $43 = $128;
    } else {
     $ret_val_1_lcssa = $ret_val_2;
     break;
    }
   }
  }
  $130 = $h_pos_047 + 1 & 65535;
  if (($130 & 65535) < (HEAPU16[$17 >> 1] | 0)) {
   $h_pos_047 = $130;
   $ret_val_048 = $ret_val_1_lcssa;
  } else {
   break;
  }
 }
 if ((label | 0) == 699) {
  ___assert_func(3680, 472, 5040, 4312);
  return 0;
 }
 if (($ret_val_1_lcssa | 0) == 0) {
  $ret_handle_0 = 0;
  return $ret_handle_0 | 0;
 }
 HEAP16[(HEAP32[$15 >> 2] | 0) + (HEAPU16[$6 >> 1] << 2) + 2 >> 1] = $ret_val_1_lcssa & 65535;
 $140 = HEAP16[$6 >> 1] | 0;
 HEAP16[$6 >> 1] = $140 + 1 & 65535;
 $ret_handle_0 = $140;
 return $ret_handle_0 | 0;
}
function __ZN10ime_pinyin8DictTrie12extend_dict2EtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) {
 $this = $this | 0;
 $from_handle = $from_handle | 0;
 $dep = $dep | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $lpi_num = $lpi_num | 0;
 var $3 = 0, $6 = 0, $12 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $26 = 0, $28 = 0, $29 = 0, $30 = 0, $ret_val_049 = 0, $h_pos_048 = 0, $p_mark_sroa_0_0_copyload = 0, $38 = 0, $40 = 0, $42 = 0, $ret_val_146 = 0, $ext_pos_045 = 0, $43 = 0, $_sum = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $found_start_0 = 0, $found_num_0 = 0, $son_pos_0 = 0, $60 = 0, $_sum43 = 0, $62 = 0, $63 = 0, $64 = 0, $69 = 0, $72 = 0, $77 = 0, $found_start_2 = 0, $found_num_1 = 0, $99 = 0, $103 = 0, $108 = 0, $116 = 0, $ret_val_2 = 0, $133 = 0, $134 = 0, $ret_val_1_lcssa = 0, $136 = 0, $146 = 0, $ret_handle_0 = 0, label = 0;
 if (($dep | 0) == 0) {
  ___assert_func(3680, 528, 4912, 464);
  return 0;
 }
 $3 = $from_handle & 65535;
 if ($from_handle << 16 >> 16 == 0) {
  ___assert_func(3680, 528, 4912, 464);
  return 0;
 }
 $6 = $this + 60 | 0;
 if ((HEAPU16[$6 >> 1] | 0) <= ($from_handle & 65535)) {
  ___assert_func(3680, 528, 4912, 464);
  return 0;
 }
 $12 = HEAP16[$dep + 88 >> 1] | 0;
 $14 = HEAP16[$dep + 90 >> 1] | 0;
 $15 = $this + 56 | 0;
 $16 = HEAP32[$15 >> 2] | 0;
 $17 = $16 + ($3 << 2) + 2 | 0;
 if ((HEAP16[$17 >> 1] | 0) == 0) {
  $ret_handle_0 = 0;
  return $ret_handle_0 | 0;
 }
 $20 = $16 + ($3 << 2) | 0;
 $21 = $this + 48 | 0;
 $22 = $this + 16 | 0;
 $23 = $12 & 65535;
 $26 = $23 - 1 + ($14 & 65535) | 0;
 $28 = ($14 & 65535) + $23 | 0;
 $29 = $dep + 80 | 0;
 $30 = $this + 52 | 0;
 $h_pos_048 = 0;
 $ret_val_049 = 0;
 L896 : while (1) {
  $p_mark_sroa_0_0_copyload = HEAP32[(HEAP32[$21 >> 2] | 0) + ((HEAPU16[$20 >> 1] | 0) + ($h_pos_048 & 65535) << 2) >> 2] | 0;
  $38 = $p_mark_sroa_0_0_copyload >>> 24;
  if (($38 | 0) == 0) {
   $ret_val_1_lcssa = $ret_val_049;
  } else {
   $40 = $p_mark_sroa_0_0_copyload & 16777215;
   $ext_pos_045 = 0;
   $ret_val_146 = $ret_val_049;
   $42 = 0;
   while (1) {
    $43 = HEAP32[$22 >> 2] | 0;
    $_sum = $42 + $40 | 0;
    $44 = $43 + ($_sum * 10 | 0) | 0;
    $45 = $43 + ($_sum * 10 | 0) + 6 | 0;
    $46 = $44 | 0;
    $47 = $43 + ($_sum * 10 | 0) + 8 | 0;
    $son_pos_0 = 0;
    $found_num_0 = 0;
    $found_start_0 = 0;
    while (1) {
     if ($son_pos_0 >>> 0 >= (HEAPU8[$45] | 0) >>> 0) {
      $ret_val_2 = $ret_val_146;
      break;
     }
     if ((HEAP16[$46 >> 1] | 0) == 0) {
      if ((HEAP8[$47] | 0) == 0) {
       label = 736;
       break L896;
      }
     }
     $60 = HEAP32[$22 >> 2] | 0;
     $_sum43 = (__ZN10ime_pinyin8DictTrie14get_son_offsetEPKNS_10LmaNodeGE1E(0, $44) | 0) + $son_pos_0 | 0;
     $62 = $60 + ($_sum43 * 10 | 0) | 0;
     $63 = $60 + ($_sum43 * 10 | 0) + 4 | 0;
     $64 = HEAP16[$63 >> 1] | 0;
     if (($64 & 65535) >= ($12 & 65535) & ($64 & 65535 | 0) < ($28 | 0)) {
      $69 = HEAP32[$lpi_num >> 2] | 0;
      if ($69 >>> 0 < $lpi_max >>> 0) {
       $72 = __ZN10ime_pinyin8DictTrie23get_homo_idx_buf_offsetEPKNS_10LmaNodeGE1E(0, $62) | 0;
       $77 = __ZN10ime_pinyin8DictTrie15fill_lpi_bufferEPNS_10LmaPsbItemEjjPNS_10LmaNodeGE1Et($this, $lpi_items + ($69 << 3) | 0, $lpi_max - $69 | 0, $72, $62, (HEAP16[$29 >> 1] | 0) + 1 & 65535) | 0;
       HEAP32[$lpi_num >> 2] = (HEAP32[$lpi_num >> 2] | 0) + $77;
      }
      $found_num_1 = $found_num_0 + 1 | 0;
      $found_start_2 = ($found_num_0 | 0) == 0 ? $son_pos_0 : $found_start_0;
     } else {
      $found_num_1 = $found_num_0;
      $found_start_2 = $found_start_0;
     }
     if ((HEAPU16[$63 >> 1] | 0) >= ($26 | 0)) {
      label = 743;
      break;
     }
     if (($son_pos_0 | 0) == ((HEAPU8[$45] | 0) - 1 | 0)) {
      label = 743;
      break;
     } else {
      $son_pos_0 = $son_pos_0 + 1 | 0;
      $found_num_0 = $found_num_1;
      $found_start_0 = $found_start_2;
     }
    }
    do {
     if ((label | 0) == 743) {
      label = 0;
      if (($found_num_1 | 0) == 0) {
       $ret_val_2 = $ret_val_146;
       break;
      }
      do {
       if ((HEAPU16[$6 >> 1] | 0) < 100) {
        $99 = HEAP16[$30 >> 1] | 0;
        if (($99 & 65535) >= 600) {
         break;
        }
        $103 = (__ZN10ime_pinyin8DictTrie14get_son_offsetEPKNS_10LmaNodeGE1E(0, $44) | 0) + $found_start_2 | 0;
        $108 = (HEAP32[$21 >> 2] | 0) + (($99 & 65535) << 2) | 0;
        HEAP32[$108 >> 2] = HEAP32[$108 >> 2] & -16777216 | $103 & 16777215;
        $116 = (HEAP32[$21 >> 2] | 0) + (HEAPU16[$30 >> 1] << 2) | 0;
        HEAP32[$116 >> 2] = HEAP32[$116 >> 2] & 16777215 | $found_num_1 << 24;
        if (($ret_val_146 | 0) == 0) {
         HEAP16[(HEAP32[$15 >> 2] | 0) + (HEAPU16[$6 >> 1] << 2) >> 1] = HEAP16[$30 >> 1] | 0;
        }
        HEAP16[$30 >> 1] = (HEAP16[$30 >> 1] | 0) + 1 & 65535;
       }
      } while (0);
      $ret_val_2 = $ret_val_146 + 1 | 0;
     }
    } while (0);
    $133 = $ext_pos_045 + 1 & 65535;
    $134 = $133 & 65535;
    if ($134 >>> 0 < $38 >>> 0) {
     $ext_pos_045 = $133;
     $ret_val_146 = $ret_val_2;
     $42 = $134;
    } else {
     $ret_val_1_lcssa = $ret_val_2;
     break;
    }
   }
  }
  $136 = $h_pos_048 + 1 & 65535;
  if (($136 & 65535) < (HEAPU16[$17 >> 1] | 0)) {
   $h_pos_048 = $136;
   $ret_val_049 = $ret_val_1_lcssa;
  } else {
   break;
  }
 }
 if ((label | 0) == 736) {
  ___assert_func(3680, 551, 4912, 4112);
  return 0;
 }
 if (($ret_val_1_lcssa | 0) == 0) {
  $ret_handle_0 = 0;
  return $ret_handle_0 | 0;
 }
 HEAP16[(HEAP32[$15 >> 2] | 0) + (HEAPU16[$6 >> 1] << 2) + 2 >> 1] = $ret_val_1_lcssa & 65535;
 $146 = HEAP16[$6 >> 1] | 0;
 HEAP16[$6 >> 1] = $146 + 1 & 65535;
 $ret_handle_0 = $146;
 return $ret_handle_0 | 0;
}
function __ZN10ime_pinyin8DictTrie10try_extendEPKttj($this, $splids, $splid_num, $id_lemma) {
 $this = $this | 0;
 $splids = $splids | 0;
 $splid_num = $splid_num | 0;
 $id_lemma = $id_lemma | 0;
 var $str = 0, $15 = 0, $17 = 0, $18 = 0, $19 = 0, $21 = 0, $node_054 = 0, $pos_053 = 0, $node_son_052 = 0, $node_son1_051 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $son_pos_0 = 0, $node_son_1 = 0, $32 = 0, $37 = 0, $_sum38 = 0, $38 = 0, $node_son_2 = 0, $48 = 0, $49 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $son_pos2_0 = 0, $node_son1_1 = 0, $56 = 0, $66 = 0, $_sum = 0, $68 = 0, $node_son1_2 = 0, $node_son1_3 = 0, $node_son_3 = 0, $node_1_in = 0, $node_1 = 0, $79 = 0, $node_0_lcssa = 0, $87 = 0, $89 = 0, $90 = 0, $91 = 0, $homo_pos_0 = 0, $97 = 0, $105 = 0, $108 = 0, $homo_pos6_0 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $str = sp | 0;
 if ($splid_num << 16 >> 16 == 0 | ($splids | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $15 = (HEAP32[$this + 12 >> 2] | 0) + (HEAPU16[(HEAP32[$this + 20 >> 2] | 0) + ((HEAPU16[$splids >> 1] | 0) - 30 << 1) >> 1] << 4) | 0;
 L938 : do {
  if (($splid_num & 65535) > 1) {
   $17 = $this + 16 | 0;
   $18 = $this + 28 | 0;
   $19 = $this + 16 | 0;
   $node_son1_051 = 0;
   $node_son_052 = 0;
   $pos_053 = 1;
   $node_054 = $15;
   $21 = 1;
   L940 : while (1) {
    if ($pos_053 << 16 >> 16 == 1) {
     $24 = $node_054 + 10 | 0;
     $25 = HEAP16[$24 >> 1] | 0;
     $26 = $node_054;
     $27 = $splids + ($21 << 1) | 0;
     $node_son_1 = $node_son_052;
     $son_pos_0 = 0;
     while (1) {
      if (($son_pos_0 & 65535) >= ($25 & 65535)) {
       $node_son_2 = $node_son_1;
       break;
      }
      $32 = HEAP32[$26 >> 2] | 0;
      if ($32 >>> 0 > (HEAP32[$18 >> 2] | 0) >>> 0) {
       label = 768;
       break L940;
      }
      $37 = HEAP32[$19 >> 2] | 0;
      $_sum38 = $32 + ($son_pos_0 & 65535) | 0;
      $38 = $37 + ($_sum38 * 10 | 0) | 0;
      if ((HEAP16[$37 + ($_sum38 * 10 | 0) + 4 >> 1] | 0) == (HEAP16[$27 >> 1] | 0)) {
       $node_son_2 = $38;
       break;
      } else {
       $node_son_1 = $38;
       $son_pos_0 = $son_pos_0 + 1 & 65535;
      }
     }
     if (($son_pos_0 & 65535) < (HEAPU16[$24 >> 1] | 0)) {
      $node_1_in = $node_son_2;
      $node_son_3 = $node_son_2;
      $node_son1_3 = $node_son1_051;
     } else {
      $_0 = 0;
      label = 787;
      break;
     }
    } else {
     $48 = $node_054;
     $49 = $node_054 + 6 | 0;
     $51 = HEAPU8[$49] | 0;
     $52 = $node_054;
     $53 = $node_054 + 8 | 0;
     $54 = $splids + ($21 << 1) | 0;
     $node_son1_1 = $node_son1_051;
     $son_pos2_0 = 0;
     while (1) {
      $56 = $son_pos2_0 & 65535;
      if ($56 >>> 0 >= $51 >>> 0) {
       $node_son1_2 = $node_son1_1;
       break;
      }
      if ((HEAP16[$52 >> 1] | 0) == 0) {
       if ((HEAP8[$53] | 0) == 0) {
        label = 775;
        break L940;
       }
      }
      $66 = HEAP32[$17 >> 2] | 0;
      $_sum = (__ZN10ime_pinyin8DictTrie14get_son_offsetEPKNS_10LmaNodeGE1E(0, $48) | 0) + $56 | 0;
      $68 = $66 + ($_sum * 10 | 0) | 0;
      if ((HEAP16[$66 + ($_sum * 10 | 0) + 4 >> 1] | 0) == (HEAP16[$54 >> 1] | 0)) {
       $node_son1_2 = $68;
       break;
      } else {
       $node_son1_1 = $68;
       $son_pos2_0 = $son_pos2_0 + 1 & 65535;
      }
     }
     if ($56 >>> 0 < (HEAPU8[$49] | 0) >>> 0) {
      $node_1_in = $node_son1_2;
      $node_son_3 = $node_son_052;
      $node_son1_3 = $node_son1_2;
     } else {
      $_0 = 0;
      label = 789;
      break;
     }
    }
    $node_1 = $node_1_in;
    $79 = $pos_053 + 1 & 65535;
    if (($79 & 65535) < ($splid_num & 65535)) {
     $node_son1_051 = $node_son1_3;
     $node_son_052 = $node_son_3;
     $pos_053 = $79;
     $node_054 = $node_1;
     $21 = $79 & 65535;
    } else {
     $node_0_lcssa = $node_1;
     break L938;
    }
   }
   if ((label | 0) == 775) {
    ___assert_func(3680, 632, 5424, 3704);
    return 0;
   } else if ((label | 0) == 768) {
    ___assert_func(3680, 616, 5424, 3944);
    return 0;
   } else if ((label | 0) == 787) {
    STACKTOP = sp;
    return $_0 | 0;
   } else if ((label | 0) == 789) {
    STACKTOP = sp;
    return $_0 | 0;
   }
  } else {
   $node_0_lcssa = $15;
  }
 } while (0);
 if ($splid_num << 16 >> 16 == 1) {
  $87 = HEAPU16[$node_0_lcssa + 12 >> 1] | 0;
  $89 = $node_0_lcssa + 4 | 0;
  $90 = $this;
  $91 = $str | 0;
  $homo_pos_0 = 0;
  while (1) {
   if ($homo_pos_0 >>> 0 >= $87 >>> 0) {
    $_0 = 0;
    label = 792;
    break;
   }
   $97 = __ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, (HEAP32[$89 >> 2] | 0) + $homo_pos_0 | 0) | 0;
   FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$90 >> 2] | 0) + 32 >> 2] & 31]($this, $97, $91, 2) | 0;
   if (($97 | 0) == ($id_lemma | 0)) {
    $_0 = 1;
    label = 793;
    break;
   } else {
    $homo_pos_0 = $homo_pos_0 + 1 | 0;
   }
  }
  if ((label | 0) == 792) {
   STACKTOP = sp;
   return $_0 | 0;
  } else if ((label | 0) == 793) {
   STACKTOP = sp;
   return $_0 | 0;
  }
 } else {
  $105 = $node_0_lcssa;
  $108 = HEAPU8[$node_0_lcssa + 7 | 0] | 0;
  $homo_pos6_0 = 0;
  while (1) {
   if ($homo_pos6_0 >>> 0 >= $108 >>> 0) {
    $_0 = 0;
    label = 790;
    break;
   }
   if ((__ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, (__ZN10ime_pinyin8DictTrie23get_homo_idx_buf_offsetEPKNS_10LmaNodeGE1E(0, $105) | 0) + $homo_pos6_0 | 0) | 0) == ($id_lemma | 0)) {
    $_0 = 1;
    label = 791;
    break;
   } else {
    $homo_pos6_0 = $homo_pos6_0 + 1 | 0;
   }
  }
  if ((label | 0) == 790) {
   STACKTOP = sp;
   return $_0 | 0;
  } else if ((label | 0) == 791) {
   STACKTOP = sp;
   return $_0 | 0;
  }
 }
 return 0;
}
function __ZN10ime_pinyin8DictTrie10close_dictEv($this) {
 $this = $this | 0;
 return 1;
}
function __ZN10ime_pinyin8DictTrie16number_of_lemmasEv($this) {
 $this = $this | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie9put_lemmaEPtS1_tt($this, $lemma_str, $splids, $lemma_len, $count) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 $count = $count | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie12update_lemmaEjsb($this, $lemma_id, $delta_count, $selected) {
 $this = $this | 0;
 $lemma_id = $lemma_id | 0;
 $delta_count = $delta_count | 0;
 $selected = $selected | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie12get_lemma_idEPtS1_t($this, $lemma_str, $splids, $lemma_len) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie15get_lemma_scoreEj($this, $lemma_id) {
 $this = $this | 0;
 $lemma_id = $lemma_id | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie15get_lemma_scoreEPtS1_t($this, $lemma_str, $splids, $lemma_len) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie12remove_lemmaEj($this, $lemma_id) {
 $this = $this | 0;
 $lemma_id = $lemma_id | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie21get_total_lemma_countEv($this) {
 $this = $this | 0;
 return 0;
}
function __ZN10ime_pinyin8DictTrie11flush_cacheEv($this) {
 $this = $this | 0;
 return;
}
function __ZN10ime_pinyin12AtomDictBaseD1Ev($this) {
 $this = $this | 0;
 return;
}
function __ZN10ime_pinyin12MatrixSearch22reset_pointers_to_nullEv($this) {
 $this = $this | 0;
 HEAP32[$this + 12 >> 2] = 0;
 HEAP32[$this + 16 >> 2] = 0;
 HEAP32[$this + 20 >> 2] = 0;
 HEAP32[$this + 76 >> 2] = 0;
 HEAP32[$this + 80 >> 2] = 0;
 HEAP32[$this + 88 >> 2] = 0;
 HEAP32[$this + 96 >> 2] = 0;
 HEAP32[$this + 100 >> 2] = 0;
 HEAP32[$this + 104 >> 2] = 0;
 return;
}
function __ZN10ime_pinyin8DictTrie13get_lemma_strEjPtt($this, $id_lemma, $str_buf, $str_max) {
 $this = $this | 0;
 $id_lemma = $id_lemma | 0;
 $str_buf = $str_buf | 0;
 $str_max = $str_max | 0;
 return __ZN10ime_pinyin8DictList13get_lemma_strEjPtt(HEAP32[$this + 4 >> 2] | 0, $id_lemma, $str_buf, $str_max) | 0;
}
function __ZN10ime_pinyin8DictTrie31set_total_lemma_count_of_othersEj($this, $count) {
 $this = $this | 0;
 $count = $count | 0;
 __ZN10ime_pinyin5NGram23set_total_freq_none_sysEj(__ZN10ime_pinyin5NGram12get_instanceEv() | 0, $count);
 return;
}
function __ZN10ime_pinyin8DictTrie17convert_to_hanzisEPtt($this, $str, $str_len) {
 $this = $this | 0;
 $str = $str | 0;
 $str_len = $str_len | 0;
 __ZN10ime_pinyin8DictList17convert_to_hanzisEPtt(HEAP32[$this + 4 >> 2] | 0, $str, $str_len);
 return;
}
function __ZN10ime_pinyin8DictTrie19convert_to_scis_idsEPtt($this, $str, $str_len) {
 $this = $this | 0;
 $str = $str | 0;
 $str_len = $str_len | 0;
 __ZN10ime_pinyin8DictList19convert_to_scis_idsEPtt(HEAP32[$this + 4 >> 2] | 0, $str, $str_len);
 return;
}
function __ZN10ime_pinyin8DictTrie12get_lemma_idEPKtt($this, $lemma_str, $lemma_len) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $lemma_len = $lemma_len | 0;
 var $_0 = 0;
 if (($lemma_str | 0) == 0 | ($lemma_len & 65535) > 8) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin8DictList12get_lemma_idEPKtt(HEAP32[$this + 4 >> 2] | 0, $lemma_str, $lemma_len) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictTrie16predict_top_lmasEjPNS_12NPredictItemEjj($this, $his_len, $npre_items, $npre_max, $b4_used) {
 $this = $this | 0;
 $his_len = $his_len | 0;
 $npre_items = $npre_items | 0;
 $npre_max = $npre_max | 0;
 $b4_used = $b4_used | 0;
 var $1 = 0, $5 = 0, $7 = 0, $9 = 0, $11 = 0, $12 = 0, $_in = 0, $item_num_0_ph21 = 0, $top_lmas_pos_0_ph20 = 0, $13 = 0, $top_lmas_pos_0 = 0, $19 = 0, $27 = 0, $item_num_0_ph19 = 0, label = 0;
 $1 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 $5 = $this + 44 | 0;
 $7 = (((HEAP32[$this + 36 >> 2] | 0) >>> 0) / 3 | 0) - (HEAP32[$5 >> 2] | 0) | 0;
 $9 = $this + 4 | 0;
 if (($npre_max | 0) == 0) {
  $item_num_0_ph19 = 0;
  return $item_num_0_ph19 | 0;
 }
 $11 = $his_len & 65535;
 $top_lmas_pos_0_ph20 = 0;
 $item_num_0_ph21 = 0;
 $_in = $npre_items;
 $12 = $npre_items + 4 | 0;
 L1004 : while (1) {
  $13 = $_in;
  $top_lmas_pos_0 = $top_lmas_pos_0_ph20;
  do {
   if ($top_lmas_pos_0 >>> 0 >= (HEAP32[$5 >> 2] | 0) >>> 0) {
    $item_num_0_ph19 = $item_num_0_ph21;
    label = 824;
    break L1004;
   }
   _memset($13 | 0, 0, 20);
   $19 = __ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, $7 + $top_lmas_pos_0 | 0) | 0;
   $top_lmas_pos_0 = $top_lmas_pos_0 + 1 | 0;
  } while ((__ZN10ime_pinyin8DictList13get_lemma_strEjPtt(HEAP32[$9 >> 2] | 0, $19, $12, 7) | 0) << 16 >> 16 == 0);
  HEAPF32[$_in >> 2] = +__ZN10ime_pinyin5NGram11get_uni_psbEj($1, $19);
  HEAP16[$npre_items + ($item_num_0_ph21 * 20 | 0) + 18 >> 1] = $11;
  $27 = $item_num_0_ph21 + 1 | 0;
  if ($27 >>> 0 < $npre_max >>> 0) {
   $top_lmas_pos_0_ph20 = $top_lmas_pos_0;
   $item_num_0_ph21 = $27;
   $_in = $npre_items + ($27 * 20 | 0) | 0;
   $12 = $npre_items + ($27 * 20 | 0) + 4 | 0;
  } else {
   $item_num_0_ph19 = $27;
   label = 823;
   break;
  }
 }
 if ((label | 0) == 824) {
  return $item_num_0_ph19 | 0;
 } else if ((label | 0) == 823) {
  return $item_num_0_ph19 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictTrie7predictEPKttPNS_12NPredictItemEjj($this, $last_hzs, $hzs_len, $npre_items, $npre_max, $b4_used) {
 $this = $this | 0;
 $last_hzs = $last_hzs | 0;
 $hzs_len = $hzs_len | 0;
 $npre_items = $npre_items | 0;
 $npre_max = $npre_max | 0;
 $b4_used = $b4_used | 0;
 return __ZN10ime_pinyin8DictList7predictEPKttPNS_12NPredictItemEjj(HEAP32[$this + 4 >> 2] | 0, $last_hzs, $hzs_len, $npre_items, $npre_max, $b4_used) | 0;
}
function __ZN10ime_pinyin12AtomDictBaseD0Ev($this) {
 $this = $this | 0;
 __ZdlPv($this);
 return;
}
function __ZN10ime_pinyin12MatrixSearchC2Ev($this) {
 $this = $this | 0;
 HEAP8[$this | 0] = 0;
 HEAP32[$this + 4 >> 2] = __ZN10ime_pinyin12SpellingTrie14get_cpinstanceEv() | 0;
 __ZN10ime_pinyin12MatrixSearch22reset_pointers_to_nullEv($this);
 HEAP32[$this + 72 >> 2] = 0;
 HEAP16[$this + 84 >> 1] = 0;
 HEAP16[$this + 92 >> 1] = 0;
 HEAP8[$this + 8 | 0] = 1;
 HEAP8[$this + 728 | 0] = 0;
 HEAP32[$this + 24 >> 2] = 39;
 HEAP32[$this + 28 >> 2] = 40;
 return;
}
function __ZN10ime_pinyin12MatrixSearchD2Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin12MatrixSearch13free_resourceEv($this);
 return;
}
function __ZN10ime_pinyin12MatrixSearch13free_resourceEv($this) {
 $this = $this | 0;
 var $2 = 0, $11 = 0, $20 = 0, $26 = 0;
 $2 = HEAP32[$this + 12 >> 2] | 0;
 if (($2 | 0) != 0) {
  FUNCTION_TABLE_vi[HEAP32[(HEAP32[$2 >> 2] | 0) + 4 >> 2] & 127]($2);
 }
 $11 = HEAP32[$this + 16 >> 2] | 0;
 if (($11 | 0) != 0) {
  FUNCTION_TABLE_vi[HEAP32[(HEAP32[$11 >> 2] | 0) + 4 >> 2] & 127]($11);
 }
 $20 = HEAP32[$this + 20 >> 2] | 0;
 if (($20 | 0) != 0) {
  __ZdlPv($20);
 }
 $26 = HEAP32[$this + 76 >> 2] | 0;
 if (($26 | 0) == 0) {
  __ZN10ime_pinyin12MatrixSearch22reset_pointers_to_nullEv($this);
  return;
 }
 __ZdaPv($26);
 __ZN10ime_pinyin12MatrixSearch22reset_pointers_to_nullEv($this);
 return;
}
function __ZN10ime_pinyin8DictTrie8get_lpisEPKttPNS_10LmaPsbItemEj($this, $splid_str, $splid_str_len, $lma_buf, $max_lma_buf) {
 $this = $this | 0;
 $splid_str = $splid_str | 0;
 $splid_str_len = $splid_str_len | 0;
 $lma_buf = $lma_buf | 0;
 $max_lma_buf = $max_lma_buf | 0;
 var $node_buf1 = 0, $id_start = 0, $1 = 0, $4 = 0, $5 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $node_fr_le0_0_ph211 = 0, $node_to_le0_0_ph210 = 0, $node_fr_ge1_0_ph209 = 0, $node_to_ge1_0_ph208 = 0, $node_fr_num_0_ph207 = 0, $spl_pos_0_ph206 = 0, $node_fr_le0_0203 = 0, $node_to_le0_0202 = 0, $node_to_ge1_0201 = 0, $node_fr_num_0200 = 0, $spl_pos_0199 = 0, $16 = 0, $24 = 0, $id_num_0 = 0, $30 = 0, $31 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $39 = 0, $40 = 0, $node_to_num_1144 = 0, $node_fr_pos_0143 = 0, $43 = 0, $49 = 0, $51 = 0, $58 = 0, $59 = 0, $son_pos_0 = 0, $node_to_num_2 = 0, $67 = 0, $69 = 0, $70 = 0, $71 = 0, $node_to_num_3 = 0, $node_to_num_4 = 0, $93 = 0, $95 = 0, $node_to_num_5138 = 0, $node_fr_pos1_0137 = 0, $103 = 0, $104 = 0, $105 = 0, $son_pos3_0 = 0, $node_to_num_6 = 0, $111 = 0, $116 = 0, $_sum128 = 0, $117 = 0, $118 = 0, $119 = 0, $120 = 0, $node_to_num_7 = 0, $node_to_num_8 = 0, $140 = 0, $142 = 0, $spl_pos_0_ph_be = 0, $node_fr_num_0_ph_be = 0, $node_to_ge1_0_ph_be = 0, $node_to_le0_0_ph_be = 0, $node_fr_le0_0_ph_be = 0, $node_to_num_9151 = 0, $node_fr_pos5_0150 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $son_pos7_0 = 0, $node_to_num_10 = 0, $166 = 0, $_sum = 0, $168 = 0, $169 = 0, $170 = 0, $171 = 0, $node_to_num_11 = 0, $node_to_num_12 = 0, $191 = 0, $193 = 0, $spl_pos_2 = 0, $node_to_num_14 = 0, $198 = 0, $node_to_num_15 = 0, $209 = 0, $210 = 0, $212 = 0, $213 = 0, $lma_num_0 = 0, $node_pos_0 = 0, $219 = 0, $222 = 0, $223 = 0, $homo_pos_0 = 0, $227 = 0, $232 = 0, $233 = 0, $245 = 0, $248 = 0, $homo_pos10_0 = 0, $252 = 0, $257 = 0, $258 = 0, $num_of_homo_0 = 0, $268 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 1608 | 0;
 $node_buf1 = sp | 0;
 $id_start = sp + 1600 | 0;
 $1 = $splid_str_len & 65535;
 if (($splid_str_len & 65535) > 8) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $4 = $this + 12 | 0;
 $5 = HEAP32[$4 >> 2] | 0;
 HEAP32[$node_buf1 >> 2] = $5;
 if (($5 | 0) == 0 | $splid_str_len << 16 >> 16 == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $10 = $this + 8 | 0;
 $11 = $this + 20 | 0;
 $12 = $this + 28 | 0;
 $13 = $this + 16 | 0;
 $14 = $this + 16 | 0;
 $spl_pos_0_ph206 = 0;
 $node_fr_num_0_ph207 = 1;
 $node_to_ge1_0_ph208 = 0;
 $node_fr_ge1_0_ph209 = 0;
 $node_to_le0_0_ph210 = sp + 800 | 0;
 $node_fr_le0_0_ph211 = $node_buf1;
 L1038 : while (1) {
  $spl_pos_0199 = $spl_pos_0_ph206;
  $node_fr_num_0200 = $node_fr_num_0_ph207;
  $node_to_ge1_0201 = $node_to_ge1_0_ph208;
  $node_to_le0_0202 = $node_to_le0_0_ph210;
  $node_fr_le0_0203 = $node_fr_le0_0_ph211;
  while (1) {
   $16 = $splid_str + ($spl_pos_0199 << 1) | 0;
   HEAP16[$id_start >> 1] = HEAP16[$16 >> 1] | 0;
   if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$10 >> 2] | 0, HEAP16[$16 >> 1] | 0) | 0) {
    $24 = __ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt(HEAP32[$10 >> 2] | 0, HEAP16[$16 >> 1] | 0, $id_start) | 0;
    if ($24 << 16 >> 16 == 0) {
     label = 846;
     break L1038;
    } else {
     $id_num_0 = $24;
    }
   } else {
    $id_num_0 = 1;
   }
   if (($spl_pos_0199 | 0) == 1) {
    label = 852;
    break;
   } else if (($spl_pos_0199 | 0) != 0) {
    label = 848;
    break;
   }
   if (($node_fr_num_0200 | 0) == 0) {
    $_0 = 0;
    label = 909;
    break L1038;
   }
   $33 = ($node_fr_num_0200 | 0) == 1;
   $34 = $id_num_0 & 65535;
   $35 = $34 - 30 | 0;
   $36 = $34 - 1 | 0;
   $node_fr_pos_0143 = 0;
   $node_to_num_1144 = 0;
   while (1) {
    $43 = HEAP32[$node_fr_le0_0203 + ($node_fr_pos_0143 << 2) >> 2] | 0;
    if (!(($43 | 0) == (HEAP32[$4 >> 2] | 0) & $33)) {
     label = 855;
     break L1038;
    }
    $49 = HEAPU16[$id_start >> 1] | 0;
    $51 = HEAP32[$11 >> 2] | 0;
    $58 = HEAPU16[$51 + ($35 + $49 << 1) >> 1] | 0;
    $59 = $43 | 0;
    $node_to_num_2 = $node_to_num_1144;
    $son_pos_0 = HEAPU16[$51 + ($49 - 30 << 1) >> 1] | 0;
    while (1) {
     if ($son_pos_0 >>> 0 >= $58 >>> 0) {
      $node_to_num_4 = $node_to_num_2;
      break;
     }
     if ((HEAP32[$59 >> 2] | 0) != 1) {
      label = 859;
      break L1038;
     }
     $67 = HEAP32[$4 >> 2] | 0;
     $69 = $67 + ($son_pos_0 << 4) + 8 | 0;
     $70 = HEAP16[$69 >> 1] | 0;
     $71 = HEAP16[$id_start >> 1] | 0;
     if (($70 & 65535) < ($71 & 65535)) {
      label = 908;
      break L1038;
     }
     if (($70 & 65535 | 0) >= (($71 & 65535) + $34 | 0)) {
      label = 907;
      break L1038;
     }
     if ($node_to_num_2 >>> 0 < 200) {
      HEAP32[$node_to_le0_0202 + ($node_to_num_2 << 2) >> 2] = $67 + ($son_pos_0 << 4);
      $node_to_num_3 = $node_to_num_2 + 1 | 0;
     } else {
      $node_to_num_3 = $node_to_num_2;
     }
     if ((HEAPU16[$69 >> 1] | 0) < ($36 + (HEAPU16[$id_start >> 1] | 0) | 0)) {
      $node_to_num_2 = $node_to_num_3;
      $son_pos_0 = $son_pos_0 + 1 | 0;
     } else {
      $node_to_num_4 = $node_to_num_3;
      break;
     }
    }
    $93 = $node_fr_pos_0143 + 1 | 0;
    if ($93 >>> 0 < $node_fr_num_0200 >>> 0) {
     $node_fr_pos_0143 = $93;
     $node_to_num_1144 = $node_to_num_4;
    } else {
     break;
    }
   }
   $95 = $spl_pos_0199 + 1 | 0;
   if ($95 >>> 0 >= $1 >>> 0 | ($node_to_num_4 | 0) == 0) {
    $node_to_num_14 = $node_to_num_4;
    $spl_pos_2 = $95;
    label = 892;
    break L1038;
   }
   if ($95 >>> 0 < $1 >>> 0) {
    $spl_pos_0199 = $95;
    $node_fr_num_0200 = $node_to_num_4;
    $node_to_ge1_0201 = $node_fr_le0_0203;
    $node_fr_le0_0203 = $node_to_le0_0202;
    $node_to_le0_0202 = 0;
   } else {
    $_0 = 0;
    label = 911;
    break L1038;
   }
  }
  if ((label | 0) == 848) {
   label = 0;
   if (($node_fr_num_0200 | 0) == 0) {
    $_0 = 0;
    label = 910;
    break;
   }
   $30 = ($id_num_0 & 65535) - 1 | 0;
   $31 = $id_num_0 & 65535;
   $node_fr_pos5_0150 = 0;
   $node_to_num_9151 = 0;
   while (1) {
    $150 = HEAP32[$node_fr_ge1_0_ph209 + ($node_fr_pos5_0150 << 2) >> 2] | 0;
    $151 = $150 + 6 | 0;
    $152 = $150 | 0;
    $153 = $150 + 8 | 0;
    $node_to_num_10 = $node_to_num_9151;
    $son_pos7_0 = 0;
    while (1) {
     if ($son_pos7_0 >>> 0 >= (HEAPU8[$151] | 0) >>> 0) {
      $node_to_num_12 = $node_to_num_10;
      break;
     }
     if ((HEAP16[$152 >> 1] | 0) == 0) {
      if ((HEAP8[$153] | 0) == 0) {
       label = 885;
       break L1038;
      }
     }
     $166 = HEAP32[$14 >> 2] | 0;
     $_sum = (__ZN10ime_pinyin8DictTrie14get_son_offsetEPKNS_10LmaNodeGE1E(0, $150) | 0) + $son_pos7_0 | 0;
     $168 = $166 + ($_sum * 10 | 0) | 0;
     $169 = $166 + ($_sum * 10 | 0) + 4 | 0;
     $170 = HEAP16[$169 >> 1] | 0;
     $171 = HEAP16[$id_start >> 1] | 0;
     do {
      if (($170 & 65535) < ($171 & 65535)) {
       $node_to_num_11 = $node_to_num_10;
      } else {
       if (!(($170 & 65535 | 0) < (($171 & 65535) + $31 | 0) & $node_to_num_10 >>> 0 < 200)) {
        $node_to_num_11 = $node_to_num_10;
        break;
       }
       HEAP32[$node_to_ge1_0201 + ($node_to_num_10 << 2) >> 2] = $168;
       $node_to_num_11 = $node_to_num_10 + 1 | 0;
      }
     } while (0);
     if ((HEAPU16[$169 >> 1] | 0) < ($30 + (HEAPU16[$id_start >> 1] | 0) | 0)) {
      $node_to_num_10 = $node_to_num_11;
      $son_pos7_0 = $son_pos7_0 + 1 | 0;
     } else {
      $node_to_num_12 = $node_to_num_11;
      break;
     }
    }
    $191 = $node_fr_pos5_0150 + 1 | 0;
    if ($191 >>> 0 < $node_fr_num_0200 >>> 0) {
     $node_fr_pos5_0150 = $191;
     $node_to_num_9151 = $node_to_num_12;
    } else {
     break;
    }
   }
   $193 = $spl_pos_0199 + 1 | 0;
   if ($193 >>> 0 >= $1 >>> 0 | ($node_to_num_12 | 0) == 0) {
    $node_to_num_14 = $node_to_num_12;
    $spl_pos_2 = $193;
    label = 892;
    break;
   } else {
    $node_fr_le0_0_ph_be = $node_fr_le0_0203;
    $node_to_le0_0_ph_be = $node_to_le0_0202;
    $node_to_ge1_0_ph_be = $node_fr_ge1_0_ph209;
    $node_fr_num_0_ph_be = $node_to_num_12;
    $spl_pos_0_ph_be = $193;
   }
  } else if ((label | 0) == 852) {
   label = 0;
   if (($node_fr_num_0200 | 0) == 0) {
    $_0 = 0;
    label = 914;
    break;
   }
   $39 = ($id_num_0 & 65535) - 1 | 0;
   $40 = $id_num_0 & 65535;
   $node_fr_pos1_0137 = 0;
   $node_to_num_5138 = 0;
   while (1) {
    $103 = HEAP32[$node_fr_le0_0203 + ($node_fr_pos1_0137 << 2) >> 2] | 0;
    $104 = $103 + 10 | 0;
    $105 = $103 | 0;
    $node_to_num_6 = $node_to_num_5138;
    $son_pos3_0 = 0;
    while (1) {
     if ($son_pos3_0 >>> 0 >= (HEAPU16[$104 >> 1] | 0) >>> 0) {
      $node_to_num_8 = $node_to_num_6;
      break;
     }
     $111 = HEAP32[$105 >> 2] | 0;
     if ($111 >>> 0 > (HEAP32[$12 >> 2] | 0) >>> 0) {
      label = 872;
      break L1038;
     }
     $116 = HEAP32[$13 >> 2] | 0;
     $_sum128 = $111 + $son_pos3_0 | 0;
     $117 = $116 + ($_sum128 * 10 | 0) | 0;
     $118 = $116 + ($_sum128 * 10 | 0) + 4 | 0;
     $119 = HEAP16[$118 >> 1] | 0;
     $120 = HEAP16[$id_start >> 1] | 0;
     do {
      if (($119 & 65535) < ($120 & 65535)) {
       $node_to_num_7 = $node_to_num_6;
      } else {
       if (!(($119 & 65535 | 0) < (($120 & 65535) + $40 | 0) & $node_to_num_6 >>> 0 < 200)) {
        $node_to_num_7 = $node_to_num_6;
        break;
       }
       HEAP32[$node_to_ge1_0201 + ($node_to_num_6 << 2) >> 2] = $117;
       $node_to_num_7 = $node_to_num_6 + 1 | 0;
      }
     } while (0);
     if ((HEAPU16[$118 >> 1] | 0) < ($39 + (HEAPU16[$id_start >> 1] | 0) | 0)) {
      $node_to_num_6 = $node_to_num_7;
      $son_pos3_0 = $son_pos3_0 + 1 | 0;
     } else {
      $node_to_num_8 = $node_to_num_7;
      break;
     }
    }
    $140 = $node_fr_pos1_0137 + 1 | 0;
    if ($140 >>> 0 < $node_fr_num_0200 >>> 0) {
     $node_fr_pos1_0137 = $140;
     $node_to_num_5138 = $node_to_num_8;
    } else {
     break;
    }
   }
   $142 = $spl_pos_0199 + 1 | 0;
   if ($142 >>> 0 >= $1 >>> 0 | ($node_to_num_8 | 0) == 0) {
    $node_to_num_14 = $node_to_num_8;
    $spl_pos_2 = $142;
    label = 892;
    break;
   }
   $node_fr_le0_0_ph_be = 0;
   $node_to_le0_0_ph_be = 0;
   $node_to_ge1_0_ph_be = $node_fr_le0_0203;
   $node_fr_num_0_ph_be = $node_to_num_8;
   $spl_pos_0_ph_be = $142;
  }
  if ($spl_pos_0_ph_be >>> 0 < $1 >>> 0) {
   $spl_pos_0_ph206 = $spl_pos_0_ph_be;
   $node_fr_num_0_ph207 = $node_fr_num_0_ph_be;
   $node_to_ge1_0_ph208 = $node_to_ge1_0_ph_be;
   $node_fr_ge1_0_ph209 = $node_to_ge1_0201;
   $node_to_le0_0_ph210 = $node_to_le0_0_ph_be;
   $node_fr_le0_0_ph211 = $node_fr_le0_0_ph_be;
  } else {
   $_0 = 0;
   label = 912;
   break;
  }
 }
 if ((label | 0) == 846) {
  ___assert_func(3680, 696, 4720, 3600);
  return 0;
 } else if ((label | 0) == 885) {
  ___assert_func(3680, 768, 4720, 4112);
  return 0;
 } else if ((label | 0) == 872) {
  ___assert_func(3680, 737, 4720, 4312);
  return 0;
 } else if ((label | 0) == 855) {
  ___assert_func(3680, 703, 4720, 3440);
  return 0;
 } else if ((label | 0) == 892) {
  if (($node_to_num_14 | 0) == 0) {
   $_0 = 0;
   STACKTOP = sp;
   return $_0 | 0;
  }
  $198 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
  do {
   if ($splid_str_len << 16 >> 16 == 1) {
    if (!(__ZNK10ime_pinyin12SpellingTrie16is_half_id_yunmuEt(HEAP32[$this + 8 >> 2] | 0, HEAP16[$splid_str >> 1] | 0) | 0)) {
     $node_to_num_15 = $node_to_num_14;
     break;
    }
    $node_to_num_15 = ($node_to_num_14 | 0) != 0 | 0;
   } else {
    $node_to_num_15 = $node_to_num_14;
   }
  } while (0);
  $209 = $spl_pos_2 >>> 0 < 2;
  $210 = $max_lma_buf - 1 | 0;
  $212 = $1 << 24 & 251658240;
  $213 = $max_lma_buf - 1 | 0;
  $node_pos_0 = 0;
  $lma_num_0 = 0;
  while (1) {
   if ($node_pos_0 >>> 0 >= $node_to_num_15 >>> 0) {
    $_0 = $lma_num_0;
    label = 917;
    break;
   }
   L1111 : do {
    if ($209) {
     $219 = HEAP32[$node_to_le0_0202 + ($node_pos_0 << 2) >> 2] | 0;
     $222 = HEAPU16[$219 + 12 >> 1] | 0;
     $223 = $219 + 4 | 0;
     $homo_pos_0 = 0;
     while (1) {
      if ($homo_pos_0 >>> 0 >= $222 >>> 0) {
       $num_of_homo_0 = $222;
       break L1111;
      }
      $227 = $homo_pos_0 + $lma_num_0 | 0;
      $232 = (__ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, (HEAP32[$223 >> 2] | 0) + $homo_pos_0 | 0) | 0) & 16777215;
      $233 = $lma_buf + ($227 << 3) | 0;
      HEAP32[$233 >> 2] = $232 | HEAP32[$233 >> 2] & -268435456 | 16777216;
      HEAP16[$lma_buf + ($227 << 3) + 4 >> 1] = ~~+__ZN10ime_pinyin5NGram11get_uni_psbEj($198, $232);
      if ($227 >>> 0 < $210 >>> 0) {
       $homo_pos_0 = $homo_pos_0 + 1 | 0;
      } else {
       $num_of_homo_0 = $222;
       break;
      }
     }
    } else {
     $245 = HEAP32[$node_to_ge1_0201 + ($node_pos_0 << 2) >> 2] | 0;
     $248 = HEAPU8[$245 + 7 | 0] | 0;
     $homo_pos10_0 = 0;
     while (1) {
      if ($homo_pos10_0 >>> 0 >= $248 >>> 0) {
       $num_of_homo_0 = $248;
       break L1111;
      }
      $252 = $homo_pos10_0 + $lma_num_0 | 0;
      $257 = (__ZN10ime_pinyin8DictTrie12get_lemma_idEj($this, (__ZN10ime_pinyin8DictTrie23get_homo_idx_buf_offsetEPKNS_10LmaNodeGE1E(0, $245) | 0) + $homo_pos10_0 | 0) | 0) & 16777215;
      $258 = $lma_buf + ($252 << 3) | 0;
      HEAP32[$258 >> 2] = $257 | $212 | HEAP32[$258 >> 2] & -268435456;
      HEAP16[$lma_buf + ($252 << 3) + 4 >> 1] = ~~+__ZN10ime_pinyin5NGram11get_uni_psbEj($198, $257);
      if ($252 >>> 0 < $213 >>> 0) {
       $homo_pos10_0 = $homo_pos10_0 + 1 | 0;
      } else {
       $num_of_homo_0 = $248;
       break;
      }
     }
    }
   } while (0);
   $268 = $num_of_homo_0 + $lma_num_0 | 0;
   if ($268 >>> 0 < $max_lma_buf >>> 0) {
    $node_pos_0 = $node_pos_0 + 1 | 0;
    $lma_num_0 = $268;
   } else {
    $_0 = $max_lma_buf;
    label = 918;
    break;
   }
  }
  if ((label | 0) == 917) {
   STACKTOP = sp;
   return $_0 | 0;
  } else if ((label | 0) == 918) {
   STACKTOP = sp;
   return $_0 | 0;
  }
 } else if ((label | 0) == 859) {
  ___assert_func(3680, 708, 4720, 824);
  return 0;
 } else if ((label | 0) == 907) {
  ___assert_func(3680, 711, 4720, 3304);
  return 0;
 } else if ((label | 0) == 908) {
  ___assert_func(3680, 711, 4720, 3304);
  return 0;
 } else if ((label | 0) == 909) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 910) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 911) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 912) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 914) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictTrie16get_lemma_splidsEjPttb($this, $id_lemma, $splids, $splids_max, $arg_valid) {
 $this = $this | 0;
 $id_lemma = $id_lemma | 0;
 $splids = $splids | 0;
 $splids_max = $splids_max | 0;
 $arg_valid = $arg_valid | 0;
 var $lma_str = 0, $spl_mtrx = 0, $spl_start = 0, $6 = 0, $13 = 0, $_in43 = 0, $try_num_0_lcssa = 0, $14 = 0, $16 = 0, $pos_049 = 0, $try_num_048 = 0, $19 = 0, $_off0 = 0, $34 = 0, $38 = 0, $cand_splids_this_0 = 0, $49 = 0, $phitmp = 0, $try_pos_0 = 0, $55 = 0, $pos1_045 = 0, $mod_044 = 0, $60 = 0, $62 = 0, $69 = 0, $70 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128 | 0;
 $lma_str = sp | 0;
 $spl_mtrx = sp + 24 | 0;
 $spl_start = sp + 104 | 0;
 $6 = FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$this >> 2] | 0) + 32 >> 2] & 31]($this, $id_lemma, $lma_str | 0, 9) | 0;
 if (!($6 << 16 >> 16 == $splids_max << 16 >> 16 | (($6 & 65535) > ($splids_max & 65535) | $arg_valid) ^ 1)) {
  ___assert_func(3680, 861, 4816, 3200);
  return 0;
 }
 HEAP16[$spl_start >> 1] = 0;
 L1136 : do {
  if ($6 << 16 >> 16 == 0) {
   $try_num_0_lcssa = 1;
  } else {
   $13 = $this + 8 | 0;
   $_in43 = $this + 4 | 0;
   $try_num_048 = 1;
   $pos_049 = 0;
   $16 = 0;
   while (1) {
    do {
     if ($arg_valid) {
      $19 = $splids + ($16 << 1) | 0;
      if (__ZNK10ime_pinyin12SpellingTrie10is_full_idEt(HEAP32[$13 >> 2] | 0, HEAP16[$19 >> 1] | 0) | 0) {
       HEAP16[$spl_mtrx + ((HEAPU16[$spl_start + ($16 << 1) >> 1] | 0) << 1) >> 1] = HEAP16[$19 >> 1] | 0;
       $cand_splids_this_0 = 1;
       break;
      } else {
       $_off0 = HEAP16[$splids + ($16 << 1) >> 1] | 0;
       label = 928;
       break;
      }
     } else {
      $_off0 = 0;
      label = 928;
     }
    } while (0);
    if ((label | 0) == 928) {
     label = 0;
     $34 = HEAP16[$spl_start + ($16 << 1) >> 1] | 0;
     $38 = __ZN10ime_pinyin8DictList20get_splids_for_hanziEttPtt(HEAP32[$_in43 >> 2] | 0, HEAP16[$lma_str + ($16 << 1) >> 1] | 0, $_off0, $spl_mtrx + (($34 & 65535) << 1) | 0, 40 - $34 & 65535) | 0;
     if ($38 << 16 >> 16 == 0) {
      break;
     } else {
      $cand_splids_this_0 = $38;
     }
    }
    HEAP16[$spl_start + ($16 + 1 << 1) >> 1] = (HEAP16[$spl_start + ($16 << 1) >> 1] | 0) + $cand_splids_this_0 & 65535;
    $49 = $pos_049 + 1 & 65535;
    $phitmp = (Math_imul($cand_splids_this_0 & 65535, $try_num_048) | 0) & 65535;
    if (($49 & 65535) < ($6 & 65535)) {
     $try_num_048 = $phitmp;
     $pos_049 = $49;
     $16 = $49 & 65535;
    } else {
     $try_num_0_lcssa = $phitmp;
     break L1136;
    }
   }
   ___assert_func(3680, 877, 4816, 3112);
   return 0;
  }
 } while (0);
 $14 = $6 << 16 >> 16 == 0;
 $try_pos_0 = 0;
 while (1) {
  if (($try_pos_0 & 65535) >>> 0 >= $try_num_0_lcssa >>> 0) {
   $_0 = 0;
   label = 936;
   break;
  }
  if (!$14) {
   $mod_044 = 1;
   $pos1_045 = 0;
   $55 = 0;
   while (1) {
    $60 = HEAP16[$spl_start + ($55 << 1) >> 1] | 0;
    $62 = (HEAP16[$spl_start + ($55 + 1 << 1) >> 1] | 0) - $60 & 65535;
    HEAP16[$splids + ($55 << 1) >> 1] = HEAP16[$spl_mtrx + (((((($try_pos_0 & 65535) / ($mod_044 & 65535) | 0) & 65535) % ($62 & 65535) | 0) & 65535) + ($60 & 65535) << 1) >> 1] | 0;
    $69 = Math_imul($62, $mod_044) | 0;
    $70 = $pos1_045 + 1 & 65535;
    if (($70 & 65535) < ($6 & 65535)) {
     $mod_044 = $69;
     $pos1_045 = $70;
     $55 = $70 & 65535;
    } else {
     break;
    }
   }
  }
  if (__ZN10ime_pinyin8DictTrie10try_extendEPKttj($this, $splids, $6, $id_lemma) | 0) {
   $_0 = $6;
   label = 937;
   break;
  } else {
   $try_pos_0 = $try_pos_0 + 1 & 65535;
  }
 }
 if ((label | 0) == 936) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 937) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12MatrixSearch12set_max_lensEjj($this, $max_sps_len, $max_hzs_len) {
 $this = $this | 0;
 $max_sps_len = $max_sps_len | 0;
 $max_hzs_len = $max_hzs_len | 0;
 if (($max_sps_len | 0) != 0) {
  HEAP32[$this + 24 >> 2] = $max_sps_len;
 }
 if (($max_hzs_len | 0) == 0) {
  return;
 }
 HEAP32[$this + 28 >> 2] = $max_hzs_len;
 return;
}
function __ZN10ime_pinyin12MatrixSearch16set_xi_an_switchEb($this, $xi_an_enabled) {
 $this = $this | 0;
 $xi_an_enabled = $xi_an_enabled | 0;
 HEAP8[$this + 8 | 0] = $xi_an_enabled & 1;
 return;
}
function __ZN10ime_pinyin12MatrixSearch16get_xi_an_switchEv($this) {
 $this = $this | 0;
 return (HEAP8[$this + 8 | 0] & 1) != 0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch14alloc_resourceEv($this) {
 $this = $this | 0;
 var $2 = 0, $4 = 0, $5 = 0, $9 = 0, $11 = 0, $13 = 0, $15 = 0, $17 = 0, $19 = 0, $22 = 0, $23 = 0, $24 = 0, $25$0 = 0, $29 = 0, $31 = 0, $_019 = 0;
 __ZN10ime_pinyin12MatrixSearch13free_resourceEv($this);
 $2 = __Znwj(64) | 0;
 __ZN10ime_pinyin8DictTrieC2Ev($2);
 $4 = $this + 12 | 0;
 HEAP32[$4 >> 2] = $2;
 $5 = __Znwj(1132) | 0;
 __ZN10ime_pinyin8UserDictC2Ev($5);
 $9 = $this + 16 | 0;
 HEAP32[$9 >> 2] = $5;
 $11 = __Znwj(4) | 0;
 __ZN10ime_pinyin14SpellingParserC2Ev($11);
 $13 = $this + 20 | 0;
 HEAP32[$13 >> 2] = $11;
 $15 = (__ZN10ime_pinyin15align_to_size_tEj(3200) | 0) >>> 2;
 $17 = (__ZN10ime_pinyin15align_to_size_tEj(9600) | 0) >>> 2;
 $19 = (__ZN10ime_pinyin15align_to_size_tEj(480) | 0) >>> 2;
 $22 = $17 + $15 | 0;
 $23 = $22 + $19 | 0;
 $24 = $23 + ((__ZN10ime_pinyin15align_to_size_tEj(92) | 0) >>> 2) | 0;
 $25$0 = _llvm_umul_with_overflow_i32($24 | 0, 4) | 0;
 $29 = __Znaj(tempRet0 ? -1 : $25$0) | 0;
 $31 = $this + 76 | 0;
 HEAP32[$31 >> 2] = $29;
 if ((HEAP32[$4 >> 2] | 0) == 0) {
  $_019 = 0;
  return $_019 | 0;
 }
 if ((HEAP32[$9 >> 2] | 0) == 0) {
  $_019 = 0;
  return $_019 | 0;
 }
 if ((HEAP32[$13 >> 2] | 0) == 0 | ($29 | 0) == 0) {
  $_019 = 0;
  return $_019 | 0;
 }
 HEAP32[$this + 80 >> 2] = $29;
 HEAP32[$this + 88 >> 2] = (HEAP32[$31 >> 2] | 0) + ($15 << 2);
 HEAP32[$this + 96 >> 2] = (HEAP32[$31 >> 2] | 0) + ($22 << 2);
 HEAP32[$this + 100 >> 2] = (HEAP32[$31 >> 2] | 0) + ($23 << 2);
 HEAP32[$this + 104 >> 2] = HEAP32[$31 >> 2];
 HEAP32[$this + 108 >> 2] = ($24 << 2 >>> 0) / 20 | 0;
 $_019 = 1;
 return $_019 | 0;
}
function __ZN10ime_pinyin12MatrixSearch4initEPKcS2_($this, $fn_sys_dict, $fn_usr_dict) {
 $this = $this | 0;
 $fn_sys_dict = $fn_sys_dict | 0;
 $fn_usr_dict = $fn_usr_dict | 0;
 var $7 = 0, $14 = 0, $15 = 0, $20 = 0, $21 = 0, $_0 = 0;
 if (($fn_sys_dict | 0) == 0 | ($fn_usr_dict | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin12MatrixSearch14alloc_resourceEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = HEAP32[$this + 12 >> 2] | 0;
 if (!(FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$7 >> 2] | 0) + 8 >> 2] & 31]($7, $fn_sys_dict, 1, 5e5) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $14 = $this + 16 | 0;
 $15 = HEAP32[$14 >> 2] | 0;
 $20 = FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$15 >> 2] | 0) + 8 >> 2] & 31]($15, $fn_usr_dict, 500001, 6e5) | 0;
 $21 = HEAP32[$14 >> 2] | 0;
 if ($20) {
  FUNCTION_TABLE_vii[HEAP32[(HEAP32[$21 >> 2] | 0) + 72 >> 2] & 15]($21, 1e8);
 } else {
  if (($21 | 0) != 0) {
   FUNCTION_TABLE_vi[HEAP32[(HEAP32[$21 >> 2] | 0) + 4 >> 2] & 127]($21);
  }
  HEAP32[$14 >> 2] = 0;
 }
 __ZN10ime_pinyin12MatrixSearch13reset_search0Ev($this) | 0;
 HEAP8[$this | 0] = 1;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch13reset_search0Ev($this) {
 $this = $this | 0;
 var $7 = 0, $10 = 0, $18 = 0, $22 = 0, $23 = 0, $33 = 0, $38 = 0, $48 = 0, $54 = 0, $_0 = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP32[$this + 72 >> 2] = 0;
 $7 = $this + 84 | 0;
 HEAP16[$7 >> 1] = 0;
 HEAP16[$this + 92 >> 1] = 0;
 $10 = $this + 96 | 0;
 HEAP16[HEAP32[$10 >> 2] >> 1] = HEAP16[$7 >> 1] | 0;
 HEAP16[(HEAP32[$10 >> 2] | 0) + 4 >> 1] = 1;
 HEAP16[$7 >> 1] = (HEAP16[$7 >> 1] | 0) + 1 & 65535;
 $18 = HEAP32[$this + 80 >> 2] | 0;
 $22 = HEAPU16[HEAP32[$10 >> 2] >> 1] | 0;
 $23 = $18 + ($22 << 4) | 0;
 HEAP32[$23 >> 2] = 0;
 HEAPF32[$18 + ($22 << 4) + 4 >> 2] = 0.0;
 HEAP32[$18 + ($22 << 4) + 8 >> 2] = 0;
 HEAP16[$18 + ($22 << 4) + 14 >> 1] = 0;
 HEAP16[$18 + ($22 << 4) + 12 >> 1] = -1;
 HEAP16[(HEAP32[$10 >> 2] | 0) + 2 >> 1] = 0;
 $33 = (HEAP32[$10 >> 2] | 0) + 6 | 0;
 HEAP16[$33 >> 1] = HEAP16[$33 >> 1] & -32768;
 $38 = (HEAP32[$10 >> 2] | 0) + 6 | 0;
 HEAP16[$38 >> 1] = HEAP16[$38 >> 1] | -32768;
 HEAP32[(HEAP32[$10 >> 2] | 0) + 8 >> 2] = $23;
 HEAP16[$this + 116 >> 1] = 0;
 HEAP32[$this + 356 >> 2] = 0;
 HEAP16[$this + 736 >> 1] = 0;
 HEAP32[$this + 896 >> 2] = 0;
 $48 = HEAP32[$this + 12 >> 2] | 0;
 FUNCTION_TABLE_viii[HEAP32[(HEAP32[$48 >> 2] | 0) + 20 >> 2] & 15]($48, 0, 0);
 $54 = HEAP32[$this + 16 >> 2] | 0;
 if (($54 | 0) == 0) {
  $_0 = 1;
  return $_0 | 0;
 }
 FUNCTION_TABLE_viii[HEAP32[(HEAP32[$54 >> 2] | 0) + 20 >> 2] & 15]($54, 0, 0);
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch7init_fdEillPKc($this, $sys_fd, $start_offset, $length, $fn_usr_dict) {
 $this = $this | 0;
 $sys_fd = $sys_fd | 0;
 $start_offset = $start_offset | 0;
 $length = $length | 0;
 $fn_usr_dict = $fn_usr_dict | 0;
 var $9 = 0, $10 = 0, $15 = 0, $16 = 0, $_0 = 0;
 if (($fn_usr_dict | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin12MatrixSearch14alloc_resourceEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin8DictTrie12load_dict_fdEilljj(HEAP32[$this + 12 >> 2] | 0, $sys_fd, $start_offset, $length, 1, 5e5) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $9 = $this + 16 | 0;
 $10 = HEAP32[$9 >> 2] | 0;
 $15 = FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$10 >> 2] | 0) + 8 >> 2] & 31]($10, $fn_usr_dict, 500001, 6e5) | 0;
 $16 = HEAP32[$9 >> 2] | 0;
 if ($15) {
  FUNCTION_TABLE_vii[HEAP32[(HEAP32[$16 >> 2] | 0) + 72 >> 2] & 15]($16, 1e8);
 } else {
  if (($16 | 0) != 0) {
   FUNCTION_TABLE_vi[HEAP32[(HEAP32[$16 >> 2] | 0) + 4 >> 2] & 127]($16);
  }
  HEAP32[$9 >> 2] = 0;
 }
 __ZN10ime_pinyin12MatrixSearch13reset_search0Ev($this) | 0;
 HEAP8[$this | 0] = 1;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch5closeEv($this) {
 $this = $this | 0;
 __ZN10ime_pinyin12MatrixSearch11flush_cacheEv($this);
 __ZN10ime_pinyin12MatrixSearch13free_resourceEv($this);
 HEAP8[$this | 0] = 0;
 return;
}
function __ZN10ime_pinyin12MatrixSearch11flush_cacheEv($this) {
 $this = $this | 0;
 var $2 = 0;
 $2 = HEAP32[$this + 16 >> 2] | 0;
 if (($2 | 0) == 0) {
  return;
 }
 FUNCTION_TABLE_vi[HEAP32[(HEAP32[$2 >> 2] | 0) + 76 >> 2] & 127]($2);
 return;
}
function __ZN10ime_pinyin12MatrixSearch12reset_searchEv($this) {
 $this = $this | 0;
 var $_0 = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch13reset_search0Ev($this) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch10del_in_pysEjj($this, $start, $len) {
 $this = $this | 0;
 $start = $start | 0;
 $len = $len | 0;
 var $1 = 0, $_08 = 0, $3 = 0, $10 = 0, label = 0;
 $1 = 40 - $len | 0;
 if ($1 >>> 0 > $start >>> 0) {
  $_08 = $start;
 } else {
  return;
 }
 while (1) {
  $3 = $this + 32 + $_08 | 0;
  if ((HEAP8[$3] | 0) == 0) {
   label = 1015;
   break;
  }
  HEAP8[$3] = HEAP8[$_08 + $len + ($this + 32) | 0] | 0;
  $10 = $_08 + 1 | 0;
  if ($10 >>> 0 < $1 >>> 0) {
   $_08 = $10;
  } else {
   label = 1014;
   break;
  }
 }
 if ((label | 0) == 1015) {
  return;
 } else if ((label | 0) == 1014) {
  return;
 }
}
function __ZN10ime_pinyin12MatrixSearch8add_charEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 var $_0 = 0;
 if (!(__ZN10ime_pinyin12MatrixSearch16prepare_add_charEc($this, $ch) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch15add_char_qwertyEv($this) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch6searchEPKcj($this, $py, $py_len) {
 $this = $this | 0;
 $py = $py | 0;
 $py_len = $py_len | 0;
 var $_py_len = 0, $8 = 0, $9 = 0, $ch_pos_0 = 0, $14 = 0, $24 = 0, $25 = 0, $26 = 0, $ch_pos_1 = 0, $38 = 0, $_127 = 0, $_026 = 0, label = 0;
 if ((HEAP8[$this | 0] & 1) == 0 | ($py | 0) == 0) {
  $_026 = 0;
  return $_026 | 0;
 }
 $_py_len = $py_len >>> 0 > 39 ? 39 : $py_len;
 $8 = $this + 72 | 0;
 $9 = HEAP32[$8 >> 2] | 0;
 $ch_pos_0 = 0;
 while (1) {
  if ($ch_pos_0 >>> 0 >= $9 >>> 0) {
   break;
  }
  $14 = HEAP8[$py + $ch_pos_0 | 0] | 0;
  if ($14 << 24 >> 24 == 0) {
   break;
  }
  if ($14 << 24 >> 24 == (HEAP8[$this + 32 + $ch_pos_0 | 0] | 0)) {
   $ch_pos_0 = $ch_pos_0 + 1 | 0;
  } else {
   break;
  }
 }
 __ZN10ime_pinyin12MatrixSearch12reset_searchEjbbb($this, $ch_pos_0, ($ch_pos_0 | 0) != (HEAP32[$8 >> 2] | 0), 0, 0) | 0;
 $24 = $this + 32 + $ch_pos_0 | 0;
 $25 = $py + $ch_pos_0 | 0;
 $26 = $_py_len - $ch_pos_0 | 0;
 _memcpy($24 | 0, $25 | 0, $26) | 0;
 HEAP8[$this + 32 + $_py_len | 0] = 0;
 $ch_pos_1 = $ch_pos_0;
 while (1) {
  if ((HEAP8[$this + 32 + $ch_pos_1 | 0] | 0) == 0) {
   break;
  }
  if (__ZN10ime_pinyin12MatrixSearch8add_charEc($this, HEAP8[$py + $ch_pos_1 | 0] | 0) | 0) {
   $ch_pos_1 = $ch_pos_1 + 1 | 0;
  } else {
   label = 1029;
   break;
  }
 }
 if ((label | 0) == 1029) {
  HEAP32[$8 >> 2] = $ch_pos_1;
 }
 __ZN10ime_pinyin12MatrixSearch16get_spl_start_idEv($this);
 $38 = $this + 732 | 0;
 if ((HEAP32[$38 >> 2] | 0) >>> 0 > 9) {
  $_127 = $_py_len;
  do {
   $_127 = $_127 - 1 | 0;
   __ZN10ime_pinyin12MatrixSearch12reset_searchEjbbb($this, $_127, 0, 0, 0) | 0;
   HEAP8[$this + 32 + $_127 | 0] = 0;
   __ZN10ime_pinyin12MatrixSearch16get_spl_start_idEv($this);
  } while ((HEAP32[$38 >> 2] | 0) >>> 0 > 9);
 }
 __ZN10ime_pinyin12MatrixSearch18prepare_candidatesEv($this);
 $_026 = $ch_pos_1;
 return $_026 | 0;
}
function __ZN10ime_pinyin12MatrixSearch12reset_searchEjbbb($this, $ch_pos, $clear_fixed_this_step, $clear_dmi_this_step, $clear_mtrx_this_step) {
 $this = $this | 0;
 $ch_pos = $ch_pos | 0;
 $clear_fixed_this_step = $clear_fixed_this_step | 0;
 $clear_dmi_this_step = $clear_dmi_this_step | 0;
 $clear_mtrx_this_step = $clear_mtrx_this_step | 0;
 var $6 = 0, $11 = 0, $17 = 0, $33 = 0, $35 = 0, $dict_handles_to_clear_1 = 0, $51 = 0, $56 = 0, $59 = 0, $69 = 0, $70 = 0, $71 = 0, $82 = 0, $87 = 0, $98 = 0, $99 = 0, $100 = 0, $111 = 0, $119 = 0, $fixed_ch_pos_0_ph = 0, $137 = 0, $138 = 0, $fixed_ch_pos_0 = 0, $143 = 0, $145 = 0, $146 = 0, $149 = 0, $151 = 0, $152 = 0, $155 = 0, $_lcssa118 = 0, $158 = 0, $161 = 0, $162 = 0, $165 = 0, $166 = 0, $169 = 0, $170 = 0, $_lcssa113 = 0, $_lcssa112 = 0, $175 = 0, $or_cond91 = 0, $177 = 0, $dict_handles_to_clear1_0 = 0, $193 = 0, $194 = 0, $dict_handles_to_clear1_1 = 0, $211 = 0, $216 = 0, $219 = 0, $229 = 0, $230 = 0, $241 = 0, $245 = 0, $256 = 0, $257 = 0, $267 = 0, $275 = 0, $279 = 0, $re_pos_0108 = 0, $283 = 0, $284 = 0, $289 = 0, $292 = 0, $295 = 0, $297 = 0, $subpos_0105 = 0, $299 = 0, $300 = 0, $301 = 0, $302 = 0, $splpos_0104 = 0, $304 = 0, $327 = 0, $328 = 0, $c_py_pos_0 = 0, $346 = 0, $354 = 0, $356 = 0, $_0 = 0, label = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $6 = $this + 72 | 0;
 if ((HEAP32[$6 >> 2] | 0) >>> 0 < $ch_pos >>> 0 | $ch_pos >>> 0 > 39) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = ($ch_pos | 0) == 0;
 if ($11) {
  __ZN10ime_pinyin12MatrixSearch13reset_search0Ev($this) | 0;
  $_0 = 1;
  return $_0 | 0;
 }
 do {
  if ($clear_dmi_this_step) {
   $17 = HEAP32[$this + 96 >> 2] | 0;
   if ((HEAP16[$17 + ($ch_pos * 12 | 0) + 6 >> 1] & 32767) == 0) {
    HEAP32[$6 >> 2] = $ch_pos;
    label = 1052;
    break;
   } else {
    $dict_handles_to_clear_1 = (HEAP32[$this + 88 >> 2] | 0) + ((HEAPU16[$17 + ($ch_pos * 12 | 0) + 2 >> 1] | 0) * 12 | 0) | 0;
    label = 1048;
    break;
   }
  } else {
   if ((HEAP32[$6 >> 2] | 0) >>> 0 <= $ch_pos >>> 0 | $clear_dmi_this_step) {
    HEAP32[$6 >> 2] = $ch_pos;
    label = 1053;
    break;
   }
   $33 = $ch_pos + 1 | 0;
   $35 = HEAP32[$this + 96 >> 2] | 0;
   if ((HEAP16[$35 + ($33 * 12 | 0) + 6 >> 1] & 32767) == 0) {
    label = 1051;
    break;
   }
   $dict_handles_to_clear_1 = (HEAP32[$this + 88 >> 2] | 0) + ((HEAPU16[$35 + ($33 * 12 | 0) + 2 >> 1] | 0) * 12 | 0) | 0;
   label = 1048;
  }
 } while (0);
 do {
  if ((label | 0) == 1048) {
   if (($dict_handles_to_clear_1 | 0) == 0) {
    label = 1051;
    break;
   }
   $51 = HEAP32[$this + 12 >> 2] | 0;
   $56 = $ch_pos & 65535;
   FUNCTION_TABLE_viii[HEAP32[(HEAP32[$51 >> 2] | 0) + 20 >> 2] & 15]($51, $56, HEAP16[$dict_handles_to_clear_1 >> 1] | 0);
   $59 = HEAP32[$this + 16 >> 2] | 0;
   if (($59 | 0) == 0) {
    label = 1051;
    break;
   }
   FUNCTION_TABLE_viii[HEAP32[(HEAP32[$59 >> 2] | 0) + 20 >> 2] & 15]($59, $56, HEAP16[$dict_handles_to_clear_1 + 2 >> 1] | 0);
   label = 1051;
  }
 } while (0);
 if ((label | 0) == 1051) {
  HEAP32[$6 >> 2] = $ch_pos;
  if ($clear_dmi_this_step) {
   label = 1052;
  } else {
   label = 1053;
  }
 }
 if ((label | 0) == 1053) {
  $87 = HEAP32[$this + 96 >> 2] | 0;
  HEAP16[$this + 92 >> 1] = (HEAP16[$87 + ($ch_pos * 12 | 0) + 6 >> 1] & 32767) + (HEAP16[$87 + ($ch_pos * 12 | 0) + 2 >> 1] | 0) & 65535;
 } else if ((label | 0) == 1052) {
  $69 = $ch_pos - 1 | 0;
  $70 = $this + 96 | 0;
  $71 = HEAP32[$70 >> 2] | 0;
  HEAP16[$this + 92 >> 1] = (HEAP16[$71 + ($69 * 12 | 0) + 6 >> 1] & 32767) + (HEAP16[$71 + ($69 * 12 | 0) + 2 >> 1] | 0) & 65535;
  $82 = (HEAP32[$70 >> 2] | 0) + ($ch_pos * 12 | 0) + 6 | 0;
  HEAP16[$82 >> 1] = HEAP16[$82 >> 1] & -32768;
 }
 if ($clear_mtrx_this_step) {
  $98 = $ch_pos - 1 | 0;
  $99 = $this + 96 | 0;
  $100 = HEAP32[$99 >> 2] | 0;
  HEAP16[$this + 84 >> 1] = (HEAP16[$100 + ($98 * 12 | 0) + 4 >> 1] | 0) + (HEAP16[$100 + ($98 * 12 | 0) >> 1] | 0) & 65535;
  HEAP16[(HEAP32[$99 >> 2] | 0) + ($ch_pos * 12 | 0) + 4 >> 1] = 0;
 } else {
  $111 = HEAP32[$this + 96 >> 2] | 0;
  HEAP16[$this + 84 >> 1] = (HEAP16[$111 + ($ch_pos * 12 | 0) + 4 >> 1] | 0) + (HEAP16[$111 + ($ch_pos * 12 | 0) >> 1] | 0) & 65535;
 }
 $119 = $this + 896 | 0;
 if ((HEAP32[$119 >> 2] | 0) == 0) {
  $_0 = 1;
  return $_0 | 0;
 }
 do {
  if ((HEAP32[$this + 196 >> 2] | 0) == 16777215) {
   if ((HEAPU16[$this + 736 + ((HEAPU16[$this + 724 >> 1] | 0) << 1) >> 1] | 0) >>> 0 <= $ch_pos >>> 0) {
    break;
   }
   if ((HEAP32[$119 >> 2] | 0) == 0) {
    $_0 = 1;
    return $_0 | 0;
   }
   $289 = $this + 196 | 0;
   if ((HEAP32[$289 >> 2] | 0) != 16777215) {
    $_0 = 1;
    return $_0 | 0;
   }
   $292 = $this + 720 | 0;
   if ((HEAP32[$292 >> 2] | 0) != 0) {
    $295 = $this + 724 | 0;
    $subpos_0105 = 0;
    $297 = 0;
    do {
     $299 = HEAP16[$this + 640 + ($297 << 1) >> 1] | 0;
     $300 = $297 + 1 | 0;
     $301 = $this + 640 + ($300 << 1) | 0;
     $302 = HEAP16[$301 >> 1] | 0;
     if (($299 & 65535) < ($302 & 65535)) {
      $splpos_0104 = $299;
      do {
       $304 = $splpos_0104 & 65535;
       do {
        if ((HEAPU16[$this + 480 + ($304 << 1) >> 1] | 0) >>> 0 <= $ch_pos >>> 0) {
         if ((HEAPU16[$this + 480 + ($304 + 1 << 1) >> 1] | 0) >>> 0 <= $ch_pos >>> 0) {
          break;
         }
         HEAP16[$this + 560 + ($304 << 1) >> 1] = 0;
         HEAP16[$301 >> 1] = $splpos_0104;
         HEAP32[$292 >> 2] = $300;
         HEAP16[$295 >> 1] = $splpos_0104;
         if ($splpos_0104 << 16 >> 16 != $299 << 16 >> 16) {
          break;
         }
         HEAP32[$292 >> 2] = $297;
        }
       } while (0);
       $splpos_0104 = $splpos_0104 + 1 & 65535;
      } while (($splpos_0104 & 65535) < ($302 & 65535));
     }
     $subpos_0105 = $subpos_0105 + 1 & 65535;
     $297 = $subpos_0105 & 65535;
    } while ($297 >>> 0 < (HEAP32[$292 >> 2] | 0) >>> 0);
   }
   __ZN10ime_pinyin12MatrixSearch13reset_search0Ev($this) | 0;
   $327 = $this + 728 | 0;
   HEAP8[$327] = 1;
   $328 = $this + 724 | 0;
   $c_py_pos_0 = 0;
   while (1) {
    if (($c_py_pos_0 & 65535) >= (HEAPU16[$this + 736 + ((HEAPU16[$328 >> 1] | 0) << 1) >> 1] | 0)) {
     break;
    }
    if (__ZN10ime_pinyin12MatrixSearch8add_charEc($this, HEAP8[($c_py_pos_0 & 65535) + ($this + 32) | 0] | 0) | 0) {
     $c_py_pos_0 = $c_py_pos_0 + 1 & 65535;
    } else {
     label = 1105;
     break;
    }
   }
   if ((label | 0) == 1105) {
    ___assert_func(1184, 393, 7224, 1632);
    return 0;
   }
   HEAP8[$327] = 0;
   HEAP32[$this + 112 >> 2] = 1;
   HEAP32[$this + 356 >> 2] = 1;
   HEAP8[$this + 360 | 0] = 0;
   $346 = HEAP16[$328 >> 1] | 0;
   HEAP32[$119 >> 2] = $346 & 65535;
   HEAP16[$this + 118 >> 1] = $346;
   HEAP32[$289 >> 2] = 16777215;
   $354 = HEAPU16[$this + 736 + (HEAP32[$119 >> 2] << 1) >> 1] | 0;
   $356 = HEAP32[$this + 96 >> 2] | 0;
   HEAP32[$356 + ($354 * 12 | 0) + 8 >> 2] = (HEAP32[$this + 80 >> 2] | 0) + ((HEAPU16[$356 + ($354 * 12 | 0) >> 1] | 0) << 4);
   $_0 = 1;
   return $_0 | 0;
  }
 } while (0);
 if ($clear_fixed_this_step) {
  $fixed_ch_pos_0_ph = $11 ? 0 : $ch_pos - 1 | 0;
 } else {
  $fixed_ch_pos_0_ph = $ch_pos;
 }
 $137 = $this + 96 | 0;
 $138 = HEAP32[$137 >> 2] | 0;
 $fixed_ch_pos_0 = $fixed_ch_pos_0_ph;
 while (1) {
  $143 = ($fixed_ch_pos_0 | 0) == 0;
  if ((HEAP32[$138 + ($fixed_ch_pos_0 * 12 | 0) + 8 >> 2] | 0) != 0 | $143) {
   break;
  } else {
   $fixed_ch_pos_0 = $fixed_ch_pos_0 - 1 | 0;
  }
 }
 $145 = $this + 356 | 0;
 HEAP32[$145 >> 2] = 0;
 HEAP32[$119 >> 2] = 0;
 do {
  if (!$143) {
   $146 = HEAP32[$119 >> 2] | 0;
   $149 = HEAPU16[$this + 736 + ($146 << 1) >> 1] | 0;
   if ($149 >>> 0 < $fixed_ch_pos_0 >>> 0) {
    $151 = $146;
    while (1) {
     $152 = $151 + 1 | 0;
     HEAP32[$119 >> 2] = $152;
     $155 = HEAPU16[$this + 736 + ($152 << 1) >> 1] | 0;
     if ($155 >>> 0 < $fixed_ch_pos_0 >>> 0) {
      $151 = $152;
     } else {
      $_lcssa118 = $155;
      break;
     }
    }
   } else {
    $_lcssa118 = $149;
   }
   if (($_lcssa118 | 0) != ($fixed_ch_pos_0 | 0)) {
    ___assert_func(1184, 308, 7224, 3480);
    return 0;
   }
   $158 = HEAP32[$145 >> 2] | 0;
   $161 = HEAPU16[$this + 116 + ($158 << 1) >> 1] | 0;
   $162 = HEAP32[$119 >> 2] | 0;
   if ($161 >>> 0 < $162 >>> 0) {
    $165 = $158;
    while (1) {
     $166 = $165 + 1 | 0;
     HEAP32[$145 >> 2] = $166;
     $169 = HEAPU16[$this + 116 + ($166 << 1) >> 1] | 0;
     $170 = HEAP32[$119 >> 2] | 0;
     if ($169 >>> 0 < $170 >>> 0) {
      $165 = $166;
     } else {
      $_lcssa112 = $169;
      $_lcssa113 = $170;
      break;
     }
    }
   } else {
    $_lcssa112 = $161;
    $_lcssa113 = $162;
   }
   if (($_lcssa112 | 0) == ($_lcssa113 | 0)) {
    break;
   }
   ___assert_func(1184, 312, 7224, 2456);
   return 0;
  }
 } while (0);
 $175 = ($fixed_ch_pos_0 | 0) == ($ch_pos | 0);
 $or_cond91 = $175 & $clear_dmi_this_step;
 do {
  if ($or_cond91) {
   $177 = HEAP32[$137 >> 2] | 0;
   if ((HEAP16[$177 + ($fixed_ch_pos_0 * 12 | 0) + 6 >> 1] & 32767) == 0) {
    $dict_handles_to_clear1_0 = 0;
    break;
   }
   $dict_handles_to_clear1_0 = (HEAP32[$this + 88 >> 2] | 0) + ((HEAPU16[$177 + ($fixed_ch_pos_0 * 12 | 0) + 2 >> 1] | 0) * 12 | 0) | 0;
  } else {
   $dict_handles_to_clear1_0 = 0;
  }
 } while (0);
 do {
  if ((HEAP32[$6 >> 2] | 0) >>> 0 <= $fixed_ch_pos_0 >>> 0 | $clear_dmi_this_step) {
   $dict_handles_to_clear1_1 = $dict_handles_to_clear1_0;
   label = 1079;
  } else {
   $193 = $fixed_ch_pos_0 + 1 | 0;
   $194 = HEAP32[$137 >> 2] | 0;
   if ((HEAP16[$194 + ($193 * 12 | 0) + 6 >> 1] & 32767) == 0) {
    break;
   }
   $dict_handles_to_clear1_1 = (HEAP32[$this + 88 >> 2] | 0) + ((HEAPU16[$194 + ($193 * 12 | 0) + 2 >> 1] | 0) * 12 | 0) | 0;
   label = 1079;
  }
 } while (0);
 do {
  if ((label | 0) == 1079) {
   if (($dict_handles_to_clear1_1 | 0) == 0) {
    break;
   }
   $211 = HEAP32[$this + 12 >> 2] | 0;
   $216 = $fixed_ch_pos_0 & 65535;
   FUNCTION_TABLE_viii[HEAP32[(HEAP32[$211 >> 2] | 0) + 20 >> 2] & 15]($211, $216, HEAP16[$dict_handles_to_clear1_1 >> 1] | 0);
   $219 = HEAP32[$this + 16 >> 2] | 0;
   if (($219 | 0) == 0) {
    break;
   }
   FUNCTION_TABLE_viii[HEAP32[(HEAP32[$219 >> 2] | 0) + 20 >> 2] & 15]($219, $216, HEAP16[$dict_handles_to_clear1_1 + 2 >> 1] | 0);
  }
 } while (0);
 HEAP32[$6 >> 2] = $fixed_ch_pos_0;
 if ($or_cond91) {
  $229 = $fixed_ch_pos_0 - 1 | 0;
  $230 = HEAP32[$137 >> 2] | 0;
  HEAP16[$this + 92 >> 1] = (HEAP16[$230 + ($229 * 12 | 0) + 6 >> 1] & 32767) + (HEAP16[$230 + ($229 * 12 | 0) + 2 >> 1] | 0) & 65535;
  $241 = (HEAP32[$137 >> 2] | 0) + ($fixed_ch_pos_0 * 12 | 0) + 6 | 0;
  HEAP16[$241 >> 1] = HEAP16[$241 >> 1] & -32768;
 } else {
  $245 = HEAP32[$137 >> 2] | 0;
  HEAP16[$this + 92 >> 1] = (HEAP16[$245 + ($fixed_ch_pos_0 * 12 | 0) + 6 >> 1] & 32767) + (HEAP16[$245 + ($fixed_ch_pos_0 * 12 | 0) + 2 >> 1] | 0) & 65535;
 }
 if ($175 & $clear_mtrx_this_step) {
  $256 = $fixed_ch_pos_0 - 1 | 0;
  $257 = HEAP32[$137 >> 2] | 0;
  HEAP16[$this + 84 >> 1] = (HEAP16[$257 + ($256 * 12 | 0) + 4 >> 1] | 0) + (HEAP16[$257 + ($256 * 12 | 0) >> 1] | 0) & 65535;
  HEAP16[(HEAP32[$137 >> 2] | 0) + ($fixed_ch_pos_0 * 12 | 0) + 4 >> 1] = 0;
 } else {
  $267 = HEAP32[$137 >> 2] | 0;
  HEAP16[$this + 84 >> 1] = (HEAP16[$267 + ($fixed_ch_pos_0 * 12 | 0) + 4 >> 1] | 0) + (HEAP16[$267 + ($fixed_ch_pos_0 * 12 | 0) >> 1] | 0) & 65535;
 }
 $275 = $fixed_ch_pos_0 & 65535;
 if ($275 >>> 0 >= $ch_pos >>> 0) {
  $_0 = 1;
  return $_0 | 0;
 }
 $re_pos_0108 = $fixed_ch_pos_0 & 65535;
 $279 = $275;
 while (1) {
  __ZN10ime_pinyin12MatrixSearch8add_charEc($this, HEAP8[$this + 32 + $279 | 0] | 0) | 0;
  $283 = $re_pos_0108 + 1 & 65535;
  $284 = $283 & 65535;
  if ($284 >>> 0 < $ch_pos >>> 0) {
   $re_pos_0108 = $283;
   $279 = $284;
  } else {
   $_0 = 1;
   break;
  }
 }
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch18prepare_candidatesEv($this) {
 $this = $this | 0;
 var $sent_len = 0, $3 = 0, $5 = 0, $lma_size_max_0 = 0, $9 = 0, $10 = 0, $11 = 0, $lpi_num_full_match_012 = 0, $pfullsent_111 = 0, $lma_size_010 = 0, $18 = 0, $21 = 0, $22 = 0, $pfullsent_2 = 0, $lpi_num_full_match_1 = 0, $31 = 0, $lpi_num_full_match_0_lcssa = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $sent_len = sp + 24 | 0;
 $3 = $this + 896 | 0;
 $5 = (HEAP32[$this + 732 >> 2] | 0) - (HEAP32[$3 >> 2] | 0) | 0;
 $lma_size_max_0 = $5 >>> 0 < 8 ? $5 & 65535 : 8;
 $9 = __ZN10ime_pinyin12MatrixSearch14get_candidate0EPtjS1_b($this, sp | 0, 9, $sent_len, 1) | 0;
 $10 = HEAP16[$sent_len >> 1] | 0;
 $11 = $this + 12500 | 0;
 HEAP32[$11 >> 2] = 0;
 if ($lma_size_max_0 << 16 >> 16 == 0) {
  $lpi_num_full_match_0_lcssa = 0;
 } else {
  $lma_size_010 = $lma_size_max_0;
  $pfullsent_111 = ($10 & 65535) > 8 ? 0 : $9;
  $lpi_num_full_match_012 = 0;
  while (1) {
   $18 = HEAP32[$11 >> 2] | 0;
   $21 = $lma_size_010 << 16 >> 16 == $lma_size_max_0 << 16 >> 16;
   $22 = __ZN10ime_pinyin12MatrixSearch8get_lpisEPKtjPNS_10LmaPsbItemEjS2_b($this, $this + 816 + (HEAP32[$3 >> 2] << 1) | 0, $lma_size_010 & 65535, $this + 900 + ($18 << 3) | 0, 1450 - $18 | 0, $pfullsent_111, $21) | 0;
   if (($22 | 0) == 0) {
    $pfullsent_2 = $pfullsent_111;
   } else {
    HEAP32[$11 >> 2] = (HEAP32[$11 >> 2] | 0) + $22;
    $pfullsent_2 = 0;
   }
   if ($21) {
    $lpi_num_full_match_1 = HEAP32[$11 >> 2] | 0;
   } else {
    $lpi_num_full_match_1 = $lpi_num_full_match_012;
   }
   $31 = $lma_size_010 - 1 & 65535;
   if ($31 << 16 >> 16 == 0) {
    $lpi_num_full_match_0_lcssa = $lpi_num_full_match_1;
    break;
   } else {
    $lma_size_010 = $31;
    $pfullsent_111 = $pfullsent_2;
    $lpi_num_full_match_012 = $lpi_num_full_match_1;
   }
  }
 }
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($this + 900 + ($lpi_num_full_match_0_lcssa << 3) | 0, (HEAP32[$11 >> 2] | 0) - $lpi_num_full_match_0_lcssa | 0, 8, 22);
 STACKTOP = sp;
 return;
}
function __ZN10ime_pinyin12MatrixSearch16get_spl_start_idEv($this) {
 $this = $this | 0;
 var $1 = 0, $3 = 0, $10 = 0, $11 = 0, $14 = 0, $20 = 0, $22 = 0, $24 = 0, $31 = 0, $34 = 0, $35 = 0, $mtrx_nd_078 = 0, $37 = 0, $47 = 0, $phitmp = 0, $54 = 0, $_in = 0, $56 = 0, $94 = 0, $95 = 0, $101 = 0, $102 = 0, $pos_070 = 0, $104 = 0, $105 = 0, $107 = 0, $108 = 0, $117 = 0, $119 = 0, $124 = 0, $142 = 0, $144 = 0, $150 = 0, $162 = 0, $163 = 0, $_lcssa = 0, $pos2_057 = 0, $169 = 0, $171 = 0, $172 = 0, $pos1_063 = 0, $174 = 0, $179 = 0, $181 = 0, $182 = 0, $193 = 0, $195 = 0, $200 = 0, $218 = 0, $220 = 0, $226 = 0, $238 = 0, $pos2_059 = 0, $pos2_0_in58 = 0, $241 = 0, $242 = 0, $243 = 0, $storemerge = 0, $pos2_0 = 0, $257 = 0, $pos3_0 = 0, label = 0;
 $1 = $this + 112 | 0;
 HEAP32[$1 >> 2] = 0;
 HEAP16[$this + 116 >> 1] = 0;
 $3 = $this + 732 | 0;
 HEAP32[$3 >> 2] = 0;
 HEAP16[$this + 736 >> 1] = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  return;
 }
 $10 = $this + 72 | 0;
 $11 = HEAP32[$10 >> 2] | 0;
 if (($11 | 0) == 0) {
  return;
 }
 $14 = $this + 96 | 0;
 if ((HEAP16[(HEAP32[$14 >> 2] | 0) + ($11 * 12 | 0) + 4 >> 1] | 0) == 0) {
  return;
 }
 $20 = $this + 356 | 0;
 HEAP32[$1 >> 2] = HEAP32[$20 >> 2];
 $22 = $this + 896 | 0;
 HEAP32[$3 >> 2] = HEAP32[$22 >> 2];
 $24 = $this + 80 | 0;
 $31 = (HEAP32[$24 >> 2] | 0) + (HEAPU16[(HEAP32[$14 >> 2] | 0) + ((HEAP32[$10 >> 2] | 0) * 12 | 0) >> 1] << 4) | 0;
 L1411 : do {
  if (($31 | 0) != (HEAP32[$24 >> 2] | 0)) {
   $34 = $this + 88 | 0;
   $35 = $this + 88 | 0;
   $mtrx_nd_078 = $31;
   do {
    $37 = HEAP32[$22 >> 2] | 0;
    if (($37 | 0) != 0) {
     if ((HEAPU16[$mtrx_nd_078 + 14 >> 1] | 0) <= (HEAPU16[$this + 736 + ($37 << 1) >> 1] | 0)) {
      break L1411;
     }
    }
    $47 = HEAP16[$mtrx_nd_078 + 12 >> 1] | 0;
    if ($47 << 16 >> 16 != -1) {
     $phitmp = (HEAPU8[(HEAP32[$34 >> 2] | 0) + (($47 & 65535) * 12 | 0) + 9 | 0] | 0) >>> 1 & 255;
     $54 = $mtrx_nd_078 + 14 | 0;
     $_in = $47;
     do {
      $56 = $_in & 65535;
      HEAP16[$this + 736 + ((HEAP32[$3 >> 2] | 0) + 1 << 1) >> 1] = ((HEAP16[$54 >> 1] | 0) - $phitmp & 65535) + ((HEAPU8[(HEAP32[$35 >> 2] | 0) + ($56 * 12 | 0) + 9 | 0] | 0) >>> 1 & 255) & 65535;
      HEAP16[$this + 816 + (HEAP32[$3 >> 2] << 1) >> 1] = HEAP16[(HEAP32[$35 >> 2] | 0) + ($56 * 12 | 0) + 6 >> 1] | 0;
      HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) + 1;
      $_in = HEAP16[(HEAP32[$35 >> 2] | 0) + ($56 * 12 | 0) + 4 >> 1] | 0;
     } while ($_in << 16 >> 16 != -1);
    }
    HEAP16[$this + 116 + ((HEAP32[$1 >> 2] | 0) + 1 << 1) >> 1] = HEAP32[$3 >> 2] & 65535;
    HEAP32[$this + 196 + (HEAP32[$1 >> 2] << 2) >> 2] = HEAP32[$mtrx_nd_078 >> 2];
    HEAP32[$1 >> 2] = (HEAP32[$1 >> 2] | 0) + 1;
    $mtrx_nd_078 = HEAP32[$mtrx_nd_078 + 8 >> 2] | 0;
   } while (($mtrx_nd_078 | 0) != (HEAP32[$24 >> 2] | 0));
  }
 } while (0);
 $94 = HEAP32[$22 >> 2] | 0;
 $95 = HEAP32[$3 >> 2] | 0;
 if ($94 >>> 0 < (((1 - $94 + $95 | 0) >>> 1) + $94 | 0) >>> 0) {
  $pos_070 = $94;
  $102 = $94;
  $101 = $95;
  while (1) {
   $104 = $102 - $pos_070 + $101 | 0;
   $105 = $pos_070 + 1 | 0;
   if (($104 | 0) != ($105 | 0)) {
    $117 = $this + 736 + ($105 << 1) | 0;
    $119 = HEAP16[$117 >> 1] ^ HEAP16[$this + 736 + ($104 << 1) >> 1];
    HEAP16[$117 >> 1] = $119;
    $124 = $this + 736 + ((HEAP32[$3 >> 2] | 0) - $pos_070 + (HEAP32[$22 >> 2] | 0) << 1) | 0;
    HEAP16[$124 >> 1] = HEAP16[$124 >> 1] ^ $119;
    HEAP16[$117 >> 1] = HEAP16[$117 >> 1] ^ HEAP16[$this + 736 + ((HEAP32[$3 >> 2] | 0) - $pos_070 + (HEAP32[$22 >> 2] | 0) << 1) >> 1];
    $142 = $this + 816 + ($pos_070 << 1) | 0;
    $144 = HEAP16[$142 >> 1] ^ HEAP16[$this + 816 + ((HEAP32[$3 >> 2] | 0) + ~$pos_070 + (HEAP32[$22 >> 2] | 0) << 1) >> 1];
    HEAP16[$142 >> 1] = $144;
    $150 = $this + 816 + ((HEAP32[$3 >> 2] | 0) + ~$pos_070 + (HEAP32[$22 >> 2] | 0) << 1) | 0;
    HEAP16[$150 >> 1] = HEAP16[$150 >> 1] ^ $144;
    HEAP16[$142 >> 1] = HEAP16[$142 >> 1] ^ HEAP16[$this + 816 + ((HEAP32[$3 >> 2] | 0) + ~$pos_070 + (HEAP32[$22 >> 2] | 0) << 1) >> 1];
   }
   $107 = HEAP32[$22 >> 2] | 0;
   $108 = HEAP32[$3 >> 2] | 0;
   if ($105 >>> 0 < (((1 - $107 + $108 | 0) >>> 1) + $107 | 0) >>> 0) {
    $pos_070 = $105;
    $102 = $107;
    $101 = $108;
   } else {
    break;
   }
  }
 }
 $162 = HEAP32[$20 >> 2] | 0;
 $163 = HEAP32[$1 >> 2] | 0;
 L1431 : do {
  if ($162 >>> 0 < (((1 - $162 + $163 | 0) >>> 1) + $162 | 0) >>> 0) {
   $pos1_063 = $162;
   $172 = $162;
   $171 = $163;
   while (1) {
    $174 = $172 - $pos1_063 + $171 | 0;
    if (($174 - 1 | 0) >>> 0 < $pos1_063 >>> 0) {
     break;
    }
    $179 = $pos1_063 + 1 | 0;
    if ($174 >>> 0 > $179 >>> 0) {
     $193 = $this + 116 + ($179 << 1) | 0;
     $195 = HEAP16[$193 >> 1] ^ HEAP16[$this + 116 + ($172 - $pos1_063 + $171 << 1) >> 1];
     HEAP16[$193 >> 1] = $195;
     $200 = $this + 116 + ((HEAP32[$1 >> 2] | 0) - $pos1_063 + (HEAP32[$20 >> 2] | 0) << 1) | 0;
     HEAP16[$200 >> 1] = HEAP16[$200 >> 1] ^ $195;
     HEAP16[$193 >> 1] = HEAP16[$193 >> 1] ^ HEAP16[$this + 116 + ((HEAP32[$1 >> 2] | 0) - $pos1_063 + (HEAP32[$20 >> 2] | 0) << 1) >> 1];
     $218 = $this + 196 + ($pos1_063 << 2) | 0;
     $220 = HEAP32[$218 >> 2] ^ HEAP32[$this + 196 + ((HEAP32[$1 >> 2] | 0) + ~$pos1_063 + (HEAP32[$20 >> 2] | 0) << 2) >> 2];
     HEAP32[$218 >> 2] = $220;
     $226 = $this + 196 + ((HEAP32[$1 >> 2] | 0) + ~$pos1_063 + (HEAP32[$20 >> 2] | 0) << 2) | 0;
     HEAP32[$226 >> 2] = HEAP32[$226 >> 2] ^ $220;
     HEAP32[$218 >> 2] = HEAP32[$218 >> 2] ^ HEAP32[$this + 196 + ((HEAP32[$1 >> 2] | 0) + ~$pos1_063 + (HEAP32[$20 >> 2] | 0) << 2) >> 2];
    }
    $181 = HEAP32[$20 >> 2] | 0;
    $182 = HEAP32[$1 >> 2] | 0;
    if ($179 >>> 0 < (((1 - $181 + $182 | 0) >>> 1) + $181 | 0) >>> 0) {
     $pos1_063 = $179;
     $172 = $181;
     $171 = $182;
    } else {
     $_lcssa = $181;
     break L1431;
    }
   }
   ___assert_func(1184, 1360, 7e3, 2592);
  } else {
   $_lcssa = $162;
  }
 } while (0);
 $pos2_057 = $_lcssa + 1 | 0;
 $169 = HEAP32[$1 >> 2] | 0;
 if ($pos2_057 >>> 0 <= $169 >>> 0) {
  $pos2_0_in58 = $_lcssa;
  $pos2_059 = $pos2_057;
  $238 = $169;
  while (1) {
   $241 = HEAP16[$this + 116 + ($pos2_0_in58 << 1) >> 1] | 0;
   $242 = $this + 116 + ($pos2_059 << 1) | 0;
   $243 = HEAP16[$242 >> 1] | 0;
   if ($pos2_059 >>> 0 < $238 >>> 0) {
    $storemerge = ($243 + $241 & 65535) - (HEAP16[$this + 116 + ($pos2_0_in58 + 2 << 1) >> 1] | 0) & 65535;
   } else {
    $storemerge = ($243 + $241 & 65535) - (HEAP16[$this + 116 + (HEAP32[$20 >> 2] << 1) >> 1] | 0) & 65535;
   }
   HEAP16[$242 >> 1] = $storemerge;
   $pos2_0 = $pos2_059 + 1 | 0;
   $257 = HEAP32[$1 >> 2] | 0;
   if ($pos2_0 >>> 0 > $257 >>> 0) {
    break;
   } else {
    $pos2_0_in58 = $pos2_059;
    $pos2_059 = $pos2_0;
    $238 = $257;
   }
  }
 }
 HEAP32[$22 >> 2] = 0;
 $pos3_0 = HEAP32[$3 >> 2] | 0;
 while (1) {
  if (($pos3_0 | 0) == 0) {
   label = 1160;
   break;
  }
  if ((HEAP32[(HEAP32[$14 >> 2] | 0) + ((HEAPU16[$this + 736 + ($pos3_0 << 1) >> 1] | 0) * 12 | 0) + 8 >> 2] | 0) == 0) {
   $pos3_0 = $pos3_0 - 1 | 0;
  } else {
   break;
  }
 }
 if ((label | 0) == 1160) {
  return;
 }
 HEAP32[$22 >> 2] = $pos3_0;
 return;
}
function __ZN10ime_pinyin12MatrixSearch9delsearchEjbb($this, $pos, $is_pos_in_splid, $clear_fixed_this_step) {
 $this = $this | 0;
 $pos = $pos | 0;
 $is_pos_in_splid = $is_pos_in_splid | 0;
 $clear_fixed_this_step = $clear_fixed_this_step | 0;
 var $6 = 0, $7 = 0, $reset_pos_0 = 0, $13 = 0, $25 = 0, $26 = 0, $51 = 0, $53 = 0, $55 = 0, $63 = 0, $68 = 0, $69 = 0, $74 = 0, $83 = 0, $84 = 0, $reset_pos_1 = 0, $90 = 0, $106 = 0, $c_py_pos_0 = 0, $108 = 0, $120 = 0, $122 = 0, $130 = 0, $132 = 0, $reset_pos_134 = 0, $reset_pos_2 = 0, $140 = 0, $_0 = 0, label = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $6 = $this + 72 | 0;
 $7 = HEAP32[$6 >> 2] | 0;
 if ($7 >>> 0 <= $pos >>> 0) {
  __ZN10ime_pinyin12MatrixSearch10del_in_pysEjj($this, $pos, 1);
  $reset_pos_0 = HEAP32[$6 >> 2] | 0;
  while (1) {
   $13 = HEAP8[$this + 32 + $reset_pos_0 | 0] | 0;
   if ($13 << 24 >> 24 == 0) {
    break;
   }
   if (__ZN10ime_pinyin12MatrixSearch8add_charEc($this, $13) | 0) {
    $reset_pos_0 = $reset_pos_0 + 1 | 0;
   } else {
    label = 1166;
    break;
   }
  }
  if ((label | 0) == 1166) {
   HEAP32[$6 >> 2] = $reset_pos_0;
  }
  __ZN10ime_pinyin12MatrixSearch16get_spl_start_idEv($this);
  __ZN10ime_pinyin12MatrixSearch18prepare_candidatesEv($this);
  $_0 = HEAP32[$6 >> 2] | 0;
  return $_0 | 0;
 }
 do {
  if ($is_pos_in_splid) {
   if ((HEAP32[$this + 732 >> 2] | 0) >>> 0 <= $pos >>> 0) {
    $_0 = $7;
    return $_0 | 0;
   }
   $63 = $this + 736 + ($pos + 1 << 1) | 0;
   $68 = HEAPU16[$this + 736 + ($pos << 1) >> 1] | 0;
   $69 = (HEAPU16[$63 >> 1] | 0) - $68 | 0;
   __ZN10ime_pinyin12MatrixSearch10del_in_pysEjj($this, $68, $69);
   $74 = HEAPU16[$this + 116 + (HEAP32[$this + 356 >> 2] << 1) >> 1] | 0;
   if ($74 >>> 0 <= $pos >>> 0) {
    $reset_pos_134 = (HEAPU16[$63 >> 1] | 0) - $69 | 0;
    label = 1189;
    break;
   }
   $83 = HEAPU16[$this + 736 + ($74 << 1) >> 1] | 0;
   $84 = $83 - $69 | 0;
   if (($83 | 0) == ($69 | 0)) {
    $reset_pos_1 = $84;
    label = 1180;
    break;
   }
   __ZN10ime_pinyin12MatrixSearch16merge_fixed_lmasEj($this, $pos);
   $reset_pos_1 = $84;
   label = 1180;
  } else {
   $25 = $this + 356 | 0;
   $26 = HEAP32[$25 >> 2] | 0;
   do {
    if (($26 | 0) != 0) {
     if ((HEAPU16[$this + 736 + (HEAPU16[$this + 116 + ($26 << 1) >> 1] << 1) >> 1] | 0) >>> 0 <= $pos >>> 0) {
      break;
     }
     $_0 = HEAP32[$6 >> 2] | 0;
     return $_0 | 0;
    }
   } while (0);
   __ZN10ime_pinyin12MatrixSearch10del_in_pysEjj($this, $pos, 1);
   if ((HEAPU16[$this + 736 + (HEAPU16[$this + 116 + (HEAP32[$25 >> 2] << 1) >> 1] << 1) >> 1] | 0) != ($pos | 0)) {
    $reset_pos_134 = $pos;
    label = 1189;
    break;
   }
   if ((HEAP32[$this + 196 >> 2] | 0) != 16777215 | $clear_fixed_this_step ^ 1) {
    $reset_pos_134 = $pos;
    label = 1189;
    break;
   }
   $51 = $this + 720 | 0;
   $53 = (HEAP32[$51 >> 2] | 0) - 1 | 0;
   HEAP32[$51 >> 2] = $53;
   $55 = HEAP16[$this + 640 + ($53 << 1) >> 1] | 0;
   HEAP16[$this + 724 >> 1] = $55;
   $reset_pos_1 = HEAPU16[$this + 736 + (($55 & 65535) << 1) >> 1] | 0;
   label = 1180;
  }
 } while (0);
 do {
  if ((label | 0) == 1180) {
   if (($reset_pos_1 | 0) == 0) {
    $reset_pos_134 = 0;
    label = 1189;
    break;
   }
   $90 = $this + 724 | 0;
   if ((HEAP16[$90 >> 1] | 0) == 0) {
    ___assert_func(1184, 552, 6584, 1360);
    return 0;
   }
   if (($reset_pos_1 | 0) != (HEAPU16[$this + 480 + (HEAPU16[$this + 640 + (HEAP32[$this + 720 >> 2] << 1) >> 1] << 1) >> 1] | 0)) {
    ___assert_func(1184, 552, 6584, 1360);
    return 0;
   }
   __ZN10ime_pinyin12MatrixSearch13reset_search0Ev($this) | 0;
   $106 = $this + 728 | 0;
   HEAP8[$106] = 1;
   $c_py_pos_0 = 0;
   while (1) {
    $108 = $c_py_pos_0 & 65535;
    if ($108 >>> 0 >= $reset_pos_1 >>> 0) {
     label = 1188;
     break;
    }
    if (__ZN10ime_pinyin12MatrixSearch8add_charEc($this, HEAP8[$this + 32 + $108 | 0] | 0) | 0) {
     $c_py_pos_0 = $c_py_pos_0 + 1 & 65535;
    } else {
     label = 1187;
     break;
    }
   }
   if ((label | 0) == 1188) {
    HEAP8[$106] = 0;
    HEAP32[$this + 112 >> 2] = 1;
    HEAP32[$this + 356 >> 2] = 1;
    HEAP8[$this + 360 | 0] = 0;
    $120 = HEAP16[$90 >> 1] | 0;
    $122 = $this + 896 | 0;
    HEAP32[$122 >> 2] = $120 & 65535;
    HEAP16[$this + 118 >> 1] = $120;
    HEAP32[$this + 196 >> 2] = 16777215;
    $130 = HEAPU16[$this + 736 + (HEAP32[$122 >> 2] << 1) >> 1] | 0;
    $132 = HEAP32[$this + 96 >> 2] | 0;
    HEAP32[$132 + ($130 * 12 | 0) + 8 >> 2] = (HEAP32[$this + 80 >> 2] | 0) + (HEAPU16[$132 + ($130 * 12 | 0) >> 1] << 4);
    $reset_pos_2 = $reset_pos_1;
    break;
   } else if ((label | 0) == 1187) {
    ___assert_func(1184, 563, 6584, 1632);
    return 0;
   }
  }
 } while (0);
 if ((label | 0) == 1189) {
  __ZN10ime_pinyin12MatrixSearch12reset_searchEjbbb($this, $reset_pos_134, $clear_fixed_this_step, 0, 0) | 0;
  $reset_pos_2 = $reset_pos_134;
 }
 while (1) {
  $140 = HEAP8[$this + 32 + $reset_pos_2 | 0] | 0;
  if ($140 << 24 >> 24 == 0) {
   break;
  }
  if (__ZN10ime_pinyin12MatrixSearch8add_charEc($this, $140) | 0) {
   $reset_pos_2 = $reset_pos_2 + 1 | 0;
  } else {
   label = 1192;
   break;
  }
 }
 if ((label | 0) == 1192) {
  HEAP32[$6 >> 2] = $reset_pos_2;
 }
 __ZN10ime_pinyin12MatrixSearch16get_spl_start_idEv($this);
 __ZN10ime_pinyin12MatrixSearch18prepare_candidatesEv($this);
 $_0 = HEAP32[$6 >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch17get_candidate_numEv($this) {
 $this = $this | 0;
 var $7 = 0, $_0 = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = HEAP32[$this + 72 >> 2] | 0;
 if (($7 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP16[(HEAP32[$this + 96 >> 2] | 0) + ($7 * 12 | 0) + 4 >> 1] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = (HEAP32[$this + 12500 >> 2] | 0) + 1 | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch13get_candidateEjPtj($this, $cand_id, $cand_str, $max_len) {
 $this = $this | 0;
 $cand_id = $cand_id | 0;
 $cand_str = $cand_str | 0;
 $max_len = $max_len | 0;
 var $s = 0, $21 = 0, $24 = 0, $26 = 0, $s_len_0 = 0, $38 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $s = sp | 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 72 >> 2] | 0) == 0 | ($cand_str | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if (($cand_id | 0) == 0) {
  $_0 = __ZN10ime_pinyin12MatrixSearch14get_candidate0EPtjS1_b($this, $cand_str, $max_len, 0, 0) | 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 12500 >> 2] | 0) == 0) {
  $_0 = __ZN10ime_pinyin12MatrixSearch14get_candidate0EPtjS1_b($this, $cand_str, $max_len, 0, 0) | 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $21 = $cand_id - 1 | 0;
 $24 = HEAP32[$this + 900 + ($21 << 3) >> 2] | 0;
 $26 = $24 >>> 24 & 15;
 if (($26 & 65535) > 1) {
  $s_len_0 = __ZN10ime_pinyin12MatrixSearch13get_lemma_strEjPtt($this, $24 & 16777215, $s | 0, 9) | 0;
 } else {
  HEAP16[$s >> 1] = HEAP16[$this + 900 + ($21 << 3) + 6 >> 1] | 0;
  HEAP16[$s + 2 >> 1] = 0;
  $s_len_0 = $26;
 }
 $38 = $s_len_0 & 65535;
 if (!($s_len_0 << 16 >> 16 != 0 & $38 >>> 0 < $max_len >>> 0)) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 _utf16_strncpy($cand_str, $s | 0, $38) | 0;
 HEAP16[$cand_str + ($38 << 1) >> 1] = 0;
 $_0 = $cand_str;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch14get_candidate0EPtjS1_b($this, $cand_str, $max_len, $retstr_len, $only_unfixed) {
 $this = $this | 0;
 $cand_str = $cand_str | 0;
 $max_len = $max_len | 0;
 $retstr_len = $retstr_len | 0;
 $only_unfixed = $only_unfixed | 0;
 var $idxs = 0, $str = 0, $2 = 0, $6 = 0, $16 = 0, $id_num_0_lcssa = 0, $18 = 0, $19 = 0, $20 = 0, $mtrx_nd_040 = 0, $id_num_039 = 0, $24 = 0, $26 = 0, $id_num_1 = 0, $ret_pos_0 = 0, $29 = 0, $31 = 0, $34 = 0, $35 = 0, $38 = 0, $45 = 0, $48 = 0, $51 = 0, $ret_pos_1 = 0, $58 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 184 | 0;
 $idxs = sp | 0;
 $str = sp + 160 | 0;
 $2 = HEAP32[$this + 72 >> 2] | 0;
 if (($2 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $6 = HEAP32[$this + 96 >> 2] | 0;
 if ((HEAP16[$6 + ($2 * 12 | 0) + 4 >> 1] | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $16 = (HEAP32[$this + 80 >> 2] | 0) + (HEAPU16[$6 + ($2 * 12 | 0) >> 1] << 4) | 0;
 if (($16 | 0) == 0) {
  $id_num_0_lcssa = 0;
 } else {
  $id_num_039 = 0;
  $mtrx_nd_040 = $16;
  while (1) {
   HEAP32[$idxs + ($id_num_039 << 2) >> 2] = HEAP32[$mtrx_nd_040 >> 2];
   $24 = $id_num_039 + 1 | 0;
   $26 = HEAP32[$mtrx_nd_040 + 8 >> 2] | 0;
   if (($26 | 0) == 0) {
    $id_num_0_lcssa = $24;
    break;
   } else {
    $id_num_039 = $24;
    $mtrx_nd_040 = $26;
   }
  }
 }
 $18 = $str | 0;
 $19 = $this + 896 | 0;
 $20 = $this + 896 | 0;
 $ret_pos_0 = 0;
 $id_num_1 = $id_num_0_lcssa;
 L1555 : while (1) {
  $29 = $id_num_1 - 1 | 0;
  $31 = HEAP32[$idxs + ($29 << 2) >> 2] | 0;
  if (($31 | 0) == 0) {
   $ret_pos_1 = $ret_pos_0;
  } else {
   $34 = __ZN10ime_pinyin12MatrixSearch13get_lemma_strEjPtt($this, $31, $18, 9) | 0;
   $35 = $34 & 65535;
   if ($34 << 16 >> 16 == 0) {
    $_0 = 0;
    label = 1252;
    break;
   }
   $38 = $max_len - $ret_pos_0 | 0;
   do {
    if ($only_unfixed) {
     if (((HEAP32[$19 >> 2] | 0) + $38 | 0) >>> 0 <= $35 >>> 0) {
      $_0 = 0;
      label = 1257;
      break L1555;
     }
     $48 = HEAP32[$20 >> 2] | 0;
     if ($ret_pos_0 >>> 0 < $48 >>> 0) {
      break;
     }
     $51 = $cand_str + ($ret_pos_0 - $48 << 1) | 0;
     _utf16_strncpy($51, $18, $35) | 0;
    } else {
     if ($38 >>> 0 <= $35 >>> 0) {
      $_0 = 0;
      label = 1255;
      break L1555;
     }
     $45 = $cand_str + ($ret_pos_0 << 1) | 0;
     _utf16_strncpy($45, $18, $35) | 0;
    }
   } while (0);
   $ret_pos_1 = $35 + $ret_pos_0 | 0;
  }
  if (($29 | 0) == 0) {
   label = 1244;
   break;
  } else {
   $ret_pos_0 = $ret_pos_1;
   $id_num_1 = $29;
  }
 }
 if ((label | 0) == 1255) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 1252) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 1257) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 1244) {
  $58 = ($retstr_len | 0) != 0;
  if ($only_unfixed) {
   if ($58) {
    HEAP16[$retstr_len >> 1] = $ret_pos_1 - (HEAP32[$this + 896 >> 2] | 0) & 65535;
   }
   HEAP16[$cand_str + ($ret_pos_1 - (HEAP32[$this + 896 >> 2] | 0) << 1) >> 1] = 0;
   $_0 = $cand_str;
   STACKTOP = sp;
   return $_0 | 0;
  } else {
   if ($58) {
    HEAP16[$retstr_len >> 1] = $ret_pos_1 & 65535;
   }
   HEAP16[$cand_str + ($ret_pos_1 << 1) >> 1] = 0;
   $_0 = $cand_str;
   STACKTOP = sp;
   return $_0 | 0;
  }
 }
 return 0;
}
function __ZN10ime_pinyin12MatrixSearch13get_lemma_strEjPtt($this, $id_lemma, $str_buf, $str_max) {
 $this = $this | 0;
 $id_lemma = $id_lemma | 0;
 $str_buf = $str_buf | 0;
 $str_max = $str_max | 0;
 var $4 = 0, $14 = 0, $31 = 0, $33 = 0, $str_len_0 = 0, $36 = 0, $37 = 0, $_0 = 0;
 if (__ZN10ime_pinyin15is_system_lemmaEj($id_lemma) | 0) {
  $4 = HEAP32[$this + 12 >> 2] | 0;
  $_0 = FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$4 >> 2] | 0) + 32 >> 2] & 31]($4, $id_lemma, $str_buf, $str_max) | 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin13is_user_lemmaEj($id_lemma) | 0)) {
  if (($str_max & 65535) < 2 | (__ZN10ime_pinyin18is_composing_lemmaEj($id_lemma) | 0) ^ 1) {
   $_0 = 0;
   return $_0 | 0;
  }
  $31 = HEAP16[$this + 640 + (HEAP32[$this + 720 >> 2] << 1) >> 1] | 0;
  $33 = ($str_max & 65535) - 1 | 0;
  $str_len_0 = ($31 & 65535 | 0) > ($33 | 0) ? $33 & 65535 : $31;
  $36 = $this + 560 | 0;
  $37 = $str_len_0 & 65535;
  _utf16_strncpy($str_buf, $36, $37) | 0;
  HEAP16[$str_buf + ($37 << 1) >> 1] = 0;
  $_0 = $str_len_0;
  return $_0 | 0;
 }
 $14 = HEAP32[$this + 16 >> 2] | 0;
 if (($14 | 0) == 0) {
  HEAP16[$str_buf >> 1] = 0;
  $_0 = 0;
  return $_0 | 0;
 } else {
  $_0 = FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$14 >> 2] | 0) + 32 >> 2] & 31]($14, $id_lemma, $str_buf, $str_max) | 0;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12MatrixSearch16update_dict_freqEv($this) {
 $this = $this | 0;
 var $2 = 0, $9 = 0, $11 = 0;
 $2 = HEAP32[$this + 16 >> 2] | 0;
 if (($2 | 0) == 0) {
  return;
 }
 $9 = FUNCTION_TABLE_ii[HEAP32[(HEAP32[$2 >> 2] | 0) + 68 >> 2] & 31]($2) | 0;
 $11 = HEAP32[$this + 12 >> 2] | 0;
 FUNCTION_TABLE_vii[HEAP32[(HEAP32[$11 >> 2] | 0) + 72 >> 2] & 15]($11, $9);
 return;
}
function __ZN10ime_pinyin12MatrixSearch16get_lemma_splidsEjPttb($this, $id_lemma, $splids, $splids_max, $arg_valid) {
 $this = $this | 0;
 $id_lemma = $id_lemma | 0;
 $splids = $splids | 0;
 $splids_max = $splids_max | 0;
 $arg_valid = $arg_valid | 0;
 var $1 = 0, $splid_num_0 = 0, $splid_num_1 = 0, $17 = 0, $27 = 0, $38 = 0, $41 = 0, $pos_0 = 0, $43 = 0, $48 = 0, $_0 = 0, label = 0;
 do {
  if ($arg_valid) {
   $1 = $this + 4 | 0;
   $splid_num_0 = 0;
   while (1) {
    if (($splid_num_0 & 65535) >= ($splids_max & 65535)) {
     break;
    }
    if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$1 >> 2] | 0, HEAP16[$splids + (($splid_num_0 & 65535) << 1) >> 1] | 0) | 0) {
     break;
    } else {
     $splid_num_0 = $splid_num_0 + 1 & 65535;
    }
   }
   if ($splid_num_0 << 16 >> 16 == $splids_max << 16 >> 16) {
    $_0 = $splid_num_0;
   } else {
    $splid_num_1 = $splid_num_0;
    break;
   }
   return $_0 | 0;
  } else {
   $splid_num_1 = 0;
  }
 } while (0);
 if (__ZN10ime_pinyin15is_system_lemmaEj($id_lemma) | 0) {
  $17 = HEAP32[$this + 12 >> 2] | 0;
  $_0 = FUNCTION_TABLE_iiiiii[HEAP32[(HEAP32[$17 >> 2] | 0) + 36 >> 2] & 15]($17, $id_lemma, $splids, $splids_max, $arg_valid) | 0;
  return $_0 | 0;
 }
 if (__ZN10ime_pinyin13is_user_lemmaEj($id_lemma) | 0) {
  $27 = HEAP32[$this + 16 >> 2] | 0;
  if (($27 | 0) == 0) {
   $_0 = 0;
   return $_0 | 0;
  }
  $_0 = FUNCTION_TABLE_iiiiii[HEAP32[(HEAP32[$27 >> 2] | 0) + 36 >> 2] & 15]($27, $id_lemma, $splids, $splids_max, $arg_valid) | 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin18is_composing_lemmaEj($id_lemma) | 0)) {
  $_0 = $splid_num_1;
  return $_0 | 0;
 }
 $38 = $this + 724 | 0;
 if ((HEAPU16[$38 >> 1] | 0) > ($splids_max & 65535)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $41 = $this + 4 | 0;
 $pos_0 = 0;
 while (1) {
  $43 = $pos_0 & 65535;
  if (($pos_0 & 65535) >= (HEAPU16[$38 >> 1] | 0)) {
   $_0 = $splid_num_1;
   label = 1298;
   break;
  }
  $48 = HEAP16[$this + 400 + ($43 << 1) >> 1] | 0;
  HEAP16[$splids + ($43 << 1) >> 1] = $48;
  if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$41 >> 2] | 0, $48) | 0) {
   $_0 = 0;
   label = 1296;
   break;
  } else {
   $pos_0 = $pos_0 + 1 & 65535;
  }
 }
 if ((label | 0) == 1298) {
  return $_0 | 0;
 } else if ((label | 0) == 1296) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12MatrixSearch15debug_print_dmiEtt($this, $dmi_pos, $nest_level) {
 $this = $this | 0;
 $dmi_pos = $dmi_pos | 0;
 $nest_level = $nest_level | 0;
 var $1 = 0, $7 = 0, $8 = 0, $12 = 0, $30 = 0, $32 = 0, $33 = 0, $35 = 0, $37 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $dmi_pos & 65535;
 if ((HEAPU16[$this + 92 >> 1] | 0) <= ($dmi_pos & 65535)) {
  STACKTOP = sp;
  return;
 }
 $7 = HEAP32[$this + 88 >> 2] | 0;
 $8 = $nest_level << 16 >> 16 == 1;
 if ($8) {
  _printf(768, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $1, tempInt) | 0) | 0;
 }
 $12 = $7 + ($1 * 12 | 0) + 8 | 0;
 if ((HEAP8[$12] & 126) > 1) {
  __ZN10ime_pinyin12MatrixSearch15debug_print_dmiEtt($this, HEAP16[$7 + ($1 * 12 | 0) + 4 >> 1] | 0, $nest_level + 1 & 65535);
 }
 _printf(616, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = HEAP8[$12] & 127, tempInt) | 0) | 0;
 $30 = HEAPU16[$7 + ($1 * 12 | 0) + 2 >> 1] | 0;
 _printf(440, (tempInt = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempInt >> 2] = HEAPU16[$7 + ($1 * 12 | 0) >> 1] | 0, HEAP32[tempInt + 8 >> 2] = $30, tempInt) | 0) | 0;
 $32 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $33 = $7 + ($1 * 12 | 0) + 6 | 0;
 $35 = __ZN10ime_pinyin12SpellingTrie16get_spelling_strEt($32, HEAP16[$33 >> 1] | 0) | 0;
 $37 = HEAPU16[$33 >> 1] | 0;
 _printf(4288, (tempInt = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempInt >> 2] = $35, HEAP32[tempInt + 8 >> 2] = $37, tempInt) | 0) | 0;
 _printf(4064, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = (HEAPU8[$7 + ($1 * 12 | 0) + 9 | 0] | 0) >>> 1 & 255, tempInt) | 0) | 0;
 if (!$8) {
  STACKTOP = sp;
  return;
 }
 _printf(3864, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $1, tempInt) | 0) | 0;
 STACKTOP = sp;
 return;
}
function __ZN10ime_pinyin12MatrixSearch25try_add_cand0_to_userdictEv($this) {
 $this = $this | 0;
 var $1 = 0, $6 = 0, $9 = 0, $modified_0_off025 = 0, $pos_024 = 0, $lma_id_from_023 = 0, $_not31 = 0, $lma_id_from_1 = 0, $modified_1_off0 = 0, $_modified_1_off0 = 0, $25 = 0, $26 = 0, $_lcssa = 0, $modified_0_off0_lcssa = 0, $pos_0_lcssa = 0, $lma_id_from_0_lcssa = 0;
 $1 = __ZN10ime_pinyin12MatrixSearch17get_candidate_numEv($this) | 0;
 if (!((HEAP32[$this + 896 >> 2] | 0) != 0 & ($1 | 0) == 1)) {
  return 1;
 }
 $6 = $this + 356 | 0;
 if ((HEAP32[$6 >> 2] | 0) == 0) {
  $lma_id_from_0_lcssa = 0;
  $pos_0_lcssa = 0;
  $modified_0_off0_lcssa = 1;
  $_lcssa = 0;
 } else {
  $lma_id_from_023 = 0;
  $pos_024 = 0;
  $modified_0_off025 = 0;
  $9 = 0;
  while (1) {
   $_not31 = ((HEAPU16[$this + 116 + ($9 + 1 << 1) >> 1] | 0) - (HEAPU16[$this + 116 + (($lma_id_from_023 & 65535) << 1) >> 1] | 0) | 0) < 9;
   if ($_not31 | $modified_0_off025 ^ 1) {
    $modified_1_off0 = $_not31 & $modified_0_off025;
    $lma_id_from_1 = $_not31 ? $lma_id_from_023 : $pos_024;
   } else {
    __ZN10ime_pinyin12MatrixSearch19add_lma_to_userdictEttf($this, $lma_id_from_023, $pos_024, 0.0) | 0;
    $modified_1_off0 = 0;
    $lma_id_from_1 = $pos_024;
   }
   $_modified_1_off0 = (HEAP8[$this + 360 + $9 | 0] | 0) == 0 | $modified_1_off0;
   $25 = $pos_024 + 1 & 65535;
   $26 = $25 & 65535;
   if ($26 >>> 0 < (HEAP32[$6 >> 2] | 0) >>> 0) {
    $lma_id_from_023 = $lma_id_from_1;
    $pos_024 = $25;
    $modified_0_off025 = $_modified_1_off0;
    $9 = $26;
   } else {
    break;
   }
  }
  $lma_id_from_0_lcssa = $lma_id_from_1;
  $pos_0_lcssa = $25;
  $modified_0_off0_lcssa = $_modified_1_off0 ^ 1;
  $_lcssa = $26;
 }
 if (((HEAPU16[$this + 116 + ($_lcssa << 1) >> 1] | 0) - (HEAPU16[$this + 116 + (($lma_id_from_0_lcssa & 65535) << 1) >> 1] | 0) | 0) < 2 | $modified_0_off0_lcssa) {
  return 1;
 }
 __ZN10ime_pinyin12MatrixSearch19add_lma_to_userdictEttf($this, $lma_id_from_0_lcssa, $pos_0_lcssa, 0.0) | 0;
 return 1;
}
function __ZN10ime_pinyin12MatrixSearch16merge_fixed_lmasEj($this, $del_spl_pos) {
 $this = $this | 0;
 $del_spl_pos = $del_spl_pos | 0;
 var $1 = 0, $5 = 0, $7 = 0, $8 = 0, $15 = 0, $pos_071 = 0, $17 = 0, $31 = 0, $33 = 0, $35 = 0, $37 = 0, $38 = 0, $41 = 0, $48 = 0, $bp_0 = 0, $56 = 0, $57 = 0, $61 = 0, $63 = 0, $64 = 0, $66 = 0, $phrase_len_063 = 0, $pos1_062 = 0, $67 = 0, $68 = 0, $70 = 0, $87 = 0, $99 = 0, $100 = 0, $101 = 0, $phrase_len_0_lcssa = 0, $117 = 0, $pos2_070 = 0, $118 = 0, $119 = 0, $phrase_len_1 = 0, $133 = 0, $139 = 0, $143 = 0, $pos3_057 = 0, $155 = 0, $160 = 0, $pos4_054 = 0, $del_a_sub_0_off053 = 0, $162 = 0, $165 = 0, $171 = 0, label = 0;
 $1 = $this + 356 | 0;
 if ((HEAP32[$1 >> 2] | 0) == 0) {
  return;
 }
 $5 = $this + 732 | 0;
 $7 = (HEAP32[$5 >> 2] | 0) - 1 | 0;
 HEAP32[$5 >> 2] = $7;
 $8 = $this + 736 | 0;
 L1672 : do {
  if ($7 >>> 0 >= $del_spl_pos >>> 0) {
   $15 = (HEAP16[$this + 736 + ($del_spl_pos << 1) >> 1] | 0) - (HEAP16[$this + 736 + ($del_spl_pos + 1 << 1) >> 1] | 0) & 65535;
   $pos_071 = $del_spl_pos;
   while (1) {
    $17 = $pos_071 + 1 | 0;
    HEAP16[$this + 736 + ($pos_071 << 1) >> 1] = $15 + (HEAP16[$this + 736 + ($17 << 1) >> 1] | 0) & 65535;
    if (($pos_071 | 0) == (HEAP32[$5 >> 2] | 0)) {
     break L1672;
    }
    HEAP16[$this + 816 + ($pos_071 << 1) >> 1] = HEAP16[$this + 816 + ($17 << 1) >> 1] | 0;
    if ($17 >>> 0 > (HEAP32[$5 >> 2] | 0) >>> 0) {
     break;
    } else {
     $pos_071 = $17;
    }
   }
  }
 } while (0);
 $31 = $this + 400 | 0;
 $33 = $this + 816 | 0;
 $35 = HEAP32[$5 >> 2] << 1;
 _memcpy($31 | 0, $33 | 0, $35) | 0;
 $37 = $this + 480 | 0;
 $38 = $8;
 $41 = (HEAP32[$5 >> 2] << 1) + 2 | 0;
 _memcpy($37 | 0, $38 | 0, $41) | 0;
 do {
  if ((HEAP32[$1 >> 2] | 0) >>> 0 > 1) {
   label = 1333;
  } else {
   if ((HEAP32[$this + 196 >> 2] | 0) != 16777215) {
    label = 1333;
    break;
   }
   $48 = $this + 720 | 0;
   $pos2_070 = 0;
   $117 = 0;
   do {
    $118 = $this + 640 + ($117 << 1) | 0;
    $119 = HEAP16[$118 >> 1] | 0;
    if (($119 & 65535) >>> 0 > $del_spl_pos >>> 0) {
     HEAP16[$118 >> 1] = $119 - 1 & 65535;
    }
    $pos2_070 = $pos2_070 + 1 & 65535;
    $117 = $pos2_070 & 65535;
   } while ($117 >>> 0 <= (HEAP32[$48 >> 2] | 0) >>> 0);
   $phrase_len_1 = HEAP16[$this + 724 >> 1] | 0;
  }
 } while (0);
 do {
  if ((label | 0) == 1333) {
   if ((HEAP32[$this + 196 >> 2] | 0) == 16777215) {
    $bp_0 = 1;
   } else {
    HEAP32[$this + 720 >> 2] = 0;
    $bp_0 = 0;
   }
   $56 = $this + 720 | 0;
   $57 = $bp_0 & 65535;
   L1692 : do {
    if ($57 >>> 0 > (HEAP32[$1 >> 2] | 0) >>> 0) {
     $phrase_len_0_lcssa = 0;
    } else {
     $61 = HEAP32[$56 >> 2] & 65535;
     $63 = $61 - ($bp_0 & 65535) | 0;
     $64 = $this + 640 + ($61 << 1) | 0;
     $pos1_062 = $bp_0;
     $phrase_len_063 = 0;
     $66 = $57;
     while (1) {
      $67 = $this + 116 + ($66 << 1) | 0;
      $68 = HEAP16[$67 >> 1] | 0;
      $70 = $this + 640 + ($63 + $66 << 1) | 0;
      HEAP16[$70 >> 1] = $68;
      if ((HEAPU16[$67 >> 1] | 0) >>> 0 > $del_spl_pos >>> 0) {
       HEAP16[$70 >> 1] = $68 - 1 & 65535;
      }
      if (($66 | 0) == (HEAP32[$1 >> 2] | 0)) {
       $phrase_len_0_lcssa = $phrase_len_063;
       break L1692;
      }
      $87 = __ZN10ime_pinyin12MatrixSearch13get_lemma_strEjPtt($this, HEAP32[$this + 196 + ($66 << 2) >> 2] | 0, $this + 560 + ((HEAPU16[$64 >> 1] | 0) + ($phrase_len_063 & 65535) << 1) | 0, 40 - $phrase_len_063 & 65535) | 0;
      if (($87 & 65535 | 0) != ((HEAPU16[$this + 116 + ($66 + 1 << 1) >> 1] | 0) - (HEAPU16[$67 >> 1] | 0) | 0)) {
       break;
      }
      $99 = $87 + $phrase_len_063 & 65535;
      $100 = $pos1_062 + 1 & 65535;
      $101 = $100 & 65535;
      if ($101 >>> 0 > (HEAP32[$1 >> 2] | 0) >>> 0) {
       $phrase_len_0_lcssa = $99;
       break L1692;
      } else {
       $pos1_062 = $100;
       $phrase_len_063 = $99;
       $66 = $101;
      }
     }
     ___assert_func(1184, 1245, 6944, 2984);
    }
   } while (0);
   if ($phrase_len_0_lcssa << 16 >> 16 == (HEAP16[$this + 116 + (HEAP32[$1 >> 2] << 1) >> 1] | 0)) {
    HEAP16[$this + 724 >> 1] = $phrase_len_0_lcssa;
    HEAP32[$56 >> 2] = (HEAP32[$1 >> 2] | 0) - ($bp_0 & 65535) + (HEAP32[$56 >> 2] | 0);
    $phrase_len_1 = $phrase_len_0_lcssa;
    break;
   } else {
    ___assert_func(1184, 1248, 6944, 2872);
   }
  }
 } while (0);
 if (($phrase_len_1 << 16 >> 16 | 0) == 1) {
  HEAP32[$1 >> 2] = 0;
  return;
 } else if (($phrase_len_1 << 16 >> 16 | 0) == 0) {
  ___assert_func(1184, 1260, 6944, 2736);
 } else {
  $133 = $this + 720 | 0;
  if ((HEAPU16[$this + 640 + (HEAP32[$133 >> 2] << 1) >> 1] | 0) != ($del_spl_pos | 0)) {
   $139 = $del_spl_pos + 1 | 0;
   $pos3_057 = 0;
   $143 = 0;
   do {
    HEAP16[$this + 560 + ($143 + $del_spl_pos << 1) >> 1] = HEAP16[$this + 560 + ($139 + $143 << 1) >> 1] | 0;
    $pos3_057 = $pos3_057 + 1 & 65535;
    $143 = $pos3_057 & 65535;
   } while ($143 >>> 0 < ((HEAPU16[$this + 640 + (HEAP32[$133 >> 2] << 1) >> 1] | 0) - $del_spl_pos | 0) >>> 0);
  }
  $155 = $this + 724 | 0;
  HEAP16[$155 >> 1] = (HEAP16[$155 >> 1] | 0) - 1 & 65535;
  if ((HEAP32[$133 >> 2] | 0) == 0) {
   return;
  } else {
   $del_a_sub_0_off053 = 0;
   $pos4_054 = 1;
   $160 = 1;
  }
  do {
   $162 = $this + 640 + ($160 - 1 << 1) | 0;
   $165 = HEAP16[$this + 640 + ($160 << 1) >> 1] | 0;
   $del_a_sub_0_off053 = (HEAP16[$162 >> 1] | 0) == $165 << 16 >> 16 | $del_a_sub_0_off053;
   if ($del_a_sub_0_off053) {
    HEAP16[$162 >> 1] = $165;
   }
   $pos4_054 = $pos4_054 + 1 & 65535;
   $160 = $pos4_054 & 65535;
   $171 = HEAP32[$133 >> 2] | 0;
  } while ($160 >>> 0 <= $171 >>> 0);
  if (!$del_a_sub_0_off053) {
   return;
  }
  HEAP32[$133 >> 2] = $171 - 1;
  return;
 }
}
function __ZN10ime_pinyin12MatrixSearch19add_lma_to_userdictEttf($this, $lma_fr, $lma_to, $score) {
 $this = $this | 0;
 $lma_fr = $lma_fr | 0;
 $lma_to = $lma_to | 0;
 $score = +$score;
 var $word_str = 0, $spl_ids = 0, $6 = 0, $spl_id_fr_028 = 0, $pos_027 = 0, $10 = 0, $12 = 0, $15 = 0, $19 = 0, $26 = 0, $28 = 0, $29 = 0, $30 = 0, $43 = 0, $44 = 0, $spl_id_fr_0_lcssa29 = 0, $48 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40 | 0;
 $word_str = sp | 0;
 $spl_ids = sp + 24 | 0;
 if ((($lma_to & 65535) - ($lma_fr & 65535) | 0) < 2) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $6 = $this + 16 | 0;
 if ((HEAP32[$6 >> 2] | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 do {
  if (($lma_fr & 65535) < ($lma_to & 65535)) {
   $pos_027 = $lma_fr;
   $spl_id_fr_028 = 0;
   while (1) {
    $10 = $pos_027 & 65535;
    $12 = HEAP32[$this + 196 + ($10 << 2) >> 2] | 0;
    if (__ZN10ime_pinyin13is_user_lemmaEj($12) | 0) {
     $15 = HEAP32[$6 >> 2] | 0;
     $19 = HEAP32[(HEAP32[$15 >> 2] | 0) + 48 >> 2] | 0;
     FUNCTION_TABLE_iiiii[$19 & 31]($15, $12, 1, 1) | 0;
    }
    $26 = HEAP16[$this + 116 + ($10 << 1) >> 1] | 0;
    $28 = (HEAP16[$this + 116 + ($10 + 1 << 1) >> 1] | 0) - $26 & 65535;
    $29 = $spl_id_fr_028 & 65535;
    $30 = $spl_ids + ($29 << 1) | 0;
    _utf16_strncpy($30, $this + 816 + (($26 & 65535) << 1) | 0, $28 & 65535) | 0;
    if ((__ZN10ime_pinyin12MatrixSearch13get_lemma_strEjPtt($this, $12, $word_str + ($29 << 1) | 0, 9 - $spl_id_fr_028 & 65535) | 0) << 16 >> 16 != $28 << 16 >> 16) {
     label = 1374;
     break;
    }
    if ((__ZN10ime_pinyin12MatrixSearch16get_lemma_splidsEjPttb($this, $12, $30, $28, 1) | 0) << 16 >> 16 != $28 << 16 >> 16) {
     $_0 = 0;
     label = 1383;
     break;
    }
    $43 = $28 + $spl_id_fr_028 & 65535;
    $44 = $pos_027 + 1 & 65535;
    if (($44 & 65535) < ($lma_to & 65535)) {
     $pos_027 = $44;
     $spl_id_fr_028 = $43;
    } else {
     label = 1377;
     break;
    }
   }
   if ((label | 0) == 1383) {
    STACKTOP = sp;
    return $_0 | 0;
   } else if ((label | 0) == 1377) {
    if (($43 & 65535) < 9) {
     $spl_id_fr_0_lcssa29 = $43;
     break;
    }
    ___assert_func(1184, 682, 6808, 944);
    return 0;
   } else if ((label | 0) == 1374) {
    ___assert_func(1184, 672, 6808, 1136);
    return 0;
   }
  } else {
   $spl_id_fr_0_lcssa29 = 0;
  }
 } while (0);
 $48 = HEAP32[$6 >> 2] | 0;
 $_0 = (FUNCTION_TABLE_iiiiii[HEAP32[(HEAP32[$48 >> 2] | 0) + 44 >> 2] & 15]($48, $word_str | 0, $spl_ids | 0, $spl_id_fr_0_lcssa29, 1) | 0) != 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch9match_dmiEjPtt($this, $step_to, $spl_ids, $spl_id_num) {
 $this = $this | 0;
 $step_to = $step_to | 0;
 $spl_ids = $spl_ids | 0;
 $spl_id_num = $spl_id_num | 0;
 var $5 = 0, $12 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $24 = 0, $dmi_pos_024 = 0, $_sum = 0, $spl_pos_019 = 0, $dmi_018 = 0, $50 = 0, $56 = 0, $57 = 0, $_0 = 0, label = 0;
 if ((HEAP32[$this + 72 >> 2] | 0) >>> 0 < $step_to >>> 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 $5 = $this + 96 | 0;
 if ((HEAP16[(HEAP32[$5 >> 2] | 0) + ($step_to * 12 | 0) + 6 >> 1] & 32767) == 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 $12 = HEAP32[$5 >> 2] | 0;
 if ((HEAP16[$12 + ($step_to * 12 | 0) + 6 >> 1] & 32767) == 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 $18 = $this + 88 | 0;
 $19 = HEAP32[$18 >> 2] | 0;
 $20 = $spl_id_num & 65535;
 $21 = $spl_id_num << 16 >> 16 == 0;
 $22 = $20 - 1 | 0;
 $dmi_pos_024 = 0;
 $24 = $12;
 L1761 : while (1) {
  $_sum = (HEAPU16[$24 + ($step_to * 12 | 0) + 2 >> 1] | 0) + ($dmi_pos_024 & 65535) | 0;
  L1763 : do {
   if ((HEAP8[$19 + ($_sum * 12 | 0) + 8 | 0] & 127 | 0) == ($20 | 0)) {
    if ($21) {
     break L1761;
    }
    $dmi_018 = $19 + ($_sum * 12 | 0) | 0;
    $spl_pos_019 = 0;
    while (1) {
     if ((HEAP16[$spl_ids + ($22 - ($spl_pos_019 & 65535) << 1) >> 1] | 0) != (HEAP16[$dmi_018 + 6 >> 1] | 0)) {
      break L1763;
     }
     $50 = $spl_pos_019 + 1 & 65535;
     if (($50 & 65535) < ($spl_id_num & 65535)) {
      $dmi_018 = (HEAP32[$18 >> 2] | 0) + ((HEAPU16[$dmi_018 + 4 >> 1] | 0) * 12 | 0) | 0;
      $spl_pos_019 = $50;
     } else {
      break L1761;
     }
    }
   }
  } while (0);
  $56 = $dmi_pos_024 + 1 & 65535;
  $57 = HEAP32[$5 >> 2] | 0;
  if (($56 & 65535) < (HEAP16[$57 + ($step_to * 12 | 0) + 6 >> 1] & 32767)) {
   $dmi_pos_024 = $56;
   $24 = $57;
  } else {
   $_0 = -1;
   label = 1401;
   break;
  }
 }
 if ((label | 0) == 1401) {
  return $_0 | 0;
 }
 $_0 = (HEAP16[(HEAP32[$5 >> 2] | 0) + ($step_to * 12 | 0) + 2 >> 1] | 0) + $dmi_pos_024 & 65535;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch12get_fixedlenEv($this) {
 $this = $this | 0;
 var $_0 = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 72 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = HEAP32[$this + 896 >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch8fill_dmiEPNS_13DictMatchInfoEPtttthbhh($this, $dmi, $handles, $dmi_fr, $spl_id, $node_num, $dict_level, $splid_end_split, $splstr_len, $all_full_id) {
 $this = $this | 0;
 $dmi = $dmi | 0;
 $handles = $handles | 0;
 $dmi_fr = $dmi_fr | 0;
 $spl_id = $spl_id | 0;
 $node_num = $node_num | 0;
 $dict_level = $dict_level | 0;
 $splid_end_split = $splid_end_split | 0;
 $splstr_len = $splstr_len | 0;
 $all_full_id = $all_full_id | 0;
 var $9 = 0, $18 = 0;
 HEAP16[$dmi >> 1] = HEAP16[$handles >> 1] | 0;
 HEAP16[$dmi + 2 >> 1] = HEAP16[$handles + 2 >> 1] | 0;
 HEAP16[$dmi + 4 >> 1] = $dmi_fr;
 HEAP16[$dmi + 6 >> 1] = $spl_id;
 $9 = $dmi + 8 | 0;
 HEAP8[$9] = HEAP8[$9] & -128 | $dict_level & 127;
 HEAP8[$dmi + 9 | 0] = $splstr_len << 1 | $splid_end_split & 1;
 $18 = $dmi + 10 | 0;
 HEAP8[$18] = HEAP8[$18] & -2 | $all_full_id & 1;
 HEAP8[$9] = HEAP8[$9] & 127;
 return;
}
function __ZN10ime_pinyin12MatrixSearch16prepare_add_charEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 var $1 = 0, $10 = 0, $17 = 0, $19 = 0, $_0 = 0;
 $1 = $this + 72 | 0;
 if ((HEAP32[$1 >> 2] | 0) >>> 0 > 38) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin14SpellingParser17is_valid_to_parseEc(HEAP32[$this + 20 >> 2] | 0, $ch) | 0 | $ch << 24 >> 24 == 39)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $10 = $this + 92 | 0;
 if ((HEAPU16[$10 >> 1] | 0) > 799) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP8[(HEAP32[$1 >> 2] | 0) + ($this + 32) | 0] = $ch;
 $17 = (HEAP32[$1 >> 2] | 0) + 1 | 0;
 HEAP32[$1 >> 2] = $17;
 $19 = HEAP32[$this + 96 >> 2] | 0;
 HEAP16[$19 + ($17 * 12 | 0) >> 1] = HEAP16[$this + 84 >> 1] | 0;
 HEAP16[$19 + ($17 * 12 | 0) + 4 >> 1] = 0;
 HEAP16[$19 + ($17 * 12 | 0) + 2 >> 1] = HEAP16[$10 >> 1] | 0;
 HEAP16[$19 + ($17 * 12 | 0) + 6 >> 1] = 0;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch11is_split_atEt($this, $pos) {
 $this = $this | 0;
 $pos = $pos | 0;
 return (__ZN10ime_pinyin14SpellingParser17is_valid_to_parseEc(HEAP32[$this + 20 >> 2] | 0, HEAP8[($pos & 65535) - 1 + ($this + 32) | 0] | 0) | 0) ^ 1 | 0;
}
function __ZN10ime_pinyin12MatrixSearch6chooseEj($this, $cand_id) {
 $this = $this | 0;
 $cand_id = $cand_id | 0;
 var $lpi_item28 = 0, $lpi_item28_sub = 0, $tmpcast = 0, $6 = 0, $13 = 0, $19 = 0, $21 = 0, $27 = 0, $28 = 0, $29 = 0, $30 = 0, $pos_030 = 0, $33 = 0, $34 = 0, $_lcssa29 = 0, $40 = 0, $45 = 0, $51 = 0, $52 = 0, $62 = 0, $65 = 0, $66 = 0, $68 = 0, $70 = 0, $77 = 0, $83 = 0, $87 = 0, $88 = 0, $90 = 0, $94 = 0, $95 = 0, $97 = 0, $108 = 0, $119 = 0, $125 = 0, $132 = 0, $133 = 0, $140 = 0, $step_to_0 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $lpi_item28 = sp | 0;
 $lpi_item28_sub = $lpi_item28 | 0;
 $tmpcast = $lpi_item28;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $6 = $this + 72 | 0;
 if ((HEAP32[$6 >> 2] | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if (($cand_id | 0) == 0) {
  $13 = HEAP32[$this + 732 >> 2] | 0;
  HEAP32[$this + 896 >> 2] = $13;
  $19 = HEAPU16[$this + 736 + ($13 << 1) >> 1] | 0;
  $21 = HEAP32[$this + 96 >> 2] | 0;
  HEAP32[$21 + ($19 * 12 | 0) + 8 >> 2] = (HEAP32[$this + 80 >> 2] | 0) + ((HEAPU16[$21 + ($19 * 12 | 0) >> 1] | 0) << 4);
  $27 = $this + 356 | 0;
  $28 = HEAP32[$27 >> 2] | 0;
  $29 = $this + 112 | 0;
  $30 = HEAP32[$29 >> 2] | 0;
  if ($28 >>> 0 < $30 >>> 0) {
   $pos_030 = $28;
   while (1) {
    HEAP8[$this + 360 + $pos_030 | 0] = 1;
    $33 = $pos_030 + 1 | 0;
    $34 = HEAP32[$29 >> 2] | 0;
    if ($33 >>> 0 < $34 >>> 0) {
     $pos_030 = $33;
    } else {
     $_lcssa29 = $34;
     break;
    }
   }
  } else {
   $_lcssa29 = $30;
  }
  HEAP32[$27 >> 2] = $_lcssa29;
  HEAP32[$this + 12500 >> 2] = 0;
  do {
   if ((HEAP32[$29 >> 2] | 0) == 1) {
    $40 = $this + 196 | 0;
    if (!(__ZN10ime_pinyin13is_user_lemmaEj(HEAP32[$40 >> 2] | 0) | 0)) {
     break;
    }
    $45 = HEAP32[$this + 16 >> 2] | 0;
    if (($45 | 0) == 0) {
     break;
    }
    $51 = HEAP32[(HEAP32[$45 >> 2] | 0) + 48 >> 2] | 0;
    $52 = HEAP32[$40 >> 2] | 0;
    FUNCTION_TABLE_iiiii[$51 & 31]($45, $52, 1, 1) | 0;
   } else {
    if ((HEAP32[$this + 16 >> 2] | 0) == 0) {
     break;
    }
    __ZN10ime_pinyin12MatrixSearch25try_add_cand0_to_userdictEv($this) | 0;
   }
  } while (0);
  __ZN10ime_pinyin12MatrixSearch16update_dict_freqEv($this);
  $_0 = 1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $62 = $cand_id - 1 | 0;
 $65 = HEAP32[$this + 900 + ($62 << 3) >> 2] | 0;
 $66 = $65 & 16777215;
 $68 = HEAP16[$this + 900 + ($62 << 3) + 4 >> 1] | 0;
 $70 = $65 >>> 24 & 15;
 if (($70 | 0) == 0) {
  ___assert_func(1184, 819, 6760, 3664);
  return 0;
 }
 if (__ZN10ime_pinyin13is_user_lemmaEj($66) | 0) {
  $77 = HEAP32[$this + 16 >> 2] | 0;
  if (($77 | 0) != 0) {
   $83 = HEAP32[(HEAP32[$77 >> 2] | 0) + 48 >> 2] | 0;
   FUNCTION_TABLE_iiiii[$83 & 31]($77, $66, 1, 1) | 0;
  }
  __ZN10ime_pinyin12MatrixSearch16update_dict_freqEv($this);
 }
 $87 = $this + 896 | 0;
 $88 = HEAP32[$87 >> 2] | 0;
 $90 = HEAP16[$this + 736 + ($88 << 1) >> 1] | 0;
 $94 = HEAPU16[$this + 736 + ($88 + $70 << 1) >> 1] | 0;
 $95 = HEAP32[$6 >> 2] | 0;
 __ZN10ime_pinyin12MatrixSearch12reset_searchEjbbb($this, $94, 0, 0, 1) | 0;
 $97 = $this + 96 | 0;
 HEAP16[(HEAP32[$97 >> 2] | 0) + ($94 * 12 | 0) + 4 >> 1] = 0;
 HEAP16[$lpi_item28 + 4 >> 1] = $68;
 HEAP32[$lpi_item28_sub >> 2] = HEAP32[$lpi_item28_sub >> 2] & -16777216 | $66;
 $108 = __ZN10ime_pinyin12MatrixSearch9match_dmiEjPtt($this, $94, $this + 816 + (HEAP32[$87 >> 2] << 1) | 0, $70 & 65535) | 0;
 if ($108 << 16 >> 16 == -1) {
  ___assert_func(1184, 851, 6760, 3552);
  return 0;
 }
 __ZN10ime_pinyin12MatrixSearch14extend_mtrx_ndEPNS_10MatrixNodeEPNS_10LmaPsbItemEjtj($this, HEAP32[(HEAP32[$97 >> 2] | 0) + (($90 & 65535) * 12 | 0) + 8 >> 2] | 0, $tmpcast, 1, $108, $94) | 0;
 $119 = HEAP32[$97 >> 2] | 0;
 HEAP32[$119 + ($94 * 12 | 0) + 8 >> 2] = (HEAP32[$this + 80 >> 2] | 0) + ((HEAPU16[$119 + ($94 * 12 | 0) >> 1] | 0) << 4);
 $125 = HEAP32[$97 >> 2] | 0;
 HEAP16[$this + 84 >> 1] = (HEAP16[$125 + ($94 * 12 | 0) + 4 >> 1] | 0) + (HEAP16[$125 + ($94 * 12 | 0) >> 1] | 0) & 65535;
 $132 = $this + 356 | 0;
 $133 = HEAP32[$132 >> 2] | 0;
 HEAP8[$this + 360 + $133 | 0] = ($66 | 0) == (HEAP32[$this + 196 + ($133 << 2) >> 2] | 0) | 0;
 HEAP32[$this + 196 + (HEAP32[$132 >> 2] << 2) >> 2] = $66;
 $140 = HEAP32[$132 >> 2] | 0;
 HEAP16[$this + 116 + ($140 + 1 << 1) >> 1] = (HEAPU16[$this + 116 + ($140 << 1) >> 1] | 0) + $70 & 65535;
 HEAP32[$132 >> 2] = (HEAP32[$132 >> 2] | 0) + 1;
 HEAP32[$87 >> 2] = (HEAP32[$87 >> 2] | 0) + $70;
 $step_to_0 = $94;
 while (1) {
  if (($step_to_0 | 0) == ($95 | 0)) {
   break;
  }
  if (__ZN10ime_pinyin12MatrixSearch8add_charEc($this, HEAP8[$this + 32 + $step_to_0 | 0] | 0) | 0) {
   $step_to_0 = $step_to_0 + 1 | 0;
  } else {
   label = 1443;
   break;
  }
 }
 if ((label | 0) == 1443) {
  ___assert_func(1184, 871, 6760, 3432);
  return 0;
 }
 do {
  if ((HEAP32[$87 >> 2] | 0) >>> 0 < (HEAP32[$this + 732 >> 2] | 0) >>> 0) {
   __ZN10ime_pinyin12MatrixSearch18prepare_candidatesEv($this);
  } else {
   HEAP32[$this + 12500 >> 2] = 0;
   if ((HEAP32[$this + 16 >> 2] | 0) == 0) {
    break;
   }
   __ZN10ime_pinyin12MatrixSearch25try_add_cand0_to_userdictEv($this) | 0;
  }
 } while (0);
 $_0 = __ZN10ime_pinyin12MatrixSearch17get_candidate_numEv($this) | 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch14extend_mtrx_ndEPNS_10MatrixNodeEPNS_10LmaPsbItemEjtj($this, $mtrx_nd, $lpi_items, $lpi_num, $dmi_fr, $res_row) {
 $this = $this | 0;
 $mtrx_nd = $mtrx_nd | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_num = $lpi_num | 0;
 $dmi_fr = $dmi_fr | 0;
 $res_row = $res_row | 0;
 var $4 = 0, $_040 = 0, $16 = 0, $20 = 0, $21 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $pos_044 = 0, $29 = 0, $34 = 0.0, $45 = 0, $46 = 0, $_sum = 0, $47 = 0, $replace_0_off042 = 0, $mtrx_nd_res_041 = 0, $49 = 0, $59 = 0, $60 = 0, $mtrx_nd_res_0_lcssa52 = 0, $mtrx_nd_res_0_lcssa50 = 0, $79 = 0, $80 = 0, $_0 = 0, label = 0;
 if (($mtrx_nd | 0) == 0) {
  ___assert_func(1184, 1543, 7112, 2392);
  return 0;
 }
 $4 = $this + 96 | 0;
 HEAP32[(HEAP32[$4 >> 2] | 0) + ($res_row * 12 | 0) + 8 >> 2] = 0;
 if ((HEAPU16[$this + 84 >> 1] | 0) > 194) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_040 = (HEAP16[$mtrx_nd + 14 >> 1] | 0) == 0 & $lpi_num >>> 0 > 5 ? 5 : $lpi_num;
 $16 = HEAP32[$this + 80 >> 2] | 0;
 $20 = HEAPU16[(HEAP32[$4 >> 2] | 0) + ($res_row * 12 | 0) >> 1] | 0;
 $21 = $16 + ($20 << 4) | 0;
 L1848 : do {
  if (($_040 | 0) != 0) {
   $23 = $mtrx_nd + 4 | 0;
   $24 = $res_row & 65535;
   $25 = $21;
   $26 = $16 + ($20 << 4) + 4 | 0;
   $pos_044 = 0;
   do {
    $29 = $lpi_items + ($pos_044 << 3) | 0;
    $34 = +HEAPF32[$23 >> 2] + +(HEAPU16[$lpi_items + ($pos_044 << 3) + 4 >> 1] | 0);
    if (($pos_044 | 0) != 0) {
     if ($34 + -8.0e3 > +HEAPF32[$26 >> 2]) {
      break L1848;
     }
    }
    $45 = HEAP16[(HEAP32[$4 >> 2] | 0) + ($res_row * 12 | 0) + 4 >> 1] | 0;
    $46 = $45 & 65535;
    $_sum = $46 + $20 | 0;
    $47 = $16 + ($_sum << 4) | 0;
    L1855 : do {
     if (($_sum | 0) > ($20 | 0)) {
      $mtrx_nd_res_041 = $47;
      $replace_0_off042 = 0;
      while (1) {
       $49 = $mtrx_nd_res_041 - 16 | 0;
       if ($34 >= +HEAPF32[$mtrx_nd_res_041 - 16 + 4 >> 2]) {
        break;
       }
       if ($mtrx_nd_res_041 - $25 >> 4 >>> 0 < 5) {
        $59 = $mtrx_nd_res_041;
        $60 = $49;
        HEAP32[$59 >> 2] = HEAP32[$60 >> 2];
        HEAP32[$59 + 4 >> 2] = HEAP32[$60 + 4 >> 2];
        HEAP32[$59 + 8 >> 2] = HEAP32[$60 + 8 >> 2];
        HEAP32[$59 + 12 >> 2] = HEAP32[$60 + 12 >> 2];
       }
       if ($49 >>> 0 > $21 >>> 0) {
        $mtrx_nd_res_041 = $49;
        $replace_0_off042 = 1;
       } else {
        $mtrx_nd_res_0_lcssa50 = $49;
        label = 1469;
        break L1855;
       }
      }
      if ($replace_0_off042) {
       $mtrx_nd_res_0_lcssa50 = $mtrx_nd_res_041;
       label = 1469;
      } else {
       $mtrx_nd_res_0_lcssa52 = $mtrx_nd_res_041;
       label = 1467;
      }
     } else {
      $mtrx_nd_res_0_lcssa52 = $47;
      label = 1467;
     }
    } while (0);
    do {
     if ((label | 0) == 1467) {
      label = 0;
      if (($45 & 65535) >= 5) {
       break;
      }
      if (((HEAPU16[(HEAP32[$4 >> 2] | 0) + ($res_row * 12 | 0) >> 1] | 0) + $46 | 0) >>> 0 < 200) {
       $mtrx_nd_res_0_lcssa50 = $mtrx_nd_res_0_lcssa52;
       label = 1469;
      }
     }
    } while (0);
    do {
     if ((label | 0) == 1469) {
      label = 0;
      HEAP32[$mtrx_nd_res_0_lcssa50 >> 2] = HEAP32[$29 >> 2] & 16777215;
      HEAPF32[$mtrx_nd_res_0_lcssa50 + 4 >> 2] = $34;
      HEAP32[$mtrx_nd_res_0_lcssa50 + 8 >> 2] = $mtrx_nd;
      HEAP16[$mtrx_nd_res_0_lcssa50 + 12 >> 1] = $dmi_fr;
      HEAP16[$mtrx_nd_res_0_lcssa50 + 14 >> 1] = $24;
      $79 = (HEAP32[$4 >> 2] | 0) + ($res_row * 12 | 0) + 4 | 0;
      $80 = HEAP16[$79 >> 1] | 0;
      if (($80 & 65535) >= 5) {
       break;
      }
      HEAP16[$79 >> 1] = $80 + 1 & 65535;
     }
    } while (0);
    $pos_044 = $pos_044 + 1 | 0;
   } while ($pos_044 >>> 0 < $_040 >>> 0);
  }
 } while (0);
 $_0 = HEAPU16[(HEAP32[$4 >> 2] | 0) + ($res_row * 12 | 0) + 4 >> 1] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch18cancel_last_choiceEv($this) {
 $this = $this | 0;
 var $10 = 0, $11 = 0, $20 = 0, $27 = 0, $28 = 0, $storemerge = 0, $step_start_0 = 0, $45 = 0, $_0 = 0, label = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 72 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $10 = $this + 896 | 0;
 $11 = HEAP32[$10 >> 2] | 0;
 do {
  if (($11 | 0) != 0) {
   $20 = HEAP32[(HEAP32[$this + 96 >> 2] | 0) + ((HEAPU16[$this + 736 + ($11 << 1) >> 1] | 0) * 12 | 0) + 8 >> 2] | 0;
   if (($20 | 0) == 0) {
    ___assert_func(1184, 895, 6888, 3280);
    return 0;
   }
   $27 = HEAP16[(HEAP32[$20 + 8 >> 2] | 0) + 14 >> 1] | 0;
   $28 = $27 & 65535;
   if ($27 << 16 >> 16 == 0) {
    $storemerge = 0;
   } else {
    $storemerge = $11 - (HEAP8[(HEAP32[$this + 88 >> 2] | 0) + ((HEAPU16[$20 + 12 >> 1] | 0) * 12 | 0) + 8 | 0] & 127) | 0;
   }
   HEAP32[$10 >> 2] = $storemerge;
   __ZN10ime_pinyin12MatrixSearch12reset_searchEjbbb($this, $28, 0, 0, 0) | 0;
   $step_start_0 = $28;
   while (1) {
    $45 = HEAP8[$this + 32 + $step_start_0 | 0] | 0;
    if ($45 << 24 >> 24 == 0) {
     label = 1487;
     break;
    }
    if (__ZN10ime_pinyin12MatrixSearch8add_charEc($this, $45) | 0) {
     $step_start_0 = $step_start_0 + 1 | 0;
    } else {
     label = 1486;
     break;
    }
   }
   if ((label | 0) == 1487) {
    __ZN10ime_pinyin12MatrixSearch18prepare_candidatesEv($this);
    break;
   } else if ((label | 0) == 1486) {
    ___assert_func(1184, 910, 6888, 3432);
    return 0;
   }
  }
 } while (0);
 $_0 = __ZN10ime_pinyin12MatrixSearch17get_candidate_numEv($this) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch15add_char_qwertyEv($this) {
 $this = $this | 0;
 var $is_pre = 0, $1 = 0, $3 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $26 = 0, $spl_matched_0_off096 = 0, $longest_ext_095 = 0, $ext_len_092 = 0, $27 = 0, $49 = 0, $50 = 0, $51 = 0, $56 = 0, $70 = 0, $spl_matched_0_off0_ = 0, $76 = 0, $77 = 0, $79 = 0, $80 = 0, $87 = 0, $90 = 0, $92 = 0, $93 = 0, $dmi_pos_085 = 0, $longest_ext_184 = 0, $94 = 0, $95 = 0, $98 = 0, $dmi_0 = 0, $143 = 0, $144 = 0, $146 = 0, $148 = 0, $152 = 0, $d_073 = 0, $prev_ids_num_072 = 0, $158 = 0, $163 = 0, $168 = 0, $prev_ids_num_1 = 0, $179 = 0, $180 = 0, $181 = 0, $200 = 0, $210 = 0, $221 = 0, $228 = 0, $229 = 0, $246 = 0, $257 = 0, $fr_row_0 = 0, $264 = 0, $265 = 0, $267 = 0, $268 = 0, $275 = 0, $mtrx_nd_pos_076 = 0, $longest_ext_275 = 0, $ext_len_0_longest_ext_2 = 0, $286 = 0, $287 = 0, $288 = 0, $longest_ext_4 = 0, $297 = 0, $298 = 0, $299 = 0, $308 = 0, $longest_ext_5 = 0, $spl_matched_2_off0 = 0, $311 = 0, $spl_matched_0_off0_lcssa = 0, $319 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $is_pre = sp | 0;
 $1 = $this + 72 | 0;
 $3 = $this + 96 | 0;
 HEAP16[(HEAP32[$3 >> 2] | 0) + ((HEAP32[$1 >> 2] | 0) * 12 | 0) + 4 >> 1] = 0;
 $6 = $this + 896 | 0;
 $7 = $this + 728 | 0;
 $8 = $this + 20 | 0;
 $9 = $this + 88 | 0;
 $10 = $this + 100 | 0;
 $11 = $this + 4 | 0;
 $12 = $this + 100 | 0;
 $13 = $this + 4 | 0;
 $14 = $this + 12500 | 0;
 $15 = $this + 80 | 0;
 $16 = $this + 900 | 0;
 $17 = $this + 92 | 0;
 $18 = $this + 728 | 0;
 $19 = $this + 92 | 0;
 $20 = $this + 92 | 0;
 $21 = $this + 728 | 0;
 $22 = $this + 100 | 0;
 $23 = $this + 728 | 0;
 $24 = $this + 8 | 0;
 $ext_len_092 = 7;
 $longest_ext_095 = 0;
 $spl_matched_0_off096 = 0;
 $26 = 7;
 L1896 : while (1) {
  $27 = HEAP32[$1 >> 2] | 0;
  L1898 : do {
   if ($26 >>> 0 > ($27 - (HEAPU16[$this + 736 + (HEAP32[$6 >> 2] << 1) >> 1] | 0) | 0) >>> 0) {
    $spl_matched_2_off0 = $spl_matched_0_off096;
    $longest_ext_5 = $longest_ext_095;
   } else {
    do {
     if (!(($ext_len_092 & 65535) < 2 | $longest_ext_095 << 16 >> 16 == 0)) {
      if ((HEAP16[(HEAP32[$3 >> 2] | 0) + (($27 - $26 | 0) * 12 | 0) + 6 >> 1] | 0) <= -1) {
       break;
      }
      if ((HEAP8[$24] & 1) == 0) {
       $spl_matched_0_off0_lcssa = $spl_matched_0_off096;
       label = 1541;
       break L1896;
      } else {
       $spl_matched_2_off0 = $spl_matched_0_off096;
       $longest_ext_5 = $longest_ext_095;
       break L1898;
      }
     }
    } while (0);
    $49 = HEAP32[$1 >> 2] | 0;
    $50 = $49 - $26 | 0;
    $51 = $50 & 65535;
    $56 = $50 & 65535;
    if ((HEAPU16[$this + 736 + (HEAP32[$6 >> 2] << 1) >> 1] | 0) >>> 0 > $56 >>> 0) {
     $spl_matched_2_off0 = $spl_matched_0_off096;
     $longest_ext_5 = $longest_ext_095;
     break;
    }
    if ((HEAP16[(HEAP32[$3 >> 2] | 0) + ($56 * 12 | 0) + 4 >> 1] | 0) == 0) {
     if ((HEAP8[$7] & 1) == 0) {
      $spl_matched_2_off0 = $spl_matched_0_off096;
      $longest_ext_5 = $longest_ext_095;
      break;
     }
    }
    HEAP8[$is_pre] = 0;
    $70 = __ZN10ime_pinyin14SpellingParser16get_splid_by_strEPKctPb(HEAP32[$8 >> 2] | 0, $this + 32 + $56 | 0, $ext_len_092, $is_pre) | 0;
    $spl_matched_0_off0_ = $spl_matched_0_off096 | (HEAP8[$is_pre] & 1) != 0;
    if ($70 << 16 >> 16 == 0) {
     $spl_matched_2_off0 = $spl_matched_0_off0_;
     $longest_ext_5 = $longest_ext_095;
     break;
    }
    $76 = __ZN10ime_pinyin12MatrixSearch11is_split_atEt($this, $49 & 65535) | 0;
    $77 = HEAP32[$3 >> 2] | 0;
    $79 = HEAP16[$77 + ($56 * 12 | 0) + 2 >> 1] | 0;
    $80 = $79 & 65535;
    $87 = (HEAP16[$77 + ($56 * 12 | 0) + 6 >> 1] & 32767) + ($79 & 65535) | 0;
    if (($80 | 0) >= ($87 + 1 | 0)) {
     $spl_matched_2_off0 = $spl_matched_0_off0_;
     $longest_ext_5 = $longest_ext_095;
     break;
    }
    $90 = $76 & 1;
    $longest_ext_184 = $longest_ext_095;
    $dmi_pos_085 = $79;
    $93 = $80;
    $92 = $87;
    while (1) {
     $94 = HEAP32[$9 >> 2] | 0;
     $95 = $94 + ($93 * 12 | 0) | 0;
     do {
      if (($93 | 0) == ($92 | 0)) {
       $dmi_0 = 0;
       label = 1509;
      } else {
       $98 = HEAP32[$6 >> 2] | 0;
       if (($98 | 0) != 0) {
        if (((HEAP32[$1 >> 2] | 0) - $26 - ((HEAPU8[$94 + ($93 * 12 | 0) + 9 | 0] | 0) >>> 1 & 255) | 0) >>> 0 < (HEAPU16[$this + 736 + ($98 << 1) >> 1] | 0) >>> 0) {
         $longest_ext_4 = $longest_ext_184;
         break;
        }
       }
       if ((HEAP8[$94 + ($93 * 12 | 0) + 8 | 0] | 0) >= 0) {
        $dmi_0 = $95;
        label = 1509;
        break;
       }
       if ((HEAP8[$23] & 1) == 0) {
        $longest_ext_4 = $longest_ext_184;
       } else {
        $dmi_0 = $95;
        label = 1509;
       }
      }
     } while (0);
     L1918 : do {
      if ((label | 0) == 1509) {
       label = 0;
       do {
        if (($longest_ext_184 & 65535) > ($ext_len_092 & 65535)) {
         if (($dmi_0 | 0) == 0) {
          if ((HEAP16[(HEAP32[$3 >> 2] | 0) + ($56 * 12 | 0) + 6 >> 1] | 0) > -1) {
           $longest_ext_4 = $longest_ext_184;
           break L1918;
          }
          HEAP16[(HEAP32[$10 >> 2] | 0) + 80 >> 1] = 0;
          $180 = $10;
          $179 = 1;
          break;
         } else {
          if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$11 >> 2] | 0, HEAP16[$dmi_0 + 6 >> 1] | 0) | 0) {
           $longest_ext_4 = $longest_ext_184;
           break L1918;
          }
          HEAP16[(HEAP32[$12 >> 2] | 0) + 80 >> 1] = 0;
          $143 = $12;
          label = 1516;
          break;
         }
        } else {
         HEAP16[(HEAP32[$22 >> 2] | 0) + 80 >> 1] = 0;
         if (($dmi_0 | 0) == 0) {
          $180 = $22;
          $179 = 1;
         } else {
          $143 = $22;
          label = 1516;
         }
        }
       } while (0);
       if ((label | 0) == 1516) {
        label = 0;
        $144 = $dmi_0 + 8 | 0;
        $146 = HEAP8[$144] & 127;
        $148 = HEAP8[$21] & 1;
        if ($148 << 24 >> 24 == 0 & ($146 & 255) > 7) {
         $longest_ext_4 = $longest_ext_184;
         break;
        }
        $152 = $146 & 255;
        if ($148 << 24 >> 24 != 0 & ($146 & 255) > 39) {
         $longest_ext_4 = $longest_ext_184;
         break;
        }
        L1932 : do {
         if (($dmi_0 | 0) == 0) {
          $prev_ids_num_1 = $152;
         } else {
          $prev_ids_num_072 = $152;
          $d_073 = $dmi_0;
          while (1) {
           $158 = $prev_ids_num_072 - 1 & 65535;
           HEAP16[(HEAP32[$143 >> 2] | 0) + (($158 & 65535) << 1) >> 1] = HEAP16[$d_073 + 6 >> 1] | 0;
           $163 = HEAP16[$d_073 + 4 >> 1] | 0;
           if ($163 << 16 >> 16 == -1) {
            $prev_ids_num_1 = $158;
            break L1932;
           }
           $168 = (HEAP32[$9 >> 2] | 0) + (($163 & 65535) * 12 | 0) | 0;
           if (($168 | 0) == 0) {
            $prev_ids_num_1 = $158;
            break;
           } else {
            $prev_ids_num_072 = $158;
            $d_073 = $168;
           }
          }
         }
        } while (0);
        if ($prev_ids_num_1 << 16 >> 16 != 0) {
         label = 1522;
         break L1896;
        }
        HEAP16[(HEAP32[$143 >> 2] | 0) + 80 >> 1] = HEAP8[$144] & 127;
        $180 = $143;
        $179 = 0;
       }
       $181 = HEAP32[$180 >> 2] | 0;
       HEAP16[$181 + (HEAPU16[$181 + 80 >> 1] << 1) >> 1] = $70;
       HEAP16[(HEAP32[$180 >> 2] | 0) + 82 >> 1] = $ext_len_092;
       HEAP8[(HEAP32[$180 >> 2] | 0) + 86 | 0] = $90;
       HEAP16[(HEAP32[$180 >> 2] | 0) + 90 >> 1] = 1;
       HEAP16[(HEAP32[$180 >> 2] | 0) + 88 >> 1] = $70;
       if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$13 >> 2] | 0, $70) | 0) {
        $200 = __ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt(HEAP32[$13 >> 2] | 0, $70, (HEAP32[$180 >> 2] | 0) + 88 | 0) | 0;
        HEAP16[(HEAP32[$180 >> 2] | 0) + 90 >> 1] = $200;
        if ((HEAP16[(HEAP32[$180 >> 2] | 0) + 90 >> 1] | 0) == 0) {
         label = 1526;
         break L1896;
        }
       }
       $210 = __ZN10ime_pinyin12MatrixSearch10extend_dmiEPNS_11DictExtParaEPNS_13DictMatchInfoE($this, HEAP32[$180 >> 2] | 0, $dmi_0) | 0;
       do {
        if (($210 & 65535 | 0) != 0) {
         if ((HEAP8[$18] & 1) != 0) {
          $221 = (HEAP32[$9 >> 2] | 0) + ((HEAPU16[$20 >> 1] | 0) * 12 | 0) + 8 | 0;
          HEAP8[$221] = HEAP8[$221] | -128;
         }
         $228 = (HEAP32[$3 >> 2] | 0) + ((HEAP32[$1 >> 2] | 0) * 12 | 0) + 6 | 0;
         $229 = HEAP16[$228 >> 1] | 0;
         HEAP16[$228 >> 1] = ($229 & 65535) + $210 & 32767 | $229 & -32768;
         HEAP16[$19 >> 1] = (HEAPU16[$19 >> 1] | 0) + $210 & 65535;
         if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$13 >> 2] | 0, $70) | 0) {
          break;
         }
         $246 = (HEAP32[$3 >> 2] | 0) + ((HEAP32[$1 >> 2] | 0) * 12 | 0) + 6 | 0;
         HEAP16[$246 >> 1] = HEAP16[$246 >> 1] | -32768;
        }
       } while (0);
       if ((HEAP32[$14 >> 2] | 0) == 0) {
        $longest_ext_4 = $longest_ext_184;
        break;
       }
       if ($179) {
        $fr_row_0 = $51;
       } else {
        $257 = (HEAPU8[$dmi_0 + 9 | 0] | 0) >>> 1 & 255;
        if ($56 >>> 0 < $257 >>> 0) {
         label = 1535;
         break L1896;
        }
        $fr_row_0 = $50 - $257 & 65535;
       }
       $264 = $fr_row_0 & 65535;
       $265 = HEAP32[$3 >> 2] | 0;
       $267 = HEAP16[$265 + ($264 * 12 | 0) >> 1] | 0;
       $268 = $267 & 65535;
       if (($268 | 0) < ((HEAPU16[$265 + ($264 * 12 | 0) + 4 >> 1] | 0) + ($267 & 65535) | 0)) {
        $longest_ext_275 = $longest_ext_184;
        $mtrx_nd_pos_076 = $267;
        $275 = $268;
       } else {
        $longest_ext_4 = $longest_ext_184;
        break;
       }
       while (1) {
        __ZN10ime_pinyin12MatrixSearch14extend_mtrx_ndEPNS_10MatrixNodeEPNS_10LmaPsbItemEjtj($this, (HEAP32[$15 >> 2] | 0) + ($275 << 4) | 0, $16, HEAP32[$14 >> 2] | 0, (HEAPU16[$17 >> 1] | 0) - $210 & 65535, HEAP32[$1 >> 2] | 0) | 0;
        $ext_len_0_longest_ext_2 = $longest_ext_275 << 16 >> 16 == 0 ? $ext_len_092 : $longest_ext_275;
        $286 = $mtrx_nd_pos_076 + 1 & 65535;
        $287 = $286 & 65535;
        $288 = HEAP32[$3 >> 2] | 0;
        if (($287 | 0) < ((HEAPU16[$288 + ($264 * 12 | 0) + 4 >> 1] | 0) + (HEAPU16[$288 + ($264 * 12 | 0) >> 1] | 0) | 0)) {
         $longest_ext_275 = $ext_len_0_longest_ext_2;
         $mtrx_nd_pos_076 = $286;
         $275 = $287;
        } else {
         $longest_ext_4 = $ext_len_0_longest_ext_2;
         break;
        }
       }
      }
     } while (0);
     $297 = $dmi_pos_085 + 1 & 65535;
     $298 = $297 & 65535;
     $299 = HEAP32[$3 >> 2] | 0;
     $308 = (HEAP16[$299 + ($56 * 12 | 0) + 6 >> 1] & 32767) + (HEAPU16[$299 + ($56 * 12 | 0) + 2 >> 1] | 0) | 0;
     if (($298 | 0) < ($308 + 1 | 0)) {
      $longest_ext_184 = $longest_ext_4;
      $dmi_pos_085 = $297;
      $93 = $298;
      $92 = $308;
     } else {
      $spl_matched_2_off0 = $spl_matched_0_off0_;
      $longest_ext_5 = $longest_ext_4;
      break;
     }
    }
   }
  } while (0);
  $311 = $ext_len_092 - 1 & 65535;
  if ($311 << 16 >> 16 == 0) {
   $spl_matched_0_off0_lcssa = $spl_matched_2_off0;
   label = 1541;
   break;
  } else {
   $ext_len_092 = $311;
   $longest_ext_095 = $longest_ext_5;
   $spl_matched_0_off096 = $spl_matched_2_off0;
   $26 = $311 & 65535;
  }
 }
 if ((label | 0) == 1522) {
  ___assert_func(1184, 1070, 7056, 3176);
  return 0;
 } else if ((label | 0) == 1535) {
  ___assert_func(1184, 1106, 7056, 3056);
  return 0;
 } else if ((label | 0) == 1541) {
  $319 = $this + 84 | 0;
  HEAP16[$319 >> 1] = (HEAP16[$319 >> 1] | 0) + (HEAP16[(HEAP32[$3 >> 2] | 0) + ((HEAP32[$1 >> 2] | 0) * 12 | 0) + 4 >> 1] | 0) & 65535;
  if ((HEAP8[$this + 728 | 0] & 1) != 0) {
   $_0 = 1;
   STACKTOP = sp;
   return $_0 | 0;
  }
  $_0 = $spl_matched_0_off0_lcssa | (HEAP16[(HEAP32[$3 >> 2] | 0) + ((HEAP32[$1 >> 2] | 0) * 12 | 0) + 4 >> 1] | 0) != 0;
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 1526) {
  ___assert_func(1184, 1082, 7056, 3088);
  return 0;
 }
 return 0;
}
function __ZN10ime_pinyin12MatrixSearch10extend_dmiEPNS_11DictExtParaEPNS_13DictMatchInfoE($this, $dep, $dmi_s) {
 $this = $this | 0;
 $dep = $dep | 0;
 $dmi_s = $dmi_s | 0;
 var $lpi_num = 0, $handles = 0, $1 = 0, $12 = 0, $13 = 0, $14 = 0, $17 = 0, $cached_0_off0 = 0, $22 = 0, $from_h_sroa_1_0 = 0, $from_h_sroa_0_0 = 0, $31 = 0, $32 = 0, $34 = 0, $37 = 0, $43 = 0, $48 = 0, $57 = 0, $60 = 0, $73 = 0, $78 = 0, $79 = 0, $84 = 0, $87 = 0, $102 = 0, $106 = 0, $113 = 0, $_off0 = 0, $ret_val_0 = 0, $124 = 0, $127 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $lpi_num = sp | 0;
 $handles = sp + 8 | 0;
 $1 = $this + 92 | 0;
 if ((HEAPU16[$1 >> 1] | 0) > 799) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if ((HEAP8[$this + 728 | 0] & 1) != 0) {
  $_0 = __ZN10ime_pinyin12MatrixSearch12extend_dmi_cEPNS_11DictExtParaEPNS_13DictMatchInfoE($this, $dep, $dmi_s) | 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $12 = __ZN10ime_pinyin8LpiCache12get_instanceEv() | 0;
 $13 = $dep + 80 | 0;
 $14 = HEAP16[$13 >> 1] | 0;
 $17 = HEAP16[$dep + (($14 & 65535) << 1) >> 1] | 0;
 if ($14 << 16 >> 16 == 0) {
  $cached_0_off0 = __ZN10ime_pinyin8LpiCache9is_cachedEt($12, $17) | 0;
 } else {
  $cached_0_off0 = 0;
 }
 $22 = $this + 12500 | 0;
 HEAP32[$22 >> 2] = 0;
 if ((HEAP16[$13 >> 1] | 0) == 0) {
  $from_h_sroa_0_0 = 0;
  $from_h_sroa_1_0 = 0;
 } else {
  $from_h_sroa_0_0 = HEAP16[$dmi_s >> 1] | 0;
  $from_h_sroa_1_0 = HEAP16[$dmi_s + 2 >> 1] | 0;
 }
 HEAP32[$lpi_num >> 2] = 0;
 $31 = $handles + 2 | 0;
 HEAP16[$31 >> 1] = 0;
 $32 = $handles | 0;
 HEAP16[$32 >> 1] = 0;
 $34 = ($dmi_s | 0) == 0;
 do {
  if ($from_h_sroa_0_0 << 16 >> 16 != 0 | $34) {
   $37 = HEAP32[$this + 12 >> 2] | 0;
   $43 = FUNCTION_TABLE_iiiiiii[HEAP32[(HEAP32[$37 >> 2] | 0) + 24 >> 2] & 15]($37, $from_h_sroa_0_0, $dep, $this + 900 | 0, 1450, $lpi_num) | 0;
   HEAP16[$32 >> 1] = $43;
   if ($43 << 16 >> 16 == 0) {
    break;
   }
   HEAP32[$22 >> 2] = HEAP32[$lpi_num >> 2];
  }
 } while (0);
 $48 = HEAP32[$this + 16 >> 2] | 0;
 do {
  if (($48 | 0) != 0) {
   if (!($from_h_sroa_1_0 << 16 >> 16 != 0 | $34)) {
    break;
   }
   $57 = HEAP32[$22 >> 2] | 0;
   $60 = FUNCTION_TABLE_iiiiiii[HEAP32[(HEAP32[$48 >> 2] | 0) + 24 >> 2] & 15]($48, $from_h_sroa_1_0, $dep, $this + 900 + ($57 << 3) | 0, 1450 - $57 | 0, $lpi_num) | 0;
   HEAP16[$31 >> 1] = $60;
   if ($60 << 16 >> 16 == 0) {
    break;
   }
   HEAP32[$22 >> 2] = (HEAP32[$22 >> 2] | 0) + (HEAP32[$lpi_num >> 2] | 0);
  }
 } while (0);
 if ((HEAP16[$32 >> 1] | 0) == 0) {
  if ((HEAP16[$31 >> 1] | 0) == 0) {
   $ret_val_0 = 0;
  } else {
   label = 1562;
  }
 } else {
  label = 1562;
 }
 do {
  if ((label | 0) == 1562) {
   $73 = HEAP16[$1 >> 1] | 0;
   if (($73 & 65535) > 799) {
    $_0 = 0;
    STACKTOP = sp;
    return $_0 | 0;
   }
   $78 = HEAP32[$this + 88 >> 2] | 0;
   $79 = $78 + (($73 & 65535) * 12 | 0) | 0;
   if ($34) {
    $84 = (HEAP8[$dep + 86 | 0] & 1) != 0;
    $87 = HEAP16[$dep + 82 >> 1] & 255;
    __ZN10ime_pinyin12MatrixSearch8fill_dmiEPNS_13DictMatchInfoEPtttthbhh(0, $79, $32, -1, $17, 0, 1, $84, $87, (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$this + 4 >> 2] | 0, $17) | 0) & 1 ^ 1);
    $ret_val_0 = 1;
    break;
   }
   $102 = (HEAP8[$dmi_s + 8 | 0] & 127) + 1 & 255;
   $106 = (HEAP8[$dep + 86 | 0] & 1) != 0;
   $113 = (HEAP16[$dep + 82 >> 1] & 255) + ((HEAPU8[$dmi_s + 9 | 0] | 0) >>> 1) & 255;
   if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$this + 4 >> 2] | 0, $17) | 0) {
    $_off0 = 0;
   } else {
    $_off0 = HEAP8[$dmi_s + 10 | 0] & 1;
   }
   __ZN10ime_pinyin12MatrixSearch8fill_dmiEPNS_13DictMatchInfoEPtttthbhh(0, $79, $32, (($dmi_s - $78 | 0) / 12 | 0) & 65535, $17, 0, $102, $106, $113, $_off0);
   $ret_val_0 = 1;
  }
 } while (0);
 if ($cached_0_off0) {
  if (!(__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$this + 4 >> 2] | 0, $17) | 0)) {
   ___assert_func(1184, 1499, 7376, 2520);
   return 0;
  }
  HEAP32[$22 >> 2] = __ZN10ime_pinyin8LpiCache9get_cacheEtPNS_10LmaPsbItemEj($12, $17, $this + 900 | 0, 1450) | 0;
  $_0 = $ret_val_0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $124 = HEAP32[$22 >> 2] | 0;
 if (($124 | 0) == 0) {
  $_0 = $ret_val_0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $127 = $this + 900 | 0;
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($127 | 0, $124, 8, 30);
 if (!$34) {
  $_0 = $ret_val_0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if (!(__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$this + 4 >> 2] | 0, $17) | 0)) {
  $_0 = $ret_val_0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 HEAP32[$22 >> 2] = __ZN10ime_pinyin8LpiCache9put_cacheEtPNS_10LmaPsbItemEj($12, $17, $127, HEAP32[$22 >> 2] | 0) | 0;
 $_0 = $ret_val_0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin11comp_doubleEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $2 = 0.0, $4 = 0.0, $_0 = 0;
 $2 = +HEAPF64[$p1 >> 3];
 $4 = +HEAPF64[$p2 >> 3];
 if ($2 < $4) {
  $_0 = -1;
  return $_0 | 0;
 }
 $_0 = $2 > $4 | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch9get_pystrEPj($this, $decoded_len) {
 $this = $this | 0;
 $decoded_len = $decoded_len | 0;
 var $_0 = 0;
 if ((HEAP8[$this | 0] & 1) == 0 | ($decoded_len | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP32[$decoded_len >> 2] = HEAP32[$this + 72 >> 2];
 $_0 = $this + 32 | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch13get_spl_startERPKt($this, $spl_start) {
 $this = $this | 0;
 $spl_start = $spl_start | 0;
 __ZN10ime_pinyin12MatrixSearch16get_spl_start_idEv($this);
 HEAP32[$spl_start >> 2] = $this + 736;
 return HEAP32[$this + 732 >> 2] | 0;
}
function __ZN10ime_pinyin12MatrixSearch13inner_predictEPKttPA8_tj($this, $fixed_buf, $fixed_len, $predict_buf, $buf_len) {
 $this = $this | 0;
 $fixed_buf = $fixed_buf | 0;
 $fixed_len = $fixed_len | 0;
 $predict_buf = $predict_buf | 0;
 $buf_len = $buf_len | 0;
 var $1 = 0, $4 = 0, $7 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $len_055 = 0, $res_total_054 = 0, $16 = 0, $nlen_0 = 0, $nearest_n_word_0_off0 = 0, $res_total_1 = 0, $35 = 0, $36 = 0, $41 = 0, $42 = 0, $45 = 0, $46 = 0, $_sum50 = 0, $res_this_0 = 0, $59 = 0, $60 = 0, $res_total_0_lcssa = 0, $63 = 0, $buf_len_ = 0, $i_053 = 0;
 $1 = $this + 104 | 0;
 $4 = $this + 108 | 0;
 _memset(HEAP32[$1 >> 2] | 0, 0, (HEAP32[$4 >> 2] | 0) * 20 | 0 | 0);
 $7 = $fixed_len & 65535;
 if ($fixed_len << 16 >> 16 == 0) {
  $res_total_0_lcssa = 0;
 } else {
  $9 = ($fixed_len & 65535) > 1;
  $10 = $this + 12 | 0;
  $11 = $this + 16 | 0;
  $12 = $this + 12 | 0;
  $13 = $this + 12 | 0;
  $res_total_054 = 0;
  $len_055 = $7;
  while (1) {
   $16 = (HEAP32[$4 >> 2] | 0) - $res_total_054 | 0;
   if ($9 & ($len_055 | 0) == 1 & ($res_total_054 | 0) == 0) {
    $nlen_0 = 2;
    while (1) {
     if ($nlen_0 >>> 0 > $7 >>> 0) {
      $nearest_n_word_0_off0 = 0;
      break;
     }
     if ((__ZN10ime_pinyin8DictTrie12get_lemma_idEPKtt(HEAP32[$12 >> 2] | 0, $fixed_buf + ($7 - $nlen_0 << 1) | 0, $nlen_0 & 65535) | 0) == 0) {
      $nlen_0 = $nlen_0 + 1 | 0;
     } else {
      $nearest_n_word_0_off0 = $len_055;
      break;
     }
    }
    $res_total_1 = (__ZN10ime_pinyin8DictTrie16predict_top_lmasEjPNS_12NPredictItemEjj(HEAP32[$13 >> 2] | 0, $nearest_n_word_0_off0, (HEAP32[$1 >> 2] | 0) + ($res_total_054 * 20 | 0) | 0, $16, $res_total_054) | 0) + $res_total_054 | 0;
   } else {
    $res_total_1 = $res_total_054;
   }
   $35 = (HEAP32[$4 >> 2] | 0) - $res_total_1 | 0;
   $36 = HEAP32[$10 >> 2] | 0;
   $41 = $fixed_buf + ($7 - $len_055 << 1) | 0;
   $42 = $len_055 & 65535;
   $45 = FUNCTION_TABLE_iiiiiii[HEAP32[(HEAP32[$36 >> 2] | 0) + 40 >> 2] & 15]($36, $41, $42, (HEAP32[$1 >> 2] | 0) + ($res_total_1 * 20 | 0) | 0, $35, $res_total_1) | 0;
   $46 = HEAP32[$11 >> 2] | 0;
   if (($46 | 0) == 0) {
    $res_this_0 = $45;
   } else {
    $_sum50 = $45 + $res_total_1 | 0;
    $res_this_0 = (FUNCTION_TABLE_iiiiiii[HEAP32[(HEAP32[$46 >> 2] | 0) + 40 >> 2] & 15]($46, $41, $42, (HEAP32[$1 >> 2] | 0) + ($_sum50 * 20 | 0) | 0, $35 - $45 | 0, $_sum50) | 0) + $45 | 0;
   }
   $59 = $res_this_0 + $res_total_1 | 0;
   $60 = $len_055 - 1 | 0;
   if (($60 | 0) == 0) {
    $res_total_0_lcssa = $59;
    break;
   } else {
    $res_total_054 = $59;
    $len_055 = $60;
   }
  }
 }
 $63 = __ZN10ime_pinyin21remove_duplicate_npreEPNS_12NPredictItemEj(HEAP32[$1 >> 2] | 0, $res_total_0_lcssa) | 0;
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E(HEAP32[$1 >> 2] | 0, $63, 20, 4);
 $buf_len_ = $63 >>> 0 > $buf_len >>> 0 ? $buf_len : $63;
 if (($buf_len_ | 0) == 0) {
  return $buf_len_ | 0;
 } else {
  $i_053 = 0;
 }
 do {
  _utf16_strncpy($predict_buf + ($i_053 << 4) | 0, (HEAP32[$1 >> 2] | 0) + ($i_053 * 20 | 0) + 4 | 0, 7) | 0;
  HEAP16[$predict_buf + ($i_053 << 4) + 14 >> 1] = 0;
  $i_053 = $i_053 + 1 | 0;
 } while ($i_053 >>> 0 < $buf_len_ >>> 0);
 return $buf_len_ | 0;
}
function __ZN10ime_pinyin12MatrixSearch12get_predictsEPKtPA8_tj($this, $fixed_buf, $predict_buf, $buf_len) {
 $this = $this | 0;
 $fixed_buf = $fixed_buf | 0;
 $predict_buf = $predict_buf | 0;
 $buf_len = $buf_len | 0;
 var $1 = 0, $_0 = 0;
 $1 = _utf16_strlen($fixed_buf) | 0;
 if (($1 | 0) == 0 | $1 >>> 0 > 7 | ($buf_len | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12MatrixSearch13inner_predictEPKttPA8_tj($this, $fixed_buf, $1 & 65535, $predict_buf, $buf_len) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin15qsearch_nearestEPddii($code_book, $freq, $start, $end) {
 $code_book = $code_book | 0;
 $freq = +$freq;
 $start = $start | 0;
 $end = $end | 0;
 var $end_tr26 = 0, $start_tr25 = 0, $7 = 0.0, $13 = 0, $16 = 0, $start_tr_ = 0, $_end_tr = 0, $_0 = 0, label = 0;
 if (($start | 0) == ($end | 0)) {
  $_0 = $start;
  return $_0 | 0;
 } else {
  $start_tr25 = $start;
  $end_tr26 = $end;
 }
 while (1) {
  if (($start_tr25 + 1 | 0) == ($end_tr26 | 0)) {
   break;
  }
  $13 = ($end_tr26 + $start_tr25 | 0) / 2 | 0;
  $16 = +HEAPF64[$code_book + ($13 << 3) >> 3] > $freq;
  $start_tr_ = $16 ? $start_tr25 : $13;
  $_end_tr = $16 ? $13 : $end_tr26;
  if (($start_tr_ | 0) == ($_end_tr | 0)) {
   $_0 = $start_tr_;
   label = 1621;
   break;
  } else {
   $start_tr25 = $start_tr_;
   $end_tr26 = $_end_tr;
  }
 }
 if ((label | 0) == 1621) {
  return $_0 | 0;
 }
 $7 = +__ZN10ime_pinyin8distanceEdd($freq, +HEAPF64[$code_book + ($end_tr26 << 3) >> 3]);
 $_0 = $7 > +__ZN10ime_pinyin8distanceEdd($freq, +HEAPF64[$code_book + ($start_tr25 << 3) >> 3]) ? $start_tr25 : $end_tr26;
 return $_0 | 0;
}
function __ZN10ime_pinyin8distanceEdd($freq, $code) {
 $freq = +$freq;
 $code = +$code;
 var $1 = 0.0;
 $1 = +Math_log(+$freq);
 return +(+Math_abs(+($1 - +Math_log(+$code))) * $freq);
}
function __ZN10ime_pinyin15update_code_idxEPdjS0_Ph($freqs, $num, $code_book, $code_idx) {
 $freqs = $freqs | 0;
 $num = $num | 0;
 $code_book = $code_book | 0;
 $code_idx = $code_idx | 0;
 var $changed_012 = 0, $pos_011 = 0, $5 = 0, $6 = 0, $changed_0_ = 0, $9 = 0, $changed_0_lcssa = 0;
 if (($num | 0) == 0) {
  $changed_0_lcssa = 0;
  return $changed_0_lcssa | 0;
 } else {
  $pos_011 = 0;
  $changed_012 = 0;
 }
 while (1) {
  $5 = (__ZN10ime_pinyin15qsearch_nearestEPddii($code_book, +HEAPF64[$freqs + ($pos_011 << 3) >> 3], 0, 255) | 0) & 255;
  $6 = $code_idx + $pos_011 | 0;
  $changed_0_ = ((HEAP8[$6] | 0) != $5 << 24 >> 24) + $changed_012 | 0;
  HEAP8[$6] = $5;
  $9 = $pos_011 + 1 | 0;
  if ($9 >>> 0 < $num >>> 0) {
   $pos_011 = $9;
   $changed_012 = $changed_0_;
  } else {
   $changed_0_lcssa = $changed_0_;
   break;
  }
 }
 return $changed_0_lcssa | 0;
}
function __ZN10ime_pinyin13iterate_codesEPdjS0_Ph($freqs, $num, $code_book, $code_idx) {
 $freqs = $freqs | 0;
 $num = $num | 0;
 $code_book = $code_book | 0;
 $code_idx = $code_idx | 0;
 var $delta_last_0 = 0.0, $iter_num_0 = 0, $3 = 0.0, $9 = 0.0, label = 0;
 $iter_num_0 = 1;
 $delta_last_0 = 0.0;
 while (1) {
  __ZN10ime_pinyin15update_code_idxEPdjS0_Ph($freqs, $num, $code_book, $code_idx) | 0;
  $3 = +__ZN10ime_pinyin18recalculate_kernelEPdjS0_Ph($freqs, $num, $code_book, $code_idx);
  if ($iter_num_0 >>> 0 > 1) {
   if ($3 == 0.0) {
    label = 1635;
    break;
   }
   $9 = +Math_abs(+($delta_last_0 - $3));
   if ($9 / +Math_abs(+$3) < 1.0e-9) {
    label = 1636;
    break;
   }
  }
  $iter_num_0 = $iter_num_0 + 1 | 0;
  $delta_last_0 = $3;
 }
 if ((label | 0) == 1636) {
  return;
 } else if ((label | 0) == 1635) {
  return;
 }
}
function __ZN10ime_pinyin5NGramC2Ev($this) {
 $this = $this | 0;
 HEAP8[$this | 0] = 0;
 HEAP32[$this + 4 >> 2] = 0;
 _memset($this + 12 | 0, 0, 16);
 return;
}
function __ZN10ime_pinyin5NGramD2Ev($this) {
 $this = $this | 0;
 var $2 = 0, $7 = 0, $13 = 0;
 $2 = HEAP32[$this + 24 >> 2] | 0;
 if (($2 | 0) != 0) {
  _free($2);
 }
 $7 = HEAP32[$this + 16 >> 2] | 0;
 if (($7 | 0) != 0) {
  _free($7);
 }
 $13 = HEAP32[$this + 20 >> 2] | 0;
 if (($13 | 0) == 0) {
  return;
 }
 _free($13);
 return;
}
function __ZN10ime_pinyin5NGram12get_instanceEv() {
 var $5 = 0;
 if ((HEAP32[5340] | 0) == 0) {
  $5 = __Znwj(28) | 0;
  __ZN10ime_pinyin5NGramC2Ev($5);
  HEAP32[5340] = $5;
 }
 return HEAP32[5340] | 0;
}
function __ZN10ime_pinyin5NGram10save_ngramEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $7 = 0, $11 = 0, $15 = 0, $30 = 0, $_0 = 0;
 if ((HEAP8[$this | 0] & 1) == 0 | ($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = $this + 4 | 0;
 if ((HEAP32[$7 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = $this + 20 | 0;
 if ((HEAP32[$11 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $15 = $this + 24 | 0;
 if ((HEAP32[$15 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite($7 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite(HEAP32[$11 >> 2] | 0, 2, 256, $fp | 0) | 0) != 256) {
  $_0 = 0;
  return $_0 | 0;
 }
 $30 = _fwrite(HEAP32[$15 >> 2] | 0, 1, HEAP32[$7 >> 2] | 0, $fp | 0) | 0;
 $_0 = ($30 | 0) == (HEAP32[$7 >> 2] | 0);
 return $_0 | 0;
}
function __ZN10ime_pinyin5NGram10load_ngramEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $3 = 0, $4 = 0, $9 = 0, $10 = 0, $14 = 0, $15 = 0, $22 = 0, $33 = 0, $_0 = 0;
 if (($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this | 0;
 HEAP8[$3] = 0;
 $4 = $this + 4 | 0;
 if ((_fread($4 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $9 = $this + 24 | 0;
 $10 = HEAP32[$9 >> 2] | 0;
 if (($10 | 0) != 0) {
  _free($10);
 }
 $14 = $this + 20 | 0;
 $15 = HEAP32[$14 >> 2] | 0;
 if (($15 | 0) != 0) {
  _free($15);
 }
 HEAP32[$9 >> 2] = _malloc(HEAP32[$4 >> 2] | 0) | 0;
 $22 = _malloc(512) | 0;
 HEAP32[$14 >> 2] = $22;
 if ((HEAP32[$9 >> 2] | 0) == 0 | ($22 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fread($22 | 0, 2, 256, $fp | 0) | 0) != 256) {
  $_0 = 0;
  return $_0 | 0;
 }
 $33 = _fread(HEAP32[$9 >> 2] | 0, 1, HEAP32[$4 >> 2] | 0, $fp | 0) | 0;
 if (($33 | 0) != (HEAP32[$4 >> 2] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP8[$3] = 1;
 HEAP32[$this + 8 >> 2] = 0;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch8get_lpisEPKtjPNS_10LmaPsbItemEjS2_b($this, $splid_str, $splid_str_len, $lma_buf, $max_lma_buf, $pfullsent, $sort_by_psb) {
 $this = $this | 0;
 $splid_str = $splid_str | 0;
 $splid_str_len = $splid_str_len | 0;
 $lma_buf = $lma_buf | 0;
 $max_lma_buf = $max_lma_buf | 0;
 $pfullsent = $pfullsent | 0;
 $sort_by_psb = $sort_by_psb | 0;
 var $hanzis = 0, $4 = 0, $9 = 0, $10 = 0, $12 = 0, $num2_0 = 0, $23 = 0, $29 = 0, $31 = 0, $32 = 0, $35 = 0, $_ = 0, $pos_0110 = 0, $43 = 0, $44 = 0, $45 = 0, $46$1 = 0, $56 = 0, $pos1_0108 = 0, $remain_num_0107 = 0, $61 = 0, $78 = 0, $79 = 0, $80$1 = 0, $89 = 0, $90 = 0, $91$1 = 0, $remain_num_1 = 0, $94 = 0, $pos2_0121 = 0, $108 = 0, $109 = 0, $110 = 0, $111 = 0, $pos4_0116 = 0, $remain_num3_0115 = 0, $115 = 0, $116 = 0, $117 = 0, $138 = 0, $147 = 0, $148 = 0, $149$1 = 0, $162 = 0, $163 = 0, $164$1 = 0, $remain_num3_1 = 0, $167 = 0, $num_1 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $hanzis = sp | 0;
 if ($splid_str_len >>> 0 > 8) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $4 = HEAP32[$this + 12 >> 2] | 0;
 $9 = $splid_str_len & 65535;
 $10 = FUNCTION_TABLE_iiiiii[HEAP32[(HEAP32[$4 >> 2] | 0) + 28 >> 2] & 15]($4, $splid_str, $9, $lma_buf, $max_lma_buf) | 0;
 $12 = HEAP32[$this + 16 >> 2] | 0;
 if (($12 | 0) == 0) {
  $num2_0 = 0;
 } else {
  $num2_0 = FUNCTION_TABLE_iiiiii[HEAP32[(HEAP32[$12 >> 2] | 0) + 28 >> 2] & 15]($12, $splid_str, $9, $lma_buf + ($10 << 3) | 0, $max_lma_buf - $10 | 0) | 0;
 }
 $23 = $num2_0 + $10 | 0;
 if (($23 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 L2153 : do {
  if ($splid_str_len >>> 0 > 1) {
   $31 = $lma_buf + ($23 << 3) | 0;
   $32 = $31;
   $35 = ($max_lma_buf - $23 << 3 >>> 0) / 28 | 0;
   if ($35 >>> 0 <= $23 >>> 0) {
    ___assert_func(1184, 1714, 6648, 2304);
    return 0;
   }
   $_ = $23 >>> 0 > $35 >>> 0 ? $35 : $23;
   if (($_ | 0) == 0) {
    __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($31 | 0, $_, 28, 28);
    $num_1 = 0;
    break;
   } else {
    $pos_0110 = 0;
   }
   do {
    $43 = $lma_buf + ($pos_0110 << 3) | 0;
    $44 = $43;
    $45 = $32 + ($pos_0110 * 28 | 0) | 0;
    $46$1 = HEAP32[$44 + 4 >> 2] | 0;
    HEAP32[$45 >> 2] = HEAP32[$44 >> 2];
    HEAP32[$45 + 4 >> 2] = $46$1;
    __ZN10ime_pinyin12MatrixSearch13get_lemma_strEjPtt($this, HEAP32[$43 >> 2] & 16777215, $32 + ($pos_0110 * 28 | 0) + 8 | 0, 9) | 0;
    $pos_0110 = $pos_0110 + 1 | 0;
   } while ($pos_0110 >>> 0 < $_ >>> 0);
   __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($31 | 0, $_, 28, 28);
   if (($_ | 0) == 0) {
    $num_1 = 0;
    break;
   }
   $56 = ($pfullsent | 0) == 0;
   $remain_num_0107 = 0;
   $pos1_0108 = 0;
   L2164 : while (1) {
    do {
     if (($pos1_0108 | 0) == 0) {
      label = 1703;
     } else {
      $61 = $pos1_0108 - 1 | 0;
      if ((_utf16_strcmp($32 + ($pos1_0108 * 28 | 0) + 8 | 0, $32 + ($61 * 28 | 0) + 8 | 0) | 0) != 0) {
       label = 1703;
       break;
      }
      if ((HEAPU16[$32 + ($pos1_0108 * 28 | 0) + 4 >> 1] | 0) >= (HEAPU16[$32 + ($61 * 28 | 0) + 4 >> 1] | 0)) {
       $remain_num_1 = $remain_num_0107;
       break;
      }
      if (($remain_num_0107 | 0) == 0) {
       break L2164;
      }
      $78 = $32 + ($pos1_0108 * 28 | 0) | 0;
      $79 = $lma_buf + ($remain_num_0107 - 1 << 3) | 0;
      $80$1 = HEAP32[$78 + 4 >> 2] | 0;
      HEAP32[$79 >> 2] = HEAP32[$78 >> 2];
      HEAP32[$79 + 4 >> 2] = $80$1;
      $remain_num_1 = $remain_num_0107;
     }
    } while (0);
    do {
     if ((label | 0) == 1703) {
      label = 0;
      if (!$56) {
       if ((_utf16_strcmp($32 + ($pos1_0108 * 28 | 0) + 8 | 0, $pfullsent) | 0) == 0) {
        $remain_num_1 = $remain_num_0107;
        break;
       }
      }
      $89 = $32 + ($pos1_0108 * 28 | 0) | 0;
      $90 = $lma_buf + ($remain_num_0107 << 3) | 0;
      $91$1 = HEAP32[$89 + 4 >> 2] | 0;
      HEAP32[$90 >> 2] = HEAP32[$89 >> 2];
      HEAP32[$90 + 4 >> 2] = $91$1;
      $remain_num_1 = $remain_num_0107 + 1 | 0;
     }
    } while (0);
    $94 = $pos1_0108 + 1 | 0;
    if ($94 >>> 0 < $_ >>> 0) {
     $remain_num_0107 = $remain_num_1;
     $pos1_0108 = $94;
    } else {
     $num_1 = $remain_num_1;
     break L2153;
    }
   }
   ___assert_func(1184, 1729, 6648, 2248);
   return 0;
  } else {
   if (($23 | 0) == 0) {
    __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($lma_buf | 0, $23, 8, 14);
    $num_1 = 0;
    break;
   }
   $29 = $hanzis | 0;
   $pos2_0121 = 0;
   do {
    __ZN10ime_pinyin12MatrixSearch13get_lemma_strEjPtt($this, HEAP32[$lma_buf + ($pos2_0121 << 3) >> 2] & 16777215, $29, 2) | 0;
    HEAP16[$lma_buf + ($pos2_0121 << 3) + 6 >> 1] = HEAP16[$29 >> 1] | 0;
    $pos2_0121 = $pos2_0121 + 1 | 0;
   } while ($pos2_0121 >>> 0 < $23 >>> 0);
   __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($lma_buf | 0, $23, 8, 14);
   if (($23 | 0) == 0) {
    $num_1 = 0;
    break;
   }
   $108 = ($pfullsent | 0) == 0;
   $109 = $pfullsent + 2 | 0;
   $110 = ($pfullsent | 0) == 0;
   $111 = $pfullsent + 2 | 0;
   $remain_num3_0115 = 0;
   $pos4_0116 = 0;
   L2186 : while (1) {
    L2188 : do {
     if (($pos4_0116 | 0) == 0) {
      label = 1721;
     } else {
      $115 = $lma_buf + ($pos4_0116 << 3) + 6 | 0;
      $116 = HEAP16[$115 >> 1] | 0;
      $117 = $pos4_0116 - 1 | 0;
      if ($116 << 16 >> 16 != (HEAP16[$lma_buf + ($117 << 3) + 6 >> 1] | 0)) {
       label = 1721;
       break;
      }
      do {
       if (!$110) {
        if ((HEAP16[$111 >> 1] | 0) != 0) {
         break;
        }
        if ($116 << 16 >> 16 == (HEAP16[$pfullsent >> 1] | 0)) {
         $remain_num3_1 = $remain_num3_0115;
         break L2188;
        }
       }
      } while (0);
      if ((HEAPU16[$lma_buf + ($pos4_0116 << 3) + 4 >> 1] | 0) >= (HEAPU16[$lma_buf + ($117 << 3) + 4 >> 1] | 0)) {
       $remain_num3_1 = $remain_num3_0115;
       break;
      }
      if (($remain_num3_0115 | 0) == 0) {
       label = 1717;
       break L2186;
      }
      $138 = $remain_num3_0115 - 1 | 0;
      if ((HEAP16[$lma_buf + ($138 << 3) + 6 >> 1] | 0) != (HEAP16[$115 >> 1] | 0)) {
       label = 1719;
       break L2186;
      }
      $147 = $lma_buf + ($pos4_0116 << 3) | 0;
      $148 = $lma_buf + ($138 << 3) | 0;
      $149$1 = HEAP32[$147 + 4 >> 2] | 0;
      HEAP32[$148 >> 2] = HEAP32[$147 >> 2];
      HEAP32[$148 + 4 >> 2] = $149$1;
      $remain_num3_1 = $remain_num3_0115;
     }
    } while (0);
    L2198 : do {
     if ((label | 0) == 1721) {
      label = 0;
      do {
       if (!$108) {
        if ((HEAP16[$109 >> 1] | 0) != 0) {
         break;
        }
        if ((HEAP16[$lma_buf + ($pos4_0116 << 3) + 6 >> 1] | 0) == (HEAP16[$pfullsent >> 1] | 0)) {
         $remain_num3_1 = $remain_num3_0115;
         break L2198;
        }
       }
      } while (0);
      $162 = $lma_buf + ($pos4_0116 << 3) | 0;
      $163 = $lma_buf + ($remain_num3_0115 << 3) | 0;
      $164$1 = HEAP32[$162 + 4 >> 2] | 0;
      HEAP32[$163 >> 2] = HEAP32[$162 >> 2];
      HEAP32[$163 + 4 >> 2] = $164$1;
      $remain_num3_1 = $remain_num3_0115 + 1 | 0;
     }
    } while (0);
    $167 = $pos4_0116 + 1 | 0;
    if ($167 >>> 0 < $23 >>> 0) {
     $remain_num3_0115 = $remain_num3_1;
     $pos4_0116 = $167;
    } else {
     $num_1 = $remain_num3_1;
     break L2153;
    }
   }
   if ((label | 0) == 1717) {
    ___assert_func(1184, 1765, 6648, 2248);
    return 0;
   } else if ((label | 0) == 1719) {
    ___assert_func(1184, 1766, 6648, 2144);
    return 0;
   }
  }
 } while (0);
 if (!$sort_by_psb) {
  $_0 = $num_1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($lma_buf | 0, $num_1, 8, 30);
 $_0 = $num_1;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin12MatrixSearch12extend_dmi_cEPNS_11DictExtParaEPNS_13DictMatchInfoE($this, $dep, $dmi_s) {
 $this = $this | 0;
 $dep = $dep | 0;
 $dmi_s = $dmi_s | 0;
 var $1 = 0, $9 = 0, $10 = 0, $11 = 0, $16 = 0, $22 = 0, $26 = 0, $28 = 0, $33 = 0, $36 = 0, $51 = 0, $55 = 0, $62 = 0, $_off0 = 0, $78 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $1 = $this + 12500 | 0;
 HEAP32[$1 >> 2] = 0;
 if ((HEAP8[$this + 728 | 0] & 1) == 0) {
  ___assert_func(1184, 1510, 7296, 2440);
  return 0;
 }
 $9 = HEAP16[$dep + 80 >> 1] | 0;
 $10 = $9 & 65535;
 $11 = $this + 724 | 0;
 if (($9 & 65535) >= (HEAPU16[$11 >> 1] | 0)) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $16 = HEAP16[$dep + ($10 << 1) >> 1] | 0;
 if ($16 << 16 >> 16 != (HEAP16[$this + 400 + ($10 << 1) >> 1] | 0)) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $22 = HEAP32[$this + 88 >> 2] | 0;
 $26 = $22 + ((HEAPU16[$this + 92 >> 1] | 0) * 12 | 0) | 0;
 $28 = sp | 0;
 if (($dmi_s | 0) == 0) {
  $33 = (HEAP8[$dep + 86 | 0] & 1) != 0;
  $36 = HEAP16[$dep + 82 >> 1] & 255;
  __ZN10ime_pinyin12MatrixSearch8fill_dmiEPNS_13DictMatchInfoEPtttthbhh(0, $26, $28, -1, $16, 0, 1, $33, $36, (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$this + 4 >> 2] | 0, $16) | 0) & 1 ^ 1);
 } else {
  $51 = (HEAP8[$dmi_s + 8 | 0] & 127) + 1 & 255;
  $55 = (HEAP8[$dep + 86 | 0] & 1) != 0;
  $62 = (HEAP16[$dep + 82 >> 1] & 255) + ((HEAPU8[$dmi_s + 9 | 0] | 0) >>> 1) & 255;
  if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt(HEAP32[$this + 4 >> 2] | 0, $16) | 0) {
   $_off0 = 0;
  } else {
   $_off0 = HEAP8[$dmi_s + 10 | 0] & 1;
  }
  __ZN10ime_pinyin12MatrixSearch8fill_dmiEPNS_13DictMatchInfoEPtttthbhh(0, $26, $28, (($dmi_s - $22 | 0) / 12 | 0) & 65535, $16, 0, $51, $55, $62, $_off0);
 }
 if (($10 | 0) != ((HEAPU16[$11 >> 1] | 0) - 1 | 0)) {
  $_0 = 1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $78 = $this + 900 | 0;
 HEAP32[$78 >> 2] = HEAP32[$78 >> 2] | 16777215;
 HEAP16[$this + 904 >> 1] = 0;
 HEAP32[$1 >> 2] = 1;
 $_0 = 1;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin18recalculate_kernelEPdjS0_Ph($freqs, $num, $code_book, $code_idx) {
 $freqs = $freqs | 0;
 $num = $num | 0;
 $code_book = $code_book | 0;
 $code_idx = $code_idx | 0;
 var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $7 = 0, $8 = 0, $ret_0_lcssa = 0.0, $pos_031 = 0, $ret_030 = 0.0, $13 = 0.0, $14 = 0, $16 = 0, $20 = 0.0, $21 = 0, $26 = 0, $29 = 0, $code_029 = 0, $33 = 0, label = 0;
 $1 = __Znaj(1024) | 0;
 $2 = $1;
 $3 = ($1 | 0) == 0;
 if ($3) {
  ___assert_func(4024, 79, 6240, 4232);
  return 0.0;
 }
 _memset($1 | 0, 0, 1024);
 $6 = __Znaj(2048) | 0;
 $7 = $6;
 $8 = ($6 | 0) == 0;
 if ($8) {
  ___assert_func(4024, 83, 6240, 2920);
  return 0.0;
 }
 _memset($6 | 0, 0, 2048);
 if (($num | 0) == 0) {
  $ret_0_lcssa = 0.0;
 } else {
  $ret_030 = 0.0;
  $pos_031 = 0;
  while (1) {
   $13 = +HEAPF64[$freqs + ($pos_031 << 3) >> 3];
   $14 = $code_idx + $pos_031 | 0;
   $16 = HEAPU8[$14] | 0;
   $20 = $ret_030 + +__ZN10ime_pinyin8distanceEdd($13, +HEAPF64[$code_book + ($16 << 3) >> 3]);
   $21 = $7 + ($16 << 3) | 0;
   HEAPF64[$21 >> 3] = $13 + +HEAPF64[$21 >> 3];
   $26 = $2 + ((HEAPU8[$14] | 0) << 2) | 0;
   HEAP32[$26 >> 2] = (HEAP32[$26 >> 2] | 0) + 1;
   $29 = $pos_031 + 1 | 0;
   if ($29 >>> 0 < $num >>> 0) {
    $ret_030 = $20;
    $pos_031 = $29;
   } else {
    $ret_0_lcssa = $20;
    break;
   }
  }
 }
 $code_029 = 0;
 do {
  $33 = HEAP32[$2 + ($code_029 << 2) >> 2] | 0;
  if (($33 | 0) == 0) {
   label = 1757;
   break;
  }
  HEAPF64[$code_book + ($code_029 << 3) >> 3] = +HEAPF64[$7 + ($code_029 << 3) >> 3] / +($33 >>> 0 >>> 0);
  $code_029 = $code_029 + 1 | 0;
 } while ($code_029 >>> 0 < 256);
 if ((label | 0) == 1757) {
  ___assert_func(4024, 94, 6240, 2016);
  return 0.0;
 }
 if (!$3) {
  __ZdaPv($1);
 }
 if ($8) {
  return +$ret_0_lcssa;
 }
 __ZdaPv($6);
 return +$ret_0_lcssa;
}
function __ZN10ime_pinyin15is_system_lemmaEj($lma_id) {
 $lma_id = $lma_id | 0;
 return $lma_id >>> 0 < 500001 & ($lma_id | 0) != 0 | 0;
}
function __ZN10ime_pinyin13is_user_lemmaEj($lma_id) {
 $lma_id = $lma_id | 0;
 return ($lma_id - 500001 | 0) >>> 0 < 1e5 | 0;
}
function __ZN10ime_pinyin18is_composing_lemmaEj($lma_id) {
 $lma_id = $lma_id | 0;
 return ($lma_id | 0) == 16777215 | 0;
}
function __ZN10ime_pinyin15align_to_size_tEj($size) {
 $size = $size | 0;
 return $size + 3 & -4 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie10is_half_idEt($this, $splid) {
 $this = $this | 0;
 $splid = $splid | 0;
 return ($splid & 65535) < 30 & $splid << 16 >> 16 != 0 | 0;
}
function __ZN10ime_pinyin15cmp_lpi_with_idEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $3 = 0, $6 = 0, $_0 = 0;
 $3 = HEAP32[$p1 >> 2] & 16777215;
 $6 = HEAP32[$p2 >> 2] & 16777215;
 if ($3 >>> 0 < $6 >>> 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 $_0 = $3 >>> 0 > $6 >>> 0 | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_1EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $2 = 0, $4 = 0, $_0 = 0;
 $2 = HEAP16[$p1 >> 1] | 0;
 $4 = HEAP16[$p2 >> 1] | 0;
 if (($2 & 65535) < ($4 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 $_0 = ($2 & 65535) > ($4 & 65535) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin17cmp_npre_by_scoreEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $2 = 0.0, $4 = 0.0, $_0 = 0;
 $2 = +HEAPF32[$p1 >> 2];
 $4 = +HEAPF32[$p2 >> 2];
 if ($2 > $4) {
  $_0 = 1;
  return $_0 | 0;
 }
 $_0 = ($2 < $4) << 31 >> 31;
 return $_0 | 0;
}
function __ZN10ime_pinyin5NGram11get_uni_psbEj($this, $lma_id) {
 $this = $this | 0;
 $lma_id = $lma_id | 0;
 return +(+((HEAPU16[(HEAP32[$this + 20 >> 2] | 0) + ((HEAPU8[(HEAP32[$this + 24 >> 2] | 0) + $lma_id | 0] | 0) << 1) >> 1] | 0) >>> 0) + +HEAPF32[$this + 12 >> 2]);
}
function __ZN10ime_pinyin16cmp_lpi_with_psbEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $3 = 0, $6 = 0, $_0 = 0;
 $3 = HEAP16[$p1 + 4 >> 1] | 0;
 $6 = HEAP16[$p2 + 4 >> 1] | 0;
 if (($3 & 65535) > ($6 & 65535)) {
  $_0 = 1;
  return $_0 | 0;
 }
 $_0 = (($3 & 65535) < ($6 & 65535)) << 31 >> 31;
 return $_0 | 0;
}
function __ZN10ime_pinyin24cmp_lpi_with_unified_psbEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $9 = 0, $18 = 0, $_0 = 0;
 $9 = Math_imul((HEAP32[$p2 >> 2] | 0) >>> 24 & 15, HEAPU16[$p1 + 4 >> 1] | 0) | 0;
 $18 = Math_imul((HEAP32[$p1 >> 2] | 0) >>> 24 & 15, HEAPU16[$p2 + 4 >> 1] | 0) | 0;
 if ($9 >>> 0 < $18 >>> 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 $_0 = $9 >>> 0 > $18 >>> 0 | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin18cmp_lpi_with_hanziEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $3 = 0, $6 = 0, $_0 = 0;
 $3 = HEAP16[$p1 + 6 >> 1] | 0;
 $6 = HEAP16[$p2 + 6 >> 1] | 0;
 if (($3 & 65535) < ($6 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 $_0 = ($3 & 65535) > ($6 & 65535) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin24cmp_npre_by_hislen_scoreEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $3 = 0, $6 = 0, $12 = 0.0, $14 = 0.0, $_0 = 0;
 $3 = HEAP16[$p1 + 18 >> 1] | 0;
 $6 = HEAP16[$p2 + 18 >> 1] | 0;
 if (($3 & 65535) < ($6 & 65535)) {
  $_0 = 1;
  return $_0 | 0;
 }
 if (($3 & 65535) > ($6 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 $12 = +HEAPF32[$p1 >> 2];
 $14 = +HEAPF32[$p2 >> 2];
 if ($12 > $14) {
  $_0 = 1;
  return $_0 | 0;
 }
 $_0 = ($12 < $14) << 31 >> 31;
 return $_0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie14szm_is_enabledEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 return (HEAP8[10952 + (($ch << 24 >> 24) - 65) | 0] & 4) != 0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie13is_yunmu_charEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 return (HEAP8[10952 + (($ch << 24 >> 24) - 65) | 0] & 2) != 0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie10is_full_idEt($this, $splid) {
 $this = $this | 0;
 $splid = $splid | 0;
 if (($splid & 65535) < 30) {
  return 0;
 } else {
  return ($splid & 65535) >>> 0 < ((HEAP32[$this + 8 >> 2] | 0) + 30 | 0) >>> 0 | 0;
 }
 return 0;
}
function __ZNK10ime_pinyin12SpellingTrie12full_to_halfEt($this, $full_id) {
 $this = $this | 0;
 $full_id = $full_id | 0;
 var $5 = 0, $_0 = 0;
 if ((HEAP32[$this + 44 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = $full_id & 65535;
 if (($full_id & 65535) < 30) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ($5 >>> 0 > ((HEAP32[$this + 8 >> 2] | 0) + 30 | 0) >>> 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = HEAP16[(HEAP32[$this + 280 >> 2] | 0) + ($5 - 30 << 1) >> 1] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin5NGram23set_total_freq_none_sysEj($this, $freq_none_sys) {
 $this = $this | 0;
 $freq_none_sys = $freq_none_sys | 0;
 HEAP32[$this + 8 >> 2] = $freq_none_sys;
 if (($freq_none_sys | 0) == 0) {
  HEAPF32[$this + 12 >> 2] = 0.0;
  return;
 } else {
  HEAPF32[$this + 12 >> 2] = +Math_log(+(1.0e8 / +(($freq_none_sys + 1e8 | 0) >>> 0 >>> 0))) * -800.0;
  return;
 }
}
function __ZN10ime_pinyin5NGram20convert_psb_to_scoreEd($psb) {
 $psb = +$psb;
 var $3 = 0.0;
 $3 = +Math_log(+$psb) * -800.0;
 return +($3 > 16383.0 ? 16383.0 : $3);
}
function __ZN10ime_pinyin17cmp_lpsi_with_strEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strcmp($p1 + 8 | 0, $p2 + 8 | 0) | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_2EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strncmp($p1, $p2, 2) | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_3EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strncmp($p1, $p2, 3) | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_4EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strncmp($p1, $p2, 4) | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_5EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strncmp($p1, $p2, 5) | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_6EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strncmp($p1, $p2, 6) | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_7EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strncmp($p1, $p2, 7) | 0;
}
function __ZN10ime_pinyin12cmp_hanzis_8EPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _utf16_strncmp($p1, $p2, 8) | 0;
}
function __ZN10ime_pinyin23cmp_npre_by_hanzi_scoreEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $5 = 0, $9 = 0.0, $11 = 0.0, $_0 = 0;
 $5 = _utf16_strncmp($p1 + 4 | 0, $p2 + 4 | 0, 7) | 0;
 if (($5 | 0) != 0) {
  $_0 = $5;
  return $_0 | 0;
 }
 $9 = +HEAPF32[$p1 >> 2];
 $11 = +HEAPF32[$p2 >> 2];
 if ($9 > $11) {
  $_0 = 1;
  return $_0 | 0;
 }
 $_0 = ($9 < $11) << 31 >> 31;
 return $_0 | 0;
}
function __ZN10ime_pinyin21remove_duplicate_npreEPNS_12NPredictItemEj($npre_items, $npre_num) {
 $npre_items = $npre_items | 0;
 $npre_num = $npre_num | 0;
 var $pos_019 = 0, $remain_num_018 = 0, $6 = 0, $16 = 0, $17 = 0, $remain_num_1 = 0, $21 = 0, $_0 = 0;
 if (($npre_items | 0) == 0 | ($npre_num | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($npre_items, $npre_num, 20, 18);
 if ($npre_num >>> 0 > 1) {
  $remain_num_018 = 1;
  $pos_019 = 1;
 } else {
  $_0 = 1;
  return $_0 | 0;
 }
 while (1) {
  $6 = $npre_items + ($pos_019 * 20 | 0) | 0;
  if ((_utf16_strncmp($npre_items + ($pos_019 * 20 | 0) + 4 | 0, $npre_items + (($remain_num_018 - 1 | 0) * 20 | 0) + 4 | 0, 7) | 0) == 0) {
   $remain_num_1 = $remain_num_018;
  } else {
   if (($remain_num_018 | 0) != ($pos_019 | 0)) {
    $16 = $npre_items + ($remain_num_018 * 20 | 0) | 0;
    $17 = $6;
    HEAP32[$16 >> 2] = HEAP32[$17 >> 2];
    HEAP32[$16 + 4 >> 2] = HEAP32[$17 + 4 >> 2];
    HEAP32[$16 + 8 >> 2] = HEAP32[$17 + 8 >> 2];
    HEAP32[$16 + 12 >> 2] = HEAP32[$17 + 12 >> 2];
    HEAP32[$16 + 16 >> 2] = HEAP32[$17 + 16 >> 2];
   }
   $remain_num_1 = $remain_num_018 + 1 | 0;
  }
  $21 = $pos_019 + 1 | 0;
  if ($21 >>> 0 < $npre_num >>> 0) {
   $remain_num_018 = $remain_num_1;
   $pos_019 = $21;
  } else {
   $_0 = $remain_num_1;
   break;
  }
 }
 return $_0 | 0;
}
function __ZN10ime_pinyin11compare_splEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 return _strcmp($p1 | 0, $p2 | 0) | 0;
}
function __ZN10ime_pinyin12SpellingTrieC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 0;
 HEAP32[$this + 4 >> 2] = 0;
 HEAP32[$this + 8 >> 2] = 0;
 HEAP32[$this + 20 >> 2] = 0;
 _memset($this + 36 | 0, 0, 20);
 HEAP32[5342] = 0;
 HEAP32[$this + 24 >> 2] = 0;
 HEAP32[$this + 280 >> 2] = 0;
 __ZN10ime_pinyin12SpellingTrie14szm_enable_shmEb($this, 1);
 __ZN10ime_pinyin12SpellingTrie13szm_enable_ymEb($this, 1);
 HEAP32[$this + 284 >> 2] = 0;
 return;
}
function __ZN10ime_pinyin12SpellingTrie14szm_enable_shmEb($this, $enable) {
 $this = $this | 0;
 $enable = $enable | 0;
 var $1 = 0, $ch_010 = 0, $5 = 0, $9 = 0, $12 = 0, $ch1_013 = 0, $16 = 0, $20 = 0;
 if ($enable) {
  $ch_010 = 65;
  $1 = 65;
  while (1) {
   if (__ZNK10ime_pinyin12SpellingTrie15is_shengmu_charEc(0, $ch_010) | 0) {
    $5 = 10952 + ($1 - 65) | 0;
    HEAP8[$5] = HEAP8[$5] | 4;
   }
   $9 = $ch_010 + 1 & 255;
   if ($9 << 24 >> 24 < 91) {
    $ch_010 = $9;
    $1 = $9 << 24 >> 24;
   } else {
    break;
   }
  }
  return;
 } else {
  $ch1_013 = 65;
  $12 = 65;
  while (1) {
   if (__ZNK10ime_pinyin12SpellingTrie15is_shengmu_charEc(0, $ch1_013) | 0) {
    $16 = 10952 + ($12 - 65) | 0;
    HEAP8[$16] = HEAP8[$16] & -5;
   }
   $20 = $ch1_013 + 1 & 255;
   if ($20 << 24 >> 24 < 91) {
    $ch1_013 = $20;
    $12 = $20 << 24 >> 24;
   } else {
    break;
   }
  }
  return;
 }
}
function __ZN10ime_pinyin12SpellingTrie13szm_enable_ymEb($this, $enable) {
 $this = $this | 0;
 $enable = $enable | 0;
 var $1 = 0, $ch_010 = 0, $5 = 0, $9 = 0, $12 = 0, $ch1_013 = 0, $16 = 0, $20 = 0;
 if ($enable) {
  $ch_010 = 65;
  $1 = 65;
  while (1) {
   if (__ZNK10ime_pinyin12SpellingTrie13is_yunmu_charEc(0, $ch_010) | 0) {
    $5 = 10952 + ($1 - 65) | 0;
    HEAP8[$5] = HEAP8[$5] | 4;
   }
   $9 = $ch_010 + 1 & 255;
   if ($9 << 24 >> 24 < 91) {
    $ch_010 = $9;
    $1 = $9 << 24 >> 24;
   } else {
    break;
   }
  }
  return;
 } else {
  $ch1_013 = 65;
  $12 = 65;
  while (1) {
   if (__ZNK10ime_pinyin12SpellingTrie13is_yunmu_charEc(0, $ch1_013) | 0) {
    $16 = 10952 + ($12 - 65) | 0;
    HEAP8[$16] = HEAP8[$16] & -5;
   }
   $20 = $ch1_013 + 1 & 255;
   if ($20 << 24 >> 24 < 91) {
    $ch1_013 = $20;
    $12 = $20 << 24 >> 24;
   } else {
    break;
   }
  }
  return;
 }
}
function __ZN10ime_pinyin12SpellingTrieD2Ev($this) {
 $this = $this | 0;
 var $2 = 0, $7 = 0, $12 = 0, $18 = 0, $22 = 0, $23 = 0, $26 = 0, $32 = 0, $38 = 0, $43 = 0, $53 = 0, $58 = 0;
 $2 = HEAP32[$this >> 2] | 0;
 if (($2 | 0) != 0) {
  __ZdaPv($2);
 }
 $7 = HEAP32[$this + 36 >> 2] | 0;
 if (($7 | 0) != 0) {
  __ZdaPv($7);
 }
 $12 = HEAP32[$this + 40 >> 2] | 0;
 if (($12 | 0) != 0) {
  __ZdaPv($12);
 }
 $18 = HEAP32[$this + 20 >> 2] | 0;
 if (($18 | 0) != 0) {
  __ZdaPv($18);
 }
 $22 = $this + 44 | 0;
 $23 = HEAP32[$22 >> 2] | 0;
 do {
  if (($23 | 0) != 0) {
   __ZN10ime_pinyin12SpellingTrie13free_son_trieEPNS_12SpellingNodeE($this, $23);
   $26 = HEAP32[$22 >> 2] | 0;
   if (($26 | 0) == 0) {
    break;
   }
   __ZdlPv($26);
  }
 } while (0);
 $32 = HEAP32[$this + 48 >> 2] | 0;
 if (($32 | 0) != 0) {
  __ZdaPv($32);
 }
 $38 = HEAP32[$this + 52 >> 2] | 0;
 if (($38 | 0) != 0) {
  __ZdaPv($38);
 }
 $43 = HEAP32[5342] | 0;
 if (($43 | 0) != 0) {
  __ZN10ime_pinyin12SpellingTrieD2Ev($43);
  __ZdlPv($43);
  HEAP32[5342] = 0;
 }
 $53 = HEAP32[$this + 24 >> 2] | 0;
 if (($53 | 0) != 0) {
  __ZdaPv($53);
 }
 $58 = HEAP32[$this + 280 >> 2] | 0;
 if (($58 | 0) == 0) {
  return;
 }
 __ZdaPv($58);
 return;
}
function __ZN10ime_pinyin12SpellingTrie13free_son_trieEPNS_12SpellingNodeE($this, $node) {
 $this = $this | 0;
 $node = $node | 0;
 var $3 = 0, $6 = 0, $7 = 0, $8 = 0, $pos_07 = 0, $10 = 0, $15 = 0, $_lcssa = 0;
 if (($node | 0) == 0) {
  return;
 }
 $3 = $node + 4 | 0;
 $6 = $node | 0;
 $7 = HEAP32[$6 >> 2] | 0;
 if ((HEAPU16[$3 >> 1] | 0) > 2047) {
  $pos_07 = 0;
  $8 = $7;
  while (1) {
   __ZN10ime_pinyin12SpellingTrie13free_son_trieEPNS_12SpellingNodeE($this, $8 + ($pos_07 << 3) | 0);
   $10 = $pos_07 + 1 | 0;
   $15 = HEAP32[$6 >> 2] | 0;
   if ($10 >>> 0 < ((HEAPU16[$3 >> 1] | 0) >>> 11 & 65535) >>> 0) {
    $pos_07 = $10;
    $8 = $15;
   } else {
    $_lcssa = $15;
    break;
   }
  }
 } else {
  $_lcssa = $7;
 }
 if (($_lcssa | 0) == 0) {
  return;
 }
 __ZdaPv($_lcssa);
 return;
}
function __ZNK10ime_pinyin12SpellingTrie20half_full_compatibleEtt($this, $half_id, $full_id) {
 $this = $this | 0;
 $half_id = $half_id | 0;
 $full_id = $full_id | 0;
 var $1 = 0, $_0 = 0;
 $1 = __ZNK10ime_pinyin12SpellingTrie12full_to_halfEt($this, $full_id) | 0;
 if ($1 << 16 >> 16 == $half_id << 16 >> 16) {
  $_0 = 1;
  return $_0 | 0;
 }
 $_0 = (HEAP8[10920 + ($1 & 65535) | 0] & -33) << 24 >> 24 == (HEAP8[10920 + ($half_id & 65535) | 0] | 0);
 return $_0 | 0;
}
function __ZN10ime_pinyin5NGram13build_unigramEPNS_10LemmaEntryEjj($this, $lemma_arr, $lemma_num, $next_idx_unused) {
 $this = $this | 0;
 $lemma_arr = $lemma_arr | 0;
 $lemma_num = $lemma_num | 0;
 $next_idx_unused = $next_idx_unused | 0;
 var $5$0 = 0, $9 = 0, $10 = 0, $11 = 0, $total_freq_080 = 0.0, $idx_now_079 = 0, $pos_078 = 0, $15 = 0, $18 = 0, $23 = 0.0, $storemerge = 0.0, $idx_now_1 = 0, $total_freq_1 = 0.0, $29 = 0, $total_freq_0_lcssa = 0.0, $idx_now_0_lcssa = 0, $31 = 0, $32 = 0, $pos1_075 = 0, $37 = 0, $39 = 0.0, $46 = 0, $47 = 0, $50 = 0, $51 = 0, $54 = 0, $56 = 0, $57 = 0, $60 = 0, $61 = 0, $64 = 0, $code_pos_072 = 0, $freq_pos_071 = 0, $70 = 0, $freq_pos_1_ph = 0, $72 = 0, $73 = 0.0, $i_0 = 0, $87 = 0, $88 = 0, $92 = 0, $95 = 0, $code_pos2_068 = 0, $103 = 0, $_0 = 0;
 if (($lemma_arr | 0) == 0 | ($lemma_num | 0) == 0 | $next_idx_unused >>> 0 < 2) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5$0 = _llvm_umul_with_overflow_i32($next_idx_unused | 0, 8) | 0;
 $9 = __Znaj(tempRet0 ? -1 : $5$0) | 0;
 $10 = $9;
 $11 = ($9 | 0) == 0;
 if ($11) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAPF64[$10 >> 3] = .3;
 L2448 : do {
  if (($lemma_num | 0) == 0) {
   $idx_now_0_lcssa = 0;
   $total_freq_0_lcssa = .3;
  } else {
   $pos_078 = 0;
   $idx_now_079 = 0;
   $total_freq_080 = .3;
   while (1) {
    $15 = HEAP32[$lemma_arr + ($pos_078 * 124 | 0) + 4 >> 2] | 0;
    if (($15 | 0) == ($idx_now_079 | 0)) {
     $total_freq_1 = $total_freq_080;
     $idx_now_1 = $idx_now_079;
    } else {
     $18 = $idx_now_079 + 1 | 0;
     if (($15 | 0) != ($18 | 0)) {
      break;
     }
     $23 = +HEAPF32[$lemma_arr + ($pos_078 * 124 | 0) + 120 >> 2];
     $storemerge = $23 > 0.0 ? $23 : .3;
     HEAPF64[$10 + ($18 << 3) >> 3] = $storemerge;
     $total_freq_1 = $total_freq_080 + $storemerge;
     $idx_now_1 = $18;
    }
    $29 = $pos_078 + 1 | 0;
    if ($29 >>> 0 < $lemma_num >>> 0) {
     $pos_078 = $29;
     $idx_now_079 = $idx_now_1;
     $total_freq_080 = $total_freq_1;
    } else {
     $idx_now_0_lcssa = $idx_now_1;
     $total_freq_0_lcssa = $total_freq_1;
     break L2448;
    }
   }
   ___assert_func(4024, 262, 6152, 1576);
   return 0;
  }
 } while (0);
 $31 = $idx_now_0_lcssa + 1 | 0;
 $32 = $this + 4 | 0;
 HEAP32[$32 >> 2] = $31;
 if (($31 | 0) != ($next_idx_unused | 0)) {
  ___assert_func(4024, 273, 6152, 1312);
  return 0;
 }
 L2460 : do {
  if ((HEAP32[$32 >> 2] | 0) != 0) {
   $pos1_075 = 0;
   while (1) {
    $37 = $10 + ($pos1_075 << 3) | 0;
    $39 = +HEAPF64[$37 >> 3] / $total_freq_0_lcssa;
    HEAPF64[$37 >> 3] = $39;
    if ($39 <= 0.0) {
     break;
    }
    $pos1_075 = $pos1_075 + 1 | 0;
    if ($pos1_075 >>> 0 >= (HEAP32[$32 >> 2] | 0) >>> 0) {
     break L2460;
    }
   }
   ___assert_func(4024, 277, 6152, 1080);
   return 0;
  }
 } while (0);
 $46 = $this + 16 | 0;
 $47 = HEAP32[$46 >> 2] | 0;
 do {
  if (($47 | 0) == 0) {
   $50 = __Znaj(2048) | 0;
   $51 = $50;
   HEAP32[$46 >> 2] = $51;
   if (($50 | 0) != 0) {
    $54 = $51;
    break;
   }
   ___assert_func(4024, 285, 6152, 904);
   return 0;
  } else {
   $54 = $47;
  }
 } while (0);
 _memset($54 | 0, 0, 2048);
 $56 = $this + 20 | 0;
 $57 = HEAP32[$56 >> 2] | 0;
 do {
  if (($57 | 0) == 0) {
   $60 = __Znaj(512) | 0;
   $61 = $60;
   HEAP32[$56 >> 2] = $61;
   if (($60 | 0) != 0) {
    $64 = $61;
    break;
   }
   ___assert_func(4024, 290, 6152, 736);
   return 0;
  } else {
   $64 = $57;
  }
 } while (0);
 _memset($64 | 0, 0, 512);
 $freq_pos_071 = 0;
 $code_pos_072 = 0;
 while (1) {
  $freq_pos_1_ph = $freq_pos_071;
  L2476 : while (1) {
   $72 = $10 + ($freq_pos_1_ph << 3) | 0;
   $73 = +HEAPF64[$72 >> 3];
   $i_0 = 0;
   while (1) {
    if ($i_0 >>> 0 >= $code_pos_072 >>> 0) {
     break L2476;
    }
    if (+HEAPF64[(HEAP32[$46 >> 2] | 0) + ($i_0 << 3) >> 3] == $73) {
     break;
    } else {
     $i_0 = $i_0 + 1 | 0;
    }
   }
   $freq_pos_1_ph = $freq_pos_1_ph + 1 | 0;
  }
  HEAPF64[(HEAP32[$46 >> 2] | 0) + ($code_pos_072 << 3) >> 3] = +HEAPF64[$72 >> 3];
  $70 = $code_pos_072 + 1 | 0;
  if ($70 >>> 0 < 256) {
   $freq_pos_071 = $freq_pos_1_ph + 1 | 0;
   $code_pos_072 = $70;
  } else {
   break;
  }
 }
 __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E(HEAP32[$46 >> 2] | 0, 256, 8, 2);
 $87 = $this + 24 | 0;
 $88 = HEAP32[$87 >> 2] | 0;
 do {
  if (($88 | 0) == 0) {
   $92 = __Znaj(HEAP32[$32 >> 2] | 0) | 0;
   HEAP32[$87 >> 2] = $92;
   if (($92 | 0) != 0) {
    $95 = $92;
    break;
   }
   ___assert_func(4024, 317, 6152, 584);
   return 0;
  } else {
   $95 = $88;
  }
 } while (0);
 __ZN10ime_pinyin13iterate_codesEPdjS0_Ph($10, HEAP32[$32 >> 2] | 0, HEAP32[$46 >> 2] | 0, $95);
 if ($11) {
  $code_pos2_068 = 0;
 } else {
  __ZdaPv($9);
  $code_pos2_068 = 0;
 }
 do {
  $103 = ~~+__ZN10ime_pinyin5NGram20convert_psb_to_scoreEd(+HEAPF64[(HEAP32[$46 >> 2] | 0) + ($code_pos2_068 << 3) >> 3]);
  HEAP16[(HEAP32[$56 >> 2] | 0) + ($code_pos2_068 << 1) >> 1] = $103;
  $code_pos2_068 = $code_pos2_068 + 1 | 0;
 } while ($code_pos2_068 >>> 0 < 256);
 HEAP8[$this | 0] = 1;
 $_0 = 1;
 return $_0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie18if_valid_id_updateEPt($this, $splid) {
 $this = $this | 0;
 $splid = $splid | 0;
 var $3 = 0, $4 = 0, $10 = 0, $_0 = 0;
 if (($splid | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = HEAP16[$splid >> 1] | 0;
 $4 = $3 & 65535;
 if ($3 << 16 >> 16 == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (($3 & 65535) > 29) {
  $_0 = 1;
  return $_0 | 0;
 }
 $10 = HEAP8[10920 + $4 | 0] | 0;
 if ((538968080 >>> ($4 >>> 0) & 1 | 0) != 0) {
  $_0 = 1;
  return $_0 | 0;
 }
 if (__ZNK10ime_pinyin12SpellingTrie14szm_is_enabledEc(0, $10) | 0) {
  $_0 = 1;
  return $_0 | 0;
 }
 if (!(__ZNK10ime_pinyin12SpellingTrie13is_yunmu_charEc(0, $10) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP16[$this + 220 + ($4 << 1) >> 1] | 0) == 0) {
  ___assert_func(3376, 128, 4448, 4088);
  return 0;
 }
 HEAP16[$splid >> 1] = HEAP16[$this + 160 + ($4 << 1) >> 1] | 0;
 $_0 = 1;
 return $_0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie16is_half_id_yunmuEt($this, $splid) {
 $this = $this | 0;
 $splid = $splid | 0;
 var $1 = 0, $_0 = 0;
 $1 = $splid & 65535;
 if ($splid << 16 >> 16 == 0 | ($splid & 65535) > 29) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((538968080 >>> ($1 >>> 0) & 1 | 0) != 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = (HEAP8[10952 + ((HEAP8[10920 + $1 | 0] | 0) - 65) | 0] & 2) != 0;
 return $_0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie15is_shengmu_charEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 return (HEAP8[10952 + (($ch << 24 >> 24) - 65) | 0] & 1) != 0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie14is_szm_enabledEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 return (HEAP8[10952 + (($ch << 24 >> 24) - 65) | 0] & 4) != 0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie13half2full_numEt($this, $half_id) {
 $this = $this | 0;
 $half_id = $half_id | 0;
 var $_0 = 0;
 if ((HEAP32[$this + 44 >> 2] | 0) == 0 | ($half_id & 65535) > 29) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = HEAP16[$this + 220 + (($half_id & 65535) << 1) >> 1] | 0;
 return $_0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt($this, $half_id, $spl_id_start) {
 $this = $this | 0;
 $half_id = $half_id | 0;
 $spl_id_start = $spl_id_start | 0;
 var $7 = 0, $_0 = 0;
 if (($spl_id_start | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 44 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = $half_id & 65535;
 if (($half_id & 65535) > 29) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP16[$spl_id_start >> 1] = HEAP16[$this + 160 + ($7 << 1) >> 1] | 0;
 $_0 = HEAP16[$this + 220 + ($7 << 1) >> 1] | 0;
 return $_0 | 0;
}
function __ZNK10ime_pinyin12SpellingTrie11is_szm_charEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 var $5 = 0;
 if (__ZNK10ime_pinyin12SpellingTrie15is_shengmu_charEc(0, $ch) | 0) {
  $5 = 1;
  return $5 | 0;
 }
 $5 = __ZNK10ime_pinyin12SpellingTrie13is_yunmu_charEc(0, $ch) | 0;
 return $5 | 0;
}
function __ZN10ime_pinyin12SpellingTrie14get_cpinstanceEv() {
 return __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
}
function __ZN10ime_pinyin12SpellingTrie12get_instanceEv() {
 var $5 = 0;
 if ((HEAP32[5342] | 0) == 0) {
  $5 = __Znwj(288) | 0;
  __ZN10ime_pinyin12SpellingTrieC2Ev($5);
  HEAP32[5342] = $5;
 }
 return HEAP32[5342] | 0;
}
function __ZN10ime_pinyin12SpellingTrie9constructEPKcjjfh($this, $spelling_arr, $item_size, $item_num, $score_amplifier, $average_score) {
 $this = $this | 0;
 $spelling_arr = $spelling_arr | 0;
 $item_size = $item_size | 0;
 $item_num = $item_num | 0;
 $score_amplifier = +$score_amplifier;
 $average_score = $average_score | 0;
 var $3 = 0, $4 = 0, $6 = 0, $12 = 0, $13 = 0, $17 = 0, $18 = 0, $20 = 0, $21 = 0, $22 = 0, $27 = 0, $30 = 0, $31 = 0, $37$0 = 0, $41 = 0, $49 = 0, $51 = 0, $52 = 0, $53 = 0, $55 = 0, $56 = 0, $60 = 0, $62 = 0, $63 = 0, $71 = 0, $_0 = 0;
 if (($spelling_arr | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this + 160 | 0;
 $4 = $this | 0;
 _memset($3 | 0, 0, 120);
 $6 = HEAP32[$4 >> 2] | 0;
 do {
  if (($6 | 0) != ($spelling_arr | 0)) {
   if (($6 | 0) != 0) {
    __ZdaPv($6);
   }
   $12 = Math_imul($item_num, $item_size) | 0;
   $13 = __Znaj($12) | 0;
   HEAP32[$4 >> 2] = $13;
   if (($13 | 0) == 0) {
    $_0 = 0;
    return $_0 | 0;
   } else {
    _memcpy($13 | 0, $spelling_arr | 0, $12) | 0;
    break;
   }
  }
 } while (0);
 $17 = $this + 4 | 0;
 HEAP32[$17 >> 2] = $item_size;
 $18 = $this + 8 | 0;
 HEAP32[$18 >> 2] = $item_num;
 HEAPF32[$this + 12 >> 2] = $score_amplifier;
 $20 = $this + 16 | 0;
 HEAP8[$20] = $average_score;
 $21 = $this + 36 | 0;
 $22 = HEAP32[$21 >> 2] | 0;
 if (($22 | 0) != 0) {
  __ZdaPv($22);
 }
 $27 = __Znaj(HEAP32[$17 >> 2] | 0) | 0;
 HEAP32[$21 >> 2] = $27;
 if (($27 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $30 = $this + 40 | 0;
 $31 = HEAP32[$30 >> 2] | 0;
 if (($31 | 0) != 0) {
  __ZdaPv($31);
 }
 $37$0 = _llvm_umul_with_overflow_i32(HEAP32[$17 >> 2] | 0, 2) | 0;
 $41 = __Znaj(tempRet0 ? -1 : $37$0) | 0;
 HEAP32[$30 >> 2] = $41;
 if (($41 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 _qsort(HEAP32[$4 >> 2] | 0, HEAP32[$18 >> 2] | 0, HEAP32[$17 >> 2] | 0, 46);
 HEAP32[$this + 284 >> 2] = 1;
 $49 = __Znwj(8) | 0;
 $51 = $49;
 $52 = $this + 44 | 0;
 HEAP32[$52 >> 2] = $49;
 HEAP32[$51 >> 2] = 0;
 HEAP32[$51 + 4 >> 2] = 0;
 $53 = __Znwj(8) | 0;
 $55 = $53;
 $56 = $this + 48 | 0;
 HEAP32[$56 >> 2] = $53;
 HEAP32[$55 >> 2] = 0;
 HEAP32[$55 + 4 >> 2] = 0;
 HEAP8[(HEAP32[$56 >> 2] | 0) + 7 | 0] = HEAP8[$20] | 0;
 $60 = __Znwj(8) | 0;
 $62 = $60;
 $63 = $this + 52 | 0;
 HEAP32[$63 >> 2] = $60;
 HEAP32[$62 >> 2] = 0;
 HEAP32[$62 + 4 >> 2] = 0;
 HEAP8[(HEAP32[$63 >> 2] | 0) + 7 | 0] = HEAP8[$20] | 0;
 _memset($this + 56 | 0, 0, 104);
 $71 = __ZN10ime_pinyin12SpellingTrie26construct_spellings_subsetEjjjPNS_12SpellingNodeE($this, 0, HEAP32[$18 >> 2] | 0, 0, HEAP32[$52 >> 2] | 0) | 0;
 HEAP32[HEAP32[$52 >> 2] >> 2] = $71;
 HEAP8[(HEAP32[$52 >> 2] | 0) + 7 | 0] = 0;
 if ((HEAP32[HEAP32[$52 >> 2] >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP16[$this + 220 >> 1] = 0;
 HEAP16[$3 >> 1] = 0;
 if (!(__ZN10ime_pinyin12SpellingTrie9build_f2hEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12SpellingTrie13build_ym_infoEv($this) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12SpellingTrie9build_f2hEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $9$0 = 0, $13 = 0, $16 = 0, $hid_09 = 0, $17 = 0, $18 = 0, $19 = 0, $21 = 0, $26 = 0, $fid_08 = 0, $38 = 0, $_0 = 0;
 $1 = $this + 280 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) != 0) {
  __ZdaPv($2);
 }
 $9$0 = _llvm_umul_with_overflow_i32(HEAP32[$this + 8 >> 2] | 0, 2) | 0;
 $13 = __Znaj(tempRet0 ? -1 : $9$0) | 0;
 HEAP32[$1 >> 2] = $13;
 if (($13 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $hid_09 = 0;
  $16 = 0;
 }
 while (1) {
  $17 = $this + 160 + ($16 << 1) | 0;
  $18 = HEAP16[$17 >> 1] | 0;
  $19 = $18 & 65535;
  $21 = $this + 220 + ($16 << 1) | 0;
  if (($19 | 0) < ((HEAPU16[$21 >> 1] | 0) + ($18 & 65535) | 0)) {
   $fid_08 = $18;
   $26 = $19;
   do {
    HEAP16[(HEAP32[$1 >> 2] | 0) + ($26 - 30 << 1) >> 1] = $hid_09;
    $fid_08 = $fid_08 + 1 & 65535;
    $26 = $fid_08 & 65535;
   } while (($26 | 0) < ((HEAPU16[$21 >> 1] | 0) + (HEAPU16[$17 >> 1] | 0) | 0));
  }
  $38 = $hid_09 + 1 & 65535;
  if (($38 & 65535) < 30) {
   $hid_09 = $38;
   $16 = $38 & 65535;
  } else {
   $_0 = 1;
   break;
  }
 }
 return $_0 | 0;
}
function __ZN10ime_pinyin12SpellingTrie26construct_spellings_subsetEjjjPNS_12SpellingNodeE($this, $item_start, $item_end, $level, $parent) {
 $this = $this | 0;
 $item_start = $item_start | 0;
 $item_end = $item_end | 0;
 $level = $level | 0;
 $parent = $parent | 0;
 var $1 = 0, $2 = 0, $5 = 0, $6 = 0, $9 = 0, $16 = 0, $18 = 0, $19 = 0, $num_of_son_0228 = 0, $char_for_node_0227 = 0, $i_0226 = 0, $23 = 0, $num_of_son_0_ = 0, $25 = 0, $num_of_son_0_lcssa = 0, $28 = 0, $29 = 0, $umul_with_overflow = 0, $32 = 0, $33 = 0, $34 = 0, $36 = 0, $37 = 0, $39 = 0, $40 = 0, $43 = 0, $45 = 0, $46 = 0, $min_son_score_0220 = 0, $spelling_last_start_0219 = 0, $char_for_node_2218 = 0, $son_pos_0214 = 0, $i1_0210 = 0, $item_start_next_0207 = 0, $spelling_endable_1_off0206 = 0, $48 = 0, $50 = 0, $51 = 0, $53 = 0, $57 = 0, $60 = 0, $71 = 0, $76 = 0, $77 = 0, $83 = 0, $84 = 0, $92 = 0, $93 = 0, $106 = 0, $_min_son_score_0 = 0, $113 = 0, $_pn = 0, $127 = 0, $130 = 0, $part_id_0184 = 0, $132 = 0, $145 = 0, $spelling_endable_3_off0 = 0, $item_start_next_1 = 0, $son_pos_1 = 0, $char_for_node_3 = 0, $spelling_last_start_1 = 0, $min_son_score_2 = 0, $160 = 0, $min_son_score_0_lcssa = 0, $spelling_last_start_0_lcssa = 0, $char_for_node_2_lcssa = 0, $son_pos_0_lcssa = 0, $item_start_next_0_lcssa = 0, $spelling_endable_1_off0_lcssa = 0, $162 = 0, $164 = 0, $175 = 0, $180 = 0, $181 = 0, $187 = 0, $188 = 0, $196 = 0, $197 = 0, $210 = 0, $_min_son_score_0176 = 0, $220 = 0, $_pn193 = 0, $234 = 0, $237 = 0, $part_id9_0191 = 0, $239 = 0, $252 = 0, $263 = 0, $_0 = 0, label = 0;
 $1 = $this + 4 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if ($item_end >>> 0 <= $item_start >>> 0 | $2 >>> 0 <= $level >>> 0 | ($parent | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = $this | 0;
 $6 = HEAP32[$5 >> 2] | 0;
 $9 = HEAP8[$6 + ((Math_imul($2, $item_start) | 0) + $level) | 0] | 0;
 if ($9 << 24 >> 24 <= 64) {
  ___assert_func(3376, 439, 6400, 1496);
  return 0;
 }
 if (!($9 << 24 >> 24 < 91 | $9 << 24 >> 24 == 104)) {
  ___assert_func(3376, 439, 6400, 1496);
  return 0;
 }
 $16 = $item_start + 1 | 0;
 if ($16 >>> 0 < $item_end >>> 0) {
  $18 = HEAP32[$5 >> 2] | 0;
  $19 = HEAP32[$1 >> 2] | 0;
  $i_0226 = $16;
  $char_for_node_0227 = $9;
  $num_of_son_0228 = 0;
  while (1) {
   $23 = HEAP8[$18 + ((Math_imul($19, $i_0226) | 0) + $level) | 0] | 0;
   $num_of_son_0_ = ($23 << 24 >> 24 != $char_for_node_0227 << 24 >> 24) + $num_of_son_0228 & 65535;
   $25 = $i_0226 + 1 | 0;
   if ($25 >>> 0 < $item_end >>> 0) {
    $i_0226 = $25;
    $char_for_node_0227 = $23;
    $num_of_son_0228 = $num_of_son_0_;
   } else {
    break;
   }
  }
  $num_of_son_0_lcssa = $num_of_son_0_ + 1 & 65535;
 } else {
  $num_of_son_0_lcssa = 1;
 }
 $28 = $num_of_son_0_lcssa & 65535;
 $29 = $this + 284 | 0;
 HEAP32[$29 >> 2] = (HEAP32[$29 >> 2] | 0) + $28;
 $umul_with_overflow = $28 << 3;
 $32 = __Znaj($umul_with_overflow) | 0;
 $33 = $32;
 _memset($32 | 0, 0, $umul_with_overflow | 0);
 $34 = HEAP32[$5 >> 2] | 0;
 $36 = Math_imul(HEAP32[$1 >> 2] | 0, $item_start) | 0;
 $37 = $34 + $36 | 0;
 $39 = HEAP8[$34 + ($36 + $level) | 0] | 0;
 $40 = $level + 1 | 0;
 $43 = (HEAP8[$34 + ($36 + $40) | 0] | 0) == 0;
 L2614 : do {
  if ($16 >>> 0 < $item_end >>> 0) {
   $45 = ($level | 0) == 0;
   $46 = ($level | 0) == 1;
   $spelling_endable_1_off0206 = $43;
   $item_start_next_0207 = $item_start;
   $i1_0210 = $16;
   $son_pos_0214 = 0;
   $char_for_node_2218 = $39;
   $spelling_last_start_0219 = $37;
   $min_son_score_0220 = -1;
   while (1) {
    $48 = HEAP32[$5 >> 2] | 0;
    $50 = Math_imul(HEAP32[$1 >> 2] | 0, $i1_0210) | 0;
    $51 = $48 + $50 | 0;
    $53 = HEAP8[$48 + ($50 + $level) | 0] | 0;
    if (!(__ZN10ime_pinyin12SpellingTrie17is_valid_spl_charEc($53) | 0)) {
     break;
    }
    $57 = $char_for_node_2218 << 24 >> 24;
    if ($53 << 24 >> 24 == $char_for_node_2218 << 24 >> 24) {
     $min_son_score_2 = $min_son_score_0220;
     $spelling_last_start_1 = $spelling_last_start_0219;
     $char_for_node_3 = $char_for_node_2218;
     $son_pos_1 = $son_pos_0214;
     $item_start_next_1 = $item_start_next_0207;
     $spelling_endable_3_off0 = $spelling_endable_1_off0206;
    } else {
     $60 = $33 + ($son_pos_0214 << 3) | 0;
     HEAP8[$33 + ($son_pos_0214 << 3) + 6 | 0] = $char_for_node_2218;
     if ($45) {
      HEAP32[$this + 56 + ($57 - 65 << 2) >> 2] = $60;
     }
     if ($spelling_endable_1_off0206) {
      $71 = $33 + ($son_pos_0214 << 3) + 4 | 0;
      HEAP16[$71 >> 1] = HEAP16[$71 >> 1] & -2048 | $item_start_next_0207 + 30 & 2047;
     }
     $76 = $spelling_last_start_0219 + $40 | 0;
     $77 = HEAP8[$76] | 0;
     do {
      if ($77 << 24 >> 24 == 0) {
       if (($i1_0210 - $item_start_next_0207 | 0) >>> 0 > 1) {
        $83 = HEAP8[$76] | 0;
        label = 2059;
        break;
       } else {
        HEAP32[$60 >> 2] = 0;
        HEAP8[$33 + ($son_pos_0214 << 3) + 7 | 0] = HEAP8[$spelling_last_start_0219 + ((HEAP32[$1 >> 2] | 0) - 1) | 0] | 0;
        break;
       }
      } else {
       $83 = $77;
       label = 2059;
      }
     } while (0);
     do {
      if ((label | 0) == 2059) {
       label = 0;
       $84 = $83 << 24 >> 24 == 0;
       HEAP32[$60 >> 2] = __ZN10ime_pinyin12SpellingTrie26construct_spellings_subsetEjjjPNS_12SpellingNodeE($this, ($84 & 1) + $item_start_next_0207 | 0, $i1_0210, $40, $60) | 0;
       if (!$84) {
        break;
       }
       $92 = HEAP8[$spelling_last_start_0219 + ((HEAP32[$1 >> 2] | 0) - 1) | 0] | 0;
       $93 = $33 + ($son_pos_0214 << 3) + 7 | 0;
       if (($92 & 255) >= (HEAPU8[$93] | 0)) {
        break;
       }
       HEAP8[$93] = $92;
      }
     } while (0);
     $106 = HEAP8[$33 + ($son_pos_0214 << 3) + 7 | 0] | 0;
     $_min_son_score_0 = ($106 & 255) < ($min_son_score_0220 & 255) ? $106 : $min_son_score_0220;
     do {
      if ($45) {
       if (!(__ZNK10ime_pinyin12SpellingTrie11is_szm_charEc(0, $char_for_node_2218) | 0)) {
        break;
       }
       $113 = $33 + ($son_pos_0214 << 3) + 4 | 0;
       $_pn = (($57 + 1984 & 65535) + ($char_for_node_2218 << 24 >> 24 > 67) & 65535) + ($char_for_node_2218 << 24 >> 24 > 83) & 2047;
       HEAP16[$113 >> 1] = HEAP16[$113 >> 1] & -2048 | $_pn;
       HEAP16[$this + 220 + (($_pn & 65535) << 1) >> 1] = $i1_0210 - $item_start_next_0207 & 65535;
       label = 2071;
      } else {
       if (!($46 & $char_for_node_2218 << 24 >> 24 == 104)) {
        break;
       }
       $127 = HEAP8[$spelling_last_start_0219] | 0;
       if (($127 << 24 >> 24 | 0) == 67) {
        $part_id_0184 = 4;
       } else if (($127 << 24 >> 24 | 0) == 83) {
        $part_id_0184 = 21;
       } else {
        $130 = $127 << 24 >> 24 == 90;
        if ($130) {
         $part_id_0184 = $130 ? 29 : 0;
        } else {
         break;
        }
       }
       $132 = $33 + ($son_pos_0214 << 3) + 4 | 0;
       HEAP16[$132 >> 1] = HEAP16[$132 >> 1] & -2048 | $part_id_0184;
       HEAP16[$this + 220 + (($part_id_0184 & 65535) << 1) >> 1] = $i1_0210 - $item_start_next_0207 & 65535;
       label = 2071;
      }
     } while (0);
     do {
      if ((label | 0) == 2071) {
       label = 0;
       $145 = HEAP16[$33 + ($son_pos_0214 << 3) + 4 >> 1] & 2047;
       if ((HEAP16[$this + 220 + ($145 << 1) >> 1] | 0) == 0) {
        HEAP16[$this + 160 + ($145 << 1) >> 1] = 0;
        break;
       } else {
        HEAP16[$this + 160 + ($145 << 1) >> 1] = $item_start_next_0207 + 30 & 65535;
        break;
       }
      }
     } while (0);
     $min_son_score_2 = $_min_son_score_0;
     $spelling_last_start_1 = $51;
     $char_for_node_3 = $53;
     $son_pos_1 = $son_pos_0214 + 1 | 0;
     $item_start_next_1 = $i1_0210;
     $spelling_endable_3_off0 = (HEAP8[$48 + ($50 + $40) | 0] | 0) == 0;
    }
    $160 = $i1_0210 + 1 | 0;
    if ($160 >>> 0 < $item_end >>> 0) {
     $spelling_endable_1_off0206 = $spelling_endable_3_off0;
     $item_start_next_0207 = $item_start_next_1;
     $i1_0210 = $160;
     $son_pos_0214 = $son_pos_1;
     $char_for_node_2218 = $char_for_node_3;
     $spelling_last_start_0219 = $spelling_last_start_1;
     $min_son_score_0220 = $min_son_score_2;
    } else {
     $spelling_endable_1_off0_lcssa = $spelling_endable_3_off0;
     $item_start_next_0_lcssa = $item_start_next_1;
     $son_pos_0_lcssa = $son_pos_1;
     $char_for_node_2_lcssa = $char_for_node_3;
     $spelling_last_start_0_lcssa = $spelling_last_start_1;
     $min_son_score_0_lcssa = $min_son_score_2;
     break L2614;
    }
   }
   ___assert_func(3376, 474, 6400, 1280);
   return 0;
  } else {
   $spelling_endable_1_off0_lcssa = $43;
   $item_start_next_0_lcssa = $item_start;
   $son_pos_0_lcssa = 0;
   $char_for_node_2_lcssa = $39;
   $spelling_last_start_0_lcssa = $37;
   $min_son_score_0_lcssa = -1;
  }
 } while (0);
 $162 = $33 + ($son_pos_0_lcssa << 3) | 0;
 HEAP8[$33 + ($son_pos_0_lcssa << 3) + 6 | 0] = $char_for_node_2_lcssa;
 $164 = ($level | 0) == 0;
 if ($164) {
  HEAP32[$this + 56 + (($char_for_node_2_lcssa << 24 >> 24) - 65 << 2) >> 2] = $162;
 }
 if ($spelling_endable_1_off0_lcssa) {
  $175 = $33 + ($son_pos_0_lcssa << 3) + 4 | 0;
  HEAP16[$175 >> 1] = HEAP16[$175 >> 1] & -2048 | $item_start_next_0_lcssa + 30 & 2047;
 }
 $180 = $spelling_last_start_0_lcssa + $40 | 0;
 $181 = HEAP8[$180] | 0;
 do {
  if ($181 << 24 >> 24 == 0) {
   if (($item_end - $item_start_next_0_lcssa | 0) >>> 0 > 1) {
    $187 = HEAP8[$180] | 0;
    label = 2083;
    break;
   } else {
    HEAP32[$162 >> 2] = 0;
    HEAP8[$33 + ($son_pos_0_lcssa << 3) + 7 | 0] = HEAP8[$spelling_last_start_0_lcssa + ((HEAP32[$1 >> 2] | 0) - 1) | 0] | 0;
    break;
   }
  } else {
   $187 = $181;
   label = 2083;
  }
 } while (0);
 do {
  if ((label | 0) == 2083) {
   $188 = $187 << 24 >> 24 == 0;
   HEAP32[$162 >> 2] = __ZN10ime_pinyin12SpellingTrie26construct_spellings_subsetEjjjPNS_12SpellingNodeE($this, ($188 & 1) + $item_start_next_0_lcssa | 0, $item_end, $40, $162) | 0;
   if (!$188) {
    break;
   }
   $196 = HEAP8[$spelling_last_start_0_lcssa + ((HEAP32[$1 >> 2] | 0) - 1) | 0] | 0;
   $197 = $33 + ($son_pos_0_lcssa << 3) + 7 | 0;
   if (($196 & 255) >= (HEAPU8[$197] | 0)) {
    break;
   }
   HEAP8[$197] = $196;
  }
 } while (0);
 $210 = HEAP8[$33 + ($son_pos_0_lcssa << 3) + 7 | 0] | 0;
 $_min_son_score_0176 = ($210 & 255) < ($min_son_score_0_lcssa & 255) ? $210 : $min_son_score_0_lcssa;
 if (($son_pos_0_lcssa + 1 | 0) != ($28 | 0)) {
  ___assert_func(3376, 598, 6400, 1048);
  return 0;
 }
 do {
  if ($164) {
   if (!(__ZNK10ime_pinyin12SpellingTrie14szm_is_enabledEc(0, $char_for_node_2_lcssa) | 0)) {
    break;
   }
   $220 = $33 + ($son_pos_0_lcssa << 3) + 4 | 0;
   $_pn193 = (($char_for_node_2_lcssa << 24 >> 24 > 67 ? 1985 : 1984) + ($char_for_node_2_lcssa << 24 >> 24) & 65535) + ($char_for_node_2_lcssa << 24 >> 24 > 83) & 2047;
   HEAP16[$220 >> 1] = HEAP16[$220 >> 1] & -2048 | $_pn193;
   HEAP16[$this + 220 + (($_pn193 & 65535) << 1) >> 1] = $item_end - $item_start_next_0_lcssa & 65535;
   label = 2097;
  } else {
   if (!(($level | 0) == 1 & $char_for_node_2_lcssa << 24 >> 24 == 104)) {
    break;
   }
   $234 = HEAP8[$spelling_last_start_0_lcssa] | 0;
   if (($234 << 24 >> 24 | 0) == 83) {
    $part_id9_0191 = 21;
   } else if (($234 << 24 >> 24 | 0) == 67) {
    $part_id9_0191 = 4;
   } else {
    $237 = $234 << 24 >> 24 == 90;
    if ($237) {
     $part_id9_0191 = $237 ? 29 : 0;
    } else {
     break;
    }
   }
   $239 = $33 + ($son_pos_0_lcssa << 3) + 4 | 0;
   HEAP16[$239 >> 1] = HEAP16[$239 >> 1] & -2048 | $part_id9_0191;
   HEAP16[$this + 220 + (($part_id9_0191 & 65535) << 1) >> 1] = $item_end - $item_start_next_0_lcssa & 65535;
   label = 2097;
  }
 } while (0);
 do {
  if ((label | 0) == 2097) {
   $252 = HEAP16[$33 + ($son_pos_0_lcssa << 3) + 4 >> 1] & 2047;
   if ((HEAP16[$this + 220 + ($252 << 1) >> 1] | 0) == 0) {
    HEAP16[$this + 160 + ($252 << 1) >> 1] = 0;
    break;
   } else {
    HEAP16[$this + 160 + ($252 << 1) >> 1] = $item_start_next_0_lcssa + 30 & 65535;
    break;
   }
  }
 } while (0);
 $263 = $parent + 4 | 0;
 HEAP16[$263 >> 1] = HEAP16[$263 >> 1] & 2047 | $num_of_son_0_lcssa << 11;
 HEAP8[$parent + 7 | 0] = $_min_son_score_0176;
 $_0 = $33;
 return $_0 | 0;
}
function __ZN10ime_pinyin4SyncD2Ev($this) {
 $this = $this | 0;
 return;
}
function __ZN10ime_pinyin12SpellingTrie17is_valid_spl_charEc($ch) {
 $ch = $ch | 0;
 if (($ch - 97 & 255) < 26) {
  return 1;
 } else {
  return ($ch - 65 & 255) < 26 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12SpellingTrie16get_spelling_numEv($this) {
 $this = $this | 0;
 return HEAP32[$this + 8 >> 2] | 0;
}
function __ZN10ime_pinyin12SpellingTrie18get_spelling_str16Et($this, $splid) {
 $this = $this | 0;
 $splid = $splid | 0;
 var $1 = 0, $5 = 0, $6 = 0, $9 = 0, $10 = 0, $12 = 0, $pos_014 = 0, $14 = 0, $_splid = 0, $52 = 0;
 $1 = $this + 40 | 0;
 HEAP16[HEAP32[$1 >> 2] >> 1] = 0;
 if (($splid & 65535) > 29) {
  $5 = $this + 4 | 0;
  $6 = HEAP32[$5 >> 2] | 0;
  if (($6 | 0) == 0) {
   $52 = HEAP32[$1 >> 2] | 0;
   return $52 | 0;
  }
  $9 = $splid - 30 & 65535;
  $10 = $this | 0;
  $pos_014 = 0;
  $12 = $6;
  do {
   $14 = (Math_imul($12, $9) | 0) + $pos_014 | 0;
   HEAP16[(HEAP32[$1 >> 2] | 0) + ($pos_014 << 1) >> 1] = HEAP8[(HEAP32[$10 >> 2] | 0) + $14 | 0] | 0;
   $pos_014 = $pos_014 + 1 | 0;
   $12 = HEAP32[$5 >> 2] | 0;
  } while ($pos_014 >>> 0 < $12 >>> 0);
  $52 = HEAP32[$1 >> 2] | 0;
  return $52 | 0;
 }
 if (($splid << 16 >> 16 | 0) == 21) {
  HEAP16[HEAP32[$1 >> 2] >> 1] = 83;
  HEAP16[(HEAP32[$1 >> 2] | 0) + 2 >> 1] = 104;
  HEAP16[(HEAP32[$1 >> 2] | 0) + 4 >> 1] = 0;
  $52 = HEAP32[$1 >> 2] | 0;
  return $52 | 0;
 } else if (($splid << 16 >> 16 | 0) == 4) {
  HEAP16[HEAP32[$1 >> 2] >> 1] = 67;
  HEAP16[(HEAP32[$1 >> 2] | 0) + 2 >> 1] = 104;
  HEAP16[(HEAP32[$1 >> 2] | 0) + 4 >> 1] = 0;
  $52 = HEAP32[$1 >> 2] | 0;
  return $52 | 0;
 } else if (($splid << 16 >> 16 | 0) == 29) {
  HEAP16[HEAP32[$1 >> 2] >> 1] = 90;
  HEAP16[(HEAP32[$1 >> 2] | 0) + 2 >> 1] = 104;
  HEAP16[(HEAP32[$1 >> 2] | 0) + 4 >> 1] = 0;
  $52 = HEAP32[$1 >> 2] | 0;
  return $52 | 0;
 } else {
  $_splid = ((($splid & 65535) > 3) << 31 >> 31) + $splid & 65535;
  HEAP16[HEAP32[$1 >> 2] >> 1] = ($_splid + 64 & 65535) + ((($_splid & 65535) > 19) << 31 >> 31) & 65535;
  HEAP16[(HEAP32[$1 >> 2] | 0) + 2 >> 1] = 0;
  $52 = HEAP32[$1 >> 2] | 0;
  return $52 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12SpellingTrie18get_spelling_str16EtPtj($this, $splid, $splstr16, $splstr16_len) {
 $this = $this | 0;
 $splid = $splid | 0;
 $splstr16 = $splstr16 | 0;
 $splstr16_len = $splstr16_len | 0;
 var $7 = 0, $8 = 0, $9 = 0, $pos_0 = 0, $15 = 0, $18 = 0, $_splid = 0, $_0 = 0, label = 0;
 if (($splstr16 | 0) == 0 | $splstr16_len >>> 0 < 7) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (($splid & 65535) > 29) {
  $7 = $splid - 30 & 65535;
  $8 = $this + 4 | 0;
  $9 = $this | 0;
  $pos_0 = 0;
  while (1) {
   if ($pos_0 >>> 0 >= 7) {
    $_0 = 0;
    label = 2141;
    break;
   }
   $15 = (Math_imul(HEAP32[$8 >> 2] | 0, $7) | 0) + $pos_0 | 0;
   $18 = HEAP8[(HEAP32[$9 >> 2] | 0) + $15 | 0] | 0;
   HEAP16[$splstr16 + ($pos_0 << 1) >> 1] = $18 << 24 >> 24;
   if ($18 << 24 >> 24 == 0) {
    $_0 = $pos_0;
    label = 2144;
    break;
   } else {
    $pos_0 = $pos_0 + 1 | 0;
   }
  }
  if ((label | 0) == 2144) {
   return $_0 | 0;
  } else if ((label | 0) == 2141) {
   return $_0 | 0;
  }
 }
 if (($splid << 16 >> 16 | 0) == 21) {
  HEAP16[$splstr16 >> 1] = 83;
  HEAP16[$splstr16 + 2 >> 1] = 104;
  HEAP16[$splstr16 + 4 >> 1] = 0;
  $_0 = 2;
  return $_0 | 0;
 } else if (($splid << 16 >> 16 | 0) == 4) {
  HEAP16[$splstr16 >> 1] = 67;
  HEAP16[$splstr16 + 2 >> 1] = 104;
  HEAP16[$splstr16 + 4 >> 1] = 0;
  $_0 = 2;
  return $_0 | 0;
 } else if (($splid << 16 >> 16 | 0) == 29) {
  HEAP16[$splstr16 >> 1] = 90;
  HEAP16[$splstr16 + 2 >> 1] = 104;
  HEAP16[$splstr16 + 4 >> 1] = 0;
  $_0 = 2;
  return $_0 | 0;
 } else {
  $_splid = ((($splid & 65535) > 3) << 31 >> 31) + $splid & 65535;
  HEAP16[$splstr16 >> 1] = ($_splid + 64 & 65535) + ((($_splid & 65535) > 19) << 31 >> 31) & 65535;
  HEAP16[$splstr16 + 2 >> 1] = 0;
  $_0 = 1;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin4SyncC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 0;
 HEAP32[$this + 4 >> 2] = 0;
 HEAP32[$this + 8 >> 2] = 0;
 return;
}
function __ZN10ime_pinyin4Sync18get_last_got_countEv($this) {
 $this = $this | 0;
 return HEAP32[$this + 8 >> 2] | 0;
}
function _utf16_strtok($utf16_str, $token_size, $utf16_str_next) {
 $utf16_str = $utf16_str | 0;
 $token_size = $token_size | 0;
 $utf16_str_next = $utf16_str_next | 0;
 var $pos_0 = 0, $4 = 0, $5 = 0, $pos_1 = 0, $_sum = 0, $7 = 0, $8 = 0, $_0 = 0, label = 0;
 if (($utf16_str | 0) == 0 | ($token_size | 0) == 0 | ($utf16_str_next | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $pos_0 = 0;
 }
 while (1) {
  $4 = $utf16_str + ($pos_0 << 1) | 0;
  $5 = HEAP16[$4 >> 1] | 0;
  if (!(($5 << 16 >> 16 | 0) == 32 | ($5 << 16 >> 16 | 0) == 10 | ($5 << 16 >> 16 | 0) == 9)) {
   $pos_1 = 0;
   break;
  }
  $pos_0 = $pos_0 + 1 | 0;
 }
 while (1) {
  $_sum = $pos_1 + $pos_0 | 0;
  $7 = $utf16_str + ($_sum << 1) | 0;
  $8 = HEAP16[$7 >> 1] | 0;
  if (($8 << 16 >> 16 | 0) == 9 | ($8 << 16 >> 16 | 0) == 10 | ($8 << 16 >> 16 | 0) == 32) {
   label = 2153;
   break;
  } else if (($8 << 16 >> 16 | 0) == 0) {
   label = 2152;
   break;
  }
  $pos_1 = $pos_1 + 1 | 0;
 }
 do {
  if ((label | 0) == 2153) {
   HEAP32[$utf16_str_next >> 2] = $utf16_str + ($_sum + 1 << 1);
  } else if ((label | 0) == 2152) {
   HEAP32[$utf16_str_next >> 2] = 0;
   if (($pos_1 | 0) == 0) {
    $_0 = 0;
   } else {
    break;
   }
   return $_0 | 0;
  }
 } while (0);
 HEAP16[$7 >> 1] = 0;
 HEAP32[$token_size >> 2] = $pos_1;
 $_0 = $4;
 return $_0 | 0;
}
function _utf16_atoi($utf16_str) {
 $utf16_str = $utf16_str | 0;
 var $4 = 0, $_ = 0, $_11 = 0, $6 = 0, $8 = 0, $pos_014 = 0, $value_013 = 0, $12 = 0, $13 = 0, $15 = 0, $value_0_lcssa = 0, $_0 = 0;
 if (($utf16_str | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $4 = (HEAP16[$utf16_str >> 1] | 0) == 45;
 $_ = $4 ? -1 : 1;
 $_11 = $4 & 1;
 $6 = HEAP16[$utf16_str + ($_11 << 1) >> 1] | 0;
 if (($6 - 48 & 65535) < 10) {
  $value_013 = 0;
  $pos_014 = $_11;
  $8 = $6;
  while (1) {
   $12 = ($value_013 * 10 | 0) - 48 + ($8 & 65535) | 0;
   $13 = $pos_014 + 1 | 0;
   $15 = HEAP16[$utf16_str + ($13 << 1) >> 1] | 0;
   if (($15 - 48 & 65535) < 10) {
    $value_013 = $12;
    $pos_014 = $13;
    $8 = $15;
   } else {
    $value_0_lcssa = $12;
    break;
   }
  }
 } else {
  $value_0_lcssa = 0;
 }
 $_0 = Math_imul($value_0_lcssa, $_) | 0;
 return $_0 | 0;
}
function _utf16_strlen($utf16_str) {
 $utf16_str = $utf16_str | 0;
 var $size_0 = 0, $_0 = 0;
 if (($utf16_str | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $size_0 = 0;
 }
 while (1) {
  if ((HEAP16[$utf16_str + ($size_0 << 1) >> 1] | 0) == 0) {
   $_0 = $size_0;
   break;
  } else {
   $size_0 = $size_0 + 1 | 0;
  }
 }
 return $_0 | 0;
}
function __ZN10ime_pinyin12SpellingTrie10get_ym_strEPKc($this, $spl_str) {
 $this = $this | 0;
 $spl_str = $spl_str | 0;
 var $1 = 0, $7 = 0, $_0 = 0;
 $1 = HEAP8[$spl_str] | 0;
 if (!(__ZNK10ime_pinyin12SpellingTrie15is_shengmu_charEc(0, $1) | 0)) {
  $_0 = $spl_str;
  return $_0 | 0;
 }
 if (($1 << 24 >> 24 | 0) == 90 | ($1 << 24 >> 24 | 0) == 67 | ($1 << 24 >> 24 | 0) == 83) {
  $7 = $spl_str + 1 | 0;
  return ((HEAP8[$7] | 0) == 104 ? $spl_str + 2 | 0 : $7) | 0;
 }
 $_0 = $spl_str + 1 | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin12SpellingTrie16get_spelling_strEt($this, $splid) {
 $this = $this | 0;
 $splid = $splid | 0;
 var $1 = 0, $6 = 0, $8 = 0, $10 = 0, $13 = 0, $22 = 0, $24 = 0, $_splid = 0, $_1_off0 = 0, $43 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $this + 36 | 0;
 HEAP8[HEAP32[$1 >> 2] | 0] = 0;
 if (($splid & 65535) > 29) {
  $6 = HEAP32[$1 >> 2] | 0;
  $8 = HEAP32[$this + 4 >> 2] | 0;
  $10 = HEAP32[$this >> 2] | 0;
  $13 = $10 + (Math_imul($8, $splid - 30 & 65535) | 0) | 0;
  _snprintf($6 | 0, $8 | 0, 896, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $13, tempInt) | 0) | 0;
  $43 = HEAP32[$1 >> 2] | 0;
  STACKTOP = sp;
  return $43 | 0;
 }
 if (($splid << 16 >> 16 | 0) == 21) {
  $22 = HEAP32[$1 >> 2] | 0;
  $24 = HEAP32[$this + 4 >> 2] | 0;
  _snprintf($22 | 0, $24 | 0, 896, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = 576, tempInt) | 0) | 0;
  $43 = HEAP32[$1 >> 2] | 0;
  STACKTOP = sp;
  return $43 | 0;
 } else if (($splid << 16 >> 16 | 0) == 4) {
  _snprintf(HEAP32[$1 >> 2] | 0, HEAP32[$this + 4 >> 2] | 0, 896, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = 728, tempInt) | 0) | 0;
  $43 = HEAP32[$1 >> 2] | 0;
  STACKTOP = sp;
  return $43 | 0;
 } else if (($splid << 16 >> 16 | 0) == 29) {
  _snprintf(HEAP32[$1 >> 2] | 0, HEAP32[$this + 4 >> 2] | 0, 896, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = 4368, tempInt) | 0) | 0;
  $43 = HEAP32[$1 >> 2] | 0;
  STACKTOP = sp;
  return $43 | 0;
 } else {
  $_splid = ((($splid & 65535) > 3) << 31 >> 31) + $splid & 65535;
  if (($_splid & 65535) > 19) {
   $_1_off0 = $_splid + 255 & 255;
  } else {
   $_1_off0 = $_splid & 255;
  }
  HEAP8[HEAP32[$1 >> 2] | 0] = $_1_off0 + 64 & 255;
  HEAP8[(HEAP32[$1 >> 2] | 0) + 1 | 0] = 0;
  $43 = HEAP32[$1 >> 2] | 0;
  STACKTOP = sp;
  return $43 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12SpellingTrie9get_ym_idEPKc($this, $ym_str) {
 $this = $this | 0;
 $ym_str = $ym_str | 0;
 var $3 = 0, $7 = 0, $8 = 0, $pos_0 = 0, $10 = 0, $13 = 0, $19 = 0, $_0 = 0, label = 0;
 if (($ym_str | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this + 24 | 0;
 if ((HEAP32[$3 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = HEAP32[$this + 32 >> 2] | 0;
 $8 = $this + 28 | 0;
 $pos_0 = 0;
 while (1) {
  $10 = $pos_0 & 255;
  if ($10 >>> 0 >= $7 >>> 0) {
   $_0 = 0;
   label = 2202;
   break;
  }
  $13 = HEAP32[$3 >> 2] | 0;
  $19 = $pos_0 + 1 & 255;
  if ((_strcmp($13 + (Math_imul(HEAP32[$8 >> 2] | 0, $10) | 0) | 0, $ym_str | 0) | 0) == 0) {
   $_0 = $19;
   label = 2201;
   break;
  } else {
   $pos_0 = $19;
  }
 }
 if ((label | 0) == 2202) {
  return $_0 | 0;
 } else if ((label | 0) == 2201) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12SpellingTrie13save_spl_trieEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $3 = 0, $7 = 0, $12 = 0, $29 = 0, $_0 = 0;
 if (($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this | 0;
 if ((HEAP32[$3 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = $this + 4 | 0;
 if ((_fwrite($7 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $12 = $this + 8 | 0;
 if ((_fwrite($12 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite($this + 12 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite($this + 16 | 0, 1, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $29 = _fwrite(HEAP32[$3 >> 2] | 0, HEAP32[$7 >> 2] | 0, HEAP32[$12 >> 2] | 0, $fp | 0) | 0;
 $_0 = ($29 | 0) == (HEAP32[$12 >> 2] | 0);
 return $_0 | 0;
}
function __ZN10ime_pinyin12SpellingTrie13load_spl_trieEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $3 = 0, $8 = 0, $13 = 0, $18 = 0, $22 = 0, $23 = 0, $30 = 0, $35 = 0, $36 = 0, $_0 = 0;
 if (($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this + 4 | 0;
 if ((_fread($3 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = $this + 8 | 0;
 if ((_fread($8 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $13 = $this + 12 | 0;
 if ((_fread($13 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $18 = $this + 16 | 0;
 if ((_fread($18 | 0, 1, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $22 = $this | 0;
 $23 = HEAP32[$22 >> 2] | 0;
 if (($23 | 0) != 0) {
  __ZdaPv($23);
 }
 $30 = __Znaj(Math_imul(HEAP32[$8 >> 2] | 0, HEAP32[$3 >> 2] | 0) | 0) | 0;
 HEAP32[$22 >> 2] = $30;
 if (($30 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $35 = _fread($30 | 0, HEAP32[$3 >> 2] | 0, HEAP32[$8 >> 2] | 0, $fp | 0) | 0;
 $36 = HEAP32[$8 >> 2] | 0;
 if (($35 | 0) != ($36 | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin12SpellingTrie9constructEPKcjjfh($this, HEAP32[$22 >> 2] | 0, HEAP32[$3 >> 2] | 0, $36, +HEAPF32[$13 >> 2], HEAP8[$18] | 0) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin4Sync5beginEPKc($this, $filename) {
 $this = $this | 0;
 $filename = $filename | 0;
 var $1 = 0, $8 = 0, $9 = 0, $12 = 0, $13 = 0, $26 = 0, $27 = 0, $_0 = 0;
 $1 = $this | 0;
 if ((HEAP32[$1 >> 2] | 0) != 0) {
  __ZN10ime_pinyin4Sync6finishEv($this);
 }
 if (($filename | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = _strdup($filename | 0) | 0;
 $9 = $this + 4 | 0;
 HEAP32[$9 >> 2] = $8;
 if (($8 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $12 = __Znwj(1132) | 0;
 $13 = $12;
 __ZN10ime_pinyin8UserDictC2Ev($13);
 HEAP32[$1 >> 2] = $13;
 if (($12 | 0) == 0) {
  _free(HEAP32[$9 >> 2] | 0);
  HEAP32[$9 >> 2] = 0;
  $_0 = 0;
  return $_0 | 0;
 }
 $26 = FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$12 >> 2] | 0) + 8 >> 2] & 31]($13, HEAP32[$9 >> 2] | 0, 500001, 6e5) | 0;
 $27 = HEAP32[$1 >> 2] | 0;
 if ($26) {
  __ZN10ime_pinyin8UserDict9set_limitEjjj($27, 5e3, 2e5, 20);
  $_0 = 1;
  return $_0 | 0;
 }
 if (($27 | 0) != 0) {
  FUNCTION_TABLE_vi[HEAP32[(HEAP32[$27 >> 2] | 0) + 4 >> 2] & 127]($27);
 }
 HEAP32[$1 >> 2] = 0;
 _free(HEAP32[$9 >> 2] | 0);
 HEAP32[$9 >> 2] = 0;
 $_0 = 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin4Sync6finishEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $10 = 0, $18 = 0;
 $1 = $this | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) == 0) {
  return;
 }
 FUNCTION_TABLE_ii[HEAP32[(HEAP32[$2 >> 2] | 0) + 12 >> 2] & 31]($2) | 0;
 $10 = HEAP32[$1 >> 2] | 0;
 if (($10 | 0) != 0) {
  FUNCTION_TABLE_vi[HEAP32[(HEAP32[$10 >> 2] | 0) + 4 >> 2] & 127]($10);
 }
 HEAP32[$1 >> 2] = 0;
 $18 = $this + 4 | 0;
 _free(HEAP32[$18 >> 2] | 0);
 HEAP32[$18 >> 2] = 0;
 HEAP32[$this + 8 >> 2] = 0;
 return;
}
function __ZN10ime_pinyin4Sync10put_lemmasEPti($this, $lemmas, $len) {
 $this = $this | 0;
 $lemmas = $lemmas | 0;
 $len = $len | 0;
 return __ZN10ime_pinyin8UserDict38put_lemmas_no_sync_from_utf16le_stringEPti(HEAP32[$this >> 2] | 0, $lemmas, $len) | 0;
}
function __ZN10ime_pinyin4Sync10get_lemmasEPti($this, $str, $size) {
 $this = $this | 0;
 $str = $str | 0;
 $size = $size | 0;
 return __ZN10ime_pinyin8UserDict48get_sync_lemmas_in_utf16le_string_from_beginningEPtiPi(HEAP32[$this >> 2] | 0, $str, $size, $this + 8 | 0) | 0;
}
function __ZN10ime_pinyin4Sync15get_total_countEv($this) {
 $this = $this | 0;
 return __ZN10ime_pinyin8UserDict14get_sync_countEv(HEAP32[$this >> 2] | 0) | 0;
}
function __ZN10ime_pinyin4Sync14clear_last_gotEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0;
 $1 = $this + 8 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) < 0) {
  return;
 }
 __ZN10ime_pinyin8UserDict17clear_sync_lemmasEjj(HEAP32[$this >> 2] | 0, 0, $2);
 HEAP32[$1 >> 2] = 0;
 return;
}
function __ZN10ime_pinyin4Sync12get_capacityEv($this) {
 $this = $this | 0;
 var $stat = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64 | 0;
 $stat = sp | 0;
 __ZN10ime_pinyin8UserDict5stateEPNS0_12UserDictStatE(HEAP32[$this >> 2] | 0, $stat) | 0;
 STACKTOP = sp;
 return (HEAP32[$stat + 52 >> 2] | 0) - (HEAP32[$stat + 28 >> 2] | 0) | 0;
}
function _utf16_atof($utf16_str) {
 $utf16_str = $utf16_str | 0;
 var $4 = 0, $_0 = 0.0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256 | 0;
 if ((_utf16_strlen($utf16_str) | 0) >>> 0 > 255) {
  $_0 = 0.0;
  STACKTOP = sp;
  return +$_0;
 }
 $4 = sp | 0;
 _utf16_strcpy_tochar($4, $utf16_str) | 0;
 $_0 = +_atof($4);
 STACKTOP = sp;
 return +$_0;
}
function __ZN10ime_pinyin12SpellingTrie13build_ym_infoEv($this) {
 $this = $this | 0;
 var $ym_item_size = 0, $ym_num = 0, $1 = 0, $2 = 0, $5 = 0, $8 = 0, $9 = 0, $16 = 0, $pos_024 = 0, $17 = 0, $21 = 0, $32 = 0, $33 = 0, $34 = 0, $41 = 0, $54 = 0, $63 = 0, $64 = 0, $74 = 0, $82 = 0, $id_022 = 0, $84 = 0, $88 = 0, $97 = 0, $98 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $ym_item_size = sp | 0;
 $ym_num = sp + 8 | 0;
 $1 = __Znwj(56) | 0;
 $2 = $1;
 __ZN10ime_pinyin13SpellingTableC2Ev($2);
 if (!(__ZN10ime_pinyin13SpellingTable10init_tableEjjb($2, 5, 128, 0) | 0)) {
  ___assert_func(3376, 372, 6536, 2912);
  return 0;
 }
 $5 = $this + 8 | 0;
 L2903 : do {
  if ((HEAP32[$5 >> 2] | 0) != 0) {
   $8 = $this | 0;
   $9 = $this + 4 | 0;
   $pos_024 = 0;
   $16 = 0;
   while (1) {
    $17 = HEAP32[$8 >> 2] | 0;
    $21 = __ZN10ime_pinyin12SpellingTrie10get_ym_strEPKc(0, $17 + (Math_imul(HEAP32[$9 >> 2] | 0, $16) | 0) | 0) | 0;
    if ((HEAP8[$21] | 0) != 0) {
     if (!(__ZN10ime_pinyin13SpellingTable12put_spellingEPKcd($2, $21, 0.0) | 0)) {
      break;
     }
    }
    $pos_024 = $pos_024 + 1 & 65535;
    $16 = $pos_024 & 65535;
    if ($16 >>> 0 >= (HEAP32[$5 >> 2] | 0) >>> 0) {
     break L2903;
    }
   }
   ___assert_func(3376, 379, 6536, 2912);
   return 0;
  }
 } while (0);
 $32 = __ZN10ime_pinyin13SpellingTable7arrangeEPjS1_($2, $ym_item_size, $ym_num) | 0;
 $33 = $this + 24 | 0;
 $34 = HEAP32[$33 >> 2] | 0;
 if (($34 | 0) != 0) {
  __ZdaPv($34);
 }
 $41 = __Znaj(Math_imul(HEAP32[$ym_num >> 2] | 0, HEAP32[$ym_item_size >> 2] | 0) | 0) | 0;
 HEAP32[$33 >> 2] = $41;
 if (($41 | 0) == 0) {
  if (($1 | 0) == 0) {
   $_0 = 0;
   STACKTOP = sp;
   return $_0 | 0;
  }
  __ZN10ime_pinyin13SpellingTableD2Ev($2);
  __ZdlPv($1);
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $54 = Math_imul(HEAP32[$ym_num >> 2] | 0, HEAP32[$ym_item_size >> 2] | 0) | 0;
 _memcpy($41 | 0, $32 | 0, $54) | 0;
 HEAP32[$this + 28 >> 2] = HEAP32[$ym_item_size >> 2];
 HEAP32[$this + 32 >> 2] = HEAP32[$ym_num >> 2];
 if (($1 | 0) != 0) {
  __ZN10ime_pinyin13SpellingTableD2Ev($2);
  __ZdlPv($1);
 }
 $63 = $this + 20 | 0;
 $64 = HEAP32[$63 >> 2] | 0;
 if (($64 | 0) != 0) {
  __ZdlPv($64);
 }
 $74 = __Znaj((HEAP32[$5 >> 2] | 0) + 30 | 0) | 0;
 HEAP32[$63 >> 2] = $74;
 if (($74 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 _memset($74 | 0, 0, (HEAP32[$5 >> 2] | 0) + 30 | 0);
 if (((HEAP32[$5 >> 2] | 0) + 30 | 0) >>> 0 > 1) {
  $id_022 = 1;
  $82 = 1;
 } else {
  $_0 = 1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 while (1) {
  $84 = __ZN10ime_pinyin12SpellingTrie10get_ym_strEPKc(0, __ZN10ime_pinyin12SpellingTrie16get_spelling_strEt($this, $id_022) | 0) | 0;
  if ((HEAP8[$84] | 0) == 0) {
   HEAP8[(HEAP32[$63 >> 2] | 0) + $82 | 0] = 0;
  } else {
   $88 = __ZN10ime_pinyin12SpellingTrie9get_ym_idEPKc($this, $84) | 0;
   HEAP8[(HEAP32[$63 >> 2] | 0) + $82 | 0] = $88;
   if ($88 << 24 >> 24 == 0) {
    label = 2304;
    break;
   }
  }
  $97 = $id_022 + 1 & 65535;
  $98 = $97 & 65535;
  if ($98 >>> 0 < ((HEAP32[$5 >> 2] | 0) + 30 | 0) >>> 0) {
   $id_022 = $97;
   $82 = $98;
  } else {
   $_0 = 1;
   label = 2311;
   break;
  }
 }
 if ((label | 0) == 2304) {
  ___assert_func(3376, 418, 6536, 1992);
  return 0;
 } else if ((label | 0) == 2311) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function _utf16_strcpy_tochar($dst, $src) {
 $dst = $dst | 0;
 $src = $src | 0;
 var $3 = 0, $cp_011 = 0, $_010 = 0, $6 = 0, $7 = 0, $8 = 0, $_09 = 0;
 if (($src | 0) == 0 | ($dst | 0) == 0) {
  $_09 = 0;
  return $_09 | 0;
 }
 $3 = HEAP16[$src >> 1] | 0;
 HEAP8[$dst] = $3 & 255;
 if ($3 << 16 >> 16 == 0) {
  $_09 = $dst;
  return $_09 | 0;
 } else {
  $_010 = $src;
  $cp_011 = $dst;
 }
 while (1) {
  $6 = $cp_011 + 1 | 0;
  $7 = $_010 + 2 | 0;
  $8 = HEAP16[$7 >> 1] | 0;
  HEAP8[$6] = $8 & 255;
  if ($8 << 16 >> 16 == 0) {
   $_09 = $dst;
   break;
  } else {
   $_010 = $7;
   $cp_011 = $6;
  }
 }
 return $_09 | 0;
}
function _utf16_strcmp($str1, $str2) {
 $str1 = $str1 | 0;
 $str2 = $str2 | 0;
 var $pos_0 = 0, $3 = 0, $5 = 0;
 $pos_0 = 0;
 while (1) {
  $3 = HEAP16[$str1 + ($pos_0 << 1) >> 1] | 0;
  $5 = HEAP16[$str2 + ($pos_0 << 1) >> 1] | 0;
  if ($3 << 16 >> 16 == $5 << 16 >> 16 & $3 << 16 >> 16 != 0) {
   $pos_0 = $pos_0 + 1 | 0;
  } else {
   break;
  }
 }
 return ($3 & 65535) - ($5 & 65535) | 0;
}
function _utf16_strncmp($str1, $str2, $size) {
 $str1 = $str1 | 0;
 $str2 = $str2 | 0;
 $size = $size | 0;
 var $pos_0 = 0, $5 = 0, $_0 = 0;
 $pos_0 = 0;
 while (1) {
  if ($pos_0 >>> 0 >= $size >>> 0) {
   break;
  }
  $5 = HEAP16[$str1 + ($pos_0 << 1) >> 1] | 0;
  if ($5 << 16 >> 16 == (HEAP16[$str2 + ($pos_0 << 1) >> 1] | 0) & $5 << 16 >> 16 != 0) {
   $pos_0 = $pos_0 + 1 | 0;
  } else {
   break;
  }
 }
 if (($pos_0 | 0) == ($size | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = (HEAPU16[$str1 + ($pos_0 << 1) >> 1] | 0) - (HEAPU16[$str2 + ($pos_0 << 1) >> 1] | 0) | 0;
 return $_0 | 0;
}
function _utf16_strcpy($dst, $src) {
 $dst = $dst | 0;
 $src = $src | 0;
 var $3 = 0, $cp_011 = 0, $_010 = 0, $5 = 0, $6 = 0, $7 = 0, $_09 = 0;
 if (($src | 0) == 0 | ($dst | 0) == 0) {
  $_09 = 0;
  return $_09 | 0;
 }
 $3 = HEAP16[$src >> 1] | 0;
 HEAP16[$dst >> 1] = $3;
 if ($3 << 16 >> 16 == 0) {
  $_09 = $dst;
  return $_09 | 0;
 } else {
  $_010 = $src;
  $cp_011 = $dst;
 }
 while (1) {
  $5 = $cp_011 + 2 | 0;
  $6 = $_010 + 2 | 0;
  $7 = HEAP16[$6 >> 1] | 0;
  HEAP16[$5 >> 1] = $7;
  if ($7 << 16 >> 16 == 0) {
   $_09 = $dst;
   break;
  } else {
   $_010 = $6;
   $cp_011 = $5;
  }
 }
 return $_09 | 0;
}
function _utf16_strncpy($dst, $src, $size) {
 $dst = $dst | 0;
 $src = $src | 0;
 $size = $size | 0;
 var $_025 = 0, $_0 = 0, $cp_0 = 0, $17 = 0, $_027 = 0;
 L2976 : do {
  if (($src | 0) == 0 | ($dst | 0) == 0 | ($size | 0) == 0) {
   $_027 = 0;
  } else {
   if (($src | 0) == ($dst | 0)) {
    $_027 = $dst;
    break;
   }
   if ($dst >>> 0 < $src >>> 0) {
    $cp_0 = $dst;
    $_0 = $size;
    $_025 = $src;
   } else {
    if ($dst >>> 0 <= $src >>> 0) {
     $_027 = $dst;
     break;
    }
    if (($src + ($size << 1) | 0) >>> 0 > $dst >>> 0) {
     $_027 = $dst;
     break;
    } else {
     $cp_0 = $dst;
     $_0 = $size;
     $_025 = $src;
    }
   }
   while (1) {
    if (($_0 | 0) == 0) {
     $_027 = $dst;
     break L2976;
    }
    $17 = HEAP16[$_025 >> 1] | 0;
    HEAP16[$cp_0 >> 1] = $17;
    if ($17 << 16 >> 16 == 0) {
     $_027 = $dst;
     break;
    } else {
     $cp_0 = $cp_0 + 2 | 0;
     $_0 = $_0 - 1 | 0;
     $_025 = $_025 + 2 | 0;
    }
   }
  }
 } while (0);
 return $_027 | 0;
}
function __ZN10ime_pinyin8DictList13get_lemma_strEjPtt($this, $id_lemma, $str_buf, $str_max) {
 $this = $this | 0;
 $id_lemma = $id_lemma | 0;
 $str_buf = $str_buf | 0;
 $str_max = $str_max | 0;
 var $13 = 0, $17 = 0, $_lcssa = 0, $_lcssa33 = 0, $i_029_lcssa32 = 0, $_lcssa31 = 0, $26 = 0, $28 = 0, $_sum = 0, $31 = 0, $len_025 = 0, $35 = 0, $_0 = 0, $45 = 0, $55 = 0, $65 = 0, $75 = 0, $85 = 0, $95 = 0, $105 = 0, label = 0;
 if ((HEAP8[$this | 0] & 1) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 92 >> 2] | 0) >>> 0 <= $id_lemma >>> 0 | ($str_buf | 0) == 0 | ($str_max & 65535) < 2) {
  $_0 = 0;
  return $_0 | 0;
 }
 $13 = ($str_max & 65535) - 1 | 0;
 if (($13 | 0) < 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $17 = HEAP32[$this + 60 >> 2] | 0;
 if ($17 >>> 0 > $id_lemma >>> 0) {
  label = 2355;
 } else {
  if ((HEAP32[$this + 64 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
   $_lcssa31 = 0;
   $i_029_lcssa32 = 0;
   $_lcssa33 = 1;
   $_lcssa = $17;
  } else {
   label = 2355;
  }
 }
 do {
  if ((label | 0) == 2355) {
   if (($13 | 0) < 2) {
    $_0 = 0;
    return $_0 | 0;
   }
   $45 = HEAP32[$this + 64 >> 2] | 0;
   if ($45 >>> 0 <= $id_lemma >>> 0) {
    if ((HEAP32[$this + 68 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
     $_lcssa31 = 1;
     $i_029_lcssa32 = 1;
     $_lcssa33 = 2;
     $_lcssa = $45;
     break;
    }
   }
   if (($13 | 0) < 3) {
    $_0 = 0;
    return $_0 | 0;
   }
   $55 = HEAP32[$this + 68 >> 2] | 0;
   if ($55 >>> 0 <= $id_lemma >>> 0) {
    if ((HEAP32[$this + 72 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
     $_lcssa31 = 2;
     $i_029_lcssa32 = 2;
     $_lcssa33 = 3;
     $_lcssa = $55;
     break;
    }
   }
   if (($13 | 0) < 4) {
    $_0 = 0;
    return $_0 | 0;
   }
   $65 = HEAP32[$this + 72 >> 2] | 0;
   if ($65 >>> 0 <= $id_lemma >>> 0) {
    if ((HEAP32[$this + 76 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
     $_lcssa31 = 3;
     $i_029_lcssa32 = 3;
     $_lcssa33 = 4;
     $_lcssa = $65;
     break;
    }
   }
   if (($13 | 0) < 5) {
    $_0 = 0;
    return $_0 | 0;
   }
   $75 = HEAP32[$this + 76 >> 2] | 0;
   if ($75 >>> 0 <= $id_lemma >>> 0) {
    if ((HEAP32[$this + 80 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
     $_lcssa31 = 4;
     $i_029_lcssa32 = 4;
     $_lcssa33 = 5;
     $_lcssa = $75;
     break;
    }
   }
   if (($13 | 0) < 6) {
    $_0 = 0;
    return $_0 | 0;
   }
   $85 = HEAP32[$this + 80 >> 2] | 0;
   if ($85 >>> 0 <= $id_lemma >>> 0) {
    if ((HEAP32[$this + 84 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
     $_lcssa31 = 5;
     $i_029_lcssa32 = 5;
     $_lcssa33 = 6;
     $_lcssa = $85;
     break;
    }
   }
   if (($13 | 0) < 7) {
    $_0 = 0;
    return $_0 | 0;
   }
   $95 = HEAP32[$this + 84 >> 2] | 0;
   if ($95 >>> 0 <= $id_lemma >>> 0) {
    if ((HEAP32[$this + 88 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
     $_lcssa31 = 6;
     $i_029_lcssa32 = 6;
     $_lcssa33 = 7;
     $_lcssa = $95;
     break;
    }
   }
   if (($13 | 0) < 8) {
    $_0 = 0;
    return $_0 | 0;
   }
   $105 = HEAP32[$this + 88 >> 2] | 0;
   if ($105 >>> 0 > $id_lemma >>> 0) {
    $_0 = 0;
    return $_0 | 0;
   }
   if ((HEAP32[$this + 92 >> 2] | 0) >>> 0 > $id_lemma >>> 0) {
    $_lcssa31 = 7;
    $i_029_lcssa32 = 7;
    $_lcssa33 = 8;
    $_lcssa = $105;
    break;
   } else {
    $_0 = 0;
   }
   return $_0 | 0;
  }
 } while (0);
 $26 = HEAP32[$this + 20 >> 2] | 0;
 $28 = HEAP32[$this + 24 + ($_lcssa31 << 2) >> 2] | 0;
 $_sum = $28 + (Math_imul($id_lemma - $_lcssa | 0, $_lcssa33) | 0) | 0;
 $len_025 = 0;
 $31 = 0;
 while (1) {
  HEAP16[$str_buf + ($31 << 1) >> 1] = HEAP16[$26 + ($_sum + $31 << 1) >> 1] | 0;
  $35 = $len_025 + 1 & 65535;
  if (($35 & 65535) > ($i_029_lcssa32 & 65535)) {
   break;
  } else {
   $len_025 = $35;
   $31 = $35 & 65535;
  }
 }
 HEAP16[$str_buf + ($_lcssa33 << 1) >> 1] = 0;
 $_0 = $_lcssa33 & 65535;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictListC2Ev($this) {
 $this = $this | 0;
 HEAP8[$this | 0] = 0;
 _memset($this + 8 | 0, 0, 16);
 HEAP32[$this + 4 >> 2] = __ZN10ime_pinyin12SpellingTrie14get_cpinstanceEv() | 0;
 HEAP32[$this + 96 >> 2] = 16;
 HEAP32[$this + 100 >> 2] = 20;
 HEAP32[$this + 104 >> 2] = 10;
 HEAP32[$this + 108 >> 2] = 12;
 HEAP32[$this + 112 >> 2] = 8;
 HEAP32[$this + 116 >> 2] = 36;
 HEAP32[$this + 120 >> 2] = 48;
 HEAP32[$this + 124 >> 2] = 40;
 return;
}
function __ZN10ime_pinyin8DictListD2Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin8DictList13free_resourceEv($this);
 return;
}
function __ZN10ime_pinyin8DictList13free_resourceEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $7 = 0, $8 = 0, $13 = 0, $14 = 0;
 $1 = $this + 20 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) != 0) {
  _free($2);
 }
 HEAP32[$1 >> 2] = 0;
 $7 = $this + 12 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 if (($8 | 0) != 0) {
  _free($8);
 }
 HEAP32[$7 >> 2] = 0;
 $13 = $this + 16 | 0;
 $14 = HEAP32[$13 >> 2] | 0;
 if (($14 | 0) == 0) {
  HEAP32[$13 >> 2] = 0;
  return;
 }
 _free($14 | 0);
 HEAP32[$13 >> 2] = 0;
 return;
}
function __ZN10ime_pinyin8DictList14alloc_resourceEjj($this, $buf_size, $scis_num) {
 $this = $this | 0;
 $buf_size = $buf_size | 0;
 $scis_num = $scis_num | 0;
 var $2 = 0, $7 = 0, $9 = 0, $16 = 0, $_0 = 0;
 $2 = _malloc($buf_size << 1) | 0;
 HEAP32[$this + 20 >> 2] = $2;
 if (($2 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = $this + 8 | 0;
 HEAP32[$7 >> 2] = $scis_num;
 $9 = _malloc($scis_num << 1) | 0;
 HEAP32[$this + 12 >> 2] = $9;
 if (($9 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $16 = _malloc(HEAP32[$7 >> 2] << 1) | 0;
 HEAP32[$this + 16 >> 2] = $16;
 $_0 = ($16 | 0) != 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictList9init_listEPKNS_14SingleCharItemEjPKNS_10LemmaEntryEj($this, $scis, $scis_num, $lemma_arr, $lemma_num) {
 $this = $this | 0;
 $scis = $scis | 0;
 $scis_num = $scis_num | 0;
 $lemma_arr = $lemma_arr | 0;
 $lemma_num = $lemma_num | 0;
 var $6 = 0, $8 = 0, $13 = 0, $_0 = 0;
 if (($scis | 0) == 0 | ($scis_num | 0) == 0 | ($lemma_arr | 0) == 0 | ($lemma_num | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $6 = $this | 0;
 HEAP8[$6] = 0;
 $8 = HEAP32[$this + 20 >> 2] | 0;
 if (($8 | 0) != 0) {
  _free($8);
 }
 $13 = __ZN10ime_pinyin8DictList14calculate_sizeEPKNS_10LemmaEntryEj($this, $lemma_arr, $lemma_num) | 0;
 if (($13 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin8DictList14alloc_resourceEjj($this, $13, $scis_num) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin8DictList9fill_scisEPKNS_14SingleCharItemEj($this, $scis, $scis_num);
 __ZN10ime_pinyin8DictList9fill_listEPKNS_10LemmaEntryEj($this, $lemma_arr, $lemma_num);
 HEAP8[$6] = 1;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictList21find_pos2_startedbyhzEt($this, $hz_char) {
 $this = $this | 0;
 $hz_char = $hz_char | 0;
 var $1 = 0, $3 = 0, $5 = 0, $6 = 0, $13 = 0, $18 = 0, $found_2w_0 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $1 = sp | 0;
 HEAP16[$1 >> 1] = $hz_char;
 $3 = $this + 20 | 0;
 $5 = $this + 28 | 0;
 $6 = HEAP32[$5 >> 2] | 0;
 $13 = __ZN10ime_pinyin9mybsearchEPKvS1_jjPFiS1_S1_E($1, (HEAP32[$3 >> 2] | 0) + ($6 << 1) | 0, ((HEAP32[$this + 32 >> 2] | 0) - $6 | 0) >>> 1, 4, 16) | 0;
 if (($13 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $18 = (HEAP32[$3 >> 2] | 0) + (HEAP32[$5 >> 2] << 1) | 0;
 $found_2w_0 = $13;
 while (1) {
  if ($found_2w_0 >>> 0 <= $18 >>> 0) {
   $_0 = $found_2w_0;
   label = 2426;
   break;
  }
  if ((HEAP16[$found_2w_0 >> 1] | 0) == (HEAP16[$found_2w_0 - 2 >> 1] | 0)) {
   $found_2w_0 = $found_2w_0 - 4 | 0;
  } else {
   $_0 = $found_2w_0;
   label = 2424;
   break;
  }
 }
 if ((label | 0) == 2426) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2424) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictList21find_pos_startedbyhzsEPKtjPFiPKvS4_E($this, $last_hzs, $word_len, $cmp_func) {
 $this = $this | 0;
 $last_hzs = $last_hzs | 0;
 $word_len = $word_len | 0;
 $cmp_func = $cmp_func | 0;
 var $2 = 0, $5 = 0, $6 = 0, $14 = 0, $17 = 0, $found_w_0 = 0, $25 = 0, $_0 = 0, label = 0;
 $2 = $this + 20 | 0;
 $5 = $this + 24 + ($word_len - 1 << 2) | 0;
 $6 = HEAP32[$5 >> 2] | 0;
 $14 = __ZN10ime_pinyin9mybsearchEPKvS1_jjPFiS1_S1_E($last_hzs, (HEAP32[$2 >> 2] | 0) + ($6 << 1) | 0, (((HEAP32[$this + 24 + ($word_len << 2) >> 2] | 0) - $6 | 0) >>> 0) / ($word_len >>> 0) | 0, $word_len << 1, $cmp_func) | 0;
 if (($14 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $17 = -$word_len | 0;
 $found_w_0 = $14;
 while (1) {
  if ($found_w_0 >>> 0 <= ((HEAP32[$2 >> 2] | 0) + (HEAP32[$5 >> 2] << 1) | 0) >>> 0) {
   $_0 = $found_w_0;
   label = 2434;
   break;
  }
  $25 = $found_w_0 + ($17 << 1) | 0;
  if ((FUNCTION_TABLE_iii[$cmp_func & 63]($found_w_0, $25) | 0) == 0) {
   $found_w_0 = $25;
  } else {
   $_0 = $found_w_0;
   label = 2433;
   break;
  }
 }
 if ((label | 0) == 2433) {
  return $_0 | 0;
 } else if ((label | 0) == 2434) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictList14calculate_sizeEPKNS_10LemmaEntryEj($this, $lemma_arr, $lemma_num) {
 $this = $this | 0;
 $lemma_arr = $lemma_arr | 0;
 $lemma_num = $lemma_num | 0;
 var $2 = 0, $3 = 0, $4 = 0, $list_size_0_lcssa66 = 0, $id_num_0_lcssa65 = 0, $last_hz_len_0_lcssa64 = 0, $6 = 0, $7 = 0, $last_hz_len_054 = 0, $i_053 = 0, $id_num_052 = 0, $list_size_051 = 0, $11 = 0, $12 = 0, $21 = 0, $28 = 0, $len_039 = 0, $33 = 0, $43 = 0, $list_size_1 = 0, $id_num_1 = 0, $last_hz_len_1 = 0, $47 = 0, $i1_037 = 0, $55 = 0, $57 = 0, $58 = 0, label = 0;
 do {
  if (($lemma_num | 0) == 0) {
   $last_hz_len_0_lcssa64 = 0;
   $id_num_0_lcssa65 = 0;
   $list_size_0_lcssa66 = 0;
  } else {
   $2 = $lemma_arr + 4 | 0;
   $3 = $this + 24 | 0;
   $4 = $this + 60 | 0;
   $list_size_051 = 0;
   $id_num_052 = 0;
   $i_053 = 0;
   $last_hz_len_054 = 0;
   L3106 : while (1) {
    $11 = HEAP8[$lemma_arr + ($i_053 * 124 | 0) + 116 | 0] | 0;
    $12 = $11 & 255;
    do {
     if (($i_053 | 0) == 0) {
      if ($11 << 24 >> 24 == 0) {
       label = 2441;
       break L3106;
      }
      if ((HEAP32[$2 >> 2] | 0) != 1) {
       label = 2443;
       break L3106;
      }
      $21 = $id_num_052 + 1 | 0;
      HEAP32[$3 >> 2] = 0;
      HEAP32[$4 >> 2] = $21;
      $last_hz_len_1 = 1;
      $id_num_1 = $21;
      $list_size_1 = $list_size_051 + 1 | 0;
     } else {
      if ($12 >>> 0 < $last_hz_len_054 >>> 0) {
       label = 2446;
       break L3106;
      }
      if (($12 | 0) == ($last_hz_len_054 | 0)) {
       $last_hz_len_1 = $last_hz_len_054;
       $id_num_1 = $id_num_052 + 1 | 0;
       $list_size_1 = $12 + $list_size_051 | 0;
       break;
      }
      $28 = $12 - 1 | 0;
      if ($last_hz_len_054 >>> 0 < $28 >>> 0) {
       $len_039 = $last_hz_len_054;
       do {
        $33 = $len_039 - 1 | 0;
        HEAP32[$this + 24 + ($len_039 << 2) >> 2] = HEAP32[$this + 24 + ($33 << 2) >> 2];
        HEAP32[$this + 60 + ($len_039 << 2) >> 2] = HEAP32[$this + 60 + ($33 << 2) >> 2];
        $len_039 = $len_039 + 1 | 0;
       } while ($len_039 >>> 0 < $28 >>> 0);
      }
      HEAP32[$this + 24 + ($28 << 2) >> 2] = $list_size_051;
      $43 = $id_num_052 + 1 | 0;
      HEAP32[$this + 60 + ($28 << 2) >> 2] = $43;
      $last_hz_len_1 = $12;
      $id_num_1 = $43;
      $list_size_1 = $12 + $list_size_051 | 0;
     }
    } while (0);
    $47 = $i_053 + 1 | 0;
    if ($47 >>> 0 < $lemma_num >>> 0) {
     $list_size_051 = $list_size_1;
     $id_num_052 = $id_num_1;
     $i_053 = $47;
     $last_hz_len_054 = $last_hz_len_1;
    } else {
     label = 2437;
     break;
    }
   }
   if ((label | 0) == 2437) {
    if ($last_hz_len_1 >>> 0 < 9) {
     $last_hz_len_0_lcssa64 = $last_hz_len_1;
     $id_num_0_lcssa65 = $id_num_1;
     $list_size_0_lcssa66 = $list_size_1;
     break;
    }
    $57 = $this + 56 | 0;
    $58 = HEAP32[$57 >> 2] | 0;
    return $58 | 0;
   } else if ((label | 0) == 2441) {
    ___assert_func(2848, 122, 5992, 4008);
    return 0;
   } else if ((label | 0) == 2443) {
    ___assert_func(2848, 123, 5992, 2800);
    return 0;
   } else if ((label | 0) == 2446) {
    ___assert_func(2848, 134, 5992, 1904);
    return 0;
   }
  }
 } while (0);
 $6 = $this + 24 | 0;
 $7 = $this + 60 | 0;
 $i1_037 = $last_hz_len_0_lcssa64;
 while (1) {
  if (($i1_037 | 0) == 0) {
   HEAP32[$6 >> 2] = 0;
   HEAP32[$7 >> 2] = 1;
   $i1_037 = $i1_037 + 1 | 0;
   continue;
  } else {
   HEAP32[$this + 24 + ($i1_037 << 2) >> 2] = $list_size_0_lcssa66;
   HEAP32[$this + 60 + ($i1_037 << 2) >> 2] = $id_num_0_lcssa65;
   $55 = $i1_037 + 1 | 0;
   if ($55 >>> 0 < 9) {
    $i1_037 = $55;
    continue;
   } else {
    break;
   }
  }
 }
 $57 = $this + 56 | 0;
 $58 = HEAP32[$57 >> 2] | 0;
 return $58 | 0;
}
function __ZN10ime_pinyin8DictList9fill_scisEPKNS_14SingleCharItemEj($this, $scis, $scis_num) {
 $this = $this | 0;
 $scis = $scis | 0;
 $scis_num = $scis_num | 0;
 var $1 = 0, $6 = 0, $7 = 0, $pos_09 = 0;
 $1 = $this + 8 | 0;
 if ((HEAP32[$1 >> 2] | 0) != ($scis_num | 0)) {
  ___assert_func(2848, 170, 5504, 1472);
 }
 if ((HEAP32[$1 >> 2] | 0) == 0) {
  return;
 }
 $6 = $this + 12 | 0;
 $7 = $this + 16 | 0;
 $pos_09 = 0;
 do {
  HEAP16[(HEAP32[$6 >> 2] | 0) + ($pos_09 << 1) >> 1] = HEAP16[$scis + ($pos_09 << 3) + 4 >> 1] | 0;
  HEAP16[(HEAP32[$7 >> 2] | 0) + ($pos_09 << 1) >> 1] = HEAP16[$scis + ($pos_09 << 3) + 6 >> 1] | 0;
  $pos_09 = $pos_09 + 1 | 0;
 } while ($pos_09 >>> 0 < (HEAP32[$1 >> 2] | 0) >>> 0);
 return;
}
function __ZN10ime_pinyin8DictList9fill_listEPKNS_10LemmaEntryEj($this, $lemma_arr, $lemma_num) {
 $this = $this | 0;
 $lemma_arr = $lemma_arr | 0;
 $lemma_num = $lemma_num | 0;
 var $1 = 0, $4 = 0, $9 = 0, $i_017 = 0, $current_pos_015 = 0, $14 = 0, $18 = 0, $21 = 0, $id_num_0_lcssa = 0, $current_pos_0_lcssa = 0;
 $1 = $this + 20 | 0;
 $4 = $lemma_arr + 116 | 0;
 _utf16_strncpy(HEAP32[$1 >> 2] | 0, $lemma_arr + 8 | 0, HEAPU8[$4] | 0) | 0;
 $9 = HEAPU8[$4] | 0;
 if ($lemma_num >>> 0 > 1) {
  $current_pos_015 = $9;
  $i_017 = 1;
  while (1) {
   $14 = $lemma_arr + ($i_017 * 124 | 0) + 116 | 0;
   _utf16_strncpy((HEAP32[$1 >> 2] | 0) + ($current_pos_015 << 1) | 0, $lemma_arr + ($i_017 * 124 | 0) + 8 | 0, HEAPU8[$14] | 0) | 0;
   $18 = $i_017 + 1 | 0;
   $21 = (HEAPU8[$14] | 0) + $current_pos_015 | 0;
   if ($18 >>> 0 < $lemma_num >>> 0) {
    $current_pos_015 = $21;
    $i_017 = $18;
   } else {
    $current_pos_0_lcssa = $21;
    $id_num_0_lcssa = $lemma_num;
    break;
   }
  }
 } else {
  $current_pos_0_lcssa = $9;
  $id_num_0_lcssa = 1;
 }
 if (($current_pos_0_lcssa | 0) != (HEAP32[$this + 56 >> 2] | 0)) {
  ___assert_func(2848, 196, 5592, 1232);
 }
 if (($id_num_0_lcssa | 0) == (HEAP32[$this + 92 >> 2] | 0)) {
  return;
 } else {
  ___assert_func(2848, 197, 5592, 1008);
 }
}
function __ZN10ime_pinyin8DictList7predictEPKttPNS_12NPredictItemEjj($this, $last_hzs, $hzs_len, $npre_items, $npre_max, $b4_used) {
 $this = $this | 0;
 $last_hzs = $last_hzs | 0;
 $hzs_len = $hzs_len | 0;
 $npre_items = $npre_items | 0;
 $npre_max = $npre_max | 0;
 $b4_used = $b4_used | 0;
 var $1 = 0, $8 = 0, $9 = 0, $10 = 0, $12 = 0, $13 = 0, $16 = 0, $item_num_060 = 0, $pre_len_059 = 0, $18 = 0, $19 = 0, $22 = 0, $26 = 0, $27 = 0, $28 = 0, $w_buf_057 = 0, $item_num_156 = 0, $35 = 0, $53 = 0, $54 = 0, $item_num_2 = 0, $59 = 0, $60 = 0, $i_054 = 0, $new_num_053 = 0, $62 = 0, $e_pos_0 = 0, $73 = 0, $74 = 0, $new_num_1 = 0, $76 = 0, $new_num_0_lcssa = 0, label = 0;
 $1 = $hzs_len & 65535;
 if (($hzs_len & 65535) > 7 | $hzs_len << 16 >> 16 == 0) {
  ___assert_func(2848, 236, 5672, 848);
  return 0;
 }
 $8 = HEAP32[$this + 96 + ($1 - 1 << 2) >> 2] | 0;
 $9 = __ZN10ime_pinyin5NGram12get_instanceEv() | 0;
 $10 = 8 - $1 | 0;
 if ($hzs_len << 16 >> 16 == 8) {
  $new_num_0_lcssa = 0;
  return $new_num_0_lcssa | 0;
 }
 $12 = $this + 20 | 0;
 $13 = $last_hzs;
 $pre_len_059 = 1;
 $item_num_060 = 0;
 $16 = 1;
 while (1) {
  $18 = $pre_len_059 + $hzs_len & 65535;
  $19 = __ZN10ime_pinyin8DictList21find_pos_startedbyhzsEPKtjPFiPKvS4_E($this, $last_hzs, $18, $8) | 0;
  L3165 : do {
   if (($19 | 0) == 0) {
    $item_num_2 = $item_num_060;
   } else {
    $22 = $this + 24 + ($18 << 2) | 0;
    if ($19 >>> 0 >= ((HEAP32[$12 >> 2] | 0) + (HEAP32[$22 >> 2] << 1) | 0) >>> 0) {
     $item_num_2 = $item_num_060;
     break;
    }
    $26 = $18 - 1 | 0;
    $27 = $this + 24 + ($26 << 2) | 0;
    $28 = $this + 60 + ($26 << 2) | 0;
    $item_num_156 = $item_num_060;
    $w_buf_057 = $19;
    while (1) {
     if (!((FUNCTION_TABLE_iii[$8 & 63]($w_buf_057, $13) | 0) == 0 & $item_num_156 >>> 0 < $npre_max >>> 0)) {
      $item_num_2 = $item_num_156;
      break L3165;
     }
     $35 = $npre_items + ($item_num_156 * 20 | 0) | 0;
     _memset($35 | 0, 0, 20);
     _utf16_strncpy($npre_items + ($item_num_156 * 20 | 0) + 4 | 0, $w_buf_057 + ($1 << 1) | 0, $16) | 0;
     HEAPF32[$35 >> 2] = +__ZN10ime_pinyin5NGram11get_uni_psbEj($9, (HEAP32[$28 >> 2] | 0) + (((($w_buf_057 - (HEAP32[$12 >> 2] | 0) >> 1) - (HEAP32[$27 >> 2] | 0) | 0) >>> 0) / ($18 >>> 0) | 0) | 0);
     HEAP16[$npre_items + ($item_num_156 * 20 | 0) + 18 >> 1] = $hzs_len;
     $53 = $item_num_156 + 1 | 0;
     $54 = $w_buf_057 + ($18 << 1) | 0;
     if ($54 >>> 0 < ((HEAP32[$12 >> 2] | 0) + (HEAP32[$22 >> 2] << 1) | 0) >>> 0) {
      $item_num_156 = $53;
      $w_buf_057 = $54;
     } else {
      $item_num_2 = $53;
      break;
     }
    }
   }
  } while (0);
  $59 = $pre_len_059 + 1 & 65535;
  $60 = $59 & 65535;
  if ($60 >>> 0 > $10 >>> 0) {
   break;
  } else {
   $pre_len_059 = $59;
   $item_num_060 = $item_num_2;
   $16 = $60;
  }
 }
 if (($item_num_2 | 0) == 0) {
  $new_num_0_lcssa = 0;
  return $new_num_0_lcssa | 0;
 } else {
  $new_num_053 = 0;
  $i_054 = 0;
 }
 while (1) {
  $62 = $npre_items + ($i_054 * 20 | 0) + 4 | 0;
  $e_pos_0 = 1;
  while (1) {
   if ($e_pos_0 >>> 0 > $b4_used >>> 0) {
    label = 2488;
    break;
   }
   if ((_utf16_strncmp($npre_items + ((-$e_pos_0 | 0) * 20 | 0) + 4 | 0, $62, 7) | 0) == 0) {
    $new_num_1 = $new_num_053;
    break;
   } else {
    $e_pos_0 = $e_pos_0 + 1 | 0;
   }
  }
  if ((label | 0) == 2488) {
   label = 0;
   $73 = $npre_items + ($new_num_053 * 20 | 0) | 0;
   $74 = $npre_items + ($i_054 * 20 | 0) | 0;
   HEAP32[$73 >> 2] = HEAP32[$74 >> 2];
   HEAP32[$73 + 4 >> 2] = HEAP32[$74 + 4 >> 2];
   HEAP32[$73 + 8 >> 2] = HEAP32[$74 + 8 >> 2];
   HEAP32[$73 + 12 >> 2] = HEAP32[$74 + 12 >> 2];
   HEAP32[$73 + 16 >> 2] = HEAP32[$74 + 16 >> 2];
   $new_num_1 = $new_num_053 + 1 | 0;
  }
  $76 = $i_054 + 1 | 0;
  if ($76 >>> 0 < $item_num_2 >>> 0) {
   $new_num_053 = $new_num_1;
   $i_054 = $76;
  } else {
   $new_num_0_lcssa = $new_num_1;
   break;
  }
 }
 return $new_num_0_lcssa | 0;
}
function __ZN10ime_pinyin8LpiCache9is_cachedEt($this, $splid) {
 $this = $this | 0;
 $splid = $splid | 0;
 var $_0 = 0;
 if (($splid & 65535) > 29) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = (HEAP16[(HEAP32[$this + 4 >> 2] | 0) + (($splid & 65535) << 1) >> 1] | 0) != 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8LpiCache9put_cacheEtPNS_10LmaPsbItemEj($this, $splid, $lpi_items, $lpi_num) {
 $this = $this | 0;
 $splid = $splid | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_num = $lpi_num | 0;
 var $_ = 0, $4 = 0, $5 = 0, $6 = 0, $8 = 0, $pos_012 = 0, $11 = 0, $12 = 0, $13$1 = 0, $14 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0;
 $_ = $lpi_num >>> 0 < 15 ? $lpi_num & 65535 : 15;
 $4 = HEAP32[$this >> 2] | 0;
 $5 = $splid & 65535;
 $6 = $5 * 15 | 0;
 if ($_ << 16 >> 16 == 0) {
  $17 = $_ & 65535;
  $18 = $this + 4 | 0;
  $19 = HEAP32[$18 >> 2] | 0;
  $20 = $19 + ($5 << 1) | 0;
  HEAP16[$20 >> 1] = $_;
  return $17 | 0;
 } else {
  $pos_012 = 0;
  $8 = 0;
 }
 while (1) {
  $11 = $lpi_items + ($8 << 3) | 0;
  $12 = $4 + ($8 + $6 << 3) | 0;
  $13$1 = HEAP32[$11 + 4 >> 2] | 0;
  HEAP32[$12 >> 2] = HEAP32[$11 >> 2];
  HEAP32[$12 + 4 >> 2] = $13$1;
  $14 = $pos_012 + 1 & 65535;
  if (($14 & 65535) < ($_ & 65535)) {
   $pos_012 = $14;
   $8 = $14 & 65535;
  } else {
   break;
  }
 }
 $17 = $_ & 65535;
 $18 = $this + 4 | 0;
 $19 = HEAP32[$18 >> 2] | 0;
 $20 = $19 + ($5 << 1) | 0;
 HEAP16[$20 >> 1] = $_;
 return $17 | 0;
}
function __ZN10ime_pinyin8LpiCache9get_cacheEtPNS_10LmaPsbItemEj($this, $splid, $lpi_items, $lpi_max) {
 $this = $this | 0;
 $splid = $splid | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 var $1 = 0, $6 = 0, $_lpi_max = 0, $9 = 0, $10 = 0, $12 = 0, $pos_011 = 0, $15 = 0, $16 = 0, $17$1 = 0;
 $1 = $splid & 65535;
 $6 = HEAPU16[(HEAP32[$this + 4 >> 2] | 0) + ($1 << 1) >> 1] | 0;
 $_lpi_max = $6 >>> 0 < $lpi_max >>> 0 ? $6 : $lpi_max;
 $9 = HEAP32[$this >> 2] | 0;
 $10 = $1 * 15 | 0;
 if (($_lpi_max | 0) == 0) {
  return $_lpi_max | 0;
 } else {
  $pos_011 = 0;
  $12 = 0;
 }
 do {
  $15 = $9 + ($12 + $10 << 3) | 0;
  $16 = $lpi_items + ($12 << 3) | 0;
  $17$1 = HEAP32[$15 + 4 >> 2] | 0;
  HEAP32[$16 >> 2] = HEAP32[$15 >> 2];
  HEAP32[$16 + 4 >> 2] = $17$1;
  $pos_011 = $pos_011 + 1 & 65535;
  $12 = $pos_011 & 65535;
 } while ($12 >>> 0 < $_lpi_max >>> 0);
 return $_lpi_max | 0;
}
function __ZN10ime_pinyin13SpellingTableC2Ev($this) {
 $this = $this | 0;
 HEAP8[$this | 0] = 0;
 HEAP32[$this + 8 >> 2] = 0;
 HEAP32[$this + 12 >> 2] = 0;
 HEAP32[$this + 32 >> 2] = 0;
 HEAPF64[$this + 24 >> 3] = 0.0;
 HEAP8[$this + 49 | 0] = 1;
 return;
}
function __ZN10ime_pinyin13SpellingTable12get_hash_posEPKc($this, $spelling_str) {
 $this = $this | 0;
 $spelling_str = $spelling_str | 0;
 var $1 = 0, $pos_09 = 0, $hash_pos_08 = 0, $5 = 0, $9 = 0, $10 = 0, $hash_pos_0_lcssa = 0;
 $1 = $this + 16 | 0;
 L3203 : do {
  if ((HEAP32[$1 >> 2] | 0) == 0) {
   $hash_pos_0_lcssa = 0;
  } else {
   $hash_pos_08 = 0;
   $pos_09 = 0;
   while (1) {
    $5 = HEAP8[$spelling_str + $pos_09 | 0] | 0;
    if ($5 << 24 >> 24 == 0) {
     $hash_pos_0_lcssa = $hash_pos_08;
     break L3203;
    }
    $9 = ($5 << 24 >> 24) + $hash_pos_08 | 0;
    $10 = $pos_09 + 1 | 0;
    if ($10 >>> 0 < (HEAP32[$1 >> 2] | 0) >>> 0) {
     $hash_pos_08 = $9;
     $pos_09 = $10;
    } else {
     $hash_pos_0_lcssa = $9;
     break;
    }
   }
  }
 } while (0);
 return ($hash_pos_0_lcssa >>> 0) % ((HEAP32[$this + 4 >> 2] | 0) >>> 0) | 0 | 0;
}
function __ZN10ime_pinyin13SpellingTable13hash_pos_nextEj($this, $hash_pos) {
 $this = $this | 0;
 $hash_pos = $hash_pos | 0;
 return (($hash_pos + 123 | 0) >>> 0) % ((HEAP32[$this + 4 >> 2] | 0) >>> 0) | 0 | 0;
}
function __ZN10ime_pinyin8DictList9save_listEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $7 = 0, $11 = 0, $15 = 0, $19 = 0, $23 = 0, $44 = 0, $45 = 0, $50 = 0, $57 = 0, $_0 = 0;
 if ((HEAP8[$this | 0] & 1) == 0 | ($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $7 = $this + 20 | 0;
 if ((HEAP32[$7 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = $this + 56 | 0;
 if ((HEAP32[$11 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $15 = $this + 12 | 0;
 if ((HEAP32[$15 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $19 = $this + 16 | 0;
 if ((HEAP32[$19 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $23 = $this + 8 | 0;
 if ((HEAP32[$23 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite($23 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite($this + 24 | 0, 4, 9, $fp | 0) | 0) != 9) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fwrite($this + 60 | 0, 4, 9, $fp | 0) | 0) != 9) {
  $_0 = 0;
  return $_0 | 0;
 }
 $44 = _fwrite(HEAP32[$15 >> 2] | 0, 2, HEAP32[$23 >> 2] | 0, $fp | 0) | 0;
 $45 = HEAP32[$23 >> 2] | 0;
 if (($44 | 0) != ($45 | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $50 = _fwrite(HEAP32[$19 >> 2] | 0, 2, $45 | 0, $fp | 0) | 0;
 if (($50 | 0) != (HEAP32[$23 >> 2] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $57 = _fwrite(HEAP32[$7 >> 2] | 0, 2, HEAP32[$11 >> 2] | 0, $fp | 0) | 0;
 $_0 = ($57 | 0) == (HEAP32[$11 >> 2] | 0);
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictList9load_listEP7__sFILE($this, $fp) {
 $this = $this | 0;
 $fp = $fp | 0;
 var $3 = 0, $4 = 0, $19 = 0, $28 = 0, $29 = 0, $35 = 0, $43 = 0, $_0 = 0;
 if (($fp | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $this | 0;
 HEAP8[$3] = 0;
 $4 = $this + 8 | 0;
 if ((_fread($4 | 0, 4, 1, $fp | 0) | 0) != 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fread($this + 24 | 0, 4, 9, $fp | 0) | 0) != 9) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((_fread($this + 60 | 0, 4, 9, $fp | 0) | 0) != 9) {
  $_0 = 0;
  return $_0 | 0;
 }
 __ZN10ime_pinyin8DictList13free_resourceEv($this);
 $19 = $this + 56 | 0;
 if (!(__ZN10ime_pinyin8DictList14alloc_resourceEjj($this, HEAP32[$19 >> 2] | 0, HEAP32[$4 >> 2] | 0) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $28 = _fread(HEAP32[$this + 12 >> 2] | 0, 2, HEAP32[$4 >> 2] | 0, $fp | 0) | 0;
 $29 = HEAP32[$4 >> 2] | 0;
 if (($28 | 0) != ($29 | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $35 = _fread(HEAP32[$this + 16 >> 2] | 0, 2, $29 | 0, $fp | 0) | 0;
 if (($35 | 0) != (HEAP32[$4 >> 2] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $43 = _fread(HEAP32[$this + 20 >> 2] | 0, 2, HEAP32[$19 >> 2] | 0, $fp | 0) | 0;
 if (($43 | 0) != (HEAP32[$19 >> 2] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP8[$3] = 1;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin8LpiCacheD2Ev($this) {
 $this = $this | 0;
 var $2 = 0, $8 = 0;
 $2 = HEAP32[$this >> 2] | 0;
 if (($2 | 0) != 0) {
  __ZdaPv($2 | 0);
 }
 $8 = HEAP32[$this + 4 >> 2] | 0;
 if (($8 | 0) == 0) {
  return;
 }
 __ZdaPv($8);
 return;
}
function __ZN10ime_pinyin7myqsortEPvjjPFiPKvS2_E($p, $n, $es, $cmp) {
 $p = $p | 0;
 $n = $n | 0;
 $es = $es | 0;
 $cmp = $cmp | 0;
 _qsort($p | 0, $n | 0, $es | 0, $cmp | 0);
 return;
}
function __ZN10ime_pinyin9mybsearchEPKvS1_jjPFiS1_S1_E($k, $b, $n, $es, $cmp) {
 $k = $k | 0;
 $b = $b | 0;
 $n = $n | 0;
 $es = $es | 0;
 $cmp = $cmp | 0;
 return _bsearch($k | 0, $b | 0, $n | 0, $es | 0, $cmp | 0) | 0;
}
function __ZN10ime_pinyin18compare_raw_spl_ebEPKvS1_($p1, $p2) {
 $p1 = $p1 | 0;
 $p2 = $p2 | 0;
 var $_0 = 0;
 do {
  if ((HEAP8[$p1] | 0) == 0) {
   $_0 = 1;
  } else {
   if ((HEAP8[$p2] | 0) == 0) {
    $_0 = -1;
    break;
   }
   $_0 = _strcmp($p1 | 0, $p2 | 0) | 0;
  }
 } while (0);
 return $_0 | 0;
}
function __ZN10ime_pinyin12get_odd_nextEj($value) {
 $value = $value | 0;
 var $v_next_0 = 0, $5 = 0, $v_dv_0 = 0;
 $v_next_0 = $value;
 L3286 : while (1) {
  $5 = ~~+Math_sqrt(+(+($v_next_0 >>> 0 >>> 0))) + 1 | 0;
  $v_dv_0 = 2;
  while (1) {
   if ($v_dv_0 >>> 0 >= $5 >>> 0) {
    break L3286;
   }
   if ((($v_next_0 >>> 0) % ($v_dv_0 >>> 0) | 0 | 0) == 0) {
    break;
   } else {
    $v_dv_0 = $v_dv_0 + 1 | 0;
   }
  }
  $v_next_0 = $v_next_0 + 1 | 0;
 }
 return $v_next_0 | 0;
}
function __ZN10ime_pinyin13SpellingTableD2Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin13SpellingTable13free_resourceEv($this);
 return;
}
function __ZN10ime_pinyin13SpellingTable13free_resourceEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $7 = 0, $8 = 0;
 $1 = $this + 8 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) != 0) {
  __ZdaPv($2 | 0);
 }
 HEAP32[$1 >> 2] = 0;
 $7 = $this + 12 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 if (($8 | 0) == 0) {
  HEAP32[$7 >> 2] = 0;
  return;
 }
 __ZdaPv($8);
 HEAP32[$7 >> 2] = 0;
 return;
}
function __ZN10ime_pinyin13SpellingTable10init_tableEjjb($this, $pure_spl_size, $spl_max_num, $need_score) {
 $this = $this | 0;
 $pure_spl_size = $pure_spl_size | 0;
 $spl_max_num = $spl_max_num | 0;
 $need_score = $need_score | 0;
 var $6 = 0, $8 = 0, $11$0 = 0, $17 = 0, $21 = 0, $22 = 0, $23 = 0, $31 = 0, $_0 = 0;
 if (($pure_spl_size | 0) == 0 | ($spl_max_num | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP8[$this | 0] = $need_score & 1;
 __ZN10ime_pinyin13SpellingTable13free_resourceEv($this);
 $6 = $this + 16 | 0;
 HEAP32[$6 >> 2] = ($need_score ? 2 : 1) + $pure_spl_size;
 $8 = $this + 4 | 0;
 HEAP32[$8 >> 2] = __ZN10ime_pinyin12get_odd_nextEj($spl_max_num) | 0;
 HEAP32[$this + 32 >> 2] = 0;
 $11$0 = _llvm_umul_with_overflow_i32(HEAP32[$8 >> 2] | 0, 16) | 0;
 $17 = $this + 8 | 0;
 HEAP32[$17 >> 2] = __Znaj(tempRet0 ? -1 : $11$0) | 0;
 $21 = __Znaj(Math_imul(HEAP32[$6 >> 2] | 0, HEAP32[$8 >> 2] | 0) | 0) | 0;
 $22 = $this + 12 | 0;
 HEAP32[$22 >> 2] = $21;
 $23 = HEAP32[$17 >> 2] | 0;
 if (($23 | 0) == 0 | ($21 | 0) == 0) {
  __ZN10ime_pinyin13SpellingTable13free_resourceEv($this);
  $_0 = 0;
  return $_0 | 0;
 } else {
  _memset($23 | 0, 0, HEAP32[$8 >> 2] << 4 | 0);
  $31 = HEAP32[$22 >> 2] | 0;
  _memset($31 | 0, 0, Math_imul(HEAP32[$6 >> 2] | 0, HEAP32[$8 >> 2] | 0) | 0);
  HEAP8[$this + 49 | 0] = 0;
  HEAPF64[$this + 24 >> 3] = 0.0;
  $_0 = 1;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin13SpellingTable12put_spellingEPKcd($this, $spelling_str, $freq) {
 $this = $this | 0;
 $spelling_str = $spelling_str | 0;
 $freq = +$freq;
 var $pos_0 = 0, $13 = 0, $16 = 0, $17 = 0, $20 = 0, $23 = 0, $29 = 0, $31 = 0, $33 = 0, $hash_pos_0 = 0, $37 = 0, $41 = 0, $48 = 0, $52 = 0, $54 = 0, $60 = 0, $64 = 0, $_0 = 0, label = 0;
 if ((HEAP8[$this + 49 | 0] & 1) != 0 | ($spelling_str | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $pos_0 = 0;
 }
 while (1) {
  if ($pos_0 >>> 0 >= 3) {
   break;
  }
  if ((_strcmp($spelling_str | 0, 10896 + ($pos_0 * 7 | 0) | 0) | 0) == 0) {
   $_0 = 0;
   label = 2606;
   break;
  } else {
   $pos_0 = $pos_0 + 1 | 0;
  }
 }
 if ((label | 0) == 2606) {
  return $_0 | 0;
 }
 $13 = $this + 24 | 0;
 HEAPF64[$13 >> 3] = +HEAPF64[$13 >> 3] + $freq;
 $16 = __ZN10ime_pinyin13SpellingTable12get_hash_posEPKc($this, $spelling_str) | 0;
 $17 = $this + 16 | 0;
 $20 = $this + 8 | 0;
 HEAP8[(HEAP32[$17 >> 2] | 0) - 1 + ((HEAP32[$20 >> 2] | 0) + ($16 << 4)) | 0] = 0;
 $23 = HEAP32[$20 >> 2] | 0;
 if ((_strncmp($23 + ($16 << 4) | 0, $spelling_str | 0, (HEAP32[$17 >> 2] | 0) - 1 | 0) | 0) == 0) {
  $33 = $23 + ($16 << 4) + 8 | 0;
  HEAPF64[$33 >> 3] = +HEAPF64[$33 >> 3] + $freq;
  $_0 = 1;
  return $_0 | 0;
 }
 $29 = HEAP32[$20 >> 2] | 0;
 $31 = (HEAP32[$17 >> 2] | 0) - 1 | 0;
 $hash_pos_0 = $16;
 while (1) {
  $37 = $29 + ($hash_pos_0 << 4) | 0;
  if ((_strncmp($37 | 0, $spelling_str | 0, $31 | 0) | 0) == 0) {
   label = 2601;
   break;
  }
  if ((HEAP8[$37] | 0) == 0) {
   label = 2603;
   break;
  }
  $64 = __ZN10ime_pinyin13SpellingTable13hash_pos_nextEj($this, $hash_pos_0) | 0;
  if (($16 | 0) == ($64 | 0)) {
   $_0 = 0;
   label = 2611;
   break;
  } else {
   $hash_pos_0 = $64;
  }
 }
 if ((label | 0) == 2603) {
  $48 = $29 + ($hash_pos_0 << 4) + 8 | 0;
  HEAPF64[$48 >> 3] = +HEAPF64[$48 >> 3] + $freq;
  $52 = (HEAP32[$20 >> 2] | 0) + ($hash_pos_0 << 4) | 0;
  $54 = (HEAP32[$17 >> 2] | 0) - 1 | 0;
  _strncpy($52 | 0, $spelling_str | 0, $54 | 0) | 0;
  HEAP8[(HEAP32[$17 >> 2] | 0) - 1 + ((HEAP32[$20 >> 2] | 0) + ($hash_pos_0 << 4)) | 0] = 0;
  $60 = $this + 32 | 0;
  HEAP32[$60 >> 2] = (HEAP32[$60 >> 2] | 0) + 1;
  $_0 = 1;
  return $_0 | 0;
 } else if ((label | 0) == 2611) {
  return $_0 | 0;
 } else if ((label | 0) == 2601) {
  $41 = $29 + ($hash_pos_0 << 4) + 8 | 0;
  HEAPF64[$41 >> 3] = +HEAPF64[$41 >> 3] + $freq;
  $_0 = 1;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin13SpellingTable7containEPKc($this, $spelling_str) {
 $this = $this | 0;
 $spelling_str = $spelling_str | 0;
 var $12 = 0, $13 = 0, $15 = 0, $19 = 0, $hash_pos_0 = 0, $24 = 0, $28 = 0, $_0 = 0, label = 0;
 if (($spelling_str | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP32[$this + 12 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if ((HEAP8[$this + 49 | 0] & 1) != 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $12 = __ZN10ime_pinyin13SpellingTable12get_hash_posEPKc($this, $spelling_str) | 0;
 $13 = $this + 8 | 0;
 $15 = (HEAP32[$13 >> 2] | 0) + ($12 << 4) | 0;
 if ((HEAP8[$15] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $19 = $this + 16 | 0;
 if ((_strncmp($15 | 0, $spelling_str | 0, (HEAP32[$19 >> 2] | 0) - 1 | 0) | 0) == 0) {
  $_0 = 1;
  return $_0 | 0;
 } else {
  $hash_pos_0 = $12;
 }
 while (1) {
  $24 = __ZN10ime_pinyin13SpellingTable13hash_pos_nextEj($this, $hash_pos_0) | 0;
  if (($12 | 0) == ($24 | 0)) {
   $_0 = 0;
   label = 2626;
   break;
  }
  $28 = (HEAP32[$13 >> 2] | 0) + ($24 << 4) | 0;
  if ((HEAP8[$28] | 0) == 0) {
   $_0 = 0;
   label = 2625;
   break;
  }
  if ((_strncmp($28 | 0, $spelling_str | 0, (HEAP32[$19 >> 2] | 0) - 1 | 0) | 0) == 0) {
   $_0 = 1;
   label = 2624;
   break;
  } else {
   $hash_pos_0 = $24;
  }
 }
 if ((label | 0) == 2626) {
  return $_0 | 0;
 } else if ((label | 0) == 2624) {
  return $_0 | 0;
 } else if ((label | 0) == 2625) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictList20get_splids_for_hanziEttPtt($this, $hanzi, $half_splid, $splids, $max_splids) {
 $this = $this | 0;
 $hanzi = $hanzi | 0;
 $half_splid = $half_splid | 0;
 $splids = $splids | 0;
 $max_splids = $max_splids | 0;
 var $1 = 0, $3 = 0, $6 = 0, $8 = 0, $9 = 0, $15 = 0, $16 = 0, $hz_found_0 = 0, $21 = 0, $24 = 0, $28 = 0, $29 = 0, $30 = 0, $32 = 0, $hz_f_033 = 0, $strict_0_off032 = 0, $strict_0_off0_lcssa = 0, $35 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $strict_1_off0 = 0, $59 = 0, $60 = 0, $65 = 0, $hz_found_131 = 0, $found_num_030 = 0, $73 = 0, $92 = 0, $found_num_1 = 0, $105 = 0, $106 = 0, $found_num_0_lcssa = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $1 = sp | 0;
 HEAP16[$1 >> 1] = $hanzi;
 $3 = $this + 12 | 0;
 $6 = $this + 8 | 0;
 $8 = __ZN10ime_pinyin9mybsearchEPKvS1_jjPFiS1_S1_E($1, HEAP32[$3 >> 2] | 0, HEAP32[$6 >> 2] | 0, 2, 16) | 0;
 $9 = $8;
 if (($8 | 0) == 0) {
  ___assert_func(2848, 314, 5768, 688);
  return 0;
 }
 if ((HEAP16[$1 >> 1] | 0) != (HEAP16[$9 >> 1] | 0)) {
  ___assert_func(2848, 314, 5768, 688);
  return 0;
 }
 $15 = HEAP32[$3 >> 2] | 0;
 $16 = HEAP16[$1 >> 1] | 0;
 $hz_found_0 = $9;
 while (1) {
  if ($hz_found_0 >>> 0 <= $15 >>> 0) {
   break;
  }
  $21 = $hz_found_0 - 2 | 0;
  if ($16 << 16 >> 16 == (HEAP16[$21 >> 1] | 0)) {
   $hz_found_0 = $21;
  } else {
   break;
  }
 }
 $24 = HEAP32[$3 >> 2] | 0;
 L3368 : do {
  if ($hz_found_0 >>> 0 < ($24 + (HEAP32[$6 >> 2] << 1) | 0) >>> 0) {
   $28 = HEAP16[$1 >> 1] | 0;
   $29 = $half_splid << 16 >> 16 == 0;
   $30 = $this + 16 | 0;
   $strict_0_off032 = 0;
   $hz_f_033 = $hz_found_0;
   $32 = $24;
   while (1) {
    if ($28 << 16 >> 16 != (HEAP16[$hz_f_033 >> 1] | 0)) {
     $strict_0_off0_lcssa = $strict_0_off032;
     break L3368;
    }
    if ($29) {
     label = 2642;
    } else {
     if ((HEAP16[(HEAP32[$30 >> 2] | 0) + ((($hz_f_033 - $32 | 0) >>> 1 & 65535) << 1) >> 1] & 31) == $half_splid << 16 >> 16) {
      label = 2642;
     } else {
      $strict_1_off0 = $strict_0_off032;
     }
    }
    if ((label | 0) == 2642) {
     label = 0;
     $strict_1_off0 = 1;
    }
    $59 = $hz_f_033 + 2 | 0;
    $60 = HEAP32[$3 >> 2] | 0;
    if ($59 >>> 0 < ($60 + (HEAP32[$6 >> 2] << 1) | 0) >>> 0) {
     $strict_0_off032 = $strict_1_off0;
     $hz_f_033 = $59;
     $32 = $60;
    } else {
     $strict_0_off0_lcssa = $strict_1_off0;
     break;
    }
   }
  } else {
   $strict_0_off0_lcssa = 0;
  }
 } while (0);
 $35 = HEAP32[$3 >> 2] | 0;
 if ($hz_found_0 >>> 0 >= ($35 + (HEAP32[$6 >> 2] << 1) | 0) >>> 0) {
  $found_num_0_lcssa = 0;
  STACKTOP = sp;
  return $found_num_0_lcssa | 0;
 }
 $39 = $half_splid << 16 >> 16 == 0;
 $40 = $max_splids & 65535;
 $41 = $this + 16 | 0;
 $42 = $this + 16 | 0;
 $43 = $this + 4 | 0;
 $44 = $this + 16 | 0;
 $found_num_030 = 0;
 $hz_found_131 = $hz_found_0;
 $65 = $35;
 while (1) {
  if ((HEAP16[$1 >> 1] | 0) != (HEAP16[$hz_found_131 >> 1] | 0)) {
   $found_num_0_lcssa = $found_num_030;
   label = 2656;
   break;
  }
  $73 = ($hz_found_131 - $65 | 0) >>> 1;
  do {
   if ($39) {
    label = 2649;
   } else {
    if ($strict_0_off0_lcssa) {
     if ((HEAP16[(HEAP32[$42 >> 2] | 0) + (($73 & 65535) << 1) >> 1] & 31) == $half_splid << 16 >> 16) {
      label = 2649;
      break;
     } else {
      $found_num_1 = $found_num_030;
      break;
     }
    } else {
     if (__ZNK10ime_pinyin12SpellingTrie20half_full_compatibleEtt(HEAP32[$43 >> 2] | 0, $half_splid, (HEAPU16[(HEAP32[$44 >> 2] | 0) + (($73 & 65535) << 1) >> 1] | 0) >>> 5) | 0) {
      label = 2649;
      break;
     } else {
      $found_num_1 = $found_num_030;
      break;
     }
    }
   }
  } while (0);
  if ((label | 0) == 2649) {
   label = 0;
   $92 = $found_num_030 & 65535;
   if (($92 + 1 | 0) >>> 0 >= $40 >>> 0) {
    label = 2650;
    break;
   }
   HEAP16[$splids + ($92 << 1) >> 1] = (HEAPU16[(HEAP32[$41 >> 2] | 0) + (($73 & 65535) << 1) >> 1] | 0) >>> 5;
   $found_num_1 = $found_num_030 + 1 & 65535;
  }
  $105 = $hz_found_131 + 2 | 0;
  $106 = HEAP32[$3 >> 2] | 0;
  if ($105 >>> 0 < ($106 + (HEAP32[$6 >> 2] << 1) | 0) >>> 0) {
   $found_num_030 = $found_num_1;
   $hz_found_131 = $105;
   $65 = $106;
  } else {
   $found_num_0_lcssa = $found_num_1;
   label = 2654;
   break;
  }
 }
 if ((label | 0) == 2654) {
  STACKTOP = sp;
  return $found_num_0_lcssa | 0;
 } else if ((label | 0) == 2656) {
  STACKTOP = sp;
  return $found_num_0_lcssa | 0;
 } else if ((label | 0) == 2650) {
  ___assert_func(2848, 338, 5768, 544);
  return 0;
 }
 return 0;
}
function __ZN10ime_pinyin8DictList12get_lemma_idEPKtt($this, $str, $str_len) {
 $this = $this | 0;
 $str = $str | 0;
 $str_len = $str_len | 0;
 var $3 = 0, $6 = 0, $9 = 0, $13 = 0, $20 = 0, $22 = 0, $_0 = 0;
 if (($str | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = $str_len & 65535;
 if (($str_len & 65535) > 8) {
  $_0 = 0;
  return $_0 | 0;
 }
 $6 = $3 - 1 | 0;
 $9 = __ZN10ime_pinyin8DictList21find_pos_startedbyhzsEPKtjPFiPKvS4_E($this, $str, $3, HEAP32[$this + 96 + ($6 << 2) >> 2] | 0) | 0;
 if (($9 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $13 = HEAP32[$this + 20 >> 2] | 0;
 if ($9 >>> 0 <= $13 >>> 0) {
  ___assert_func(2848, 356, 6080, 4352);
  return 0;
 }
 $20 = $9 - $13 >> 1;
 $22 = HEAP32[$this + 24 + ($6 << 2) >> 2] | 0;
 if ($20 >>> 0 < $22 >>> 0) {
  ___assert_func(2848, 357, 6080, 4168);
  return 0;
 }
 $_0 = ((($20 - $22 | 0) >>> 0) / ($3 >>> 0) | 0) + (HEAP32[$this + 60 + ($6 << 2) >> 2] | 0) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8DictList17convert_to_hanzisEPtt($this, $str, $str_len) {
 $this = $this | 0;
 $str = $str | 0;
 $str_len = $str_len | 0;
 var $3 = 0, $str_pos_08 = 0, $7 = 0;
 if (($str | 0) == 0) {
  ___assert_func(2848, 364, 5928, 3992);
 }
 if ($str_len << 16 >> 16 == 0) {
  return;
 }
 $3 = $this + 12 | 0;
 $str_pos_08 = 0;
 do {
  $7 = $str + (($str_pos_08 & 65535) << 1) | 0;
  HEAP16[$7 >> 1] = HEAP16[(HEAP32[$3 >> 2] | 0) + ((HEAPU16[$7 >> 1] | 0) << 1) >> 1] | 0;
  $str_pos_08 = $str_pos_08 + 1 & 65535;
 } while (($str_pos_08 & 65535) < ($str_len & 65535));
 return;
}
function __ZN10ime_pinyin8DictList19convert_to_scis_idsEPtt($this, $str, $str_len) {
 $this = $this | 0;
 $str = $str | 0;
 $str_len = $str_len | 0;
 var $str_pos_06 = 0;
 if (($str | 0) == 0) {
  ___assert_func(2848, 372, 5856, 3992);
 }
 if ($str_len << 16 >> 16 == 0) {
  return;
 } else {
  $str_pos_06 = 0;
 }
 do {
  HEAP16[$str + (($str_pos_06 & 65535) << 1) >> 1] = 256;
  $str_pos_06 = $str_pos_06 + 1 & 65535;
 } while (($str_pos_06 & 65535) < ($str_len & 65535));
 return;
}
function __ZN10ime_pinyin8LpiCacheC2Ev($this) {
 $this = $this | 0;
 var $3 = 0, $4 = 0, $6 = 0, $id_03 = 0;
 $3 = $this | 0;
 HEAP32[$3 >> 2] = __Znaj(3600) | 0;
 $4 = __Znaj(60) | 0;
 $6 = $this + 4 | 0;
 HEAP32[$6 >> 2] = $4;
 if ((HEAP32[$3 >> 2] | 0) == 0) {
  ___assert_func(2496, 27, 4560, 3920);
 }
 if (($4 | 0) == 0) {
  ___assert_func(2496, 28, 4560, 2776);
 } else {
  $id_03 = 0;
 }
 do {
  HEAP16[(HEAP32[$6 >> 2] | 0) + (($id_03 & 65535) << 1) >> 1] = 0;
  $id_03 = $id_03 + 1 & 65535;
 } while (($id_03 & 65535) < 30);
 return;
}
function __ZN10ime_pinyin8LpiCache12get_instanceEv() {
 var $4 = 0, $5 = 0, $12 = 0;
 if ((HEAP32[5338] | 0) != 0) {
  $12 = HEAP32[5338] | 0;
  return $12 | 0;
 }
 $4 = __Znwj(8) | 0;
 $5 = $4;
 __ZN10ime_pinyin8LpiCacheC2Ev($5);
 HEAP32[5338] = $5;
 if (($4 | 0) == 0) {
  ___assert_func(2496, 44, 4600, 1880);
  return 0;
 } else {
  $12 = HEAP32[5338] | 0;
  return $12 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin12SpellingTrie16is_same_spl_charEcc($ch1, $ch2) {
 $ch1 = $ch1 | 0;
 $ch2 = $ch2 | 0;
 var $1 = 0, $2 = 0, $11 = 0;
 $1 = $ch1 << 24 >> 24;
 $2 = $ch2 << 24 >> 24;
 do {
  if ($ch1 << 24 >> 24 == $ch2 << 24 >> 24) {
   $11 = 1;
  } else {
   if (($1 - $2 | 0) == 32) {
    $11 = 1;
    break;
   }
   $11 = ($2 - $1 | 0) == 32;
  }
 } while (0);
 return $11 | 0;
}
function __ZN10ime_pinyin13SpellingTable19get_score_amplifierEv($this) {
 $this = $this | 0;
 return +(+HEAPF64[$this + 40 >> 3]);
}
function __ZN10ime_pinyin13SpellingTable17get_average_scoreEv($this) {
 $this = $this | 0;
 return HEAP8[$this + 48 | 0] | 0;
}
function __ZN10ime_pinyin14SpellingParserC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = __ZN10ime_pinyin12SpellingTrie14get_cpinstanceEv() | 0;
 return;
}
function __ZN10ime_pinyin14SpellingParser17is_valid_to_parseEc($this, $ch) {
 $this = $this | 0;
 $ch = $ch | 0;
 return __ZN10ime_pinyin12SpellingTrie17is_valid_spl_charEc($ch) | 0;
}
function __ZN10ime_pinyin14SpellingParser14splstr_to_idxsEPKctPtS3_tRb($this, $splstr, $str_len, $spl_idx, $start_pos, $max_size, $last_is_pre) {
 $this = $this | 0;
 $splstr = $splstr | 0;
 $str_len = $str_len | 0;
 $spl_idx = $spl_idx | 0;
 $start_pos = $start_pos | 0;
 $max_size = $max_size | 0;
 $last_is_pre = $last_is_pre | 0;
 var $id_this = 0, $id_this1 = 0, $id_this2 = 0, $8 = 0, $11 = 0, $12 = 0, $idx_num_0_ph = 0, $last_is_splitter_0_off0_ph = 0, $str_pos_0_ph = 0, $node_this_0_ph = 0, $15 = 0, $last_is_splitter_0_off0_ph66_ph = 0, $str_pos_0_ph67_ph = 0, $node_this_0_ph68_ph = 0, $18 = 0, $str_pos_0_ph6789 = 0, $last_is_splitter_0_off0_ph6688 = 0, $str_pos_077 = 0, $23 = 0, $34 = 0, $35 = 0, $43 = 0, $49 = 0, $63 = 0, $68 = 0, $i_0 = 0, $found_son_0 = 0, $91 = 0, $idx_num_0_ph_be = 0, $last_is_splitter_0_off0_ph_be = 0, $str_pos_0_ph_be = 0, $last_is_splitter_0_off0_ph6683 = 0, $str_pos_0_lcssa = 0, $107 = 0, $idx_num_1 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $id_this = sp | 0;
 $id_this1 = sp + 8 | 0;
 $id_this2 = sp + 16 | 0;
 if (($splstr | 0) == 0 | $max_size << 16 >> 16 == 0 | $str_len << 16 >> 16 == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin12SpellingTrie17is_valid_spl_charEc(HEAP8[$splstr] | 0) | 0)) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 HEAP8[$last_is_pre] = 0;
 $8 = $this | 0;
 $11 = HEAP32[(HEAP32[$8 >> 2] | 0) + 44 >> 2] | 0;
 $12 = ($start_pos | 0) != 0;
 if ($12) {
  HEAP16[$start_pos >> 1] = 0;
  $node_this_0_ph = $11;
  $str_pos_0_ph = 0;
  $last_is_splitter_0_off0_ph = 0;
  $idx_num_0_ph = 0;
 } else {
  $node_this_0_ph = $11;
  $str_pos_0_ph = 0;
  $last_is_splitter_0_off0_ph = 0;
  $idx_num_0_ph = 0;
 }
 L3469 : while (1) {
  $15 = $start_pos + (($idx_num_0_ph & 65535) << 1) | 0;
  $node_this_0_ph68_ph = $node_this_0_ph;
  $str_pos_0_ph67_ph = $str_pos_0_ph;
  $last_is_splitter_0_off0_ph66_ph = $last_is_splitter_0_off0_ph;
  L3471 : while (1) {
   if (($str_pos_0_ph67_ph & 65535) >= ($str_len & 65535)) {
    $str_pos_0_lcssa = $str_pos_0_ph67_ph;
    $last_is_splitter_0_off0_ph6683 = $last_is_splitter_0_off0_ph66_ph;
    label = 2740;
    break L3469;
   }
   $18 = $node_this_0_ph68_ph + 4 | 0;
   $last_is_splitter_0_off0_ph6688 = $last_is_splitter_0_off0_ph66_ph;
   $str_pos_0_ph6789 = $str_pos_0_ph67_ph;
   L3474 : while (1) {
    $str_pos_077 = $str_pos_0_ph6789;
    while (1) {
     $23 = HEAP8[$splstr + ($str_pos_077 & 65535) | 0] | 0;
     if (__ZN10ime_pinyin12SpellingTrie17is_valid_spl_charEc($23) | 0) {
      break L3474;
     }
     HEAP16[$id_this >> 1] = HEAP16[$18 >> 1] & 2047;
     if (__ZNK10ime_pinyin12SpellingTrie18if_valid_id_updateEPt(HEAP32[$8 >> 2] | 0, $id_this) | 0) {
      label = 2720;
      break L3471;
     }
     if (!$last_is_splitter_0_off0_ph6688) {
      $_0 = $idx_num_0_ph;
      label = 2750;
      break L3469;
     }
     $43 = $str_pos_077 + 1 & 65535;
     if (!$12) {
      break;
     }
     HEAP16[$15 >> 1] = $43;
     if (($43 & 65535) < ($str_len & 65535)) {
      $str_pos_077 = $43;
     } else {
      $str_pos_0_lcssa = $43;
      $last_is_splitter_0_off0_ph6683 = $last_is_splitter_0_off0_ph6688;
      label = 2740;
      break L3469;
     }
    }
    if (($43 & 65535) < ($str_len & 65535)) {
     $last_is_splitter_0_off0_ph6688 = 1;
     $str_pos_0_ph6789 = $43;
    } else {
     $str_pos_0_lcssa = $43;
     $last_is_splitter_0_off0_ph6683 = 1;
     label = 2740;
     break L3469;
    }
   }
   do {
    if ($str_pos_077 << 16 >> 16 == 0) {
     $49 = $23 << 24 >> 24;
     if ($23 << 24 >> 24 > 96) {
      $found_son_0 = HEAP32[(HEAP32[$8 >> 2] | 0) + 56 + ($49 - 97 << 2) >> 2] | 0;
      break;
     } else {
      $found_son_0 = HEAP32[(HEAP32[$8 >> 2] | 0) + 56 + ($49 - 65 << 2) >> 2] | 0;
      break;
     }
    } else {
     $63 = HEAP32[$node_this_0_ph68_ph >> 2] | 0;
     $68 = (HEAPU16[$node_this_0_ph68_ph + 4 >> 1] | 0) >>> 11 & 65535;
     $i_0 = 0;
     while (1) {
      if (($i_0 | 0) >= ($68 | 0)) {
       label = 2735;
       break L3471;
      }
      if (__ZN10ime_pinyin12SpellingTrie16is_same_spl_charEcc(HEAP8[$63 + ($i_0 << 3) + 6 | 0] | 0, $23) | 0) {
       break;
      } else {
       $i_0 = $i_0 + 1 | 0;
      }
     }
     $found_son_0 = $63 + ($i_0 << 3) | 0;
    }
   } while (0);
   if (($found_son_0 | 0) == 0) {
    label = 2735;
    break;
   } else {
    $node_this_0_ph68_ph = $found_son_0;
    $str_pos_0_ph67_ph = $str_pos_077 + 1 & 65535;
    $last_is_splitter_0_off0_ph66_ph = 0;
   }
  }
  if ((label | 0) == 2735) {
   label = 0;
   HEAP16[$id_this1 >> 1] = HEAP16[$node_this_0_ph68_ph + 4 >> 1] & 2047;
   if (!(__ZNK10ime_pinyin12SpellingTrie18if_valid_id_updateEPt(HEAP32[$8 >> 2] | 0, $id_this1) | 0)) {
    $_0 = $idx_num_0_ph;
    label = 2747;
    break;
   }
   HEAP16[$spl_idx + (($idx_num_0_ph & 65535) << 1) >> 1] = HEAP16[$id_this1 >> 1] | 0;
   $91 = $idx_num_0_ph + 1 & 65535;
   if ($12) {
    HEAP16[$start_pos + (($91 & 65535) << 1) >> 1] = $str_pos_077;
   }
   if (($91 & 65535) < ($max_size & 65535)) {
    $str_pos_0_ph_be = $str_pos_077;
    $last_is_splitter_0_off0_ph_be = 0;
    $idx_num_0_ph_be = $91;
   } else {
    $_0 = $91;
    label = 2746;
    break;
   }
  } else if ((label | 0) == 2720) {
   label = 0;
   HEAP16[$spl_idx + (($idx_num_0_ph & 65535) << 1) >> 1] = HEAP16[$id_this >> 1] | 0;
   $34 = $idx_num_0_ph + 1 & 65535;
   $35 = $str_pos_077 + 1 & 65535;
   if ($12) {
    HEAP16[$start_pos + (($34 & 65535) << 1) >> 1] = $35;
   }
   if (($34 & 65535) < ($max_size & 65535)) {
    $str_pos_0_ph_be = $35;
    $last_is_splitter_0_off0_ph_be = 1;
    $idx_num_0_ph_be = $34;
   } else {
    $_0 = $34;
    label = 2751;
    break;
   }
  }
  $node_this_0_ph = HEAP32[(HEAP32[$8 >> 2] | 0) + 44 >> 2] | 0;
  $str_pos_0_ph = $str_pos_0_ph_be;
  $last_is_splitter_0_off0_ph = $last_is_splitter_0_off0_ph_be;
  $idx_num_0_ph = $idx_num_0_ph_be;
 }
 if ((label | 0) == 2740) {
  HEAP16[$id_this2 >> 1] = HEAP16[$node_this_0_ph68_ph + 4 >> 1] & 2047;
  do {
   if (__ZNK10ime_pinyin12SpellingTrie18if_valid_id_updateEPt(HEAP32[$8 >> 2] | 0, $id_this2) | 0) {
    HEAP16[$spl_idx + (($idx_num_0_ph & 65535) << 1) >> 1] = HEAP16[$id_this2 >> 1] | 0;
    $107 = $idx_num_0_ph + 1 & 65535;
    if (!$12) {
     $idx_num_1 = $107;
     break;
    }
    HEAP16[$start_pos + (($107 & 65535) << 1) >> 1] = $str_pos_0_lcssa;
    $idx_num_1 = $107;
   } else {
    $idx_num_1 = $idx_num_0_ph;
   }
  } while (0);
  HEAP8[$last_is_pre] = $last_is_splitter_0_off0_ph6683 & 1 ^ 1;
  $_0 = $idx_num_1;
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2746) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2747) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2750) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2751) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin14SpellingParser16splstr_to_idxs_fEPKctPtS3_tRb($this, $splstr, $str_len, $spl_idx, $start_pos, $max_size, $last_is_pre) {
 $this = $this | 0;
 $splstr = $splstr | 0;
 $str_len = $str_len | 0;
 $spl_idx = $spl_idx | 0;
 $start_pos = $start_pos | 0;
 $max_size = $max_size | 0;
 $last_is_pre = $last_is_pre | 0;
 var $1 = 0, $4 = 0, $5 = 0, $7 = 0, $pos_018 = 0, $9 = 0, $13 = 0, $14 = 0, $19 = 0;
 $1 = __ZN10ime_pinyin14SpellingParser14splstr_to_idxsEPKctPtS3_tRb($this, $splstr, $str_len, $spl_idx, $start_pos, $max_size, $last_is_pre) | 0;
 if ($1 << 16 >> 16 == 0) {
  return $1 | 0;
 }
 $4 = $this | 0;
 $5 = ($1 & 65535) - 1 | 0;
 $pos_018 = 0;
 $7 = 0;
 while (1) {
  $9 = $spl_idx + ($7 << 1) | 0;
  do {
   if (__ZNK10ime_pinyin12SpellingTrie16is_half_id_yunmuEt(HEAP32[$4 >> 2] | 0, HEAP16[$9 >> 1] | 0) | 0) {
    $13 = HEAP32[$4 >> 2] | 0;
    $14 = HEAP16[$9 >> 1] | 0;
    __ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt($13, $14, $9) | 0;
    if (($7 | 0) != ($5 | 0)) {
     break;
    }
    HEAP8[$last_is_pre] = 0;
   }
  } while (0);
  $19 = $pos_018 + 1 & 65535;
  if (($19 & 65535) < ($1 & 65535)) {
   $pos_018 = $19;
   $7 = $19 & 65535;
  } else {
   break;
  }
 }
 return $1 | 0;
}
function __ZN10ime_pinyin14SpellingParser16splstr16_to_idxsEPKttPtS3_tRb($this, $splstr, $str_len, $spl_idx, $start_pos, $max_size, $last_is_pre) {
 $this = $this | 0;
 $splstr = $splstr | 0;
 $str_len = $str_len | 0;
 $spl_idx = $spl_idx | 0;
 $start_pos = $start_pos | 0;
 $max_size = $max_size | 0;
 $last_is_pre = $last_is_pre | 0;
 var $id_this = 0, $id_this1 = 0, $id_this2 = 0, $9 = 0, $12 = 0, $13 = 0, $idx_num_0_ph = 0, $last_is_splitter_0_off0_ph = 0, $str_pos_0_ph = 0, $node_this_0_ph = 0, $16 = 0, $last_is_splitter_0_off0_ph66_ph = 0, $str_pos_0_ph67_ph = 0, $node_this_0_ph68_ph = 0, $19 = 0, $str_pos_0_ph6793 = 0, $last_is_splitter_0_off0_ph6692 = 0, $str_pos_081 = 0, $24 = 0, $25 = 0, $36 = 0, $37 = 0, $45 = 0, $51 = 0, $65 = 0, $70 = 0, $i_0 = 0, $found_son_0 = 0, $93 = 0, $idx_num_0_ph_be = 0, $last_is_splitter_0_off0_ph_be = 0, $str_pos_0_ph_be = 0, $last_is_splitter_0_off0_ph6687 = 0, $str_pos_0_lcssa = 0, $109 = 0, $idx_num_1 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $id_this = sp | 0;
 $id_this1 = sp + 8 | 0;
 $id_this2 = sp + 16 | 0;
 if (($splstr | 0) == 0 | $max_size << 16 >> 16 == 0 | $str_len << 16 >> 16 == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin12SpellingTrie17is_valid_spl_charEc(HEAP16[$splstr >> 1] & 255) | 0)) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 HEAP8[$last_is_pre] = 0;
 $9 = $this | 0;
 $12 = HEAP32[(HEAP32[$9 >> 2] | 0) + 44 >> 2] | 0;
 $13 = ($start_pos | 0) != 0;
 if ($13) {
  HEAP16[$start_pos >> 1] = 0;
  $node_this_0_ph = $12;
  $str_pos_0_ph = 0;
  $last_is_splitter_0_off0_ph = 0;
  $idx_num_0_ph = 0;
 } else {
  $node_this_0_ph = $12;
  $str_pos_0_ph = 0;
  $last_is_splitter_0_off0_ph = 0;
  $idx_num_0_ph = 0;
 }
 L3537 : while (1) {
  $16 = $start_pos + (($idx_num_0_ph & 65535) << 1) | 0;
  $node_this_0_ph68_ph = $node_this_0_ph;
  $str_pos_0_ph67_ph = $str_pos_0_ph;
  $last_is_splitter_0_off0_ph66_ph = $last_is_splitter_0_off0_ph;
  L3539 : while (1) {
   if (($str_pos_0_ph67_ph & 65535) >= ($str_len & 65535)) {
    $str_pos_0_lcssa = $str_pos_0_ph67_ph;
    $last_is_splitter_0_off0_ph6687 = $last_is_splitter_0_off0_ph66_ph;
    label = 2792;
    break L3537;
   }
   $19 = $node_this_0_ph68_ph + 4 | 0;
   $last_is_splitter_0_off0_ph6692 = $last_is_splitter_0_off0_ph66_ph;
   $str_pos_0_ph6793 = $str_pos_0_ph67_ph;
   L3542 : while (1) {
    $str_pos_081 = $str_pos_0_ph6793;
    while (1) {
     $24 = HEAP16[$splstr + (($str_pos_081 & 65535) << 1) >> 1] | 0;
     $25 = $24 & 255;
     if (__ZN10ime_pinyin12SpellingTrie17is_valid_spl_charEc($25) | 0) {
      break L3542;
     }
     HEAP16[$id_this >> 1] = HEAP16[$19 >> 1] & 2047;
     if (__ZNK10ime_pinyin12SpellingTrie18if_valid_id_updateEPt(HEAP32[$9 >> 2] | 0, $id_this) | 0) {
      label = 2772;
      break L3539;
     }
     if (!$last_is_splitter_0_off0_ph6692) {
      $_0 = $idx_num_0_ph;
      label = 2801;
      break L3537;
     }
     $45 = $str_pos_081 + 1 & 65535;
     if (!$13) {
      break;
     }
     HEAP16[$16 >> 1] = $45;
     if (($45 & 65535) < ($str_len & 65535)) {
      $str_pos_081 = $45;
     } else {
      $str_pos_0_lcssa = $45;
      $last_is_splitter_0_off0_ph6687 = $last_is_splitter_0_off0_ph6692;
      label = 2792;
      break L3537;
     }
    }
    if (($45 & 65535) < ($str_len & 65535)) {
     $last_is_splitter_0_off0_ph6692 = 1;
     $str_pos_0_ph6793 = $45;
    } else {
     $str_pos_0_lcssa = $45;
     $last_is_splitter_0_off0_ph6687 = 1;
     label = 2792;
     break L3537;
    }
   }
   do {
    if ($str_pos_081 << 16 >> 16 == 0) {
     $51 = $24 & 65535;
     if (($24 & 65535) > 96) {
      $found_son_0 = HEAP32[(HEAP32[$9 >> 2] | 0) + 56 + ($51 - 97 << 2) >> 2] | 0;
      break;
     } else {
      $found_son_0 = HEAP32[(HEAP32[$9 >> 2] | 0) + 56 + ($51 - 65 << 2) >> 2] | 0;
      break;
     }
    } else {
     $65 = HEAP32[$node_this_0_ph68_ph >> 2] | 0;
     $70 = (HEAPU16[$node_this_0_ph68_ph + 4 >> 1] | 0) >>> 11 & 65535;
     $i_0 = 0;
     while (1) {
      if (($i_0 | 0) >= ($70 | 0)) {
       label = 2787;
       break L3539;
      }
      if (__ZN10ime_pinyin12SpellingTrie16is_same_spl_charEcc(HEAP8[$65 + ($i_0 << 3) + 6 | 0] | 0, $25) | 0) {
       break;
      } else {
       $i_0 = $i_0 + 1 | 0;
      }
     }
     $found_son_0 = $65 + ($i_0 << 3) | 0;
    }
   } while (0);
   if (($found_son_0 | 0) == 0) {
    label = 2787;
    break;
   } else {
    $node_this_0_ph68_ph = $found_son_0;
    $str_pos_0_ph67_ph = $str_pos_081 + 1 & 65535;
    $last_is_splitter_0_off0_ph66_ph = 0;
   }
  }
  if ((label | 0) == 2787) {
   label = 0;
   HEAP16[$id_this1 >> 1] = HEAP16[$node_this_0_ph68_ph + 4 >> 1] & 2047;
   if (!(__ZNK10ime_pinyin12SpellingTrie18if_valid_id_updateEPt(HEAP32[$9 >> 2] | 0, $id_this1) | 0)) {
    $_0 = $idx_num_0_ph;
    label = 2798;
    break;
   }
   HEAP16[$spl_idx + (($idx_num_0_ph & 65535) << 1) >> 1] = HEAP16[$id_this1 >> 1] | 0;
   $93 = $idx_num_0_ph + 1 & 65535;
   if ($13) {
    HEAP16[$start_pos + (($93 & 65535) << 1) >> 1] = $str_pos_081;
   }
   if (($93 & 65535) < ($max_size & 65535)) {
    $str_pos_0_ph_be = $str_pos_081;
    $last_is_splitter_0_off0_ph_be = 0;
    $idx_num_0_ph_be = $93;
   } else {
    $_0 = $93;
    label = 2797;
    break;
   }
  } else if ((label | 0) == 2772) {
   label = 0;
   HEAP16[$spl_idx + (($idx_num_0_ph & 65535) << 1) >> 1] = HEAP16[$id_this >> 1] | 0;
   $36 = $idx_num_0_ph + 1 & 65535;
   $37 = $str_pos_081 + 1 & 65535;
   if ($13) {
    HEAP16[$start_pos + (($36 & 65535) << 1) >> 1] = $37;
   }
   if (($36 & 65535) < ($max_size & 65535)) {
    $str_pos_0_ph_be = $37;
    $last_is_splitter_0_off0_ph_be = 1;
    $idx_num_0_ph_be = $36;
   } else {
    $_0 = $36;
    label = 2800;
    break;
   }
  }
  $node_this_0_ph = HEAP32[(HEAP32[$9 >> 2] | 0) + 44 >> 2] | 0;
  $str_pos_0_ph = $str_pos_0_ph_be;
  $last_is_splitter_0_off0_ph = $last_is_splitter_0_off0_ph_be;
  $idx_num_0_ph = $idx_num_0_ph_be;
 }
 if ((label | 0) == 2792) {
  HEAP16[$id_this2 >> 1] = HEAP16[$node_this_0_ph68_ph + 4 >> 1] & 2047;
  do {
   if (__ZNK10ime_pinyin12SpellingTrie18if_valid_id_updateEPt(HEAP32[$9 >> 2] | 0, $id_this2) | 0) {
    HEAP16[$spl_idx + (($idx_num_0_ph & 65535) << 1) >> 1] = HEAP16[$id_this2 >> 1] | 0;
    $109 = $idx_num_0_ph + 1 & 65535;
    if (!$13) {
     $idx_num_1 = $109;
     break;
    }
    HEAP16[$start_pos + (($109 & 65535) << 1) >> 1] = $str_pos_0_lcssa;
    $idx_num_1 = $109;
   } else {
    $idx_num_1 = $idx_num_0_ph;
   }
  } while (0);
  HEAP8[$last_is_pre] = $last_is_splitter_0_off0_ph6687 & 1 ^ 1;
  $_0 = $idx_num_1;
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2797) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2798) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2800) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 2801) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin14SpellingParser18splstr16_to_idxs_fEPKttPtS3_tRb($this, $splstr, $str_len, $spl_idx, $start_pos, $max_size, $last_is_pre) {
 $this = $this | 0;
 $splstr = $splstr | 0;
 $str_len = $str_len | 0;
 $spl_idx = $spl_idx | 0;
 $start_pos = $start_pos | 0;
 $max_size = $max_size | 0;
 $last_is_pre = $last_is_pre | 0;
 var $1 = 0, $4 = 0, $5 = 0, $7 = 0, $pos_018 = 0, $9 = 0, $13 = 0, $14 = 0, $19 = 0;
 $1 = __ZN10ime_pinyin14SpellingParser16splstr16_to_idxsEPKttPtS3_tRb($this, $splstr, $str_len, $spl_idx, $start_pos, $max_size, $last_is_pre) | 0;
 if ($1 << 16 >> 16 == 0) {
  return $1 | 0;
 }
 $4 = $this | 0;
 $5 = ($1 & 65535) - 1 | 0;
 $pos_018 = 0;
 $7 = 0;
 while (1) {
  $9 = $spl_idx + ($7 << 1) | 0;
  do {
   if (__ZNK10ime_pinyin12SpellingTrie16is_half_id_yunmuEt(HEAP32[$4 >> 2] | 0, HEAP16[$9 >> 1] | 0) | 0) {
    $13 = HEAP32[$4 >> 2] | 0;
    $14 = HEAP16[$9 >> 1] | 0;
    __ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt($13, $14, $9) | 0;
    if (($7 | 0) != ($5 | 0)) {
     break;
    }
    HEAP8[$last_is_pre] = 0;
   }
  } while (0);
  $19 = $pos_018 + 1 & 65535;
  if (($19 & 65535) < ($1 & 65535)) {
   $pos_018 = $19;
   $7 = $19 & 65535;
  } else {
   break;
  }
 }
 return $1 | 0;
}
function __ZN10ime_pinyin14SpellingParser16get_splid_by_strEPKctPb($this, $splstr, $str_len, $is_pre) {
 $this = $this | 0;
 $splstr = $splstr | 0;
 $str_len = $str_len | 0;
 $is_pre = $is_pre | 0;
 var $start_pos = 0, $3 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $start_pos = sp + 8 | 0;
 if (($is_pre | 0) == 0) {
  STACKTOP = sp;
  return 0;
 }
 $3 = sp | 0;
 if ((__ZN10ime_pinyin14SpellingParser14splstr_to_idxsEPKctPtS3_tRb($this, $splstr, $str_len, $3, $start_pos | 0, 2, $is_pre) | 0) << 16 >> 16 == 1) {
  STACKTOP = sp;
  return ((HEAP16[$start_pos + 2 >> 1] | 0) == $str_len << 16 >> 16 ? HEAP16[$3 >> 1] | 0 : 0) | 0;
 } else {
  STACKTOP = sp;
  return 0;
 }
 return 0;
}
function __ZN10ime_pinyin14SpellingParser18get_splid_by_str_fEPKctPb($this, $splstr, $str_len, $is_pre) {
 $this = $this | 0;
 $splstr = $splstr | 0;
 $str_len = $str_len | 0;
 $is_pre = $is_pre | 0;
 var $start_pos = 0, $3 = 0, $12 = 0, $17 = 0, $18 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $start_pos = sp + 8 | 0;
 if (($is_pre | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $3 = sp | 0;
 if ((__ZN10ime_pinyin14SpellingParser14splstr_to_idxsEPKctPtS3_tRb($this, $splstr, $str_len, $3, $start_pos | 0, 2, $is_pre) | 0) << 16 >> 16 != 1) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if ((HEAP16[$start_pos + 2 >> 1] | 0) != $str_len << 16 >> 16) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $12 = $this | 0;
 if (__ZNK10ime_pinyin12SpellingTrie16is_half_id_yunmuEt(HEAP32[$12 >> 2] | 0, HEAP16[$3 >> 1] | 0) | 0) {
  $17 = HEAP32[$12 >> 2] | 0;
  $18 = HEAP16[$3 >> 1] | 0;
  __ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt($17, $18, $3) | 0;
  HEAP8[$is_pre] = 0;
 }
 $_0 = HEAP16[$3 >> 1] | 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin14SpellingParser19get_splids_parallelEPKctPttRtRb($this, $splstr, $str_len, $splidx, $max_size, $full_id_num, $is_pre) {
 $this = $this | 0;
 $splstr = $splstr | 0;
 $str_len = $str_len | 0;
 $splidx = $splidx | 0;
 $max_size = $max_size | 0;
 $full_id_num = $full_id_num | 0;
 $is_pre = $is_pre | 0;
 var $7 = 0, $_0 = 0;
 if ($max_size << 16 >> 16 == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin14SpellingParser17is_valid_to_parseEc(0, HEAP8[$splstr] | 0) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP16[$splidx >> 1] = __ZN10ime_pinyin14SpellingParser16get_splid_by_strEPKctPb($this, $splstr, $str_len, $is_pre) | 0;
 HEAP16[$full_id_num >> 1] = 0;
 $7 = HEAP16[$splidx >> 1] | 0;
 if ($7 << 16 >> 16 == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (($7 & 65535) <= 29) {
  $_0 = 1;
  return $_0 | 0;
 }
 HEAP16[$full_id_num >> 1] = 1;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDictC2Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin12AtomDictBaseC2Ev($this | 0);
 HEAP32[$this >> 2] = 8176;
 _memset($this + 8 | 0, 0, 100);
 __ZN10ime_pinyin8UserDict10cache_initEv($this);
 return;
}
function __ZN10ime_pinyin8UserDict10cache_initEv($this) {
 $this = $this | 0;
 __ZN10ime_pinyin8UserDict11reset_cacheEv($this);
 __ZN10ime_pinyin8UserDict16reset_miss_cacheEv($this);
 return;
}
function __ZN10ime_pinyin8UserDictD0Ev($this) {
 $this = $this | 0;
 __ZN10ime_pinyin8UserDictD2Ev($this);
 __ZdlPv($this);
 return;
}
function __ZN10ime_pinyin8UserDictD2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 8176;
 FUNCTION_TABLE_ii[HEAP32[(HEAP32[$this >> 2] | 0) + 12 >> 2] & 31]($this) | 0;
 return;
}
function __ZN10ime_pinyin8UserDict9load_dictEPKcjj($this, $file_name, $start_id, $end_id) {
 $this = $this | 0;
 $file_name = $file_name | 0;
 $start_id = $start_id | 0;
 $end_id = $end_id | 0;
 var $1 = 0, $2 = 0, $5 = 0, $13 = 0, $_0 = 0, label = 0;
 $1 = _strdup($file_name | 0) | 0;
 $2 = $this + 64 | 0;
 HEAP32[$2 >> 2] = $1;
 if (($1 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = $this + 16 | 0;
 HEAP32[$5 >> 2] = $start_id;
 if (__ZN10ime_pinyin8UserDict8validateEPKc($this, $file_name) | 0) {
  label = 2850;
 } else {
  if (__ZN10ime_pinyin8UserDict5resetEPKc(0, $file_name) | 0) {
   label = 2850;
  }
 }
 do {
  if ((label | 0) == 2850) {
   if (!(__ZN10ime_pinyin8UserDict4loadEPKcj($this, $file_name, $start_id) | 0)) {
    break;
   }
   HEAP32[$this + 104 >> 2] = 1;
   $13 = $this + 8 | 0;
   _gettimeofday($13 | 0, 0) | 0;
   $_0 = 1;
   return $_0 | 0;
  }
 } while (0);
 _free(HEAP32[$2 >> 2] | 0);
 HEAP32[$5 >> 2] = 0;
 $_0 = 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin13SpellingTable7arrangeEPjS1_($this, $item_size, $spl_num) {
 $this = $this | 0;
 $item_size = $item_size | 0;
 $spl_num = $spl_num | 0;
 var $1 = 0, $2 = 0, $5 = 0, $14 = 0, $17 = 0, $pos_042 = 0, $19 = 0, $20 = 0, $22 = 0, $29 = 0, $35 = 0, $pos1_037 = 0, $min_score_036 = 0.0, $39 = 0, $47 = 0, $53 = 0.0, $min_score_1 = 0.0, $57 = 0, $min_score_0_lcssa = 0.0, $62 = 0, $65 = 0, $pos2_033 = 0, $average_score_032 = 0.0, $70 = 0.0, $72 = 0.0, $76 = 0.0, $78 = 0, $79 = 0, $85 = 0, $86 = 0, $_lcssa = 0, $average_score_0_lcssa = 0.0, $89 = 0.0, $_0 = 0;
 $1 = $this + 8 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = $this + 12 | 0;
 if ((HEAP32[$5 >> 2] | 0) == 0 | ($item_size | 0) == 0 | ($spl_num | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 _qsort($2 | 0, HEAP32[$this + 4 >> 2] | 0, 16, 42);
 $14 = $this + 32 | 0;
 if ((HEAP32[$14 >> 2] | 0) != 0) {
  $17 = $this + 16 | 0;
  $pos_042 = 0;
  do {
   $19 = HEAP32[$5 >> 2] | 0;
   $20 = HEAP32[$17 >> 2] | 0;
   $22 = $19 + (Math_imul($20, $pos_042) | 0) | 0;
   _strncpy($22 | 0, (HEAP32[$1 >> 2] | 0) + ($pos_042 << 4) | 0, $20 | 0) | 0;
   $pos_042 = $pos_042 + 1 | 0;
  } while ($pos_042 >>> 0 < (HEAP32[$14 >> 2] | 0) >>> 0);
 }
 $29 = $this | 0;
 do {
  if ((HEAP8[$29] & 1) != 0) {
   if ((HEAP32[$14 >> 2] | 0) == 0) {
    $min_score_0_lcssa = 0.0;
   } else {
    $35 = $this + 24 | 0;
    $min_score_036 = 0.0;
    $pos1_037 = 0;
    while (1) {
     $39 = (HEAP32[$1 >> 2] | 0) + ($pos1_037 << 4) + 8 | 0;
     HEAPF64[$39 >> 3] = +HEAPF64[$39 >> 3] / +HEAPF64[$35 >> 3];
     do {
      if ((HEAP8[$29] & 1) == 0) {
       $min_score_1 = $min_score_036;
      } else {
       $47 = HEAP32[$1 >> 2] | 0;
       if (($pos1_037 | 0) == 0) {
        $min_score_1 = +HEAPF64[$47 + 8 >> 3];
        break;
       }
       $53 = +HEAPF64[$47 + ($pos1_037 << 4) + 8 >> 3];
       if ($53 >= $min_score_036) {
        $min_score_1 = $min_score_036;
        break;
       }
       $min_score_1 = $53;
      }
     } while (0);
     $57 = $pos1_037 + 1 | 0;
     if ($57 >>> 0 < (HEAP32[$14 >> 2] | 0) >>> 0) {
      $min_score_036 = $min_score_1;
      $pos1_037 = $57;
     } else {
      $min_score_0_lcssa = $min_score_1;
      break;
     }
    }
   }
   $62 = $this + 40 | 0;
   HEAPF64[$62 >> 3] = 255.0 / +Math_log(+$min_score_0_lcssa);
   L3674 : do {
    if ((HEAP32[$14 >> 2] | 0) == 0) {
     $average_score_0_lcssa = 0.0;
     $_lcssa = 0;
    } else {
     $65 = $this + 16 | 0;
     $average_score_032 = 0.0;
     $pos2_033 = 0;
     while (1) {
      $70 = +Math_log(+(+HEAPF64[(HEAP32[$1 >> 2] | 0) + ($pos2_033 << 4) + 8 >> 3]));
      $72 = $70 * +HEAPF64[$62 >> 3];
      if ($72 < 0.0) {
       break;
      }
      $76 = $average_score_032 + $72;
      $78 = HEAP32[$5 >> 2] | 0;
      $79 = HEAP32[$65 >> 2] | 0;
      HEAP8[$78 + ($79 - 1 + (Math_imul($79, $pos2_033) | 0)) | 0] = $72 > 255.0 ? -1 : ~~$72;
      $85 = $pos2_033 + 1 | 0;
      $86 = HEAP32[$14 >> 2] | 0;
      if ($85 >>> 0 < $86 >>> 0) {
       $average_score_032 = $76;
       $pos2_033 = $85;
      } else {
       $average_score_0_lcssa = $76;
       $_lcssa = $86;
       break L3674;
      }
     }
     ___assert_func(2320, 272, 6328, 3848);
     return 0;
    }
   } while (0);
   $89 = $average_score_0_lcssa / +($_lcssa >>> 0 >>> 0);
   if ($89 > 255.0) {
    ___assert_func(2320, 290, 6328, 2752);
    return 0;
   } else {
    HEAP8[$this + 48 | 0] = ~~$89;
    break;
   }
  }
 } while (0);
 HEAP32[$item_size >> 2] = HEAP32[$this + 16 >> 2];
 HEAP32[$spl_num >> 2] = HEAP32[$14 >> 2];
 HEAP8[$this + 49 | 0] = 1;
 $_0 = HEAP32[$5 >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict16reset_milestonesEtt($this, $from_step, $from_handle) {
 $this = $this | 0;
 $from_step = $from_step | 0;
 $from_handle = $from_handle | 0;
 return;
}
function __ZN10ime_pinyin8UserDict16number_of_lemmasEv($this) {
 $this = $this | 0;
 return HEAP32[$this + 80 >> 2] | 0;
}
function __ZN10ime_pinyin8UserDict14is_valid_stateEv($this) {
 $this = $this | 0;
 return (HEAP32[$this + 104 >> 2] | 0) != 0 | 0;
}
function __ZN10ime_pinyin8UserDict18is_prefix_spell_idEPKttPKNS0_18UserDictSearchableE($this, $fullids, $fulllen, $searchable) {
 $this = $this | 0;
 $fullids = $fullids | 0;
 $fulllen = $fulllen | 0;
 $searchable = $searchable | 0;
 var $1 = 0, $5 = 0, $i_0 = 0, $10 = 0, $12 = 0, $_0 = 0, label = 0;
 $1 = $searchable | 0;
 if ((HEAPU16[$1 >> 1] | 0) > ($fulllen & 65535)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = HEAPU16[$1 >> 1] | 0;
 $i_0 = 0;
 while (1) {
  if ($i_0 >>> 0 >= $5 >>> 0) {
   $_0 = 1;
   label = 2896;
   break;
  }
  $10 = HEAP16[$searchable + 2 + ($i_0 << 1) >> 1] | 0;
  $12 = HEAP16[$fullids + ($i_0 << 1) >> 1] | 0;
  if (($12 & 65535) < ($10 & 65535)) {
   $_0 = 0;
   label = 2895;
   break;
  }
  if (($12 & 65535 | 0) < ((HEAPU16[$searchable + 18 + ($i_0 << 1) >> 1] | 0) + ($10 & 65535) | 0)) {
   $i_0 = $i_0 + 1 | 0;
  } else {
   $_0 = 0;
   label = 2893;
   break;
  }
 }
 if ((label | 0) == 2893) {
  return $_0 | 0;
 } else if ((label | 0) == 2896) {
  return $_0 | 0;
 } else if ((label | 0) == 2895) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict14equal_spell_idEPKttPKNS0_18UserDictSearchableE($this, $fullids, $fulllen, $searchable) {
 $this = $this | 0;
 $fullids = $fullids | 0;
 $fulllen = $fulllen | 0;
 $searchable = $searchable | 0;
 var $1 = 0, $i_0 = 0, $8 = 0, $10 = 0, $_0 = 0, label = 0;
 $1 = $fulllen & 65535;
 if ((HEAP16[$searchable >> 1] | 0) == $fulllen << 16 >> 16) {
  $i_0 = 0;
 } else {
  $_0 = 0;
  return $_0 | 0;
 }
 while (1) {
  if ($i_0 >>> 0 >= $1 >>> 0) {
   $_0 = 1;
   label = 2904;
   break;
  }
  $8 = HEAP16[$searchable + 2 + ($i_0 << 1) >> 1] | 0;
  $10 = HEAP16[$fullids + ($i_0 << 1) >> 1] | 0;
  if (($10 & 65535) < ($8 & 65535)) {
   $_0 = 0;
   label = 2905;
   break;
  }
  if (($10 & 65535 | 0) < ((HEAPU16[$searchable + 18 + ($i_0 << 1) >> 1] | 0) + ($8 & 65535) | 0)) {
   $i_0 = $i_0 + 1 | 0;
  } else {
   $_0 = 0;
   label = 2902;
   break;
  }
 }
 if ((label | 0) == 2904) {
  return $_0 | 0;
 } else if ((label | 0) == 2902) {
  return $_0 | 0;
 } else if ((label | 0) == 2905) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $offset) {
 $this = $this | 0;
 $offset = $offset | 0;
 return HEAP8[(HEAP32[$this + 24 >> 2] | 0) + (($offset & 2147483647) + 1) | 0] | 0;
}
function __ZN10ime_pinyin8UserDict8validateEPKc($this, $file) {
 $this = $this | 0;
 $file = $file | 0;
 var $version = 0, $dict_info = 0, $1 = 0, $7 = 0, $15 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $version = sp | 0;
 $dict_info = sp + 8 | 0;
 $1 = _fopen($file | 0, 3840) | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 do {
  if ((_fseek($1 | 0, 0, 2) | 0) == 0) {
   $7 = _ftell($1 | 0) | 0;
   if ($7 >>> 0 < 40) {
    break;
   }
   if ((_fseek($1 | 0, 0, 0) | 0) != 0) {
    break;
   }
   $15 = (_fread($version | 0, 1, 4, $1 | 0) | 0) >>> 0 > 3;
   if (!($15 & (HEAP32[$version >> 2] | 0) == 18015e4)) {
    break;
   }
   if ((_fseek($1 | 0, -36 | 0, 2) | 0) != 0) {
    break;
   }
   if ((_fread($dict_info | 0, 1, 36, $1 | 0) | 0) != 36) {
    break;
   }
   if (($7 | 0) != (__ZN10ime_pinyin8UserDict18get_dict_file_sizeEPNS0_12UserDictInfoE(0, $dict_info) | 0)) {
    break;
   }
   _fclose($1 | 0) | 0;
   $_0 = 1;
   STACKTOP = sp;
   return $_0 | 0;
  }
 } while (0);
 _fclose($1 | 0) | 0;
 $_0 = 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict5resetEPKc($this, $file) {
 $this = $this | 0;
 $file = $file | 0;
 var $version = 0, $1 = 0, $5 = 0, $6 = 0, $9 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $version = sp | 0;
 $1 = _fopen($file | 0, 2200) | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 HEAP32[$version >> 2] = 18015e4;
 $5 = _fwrite($version | 0, 1, 4, $1 | 0) | 0;
 $6 = sp + 8 | 0;
 _memset($6 | 0, 0, 36);
 $9 = ((_fwrite($6 | 0, 1, 36, $1 | 0) | 0) + $5 | 0) == 40;
 _fclose($1 | 0) | 0;
 if ($9) {
  $_0 = 1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 _unlink($file | 0) | 0;
 $_0 = 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict4loadEPKcj($this, $file, $start_id) {
 $this = $this | 0;
 $file = $file | 0;
 $start_id = $start_id | 0;
 var $dict_info = 0, $1 = 0, $7 = 0, $11 = 0, $14 = 0, $17 = 0, $21 = 0, $22 = 0, $28 = 0, $29 = 0, $32 = 0, $36 = 0, $37 = 0, $43 = 0, $44 = 0, $50 = 0, $51 = 0, $57 = 0, $58 = 0, $65 = 0, $readed_0155 = 0, $76 = 0, $readed_0_lcssa = 0, $82 = 0, $readed_1153 = 0, $96 = 0, $readed_2150 = 0, $readed_3147 = 0, $121 = 0, $125 = 0, $127 = 0, $readed_4144 = 0, $i_0143 = 0, $156 = 0, $syncs_0 = 0, $scores_0 = 0, $ids_0 = 0, $offsets_by_id_0 = 0, $predicts_0121 = 0, $offsets_by_id_0120 = 0, $ids_0119 = 0, $scores_0118 = 0, $syncs_0117 = 0, $predicts_0113 = 0, $offsets_by_id_0112 = 0, $ids_0111 = 0, $scores_0110 = 0, $syncs_0109 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40 | 0;
 $dict_info = sp | 0;
 $1 = _fopen($file | 0, 3840) | 0;
 if (($1 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 do {
  if ((_fseek($1 | 0, -36 | 0, 2) | 0) == 0) {
   $7 = $dict_info;
   if ((_fread($7 | 0, 1, 36, $1 | 0) | 0) != 36) {
    break;
   }
   $11 = $dict_info + 16 | 0;
   $14 = _malloc((HEAP32[$11 >> 2] | 0) + 1088 | 0) | 0;
   if (($14 | 0) == 0) {
    break;
   }
   $17 = $dict_info + 12 | 0;
   $21 = _malloc((HEAP32[$17 >> 2] << 2) + 128 | 0) | 0;
   $22 = $21;
   if (($21 | 0) == 0) {
    $syncs_0117 = 0;
    $scores_0118 = 0;
    $ids_0119 = 0;
    $offsets_by_id_0120 = 0;
    $predicts_0121 = 0;
    label = 2966;
   } else {
    $28 = _malloc((HEAP32[$17 >> 2] << 2) + 128 | 0) | 0;
    $29 = $28;
    L3746 : do {
     if (($28 | 0) == 0) {
      $offsets_by_id_0 = 0;
      $ids_0 = 0;
      $scores_0 = 0;
      $syncs_0 = 0;
     } else {
      $32 = $dict_info + 28 | 0;
      $36 = _malloc((HEAP32[$32 >> 2] << 2) + 128 | 0) | 0;
      $37 = $36;
      if (($36 | 0) == 0) {
       $offsets_by_id_0 = 0;
       $ids_0 = 0;
       $scores_0 = 0;
       $syncs_0 = $37;
       break;
      }
      $43 = _malloc((HEAP32[$17 >> 2] << 2) + 128 | 0) | 0;
      $44 = $43;
      if (($43 | 0) == 0) {
       $offsets_by_id_0 = 0;
       $ids_0 = 0;
       $scores_0 = $44;
       $syncs_0 = $37;
       break;
      }
      $50 = _malloc((HEAP32[$17 >> 2] << 2) + 128 | 0) | 0;
      $51 = $50;
      if (($50 | 0) == 0) {
       $offsets_by_id_0 = 0;
       $ids_0 = $51;
       $scores_0 = $44;
       $syncs_0 = $37;
       break;
      }
      $57 = _malloc((HEAP32[$17 >> 2] << 2) + 128 | 0) | 0;
      $58 = $57;
      if (($57 | 0) == 0) {
       $offsets_by_id_0 = $58;
       $ids_0 = $51;
       $scores_0 = $44;
       $syncs_0 = $37;
       break;
      }
      if ((_fseek($1 | 0, 4, 0) | 0) != 0) {
       $offsets_by_id_0 = $58;
       $ids_0 = $51;
       $scores_0 = $44;
       $syncs_0 = $37;
       break;
      }
      L3753 : do {
       if ((HEAP32[$11 >> 2] | 0) == 0) {
        $readed_0_lcssa = 0;
       } else {
        $65 = HEAP32[$11 >> 2] | 0;
        $readed_0155 = 0;
        while (1) {
         if ((_ferror($1 | 0) | 0) != 0) {
          $readed_0_lcssa = $readed_0155;
          break L3753;
         }
         if ((_feof($1 | 0) | 0) != 0) {
          $readed_0_lcssa = $readed_0155;
          break L3753;
         }
         $76 = (_fread($14 + $readed_0155 | 0, 1, $65 - $readed_0155 | 0, $1 | 0) | 0) + $readed_0155 | 0;
         if ($76 >>> 0 < $65 >>> 0) {
          $readed_0155 = $76;
         } else {
          $readed_0_lcssa = $76;
          break;
         }
        }
       }
      } while (0);
      if ($readed_0_lcssa >>> 0 < (HEAP32[$11 >> 2] | 0) >>> 0) {
       $offsets_by_id_0 = $58;
       $ids_0 = $51;
       $scores_0 = $44;
       $syncs_0 = $37;
       break;
      }
      $82 = HEAP32[$17 >> 2] << 2;
      if (($82 | 0) != 0) {
       $readed_1153 = 0;
       do {
        if ((_ferror($1 | 0) | 0) != 0) {
         $offsets_by_id_0 = $58;
         $ids_0 = $51;
         $scores_0 = $44;
         $syncs_0 = $37;
         break L3746;
        }
        if ((_feof($1 | 0) | 0) != 0) {
         $offsets_by_id_0 = $58;
         $ids_0 = $51;
         $scores_0 = $44;
         $syncs_0 = $37;
         break L3746;
        }
        $readed_1153 = (_fread($21 + $readed_1153 | 0, 1, $82 - $readed_1153 | 0, $1 | 0) | 0) + $readed_1153 | 0;
       } while ($readed_1153 >>> 0 < $82 >>> 0);
      }
      $96 = HEAP32[$17 >> 2] << 2;
      do {
       if (($96 | 0) != 0) {
        $readed_2150 = 0;
        do {
         if ((_ferror($1 | 0) | 0) != 0) {
          $offsets_by_id_0 = $58;
          $ids_0 = $51;
          $scores_0 = $44;
          $syncs_0 = $37;
          break L3746;
         }
         if ((_feof($1 | 0) | 0) != 0) {
          $offsets_by_id_0 = $58;
          $ids_0 = $51;
          $scores_0 = $44;
          $syncs_0 = $37;
          break L3746;
         }
         $readed_2150 = (_fread($28 + $readed_2150 | 0, 1, $96 - $readed_2150 | 0, $1 | 0) | 0) + $readed_2150 | 0;
        } while ($readed_2150 >>> 0 < $96 >>> 0);
        if (($96 | 0) == 0) {
         break;
        } else {
         $readed_3147 = 0;
        }
        do {
         if ((_ferror($1 | 0) | 0) != 0) {
          $offsets_by_id_0 = $58;
          $ids_0 = $51;
          $scores_0 = $44;
          $syncs_0 = $37;
          break L3746;
         }
         if ((_feof($1 | 0) | 0) != 0) {
          $offsets_by_id_0 = $58;
          $ids_0 = $51;
          $scores_0 = $44;
          $syncs_0 = $37;
          break L3746;
         }
         $readed_3147 = (_fread($43 + $readed_3147 | 0, 1, $96 - $readed_3147 | 0, $1 | 0) | 0) + $readed_3147 | 0;
        } while ($readed_3147 >>> 0 < $96 >>> 0);
       }
      } while (0);
      $121 = HEAP32[$32 >> 2] << 2;
      if (($121 | 0) != 0) {
       $readed_4144 = 0;
       do {
        if ((_ferror($1 | 0) | 0) != 0) {
         $offsets_by_id_0 = $58;
         $ids_0 = $51;
         $scores_0 = $44;
         $syncs_0 = $37;
         break L3746;
        }
        if ((_feof($1 | 0) | 0) != 0) {
         $offsets_by_id_0 = $58;
         $ids_0 = $51;
         $scores_0 = $44;
         $syncs_0 = $37;
         break L3746;
        }
        $readed_4144 = (_fread($36 + $readed_4144 | 0, 1, $121 - $readed_4144 | 0, $1 | 0) | 0) + $readed_4144 | 0;
       } while ($readed_4144 >>> 0 < $121 >>> 0);
      }
      if ((HEAP32[$17 >> 2] | 0) != 0) {
       $125 = HEAP32[$17 >> 2] | 0;
       $127 = $125 >>> 0 > 1 ? $125 << 2 : 4;
       _memcpy($57 | 0, $21 | 0, $127) | 0;
       $i_0143 = 0;
       do {
        HEAP32[$51 + ($i_0143 << 2) >> 2] = $i_0143 + $start_id;
        $i_0143 = $i_0143 + 1 | 0;
       } while ($i_0143 >>> 0 < $125 >>> 0);
      }
      HEAP32[$this + 24 >> 2] = $14;
      HEAP32[$this + 28 >> 2] = $22;
      HEAP32[$this + 44 >> 2] = $37;
      HEAP32[$this + 48 >> 2] = (HEAP32[$32 >> 2] | 0) + 32;
      HEAP32[$this + 52 >> 2] = $58;
      HEAP32[$this + 32 >> 2] = $44;
      HEAP32[$this + 36 >> 2] = $51;
      HEAP32[$this + 40 >> 2] = $29;
      HEAP32[$this + 56 >> 2] = 32;
      HEAP32[$this + 60 >> 2] = 1088;
      $156 = $this + 68 | 0;
      _memcpy($156 | 0, $7 | 0, 36) | 0;
      HEAP32[$this + 104 >> 2] = 1;
      _fclose($1 | 0) | 0;
      $_0 = 1;
      STACKTOP = sp;
      return $_0 | 0;
     }
    } while (0);
    if (($14 | 0) == 0) {
     $syncs_0109 = $syncs_0;
     $scores_0110 = $scores_0;
     $ids_0111 = $ids_0;
     $offsets_by_id_0112 = $offsets_by_id_0;
     $predicts_0113 = $29;
    } else {
     $syncs_0117 = $syncs_0;
     $scores_0118 = $scores_0;
     $ids_0119 = $ids_0;
     $offsets_by_id_0120 = $offsets_by_id_0;
     $predicts_0121 = $29;
     label = 2966;
    }
   }
   if ((label | 0) == 2966) {
    _free($14);
    $syncs_0109 = $syncs_0117;
    $scores_0110 = $scores_0118;
    $ids_0111 = $ids_0119;
    $offsets_by_id_0112 = $offsets_by_id_0120;
    $predicts_0113 = $predicts_0121;
   }
   if (($21 | 0) != 0) {
    _free($21);
   }
   if (($syncs_0109 | 0) != 0) {
    _free($syncs_0109);
   }
   if (($scores_0110 | 0) != 0) {
    _free($scores_0110);
   }
   if (($ids_0111 | 0) != 0) {
    _free($ids_0111);
   }
   if (($offsets_by_id_0112 | 0) != 0) {
    _free($offsets_by_id_0112);
   }
   if (($predicts_0113 | 0) == 0) {
    break;
   }
   _free($predicts_0113);
  }
 } while (0);
 _fclose($1 | 0) | 0;
 $_0 = 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict10close_dictEv($this) {
 $this = $this | 0;
 var $2 = 0, $5 = 0, $6 = 0, label = 0;
 $2 = HEAP32[$this + 104 >> 2] | 0;
 if (($2 | 0) == 0) {
  return 1;
 } else if (($2 | 0) != 1) {
  label = 2985;
 }
 do {
  if ((label | 0) == 2985) {
   $5 = HEAP32[$this + 8 >> 2] | 0;
   $6 = HEAP32[5336] | 0;
   if (($5 | 0) <= ($6 | 0)) {
    if (($5 | 0) != ($6 | 0)) {
     break;
    }
    if ((HEAP32[$this + 12 >> 2] | 0) <= (HEAP32[5337] | 0)) {
     break;
    }
   }
   __ZN10ime_pinyin8UserDict10write_backEv($this);
   _gettimeofday(21344, 0) | 0;
  }
 } while (0);
 _free(HEAP32[$this + 64 >> 2] | 0);
 _free(HEAP32[$this + 24 >> 2] | 0);
 _free(HEAP32[$this + 28 >> 2] | 0);
 _free(HEAP32[$this + 52 >> 2] | 0);
 _free(HEAP32[$this + 32 >> 2] | 0);
 _free(HEAP32[$this + 36 >> 2] | 0);
 _free(HEAP32[$this + 40 >> 2] | 0);
 _memset($this + 20 | 0, 0, 88);
 return 1;
}
function __ZN10ime_pinyin8UserDict10write_backEv($this) {
 $this = $this | 0;
 var $1 = 0, $6 = 0, $9 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $this + 104 | 0;
 if ((HEAP32[$1 >> 2] | 0) >>> 0 < 2) {
  STACKTOP = sp;
  return;
 }
 $6 = _open(HEAP32[$this + 64 >> 2] | 0, 1, (tempInt = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 >> 3 << 3, HEAP32[tempInt >> 2] = 0, tempInt) | 0) | 0;
 if (($6 | 0) == -1) {
  STACKTOP = sp;
  return;
 }
 $9 = HEAP32[$1 >> 2] | 0;
 if (($9 | 0) == 5) {
  __ZN10ime_pinyin8UserDict16write_back_lemmaEi($this, $6);
 } else if (($9 | 0) == 6) {
  __ZN10ime_pinyin8UserDict14write_back_allEi($this, $6);
 } else if (($9 | 0) == 3) {
  __ZN10ime_pinyin8UserDict16write_back_scoreEi($this, $6);
 } else if (($9 | 0) == 2) {
  __ZN10ime_pinyin8UserDict15write_back_syncEi($this, $6);
 } else if (($9 | 0) == 4) {
  __ZN10ime_pinyin8UserDict17write_back_offsetEi($this, $6);
 }
 _ftruncate($6 | 0, _lseek($6 | 0, 0, 1) | 0) | 0;
 _close($6 | 0) | 0;
 HEAP32[$1 >> 2] = 1;
 STACKTOP = sp;
 return;
}
function __ZN10ime_pinyin8UserDict11extend_dictEtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj($this, $from_handle, $dep, $lpi_items, $lpi_max, $lpi_num) {
 $this = $this | 0;
 $from_handle = $from_handle | 0;
 $dep = $dep | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $lpi_num = $lpi_num | 0;
 var $need_extend = 0, $7 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $need_extend = sp | 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 HEAP8[$need_extend] = 0;
 $7 = __ZN10ime_pinyin8UserDict9_get_lpisEPKttPNS_10LmaPsbItemEjPb($this, $dep | 0, (HEAP16[$dep + 80 >> 1] | 0) + 1 & 65535, $lpi_items, $lpi_max, $need_extend) | 0;
 HEAP32[$lpi_num >> 2] = $7;
 if (($7 | 0) != 0) {
  $_0 = 1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $_0 = HEAP8[$need_extend] & 1;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict9_get_lpisEPKttPNS_10LmaPsbItemEjPb($this, $splid_str, $splid_str_len, $lpi_items, $lpi_max, $need_extend) {
 $this = $this | 0;
 $splid_str = $splid_str | 0;
 $splid_str_len = $splid_str_len | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 $need_extend = $need_extend | 0;
 var $searchable = 0, $start = 0, $count = 0, $tmp_extend_need_extend = 0, $6 = 0, $7 = 0, $23 = 0, $24 = 0, $26 = 0, $30 = 0, $middle_0 = 0, $max_off_0 = 0, $33 = 0, $34 = 0, $35 = 0, $middle_1 = 0, $42 = 0, $46 = 0, $47 = 0, $fuzzy_break_1_off0 = 0, $53 = 0, $prefix_break_1_off0 = 0, $77 = 0, $lpi_current_1 = 0, $middle_1_ph = 0, $lpi_current_0_ph = 0, $fuzzy_break_0_off0_ph = 0, $prefix_break_0_off0_ph = 0, $88 = 0, $90 = 0, $91 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 72 | 0;
 $searchable = sp + 8 | 0;
 $start = sp + 56 | 0;
 $count = sp + 64 | 0;
 $tmp_extend_need_extend = ($need_extend | 0) == 0 ? sp | 0 : $need_extend;
 HEAP8[$tmp_extend_need_extend] = 0;
 if (($lpi_max | 0) == 0 | (__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0) ^ 1) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $6 = HEAP32[$this + 8 >> 2] | 0;
 $7 = HEAP32[5336] | 0;
 do {
  if (($6 | 0) < ($7 | 0)) {
   label = 3017;
  } else {
   if (($6 | 0) != ($7 | 0)) {
    break;
   }
   if ((HEAP32[$this + 12 >> 2] | 0) < (HEAP32[5337] | 0)) {
    label = 3017;
   }
  }
 } while (0);
 if ((label | 0) == 3017) {
  FUNCTION_TABLE_vi[HEAP32[(HEAP32[$this >> 2] | 0) + 76 >> 2] & 127]($this);
 }
 __ZN10ime_pinyin8UserDict14prepare_locateEPNS0_18UserDictSearchableEPKtt(0, $searchable, $splid_str, $splid_str_len);
 $23 = HEAP32[$this + 80 >> 2] | 0;
 $24 = __ZN10ime_pinyin8UserDict9cache_hitEPNS0_18UserDictSearchableEPjS3_($this, $searchable, $start, $count) | 0;
 if ($24) {
  $26 = HEAP32[$start >> 2] | 0;
  $max_off_0 = (HEAP32[$count >> 2] | 0) + $26 | 0;
  $middle_0 = $26;
 } else {
  $30 = __ZN10ime_pinyin8UserDict23locate_first_in_offsetsEPKNS0_18UserDictSearchableE($this, $searchable) | 0;
  HEAP32[$start >> 2] = $30;
  $max_off_0 = $23;
  $middle_0 = $30;
 }
 if (($middle_0 | 0) == -1) {
  if ($24) {
   $_0 = 0;
   STACKTOP = sp;
   return $_0 | 0;
  }
  __ZN10ime_pinyin8UserDict10cache_pushENS0_17UserDictCacheTypeEPNS0_18UserDictSearchableEjj($this, 1, $searchable, 0, 0);
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $33 = $this + 28 | 0;
 $34 = $this + 32 | 0;
 $35 = $this + 36 | 0;
 $prefix_break_0_off0_ph = 0;
 $fuzzy_break_0_off0_ph = 0;
 $lpi_current_0_ph = 0;
 $middle_1_ph = $middle_0;
 L3867 : while (1) {
  $88 = $lpi_current_0_ph >>> 0 < $lpi_max >>> 0;
  $middle_1 = $middle_1_ph;
  while (1) {
   if (!($88 & (($middle_1 >>> 0 >= $max_off_0 >>> 0 | $fuzzy_break_0_off0_ph | $prefix_break_0_off0_ph) ^ 1))) {
    break L3867;
   }
   $42 = HEAP32[(HEAP32[$33 >> 2] | 0) + ($middle_1 << 2) >> 2] | 0;
   if (($42 | 0) < 0) {
    $middle_1 = $middle_1 + 1 | 0;
   } else {
    break;
   }
  }
  $46 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $42) | 0;
  $47 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $42) | 0;
  if ($24) {
   $fuzzy_break_1_off0 = $fuzzy_break_0_off0_ph;
  } else {
   $fuzzy_break_1_off0 = $fuzzy_break_0_off0_ph | (__ZN10ime_pinyin8UserDict22fuzzy_compare_spell_idEPKttPKNS0_18UserDictSearchableE(0, $47, $46 & 255, $searchable) | 0) != 0;
  }
  do {
   if ($prefix_break_0_off0_ph) {
    $prefix_break_1_off0 = 1;
   } else {
    $53 = $46 & 255;
    if ((__ZN10ime_pinyin8UserDict24is_fuzzy_prefix_spell_idEPKttPKNS0_18UserDictSearchableE(0, $47, $53, $searchable) | 0) == 0) {
     $prefix_break_1_off0 = 1;
     break;
    }
    if ((HEAP8[$tmp_extend_need_extend] & 1) != 0) {
     $prefix_break_1_off0 = $prefix_break_0_off0_ph;
     break;
    }
    if (!(__ZN10ime_pinyin8UserDict18is_prefix_spell_idEPKttPKNS0_18UserDictSearchableE(0, $47, $53, $searchable) | 0)) {
     $prefix_break_1_off0 = $prefix_break_0_off0_ph;
     break;
    }
    HEAP8[$tmp_extend_need_extend] = 1;
    $prefix_break_1_off0 = $prefix_break_0_off0_ph;
   }
  } while (0);
  if (__ZN10ime_pinyin8UserDict14equal_spell_idEPKttPKNS0_18UserDictSearchableE(0, $47, $46 & 255, $searchable) | 0) {
   HEAP16[$lpi_items + ($lpi_current_0_ph << 3) + 4 >> 1] = __ZN10ime_pinyin8UserDict15translate_scoreEi($this, HEAP32[(HEAP32[$34 >> 2] | 0) + ($middle_1 << 2) >> 2] | 0) | 0;
   $77 = $lpi_items + ($lpi_current_0_ph << 3) | 0;
   HEAP32[$77 >> 2] = HEAP32[(HEAP32[$35 >> 2] | 0) + ($middle_1 << 2) >> 2] & 16777215 | ($46 & 255) << 24 & 251658240 | HEAP32[$77 >> 2] & -268435456;
   $lpi_current_1 = $lpi_current_0_ph + 1 | 0;
  } else {
   $lpi_current_1 = $lpi_current_0_ph;
  }
  $prefix_break_0_off0_ph = $prefix_break_1_off0;
  $fuzzy_break_0_off0_ph = $fuzzy_break_1_off0;
  $lpi_current_0_ph = $lpi_current_1;
  $middle_1_ph = $middle_1 + 1 | 0;
 }
 if ($24) {
  $_0 = $lpi_current_0_ph;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $90 = HEAP32[$start >> 2] | 0;
 $91 = $middle_1 - $90 | 0;
 HEAP32[$count >> 2] = $91;
 __ZN10ime_pinyin8UserDict10cache_pushENS0_17UserDictCacheTypeEPNS0_18UserDictSearchableEjj($this, 0, $searchable, $90, $91);
 $_0 = $lpi_current_0_ph;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict24is_fuzzy_prefix_spell_idEPKttPKNS0_18UserDictSearchableE($this, $id1, $len1, $searchable) {
 $this = $this | 0;
 $id1 = $id1 | 0;
 $len1 = $len1 | 0;
 $searchable = $searchable | 0;
 var $1 = 0, $5 = 0, $i_0 = 0, $14 = 0, $19 = 0, $_0 = 0, label = 0;
 $1 = $searchable | 0;
 if ((HEAPU16[$1 >> 1] | 0) > ($len1 & 65535)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $i_0 = 0;
 while (1) {
  if ($i_0 >>> 0 >= (HEAPU16[$1 >> 1] | 0) >>> 0) {
   $_0 = 1;
   label = 3052;
   break;
  }
  $14 = HEAP8[__ZN10ime_pinyin12SpellingTrie16get_spelling_strEt($5, HEAP16[$id1 + ($i_0 << 1) >> 1] | 0) | 0] | 0;
  $19 = $i_0 << 3 & 24;
  if (($14 << 24 >> 24 | 0) == ((HEAP32[$searchable + 36 + ($i_0 >>> 2 << 2) >> 2] & 255 << $19) >>> ($19 >>> 0) << 24 >> 24 | 0)) {
   $i_0 = $i_0 + 1 | 0;
  } else {
   $_0 = 0;
   label = 3051;
   break;
  }
 }
 if ((label | 0) == 3051) {
  return $_0 | 0;
 } else if ((label | 0) == 3052) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict22fuzzy_compare_spell_idEPKttPKNS0_18UserDictSearchableE($this, $id1, $len1, $searchable) {
 $this = $this | 0;
 $id1 = $id1 | 0;
 $len1 = $len1 | 0;
 $searchable = $searchable | 0;
 var $1 = 0, $3 = 0, $8 = 0, $i_0 = 0, $15 = 0, $20 = 0, $24 = 0, $25 = 0, $_0 = 0, label = 0;
 $1 = $len1 & 65535;
 $3 = HEAP16[$searchable >> 1] | 0;
 if (($3 & 65535) > ($len1 & 65535)) {
  $_0 = -1;
  return $_0 | 0;
 }
 if (($3 & 65535) < ($len1 & 65535)) {
  $_0 = 1;
  return $_0 | 0;
 }
 $8 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $i_0 = 0;
 while (1) {
  if ($i_0 >>> 0 >= $1 >>> 0) {
   $_0 = 0;
   label = 3061;
   break;
  }
  $15 = HEAP8[__ZN10ime_pinyin12SpellingTrie16get_spelling_strEt($8, HEAP16[$id1 + ($i_0 << 1) >> 1] | 0) | 0] | 0;
  $20 = $i_0 << 3 & 24;
  $24 = $15 << 24 >> 24;
  $25 = (HEAP32[$searchable + 36 + ($i_0 >>> 2 << 2) >> 2] & 255 << $20) >>> ($20 >>> 0) << 24 >> 24;
  if (($24 | 0) == ($25 | 0)) {
   $i_0 = $i_0 + 1 | 0;
  } else {
   break;
  }
 }
 if ((label | 0) == 3061) {
  return $_0 | 0;
 }
 $_0 = ($24 | 0) > ($25 | 0) ? 1 : -1;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict23locate_first_in_offsetsEPKNS0_18UserDictSearchableE($this, $searchable) {
 $this = $this | 0;
 $searchable = $searchable | 0;
 var $3 = 0, $first_prefix_0_ph = 0, $end_0_ph_in = 0, $begin_0_ph = 0, $end_0_ph = 0, $first_prefix_0 = 0, $begin_0 = 0, $8 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $first_prefix_0_ = 0;
 $3 = $this + 28 | 0;
 $begin_0_ph = 0;
 $end_0_ph_in = HEAP32[$this + 80 >> 2] | 0;
 $first_prefix_0_ph = -1;
 L3915 : while (1) {
  $end_0_ph = $end_0_ph_in - 1 | 0;
  $begin_0 = $begin_0_ph;
  $first_prefix_0 = $first_prefix_0_ph;
  while (1) {
   if (($begin_0 | 0) > ($end_0_ph | 0)) {
    break L3915;
   }
   $8 = $begin_0 + $end_0_ph >> 1;
   $11 = HEAP32[(HEAP32[$3 >> 2] | 0) + ($8 << 2) >> 2] | 0;
   $12 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $11) | 0;
   $13 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $11) | 0;
   $14 = $12 & 255;
   $15 = __ZN10ime_pinyin8UserDict22fuzzy_compare_spell_idEPKttPKNS0_18UserDictSearchableE(0, $13, $14, $searchable) | 0;
   $first_prefix_0_ = (__ZN10ime_pinyin8UserDict24is_fuzzy_prefix_spell_idEPKttPKNS0_18UserDictSearchableE(0, $13, $14, $searchable) | 0) == 0 ? $first_prefix_0 : $8;
   if (($15 | 0) < 0) {
    $begin_0 = $8 + 1 | 0;
    $first_prefix_0 = $first_prefix_0_;
   } else {
    $begin_0_ph = $begin_0;
    $end_0_ph_in = $8;
    $first_prefix_0_ph = $first_prefix_0_;
    continue L3915;
   }
  }
 }
 return $first_prefix_0 | 0;
}
function __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $offset) {
 $this = $this | 0;
 $offset = $offset | 0;
 return (HEAP32[$this + 24 >> 2] | 0) + (($offset & 2147483647) + 2) | 0;
}
function __ZN10ime_pinyin8UserDict10load_cacheEPNS0_18UserDictSearchableEPjS3_($this, $searchable, $offset, $length) {
 $this = $this | 0;
 $searchable = $searchable | 0;
 $offset = $offset | 0;
 $length = $length | 0;
 var $4 = 0, $6 = 0, $7 = 0, $i_0 = 0, $10 = 0, $j_0 = 0, $12 = 0, $22 = 0, $_ = 0, $_0 = 0, label = 0;
 $4 = (HEAPU16[$searchable >> 1] | 0) - 1 | 0;
 $6 = HEAP16[$this + 588 + ($4 * 68 | 0) + 64 >> 1] | 0;
 $7 = $this + 588 + ($4 * 68 | 0) + 66 | 0;
 if ($6 << 16 >> 16 == (HEAP16[$7 >> 1] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $i_0 = $6;
 }
 L3925 : while (1) {
  $10 = $i_0 & 65535;
  $j_0 = 0;
  while (1) {
   $12 = $j_0 & 65535;
   if (($j_0 & 65535) >= 2) {
    break L3925;
   }
   if ((HEAP32[$this + 588 + ($4 * 68 | 0) + ($10 << 3) + ($12 << 2) >> 2] | 0) == (HEAP32[$searchable + 36 + ($12 << 2) >> 2] | 0)) {
    $j_0 = $j_0 + 1 & 65535;
   } else {
    break;
   }
  }
  $22 = $i_0 + 1 & 65535;
  $_ = ($22 & 65535) > 3 ? $i_0 - 3 & 65535 : $22;
  if ($_ << 16 >> 16 == (HEAP16[$7 >> 1] | 0)) {
   $_0 = 0;
   label = 3080;
   break;
  } else {
   $i_0 = $_;
  }
 }
 if ((label | 0) == 3080) {
  return $_0 | 0;
 }
 HEAP32[$offset >> 2] = HEAP32[$this + 588 + ($4 * 68 | 0) + 32 + ($10 << 2) >> 2];
 HEAP32[$length >> 2] = HEAP32[$this + 588 + ($4 * 68 | 0) + 48 + ($10 << 2) >> 2];
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict27remove_lemma_from_sync_listEj($this, $offset) {
 $this = $this | 0;
 $offset = $offset | 0;
 var $1 = 0, $2 = 0, $3 = 0, $i_0 = 0, $15 = 0, $20 = 0;
 $1 = $this + 44 | 0;
 $2 = $this + 96 | 0;
 $3 = HEAP32[$2 >> 2] | 0;
 $i_0 = 0;
 while (1) {
  if ($i_0 >>> 0 >= $3 >>> 0) {
   break;
  }
  if (((HEAP32[(HEAP32[$1 >> 2] | 0) + ($i_0 << 2) >> 2] ^ $offset) & 2147483647 | 0) == 0) {
   break;
  } else {
   $i_0 = $i_0 + 1 | 0;
  }
 }
 $15 = HEAP32[$2 >> 2] | 0;
 if ($i_0 >>> 0 >= $15 >>> 0) {
  return;
 }
 $20 = HEAP32[$this + 44 >> 2] | 0;
 HEAP32[$20 + ($i_0 << 2) >> 2] = HEAP32[$20 + ($15 - 1 << 2) >> 2];
 HEAP32[$2 >> 2] = (HEAP32[$2 >> 2] | 0) - 1;
 return;
}
function __ZN10ime_pinyin8UserDict30remove_lemma_from_predict_listEj($this, $offset) {
 $this = $this | 0;
 $offset = $offset | 0;
 var $2 = 0, $3 = 0, $i_0 = 0, $8 = 0, $9 = 0, label = 0;
 $2 = HEAP32[$this + 80 >> 2] | 0;
 $3 = $this + 40 | 0;
 $i_0 = 0;
 while (1) {
  if ($i_0 >>> 0 >= $2 >>> 0) {
   label = 3095;
   break;
  }
  $8 = (HEAP32[$3 >> 2] | 0) + ($i_0 << 2) | 0;
  $9 = HEAP32[$8 >> 2] | 0;
  if ((($9 ^ $offset) & 2147483647 | 0) == 0) {
   break;
  } else {
   $i_0 = $i_0 + 1 | 0;
  }
 }
 if ((label | 0) == 3095) {
  return;
 }
 HEAP32[$8 >> 2] = $9 | -2147483648;
 return;
}
function __ZN10ime_pinyin8UserDict18get_dict_file_sizeEPNS0_12UserDictInfoE($this, $info) {
 $this = $this | 0;
 $info = $info | 0;
 var $4 = 0;
 $4 = HEAP32[$info + 12 >> 2] | 0;
 return (HEAP32[$info + 16 >> 2] | 0) + 40 + ($4 << 3) + ((HEAP32[$info + 28 >> 2] | 0) + $4 << 2) | 0;
}
function __ZN10ime_pinyin8UserDict14prepare_locateEPNS0_18UserDictSearchableEPKtt($this, $searchable, $splid_str, $splid_str_len) {
 $this = $this | 0;
 $searchable = $searchable | 0;
 $splid_str = $splid_str | 0;
 $splid_str_len = $splid_str_len | 0;
 var $3 = 0, $4 = 0, $5 = 0, $i_027 = 0, $7 = 0, $26 = 0, $28 = 0;
 HEAP16[$searchable >> 1] = $splid_str_len;
 $3 = $searchable + 36 | 0;
 HEAP32[$3 >> 2] = 0;
 HEAP32[$3 + 4 >> 2] = 0;
 $4 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 $5 = $splid_str_len & 65535;
 if ($splid_str_len << 16 >> 16 == 0) {
  return;
 } else {
  $i_027 = 0;
 }
 do {
  $7 = $splid_str + ($i_027 << 1) | 0;
  if (__ZNK10ime_pinyin12SpellingTrie10is_half_idEt($4, HEAP16[$7 >> 1] | 0) | 0) {
   HEAP16[$searchable + 18 + ($i_027 << 1) >> 1] = __ZNK10ime_pinyin12SpellingTrie12half_to_fullEtPt($4, HEAP16[$7 >> 1] | 0, $searchable + 2 + ($i_027 << 1) | 0) | 0;
  } else {
   HEAP16[$searchable + 18 + ($i_027 << 1) >> 1] = 1;
   HEAP16[$searchable + 2 + ($i_027 << 1) >> 1] = HEAP16[$7 >> 1] | 0;
  }
  $26 = (HEAPU8[__ZN10ime_pinyin12SpellingTrie16get_spelling_strEt($4, HEAP16[$7 >> 1] | 0) | 0] | 0) << ($i_027 << 3 & 24);
  $28 = $searchable + 36 + ($i_027 >>> 2 << 2) | 0;
  HEAP32[$28 >> 2] = $26 | HEAP32[$28 >> 2];
  $i_027 = $i_027 + 1 | 0;
 } while ($i_027 >>> 0 < $5 >>> 0);
 return;
}
function __ZN10ime_pinyin8UserDict8get_lpisEPKttPNS_10LmaPsbItemEj($this, $splid_str, $splid_str_len, $lpi_items, $lpi_max) {
 $this = $this | 0;
 $splid_str = $splid_str | 0;
 $splid_str_len = $splid_str_len | 0;
 $lpi_items = $lpi_items | 0;
 $lpi_max = $lpi_max | 0;
 return __ZN10ime_pinyin8UserDict9_get_lpisEPKttPNS_10LmaPsbItemEjPb($this, $splid_str, $splid_str_len, $lpi_items, $lpi_max, 0) | 0;
}
function __ZN10ime_pinyin8UserDict9cache_hitEPNS0_18UserDictSearchableEPjS3_($this, $searchable, $offset, $length) {
 $this = $this | 0;
 $searchable = $searchable | 0;
 $offset = $offset | 0;
 $length = $length | 0;
 var $_0 = 0;
 if (__ZN10ime_pinyin8UserDict15load_miss_cacheEPNS0_18UserDictSearchableE($this, $searchable) | 0) {
  HEAP32[$offset >> 2] = 0;
  HEAP32[$length >> 2] = 0;
  $_0 = 1;
  return $_0 | 0;
 } else {
  $_0 = __ZN10ime_pinyin8UserDict10load_cacheEPNS0_18UserDictSearchableEPjS3_($this, $searchable, $offset, $length) | 0;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict10cache_pushENS0_17UserDictCacheTypeEPNS0_18UserDictSearchableEjj($this, $type, $searchable, $offset, $length) {
 $this = $this | 0;
 $type = $type | 0;
 $searchable = $searchable | 0;
 $offset = $offset | 0;
 $length = $length | 0;
 if (($type | 0) == 1) {
  __ZN10ime_pinyin8UserDict15save_miss_cacheEPNS0_18UserDictSearchableE($this, $searchable);
  return;
 } else if (($type | 0) == 0) {
  __ZN10ime_pinyin8UserDict10save_cacheEPNS0_18UserDictSearchableEjj($this, $searchable, $offset, $length);
  return;
 } else {
  return;
 }
}
function __ZN10ime_pinyin8UserDict15translate_scoreEi($this, $raw_score) {
 $this = $this | 0;
 $raw_score = $raw_score | 0;
 var $1 = 0, $5 = 0, $7$0 = 0, $8$0 = 0, $10$0 = 0, $11 = 0;
 $1 = __ZN10ime_pinyin8UserDict18extract_score_freqEi(0, $raw_score) | 0;
 $5 = HEAP32[$this + 8 >> 2] | 0;
 $7$0 = _i64Add($5, ($5 | 0) < 0 ? -1 : 0, -1229904e3, -1) | 0;
 $8$0 = ___udivdi3($7$0, tempRet0, 604800, 0) | 0;
 $10$0 = _i64Subtract($8$0 & 65535, tempRet0 & 0, $raw_score >>> 16, 0) | 0;
 $11 = $10$0;
 return ~~(+Math_log(+(+($1 >>> 0 >>> 0) * (($11 | 0) > 4 ? 16.0 : +(80 - ($11 << 4) | 0)) / +(((HEAP32[$this + 4 >> 2] | 0) + (HEAP32[$this + 100 >> 2] | 0) | 0) >>> 0 >>> 0))) * -800.0) | 0;
}
function __ZN10ime_pinyin8UserDict13get_lemma_strEjPtt($this, $id_lemma, $str_buf, $str_max) {
 $this = $this | 0;
 $id_lemma = $id_lemma | 0;
 $str_buf = $str_buf | 0;
 $str_max = $str_max | 0;
 var $11 = 0, $12 = 0, $13 = 0, $16 = 0, $_off0 = 0, $18 = 0, $20 = 0, $21 = 0, $i_015 = 0, $i_0_lcssa = 0, $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin8UserDict17is_valid_lemma_idEj($this, $id_lemma) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($id_lemma - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] | 0;
 $12 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $11) | 0;
 $13 = __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $11) | 0;
 $16 = ($str_max & 65535) - 1 | 0;
 $_off0 = ($12 & 255 | 0) < ($16 | 0) ? $12 & 255 : $16 & 65535;
 $18 = $_off0 & 65535;
 if ($_off0 << 16 >> 16 == 0) {
  $i_0_lcssa = 0;
 } else {
  $20 = $_off0 & 65535;
  $21 = $20 >>> 0 > 1;
  $i_015 = 0;
  do {
   HEAP16[$str_buf + ($i_015 << 1) >> 1] = HEAP16[$13 + ($i_015 << 1) >> 1] | 0;
   $i_015 = $i_015 + 1 | 0;
  } while (($i_015 | 0) < ($18 | 0));
  $i_0_lcssa = $21 ? $20 : 1;
 }
 HEAP16[$str_buf + ($i_0_lcssa << 1) >> 1] = 0;
 $_0 = $_off0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict17is_valid_lemma_idEj($this, $id) {
 $this = $this | 0;
 $id = $id | 0;
 var $_0 = 0;
 do {
  if ((HEAP32[$this + 16 >> 2] | 0) >>> 0 <= $id >>> 0) {
   if ((__ZN10ime_pinyin8UserDict16get_max_lemma_idEv($this) | 0) >>> 0 < $id >>> 0) {
    break;
   } else {
    $_0 = 1;
   }
   return $_0 | 0;
  }
 } while (0);
 $_0 = 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $offset) {
 $this = $this | 0;
 $offset = $offset | 0;
 var $1 = 0, $2 = 0;
 $1 = $offset & 2147483647;
 $2 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $1) | 0;
 return (HEAP32[$this + 24 >> 2] | 0) + ($1 + 2 + (($2 & 255) << 1)) | 0;
}
function __ZN10ime_pinyin8UserDict16get_lemma_splidsEjPttb($this, $id_lemma, $splids, $splids_max, $arg_valid) {
 $this = $this | 0;
 $id_lemma = $id_lemma | 0;
 $splids = $splids | 0;
 $splids_max = $splids_max | 0;
 $arg_valid = $arg_valid | 0;
 var $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $18 = 0, $21 = 0, $umax = 0, $i_012 = 0, $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict17is_valid_lemma_idEj($this, $id_lemma) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $9 = HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($id_lemma - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] | 0;
 $10 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $9) | 0;
 $11 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $9) | 0;
 $12 = $splids_max & 65535;
 $13 = $10 & 255;
 if (!($10 << 24 >> 24 != 0 & $splids_max << 16 >> 16 != 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $18 = ($10 & 255) > 1 ? -($10 & 255) | 0 : -1;
 $21 = ($splids_max & 65535) > 1 ? -($splids_max & 65535) | 0 : -1;
 $umax = $18 >>> 0 > $21 >>> 0 ? $18 : $21;
 $i_012 = 0;
 do {
  HEAP16[$splids + ($i_012 << 1) >> 1] = HEAP16[$11 + ($i_012 << 1) >> 1] | 0;
  $i_012 = $i_012 + 1 | 0;
 } while (($i_012 | 0) < ($13 | 0) & ($i_012 | 0) < ($12 | 0));
 $_0 = -$umax & 65535;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict7predictEPKttPNS_12NPredictItemEjj($this, $last_hzs, $hzs_len, $npre_items, $npre_max, $b4_used) {
 $this = $this | 0;
 $last_hzs = $last_hzs | 0;
 $hzs_len = $hzs_len | 0;
 $npre_items = $npre_items | 0;
 $npre_max = $npre_max | 0;
 $b4_used = $b4_used | 0;
 var $3 = 0, $4 = 0, $5 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $new_added_0_ph48 = 0, $j_0_ph47 = 0, $12 = 0, $j_041 = 0, $15 = 0, $j_0_be = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $32 = 0, $42 = 0, $44 = 0, $49 = 0, $50 = 0, $_0 = 0, label = 0;
 $3 = (HEAP32[$this + 80 >> 2] | 0) - 1 | 0;
 $4 = $hzs_len & 65535;
 $5 = __ZN10ime_pinyin8UserDict24locate_first_in_predictsEPKti($this, $last_hzs, $4) | 0;
 if (($5 | 0) == -1 | ($5 | 0) > ($3 | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = $this + 40 | 0;
 $9 = $last_hzs;
 $10 = $4 << 1;
 $11 = $this;
 $j_0_ph47 = $5;
 $new_added_0_ph48 = 0;
 L4014 : while (1) {
  $12 = HEAP32[$8 >> 2] | 0;
  $j_041 = $j_0_ph47;
  while (1) {
   $15 = HEAP32[$12 + ($j_041 << 2) >> 2] | 0;
   if (($15 | 0) >= 0) {
    $19 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $15) | 0;
    $20 = $19 << 24 >> 24;
    $21 = __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $15) | 0;
    $22 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $15) | 0;
    if ($20 >>> 0 > $4 >>> 0) {
     break;
    }
   }
   $j_0_be = $j_041 + 1 | 0;
   if (($j_0_be | 0) > ($3 | 0)) {
    $_0 = $new_added_0_ph48;
    label = 3160;
    break L4014;
   } else {
    $j_041 = $j_0_be;
   }
  }
  if (!((_memcmp($21 | 0, $9 | 0, $10 | 0) | 0) == 0 & $new_added_0_ph48 >>> 0 < $npre_max >>> 0)) {
   $_0 = $new_added_0_ph48;
   label = 3159;
   break;
  }
  $32 = (($19 & 255) < 7 ? $20 << 1 : 14) - $10 | 0;
  HEAP16[$npre_items + ($new_added_0_ph48 * 20 | 0) + 18 >> 1] = $hzs_len;
  HEAPF32[$npre_items + ($new_added_0_ph48 * 20 | 0) >> 2] = +(((FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$11 >> 2] | 0) + 60 >> 2] & 31]($this, $21, $22, $19 << 24 >> 24) | 0) & 65535) >>> 0);
  $42 = $npre_items + ($new_added_0_ph48 * 20 | 0) + 4 | 0;
  $44 = $21 + ($4 << 1) | 0;
  _memcpy($42 | 0, $44 | 0, $32) | 0;
  if ($32 >>> 0 < 14) {
   HEAP16[$npre_items + ($new_added_0_ph48 * 20 | 0) + 4 + ($32 >>> 1 << 1) >> 1] = 0;
  }
  $49 = $new_added_0_ph48 + 1 | 0;
  $50 = $j_041 + 1 | 0;
  if (($50 | 0) > ($3 | 0)) {
   $_0 = $49;
   label = 3161;
   break;
  } else {
   $j_0_ph47 = $50;
   $new_added_0_ph48 = $49;
  }
 }
 if ((label | 0) == 3160) {
  return $_0 | 0;
 } else if ((label | 0) == 3159) {
  return $_0 | 0;
 } else if ((label | 0) == 3161) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict24locate_first_in_predictsEPKti($this, $words, $lemma_len) {
 $this = $this | 0;
 $words = $words | 0;
 $lemma_len = $lemma_len | 0;
 var $3 = 0, $6 = 0, $begin_0_ph44 = 0, $end_0_ph43 = 0, $last_matched_0_ph42 = 0, $begin_040 = 0, $last_matched_039 = 0, $9 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $_lemma_len = 0, $k_0 = 0, $20 = 0, $22 = 0, $last_matched_0_ = 0, $last_matched_228 = 0, $28 = 0, $last_matched_230 = 0, $30 = 0, $last_matched_0_lcssa = 0, label = 0;
 $3 = (HEAP32[$this + 80 >> 2] | 0) - 1 | 0;
 if (($3 | 0) < 0) {
  $last_matched_0_lcssa = -1;
  return $last_matched_0_lcssa | 0;
 }
 $6 = HEAP32[$this + 28 >> 2] | 0;
 $last_matched_0_ph42 = -1;
 $end_0_ph43 = $3;
 $begin_0_ph44 = 0;
 L4034 : while (1) {
  $last_matched_039 = $last_matched_0_ph42;
  $begin_040 = $begin_0_ph44;
  L4036 : while (1) {
   $9 = $begin_040 + $end_0_ph43 >> 1;
   $11 = HEAP32[$6 + ($9 << 2) >> 2] | 0;
   $12 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $11) | 0;
   $13 = __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $11) | 0;
   $14 = $12 & 255;
   $15 = ($14 | 0) < ($lemma_len | 0);
   $_lemma_len = $15 ? $14 : $lemma_len;
   $k_0 = 0;
   while (1) {
    if ($k_0 >>> 0 >= $_lemma_len >>> 0) {
     label = 3169;
     break;
    }
    $20 = HEAP16[$13 + ($k_0 << 1) >> 1] | 0;
    $22 = HEAP16[$words + ($k_0 << 1) >> 1] | 0;
    if (($20 & 65535) < ($22 & 65535)) {
     $last_matched_228 = $last_matched_039;
     break;
    }
    if (($20 & 65535) > ($22 & 65535)) {
     $last_matched_230 = $last_matched_039;
     break L4036;
    } else {
     $k_0 = $k_0 + 1 | 0;
    }
   }
   if ((label | 0) == 3169) {
    label = 0;
    $last_matched_0_ = $15 ? $last_matched_039 : $9;
    if ($15) {
     $last_matched_228 = $last_matched_0_;
    } else {
     $last_matched_230 = $last_matched_0_;
     break;
    }
   }
   $28 = $9 + 1 | 0;
   if (($28 | 0) > ($end_0_ph43 | 0)) {
    $last_matched_0_lcssa = $last_matched_228;
    label = 3173;
    break L4034;
   } else {
    $last_matched_039 = $last_matched_228;
    $begin_040 = $28;
   }
  }
  $30 = $9 - 1 | 0;
  if (($begin_040 | 0) > ($30 | 0)) {
   $last_matched_0_lcssa = $last_matched_230;
   label = 3175;
   break;
  } else {
   $last_matched_0_ph42 = $last_matched_230;
   $end_0_ph43 = $30;
   $begin_0_ph44 = $begin_040;
  }
 }
 if ((label | 0) == 3175) {
  return $last_matched_0_lcssa | 0;
 } else if ((label | 0) == 3173) {
  return $last_matched_0_lcssa | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict17locate_in_offsetsEPtS1_t($this, $lemma_str, $splid_str, $lemma_len) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splid_str = $splid_str | 0;
 $lemma_len = $lemma_len | 0;
 var $searchable = 0, $start = 0, $count = 0, $2 = 0, $3 = 0, $5 = 0, $9 = 0, $off_0 = 0, $max_off_0 = 0, $13 = 0, $14 = 0, $off_126 = 0, $18 = 0, $off_1_be = 0, $22 = 0, $29 = 0, $i_0 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64 | 0;
 $searchable = sp | 0;
 $start = sp + 48 | 0;
 $count = sp + 56 | 0;
 $2 = HEAP32[$this + 80 >> 2] | 0;
 __ZN10ime_pinyin8UserDict14prepare_locateEPNS0_18UserDictSearchableEPKtt(0, $searchable, $splid_str, $lemma_len);
 $3 = __ZN10ime_pinyin8UserDict10load_cacheEPNS0_18UserDictSearchableEPjS3_($this, $searchable, $start, $count) | 0;
 if ($3) {
  $5 = HEAP32[$start >> 2] | 0;
  $max_off_0 = (HEAP32[$count >> 2] | 0) + $5 | 0;
  $off_0 = $5;
 } else {
  $9 = __ZN10ime_pinyin8UserDict23locate_first_in_offsetsEPKNS0_18UserDictSearchableE($this, $searchable) | 0;
  HEAP32[$start >> 2] = $9;
  $max_off_0 = $2;
  $off_0 = $9;
 }
 if (!(($off_0 | 0) != -1 & ($off_0 | 0) < ($max_off_0 | 0))) {
  $_0 = -1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $13 = $this + 28 | 0;
 $14 = $lemma_len & 65535;
 $off_126 = $off_0;
 L4057 : while (1) {
  $18 = HEAP32[(HEAP32[$13 >> 2] | 0) + ($off_126 << 2) >> 2] | 0;
  do {
   if (($18 | 0) >= 0) {
    $22 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $18) | 0;
    if (!$3) {
     if ((__ZN10ime_pinyin8UserDict22fuzzy_compare_spell_idEPKttPKNS0_18UserDictSearchableE(0, $22, $lemma_len, $searchable) | 0) != 0) {
      $_0 = -1;
      label = 3192;
      break L4057;
     }
    }
    if (!(__ZN10ime_pinyin8UserDict14equal_spell_idEPKttPKNS0_18UserDictSearchableE(0, $22, $lemma_len, $searchable) | 0)) {
     break;
    }
    $29 = __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $18) | 0;
    $i_0 = 0;
    while (1) {
     if ($i_0 >>> 0 >= $14 >>> 0) {
      $_0 = $off_126;
      label = 3193;
      break L4057;
     }
     if ((HEAP16[$29 + ($i_0 << 1) >> 1] | 0) == (HEAP16[$lemma_str + ($i_0 << 1) >> 1] | 0)) {
      $i_0 = $i_0 + 1 | 0;
     } else {
      break;
     }
    }
   }
  } while (0);
  $off_1_be = $off_126 + 1 | 0;
  if (($off_1_be | 0) < ($max_off_0 | 0)) {
   $off_126 = $off_1_be;
  } else {
   $_0 = -1;
   label = 3191;
   break;
  }
 }
 if ((label | 0) == 3192) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 3193) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 3191) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict34locate_where_to_insert_in_predictsEPKti($this, $words, $lemma_len) {
 $this = $this | 0;
 $words = $words | 0;
 $lemma_len = $lemma_len | 0;
 var $3 = 0, $6 = 0, $begin_0_ph46 = 0, $end_0_ph45 = 0, $last_matched_0_ph44 = 0, $begin_042 = 0, $last_matched_041 = 0, $9 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $_lemma_len = 0, $k_0 = 0, $20 = 0, $22 = 0, $29 = 0, $cmp_131 = 0, $31 = 0, $last_matched_0_lcssa = 0, label = 0;
 $3 = (HEAP32[$this + 80 >> 2] | 0) - 1 | 0;
 if (($3 | 0) < 0) {
  $last_matched_0_lcssa = $3;
  return $last_matched_0_lcssa | 0;
 }
 $6 = HEAP32[$this + 28 >> 2] | 0;
 $last_matched_0_ph44 = $3;
 $end_0_ph45 = $3;
 $begin_0_ph46 = 0;
 L4077 : while (1) {
  $last_matched_041 = $last_matched_0_ph44;
  $begin_042 = $begin_0_ph46;
  L4079 : while (1) {
   $9 = $begin_042 + $end_0_ph45 >> 1;
   $11 = HEAP32[$6 + ($9 << 2) >> 2] | 0;
   $12 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $11) | 0;
   $13 = __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $11) | 0;
   $14 = $12 & 255;
   $15 = ($14 | 0) < ($lemma_len | 0);
   $_lemma_len = $15 ? $14 : $lemma_len;
   $k_0 = 0;
   while (1) {
    if ($k_0 >>> 0 >= $_lemma_len >>> 0) {
     label = 3201;
     break;
    }
    $20 = HEAP16[$13 + ($k_0 << 1) >> 1] | 0;
    $22 = HEAP16[$words + ($k_0 << 1) >> 1] | 0;
    if (($20 & 65535) < ($22 & 65535)) {
     break;
    }
    if (($20 & 65535) > ($22 & 65535)) {
     $cmp_131 = $last_matched_041;
     break L4079;
    } else {
     $k_0 = $k_0 + 1 | 0;
    }
   }
   if ((label | 0) == 3201) {
    label = 0;
    if (!$15) {
     label = 3202;
     break;
    }
   }
   $29 = $9 + 1 | 0;
   if (($29 | 0) > ($end_0_ph45 | 0)) {
    $last_matched_0_lcssa = $9;
    label = 3208;
    break L4077;
   } else {
    $last_matched_041 = $9;
    $begin_042 = $29;
   }
  }
  if ((label | 0) == 3202) {
   label = 0;
   $cmp_131 = ($14 | 0) > ($lemma_len | 0) ? $last_matched_041 : $9;
  }
  $31 = $9 - 1 | 0;
  if (($begin_042 | 0) > ($31 | 0)) {
   $last_matched_0_lcssa = $cmp_131;
   label = 3206;
   break;
  } else {
   $last_matched_0_ph44 = $cmp_131;
   $end_0_ph45 = $31;
   $begin_0_ph46 = $begin_042;
  }
 }
 if ((label | 0) == 3206) {
  return $last_matched_0_lcssa | 0;
 } else if ((label | 0) == 3208) {
  return $last_matched_0_lcssa | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict12get_lemma_idEPtS1_t($this, $lemma_str, $splids, $lemma_len) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 var $1 = 0, $_0 = 0;
 $1 = __ZN10ime_pinyin8UserDict17locate_in_offsetsEPtS1_t($this, $lemma_str, $splids, $lemma_len) | 0;
 if (($1 | 0) == -1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = HEAP32[(HEAP32[$this + 36 >> 2] | 0) + ($1 << 2) >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict15get_lemma_scoreEj($this, $lemma_id) {
 $this = $this | 0;
 $lemma_id = $lemma_id | 0;
 var $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin8UserDict17is_valid_lemma_idEj($this, $lemma_id) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin8UserDict15translate_scoreEi($this, __ZN10ime_pinyin8UserDict16_get_lemma_scoreEj($this, $lemma_id) | 0) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict16_get_lemma_scoreEj($this, $lemma_id) {
 $this = $this | 0;
 $lemma_id = $lemma_id | 0;
 var $11 = 0, $12 = 0, $13 = 0, $16 = 0, $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin8UserDict17is_valid_lemma_idEj($this, $lemma_id) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($lemma_id - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] | 0;
 $12 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $11) | 0;
 $13 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $11) | 0;
 $16 = __ZN10ime_pinyin8UserDict17locate_in_offsetsEPtS1_t($this, __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $11) | 0, $13, $12 << 24 >> 24) | 0;
 if (($16 | 0) == -1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = HEAP32[(HEAP32[$this + 32 >> 2] | 0) + ($16 << 2) >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict15get_lemma_scoreEPtS1_t($this, $lemma_str, $splids, $lemma_len) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 var $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZN10ime_pinyin8UserDict15translate_scoreEi($this, __ZN10ime_pinyin8UserDict16_get_lemma_scoreEPtS1_t($this, $lemma_str, $splids, $lemma_len) | 0) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict16_get_lemma_scoreEPtS1_t($this, $lemma_str, $splids, $lemma_len) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 var $3 = 0, $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = __ZN10ime_pinyin8UserDict17locate_in_offsetsEPtS1_t($this, $lemma_str, $splids, $lemma_len) | 0;
 if (($3 | 0) == -1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = HEAP32[(HEAP32[$this + 32 >> 2] | 0) + ($3 << 2) >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict28remove_lemma_by_offset_indexEi($this, $offset_index) {
 $this = $this | 0;
 $offset_index = $offset_index | 0;
 var $6 = 0, $7 = 0, $9 = 0, $11 = 0, $16 = 0, $19 = 0, $_0 = 0;
 if (($offset_index | 0) == -1 | (__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0) ^ 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $6 = (HEAP32[$this + 28 >> 2] | 0) + ($offset_index << 2) | 0;
 $7 = HEAP32[$6 >> 2] | 0;
 $9 = (__ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $7) | 0) << 24 >> 24;
 HEAP32[$6 >> 2] = $7 | -2147483648;
 __ZN10ime_pinyin8UserDict27remove_lemma_from_sync_listEj($this, $7);
 __ZN10ime_pinyin8UserDict30remove_lemma_from_predict_listEj($this, $7);
 $11 = $this + 88 | 0;
 HEAP32[$11 >> 2] = (HEAP32[$11 >> 2] | 0) + 1;
 $16 = $this + 92 | 0;
 HEAP32[$16 >> 2] = (HEAP32[$16 >> 2] | 0) + ($9 << 2 | 2);
 $19 = $this + 104 | 0;
 if ((HEAP32[$19 >> 2] | 0) >= 4) {
  $_0 = 1;
  return $_0 | 0;
 }
 HEAP32[$19 >> 2] = 4;
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict12remove_lemmaEj($this, $lemma_id) {
 $this = $this | 0;
 $lemma_id = $lemma_id | 0;
 var $11 = 0, $12 = 0, $13 = 0, $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin8UserDict17is_valid_lemma_idEj($this, $lemma_id) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($lemma_id - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] | 0;
 $12 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $11) | 0;
 $13 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $11) | 0;
 $_0 = __ZN10ime_pinyin8UserDict28remove_lemma_by_offset_indexEi($this, __ZN10ime_pinyin8UserDict17locate_in_offsetsEPtS1_t($this, __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $11) | 0, $13, $12 << 24 >> 24) | 0) | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict11flush_cacheEv($this) {
 $this = $this | 0;
 var $2 = 0, $5 = 0;
 $2 = HEAP32[$this + 16 >> 2] | 0;
 $5 = _strdup(HEAP32[$this + 64 >> 2] | 0) | 0;
 if (($5 | 0) == 0) {
  return;
 }
 FUNCTION_TABLE_ii[HEAP32[(HEAP32[$this >> 2] | 0) + 12 >> 2] & 31]($this) | 0;
 FUNCTION_TABLE_iiiii[HEAP32[(HEAP32[$this >> 2] | 0) + 8 >> 2] & 31]($this, $5, $2, 6e5) | 0;
 _free($5);
 __ZN10ime_pinyin8UserDict10cache_initEv($this);
 return;
}
function __ZN10ime_pinyin8UserDict14write_back_allEi($this, $fd) {
 $this = $this | 0;
 $fd = $fd | 0;
 var $13 = 0;
 if ((_lseek($fd | 0, 4, 0) | 0) == -1) {
  return;
 }
 _write($fd | 0, HEAP32[$this + 24 >> 2] | 0, HEAP32[$this + 84 >> 2] | 0) | 0;
 $13 = $this + 80 | 0;
 _write($fd | 0, HEAP32[$this + 28 >> 2] | 0, HEAP32[$13 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 40 >> 2] | 0, HEAP32[$13 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 32 >> 2] | 0, HEAP32[$13 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 44 >> 2] | 0, HEAP32[$this + 96 >> 2] << 2 | 0) | 0;
 _write($fd | 0, $this + 68 | 0, 36) | 0;
 return;
}
function __ZN10ime_pinyin8UserDict10save_cacheEPNS0_18UserDictSearchableEjj($this, $searchable, $offset, $length) {
 $this = $this | 0;
 $searchable = $searchable | 0;
 $offset = $offset | 0;
 $length = $length | 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $16 = 0, $_ = 0, $19 = 0, $20 = 0, $23 = 0;
 $4 = (HEAPU16[$searchable >> 1] | 0) - 1 | 0;
 $5 = $this + 588 + ($4 * 68 | 0) + 66 | 0;
 $6 = HEAP16[$5 >> 1] | 0;
 $7 = $6 & 65535;
 HEAP32[$this + 588 + ($4 * 68 | 0) + 32 + ($7 << 2) >> 2] = $offset;
 HEAP32[$this + 588 + ($4 * 68 | 0) + 48 + ($7 << 2) >> 2] = $length;
 HEAP32[$this + 588 + ($4 * 68 | 0) + ($7 << 3) >> 2] = HEAP32[$searchable + 36 >> 2];
 HEAP32[$this + 588 + ($4 * 68 | 0) + ($7 << 3) + 4 >> 2] = HEAP32[$searchable + 40 >> 2];
 $16 = $6 + 1 & 65535;
 $_ = ($16 & 65535) > 3 ? $6 - 3 & 65535 : $16;
 $19 = $this + 588 + ($4 * 68 | 0) + 64 | 0;
 $20 = HEAP16[$19 >> 1] | 0;
 if ($_ << 16 >> 16 != $20 << 16 >> 16) {
  HEAP16[$5 >> 1] = $_;
  return;
 }
 $23 = $20 + 1 & 65535;
 HEAP16[$19 >> 1] = $23;
 if (($23 & 65535) <= 3) {
  HEAP16[$5 >> 1] = $_;
  return;
 }
 HEAP16[$19 >> 1] = $20 - 3 & 65535;
 HEAP16[$5 >> 1] = $_;
 return;
}
function __ZN10ime_pinyin8UserDict15load_miss_cacheEPNS0_18UserDictSearchableE($this, $searchable) {
 $this = $this | 0;
 $searchable = $searchable | 0;
 var $4 = 0, $6 = 0, $7 = 0, $i_0 = 0, $10 = 0, $j_0 = 0, $12 = 0, $22 = 0, $_ = 0, $_0 = 0, label = 0;
 $4 = (HEAPU16[$searchable >> 1] | 0) - 1 | 0;
 $6 = HEAP16[$this + 108 + ($4 * 60 | 0) + 56 >> 1] | 0;
 $7 = $this + 108 + ($4 * 60 | 0) + 58 | 0;
 if ($6 << 16 >> 16 == (HEAP16[$7 >> 1] | 0)) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $i_0 = $6;
 }
 L4168 : while (1) {
  $10 = $i_0 & 65535;
  $j_0 = 0;
  while (1) {
   $12 = $j_0 & 65535;
   if (($j_0 & 65535) >= 2) {
    $_0 = 1;
    label = 3280;
    break L4168;
   }
   if ((HEAP32[$this + 108 + ($4 * 60 | 0) + ($10 << 3) + ($12 << 2) >> 2] | 0) == (HEAP32[$searchable + 36 + ($12 << 2) >> 2] | 0)) {
    $j_0 = $j_0 + 1 & 65535;
   } else {
    break;
   }
  }
  $22 = $i_0 + 1 & 65535;
  $_ = ($22 & 65535) > 6 ? $i_0 - 6 & 65535 : $22;
  if ($_ << 16 >> 16 == (HEAP16[$7 >> 1] | 0)) {
   $_0 = 0;
   label = 3279;
   break;
  } else {
   $i_0 = $_;
  }
 }
 if ((label | 0) == 3279) {
  return $_0 | 0;
 } else if ((label | 0) == 3280) {
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict15save_miss_cacheEPNS0_18UserDictSearchableE($this, $searchable) {
 $this = $this | 0;
 $searchable = $searchable | 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $14 = 0, $_ = 0, $17 = 0, $18 = 0, $21 = 0;
 $4 = (HEAPU16[$searchable >> 1] | 0) - 1 | 0;
 $5 = $this + 108 + ($4 * 60 | 0) + 58 | 0;
 $6 = HEAP16[$5 >> 1] | 0;
 $7 = $6 & 65535;
 HEAP32[$this + 108 + ($4 * 60 | 0) + ($7 << 3) >> 2] = HEAP32[$searchable + 36 >> 2];
 HEAP32[$this + 108 + ($4 * 60 | 0) + ($7 << 3) + 4 >> 2] = HEAP32[$searchable + 40 >> 2];
 $14 = $6 + 1 & 65535;
 $_ = ($14 & 65535) > 6 ? $6 - 6 & 65535 : $14;
 $17 = $this + 108 + ($4 * 60 | 0) + 56 | 0;
 $18 = HEAP16[$17 >> 1] | 0;
 if ($_ << 16 >> 16 != $18 << 16 >> 16) {
  HEAP16[$5 >> 1] = $_;
  return;
 }
 $21 = $18 + 1 & 65535;
 HEAP16[$17 >> 1] = $21;
 if (($21 & 65535) <= 6) {
  HEAP16[$5 >> 1] = $_;
  return;
 }
 HEAP16[$17 >> 1] = $18 - 6 & 65535;
 HEAP16[$5 >> 1] = $_;
 return;
}
function __ZN10ime_pinyin8UserDict14set_lemma_flagEjh($this, $offset, $flag) {
 $this = $this | 0;
 $offset = $offset | 0;
 $flag = $flag | 0;
 var $4 = 0;
 $4 = (HEAP32[$this + 24 >> 2] | 0) + ($offset & 2147483647) | 0;
 HEAP8[$4] = HEAP8[$4] | $flag;
 return;
}
function __ZN10ime_pinyin8UserDict14get_lemma_flagEj($this, $offset) {
 $this = $this | 0;
 $offset = $offset | 0;
 return HEAP8[(HEAP32[$this + 24 >> 2] | 0) + ($offset & 2147483647) | 0] | 0;
}
function __ZN10ime_pinyin8UserDict16write_back_lemmaEi($this, $fd) {
 $this = $this | 0;
 $fd = $fd | 0;
 var $6 = 0, $7 = 0, $22 = 0;
 if ((_lseek($fd | 0, 4, 0) | 0) == -1) {
  return;
 }
 $6 = 1088 - (HEAP32[$this + 60 >> 2] | 0) | 0;
 $7 = $this + 84 | 0;
 if ((_lseek($fd | 0, (HEAP32[$7 >> 2] | 0) - $6 | 0, 1) | 0) == -1) {
  return;
 }
 _write($fd | 0, (HEAP32[$this + 24 >> 2] | 0) + ((HEAP32[$7 >> 2] | 0) - $6) | 0, $6 | 0) | 0;
 $22 = $this + 80 | 0;
 _write($fd | 0, HEAP32[$this + 28 >> 2] | 0, HEAP32[$22 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 40 >> 2] | 0, HEAP32[$22 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 32 >> 2] | 0, HEAP32[$22 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 44 >> 2] | 0, HEAP32[$this + 96 >> 2] << 2 | 0) | 0;
 _write($fd | 0, $this + 68 | 0, 36) | 0;
 return;
}
function __ZN10ime_pinyin8UserDict17write_back_offsetEi($this, $fd) {
 $this = $this | 0;
 $fd = $fd | 0;
 var $11 = 0;
 if ((_lseek($fd | 0, (HEAP32[$this + 84 >> 2] | 0) + 4 | 0, 0) | 0) == -1) {
  return;
 }
 $11 = $this + 80 | 0;
 _write($fd | 0, HEAP32[$this + 28 >> 2] | 0, HEAP32[$11 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 40 >> 2] | 0, HEAP32[$11 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 32 >> 2] | 0, HEAP32[$11 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 44 >> 2] | 0, HEAP32[$this + 96 >> 2] << 2 | 0) | 0;
 _write($fd | 0, $this + 68 | 0, 36) | 0;
 return;
}
function __ZN10ime_pinyin8UserDict16write_back_scoreEi($this, $fd) {
 $this = $this | 0;
 $fd = $fd | 0;
 var $3 = 0;
 $3 = $this + 80 | 0;
 if ((_lseek($fd | 0, (HEAP32[$this + 84 >> 2] | 0) + 4 + (HEAP32[$3 >> 2] << 3) | 0, 0) | 0) == -1) {
  return;
 }
 _write($fd | 0, HEAP32[$this + 32 >> 2] | 0, HEAP32[$3 >> 2] << 2 | 0) | 0;
 _write($fd | 0, HEAP32[$this + 44 >> 2] | 0, HEAP32[$this + 96 >> 2] << 2 | 0) | 0;
 _write($fd | 0, $this + 68 | 0, 36) | 0;
 return;
}
function __ZN10ime_pinyin8UserDict15write_back_syncEi($this, $fd) {
 $this = $this | 0;
 $fd = $fd | 0;
 if ((_lseek($fd | 0, (HEAP32[$this + 84 >> 2] | 0) + 4 + ((HEAP32[$this + 80 >> 2] | 0) * 12 | 0) | 0, 0) | 0) == -1) {
  return;
 }
 _write($fd | 0, HEAP32[$this + 44 >> 2] | 0, HEAP32[$this + 96 >> 2] << 2 | 0) | 0;
 _write($fd | 0, $this + 68 | 0, 36) | 0;
 return;
}
function __ZN10ime_pinyin8UserDict11reset_cacheEv($this) {
 $this = $this | 0;
 _memset($this + 588 | 0, 0, 544);
 return;
}
function __ZN10ime_pinyin8UserDict16reset_miss_cacheEv($this) {
 $this = $this | 0;
 _memset($this + 108 | 0, 0, 480);
 return;
}
function __ZN10ime_pinyin8UserDict10defragmentEv($this) {
 $this = $this | 0;
 var $2 = 0, $5 = 0, $6 = 0, $7 = 0, $first_freed_0149 = 0, $8 = 0, $9 = 0, $11 = 0, $first_freed_1 = 0, $20 = 0, $26 = 0, $29 = 0, $31 = 0, $first_inuse_0143 = 0, $35 = 0, $38 = 0, $first_inuse_0_lcssa = 0, $40 = 0, $43 = 0, $44 = 0, $45 = 0, $50 = 0, $51 = 0, $52 = 0, $57 = 0, $58 = 0, $59 = 0, $64 = 0, $first_freed_2137 = 0, $66 = 0, $first_freed_3 = 0, $78 = 0, $79 = 0, $first_inuse_1 = 0, $91 = 0, $92 = 0, $93 = 0, $first_freed_4 = 0, $100 = 0, $101 = 0, $102 = 0, $104 = 0, $105 = 0, $107 = 0, $dst_0132 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $120 = 0, $126 = 0, $end_0128 = 0, $dst_1127 = 0, $133 = 0, $_pn = 0, $135 = 0, $140 = 0, $143 = 0, $147 = 0, $end_1110 = 0, $157 = 0, $end_1_lcssa = 0, $159 = 0, $162 = 0, $165 = 0, $166 = 0, $j_0116 = 0, $169 = 0, $170 = 0, $187 = 0, $188 = 0, $199 = 0, $j5_0119 = 0, $202 = 0, $203 = 0, $212 = 0, $dst_1125 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $i_0102 = 0, label = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  return;
 }
 $2 = $this + 80 | 0;
 L4216 : do {
  if ((HEAP32[$2 >> 2] | 0) == 0) {
   $first_freed_4 = 0;
  } else {
   $5 = $this + 28 | 0;
   $6 = $this + 32 | 0;
   $7 = $this + 36 | 0;
   $first_freed_0149 = 0;
   while (1) {
    $8 = HEAP32[$5 >> 2] | 0;
    $first_freed_1 = $first_freed_0149;
    while (1) {
     if ((HEAP32[$8 + ($first_freed_1 << 2) >> 2] | 0) <= -1) {
      break;
     }
     if ($first_freed_1 >>> 0 < (HEAP32[$2 >> 2] | 0) >>> 0) {
      $first_freed_1 = $first_freed_1 + 1 | 0;
     } else {
      break;
     }
    }
    $20 = HEAP32[$2 >> 2] | 0;
    if ($first_freed_1 >>> 0 >= $20 >>> 0) {
     $9 = $20;
     break;
    }
    __ZN10ime_pinyin8UserDict14set_lemma_flagEjh($this, HEAP32[(HEAP32[$5 >> 2] | 0) + ($first_freed_1 << 2) >> 2] | 0, 1);
    $26 = $first_freed_1 + 1 | 0;
    $29 = HEAP32[(HEAP32[$5 >> 2] | 0) + ($26 << 2) >> 2] | 0;
    L4225 : do {
     if (($29 | 0) < 0) {
      $first_inuse_0143 = $26;
      $31 = $29;
      while (1) {
       if ($first_inuse_0143 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
        $first_inuse_0_lcssa = $first_inuse_0143;
        break L4225;
       }
       __ZN10ime_pinyin8UserDict14set_lemma_flagEjh($this, $31, 1);
       $35 = $first_inuse_0143 + 1 | 0;
       $38 = HEAP32[(HEAP32[$5 >> 2] | 0) + ($35 << 2) >> 2] | 0;
       if (($38 | 0) < 0) {
        $first_inuse_0143 = $35;
        $31 = $38;
       } else {
        $first_inuse_0_lcssa = $35;
        break;
       }
      }
     } else {
      $first_inuse_0_lcssa = $26;
     }
    } while (0);
    $40 = HEAP32[$2 >> 2] | 0;
    if ($first_inuse_0_lcssa >>> 0 >= $40 >>> 0) {
     $9 = $40;
     break;
    }
    $43 = HEAP32[$5 >> 2] | 0;
    $44 = $43 + ($first_inuse_0_lcssa << 2) | 0;
    $45 = HEAP32[$44 >> 2] | 0;
    HEAP32[$44 >> 2] = HEAP32[$43 + ($first_freed_1 << 2) >> 2];
    HEAP32[(HEAP32[$5 >> 2] | 0) + ($first_freed_1 << 2) >> 2] = $45;
    $50 = HEAP32[$6 >> 2] | 0;
    $51 = $50 + ($first_inuse_0_lcssa << 2) | 0;
    $52 = HEAP32[$51 >> 2] | 0;
    HEAP32[$51 >> 2] = HEAP32[$50 + ($first_freed_1 << 2) >> 2];
    HEAP32[(HEAP32[$6 >> 2] | 0) + ($first_freed_1 << 2) >> 2] = $52;
    $57 = HEAP32[$7 >> 2] | 0;
    $58 = $57 + ($first_inuse_0_lcssa << 2) | 0;
    $59 = HEAP32[$58 >> 2] | 0;
    HEAP32[$58 >> 2] = HEAP32[$57 + ($first_freed_1 << 2) >> 2];
    HEAP32[(HEAP32[$7 >> 2] | 0) + ($first_freed_1 << 2) >> 2] = $59;
    $64 = HEAP32[$2 >> 2] | 0;
    if ($26 >>> 0 < $64 >>> 0) {
     $first_freed_0149 = $26;
    } else {
     $9 = $64;
     break;
    }
   }
   if (($9 | 0) == 0) {
    $first_freed_4 = 0;
    break;
   }
   $11 = $this + 40 | 0;
   $first_freed_2137 = 0;
   while (1) {
    $66 = HEAP32[$11 >> 2] | 0;
    $first_freed_3 = $first_freed_2137;
    while (1) {
     if ((HEAP32[$66 + ($first_freed_3 << 2) >> 2] | 0) <= -1) {
      break;
     }
     if ($first_freed_3 >>> 0 < (HEAP32[$2 >> 2] | 0) >>> 0) {
      $first_freed_3 = $first_freed_3 + 1 | 0;
     } else {
      break;
     }
    }
    if ($first_freed_3 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
     $first_freed_4 = $first_freed_3;
     break L4216;
    }
    $78 = $first_freed_3 + 1 | 0;
    $79 = HEAP32[$11 >> 2] | 0;
    $first_inuse_1 = $78;
    while (1) {
     if ((HEAP32[$79 + ($first_inuse_1 << 2) >> 2] | 0) >= 0) {
      break;
     }
     if ($first_inuse_1 >>> 0 < (HEAP32[$2 >> 2] | 0) >>> 0) {
      $first_inuse_1 = $first_inuse_1 + 1 | 0;
     } else {
      break;
     }
    }
    if ($first_inuse_1 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
     $first_freed_4 = $first_freed_3;
     break L4216;
    }
    $91 = HEAP32[$11 >> 2] | 0;
    $92 = $91 + ($first_inuse_1 << 2) | 0;
    $93 = HEAP32[$92 >> 2] | 0;
    HEAP32[$92 >> 2] = HEAP32[$91 + ($first_freed_3 << 2) >> 2];
    HEAP32[(HEAP32[$11 >> 2] | 0) + ($first_freed_3 << 2) >> 2] = $93;
    if ($78 >>> 0 < (HEAP32[$2 >> 2] | 0) >>> 0) {
     $first_freed_2137 = $78;
    } else {
     $first_freed_4 = $78;
     break;
    }
   }
  }
 } while (0);
 HEAP32[$2 >> 2] = $first_freed_4;
 $100 = $this + 84 | 0;
 $101 = HEAP32[$100 >> 2] | 0;
 $102 = $this + 60 | 0;
 $104 = (HEAP32[$102 >> 2] | 0) + $101 | 0;
 $105 = $this + 56 | 0;
 $107 = (HEAP32[$105 >> 2] | 0) + $first_freed_4 | 0;
 if (($101 | 0) == 0) {
  return;
 } else {
  $dst_0132 = 0;
 }
 while (1) {
  if (((__ZN10ime_pinyin8UserDict14get_lemma_flagEj($this, $dst_0132) | 0) & 1) != 0) {
   break;
  }
  $126 = (((__ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $dst_0132) | 0) & 255) << 2 | 2) + $dst_0132 | 0;
  if ($126 >>> 0 < $101 >>> 0) {
   $dst_0132 = $126;
  } else {
   label = 3368;
   break;
  }
 }
 if ((label | 0) == 3368) {
  return;
 }
 L4254 : do {
  if ($dst_0132 >>> 0 < $101 >>> 0) {
   $113 = $this + 24 | 0;
   $114 = $this + 96 | 0;
   $115 = $this + 44 | 0;
   $116 = $this + 28 | 0;
   $117 = $this + 36 | 0;
   $118 = $this + 16 | 0;
   $119 = $this + 52 | 0;
   $120 = $this + 40 | 0;
   $dst_1127 = $dst_0132;
   $end_0128 = $dst_0132;
   while (1) {
    $133 = $end_0128 + 2 + ((__ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $end_0128) | 0) << 24 >> 24 << 2) | 0;
    if ($133 >>> 0 < $101 >>> 0) {
     $_pn = $133;
    } else {
     $dst_1125 = $dst_1127;
     break L4254;
    }
    while (1) {
     $135 = __ZN10ime_pinyin8UserDict14get_lemma_flagEj($this, $_pn) | 0;
     $140 = ((__ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $_pn) | 0) & 255) << 2;
     if (($135 & 1) == 0) {
      break;
     }
     $143 = ($140 | 2) + $_pn | 0;
     if ($143 >>> 0 < $101 >>> 0) {
      $_pn = $143;
     } else {
      $dst_1125 = $dst_1127;
      break L4254;
     }
    }
    $147 = $_pn + 2 + $140 | 0;
    L4262 : do {
     if ($147 >>> 0 < $101 >>> 0) {
      $end_1110 = $147;
      while (1) {
       if (((__ZN10ime_pinyin8UserDict14get_lemma_flagEj($this, $end_1110) | 0) & 1) != 0) {
        $end_1_lcssa = $end_1110;
        break L4262;
       }
       $157 = (((__ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $end_1110) | 0) & 255) << 2 | 2) + $end_1110 | 0;
       if ($157 >>> 0 < $101 >>> 0) {
        $end_1110 = $157;
       } else {
        $end_1_lcssa = $157;
        break;
       }
      }
     } else {
      $end_1_lcssa = $147;
     }
    } while (0);
    $159 = HEAP32[$113 >> 2] | 0;
    $162 = $end_1_lcssa - $_pn | 0;
    _memmove($159 + $dst_1127 | 0, $159 + $_pn | 0, $162 | 0);
    if ((HEAP32[$2 >> 2] | 0) != 0) {
     $165 = $dst_1127 - $_pn | 0;
     $166 = $dst_1127 - $_pn | 0;
     $j_0116 = 0;
     do {
      $169 = (HEAP32[$116 >> 2] | 0) + ($j_0116 << 2) | 0;
      $170 = HEAP32[$169 >> 2] | 0;
      if ($170 >>> 0 >= $_pn >>> 0 & $170 >>> 0 < $end_1_lcssa >>> 0) {
       HEAP32[$169 >> 2] = $165 + $170;
       HEAP32[(HEAP32[$119 >> 2] | 0) + ((HEAP32[(HEAP32[$117 >> 2] | 0) + ($j_0116 << 2) >> 2] | 0) - (HEAP32[$118 >> 2] | 0) << 2) >> 2] = HEAP32[(HEAP32[$116 >> 2] | 0) + ($j_0116 << 2) >> 2];
      }
      $187 = (HEAP32[$120 >> 2] | 0) + ($j_0116 << 2) | 0;
      $188 = HEAP32[$187 >> 2] | 0;
      if ($188 >>> 0 >= $_pn >>> 0 & $188 >>> 0 < $end_1_lcssa >>> 0) {
       HEAP32[$187 >> 2] = $166 + $188;
      }
      $j_0116 = $j_0116 + 1 | 0;
     } while ($j_0116 >>> 0 < (HEAP32[$2 >> 2] | 0) >>> 0);
    }
    if ((HEAP32[$114 >> 2] | 0) != 0) {
     $199 = $dst_1127 - $_pn | 0;
     $j5_0119 = 0;
     do {
      $202 = (HEAP32[$115 >> 2] | 0) + ($j5_0119 << 2) | 0;
      $203 = HEAP32[$202 >> 2] | 0;
      if ($203 >>> 0 >= $_pn >>> 0 & $203 >>> 0 < $end_1_lcssa >>> 0) {
       HEAP32[$202 >> 2] = $199 + $203;
      }
      $j5_0119 = $j5_0119 + 1 | 0;
     } while ($j5_0119 >>> 0 < (HEAP32[$114 >> 2] | 0) >>> 0);
    }
    $212 = $162 + $dst_1127 | 0;
    if ($end_1_lcssa >>> 0 < $101 >>> 0) {
     $dst_1127 = $212;
     $end_0128 = $end_1_lcssa;
    } else {
     $dst_1125 = $212;
     break;
    }
   }
  } else {
   $dst_1125 = $dst_0132;
  }
 } while (0);
 HEAP32[$this + 88 >> 2] = 0;
 HEAP32[$this + 92 >> 2] = 0;
 HEAP32[$100 >> 2] = $dst_1125;
 HEAP32[$102 >> 2] = $104 - $dst_1125;
 HEAP32[$105 >> 2] = $107 - (HEAP32[$2 >> 2] | 0);
 if ((HEAP32[$2 >> 2] | 0) != 0) {
  $221 = $this + 16 | 0;
  $222 = $this + 36 | 0;
  $223 = $this + 28 | 0;
  $224 = $this + 52 | 0;
  $i_0102 = 0;
  do {
   HEAP32[(HEAP32[$222 >> 2] | 0) + ($i_0102 << 2) >> 2] = (HEAP32[$221 >> 2] | 0) + $i_0102;
   HEAP32[(HEAP32[$224 >> 2] | 0) + ($i_0102 << 2) >> 2] = HEAP32[(HEAP32[$223 >> 2] | 0) + ($i_0102 << 2) >> 2];
   $i_0102 = $i_0102 + 1 | 0;
  } while ($i_0102 >>> 0 < (HEAP32[$2 >> 2] | 0) >>> 0);
 }
 HEAP32[$this + 104 >> 2] = 6;
 return;
}
function __ZN10ime_pinyin8UserDict17clear_sync_lemmasEjj($this, $start, $end) {
 $this = $this | 0;
 $start = $start | 0;
 $end = $end | 0;
 var $3 = 0, $4 = 0, $_end = 0, $7 = 0, $17 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  return;
 }
 $3 = $this + 96 | 0;
 $4 = HEAP32[$3 >> 2] | 0;
 $_end = $4 >>> 0 < $end >>> 0 ? $4 : $end;
 $7 = HEAP32[$this + 44 >> 2] | 0;
 _memmove($7 + ($start << 2) | 0, $7 + ($_end << 2) | 0, $4 - $_end << 2 | 0);
 HEAP32[$3 >> 2] = $start - $_end + (HEAP32[$3 >> 2] | 0);
 $17 = $this + 104 | 0;
 if ((HEAP32[$17 >> 2] | 0) >= 2) {
  return;
 }
 HEAP32[$17 >> 2] = 2;
 return;
}
function __ZN10ime_pinyin8UserDict14get_sync_countEv($this) {
 $this = $this | 0;
 var $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = HEAP32[$this + 96 >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict17put_lemma_no_syncEPtS1_tty($this, $lemma_str, $splids, $lemma_len, $count, $lmt$0, $lmt$1) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 $count = $count | 0;
 $lmt$0 = $lmt$0 | 0;
 $lmt$1 = $lmt$1 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $7 = 0, $10 = 0, $11 = 0, $13 = 0, $20 = 0, $29 = 0, $30 = 0, $_lcssa = 0, label = 0;
 $1 = $this + 84 | 0;
 $2 = $this + 44 | 0;
 $3 = HEAP32[$2 >> 2] | 0;
 HEAP32[$2 >> 2] = 0;
 $4 = __ZN10ime_pinyin8UserDict10_put_lemmaEPtS1_tty($this, $lemma_str, $splids, $lemma_len, $count, $lmt$0, $lmt$1) | 0;
 HEAP32[$2 >> 2] = $3;
 if (($4 | 0) != 0) {
  $_lcssa = $4;
  return $_lcssa | 0;
 }
 $7 = $this + 76 | 0;
 $10 = ($lemma_len & 65535) << 2 | 2;
 $11 = $this;
 $13 = HEAP32[$this + 72 >> 2] | 0;
 if (($13 | 0) == 0) {
  label = 3386;
 } else {
  if ((HEAP32[$this + 80 >> 2] | 0) >>> 0 < $13 >>> 0) {
   label = 3386;
  }
 }
 do {
  if ((label | 0) == 3386) {
   $20 = HEAP32[$7 >> 2] | 0;
   if (($20 | 0) == 0) {
    $_lcssa = $4;
    return $_lcssa | 0;
   }
   if (((HEAP32[$1 >> 2] | 0) + $10 | 0) >>> 0 > $20 >>> 0) {
    break;
   } else {
    $_lcssa = $4;
   }
   return $_lcssa | 0;
  }
 } while (0);
 __ZN10ime_pinyin8UserDict7reclaimEv($this);
 __ZN10ime_pinyin8UserDict10defragmentEv($this);
 FUNCTION_TABLE_vi[HEAP32[(HEAP32[$11 >> 2] | 0) + 76 >> 2] & 127]($this);
 $29 = HEAP32[$2 >> 2] | 0;
 HEAP32[$2 >> 2] = 0;
 $30 = __ZN10ime_pinyin8UserDict10_put_lemmaEPtS1_tty($this, $lemma_str, $splids, $lemma_len, $count, $lmt$0, $lmt$1) | 0;
 HEAP32[$2 >> 2] = $29;
 $_lcssa = $30;
 return $_lcssa | 0;
}
function __ZN10ime_pinyin8UserDict10_put_lemmaEPtS1_tty($this, $lemma_str, $splids, $lemma_len, $count, $lmt$0, $lmt$1) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 $count = $count | 0;
 $lmt$0 = $lmt$0 | 0;
 $lmt$1 = $lmt$1 | 0;
 var $3 = 0, $6 = 0, $7 = 0, $12 = 0, $15 = 0, $18 = 0, $29 = 0, $37 = 0, $64 = 0, $_0 = 0, label = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = __ZN10ime_pinyin8UserDict17locate_in_offsetsEPtS1_t($this, $lemma_str, $splids, $lemma_len) | 0;
 if (($3 | 0) != -1) {
  $6 = $count & 65535;
  $7 = $this + 32 | 0;
  $12 = $this + 100 | 0;
  HEAP32[$12 >> 2] = $6 - (HEAP32[(HEAP32[$7 >> 2] | 0) + ($3 << 2) >> 2] | 0) + (HEAP32[$12 >> 2] | 0);
  $15 = __ZN10ime_pinyin8UserDict11build_scoreEyi(0, $lmt$0, $lmt$1, $6) | 0;
  HEAP32[(HEAP32[$7 >> 2] | 0) + ($3 << 2) >> 2] = $15;
  $18 = $this + 104 | 0;
  if ((HEAP32[$18 >> 2] | 0) < 3) {
   HEAP32[$18 >> 2] = 3;
  }
  $_0 = HEAP32[(HEAP32[$this + 36 >> 2] | 0) + ($3 << 2) >> 2] | 0;
  return $_0 | 0;
 }
 $29 = HEAP32[$this + 72 >> 2] | 0;
 do {
  if (($29 | 0) != 0) {
   if ((HEAP32[$this + 80 >> 2] | 0) >>> 0 < $29 >>> 0) {
    break;
   } else {
    $_0 = 0;
   }
   return $_0 | 0;
  }
 } while (0);
 $37 = HEAP32[$this + 76 >> 2] | 0;
 do {
  if (($37 | 0) != 0) {
   if (((HEAP32[$this + 84 >> 2] | 0) + (($lemma_len & 65535) << 2 | 2) | 0) >>> 0 > $37 >>> 0) {
    $_0 = 0;
   } else {
    break;
   }
   return $_0 | 0;
  }
 } while (0);
 if ((HEAP32[$this + 56 >> 2] | 0) == 0) {
  label = 3405;
 } else {
  if ((HEAP32[$this + 60 >> 2] | 0) >>> 0 < (($lemma_len & 65535) << 2 | 2) >>> 0) {
   label = 3405;
  }
 }
 if ((label | 0) == 3405) {
  FUNCTION_TABLE_vi[HEAP32[(HEAP32[$this >> 2] | 0) + 76 >> 2] & 127]($this);
 }
 $64 = __ZN10ime_pinyin8UserDict14append_a_lemmaEPtS1_tty($this, $lemma_str, $splids, $lemma_len, $count, $lmt$0, $lmt$1) | 0;
 if ((HEAP32[$this + 44 >> 2] | 0) == 0 | ($64 | 0) == 0) {
  $_0 = $64;
  return $_0 | 0;
 }
 __ZN10ime_pinyin8UserDict20queue_lemma_for_syncEj($this, $64);
 $_0 = $64;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict18extract_score_freqEi($this, $raw_score) {
 $this = $this | 0;
 $raw_score = $raw_score | 0;
 return $raw_score & 65535 | 0;
}
function __ZN10ime_pinyin8UserDict17extract_score_lmtEi($this, $raw_score) {
 $this = $this | 0;
 $raw_score = $raw_score | 0;
 var $3$0 = 0, $4$0 = 0;
 $3$0 = ___muldi3($raw_score >>> 16, 0, 604800, 0) | 0;
 $4$0 = _i64Add($3$0, tempRet0, 1229904e3, 0) | 0;
 return (tempRet0 = tempRet0, $4$0) | 0;
}
function __ZN10ime_pinyin8UserDict11build_scoreEyi($this, $lmt$0, $lmt$1, $freq) {
 $this = $this | 0;
 $lmt$0 = $lmt$0 | 0;
 $lmt$1 = $lmt$1 | 0;
 $freq = $freq | 0;
 var $1$0 = 0, $2$0 = 0;
 $1$0 = _i64Add($lmt$0, $lmt$1, -1229904e3, -1) | 0;
 $2$0 = ___udivdi3($1$0, tempRet0, 604800, 0) | 0;
 return $2$0 << 16 | $freq & 65535 | 0;
}
function __ZN10ime_pinyin8UserDict13utf16le_atollEPti($this, $s, $len) {
 $this = $this | 0;
 $s = $s | 0;
 $len = $len | 0;
 var $3 = 0, $4 = 0, $_016_ph = 0, $flag_0_ph$0 = 0, $flag_0_ph$1 = 0, $9 = 0, $12 = 0, $ret_021$0 = 0, $ret_021$1 = 0, $_01620 = 0, $13$0 = 0, $13$1 = 0, $15$0 = 0, $16$0 = 0, $17$0 = 0, $17$1 = 0, $18 = 0, $19 = 0, $ret_0_lcssa$0 = 0, $ret_0_lcssa$1 = 0, $22$0 = 0, $_0$0 = 0, $_0$1 = 0;
 if (($len | 0) < 1) {
  $_0$1 = 0;
  $_0$0 = 0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
 }
 $3 = $s + ($len << 1) | 0;
 $4 = HEAP16[$s >> 1] | 0;
 if (($4 << 16 >> 16 | 0) == 45) {
  $flag_0_ph$1 = -1;
  $flag_0_ph$0 = -1;
  $_016_ph = $s + 2 | 0;
 } else if (($4 << 16 >> 16 | 0) == 43) {
  $flag_0_ph$1 = 0;
  $flag_0_ph$0 = 1;
  $_016_ph = $s + 2 | 0;
 } else {
  $flag_0_ph$1 = 0;
  $flag_0_ph$0 = 1;
  $_016_ph = $s;
 }
 $9 = HEAP16[$_016_ph >> 1] | 0;
 if (($9 - 48 & 65535) < 10 & $_016_ph >>> 0 < $3 >>> 0) {
  $_01620 = $_016_ph;
  $ret_021$1 = 0;
  $ret_021$0 = 0;
  $12 = $9;
  while (1) {
   $13$0 = ___muldi3($ret_021$0, $ret_021$1, 10, 0) | 0;
   $13$1 = tempRet0;
   $15$0 = _i64Add($ret_021$0, $ret_021$1, -48, -1) | 0;
   $16$0 = _i64Add($15$0, tempRet0, $13$0, $13$1) | 0;
   $17$0 = _i64Add($16$0, tempRet0, $12 & 65535, 0) | 0;
   $17$1 = tempRet0;
   $18 = $_01620 + 2 | 0;
   $19 = HEAP16[$18 >> 1] | 0;
   if (($19 - 48 & 65535) < 10 & $18 >>> 0 < $3 >>> 0) {
    $_01620 = $18;
    $ret_021$1 = $17$1;
    $ret_021$0 = $17$0;
    $12 = $19;
   } else {
    $ret_0_lcssa$1 = $17$1;
    $ret_0_lcssa$0 = $17$0;
    break;
   }
  }
 } else {
  $ret_0_lcssa$1 = 0;
  $ret_0_lcssa$0 = 0;
 }
 $22$0 = ___muldi3($flag_0_ph$0, $flag_0_ph$1, $ret_0_lcssa$0, $ret_0_lcssa$1) | 0;
 $_0$1 = tempRet0;
 $_0$0 = $22$0;
 return (tempRet0 = $_0$1, $_0$0) | 0;
}
function __ZN10ime_pinyin8UserDict13utf16le_lltoaExPti($this, $v$0, $v$1, $s, $size) {
 $this = $this | 0;
 $v$0 = $v$0 | 0;
 $v$1 = $v$1 | 0;
 $s = $s | 0;
 $size = $size | 0;
 var $4 = 0, $$etemp$0$1 = 0, $8$0 = 0, $_024 = 0, $_023$0 = 0, $_023$1 = 0, $ret_len_0 = 0, $ret_len_131 = 0, $_130$0 = 0, $_130$1 = 0, $_12529 = 0, $13$0 = 0, $14$0 = 0, $16 = 0, $17$0 = 0, $17$1 = 0, $18 = 0, $_130_off$0 = 0, $_130_off$1 = 0, $$etemp$7$1 = 0, $ret_len_1_lcssa = 0, $_1_lcssa$0 = 0, $_1_lcssa$1 = 0, $_125_lcssa = 0, $_226 = 0, $_228 = 0, $b_027 = 0, $25 = 0, $_2 = 0, $_0 = 0;
 if (($s | 0) == 0 | ($size | 0) < 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $4 = $s + ($size << 1) | 0;
 $$etemp$0$1 = 0;
 if (($v$1 | 0) < ($$etemp$0$1 | 0) | ($v$1 | 0) == ($$etemp$0$1 | 0) & $v$0 >>> 0 < 0 >>> 0) {
  HEAP16[$s >> 1] = 45;
  $8$0 = _i64Subtract(0, 0, $v$0, $v$1) | 0;
  $ret_len_0 = 1;
  $_023$1 = tempRet0;
  $_023$0 = $8$0;
  $_024 = $s + 2 | 0;
 } else {
  $ret_len_0 = 0;
  $_023$1 = $v$1;
  $_023$0 = $v$0;
  $_024 = $s;
 }
 if ($_024 >>> 0 < $4 >>> 0 & (($_023$0 | 0) != 0 | ($_023$1 | 0) != 0)) {
  $_12529 = $_024;
  $_130$1 = $_023$1;
  $_130$0 = $_023$0;
  $ret_len_131 = $ret_len_0;
  while (1) {
   $13$0 = ___remdi3($_130$0, $_130$1, 10, 0) | 0;
   $14$0 = _i64Add($13$0, tempRet0, 48, 0) | 0;
   $16 = $_12529 + 2 | 0;
   HEAP16[$_12529 >> 1] = $14$0 & 65535;
   $17$0 = ___divdi3($_130$0, $_130$1, 10, 0) | 0;
   $17$1 = tempRet0;
   $18 = $ret_len_131 + 1 | 0;
   $_130_off$0 = _i64Add($_130$0, $_130$1, 9, 0) | 0;
   $_130_off$1 = tempRet0;
   $$etemp$7$1 = 0;
   if ($16 >>> 0 < $4 >>> 0 & ($_130_off$1 >>> 0 > $$etemp$7$1 >>> 0 | $_130_off$1 >>> 0 == $$etemp$7$1 >>> 0 & $_130_off$0 >>> 0 > 18 >>> 0)) {
    $_12529 = $16;
    $_130$1 = $17$1;
    $_130$0 = $17$0;
    $ret_len_131 = $18;
   } else {
    $_125_lcssa = $16;
    $_1_lcssa$1 = $17$1;
    $_1_lcssa$0 = $17$0;
    $ret_len_1_lcssa = $18;
    break;
   }
  }
 } else {
  $_125_lcssa = $_024;
  $_1_lcssa$1 = $_023$1;
  $_1_lcssa$0 = $_023$0;
  $ret_len_1_lcssa = $ret_len_0;
 }
 if (!(($_1_lcssa$0 | 0) == 0 & ($_1_lcssa$1 | 0) == 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_226 = $_125_lcssa - 2 | 0;
 if ($_024 >>> 0 < $_226 >>> 0) {
  $b_027 = $_024;
  $_228 = $_226;
 } else {
  $_0 = $ret_len_1_lcssa;
  return $_0 | 0;
 }
 while (1) {
  HEAP16[$b_027 >> 1] = HEAP16[$_228 >> 1] | 0;
  $25 = $b_027 + 2 | 0;
  $_2 = $_228 - 2 | 0;
  if ($25 >>> 0 < $_2 >>> 0) {
   $b_027 = $25;
   $_228 = $_2;
  } else {
   $_0 = $ret_len_1_lcssa;
   break;
  }
 }
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict9set_limitEjjj($this, $max_lemma_count, $max_lemma_size, $reclaim_ratio) {
 $this = $this | 0;
 $max_lemma_count = $max_lemma_count | 0;
 $max_lemma_size = $max_lemma_size | 0;
 $reclaim_ratio = $reclaim_ratio | 0;
 HEAP32[$this + 72 >> 2] = $max_lemma_count;
 HEAP32[$this + 76 >> 2] = $max_lemma_size;
 HEAP32[$this + 68 >> 2] = $reclaim_ratio >>> 0 > 100 ? 100 : $reclaim_ratio;
 return;
}
function __ZN10ime_pinyin8UserDict4swapEPNS0_23UserDictScoreOffsetPairEii($this, $sop, $i, $j) {
 $this = $this | 0;
 $sop = $sop | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $7 = 0;
 $1 = $sop + ($i << 3) | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 $3 = $sop + ($i << 3) + 4 | 0;
 $4 = HEAP32[$3 >> 2] | 0;
 $5 = $sop + ($j << 3) | 0;
 HEAP32[$1 >> 2] = HEAP32[$5 >> 2];
 $7 = $sop + ($j << 3) + 4 | 0;
 HEAP32[$3 >> 2] = HEAP32[$7 >> 2];
 HEAP32[$5 >> 2] = $2;
 HEAP32[$7 >> 2] = $4;
 return;
}
function __ZN10ime_pinyin8UserDict38put_lemmas_no_sync_from_utf16le_stringEPti($this, $lemmas, $len) {
 $this = $this | 0;
 $lemmas = $lemmas | 0;
 $len = $len | 0;
 var $is_pre = 0, $1 = 0, $2 = 0, $5 = 0, $8 = 0, $11 = 0, $newly_added_059 = 0, $p_058 = 0, $12 = 0, $14 = 0, $p_155 = 0, $splid_len_054 = 0, $_splid_len_0 = 0, $22 = 0, $23 = 0, $p_1_lcssa = 0, $splid_len_0_lcssa = 0, $25 = 0, $26 = 0, $39 = 0, $p_2 = 0, $55 = 0, $p_3 = 0, $69$0 = 0, $70 = 0, $p_4 = 0, $84$0 = 0, $88 = 0, $89 = 0, $90 = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $is_pre = sp + 16 | 0;
 $1 = __Znwj(4) | 0;
 $2 = $1;
 __ZN10ime_pinyin14SpellingParserC2Ev($2);
 if (($1 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $5 = $lemmas;
 if (($len | 0) <= 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $8 = sp | 0;
 $p_058 = $lemmas;
 $newly_added_059 = 0;
 $11 = $lemmas;
 while (1) {
  $12 = HEAP16[$p_058 >> 1] | 0;
  L4395 : do {
   if ($12 << 16 >> 16 == 44) {
    $splid_len_0_lcssa = 0;
    $p_1_lcssa = $p_058;
   } else {
    $splid_len_054 = 0;
    $p_155 = $p_058;
    $14 = $12;
    while (1) {
     if (($p_155 - $5 >> 1 | 0) >= ($len | 0)) {
      $splid_len_0_lcssa = $splid_len_054;
      $p_1_lcssa = $p_155;
      break L4395;
     }
     $_splid_len_0 = ($14 << 16 >> 16 == 32) + $splid_len_054 | 0;
     $22 = $p_155 + 2 | 0;
     $23 = HEAP16[$22 >> 1] | 0;
     if ($23 << 16 >> 16 == 44) {
      $splid_len_0_lcssa = $_splid_len_0;
      $p_1_lcssa = $22;
      break;
     } else {
      $splid_len_054 = $_splid_len_0;
      $p_155 = $22;
      $14 = $23;
     }
    }
   }
  } while (0);
  $25 = $splid_len_0_lcssa + 1 | 0;
  $26 = $p_1_lcssa;
  if (($26 - $5 >> 1 | 0) == ($len | 0) | $25 >>> 0 > 8) {
   $_0 = $newly_added_059;
   label = 3468;
   break;
  }
  if (((__ZN10ime_pinyin14SpellingParser18splstr16_to_idxs_fEPKttPtS3_tRb($2, $p_058, ($26 - $11 | 0) >>> 1 & 65535, $8, 0, 8, $is_pre) | 0) & 65535 | 0) != ($25 | 0)) {
   $_0 = $newly_added_059;
   label = 3470;
   break;
  }
  $39 = $p_1_lcssa + 2 | 0;
  $p_2 = $39;
  while (1) {
   if ((HEAP16[$p_2 >> 1] | 0) == 44) {
    break;
   }
   if (($p_2 - $5 >> 1 | 0) < ($len | 0)) {
    $p_2 = $p_2 + 2 | 0;
   } else {
    break;
   }
  }
  if (($p_2 - $39 >> 1 | 0) != ($25 | 0)) {
   $_0 = $newly_added_059;
   label = 3465;
   break;
  }
  $55 = $p_2 + 2 | 0;
  $p_3 = $55;
  while (1) {
   if ((HEAP16[$p_3 >> 1] | 0) == 44) {
    break;
   }
   if (($p_3 - $5 >> 1 | 0) < ($len | 0)) {
    $p_3 = $p_3 + 2 | 0;
   } else {
    break;
   }
  }
  $69$0 = __ZN10ime_pinyin8UserDict13utf16le_atollEPti(0, $55, $p_3 - $55 >> 1) | 0;
  $70 = $p_3 + 2 | 0;
  $p_4 = $70;
  while (1) {
   if ((HEAP16[$p_4 >> 1] | 0) == 59) {
    break;
   }
   if (($p_4 - $5 >> 1 | 0) < ($len | 0)) {
    $p_4 = $p_4 + 2 | 0;
   } else {
    break;
   }
  }
  $84$0 = __ZN10ime_pinyin8UserDict13utf16le_atollEPti(0, $70, $p_4 - $70 >> 1) | 0;
  __ZN10ime_pinyin8UserDict17put_lemma_no_syncEPtS1_tty($this, $39, $8, $25 & 65535, $69$0 & 65535, $84$0, tempRet0) | 0;
  $88 = $newly_added_059 + 1 | 0;
  $89 = $p_4 + 2 | 0;
  $90 = $89;
  if (($90 - $5 >> 1 | 0) < ($len | 0)) {
   $p_058 = $89;
   $newly_added_059 = $88;
   $11 = $90;
  } else {
   $_0 = $88;
   label = 3466;
   break;
  }
 }
 if ((label | 0) == 3466) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 3468) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 3470) {
  STACKTOP = sp;
  return $_0 | 0;
 } else if ((label | 0) == 3465) {
  STACKTOP = sp;
  return $_0 | 0;
 }
 return 0;
}
function __ZN10ime_pinyin8UserDict48get_sync_lemmas_in_utf16le_string_from_beginningEPtiPi($this, $str, $size, $count) {
 $this = $this | 0;
 $str = $str | 0;
 $size = $size | 0;
 $count = $count | 0;
 var $3 = 0, $5 = 0, $8 = 0, $len_054 = 0, $left_len_053 = 0, $i_052 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $18 = 0, $j_041 = 0, $22 = 0, $26 = 0, $29 = 0, $30 = 0, $34 = 0, $j_1 = 0, $38 = 0, $39 = 0, $43 = 0, $44 = 0, $45 = 0, $j_245 = 0, $47 = 0, $49 = 0, $51 = 0, $52 = 0, $_lcssa43 = 0, $_lcssa = 0, $j_2_lcssa = 0, $57$0 = 0, $58 = 0, $62 = 0, $65 = 0, $66 = 0, $70$0 = 0, $71 = 0, $75 = 0, $78 = 0, $79 = 0, $85 = 0, $86 = 0, $90 = 0, $left_len_1 = 0, $len_1 = 0, $96 = 0, $len_0_lcssa = 0, $101 = 0, $_0 = 0;
 HEAP32[$count >> 2] = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $3 = __ZN10ime_pinyin12SpellingTrie12get_instanceEv() | 0;
 if (($3 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $5 = $this + 96 | 0;
 if ((HEAP32[$5 >> 2] | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = $this + 44 | 0;
 $i_052 = 0;
 $left_len_053 = $size;
 $len_054 = 0;
 L4430 : while (1) {
  $12 = HEAP32[(HEAP32[$8 >> 2] | 0) + ($i_052 << 2) >> 2] | 0;
  $13 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $12) | 0;
  $14 = $13 << 24 >> 24;
  $15 = __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $12) | 0;
  $16 = __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $12) | 0;
  $18 = __ZN10ime_pinyin8UserDict16_get_lemma_scoreEPtS1_t($this, $16, $15, $13 << 24 >> 24) | 0;
  HEAP32[2002] = 20824;
  L4432 : do {
   if ($13 << 24 >> 24 == 0) {
    $j_1 = 0;
   } else {
    $j_041 = 0;
    while (1) {
     $22 = HEAP32[2002] | 0;
     $26 = __ZN10ime_pinyin12SpellingTrie18get_spelling_str16EtPtj($3, HEAP16[$15 + ($j_041 << 1) >> 1] | 0, $22, 21848 - $22 >> 1) | 0;
     if (($26 | 0) < 1) {
      $j_1 = $j_041;
      break L4432;
     }
     $29 = HEAP32[2002] | 0;
     $30 = $29 + ($26 << 1) | 0;
     HEAP32[2002] = $30;
     if ($30 >>> 0 >= 21846 >>> 0) {
      $j_1 = 0;
      break L4432;
     }
     HEAP32[2002] = $29 + ($26 + 1 << 1);
     HEAP16[$30 >> 1] = 32;
     $34 = $j_041 + 1 | 0;
     if ($34 >>> 0 < $14 >>> 0) {
      $j_041 = $34;
     } else {
      $j_1 = $34;
      break;
     }
    }
   }
  } while (0);
  do {
   if ($j_1 >>> 0 < $14 >>> 0) {
    $len_1 = $len_054;
    $left_len_1 = $left_len_053;
   } else {
    $38 = HEAP32[2002] | 0;
    $39 = $38 - 2 | 0;
    HEAP32[2002] = $39;
    if ($39 >>> 0 >= 21846 >>> 0) {
     $len_1 = $len_054;
     $left_len_1 = $left_len_053;
     break;
    }
    HEAP32[2002] = $38;
    HEAP16[$39 >> 1] = 44;
    $43 = HEAP32[2002] | 0;
    $44 = $43 >>> 0 < 21846 >>> 0;
    if ($13 << 24 >> 24 != 0 & $44) {
     $j_245 = 0;
     $45 = $43;
     while (1) {
      $47 = HEAP16[$16 + ($j_245 << 1) >> 1] | 0;
      HEAP32[2002] = $45 + 2;
      HEAP16[$45 >> 1] = $47;
      $49 = $j_245 + 1 | 0;
      $51 = HEAP32[2002] | 0;
      $52 = $51 >>> 0 < 21846 >>> 0;
      if ($49 >>> 0 < $14 >>> 0 & $52) {
       $j_245 = $49;
       $45 = $51;
      } else {
       $j_2_lcssa = $49;
       $_lcssa = $51;
       $_lcssa43 = $52;
       break;
      }
     }
    } else {
     $j_2_lcssa = 0;
     $_lcssa = $43;
     $_lcssa43 = $44;
    }
    if (!($j_2_lcssa >>> 0 >= $14 >>> 0 & $_lcssa43)) {
     $len_1 = $len_054;
     $left_len_1 = $left_len_053;
     break;
    }
    HEAP32[2002] = $_lcssa + 2;
    HEAP16[$_lcssa >> 1] = 44;
    $57$0 = __ZN10ime_pinyin8UserDict18extract_score_freqEi(0, $18) | 0;
    $58 = HEAP32[2002] | 0;
    $62 = __ZN10ime_pinyin8UserDict13utf16le_lltoaExPti(0, $57$0, 0, $58, 21848 - $58 >> 1) | 0;
    if (($62 | 0) < 1) {
     $len_1 = $len_054;
     $left_len_1 = $left_len_053;
     break;
    }
    $65 = HEAP32[2002] | 0;
    $66 = $65 + ($62 << 1) | 0;
    HEAP32[2002] = $66;
    if ($66 >>> 0 >= 21846 >>> 0) {
     $len_1 = $len_054;
     $left_len_1 = $left_len_053;
     break;
    }
    HEAP32[2002] = $65 + ($62 + 1 << 1);
    HEAP16[$66 >> 1] = 44;
    $70$0 = __ZN10ime_pinyin8UserDict17extract_score_lmtEi(0, $18) | 0;
    $71 = HEAP32[2002] | 0;
    $75 = __ZN10ime_pinyin8UserDict13utf16le_lltoaExPti(0, $70$0, tempRet0, $71, 21848 - $71 >> 1) | 0;
    if (($75 | 0) < 1) {
     $len_1 = $len_054;
     $left_len_1 = $left_len_053;
     break;
    }
    $78 = HEAP32[2002] | 0;
    $79 = $78 + ($75 << 1) | 0;
    HEAP32[2002] = $79;
    if ($79 >>> 0 >= 21846 >>> 0) {
     $len_1 = $len_054;
     $left_len_1 = $left_len_053;
     break;
    }
    HEAP32[2002] = $78 + ($75 + 1 << 1);
    HEAP16[$79 >> 1] = 59;
    $85 = (HEAP32[2002] | 0) - 20824 | 0;
    $86 = $85 >> 1;
    if (($86 | 0) > ($left_len_053 | 0)) {
     $len_0_lcssa = $len_054;
     break L4430;
    }
    $90 = $str + ($len_054 << 1) | 0;
    _memcpy($90 | 0, 20824, $85) | 0;
    HEAP32[$count >> 2] = (HEAP32[$count >> 2] | 0) + 1;
    $len_1 = $86 + $len_054 | 0;
    $left_len_1 = $left_len_053 - $86 | 0;
   }
  } while (0);
  $96 = $i_052 + 1 | 0;
  if ($96 >>> 0 < (HEAP32[$5 >> 2] | 0) >>> 0) {
   $i_052 = $96;
   $left_len_053 = $left_len_1;
   $len_054 = $len_1;
  } else {
   $len_0_lcssa = $len_1;
   break;
  }
 }
 if (($len_0_lcssa | 0) <= 0) {
  $_0 = $len_0_lcssa;
  return $_0 | 0;
 }
 $101 = $this + 104 | 0;
 if ((HEAP32[$101 >> 2] | 0) >= 2) {
  $_0 = $len_0_lcssa;
  return $_0 | 0;
 }
 HEAP32[$101 >> 2] = 2;
 $_0 = $len_0_lcssa;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict5stateEPNS0_12UserDictStatE($this, $stat) {
 $this = $this | 0;
 $stat = $stat | 0;
 var $20 = 0, $_0 = 0;
 if (($stat | 0) == 0 | (__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0) ^ 1) {
  $_0 = 0;
  return $_0 | 0;
 }
 HEAP32[$stat >> 2] = HEAP32[$this + 20 >> 2];
 HEAP32[$stat + 4 >> 2] = HEAP32[$this + 64 >> 2];
 HEAP32[$stat + 8 >> 2] = HEAP32[$this + 8 >> 2];
 HEAP32[$stat + 12 >> 2] = HEAP32[$this + 12 >> 2];
 HEAP32[$stat + 16 >> 2] = HEAP32[5336];
 HEAP32[$stat + 20 >> 2] = HEAP32[5337];
 $20 = $this + 68 | 0;
 HEAP32[$stat + 24 >> 2] = __ZN10ime_pinyin8UserDict18get_dict_file_sizeEPNS0_12UserDictInfoE(0, $20) | 0;
 HEAP32[$stat + 28 >> 2] = HEAP32[$this + 80 >> 2];
 HEAP32[$stat + 32 >> 2] = HEAP32[$this + 84 >> 2];
 HEAP32[$stat + 36 >> 2] = HEAP32[$this + 88 >> 2];
 HEAP32[$stat + 40 >> 2] = HEAP32[$this + 92 >> 2];
 HEAP32[$stat + 44 >> 2] = HEAP32[$this + 96 >> 2];
 HEAP32[$stat + 52 >> 2] = HEAP32[$this + 72 >> 2];
 HEAP32[$stat + 56 >> 2] = HEAP32[$this + 76 >> 2];
 HEAP32[$stat + 48 >> 2] = HEAP32[$20 >> 2];
 $_0 = 1;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict10shift_downEPNS0_23UserDictScoreOffsetPairEii($this, $sop, $i, $n) {
 $this = $this | 0;
 $sop = $sop | 0;
 $i = $i | 0;
 $n = $n | 0;
 var $par_039 = 0, $3 = 0, $4 = 0, $6 = 0, $8 = 0, $9 = 0, $par_0_be = 0, $17 = 0, $26 = 0, label = 0;
 if (($i | 0) < ($n | 0)) {
  $par_039 = $i;
 } else {
  return;
 }
 L4468 : while (1) {
  $3 = $par_039 << 1 | 1;
  $4 = $3 + 1 | 0;
  $6 = ($4 | 0) < ($n | 0);
  if (!(($3 | 0) < ($n | 0) | $6)) {
   label = 3523;
   break;
  }
  $8 = $sop + ($3 << 3) | 0;
  $9 = HEAP32[$8 >> 2] | 0;
  L4471 : do {
   if ($6) {
    $17 = $sop + ($4 << 3) | 0;
    do {
     if (($9 | 0) > (HEAP32[$17 >> 2] | 0)) {
      if (($9 | 0) <= (HEAP32[$sop + ($par_039 << 3) >> 2] | 0)) {
       break;
      }
      __ZN10ime_pinyin8UserDict4swapEPNS0_23UserDictScoreOffsetPairEii(0, $sop, $3, $par_039);
      $par_0_be = $3;
      break L4471;
     }
    } while (0);
    $26 = HEAP32[$17 >> 2] | 0;
    if (($26 | 0) <= (HEAP32[$8 >> 2] | 0)) {
     label = 3524;
     break L4468;
    }
    if (($26 | 0) <= (HEAP32[$sop + ($par_039 << 3) >> 2] | 0)) {
     label = 3521;
     break L4468;
    }
    __ZN10ime_pinyin8UserDict4swapEPNS0_23UserDictScoreOffsetPairEii(0, $sop, $4, $par_039);
    $par_0_be = $4;
   } else {
    if (($9 | 0) <= (HEAP32[$sop + ($par_039 << 3) >> 2] | 0)) {
     label = 3519;
     break L4468;
    }
    __ZN10ime_pinyin8UserDict4swapEPNS0_23UserDictScoreOffsetPairEii(0, $sop, $3, $par_039);
    $par_0_be = $3;
   }
  } while (0);
  if (($par_0_be | 0) < ($n | 0)) {
   $par_039 = $par_0_be;
  } else {
   label = 3522;
   break;
  }
 }
 if ((label | 0) == 3519) {
  return;
 } else if ((label | 0) == 3522) {
  return;
 } else if ((label | 0) == 3523) {
  return;
 } else if ((label | 0) == 3521) {
  return;
 } else if ((label | 0) == 3524) {
  return;
 }
}
function __ZN10ime_pinyin8UserDict9put_lemmaEPtS1_tt($this, $lemma_str, $splids, $lemma_len, $count) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 $count = $count | 0;
 var $1 = 0;
 $1 = _time(0) | 0;
 return __ZN10ime_pinyin8UserDict10_put_lemmaEPtS1_tty($this, $lemma_str, $splids, $lemma_len, $count, $1, ($1 | 0) < 0 ? -1 : 0) | 0;
}
function __ZN10ime_pinyin8UserDict7reclaimEv($this) {
 $this = $this | 0;
 var $4 = 0, $7 = 0, $9 = 0, $10 = 0, $12 = 0, $13 = 0, $17 = 0, $i_036 = 0, $29 = 0, $30 = 0, $32 = 0, $i1_034 = 0, $i2_032 = 0, $40 = 0, $i4_030 = 0, $55 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  return;
 }
 $4 = HEAP32[$this + 68 >> 2] | 0;
 if (($4 | 0) == 100) {
  ___assert_func(2712, 1958, 4520, 1856);
 } else if (($4 | 0) == 0) {
  return;
 } else {
  $7 = $this + 80 | 0;
  $9 = Math_imul(HEAP32[$7 >> 2] | 0, $4) | 0;
  $10 = ($9 >>> 0) / 100 | 0;
  $12 = _malloc($10 << 3) | 0;
  $13 = $12;
  if (($12 | 0) == 0) {
   return;
  }
  if ($9 >>> 0 > 99) {
   $17 = HEAP32[$this + 32 >> 2] | 0;
   $i_036 = 0;
   do {
    HEAP32[$13 + ($i_036 << 3) >> 2] = HEAP32[$17 + ($i_036 << 2) >> 2];
    HEAP32[$13 + ($i_036 << 3) + 4 >> 2] = $i_036;
    $i_036 = $i_036 + 1 | 0;
   } while (($i_036 | 0) < ($10 | 0));
  }
  $i1_034 = ($10 + 1 | 0) >>> 1;
  while (1) {
   __ZN10ime_pinyin8UserDict10shift_downEPNS0_23UserDictScoreOffsetPairEii($this, $13, $i1_034, $10);
   if (($i1_034 | 0) > 0) {
    $i1_034 = $i1_034 - 1 | 0;
   } else {
    break;
   }
  }
  if ($10 >>> 0 < (HEAP32[$7 >> 2] | 0) >>> 0) {
   $29 = $this + 32 | 0;
   $30 = $12;
   $32 = $12 + 4 | 0;
   $i2_032 = $10;
   do {
    $40 = HEAP32[(HEAP32[$29 >> 2] | 0) + ($i2_032 << 2) >> 2] | 0;
    if (($40 | 0) < (HEAP32[$30 >> 2] | 0)) {
     HEAP32[$30 >> 2] = $40;
     HEAP32[$32 >> 2] = $i2_032;
     __ZN10ime_pinyin8UserDict10shift_downEPNS0_23UserDictScoreOffsetPairEii($this, $13, 0, $10);
    }
    $i2_032 = $i2_032 + 1 | 0;
   } while ($i2_032 >>> 0 < (HEAP32[$7 >> 2] | 0) >>> 0);
  }
  do {
   if ($9 >>> 0 > 99) {
    $i4_030 = 0;
    do {
     __ZN10ime_pinyin8UserDict28remove_lemma_by_offset_indexEi($this, HEAP32[$13 + ($i4_030 << 3) + 4 >> 2] | 0) | 0;
     $i4_030 = $i4_030 + 1 | 0;
    } while (($i4_030 | 0) < ($10 | 0));
    if ($9 >>> 0 <= 99) {
     break;
    }
    $55 = $this + 104 | 0;
    if ((HEAP32[$55 >> 2] | 0) >= 4) {
     break;
    }
    HEAP32[$55 >> 2] = 4;
   }
  } while (0);
  _free($12);
  return;
 }
}
function __ZN10ime_pinyin8UserDict21get_total_lemma_countEv($this) {
 $this = $this | 0;
 return HEAP32[$this + 100 >> 2] | 0;
}
function __ZN10ime_pinyin8UserDict31set_total_lemma_count_of_othersEj($this, $count) {
 $this = $this | 0;
 $count = $count | 0;
 HEAP32[$this + 4 >> 2] = $count;
 return;
}
function __ZN10ime_pinyin8UserDict16get_max_lemma_idEv($this) {
 $this = $this | 0;
 return (HEAP32[$this + 16 >> 2] | 0) - 1 + (HEAP32[$this + 80 >> 2] | 0) | 0;
}
function _ConvertUTF32toUTF16($sourceStart, $sourceEnd, $targetStart, $targetEnd, $flags) {
 $sourceStart = $sourceStart | 0;
 $sourceEnd = $sourceEnd | 0;
 $targetStart = $targetStart | 0;
 $targetEnd = $targetEnd | 0;
 $flags = $flags | 0;
 var $1 = 0, $2 = 0, $4 = 0, $5 = 0, $target_0_ph42 = 0, $source_0_ph41 = 0, $result_0_ph40 = 0, $target_030 = 0, $source_029 = 0, $10 = 0, $11 = 0, $27 = 0, $30 = 0, $target_0_be = 0, $target_0_lcssa = 0, $source_0_lcssa = 0, $result_1 = 0;
 $1 = HEAP32[$sourceStart >> 2] | 0;
 $2 = HEAP32[$targetStart >> 2] | 0;
 L4528 : do {
  if ($1 >>> 0 < $sourceEnd >>> 0) {
   $4 = ($flags | 0) == 0;
   $5 = ($flags | 0) == 0;
   $result_0_ph40 = 0;
   $source_0_ph41 = $1;
   $target_0_ph42 = $2;
   while (1) {
    $source_029 = $source_0_ph41;
    $target_030 = $target_0_ph42;
    L4532 : while (1) {
     if ($target_030 >>> 0 >= $targetEnd >>> 0) {
      $result_1 = 2;
      $source_0_lcssa = $source_029;
      $target_0_lcssa = $target_030;
      break L4528;
     }
     $10 = $source_029 + 4 | 0;
     $11 = HEAP32[$source_029 >> 2] | 0;
     do {
      if ($11 >>> 0 < 65536) {
       if (($11 - 55296 | 0) >>> 0 >= 2048) {
        HEAP16[$target_030 >> 1] = $11 & 65535;
        $target_0_be = $target_030 + 2 | 0;
        break;
       }
       if ($4) {
        $result_1 = 3;
        $source_0_lcssa = $source_029;
        $target_0_lcssa = $target_030;
        break L4528;
       }
       HEAP16[$target_030 >> 1] = -3;
       $target_0_be = $target_030 + 2 | 0;
      } else {
       if ($11 >>> 0 > 1114111) {
        if ($5) {
         break L4532;
        }
        HEAP16[$target_030 >> 1] = -3;
        $target_0_be = $target_030 + 2 | 0;
        break;
       } else {
        $27 = $target_030 + 2 | 0;
        if ($27 >>> 0 >= $targetEnd >>> 0) {
         $result_1 = 2;
         $source_0_lcssa = $source_029;
         $target_0_lcssa = $target_030;
         break L4528;
        }
        $30 = $11 - 65536 | 0;
        HEAP16[$target_030 >> 1] = ($30 >>> 10) + 55296 & 65535;
        HEAP16[$27 >> 1] = ($30 & 1023 | 56320) & 65535;
        $target_0_be = $target_030 + 4 | 0;
        break;
       }
      }
     } while (0);
     if ($10 >>> 0 < $sourceEnd >>> 0) {
      $source_029 = $10;
      $target_030 = $target_0_be;
     } else {
      $result_1 = $result_0_ph40;
      $source_0_lcssa = $10;
      $target_0_lcssa = $target_0_be;
      break L4528;
     }
    }
    if ($10 >>> 0 < $sourceEnd >>> 0) {
     $result_0_ph40 = 3;
     $source_0_ph41 = $10;
     $target_0_ph42 = $target_030;
    } else {
     $result_1 = 3;
     $source_0_lcssa = $10;
     $target_0_lcssa = $target_030;
     break;
    }
   }
  } else {
   $result_1 = 0;
   $source_0_lcssa = $1;
   $target_0_lcssa = $2;
  }
 } while (0);
 HEAP32[$sourceStart >> 2] = $source_0_lcssa;
 HEAP32[$targetStart >> 2] = $target_0_lcssa;
 return $result_1 | 0;
}
function _ConvertUTF16toUTF32($sourceStart, $sourceEnd, $targetStart, $targetEnd, $flags) {
 $sourceStart = $sourceStart | 0;
 $sourceEnd = $sourceEnd | 0;
 $targetStart = $targetStart | 0;
 $targetEnd = $targetEnd | 0;
 $flags = $flags | 0;
 var $1 = 0, $2 = 0, $4 = 0, $5 = 0, $source_034 = 0, $target_033 = 0, $7 = 0, $8 = 0, $9 = 0, $14 = 0, $ch_0 = 0, $source_1 = 0, $29 = 0, $source_0_lcssa = 0, $target_0_lcssa = 0, $result_0 = 0;
 $1 = HEAP32[$sourceStart >> 2] | 0;
 $2 = HEAP32[$targetStart >> 2] | 0;
 L4551 : do {
  if ($1 >>> 0 < $sourceEnd >>> 0) {
   $4 = ($flags | 0) == 0;
   $5 = ($flags | 0) == 0;
   $target_033 = $2;
   $source_034 = $1;
   while (1) {
    $7 = $source_034 + 2 | 0;
    $8 = HEAP16[$source_034 >> 1] | 0;
    $9 = $8 & 65535;
    do {
     if (($8 + 10240 & 65535) < 1024) {
      if ($7 >>> 0 >= $sourceEnd >>> 0) {
       $result_0 = 1;
       $target_0_lcssa = $target_033;
       $source_0_lcssa = $source_034;
       break L4551;
      }
      $14 = HEAP16[$7 >> 1] | 0;
      if (($14 + 9216 & 65535) < 1024) {
       $source_1 = $source_034 + 4 | 0;
       $ch_0 = ($9 << 10) - 56613888 + ($14 & 65535) | 0;
       break;
      } else {
       if ($4) {
        $result_0 = 3;
        $target_0_lcssa = $target_033;
        $source_0_lcssa = $source_034;
        break L4551;
       } else {
        $source_1 = $7;
        $ch_0 = $9;
        break;
       }
      }
     } else {
      if (!$5) {
       $source_1 = $7;
       $ch_0 = $9;
       break;
      }
      if (($8 + 9216 & 65535) < 1024) {
       $result_0 = 3;
       $target_0_lcssa = $target_033;
       $source_0_lcssa = $source_034;
       break L4551;
      } else {
       $source_1 = $7;
       $ch_0 = $9;
      }
     }
    } while (0);
    if ($target_033 >>> 0 >= $targetEnd >>> 0) {
     $result_0 = 2;
     $target_0_lcssa = $target_033;
     $source_0_lcssa = $source_034;
     break L4551;
    }
    $29 = $target_033 + 4 | 0;
    HEAP32[$target_033 >> 2] = $ch_0;
    if ($source_1 >>> 0 < $sourceEnd >>> 0) {
     $target_033 = $29;
     $source_034 = $source_1;
    } else {
     $result_0 = 0;
     $target_0_lcssa = $29;
     $source_0_lcssa = $source_1;
     break;
    }
   }
  } else {
   $result_0 = 0;
   $target_0_lcssa = $2;
   $source_0_lcssa = $1;
  }
 } while (0);
 HEAP32[$sourceStart >> 2] = $source_0_lcssa;
 HEAP32[$targetStart >> 2] = $target_0_lcssa;
 return $result_0 | 0;
}
function _ConvertUTF16toUTF8($sourceStart, $sourceEnd, $targetStart, $targetEnd, $flags) {
 $sourceStart = $sourceStart | 0;
 $sourceEnd = $sourceEnd | 0;
 $targetStart = $targetStart | 0;
 $targetEnd = $targetEnd | 0;
 $flags = $flags | 0;
 var $1 = 0, $2 = 0, $4 = 0, $5 = 0, $source_055 = 0, $target_054 = 0, $7 = 0, $8 = 0, $9 = 0, $14 = 0, $ch_0 = 0, $source_1 = 0, $33 = 0, $bytesToWrite_0 = 0, $ch_1 = 0, $35 = 0, $42 = 0, $ch_2 = 0, $target_1 = 0, $48 = 0, $ch_3 = 0, $target_2 = 0, $54 = 0, $ch_4 = 0, $target_3 = 0, $62 = 0, $target_4 = 0, $64 = 0, $source_0_lcssa = 0, $target_0_lcssa = 0, $result_0 = 0, label = 0;
 $1 = HEAP32[$sourceStart >> 2] | 0;
 $2 = HEAP32[$targetStart >> 2] | 0;
 L4567 : do {
  if ($1 >>> 0 < $sourceEnd >>> 0) {
   $4 = ($flags | 0) == 0;
   $5 = ($flags | 0) == 0;
   $target_054 = $2;
   $source_055 = $1;
   while (1) {
    $7 = $source_055 + 2 | 0;
    $8 = HEAP16[$source_055 >> 1] | 0;
    $9 = $8 & 65535;
    do {
     if (($8 + 10240 & 65535) < 1024) {
      if ($7 >>> 0 >= $sourceEnd >>> 0) {
       $result_0 = 1;
       $target_0_lcssa = $target_054;
       $source_0_lcssa = $source_055;
       break L4567;
      }
      $14 = HEAP16[$7 >> 1] | 0;
      if (($14 + 9216 & 65535) < 1024) {
       $source_1 = $source_055 + 4 | 0;
       $ch_0 = ($9 << 10) - 56613888 + ($14 & 65535) | 0;
       break;
      } else {
       if ($4) {
        $result_0 = 3;
        $target_0_lcssa = $target_054;
        $source_0_lcssa = $source_055;
        break L4567;
       } else {
        $source_1 = $7;
        $ch_0 = $9;
        break;
       }
      }
     } else {
      if (!$5) {
       $source_1 = $7;
       $ch_0 = $9;
       break;
      }
      if (($8 + 9216 & 65535) < 1024) {
       $result_0 = 3;
       $target_0_lcssa = $target_054;
       $source_0_lcssa = $source_055;
       break L4567;
      } else {
       $source_1 = $7;
       $ch_0 = $9;
      }
     }
    } while (0);
    do {
     if ($ch_0 >>> 0 < 128) {
      $ch_1 = $ch_0;
      $bytesToWrite_0 = 1;
     } else {
      if ($ch_0 >>> 0 < 2048) {
       $ch_1 = $ch_0;
       $bytesToWrite_0 = 2;
       break;
      }
      if ($ch_0 >>> 0 < 65536) {
       $ch_1 = $ch_0;
       $bytesToWrite_0 = 3;
       break;
      }
      $33 = $ch_0 >>> 0 < 1114112;
      $ch_1 = $33 ? $ch_0 : 65533;
      $bytesToWrite_0 = $33 ? 4 : 3;
     }
    } while (0);
    $35 = $target_054 + $bytesToWrite_0 | 0;
    if ($35 >>> 0 > $targetEnd >>> 0) {
     $result_0 = 2;
     $target_0_lcssa = $target_054;
     $source_0_lcssa = $source_055;
     break L4567;
    }
    if (($bytesToWrite_0 | 0) == 4) {
     $42 = $target_054 + ($bytesToWrite_0 - 1) | 0;
     HEAP8[$42] = ($ch_1 & 63 | 128) & 255;
     $target_1 = $42;
     $ch_2 = $ch_1 >>> 6;
     label = 3599;
    } else if (($bytesToWrite_0 | 0) == 3) {
     $target_1 = $35;
     $ch_2 = $ch_1;
     label = 3599;
    } else if (($bytesToWrite_0 | 0) == 2) {
     $target_2 = $35;
     $ch_3 = $ch_1;
     label = 3600;
    } else if (($bytesToWrite_0 | 0) == 1) {
     $target_3 = $35;
     $ch_4 = $ch_1;
     label = 3601;
    } else {
     $target_4 = $35;
    }
    if ((label | 0) == 3599) {
     label = 0;
     $48 = $target_1 - 1 | 0;
     HEAP8[$48] = ($ch_2 & 63 | 128) & 255;
     $target_2 = $48;
     $ch_3 = $ch_2 >>> 6;
     label = 3600;
    }
    if ((label | 0) == 3600) {
     label = 0;
     $54 = $target_2 - 1 | 0;
     HEAP8[$54] = ($ch_3 & 63 | 128) & 255;
     $target_3 = $54;
     $ch_4 = $ch_3 >>> 6;
     label = 3601;
    }
    if ((label | 0) == 3601) {
     label = 0;
     $62 = $target_3 - 1 | 0;
     HEAP8[$62] = (HEAPU8[11264 + $bytesToWrite_0 | 0] | 0 | $ch_4) & 255;
     $target_4 = $62;
    }
    $64 = $target_4 + $bytesToWrite_0 | 0;
    if ($source_1 >>> 0 < $sourceEnd >>> 0) {
     $target_054 = $64;
     $source_055 = $source_1;
    } else {
     $result_0 = 0;
     $target_0_lcssa = $64;
     $source_0_lcssa = $source_1;
     break;
    }
   }
  } else {
   $result_0 = 0;
   $target_0_lcssa = $2;
   $source_0_lcssa = $1;
  }
 } while (0);
 HEAP32[$sourceStart >> 2] = $source_0_lcssa;
 HEAP32[$targetStart >> 2] = $target_0_lcssa;
 return $result_0 | 0;
}
function __ZN10ime_pinyin8UserDict14append_a_lemmaEPtS1_tty($this, $lemma_str, $splids, $lemma_len, $count, $lmt$0, $lmt$1) {
 $this = $this | 0;
 $lemma_str = $lemma_str | 0;
 $splids = $splids | 0;
 $lemma_len = $lemma_len | 0;
 $count = $count | 0;
 $lmt$0 = $lmt$0 | 0;
 $lmt$1 = $lmt$1 | 0;
 var $searchable = 0, $2 = 0, $3 = 0, $4 = 0, $7 = 0, $14 = 0, $16 = 0, $18 = 0, $i_070 = 0, $22 = 0, $35 = 0, $36 = 0, $37 = 0, $40 = 0, $41 = 0, $42 = 0, $45 = 0, $48 = 0, $60 = 0, $63 = 0, $66 = 0, $i1_0 = 0, $74 = 0, $75 = 0, $84 = 0, $86 = 0, $_sum67 = 0, $92 = 0, $95 = 0, $97 = 0, $104 = 0, $106 = 0, $114 = 0, $116 = 0, $118 = 0, $130 = 0, $135 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $searchable = sp | 0;
 $2 = (__ZN10ime_pinyin8UserDict16get_max_lemma_idEv($this) | 0) + 1 | 0;
 $3 = $this + 84 | 0;
 $4 = HEAP32[$3 >> 2] | 0;
 if (($4 | 0) < 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $7 = $this + 24 | 0;
 HEAP8[(HEAP32[$7 >> 2] | 0) + $4 | 0] = 0;
 HEAP8[(HEAP32[$7 >> 2] | 0) + ($4 + 1) | 0] = $lemma_len & 255;
 $14 = $lemma_len & 65535;
 if ($lemma_len << 16 >> 16 != 0) {
  $16 = $4 + 2 | 0;
  $18 = $16 + ($14 << 1) | 0;
  $i_070 = 0;
  do {
   $22 = $i_070 << 1;
   HEAP16[(HEAP32[$7 >> 2] | 0) + ($22 + $16) >> 1] = HEAP16[$splids + ($i_070 << 1) >> 1] | 0;
   HEAP16[(HEAP32[$7 >> 2] | 0) + ($18 + $22) >> 1] = HEAP16[$lemma_str + ($i_070 << 1) >> 1] | 0;
   $i_070 = $i_070 + 1 | 0;
  } while ($i_070 >>> 0 < $14 >>> 0);
 }
 $35 = $this + 80 | 0;
 $36 = HEAP32[$35 >> 2] | 0;
 $37 = $this + 28 | 0;
 HEAP32[(HEAP32[$37 >> 2] | 0) + ($36 << 2) >> 2] = $4;
 $40 = $count & 65535;
 $41 = __ZN10ime_pinyin8UserDict11build_scoreEyi(0, $lmt$0, $lmt$1, $40) | 0;
 $42 = $this + 32 | 0;
 HEAP32[(HEAP32[$42 >> 2] | 0) + ($36 << 2) >> 2] = $41;
 $45 = $this + 36 | 0;
 HEAP32[(HEAP32[$45 >> 2] | 0) + ($36 << 2) >> 2] = $2;
 $48 = $this + 40 | 0;
 HEAP32[(HEAP32[$48 >> 2] | 0) + ($36 << 2) >> 2] = $4;
 HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($2 - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] = $4;
 HEAP32[$35 >> 2] = (HEAP32[$35 >> 2] | 0) + 1;
 $60 = $14 << 2 | 2;
 HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) + $60;
 $63 = $this + 56 | 0;
 HEAP32[$63 >> 2] = (HEAP32[$63 >> 2] | 0) - 1;
 $66 = $this + 60 | 0;
 HEAP32[$66 >> 2] = (HEAP32[$66 >> 2] | 0) - $60;
 __ZN10ime_pinyin8UserDict14prepare_locateEPNS0_18UserDictSearchableEPKtt(0, $searchable, $splids, $lemma_len);
 $i1_0 = 0;
 while (1) {
  if ($i1_0 >>> 0 >= $36 >>> 0) {
   break;
  }
  $74 = HEAP32[(HEAP32[$37 >> 2] | 0) + ($i1_0 << 2) >> 2] | 0;
  $75 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $74) | 0;
  if ((__ZN10ime_pinyin8UserDict22fuzzy_compare_spell_idEPKttPKNS0_18UserDictSearchableE(0, __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $74) | 0, $75 << 24 >> 24, $searchable) | 0) > -1) {
   break;
  } else {
   $i1_0 = $i1_0 + 1 | 0;
  }
 }
 if (($i1_0 | 0) != ($36 | 0)) {
  $84 = HEAP32[$37 >> 2] | 0;
  $86 = HEAP32[$84 + ($36 << 2) >> 2] | 0;
  $_sum67 = $i1_0 + 1 | 0;
  $92 = $36 - $i1_0 << 2;
  _memmove($84 + ($_sum67 << 2) | 0, $84 + ($i1_0 << 2) | 0, $92 | 0);
  HEAP32[(HEAP32[$37 >> 2] | 0) + ($i1_0 << 2) >> 2] = $86;
  $95 = HEAP32[$42 >> 2] | 0;
  $97 = HEAP32[$95 + ($36 << 2) >> 2] | 0;
  _memmove($95 + ($_sum67 << 2) | 0, $95 + ($i1_0 << 2) | 0, $92 | 0);
  HEAP32[(HEAP32[$42 >> 2] | 0) + ($i1_0 << 2) >> 2] = $97;
  $104 = HEAP32[$45 >> 2] | 0;
  $106 = HEAP32[$104 + ($36 << 2) >> 2] | 0;
  _memmove($104 + ($_sum67 << 2) | 0, $104 + ($i1_0 << 2) | 0, $92 | 0);
  HEAP32[(HEAP32[$45 >> 2] | 0) + ($i1_0 << 2) >> 2] = $106;
 }
 $114 = HEAP32[$48 >> 2] | 0;
 $116 = HEAP32[$114 + ($36 << 2) >> 2] | 0;
 $118 = __ZN10ime_pinyin8UserDict34locate_where_to_insert_in_predictsEPKti($this, __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $116) | 0, $14) | 0;
 if (($118 | 0) != ($36 | 0)) {
  _memmove($114 + ($118 + 1 << 2) | 0, $114 + ($118 << 2) | 0, $36 - $118 << 2 | 0);
  HEAP32[(HEAP32[$48 >> 2] | 0) + ($118 << 2) >> 2] = $116;
 }
 $130 = $this + 104 | 0;
 if ((HEAP32[$130 >> 2] | 0) < 5) {
  HEAP32[$130 >> 2] = 5;
 }
 __ZN10ime_pinyin8UserDict10cache_initEv($this);
 $135 = $this + 100 | 0;
 HEAP32[$135 >> 2] = (HEAP32[$135 >> 2] | 0) + $40;
 $_0 = $2;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZN10ime_pinyin8UserDict20queue_lemma_for_syncEj($this, $id) {
 $this = $this | 0;
 $id = $id | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $13 = 0, $19 = 0, $24 = 0, $36 = 0, $37 = 0;
 $1 = $this + 96 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 $3 = $this + 48 | 0;
 $4 = HEAP32[$3 >> 2] | 0;
 if ($2 >>> 0 < $4 >>> 0) {
  $13 = HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($id - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] | 0;
  HEAP32[$1 >> 2] = $2 + 1;
  HEAP32[(HEAP32[$this + 44 >> 2] | 0) + ($2 << 2) >> 2] = $13;
  return;
 }
 $19 = $this + 44 | 0;
 $24 = _realloc(HEAP32[$19 >> 2] | 0, ($4 << 2) + 128 | 0) | 0;
 if (($24 | 0) == 0) {
  return;
 }
 HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) + 32;
 HEAP32[$19 >> 2] = $24;
 $36 = HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($id - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] | 0;
 $37 = HEAP32[$1 >> 2] | 0;
 HEAP32[$1 >> 2] = $37 + 1;
 HEAP32[(HEAP32[$19 >> 2] | 0) + ($37 << 2) >> 2] = $36;
 return;
}
function __ZN10ime_pinyin8UserDict12update_lemmaEjsb($this, $lemma_id, $delta_count, $selected) {
 $this = $this | 0;
 $lemma_id = $lemma_id | 0;
 $delta_count = $delta_count | 0;
 $selected = $selected | 0;
 var $11 = 0, $12 = 0, $13 = 0, $16 = 0, $19 = 0, $22 = 0, $23 = 0, $24$0 = 0, $24$1 = 0, $_021 = 0, $33 = 0, $35 = 0, $39 = 0, $lmt_0$0 = 0, $lmt_0$1 = 0, $42 = 0, $45 = 0, $50 = 0, $_0 = 0;
 if (!(__ZN10ime_pinyin8UserDict14is_valid_stateEv($this) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 if (!(__ZN10ime_pinyin8UserDict17is_valid_lemma_idEj($this, $lemma_id) | 0)) {
  $_0 = 0;
  return $_0 | 0;
 }
 $11 = HEAP32[(HEAP32[$this + 52 >> 2] | 0) + ($lemma_id - (HEAP32[$this + 16 >> 2] | 0) << 2) >> 2] | 0;
 $12 = __ZN10ime_pinyin8UserDict15get_lemma_ncharEj($this, $11) | 0;
 $13 = __ZN10ime_pinyin8UserDict14get_lemma_wordEj($this, $11) | 0;
 $16 = __ZN10ime_pinyin8UserDict17locate_in_offsetsEPtS1_t($this, $13, __ZN10ime_pinyin8UserDict19get_lemma_spell_idsEj($this, $11) | 0, $12 & 255) | 0;
 if (($16 | 0) == -1) {
  $_0 = 0;
  return $_0 | 0;
 }
 $19 = $this + 32 | 0;
 $22 = HEAP32[(HEAP32[$19 >> 2] | 0) + ($16 << 2) >> 2] | 0;
 $23 = __ZN10ime_pinyin8UserDict18extract_score_freqEi(0, $22) | 0;
 $24$0 = __ZN10ime_pinyin8UserDict17extract_score_lmtEi(0, $22) | 0;
 $24$1 = tempRet0;
 if (($23 + ($delta_count << 16 >> 16) | 0) > 65535 | $delta_count << 16 >> 16 < 0) {
  $_021 = 65535 - $23 & 65535;
 } else {
  $_021 = $delta_count;
 }
 $33 = $_021 << 16 >> 16;
 $35 = $this + 100 | 0;
 HEAP32[$35 >> 2] = (HEAP32[$35 >> 2] | 0) + $33;
 if ($selected) {
  $39 = _time(0) | 0;
  $lmt_0$1 = ($39 | 0) < 0 ? -1 : 0;
  $lmt_0$0 = $39;
 } else {
  $lmt_0$1 = $24$1;
  $lmt_0$0 = $24$0;
 }
 $42 = __ZN10ime_pinyin8UserDict11build_scoreEyi(0, $lmt_0$0, $lmt_0$1, $33 + $23 | 0) | 0;
 HEAP32[(HEAP32[$19 >> 2] | 0) + ($16 << 2) >> 2] = $42;
 $45 = $this + 104 | 0;
 if ((HEAP32[$45 >> 2] | 0) < 3) {
  HEAP32[$45 >> 2] = 3;
 }
 $50 = $this + 36 | 0;
 __ZN10ime_pinyin8UserDict20queue_lemma_for_syncEj($this, HEAP32[(HEAP32[$50 >> 2] | 0) + ($16 << 2) >> 2] | 0);
 $_0 = HEAP32[(HEAP32[$50 >> 2] | 0) + ($16 << 2) >> 2] | 0;
 return $_0 | 0;
}
function __ZN10ime_pinyin11Utf16ReaderC2Ev($this) {
 $this = $this | 0;
 _memset($this | 0, 0, 20);
 return;
}
function __ZN10ime_pinyin11Utf16ReaderD2Ev($this) {
 $this = $this | 0;
 var $2 = 0, $8 = 0;
 $2 = HEAP32[$this >> 2] | 0;
 if (($2 | 0) != 0) {
  _fclose($2 | 0) | 0;
 }
 $8 = HEAP32[$this + 4 >> 2] | 0;
 if (($8 | 0) == 0) {
  return;
 }
 __ZdaPv($8);
 return;
}
function __ZN10ime_pinyin11Utf16Reader4openEPKcj($this, $filename, $buffer_len) {
 $this = $this | 0;
 $filename = $filename | 0;
 $buffer_len = $buffer_len | 0;
 var $header = 0, $_0 = 0, $7 = 0, $8 = 0, $9 = 0, $15$0 = 0, $19 = 0, $23 = 0, $24 = 0, $29 = 0, $_07 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $header = sp | 0;
 if (($filename | 0) == 0) {
  $_07 = 0;
  STACKTOP = sp;
  return $_07 | 0;
 }
 if ($buffer_len >>> 0 < 128) {
  $_0 = 128;
 } else {
  $_0 = $buffer_len >>> 0 > 65535 ? 65535 : $buffer_len;
 }
 $7 = $this + 8 | 0;
 HEAP32[$7 >> 2] = $_0;
 $8 = $this + 4 | 0;
 $9 = HEAP32[$8 >> 2] | 0;
 if (($9 | 0) != 0) {
  __ZdaPv($9);
 }
 $15$0 = _llvm_umul_with_overflow_i32(HEAP32[$7 >> 2] | 0, 2) | 0;
 $19 = __Znaj(tempRet0 ? -1 : $15$0) | 0;
 HEAP32[$8 >> 2] = $19;
 if (($19 | 0) == 0) {
  $_07 = 0;
  STACKTOP = sp;
  return $_07 | 0;
 }
 $23 = _fopen($filename | 0, 2008) | 0;
 $24 = $this | 0;
 HEAP32[$24 >> 2] = $23;
 if (($23 | 0) == 0) {
  $_07 = 0;
  STACKTOP = sp;
  return $_07 | 0;
 }
 $29 = (_fread($header | 0, 2, 1, $23 | 0) | 0) == 1;
 if ($29 & (HEAP16[$header >> 1] | 0) == -257) {
  $_07 = 1;
  STACKTOP = sp;
  return $_07 | 0;
 }
 _fclose(HEAP32[$24 >> 2] | 0) | 0;
 HEAP32[$24 >> 2] = 0;
 $_07 = 0;
 STACKTOP = sp;
 return $_07 | 0;
}
function __ZN10ime_pinyin11Utf16Reader8readlineEPtj($this, $read_buf, $max_len) {
 $this = $this | 0;
 $read_buf = $read_buf | 0;
 $max_len = $max_len | 0;
 var $1 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $14 = 0, $ret_len_0 = 0, $21 = 0, $i_034 = 0, $33 = 0, $36 = 0, $40 = 0, $47 = 0, $48 = 0, $61 = 0, $62 = 0, $_lcssa = 0, $_0 = 0, label = 0;
 $1 = $this | 0;
 if ((HEAP32[$1 >> 2] | 0) == 0 | ($read_buf | 0) == 0 | ($max_len | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $6 = $this + 16 | 0;
 $7 = $this + 12 | 0;
 $8 = $this + 4 | 0;
 $9 = $this + 8 | 0;
 $10 = $max_len - 1 | 0;
 $11 = $this + 12 | 0;
 $12 = $this + 4 | 0;
 $ret_len_0 = 0;
 $14 = (HEAP32[$6 >> 2] | 0) == 0;
 L4681 : while (1) {
  if ($14) {
   HEAP32[$7 >> 2] = 0;
   $21 = _fread(HEAP32[$8 >> 2] | 0, 2, HEAP32[$9 >> 2] | 0, HEAP32[$1 >> 2] | 0) | 0;
   HEAP32[$6 >> 2] = $21;
   if (($21 | 0) == 0) {
    label = 3672;
    break;
   } else {
    $i_034 = 0;
    label = 3674;
   }
  } else {
   if ((HEAP32[$6 >> 2] | 0) == 0) {
    $_lcssa = 0;
   } else {
    $i_034 = 0;
    label = 3674;
   }
  }
  if ((label | 0) == 3674) {
   while (1) {
    label = 0;
    if (($i_034 | 0) == ($10 | 0)) {
     break L4681;
    }
    $33 = HEAP16[(HEAP32[$12 >> 2] | 0) + ((HEAP32[$11 >> 2] | 0) + $i_034 << 1) >> 1] | 0;
    if ($33 << 16 >> 16 == 10) {
     break L4681;
    }
    HEAP16[$read_buf + ($i_034 + $ret_len_0 << 1) >> 1] = $33;
    $61 = $i_034 + 1 | 0;
    $62 = HEAP32[$6 >> 2] | 0;
    if ($61 >>> 0 < $62 >>> 0) {
     $i_034 = $61;
     label = 3674;
    } else {
     $_lcssa = $62;
     break;
    }
   }
  }
  HEAP32[$6 >> 2] = 0;
  $ret_len_0 = $_lcssa + $ret_len_0 | 0;
  $14 = 1;
 }
 if ((label | 0) == 3672) {
  if (($ret_len_0 | 0) == 0) {
   $_0 = 0;
   return $_0 | 0;
  }
  HEAP16[$read_buf + ($ret_len_0 << 1) >> 1] = 0;
  $_0 = $read_buf;
  return $_0 | 0;
 }
 $36 = $i_034 + $ret_len_0 | 0;
 do {
  if (($36 | 0) == 0) {
   label = 3679;
  } else {
   $40 = $read_buf + ($36 - 1 << 1) | 0;
   if ((HEAP16[$40 >> 1] | 0) != 13) {
    label = 3679;
    break;
   }
   HEAP16[$40 >> 1] = 0;
  }
 } while (0);
 if ((label | 0) == 3679) {
  HEAP16[$read_buf + ($36 << 1) >> 1] = 0;
 }
 $47 = $i_034 + 1 | 0;
 $48 = $this + 12 | 0;
 HEAP32[$48 >> 2] = (HEAP32[$48 >> 2] | 0) + $47;
 HEAP32[$6 >> 2] = (HEAP32[$6 >> 2] | 0) - $47;
 if ((HEAP32[$48 >> 2] | 0) != (HEAP32[$this + 8 >> 2] | 0)) {
  $_0 = $read_buf;
  return $_0 | 0;
 }
 HEAP32[$48 >> 2] = 0;
 HEAP32[$6 >> 2] = 0;
 $_0 = $read_buf;
 return $_0 | 0;
}
function __ZN10ime_pinyin11Utf16Reader5closeEv($this) {
 $this = $this | 0;
 var $1 = 0, $2 = 0, $7 = 0, $8 = 0;
 $1 = $this | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) != 0) {
  _fclose($2 | 0) | 0;
 }
 HEAP32[$1 >> 2] = 0;
 $7 = $this + 4 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 if (($8 | 0) == 0) {
  HEAP32[$7 >> 2] = 0;
  return 1;
 }
 __ZdaPv($8);
 HEAP32[$7 >> 2] = 0;
 return 1;
}
function _isLegalUTF8Sequence($source, $sourceEnd) {
 $source = $source | 0;
 $sourceEnd = $sourceEnd | 0;
 var $6 = 0, $_0 = 0;
 $6 = (HEAP8[10984 + (HEAPU8[$source] | 0) | 0] | 0) + 1 | 0;
 if (($source + $6 | 0) >>> 0 > $sourceEnd >>> 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $_0 = __ZL11isLegalUTF8PKhi($source, $6) | 0;
 return $_0 | 0;
}
function __ZNSt9type_infoD2Ev($this) {
 $this = $this | 0;
 return;
}
function __ZNSt8bad_castD2Ev($this) {
 $this = $this | 0;
 return;
}
function __ZNKSt8bad_cast4whatEv($this) {
 $this = $this | 0;
 return 1864 | 0;
}
function __ZNSt10bad_typeidD2Ev($this) {
 $this = $this | 0;
 return;
}
function __ZNKSt10bad_typeid4whatEv($this) {
 $this = $this | 0;
 return 3800 | 0;
}
function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($this) {
 $this = $this | 0;
 return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($this) {
 $this = $this | 0;
 return;
}
function __ZNK10__cxxabiv117__array_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $0, $1) {
 $this = $this | 0;
 $0 = $0 | 0;
 $1 = $1 | 0;
 return 0;
}
function __ZNK10__cxxabiv120__function_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $0, $1) {
 $this = $this | 0;
 $0 = $0 | 0;
 $1 = $1 | 0;
 return 0;
}
function __ZL11isLegalUTF8PKhi($source, $length) {
 $source = $source | 0;
 $length = $length | 0;
 var $1 = 0, $3 = 0, $4 = 0, $srcptr_0 = 0, $8 = 0, $9 = 0, $srcptr_1 = 0, $14 = 0, $18 = 0, $30 = 0, $_0 = 0, label = 0;
 $1 = $source + $length | 0;
 if (($length | 0) == 2) {
  $srcptr_1 = $1;
  label = 3714;
 } else if (($length | 0) == 4) {
  $3 = $source + ($length - 1) | 0;
  $4 = HEAP8[$3] | 0;
  if ($4 << 24 >> 24 > -1 | ($4 & 255) > 191) {
   $_0 = 0;
  } else {
   $srcptr_0 = $3;
   label = 3713;
  }
 } else if (($length | 0) == 1) {
  label = 3721;
 } else if (($length | 0) == 3) {
  $srcptr_0 = $1;
  label = 3713;
 } else {
  $_0 = 0;
 }
 if ((label | 0) == 3713) {
  $8 = $srcptr_0 - 1 | 0;
  $9 = HEAP8[$8] | 0;
  if ($9 << 24 >> 24 > -1 | ($9 & 255) > 191) {
   $_0 = 0;
  } else {
   $srcptr_1 = $8;
   label = 3714;
  }
 }
 do {
  if ((label | 0) == 3714) {
   $14 = HEAP8[$srcptr_1 - 1 | 0] | 0;
   if (($14 & 255) > 191) {
    $_0 = 0;
    break;
   }
   $18 = HEAPU8[$source] | 0;
   if (($18 | 0) == 224) {
    if (($14 & 255) < 160) {
     $_0 = 0;
     break;
    } else {
     label = 3721;
     break;
    }
   } else if (($18 | 0) == 244) {
    if (($14 & 255) > 143) {
     $_0 = 0;
     break;
    } else {
     label = 3721;
     break;
    }
   } else if (($18 | 0) == 240) {
    if (($14 & 255) < 144) {
     $_0 = 0;
     break;
    } else {
     label = 3721;
     break;
    }
   } else if (($18 | 0) == 237) {
    if (($14 & 255) > 159) {
     $_0 = 0;
     break;
    } else {
     label = 3721;
     break;
    }
   } else {
    if ($14 << 24 >> 24 > -1) {
     $_0 = 0;
     break;
    } else {
     label = 3721;
     break;
    }
   }
  }
 } while (0);
 do {
  if ((label | 0) == 3721) {
   $30 = HEAP8[$source] | 0;
   if ($30 << 24 >> 24 < 0 & ($30 & 255) < 194) {
    $_0 = 0;
    break;
   }
   $_0 = ($30 & 255) < 245 | 0;
  }
 } while (0);
 return $_0 | 0;
}
function _ConvertUTF32toUTF8($sourceStart, $sourceEnd, $targetStart, $targetEnd, $flags) {
 $sourceStart = $sourceStart | 0;
 $sourceEnd = $sourceEnd | 0;
 $targetStart = $targetStart | 0;
 $targetEnd = $targetEnd | 0;
 $flags = $flags | 0;
 var $1 = 0, $2 = 0, $4 = 0, $result_040 = 0, $source_039 = 0, $target_038 = 0, $6 = 0, $7 = 0, $17 = 0, $ch_0 = 0, $bytesToWrite_0 = 0, $result_1 = 0, $19 = 0, $26 = 0, $target_1 = 0, $ch_1 = 0, $32 = 0, $target_2 = 0, $ch_2 = 0, $38 = 0, $target_3 = 0, $ch_3 = 0, $46 = 0, $target_4 = 0, $48 = 0, $source_0_lcssa = 0, $target_0_lcssa = 0, $result_2 = 0, label = 0;
 $1 = HEAP32[$sourceStart >> 2] | 0;
 $2 = HEAP32[$targetStart >> 2] | 0;
 L4750 : do {
  if ($1 >>> 0 < $sourceEnd >>> 0) {
   $4 = ($flags | 0) == 0;
   $target_038 = $2;
   $source_039 = $1;
   $result_040 = 0;
   while (1) {
    $6 = $source_039 + 4 | 0;
    $7 = HEAP32[$source_039 >> 2] | 0;
    if ($4) {
     if (($7 - 55296 | 0) >>> 0 < 2048) {
      $result_2 = 3;
      $target_0_lcssa = $target_038;
      $source_0_lcssa = $source_039;
      break L4750;
     }
    }
    do {
     if ($7 >>> 0 < 128) {
      $result_1 = $result_040;
      $bytesToWrite_0 = 1;
      $ch_0 = $7;
     } else {
      if ($7 >>> 0 < 2048) {
       $result_1 = $result_040;
       $bytesToWrite_0 = 2;
       $ch_0 = $7;
       break;
      }
      if ($7 >>> 0 < 65536) {
       $result_1 = $result_040;
       $bytesToWrite_0 = 3;
       $ch_0 = $7;
       break;
      }
      $17 = $7 >>> 0 < 1114112;
      $result_1 = $17 ? $result_040 : 3;
      $bytesToWrite_0 = $17 ? 4 : 3;
      $ch_0 = $17 ? $7 : 65533;
     }
    } while (0);
    $19 = $target_038 + $bytesToWrite_0 | 0;
    if ($19 >>> 0 > $targetEnd >>> 0) {
     $result_2 = 2;
     $target_0_lcssa = $target_038;
     $source_0_lcssa = $source_039;
     break L4750;
    }
    if (($bytesToWrite_0 | 0) == 3) {
     $ch_1 = $ch_0;
     $target_1 = $19;
     label = 3735;
    } else if (($bytesToWrite_0 | 0) == 1) {
     $ch_3 = $ch_0;
     $target_3 = $19;
     label = 3737;
    } else if (($bytesToWrite_0 | 0) == 4) {
     $26 = $target_038 + ($bytesToWrite_0 - 1) | 0;
     HEAP8[$26] = ($ch_0 & 63 | 128) & 255;
     $ch_1 = $ch_0 >>> 6;
     $target_1 = $26;
     label = 3735;
    } else if (($bytesToWrite_0 | 0) == 2) {
     $ch_2 = $ch_0;
     $target_2 = $19;
     label = 3736;
    } else {
     $target_4 = $19;
    }
    if ((label | 0) == 3735) {
     label = 0;
     $32 = $target_1 - 1 | 0;
     HEAP8[$32] = ($ch_1 & 63 | 128) & 255;
     $ch_2 = $ch_1 >>> 6;
     $target_2 = $32;
     label = 3736;
    }
    if ((label | 0) == 3736) {
     label = 0;
     $38 = $target_2 - 1 | 0;
     HEAP8[$38] = ($ch_2 & 63 | 128) & 255;
     $ch_3 = $ch_2 >>> 6;
     $target_3 = $38;
     label = 3737;
    }
    if ((label | 0) == 3737) {
     label = 0;
     $46 = $target_3 - 1 | 0;
     HEAP8[$46] = (HEAPU8[11264 + $bytesToWrite_0 | 0] | 0 | $ch_3) & 255;
     $target_4 = $46;
    }
    $48 = $target_4 + $bytesToWrite_0 | 0;
    if ($6 >>> 0 < $sourceEnd >>> 0) {
     $target_038 = $48;
     $source_039 = $6;
     $result_040 = $result_1;
    } else {
     $result_2 = $result_1;
     $target_0_lcssa = $48;
     $source_0_lcssa = $6;
     break;
    }
   }
  } else {
   $result_2 = 0;
   $target_0_lcssa = $2;
   $source_0_lcssa = $1;
  }
 } while (0);
 HEAP32[$sourceStart >> 2] = $source_0_lcssa;
 HEAP32[$targetStart >> 2] = $target_0_lcssa;
 return $result_2 | 0;
}
function __ZNSt8bad_castC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 8080;
 return;
}
function __ZNSt10bad_typeidC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 8144;
 return;
}
function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $0) {
 $this = $this | 0;
 $thrown_type = $thrown_type | 0;
 $0 = $0 | 0;
 return ($this | 0) == ($thrown_type | 0) | 0;
}
function __ZNK10__cxxabiv116__enum_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $0) {
 $this = $this | 0;
 $thrown_type = $thrown_type | 0;
 $0 = $0 | 0;
 return ($this | 0) == ($thrown_type | 0) | 0;
}
function __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 $this = $this | 0;
 $info = $info | 0;
 $adjustedPtr = $adjustedPtr | 0;
 $path_below = $path_below | 0;
 var $1 = 0, $2 = 0, $10 = 0, $15 = 0;
 $1 = $info + 16 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) == 0) {
  HEAP32[$1 >> 2] = $adjustedPtr;
  HEAP32[$info + 24 >> 2] = $path_below;
  HEAP32[$info + 36 >> 2] = 1;
  return;
 }
 if (($2 | 0) != ($adjustedPtr | 0)) {
  $15 = $info + 36 | 0;
  HEAP32[$15 >> 2] = (HEAP32[$15 >> 2] | 0) + 1;
  HEAP32[$info + 24 >> 2] = 2;
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 $10 = $info + 24 | 0;
 if ((HEAP32[$10 >> 2] | 0) != 2) {
  return;
 }
 HEAP32[$10 >> 2] = $path_below;
 return;
}
function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 $this = $this | 0;
 $info = $info | 0;
 $adjustedPtr = $adjustedPtr | 0;
 $path_below = $path_below | 0;
 var $5 = 0, $6 = 0, $14 = 0, $19 = 0;
 if ((HEAP32[$info + 8 >> 2] | 0) != ($this | 0)) {
  return;
 }
 $5 = $info + 16 | 0;
 $6 = HEAP32[$5 >> 2] | 0;
 if (($6 | 0) == 0) {
  HEAP32[$5 >> 2] = $adjustedPtr;
  HEAP32[$info + 24 >> 2] = $path_below;
  HEAP32[$info + 36 >> 2] = 1;
  return;
 }
 if (($6 | 0) != ($adjustedPtr | 0)) {
  $19 = $info + 36 | 0;
  HEAP32[$19 >> 2] = (HEAP32[$19 >> 2] | 0) + 1;
  HEAP32[$info + 24 >> 2] = 2;
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 $14 = $info + 24 | 0;
 if ((HEAP32[$14 >> 2] | 0) != 2) {
  return;
 }
 HEAP32[$14 >> 2] = $path_below;
 return;
}
function _ConvertUTF8toUTF16($sourceStart, $sourceEnd, $targetStart, $targetEnd, $flags) {
 $sourceStart = $sourceStart | 0;
 $sourceEnd = $sourceEnd | 0;
 $targetStart = $targetStart | 0;
 $targetEnd = $targetEnd | 0;
 $flags = $flags | 0;
 var $1 = 0, $2 = 0, $4 = 0, $5 = 0, $target_073 = 0, $source_072 = 0, $8 = 0, $12 = 0, $source_1 = 0, $ch_0 = 0, $source_2 = 0, $ch_1 = 0, $source_3 = 0, $ch_2 = 0, $source_4 = 0, $ch_3 = 0, $source_5 = 0, $ch_4 = 0, $source_6 = 0, $ch_5 = 0, $55 = 0, $target_0_be = 0, $83 = 0, $89 = 0, $target_065 = 0, $source_7 = 0, $result_0 = 0, label = 0;
 $1 = HEAP32[$sourceStart >> 2] | 0;
 $2 = HEAP32[$targetStart >> 2] | 0;
 L4807 : do {
  if ($1 >>> 0 < $sourceEnd >>> 0) {
   $4 = ($flags | 0) == 0;
   $5 = ($flags | 0) == 0;
   $source_072 = $1;
   $target_073 = $2;
   L4809 : while (1) {
    $8 = HEAPU8[$source_072] | 0;
    $12 = HEAP8[10984 + $8 | 0] & 65535;
    if (($source_072 + $12 | 0) >>> 0 >= $sourceEnd >>> 0) {
     $result_0 = 1;
     $source_7 = $source_072;
     $target_065 = $target_073;
     break L4807;
    }
    if ((__ZL11isLegalUTF8PKhi($source_072, $12 + 1 | 0) | 0) << 24 >> 24 == 0) {
     $result_0 = 3;
     $source_7 = $source_072;
     $target_065 = $target_073;
     break L4807;
    }
    if (($12 | 0) == 1) {
     $ch_3 = 0;
     $source_4 = $source_072;
     label = 3777;
    } else if (($12 | 0) == 2) {
     $ch_2 = 0;
     $source_3 = $source_072;
     label = 3776;
    } else if (($12 | 0) == 3) {
     $ch_1 = 0;
     $source_2 = $source_072;
     label = 3775;
    } else if (($12 | 0) == 0) {
     $ch_4 = 0;
     $source_5 = $source_072;
     label = 3778;
    } else if (($12 | 0) == 4) {
     $ch_0 = 0;
     $source_1 = $source_072;
     label = 3774;
    } else if (($12 | 0) == 5) {
     $ch_0 = $8 << 6;
     $source_1 = $source_072 + 1 | 0;
     label = 3774;
    } else {
     $ch_5 = 0;
     $source_6 = $source_072;
    }
    if ((label | 0) == 3774) {
     label = 0;
     $ch_1 = (HEAPU8[$source_1] | 0) + $ch_0 << 6;
     $source_2 = $source_1 + 1 | 0;
     label = 3775;
    }
    if ((label | 0) == 3775) {
     label = 0;
     $ch_2 = (HEAPU8[$source_2] | 0) + $ch_1 << 6;
     $source_3 = $source_2 + 1 | 0;
     label = 3776;
    }
    if ((label | 0) == 3776) {
     label = 0;
     $ch_3 = (HEAPU8[$source_3] | 0) + $ch_2 << 6;
     $source_4 = $source_3 + 1 | 0;
     label = 3777;
    }
    if ((label | 0) == 3777) {
     label = 0;
     $ch_4 = (HEAPU8[$source_4] | 0) + $ch_3 << 6;
     $source_5 = $source_4 + 1 | 0;
     label = 3778;
    }
    if ((label | 0) == 3778) {
     label = 0;
     $ch_5 = (HEAPU8[$source_5] | 0) + $ch_4 | 0;
     $source_6 = $source_5 + 1 | 0;
    }
    $55 = $ch_5 - (HEAP32[11240 + ($12 << 2) >> 2] | 0) | 0;
    if ($target_073 >>> 0 >= $targetEnd >>> 0) {
     label = 3780;
     break;
    }
    do {
     if ($55 >>> 0 < 65536) {
      if (($55 - 55296 | 0) >>> 0 >= 2048) {
       HEAP16[$target_073 >> 1] = $55 & 65535;
       $target_0_be = $target_073 + 2 | 0;
       break;
      }
      if ($4) {
       label = 3784;
       break L4809;
      }
      HEAP16[$target_073 >> 1] = -3;
      $target_0_be = $target_073 + 2 | 0;
     } else {
      if ($55 >>> 0 > 1114111) {
       if ($5) {
        label = 3789;
        break L4809;
       }
       HEAP16[$target_073 >> 1] = -3;
       $target_0_be = $target_073 + 2 | 0;
       break;
      } else {
       $83 = $target_073 + 2 | 0;
       if ($83 >>> 0 >= $targetEnd >>> 0) {
        label = 3793;
        break L4809;
       }
       $89 = $55 - 65536 | 0;
       HEAP16[$target_073 >> 1] = ($89 >>> 10) + 55296 & 65535;
       HEAP16[$83 >> 1] = ($89 & 1023 | 56320) & 65535;
       $target_0_be = $target_073 + 4 | 0;
       break;
      }
     }
    } while (0);
    if ($source_6 >>> 0 < $sourceEnd >>> 0) {
     $source_072 = $source_6;
     $target_073 = $target_0_be;
    } else {
     $result_0 = 0;
     $source_7 = $source_6;
     $target_065 = $target_0_be;
     break L4807;
    }
   }
   if ((label | 0) == 3780) {
    $result_0 = 2;
    $source_7 = $source_6 + ~$12 | 0;
    $target_065 = $target_073;
    break;
   } else if ((label | 0) == 3784) {
    $result_0 = 3;
    $source_7 = $source_6 + ~$12 | 0;
    $target_065 = $target_073;
    break;
   } else if ((label | 0) == 3793) {
    $result_0 = 2;
    $source_7 = $source_6 + ~$12 | 0;
    $target_065 = $target_073;
    break;
   } else if ((label | 0) == 3789) {
    $result_0 = 3;
    $source_7 = $source_6 + ~$12 | 0;
    $target_065 = $target_073;
    break;
   }
  } else {
   $result_0 = 0;
   $source_7 = $1;
   $target_065 = $2;
  }
 } while (0);
 HEAP32[$sourceStart >> 2] = $source_7;
 HEAP32[$targetStart >> 2] = $target_065;
 return $result_0 | 0;
}
function _ConvertUTF8toUTF32($sourceStart, $sourceEnd, $targetStart, $targetEnd, $flags) {
 $sourceStart = $sourceStart | 0;
 $sourceEnd = $sourceEnd | 0;
 $targetStart = $targetStart | 0;
 $targetEnd = $targetEnd | 0;
 $flags = $flags | 0;
 var $1 = 0, $2 = 0, $result_0_ph74 = 0, $target_0_ph73 = 0, $source_0_ph72 = 0, $target_057 = 0, $source_056 = 0, $6 = 0, $10 = 0, $source_1 = 0, $ch_0 = 0, $source_2 = 0, $ch_1 = 0, $source_3 = 0, $ch_2 = 0, $source_4 = 0, $ch_3 = 0, $source_5 = 0, $ch_4 = 0, $source_6 = 0, $ch_5 = 0, $53 = 0, $_not = 0, $target_0_be = 0, $65 = 0, $target_051 = 0, $source_7 = 0, $result_1 = 0, label = 0;
 $1 = HEAP32[$sourceStart >> 2] | 0;
 $2 = HEAP32[$targetStart >> 2] | 0;
 L4847 : do {
  if ($1 >>> 0 < $sourceEnd >>> 0) {
   $source_0_ph72 = $1;
   $target_0_ph73 = $2;
   $result_0_ph74 = 0;
   L4849 : while (1) {
    $source_056 = $source_0_ph72;
    $target_057 = $target_0_ph73;
    while (1) {
     $6 = HEAPU8[$source_056] | 0;
     $10 = HEAP8[10984 + $6 | 0] & 65535;
     if (($source_056 + $10 | 0) >>> 0 >= $sourceEnd >>> 0) {
      $result_1 = 1;
      $source_7 = $source_056;
      $target_051 = $target_057;
      break L4847;
     }
     if ((__ZL11isLegalUTF8PKhi($source_056, $10 + 1 | 0) | 0) << 24 >> 24 == 0) {
      $result_1 = 3;
      $source_7 = $source_056;
      $target_051 = $target_057;
      break L4847;
     }
     if (($10 | 0) == 0) {
      $ch_4 = 0;
      $source_5 = $source_056;
      label = 3807;
     } else if (($10 | 0) == 5) {
      $ch_0 = $6 << 6;
      $source_1 = $source_056 + 1 | 0;
      label = 3803;
     } else if (($10 | 0) == 4) {
      $ch_0 = 0;
      $source_1 = $source_056;
      label = 3803;
     } else if (($10 | 0) == 1) {
      $ch_3 = 0;
      $source_4 = $source_056;
      label = 3806;
     } else if (($10 | 0) == 3) {
      $ch_1 = 0;
      $source_2 = $source_056;
      label = 3804;
     } else if (($10 | 0) == 2) {
      $ch_2 = 0;
      $source_3 = $source_056;
      label = 3805;
     } else {
      $ch_5 = 0;
      $source_6 = $source_056;
     }
     if ((label | 0) == 3803) {
      label = 0;
      $ch_1 = (HEAPU8[$source_1] | 0) + $ch_0 << 6;
      $source_2 = $source_1 + 1 | 0;
      label = 3804;
     }
     if ((label | 0) == 3804) {
      label = 0;
      $ch_2 = (HEAPU8[$source_2] | 0) + $ch_1 << 6;
      $source_3 = $source_2 + 1 | 0;
      label = 3805;
     }
     if ((label | 0) == 3805) {
      label = 0;
      $ch_3 = (HEAPU8[$source_3] | 0) + $ch_2 << 6;
      $source_4 = $source_3 + 1 | 0;
      label = 3806;
     }
     if ((label | 0) == 3806) {
      label = 0;
      $ch_4 = (HEAPU8[$source_4] | 0) + $ch_3 << 6;
      $source_5 = $source_4 + 1 | 0;
      label = 3807;
     }
     if ((label | 0) == 3807) {
      label = 0;
      $ch_5 = (HEAPU8[$source_5] | 0) + $ch_4 | 0;
      $source_6 = $source_5 + 1 | 0;
     }
     $53 = $ch_5 - (HEAP32[11240 + ($10 << 2) >> 2] | 0) | 0;
     if ($target_057 >>> 0 >= $targetEnd >>> 0) {
      label = 3809;
      break L4849;
     }
     if ($53 >>> 0 >= 1114112) {
      break;
     }
     $_not = ($53 - 55296 | 0) >>> 0 > 2047;
     if (!($_not | ($flags | 0) != 0)) {
      label = 3812;
      break L4849;
     }
     $target_0_be = $target_057 + 4 | 0;
     HEAP32[$target_057 >> 2] = $_not ? $53 : 65533;
     if ($source_6 >>> 0 < $sourceEnd >>> 0) {
      $source_056 = $source_6;
      $target_057 = $target_0_be;
     } else {
      $result_1 = $result_0_ph74;
      $source_7 = $source_6;
      $target_051 = $target_0_be;
      break L4847;
     }
    }
    $65 = $target_057 + 4 | 0;
    HEAP32[$target_057 >> 2] = 65533;
    if ($source_6 >>> 0 < $sourceEnd >>> 0) {
     $source_0_ph72 = $source_6;
     $target_0_ph73 = $65;
     $result_0_ph74 = 3;
    } else {
     $result_1 = 3;
     $source_7 = $source_6;
     $target_051 = $65;
     break L4847;
    }
   }
   if ((label | 0) == 3809) {
    $result_1 = 2;
    $source_7 = $source_6 + ~$10 | 0;
    $target_051 = $target_057;
    break;
   } else if ((label | 0) == 3812) {
    $result_1 = 3;
    $source_7 = $source_6 + ~$10 | 0;
    $target_051 = $target_057;
    break;
   }
  } else {
   $result_1 = 0;
   $source_7 = $1;
   $target_051 = $2;
  }
 } while (0);
 HEAP32[$sourceStart >> 2] = $source_7;
 HEAP32[$targetStart >> 2] = $target_051;
 return $result_1 | 0;
}
function __ZNSt9type_infoD0Ev($this) {
 $this = $this | 0;
 __ZdlPv($this);
 return;
}
function __ZNSt8bad_castD0Ev($this) {
 $this = $this | 0;
 __ZdlPv($this);
 return;
}
function __ZNSt10bad_typeidD0Ev($this) {
 $this = $this | 0;
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv116__shim_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv116__shim_type_infoD2Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 return;
}
function __ZN10__cxxabiv123__fundamental_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv117__array_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv120__function_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv116__enum_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv117__class_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv117__pbase_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv119__pointer_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZN10__cxxabiv129__pointer_to_member_type_infoD0Ev($this) {
 $this = $this | 0;
 __ZNSt9type_infoD2Ev($this | 0);
 __ZdlPv($this);
 return;
}
function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $adjustedPtr) {
 $this = $this | 0;
 $thrown_type = $thrown_type | 0;
 $adjustedPtr = $adjustedPtr | 0;
 var $info = 0, $8 = 0, $9 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56 | 0;
 $info = sp | 0;
 if (($this | 0) == ($thrown_type | 0)) {
  $_0 = 1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if (($thrown_type | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $8 = ___dynamic_cast($thrown_type, 10840, 10808, -1) | 0;
 $9 = $8;
 if (($8 | 0) == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 _memset($info | 0, 0, 56);
 HEAP32[$info >> 2] = $9;
 HEAP32[$info + 8 >> 2] = $this;
 HEAP32[$info + 12 >> 2] = -1;
 HEAP32[$info + 48 >> 2] = 1;
 FUNCTION_TABLE_viiii[HEAP32[(HEAP32[$8 >> 2] | 0) + 28 >> 2] & 7]($9, $info, HEAP32[$adjustedPtr >> 2] | 0, 1);
 if ((HEAP32[$info + 24 >> 2] | 0) != 1) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 HEAP32[$adjustedPtr >> 2] = HEAP32[$info + 16 >> 2];
 $_0 = 1;
 STACKTOP = sp;
 return $_0 | 0;
}
function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 $this = $this | 0;
 $info = $info | 0;
 $adjustedPtr = $adjustedPtr | 0;
 $path_below = $path_below | 0;
 var $7 = 0, $8 = 0, $16 = 0, $21 = 0, $28 = 0;
 if (($this | 0) != (HEAP32[$info + 8 >> 2] | 0)) {
  $28 = HEAP32[$this + 8 >> 2] | 0;
  FUNCTION_TABLE_viiii[HEAP32[(HEAP32[$28 >> 2] | 0) + 28 >> 2] & 7]($28, $info, $adjustedPtr, $path_below);
  return;
 }
 $7 = $info + 16 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 if (($8 | 0) == 0) {
  HEAP32[$7 >> 2] = $adjustedPtr;
  HEAP32[$info + 24 >> 2] = $path_below;
  HEAP32[$info + 36 >> 2] = 1;
  return;
 }
 if (($8 | 0) != ($adjustedPtr | 0)) {
  $21 = $info + 36 | 0;
  HEAP32[$21 >> 2] = (HEAP32[$21 >> 2] | 0) + 1;
  HEAP32[$info + 24 >> 2] = 2;
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 $16 = $info + 24 | 0;
 if ((HEAP32[$16 >> 2] | 0) != 2) {
  return;
 }
 HEAP32[$16 >> 2] = $path_below;
 return;
}
function __ZNK10__cxxabiv122__base_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 $this = $this | 0;
 $info = $info | 0;
 $adjustedPtr = $adjustedPtr | 0;
 $path_below = $path_below | 0;
 var $2 = 0, $3 = 0, $offset_to_base_0 = 0, $14 = 0;
 $2 = HEAP32[$this + 4 >> 2] | 0;
 $3 = $2 >> 8;
 if (($2 & 1 | 0) == 0) {
  $offset_to_base_0 = $3;
 } else {
  $offset_to_base_0 = HEAP32[(HEAP32[$adjustedPtr >> 2] | 0) + $3 >> 2] | 0;
 }
 $14 = HEAP32[$this >> 2] | 0;
 FUNCTION_TABLE_viiii[HEAP32[(HEAP32[$14 >> 2] | 0) + 28 >> 2] & 7]($14, $info, $adjustedPtr + $offset_to_base_0 | 0, ($2 & 2 | 0) != 0 ? $path_below : 2);
 return;
}
function __ZNK10__cxxabiv117__pbase_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $0) {
 $this = $this | 0;
 $thrown_type = $thrown_type | 0;
 $0 = $0 | 0;
 var $3 = 0;
 $3 = $thrown_type | 0;
 return ($this | 0) == ($3 | 0) | ($3 | 0) == 10880 | 0;
}
function __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this, $info, $dst_ptr, $current_ptr, $path_below) {
 $this = $this | 0;
 $info = $info | 0;
 $dst_ptr = $dst_ptr | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 var $7 = 0, $8 = 0, $22 = 0, $23 = 0, $27 = 0, $35 = 0;
 HEAP8[$info + 53 | 0] = 1;
 if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
  return;
 }
 HEAP8[$info + 52 | 0] = 1;
 $7 = $info + 16 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 if (($8 | 0) == 0) {
  HEAP32[$7 >> 2] = $dst_ptr;
  HEAP32[$info + 24 >> 2] = $path_below;
  HEAP32[$info + 36 >> 2] = 1;
  if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($path_below | 0) == 1)) {
   return;
  }
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 if (($8 | 0) != ($dst_ptr | 0)) {
  $35 = $info + 36 | 0;
  HEAP32[$35 >> 2] = (HEAP32[$35 >> 2] | 0) + 1;
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 $22 = $info + 24 | 0;
 $23 = HEAP32[$22 >> 2] | 0;
 if (($23 | 0) == 2) {
  HEAP32[$22 >> 2] = $path_below;
  $27 = $path_below;
 } else {
  $27 = $23;
 }
 if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($27 | 0) == 1)) {
  return;
 }
 HEAP8[$info + 54 | 0] = 1;
 return;
}
function __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi($this, $info, $current_ptr, $path_below) {
 $this = $this | 0;
 $info = $info | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 var $5 = 0;
 if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
  return;
 }
 $5 = $info + 28 | 0;
 if ((HEAP32[$5 >> 2] | 0) == 1) {
  return;
 }
 HEAP32[$5 >> 2] = $path_below;
 return;
}
function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 $this = $this | 0;
 $info = $info | 0;
 $adjustedPtr = $adjustedPtr | 0;
 $path_below = $path_below | 0;
 var $7 = 0, $8 = 0, $16 = 0, $21 = 0, $28 = 0, $29 = 0, $31 = 0, $32 = 0, $offset_to_base_0_i16 = 0, $42 = 0, $53 = 0, $54 = 0, $p_0 = 0, $57 = 0, $58 = 0, $offset_to_base_0_i = 0, $67 = 0, $80 = 0, label = 0;
 if (($this | 0) == (HEAP32[$info + 8 >> 2] | 0)) {
  $7 = $info + 16 | 0;
  $8 = HEAP32[$7 >> 2] | 0;
  if (($8 | 0) == 0) {
   HEAP32[$7 >> 2] = $adjustedPtr;
   HEAP32[$info + 24 >> 2] = $path_below;
   HEAP32[$info + 36 >> 2] = 1;
   return;
  }
  if (($8 | 0) != ($adjustedPtr | 0)) {
   $21 = $info + 36 | 0;
   HEAP32[$21 >> 2] = (HEAP32[$21 >> 2] | 0) + 1;
   HEAP32[$info + 24 >> 2] = 2;
   HEAP8[$info + 54 | 0] = 1;
   return;
  }
  $16 = $info + 24 | 0;
  if ((HEAP32[$16 >> 2] | 0) != 2) {
   return;
  }
  HEAP32[$16 >> 2] = $path_below;
  return;
 }
 $28 = HEAP32[$this + 12 >> 2] | 0;
 $29 = $this + 16 + ($28 << 3) | 0;
 $31 = HEAP32[$this + 20 >> 2] | 0;
 $32 = $31 >> 8;
 if (($31 & 1 | 0) == 0) {
  $offset_to_base_0_i16 = $32;
 } else {
  $offset_to_base_0_i16 = HEAP32[(HEAP32[$adjustedPtr >> 2] | 0) + $32 >> 2] | 0;
 }
 $42 = HEAP32[$this + 16 >> 2] | 0;
 FUNCTION_TABLE_viiii[HEAP32[(HEAP32[$42 >> 2] | 0) + 28 >> 2] & 7]($42, $info, $adjustedPtr + $offset_to_base_0_i16 | 0, ($31 & 2 | 0) != 0 ? $path_below : 2);
 if (($28 | 0) <= 1) {
  return;
 }
 $53 = $info + 54 | 0;
 $54 = $adjustedPtr;
 $p_0 = $this + 24 | 0;
 while (1) {
  $57 = HEAP32[$p_0 + 4 >> 2] | 0;
  $58 = $57 >> 8;
  if (($57 & 1 | 0) == 0) {
   $offset_to_base_0_i = $58;
  } else {
   $offset_to_base_0_i = HEAP32[(HEAP32[$54 >> 2] | 0) + $58 >> 2] | 0;
  }
  $67 = HEAP32[$p_0 >> 2] | 0;
  FUNCTION_TABLE_viiii[HEAP32[(HEAP32[$67 >> 2] | 0) + 28 >> 2] & 7]($67, $info, $adjustedPtr + $offset_to_base_0_i | 0, ($57 & 2 | 0) != 0 ? $path_below : 2);
  if ((HEAP8[$53] & 1) != 0) {
   label = 3900;
   break;
  }
  $80 = $p_0 + 8 | 0;
  if ($80 >>> 0 < $29 >>> 0) {
   $p_0 = $80;
  } else {
   label = 3901;
   break;
  }
 }
 if ((label | 0) == 3900) {
  return;
 } else if ((label | 0) == 3901) {
  return;
 }
}
function __ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $adjustedPtr) {
 $this = $this | 0;
 $thrown_type = $thrown_type | 0;
 $adjustedPtr = $adjustedPtr | 0;
 var $info = 0, $5 = 0, $12 = 0, $25 = 0, $28 = 0, $36 = 0, $40 = 0, $44 = 0, $45 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56 | 0;
 $info = sp | 0;
 HEAP32[$adjustedPtr >> 2] = HEAP32[HEAP32[$adjustedPtr >> 2] >> 2];
 $5 = $thrown_type | 0;
 do {
  if (($this | 0) == ($5 | 0) | ($5 | 0) == 10880) {
   $_0 = 1;
  } else {
   if (($thrown_type | 0) == 0) {
    $_0 = 0;
    break;
   }
   $12 = ___dynamic_cast($thrown_type, 10840, 10776, -1) | 0;
   if (($12 | 0) == 0) {
    $_0 = 0;
    break;
   }
   if ((HEAP32[$12 + 8 >> 2] & ~HEAP32[$this + 8 >> 2] | 0) != 0) {
    $_0 = 0;
    break;
   }
   $25 = HEAP32[$this + 12 >> 2] | 0;
   $28 = $12 + 12 | 0;
   if (($25 | 0) == (HEAP32[$28 >> 2] | 0) | ($25 | 0) == 9912) {
    $_0 = 1;
    break;
   }
   if (($25 | 0) == 0) {
    $_0 = 0;
    break;
   }
   $36 = ___dynamic_cast($25, 10840, 10808, -1) | 0;
   if (($36 | 0) == 0) {
    $_0 = 0;
    break;
   }
   $40 = HEAP32[$28 >> 2] | 0;
   if (($40 | 0) == 0) {
    $_0 = 0;
    break;
   }
   $44 = ___dynamic_cast($40, 10840, 10808, -1) | 0;
   $45 = $44;
   if (($44 | 0) == 0) {
    $_0 = 0;
    break;
   }
   _memset($info | 0, 0, 56);
   HEAP32[$info >> 2] = $45;
   HEAP32[$info + 8 >> 2] = $36;
   HEAP32[$info + 12 >> 2] = -1;
   HEAP32[$info + 48 >> 2] = 1;
   FUNCTION_TABLE_viiii[HEAP32[(HEAP32[$44 >> 2] | 0) + 28 >> 2] & 7]($45, $info, HEAP32[$adjustedPtr >> 2] | 0, 1);
   if ((HEAP32[$info + 24 >> 2] | 0) != 1) {
    $_0 = 0;
    break;
   }
   HEAP32[$adjustedPtr >> 2] = HEAP32[$info + 16 >> 2];
   $_0 = 1;
  }
 } while (0);
 STACKTOP = sp;
 return $_0 | 0;
}
function ___dynamic_cast($static_ptr, $static_type, $dst_type, $src2dst_offset) {
 $static_ptr = $static_ptr | 0;
 $static_type = $static_type | 0;
 $dst_type = $dst_type | 0;
 $src2dst_offset = $src2dst_offset | 0;
 var $info = 0, $2 = 0, $6 = 0, $8 = 0, $9 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $38 = 0, $dst_ptr_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56 | 0;
 $info = sp | 0;
 $2 = HEAP32[$static_ptr >> 2] | 0;
 $6 = $static_ptr + (HEAP32[$2 - 8 >> 2] | 0) | 0;
 $8 = HEAP32[$2 - 4 >> 2] | 0;
 $9 = $8;
 HEAP32[$info >> 2] = $dst_type;
 HEAP32[$info + 4 >> 2] = $static_ptr;
 HEAP32[$info + 8 >> 2] = $static_type;
 HEAP32[$info + 12 >> 2] = $src2dst_offset;
 $14 = $info + 16 | 0;
 $15 = $info + 20 | 0;
 $16 = $info + 24 | 0;
 $17 = $info + 28 | 0;
 $18 = $info + 32 | 0;
 $19 = $info + 40 | 0;
 _memset($14 | 0, 0, 39);
 if (($8 | 0) == ($dst_type | 0)) {
  HEAP32[$info + 48 >> 2] = 1;
  FUNCTION_TABLE_viiiiii[HEAP32[(HEAP32[$8 >> 2] | 0) + 20 >> 2] & 7]($9, $info, $6, $6, 1, 0);
  STACKTOP = sp;
  return ((HEAP32[$16 >> 2] | 0) == 1 ? $6 : 0) | 0;
 }
 FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$8 >> 2] | 0) + 24 >> 2] & 7]($9, $info, $6, 1, 0);
 $38 = HEAP32[$info + 36 >> 2] | 0;
 if (($38 | 0) == 1) {
  do {
   if ((HEAP32[$16 >> 2] | 0) != 1) {
    if ((HEAP32[$19 >> 2] | 0) != 0) {
     $dst_ptr_0 = 0;
     STACKTOP = sp;
     return $dst_ptr_0 | 0;
    }
    if ((HEAP32[$17 >> 2] | 0) != 1) {
     $dst_ptr_0 = 0;
     STACKTOP = sp;
     return $dst_ptr_0 | 0;
    }
    if ((HEAP32[$18 >> 2] | 0) == 1) {
     break;
    } else {
     $dst_ptr_0 = 0;
    }
    STACKTOP = sp;
    return $dst_ptr_0 | 0;
   }
  } while (0);
  $dst_ptr_0 = HEAP32[$14 >> 2] | 0;
  STACKTOP = sp;
  return $dst_ptr_0 | 0;
 } else if (($38 | 0) == 0) {
  if ((HEAP32[$19 >> 2] | 0) != 1) {
   $dst_ptr_0 = 0;
   STACKTOP = sp;
   return $dst_ptr_0 | 0;
  }
  if ((HEAP32[$17 >> 2] | 0) != 1) {
   $dst_ptr_0 = 0;
   STACKTOP = sp;
   return $dst_ptr_0 | 0;
  }
  $dst_ptr_0 = (HEAP32[$18 >> 2] | 0) == 1 ? HEAP32[$15 >> 2] | 0 : 0;
  STACKTOP = sp;
  return $dst_ptr_0 | 0;
 } else {
  $dst_ptr_0 = 0;
  STACKTOP = sp;
  return $dst_ptr_0 | 0;
 }
 return 0;
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this, $info, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $1 = 0, $11 = 0, $25 = 0, $34 = 0, $39 = 0, $40 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $is_dst_type_derived_from_static_type_0_off089 = 0, $p_088 = 0, $does_dst_type_point_to_our_static_type_0_off087 = 0, $51 = 0, $52 = 0, $offset_to_base_0_i81 = 0, $61 = 0, $does_dst_type_point_to_our_static_type_1_off0 = 0, $is_dst_type_derived_from_static_type_1_off0 = 0, $93 = 0, $does_dst_type_point_to_our_static_type_0_off0_lcssa = 0, $is_dst_type_derived_from_static_type_2_off0 = 0, $is_dst_type_derived_from_static_type_2_off098 = 0, $95 = 0, $is_dst_type_derived_from_static_type_2_off099 = 0, $111 = 0, $112 = 0, $114 = 0, $115 = 0, $offset_to_base_0_i82 = 0, $125 = 0, $134 = 0, $138 = 0, $142 = 0, $145 = 0, $146 = 0, $p2_0 = 0, $153 = 0, $154 = 0, $offset_to_base_0_i79 = 0, $163 = 0, $172 = 0, $177 = 0, $178 = 0, $179 = 0, $180 = 0, $181 = 0, $p2_1 = 0, $194 = 0, $195 = 0, $offset_to_base_0_i77 = 0, $204 = 0, $213 = 0, $p2_2 = 0, $224 = 0, $225 = 0, $offset_to_base_0_i = 0, $234 = 0, $243 = 0, label = 0;
 $1 = $this | 0;
 if (($1 | 0) == (HEAP32[$info + 8 >> 2] | 0)) {
  if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
   return;
  }
  $11 = $info + 28 | 0;
  if ((HEAP32[$11 >> 2] | 0) == 1) {
   return;
  }
  HEAP32[$11 >> 2] = $path_below;
  return;
 }
 if (($1 | 0) == (HEAP32[$info >> 2] | 0)) {
  do {
   if ((HEAP32[$info + 16 >> 2] | 0) != ($current_ptr | 0)) {
    $25 = $info + 20 | 0;
    if ((HEAP32[$25 >> 2] | 0) == ($current_ptr | 0)) {
     break;
    }
    HEAP32[$info + 32 >> 2] = $path_below;
    $34 = $info + 44 | 0;
    if ((HEAP32[$34 >> 2] | 0) == 4) {
     return;
    }
    $39 = HEAP32[$this + 12 >> 2] | 0;
    $40 = $this + 16 + ($39 << 3) | 0;
    L5046 : do {
     if (($39 | 0) > 0) {
      $43 = $info + 52 | 0;
      $44 = $info + 53 | 0;
      $45 = $info + 54 | 0;
      $46 = $this + 8 | 0;
      $47 = $info + 24 | 0;
      $48 = $current_ptr;
      $does_dst_type_point_to_our_static_type_0_off087 = 0;
      $p_088 = $this + 16 | 0;
      $is_dst_type_derived_from_static_type_0_off089 = 0;
      L5048 : while (1) {
       HEAP8[$43] = 0;
       HEAP8[$44] = 0;
       $51 = HEAP32[$p_088 + 4 >> 2] | 0;
       $52 = $51 >> 8;
       if (($51 & 1 | 0) == 0) {
        $offset_to_base_0_i81 = $52;
       } else {
        $offset_to_base_0_i81 = HEAP32[(HEAP32[$48 >> 2] | 0) + $52 >> 2] | 0;
       }
       $61 = HEAP32[$p_088 >> 2] | 0;
       FUNCTION_TABLE_viiiiii[HEAP32[(HEAP32[$61 >> 2] | 0) + 20 >> 2] & 7]($61, $info, $current_ptr, $current_ptr + $offset_to_base_0_i81 | 0, 2 - ($51 >>> 1 & 1) | 0, $use_strcmp);
       if ((HEAP8[$45] & 1) != 0) {
        $is_dst_type_derived_from_static_type_2_off0 = $is_dst_type_derived_from_static_type_0_off089;
        $does_dst_type_point_to_our_static_type_0_off0_lcssa = $does_dst_type_point_to_our_static_type_0_off087;
        break;
       }
       do {
        if ((HEAP8[$44] & 1) == 0) {
         $is_dst_type_derived_from_static_type_1_off0 = $is_dst_type_derived_from_static_type_0_off089;
         $does_dst_type_point_to_our_static_type_1_off0 = $does_dst_type_point_to_our_static_type_0_off087;
        } else {
         if ((HEAP8[$43] & 1) == 0) {
          if ((HEAP32[$46 >> 2] & 1 | 0) == 0) {
           $is_dst_type_derived_from_static_type_2_off0 = 1;
           $does_dst_type_point_to_our_static_type_0_off0_lcssa = $does_dst_type_point_to_our_static_type_0_off087;
           break L5048;
          } else {
           $is_dst_type_derived_from_static_type_1_off0 = 1;
           $does_dst_type_point_to_our_static_type_1_off0 = $does_dst_type_point_to_our_static_type_0_off087;
           break;
          }
         }
         if ((HEAP32[$47 >> 2] | 0) == 1) {
          label = 3965;
          break L5046;
         }
         if ((HEAP32[$46 >> 2] & 2 | 0) == 0) {
          label = 3965;
          break L5046;
         } else {
          $is_dst_type_derived_from_static_type_1_off0 = 1;
          $does_dst_type_point_to_our_static_type_1_off0 = 1;
         }
        }
       } while (0);
       $93 = $p_088 + 8 | 0;
       if ($93 >>> 0 < $40 >>> 0) {
        $does_dst_type_point_to_our_static_type_0_off087 = $does_dst_type_point_to_our_static_type_1_off0;
        $p_088 = $93;
        $is_dst_type_derived_from_static_type_0_off089 = $is_dst_type_derived_from_static_type_1_off0;
       } else {
        $is_dst_type_derived_from_static_type_2_off0 = $is_dst_type_derived_from_static_type_1_off0;
        $does_dst_type_point_to_our_static_type_0_off0_lcssa = $does_dst_type_point_to_our_static_type_1_off0;
        break;
       }
      }
      if ($does_dst_type_point_to_our_static_type_0_off0_lcssa) {
       $is_dst_type_derived_from_static_type_2_off099 = $is_dst_type_derived_from_static_type_2_off0;
       label = 3964;
      } else {
       $is_dst_type_derived_from_static_type_2_off098 = $is_dst_type_derived_from_static_type_2_off0;
       label = 3961;
      }
     } else {
      $is_dst_type_derived_from_static_type_2_off098 = 0;
      label = 3961;
     }
    } while (0);
    do {
     if ((label | 0) == 3961) {
      HEAP32[$25 >> 2] = $current_ptr;
      $95 = $info + 40 | 0;
      HEAP32[$95 >> 2] = (HEAP32[$95 >> 2] | 0) + 1;
      if ((HEAP32[$info + 36 >> 2] | 0) != 1) {
       $is_dst_type_derived_from_static_type_2_off099 = $is_dst_type_derived_from_static_type_2_off098;
       label = 3964;
       break;
      }
      if ((HEAP32[$info + 24 >> 2] | 0) != 2) {
       $is_dst_type_derived_from_static_type_2_off099 = $is_dst_type_derived_from_static_type_2_off098;
       label = 3964;
       break;
      }
      HEAP8[$info + 54 | 0] = 1;
      if ($is_dst_type_derived_from_static_type_2_off098) {
       label = 3965;
      } else {
       label = 3966;
      }
     }
    } while (0);
    if ((label | 0) == 3964) {
     if ($is_dst_type_derived_from_static_type_2_off099) {
      label = 3965;
     } else {
      label = 3966;
     }
    }
    if ((label | 0) == 3965) {
     HEAP32[$34 >> 2] = 3;
     return;
    } else if ((label | 0) == 3966) {
     HEAP32[$34 >> 2] = 4;
     return;
    }
   }
  } while (0);
  if (($path_below | 0) != 1) {
   return;
  }
  HEAP32[$info + 32 >> 2] = 1;
  return;
 }
 $111 = HEAP32[$this + 12 >> 2] | 0;
 $112 = $this + 16 + ($111 << 3) | 0;
 $114 = HEAP32[$this + 20 >> 2] | 0;
 $115 = $114 >> 8;
 if (($114 & 1 | 0) == 0) {
  $offset_to_base_0_i82 = $115;
 } else {
  $offset_to_base_0_i82 = HEAP32[(HEAP32[$current_ptr >> 2] | 0) + $115 >> 2] | 0;
 }
 $125 = HEAP32[$this + 16 >> 2] | 0;
 FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$125 >> 2] | 0) + 24 >> 2] & 7]($125, $info, $current_ptr + $offset_to_base_0_i82 | 0, ($114 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
 $134 = $this + 24 | 0;
 if (($111 | 0) <= 1) {
  return;
 }
 $138 = HEAP32[$this + 8 >> 2] | 0;
 do {
  if (($138 & 2 | 0) == 0) {
   $142 = $info + 36 | 0;
   if ((HEAP32[$142 >> 2] | 0) == 1) {
    break;
   }
   if (($138 & 1 | 0) == 0) {
    $180 = $info + 54 | 0;
    $181 = $current_ptr;
    $p2_2 = $134;
    while (1) {
     if ((HEAP8[$180] & 1) != 0) {
      label = 4006;
      break;
     }
     if ((HEAP32[$142 >> 2] | 0) == 1) {
      label = 4007;
      break;
     }
     $224 = HEAP32[$p2_2 + 4 >> 2] | 0;
     $225 = $224 >> 8;
     if (($224 & 1 | 0) == 0) {
      $offset_to_base_0_i = $225;
     } else {
      $offset_to_base_0_i = HEAP32[(HEAP32[$181 >> 2] | 0) + $225 >> 2] | 0;
     }
     $234 = HEAP32[$p2_2 >> 2] | 0;
     FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$234 >> 2] | 0) + 24 >> 2] & 7]($234, $info, $current_ptr + $offset_to_base_0_i | 0, ($224 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
     $243 = $p2_2 + 8 | 0;
     if ($243 >>> 0 < $112 >>> 0) {
      $p2_2 = $243;
     } else {
      label = 4008;
      break;
     }
    }
    if ((label | 0) == 4006) {
     return;
    } else if ((label | 0) == 4007) {
     return;
    } else if ((label | 0) == 4008) {
     return;
    }
   }
   $177 = $info + 24 | 0;
   $178 = $info + 54 | 0;
   $179 = $current_ptr;
   $p2_1 = $134;
   while (1) {
    if ((HEAP8[$178] & 1) != 0) {
     label = 4003;
     break;
    }
    if ((HEAP32[$142 >> 2] | 0) == 1) {
     if ((HEAP32[$177 >> 2] | 0) == 1) {
      label = 4004;
      break;
     }
    }
    $194 = HEAP32[$p2_1 + 4 >> 2] | 0;
    $195 = $194 >> 8;
    if (($194 & 1 | 0) == 0) {
     $offset_to_base_0_i77 = $195;
    } else {
     $offset_to_base_0_i77 = HEAP32[(HEAP32[$179 >> 2] | 0) + $195 >> 2] | 0;
    }
    $204 = HEAP32[$p2_1 >> 2] | 0;
    FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$204 >> 2] | 0) + 24 >> 2] & 7]($204, $info, $current_ptr + $offset_to_base_0_i77 | 0, ($194 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
    $213 = $p2_1 + 8 | 0;
    if ($213 >>> 0 < $112 >>> 0) {
     $p2_1 = $213;
    } else {
     label = 4005;
     break;
    }
   }
   if ((label | 0) == 4003) {
    return;
   } else if ((label | 0) == 4004) {
    return;
   } else if ((label | 0) == 4005) {
    return;
   }
  }
 } while (0);
 $145 = $info + 54 | 0;
 $146 = $current_ptr;
 $p2_0 = $134;
 while (1) {
  if ((HEAP8[$145] & 1) != 0) {
   label = 4001;
   break;
  }
  $153 = HEAP32[$p2_0 + 4 >> 2] | 0;
  $154 = $153 >> 8;
  if (($153 & 1 | 0) == 0) {
   $offset_to_base_0_i79 = $154;
  } else {
   $offset_to_base_0_i79 = HEAP32[(HEAP32[$146 >> 2] | 0) + $154 >> 2] | 0;
  }
  $163 = HEAP32[$p2_0 >> 2] | 0;
  FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$163 >> 2] | 0) + 24 >> 2] & 7]($163, $info, $current_ptr + $offset_to_base_0_i79 | 0, ($153 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
  $172 = $p2_0 + 8 | 0;
  if ($172 >>> 0 < $112 >>> 0) {
   $p2_0 = $172;
  } else {
   label = 4002;
   break;
  }
 }
 if ((label | 0) == 4001) {
  return;
 } else if ((label | 0) == 4002) {
  return;
 }
}
function __ZNK10__cxxabiv122__base_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $dst_ptr = $dst_ptr | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $2 = 0, $3 = 0, $offset_to_base_0 = 0, $14 = 0;
 $2 = HEAP32[$this + 4 >> 2] | 0;
 $3 = $2 >> 8;
 if (($2 & 1 | 0) == 0) {
  $offset_to_base_0 = $3;
 } else {
  $offset_to_base_0 = HEAP32[(HEAP32[$current_ptr >> 2] | 0) + $3 >> 2] | 0;
 }
 $14 = HEAP32[$this >> 2] | 0;
 FUNCTION_TABLE_viiiiii[HEAP32[(HEAP32[$14 >> 2] | 0) + 20 >> 2] & 7]($14, $info, $dst_ptr, $current_ptr + $offset_to_base_0 | 0, ($2 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
 return;
}
function __ZNK10__cxxabiv122__base_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this, $info, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $2 = 0, $3 = 0, $offset_to_base_0 = 0, $14 = 0;
 $2 = HEAP32[$this + 4 >> 2] | 0;
 $3 = $2 >> 8;
 if (($2 & 1 | 0) == 0) {
  $offset_to_base_0 = $3;
 } else {
  $offset_to_base_0 = HEAP32[(HEAP32[$current_ptr >> 2] | 0) + $3 >> 2] | 0;
 }
 $14 = HEAP32[$this >> 2] | 0;
 FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$14 >> 2] | 0) + 24 >> 2] & 7]($14, $info, $current_ptr + $offset_to_base_0 | 0, ($2 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
 return;
}
function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this, $info, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $9 = 0, $22 = 0, $31 = 0;
 if ((HEAP32[$info + 8 >> 2] | 0) == ($this | 0)) {
  if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
   return;
  }
  $9 = $info + 28 | 0;
  if ((HEAP32[$9 >> 2] | 0) == 1) {
   return;
  }
  HEAP32[$9 >> 2] = $path_below;
  return;
 }
 if ((HEAP32[$info >> 2] | 0) != ($this | 0)) {
  return;
 }
 do {
  if ((HEAP32[$info + 16 >> 2] | 0) != ($current_ptr | 0)) {
   $22 = $info + 20 | 0;
   if ((HEAP32[$22 >> 2] | 0) == ($current_ptr | 0)) {
    break;
   }
   HEAP32[$info + 32 >> 2] = $path_below;
   HEAP32[$22 >> 2] = $current_ptr;
   $31 = $info + 40 | 0;
   HEAP32[$31 >> 2] = (HEAP32[$31 >> 2] | 0) + 1;
   do {
    if ((HEAP32[$info + 36 >> 2] | 0) == 1) {
     if ((HEAP32[$info + 24 >> 2] | 0) != 2) {
      break;
     }
     HEAP8[$info + 54 | 0] = 1;
    }
   } while (0);
   HEAP32[$info + 44 >> 2] = 4;
   return;
  }
 } while (0);
 if (($path_below | 0) != 1) {
  return;
 }
 HEAP32[$info + 32 >> 2] = 1;
 return;
}
function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this, $info, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $1 = 0, $11 = 0, $25 = 0, $34 = 0, $38 = 0, $39 = 0, $41 = 0, $is_dst_type_derived_from_static_type_0_off036 = 0, $52 = 0, $68 = 0, label = 0;
 $1 = $this | 0;
 if (($1 | 0) == (HEAP32[$info + 8 >> 2] | 0)) {
  if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
   return;
  }
  $11 = $info + 28 | 0;
  if ((HEAP32[$11 >> 2] | 0) == 1) {
   return;
  }
  HEAP32[$11 >> 2] = $path_below;
  return;
 }
 if (($1 | 0) != (HEAP32[$info >> 2] | 0)) {
  $68 = HEAP32[$this + 8 >> 2] | 0;
  FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$68 >> 2] | 0) + 24 >> 2] & 7]($68, $info, $current_ptr, $path_below, $use_strcmp);
  return;
 }
 do {
  if ((HEAP32[$info + 16 >> 2] | 0) != ($current_ptr | 0)) {
   $25 = $info + 20 | 0;
   if ((HEAP32[$25 >> 2] | 0) == ($current_ptr | 0)) {
    break;
   }
   HEAP32[$info + 32 >> 2] = $path_below;
   $34 = $info + 44 | 0;
   if ((HEAP32[$34 >> 2] | 0) == 4) {
    return;
   }
   $38 = $info + 52 | 0;
   HEAP8[$38] = 0;
   $39 = $info + 53 | 0;
   HEAP8[$39] = 0;
   $41 = HEAP32[$this + 8 >> 2] | 0;
   FUNCTION_TABLE_viiiiii[HEAP32[(HEAP32[$41 >> 2] | 0) + 20 >> 2] & 7]($41, $info, $current_ptr, $current_ptr, 1, $use_strcmp);
   if ((HEAP8[$39] & 1) == 0) {
    $is_dst_type_derived_from_static_type_0_off036 = 0;
    label = 4048;
   } else {
    if ((HEAP8[$38] & 1) == 0) {
     $is_dst_type_derived_from_static_type_0_off036 = 1;
     label = 4048;
    }
   }
   L5183 : do {
    if ((label | 0) == 4048) {
     HEAP32[$25 >> 2] = $current_ptr;
     $52 = $info + 40 | 0;
     HEAP32[$52 >> 2] = (HEAP32[$52 >> 2] | 0) + 1;
     do {
      if ((HEAP32[$info + 36 >> 2] | 0) == 1) {
       if ((HEAP32[$info + 24 >> 2] | 0) != 2) {
        label = 4051;
        break;
       }
       HEAP8[$info + 54 | 0] = 1;
       if ($is_dst_type_derived_from_static_type_0_off036) {
        break L5183;
       }
      } else {
       label = 4051;
      }
     } while (0);
     if ((label | 0) == 4051) {
      if ($is_dst_type_derived_from_static_type_0_off036) {
       break;
      }
     }
     HEAP32[$34 >> 2] = 4;
     return;
    }
   } while (0);
   HEAP32[$34 >> 2] = 3;
   return;
  }
 } while (0);
 if (($path_below | 0) != 1) {
  return;
 }
 HEAP32[$info + 32 >> 2] = 1;
 return;
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $dst_ptr = $dst_ptr | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $13 = 0, $14 = 0, $28 = 0, $29 = 0, $33 = 0, $41 = 0, $46 = 0, $48 = 0, $49 = 0, $51 = 0, $53 = 0, $54 = 0, $56 = 0, $57 = 0, $offset_to_base_0_i32 = 0, $67 = 0, $78 = 0, $79 = 0, $80 = 0, $81 = 0, $p_0 = 0, $107 = 0, $108 = 0, $offset_to_base_0_i = 0, $117 = 0;
 if (($this | 0) != (HEAP32[$info + 8 >> 2] | 0)) {
  $46 = $info + 52 | 0;
  $48 = HEAP8[$46] & 1;
  $49 = $info + 53 | 0;
  $51 = HEAP8[$49] & 1;
  $53 = HEAP32[$this + 12 >> 2] | 0;
  $54 = $this + 16 + ($53 << 3) | 0;
  HEAP8[$46] = 0;
  HEAP8[$49] = 0;
  $56 = HEAP32[$this + 20 >> 2] | 0;
  $57 = $56 >> 8;
  if (($56 & 1 | 0) == 0) {
   $offset_to_base_0_i32 = $57;
  } else {
   $offset_to_base_0_i32 = HEAP32[(HEAP32[$current_ptr >> 2] | 0) + $57 >> 2] | 0;
  }
  $67 = HEAP32[$this + 16 >> 2] | 0;
  FUNCTION_TABLE_viiiiii[HEAP32[(HEAP32[$67 >> 2] | 0) + 20 >> 2] & 7]($67, $info, $dst_ptr, $current_ptr + $offset_to_base_0_i32 | 0, ($56 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
  L5205 : do {
   if (($53 | 0) > 1) {
    $78 = $info + 24 | 0;
    $79 = $this + 8 | 0;
    $80 = $info + 54 | 0;
    $81 = $current_ptr;
    $p_0 = $this + 24 | 0;
    do {
     if ((HEAP8[$80] & 1) != 0) {
      break L5205;
     }
     do {
      if ((HEAP8[$46] & 1) == 0) {
       if ((HEAP8[$49] & 1) == 0) {
        break;
       }
       if ((HEAP32[$79 >> 2] & 1 | 0) == 0) {
        break L5205;
       }
      } else {
       if ((HEAP32[$78 >> 2] | 0) == 1) {
        break L5205;
       }
       if ((HEAP32[$79 >> 2] & 2 | 0) == 0) {
        break L5205;
       }
      }
     } while (0);
     HEAP8[$46] = 0;
     HEAP8[$49] = 0;
     $107 = HEAP32[$p_0 + 4 >> 2] | 0;
     $108 = $107 >> 8;
     if (($107 & 1 | 0) == 0) {
      $offset_to_base_0_i = $108;
     } else {
      $offset_to_base_0_i = HEAP32[(HEAP32[$81 >> 2] | 0) + $108 >> 2] | 0;
     }
     $117 = HEAP32[$p_0 >> 2] | 0;
     FUNCTION_TABLE_viiiiii[HEAP32[(HEAP32[$117 >> 2] | 0) + 20 >> 2] & 7]($117, $info, $dst_ptr, $current_ptr + $offset_to_base_0_i | 0, ($107 & 2 | 0) != 0 ? $path_below : 2, $use_strcmp);
     $p_0 = $p_0 + 8 | 0;
    } while ($p_0 >>> 0 < $54 >>> 0);
   }
  } while (0);
  HEAP8[$46] = $48;
  HEAP8[$49] = $51;
  return;
 }
 HEAP8[$info + 53 | 0] = 1;
 if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
  return;
 }
 HEAP8[$info + 52 | 0] = 1;
 $13 = $info + 16 | 0;
 $14 = HEAP32[$13 >> 2] | 0;
 if (($14 | 0) == 0) {
  HEAP32[$13 >> 2] = $dst_ptr;
  HEAP32[$info + 24 >> 2] = $path_below;
  HEAP32[$info + 36 >> 2] = 1;
  if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($path_below | 0) == 1)) {
   return;
  }
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 if (($14 | 0) != ($dst_ptr | 0)) {
  $41 = $info + 36 | 0;
  HEAP32[$41 >> 2] = (HEAP32[$41 >> 2] | 0) + 1;
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 $28 = $info + 24 | 0;
 $29 = HEAP32[$28 >> 2] | 0;
 if (($29 | 0) == 2) {
  HEAP32[$28 >> 2] = $path_below;
  $33 = $path_below;
 } else {
  $33 = $29;
 }
 if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($33 | 0) == 1)) {
  return;
 }
 HEAP8[$info + 54 | 0] = 1;
 return;
}
function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $dst_ptr = $dst_ptr | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $11 = 0, $12 = 0, $26 = 0, $27 = 0, $31 = 0, $39 = 0;
 if ((HEAP32[$info + 8 >> 2] | 0) != ($this | 0)) {
  return;
 }
 HEAP8[$info + 53 | 0] = 1;
 if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
  return;
 }
 HEAP8[$info + 52 | 0] = 1;
 $11 = $info + 16 | 0;
 $12 = HEAP32[$11 >> 2] | 0;
 if (($12 | 0) == 0) {
  HEAP32[$11 >> 2] = $dst_ptr;
  HEAP32[$info + 24 >> 2] = $path_below;
  HEAP32[$info + 36 >> 2] = 1;
  if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($path_below | 0) == 1)) {
   return;
  }
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 if (($12 | 0) != ($dst_ptr | 0)) {
  $39 = $info + 36 | 0;
  HEAP32[$39 >> 2] = (HEAP32[$39 >> 2] | 0) + 1;
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 $26 = $info + 24 | 0;
 $27 = HEAP32[$26 >> 2] | 0;
 if (($27 | 0) == 2) {
  HEAP32[$26 >> 2] = $path_below;
  $31 = $path_below;
 } else {
  $31 = $27;
 }
 if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($31 | 0) == 1)) {
  return;
 }
 HEAP8[$info + 54 | 0] = 1;
 return;
}
function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp) {
 $this = $this | 0;
 $info = $info | 0;
 $dst_ptr = $dst_ptr | 0;
 $current_ptr = $current_ptr | 0;
 $path_below = $path_below | 0;
 $use_strcmp = $use_strcmp | 0;
 var $13 = 0, $14 = 0, $28 = 0, $29 = 0, $33 = 0, $41 = 0, $47 = 0;
 if (($this | 0) != (HEAP32[$info + 8 >> 2] | 0)) {
  $47 = HEAP32[$this + 8 >> 2] | 0;
  FUNCTION_TABLE_viiiiii[HEAP32[(HEAP32[$47 >> 2] | 0) + 20 >> 2] & 7]($47, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp);
  return;
 }
 HEAP8[$info + 53 | 0] = 1;
 if ((HEAP32[$info + 4 >> 2] | 0) != ($current_ptr | 0)) {
  return;
 }
 HEAP8[$info + 52 | 0] = 1;
 $13 = $info + 16 | 0;
 $14 = HEAP32[$13 >> 2] | 0;
 if (($14 | 0) == 0) {
  HEAP32[$13 >> 2] = $dst_ptr;
  HEAP32[$info + 24 >> 2] = $path_below;
  HEAP32[$info + 36 >> 2] = 1;
  if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($path_below | 0) == 1)) {
   return;
  }
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 if (($14 | 0) != ($dst_ptr | 0)) {
  $41 = $info + 36 | 0;
  HEAP32[$41 >> 2] = (HEAP32[$41 >> 2] | 0) + 1;
  HEAP8[$info + 54 | 0] = 1;
  return;
 }
 $28 = $info + 24 | 0;
 $29 = HEAP32[$28 >> 2] | 0;
 if (($29 | 0) == 2) {
  HEAP32[$28 >> 2] = $path_below;
  $33 = $path_below;
 } else {
  $33 = $29;
 }
 if (!((HEAP32[$info + 48 >> 2] | 0) == 1 & ($33 | 0) == 1)) {
  return;
 }
 HEAP8[$info + 54 | 0] = 1;
 return;
}
function _malloc($bytes) {
 $bytes = $bytes | 0;
 var $8 = 0, $9 = 0, $10 = 0, $11 = 0, $17 = 0, $18 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $35 = 0, $40 = 0, $45 = 0, $56 = 0, $59 = 0, $62 = 0, $64 = 0, $65 = 0, $67 = 0, $69 = 0, $71 = 0, $73 = 0, $75 = 0, $77 = 0, $79 = 0, $82 = 0, $83 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $100 = 0, $105 = 0, $106 = 0, $109 = 0, $111 = 0, $117 = 0, $120 = 0, $121 = 0, $122 = 0, $124 = 0, $125 = 0, $126 = 0, $132 = 0, $133 = 0, $_pre_phi = 0, $F4_0 = 0, $145 = 0, $150 = 0, $152 = 0, $153 = 0, $155 = 0, $157 = 0, $159 = 0, $161 = 0, $163 = 0, $165 = 0, $167 = 0, $172 = 0, $rsize_0_i = 0, $v_0_i = 0, $t_0_i = 0, $179 = 0, $183 = 0, $185 = 0, $189 = 0, $190 = 0, $192 = 0, $193 = 0, $196 = 0, $197 = 0, $201 = 0, $203 = 0, $207 = 0, $211 = 0, $215 = 0, $220 = 0, $221 = 0, $224 = 0, $225 = 0, $RP_0_i = 0, $R_0_i = 0, $227 = 0, $228 = 0, $231 = 0, $232 = 0, $R_1_i = 0, $242 = 0, $244 = 0, $258 = 0, $274 = 0, $286 = 0, $300 = 0, $304 = 0, $315 = 0, $318 = 0, $319 = 0, $320 = 0, $322 = 0, $323 = 0, $324 = 0, $330 = 0, $331 = 0, $_pre_phi_i = 0, $F1_0_i = 0, $342 = 0, $348 = 0, $349 = 0, $350 = 0, $353 = 0, $354 = 0, $361 = 0, $362 = 0, $365 = 0, $367 = 0, $370 = 0, $375 = 0, $idx_0_i = 0, $383 = 0, $391 = 0, $rst_0_i = 0, $sizebits_0_i = 0, $t_0_i116 = 0, $rsize_0_i117 = 0, $v_0_i118 = 0, $396 = 0, $397 = 0, $rsize_1_i = 0, $v_1_i = 0, $403 = 0, $406 = 0, $rst_1_i = 0, $t_1_i = 0, $rsize_2_i = 0, $v_2_i = 0, $414 = 0, $417 = 0, $422 = 0, $424 = 0, $425 = 0, $427 = 0, $429 = 0, $431 = 0, $433 = 0, $435 = 0, $437 = 0, $439 = 0, $t_2_ph_i = 0, $v_330_i = 0, $rsize_329_i = 0, $t_228_i = 0, $449 = 0, $450 = 0, $_rsize_3_i = 0, $t_2_v_3_i = 0, $452 = 0, $455 = 0, $v_3_lcssa_i = 0, $rsize_3_lcssa_i = 0, $463 = 0, $464 = 0, $467 = 0, $468 = 0, $472 = 0, $474 = 0, $478 = 0, $482 = 0, $486 = 0, $491 = 0, $492 = 0, $495 = 0, $496 = 0, $RP_0_i119 = 0, $R_0_i120 = 0, $498 = 0, $499 = 0, $502 = 0, $503 = 0, $R_1_i122 = 0, $513 = 0, $515 = 0, $529 = 0, $545 = 0, $557 = 0, $571 = 0, $575 = 0, $586 = 0, $589 = 0, $591 = 0, $592 = 0, $593 = 0, $599 = 0, $600 = 0, $_pre_phi_i128 = 0, $F5_0_i = 0, $612 = 0, $613 = 0, $620 = 0, $621 = 0, $624 = 0, $626 = 0, $629 = 0, $634 = 0, $I7_0_i = 0, $641 = 0, $648 = 0, $649 = 0, $668 = 0, $T_0_i = 0, $K12_0_i = 0, $677 = 0, $678 = 0, $694 = 0, $695 = 0, $697 = 0, $711 = 0, $nb_0 = 0, $714 = 0, $717 = 0, $718 = 0, $721 = 0, $736 = 0, $743 = 0, $746 = 0, $747 = 0, $748 = 0, $762 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $779 = 0, $782 = 0, $783 = 0, $791 = 0, $794 = 0, $sp_0_i_i = 0, $796 = 0, $797 = 0, $800 = 0, $806 = 0, $809 = 0, $812 = 0, $813 = 0, $814 = 0, $ssize_0_i = 0, $824 = 0, $825 = 0, $829 = 0, $835 = 0, $836 = 0, $840 = 0, $843 = 0, $847 = 0, $ssize_1_i = 0, $br_0_i = 0, $tsize_0_i = 0, $tbase_0_i = 0, $849 = 0, $856 = 0, $860 = 0, $ssize_2_i = 0, $tsize_0303639_i = 0, $tsize_1_i = 0, $876 = 0, $877 = 0, $881 = 0, $883 = 0, $_tbase_1_i = 0, $tbase_245_i = 0, $tsize_244_i = 0, $886 = 0, $890 = 0, $893 = 0, $i_02_i_i = 0, $899 = 0, $901 = 0, $908 = 0, $914 = 0, $917 = 0, $sp_067_i = 0, $925 = 0, $926 = 0, $927 = 0, $932 = 0, $939 = 0, $944 = 0, $946 = 0, $947 = 0, $949 = 0, $955 = 0, $958 = 0, $968 = 0, $sp_160_i = 0, $970 = 0, $975 = 0, $982 = 0, $986 = 0, $993 = 0, $996 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $_sum_i21_i = 0, $1009 = 0, $1010 = 0, $1011 = 0, $1019 = 0, $1028 = 0, $_sum2_i23_i = 0, $1037 = 0, $1041 = 0, $1042 = 0, $1047 = 0, $1050 = 0, $1053 = 0, $1076 = 0, $_pre_phi57_i_i = 0, $1081 = 0, $1084 = 0, $1087 = 0, $1092 = 0, $1097 = 0, $1101 = 0, $_sum67_i_i = 0, $1107 = 0, $1108 = 0, $1112 = 0, $1113 = 0, $RP_0_i_i = 0, $R_0_i_i = 0, $1115 = 0, $1116 = 0, $1119 = 0, $1120 = 0, $R_1_i_i = 0, $1132 = 0, $1134 = 0, $1148 = 0, $_sum3233_i_i = 0, $1165 = 0, $1178 = 0, $qsize_0_i_i = 0, $oldfirst_0_i_i = 0, $1194 = 0, $1202 = 0, $1205 = 0, $1207 = 0, $1208 = 0, $1209 = 0, $1215 = 0, $1216 = 0, $_pre_phi_i25_i = 0, $F4_0_i_i = 0, $1228 = 0, $1229 = 0, $1236 = 0, $1237 = 0, $1240 = 0, $1242 = 0, $1245 = 0, $1250 = 0, $I7_0_i_i = 0, $1257 = 0, $1264 = 0, $1265 = 0, $1284 = 0, $T_0_i27_i = 0, $K8_0_i_i = 0, $1293 = 0, $1294 = 0, $1310 = 0, $1311 = 0, $1313 = 0, $1327 = 0, $sp_0_i_i_i = 0, $1330 = 0, $1334 = 0, $1335 = 0, $1341 = 0, $1348 = 0, $1349 = 0, $1353 = 0, $1354 = 0, $1358 = 0, $1364 = 0, $1367 = 0, $1377 = 0, $1380 = 0, $1381 = 0, $1389 = 0, $1392 = 0, $1398 = 0, $1401 = 0, $1403 = 0, $1404 = 0, $1405 = 0, $1411 = 0, $1412 = 0, $_pre_phi_i_i = 0, $F_0_i_i = 0, $1422 = 0, $1423 = 0, $1430 = 0, $1431 = 0, $1434 = 0, $1436 = 0, $1439 = 0, $1444 = 0, $I1_0_i_i = 0, $1451 = 0, $1455 = 0, $1456 = 0, $1471 = 0, $T_0_i_i = 0, $K2_0_i_i = 0, $1480 = 0, $1481 = 0, $1494 = 0, $1495 = 0, $1497 = 0, $1507 = 0, $1510 = 0, $1511 = 0, $1512 = 0, $mem_0 = 0, label = 0;
 do {
  if ($bytes >>> 0 < 245) {
   if ($bytes >>> 0 < 11) {
    $8 = 16;
   } else {
    $8 = $bytes + 11 & -8;
   }
   $9 = $8 >>> 3;
   $10 = HEAP32[5088] | 0;
   $11 = $10 >>> ($9 >>> 0);
   if (($11 & 3 | 0) != 0) {
    $17 = ($11 & 1 ^ 1) + $9 | 0;
    $18 = $17 << 1;
    $20 = 20392 + ($18 << 2) | 0;
    $21 = 20392 + ($18 + 2 << 2) | 0;
    $22 = HEAP32[$21 >> 2] | 0;
    $23 = $22 + 8 | 0;
    $24 = HEAP32[$23 >> 2] | 0;
    do {
     if (($20 | 0) == ($24 | 0)) {
      HEAP32[5088] = $10 & ~(1 << $17);
     } else {
      if ($24 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
       _abort();
       return 0;
      }
      $35 = $24 + 12 | 0;
      if ((HEAP32[$35 >> 2] | 0) == ($22 | 0)) {
       HEAP32[$35 >> 2] = $20;
       HEAP32[$21 >> 2] = $24;
       break;
      } else {
       _abort();
       return 0;
      }
     }
    } while (0);
    $40 = $17 << 3;
    HEAP32[$22 + 4 >> 2] = $40 | 3;
    $45 = $22 + ($40 | 4) | 0;
    HEAP32[$45 >> 2] = HEAP32[$45 >> 2] | 1;
    $mem_0 = $23;
    return $mem_0 | 0;
   }
   if ($8 >>> 0 <= (HEAP32[5090] | 0) >>> 0) {
    $nb_0 = $8;
    break;
   }
   if (($11 | 0) != 0) {
    $56 = 2 << $9;
    $59 = $11 << $9 & ($56 | -$56);
    $62 = ($59 & -$59) - 1 | 0;
    $64 = $62 >>> 12 & 16;
    $65 = $62 >>> ($64 >>> 0);
    $67 = $65 >>> 5 & 8;
    $69 = $65 >>> ($67 >>> 0);
    $71 = $69 >>> 2 & 4;
    $73 = $69 >>> ($71 >>> 0);
    $75 = $73 >>> 1 & 2;
    $77 = $73 >>> ($75 >>> 0);
    $79 = $77 >>> 1 & 1;
    $82 = ($67 | $64 | $71 | $75 | $79) + ($77 >>> ($79 >>> 0)) | 0;
    $83 = $82 << 1;
    $85 = 20392 + ($83 << 2) | 0;
    $86 = 20392 + ($83 + 2 << 2) | 0;
    $87 = HEAP32[$86 >> 2] | 0;
    $88 = $87 + 8 | 0;
    $89 = HEAP32[$88 >> 2] | 0;
    do {
     if (($85 | 0) == ($89 | 0)) {
      HEAP32[5088] = $10 & ~(1 << $82);
     } else {
      if ($89 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
       _abort();
       return 0;
      }
      $100 = $89 + 12 | 0;
      if ((HEAP32[$100 >> 2] | 0) == ($87 | 0)) {
       HEAP32[$100 >> 2] = $85;
       HEAP32[$86 >> 2] = $89;
       break;
      } else {
       _abort();
       return 0;
      }
     }
    } while (0);
    $105 = $82 << 3;
    $106 = $105 - $8 | 0;
    HEAP32[$87 + 4 >> 2] = $8 | 3;
    $109 = $87;
    $111 = $109 + $8 | 0;
    HEAP32[$109 + ($8 | 4) >> 2] = $106 | 1;
    HEAP32[$109 + $105 >> 2] = $106;
    $117 = HEAP32[5090] | 0;
    if (($117 | 0) != 0) {
     $120 = HEAP32[5093] | 0;
     $121 = $117 >>> 3;
     $122 = $121 << 1;
     $124 = 20392 + ($122 << 2) | 0;
     $125 = HEAP32[5088] | 0;
     $126 = 1 << $121;
     do {
      if (($125 & $126 | 0) == 0) {
       HEAP32[5088] = $125 | $126;
       $F4_0 = $124;
       $_pre_phi = 20392 + ($122 + 2 << 2) | 0;
      } else {
       $132 = 20392 + ($122 + 2 << 2) | 0;
       $133 = HEAP32[$132 >> 2] | 0;
       if ($133 >>> 0 >= (HEAP32[5092] | 0) >>> 0) {
        $F4_0 = $133;
        $_pre_phi = $132;
        break;
       }
       _abort();
       return 0;
      }
     } while (0);
     HEAP32[$_pre_phi >> 2] = $120;
     HEAP32[$F4_0 + 12 >> 2] = $120;
     HEAP32[$120 + 8 >> 2] = $F4_0;
     HEAP32[$120 + 12 >> 2] = $124;
    }
    HEAP32[5090] = $106;
    HEAP32[5093] = $111;
    $mem_0 = $88;
    return $mem_0 | 0;
   }
   $145 = HEAP32[5089] | 0;
   if (($145 | 0) == 0) {
    $nb_0 = $8;
    break;
   }
   $150 = ($145 & -$145) - 1 | 0;
   $152 = $150 >>> 12 & 16;
   $153 = $150 >>> ($152 >>> 0);
   $155 = $153 >>> 5 & 8;
   $157 = $153 >>> ($155 >>> 0);
   $159 = $157 >>> 2 & 4;
   $161 = $157 >>> ($159 >>> 0);
   $163 = $161 >>> 1 & 2;
   $165 = $161 >>> ($163 >>> 0);
   $167 = $165 >>> 1 & 1;
   $172 = HEAP32[20656 + (($155 | $152 | $159 | $163 | $167) + ($165 >>> ($167 >>> 0)) << 2) >> 2] | 0;
   $t_0_i = $172;
   $v_0_i = $172;
   $rsize_0_i = (HEAP32[$172 + 4 >> 2] & -8) - $8 | 0;
   while (1) {
    $179 = HEAP32[$t_0_i + 16 >> 2] | 0;
    if (($179 | 0) == 0) {
     $183 = HEAP32[$t_0_i + 20 >> 2] | 0;
     if (($183 | 0) == 0) {
      break;
     } else {
      $185 = $183;
     }
    } else {
     $185 = $179;
    }
    $189 = (HEAP32[$185 + 4 >> 2] & -8) - $8 | 0;
    $190 = $189 >>> 0 < $rsize_0_i >>> 0;
    $t_0_i = $185;
    $v_0_i = $190 ? $185 : $v_0_i;
    $rsize_0_i = $190 ? $189 : $rsize_0_i;
   }
   $192 = $v_0_i;
   $193 = HEAP32[5092] | 0;
   if ($192 >>> 0 < $193 >>> 0) {
    _abort();
    return 0;
   }
   $196 = $192 + $8 | 0;
   $197 = $196;
   if ($192 >>> 0 >= $196 >>> 0) {
    _abort();
    return 0;
   }
   $201 = HEAP32[$v_0_i + 24 >> 2] | 0;
   $203 = HEAP32[$v_0_i + 12 >> 2] | 0;
   do {
    if (($203 | 0) == ($v_0_i | 0)) {
     $220 = $v_0_i + 20 | 0;
     $221 = HEAP32[$220 >> 2] | 0;
     if (($221 | 0) == 0) {
      $224 = $v_0_i + 16 | 0;
      $225 = HEAP32[$224 >> 2] | 0;
      if (($225 | 0) == 0) {
       $R_1_i = 0;
       break;
      } else {
       $R_0_i = $225;
       $RP_0_i = $224;
      }
     } else {
      $R_0_i = $221;
      $RP_0_i = $220;
     }
     while (1) {
      $227 = $R_0_i + 20 | 0;
      $228 = HEAP32[$227 >> 2] | 0;
      if (($228 | 0) != 0) {
       $R_0_i = $228;
       $RP_0_i = $227;
       continue;
      }
      $231 = $R_0_i + 16 | 0;
      $232 = HEAP32[$231 >> 2] | 0;
      if (($232 | 0) == 0) {
       break;
      } else {
       $R_0_i = $232;
       $RP_0_i = $231;
      }
     }
     if ($RP_0_i >>> 0 < $193 >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$RP_0_i >> 2] = 0;
      $R_1_i = $R_0_i;
      break;
     }
    } else {
     $207 = HEAP32[$v_0_i + 8 >> 2] | 0;
     if ($207 >>> 0 < $193 >>> 0) {
      _abort();
      return 0;
     }
     $211 = $207 + 12 | 0;
     if ((HEAP32[$211 >> 2] | 0) != ($v_0_i | 0)) {
      _abort();
      return 0;
     }
     $215 = $203 + 8 | 0;
     if ((HEAP32[$215 >> 2] | 0) == ($v_0_i | 0)) {
      HEAP32[$211 >> 2] = $203;
      HEAP32[$215 >> 2] = $207;
      $R_1_i = $203;
      break;
     } else {
      _abort();
      return 0;
     }
    }
   } while (0);
   L129 : do {
    if (($201 | 0) != 0) {
     $242 = $v_0_i + 28 | 0;
     $244 = 20656 + (HEAP32[$242 >> 2] << 2) | 0;
     do {
      if (($v_0_i | 0) == (HEAP32[$244 >> 2] | 0)) {
       HEAP32[$244 >> 2] = $R_1_i;
       if (($R_1_i | 0) != 0) {
        break;
       }
       HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$242 >> 2]);
       break L129;
      } else {
       if ($201 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
        return 0;
       }
       $258 = $201 + 16 | 0;
       if ((HEAP32[$258 >> 2] | 0) == ($v_0_i | 0)) {
        HEAP32[$258 >> 2] = $R_1_i;
       } else {
        HEAP32[$201 + 20 >> 2] = $R_1_i;
       }
       if (($R_1_i | 0) == 0) {
        break L129;
       }
      }
     } while (0);
     if ($R_1_i >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
      return 0;
     }
     HEAP32[$R_1_i + 24 >> 2] = $201;
     $274 = HEAP32[$v_0_i + 16 >> 2] | 0;
     do {
      if (($274 | 0) != 0) {
       if ($274 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
        return 0;
       } else {
        HEAP32[$R_1_i + 16 >> 2] = $274;
        HEAP32[$274 + 24 >> 2] = $R_1_i;
        break;
       }
      }
     } while (0);
     $286 = HEAP32[$v_0_i + 20 >> 2] | 0;
     if (($286 | 0) == 0) {
      break;
     }
     if ($286 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$R_1_i + 20 >> 2] = $286;
      HEAP32[$286 + 24 >> 2] = $R_1_i;
      break;
     }
    }
   } while (0);
   if ($rsize_0_i >>> 0 < 16) {
    $300 = $rsize_0_i + $8 | 0;
    HEAP32[$v_0_i + 4 >> 2] = $300 | 3;
    $304 = $192 + ($300 + 4) | 0;
    HEAP32[$304 >> 2] = HEAP32[$304 >> 2] | 1;
   } else {
    HEAP32[$v_0_i + 4 >> 2] = $8 | 3;
    HEAP32[$192 + ($8 | 4) >> 2] = $rsize_0_i | 1;
    HEAP32[$192 + ($rsize_0_i + $8) >> 2] = $rsize_0_i;
    $315 = HEAP32[5090] | 0;
    if (($315 | 0) != 0) {
     $318 = HEAP32[5093] | 0;
     $319 = $315 >>> 3;
     $320 = $319 << 1;
     $322 = 20392 + ($320 << 2) | 0;
     $323 = HEAP32[5088] | 0;
     $324 = 1 << $319;
     do {
      if (($323 & $324 | 0) == 0) {
       HEAP32[5088] = $323 | $324;
       $F1_0_i = $322;
       $_pre_phi_i = 20392 + ($320 + 2 << 2) | 0;
      } else {
       $330 = 20392 + ($320 + 2 << 2) | 0;
       $331 = HEAP32[$330 >> 2] | 0;
       if ($331 >>> 0 >= (HEAP32[5092] | 0) >>> 0) {
        $F1_0_i = $331;
        $_pre_phi_i = $330;
        break;
       }
       _abort();
       return 0;
      }
     } while (0);
     HEAP32[$_pre_phi_i >> 2] = $318;
     HEAP32[$F1_0_i + 12 >> 2] = $318;
     HEAP32[$318 + 8 >> 2] = $F1_0_i;
     HEAP32[$318 + 12 >> 2] = $322;
    }
    HEAP32[5090] = $rsize_0_i;
    HEAP32[5093] = $197;
   }
   $342 = $v_0_i + 8 | 0;
   if (($342 | 0) == 0) {
    $nb_0 = $8;
    break;
   } else {
    $mem_0 = $342;
   }
   return $mem_0 | 0;
  } else {
   if ($bytes >>> 0 > 4294967231) {
    $nb_0 = -1;
    break;
   }
   $348 = $bytes + 11 | 0;
   $349 = $348 & -8;
   $350 = HEAP32[5089] | 0;
   if (($350 | 0) == 0) {
    $nb_0 = $349;
    break;
   }
   $353 = -$349 | 0;
   $354 = $348 >>> 8;
   do {
    if (($354 | 0) == 0) {
     $idx_0_i = 0;
    } else {
     if ($349 >>> 0 > 16777215) {
      $idx_0_i = 31;
      break;
     }
     $361 = ($354 + 1048320 | 0) >>> 16 & 8;
     $362 = $354 << $361;
     $365 = ($362 + 520192 | 0) >>> 16 & 4;
     $367 = $362 << $365;
     $370 = ($367 + 245760 | 0) >>> 16 & 2;
     $375 = 14 - ($365 | $361 | $370) + ($367 << $370 >>> 15) | 0;
     $idx_0_i = $349 >>> (($375 + 7 | 0) >>> 0) & 1 | $375 << 1;
    }
   } while (0);
   $383 = HEAP32[20656 + ($idx_0_i << 2) >> 2] | 0;
   L177 : do {
    if (($383 | 0) == 0) {
     $v_2_i = 0;
     $rsize_2_i = $353;
     $t_1_i = 0;
    } else {
     if (($idx_0_i | 0) == 31) {
      $391 = 0;
     } else {
      $391 = 25 - ($idx_0_i >>> 1) | 0;
     }
     $v_0_i118 = 0;
     $rsize_0_i117 = $353;
     $t_0_i116 = $383;
     $sizebits_0_i = $349 << $391;
     $rst_0_i = 0;
     while (1) {
      $396 = HEAP32[$t_0_i116 + 4 >> 2] & -8;
      $397 = $396 - $349 | 0;
      if ($397 >>> 0 < $rsize_0_i117 >>> 0) {
       if (($396 | 0) == ($349 | 0)) {
        $v_2_i = $t_0_i116;
        $rsize_2_i = $397;
        $t_1_i = $t_0_i116;
        break L177;
       } else {
        $v_1_i = $t_0_i116;
        $rsize_1_i = $397;
       }
      } else {
       $v_1_i = $v_0_i118;
       $rsize_1_i = $rsize_0_i117;
      }
      $403 = HEAP32[$t_0_i116 + 20 >> 2] | 0;
      $406 = HEAP32[$t_0_i116 + 16 + ($sizebits_0_i >>> 31 << 2) >> 2] | 0;
      $rst_1_i = ($403 | 0) == 0 | ($403 | 0) == ($406 | 0) ? $rst_0_i : $403;
      if (($406 | 0) == 0) {
       $v_2_i = $v_1_i;
       $rsize_2_i = $rsize_1_i;
       $t_1_i = $rst_1_i;
       break;
      } else {
       $v_0_i118 = $v_1_i;
       $rsize_0_i117 = $rsize_1_i;
       $t_0_i116 = $406;
       $sizebits_0_i = $sizebits_0_i << 1;
       $rst_0_i = $rst_1_i;
      }
     }
    }
   } while (0);
   if (($t_1_i | 0) == 0 & ($v_2_i | 0) == 0) {
    $414 = 2 << $idx_0_i;
    $417 = $350 & ($414 | -$414);
    if (($417 | 0) == 0) {
     $nb_0 = $349;
     break;
    }
    $422 = ($417 & -$417) - 1 | 0;
    $424 = $422 >>> 12 & 16;
    $425 = $422 >>> ($424 >>> 0);
    $427 = $425 >>> 5 & 8;
    $429 = $425 >>> ($427 >>> 0);
    $431 = $429 >>> 2 & 4;
    $433 = $429 >>> ($431 >>> 0);
    $435 = $433 >>> 1 & 2;
    $437 = $433 >>> ($435 >>> 0);
    $439 = $437 >>> 1 & 1;
    $t_2_ph_i = HEAP32[20656 + (($427 | $424 | $431 | $435 | $439) + ($437 >>> ($439 >>> 0)) << 2) >> 2] | 0;
   } else {
    $t_2_ph_i = $t_1_i;
   }
   if (($t_2_ph_i | 0) == 0) {
    $rsize_3_lcssa_i = $rsize_2_i;
    $v_3_lcssa_i = $v_2_i;
   } else {
    $t_228_i = $t_2_ph_i;
    $rsize_329_i = $rsize_2_i;
    $v_330_i = $v_2_i;
    while (1) {
     $449 = (HEAP32[$t_228_i + 4 >> 2] & -8) - $349 | 0;
     $450 = $449 >>> 0 < $rsize_329_i >>> 0;
     $_rsize_3_i = $450 ? $449 : $rsize_329_i;
     $t_2_v_3_i = $450 ? $t_228_i : $v_330_i;
     $452 = HEAP32[$t_228_i + 16 >> 2] | 0;
     if (($452 | 0) != 0) {
      $t_228_i = $452;
      $rsize_329_i = $_rsize_3_i;
      $v_330_i = $t_2_v_3_i;
      continue;
     }
     $455 = HEAP32[$t_228_i + 20 >> 2] | 0;
     if (($455 | 0) == 0) {
      $rsize_3_lcssa_i = $_rsize_3_i;
      $v_3_lcssa_i = $t_2_v_3_i;
      break;
     } else {
      $t_228_i = $455;
      $rsize_329_i = $_rsize_3_i;
      $v_330_i = $t_2_v_3_i;
     }
    }
   }
   if (($v_3_lcssa_i | 0) == 0) {
    $nb_0 = $349;
    break;
   }
   if ($rsize_3_lcssa_i >>> 0 >= ((HEAP32[5090] | 0) - $349 | 0) >>> 0) {
    $nb_0 = $349;
    break;
   }
   $463 = $v_3_lcssa_i;
   $464 = HEAP32[5092] | 0;
   if ($463 >>> 0 < $464 >>> 0) {
    _abort();
    return 0;
   }
   $467 = $463 + $349 | 0;
   $468 = $467;
   if ($463 >>> 0 >= $467 >>> 0) {
    _abort();
    return 0;
   }
   $472 = HEAP32[$v_3_lcssa_i + 24 >> 2] | 0;
   $474 = HEAP32[$v_3_lcssa_i + 12 >> 2] | 0;
   do {
    if (($474 | 0) == ($v_3_lcssa_i | 0)) {
     $491 = $v_3_lcssa_i + 20 | 0;
     $492 = HEAP32[$491 >> 2] | 0;
     if (($492 | 0) == 0) {
      $495 = $v_3_lcssa_i + 16 | 0;
      $496 = HEAP32[$495 >> 2] | 0;
      if (($496 | 0) == 0) {
       $R_1_i122 = 0;
       break;
      } else {
       $R_0_i120 = $496;
       $RP_0_i119 = $495;
      }
     } else {
      $R_0_i120 = $492;
      $RP_0_i119 = $491;
     }
     while (1) {
      $498 = $R_0_i120 + 20 | 0;
      $499 = HEAP32[$498 >> 2] | 0;
      if (($499 | 0) != 0) {
       $R_0_i120 = $499;
       $RP_0_i119 = $498;
       continue;
      }
      $502 = $R_0_i120 + 16 | 0;
      $503 = HEAP32[$502 >> 2] | 0;
      if (($503 | 0) == 0) {
       break;
      } else {
       $R_0_i120 = $503;
       $RP_0_i119 = $502;
      }
     }
     if ($RP_0_i119 >>> 0 < $464 >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$RP_0_i119 >> 2] = 0;
      $R_1_i122 = $R_0_i120;
      break;
     }
    } else {
     $478 = HEAP32[$v_3_lcssa_i + 8 >> 2] | 0;
     if ($478 >>> 0 < $464 >>> 0) {
      _abort();
      return 0;
     }
     $482 = $478 + 12 | 0;
     if ((HEAP32[$482 >> 2] | 0) != ($v_3_lcssa_i | 0)) {
      _abort();
      return 0;
     }
     $486 = $474 + 8 | 0;
     if ((HEAP32[$486 >> 2] | 0) == ($v_3_lcssa_i | 0)) {
      HEAP32[$482 >> 2] = $474;
      HEAP32[$486 >> 2] = $478;
      $R_1_i122 = $474;
      break;
     } else {
      _abort();
      return 0;
     }
    }
   } while (0);
   L227 : do {
    if (($472 | 0) != 0) {
     $513 = $v_3_lcssa_i + 28 | 0;
     $515 = 20656 + (HEAP32[$513 >> 2] << 2) | 0;
     do {
      if (($v_3_lcssa_i | 0) == (HEAP32[$515 >> 2] | 0)) {
       HEAP32[$515 >> 2] = $R_1_i122;
       if (($R_1_i122 | 0) != 0) {
        break;
       }
       HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$513 >> 2]);
       break L227;
      } else {
       if ($472 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
        return 0;
       }
       $529 = $472 + 16 | 0;
       if ((HEAP32[$529 >> 2] | 0) == ($v_3_lcssa_i | 0)) {
        HEAP32[$529 >> 2] = $R_1_i122;
       } else {
        HEAP32[$472 + 20 >> 2] = $R_1_i122;
       }
       if (($R_1_i122 | 0) == 0) {
        break L227;
       }
      }
     } while (0);
     if ($R_1_i122 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
      return 0;
     }
     HEAP32[$R_1_i122 + 24 >> 2] = $472;
     $545 = HEAP32[$v_3_lcssa_i + 16 >> 2] | 0;
     do {
      if (($545 | 0) != 0) {
       if ($545 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
        return 0;
       } else {
        HEAP32[$R_1_i122 + 16 >> 2] = $545;
        HEAP32[$545 + 24 >> 2] = $R_1_i122;
        break;
       }
      }
     } while (0);
     $557 = HEAP32[$v_3_lcssa_i + 20 >> 2] | 0;
     if (($557 | 0) == 0) {
      break;
     }
     if ($557 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$R_1_i122 + 20 >> 2] = $557;
      HEAP32[$557 + 24 >> 2] = $R_1_i122;
      break;
     }
    }
   } while (0);
   do {
    if ($rsize_3_lcssa_i >>> 0 < 16) {
     $571 = $rsize_3_lcssa_i + $349 | 0;
     HEAP32[$v_3_lcssa_i + 4 >> 2] = $571 | 3;
     $575 = $463 + ($571 + 4) | 0;
     HEAP32[$575 >> 2] = HEAP32[$575 >> 2] | 1;
    } else {
     HEAP32[$v_3_lcssa_i + 4 >> 2] = $349 | 3;
     HEAP32[$463 + ($349 | 4) >> 2] = $rsize_3_lcssa_i | 1;
     HEAP32[$463 + ($rsize_3_lcssa_i + $349) >> 2] = $rsize_3_lcssa_i;
     $586 = $rsize_3_lcssa_i >>> 3;
     if ($rsize_3_lcssa_i >>> 0 < 256) {
      $589 = $586 << 1;
      $591 = 20392 + ($589 << 2) | 0;
      $592 = HEAP32[5088] | 0;
      $593 = 1 << $586;
      do {
       if (($592 & $593 | 0) == 0) {
        HEAP32[5088] = $592 | $593;
        $F5_0_i = $591;
        $_pre_phi_i128 = 20392 + ($589 + 2 << 2) | 0;
       } else {
        $599 = 20392 + ($589 + 2 << 2) | 0;
        $600 = HEAP32[$599 >> 2] | 0;
        if ($600 >>> 0 >= (HEAP32[5092] | 0) >>> 0) {
         $F5_0_i = $600;
         $_pre_phi_i128 = $599;
         break;
        }
        _abort();
        return 0;
       }
      } while (0);
      HEAP32[$_pre_phi_i128 >> 2] = $468;
      HEAP32[$F5_0_i + 12 >> 2] = $468;
      HEAP32[$463 + ($349 + 8) >> 2] = $F5_0_i;
      HEAP32[$463 + ($349 + 12) >> 2] = $591;
      break;
     }
     $612 = $467;
     $613 = $rsize_3_lcssa_i >>> 8;
     do {
      if (($613 | 0) == 0) {
       $I7_0_i = 0;
      } else {
       if ($rsize_3_lcssa_i >>> 0 > 16777215) {
        $I7_0_i = 31;
        break;
       }
       $620 = ($613 + 1048320 | 0) >>> 16 & 8;
       $621 = $613 << $620;
       $624 = ($621 + 520192 | 0) >>> 16 & 4;
       $626 = $621 << $624;
       $629 = ($626 + 245760 | 0) >>> 16 & 2;
       $634 = 14 - ($624 | $620 | $629) + ($626 << $629 >>> 15) | 0;
       $I7_0_i = $rsize_3_lcssa_i >>> (($634 + 7 | 0) >>> 0) & 1 | $634 << 1;
      }
     } while (0);
     $641 = 20656 + ($I7_0_i << 2) | 0;
     HEAP32[$463 + ($349 + 28) >> 2] = $I7_0_i;
     HEAP32[$463 + ($349 + 20) >> 2] = 0;
     HEAP32[$463 + ($349 + 16) >> 2] = 0;
     $648 = HEAP32[5089] | 0;
     $649 = 1 << $I7_0_i;
     if (($648 & $649 | 0) == 0) {
      HEAP32[5089] = $648 | $649;
      HEAP32[$641 >> 2] = $612;
      HEAP32[$463 + ($349 + 24) >> 2] = $641;
      HEAP32[$463 + ($349 + 12) >> 2] = $612;
      HEAP32[$463 + ($349 + 8) >> 2] = $612;
      break;
     }
     if (($I7_0_i | 0) == 31) {
      $668 = 0;
     } else {
      $668 = 25 - ($I7_0_i >>> 1) | 0;
     }
     $K12_0_i = $rsize_3_lcssa_i << $668;
     $T_0_i = HEAP32[$641 >> 2] | 0;
     while (1) {
      if ((HEAP32[$T_0_i + 4 >> 2] & -8 | 0) == ($rsize_3_lcssa_i | 0)) {
       break;
      }
      $677 = $T_0_i + 16 + ($K12_0_i >>> 31 << 2) | 0;
      $678 = HEAP32[$677 >> 2] | 0;
      if (($678 | 0) == 0) {
       label = 190;
       break;
      } else {
       $K12_0_i = $K12_0_i << 1;
       $T_0_i = $678;
      }
     }
     if ((label | 0) == 190) {
      if ($677 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
       _abort();
       return 0;
      } else {
       HEAP32[$677 >> 2] = $612;
       HEAP32[$463 + ($349 + 24) >> 2] = $T_0_i;
       HEAP32[$463 + ($349 + 12) >> 2] = $612;
       HEAP32[$463 + ($349 + 8) >> 2] = $612;
       break;
      }
     }
     $694 = $T_0_i + 8 | 0;
     $695 = HEAP32[$694 >> 2] | 0;
     $697 = HEAP32[5092] | 0;
     if ($T_0_i >>> 0 < $697 >>> 0) {
      _abort();
      return 0;
     }
     if ($695 >>> 0 < $697 >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$695 + 12 >> 2] = $612;
      HEAP32[$694 >> 2] = $612;
      HEAP32[$463 + ($349 + 8) >> 2] = $695;
      HEAP32[$463 + ($349 + 12) >> 2] = $T_0_i;
      HEAP32[$463 + ($349 + 24) >> 2] = 0;
      break;
     }
    }
   } while (0);
   $711 = $v_3_lcssa_i + 8 | 0;
   if (($711 | 0) == 0) {
    $nb_0 = $349;
    break;
   } else {
    $mem_0 = $711;
   }
   return $mem_0 | 0;
  }
 } while (0);
 $714 = HEAP32[5090] | 0;
 if ($nb_0 >>> 0 <= $714 >>> 0) {
  $717 = $714 - $nb_0 | 0;
  $718 = HEAP32[5093] | 0;
  if ($717 >>> 0 > 15) {
   $721 = $718;
   HEAP32[5093] = $721 + $nb_0;
   HEAP32[5090] = $717;
   HEAP32[$721 + ($nb_0 + 4) >> 2] = $717 | 1;
   HEAP32[$721 + $714 >> 2] = $717;
   HEAP32[$718 + 4 >> 2] = $nb_0 | 3;
  } else {
   HEAP32[5090] = 0;
   HEAP32[5093] = 0;
   HEAP32[$718 + 4 >> 2] = $714 | 3;
   $736 = $718 + ($714 + 4) | 0;
   HEAP32[$736 >> 2] = HEAP32[$736 >> 2] | 1;
  }
  $mem_0 = $718 + 8 | 0;
  return $mem_0 | 0;
 }
 $743 = HEAP32[5091] | 0;
 if ($nb_0 >>> 0 < $743 >>> 0) {
  $746 = $743 - $nb_0 | 0;
  HEAP32[5091] = $746;
  $747 = HEAP32[5094] | 0;
  $748 = $747;
  HEAP32[5094] = $748 + $nb_0;
  HEAP32[$748 + ($nb_0 + 4) >> 2] = $746 | 1;
  HEAP32[$747 + 4 >> 2] = $nb_0 | 3;
  $mem_0 = $747 + 8 | 0;
  return $mem_0 | 0;
 }
 do {
  if ((HEAP32[4822] | 0) == 0) {
   $762 = _sysconf(8) | 0;
   if (($762 - 1 & $762 | 0) == 0) {
    HEAP32[4824] = $762;
    HEAP32[4823] = $762;
    HEAP32[4825] = -1;
    HEAP32[4826] = 2097152;
    HEAP32[4827] = 0;
    HEAP32[5199] = 0;
    HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
    return 0;
   }
  }
 } while (0);
 $771 = $nb_0 + 48 | 0;
 $772 = HEAP32[4824] | 0;
 $773 = $nb_0 + 47 | 0;
 $774 = $772 + $773 | 0;
 $775 = -$772 | 0;
 $776 = $774 & $775;
 if ($776 >>> 0 <= $nb_0 >>> 0) {
  $mem_0 = 0;
  return $mem_0 | 0;
 }
 $779 = HEAP32[5198] | 0;
 do {
  if (($779 | 0) != 0) {
   $782 = HEAP32[5196] | 0;
   $783 = $782 + $776 | 0;
   if ($783 >>> 0 <= $782 >>> 0 | $783 >>> 0 > $779 >>> 0) {
    $mem_0 = 0;
   } else {
    break;
   }
   return $mem_0 | 0;
  }
 } while (0);
 L319 : do {
  if ((HEAP32[5199] & 4 | 0) == 0) {
   $791 = HEAP32[5094] | 0;
   L321 : do {
    if (($791 | 0) == 0) {
     label = 220;
    } else {
     $794 = $791;
     $sp_0_i_i = 20800;
     while (1) {
      $796 = $sp_0_i_i | 0;
      $797 = HEAP32[$796 >> 2] | 0;
      if ($797 >>> 0 <= $794 >>> 0) {
       $800 = $sp_0_i_i + 4 | 0;
       if (($797 + (HEAP32[$800 >> 2] | 0) | 0) >>> 0 > $794 >>> 0) {
        break;
       }
      }
      $806 = HEAP32[$sp_0_i_i + 8 >> 2] | 0;
      if (($806 | 0) == 0) {
       label = 220;
       break L321;
      } else {
       $sp_0_i_i = $806;
      }
     }
     if (($sp_0_i_i | 0) == 0) {
      label = 220;
      break;
     }
     $840 = $774 - (HEAP32[5091] | 0) & $775;
     if ($840 >>> 0 >= 2147483647) {
      $tsize_0303639_i = 0;
      break;
     }
     $843 = _sbrk($840 | 0) | 0;
     $847 = ($843 | 0) == ((HEAP32[$796 >> 2] | 0) + (HEAP32[$800 >> 2] | 0) | 0);
     $tbase_0_i = $847 ? $843 : -1;
     $tsize_0_i = $847 ? $840 : 0;
     $br_0_i = $843;
     $ssize_1_i = $840;
     label = 229;
    }
   } while (0);
   do {
    if ((label | 0) == 220) {
     $809 = _sbrk(0) | 0;
     if (($809 | 0) == -1) {
      $tsize_0303639_i = 0;
      break;
     }
     $812 = $809;
     $813 = HEAP32[4823] | 0;
     $814 = $813 - 1 | 0;
     if (($814 & $812 | 0) == 0) {
      $ssize_0_i = $776;
     } else {
      $ssize_0_i = $776 - $812 + ($814 + $812 & -$813) | 0;
     }
     $824 = HEAP32[5196] | 0;
     $825 = $824 + $ssize_0_i | 0;
     if (!($ssize_0_i >>> 0 > $nb_0 >>> 0 & $ssize_0_i >>> 0 < 2147483647)) {
      $tsize_0303639_i = 0;
      break;
     }
     $829 = HEAP32[5198] | 0;
     if (($829 | 0) != 0) {
      if ($825 >>> 0 <= $824 >>> 0 | $825 >>> 0 > $829 >>> 0) {
       $tsize_0303639_i = 0;
       break;
      }
     }
     $835 = _sbrk($ssize_0_i | 0) | 0;
     $836 = ($835 | 0) == ($809 | 0);
     $tbase_0_i = $836 ? $809 : -1;
     $tsize_0_i = $836 ? $ssize_0_i : 0;
     $br_0_i = $835;
     $ssize_1_i = $ssize_0_i;
     label = 229;
    }
   } while (0);
   L341 : do {
    if ((label | 0) == 229) {
     $849 = -$ssize_1_i | 0;
     if (($tbase_0_i | 0) != -1) {
      $tsize_244_i = $tsize_0_i;
      $tbase_245_i = $tbase_0_i;
      label = 240;
      break L319;
     }
     do {
      if (($br_0_i | 0) != -1 & $ssize_1_i >>> 0 < 2147483647 & $ssize_1_i >>> 0 < $771 >>> 0) {
       $856 = HEAP32[4824] | 0;
       $860 = $773 - $ssize_1_i + $856 & -$856;
       if ($860 >>> 0 >= 2147483647) {
        $ssize_2_i = $ssize_1_i;
        break;
       }
       if ((_sbrk($860 | 0) | 0) == -1) {
        _sbrk($849 | 0) | 0;
        $tsize_0303639_i = $tsize_0_i;
        break L341;
       } else {
        $ssize_2_i = $860 + $ssize_1_i | 0;
        break;
       }
      } else {
       $ssize_2_i = $ssize_1_i;
      }
     } while (0);
     if (($br_0_i | 0) == -1) {
      $tsize_0303639_i = $tsize_0_i;
     } else {
      $tsize_244_i = $ssize_2_i;
      $tbase_245_i = $br_0_i;
      label = 240;
      break L319;
     }
    }
   } while (0);
   HEAP32[5199] = HEAP32[5199] | 4;
   $tsize_1_i = $tsize_0303639_i;
   label = 237;
  } else {
   $tsize_1_i = 0;
   label = 237;
  }
 } while (0);
 do {
  if ((label | 0) == 237) {
   if ($776 >>> 0 >= 2147483647) {
    break;
   }
   $876 = _sbrk($776 | 0) | 0;
   $877 = _sbrk(0) | 0;
   if (!(($877 | 0) != -1 & ($876 | 0) != -1 & $876 >>> 0 < $877 >>> 0)) {
    break;
   }
   $881 = $877 - $876 | 0;
   $883 = $881 >>> 0 > ($nb_0 + 40 | 0) >>> 0;
   $_tbase_1_i = $883 ? $876 : -1;
   if (($_tbase_1_i | 0) != -1) {
    $tsize_244_i = $883 ? $881 : $tsize_1_i;
    $tbase_245_i = $_tbase_1_i;
    label = 240;
   }
  }
 } while (0);
 do {
  if ((label | 0) == 240) {
   $886 = (HEAP32[5196] | 0) + $tsize_244_i | 0;
   HEAP32[5196] = $886;
   if ($886 >>> 0 > (HEAP32[5197] | 0) >>> 0) {
    HEAP32[5197] = $886;
   }
   $890 = HEAP32[5094] | 0;
   L361 : do {
    if (($890 | 0) == 0) {
     $893 = HEAP32[5092] | 0;
     if (($893 | 0) == 0 | $tbase_245_i >>> 0 < $893 >>> 0) {
      HEAP32[5092] = $tbase_245_i;
     }
     HEAP32[5200] = $tbase_245_i;
     HEAP32[5201] = $tsize_244_i;
     HEAP32[5203] = 0;
     HEAP32[5097] = HEAP32[4822];
     HEAP32[5096] = -1;
     $i_02_i_i = 0;
     do {
      $899 = $i_02_i_i << 1;
      $901 = 20392 + ($899 << 2) | 0;
      HEAP32[20392 + ($899 + 3 << 2) >> 2] = $901;
      HEAP32[20392 + ($899 + 2 << 2) >> 2] = $901;
      $i_02_i_i = $i_02_i_i + 1 | 0;
     } while ($i_02_i_i >>> 0 < 32);
     $908 = $tbase_245_i + 8 | 0;
     if (($908 & 7 | 0) == 0) {
      $914 = 0;
     } else {
      $914 = -$908 & 7;
     }
     $917 = $tsize_244_i - 40 - $914 | 0;
     HEAP32[5094] = $tbase_245_i + $914;
     HEAP32[5091] = $917;
     HEAP32[$tbase_245_i + ($914 + 4) >> 2] = $917 | 1;
     HEAP32[$tbase_245_i + ($tsize_244_i - 36) >> 2] = 40;
     HEAP32[5095] = HEAP32[4826];
    } else {
     $sp_067_i = 20800;
     while (1) {
      $925 = HEAP32[$sp_067_i >> 2] | 0;
      $926 = $sp_067_i + 4 | 0;
      $927 = HEAP32[$926 >> 2] | 0;
      if (($tbase_245_i | 0) == ($925 + $927 | 0)) {
       label = 252;
       break;
      }
      $932 = HEAP32[$sp_067_i + 8 >> 2] | 0;
      if (($932 | 0) == 0) {
       break;
      } else {
       $sp_067_i = $932;
      }
     }
     do {
      if ((label | 0) == 252) {
       if ((HEAP32[$sp_067_i + 12 >> 2] & 8 | 0) != 0) {
        break;
       }
       $939 = $890;
       if (!($939 >>> 0 >= $925 >>> 0 & $939 >>> 0 < $tbase_245_i >>> 0)) {
        break;
       }
       HEAP32[$926 >> 2] = $927 + $tsize_244_i;
       $944 = HEAP32[5094] | 0;
       $946 = (HEAP32[5091] | 0) + $tsize_244_i | 0;
       $947 = $944;
       $949 = $944 + 8 | 0;
       if (($949 & 7 | 0) == 0) {
        $955 = 0;
       } else {
        $955 = -$949 & 7;
       }
       $958 = $946 - $955 | 0;
       HEAP32[5094] = $947 + $955;
       HEAP32[5091] = $958;
       HEAP32[$947 + ($955 + 4) >> 2] = $958 | 1;
       HEAP32[$947 + ($946 + 4) >> 2] = 40;
       HEAP32[5095] = HEAP32[4826];
       break L361;
      }
     } while (0);
     if ($tbase_245_i >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      HEAP32[5092] = $tbase_245_i;
     }
     $968 = $tbase_245_i + $tsize_244_i | 0;
     $sp_160_i = 20800;
     while (1) {
      $970 = $sp_160_i | 0;
      if ((HEAP32[$970 >> 2] | 0) == ($968 | 0)) {
       label = 262;
       break;
      }
      $975 = HEAP32[$sp_160_i + 8 >> 2] | 0;
      if (($975 | 0) == 0) {
       break;
      } else {
       $sp_160_i = $975;
      }
     }
     do {
      if ((label | 0) == 262) {
       if ((HEAP32[$sp_160_i + 12 >> 2] & 8 | 0) != 0) {
        break;
       }
       HEAP32[$970 >> 2] = $tbase_245_i;
       $982 = $sp_160_i + 4 | 0;
       HEAP32[$982 >> 2] = (HEAP32[$982 >> 2] | 0) + $tsize_244_i;
       $986 = $tbase_245_i + 8 | 0;
       if (($986 & 7 | 0) == 0) {
        $993 = 0;
       } else {
        $993 = -$986 & 7;
       }
       $996 = $tbase_245_i + ($tsize_244_i + 8) | 0;
       if (($996 & 7 | 0) == 0) {
        $1003 = 0;
       } else {
        $1003 = -$996 & 7;
       }
       $1004 = $tbase_245_i + ($1003 + $tsize_244_i) | 0;
       $1005 = $1004;
       $_sum_i21_i = $993 + $nb_0 | 0;
       $1009 = $tbase_245_i + $_sum_i21_i | 0;
       $1010 = $1009;
       $1011 = $1004 - ($tbase_245_i + $993) - $nb_0 | 0;
       HEAP32[$tbase_245_i + ($993 + 4) >> 2] = $nb_0 | 3;
       do {
        if (($1005 | 0) == (HEAP32[5094] | 0)) {
         $1019 = (HEAP32[5091] | 0) + $1011 | 0;
         HEAP32[5091] = $1019;
         HEAP32[5094] = $1010;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 4) >> 2] = $1019 | 1;
        } else {
         if (($1005 | 0) == (HEAP32[5093] | 0)) {
          $1028 = (HEAP32[5090] | 0) + $1011 | 0;
          HEAP32[5090] = $1028;
          HEAP32[5093] = $1010;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 4) >> 2] = $1028 | 1;
          HEAP32[$tbase_245_i + ($1028 + $_sum_i21_i) >> 2] = $1028;
          break;
         }
         $_sum2_i23_i = $tsize_244_i + 4 | 0;
         $1037 = HEAP32[$tbase_245_i + ($_sum2_i23_i + $1003) >> 2] | 0;
         if (($1037 & 3 | 0) == 1) {
          $1041 = $1037 & -8;
          $1042 = $1037 >>> 3;
          L406 : do {
           if ($1037 >>> 0 < 256) {
            $1047 = HEAP32[$tbase_245_i + (($1003 | 8) + $tsize_244_i) >> 2] | 0;
            $1050 = HEAP32[$tbase_245_i + ($tsize_244_i + 12 + $1003) >> 2] | 0;
            $1053 = 20392 + ($1042 << 1 << 2) | 0;
            do {
             if (($1047 | 0) != ($1053 | 0)) {
              if ($1047 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
               _abort();
               return 0;
              }
              if ((HEAP32[$1047 + 12 >> 2] | 0) == ($1005 | 0)) {
               break;
              }
              _abort();
              return 0;
             }
            } while (0);
            if (($1050 | 0) == ($1047 | 0)) {
             HEAP32[5088] = HEAP32[5088] & ~(1 << $1042);
             break;
            }
            do {
             if (($1050 | 0) == ($1053 | 0)) {
              $_pre_phi57_i_i = $1050 + 8 | 0;
             } else {
              if ($1050 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
               _abort();
               return 0;
              }
              $1076 = $1050 + 8 | 0;
              if ((HEAP32[$1076 >> 2] | 0) == ($1005 | 0)) {
               $_pre_phi57_i_i = $1076;
               break;
              }
              _abort();
              return 0;
             }
            } while (0);
            HEAP32[$1047 + 12 >> 2] = $1050;
            HEAP32[$_pre_phi57_i_i >> 2] = $1047;
           } else {
            $1081 = $1004;
            $1084 = HEAP32[$tbase_245_i + (($1003 | 24) + $tsize_244_i) >> 2] | 0;
            $1087 = HEAP32[$tbase_245_i + ($tsize_244_i + 12 + $1003) >> 2] | 0;
            do {
             if (($1087 | 0) == ($1081 | 0)) {
              $_sum67_i_i = $1003 | 16;
              $1107 = $tbase_245_i + ($_sum2_i23_i + $_sum67_i_i) | 0;
              $1108 = HEAP32[$1107 >> 2] | 0;
              if (($1108 | 0) == 0) {
               $1112 = $tbase_245_i + ($_sum67_i_i + $tsize_244_i) | 0;
               $1113 = HEAP32[$1112 >> 2] | 0;
               if (($1113 | 0) == 0) {
                $R_1_i_i = 0;
                break;
               } else {
                $R_0_i_i = $1113;
                $RP_0_i_i = $1112;
               }
              } else {
               $R_0_i_i = $1108;
               $RP_0_i_i = $1107;
              }
              while (1) {
               $1115 = $R_0_i_i + 20 | 0;
               $1116 = HEAP32[$1115 >> 2] | 0;
               if (($1116 | 0) != 0) {
                $R_0_i_i = $1116;
                $RP_0_i_i = $1115;
                continue;
               }
               $1119 = $R_0_i_i + 16 | 0;
               $1120 = HEAP32[$1119 >> 2] | 0;
               if (($1120 | 0) == 0) {
                break;
               } else {
                $R_0_i_i = $1120;
                $RP_0_i_i = $1119;
               }
              }
              if ($RP_0_i_i >>> 0 < (HEAP32[5092] | 0) >>> 0) {
               _abort();
               return 0;
              } else {
               HEAP32[$RP_0_i_i >> 2] = 0;
               $R_1_i_i = $R_0_i_i;
               break;
              }
             } else {
              $1092 = HEAP32[$tbase_245_i + (($1003 | 8) + $tsize_244_i) >> 2] | 0;
              if ($1092 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
               _abort();
               return 0;
              }
              $1097 = $1092 + 12 | 0;
              if ((HEAP32[$1097 >> 2] | 0) != ($1081 | 0)) {
               _abort();
               return 0;
              }
              $1101 = $1087 + 8 | 0;
              if ((HEAP32[$1101 >> 2] | 0) == ($1081 | 0)) {
               HEAP32[$1097 >> 2] = $1087;
               HEAP32[$1101 >> 2] = $1092;
               $R_1_i_i = $1087;
               break;
              } else {
               _abort();
               return 0;
              }
             }
            } while (0);
            if (($1084 | 0) == 0) {
             break;
            }
            $1132 = $tbase_245_i + ($tsize_244_i + 28 + $1003) | 0;
            $1134 = 20656 + (HEAP32[$1132 >> 2] << 2) | 0;
            do {
             if (($1081 | 0) == (HEAP32[$1134 >> 2] | 0)) {
              HEAP32[$1134 >> 2] = $R_1_i_i;
              if (($R_1_i_i | 0) != 0) {
               break;
              }
              HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$1132 >> 2]);
              break L406;
             } else {
              if ($1084 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
               _abort();
               return 0;
              }
              $1148 = $1084 + 16 | 0;
              if ((HEAP32[$1148 >> 2] | 0) == ($1081 | 0)) {
               HEAP32[$1148 >> 2] = $R_1_i_i;
              } else {
               HEAP32[$1084 + 20 >> 2] = $R_1_i_i;
              }
              if (($R_1_i_i | 0) == 0) {
               break L406;
              }
             }
            } while (0);
            if ($R_1_i_i >>> 0 < (HEAP32[5092] | 0) >>> 0) {
             _abort();
             return 0;
            }
            HEAP32[$R_1_i_i + 24 >> 2] = $1084;
            $_sum3233_i_i = $1003 | 16;
            $1165 = HEAP32[$tbase_245_i + ($_sum3233_i_i + $tsize_244_i) >> 2] | 0;
            do {
             if (($1165 | 0) != 0) {
              if ($1165 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
               _abort();
               return 0;
              } else {
               HEAP32[$R_1_i_i + 16 >> 2] = $1165;
               HEAP32[$1165 + 24 >> 2] = $R_1_i_i;
               break;
              }
             }
            } while (0);
            $1178 = HEAP32[$tbase_245_i + ($_sum2_i23_i + $_sum3233_i_i) >> 2] | 0;
            if (($1178 | 0) == 0) {
             break;
            }
            if ($1178 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
             _abort();
             return 0;
            } else {
             HEAP32[$R_1_i_i + 20 >> 2] = $1178;
             HEAP32[$1178 + 24 >> 2] = $R_1_i_i;
             break;
            }
           }
          } while (0);
          $oldfirst_0_i_i = $tbase_245_i + (($1041 | $1003) + $tsize_244_i) | 0;
          $qsize_0_i_i = $1041 + $1011 | 0;
         } else {
          $oldfirst_0_i_i = $1005;
          $qsize_0_i_i = $1011;
         }
         $1194 = $oldfirst_0_i_i + 4 | 0;
         HEAP32[$1194 >> 2] = HEAP32[$1194 >> 2] & -2;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 4) >> 2] = $qsize_0_i_i | 1;
         HEAP32[$tbase_245_i + ($qsize_0_i_i + $_sum_i21_i) >> 2] = $qsize_0_i_i;
         $1202 = $qsize_0_i_i >>> 3;
         if ($qsize_0_i_i >>> 0 < 256) {
          $1205 = $1202 << 1;
          $1207 = 20392 + ($1205 << 2) | 0;
          $1208 = HEAP32[5088] | 0;
          $1209 = 1 << $1202;
          do {
           if (($1208 & $1209 | 0) == 0) {
            HEAP32[5088] = $1208 | $1209;
            $F4_0_i_i = $1207;
            $_pre_phi_i25_i = 20392 + ($1205 + 2 << 2) | 0;
           } else {
            $1215 = 20392 + ($1205 + 2 << 2) | 0;
            $1216 = HEAP32[$1215 >> 2] | 0;
            if ($1216 >>> 0 >= (HEAP32[5092] | 0) >>> 0) {
             $F4_0_i_i = $1216;
             $_pre_phi_i25_i = $1215;
             break;
            }
            _abort();
            return 0;
           }
          } while (0);
          HEAP32[$_pre_phi_i25_i >> 2] = $1010;
          HEAP32[$F4_0_i_i + 12 >> 2] = $1010;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $F4_0_i_i;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $1207;
          break;
         }
         $1228 = $1009;
         $1229 = $qsize_0_i_i >>> 8;
         do {
          if (($1229 | 0) == 0) {
           $I7_0_i_i = 0;
          } else {
           if ($qsize_0_i_i >>> 0 > 16777215) {
            $I7_0_i_i = 31;
            break;
           }
           $1236 = ($1229 + 1048320 | 0) >>> 16 & 8;
           $1237 = $1229 << $1236;
           $1240 = ($1237 + 520192 | 0) >>> 16 & 4;
           $1242 = $1237 << $1240;
           $1245 = ($1242 + 245760 | 0) >>> 16 & 2;
           $1250 = 14 - ($1240 | $1236 | $1245) + ($1242 << $1245 >>> 15) | 0;
           $I7_0_i_i = $qsize_0_i_i >>> (($1250 + 7 | 0) >>> 0) & 1 | $1250 << 1;
          }
         } while (0);
         $1257 = 20656 + ($I7_0_i_i << 2) | 0;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 28) >> 2] = $I7_0_i_i;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 20) >> 2] = 0;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 16) >> 2] = 0;
         $1264 = HEAP32[5089] | 0;
         $1265 = 1 << $I7_0_i_i;
         if (($1264 & $1265 | 0) == 0) {
          HEAP32[5089] = $1264 | $1265;
          HEAP32[$1257 >> 2] = $1228;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 24) >> 2] = $1257;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $1228;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $1228;
          break;
         }
         if (($I7_0_i_i | 0) == 31) {
          $1284 = 0;
         } else {
          $1284 = 25 - ($I7_0_i_i >>> 1) | 0;
         }
         $K8_0_i_i = $qsize_0_i_i << $1284;
         $T_0_i27_i = HEAP32[$1257 >> 2] | 0;
         while (1) {
          if ((HEAP32[$T_0_i27_i + 4 >> 2] & -8 | 0) == ($qsize_0_i_i | 0)) {
           break;
          }
          $1293 = $T_0_i27_i + 16 + ($K8_0_i_i >>> 31 << 2) | 0;
          $1294 = HEAP32[$1293 >> 2] | 0;
          if (($1294 | 0) == 0) {
           label = 335;
           break;
          } else {
           $K8_0_i_i = $K8_0_i_i << 1;
           $T_0_i27_i = $1294;
          }
         }
         if ((label | 0) == 335) {
          if ($1293 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
           _abort();
           return 0;
          } else {
           HEAP32[$1293 >> 2] = $1228;
           HEAP32[$tbase_245_i + ($_sum_i21_i + 24) >> 2] = $T_0_i27_i;
           HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $1228;
           HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $1228;
           break;
          }
         }
         $1310 = $T_0_i27_i + 8 | 0;
         $1311 = HEAP32[$1310 >> 2] | 0;
         $1313 = HEAP32[5092] | 0;
         if ($T_0_i27_i >>> 0 < $1313 >>> 0) {
          _abort();
          return 0;
         }
         if ($1311 >>> 0 < $1313 >>> 0) {
          _abort();
          return 0;
         } else {
          HEAP32[$1311 + 12 >> 2] = $1228;
          HEAP32[$1310 >> 2] = $1228;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $1311;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $T_0_i27_i;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 24) >> 2] = 0;
          break;
         }
        }
       } while (0);
       $mem_0 = $tbase_245_i + ($993 | 8) | 0;
       return $mem_0 | 0;
      }
     } while (0);
     $1327 = $890;
     $sp_0_i_i_i = 20800;
     while (1) {
      $1330 = HEAP32[$sp_0_i_i_i >> 2] | 0;
      if ($1330 >>> 0 <= $1327 >>> 0) {
       $1334 = HEAP32[$sp_0_i_i_i + 4 >> 2] | 0;
       $1335 = $1330 + $1334 | 0;
       if ($1335 >>> 0 > $1327 >>> 0) {
        break;
       }
      }
      $sp_0_i_i_i = HEAP32[$sp_0_i_i_i + 8 >> 2] | 0;
     }
     $1341 = $1330 + ($1334 - 39) | 0;
     if (($1341 & 7 | 0) == 0) {
      $1348 = 0;
     } else {
      $1348 = -$1341 & 7;
     }
     $1349 = $1330 + ($1334 - 47 + $1348) | 0;
     $1353 = $1349 >>> 0 < ($890 + 16 | 0) >>> 0 ? $1327 : $1349;
     $1354 = $1353 + 8 | 0;
     $1358 = $tbase_245_i + 8 | 0;
     if (($1358 & 7 | 0) == 0) {
      $1364 = 0;
     } else {
      $1364 = -$1358 & 7;
     }
     $1367 = $tsize_244_i - 40 - $1364 | 0;
     HEAP32[5094] = $tbase_245_i + $1364;
     HEAP32[5091] = $1367;
     HEAP32[$tbase_245_i + ($1364 + 4) >> 2] = $1367 | 1;
     HEAP32[$tbase_245_i + ($tsize_244_i - 36) >> 2] = 40;
     HEAP32[5095] = HEAP32[4826];
     HEAP32[$1353 + 4 >> 2] = 27;
     HEAP32[$1354 >> 2] = HEAP32[5200];
     HEAP32[$1354 + 4 >> 2] = HEAP32[20804 >> 2];
     HEAP32[$1354 + 8 >> 2] = HEAP32[20808 >> 2];
     HEAP32[$1354 + 12 >> 2] = HEAP32[20812 >> 2];
     HEAP32[5200] = $tbase_245_i;
     HEAP32[5201] = $tsize_244_i;
     HEAP32[5203] = 0;
     HEAP32[5202] = $1354;
     $1377 = $1353 + 28 | 0;
     HEAP32[$1377 >> 2] = 7;
     if (($1353 + 32 | 0) >>> 0 < $1335 >>> 0) {
      $1380 = $1377;
      while (1) {
       $1381 = $1380 + 4 | 0;
       HEAP32[$1381 >> 2] = 7;
       if (($1380 + 8 | 0) >>> 0 < $1335 >>> 0) {
        $1380 = $1381;
       } else {
        break;
       }
      }
     }
     if (($1353 | 0) == ($1327 | 0)) {
      break;
     }
     $1389 = $1353 - $890 | 0;
     $1392 = $1327 + ($1389 + 4) | 0;
     HEAP32[$1392 >> 2] = HEAP32[$1392 >> 2] & -2;
     HEAP32[$890 + 4 >> 2] = $1389 | 1;
     HEAP32[$1327 + $1389 >> 2] = $1389;
     $1398 = $1389 >>> 3;
     if ($1389 >>> 0 < 256) {
      $1401 = $1398 << 1;
      $1403 = 20392 + ($1401 << 2) | 0;
      $1404 = HEAP32[5088] | 0;
      $1405 = 1 << $1398;
      do {
       if (($1404 & $1405 | 0) == 0) {
        HEAP32[5088] = $1404 | $1405;
        $F_0_i_i = $1403;
        $_pre_phi_i_i = 20392 + ($1401 + 2 << 2) | 0;
       } else {
        $1411 = 20392 + ($1401 + 2 << 2) | 0;
        $1412 = HEAP32[$1411 >> 2] | 0;
        if ($1412 >>> 0 >= (HEAP32[5092] | 0) >>> 0) {
         $F_0_i_i = $1412;
         $_pre_phi_i_i = $1411;
         break;
        }
        _abort();
        return 0;
       }
      } while (0);
      HEAP32[$_pre_phi_i_i >> 2] = $890;
      HEAP32[$F_0_i_i + 12 >> 2] = $890;
      HEAP32[$890 + 8 >> 2] = $F_0_i_i;
      HEAP32[$890 + 12 >> 2] = $1403;
      break;
     }
     $1422 = $890;
     $1423 = $1389 >>> 8;
     do {
      if (($1423 | 0) == 0) {
       $I1_0_i_i = 0;
      } else {
       if ($1389 >>> 0 > 16777215) {
        $I1_0_i_i = 31;
        break;
       }
       $1430 = ($1423 + 1048320 | 0) >>> 16 & 8;
       $1431 = $1423 << $1430;
       $1434 = ($1431 + 520192 | 0) >>> 16 & 4;
       $1436 = $1431 << $1434;
       $1439 = ($1436 + 245760 | 0) >>> 16 & 2;
       $1444 = 14 - ($1434 | $1430 | $1439) + ($1436 << $1439 >>> 15) | 0;
       $I1_0_i_i = $1389 >>> (($1444 + 7 | 0) >>> 0) & 1 | $1444 << 1;
      }
     } while (0);
     $1451 = 20656 + ($I1_0_i_i << 2) | 0;
     HEAP32[$890 + 28 >> 2] = $I1_0_i_i;
     HEAP32[$890 + 20 >> 2] = 0;
     HEAP32[$890 + 16 >> 2] = 0;
     $1455 = HEAP32[5089] | 0;
     $1456 = 1 << $I1_0_i_i;
     if (($1455 & $1456 | 0) == 0) {
      HEAP32[5089] = $1455 | $1456;
      HEAP32[$1451 >> 2] = $1422;
      HEAP32[$890 + 24 >> 2] = $1451;
      HEAP32[$890 + 12 >> 2] = $890;
      HEAP32[$890 + 8 >> 2] = $890;
      break;
     }
     if (($I1_0_i_i | 0) == 31) {
      $1471 = 0;
     } else {
      $1471 = 25 - ($I1_0_i_i >>> 1) | 0;
     }
     $K2_0_i_i = $1389 << $1471;
     $T_0_i_i = HEAP32[$1451 >> 2] | 0;
     while (1) {
      if ((HEAP32[$T_0_i_i + 4 >> 2] & -8 | 0) == ($1389 | 0)) {
       break;
      }
      $1480 = $T_0_i_i + 16 + ($K2_0_i_i >>> 31 << 2) | 0;
      $1481 = HEAP32[$1480 >> 2] | 0;
      if (($1481 | 0) == 0) {
       label = 370;
       break;
      } else {
       $K2_0_i_i = $K2_0_i_i << 1;
       $T_0_i_i = $1481;
      }
     }
     if ((label | 0) == 370) {
      if ($1480 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
       _abort();
       return 0;
      } else {
       HEAP32[$1480 >> 2] = $1422;
       HEAP32[$890 + 24 >> 2] = $T_0_i_i;
       HEAP32[$890 + 12 >> 2] = $890;
       HEAP32[$890 + 8 >> 2] = $890;
       break;
      }
     }
     $1494 = $T_0_i_i + 8 | 0;
     $1495 = HEAP32[$1494 >> 2] | 0;
     $1497 = HEAP32[5092] | 0;
     if ($T_0_i_i >>> 0 < $1497 >>> 0) {
      _abort();
      return 0;
     }
     if ($1495 >>> 0 < $1497 >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$1495 + 12 >> 2] = $1422;
      HEAP32[$1494 >> 2] = $1422;
      HEAP32[$890 + 8 >> 2] = $1495;
      HEAP32[$890 + 12 >> 2] = $T_0_i_i;
      HEAP32[$890 + 24 >> 2] = 0;
      break;
     }
    }
   } while (0);
   $1507 = HEAP32[5091] | 0;
   if ($1507 >>> 0 <= $nb_0 >>> 0) {
    break;
   }
   $1510 = $1507 - $nb_0 | 0;
   HEAP32[5091] = $1510;
   $1511 = HEAP32[5094] | 0;
   $1512 = $1511;
   HEAP32[5094] = $1512 + $nb_0;
   HEAP32[$1512 + ($nb_0 + 4) >> 2] = $1510 | 1;
   HEAP32[$1511 + 4 >> 2] = $nb_0 | 3;
   $mem_0 = $1511 + 8 | 0;
   return $mem_0 | 0;
  }
 } while (0);
 HEAP32[(___errno_location() | 0) >> 2] = 12;
 $mem_0 = 0;
 return $mem_0 | 0;
}
function _free($mem) {
 $mem = $mem | 0;
 var $3 = 0, $4 = 0, $5 = 0, $10 = 0, $11 = 0, $14 = 0, $15 = 0, $16 = 0, $21 = 0, $_sum233 = 0, $24 = 0, $25 = 0, $26 = 0, $32 = 0, $37 = 0, $40 = 0, $43 = 0, $64 = 0, $_pre_phi307 = 0, $69 = 0, $72 = 0, $75 = 0, $80 = 0, $84 = 0, $88 = 0, $94 = 0, $95 = 0, $99 = 0, $100 = 0, $RP_0 = 0, $R_0 = 0, $102 = 0, $103 = 0, $106 = 0, $107 = 0, $R_1 = 0, $118 = 0, $120 = 0, $134 = 0, $151 = 0, $164 = 0, $177 = 0, $psize_0 = 0, $p_0 = 0, $189 = 0, $193 = 0, $194 = 0, $204 = 0, $220 = 0, $227 = 0, $228 = 0, $233 = 0, $236 = 0, $239 = 0, $262 = 0, $_pre_phi305 = 0, $267 = 0, $270 = 0, $273 = 0, $278 = 0, $283 = 0, $287 = 0, $293 = 0, $294 = 0, $298 = 0, $299 = 0, $RP9_0 = 0, $R7_0 = 0, $301 = 0, $302 = 0, $305 = 0, $306 = 0, $R7_1 = 0, $318 = 0, $320 = 0, $334 = 0, $351 = 0, $364 = 0, $psize_1 = 0, $390 = 0, $393 = 0, $395 = 0, $396 = 0, $397 = 0, $403 = 0, $404 = 0, $_pre_phi = 0, $F16_0 = 0, $414 = 0, $415 = 0, $422 = 0, $423 = 0, $426 = 0, $428 = 0, $431 = 0, $436 = 0, $I18_0 = 0, $443 = 0, $447 = 0, $448 = 0, $463 = 0, $T_0 = 0, $K19_0 = 0, $472 = 0, $473 = 0, $486 = 0, $487 = 0, $489 = 0, $501 = 0, $sp_0_in_i = 0, $sp_0_i = 0, label = 0;
 if (($mem | 0) == 0) {
  return;
 }
 $3 = $mem - 8 | 0;
 $4 = $3;
 $5 = HEAP32[5092] | 0;
 if ($3 >>> 0 < $5 >>> 0) {
  _abort();
 }
 $10 = HEAP32[$mem - 4 >> 2] | 0;
 $11 = $10 & 3;
 if (($11 | 0) == 1) {
  _abort();
 }
 $14 = $10 & -8;
 $15 = $mem + ($14 - 8) | 0;
 $16 = $15;
 L578 : do {
  if (($10 & 1 | 0) == 0) {
   $21 = HEAP32[$3 >> 2] | 0;
   if (($11 | 0) == 0) {
    return;
   }
   $_sum233 = -8 - $21 | 0;
   $24 = $mem + $_sum233 | 0;
   $25 = $24;
   $26 = $21 + $14 | 0;
   if ($24 >>> 0 < $5 >>> 0) {
    _abort();
   }
   if (($25 | 0) == (HEAP32[5093] | 0)) {
    $177 = $mem + ($14 - 4) | 0;
    if ((HEAP32[$177 >> 2] & 3 | 0) != 3) {
     $p_0 = $25;
     $psize_0 = $26;
     break;
    }
    HEAP32[5090] = $26;
    HEAP32[$177 >> 2] = HEAP32[$177 >> 2] & -2;
    HEAP32[$mem + ($_sum233 + 4) >> 2] = $26 | 1;
    HEAP32[$15 >> 2] = $26;
    return;
   }
   $32 = $21 >>> 3;
   if ($21 >>> 0 < 256) {
    $37 = HEAP32[$mem + ($_sum233 + 8) >> 2] | 0;
    $40 = HEAP32[$mem + ($_sum233 + 12) >> 2] | 0;
    $43 = 20392 + ($32 << 1 << 2) | 0;
    do {
     if (($37 | 0) != ($43 | 0)) {
      if ($37 >>> 0 < $5 >>> 0) {
       _abort();
      }
      if ((HEAP32[$37 + 12 >> 2] | 0) == ($25 | 0)) {
       break;
      }
      _abort();
     }
    } while (0);
    if (($40 | 0) == ($37 | 0)) {
     HEAP32[5088] = HEAP32[5088] & ~(1 << $32);
     $p_0 = $25;
     $psize_0 = $26;
     break;
    }
    do {
     if (($40 | 0) == ($43 | 0)) {
      $_pre_phi307 = $40 + 8 | 0;
     } else {
      if ($40 >>> 0 < $5 >>> 0) {
       _abort();
      }
      $64 = $40 + 8 | 0;
      if ((HEAP32[$64 >> 2] | 0) == ($25 | 0)) {
       $_pre_phi307 = $64;
       break;
      }
      _abort();
     }
    } while (0);
    HEAP32[$37 + 12 >> 2] = $40;
    HEAP32[$_pre_phi307 >> 2] = $37;
    $p_0 = $25;
    $psize_0 = $26;
    break;
   }
   $69 = $24;
   $72 = HEAP32[$mem + ($_sum233 + 24) >> 2] | 0;
   $75 = HEAP32[$mem + ($_sum233 + 12) >> 2] | 0;
   do {
    if (($75 | 0) == ($69 | 0)) {
     $94 = $mem + ($_sum233 + 20) | 0;
     $95 = HEAP32[$94 >> 2] | 0;
     if (($95 | 0) == 0) {
      $99 = $mem + ($_sum233 + 16) | 0;
      $100 = HEAP32[$99 >> 2] | 0;
      if (($100 | 0) == 0) {
       $R_1 = 0;
       break;
      } else {
       $R_0 = $100;
       $RP_0 = $99;
      }
     } else {
      $R_0 = $95;
      $RP_0 = $94;
     }
     while (1) {
      $102 = $R_0 + 20 | 0;
      $103 = HEAP32[$102 >> 2] | 0;
      if (($103 | 0) != 0) {
       $R_0 = $103;
       $RP_0 = $102;
       continue;
      }
      $106 = $R_0 + 16 | 0;
      $107 = HEAP32[$106 >> 2] | 0;
      if (($107 | 0) == 0) {
       break;
      } else {
       $R_0 = $107;
       $RP_0 = $106;
      }
     }
     if ($RP_0 >>> 0 < $5 >>> 0) {
      _abort();
     } else {
      HEAP32[$RP_0 >> 2] = 0;
      $R_1 = $R_0;
      break;
     }
    } else {
     $80 = HEAP32[$mem + ($_sum233 + 8) >> 2] | 0;
     if ($80 >>> 0 < $5 >>> 0) {
      _abort();
     }
     $84 = $80 + 12 | 0;
     if ((HEAP32[$84 >> 2] | 0) != ($69 | 0)) {
      _abort();
     }
     $88 = $75 + 8 | 0;
     if ((HEAP32[$88 >> 2] | 0) == ($69 | 0)) {
      HEAP32[$84 >> 2] = $75;
      HEAP32[$88 >> 2] = $80;
      $R_1 = $75;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   if (($72 | 0) == 0) {
    $p_0 = $25;
    $psize_0 = $26;
    break;
   }
   $118 = $mem + ($_sum233 + 28) | 0;
   $120 = 20656 + (HEAP32[$118 >> 2] << 2) | 0;
   do {
    if (($69 | 0) == (HEAP32[$120 >> 2] | 0)) {
     HEAP32[$120 >> 2] = $R_1;
     if (($R_1 | 0) != 0) {
      break;
     }
     HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$118 >> 2]);
     $p_0 = $25;
     $psize_0 = $26;
     break L578;
    } else {
     if ($72 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     }
     $134 = $72 + 16 | 0;
     if ((HEAP32[$134 >> 2] | 0) == ($69 | 0)) {
      HEAP32[$134 >> 2] = $R_1;
     } else {
      HEAP32[$72 + 20 >> 2] = $R_1;
     }
     if (($R_1 | 0) == 0) {
      $p_0 = $25;
      $psize_0 = $26;
      break L578;
     }
    }
   } while (0);
   if ($R_1 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
    _abort();
   }
   HEAP32[$R_1 + 24 >> 2] = $72;
   $151 = HEAP32[$mem + ($_sum233 + 16) >> 2] | 0;
   do {
    if (($151 | 0) != 0) {
     if ($151 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$R_1 + 16 >> 2] = $151;
      HEAP32[$151 + 24 >> 2] = $R_1;
      break;
     }
    }
   } while (0);
   $164 = HEAP32[$mem + ($_sum233 + 20) >> 2] | 0;
   if (($164 | 0) == 0) {
    $p_0 = $25;
    $psize_0 = $26;
    break;
   }
   if ($164 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
    _abort();
   } else {
    HEAP32[$R_1 + 20 >> 2] = $164;
    HEAP32[$164 + 24 >> 2] = $R_1;
    $p_0 = $25;
    $psize_0 = $26;
    break;
   }
  } else {
   $p_0 = $4;
   $psize_0 = $14;
  }
 } while (0);
 $189 = $p_0;
 if ($189 >>> 0 >= $15 >>> 0) {
  _abort();
 }
 $193 = $mem + ($14 - 4) | 0;
 $194 = HEAP32[$193 >> 2] | 0;
 if (($194 & 1 | 0) == 0) {
  _abort();
 }
 do {
  if (($194 & 2 | 0) == 0) {
   if (($16 | 0) == (HEAP32[5094] | 0)) {
    $204 = (HEAP32[5091] | 0) + $psize_0 | 0;
    HEAP32[5091] = $204;
    HEAP32[5094] = $p_0;
    HEAP32[$p_0 + 4 >> 2] = $204 | 1;
    if (($p_0 | 0) == (HEAP32[5093] | 0)) {
     HEAP32[5093] = 0;
     HEAP32[5090] = 0;
    }
    if ($204 >>> 0 <= (HEAP32[5095] | 0) >>> 0) {
     return;
    }
    _sys_trim(0) | 0;
    return;
   }
   if (($16 | 0) == (HEAP32[5093] | 0)) {
    $220 = (HEAP32[5090] | 0) + $psize_0 | 0;
    HEAP32[5090] = $220;
    HEAP32[5093] = $p_0;
    HEAP32[$p_0 + 4 >> 2] = $220 | 1;
    HEAP32[$189 + $220 >> 2] = $220;
    return;
   }
   $227 = ($194 & -8) + $psize_0 | 0;
   $228 = $194 >>> 3;
   L684 : do {
    if ($194 >>> 0 < 256) {
     $233 = HEAP32[$mem + $14 >> 2] | 0;
     $236 = HEAP32[$mem + ($14 | 4) >> 2] | 0;
     $239 = 20392 + ($228 << 1 << 2) | 0;
     do {
      if (($233 | 0) != ($239 | 0)) {
       if ($233 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       }
       if ((HEAP32[$233 + 12 >> 2] | 0) == ($16 | 0)) {
        break;
       }
       _abort();
      }
     } while (0);
     if (($236 | 0) == ($233 | 0)) {
      HEAP32[5088] = HEAP32[5088] & ~(1 << $228);
      break;
     }
     do {
      if (($236 | 0) == ($239 | 0)) {
       $_pre_phi305 = $236 + 8 | 0;
      } else {
       if ($236 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       }
       $262 = $236 + 8 | 0;
       if ((HEAP32[$262 >> 2] | 0) == ($16 | 0)) {
        $_pre_phi305 = $262;
        break;
       }
       _abort();
      }
     } while (0);
     HEAP32[$233 + 12 >> 2] = $236;
     HEAP32[$_pre_phi305 >> 2] = $233;
    } else {
     $267 = $15;
     $270 = HEAP32[$mem + ($14 + 16) >> 2] | 0;
     $273 = HEAP32[$mem + ($14 | 4) >> 2] | 0;
     do {
      if (($273 | 0) == ($267 | 0)) {
       $293 = $mem + ($14 + 12) | 0;
       $294 = HEAP32[$293 >> 2] | 0;
       if (($294 | 0) == 0) {
        $298 = $mem + ($14 + 8) | 0;
        $299 = HEAP32[$298 >> 2] | 0;
        if (($299 | 0) == 0) {
         $R7_1 = 0;
         break;
        } else {
         $R7_0 = $299;
         $RP9_0 = $298;
        }
       } else {
        $R7_0 = $294;
        $RP9_0 = $293;
       }
       while (1) {
        $301 = $R7_0 + 20 | 0;
        $302 = HEAP32[$301 >> 2] | 0;
        if (($302 | 0) != 0) {
         $R7_0 = $302;
         $RP9_0 = $301;
         continue;
        }
        $305 = $R7_0 + 16 | 0;
        $306 = HEAP32[$305 >> 2] | 0;
        if (($306 | 0) == 0) {
         break;
        } else {
         $R7_0 = $306;
         $RP9_0 = $305;
        }
       }
       if ($RP9_0 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       } else {
        HEAP32[$RP9_0 >> 2] = 0;
        $R7_1 = $R7_0;
        break;
       }
      } else {
       $278 = HEAP32[$mem + $14 >> 2] | 0;
       if ($278 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       }
       $283 = $278 + 12 | 0;
       if ((HEAP32[$283 >> 2] | 0) != ($267 | 0)) {
        _abort();
       }
       $287 = $273 + 8 | 0;
       if ((HEAP32[$287 >> 2] | 0) == ($267 | 0)) {
        HEAP32[$283 >> 2] = $273;
        HEAP32[$287 >> 2] = $278;
        $R7_1 = $273;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     if (($270 | 0) == 0) {
      break;
     }
     $318 = $mem + ($14 + 20) | 0;
     $320 = 20656 + (HEAP32[$318 >> 2] << 2) | 0;
     do {
      if (($267 | 0) == (HEAP32[$320 >> 2] | 0)) {
       HEAP32[$320 >> 2] = $R7_1;
       if (($R7_1 | 0) != 0) {
        break;
       }
       HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$318 >> 2]);
       break L684;
      } else {
       if ($270 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       }
       $334 = $270 + 16 | 0;
       if ((HEAP32[$334 >> 2] | 0) == ($267 | 0)) {
        HEAP32[$334 >> 2] = $R7_1;
       } else {
        HEAP32[$270 + 20 >> 2] = $R7_1;
       }
       if (($R7_1 | 0) == 0) {
        break L684;
       }
      }
     } while (0);
     if ($R7_1 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     }
     HEAP32[$R7_1 + 24 >> 2] = $270;
     $351 = HEAP32[$mem + ($14 + 8) >> 2] | 0;
     do {
      if (($351 | 0) != 0) {
       if ($351 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       } else {
        HEAP32[$R7_1 + 16 >> 2] = $351;
        HEAP32[$351 + 24 >> 2] = $R7_1;
        break;
       }
      }
     } while (0);
     $364 = HEAP32[$mem + ($14 + 12) >> 2] | 0;
     if (($364 | 0) == 0) {
      break;
     }
     if ($364 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$R7_1 + 20 >> 2] = $364;
      HEAP32[$364 + 24 >> 2] = $R7_1;
      break;
     }
    }
   } while (0);
   HEAP32[$p_0 + 4 >> 2] = $227 | 1;
   HEAP32[$189 + $227 >> 2] = $227;
   if (($p_0 | 0) != (HEAP32[5093] | 0)) {
    $psize_1 = $227;
    break;
   }
   HEAP32[5090] = $227;
   return;
  } else {
   HEAP32[$193 >> 2] = $194 & -2;
   HEAP32[$p_0 + 4 >> 2] = $psize_0 | 1;
   HEAP32[$189 + $psize_0 >> 2] = $psize_0;
   $psize_1 = $psize_0;
  }
 } while (0);
 $390 = $psize_1 >>> 3;
 if ($psize_1 >>> 0 < 256) {
  $393 = $390 << 1;
  $395 = 20392 + ($393 << 2) | 0;
  $396 = HEAP32[5088] | 0;
  $397 = 1 << $390;
  do {
   if (($396 & $397 | 0) == 0) {
    HEAP32[5088] = $396 | $397;
    $F16_0 = $395;
    $_pre_phi = 20392 + ($393 + 2 << 2) | 0;
   } else {
    $403 = 20392 + ($393 + 2 << 2) | 0;
    $404 = HEAP32[$403 >> 2] | 0;
    if ($404 >>> 0 >= (HEAP32[5092] | 0) >>> 0) {
     $F16_0 = $404;
     $_pre_phi = $403;
     break;
    }
    _abort();
   }
  } while (0);
  HEAP32[$_pre_phi >> 2] = $p_0;
  HEAP32[$F16_0 + 12 >> 2] = $p_0;
  HEAP32[$p_0 + 8 >> 2] = $F16_0;
  HEAP32[$p_0 + 12 >> 2] = $395;
  return;
 }
 $414 = $p_0;
 $415 = $psize_1 >>> 8;
 do {
  if (($415 | 0) == 0) {
   $I18_0 = 0;
  } else {
   if ($psize_1 >>> 0 > 16777215) {
    $I18_0 = 31;
    break;
   }
   $422 = ($415 + 1048320 | 0) >>> 16 & 8;
   $423 = $415 << $422;
   $426 = ($423 + 520192 | 0) >>> 16 & 4;
   $428 = $423 << $426;
   $431 = ($428 + 245760 | 0) >>> 16 & 2;
   $436 = 14 - ($426 | $422 | $431) + ($428 << $431 >>> 15) | 0;
   $I18_0 = $psize_1 >>> (($436 + 7 | 0) >>> 0) & 1 | $436 << 1;
  }
 } while (0);
 $443 = 20656 + ($I18_0 << 2) | 0;
 HEAP32[$p_0 + 28 >> 2] = $I18_0;
 HEAP32[$p_0 + 20 >> 2] = 0;
 HEAP32[$p_0 + 16 >> 2] = 0;
 $447 = HEAP32[5089] | 0;
 $448 = 1 << $I18_0;
 do {
  if (($447 & $448 | 0) == 0) {
   HEAP32[5089] = $447 | $448;
   HEAP32[$443 >> 2] = $414;
   HEAP32[$p_0 + 24 >> 2] = $443;
   HEAP32[$p_0 + 12 >> 2] = $p_0;
   HEAP32[$p_0 + 8 >> 2] = $p_0;
  } else {
   if (($I18_0 | 0) == 31) {
    $463 = 0;
   } else {
    $463 = 25 - ($I18_0 >>> 1) | 0;
   }
   $K19_0 = $psize_1 << $463;
   $T_0 = HEAP32[$443 >> 2] | 0;
   while (1) {
    if ((HEAP32[$T_0 + 4 >> 2] & -8 | 0) == ($psize_1 | 0)) {
     break;
    }
    $472 = $T_0 + 16 + ($K19_0 >>> 31 << 2) | 0;
    $473 = HEAP32[$472 >> 2] | 0;
    if (($473 | 0) == 0) {
     label = 549;
     break;
    } else {
     $K19_0 = $K19_0 << 1;
     $T_0 = $473;
    }
   }
   if ((label | 0) == 549) {
    if ($472 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
     _abort();
    } else {
     HEAP32[$472 >> 2] = $414;
     HEAP32[$p_0 + 24 >> 2] = $T_0;
     HEAP32[$p_0 + 12 >> 2] = $p_0;
     HEAP32[$p_0 + 8 >> 2] = $p_0;
     break;
    }
   }
   $486 = $T_0 + 8 | 0;
   $487 = HEAP32[$486 >> 2] | 0;
   $489 = HEAP32[5092] | 0;
   if ($T_0 >>> 0 < $489 >>> 0) {
    _abort();
   }
   if ($487 >>> 0 < $489 >>> 0) {
    _abort();
   } else {
    HEAP32[$487 + 12 >> 2] = $414;
    HEAP32[$486 >> 2] = $414;
    HEAP32[$p_0 + 8 >> 2] = $487;
    HEAP32[$p_0 + 12 >> 2] = $T_0;
    HEAP32[$p_0 + 24 >> 2] = 0;
    break;
   }
  }
 } while (0);
 $501 = (HEAP32[5096] | 0) - 1 | 0;
 HEAP32[5096] = $501;
 if (($501 | 0) == 0) {
  $sp_0_in_i = 20808;
 } else {
  return;
 }
 while (1) {
  $sp_0_i = HEAP32[$sp_0_in_i >> 2] | 0;
  if (($sp_0_i | 0) == 0) {
   break;
  } else {
   $sp_0_in_i = $sp_0_i + 8 | 0;
  }
 }
 HEAP32[5096] = -1;
 return;
}
function _calloc($n_elements, $elem_size) {
 $n_elements = $n_elements | 0;
 $elem_size = $elem_size | 0;
 var $3 = 0, $req_0 = 0, $10 = 0;
 do {
  if (($n_elements | 0) == 0) {
   $req_0 = 0;
  } else {
   $3 = Math_imul($elem_size, $n_elements) | 0;
   if (($elem_size | $n_elements) >>> 0 <= 65535) {
    $req_0 = $3;
    break;
   }
   $req_0 = (($3 >>> 0) / ($n_elements >>> 0) | 0 | 0) == ($elem_size | 0) ? $3 : -1;
  }
 } while (0);
 $10 = _malloc($req_0) | 0;
 if (($10 | 0) == 0) {
  return $10 | 0;
 }
 if ((HEAP32[$10 - 4 >> 2] & 3 | 0) == 0) {
  return $10 | 0;
 }
 _memset($10 | 0, 0, $req_0 | 0);
 return $10 | 0;
}
function _realloc($oldmem, $bytes) {
 $oldmem = $oldmem | 0;
 $bytes = $bytes | 0;
 var $14 = 0, $17 = 0, $23 = 0, $28 = 0, $33 = 0, $35 = 0, $mem_0 = 0;
 if (($oldmem | 0) == 0) {
  $mem_0 = _malloc($bytes) | 0;
  return $mem_0 | 0;
 }
 if ($bytes >>> 0 > 4294967231) {
  HEAP32[(___errno_location() | 0) >> 2] = 12;
  $mem_0 = 0;
  return $mem_0 | 0;
 }
 if ($bytes >>> 0 < 11) {
  $14 = 16;
 } else {
  $14 = $bytes + 11 & -8;
 }
 $17 = _try_realloc_chunk($oldmem - 8 | 0, $14) | 0;
 if (($17 | 0) != 0) {
  $mem_0 = $17 + 8 | 0;
  return $mem_0 | 0;
 }
 $23 = _malloc($bytes) | 0;
 if (($23 | 0) == 0) {
  $mem_0 = 0;
  return $mem_0 | 0;
 }
 $28 = HEAP32[$oldmem - 4 >> 2] | 0;
 $33 = ($28 & -8) - (($28 & 3 | 0) == 0 ? 8 : 4) | 0;
 $35 = $33 >>> 0 < $bytes >>> 0 ? $33 : $bytes;
 _memcpy($23 | 0, $oldmem | 0, $35) | 0;
 _free($oldmem);
 $mem_0 = $23;
 return $mem_0 | 0;
}
function _realloc_in_place($oldmem, $bytes) {
 $oldmem = $oldmem | 0;
 $bytes = $bytes | 0;
 var $12 = 0, $14 = 0;
 if (($oldmem | 0) == 0) {
  return 0;
 }
 if ($bytes >>> 0 > 4294967231) {
  HEAP32[(___errno_location() | 0) >> 2] = 12;
  return 0;
 }
 if ($bytes >>> 0 < 11) {
  $12 = 16;
 } else {
  $12 = $bytes + 11 & -8;
 }
 $14 = $oldmem - 8 | 0;
 return ((_try_realloc_chunk($14, $12) | 0) == ($14 | 0) ? $oldmem : 0) | 0;
}
function _memalign($alignment, $bytes) {
 $alignment = $alignment | 0;
 $bytes = $bytes | 0;
 var $_0 = 0;
 if ($alignment >>> 0 < 9) {
  $_0 = _malloc($bytes) | 0;
  return $_0 | 0;
 } else {
  $_0 = _internal_memalign($alignment, $bytes) | 0;
  return $_0 | 0;
 }
 return 0;
}
function _internal_memalign($alignment, $bytes) {
 $alignment = $alignment | 0;
 $bytes = $bytes | 0;
 var $_alignment = 0, $a_0 = 0, $_1 = 0, $17 = 0, $20 = 0, $23 = 0, $24 = 0, $26 = 0, $34 = 0, $35 = 0, $37 = 0, $43 = 0, $44 = 0, $46 = 0, $48 = 0, $49 = 0, $51 = 0, $63 = 0, $69 = 0, $77 = 0, $p_0 = 0, $81 = 0, $82 = 0, $86 = 0, $90 = 0, $91 = 0, $101 = 0, $mem_0 = 0;
 $_alignment = $alignment >>> 0 < 16 ? 16 : $alignment;
 if (($_alignment - 1 & $_alignment | 0) == 0) {
  $_1 = $_alignment;
 } else {
  $a_0 = 16;
  while (1) {
   if ($a_0 >>> 0 < $_alignment >>> 0) {
    $a_0 = $a_0 << 1;
   } else {
    $_1 = $a_0;
    break;
   }
  }
 }
 if ((-64 - $_1 | 0) >>> 0 <= $bytes >>> 0) {
  HEAP32[(___errno_location() | 0) >> 2] = 12;
  $mem_0 = 0;
  return $mem_0 | 0;
 }
 if ($bytes >>> 0 < 11) {
  $17 = 16;
 } else {
  $17 = $bytes + 11 & -8;
 }
 $20 = _malloc($_1 + 12 + $17 | 0) | 0;
 if (($20 | 0) == 0) {
  $mem_0 = 0;
  return $mem_0 | 0;
 }
 $23 = $20 - 8 | 0;
 $24 = $23;
 $26 = $_1 - 1 | 0;
 do {
  if (($20 & $26 | 0) == 0) {
   $p_0 = $24;
  } else {
   $34 = $20 + $26 & -$_1;
   $35 = $34 - 8 | 0;
   $37 = $23;
   if (($35 - $37 | 0) >>> 0 > 15) {
    $43 = $35;
   } else {
    $43 = $34 + ($_1 - 8) | 0;
   }
   $44 = $43;
   $46 = $43 - $37 | 0;
   $48 = $20 - 4 | 0;
   $49 = HEAP32[$48 >> 2] | 0;
   $51 = ($49 & -8) - $46 | 0;
   if (($49 & 3 | 0) == 0) {
    HEAP32[$43 >> 2] = (HEAP32[$23 >> 2] | 0) + $46;
    HEAP32[$43 + 4 >> 2] = $51;
    $p_0 = $44;
    break;
   } else {
    $63 = $43 + 4 | 0;
    HEAP32[$63 >> 2] = $51 | HEAP32[$63 >> 2] & 1 | 2;
    $69 = $43 + ($51 + 4) | 0;
    HEAP32[$69 >> 2] = HEAP32[$69 >> 2] | 1;
    HEAP32[$48 >> 2] = $46 | HEAP32[$48 >> 2] & 1 | 2;
    $77 = $20 + ($46 - 4) | 0;
    HEAP32[$77 >> 2] = HEAP32[$77 >> 2] | 1;
    _dispose_chunk($24, $46);
    $p_0 = $44;
    break;
   }
  }
 } while (0);
 $81 = $p_0 + 4 | 0;
 $82 = HEAP32[$81 >> 2] | 0;
 do {
  if (($82 & 3 | 0) != 0) {
   $86 = $82 & -8;
   if ($86 >>> 0 <= ($17 + 16 | 0) >>> 0) {
    break;
   }
   $90 = $86 - $17 | 0;
   $91 = $p_0;
   HEAP32[$81 >> 2] = $17 | $82 & 1 | 2;
   HEAP32[$91 + ($17 | 4) >> 2] = $90 | 3;
   $101 = $91 + ($86 | 4) | 0;
   HEAP32[$101 >> 2] = HEAP32[$101 >> 2] | 1;
   _dispose_chunk($91 + $17 | 0, $90);
  }
 } while (0);
 $mem_0 = $p_0 + 8 | 0;
 return $mem_0 | 0;
}
function _sys_trim($pad) {
 $pad = $pad | 0;
 var $4 = 0, $15 = 0, $19 = 0, $22 = 0, $28 = 0, $29 = 0, $sp_0_i = 0, $32 = 0, $41 = 0, $_0_i = 0, $48 = 0, $51 = 0, $59 = 0, $60 = 0, $66 = 0, $73 = 0, $75 = 0, $76 = 0, $78 = 0, $85 = 0, $88 = 0, $released_2 = 0;
 do {
  if ((HEAP32[4822] | 0) == 0) {
   $4 = _sysconf(8) | 0;
   if (($4 - 1 & $4 | 0) == 0) {
    HEAP32[4824] = $4;
    HEAP32[4823] = $4;
    HEAP32[4825] = -1;
    HEAP32[4826] = 2097152;
    HEAP32[4827] = 0;
    HEAP32[5199] = 0;
    HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
    return 0;
   }
  }
 } while (0);
 if ($pad >>> 0 >= 4294967232) {
  $released_2 = 0;
  return $released_2 | 0;
 }
 $15 = HEAP32[5094] | 0;
 if (($15 | 0) == 0) {
  $released_2 = 0;
  return $released_2 | 0;
 }
 $19 = HEAP32[5091] | 0;
 do {
  if ($19 >>> 0 > ($pad + 40 | 0) >>> 0) {
   $22 = HEAP32[4824] | 0;
   $28 = Math_imul((((-40 - $pad - 1 + $19 + $22 | 0) >>> 0) / ($22 >>> 0) | 0) - 1 | 0, $22) | 0;
   $29 = $15;
   $sp_0_i = 20800;
   while (1) {
    $32 = HEAP32[$sp_0_i >> 2] | 0;
    if ($32 >>> 0 <= $29 >>> 0) {
     if (($32 + (HEAP32[$sp_0_i + 4 >> 2] | 0) | 0) >>> 0 > $29 >>> 0) {
      $_0_i = $sp_0_i;
      break;
     }
    }
    $41 = HEAP32[$sp_0_i + 8 >> 2] | 0;
    if (($41 | 0) == 0) {
     $_0_i = 0;
     break;
    } else {
     $sp_0_i = $41;
    }
   }
   if ((HEAP32[$_0_i + 12 >> 2] & 8 | 0) != 0) {
    break;
   }
   $48 = _sbrk(0) | 0;
   $51 = $_0_i + 4 | 0;
   if (($48 | 0) != ((HEAP32[$_0_i >> 2] | 0) + (HEAP32[$51 >> 2] | 0) | 0)) {
    break;
   }
   $59 = _sbrk(-($28 >>> 0 > 2147483646 ? -2147483648 - $22 | 0 : $28) | 0) | 0;
   $60 = _sbrk(0) | 0;
   if (!(($59 | 0) != -1 & $60 >>> 0 < $48 >>> 0)) {
    break;
   }
   $66 = $48 - $60 | 0;
   if (($48 | 0) == ($60 | 0)) {
    break;
   }
   HEAP32[$51 >> 2] = (HEAP32[$51 >> 2] | 0) - $66;
   HEAP32[5196] = (HEAP32[5196] | 0) - $66;
   $73 = HEAP32[5094] | 0;
   $75 = (HEAP32[5091] | 0) - $66 | 0;
   $76 = $73;
   $78 = $73 + 8 | 0;
   if (($78 & 7 | 0) == 0) {
    $85 = 0;
   } else {
    $85 = -$78 & 7;
   }
   $88 = $75 - $85 | 0;
   HEAP32[5094] = $76 + $85;
   HEAP32[5091] = $88;
   HEAP32[$76 + ($85 + 4) >> 2] = $88 | 1;
   HEAP32[$76 + ($75 + 4) >> 2] = 40;
   HEAP32[5095] = HEAP32[4826];
   $released_2 = ($48 | 0) != ($60 | 0) | 0;
   return $released_2 | 0;
  }
 } while (0);
 if ((HEAP32[5091] | 0) >>> 0 <= (HEAP32[5095] | 0) >>> 0) {
  $released_2 = 0;
  return $released_2 | 0;
 }
 HEAP32[5095] = -1;
 $released_2 = 0;
 return $released_2 | 0;
}
function _try_realloc_chunk($p, $nb) {
 $p = $p | 0;
 $nb = $nb | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $10 = 0, $15 = 0, $16 = 0, $34 = 0, $52 = 0, $55 = 0, $69 = 0, $72 = 0, $86 = 0, $94 = 0, $storemerge27 = 0, $storemerge = 0, $103 = 0, $106 = 0, $107 = 0, $112 = 0, $115 = 0, $118 = 0, $139 = 0, $_pre_phi = 0, $144 = 0, $147 = 0, $150 = 0, $155 = 0, $159 = 0, $163 = 0, $169 = 0, $170 = 0, $174 = 0, $175 = 0, $RP_0 = 0, $R_0 = 0, $177 = 0, $178 = 0, $181 = 0, $182 = 0, $R_1 = 0, $193 = 0, $195 = 0, $209 = 0, $226 = 0, $239 = 0, $258 = 0, $272 = 0, $newp_0 = 0;
 $1 = $p + 4 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 $3 = $2 & -8;
 $4 = $p;
 $5 = $4 + $3 | 0;
 $6 = $5;
 $7 = HEAP32[5092] | 0;
 if ($4 >>> 0 < $7 >>> 0) {
  _abort();
  return 0;
 }
 $10 = $2 & 3;
 if (!(($10 | 0) != 1 & $4 >>> 0 < $5 >>> 0)) {
  _abort();
  return 0;
 }
 $15 = $4 + ($3 | 4) | 0;
 $16 = HEAP32[$15 >> 2] | 0;
 if (($16 & 1 | 0) == 0) {
  _abort();
  return 0;
 }
 if (($10 | 0) == 0) {
  if ($nb >>> 0 < 256) {
   $newp_0 = 0;
   return $newp_0 | 0;
  }
  do {
   if ($3 >>> 0 >= ($nb + 4 | 0) >>> 0) {
    if (($3 - $nb | 0) >>> 0 > HEAP32[4824] << 1 >>> 0) {
     break;
    } else {
     $newp_0 = $p;
    }
    return $newp_0 | 0;
   }
  } while (0);
  $newp_0 = 0;
  return $newp_0 | 0;
 }
 if ($3 >>> 0 >= $nb >>> 0) {
  $34 = $3 - $nb | 0;
  if ($34 >>> 0 <= 15) {
   $newp_0 = $p;
   return $newp_0 | 0;
  }
  HEAP32[$1 >> 2] = $2 & 1 | $nb | 2;
  HEAP32[$4 + ($nb + 4) >> 2] = $34 | 3;
  HEAP32[$15 >> 2] = HEAP32[$15 >> 2] | 1;
  _dispose_chunk($4 + $nb | 0, $34);
  $newp_0 = $p;
  return $newp_0 | 0;
 }
 if (($6 | 0) == (HEAP32[5094] | 0)) {
  $52 = (HEAP32[5091] | 0) + $3 | 0;
  if ($52 >>> 0 <= $nb >>> 0) {
   $newp_0 = 0;
   return $newp_0 | 0;
  }
  $55 = $52 - $nb | 0;
  HEAP32[$1 >> 2] = $2 & 1 | $nb | 2;
  HEAP32[$4 + ($nb + 4) >> 2] = $55 | 1;
  HEAP32[5094] = $4 + $nb;
  HEAP32[5091] = $55;
  $newp_0 = $p;
  return $newp_0 | 0;
 }
 if (($6 | 0) == (HEAP32[5093] | 0)) {
  $69 = (HEAP32[5090] | 0) + $3 | 0;
  if ($69 >>> 0 < $nb >>> 0) {
   $newp_0 = 0;
   return $newp_0 | 0;
  }
  $72 = $69 - $nb | 0;
  if ($72 >>> 0 > 15) {
   HEAP32[$1 >> 2] = $2 & 1 | $nb | 2;
   HEAP32[$4 + ($nb + 4) >> 2] = $72 | 1;
   HEAP32[$4 + $69 >> 2] = $72;
   $86 = $4 + ($69 + 4) | 0;
   HEAP32[$86 >> 2] = HEAP32[$86 >> 2] & -2;
   $storemerge = $4 + $nb | 0;
   $storemerge27 = $72;
  } else {
   HEAP32[$1 >> 2] = $2 & 1 | $69 | 2;
   $94 = $4 + ($69 + 4) | 0;
   HEAP32[$94 >> 2] = HEAP32[$94 >> 2] | 1;
   $storemerge = 0;
   $storemerge27 = 0;
  }
  HEAP32[5090] = $storemerge27;
  HEAP32[5093] = $storemerge;
  $newp_0 = $p;
  return $newp_0 | 0;
 }
 if (($16 & 2 | 0) != 0) {
  $newp_0 = 0;
  return $newp_0 | 0;
 }
 $103 = ($16 & -8) + $3 | 0;
 if ($103 >>> 0 < $nb >>> 0) {
  $newp_0 = 0;
  return $newp_0 | 0;
 }
 $106 = $103 - $nb | 0;
 $107 = $16 >>> 3;
 L962 : do {
  if ($16 >>> 0 < 256) {
   $112 = HEAP32[$4 + ($3 + 8) >> 2] | 0;
   $115 = HEAP32[$4 + ($3 + 12) >> 2] | 0;
   $118 = 20392 + ($107 << 1 << 2) | 0;
   do {
    if (($112 | 0) != ($118 | 0)) {
     if ($112 >>> 0 < $7 >>> 0) {
      _abort();
      return 0;
     }
     if ((HEAP32[$112 + 12 >> 2] | 0) == ($6 | 0)) {
      break;
     }
     _abort();
     return 0;
    }
   } while (0);
   if (($115 | 0) == ($112 | 0)) {
    HEAP32[5088] = HEAP32[5088] & ~(1 << $107);
    break;
   }
   do {
    if (($115 | 0) == ($118 | 0)) {
     $_pre_phi = $115 + 8 | 0;
    } else {
     if ($115 >>> 0 < $7 >>> 0) {
      _abort();
      return 0;
     }
     $139 = $115 + 8 | 0;
     if ((HEAP32[$139 >> 2] | 0) == ($6 | 0)) {
      $_pre_phi = $139;
      break;
     }
     _abort();
     return 0;
    }
   } while (0);
   HEAP32[$112 + 12 >> 2] = $115;
   HEAP32[$_pre_phi >> 2] = $112;
  } else {
   $144 = $5;
   $147 = HEAP32[$4 + ($3 + 24) >> 2] | 0;
   $150 = HEAP32[$4 + ($3 + 12) >> 2] | 0;
   do {
    if (($150 | 0) == ($144 | 0)) {
     $169 = $4 + ($3 + 20) | 0;
     $170 = HEAP32[$169 >> 2] | 0;
     if (($170 | 0) == 0) {
      $174 = $4 + ($3 + 16) | 0;
      $175 = HEAP32[$174 >> 2] | 0;
      if (($175 | 0) == 0) {
       $R_1 = 0;
       break;
      } else {
       $R_0 = $175;
       $RP_0 = $174;
      }
     } else {
      $R_0 = $170;
      $RP_0 = $169;
     }
     while (1) {
      $177 = $R_0 + 20 | 0;
      $178 = HEAP32[$177 >> 2] | 0;
      if (($178 | 0) != 0) {
       $R_0 = $178;
       $RP_0 = $177;
       continue;
      }
      $181 = $R_0 + 16 | 0;
      $182 = HEAP32[$181 >> 2] | 0;
      if (($182 | 0) == 0) {
       break;
      } else {
       $R_0 = $182;
       $RP_0 = $181;
      }
     }
     if ($RP_0 >>> 0 < $7 >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$RP_0 >> 2] = 0;
      $R_1 = $R_0;
      break;
     }
    } else {
     $155 = HEAP32[$4 + ($3 + 8) >> 2] | 0;
     if ($155 >>> 0 < $7 >>> 0) {
      _abort();
      return 0;
     }
     $159 = $155 + 12 | 0;
     if ((HEAP32[$159 >> 2] | 0) != ($144 | 0)) {
      _abort();
      return 0;
     }
     $163 = $150 + 8 | 0;
     if ((HEAP32[$163 >> 2] | 0) == ($144 | 0)) {
      HEAP32[$159 >> 2] = $150;
      HEAP32[$163 >> 2] = $155;
      $R_1 = $150;
      break;
     } else {
      _abort();
      return 0;
     }
    }
   } while (0);
   if (($147 | 0) == 0) {
    break;
   }
   $193 = $4 + ($3 + 28) | 0;
   $195 = 20656 + (HEAP32[$193 >> 2] << 2) | 0;
   do {
    if (($144 | 0) == (HEAP32[$195 >> 2] | 0)) {
     HEAP32[$195 >> 2] = $R_1;
     if (($R_1 | 0) != 0) {
      break;
     }
     HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$193 >> 2]);
     break L962;
    } else {
     if ($147 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
      return 0;
     }
     $209 = $147 + 16 | 0;
     if ((HEAP32[$209 >> 2] | 0) == ($144 | 0)) {
      HEAP32[$209 >> 2] = $R_1;
     } else {
      HEAP32[$147 + 20 >> 2] = $R_1;
     }
     if (($R_1 | 0) == 0) {
      break L962;
     }
    }
   } while (0);
   if ($R_1 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
    _abort();
    return 0;
   }
   HEAP32[$R_1 + 24 >> 2] = $147;
   $226 = HEAP32[$4 + ($3 + 16) >> 2] | 0;
   do {
    if (($226 | 0) != 0) {
     if ($226 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$R_1 + 16 >> 2] = $226;
      HEAP32[$226 + 24 >> 2] = $R_1;
      break;
     }
    }
   } while (0);
   $239 = HEAP32[$4 + ($3 + 20) >> 2] | 0;
   if (($239 | 0) == 0) {
    break;
   }
   if ($239 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
    _abort();
    return 0;
   } else {
    HEAP32[$R_1 + 20 >> 2] = $239;
    HEAP32[$239 + 24 >> 2] = $R_1;
    break;
   }
  }
 } while (0);
 if ($106 >>> 0 < 16) {
  HEAP32[$1 >> 2] = $103 | HEAP32[$1 >> 2] & 1 | 2;
  $258 = $4 + ($103 | 4) | 0;
  HEAP32[$258 >> 2] = HEAP32[$258 >> 2] | 1;
  $newp_0 = $p;
  return $newp_0 | 0;
 } else {
  HEAP32[$1 >> 2] = HEAP32[$1 >> 2] & 1 | $nb | 2;
  HEAP32[$4 + ($nb + 4) >> 2] = $106 | 3;
  $272 = $4 + ($103 | 4) | 0;
  HEAP32[$272 >> 2] = HEAP32[$272 >> 2] | 1;
  _dispose_chunk($4 + $nb | 0, $106);
  $newp_0 = $p;
  return $newp_0 | 0;
 }
 return 0;
}
function _malloc_footprint() {
 return HEAP32[5196] | 0;
}
function _malloc_max_footprint() {
 return HEAP32[5197] | 0;
}
function _malloc_footprint_limit() {
 var $1 = 0;
 $1 = HEAP32[5198] | 0;
 return (($1 | 0) == 0 ? -1 : $1) | 0;
}
function _malloc_set_footprint_limit($bytes) {
 $bytes = $bytes | 0;
 var $3 = 0, $result_0 = 0;
 if (($bytes | 0) == -1) {
  $result_0 = 0;
 } else {
  $3 = HEAP32[4824] | 0;
  $result_0 = $bytes - 1 + $3 & -$3;
 }
 HEAP32[5198] = $result_0;
 return $result_0 | 0;
}
function _malloc_usable_size($mem) {
 $mem = $mem | 0;
 var $5 = 0, $6 = 0, $_0 = 0;
 do {
  if (($mem | 0) == 0) {
   $_0 = 0;
  } else {
   $5 = HEAP32[$mem - 4 >> 2] | 0;
   $6 = $5 & 3;
   if (($6 | 0) == 1) {
    $_0 = 0;
    break;
   }
   $_0 = ($5 & -8) - (($6 | 0) == 0 ? 8 : 4) | 0;
  }
 } while (0);
 return $_0 | 0;
}
function _posix_memalign($pp, $alignment, $bytes) {
 $pp = $pp | 0;
 $alignment = $alignment | 0;
 $bytes = $bytes | 0;
 var $5 = 0, $mem_0 = 0, $_0 = 0;
 do {
  if (($alignment | 0) == 8) {
   $mem_0 = _malloc($bytes) | 0;
  } else {
   $5 = $alignment >>> 2;
   if (($alignment & 3 | 0) != 0 | ($5 | 0) == 0) {
    $_0 = 22;
    return $_0 | 0;
   }
   if (($5 + 1073741823 & $5 | 0) != 0) {
    $_0 = 22;
    return $_0 | 0;
   }
   if ((-64 - $alignment | 0) >>> 0 < $bytes >>> 0) {
    $_0 = 12;
    return $_0 | 0;
   } else {
    $mem_0 = _internal_memalign($alignment >>> 0 < 16 ? 16 : $alignment, $bytes) | 0;
    break;
   }
  }
 } while (0);
 if (($mem_0 | 0) == 0) {
  $_0 = 12;
  return $_0 | 0;
 }
 HEAP32[$pp >> 2] = $mem_0;
 $_0 = 0;
 return $_0 | 0;
}
function _independent_calloc($n_elements, $elem_size, $chunks) {
 $n_elements = $n_elements | 0;
 $elem_size = $elem_size | 0;
 $chunks = $chunks | 0;
 var $sz = 0, $1 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $sz = sp | 0;
 HEAP32[$sz >> 2] = $elem_size;
 $1 = _ialloc($n_elements, $sz, 3, $chunks) | 0;
 STACKTOP = sp;
 return $1 | 0;
}
function _independent_comalloc($n_elements, $sizes, $chunks) {
 $n_elements = $n_elements | 0;
 $sizes = $sizes | 0;
 $chunks = $chunks | 0;
 return _ialloc($n_elements, $sizes, 0, $chunks) | 0;
}
function _valloc($bytes) {
 $bytes = $bytes | 0;
 var $4 = 0, $13 = 0, $14 = 0;
 if ((HEAP32[4822] | 0) != 0) {
  $13 = HEAP32[4823] | 0;
  $14 = _memalign($13, $bytes) | 0;
  return $14 | 0;
 }
 $4 = _sysconf(8) | 0;
 if (($4 - 1 & $4 | 0) != 0) {
  _abort();
  return 0;
 }
 HEAP32[4824] = $4;
 HEAP32[4823] = $4;
 HEAP32[4825] = -1;
 HEAP32[4826] = 2097152;
 HEAP32[4827] = 0;
 HEAP32[5199] = 0;
 HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
 $13 = HEAP32[4823] | 0;
 $14 = _memalign($13, $bytes) | 0;
 return $14 | 0;
}
function _pvalloc($bytes) {
 $bytes = $bytes | 0;
 var $4 = 0, $13 = 0;
 do {
  if ((HEAP32[4822] | 0) == 0) {
   $4 = _sysconf(8) | 0;
   if (($4 - 1 & $4 | 0) == 0) {
    HEAP32[4824] = $4;
    HEAP32[4823] = $4;
    HEAP32[4825] = -1;
    HEAP32[4826] = 2097152;
    HEAP32[4827] = 0;
    HEAP32[5199] = 0;
    HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
    return 0;
   }
  }
 } while (0);
 $13 = HEAP32[4823] | 0;
 return _memalign($13, $bytes - 1 + $13 & -$13) | 0;
}
function _ialloc($n_elements, $sizes, $opts, $chunks) {
 $n_elements = $n_elements | 0;
 $sizes = $sizes | 0;
 $opts = $opts | 0;
 $chunks = $chunks | 0;
 var $4 = 0, $14 = 0, $21 = 0, $array_size_0 = 0, $marray_0 = 0, $30 = 0, $36 = 0, $i_08 = 0, $contents_size_07 = 0, $39 = 0, $45 = 0, $46 = 0, $47 = 0, $contents_size_1 = 0, $element_size_0 = 0, $51 = 0, $54 = 0, $58 = 0, $remainder_size_0 = 0, $marray_1 = 0, $74 = 0, $i_15_us = 0, $remainder_size_14_us = 0, $p_0_in3_us = 0, $78 = 0, $size_0_us = 0, $84 = 0, $88 = 0, $89 = 0, $i_15 = 0, $remainder_size_14 = 0, $p_0_in3 = 0, $94 = 0, $98 = 0, $99 = 0, $remainder_size_1_lcssa = 0, $p_0_in_lcssa = 0, $_0 = 0;
 do {
  if ((HEAP32[4822] | 0) == 0) {
   $4 = _sysconf(8) | 0;
   if (($4 - 1 & $4 | 0) == 0) {
    HEAP32[4824] = $4;
    HEAP32[4823] = $4;
    HEAP32[4825] = -1;
    HEAP32[4826] = 2097152;
    HEAP32[4827] = 0;
    HEAP32[5199] = 0;
    HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
    return 0;
   }
  }
 } while (0);
 $14 = ($n_elements | 0) == 0;
 do {
  if (($chunks | 0) == 0) {
   if ($14) {
    $_0 = _malloc(0) | 0;
    return $_0 | 0;
   } else {
    $21 = $n_elements << 2;
    if ($21 >>> 0 < 11) {
     $marray_0 = 0;
     $array_size_0 = 16;
     break;
    }
    $marray_0 = 0;
    $array_size_0 = $21 + 11 & -8;
    break;
   }
  } else {
   if ($14) {
    $_0 = $chunks;
   } else {
    $marray_0 = $chunks;
    $array_size_0 = 0;
    break;
   }
   return $_0 | 0;
  }
 } while (0);
 do {
  if (($opts & 1 | 0) == 0) {
   if ($14) {
    $element_size_0 = 0;
    $contents_size_1 = 0;
    break;
   } else {
    $contents_size_07 = 0;
    $i_08 = 0;
   }
   while (1) {
    $39 = HEAP32[$sizes + ($i_08 << 2) >> 2] | 0;
    if ($39 >>> 0 < 11) {
     $45 = 16;
    } else {
     $45 = $39 + 11 & -8;
    }
    $46 = $45 + $contents_size_07 | 0;
    $47 = $i_08 + 1 | 0;
    if (($47 | 0) == ($n_elements | 0)) {
     $element_size_0 = 0;
     $contents_size_1 = $46;
     break;
    } else {
     $contents_size_07 = $46;
     $i_08 = $47;
    }
   }
  } else {
   $30 = HEAP32[$sizes >> 2] | 0;
   if ($30 >>> 0 < 11) {
    $36 = 16;
   } else {
    $36 = $30 + 11 & -8;
   }
   $element_size_0 = $36;
   $contents_size_1 = Math_imul($36, $n_elements) | 0;
  }
 } while (0);
 $51 = _malloc($array_size_0 - 4 + $contents_size_1 | 0) | 0;
 if (($51 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 }
 $54 = $51 - 8 | 0;
 $58 = HEAP32[$51 - 4 >> 2] & -8;
 if (($opts & 2 | 0) != 0) {
  _memset($51 | 0, 0, -4 - $array_size_0 + $58 | 0);
 }
 if (($marray_0 | 0) == 0) {
  HEAP32[$51 + ($contents_size_1 - 4) >> 2] = $58 - $contents_size_1 | 3;
  $marray_1 = $51 + $contents_size_1 | 0;
  $remainder_size_0 = $contents_size_1;
 } else {
  $marray_1 = $marray_0;
  $remainder_size_0 = $58;
 }
 HEAP32[$marray_1 >> 2] = $51;
 $74 = $n_elements - 1 | 0;
 L1122 : do {
  if (($74 | 0) == 0) {
   $p_0_in_lcssa = $54;
   $remainder_size_1_lcssa = $remainder_size_0;
  } else {
   if (($element_size_0 | 0) == 0) {
    $p_0_in3_us = $54;
    $remainder_size_14_us = $remainder_size_0;
    $i_15_us = 0;
   } else {
    $p_0_in3 = $54;
    $remainder_size_14 = $remainder_size_0;
    $i_15 = 0;
    while (1) {
     $94 = $remainder_size_14 - $element_size_0 | 0;
     HEAP32[$p_0_in3 + 4 >> 2] = $element_size_0 | 3;
     $98 = $p_0_in3 + $element_size_0 | 0;
     $99 = $i_15 + 1 | 0;
     HEAP32[$marray_1 + ($99 << 2) >> 2] = $p_0_in3 + ($element_size_0 + 8);
     if (($99 | 0) == ($74 | 0)) {
      $p_0_in_lcssa = $98;
      $remainder_size_1_lcssa = $94;
      break L1122;
     } else {
      $p_0_in3 = $98;
      $remainder_size_14 = $94;
      $i_15 = $99;
     }
    }
   }
   while (1) {
    $78 = HEAP32[$sizes + ($i_15_us << 2) >> 2] | 0;
    if ($78 >>> 0 < 11) {
     $size_0_us = 16;
    } else {
     $size_0_us = $78 + 11 & -8;
    }
    $84 = $remainder_size_14_us - $size_0_us | 0;
    HEAP32[$p_0_in3_us + 4 >> 2] = $size_0_us | 3;
    $88 = $p_0_in3_us + $size_0_us | 0;
    $89 = $i_15_us + 1 | 0;
    HEAP32[$marray_1 + ($89 << 2) >> 2] = $p_0_in3_us + ($size_0_us + 8);
    if (($89 | 0) == ($74 | 0)) {
     $p_0_in_lcssa = $88;
     $remainder_size_1_lcssa = $84;
     break;
    } else {
     $p_0_in3_us = $88;
     $remainder_size_14_us = $84;
     $i_15_us = $89;
    }
   }
  }
 } while (0);
 HEAP32[$p_0_in_lcssa + 4 >> 2] = $remainder_size_1_lcssa | 3;
 $_0 = $marray_1;
 return $_0 | 0;
}
function _bulk_free($array, $nelem) {
 $array = $array | 0;
 $nelem = $nelem | 0;
 var $1 = 0, $a_07_i = 0, $3 = 0, $6 = 0, $7 = 0, $9 = 0, $11 = 0, $15 = 0, $19 = 0, $_sum_i = 0, $31 = 0, $36 = 0, $_pre_phi_i = 0, label = 0;
 $1 = $array + ($nelem << 2) | 0;
 L1135 : do {
  if (($nelem | 0) != 0) {
   $a_07_i = $array;
   L1136 : while (1) {
    $3 = HEAP32[$a_07_i >> 2] | 0;
    L1138 : do {
     if (($3 | 0) == 0) {
      $_pre_phi_i = $a_07_i + 4 | 0;
     } else {
      $6 = $3 - 8 | 0;
      $7 = $6;
      $9 = $3 - 4 | 0;
      $11 = HEAP32[$9 >> 2] & -8;
      HEAP32[$a_07_i >> 2] = 0;
      if ($6 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
       label = 863;
       break L1136;
      }
      $15 = HEAP32[$9 >> 2] | 0;
      if (($15 & 3 | 0) == 1) {
       label = 864;
       break L1136;
      }
      $19 = $a_07_i + 4 | 0;
      $_sum_i = $15 - 8 & -8;
      do {
       if (($19 | 0) != ($1 | 0)) {
        if ((HEAP32[$19 >> 2] | 0) != ($3 + ($_sum_i + 8) | 0)) {
         break;
        }
        $31 = (HEAP32[$3 + ($_sum_i | 4) >> 2] & -8) + $11 | 0;
        HEAP32[$9 >> 2] = $15 & 1 | $31 | 2;
        $36 = $3 + ($31 - 4) | 0;
        HEAP32[$36 >> 2] = HEAP32[$36 >> 2] | 1;
        HEAP32[$19 >> 2] = $3;
        $_pre_phi_i = $19;
        break L1138;
       }
      } while (0);
      _dispose_chunk($7, $11);
      $_pre_phi_i = $19;
     }
    } while (0);
    if (($_pre_phi_i | 0) == ($1 | 0)) {
     break L1135;
    } else {
     $a_07_i = $_pre_phi_i;
    }
   }
   if ((label | 0) == 863) {
    _abort();
    return 0;
   } else if ((label | 0) == 864) {
    _abort();
    return 0;
   }
  }
 } while (0);
 if ((HEAP32[5091] | 0) >>> 0 <= (HEAP32[5095] | 0) >>> 0) {
  return 0;
 }
 _sys_trim(0) | 0;
 return 0;
}
function _malloc_trim($pad) {
 $pad = $pad | 0;
 var $4 = 0, $13 = 0;
 if ((HEAP32[4822] | 0) != 0) {
  $13 = _sys_trim($pad) | 0;
  return $13 | 0;
 }
 $4 = _sysconf(8) | 0;
 if (($4 - 1 & $4 | 0) != 0) {
  _abort();
  return 0;
 }
 HEAP32[4824] = $4;
 HEAP32[4823] = $4;
 HEAP32[4825] = -1;
 HEAP32[4826] = 2097152;
 HEAP32[4827] = 0;
 HEAP32[5199] = 0;
 HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
 $13 = _sys_trim($pad) | 0;
 return $13 | 0;
}
function _mallinfo($agg_result) {
 $agg_result = $agg_result | 0;
 var $4 = 0, $13 = 0, $16 = 0, $17 = 0, $s_011_i = 0, $sum_010_i = 0, $mfree_09_i = 0, $nfree_08_i = 0, $20 = 0, $22 = 0, $28 = 0, $32 = 0, $q_0_in5_i = 0, $sum_14_i = 0, $mfree_13_i = 0, $nfree_12_i = 0, $39 = 0, $42 = 0, $43 = 0, $nfree_2_i = 0, $mfree_2_i = 0, $50 = 0, $sum_1_lcssa_i = 0, $mfree_1_lcssa_i = 0, $nfree_1_lcssa_i = 0, $53 = 0, $56 = 0, $nm_sroa_7_0_i = 0, $nm_sroa_6_0_i = 0, $nm_sroa_4_0_i = 0, $nm_sroa_3_0_i = 0, $nm_sroa_1_0_i = 0, $nm_sroa_0_0_i = 0, $nm_sroa_8_0_i = 0, $60 = 0;
 do {
  if ((HEAP32[4822] | 0) == 0) {
   $4 = _sysconf(8) | 0;
   if (($4 - 1 & $4 | 0) == 0) {
    HEAP32[4824] = $4;
    HEAP32[4823] = $4;
    HEAP32[4825] = -1;
    HEAP32[4826] = 2097152;
    HEAP32[4827] = 0;
    HEAP32[5199] = 0;
    HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
   }
  }
 } while (0);
 $13 = HEAP32[5094] | 0;
 if (($13 | 0) == 0) {
  $nm_sroa_8_0_i = 0;
  $nm_sroa_0_0_i = 0;
  $nm_sroa_1_0_i = 0;
  $nm_sroa_3_0_i = 0;
  $nm_sroa_4_0_i = 0;
  $nm_sroa_6_0_i = 0;
  $nm_sroa_7_0_i = 0;
 } else {
  $16 = HEAP32[5091] | 0;
  $17 = $16 + 40 | 0;
  $nfree_08_i = 1;
  $mfree_09_i = $17;
  $sum_010_i = $17;
  $s_011_i = 20800;
  while (1) {
   $20 = HEAP32[$s_011_i >> 2] | 0;
   $22 = $20 + 8 | 0;
   if (($22 & 7 | 0) == 0) {
    $28 = 0;
   } else {
    $28 = -$22 & 7;
   }
   $32 = $20 + (HEAP32[$s_011_i + 4 >> 2] | 0) | 0;
   $nfree_12_i = $nfree_08_i;
   $mfree_13_i = $mfree_09_i;
   $sum_14_i = $sum_010_i;
   $q_0_in5_i = $20 + $28 | 0;
   while (1) {
    if ($q_0_in5_i >>> 0 >= $32 >>> 0 | ($q_0_in5_i | 0) == ($13 | 0)) {
     $nfree_1_lcssa_i = $nfree_12_i;
     $mfree_1_lcssa_i = $mfree_13_i;
     $sum_1_lcssa_i = $sum_14_i;
     break;
    }
    $39 = HEAP32[$q_0_in5_i + 4 >> 2] | 0;
    if (($39 | 0) == 7) {
     $nfree_1_lcssa_i = $nfree_12_i;
     $mfree_1_lcssa_i = $mfree_13_i;
     $sum_1_lcssa_i = $sum_14_i;
     break;
    }
    $42 = $39 & -8;
    $43 = $42 + $sum_14_i | 0;
    if (($39 & 3 | 0) == 1) {
     $mfree_2_i = $42 + $mfree_13_i | 0;
     $nfree_2_i = $nfree_12_i + 1 | 0;
    } else {
     $mfree_2_i = $mfree_13_i;
     $nfree_2_i = $nfree_12_i;
    }
    $50 = $q_0_in5_i + $42 | 0;
    if ($50 >>> 0 < $20 >>> 0) {
     $nfree_1_lcssa_i = $nfree_2_i;
     $mfree_1_lcssa_i = $mfree_2_i;
     $sum_1_lcssa_i = $43;
     break;
    } else {
     $nfree_12_i = $nfree_2_i;
     $mfree_13_i = $mfree_2_i;
     $sum_14_i = $43;
     $q_0_in5_i = $50;
    }
   }
   $53 = HEAP32[$s_011_i + 8 >> 2] | 0;
   if (($53 | 0) == 0) {
    break;
   } else {
    $nfree_08_i = $nfree_1_lcssa_i;
    $mfree_09_i = $mfree_1_lcssa_i;
    $sum_010_i = $sum_1_lcssa_i;
    $s_011_i = $53;
   }
  }
  $56 = HEAP32[5196] | 0;
  $nm_sroa_8_0_i = $16;
  $nm_sroa_0_0_i = $sum_1_lcssa_i;
  $nm_sroa_1_0_i = $nfree_1_lcssa_i;
  $nm_sroa_3_0_i = $56 - $sum_1_lcssa_i | 0;
  $nm_sroa_4_0_i = HEAP32[5197] | 0;
  $nm_sroa_6_0_i = $56 - $mfree_1_lcssa_i | 0;
  $nm_sroa_7_0_i = $mfree_1_lcssa_i;
 }
 HEAP32[$agg_result >> 2] = $nm_sroa_0_0_i;
 HEAP32[$agg_result + 4 >> 2] = $nm_sroa_1_0_i;
 $60 = $agg_result + 8 | 0;
 HEAP32[$60 >> 2] = 0;
 HEAP32[$60 + 4 >> 2] = 0;
 HEAP32[$agg_result + 16 >> 2] = $nm_sroa_3_0_i;
 HEAP32[$agg_result + 20 >> 2] = $nm_sroa_4_0_i;
 HEAP32[$agg_result + 24 >> 2] = 0;
 HEAP32[$agg_result + 28 >> 2] = $nm_sroa_6_0_i;
 HEAP32[$agg_result + 32 >> 2] = $nm_sroa_7_0_i;
 HEAP32[$agg_result + 36 >> 2] = $nm_sroa_8_0_i;
 return;
}
function _malloc_stats() {
 var $4 = 0, $13 = 0, $16 = 0, $17 = 0, $s_06_i = 0, $used_05_i = 0, $22 = 0, $24 = 0, $30 = 0, $34 = 0, $q_0_in4_i = 0, $used_13_i = 0, $41 = 0, $45 = 0, $used_2_i = 0, $47 = 0, $used_1_lcssa_i = 0, $50 = 0, $maxfp_0_i = 0, $fp_0_i = 0, $used_3_i = 0, sp = 0;
 sp = STACKTOP;
 do {
  if ((HEAP32[4822] | 0) == 0) {
   $4 = _sysconf(8) | 0;
   if (($4 - 1 & $4 | 0) == 0) {
    HEAP32[4824] = $4;
    HEAP32[4823] = $4;
    HEAP32[4825] = -1;
    HEAP32[4826] = 2097152;
    HEAP32[4827] = 0;
    HEAP32[5199] = 0;
    HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
   }
  }
 } while (0);
 $13 = HEAP32[5094] | 0;
 if (($13 | 0) == 0) {
  $used_3_i = 0;
  $fp_0_i = 0;
  $maxfp_0_i = 0;
 } else {
  $16 = HEAP32[5197] | 0;
  $17 = HEAP32[5196] | 0;
  $used_05_i = $17 - 40 - (HEAP32[5091] | 0) | 0;
  $s_06_i = 20800;
  while (1) {
   $22 = HEAP32[$s_06_i >> 2] | 0;
   $24 = $22 + 8 | 0;
   if (($24 & 7 | 0) == 0) {
    $30 = 0;
   } else {
    $30 = -$24 & 7;
   }
   $34 = $22 + (HEAP32[$s_06_i + 4 >> 2] | 0) | 0;
   $used_13_i = $used_05_i;
   $q_0_in4_i = $22 + $30 | 0;
   while (1) {
    if ($q_0_in4_i >>> 0 >= $34 >>> 0 | ($q_0_in4_i | 0) == ($13 | 0)) {
     $used_1_lcssa_i = $used_13_i;
     break;
    }
    $41 = HEAP32[$q_0_in4_i + 4 >> 2] | 0;
    if (($41 | 0) == 7) {
     $used_1_lcssa_i = $used_13_i;
     break;
    }
    $45 = $41 & -8;
    $used_2_i = $used_13_i - (($41 & 3 | 0) == 1 ? $45 : 0) | 0;
    $47 = $q_0_in4_i + $45 | 0;
    if ($47 >>> 0 < $22 >>> 0) {
     $used_1_lcssa_i = $used_2_i;
     break;
    } else {
     $used_13_i = $used_2_i;
     $q_0_in4_i = $47;
    }
   }
   $50 = HEAP32[$s_06_i + 8 >> 2] | 0;
   if (($50 | 0) == 0) {
    $used_3_i = $used_1_lcssa_i;
    $fp_0_i = $17;
    $maxfp_0_i = $16;
    break;
   } else {
    $used_05_i = $used_1_lcssa_i;
    $s_06_i = $50;
   }
  }
 }
 _fprintf(HEAP32[_stderr >> 2] | 0, 1752, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $maxfp_0_i, tempInt) | 0) | 0;
 _fprintf(HEAP32[_stderr >> 2] | 0, 3768, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $fp_0_i, tempInt) | 0) | 0;
 _fprintf(HEAP32[_stderr >> 2] | 0, 2672, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $used_3_i, tempInt) | 0) | 0;
 STACKTOP = sp;
 return;
}
function _mallopt($param_number, $value) {
 $param_number = $param_number | 0;
 $value = $value | 0;
 var $4 = 0, $_0_i = 0;
 do {
  if ((HEAP32[4822] | 0) == 0) {
   $4 = _sysconf(8) | 0;
   if (($4 - 1 & $4 | 0) == 0) {
    HEAP32[4824] = $4;
    HEAP32[4823] = $4;
    HEAP32[4825] = -1;
    HEAP32[4826] = 2097152;
    HEAP32[4827] = 0;
    HEAP32[5199] = 0;
    HEAP32[4822] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
    return 0;
   }
  }
 } while (0);
 if (($param_number | 0) == (-1 | 0)) {
  HEAP32[4826] = $value;
  $_0_i = 1;
  return $_0_i | 0;
 } else if (($param_number | 0) == (-2 | 0)) {
  if ((HEAP32[4823] | 0) >>> 0 > $value >>> 0) {
   $_0_i = 0;
   return $_0_i | 0;
  }
  if (($value - 1 & $value | 0) != 0) {
   $_0_i = 0;
   return $_0_i | 0;
  }
  HEAP32[4824] = $value;
  $_0_i = 1;
  return $_0_i | 0;
 } else if (($param_number | 0) == (-3 | 0)) {
  HEAP32[4825] = $value;
  $_0_i = 1;
  return $_0_i | 0;
 } else {
  $_0_i = 0;
  return $_0_i | 0;
 }
 return 0;
}
function __ZSt15get_new_handlerv() {
 return (tempValue = HEAP32[5344] | 0, HEAP32[5344] = tempValue + 0, tempValue) | 0;
}
function _dispose_chunk($p, $psize) {
 $p = $p | 0;
 $psize = $psize | 0;
 var $1 = 0, $2 = 0, $3 = 0, $5 = 0, $10 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $24 = 0, $29 = 0, $32 = 0, $35 = 0, $56 = 0, $_pre_phi63 = 0, $61 = 0, $64 = 0, $67 = 0, $72 = 0, $76 = 0, $80 = 0, $_sum28 = 0, $86 = 0, $87 = 0, $91 = 0, $92 = 0, $RP_0 = 0, $R_0 = 0, $94 = 0, $95 = 0, $98 = 0, $99 = 0, $R_1 = 0, $110 = 0, $112 = 0, $126 = 0, $_sum31 = 0, $143 = 0, $156 = 0, $169 = 0, $_0277 = 0, $_0 = 0, $181 = 0, $185 = 0, $186 = 0, $194 = 0, $205 = 0, $213 = 0, $214 = 0, $219 = 0, $222 = 0, $225 = 0, $246 = 0, $_pre_phi61 = 0, $251 = 0, $254 = 0, $257 = 0, $262 = 0, $266 = 0, $270 = 0, $276 = 0, $277 = 0, $281 = 0, $282 = 0, $RP9_0 = 0, $R7_0 = 0, $284 = 0, $285 = 0, $288 = 0, $289 = 0, $R7_1 = 0, $300 = 0, $302 = 0, $316 = 0, $333 = 0, $346 = 0, $_1 = 0, $374 = 0, $377 = 0, $379 = 0, $380 = 0, $381 = 0, $387 = 0, $388 = 0, $_pre_phi = 0, $F16_0 = 0, $398 = 0, $399 = 0, $406 = 0, $407 = 0, $410 = 0, $412 = 0, $415 = 0, $420 = 0, $I19_0 = 0, $427 = 0, $431 = 0, $432 = 0, $447 = 0, $T_0 = 0, $K20_0 = 0, $456 = 0, $457 = 0, $470 = 0, $471 = 0, $473 = 0, label = 0;
 $1 = $p;
 $2 = $1 + $psize | 0;
 $3 = $2;
 $5 = HEAP32[$p + 4 >> 2] | 0;
 L1231 : do {
  if (($5 & 1 | 0) == 0) {
   $10 = HEAP32[$p >> 2] | 0;
   if (($5 & 3 | 0) == 0) {
    return;
   }
   $15 = $1 + (-$10 | 0) | 0;
   $16 = $15;
   $17 = $10 + $psize | 0;
   $18 = HEAP32[5092] | 0;
   if ($15 >>> 0 < $18 >>> 0) {
    _abort();
   }
   if (($16 | 0) == (HEAP32[5093] | 0)) {
    $169 = $1 + ($psize + 4) | 0;
    if ((HEAP32[$169 >> 2] & 3 | 0) != 3) {
     $_0 = $16;
     $_0277 = $17;
     break;
    }
    HEAP32[5090] = $17;
    HEAP32[$169 >> 2] = HEAP32[$169 >> 2] & -2;
    HEAP32[$1 + (4 - $10) >> 2] = $17 | 1;
    HEAP32[$2 >> 2] = $17;
    return;
   }
   $24 = $10 >>> 3;
   if ($10 >>> 0 < 256) {
    $29 = HEAP32[$1 + (8 - $10) >> 2] | 0;
    $32 = HEAP32[$1 + (12 - $10) >> 2] | 0;
    $35 = 20392 + ($24 << 1 << 2) | 0;
    do {
     if (($29 | 0) != ($35 | 0)) {
      if ($29 >>> 0 < $18 >>> 0) {
       _abort();
      }
      if ((HEAP32[$29 + 12 >> 2] | 0) == ($16 | 0)) {
       break;
      }
      _abort();
     }
    } while (0);
    if (($32 | 0) == ($29 | 0)) {
     HEAP32[5088] = HEAP32[5088] & ~(1 << $24);
     $_0 = $16;
     $_0277 = $17;
     break;
    }
    do {
     if (($32 | 0) == ($35 | 0)) {
      $_pre_phi63 = $32 + 8 | 0;
     } else {
      if ($32 >>> 0 < $18 >>> 0) {
       _abort();
      }
      $56 = $32 + 8 | 0;
      if ((HEAP32[$56 >> 2] | 0) == ($16 | 0)) {
       $_pre_phi63 = $56;
       break;
      }
      _abort();
     }
    } while (0);
    HEAP32[$29 + 12 >> 2] = $32;
    HEAP32[$_pre_phi63 >> 2] = $29;
    $_0 = $16;
    $_0277 = $17;
    break;
   }
   $61 = $15;
   $64 = HEAP32[$1 + (24 - $10) >> 2] | 0;
   $67 = HEAP32[$1 + (12 - $10) >> 2] | 0;
   do {
    if (($67 | 0) == ($61 | 0)) {
     $_sum28 = 16 - $10 | 0;
     $86 = $1 + ($_sum28 + 4) | 0;
     $87 = HEAP32[$86 >> 2] | 0;
     if (($87 | 0) == 0) {
      $91 = $1 + $_sum28 | 0;
      $92 = HEAP32[$91 >> 2] | 0;
      if (($92 | 0) == 0) {
       $R_1 = 0;
       break;
      } else {
       $R_0 = $92;
       $RP_0 = $91;
      }
     } else {
      $R_0 = $87;
      $RP_0 = $86;
     }
     while (1) {
      $94 = $R_0 + 20 | 0;
      $95 = HEAP32[$94 >> 2] | 0;
      if (($95 | 0) != 0) {
       $R_0 = $95;
       $RP_0 = $94;
       continue;
      }
      $98 = $R_0 + 16 | 0;
      $99 = HEAP32[$98 >> 2] | 0;
      if (($99 | 0) == 0) {
       break;
      } else {
       $R_0 = $99;
       $RP_0 = $98;
      }
     }
     if ($RP_0 >>> 0 < $18 >>> 0) {
      _abort();
     } else {
      HEAP32[$RP_0 >> 2] = 0;
      $R_1 = $R_0;
      break;
     }
    } else {
     $72 = HEAP32[$1 + (8 - $10) >> 2] | 0;
     if ($72 >>> 0 < $18 >>> 0) {
      _abort();
     }
     $76 = $72 + 12 | 0;
     if ((HEAP32[$76 >> 2] | 0) != ($61 | 0)) {
      _abort();
     }
     $80 = $67 + 8 | 0;
     if ((HEAP32[$80 >> 2] | 0) == ($61 | 0)) {
      HEAP32[$76 >> 2] = $67;
      HEAP32[$80 >> 2] = $72;
      $R_1 = $67;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   if (($64 | 0) == 0) {
    $_0 = $16;
    $_0277 = $17;
    break;
   }
   $110 = $1 + (28 - $10) | 0;
   $112 = 20656 + (HEAP32[$110 >> 2] << 2) | 0;
   do {
    if (($61 | 0) == (HEAP32[$112 >> 2] | 0)) {
     HEAP32[$112 >> 2] = $R_1;
     if (($R_1 | 0) != 0) {
      break;
     }
     HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$110 >> 2]);
     $_0 = $16;
     $_0277 = $17;
     break L1231;
    } else {
     if ($64 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     }
     $126 = $64 + 16 | 0;
     if ((HEAP32[$126 >> 2] | 0) == ($61 | 0)) {
      HEAP32[$126 >> 2] = $R_1;
     } else {
      HEAP32[$64 + 20 >> 2] = $R_1;
     }
     if (($R_1 | 0) == 0) {
      $_0 = $16;
      $_0277 = $17;
      break L1231;
     }
    }
   } while (0);
   if ($R_1 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
    _abort();
   }
   HEAP32[$R_1 + 24 >> 2] = $64;
   $_sum31 = 16 - $10 | 0;
   $143 = HEAP32[$1 + $_sum31 >> 2] | 0;
   do {
    if (($143 | 0) != 0) {
     if ($143 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$R_1 + 16 >> 2] = $143;
      HEAP32[$143 + 24 >> 2] = $R_1;
      break;
     }
    }
   } while (0);
   $156 = HEAP32[$1 + ($_sum31 + 4) >> 2] | 0;
   if (($156 | 0) == 0) {
    $_0 = $16;
    $_0277 = $17;
    break;
   }
   if ($156 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
    _abort();
   } else {
    HEAP32[$R_1 + 20 >> 2] = $156;
    HEAP32[$156 + 24 >> 2] = $R_1;
    $_0 = $16;
    $_0277 = $17;
    break;
   }
  } else {
   $_0 = $p;
   $_0277 = $psize;
  }
 } while (0);
 $181 = HEAP32[5092] | 0;
 if ($2 >>> 0 < $181 >>> 0) {
  _abort();
 }
 $185 = $1 + ($psize + 4) | 0;
 $186 = HEAP32[$185 >> 2] | 0;
 do {
  if (($186 & 2 | 0) == 0) {
   if (($3 | 0) == (HEAP32[5094] | 0)) {
    $194 = (HEAP32[5091] | 0) + $_0277 | 0;
    HEAP32[5091] = $194;
    HEAP32[5094] = $_0;
    HEAP32[$_0 + 4 >> 2] = $194 | 1;
    if (($_0 | 0) != (HEAP32[5093] | 0)) {
     return;
    }
    HEAP32[5093] = 0;
    HEAP32[5090] = 0;
    return;
   }
   if (($3 | 0) == (HEAP32[5093] | 0)) {
    $205 = (HEAP32[5090] | 0) + $_0277 | 0;
    HEAP32[5090] = $205;
    HEAP32[5093] = $_0;
    HEAP32[$_0 + 4 >> 2] = $205 | 1;
    HEAP32[$_0 + $205 >> 2] = $205;
    return;
   }
   $213 = ($186 & -8) + $_0277 | 0;
   $214 = $186 >>> 3;
   L1330 : do {
    if ($186 >>> 0 < 256) {
     $219 = HEAP32[$1 + ($psize + 8) >> 2] | 0;
     $222 = HEAP32[$1 + ($psize + 12) >> 2] | 0;
     $225 = 20392 + ($214 << 1 << 2) | 0;
     do {
      if (($219 | 0) != ($225 | 0)) {
       if ($219 >>> 0 < $181 >>> 0) {
        _abort();
       }
       if ((HEAP32[$219 + 12 >> 2] | 0) == ($3 | 0)) {
        break;
       }
       _abort();
      }
     } while (0);
     if (($222 | 0) == ($219 | 0)) {
      HEAP32[5088] = HEAP32[5088] & ~(1 << $214);
      break;
     }
     do {
      if (($222 | 0) == ($225 | 0)) {
       $_pre_phi61 = $222 + 8 | 0;
      } else {
       if ($222 >>> 0 < $181 >>> 0) {
        _abort();
       }
       $246 = $222 + 8 | 0;
       if ((HEAP32[$246 >> 2] | 0) == ($3 | 0)) {
        $_pre_phi61 = $246;
        break;
       }
       _abort();
      }
     } while (0);
     HEAP32[$219 + 12 >> 2] = $222;
     HEAP32[$_pre_phi61 >> 2] = $219;
    } else {
     $251 = $2;
     $254 = HEAP32[$1 + ($psize + 24) >> 2] | 0;
     $257 = HEAP32[$1 + ($psize + 12) >> 2] | 0;
     do {
      if (($257 | 0) == ($251 | 0)) {
       $276 = $1 + ($psize + 20) | 0;
       $277 = HEAP32[$276 >> 2] | 0;
       if (($277 | 0) == 0) {
        $281 = $1 + ($psize + 16) | 0;
        $282 = HEAP32[$281 >> 2] | 0;
        if (($282 | 0) == 0) {
         $R7_1 = 0;
         break;
        } else {
         $R7_0 = $282;
         $RP9_0 = $281;
        }
       } else {
        $R7_0 = $277;
        $RP9_0 = $276;
       }
       while (1) {
        $284 = $R7_0 + 20 | 0;
        $285 = HEAP32[$284 >> 2] | 0;
        if (($285 | 0) != 0) {
         $R7_0 = $285;
         $RP9_0 = $284;
         continue;
        }
        $288 = $R7_0 + 16 | 0;
        $289 = HEAP32[$288 >> 2] | 0;
        if (($289 | 0) == 0) {
         break;
        } else {
         $R7_0 = $289;
         $RP9_0 = $288;
        }
       }
       if ($RP9_0 >>> 0 < $181 >>> 0) {
        _abort();
       } else {
        HEAP32[$RP9_0 >> 2] = 0;
        $R7_1 = $R7_0;
        break;
       }
      } else {
       $262 = HEAP32[$1 + ($psize + 8) >> 2] | 0;
       if ($262 >>> 0 < $181 >>> 0) {
        _abort();
       }
       $266 = $262 + 12 | 0;
       if ((HEAP32[$266 >> 2] | 0) != ($251 | 0)) {
        _abort();
       }
       $270 = $257 + 8 | 0;
       if ((HEAP32[$270 >> 2] | 0) == ($251 | 0)) {
        HEAP32[$266 >> 2] = $257;
        HEAP32[$270 >> 2] = $262;
        $R7_1 = $257;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     if (($254 | 0) == 0) {
      break;
     }
     $300 = $1 + ($psize + 28) | 0;
     $302 = 20656 + (HEAP32[$300 >> 2] << 2) | 0;
     do {
      if (($251 | 0) == (HEAP32[$302 >> 2] | 0)) {
       HEAP32[$302 >> 2] = $R7_1;
       if (($R7_1 | 0) != 0) {
        break;
       }
       HEAP32[5089] = HEAP32[5089] & ~(1 << HEAP32[$300 >> 2]);
       break L1330;
      } else {
       if ($254 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       }
       $316 = $254 + 16 | 0;
       if ((HEAP32[$316 >> 2] | 0) == ($251 | 0)) {
        HEAP32[$316 >> 2] = $R7_1;
       } else {
        HEAP32[$254 + 20 >> 2] = $R7_1;
       }
       if (($R7_1 | 0) == 0) {
        break L1330;
       }
      }
     } while (0);
     if ($R7_1 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     }
     HEAP32[$R7_1 + 24 >> 2] = $254;
     $333 = HEAP32[$1 + ($psize + 16) >> 2] | 0;
     do {
      if (($333 | 0) != 0) {
       if ($333 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
        _abort();
       } else {
        HEAP32[$R7_1 + 16 >> 2] = $333;
        HEAP32[$333 + 24 >> 2] = $R7_1;
        break;
       }
      }
     } while (0);
     $346 = HEAP32[$1 + ($psize + 20) >> 2] | 0;
     if (($346 | 0) == 0) {
      break;
     }
     if ($346 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$R7_1 + 20 >> 2] = $346;
      HEAP32[$346 + 24 >> 2] = $R7_1;
      break;
     }
    }
   } while (0);
   HEAP32[$_0 + 4 >> 2] = $213 | 1;
   HEAP32[$_0 + $213 >> 2] = $213;
   if (($_0 | 0) != (HEAP32[5093] | 0)) {
    $_1 = $213;
    break;
   }
   HEAP32[5090] = $213;
   return;
  } else {
   HEAP32[$185 >> 2] = $186 & -2;
   HEAP32[$_0 + 4 >> 2] = $_0277 | 1;
   HEAP32[$_0 + $_0277 >> 2] = $_0277;
   $_1 = $_0277;
  }
 } while (0);
 $374 = $_1 >>> 3;
 if ($_1 >>> 0 < 256) {
  $377 = $374 << 1;
  $379 = 20392 + ($377 << 2) | 0;
  $380 = HEAP32[5088] | 0;
  $381 = 1 << $374;
  do {
   if (($380 & $381 | 0) == 0) {
    HEAP32[5088] = $380 | $381;
    $F16_0 = $379;
    $_pre_phi = 20392 + ($377 + 2 << 2) | 0;
   } else {
    $387 = 20392 + ($377 + 2 << 2) | 0;
    $388 = HEAP32[$387 >> 2] | 0;
    if ($388 >>> 0 >= (HEAP32[5092] | 0) >>> 0) {
     $F16_0 = $388;
     $_pre_phi = $387;
     break;
    }
    _abort();
   }
  } while (0);
  HEAP32[$_pre_phi >> 2] = $_0;
  HEAP32[$F16_0 + 12 >> 2] = $_0;
  HEAP32[$_0 + 8 >> 2] = $F16_0;
  HEAP32[$_0 + 12 >> 2] = $379;
  return;
 }
 $398 = $_0;
 $399 = $_1 >>> 8;
 do {
  if (($399 | 0) == 0) {
   $I19_0 = 0;
  } else {
   if ($_1 >>> 0 > 16777215) {
    $I19_0 = 31;
    break;
   }
   $406 = ($399 + 1048320 | 0) >>> 16 & 8;
   $407 = $399 << $406;
   $410 = ($407 + 520192 | 0) >>> 16 & 4;
   $412 = $407 << $410;
   $415 = ($412 + 245760 | 0) >>> 16 & 2;
   $420 = 14 - ($410 | $406 | $415) + ($412 << $415 >>> 15) | 0;
   $I19_0 = $_1 >>> (($420 + 7 | 0) >>> 0) & 1 | $420 << 1;
  }
 } while (0);
 $427 = 20656 + ($I19_0 << 2) | 0;
 HEAP32[$_0 + 28 >> 2] = $I19_0;
 HEAP32[$_0 + 20 >> 2] = 0;
 HEAP32[$_0 + 16 >> 2] = 0;
 $431 = HEAP32[5089] | 0;
 $432 = 1 << $I19_0;
 if (($431 & $432 | 0) == 0) {
  HEAP32[5089] = $431 | $432;
  HEAP32[$427 >> 2] = $398;
  HEAP32[$_0 + 24 >> 2] = $427;
  HEAP32[$_0 + 12 >> 2] = $_0;
  HEAP32[$_0 + 8 >> 2] = $_0;
  return;
 }
 if (($I19_0 | 0) == 31) {
  $447 = 0;
 } else {
  $447 = 25 - ($I19_0 >>> 1) | 0;
 }
 $K20_0 = $_1 << $447;
 $T_0 = HEAP32[$427 >> 2] | 0;
 while (1) {
  if ((HEAP32[$T_0 + 4 >> 2] & -8 | 0) == ($_1 | 0)) {
   break;
  }
  $456 = $T_0 + 16 + ($K20_0 >>> 31 << 2) | 0;
  $457 = HEAP32[$456 >> 2] | 0;
  if (($457 | 0) == 0) {
   label = 1048;
   break;
  } else {
   $K20_0 = $K20_0 << 1;
   $T_0 = $457;
  }
 }
 if ((label | 0) == 1048) {
  if ($456 >>> 0 < (HEAP32[5092] | 0) >>> 0) {
   _abort();
  }
  HEAP32[$456 >> 2] = $398;
  HEAP32[$_0 + 24 >> 2] = $T_0;
  HEAP32[$_0 + 12 >> 2] = $_0;
  HEAP32[$_0 + 8 >> 2] = $_0;
  return;
 }
 $470 = $T_0 + 8 | 0;
 $471 = HEAP32[$470 >> 2] | 0;
 $473 = HEAP32[5092] | 0;
 if ($T_0 >>> 0 < $473 >>> 0) {
  _abort();
 }
 if ($471 >>> 0 < $473 >>> 0) {
  _abort();
 }
 HEAP32[$471 + 12 >> 2] = $398;
 HEAP32[$470 >> 2] = $398;
 HEAP32[$_0 + 8 >> 2] = $471;
 HEAP32[$_0 + 12 >> 2] = $T_0;
 HEAP32[$_0 + 24 >> 2] = 0;
 return;
}
function __Znwj($size) {
 $size = $size | 0;
 var $_size = 0, $3 = 0, $6 = 0, $16 = 0, label = 0;
 $_size = ($size | 0) == 0 ? 1 : $size;
 while (1) {
  $3 = _malloc($_size) | 0;
  if (($3 | 0) != 0) {
   label = 1092;
   break;
  }
  $6 = (tempValue = HEAP32[5344] | 0, HEAP32[5344] = tempValue + 0, tempValue);
  if (($6 | 0) == 0) {
   break;
  }
  FUNCTION_TABLE_v[$6 & 3]();
 }
 if ((label | 0) == 1092) {
  return $3 | 0;
 }
 $16 = ___cxa_allocate_exception(4) | 0;
 HEAP32[$16 >> 2] = 8048;
 ___cxa_throw($16 | 0, 9944, 38);
 return 0;
}
function __ZnwjRKSt9nothrow_t($size, $0) {
 $size = $size | 0;
 $0 = $0 | 0;
 return __Znwj($size) | 0;
}
function __ZNSt9bad_allocD2Ev($this) {
 $this = $this | 0;
 return;
}
function __ZNKSt9bad_alloc4whatEv($this) {
 $this = $this | 0;
 return 1784 | 0;
}
function __ZNKSt20bad_array_new_length4whatEv($this) {
 $this = $this | 0;
 return 3616 | 0;
}
function __ZSt15set_new_handlerPFvvE($handler) {
 $handler = $handler | 0;
 return (tempValue = HEAP32[5344] | 0, HEAP32[5344] = $handler, tempValue) | 0;
}
function __ZNSt9bad_allocC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 8048;
 return;
}
function __ZNSt20bad_array_new_lengthC2Ev($this) {
 $this = $this | 0;
 HEAP32[$this >> 2] = 8112;
 return;
}
function __ZdlPv($ptr) {
 $ptr = $ptr | 0;
 if (($ptr | 0) != 0) {
  _free($ptr);
 }
 return;
}
function __ZdlPvRKSt9nothrow_t($ptr, $0) {
 $ptr = $ptr | 0;
 $0 = $0 | 0;
 __ZdlPv($ptr);
 return;
}
function __ZdaPv($ptr) {
 $ptr = $ptr | 0;
 __ZdlPv($ptr);
 return;
}
function __ZdaPvRKSt9nothrow_t($ptr, $0) {
 $ptr = $ptr | 0;
 $0 = $0 | 0;
 __ZdaPv($ptr);
 return;
}
function __ZNSt9bad_allocD0Ev($this) {
 $this = $this | 0;
 __ZdlPv($this);
 return;
}
function __ZNSt20bad_array_new_lengthD0Ev($this) {
 $this = $this | 0;
 __ZdlPv($this);
 return;
}
function _getopt($nargc, $nargv, $options) {
 $nargc = $nargc | 0;
 $nargv = $nargv | 0;
 $options = $options | 0;
 return _getopt_internal($nargc, $nargv, $options, 0, 0, 0) | 0;
}
function _getopt_internal($nargc, $nargv, $options, $long_options, $idx, $flags) {
 $nargc = $nargc | 0;
 $nargv = $nargv | 0;
 $options = $options | 0;
 $long_options = $long_options | 0;
 $idx = $idx | 0;
 $flags = $flags | 0;
 var $3 = 0, $_pre110 = 0, $6 = 0, $10 = 0, $11 = 0, $14 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $_flags = 0, $_0119 = 0, $_0120 = 0, $_060 = 0, $_pr = 0, $31 = 0, $32 = 0, $33 = 0, $37 = 0, $40 = 0, $42 = 0, $44 = 0, $45 = 0, $46 = 0, $c_07_i_i = 0, $_06_i_i = 0, $48 = 0, $_0_lcssa_i_i = 0, $51 = 0, $54 = 0, $59 = 0, $pos_025_us_i = 0, $j_024_us_i = 0, $pos_1_us_i = 0, $61 = 0, $62 = 0, $63 = 0, $i_026_us_i = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $77 = 0, $78 = 0, $82 = 0, $83 = 0, $98 = 0, $102 = 0, $105 = 0, $106 = 0, $107 = 0, $c_07_i_i63 = 0, $_06_i_i64 = 0, $109 = 0, $_0_lcssa_i_i66 = 0, $112 = 0, $115 = 0, $120 = 0, $pos_025_us_i69 = 0, $j_024_us_i70 = 0, $pos_1_us_i72 = 0, $122 = 0, $123 = 0, $124 = 0, $i_026_us_i73 = 0, $126 = 0, $127 = 0, $_pr_pre_pre = 0, $128 = 0, $129 = 0, $130 = 0, $_pr_pre = 0, $134 = 0, $135 = 0, $136 = 0, $138 = 0, $142 = 0, $143 = 0, $153 = 0, $156 = 0, $157 = 0, $158 = 0, $c_07_i_i77 = 0, $_06_i_i78 = 0, $160 = 0, $_0_lcssa_i_i80 = 0, $163 = 0, $166 = 0, $171 = 0, $pos_025_us_i83 = 0, $j_024_us_i84 = 0, $pos_1_us_i86 = 0, $173 = 0, $174 = 0, $175 = 0, $i_026_us_i87 = 0, $177 = 0, $178 = 0, $179 = 0, $180 = 0, $181 = 0, $186 = 0, $187 = 0, $188 = 0, $194 = 0, $short_too_0 = 0, $205 = 0, $209 = 0, $210 = 0, $211 = 0, $212 = 0, $217 = 0, $236 = 0, $243 = 0, $260 = 0, $278 = 0, $_059 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 if (($options | 0) == 0) {
  $_059 = -1;
  STACKTOP = sp;
  return $_059 | 0;
 }
 $3 = HEAP32[70] | 0;
 if (($3 | 0) == 0) {
  HEAP32[4818] = 1;
  HEAP32[70] = 1;
  $11 = 1;
  $10 = 1;
  label = 1118;
 } else {
  $_pre110 = HEAP32[4818] | 0;
  $6 = HEAP32[100] | 0;
  if (($6 | 0) == -1 | ($_pre110 | 0) != 0) {
   $11 = $_pre110;
   $10 = $3;
   label = 1118;
  } else {
   $18 = $6;
   $17 = $_pre110;
   $16 = $3;
  }
 }
 if ((label | 0) == 1118) {
  $14 = (_getenv(1216) | 0) != 0 | 0;
  HEAP32[100] = $14;
  $18 = $14;
  $17 = $11;
  $16 = $10;
 }
 $19 = HEAP8[$options] | 0;
 if ($19 << 24 >> 24 == 45) {
  $_0119 = $flags | 2;
  label = 1122;
 } else {
  $_flags = ($18 | 0) != 0 | $19 << 24 >> 24 == 43 ? $flags & -2 : $flags;
  if ($19 << 24 >> 24 == 43) {
   $_0119 = $_flags;
   label = 1122;
  } else {
   $_060 = $options;
   $_0120 = $_flags;
  }
 }
 if ((label | 0) == 1122) {
  $_060 = $options + 1 | 0;
  $_0120 = $_0119;
 }
 HEAP32[4820] = 0;
 if (($17 | 0) == 0) {
  $32 = $16;
  label = 1126;
 } else {
  HEAP32[76] = -1;
  HEAP32[74] = -1;
  $31 = $16;
  $_pr = $17;
  label = 1125;
 }
 while (1) {
  if ((label | 0) == 1126) {
   label = 0;
   $33 = HEAP32[66] | 0;
   if ((HEAP8[$33] | 0) == 0) {
    $37 = $32;
   } else {
    $187 = $33;
    $186 = $32;
    break;
   }
  } else if ((label | 0) == 1125) {
   label = 0;
   if (($_pr | 0) == 0) {
    $32 = $31;
    label = 1126;
    continue;
   } else {
    $37 = $31;
   }
  }
  HEAP32[4818] = 0;
  if (($37 | 0) >= ($nargc | 0)) {
   label = 1128;
   break;
  }
  $77 = $nargv + ($37 << 2) | 0;
  $78 = HEAP32[$77 >> 2] | 0;
  HEAP32[66] = $78;
  if ((HEAP8[$78] | 0) == 45) {
   $82 = $78 + 1 | 0;
   $83 = HEAP8[$82] | 0;
   if ($83 << 24 >> 24 != 0) {
    label = 1160;
    break;
   }
   if ((_strchr($_060 | 0, 45) | 0) != 0) {
    label = 1160;
    break;
   }
  }
  HEAP32[66] = 20344;
  if (($_0120 & 2 | 0) != 0) {
   label = 1145;
   break;
  }
  if (($_0120 & 1 | 0) == 0) {
   $_059 = -1;
   label = 1229;
   break;
  }
  $98 = HEAP32[74] | 0;
  do {
   if (($98 | 0) == -1) {
    HEAP32[74] = $37;
    $134 = $37;
    $_pr_pre = 0;
   } else {
    $102 = HEAP32[76] | 0;
    if (($102 | 0) == -1) {
     $134 = $37;
     $_pr_pre = 0;
     break;
    }
    $105 = $102 - $98 | 0;
    $106 = $37 - $102 | 0;
    $107 = ($105 | 0) % ($106 | 0) | 0;
    if (($107 | 0) == 0) {
     $_0_lcssa_i_i66 = $106;
    } else {
     $_06_i_i64 = $106;
     $c_07_i_i63 = $107;
     while (1) {
      $109 = ($_06_i_i64 | 0) % ($c_07_i_i63 | 0) | 0;
      if (($109 | 0) == 0) {
       $_0_lcssa_i_i66 = $c_07_i_i63;
       break;
      } else {
       $_06_i_i64 = $c_07_i_i63;
       $c_07_i_i63 = $109;
      }
     }
    }
    $112 = ($37 - $98 | 0) / ($_0_lcssa_i_i66 | 0) | 0;
    do {
     if (($_0_lcssa_i_i66 | 0) > 0) {
      $115 = -$105 | 0;
      if (($112 | 0) > 0) {
       $i_026_us_i73 = 0;
      } else {
       $130 = $37;
       $129 = $102;
       $128 = $98;
       $_pr_pre_pre = 0;
       break;
      }
      do {
       $126 = $i_026_us_i73 + $102 | 0;
       $127 = $nargv + ($126 << 2) | 0;
       $j_024_us_i70 = 0;
       $pos_025_us_i69 = $126;
       $120 = HEAP32[$127 >> 2] | 0;
       while (1) {
        $pos_1_us_i72 = (($pos_025_us_i69 | 0) < ($102 | 0) ? $106 : $115) + $pos_025_us_i69 | 0;
        $122 = $nargv + ($pos_1_us_i72 << 2) | 0;
        $123 = HEAP32[$122 >> 2] | 0;
        HEAP32[$122 >> 2] = $120;
        HEAP32[$127 >> 2] = $123;
        $124 = $j_024_us_i70 + 1 | 0;
        if (($124 | 0) < ($112 | 0)) {
         $j_024_us_i70 = $124;
         $pos_025_us_i69 = $pos_1_us_i72;
         $120 = $123;
        } else {
         break;
        }
       }
       $i_026_us_i73 = $i_026_us_i73 + 1 | 0;
      } while (($i_026_us_i73 | 0) < ($_0_lcssa_i_i66 | 0));
      $130 = HEAP32[70] | 0;
      $129 = HEAP32[76] | 0;
      $128 = HEAP32[74] | 0;
      $_pr_pre_pre = HEAP32[4818] | 0;
     } else {
      $130 = $37;
      $129 = $102;
      $128 = $98;
      $_pr_pre_pre = 0;
     }
    } while (0);
    HEAP32[74] = $130 - $129 + $128;
    HEAP32[76] = -1;
    $134 = $130;
    $_pr_pre = $_pr_pre_pre;
   }
  } while (0);
  $135 = $134 + 1 | 0;
  HEAP32[70] = $135;
  $31 = $135;
  $_pr = $_pr_pre;
  label = 1125;
 }
 do {
  if ((label | 0) == 1229) {
   STACKTOP = sp;
   return $_059 | 0;
  } else if ((label | 0) == 1128) {
   HEAP32[66] = 20344;
   $40 = HEAP32[76] | 0;
   $42 = HEAP32[74] | 0;
   do {
    if (($40 | 0) == -1) {
     if (($42 | 0) == -1) {
      break;
     }
     HEAP32[70] = $42;
    } else {
     $44 = $40 - $42 | 0;
     $45 = $37 - $40 | 0;
     $46 = ($44 | 0) % ($45 | 0) | 0;
     if (($46 | 0) == 0) {
      $_0_lcssa_i_i = $45;
     } else {
      $_06_i_i = $45;
      $c_07_i_i = $46;
      while (1) {
       $48 = ($_06_i_i | 0) % ($c_07_i_i | 0) | 0;
       if (($48 | 0) == 0) {
        $_0_lcssa_i_i = $c_07_i_i;
        break;
       } else {
        $_06_i_i = $c_07_i_i;
        $c_07_i_i = $48;
       }
      }
     }
     $51 = ($37 - $42 | 0) / ($_0_lcssa_i_i | 0) | 0;
     do {
      if (($_0_lcssa_i_i | 0) > 0) {
       $54 = -$44 | 0;
       if (($51 | 0) > 0) {
        $i_026_us_i = 0;
       } else {
        $69 = $40;
        $68 = $42;
        $67 = $37;
        break;
       }
       do {
        $65 = $i_026_us_i + $40 | 0;
        $66 = $nargv + ($65 << 2) | 0;
        $j_024_us_i = 0;
        $pos_025_us_i = $65;
        $59 = HEAP32[$66 >> 2] | 0;
        while (1) {
         $pos_1_us_i = (($pos_025_us_i | 0) < ($40 | 0) ? $45 : $54) + $pos_025_us_i | 0;
         $61 = $nargv + ($pos_1_us_i << 2) | 0;
         $62 = HEAP32[$61 >> 2] | 0;
         HEAP32[$61 >> 2] = $59;
         HEAP32[$66 >> 2] = $62;
         $63 = $j_024_us_i + 1 | 0;
         if (($63 | 0) < ($51 | 0)) {
          $j_024_us_i = $63;
          $pos_025_us_i = $pos_1_us_i;
          $59 = $62;
         } else {
          break;
         }
        }
        $i_026_us_i = $i_026_us_i + 1 | 0;
       } while (($i_026_us_i | 0) < ($_0_lcssa_i_i | 0));
       $69 = HEAP32[76] | 0;
       $68 = HEAP32[74] | 0;
       $67 = HEAP32[70] | 0;
      } else {
       $69 = $40;
       $68 = $42;
       $67 = $37;
      }
     } while (0);
     HEAP32[70] = $68 - $69 + $67;
    }
   } while (0);
   HEAP32[76] = -1;
   HEAP32[74] = -1;
   $_059 = -1;
   STACKTOP = sp;
   return $_059 | 0;
  } else if ((label | 0) == 1145) {
   HEAP32[70] = $37 + 1;
   HEAP32[4820] = HEAP32[$77 >> 2];
   $_059 = 1;
   STACKTOP = sp;
   return $_059 | 0;
  } else if ((label | 0) == 1160) {
   $136 = HEAP32[74] | 0;
   $138 = HEAP32[76] | 0;
   if (($136 | 0) != -1 & ($138 | 0) == -1) {
    HEAP32[76] = $37;
    $143 = HEAP8[$82] | 0;
    $142 = $37;
   } else {
    $143 = $83;
    $142 = $138;
   }
   if ($143 << 24 >> 24 == 0) {
    $187 = $78;
    $186 = $37;
    break;
   }
   HEAP32[66] = $82;
   if ((HEAP8[$82] | 0) != 45) {
    $187 = $82;
    $186 = $37;
    break;
   }
   if ((HEAP8[$78 + 2 | 0] | 0) != 0) {
    $187 = $82;
    $186 = $37;
    break;
   }
   $153 = $37 + 1 | 0;
   HEAP32[70] = $153;
   HEAP32[66] = 20344;
   if (($142 | 0) != -1) {
    $156 = $142 - $136 | 0;
    $157 = $153 - $142 | 0;
    $158 = ($156 | 0) % ($157 | 0) | 0;
    if (($158 | 0) == 0) {
     $_0_lcssa_i_i80 = $157;
    } else {
     $_06_i_i78 = $157;
     $c_07_i_i77 = $158;
     while (1) {
      $160 = ($_06_i_i78 | 0) % ($c_07_i_i77 | 0) | 0;
      if (($160 | 0) == 0) {
       $_0_lcssa_i_i80 = $c_07_i_i77;
       break;
      } else {
       $_06_i_i78 = $c_07_i_i77;
       $c_07_i_i77 = $160;
      }
     }
    }
    $163 = ($153 - $136 | 0) / ($_0_lcssa_i_i80 | 0) | 0;
    do {
     if (($_0_lcssa_i_i80 | 0) > 0) {
      $166 = -$156 | 0;
      if (($163 | 0) > 0) {
       $i_026_us_i87 = 0;
      } else {
       $181 = $142;
       $180 = $136;
       $179 = $153;
       break;
      }
      do {
       $177 = $i_026_us_i87 + $142 | 0;
       $178 = $nargv + ($177 << 2) | 0;
       $j_024_us_i84 = 0;
       $pos_025_us_i83 = $177;
       $171 = HEAP32[$178 >> 2] | 0;
       while (1) {
        $pos_1_us_i86 = (($pos_025_us_i83 | 0) < ($142 | 0) ? $157 : $166) + $pos_025_us_i83 | 0;
        $173 = $nargv + ($pos_1_us_i86 << 2) | 0;
        $174 = HEAP32[$173 >> 2] | 0;
        HEAP32[$173 >> 2] = $171;
        HEAP32[$178 >> 2] = $174;
        $175 = $j_024_us_i84 + 1 | 0;
        if (($175 | 0) < ($163 | 0)) {
         $j_024_us_i84 = $175;
         $pos_025_us_i83 = $pos_1_us_i86;
         $171 = $174;
        } else {
         break;
        }
       }
       $i_026_us_i87 = $i_026_us_i87 + 1 | 0;
      } while (($i_026_us_i87 | 0) < ($_0_lcssa_i_i80 | 0));
      $181 = HEAP32[76] | 0;
      $180 = HEAP32[74] | 0;
      $179 = HEAP32[70] | 0;
     } else {
      $181 = $142;
      $180 = $136;
      $179 = $153;
     }
    } while (0);
    HEAP32[70] = $180 - $181 + $179;
   }
   HEAP32[76] = -1;
   HEAP32[74] = -1;
   $_059 = -1;
   STACKTOP = sp;
   return $_059 | 0;
  }
 } while (0);
 $188 = ($long_options | 0) != 0;
 L1565 : do {
  if ($188) {
   if (($187 | 0) == (HEAP32[$nargv + ($186 << 2) >> 2] | 0)) {
    $209 = $187;
    break;
   }
   $194 = HEAP8[$187] | 0;
   do {
    if ($194 << 24 >> 24 == 45) {
     HEAP32[66] = $187 + 1;
     $short_too_0 = 0;
    } else {
     if (($_0120 & 4 | 0) == 0) {
      $209 = $187;
      break L1565;
     }
     if ($194 << 24 >> 24 == 58) {
      $short_too_0 = 0;
      break;
     }
     $short_too_0 = (_strchr($_060 | 0, $194 << 24 >> 24 | 0) | 0) != 0 | 0;
    }
   } while (0);
   $205 = _parse_long_options($nargv, $_060, $long_options, $idx, $short_too_0) | 0;
   if (($205 | 0) == -1) {
    $209 = HEAP32[66] | 0;
    break;
   }
   HEAP32[66] = 20344;
   $_059 = $205;
   STACKTOP = sp;
   return $_059 | 0;
  } else {
   $209 = $187;
  }
 } while (0);
 $210 = $209 + 1 | 0;
 HEAP32[66] = $210;
 $211 = HEAP8[$209] | 0;
 $212 = $211 << 24 >> 24;
 if (($211 << 24 >> 24 | 0) == 58) {
  label = 1191;
 } else if (($211 << 24 >> 24 | 0) == 45) {
  if ((HEAP8[$210] | 0) == 0) {
   label = 1188;
  }
 } else {
  label = 1188;
 }
 do {
  if ((label | 0) == 1188) {
   $217 = _strchr($_060 | 0, $212 | 0) | 0;
   if (($217 | 0) == 0) {
    if ($211 << 24 >> 24 != 45) {
     label = 1191;
     break;
    }
    if ((HEAP8[$210] | 0) == 0) {
     $_059 = -1;
    } else {
     break;
    }
    STACKTOP = sp;
    return $_059 | 0;
   }
   $236 = HEAP8[$217 + 1 | 0] | 0;
   if ($188 & $211 << 24 >> 24 == 87 & $236 << 24 >> 24 == 59) {
    do {
     if ((HEAP8[$210] | 0) == 0) {
      $243 = (HEAP32[70] | 0) + 1 | 0;
      HEAP32[70] = $243;
      if (($243 | 0) < ($nargc | 0)) {
       HEAP32[66] = HEAP32[$nargv + ($243 << 2) >> 2];
       break;
      }
      HEAP32[66] = 20344;
      do {
       if ((HEAP32[72] | 0) != 0) {
        if ((HEAP8[$_060] | 0) == 58) {
         break;
        }
        __warnx(152, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $212, tempInt) | 0);
       }
      } while (0);
      HEAP32[68] = $212;
      $_059 = (HEAP8[$_060] | 0) == 58 ? 58 : 63;
      STACKTOP = sp;
      return $_059 | 0;
     }
    } while (0);
    $260 = _parse_long_options($nargv, $_060, $long_options, $idx, 0) | 0;
    HEAP32[66] = 20344;
    $_059 = $260;
    STACKTOP = sp;
    return $_059 | 0;
   }
   if ($236 << 24 >> 24 != 58) {
    if ((HEAP8[$210] | 0) != 0) {
     $_059 = $212;
     STACKTOP = sp;
     return $_059 | 0;
    }
    HEAP32[70] = (HEAP32[70] | 0) + 1;
    $_059 = $212;
    STACKTOP = sp;
    return $_059 | 0;
   }
   HEAP32[4820] = 0;
   do {
    if ((HEAP8[$210] | 0) == 0) {
     if ((HEAP8[$217 + 2 | 0] | 0) == 58) {
      break;
     }
     $278 = (HEAP32[70] | 0) + 1 | 0;
     HEAP32[70] = $278;
     if (($278 | 0) < ($nargc | 0)) {
      HEAP32[4820] = HEAP32[$nargv + ($278 << 2) >> 2];
      break;
     }
     HEAP32[66] = 20344;
     do {
      if ((HEAP32[72] | 0) != 0) {
       if ((HEAP8[$_060] | 0) == 58) {
        break;
       }
       __warnx(152, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $212, tempInt) | 0);
      }
     } while (0);
     HEAP32[68] = $212;
     $_059 = (HEAP8[$_060] | 0) == 58 ? 58 : 63;
     STACKTOP = sp;
     return $_059 | 0;
    } else {
     HEAP32[4820] = $210;
    }
   } while (0);
   HEAP32[66] = 20344;
   HEAP32[70] = (HEAP32[70] | 0) + 1;
   $_059 = $212;
   STACKTOP = sp;
   return $_059 | 0;
  }
 } while (0);
 do {
  if ((label | 0) == 1191) {
   if ((HEAP8[$210] | 0) != 0) {
    break;
   }
   HEAP32[70] = (HEAP32[70] | 0) + 1;
  }
 } while (0);
 do {
  if ((HEAP32[72] | 0) != 0) {
   if ((HEAP8[$_060] | 0) == 58) {
    break;
   }
   __warnx(376, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $212, tempInt) | 0);
  }
 } while (0);
 HEAP32[68] = $212;
 $_059 = 63;
 STACKTOP = sp;
 return $_059 | 0;
}
function _getopt_long($nargc, $nargv, $options, $long_options, $idx) {
 $nargc = $nargc | 0;
 $nargv = $nargv | 0;
 $options = $options | 0;
 $long_options = $long_options | 0;
 $idx = $idx | 0;
 return _getopt_internal($nargc, $nargv, $options, $long_options, $idx, 1) | 0;
}
function _getopt_long_only($nargc, $nargv, $options, $long_options, $idx) {
 $nargc = $nargc | 0;
 $nargv = $nargv | 0;
 $options = $options | 0;
 $long_options = $long_options | 0;
 $idx = $idx | 0;
 return _getopt_internal($nargc, $nargv, $options, $long_options, $idx, 5) | 0;
}
function __Znaj($size) {
 $size = $size | 0;
 return __Znwj($size) | 0;
}
function __ZnajRKSt9nothrow_t($size, $0) {
 $size = $size | 0;
 $0 = $0 | 0;
 return __Znaj($size) | 0;
}
function __ZSt17__throw_bad_allocv() {
 var $1 = 0;
 $1 = ___cxa_allocate_exception(4) | 0;
 HEAP32[$1 >> 2] = 8048;
 ___cxa_throw($1 | 0, 9944, 38);
}
function _parse_long_options($nargv, $options, $long_options, $idx, $short_too) {
 $nargv = $nargv | 0;
 $options = $options | 0;
 $long_options = $long_options | 0;
 $idx = $idx | 0;
 $short_too = $short_too | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $has_equal_0 = 0, $current_argv_len_0 = 0, $15 = 0, $19 = 0, $i_065_us = 0, $29 = 0, $match_066 = 0, $i_065 = 0, $match_1 = 0, $45 = 0, $47 = 0, $match_2 = 0, $51 = 0, $52 = 0, $54 = 0, $storemerge62 = 0, $storemerge = 0, $120 = 0, $123 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 $1 = HEAP32[66] | 0;
 $2 = HEAP32[70] | 0;
 $3 = $2 + 1 | 0;
 HEAP32[70] = $3;
 $4 = _strchr($1 | 0, 61) | 0;
 if (($4 | 0) == 0) {
  $current_argv_len_0 = _strlen($1 | 0) | 0;
  $has_equal_0 = 0;
 } else {
  $current_argv_len_0 = $4 - $1 | 0;
  $has_equal_0 = $4 + 1 | 0;
 }
 $15 = HEAP32[$long_options >> 2] | 0;
 L1645 : do {
  if (($15 | 0) != 0) {
   L1647 : do {
    if (($short_too | 0) != 0 & ($current_argv_len_0 | 0) == 1) {
     $i_065_us = 0;
     $19 = $15;
     while (1) {
      if ((HEAP8[$1] | 0) == (HEAP8[$19] | 0)) {
       if ((_strlen($19 | 0) | 0) == 1) {
        $match_2 = $i_065_us;
        break L1647;
       }
      }
      $i_065_us = $i_065_us + 1 | 0;
      $19 = HEAP32[$long_options + ($i_065_us << 4) >> 2] | 0;
      if (($19 | 0) == 0) {
       break L1645;
      }
     }
    } else {
     $i_065 = 0;
     $match_066 = -1;
     $29 = $15;
     while (1) {
      if ((_strncmp($1 | 0, $29 | 0, $current_argv_len_0 | 0) | 0) == 0) {
       if ((_strlen($29 | 0) | 0) == ($current_argv_len_0 | 0)) {
        $match_2 = $i_065;
        break L1647;
       }
       if (($match_066 | 0) == -1) {
        $match_1 = $i_065;
       } else {
        break;
       }
      } else {
       $match_1 = $match_066;
      }
      $45 = $i_065 + 1 | 0;
      $47 = HEAP32[$long_options + ($45 << 4) >> 2] | 0;
      if (($47 | 0) == 0) {
       $match_2 = $match_1;
       break L1647;
      } else {
       $i_065 = $45;
       $match_066 = $match_1;
       $29 = $47;
      }
     }
     do {
      if ((HEAP32[72] | 0) != 0) {
       if ((HEAP8[$options] | 0) == 58) {
        break;
       }
       __warnx(408, (tempInt = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempInt >> 2] = $current_argv_len_0, HEAP32[tempInt + 8 >> 2] = $1, tempInt) | 0);
      }
     } while (0);
     HEAP32[68] = 0;
     $_0 = 63;
     STACKTOP = sp;
     return $_0 | 0;
    }
   } while (0);
   if (($match_2 | 0) == -1) {
    break;
   }
   $51 = $long_options + ($match_2 << 4) + 4 | 0;
   $52 = HEAP32[$51 >> 2] | 0;
   $54 = ($has_equal_0 | 0) == 0;
   if (!(($52 | 0) != 0 | $54)) {
    do {
     if ((HEAP32[72] | 0) != 0) {
      if ((HEAP8[$options] | 0) == 58) {
       break;
      }
      __warnx(312, (tempInt = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempInt >> 2] = $current_argv_len_0, HEAP32[tempInt + 8 >> 2] = $1, tempInt) | 0);
     }
    } while (0);
    if ((HEAP32[$long_options + ($match_2 << 4) + 8 >> 2] | 0) == 0) {
     $storemerge62 = HEAP32[$long_options + ($match_2 << 4) + 12 >> 2] | 0;
    } else {
     $storemerge62 = 0;
    }
    HEAP32[68] = $storemerge62;
    $_0 = (HEAP8[$options] | 0) == 58 ? 58 : 63;
    STACKTOP = sp;
    return $_0 | 0;
   }
   do {
    if (($52 - 1 | 0) >>> 0 < 2) {
     if (!$54) {
      HEAP32[4820] = $has_equal_0;
      break;
     }
     if (($52 | 0) != 1) {
      break;
     }
     HEAP32[70] = $2 + 2;
     HEAP32[4820] = HEAP32[$nargv + ($3 << 2) >> 2];
    }
   } while (0);
   if (!((HEAP32[$51 >> 2] | 0) == 1 & (HEAP32[4820] | 0) == 0)) {
    if (($idx | 0) != 0) {
     HEAP32[$idx >> 2] = $match_2;
    }
    $120 = HEAP32[$long_options + ($match_2 << 4) + 8 >> 2] | 0;
    $123 = HEAP32[$long_options + ($match_2 << 4) + 12 >> 2] | 0;
    if (($120 | 0) == 0) {
     $_0 = $123;
     STACKTOP = sp;
     return $_0 | 0;
    }
    HEAP32[$120 >> 2] = $123;
    $_0 = 0;
    STACKTOP = sp;
    return $_0 | 0;
   }
   do {
    if ((HEAP32[72] | 0) != 0) {
     if ((HEAP8[$options] | 0) == 58) {
      break;
     }
     __warnx(112, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $1, tempInt) | 0);
    }
   } while (0);
   if ((HEAP32[$long_options + ($match_2 << 4) + 8 >> 2] | 0) == 0) {
    $storemerge = HEAP32[$long_options + ($match_2 << 4) + 12 >> 2] | 0;
   } else {
    $storemerge = 0;
   }
   HEAP32[68] = $storemerge;
   HEAP32[70] = (HEAP32[70] | 0) - 1;
   $_0 = (HEAP8[$options] | 0) == 58 ? 58 : 63;
   STACKTOP = sp;
   return $_0 | 0;
  }
 } while (0);
 if (($short_too | 0) != 0) {
  HEAP32[70] = $2;
  $_0 = -1;
  STACKTOP = sp;
  return $_0 | 0;
 }
 do {
  if ((HEAP32[72] | 0) != 0) {
   if ((HEAP8[$options] | 0) == 58) {
    break;
   }
   __warnx(352, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $1, tempInt) | 0);
  }
 } while (0);
 HEAP32[68] = 0;
 $_0 = 63;
 STACKTOP = sp;
 return $_0 | 0;
}
function __warn($fmt, varrp) {
 $fmt = $fmt | 0;
 varrp = varrp | 0;
 var $ap = 0, $2 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $ap = sp | 0;
 $2 = $ap;
 HEAP32[$2 >> 2] = varrp;
 HEAP32[$2 + 4 >> 2] = 0;
 __vwarn($fmt, $ap | 0);
 STACKTOP = sp;
 return;
}
function __warnx($fmt, varrp) {
 $fmt = $fmt | 0;
 varrp = varrp | 0;
 var $ap = 0, $2 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $ap = sp | 0;
 $2 = $ap;
 HEAP32[$2 >> 2] = varrp;
 HEAP32[$2 + 4 >> 2] = 0;
 __vwarnx($fmt, $ap | 0);
 STACKTOP = sp;
 return;
}
function __vwarn($fmt, $ap) {
 $fmt = $fmt | 0;
 $ap = $ap | 0;
 var $2 = 0, $4 = 0, $8 = 0, $10 = 0, $13 = 0, $14 = 0, sp = 0;
 sp = STACKTOP;
 $2 = HEAP32[(___errno_location() | 0) >> 2] | 0;
 $4 = HEAP32[___progname >> 2] | 0;
 _fprintf(HEAP32[_stderr >> 2] | 0, 3136, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $4, tempInt) | 0) | 0;
 if (($fmt | 0) != 0) {
  $8 = HEAP32[_stderr >> 2] | 0;
  _vfprintf($8 | 0, $fmt | 0, $ap | 0) | 0;
  $10 = HEAP32[_stderr >> 2] | 0;
  _fwrite(4056, 2, 1, $10 | 0) | 0;
 }
 $13 = HEAP32[_stderr >> 2] | 0;
 $14 = _strerror($2 | 0) | 0;
 _fprintf($13 | 0, 2832, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $14, tempInt) | 0) | 0;
 STACKTOP = sp;
 return;
}
function __vwarnx($fmt, $ap) {
 $fmt = $fmt | 0;
 $ap = $ap | 0;
 var $2 = 0, $6 = 0, sp = 0;
 sp = STACKTOP;
 $2 = HEAP32[___progname >> 2] | 0;
 _fprintf(HEAP32[_stderr >> 2] | 0, 2704, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $2, tempInt) | 0) | 0;
 if (($fmt | 0) != 0) {
  $6 = HEAP32[_stderr >> 2] | 0;
  _vfprintf($6 | 0, $fmt | 0, $ap | 0) | 0;
 }
 _fputc(10, HEAP32[_stderr >> 2] | 0) | 0;
 STACKTOP = sp;
 return;
}
function _strtod($string, $endPtr) {
 $string = $string | 0;
 $endPtr = $endPtr | 0;
 var $p_0 = 0, $6 = 0, $8 = 0, $sign_0 = 0, $p_2 = 0, $p_3 = 0, $mantSize_0 = 0, $decPt_0 = 0, $13 = 0, $decPt_1 = 0, $23 = 0, $24 = 0, $mantSize_1 = 0, $26 = 0, $fracExp_0 = 0, $mantSize_2 = 0, $p_4_lcssa99 = 0, $mantSize_3_lcssa98 = 0, $frac1_0_lcssa97 = 0.0, $frac1_085 = 0, $mantSize_384 = 0, $p_483 = 0, $31 = 0, $32 = 0, $p_5 = 0, $c_0_in = 0, $40 = 0, $41 = 0, $frac2_078 = 0, $mantSize_477 = 0, $p_676 = 0, $44 = 0, $45 = 0, $p_7 = 0, $c_1_in = 0, $53 = 0, $54 = 0, $frac1_0_lcssa96 = 0.0, $frac2_0_lcssa = 0.0, $57 = 0.0, $59 = 0, $60 = 0, $expSign_0_ph = 0, $p_9_ph = 0, $65 = 0, $67 = 0, $exp_071 = 0, $p_970 = 0, $71 = 0, $72 = 0, $73 = 0, $expSign_1 = 0, $p_10 = 0, $exp_1 = 0, $exp_2 = 0, $exp_3 = 0, $exp_566 = 0, $d_065 = 0, $dblExp_064 = 0.0, $dblExp_1 = 0.0, $88 = 0, $dblExp_0_lcssa = 0.0, $fraction_0 = 0.0, $p_11 = 0, $_0 = 0.0, label = 0;
 $p_0 = $string;
 while (1) {
  $6 = $p_0 + 1 | 0;
  if ((_isspace(HEAP8[$p_0] | 0) | 0) == 0) {
   break;
  } else {
   $p_0 = $6;
  }
 }
 $8 = HEAP8[$p_0] | 0;
 if (($8 << 24 >> 24 | 0) == 43) {
  $p_2 = $6;
  $sign_0 = 0;
 } else if (($8 << 24 >> 24 | 0) == 45) {
  $p_2 = $6;
  $sign_0 = 1;
 } else {
  $p_2 = $p_0;
  $sign_0 = 0;
 }
 $decPt_0 = -1;
 $mantSize_0 = 0;
 $p_3 = $p_2;
 while (1) {
  $13 = HEAP8[$p_3] | 0;
  if ((($13 << 24 >> 24) - 48 | 0) >>> 0 < 10) {
   $decPt_1 = $decPt_0;
  } else {
   if ($13 << 24 >> 24 != 46 | ($decPt_0 | 0) > -1) {
    break;
   } else {
    $decPt_1 = $mantSize_0;
   }
  }
  $decPt_0 = $decPt_1;
  $mantSize_0 = $mantSize_0 + 1 | 0;
  $p_3 = $p_3 + 1 | 0;
 }
 $23 = $p_3 + (-$mantSize_0 | 0) | 0;
 $24 = ($decPt_0 | 0) < 0;
 $mantSize_1 = (($24 ^ 1) << 31 >> 31) + $mantSize_0 | 0;
 $26 = ($mantSize_1 | 0) > 18;
 $fracExp_0 = ($26 ? -18 : -$mantSize_1 | 0) + ($24 ? $mantSize_0 : $decPt_0) | 0;
 $mantSize_2 = $26 ? 18 : $mantSize_1;
 do {
  if (($mantSize_2 | 0) == 0) {
   $p_11 = $string;
   $fraction_0 = 0.0;
  } else {
   if (($mantSize_2 | 0) > 9) {
    $p_483 = $23;
    $mantSize_384 = $mantSize_2;
    $frac1_085 = 0;
    while (1) {
     $31 = HEAP8[$p_483] | 0;
     $32 = $p_483 + 1 | 0;
     if ($31 << 24 >> 24 == 46) {
      $c_0_in = HEAP8[$32] | 0;
      $p_5 = $p_483 + 2 | 0;
     } else {
      $c_0_in = $31;
      $p_5 = $32;
     }
     $40 = ($frac1_085 * 10 | 0) - 48 + ($c_0_in << 24 >> 24) | 0;
     $41 = $mantSize_384 - 1 | 0;
     if (($41 | 0) > 9) {
      $p_483 = $p_5;
      $mantSize_384 = $41;
      $frac1_085 = $40;
     } else {
      break;
     }
    }
    $frac1_0_lcssa97 = +($40 | 0) * 1.0e9;
    $mantSize_3_lcssa98 = 9;
    $p_4_lcssa99 = $p_5;
    label = 1321;
   } else {
    if (($mantSize_2 | 0) > 0) {
     $frac1_0_lcssa97 = 0.0;
     $mantSize_3_lcssa98 = $mantSize_2;
     $p_4_lcssa99 = $23;
     label = 1321;
    } else {
     $frac2_0_lcssa = 0.0;
     $frac1_0_lcssa96 = 0.0;
    }
   }
   if ((label | 0) == 1321) {
    $p_676 = $p_4_lcssa99;
    $mantSize_477 = $mantSize_3_lcssa98;
    $frac2_078 = 0;
    while (1) {
     $44 = HEAP8[$p_676] | 0;
     $45 = $p_676 + 1 | 0;
     if ($44 << 24 >> 24 == 46) {
      $c_1_in = HEAP8[$45] | 0;
      $p_7 = $p_676 + 2 | 0;
     } else {
      $c_1_in = $44;
      $p_7 = $45;
     }
     $53 = ($frac2_078 * 10 | 0) - 48 + ($c_1_in << 24 >> 24) | 0;
     $54 = $mantSize_477 - 1 | 0;
     if (($54 | 0) > 0) {
      $p_676 = $p_7;
      $mantSize_477 = $54;
      $frac2_078 = $53;
     } else {
      break;
     }
    }
    $frac2_0_lcssa = +($53 | 0);
    $frac1_0_lcssa96 = $frac1_0_lcssa97;
   }
   $57 = $frac1_0_lcssa96 + $frac2_0_lcssa;
   do {
    if (($13 << 24 >> 24 | 0) == 69 | ($13 << 24 >> 24 | 0) == 101) {
     $59 = $p_3 + 1 | 0;
     $60 = HEAP8[$59] | 0;
     if (($60 << 24 >> 24 | 0) == 43) {
      $p_9_ph = $p_3 + 2 | 0;
      $expSign_0_ph = 0;
     } else if (($60 << 24 >> 24 | 0) == 45) {
      $p_9_ph = $p_3 + 2 | 0;
      $expSign_0_ph = 1;
     } else {
      $p_9_ph = $59;
      $expSign_0_ph = 0;
     }
     $65 = HEAP8[$p_9_ph] | 0;
     if ((($65 << 24 >> 24) - 48 | 0) >>> 0 < 10) {
      $p_970 = $p_9_ph;
      $exp_071 = 0;
      $67 = $65;
     } else {
      $exp_1 = 0;
      $p_10 = $p_9_ph;
      $expSign_1 = $expSign_0_ph;
      break;
     }
     while (1) {
      $71 = ($exp_071 * 10 | 0) - 48 + ($67 << 24 >> 24) | 0;
      $72 = $p_970 + 1 | 0;
      $73 = HEAP8[$72] | 0;
      if ((($73 << 24 >> 24) - 48 | 0) >>> 0 < 10) {
       $p_970 = $72;
       $exp_071 = $71;
       $67 = $73;
      } else {
       $exp_1 = $71;
       $p_10 = $72;
       $expSign_1 = $expSign_0_ph;
       break;
      }
     }
    } else {
     $exp_1 = 0;
     $p_10 = $p_3;
     $expSign_1 = 0;
    }
   } while (0);
   $exp_2 = $fracExp_0 + (($expSign_1 | 0) == 0 ? $exp_1 : -$exp_1 | 0) | 0;
   $exp_3 = ($exp_2 | 0) < 0 ? -$exp_2 | 0 : $exp_2;
   if (($exp_3 | 0) > 511) {
    HEAP32[(___errno_location() | 0) >> 2] = 34;
    $dblExp_064 = 1.0;
    $d_065 = 192;
    $exp_566 = 511;
    label = 1338;
   } else {
    if (($exp_3 | 0) == 0) {
     $dblExp_0_lcssa = 1.0;
    } else {
     $dblExp_064 = 1.0;
     $d_065 = 192;
     $exp_566 = $exp_3;
     label = 1338;
    }
   }
   if ((label | 0) == 1338) {
    while (1) {
     label = 0;
     if (($exp_566 & 1 | 0) == 0) {
      $dblExp_1 = $dblExp_064;
     } else {
      $dblExp_1 = $dblExp_064 * +HEAPF64[$d_065 >> 3];
     }
     $88 = $exp_566 >> 1;
     if (($88 | 0) == 0) {
      $dblExp_0_lcssa = $dblExp_1;
      break;
     } else {
      $dblExp_064 = $dblExp_1;
      $d_065 = $d_065 + 8 | 0;
      $exp_566 = $88;
      label = 1338;
     }
    }
   }
   if (($exp_2 | 0) > -1) {
    $p_11 = $p_10;
    $fraction_0 = $57 * $dblExp_0_lcssa;
    break;
   } else {
    $p_11 = $p_10;
    $fraction_0 = $57 / $dblExp_0_lcssa;
    break;
   }
  }
 } while (0);
 if (($endPtr | 0) != 0) {
  HEAP32[$endPtr >> 2] = $p_11;
 }
 if (($sign_0 | 0) == 0) {
  $_0 = $fraction_0;
  return +$_0;
 }
 $_0 = -0.0 - $fraction_0;
 return +$_0;
}
function _strtold($nptr, $endptr) {
 $nptr = $nptr | 0;
 $endptr = $endptr | 0;
 return +(+_strtod($nptr, $endptr));
}
function _strtof($nptr, $endptr) {
 $nptr = $nptr | 0;
 $endptr = $endptr | 0;
 return +(+_strtod($nptr, $endptr));
}
function _strtod_l($nptr, $endptr, $loc) {
 $nptr = $nptr | 0;
 $endptr = $endptr | 0;
 $loc = $loc | 0;
 return +(+_strtod($nptr, $endptr));
}
function _strtold_l($nptr, $endptr, $loc) {
 $nptr = $nptr | 0;
 $endptr = $endptr | 0;
 $loc = $loc | 0;
 return +(+_strtod($nptr, $endptr));
}
function _atof($str) {
 $str = $str | 0;
 return +(+_strtod($str, 0));
}
function __err($eval, $fmt, varrp) {
 $eval = $eval | 0;
 $fmt = $fmt | 0;
 varrp = varrp | 0;
 var $ap = 0, $2 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $ap = sp | 0;
 $2 = $ap;
 HEAP32[$2 >> 2] = varrp;
 HEAP32[$2 + 4 >> 2] = 0;
 __verr($eval, $fmt, $ap | 0);
}
function __errx($eval, $fmt, varrp) {
 $eval = $eval | 0;
 $fmt = $fmt | 0;
 varrp = varrp | 0;
 var $ap = 0, $2 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $ap = sp | 0;
 $2 = $ap;
 HEAP32[$2 >> 2] = varrp;
 HEAP32[$2 + 4 >> 2] = 0;
 __verrx($eval, $fmt, $ap | 0);
}
function __verr($eval, $fmt, $ap) {
 $eval = $eval | 0;
 $fmt = $fmt | 0;
 $ap = $ap | 0;
 var $2 = 0, $4 = 0, $8 = 0, $10 = 0, $13 = 0, $14 = 0;
 $2 = HEAP32[(___errno_location() | 0) >> 2] | 0;
 $4 = HEAP32[___progname >> 2] | 0;
 _fprintf(HEAP32[_stderr >> 2] | 0, 536, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $4, tempInt) | 0) | 0;
 if (($fmt | 0) != 0) {
  $8 = HEAP32[_stderr >> 2] | 0;
  _vfprintf($8 | 0, $fmt | 0, $ap | 0) | 0;
  $10 = HEAP32[_stderr >> 2] | 0;
  _fwrite(4248, 2, 1, $10 | 0) | 0;
 }
 $13 = HEAP32[_stderr >> 2] | 0;
 $14 = _strerror($2 | 0) | 0;
 _fprintf($13 | 0, 2928, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $14, tempInt) | 0) | 0;
 _exit($eval | 0);
}
function __verrx($eval, $fmt, $ap) {
 $eval = $eval | 0;
 $fmt = $fmt | 0;
 $ap = $ap | 0;
 var $2 = 0, $6 = 0;
 $2 = HEAP32[___progname >> 2] | 0;
 _fprintf(HEAP32[_stderr >> 2] | 0, 3520, (tempInt = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempInt >> 2] = $2, tempInt) | 0) | 0;
 if (($fmt | 0) != 0) {
  $6 = HEAP32[_stderr >> 2] | 0;
  _vfprintf($6 | 0, $fmt | 0, $ap | 0) | 0;
 }
 _fputc(10, HEAP32[_stderr >> 2] | 0) | 0;
 _exit($eval | 0);
}
function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
 stop = ptr + num | 0;
 if ((num | 0) >= 20) {
  value = value & 255;
  unaligned = ptr & 3;
  value4 = value | value << 8 | value << 16 | value << 24;
  stop4 = stop & ~3;
  if (unaligned) {
   unaligned = ptr + 4 - unaligned | 0;
   while ((ptr | 0) < (unaligned | 0)) {
    HEAP8[ptr] = value;
    ptr = ptr + 1 | 0;
   }
  }
  while ((ptr | 0) < (stop4 | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (stop | 0)) {
  HEAP8[ptr] = value;
  ptr = ptr + 1 | 0;
 }
}
function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0;
 ret = dest | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest] = HEAP8[src] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  while ((num | 0) >= 4) {
   HEAP32[dest >> 2] = HEAP32[src >> 2];
   dest = dest + 4 | 0;
   src = src + 4 | 0;
   num = num - 4 | 0;
  }
 }
 while ((num | 0) > 0) {
  HEAP8[dest] = HEAP8[src] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
  num = num - 1 | 0;
 }
 return ret | 0;
}
function _strlen(ptr) {
 ptr = ptr | 0;
 var curr = 0;
 curr = ptr;
 while (HEAP8[curr] | 0) {
  curr = curr + 1 | 0;
 }
 return curr - ptr | 0;
}
function _strncpy(pdest, psrc, num) {
 pdest = pdest | 0;
 psrc = psrc | 0;
 num = num | 0;
 var padding = 0, i = 0;
 while ((i | 0) < (num | 0)) {
  HEAP8[pdest + i | 0] = padding ? 0 : HEAP8[psrc + i | 0] | 0;
  padding = padding ? 1 : (HEAP8[psrc + i | 0] | 0) == 0;
  i = i + 1 | 0;
 }
 return pdest | 0;
}
function _memcmp(p1, p2, num) {
 p1 = p1 | 0;
 p2 = p2 | 0;
 num = num | 0;
 var i = 0, v1 = 0, v2 = 0;
 while ((i | 0) < (num | 0)) {
  v1 = HEAPU8[p1 + i | 0] | 0;
  v2 = HEAPU8[p2 + i | 0] | 0;
  if ((v1 | 0) != (v2 | 0)) return ((v1 | 0) > (v2 | 0) ? 1 : -1) | 0;
  i = i + 1 | 0;
 }
 return 0;
}
function _memmove(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 if ((src | 0) < (dest | 0) & (dest | 0) < (src + num | 0)) {
  src = src + num | 0;
  dest = dest + num | 0;
  while ((num | 0) > 0) {
   dest = dest - 1 | 0;
   src = src - 1 | 0;
   num = num - 1 | 0;
   HEAP8[dest] = HEAP8[src] | 0;
  }
 } else {
  _memcpy(dest, src, num) | 0;
 }
}
function _i64Add(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var l = 0;
 l = a + c >>> 0;
 return (tempRet0 = b + d + (l >>> 0 < a >>> 0 | 0) >>> 0, l | 0) | 0;
}
function _i64Subtract(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var h = 0;
 h = b - d >>> 0;
 h = b - d - (c >>> 0 > a >>> 0 | 0) >>> 0;
 return (tempRet0 = h, a - c >>> 0 | 0) | 0;
}
function _bitshift64Shl(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 if ((bits | 0) < 32) {
  tempRet0 = high << bits | (low & (1 << bits) - 1 << 32 - bits) >>> 32 - bits;
  return low << bits;
 }
 tempRet0 = low << bits - 32;
 return 0;
}
function _bitshift64Lshr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 if ((bits | 0) < 32) {
  tempRet0 = high >>> bits;
  return low >>> bits | (high & (1 << bits) - 1) << 32 - bits;
 }
 tempRet0 = 0;
 return high >>> bits - 32 | 0;
}
function _bitshift64Ashr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 if ((bits | 0) < 32) {
  tempRet0 = high >> bits;
  return low >>> bits | (high & (1 << bits) - 1) << 32 - bits;
 }
 tempRet0 = (high | 0) < 0 ? -1 : 0;
 return high >> bits - 32 | 0;
}
function _llvm_ctlz_i32(x) {
 x = x | 0;
 var ret = 0;
 ret = HEAP8[ctlz_i8 + (x >>> 24) | 0] | 0;
 if ((ret | 0) < 8) return ret | 0;
 ret = HEAP8[ctlz_i8 + (x >> 16 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 8 | 0;
 ret = HEAP8[ctlz_i8 + (x >> 8 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 16 | 0;
 return (HEAP8[ctlz_i8 + (x & 255) | 0] | 0) + 24 | 0;
}
function _llvm_cttz_i32(x) {
 x = x | 0;
 var ret = 0;
 ret = HEAP8[cttz_i8 + (x & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret | 0;
 ret = HEAP8[cttz_i8 + (x >> 8 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 8 | 0;
 ret = HEAP8[cttz_i8 + (x >> 16 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 16 | 0;
 return (HEAP8[cttz_i8 + (x >>> 24) | 0] | 0) + 24 | 0;
}
function ___muldsi3($a, $b) {
 $a = $a | 0;
 $b = $b | 0;
 var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
 $1 = $a & 65535;
 $2 = $b & 65535;
 $3 = Math_imul($2, $1) | 0;
 $6 = $a >>> 16;
 $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
 $11 = $b >>> 16;
 $12 = Math_imul($11, $1) | 0;
 return (tempRet0 = ($8 >>> 16) + (Math_imul($11, $6) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, $8 + $12 << 16 | $3 & 65535 | 0) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $7$0 = 0, $7$1 = 0, $10$0 = 0;
 $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
 $4$1 = tempRet0;
 $7$0 = $2$0 ^ $1$0;
 $7$1 = $2$1 ^ $1$1;
 $10$0 = _i64Subtract((___udivmoddi4($4$0, $4$1, _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0, tempRet0, 0) | 0) ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
 return (tempRet0 = tempRet0, $10$0) | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
 __stackBase__ = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $rem = __stackBase__ | 0;
 $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
 $4$1 = tempRet0;
 $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
 ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
 $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
 $10$1 = tempRet0;
 STACKTOP = __stackBase__;
 return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0;
 $x_sroa_0_0_extract_trunc = $a$0;
 $y_sroa_0_0_extract_trunc = $b$0;
 $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
 $1$1 = tempRet0;
 return (tempRet0 = (Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0) + (Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $1$1 | $1$1 & 0, $1$0 | 0 | 0) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $1$0 = 0;
 $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
 return (tempRet0 = tempRet0, $1$0) | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $rem = 0, __stackBase__ = 0;
 __stackBase__ = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $rem = __stackBase__ | 0;
 ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
 STACKTOP = __stackBase__;
 return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 $rem = $rem | 0;
 var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $_0$0 = 0, $_0$1 = 0;
 $n_sroa_0_0_extract_trunc = $a$0;
 $n_sroa_1_4_extract_shift$0 = $a$1;
 $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
 $d_sroa_0_0_extract_trunc = $b$0;
 $d_sroa_1_4_extract_shift$0 = $b$1;
 $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
 if (($n_sroa_1_4_extract_trunc | 0) == 0) {
  $4 = ($rem | 0) != 0;
  if (($d_sroa_1_4_extract_trunc | 0) == 0) {
   if ($4) {
    HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
    HEAP32[$rem + 4 >> 2] = 0;
   }
   $_0$1 = 0;
   $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
   return (tempRet0 = $_0$1, $_0$0) | 0;
  } else {
   if (!$4) {
    $_0$1 = 0;
    $_0$0 = 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   HEAP32[$rem >> 2] = $a$0 | 0;
   HEAP32[$rem + 4 >> 2] = $a$1 & 0;
   $_0$1 = 0;
   $_0$0 = 0;
   return (tempRet0 = $_0$1, $_0$0) | 0;
  }
 }
 $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
 do {
  if (($d_sroa_0_0_extract_trunc | 0) == 0) {
   if ($17) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
     HEAP32[$rem + 4 >> 2] = 0;
    }
    $_0$1 = 0;
    $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   if (($n_sroa_0_0_extract_trunc | 0) == 0) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = 0;
     HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
    }
    $_0$1 = 0;
    $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
   if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = $a$0 | 0;
     HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
    }
    $_0$1 = 0;
    $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   $51 = (_llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0) - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
   if ($51 >>> 0 <= 30) {
    $57 = $51 + 1 | 0;
    $58 = 31 - $51 | 0;
    $sr_1_ph = $57;
    $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
    $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
    $q_sroa_0_1_ph = 0;
    $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
    break;
   }
   if (($rem | 0) == 0) {
    $_0$1 = 0;
    $_0$0 = 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   HEAP32[$rem >> 2] = $a$0 | 0;
   HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
   $_0$1 = 0;
   $_0$0 = 0;
   return (tempRet0 = $_0$1, $_0$0) | 0;
  } else {
   if (!$17) {
    $119 = (_llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0) - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
    if ($119 >>> 0 <= 31) {
     $125 = $119 + 1 | 0;
     $126 = 31 - $119 | 0;
     $130 = $119 - 31 >> 31;
     $sr_1_ph = $125;
     $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
     $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
     $q_sroa_0_1_ph = 0;
     $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
     break;
    }
    if (($rem | 0) == 0) {
     $_0$1 = 0;
     $_0$0 = 0;
     return (tempRet0 = $_0$1, $_0$0) | 0;
    }
    HEAP32[$rem >> 2] = $a$0 | 0;
    HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
    $_0$1 = 0;
    $_0$0 = 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
   if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
    $88 = (_llvm_ctlz_i32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
    $89 = 64 - $88 | 0;
    $91 = 32 - $88 | 0;
    $92 = $91 >> 31;
    $95 = $88 - 32 | 0;
    $105 = $95 >> 31;
    $sr_1_ph = $88;
    $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
    $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
    $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
    $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
    break;
   }
   if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
    HEAP32[$rem + 4 >> 2] = 0;
   }
   if (($d_sroa_0_0_extract_trunc | 0) == 1) {
    $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
    $_0$0 = $a$0 | 0 | 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   } else {
    $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
    $_0$1 = $n_sroa_1_4_extract_trunc >>> ($78 >>> 0) | 0;
    $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
  }
 } while (0);
 if (($sr_1_ph | 0) == 0) {
  $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
  $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
  $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
  $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
  $carry_0_lcssa$1 = 0;
  $carry_0_lcssa$0 = 0;
 } else {
  $d_sroa_0_0_insert_insert99$0 = $b$0 | 0 | 0;
  $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
  $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0, $d_sroa_0_0_insert_insert99$1, -1, -1) | 0;
  $137$1 = tempRet0;
  $q_sroa_1_1198 = $q_sroa_1_1_ph;
  $q_sroa_0_1199 = $q_sroa_0_1_ph;
  $r_sroa_1_1200 = $r_sroa_1_1_ph;
  $r_sroa_0_1201 = $r_sroa_0_1_ph;
  $sr_1202 = $sr_1_ph;
  $carry_0203 = 0;
  while (1) {
   $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
   $149 = $carry_0203 | $q_sroa_0_1199 << 1;
   $r_sroa_0_0_insert_insert42$0 = $r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31 | 0;
   $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
   _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
   $150$1 = tempRet0;
   $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
   $152 = $151$0 & 1;
   $r_sroa_0_0_extract_trunc = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
   $r_sroa_1_4_extract_trunc = tempRet0;
   $155 = $sr_1202 - 1 | 0;
   if (($155 | 0) == 0) {
    break;
   } else {
    $q_sroa_1_1198 = $147;
    $q_sroa_0_1199 = $149;
    $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
    $sr_1202 = $155;
    $carry_0203 = $152;
   }
  }
  $q_sroa_1_1_lcssa = $147;
  $q_sroa_0_1_lcssa = $149;
  $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
  $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
  $carry_0_lcssa$1 = 0;
  $carry_0_lcssa$0 = $152;
 }
 $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
 $q_sroa_0_0_insert_ext75$1 = 0;
 if (($rem | 0) != 0) {
  HEAP32[$rem >> 2] = $r_sroa_0_1_lcssa;
  HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa;
 }
 $_0$1 = ($q_sroa_0_0_insert_ext75$0 | 0) >>> 31 | ($q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1) << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
 $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
 return (tempRet0 = $_0$1, $_0$0) | 0;
}
function ___cxa_pure_virtual__wrapper() {
 ___cxa_pure_virtual();
}
function dynCall_viiiii(index, a1, a2, a3, a4, a5) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 FUNCTION_TABLE_viiiii[index & 7](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0);
}
function dynCall_vi(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 FUNCTION_TABLE_vi[index & 127](a1 | 0);
}
function dynCall_vii(index, a1, a2) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 FUNCTION_TABLE_vii[index & 15](a1 | 0, a2 | 0);
}
function dynCall_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 a6 = a6 | 0;
 return FUNCTION_TABLE_iiiiiii[index & 15](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0, a6 | 0) | 0;
}
function dynCall_ii(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 return FUNCTION_TABLE_ii[index & 31](a1 | 0) | 0;
}
function dynCall_iiii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 return FUNCTION_TABLE_iiii[index & 15](a1 | 0, a2 | 0, a3 | 0) | 0;
}
function dynCall_viii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 FUNCTION_TABLE_viii[index & 15](a1 | 0, a2 | 0, a3 | 0);
}
function dynCall_v(index) {
 index = index | 0;
 FUNCTION_TABLE_v[index & 3]();
}
function dynCall_iiiii(index, a1, a2, a3, a4) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 return FUNCTION_TABLE_iiiii[index & 31](a1 | 0, a2 | 0, a3 | 0, a4 | 0) | 0;
}
function dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 a6 = a6 | 0;
 FUNCTION_TABLE_viiiiii[index & 7](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0, a6 | 0);
}
function dynCall_iii(index, a1, a2) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 return FUNCTION_TABLE_iii[index & 63](a1 | 0, a2 | 0) | 0;
}
function dynCall_iiiiii(index, a1, a2, a3, a4, a5) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 return FUNCTION_TABLE_iiiiii[index & 15](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0) | 0;
}
function dynCall_viiii(index, a1, a2, a3, a4) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 FUNCTION_TABLE_viiii[index & 7](a1 | 0, a2 | 0, a3 | 0, a4 | 0);
}
function b0(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 abort(0);
}
function b1(p0) {
 p0 = p0 | 0;
 abort(1);
}
function b2(p0, p1) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 abort(2);
}
function b3(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 abort(3);
 return 0;
}
function b4(p0) {
 p0 = p0 | 0;
 abort(4);
 return 0;
}
function b5(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 abort(5);
 return 0;
}
function b6(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 abort(6);
}
function b7() {
 abort(7);
}
function b8(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 abort(8);
 return 0;
}
function b9(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 abort(9);
}
function b10(p0, p1) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 abort(10);
 return 0;
}
function b11(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 abort(11);
 return 0;
}
function b12(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 abort(12);
}
// EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_viiiii = [b0,b0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b0,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b0];
  var FUNCTION_TABLE_vi = [b1,b1,__ZN10ime_pinyin8UserDictD0Ev,b1,__ZN10ime_pinyin5NGramD2Ev,b1,__ZNSt9bad_allocC2Ev,b1,__ZNSt9type_infoD0Ev,b1,__ZN10ime_pinyin11Utf16ReaderD2Ev
  ,b1,__ZN10ime_pinyin8DictTrieD0Ev,b1,__ZN10ime_pinyin4SyncC2Ev,b1,__ZN10ime_pinyin8LpiCacheC2Ev,b1,__ZN10ime_pinyin8DictTrie11flush_cacheEv,b1,__ZN10__cxxabiv117__array_type_infoD0Ev
  ,b1,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,b1,__ZN10__cxxabiv123__fundamental_type_infoD0Ev,b1,__ZNSt10bad_typeidD2Ev,b1,__ZN10ime_pinyin8DictTrieC2Ev,b1,__ZN10ime_pinyin8UserDictD2Ev
  ,b1,__ZN10ime_pinyin13SpellingTableC2Ev,b1,__ZN10ime_pinyin12AtomDictBaseD0Ev,b1,__ZN10ime_pinyin8UserDictC2Ev,b1,__ZNSt9bad_allocD2Ev,b1,__ZN10ime_pinyin12SpellingTrieD2Ev
  ,b1,__ZN10ime_pinyin11DictBuilderC2Ev,b1,__ZNSt10bad_typeidC2Ev,b1,__ZN10__cxxabiv120__function_type_infoD0Ev,b1,__ZN10ime_pinyin8UserDict11flush_cacheEv,b1,__ZNSt8bad_castD0Ev
  ,b1,__ZN10ime_pinyin12SpellingTrieC2Ev,b1,__ZNSt20bad_array_new_lengthC2Ev,b1,__ZN10ime_pinyin11DictBuilderD2Ev,b1,__ZN10ime_pinyin4SyncD2Ev,b1,__ZN10__cxxabiv129__pointer_to_member_type_infoD0Ev
  ,b1,__ZNSt9type_infoD2Ev,b1,__ZN10ime_pinyin8LpiCacheD2Ev,b1,__ZN10ime_pinyin12MatrixSearchD2Ev,b1,__ZN10ime_pinyin8DictTrieD2Ev,b1,__ZN10__cxxabiv117__pbase_type_infoD0Ev
  ,b1,__ZN10__cxxabiv116__shim_type_infoD0Ev,b1,__ZN10ime_pinyin12AtomDictBaseD1Ev,b1,__ZN10ime_pinyin8DictListC2Ev,b1,__ZNSt10bad_typeidD0Ev,b1,__ZN10ime_pinyin5NGramC2Ev
  ,b1,__ZNSt20bad_array_new_lengthD0Ev,b1,__ZNSt9bad_allocD0Ev,b1,__ZN10__cxxabiv117__class_type_infoD0Ev,b1,__ZN10__cxxabiv116__shim_type_infoD2Ev,b1,__ZN10ime_pinyin8DictListD2Ev
  ,b1,__ZNSt8bad_castC2Ev,b1,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,b1,__ZN10__cxxabiv119__pointer_type_infoD0Ev,b1,__ZNSt8bad_castD2Ev,b1,__ZN10__cxxabiv116__enum_type_infoD0Ev
  ,b1,__ZN10ime_pinyin13SpellingTableD2Ev,b1,__ZN10ime_pinyin14SpellingParserC2Ev,b1,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,b1,__ZN10__cxxabiv120__si_class_type_infoD0Ev,b1,__ZN10ime_pinyin12MatrixSearchC2Ev,b1,__ZN10ime_pinyin11Utf16ReaderC2Ev,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1];
  var FUNCTION_TABLE_vii = [b2,b2,__vwarnx,b2,__warnx,b2,__warn,b2,__ZN10ime_pinyin8DictTrie31set_total_lemma_count_of_othersEj,b2,__ZN10ime_pinyin8UserDict31set_total_lemma_count_of_othersEj,b2,__vwarn,b2,b2,b2];
  var FUNCTION_TABLE_iiiiiii = [b3,b3,__ZN10ime_pinyin8UserDict11extend_dictEtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj,b3,__ZN10ime_pinyin8DictTrie11extend_dictEtPKNS_11DictExtParaEPNS_10LmaPsbItemEjPj,b3,__ZN10ime_pinyin8DictTrie7predictEPKttPNS_12NPredictItemEjj,b3,__ZN10ime_pinyin8UserDict7predictEPKttPNS_12NPredictItemEjj,b3,b3,b3,b3,b3,b3,b3];
  var FUNCTION_TABLE_ii = [b4,b4,__ZNKSt9bad_alloc4whatEv,b4,__ZNKSt8bad_cast4whatEv,b4,__ZN10ime_pinyin8DictTrie21get_total_lemma_countEv,b4,__ZN10ime_pinyin8DictTrie10close_dictEv,b4,__ZNKSt20bad_array_new_length4whatEv
  ,b4,__ZN10ime_pinyin8UserDict16number_of_lemmasEv,b4,__ZN10ime_pinyin8UserDict10close_dictEv,b4,__ZN10ime_pinyin8UserDict21get_total_lemma_countEv,b4,__ZN10ime_pinyin8DictTrie16number_of_lemmasEv,b4,__ZNKSt10bad_typeid4whatEv,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4];
  var FUNCTION_TABLE_iiii = [b5,b5,__ZNK10__cxxabiv117__array_type_info9can_catchEPKNS_16__shim_type_infoERPv,b5,__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv,b5,__ZNK10__cxxabiv116__enum_type_info9can_catchEPKNS_16__shim_type_infoERPv,b5,__ZNK10__cxxabiv120__function_type_info9can_catchEPKNS_16__shim_type_infoERPv,b5,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,b5,__ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv,b5,__ZNK10__cxxabiv117__pbase_type_info9can_catchEPKNS_16__shim_type_infoERPv,b5];
  var FUNCTION_TABLE_viii = [b6,b6,__ZN10ime_pinyin8UserDict16reset_milestonesEtt,b6,__err,b6,__verr,b6,__verrx,b6,__ZN10ime_pinyin8DictTrie16reset_milestonesEtt,b6,__errx,b6,b6,b6];
  var FUNCTION_TABLE_v = [b7,b7,___cxa_pure_virtual__wrapper,b7];
  var FUNCTION_TABLE_iiiii = [b8,b8,__ZN10ime_pinyin8UserDict9load_dictEPKcjj,b8,__ZN10ime_pinyin8DictTrie15get_lemma_scoreEPtS1_t,b8,__ZN10ime_pinyin8UserDict12update_lemmaEjsb,b8,__ZN10ime_pinyin8UserDict12get_lemma_idEPtS1_t,b8,__ZN10ime_pinyin8DictTrie12get_lemma_idEPtS1_t
  ,b8,__ZN10ime_pinyin8DictTrie9load_dictEPKcjj,b8,__ZN10ime_pinyin8DictTrie13get_lemma_strEjPtt,b8,__ZN10ime_pinyin8UserDict15get_lemma_scoreEPtS1_t,b8,__ZN10ime_pinyin8DictTrie12update_lemmaEjsb,b8,__ZN10ime_pinyin8UserDict13get_lemma_strEjPtt,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8];
  var FUNCTION_TABLE_viiiiii = [b9,b9,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b9,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b9,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b9];
  var FUNCTION_TABLE_iii = [b10,b10,__ZN10ime_pinyin11comp_doubleEPKvS1_,b10,__ZN10ime_pinyin24cmp_npre_by_hislen_scoreEPKvS1_,b10,__ZN10ime_pinyin10compare_pyEPKvS1_,b10,__ZN10ime_pinyin12cmp_hanzis_5EPKvS1_,b10,__ZN10ime_pinyin12cmp_hanzis_3EPKvS1_
  ,b10,__ZN10ime_pinyin12cmp_hanzis_4EPKvS1_,b10,__ZN10ime_pinyin18cmp_lpi_with_hanziEPKvS1_,b10,__ZN10ime_pinyin12cmp_hanzis_1EPKvS1_,b10,__ZN10ime_pinyin23cmp_npre_by_hanzi_scoreEPKvS1_,b10,__ZN10ime_pinyin12cmp_hanzis_2EPKvS1_
  ,b10,__ZN10ime_pinyin24cmp_lpi_with_unified_psbEPKvS1_,b10,__ZN10ime_pinyin19cmp_lemma_entry_hzsEPKvS1_,b10,__ZN10ime_pinyin14compare_char16EPKvS1_,b10,__ZN10ime_pinyin17cmp_lpsi_with_strEPKvS1_,b10,__ZN10ime_pinyin16cmp_lpi_with_psbEPKvS1_
  ,b10,__ZN10ime_pinyin8DictTrie12remove_lemmaEj,b10,__ZN10ime_pinyin8UserDict15get_lemma_scoreEj,b10,__ZN10ime_pinyin12cmp_hanzis_6EPKvS1_,b10,__ZN10ime_pinyin17cmp_scis_hz_splidEPKvS1_,b10,__ZN10ime_pinyin12cmp_hanzis_8EPKvS1_
  ,b10,__ZN10ime_pinyin18compare_raw_spl_ebEPKvS1_,b10,__ZN10ime_pinyin8DictTrie15get_lemma_scoreEj,b10,__ZN10ime_pinyin11compare_splEPKvS1_,b10,__ZN10ime_pinyin12cmp_hanzis_7EPKvS1_,b10,__ZN10ime_pinyin8UserDict12remove_lemmaEj,b10,__ZN10ime_pinyin22cmp_scis_hz_splid_freqEPKvS1_,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10];
  var FUNCTION_TABLE_iiiiii = [b11,b11,__ZN10ime_pinyin8UserDict9put_lemmaEPtS1_tt,b11,__ZN10ime_pinyin8UserDict16get_lemma_splidsEjPttb,b11,__ZN10ime_pinyin8DictTrie8get_lpisEPKttPNS_10LmaPsbItemEj,b11,__ZN10ime_pinyin8DictTrie9put_lemmaEPtS1_tt,b11,__ZN10ime_pinyin8UserDict8get_lpisEPKttPNS_10LmaPsbItemEj,b11,__ZN10ime_pinyin8DictTrie16get_lemma_splidsEjPttb,b11,b11,b11];
  var FUNCTION_TABLE_viiii = [b12,b12,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b12,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b12,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b12];
  return { _im_enable_ym_as_szm: _im_enable_ym_as_szm, _strlen: _strlen, _im_reset_search: _im_reset_search, _im_flush_cache: _im_flush_cache, _im_get_spl_start_pos: _im_get_spl_start_pos, _im_get_candidate_char: _im_get_candidate_char, _realloc: _realloc, _im_close_decoder: _im_close_decoder, _toUTF8: _toUTF8, _im_open_decoder_fd: _im_open_decoder_fd, _strncpy: _strncpy, _im_get_fixed_len: _im_get_fixed_len, _im_cancel_last_choice: _im_cancel_last_choice, _memset: _memset, _im_search: _im_search, _memcpy: _memcpy, _calloc: _calloc, _im_choose: _im_choose, _im_set_max_lens: _im_set_max_lens, _im_get_candidate: _im_get_candidate, _im_enable_shm_as_szm: _im_enable_shm_as_szm, _im_get_sps_str: _im_get_sps_str, _memcmp: _memcmp, _im_get_predicts: _im_get_predicts, _free: _free, _im_open_decoder: _im_open_decoder, _memmove: _memmove, _malloc: _malloc, _im_delsearch: _im_delsearch, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_viiiii: dynCall_viiiii, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_iiiiiii: dynCall_iiiiiii, dynCall_ii: dynCall_ii, dynCall_iiii: dynCall_iiii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_iiiii: dynCall_iiiii, dynCall_viiiiii: dynCall_viiiiii, dynCall_iii: dynCall_iii, dynCall_iiiiii: dynCall_iiiiii, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiiiii": invoke_iiiiiii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiii": invoke_iiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_strncmp": _strncmp, "_lseek": _lseek, "___cxa_call_unexpected": ___cxa_call_unexpected, "_snprintf": _snprintf, "___cxa_free_exception": ___cxa_free_exception, "___cxa_throw": ___cxa_throw, "_fread": _fread, "_fclose": _fclose, "_strerror": _strerror, "___cxa_pure_virtual": ___cxa_pure_virtual, "_fprintf": _fprintf, "_sqrt": _sqrt, "_llvm_va_end": _llvm_va_end, "_pread": _pread, "_close": _close, "_feof": _feof, "_fopen": _fopen, "_strchr": _strchr, "_fputc": _fputc, "___buildEnvironment": ___buildEnvironment, "_log": _log, "_open": _open, "___setErrNo": ___setErrNo, "_recv": _recv, "_fseek": _fseek, "_qsort": _qsort, "_send": _send, "_write": _write, "_fputs": _fputs, "_ftell": _ftell, "_llvm_umul_with_overflow_i32": _llvm_umul_with_overflow_i32, "_exit": _exit, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_strdup": _strdup, "___cxa_allocate_exception": ___cxa_allocate_exception, "_ferror": _ferror, "_printf": _printf, "_sysconf": _sysconf, "_sbrk": _sbrk, "_truncate": _truncate, "_read": _read, "___cxa_is_number_type": ___cxa_is_number_type, "__reallyNegative": __reallyNegative, "_time": _time, "__formatString": __formatString, "___cxa_does_inherit": ___cxa_does_inherit, "_getenv": _getenv, "__ZSt9terminatev": __ZSt9terminatev, "_gettimeofday": _gettimeofday, "_vfprintf": _vfprintf, "___cxa_begin_catch": ___cxa_begin_catch, "_llvm_eh_exception": _llvm_eh_exception, "_unlink": _unlink, "___assert_func": ___assert_func, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "_putchar": _putchar, "_puts": _puts, "_fsync": _fsync, "_fabs": _fabs, "_strerror_r": _strerror_r, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_isspace": _isspace, "_fdopen": _fdopen, "_abort": _abort, "_bsearch": _bsearch, "_fwrite": _fwrite, "_ftruncate": _ftruncate, "__exit": __exit, "___resumeException": ___resumeException, "_strcmp": _strcmp, "___cxa_end_catch": ___cxa_end_catch, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTIy": __ZTIy, "__ZTIx": __ZTIx, "__ZTIt": __ZTIt, "__ZTIs": __ZTIs, "__ZTIm": __ZTIm, "__ZTIl": __ZTIl, "__ZTIi": __ZTIi, "__ZTIh": __ZTIh, "__ZTIj": __ZTIj, "__ZTIe": __ZTIe, "__ZTId": __ZTId, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTIf": __ZTIf, "__ZTIa": __ZTIa, "__ZTIc": __ZTIc, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "___progname": ___progname, "__ZTVN10__cxxabiv119__pointer_type_infoE": __ZTVN10__cxxabiv119__pointer_type_infoE }, buffer);
var _im_enable_ym_as_szm = Module["_im_enable_ym_as_szm"] = asm["_im_enable_ym_as_szm"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _im_reset_search = Module["_im_reset_search"] = asm["_im_reset_search"];
var _im_flush_cache = Module["_im_flush_cache"] = asm["_im_flush_cache"];
var _im_get_spl_start_pos = Module["_im_get_spl_start_pos"] = asm["_im_get_spl_start_pos"];
var _im_get_candidate_char = Module["_im_get_candidate_char"] = asm["_im_get_candidate_char"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _im_close_decoder = Module["_im_close_decoder"] = asm["_im_close_decoder"];
var _toUTF8 = Module["_toUTF8"] = asm["_toUTF8"];
var _im_open_decoder_fd = Module["_im_open_decoder_fd"] = asm["_im_open_decoder_fd"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _im_get_fixed_len = Module["_im_get_fixed_len"] = asm["_im_get_fixed_len"];
var _im_cancel_last_choice = Module["_im_cancel_last_choice"] = asm["_im_cancel_last_choice"];
var _memset = Module["_memset"] = asm["_memset"];
var _im_search = Module["_im_search"] = asm["_im_search"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var _im_choose = Module["_im_choose"] = asm["_im_choose"];
var _im_set_max_lens = Module["_im_set_max_lens"] = asm["_im_set_max_lens"];
var _im_get_candidate = Module["_im_get_candidate"] = asm["_im_get_candidate"];
var _im_enable_shm_as_szm = Module["_im_enable_shm_as_szm"] = asm["_im_enable_shm_as_szm"];
var _im_get_sps_str = Module["_im_get_sps_str"] = asm["_im_get_sps_str"];
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _im_get_predicts = Module["_im_get_predicts"] = asm["_im_get_predicts"];
var _free = Module["_free"] = asm["_free"];
var _im_open_decoder = Module["_im_open_decoder"] = asm["_im_open_decoder"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _im_delsearch = Module["_im_delsearch"] = asm["_im_delsearch"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
