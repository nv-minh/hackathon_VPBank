import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userInput = body.input;

    if (!userInput) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_CHATBOT_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "Chatbot API URL is not configured" },
        { status: 500 }
      );
    }

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: userInput }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("API call failed:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch from chat API", details: errorText },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in chat proxy API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
