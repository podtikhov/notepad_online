var loading_page_container = document.getElementById('loading_page_container');


function show_loading(show){
    if (show == true) {
        loading_page_container.style.display = "flex";
    } else if (show == false) {
        loading_page_container.style.display = "none";
    }
}

show_loading(true);

var xhr = new XMLHttpRequest();

xhr.open('POST', '/note_loading');

xhr.responseType = 'json';

xhr.send();

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        show_loading(false);

        var responseObj = xhr.response;
        username_in_menu.innerHTML = responseObj.username;
    }
};
