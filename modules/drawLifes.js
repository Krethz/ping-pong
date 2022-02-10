export class DrawLifes{
    constructor(_ctx, _canvas, _lives, _x){
        this.ctx = _ctx;
        this.lives = _lives;
        this.canvas = _canvas;
        this.x = _x;
    }

    printLifes(){
        this.ctx.font = '20px Comic-sans';
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fillText("Lives: " + this.lives, this.canvas.width - this.x, 20);
    }
}