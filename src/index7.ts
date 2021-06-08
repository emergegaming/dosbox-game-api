import { webGl } from "emulators-ui/dist/types/graphics/webgl";


interface GameOptions {
    cycles: number
    zipFile: string
    execCmdArray: string[]
}

interface KeyMapping {
    targetKey: string
    replacementKeyCode: number
}

interface Directions {
    directions: number
}

interface ButtonMapping {
    element:HTMLElement
    asciiCode:number
}

interface Origin {
    x: number
    y: number
    id: number
}

interface PixelListener {
    x: number
    y: number
    callback: (string) => void
    lastColor: string
}

interface DirectionMapping {
    direction:string
    asciiMapping:number
}

/**
 * DosGame. Object and helper methods to make it easier to run DOS games in a browser using DOSBox
 * @Author Mark van Wyk
 * @copyright Emerge Gaming @copy; 2021
 */
export class DosGame {

    private dos7ReverseKeyMapping = {
        //any keys that have not been mapped are either never needed in dosbox games or are the same and dont need mappings
            
            97 : 65,
            98 : 66,
            99 : 67,
            100 : 68,
            101 : 69,
            102 : 70,
            103 : 71,
            104 : 72,
            105 : 73,
            106 : 74,
            107 : 75,
            108 : 76,
            109 : 77,
            110 : 78,
            111 : 79,
            112 : 80,
            113 : 81,
            114 : 82,
            115 : 83,
            116 : 84,
            117 : 85,
            118 : 86,
            119 : 87,
            120 : 88,
            121 : 89,
            122 : 90,
            18 : 342,
            //18 : 346,
            17 : 341,
            //17 : 345,
            16 : 340,
            //16 : 344,
            190 : 46,
            188 : 44,
            191 : 47,
            263 : 37,
            265 : 38,
            264 : 40,
            262 : 39
            
    }

    

    
    

    

    private dosRef: any;
    private options: GameOptions
    private canvas: HTMLCanvasElement
    private rootElement: HTMLElement
    private emulators: any;
    private ci: any;
    private keysToReplace:KeyMapping[] = []
    private directions:Directions
    private buttons:ButtonMapping[] = []
    private origin:Origin = {x:null, y:null, id:null}
    private lastDirection:string[] = []
    private canvasContext:WebGLRenderingContext
    private interval:number
    private pixelListeners:PixelListener[] = []
    private keysDown:string[] = []
    private readonly forceKeyPress:boolean;
    private generalPixelCallback: (colours:string[]) => void;
    private dPadMode:boolean = false;
    private dPadBounds:DOMRect;
    private touchEventListenersAdded:boolean = false;
    private reverseKeyMap = new Map();
    

    private directionMapping:object = {
        'up': 38,
        'down': 40,
        'left': 37,
        'right': 39
    };

    private jsdosKeyCodeLookup(inputCode: number){ //helper function to throw a warning when a key is pressed that is not mapped
        let result = this.reverseKeyMap.get(inputCode);
        if (result != undefined){
            return result;    
        } else {
            console.warn('%c That Key is not Mapped, check index7.ts -> start7()', 'background: #000000; color: #00ff00');
        }
    }


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


    

    constructor(dosRef:any, rootElement:HTMLElement, emulators:any, forceKeyPress:boolean = false) {
        this.dosRef = dosRef;
        //this.options = options;
        
        //this.canvas = <HTMLCanvasElement>document.getElementsByClassName('emulator-canvas')[0]
        // 
        this.rootElement = rootElement;
        this.forceKeyPress = forceKeyPress;
        this.emulators = emulators;
       
    }



    

    public start():Promise<any> {
        return new Promise((resolve) => {
            this.dosRef(this.canvas, {
                cycles: this.options.cycles,
                wdosboxUrl: '/dosbox/wdosbox.js',
                onprogress: () => {},
                log: () => {}
            }).ready((fs, main) => {
                fs.extract(this.options.zipFile).then(() => {
                    main(this.options.execCmdArray).then((ci) => {
                        this.ci = ci;
                        resolve(ci);
                        window.focus();
                        window.addEventListener('unload', this.unload)
                    })
                })
            })
        })
    }

    public start7(gameBundle: string):Promise<any> {
        return new Promise(async (resolve)=>{

            this.reverseKeyMap.set(32, 32)//space
            this.reverseKeyMap.set(38, 265)//up
            this.reverseKeyMap.set(40, 264)//down
            this.reverseKeyMap.set(37, 263)//left
            this.reverseKeyMap.set(39, 262)//right
            this.reverseKeyMap.set(18, 342)//alt
            this.reverseKeyMap.set(16, 340)//shift
            this.reverseKeyMap.set(66, 66)//B
            this.reverseKeyMap.set(88, 88)//X
            this.reverseKeyMap.set(188, 44)//comma
            this.reverseKeyMap.set(190, 46)//fullstop or period
            this.reverseKeyMap.set(191, 47)//forward-slash
            this.reverseKeyMap.set(72, 72)//H
            
            
            this.emulators.pathPrefix = "/dosbox/dos7/";
            this.dosRef(this.rootElement).run(gameBundle).then((ci)=>{
                //console.log("CI:" + ci);
                this.ci = ci;
                
                this.canvas = <any>this.rootElement.getElementsByTagName('canvas')[0];
                //console.log("CANVAS:" + this.consoleScreenshot);
                //(this.canvas.getContext("webgl", {preserveDrawingBuffer: true}))
                // WebGL2RenderingContext.clearBuffer[fiuv]();
                this.canvasContext = this.canvas.getContext("webgl");
                console.log(this.canvasContext);
                
                resolve(ci);
            });
        })
    }

    public getCommandInterface():object {

        return this.ci;
    }


    public startWithConf(dosboxConf):Promise<any> {
        return new Promise((resolve) => {
            this.options.execCmdArray.push('-conf');
            this.options.execCmdArray.push('dosbox.conf')
            this.dosRef(this.canvas, {
                wdosboxUrl: '/dosbox/wdosbox.js',
            }).ready((fs, main) => {
                fs.extract(this.options.zipFile).then(() => {
                    fs.createFile("dosbox.conf", dosboxConf);
                    main(this.options.execCmdArray).then((ci) => {
                        this.ci = ci
                        resolve(ci)
                        window.focus();
                        window.addEventListener('unload', this.unload)
                    })
                })
            })
        })
    }

    /**
     * Capture a key (hopefully before the emulator gets it and replace it with a different key
     * @param targetKey the event.key (not the ascii code) we're looking for.
     * @param replacementKeyCode the ASCII key to send to DOSBox
     * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    public overrideKey(targetKey:string, replacementKeyCode:number):void {
        if (this.keysToReplace.length === 0) this.addKeyEventListeners()
        this.keysToReplace.push({targetKey:targetKey, replacementKeyCode:replacementKeyCode})
    }

    /**
     * Convert touch dragging to direction keys
     * @param directions can be 8 (including diagonals), 4 (up, down, left right) or 2 (left or right)
     *
     */
    public mapTouchToArrowKeys(directions:Directions):void {
        this.directions = directions
        if (this.buttons.length == 0) {
            this.addTouchEventListeners()
        }
    }

    /**
     * Use the D-Pad instead of the touch dragging (joystick)
     * @param dPadElem the HTMLElement of the bounding (div) of the D-Pad container. Used to assess where the finder is.
     */
    public mapDPadToArrowKeys(dPadElem):void {

        this.dPadBounds = dPadElem.getBoundingClientRect();this.dPadMode = true;
        this.addTouchEventListeners();
    }

    /**
     * Map an on-screen button to a keypress.
     * @param buttonMapping the keyCode and asciiCode mapping.
     */
    public mapButtonToKey(buttonMapping:ButtonMapping):void {
        this.buttons.push({element: buttonMapping.element, asciiCode: this.jsdosKeyCodeLookup(buttonMapping.asciiCode)})
        if (!this.directions) {
            this.addTouchEventListeners()
        }
    }

    /**
     * Automatically press a key after a certain period of time
     * @param asciiCode the asciiCode of the key to press
     * @param wait the wait period in milliseconds
     */
    public autoKeyPress(asciiCode:number, wait:number = 0):Promise<any> {
        return new Promise<unknown>((resolve, reject) =>
            setTimeout (() => {
                this.ci.simulateKeyPress(asciiCode);
                if (wait > 0 && resolve) resolve(null);
            }, wait)
        )
    }

    /**
     * Give the x y coordinate of a pixel with a callback to be called when the colour changes
     * @param x coord of pixel
     * @param y coord of pixel
     * @param callback
     * @param delay the number of ms to wait
     * @param endX coord of when to stop reading pixels (can be set as 320 for full image)
     * @param endY coord of when to stop reading pixels (can be set as 200 for full image)
     * @todo: This should really be called addPixelListener (i.e. more than one)
     * @deprecated use addPixelListener
     */
    public setPixelListener(x:number, y:number, callback, delay:number = 1000) {
        this.addPixelListener(x, y, callback, delay);
    }

    /**
     * Give the x y coordinate of a pixel with a callback to be called when the colour changes
     * @param x coord of x pixel
     * @param y coord of y pixel
     * @param callback to callback every interval with the pixel colour.
     * @param delay the number of ms between callback intervals
     */
    
    public addPixelListener(x:number, y:number, callback, delay:number = 1000) {
        let endX = ++x;
        let endY = ++y;
        //console.log("X: " + endX + " Y: " + endY)
        this.pixelListeners.push({x:x, y:y, callback:callback, lastColor:undefined})

     

        if (!this.interval) {
            // console.log("Starting Poll");
            let scope = this;
            let whaTever = setInterval(function() {
                // console.log("HIHIHIHIh")
                scope.interval = scope.doIntervalPoll.bind(scope)(endX, endY)
            }, 1000);
            //  = window.setInterval(this.doIntervalPoll.bind(this)(endX, endY), delay)
        }
        console.log("PL Lenght; " + this.pixelListeners.length);
        let i = 0;
        this.pixelListeners.forEach(element => {

            console.log("Pixel Listeners in the Array: " + this.pixelListeners[i]);
            i++;
        });
        //console.log("Listeners: " + this.pixelListeners);


        //if (!this.canvasContext) this.canvasContext = this.canvas.getContext('2d');
    }
    

    public setGeneralPixelCallback(callback:(colours:string[]) => void) {
        this.generalPixelCallback = callback;
    }

    public stopPixelListener() {
        window.clearInterval(this.interval);
    }

    public consoleScreenshots() {//writes the imgData to a canvas to allow the old index.ts code to still work
        setInterval(() => {
            let c = document.createElement('canvas');
            c.width=320;
            c.height=200;
            const ctx = c.getContext('2d');       
            this.ci.screenshot().then((imgData)=>{
                ctx.putImageData(imgData, 0, 0);
                console.log(c.toDataURL('img/png'));
                console.log(imgData);
            })
            
            
        }, 1500)

    }

    public static isTouch = () => {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }

    public overrideDirectionAscii = (directionAscii:object) => {
        this.directionMapping = directionAscii;
    }

    /***** P R I V A T E   M E T H O D S *****/

    private doIntervalPoll(endX:number, endY:number) {
        console.log("1");

        //console.log("X: " + endX + " Y: " + endY)
        let cp = document.createElement('canvas');
            cp.width=1;
            cp.height=1;
        const ctxp = cp.getContext('2d');       
            
        
        console.log("2");

        let colors:string[] = []
        let pixelColor:ImageData;
        console.log("3");
        console.log("PL[0]: " + this.pixelListeners[0])
        this.pixelListeners.forEach(pl => {
            console.log("4");
            this.ci.screenshot().then((imgData)=>{
                console.log("5");
                ctxp.putImageData(imgData, 0, 0, 1, 1, 1, 1);
                // pixelColor = ctxp.getImageData(0,0,1,1);
                console.log("CP 1x1 img: " + cp.toDataURL('img/png'))
                //let colorValue:string = '#' + DosGame.getHexValue(pixelColor.data[0]) + DosGame.getHexValue(pixelColor.data[1]) + DosGame.getHexValue(pixelColor.data[2])+ DosGame.getHexValue(pixelColor.data[3]);
                // colors.push(colorValue)
                // console.log("Pixel Listener Screenshot: " + cp.toDataURL('img/png'));
                // if (colorValue != pl.lastColor) {
                //     pl.callback(colorValue);
                //     pl.lastColor = colorValue;
                // }
                // console.log(ctxp);
            })
            // this.ci.screenshot().then((imgData)=>{
            //     pixelColor = imgData.data;
            //     console.log("DATA: " + pixelColor);
            // })
            
            
            
            //console.log("Colours: " + colorValue)
            
            console.log("UINT8 array: " + pixelColor)
        });


        if (this.generalPixelCallback) this.generalPixelCallback(colors);
    }

    private static getHexValue(number:number):string {
        return ("00" + number.toString(16)).slice(-2)
    }

    /**
     * Create key event listeners
     * @private
     */
    private addKeyEventListeners() {
        window.addEventListener('keyup', this.handleKeyEvent.bind(this))
        window.addEventListener('keydown', this.handleKeyEvent.bind(this))
    }

    /**
     * Create touch listeners
     */
    private addTouchEventListeners() {
        if (!this.touchEventListenersAdded) {
            document.addEventListener('touchstart', this.handleTouchEvent.bind(this))
            document.addEventListener('touchend', this.handleTouchEvent.bind(this))
            document.addEventListener('touchmove', this.handleTouchEvent.bind(this))
            this.touchEventListenersAdded = true;
        }
    }

    /**
     * When a key is pressed (keydown) or released (keyup), check to see if it's a mapped key and rather send the
     * preferred key to DosBox.
     * @param event KeyboardEvent of the pressed or released key
     * @private
     */
    private handleKeyEvent(event:KeyboardEvent) {

        if ((event.type === 'keydown' || event.type === 'keyup') && event.metaKey == false) {
            let keyCode = this.findReplacementKeyCode(event.key);
            if (keyCode) {
                if (event.type === 'keydown' && !this.keysDown.includes(event.key)) {
                    this.forceKeyPress ? this.ci.simulateKeyPress(keyCode, true) : this.ci.simulateKeyEvent(keyCode, true)
                    this.keysDown.push(event.key)
                }

                if (event.type === 'keyup' && this.keysDown.includes(event.key)) {
                    this.forceKeyPress ? this.ci.simulateKeyPress(keyCode, false) : this.ci.simulateKeyEvent(keyCode, false)
                    this.keysDown.splice(this.keysDown.indexOf(event.key),1);
                }

                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }

    private findReplacementKeyCode(key:string) {
        return this.keysToReplace.find(item => item.targetKey == key)?.replacementKeyCode || null;
    }

    /**
     * Handle the touch events
     * @private
     * @param event
     * @todo THIS NEEDS TO BE SIMPLIFIED AND EITHER MOVED TO A DIFFERENT CLASS OR BECOME PART OF A SUPERCLASS
     */
    private handleTouchEvent(event:TouchEvent) {
        if (event.type == 'touchstart') {
            for (let i:number = 0; i < event.changedTouches.length; i++) {
                let startingTouch = event.changedTouches[i]
                if (!this.dPadMode && startingTouch.clientX < 200 ) {
                    this.setOrigin(startingTouch)
                }  else {
                    for (let j:number = 0; j < this.buttons.length; j++) {

                        if (this.dPadMode) {

                            let xPct = (startingTouch.clientX - this.dPadBounds.left) / this.dPadBounds.width * 100;
                            let yPct = (startingTouch.clientY - this.dPadBounds.top) / this.dPadBounds.height * 100;

                            if (xPct >= 0 && xPct <= 100 && yPct > 0 && yPct <= 100) {
                                if (yPct < 33) {
                                    if (xPct > 33 && xPct < 67) {
                                        this.ci.simulateKeyPress(this.directionMapping['up'], true)
                                    }
                                } else if (yPct < 67) {
                                    if (xPct < 33) {
                                        this.ci.simulateKeyPress(this.directionMapping['left'], true)
                                    } else if (xPct > 67) {
                                        this.ci.simulateKeyPress(this.directionMapping['right'], true)
                                    }
                                } else {
                                    if (xPct > 33 && xPct < 67) {
                                        this.ci.simulateKeyPress(this.directionMapping['down'], true)
                                    }
                                }
                                continue;
                            }

                        }

                        let mapping:ButtonMapping = this.buttons[j]
                        let rect = mapping.element.getBoundingClientRect()
                        let x1 = rect.x, x2 = rect.x + rect.width, y1 = rect.y, y2 = rect.y + rect.height;
                        if (startingTouch.clientX > x1 && startingTouch.clientX < x2 && startingTouch.clientY > y1 && startingTouch.clientY < y2) {
                            this.ci.simulateKeyPress(mapping.asciiCode, true)
                        }
                    }
                }
            }

        } else if (this.dPadMode == false && event.type == 'touchmove') {
            for (let i:number = 0; i < event.changedTouches.length; i++) {
                let movingTouch:Touch = event.changedTouches[i]
                if (movingTouch.clientX < 200) {

                    let control = []
                    let dx = movingTouch.clientX - this.origin.x;
                    let dy = movingTouch.clientY - this.origin.y;
                    if (dx === 0 && dy === 0 || isNaN(dx) || isNaN(dy)) return

                    let rangeInner:number = dy * 0.38;
                    let rangeOuter:number = dy * 2.61;

                    if (this.directions.directions === 8) {
                        if (dx < -Math.abs(rangeOuter)) {
                            control = ['left']
                        } else if (dy < 0 && dx < rangeInner) {
                            control = ['up','left']
                        } else if (dy < 0 && dx < Math.abs(rangeInner)) {
                            control = ['up']
                        } else if (dy < 0 && dx < -rangeOuter) {
                            control = ['up','right']
                        } else if (dx > Math.abs(rangeOuter)) {
                            control = ['right']
                        } else if (dy > 0 && dx < -Math.abs(rangeInner)) {
                            control = ['down','right']
                        } else if (dy > 0 && dx < rangeInner) {
                            control = ['down']
                        } else if (dy > 0 && dx < dy * rangeOuter) {
                            control = ['down','left']
                        } else {
                            console.error ("Not a known angle / direction")
                        }
                    } else if (this.directions.directions === 4) {
                        if (dx < 0 && dx < -Math.abs(dy)) {
                            control = ['left']
                        } else if (dy < 0 && dx < -dy) {
                            control = ['up']
                        } else if (dx > 0 && dx > Math.abs(dy)) {
                            control = ['right']
                        } else if (dy > 0 && dx < dy) {
                            control = ['down']
                        } else {
                            console.error ("Not a known angle / direction")
                        }
                    } else if (this.directions.directions === 2) {
                        if (dx < 0) {
                            control = ['left']
                        } else if (dx > 0) {
                            control = ['right']
                        } else {
                            console.error ("Not a known angle / direction")
                        }
                    } else {
                        console.error("Only 2, 4 or 8 directions allowed")
                    }

                    this.processDirectionChange(this.lastDirection, control)
                    this.lastDirection = control;
                }

            }
        } else if (event.type == 'touchend') {
            for (let i = 0; i < event.changedTouches.length; i++) {
                let endingTouch:Touch = event.changedTouches[i];
                if (endingTouch.identifier === this.origin.id) {
                    this.origin.x = null;
                    this.origin.y = null;
                    this.origin.id = null;
                    if (this.lastDirection.length > 0) {
                        this.processDirectionChange(this.lastDirection, [])
                    }
                    this.lastDirection = [];
                }
            }
        }
    }

    /**
     * Looks for differences between the two arrays and turns on or off new directions
     * eg: The examples in the parameters below will send a key event to the emulator with keyup for left
     * @param was the array from the previous iteration (eg: ['left', 'up'])
     * @param is the array from the previous iteration (eg: ['up'])
     */
    private processDirectionChange = (was, is) => {

    

    

        let turnOff = was.filter(w => is.indexOf(w) === -1)
        let turnOn = is.filter(i => was.indexOf(i) === -1)
        turnOff.forEach((direction) => {
            //console.log("Key Up: " + this.jsdosKeyCodeLookup(this.getDirectionAscii(direction)));

            this.ci.sendKeyEvent(this.jsdosKeyCodeLookup(this.getDirectionAscii(direction)), false);

        });
        turnOn.forEach((direction) => {
            //console.log(this.ci);
            //console.log("Key Down: " + this.jsdosKeyCodeLookup(this.getDirectionAscii(direction)));

            this.ci.sendKeyEvent(this.jsdosKeyCodeLookup(this.getDirectionAscii(direction)), true);
        });
    }

    /**
     * Returns the ascii code for the corresponding arrow key
     * @param direction
     * @private
     */
    private getDirectionAscii(direction:string):number {
        return this.directionMapping[direction];
    }

    /**
     * Convert radians tp degrees
     * @param rad the angle in radians
     */
    private radToDeg = (rad) => {
        return Math.round(rad * 180 / Math.PI);
    }

    /**
     * Set the starting point (touch)
     * @param touchEvent the touch event where the movement started
     * @private
     */
    private setOrigin(touchEvent:Touch) {
        this.origin = {x:touchEvent.clientX, y:touchEvent.clientY, id:touchEvent.identifier}
    }

    /**
     * When a user clicks away, unload the WASM code
     * @private
     */
    private unload() {
        this.dosRef.exit();
    }

}
