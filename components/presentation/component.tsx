"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { slides } from "./slides"
import { useSimulation } from "./simulation"

export default function Component() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const {
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
    simulateStep
  } = useSimulation()

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  // Passe les props nécessaires aux slides
  const currentSlideContent = slides[currentSlide].content({
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
  })

  return (
    <div className="w-full max-w-7xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{slides[currentSlide].title}</h1>
            <p className="text-blue-100 mt-1">{slides[currentSlide].subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Diapositive</div>
            <div className="text-xl font-bold">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 min-h-[500px]">{currentSlideContent}</div>

      {/* Navigation */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
        <Button
          onClick={prevSlide}
          variant="outline"
          disabled={currentSlide === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </Button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          variant="outline"
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 bg-transparent"
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}