let diary_dacta_list = [];

let db;  // * 数据库实例

window.addEventListener('load', () => {
    let request = window.indexedDB.open('diaries', 1);

    request.addEventListener('error', () => {
        console.log('Database failed to open');
    })

    request.addEventListener('success', () => {
        console.log('Database opened successfully');
        db = request.result;
        displayDiaryList();
    })

    request.addEventListener('upgradeneeded', (e) => {
        let objectStore = e.target.result.createObjectStore('diaries', {
            keyPath: 'id',
            autoIncrement: true,
        });
        objectStore.createIndex('time', 'time', { unique: false });
        objectStore.createIndex('content', 'content', { unique: false });

        console.log('Database setup complete');
    })
})

function addDiary(content_val) {
    let newItem = {
        time: Date.now(),
        content: content_val,
    };

    let transaction = db.transaction(['diaries'], 'readwrite')
    let objectStore = transaction.objectStore('diaries');
    var request = objectStore.add(newItem);
    request.addEventListener('success', () => {
        console.log('Add Success');
    })

    transaction.addEventListener('complete', () => {
        console.log('transaction completed');
    })

    transaction.addEventListener('error', () => {
        console.log('transaction not opened due to error');
    })
}

let selector = document.querySelector('.selector ul');

let welcome_page = document.querySelector('.welcome-page');
let edit_area = document.querySelector('.diary-area textarea');

let newButton = document.querySelector('.new-button');
let editButton = document.querySelector('.edit-button');
let saveButton = document.querySelector('.save-button');
let deleteButton = document.querySelector('.delete-button');

editButton.setAttribute('disabled', 'true');
saveButton.setAttribute('disabled', 'true');
deleteButton.setAttribute('disabled', 'true');

selector.addEventListener('click', (e) => {
    e.stopPropagation();
    let item = e.target;
    console.log(item.dataset.id);

    let objectStore = db.transaction('diaries').objectStore('diaries');
    let request = objectStore.get((Number)(item.dataset.id))
    request.addEventListener('success', () => {
        edit_area.value = request.result.content;
    })

    if (!welcome_page.classList.contains('not-display')) {
        welcome_page.classList.add('not-display');
    }
    if (edit_area.classList.contains('not-display')) {
        edit_area.classList.remove('not-display');
    }
    editButton.removeAttribute('disabled');
    newButton.removeAttribute('disabled');
    deleteButton.removeAttribute('disabled');
    saveButton.setAttribute('disabled', 'true');
    edit_area.setAttribute('readonly', 'true');
})

newButton.addEventListener('click', function () {
    if (!welcome_page.classList.contains('not-display')) {
        welcome_page.classList.add('not-display');
    }
    if (edit_area.classList.contains('not-display')) {
        edit_area.classList.remove('not-display');
    }

    edit_area.setAttribute('placeholder', '记录日常小事');
    edit_area.removeAttribute('readonly');
    edit_area.value = '';
    
    this.setAttribute('disabled', 'true');
    saveButton.removeAttribute('disabled');
    deleteButton.setAttribute('disabled', 'true');
}.bind(newButton))

saveButton.addEventListener('click', function () {
    if (edit_area.value) {
        addDiary(edit_area.value);
    }

    this.setAttribute('disabled', 'true');
    edit_area.setAttribute('readonly', 'true');
    deleteButton.setAttribute('disabled', 'true');

    editButton.removeAttribute('disabled');
    newButton.removeAttribute('disabled');

    displayDiaryList();
}.bind(saveButton))

editButton.addEventListener('click', function () {
    edit_area.removeAttribute('readonly');
    this.setAttribute('disabled', 'true');
    saveButton.removeAttribute('disabled');
    deleteButton.setAttribute('disabled', 'true');
}.bind(editButton))

deleteButton.addEventListener('click', function () {
    
}.bind(deleteButton))

function displayDiaryList() {
    while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
    }

    let objectStore = db.transaction('diaries').objectStore('diaries');
    objectStore.openCursor().addEventListener('success', (e) => {
        let cursor = e.target.result;

        if (cursor) {
            let li = document.createElement('li');
            let div = document.createElement('div');
            
            div.textContent = new Date(cursor.value.time).toLocaleString();
            div.setAttribute('data-id', cursor.value.id);
            li.appendChild(div);
            selector.appendChild(li);

            cursor.continue();
        }
    })
}
