
import type { AZDomain } from "../types";

export interface AZTopic {
  id: string;
  title: string;
  description: string;
  domain: AZDomain;
  questionTopics: string[];
  subtopics: string[];
}

export interface AZDomainInfo {
  id: AZDomain;
  title: string;
  description: string;
  topics: AZTopic[];
}

export const AZ_DOMAINS: AZDomainInfo[] = [
  {
    id: "concepts",
    title: "Describe cloud concepts",
    description:
      "Understand cloud computing, its benefits, and the different cloud models.",
    topics: [
      {
        id: "cloud-computing",
        title: "Cloud computing",
        description: "Learn the fundamentals of cloud services.",
        domain: "concepts",
        questionTopics: ["CapEx vs OpEx", "Shared Responsibility Model", "Cloud Characteristics", "Cloud Models"],
        subtopics: [
          "What cloud computing means",
          "Shared responsibility model",
          "Public, private, and hybrid clouds",
          "Consumption-based pricing",
          "Capital expenditure and operational expenditure",
        ],
      },
      {
        id: "cloud-benefits",
        title: "Benefits of cloud computing",
        description: "Understand why organizations use cloud services.",
        domain: "concepts",
        questionTopics: ["High Availability & SLAs"],
        subtopics: [
          "High availability",
          "Scalability and elasticity",
          "Reliability and predictability",
          "Security and governance",
          "Manageability",
        ],
      },
    ],
  },
  {
    id: "architecture",
    title: "Describe Azure architecture and services",
    description:
      "Explore Azure infrastructure, compute, networking, and storage services.",
    topics: [
      {
        id: "azure-architecture",
        title: "Azure architectural components",
        description: "Understand how Azure resources are organized.",
        domain: "architecture",
        questionTopics: ["Core Architectural Components"],
        subtopics: [
          "Regions and region pairs",
          "Availability zones",
          "Resources and resource groups",
          "Subscriptions",
          "Management groups",
        ],
      },
      {
        id: "azure-compute",
        title: "Azure compute services",
        description: "Choose the right Azure service for different workloads.",
        domain: "architecture",
        questionTopics: ["Azure Compute Services"],
        subtopics: [
          "Azure Virtual Machines",
          "Containers",
          "Azure Functions",
          "Azure App Service",
          "Virtual machine scale sets",
        ],
      },
      {
        id: "azure-networking",
        title: "Azure networking services",
        description: "Learn how Azure resources connect securely.",
        domain: "architecture",
        questionTopics: ["Azure Networking Services"],
        subtopics: [
          "Virtual networks",
          "Subnets",
          "VPN Gateway",
          "Azure ExpressRoute",
          "Azure DNS",
          "Network security groups",
        ],
      },
      {
        id: "azure-storage",
        title: "Azure storage services",
        description: "Explore storage options and redundancy.",
        domain: "architecture",
        questionTopics: ["Azure Storage Services"],
        subtopics: [
          "Blob Storage",
          "Azure Files",
          "Queue Storage",
          "Table Storage",
          "Storage redundancy",
          "Storage access tiers",
        ],
      },
    ],
  },
  {
    id: "management",
    title: "Describe Azure management and governance",
    description:
      "Learn to manage costs, control access, monitor resources, and govern Azure.",
    topics: [
      {
        id: "azure-costs",
        title: "Cost management",
        description: "Understand how to estimate and manage Azure spending.",
        domain: "management",
        questionTopics: ["Cost Management & Planning"],
        subtopics: [
          "Factors affecting Azure costs",
          "Pricing calculator",
          "Total Cost of Ownership calculator",
          "Cost Management",
          "Azure service-level agreements",
        ],
      },
      {
        id: "azure-governance",
        title: "Governance and compliance",
        description: "Apply rules and organize Azure resources.",
        domain: "management",
        questionTopics: ["Governance and Compliance", "Security and Identity"],
        subtopics: [
          "Microsoft Purview",
          "Azure Policy",
          "Resource locks",
          "Tags",
          "Microsoft Entra ID",
          "Role-based access control",
        ],
      },
      {
        id: "azure-monitoring",
        title: "Management and monitoring tools",
        description: "Understand the tools used to manage Azure environments.",
        domain: "management",
        questionTopics: ["Monitoring and Reporting", "Infrastructure as Code"],
        subtopics: [
          "Azure portal",
          "Azure Cloud Shell",
          "Azure CLI and PowerShell",
          "Azure Arc",
          "Azure Monitor",
          "Azure Service Health",
          "Microsoft Defender for Cloud",
        ],
      },
    ],
  },
];
