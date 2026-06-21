import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Search, Car, Users, Phone, MoreVertical } from "lucide-react";
import { useStore } from "../store";
import { Avatar } from "../ui";
import { cn } from "../utils/cn";

export default function MessagesView() {
  const { conversations, sendMessage } = useStore();
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const list = conversations.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const send = () => {
    if (!text.trim() || !active) return;
    sendMessage(active.id, text.trim());
    setText("");
  };

  return (
    <div className="h-full p-3 sm:p-4">
      <div className="mx-auto grid h-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[320px_1fr]">
        {/* list */}
        <div className={cn("flex flex-col border-r border-slate-100", active && "hidden md:flex")}>
          <div className="border-b border-slate-100 p-3">
            <h2 className="mb-2 px-1 text-base font-bold text-slate-900">Messages</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:bg-white" />
            </div>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto p-2">
            {list.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition", c.id === activeId ? "bg-emerald-50" : "hover:bg-slate-50")}>
                <Avatar initials={c.initials} gradient={c.gradient} size={44} online={c.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">{c.name}</p>
                    <span className="shrink-0 text-[11px] text-slate-400">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-500">{c.lastMessage}</p>
                    {c.unread > 0 && <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* chat */}
        <div className={cn("flex flex-col", !active && "hidden md:flex")}>
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 p-3">
                <button onClick={() => setActiveId(null)} className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 md:hidden">
                  <ArrowLeft size={17} />
                </button>
                <Avatar initials={active.initials} gradient={active.gradient} size={40} online={active.online} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{active.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span className={cn("inline-flex items-center gap-0.5", active.role === "driver" ? "text-emerald-600" : "text-sky-600")}>
                      {active.role === "driver" ? <Car size={11} /> : <Users size={11} />} {active.role}
                    </span>
                    {active.online && <><span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500" /> online</>}
                  </p>
                </div>
                <button className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"><Phone size={16} /></button>
                <button className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"><MoreVertical size={16} /></button>
              </div>

              <div className="scroll-thin flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
                {active.messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm", m.from === "me" ? "rounded-br-md bg-emerald-500 text-white" : "rounded-bl-md bg-white text-slate-700")}>
                      <p>{m.text}</p>
                      <p className={cn("mt-0.5 text-[10px]", m.from === "me" ? "text-emerald-50" : "text-slate-400")}>{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                />
                <button onClick={send} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-600">
                  <Send size={17} />
                </button>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center text-slate-400">
              <div>
                <p className="text-sm font-medium">Select a conversation</p>
                <p className="text-xs">Chat with your ride matches here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
