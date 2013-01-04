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
		M.etsy.init();
		$('#etsy .more').tappable(function(){
			M.etsy.more();
		});
		
		M.write.get();
		$('#write .more').tappable(function(){
			M.write.get();
		});
		
		$('.home').tappable(function(){
			M.nav.home();
		});
		
		if ( $('.mobNav').css('display') == 'block' ){
			if (History.getState().cleanUrl == "http://catandglove.com/"){
				router.navigate('/etsy');
			}
		}
		
		$('[show]:not(.prep)').addClass('prep').tappable(function(){
			var show = $(this).attr('show');
			router.navigate('/'+show);
			$('[show].act').removeClass('act');
			$('[show='+show+']').addClass('act');
		});
		router.checkRoutes(History.getState());
	}
	
	M.etsy = {};
	M.etsy.items = {};
	M.etsy.page = 0;
	M.etsy.limit = 15;
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
				$('.etsyItem:not(prepped)').addClass('prepped').tappable(function(){
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
	
M.restoreItems = function (){
	 $('.itemDetails').remove();
	 $('.activeItem').removeClass('activeItem');
}	
	M.etsy.init = M.etsy.get;
	M.etsy.more = M.etsy.get;
	
	M.wp = {};
M.wp.category = '';
M.wp.items = {};
M.wp.page = 1;
M.wp.limit = 15;
M.wp.isMore = true;

M.wp.get = function(){
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
}

M.write = M.wp;
M.write.category = 'write';
M.write.showMoreButton = function(){
	$('#write .more').show();
};
M.write.hideMoreButton = function(){
	$('#write .more').hide();
};
M.write.render = function(){
	var itemTemp = '<div class="row"><div class="twelve columns"><div class="panel writeItem" eID= "{{slug}}" \><h3>{{{title}}}</h3>{{{content}}}</div></div></div>';
	var writeHTML = [];
	
	for (x in this.items){
		var result = this.items[x];
		if (result.rendered == undefined){
			//result.image = result.Images[0]['url_570xN'];
			writeHTML.push(Mustache.render(itemTemp, result));
			this.items[x]['rendered'] = true;
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
			var data = data.results[0];
			M.etsy.items[result.listing_id] = data;
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
	
var router = new Router();

router.route('/', function(){
	M.restoreItems();
	M.nav.removeActive();
});

router.route('/etsy', function(){
	M.restoreItems();
	M.nav.makeActive($('#etsy'));
});

router.route('/etsy/:id', function(id){
	M.restoreItems();
	M.nav.pageByID('etsy', id);
});

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


