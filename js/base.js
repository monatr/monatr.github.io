
/****************************************************************************************************
 * General.
 ****************************************************************************************************/

function number_format(num){
	return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/****************************************************************************************************
 * Page tab.
 ****************************************************************************************************/

function toggle_tab(id){
	// Disable all tab.
	$("#maincontainer section").css({"display":"none"});
	$("#menubar li a").css({"color":"#999", "background-color":"inherit"});
	// Get tab DOM.
	if($("#maincontainer #tabs-"+id).size() <= 0){
		id = "index";
	}
	// Show.
	$("#maincontainer #tabs-"+id).fadeIn(500);
	$("#link-"+id).css({"color":"#CCC", "background-color":"#000"});
}
$(document).ready(function(){
	toggle_tab(window.location.hash.substr(1));
});

/****************************************************************************************************
 * Monacoin stat.
 ****************************************************************************************************/

$(document).ready(function(){
	// Configuration.
	var REFRESH_INTERVAL = 60 * 1000;
	// Last update time.
	var lastupdate = -1;
	// Update statistics.
	var update = function(){
		lastupdate = new Date().getTime();
		// Difficulty, Block Height
		$.getJSON("http://abe.monash.pw:3000/api/status?q=getInfo", function(data){
			var diff = parseFloat(data.info.difficulty);
			$("#junk-monastat-diff").html(diff);
			$("#junk-monastat-nethash").html((1e-6*diff*Math.pow(2,32)/90).toFixed(2)+"MH/s");
			var blocks = parseInt(data.info.blocks);
			$("#junk-monastat-blockheight").html(number_format(blocks));
		});
		// Coins Mined
		$.getJSON("http://abe.monash.pw:3000/api/status?q=getTxOutSetInfo", function(data){
			var total_amount = parseFloat(data.txoutsetinfo.total_amount);
			$("#junk-monastat-mined").html(number_format(total_amount));
		});
	};
	update();
	setInterval(update, REFRESH_INTERVAL);
	setInterval(function(){
		var text = "???";
		if(lastupdate > 0){
			text = Math.floor((new Date().getTime() - lastupdate)/1000)+" seconds ago";
		}
		$("#junk-monastat-lastupdate").html(text);
	}, 100);
});


/****************************************************************************************************
 * Price board.
 ****************************************************************************************************/

var RIPPLEJSONP = "http://ripplejsonp.monatr.jp/";

function ripple_get_bid(pay_currency, pay_issuer, get_currency, get_issuer, callback){
	$.getJSON(RIPPLEJSONP, {
			method: "book_offers",
			params: {
				taker_pays: {
					currency: pay_currency,
					issuer: pay_issuer,
				},
				taker_gets: {
					currency: get_currency,
					issuer: get_issuer,
				},
			},
		}, function(data){
			callback(data);
		});
}

function ripple_get_bestbid(pay_currency, pay_issuer, get_currency, get_issuer, callback){
	ripple_get_bid(pay_currency, pay_issuer, get_currency, get_issuer, function(data){
		if(data['offers'].length < 1){
			callback(null);
		}else{
			var bestbid = data['offers'][0]['quality'];
			callback(1./bestbid);
		}
	});
}

function ripple_get_bestask(pay_currency, pay_issuer, get_currency, get_issuer, callback){
	ripple_get_bid(get_currency, get_issuer, pay_currency, pay_issuer, function(data){
		if(data['offers'].length < 1){
			callback(null);
		}else{
			var bestask = data['offers'][0]['quality'];
			callback(bestask);
		}
	});
}

function init_monaprices(){
	// Last update time.
	var lastupdate = -1;
	var update_prices = function(){
		var get_price_html = function(price){
			var digits = 3;
			price = parseFloat(price);
			var fltdigits = Math.max(digits-1-Math.floor(Math.LOG10E*Math.log(price)), 0);
			var html = "";
			html += price.toFixed(fltdigits);
			html += "<span style='font-size:60%;'>"+price.toFixed(fltdigits+2).substr(price.toFixed(fltdigits).length)+"</span>";
			return html;
		};
		// Get BitPay Best Bid price.
		$.getJSON("https://bitpay.com/api/rates", function(data){
			var bbb_jpy = 0;
			data.forEach(function(a){
				if(a.code == "JPY"){
					bbb_jpy = parseFloat(a.rate);
				}
			});
			// Update.
			// もなとれ
			$.getJSON("https://api.monatr.jp/ticker?market=btc_mona", function(data){
				var bid_html = get_price_html(data.current_bid) + "<br />" + get_price_html(bbb_jpy/data.current_ask) + " <span style='font-size:60%;'>円</span>";
				$("#junk-monaprices-monatr-bid").html(bid_html);
				var ask_html = get_price_html(data.current_ask) + "<br />" + get_price_html(bbb_jpy/data.current_bid) + " <span style='font-size:60%;'>円</span>";
				$("#junk-monaprices-monatr-ask").html(ask_html);
			});
			// AllCoin.com - does not support JSONP...
			/*
			$.getJSON("https://www.allcoin.com/api2/pair/MONA_BTC", function(data){
			});
			*/
		});
		
		// Update last update time.
		lastupdate = new Date().getTime();
	};
	update_prices();
	setInterval(update_prices, 60*1000);
	setInterval(function(){
		var text = "???";
		if(lastupdate > 0){
			text = Math.floor((new Date().getTime() - lastupdate)/1000)+" seconds ago";
		}
		$("#junk-monaprices-lastupdate").html(text);
	}, 100);
}

function init_rippleprices(){
	// Configurations.
	var ACCOUNT_SIGHASH = "rUZbgiS4XDBwCM88xwhRdGGioVMhH94nSE";
	var ACCOUNT_RIPPLETORIHIKIJO = "r3Ng7AXA2zvqfZ8uBruWLS46ohgDyVDcFt";
	var ACCOUNT_RIPPLETRADEJAPAN = "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6";
	var ACCOUNT_TOKYOJPY = "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN";
	var ACCOUNT_BITSTAMP = "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B";
	var ACCOUNT_JUSTCOIN = "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1";
	var ACCOUNT_SNAPSWAP = "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q";
	var pairs = [{
		base: {currency: "XMC", issuer: ACCOUNT_SIGHASH, label: "sighash"},
		counter: {currency: "XRP", issuer: null, label: null},
	}, {
		base: {currency: "XMC", issuer: ACCOUNT_RIPPLETORIHIKIJO, label: "リップル取引所"},
		counter: {currency: "XRP", issuer: null, label: null},
	}, {
		base: {currency: "XMC", issuer: ACCOUNT_SIGHASH, label: "sighash.info"},
		counter: {currency: "JPY", issuer: ACCOUNT_RIPPLETRADEJAPAN, label: "RTJ"},
	}, {
		base: {currency: "XRP", issuer: null, label: null},
		counter: {currency: "JPY", issuer: ACCOUNT_RIPPLETRADEJAPAN, label: "RTJ"},
	}, {
		base: {currency: "XRP", issuer: null, label: null},
		counter: {currency: "JPY", issuer: ACCOUNT_TOKYOJPY, label: "TokyoJPY"},
	}, {
		base: {currency: "XRP", issuer: null, label: null},
		counter: {currency: "USD", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
	}, {
		base: {currency: "BTC", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
		counter: {currency: "XRP", issuer: null, label: null},
	}, {
		base: {currency: "BTC", issuer: ACCOUNT_JUSTCOIN, label: "Justcoin"},
		counter: {currency: "XRP", issuer: null, label: null},
	}, {
		base: {currency: "BTC", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
		counter: {currency: "USD", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
	}, {
		base: {currency: "BTC", issuer: ACCOUNT_JUSTCOIN, label: "Justcoin"},
		counter: {currency: "BTC", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
	}];
	// Last update time.
	var lastupdate = -1;
	// Write price table HTML.
	$.each(pairs, function(key, pair){
		var html = "";
		html += "<table class='prices' style='float:left;'><caption>";
		html += pair.base.currency;
		if(pair.base.label != null){
			html += " <span class='issuer-label'>["+pair.base.label+"]</span>";
		}
		html += " / " + pair.counter.currency;
		if(pair.counter.label != null){
			html += " <span class='issuer-label'>["+pair.counter.label+"]</span>";
		}
		html += "</caption><tr><th class='bid-text'>Bid</th><th class='ask-text'>Ask</th></tr><tr>";
		html += "<td id='junk-rippleprices-"+pair.base.currency+pair.base.issuer+pair.counter.currency+pair.counter.issuer+"-bid'>??.??</td>";
		html += "<td id='junk-rippleprices-"+pair.base.currency+pair.base.issuer+pair.counter.currency+pair.counter.issuer+"-ask'>??.??</td>";
		html += "</tr></table>";
		$("#junk-rippleprices").append(html);
	});
	$("#junk-rippleprices").append("<div style='clear:both;'></div>");
	var update_prices_ = function(type, pair){
		var digits = 3;
		if(type!="bid"&&type!="ask") return false;
		var func = (type=="bid"?ripple_get_bestbid:ripple_get_bestask);
		func(pair.base.currency, pair.base.issuer, pair.counter.currency, pair.counter.issuer, function(price){
			if(price == null){
				var text = "-";
			}else{
				price = parseFloat(price);
				if(pair.base.currency == "XRP"){
					price *= 1000000;
				}
				if(pair.counter.currency == "XRP"){
					price /= 1000000;
				}
				var fltdigits = Math.max(digits-1-Math.floor(Math.LOG10E*Math.log(price)), 0);
				var text = price.toFixed(fltdigits);
				text += "<span style='font-size:60%;'>"+price.toFixed(fltdigits+2).substr(price.toFixed(fltdigits).length)+"</span>";
			}
			$("#junk-rippleprices-"+pair.base.currency+pair.base.issuer+pair.counter.currency+pair.counter.issuer+"-"+type).html(text);
		});
	};
	var update_prices = function(){
		$.each(pairs, function(key, pair){
			update_prices_("bid", pair);
			update_prices_("ask", pair);
		});
		lastupdate = new Date().getTime();
	};
	update_prices();
	setInterval(update_prices, 60*1000);
	setInterval(function(){
		var text = "???";
		if(lastupdate > 0){
			text = Math.floor((new Date().getTime() - lastupdate)/1000)+" seconds ago";
		}
		$("#junk-rippleprices-lastupdate").html(text);
	}, 100);
}

$(document).ready(function(){
	init_monaprices();
	init_rippleprices();
});



