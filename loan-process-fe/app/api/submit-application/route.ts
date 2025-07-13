import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
    // Lấy token một cách an toàn ở phía server
    const token = await getToken({ req });

    if (!token || !token.accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let applicationData = {}; // Mặc định là một đối tượng rỗng

    try {
        // Chỉ cố gắng phân tích JSON nếu request thực sự có body
        if (req.headers.get("content-length") !== "0") {
            applicationData = await req.json();
        }
    } catch (e) {
        // Nếu có lỗi phân tích JSON, ghi log và tiếp tục với đối tượng rỗng
        console.warn("Could not parse request body. Proceeding with empty body.", e);
        applicationData = {};
    }

    try {
        // Luôn gửi một đối tượng JSON hợp lệ (có thể rỗng) đến backend
        const response = await axios.post(
            'http://localhost:3002/api/applications', // URL của server Express
            applicationData, // Gửi dữ liệu đã phân tích hoặc đối tượng rỗng
            {
                headers: {
                    'Authorization': `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json(response.data, { status: response.status });

    } catch (error: any) {
        console.error("Proxy API error:", error.response?.data || error.message);
        return NextResponse.json(
            { message: error.response?.data?.message || 'Internal Server Error' },
            { status: error.response?.status || 500 }
        );
    }
}