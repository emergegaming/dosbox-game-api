/**
 * GamePad. Object and helper to make using a controller easier in browsers 
 * @Author Liam Searle
 * @copyright Emerge Gaming @copy; 2021
 */



export class GamePad {
    public translateGamePad = new Map();
    private gp: any;
    private gamepads: any;

    
    constructor(){
        this.translateGamePad.set(0, "X")//space
        this.translateGamePad.set(1, "O")//up
        this.translateGamePad.set(2, "◻")//down
        this.translateGamePad.set(3, "△")//left
        this.translateGamePad.set(4, "L1")//left
        this.translateGamePad.set(5, "R1")//left
        this.translateGamePad.set(6, "L2")//left
        this.translateGamePad.set(7, "R2")//left
        this.translateGamePad.set(8, "Back")//left
        this.translateGamePad.set(9, "Start")//left
        this.translateGamePad.set(10, "LSC")//left stick click
        this.translateGamePad.set(11, "RSC")//right stick click
        this.translateGamePad.set(12, "DPUp")//left
        this.translateGamePad.set(13, "DPDown")//left
        this.translateGamePad.set(14, "DPLeft")//left
        this.translateGamePad.set(15, "DPRight")//left
        this.translateGamePad.set(16, "Home")//left
        this.translateGamePad.set(17, "TrackPad")//left

        
        
    }

    public start(window, navigator):Promise<any> {
        return new Promise((resolve) => {
            window.addEventListener("gamepadconnected", function() {
                this.gp = navigator.getGamepads()[0];
            });
            function pollGamepads() {
                var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
                for (var i = 0; i < gamepads.length; i++) {
                  this.gp = gamepads[i];
                  clearInterval(interval);
                }
              }
            if(!('GamepadEvent' in window)) {
                // No gamepad events available, poll instead.
                var interval = setInterval(pollGamepads, 500);
              }
            
            resolve(this.gp);
        })
           
    }
    public doIntervalPoll(navigator){
        this.gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        if (!this.gamepads)
            return;
    }
    public buttonPressed(b) {
        if (typeof(b) == "object") {
          return b.pressed;
        }
        return b == 1.0;
      }
    
}

export class Buttons {
        
    public static bX = 0;
    public static bO = 1;
    public static bSq = 2;
    public static bTr = 3;
    public static bL1 = 4;
    public static bR1 = 5;
    public static bL2 = 6;
    public static bR2 = 7;
    public static bBack = 8;
    public static bStart = 9;
    public static bLSC = 10;
    public static bRSC = 11;
    public static bDPUp = 12;
    public static bDPDown = 13;
    public static bDPLeft = 14;
    public static bDPRight = 15;
    public static bHome = 16;
    public static bTrackPad = 17;

}
