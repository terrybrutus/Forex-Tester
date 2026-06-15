import List "mo:core/List";
import Types "../types/journal";

module {
  public func getEntries(entries: List.List<Types.JournalEntry>) : [Types.JournalEntry] {
    List.toArray(entries)
  };

  public func addEntry(entries: List.List<Types.JournalEntry>, entry: Types.JournalEntry) : List.List<Types.JournalEntry> {
    List.put(entry, entries)
  };

  public func clearEntries(_entries: List.List<Types.JournalEntry>) : List.List<Types.JournalEntry> {
    List.empty()
  };
};
