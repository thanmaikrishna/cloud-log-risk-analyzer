# cloud-log-risk-analyzer
# Analyzes logs of cloud and catogorises the risks

# ☁️ Personalized Cloud Log Risk Categorizer using AWS CloudTrail

This project analyzes AWS CloudTrail logs and categorizes cloud events into **Low**, **Medium**, or **High** risk levels using a custom Python script. It's designed for students, researchers, and cloud security learners who want insights from their AWS logs without setting up complex infrastructure.

---

## 📌 Problem Statement

Security events in AWS environments often go unnoticed due to the complexity and volume of log data. This tool helps **simplify cloud log analysis** by highlighting events that pose potential risks based on predefined categories.

---

## 🎯 Objective

- 🔍 Parse and analyze AWS CloudTrail logs stored in S3 (`.json.gz`)
- 🛡️ Assign each event a personalized **risk level** (Low, Medium, High)
- 📊 Generate a **CSV report** showing risk details per event

---

## 📁 Features

- ✅ Supports offline analysis of logs downloaded from S3
- ✅ Customizable risk mapping for different event types
- ✅ Outputs structured risk reports for audit or review
- ✅ Beginner-friendly setup and usage

---

## 🛠️ Prerequisites

- AWS Account (for generating CloudTrail logs)
- Python 3.7+
- CloudTrail trail configured to send logs to an S3 bucket  
(You can generate test logs using EC2 or IAM activity)

---

## 👨‍💻 Author
Your Name – N Thanmai
