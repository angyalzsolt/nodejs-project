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
	genreateDomELements(data);
	// $('#profile-pic').html(`<img src=./${data.image} style="width: 200px" onerror="this.src = '../icon.jpg';">`);
});

const genreateDomELements = (data)=>{
	$('.name').html(`Hey ${data.name}.`);
	$('#profile-pic').html(`<img class="profile-pic" src=./${data.image} onerror="this.src = '../icon.jpg';">`);
}


$('#images').on('submit', (e)=>{
	e.preventDefault();
	let formData = new FormData()
	formData.append('img', $('#img')[0].files[0]);
	console.log($('#img')[0].files[0]);
	for(let x of formData.entries()){
		console.log(x[0] + ', ' + x[1]);
	}
	$.ajax({
		url: '/image',
		method: 'POST',
		data: formData,
		enctype	: 'multipart/form-data',
		processData: false,
		contentType: false
	}).done((msg)=>{
		window.location.replace('/profile');
	}).fail((msg)=>{
		console.log('An error occured', msg.responseText);
	})
});


$('#delete').on('click', (e)=>{
	let img = $('#profile-pic img').attr('src').substring(2);
	
	$.ajax({
		url: '/image',
		method: 'PATCH',
		data: {title: img}
	}).done((msg)=>{
		console.log('IMG deleted');
	}).fail((msg)=>{
		console.log('There is an error: ', msg.responseText);
	})
})