//dom操作とかメッセージとか
import {yoko , getDivision , summonPiece } from "./piece.js";
import {clicked}from './main.js'
import { getChessTurn, getGameOver, setGameOver, startGame} from "./controll.js";

//========piece描画関連========
function renderPieces() {//ボードをdivision.axisの値に更新
    const chessTurn = getChessTurn();
    const isGameOver = getGameOver();
    const division = getDivision();
    document.querySelectorAll(".cell").forEach(td => td.textContent = "");
    for (let i = 0; i < division.length; i++) {
        if(division[i].axis[0] !== "i"){
            document.getElementById(division[i].axis).textContent = division[i].symbol;
        }
    }
    if (!isGameOver) {
        document.getElementById("info_turn").textContent = `${chessTurn ? "チェス" : "将棋"}側のターンです`;
    }
}


function summonBoard() {//ボードの初期設定
    let board = document.getElementById("board");
    board.innerHTML = "";
        //将棋プレイヤー名表示
        const topHeader = document.createElement("tr");
        const topNameTh = document.createElement("th");
        topNameTh.colSpan = 5;
        topNameTh.id = "player_shogi_name";
        topNameTh.textContent = "将棋プレイヤー";
        topHeader.appendChild(topNameTh);
        //将棋持ち駒
        for(let i = 0; i < 2; i++){
            const topHasPieceTh = document.createElement("th");
            topHasPieceTh.colSpan = 1;
            topHasPieceTh.className = "hasCell cell";
            topHasPieceTh.id = yoko[5+i]+"0";
            topHasPieceTh.textContent = "";
            topHasPieceTh.onclick = clicked
            topHeader.appendChild(topHasPieceTh);
        }
        //将棋サレンダーボタン
        const topSurTh = document.createElement("th");
        topSurTh.colSpan = 1;
        topSurTh.className = "surButton";
        topSurTh.textContent = "降参";
        topSurTh.onclick = surrender;
        topHeader.appendChild(topSurTh);
        board.appendChild(topHeader);

    for (let i = 0; i < 9; i++ ){
        let tr = document.createElement("tr");
        for (let ii = 0; ii < 8 ; ii++){
            let td = document.createElement("td");
            td.className = "cell";
            td.id = yoko[ii] + (9-i);
            td.onclick = clicked;
            tr.appendChild(td);
        }
        board.appendChild(tr);
    }
        //チェスプレイヤー名表示
        const bottomHeader = document.createElement("tr");
        const bottomTh = document.createElement("th");
        bottomTh.colSpan = 7;
        bottomTh.id = "player_chess_name";
        bottomTh.textContent = "チェスプレイヤー";
        bottomHeader.appendChild(bottomTh);
        //チェスサレンダーボタン
        const bottomSurTh = document.createElement("th");
        bottomSurTh.colSpan = 1;
        bottomSurTh.className = "surButton";
        bottomSurTh.textContent = "I Resign";
        bottomSurTh.onclick = surrender;
        bottomHeader.appendChild(bottomSurTh);
        board.appendChild(bottomHeader);

    summonPiece();
    renderPieces();
}

//========ハイライト========
function deleteHighlight() {//highlightをdeleteする
    document.querySelectorAll(".cell").forEach(td => td.style.backgroundColor = "");
}
const makeHighLight = (cell,color)=>{
    cell.style.backgroundColor = color;
}
const highlightCell = (id, color) => {
    const cell = document.getElementById(id);
    if (cell) makeHighLight(cell, color);
};
const highlightCells = (ids, color) => {
    ids.forEach(id => highlightCell(id, color));
};
//========メッセ========
const messageStatus = (content) => {
    document.getElementById("info_status").textContent = content;
}
const messageMove = (toId) =>{
    if(toId == null){
        document.getElementById("info_move").textContent = "";
    }else{
    document.getElementById("info_move").textContent = "コマを" + toId +"に移動しました";
    }
}
const messageWin = ()=>{
    const isChessTurn = getChessTurn();
    document.getElementById("info_move").textContent = `${!isChessTurn ? "チェス" : "将棋"}の勝利です`;
}
const messageTurn = ()=>{
    const isChessTurn = getChessTurn();
    const isGameOver = getGameOver();
    if(!isGameOver){
        document.getElementById("info_turn").textContent = `${isChessTurn ? "チェス" : "将棋"}のターンです`;
    }else{
        document.getElementById("info_turn").textContent = ""
    }
}

//========ボタン========
//ß終了時にたぶんかえる
const button = document.querySelector("#reset");
button.addEventListener("click", () => {
    startGame();
    console.log("reset succeed");
});

const surrender = () => {
    const isGameOver = getGameOver();
    const chessTurn = getChessTurn();
    if (isGameOver) {
        messageStatus("ゲームは終了しています");
        return;
    }
    let selectPiece = null;
    deleteHighlight();
    setGameOver(true);
    messageTurn();
    messageWin();
    messageStatus(`サレンダーされました。${chessTurn ? "将棋" : "チェス"}の勝利です`);
}
export {renderPieces,summonBoard,makeHighLight,highlightCell,highlightCells,deleteHighlight,
        messageStatus,messageMove,messageWin,messageTurn}