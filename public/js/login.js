$('#login').on('submit', (e)=>{
	e.preventDefault();
	let user = {
		email: e.target.elements.email.value,
		password: e.target.elements.password.value
	};

	$.ajax({
		url: '/login',
		method: 'POST',
		withCredentials: true,
		data: user
	}).done((msg)=>{
		window.location.replace('/home');
	}).fail((msg)=>{
		$('.error-msg').html('Wrong credentials, try again.');
		console.log('Error:', msg.responseText);

	});
})
