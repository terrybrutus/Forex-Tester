import SettingsTypes "../types/settings";
import SettingsLib "../lib/settings";

mixin (settings: var SettingsTypes.PropFirmSettings) {
  public query func getSettings() : async SettingsTypes.PropFirmSettings {
    settings
  };

  public shared func updateSettings(newSettings: SettingsTypes.PropFirmSettings) : async () {
    settings := newSettings;
  };

  public shared func resetSettings() : async () {
    settings := SettingsLib.getDefaultSettings();
  };
};
