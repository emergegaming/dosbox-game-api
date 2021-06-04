/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/**
 * DosGame. Object and helper methods to make it easier to run DOS games in a browser using DOSBox
 * @Author Mark van Wyk
 * @copyright Emerge Gaming @copy; 2021
 */
var DosGame = /** @class */ (function () {
    /**
     * Create a new DosGame object.
     * that this object requires the JSDos script to be loaded by the page.
     *
     * eg: <script src="/dosbox/js-dos.js"></script>
     *
     * @param dosRef a reference to window.DOS created by the included JavaScript file
     * @param options {cycles:number, zipFile:string, execCmd:string[]}
     * @param canvas reference to the HTMLCanvasElement DOSBox is being rendered on
     * @param forceKeyPress force simulateKeyPress instead of simulateKeyEvent
     * @see https://js-dos.com/
     */
    function DosGame(dosRef, rootElement, emulators, forceKeyPress) {
        var _this = this;
        if (forceKeyPress === void 0) { forceKeyPress = false; }
        this.dos7ReverseKeyMapping = {
            //any keys that have not been mapped are either never needed in dosbox games or are the same and dont need mappings
            97: 65,
            98: 66,
            99: 67,
            100: 68,
            101: 69,
            102: 70,
            103: 71,
            104: 72,
            105: 73,
            106: 74,
            107: 75,
            108: 76,
            109: 77,
            110: 78,
            111: 79,
            112: 80,
            113: 81,
            114: 82,
            115: 83,
            116: 84,
            117: 85,
            118: 86,
            119: 87,
            120: 88,
            121: 89,
            122: 90,
            18: 342,
            //18 : 346,
            17: 341,
            //17 : 345,
            16: 340,
            //16 : 344,
            190: 46,
            188: 44,
            191: 47,
            263: 37,
            265: 38,
            264: 40,
            262: 39
        };
        this.keysToReplace = [];
        this.buttons = [];
        this.origin = { x: null, y: null, id: null };
        this.lastDirection = [];
        this.pixelListeners = [];
        this.keysDown = [];
        this.dPadMode = false;
        this.touchEventListenersAdded = false;
        this.reverseKeyMap = new Map();
        this.directionMapping = {
            'up': 38,
            'down': 40,
            'left': 37,
            'right': 39
        };
        this.overrideDirectionAscii = function (directionAscii) {
            _this.directionMapping = directionAscii;
        };
        /**
         * Looks for differences between the two arrays and turns on or off new directions
         * eg: The examples in the parameters below will send a key event to the emulator with keyup for left
         * @param was the array from the previous iteration (eg: ['left', 'up'])
         * @param is the array from the previous iteration (eg: ['up'])
         */
        this.processDirectionChange = function (was, is) {
            var turnOff = was.filter(function (w) { return is.indexOf(w) === -1; });
            var turnOn = is.filter(function (i) { return was.indexOf(i) === -1; });
            turnOff.forEach(function (direction) {
                console.log("Key Up: " + _this.jsdosKeyCodeLookup(_this.getDirectionAscii(direction)));
                _this.ci.sendKeyEvent(_this.jsdosKeyCodeLookup(_this.getDirectionAscii(direction)), false);
            });
            turnOn.forEach(function (direction) {
                //console.log(this.ci);
                console.log("Key Down: " + _this.jsdosKeyCodeLookup(_this.getDirectionAscii(direction)));
                _this.ci.sendKeyEvent(_this.jsdosKeyCodeLookup(_this.getDirectionAscii(direction)), true);
            });
        };
        /**
         * Convert radians tp degrees
         * @param rad the angle in radians
         */
        this.radToDeg = function (rad) {
            return Math.round(rad * 180 / Math.PI);
        };
        this.dosRef = dosRef;
        //this.options = options;
        //this.canvas = <HTMLCanvasElement>rootElement.firstChild
        this.rootElement = rootElement;
        this.forceKeyPress = forceKeyPress;
        this.emulators = emulators;
    }
    DosGame.prototype.jsdosKeyCodeLookup = function (inputCode) {
        var result = this.reverseKeyMap.get(inputCode);
        if (result != undefined) {
            return result;
        }
        else {
            console.warn('%c That Key is not Mapped, check index7.ts -> start7()', 'background: #000000; color: #00ff00');
        }
    };
    DosGame.prototype.start = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.dosRef(_this.canvas, {
                cycles: _this.options.cycles,
                wdosboxUrl: '/dosbox/wdosbox.js',
                onprogress: function () { },
                log: function () { }
            }).ready(function (fs, main) {
                fs.extract(_this.options.zipFile).then(function () {
                    main(_this.options.execCmdArray).then(function (ci) {
                        _this.ci = ci;
                        resolve(ci);
                        window.focus();
                        window.addEventListener('unload', _this.unload);
                    });
                });
            });
        });
    };
    DosGame.prototype.start7 = function (gameBundle) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.reverseKeyMap.set(32, 32); //space
                this.reverseKeyMap.set(38, 265); //up
                this.reverseKeyMap.set(40, 264); //down
                this.reverseKeyMap.set(37, 263); //left
                this.reverseKeyMap.set(39, 262); //right
                this.reverseKeyMap.set(18, 342); //alt
                this.reverseKeyMap.set(16, 340); //shift
                this.reverseKeyMap.set(66, 66); //B
                this.reverseKeyMap.set(88, 88); //X
                this.reverseKeyMap.set(188, 44); //comma
                this.reverseKeyMap.set(190, 46); //fullstop or period
                this.reverseKeyMap.set(191, 47); //forward-slash
                this.reverseKeyMap.set(72, 72); //H
                this.emulators.pathPrefix = "/dosbox/dos7/";
                this.dosRef(this.rootElement).run(gameBundle).then(function (ci) {
                    console.log("CI:" + ci);
                    _this.ci = ci;
                    resolve(ci);
                });
                return [2 /*return*/];
            });
        }); });
    };
    DosGame.prototype.getCommandInterface = function () {
        return this.ci;
    };
    DosGame.prototype.startWithConf = function (dosboxConf) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.options.execCmdArray.push('-conf');
            _this.options.execCmdArray.push('dosbox.conf');
            _this.dosRef(_this.canvas, {
                wdosboxUrl: '/dosbox/wdosbox.js'
            }).ready(function (fs, main) {
                fs.extract(_this.options.zipFile).then(function () {
                    fs.createFile("dosbox.conf", dosboxConf);
                    main(_this.options.execCmdArray).then(function (ci) {
                        _this.ci = ci;
                        resolve(ci);
                        window.focus();
                        window.addEventListener('unload', _this.unload);
                    });
                });
            });
        });
    };
    /**
     * Capture a key (hopefully before the emulator gets it and replace it with a different key
     * @param targetKey the event.key (not the ascii code) we're looking for.
     * @param replacementKeyCode the ASCII key to send to DOSBox
     * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    DosGame.prototype.overrideKey = function (targetKey, replacementKeyCode) {
        if (this.keysToReplace.length === 0)
            this.addKeyEventListeners();
        this.keysToReplace.push({ targetKey: targetKey, replacementKeyCode: replacementKeyCode });
    };
    /**
     * Convert touch dragging to direction keys
     * @param directions can be 8 (including diagonals), 4 (up, down, left right) or 2 (left or right)
     *
     */
    DosGame.prototype.mapTouchToArrowKeys = function (directions) {
        this.directions = directions;
        if (this.buttons.length == 0) {
            this.addTouchEventListeners();
        }
    };
    /**
     * Use the D-Pad instead of the touch dragging (joystick)
     * @param dPadElem the HTMLElement of the bounding (div) of the D-Pad container. Used to assess where the finder is.
     */
    DosGame.prototype.mapDPadToArrowKeys = function (dPadElem) {
        this.dPadBounds = dPadElem.getBoundingClientRect();
        this.dPadMode = true;
        this.addTouchEventListeners();
    };
    /**
     * Map an on-screen button to a keypress.
     * @param buttonMapping the keyCode and asciiCode mapping.
     */
    DosGame.prototype.mapButtonToKey = function (buttonMapping) {
        this.buttons.push({ element: buttonMapping.element, asciiCode: this.jsdosKeyCodeLookup(buttonMapping.asciiCode) });
        if (!this.directions) {
            this.addTouchEventListeners();
        }
    };
    /**
     * Automatically press a key after a certain period of time
     * @param asciiCode the asciiCode of the key to press
     * @param wait the wait period in milliseconds
     */
    DosGame.prototype.autoKeyPress = function (asciiCode, wait) {
        var _this = this;
        if (wait === void 0) { wait = 0; }
        return new Promise(function (resolve, reject) {
            return setTimeout(function () {
                _this.ci.simulateKeyPress(asciiCode);
                if (wait > 0 && resolve)
                    resolve(null);
            }, wait);
        });
    };
    /**
     * Give the x y coordinate of a pixel with a callback to be called when the colour changes
     * @param x coord of pixel
     * @param y coord of pixel
     * @param callback
     * @param delay the number of ms to wait
     * @todo: This should really be called addPixelListener (i.e. more than one)
     * @deprecated use addPixelListener
     */
    DosGame.prototype.setPixelListener = function (x, y, callback, delay) {
        if (delay === void 0) { delay = 1000; }
        this.addPixelListener(x, y, callback, delay);
    };
    /**
     * Give the x y coordinate of a pixel with a callback to be called when the colour changes
     * @param x coord of x pixel
     * @param y coord of y pixel
     * @param callback to callback every interval with the pixel colour.
     * @param delay the number of ms between callback intervals
     */
    DosGame.prototype.addPixelListener = function (x, y, callback, delay) {
        if (delay === void 0) { delay = 1000; }
        if (!this.interval)
            this.interval = window.setInterval(this.doIntervalPoll.bind(this), delay);
        this.pixelListeners.push({ x: x, y: y, callback: callback, lastColor: undefined });
        if (!this.canvasContext)
            this.canvasContext = this.canvas.getContext('2d');
    };
    DosGame.prototype.setGeneralPixelCallback = function (callback) {
        this.generalPixelCallback = callback;
    };
    DosGame.prototype.stopPixelListener = function () {
        window.clearInterval(this.interval);
    };
    DosGame.prototype.consoleScreenshots = function () {
        var _this = this;
        setInterval(function () {
            console.log(_this.canvas.toDataURL('img/png'));
        }, 1500);
    };
    /***** P R I V A T E   M E T H O D S *****/
    DosGame.prototype.doIntervalPoll = function () {
        var _this = this;
        var colors = [];
        this.pixelListeners.forEach(function (pl) {
            var pixelColor = _this.canvasContext.getImageData(pl.x, pl.y, 1, 1);
            var colorValue = '#' + DosGame.getHexValue(pixelColor.data[0]) + DosGame.getHexValue(pixelColor.data[1]) + DosGame.getHexValue(pixelColor.data[2]);
            colors.push(colorValue);
            if (colorValue != pl.lastColor) {
                pl.callback(colorValue);
                pl.lastColor = colorValue;
            }
        });
        if (this.generalPixelCallback)
            this.generalPixelCallback(colors);
    };
    DosGame.getHexValue = function (number) {
        return ("00" + number.toString(16)).slice(-2);
    };
    /**
     * Create key event listeners
     * @private
     */
    DosGame.prototype.addKeyEventListeners = function () {
        window.addEventListener('keyup', this.handleKeyEvent.bind(this));
        window.addEventListener('keydown', this.handleKeyEvent.bind(this));
    };
    /**
     * Create touch listeners
     */
    DosGame.prototype.addTouchEventListeners = function () {
        if (!this.touchEventListenersAdded) {
            document.addEventListener('touchstart', this.handleTouchEvent.bind(this));
            document.addEventListener('touchend', this.handleTouchEvent.bind(this));
            document.addEventListener('touchmove', this.handleTouchEvent.bind(this));
            this.touchEventListenersAdded = true;
        }
    };
    /**
     * When a key is pressed (keydown) or released (keyup), check to see if it's a mapped key and rather send the
     * preferred key to DosBox.
     * @param event KeyboardEvent of the pressed or released key
     * @private
     */
    DosGame.prototype.handleKeyEvent = function (event) {
        if ((event.type === 'keydown' || event.type === 'keyup') && event.metaKey == false) {
            var keyCode = this.findReplacementKeyCode(event.key);
            if (keyCode) {
                if (event.type === 'keydown' && !this.keysDown.includes(event.key)) {
                    this.forceKeyPress ? this.ci.simulateKeyPress(keyCode, true) : this.ci.simulateKeyEvent(keyCode, true);
                    this.keysDown.push(event.key);
                }
                if (event.type === 'keyup' && this.keysDown.includes(event.key)) {
                    this.forceKeyPress ? this.ci.simulateKeyPress(keyCode, false) : this.ci.simulateKeyEvent(keyCode, false);
                    this.keysDown.splice(this.keysDown.indexOf(event.key), 1);
                }
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };
    DosGame.prototype.findReplacementKeyCode = function (key) {
        var _a;
        return ((_a = this.keysToReplace.find(function (item) { return item.targetKey == key; })) === null || _a === void 0 ? void 0 : _a.replacementKeyCode) || null;
    };
    /**
     * Handle the touch events
     * @private
     * @param event
     * @todo THIS NEEDS TO BE SIMPLIFIED AND EITHER MOVED TO A DIFFERENT CLASS OR BECOME PART OF A SUPERCLASS
     */
    DosGame.prototype.handleTouchEvent = function (event) {
        if (event.type == 'touchstart') {
            for (var i = 0; i < event.changedTouches.length; i++) {
                var startingTouch = event.changedTouches[i];
                if (!this.dPadMode && startingTouch.clientX < 200) {
                    this.setOrigin(startingTouch);
                }
                else {
                    for (var j = 0; j < this.buttons.length; j++) {
                        if (this.dPadMode) {
                            var xPct = (startingTouch.clientX - this.dPadBounds.left) / this.dPadBounds.width * 100;
                            var yPct = (startingTouch.clientY - this.dPadBounds.top) / this.dPadBounds.height * 100;
                            if (xPct >= 0 && xPct <= 100 && yPct > 0 && yPct <= 100) {
                                if (yPct < 33) {
                                    if (xPct > 33 && xPct < 67) {
                                        this.ci.simulateKeyPress(this.directionMapping['up'], true);
                                    }
                                }
                                else if (yPct < 67) {
                                    if (xPct < 33) {
                                        this.ci.simulateKeyPress(this.directionMapping['left'], true);
                                    }
                                    else if (xPct > 67) {
                                        this.ci.simulateKeyPress(this.directionMapping['right'], true);
                                    }
                                }
                                else {
                                    if (xPct > 33 && xPct < 67) {
                                        this.ci.simulateKeyPress(this.directionMapping['down'], true);
                                    }
                                }
                                continue;
                            }
                        }
                        var mapping = this.buttons[j];
                        var rect = mapping.element.getBoundingClientRect();
                        var x1 = rect.x, x2 = rect.x + rect.width, y1 = rect.y, y2 = rect.y + rect.height;
                        if (startingTouch.clientX > x1 && startingTouch.clientX < x2 && startingTouch.clientY > y1 && startingTouch.clientY < y2) {
                            this.ci.simulateKeyPress(mapping.asciiCode, true);
                        }
                    }
                }
            }
        }
        else if (this.dPadMode == false && event.type == 'touchmove') {
            for (var i = 0; i < event.changedTouches.length; i++) {
                var movingTouch = event.changedTouches[i];
                if (movingTouch.clientX < 200) {
                    var control = [];
                    var dx = movingTouch.clientX - this.origin.x;
                    var dy = movingTouch.clientY - this.origin.y;
                    if (dx === 0 && dy === 0 || isNaN(dx) || isNaN(dy))
                        return;
                    var rangeInner = dy * 0.38;
                    var rangeOuter = dy * 2.61;
                    if (this.directions.directions === 8) {
                        if (dx < -Math.abs(rangeOuter)) {
                            control = ['left'];
                        }
                        else if (dy < 0 && dx < rangeInner) {
                            control = ['up', 'left'];
                        }
                        else if (dy < 0 && dx < Math.abs(rangeInner)) {
                            control = ['up'];
                        }
                        else if (dy < 0 && dx < -rangeOuter) {
                            control = ['up', 'right'];
                        }
                        else if (dx > Math.abs(rangeOuter)) {
                            control = ['right'];
                        }
                        else if (dy > 0 && dx < -Math.abs(rangeInner)) {
                            control = ['down', 'right'];
                        }
                        else if (dy > 0 && dx < rangeInner) {
                            control = ['down'];
                        }
                        else if (dy > 0 && dx < dy * rangeOuter) {
                            control = ['down', 'left'];
                        }
                        else {
                            console.error("Not a known angle / direction");
                        }
                    }
                    else if (this.directions.directions === 4) {
                        if (dx < 0 && dx < -Math.abs(dy)) {
                            control = ['left'];
                        }
                        else if (dy < 0 && dx < -dy) {
                            control = ['up'];
                        }
                        else if (dx > 0 && dx > Math.abs(dy)) {
                            control = ['right'];
                        }
                        else if (dy > 0 && dx < dy) {
                            control = ['down'];
                        }
                        else {
                            console.error("Not a known angle / direction");
                        }
                    }
                    else if (this.directions.directions === 2) {
                        if (dx < 0) {
                            control = ['left'];
                        }
                        else if (dx > 0) {
                            control = ['right'];
                        }
                        else {
                            console.error("Not a known angle / direction");
                        }
                    }
                    else {
                        console.error("Only 2, 4 or 8 directions allowed");
                    }
                    this.processDirectionChange(this.lastDirection, control);
                    this.lastDirection = control;
                }
            }
        }
        else if (event.type == 'touchend') {
            for (var i = 0; i < event.changedTouches.length; i++) {
                var endingTouch = event.changedTouches[i];
                if (endingTouch.identifier === this.origin.id) {
                    this.origin.x = null;
                    this.origin.y = null;
                    this.origin.id = null;
                    if (this.lastDirection.length > 0) {
                        this.processDirectionChange(this.lastDirection, []);
                    }
                    this.lastDirection = [];
                }
            }
        }
    };
    /**
     * Returns the ascii code for the corresponding arrow key
     * @param direction
     * @private
     */
    DosGame.prototype.getDirectionAscii = function (direction) {
        return this.directionMapping[direction];
    };
    /**
     * Set the starting point (touch)
     * @param touchEvent the touch event where the movement started
     * @private
     */
    DosGame.prototype.setOrigin = function (touchEvent) {
        this.origin = { x: touchEvent.clientX, y: touchEvent.clientY, id: touchEvent.identifier };
    };
    /**
     * When a user clicks away, unload the WASM code
     * @private
     */
    DosGame.prototype.unload = function () {
        this.dosRef.exit();
    };
    DosGame.isTouch = function () {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    };
    return DosGame;
}());

export { DosGame };
//# sourceMappingURL=index7.js.map
