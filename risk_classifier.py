def classify_logs(logs, predefined_rules, custom_rules):
    results = []
    for log in logs:
        risk_level = 'Low'
        reasons = []
        # Check against predefined rules
        for rule in predefined_rules:
            if rule_match(log, rule):
                risk_level = max_risk(risk_level, rule['risk'])
                reasons.append(f"Predefined rule matched: {rule['name']}")
        # Check against custom rules
        for rule in custom_rules:
            if rule_match(log, rule):
                risk_level = max_risk(risk_level, rule['risk'])
                reasons.append(f"Custom rule matched: {rule['name']}")
        results.append({
            'log': log,
            'risk': risk_level,
            'reasons': reasons
        })
    return results

def rule_match(log, rule):
    # Simple matching based on log keys and values, extendable for complex logic
    for key, value in rule['match'].items():
        if key not in log or str(log[key]).lower() != str(value).lower():
            return False
    return True

def max_risk(current, new):
    levels = ['Low', 'Medium', 'High']
    return new if levels.index(new) > levels.index(current) else current

def classify_log_entry(entry):
    event_name = entry.get("eventName", "")
    user_type = entry.get("userIdentity", {}).get("type", "")
    
    if event_name in ["DeleteTrail", "StopLogging"]:
        return "High", "Critical AWS service manipulation"
    elif user_type == "AssumedRole":
        return "Medium", "Role-based access"
    else:
        return "Low", "Common API usage"
