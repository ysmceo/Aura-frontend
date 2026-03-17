import {
  EmptyState,
  SectionHeading,
  StatusPill,
  Surface
} from "@/components/site/shared";
import { useAdminDashboard } from "@/components/admin/AdminDashboardContext";

export default function MessagesSection() {
  const {
    messageSearch,
    setMessageSearch,
    messageTypeFilter,
    setMessageTypeFilter,
    messageStatusFilter,
    setMessageStatusFilter,
    filteredMessages,
    renderMessageReplyComposer
  } = useAdminDashboard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <Surface className="space-y-5 border-white/30 bg-panel/88 shadow-xl">
        <SectionHeading
          eyebrow="Inbox"
          title="Messages and complaints"
          description="Triage customer messages, filter the inbox, and reply directly from the admin dashboard."
        />

        <div className="grid gap-3 lg:grid-cols-3">
          <input
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            placeholder="Search complaints and messages"
            value={messageSearch}
            onChange={(event) => setMessageSearch(event.target.value)}
          />
          <select
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            value={messageTypeFilter}
            onChange={(event) => setMessageTypeFilter(event.target.value)}
          >
            <option value="all">All types</option>
            <option value="complaints">Complaints only</option>
            <option value="messages">Messages only</option>
          </select>
          <select
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            value={messageStatusFilter}
            onChange={(event) => setMessageStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredMessages.length === 0 ? <EmptyState title="Inbox clear" description="No records match the current filters." /> : null}
          {filteredMessages.map((item) => (
            <div key={item.id} className="min-w-0 rounded-[1.4rem] border border-line/70 bg-panel/92 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-words font-semibold text-ink">{item.subject}</p>
                <StatusPill value={item.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill value={item.reportType || "general_message"} />
                <span className="text-xs text-ink-soft">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</span>
              </div>
              <p className="mt-2 break-words text-sm text-ink-soft">{item.email}</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{item.message}</p>
              {item.reportFile ? (
                <p className="mt-2 text-sm">
                  <a className="break-all font-semibold text-brand-deep underline" href={item.reportFile} target="_blank" rel="noreferrer">
                    Open complaint attachment
                  </a>
                </p>
              ) : null}
              {renderMessageReplyComposer(item)}
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
