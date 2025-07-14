import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
    const token = await getToken({ req });

    if (!token || !token.accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let profileData = {};
    try {
        profileData = await req.json();
    } catch (e) {
        console.error("Error parsing request body for profile creation:", e);
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }


    const finalProfilePayload = {
        ...profileData,
    };


    try {
        const response = await axios.post(
            'http://localhost:3002/api/profiles',
            finalProfilePayload,
            {
                headers: {
                    'Authorization': `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json(response.data, { status: response.status });

    } catch (error: any) {
        console.error("Proxy API /api/create-profile error:", error.response?.data || error.message);
        return NextResponse.json(
            { message: error.response?.data?.message || 'Internal Server Error' },
            { status: error.response?.status || 500 }
        );
    }
}