import List "mo:core/List";
import Types "../types/forex";
import ForexLib "../lib/forex";

mixin (pairs : List.List<Types.ForexPair>) {
  /// Returns all currently tracked forex pairs with their latest prices
  public query func getPairs() : async [Types.ForexPair] {
    ForexLib.getPairs(pairs);
  };

  /// Adds a new pair to the tracked list (idempotent)
  public shared func addPair(symbol : Text) : async () {
    ForexLib.addPair(pairs, symbol);
  };

  /// Removes a pair from the tracked list
  public shared func removePair(symbol : Text) : async () {
    ForexLib.removePair(pairs, symbol);
  };

  /// Updates prices for all pairs (called by frontend polling or manual refresh)
  public shared func updatePrices(updates : [Types.ForexPair]) : async () {
    ForexLib.updatePrices(pairs, updates);
  };
};
