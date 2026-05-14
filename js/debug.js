import {division} from './piece.js';
import {renderPieces} from './main.js';
//debug
function debug_checkmate(){
    for (let i = 0; i < division.length; i++) {
            division[i].axis = "i";
    }
    // チェス側: 王がe1、クイーンがd1、ポーンがd2,f2,g2,h2
    // クイーンをe2に動かせばチェックメイト
    division[11].axis = "d1"; // queen
    division[12].axis = "e1"; // king
    division[0].axis = "d2"; // pawn
    division[5].axis = "f2"; // pawn
    division[6].axis = "g2"; // pawn
    division[7].axis = "h2"; // pawn
    
    // 将棋側: 王がd9、飛車がa9
    // 飛車をd9に動かせば王手
    division[29].axis = "d9"; // 王
    division[24].axis = "a9"; // 飛
    renderPieces();
}
window.debug_checkmate = debug_checkmate;//なにこれ?