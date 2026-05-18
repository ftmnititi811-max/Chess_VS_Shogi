//動作系
import {division,yoko,summonpiece} from './piece.js';

function findPiece(axis) {//axisにコマがいるかチェック
    for (let i = 0; i < division.length; i++) {
        if (division[i].axis === axis) {
            return division[i];
        }
    }
    return null;
}

function checkMovable(piece){//コマの動きの判定
    const width = yoko.indexOf(piece.axis[0]);
    const height = parseInt(piece.axis[1]);
    let movable = [];

    function continueMove(distance){//連続移動
        distance.forEach(([dx, dy]) => {
            for (let step = 1; step < 9 ;step++){
                let ex = width + dx * step;
                let ey = height + dy * step;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    const targetAxis = yoko[ex] + ey;
                    const targetPiece = findPiece(targetAxis);
                    if(!targetPiece){//空マスへ
                        movable.push(targetAxis);
                    }else if(targetPiece.chess !== piece.chess){//敵マス
                        movable.push(targetAxis);
                        break;
                    }else break;
                }
            }
        });
    }

    if(piece.chess == true){//チェスのコマ動き制御
        switch(piece.rank){
        case "pawn":
            let nextY = height + 1;
            if (nextY <= 9 && !findPiece(piece.axis[0] + nextY)) {
                movable.push(piece.axis[0] + nextY);
                //なんか2歩動くやつ
                if (height === 2 && !findPiece(piece.axis[0] + (height + 2))) {
                    movable.push(piece.axis[0] + (height + 2));
                }
            }
            //斜めでとるやつ
            [[-1, 1], [1, 1]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (targetPiece && targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        case "rook":
            continueMove([[1,0],[-1,0],[0,1],[0,-1]]);
            break;
        case "knight":
            [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        case "bishop":
            continueMove([[1,1],[1,-1],[-1,1],[-1,-1]]);
            break;
        case "queen":
            continueMove([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
            break;
        case "king":
            [[-1,1],[0,1],[1,1],[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        }
    }else{
        switch(piece.rank){//将棋のコマ動き制御
        case "pawn":
                let nextY = height - 1;
            if (nextY > 0 && (!findPiece(piece.axis[0] + nextY) || findPiece(piece.axis[0] + nextY).chess !== piece.chess)) {
                movable.push(piece.axis[0] + nextY);
            }
            break;
        case "rook":
            continueMove([[1,0],[-1,0],[0,1],[0,-1]]);
            break;
        case "bishop":
            continueMove([[1,1],[1,-1],[-1,1],[-1,-1]]);
            break;
        case "lance":
            continueMove([[0,-1]]);
            break;
        case "knight":
            [[1, -2], [-1, -2]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        case "silver":
            [[-1, -1], [0, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        case "gold":
            [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        case "king":
            [[-1,1],[0,1],[1,1],[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        case "dragon":
            continueMove([[1,0],[-1,0],[0,1],[0,-1]]);
            [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        case "horse":
            continueMove([[1,1],[1,-1],[-1,1],[-1,-1]]);
            [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
                let ex = width + dx, ey = height + dy;
                if (ex >= 0 && ex < 8 && ey > 0 && ey <= 9) {
                    let targetPiece = findPiece(yoko[ex] + ey);
                    if (!targetPiece || targetPiece.chess !== piece.chess) {
                        movable.push(yoko[ex] + ey);
                    }
                }
            });
            break;
        }
    }
    return movable;
}
export {checkMovable,findPiece};