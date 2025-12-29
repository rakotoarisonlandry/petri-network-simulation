import { JSX } from "react"

/* =======================
   Types utilitaires
======================= */

export type Station = "A" | "B" | "C" | "D" | "E"

export type Binary = 0 | 1

export type NotificationType = "success" | "error" | "warning" | "info" | "emergency"

/* =======================
   Simulation Tokens
======================= */

export interface Tokens {
  // Passagers
  stationA_passengers: number
  stationB_passengers: number
  stationC_passengers: number
  stationD_passengers: number
  stationE_passengers: number

  // Trains
  train1_position: Station
  train2_position: Station
  train3_position: Station

  train1_capacity: number
  train2_capacity: number
  train3_capacity: number

  // Plateformes
  platform_A: Binary
  platform_B: Binary
  platform_C: Binary
  platform_D: Binary
  platform_E: Binary

  // Signaux
  signal_AB: Binary
  signal_BC: Binary
  signal_CD: Binary
  signal_DE: Binary
  signal_EA: Binary

  maintenance_crew: number
  emergency_brake: Binary
}

/* =======================
   Notifications
======================= */

export interface Notification {
  id: number
  message: string
  type: NotificationType
  icon: string
}

/* =======================
   Slides
======================= */

export interface Slide {
  title: string
  subtitle: string
  content: () => JSX.Element
}

/* =======================
   Hook return type
======================= */

export interface SimulationControls {
  isAnimating: boolean
  animationSpeed: number
  gameScore: number
  efficiency: number
  tokens: Tokens
  simulationLog: string[]
  currentTime: number
  selectedTrain: number | null
  notifications: Notification[]
  totalPassengersTransported: number

  setIsAnimating: (value: boolean) => void
  setAnimationSpeed: (value: number) => void
  setSelectedTrain: (value: number | null) => void

  resetSimulation: () => void
  simulateStep: () => void
}
