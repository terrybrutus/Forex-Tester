module {
  public type PropFirmSettings = {
    accountSize: Float;
    dailyLossPercent: Float;
    maxLossPercent: Float;
    profitTargetPercent: Float;
    maxTradesPerDay: Nat;
    maxRiskPerTrade: Float;
    newsTrading: Bool;
    overnightHolding: Bool;
    weekendHolding: Bool;
    eaAutomation: Bool;
    minProfitableDays: Nat;
    firmName: Text;
  };
};
