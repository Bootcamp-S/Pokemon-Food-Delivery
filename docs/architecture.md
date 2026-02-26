# Architektur-Dokumentation

Diese Dokumentation beschreibt die Architektur des PokéDelivery-Systems, genauer gesagt der CI/CD-Pipeline sowie der dazugehörigen Branching-Strategie. 
Gegeben ist ein Anwendungsprogramm, dessen Entwicklung über die Pipeline geregelt wird.

# 1. Pipeline
Die zentrale Komponente der Pipeline ist Jenkins. Es ist das System, über das die Steuerung der gesamten Pipeline abläuft. Jenkins kommuniziert mit einem Github-Repository, auf dem der Quellcode der Anwendung liegt, sowie mit Azure, wo das Deployment der Anwendung in eine Function App vollzogen wird. 

#### Repository: Github
Hier liegt der Quellcode der Anwendung, der von Entwicklern bearbeitet werden kann, um, gemäß der Branching-Strategie, die Pipeline auszuführen.
Hierfür liegt neben dem Quellcode auch eine `Jenkinsfile`, eine Definition der Umsetzung der Pipeline für Jenkins, im Repository auf den Branches.

#### Server: Jenkins
Dient als Controller.
Ihm stehen in dieser Architektur zwei separate Agenten zur Verfügung, auf denen die Pipeline laufen kann. Die Agenten können geziehlt oder beliebig angesteuert werden.

Der Controller wie auch die Agenten laufen in separaten Docker Containern auf demselben Gerät, hier einem Raspberry Pi 3B+.
Für letztere gibt es ein spezielles Docker Image, das die damit angelegten Agenten mit den notwendigen Bibliotheken ausstattet, darunter Azure CLI für den Login und das Deployment in Azure.

#### Deployment: Azure
Dieser Schritt kann über den Controller manuell ausgelöst werden, wonach der Stand der Anwendung auf dem stabilen Branch `main` im Repository bei erfolgreichem Durchlaufen der Pipeline in eine Azure Function App deployed wird.  

Die Ressourcen, auf die das Deployment in Azure ausgeführt wird, können mittels Terraform automatisch erstellt werden.

#### Monitoring: Prometheus und Grafana
Verschiedene Metriken werden von Jenkins über das Prometheus-Plugin zur Verfügung gestellt und auf einem Grafana-Dashboard visualisiert. 


# 2. Branching-Strategie
Diese arbeitet mit zwei Branches, einem stabilen Branch namens `main` und einem Entwicklungs-Branch namens `dev`. Direkte Änderungen am Quellcode werden in `dev` vorgenommen: Der `push` von `commits` in diesem Branch löst automatisch einen Build- und Testprozess in der Pipeline aus. Jenkins scannt hierfür regelmäßig das Repository auf Änderungen. Wurden auf `dev` Änderungen hochgeladen, lässt der Controller gemäß des Inhalts der Jenkinsfile in `dev` (die gleiche wie in `main`) auf einem freien Agenten den Build- und Testprozess durchlaufen. Auf Jenkins und Github kann eingesehen werden, ob es hier zu Fehlern gekommen ist oder nicht. Das Integrieren von Änderungen von `dev` nach `main` ist nur über das Erstellen eines entsprechenden Pull Requests möglich, woraufhin der Build- und Testprozess starten. Laufen diese erfolgreich durch und wird das Review akzeptiert, kann der Pull Request gemerged werden. 
Das Deployment erfolgt manuell über Jenkins und übernimmt den Stand in `main`. Hier wird nun die gesamte Pipeline durchlaufen (bei `dev` wird der Deployment-Teil im Jenkinsfile übersprungen).

# 3. Begründung für gewählte Werkzeuge & Systeme

#### GitHub
Die meistgenutzte Plattform für Versionskontrolle und kollaborative Softwareentwicklung, kostenfrei und schnell aufgesetzt. Mit Github Actions können CI/CD-Pipeline-Methodiken (testweise) umgesetzt werden.

#### Jenkins
Bei Jenkins handelt es sich um ein mächtiges und erweiterbares, selbst-gehostetes System zur Umsetzung von CI/CD-Pipelines. Build‑, Test‑ und Deployment‑Prozesse lassen sich automatisieren, und durch ein umfangreiches Plugin‑Ökosystem ist es sehr flexibel und macht praktisch jede Pipeline‑Funktionialität umsetzbar. Komponenten der Pipelines lassen sich über 'Infrastructure as Code' definieren. Jenkins ist plattform-unabhängig und bedarf keiner Lizenz.  
Github Actions und Gitlab CI bieten ebenfalls die Funktionalitäten um diese Pipeline umsetzen zu können, bieten aber nicht den Grad an Kontrolle wie Jenkins mit Selbst-Hosting. Mit Jenkins ist man unabhängig vom genutzten Git-Provider und nicht in den verfügbaren 'Build-Minuten' begrenzt. 
Zudem bietet Jenkins starke Unterstützung von Build-Agenten die beliebig konfigurierbar sind, und Jenkins-Plugins bieten alle Möglichkeiten in Bezug auf Security und Funktionalität.

#### Azure
Um die gegebene Anwendung 'serverless' aufzusetzen eignen sich Azure Function Apps bestens. 

#### Terraform
In Azure können Terraform-Konfigurationen von existierenden Ressourcen extrahiert werden, was die Verwendung erleichtert.

#### Docker
Die ideale Software zur Containervirtualisierung für diesen Anwendungsfall: Leichtgewichtig (ob des begrenzten Speicherplatzes auf der SD-Karte) und geeignet zur Erstellung einzelner, leichtgewichtiger Container (wie auch identischer Build-Agenten über ein gemeinsames Image) die innerhalb des Netzwerks miteinander kommunizieren können. 
Schnell und benutzerfreundlich, mit riesigem Ökosystem.

#### Grafana und Prometheus
Über das `Prometheus metrics plugin` werden Metriken an einem speziellen Endpunkt von Jenkins zur Verfügung gestellt.
Sowohl Grafana als auch Prometheus können in separaten Containern aufgesetzt werden, wobei Prometheus die Metriken vom Endpunkt an Grafana zur Visualisierung in einem Dashboard überträgt. Das Zusammenspiel von Jenkins, Grafana und Prometheus zur Visualsierung von CI/CD-Metriken ist so bequem umsetzbar.

# 4. Jenkins Plugins
Im Jenkins Controller wurden folgende Plugins installiert:
`NodeJS`, `HTTP Request Plugin`, `Prometheus metrics plugin` und `Role-based Authorization Strategy`. 
Diese Plugins haben mehrere Abhängigkeiten.
Eine vollständige Liste aller installierten Plugins ist in der Datei `jenkins-pluins-list.txt` aufgeführt.


# 5. API der Anwendung

Die Anwendung stellt einen GET-Endpunkt bereit, über den Anfragen über Pokémon über ihren Namen gestellt werden können. Das Ergebnis ist eine JSON-Datenstruktur, die unter anderem die ID und die präferierte Nahrung des Pokémon enthält.  
Läuft intern über [PokéAPI](https://pokeapi.co/).

| Methode | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/getPokemon` | Ruft Pokemon-Daten ab |

```json
{
  name: 'pikachu',
  id: 25,
  height: 4,
  weight: 60,
  base_experience: 122,
  types: [ 'electric' ],
  favoriteFood: 'Salmon'
}
```