export class DosGame {

    constructor(dosRef, options, canvas) {

        dosRef(canvas, {
            cycles: options.cycles,
            wdosboxUrl: '/dosbox/wdosbox.js',
            onprogress: () => {},
            log: () => {}
        }).ready((fs, main) => {
            fs.extract(options.zipFile).then(() => {
                main(["-c", options.execCmd]).then((_ci) => {

                })
            });
        });

    }

}
