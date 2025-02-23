
//------------------------------------------------------------------ Actions ---
// Actions appelées dans le code HTML quand des événements surviennent
//
actions = {

  //------------------------------- Initialisation et chargement des données ---

  async initAndGo(initialConfig) {
    console.log('initAndGo: ', initialConfig);

    if (initialConfig.config.dataMode == 'online') {
      
      const params = {
        target : initialConfig.config.targets.wished,
        debug  : initialConfig.config.debug,
      };
      let coinlayerData = await coinlayerRequest(params);
      
      if (coinlayerData.success) {
        initialConfig.data.online = coinlayerData;
      } else {
        console.log('initAndGo: Données en ligne indisponibles');
        console.log('initAndGo: BASCULEMENT EN MODE HORS-LIGNE');
        initialConfig.config.dataMode = 'offline';
      }
    }
  model.samPresent({do:'init', config:initialConfig});
  },

  reinit(data) {
    const initialConfigName =  data.e.target.value;
    configsSelected = initialConfigName;
    actions.initAndGo(configs[initialConfigName]);
  },

  async updateOnlineCurrenciesData(data) {
    const params = {
      debug  : data.debug,
      target : data.target,
    };
    let coinlayerData = await coinlayerRequest(params);
    if (coinlayerData.list.success && coinlayerData.live.success) { // CORRIGE : la condition était juste "coinlayerData.success", qui est une propriété non existante
      model.samPresent({do:'updateCurrenciesData', currenciesData: coinlayerData});
    } else {
      console.log('updateOnlineCurrenciesData: Données en ligne indisponibles');
      console.log('updateOnlineCurrenciesData: BASCULEMENT EN MODE HORS-LIGNE');
      model.samPresent({do:'changeDataMode', dataMode:'offline'});
    }
  },

  //----------------------------------------------------------- CurrenciesUI ---

  changePage(data){
    model.samPresent({do:'changePage', data});
  },

  updateFilter(data){
    model.samPresent({do:'updateFilter', data});
  },
  updatePriceFilter(data){
    model.samPresent({do:'updatePriceFilter', data});
  },

  updatePerPage(data){
    model.samPresent({do:'updatePerPage', data});
  },

  selectCurrency(data){
    model.samPresent({do:'selectCurrency', data});
  },

  tableSort(data){
    model.samPresent({do:'tableSort', data});
  },
  
  //----------------------------------------------- CurrenciesUI et WalletUI ---
  changeTab(data) {
    model.samPresent({do:'changeTab', ...data});
  },


  //---------------------------------------------------------- PreferencesUI ---

  changeTarget(data) {
    data.target = data.e.target.value;
    delete data.e;
    this.updateOnlineCurrenciesData(data)
  },

  changeDataMode(data) {
    data.dataMode = data.e.target.value;
    delete data.e;
    if (data.dataMode == 'online') {
      this.updateOnlineCurrenciesData(data)
    }
    model.samPresent({do:'changeDataMode', ...data});
  },

  //--------------------------------------------------------------- WalletUI ---

  changeCoinQty(data){
    model.samPresent({do:'changeCoinQty', data});
  },

  confirmCoinsModification(data){
    model.samPresent({do:'confirmCoinsModification', data});
  },

  cancelCoinsModification(data){
    model.samPresent({do:'cancelCoinsModification', data});
  }
};
