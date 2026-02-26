# Entwicklungs-Dokumentation

Diese Dokumentation erklärt, wie das PokéDelivery-Projekt aufgesetzt worden ist.

---
### Systeminformationen
Raspberry Pi 3 Model B Plus Rev 1.4  
Debian GNU/Linux 13 (trixie)  
Raspberry Pi OS Lite

### Mit dem Raspberry Pi verbinden
Eine SSH-Verbindung mit dem Raspberry Pi herstellen:  
`ssh <nutzername>@<raspberry-pi-ip>`  
Nach Eingabe des Passworts ist man über die Kommandozeile mit dem Raspberry Pi verbunden.

### Initiale Installationen

#### Docker
[Offizielle Anleitung](https://docs.docker.com/engine/install/debian/#install-using-the-repository) (kompatibel mit Debian 13). 

#### Github
Das Repository befindet sich [hier](https://github.com/Bootcamp-S/Pokemon-Food-Delivery.git).

# 1. Jenkins

Auf dem Jenkins Controller werden eine Reihe an Systemkonfigurationen vorgenommen, darunter das Hinterlegen von Credentials für die Kommunikation mit anderen Komponenten der CI/CD-Pipeline sowie das Erstellen von Nodes (auch Agenten genannt). 
Der Controller wie auch die Agenten laufen in separaten Docker-Containern.

Der Controller kann über folgenden Befehl, mit der `compose.yml` im Repository unter `docker/create-controller/` aufgesetzt werden:  
`docker compose up -d`

Diese und alle weiteren Dateien können im oben verlinkten Repository gefunden werden.
Danach kann Jenkins unter folgender Adresse aufgerufen werden:
[http://\<raspberry-pi-ip\>:8080](http://<raspberry-pi-ip>:8080) 


#### Jenkins Plugins

Folgende Plugins werden benötigt:  `NodeJS`, `HTTP Request Plugin`, `Prometheus metrics plugin` und `Role-based Authorization Strategy`.
Diese lassen sich unter [http://\<raspberry-pi-ip\>:8080/manage/pluginManager/available](http://<raspberry-pi-ip>:8080/manage/pluginManager/available) installieren.


#### Credentials

Alle Zugangsdaten die für die Pipeline erforderlich sind werden im Jenkins Credential Manager hinterlegt:
[http://\<raspberry-pi-ip\>:8080/manage/credentials](http://<raspberry-pi-ip>:8080/manage/credentials)

Dazu gehört der Personal Access Token für das GitHub Repository. Dieser muss als `Username with password` hinterlegt werden, mit der Option `Treat username as secret` und der `ID` `github_pat`.
Die Tokens und Secrets für Azure sind `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID` und `AZURE_SUBSCRIPTION_ID`.  Diese sollten jeweils als `Secret text` angelegt werden.


#### Jenkins Agenten 

Unter [http://\<raspberry-pi-ip\>:8080/manage/computer](http://<raspberry-pi-ip>:8080/manage/computer) können zusätzliche Agenten angelegt werden, die es erlauben, Teile der Durchführung der Pipeline von dem Controller (der 'Built-In Node') auf andere 'Geräte' zu delegieren.

Hierfür werden die Dateien `Dockerfile` und `compose.yml`, zu finden im Repository unter `docker/create-agents`, benötigt. Zudem muss eine `.env` von folgender Form im selben Verzeichnis angelegt werden:

```
JENKINS_URL=http://<IP>:8080

AGENT01_SECRET=<SECRET OF 1ST AGENT>
AGENT02_SECRET=<SECRET OF 2ND AGENT>
```

Auf dem Raspberry Pi wird die `Dockerfile` ausgeführt, um das Image für die Container der Agenten zu erstellen. Dieser Vorgang kann einige Minuten in Anspruch nehmen.
Die Secrets der beiden Agenten (bei der Erstellung der Agenten in Jenkins gezeigt) sowie die URL des Controllers werden in der Datei `.env` an den vorgesehenen Stellen hinterlegt.
Anschließend ermöglicht die Ausführung der `compose.yml` das Starten von zwei Agenten mit diesem Image, über die die Pipeline‐Ausführung durch den Controller initiiert werden kann.



#### Monitoring

Ein Dashboard über verschiedene Metriken der Pipeline wird zur Verfügung gestellt.

Im Repository ist die Datei `docker/project/prometheus.yml` zu finden, in welche die Raspberry Pi IP eingetragen werden muss.
Mit folgenden Befehlen werden die Prometheus- und Grafana-Container erstellt:
```
docker run -d --restart unless-stopped --name prometheus -p 9090:9090 -v ~/project/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus --config.file=/etc/prometheus/prometheus.yml --web.enable-lifecycle
```
```
docker run -d --restart unless-stopped --name grafana -p 3000:3000 grafana/grafana
```
Prometheus läuft unter [http://\<raspberry-pi-ip\>:9090](http://\<raspberry-pi-ip\>:9090), Grafana unter unter [http://\<raspberry-pi-ip\>:3000](http://\<raspberry-pi-ip\>:3000). Wird letztere Seite aufgerufen, kann `grafana-dashboard.json` (ebenfalls im Repository zu finden) zum Laden des Dashboard-Layouts verwendet werden.

# 2. Azure
Das Deployment (von `main`, siehe Branching-Strategie in der Architektur-Dokumentation) findet in einer Azure Function App statt. Hierfür wird ZIP-Deployment angewandt. Details können der `Jenkinsfile` im Repository entnommen werden.

#### Architekturüberblick

Das PokeDelivery-System besteht vollständig aus Azure-Cloud-Diensten. Folgende Services sind beteiligt:

Azure Function App (pokedelivery-func)
Azure Application Insights (pokedelivery-insights)
Azure Log Analytics Workspace (DefaultWorkspace-...)
Azure Storage Account (pokedeliverystorage01)
App Service Plan (ASP-pokedelivery-rg-af0b)
Application Insights Smart Detection (Action Group)

Diese Architektur ist serverlos, skalierbar und kosteneffizient.


#### Azure Ressourcen im Detail


##### Azure Function App – pokedelivery-func
Die Function App enthält den gesamten Anwendungscode. Azure Functions erlauben serverlose, eventgetriebene Logik mit automatischer Skalierung. Triggers wie HTTP, Timer, Queue oder Blob können verwendet werden.
Hauptaufgaben:

   API-Endpunkte zur Verfügung stellen
   Verarbeitung von Bestellungen oder Ereignissen
   Interaktion mit Azure Storage
   Automatische Skalierung bei Lastspitzen

Alle Logs und Traces werden automatisch an Application Insights gesendet.

##### Application Insights – pokedelivery-insights
Application Insights übernimmt Monitoring, Logging und Telemetrie. Es hilft bei Fehleranalyse, Performance-Überwachung und Systemdiagnose.
Gesammelte Daten:

   Requests (HTTP-Aufrufe)
   Traces (Log-Ausgaben)
   Exceptions (Fehler)
   Dependencies (Zugriffe auf externe Systeme)
   Live Metrics

Application Insights speichert Telemetrie im Log Analytics Workspace.

##### Log Analytics Workspace – DefaultWorkspace
Dieser Workspace ist die zentrale Datenbank aller Telemetriedaten. Entwickler können mit KQL (Kusto Query Language) komplexe Analysen durchführen.
Typische Abfragen:

   Analyse von Fehlern
   Performance-Messungen
   Tracing von Request-Ketten
   Monitoring und Alerting-Regeln

##### Azure Storage Account – pokedeliverystorage01
Der Storage Account stellt mehrere Dienste bereit:
Blob Storage:

   Speicherung von Dateien, Konfigurationen, Logs, Bildern usw.
   Blob-Trigger für Functions

Queue Storage:

   Nachrichtenbasierte Kommunikation
   Ermöglicht verteilte und asynchrone Verarbeitung

Table Storage (optional):

   Key-Value-Datenbank zur schnellen Speicherung einfacher Strukturen

Diese Storage-Dienste können direkt als Trigger oder Binding in der Function App genutzt werden.

##### App Service Plan – ASP-pokedelivery-rg-af0b
Der App Service Plan definiert die Hosting-Basis für die Function App. Dazu gehören:

   Compute-Ressourcen
   Region (UK West)
   Skalierungsverhalten (z.B. automatisch oder manuell)
   Kostenmodell

##### Smart Detection (Application Insights)
Smart Detection analysiert automatisch das Verhalten der Anwendung. Bei auffälligen Mustern wie erhöhten Fehlerquoten oder Performance-Einbrüchen wird eine Warnung erzeugt.


#### Zusammenspiel der Komponenten

Der Ablauf im Live-Betrieb ist folgendermaßen:
Ein Client sendet einen HTTP-Request an die Function App.
Die Function App verarbeitet den Request, liest oder schreibt Daten im Storage Account.
Währenddessen erzeugt die Function App Logs und Telemetrie.
Application Insights sammelt diese Daten und speichert sie im Log Analytics Workspace.
Smart Detection erkennt mögliche Probleme automatisch.
Entwickler können im Workspace per KQL tiefgehende Analysen durchführen.

#### Best Practices für PokeDelivery

##### Logging

Möglichst strukturierte Logs schreiben
Exceptions nicht unterdrücken
Logs mit Kontext versehen

##### Sicherheit

   Managed Identity statt Access Keys verwenden
   Storage Keys niemals hart im Code
   Private Endpoints empfehlen sich für produktive Systeme

# 2.A Terraform
Für dieses Projekt wurde Terraform verwendet, um die Infrastruktur der Azure Function App sowie aller zugehörigen Ressourcen automatisch bereitzustellen und zu konfigurieren. Die Azure Function App und das Azure Storage Account wurden zuerst manuell erstellt. Anschließend wurden passende Terraform‑Dateien erzeugt, um spätere Änderungen an den Azure‑Konfigurationen mit Terraform vornehmen zu können

#### Vorbereitung: .envrc erstellen
Bevor Terraform ausgeführt werden kann, muss im Projektverzeichnis eine .envrc‑Datei erstellt werden.
Diese Datei definiert alle benötigten Umgebungsvariablen:

| Variable                       | Beschreibung                                                         |
|-------------------------------|----------------------------------------------------------------------|
| ARM_CLIENT_ID                 | Client-ID des Azure Service Principals zur Authentifizierung        |
| ARM_SUBSCRIPTION_ID           | Azure Subscription, in der die Ressourcen bereitgestellt werden      |
| ARM_TENANT_ID                 | Azure AD Tenant-ID                                                   |
| ARM_CLIENT_SECRET             | Client-Secret des Service Principals                                 |
| TF_VAR_run_from_package_url   | SAS‑URL zum ZIP‑Paket der Function App im Storage Account            |
| TF_VAR_service_plan_id        | ID des App Service Plans, in dem die Function App läuft              |
| TF_VAR_app_insights_id        | ID der Application Insights Instanz                                  |

Nach dem Erstellen der .envrc‑Datei wird sie wie folgt aktiviert:  
`direnv allow .`  
Dadurch lädt direnv die Umgebungsvariablen automatisch beim Betreten des Projektordners.

#### Überblick über die Terraform‑Dateien
Das Projekt enthält mehrere .tf‑Dateien, die jeweils einen eigenen Verantwortungsbereich haben.

| Datei                    | Beschreibung |
|--------------------------|--------------|
| main_func.tf             | Enthält die Konfiguration der Azure Function App, inklusive Laufzeitparametern und den Verweisen auf Storage Account, Service Plan und Paket‑URL. |
| main_storage_account.tf  | Beschreibt den Azure Storage Account, der von der Function App benötigt wird (z. B. für Trigger, Logs oder Bereitstellungsartefakte). |
| service_plan.tf          | Definiert den App Service Plan (Consumption oder Dedicated), der die Compute‑Ressourcen für die Function App bereitstellt. |
| variables.tf             | Enthält die Definitionen aller Variablen, die im Projekt verwendet werden, inklusive umgebungsspezifischer Werte und Referenzen zu Azure‑Ressourcen. |
| providers.tf             | Definiert den Terraform‑Provider für Azure. |

#### Terraform-Befehle
Sobald direnv aktiv ist und die Variablen geladen wurden, werden die Terraform‑Befehle in folgender Reihenfolge ausgeführt:

| Befehl              | Beschreibung |
|---------------------|--------------|
| `terraform import azurerm_storage_account.res-0 \"/subscriptions/<SUB_ID>/resourceGroups/pokedelivery-rg/providers/Microsoft.Storage/storageAccounts/pokedeliverystorage01"`      | Importiert die bestehende Azure Storage Account als Terraform‑State. <SUB_ID> mit subscription id ersetzen.|
|`terraform import azurerm_linux_function_app.res-0 \"/subscriptions/<SUB_ID>/resourceGroups/pokedelivery-rg/providers/Microsoft.Web/sites/pokedelivery-func"`| Importiert die bestehende Azure Function App als Terraform‑State. <SUB_ID> mit subscription id ersetzen.|
| `terraform init`      | Lädt benötigte Terraform‑Provider herunter, initialisiert das Backend (falls verwendet) und bereitet das Arbeitsverzeichnis für Terraform vor |
| `terraform validate`  | Prüft die Terraform‑Konfiguration auf syntaktische Korrektheit und stellt sicher, dass alle Variablen und Provider korrekt definiert sind |
| `terraform plan`      | Zeigt an, welche Infrastrukturänderungen vorgenommen werden und ermöglicht Prüfung vor dem tatsächlichen Deployment |
| `terraform apply`     | Wendet den zuvor erzeugten Plan an, erstellt oder aktualisiert Ressourcen in Azure und deployt die Function App und die gesamte Infrastruktur in die Cloud |