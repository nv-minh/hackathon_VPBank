import { type NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import {getServerSession} from "next-auth/next";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, timestamp } = body

    // Log the loan registration request
    console.log("Loan registration request:", {
      userId: session.user?.email,
      action,
      timestamp,
      userInfo: session.user,
    })

    const backendResponse = await simulateBackendCall({
      userId: session.user?.email,
      userName: session.user?.name,
      action,
      timestamp,
    })

    if (backendResponse.success) {
      return NextResponse.json({
        success: true,
        message: "Loan registration request submitted successfully",
        applicationId: backendResponse.applicationId,
      })
    } else {
      return NextResponse.json({ error: "Failed to process loan registration" }, { status: 500 })
    }
  } catch (error) {
    console.error("Loan registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function simulateBackendCall(data: any) {

  return new Promise<{ success: boolean; applicationId?: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        applicationId: `LOAN_${Date.now()}`,
      })
    }, 1000)
  })
}
