# regles

## Généralités

Les cartes d'un jeu de 52 :

liste_cartes=['2d','3d','4d','5d','6d','7d','8d','9d','Td','Jd','Qd','Kd','Ad']
liste_cartes+=['2h','3h','4h','5h','6h','7h','8h','9h','Th','Jh','Qh','Kh','Ah']
liste_cartes+=['2s','3s','4s','5s','6s','7s','8s','9s','Ts','Js','Qs','Ks','As']
liste_cartes+=['2c','3c','4c','5c','6c','7c','8c','9c','Tc','Jc','Qc','Kc','Ac']

Mains de poker par ordre décroissant + exemple :

quinte flush : 4d 5d 6d 7d 8d (une quinte de la même couleur) Note: La couleur correspond à pique(s),carreau(d),coeur(h) ou trèfle
(c)
carre : Kd Kc Ks Kh
full house : Kd Ks 3d 3h 3s
Couleur : 4s 8s Js Ks As
quinte : 8d 9h Th Js Qc
Brelan : 3d 5c Qc Qh Qd
Deux paires : 8c Ts Th Ac Ad
Une paire : 2s 2h 7h 9d Ts
Hauteur : 7c Td Jh Ks Ac

Le jeu se déroule en quatre tours d'enchères et un abbatage (showdown):

Le préflop : 
-Les joueurs recoivent leurs 2 cartes privées
-Les deux joueurs en blindes posent leurs blindes (une mise forcée)
-Le joueur situé à gauche de la grosse blinde parle en premier
-Le sens de parole est le sens horaire
-Le tour d'enchère se termine quand les mises entres les joueurs sont équilibrées ou qu'un seul joueur restant est en jeu

Le flop: 
-Le croupier révèle 3 cartes communes
-Les joueurs jouent comme au flop
-Le 1er à parler est la petite blinde

La turn:
-Le croupier révèle une 4ème carte commune


La River
-Le croupier révèle une 5ème et dernière carte commune


Le showdown
-Les jeux des joueurs restant sont comparés
-Le joueur ayant le meilleur jeu remporte le pot

## Axe de progression

-> Crée un objet "Joueur" :

class Joueur:#Classe joueur
    def \__init__(self,pseudo,stack,position,is_bot):      
        self.pseudo = pseudo #Pseudo du joueur , string
        self.stack = stack   #Nombre de jetons possèdant le joueur, int 
        self.position = position #Position à la table, int
        self.main=None #La main du joueur , list
        self.mise=0   #La mise du joueur  ,  float
        self.est_en_jeu=False #Indique si le joueur est toujours en jeu , bool
        self.a_joue=False #Indique si le joueur a joué ce tour
        self.est_allin=False #Indique si le joueur est à tapis
        self.btn=False #Indique si le joueur est au bouton
        self.gain_pot=0 #Indique le gain actuel potentiel du joueur


-> Crée un objet "Table de jeu" comportant :

-Le tableau (l'ensemble de cartes communes)
-Le pot
-Le résidu de pot
-Le paquet de cartes


-> Une fonction permettant de trouver le meilleur jeu parmi une liste de jeu.

-> Une fonction permettant de trouver le meilleur jeu d'un joueur parmi sa main et les cartes communes.








