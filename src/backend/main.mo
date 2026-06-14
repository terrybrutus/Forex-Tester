import List "mo:core/List";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import ForexTypes "types/forex";
import ForexApi "mixins/forex-api";

actor {
  let pairs : List.List<ForexTypes.ForexPair>;

  include MixinViews();
  include ForexApi(pairs);
};
