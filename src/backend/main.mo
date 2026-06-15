import List "mo:core/List";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import ForexTypes "types/forex";
import SettingsTypes "types/settings";
import JournalTypes "types/journal";
import SettingsLib "lib/settings";
import ForexApi "mixins/forex-api";
import SettingsApi "mixins/settings-api";
import JournalApi "mixins/journal-api";

actor {
  let pairs : List.List<ForexTypes.ForexPair>;
  var settings : SettingsTypes.PropFirmSettings = SettingsLib.getDefaultSettings();
  let entries : List.List<JournalTypes.JournalEntry>;

  include MixinViews();
  include ForexApi(pairs);
  include SettingsApi(settings);
  include JournalApi(entries);
};
