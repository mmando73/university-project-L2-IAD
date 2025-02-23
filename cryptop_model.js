
//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//
model = {

  config: {},
  data : {},
  ui   : {},

  // Demande au modèle de se mettre à jour en fonction des données qu'on
  // lui présente.
  // l'argument data est un objet confectionné dans les actions.
  // Les propriétés de data apportent les modifications à faire sur le modèle.
  samPresent(data) {

    switch (data.do) {

      case 'init': {
        Object.assign(this, data.config);
        const conf = this.config;
        conf.targets.list = mergeUnique([conf.targets.wished], conf.targets.list).sort();
        const isOnline = conf.dataMode == 'online';
        conf.targets.active = isOnline ? conf.targets.wished : this.data.offline.live.target;
        this.hasChanged.currencies = true;
        if (conf.debug) console.log('model.samPresent - init - targets.list  : ', conf.targets.list);
        if (conf.debug) console.log('model.samPresent - init - targets.active: ', conf.targets.active);
      } break;

      case 'updateCurrenciesData': {
        this.data.online = data.currenciesData;
        this.config.targets.active = data.currenciesData.live.target;
        this.hasChanged.currencies = true;
      } break;

      case 'changeDataMode': {
        this.config.dataMode = data.dataMode;
        if (data.dataMode == 'offline') {
          this.config.targets.active = this.data.offline.live.target;
          this.hasChanged.currencies = true;
        }
      } break;

      case 'changeTab': {
        switch (data.tab) {
          case 'currenciesCryptos':
            this.ui.currenciesCard.selectedTab = 'cryptos';
            break;
          case 'currenciesFiats':
            this.ui.currenciesCard.selectedTab = 'fiats';
            break;
          case 'walletPortfolio':
            this.ui.walletCard.selectedTab = 'portfolio';
            break;
          case 'walletAjouter':
            this.ui.walletCard.selectedTab = 'ajouter';
            break;
            default:
        }
      } break;


      // Cas ajoutés :

      case 'changePage': {
        const Data = data.data;
        switch(Data.button) {
          case 'numButton':
            if (Data.currency === 'cryptos'){
            this.ui.currenciesCard.tabs.cryptos.pagination.currentPage = Data.page;
            this.hasChanged.cryptos.pagination = true;
            this.hasChanged.currencies = true;
            } else if (Data.currency === 'fiats'){
              this.ui.currenciesCard.tabs.fiats.pagination.currentPage = Data.page;
              this.hasChanged.fiats.pagination = true;
              this.hasChanged.currencies = true;
            }
            break;
          case 'leftNavButton':
            if (Data.currency === 'cryptos'){
            this.ui.currenciesCard.tabs.cryptos.pagination.currentPage -= 1;
            this.hasChanged.cryptos.pagination = true;
            } else if (Data.currency === 'fiats'){
              this.ui.currenciesCard.tabs.fiats.pagination.currentPage -= 1;
              this.hasChanged.fiats.pagination = true;
            }
            break;
          case 'rightNavButton':
            if (Data.currency === 'cryptos'){
            this.ui.currenciesCard.tabs.cryptos.pagination.currentPage += 1;
            this.hasChanged.cryptos.pagination = true;
            } else if (Data.currency === 'fiats'){
              this.ui.currenciesCard.tabs.fiats.pagination.currentPage += 1;
              this.hasChanged.fiats.pagination = true;
            }
            break;
          }
      } break;

      case 'updateFilter' : {
        const Data = data.data;
        if (Data.currency === 'cryptos'){
          this.ui.currenciesCard.tabs.cryptos.filters.text = Data.e.target.value;
          this.hasChanged.cryptos.filters = true;
          this.hasChanged.currencies = true;
          this.ui.currenciesCard.tabs.cryptos.pagination.currentPage = 1;
          } else if (Data.currency === 'fiats'){
            this.ui.currenciesCard.tabs.fiats.filters.text = Data.e.target.value;
            this.hasChanged.fiats.filters = true;
            this.hasChanged.currencies = true;
            this.ui.currenciesCard.tabs.fiats.pagination.currentPage = 1;
          }
      } break;

      case 'updatePriceFilter' : {
        const Data = data.data;
        this.ui.currenciesCard.tabs.cryptos.filters.price = Data.e.target.value;
        this.hasChanged.cryptos.filters = true;
        this.hasChanged.currencies = true;
        this.ui.currenciesCard.tabs.cryptos.pagination.currentPage = 1;
      } break;

      case 'updatePerPage': {
        const Data = data.data;
        if (Data.currency === 'cryptos'){
          this.ui.currenciesCard.tabs.cryptos.pagination.rowsPerPageIndex  = parseInt(Data.e.target.value);
          this.hasChanged.cryptos.pagination = true;
          } else if (Data.currency === 'fiats'){
            this.ui.currenciesCard.tabs.fiats.pagination.rowsPerPageIndex  = parseInt(Data.e.target.value);
            this.hasChanged.fiats.pagination = true;
          }
      } break;

      case 'selectCurrency': {
        const Data = data.data;
        if (Data.type === 'cryptos'){
          if (!this.config.coins[Data.code]){
          this.config.coins[Data.code] = { quantity: 0, quantityNew: ''};
          this.hasChanged.currencies = true;
          this.hasChanged.coins = true;
          } else if (this.config.coins[Data.code] && this.config.coins[Data.code].quantity == 0){
            delete this.config.coins[Data.code];
            this.hasChanged.currencies = true;
            this.hasChanged.coins = true;
          }

          } else if (Data.type === 'fiats'){ 
            if (!this.config.targets.list.includes(Data.code)){
              this.config.targets.list.push(Data.code);
              this.hasChanged.currencies = true;
              this.hasChanged.coins = true;
              } else if (this.config.targets.list.includes(Data.code) && this.config.targets.active!== Data.code){
                const index = this.config.targets.list.indexOf(Data.code);
                if (index > -1) {
                  this.config.targets.list.splice(index, 1); 
                }
                this.hasChanged.currencies = true;
                this.hasChanged.coins = true;
              }
          }

      } break;

      case 'tableSort': {
        const Data = data.data;
        const currentSort = this.ui.currenciesCard.tabs[Data.currency].sort;

        if (currentSort.column === Data.column) {
        currentSort.incOrder[Data.column] = !currentSort.incOrder[Data.column];
        } else {
          currentSort.column = Data.column;
          currentSort.incOrder[Data.column] = true; 
        }
         this.hasChanged[Data.currency].sort = true;
      } break;

      case 'changeCoinQty': {
        const Data = data.data;
        this.config.coins[Data.code].quantityNew = Data.e.target.value;
        this.hasChanged.coins = true;
      } break;

      case 'confirmCoinsModification': {
        const Data = data.data;
        if (Data.coins === 'acquired'){
          Object.values(this.config.coins).forEach(coin => {
            if(coin.quantity > 0 && coin.quantityNew !==''){
              coin.quantity = parseFloat(coin.quantityNew);
              coin.quantityNew ='';
            }
          });
        } else if (Data.coins === 'wished'){
          Object.values(this.config.coins).forEach(coin => {
            if(coin.quantity === 0 && coin.quantityNew !==''){
              coin.quantity = parseFloat(coin.quantityNew);
              coin.quantityNew ='';
            }
          });
        }
        this.hasChanged.coins = true;
      }break;

      case 'cancelCoinsModification': {
        const Data = data.data;
        if (Data.coins === 'acquired'){
          Object.values(this.config.coins).forEach(coin => {
            if(coin.quantity > 0 && coin.quantityNew !==''){
              coin.quantityNew ='';
            }
          });
        } else if (Data.coins === 'wished'){
          Object.values(this.config.coins).forEach(coin => {
            if(coin.quantity === 0 && coin.quantityNew !==''){
              coin.quantityNew ='';
            }
          });
        }
        this.hasChanged.coins = true;
      }break;

      default:
        console.error(`model.samPresent(), unknown do: '${data.do}' `);
    }
    // Demande à l'état de l'application de prendre en compte la modification
    // du modèle
    state.samUpdate(this);
  }
};
