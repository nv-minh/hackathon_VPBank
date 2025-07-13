# 🚀 Hệ thống Chấm điểm và Duyệt Khoản vay Tự động

Dự án được phát triển cho cuộc thi Hackathon, xây dựng một hệ thống hoàn chỉnh để **tự động hóa quy trình xử lý đơn vay vốn**, từ lúc người dùng nộp đơn cho đến khi được phê duyệt và giải ngân.

Hệ thống tích hợp **Trí tuệ Nhân tạo (AI)** để đưa ra quyết định chấm điểm tín dụng, kết hợp với **quy trình nghiệp vụ bằng Camunda BPMN** và **hệ thống xác thực mạnh mẽ với Keycloak**.

---

## ✨ Các tính năng nổi bật

- **Quy trình Nghiệp vụ Tự động**: Mô hình hóa và thực thi toàn bộ luồng xử lý đơn vay bằng Camunda BPMN.
- **Chấm điểm Tín dụng bằng AI**: Sử dụng model AI đưa ra quyết định tự động (Approve, Review, Decline).
- **Phân tích Chú giải bằng LLM**: Đối với các case "Review", hệ thống dùng LLM để phân tích hỗ trợ thẩm định viên.
- **Xác thực và Phân quyền Mạnh mẽ**: Keycloak + NextAuth.js bảo vệ định danh và truy cập API.
- **Tối ưu Hiệu năng**: Redis cache giúp giảm tải CSDL và các service AI.
- **Trải nghiệm Người dùng Real-time**: (Tùy chọn) WebSocket cập nhật trạng thái hồ sơ.
- **Kiến trúc Microservices**: Phân tách thành các service: API Server, Worker, Frontend (Next.js), đóng gói bằng Docker.
- **CI/CD Hoàn chỉnh**: Dùng GitHub Actions tự động build và deploy lên Amazon ECS.

---

## 🏗️ Sơ đồ Kiến trúc Hệ thống

```
graph TD
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
```

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend:
- Next.js (App Router)
- TypeScript
- NextAuth.js (Tích hợp Keycloak)
- Tailwind CSS, Shadcn UI
- Axios

### Backend - API Server:
- Node.js, Express.js
- TypeScript
- keycloak-connect (Bảo vệ API)
- PostgreSQL (pg)

### Backend - Camunda Worker:
- Node.js
- camunda-external-task-client-js
- Redis (redis)
- AWS SDK (@aws-sdk/client-ses)

### Hạ tầng & DevOps:
- Camunda BPM Platform 7
- PostgreSQL, Redis
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS: ECS, Fargate, ECR, RDS, ElastiCache, SES

---

## 🚀 Hướng dẫn Cài đặt và Chạy Local

### Yêu cầu:
- Docker và Docker Compose
- Node.js v18+
- npm hoặc yarn

### Các bước thực hiện:

#### Clone Repository:
```bash
git clone <your-repository-url>
cd <your-project-folder>
```

#### Cấu hình Biến môi trường:

Tạo file `.env` ở thư mục gốc (cùng cấp `docker-compose.yml`):

```
DB_USER=admin
DB_PASSWORD=admin
DB_DATABASE=loan_db
```

Tạo `.env` riêng cho từng thư mục con (`camunda-loan-api`, `camunda-loan-worker`, `frontend-nextjs`) chứa config Camunda, DB, Keycloak, AWS...

#### Khởi động Toàn bộ Hệ thống:
```bash
docker-compose up --build -d
```

Lệnh này sẽ khởi động:

- API Server
- Camunda Worker
- PostgreSQL
- Redis
- Camunda 7 Platform

#### Deploy Quy trình BPMN:
```bash
curl -w "
"   -H "Accept: application/json"   -F "deployment-name=loan-process-deployment"   -F "deploy-changed-only=true"   -F "file=@./resources/your-bpmn-file.bpmn"   http://localhost:8080/engine-rest/deployment/create
```

> ⚠️ Thay `your-bpmn-file.bpmn` bằng file BPMN thật nằm trong `resources`

#### Truy cập Ứng dụng:

- Frontend: http://localhost:3000
- Camunda Cockpit: http://localhost:8080/camunda/app/cockpit/ (user: `demo`, pass: `demo`)

---

## 📂 Cấu trúc Thư mục

```
/
├── camunda-loan-api          # API Server (Express.js)
├── camunda-loan-worker       # Camunda External Task Worker
├── frontend-nextjs           # Ứng dụng người dùng (Next.js)
├── resources                 # File .bpmn và assets tĩnh
├── docker-compose.yml        # Định nghĩa dịch vụ toàn hệ thống
```

---

