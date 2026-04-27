import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'About',
  description: 'Yatharth Mishra — AI Full Stack Engineer. Building production GenAI agents with LangGraph, FastAPI, and GCP.',
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
