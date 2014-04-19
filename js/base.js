
/****************************************************************************************************
 * Price board.
 ****************************************************************************************************/

var RIPPLEJSONP = "http://ripplejsonp.monatr.jp/?callback=?";

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

var ACCOUNT_SIGHASH = "rUZbgiS4XDBwCM88xwhRdGGioVMhH94nSE";
var ACCOUNT_RIPPLETORIHIKIJO = "r3Ng7AXA2zvqfZ8uBruWLS46ohgDyVDcFt";
var ACCOUNT_RIPPLETRADEJAPAN = "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6";
var ACCOUNT_BITSTAMP = "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B";
var ACCOUNT_JUSTCOIN = "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1";
var ACCOUNT_SNAPSWAP = "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q";

var pairs = [
	{
		base: {currency: "XMC", issuer: ACCOUNT_SIGHASH, label: "sighash"},
		counter: {currency: "XRP", issuer: null, label: null},
	},
	{
		base: {currency: "XMC", issuer: ACCOUNT_RIPPLETORIHIKIJO, label: "リップル取引所"},
		counter: {currency: "XRP", issuer: null, label: null},
	},
	{
		base: {currency: "XMC", issuer: ACCOUNT_SIGHASH, label: "sighash.info"},
		counter: {currency: "JPY", issuer: ACCOUNT_RIPPLETRADEJAPAN, label: "RTJ"},
	},
	{
		base: {currency: "XRP", issuer: null, label: null},
		counter: {currency: "JPY", issuer: ACCOUNT_RIPPLETRADEJAPAN, label: "RTJ"},
	},
	{
		base: {currency: "XRP", issuer: null, label: null},
		counter: {currency: "USD", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
	},
	{
		base: {currency: "BTC", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
		counter: {currency: "XRP", issuer: null, label: null},
	},
	{
		base: {currency: "BTC", issuer: ACCOUNT_JUSTCOIN, label: "Justcoin"},
		counter: {currency: "XRP", issuer: null, label: null},
	},
	{
		base: {currency: "BTC", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
		counter: {currency: "USD", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
	},
	{
		base: {currency: "BTC", issuer: ACCOUNT_JUSTCOIN, label: "Justcoin"},
		counter: {currency: "BTC", issuer: ACCOUNT_BITSTAMP, label: "Bitstamp"},
	},
];

function update_prices_(type, pair){
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
			var text = price.toFixed(digits-1-Math.floor(Math.LOG10E*Math.log(price)));
		}
		$("#junk-rippleprices-"+pair.base.currency+pair.base.issuer+pair.counter.currency+pair.counter.issuer+"-"+type).text(text);
	});
}

function update_prices(){
	$.each(pairs, function(key, pair){
		update_prices_("bid", pair);
		update_prices_("ask", pair);
	});
}

$(document).ready(function(){
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
	update_prices();
	setInterval(update_prices, 60*1000);
});



