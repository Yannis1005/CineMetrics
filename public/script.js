document.addEventListener("DOMContentLoaded", () => {
    chargerFilms();
    document.getElementById("boutonRecherche").addEventListener("click", rechercherFilms);
});

function chargerFilms() {
    fetch('/films')
        .then(response => response.json())
        .then(films => {
            // Trier les films par score décroissant
            films.sort((a, b) => b.score - a.score);
            let tableau = document.getElementById("tableFilms").getElementsByTagName("tbody")[0];
            tableau.innerHTML = "";
            films.forEach(ajouterFilmAuTableau);
        });
}

function ajouterFilmAuTableau(film) {
    let tableau = document.getElementById("tableFilms").getElementsByTagName("tbody")[0];
    let nouvelleLigne = tableau.insertRow();
    
    nouvelleLigne.innerHTML = `<td>${film.titre}</td>
                               <td>${film.oscars}</td>
                               <td>${film.imdbRank}</td>
                               <td>${film.annee}</td>
                               <td>${film.duree} min</td>
                               <td><strong>${film.score}</strong></td>
                               <td><button onclick="supprimerLigne(this, '${film.titre}')">❌</button></td>`;
}

function supprimerLigne(bouton, titre) {
    fetch(`/films/${encodeURIComponent(titre)}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(() => {
        let ligne = bouton.parentNode.parentNode;
        ligne.parentNode.removeChild(ligne);
        chargerFilms(); // Recharger les films pour mettre à jour le tri
    });
}

function extraireOscars(awards) {
    let oscars = 0;
    if (awards.includes("Won")) {
        const awardsMatch = awards.match(/(\d+) Oscars?/);
        if (awardsMatch) {
            oscars = parseInt(awardsMatch[1]);
        }
    }
    return oscars;
}

function calculerScore(film) {
    let w1 = 1, w2 = 2, w3 = 1, w4 = 2;
    let minAnnee = 1900;
    let maxDuree = 240;
    return Math.max(0, Math.round(
        (w1 * film.oscars * 20) +
        (w2 * (30 * film.imdbRank)) +
        (w3 * (film.annee - minAnnee) * 2) + 
        (w4 * (maxDuree - film.duree))
    ));
}

function rechercherFilms() {
    let query = document.getElementById("recherche").value;
    fetch(`http://www.omdbapi.com/?apikey=ead0720d&t=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(film => {
            let resultats = document.getElementById("resultatsRecherche");
            resultats.innerHTML = "";
            if (film.Response === 'True') {
                let oscars = extraireOscars(film.Awards);

                let filmAjoute = {
                    titre: film.Title,
                    oscars: oscars,
                    imdbRank: film.imdbRating || "250",
                    annee: parseInt(film.Year) || 1900,
                    duree: parseInt(film.Runtime) || 180,
                    score: 0 // Calculer le score ici si nécessaire
                };

                filmAjoute.score = calculerScore(filmAjoute);

                let tableau = document.getElementById("tableFilms").getElementsByTagName("tbody")[0];
                let filmExiste = Array.from(tableau.rows).some(row => row.cells[0].innerText === filmAjoute.titre);

                if (!filmExiste) {
                    fetch('/films', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(filmAjoute)
                    })
                    .then(response => response.json())
                    .then(() => {
                        // Recharger les films pour mettre à jour le tri
                        chargerFilms();
                    });
                }

                resultats.innerHTML = "";
            } else {
                resultats.innerHTML = "Aucun film trouvé";
            }
        });
}
