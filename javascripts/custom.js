var M = {}; 
M.loader = $('#ajax_wrap, #ajax_loader');
M.loadCount = 0;
M.loadCheck = function(){
	if ( this.loadCount > 0 ){
		this.loader.show();
	}
	else
	{
		this.loader.hide();
	}
}
M.init = function(){
	/*M.etsy.init();
	$('#etsy .more').click(function(){
		M.etsy.more();
	});*/
	
	M.write.get();
	$('#write .more').click(function(){
		M.write.get();
	});
	
	M.art.get();
	$('#art .more').click(function(){
		M.art.get();
	});
	
	$('.home').click(function(){
		M.nav.home();
	});
	
	if ( $('.mobNav').css('display') == 'block' ){
		if (History.getState().cleanUrl == "http://catandglove.com/"){
			router.navigate('/write');
		}
	}
	
	$('[show]:not(.prep)').addClass('prep').click(function(){
		var show = $(this).attr('show');
		router.navigate('/'+show);
		$('[show].act').removeClass('act');
		$('[show='+show+']').addClass('act');
	});
	router.checkRoutes(History.getState());
}

/*M.etsy = {};
M.etsy.items = {};
M.etsy.page = 0;
M.etsy.limit = 10;
M.etsy.isMore = true;
M.etsy.get = function(){
	if ( M.etsy.isMore ){
		limit = M.etsy.limit;
		var offset = M.etsy.page*limit;
		var url = 'http://openapi.etsy.com/v2/shops/catandglove/listings/active.js?callback=getData&api_key=3lrt6kdjs0ppzxvxj1ypo0m4&includes=Images&limit='+limit+'&order=date_desc&offset='+offset;
		M.loadCount++;
		M.loadCheck();
		$.ajax({
		url:url,
		dataType: 'jsonp'
		}).done(function(data){
			M.loadCount--;
			M.loadCheck();
			if (data.ok){
			M.etsy.page++;
			var count = 0;
				for (x in data.results)
				{
					count++;
					var result = data.results[x];
					if (M.etsy.items[result.listing_id] == undefined){
						M.etsy.items[result.listing_id] = result;
					}
				}
				if ( count < limit ) { M.etsy.isMore = false;}
				M.etsy.render();
			}
			else
			{

			}
		})
		.fail(function(){
		M.loadCount--;
		M.loadCheck();
		});
	}
}
M.etsy.getSingle = function(id){
	var url = 'http://openapi.etsy.com/v2/listings/'+id+'.js?callback=getData&api_key=3lrt6kdjs0ppzxvxj1ypo0m4&includes=Images';
	M.loadCount++;
	M.loadCheck();
	$.ajax({
	url:url,
	dataType: 'jsonp'
	}).done(function(data){
		M.loadCount--;
		M.loadCheck();
		if (data.ok){
			console.log(data);
			M.etsy.items[data.results[0]['listing_id']] = data.results[0];
			M.etsy.render();
			$('[eid='+id+']').addClass('activeItem');
			var data = M['etsy']['items'][id];
			M['etsy']['renderItem']( data );
			scrollTo(0, $('.activeItem').offset().top);
		}
	})
	.fail(function(){
	M.loadCount--;
	M.loadCheck();
	});
}
M.etsy.hideMoreButton = function (){
	$('#etsy .more').hide();
}
M.etsy.showMoreButton = function (){
	$('#etsy .more').show();
}
M.etsy.render = function(){
	var itemTemp = '<div class="row"><div class="twelve columns"><div class="panel etsyItem" eID= "{{listing_id}}" style="background:url({{image}});">{{{title}}}</div></div></div>';
	var etsyHTML = [];
	
	for (x in M.etsy.items){
		var result = M.etsy.items[x];
		if (result.rendered == undefined){
			result.image = result.Images[0]['url_570xN'];
			etsyHTML.push(Mustache.render(itemTemp, result));
			M.etsy.items[x]['rendered'] = true;
		}
	}
	
	var loadHTML = function(){
		if (etsyHTML.length > 0)
		{
			var $item = $(etsyHTML.pop());
			$('#etsy .items').append($item);
			$item.hide().fadeIn(1000);
			setTimeout(loadHTML, 100);
		}
		else
		{
			$('.etsyItem:not(prepped)').addClass('prepped').click(function(){
				var eid = $(this).attr('eid');
				router.navigate('/etsy/'+eid);
			});
			if ( M.etsy.isMore ){
				M.etsy.showMoreButton();
			}
			else
			{
				M.etsy.hideMoreButton();
			}
		}
	}
	loadHTML();
}
M.etsy.renderItem = function (data) {
	M.nav.makeActive($('#etsy'));
	var tmpl = '<div class="itemDetails row"><div class="column six"><p>{{{description}}}</p><a href="http://etsy.com/listing/{{listing_id}}"><button class="button">View on etsy</button></a><ul><li>Price - {{price}} {{currency_code}}</li><li>Style - {{style_string}}</li></ul></div><div class="column six"><div class="gal"><ul>{{{image_list}}}</ul></div></div></div>';
	data.style_string = '';
	var eid = data.listing_id;
	for (x in data.style)
	{
		data.style_string += data.style[x] +', ';
	}
	if (data.style_string.length > 0)
	{
		data.style_string= data.style_string.substr(0, data.style_string.length-2);
	}
	data.description = data.description.replace(/\n/g,"<br>");

	data.image_list = '';
	var a = 0;
	for (x in data.Images ){
		if (a == 0){
			data.image_list+='<li style=\'display:block\'><a href="' + data['Images'][x]['url_fullxfull'] + '"><img src=\'' + data['Images'][x]['url_570xN'] + '\' alt="'+ data.title +'"></a></li>';	
			a++;
		} else
		{
			data.image_list+='<li style=\'display:none\'><a href="' + data['Images'][x]['url_fullxfull'] + '"><img src=\'' + data['Images'][x]['url_570xN'] + '\' alt="'+ data.title +'"></a></li>';
		}
	}
	var res = Mustache.render(tmpl, data);
	$('[eid='+eid+']').after(res);
	scrollTo(0, $('[eid='+eid+']').offset().top);
	window.s = new Swipe($('.gal')[0]);
	var myPhotoSwipe = $(".gal a").photoSwipe({ enableMouseWheel: false , enableKeyboard: true });
}
*/
M.restoreItems = function (){
 $('.itemDetails').remove();
 $('.activeItem').removeClass('activeItem');
}	
//M.etsy.init = M.etsy.get;
//M.etsy.more = M.etsy.get;
	
function WP(category){
	this.category = category;
	this.items = {};
	this.page = 1;
	this.limit = 10;
	this.isMore = true;
	this.get = function(){
		if ( this.isMore ){
			var wp = this;
			url = '/press?json=get_category_posts&category_slug='+this.category+'&count='+this.limit+'&page='+this.page;
			M.loadCount++;
			M.loadCheck();
			$.get(url).
			done( function( data ){
				M.loadCount--;
				M.loadCheck();
				if ( data.status == 'ok' ){
					wp.page++;
					var count = 0;
					for ( x in data.posts ){
						count++;
						var result = data.posts[x];
						wp.items[result['slug']] = result;
					}
					if ( count < wp.limit ) { wp.isMore = false;}
				}
				wp.render();
			})
			.fail(function(){
			M.loadCount--;
			M.loadCheck();
			});
		}
	};
	this.getSingle = function(id){
		var wp = this;
		var url = '/press?json=get_post&post_slug='+id;
		M.loadCount++;
		M.loadCheck();
		$.ajax({
		url:url,
		dataType: 'json'
		}).done(function(data){
			M.loadCount--;
			M.loadCheck();
			if (data.status == 'ok'	){
				wp.items[data.post.slug] = data.post;
				wp.render();
				
				$('[eid='+id+']').addClass('activeItem');
				var data = wp['items'][id];
				wp.renderItem( data );
				scrollTo(0, $('.activeItem').offset().top);
			}
		})
		.fail(function(){
		M.loadCount--;
		M.loadCheck();
		});
	};
}

M.write = new WP('write');
M.write.showMoreButton = function(){
	$('#write .more').show();
};
M.write.hideMoreButton = function(){
	$('#write .more').hide();
};

M.write.render = function(){
	var itemTemp = '<div class="row"><div class="twelve columns"><div class="panel writeItem" style="background-image:url({{{thumbnail}}});" eID= "{{slug}}" \><h3>{{{title}}}</h3>{{{content}}}</div></div></div>';
	var writeHTML = [];
	var itemsArray = [];
	for (x in this.items){
		itemsArray.push(this.items[x]);
	}
	
	itemsArray.sort(function(a,b){
		var ad = new Date(a.date);
		var bd = new Date(b.date);
		return ad-bd;
	});
	
	for (x in itemsArray){
		var result = itemsArray[x];
		if (result.rendered == undefined){
			//result.image = result.Images[0]['url_570xN'];
			writeHTML.push(Mustache.render(itemTemp, result));
			this.items[itemsArray[x]['slug']]['rendered'] = true;
		}
	}
	
	var loadHTML = function(){
		if (writeHTML.length > 0)
		{
			var $item = $(writeHTML.pop());
			$('#write .items').append($item);
			$item.hide().fadeIn(1000);
			setTimeout(loadHTML, 100);
		}
		else
		{
			$('.writeItem a img').each(function(){
			var image = $(this).html('img');
			$(this).parent('a').before(image);
			$(this).parent('a').remove();
			});
			
			$('.writeItem:not(prepped)').addClass('prepped').click(function(){
				var eid = $(this).attr('eid');
				router.navigate('/write/'+eid);
			});
			
			if ( M.write.isMore ){
				M.write.showMoreButton();
			}
			else
			{
				M.write.hideMoreButton();
			}
		}
	}
	loadHTML();
}

M.write.renderItem = function (data) {
	M.nav.makeActive($('#write'));
	var tmpl = '<div class="itemDetails row">{{#thumbnail}}<div class="gal"><a href="{{{thumbnail}}}"><img src="{{{thumbnail}}}" class="thumb" /></a></div>{{/thumbnail}}{{{content}}}</div>';
	data.style_string = '';
	var eid = data.slug;
	var res = Mustache.render(tmpl, data);
	$('[eid='+eid+']').after(res);
	scrollTo(0, $('[eid='+eid+']').offset().top);
		if( $(".gal a").length > 0 ){
			var myPhotoSwipe = $(".gal a").photoSwipe({ enableMouseWheel: false , enableKeyboard: true });
		}
		$('#write a img:not(.thumb)').each(function(){
		var image = $(this).html('img');
		var a = $(this).parent('a').before(image).remove();
		});
}

M.art = new WP('art');
M.art.render = function(){
	var itemTemp = 	'<div class="row"><div class="twelve columns"><div class="panel artItem" eID= "{{slug}}" style="background:url({{thumbnail}});">{{{title}}}</div></div></div>';
	var artHTML = [];
	var itemsArray = [];
	
	for (x in this.items){
		itemsArray.push(this.items[x]);
	}
	
	itemsArray.sort(function(a,b){
	var ad = new Date(a.date);
	var bd = new Date(b.date);
	return ad-bd;
	});
	
	for (x in itemsArray){
		var result = itemsArray[x];
		if ( result.rendered == undefined ){
			//result.image = result.Images[0]['url_570xN'];
			artHTML.push(Mustache.render(itemTemp, result));
			this.items[itemsArray[x]['slug']]['rendered'] = true;
		}
	}
	
	var loadHTML = function(){
		if (artHTML.length > 0)
		{
			var $item = $(artHTML.pop());
			$('#art .items').append($item);
			$item.hide().fadeIn(1000);
			setTimeout(loadHTML, 100);
		}
		else
		{
			$('.artItem:not(prepped)').addClass('prepped').click(function(){
				var eid = $(this).attr('eid');
				router.navigate('/art/'+eid);
			});
			
			if ( M.art.isMore ){
				M.art.showMoreButton();
			}
			else
			{
				M.art.hideMoreButton();
			}
		}
	}
	loadHTML();
}
M.art.showMoreButton = function(){
	$('#art .more').show();
};
M.art.hideMoreButton = function(){
	$('#art .more').hide();
};
M.art.renderItem = function (data) {
	M.nav.makeActive($('#art'));
	var tmpl = '<div class="itemDetails row"><div class="gal"><a href="{{{thumbnail}}}"><img src="{{{thumbnail}}}"></a></gal>{{{content}}}</div>';
	data.style_string = '';
	var eid = data.slug;
	var res = Mustache.render(tmpl, data);
	$('[eid='+eid+']').after(res);
	scrollTo(0, $('[eid='+eid+']').offset().top);
	var myPhotoSwipe = $(".gal a").photoSwipe({ enableMouseWheel: false , enableKeyboard: true });
}

M.nav = {};

M.nav.home = function () {
	router.navigate('/');
}
M.nav.makeActive = function ($id){
	if ( !$id.hasClass('eight') ){
		var id = $id.attr('id');
		$('[show]').removeClass('act');
		$('[show='+id+']').addClass('act');
		$('.content>.eight').removeClass('eight').removeClass('offset-by-two').addClass('four');
		$('.hidden').removeClass('hidden');
		$('#etsy, #write, #art').addClass('hidden');
		$id.removeClass('hidden').removeClass('four').addClass('eight').addClass('offset-by-two');
	}
}
M.nav.removeActive = function($id){
$('#etsy, #write, #art').removeClass('hidden');
$('.content>.eight').removeClass('eight').removeClass('offset-by-two').addClass('four');
}
M.nav.pageByID = function(type, id){

	if ( M[type]['items'][id] != undefined )
	{
		$('[eid='+id+']').addClass('activeItem');
		var data = M[type]['items'][id];
		M[type]['renderItem']( data );
		scrollTo(0, $('.activeItem').offset().top);
	}
	else
	{
		M[type]['getSingle'](id);
		
	}
}

var router = new Router();
router.route('/', function(){
	M.restoreItems();
	M.nav.removeActive();
});
/*router.route('/etsy', function(){
	M.restoreItems();
	M.nav.makeActive($('#etsy'));
});
router.route('/etsy/:id', function(id){
	M.restoreItems();
	M.nav.pageByID('etsy', id);
});*/ 
router.route('/write', function(){
	M.restoreItems();
	M.nav.makeActive($('#write'));
});
router.route('/write/:id', function(id){
	M.restoreItems();
	M.nav.pageByID('write', id);
});
router.route('/art', function(){
	M.restoreItems();
	M.nav.makeActive($('#art'));
});
router.route('/art/:id', function(id){
	M.restoreItems();
	M.nav.pageByID('art', id);
});


