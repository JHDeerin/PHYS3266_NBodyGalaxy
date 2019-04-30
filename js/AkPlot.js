/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * AkPlot.js    :   A lightweight plotting library
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Mon 28 Jan 2019 19:40:17 (EST)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
/*========================================================================
 * readOption
 *========================================================================
 */
function readOption(option, defaultValue, warning){
    if (option != undefined){
        return option ;
    }else{
        if (warning != undefined ){
            warn(warning) ;
            log('Warning was issued by "'+
                arguments.callee.caller.name+'"') ;
        }
        return defaultValue ;
    }
}

class Signal{
    constructor(options){


    }

}

/*=========================================================================
 * color handling
 *=========================================================================
 */
var floatToHex = function (f) { 
    var ff = Math.min(Math.floor(f*255),255) ;
    var ff = Math.max(ff,0) ;

  var hex = Number(ff).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};

var fullColorHex = function(c) {   
  var red = floatToHex(c[0]);
  var green = floatToHex(c[1]);
  var blue = floatToHex(c[2]);
  return "#"+red+green+blue;
};

function rgbToHex(r,g,b){
    return "#"+floatToHex(r/255)+floatToHex(g/255)+floatToHex(b/255) ;
}

/*========================================================================
 * Ticks
 *========================================================================
 */ 
class Ticks{
    constructor(opts={}){
        this._ticks = readOption( opts.ticks,   []              ) ;
        this._labels= readOption( opts.labels,  []              ) ;
        this._mode  = readOption( opts.mode,    'auto'            ) ;
        this._unit  = readOption( opts.unit,    ''              ) ;
        this._style = readOption( opts.style,   '#000000'       ) ;
        this._font  = readOption( opts.font,    '12pt Times'    ) ;
        this._min   = readOption( opts.min,     -1              ) ;
        this._max   = readOption( opts.max,     1               ) ;
        this._precision = readOption( opts.precision, 3         ) ;
        this._number= readOption( opts.number,  5               ) ;
        this._offset= readOption( opts.offset,  .025            ) ;
        this._plot  = readOption( opts.plot,    null            ) ;
        this._callback = function(){
            if (this.plot != null ){
                this.plot.init() ;
            }
        }
        this._ncall = null ;
        
        this.init() ;
    }
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  CONSTRUCTOR ENDS
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
    init(){
        if (this.mode == 'manual' ){
            this.number = this.labels.length ;
            if (this.ticks.length != this.labels.length ){
                warn('Number of ticks and tick labels are not equal') ;
            }
        }
        
        if (this.mode == 'auto'){
            var delta = this.delta ;
            var dl    = 1./(this.number+1) ;
            this._ticks = [] ;
            this._labels = [] ;
            for(var i=0 ; i<this.number ;i++){
                var num = delta*(i)+this.min ;
                if ( this.precision != undefined ){
                    num = num.toFixed(this.precision) ;
                }
                this.ticks.push( this.min+(i)*delta );
                this.labels.push(num+this.unit) ;
            }
        }
        this.callback() ;
    }
    
    set ncall(nc){
        this._ncall = nc ;
    }
    get ncall(){
        this._ncall ;
    }

    set callback(nc){
        this._callback = nc ;
    }
    get callback(){
        return this._callback ;
    }

    /* min          */
    set min(nm){
        this._min = nm ;
        this.init() ;
    }
    get min(){
        return this._min ;
        this.init() ;
    }

    /* max          */
    set max(nm){
        this._max = nm ;
        this.init() ;
    }
    get max(){
        return this._max ;
    }

    /* delta        */
    get delta(){
        return (this.max - this.min)/(this._number-1) ;
    }

    /* unit         */
    get unit(){
        return this._unit ;
    }
    set unit(nu){
        this._unit = nu ;
        this.init() ;
    }

    /* mode         */
    set mode(nm){
        this._mode = nm ;
        this.init() ;
    }
    get mode(){
        return this._mode ;
    }

    /* font         */
    get font(){
        return this._font ;
    }
    set font(nf){
        this._font = ft ;
    }

    /* style        */
    get style(){
        return this._style ;
    }
    set style(ns){
        this._style = ns ;
    }
    
    /* precision    */
    set precision(np){
        this._precision = np ;
        this.init() ;
    }
    get precision(){
        return this._precision ;
    }

    /* number       */
    get number(){
        return this._number ;
    }
    set number(nn){
        this._number = nn ;
        this.init() ;
        this.ncall() ;
    }
    set noTicks(nn){
        this._number = nn ;
        this.init() ;
    }

    set noDivisions(nd){
        this.noTicks = nd+1 ;
    }

    set noDivs(nd){
        this.noDivisions = nd ;
    }

    get noDivs(){
        return (this.number-1) ;
    }
    get noDoivisions(){
        return this.noDivs ;
    }
    get noTicks(){
        return this._number ;
    }
    /* offset       */
    get offset(){
        return this._offset ;
    }
    set offset(no){
        this._offset =  no ;
    }

    /* ticks        */
    get ticks(){
        return this._ticks ;
    }
    set ticks(nt){
        this._ticks = nt ;
        this.number = this._ticks.length ;
        this._mode  = 'auto' ;
        this.init() ;
    }

    /* labels       */
    get labels(){
        return this._labels ;
    }
    set labels(nl){
        this._labels = nl ;
        this.init() ;
    }

    set plot(np){
        this._plot = np ;
    }

    get plot(){
        return this._plot ;
    }

}

/*========================================================================
 * Message
 *========================================================================
 */
class Message{
    constructor( message, x,y, options){
        this._text = message ;
        this._x  = x ;
        this._y  = y ;

        this._style   = readOption( options.style,    "#000000"       ) ;
        this._font    = readOption( options.font,     "12px Times"    ) ;
        this._visible = readOption( options.visible,  true            ) ;
        this._align   = readOption( options.align ,   'start'         ) ;
    }
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  CONSTRUCTOR ENDS
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/*------------------------------------------------------------------------
 * x and y
 *------------------------------------------------------------------------
 */
    set x(xn){
        this._x = xn ;
    }
    get x(){
        return this._x ;
    }
    set y(yn){
        this._y = yn ;
    }
    get y(){
        return this._y ;
    }
  
/*------------------------------------------------------------------------
 * Font
 *------------------------------------------------------------------------
 */
    set font(ft){
        this._font = ft ;
    }
    get font(){
        return this._font ;
    }

    setFont(f){
        this.font   = readOption(font,      this._font   ) ;
    }

/*------------------------------------------------------------------------
 * setStyle
 *------------------------------------------------------------------------
 */
    set style(st){
        this._style = st ;
    }

    get style(){
        return this._style ;
    }

    setStyle(st){
        this.style  = readOption(st,    this._style  ) ;
    }

/*------------------------------------------------------------------------
 * setAlign
 *------------------------------------------------------------------------
 */
    set align(al){
        this._align = al ;
    }
    get align(){
        return this._align ;
    }
    setAlign(al){
        this.align  = readOption(al,     this._align  ) ;
    }

/*------------------------------------------------------------------------
 * setText
 *------------------------------------------------------------------------
 */
    set text(tx){
        this._text = tx ;
    }
    
    get text(){
        return this._text ;
    }

    setText(t){
        this.text = readOption(t, this._text) ;
    }
/*------------------------------------------------------------------------
 * 
 *------------------------------------------------------------------------
 */
    set visible(vs){
        this._visible = vs ;
    }
    get visible(){
        return this._visible  ;
    }

/*------------------------------------------------------------------------
 * hide
 *------------------------------------------------------------------------
 */
    hide(){
        this.visible = false ;
    }

/*------------------------------------------------------------------------
 * show
 *------------------------------------------------------------------------
 */
    show(){
        this.visible = true ;
    }

/*------------------------------------------------------------------------
 * setVisiblity
 *------------------------------------------------------------------------
 */
    setVisiblity( visible ){
        this.visible = readOption( visible, this._visible ) ;
    }

/*------------------------------------------------------------------------
 * toggleVisible
 *------------------------------------------------------------------------
 */
    toggleVisible(){
        this._visible = !this._visible ;
    }

    toggle(){
        this._visible = !this._visible ;
    }
}

/*=========================================================================
 * 
 *=========================================================================
 */
class Curve{
   constructor(p,options={}){
        this._plot = p ;
        this._color = readOption(options.color, "#000000") ;
        this._linewidth = 2 ;
        this._name = readOption(options.name, null) ;
        this.canvas = document.createElement('canvas') ;
        this._visible = readOption(options.visible, true) ;
    }
    set name(nn){
        this._name=nn ;
        this.plt.init() ;
    }

    get name(){
        return this._name ;
    }

    get title(){
        return this._name ;
    }

    set title(nt){
        this.name = nt ;
    }
    set visible(v){
        if (v==true || v=='On'||v=='on'||v=='ON'){
            this._visible = true ;
        }else{
            this._visible = false ;
        }
    }
    get visible(){
        return this._visible ;
    }

    set canvas(c){
        this._canvas = c ;
        this.context = this._canvas.getContext('2d') ;
        this.context.imageSmoothingEnabled = true ;

        this.width = this.plt.width ;
        this.height= this.plt.height ;
    }

    set context(ct){
        this._context = ct ;
    }
    get context(){
        return this._context ;
    }
    get canvas(){
        return this._canvas ;
    }

    set width(w){
        this._width = w ;
        this.canvas.width = w ;
    } 

    get width(){
        return this._width ;
    }

    set height(h){
        this._height = h ;
        this.canvas.height = h ;
    }

    get height(){
        return this._height ;
    }

    set lineWidth(w){
        this._linewidth = w ;
        this.plt.init() ;
    }

    get lineWidth(){
        return this._linewidth ;
    }
    set linewidth(w){
        this.lineWidth = w ;
    }
    get linewidth(){
        return this.lineWidth ;
    }
    get color(){
        return this._color ;
    }

    set color(nc){
        this._color = nc ;
        this.plt.init() ;
    }

    set style(ns){
        this.color = ns ;
        this.plt.init() ;
    }
    get style(){
        return this.color ;
    }

    get plt(){
        return this._plot ;
    }

    Px(x){
        return this.plt.Px(x) ;
    }

    Py(y){
        return this.plt.Py(y) ;
    }

    clear(){
        this.context.clearRect(0,0,this.width,this.height) ;
    }
    reset(){
        this.clear() ;
    }
    
    xIsOutOfBounds(x){
        if ( x<this.plt.xlimits[0] || x>this.plt.xlimits[1])
            return true ;
        else
            return false ;
    }

    yIsOutOfBounds(y){
        if ( y<this.plt.ylimits[0] || y>this.plt.ylimits[1])
            return true ;
        else
            return false ;
    }

}
/*========================================================================
 * CurveFromPoints
 *========================================================================
 */ 
class CurveFromPoints extends Curve{
    constructor(p,options){
        super(p,options) ;
        this._xp = null ;
        this._yp = null ;
    }

    get xp(){
        return this._xp ;
    }
    set xp(x){
        this._xp = x ;
    }

    get yp(){
        return this._yp ;
    }
    set yp(y){
        this._yp = y ;
    }

    reset(){
        super.reset() ;
        this.xp = null ;
        this.yp = null ;
    }

    draw(x,y){
        if (this.xp == null){
            this.xp = x ;
            this.yp = y ;
        }else{
            if (this.xIsOutOfBounds(x)||this.yIsOutOfBounds(y)){
                this.xp = null ;
                this.yp = null ;
                return ;
            }

            this.context.beginPath() ;
            this.context.moveTo(this.Px(this.xp),this.Py(this.yp)) ;
            this.context.lineTo(this.Px(x),this.Py(y) );
            this.context.strokeStyle = this.color ;
            this.context.lineWidth = this.linewidth ;
            this.context.stroke() ;
            this.xp = x ;
            this.yp = y ;

        }
        this.plt.draw() ;
    }

    plot(x,y){
        this.draw(x,y) ;
    }
}
/*========================================================================
 * CurveFromArrays
 *========================================================================
 */ 
class CurveFromArrays extends Curve{
    constructor(p,options){
        super(p,options) ;
    }

        
    draw(x,y){
        var len = x.length ;
        this.clear() ;
        if (x.length != y.length){
            console.warn('Length of the provided vectors are not the same') ;
            len = Math.min(len, y.length) ;
        }
        this.context.beginPath() ;
        this.context.lineWidth = this.linewidth ;
        this.context.strokeStyle = this.color ;
        for(var i=0 ; i<(len-1); i++){
            if (    this.xIsOutOfBounds(x[i]) || 
                    this.xIsOutOfBounds(x[i+1]) ||
                    this.yIsOutOfBounds(y[i]) ||
                    this.yIsOutOfBounds(y[i+1]) ) continue ;
            this.context.moveTo(this.Px(x[i]),this.Py(y[i])) ;
            this.context.lineTo(this.Px(x[i+1]),this.Py(y[i+1])) ;
        }
        this.context.stroke() ;
        this.plt.draw() ;
    }
    plot(x,y){
        this.draw(x,y) ;
    }
}
/*========================================================================
 * Legened
 *========================================================================
 */ 
class Legend{
    constructor(opts){
        this._separation= readOption(   opts.separation, 20   ) ;
        this._plot      = readOption(   opts.plot   , null      ) ;
        this._font      = readOption(   opts.font   , '14pt Times') ;
        this._style     = readOption(   opts.style  , "#000000" ) ;
        this._length    = readOption(   opts.length , 0.05      ) ;
        this._location  = readOption(   opts.location, [this.plot.width-140,this.plot.margins.top+20]) ;

        this.callback   = function(){
            if (this._plot != null){
                this._plot.init() ;
            }
        }
        this.visiblity  = readOption(    opts.visible, false     ) ;
    }
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  CONSTRUCTOR ENDS
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
    get plot(){
        return this._plot ;
    }
    get font(){
        return this._font ;
    }
    set font(nf){
        this._font = nf ;
        this.plot.init() ;
    }

    get length(){
        return this._length ;
    }

    get style(){
        return this._style ;
    }

    set visiblity(v){
        if ( v == true || v == 'on' || v == 'ON' || v == 'On'){
            this._visible = true ;
        }else{
            this._visible = false ;
        }
    }

    set visible(v){
            this.visiblity = v ;
            this.plot.init() ;
    }

    get visible(){
        return this._visible ;
    }

    get location(){
        return this._location ;
    }

    set location(nl){
        this._location = nl ;
        this.plot.init() ;
    }

    get separation(){
        return this._separation ;
    }
    set separation(ns){
        this._separation = ns ;
        this.plot.init() ;
    }
}

/*========================================================================
 * Margins
 *========================================================================
 */ 
class Margins{
    constructor(plt, opts={}){
        this._plot = plt ;
        this._left = readOption(opts.left, 60) ;
        this._right = readOption(opts.right, 10) ;
        this._top   = readOption(opts.top, 10) ;
        this._bottom = readOption(opts.bottom, 50) ;
    }

    get plot(){
        return this._plot ;
    }

    set plot(pl){
        this._plot = pl ;
        this.init() ;
    }
    
    init(){
        this.plot.init() ;
    }

    set left(nl){
        this._left = nl ;
        this.init() ;
    }

    set right(nr){
        this._right = nr ;
        this.init() ;
    }

    set top(nt){
        this._top = nt ;
        this.init() ;
    }

    set bottom(nb){
        this._bottom = nb ;
        this.init() ;
    }

    get top(){
        return this._top ;
    }

    get left(){
        return this._left ;
    }

    get right(){
        return this._right ;
    }

    get bottom(){
        return this._bottom ;
    }
    
}

/*========================================================================
 * 
 *========================================================================
 */ 
function getTextHeight(font) {
    return (eval(font.split('pt')[0])) ;
};

function getFontSize(font){
    return (eval(font.split('pt')[0])) ;
}

/*========================================================================
 * 
 *========================================================================
 */ 
class Label{
    constructor(plot,name,opts={}){
        this._plot  = plot ;
        this._label = name ;
        this._font  = readOption(opts.font, '12pt Times') ;
        this._color = readOption(opts.color, "#000000") ;
        this._shift = readOption(opts.shift, 0 ) ;
    }

    get shift(){
        return this._shift ;
    }

    set shift(s){
        this._shift = s ;
        this.init() ;
    }
    get style(){
        return this._color ;
    }

    get color(){
        return this._color ;
    }

    
    
    get label(){
        return this._label ;
    }
    get plot(){
        return this._plot ;
    }

    set font(f){
        this._font = f ;
        this.init() ;
    }

    get font(){
        return this._font ;
    }

    init(){
        this.plot.init() ;
    }
    set label(nl){
        this._label = nl ;
        this.init() ;
    }
}

/*========================================================================
 * LivePlot
 *========================================================================
 */ 
class Plot{
    constructor(canvas,options={}){
        if (canvas == undefined){
            console.warn('The first argument must be canvas and cannot be undefined! Returning null') ;
            return null ;
        }
        this.canvas     = canvas ;
        this._xlims     = readOption(options.xlimits,[-1,1]) ;
        this._ylims     = readOption(options.ylimits,[-1,1]) ;
        this._title     = readOption(options.title, null) ;
        this._xlabel    = readOption(options.xlabel,null) ;
        this._ylabel    = readOption(options.ylabel,null) ;

        this._xticks    = new Ticks({callback:this.init}) ;
        this._yticks    = new Ticks({callback:this.init}) ;
        this._legendOptions = readOption(options.legend,{visible: false, place: 'top-right'} ) ;
        this._curves = [] ;
        this._marginOptions= readOption(options.margins,{}) ;
        this._margins = new Margins(this, this._marginOptions) ;
        this._borders = false ;
        this._xlabelOpts =readOption(options.xlabel, {}) ;
        this._ylabelOpts =readOption(options.ylabel, {}) ;
        this._ylabelOpts.shift = readOption(this._ylabelOpts.shift,5) ;
        this._xlabel = new Label(this, 'x', this._xlabelOpts ) ;
        this._ylabel = new Label(this, 'y', this._ylabelOpts ) ;
        
        this._colors = [
            rgbToHex(57,106,177),
            rgbToHex(218,124,48) ,
            rgbToHex(62,150,81) ,
            rgbToHex(204,37,41) ,
            rgbToHex(83,81,84) ,
            rgbToHex(107,76,154) ,
            rgbToHex(146,36,40) ,
            rgbToHex(148,139,61) ,
            rgbToHex(255,255,0) ,
            rgbToHex(255,0,255) ,
            rgbToHex(0,255,255) ,
            rgbToHex(255,0,0) ,
            rgbToHex(0,255,0) ,
            rgbToHex(0,0,255) ,
        ] ; 
        this._legendOptions.plot = this ;
        this.legend = new Legend(this._legendOptions) ;


        this.grid       = readOption(options.grid, false) ;
        this.init() ;
        this.draw() ;
    }

    get xlabel(){
        return this._xlabel ;
    }
    set xlabel(nl){
        this._xlabel.label = nl ;
    }

    get ylabel(){
        return this._ylabel ;
    }

    set ylabel(nl){
        this._ylabel.label = nl ;
    }

    get margins(){
        return this._margins ;
    }
    set canvas(c){
        this._canvas = c ;
        this._context = this._canvas.getContext('2d') ;
        this._width = this.canvas.width ;
        this._height = this.canvas.height ;
        this.bcanvas = document.createElement('canvas') ;
        this.fcanvas = document.createElement('canvas') ;
    }
    get colors(){
        return this._colors ;
    }
    get noColors(){
        return this.colors.length ;
    }
    color(i){
        var index = i % this.noColors ;
        return this.colors[index] ;
    }

    get context(){
        return this._context ;
    }
  
    get canvas(){
        return this._canvas ;
    }

    get width(){
        return this.canvas.width ;
    }

    get height(){
        return this.canvas.height ;
    }

    set width(w){
        this._width = w ;
        this.canvas.width = w ;
        this.bcanvas.width = w ;
        this.fcanvas.width = w ;
    }

    set height(h){
        this._height = h ;
        this.canvas.height = h;
        this.bcanvas.height = h ;
        this.fcanvas.height = h ;
    }

    set bcanvas(nc){
        this._bcanvas = nc ;
        this._bcanvas.width = this.width ;
        this._bcanvas.height = this.height ;
        this._bcontext = this._bcanvas.getContext('2d') ;
    }

    set fcanvas(nc){
        this._fcanvas = nc ;
        this._fcanvas.width = this.width ;
        this._fcanvas.height = this.height ;
        this._fcontext = this._fcanvas.getContext('2d') ;
    }
    get fcanvas(){
        return this._fcanvas ;
    }
    get bcanvas(){
        return this._bcanvas ;
    }

    get bcontext(){
        return this._bcontext ;
    }

    get fcontext(){
        return this._fcontext ;
    }

    get back(){
        return this.bcontext ;
    }

    get fore(){
        return this.fcontext ;
    }

    get front(){
        return this.context ;
    }

    get xlims(){
        return this._xlims ;
    }
    get ylims(){
        return this._ylims ;
    }
    
    get xlimits(){
        return this._xlims ;
    }
    get ylimits(){
        return this._ylims ;
    }

    set xlims(nl){
        this._xlims =nl ;
        this.init() ;
    }
    set ylims(ny){
        this._ylims =ny ;
        this.init() ;
    }

    set xlimits(nl){
        this.xlims = nl ;
    }
    set ylimits(nl){
        this.ylims = nl ;
    }

    get xticks(){
        return this._xticks ;
    }

    get yticks(){
        return this._yticks ;
    }

    get pwidth(){
        return (this.width - this.margins.left - this.margins.right) ;
    }
    get pheight(){
        return (this.height - this.margins.top - this.margins.bottom) ;
    }
    
    Px(a){
        return (this.margins.left+(this.pwidth*(a-this.xlims[0])/(this.xlims[1]-this.xlims[0])) );
    }
    Py(a){
        return (this.margins.top+(this.pheight*(this.ylims[1]-a)/(this.ylims[1]-this.ylims[0])) );
    }

    get grid(){
        return this._grid ;
    }

    get borders(){
        return this._borders ;
    }

    set borders(nb){
        if ( nb == true || 'ON' == nb.toUpperCase() ){
            this._borders = true ;
        }else{
            this._borders = false ;
        }
        this.init() ;
    }

    set grid(gv){
        switch (gv){
            case 'on':
                this._grid = true ;
                break ;
            case 'On':
                this._grid = true ;
                break ;
            case 'ON': 
                this._grid = true ;
                break ;
            case true:
                this._grid = true ;
                break ;
            default:
                this._grid = false ;
        }
        this.init() ;
    }

    get noCurves(){
        return this.curves.length ;
    }
    processLegends(){
        if ( !this.legend.visible ){
            return ;
        }
        var loc = this.legend.location ;
        var x0 = loc[0] ;
        var y0 = loc[1] ;
        var j = 0 ;    
        
        for(var i=0 ; i <this.noCurves ;i++){
            this.fore.beginPath() ;
            this.fore.setLineDash([]) ;
            if ( this.curves[i].visible ){
                var color = this.curves[i].color ;
                this.fore.strokeStyle = this.curves[i].color ;
                this.fore.lineWidth=this.curves[i].lineWidth ;
                var x = x0 ;
                var y = y0+j*this.legend.separation ;
                this.fore.moveTo(x,y) ;

                x = x + this.legend.length*this.width ;
                this.fore.lineTo(x,y) ;
                this.fore.stroke() ;

                this.fore.font = this.legend.font ;
                this.fore.fillStyle = this.legend.style ;
                this.fore.textAlign = 'left' ;
                y += getFontSize(this.legend.font)*0.5 ;
                this.fore.fillText(this.curves[i].name, x+10,y) ;
                j++ ;
            }
        }
    }
    init(){
        this.back.setTransform(1,0,0,1,0,0) ;
        this.fore.setTransform(1,0,0,1,0,0) ;
        this.back.clearRect(0,0,this.width,this.height) ;
        this.fore.clearRect(0,0,this.width,this.height) ;

        this.front.setTransform(1,0,0,1,0,0) ;
        this.front.clearRect(0,0,this.width,this.height) ;

        this.xticks.min = this.xlims[0] ;
        this.xticks.max = this.xlims[1] ;

        this.yticks.min = this.ylims[0] ;
        this.yticks.max = this.ylims[1] ;
        
          if (this.grid){
            this.back.setLineDash([10,10]) ;
            this.back.strokeStyle = "#eaeaea" ;
            for(var i=0; i< this.xticks.ticks.length ;i++){
                this.back.beginPath();
                var x=this.Px(this.xticks.ticks[i]) ;
                this.back.moveTo(x,this.Py(this.ylims[0])) ;
                this.back.lineTo(x,this.Py(this.ylims[1]));
                this.back.stroke() ;
            }

            for (var i=0; i< this.yticks.ticks.length ;i++){
                var y = this.Py(this.yticks.ticks[i]) ;
                this.back.beginPath();
                this.back.moveTo(this.Px(this.xlims[0]),y) ;
                this.back.lineTo(this.Px(this.xlims[1]),y) ;
                this.back.stroke() ;
            }
        }
      
        this.back.setLineDash([0,0]) ;
        this.back.beginPath() ;
        this.back.strokeStyle = "#000000" ;
        this.back.moveTo(this.Px(this.xlimits[0]),this.Py(this.ylimits[0])) ;
        this.back.lineTo(this.Px(this.xlimits[1]),this.Py(this.ylimits[0])) ;
        this.back.stroke() ;

        this.back.beginPath() ;
        this.back.strokeStyle = "#000000" ;
        this.back.lineWidth = 2 ;
        this.back.moveTo(this.Px(this.xlimits[0]),this.Py(this.ylimits[0]) ) ;
        this.back.lineTo(this.Px(this.xlimits[0]),this.Py(this.ylimits[1]) ) ;
        this.back.stroke() ;

        if (this.borders){
            this.back.beginPath() ;
            this.back.lineWidth = 1 ;
            this.back.strokeStyle = '#000000' ;
            this.back.rect(this.Px(this.xlimits[0]),this.Py(this.ylimits[1]),
                    this.pwidth, this.pheight ) ;
            this.back.stroke() ;
        }


        this.back.font = this.xticks.font ;
        this.back.fillStyle = this.xticks.style ;
        this.back.textAlign = 'center' ;

        for (var i=0; i< this.xticks.ticks.length ;i++){
            var x= this.Px(this.xticks.ticks[i]) ;
            var y= this.Py(this.ylims[0]);
            this.back.beginPath() ;
            this.back.strokeStyle = "#000000" ;
            this.back.moveTo(x,y) ;
            this.back.lineTo(x,y+5) ;
            this.back.stroke() ;

            y+= 2*this.margins.bottom/5. ;
            this.back.fillText(this.xticks.labels[i],x,y) ;
        }
        
        var xl = this.margins.left + this.pwidth*0.5 ;
        var yl = this.height - this.margins.bottom/4.+this.xlabel.shift ;

        this.back.font = this.xlabel.font ;
        this.back.fillStyle = this.xlabel.color ;
        this.back.textAlign = 'center' ;
        this.back.fillText(this.xlabel.label,xl,yl) ;
        
        this.back.font = this.yticks.font ;
        this.back.fillStyle = this.yticks.style ;
        this.back.textAlign = 'end' ;

        var maxYlabelWidth = 0 ;
        for (var i=0; i< this.yticks.ticks.length ;i++){
            var x= this.Px(this.xlims[0]);
            var y= this.Py(this.yticks.ticks[i]) ;
            this.back.beginPath() ;
            this.back.strokeStyle = "#000000" ;
            this.back.moveTo(x,y) ;
            this.back.lineTo(x-5,y) ;
            this.back.stroke() ;
            x= x-10 ;
            y= y+getTextHeight(this.yticks.font)*0.5 ;
            this.back.fillText(this.yticks.labels[i],x,y) ;
            maxYlabelWidth = Math.max(maxYlabelWidth,
                    this.back.measureText(this.yticks.labels[i]).width) ;

        }
        var xl = this.margins.left -maxYlabelWidth - 15 -this.ylabel.shift ;
        var yl = this.margins.top+this.pheight*.5 ;

        this.back.font = this.ylabel.font ;
        this.back.fillStyle = this.ylabel.color ;
        this.back.textAlign = 'center' ;
        this.back.translate(xl,yl) ;
        this.back.rotate(-Math.PI/2.) ;
        this.back.fillText(this.ylabel.label,0,0) ;
        this.back.restore() ;
        this.back.setTransform(1,0,0,1,0,0) ;
        this.processLegends() ;
        this.draw() ;
    }

    get curves(){
        return this._curves ;
    }
    reset(){
        for (var i=0;i<this._curves.length;i++){
            this.curves[i].reset() ;
        }
        this.front.setTransform(1,0,0,1,0,0) ;
        this.front.clearRect(0,0,this.width,this.height) ;
        this.init() ;
    }
    draw(){
        this.front.setTransform(1,0,0,1,0,0) ;
        this.front.clearRect(0,0,this.width,this.height) ;
        this.front.drawImage(this.bcanvas,0,0) ;
        this.blend() ;
        this.front.drawImage(this.fcanvas,0,0) ;
    }

    blend(){
        for (var i=0; i<this.curves.length ; i++){
            this.front.drawImage(this.curves[i].canvas,0,0) ;
        }
    }

    addCurveFromPoints(
            opts={  name:"Curve_+"+this.noCurves,
                    color:this.color(this.noCurves)})
    {
        var nc = new CurveFromPoints(this,opts) ;
        this.curves.push(nc) ;
        this.init() ;
        return nc ;
    }
    
    addCurveFromArrays(opts={name:"Curve_"+this.noCurves}){
        var nc = new CurveFromArrays(this,opts) ;
        this.curves.push(nc) ;
        this.init() ;
        return nc ;
    }
}
