import { AlertCircle, FileText, Paperclip, Send, X } from "lucide-react";
import { ATTACHMENT_ACCEPT, LocalImage, isImageAttachment } from "@/entities/task";
import { UserAvatar } from "@/shared/ui";
import { COMMENT_PRESETS } from "../model/presets";
import type { CommentComposerController } from "../model/useAddTaskComment";

interface CommentComposerProps {
  controller: CommentComposerController;
  /** Имя автора — вошедшего пользователя — для аватара слева. */
  authorName: string;
}

export function CommentComposer({ controller, authorName }: CommentComposerProps) {
  const { text, files, isSending, error, canSend, setText, insertPreset, attachFiles, removeFile, send } = controller;
  const expanded = text !== "" || files.length > 0;

  return (
    <div className="flex gap-2.5">
      <UserAvatar name={authorName} size="sm" className="mt-1" />
      <div className="flex-1 space-y-2 min-w-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать комментарий… (⌘↵ отправить)"
          rows={expanded ? 3 : 2}
          className="w-full text-xs text-slate-700 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50 resize-none placeholder:text-slate-300 transition-colors bg-slate-50 focus:bg-white"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
        />

        {/* Заготовки — как быстрые реакции в Jira */}
        <div className="flex flex-wrap gap-1">
          {COMMENT_PRESETS.map((preset) => (
            <button
              key={preset.text}
              type="button"
              onClick={() => insertPreset(preset)}
              className="px-2 py-0.5 rounded-full border border-slate-200 bg-white text-[11px] text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              {preset.emoji} {preset.text}
            </button>
          ))}
        </div>

        {files.length > 0 && (
          <div className="space-y-1.5">
            {files.map((file, i) =>
              isImageAttachment(file.type) ? (
                <div key={i} className="relative inline-block">
                  <LocalImage file={file} className="rounded-lg border border-slate-200 max-h-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={8} />
                  </button>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
                  <FileText size={11} className="text-slate-400 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 truncate flex-1">{file.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-400 flex-shrink-0">
                    <X size={10} />
                  </button>
                </div>
              ),
            )}
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-1.5 text-[11px] text-red-600">
            <AlertCircle size={11} className="flex-shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-md cursor-pointer transition-colors border border-transparent hover:border-brand-200">
            <Paperclip size={11} />
            Прикрепить
            <input
              type="file"
              multiple
              accept={ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                attachFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <span className="flex-1" />
          {expanded && (
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
            >
              <Send size={10} />
              {isSending ? "Отправка…" : "Отправить"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
