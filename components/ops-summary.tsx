"use client";

import { useEffect, useState } from "react";

type OpsPayload = {
  activeUsers: number;
  completedMissionCount: number;
  totalEvents: number;
  eventCountByType: Record<string, number>;
  recentEvents: Array<{
    id: string;
    event: string;
    userId: string;
    createdAt: string;
    payload: Record<string, string | number | boolean | null>;
  }>;
};

export function OpsSummary() {
  const [payload, setPayload] = useState<OpsPayload | null>(null);

  useEffect(() => {
    void fetch("/api/ops/summary", { cache: "no-store" })
      .then((response) => response.json())
      .then((nextPayload) => setPayload(nextPayload as OpsPayload));
  }, []);

  if (!payload) {
    return <div className="empty-state">Dang tai ops summary...</div>;
  }

  return (
    <div className="ops-grid">
      <article className="ops-card">
        <p className="micro-label">Telemetry snapshot</p>
        <div className="stats-grid" style={{ marginTop: "18px" }}>
          <div className="stat-card">
            <p className="stat-label">Active users</p>
            <p className="stat-value">{payload.activeUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Completed missions</p>
            <p className="stat-value">{payload.completedMissionCount}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Events</p>
            <p className="stat-value">{payload.totalEvents}</p>
          </div>
        </div>
      </article>

      <article className="ops-card">
        <p className="micro-label">Top event types</p>
        <div className="list-stack" style={{ marginTop: "16px" }}>
          {Object.entries(payload.eventCountByType).length === 0 ? (
            <div className="empty-state">Chua co event nao.</div>
          ) : (
            Object.entries(payload.eventCountByType).map(([event, count]) => (
              <div key={event} className="timeline-card" data-tone="neutral">
                <div className="detail-actions">
                  <strong>{event}</strong>
                  <span>{count}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <p className="micro-label">Recent events</p>
        <div className="list-stack" style={{ marginTop: "16px" }}>
          {payload.recentEvents.length === 0 ? (
            <div className="empty-state">Chua co event nao duoc ghi nhan.</div>
          ) : (
            payload.recentEvents.map((event) => (
              <div key={event.id} className="timeline-card" data-tone="neutral">
                <div className="detail-actions">
                  <strong>{event.event}</strong>
                  <span className="muted-copy">{new Date(event.createdAt).toLocaleString()}</span>
                </div>
                <p className="muted-copy" style={{ marginTop: "8px" }}>
                  userId: {event.userId}
                </p>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
