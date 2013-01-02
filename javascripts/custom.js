	var M = {};
	M.init = function(){
		M.etsy.init();
		$('#etsy .more').click(function(){
			M.etsy.more();
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
			M.etsy.default = $('#etsy').html();
			var offset = M.etsy.page*limit;
			var url = 'http://openapi.etsy.com/v2/shops/catandglove/listings/active.js?callback=getData&api_key=3lrt6kdjs0ppzxvxj1ypo0m4&includes=Images&limit='+limit+'&order=date_desc&offset='+offset;
			
			$.ajax({
			url:url,
			dataType: 'jsonp'
			}).done(function(data){
				if (data.ok){
				M.etsy.page++;
				console.log(data);
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
	M.etsy.clear = function(){
		if (M.etsy.default != undefined){
			$('#etsy').html(M.etsy.default);
		}
	}