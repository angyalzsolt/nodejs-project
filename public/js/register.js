$('#register').on('submit', (e)=> {
	e.preventDefault();
	let user = {
		name: e.target.elements.name.value,
		email: e.target.elements.email.value,
		password: e.target.elements.password.value
	};
	console.log(user);

	$.ajax({
		url: '/register',
		method: 'POST',
		data: user
	}).done((msg)=>{
		window.location.replace('login?success');
	}).fail((msg)=>{
		console.log('Error', msg.responseText);
	});



});


console.log(123);