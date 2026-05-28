//piece制御関連
const yoko =["a","b","c","d","e","f","g","h"]
const tate =["1","2","3","4","5","6","7","8","9"]
class piece {
    constructor(chess, rank, symbol, axis) {
        this.chess = chess;
        this.rank = rank;
        this.symbol = symbol;
        this.axis = axis;
    }
}
let division = [];

//========初期設定========
function summonPiece(){//division内の配列にobjectでコマと初期座標セット
    for (let i=0; i<8; i++){
        division[i] = new piece(true,"pawn","♙",yoko[i]+"2");
    }
    //チェス
    division[8] = new piece(true,"rook","♖","a1")
    division[9] = new piece(true,"knight","♘","b1")
    division[10] = new piece(true,"bishop","♗","c1")
    division[11] = new piece(true,"queen","♕","d1")
    division[12] = new piece(true,"king","♔","e1")
    division[13] = new piece(true,"bishop","♗","f1")
    division[14] = new piece(true,"knight","♘","g1")
    division[15] = new piece(true,"rook","♖","h1")
    //将棋
    for (let i=16; i<24; i++){
        division[i] = new piece(false,"pawn","歩",yoko[i-16]+"7");
    }
    division[24] = new piece(false,"rook","飛","b8")
    division[25] = new piece(false,"bishop","角","g8")
    division[26] = new piece(false,"lance","香","a9")
    division[27] = new piece(false,"knight","桂","b9")
    division[28] = new piece(false,"silver","銀","c9")
    division[29] = new piece(false,"king","王","d9")
    division[30] = new piece(false,"gold","金","e9")
    division[31] = new piece(false,"silver","銀","f9")
    division[32] = new piece(false,"knight","桂","g9")
    division[33] = new piece(false,"lance","香","h9")
}

//========読み取り/書き換え========
function findPiece(axis) {//axisにコマがいるかチェック
    for (let i = 0; i < division.length; i++) {
        if (division[i].axis === axis) {
            return division[i];
        }
    }
    return null;
}
function getDivision() {
    return division;
}

const movePiece = (piece,to) => {//pieceをtoへうごかす
    piece.axis = to;
}
const deletePiece = (piece) =>{//pieceをヨコ座標iへ飛ばす
    piece.axis[0] = i;
}

function promotion(piece) {//成るやつ
    if (piece.rank === "pawn" && piece.chess === true) {
        piece.rank = "queen";
        piece.symbol = "♕";
    }else if((piece.rank === "pawn" || piece.rank === "lance" || piece.rank ==="knight" || piece.rank === "silver") && piece.chess === false) {
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
export {yoko, tate,
        summonPiece,
        findPiece,getDivision,
        movePiece,deletePiece,
        promotion,
        division
        };