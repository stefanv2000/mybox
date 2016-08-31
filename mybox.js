var MyBox = new Class({
	Implements:Options,
	options: {
		resizeDuration: 600,
		resizeTransition: Fx.Transitions.Circ.easeOut,
		initialWidth: 250,
		initialHeight: 250,
		padding: 10,
		animateCaption: true,
		counter: "Image {NUM} of {TOTAL}",
		offset : 10,
		relname : 'xbox'
	},
	initialize: function(options){
		this.setOptions(options);
		
		this.imageLinksAll = $$('a[rel^='+ this.options.relname +']');
		
		this.imageLinksAll.each(function(link){
			link.store('caption',link.get('title'));
			link.addEvent('click', this.open.bindWithEvent(this,link));
		},this);
		
		this.initElements();
		
		this.initEffects();
		
	},
	
	
	initElements: function(){
		this.overlay = new Element('div',{
			id:'mybOverlay',
			events : {
				'click' : this.close.bindWithEvent(this)
			}
		}).inject(document.body,'top');
		
		this.container = new Element('div',{
			id :'mybBox',
			styles: {
				width: this.options.initialWidth,
				height: this.options.initialHeight,
				marginLeft: -(this.options.initialWidth/2),
				position:'absolute'
			}
		}).inject(document.body,'top');
		
		
		this.nextLink = new Element ('a',{
			id: 'mybNext',
			'href' : '#',
			events: {
				click: this.changeImage.bindWithEvent(this,1)
			}
		});

		this.prevLink = new Element ('a',{
			id: 'mybPrev',
			'href' : '#',
			events: {
				click: this.changeImage.bindWithEvent(this,1)
			}
		});		
		
		this.stage = new Element('div',{
			id: 'mybStage'
		});
		
		this.bottom = new Element('div',{
			id: 'mybBottom'
		});
		
		$$(this.nextLink,this.prevLink,this.stage,this.bottom).inject(this.container);
		
		this.close = new Element('div',{
			id: 'mybClose',
			events: {
				click: this.close.bindWithEvent(this)
			}
		});
		
		this.caption = new Element('div',{
			id:'mybCaption'
		});
		
		this.counter = new Element('div',{
			id: 'mybCounter'
		});
		
		$$(this.close,this.caption,this.counter).inject(this.bottom);
		
	},
	
	
	initEffects: function() {
		this.fxOverlay = new Fx.Tween(this.overlay,{
			property: 'opacity' 
		});
		
		this.fxResize = new Fx.Morph(this.container, {
				duration: this.options.resizeDuration,
				transition: this.options.resizeTransition
		});
		
		this.fxShow = new Fx.Tween(this.stage, {
				property: "opacity"
			});
		this.fxBottom = new Fx.Tween(this.bottom, {
				property: "top",
				duration: 400
			})
	},
	
	
	open : function(event, link){
		event.stop();
		
		this.imageLinks = [];
		if (link.get('rel') == this.options.relname) this.imageLinks[0] = link; 
			else {
				var imgIndex = 0;
				this.imageLinksAll.each(function(imgLink){
					if (imgLink.get('rel') == link.get('rel')) {
						this.imageLinks[imgIndex++] = imgLink;
					}
				}.bind(this));
			}
				
		var size= window.getSize();
		var scroll = window.getScroll();
		var scrollSize = window.getScrollSize();
		
		var topOffset = scroll.y + this.options.offset;
		
		this.overlay.setStyles({
			opacity : 0,
			display : 'block',
			width : scrollSize.x,
			height : scrollSize.y
		});
		
		this.container.setStyles({
			display: 'block',
			top: topOffset
			//todo set iniitial width and height
		});
		
		this.fxOverlay.start(0.8);
		this.loadImage(link);
		return false;
	},
	
	start:function(){
	},
	
	loadImage : function(link){
		
		this.stage.addClass('loading');
		this.stage.setStyle('display','block');
		this.stage.empty();
		
		this.nextLink.setStyle('display','none');
		this.prevLink.setStyle('display','none');
		this.bottom.setStyle('opacity','0');
		
		var loadImage = new Asset.image(link.get('href'),{
			'onload' : function(){
			this.imageChangeEffects();
			}.bind(this)
		});
		
		this.currentImage = loadImage;
		this.currentLink = link;
		
	},
	
	changeImage : function(event, step) {
		event.stop();
		
		var currentImageIndex = this.imageLinks.indexOf(this.currentLink);
		currentImageIndex = currentImageIndex + step;
		if (currentImageIndex<0) currentImageIndex = this.imageLinks.length-1;
		if (currentImageIndex>= this.imageLinks.length) currentImageIndex = 0;
		this.fxResize.cancel();
		this.fxShow.cancel();
		this.fxBottom.cancel();
		
		this.loadImage(this.imageLinks[currentImageIndex]);
		
		
	},
	
	imageChangeEffects : function() {		
	
		var nwidth = this.currentImage.width + this.options.padding*2;
		var nheight = this.currentImage.height + this.options.padding*2;
		
		/**
		resize overlay if image width/height is larger then current overlay width/height
		//*/
		//var tmHeight = this.container.getTop() + nheight + this.options.offset + this.bottom.getSize().y;
		
		//if (this.overlay.getScrollSize().y < tmHeight) this.overlay.setStyle('height', '' + tmHeight );
		
		//var tmWidth = nwidth + 2 * this.options.offset;
		//if (this.overlay.getScrollSize().x < tmWidth) this.overlay.setStyle('width', '' + tmWidth);
		
		
		this.nextLink.setStyle('height', nheight );		
		this.prevLink.setStyle('height', nheight );				
				
		

		this.fxResize.start({
			width : nwidth,
			height: nheight,
			marginLeft: -(this.currentImage.width/2)
		}).chain(function(){
			this.stage.removeClass('loading');
			this.stage.set('opacity',0);
			this.currentImage.setStyle('margin',this.options.padding);
			this.currentImage.inject(this.stage);
			
			this.fxShow.start(1).chain(function(){
				this.nextLink.setStyle('display','block');
				this.prevLink.setStyle('display','block');
				
				this.caption.set('text', this.currentLink.get('title'));
				
				var substitution = {NUM: ''+(this.imageLinks.indexOf(this.currentLink) + 1),TOTAL: ''+this.imageLinks.length};
				this.counter.set('text',this.options.counter.substitute(substitution));
				
				var elBottomHeight = this.bottom.getSize().y;
				this.bottom.setStyles({
					opacity: 1,
					top : -elBottomHeight
				})
				this.fxBottom.start(0).chain(function(){
					var tmHeight = this.container.getTop() + this.container.getSize().y + this.options.offset +this.bottom.getSize().y;
		
					//if (this.overlay.getSize().y < tmHeight) this.overlay.setStyle('height', '' + tmHeight );
		
					var tmWidth = this.container.getSize().y + 2 * this.options.offset;
					//if (this.overlay.getSize().x < tmWidth) this.overlay.setStyle('width', '' + tmWidth);					
					
				}.bind(this));
			}.bind(this));
		}.bind(this));
		
		
	},
	
	close : function() {
		this.container.setStyle('display','none');
		this.overlay.fade('out');
	}
})