//左から順にa~h　下から順に0~9でid
const yoko =["a","b","c","d","e","f","g","h"]

class piece {
    constructor(chess, rank, symbol, axis) {
        this.chess = chess;
        this.rank = rank;
        this.symbol = symbol;
        this.axis = axis;
    }
}
let division = [];
function summonpiece(){//division内の配列にobjectでコマと初期座標セット
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
export { division, yoko, summonpiece };