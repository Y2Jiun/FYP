import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

interface VerificationHistoryEvent {
  action: string;
  category?: string;
  details: {
    newStatus?: string;
    notes?: string;
    documentName?: string;
    documentUrl?: string;
    eventType?: string;
    performedAt?: any;
    performedBy?: string;
    performedByName?: string;
    previousStatus?: string;
  };
  performedAt?: any;
  performedBy?: string;
  performedByName?: string;
  previousStatus?: string;
  propertyId: string;
  userRole?: string;
}

interface PropertyVerificationHistoryTimelineProps {
  propertyId: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case "verified":
      return "bg-green-500 text-white";
    case "failed":
    case "rejected":
      return "bg-red-500 text-white";
    case "pending":
      return "bg-yellow-500 text-white";
    default:
      return "bg-blue-500 text-white";
  }
};

export default function PropertyVerificationHistoryTimeline({
  propertyId,
}: PropertyVerificationHistoryTimelineProps) {
  const [history, setHistory] = useState<VerificationHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const q = query(
        collection(db, "propertyVerificationHistory"),
        where("propertyId", "==", propertyId),
      );
      const querySnapshot = await getDocs(q);
      const events: VerificationHistoryEvent[] = [];
      querySnapshot.forEach((doc) => {
        events.push(doc.data() as VerificationHistoryEvent);
      });
      // Sort by performedAt (if available)
      events.sort((a, b) => {
        const aTime = a.details?.performedAt?.toDate
          ? a.details.performedAt.toDate()
          : new Date(a.details?.performedAt || 0);
        const bTime = b.details?.performedAt?.toDate
          ? b.details.performedAt.toDate()
          : new Date(b.details?.performedAt || 0);
        return aTime - bTime;
      });
      setHistory(events);
      setLoading(false);
    };
    fetchHistory();
  }, [propertyId]);

  if (loading)
    return <div className="text-gray-300">Loading verification history...</div>;
  if (!history.length)
    return <div className="text-gray-400">No verification history found.</div>;

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Verification History
      </h3>
      <div className="space-y-6">
        {history.map((event, idx) => (
          <div key={idx} className="flex items-start gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${statusColor(event.details?.newStatus || event.details?.eventType || "")}`}
              ></div>
              {idx < history.length - 1 && (
                <div className="h-10 w-0.5 bg-gray-600"></div>
              )}
            </div>
            {/* Event content */}
            <div className="flex-1 rounded-lg bg-gray-700 p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-white">
                  {event.action
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  {event.category && (
                    <span className="ml-2 rounded bg-gray-600 px-2 py-0.5 text-xs text-gray-200 capitalize">
                      {event.category}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400">
                  {event.details?.performedAt
                    ? event.details.performedAt.toDate
                      ? event.details.performedAt.toDate().toLocaleString()
                      : new Date(event.details.performedAt).toLocaleString()
                    : ""}
                </span>
              </div>
              <div className="mb-1 text-sm text-gray-300">
                Status:{" "}
                <span
                  className={`rounded px-2 py-0.5 ${statusColor(event.details?.newStatus || "")}`}
                >
                  {event.details?.newStatus || "-"}
                </span>
                {event.details?.previousStatus && (
                  <span className="ml-2 text-xs text-gray-400">
                    (from {event.details.previousStatus})
                  </span>
                )}
              </div>
              {event.details?.documentName && (
                <div className="mb-1 text-sm text-blue-300">
                  Document:{" "}
                  {event.details.documentUrl ? (
                    <a
                      href={event.details.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {event.details.documentName}
                    </a>
                  ) : (
                    event.details.documentName
                  )}
                </div>
              )}
              {event.details?.notes && (
                <div className="mb-1 text-sm text-gray-400 italic">
                  "{event.details.notes}"
                </div>
              )}
              <div className="text-xs text-gray-400">
                By: {event.details?.performedByName || event.performedBy || "-"}{" "}
                ({event.userRole || "-"})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
