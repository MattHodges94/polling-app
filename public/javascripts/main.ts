var credentials = require('../../config/credentials');
var ws = new WebSocket(credentials.wsUrl);

// event emmited when connected
ws.onopen = function () {
	console.log('websocket is connected ...');
    
};
// event emmited when receiving message 
ws.onmessage = function (ev) {

	var resultsObj = JSON.parse(ev.data);
	document.getElementById('result_' + resultsObj.id + '_' + resultsObj.choice).innerHTML = resultsObj.result;
};

$( document ).ready(function () {

	$('.sidenav').sidenav();

	//init masonry grid
	$('.grid').masonry({
		itemSelector: '.grid-item',
		columnWidth: '.grid-item',
		gutter: 20,
		percentPosition: true
	});

	// fade out alert messages
	console.log($('.alert').length > 0);
	if ($('.alert').length > 0) {
		setTimeout(function () {
			$('.alert').fadeOut();
		}, 3500);
	}

	$('#submit-poll').click((e) => {
		if ($('#title').val() == '') {
			e.preventDefault();
			flashAlert('Title cannot be blank');
		}
		if (($('#title').val() as string).length > 46 ) {
			e.preventDefault();
			flashAlert('Title must be less than 46 characters');
		}

		if (($('#description').val() as string).length > 54) {
			e.preventDefault();
			flashAlert('Description must be less than 54 characters');
		}

		if (($('#choices-1').val() == '') || ($('#choices-2').val() == '')) {
			e.preventDefault();
			flashAlert('You must enter some choices before submitting');
		}

		if ((($('#choices-1').val() as string).length > 20) || (($('#choices-2').val() as string).length > 20) || (($('#choices-3').val() as string).length > 20)) {
			e.preventDefault();
			flashAlert('Choices must be below 20 characters');
		}
	});

	function flashAlert (message: string) {
		M.toast({ html: message, displayLength: 2500 });
	}

});

