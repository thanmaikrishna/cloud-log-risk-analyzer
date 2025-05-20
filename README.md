# cloud-log-risk-analyzer
# Analyzes logs of cloud and catogorises the risks

# ☁️ Personalized Cloud Log Risk Categorizer using AWS CloudTrail

This project analyzes AWS CloudTrail logs and categorizes cloud events into **Low**, **Medium**, or **High** risk levels using a custom Python script. It's designed for students, researchers, and cloud security learners who want insights from their AWS logs without setting up complex infrastructure.

---

## 📌 Problem Statement

Security events in AWS environments often go unnoticed due to the complexity and volume of log data. This tool helps **simplify cloud log analysis** by highlighting events that pose potential risks based on predefined categories.

---

## 🎯 Objective


## 📁 Features



---

## 🛠️ Prerequisites

- AWS Account (for generating CloudTrail logs)
- Python 3.7+
- CloudTrail trail configured to send logs to an S3 bucket  
(You can generate test logs using EC2 or IAM activity)

---

## 🛠️ Tools & Technologies Used

This project leverages a combination of AWS services and Python libraries to build a functional and easy-to-understand CloudTrail log analyzer:

| Tool / Service       | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| **AWS CloudTrail**   | Captures and records AWS account activity as logs                       |
| **Amazon S3**        | Stores CloudTrail logs for processing                                   |
| **AWS EC2**          | Used to simulate AWS actions (e.g., start/stop instance) for testing    |
| **Python 3.x**       | Core programming language used to build the analyzer                    |
| **Pandas**           | Parses and processes logs into structured formats like CSV              |
| **Gzip**             | Decompresses `.json.gz` CloudTrail log files                            |
| **JSON Module**      | Parses log data from CloudTrail JSON files                              |
| **Boto3** *(optional)* | AWS SDK for Python – can automate log retrieval if extended            |
| **VS Code / PyCharm**| Code editor used for development                                        |
| **Git & GitHub**     | Version control and open-source project hosting     


## 👨‍💻 Author
Your Name – N Thanmai
