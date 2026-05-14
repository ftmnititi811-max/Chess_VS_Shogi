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
}

function summonboard() {//domでボードつくる
    let board = document.getElementById("board");
    board.innerHTML = "";
    document.getElementById("info").textContent = ""
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
window.summonboard = summonboard;//なにこれ?

//ログとかinfoとか
let log = [];//多分いつか感想戦とかできるようになるかも
function addLog(action) {
    log.push(action);
    console.log(action);
}
document.getElementById("info3").textContent = `チェス側のターンです`;


//制御系
let chessTurn = true;//未来の自分がchess.trueかfalseかランダムにできるようにする
let gameOver = false;

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

//コマ移動
let selectPiece = null;//findPieceでdivision[n]いれる
let legalMoves = [];//うごけるとこ["a1","b2"]みたく代入
function clicked(e){
    const clickedId = e.currentTarget.id;   
    if(gameOver){
        document.getElementById("info").textContent = "ゲームは終了しています";
        return;
    }
    if(selectPiece){//2ndclicked
        if(selectPiece.axis === clickedId){//同じとこ選択=>解除
            document.getElementById("info").textContent = "選択が解除されました";
            document.getElementById("info2").textContent = "";
            document.getElementById("info3").textContent = "";
            selectPiece = null;
            deleteHighlight();
        }else if(legalMoves.includes(clickedId)){//動けるとこ選択
            const moveResult = simulateCheck(selectPiece, clickedId);
            if (moveResult.selfInCheck){//チェック解除しない手を選択
                document.getElementById("info").textContent = "その手はチェック/王手を解除できません";
                document.getElementById("info2").textContent = "";
                document.getElementById("info3").textContent = "";
                selectPiece = null;
                legalMoves = [];
                deleteHighlight();
                return;
            }
            const targetPiece = findPiece(clickedId);
            let info2Text = "";
            if(targetPiece && targetPiece.chess !== selectPiece.chess){//敵コマ撃破
                const defeatedSymbol = targetPiece.symbol;
                targetPiece.axis = "i";
                info2Text = (defeatedSymbol || "不明") + "を撃破しました";
            }
            selectPiece.axis = clickedId;//axis値代入して移動処理
            document.getElementById("info").textContent = "コマを" + clickedId + "に移動しました";
            if (moveResult.opponentCheckmate) {
                info2Text = info2Text ? `${info2Text} チェックメイト！` : "チェックメイト！";
                document.getElementById("info3").textContent = "チェックメイト！ゲーム終了";
                gameOver = true;
            } else {
                if (moveResult.opponentCheck) {
                    info2Text = info2Text ? `${info2Text} チェックです` : "チェックです";
                }
                chessTurn = !chessTurn;
                document.getElementById("info3").textContent = `${chessTurn? "チェス" : "将棋"}側のターンです`;
            }
            document.getElementById("info2").textContent = info2Text;
            addLog(selectPiece.symbol + clickedId);
            selectPiece = null;
            legalMoves = [];
            renderPieces();
            deleteHighlight();
        }else{//違うとこ選択
            document.getElementById("info").textContent = "そこには移動できません";
            document.getElementById("info2").textContent = "";
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
                document.getElementById("info").textContent = "コマを選択しました";
            }else {//↑=false
                document.getElementById("info").textContent = "相手のターンです";
            }
        }else {//↑=false
            document.getElementById("info").textContent = "コマを選択してください";
        }
    }
}
function deleteHighlight() {//highlightをdeleteする
    document.querySelectorAll(".cell").forEach(td => td.style.backgroundColor = "");
}

//リセットボタン
const button = document.querySelector("#reset");
button.addEventListener("click", () => {
    selectPiece = null;
    legalMoves = [];
    log = [];
    chessTurn = true;
    gameOver = false;
    summonpiece();
    renderPieces();
    deleteHighlight();
    document.getElementById("info").textContent = ""
    document.getElementById("info2").textContent = "";
    document.getElementById("info3").textContent = `チェス側のターンです`;
});
export {renderPieces,chessTurn};