import { useState, useEffect } from "react"
import { Notification, Tokens, Station, NotificationType } from "./type"

export const useSimulation = () => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000)
  const [gameScore, setGameScore] = useState<number>(0)
  const [efficiency, setEfficiency] = useState<number>(85)

  const [tokens, setTokens] = useState<Tokens>({
    stationA_passengers: 5,
    stationB_passengers: 3,
    stationC_passengers: 2,
    stationD_passengers: 4,
    stationE_passengers: 1,

    train1_position: "A",
    train2_position: "C",
    train3_position: "E",

    train1_capacity: 0,
    train2_capacity: 2,
    train3_capacity: 1,

    platform_A: 1,
    platform_B: 1,
    platform_C: 0,
    platform_D: 1,
    platform_E: 1,

    signal_AB: 1,
    signal_BC: 1,
    signal_CD: 1,
    signal_DE: 1,
    signal_EA: 1,

    maintenance_crew: 2,
    emergency_brake: 0,
  })

  const [simulationLog, setSimulationLog] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [selectedTrain, setSelectedTrain] = useState<number | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [totalPassengersTransported, setTotalPassengersTransported] =
    useState<number>(0)

  const addNotification = (
    message: string,
    type: NotificationType,
    icon: string
  ) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type, icon }])

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 600)
  }

  const stations: Station[] = ["A", "B", "C", "D", "E"]

  const simulateStep = () => {
    setTokens(prevTokens => {
      const newTokens: Tokens = { ...prevTokens }
      const newLog: string[] = []

      let scoreIncrease = 0
      let passengersTransported = 0

      const trains = [
        { id: 1, position: newTokens.train1_position, capacity: newTokens.train1_capacity },
        { id: 2, position: newTokens.train2_position, capacity: newTokens.train2_capacity },
        { id: 3, position: newTokens.train3_position, capacity: newTokens.train3_capacity },
      ]

      for (const train of trains) {
        const currentIndex = stations.indexOf(train.position)
        const nextStation = stations[(currentIndex + 1) % stations.length]

        const signalKey = `signal_${train.position}${nextStation}` as keyof Tokens
        const platformNextKey = `platform_${nextStation}` as keyof Tokens
        const platformCurrentKey = `platform_${train.position}` as keyof Tokens

        if (newTokens[signalKey] === 1 && newTokens[platformNextKey] === 1) {
          if (train.capacity > 0) {
            const passengersKey = `station${nextStation}_passengers` as keyof Tokens
            (newTokens as any)[passengersKey] -= train.capacity

            passengersTransported += train.capacity as any
            (newTokens as any)[`train${train.id}_capacity` as keyof Tokens] = 0
            scoreIncrease += train.capacity * 15

            newLog.push(
              `🚇 Train ${train.id} décharge ${train.capacity} passagers à ${nextStation}`
            )
          }

          const stationPassengersKey =
            `station${nextStation}_passengers` as keyof Tokens

          const waitingPassengers = (newTokens as any)[stationPassengersKey] as number
          const toLoad = Math.min(waitingPassengers, 4)

          if (toLoad > 0) {
            (newTokens as any)[stationPassengersKey] = waitingPassengers - (toLoad as any);
            (newTokens as any)[`train${train.id}_capacity` as keyof Tokens] = (toLoad as any)

            scoreIncrease += toLoad * 8
            newLog.push(
              `👥 ${toLoad} passagers montent dans le train ${train.id} à ${nextStation}`
            )
          }

          (newTokens as any)[`train${train.id}_position` as keyof Tokens] = (nextStation as any)
          (newTokens as any)[platformCurrentKey] = 1 as any
          (newTokens as any)[platformNextKey] = 0

          newLog.push(`🚇 Train ${train.id} se déplace vers ${nextStation}`)
        }
      }

      if (Math.random() < 0.35) {
        const station = stations[Math.floor(Math.random() * stations.length)]
        const count = Math.floor(Math.random() * 4) + 1

        const key = `station${station}_passengers` as keyof Tokens
        (newTokens as any)[key] += count

        newLog.push(`👥 ${count} nouveaux passagers à ${station}`)
      }

      stations.forEach((station, i) => {
        const next = stations[(i + 1) % stations.length]
        const signalKey = `signal_${station}${next}` as keyof Tokens
        const occupied = trains.some(t => t.position === next) as any
        (newTokens as any)[signalKey] = occupied ? 0 : 1
      })

      if (Math.random() < 0.02) {
        newTokens.emergency_brake = 1
        scoreIncrease -= 100
        newLog.push("🚨 ARRÊT D’URGENCE")

        setTimeout(() => {
          setTokens(prev => ({ ...prev, emergency_brake: 0 }))
          addNotification("Système remis en marche", "success", "✅")
        }, 4000)
      }

      setGameScore(prev => Math.max(0, prev + scoreIncrease))
      setTotalPassengersTransported(prev => prev + passengersTransported)

      const totalWaiting =
        newTokens.stationA_passengers +
        newTokens.stationB_passengers +
        newTokens.stationC_passengers +
        newTokens.stationD_passengers +
        newTokens.stationE_passengers

      setEfficiency(Math.max(10, Math.min(100, 100 - totalWaiting * 3)))

      if (newLog.length) {
        setSimulationLog(prev => [...prev.slice(-20), ...newLog])
      }

      return newTokens
    })
  }

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      simulateStep()
      setCurrentTime(t => t + 1)
    }, animationSpeed)

    return () => clearInterval(interval)
  }, [isAnimating, animationSpeed])

  return {
    isAnimating,
    animationSpeed,
    gameScore,
    efficiency,
    tokens,
    simulationLog,
    currentTime,
    selectedTrain,
    notifications,
    totalPassengersTransported,
    setIsAnimating,
    setAnimationSpeed,
    setSelectedTrain,
    resetSimulation: () => window.location.reload(),
    simulateStep,
    addNotification,
  }
}
