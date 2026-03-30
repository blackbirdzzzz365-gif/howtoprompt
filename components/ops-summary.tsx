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
    return <div className="empty-state">Đang tải dữ liệu vận hành...</div>;
  }

  return (
    <div className="ops-grid">
      <article className="ops-card">
        <p className="micro-label">Tổng quan telemetry</p>
        <div className="stats-grid" style={{ marginTop: "18px" }}>
          <div className="stat-card">
            <p className="stat-label">Người dùng đang hoạt động</p>
            <p className="stat-value">{payload.activeUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Nhiệm vụ đã hoàn thành</p>
            <p className="stat-value">{payload.completedMissionCount}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Sự kiện đã ghi nhận</p>
            <p className="stat-value">{payload.totalEvents}</p>
          </div>
        </div>
      </article>

      <article className="ops-card">
        <p className="micro-label">Nhóm sự kiện nổi bật</p>
        <div className="list-stack" style={{ marginTop: "16px" }}>
          {Object.entries(payload.eventCountByType).length === 0 ? (
            <div className="empty-state">Chưa có sự kiện nào.</div>
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
        <p className="micro-label">Sự kiện gần đây</p>
        <div className="list-stack" style={{ marginTop: "16px" }}>
          {payload.recentEvents.length === 0 ? (
            <div className="empty-state">Chưa có sự kiện nào được ghi nhận.</div>
          ) : (
            payload.recentEvents.map((event) => (
              <div key={event.id} className="timeline-card" data-tone="neutral">
                <div className="detail-actions">
                  <strong>{event.event}</strong>
                  <span className="muted-copy">{new Date(event.createdAt).toLocaleString()}</span>
                </div>
                <p className="muted-copy" style={{ marginTop: "8px" }}>
                  Người dùng: {event.userId}
                </p>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
