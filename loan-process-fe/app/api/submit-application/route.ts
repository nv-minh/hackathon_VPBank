import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
    const token = await getToken({ req });

    if (!token || !token.accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let requestBody: { loanAmount?: number } = {};

    try {
        if (req.headers.get("content-length") !== "0") {
            requestBody = await req.json();
        }
    } catch (e) {
        console.warn("Could not parse request body. Proceeding with empty body.", e);
        requestBody = {};
    }

    const { loanAmount } = requestBody;


    const payloadToBackend = {
        loanAmount: loanAmount,
    };

    try {
        const response = await axios.post(
            'http://localhost:3002/api/applications',
            payloadToBackend,
            {
                headers: {
                    'Authorization': `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json(response.data, { status: response.status });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Proxy API error:", error.response?.data || error.message);
        return NextResponse.json(
            { message: error.response?.data?.message || 'Internal Server Error' },
            { status: error.response?.status || 500 }
        );
    }
}