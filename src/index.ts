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

    private dosRef: any;
    private options: GameOptions
    private canvas: HTMLCanvasElement
    private ci: any
    private keysToReplace:KeyMapping[] = []
    private directions:Directions
    private buttons:ButtonMapping[] = []
    private origin:Origin = {x:null, y:null, id:null}
    private lastDirection:string[] = []
    private canvasContext:CanvasRenderingContext2D
    private interval:number
    private pixelListener:PixelListener
    private lastPixelValue:string
    private keysDown:string[] = []
    private readonly forceKeyPress:boolean;

    private directionMapping:object = {
        'up': 38,
        'down':40,
        'left':37,
        'right':39
    };

    /**
     * Create a new DosGame object.
     * that this object requires the JSDos script to be loaded by the page.
     *
     * eg: <script src="/dosbox/js-dos.js"></script>
     *
     * @param dosRef a reference to window.DOS created by the included JavaScript file
     * @param options {cycles:number, zipFile:string, execCmd:string}
     * @param canvas reference to the HTMLCanvasElement DOSBox is being rendered on
     * @param forceKeyPress force simulateKeyPress instead of simulateKeyEvent
     * @see https://js-dos.com/
     */
    constructor(dosRef:any, options:GameOptions, canvas:HTMLCanvasElement, forceKeyPress:boolean = false) {
        this.dosRef = dosRef
        this.options = options
        this.canvas = canvas
        this.forceKeyPress = forceKeyPress;
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
                        this.ci = ci
                        resolve(ci)
                        window.focus();
                        window.addEventListener('unload', this.unload)
                    })
                })
            })
        })
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
     * Convert touch dragging to
     * @param directions
     */
    public mapTouchToArrowKeys(directions:Directions):void {
        this.directions = directions
        if (this.buttons.length == 0) {
            this.addTouchEventListeners()
        }
    }

    /**
     * Map an on-screen button to a keypress.
     * @param buttonMapping the keyCode and asciiCode mapping.
     */
    public mapButtonToKey(buttonMapping:ButtonMapping):void {
        this.buttons.push(buttonMapping)
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
     * @todo: This should really be called addPixelListener (i.e. more than one)
     */
    public setPixelListener(x:number, y:number, callback, delay:number = 1000) {
        window.clearInterval(this.interval);
        this.pixelListener = {x:x, y:y, callback:callback}
        this.canvasContext = this.canvas.getContext('2d');
        this.interval = window.setInterval(this.doIntervalPoll.bind(this), delay)
    }

    public stopPixelListener() {
        window.clearInterval(this.interval);
    }

    public consoleScreenshots() {
        setInterval(() => {
            console.log (this.canvas.toDataURL('img/png'));
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

    private doIntervalPoll() {
        let pixelColor:ImageData = this.canvasContext.getImageData(this.pixelListener.x, this.pixelListener.y, 1, 1);
        let colorValue:string = '#' + DosGame.getHexValue(pixelColor.data[0]) + DosGame.getHexValue(pixelColor.data[1]) + DosGame.getHexValue(pixelColor.data[2]);
        if (colorValue != this.lastPixelValue) {
            this.pixelListener.callback(colorValue);
            this.lastPixelValue = colorValue;
        }
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
        document.addEventListener('touchstart', this.handleTouchEvent.bind(this))
        document.addEventListener('touchend', this.handleTouchEvent.bind(this))
        document.addEventListener('touchmove', this.handleTouchEvent.bind(this))
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
                if (startingTouch.clientX < 200) {
                    this.setOrigin(startingTouch)
                }  else {
                    for (let j:number = 0; j < this.buttons.length; j++) {
                        let mapping:ButtonMapping = this.buttons[j]
                        let rect = mapping.element.getBoundingClientRect()
                        let x1 = rect.x, x2 = rect.x + rect.width, y1 = rect.y, y2 = rect.y + rect.height;
                        if (startingTouch.clientX > x1 && startingTouch.clientX < x2 && startingTouch.clientY > y1 && startingTouch.clientY < y2) {
                            console.log (mapping.asciiCode)
                            this.ci.simulateKeyPress(mapping.asciiCode, true)
                        }
                    }
                }
            }

        } else if (event.type == 'touchmove') {
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
                            console.log ("Not a known angle / direction")
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
                            console.log ("Not a known angle / direction")
                        }
                    } else if (this.directions.directions === 2) {
                        if (dx < 0) {
                            control = ['left']
                        } else if (dx > 0) {
                            control = ['right']
                        } else {
                            console.log ("Not a known angle / direction")
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
            this.ci.simulateKeyEvent(this.getDirectionAscii(direction), false);
        });
        turnOn.forEach((direction) => {
            this.ci.simulateKeyEvent(this.getDirectionAscii(direction), true)
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
