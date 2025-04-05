"use client"

import React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-black text-white border border-emerald-500/50 hover:bg-emerald-950/50",
        primary: "web3-button-gradient text-emerald-50 hover:brightness-110 shadow-glow-sm",
        outline:
          "border border-emerald-500/50 bg-black/50 backdrop-blur-sm text-emerald-100 hover:bg-emerald-950/30 hover:border-emerald-400",
        ghost: "bg-transparent text-emerald-100 hover:bg-emerald-900/10",
        link: "text-emerald-400 underline-offset-4 hover:underline",
        gradient: "web3-button-gradient text-emerald-50 hover:brightness-110 shadow-glow-sm",
        cyber: "web3-button-cyber text-emerald-50 hover:brightness-110 shadow-glow-sm",
        purple: "web3-button-purple text-purple-50 hover:brightness-110 shadow-purple-glow-sm",
        "purple-outline":
          "border border-purple-500/50 bg-black/50 backdrop-blur-sm text-purple-100 hover:bg-purple-950/30 hover:border-purple-400",
        "dual-gradient": "web3-button-dual-gradient text-white hover:brightness-110 shadow-dual-glow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Web3Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {/* Particle effects */}
        {(variant === "primary" || variant === "gradient" || variant === "cyber") && (
          <>
            <span className="absolute inset-0 overflow-hidden opacity-30">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-emerald-300"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `floatParticle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite alternate`,
                  }}
                />
              ))}
            </span>

            {/* Scan line effect */}
            <span className="absolute inset-0 overflow-hidden opacity-10">
              <span className="absolute inset-0 translate-y-full bg-gradient-to-b from-transparent via-emerald-300 to-transparent opacity-30 group-hover:animate-scan" />
            </span>

            {/* Data flow effect */}
            <span className="absolute inset-0 overflow-hidden opacity-20">
              <span className="absolute top-0 left-0 h-[1px] w-0 bg-emerald-300 group-hover:animate-dataflow" />
            </span>
          </>
        )}

        {(variant === "purple" || variant === "purple-outline" || variant === "dual-gradient") && (
          <>
            <span className="absolute inset-0 overflow-hidden opacity-30">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-purple-300"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `floatParticle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite alternate`,
                  }}
                />
              ))}
            </span>

            {/* Scan line effect */}
            <span className="absolute inset-0 overflow-hidden opacity-10">
              <span className="absolute inset-0 translate-y-full bg-gradient-to-b from-transparent via-purple-300 to-transparent opacity-30 group-hover:animate-scan" />
            </span>

            {/* Data flow effect */}
            <span className="absolute inset-0 overflow-hidden opacity-20">
              <span className="absolute top-0 left-0 h-[1px] w-0 bg-purple-300 group-hover:animate-dataflow" />
            </span>
          </>
        )}

        {/* Button content */}
        <span className="relative z-10 font-medium tracking-wide text-emerald-50/90">{props.children}</span>
      </motion.button>
    )
  },
)

Web3Button.displayName = "Web3Button"

export default Web3Button

