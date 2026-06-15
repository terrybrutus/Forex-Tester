import List "mo:core/List";
import Types "../types/research";

module {
  public func list(records : List.List<Types.ResearchRecord>) : [Types.ResearchRecord] {
    records.toArray();
  };

  public func save(records : List.List<Types.ResearchRecord>, record : Types.ResearchRecord) : () {
    let filtered = records.filter(func(existing) { existing.id != record.id });
    records.clear();
    filtered.forEach(func(existing) { records.add(existing) });
    records.add(record);
  };

  public func remove(records : List.List<Types.ResearchRecord>, id : Text) : () {
    let filtered = records.filter(func(record) { record.id != id });
    records.clear();
    filtered.forEach(func(record) { records.add(record) });
  };
};
