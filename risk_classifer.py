def classify_risk(event):
    name = event.get("eventName", "")
    source_ip = event.get("sourceIPAddress", "")
    user_type = event.get("userIdentity", {}).get("type", "")
    time = event.get("eventTime", "")

    if name == "ConsoleLogin" and "IN" not in source_ip:
        return "High", "Console login from foreign IP"
    elif name == "TerminateInstances":
        return "High", "Terminating EC2 instance"
    elif name == "ListBuckets" and user_type == "AssumedRole":
        return "Medium", "Recon activity from assumed role"
    elif name == "ChangePassword" and not (9 <= int(time[11:13]) <= 18):
        return "Medium", "Password change outside business hours"
    elif name == "UnauthorizedOperation":
        return "High", "Unauthorized API call attempt"
    else:
        return "Low", "No immediate risk"
