let diary_dacta_list = [];
const db_name = 'diaries';  // * 数据库名称
const table_name = 'diaries';  // * 表名称
let db;  // * 数据库实例

class DbRequestFunction {
    constructor(request) {
        this.request = request;
    }  
    onRequestError(callback) {
        this.request.addEventListener('error', callback);
    }
    onRequestSuccess(callback) {
        this.request.addEventListener('success', callback);
    }
    onRequestUpgradeneeded(callback) {
        this.request.addEventListener('upgradeneeded', callback);
    }
};

window.addEventListener('load', () => {
    let request = window.indexedDB.open(db_name, 2);
    let DbFunctionInstance = new DbRequestFunction(request);

    DbFunctionInstance.onRequestError(() => {
        console.log('Database failed to open');
    })

    DbFunctionInstance.onRequestSuccess(function() {
        console.log('Database opened successfully');
        db = this.request.result;
        displayDiaryList();
    }.bind(DbFunctionInstance))

    DbFunctionInstance.onRequestUpgradeneeded((e) => {
        let objectStore = e.target.result.createObjectStore(table_name, {
            keyPath: 'id',
            autoIncrement: true,
        });
        objectStore.createIndex('createTime', 'time', { unique: false });
        objectStore.createIndex('content', 'content', { unique: false });
        objectStore.createIndex('modifiedTime', 'mTime', { unique: false });
        console.log('Database setup complete');
    })
})

function addDiary(content_val) {
    let newItem = {
        time: Date.now(),
        modifiedTime: Date.now(),
        content: content_val,
    };

    let transaction = db.transaction(db_name, 'readwrite')
    let objectStore = transaction.objectStore(table_name);
    var request = objectStore.add(newItem);
    request.addEventListener('success', () => {
        console.log('Add Success');
    })
}

let selector = document.querySelector('.selector ul');
let welcome_page = document.querySelector('.welcome-page');
let edit_area = document.querySelector('.diary-area textarea');

let newButton = document.querySelector('.new-button');
let editButton = document.querySelector('.edit-button');
let saveButton = document.querySelector('.save-button');
let deleteButton = document.querySelector('.delete-button');


function InitButtons() {
    newButton.removeAttribute('disabled');
    editButton.setAttribute('disabled', 'true');
    saveButton.setAttribute('disabled', 'true');
    deleteButton.setAttribute('disabled', 'true');
}

InitButtons();

function RemoveClass(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className);
    }
}

function AddClass(element, className) {
    if (!element.classList.contains(className)) {
        element.classList.add(className);
    }
}

function SetReadStatus() {
    editButton.removeAttribute('disabled');
    newButton.removeAttribute('disabled');
    deleteButton.removeAttribute('disabled');
    saveButton.setAttribute('disabled', 'true');
    edit_area.setAttribute('readonly', 'true');
}

function SetEditStatus() {
    edit_area.setAttribute('placeholder', '记录日常小事');
    edit_area.removeAttribute('readonly');
    
    newButton.setAttribute('disabled', 'true');
    saveButton.removeAttribute('disabled');
    deleteButton.setAttribute('disabled', 'true');
}

function Switch2WelcomePage() {
    AddClass(edit_area, 'not-display');
    RemoveClass(welcome_page, 'not-display');
}

function Switch2EditPage() {
    AddClass(welcome_page, 'not-display');
    RemoveClass(edit_area, 'not-display');
}

function TryToSetActive() {
    if (selector.firstChild) {
        AddClass(selector.firstChild.childNodes[0], 'active');
        let objectStore = db.transaction(db_name).objectStore(table_name);
        let request = objectStore.get((Number)(selector.firstChild.childNodes[0].dataset.id))
        
        request.addEventListener('success', () => {
            edit_area.value = request.result.content;
        })

        Switch2EditPage();
        SetReadStatus();
    } else {
        Switch2WelcomePage();
        InitButtons();
    }
}

function CleanActive() {
    selector.querySelectorAll('.active').forEach(element => {
        RemoveClass(element, 'active');
    });
}

function HasActive() {
    return selector.querySelector('.active') ? true : false;
}

selector.addEventListener('click', (e) => {
    e.stopPropagation();
    let currentActiveElement = selector.querySelector('.active');
    if (currentActiveElement) {
        RemoveClass(currentActiveElement, 'active');
    }
    
    let item = e.target;
    if (item.tagName === 'DIV') {
        AddClass(item, 'active');
    } else {
        Switch2WelcomePage();
        return;
    }

    let objectStore = db.transaction(db_name).objectStore(table_name);
    let request = objectStore.get((Number)(item.dataset.id))
    
    request.addEventListener('success', () => {
        edit_area.value = request.result.content;
    })

    Switch2EditPage();
    SetReadStatus();
})

newButton.addEventListener('click', function () {
    Switch2EditPage();
    SetEditStatus();
    edit_area.value = '';
    CleanActive();
}.bind(newButton))

saveButton.addEventListener('click',function () {
    if (edit_area.value) {
        if (HasActive()) {
            const objectStore = db.transaction(db_name, 'readwrite').objectStore(table_name);
            objectStore.get((Number)(selector.querySelector('.active').dataset.id)).addEventListener('success', (e) => {
                const data = e.target.result;
                data.content = edit_area.value;
                data.modifiedTime = Date.now();
                objectStore.put(data).addEventListener('success', () => {
                    console.log('update success.');
                })
            })
        } else {
            addDiary(edit_area.value);
        }
    }
    SetReadStatus();

    displayDiaryList();
}.bind(saveButton))

editButton.addEventListener('click', function () {
    if (!selector.querySelector('.active')) {
        return;
    }
    SetEditStatus();
}.bind(editButton))

deleteButton.addEventListener('click', function () {
    let item = selector.querySelector('.active');
    if (!item) {
        return;
    }
    console.log(item.dataset.id);
    let transaction = db.transaction(db_name, 'readwrite');
    let objectStore = transaction.objectStore(table_name);
    objectStore.delete((Number)(item.dataset.id));

    transaction.addEventListener('complete', () => {
        item.parentNode.parentNode.removeChild(item.parentNode);
        TryToSetActive();
    })

}.bind(deleteButton))

function displayDiaryList() {
    while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
    }

    let objectStore = db.transaction(db_name).objectStore(table_name);
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

        TryToSetActive();
    })
}
