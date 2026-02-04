# ER Diagram – Doctor Patient Management System

```mermaid
erDiagram

    USERS {
        int user_id PK
        string name
        string email
        string phone
        string password_hash
        string role
        string status
        timestamp created_at
    }

    PATIENTS {
        int patient_id PK
        int age
        string gender
        string medical_notes
    }

    DOCTORS {
        int doctor_id PK
        string specialization
        int experience_years
        float consultation_fee
        string about
        float rating
        boolean is_available
    }

    DOCTOR_AVAILABILITY {
        int availability_id PK
        int doctor_id FK
        date available_date
        time start_time
        time end_time
        boolean is_booked
    }

    APPOINTMENTS {
        int appointment_id PK
        int doctor_id FK
        int patient_id FK
        int availability_id FK
        date appointment_date
        time appointment_time
        string status
        timestamp created_at
    }

    APPOINTMENT_RESCHEDULES {
        int reschedule_id PK
        int appointment_id FK
        date old_date
        time old_time
        date new_date
        time new_time
        string reason
        timestamp rescheduled_at
    }

    PAYMENTS {
        int payment_id PK
        int appointment_id FK
        float amount
        string payment_method
        string payment_status
        timestamp transaction_date
    }

    CHATS {
        int chat_id PK
        int doctor_id FK
        int patient_id FK
        string last_message
        timestamp updated_at
    }

    CHAT_MESSAGES {
        int message_id PK
        int chat_id FK
        int sender_id FK
        string message_text
        timestamp sent_at
    }

    USERS ||--|| PATIENTS : "is"
    USERS ||--|| DOCTORS : "is"

    DOCTORS ||--o{ DOCTOR_AVAILABILITY : provides
    DOCTORS ||--o{ APPOINTMENTS : attends
    PATIENTS ||--o{ APPOINTMENTS : books
    DOCTOR_AVAILABILITY ||--|| APPOINTMENTS : schedules

    APPOINTMENTS ||--o{ APPOINTMENT_RESCHEDULES : has
    APPOINTMENTS ||--|| PAYMENTS : generates

    DOCTORS ||--o{ CHATS : participates
    PATIENTS ||--o{ CHATS : participates
    CHATS ||--o{ CHAT_MESSAGES : contains
    USERS ||--o{ CHAT_MESSAGES : sends
