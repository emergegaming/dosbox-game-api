interface GameOptions {
    cycles: number
    zipFile: string
    execCmd: string
}

interface KeyMapping {
    targetKey: string
    replacementKeyCode: number
}

/**
 * DosGame. Object and helper methods to make it easier to run DOS games in a browser using DOSBox
 * @Author Mark van Wyk
 */
export class DosGame {

    private dosRef: any;
    private options: GameOptions
    private canvas: HTMLCanvasElement
    private ci: any
    private keysToReplace:KeyMapping[] = []

    /**
     * Create a new DosGame object.
     * Note that this object requires the JSDos script to be loaded by the page.
     * <pre><code>
     *   <script src="/dosbox/js-dos.js"></script>
     * </code></pre>
     * @param dosRef a reference to window.DOS created by the included JavaScript file
     * @param options {cycles:number, zipFile:string, execCmd:string}
     * @param canvas reference to the HTMLCanvasElement DOSBox is being rendered on
     */
    constructor(dosRef:any, options:GameOptions, canvas:HTMLCanvasElement) {
        this.dosRef = dosRef
        this.options = options
        this.canvas = canvas
    }

    start() {
        return new Promise((resolve, reject):any => {
            this.dosRef(this.canvas, {
                cycles: this.options.cycles,
                wdosboxUrl: '/dosbox/wdosbox.js',
                onprogress: () => {},
                log: () => {}
            }).ready((fs, main) => {
                fs.extract(this.options.zipFile).then(() => {
                    main(["-c", this.options.execCmd]).then((ci) => {
                        this.ci = ci
                        resolve(ci)
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
    overrideKey(targetKey:string, replacementKeyCode:number): void {
        if (this.keysToReplace.length === 0) this.addKeyEventListeners()
        this.keysToReplace.push({targetKey:targetKey, replacementKeyCode:replacementKeyCode})
    }

    /** Private Methods **/

    /**
     * Create key event listeners
     * @private
     */
    private addKeyEventListeners() {
        window.addEventListener('keyup', this.handleKeyEvent.bind(this))
        window.addEventListener('keydown', this.handleKeyEvent.bind(this))
    }

    /**
     * When a key is pressed (keydown) or released (keyup), check to see if it's a mapped key and rather send the
     * preferred key to DosBox.
     * @param event KeyboardEvent of the pressed or released key
     * @private
     */
    private handleKeyEvent(event:KeyboardEvent) {
        if (event.key) {
            for (let i: number = 0; i < this.keysToReplace.length; i++) {
                let keyMapping:KeyMapping = this.keysToReplace[i]
                if (event.key == keyMapping.targetKey) {
                    event.preventDefault()
                    event.stopImmediatePropagation()
                    this.ci.simulateKeyEvent(keyMapping.replacementKeyCode, event.type == 'keydown')
                }
            }
        }
    }

    /**
     * When a user clicks away, unload the WASM code
     * @private
     */
    private unload() {
        this.ci.exit()
    }
}
