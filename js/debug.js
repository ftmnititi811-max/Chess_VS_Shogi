import {division} from './piece.js';
import {renderPieces,setChessTurn} from './main.js';
//debug
function debug_chesscheckmate(chess){
    setChessTurn(true);
    for (let i = 0; i < division.length; i++) {
            division[i].axis = "i";
    }
    if(chess == true){
        //queen=>g9
        division[11].axis = "g4"; // queen
        division[12].axis = "d7"; // king
        division[29].axis = "e9"; // 王
        renderPieces();
    }else if(chess == false){
        setChessTurn(false);
        //歩=>e7
        division[12].axis = "e1"; //king
        division[29].axis = "d9"; //王
        division[30].axis = "e2"; //金
        division[16].axis = "e4"; //歩
        renderPieces();
    }else 
        return console.log("true/falseで指定してください");
}

window.debug_chesscheckmate = debug_chesscheckmate;//なにこれ??