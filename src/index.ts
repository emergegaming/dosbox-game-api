interface GameOptions {
    cycles: number
    zipFile: string
    execCmd: string
}

interface KeyMapping {
    targetKey: string
    replacementKeyCode: number
}

export class DosGame {

    private dosRef: any;
    private options: GameOptions;
    private canvas: HTMLCanvasElement
    private ci: any
    private keysToReplace:any[] = [];

    constructor(dosRef, options, canvas) {
        this.dosRef = dosRef;
        this.options = options
        this.canvas = canvas;
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
                        this.ci = ci;
                        resolve(ci);
                        window.addEventListener('unload', this.unload);
                    })
                })
            })
        })
    }

    /**
     * Capture a key (hopefully before the emulator gets it and replace it with a different key
     * @param targetKey
     * @param replacementKeyCode
     */
    overrideKey(targetKey:string, replacementKeyCode:number): void {
        if (this.keysToReplace.length === 0) this.addKeyEventListeners();
        this.keysToReplace.push({targetKey:targetKey, replacementKeyCode:replacementKeyCode});
    }

    /** Private Methods **/

    private addKeyEventListeners() {
        window.addEventListener('keypress', this.handleKeyEvent.bind(this))
        window.addEventListener('keyup', this.handleKeyEvent.bind(this))
    }

    /** Needs work **/
    private handleKeyEvent(event:KeyboardEvent) {
        console.log('poo')
        if (event.key) {
            this.keysToReplace.filter(item => {
                if (item.targetKey == event.key) {
                    event.preventDefault();
                    event.stopImmediatePropagation()
                    console.log(event.type);
                    this.ci.simulateKeyPress(item.replacementKeyCode)

                }
            })
        }
    }

    private unload() {
        this.ci.exit();
    }
}
