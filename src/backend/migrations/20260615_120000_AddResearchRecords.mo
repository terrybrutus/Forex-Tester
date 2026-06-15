import List "mo:core/List";

module {
  type ForexPair = {
    symbol : Text;
    bid : Float;
    ask : Float;
    changePercent : Float;
    isUp : Bool;
  };

  type ResearchRecord = {
    id : Text;
    createdAt : Int;
    kind : Text;
    payload : Text;
  };

  type OldActor = {
    pairs : List.List<ForexPair>;
  };

  type NewActor = {
    pairs : List.List<ForexPair>;
    researchRecords : List.List<ResearchRecord>;
  };

  public func migration(old : OldActor) : NewActor {
    {
      pairs = old.pairs;
      researchRecords = List.empty<ResearchRecord>();
    };
  };
};
