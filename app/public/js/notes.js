var loading_page_container = document.getElementById('loading_page_container');
var username_in_menu = document.getElementById('username_in_menu');
var notes_container = document.getElementById('notes_container');
var search_by_tag_button = document.getElementById('search_by_tag_button');
var tag_input = document.getElementById('tag_input');

function show_loading(show){
    if (show == true) {
        loading_page_container.style.display = "flex";
    } else if (show == false) {
        loading_page_container.style.display = "none";
    }
}

show_loading(true);

function add_context__to_notes_container(notes_list){
    var notes_conteiner_inner_html = "";

    for (var i = 0; i < notes_list.length; i++) {     
        if (notes_list[i].tag != null && notes_list[i].tag != "") {
            notes_conteiner_inner_html += '<pre class="alert alert-warning col-lg-8 col-md-8" id="' + notes_list[i].id + '" role="alert" onclick="note_onclick(this.id);">' + '<h6 class="alert-heading" style="font-weight: 900;">#' + notes_list[i].tag + '</h6>' + notes_list[i].note_value + '</pre>';
        } else {
            notes_conteiner_inner_html += '<pre class="alert alert-warning col-lg-8 col-md-8" id="' + notes_list[i].id + '" role="alert" onclick="note_onclick(this.id);">' + notes_list[i].note_value + '</pre>';
        }
    }

    return notes_conteiner_inner_html;
}

function note_onclick(note_id){
    var xhr_note_id = new XMLHttpRequest();

    xhr_note_id.open('POST', '/note_id_for_change');

    xhr_note_id.setRequestHeader('Content-Type', 'application/json');

    xhr_note_id.send(JSON.stringify({
        note_id_for_change : note_id
    }));

    xhr_note_id.onreadystatechange = function() {
        if (xhr_note_id.readyState == 4) {
            document.location.href = '/note';
        }
    };
}

search_by_tag_button.onclick = function(){
    var xhr_search_by_tag = new XMLHttpRequest();

    xhr_search_by_tag.open('POST', '/search_by_tag');

    xhr_search_by_tag.setRequestHeader('Content-Type', 'application/json');

    xhr_search_by_tag.responseType = 'json';

    xhr_search_by_tag.send(JSON.stringify({
        tag : tag_input.value
    }));

    xhr_search_by_tag.onreadystatechange = function() {
        if (xhr_search_by_tag.readyState == 4) {
            show_loading(false);

            var search_by_tag_responseObj = xhr_search_by_tag.response;
            username_in_menu.innerHTML = search_by_tag_responseObj.username;
            notes_container.innerHTML = add_context__to_notes_container(search_by_tag_responseObj.notes_list);

            console.log(search_by_tag_responseObj);
        }
    };

}

var xhr = new XMLHttpRequest();

xhr.open('POST', '/notes_loading');

xhr.responseType = 'json';

xhr.send();

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        show_loading(false);

        var responseObj = xhr.response;
        username_in_menu.innerHTML = responseObj.username;
        notes_container.innerHTML = add_context__to_notes_container(responseObj.notes_list);
    }
};



