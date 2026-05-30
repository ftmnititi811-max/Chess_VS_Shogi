//内部処理系(ターン管理とか)
import {checkMovable} from "./definemove.js";
import { deleteHighlight, renderPieces , messageMove , messageStatus } from "./graphics.js";
import {findPiece,getDivision, summonPiece} from "./piece.js"

//========初期化========
const startGame=()=>{
    console.clear();
    setChessTurn(true);
    setGameOver(false);
    summonPiece();
    renderPieces();
    deleteHighlight();
    messageMove(null);
    messageStatus(null);
}

//========ログとか=======
function addLog(action) {//多分いつか感想戦とかできるようになるかも
    console.log(action);
}

//========ターン制御系========
let chessTurn = true;//未来の自分がchess.trueかfalseかランダムにできるようにする
let isGameOver = false;
function setChessTurn(value) {
    chessTurn = value;
}
function setGameOver(value){
    isGameOver = value;
}
const getGameOver=()=>{
    return isGameOver;
}
const getChessTurn=()=>{
    return chessTurn;
}

/*========チェック・チェックメイト判定========
コパえもんに書かせたせいで中身わかんないけど動いてるからヨシ!(AA略 vite移行前にはリファクタします*/
function getKing(chessSide) {//自陣営のkingのdivision(chessなら12.将棋なら29)を返す
    const division =getDivision();
    return division.find(piece => piece.rank === 'king' && piece.chess === chessSide);
}

function isSquareAttacked(axis, attackerChess) {//axisのやつがattackerChessの攻撃範囲に入ってるかt/f
    const division =getDivision();
    return division.some(piece => {
        return piece.chess === attackerChess && piece.axis !== 'i' && checkMovable(piece).includes(axis);
    });
}

function isKingInCheck(chessSide) {//kingがチェックかt/f
    const king = getKing(chessSide);
    return Boolean(king && king.axis !== 'i' && isSquareAttacked(king.axis, !chessSide));
}


function isCheckmate(chessSide) {//kingがチェックメイトかt/f
    const division =getDivision();
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
    const division =getDivision();
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

export {setChessTurn,setGameOver,addLog,simulateCheck,getGameOver,getChessTurn,startGame};