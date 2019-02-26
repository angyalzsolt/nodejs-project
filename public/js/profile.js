$('#infos').on('submit', (e)=>{
	e.preventDefault();
	let user = {
		gender: e.target.elements.gender.value,
		telephone: e.target.elements.telephone.value,
		address: e.target.elements.address.value
	};
	console.log(user);

	$.ajax({
		url: '/profile',
		method: 'PATCH',
		enctype: 'multipart/form-data',
		data: user
	}).done((msg)=>{
		console.log('ITS DONE');
	}).fail((msg)=>{
		console.log('ERROR OCCURED: ', msg.responseText);
	});
});


$.get('/profile/id', (data)=>{
	$('#user-name').html(data.name);
	$('#email').html(data.email);
	$('#gender').val(data.gender);
	$('#telnum').val(data.telephone);
	$('#address').val(data.address);
})