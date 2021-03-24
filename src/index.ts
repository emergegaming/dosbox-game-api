interface GameOptions {
    cycles: number,
    zipFile: string
    execCmd: string
}

export class DosGame {

    dosRef: any;
    options: GameOptions;
    canvas: HTMLCanvasElement
    ci: any

    constructor(dosRef, options, canvas) {
        this.dosRef = dosRef;
        this.options = options
        this.canvas = canvas;
        console.log ("a", this.options)
    }

    start = () => new Promise((resolve, reject):any => {
        console.log ("b", this.options);
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
                })
            });
        });
    })

}
