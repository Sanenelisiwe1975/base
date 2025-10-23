

# 🗳️ Election Monitoring System (Baxela)

> **Transparent, tamper-proof citizen reporting for fair elections — powered by Base.**

---

## 📖 Overview

**Baxela** is a decentralized election monitoring platform that empowers citizens to **report, verify, and visualize election incidents in real time**.
By using **blockchain transparency** and **community verification**, it ensures that no report can be deleted, censored, or manipulated — creating an open record of electoral integrity.

---

## 🚀 Features

### 🧾 Incident Reporting

* Citizens can upload **photos/videos** of election-related incidents.
* Reports include **GPS coordinates**, **timestamps**, **severity**, and **incident type** (e.g. vote buying, intimidation, tampering).
* Data stored on **IPFS/Arweave**, with proof registered **on Base**.

### ✅ Verification & Reputation

* Reports are **community-verified** through upvotes/downvotes and observer validation.
* Reporters gain **reputation points/NFT badges** for accuracy.
* AI-assisted checks help detect duplicates or AI-generated content.

### 🗺️ Transparency Dashboard

* **Interactive heatmap** showing incidents by region and severity.
* **Filters** for report type, date, and verification status.
* **Election Integrity Score** generated per district.

### 🏛️ Governance & DAO

* A DAO of verified observers and citizens manages:

  * Dispute resolution
  * Slashed/staked report deposits
  * Platform updates and community rewards

---

## 🧠 Architecture

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| Blockchain       | **Base** (Ethereum L2)                                 |
| Smart Contracts  | Solidity                                               |
| Storage          | **IPFS / Arweave** for media                           |
| Identity         | **Lens / Ceramic / Soulbound Tokens (SBTs)**           |
| Frontend         | Next.js + TailwindCSS + Base Account SDK               |
| Backend          | Node.js + GraphQL Indexer                              |
| AI Tools         | Deepfake detection (Replicate API), NLP classification |
| GPS Verification | H3 spatial hashing / GeoDID proofs                     |

---

## 🧩 Smart Contract Modules

| Contract             | Function                                    |
| -------------------- | ------------------------------------------- |
| `ReportRegistry.sol` | Stores immutable incident hashes + metadata |
| `Reputation.sol`     | Tracks reporter credibility                 |
| `StakeManager.sol`   | Handles stake-to-report + slashing          |
| `DAO.sol`            | Manages governance proposals and funds      |

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js v18+
* npm / yarn
* Base Account for authentication
* Base testnet RPC endpoint

### Steps

```bash
# Clone the repo
git clone https://github.com/<yourusername>/election-monitoring-system.git
cd election-monitoring-system

# Install dependencies
npm install

# Run local dev server
npm run dev
```

Then open:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧪 Environment Variables

Create a `.env.local` file and set:

```
NEXT_PUBLIC_BASE_RPC_URL=<your_base_testnet_rpc>
NEXT_PUBLIC_PINATA_API_KEY=<your_ipfs_key>
NEXT_PUBLIC_REPLICATE_API_TOKEN=<optional_for_ai_validation>
```

---

## 🔒 Security & Anti-Abuse

* Immutable reports (onchain + IPFS)
* Stake-to-report model to reduce spam
* AI & community-based report verification
* Privacy-preserving pseudonymous IDs (no personal data onchain)

---

## 🌍 Future Roadmap

* ✅ MVP for Base testnet
* 🔜 Onchain DAO launch
* 🔜 Mobile dApp (React Native + Base SDK)
* 🔜 Integration with civic tech NGOs & media dashboards

---

## 🤝 Contributing

Contributions, feedback, and ideas are welcome!
Fork the repo, make a PR, or join the discussion via the DAO once live.

---

## 📜 License

MIT License — feel free to build, remix, and deploy responsibly.

---

## 💬 Contact

**Project Lead:** Sanelisiwe Matu
📧 Email: [[sanelisiwesimatu@gmail.com](mailto:sanelisiwesimatu@gmail.com)]
🌐 Twitter / X: @nelliesmart
🔗 Built for **Base Builders Batch 002**

