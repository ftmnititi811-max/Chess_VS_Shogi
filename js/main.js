/*
[やること]
特殊ルール実装 持ち時間 1p2pのターン設定 AI作成
まった log ルール変更(将棋の持ち駒にdata=Capturedとかつけてチェス側でそれとったらチェス陣営に変更とか)
[実装予定の特殊ルール]
千日手(3回繰り返したらひきわけになるやつ) ステイルメイト(なんかうごけないとひきわけになるやつ)
キャスリング(キングがなんかうごくやつ) 将棋のコマ置き(金歩) アンバッサン(ポーンがきもい動きするやつ)
*/

//ゲーム制御
import {yoko,tate,summonPiece,checkPromotable,promotion,deletePiece,findPiece,getDivision,movePiece} from './piece.js';
import {checkMovable} from './definemove.js';
import {setChessTurn,addLog,simulateCheck,getGameOver,setGameOver, getChessTurn,startGame} from "./controll.js";
import {summonBoard,highlightCell,highlightCells,deleteHighlight,renderPieces,
        messageStatus,messageMove,messageWin,messageTurn} from './graphics.js';
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
                deletePiece(targetPiece);
                info_statusText = (defeatedSymbol || "不明") + "を撃破しました";
                if(targetPiece.rank === "king"){
                setGameOver(true);
                messageWin();
                info_statusText = `${chessTurn ? "王将" : "キング"}が撃破されました。${chessTurn ? "チェス" : "将棋"}の勝利です`;
                messageTurn();
                }
            }
            const canPromote = checkPromotable(selectPiece,clickedId);
            if (canPromote){
                const promote = confirm("成りますか？");//成り判定
                if (promote){
                    promotion(selectPiece);
                    console.log("promote success");
                }
            }
            movePiece(selectPiece, clickedId);            
            messageMove(clickedId);
            if (moveResult.opponentCheckmate && !isGameOver) {
                setGameOver(true);
                info_statusText =`チェックメイトです。${chessTurn ? "チェス" : "将棋"}の勝利です`;
                messageWin();
                messageTurn();
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
                if(found.axis === "f0"||found.axis === "g0"){//それが持ち駒か
                    const canPlaceHasPiece =()=>{
                            const emptySquares = [];
                            for (let i = 0; i < yoko.length; i++) {
                                for (let j = 0; j < tate.length; j++) {
                                    const cellId = yoko[i] + tate[j];
                                    if (findPiece(cellId) === null) {
                                        emptySquares.push(cellId);
                                    }
                                }
                            }
                            return emptySquares;
                        }
                    selectPiece = found;
                    highlightCell(clickedId, "yellow");
                    legalMoves = canPlaceHasPiece();
                    highlightCells(legalMoves, "lightgreen");
                    messageStatus("持ち駒を選択しました");
                }else{
                    selectPiece = found;
                    highlightCell(clickedId, "yellow");
                    legalMoves = checkMovable(found);
                    highlightCells(legalMoves, "lightgreen");
                    messageStatus("コマを選択しました");
                }
            }else {//↑=false
                messageStatus("相手のターンです");
            }
        }else {//↑=false
            messageStatus("コマを選択してください");
        }
    }
}