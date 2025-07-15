import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    const token = await getToken({ req });

    if (!token || !token.accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await axios.post(
            'http://localhost:3002/api/user',
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json(response.data, { status: response.status });

    } catch (error: any) {
        console.error("API /api/user-info error:", error.response?.data || error.message);

        if (error.response?.status === 404) {
            return NextResponse.json(
                { message: error.response?.data?.message || 'Profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: error.response?.data?.message || 'Internal Server Error' },
            { status: error.response?.status || 500 }
        );
    }
}