document.querySelectorAll('.btnDetail').forEach(item => {
    item.addEventListener('click', (e) => {
        let parent = e.target.parentNode.parentNode;

        let gambar = parent.querySelector('.card-img-top').src;
		console.log(gambar)
        let color = parent.querySelector('.card-img-top').style.backgroundColor;
		
		// mengambil nomor di string gambar
		let hasil1 = gambar.charAt(gambar.length-7);
		let hasil2 = gambar[gambar.length-6];
		let hasil3 = gambar[gambar.length-5];
		let no = 1*(hasil1+''+hasil2+''+hasil3);
		if(hasil1=='s') no = 1*(hasil2+''+hasil3);
		else if(hasil2=='s') no = 1*(hasil3);
		//console.log(hasil1,hasil2,no);
		//console.log(parent.id)
		gambar = 'images/'+(noklik+1)+'/kaos'+no+'.png';
		let gambar2 = 'images/'+(noklik+1)+'/orang'+no+'.jpg';
		//console.log(hasil1,hasil2,hasil3);
		
		
		
		
        let harga = parent.querySelector('.harga').innerHTML;
        let judul = parent.querySelector('.card-text').innerHTML;
        let deskripsi = parent.querySelector('.deskripsi') ? parent.querySelector('.deskripsi').innerHTML : '<i>tidak ada informasi yang tersedia</i>';

		
        let tombolModal = document.querySelector('.btnModal');
        tombolModal.click();

        document.querySelector('.modalTitle').innerHTML = judul;
        let image = document.createElement('img');
		image.style.backgroundColor = color;
        image.src = gambar;
        image.classList.add('w-100');
        document.querySelector('.modalImage').innerHTML = '';
        document.querySelector('.modalImage').appendChild(image);
        let image2 = document.createElement('img');
        image2.src = gambar2;
        image2.classList.add('w-100');
        document.querySelector('.modalImage').appendChild(image2);
        document.querySelector('.modalDeskripsi').innerHTML = deskripsi;
        document.querySelector('.modalHarga').innerHTML = harga;

        //const nohp = '6285714408830';
        //let pesan = `https://api.whatsapp.com/send?phone=${nohp}&text=Halo Bang, saya mau pesan produk ini ${judul}`;
        //document.querySelector('.btnBeli').href = pesan;
		
        document.querySelector('.btnBeli').addEventListener('click', () => {
		  pay(parseInt(harga),judul);
		});
		
    });
});

async function pay(price, name) {
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: { name, price } })
        });
        
        const data = await response.json();
        if (data.payment_url) {
          // Redirect pengguna ke halaman pembayaran DOKU
          window.location.href = data.payment_url;
        } else {
          alert('Gagal memproses pembayaran');
        }
      } catch (err) {
        alert('Terjadi kesalahan koneksi');
      }
    }