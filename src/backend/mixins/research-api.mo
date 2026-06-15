import List "mo:core/List";
import Types "../types/research";
import Research "../lib/research";

mixin (records : List.List<Types.ResearchRecord>) {
  public query func getResearchRecords() : async [Types.ResearchRecord] {
    Research.list(records);
  };

  public shared func saveResearchRecord(record : Types.ResearchRecord) : async () {
    Research.save(records, record);
  };

  public shared func removeResearchRecord(id : Text) : async () {
    Research.remove(records, id);
  };
};
