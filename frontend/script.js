const APILINK = 'https://api.themoviedb.org/3/movie/popular?api_key=f1b5709a19a8ec6457accf986285552c';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?api_key=f1b5709a19a8ec6457accf986285552c&query=";

const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const home = document.getElementById("home");


const previousSearch = sessionStorage.getItem('searchQuery');
if (previousSearch) {
    returnMovies(SEARCHAPI + previousSearch);
} else {
    returnMovies(APILINK);
};


function returnMovies(url) {
    fetch(url)
        .then(res => res.json())
        .then(function(data) {
            console.log(data.results);
            data.results.forEach(element => {
                const link = document.createElement('a');
                link.href = `movieReview.html?id=${element.id}&title=${encodeURIComponent(element.title)}&image=${encodeURIComponent(IMG_PATH + element.poster_path)}`;
                link.setAttribute('class', 'cardMovie-link');
                link.style.textDecoration = 'none';

                const div_card = document.createElement('div');
                div_card.setAttribute('class', 'card');

                const div_row = document.createElement('div');
                div_row.setAttribute('class', 'row');

                const div_column = document.createElement('div');
                div_column.setAttribute('class', 'column');

                const image = document.createElement('img');
                image.setAttribute('class', 'thumbnail');
                image.setAttribute('id', 'image');

                const title = document.createElement('h3');
                title.setAttribute('id', 'title');

                title.innerHTML = `${element.title}`;
                image.src = IMG_PATH + element.poster_path;

                div_card.appendChild(image);
                div_card.appendChild(title);
                link.appendChild(div_card); 
                div_column.appendChild(link);
                div_row.appendChild(div_column);
                main.appendChild(div_row);
            })
        })
        .catch(function(error) {
            console.error('Error fetching data:', error);
        });
}

form.addEventListener("submit", (e) => {  
    e.preventDefault();
    main.innerHTML = '';

    const searchItem = search.value;

    if (searchItem) {
        sessionStorage.setItem('searchQuery', searchItem);
        returnMovies(SEARCHAPI + searchItem);
        search.value = '';
    }
});

home.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem('searchQuery');     
    sessionStorage.removeItem('previousSearch');  
    main.innerHTML = '';
    returnMovies(APILINK);    
});

