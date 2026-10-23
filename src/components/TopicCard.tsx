
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Database,
  Layers3,
  Network,
  ShieldCheck,
  Wallet,
  Activity,
} from "lucide-react";

import type { AZTopic } from "../data/topics";

interface TopicCardProps {
  topic: AZTopic;
  onSelect: (topic: AZTopic) => void;
}

const topicIcons: Record<string, typeof Cloud> = {
  "cloud-computing": Cloud,
  "cloud-benefits": CheckCircle2,
  "azure-architecture": Layers3,
  "azure-compute": Activity,
  "azure-networking": Network,
  "azure-storage": Database,
  "azure-costs": Wallet,
  "azure-governance": ShieldCheck,
  "azure-monitoring": BookOpen,
};

const domainStyles = {
  concepts: {
    icon: "bg-blue-100 text-blue-700",
    label: "text-blue-700 bg-blue-50",
    progress: "bg-blue-600",
  },
  architecture: {
    icon: "bg-cyan-100 text-cyan-700",
    label: "text-cyan-800 bg-cyan-50",
    progress: "bg-cyan-600",
  },
  management: {
    icon: "bg-emerald-100 text-emerald-700",
    label: "text-emerald-800 bg-emerald-50",
    progress: "bg-emerald-600",
  },
};

export default function TopicCard({
  topic,
  onSelect,
}: TopicCardProps) {
  const Icon = topicIcons[topic.id] ?? BookOpen;
  const style = domainStyles[topic.domain];

  return (
    <button
      type="button"
      onClick={() => onSelect(topic)}
      className="group flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={23} strokeWidth={2} />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${style.label}`}
        >
          {topic.subtopics.length} subtopics
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
          {topic.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {topic.description}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-700">
            Start learning
          </span>

          <ArrowRight
            size={19}
            className="text-blue-600 transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </button>
  );
}
