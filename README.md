# Email Microservice

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Usage](#usage)

## Prerequisites
- Docker

## Quickstart

### Clone the repository
```bash
git clone https://github.com/MarcoLenschau/EmailService
```

### Change Directory
```bash
cd EmailService
```

### Create .env file
```bash
cp example.env .env
```

**Important:**

Open `.env` and enter your own values.

### Build the Container
```bash
docker build -t emailservice .
```

## Usage

### Env Variables
| Variable         | Description                                              | Example Value           |
|------------------|----------------------------------------------------------|------------------------|
| PORT             | Port where the backend is accessible.                    | 3000                   |
| SMTP_HOST        | SMTP server hostname.                                    | smtp.example.com       |
| SMTP_PORT        | SMTP server port.                                        | 587                    |
| SMTP_USER        | SMTP username.                                           | user@example.com       |
| SMTP_PASS        | SMTP password.                                           | yourpassword           |
