module {
  public type TradeDirection = { #Long; #Short };
  public type VolatilityState = { #Dead; #Normal; #HighQuality; #Chaotic };
  public type TradeResult = { #Win; #Loss; #BreakEven; #Open };

  public type JournalEntry = {
    id: Text;
    timestamp: Int;
    pair: Text;
    direction: TradeDirection;
    score: Nat;
    strategy: Text;
    session: Text;
    volatilityState: VolatilityState;
    entryPrice: Float;
    stopLoss: Float;
    takeProfit: Float;
    lotSize: Float;
    riskAmount: Float;
    result: TradeResult;
    rMultiple: Float;
    notes: Text;
    ruleViolationsPrevented: [Text];
  };
};
