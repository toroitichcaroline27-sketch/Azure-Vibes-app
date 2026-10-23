
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";

import TopicCard from "../components/TopicCard";
import { AZ_DOMAINS, type AZTopic } from "../data/topics";

interface TopicSelectionPageProps {
  onSelectTopic: (topic: AZTopic) => void;
  onBack?: () => void;
}

export default function TopicSelectionPage({
  onSelectTopic,
  onBack,
}: TopicSelectionPageProps) {
  const [search, setSearch] = useState("");

  const filteredDomains = useMemo(() => {
    const query = search.trim().toLowerCase();

    return AZ_DOMAINS.map((domain) => ({
      ...domain,
      topics: domain.topics.filter((topic) => {
        if (!query) return true;

        return [
          topic.title,
          topic.description,
          ...topic.subtopics,
          domain.title,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      }),
    })).filter((domain) => domain.topics.length > 0);
  }, [search]);

  const totalTopics = AZ_DOMAINS.reduce(
    (total, domain) => total + domain.topics.length,
    0,
  );

  const visibleTopics = filteredDomains.reduce(
    (total, domain) => total + domain.topics.length,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>
        )}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-800">
              <BookOpen size={16} />
              AZ-900 Learning Path
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Choose what to study
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-600">
              Explore Azure fundamentals one topic at a time. Practise
              questions, understand your mistakes, and build confidence.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-900">
                {totalTopics}
              </p>
              <p className="text-xs font-medium text-slate-500">
                Study topics
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-2xl font-extrabold text-blue-700">
                {AZ_DOMAINS.length}
              </p>
              <p className="text-xs font-medium text-slate-500">
                Exam domains
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-9">
        <label
          htmlFor="topic-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Find a topic
        </label>

        <div className="relative max-w-xl">
          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="topic-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cloud, networking, storage..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <p className="mt-2 text-sm text-slate-500" aria-live="polite">
          Showing {visibleTopics} of {totalTopics} topics
        </p>
      </div>

      <div className="space-y-10">
        {filteredDomains.map((domain) => (
          <section key={domain.id}>
            <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
                  Exam domain
                </p>

                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {domain.title}
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {domain.description}
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {domain.topics.length}{" "}
                {domain.topics.length === 1 ? "topic" : "topics"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {domain.topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onSelect={onSelectTopic}
                />
              ))}
            </div>
          </section>
        ))}

        {filteredDomains.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Search
              size={32}
              className="mx-auto mb-3 text-slate-400"
            />

            <h2 className="text-lg font-bold text-slate-900">
              No topics found
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Try another search term.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
