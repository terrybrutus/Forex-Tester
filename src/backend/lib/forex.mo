import List "mo:core/List";
import Types "../types/forex";

module {
  public func addPair(pairs : List.List<Types.ForexPair>, symbol : Types.PairSymbol) : () {
    let exists = pairs.find(func(p : Types.ForexPair) : Bool { p.symbol == symbol });
    switch (exists) {
      case (?_) {};
      case null {
        pairs.add({ symbol; bid = 0.0; ask = 0.0; changePercent = 0.0; isUp = true });
      };
    };
  };

  public func removePair(pairs : List.List<Types.ForexPair>, symbol : Types.PairSymbol) : () {
    let filtered = pairs.filter(func(p : Types.ForexPair) : Bool { p.symbol != symbol });
    pairs.clear();
    filtered.forEach(func(p : Types.ForexPair) { pairs.add(p) });
  };

  public func getPairs(pairs : List.List<Types.ForexPair>) : [Types.ForexPair] {
    pairs.toArray();
  };

  public func updatePrices(pairs : List.List<Types.ForexPair>, updates : [Types.ForexPair]) : () {
    pairs.mapInPlace(
      func(pair : Types.ForexPair) : Types.ForexPair {
        let found = updates.find(func(u) { u.symbol == pair.symbol });
        switch (found) {
          case (?u) { u };
          case null { pair };
        };
      }
    );
  };
};
