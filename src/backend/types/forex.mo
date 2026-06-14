module {
  public type PairSymbol = Text; // e.g. "EUR/USD"

  public type ForexPair = {
    symbol : PairSymbol;
    bid : Float;
    ask : Float;
    changePercent : Float;
    isUp : Bool;
  };
};
