import Types "../types/settings";

module {
  public func getDefaultSettings() : Types.PropFirmSettings {
    {
      accountSize = 100000.0;
      dailyLossPercent = 5.0;
      maxLossPercent = 10.0;
      profitTargetPercent = 10.0;
      maxTradesPerDay = 5;
      maxRiskPerTrade = 1.0;
      newsTrading = false;
      overnightHolding = false;
      weekendHolding = false;
      eaAutomation = true;
      minProfitableDays = 3;
      firmName = "FTMO";
    }
  };
};
