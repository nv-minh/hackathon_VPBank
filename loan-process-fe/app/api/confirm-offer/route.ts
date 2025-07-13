import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const { applicationId } = await req.json();

        // TODO để backend xử lý
        await axios.post('http://localhost:8080/engine-rest/message', {
            messageName: "customer_accepts_offer",
            businessKey: applicationId,
        }, {
            auth: { username: 'demo', password: 'demo' }
        });

        return NextResponse.json({ message: "Confirmation sent to Camunda." });
    } catch (error) {
        return NextResponse.json({ error: error });
    }
}