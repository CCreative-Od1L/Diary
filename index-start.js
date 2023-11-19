let diary_data_list = [];

window.addEventListener('load', () => {
    let diary_data = {
        id: '1',
        time: '1700402716000',
        content: 'Hello My Diary'
    };

    let selector = document.querySelector('.selector ul');
    let li = document.createElement('li');
    let div = document.createElement('div');
    
    div.textContent = new Date(Number(diary_data.time)).toLocaleDateString();
    div.setAttribute('data-id', diary_data.id);
    li.appendChild(div);
    selector.appendChild(li);


})

let selector = document.querySelector('.selector ul');

let welcome_page = document.querySelector('.welcome-page');
let edit_area = document.querySelector('.diary-area textarea');

let newButton = document.querySelector('.new-button');
let editButton = document.querySelector('.edit-button');
let saveButton = document.querySelector('.save-button');

editButton.setAttribute('disabled','true');
saveButton.setAttribute('disabled','true');

selector.addEventListener('click', (e) => {
    e.stopPropagation();
    let item = e.target;
    console.log(item.dataset.id);

    editButton.removeAttribute('disabled');
    newButton.removeAttribute('disabled');
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
    edit_area.value = '';
    
    this.setAttribute('disabled', 'true');
    saveButton.removeAttribute('disabled');
}.bind(newButton))

saveButton.addEventListener('click', function () {
    console.log(edit_area.value);

    this.setAttribute('disabled', 'true');
    edit_area.setAttribute('readonly', 'true');

    editButton.removeAttribute('disabled');
    newButton.removeAttribute('disabled');
}.bind(saveButton))

editButton.addEventListener('click', function () {
    edit_area.removeAttribute('readonly');
    this.setAttribute('disabled', 'true');
    saveButton.removeAttribute('disabled');
}.bind(editButton))
