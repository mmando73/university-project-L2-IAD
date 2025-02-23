# Crypto Portfolio Management Tool

### 🚀 Project Overview

The **Crypto Portfolio Management Tool** is a web application designed to help users manage their cryptocurrency investments efficiently. It allows users to view real-time cryptocurrency data, manage their portfolio, and perform actions like filtering, sorting, and updating quantities. The app integrates with the **Coinlayer API** for live data updates and offers both **online** and **offline** data modes.

This project was developed as part of a **university course at Université de Pau et des Pays de l'Adour (UPPA)** for the subject *Développement d'Applications Internet (DAI)*.

🔗 **Course Project Reference**: [Project Cryptos](https://bjobard.perso.univ-pau.fr/Cours/DAI/Assets/Projet_Cryptos/obfuscated/cryptop.xhtml)

--- 
### 📑 Features
- **Real-time Data**: Fetches live cryptocurrency prices and updates automatically.
- **Portfolio Management**: Add, modify, remove and track your cryptocurrencies holdings in your portfolio.
- **Sorting & Filtering**: Dynamically sort and filter cryptocurrencies by name, price, and variation.
- **Pagination**: Easy navigation through large datasets with a responsive pagination system..
- **Offline Mode**: Fallback to offline data if the live API is unavailable.
- **Live Data Updates**: Automatically updates crypto data on user's demand.

---

### Technologies Used
- **Framework**: SAM (State-Action-Model) pattern
- **Frontend**: JavaScript, HTML, CSS, Bootstrap
- **Backend API**: Coinlayer API

---

### Installation
1. Clone the repository:
```
git clone https://github.com/mmando73/university-project-L2-DIA.git
```
2. Open the `cryptop.xhtml` project file in a browser.
3. Ensure internet access to fetch live cryptocurrency data (optional).

### 🔥 Usage
1. **Switching Modes**:
    - Use the dropdown to switch between **online** and **offline** data modes.
    - When online, the app fetches data from Coinlayer API.
    - When offline, it displays pre-loaded static data.
2. **Filtering & Sorting**:
    - Enter keywords in the **filter** input to refine displayed cryptocurrencies.
    - Click on column headers to sort by **Code**, **Name**, **Price**, or **Variation**.
3. **Portfolio Management**:
    - Add or modify quantities directly in the portfolio view.
    - Use the **Confirm** and **Cancel** buttons to save or discard changes.
4. **Pagination**:
    - Navigate through pages using the pagination controls at the bottom of the table.
    - Select how many items to display per page (5, 10, 15, etc.).


--- 

### API Integration

This project integrates with the **Coinlayer API** to fetch real-time cryptocurrency prices.

- **API Endpoints Used**:
    - `http://api.coinlayer.com/api/live` (Live rates)
    - `http://api.coinlayer.com/list` (List of supported currencies)
- **API Key**: Must be replaced in `coinlayer.js` under `coinlayerInfos.apiKey`


--- 

### 🚧 Future Enhancements
- **Authentication**: Allow users to save their portfolio securely.
- **Advanced Analytics**: Provide insights into portfolio performance over time.
---

### License
This project was developed as part of an Internet Applications Development university course. It is shared for educational purposes.\
See the [professor's original project site](https://bjobard.perso.univ-pau.fr/Cours/DAI/Assets/Projet_Cryptos/obfuscated/cryptop.xhtml) for any licensing details.
