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
- **Trải nghiệm Người dùng Real-time**: WebSocket cập nhật trạng thái hồ sơ.
- **Kiến trúc Microservices**: Phân tách thành các service: API Server, Worker, Frontend (Next.js), đóng gói bằng Docker.
- **CI/CD**: Dùng GitHub Actions tự động build và deploy lên Amazon ECS.

---

## 🏗️ Sơ đồ quy trình hệ thống Camunda

<img width="1344" height="473" alt="image" src="https://github.com/user-attachments/assets/9c80f26f-472e-4597-ab2c-80b3ae86e78f" />

### 🏗️ Sơ đồ Kiến trúc Hệ thống
<img width="843" height="635" alt="image" src="https://github.com/user-attachments/assets/c28f8427-a40e-4844-9345-e5cf75fec195" />

#### 🏗️ Ensemble-Based Loan Approval Prediction Pipeline

<img width="677" height="176" alt="image" src="https://github.com/user-attachments/assets/28848c41-cebb-44d7-8960-78a0663271ba" />

##### 🏗️ Hybrid Rating Calculation Using Content and Collaborative Filtering

<img width="727" height="255" alt="image" src="https://github.com/user-attachments/assets/2e299937-c045-419f-a418-0f4caf3ca8d0" />


---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend:
- Next.js (App Router)
- TypeScript
- NextAuth.js (Tích hợp Keycloak)
- Tailwind CSS, Shadcn UI

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
├── loan-process-fe           # Ứng dụng người dùng (Next.js)
├── docker-compose.yml        # Định nghĩa dịch vụ toàn hệ thống
```

---

