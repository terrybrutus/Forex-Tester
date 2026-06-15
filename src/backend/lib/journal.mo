import List "mo:core/List";
import Types "../types/journal";

module {
  public func getEntries(entries : List.List<Types.JournalEntry>) : [Types.JournalEntry] {
    entries.toArray()
  };

  public func addEntry(entries : List.List<Types.JournalEntry>, entry : Types.JournalEntry) : () {
    entries.add(entry)
  };

  public func clearEntries(entries : List.List<Types.JournalEntry>) : () {
    entries.clear()
  };
};
