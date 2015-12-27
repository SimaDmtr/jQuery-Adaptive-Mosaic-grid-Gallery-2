function rand(f,t){
	return Math.floor(Math.random()*(t-f+1))+f;
}
function randimg(){
	return 'http://placehold.it/'+rand(200,400)+"x"+rand(200,400);
}
var IMAGES = Array(8);
for (var i=0; i<8; i++){
	var img = randimg();
	IMAGES[i] = {src: img, attr:{href: img, target: '_blank'}, data:{id: i, title: "immagine "+(i+1)}};
}

$(function(){
	
	//first gallery: add images from array (IMAGES)
	var G1lb = new imageLightbox();
	var G1 = $('#gallery').adaptiveGallery({
		pad: 3,
		maxD: 300,
		minN: 1,
		popSpeed: 200,
		onAdd: function(a){
			G1lb.addToGallery(a);
		},
		imgs: IMAGES
	});
	$('#loadOther').click(function(){
		var imgs = [randimg(), randimg(), randimg()];
		G1[0].adaptiveGallery.add([
			{src: imgs[0], attr:{href: imgs[0], target: '_blank'}, data:{title: "(added)"}},
			{src: 'img/nonexistent.png'},//test for error onload
			{src: imgs[1], attr:{href: imgs[1], target: '_blank'}, data:{title: "(added)"}},
			{src: imgs[2], attr:{href: imgs[2], target: '_blank'}, data:{title: "(added)"}}
		])
	});
	
	//second gallery: this has already images in container
	var G2 = $('#gallery2')
	.imageLightbox()
	.adaptiveGallery({
		pad: 5,
		maxD: 200,
		minN: 2,
		popSpeed: 0,
		onAdd: function(a){
			G2[0].lightbox.addToGallery(a);
		}
	});
	$('#loadOther2').click(function(){
		var img = 'img/img0'+Math.floor(Math.random()*9)+'.png';
		G2[0].adaptiveGallery.add([
			{src: img, attr:{href: img, target: '_blank'}, data:{title: "(added)"}}
		])
	});
	
});