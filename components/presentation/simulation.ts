import { useState, useEffect } from "react"
import { Notification, Tokens } from "./type"

export const useSimulation = () => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1000)
  const [gameScore, setGameScore] = useState(0)
  const [efficiency, setEfficiency] = useState(85)
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
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedTrain, setSelectedTrain] = useState<number | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [totalPassengersTransported, setTotalPassengersTransported] = useState(0)

  const addNotification = (message: string, type: string, icon: string) => {
    const id = Date.now() + Math.random()
    setNotifications((prev) => [...prev, { id, message, type, icon }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 600)
  }

  const simulateStep = () => {
    setTokens((prevTokens) => {
      const newTokens = { ...prevTokens }
      const newLog: string[] = []
      let scoreIncrease = 0
      let passengersTransported = 0

      const stations = ["A", "B", "C", "D", "E"]
      const trains = [
        { id: 1, position: newTokens.train1_position, capacity: newTokens.train1_capacity },
        { id: 2, position: newTokens.train2_position, capacity: newTokens.train2_capacity },
        { id: 3, position: newTokens.train3_position, capacity: newTokens.train3_capacity },
      ]

      trains.forEach((train) => {
        const currentIndex = stations.indexOf(train.position)
        const nextIndex = (currentIndex + 1) % stations.length
        const nextStation = stations[nextIndex]
        const signalKey = `signal_${train.position}${nextStation}` as keyof Tokens

        if (newTokens[signalKey] > 0 && newTokens[`platform_${nextStation}` as keyof Tokens] > 0) {
          // Décharger les passagers
          if (train.capacity > 0) {
            const passengersKey = `station${nextStation}_passengers` as keyof Tokens
            newTokens[passengersKey] = Math.max(0, (newTokens[passengersKey] as number) - train.capacity)
            passengersTransported += train.capacity
            newTokens[`train${train.id}_capacity` as keyof Tokens] = 0
            newLog.push(`🚇 Train ${train.id} décharge ${train.capacity} passagers à la station ${nextStation}`)
            scoreIncrease += train.capacity * 15
          }

          // Charger de nouveaux passagers
          const waitingPassengers = newTokens[`station${nextStation}_passengers` as keyof Tokens] as number
          const toLoad = Math.min(waitingPassengers, 4)
          if (toLoad > 0) {
            newTokens[`station${nextStation}_passengers` as keyof Tokens] = waitingPassengers - toLoad
            newTokens[`train${train.id}_capacity` as keyof Tokens] = toLoad
            newLog.push(`👥 ${toLoad} passagers montent dans le train ${train.id} à ${nextStation}`)
            scoreIncrease += toLoad * 8
          }

          // Déplacer le train
          newTokens[`train${train.id}_position` as keyof Tokens] = nextStation
          newLog.push(`🚇 Train ${train.id} se déplace vers la station ${nextStation}`)

          // Libérer la plateforme précédente et occuper la nouvelle
          newTokens[`platform_${train.position}` as keyof Tokens] = 1
          newTokens[`platform_${nextStation}` as keyof Tokens] = 0
        }
      })

      // Arrivée aléatoire de nouveaux passagers
      if (Math.random() < 0.35) {
        const randomStation = stations[Math.floor(Math.random() * stations.length)]
        const newPassengers = Math.floor(Math.random() * 4) + 1
        newTokens[`station${randomStation}_passengers` as keyof Tokens] += newPassengers
        newLog.push(`👥 ${newPassengers} nouveaux passagers arrivent à la station ${randomStation}`)
      }

      // Gestion des signaux
      stations.forEach((station, index) => {
        const nextStation = stations[(index + 1) % stations.length]
        const signalKey = `signal_${station}${nextStation}` as keyof Tokens
        const trainAtNext = trains.some((train) => train.position === nextStation)
        newTokens[signalKey] = trainAtNext ? 0 : 1
      })

      // Maintenance aléatoire
      if (Math.random() < 0.04 && newTokens.maintenance_crew > 0) {
        const randomStation = stations[Math.floor(Math.random() * stations.length)]
        newTokens[`platform_${randomStation}` as keyof Tokens] = 0
        newTokens.maintenance_crew -= 1
        newLog.push(`🔧 Maintenance en cours à la station ${randomStation}`)

        setTimeout(() => {
          setTokens((prev) => ({
            ...prev,
            [`platform_${randomStation}`]: 1,
            maintenance_crew: prev.maintenance_crew + 1,
          }))
          addNotification(`Maintenance terminée à la station ${randomStation}`, "success", "✅")
        }, 4000)
      }

      // Freinage d'urgence
      if (Math.random() < 0.02) {
        newTokens.emergency_brake = 1
        newLog.push(`🚨 ARRÊT DURGENCE ACTIVÉ!`)
        scoreIncrease -= 100

        setTimeout(() => {
          setTokens((prev) => ({ ...prev, emergency_brake: 0 }))
          addNotification("Système remis en marche", "success", "✅")
        }, 4000)
      }

      // Mettre à jour les statistiques
      setGameScore((prev) => Math.max(0, prev + scoreIncrease))
      setTotalPassengersTransported((prev) => prev + passengersTransported)

      const totalWaiting = Object.values(newTokens)
        .slice(0, 5)
        .reduce((a, b) => (a as number) + (b as number), 0) as number
      const newEfficiency = Math.max(10, Math.min(100, 100 - totalWaiting * 3))
      setEfficiency(newEfficiency)

      if (newLog.length > 0) {
        setSimulationLog((prev) => [...prev.slice(-20), ...newLog])
      }

      return newTokens
    })
  }

  const resetSimulation = () => {
    setTokens({
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
    setSimulationLog([])
    setCurrentTime(0)
    setGameScore(0)
    setEfficiency(85)
    setTotalPassengersTransported(0)
    setIsAnimating(false)
    setNotifications([])
    setSelectedTrain(null)
  }

  // Animation automatique
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnimating) {
      interval = setInterval(() => {
        simulateStep()
        setCurrentTime((prev) => prev + 1)
      }, animationSpeed)
    }
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
    resetSimulation,
    simulateStep,
    addNotification
  }
}