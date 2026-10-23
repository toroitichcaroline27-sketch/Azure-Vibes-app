import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  FileText, 
  Search, 
  Download, 
  Star, 
  Trash2, 
  Sparkles, 
  Volume2, 
  Clock, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  FileDown
} from 'lucide-react';
import { StudyNote } from '../types';
import { exportNoteToWord, exportAllNotesToWord } from '../utils/wordExport';
import { fireCelebrationConfetti } from '../utils/confetti';

export const AudioTranscriberView: React.FC = () => {
  const [transcripts, setTranscripts] = useState<StudyNote[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [transcribing, setTranscribing] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);

  // Live recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Custom metadata input
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<string>('Domain 1: Cloud Concepts');

  useEffect(() => {
    fetchTranscripts();
  }, [searchQuery]);

  const fetchTranscripts = async () => {
    setLoading(true);
    try {
      const url = searchQuery ? `/api/transcripts?q=${encodeURIComponent(searchQuery)}` : '/api/transcripts';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.transcripts) {
        setTranscripts(data.transcripts);
        if (!selectedNote && data.transcripts.length > 0) {
          setSelectedNote(data.transcripts[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching transcripts:', err);
    } finally {
      setLoading(false);
    }
  };

  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioBlob(audioBlob, 'live-mic-recording.webm');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setStatusMessage({ type: 'error', text: 'Microphone access unavailable or denied.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processAudioBlob(file, file.name);
    e.target.value = '';
  };

  const processAudioBlob = async (blob: Blob, fileName: string) => {
    setTranscribing(true);
    setStatusMessage(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const mimeType = blob.type || 'audio/webm';

        const res = await fetch('/api/transcripts/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64data,
            mimeType,
            title: noteTitle || `AZ-900 Voice Note (${new Date().toLocaleDateString()})`,
            category: noteCategory
          })
        });

        const data = await res.json();
        if (data.success && data.note) {
          setTranscripts(prev => [data.note, ...prev]);
          setSelectedNote(data.note);
          setNoteTitle('');
          setStatusMessage({ type: 'success', text: 'Audio transcribed and indexed successfully!' });
          fireCelebrationConfetti();
        } else {
          setStatusMessage({ type: 'error', text: data.error || 'Transcription failed. Please check audio.' });
        }
        setTranscribing(false);
      };
    } catch (err: any) {
      console.error('Error processing audio:', err);
      setStatusMessage({ type: 'error', text: 'Failed to process audio.' });
      setTranscribing(false);
    }
  };

  const handleToggleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/transcripts/${id}/star`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTranscripts(prev => prev.map(n => n.id === id ? { ...n, isStarred: data.note.isStarred } : n));
        if (selectedNote?.id === id) {
          setSelectedNote(prev => prev ? { ...prev, isStarred: data.note.isStarred } : null);
        }
      }
    } catch (err) {
      console.error('Error starring note:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/transcripts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTranscripts(prev => prev.filter(n => n.id !== id));
        if (selectedNote?.id === id) {
          setSelectedNote(transcripts.find(n => n.id !== id) || null);
        }
        setStatusMessage({ type: 'success', text: 'Transcript removed.' });
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Banner & Audio Action Station */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Mic className="w-3.5 h-3.5 text-emerald-700" />
              Groq Whisper Transcriber & Knowledge Base
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Transcribe Azure Study Lectures & Export to Word (.doc)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Record voice notes or upload lecture files. Groq Whisper transcribes speech into text in milliseconds, while AI structures key Azure terms and exam tips into a searchable knowledge base.
            </p>
          </div>

          {/* Export All to Word CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportAllNotesToWord(transcripts)}
              disabled={transcripts.length === 0}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              title="Download entire searchable database as a Microsoft Word document"
            >
              <FileDown className="w-4 h-4" />
              <span>Export All to Word (.doc)</span>
            </button>
          </div>
        </div>

        {/* Audio Recording & Upload Box */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Recording Panel */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-700" />
                Live Microphone Recording
              </span>
              {isRecording && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  REC {formatSeconds(recordSeconds)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600">
              Speak your study notes or questions out loud. Groq Whisper will transcribe and index them.
            </p>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  disabled={transcribing}
                  onClick={startRecording}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Voice Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-rose-500 flex items-center gap-2 cursor-pointer transition-all animate-pulse"
                >
                  <Square className="w-4 h-4 fill-rose-400" />
                  <span>Stop & Transcribe with Whisper</span>
                </button>
              )}
            </div>
          </div>

          {/* Upload Audio File Panel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-700" />
                Upload Audio File (.mp3, .wav, .m4a, .webm)
              </span>
              <span className="text-[11px] text-slate-500">Max 25MB</span>
            </div>

            <p className="text-xs text-slate-600">
              Upload study podcasts, training webinars, or recorded Azure lecture clips.
            </p>

            <label className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs cursor-pointer transition-all w-fit shadow-xs">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Select Audio File</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={transcribing}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Transcribing loader */}
        {transcribing && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-pulse">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <div className="text-xs text-emerald-950 font-medium">
              <strong>Groq Whisper</strong> is transcribing audio and <strong>Groq AI</strong> is extracting high-yield AZ-900 exam tips...
            </div>
          </div>
        )}
      </div>

      {/* Searchable Database Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & List */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcripts, terms, topics..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="text-xs font-bold text-slate-600 flex items-center justify-between px-1">
            <span>Database Records ({transcripts.length})</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {transcripts.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {note.title}
                    </span>
                    <button
                      onClick={(e) => handleToggleStar(note.id, e)}
                      className="text-slate-400 hover:text-amber-500 cursor-pointer"
                    >
                      <Star className={`w-3.5 h-3.5 ${note.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {note.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {note.category}
                    </span>
                    <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {transcripts.length === 0 && !loading && (
              <div className="text-center py-10 text-xs text-slate-500">
                No matching audio transcripts found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Transcript Detail & Word Export */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          {selectedNote ? (
            <>
              {/* Header and Word Export button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {selectedNote.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(selectedNote.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedNote.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportNoteToWord(selectedNote)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export to Word (.doc)</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(selectedNote.id, e)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border border-slate-200 cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Concept Summary */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Executive Summary:
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {selectedNote.summary}
                </p>
              </div>

              {/* Key Azure Terms */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  Key Azure Architecture Terms:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNote.keyTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-900"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* High-Yield AZ-900 Exam Tips */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  High-Yield AZ-900 Exam Tips:
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800">
                  {selectedNote.examTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verbatim Transcript */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Verbatim Audio Transcript:</span>
                  <span className="text-[11px] text-slate-500 font-normal">Indexed in full-text search</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {selectedNote.transcript}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-sm">
              Select or record a transcript to view details and export to Word.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
