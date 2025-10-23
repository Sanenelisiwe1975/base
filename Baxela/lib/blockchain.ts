import { createPublicClient, createWalletClient, http, parseAbi, formatEther, parseEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { WalletClient } from 'viem';

// Contract ABI (simplified for the main functions we need)
const INCIDENT_REGISTRY_ABI = parseAbi([
  'function reportIncident(string memory _ipfsHash, string memory _title, string memory _description, uint8 _category, uint8 _severity, int256 _latitude, int256 _longitude, string[] memory _mediaHashes) external returns (uint256)',
  'function verifyIncident(uint256 _incidentId) external',
  'function updateIncidentStatus(uint256 _incidentId, uint8 _newStatus) external',
  'function getIncident(uint256 _incidentId) external view returns (uint256 id, address reporter, string memory ipfsHash, string memory title, string memory description, uint8 category, uint8 severity, uint8 status, int256 latitude, int256 longitude, uint256 timestamp, uint256 blockNumber, bool isActive, uint256 verificationCount)',
  'function getIncidentMedia(uint256 _incidentId) external view returns (string[] memory)',
  'function getIncidentsByReporter(address _reporter) external view returns (uint256[] memory)',
  'function getTotalIncidents() external view returns (uint256)',
  'function getIncidentsInRange(uint256 _start, uint256 _limit) external view returns (uint256[] memory)',
  'function hasVerified(uint256 _incidentId, address _verifier) external view returns (bool)',
  'function getLocationIncidentCount(int256 _latitude, int256 _longitude) external view returns (uint256)',
  'event IncidentReported(uint256 indexed incidentId, address indexed reporter, string ipfsHash, uint8 category, uint8 severity, int256 latitude, int256 longitude, uint256 timestamp)',
  'event IncidentVerified(uint256 indexed incidentId, address indexed verifier, uint256 verificationCount)',
  'event IncidentStatusUpdated(uint256 indexed incidentId, uint8 oldStatus, uint8 newStatus, address updatedBy)'
]);

// Contract address (will be set after deployment)
const INCIDENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_INCIDENT_REGISTRY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

// Use Base Sepolia for development, Base mainnet for production
const chain = process.env.NODE_ENV === 'production' ? base : baseSepolia;

// Public client for reading from the blockchain
const publicClient = createPublicClient({
  chain,
  transport: http()
});

// Enums matching the smart contract
export enum IncidentCategory {
  ACCIDENT = 0,
  CRIME = 1,
  FIRE = 2,
  MEDICAL = 3,
  NATURAL_DISASTER = 4,
  INFRASTRUCTURE = 5,
  ENVIRONMENTAL = 6,
  OTHER = 7
}

export enum IncidentSeverity {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}

export enum IncidentStatus {
  REPORTED = 0,
  VERIFIED = 1,
  RESOLVED = 2,
  DISMISSED = 3
}

export interface BlockchainIncident {
  id: bigint;
  reporter: string;
  ipfsHash: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: bigint;
  longitude: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  isActive: boolean;
  verificationCount: bigint;
  mediaHashes?: string[];
}

export interface ReportIncidentParams {
  ipfsHash: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
  mediaHashes: string[];
}

class BlockchainService {
  private contractAddress: `0x${string}`;

  constructor() {
    this.contractAddress = INCIDENT_REGISTRY_ADDRESS;
  }

  /**
   * Set the contract address (useful for testing or after deployment)
   */
  setContractAddress(address: string) {
    this.contractAddress = address as `0x${string}`;
  }

  /**
   * Convert decimal coordinates to fixed-point integers (multiply by 1e6)
   */
  private coordinateToFixedPoint(coordinate: number): bigint {
    return BigInt(Math.round(coordinate * 1000000));
  }

  /**
   * Convert fixed-point integers back to decimal coordinates
   */
  private fixedPointToCoordinate(fixedPoint: bigint): number {
    return Number(fixedPoint) / 1000000;
  }

  /**
   * Report a new incident to the blockchain
   */
  async reportIncident(
    walletClient: WalletClient,
    params: ReportIncidentParams
  ): Promise<{ hash: string; incidentId?: bigint }> {
    try {
      if (!walletClient.account) {
        throw new Error('Wallet not connected');
      }

      const latitudeFixed = this.coordinateToFixedPoint(params.latitude);
      const longitudeFixed = this.coordinateToFixedPoint(params.longitude);

      const { request } = await publicClient.simulateContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'reportIncident',
        args: [
          params.ipfsHash,
          params.title,
          params.description,
          params.category,
          params.severity,
          latitudeFixed,
          longitudeFixed,
          params.mediaHashes
        ],
        account: walletClient.account
      });

      const hash = await walletClient.writeContract(request);

      // Wait for transaction receipt to get the incident ID from events
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Parse the IncidentReported event to get the incident ID
      let incidentId: bigint | undefined;
      for (const log of receipt.logs) {
        try {
          const decoded = publicClient.parseEventLogs({
            abi: INCIDENT_REGISTRY_ABI,
            logs: [log]
          });
          
          if (decoded.length > 0 && decoded[0].eventName === 'IncidentReported') {
            incidentId = decoded[0].args.incidentId as bigint;
            break;
          }
        } catch (error) {
          // Continue to next log if parsing fails
          continue;
        }
      }

      return { hash, incidentId };
    } catch (error) {
      console.error('Error reporting incident to blockchain:', error);
      throw error;
    }
  }

  /**
   * Verify an incident
   */
  async verifyIncident(
    walletClient: WalletClient,
    incidentId: bigint
  ): Promise<string> {
    try {
      if (!walletClient.account) {
        throw new Error('Wallet not connected');
      }

      const { request } = await publicClient.simulateContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'verifyIncident',
        args: [incidentId],
        account: walletClient.account
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });

      return hash;
    } catch (error) {
      console.error('Error verifying incident:', error);
      throw error;
    }
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    walletClient: WalletClient,
    incidentId: bigint,
    newStatus: IncidentStatus
  ): Promise<string> {
    try {
      if (!walletClient.account) {
        throw new Error('Wallet not connected');
      }

      const { request } = await publicClient.simulateContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'updateIncidentStatus',
        args: [incidentId, newStatus],
        account: walletClient.account
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });

      return hash;
    } catch (error) {
      console.error('Error updating incident status:', error);
      throw error;
    }
  }

  /**
   * Get incident details by ID
   */
  async getIncident(incidentId: bigint): Promise<BlockchainIncident | null> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'getIncident',
        args: [incidentId]
      }) as [bigint, string, string, string, string, number, number, number, bigint, bigint, bigint, bigint, boolean, bigint];

      const mediaHashes = await publicClient.readContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'getIncidentMedia',
        args: [incidentId]
      }) as string[];

      return {
        id: result[0],
        reporter: result[1],
        ipfsHash: result[2],
        title: result[3],
        description: result[4],
        category: result[5] as IncidentCategory,
        severity: result[6] as IncidentSeverity,
        status: result[7] as IncidentStatus,
        latitude: result[8],
        longitude: result[9],
        timestamp: result[10],
        blockNumber: result[11],
        isActive: result[12],
        verificationCount: result[13],
        mediaHashes
      };
    } catch (error) {
      console.error('Error getting incident:', error);
      return null;
    }
  }

  /**
   * Get incidents by reporter address
   */
  async getIncidentsByReporter(reporter: string): Promise<bigint[]> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'getIncidentsByReporter',
        args: [reporter as `0x${string}`]
      }) as bigint[];

      return result;
    } catch (error) {
      console.error('Error getting incidents by reporter:', error);
      return [];
    }
  }

  /**
   * Get total number of incidents
   */
  async getTotalIncidents(): Promise<bigint> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'getTotalIncidents'
      }) as bigint;

      return result;
    } catch (error) {
      console.error('Error getting total incidents:', error);
      return BigInt(0);
    }
  }

  /**
   * Get incidents in a range
   */
  async getIncidentsInRange(start: bigint, limit: bigint): Promise<bigint[]> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'getIncidentsInRange',
        args: [start, limit]
      }) as bigint[];

      return result;
    } catch (error) {
      console.error('Error getting incidents in range:', error);
      return [];
    }
  }

  /**
   * Check if an address has verified an incident
   */
  async hasVerified(incidentId: bigint, verifier: string): Promise<boolean> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'hasVerified',
        args: [incidentId, verifier as `0x${string}`]
      }) as boolean;

      return result;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  }

  /**
   * Get incident count at a specific location
   */
  async getLocationIncidentCount(latitude: number, longitude: number): Promise<bigint> {
    try {
      const latitudeFixed = this.coordinateToFixedPoint(latitude);
      const longitudeFixed = this.coordinateToFixedPoint(longitude);

      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: INCIDENT_REGISTRY_ABI,
        functionName: 'getLocationIncidentCount',
        args: [latitudeFixed, longitudeFixed]
      }) as bigint;

      return result;
    } catch (error) {
      console.error('Error getting location incident count:', error);
      return BigInt(0);
    }
  }

  /**
   * Get all incidents with pagination
   */
  async getAllIncidents(page: number = 1, pageSize: number = 50): Promise<BlockchainIncident[]> {
    try {
      const totalIncidents = await this.getTotalIncidents();
      if (totalIncidents === BigInt(0)) {
        return [];
      }

      const start = BigInt((page - 1) * pageSize + 1);
      const limit = BigInt(pageSize);

      const incidentIds = await this.getIncidentsInRange(start, limit);
      const incidents: BlockchainIncident[] = [];

      for (const id of incidentIds) {
        const incident = await this.getIncident(id);
        if (incident) {
          incidents.push(incident);
        }
      }

      return incidents;
    } catch (error) {
      console.error('Error getting all incidents:', error);
      return [];
    }
  }

  /**
   * Convert blockchain incident to map incident format
   */
  convertToMapIncident(blockchainIncident: BlockchainIncident): any {
    return {
      id: blockchainIncident.id.toString(),
      metadata: {
        title: blockchainIncident.title,
        description: blockchainIncident.description,
        category: Object.keys(IncidentCategory)[blockchainIncident.category].toLowerCase(),
        severity: Object.keys(IncidentSeverity)[blockchainIncident.severity].toLowerCase(),
        timestamp: new Date(Number(blockchainIncident.timestamp) * 1000).toISOString(),
        location: {
          latitude: this.fixedPointToCoordinate(blockchainIncident.latitude),
          longitude: this.fixedPointToCoordinate(blockchainIncident.longitude)
        },
        reporter: {
          address: blockchainIncident.reporter
        },
        blockchain: {
          incidentId: blockchainIncident.id.toString(),
          blockNumber: blockchainIncident.blockNumber.toString(),
          verificationCount: Number(blockchainIncident.verificationCount),
          status: Object.keys(IncidentStatus)[blockchainIncident.status].toLowerCase(),
          isActive: blockchainIncident.isActive
        }
      },
      ipfsHash: blockchainIncident.ipfsHash,
      mediaHashes: blockchainIncident.mediaHashes || []
    };
  }

  /**
   * Listen to incident events
   */
  watchIncidentEvents(callback: (event: any) => void) {
    return publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: INCIDENT_REGISTRY_ABI,
      eventName: 'IncidentReported',
      onLogs: (logs) => {
        logs.forEach((log) => {
          callback({
            type: 'IncidentReported',
            data: log.args
          });
        });
      }
    });
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Export types and enums
export type { BlockchainIncident, ReportIncidentParams };