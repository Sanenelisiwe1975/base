// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IncidentRegistry
 * @dev Smart contract for registering incident reports on the Base blockchain
 * @notice This contract stores incident metadata and IPFS hashes for decentralized incident reporting
 */
contract IncidentRegistry is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _incidentIds;
    
    // Incident severity levels
    enum Severity { LOW, MEDIUM, HIGH, CRITICAL }
    
    // Incident categories
    enum Category { 
        ACCIDENT, 
        CRIME, 
        FIRE, 
        MEDICAL, 
        NATURAL_DISASTER, 
        INFRASTRUCTURE, 
        ENVIRONMENTAL, 
        OTHER 
    }
    
    // Incident status
    enum Status { REPORTED, VERIFIED, RESOLVED, DISMISSED }
    
    struct Incident {
        uint256 id;
        address reporter;
        string ipfsHash;
        string title;
        string description;
        Category category;
        Severity severity;
        Status status;
        int256 latitude;  // Stored as fixed-point (multiply by 1e6)
        int256 longitude; // Stored as fixed-point (multiply by 1e6)
        uint256 timestamp;
        uint256 blockNumber;
        bool isActive;
        string[] mediaHashes; // IPFS hashes for images/videos
        uint256 verificationCount;
        mapping(address => bool) verifiedBy;
    }
    
    // Storage
    mapping(uint256 => Incident) public incidents;
    mapping(address => uint256[]) public reporterIncidents;
    mapping(bytes32 => uint256) public locationIncidents; // location hash => incident count
    
    // Events
    event IncidentReported(
        uint256 indexed incidentId,
        address indexed reporter,
        string ipfsHash,
        Category category,
        Severity severity,
        int256 latitude,
        int256 longitude,
        uint256 timestamp
    );
    
    event IncidentVerified(
        uint256 indexed incidentId,
        address indexed verifier,
        uint256 verificationCount
    );
    
    event IncidentStatusUpdated(
        uint256 indexed incidentId,
        Status oldStatus,
        Status newStatus,
        address updatedBy
    );
    
    event IncidentDeactivated(
        uint256 indexed incidentId,
        address deactivatedBy
    );
    
    // Modifiers
    modifier incidentExists(uint256 _incidentId) {
        require(_incidentId > 0 && _incidentId <= _incidentIds.current(), "Incident does not exist");
        _;
    }
    
    modifier onlyReporter(uint256 _incidentId) {
        require(incidents[_incidentId].reporter == msg.sender, "Only reporter can perform this action");
        _;
    }
    
    modifier incidentActive(uint256 _incidentId) {
        require(incidents[_incidentId].isActive, "Incident is not active");
        _;
    }
    
    /**
     * @dev Report a new incident
     * @param _ipfsHash IPFS hash containing the full incident data
     * @param _title Brief title of the incident
     * @param _description Short description of the incident
     * @param _category Category of the incident
     * @param _severity Severity level of the incident
     * @param _latitude Latitude coordinate (multiplied by 1e6)
     * @param _longitude Longitude coordinate (multiplied by 1e6)
     * @param _mediaHashes Array of IPFS hashes for media files
     */
    function reportIncident(
        string memory _ipfsHash,
        string memory _title,
        string memory _description,
        Category _category,
        Severity _severity,
        int256 _latitude,
        int256 _longitude,
        string[] memory _mediaHashes
    ) external nonReentrant returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_latitude >= -90000000 && _latitude <= 90000000, "Invalid latitude");
        require(_longitude >= -180000000 && _longitude <= 180000000, "Invalid longitude");
        
        _incidentIds.increment();
        uint256 newIncidentId = _incidentIds.current();
        
        Incident storage newIncident = incidents[newIncidentId];
        newIncident.id = newIncidentId;
        newIncident.reporter = msg.sender;
        newIncident.ipfsHash = _ipfsHash;
        newIncident.title = _title;
        newIncident.description = _description;
        newIncident.category = _category;
        newIncident.severity = _severity;
        newIncident.status = Status.REPORTED;
        newIncident.latitude = _latitude;
        newIncident.longitude = _longitude;
        newIncident.timestamp = block.timestamp;
        newIncident.blockNumber = block.number;
        newIncident.isActive = true;
        newIncident.mediaHashes = _mediaHashes;
        newIncident.verificationCount = 0;
        
        // Add to reporter's incidents
        reporterIncidents[msg.sender].push(newIncidentId);
        
        // Update location incident count
        bytes32 locationHash = keccak256(abi.encodePacked(_latitude, _longitude));
        locationIncidents[locationHash]++;
        
        emit IncidentReported(
            newIncidentId,
            msg.sender,
            _ipfsHash,
            _category,
            _severity,
            _latitude,
            _longitude,
            block.timestamp
        );
        
        return newIncidentId;
    }
    
    /**
     * @dev Verify an incident (community verification)
     * @param _incidentId ID of the incident to verify
     */
    function verifyIncident(uint256 _incidentId) 
        external 
        incidentExists(_incidentId) 
        incidentActive(_incidentId) 
    {
        require(incidents[_incidentId].reporter != msg.sender, "Cannot verify own incident");
        require(!incidents[_incidentId].verifiedBy[msg.sender], "Already verified by this address");
        
        incidents[_incidentId].verifiedBy[msg.sender] = true;
        incidents[_incidentId].verificationCount++;
        
        // Auto-verify if enough verifications (e.g., 3)
        if (incidents[_incidentId].verificationCount >= 3 && 
            incidents[_incidentId].status == Status.REPORTED) {
            incidents[_incidentId].status = Status.VERIFIED;
        }
        
        emit IncidentVerified(_incidentId, msg.sender, incidents[_incidentId].verificationCount);
    }
    
    /**
     * @dev Update incident status (only owner or reporter)
     * @param _incidentId ID of the incident
     * @param _newStatus New status for the incident
     */
    function updateIncidentStatus(uint256 _incidentId, Status _newStatus) 
        external 
        incidentExists(_incidentId) 
        incidentActive(_incidentId) 
    {
        require(
            msg.sender == owner() || msg.sender == incidents[_incidentId].reporter,
            "Not authorized to update status"
        );
        
        Status oldStatus = incidents[_incidentId].status;
        incidents[_incidentId].status = _newStatus;
        
        emit IncidentStatusUpdated(_incidentId, oldStatus, _newStatus, msg.sender);
    }
    
    /**
     * @dev Deactivate an incident (only owner)
     * @param _incidentId ID of the incident to deactivate
     */
    function deactivateIncident(uint256 _incidentId) 
        external 
        onlyOwner 
        incidentExists(_incidentId) 
        incidentActive(_incidentId) 
    {
        incidents[_incidentId].isActive = false;
        emit IncidentDeactivated(_incidentId, msg.sender);
    }
    
    /**
     * @dev Get incident details
     * @param _incidentId ID of the incident
     */
    function getIncident(uint256 _incidentId) 
        external 
        view 
        incidentExists(_incidentId) 
        returns (
            uint256 id,
            address reporter,
            string memory ipfsHash,
            string memory title,
            string memory description,
            Category category,
            Severity severity,
            Status status,
            int256 latitude,
            int256 longitude,
            uint256 timestamp,
            uint256 blockNumber,
            bool isActive,
            uint256 verificationCount
        ) 
    {
        Incident storage incident = incidents[_incidentId];
        return (
            incident.id,
            incident.reporter,
            incident.ipfsHash,
            incident.title,
            incident.description,
            incident.category,
            incident.severity,
            incident.status,
            incident.latitude,
            incident.longitude,
            incident.timestamp,
            incident.blockNumber,
            incident.isActive,
            incident.verificationCount
        );
    }
    
    /**
     * @dev Get incident media hashes
     * @param _incidentId ID of the incident
     */
    function getIncidentMedia(uint256 _incidentId) 
        external 
        view 
        incidentExists(_incidentId) 
        returns (string[] memory) 
    {
        return incidents[_incidentId].mediaHashes;
    }
    
    /**
     * @dev Get incidents by reporter
     * @param _reporter Address of the reporter
     */
    function getIncidentsByReporter(address _reporter) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return reporterIncidents[_reporter];
    }
    
    /**
     * @dev Get total number of incidents
     */
    function getTotalIncidents() external view returns (uint256) {
        return _incidentIds.current();
    }
    
    /**
     * @dev Get incidents in a range
     * @param _start Start index (1-based)
     * @param _limit Maximum number of incidents to return
     */
    function getIncidentsInRange(uint256 _start, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(_start > 0, "Start index must be greater than 0");
        require(_limit > 0, "Limit must be greater than 0");
        
        uint256 totalIncidents = _incidentIds.current();
        if (_start > totalIncidents) {
            return new uint256[](0);
        }
        
        uint256 end = _start + _limit - 1;
        if (end > totalIncidents) {
            end = totalIncidents;
        }
        
        uint256 length = end - _start + 1;
        uint256[] memory result = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = _start + i;
        }
        
        return result;
    }
    
    /**
     * @dev Check if an address has verified an incident
     * @param _incidentId ID of the incident
     * @param _verifier Address to check
     */
    function hasVerified(uint256 _incidentId, address _verifier) 
        external 
        view 
        incidentExists(_incidentId) 
        returns (bool) 
    {
        return incidents[_incidentId].verifiedBy[_verifier];
    }
    
    /**
     * @dev Get incident count at a specific location
     * @param _latitude Latitude coordinate (multiplied by 1e6)
     * @param _longitude Longitude coordinate (multiplied by 1e6)
     */
    function getLocationIncidentCount(int256 _latitude, int256 _longitude) 
        external 
        view 
        returns (uint256) 
    {
        bytes32 locationHash = keccak256(abi.encodePacked(_latitude, _longitude));
        return locationIncidents[locationHash];
    }
}