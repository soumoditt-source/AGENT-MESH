// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice ERC-8004 compatible on-chain registry for AgentMesh autonomous agents.
 *         Each registered agent gets a unique token ID linked to its agent card URL.
 *         Self-registration happens autonomously via facinet.executeContract() — no human required.
 */
contract AgentRegistry {
    struct Agent {
        address owner;
        string  agentUrl;
        string  agentCard;
        uint256 registeredAt;
        uint256 totalQueries;
        bool    active;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => Agent)    public agents;
    mapping(address => uint256)  public ownerToTokenId;
    mapping(address => uint256[]) public ownerAgents;

    event AgentRegistered(uint256 indexed tokenId, address indexed owner, string agentUrl);
    event AgentUpdated(uint256 indexed tokenId, string agentCard);
    event QueryRecorded(uint256 indexed tokenId, uint256 totalQueries);

    /**
     * @notice Register a new agent. Called autonomously by AgentMesh via facinet.executeContract()
     * @param agentUrl URL pointing to the agent's capability card JSON
     * @return tokenId Unique ERC-8004 token ID for this agent
     */
    function register(string calldata agentUrl) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        agents[tokenId] = Agent({
            owner:        msg.sender,
            agentUrl:     agentUrl,
            agentCard:    "",
            registeredAt: block.timestamp,
            totalQueries: 0,
            active:       true
        });
        ownerToTokenId[msg.sender]   = tokenId;
        ownerAgents[msg.sender].push(tokenId);
        emit AgentRegistered(tokenId, msg.sender, agentUrl);
        return tokenId;
    }

    /**
     * @notice Update the agent card JSON (capability metadata)
     */
    function setAgentCard(uint256 tokenId, string calldata card) external {
        require(agents[tokenId].owner == msg.sender, "AgentRegistry: not owner");
        agents[tokenId].agentCard = card;
        emit AgentUpdated(tokenId, card);
    }

    /**
     * @notice Record a research query — called by agent to track usage on-chain
     */
    function recordQuery() external {
        uint256 tokenId = ownerToTokenId[msg.sender];
        require(tokenId != 0, "AgentRegistry: agent not registered");
        agents[tokenId].totalQueries++;
        emit QueryRecorded(tokenId, agents[tokenId].totalQueries);
    }

    /**
     * @notice Deactivate an agent (owner only)
     */
    function deactivate(uint256 tokenId) external {
        require(agents[tokenId].owner == msg.sender, "AgentRegistry: not owner");
        agents[tokenId].active = false;
    }

    // ── View functions ──────────────────────────────────────────────────────

    function getAgent(uint256 tokenId)
        external view
        returns (address owner, string memory agentUrl, string memory agentCard,
                 uint256 registeredAt, uint256 totalQueries, bool active)
    {
        Agent memory a = agents[tokenId];
        return (a.owner, a.agentUrl, a.agentCard, a.registeredAt, a.totalQueries, a.active);
    }

    function getAgentByOwner(address owner)
        external view
        returns (uint256 tokenId, string memory agentUrl, bool active)
    {
        uint256 id = ownerToTokenId[owner];
        return (id, agents[id].agentUrl, agents[id].active);
    }

    function getOwnerAgents(address owner) external view returns (uint256[] memory) {
        return ownerAgents[owner];
    }

    function totalAgents() external view returns (uint256) {
        return nextTokenId - 1;
    }
}
