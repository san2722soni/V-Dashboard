"use client";
import { networkFlowData } from "@/lib/network-data";

interface Node {
  id: string;
  title: string;
  category: string;
  description: string;
  functions: string[];
  color: string;
}

interface Edge {
  source: string;
  target: string;
}

interface TimelinePhase {
  phase: string;
  description: string;
  nodeIds: string[];
}

interface FlowData {
  nodes: Node[];
  edges: Edge[];
  timeline: TimelinePhase[];
}

/**
 * Custom hook to fetch and manage network flow data
 * Loads data from networkFlowData constant and generates timeline
 */
export function useFlowData(): FlowData {
  const timelinePhases: TimelinePhase[] = [
    {
      phase: "Scene Launch & Initialization",
      description:
        "GameManager initializes and spawns ClientBehaviour with network setup",
      nodeIds: ["game-session", "game-manager", "client-init"],
    },
    {
      phase: "Player Input Processing",
      description:
        "Player provides input (Move, Jump, Shoot) which is captured and processed",
      nodeIds: ["player-input", "server-rpc"],
    },
    {
      phase: "Message Fragmentation & Encryption",
      description:
        "Commands are split into fragments and encrypted for secure network transport",
      nodeIds: ["fragmenter", "encryption"],
    },
    {
      phase: "Network Transmission",
      description: "Encrypted fragments are sent via UDP to the game server",
      nodeIds: ["udp-send", "server-process", "server-broadcast"],
    },
    {
      phase: "Receive & Decrypt",
      description:
        "Client receives server updates, decrypts and reassembles fragments into complete messages",
      nodeIds: ["udp-receive", "rpc-handler"],
    },
    {
      phase: "Game State Update",
      description:
        "Handlers dispatch updates to PlayerManager, EnemyController, and GameManager to reflect server state",
      nodeIds: ["player-manager", "enemy-controller", "game-manager-update"],
    },
    {
      phase: "Synchronization & Prediction",
      description:
        "ClientTickManager syncs frame timing and ClientPrediction smooths movement between updates",
      nodeIds: ["tick-manager", "client-prediction"],
    },
  ];

  return {
    // @ts-ignore

    nodes: networkFlowData.nodes,
    edges: networkFlowData.edges,
    timeline: timelinePhases,
  };
}
