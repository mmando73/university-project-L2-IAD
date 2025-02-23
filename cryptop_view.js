
//--------------------------------------------------------------------- View ---
// Génération de portions en HTML et affichage
//
view = {

  // Injecte le HTML dans une balise de la page Web.
  samDisplay(sectionId, representation) {
    const section = document.getElementById(sectionId);
    section.innerHTML = representation;
  },

  // Astuce : Pour avoir la coloration syntaxique du HTML avec l'extension lit-html dans VSCode
  // https://marketplace.visualstudio.com/items?itemName=bierner.lit-html
  // utiliser this.html`<h1>Hello World</h1>` en remplacement de `<h1>Hello World</h1>`
  html([str, ...strs], ...vals) {
    return strs.reduce((acc, v, i) => acc + vals[i] + v, str);
  },

  // Renvoit le HTML de l'interface complète de l'application
  appUI(model, state) {
    const configsChooserHTML = this.configsChooserUI();
    return this.html`
    <div class="container">
      ${configsChooserHTML}
      <h1 class="text-center">Portfolio Cryptos</h1>
      <br />
      <div class="row">
        <div class="col-lg-6">
            ${state.representations.currencies}
        <br />
        </div>

        <div class="col-lg-6">
          ${state.representations.preferences}
          <br />
          ${state.representations.wallet}
          <br />
        </div>
      </div>
    </div>
    `;
  },
  
  configsChooserUI() {
    const options = Object.keys(configs).map(v => {
      const selected = configsSelected == v ? 'selected="selected"' : '';
      return this.html`
      <option ${selected}>${v}</option>
      `;
    }).join('\n');
    return this.html`
    <div class="row">
      <div class="col-md-7"></div>
      <div class="col-md-5">
      <br />
        <div class="d-flex justify-content-end">
          <div class="input-group">
            <div class="input-group-prepend ">
              <label class="input-group-text">Config initiale :</label>
            </div>
            <select class="custom-select" onchange="actions.reinit({e:event})">
              ${options}
            </select>
          </div>
        </div>
      </div>
    </div>
    <br />
    `;
  },

  currenciesUI(model, state) {
    const tabName = model.ui.currenciesCard.selectedTab;
    switch (tabName) {
      case 'cryptos': return this.currenciesCryptosUI(model, state); break;
      case 'fiats': return this.currenciesFiatsUI(model, state); break;
      default:
        console.error('view.currenciesUI() : unknown tab name: ', tabName);
        return '<p>Error in view.currenciesUI()</p>';
    }
  },
 
  currenciesCryptosUI(model, state) {
  const paginationHTML = this.paginationUI(model, state, 'cryptos');
  
  const pagination  = model.ui.currenciesCard.tabs.cryptos.pagination;
  const currentPage = pagination.currentPage;
  const rowsPerPage = pagination.rowsPerPage[pagination.rowsPerPageIndex];

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const coinsState = state.data.cryptos.filtered.slice(startIndex, endIndex);
  let cryptoTable = coinsState.map(crypto => { 
      
      const {code, name, price, change} = crypto;
    

      let variation = change.toFixed(3);
      variation = variation > 0 ? `${variation} ↗` :
                  variation < 0 ? `${variation} ↘` : `${variation} ~`;

      let trClass = "";
      const coinModel = model.config.coins[code];
      if (coinModel) {  
        if (coinModel.quantity > 0) {
          trClass = "bg-success text-light";
        } else {
          trClass = "bg-warning";
           }
      }
    
  
          return this.html`

        <tr class= "${trClass}" onclick="actions.selectCurrency({type:'cryptos', code:'${code}'})">
          <td class="text-center">
            <span class="badge badge-pill badge-light">
              <img src="https://assets.coinlayer.com/icons/${code}.png" 
              />
              ${code} </span>
          </td>
          <td><b>${name}</b></td>
          <td class="text-right"><b>${price.toFixed(2)}</b></td>
          <td class="text-right">${variation}</td>
        </tr>

        `;
      
        
    }).join('');
  

      const coinsModel = model.config.coins;
      const cryptosPreferees = Object.entries(coinsModel).sort((a, b) => a[0].localeCompare(b[0])).map(([code, {}]) => {
        let trClass = "";
        const coin = model.config.coins[code];
        if (coin) {  
          if (coin.quantity > 0) {
            trClass = "badge badge-success";
            return this.html`
             <span class="${trClass}">${code}</span>
            `;
          } else {
            trClass = "badge badge-warning";
            return this.html`
              <span class="${trClass}">${code}</span>
            `;
           }
        } 

        return this.html`
        `;
      }).join(''); 

    return this.html`
<div class="card border-secondary" id="currencies">
  <div class="card-header">
    <ul class="nav nav-pills card-header-tabs">
      <li class="nav-item">
        <a class="nav-link active" href="#currencies">
          Cryptos <span class="badge badge-light">${state.data.cryptos.filteredNum} / ${state.data.cryptos.listNum}</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-secondary" href="#currencies" onclick="actions.changeTab({tab:'currenciesFiats'})">
          Monnaies cibles
          <span class="badge badge-secondary">${state.data.fiats.filteredNum} / ${state.data.fiats.listNum}</span></a>
      </li>
    </ul>
  </div>
  <div class="card-body">
    <div class="input-group">
      <div class="input-group-append">
        <span class="input-group-text">Filtres : </span>
      </div>
      <input value="${model.ui.currenciesCard.tabs.cryptos.filters.text}" id="filterText" type="text" class="form-control" placeholder="code ou nom..." onchange="actions.updateFilter({e: event, currency:'cryptos'})"/>
      <div class="input-group-append">
        <span class="input-group-text">Prix &gt; </span>
      </div>
      <input id="filterSup" type="number" class="form-control" value="${model.ui.currenciesCard.tabs.cryptos.filters.price}" min="0" onchange="actions.updatePriceFilter({e: event})"/>
    </div> <br />
    <div class="table-responsive">
      <table class="col-12 table table-sm table-bordered">
        <thead>
          <th class="align-middle text-center col-2" onclick="actions.tableSort({currency: 'cryptos', column: 0})">
            <a href="#currencies">Code</a>
          </th>
          <th class="align-middle text-center col-5" onclick="actions.tableSort({currency: 'cryptos', column: 1})">
            <a href="#currencies">Nom</a>
          </th>
          <th class="align-middle text-center col-2" onclick="actions.tableSort({currency: 'cryptos', column: 2})">
            <a href="#currencies">Prix</a>
          </th>
          <th class="align-middle text-center col-3" onclick="actions.tableSort({currency: 'cryptos', column: 3})">
            <a href="#currencies">Variation</a>
          </th>
        </thead>
        ${cryptoTable}
      </table>
    </div>

    ${paginationHTML}
  </div>
  <div class="card-footer text-muted"> Cryptos préférées :
    ${cryptosPreferees}
  </div>
</div>  
    `;
  },


  paginationUI(model, state, currency) {

  let pagination, totalPages;

  // Récupération d'informations de pagination depuis le modèle
  if (currency == 'cryptos'){
    pagination  = model.ui.currenciesCard.tabs.cryptos.pagination;
  } else if (currency == 'fiats'){
    pagination  = model.ui.currenciesCard.tabs.fiats.pagination;
  }
  const currentPage = pagination.currentPage;
  const rowsPerPage = pagination.rowsPerPage[pagination.rowsPerPageIndex];

  // calcul du nombre total de pages
  if (currency == 'cryptos'){
    totalPages = Math.ceil(state.data.cryptos.filtered.length / rowsPerPage);
  } else if(currency == 'fiats'){
    totalPages = Math.ceil(state.data.fiats.filtered.length / rowsPerPage);
  }

  // Création des liens de pagination
  let startPage, endPage;
  // Si le total des pages est d'au plus 8, on les affiche toutes
  if (totalPages <= 8) {
    startPage = 1;
    endPage = totalPages;
  } else {
    // Si plus de 8 pages, on ajuste la plage en fonction de la page actuelle
    if (currentPage <= 5) {
      startPage = 1;
      endPage = 8;
    } else if (currentPage + 4 >= totalPages) {
      startPage = totalPages - 7;
      endPage = totalPages;
    } else {
      startPage = currentPage - 4;
      endPage = currentPage + 3;
    }
  }

  let paginationLinks = '';
  for (let i = startPage; i <= endPage; i++) {
    paginationLinks += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                          <a class="page-link" href="#currencies" onclick="actions.changePage({page: ${i}, currency: '${currency}', button: 'numButton'})">${i}</a>
                        </li>`;
  }

  

  let leftNavButtonAct, rightNavButtonAct;
  if (currentPage <= 1 && currentPage == totalPages){
    leftNavButtonAct  = 'disabled';
    rightNavButtonAct = 'disabled';
  } else if (currentPage <= 1){
    leftNavButtonAct  = 'disabled';
    rightNavButtonAct = '';
  } else if (currentPage == totalPages){
    leftNavButtonAct  = '';
    rightNavButtonAct = 'disabled';
  }

  let perPageSelectOptions = '';
  const paginationSettings = currency === 'cryptos' ? model.ui.currenciesCard.tabs.cryptos.pagination : model.ui.currenciesCard.tabs.fiats.pagination;
  const options = paginationSettings.rowsPerPage;
  
  for (let i = 0; i < options.length; i++) {
    const isSelected = i === paginationSettings.rowsPerPageIndex;
    perPageSelectOptions += `
    <option value="${i}" ${isSelected ? 'selected="selected"' : ''}>${options[i]}</option> 
    `;
  } 

  

    return this.html`
<section id="pagination">
  <div class="row justify-content-center">
    <nav class="col-auto">
      <ul class="pagination">
        <li class="page-item ${leftNavButtonAct}">
          <a class="page-link" href="#currencies" onclick="actions.changePage({page: ${currentPage}, currency: '${currency}', button: 'leftNavButton'})">&lt;</a>
        </li>
        ${paginationLinks}
        <li class="page-item ${rightNavButtonAct}">
          <a class="page-link" href="#currencies" onclick="actions.changePage({page: ${currentPage}, currency: '${currency}', button: 'rightNavButton'})">&gt;</a>
        </li>
      </ul>
    </nav>
    <div class="col-auto">
      <div class="input-group mb-3">
        <select class="custom-select" id="selectTo" onchange="actions.updatePerPage({e: event,  currency: '${currency}'})">
        ${perPageSelectOptions}
        </select>
        <div class="input-group-append">
          <span class="input-group-text">par page</span>
        </div>
      </div>
    </div>
  </div>
</section>    `;
  },

  currenciesFiatsUI(model, state) {
    const paginationHTML = this.paginationUI(model, state, 'fiats');
 
    const pagination  = model.ui.currenciesCard.tabs.fiats.pagination;
    const currentPage = pagination.currentPage;
    const rowsPerPage = pagination.rowsPerPage[pagination.rowsPerPageIndex];
  
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
  
    const fiatsState = state.data.fiats.filtered.slice(startIndex, endIndex);
    const fiatsTable = fiatsState.map(fiat => { 
      const {code, name, symbol} = fiat;
      
      let trClass = "";
      if (model.config.targets.list.includes(code)){
      trClass = code === model.config.targets.active ? "bg-success text-light": "bg-warning";
      }
     
        return this.html`
        <tr class="${trClass}" onclick="actions.selectCurrency({type:'fiats', code:'${code}'})">
          <td class="text-center"> ${code}</td>
          <td><b>${name}</b></td>
          <td class="text-center">${symbol}</td>
        </tr>

        `;
      }).join(''); 
      
      const targetslist = model.config.targets.list; 
      const targets = model.config.targets; 
      const monnaiesPreferees = targetslist.sort((a, b) => a[0].localeCompare(b[0])).map((code) => {
        let trClass = "";
        const coin = targetslist.includes(code);
        if (coin) {  
          if (targets.active == code) {
            trClass = "badge badge-success";
            return this.html`
             <span class="${trClass}">${code}</span>
            `;
          } else {
            trClass = "badge badge-warning";
            return this.html`
              <span class="${trClass}">${code}</span>
            `;
           }
        } 

        return this.html`
        `;
      }).join('');
      
    return this.html`
<div class="card border-secondary" id="currencies">
  <div class="card-header">
    <ul class="nav nav-pills card-header-tabs">
      <li class="nav-item">
        <a class="nav-link text-secondary" href="#currencies" onclick="actions.changeTab({tab:'currenciesCryptos'})">
          Cryptos <span class="badge badge-secondary">${state.data.cryptos.filteredNum} / ${state.data.cryptos.listNum}</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link active" href="#currencies">Monnaies cibles <span class="badge badge-light">${state.data.fiats.filteredNum} / ${state.data.fiats.listNum}</span></a>
      </li>
    </ul>
  </div>
  <div class="card-body">
    <div class="input-group">
      <div class="input-group-append">
        <span class="input-group-text">Filtres : </span>
      </div>
      <input value="${model.ui.currenciesCard.tabs.fiats.filters.text}" id="filterText" type="text" class="form-control" placeholder="code ou nom..." onchange="actions.updateFilter({e: event, currency:'fiats'})"/>
    </div> <br />
    <div class="table-responsive">
      <table class="col-12 table table-sm table-bordered">
        <thead>
          <th class="align-middle text-center col-3" onclick="actions.tableSort({currency: 'fiats', column: 0})">
            <a href="#currencies">Code</a>
          </th>
          <th class="align-middle text-center col-6" onclick="actions.tableSort({currency: 'fiats', column: 1})">
            <a href="#currencies">Nom</a>
          </th>
          <th class="align-middle text-center col-3" onclick="actions.tableSort({currency: 'fiats', column: 2})">
            <a href="#currencies">Symbole</a>
          </th>
        </thead>
      ${fiatsTable}
      </table>
    </div><br />
    ${paginationHTML}
  </div>
  <div class="card-footer text-muted"> Monnaies préférées :
    ${monnaiesPreferees}
  </div>
</div>    `;
  },

  preferencesUI(model, state) {

    const authors = model.config.authors;
    const debug = model.config.debug;
    const activeTarget = model.config.targets.active;
    const updateDisabled = model.config.dataMode == 'offline' ? 'disabled="disabled"' : '';
    const target = model.config.targets.active;
    const targetsList = mergeUnique(model.config.targets.list, [target]).sort();
    const fiatsList = state.data.fiats.list;

    const fiatOptionsHTML = targetsList.map((v) => {
      const code = fiatsList[v].code;
      const name = fiatsList[v].name;
      const isOffline = model.config.dataMode == 'offline';
      const selected = code == target ? 'selected="selected"' : '';
      const disabled = isOffline && code != target ? 'disabled="disabled"' : '';
      return this.html`
      <option value="${code}" ${selected} ${disabled}>${code} - ${name}</option>
      `;
    }).join('\n');

    const dataModeOptionsHTML = [['online', 'En ligne'], ['offline', 'Hors ligne']].map(v => {
      const selected = v[0] == model.config.dataMode ? 'selected="selected"' : '';
      return this.html`<option value="${v[0]}" ${selected}>${v[1]}</option>`;
    }).join('\n');

    return this.html`
<div class="card border-secondary">
  <div class="card-header d-flex justify-content-between">
    <h5 class=""> Préférences </h5>
    <h5 class="text-secondary"><abbr title="${authors}">Crédits</abbr></h5>
  </div>
  <div class="card-body">
    <div class="input-group">
      <div class="input-group-prepend">
        <label class="input-group-text" for="inputGroupSelect01">Monnaie
          cible</label>
      </div>
      <select class="custom-select" id="inputGroupSelect01"
        onchange="actions.changeTarget({e:event, debug:'${debug}'})">
        ${fiatOptionsHTML}
      </select>
    </div>
    <p></p>
    <div class="input-group">
      <div class="input-group-prepend">
        <label class="input-group-text">Données</label>
      </div>
      <select class="custom-select"
        onchange="actions.changeDataMode({e:event, target:'${activeTarget}', debug:'${debug}'})">
        ${dataModeOptionsHTML}
      </select>
      <div class="input-group-append">
        <button class="btn btn-primary" ${updateDisabled}
          onclick="actions.updateOnlineCurrenciesData({target: '${activeTarget}', debug:'${debug}'})">
          Actualiser</button>
      </div>
    </div>
  </div>
</div>    `;
  },

  walletUI(model, state) {
    const tabName = model.ui.walletCard.selectedTab;
    switch (tabName) {
      case 'portfolio': return this.walletPortfolioUI(model, state); break;
      case 'ajouter': return this.walletAjouterUI(model, state); break;
      default:
        console.error('view.currenciesUI() : unknown tab name: ', tabName);
        return '<p>Error in view.currenciesUI()</p>';
    }
  },

  walletPortfolioUI(model, state) {
  let totalPortfolio = 0;
  let isAnyQuantityNewInvalid = false;
  let isAllQuantityNewEmpty = true;
   // Génération du tableau
  const cryptoPortfolioTable = Object.entries(state.data.cryptos.list)
  .filter(([code, _]) => model.config.coins[code] && model.config.coins[code].quantity > 0) // Filtrer les cryptos présentes dans model.config.coins et ayant une quantity > 0
  .map(([code, crypto]) => {
    const { name, price, change } = crypto;
    const coin = model.config.coins[code];
    const quantity = coin.quantity;
    const quantityNew = coin.quantityNew;
    const quantityNewParsed = parseFloat(quantityNew);
    
    let validQuantityNew = !isNaN(quantityNewParsed) && quantityNewParsed >= 0;
    let total = validQuantityNew ? price * quantityNewParsed : (quantityNew === "" ? price * quantity : null);
    let modificationClass = validQuantityNew ? 'text-primary' : (quantityNew === "" ? '' : 'text-danger');
    let displayTotal = total !== null ? total.toFixed(2) : "???";

    if (coin.quantity > 0) {
      totalPortfolio += total !== null ? total : 0;
      if (quantityNew !== "" && (isNaN(quantityNewParsed) || quantityNewParsed < 0)) {
        isAnyQuantityNewInvalid = true;
      }
      if (quantityNew !== "") {
        isAllQuantityNewEmpty = false;
      }
    }
    
    return this.html`
      <tr>
        <td class="text-center">
          <span class="badge badge-pill badge-light">
            <img src="https://assets.coinlayer.com/icons/${code}.png" />
            ${code} </span>
        </td>
        <td><b>${name}</b></td>
        <td class="text-right">${price.toFixed(2)}</td>
        <td class="text-right">
          <input type="text" class="form-control ${modificationClass}" value="${quantityNew !== "" ? quantityNew : quantity}" onchange="actions.changeCoinQty({e: event, code:'${code}'})"/>
        </td>
        <td class="text-right"><span class="${modificationClass}"><b>${displayTotal}</b></span></td>
      </tr>
    `;
  }).join('');


  Object.values(coins).forEach(coin => {
  const quantityNewParsed = parseFloat(coin.quantityNew);

  // Vérification si quantityNewParsed est NaN uniquement si coin.quantityNew n'est pas une chaîne vide
  if (coin.quantity > 0 && coin.quantityNew !== "" && (isNaN(quantityNewParsed) || quantityNewParsed < 0)) {
    isAnyQuantityNewInvalid = true;
  }

  if (coin.quantity > 0 && coin.quantityNew !== "") {
    isAllQuantityNewEmpty = false;
  }
  });

  let confirmButtonClass, cancelButtonClass, totalClass, onClickConfirmAction, onClickCancelAction;
  if (!isAnyQuantityNewInvalid && !isAllQuantityNewEmpty) {
  // Activer les deux boutons avec les actions de confirmation ou d'annulation si aucune quantité n'est invalide et toutes les quantitiesNew sont positives ou vides
  confirmButtonClass = "btn btn-primary";
  cancelButtonClass  = "btn btn-secondary";
  totalClass = "badge badge-primary";
  onClickConfirmAction = `onclick="actions.confirmCoinsModification({coins:'acquired'})"`;
  onClickCancelAction  = `onclick="actions.cancelCoinsModification({coins:'acquired'})"`;
  } else if (isAnyQuantityNewInvalid && !isAllQuantityNewEmpty) {
  // Désactiver le bouton "Confirmer" en plus de l'action de confirmation si une quantityNew est invalide
  confirmButtonClass = "btn disabled";
  cancelButtonClass  = "btn btn-secondary";
  totalClass = "badge badge-primary";
  onClickConfirmAction = "";
  onClickCancelAction  = `onclick="actions.cancelCoinsModification({coins:'acquired'})"`;
  } else if (!isAnyQuantityNewInvalid && isAllQuantityNewEmpty){
  // Désactiver les deux boutons et les deux actions si toutes les quantitiesNew sont vides 
  confirmButtonClass = "btn disabled";
  cancelButtonClass = "btn disabled";
  totalClass = "badge badge-success";
  onClickConfirmAction = "";
  onClickCancelAction  = "";
  }


    return this.html`
  <div class="card border-secondary text-center" id="wallet">
    <div class="card-header">
      <ul class="nav nav-pills card-header-tabs">
        <li class="nav-item">
          <a class="nav-link active" href="#wallet">Portfolio <span class="badge badge-light">${Object.values(model.config.coins).filter(coin => coin.quantity > 0).length}</span></a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-secondary" href="#wallet" onclick="actions.changeTab({tab:'walletAjouter'})">
            Ajouter <span class="badge badge-secondary">${Object.values(model.config.coins).filter(coin => coin.quantity === 0).length}</span></a>
        </li>
      </ul>
    </div>
    <div class="card-body text-center">

      <br />
      <div class="table-responsive">
        <table class="col-12 table table-sm table-bordered">
          <thead>
            <th class="align-middle text-center col-1"> Code </th>
            <th class="align-middle text-center col-4"> Nom </th>
            <th class="align-middle text-center col-2"> Prix </th>
            <th class="align-middle text-center col-3"> Qté </th>
            <th class="align-middle text-center col-2"> Total </th>
          </thead>

          ${cryptoPortfolioTable}
          
        </table>
      </div>

      <div class="input-group d-flex justify-content-end">
        <div class="input-group-prepend">
          <button class="${confirmButtonClass}" ${onClickConfirmAction}>Confirmer</button>
        </div>
        <div class="input-group-append">
          <button class="${cancelButtonClass}" ${onClickCancelAction}>Annuler</button>
        </div>
      </div>

    </div>

    <div class="card-footer">
      <h3><span class="${totalClass}">Total : ${totalPortfolio.toFixed(2)} ${model.config.targets.active}</span></h3>
    </div>
  </div>
      `;
  },

  walletAjouterUI(model, state) {
  let totalAjouter = 0;
  let isAnyQuantityNewInvalid = false;
  let isAllQuantityNewEmpty = true;

  const cryptoAjouterTable = Object.entries(state.data.cryptos.list)
  .filter(([code, _]) => model.config.coins[code] && model.config.coins[code].quantity === 0 ) // Filtrer les cryptos présentes dans model.config.coins et ayant une quantity = 0
  .map(([code, crypto]) => {
    const { name, price, change } = crypto;
    const coin = model.config.coins[code];
    const quantity = coin.quantity;
    const quantityNew = coin.quantityNew;
    const quantityNewParsed = parseFloat(quantityNew);
    
    let validQuantityNew = !isNaN(quantityNewParsed) && quantityNewParsed >= 0;
    let total = validQuantityNew ? price * quantityNewParsed : (quantityNew === "" ? price * quantity : null);
    let modificationClass = validQuantityNew ? 'text-primary' : (quantityNew === "" ? '' : 'text-danger');
    let displayTotal = total !== null ? total.toFixed(2) : "???";

    if (coin.quantity === 0 && validQuantityNew) {
      totalAjouter += total !== null ? total : 0;
      if (quantityNew !== "" && (isNaN(quantityNewParsed) || quantityNewParsed < 0)) {
        isAnyQuantityNewInvalid = true;
      }
      if (quantityNew !== "") {
        isAllQuantityNewEmpty = false;
      }
    }
    
    return this.html`
      <tr>
        <td class="text-center">
          <span class="badge badge-pill badge-light">
            <img src="https://assets.coinlayer.com/icons/${code}.png" />
            ${code} </span>
        </td>
        <td><b>${name}</b></td>
        <td class="text-right">${price.toFixed(2)}</td>
        <td class="text-right">
          <input type="text" class="form-control ${modificationClass}" value="${quantityNew !== "" ? quantityNew : quantity}" onchange="actions.changeCoinQty({e: event, code:'${code}'})"/>
        </td>
        <td class="text-right"><span class="${modificationClass}"><b>${displayTotal}</b></span></td>
      </tr>
    `;
  }).join('');

  Object.values(coins).forEach(coin => {
    const quantityNewParsed = parseFloat(coin.quantityNew);
  
    // Vérification si quantityNewParsed est NaN uniquement si coin.quantityNew n'est pas une chaîne vide
    if (coin.quantity === 0 && coin.quantityNew !== "" && (isNaN(quantityNewParsed) || quantityNewParsed < 0)) {
      isAnyQuantityNewInvalid = true;
    }
  
    if (coin.quantity === 0 && coin.quantityNew !== "") {
      isAllQuantityNewEmpty = false;
    }
  });
  
  let confirmButtonClass, cancelButtonClass, totalClass, onClickConfirmAction, onClickCancelAction;
  if (!isAnyQuantityNewInvalid && !isAllQuantityNewEmpty) {
    // Activer les deux boutons avec les actions de confirmation ou d'annulation si aucune quantité n'est invalide et toutes les quantitiesNew sont positives ou vides
    confirmButtonClass = "btn btn-primary";
    cancelButtonClass  = "btn btn-secondary";
    totalClass = "badge badge-primary";
    onClickConfirmAction = `onclick="actions.confirmCoinsModification({coins:'wished'})"`;
    onClickCancelAction  = `onclick="actions.cancelCoinsModification({coins:'wished'})"`;
  } else if (isAnyQuantityNewInvalid && !isAllQuantityNewEmpty) {
    // Désactiver le bouton "Confirmer" en plus de l'action de confirmation si une quantityNew est invalide
    confirmButtonClass = "btn disabled";
    cancelButtonClass  = "btn btn-secondary";
    totalClass = "badge badge-primary";
    onClickConfirmAction = "";
    onClickCancelAction  = `onclick="actions.cancelCoinsModification({coins:'wished'})"`;
  } else if (!isAnyQuantityNewInvalid && isAllQuantityNewEmpty){
    // Désactiver les deux boutons et les deux actions si toutes les quantitiesNew sont vides 
    confirmButtonClass = "btn disabled";
    cancelButtonClass = "btn disabled";
    totalClass = "badge badge-success";
    onClickConfirmAction = "";
    onClickCancelAction  = "";
  }

    return this.html`
<div class="card border-secondary text-center" id="wallet">
  <div class="card-header">
    <ul class="nav nav-pills card-header-tabs">
      <li class="nav-item">
        <a class="nav-link text-secondary" href="#wallet" onclick="actions.changeTab({tab:'walletPortfolio'})">
          Portfolio <span class="badge badge-secondary">${Object.values(model.config.coins).filter(coin => coin.quantity > 0).length}</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link active" href="#wallet">Ajouter <span class="badge badge-light">${Object.values(model.config.coins).filter(coin => coin.quantity === 0).length}</span></a>
      </li>
    </ul>
  </div>
  <div class="card-body">
    <br />
    <div class="table-responsive">
      <table class="col-12 table table-sm table-bordered">
        <thead>
          <th class="align-middle text-center col-1"> Code </th>
          <th class="align-middle text-center col-4"> Nom </th>
          <th class="align-middle text-center col-2"> Prix </th>
          <th class="align-middle text-center col-3"> Qté </th>
          <th class="align-middle text-center col-2"> Total </th>
        </thead>

       ${cryptoAjouterTable}

      </table>
    </div>

    <div class="input-group d-flex justify-content-end">
      <div class="input-group-prepend">
        <button class="${confirmButtonClass}" ${onClickConfirmAction}>Confirmer</button>
      </div>
      <div class="input-group-append">
        <button class="${cancelButtonClass}" ${onClickCancelAction}>Annuler</button>
      </div>
    </div>


  </div>
  <div class="card-footer">
    <h3><span class="${totalClass}">Total : ${totalAjouter.toFixed(2)} ${model.config.targets.active}</span></h3>
  </div>
</div>
    `;
  },


};
