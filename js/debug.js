import {getDivision,movePiece} from './piece.js';
import {renderPieces} from './graphics.js';
import {setChessTurn} from './controll.js'
//debug
export function debug_chesscheckmate(chess){
    const division = getDivision();
    for (let i = 0; i < division.length; i++) {
            division[i].axis = "i";
    }
    if(chess == true){
        //queen=>g9
        movePiece(division[11],"g4")
        division[11].axis = "g4"; // queen
        division[12].axis = "d7"; // king
        division[29].axis = "e9"; // 王
        renderPieces();
    }else if(chess == false){
        setChessTurn(false);
        //歩=>e7
        movePiece(division[12], "e1"); // king
        movePiece(division[29], "d9"); // 王
        movePiece(division[30], "e2"); // 金
        movePiece(division[16], "e4"); // 歩
        renderPieces();
    }else 
        return console.log("true/falseで指定してください");
}

window.debug_chesscheckmate = debug_chesscheckmate;//なにこれ??