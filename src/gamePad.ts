/**
 * GamePad. Object and helper to make using a controller easier in browsers 
 * @Author Liam Searle
 * @copyright Emerge Gaming @copy; 2021
 */



export class gpAPI {
    private translateGamePad = new Map();
    private window: any;
    private interval:any;
    private gamePads:[Gamepad];
    private DosApi:any;
    private arrButtonsIs;
    private arrButtonsWas;



    constructor(window:any, gamePads:[Gamepad], DosApi:any){
        this.window = window;
        this.gamePads = gamePads;
        this.DosApi = DosApi;
        
    }

    private gameLoop() {
        this.gamePads = navigator.getGamepads ? navigator.getGamepads() : (this.window.navigator.webkitGetGamepads ? this.window.navigator.webkitGetGamepads : []);
        if (!this.gamePads)
        return;
    };

    public addEvtListener() {
            window.addEventListener("gamepadconnected", () => {
            this.gamePads[0] = navigator.getGamepads()[0];
            this.gameLoop();
        });
    };

    public pollGamePads(){
        if(!('GamepadEvent' in window)) {
            this.interval = setInterval(this.pollGamepadsHelper, 500);
        }
    }

    private pollGamepadsHelper() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (this.window.navigator.webkitGetGamepads ? this.window.navigator.webkitGetGamepads : []);
        for (var i = 0; i < gamepads.length; i++) {
        var gp = gamepads[i];
            if(gp) {
                clearInterval(this.interval);
            }
        }
    }

    private buttonPressed(b) {
        if (typeof(b) == "object") {
        return b.pressed;
        }
        return b == 1.0;
    }

    

    private getGamepadState(gPs:[Gamepad]) {
        let temp = gPs[0].buttons;
            let state = [];
            let tLength = temp.length;
            for (let i = 0; i < tLength; i++) {
                state[i] = temp[i].pressed;
            }
            return state;
    }
   
    private processGamePad(){
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (this.window.navigator.webkitGetGamepads ? this.window.navigator.webkitGetGamepads : []);
        if (!gamepads)
            return;
            
        if(this.window.chrome && gamepads[0]){ //if browser is chrome and the gamepad has been initialised 
            if (this.arrButtonsIs.length > 0 && this.arrButtonsWas.length > 0) {
                this.arrButtonsIs = this.getGamepadState(gamepads);
                processControllerChange(this.arrButtonsWas, this.arrButtonsIs);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }
            else {
                this.arrButtonsIs = this.getGamepadState(gamepads);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }   
        }
        else if (gamepads[0]) { //if the browser is anyting else(firefox, safari atm) then wait for the gamepad to be connected 
            if (this.arrButtonsIs.length > 0 && this.arrButtonsWas.length > 0) {
                this.arrButtonsIs = this.getGamepadState(gamepads);
                processControllerChange(this.arrButtonsWas, this.arrButtonsIs);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }
            else {
                this.arrButtonsIs = this.getGamepadState(gamepads);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }
        }

        function processControllerChange (was, is) {
            let changes = [];
            if (is && was) {
                for (let i = 0; i < is.length; i++) {
                    if (is[i] !== was[i]) {
                        changes.push({keyCode:(this.translateGamePad.get(i)), action:(is[i])});
                    }       
                }
            }
            if (changes.length>0) {
                    changes.forEach(requiredKeyPress => {
                    this.DosApi.ci.sendKeyEvent(this.DosApi.reverseKeyMap.get(requiredKeyPress.keyCode), requiredKeyPress.action);
                    console.log(this.DosApi.reverseKeyMap.get(requiredKeyPress.keyCode), requiredKeyPress.action);
                })   
            }
        }

    }
    
    
    



    

}

