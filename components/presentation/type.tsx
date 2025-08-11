import { JSX } from "react"

export interface Tokens {
  stationA_passengers: number
  stationB_passengers: number
  stationC_passengers: number
  stationD_passengers: number
  stationE_passengers: number
  train1_position: string
  train2_position: string
  train3_position: string
  train1_capacity: number
  train2_capacity: number
  train3_capacity: number
  platform_A: number
  platform_B: number
  platform_C: number
  platform_D: number
  platform_E: number
  signal_AB: number
  signal_BC: number
  signal_CD: number
  signal_DE: number
  signal_EA: number
  maintenance_crew: number
  emergency_brake: number
}

export interface Notification {
  id: number
  message: string
  type: string
  icon: string
}

export interface Slide {
  title: string
  subtitle: string
  content: (props: unknown) => JSX.Element
}

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