import {division} from "./piece.js";
import {checkMovable,findPiece} from "./definemove.js";
//ログとかinfoとか
//多分いつか感想戦とかできるようになるかも
function addLog(action) {
    console.log(action);
}

//制御系
let chessTurn = true;//未来の自分がchess.trueかfalseかランダムにできるようにする
let isGameOver = false;
function setChessTurn(value) {
    chessTurn = value;
}
function setGameOver(value){
    isGameOver = value;
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

//制御...?
function Promotion(piece) {//成るやつ
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
export {setChessTurn,chessTurn,setGameOver,addLog,simulateCheck,Promotion,isGameOver};