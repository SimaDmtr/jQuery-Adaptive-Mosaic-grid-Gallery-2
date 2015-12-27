/*
* Autoadapt Mosaic Grid Gallery - jQuery plugin
* @version 2.3
* @copyright 2016, Nereo Costacurta [MadeByCambiamentico]
* @site: http://cambiamentico.altervista.org
*
* @license: GPLv3 (https://www.gnu.org/licenses/gpl.html)
* free for non-commercial use.
* for commercial use, a little donation is welcome.
*/

(function(){

//load image function
function aaLoadImage(src,onsuccess,onerror,onalways){
	var img = new Image();
	img.onload = function(){
		if (onsuccess) onsuccess(img);
		if (onalways) onalways();
	}
	img.onerror = function(){
		if (onerror) onerror();
		if (onalways) onalways();
		return false;
	}
	img.src = src;
}

function aaGetOverlayLightBox(img,onadd){
	//careful: attr and data should be at least empty objects!
	img = $.extend({attr:{}, data:{}}, img);
	var a = $('<a>').attr(img.attr);
	$.each(img.data,function(k,v){
		a.attr('data-'+k,v);
	});
	var o = $('<div class="overlay">').text(img.attr.title || img.data.title || " ");
	onadd(a);
	return a.append(o);
}

function noop(){};


function aaGY(self, opt){
	if (!self.length) return false;//no container found!
	opt = $.extend({
		pad:5,
		maxD:1000,
		minN:1,
		popSpeed:200,
		onAdd:noop,
		imgs:null /* array containing:
			{
				src: [string] //the image path
				attr: {href: [string], title: [string]} //the attributes (href, title etc.)
				data: {lightbox: [string], title: [string]} //object containing data to append
			}
		*/
	},opt);
	//-----------------------
	//variabili necessarie
	var aaADjust = 1;
	var toLoad;
	var lastheadimage = 0;
	var lastimage = 0;
	var W = Math.ceil(self.innerWidth())-aaADjust;
	//console.log('calculated container inner-width W = '+W);
	var H;
	//-----------------------
	//recupero le immagini presenti nel box se non sono passate
	var useExistentImg = false;
	if (!opt.imgs){
		var $boxes = self.find('.box');
		if (!$boxes.length) return false;//no images found!
		useExistentImg = true;
		opt.imgs = new Array($boxes.length);
		$boxes.each(function(k){
			var vimg = $(this).find('img');
			if (!vimg.length) $(this).remove();
			else opt.imgs[k] = {box: $(this), img : vimg[0], src : vimg[0].src}
		});
	}
	//-----------------------
	//carico le immagini
	toLoad = opt.imgs.length;
	//console.log("images to load = "+toLoad);
	self.append('<div class="loader"><p></p></div>').addClass('loading');
	$.each(opt.imgs,function(k,v){
		aaLoadImage(v.src,
		//on success
		function(img){
			toLoad--;
			opt.imgs[k].wi = img.width;
			opt.imgs[k].width = img.width;
			opt.imgs[k].hi = img.height;
			opt.imgs[k].height = img.height;
			opt.imgs[k].ar = img.width/img.height;
			if (!useExistentImg){
				var $overlay = $('<div class="overlay">').html(typeof opt.imgs[k].attr.title === 'string' ? opt.imgs[k].attr.title : "");//text or allow html?
				opt.imgs[k].box = $('<div class="box">').append(aaGetOverlayLightBox(opt.imgs[k],opt.onAdd)).append(img)
			}
		},
		//on fail
		function(){
			toLoad--;
			if (useExistentImg) opt.imgs[k].box.remove();
			opt.imgs[k] = null;
		},
		//always
		function(){
			if (!toLoad){
				self.removeClass('loading');
				if (!useExistentImg){
					for (var i=0;i<opt.imgs.length;i++){
						if (opt.imgs[i] === null) continue;
						self.append(opt.imgs[i].box);
					}
				}
				adapt_h();
			}
		})
	});
	//-----------------------
	//funzione per animazione immagine
	function popImage(){
		if (lastimage < opt.imgs.length){
			while(lastimage < opt.imgs.length){
				if (opt.imgs[lastimage] !== null){
					opt.imgs[lastimage].box.addClass('show');
					lastimage++;
					break;
				}
			}
			setTimeout(function(){
				popImage();
			},opt.popSpeed)
		}
	}
	//-----------------------
	//adatto le immagini
	function adapt_h(){
		//console.log('adapting from '+lastheadimage);
		H = opt.maxD;
		var min;
		var w = 0;
		var ar = 0;
		var pw;//w + paddings
		var count = 0;
		var countfrom = lastheadimage;
		var counttot = 0;
		for (var i=lastheadimage;i<opt.imgs.length;i++){
			counttot++;
			//console.log('evaluating image '+i+'; current H = '+H);
			if (opt.imgs[i] === null) continue;
			count++;
			opt.imgs[i].box.removeClass('first last');
			//adattamento all'altezza minore
			//update min H, in case update w
			if (opt.imgs[i].height < H){
				H = opt.imgs[i].height;
				min = i;
				//update all width
				w = 0;
				for (var k=countfrom;k<=i;k++){
					if (opt.imgs[k] === null) continue;
					opt.imgs[k].wi = Math.round(opt.imgs[k].width*H/opt.imgs[k].height);
					w += opt.imgs[k].wi;
				}
			}
			else{
				opt.imgs[i].wi = Math.round(opt.imgs[i].width*H/opt.imgs[i].height);
				w += opt.imgs[i].wi;
			}
			//control full row
			pw = w+(count-1)*opt.pad;
			//console.log('pw = '+pw+", W = "+W)
			ar += opt.imgs[i].ar;
			//--------------------------------------------------------------
			//fill FULL ROW
			if ((pw >= W && (count >= opt.minN || countfrom+counttot === opt.imgs.length))){
				//resize h
				H = (W-(count-1)*opt.pad)/ar;
				w = 0;
				for (var k=countfrom;k<countfrom+counttot;k++){
					if (opt.imgs[k] === null) continue;
					opt.imgs[k].wi = Math.round(opt.imgs[k].width*H/opt.imgs[k].height);
					w += opt.imgs[k].wi;
				}
				//browsers don't paly well with decimal pixel. rounding them causes a row wider than container (or smaller), so we allocate evenly the gap
				var dw = (w+(count-1)*opt.pad) - W;
				//console.log("dw = "+dw+", images to patch = "+count);
				//console.log('total width not patched = '+(w+(count-1)*pad));
				if (dw > 0){
					for (var k=countfrom;k<countfrom+dw && k<countfrom+counttot;k++){
						if (opt.imgs[k] === null) continue;
						opt.imgs[k].wi--;
					}
				}
				for (var k=countfrom;k<countfrom+counttot;k++){
					if (opt.imgs[k] === null) continue;
					opt.imgs[k].box.css({
						width: opt.imgs[k].wi+'px',
						height: H+'px'
					});
				}
				//add class for first and last image
				opt.imgs[countfrom].box.addClass('first');
				opt.imgs[countfrom+counttot-1].box.addClass('last');
				//reset counter for next row
				lastheadimage = countfrom;
				countfrom += counttot;
				counttot = 0;
				count = 0;
				w = 0;
				ar = 0;
				H = opt.maxD;
			}
			//--------------------------------------------------------------
			//fill NOT FULL ROW
			//if there's no other opt.imgs...
			else if (countfrom+counttot === opt.imgs.length){
				//console.log("last row not fillable...");
				//console.log("H = "+H)
				for (var k=countfrom;k<opt.imgs.length;k++){
					if (opt.imgs[k] === null) continue;
					opt.imgs[k].box.css({
						width: opt.imgs[k].wi+'px',
						height: H+'px'
					});
				}
				//add class for first and last image
				opt.imgs[countfrom].box.addClass('first');
				opt.imgs[opt.imgs.length-1].box.addClass('last');
				lastheadimage = countfrom;
			}
			if (countfrom+counttot === opt.imgs.length) setTimeout(popImage,20);
		}
	}
	$(window).on('resize.aagallery',function(){
		lastheadimage = 0;
		tempW = Math.round(self.innerWidth())-aaADjust;
		if (W !== tempW){
			W = tempW;
			adapt_h();
		}
	})
	
	this.add = function(aImgs){
		if (toLoad) return false;
		//-----------------------
		//carico le immagini
		self.addClass('loading');
		toLoad = aImgs.length;
		//console.log("adding "+toLoad+" images...");
		//console.log("images to load = "+toLoad);
		$.each(aImgs,function(k,v){
			aaLoadImage(v.src,
			//on success
			function(img){
				toLoad--;
				opt.imgs.push({
					src: img.src,
					wi: img.width,
					width: img.width,
					hi: img.height,
					height: img.height,
					ar: img.width/img.height,
					box: $('<div class="box">').append(aaGetOverlayLightBox(v,opt.onAdd)).append(img)
						.appendTo(self)
				});
				//console.log("succesfully added an image");
			},
			//on fail
			function(){
				toLoad--;
				//console.log("an image couldn't be retrieved");
			},
			//always
			function(){
				if (!toLoad){
					self.removeClass('loading');
					adapt_h();
				}
			})
		});
	}
}

$.fn.adaptiveGallery = function(opt){
	return this.each(function(){
		this.adaptiveGallery = new aaGY( $(this), opt)
	});
}

})();