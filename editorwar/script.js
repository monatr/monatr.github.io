
var ABE_BASE_URI = "http://abe.monash.pw";

var ADDR_EMACS = "MEmacsFQvDi9xdrDE7DLMcLQPTJ1C7Uu5k";
var ADDR_VI = "MVimXZDdeXSkzqL2FGGxZteX4FjvF6WqLG";

var balance_emacs = -1;
var balance_vi    = -1;

function refresh_progressbar(){
	if(balance_emacs < 0 || balance_vi < 0) return;
	var COLOR_WINNER = "#900";
	var COLOR_LOSER  = "#009";
	var can = $("#progressbar")[0];
	var ctx = can.getContext("2d");
	var width = can.width;
	var height = can.height;
	var ratio_emacs = balance_emacs / (balance_emacs+balance_vi);
	var ratio_vi    = balance_vi    / (balance_emacs+balance_vi);
	// Draw Emacs bar.
	ctx.save();
	ctx.fillStyle = (balance_emacs>=balance_vi ? COLOR_WINNER : COLOR_LOSER);
	ctx.fillRect(0, 0, width*ratio_emacs, height);
	ctx.restore();
	// Draw vi bar.
	ctx.save();
	ctx.fillStyle = (balance_emacs>=balance_vi ? COLOR_LOSER : COLOR_WINNER);
	ctx.fillRect(width*ratio_emacs, 0, width*ratio_vi, height);
	ctx.restore();
	// Draw text.
	ctx.save();
	ctx.font = "bold 24px 'sans-serif'";
	ctx.fillStyle = "#CCC";
	var text = (100*ratio_emacs).toFixed(0) + " : " + (100*ratio_vi).toFixed(0);
	var metrics = ctx.measureText(text);
	// XXX: consider base line and text height!
	ctx.fillText(text, (width-metrics.width)/2, height-5);
	ctx.restore();
	// Draw border line.
	ctx.save();
	ctx.strokeStyle = "#CCC";
	ctx.lineWidth = 2;
	ctx.strokeRect(0, 0, width, height);
	ctx.restore();
}

$(document).ready(function(){
	//
	// Update donation amount.
	// Emacs.
	$.getJSON(ABE_BASE_URI+"/chain/Monacoin/q/addressbalance/"+ADDR_EMACS+"?jsonp=?", function(data){
		balance_emacs = parseFloat(data);
		$("#balance-emacs").text(balance_emacs.toFixed(2));
		refresh_progressbar();
	});
	// vi.
	$.getJSON(ABE_BASE_URI+"/chain/Monacoin/q/addressbalance/"+ADDR_VI+"?jsonp=?", function(data){
		balance_vi = parseFloat(data);
		$("#balance-vi").text(balance_vi.toFixed(2));
		refresh_progressbar();
	});
})

