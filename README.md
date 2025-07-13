Hệ thống Chấm điểm và Duyệt Khoản vay Tự độngDự án được phát triển cho cuộc thi Hackathon, xây dựng một hệ thống hoàn chỉnh để tự động hóa quy trình xử lý đơn vay vốn, từ lúc người dùng nộp đơn cho đến khi được phê duyệt và giải ngân. Hệ thống tích hợp Trí tuệ Nhân tạo (AI) để đưa ra quyết định chấm điểm tín dụng, kết hợp với quy trình nghiệp vụ được quản lý bởi Camunda BPMN, và hệ thống xác thực mạnh mẽ từ Keycloak.✨ Các tính năng nổi bậtQuy trình Nghiệp vụ Tự động: Toàn bộ luồng xử lý đơn vay được mô hình hóa và thực thi bằng Camunda BPMN, đảm bảo tính minh bạch và dễ dàng thay đổi.Chấm điểm Tín dụng bằng AI: Tích hợp model AI để phân tích dữ liệu và tự động đưa ra quyết định (Approve, Review, Decline).Phân tích Chú giải bằng LLM: Đối với các trường hợp cần xem xét (Review), hệ thống sử dụng mô hình ngôn ngữ lớn (LLM) để tạo ra các phân tích chi tiết, hỗ trợ nhân viên thẩm định.Xác thực và Phân quyền Mạnh mẽ: Sử dụng Keycloak và NextAuth.js để quản lý định danh người dùng và bảo vệ các API endpoint một cách an toàn.Tối ưu Hiệu năng: Tích hợp Redis Cache để giảm tải cho CSDL và các cuộc gọi AI, tăng tốc độ xử lý.Trải nghiệm Người dùng Real-time: (Tùy chọn) Sử dụng WebSocket để cập nhật trạng thái xử lý hồ sơ cho người dùng ngay lập tức.Kiến trúc Microservices: Hệ thống được xây dựng dựa trên các service độc lập (API Server, Worker, Frontend), đóng gói bằng Docker và sẵn sàng cho việc triển khai trên nền tảng Cloud.CI/CD Hoàn chỉnh: Thiết lập pipeline tự động hóa việc build và deploy ứng dụng lên Amazon ECS bằng GitHub Actions.🏗️ Sơ đồ Kiến trúc Hệ thốngHệ thống được thiết kế theo kiến trúc microservices, bao gồm các thành phần chính tương tác với nhau như sau:graph TD
    subgraph "Người dùng"
        A[Frontend - Next.js]
    end

    subgraph "Hạ tầng Xác thực"
        B[Keycloak Server]
    end

    subgraph "Hạ tầng Backend"
        C[API Server - Express.js]
        D[Camunda Worker - Node.js]
        E[Camunda 7 Engine]
        F[PostgreSQL Database]
        G[Redis Cache]
    end

    subgraph "Dịch vụ Ngoài"
        H[Service AI Chấm điểm]
        I[Service LLM Phân tích]
        J[AWS SES - Gửi Email]
    end

    A -- "1. Đăng nhập/Đăng ký" --> B
    B -- "2. Trả về Token" --> A
    A -- "3. Gửi đơn vay (với Token)" --> C
    C -- "4. Xác thực Token" --> B
    C -- "5. Lưu dữ liệu" --> F
    C -- "6. Khởi tạo Quy trình" --> E

    D -- "7. Lấy việc (Polling)" --> E
    E -- "8. Giao việc" --> D
    D -- "9. Lấy dữ liệu" --> F
    D -- "10. Kiểm tra Cache" --> G
    D -- "11. Gọi AI/LLM" --> H & I
    D -- "12. Gửi Email" --> J
    D -- "13. Hoàn thành việc" --> E
🛠️ Công nghệ sử dụng (Tech Stack)Frontend:Next.js (App Router)TypeScriptNextAuth.js (Tích hợp Keycloak)Tailwind CSS, Shadcn UIAxiosBackend - API Server:Node.js, Express.jsTypeScriptKeycloak-Connect (Bảo vệ API)PostgreSQL (pg)Backend - Camunda Worker:Node.jscamunda-external-task-client-jsRedis (redis)AWS SDK (@aws-sdk/client-ses)Hạ tầng & DevOps:Camunda BPM Platform 7PostgreSQLRedisDocker & Docker ComposeGitHub Actions (CI/CD)AWS: ECS, Fargate, ECR, RDS, ElastiCache, SES🚀 Hướng dẫn Cài đặt và Chạy LocalYêu cầu:Docker và Docker ComposeNode.js v18+npm hoặc yarnCác bước thực hiện:Clone Repository:git clone <your-repository-url>
cd <your-project-folder>
Cấu hình Biến môi trường:Tạo file .env trong thư mục gốc (cùng cấp với docker-compose.yml) để Docker Compose sử dụng:# .env
DB_USER=admin
DB_PASSWORD=admin
DB_DATABASE=loan_db
Trong mỗi thư mục con (camunda-loan-api, camunda-loan-worker, và project frontend), tạo các file .env riêng và điền đầy đủ các thông tin cần thiết (URL Camunda, thông tin DB, Keycloak, AWS keys...).Khởi động Toàn bộ Hệ thống:Chạy lệnh sau từ thư mục gốc của dự án:docker-compose up --build -d
Lệnh này sẽ khởi động:API ServerCamunda WorkerPostgreSQL DatabaseRedisCamunda 7 PlatformDeploy Quy trình BPMN:Sau khi các container đã khởi động, hãy deploy file quy trình lên Camunda Engine bằng lệnh cURL:curl -w "\n" \
-H "Accept: application/json" \
-F "deployment-name=loan-process-deployment" \
-F "deploy-changed-only=true" \
-F "file=@./resources/your-bpmn-file.bpmn" \
http://localhost:8080/engine-rest/deployment/create
(Lưu ý: Thay your-bpmn-file.bpmn bằng tên file đúng và đảm bảo nó nằm trong thư mục resources)Truy cập Ứng dụng:Frontend: http://localhost:3000Camunda Cockpit: http://localhost:8080/camunda/app/cockpit/ (user: demo, pass: demo)📂 Cấu trúc Thư mụcDự án được tổ chức theo kiến trúc microservices với các thư mục riêng biệt:/camunda-loan-api: Chứa mã nguồn của API Server (Express.js), tuân theo mô hình Route-Controller-Service./camunda-loan-worker: Chứa mã nguồn của Camunda Worker, với mỗi worker được module hóa trong thư mục /src/workers./frontend-nextjs: Chứa mã nguồn của ứng dụng Next.js./resources: Chứa file .bpmn và các tài nguyên tĩnh khác.docker-compose.yml: Định nghĩa và liên kết tất cả các dịch vụ.
