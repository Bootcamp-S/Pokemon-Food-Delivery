---

# 🏗️ **ARCHITECTURE.md**

```md
# Architecture Overview – Pokemon Food Delivery

Dieses Dokument beschreibt die technische Architektur des Pokemon Delivery Systems.

---

## 🏛️ Ziel

Das System simuliert eine Pokemon‑Essenslieferung:

- Pokemon können angezeigt werden
- User sieht welches Pokemon, welches Gericht mag

---

## 🧩 Systemkomponenten

### **1. Backend API (Node.js + Express)**
- Zentrale API  
- Handhabt Routing, Validierung, Logik  
- Kommuniziert mit Storage/DB

### **2. Storage / Database**
- Lokal: JSON-Datei oder MongoDB  
- Speichert Orders und Menu‑Daten

optional:
- Docker Container für Deployment

---

## 🔌 API (vereinfachter Überblick)

| Methode | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/getPokemon` | Ruft Pokemon-Daten über eine Azure Function ab |

---

## 🗃️ Datenmodelle (Beispiele)

### Order Model
```json
{
  name: data.name,
  id: 42,
  height: 185,
  weight: 70,
  base_experience: 42,
  types: coffee,
  favoriteFood: coffee
}
