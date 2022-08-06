const UNCOMPLETED_BOOK_ID = "belumDibaca";
const COMPLETED_BOOK_ID = "telahDibaca";
const BOOK_ITEM_ID = "itemId";

// mengambil nilai data buku dari form input
function addBook() {
  const inputJudulBuku = document.getElementById("inputJudulBuku").value;
  const inputPenulisBuku = document.getElementById("inputPenulisBuku").value;
  const inputTahunBuku = document.getElementById("inputTahunBuku").value;
  const inputDibaca = document.getElementById("dibaca").checked;

  const book = inputBook(inputJudulBuku, inputPenulisBuku, inputTahunBuku, inputDibaca);
  const bookObject = composeBookObject(inputJudulBuku, inputPenulisBuku, inputTahunBuku, inputDibaca);

  book[BOOK_ITEM_ID] = bookObject.id;
  books.push(bookObject);

  if (inputDibaca) {
    document.getElementById(COMPLETED_BOOK_ID).append(book);
  } else {
    document.getElementById(UNCOMPLETED_BOOK_ID).append(book);
  }
  updateDataToStorage();
}

function inputBook(inputJudul, inputPenulis, inputTahun, inputDibaca) {
  // merangkai elemen judul buku
  const judulBuku = document.createElement("h3");
  judulBuku.classList.add("book-title");
  judulBuku.innerText = inputJudul;

  // merangkai elemen penulis buku
  const penulisBuku = document.createElement("p");
  penulisBuku.classList.add("book-details");
  penulisBuku.innerText = inputPenulis;

  // merangkai elemen tahun terbit buku
  const tahunBuku = document.createElement("p");
  tahunBuku.classList.add("book-details");
  tahunBuku.innerText = inputTahun;

  // merangkai elemen daftar buku dan menambahkan tombol didalamnya
  const buttons = document.createElement("div");
  buttons.classList.add("book-buttons");
  buttons.append(doneButton(inputDibaca));
  buttons.append(editButton());
  buttons.append(deleteButton());

  // membuat elemen data buku menjadi satu
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book-card");
  bookContainer.append(judulBuku, penulisBuku, tahunBuku, buttons);

  return bookContainer;
}

function createButton(buttonType, buttonText, eventListener) {
  // membentuk elemen tombol dan karakteristik masing masing tombol
  const button = document.createElement("button");
  button.innerText = buttonText;
  button.classList.add(buttonType);
  button.addEventListener("click", function (event) {
    eventListener(event);
  });
  return button;
}

function doneButton(status) {
  // membuat tombol selesai dengan event
  // undoBookFromCompleted() / addBookToCompleted() menyesuaikan kondisi
  return createButton("done-button", status ? "Belum Selesai" : "Selesai", function (event) {
    if (status) {
      undoBookFromCompleted(event.target.parentElement.parentElement);
    } else {
      addBookToCompleted(event.target.parentElement.parentElement);
    }
  });
}

function editButton() {
  // membuat tombol edit dengan event 'editBook()'
  return createButton("edit-button", "Edit", function (event) {
    editBook(event.target.parentElement.parentElement);
  });
}

function deleteButton() {
  // membuat tombol hapus dengan event 'removeBook()'
  return createButton("delete-button", "Hapus", function (event) {
    removeBook(event.target.parentElement.parentElement);
  });
}

// memindahkan buku ke rak sudah dibaca
function addBookToCompleted(taskElement) {
  const book = findBook(taskElement[BOOK_ITEM_ID]);
  book.isCompleted = true;

  // membuat data buku baru
  const newBook = inputBook(book.judul, book.penulis, book.tahun, (inputDibaca = true));
  newBook[BOOK_ITEM_ID] = book.id;

  // menambahkan buku kedalam rak sudah dibaca
  const bookCompleted = document.getElementById(COMPLETED_BOOK_ID);
  bookCompleted.append(newBook);

  // menghapus buku dari rak
  taskElement.remove();
  updateDataToStorage();
}

// menampilkan tab edit dan data data buku dijalankan apabila tombol edit pada buku ditekan
function editBook(taskElement) {
  const edit = document.querySelector(".edit-container");
  edit.removeAttribute("hidden");

  const book = findBook(taskElement[BOOK_ITEM_ID]);

  // menampilkan data buku pada form edit
  const editJudulBuku = document.getElementById("editJudulBuku");
  editJudulBuku.value = book.judul;
  const editPenulisBuku = document.getElementById("editPenulisBuku");
  editPenulisBuku.value = book.penulis;
  const editTahunBuku = document.getElementById("editTahunBuku");
  editTahunBuku.value = book.tahun;
  const editDibaca = document.getElementById("editBaca");
  editDibaca.checked = book.isCompleted;

  const submitEdit = document.getElementById("edit-submit");
  submitEdit.addEventListener("click", function (event) {
    // memasukan data baru pada buku yang diedit
    updateEditBook(editJudulBuku.value, editPenulisBuku.value, editTahunBuku.value, editDibaca.checked, book.id);

    // menutup tab edit ketika selesai edit buku
    const edit = document.querySelector(".edit-container");
    edit.setAttribute("hidden", "");
  });
}

// mengupdate data buku di local storage
function updateEditBook(judul, penulis, tahun, dibaca, id) {
  // mengambil data pada local storage dan dikonversi dari String menjadi Objek
  const bookStorage = JSON.parse(localStorage[STORAGE_KEY]);
  const bookIndex = findBookIndex(id);

  // membentuk data baru pada buku
  bookStorage[bookIndex] = {
    id: id,
    judul: judul,
    penulis: penulis,
    tahun: tahun,
    isCompleted: dibaca,
  };

  // mengkonversi data menjadi String dan memasukan data baru pada local storage
  const parsed = JSON.stringify(bookStorage);
  localStorage.setItem(STORAGE_KEY, parsed);

  // memuat halaman setelah data diubah
  location.reload(true);
}

// menghapus buku dari rak buku
function removeBook(taskElement) {
  const hapus = confirm("Apakah kamu ingin menghapus buku?");
  if (hapus) {
    // mencari index buku yang dipilih dan menghapus datanya
    const bookPosition = findBookIndex(taskElement[BOOK_ITEM_ID]);
    books.splice(bookPosition, 1);

    // menghapus buku dari rak
    taskElement.remove();
    updateDataToStorage();
  }
}

// mengembalikan buku ke rak belum dibaca
function undoBookFromCompleted(taskElement) {
  const book = findBook(taskElement[BOOK_ITEM_ID]);
  book.isCompleted = false;

  // membuat data buku baru
  const newBook = inputBook(book.judul, book.penulis, book.tahun, book.isCompleted);
  newBook[BOOK_ITEM_ID] = book.id;

  // menambahkan buku ke rak belum dibaca
  const uncompletedRead = document.getElementById(UNCOMPLETED_BOOK_ID);
  uncompletedRead.append(newBook);

  // menghapus buku lama dari rak
  taskElement.remove();
  updateDataToStorage();
}

// untuk mencari buku
function searchBook(keyword) {
  const bookList = document.querySelectorAll(".book-card");
  for (let book of bookList) {
    const judul = book.childNodes[0];
    if (!judul.innerText.toLowerCase().includes(keyword)) {
      // set display 'none' pada buku apabila judul tidak menganduk keyword yang dicari
      judul.parentElement.style.display = "none";
    } else {
      // menampilkan buku apabila mengandung keyword
      judul.parentElement.style.display = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("input-buku");
  submitForm.addEventListener("submit", function () {
    addBook();
  });

  // menutup tab edit
  const closeForm = document.getElementById("closeForm");
  closeForm.addEventListener("click", function () {
    const edit = document.querySelector(".edit-container");
    edit.setAttribute("hidden", "");
  });

  // memanggil fungsi untuk mencari buku apabila tombol cari ditekan
  const searchButton = document.getElementById("cari");
  searchButton.addEventListener("click", function () {
    const keyword = document.getElementById("inputCariBuku").value;
    searchBook(keyword.toLowerCase());
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener("ondatasaved", () => {
  console.log("Data disimpan.");
});
document.addEventListener("ondataloaded", () => {
  refreshDataFromBooks();
});
