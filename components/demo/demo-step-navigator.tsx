"use client"

import type React from "react"

import { useDemoContext } from "@/context/demo-context"
import { Check, Coffee, FileCheck, Coins, BarChart3, ShoppingBag, Info, Users, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DemoStepNavigator() {
  const { currentStep, goToStep } = useDemoContext()

  const steps = [
    { name: "Introduction", icon: <Info className="h-4 w-4" /> },
    { name: "Batch Creation", icon: <Coffee className="h-4 w-4" /> },
    { name: "Reserve Verification", icon: <FileCheck className="h-4 w-4" /> },
    { name: "Token Minting", icon: <Coins className="h-4 w-4" /> },
    { name: "Community Distribution", icon: <Users className="h-4 w-4" /> }, // New step
    { name: "Inventory Management", icon: <BarChart3 className="h-4 w-4" /> },
    { name: "Token Redemption", icon: <ShoppingBag className="h-4 w-4" /> },
    { name: "QR Traceability", icon: <QrCode className="h-4 w-4" /> }, // New step
    { name: "Completion", icon: <Check className="h-4 w-4" /> },
  ]

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max">
        {steps.map((step, index) => (
          <StepButton
            key={index}
            step={index}
            name={step.name}
            icon={step.icon}
            isActive={currentStep === index}
            isCompleted={currentStep > index}
            onClick={() => goToStep(index)}
          />
        ))}
      </div>
    </div>
  )
}

function StepButton({
  step,
  name,
  icon,
  isActive,
  isCompleted,
  onClick,
}: {
  step: number
  name: string
  icon: React.ReactNode
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}) {
  return (
    <div className="flex-1 relative">
      <button
        className={cn(
          "w-full flex flex-col items-center justify-center py-3 px-2 transition-all",
          isActive ? "text-emerald-300" : isCompleted ? "text-emerald-500" : "text-gray-500 hover:text-gray-400",
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all",
            isActive
              ? "bg-emerald-900/50 border-2 border-emerald-500"
              : isCompleted
                ? "bg-emerald-900/30 border border-emerald-500"
                : "bg-gray-900/30 border border-gray-700",
          )}
        >
          {isCompleted ? <Check className="h-4 w-4" /> : icon}
        </div>
        <span className="text-xs font-medium">{name}</span>
      </button>
      {step < 8 && (
        <div
          className={cn("absolute top-5 left-1/2 w-full h-0.5", isCompleted ? "bg-emerald-500/50" : "bg-gray-700/50")}
          style={{ transform: "translateX(50%)" }}
        ></div>
      )}
    </div>
  )
}

