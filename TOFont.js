
import opentype from "opentype.js"

function TOFont (fontList,callback) {
    this.fontList = {};
    this.notdef;
    this.emoji;
    this.isReady = false;
    
    this.loadFonts = function(toFont,fontList,index,callback){
        if (index < fontList.length){
            var path = fontList[index];
            opentype.load(path,function(error,font){
                if (error){
                    callback(error);
                }else{
                    toFont.fontList[path] = font;
                    toFont.loadFonts(toFont,fontList,index+1,callback);
                }
            });
            
        }else{
            //加载补充错误字体
            opentype.load("./notdef.ttf",function(error,font){
                if (error){
                          callback(error);
                }else{
                          toFont.notdef= font;
                          toFont.emoji = new TOEmojiFont();
                          toFont.emoji.load(function(error){
                                            if(!error){
                                                this.isReady = true;
                                            }
                                            callback(error);
                                        });
                          
                }
            });
        }
    };
    this.readGlyph = function(char){
        for (var item in this.fontList){
            var glyph = this.fontList[item].charToGlyph(char)
            if (glyph.unicode != undefined){
                return glyph;
            }
        }
        
        var glyph = this.emoji.charToGlyph(char);
        if (glyph){
            return glyph;
        }
        return this.notdef.charToGlyph(char);
    };
    
    
    this.loadFonts(this,fontList,0,function(error){
                   callback(error);
                   });
    
};
function TOParagraph (str,font,width,fontSize) {
    if(!fontSize){
        fontSize = 14;
    }
    
    this.str = str;
    this.font = font;
    this.width = width;
    this.fontSize = fontSize;
    
    this.readLines = function (width){
        var strArr = Array.from(this.str);
        var lines = [];
        var linePaths = [];
        var lineWidth = 0;
        var lineStr = "";
        
        for (i=0;i<strArr.length;i++){
            tempStr = strArr[i];
            //换行符处理
            if (tempStr == "\n"){
                lines.push(new TOLine(this.font, fontSize, lineStr));
                linePaths = [];
                lineWidth = 0;
                lineStr = "";
                continue;
            }
            
            glyph = this.font.readGlyph(tempStr);
            
            if (!glyph){
                continue;
            }
            
            path = glyph.getPath(0, 0, this.fontSize);
            box = path.getBoundingBox();
            if (lineWidth + box.x2 < width){
                lineWidth += box.x2;
                linePaths.push(path);
                lineStr += tempStr;
            }else{
                lines.push(new TOLine(this.font, fontSize, lineStr));
                linePaths = [];
                lineWidth = 0;
                lineStr = "";
            }
        }
        if (lineStr.length > 0){
            lines.push(new TOLine(this.font, fontSize, lineStr));
        }
        
        return lines;
    }
    
    
    this.lines = this.readLines(this.width);
    
    this.getSize = function (){
        var height = 0;
        for (var key in this.lines){
            var line = this.lines[key];
            height += line.getSize().height;
            height += this.fontSize/2;
        }
        if (height == 0){
            height = this.fontSize;
        }
//        width = Math.ceil(width);
//        height = Math.ceil(height);
        return {"width":this.width,"height":height};
    }
    
    this.draw = function(ctx, x, y, scale){
        if(!x){
            x=0;
        }
        if(!y){
            y=0;
        }
        if(!scale){
            scale=2.0;
        }

        for (var key in this.lines){
            var line = this.lines[key];
            var lineHeight = line.getSize().height;
            
            y += lineHeight;
            line.draw(ctx, x ,y,scale);
            y += this.fontSize/2;
        }
    }
};

function TOLine (font,fontSize,lineStr) {
    this.lineStr = lineStr;
    this.font = font;
    this.fontSize = fontSize;
    this.getSize = function (){
        var strArr = Array.from(this.lineStr);
        var width = 0,height = 0;
        for (i=0;i<strArr.length;i++){
            tempStr = strArr[i];

            glyph = this.font.readGlyph(tempStr);
            if (!glyph){
                continue;
            }
            path = glyph.getPath(0, 0, this.fontSize);
            box = path.getBoundingBox();
            
            if (-box.y1 > height){
                height = -box.y1;
            }
            width += box.x2;
        }
        
        return {"width":width,"height":height};
    };
    this.draw = function (ctx, x, y, scale){
        if(!x){
            x=0;
        }
        if(!y){
            y=0;
        }
        if(!scale){
            scale=2.0;
        }
        x = x *scale;
        y = y *scale;
        var strArr = Array.from(this.lineStr);
        
        for (i=0;i<strArr.length;i++){
            tempStr = strArr[i];
            glyph = this.font.readGlyph(tempStr);
            if (!glyph){
                continue;
            }
            path = glyph.getPath(x, y, this.fontSize *scale);
            path.draw(ctx)

            box = path.getBoundingBox();
            x = box.x2;
        }
    }
}
export default TOFont;
export default TOParagraph;
export default TOLine;