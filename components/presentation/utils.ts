export const getStationColor = (station: string) => {
  const colors = {
    A: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-800" },
    B: { bg: "bg-green-100", border: "border-green-500", text: "text-green-800" },
    C: { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-800" },
    D: { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-800" },
    E: { bg: "bg-pink-100", border: "border-pink-500", text: "text-pink-800" },
  }
  return colors[station as keyof typeof colors]
}

export const getTrainColor = (trainId: number) => {
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500"]
  return colors[trainId - 1]
}