import List "mo:core/List";
import JournalTypes "../types/journal";
import JournalLib "../lib/journal";

mixin (entries: List.List<JournalTypes.JournalEntry>) {
  public query func getJournalEntries() : async [JournalTypes.JournalEntry] {
    JournalLib.getEntries(entries)
  };

  public shared func addJournalEntry(entry: JournalTypes.JournalEntry) : async () {
    JournalLib.addEntry(entries, entry);
  };

  public shared func clearJournal() : async () {
    JournalLib.clearEntries(entries);
  };
};
