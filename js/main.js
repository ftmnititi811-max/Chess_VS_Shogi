//import
import {division,yoko,summonpiece} from './piece.js';
import {checkMovable,findPiece} from './definemove.js';
//ボード
function renderPieces() {//ボードをdivision.axisの値に更新
    document.querySelectorAll(".cell").forEach(td => td.textContent = "");
    let renderedCount = 0;
    for (let i = 0; i < division.length; i++) {
        if(division[i].axis[0] !== "i"){
            document.getElementById(division[i].axis).textContent = division[i].symbol;
            renderedCount++;
        }
    }
    if (!isGameOver) {
        document.getElementById("info_turn").textContent = `${chessTurn ? "チェス" : "将棋"}側のターンです`;
    }
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
document.addEventListener("DOMContentLoaded", summonboard);

//ログとかinfoとか
let log = [];//多分いつか感想戦とかできるようになるかも
function addLog(action) {
    log.push(action);
    console.log(action);
}

//制御系
let chessTurn = true;//未来の自分がchess.trueかfalseかランダムにできるようにする
let isGameOver = false;
function setChessTurn(value) {
    chessTurn = value;
}
function gameOver(){
    if(!isGameOver){
        return console.log("not gameover");
    }
    document.getElementById("info_turn").textContent = "ゲーム終了";
}

//チェック・チェックメイト判定@コパえもんに書かせたせいで中身わかんないけど動いてるからヨシ!(AA略
function getKing(chessSide) {//自陣営のkingのdivision(chessなら12.将棋なら29)を返す
    return division.find(piece => piece.rank === 'king' && piece.chess === chessSide);
}

function isSquareAttacked(axis, attackerChess) {//axisのやつがattackerChessの攻撃範囲に入ってるかt/f
    return division.some(piece => {
        return piece.chess === attackerChess && piece.axis !== 'i' && checkMovable(piece).includes(axis);
    });
}

function isKingInCheck(chessSide) {//kingがチェックかt/f
    const king = getKing(chessSide);
    return Boolean(king && king.axis !== 'i' && isSquareAttacked(king.axis, !chessSide));
}


function isCheckmate(chessSide) {//kingがチェックメイトかt/f
    function canSideEscapeCheck(chessSide) {//チェック状態から脱出できるかt/f
        return division.some(piece => {
            if (piece.chess !== chessSide || piece.axis === 'i') return false;
            return checkMovable(piece).some(target => {
                const originalAxis = piece.axis;
                const targetPiece = findPiece(target);
                const originalTargetAxis = targetPiece ? targetPiece.axis : null;

                piece.axis = target;
                if (targetPiece) targetPiece.axis = 'i';

                try {
                    return !isKingInCheck(chessSide);
                } finally {
                    piece.axis = originalAxis;
                    if (targetPiece) targetPiece.axis = originalTargetAxis;
                }
            });
        });
    }
    const king = getKing(chessSide);
    if (!king || king.axis === 'i') return true;
    if (!isKingInCheck(chessSide)) return false;
    return !canSideEscapeCheck(chessSide);
}

function simulateCheck(piece, targetAxis) {//piece,targetAxisいれれば
    function withTemporaryMove(innerPiece, innerTargetAxis, callback) {
        const originalAxis = innerPiece.axis;
        const targetPiece = findPiece(innerTargetAxis);
        const originalTargetAxis = targetPiece ? targetPiece.axis : null;

        innerPiece.axis = innerTargetAxis;
        if (targetPiece) targetPiece.axis = 'i';

        try {
            return callback();
        } finally {
            innerPiece.axis = originalAxis;
            if (targetPiece) targetPiece.axis = originalTargetAxis;
        }
    }

    return withTemporaryMove(piece, targetAxis, () => {
        const selfInCheck = isKingInCheck(piece.chess);
        const opponentChess = !piece.chess;
        const opponentCheck = isKingInCheck(opponentChess);
        return {
            selfInCheck,
            opponentCheck,
            opponentCheckmate: isCheckmate(opponentChess)
        };
    });
}

//成りとか
function Promotion(piece) {
    if (piece.rank === "pawn" && piece.chess === true) {
        piece.rank = "queen";
        piece.symbol = "♕";
    }else if(piece.rank === "pawn"||piece.rank === "lance"||piece.rank === "knight"||piece.rank === "silver" && piece.chess === false) {
        piece.rank = "gold";
        piece.symbol = "金";
    }else if (piece.rank ==="rook"&& piece.chess === false){
        piece.rank = "dragon";
        piece.symbol = "龍";
    }else if (piece.rank ==="bishop"&& piece.chess === false){
        piece.rank = "horse";
        piece.symbol = "馬";
    }
}


//コマ移動
let selectPiece = null;//findPieceでdivision[n]いれる
let legalMoves = [];//うごけるとこ["a1","b2"]みたく代入
function clicked(e){
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
                isGameOver = true;
                gameOver();
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
                isGameOver = true;
                gameOver();
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
function deleteHighlight() {//highlightをdeleteする
    document.querySelectorAll(".cell").forEach(td => td.style.backgroundColor = "");
}

//ボタン@ß終了時にたぶんかえる
function resetGame(){
    selectPiece = null;
    legalMoves = [];
    log = [];
    setChessTurn(true);
    isGameOver = false;
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
    isGameOver = true;
    gameOver();
    document.getElementById("info_move").textContent = "";
    document.getElementById("info_status").textContent = `サレンダーされました。${chessTurn ? "将棋" : "チェス"}の勝利です`;
});
export {renderPieces,setChessTurn,resetGame};