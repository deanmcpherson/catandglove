	var M = {};
	M.init = function(){
		M.etsy.init();
		$('#etsy .more').click(function(){
			M.etsy.more();
		});
		
		M.write.get();
		$('#write .more').click(function(){
			M.write.get();
		});
		
		$('[show]:not(.prep)').addClass('prep').tappable(function(){
		var show = $(this).attr('show');
		router.navigate('/'+show);
		$('[show].act').removeClass('act');
		$('[show='+show+']').addClass('act');
		});
	}
	
	M.etsy = {};
	M.etsy.items = {};
	M.etsy.page = 0;
	M.etsy.limit = 25;
	M.etsy.isMore = true;
	M.etsy.get = function(){
		if ( M.etsy.isMore ){
			limit = M.etsy.limit;
			var offset = M.etsy.page*limit;
			var url = 'http://openapi.etsy.com/v2/shops/catandglove/listings/active.js?callback=getData&api_key=3lrt6kdjs0ppzxvxj1ypo0m4&includes=Images&limit='+limit+'&order=date_desc&offset='+offset;
			
			$.ajax({
			url:url,
			dataType: 'jsonp'
			}).done(function(data){
				if (data.ok){
				M.etsy.page++;
				var count = 0;
					for (x in data.results)
					{
						count++;
						var result = data.results[x];
						M.etsy.items[result.listing_id] = result;
					}
					if ( count < limit ) { M.etsy.isMore = false;}
					M.etsy.render();
				}
				else
				{

				}
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

	M.etsy.init = M.etsy.get;
	M.etsy.more = M.etsy.get;
	
	M.wp = {};
M.wp.category = '';
M.wp.items = {};
M.wp.page = 1;
M.wp.limit = 25;
M.wp.isMore = true;

M.wp.get = function(){
	if ( this.isMore ){
		var wp = this;
		url = '/press?json=get_category_posts&category_slug='+this.category+'&count='+this.limit+'&page='+this.page;
		$.get(url).
		done( function( data ){
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
}

M.nav.makeActive = function ($id){
	if ( !$id.hasClass('twelve') ){
		$('.content>.twelve').removeClass('twelve').addClass('four');
		$('.hidden').removeClass('hidden');
		$('#etsy, #write, #art').addClass('hidden');
		$id.removeClass('hidden').removeClass('four').addClass('twelve');
	}
}

M.nav.removeActive = function($id){
$('#etsy, #write, #art').removeClass('hidden');
$('.content>.twelve').removeClass('twelve').addClass('four');
}

M.nav.pageByID = function(type, id){

	if ( M[type]['items'][id] != undefined )
	{
		var data = M[type]['items'][id];
		M[type]['renderItem']( data );
		console.log(data.title);
	}
	else
	{
		M[type]['getSingle'](id);
	}
}

var router = new Router();

router.route('/', function(){
	M.nav.removeActive();
});

router.route('/etsy', function(){
	M.nav.makeActive($('#etsy'));
});

router.route('/etsy/:id', function(id){
	M.nav.pageByID('etsy', id);
});

router.route('/write', function(){
	M.nav.makeActive($('#write'));
});

router.route('/write/:id', function(id){
	M.nav.pageByID('write', id);
});

router.route('/art', function(){
	M.nav.makeActive($('#art'));
});

router.route('/art/:id', function(id){
	M.nav.pageByID('art', id);
});


