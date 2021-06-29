/**
 * GamePad. Object and helper to make using a controller easier in browsers specifically with js-dos7
 * @Author Liam Searle
 * @copyright Emerge Gaming @copy; 2021
 */

import { DosGame } from "index7";



export class GpApi {
    public translateGamePad = new Map();
    private window: any;
    private interval:any;
    private gamePads:[Gamepad];
    private DosApi:any;
    private arrButtonsIs = [];
    private arrButtonsWas = [];
    private changes = [];



    constructor(window:any, DosApi:any){//, gamePads:[Gamepad]
        this.window = window;
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
        this.gamePads = navigator.getGamepads ? navigator.getGamepads() : (this.window.navigator.webkitGetGamepads ? this.window.navigator.webkitGetGamepads : []);
        for (let i = 0; i < this.gamePads.length; i++) {
        let gp = this.gamePads[i];
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
            this.arrButtonsIs=state;
            return state;
    }

    private processControllerChange (was, is) {
        if (is && was) {
            for (let i = 0; i < is.length; i++) {
                if (is[i] !== was[i]) {
                    this.changes.push({keyCode:(this.translateGamePad.get(i)), action:(is[i])});
                }       
            }
        }
        if (this.changes.length>0) {
                this.changes.forEach(requiredKeyPress => {
                this.DosApi.ci.sendKeyEvent(DosGame.reverseKeyMap.get(requiredKeyPress.keyCode), requiredKeyPress.action);
                console.log(DosGame.reverseKeyMap.get(requiredKeyPress.keyCode), requiredKeyPress.action);
            })  
            this.changes = []; 
        }
    }

    public processGamePad(){
        this.gamePads = navigator.getGamepads ? navigator.getGamepads() : (this.window.navigator.webkitGetGamepads ? this.window.navigator.webkitGetGamepads : []);
        if (!this.gamePads)
            return;
            
        if(this.window.chrome && this.gamePads[0]){ //if browser is chrome and the gamepad has been initialised 
            if (this.arrButtonsIs.length > 0 && this.arrButtonsWas.length > 0) {
                this.arrButtonsIs = this.getGamepadState(this.gamePads);
                this.processControllerChange(this.arrButtonsWas, this.arrButtonsIs);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }
            else {
                this.arrButtonsIs = this.getGamepadState(this.gamePads);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }   
        }
        else if (this.gamePads[0]) { //if the browser is anyting else(firefox, safari atm) then wait for the gamepad to be connected 
            if (this.arrButtonsIs.length > 0 && this.arrButtonsWas.length > 0) {
                this.arrButtonsIs = this.getGamepadState(this.gamePads);
                this.processControllerChange(this.arrButtonsWas, this.arrButtonsIs);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }
            else {
                this.arrButtonsIs = this.getGamepadState(this.gamePads);
                this.arrButtonsWas = this.arrButtonsIs.slice(0);    
            }
    
            
        }

    }
}



