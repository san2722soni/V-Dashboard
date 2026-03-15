export const networkFlowData = {
  nodes: [
    // Main flow nodes
    {
      id: "A",
      title: "UNITY STARTUP",
      subtitle: "GameManager (Awake / Start)",
      content:
        "├─ Loads the map and player scene\n├─ Instantiates networking objects (ClientBehaviour)\n└─ Initializes GameSession (UserID, ports, etc.)",
      category: "Initialization",
      type: "main",
      emoji: "🟩",
      description:
        "Core game initialization system that loads scenes, spawns networking objects, and prepares the GameSession with user credentials.",
      detailedDescription:
        "When Unity launches the scene, GameManager initializes the core systems and spawns the ClientBehaviour object. This process loads the map and player scene, instantiates all necessary networking objects, and sets up the GameSession with user ID, port information, and encryption credentials.",
      functions: ["Awake()", "Start()", "LoadScene()", "SpawnClientBehaviour()", "InitializeGameSession()"],
    },
    {
      id: "B",
      title: "CLIENT NETWORK INIT",
      subtitle: "ClientBehaviour (Awake → InitiateClient)",
      content:
        "├─ Reads IP / Port / Encryption Key\n├─ Calls ➜ StartTCP() (reliable messages)\n├─ Calls ➜ StartUDP() (fast movement packets)\n├─ Starts background tasks:\n│   • ReceiveMessages() → listens on UDP\n│   • NetworkingLoopAsync() → manages queues\n│   • ProcessReceivedMessagesLoopAsync()\n├─ Registers to ServerRPCController\n└─ Begins handshake (Ping, Join Lobby, Start Game)",
      category: "Initialization",
      type: "main",
      emoji: "🟦",
      description:
        "Establishes bidirectional network connectivity through TCP and UDP protocols, spawns background async loops for continuous network operations.",
      detailedDescription:
        "ClientBehaviour opens both TCP and UDP sockets, sets up encryption, and starts three background async loops for send, receive, and process. It reads the server IP, port, and encryption key, establishes reliable TCP connection for critical messages, and fast UDP connection for movement packets. Begins handshake process including Ping, Join Lobby, and Start Game notifications.",
      functions: [
        "Awake()",
        "InitiateClient()",
        "StartTCP()",
        "StartUDP()",
        "ReceiveMessages()",
        "NetworkingLoopAsync()",
        "ProcessReceivedMessagesLoopAsync()",
        "RegisterToController()",
        "BeginHandshake()",
      ],
    },
    {
      id: "C",
      title: "PLAYER INPUT",
      subtitle: "Player Input or AI (TppController)",
      content:
        "├─ HandleMovement() or SimulateRandomMovement()\n├─ On Move / Jump / Shoot / Throw →\n│\n├─ ServerRPCController\n├─ Builds MessagePack struct (PlayerMove_MP)\n└─ Calls → clientBehaviour.SendMessagesUDP()",
      category: "Gameplay",
      type: "main",
      emoji: "🎮",
      description:
        "Captures player input actions (movement, jumping, shooting, throwing) and forwards them to the RPC controller for network transmission.",
      detailedDescription:
        "The ServerRPCController acts as a gateway for all gameplay commands (Move, Shoot, Jump, Throw, etc.) — it serializes them into MessagePack structs and forwards them to ClientBehaviour for network transmission. Player input can come from direct user input or AI simulation.",
      functions: [
        "HandleMovement()",
        "SimulateRandomMovement()",
        "OnMove()",
        "OnJump()",
        "OnShoot()",
        "OnThrow()",
        "BuildMessagePack()",
      ],
    },
    {
      id: "D",
      title: "NETWORK SEND",
      subtitle: "ClientBehaviour_UDP.SendMessagesUDP()",
      content:
        "├─ messageFragmenter.CreateFragments()\n├─ aesHelper.Encrypt(fragment)\n├─ udpClient.Send(fragment, serverEndpoint)\n└─ Adds to send queue\n\n⚙️ At this stage → data leaves Unity client",
      category: "Network Send",
      type: "main",
      emoji: "📤",
      description:
        "Fragments large messages into MTU-compliant chunks, encrypts each fragment with AES, and sends them via UDP to the server.",
      detailedDescription:
        "MessageFragmenter splits large data into smaller chunks that fit within the MTU size, while AesHelper encrypts them for transport security. The UDP Client sends these binary messages to the game server. At this stage, data leaves Unity and travels across the network.",
      functions: [
        "SendMessagesUDP()",
        "CreateFragments()",
        "Encrypt()",
        "udpClient.Send()",
        "QueueMessage()",
        "SendAsync()",
      ],
    },
    {
      id: "E",
      title: "SERVER SIDE",
      subtitle: "Server receives fragments",
      content:
        "├─ Validates checksum / decrypts\n├─ Merges fragments into one message\n├─ Updates authoritative world state\n└─ Broadcasts to all clients (UDP/TCP mix)",
      category: "Server",
      type: "main",
      emoji: "🌐",
      description:
        "Server-side processing that validates, decrypts, and reassembles message fragments, then updates the authoritative game world state.",
      detailedDescription:
        "The UDP Client sends these binary messages to the game server, which reassembles, validates, and updates its authoritative simulation. The server then broadcasts updates back — player positions, rotations, health, etc. — to all connected clients using a mix of UDP for speed and TCP for reliability.",
      functions: [
        "ReceiveFragments()",
        "ValidateChecksum()",
        "Decrypt()",
        "MergeFragments()",
        "UpdateWorldState()",
        "BroadcastToClients()",
      ],
    },
    {
      id: "F",
      title: "CLIENT RECEIVE",
      subtitle: "ClientBehaviour_UDP.ReceiveMessages()",
      content:
        "├─ DecryptAndMergeReceivedMessage()\n│   • Parses headers\n│   • Groups by requestId\n│   • Reassembles fragments\n├─ When complete →\n│   messagesToProcessChannel.Writer.WriteAsync()\n│\n├─ ClientBehaviour_RPCHandler\n├─ Reads messageAction (Move, Rotate, etc.)\n├─ Deserializes MessagePack payload\n└─ Calls gameplay handlers",
      category: "Network Receive",
      type: "main",
      emoji: "📥",
      description:
        "Receives encrypted fragments from server, decrypts, reassembles, and dispatches complete messages to the RPC handler for gameplay processing.",
      detailedDescription:
        "On receiving data, ClientBehaviour_UDP decrypts and reassembles fragments; once a full packet is formed, it forwards it to ClientBehaviour_RPCHandler. The RPCHandler interprets the message type and dispatches to PlayerManager, GameManager, or UIController, which then update Unity's in-scene objects.",
      functions: [
        "ReceiveMessages()",
        "DecryptAndMergeReceivedMessage()",
        "ParseHeaders()",
        "ReassembleFragments()",
        "DispatchToHandler()",
        "DeserializeMessagePack()",
      ],
    },
    {
      id: "G",
      title: "GAME UPDATE",
      subtitle: "PlayerManager & GameManager",
      content:
        "├─ Finds player GameObject\n├─ Applies position, rotation, animation\n├─ For remote → updates EnemyController\n│\n├─ GameManager\n├─ SpawnEnemy()\n│\n└─ Unity Scene Updated visually",
      category: "Game Update",
      type: "main",
      emoji: "🔄",
      description:
        "Updates player GameObjects with networked state, spawns/removes enemies, and applies all visual changes to the Unity scene.",
      detailedDescription:
        "PlayerManager finds the player GameObject and applies position, rotation, and animation updates. For remote players, it updates EnemyController. GameManager handles enemy spawning and removal. The RPCHandler calls these gameplay handlers to update Unity's in-scene objects visually.",
      functions: [
        "FindPlayerGameObject()",
        "ApplyPosition()",
        "ApplyRotation()",
        "UpdateAnimation()",
        "UpdateEnemyController()",
        "SpawnEnemy()",
        "RemoveEnemy()",
      ],
    },
    {
      id: "H",
      title: "SYNC SYSTEM",
      subtitle: "ClientTickManager",
      content:
        "├─ FixedUpdate() increments clientTick\n├─ serverTick synced via ServerTick message\n└─ Keeps network updates deterministic",
      category: "Sync",
      type: "main",
      emoji: "⏱️",
      description:
        "Maintains frame-level synchronization with server tick counter, ensuring all gameplay updates align deterministically.",
      detailedDescription:
        "ClientTickManager keeps a running counter synchronized with the server tick, ensuring gameplay updates line up frame-wise. This bidirectional flow runs continuously — each frame, multiple packets may be sent and received, keeping all clients synchronized.",
      functions: ["FixedUpdate()", "IncrementClientTick()", "SyncServerTick()", "KeepDeterministic()"],
    },
    // Support nodes (dotted edges)
    {
      id: "I",
      title: "GameSession",
      subtitle: "Holds userID, lobbyID, saltKey",
      content: "",
      category: "Support",
      type: "support",
      emoji: "🧠",
      description:
        "Session holder that maintains user credentials and game session data throughout the application lifecycle.",
      detailedDescription:
        "GameSession is a data container that holds essential session information including userID, lobbyID, and encryption saltKey. It's created during initialization and passed throughout the application to ensure consistent session state.",
      functions: ["OnCreated()", "SetUserID()", "SetLobbyID()", "SetSaltKey()"],
    },
    {
      id: "J",
      title: "ClientPrediction",
      subtitle: "Buffers delta for smooth movement",
      content: "",
      category: "Support",
      type: "support",
      emoji: "🧠",
      description:
        "Client-side prediction system that buffers position deltas for smooth interpolation between server updates.",
      detailedDescription:
        "ClientPrediction buffers delta for smooth movement, providing client-side prediction to reduce perceived network latency. It interpolates between server updates to create smooth visual movement even with network delay.",
      functions: ["BufferDelta()", "InterpolateMovement()", "PredictPosition()", "ApplySmoothing()"],
    },
    {
      id: "K",
      title: "UnityMainThreadDispatcher",
      subtitle: "Executes RPCs on main thread",
      content: "",
      category: "Support",
      type: "support",
      emoji: "🧠",
      description:
        "Ensures all network-related GameObjects updates are safely executed on the Unity main thread, preventing threading conflicts.",
      detailedDescription:
        "UnityMainThreadDispatcher ensures that all RPC calls and GameObject updates happen on the main thread, preventing threading conflicts and ensuring safe GameObject manipulation in Unity.",
      functions: ["Execute()", "DispatchToMainThread()", "Queue()", "Process()"],
    },
  ],

  edges: [
    // Main flow edges
    { source: "A", target: "B", animated: true },
    { source: "B", target: "C", animated: true },
    { source: "C", target: "D", animated: true },
    { source: "D", target: "E", animated: true },
    { source: "E", target: "F", animated: true },
    { source: "F", target: "G", animated: true },
    { source: "G", target: "H", animated: true },
    { source: "H", target: "C", animated: true }, // Loop back to C

    // Support node connections (dotted)
    { source: "I", target: "B", dotted: true, animated: true },
    { source: "J", target: "H", dotted: true, animated: true },
    { source: "K", target: "G", dotted: true, animated: true },
  ],
}
