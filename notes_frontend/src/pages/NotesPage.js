import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { createId, filterNotes, getTitleFromText, sortNotes } from "../utils/notes";

/**
 * @typedef {{id: string, text: string, createdAt: number, updatedAt: number}} Note
 */

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function clampText(text, maxLen) {
  const t = (text || "").trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

// PUBLIC_INTERFACE
export default function NotesPage() {
  /** @type {[Note[], Function]} */
  const [notes, setNotes] = useLocalStorage("notes", []);
  const [activeId, setActiveId] = useLocalStorage("activeId", null);

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const editorRef = useRef(null);

  const activeNote = useMemo(() => notes.find((n) => n.id === activeId) || null, [notes, activeId]);

  const visibleNotes = useMemo(() => {
    return filterNotes(sortNotes(notes), query);
  }, [notes, query]);

  // Keep editor draft in sync with selected note.
  useEffect(() => {
    setDraft(activeNote?.text || "");
  }, [activeNote?.id]); // only when switching notes

  // Focus editor when selecting/creating a note.
  useEffect(() => {
    if (!activeId) return;
    const t = setTimeout(() => editorRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [activeId]);

  function createNewNote() {
    const now = Date.now();
    const newNote = {
      id: createId(),
      text: "",
      createdAt: now,
      updatedAt: now
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
    setQuery("");
  }

  function saveDraftToActiveNote(nextText) {
    if (!activeId) return;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== activeId) return n;
        return {
          ...n,
          text: nextText,
          updatedAt: Date.now()
        };
      })
    );
  }

  function deleteActiveNote() {
    if (!activeNote) return;

    const ok = window.confirm("Delete this note? This cannot be undone.");
    if (!ok) return;

    setNotes((prev) => prev.filter((n) => n.id !== activeNote.id));

    // Choose next active note (newest after delete)
    const remaining = visibleNotes.filter((n) => n.id !== activeNote.id);
    setActiveId(remaining[0]?.id || null);
    setDraft("");
  }

  function clearAllNotes() {
    const ok = window.confirm("Clear ALL notes? This cannot be undone.");
    if (!ok) return;
    setNotes([]);
    setActiveId(null);
    setDraft("");
    setQuery("");
  }

  function onEditorChange(e) {
    const nextText = e.target.value;
    setDraft(nextText);
    saveDraftToActiveNote(nextText);
  }

  return (
    <main className="notesApp" aria-label="Retro Notes App">
      <header className="notesHeader">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            RN
          </div>
          <div className="brandText">
            <h1 className="brandTitle">Retro Notes</h1>
            <p className="brandTag">Create • Edit • Delete • Saved locally</p>
          </div>
        </div>

        <div className="headerActions">
          <button type="button" className="btn btnPrimary" onClick={createNewNote}>
            + New Note
          </button>
          <button
            type="button"
            className="btn btnGhost"
            onClick={clearAllNotes}
            disabled={notes.length === 0}
            aria-disabled={notes.length === 0}
          >
            Clear All
          </button>
        </div>
      </header>

      <section className="notesLayout">
        <aside className="sidebar" aria-label="Notes list">
          <div className="sidebarTop">
            <label className="searchLabel" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="searchInput"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find text in notes…"
            />
          </div>

          <div className="notesList" role="list" aria-label="Notes">
            {visibleNotes.length === 0 ? (
              <div className="emptyState" role="note" aria-label="No notes">
                <p className="emptyTitle">{notes.length === 0 ? "No notes yet." : "No matches."}</p>
                <p className="emptyText">
                  {notes.length === 0 ? "Create your first note to get started." : "Try a different search."}
                </p>
                {notes.length === 0 ? (
                  <button type="button" className="btn btnPrimary" onClick={createNewNote}>
                    + New Note
                  </button>
                ) : null}
              </div>
            ) : (
              visibleNotes.map((note) => {
                const isActive = note.id === activeId;
                const title = getTitleFromText(note.text);
                const preview = clampText(note.text.replace(/\n+/g, " "), 96);

                return (
                  <button
                    key={note.id}
                    type="button"
                    className={`noteCard ${isActive ? "isActive" : ""}`}
                    onClick={() => setActiveId(note.id)}
                    role="listitem"
                    aria-current={isActive ? "true" : "false"}
                  >
                    <div className="noteCardTop">
                      <div className="noteTitle">{title}</div>
                      <div className="noteMeta">{formatTimestamp(note.updatedAt)}</div>
                    </div>
                    <div className="notePreview">{preview || "…"}</div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="editorPane" aria-label="Editor">
          {!activeNote ? (
            <div className="editorEmpty" role="note">
              <h2 className="editorEmptyTitle">Select a note</h2>
              <p className="editorEmptyText">Or create a new one to start typing.</p>
              <button type="button" className="btn btnPrimary" onClick={createNewNote}>
                + New Note
              </button>
            </div>
          ) : (
            <>
              <div className="editorTopBar">
                <div className="editorInfo">
                  <div className="editorTitle">{getTitleFromText(draft)}</div>
                  <div className="editorSub">
                    <span>Created: {formatTimestamp(activeNote.createdAt)}</span>
                    <span className="dot" aria-hidden="true">
                      •
                    </span>
                    <span>Updated: {formatTimestamp(activeNote.updatedAt)}</span>
                  </div>
                </div>

                <div className="editorActions">
                  <button type="button" className="btn btnDanger" onClick={deleteActiveNote}>
                    Delete
                  </button>
                </div>
              </div>

              <label className="srOnly" htmlFor="editor">
                Note text
              </label>
              <textarea
                id="editor"
                ref={editorRef}
                className="editor"
                value={draft}
                onChange={onEditorChange}
                placeholder="Type your note here…"
                rows={14}
              />

              <div className="footerHint" aria-label="Hint">
                Notes are saved automatically to this browser (localStorage).
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
