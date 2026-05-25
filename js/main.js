/*
[やること]
特殊ルール実装 持ち時間 1p2pのターン設定 AI作成
まった log ルール変更(将棋の持ち駒にdata=Capturedとかつけてチェス側でそれとったらチェス陣営に変更とか)
[実装予定の特殊ルール]
千日手(3回繰り返したらひきわけになるやつ) ステイルメイト(なんかうごけないとひきわけになるやつ)
キャスリング(キングがなんかうごくやつ) 将棋のコマ置き(金歩) アンバッサン(ポーンがきもい動きするやつ)
*/

//import
import {division,yoko,summonpiece} from './piece.js';
import {checkMovable,findPiece} from './definemove.js';
import {setChessTurn,chessTurn,addLog,simulateCheck,Promotion,isGameOver,setGameOver} from "./controll.js";
//ボード
function renderPieces() {//ボードをdivision.axisの値に更新
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

function summonboard() {//domでボードつくる
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
    summonpiece();
    renderPieces();
}
document.addEventListener("DOMContentLoaded", summonboard);//未来の自分がdomcontentloadedからスタート押したときとかにする


let selectPiece = null;//findPieceでdivision[n]いれる
let legalMoves = [];//うごけるとこ["a1","b2"]みたく代入
function clicked(e){//未来の自分がリファクタするはず
    const clickedId = e.currentTarget.id;   
    if(isGameOver){
        document.getElementById("info_status").textContent = "ゲームは終了しています";
        return;
    }
    if(selectPiece){//2ndclicked
        if(selectPiece.axis === clickedId){//同じとこ選択=>解除
            document.getElementById("info_move").textContent = "選択が解除されました";
            document.getElementById("info_status").textContent = "";
            selectPiece = null;
            deleteHighlight();
        }else if(legalMoves.includes(clickedId)){//動けるとこ選択
            const moveResult = simulateCheck(selectPiece, clickedId);
            if (moveResult.selfInCheck){//チェック解除しない手を選択
                document.getElementById("info_move").textContent = "その手はチェック/王手を解除できません";
                document.getElementById("info_status").textContent = "";
                selectPiece = null;
                legalMoves = [];
                deleteHighlight();
                return;
            }
            const targetPiece = findPiece(clickedId);
            let info_statusText = "";
            if(targetPiece && targetPiece.chess !== selectPiece.chess){//敵コマ撃破
                const defeatedSymbol = targetPiece.symbol;
                targetPiece.axis = "i";
                info_statusText = (defeatedSymbol || "不明") + "を撃破しました";
                if(targetPiece.rank === "king"){
                setGameOver(true);
                info_statusText = `${chessTurn ? "王将" : "キング"}が撃破されました。${chessTurn ? "チェス" : "将棋"}の勝利です`;
            }
            }
            selectPiece.axis = clickedId;//axis値代入して移動処理
            if ((selectPiece.axis[1] === "9" && selectPiece.chess === true) || (selectPiece.axis[1] === "1"||selectPiece.axis[1] === "2"||selectPiece.axis[1] === "3" && selectPiece.chess === false)){
                if((selectPiece.rank === "pawn"||selectPiece.rank === "lance"||selectPiece.rank === "silver")||(selectPiece.chess === false && selectPiece.rank === "knight"||selectPiece.rank === "rook"||selectPiece.rank === "bishop")){
                    const promote = confirm("成りますか？");//成り判定
                    if (promote){
                    Promotion(selectPiece);
                    console.log("promote success");
                    }
                }
            }
            document.getElementById("info_move").textContent = "コマを" + clickedId + "に移動しました";
            if (moveResult.opponentCheckmate && !isGameOver) {
                setGameOver(true);
                info_statusText =`チェックメイトです。${chessTurn ? "チェス" : "将棋"}の勝利です`;
            } else {
                if (moveResult.opponentCheck && !isGameOver) {
                    info_statusText = info_statusText ? `${info_statusText} チェックです` : "チェックです";
                }//ステイルメイト確認 がんばれ未来の自分
                setChessTurn(!chessTurn);
            }
            document.getElementById("info_status").textContent = info_statusText;
            addLog(selectPiece.symbol + clickedId);
            selectPiece = null;
            legalMoves = [];
            renderPieces();
            deleteHighlight();
        }else{//違うとこ選択
            document.getElementById("info_move").textContent = "そこには移動できません";
            document.getElementById("info_status").textContent = "";
            selectPiece = null;
            legalMoves = [];
            deleteHighlight();
        }
    }else{//1stclicked
        const found = findPiece(clickedId);
        if (found){//コマがいるかどうか
            if (found.chess === chessTurn) {//おまえのターンか
                selectPiece = found;
                e.currentTarget.style.backgroundColor = "yellow";
                legalMoves = checkMovable(found);
                legalMoves.forEach(id => {
                    const cell = document.getElementById(id);
                    if (cell) cell.style.backgroundColor = "lightgreen";
                });
                document.getElementById("info_move").textContent = "コマを選択しました";
            }else {//↑=false
                document.getElementById("info_move").textContent = "相手のターンです";
            }
        }else {//↑=false
            document.getElementById("info_move").textContent = "コマを選択してください";
        }
    }
}

//ボタン@ß終了時にたぶんかえる
function resetGame(){
    selectPiece = null;
    legalMoves = [];
    setChessTurn(true);
    setGameOver(false);
    summonpiece();
    renderPieces();
    deleteHighlight();
    document.getElementById("info_move").textContent = "";
    document.getElementById("info_status").textContent = "";
    document.getElementById("info_turn").textContent =`${chessTurn ? "チェス" : "将棋"}側のターンです`;
}
const button = document.querySelector("#reset");
button.addEventListener("click", () => {
    resetGame();
});
const surrenderButton = document.querySelector("#surrender");
surrenderButton.addEventListener("click", () => {
    if (isGameOver) {
        document.getElementById("info_status").textContent = "ゲームは終了しています";
        return;
    }
    setGameOver(true);
    document.getElementById("info_move").textContent = "";
    document.getElementById("info_status").textContent = `サレンダーされました。${chessTurn ? "将棋" : "チェス"}の勝利です`;
});
export {renderPieces,resetGame};