import List "mo:core/List";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import ForexTypes "types/forex";
import ResearchTypes "types/research";
import ForexApi "mixins/forex-api";
import ResearchApi "mixins/research-api";

actor {
  let pairs : List.List<ForexTypes.ForexPair>;
  let researchRecords : List.List<ResearchTypes.ResearchRecord>;

  include MixinViews();
  include ForexApi(pairs);
  include ResearchApi(researchRecords);
};
