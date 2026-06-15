import { runBacktest } from "@/research/backtest";
import { createResearchFixture, parseCsvDataset } from "@/research/datasets";
import { INSTRUMENTS } from "@/research/instruments";
import {
  loadDatasets,
  loadResults,
  saveDatasets,
  saveResults,
} from "@/research/storage";
import { STRATEGIES } from "@/research/strategies";
import { TOPSTEP_50K } from "@/research/topstep";
import type {
  BacktestResult,
  Dataset,
  InstrumentCode,
  ResearchStatus,
  StrategyId,
} from "@/types";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Database,
  FlaskConical,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

type View = "overview" | "datasets" | "experiments" | "evidence" | "rules";

const VIEWS: Array<{ id: View; label: string; icon: typeof BarChart3 }> = [
  { id: "overview", label: "Research overview", icon: BarChart3 },
  { id: "datasets", label: "Datasets", icon: Database },
  { id: "experiments", label: "Experiments", icon: FlaskConical },
  { id: "evidence", label: "Evidence journal", icon: BookOpenCheck },
  { id: "rules", label: "Topstep governor", icon: ShieldCheck },
];

export default function App() {
  const [view, setView] = useState<View>("overview");
  const [datasets, setDatasets] = useState<Dataset[]>(() => [
    createResearchFixture("M6E"),
    createResearchFixture("MCL"),
  ]);
  const [results, setResults] = useState<BacktestResult[]>(loadResults);
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasets[0].id);
  const [selectedStrategyId, setSelectedStrategyId] =
    useState<StrategyId>("trend-pullback");
  const [contextDatasetId, setContextDatasetId] = useState("fixture-MCL");
  const [notice, setNotice] = useState(
    "Fixture data is research-only and cannot qualify a strategy.",
  );

  const selectedDataset =
    datasets.find((dataset) => dataset.id === selectedDatasetId) ?? datasets[0];
  const latest = results[0] ?? null;
  const qualified = results.filter(
    (result) => result.qualification.status === "Qualified",
  ).length;

  useEffect(() => {
    void loadDatasets().then((stored) => {
      if (stored.length > 0) {
        setDatasets(stored);
        setSelectedDatasetId(stored[0].id);
      }
    });
  }, []);

  function persistDatasets(next: Dataset[]) {
    setDatasets(next);
    void saveDatasets(next);
  }

  function runExperiment() {
    const contextDataset = datasets.find(
      (dataset) => dataset.id === contextDatasetId,
    );
    const result = runBacktest(
      selectedDataset,
      STRATEGIES[selectedStrategyId],
      contextDataset,
    );
    if (selectedDataset.source === "Fixture") {
      result.qualification = {
        status: "Research only",
        reasons: ["Deterministic fixture data cannot qualify a strategy."],
      };
    }
    const next = [result, ...results];
    setResults(next);
    saveResults(next);
    setNotice(
      `${result.strategy.name} completed with ${result.metrics.trades} trades and ${result.metrics.expectancyR.toFixed(2)}R expectancy.`,
    );
    setView("evidence");
  }

  async function importCsv(file: File, instrument: InstrumentCode) {
    try {
      const dataset = parseCsvDataset(await file.text(), instrument, file.name);
      const next = [dataset, ...datasets];
      persistDatasets(next);
      setSelectedDatasetId(dataset.id);
      setNotice(
        `${file.name} imported. Verify its source and rollover handling before qualification.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to import dataset.",
      );
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            CL
          </span>
          <div>
            <strong>Convergence Lab</strong>
            <span>Topstep research governor</span>
          </div>
        </div>
        <nav>
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              className={view === id ? "nav-item active" : "nav-item"}
              key={id}
              onClick={() => setView(id)}
              type="button"
              aria-current={view === id ? "page" : undefined}
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Research gate</strong>
          <span>
            No strategy is trusted until it survives imported data and Topstep
            simulation.
          </span>
        </div>
      </aside>

      <main id="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Evidence-driven futures research</p>
            <h1>{VIEWS.find((item) => item.id === view)?.label}</h1>
          </div>
          <span className="status-pill warning">
            <AlertTriangle aria-hidden="true" size={15} />
            Research only
          </span>
        </header>

        <output className="notice" aria-live="polite">
          {notice}
        </output>

        {view === "overview" && (
          <Overview
            datasets={datasets}
            results={results}
            qualified={qualified}
            latest={latest}
          />
        )}
        {view === "datasets" && (
          <Datasets
            datasets={datasets}
            selectedDatasetId={selectedDatasetId}
            onSelect={setSelectedDatasetId}
            onImport={importCsv}
          />
        )}
        {view === "experiments" && (
          <Experiments
            datasets={datasets}
            selectedDatasetId={selectedDatasetId}
            selectedStrategyId={selectedStrategyId}
            contextDatasetId={contextDatasetId}
            onDatasetChange={setSelectedDatasetId}
            onStrategyChange={setSelectedStrategyId}
            onContextDatasetChange={setContextDatasetId}
            onRun={runExperiment}
          />
        )}
        {view === "evidence" && <Evidence results={results} />}
        {view === "rules" && <Rules />}
      </main>
    </div>
  );
}

function Overview({
  datasets,
  results,
  qualified,
  latest,
}: {
  datasets: Dataset[];
  results: BacktestResult[];
  qualified: number;
  latest: BacktestResult | null;
}) {
  return (
    <section className="page-grid" aria-labelledby="overview-heading">
      <h2 className="sr-only" id="overview-heading">
        Research overview
      </h2>
      <div className="metric-grid">
        <Metric
          label="Datasets cached"
          value={String(datasets.length)}
          detail="Browser-local, no polling"
        />
        <Metric
          label="Experiments run"
          value={String(results.length)}
          detail="Versioned evidence"
        />
        <Metric
          label="Qualified methods"
          value={String(qualified)}
          detail="Imported data only"
        />
        <Metric
          label="Topstep profile"
          value="$50K"
          detail={`$${TOPSTEP_50K.maximumLossLimit.toLocaleString()} maximum loss`}
        />
      </div>
      <article className="panel wide">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Qualification pipeline</p>
            <h2>What must happen before a trade instruction exists</h2>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
        <ol className="pipeline">
          <PipelineStep
            title="Import trustworthy data"
            detail="Databento CSV or another verified source."
          />
          <PipelineStep
            title="Run deterministic experiment"
            detail="Costs, ticks, stops, and exits are included."
          />
          <PipelineStep
            title="Reject weak methods"
            detail="Negative expectancy and excessive drawdown are explicit."
          />
          <PipelineStep
            title="Simulate Topstep survival"
            detail="The $50K maximum loss and personal daily stop apply."
          />
          <PipelineStep
            title="Forward-test qualified method"
            detail="Live instructions remain disabled until this stage."
          />
        </ol>
      </article>
      <article className="panel">
        <p className="eyebrow">Latest experiment</p>
        {latest ? (
          <>
            <h2>{latest.strategy.name}</h2>
            <Status status={latest.qualification.status} />
            <dl className="definition-list">
              <Row term="Trades" value={String(latest.metrics.trades)} />
              <Row
                term="Expectancy"
                value={`${latest.metrics.expectancyR.toFixed(2)}R`}
              />
              <Row
                term="Profit factor"
                value={latest.metrics.profitFactor.toFixed(2)}
              />
              <Row term="Net result" value={currency(latest.metrics.netPnl)} />
            </dl>
          </>
        ) : (
          <Empty
            title="No experiments yet"
            detail="Run a strategy against a dataset to create evidence."
          />
        )}
      </article>
      <article className="panel">
        <p className="eyebrow">Safety architecture</p>
        <h2>Caffeine-safe by design</h2>
        <ul className="check-list">
          <li>Historical candles remain browser-side.</li>
          <li>Backtests run without canister HTTP outcalls.</li>
          <li>Only compact evidence summaries need persistence.</li>
          <li>Fixture and imported data are visibly distinguished.</li>
        </ul>
      </article>
    </section>
  );
}

function Datasets({
  datasets,
  selectedDatasetId,
  onSelect,
  onImport,
}: {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelect: (id: string) => void;
  onImport: (file: File, instrument: InstrumentCode) => void;
}) {
  const [instrument, setInstrument] = useState<InstrumentCode>("M6E");
  return (
    <section className="page-grid">
      <article className="panel wide">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Low-cost research ingestion</p>
            <h2>Import Databento-compatible OHLCV CSV</h2>
          </div>
          <Upload aria-hidden="true" />
        </div>
        <p className="muted">
          Required columns: timestamp, open, high, low, close, volume. Imported
          datasets are cached locally and reused without recurring API calls.
        </p>
        <div className="form-row">
          <label>
            Instrument
            <select
              value={instrument}
              onChange={(event) =>
                setInstrument(event.target.value as InstrumentCode)
              }
            >
              {Object.values(INSTRUMENTS).map((spec) => (
                <option key={spec.code} value={spec.code}>
                  {spec.code} - {spec.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            CSV dataset
            <input
              accept=".csv,text/csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onImport(file, instrument);
              }}
              type="file"
            />
          </label>
        </div>
      </article>
      <article className="panel wide">
        <p className="eyebrow">Available datasets</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Use</th>
                <th scope="col">Dataset</th>
                <th scope="col">Source</th>
                <th scope="col">Instrument</th>
                <th scope="col">Candles</th>
                <th scope="col">Qualification</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr key={dataset.id}>
                  <td>
                    <input
                      aria-label={`Use ${dataset.name}`}
                      checked={selectedDatasetId === dataset.id}
                      name="dataset"
                      onChange={() => onSelect(dataset.id)}
                      type="radio"
                    />
                  </td>
                  <td>{dataset.name}</td>
                  <td>{dataset.source}</td>
                  <td className="mono">{dataset.instrument}</td>
                  <td className="mono">
                    {dataset.candles.length.toLocaleString()}
                  </td>
                  <td>
                    {dataset.source === "Fixture"
                      ? "Research only"
                      : "Eligible for testing"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function Experiments({
  datasets,
  selectedDatasetId,
  selectedStrategyId,
  contextDatasetId,
  onDatasetChange,
  onStrategyChange,
  onContextDatasetChange,
  onRun,
}: {
  datasets: Dataset[];
  selectedDatasetId: string;
  selectedStrategyId: StrategyId;
  contextDatasetId: string;
  onDatasetChange: (value: string) => void;
  onStrategyChange: (value: StrategyId) => void;
  onContextDatasetChange: (value: string) => void;
  onRun: () => void;
}) {
  const strategy = STRATEGIES[selectedStrategyId];
  return (
    <section className="page-grid">
      <article className="panel wide">
        <p className="eyebrow">Experiment configuration</p>
        <h2>Test a hypothesis without pretending it is proven</h2>
        <div className="form-row">
          <label>
            Dataset
            <select
              value={selectedDatasetId}
              onChange={(event) => onDatasetChange(event.target.value)}
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Strategy
            <select
              value={selectedStrategyId}
              onChange={(event) =>
                onStrategyChange(event.target.value as StrategyId)
              }
            >
              {Object.values(STRATEGIES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Context dataset
            <select
              value={contextDatasetId}
              onChange={(event) => onContextDatasetChange(event.target.value)}
              disabled={selectedStrategyId !== "macro-continuation"}
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="strategy-card">
          <div>
            <strong>{strategy.name}</strong>
            <span>Version {strategy.version}</span>
          </div>
          <p>{strategy.thesis}</p>
          <dl className="definition-list">
            <Row
              term="Maximum trade risk"
              value={currency(strategy.parameters.maxRiskDollars)}
            />
            <Row
              term="Stop distance"
              value={`${strategy.parameters.stopAtr} ATR`}
            />
            <Row term="Target" value={`${strategy.parameters.targetR}R`} />
            <Row
              term="ET session"
              value={`${strategy.parameters.sessionStartHourEt}:00-${strategy.parameters.sessionEndHourEt}:00`}
            />
          </dl>
        </div>
        <button className="primary-button" onClick={onRun} type="button">
          <FlaskConical aria-hidden="true" size={18} />
          Run deterministic backtest
        </button>
      </article>
      <article className="panel">
        <p className="eyebrow">Qualification requirements</p>
        <h2>Initial evidence gate</h2>
        <ul className="check-list">
          <li>At least 300 completed trades.</li>
          <li>Positive expectancy after costs.</li>
          <li>Profit factor of at least 1.20.</li>
          <li>Maximum drawdown at or below $1,200.</li>
          <li>No Topstep simulation failure.</li>
          <li>Fixture data can never qualify.</li>
        </ul>
      </article>
    </section>
  );
}

function Evidence({ results }: { results: BacktestResult[] }) {
  return (
    <section className="page-grid">
      <article className="panel wide">
        <p className="eyebrow">Evidence journal</p>
        <h2>Every result remains visible, including failures</h2>
        {results.length === 0 ? (
          <Empty
            title="No evidence recorded"
            detail="Run the first experiment to create an audit trail."
          />
        ) : (
          <div className="result-list">
            {results.map((result) => (
              <details key={result.id}>
                <summary>
                  <div>
                    <strong>{result.strategy.name}</strong>
                    <span>
                      {result.metrics.trades} trades ·{" "}
                      {result.metrics.expectancyR.toFixed(2)}R expectancy
                    </span>
                  </div>
                  <Status status={result.qualification.status} />
                </summary>
                <div className="result-body">
                  <div className="metric-grid compact">
                    <Metric
                      label="Win rate"
                      value={`${result.metrics.winRate.toFixed(1)}%`}
                      detail="Net winners"
                    />
                    <Metric
                      label="Profit factor"
                      value={result.metrics.profitFactor.toFixed(2)}
                      detail="After costs"
                    />
                    <Metric
                      label="Net P/L"
                      value={currency(result.metrics.netPnl)}
                      detail="Simulated"
                    />
                    <Metric
                      label="Max drawdown"
                      value={currency(result.metrics.maxDrawdown)}
                      detail="Peak to trough"
                    />
                  </div>
                  <h3>Qualification findings</h3>
                  <ul className="finding-list">
                    {result.qualification.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <h3>Recent trades</h3>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">Time</th>
                          <th scope="col">Direction</th>
                          <th scope="col">Contracts</th>
                          <th scope="col">Exit</th>
                          <th scope="col">Net P/L</th>
                          <th scope="col">R</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.trades
                          .slice(-10)
                          .reverse()
                          .map((trade) => (
                            <tr key={trade.id}>
                              <td>
                                {new Date(trade.entryTime).toLocaleString()}
                              </td>
                              <td>{trade.direction}</td>
                              <td className="mono">{trade.contracts}</td>
                              <td>{trade.exitReason}</td>
                              <td className="mono">{currency(trade.netPnl)}</td>
                              <td className="mono">
                                {trade.rMultiple.toFixed(2)}R
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

function Rules() {
  return (
    <section className="page-grid">
      <article className="panel wide">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Initial account profile</p>
            <h2>Topstep $50K research governor</h2>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
        <div className="metric-grid">
          <Metric
            label="Profit target"
            value={currency(TOPSTEP_50K.profitTarget)}
            detail="Evaluation simulation"
          />
          <Metric
            label="Maximum Loss Limit"
            value={currency(TOPSTEP_50K.maximumLossLimit)}
            detail="Trailing simulation"
          />
          <Metric
            label="Personal daily stop"
            value={currency(TOPSTEP_50K.personalDailyLossLimit)}
            detail="Stricter than firm limit"
          />
          <Metric
            label="Consistency target"
            value={`< ${currency(TOPSTEP_50K.consistencyTarget)}`}
            detail="Best single day"
          />
        </div>
        <div className="warning-box">
          <AlertTriangle aria-hidden="true" />
          <div>
            <strong>Rules require verification before purchase.</strong>
            <p>
              Topstep can change account parameters. The production profile must
              be checked against the purchased account and current terms before
              live use.
            </p>
          </div>
        </div>
      </article>
      <article className="panel">
        <p className="eyebrow">Execution discipline</p>
        <h2>Planned controls</h2>
        <ul className="check-list">
          <li>Maximum two consecutive losses before stopping.</li>
          <li>No new trade when remaining daily capacity is insufficient.</li>
          <li>Contract count derived from stop distance and tick value.</li>
          <li>Commissions included before a trade is approved.</li>
        </ul>
      </article>
    </section>
  );
}

function Metric({
  label,
  value,
  detail,
}: { label: string; value: string; detail: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function PipelineStep({ title, detail }: { title: string; detail: string }) {
  return (
    <li>
      <CheckCircle2 aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </li>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Status({ status }: { status: ResearchStatus }) {
  const className =
    status === "Qualified"
      ? "status-pill success"
      : status === "Rejected"
        ? "status-pill danger"
        : "status-pill warning";
  return <span className={className}>{status}</span>;
}

function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty">
      <FlaskConical aria-hidden="true" />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
