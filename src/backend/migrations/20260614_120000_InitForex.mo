import List "mo:core/List";

module {
  type ForexPair = {
    symbol : Text;
    bid : Float;
    ask : Float;
    changePercent : Float;
    isUp : Bool;
  };

  type OldActor = {};

  type NewActor = {
    pairs : List.List<ForexPair>;
  };

  public func migration(_ : OldActor) : NewActor {
    let pairs = List.empty<ForexPair>();
    pairs.add({ symbol = "EUR/USD"; bid = 1.08412; ask = 1.08428; changePercent = 0.12; isUp = true });
    pairs.add({ symbol = "GBP/USD"; bid = 1.27135; ask = 1.27155; changePercent = -0.08; isUp = false });
    pairs.add({ symbol = "USD/JPY"; bid = 157.342; ask = 157.368; changePercent = 0.31; isUp = true });
    { pairs };
  };
};
