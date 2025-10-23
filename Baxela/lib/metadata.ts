import { IncidentReport } from '@/components/IncidentReportForm';

export interface FileMetadata {
  filename: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  reporter: {
    address: string;
    timestamp: number;
  };
  hash?: string;
  ipfsUrl?: string;
}

export interface IncidentMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  reporter: {
    address: string;
    timestamp: number;
  };
  files: FileMetadata[];
  createdAt: string;
  updatedAt: string;
  ipfsHash?: string;
  blockchainTxHash?: string;
  status: 'draft' | 'submitted' | 'verified' | 'resolved';
}

class MetadataService {
  /**
   * Generate unique ID for incident
   */
  generateIncidentId(): string {
    return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique ID for file
   */
  generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create metadata for a single file
   */
  createFileMetadata(
    file: File,
    location: { latitude: number; longitude: number },
    reporterAddress: string,
    hash?: string,
    ipfsUrl?: string
  ): FileMetadata {
    return {
      filename: this.generateFileId(),
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: this.getCurrentLocationAccuracy()
      },
      reporter: {
        address: reporterAddress,
        timestamp: Date.now()
      },
      hash,
      ipfsUrl
    };
  }

  /**
   * Create comprehensive metadata for an incident report
   */
  createIncidentMetadata(
    report: IncidentReport,
    fileMetadata: FileMetadata[],
    ipfsHash?: string,
    blockchainTxHash?: string
  ): IncidentMetadata {
    const now = new Date().toISOString();
    
    return {
      id: this.generateIncidentId(),
      title: report.title,
      description: report.description,
      category: report.category,
      severity: report.severity,
      location: {
        latitude: report.location.latitude,
        longitude: report.location.longitude,
        address: report.location.address
      },
      reporter: {
        address: report.reporterAddress,
        timestamp: report.timestamp
      },
      files: fileMetadata,
      createdAt: now,
      updatedAt: now,
      ipfsHash,
      blockchainTxHash,
      status: 'submitted'
    };
  }

  /**
   * Add geolocation metadata to existing data
   */
  async addLocationMetadata(
    metadata: any,
    location: { latitude: number; longitude: number }
  ): Promise<any> {
    try {
      // Try to get address from coordinates using reverse geocoding
      const address = await this.reverseGeocode(location.latitude, location.longitude);
      
      return {
        ...metadata,
        location: {
          ...location,
          address,
          accuracy: this.getCurrentLocationAccuracy(),
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.warn('Failed to add address to location metadata:', error);
      return {
        ...metadata,
        location: {
          ...location,
          accuracy: this.getCurrentLocationAccuracy(),
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * Add timestamp metadata
   */
  addTimestampMetadata(metadata: any): any {
    const now = new Date();
    
    return {
      ...metadata,
      timestamps: {
        created: now.toISOString(),
        createdUnix: now.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utcOffset: now.getTimezoneOffset()
      }
    };
  }

  /**
   * Add user/reporter metadata
   */
  addReporterMetadata(metadata: any, reporterAddress: string): any {
    return {
      ...metadata,
      reporter: {
        address: reporterAddress,
        reportedAt: Date.now(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        platform: typeof window !== 'undefined' ? window.navigator.platform : 'Unknown'
      }
    };
  }

  /**
   * Create comprehensive metadata package
   */
  createComprehensiveMetadata(
    report: IncidentReport,
    fileHashes: string[] = []
  ): any {
    const baseMetadata = {
      incident: {
        id: this.generateIncidentId(),
        title: report.title,
        description: report.description,
        category: report.category,
        severity: report.severity
      },
      files: report.files.map((file, index) => ({
        id: this.generateFileId(),
        name: file.name,
        size: file.size,
        type: file.type,
        hash: fileHashes[index] || null
      }))
    };

    // Add all metadata layers
    let enrichedMetadata = this.addTimestampMetadata(baseMetadata);
    enrichedMetadata = this.addReporterMetadata(enrichedMetadata, report.reporterAddress);
    
    // Add location metadata
    enrichedMetadata.location = {
      latitude: report.location.latitude,
      longitude: report.location.longitude,
      address: report.location.address,
      accuracy: this.getCurrentLocationAccuracy(),
      timestamp: Date.now()
    };

    return enrichedMetadata;
  }

  /**
   * Reverse geocode coordinates to get address
   */
  private async reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'IncidentReportingApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return undefined;
    }
  }

  /**
   * Get current location accuracy (mock implementation)
   */
  private getCurrentLocationAccuracy(): number {
    // In a real implementation, this would come from the geolocation API
    return 10; // meters
  }

  /**
   * Validate metadata completeness
   */
  validateMetadata(metadata: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!metadata.incident?.id) errors.push('Missing incident ID');
    if (!metadata.incident?.title) errors.push('Missing incident title');
    if (!metadata.incident?.category) errors.push('Missing incident category');
    if (!metadata.location?.latitude) errors.push('Missing location latitude');
    if (!metadata.location?.longitude) errors.push('Missing location longitude');
    if (!metadata.reporter?.address) errors.push('Missing reporter address');
    if (!metadata.timestamps?.created) errors.push('Missing creation timestamp');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export metadata as JSON string
   */
  exportMetadata(metadata: any): string {
    return JSON.stringify(metadata, null, 2);
  }

  /**
   * Import metadata from JSON string
   */
  importMetadata(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Invalid metadata JSON format');
    }
  }

  /**
   * Create metadata hash for integrity verification
   */
  async createMetadataHash(metadata: any): Promise<string> {
    const metadataString = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const data = encoder.encode(metadataString);
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for environments without crypto.subtle
      return btoa(metadataString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
    }
  }
}

// Export singleton instance
export const metadataService = new MetadataService();

// Export utility functions
export const createFileMetadata = (
  file: File,
  location: { latitude: number; longitude: number },
  reporterAddress: string,
  hash?: string,
  ipfsUrl?: string
) => metadataService.createFileMetadata(file, location, reporterAddress, hash, ipfsUrl);

export const createIncidentMetadata = (
  report: IncidentReport,
  fileMetadata: FileMetadata[],
  ipfsHash?: string,
  blockchainTxHash?: string
) => metadataService.createIncidentMetadata(report, fileMetadata, ipfsHash, blockchainTxHash);

export const createComprehensiveMetadata = (
  report: IncidentReport,
  fileHashes?: string[]
) => metadataService.createComprehensiveMetadata(report, fileHashes);

export const validateMetadata = (metadata: any) => metadataService.validateMetadata(metadata);

export const exportMetadata = (metadata: any) => metadataService.exportMetadata(metadata);

export const importMetadata = (jsonString: string) => metadataService.importMetadata(jsonString);

export const createMetadataHash = (metadata: any) => metadataService.createMetadataHash(metadata);