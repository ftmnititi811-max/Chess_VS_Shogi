/*
[やること]
特殊ルール実装 持ち時間 1p2pのターン設定 AI作成
まった log ルール変更(将棋の持ち駒にdata=Capturedとかつけてチェス側でそれとったらチェス陣営に変更とか)
[実装予定の特殊ルール]
千日手(3回繰り返したらひきわけになるやつ) ステイルメイト(なんかうごけないとひきわけになるやつ)
キャスリング(キングがなんかうごくやつ) 将棋のコマ置き(金歩) アンバッサン(ポーンがきもい動きするやつ)
*/

//ゲーム制御
import {yoko,summonPiece,promotion,findPiece,getDivision} from './piece.js';
import {checkMovable} from './definemove.js';
import {setChessTurn,addLog,simulateCheck,getGameOver,setGameOver, getChessTurn,startGame} from "./controll.js";
import {summonBoard,deleteHighlight,renderPieces,messageStatus,messageMove,messageWin,messageTurn} from './graphics.js';
import {debug_chesscheckmate} from './debug.js';

//========メインパーツ========
document.addEventListener("DOMContentLoaded", summonBoard());//未来の自分がdomcontentloadedからスタート押したときとかにする
startGame();

//========clicked========
let selectPiece = null;//findPieceでdivision[n]いれる
let legalMoves = [];//うごけるとこ["a1","b2"]みたく代入
export function clicked(e){//未来の自分がリファクタするはず
    const chessTurn = getChessTurn();
    const isGameOver = getGameOver();
    const division = getDivision();
    const clickedId = e.currentTarget.id;
    if(isGameOver){
        messageStatus("ゲームは終了しています");
        return;
    }
    if(selectPiece){//2ndclicked
        if(selectPiece.axis === clickedId){//同じとこ選択=>解除
            messageStatus("選択が解除されました");
            selectPiece = null;
            deleteHighlight();
        }else if(legalMoves.includes(clickedId)){//動けるとこ選択
            const moveResult = simulateCheck(selectPiece, clickedId);
            if (moveResult.selfInCheck){//チェック解除しない手を選択
                messageStatus("その手はチェック/王手を解除できません");
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
                messageTurn(null);
            }
            }
            selectPiece.axis = clickedId;//axis値代入して移動処理
            if ((selectPiece.axis[1] === "9" && selectPiece.chess === true) || (selectPiece.axis[1] === "1"||selectPiece.axis[1] === "2"||selectPiece.axis[1] === "3" && selectPiece.chess === false)){
                if((selectPiece.rank === "pawn"||selectPiece.rank === "lance"||selectPiece.rank === "silver")||(selectPiece.chess === false && selectPiece.rank === "knight"||selectPiece.rank === "rook"||selectPiece.rank === "bishop")){
                    const promote = confirm("成りますか？");//成り判定
                    if (promote){
                    promotion(selectPiece);
                    console.log("promote success");
                    }
                }
            }
            messageMove(clickedId);
            if (moveResult.opponentCheckmate && !isGameOver) {
                setGameOver(true);
                info_statusText =`チェックメイトです。${chessTurn ? "チェス" : "将棋"}の勝利です`;
            } else {
                if (moveResult.opponentCheck && !isGameOver) {
                    info_statusText = info_statusText ? `${info_statusText} チェックです` : "チェックです";
                }//ステイルメイト確認 がんばれ未来の自分
                setChessTurn(!chessTurn);
            }
            messageStatus(info_statusText);
            addLog(selectPiece.symbol + clickedId);
            selectPiece = null;
            legalMoves = [];
            renderPieces();
            deleteHighlight();
        }else{//違うとこ選択
            messageStatus("そこには移動できません");
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
                messageStatus("コマを選択しました");
            }else {//↑=false
                messageStatus("相手のターンです");
            }
        }else {//↑=false
            messageStatus("コマを選択してください");
        }
    }
}

//========ボタン========
//ß終了時にたぶんかえる
const button = document.querySelector("#reset");
button.addEventListener("click", () => {
    startGame();
    console.log("reset succeed");
});

const surrenderButton = document.querySelector("#surrender");
surrenderButton.addEventListener("click", () => {
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
});