var TAX_RATE = 0.08; // tax rate
var preTaxTotal = 0; // holds the check's pre-tax total
var taxAmount = 0; // holds the amount of tax based on the pre tax total and tax rate
var tipPcts = new Array(); // holds the tip amounts we want to suggest
tipPcts.push(10);
tipPcts.push(15);
tipPcts.push(20);

$(document).ready(function() {
	// display the tax amount based on TAX_RATE
	var taxAmountStr = TAX_RATE * 100;
	$('#taxLabel').html( $('#taxLabel').html() + " (" + taxAmountStr + "%):" );
	
	// make the menu items draggable
	$("#menu li").draggable({
		opacity: 0.8,
		helper: "clone"
	});
	
	// make the menu and the check both droppable
	$('#check').droppable({
		accept: "#menu li",
		drop: function(event, ui) {
			addItemToCart(ui.draggable);
		}
	});
	$('body').droppable({
		accept: ".chosenItem",
		drop: function(event, ui) {
			removeItemFromCart(ui.draggable);
		}
	});
	
	// generate the "suggested gratuity" rows
	generateTipRows();
	
	// add functionality to the "clear" button
	$('#clearButton').click(function() {
		resetBill();
	});
	
	applyThemes();
});

// Takes in an li and returns the first portion in all caps
function getItemTitle(menuItem) {
	var fixedTitle = "";
	var rawTitle = $(menuItem).find(".title").text().trim();
	var splitTitle = rawTitle.split(" ");
	
	// loop through word by word until the all caps string is found
	var idx = 0;
	while (splitTitle[idx] != undefined && splitTitle[idx] === splitTitle[idx].toUpperCase()) {
		fixedTitle += splitTitle[idx++] + " ";
	}
	
	// if no caps found, just use the first word
	if (idx === 0) {
		fixedTitle += splitTitle[0];
	}
	
	return fixedTitle;
}

// takes in an li and returns the cost
function getItemCost(menuItem) {
	var rawCost = $(menuItem).find(".cost").text();
	return rawCost;
}

// takes in an li and adds the chosen item to the check
function addItemToCart(menuItem) {
	var title = getItemTitle(menuItem);
	var cost = getItemCost(menuItem);
	
	var itemHtml = genItemTableRow(title, cost);
	
	$('#chosenBody').append(itemHtml);
	
	// make the item/s in the check draggable so we can remove it/them as well
	$('.chosenItem').draggable({
		opacity: 0.8,
		helper: "clone"
	});
	
	recalculateTotals();
	recalculateGratuity();
}

// takes in a tr and removes the chosen item from the cart
function removeItemFromCart(menuItem) {
	var title = getItemTitle(menuItem);
	var cost = getItemCost(menuItem);
	
	var tmp = $('.chosenItem');
	var tmp1 = $('.chosenItem').find(':contains(' + title + ')');
	var tmp2 = $('.chosenItem').find(':contains(' + title + ')').first();
	var tmp3 = $('.chosenItem').find(':contains(' + title + ')').first().parent();
	$('.chosenItem:contains(' + title + ')').first().remove();
	
	recalculateTotals();
	recalculateGratuity();
}

// generates the html for a table row based on the title and cost of an item
function genItemTableRow(title, cost) {
	var rowHtml = '<div class="chosenItem"><span class="title">' + title + '</span><span class="cost">$<span class="costTxt">' + cost + '</span></span></span>';
	
	return rowHtml;
}

// recalculates the pre/post-tax totals and updates the display
function recalculateTotals() {
	var jo = $('.chosenItem:not(".ui-draggable-dragging")');
	preTaxTotal = 0;
	taxAmount = 0;
	
	// loop through all items on the check and calculate the total costs
	$.each(jo, function(i,v) {
		var costStr = $(v).find("span.costTxt").text();
		preTaxTotal += parseFloat(costStr);
	});
	$('#preTaxTotal').text( parseFloat(preTaxTotal).toFixed(2) );
	
	taxAmount = preTaxTotal * TAX_RATE;
	$('#taxAmount').text( parseFloat(taxAmount).toFixed(2) );
	
	$('#postTaxTotal').text( parseFloat(preTaxTotal + taxAmount).toFixed(2) );
}

// generates the html for table rows for each of the suggested gratuity amounts found in "tipPcts" global
function generateTipRows() {
	var bodyHtml = "";
	$.each(tipPcts, function(i, tipPct) {
		bodyHtml += "<div><div class='title'>" + tipPct + "%</div><div>$<span id='tip" + tipPct + "'>" + "0.00" + "</span></div></div>";
	});
	
	$('#tipBody').html(bodyHtml);
}

// assumes gratuity is based off of non-taxed purchase
function recalculateGratuity() {
	$.each(tipPcts, function(i, tipPct) {
		var gratAmount = parseFloat( preTaxTotal * (tipPct / 100) ).toFixed(2);
		$('#tip' + tipPct).text(gratAmount);
	});
}

// clears the check, tax, and sug. gratuity
function resetBill() {
	preTaxTotal = 0;
	taxAmount = 0;
	
	$('#chosenBody').html('');
	recalculateTotals();
	recalculateGratuity();
}

function applyThemes() {
	$("button").button();
	
	adjustArticleHeight();
	// adjust height of background for smaller screens
	$(window).resize(function() {
		adjustArticleHeight();
	});
}

function adjustArticleHeight() {
	var leftHeight = $('#check').height();
	var rightHeight = $('#menu').height();
	var articleHeight = $('article:first').height();
	
	if ( leftHeight > articleHeight || rightHeight > articleHeight) {
		var newHeight = (leftHeight > rightHeight) ? leftHeight : rightHeight;
		$('article:first').height(newHeight);
	}
}