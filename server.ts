import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with server-side API Key & User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File-based persistent store
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

interface Question {
  id: string;
  domain: 'concepts' | 'architecture' | 'management';
  domainTitle: string;
  topic: string;
  subtopic: string;
  difficulty: 'beginner' | 'intermediate' | 'exam-ready';
  question: string;
  scenario?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  whyRight: string;
  whyWrong: { optionId: string; optionText: string; reason: string }[];
  analogy: string;
  officialLearnRef: string;
}

interface Flashcard {
  id: string;
  domain: 'concepts' | 'architecture' | 'management';
  term: string;
  category: string;
  summary: string;
  keyTakeaway: string;
  analogy: string;
  commonExamTrap: string;
  status: 'unseen' | 'needs_practice' | 'mastered';
  lastReviewed: number | null;
}

interface QuizAttempt {
  id: string;
  timestamp: number;
  domainFilter: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

interface StudyPlan {
  targetExamDate: string;
  dailyHours: number;
  experienceLevel: 'beginner' | 'intermediate' | 'cram';
  planGeneratedAt: number;
  days: {
    dayNumber: number;
    title: string;
    domain: 'concepts' | 'architecture' | 'management';
    estimatedHours: number;
    tasks: {
      id: string;
      text: string;
      completed: boolean;
      type: 'read' | 'quiz' | 'flashcard' | 'lab';
    }[];
  }[];
}

interface StudyNote {
  id: string;
  title: string;
  category: string;
  timestamp: number;
  audioFileName?: string;
  durationSeconds?: number;
  transcript: string;
  summary: string;
  keyTerms: string[];
  examTips: string[];
  isStarred: boolean;
}

interface DatabaseSchema {
  questions: Question[];
  flashcards: Flashcard[];
  attempts: QuizAttempt[];
  studyPlan: StudyPlan | null;
  transcripts: StudyNote[];
  userStats: {
    streakDays: number;
    lastActiveDate: string;
    xp: number;
    unlockedBadges: { id: string; name: string; description: string; icon: string; unlockedAt: number }[];
  };
}

// Initial AZ-900 Curated Question Bank (aligned to official Microsoft Learn objectives)
const SEED_QUESTIONS: Question[] = [
  // --- DOMAIN 1: CLOUD CONCEPTS (25-30%) ---
  {
    id: 'az-cc-001',
    domain: 'concepts',
    domainTitle: 'Describe Cloud Concepts',
    topic: 'CapEx vs OpEx',
    subtopic: 'Cloud Economics',
    difficulty: 'beginner',
    question: 'A startup wants to launch a new web service with minimal upfront financial commitment and variable monthly spending based on actual customer traffic. Which expenditure model does this describe?',
    scenario: 'Finance leaders need to decide whether to purchase physical Dell server racks or deploy workloads to Azure Virtual Machines.',
    options: [
      { id: 'opt-a', text: 'Operational Expenditure (OpEx)', isCorrect: true, explanation: 'OpEx represents ongoing operational expenses with no upfront server purchase, billed based on usage.' },
      { id: 'opt-b', text: 'Capital Expenditure (CapEx)', isCorrect: false, explanation: 'CapEx requires massive upfront capital to purchase physical data centers and hardware.' },
      { id: 'opt-c', text: 'Fixed-Price Depreciation', isCorrect: false, explanation: 'Depreciation is an accounting treatment for physical CapEx assets over multiple years.' },
      { id: 'opt-d', text: 'Reserved Asset Procurement', isCorrect: false, explanation: 'Procurement is the acquisition process, not the operational cloud consumption financial model.' }
    ],
    whyRight: 'Operational Expenditure (OpEx) allows organizations to pay only for current services and cloud compute consumed without upfront capital investment. Cloud providers handle physical infrastructure maintenance.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Capital Expenditure (CapEx)', reason: 'CapEx requires spending upfront on physical infrastructure (buildings, cooling, servers) and deducting the cost over its lifecycle.' },
      { optionId: 'opt-c', optionText: 'Fixed-Price Depreciation', reason: 'Depreciation spreads physical capital costs across taxes; it is the hallmark of on-premise hardware, not pay-as-you-go cloud agility.' },
      { optionId: 'opt-d', optionText: 'Reserved Asset Procurement', reason: 'Procurement refers to purchasing logistics rather than the economic expenditure classification in AZ-900.' }
    ],
    analogy: 'Renting an Uber or hailing a ride when you need to travel vs. buying a vehicle outright, paying for a garage, insurance, and routine engine maintenance before driving a single mile.',
    officialLearnRef: 'Microsoft Learn: Cloud Concepts - Describe benefits of cloud computing & financial models'
  },
  {
    id: 'az-cc-002',
    domain: 'concepts',
    domainTitle: 'Describe Cloud Concepts',
    topic: 'Shared Responsibility Model',
    subtopic: 'Cloud Service Models (IaaS, PaaS, SaaS)',
    difficulty: 'intermediate',
    question: 'In an Infrastructure as a Service (IaaS) deployment such as Azure Virtual Machines, which component remains exclusively the customer\'s responsibility to manage and secure?',
    scenario: 'A company deploys Linux Ubuntu VMs on Azure to host a custom accounting service.',
    options: [
      { id: 'opt-a', text: 'Operating System patching and configuration', isCorrect: true, explanation: 'In IaaS, Microsoft manages physical hosts and hypervisors, but the tenant must manage and patch the guest OS.' },
      { id: 'opt-b', text: 'Physical server hardware replacement', isCorrect: false, explanation: 'Microsoft always owns and replaces physical data center hardware across all cloud models.' },
      { id: 'opt-c', text: 'Data center building physical security and biometric locks', isCorrect: false, explanation: 'Physical building security is 100% Microsoft\'s duty in any public cloud model.' },
      { id: 'opt-d', text: 'Network virtualization router firmware updates', isCorrect: false, explanation: 'Azure manages the underlying physical infrastructure and hypervisor routing fabric.' }
    ],
    whyRight: 'In IaaS, the shared responsibility boundary gives the customer direct control over the virtual machine\'s Operating System, installed software, runtime updates, and data security.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Physical server hardware replacement', reason: 'Microsoft Azure engineers replace faulty RAM sticks, motherboard parts, and physical hard drives in their datacenters.' },
      { optionId: 'opt-c', optionText: 'Physical security', reason: 'Azure datacenters feature perimeter fencing, security guards, biometric checkpoints, and cameras managed entirely by Microsoft.' },
      { optionId: 'opt-d', optionText: 'Network virtualization firmware', reason: 'Underlying hardware routers, SDN controllers, and hypervisors are strictly Microsoft managed.' }
    ],
    analogy: 'Renting an unfurnished apartment (IaaS): the landlord fixes the building foundation and external walls, but you are responsible for locking your door, furnishing the rooms, and keeping your appliances clean.',
    officialLearnRef: 'Microsoft Learn: Describe the shared responsibility model'
  },
  {
    id: 'az-cc-003',
    domain: 'concepts',
    domainTitle: 'Describe Cloud Concepts',
    topic: 'Cloud Characteristics',
    subtopic: 'Elasticity vs Scalability',
    difficulty: 'intermediate',
    question: 'During a nationwide flash-sale promotion, an e-commerce platform automatically increases its VM capacity by 400% in response to CPU surges, and then shrinks back down to baseline overnight when shoppers leave. Which cloud benefit is this primarily demonstrating?',
    scenario: 'A retailer anticipates huge traffic on Black Friday and wants zero manual sysadmin interventions.',
    options: [
      { id: 'opt-a', text: 'Elasticity', isCorrect: true, explanation: 'Elasticity is the dynamic ability to automatically scale resources up and down based on immediate spikes in demand.' },
      { id: 'opt-b', text: 'Geo-Distribution', isCorrect: false, explanation: 'Geo-distribution places copies of data or services across global geographic regions to reduce latency.' },
      { id: 'opt-c', text: 'Fault Tolerance', isCorrect: false, explanation: 'Fault tolerance ensures zero interrupted service if a single component fails.' },
      { id: 'opt-d', text: 'High Availability', isCorrect: false, explanation: 'High availability guarantees a high percentage of uptime (e.g. 99.99%) without focusing on automatic budget contraction.' }
    ],
    whyRight: 'Elasticity refers to the rapid, automated allocation and de-allocation of resources in exact proportion to fluctuating demand, preventing over-provisioning and saving money.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Geo-Distribution', reason: 'Geo-distribution is about physical locations around the globe, not dynamically scaling count or computing power based on load.' },
      { optionId: 'opt-c', optionText: 'Fault Tolerance', reason: 'Fault tolerance means zero interruption during component failure (like redundant power supplies), not scaling up/down.' },
      { optionId: 'opt-d', optionText: 'High Availability', reason: 'High availability keeps systems running continuously with minimal downtime, whereas elasticity specifically expands and contracts on demand.' }
    ],
    analogy: 'M-Pesa or ride-hailing services onboarding extra dispatch servers in seconds during rush hour or payday, then shutting them down at 3 AM to avoid paying idle costs.',
    officialLearnRef: 'Microsoft Learn: Describe the benefits of cloud computing'
  },
  {
    id: 'az-cc-004',
    domain: 'concepts',
    domainTitle: 'Describe Cloud Concepts',
    topic: 'High Availability & SLAs',
    subtopic: 'Service Level Agreements',
    difficulty: 'intermediate',
    question: 'What is the minimum SLA percentage guaranteed by Microsoft for Azure Virtual Machines when deploying two or more instances across separate Availability Zones in the same Azure region?',
    scenario: 'An enterprise architect is designing an ERP system that must achieve maximum uptime within a single region.',
    options: [
      { id: 'opt-a', text: '99.99%', isCorrect: true, explanation: 'Deploying across multiple Availability Zones in the same region provides Azure\'s highest single-region SLA of 99.99% (four nines).' },
      { id: 'opt-b', text: '99.95%', isCorrect: false, explanation: '99.95% is the SLA for VMs in an Availability Set (fault and update domains within one datacenter).' },
      { id: 'opt-c', text: '99.9%', isCorrect: false, explanation: '99.9% is typically associated with a single VM with Premium SSD OS and data disks.' },
      { id: 'opt-d', text: '100.0%', isCorrect: false, explanation: 'No major cloud vendor guarantees 100% SLA because scheduled maintenance and unexpected catastrophes exist.' }
    ],
    whyRight: 'Microsoft provides a 99.99% Virtual Machine connectivity uptime SLA when deploying at least two instances across two or more Availability Zones in the same Azure region.',
    whyWrong: [
      { optionId: 'opt-b', optionText: '99.95%', reason: '99.95% applies to instances placed in an Availability Set (protecting against rack or switch failures within one facility).' },
      { optionId: 'opt-c', optionText: '99.9%', reason: '99.9% is the standard SLA for a single VM using Premium SSD managed disks.' },
      { optionId: 'opt-d', optionText: '100.0%', reason: '100% SLA does not exist in commercial cloud infrastructure; even four nines permits ~52 minutes of downtime per year.' }
    ],
    analogy: 'Booking backup hotel rooms in two completely separate neighborhood hotels rather than having two rooms on the same floor of one building during a power outage.',
    officialLearnRef: 'Microsoft Learn: Describe Service Level Agreements (SLAs)'
  },
  {
    id: 'az-cc-005',
    domain: 'concepts',
    domainTitle: 'Describe Cloud Concepts',
    topic: 'Cloud Models',
    subtopic: 'Public, Private, and Hybrid Cloud',
    difficulty: 'beginner',
    question: 'A financial institution hosts sensitive legacy trading algorithms in its on-premises VMware data center while deploying its public customer portal and analytics engine to Microsoft Azure. Which cloud deployment model is being used?',
    scenario: 'Compliance regulations mandate on-prem storage of specific financial data, while the marketing team demands cloud scale.',
    options: [
      { id: 'opt-a', text: 'Hybrid Cloud', isCorrect: true, explanation: 'Hybrid cloud combines private on-premises infrastructure with public cloud platforms, allowing data and apps to be shared.' },
      { id: 'opt-b', text: 'Public Cloud', isCorrect: false, explanation: 'Public cloud relies exclusively on third-party public cloud providers with no on-premises infrastructure.' },
      { id: 'opt-c', text: 'Private Cloud', isCorrect: false, explanation: 'Private cloud is dedicated solely to one organization, usually in a private data center.' },
      { id: 'opt-d', text: 'Multi-Tenant Microcloud', isCorrect: false, explanation: 'Multi-tenant describes shared infrastructure architecture, not a deployment model.' }
    ],
    whyRight: 'Hybrid cloud bridges on-premises private infrastructure (or private clouds) with public cloud infrastructure (like Azure), enabling workload flexibility and regulatory compliance.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Public Cloud', reason: 'Public cloud means 100% of the workloads live on Azure or external providers with no internal private data centers.' },
      { optionId: 'opt-c', optionText: 'Private Cloud', reason: 'Private cloud does not utilize public cloud resources; all hardware is dedicated exclusively to one entity.' },
      { optionId: 'opt-d', optionText: 'Multi-Tenant Microcloud', reason: 'Not an official cloud deployment model defined in the AZ-900 Microsoft curriculum.' }
    ],
    analogy: 'Owning a private solar-powered battery bank in your basement for emergency essentials while keeping the house connected to the city power grid for regular high-draw electricity.',
    officialLearnRef: 'Microsoft Learn: Describe cloud models'
  },

  // --- DOMAIN 2: AZURE ARCHITECTURE & SERVICES (35-40%) ---
  {
    id: 'az-as-001',
    domain: 'architecture',
    domainTitle: 'Describe Azure Architecture & Services',
    topic: 'Core Architectural Components',
    subtopic: 'Availability Zones',
    difficulty: 'intermediate',
    question: 'What is an Azure Availability Zone physically composed of?',
    scenario: 'You are reviewing Azure datacenter architecture for an insurance customer requiring fault isolation.',
    options: [
      { id: 'opt-a', text: 'One or more physically separate datacenters equipped with independent power, cooling, and networking within an Azure region', isCorrect: true, explanation: 'Availability Zones are unique physical locations with isolated power, cooling, and network infrastructure.' },
      { id: 'opt-b', text: 'A single rack inside a shared datacenter with dual power supplies', isCorrect: false, explanation: 'A rack within a datacenter describes a Fault Domain in an Availability Set, not an entire Availability Zone.' },
      { id: 'opt-c', text: 'Two Azure regions paired at least 300 miles apart', isCorrect: false, explanation: 'Two regions paired at least 300 miles apart defines an Azure Region Pair.' },
      { id: 'opt-d', text: 'A virtual subnet spanned across multiple global geographical regions', isCorrect: false, explanation: 'Availability Zones are strictly local to a single region, not cross-continental subnets.' }
    ],
    whyRight: 'Azure Availability Zones are physically separated locations within an Azure region. Each zone has one or more datacenters equipped with independent power, cooling, and networking infrastructure.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'A single rack inside a datacenter', reason: 'This describes an Availability Set Fault Domain. If the building floods, the whole datacenter goes down.' },
      { optionId: 'opt-c', optionText: 'Two regions paired 300 miles apart', reason: 'This describes an Azure Region Pair (e.g. East US and West US) for geo-redundancy, not Availability Zones.' },
      { optionId: 'opt-d', optionText: 'A virtual subnet across regions', reason: 'Virtual subnets are networking constructs confined to a VNet and cannot span multiple Azure regions.' }
    ],
    analogy: 'Three separate electrical power substations in three different parts of the city connected by high-speed fiber; if lightning knocks out substation 1, substations 2 and 3 stay fully functional.',
    officialLearnRef: 'Microsoft Learn: Describe Azure regions, region pairs, and availability zones'
  },
  {
    id: 'az-as-002',
    domain: 'architecture',
    domainTitle: 'Describe Azure Architecture & Services',
    topic: 'Core Architectural Components',
    subtopic: 'Azure Region Pairs',
    difficulty: 'intermediate',
    question: 'Why does Microsoft pair Azure regions situated at least 300 miles apart within the same geography?',
    scenario: 'During regional disaster recovery planning, the team evaluates how Azure orchestrates updates and handles natural catastrophes.',
    options: [
      { id: 'opt-a', text: 'To ensure planned platform updates are rolled out to only one paired region at a time and prioritize recovery in major disasters', isCorrect: true, explanation: 'Region pairs guarantee serialized updates and prioritized recovery during regional disasters.' },
      { id: 'opt-b', text: 'To eliminate latency between virtual machines across different continents', isCorrect: false, explanation: 'Physical distance increases latency; speed of light prevents zero latency.' },
      { id: 'opt-c', text: 'To share the same physical power generator across both regions', isCorrect: false, explanation: 'Region pairs are intentionally independent and hundreds of miles apart to prevent shared power failures.' },
      { id: 'opt-d', text: 'To force customers to pay double for all compute resources automatically', isCorrect: false, explanation: 'Pairing is an architecture resilience capability, not a forced billing double.' }
    ],
    whyRight: 'Each Azure region is paired with another within the same geography (at least 300 miles apart). Updates are rolled out sequentially so downtime does not affect both, and recovery is prioritized if a disaster strikes.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Eliminate latency across continents', reason: 'Being 300+ miles apart adds ~5-15ms latency; it does not eliminate latency.' },
      { optionId: 'opt-c', optionText: 'Share physical power generator', reason: 'Shared physical utilities would defeat the purpose of disaster isolation.' },
      { optionId: 'opt-d', optionText: 'Force double payment', reason: 'Pairing is an architecture design; cross-region replication is optional and configurable (e.g. GRS storage).' }
    ],
    analogy: 'Two branch offices of a bank in Nairobi and Mombasa: an earthquake in one coastal city won\'t knock out the inland office, and updates are installed on Monday in branch A and Tuesday in branch B.',
    officialLearnRef: 'Microsoft Learn: Describe Azure regions and region pairs'
  },
  {
    id: 'az-as-003',
    domain: 'architecture',
    domainTitle: 'Describe Azure Architecture & Services',
    topic: 'Azure Compute Services',
    subtopic: 'Containers vs Virtual Machines',
    difficulty: 'intermediate',
    question: 'A development team needs to deploy lightweight microservices with rapid startup times that share the host operating system kernel without the overhead of booting a full guest OS for each instance. Which service should they choose?',
    scenario: 'The dev team is breaking up a monolithic app into modern microservices.',
    options: [
      { id: 'opt-a', text: 'Azure Container Instances (ACI) or Azure Kubernetes Service (AKS)', isCorrect: true, explanation: 'Containers package application code and dependencies while sharing the host OS kernel for fast, lightweight execution.' },
      { id: 'opt-b', text: 'Azure Virtual Machines', isCorrect: false, explanation: 'VMs include an entire guest OS image, kernel, and virtualized hardware overhead.' },
      { id: 'opt-c', text: 'Azure Dedicated Host', isCorrect: false, explanation: 'Dedicated hosts provide physical physical servers to host standard VMs.' },
      { id: 'opt-d', text: 'Azure Virtual Desktop (AVD)', isCorrect: false, explanation: 'AVD provides cloud-hosted Windows 10/11 desktop environments for end users.' }
    ],
    whyRight: 'Containers virtualize the operating system rather than the underlying hardware. They start in seconds, require significantly less storage and memory than full VMs, and are orchestrated via ACI or AKS.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Azure Virtual Machines', reason: 'Virtual Machines virtualize hardware and require full guest operating systems, taking minutes to boot and consuming heavy RAM/disk.' },
      { optionId: 'opt-c', optionText: 'Azure Dedicated Host', reason: 'Dedicated Host is a physical server for your VMs to comply with single-tenant licensing or compliance.' },
      { optionId: 'opt-d', optionText: 'Azure Virtual Desktop', reason: 'AVD is for remote workers who need a Windows virtual desktop in their browser, not microservices.' }
    ],
    analogy: 'Standard shipping containers on a freight ship: every cargo box has standard hooks and stacks tightly on the same deck, rather than chartering an entire separate ship for every small crate.',
    officialLearnRef: 'Microsoft Learn: Describe Azure compute and networking services'
  },
  {
    id: 'az-as-004',
    domain: 'architecture',
    domainTitle: 'Describe Azure Architecture & Services',
    topic: 'Azure Storage Services',
    subtopic: 'Storage Access Tiers',
    difficulty: 'exam-ready',
    question: 'A healthcare clinic must retain patient medical audit logs for 7 years to meet compliance laws. These records are rarely accessed (perhaps once every two years), and retrieval can take up to several hours without impacting operations. Which Azure Blob access tier offers the lowest storage cost?',
    scenario: 'Cost optimization is top priority for regulatory archival data.',
    options: [
      { id: 'opt-a', text: 'Archive Tier', isCorrect: true, explanation: 'Archive tier has the lowest per-gigabyte storage cost, with hours of rehydration latency and higher read costs.' },
      { id: 'opt-b', text: 'Cool Tier', isCorrect: false, explanation: 'Cool tier is for data stored for at least 30 days and accessed infrequently (e.g. monthly backups).' },
      { id: 'opt-c', text: 'Hot Tier', isCorrect: false, explanation: 'Hot tier is optimized for frequently accessed active data and has the highest storage cost.' },
      { id: 'opt-d', text: 'Premium SSD Block Blob', isCorrect: false, explanation: 'Premium tier is optimized for low-latency transactional workloads, not cold compliance storage.' }
    ],
    whyRight: 'The Archive tier provides the cheapest storage cost per GB in Azure Blob Storage. It takes hours to "rehydrate" data back to Cool or Hot tier before reading, making it ideal for multi-year compliance archives.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Cool Tier', reason: 'Cool tier offers immediate millisecond access at higher storage cost than Archive tier; designed for 30+ day retention.' },
      { optionId: 'opt-c', optionText: 'Hot Tier', reason: 'Hot tier is the most expensive for storing dormant data, optimized for continuous active reads/writes.' },
      { optionId: 'opt-d', optionText: 'Premium SSD Block Blob', reason: 'Premium is designed for extreme I/O workloads like real-time video editing or telemetry, costing significantly more.' }
    ],
    analogy: 'Putting old tax files in a deep underground salt mine vault: you pay pennies per year for storage, but if the auditor requests it, the retrieval team takes 5 hours to dig it out.',
    officialLearnRef: 'Microsoft Learn: Describe Azure storage services'
  },
  {
    id: 'az-as-005',
    domain: 'architecture',
    domainTitle: 'Describe Azure Architecture & Services',
    topic: 'Azure Networking Services',
    subtopic: 'VPN Gateway vs ExpressRoute',
    difficulty: 'exam-ready',
    question: 'An enterprise requires a dedicated, private, high-speed connection between its on-premises headquarters and Azure Virtual Networks that completely bypasses the public internet and provides up to 100 Gbps bandwidth. Which service should they implement?',
    scenario: 'Financial trades and confidential internal databases cannot traverse public internet circuits.',
    options: [
      { id: 'opt-a', text: 'Azure ExpressRoute', isCorrect: true, explanation: 'ExpressRoute establishes private fiber connections through a connectivity provider that do not cross the public internet.' },
      { id: 'opt-b', text: 'Azure Site-to-Site VPN Gateway', isCorrect: false, explanation: 'Site-to-Site VPN sends encrypted traffic across the public internet, subject to internet congestion.' },
      { id: 'opt-c', text: 'Azure Point-to-Site VPN', isCorrect: false, explanation: 'Point-to-Site connects individual remote client laptops over the public internet.' },
      { id: 'opt-d', text: 'Azure Virtual Network Peering', isCorrect: false, explanation: 'VNet Peering connects two Azure virtual networks together inside Microsoft\'s backbone, not on-prem.' }
    ],
    whyRight: 'Azure ExpressRoute connects your on-premises network directly to Microsoft cloud services over a private connection facilitated by a connectivity provider. Traffic does not traverse the public internet.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Azure Site-to-Site VPN Gateway', reason: 'Site-to-Site VPN travels over the public internet inside an encrypted IPsec tunnel; it is vulnerable to ISP throttling and latency jitter.' },
      { optionId: 'opt-c', optionText: 'Point-to-Site VPN', reason: 'Point-to-Site is for individual remote workers dialing in from home or a coffee shop.' },
      { optionId: 'opt-d', optionText: 'VNet Peering', reason: 'VNet Peering is exclusively cloud-to-cloud within Azure, connecting Azure VNets to each other.' }
    ],
    analogy: 'Building a private railway track from your factory gate straight into the central depot vs. driving your delivery vans on the public highway with normal civilian traffic and toll booths.',
    officialLearnRef: 'Microsoft Learn: Describe Azure networking services'
  },
  {
    id: 'az-as-006',
    domain: 'architecture',
    domainTitle: 'Describe Azure Architecture & Services',
    topic: 'Core Architectural Components',
    subtopic: 'Resource Groups & Hierarchy',
    difficulty: 'beginner',
    question: 'Which statement accurately describes a characteristic of Azure Resource Groups?',
    scenario: 'An admin is organizing resources for development, test, and production environments.',
    options: [
      { id: 'opt-a', text: 'A resource can exist in only one resource group at a time, but resources from different Azure regions can reside in the same group', isCorrect: true, explanation: 'Resource groups are logical containers. A resource belongs to exactly one group, and groups can hold resources from multiple regions.' },
      { id: 'opt-b', text: 'Resource groups can be nested inside another resource group up to 5 levels deep', isCorrect: false, explanation: 'Resource groups cannot be nested. Hierarchies are formed via Management Groups and Subscriptions.' },
      { id: 'opt-c', text: 'All resources inside a resource group must be in the same geographic region as the resource group itself', isCorrect: false, explanation: 'The resource group location merely specifies where its management metadata is stored.' },
      { id: 'opt-d', text: 'Deleting a resource group leaves all the resources inside it running untouched', isCorrect: false, explanation: 'Deleting a resource group automatically and permanently deletes every resource contained inside it.' }
    ],
    whyRight: 'A resource group is a logical container for Azure assets. Each resource must belong to one and only one group, and resources from diverse geographic regions can share the same resource group.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Nested resource groups', reason: 'Resource groups cannot be nested. Management Groups can be nested up to 6 levels, but not Resource Groups.' },
      { optionId: 'opt-c', optionText: 'Same geographic region', reason: 'A resource group in East US can contain a VM in West Europe and a Storage Account in Japan East.' },
      { optionId: 'opt-d', optionText: 'Deleting leaves resources running', reason: 'Deleting a resource group cascades deletion to all contained resources—a common exam trap!' }
    ],
    analogy: 'A labeled cardboard moving box: every item belongs to exactly one box, and if you throw the entire box into the incinerator, everything inside is incinerated with it.',
    officialLearnRef: 'Microsoft Learn: Describe Azure management hierarchy'
  },

  // --- DOMAIN 3: AZURE MANAGEMENT & GOVERNANCE (30-35%) ---
  {
    id: 'az-mg-001',
    domain: 'management',
    domainTitle: 'Describe Azure Management & Governance',
    topic: 'Governance and Compliance',
    subtopic: 'Azure Policy vs RBAC',
    difficulty: 'intermediate',
    question: 'A company\'s Chief Information Security Officer (CISO) mandates that developers must NOT create virtual machines in any Azure region outside of North Europe and West Europe to comply with GDPR. Which tool should be used to enforce this rule?',
    scenario: 'The security team wants automated guardrails preventing non-compliant deployments before they happen.',
    options: [
      { id: 'opt-a', text: 'Azure Policy', isCorrect: true, explanation: 'Azure Policy enforces rules and effects over resource properties, such as allowed geographic locations or SKU sizes.' },
      { id: 'opt-b', text: 'Role-Based Access Control (Azure RBAC)', isCorrect: false, explanation: 'RBAC controls WHO can perform actions on resources, not the technical properties of the resources.' },
      { id: 'opt-c', text: 'Azure Resource Locks', isCorrect: false, explanation: 'Resource locks prevent accidental deletion or modification of existing resources.' },
      { id: 'opt-d', text: 'Microsoft Defender for Cloud', isCorrect: false, explanation: 'Defender provides threat detection and security posture alerts, but Policy prevents compliant creation.' }
    ],
    whyRight: 'Azure Policy assesses resources for non-compliance and enforces technical standards (like Allowed Locations) at deployment time. If a user tries to deploy in East US, the deployment is blocked.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Role-Based Access Control (Azure RBAC)', reason: 'RBAC governs WHO has permission (e.g. Can Jane create VMs?), not WHERE or WHICH properties the VM can have.' },
      { optionId: 'opt-c', optionText: 'Azure Resource Locks', reason: 'Locks (ReadOnly or CanNotDelete) protect already created resources from being deleted or changed, not prevent creating in bad regions.' },
      { optionId: 'opt-d', optionText: 'Microsoft Defender for Cloud', reason: 'Defender alerts on vulnerabilities and attacks; Azure Policy is the native governance enforcement engine.' }
    ],
    analogy: 'Building codes vs Employee ID badges: RBAC is the badge that lets a worker enter the construction site; Azure Policy is the municipal building inspector who blocks building houses without fire exits.',
    officialLearnRef: 'Microsoft Learn: Describe Azure governance and compliance'
  },
  {
    id: 'az-mg-002',
    domain: 'management',
    domainTitle: 'Describe Azure Management & Governance',
    topic: 'Governance and Compliance',
    subtopic: 'Azure Resource Locks',
    difficulty: 'intermediate',
    question: 'An administrator applies a "ReadOnly" lock to a Production Database resource group. What will happen if a user with the "Owner" role tries to modify the database configuration or delete the database?',
    scenario: 'Preventing human error and accidental outages on mission-critical databases.',
    options: [
      { id: 'opt-a', text: 'The action is blocked; even subscription Owners cannot modify or delete the database until the lock is removed', isCorrect: true, explanation: 'Resource locks take precedence over RBAC permissions; even Owners must remove the lock first.' },
      { id: 'opt-b', text: 'The Owner can override the lock automatically without removing it', isCorrect: false, explanation: 'No role bypasses an active lock; the lock must be explicitly deleted.' },
      { id: 'opt-c', text: 'The Owner can modify configuration, but cannot delete the resource', isCorrect: false, explanation: 'ReadOnly prevents BOTH modification and deletion. CanNotDelete prevents deletion only.' },
      { id: 'opt-d', text: 'The lock converts the database to an Azure Read Replica automatically', isCorrect: false, explanation: 'Resource locks are governance barriers, not database replication features.' }
    ],
    whyRight: 'Azure Resource Locks (ReadOnly and CanNotDelete) apply to all users, regardless of their RBAC role. Even an Owner cannot modify or delete a resource protected by a ReadOnly lock until the lock is explicitly deleted.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Owner can override automatically', reason: 'If Owners could bypass locks silently, accidental script deletions would wipe production!' },
      { optionId: 'opt-c', optionText: 'Can modify but not delete', reason: 'That is the definition of "CanNotDelete" lock. A "ReadOnly" lock prevents both modifications and deletions.' },
      { optionId: 'opt-d', optionText: 'Converts database to replica', reason: 'Resource locks have nothing to do with database replication technology.' }
    ],
    analogy: 'A tamper-evident physical seal over the emergency power cutoff switch in an airplane cockpit: even the senior pilot must deliberately unclip the plastic safety latch before toggling the switch.',
    officialLearnRef: 'Microsoft Learn: Protect your resources with Azure resource locks'
  },
  {
    id: 'az-mg-003',
    domain: 'management',
    domainTitle: 'Describe Azure Management & Governance',
    topic: 'Cost Management & Planning',
    subtopic: 'Pricing Calculator vs TCO Calculator',
    difficulty: 'beginner',
    question: 'A company currently owns 50 on-premises Windows servers in their private data center. They want to compare the total financial cost of continuing on-premises operations over 5 years against migrating those workloads to Azure. Which tool should they use?',
    scenario: 'The executive committee needs an ROI business case comparing physical data center costs with Azure.',
    options: [
      { id: 'opt-a', text: 'Total Cost of Ownership (TCO) Calculator', isCorrect: true, explanation: 'The TCO Calculator compares on-premises datacenter costs (hardware, power, cooling, labor) with equivalent Azure cloud costs.' },
      { id: 'opt-b', text: 'Azure Pricing Calculator', isCorrect: false, explanation: 'The Pricing Calculator estimates the direct monthly price of Azure services before you deploy them.' },
      { id: 'opt-c', text: 'Azure Cost Management + Billing', isCorrect: false, explanation: 'Cost Management tracks and analyzes money you are ALREADY spending on deployed Azure resources.' },
      { id: 'opt-d', text: 'Azure Advisor Cost Recommendation', isCorrect: false, explanation: 'Advisor recommends rightsizing active resources that are currently running.' }
    ],
    whyRight: 'The Total Cost of Ownership (TCO) Calculator evaluates the holistic economic picture, factoring in electricity, server rack maintenance, real estate, and virtualization licenses vs Azure migration.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Azure Pricing Calculator', reason: 'The Pricing Calculator only prices Azure resources in isolation (e.g. 4 VMs + 2 TB storage = $300/mo); it does NOT compare against your existing on-prem datacenter costs.' },
      { optionId: 'opt-c', optionText: 'Azure Cost Management', reason: 'Cost Management monitors active Azure billing in real-time after resources are created.' },
      { optionId: 'opt-d', optionText: 'Azure Advisor', reason: 'Advisor analyzes live workloads to recommend buying reserved instances or shutting down idle VMs.' }
    ],
    analogy: 'Comparing the true cost of owning a 10-year-old gas-guzzling car (oil changes, repairs, insurance, gas) vs switching to an electric lease with free charging.',
    officialLearnRef: 'Microsoft Learn: Describe cost management in Azure'
  },
  {
    id: 'az-mg-004',
    domain: 'management',
    domainTitle: 'Describe Azure Management & Governance',
    topic: 'Monitoring and Reporting',
    subtopic: 'Azure Monitor vs Azure Service Health',
    difficulty: 'intermediate',
    question: 'Where should an engineer look to find official Microsoft notifications regarding an ongoing global outage affecting Azure Storage in the East US region, as well as planned maintenance windows?',
    scenario: 'Your application is throwing storage connectivity errors and you want to know if Microsoft has declared an outage.',
    options: [
      { id: 'opt-a', text: 'Azure Service Health', isCorrect: true, explanation: 'Azure Service Health provides a personalized dashboard of the health of Azure services and regions you use, including outages and planned maintenance.' },
      { id: 'opt-b', text: 'Azure Monitor Application Insights', isCorrect: false, explanation: 'Application Insights monitors your custom application code exceptions and HTTP performance.' },
      { id: 'opt-c', text: 'Log Analytics Workspace', isCorrect: false, explanation: 'Log Analytics queries raw event logs you configure inside your resources.' },
      { id: 'opt-d', text: 'Microsoft Sentinel', isCorrect: false, explanation: 'Microsoft Sentinel is a SIEM/SOAR cybersecurity threat intelligence tool.' }
    ],
    whyRight: 'Azure Service Health delivers customized notifications and guidance when Azure cloud service issues, planned maintenance, or security advisories affect your specific subscriptions and regions.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Application Insights', reason: 'App Insights is an APM tool for your own web app code (e.g., catching React or Node.js runtime errors).' },
      { optionId: 'opt-c', optionText: 'Log Analytics', reason: 'Log Analytics is for writing KQL queries against custom VM system logs, not platform-wide status announcements.' },
      { optionId: 'opt-d', optionText: 'Microsoft Sentinel', reason: 'Sentinel is a Cloud SIEM for hunting cyberattackers and automated threat response.' }
    ],
    analogy: 'Checking the regional electric utility\'s live outage map and storm maintenance advisory vs checking your personal house\'s circuit breaker box.',
    officialLearnRef: 'Microsoft Learn: Describe Azure monitoring tools'
  },
  {
    id: 'az-mg-005',
    domain: 'management',
    domainTitle: 'Describe Azure Management & Governance',
    topic: 'Security and Identity',
    subtopic: 'Microsoft Defender for Cloud',
    difficulty: 'intermediate',
    question: 'Which capability is provided by Microsoft Defender for Cloud?',
    scenario: 'A DevOps engineer needs continuous security posture assessment and threat protection for hybrid workloads.',
    options: [
      { id: 'opt-a', text: 'Providing a unified Secure Score and continuous security assessments to strengthen cloud security posture', isCorrect: true, explanation: 'Defender for Cloud assesses security configurations across Azure, AWS, GCP, and on-premises to generate a Secure Score.' },
      { id: 'opt-b', text: 'Purchasing domain names and registering public DNS records', isCorrect: false, explanation: 'Azure DNS and App Service Domains handle domain registration, not Defender.' },
      { id: 'opt-c', text: 'Deploying ARM templates via GitHub Actions CI/CD pipelines', isCorrect: false, explanation: 'CI/CD deployment is handled by Azure DevOps or GitHub Actions.' },
      { id: 'opt-d', text: 'Automatically approving and paying monthly cloud invoices', isCorrect: false, explanation: 'Billing and invoice approval is handled in Cost Management & Billing.' }
    ],
    whyRight: 'Microsoft Defender for Cloud (formerly Azure Security Center) monitors workloads across hybrid and multicloud environments, providing continuous security assessments and an actionable Secure Score.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Domain names and DNS', reason: 'Domain registration is managed by domain registrars and Azure DNS.' },
      { optionId: 'opt-c', optionText: 'Deploying ARM templates', reason: 'ARM templates are infrastructure-as-code deployment files, managed via CI/CD or Azure CLI.' },
      { optionId: 'opt-d', optionText: 'Paying monthly invoices', reason: 'Billing operations are managed through the Azure Billing portal.' }
    ],
    analogy: 'A building security consultant conducting weekly inspections: they check if doors are locked, fire alarms are working, and hand the manager a 1-100 safety score with prioritized fix lists.',
    officialLearnRef: 'Microsoft Learn: Describe Microsoft Defender for Cloud'
  },
  {
    id: 'az-mg-006',
    domain: 'management',
    domainTitle: 'Describe Azure Management & Governance',
    topic: 'Infrastructure as Code',
    subtopic: 'ARM Templates and Azure Bicep',
    difficulty: 'beginner',
    question: 'Which syntax format is used natively by Azure Resource Manager (ARM) templates to declare infrastructure idempotently?',
    scenario: 'A cloud team wants to automate the creation of 20 identical virtual networks.',
    options: [
      { id: 'opt-a', text: 'JSON (JavaScript Object Notation)', isCorrect: true, explanation: 'ARM templates use declarative JSON files (or Bicep, which compiles down to ARM JSON).' },
      { id: 'opt-b', text: 'Python scripts', isCorrect: false, explanation: 'Python is an imperative programming language, not the native ARM declarative template format.' },
      { id: 'opt-c', text: 'XML stylesheets', isCorrect: false, explanation: 'XML is not used for Azure Resource Manager template definitions.' },
      { id: 'opt-d', text: 'Markdown text files', isCorrect: false, explanation: 'Markdown is for documentation, not executable infrastructure templates.' }
    ],
    whyRight: 'Native ARM templates are declarative JSON files that define the infrastructure and configuration for your project. Microsoft also offers Azure Bicep as a domain-specific language that compiles directly into ARM JSON.',
    whyWrong: [
      { optionId: 'opt-b', optionText: 'Python scripts', reason: 'Python can use the Azure SDK imperatively, but native ARM templates are declarative JSON documents.' },
      { optionId: 'opt-c', optionText: 'XML stylesheets', reason: 'Azure Resource Manager was built from the ground up using JSON standards.' },
      { optionId: 'opt-d', optionText: 'Markdown text files', reason: 'Markdown is for human-readable notes and documentation (like README.md).' }
    ],
    analogy: 'An architectural blueprint for a house: no matter how many times the builder reads the blueprint, the exact same building with the exact same dimensions is created (idempotency).',
    officialLearnRef: 'Microsoft Learn: Describe Azure management tools'
  }
];

// Initial Flashcards Seed
const SEED_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-01',
    domain: 'concepts',
    term: 'Capital Expenditure (CapEx)',
    category: 'Cloud Economics',
    summary: 'Upfront money spent on physical infrastructure, servers, and datacenters.',
    keyTakeaway: 'High initial cost; value depreciates over multiple years on balance sheet.',
    analogy: 'Buying a car with cash upfront and paying for maintenance.',
    commonExamTrap: 'Do not confuse CapEx with OpEx (pay-as-you-go). CapEx = High upfront payment.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-02',
    domain: 'concepts',
    term: 'Operational Expenditure (OpEx)',
    category: 'Cloud Economics',
    summary: 'Ongoing operational costs billed according to real-time consumption.',
    keyTakeaway: 'No upfront investment; deducts expenses from tax in the current financial year.',
    analogy: 'Taking an Uber or paying a monthly electricity bill for what you consume.',
    commonExamTrap: 'Azure consumption is OpEx. Reserved Instances can still be billed monthly as OpEx.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-03',
    domain: 'concepts',
    term: 'IaaS vs PaaS vs SaaS',
    category: 'Cloud Service Models',
    summary: 'The three pillars of cloud control: Infrastructure, Platform, and Software.',
    keyTakeaway: 'IaaS: You manage OS & Apps. PaaS: You manage App & Data. SaaS: You only use software.',
    analogy: 'Pizza: IaaS = Buy frozen pizza & bake at home; PaaS = Pizza delivery; SaaS = Dining in a restaurant.',
    commonExamTrap: 'Azure VMs = IaaS. Azure App Service / SQL Database = PaaS. Microsoft 365 = SaaS.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-04',
    domain: 'architecture',
    term: 'Azure Availability Zone',
    category: 'Global Infrastructure',
    summary: 'Physically separated datacenters within a single region with independent power and cooling.',
    keyTakeaway: 'Provides 99.99% VM SLA. Protects against building-level datacenter disasters.',
    analogy: 'Having three backup generators in three different neighborhoods in the same city.',
    commonExamTrap: 'Availability Zones are within ONE region. Region Pairs span hundreds of miles.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-05',
    domain: 'architecture',
    term: 'Azure Region Pair',
    category: 'Disaster Recovery',
    summary: 'Two regions in the same geography located at least 300 miles apart.',
    keyTakeaway: 'Serialized platform updates; prioritized disaster recovery order.',
    analogy: 'Two headquarters in Nairobi and Mombasa keeping copies of records.',
    commonExamTrap: 'Updates happen to only one pair at a time so both never experience scheduled maintenance together.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-06',
    domain: 'architecture',
    term: 'Azure ExpressRoute',
    category: 'Networking',
    summary: 'Private high-speed dedicated fiber link between on-premises and Azure.',
    keyTakeaway: 'Does NOT traverse the public internet; provides ultra-low latency & up to 100 Gbps.',
    analogy: 'A private underground train track directly between your warehouse and the harbor.',
    commonExamTrap: 'Site-to-Site VPN traverses the public internet (encrypted). ExpressRoute bypasses the public internet completely.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-07',
    domain: 'architecture',
    term: 'Blob Storage Access Tiers',
    category: 'Storage',
    summary: 'Hot, Cool, Cold, and Archive tiers designed for different data access frequencies.',
    keyTakeaway: 'Archive is lowest storage price per GB, but has highest read cost and takes hours to rehydrate.',
    analogy: 'Desk drawer (Hot), attic (Cool), underground vault (Archive).',
    commonExamTrap: 'Archive tier data is offline; you cannot read it immediately without rehydrating first.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-08',
    domain: 'management',
    term: 'Azure Policy vs Azure RBAC',
    category: 'Governance & Access',
    summary: 'Policy governs WHAT can be deployed; RBAC governs WHO can perform actions.',
    keyTakeaway: 'RBAC: Role assignments. Policy: Guardrails (e.g. restrict to West Europe, enforce HTTPS).',
    analogy: 'Security badge to enter building (RBAC) vs fire code forbidding fireworks inside (Policy).',
    commonExamTrap: 'Exam often asks: "How to prevent VMs in certain regions?" Answer is ALWAYS Azure Policy, NOT RBAC.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-09',
    domain: 'management',
    term: 'Azure Resource Locks',
    category: 'Resource Governance',
    summary: 'Locks that prevent accidental deletion or modification (CanNotDelete and ReadOnly).',
    keyTakeaway: 'Applies to ALL users including subscription Owners until explicitly deleted.',
    analogy: 'Safety guard cover over a nuclear launch button.',
    commonExamTrap: 'ReadOnly prevents BOTH modification and deletion. CanNotDelete allows modification but blocks delete.',
    status: 'unseen',
    lastReviewed: null
  },
  {
    id: 'fc-10',
    domain: 'management',
    term: 'TCO Calculator vs Pricing Calculator',
    category: 'Cost Planning',
    summary: 'TCO compares on-prem vs Azure migration. Pricing Calculator estimates Azure service cost.',
    keyTakeaway: 'TCO evaluates total cost of ownership including power, rack space, IT labor vs cloud.',
    analogy: 'TCO: Buy vs Lease calculation. Pricing Calculator: Shopping cart itemized price before checkout.',
    commonExamTrap: 'If the question mentions existing on-premises datacenter comparison, the answer is TCO Calculator.',
    status: 'unseen',
    lastReviewed: null
  }
];

// Seed sample audio notes / transcripts for the searchable study notes database
const SEED_TRANSCRIPTS: StudyNote[] = [
  {
    id: 'note-01',
    title: 'AZ-900 Core Cloud Concepts & Shared Responsibility Audio Lecture',
    category: 'Domain 1: Cloud Concepts',
    timestamp: Date.now() - 86400000 * 2,
    durationSeconds: 184,
    audioFileName: 'lecture-cloud-concepts-m1.mp3',
    transcript: "Welcome to module one on Cloud Concepts. Let's break down the shared responsibility model. In an on-premise datacenter, you own everything from the physical building, security guards, power, cooling, physical servers, hypervisor, OS, and applications. When you migrate to IaaS on Azure, Microsoft assumes responsibility for the physical datacenter, physical servers, and network virtualization. You still own the operating system, network configuration, and data. In PaaS, like Azure App Service, Microsoft patches the OS and manages the runtime. You only bring your code and data. In SaaS, like Microsoft 365, Microsoft handles almost everything except access management and your data classification. Remember for the exam: Information and data, devices, and accounts and identities are ALWAYS your responsibility in any cloud model!",
    summary: "Comprehensive breakdown of the Shared Responsibility Model across On-Prem, IaaS, PaaS, and SaaS, highlighting customer vs Microsoft duties.",
    keyTerms: ['Shared Responsibility Model', 'IaaS', 'PaaS', 'SaaS', 'Data Governance'],
    examTips: [
      'Data, accounts, and identities are ALWAYS the customer responsibility.',
      'Physical datacenter security is ALWAYS Microsoft responsibility.',
      'Operating System updates are customer duty in IaaS, but Microsoft duty in PaaS.'
    ],
    isStarred: true
  },
  {
    id: 'note-02',
    title: 'Azure Storage Tiers & Redundancy Audio Notes',
    category: 'Domain 2: Architecture & Services',
    timestamp: Date.now() - 86400000 * 1,
    durationSeconds: 142,
    audioFileName: 'storage-tiers-revision.mp3',
    transcript: "Quick revision on Blob Storage access tiers: We have Hot, Cool, Cold, and Archive. Hot is for data you access every day. It has highest storage cost but lowest access cost. Cool tier is for data accessed infrequently, stored for minimum 30 days. Archive tier has the lowest per-gigabyte storage cost, ideal for multi-year compliance like medical or banking records. But caution: Archive tier is offline! You must rehydrate it before reading, which can take up to several hours. For redundancy: LRS gives 3 copies in one datacenter. ZRS gives 3 copies across 3 availability zones in one region. GRS gives 6 copies: 3 in primary region and 3 in paired secondary region 300 miles away.",
    summary: "Audio revision on Azure Blob access tiers (Hot, Cool, Cold, Archive) and replication redundancy types (LRS, ZRS, GRS).",
    keyTerms: ['Blob Storage', 'Hot Tier', 'Archive Tier', 'Rehydration', 'LRS', 'ZRS', 'GRS'],
    examTips: [
      'Archive tier cannot be read directly without rehydrating first.',
      'GRS copies data asynchronously to a secondary region pair at least 300 miles away.',
      'ZRS protects against a datacenter fire within the same region.'
    ],
    isStarred: false
  }
];

// Helper to load or initialize DB
function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        questions: SEED_QUESTIONS,
        flashcards: SEED_FLASHCARDS,
        attempts: [],
        studyPlan: null,
        transcripts: SEED_TRANSCRIPTS,
        userStats: {
          streakDays: 3,
          lastActiveDate: new Date().toISOString().split('T')[0],
          xp: 450,
          unlockedBadges: [
            { id: 'badge-1', name: 'First Step', description: 'Joined the #1MillionDevs Movement', icon: '🚀', unlockedAt: Date.now() - 86400000 * 3 },
            { id: 'badge-2', name: 'Cloud Curious', description: 'Explored AZ-900 cloud foundations', icon: '☁️', unlockedAt: Date.now() - 86400000 }
          ]
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    // ensure seed questions exist if empty
    if (!parsed.questions || parsed.questions.length === 0) {
      parsed.questions = SEED_QUESTIONS;
    }
    if (!parsed.flashcards || parsed.flashcards.length === 0) {
      parsed.flashcards = SEED_FLASHCARDS;
    }
    if (!parsed.transcripts) {
      parsed.transcripts = SEED_TRANSCRIPTS;
    }
    if (!parsed.studyPlan) {
      parsed.studyPlan = {
        targetExamDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        dailyHours: 2,
        experienceLevel: 'intermediate',
        planGeneratedAt: Date.now(),
        days: [
          {
            dayNumber: 1,
            title: 'Cloud Concepts: CapEx vs OpEx & Financial Models',
            domain: 'concepts',
            estimatedHours: 2,
            tasks: [
              { id: 'd1-t1', text: 'Read Microsoft Learn: Cloud Computing Economics & Financial Models', completed: true, type: 'read' },
              { id: 'd1-t2', text: 'Master 3 flashcards on CapEx vs OpEx and Consumption Model', completed: true, type: 'flashcard' },
              { id: 'd1-t3', text: 'Take Domain 1 Smart Quiz with 100% review on wrong options', completed: false, type: 'quiz' },
              { id: 'd1-t4', text: 'Ask AI Study Buddy to explain Uber/Apartment rental analogy', completed: false, type: 'lab' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Cloud Concepts: Shared Responsibility (IaaS, PaaS, SaaS)',
            domain: 'concepts',
            estimatedHours: 2,
            tasks: [
              { id: 'd2-t1', text: 'Read Microsoft Learn: Shared Responsibility boundary matrix', completed: true, type: 'read' },
              { id: 'd2-t2', text: 'Practice 4 flashcards on IaaS, PaaS, SaaS comparisons', completed: false, type: 'flashcard' },
              { id: 'd2-t3', text: 'Complete 5-question scenario quiz on OS patching responsibilities', completed: false, type: 'quiz' }
            ]
          },
          {
            dayNumber: 3,
            title: 'Azure Architecture: Regions & Availability Zones',
            domain: 'architecture',
            estimatedHours: 2,
            tasks: [
              { id: 'd3-t1', text: 'Read Microsoft Learn: Global Datacenter Infrastructure & 99.99% SLAs', completed: false, type: 'read' },
              { id: 'd3-t2', text: 'Review 300-mile disaster recovery isolation rules', completed: false, type: 'read' },
              { id: 'd3-t3', text: 'Quiz on Availability Zones vs Fault/Update Domains', completed: false, type: 'quiz' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Compute & Containers: VMs, Containers, AKS & App Services',
            domain: 'architecture',
            estimatedHours: 2,
            tasks: [
              { id: 'd4-t1', text: 'Compare Virtual Machines vs Azure Container Instances (ACI)', completed: false, type: 'read' },
              { id: 'd4-t2', text: 'Review Serverless Computing (Azure Functions & Logic Apps)', completed: false, type: 'read' },
              { id: 'd4-t3', text: 'Ask AI Coach: Container vs VM shipping crate analogy', completed: false, type: 'lab' }
            ]
          },
          {
            dayNumber: 5,
            title: 'Storage Services: Blob Tiers & Redundancy (LRS, ZRS, GRS)',
            domain: 'architecture',
            estimatedHours: 2,
            tasks: [
              { id: 'd5-t1', text: 'Read Microsoft Learn: Hot, Cool, Cold, Archive access tiers', completed: false, type: 'read' },
              { id: 'd5-t2', text: 'Understand rehydration latency for Archive tier', completed: false, type: 'read' },
              { id: 'd5-t3', text: 'Take Storage Services practice quiz', completed: false, type: 'quiz' }
            ]
          },
          {
            dayNumber: 6,
            title: 'Governance & Compliance: Azure Policy vs RBAC',
            domain: 'management',
            estimatedHours: 2,
            tasks: [
              { id: 'd6-t1', text: 'Read Microsoft Learn: Role-Based Access Control vs Policy definitions', completed: false, type: 'read' },
              { id: 'd6-t2', text: 'Learn Resource Locks (ReadOnly vs CanNotDelete) inheritance', completed: false, type: 'read' },
              { id: 'd6-t3', text: 'Master Policy vs RBAC flashcards', completed: false, type: 'flashcard' }
            ]
          },
          {
            dayNumber: 7,
            title: 'Cost & Security: Pricing vs TCO, Defender for Cloud',
            domain: 'management',
            estimatedHours: 2,
            tasks: [
              { id: 'd7-t1', text: 'Compare Pricing Calculator vs Total Cost of Ownership (TCO)', completed: false, type: 'read' },
              { id: 'd7-t2', text: 'Review Microsoft Defender for Cloud Secure Score', completed: false, type: 'read' },
              { id: 'd7-t3', text: 'Complete full-length 45-min Timed Mock Exam (700+ to pass)', completed: false, type: 'quiz' }
            ]
          }
        ]
      };
      saveDatabase(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB, using memory fallback:', err);
    return {
      questions: SEED_QUESTIONS,
      flashcards: SEED_FLASHCARDS,
      attempts: [],
      studyPlan: null,
      transcripts: SEED_TRANSCRIPTS,
      userStats: {
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        xp: 100,
        unlockedBadges: []
      }
    };
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Compute dynamic readiness score and domain stats
function calculateProgress(db: DatabaseSchema) {
  const attempts = db.attempts;
  const questions = db.questions;

  // Domain question counts
  const domainTotals = {
    concepts: questions.filter(q => q.domain === 'concepts').length,
    architecture: questions.filter(q => q.domain === 'architecture').length,
    management: questions.filter(q => q.domain === 'management').length,
  };

  // Domain score tracking
  const domainStats = {
    concepts: { correct: 0, total: 0 },
    architecture: { correct: 0, total: 0 },
    management: { correct: 0, total: 0 },
  };

  // Topic miss tracking for weak areas
  const topicStats: Record<string, { topic: string; domain: 'concepts' | 'architecture' | 'management'; correct: number; total: number }> = {};

  attempts.forEach(attempt => {
    attempt.answers.forEach(ans => {
      const q = questions.find(item => item.id === ans.questionId);
      if (q) {
        domainStats[q.domain].total += 1;
        if (ans.isCorrect) {
          domainStats[q.domain].correct += 1;
        }

        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { topic: q.topic, domain: q.domain, correct: 0, total: 0 };
        }
        topicStats[q.topic].total += 1;
        if (ans.isCorrect) {
          topicStats[q.topic].correct += 1;
        }
      }
    });
  });

  const getAccuracy = (stat: { correct: number; total: number }) => {
    if (stat.total === 0) return 0;
    return Math.round((stat.correct / stat.total) * 100);
  };

  const domainScores = {
    concepts: domainStats.concepts.total > 0 ? getAccuracy(domainStats.concepts) : 65,
    architecture: domainStats.architecture.total > 0 ? getAccuracy(domainStats.architecture) : 60,
    management: domainStats.management.total > 0 ? getAccuracy(domainStats.management) : 55,
  };

  // Flashcard weight
  const totalCards = db.flashcards.length;
  const masteredCards = db.flashcards.filter(c => c.status === 'mastered').length;
  const flashcardMasteryRatio = totalCards > 0 ? (masteredCards / totalCards) : 0;

  // Overall readiness is weighted:
  // Concepts (28%), Architecture (37%), Management (35%) based on official AZ-900 weighting + flashcard bonus
  let baseScore = 0;
  if (attempts.length === 0) {
    baseScore = 48 + Math.round(flashcardMasteryRatio * 15);
  } else {
    baseScore = Math.round(
      domainScores.concepts * 0.28 +
      domainScores.architecture * 0.37 +
      domainScores.management * 0.35
    );
  }

  // Weak areas (topics with lowest accuracy or highest misses)
  const weakAreas = Object.values(topicStats)
    .filter(t => t.total >= 1 && (t.correct / t.total) < 0.8)
    .map(t => ({
      topic: t.topic,
      domain: t.domain,
      missCount: t.total - t.correct,
      totalCount: t.total,
      accuracy: Math.round((t.correct / t.total) * 100)
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // If no weak areas recorded yet, suggest key challenging topics from syllabus
  const fallbackWeakAreas = [
    { topic: 'Availability Zones & SLAs', domain: 'architecture' as const, missCount: 0, totalCount: 0, accuracy: 50 },
    { topic: 'Azure Policy vs RBAC', domain: 'management' as const, missCount: 0, totalCount: 0, accuracy: 55 },
    { topic: 'CapEx vs OpEx Modeling', domain: 'concepts' as const, missCount: 0, totalCount: 0, accuracy: 60 }
  ];

  return {
    overallReadiness: Math.min(100, Math.max(15, baseScore)),
    domainScores,
    domainTotals,
    totalQuizzesTaken: attempts.length,
    totalQuestionsAnswered: attempts.reduce((acc, a) => acc + a.totalQuestions, 0),
    totalCorrect: attempts.reduce((acc, a) => acc + a.correctCount, 0),
    streakDays: db.userStats.streakDays,
    xp: db.userStats.xp,
    unlockedBadges: db.userStats.unlockedBadges,
    weakAreas: weakAreas.length > 0 ? weakAreas : fallbackWeakAreas,
    flashcards: {
      total: totalCards,
      mastered: masteredCards,
      needsPractice: db.flashcards.filter(c => c.status === 'needs_practice').length,
      unseen: db.flashcards.filter(c => c.status === 'unseen').length
    }
  };
}

// Check and award badges
function checkBadges(db: DatabaseSchema) {
  const currentBadges = new Set(db.userStats.unlockedBadges.map(b => b.id));
  const newBadges: { id: string; name: string; description: string; icon: string; unlockedAt: number }[] = [];

  const totalAttempts = db.attempts.length;
  const perfectScoreAttempts = db.attempts.filter(a => a.scorePercentage === 100).length;

  if (totalAttempts >= 1 && !currentBadges.has('badge-first-quiz')) {
    newBadges.push({ id: 'badge-first-quiz', name: 'First Quiz Cleared', description: 'Completed your first AZ-900 practice round', icon: '🎯', unlockedAt: Date.now() });
  }

  if (perfectScoreAttempts >= 1 && !currentBadges.has('badge-ace')) {
    newBadges.push({ id: 'badge-ace', name: 'Azure Sharpshooter', description: 'Scored 100% on a quiz attempt', icon: '🏆', unlockedAt: Date.now() });
  }

  const masteredCards = db.flashcards.filter(c => c.status === 'mastered').length;
  if (masteredCards >= 5 && !currentBadges.has('badge-flash-master')) {
    newBadges.push({ id: 'badge-flash-master', name: 'Mnemonic Master', description: 'Mastered 5 or more Azure concept cards', icon: '🧠', unlockedAt: Date.now() });
  }

  if (db.userStats.xp >= 500 && !currentBadges.has('badge-xp-500')) {
    newBadges.push({ id: 'badge-xp-500', name: 'Cloud Climber', description: 'Earned 500+ XP in AzureVibe', icon: '⚡', unlockedAt: Date.now() });
  }

  if (newBadges.length > 0) {
    db.userStats.unlockedBadges.push(...newBadges);
    saveDatabase(db);
  }

  return newBadges;
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. GET User Progress & Readiness
app.get('/api/progress', (req, res) => {
  const db = getDatabase();
  const progress = calculateProgress(db);
  res.json({ success: true, progress });
});

// 2. GET Questions with filters
app.get('/api/questions', (req, res) => {
  const db = getDatabase();
  const { domain, filter, limit, topics } = req.query;

  let filtered = [...db.questions];

  if (domain && domain !== 'all') {
    filtered = filtered.filter(q => q.domain === domain);
  }

  if (filter === 'weak-areas') {
    const progress = calculateProgress(db);
    const weakTopicNames = new Set(progress.weakAreas.map(w => w.topic));
    filtered = filtered.filter(q => weakTopicNames.has(q.topic));
    if (filtered.length === 0) {
      filtered = [...db.questions];
    }
  }

  if (topics) {
    const requestedTopics = new Set(
      String(topics).split(",").map(topic => topic.trim()).filter(Boolean)
    );
    filtered = filtered.filter(q => requestedTopics.has(q.topic));
  }

  // Shuffle order slightly for variety
  filtered = filtered.sort(() => Math.random() - 0.5);

  if (limit) {
    const numLimit = parseInt(String(limit), 10);
    if (!isNaN(numLimit) && numLimit > 0) {
      filtered = filtered.slice(0, numLimit);
    }
  }

  res.json({ success: true, questions: filtered, total: filtered.length });
});

// 3. POST Quiz Attempt
app.post('/api/quiz/submit', (req, res) => {
  const db = getDatabase();
  const { domainFilter, answers, timeSpentSeconds } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Answers array is required' });
  }

  let correctCount = 0;
  const processedAnswers = answers.map((ans: { questionId: string; selectedOptionId: string }) => {
    const q = db.questions.find(item => item.id === ans.questionId);
    const correctOpt = q?.options.find(o => o.isCorrect);
    const isCorrect = correctOpt ? correctOpt.id === ans.selectedOptionId : false;
    if (isCorrect) correctCount++;
    return {
      questionId: ans.questionId,
      selectedOptionId: ans.selectedOptionId,
      isCorrect
    };
  });

  const scorePercentage = Math.round((correctCount / answers.length) * 100);
  const earnedXp = correctCount * 25 + (scorePercentage >= 80 ? 50 : 20);

  const attempt: QuizAttempt = {
    id: 'attempt-' + Date.now(),
    timestamp: Date.now(),
    domainFilter: domainFilter || 'all',
    totalQuestions: answers.length,
    correctCount,
    scorePercentage,
    timeSpentSeconds: timeSpentSeconds || 60,
    answers: processedAnswers
  };

  db.attempts.unshift(attempt);
  db.userStats.xp += earnedXp;

  // Streak calculation
  const today = new Date().toISOString().split('T')[0];
  if (db.userStats.lastActiveDate !== today) {
    db.userStats.streakDays += 1;
    db.userStats.lastActiveDate = today;
  }

  saveDatabase(db);
  const newBadges = checkBadges(db);
  const updatedProgress = calculateProgress(db);

  res.json({
    success: true,
    attempt,
    earnedXp,
    newBadges,
    progress: updatedProgress
  });
});

// 4. GET Flashcards
app.get('/api/flashcards', (req, res) => {
  const db = getDatabase();
  const { domain, status } = req.query;

  let cards = [...db.flashcards];
  if (domain && domain !== 'all') {
    cards = cards.filter(c => c.domain === domain);
  }
  if (status && status !== 'all') {
    cards = cards.filter(c => c.status === status);
  }

  res.json({ success: true, flashcards: cards });
});

// 5. POST Update Flashcard Confidence
app.post('/api/flashcards/:id/confidence', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status } = req.body; // 'mastered' | 'needs_practice'

  const card = db.flashcards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  if (status !== 'mastered' && status !== 'needs_practice') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  card.status = status;
  card.lastReviewed = Date.now();
  db.userStats.xp += status === 'mastered' ? 15 : 5;

  saveDatabase(db);
  checkBadges(db);

  res.json({ success: true, card, xp: db.userStats.xp });
});

// 6. GET / POST Study Plan
app.get('/api/study-plan', (req, res) => {
  const db = getDatabase();
  res.json({ success: true, studyPlan: db.studyPlan });
});

app.post('/api/study-plan/generate', (req, res) => {
  const db = getDatabase();
  const { targetExamDate, dailyHours, experienceLevel } = req.body;

  const target = new Date(targetExamDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.max(3, Math.min(30, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
  const hours = Number(dailyHours) || 2;

  // Generate structured day-by-day plan mapping the 3 official AZ-900 domains
  const generatedDays: StudyPlan['days'] = [];

  const domainMilestones: { title: string; domain: 'concepts' | 'architecture' | 'management'; topics: string[] }[] = [
    {
      title: 'Cloud Concepts: CapEx vs OpEx & Shared Responsibility',
      domain: 'concepts',
      topics: ['IaaS vs PaaS vs SaaS matrix', 'CapEx vs OpEx accounting', 'High Availability, Elasticity, Agility']
    },
    {
      title: 'Cloud Economics & Cloud Types',
      domain: 'concepts',
      topics: ['Public, Private, Hybrid cloud models', 'Consumption-based pricing', 'SLA calculations (99.99%)']
    },
    {
      title: 'Azure Architecture: Regions & Availability Zones',
      domain: 'architecture',
      topics: ['Regions, Region Pairs (300+ miles)', 'Availability Zones fault isolation', 'Data center physical infrastructure']
    },
    {
      title: 'Compute & Containers: VMs, App Services & AKS',
      domain: 'architecture',
      topics: ['Azure Virtual Machines & Scale Sets', 'App Services & Azure Functions', 'ACI vs AKS microservices']
    },
    {
      title: 'Storage & Networking: Blob Tiers & VNets',
      domain: 'architecture',
      topics: ['Hot, Cool, Cold, Archive Blob tiers', 'LRS vs ZRS vs GRS redundancy', 'VNets, Subnets, VPN Gateway vs ExpressRoute']
    },
    {
      title: 'Azure Governance: Policy vs RBAC',
      domain: 'management',
      topics: ['Azure Policy compliance enforcement', 'Role-Based Access Control (RBAC)', 'Resource Locks (CanNotDelete & ReadOnly)']
    },
    {
      title: 'Cost Management & Monitoring',
      domain: 'management',
      topics: ['Pricing Calculator vs TCO Calculator', 'Azure Cost Management & Budgets', 'Azure Service Health vs Azure Monitor']
    },
    {
      title: 'Security, Privacy & Final Mock Exam',
      domain: 'management',
      topics: ['Microsoft Defender for Cloud Secure Score', 'Microsoft Sentinel SIEM', 'Full-length 45-min Timed Mock Exam']
    }
  ];

  for (let i = 1; i <= diffDays; i++) {
    const milestoneIndex = (i - 1) % domainMilestones.length;
    const milestone = domainMilestones[milestoneIndex];

    generatedDays.push({
      dayNumber: i,
      title: `Day ${i}: ${milestone.title}`,
      domain: milestone.domain,
      estimatedHours: hours,
      tasks: [
        { id: `d${i}-t1`, text: `Read Microsoft Learn: ${milestone.topics[0]}`, completed: false, type: 'read' },
        { id: `d${i}-t2`, text: `Master 3 flashcards on ${milestone.topics[1] || 'Domain Terms'}`, completed: false, type: 'flashcard' },
        { id: `d${i}-t3`, text: `Take topic quiz with 100% review on wrong answers`, completed: false, type: 'quiz' },
        { id: `d${i}-t4`, text: `Ask AI Study Buddy to explain ${milestone.topics[2] || 'Key Tricky Concepts'} with real-world analogy`, completed: false, type: 'lab' }
      ]
    });
  }

  const studyPlan: StudyPlan = {
    targetExamDate,
    dailyHours: hours,
    experienceLevel: experienceLevel || 'intermediate',
    planGeneratedAt: Date.now(),
    days: generatedDays
  };

  db.studyPlan = studyPlan;
  saveDatabase(db);

  res.json({ success: true, studyPlan });
});

app.post('/api/study-plan/toggle-task', (req, res) => {
  const db = getDatabase();
  const { dayNumber, taskId } = req.body;

  if (!db.studyPlan) {
    return res.status(404).json({ error: 'No study plan active' });
  }

  const day = db.studyPlan.days.find(d => d.dayNumber === dayNumber);
  if (!day) {
    return res.status(404).json({ error: 'Day not found' });
  }

  const task = day.tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.completed = !task.completed;
  if (task.completed) {
    db.userStats.xp += 10;
  }

  saveDatabase(db);
  res.json({ success: true, studyPlan: db.studyPlan, xp: db.userStats.xp });
});

// 7. GET / POST Transcripts & Audio Study Notes
app.get('/api/transcripts', (req, res) => {
  const db = getDatabase();
  const { q } = req.query;

  let list = db.transcripts || [];
  if (q && typeof q === 'string') {
    const search = q.toLowerCase();
    list = list.filter(item =>
      item.title.toLowerCase().includes(search) ||
      item.transcript.toLowerCase().includes(search) ||
      item.summary.toLowerCase().includes(search) ||
      item.keyTerms.some(term => term.toLowerCase().includes(search))
    );
  }

  res.json({ success: true, transcripts: list });
});

// Transcribe audio using gemini-3.5-transcribe and extract structured study notes
app.post('/api/transcripts/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType, title, category } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required (base64 string)' });
    }

    // Call Gemini 3.5 Transcribe model
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioData,
      },
    };

    console.log('Sending audio to gemini-3.5-transcribe...');
    const transcribeResponse = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this spoken audio verbatim. Return only the accurate transcription of the speaker.' }
        ]
      }
    });

    const transcriptText = transcribeResponse.text || 'No speech detected.';

    // Now call gemini-3.8-flash to structure the transcript into study takeaways
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert Microsoft Azure Certified Trainer (AZ-900).
Analyze the following transcribed study notes:
"""
${transcriptText}
"""

Return a valid JSON object with:
{
  "summary": "2-3 concise sentences summarizing the cloud concepts discussed",
  "keyTerms": ["list of 3-5 Azure keywords or services mentioned"],
  "examTips": ["3 high-yield bullet tips for the AZ-900 exam based on this transcript"]
}`,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let structuredAnalysis = {
      summary: 'Transcript captured successfully.',
      keyTerms: ['Azure Fundamentals', 'AZ-900'],
      examTips: ['Review official Microsoft Learn docs for deeper dive.']
    };

    try {
      if (analysisResponse.text) {
        structuredAnalysis = JSON.parse(analysisResponse.text);
      }
    } catch (e) {
      console.warn('Could not parse analysis JSON:', e);
    }

    const db = getDatabase();
    const newNote: StudyNote = {
      id: 'note-' + Date.now(),
      title: title || `Audio Study Note (${new Date().toLocaleDateString()})`,
      category: category || 'Domain: Audio Revision',
      timestamp: Date.now(),
      durationSeconds: Math.round(audioData.length / 16000),
      transcript: transcriptText,
      summary: structuredAnalysis.summary || 'Summary generated from audio.',
      keyTerms: structuredAnalysis.keyTerms || ['AZ-900'],
      examTips: structuredAnalysis.examTips || ['Study the concepts mentioned in this audio note.'],
      isStarred: false
    };

    if (!db.transcripts) db.transcripts = [];
    db.transcripts.unshift(newNote);
    db.userStats.xp += 50;

    saveDatabase(db);

    res.json({ success: true, note: newNote });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: 'Audio transcription failed. Please verify audio quality.',
      details: error?.message || String(error)
    });
  }
});

// Toggle star on study note
app.post('/api/transcripts/:id/star', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const note = db.transcripts?.find(n => n.id === id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  note.isStarred = !note.isStarred;
  saveDatabase(db);
  res.json({ success: true, note });
});

// Delete note
app.delete('/api/transcripts/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  if (!db.transcripts) return res.status(404).json({ error: 'Note not found' });
  db.transcripts = db.transcripts.filter(n => n.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// 8. POST AI Study Buddy & Concept Explainer
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, conversationHistory } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemInstruction = `You are "AzureVibe AI Coach" — a charismatic, world-class Microsoft Certified Azure Trainer helping developers in the #1MillionDevs Movement pass the AZ-900 exam with flying colors!

Tone & Rules:
1. Warm, encouraging, crystal-clear, and structured.
2. ALWAYS use relatable, concrete real-world analogies (e.g. comparing elasticity to ride-hailing/Uber fleets, CapEx vs OpEx to owning a car vs riding an e-scooter/Uber, high availability to dual power generators in hospitals, shared responsibility to renting an unfurnished apartment, M-Pesa or mobile money scaling).
3. Clearly state WHICH AZ-900 official domain this question falls under:
   - Domain 1: Cloud Concepts
   - Domain 2: Azure Architecture & Services
   - Domain 3: Azure Management & Governance
4. Give a "⚠️ Common Exam Trap" warning so students don't get tricked on the actual exam.
5. Provide a memorable 1-sentence mnemonic or mental model.
6. Format clearly with markdown headers, bullet points, and bold keywords.`;

    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach((msg: { role: 'user' | 'model'; text: string }) => {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'Sorry, I could not generate an answer right now.';
    res.json({ success: true, answer: reply });
  } catch (err: any) {
    console.error('AI Ask error:', err);
    res.status(500).json({
      error: 'AI Study Coach is currently unavailable. Please try again.',
      details: err?.message || String(err)
    });
  }
});

// 9. POST Generate Custom Practice Question on Weak Topic
app.post('/api/ai/generate-question', async (req, res) => {
  try {
    const { topic, domain } = req.body;

    const prompt = `Create 1 authentic, exam-standard multiple-choice question for the Microsoft Azure Fundamentals AZ-900 exam.
Target Topic: ${topic || 'Availability Zones and SLAs'}
Target Domain: ${domain || 'architecture'}

Requirements:
- Must have a realistic business or technical scenario.
- Exactly 4 options (A, B, C, D) with ONLY 1 correct option.
- Provide a clear, concise "whyRight" explanation for the correct choice.
- Provide clear "whyWrong" explanations for EACH of the three incorrect options explaining why they are distractors.
- Include a memorable real-world analogy (e.g. ride-hailing, electricity grid, mobile money, rental property).
- Include reference to Microsoft Learn.

Return in JSON format matching this schema:
{
  "domain": "${domain || 'architecture'}",
  "domainTitle": "Official Domain Title",
  "topic": "${topic || 'Azure Architecture'}",
  "subtopic": "Subtopic",
  "difficulty": "exam-ready",
  "scenario": "A financial enterprise is planning...",
  "question": "Which service...",
  "options": [
    { "id": "opt-a", "text": "Option A text", "isCorrect": true, "explanation": "Why A is right" },
    { "id": "opt-b", "text": "Option B text", "isCorrect": false, "explanation": "Why B is wrong" },
    { "id": "opt-c", "text": "Option C text", "isCorrect": false, "explanation": "Why C is wrong" },
    { "id": "opt-d", "text": "Option D text", "isCorrect": false, "explanation": "Why D is wrong" }
  ],
  "whyRight": "Detailed explanation why the correct option is right",
  "whyWrong": [
    { "optionId": "opt-b", "optionText": "Option B text", "reason": "Why B is a distractor" },
    { "optionId": "opt-c", "optionText": "Option C text", "reason": "Why C is a distractor" },
    { "optionId": "opt-d", "optionText": "Option D text", "reason": "Why D is a distractor" }
  ],
  "analogy": "Real-world analogy comparing this to daily life",
  "officialLearnRef": "Microsoft Learn AZ-900 module"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('Empty response from model');
    }

    const generatedQuestion: Question = JSON.parse(response.text);
    generatedQuestion.id = 'ai-gen-' + Date.now();

    // Optionally append to DB question bank so user can revisit it
    const db = getDatabase();
    db.questions.push(generatedQuestion);
    saveDatabase(db);

    res.json({ success: true, question: generatedQuestion });
  } catch (err: any) {
    console.error('Generate Question error:', err);
    res.status(500).json({
      error: 'Failed to generate custom question',
      details: err?.message || String(err)
    });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PROD SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AzureVibe server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
