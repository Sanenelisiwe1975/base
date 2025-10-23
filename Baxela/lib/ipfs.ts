import { IncidentReport } from '@/components/IncidentReportForm';

// IPFS configuration
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const PINATA_API_URL = 'https://api.pinata.cloud';

export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}

export interface IPFSMetadata {
  name: string;
  description: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  reporterAddress: string;
  category: string;
  severity: string;
  fileHashes: string[];
}

class IPFSService {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
    this.apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || '';
  }

  /**
   * Upload a single file to IPFS via Pinata
   */
  async uploadFile(file: File): Promise<IPFSUploadResult> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('IPFS credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size.toString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Add options
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);

    try {
      const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        hash: result.IpfsHash,
        url: `${IPFS_GATEWAY}${result.IpfsHash}`,
        size: result.PinSize
      };
    } catch (error) {
      console.error('IPFS file upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  /**
   * Upload multiple files to IPFS
   */
  async uploadFiles(files: File[]): Promise<IPFSUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any, filename: string = 'data.json'): Promise<IPFSUploadResult> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('IPFS credentials not configured');
    }

    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const file = new File([jsonBlob], filename, { type: 'application/json' });

    return this.uploadFile(file);
  }

  /**
   * Create metadata with location and timestamp imprinting
   */
  createMetadata(report: IncidentReport, fileHashes: string[]): IPFSMetadata {
    return {
      name: report.title,
      description: report.description,
      timestamp: report.timestamp,
      location: report.location,
      reporterAddress: report.reporterAddress,
      category: report.category,
      severity: report.severity,
      fileHashes
    };
  }

  /**
   * Upload complete incident report to IPFS
   */
  async uploadIncidentReport(report: IncidentReport): Promise<{
    reportHash: string;
    reportUrl: string;
    fileHashes: string[];
    metadata: IPFSMetadata;
  }> {
    try {
      // Upload files first
      const fileResults = await this.uploadFiles(report.files);
      const fileHashes = fileResults.map(result => result.hash);

      // Create metadata with file hashes
      const metadata = this.createMetadata(report, fileHashes);

      // Upload metadata as JSON
      const metadataResult = await this.uploadJSON(metadata, `incident-${report.timestamp}.json`);

      return {
        reportHash: metadataResult.hash,
        reportUrl: metadataResult.url,
        fileHashes,
        metadata
      };
    } catch (error) {
      console.error('Failed to upload incident report to IPFS:', error);
      throw error;
    }
  }

  /**
   * Retrieve data from IPFS
   */
  async retrieveFromIPFS(hash: string): Promise<any> {
    try {
      const response = await fetch(`${IPFS_GATEWAY}${hash}`);
      
      if (!response.ok) {
        throw new Error(`Failed to retrieve from IPFS: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.blob();
      }
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw new Error('Failed to retrieve data from IPFS');
    }
  }

  /**
   * Get IPFS URL for a hash
   */
  getIPFSUrl(hash: string): string {
    return `${IPFS_GATEWAY}${hash}`;
  }

  /**
   * Pin existing content to ensure persistence
   */
  async pinByHash(hash: string, name?: string): Promise<void> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('IPFS credentials not configured');
    }

    const body = {
      hashToPin: hash,
      pinataMetadata: {
        name: name || `Pinned content ${hash}`,
        keyvalues: {
          pinnedAt: new Date().toISOString()
        }
      }
    };

    try {
      const response = await fetch(`${PINATA_API_URL}/pinning/pinByHash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to pin content: ${response.statusText}`);
      }
    } catch (error) {
      console.error('IPFS pinning error:', error);
      throw new Error('Failed to pin content to IPFS');
    }
  }

  /**
   * List pinned content
   */
  async listPinnedContent(): Promise<any[]> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('IPFS credentials not configured');
    }

    try {
      const response = await fetch(`${PINATA_API_URL}/data/pinList?status=pinned`, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list pinned content: ${response.statusText}`);
      }

      const result = await response.json();
      return result.rows || [];
    } catch (error) {
      console.error('IPFS list error:', error);
      throw new Error('Failed to list pinned content');
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

// Export utility functions
export const uploadToIPFS = (file: File) => ipfsService.uploadFile(file);
export const uploadFilesToIPFS = (files: File[]) => ipfsService.uploadFiles(files);
export const uploadJSONToIPFS = (data: any, filename?: string) => ipfsService.uploadJSON(data, filename);
export const uploadIncidentReport = (report: IncidentReport) => ipfsService.uploadIncidentReport(report);
export const retrieveFromIPFS = (hash: string) => ipfsService.retrieveFromIPFS(hash);
export const getIPFSUrl = (hash: string) => ipfsService.getIPFSUrl(hash);
export const pinToIPFS = (hash: string, name?: string) => ipfsService.pinByHash(hash, name);
export const listPinnedContent = () => ipfsService.listPinnedContent();