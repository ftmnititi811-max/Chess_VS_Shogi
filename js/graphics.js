//dom操作とかメッセージとか
import {yoko , getDivision , summonPiece } from "./piece.js";
import {clicked}from './main.js'
import { getChessTurn, getGameOver } from "./controll.js";

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

function deleteHighlight() {//highlightをdeleteする
    document.querySelectorAll(".cell").forEach(td => td.style.backgroundColor = "");
}

function summonBoard() {//ボードの初期設定
    let board = document.getElementById("board");
    board.innerHTML = "";
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
    summonPiece();
    renderPieces();
}

//========メッセ========
const messageStatus = (content) => {
    const isChessTurn = getChessTurn();
    if(content == null){
        document.getElementById("info_status").textContent = "";
    }else{
    document.getElementById("info_status").textContent = content;
    }
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
        document.getElementById("info_turn").textContent = "ゲームは終了しました"
    }
}

export {renderPieces,summonBoard,deleteHighlight,messageStatus,messageMove,messageWin,messageTurn}