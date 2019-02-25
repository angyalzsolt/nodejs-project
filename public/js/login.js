$('#login').on('submit', (e)=>{
	e.preventDefault();
	let user = {
		email: e.target.elements.email.value,
		password: e.target.elements.password.value
	};

	$.ajax({
		url: '/login',
		method: 'POST',
		data: user
	}).done((msg)=>{
		// window.location.replace('/home.html?success');
		console.log(123);
	}).fail((msg)=>{
		console.log('Error:', msg.responseText);
	});
})
