const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Ajouter cette ligne
const app = express();
const port = 3001; // Changer le port ici

const filePath = path.join(__dirname, 'films.json');
const omdbApiKey = 'ead0720d'; // Remplacez par votre clé API OMDB

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques (ex: index.html)
app.use(express.static('public'));

// Charger les films depuis le fichier JSON
app.get('/films', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Erreur lecture fichier' });
        res.json(JSON.parse(data || '[]'));
    });
});

// Ajouter un film
app.post('/films', (req, res) => {
    let film = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        let films = data ? JSON.parse(data) : [];
        
        // Vérifier si le film existe déjà
        if (films.some(f => f.titre === film.titre)) {
            return res.status(400).json({ error: 'Le film existe déjà' });
        }

        films.push(film);

        fs.writeFile(filePath, JSON.stringify(films, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Erreur écriture fichier' });
            res.json({ message: 'Film ajouté', film });
        });
    });
});

// Supprimer un film par son titre
app.delete('/films/:titre', (req, res) => {
    let titre = req.params.titre;

    fs.readFile(filePath, 'utf8', (err, data) => {
        let films = data ? JSON.parse(data) : [];
        films = films.filter(f => f.titre !== titre);

        fs.writeFile(filePath, JSON.stringify(films, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Erreur écriture fichier' });
            res.json({ message: 'Film supprimé' });
        });
    });
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`✅ Serveur sur http://localhost:${port}`);
});
