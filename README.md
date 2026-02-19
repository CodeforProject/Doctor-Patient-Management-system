## ER Diagram

This is the Entity-Relationship (ER) Diagram for the "Schedula - Pati" doctor appointment booking system, derived from the 25-page wireframe PDF. It includes all entities, attributes, relationships, and notes for a scalable database design (normalized to 3NF).

```mermaid
erDiagram
    %% Note: All entities, attributes, and relationships are included as per schema. Composite PKs are noted in attributes. Weak entities (e.g., Messages) are handled via dependencies.

    USERS {
        int user_id PK "auto-increment"
        varchar mobile_number UK "VARCHAR(15), unique, not null"
        timestamp created_at "default CURRENT_TIMESTAMP"
        timestamp updated_at "default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    }

    DOCTORS {
        int doctor_id PK "auto-increment"
        varchar name "VARCHAR(100), not null"
        varchar specialty "VARCHAR(100), not null"
        int experience_years "nullable"
        text awards "nullable"
        varchar google_business_link "VARCHAR(255), nullable, for review requests"
        timestamp created_at
        timestamp updated_at
    }

    SERVICES {
        int service_id PK "auto-increment"
        varchar name "VARCHAR(100), unique, not null"
    }

    DOCTOR_SERVICES {
        int doctor_id FK "to Doctors.doctor_id, part of composite PK"
        int service_id FK "to Services.service_id, part of composite PK"
    }

    DOCTOR_AVAILABILITIES {
        int availability_id PK "auto-increment"
        int doctor_id FK "to Doctors.doctor_id, not null"
        enum day_of_week "ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), not null"
        time start_time "not null"
        time end_time "not null"
        timestamp created_at
        timestamp updated_at
    }

    FAMILY_MEMBERS {
        int family_member_id PK "auto-increment"
        int user_id FK "to Users.user_id, not null"
        varchar name "VARCHAR(100), not null"
        int age "nullable"
        enum sex "ENUM('Male', 'Female', 'Other'), nullable"
        decimal weight "DECIMAL(5,2), nullable, in kg"
        varchar relation "VARCHAR(50), nullable, e.g., 'Self', 'Wife', 'Son'"
        timestamp created_at
        timestamp updated_at
    }

    APPOINTMENTS {
        int appointment_id PK "auto-increment"
        int user_id FK "to Users.user_id, not null"
        int family_member_id FK "to Family_Members.family_member_id, nullable; null if ad-hoc or self without profile"
        int doctor_id FK "to Doctors.doctor_id, not null"
        date appointment_date "not null"
        time appointment_time "not null"
        varchar token "VARCHAR(50), nullable, e.g., '#47'"
        enum consulting_type "ENUM('Regular', 'Online'), not null"
        enum visit_type "ENUM('FirstTime', 'Report', 'FollowUp', 'Family'), not null"
        enum status "ENUM('Scheduled', 'Waiting', 'Consulted', 'Cancelled', 'Rescheduled', 'UnableToMeet'), not null, default 'Scheduled'"
        varchar complaint "VARCHAR(255), nullable, e.g., 'Stomach Pain'"
        varchar ivr_app_id "VARCHAR(50), nullable, for phone integration"
        int patients_ahead "default 0, for live tracking"
        time expected_time "nullable"
        timestamp created_at
        timestamp updated_at
    }
    %% Note for Appointments: If family_member_id is null, use embedded patient details from wireframes (name, age, sex, weight in Appointments, but to avoid redundancy, prefer linking to Family_Members where possible. Added complaint here as it's per-appointment.

    PAYMENTS {
        int payment_id PK "auto-increment"
        int appointment_id FK "to Appointments.appointment_id, not null, unique for 1:1"
        decimal amount "DECIMAL(10,2), not null"
        enum status "ENUM('Paid', 'Pending'), not null, default 'Pending'"
        timestamp paid_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    FEEDBACKS {
        int feedback_id PK "auto-increment"
        int appointment_id FK "to Appointments.appointment_id, not null, unique for 1:1"
        int consulting_rating "INT (1-5), not null"
        int hospital_rating "INT (1-5), not null"
        int waiting_rating "INT (1-5), not null"
        text comments "nullable"
        timestamp created_at
        timestamp updated_at
    }

    MESSAGES {
        int message_id PK "auto-increment"
        int appointment_id FK "to Appointments.appointment_id, not null"
        enum sender_type "ENUM('Patient', 'Doctor'), not null"
        text message_text "not null"
        timestamp sent_at "default CURRENT_TIMESTAMP"
    }
    %% Note: Messages is a weak entity depending on Appointments.

    REMINDERS {
        int reminder_id PK "auto-increment"
        int appointment_id FK "to Appointments.appointment_id, not null"
        enum reminder_type "ENUM('Upcoming', 'Reengagement', 'FollowUp'), not null"
        text message "not null"
        timestamp sent_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    SUPPORT_TICKETS {
        int ticket_id PK "auto-increment"
        int user_id FK "to Users.user_id, not null"
        varchar title "VARCHAR(100), not null"
        text description "not null"
        enum status "ENUM('Open', 'Resolved'), not null, default 'Open'"
        timestamp created_at
        timestamp updated_at
    }

    GROUPS {
        int group_id PK "auto-increment"
        varchar name "VARCHAR(100), not null, e.g., 'New Mothers'"
        text description "nullable"
        timestamp created_at
        timestamp updated_at
    }

    GROUP_MEMBERS {
        int user_id FK "to Users.user_id, part of composite PK"
        int group_id FK "to Groups.group_id, part of composite PK"
        timestamp joined_at
    }

    USERS ||--o{ FAMILY_MEMBERS : "has"
    %% (1:N; a user can have multiple family members)

    USERS ||--o{ APPOINTMENTS : "books"
    %% (1:N)

    USERS ||--o{ SUPPORT_TICKETS : "creates"
    %% (1:N)

    USERS }o--o{ GROUPS : "joins"
    %% (M:N via Group_Members)

    DOCTORS ||--o{ DOCTOR_AVAILABILITIES : "has"
    %% (1:N)

    DOCTORS ||--o{ APPOINTMENTS : "conducts"
    %% (1:N)

    DOCTORS }|--|{ SERVICES : "offers"
    %% (M:N via Doctor_Services)

    APPOINTMENTS ||--o| PAYMENTS : "requires"
    %% (1:1, optional)

    APPOINTMENTS ||--o| FEEDBACKS : "receives"
    %% (1:1, optional)

    APPOINTMENTS ||--o{ MESSAGES : "includes"
    %% (1:N)

    APPOINTMENTS ||--o{ REMINDERS : "triggers"
    %% (1:N)

    FAMILY_MEMBERS ||--o{ APPOINTMENTS : "for"
    %% (1:N; an appointment can be for a family member)

    DOCTORS ||--|{ DOCTOR_SERVICES : ""
    SERVICES ||--|{ DOCTOR_SERVICES : ""

    USERS ||--|{ GROUP_MEMBERS : ""
    GROUPS ||--|{ GROUP_MEMBERS : ""