# cloud-log-risk-analyzer
# Analyzes logs of cloud and catogorises the risks
# Personalized Cloud Log Risk Prioritizer

This project analyzes AWS CloudTrail logs and categorizes events as Low, Medium, or High risk — using rule-based logic and Machine Learning.

## 🚀 Features
- Parses JSON CloudTrail logs
- Applies custom rules to classify risk
- Trains ML model to predict risk
- Exports detailed risk reports

## 📂 Usage
1. Add your `cloudtrail_log.json`
2. Run `cloud_log_parser.py`
3. Optional: Run `ml_model_trainer.py`

## ⚙️ Tech Stack
- Python
- pandas, seaborn, scikit-learn
- AWS S3 + CloudTrail

## 📊 Example Output
- `risk_report.csv`: All events + risk level
- `high_risk_events.csv`: Only high-risk actions

## 👨‍💻 Author
Your Name – N Thanmai
