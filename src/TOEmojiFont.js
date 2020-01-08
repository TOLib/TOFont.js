
function TOEmojiFont (){
    this.image = null;
    this.charToGlyph = function(char){
        var rect = TOEmojiLib[char];
        if (rect){
            return new TOEmojiGlyph(rect.x,rect.y,rect.w,rect.h,this.image);
        }
        return null;
        
    };
    this.load = function(callback){
        this.image = new Image();
        this.image.onload = function(){
            callback(null);
        }
        this.image.onerror = function(error){
            callback(error);
        }
        this.image.src = "./emoji.png";
    }
}

function TOEmojiGlyph(x,y,width,height,image){
    this.rect = {x:x,y:y,height:height,width:width};
    this.image = image;
    this.getPath = function(x,y,fontSize){
        return new TOEmojiPath (this.rect,x,y,fontSize,this.image);
    }
}

function TOEmojiPath(rect,x,y,fontSize,image){
    this.image = image;
    this.rect = rect;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    
    this.getBoundingBox = function (){
        return {
            x1:x,
            x2:x + rect.width / 100 * fontSize ,
            y1: fontSize*0.3 - rect.height / 100 * fontSize,
            y2: fontSize*0.3
        }
    }
    
    this.draw = function(ctx){
        var width = rect.width / 100 * fontSize;
        var height = rect.height / 100 * fontSize
        ctx.drawImage(this.image,rect.x,rect.y,rect.width,rect.height,x,y-height + fontSize *0.3,width,height);
    }
}

export default TOEmojiFont;
export default TOEmojiGlyph;
export default TOEmojiPath;