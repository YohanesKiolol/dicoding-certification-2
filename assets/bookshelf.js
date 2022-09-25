const books = [];
let filterTitle = "";
const RENDER_EVENT = "render_books";
const STORAGE_KEY = "BOOK_SHELF";

const generateId = () => {
  return +new Date();
};

const generateBookObject = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

const checkStorage = () => {
  return typeof Storage !== undefined;
};

const saveStorageBook = () => {
  if (checkStorage()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
};

const loadStorageBook = () => {
  const jsonBook = localStorage.getItem(STORAGE_KEY);
  let booksData = JSON.parse(jsonBook);

  if (booksData !== null) {
    for (const book of booksData) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const findBook = (id) => {
  return books.find((book) => book.id === id);
};

const addBook = () => {
  const title = document.querySelector("#title").value.trim();
  const author = document.querySelector("#author").value.trim();
  const year = document.querySelector("#year").value;

  const generateID = generateId();
  const bookObject = generateBookObject(generateID, title, author, year, false);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveStorageBook();
};

const toogleStatus = (id) => {
  const bookTarget = findBook(id);

  if (bookTarget == null) alert("Cannot Find Book");

  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveStorageBook();
};

const editBook = (id) => {
  const actionContainers = document.querySelectorAll(".action-container");

  for (let i = 0; i < actionContainers.length; i++) {
    actionContainers[i].style.display = "none";
  }

  const bookTarget = findBook(id);
  const formSubmit = document.querySelector("#book-form");
  const submitButton = formSubmit.querySelector("#btn-submit");
  const cellContainer = document.querySelector(`#book-${id}`);
  const cancelButton = document.querySelector("#btn-cancel");

  if (bookTarget == null) alert("Cannot Find Book");
  else {
    const formTitle = document.querySelector("#form-title");
    formSubmit.removeEventListener("submit", addBookListener);
    cellContainer.style.backgroundColor = "#A2ECE6";
    cellContainer.style.transitionDuration = "0.4s";
    cancelButton.style.display = "";
    submitButton.value = "Update";
    formTitle.innerText = "Edit-Book";
  }

  const titleInput = document.querySelector("#title");
  const authorInput = document.querySelector("#author");
  const yearInput = document.querySelector("#year");

  titleInput.value = bookTarget.title;
  authorInput.value = bookTarget.author;
  yearInput.value = bookTarget.year;

  formSubmit.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      if (e.submitter.value === "Update") {
        bookTarget.title = titleInput.value;
        bookTarget.author = authorInput.value;
        bookTarget.year = yearInput.value;

        formSubmit.reset();
        document.dispatchEvent(new Event(RENDER_EVENT));

        formSubmit.addEventListener("submit", addBookListener);

        saveStorageBook();
      } else if (e.submitter.value === "Cancel") {
        formSubmit.reset();
      }
      submitButton.value = "Save";
      cancelButton.style.display = "none";
      cellContainer.style.backgroundColor = "";
    },
    { once: true }
  );
};

const deleteBook = (id) => {
  const bookTarget = findBook(id);

  if (bookTarget == null) alert("Cannot Find Book");

  books.splice(books.indexOf(bookTarget), 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveStorageBook();
};

const makeCellProperties = (properties) => {
  const cellProp = document.createElement("td");
  cellProp.innerText = properties;

  return cellProp;
};

const makeButton = (buttonName) => {
  const button = document.createElement("img");
  button.setAttribute("src", `assets/images/svg_${buttonName}.svg`);
  button.setAttribute("alt", `${buttonName} icon`);
  button.setAttribute("id", `${buttonName}-icon`);
  button.classList.add("icon");

  return button;
};

const makeBookRow = ({ id, title, author, year, isComplete }) => {
  const titleCell = makeCellProperties(title);
  const authorCell = makeCellProperties(author);
  const yearCell = makeCellProperties(year);

  const tableRow = document.createElement("tr");
  tableRow.classList.add("cell-container");
  tableRow.setAttribute("id", `book-${id}`);
  tableRow.append(titleCell, authorCell, yearCell);

  const actionCell = document.createElement("td");
  actionCell.classList.add("action-cell");

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action-container");

  const editButton = makeButton("edit");
  actionContainer.append(editButton);

  editButton.addEventListener("click", () => editBook(id));

  actionCell.append(actionContainer);
  tableRow.append(actionCell);

  if (!isComplete) {
    const finishedButton = makeButton("finished");
    actionContainer.append(finishedButton);

    finishedButton.addEventListener("click", () => toogleStatus(id));
  } else {
    const undoButton = makeButton("undo");
    actionContainer.append(undoButton);

    undoButton.addEventListener("click", () => {
      toogleStatus(id);
    });
  }

  const deleteButton = makeButton("delete");
  actionContainer.append(deleteButton);

  deleteButton.addEventListener("click", () => deleteBook(id));

  actionCell.append(actionContainer);
  tableRow.append(actionCell);

  return tableRow;
};

const addBookListener = (e) => {
  const formSubmit = document.querySelector("#book-form");
  const submitButton = formSubmit.querySelector("#btn-submit");
  e.preventDefault();

  if (submitButton.value !== "Update" && e.submitter.value !== "Cancel") {
    try {
      addBook();
      formSubmit.reset();
    } catch (e) {
      console.log(e);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const formSubmit = document.querySelector("#book-form");
  const formFilter = document.querySelector("#filter-form");

  if (checkStorage()) {
    loadStorageBook();
  }

  formSubmit.addEventListener("submit", addBookListener);

  formFilter.addEventListener("submit", (e) => e.preventDefault());

  formFilter.addEventListener("keyup", (e) => {
    filterTitle = e.target.value;
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  document.dispatchEvent(new Event(RENDER_EVENT));
});

document.addEventListener(RENDER_EVENT, () => {
  const unfinishTable = document.querySelector("#unfinish-list");
  const finishTable = document.querySelector("#finish-list");
  unfinishTable.innerHTML = "";
  finishTable.innerHTML = "";

  const noUnfinishBookRow = document.createElement("tr");

  const noBooksCell = document.createElement("td");
  noBooksCell.setAttribute("colspan", "100%");

  const noBooksContainer = document.createElement("div");
  noBooksContainer.style.cssText = `text-align: center; padding: 20px`;

  const noBooksFigure = document.createElement("figure");

  const noDataImg = document.createElement("img");
  noDataImg.setAttribute("src", "assets/images/png_nodata.png");

  const noBooksFigCaption = document.createElement("figcaption");
  noBooksFigCaption.style.cssText = `font-weight: bold; text-transform: uppercase`;
  noBooksFigCaption.innerText = "No Books";

  noBooksFigure.append(noDataImg, noBooksFigCaption);
  noBooksContainer.append(noBooksFigure);
  noBooksCell.append(noBooksContainer);
  noUnfinishBookRow.append(noBooksCell);

  const noFinishBookRow = noUnfinishBookRow.cloneNode(true);

  let filterBook = filterTitle
    ? books.filter(
        (book) =>
          book.title.toLowerCase().indexOf(filterTitle.toLowerCase().trim()) >
          -1
      )
    : books;

  if (!filterBook.find((book) => book.isComplete === true)) {
    finishTable.append(noUnfinishBookRow);
  }
  if (!filterBook.find((book) => book.isComplete === false)) {
    unfinishTable.append(noFinishBookRow);
  }

  for (const book of filterBook) {
    const bookRow = makeBookRow(book);
    if (!book.isComplete) {
      unfinishTable.append(bookRow);
    } else {
      finishTable.append(bookRow);
    }
  }
});
