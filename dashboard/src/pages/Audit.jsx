import { useState } from "react";
import {
  ShieldCheck,
  Brain,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  IndianRupee,
} from "lucide-react";

import PageHeader from "../components/PageHeader";

function Audit() {
  const [loading, setLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [error, setError] = useState("");

  async function loadAudit() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/audit"
      );

      if (!response.ok) {
        throw new Error("Unable to load audit trail");
      }

      const data = await response.json();

      setAuditLog(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to load audit trail."
      );
    } finally {
      setLoading(false);
    }
  }

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <section className="audit-page">

      <PageHeader
        eyebrow="AUDIT TRAIL"
        title="Every Recovery Decision Is Traceable"
        description="Track the complete decision path from ML prediction and AI recommendation to policy governance and simulated execution."
      />


      {/* HEADER */}

      <div className="audit-toolbar">

        <div>
          <p className="eyebrow">
            DECISION HISTORY
          </p>

          <h3>
            Recovery Audit Log
          </h3>

          <p>
            Persistent record of RevivePay recovery
            decisions and execution outcomes.
          </p>
        </div>


        <button
          className="audit-refresh-button"
          onClick={loadAudit}
          disabled={loading}
        >

          {loading ? (
            <>
              <RefreshCw
                size={14}
                className="spin"
              />

              Loading...
            </>
          ) : (
            <>
              <Activity size={14} />

              Load Audit Trail
            </>
          )}

        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="audit-error">
          {error}
        </div>
      )}


      {/* AUDIT EVENTS */}

      {auditLog.length > 0 && (

        <div className="audit-list">

          {auditLog
            .slice()
            .reverse()
            .map((event, index) => {

              const isAllowed =
                event.policy_decision === "ALLOW";

              const isRecovered =
                event.execution_outcome ===
                "RECOVERED";

              return (

                <div
                  className="audit-card"
                  key={`${event.transaction_id}-${index}`}
                >

                  {/* EVENT HEADER */}

                  <div className="audit-card-header">

                    <div className="audit-transaction">

                      <span>
                        TRANSACTION
                      </span>

                      <strong>
                        {event.transaction_id}
                      </strong>

                    </div>


                    <div className="audit-time">

                      {event.timestamp
                        ? new Date(
                            event.timestamp
                          ).toLocaleString("en-IN")
                        : "—"}

                    </div>

                  </div>


                  {/* MONEY */}

                  <div className="audit-money-row">

                    <div>

                      <small>
                        AMOUNT
                      </small>

                      <strong>
                        {formatMoney(
                          event.amount
                        )}
                      </strong>

                    </div>


                    <div>

                      <small>
                        ML RECOVERY
                      </small>

                      <strong>
                        {(
                          event.recovery_probability *
                          100
                        ).toFixed(2)}
                        %
                      </strong>

                    </div>


                    <div>

                      <small>
                        EXPECTED RECOVERY
                      </small>

                      <strong>
                        {formatMoney(
                          event.expected_recovery_value
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* DECISION PIPELINE */}

                  <div className="audit-pipeline">

                    {/* ML */}

                    <div className="audit-stage">

                      <div className="audit-stage-icon">
                        <Brain size={15} />
                      </div>

                      <span>
                        ML PREDICTION
                      </span>

                      <strong>
                        {(
                          event.recovery_probability *
                          100
                        ).toFixed(2)}
                        %
                      </strong>

                    </div>


                    <div className="audit-arrow">
                      →
                    </div>


                    {/* AI */}

                    <div className="audit-stage">

                      <div className="audit-stage-icon">
                        <Brain size={15} />
                      </div>

                      <span>
                        AI RECOMMENDATION
                      </span>

                      <strong>
                        {event.ai_recommendation}
                      </strong>

                    </div>


                    <div className="audit-arrow">
                      →
                    </div>


                    {/* POLICY */}

                    <div
                      className={`audit-stage ${
                        isAllowed
                          ? "audit-allowed"
                          : "audit-blocked"
                      }`}
                    >

                      <div className="audit-stage-icon">

                        {isAllowed ? (
                          <ShieldCheck size={15} />
                        ) : (
                          <XCircle size={15} />
                        )}

                      </div>

                      <span>
                        POLICY DECISION
                      </span>

                      <strong>
                        {event.policy_decision}
                      </strong>

                    </div>


                    <div className="audit-arrow">
                      →
                    </div>


                    {/* EXECUTION */}

                    <div
                      className={`audit-stage ${
                        isRecovered
                          ? "audit-recovered"
                          : ""
                      }`}
                    >

                      <div className="audit-stage-icon">

                        {isRecovered ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Activity size={15} />
                        )}

                      </div>

                      <span>
                        EXECUTION
                      </span>

                      <strong>
                        {event.execution_outcome}
                      </strong>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="audit-details">

                    <div>

                      <small>
                        FINAL ACTION
                      </small>

                      <strong>
                        {event.final_action}
                      </strong>

                    </div>


                    <div>

                      <small>
                        EXECUTION STATUS
                      </small>

                      <strong>
                        {event.execution_status}
                      </strong>

                    </div>


                    <div>

                      <small>
                        POLICY REASON
                      </small>

                      <p>
                        {event.policy_reason}
                      </p>

                    </div>

                  </div>


                  {/* RECOVERY RESULT */}

                  <div
                    className={`audit-outcome ${
                      isRecovered
                        ? "audit-outcome-success"
                        : "audit-outcome-neutral"
                    }`}
                  >

                    {isRecovered ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Activity size={16} />
                    )}

                    <div>

                      <span>
                        EXECUTION OUTCOME
                      </span>

                      <strong>
                        {event.execution_outcome}
                      </strong>

                    </div>

                    {isRecovered && (
                      <div className="audit-recovered-money">

                        <IndianRupee size={13} />

                        {formatMoney(
                          event.amount
                        )}

                      </div>
                    )}

                  </div>

                </div>
              );
            })}

        </div>
      )}


      {/* EMPTY */}

      {auditLog.length === 0 &&
        !loading &&
        !error && (

          <div className="audit-empty">

            <ShieldCheck size={25} />

            <h3>
              Audit trail ready
            </h3>

            <p>
              Click "Load Audit Trail" to inspect
              recovery decisions recorded by RevivePay.
            </p>

          </div>
        )}


      {/* PRINCIPLE */}

      <div className="audit-principle">

        <ShieldCheck size={17} />

        <div>

          <strong>
            AI recommends. Policy decides.
          </strong>

          <p>
            Every recovery decision records its ML
            prediction, AI recommendation, policy
            decision, final action and execution outcome.
          </p>

        </div>

      </div>

    </section>
  );
}

export default Audit;