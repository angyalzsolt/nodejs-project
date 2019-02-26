$('#logout').on('click', (e)=>{
	$.ajax({
		url: '/home',
		method: 'DELETE'
	}).done((msg)=>{
		window.location.replace('/login');
	}).fail((msg)=>{
		console.log('ERROR OCCURED: ', msg.responseText);
	})
})