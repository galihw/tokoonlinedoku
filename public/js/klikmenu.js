function PilMenu(no){
	noklik = no;
	//console.log(noklik)
	document.getElementById("katalog").style.display = "none";
	document.getElementById("tentang").style.display = "none";
	document.getElementById("order").style.display = "none";
	if(noklik==6)		document.getElementById("tentang").style.display = "";
	else if(noklik==7)	document.getElementById("order").style.display = "";
	else				document.getElementById("katalog").style.display = "";

	
	dataaktif = ardata[no];
	//console.log('dataaktif',dataaktif);
	if(noklik>=0 && noklik<=5)	UbahTampilan();
}
function UbahTampilan(){
	//console.log('ar.length',ar.length)
	for(var i=1;i<=106;i++){
		document.getElementById("nama"+i).style.display = "";
		if(i>dataaktif.length){
			document.getElementById("nama"+i).style.display = "none";
		}else{
			document.getElementById("img"+i).style = "display: block; margin: 0 auto; object-fit: contain;";
			
			document.getElementById("img"+i).width="500";
			document.getElementById("img"+i).height="500";
			document.getElementById("img"+i).src = "images/"+(noklik+1)+"/"+dataaktif[i-1].gambar1;
			document.getElementById("img"+i).style.backgroundColor = dataaktif[i-1].bg;
			document.getElementById("judul"+i).innerHTML = dataaktif[i-1].judul;
			document.getElementById("deskripsi"+i).innerHTML = dataaktif[i-1].deskripsi;
			document.getElementById("harga"+i).textContent = dataaktif[i-1].harga;
			
		}
	}
}
var dataaktif = [];
var noklik = 0;
PilMenu(noklik);

